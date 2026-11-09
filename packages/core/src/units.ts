import type { CanonicalUnit, Ingredient, KitchenQuantity } from './domain';

const ML_PER: Record<'c_a_soupe' | 'c_a_cafe', number> = { c_a_soupe: 15, c_a_cafe: 5 };

/** Convertit une quantité de cuisine en grammes pour un ingrédient donné. */
export function toGrams(q: KitchenQuantity, ing: Ingredient): number {
  switch (q.unit) {
    case 'g':
      return q.value;
    case 'ml':
      return q.value * (ing.densityGPerMl ?? 1);
    case 'c_a_soupe':
    case 'c_a_cafe':
      return q.value * ML_PER[q.unit] * (ing.densityGPerMl ?? 1);
    case 'piece':
      if (ing.gramsPerPiece === undefined) throw new Error(`${ing.id} : gramsPerPiece manquant`);
      return q.value * ing.gramsPerPiece;
  }
}

/** Convertit des grammes dans l'unité d'achat de l'ingrédient. */
export function gramsToUnit(grams: number, ing: Ingredient): number {
  return fromGrams(grams, ing.unit, ing);
}

export function fromGrams(grams: number, unit: CanonicalUnit, ing: Ingredient): number {
  switch (unit) {
    case 'g':
      return grams;
    case 'ml':
      return grams / (ing.densityGPerMl ?? 1);
    case 'piece':
      if (ing.gramsPerPiece === undefined) throw new Error(`${ing.id} : gramsPerPiece manquant`);
      return grams / ing.gramsPerPiece;
  }
}

export function round(value: number, decimals = 1): number {
  const f = 10 ** decimals;
  return Math.round(value * f) / f;
}
