import { describe, expect, it } from 'vitest';
import {
  addDays, compareDeficits, healthAverages, summarizeProgress, weightTrend, type DailyHealth, type WeighIn,
} from '../src';

const START = '2026-11-01';
/** Une pesée par jour : `from` kg au départ, puis `perWeek` kg perdus par semaine, avec un bruit fixe. */
const series = (days: number, from: number, perWeek: number, noise: number[] = [0]): WeighIn[] =>
  Array.from({ length: days }, (_, i) => ({ date: addDays(START, i), kg: Math.round((from - (perWeek * i) / 7 + noise[i % noise.length]!) * 10) / 10 }));

describe('tendance du poids', () => {
  it('lisse les pesées : moyenne des 7 derniers jours', () => {
    const t = weightTrend([{ date: START, kg: 100 }, { date: addDays(START, 1), kg: 101 }, { date: addDays(START, 2), kg: 99 }]);
    expect(t.map((p) => p.trendKg)).toEqual([100, 100.5, 100]);
  });

  it('une pesée de plus de 7 jours ne compte plus dans la tendance', () => {
    const t = weightTrend([{ date: START, kg: 110 }, { date: addDays(START, 7), kg: 100 }]);
    expect(t.at(-1)!.trendKg).toBe(100);
  });

  it('trie les pesées saisies dans le désordre', () => {
    const t = weightTrend([{ date: addDays(START, 2), kg: 99 }, { date: START, kg: 100 }]);
    expect(t.map((p) => p.date)).toEqual([START, addDays(START, 2)]);
  });
});

describe('bilan de progression', () => {
  it('sans pesée : rien à juger', () => {
    const s = summarizeProgress({ weighIns: [], goalKg: 85, today: START });
    expect(s).toMatchObject({ latest: null, trendKg: null, weeklyLossKg: null, etaDate: null, progress: 0 });
  });

  it('trop peu de pesées : pas de rythme, pas de date', () => {
    const s = summarizeProgress({ weighIns: series(4, 100, 0.5), goalKg: 85, today: addDays(START, 3) });
    expect(s.weeklyLossKg).toBeNull();
    expect(s.dailyDeficitKcal).toBeNull();
    expect(s.etaDate).toBeNull();
    expect(s.trendKg).not.toBeNull();
  });

  it('0,5 kg par semaine : rythme, déficit réel d’environ 550 kcal, date d’arrivée', () => {
    const weighIns = series(28, 100, 0.5, [0.3, -0.2, 0.1, -0.3, 0.2, 0, -0.1]);
    const s = summarizeProgress({ weighIns, goalKg: 85, today: addDays(START, 27), startKg: 100 });
    expect(s.weeklyLossKg).toBeGreaterThan(0.42);
    expect(s.weeklyLossKg).toBeLessThan(0.58);
    expect(s.dailyDeficitKcal).toBeGreaterThan(460);
    expect(s.dailyDeficitKcal).toBeLessThan(640);
    expect(s.lostKg).toBeGreaterThan(1.2);
    expect(s.remainingKg).toBeLessThan(15);
    expect(s.progress).toBeGreaterThan(0.08);
    expect(s.etaDate! > addDays(START, 27 + 20 * 7)).toBe(true);
    expect(s.etaDate! < addDays(START, 27 + 40 * 7)).toBe(true);
  });

  it('le poids ne baisse pas : pas de date d’arrivée, déficit nul ou négatif', () => {
    const s = summarizeProgress({ weighIns: series(21, 100, -0.2), goalKg: 85, today: addDays(START, 20) });
    expect(s.weeklyLossKg).toBeLessThan(0);
    expect(s.dailyDeficitKcal).toBeLessThan(0);
    expect(s.etaDate).toBeNull();
  });

  it('objectif atteint', () => {
    const s = summarizeProgress({ weighIns: series(14, 85.5, 0.5), goalKg: 85, today: addDays(START, 13), startKg: 100 });
    expect(s.goalReached).toBe(true);
    expect(s.remainingKg).toBe(0);
    expect(s.progress).toBe(1);
    expect(s.etaDate).toBeNull();
  });

  it('les pesées de plus de 28 jours ne pèsent plus sur le rythme', () => {
    const old = series(28, 105, 2); // perte rapide, il y a longtemps
    const recent: WeighIn[] = Array.from({ length: 28 }, (_, i) => ({ date: addDays(START, 40 + i), kg: 97 }));
    const s = summarizeProgress({ weighIns: [...old, ...recent], goalKg: 85, today: addDays(START, 67) });
    expect(Math.abs(s.weeklyLossKg!)).toBeLessThan(0.05);
  });
});

describe('activité et déficits', () => {
  const day = (i: number, steps?: number, expenditureKcal?: number): DailyHealth => ({
    date: addDays(START, i), source: 'manual', ...(steps === undefined ? {} : { steps }), ...(expenditureKcal === undefined ? {} : { expenditureKcal }),
  });

  it('moyennes sur 7 jours, sur les seuls jours renseignés', () => {
    const a = healthAverages([day(0, 20000, 4000), day(3, 8000), day(5, 10000, 2600), day(6, undefined, 2800)], addDays(START, 9));
    expect(a).toEqual({ steps: 9000, stepsDays: 2, expenditureKcal: 2700, expenditureDays: 2 });
  });

  it('aucune donnée : moyennes absentes', () => {
    expect(healthAverages([], START)).toEqual({ steps: null, stepsDays: 0, expenditureKcal: null, expenditureDays: 0 });
  });

  it('la dépense du bracelet se compare à la balance, elle ne change pas le budget', () => {
    expect(compareDeficits(550, 2900, 2130)).toEqual({ scaleKcal: 550, braceletKcal: 770, gapKcal: 220 });
    expect(compareDeficits(null, 2900, 2130)).toEqual({ scaleKcal: null, braceletKcal: 770, gapKcal: null });
    expect(compareDeficits(550, null, 2130)).toEqual({ scaleKcal: 550, braceletKcal: null, gapKcal: null });
  });
});
