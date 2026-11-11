import { INGREDIENTS, RECIPES, SUBSTITUTIONS, indexIngredients, type MealSlot, type PartnerVerdict, type Recipe } from '@olympe/core';

export const INDEX = indexIngredients(INGREDIENTS);
const BY_ID = new Map(RECIPES.map((r) => [r.id, r]));
export const recipeById = (id: string): Recipe | undefined => BY_ID.get(id);
export { RECIPES, SUBSTITUTIONS };

export const SLOT_LABEL: Record<MealSlot, string> = { petit_dej: 'Petit-déj', dejeuner: 'Midi', collation: 'Collation', diner: 'Soir' };
export const VERDICT_LABEL: Record<PartnerVerdict, string> = { oui: 'Elle aime', non: "Elle n'aime pas", a_tester: 'À tester' };
