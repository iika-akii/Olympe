import { describe, expect, it } from 'vitest';
import {
  DAY_TEMPLATES, DEFAULT_DAY_TEMPLATE_ID, EQUIPMENT, EXCLUDED_INGREDIENT_KEYWORDS, NUTRITION_TARGETS, RECIPES, SEED_RATINGS, SUBSTITUTIONS,
  isRecipeAllowed, recipeMacros,
} from '../src';
import { index, recipe } from './fixtures';

describe('seed', () => {
  it('chaque ligne de recette référence un ingrédient connu', () => {
    for (const r of RECIPES) for (const l of r.lines) expect(index.has(l.ingredientId), `${r.id} → ${l.ingredientId}`).toBe(true);
  });

  it('chaque substitution référence des ingrédients connus', () => {
    for (const s of SUBSTITUTIONS) {
      expect(index.has(s.from), s.id).toBe(true);
      for (const t of s.to) expect(index.has(t.ingredientId), s.id).toBe(true);
    }
  });

  it('le teriyaki calculé est à ±10 % de 600 kcal / 58 g P', () => {
    const m = recipeMacros(recipe('poulet-teriyaki'), index);
    expect(m.kcal).toBeGreaterThan(540);
    expect(m.kcal).toBeLessThan(660);
    expect(m.protein).toBeGreaterThan(52);
    expect(m.protein).toBeLessThan(64);
  });

  it('toutes les recettes du contexte sont à ±10 % des kcal annoncées', () => {
    for (const r of RECIPES.filter((x) => x.declared)) {
      const ratio = recipeMacros(r, index).kcal / r.declared!.kcal;
      expect(Math.abs(ratio - 1), r.id).toBeLessThanOrEqual(0.1);
    }
  });

  it('aucune recette de départ ne contient un ingrédient exclu', () => {
    for (const r of RECIPES) expect(isRecipeAllowed(r, index, EXCLUDED_INGREDIENT_KEYWORDS), r.id).toBe(true);
  });

  it('aucune recette ne demande un matériel absent', () => {
    for (const r of RECIPES) for (const e of r.equipment) expect(EQUIPMENT, r.id).toContain(e);
  });

  it('chaque modèle de journée vise 2 100-2 200 kcal et au moins 180 g de protéines', () => {
    for (const t of DAY_TEMPLATES) {
      const kcal = t.slots.reduce((s, x) => s + x.kcal, 0);
      const protein = t.slots.reduce((s, x) => s + x.protein, 0);
      expect(kcal, t.id).toBeGreaterThanOrEqual(NUTRITION_TARGETS.kcalMin);
      expect(kcal, t.id).toBeLessThanOrEqual(NUTRITION_TARGETS.kcalMax);
      expect(protein, t.id).toBeGreaterThanOrEqual(NUTRITION_TARGETS.proteinG);
    }
  });

  it('le petit-déjeuner banane + whey correspond au créneau du modèle par défaut', () => {
    const t = DAY_TEMPLATES.find((x) => x.id === DEFAULT_DAY_TEMPLATE_ID)!;
    const slot = t.slots.find((x) => x.slot === 'petit_dej')!;
    const m = recipeMacros(recipe('banane-shaker-whey'), index);
    expect(Math.abs(m.kcal / slot.kcal - 1)).toBeLessThanOrEqual(0.1);
    expect(m.protein).toBeGreaterThanOrEqual(slot.protein * 0.9);
  });

  it('toutes les recettes de départ sont notées « aimé », compagne « à tester »', () => {
    expect(SEED_RATINGS).toHaveLength(RECIPES.length);
    expect(SEED_RATINGS.every((r) => r.userLiked && r.partnerVerdict === 'a_tester')).toBe(true);
  });
});
