import type {
  AdaptationMode, AdaptationResult, AdaptedLine, DayTemplate, IngredientRole, Macros, Recipe, SlotTarget, Substitution,
} from '../domain';
import { getIngredient, macrosForGrams, sumMacros, type IngredientIndex } from '../nutrition/macros';
import { round } from '../units';
import { portionFor } from './portions';

/** Bornes des facteurs par rôle : au-delà, le plat n'est plus reconnaissable. `other` reste fixe. */
export const ROLE_BOUNDS: Record<IngredientRole, [number, number]> = {
  meat: [0.8, 1.6],
  protein_other: [0.8, 1.6],
  starch: [0.5, 1.3],
  vegetable: [0.8, 2],
  sauce: [0.5, 1],
  fat: [0.3, 1],
  sweet: [0.5, 1],
  other: [1, 1],
};

const STEP = 0.05;
const STABILITY_WEIGHT = 0.02;
/** Retrait maximal sur un autre créneau quand on compense (30 %). */
const MAX_COMPENSATION_SHARE = 0.3;
/** kcal pour 1 g de riz cru : sert à traduire un retrait de kcal en féculents. */
const KCAL_PER_G_RAW_RICE = 3.55;

export interface AdaptOptions {
  recipe: Recipe;
  index: IngredientIndex;
  /** Cible du créneau où le plat est mangé. */
  target: SlotTarget;
  substitutions?: readonly Substitution[];
  /** Nécessaire pour « compenser ». */
  dayTemplate?: DayTemplate;
  kcalFloor?: number;
}

interface WorkLine { ingredientId: string; role: IngredientRole; grams: number }

function macrosOf(lines: readonly WorkLine[], index: IngredientIndex, factors: Partial<Record<IngredientRole, number>> = {}): Macros {
  return sumMacros(lines.map((l) => macrosForGrams(getIngredient(index, l.ingredientId), l.grams * (factors[l.role] ?? 1))));
}

function roundMacros(m: Macros): Macros {
  return { kcal: Math.round(m.kcal), protein: round(m.protein), fat: round(m.fat), carbs: round(m.carbs) };
}

function gapWarnings(after: Macros, target: SlotTarget): string[] {
  const w: string[] = [];
  const kcalGap = after.kcal - target.kcal;
  if (Math.abs(kcalGap) > target.kcal * 0.1) {
    w.push(`Écart restant de ${kcalGap > 0 ? '+' : ''}${Math.round(kcalGap)} kcal par rapport à la cible (${target.kcal} kcal).`);
  }
  if (after.protein < target.protein * 0.9) {
    w.push(`Protéines sous la cible : ${round(after.protein)} g pour ${target.protein} g visés.`);
  }
  return w;
}

function toAdapted(lines: readonly WorkLine[], factors: Partial<Record<IngredientRole, number>>): AdaptedLine[] {
  return lines.map((l) => {
    const factor = factors[l.role] ?? 1;
    return { ingredientId: l.ingredientId, role: l.role, factor, grams: round(l.grams * factor, 0) };
  });
}

function reajuster(lines: WorkLine[], o: AdaptOptions): Pick<AdaptationResult, 'lines' | 'roleFactors' | 'after'> {
  const { target, index } = o;
  const roles = [...new Set(lines.map((l) => l.role))].filter((r) => ROLE_BOUNDS[r][0] !== ROLE_BOUNDS[r][1]);
  const factors: Partial<Record<IngredientRole, number>> = Object.fromEntries(roles.map((r) => [r, 1]));

  const cost = (f: Partial<Record<IngredientRole, number>>) => {
    const m = macrosOf(lines, index, f);
    const kcalErr = (m.kcal - target.kcal) / target.kcal;
    const protErr = Math.max(0, target.protein - m.protein) / target.protein;
    const stability = roles.reduce((s, r) => s + ((f[r] ?? 1) - 1) ** 2, 0);
    return kcalErr ** 2 + protErr ** 2 + STABILITY_WEIGHT * stability;
  };

  // Descente coordonnée déterministe sur une grille de pas 0,05.
  for (let iter = 0; iter < 50; iter++) {
    let changed = false;
    for (const role of roles) {
      const [lo, hi] = ROLE_BOUNDS[role];
      let best = factors[role] ?? 1;
      let bestCost = cost(factors);
      for (let v = lo; v <= hi + 1e-9; v += STEP) {
        const candidate = round(v, 2);
        const c = cost({ ...factors, [role]: candidate });
        if (c < bestCost - 1e-12) { bestCost = c; best = candidate; }
      }
      if (best !== factors[role]) { factors[role] = best; changed = true; }
    }
    if (!changed) break;
  }
  return { lines: toAdapted(lines, factors), roleFactors: factors, after: macrosOf(lines, index, factors) };
}

function alleger(lines: WorkLine[], o: AdaptOptions): { lines: WorkLine[]; applied: string[]; notes: string[] } {
  const subs = (o.substitutions ?? []).filter((s) => s.kind === 'allegement');
  const out = new Map<string, WorkLine>();
  const applied: string[] = [];
  const notes: string[] = [];
  const add = (l: WorkLine) => {
    const prev = out.get(l.ingredientId);
    out.set(l.ingredientId, prev ? { ...prev, grams: prev.grams + l.grams } : l);
  };
  for (const line of lines) {
    const sub = subs.find((s) => s.from === line.ingredientId);
    if (!sub) { add(line); continue; }
    applied.push(sub.label);
    if (sub.technique) notes.push(sub.technique);
    for (const t of sub.to) {
      const role = t.ingredientId === line.ingredientId ? line.role : getIngredient(o.index, t.ingredientId).role;
      add({ ingredientId: t.ingredientId, role, grams: line.grams * t.ratio });
    }
  }
  return { lines: [...out.values()], applied, notes };
}

/**
 * Adapte un plat aux macros d'un créneau selon le mode choisi par l'utilisateur.
 * - réajuster : modifie les quantités par rôle, dans des bornes qui gardent le plat reconnaissable ;
 * - alléger : applique les substitutions d'allègement ;
 * - compenser : garde le plat et réduit les autres créneaux de la journée.
 */
export function adaptRecipe(mode: AdaptationMode, o: AdaptOptions): AdaptationResult {
  const base: WorkLine[] = portionFor(o.recipe, 'user', o.index);
  const before = macrosOf(base, o.index);
  const common = { mode, recipeId: o.recipe.id, target: o.target, before: roundMacros(before) };

  if (mode === 'reajuster') {
    const r = reajuster(base, o);
    return { ...common, lines: r.lines, roleFactors: r.roleFactors, after: roundMacros(r.after), appliedSubstitutions: [], notes: [], warnings: gapWarnings(r.after, o.target) };
  }

  if (mode === 'alleger') {
    const r = alleger(base, o);
    const after = macrosOf(r.lines, o.index);
    const warnings = r.applied.length === 0 ? ["Aucune substitution d'allègement connue pour ce plat."] : [];
    return { ...common, lines: toAdapted(r.lines, {}), roleFactors: {}, after: roundMacros(after), appliedSubstitutions: r.applied, notes: r.notes, warnings: [...warnings, ...gapWarnings(after, o.target)] };
  }

  // compenser
  if (!o.dayTemplate) throw new Error('Le mode « compenser » demande un modèle de journée.');
  const others = o.dayTemplate.slots.filter((s) => s.slot !== o.target.slot);
  const excess = before.kcal - o.target.kcal;
  const warnings: string[] = [];
  const notes: string[] = [];
  let otherSlots = others.map((s) => ({ ...s }));

  if (excess > 0) {
    const pool = others.reduce((sum, s) => sum + s.kcal, 0);
    const maxRemovable = pool * MAX_COMPENSATION_SHARE;
    const removed = Math.min(excess, maxRemovable);
    otherSlots = others.map((s) => {
      const cut = removed * (s.kcal / pool);
      if (cut > 0) notes.push(`${s.slot} : −${Math.round(cut)} kcal, soit environ ${Math.round(cut / KCAL_PER_G_RAW_RICE)} g de riz cru en moins.`);
      return { ...s, kcal: Math.round(s.kcal - cut) };
    });
    if (excess > maxRemovable) {
      warnings.push(`Impossible de tout compenser sur la journée : dépassement restant de ${Math.round(excess - maxRemovable)} kcal.`);
    }
  }
  const dayTotal = otherSlots.reduce((s, x) => s + x.kcal, 0) + before.kcal;
  const floor = o.kcalFloor ?? 0;
  if (dayTotal < floor) warnings.push(`Journée à ${Math.round(dayTotal)} kcal, sous le plancher de ${floor} kcal.`);
  const otherProtein = otherSlots.reduce((s, x) => s + x.protein, 0);
  if (before.protein < o.target.protein * 0.9) {
    warnings.push(`Ce plat apporte ${round(before.protein)} g de protéines pour ${o.target.protein} g visés : la journée finira à environ ${Math.round(otherProtein + before.protein)} g.`);
  }

  return { ...common, lines: toAdapted(base, {}), roleFactors: {}, after: roundMacros(before), appliedSubstitutions: [], otherSlots, notes, warnings };
}
