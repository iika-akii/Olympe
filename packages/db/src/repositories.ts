import {
  DEFAULT_DAY_TEMPLATE_ID, DEFAULT_GOAL_KG, SEED_RATINGS,
  type DailyHealth, type ISODate, type PartnerMeal, type PartnerVerdict, type RecipeRating, type WeekPlan, type WeighIn,
} from '@olympe/core';
import type { SqlDriver } from './driver';

// ───────── Réglages
export function settingsRepo(db: SqlDriver) {
  const get = (key: string): string | null => db.all<{ value: string }>('SELECT value FROM settings WHERE key = ?', [key])[0]?.value ?? null;
  const set = (key: string, value: string) => db.run('INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value', [key, value]);
  return {
    getDayTemplateId: (): string => get('day_template_id') ?? DEFAULT_DAY_TEMPLATE_ID,
    setDayTemplateId: (id: string) => set('day_template_id', id),
    getGoalKg: (): number => Number(get('goal_kg') ?? DEFAULT_GOAL_KG),
    setGoalKg: (kg: number) => set('goal_kg', String(kg)),
  };
}

// ───────── Repas que la compagne prend avec l'utilisateur
export function partnerRepo(db: SqlDriver) {
  return {
    listBetween: (from: ISODate, to: ISODate): PartnerMeal[] =>
      db.all<PartnerMeal>('SELECT date, slot FROM partner_meals WHERE date >= ? AND date <= ? ORDER BY date, slot', [from, to]),
    setPresent: (date: ISODate, slot: PartnerMeal['slot'], present: boolean) => {
      if (present) db.run('INSERT OR IGNORE INTO partner_meals (date, slot) VALUES (?, ?)', [date, slot]);
      else db.run('DELETE FROM partner_meals WHERE date = ? AND slot = ?', [date, slot]);
    },
  };
}

// ───────── Pesées du matin
export function weighInsRepo(db: SqlDriver) {
  return {
    all: (): WeighIn[] => db.all<WeighIn>('SELECT date, kg FROM weigh_ins ORDER BY date'),
    get: (date: ISODate): WeighIn | null => db.all<WeighIn>('SELECT date, kg FROM weigh_ins WHERE date = ?', [date])[0] ?? null,
    set: (w: WeighIn) => db.run('INSERT INTO weigh_ins (date, kg) VALUES (?, ?) ON CONFLICT(date) DO UPDATE SET kg = excluded.kg', [w.date, w.kg]),
    remove: (date: ISODate) => db.run('DELETE FROM weigh_ins WHERE date = ?', [date]),
  };
}

// ───────── Activité du jour (pas, dépense du bracelet)
interface HealthRow { date: string; steps: number | null; expenditure_kcal: number | null; sleep_minutes: number | null; source: DailyHealth['source'] }
const healthFromRow = (r: HealthRow): DailyHealth => ({
  date: r.date,
  source: r.source,
  ...(r.steps === null ? {} : { steps: r.steps }),
  ...(r.expenditure_kcal === null ? {} : { expenditureKcal: r.expenditure_kcal }),
  ...(r.sleep_minutes === null ? {} : { sleepMinutes: r.sleep_minutes }),
});

export function healthRepo(db: SqlDriver) {
  const get = (date: ISODate): DailyHealth | null => {
    const row = db.all<HealthRow>('SELECT * FROM daily_health WHERE date = ?', [date])[0];
    return row ? healthFromRow(row) : null;
  };
  return {
    get,
    listBetween: (from: ISODate, to: ISODate): DailyHealth[] =>
      db.all<HealthRow>('SELECT * FROM daily_health WHERE date >= ? AND date <= ? ORDER BY date', [from, to]).map(healthFromRow),
    /** Remplace la ligne du jour. Une ligne sans aucune valeur est supprimée. */
    set: (h: DailyHealth) => {
      if (h.steps === undefined && h.expenditureKcal === undefined && h.sleepMinutes === undefined) {
        db.run('DELETE FROM daily_health WHERE date = ?', [h.date]);
        return;
      }
      db.run(
        `INSERT INTO daily_health (date, steps, expenditure_kcal, sleep_minutes, source) VALUES (?, ?, ?, ?, ?)
         ON CONFLICT(date) DO UPDATE SET steps = excluded.steps, expenditure_kcal = excluded.expenditure_kcal,
           sleep_minutes = excluded.sleep_minutes, source = excluded.source`,
        [h.date, h.steps ?? null, h.expenditureKcal ?? null, h.sleepMinutes ?? null, h.source],
      );
    },
  };
}

// ───────── Notes des recettes (seed + modifications de l'utilisateur)
interface RatingRow { recipe_id: string; user_liked: number | null; partner_verdict: PartnerVerdict; note: string | null; updated_at: string }
const fromRow = (r: RatingRow): RecipeRating => ({
  recipeId: r.recipe_id,
  partnerVerdict: r.partner_verdict,
  updatedAt: r.updated_at,
  ...(r.user_liked === null ? {} : { userLiked: r.user_liked === 1 }),
  ...(r.note === null ? {} : { note: r.note }),
});

export function ratingsRepo(db: SqlDriver) {
  const stored = () => new Map(db.all<RatingRow>('SELECT * FROM recipe_ratings').map((r) => [r.recipe_id, fromRow(r)]));
  const all = (): RecipeRating[] => {
    const rows = stored();
    const merged = SEED_RATINGS.map((s) => rows.get(s.recipeId) ?? s);
    for (const [id, r] of rows) if (!SEED_RATINGS.some((s) => s.recipeId === id)) merged.push(r);
    return merged;
  };
  const get = (recipeId: string): RecipeRating =>
    all().find((r) => r.recipeId === recipeId) ?? { recipeId, partnerVerdict: 'a_tester', updatedAt: '' };
  const save = (r: RecipeRating) =>
    db.run(
      `INSERT INTO recipe_ratings (recipe_id, user_liked, partner_verdict, note, updated_at) VALUES (?, ?, ?, ?, ?)
       ON CONFLICT(recipe_id) DO UPDATE SET user_liked = excluded.user_liked, partner_verdict = excluded.partner_verdict,
         note = excluded.note, updated_at = excluded.updated_at`,
      [r.recipeId, r.userLiked === undefined ? null : r.userLiked ? 1 : 0, r.partnerVerdict, r.note ?? null, r.updatedAt],
    );
  return {
    all,
    get,
    setPartnerVerdict: (recipeId: string, verdict: PartnerVerdict, now: string) => save({ ...get(recipeId), partnerVerdict: verdict, updatedAt: now }),
    setUserLiked: (recipeId: string, liked: boolean, now: string) => save({ ...get(recipeId), userLiked: liked, updatedAt: now }),
  };
}

// ───────── Plans de semaine
/** `partnerDates` : ancien format (présence par jour), encore présent dans les plans générés avant la saisie par repas. */
export interface PlanGenerationOptions { partnerMeals?: PartnerMeal[]; partnerDates?: ISODate[]; lateShopping: boolean; dayTemplateId: string }
export interface StoredPlan { plan: WeekPlan; options: PlanGenerationOptions; generatedAt: string }

export function plansRepo(db: SqlDriver) {
  return {
    get: (startDate: ISODate): StoredPlan | null => {
      const row = db.all<{ plan_json: string; options_json: string; generated_at: string }>(
        'SELECT plan_json, options_json, generated_at FROM week_plans WHERE start_date = ?', [startDate],
      )[0];
      return row ? { plan: JSON.parse(row.plan_json) as WeekPlan, options: JSON.parse(row.options_json) as PlanGenerationOptions, generatedAt: row.generated_at } : null;
    },
    save: (s: StoredPlan) =>
      db.run(
        `INSERT INTO week_plans (start_date, plan_json, options_json, generated_at) VALUES (?, ?, ?, ?)
         ON CONFLICT(start_date) DO UPDATE SET plan_json = excluded.plan_json, options_json = excluded.options_json, generated_at = excluded.generated_at`,
        [s.plan.startDate, JSON.stringify(s.plan), JSON.stringify(s.options), s.generatedAt],
      ),
    remove: (startDate: ISODate) => db.run('DELETE FROM week_plans WHERE start_date = ?', [startDate]),
  };
}

// ───────── Cases cochées pendant les courses
export function shoppingRepo(db: SqlDriver) {
  return {
    checked: (startDate: ISODate): Set<string> =>
      new Set(db.all<{ ingredient_id: string }>('SELECT ingredient_id FROM shopping_checks WHERE start_date = ?', [startDate]).map((r) => r.ingredient_id)),
    setChecked: (startDate: ISODate, ingredientId: string, checked: boolean) => {
      if (checked) db.run('INSERT OR IGNORE INTO shopping_checks (start_date, ingredient_id) VALUES (?, ?)', [startDate, ingredientId]);
      else db.run('DELETE FROM shopping_checks WHERE start_date = ? AND ingredient_id = ?', [startDate, ingredientId]);
    },
    clear: (startDate: ISODate) => db.run('DELETE FROM shopping_checks WHERE start_date = ?', [startDate]),
  };
}

export function createRepositories(db: SqlDriver) {
  return {
    settings: settingsRepo(db), partner: partnerRepo(db), ratings: ratingsRepo(db), plans: plansRepo(db), shopping: shoppingRepo(db),
    weighIns: weighInsRepo(db), health: healthRepo(db),
  };
}
export type Repositories = ReturnType<typeof createRepositories>;
