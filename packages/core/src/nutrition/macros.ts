import type { Ingredient, Macros, Recipe } from '../domain';
import { toGrams } from '../units';

export const ZERO: Macros = { kcal: 0, protein: 0, fat: 0, carbs: 0 };

export type IngredientIndex = ReadonlyMap<string, Ingredient>;

export function indexIngredients(list: readonly Ingredient[]): IngredientIndex {
  return new Map(list.map((i) => [i.id, i]));
}

export function getIngredient(index: IngredientIndex, id: string): Ingredient {
  const ing = index.get(id);
  if (!ing) throw new Error(`Ingrédient inconnu : ${id}`);
  return ing;
}

export function macrosForGrams(ing: Ingredient, grams: number): Macros {
  const f = grams / 100;
  return {
    kcal: ing.per100g.kcal * f,
    protein: ing.per100g.protein * f,
    fat: ing.per100g.fat * f,
    carbs: ing.per100g.carbs * f,
  };
}

export function addMacros(a: Macros, b: Macros): Macros {
  return { kcal: a.kcal + b.kcal, protein: a.protein + b.protein, fat: a.fat + b.fat, carbs: a.carbs + b.carbs };
}

export function sumMacros(list: readonly Macros[]): Macros {
  return list.reduce(addMacros, ZERO);
}

/** Macros d'une portion utilisateur, calculées depuis les ingrédients. */
export function recipeMacros(recipe: Recipe, index: IngredientIndex): Macros {
  return sumMacros(
    recipe.lines.map((line) => {
      const ing = getIngredient(index, line.ingredientId);
      return macrosForGrams(ing, toGrams(line.perServing, ing));
    }),
  );
}
