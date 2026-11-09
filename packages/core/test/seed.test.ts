import { describe, expect, it } from 'vitest';
import { EQUIPMENT, EXCLUDED_INGREDIENT_KEYWORDS, RECIPES, SUBSTITUTIONS, isRecipeAllowed, recipeMacros } from '../src';
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
});
