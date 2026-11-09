import { describe, expect, it } from 'vitest';
import { AISLES, buildShoppingList, choosePacks, formatShoppingListText, type PlannedMeal } from '../src';
import { index, recipes } from './fixtures';

// Batch teriyaki cuisiné le dimanche des courses, mangé lundi à mercredi ; dîner frais jeudi.
const batch = { slot: 'dejeuner', recipeId: 'poulet-teriyaki', eaters: ['user'], cookDate: '2026-11-15' } as const;
const meals: PlannedMeal[] = [
  { ...batch, date: '2026-11-16', eaters: ['user'] },
  { ...batch, date: '2026-11-17', eaters: ['user'] },
  { ...batch, date: '2026-11-18', eaters: ['user'] },
  { date: '2026-11-19', slot: 'diner', recipeId: 'poulet-gingembre', eaters: ['user'] },
];

describe('liste de courses (§7)', () => {
  const list = buildShoppingList({ meals, recipes, index, pantryInStock: new Set(['sauce-soja']), purchaseDate: '2026-11-15' });
  const item = (id: string) => list.find((i) => i.ingredientId === id);

  it('agrège le poulet et arrondit à la barquette', () => {
    const poulet = item('poulet-filet')!;
    expect(poulet.needed).toBe(720);
    expect(poulet.packs).toEqual([750]);
    expect(poulet.leftover).toBe(30);
    expect(poulet.usedBy).toHaveLength(4);
  });

  it('retire le placard en stock et signale le placard à vérifier', () => {
    expect(item('sauce-soja')).toBeUndefined();
    expect(item('mirin')!.aisle).toBe('placard');
  });

  it('demande de congeler seulement la viande cuisinée à partir de J+3 (§5.4)', () => {
    expect(item('poulet-filet')!.notes[0]).toContain('Congeler 180 g');
  });

  it('respecte l’ordre des rayons', () => {
    const order = list.map((i) => AISLES.indexOf(i.aisle));
    expect(order).toEqual([...order].sort((a, b) => a - b));
  });

  it('choisit la combinaison de conditionnements avec le moins de reste', () => {
    expect(choosePacks(7, [6, 12])).toEqual([12]);
    expect(choosePacks(5, [6, 12])).toEqual([6]);
    expect(choosePacks(1300, [1000])).toEqual([1000, 1000]);
    expect(choosePacks(200, [])).toEqual([]);
  });

  it('produit un texte partageable regroupé par rayon', () => {
    const text = formatShoppingListText(list, 'Courses semaine du 16/11');
    expect(text.startsWith('Courses semaine du 16/11')).toBe(true);
    expect(text).toContain('Volaille et boucherie\n- Filet de poulet : 1 × 750 g');
    expect(text.indexOf('Volaille')).toBeLessThan(text.indexOf('Surgelés'));
  });
});
