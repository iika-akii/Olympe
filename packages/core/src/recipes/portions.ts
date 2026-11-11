import { PARTNER_RATIO, type Eater, type IngredientRole, type Recipe } from '../domain';
import { getIngredient, type IngredientIndex } from '../nutrition/macros';
import { toGrams } from '../units';

export interface PortionLine { ingredientId: string; role: IngredientRole; grams: number }

export function lineRole(recipe: Recipe, ingredientId: string, index: IngredientIndex): IngredientRole {
  const line = recipe.lines.find((l) => l.ingredientId === ingredientId);
  return line?.role ?? getIngredient(index, ingredientId).role;
}

/** Ratio de portion d'un convive pour un rôle donné (§4). */
export function eaterRatio(eater: Eater, role: IngredientRole): number {
  return eater === 'user' ? 1 : PARTNER_RATIO[role];
}

/**
 * Quantités en grammes d'une recette pour un convive.
 * `userRoleFactors` (mode « réajuster ») ne s'applique qu'à la portion de l'utilisateur :
 * la portion de la compagne reste calculée sur la recette d'origine.
 */
export function portionFor(
  recipe: Recipe, eater: Eater, index: IngredientIndex, userRoleFactors: Partial<Record<IngredientRole, number>> = {},
): PortionLine[] {
  return recipe.lines.map((line) => {
    const ing = getIngredient(index, line.ingredientId);
    const role = line.role ?? ing.role;
    const factor = eater === 'user' ? (userRoleFactors[role] ?? 1) : eaterRatio(eater, role);
    return { ingredientId: ing.id, role, grams: toGrams(line.perServing, ing) * factor };
  });
}
