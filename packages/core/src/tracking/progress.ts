import { addDays, daysBetween } from '../dates';
import type { DailyHealth, ISODate, WeighIn } from '../domain';
import { round } from '../units';

/** Énergie d'un kilo de graisse corporelle. [Estimé] : valeur d'usage, à ±10 %. */
export const KCAL_PER_KG_FAT = 7700;
/** Fenêtre de la tendance affichée : moyenne des pesées des 7 derniers jours. */
export const TREND_WINDOW_DAYS = 7;
/** Rythme provisoire : pente sur 28 jours, dès 5 pesées étalées sur 10 jours au moins. */
export const PACE_WINDOW_DAYS = 28;
export const PACE_MIN_WEIGHINS = 5;
export const PACE_MIN_SPAN_DAYS = 10;

export interface WeightPoint { date: ISODate; kg: number; trendKg: number }

const byDate = (a: { date: ISODate }, b: { date: ISODate }) => a.date.localeCompare(b.date);

/**
 * Pesées triées, avec la tendance : moyenne des pesées des 7 derniers jours (jour compris).
 * On juge sur la tendance, jamais sur une pesée isolée (§2).
 */
export function weightTrend(weighIns: readonly WeighIn[]): WeightPoint[] {
  const sorted = [...weighIns].sort(byDate);
  return sorted.map((w, i) => {
    const window = sorted.slice(0, i + 1).filter((x) => daysBetween(x.date, w.date) < TREND_WINDOW_DAYS);
    return { date: w.date, kg: w.kg, trendKg: round(window.reduce((s, x) => s + x.kg, 0) / window.length, 2) };
  });
}

/** Pente en kg par semaine (négative = perte), par régression linéaire sur les pesées. */
function slopeKgPerWeek(points: readonly WeighIn[]): number {
  const xs = points.map((p) => daysBetween(points[0]!.date, p.date));
  const ys = points.map((p) => p.kg);
  const n = xs.length;
  const mx = xs.reduce((a, b) => a + b, 0) / n;
  const my = ys.reduce((a, b) => a + b, 0) / n;
  const den = xs.reduce((s, x) => s + (x - mx) ** 2, 0);
  return den === 0 ? 0 : (xs.reduce((s, x, i) => s + (x - mx) * (ys[i]! - my), 0) / den) * 7;
}

export interface ProgressInput {
  weighIns: readonly WeighIn[];
  goalKg: number;
  today: ISODate;
  /** Poids de départ. Défaut : la première pesée enregistrée. */
  startKg?: number;
}

export interface ProgressSummary {
  latest: WeighIn | null;
  /** Tendance du jour de la dernière pesée. */
  trendKg: number | null;
  startKg: number | null;
  /** Perdu depuis le départ, d'après la tendance (négatif = pris). */
  lostKg: number | null;
  /** Reste à perdre jusqu'à l'objectif (0 une fois atteint). */
  remainingKg: number | null;
  /** Part du chemin parcourue entre le départ et l'objectif, bornée à [0, 1]. */
  progress: number;
  goalReached: boolean;
  /** Perte en kg par semaine sur les 28 derniers jours (négatif = prise). `null` tant qu'il n'y a pas assez de pesées. */
  weeklyLossKg: number | null;
  /** Déficit réel moyen, déduit de la balance : c'est lui qui fait foi. [Estimé] */
  dailyDeficitKcal: number | null;
  /** Date à laquelle l'objectif serait atteint à ce rythme. `null` si le poids ne baisse pas. */
  etaDate: ISODate | null;
}

export function summarizeProgress(input: ProgressInput): ProgressSummary {
  const trend = weightTrend(input.weighIns);
  const last = trend.at(-1);
  if (!last) {
    return {
      latest: null, trendKg: null, startKg: input.startKg ?? null, lostKg: null, remainingKg: null, progress: 0,
      goalReached: false, weeklyLossKg: null, dailyDeficitKcal: null, etaDate: null,
    };
  }
  const startKg = input.startKg ?? trend[0]!.kg;
  const lostKg = round(startKg - last.trendKg, 1);
  const remainingKg = round(Math.max(0, last.trendKg - input.goalKg), 1);
  const span = startKg - input.goalKg;
  const progress = span <= 0 ? (remainingKg === 0 ? 1 : 0) : Math.min(1, Math.max(0, (startKg - last.trendKg) / span));

  const recent = trend.filter((p) => daysBetween(p.date, input.today) < PACE_WINDOW_DAYS && p.date <= input.today);
  const enough = recent.length >= PACE_MIN_WEIGHINS && daysBetween(recent[0]!.date, recent.at(-1)!.date) >= PACE_MIN_SPAN_DAYS;
  const weeklyLossKg = enough ? round(-slopeKgPerWeek(recent), 2) : null;
  const dailyDeficitKcal = weeklyLossKg === null ? null : Math.round((weeklyLossKg * KCAL_PER_KG_FAT) / 7);
  const etaDate = weeklyLossKg !== null && weeklyLossKg > 0 && remainingKg > 0
    ? addDays(last.date, Math.ceil((remainingKg / weeklyLossKg) * 7))
    : null;

  return {
    latest: { date: last.date, kg: last.kg }, trendKg: last.trendKg, startKg, lostKg, remainingKg, progress,
    goalReached: remainingKg === 0, weeklyLossKg, dailyDeficitKcal, etaDate,
  };
}

export interface HealthAverages {
  /** Moyenne des pas sur les jours renseignés de la fenêtre. */
  steps: number | null;
  stepsDays: number;
  /** Moyenne de la dépense affichée par le bracelet, sur les jours renseignés. */
  expenditureKcal: number | null;
  expenditureDays: number;
}

/** Moyennes d'activité sur les `windowDays` derniers jours (aujourd'hui compris). */
export function healthAverages(entries: readonly DailyHealth[], today: ISODate, windowDays = 7): HealthAverages {
  const inWindow = entries.filter((e) => e.date <= today && daysBetween(e.date, today) < windowDays);
  const mean = (values: number[]) => (values.length === 0 ? null : Math.round(values.reduce((a, b) => a + b, 0) / values.length));
  const steps = inWindow.flatMap((e) => (e.steps === undefined ? [] : [e.steps]));
  const expenditure = inWindow.flatMap((e) => (e.expenditureKcal === undefined ? [] : [e.expenditureKcal]));
  return { steps: mean(steps), stepsDays: steps.length, expenditureKcal: mean(expenditure), expenditureDays: expenditure.length };
}

export interface DeficitComparison {
  /** Déficit réel, d'après la balance. */
  scaleKcal: number | null;
  /** Déficit théorique : dépense du bracelet moins les calories du plan. Indicatif. */
  braceletKcal: number | null;
  /** Écart bracelet − balance. Positif : le bracelet surestime la dépense, ou l'assiette dépasse le plan. */
  gapKcal: number | null;
}

/**
 * Met côte à côte le déficit vu par la balance et celui vu par le bracelet.
 * La dépense du bracelet ne modifie jamais le budget calorique (§2) : elle n'est là que pour être comparée.
 */
export function compareDeficits(scaleDeficitKcal: number | null, braceletExpenditureKcal: number | null, plannedIntakeKcal: number): DeficitComparison {
  const braceletKcal = braceletExpenditureKcal === null ? null : Math.round(braceletExpenditureKcal - plannedIntakeKcal);
  const gapKcal = scaleDeficitKcal === null || braceletKcal === null ? null : braceletKcal - scaleDeficitKcal;
  return { scaleKcal: scaleDeficitKcal, braceletKcal, gapKcal };
}

/** Rythme visé (§2) : 0,4 à 0,5 kg par semaine. */
export const TARGET_PACE_KG_PER_WEEK = { min: 0.4, max: 0.5 } as const;

/**
 * D'où vient le rythme de la projection, du plus fiable au moins fiable :
 * - `balance` : la perte mesurée par les pesées ;
 * - `bracelet` : la dépense du bracelet moins les calories du plan (indicatif, tant que la balance ne peut pas trancher) ;
 * - `rythme_vise` : aucune donnée, on suppose que le plan tient le rythme visé.
 */
export type ProjectionBasis = 'balance' | 'bracelet' | 'rythme_vise';

export interface GoalProjection {
  basis: ProjectionBasis;
  fromDate: ISODate;
  fromKg: number;
  goalKg: number;
  /** Rythme retenu, en kg par semaine. Pour `rythme_vise` : le haut de la fourchette. */
  weeklyLossKg: number;
  dailyDeficitKcal: number;
  /** Date d'arrivée à ce rythme. */
  etaDate: ISODate;
  /** `rythme_vise` seulement : date d'arrivée au bas de la fourchette. */
  etaLatestDate: ISODate | null;
}

export interface ProjectionInput {
  fromDate: ISODate;
  /** Poids de départ de la projection : la tendance du jour, à défaut la dernière pesée ou le poids de départ. */
  fromKg: number;
  goalKg: number;
  /** Perte mesurée par la balance, en kg par semaine. `null` tant qu'il n'y a pas assez de pesées. */
  scaleWeeklyLossKg: number | null;
  /** Déficit théorique du bracelet (dépense moins plan), en kcal par jour. */
  braceletDeficitKcal: number | null;
}

const etaAt = (from: ISODate, remainingKg: number, weeklyLossKg: number) => addDays(from, Math.ceil((remainingKg / weeklyLossKg) * 7));

/**
 * Date à laquelle l'objectif serait atteint, selon le déficit estimé.
 * La balance fait foi dès qu'elle peut parler : si elle montre que le poids ne baisse pas, il n'y a pas de date,
 * même si le bracelet annonce un déficit. Renvoie `null` aussi quand l'objectif est déjà atteint.
 */
export function projectGoal(input: ProjectionInput): GoalProjection | null {
  const remainingKg = input.fromKg - input.goalKg;
  if (remainingKg <= 0) return null;
  const base = { fromDate: input.fromDate, fromKg: input.fromKg, goalKg: input.goalKg };

  if (input.scaleWeeklyLossKg !== null) {
    if (input.scaleWeeklyLossKg <= 0) return null;
    return {
      ...base, basis: 'balance', weeklyLossKg: input.scaleWeeklyLossKg,
      dailyDeficitKcal: Math.round((input.scaleWeeklyLossKg * KCAL_PER_KG_FAT) / 7),
      etaDate: etaAt(input.fromDate, remainingKg, input.scaleWeeklyLossKg), etaLatestDate: null,
    };
  }
  if (input.braceletDeficitKcal !== null && input.braceletDeficitKcal > 0) {
    const weeklyLossKg = round((input.braceletDeficitKcal * 7) / KCAL_PER_KG_FAT, 2);
    return {
      ...base, basis: 'bracelet', weeklyLossKg, dailyDeficitKcal: Math.round(input.braceletDeficitKcal),
      etaDate: etaAt(input.fromDate, remainingKg, weeklyLossKg), etaLatestDate: null,
    };
  }
  const { min, max } = TARGET_PACE_KG_PER_WEEK;
  return {
    ...base, basis: 'rythme_vise', weeklyLossKg: max, dailyDeficitKcal: Math.round((max * KCAL_PER_KG_FAT) / 7),
    etaDate: etaAt(input.fromDate, remainingKg, max), etaLatestDate: etaAt(input.fromDate, remainingKg, min),
  };
}
