import { INGREDIENTS, RECIPES, indexIngredients, type Recipe } from '../src';

export const index = indexIngredients(INGREDIENTS);
export const recipes = new Map(RECIPES.map((r) => [r.id, r]));
export function recipe(id: string): Recipe {
  const r = recipes.get(id);
  if (!r) throw new Error(id);
  return r;
}
