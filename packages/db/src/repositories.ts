import {
  DEFAULT_DAY_TEMPLATE_ID, SEED_RATINGS, type ISODate, type PartnerVerdict, type RecipeRating, type WeekPlan,
} from '@olympe/core';
import type { SqlDriver } from './driver';

// ───────── Réglages
export function settingsRepo(db: SqlDriver) {
  const get = (key: string): string | null => db.all<{ value: string }>('SELECT value FROM settings WHERE key = ?', [key])[0]?.value ?? null;
  const set = (key: string, value: string) => db.run('INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value', [key, value]);
  return {
    getDayTemplateId: (): string => get('day_template_id') ?? DEFAULT_DAY_TEMPLATE_ID,
    setDayTemplateId: (id: string) => set('day_template_id', id),
  };
}

// ───────── Jours où la compagne mange avec l'utilisateur
export function partnerRepo(db: SqlDriver) {
  return {
    listBetween: (from: ISODate, to: ISODate): ISODate[] =>
      db.all<{ date: string }>('SELECT date FROM partner_dates WHERE date >= ? AND date <= ? ORDER BY date', [from, to]).map((r) => r.date),
    setPresent: (date: ISODate, present: boolean) => {
      if (present) db.run('INSERT OR IGNORE INTO partner_dates (date) VALUES (?)', [date]);
      else db.run('DELETE FROM partner_dates WHERE date = ?', [date]);
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
export interface PlanGenerationOptions { partnerDates: ISODate[]; lateShopping: boolean; dayTemplateId: string }
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
  return { settings: settingsRepo(db), partner: partnerRepo(db), ratings: ratingsRepo(db), plans: plansRepo(db), shopping: shoppingRepo(db) };
}
export type Repositories = ReturnType<typeof createRepositories>;
