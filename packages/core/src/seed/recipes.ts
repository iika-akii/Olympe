import type { KitchenUnit, Recipe, RecipeLine } from '../domain';

/**
 * Recettes de départ (§6 du contexte), quantités pour 1 portion utilisateur.
 * Les valeurs `declared` viennent du contexte ([Estimé] ±10 %). Le calcul réel passe par les ingrédients.
 */
const l = (ingredientId: string, value: number, unit: KitchenUnit = 'g', note?: string): RecipeLine =>
  note ? { ingredientId, perServing: { value, unit }, note } : { ingredientId, perServing: { value, unit } };

type Def = Pick<Recipe, 'id' | 'name' | 'cuisine' | 'slots' | 'lines'> & Partial<Recipe>;

const r = (d: Def): Recipe => ({
  tags: ['diete'],
  mode: 'frais',
  source: 'seed',
  equipment: ['poele', 'casserole', 'micro_ondes'],
  maxFridgeDays: 3,
  needsDayOldRice: false,
  steps: [],
  lessons: [],
  ...d,
});

const REPAS: Recipe['slots'] = ['dejeuner', 'diner'];

export const RECIPES: Recipe[] = [
  r({
    id: 'poulet-teriyaki', name: 'Poulet teriyaki, brocoli, edamame', cuisine: 'JP', slots: REPAS, mode: 'batch',
    declared: { kcal: 600, protein: 58 },
    lines: [l('poulet-filet', 180), l('riz-japonais', 60, 'g', 'pesé cru'), l('brocoli-surgele', 150), l('edamame-surgeles', 60),
      l('sauce-soja', 1, 'c_a_soupe'), l('mirin', 1, 'c_a_soupe'), l('miel', 5), l('huile-neutre', 0.25, 'c_a_cafe')],
    steps: ['Saisir le poulet en 2 fois à feu vif, le retirer.', 'Réduire soja, mirin et miel seuls à feu vif, sans eau.', 'Remettre le poulet et enrober.', 'Brocoli et edamame au micro-ondes.', 'Stocker la sauce avec le poulet, le riz à part.'],
    lessons: ["Ne pas ajouter d'eau dans la sauce teriyaki.", 'Sans mirin : 40 ml de vinaigre de riz + 20 g de miel en plus pour 4 portions.'],
  }),
  r({
    id: 'gyudon', name: 'Gyudon', cuisine: 'JP', slots: REPAS, declared: { kcal: 600, protein: 48 },
    lines: [l('boeuf-emince-maigre', 180), l('oignon', 0.5, 'piece'), l('sauce-soja', 1.5, 'c_a_soupe'), l('mirin', 1, 'c_a_soupe'),
      l('gingembre', 5), l('riz-japonais', 75), l('huile-neutre', 0.25, 'c_a_cafe')],
  }),
  r({
    id: 'oyakodon', name: 'Oyakodon', cuisine: 'JP', slots: REPAS, declared: { kcal: 670, protein: 55 },
    lines: [l('poulet-filet', 180), l('oeuf', 1, 'piece'), l('blanc-oeuf-liquide', 66, 'g', '2 blancs'), l('oignon', 0.5, 'piece'),
      l('sauce-soja', 1, 'c_a_soupe'), l('mirin', 1, 'c_a_soupe'), l('riz-japonais', 75)],
  }),
  r({
    id: 'curry-japonais', name: 'Curry japonais', cuisine: 'JP', slots: REPAS, mode: 'batch', declared: { kcal: 660, protein: 48 },
    lines: [l('poulet-filet', 180), l('pomme-de-terre', 100), l('carotte', 0.5, 'piece'), l('oignon', 0.5, 'piece'),
      l('roux-curry-japonais', 1, 'piece', '1 carré maximum'), l('riz-japonais', 65), l('huile-neutre', 0.25, 'c_a_cafe')],
  }),
  r({
    id: 'soboro-don', name: 'Soboro don', cuisine: 'JP', slots: REPAS, mode: 'batch', declared: { kcal: 640, protein: 58 },
    lines: [l('poulet-hache', 180), l('oeuf', 1, 'piece'), l('haricots-verts-surgeles', 100), l('sauce-soja', 1, 'c_a_soupe'),
      l('mirin', 0.5, 'c_a_soupe'), l('miel', 3), l('gingembre', 3), l('riz-japonais', 70)],
  }),
  r({
    id: 'yakimeshi', name: 'Yakimeshi (riz sauté)', cuisine: 'JP', slots: REPAS, mode: 'veille', needsDayOldRice: true, declared: { kcal: 680, protein: 55 },
    lines: [l('poulet-filet', 180), l('riz-japonais', 70, 'g', 'cuit la veille'), l('oeuf', 2, 'piece'), l('carotte', 0.5, 'piece'),
      l('ciboule', 15), l('sauce-soja', 1, 'c_a_soupe'), l('huile-neutre', 0.5, 'c_a_cafe')],
  }),
  r({
    id: 'curry-jaune-poulet', name: 'Curry jaune de poulet', cuisine: 'TH', slots: REPAS, mode: 'batch', declared: { kcal: 650, protein: 50 },
    lines: [l('poulet-filet', 180), l('lait-coco-light', 100, 'ml', '100 ml maximum'), l('poivron', 0.5, 'piece'), l('oignon', 0.5, 'piece'),
      l('pate-curry-jaune', 12), l('riz-thai', 70), l('nuoc-mam', 0.5, 'c_a_soupe'), l('huile-neutre', 0.25, 'c_a_cafe')],
  }),
  r({
    id: 'pad-kra-pao', name: 'Pad kra pao', cuisine: 'TH', slots: REPAS, declared: { kcal: 630, protein: 52 },
    lines: [l('poulet-hache', 200), l('haricots-verts-surgeles', 100), l('sauce-soja', 1, 'c_a_soupe'), l('sauce-huitre', 1, 'c_a_soupe'),
      l('basilic-thai', 10), l('ail', 2, 'piece'), l('sucre', 3), l('riz-thai', 75), l('huile-neutre', 0.5, 'c_a_cafe')],
  }),
  r({
    id: 'larb-gai', name: 'Larb gai', cuisine: 'TH', slots: REPAS, declared: { kcal: 570, protein: 50 },
    lines: [l('poulet-hache', 200), l('citron-vert', 1, 'piece'), l('nuoc-mam', 1, 'c_a_soupe'), l('menthe', 5),
      l('echalote', 1, 'piece'), l('riz-thai', 70)],
  }),
  r({
    id: 'boeuf-huitre-brocoli', name: 'Bœuf sauce huître et brocoli', cuisine: 'TH', slots: REPAS, mode: 'batch', declared: { kcal: 670, protein: 50 },
    lines: [l('rumsteak', 180), l('brocoli-surgele', 200), l('sauce-huitre', 1.5, 'c_a_soupe'), l('sauce-soja', 0.5, 'c_a_soupe'),
      l('ail', 1, 'piece'), l('fecule-mais', 3), l('riz-thai', 75), l('huile-neutre', 0.25, 'c_a_cafe')],
  }),
  r({
    id: 'poulet-gingembre', name: 'Poulet sauté au gingembre', cuisine: 'TH', slots: REPAS, declared: { kcal: 600, protein: 50 },
    lines: [l('poulet-filet', 180), l('gingembre', 10), l('oignon', 0.5, 'piece'), l('haricots-verts-surgeles', 100),
      l('sauce-huitre', 1, 'c_a_soupe'), l('sauce-soja', 0.5, 'c_a_soupe'), l('riz-thai', 75), l('huile-neutre', 0.5, 'c_a_cafe')],
  }),
  r({
    id: 'khao-pad', name: 'Khao pad', cuisine: 'TH', slots: REPAS, mode: 'veille', needsDayOldRice: true, declared: { kcal: 680, protein: 55 },
    lines: [l('poulet-filet', 180), l('riz-thai', 75, 'g', 'cuit la veille'), l('oeuf', 1, 'piece'), l('tomate', 1, 'piece'),
      l('oignon', 0.5, 'piece'), l('sauce-soja', 1, 'c_a_soupe'), l('nuoc-mam', 0.5, 'c_a_soupe'), l('huile-neutre', 0.5, 'c_a_cafe')],
  }),
  r({
    id: 'ramen-shoyu', name: 'Ramen shoyu au poulet', cuisine: 'JP', slots: REPAS, mode: 'week_end', tags: ['diete', 'week_end'], declared: { kcal: 650, protein: 50 },
    lines: [l('nouilles-ramen', 80), l('poulet-filet', 180), l('oeuf', 1, 'piece', 'mollet'), l('bouillon-cube', 1, 'piece'),
      l('sauce-soja', 1.5, 'c_a_soupe'), l('mirin', 0.5, 'c_a_soupe'), l('ciboule', 15)],
  }),
  r({
    id: 'karaage-air-fryer', name: 'Karaage à l’air fryer', cuisine: 'JP', slots: REPAS, mode: 'week_end', tags: ['diete', 'week_end'],
    equipment: ['air_fryer', 'casserole'], declared: { kcal: 700, protein: 50 },
    lines: [l('poulet-cuisse-desossee', 180), l('fecule-mais', 20), l('sauce-soja', 1, 'c_a_soupe'), l('gingembre', 5), l('ail', 1, 'piece'),
      l('huile-neutre', 1, 'c_a_cafe'), l('chou', 100), l('riz-japonais', 60)],
    steps: ['Mariner le poulet (soja, gingembre, ail) 30 min.', 'Enrober de fécule, huiler légèrement.', 'Air fryer 200 °C, 12 à 15 min en retournant à mi-cuisson.'],
  }),
  r({
    id: 'gyozas-poulet-chou', name: 'Gyozas poulet-chou (12)', cuisine: 'JP', slots: REPAS, mode: 'week_end', tags: ['diete', 'week_end'], declared: { kcal: 550, protein: 40 },
    lines: [l('poulet-hache', 150), l('chou', 80), l('feuilles-gyoza', 12, 'piece'), l('ciboule', 10), l('gingembre', 3),
      l('sauce-soja', 1, 'c_a_soupe', 'sauce de trempage'), l('vinaigre-riz', 1, 'c_a_soupe', 'sauce de trempage'), l('huile-neutre', 1, 'c_a_cafe')],
  }),
  r({
    id: 'overnight-oats', name: 'Overnight oats protéinés', cuisine: 'autre', slots: ['petit_dej'], mode: 'batch', maxFridgeDays: 3, declared: { kcal: 560, protein: 52 },
    lines: [l('flocons-avoine', 60), l('chia', 10), l('whey', 30), l('fromage-blanc-0', 150), l('lait-demi-ecreme', 100, 'ml'),
      l('fruits-rouges-surgeles', 50), l('miel', 10)],
  }),
  r({
    id: 'collation-skyr-whey', name: 'Skyr whey, citron, fruits rouges, spéculoos', cuisine: 'autre', slots: ['collation'], tags: ['diete', 'dessert', 'rapide'],
    lines: [l('skyr', 200), l('whey', 35, 'g', '30 à 45 g'), l('fruits-rouges-surgeles', 80), l('speculoos', 2, 'piece')],
    steps: ['Mélanger skyr et whey, ajouter un zeste de citron.', 'Fruits rouges et spéculoos émiettés par-dessus.'],
  }),
  r({
    id: 'verrine-cheesecake', name: 'Verrine cheesecake skyr-spéculoos', cuisine: 'autre', slots: ['collation'], tags: ['diete', 'dessert'], mode: 'veille',
    declared: { kcal: 260, protein: 22 },
    lines: [l('skyr', 200), l('speculoos', 2, 'piece'), l('fruits-rouges-surgeles', 80), l('miel', 5)],
  }),
  r({
    id: 'riz-au-lait-coco-mangue', name: 'Riz au lait coco-mangue protéiné', cuisine: 'TH', slots: ['collation'], tags: ['diete', 'dessert'], mode: 'batch',
    declared: { kcal: 330, protein: 25 },
    lines: [l('riz-japonais', 30), l('lait-demi-ecreme', 150, 'ml'), l('lait-coco-light', 50, 'ml'), l('whey', 20), l('mangue-surgelee', 80)],
  }),
  r({
    id: 'onigiri-thon-mayo', name: 'Onigiris thon-mayo (×2)', cuisine: 'JP', slots: ['collation'], tags: ['diete', 'rapide'], declared: { kcal: 350, protein: 30 },
    lines: [l('riz-japonais', 60), l('thon-naturel', 100), l('mayo-light', 15)],
  }),
  r({
    id: 'edamame-sales', name: 'Edamame salés', cuisine: 'JP', slots: ['collation'], tags: ['diete', 'rapide'], mode: 'batch', declared: { kcal: 180, protein: 17 },
    lines: [l('edamame-surgeles', 150)],
  }),

  // Plats « plaisir » (hors diète) : servent d'exemples au moteur d'adaptation.
  r({
    id: 'brownie', name: 'Brownie au chocolat (1 part sur 12)', cuisine: 'FR', slots: ['collation'], tags: ['plaisir', 'dessert', 'week_end'], mode: 'week_end',
    equipment: ['four', 'casserole'], maxFridgeDays: 4,
    lines: [l('chocolat-noir', 16.7), l('beurre', 10.4), l('sucre', 10), l('oeuf', 0.25, 'piece'), l('farine', 5)],
    steps: ['Fondre chocolat et beurre.', 'Ajouter sucre, œufs puis farine.', 'Four 180 °C, 20 à 25 min.'],
  }),
  r({
    id: 'korean-chicken', name: 'Korean fried chicken soja-miel-ail', cuisine: 'KR', slots: REPAS, tags: ['plaisir', 'week_end'], mode: 'week_end',
    lines: [l('poulet-cuisse-desossee', 200), l('fecule-mais', 30), l('huile-friture-absorbee', 15, 'ml'), l('sauce-soja', 1, 'c_a_soupe'),
      l('miel', 15), l('sucre', 5), l('ail', 1, 'piece'), l('riz-japonais', 70)],
  }),
];
