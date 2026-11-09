import { describe, expect, it } from 'vitest';
import { NUTRITION_TARGETS, decideAdjustment, weekStart, type WeighIn } from '../src';

/** Génère 7 pesées par semaine à partir du lundi 16/11/2026, une moyenne par semaine. */
function weeks(means: number[]): WeighIn[] {
  const out: WeighIn[] = [];
  means.forEach((mean, w) => {
    for (let d = 0; d < 7; d++) {
      const date = new Date(Date.UTC(2026, 10, 16 + w * 7 + d)).toISOString().slice(0, 10);
      out.push({ date, kg: mean + (d % 2 === 0 ? 0.3 : -0.3) * (d === 6 ? 0 : 1) });
    }
  });
  return out;
}

const decide = (means: number[], current = 2150) =>
  decideAdjustment({ weighIns: weeks(means), currentKcalTarget: current, targets: NUTRITION_TARGETS });

describe('règles d’ajustement (§2)', () => {
  it('calcule le lundi de la semaine', () => {
    expect(weekStart('2026-11-22')).toBe('2026-11-16');
    expect(weekStart('2026-11-16')).toBe('2026-11-16');
  });

  it('ne décide rien avant 3 semaines', () => {
    expect(decide([100, 99.5]).action).toBe('insufficient_data');
  });

  it('baisse de 150 kcal via les féculents si la perte est sous 0,3 kg/semaine', () => {
    const d = decide([100, 99.8, 99.6]);
    expect(d.action).toBe('lower');
    expect(d.newKcalTarget).toBe(2000);
    expect(d.riceRawGramsPerDayDelta).toBe(-42);
  });

  it('monte de 100 kcal si la perte dépasse 0,7 kg/semaine', () => {
    const d = decide([100, 99.2, 98.4]);
    expect(d.action).toBe('raise');
    expect(d.newKcalTarget).toBe(2250);
  });

  it('maintient dans la fourchette', () => {
    expect(decide([100, 99.5, 99]).action).toBe('hold');
  });

  it('ne passe jamais sous le plancher de 1 900 kcal', () => {
    expect(decide([100, 99.9, 99.8], 1950).newKcalTarget).toBe(1900);
    const atFloor = decide([100, 99.9, 99.8], 1900);
    expect(atFloor.action).toBe('hold');
    expect(atFloor.newKcalTarget).toBe(1900);
  });

  it('ignore les semaines avec moins de 3 pesées', () => {
    const sparse = weeks([100, 99.8, 99.6]).filter((w) => w.date < '2026-11-23' || w.date > '2026-11-26');
    expect(decideAdjustment({ weighIns: sparse, currentKcalTarget: 2150, targets: NUTRITION_TARGETS }).weeksUsed).toBe(3);
    const tooSparse = weeks([100, 99.8, 99.6]).filter((w) => w.date < '2026-11-23' || w.date > '2026-11-28');
    expect(decideAdjustment({ weighIns: tooSparse, currentKcalTarget: 2150, targets: NUTRITION_TARGETS }).action).toBe('insufficient_data');
  });
});
