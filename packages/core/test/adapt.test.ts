import { describe, expect, it } from 'vitest';
import { DAY_TEMPLATES, NUTRITION_TARGETS, ROLE_BOUNDS, SUBSTITUTIONS, adaptRecipe, type SlotTarget } from '../src';
import { index, recipe } from './fixtures';

const deuxRepas = DAY_TEMPLATES.find((t) => t.id === 'deux-repas')!;
const slot = (s: SlotTarget['slot']) => deuxRepas.slots.find((x) => x.slot === s)!;
const opts = (id: string, target: SlotTarget) => ({
  recipe: recipe(id), index, target, substitutions: SUBSTITUTIONS, dayTemplate: deuxRepas, kcalFloor: NUTRITION_TARGETS.kcalFloor,
});

describe('adaptation : réajuster', () => {
  const r = adaptRecipe('reajuster', opts('korean-chicken', slot('diner')));

  it('rapproche le plat de la cible du dîner', () => {
    expect(Math.abs(r.after.kcal - 850)).toBeLessThanOrEqual(85);
    expect(r.after.protein).toBeGreaterThan(r.before.protein);
  });

  it('reste dans les bornes de chaque rôle', () => {
    for (const [role, f] of Object.entries(r.roleFactors)) {
      const [lo, hi] = ROLE_BOUNDS[role as keyof typeof ROLE_BOUNDS];
      expect(f).toBeGreaterThanOrEqual(lo);
      expect(f).toBeLessThanOrEqual(hi);
    }
  });

  it('signale honnêtement un plat qui ne peut pas atteindre la cible', () => {
    const b = adaptRecipe('reajuster', opts('brownie', slot('collation')));
    expect(b.warnings.some((w) => w.includes('Protéines'))).toBe(true);
  });

  it('ne grossit jamais un dessert et propose plutôt un complément protéiné', () => {
    const b = adaptRecipe('reajuster', opts('brownie', slot('collation')));
    for (const l of b.lines) expect(l.factor, l.ingredientId).toBeLessThanOrEqual(1);
    expect(b.notes.join(' ')).toContain('skyr + whey');
  });

  it('est déterministe', () => {
    expect(adaptRecipe('reajuster', opts('korean-chicken', slot('diner')))).toEqual(r);
  });
});

describe('adaptation : alléger', () => {
  it('korean chicken : air fryer, filet, sucre réduit', () => {
    const r = adaptRecipe('alleger', opts('korean-chicken', slot('diner')));
    expect(r.appliedSubstitutions).toEqual(expect.arrayContaining(['Friture → air fryer', 'Cuisse de poulet → filet', 'Sucre réduit de 30 %']));
    expect(r.after.kcal).toBeLessThan(r.before.kcal - 100);
    expect(r.notes.join(' ')).toContain('Air fryer');
  });

  it('brownie : moins de kcal, plus de protéines', () => {
    const r = adaptRecipe('alleger', opts('brownie', slot('collation')));
    expect(r.after.kcal).toBeLessThan(r.before.kcal);
    expect(r.after.protein).toBeGreaterThan(r.before.protein);
  });

  it('prévient quand aucune substitution ne s’applique', () => {
    const r = adaptRecipe('alleger', opts('edamame-sales', slot('collation')));
    expect(r.warnings[0]).toContain('Aucune substitution');
  });
});

describe('adaptation : compenser', () => {
  it('garde le plat et retire l’excédent sur les autres créneaux', () => {
    const r = adaptRecipe('compenser', opts('korean-chicken', slot('collation')));
    const excess = r.before.kcal - 450;
    const others = r.otherSlots!.reduce((s, x) => s + x.kcal, 0);
    expect(r.after).toEqual(r.before);
    expect(others).toBeCloseTo(1700 - excess, -1);
    expect(r.notes.some((n) => n.includes('riz cru'))).toBe(true);
  });

  it('avertit quand l’excédent dépasse ce qui est compensable (30 %)', () => {
    const r = adaptRecipe('compenser', opts('korean-chicken', { slot: 'collation', kcal: 100, protein: 10 }));
    expect(r.warnings.some((w) => w.includes('dépassement restant'))).toBe(true);
  });

  it('exige un modèle de journée', () => {
    expect(() => adaptRecipe('compenser', { ...opts('brownie', slot('collation')), dayTemplate: undefined })).toThrow();
  });
});
