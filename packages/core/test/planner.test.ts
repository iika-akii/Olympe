import { describe, expect, it } from 'vitest';
import {
  DAY_TEMPLATES, DEFAULT_DAY_TEMPLATE_ID, NUTRITION_TARGETS, RECIPES, SEED_RATINGS, addDays, planWeek,
  type PlannerOptions, type RecipeRating,
} from '../src';
import { index, recipe } from './fixtures';

const SUNDAY = '2026-11-15';
const WEEK = Array.from({ length: 7 }, (_, i) => addDays(SUNDAY, i));
const [d0, d1, d2, d3, d4, d5, d6] = WEEK as [string, string, string, string, string, string, string];
const template = DAY_TEMPLATES.find((t) => t.id === DEFAULT_DAY_TEMPLATE_ID)!;

const base: PlannerOptions = {
  startDate: SUNDAY, recipes: RECIPES, index, ratings: SEED_RATINGS, partnerDates: WEEK,
  dayTemplate: template, kcalFloor: NUTRITION_TARGETS.kcalFloor,
};
const withVerdicts = (verdicts: Record<string, RecipeRating['partnerVerdict']>): RecipeRating[] =>
  SEED_RATINGS.map((r) => (verdicts[r.recipeId] ? { ...r, partnerVerdict: verdicts[r.recipeId]! } : r));

const plan = planWeek(base);
const fresh = (p = plan) => p.meals.filter((m) => m.kind === 'frais' && (m.slot === 'dejeuner' || m.slot === 'diner'));
const lunches = (p = plan) => p.meals.filter((m) => m.slot === 'dejeuner' && m.kind === 'batch');

describe('structure de la semaine', () => {
  it('dimanche midi libre, midis du lundi au vendredi en batch, samedi midi frais', () => {
    expect(plan.freeMeals).toEqual([{ date: d0, slot: 'dejeuner' }]);
    expect(lunches().map((m) => m.date)).toEqual([d1, d2, d3, d4, d5]);
    expect(fresh().find((m) => m.date === d6 && m.slot === 'dejeuner')).toBeDefined();
  });

  it('batch A le dimanche (lundi → mercredi), batch B le mercredi (jeudi, vendredi), deux plats différents', () => {
    const [a, b] = plan.batchSessions;
    expect(a).toMatchObject({ date: d0, servings: 3, covers: [d1, d2, d3] });
    expect(b).toMatchObject({ date: d3, servings: 2, covers: [d4, d5] });
    expect(a!.recipeId).not.toBe(b!.recipeId);
  });

  it('les batchs sont pour l’utilisateur seul et le riz cuit a au plus 3 jours (§5.3)', () => {
    for (const m of lunches()) {
      expect(m.eaters).toEqual(['user']);
      const age = (Date.parse(m.date) - Date.parse(m.cookDate!)) / 86_400_000;
      expect(age).toBeGreaterThanOrEqual(1);
      expect(age).toBeLessThanOrEqual(3);
    }
  });

  it('petit-déjeuner banane + whey et collation chaque jour', () => {
    for (const d of WEEK) {
      expect(plan.meals.find((m) => m.date === d && m.slot === 'petit_dej')?.recipeId).toBe('banane-shaker-whey');
      expect(plan.meals.find((m) => m.date === d && m.slot === 'collation')?.recipeId).toBe('collation-skyr-whey');
    }
  });

  it('refuse une semaine qui ne commence pas un dimanche', () => {
    expect(() => planWeek({ ...base, startDate: d1 })).toThrow();
  });

  it('est déterministe', () => {
    expect(planWeek(base)).toEqual(plan);
  });
});

describe('dîners', () => {
  it('30 min maximum en semaine, 20 min le mercredi soir de batch', () => {
    for (const m of fresh().filter((x) => x.date !== d6)) {
      expect(recipe(m.recipeId).minutes, m.date).toBeLessThanOrEqual(m.date === d3 ? 20 : 30);
    }
  });

  it('jamais deux repas frais identiques d’affilée, au plus 2 fois le même dîner', () => {
    const ids = fresh().map((m) => m.recipeId);
    for (let i = 1; i < ids.length; i++) expect(ids[i]).not.toBe(ids[i - 1]);
    for (const id of new Set(ids)) expect(ids.filter((x) => x === id).length).toBeLessThanOrEqual(2);
  });

  it('variété : au moins 3 plats sur la semaine de travail, aucun plat plus de 4 fois (§5.8)', () => {
    const user = plan.meals.filter((m) => m.slot === 'dejeuner' || m.slot === 'diner');
    const work = user.filter((m) => [d1, d2, d3, d4, d5].includes(m.date));
    expect(new Set(work.map((m) => m.recipeId)).size).toBeGreaterThanOrEqual(3);
    for (const id of new Set(user.map((m) => m.recipeId))) expect(user.filter((m) => m.recipeId === id).length).toBeLessThanOrEqual(4);
  });

  it('les dîners sont à deux les jours où la compagne est là, seul sinon', () => {
    const p = planWeek({ ...base, partnerDates: [d1, d2] });
    for (const m of fresh(p)) expect(m.eaters).toEqual([d1, d2].includes(m.date) ? ['user', 'partner'] : ['user']);
  });
});

describe('recettes à faire goûter à la compagne', () => {
  it('sans plat validé, dépasse le plafond seulement si c’est inévitable, avec un avertissement', () => {
    expect(plan.warnings.some((w) => w.includes('Plafond de 2 recettes à tester'))).toBe(true);
  });

  it('avec 3 plats validés, au plus 2 nouvelles recettes testées et aucun avertissement', () => {
    const p = planWeek({ ...base, ratings: withVerdicts({ gyudon: 'oui', 'larb-gai': 'oui', 'pad-kra-pao': 'oui' }) });
    expect(p.partnerTests.length).toBeLessThanOrEqual(2);
    expect(p.warnings.some((w) => w.includes('Plafond'))).toBe(false);
  });

  it('ne sert jamais à la compagne un plat qu’elle n’aime pas', () => {
    const p = planWeek({ ...base, ratings: withVerdicts({ gyudon: 'non', 'pad-kra-pao': 'non' }) });
    for (const m of fresh(p).filter((x) => x.eaters.includes('partner'))) expect(['gyudon', 'pad-kra-pao']).not.toContain(m.recipeId);
  });

  it('compagne absente : aucun test, aucun avertissement de plafond', () => {
    const p = planWeek({ ...base, partnerDates: [] });
    expect(p.partnerTests).toEqual([]);
    expect(p.warnings.some((w) => w.includes('Plafond'))).toBe(false);
  });
});

describe('rappels', () => {
  const forced = planWeek({ ...base, ratings: withVerdicts({ yakimeshi: 'oui', 'khao-pad': 'oui', 'larb-gai': 'oui', gyudon: 'oui' }) });

  it('riz de la veille : rappel la veille au soir, jamais le premier jour (§5.5)', () => {
    const dayOld = forced.meals.filter((m) => recipe(m.recipeId).needsDayOldRice);
    expect(dayOld.length).toBeGreaterThan(0);
    for (const m of dayOld) {
      expect(m.date).not.toBe(d0);
      expect(forced.reminders.some((r) => r.kind === 'cuire_riz_veille' && r.date === addDays(m.date, -1))).toBe(true);
    }
  });

  it('congélation à l’achat et décongélation la veille pour la viande cuisinée à partir de J+3 (§5.4)', () => {
    const congeler = plan.reminders.filter((r) => r.kind === 'congeler');
    expect(congeler.length).toBeGreaterThan(0);
    expect(congeler.every((r) => r.date === d0)).toBe(true);
    const decongeler = plan.reminders.filter((r) => r.kind === 'decongeler');
    expect(decongeler.every((r) => r.date >= addDays(d0, 2))).toBe(true);
  });

  it('rappel de batch avec le riz à peser cru', () => {
    const batch = plan.reminders.filter((r) => r.kind === 'batch');
    expect(batch.map((r) => r.date)).toEqual([d0, d3]);
    expect(batch[0]!.text).toMatch(/à peser cru : \d+ g de riz/);
  });
});

describe('calories', () => {
  it('chaque jour sans repas libre est au-dessus du plancher et proche de la cible', () => {
    for (const d of [d1, d2, d3, d4, d5, d6]) {
      expect(plan.dailyKcal[d]).toBeGreaterThanOrEqual(NUTRITION_TARGETS.kcalFloor);
      expect(Math.abs(plan.dailyKcal[d]! / 2130 - 1)).toBeLessThanOrEqual(0.1);
    }
    expect(plan.warnings.some((w) => w.includes('sous le plancher'))).toBe(false);
  });

  it('la portion de l’utilisateur est réajustée, pas celle de la compagne', () => {
    const dinner = fresh().find((m) => m.eaters.includes('partner'))!;
    expect(Object.values(dinner.userRoleFactors!).some((f) => f !== 1)).toBe(true);
  });
});

describe('courses décalées au lundi (§7)', () => {
  const late = planWeek({ ...base, lateShopping: true });

  it('lundi midi en dépannage, batch A lundi soir pour mardi et mercredi, dimanche soir libre', () => {
    expect(late.meals.find((m) => m.date === d1 && m.slot === 'dejeuner')).toMatchObject({ kind: 'depannage', recipeId: 'onigiri-thon-mayo' });
    expect(late.batchSessions[0]).toMatchObject({ date: d1, servings: 2, covers: [d2, d3] });
    expect(late.freeMeals).toContainEqual({ date: d0, slot: 'diner' });
    expect(late.warnings[0]).toContain('Courses décalées');
  });
});

describe('liste de courses de la semaine', () => {
  it('couvre tous les repas planifiés et respecte le placard en stock', () => {
    const p = planWeek({ ...base, pantryInStock: new Set(['sauce-soja', 'riz-thai', 'riz-japonais']) });
    expect(p.shoppingList.find((i) => i.ingredientId === 'banane')!.toBuy).toBe(7);
    expect(p.shoppingList.find((i) => i.ingredientId === 'sauce-soja')).toBeUndefined();
    expect(p.shoppingList.find((i) => i.ingredientId === 'riz-thai')).toBeUndefined();
  });
});
