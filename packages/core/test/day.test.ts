import { describe, expect, it } from 'vitest';
import {
  DAY_TEMPLATES, DEFAULT_DAY_TEMPLATE_ID, NUTRITION_TARGETS, RECIPES, SEED_RATINGS, addDays, daySummary, planWeek,
  type WeekPlan,
} from '../src';
import { index } from './fixtures';

const SUNDAY = '2026-11-15';
const template = DAY_TEMPLATES.find((t) => t.id === DEFAULT_DAY_TEMPLATE_ID)!;
const plan = planWeek({
  startDate: SUNDAY, recipes: RECIPES, index, ratings: SEED_RATINGS, partnerDates: [],
  dayTemplate: template, kcalFloor: NUTRITION_TARGETS.kcalFloor,
});

describe('résumé du jour', () => {
  it('le total reprend les kcal planifiées du planificateur', () => {
    for (const d of plan.dates) {
      // Le planificateur arrondit la somme, le résumé aussi : même valeur.
      expect(daySummary(plan, d, NUTRITION_TARGETS).macros.kcal).toBe(plan.dailyKcal[d]);
    }
  });

  it('un jour de semaine complet est « dans le plan », au-dessus du plancher', () => {
    const s = daySummary(plan, addDays(SUNDAY, 2), NUTRITION_TARGETS);
    expect(s.status).toBe('dans_le_plan');
    expect(s.hasFreeMeal).toBe(false);
    expect(s.macros.kcal).toBeGreaterThanOrEqual(NUTRITION_TARGETS.kcalFloor);
    expect(s.mealCount).toBe(4);
    expect(s.kcalProgress).toBeGreaterThan(s.floorProgress);
    expect(s.kcalProgress).toBeLessThanOrEqual(1);
  });

  it('le dimanche a un repas libre : « à compléter », sans alerte de plancher', () => {
    const s = daySummary(plan, SUNDAY, NUTRITION_TARGETS);
    expect(s.hasFreeMeal).toBe(true);
    expect(s.status).toBe('a_completer');
  });

  it('sous le plancher sans repas libre : alerte (§2)', () => {
    const tuesday = addDays(SUNDAY, 2);
    const cut: WeekPlan = { ...plan, meals: plan.meals.filter((m) => !(m.date === tuesday && m.slot === 'diner')) };
    const s = daySummary(cut, tuesday, NUTRITION_TARGETS);
    expect(s.macros.kcal).toBeLessThan(NUTRITION_TARGETS.kcalFloor);
    expect(s.status).toBe('sous_plancher');
  });

  it('un jour sans repas planifié ne plante pas', () => {
    const s = daySummary(plan, '2027-01-01', NUTRITION_TARGETS);
    expect(s.macros).toEqual({ kcal: 0, protein: 0, fat: 0, carbs: 0 });
    expect(s.kcalProgress).toBe(0);
  });

  it('les progressions sont bornées à 1', () => {
    const s = daySummary(plan, addDays(SUNDAY, 2), { ...NUTRITION_TARGETS, kcalMax: 1000, proteinG: 50 });
    expect(s.kcalProgress).toBe(1);
    expect(s.proteinProgress).toBe(1);
  });
});
