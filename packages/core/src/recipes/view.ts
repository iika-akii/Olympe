import type { IngredientRole, KitchenQuantity, Recipe } from '../domain';
import { formatQuarter } from '../format';
import { getIngredient, type IngredientIndex } from '../nutrition/macros';
import { eaterRatio } from './portions';

export interface DisplayQuantity { value: number; unit: KitchenQuantity['unit']; text: string }
export interface PortionViewLine {
  ingredientId: string;
  name: string;
  user: DisplayQuantity;
  partner?: DisplayQuantity;
  note?: string;
  trap?: string;
}

/** Arrondi lisible en cuisine : 5 g au-dessus de 50 g, 1 g au-dessus de 10 g, sinon 0,5 g. */
function roundMass(v: number): number {
  if (v >= 50) return Math.round(v / 5) * 5;
  if (v >= 10) return Math.round(v);
  return Math.round(v * 2) / 2;
}

export function displayQuantity(value: number, unit: KitchenQuantity['unit']): DisplayQuantity {
  switch (unit) {
    case 'g':
    case 'ml': {
      const v = roundMass(value);
      return { value: v, unit, text: `${String(v).replace('.', ',')} ${unit}` };
    }
    case 'piece':
      return { value: Math.round(value * 4) / 4, unit, text: formatQuarter(value) };
    case 'c_a_soupe':
    case 'c_a_cafe':
      return { value: Math.round(value * 4) / 4, unit, text: `${formatQuarter(value)} c. à ${unit === 'c_a_soupe' ? 'soupe' : 'café'}` };
  }
}

export interface PortionViewOptions {
  /** Facteurs du mode « réajuster » pour la portion de l'utilisateur. */
  userRoleFactors?: Partial<Record<IngredientRole, number>>;
  withPartner?: boolean;
  /** Nombre de portions utilisateur (batch). */
  servings?: number;
}

/** Quantités à afficher pour un repas, dans l'unité de la recette (cuillères, pièces, grammes). */
export function portionView(recipe: Recipe, index: IngredientIndex, o: PortionViewOptions = {}): PortionViewLine[] {
  const servings = o.servings ?? 1;
  return recipe.lines.map((line) => {
    const ing = getIngredient(index, line.ingredientId);
    const role = line.role ?? ing.role;
    const base = line.perServing.value;
    const view: PortionViewLine = {
      ingredientId: ing.id,
      name: ing.name,
      user: displayQuantity(base * (o.userRoleFactors?.[role] ?? 1) * servings, line.perServing.unit),
    };
    if (o.withPartner) view.partner = displayQuantity(base * eaterRatio('partner', role), line.perServing.unit);
    if (line.note) view.note = line.note;
    else if (ing.id.startsWith('riz-') || ing.id.startsWith('nouilles')) view.note = 'cru';
    if (ing.trap) view.trap = ing.trap;
    return view;
  });
}
