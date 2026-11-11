import type {
  BatchSession, DayTemplate, Eater, FreeMeal, ISODate, IngredientRole, Macros, MealSlot, PlannedMeal, Recipe,
  RecipeRating, Reminder, SlotTarget, WeekPlan,
} from '../domain';
import { getIngredient, type IngredientIndex } from '../nutrition/macros';
import { adaptRecipe } from '../recipes/adapt';
import { isRecipeAllowed } from '../recipes/exclusions';
import { portionFor } from '../recipes/portions';
import { buildShoppingList } from '../shopping/list';
import { EXCLUDED_INGREDIENT_KEYWORDS } from '../seed/reference';
import { toGrams } from '../units';
import { addDays, daysBetween, formatDayShort, weekday } from '../dates';

/**
 * Planificateur de semaine (§5), organisation validée le 11/11/2026 :
 * - semaine = du dimanche des courses (J0) au samedi (J6) ;
 * - midis du lundi au vendredi = batch, pour l'utilisateur seul :
 *   batch A cuisiné le dimanche (lundi → mercredi), batch B le mercredi soir (jeudi, vendredi) ; riz cuit ≤ 3 jours ;
 * - dîners frais tous les soirs et samedi midi, à deux quand la compagne est là ;
 * - dimanche midi = repas libre ;
 * - dîners ≤ 30 min en semaine, ≤ 20 min le mercredi (soir de batch) ;
 * - au plus 2 nouvelles recettes « à tester » par semaine pour la compagne, chaque recette au plus 2 fois.
 */
export interface PlannerOptions {
  /** Dimanche des courses. */
  startDate: ISODate;
  recipes: readonly Recipe[];
  index: IngredientIndex;
  ratings: readonly RecipeRating[];
  /** Jours où la compagne mange avec l'utilisateur (dîner, et samedi midi). Saisis par l'utilisateur. */
  partnerDates: readonly ISODate[];
  dayTemplate: DayTemplate;
  kcalFloor: number;
  pantryInStock?: ReadonlySet<string>;
  /** Courses ratées le dimanche matin, faites le lundi soir. */
  lateShopping?: boolean;
  breakfastRecipeId?: string;
  snackRecipeId?: string;
  /** Solution de dépannage du lundi midi si les courses sont décalées. */
  fallbackLunchRecipeId?: string;
  excludedKeywords?: readonly string[];
  maxWeekdayMinutes?: number;
  maxBatchEveningMinutes?: number;
  maxPartnerTestsPerWeek?: number;
  maxRepeatsPerRecipe?: number;
}


/** Poids du gaspillage selon le rayon : le frais compte, le surgelé et l'épicerie se gardent. */
const WASTE_WEIGHT: Record<string, number> = { volaille_boucherie: 1, fruits_legumes: 1, cremerie: 1 };
/** Une recette déjà mangée dans la semaine (batch compris) coûte `perOccurrence` par occurrence : la monotonie fait lâcher la diète. */
const PENALTY = { sameAsLunchThatDay: 150, perOccurrence: 120, overTestCap: 1000 };
/** Nombre maximal de fois où l'utilisateur mange le même plat dans la semaine, batch compris. */
const MAX_WEEKLY_OCCURRENCES = 4;

interface FreshSlot { date: ISODate; slot: MealSlot; maxMinutes: number; weekend: boolean; partner: boolean }
interface Adapted { factors: Partial<Record<IngredientRole, number>>; macros: Macros }

export function planWeek(o: PlannerOptions): WeekPlan {
  const start = o.startDate;
  if (weekday(start) !== 0) throw new Error(`La semaine commence le dimanche des courses : ${start} n'est pas un dimanche.`);

  const cfg = {
    breakfast: o.breakfastRecipeId ?? 'banane-shaker-whey',
    snack: o.snackRecipeId ?? 'collation-skyr-whey',
    fallback: o.fallbackLunchRecipeId ?? 'onigiri-thon-mayo',
    excluded: o.excludedKeywords ?? EXCLUDED_INGREDIENT_KEYWORDS,
    weekdayMinutes: o.maxWeekdayMinutes ?? 30,
    batchEveningMinutes: o.maxBatchEveningMinutes ?? 20,
    testCap: o.maxPartnerTestsPerWeek ?? 2,
    repeatCap: o.maxRepeatsPerRecipe ?? 2,
  };
  const byId = new Map(o.recipes.map((r) => [r.id, r]));
  const recipe = (id: string) => {
    const r = byId.get(id);
    if (!r) throw new Error(`Recette inconnue : ${id}`);
    return r;
  };
  const rating = new Map(o.ratings.map((r) => [r.recipeId, r]));
  const partnerDates = new Set(o.partnerDates);
  const dates = Array.from({ length: 7 }, (_, i) => addDays(start, i));
  const [d0, d1, d2, d3, d4, d5, d6] = dates as [ISODate, ISODate, ISODate, ISODate, ISODate, ISODate, ISODate];
  const shoppingDate = o.lateShopping ? d1 : d0;
  const target = (slot: MealSlot): SlotTarget | undefined => o.dayTemplate.slots.find((s) => s.slot === slot);
  const warnings: string[] = [];

  // Réajustement de la portion de l'utilisateur à la cible du créneau (mis en cache).
  const adaptCache = new Map<string, Adapted>();
  const adapted = (r: Recipe, slot: MealSlot): Adapted => {
    const key = `${r.id}|${slot}`;
    const cached = adaptCache.get(key);
    if (cached) return cached;
    const t = target(slot);
    const res = t
      ? adaptRecipe('reajuster', { recipe: r, index: o.index, target: t })
      : adaptRecipe('reajuster', { recipe: r, index: o.index, target: { slot, kcal: 1, protein: 1 } });
    const value = t ? { factors: res.roleFactors, macros: res.after } : { factors: {}, macros: res.before };
    adaptCache.set(key, value);
    return value;
  };
  const meal = (date: ISODate, slot: MealSlot, r: Recipe, eaters: Eater[], kind: PlannedMeal['kind'], cookDate?: ISODate, habit = false): PlannedMeal => {
    // Petit-déjeuner et collation sont des habitudes : on ne les réajuste pas (pas de « 1,05 banane »).
    const a = habit ? { factors: {}, macros: adaptRecipe('reajuster', { recipe: r, index: o.index, target: { slot, kcal: 1, protein: 1 } }).before } : adapted(r, slot);
    return { date, slot, recipeId: r.id, eaters, kind, ...(cookDate ? { cookDate } : {}), userRoleFactors: a.factors, userMacros: a.macros };
  };

  // ── Repas fixes : petit-déjeuner et collation, tous les jours, pour l'utilisateur.
  const fixed: PlannedMeal[] = [];
  for (const d of dates) {
    if (target('petit_dej')) fixed.push(meal(d, 'petit_dej', recipe(cfg.breakfast), ['user'], 'frais', undefined, true));
    if (target('collation')) fixed.push(meal(d, 'collation', recipe(cfg.snack), ['user'], 'frais', undefined, true));
  }

  // ── Repas libres et dépannage.
  const freeMeals: FreeMeal[] = [{ date: d0, slot: 'dejeuner' }];
  if (o.lateShopping) {
    freeMeals.push({ date: d0, slot: 'diner' });
    fixed.push(meal(d1, 'dejeuner', recipe(cfg.fallback), ['user'], 'depannage'));
    warnings.push(`Courses décalées au lundi : lundi midi en dépannage (${recipe(cfg.fallback).name}), batch A cuisiné lundi soir pour mardi et mercredi, dimanche soir libre.`);
  }

  // ── Créneaux frais.
  const fresh: FreshSlot[] = [];
  const pushFresh = (date: ISODate, slot: MealSlot, maxMinutes: number, weekend = false) =>
    fresh.push({ date, slot, maxMinutes, weekend, partner: partnerDates.has(date) });
  if (!o.lateShopping) pushFresh(d0, 'diner', cfg.weekdayMinutes);
  pushFresh(d1, 'diner', cfg.weekdayMinutes);
  pushFresh(d2, 'diner', cfg.weekdayMinutes);
  pushFresh(d3, 'diner', cfg.batchEveningMinutes);
  pushFresh(d4, 'diner', cfg.weekdayMinutes);
  pushFresh(d5, 'diner', cfg.weekdayMinutes);
  pushFresh(d6, 'dejeuner', Infinity, true);
  pushFresh(d6, 'diner', Infinity, true);

  // ── Candidats.
  const allowed = (r: Recipe) => r.tags.includes('diete') && isRecipeAllowed(r, o.index, cfg.excluded);
  const batchPool = o.recipes.filter((r) => allowed(r) && r.mode === 'batch' && r.slots.includes('dejeuner'));
  const freshPool = o.recipes.filter((r) => allowed(r) && r.slots.includes('diner'));
  if (batchPool.length < 2) throw new Error('Il faut au moins 2 recettes batch pour planifier la semaine.');

  const batchA = o.lateShopping ? { cook: d1, covers: [d2, d3] } : { cook: d0, covers: [d1, d2, d3] };
  const batchB = { cook: d3, covers: [d4, d5] };

  const wasteOf = (meals: readonly PlannedMeal[]): number =>
    buildShoppingList({ meals, recipes: byId, index: o.index, ...(o.pantryInStock ? { pantryInStock: o.pantryInStock } : {}) })
      .reduce((sum, item) => {
        const ing = getIngredient(o.index, item.ingredientId);
        if (ing.pantry) return sum;
        const grams = toGrams({ value: item.leftover, unit: item.unit }, ing);
        return sum + grams * (WASTE_WEIGHT[item.aisle] ?? 0.1);
      }, 0);

  interface Candidate { meals: PlannedMeal[]; cost: number; tests: string[]; overflow: string[]; sessions: BatchSession[] }
  let best: Candidate | null = null;

  for (const a of batchPool) {
    for (const b of batchPool) {
      if (a.id === b.id) continue;
      const meals: PlannedMeal[] = [...fixed];
      for (const d of batchA.covers) meals.push(meal(d, 'dejeuner', a, ['user'], 'batch', batchA.cook));
      for (const d of batchB.covers) meals.push(meal(d, 'dejeuner', b, ['user'], 'batch', batchB.cook));
      const lunchOn = new Map(meals.filter((m) => m.slot === 'dejeuner').map((m) => [m.date, m.recipeId]));

      const counts = new Map<string, number>(); // repas frais
      const occurrences = new Map<string, number>(); // tous les repas de l'utilisateur (batch compris)
      for (const id of [...batchA.covers.map(() => a.id), ...batchB.covers.map(() => b.id)]) occurrences.set(id, (occurrences.get(id) ?? 0) + 1);
      const tests: string[] = [];
      const overflow: string[] = [];
      let penalties = 0;
      let previous: string | null = null;
      let feasible = true;

      for (const slot of fresh) {
        const options = freshPool.filter((r) => {
          if (r.minutes > slot.maxMinutes) return false;
          if (r.mode === 'week_end' && !slot.weekend) return false;
          if (r.needsDayOldRice && slot.date === dates[0]) return false;
          if ((counts.get(r.id) ?? 0) >= cfg.repeatCap) return false;
          if ((occurrences.get(r.id) ?? 0) >= MAX_WEEKLY_OCCURRENCES) return false;
          if (r.id === previous) return false; // jamais deux repas frais d'affilée identiques
          if (slot.partner && rating.get(r.id)?.partnerVerdict === 'non') return false;
          return true;
        });
        // Paliers de préférence : quand la compagne est là, d'abord ses plats validés,
        // puis les plats déjà testés cette semaine, puis de nouveaux tests dans la limite du plafond.
        const tier = (r: Recipe): number => {
          if (!slot.partner) return rating.get(r.id)?.userLiked === false ? 1 : 0;
          const v = rating.get(r.id)?.partnerVerdict ?? 'a_tester';
          if (v === 'oui') return 0;
          if (tests.includes(r.id)) return 1;
          return tests.length < cfg.testCap ? 2 : 3;
        };
        const localPenalty = (r: Recipe) =>
          (lunchOn.get(slot.date) === r.id ? PENALTY.sameAsLunchThatDay : 0) +
          (occurrences.get(r.id) ?? 0) * PENALTY.perOccurrence;

        let chosen: { r: Recipe; cost: number; tier: number } | null = null;
        for (const r of options) {
          const t = tier(r);
          if (chosen && t > chosen.tier) continue;
          const eaters: Eater[] = slot.partner ? ['user', 'partner'] : ['user'];
          const cost = wasteOf([...meals, meal(slot.date, slot.slot, r, eaters, 'frais')]) + localPenalty(r);
          if (!chosen || t < chosen.tier || cost < chosen.cost - 1e-9) chosen = { r, cost, tier: t };
        }
        if (!chosen) { feasible = false; break; }

        const r = chosen.r;
        meals.push(meal(slot.date, slot.slot, r, slot.partner ? ['user', 'partner'] : ['user'], 'frais'));
        penalties += localPenalty(r);
        counts.set(r.id, (counts.get(r.id) ?? 0) + 1);
        occurrences.set(r.id, (occurrences.get(r.id) ?? 0) + 1);
        if (slot.partner && (rating.get(r.id)?.partnerVerdict ?? 'a_tester') === 'a_tester' && !tests.includes(r.id)) {
          tests.push(r.id);
          if (chosen.tier === 3) { overflow.push(r.id); penalties += PENALTY.overTestCap; }
        }
        previous = r.id;
      }
      if (!feasible) continue;

      const cost = wasteOf(meals) + penalties;
      if (!best || cost < best.cost - 1e-9) {
        best = {
          meals, cost, tests, overflow,
          sessions: [
            { date: batchA.cook, recipeId: a.id, servings: batchA.covers.length, covers: batchA.covers },
            { date: batchB.cook, recipeId: b.id, servings: batchB.covers.length, covers: batchB.covers },
          ],
        };
      }
    }
  }
  if (!best) throw new Error('Aucun planning possible avec ces contraintes (temps, exclusions, notes de la compagne).');

  const meals = best.meals.sort((x, y) => x.date.localeCompare(y.date) || slotOrder(x.slot) - slotOrder(y.slot));
  if (best.overflow.length > 0) {
    warnings.push(`Plafond de ${cfg.testCap} recettes à tester dépassé (${best.overflow.map((id) => recipe(id).name).join(', ')}) : pas assez de plats validés par ta compagne pour couvrir la semaine.`);
  }

  // ── Monotonie (§5.8) : au moins 3 plats différents sur les 10 repas de la semaine de travail.
  const workweek = meals.filter((m) => [d1, d2, d3, d4, d5].includes(m.date) && (m.slot === 'dejeuner' || m.slot === 'diner'));
  if (new Set(workweek.map((m) => m.recipeId)).size < 3) warnings.push('Moins de 3 plats différents sur la semaine de travail.');

  // ── Rappels.
  const reminders: Reminder[] = [];
  for (const s of best.sessions) {
    const r = recipe(s.recipeId);
    const rice = portionLines(r, 'user', o.index, adapted(r, 'dejeuner').factors).filter((l) => isWeighedStarch(l.ingredientId));
    const riceText = rice.length ? ` ; à peser cru : ${rice.map((l) => `${Math.round(l.grams * s.servings)} g de ${getIngredient(o.index, l.ingredientId).name.toLowerCase()}`).join(', ')}` : '';
    reminders.push({ date: s.date, kind: 'batch', text: `Batch : ${r.name} × ${s.servings} portions (midis : ${s.covers.map(formatDayShort).join(', ')})${riceText}.` });
  }
  reminders.push(...meatReminders(meals, recipe, o.index, shoppingDate));
  for (const m of meals) {
    const r = recipe(m.recipeId);
    if (!r.needsDayOldRice) continue;
    const grams = m.eaters.reduce((sum, e) => sum + portionLines(r, e, o.index, m.userRoleFactors).filter((l) => isWeighedStarch(l.ingredientId)).reduce((s, l) => s + l.grams, 0), 0);
    reminders.push({ date: addDays(m.date, -1), kind: 'cuire_riz_veille', text: `Cuire ${Math.round(grams)} g de riz cru en plus ce soir pour le ${r.name.toLowerCase()} de demain.` });
  }
  reminders.sort((x, y) => x.date.localeCompare(y.date));

  // ── kcal par jour et plancher.
  const dailyKcal: Record<ISODate, number> = {};
  for (const d of dates) dailyKcal[d] = Math.round(meals.filter((m) => m.date === d).reduce((s, m) => s + (m.userMacros?.kcal ?? 0), 0));
  for (const d of dates) {
    if (freeMeals.some((f) => f.date === d)) continue;
    if ((dailyKcal[d] ?? 0) < o.kcalFloor) warnings.push(`${d} : ${dailyKcal[d]} kcal planifiées, sous le plancher de ${o.kcalFloor} kcal.`);
  }

  const shoppingList = buildShoppingList({
    meals, recipes: byId, index: o.index, purchaseDate: shoppingDate, ...(o.pantryInStock ? { pantryInStock: o.pantryInStock } : {}),
  });

  return { startDate: start, dates, meals, freeMeals, batchSessions: best.sessions, reminders, shoppingList, dailyKcal, partnerTests: best.tests, warnings };
}

/** Riz et nouilles : pesés crus pour le batch (§5.7). */
const isWeighedStarch = (id: string) => id.startsWith('riz-') || id.startsWith('nouilles');

const SLOT_ORDER: MealSlot[] = ['petit_dej', 'dejeuner', 'collation', 'diner'];
const slotOrder = (s: MealSlot) => SLOT_ORDER.indexOf(s);

function portionLines(r: Recipe, eater: Eater, index: IngredientIndex, factors?: Partial<Record<IngredientRole, number>>) {
  return portionFor(r, eater, index, factors);
}

/** §5.4 : viande cuisinée à partir de J+3 après les courses → congeler à l'achat, sortir la veille au soir. */
function meatReminders(meals: readonly PlannedMeal[], recipe: (id: string) => Recipe, index: IngredientIndex, shoppingDate: ISODate): Reminder[] {
  const byCook = new Map<string, number>(); // `${cookDate}|${ingredientId}` → g
  for (const m of meals) {
    const cook = m.cookDate ?? m.date;
    if (daysBetween(shoppingDate, cook) < 3) continue;
    for (const e of m.eaters) {
      for (const l of portionFor(recipe(m.recipeId), e, index, m.userRoleFactors)) {
        const ing = getIngredient(index, l.ingredientId);
        if (l.role !== 'meat' || !ing.freezable) continue;
        const key = `${cook}|${ing.id}`;
        byCook.set(key, (byCook.get(key) ?? 0) + l.grams);
      }
    }
  }
  const out: Reminder[] = [];
  const toFreeze = new Map<string, number>();
  for (const [key, grams] of byCook) {
    const [cook, id] = key.split('|') as [ISODate, string];
    const name = getIngredient(index, id).name.toLowerCase();
    out.push({ date: addDays(cook, -1), kind: 'decongeler', text: `Sortir ${Math.round(grams)} g de ${name} du congélateur ce soir (cuisson demain).` });
    toFreeze.set(id, (toFreeze.get(id) ?? 0) + grams);
  }
  for (const [id, grams] of toFreeze) {
    out.push({ date: shoppingDate, kind: 'congeler', text: `Congeler ${Math.round(grams)} g de ${getIngredient(index, id).name.toLowerCase()} dès le retour des courses.` });
  }
  return out;
}

