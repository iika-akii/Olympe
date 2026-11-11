import { describe, expect, it } from 'vitest';
import {
  formatDayLong, formatDayShort, formatQuarter, formatWeekRange, localISODate, planningWeekStart, portionView,
  recipeToMarkdown, weekDates,
} from '../src';
import { index, recipe } from './fixtures';

describe('dates', () => {
  it('la semaine de planification commence le dimanche des courses', () => {
    expect(planningWeekStart('2026-11-15')).toBe('2026-11-15');
    expect(planningWeekStart('2026-11-18')).toBe('2026-11-15');
    expect(planningWeekStart('2026-11-21')).toBe('2026-11-15');
    expect(weekDates('2026-11-15').at(-1)).toBe('2026-11-21');
  });

  it('formate les dates en français sans Intl', () => {
    expect(formatDayLong('2026-11-15')).toBe('dimanche 15 novembre');
    expect(formatDayLong('2026-12-01')).toBe('mardi 1er décembre');
    expect(formatDayShort('2026-11-18')).toBe('mer. 18 nov.');
    expect(formatWeekRange('2026-11-15')).toBe('du 15 au 21 novembre');
    expect(formatWeekRange('2026-11-29')).toBe('du 29 novembre au 5 décembre');
  });

  it('date locale de l’appareil', () => {
    expect(localISODate(new Date(2026, 10, 9, 23, 30))).toBe('2026-11-09');
  });
});

describe('portions affichables', () => {
  it('garde les unités de cuisine et arrondit au quart', () => {
    expect(formatQuarter(0.5)).toBe('½');
    expect(formatQuarter(1.5)).toBe('1½');
    expect(formatQuarter(2)).toBe('2');
    const lines = portionView(recipe('gyudon'), index, { withPartner: true });
    const soja = lines.find((l) => l.ingredientId === 'sauce-soja')!;
    expect(soja.user.text).toBe('1½ c. à soupe');
    expect(lines.find((l) => l.ingredientId === 'oignon')!.user.text).toBe('½');
    expect(lines.find((l) => l.ingredientId === 'boeuf-emince-maigre')!.partner!.text).toBe('90 g');
  });

  it('applique le réajustement et les portions de batch à l’utilisateur seulement', () => {
    const lines = portionView(recipe('poulet-teriyaki'), index, { userRoleFactors: { meat: 1.3 }, servings: 3, withPartner: true });
    const poulet = lines.find((l) => l.ingredientId === 'poulet-filet')!;
    expect(poulet.user.text).toBe('700 g'); // 180 × 1,3 × 3 = 702 → 700
    expect(poulet.partner!.text).toBe('90 g');
  });

  it('précise que le riz se pèse cru', () => {
    const riz = portionView(recipe('poulet-gingembre'), index).find((l) => l.ingredientId === 'riz-thai')!;
    expect(riz.note).toBe('cru');
    const veille = portionView(recipe('khao-pad'), index).find((l) => l.ingredientId === 'riz-thai')!;
    expect(veille.note).toBe('cuit la veille');
  });

  it('signale les ingrédients pièges', () => {
    const roux = portionView(recipe('curry-japonais'), index).find((l) => l.ingredientId === 'roux-curry-japonais')!;
    expect(roux.trap).toContain('1 carré');
  });
});

describe('export Markdown (Obsidian)', () => {
  it('produit un frontmatter et des liens vers les ingrédients', () => {
    const md = recipeToMarkdown(recipe('poulet-teriyaki'), index, { recipeId: 'poulet-teriyaki', partnerVerdict: 'oui', updatedAt: '2026-11-11' });
    expect(md.startsWith('---\nid: poulet-teriyaki\n')).toBe(true);
    expect(md).toContain('compagne: oui');
    expect(md).toContain('- [[poulet-filet|Filet de poulet]] : 180 g');
    expect(md).toContain('## Étapes\n1. Saisir le poulet');
  });
});
