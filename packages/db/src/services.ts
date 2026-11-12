import {
  DAY_TEMPLATES, INGREDIENTS, NUTRITION_TARGETS, RECIPES, addDays, indexIngredients, partnerMealsFromDates, planWeek,
  type ISODate, type PartnerMeal,
} from '@olympe/core';
import { transaction, type SqlDriver } from './driver';
import type { Repositories, StoredPlan } from './repositories';

const INDEX = indexIngredients(INGREDIENTS);

/**
 * Génère la semaine à partir des données saisies (repas de la compagne, notes, modèle de journée),
 * l'enregistre et remet à zéro les cases de courses de cette semaine.
 */
export function generateWeek(db: SqlDriver, repos: Repositories, o: { startDate: ISODate; lateShopping: boolean; now: string }): StoredPlan {
  const dayTemplateId = repos.settings.getDayTemplateId();
  const dayTemplate = DAY_TEMPLATES.find((t) => t.id === dayTemplateId) ?? DAY_TEMPLATES[0]!;
  const partnerMeals = repos.partner.listBetween(o.startDate, addDays(o.startDate, 6));
  const plan = planWeek({
    startDate: o.startDate,
    recipes: RECIPES,
    index: INDEX,
    ratings: repos.ratings.all(),
    partnerMeals,
    dayTemplate,
    kcalFloor: NUTRITION_TARGETS.kcalFloor,
    lateShopping: o.lateShopping,
  });
  const stored: StoredPlan = { plan, options: { partnerMeals, lateShopping: o.lateShopping, dayTemplateId: dayTemplate.id }, generatedAt: o.now };
  transaction(db, () => {
    repos.plans.save(stored);
    repos.shopping.clear(o.startDate);
  });
  return stored;
}

const key = (meals: readonly PartnerMeal[]) => meals.map((m) => `${m.date}|${m.slot}`).sort().join();

/** Vrai si les repas de la compagne ou le modèle de journée ont changé depuis la génération du plan. */
export function isPlanStale(repos: Repositories, stored: StoredPlan): boolean {
  const start = stored.plan.startDate;
  const now = repos.partner.listBetween(start, addDays(start, 6));
  const then = stored.options.partnerMeals ?? partnerMealsFromDates(stored.options.partnerDates ?? []);
  return key(now) !== key(then) || repos.settings.getDayTemplateId() !== stored.options.dayTemplateId;
}
