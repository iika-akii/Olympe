import type { ISODate, Macros, NutritionTargets, WeekPlan } from '../domain';
import { sumMacros } from '../nutrition/macros';

/**
 * État d'une journée planifiée, pour l'écran « Aujourd'hui ».
 * - `sous_plancher` : total planifié sous le plancher (§2), l'app alerte ;
 * - `a_completer` : un repas libre reste à choisir, le total n'est pas jugé ;
 * - `dans_le_plan` : au-dessus du plancher, rien à signaler.
 * Aucune règle n'existe au-dessus de la cible haute : on ne l'invente pas ici.
 */
export type DayStatus = 'sous_plancher' | 'a_completer' | 'dans_le_plan';

export interface DaySummary {
  date: ISODate;
  /** Macros planifiées de l'utilisateur, arrondies à l'unité (repas libres exclus). */
  macros: Macros;
  mealCount: number;
  hasFreeMeal: boolean;
  status: DayStatus;
  /** Part de la cible haute de calories, bornée à [0, 1]. */
  kcalProgress: number;
  /** Position du plancher sur la même échelle (≈ 0,86). */
  floorProgress: number;
  /** Part de la cible de protéines, bornée à [0, 1]. */
  proteinProgress: number;
}

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

export function daySummary(plan: WeekPlan, date: ISODate, targets: NutritionTargets): DaySummary {
  const meals = plan.meals.filter((m) => m.date === date);
  const total = sumMacros(meals.flatMap((m) => (m.userMacros ? [m.userMacros] : [])));
  const macros: Macros = {
    kcal: Math.round(total.kcal), protein: Math.round(total.protein), fat: Math.round(total.fat), carbs: Math.round(total.carbs),
  };
  const hasFreeMeal = plan.freeMeals.some((f) => f.date === date);
  const status: DayStatus = hasFreeMeal ? 'a_completer' : macros.kcal < targets.kcalFloor ? 'sous_plancher' : 'dans_le_plan';
  return {
    date,
    macros,
    mealCount: meals.length,
    hasFreeMeal,
    status,
    kcalProgress: clamp01(macros.kcal / targets.kcalMax),
    floorProgress: clamp01(targets.kcalFloor / targets.kcalMax),
    proteinProgress: clamp01(macros.protein / targets.proteinG),
  };
}
