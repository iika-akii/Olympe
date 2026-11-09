import type { AdjustmentDecision, ISODate, NutritionTargets, WeighIn } from '../domain';
import { round } from '../units';

export const MIN_WEEKS = 3;
export const MIN_WEIGHINS_PER_WEEK = 3;
const LOW_LOSS = 0.3;
const HIGH_LOSS = 0.7;
const LOWER_STEP = 150; // milieu de la fourchette 100-200 kcal
const RAISE_STEP = 100;
const KCAL_PER_G_RAW_RICE = 3.55;

/** Lundi de la semaine ISO d'une date. */
export function weekStart(date: ISODate): ISODate {
  const d = new Date(`${date}T00:00:00Z`);
  const day = (d.getUTCDay() + 6) % 7;
  d.setUTCDate(d.getUTCDate() - day);
  return d.toISOString().slice(0, 10);
}

export interface WeeklyMean { weekStart: ISODate; meanKg: number; count: number }

/** Moyennes hebdomadaires (seules les semaines avec assez de pesées comptent). */
export function weeklyMeans(weighIns: readonly WeighIn[]): WeeklyMean[] {
  const byWeek = new Map<ISODate, number[]>();
  for (const w of weighIns) {
    const k = weekStart(w.date);
    byWeek.set(k, [...(byWeek.get(k) ?? []), w.kg]);
  }
  return [...byWeek]
    .filter(([, v]) => v.length >= MIN_WEIGHINS_PER_WEEK)
    .map(([k, v]) => ({ weekStart: k, meanKg: v.reduce((a, b) => a + b, 0) / v.length, count: v.length }))
    .sort((a, b) => a.weekStart.localeCompare(b.weekStart));
}

/** Pente (kg/semaine) par régression linéaire sur les moyennes hebdo. */
function slopePerWeek(means: readonly WeeklyMean[]): number {
  const xs = means.map((m) => (Date.parse(m.weekStart) - Date.parse(means[0]!.weekStart)) / (7 * 86_400_000));
  const ys = means.map((m) => m.meanKg);
  const n = xs.length;
  const mx = xs.reduce((a, b) => a + b, 0) / n;
  const my = ys.reduce((a, b) => a + b, 0) / n;
  const num = xs.reduce((s, x, i) => s + (x - mx) * (ys[i]! - my), 0);
  const den = xs.reduce((s, x) => s + (x - mx) ** 2, 0);
  return den === 0 ? 0 : num / den;
}

export interface AdjustInput {
  weighIns: readonly WeighIn[];
  currentKcalTarget: number;
  targets: NutritionTargets;
  /** Seules les semaines qui commencent après le dernier ajustement comptent. */
  lastAdjustmentDate?: ISODate;
}

/**
 * Règles du §2. On juge sur les moyennes hebdomadaires des pesées du matin, jamais sur une pesée isolée,
 * et seulement après 3 semaines de données. Le levier est le féculent. Aucune entrée ne reçoit
 * les calories « brûlées » du Fitbit : elles n'entrent jamais dans le budget.
 */
export function decideAdjustment(input: AdjustInput): AdjustmentDecision {
  const means = weeklyMeans(input.weighIns).filter((m) => !input.lastAdjustmentDate || m.weekStart > input.lastAdjustmentDate);
  const hold = (action: AdjustmentDecision['action'], weeklyLossKg: number | null, reason: string): AdjustmentDecision => ({
    action, weeklyLossKg, weeksUsed: means.length, newKcalTarget: input.currentKcalTarget, deltaKcal: 0, riceRawGramsPerDayDelta: 0, reason,
  });

  if (means.length < MIN_WEEKS) {
    return hold('insufficient_data', null, `${means.length} semaine(s) exploitable(s) sur ${MIN_WEEKS} nécessaires.`);
  }
  const recent = means.slice(-MIN_WEEKS);
  const loss = round(-slopePerWeek(recent), 2);

  let delta = 0;
  let action: AdjustmentDecision['action'] = 'hold';
  let reason = `Perte de ${loss} kg/semaine, dans la fourchette ${LOW_LOSS}-${HIGH_LOSS}.`;
  if (loss < LOW_LOSS) {
    const allowed = Math.max(0, input.currentKcalTarget - input.targets.kcalFloor);
    delta = -Math.min(LOWER_STEP, allowed);
    if (delta === 0) {
      return hold('hold', loss, `Perte de ${loss} kg/semaine, mais la cible est déjà au plancher de ${input.targets.kcalFloor} kcal.`);
    }
    action = 'lower';
    reason = `Perte de ${loss} kg/semaine, sous ${LOW_LOSS} : baisse de ${-delta} kcal sur les féculents.`;
  } else if (loss > HIGH_LOSS) {
    delta = RAISE_STEP;
    action = 'raise';
    reason = `Perte de ${loss} kg/semaine, au-dessus de ${HIGH_LOSS} : hausse de ${delta} kcal pour protéger le muscle.`;
  }
  return {
    action,
    weeklyLossKg: loss,
    weeksUsed: recent.length,
    newKcalTarget: input.currentKcalTarget + delta,
    deltaKcal: delta,
    riceRawGramsPerDayDelta: Math.round(delta / KCAL_PER_G_RAW_RICE),
    reason,
  };
}
