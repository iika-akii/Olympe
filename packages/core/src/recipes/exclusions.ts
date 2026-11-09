import type { Recipe } from '../domain';
import { getIngredient, type IngredientIndex } from '../nutrition/macros';

export function normalize(text: string): string {
  return text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

/** Mots-clés exclus présents dans un texte libre (ligne d'ingrédient importée). */
export function excludedKeywordsIn(text: string, keywords: readonly string[]): string[] {
  const t = normalize(text);
  return keywords.filter((k) => t.includes(normalize(k)));
}

/** Ingrédients d'une recette qui tombent sous une exclusion. */
export function findExcludedLines(recipe: Recipe, index: IngredientIndex, keywords: readonly string[]): string[] {
  return recipe.lines
    .map((l) => getIngredient(index, l.ingredientId))
    .filter((ing) => excludedKeywordsIn(`${ing.id} ${ing.name}`, keywords).length > 0)
    .map((ing) => ing.id);
}

export function isRecipeAllowed(recipe: Recipe, index: IngredientIndex, keywords: readonly string[]): boolean {
  return findExcludedLines(recipe, index, keywords).length === 0;
}
