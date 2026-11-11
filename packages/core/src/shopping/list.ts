import { AISLES, type Ingredient, type ISODate, type PlannedMeal, type Recipe, type ShoppingItem, type ShoppingUse } from '../domain';
import { getIngredient, type IngredientIndex } from '../nutrition/macros';
import { portionFor } from '../recipes/portions';
import { gramsToUnit, round } from '../units';

export interface ShoppingOptions {
  meals: readonly PlannedMeal[];
  recipes: ReadonlyMap<string, Recipe>;
  index: IngredientIndex;
  /** Ingrédients de placard déjà en stock : retirés de la liste (§7). */
  pantryInStock?: ReadonlySet<string>;
  /** Date des courses : la viande cuisinée à partir de J+3 doit être congelée à l'achat (§5.4). */
  purchaseDate?: ISODate;
}

const DAY_MS = 86_400_000;
const daysBetween = (a: ISODate, b: ISODate) => Math.round((Date.parse(b) - Date.parse(a)) / DAY_MS);

/** Combinaison de conditionnements qui couvre le besoin avec le moins de reste, puis le moins de paquets. */
export function choosePacks(needed: number, packages: readonly number[]): number[] {
  if (packages.length === 0 || needed <= 0) return [];
  const sizes = [...packages].sort((a, b) => b - a);
  let best: { packs: number[]; waste: number } | null = null;
  const search = (i: number, packs: number[], total: number) => {
    if (total >= needed - 1e-9) {
      const waste = total - needed;
      if (!best || waste < best.waste - 1e-9 || (Math.abs(waste - best.waste) < 1e-9 && packs.length < best.packs.length)) {
        best = { packs: [...packs], waste };
      }
      return;
    }
    if (i >= sizes.length || packs.length >= 12) return;
    const size = sizes[i]!;
    const maxCount = Math.ceil((needed - total) / size);
    for (let n = maxCount; n >= 0; n--) {
      search(i + 1, [...packs, ...Array<number>(n).fill(size)], total + n * size);
    }
  };
  search(0, [], 0);
  return (best as { packs: number[] } | null)?.packs ?? [];
}

function formatQty(value: number, ing: Ingredient): string {
  if (ing.unit === 'piece') return `${round(value, 1)} pièce(s)`;
  return `${Math.round(value)} ${ing.unit}`;
}

/** Liste de courses agrégée et ordonnée par rayon (§7). */
export function buildShoppingList(o: ShoppingOptions): ShoppingItem[] {
  const acc = new Map<string, { neededGrams: number; frozenGrams: number; usedBy: ShoppingUse[] }>();

  for (const meal of o.meals) {
    const recipe = o.recipes.get(meal.recipeId);
    if (!recipe) throw new Error(`Recette inconnue : ${meal.recipeId}`);
    const freeze = o.purchaseDate !== undefined && daysBetween(o.purchaseDate, meal.cookDate ?? meal.date) >= 3;
    for (const eater of meal.eaters) {
      for (const line of portionFor(recipe, eater, o.index, meal.userRoleFactors)) {
        const entry = acc.get(line.ingredientId) ?? { neededGrams: 0, frozenGrams: 0, usedBy: [] };
        entry.neededGrams += line.grams;
        if (freeze && line.role === 'meat') entry.frozenGrams += line.grams;
        if (!entry.usedBy.some((u) => u.date === meal.date && u.slot === meal.slot && u.recipeId === meal.recipeId)) {
          entry.usedBy.push({ date: meal.date, slot: meal.slot, recipeId: meal.recipeId });
        }
        acc.set(line.ingredientId, entry);
      }
    }
  }

  const items: ShoppingItem[] = [];
  for (const [id, entry] of acc) {
    const ing = getIngredient(o.index, id);
    if (ing.pantry && o.pantryInStock?.has(id)) continue;
    const needed = gramsToUnit(entry.neededGrams, ing);
    const packs = ing.pantry ? [] : choosePacks(needed, ing.packages);
    const toBuy = packs.length > 0 ? packs.reduce((a, b) => a + b, 0) : ing.unit === 'piece' ? Math.ceil(needed - 1e-9) : needed;
    const notes: string[] = [];
    if (entry.frozenGrams > 0 && ing.freezable) {
      notes.push(`Congeler ${Math.round(entry.frozenGrams)} g à l'achat, sortir la veille au soir.`);
    }
    if (ing.trap) notes.push(ing.trap);
    if (ing.pantry) notes.push(`Vérifier le placard : ${formatQty(needed, ing)} nécessaires.`);
    items.push({
      ingredientId: id,
      name: ing.name,
      aisle: ing.pantry ? 'placard' : ing.aisle,
      unit: ing.unit,
      needed: round(needed, 1),
      toBuy: round(toBuy, 1),
      packs,
      leftover: round(Math.max(0, toBuy - needed), 1),
      usedBy: entry.usedBy,
      notes,
    });
  }

  return items.sort((a, b) => AISLES.indexOf(a.aisle) - AISLES.indexOf(b.aisle) || a.name.localeCompare(b.name, 'fr'));
}
