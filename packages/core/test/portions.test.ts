import { describe, expect, it } from 'vitest';
import { portionFor, toGrams } from '../src';
import { index, recipe } from './fixtures';

const grams = (id: string, eater: 'user' | 'partner') =>
  portionFor(recipe('poulet-teriyaki'), eater, index).find((l) => l.ingredientId === id)!.grams;

describe('portions (§4)', () => {
  it('compagne : moitié de la viande, deux tiers du reste', () => {
    expect(grams('poulet-filet', 'partner')).toBe(90);
    expect(grams('riz-japonais', 'partner')).toBeCloseTo(40);
    expect(grams('brocoli-surgele', 'partner')).toBeCloseTo(100);
  });

  it('utilisateur : quantités de la recette', () => {
    expect(grams('poulet-filet', 'user')).toBe(180);
  });

  it('convertit les cuillères via la densité', () => {
    expect(toGrams({ value: 1, unit: 'c_a_soupe' }, index.get('sauce-soja')!)).toBeCloseTo(16.5);
    expect(toGrams({ value: 2, unit: 'piece' }, index.get('oeuf')!)).toBe(100);
  });
});
