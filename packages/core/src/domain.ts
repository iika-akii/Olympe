/**
 * Modèle de domaine Olympe : types purs, aucune dépendance React Native ni base de données.
 * Source des règles : docs/CONTEXTE_UTILISATEUR.md (les § cités renvoient à ce fichier).
 */

// ───────────────────────── Unités ─────────────────────────
/** Unités canoniques de stockage. */
export type CanonicalUnit = 'g' | 'ml' | 'piece';
/** Unités acceptées dans une recette, converties via `units.ts`. */
export type KitchenUnit = CanonicalUnit | 'c_a_soupe' | 'c_a_cafe';

export interface Quantity { value: number; unit: CanonicalUnit }
export interface KitchenQuantity { value: number; unit: KitchenUnit }

/** Ordre des rayons imposé par le §7. */
export const AISLES = [
  'volaille_boucherie',
  'fruits_legumes',
  'cremerie',
  'surgeles',
  'epicerie_asiatique',
  'epicerie_sucree',
  'placard',
] as const;
export type Aisle = (typeof AISLES)[number];

export const AISLE_LABELS: Record<Aisle, string> = {
  volaille_boucherie: 'Volaille et boucherie',
  fruits_legumes: 'Fruits et légumes',
  cremerie: 'Crèmerie',
  surgeles: 'Surgelés',
  epicerie_asiatique: 'Épicerie et rayon asiatique',
  epicerie_sucree: 'Épicerie sucrée',
  placard: 'Placard à vérifier',
};

export interface Macros { kcal: number; protein: number; fat: number; carbs: number }

// ───────────────────────── Ingrédients ─────────────────────────
/** Rôle d'un ingrédient : pilote la portion de la compagne (§4) et le moteur d'adaptation. */
export type IngredientRole = 'meat' | 'protein_other' | 'starch' | 'vegetable' | 'sauce' | 'fat' | 'sweet' | 'other';

export interface Ingredient {
  id: string;
  name: string;
  aisle: Aisle;
  /** Unité dans laquelle on achète et on compte l'ingrédient. */
  unit: CanonicalUnit;
  /** Conversion pièce → g (œuf, oignon, carré de roux). */
  gramsPerPiece?: number;
  /** Densité g/ml pour les liquides (défaut : 1). */
  densityGPerMl?: number;
  /** Conditionnements du commerce, dans `unit`. Vide = vrac (quantité exacte). */
  packages: number[];
  /** Valeurs pour 100 g. [Estimé] tant que `ciqualCode` est absent. */
  per100g: Macros;
  ciqualCode?: string;
  role: IngredientRole;
  /** Stock placard (§7) : retiré de la liste s'il est déjà en stock. */
  pantry: boolean;
  /** Alerte « piège » (§6). */
  trap?: string;
  freezable: boolean;
}

// ───────────────────────── Recettes ─────────────────────────
export type Cuisine = 'JP' | 'TH' | 'KR' | 'FR' | 'autre';
export type MealSlot = 'petit_dej' | 'dejeuner' | 'collation' | 'diner';
export type BatchMode = 'batch' | 'frais' | 'week_end' | 'veille';
/** `diete` = plat recommandé pour la diète ; `plaisir` = plat hors diète, à adapter. */
export type RecipeTag = 'diete' | 'plaisir' | 'week_end' | 'dessert' | 'rapide';
export type RecipeSource = 'seed' | 'import_jsonld' | 'import_ia' | 'manuel';
export type Equipment = 'poele' | 'casserole' | 'micro_ondes' | 'blender' | 'air_fryer' | 'four' | 'plaque_induction';

export interface RecipeLine {
  ingredientId: string;
  /** Quantité pour UNE portion utilisateur. */
  perServing: KitchenQuantity;
  /** Surcharge le rôle par défaut de l'ingrédient. */
  role?: IngredientRole;
  note?: string;
}

export interface Recipe {
  id: string;
  name: string;
  cuisine: Cuisine;
  slots: MealSlot[];
  tags: RecipeTag[];
  mode: BatchMode;
  source: RecipeSource;
  equipment: Equipment[];
  /** §5.3 : riz cuit = 3 jours. */
  maxFridgeDays: number;
  /** §5.5 : khao pad, yakimeshi. */
  needsDayOldRice: boolean;
  lines: RecipeLine[];
  steps: string[];
  /** Retours d'expérience (§6). */
  lessons: string[];
  /** Valeurs annoncées dans le contexte, pour contrôle de cohérence. */
  declared?: { kcal: number; protein: number };
}

/** Substitution d'allègement ou de dépannage (§6). `ratio` s'applique au poids de l'ingrédient d'origine. */
export interface Substitution {
  id: string;
  from: string;
  to: { ingredientId: string; ratio: number }[];
  kind: 'allegement' | 'depannage';
  label: string;
  technique?: string;
}

// ───────────────────────── Foyer ─────────────────────────
export type Eater = 'user' | 'partner';
/** §4 : 2/3 en général, 1/2 pour la viande. */
export const PARTNER_RATIO: Record<IngredientRole, number> = {
  meat: 0.5, protein_other: 2 / 3, starch: 2 / 3, vegetable: 2 / 3,
  sauce: 2 / 3, fat: 2 / 3, sweet: 2 / 3, other: 2 / 3,
};

export type PartnerVerdict = 'oui' | 'non' | 'a_tester';
export interface RecipeRating { recipeId: string; userLiked?: boolean; partnerVerdict: PartnerVerdict; note?: string; updatedAt: string }

// ───────────────────────── Journée et cibles ─────────────────────────
export type ISODate = string; // YYYY-MM-DD

export interface SlotTarget { slot: MealSlot; kcal: number; protein: number }
/** Deux modèles au choix : « 2 repas + collation » ou « 3 repas + collation ». */
export interface DayTemplate { id: string; label: string; slots: SlotTarget[] }

export interface NutritionTargets {
  kcalMin: number;   // 2100
  kcalMax: number;   // 2200
  kcalFloor: number; // 1900, alerte en dessous
  proteinG: number;  // 180
  fatG: number;      // 65
}

// ───────────────────────── Adaptation d'un plat ─────────────────────────
export type AdaptationMode = 'reajuster' | 'alleger' | 'compenser';

export interface AdaptedLine { ingredientId: string; grams: number; factor: number; role: IngredientRole }

export interface AdaptationResult {
  mode: AdaptationMode;
  recipeId: string;
  target: SlotTarget;
  before: Macros;
  after: Macros;
  lines: AdaptedLine[];
  /** Facteur appliqué par rôle (réajuster). */
  roleFactors: Partial<Record<IngredientRole, number>>;
  appliedSubstitutions: string[];
  /** Compenser : nouvelles cibles des autres créneaux de la journée. */
  otherSlots?: SlotTarget[];
  /** Informations pratiques (techniques, grammes de féculents à retirer). */
  notes: string[];
  warnings: string[];
}

// ───────────────────────── Planification et courses ─────────────────────────
export interface PlannedMeal {
  date: ISODate;
  slot: MealSlot;
  recipeId: string;
  eaters: Eater[];
  /** Jour de cuisson (session de batch). Défaut : `date`. Sert au rappel de congélation (§5.4). */
  cookDate?: ISODate;
}

export interface ShoppingUse { date: ISODate; slot: MealSlot; recipeId: string }
export interface ShoppingItem {
  ingredientId: string;
  name: string;
  aisle: Aisle;
  unit: CanonicalUnit;
  needed: number;
  toBuy: number;
  /** Conditionnements retenus (ex. [750] = 1 barquette de 750 g). Vide = vrac. */
  packs: number[];
  leftover: number;
  usedBy: ShoppingUse[];
  notes: string[];
}

// ───────────────────────── Suivi ─────────────────────────
export interface WeighIn { date: ISODate; kg: number }
export interface DailyHealth { date: ISODate; steps?: number; sleepMinutes?: number; source: 'health_connect' | 'manual' }

export type AdjustmentAction = 'hold' | 'lower' | 'raise' | 'insufficient_data';
export interface AdjustmentDecision {
  action: AdjustmentAction;
  weeklyLossKg: number | null;
  weeksUsed: number;
  newKcalTarget: number;
  deltaKcal: number;
  /** Levier = féculents : delta exprimé en grammes de riz cru par jour. */
  riceRawGramsPerDayDelta: number;
  reason: string;
}
