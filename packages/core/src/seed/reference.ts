import type { DayTemplate, Equipment, NutritionTargets, RecipeRating, Substitution } from '../domain';
import { RECIPES } from './recipes';

/** Cibles du §2. Le levier d'ajustement est désormais les féculents. */
export const NUTRITION_TARGETS: NutritionTargets = { kcalMin: 2100, kcalMax: 2200, kcalFloor: 1900, proteinG: 180, fatG: 65 };

/** Objectif de poids du §1 (modifiable dans l'app) et poids de départ. */
export const DEFAULT_GOAL_KG = 85;
export const START_WEIGHT_KG = 100;

/** Deux structures de journée au choix ([Estimé], ~2 150 kcal / ~180 g P). */
export const DAY_TEMPLATES: DayTemplate[] = [
  {
    id: 'deux-repas',
    label: '2 repas + collation',
    slots: [
      { slot: 'dejeuner', kcal: 850, protein: 65 },
      { slot: 'collation', kcal: 450, protein: 50 },
      { slot: 'diner', kcal: 850, protein: 65 },
    ],
  },
  {
    // Petit-déjeuner léger (banane + shaker de whey ≈ 220 kcal) : les repas sont relevés pour rester au-dessus du plancher.
    id: 'trois-repas',
    label: 'Petit-déjeuner léger, 2 repas + collation',
    slots: [
      { slot: 'petit_dej', kcal: 230, protein: 25 },
      { slot: 'dejeuner', kcal: 750, protein: 60 },
      { slot: 'collation', kcal: 400, protein: 45 },
      { slot: 'diner', kcal: 750, protein: 55 },
    ],
  },
];

/** Choix de l'utilisateur (9/11/2026). */
export const DEFAULT_DAY_TEMPLATE_ID = 'trois-repas';

export const EQUIPMENT: Equipment[] = ['poele', 'casserole', 'micro_ondes', 'blender', 'air_fryer', 'four', 'plaque_induction'];

/** Ingrédients refusés (contexte §4 + réponses du 9/11/2026). */
export const EXCLUDED_INGREDIENT_KEYWORDS = ['tofu', 'crevette', 'coriandre', 'champignon', 'shiitake', 'saumon', 'cabillaud', 'colin', 'merlu', 'crabe', 'calamar', 'moule'];

/** Substitutions (§6). `ratio` s'applique au poids de l'ingrédient remplacé. */
export const SUBSTITUTIONS: Substitution[] = [
  // Dépannage
  { id: 'mirin-vinaigre-miel', from: 'mirin', to: [{ ingredientId: 'vinaigre-riz', ratio: 0.56 }, { ingredientId: 'miel', ratio: 0.28 }], kind: 'depannage', label: 'Mirin → vinaigre de riz + miel' },
  { id: 'curry-jaune-rouge', from: 'pate-curry-jaune', to: [{ ingredientId: 'pate-curry-rouge', ratio: 0.5 }], kind: 'depannage', label: 'Pâte de curry jaune → rouge à demi-dose' },
  { id: 'basilic-thai-classique', from: 'basilic-thai', to: [{ ingredientId: 'basilic', ratio: 1 }], kind: 'depannage', label: 'Basilic thaï → basilic classique' },
  { id: 'mangue-fruits-rouges', from: 'mangue-surgelee', to: [{ ingredientId: 'fruits-rouges-surgeles', ratio: 1 }], kind: 'depannage', label: 'Mangue surgelée → fruits rouges' },
  // Allègement
  { id: 'coco-light', from: 'lait-coco', to: [{ ingredientId: 'lait-coco-light', ratio: 1 }], kind: 'allegement', label: 'Lait de coco → coco light' },
  { id: 'creme-skyr', from: 'creme-fraiche-30', to: [{ ingredientId: 'skyr', ratio: 1 }], kind: 'allegement', label: 'Crème fraîche → skyr' },
  { id: 'friture-air-fryer', from: 'huile-friture-absorbee', to: [{ ingredientId: 'huile-neutre', ratio: 0.2 }], kind: 'allegement', label: 'Friture → air fryer', technique: 'Air fryer 200 °C, 12 à 15 min, légèrement huilé.' },
  { id: 'cuisse-filet', from: 'poulet-cuisse-desossee', to: [{ ingredientId: 'poulet-filet', ratio: 1 }], kind: 'allegement', label: 'Cuisse de poulet → filet' },
  { id: 'beurre-compote', from: 'beurre', to: [{ ingredientId: 'beurre', ratio: 0.5 }, { ingredientId: 'compote-sans-sucre', ratio: 0.75 }], kind: 'allegement', label: 'Moitié du beurre → compote' },
  { id: 'farine-whey', from: 'farine', to: [{ ingredientId: 'farine', ratio: 0.6 }, { ingredientId: 'whey', ratio: 0.4 }], kind: 'allegement', label: 'Une partie de la farine → whey' },
  { id: 'sucre-reduit', from: 'sucre', to: [{ ingredientId: 'sucre', ratio: 0.7 }], kind: 'allegement', label: 'Sucre réduit de 30 %' },
];

/** Toutes les recettes de départ plaisent à l'utilisateur ; la compagne ne les a pas encore goûtées (9/11/2026). */
export const SEED_RATINGS: RecipeRating[] = RECIPES.map((r) => ({
  recipeId: r.id, userLiked: true, partnerVerdict: 'a_tester', updatedAt: '2026-11-09',
}));
