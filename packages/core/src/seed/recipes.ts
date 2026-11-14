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
  minutes: 30,
  steps: [],
  lessons: [],
  ...d,
});

const REPAS: Recipe['slots'] = ['dejeuner', 'diner'];

// Cuisson du riz à la casserole (pas de cuiseur à riz). Le riz se pèse cru.
const RIZ_JAPONAIS = 'Riz : le rincer, puis le cuire à couvert et à feu doux 12 min dans 1,2 fois son volume d’eau. Laisser reposer 10 min hors du feu, sans soulever le couvercle.';
const RIZ_THAI = 'Riz : le rincer, puis le cuire à couvert et à feu doux 12 min dans 1,3 fois son volume d’eau. Laisser reposer 10 min hors du feu, sans soulever le couvercle.';
const RIZ_VEILLE = 'Sortir le riz cuit la veille du frigo et l’égrener à la main : froid et sec, il ne collera pas.';
const BATCH = 'Pour les gamelles : laisser tiédir, puis ranger le plat et le riz dans deux boîtes séparées.';

export const RECIPES: Recipe[] = [
  r({
    id: 'poulet-teriyaki', minutes: 25, name: 'Poulet teriyaki, brocoli, edamame', cuisine: 'JP', slots: REPAS, mode: 'batch',
    declared: { kcal: 600, protein: 58 },
    lines: [l('poulet-filet', 180), l('riz-japonais', 60, 'g', 'pesé cru'), l('brocoli-surgele', 150), l('edamame-surgeles', 60),
      l('sauce-soja', 1, 'c_a_soupe'), l('mirin', 1, 'c_a_soupe'), l('miel', 5), l('huile-neutre', 0.25, 'c_a_cafe')],
    steps: [RIZ_JAPONAIS, 'Couper le poulet en bouchées. Le saisir en 2 fois à feu vif dans l’huile, 3 min par fournée, puis le retirer.', 'Dans la même poêle, réduire sauce soja, mirin et miel seuls à feu vif, sans eau, jusqu’à ce que la sauce nappe la cuillère.', 'Remettre le poulet et l’enrober 1 min.', 'Brocoli et edamame encore surgelés : 4 à 5 min au micro-ondes, à couvert.', 'Pour les gamelles : ranger la sauce avec le poulet, le riz à part.'],
    lessons: ["Ne pas ajouter d'eau dans la sauce teriyaki.", 'Sans mirin : 40 ml de vinaigre de riz + 20 g de miel en plus pour 4 portions.'],
  }),
  r({
    id: 'gyudon', minutes: 20, name: 'Gyudon', cuisine: 'JP', slots: REPAS, declared: { kcal: 600, protein: 48 },
    lines: [l('boeuf-emince-maigre', 180), l('oignon', 0.5, 'piece'), l('sauce-soja', 1.5, 'c_a_soupe'), l('mirin', 1, 'c_a_soupe'),
      l('gingembre', 5), l('riz-japonais', 75), l('huile-neutre', 0.25, 'c_a_cafe')],
    steps: [
      RIZ_JAPONAIS,
      'Émincer l’oignon et le faire revenir 3 min dans l’huile.',
      'Ajouter sauce soja, mirin, gingembre râpé et 50 ml d’eau par portion. Laisser frémir 5 min : l’oignon doit être fondant.',
      'Ajouter le bœuf émincé et le cuire 2 à 3 min en séparant les tranches. Il doit rester tendre : ne pas prolonger.',
      'Servir sur le riz, avec le jus.',
    ],
  }),
  r({
    id: 'oyakodon', minutes: 20, name: 'Oyakodon', cuisine: 'JP', slots: REPAS, declared: { kcal: 670, protein: 55 },
    lines: [l('poulet-filet', 180), l('oeuf', 1, 'piece'), l('blanc-oeuf-liquide', 66, 'g', '2 blancs'), l('oignon', 0.5, 'piece'),
      l('sauce-soja', 1, 'c_a_soupe'), l('mirin', 1, 'c_a_soupe'), l('riz-japonais', 75)],
    steps: [
      RIZ_JAPONAIS,
      'Émincer l’oignon, couper le poulet en bouchées.',
      'Dans une petite poêle : sauce soja, mirin, 60 ml d’eau par portion et l’oignon. Laisser frémir 3 min.',
      'Ajouter le poulet et le cuire 6 à 8 min à feu moyen.',
      'Battre à peine l’œuf et les blancs, les verser en filet sur le poulet, couvrir 1 min. L’œuf doit rester baveux.',
      'Faire glisser le tout sur le riz.',
    ],
  }),
  r({
    id: 'curry-japonais', minutes: 40, name: 'Curry japonais', cuisine: 'JP', slots: REPAS, mode: 'batch', declared: { kcal: 660, protein: 48 },
    lines: [l('poulet-filet', 180), l('pomme-de-terre', 100), l('carotte', 0.5, 'piece'), l('oignon', 0.5, 'piece'),
      l('roux-curry-japonais', 1, 'piece', '1 carré maximum'), l('riz-japonais', 65), l('huile-neutre', 0.25, 'c_a_cafe')],
    steps: [
      'Couper le poulet, les pommes de terre, les carottes et les oignons en morceaux.',
      'Faire revenir l’oignon puis le poulet dans l’huile, 5 min.',
      'Ajouter carottes, pommes de terre et 150 ml d’eau par portion. Couvrir et laisser mijoter 15 min.',
      'Hors du feu, dissoudre le roux : 1 carré par portion, pas plus. Remettre 5 min à feu doux en remuant, le temps que la sauce épaississe.',
      RIZ_JAPONAIS,
      BATCH,
    ],
  }),
  r({
    id: 'soboro-don', minutes: 25, name: 'Soboro don', cuisine: 'JP', slots: REPAS, mode: 'batch', declared: { kcal: 640, protein: 58 },
    lines: [l('poulet-hache', 180), l('oeuf', 1, 'piece'), l('haricots-verts-surgeles', 100), l('sauce-soja', 1, 'c_a_soupe'),
      l('mirin', 0.5, 'c_a_soupe'), l('miel', 3), l('gingembre', 3), l('riz-japonais', 70)],
    steps: [
      RIZ_JAPONAIS,
      'Poêle chaude, sans matière grasse : cuire le poulet haché 5 min en l’émiettant à la spatule.',
      'Ajouter sauce soja, mirin, miel et gingembre râpé. Réduire jusqu’à ce qu’il ne reste plus de jus.',
      'À part, brouiller les œufs en remuant sans arrêt pour obtenir de petits grains.',
      'Haricots verts encore surgelés : 4 min au micro-ondes, à couvert.',
      'Dresser poulet, œuf et haricots en trois bandes sur le riz.',
      BATCH,
    ],
  }),
  r({
    id: 'yakimeshi', minutes: 15, name: 'Yakimeshi (riz sauté)', cuisine: 'JP', slots: REPAS, mode: 'veille', needsDayOldRice: true, declared: { kcal: 680, protein: 55 },
    lines: [l('poulet-filet', 180), l('riz-japonais', 70, 'g', 'cuit la veille'), l('oeuf', 2, 'piece'), l('carotte', 0.5, 'piece'),
      l('ciboule', 15), l('sauce-soja', 1, 'c_a_soupe'), l('huile-neutre', 0.5, 'c_a_cafe')],
    steps: [
      RIZ_VEILLE,
      'Couper le poulet en petits dés, la carotte en tout petits cubes, émincer la ciboule.',
      'Saisir le poulet dans la moitié de l’huile, à feu vif, 4 min. Le réserver.',
      'Dans le reste d’huile, brouiller les œufs, puis ajouter aussitôt le riz et la carotte. Faire sauter 4 min à feu vif, sans cesser de remuer.',
      'Remettre le poulet, verser la sauce soja sur le bord de la poêle, ajouter la ciboule. Encore 1 min.',
    ],
  }),
  r({
    id: 'curry-jaune-poulet', minutes: 30, name: 'Curry jaune de poulet', cuisine: 'TH', slots: REPAS, mode: 'batch', declared: { kcal: 650, protein: 50 },
    lines: [l('poulet-filet', 180), l('lait-coco-light', 100, 'ml', '100 ml maximum'), l('poivron', 0.5, 'piece'), l('oignon', 0.5, 'piece'),
      l('pate-curry-jaune', 12), l('riz-thai', 70), l('nuoc-mam', 0.5, 'c_a_soupe'), l('huile-neutre', 0.25, 'c_a_cafe')],
    steps: [
      RIZ_THAI,
      'Faire revenir la pâte de curry 1 min dans l’huile.',
      'Ajouter l’oignon émincé et le poulet en morceaux. Bien les enrober, 3 min.',
      'Verser le lait de coco light (100 ml par portion, pas plus) et 50 ml d’eau. Laisser mijoter 10 min.',
      'Ajouter le poivron en lanières et le nuoc-mâm. Encore 5 min.',
      BATCH,
    ],
  }),
  r({
    id: 'pad-kra-pao', minutes: 15, name: 'Pad kra pao', cuisine: 'TH', slots: REPAS, declared: { kcal: 630, protein: 52 },
    lines: [l('poulet-hache', 200), l('haricots-verts-surgeles', 100), l('sauce-soja', 1, 'c_a_soupe'), l('sauce-huitre', 1, 'c_a_soupe'),
      l('basilic-thai', 10), l('ail', 2, 'piece'), l('sucre', 3), l('riz-thai', 75), l('huile-neutre', 0.5, 'c_a_cafe')],
    steps: [
      RIZ_THAI,
      'Hacher l’ail. Couper les haricots verts, encore surgelés, en tronçons de 1 cm.',
      'Poêle très chaude : l’ail 20 secondes dans l’huile, puis le poulet haché, 4 min en l’émiettant.',
      'Ajouter les haricots verts, 2 min.',
      'Sauce soja, sauce huître et sucre : 1 min, le temps que le poulet les absorbe.',
      'Hors du feu, ajouter le basilic. Servir sur le riz.',
    ],
  }),
  r({
    id: 'larb-gai', minutes: 15, name: 'Larb gai', cuisine: 'TH', slots: REPAS, declared: { kcal: 570, protein: 50 },
    lines: [l('poulet-hache', 200), l('citron-vert', 1, 'piece'), l('nuoc-mam', 1, 'c_a_soupe'), l('menthe', 5),
      l('echalote', 1, 'piece'), l('riz-thai', 70)],
    steps: [
      RIZ_THAI,
      'Cuire le poulet haché 5 min dans 2 c. à soupe d’eau, sans matière grasse, en l’émiettant.',
      'Hors du feu, ajouter le jus du citron vert, le nuoc-mâm et l’échalote émincée.',
      'Ciseler la menthe et l’ajouter au dernier moment.',
      'Servir tiède, avec le riz.',
    ],
  }),
  r({
    id: 'boeuf-huitre-brocoli', minutes: 20, name: 'Bœuf sauce huître et brocoli', cuisine: 'TH', slots: REPAS, mode: 'batch', declared: { kcal: 670, protein: 50 },
    lines: [l('rumsteak', 180), l('brocoli-surgele', 200), l('sauce-huitre', 1.5, 'c_a_soupe'), l('sauce-soja', 0.5, 'c_a_soupe'),
      l('ail', 1, 'piece'), l('fecule-mais', 3), l('riz-thai', 75), l('huile-neutre', 0.25, 'c_a_cafe')],
    steps: [
      RIZ_THAI,
      'Couper le rumsteak en lamelles fines, en travers des fibres. Le mélanger avec la sauce soja et la fécule.',
      'Brocoli encore surgelé : 4 min au micro-ondes, à couvert.',
      'Saisir le bœuf en 2 fois dans l’huile, à feu très vif, 1 min par face. Le réserver.',
      'Dans la poêle : l’ail haché 20 secondes, puis le brocoli, la sauce huître et 2 c. à soupe d’eau. Remettre le bœuf 30 secondes.',
      BATCH,
    ],
  }),
  r({
    id: 'poulet-gingembre', minutes: 20, name: 'Poulet sauté au gingembre', cuisine: 'TH', slots: REPAS, declared: { kcal: 600, protein: 50 },
    lines: [l('poulet-filet', 180), l('gingembre', 10), l('oignon', 0.5, 'piece'), l('haricots-verts-surgeles', 100),
      l('sauce-huitre', 1, 'c_a_soupe'), l('sauce-soja', 0.5, 'c_a_soupe'), l('riz-thai', 75), l('huile-neutre', 0.5, 'c_a_cafe')],
    steps: [
      RIZ_THAI,
      'Couper le poulet en lamelles, le gingembre en fins bâtonnets, émincer l’oignon.',
      'Saisir le poulet dans l’huile, à feu vif, 4 min. Le réserver.',
      'Gingembre et oignon 2 min, puis les haricots verts encore surgelés, 3 min.',
      'Remettre le poulet avec la sauce huître et la sauce soja, 1 min.',
    ],
  }),
  r({
    id: 'khao-pad', minutes: 15, name: 'Khao pad', cuisine: 'TH', slots: REPAS, mode: 'veille', needsDayOldRice: true, declared: { kcal: 680, protein: 55 },
    lines: [l('poulet-filet', 180), l('riz-thai', 75, 'g', 'cuit la veille'), l('oeuf', 1, 'piece'), l('tomate', 1, 'piece'),
      l('oignon', 0.5, 'piece'), l('sauce-soja', 1, 'c_a_soupe'), l('nuoc-mam', 0.5, 'c_a_soupe'), l('huile-neutre', 0.5, 'c_a_cafe')],
    steps: [
      RIZ_VEILLE,
      'Couper le poulet en dés, émincer l’oignon, couper la tomate en quartiers.',
      'Saisir le poulet dans l’huile 4 min, ajouter l’oignon 1 min.',
      'Pousser le tout sur le côté, brouiller l’œuf dans l’espace libre, puis mélanger.',
      'Ajouter le riz, la sauce soja et le nuoc-mâm. Faire sauter 3 min à feu vif.',
      'Ajouter la tomate 1 min, juste pour la chauffer.',
    ],
  }),
  r({
    id: 'ramen-shoyu', minutes: 45, name: 'Ramen shoyu au poulet', cuisine: 'JP', slots: REPAS, mode: 'week_end', tags: ['diete', 'week_end'], declared: { kcal: 650, protein: 50 },
    lines: [l('nouilles-ramen', 80), l('poulet-filet', 180), l('oeuf', 1, 'piece', 'mollet'), l('bouillon-cube', 1, 'piece'),
      l('sauce-soja', 1.5, 'c_a_soupe'), l('mirin', 0.5, 'c_a_soupe'), l('ciboule', 15)],
    steps: [
      'Œuf mollet : 6 min 30 dans l’eau bouillante, puis sous l’eau froide. L’écaler.',
      'Bouillon : 400 ml d’eau par portion avec le cube. Y pocher le filet de poulet entier 12 min, à frémissement, puis le retirer et l’émincer.',
      'Assaisonner le bouillon avec la sauce soja et le mirin.',
      'Cuire les nouilles à part, le temps indiqué sur le paquet. Les égoutter.',
      'Dans le bol : les nouilles, le bouillon brûlant, le poulet, l’œuf coupé en deux, la ciboule émincée.',
    ],
  }),
  r({
    id: 'karaage-air-fryer', minutes: 40, name: 'Karaage à l’air fryer', cuisine: 'JP', slots: REPAS, mode: 'week_end', tags: ['diete', 'week_end'],
    equipment: ['air_fryer', 'casserole'], declared: { kcal: 700, protein: 50 },
    lines: [l('poulet-cuisse-desossee', 180), l('fecule-mais', 20), l('sauce-soja', 1, 'c_a_soupe'), l('gingembre', 5), l('ail', 1, 'piece'),
      l('huile-neutre', 1, 'c_a_cafe'), l('chou', 100), l('riz-japonais', 60)],
    steps: ['Couper le poulet en bouchées et le mariner 30 min avec la sauce soja, le gingembre râpé et l’ail haché.', RIZ_JAPONAIS, 'Égoutter le poulet, l’enrober de fécule, le huiler légèrement.', 'Air fryer à 200 °C, 12 à 15 min, en retournant à mi-cuisson.', 'Servir avec le chou émincé très fin et le riz.'],
  }),
  r({
    id: 'gyozas-poulet-chou', minutes: 60, name: 'Gyozas poulet-chou (12)', cuisine: 'JP', slots: REPAS, mode: 'week_end', tags: ['diete', 'week_end'], declared: { kcal: 550, protein: 40 },
    lines: [l('poulet-hache', 150), l('chou', 80), l('feuilles-gyoza', 12, 'piece'), l('ciboule', 10), l('gingembre', 3),
      l('sauce-soja', 1, 'c_a_soupe', 'sauce de trempage'), l('vinaigre-riz', 1, 'c_a_soupe', 'sauce de trempage'), l('huile-neutre', 1, 'c_a_cafe')],
    steps: [
      'Hacher finement le chou, le saler, attendre 10 min, puis le presser dans les mains pour en retirer l’eau.',
      'Mélanger le poulet haché, le chou, la ciboule émincée et le gingembre râpé.',
      'Poser une cuillère à café de farce au centre de chaque feuille. Mouiller le bord, plier en deux et plisser pour souder.',
      'Poêle huilée, feu moyen : dorer le dessous des gyozas 2 min.',
      'Verser 50 ml d’eau, couvrir 5 min, puis découvrir jusqu’à ce que l’eau soit évaporée.',
      'Sauce de trempage : sauce soja et vinaigre de riz.',
    ],
  }),
  r({
    id: 'banane-shaker-whey', minutes: 2, name: 'Banane + shaker de whey', cuisine: 'autre', slots: ['petit_dej'], tags: ['diete', 'rapide'],
    lines: [l('banane', 1, 'piece'), l('whey', 30, 'g', "dans l'eau")],
    steps: ["Shaker : 30 g de whey dans 250 ml d'eau.", 'Une banane.'],
  }),
  r({
    id: 'overnight-oats', minutes: 10, name: 'Overnight oats protéinés', cuisine: 'autre', slots: ['petit_dej'], mode: 'batch', maxFridgeDays: 3, declared: { kcal: 560, protein: 52 },
    lines: [l('flocons-avoine', 60), l('chia', 10), l('whey', 30), l('fromage-blanc-0', 150), l('lait-demi-ecreme', 100, 'ml'),
      l('fruits-rouges-surgeles', 50), l('miel', 10)],
    steps: [
      'Délayer la whey dans le lait.',
      'Ajouter les flocons d’avoine, le chia, le fromage blanc et le miel. Mélanger.',
      'Poser les fruits rouges encore surgelés par-dessus.',
      'Fermer le bocal et le laisser une nuit au frigo. Se garde 3 jours.',
    ],
  }),
  r({
    id: 'collation-skyr-whey', minutes: 3, name: 'Skyr whey, citron, fruits rouges, spéculoos', cuisine: 'autre', slots: ['collation'], tags: ['diete', 'dessert', 'rapide'],
    lines: [l('skyr', 200), l('whey', 35, 'g', '30 à 45 g'), l('fruits-rouges-surgeles', 80), l('speculoos', 2, 'piece')],
    steps: ['Mélanger skyr et whey, ajouter un zeste de citron.', 'Fruits rouges et spéculoos émiettés par-dessus.'],
  }),
  r({
    id: 'verrine-cheesecake', minutes: 10, name: 'Verrine cheesecake skyr-spéculoos', cuisine: 'autre', slots: ['collation'], tags: ['diete', 'dessert'], mode: 'veille',
    declared: { kcal: 260, protein: 22 },
    lines: [l('skyr', 200), l('speculoos', 2, 'piece'), l('fruits-rouges-surgeles', 80), l('miel', 5)],
    steps: [
      'Émietter les spéculoos au fond de la verrine.',
      'Mélanger le skyr et le miel, verser par-dessus.',
      'Réchauffer les fruits rouges 1 min au micro-ondes, les verser sur le skyr.',
      'Au frigo jusqu’au lendemain.',
    ],
  }),
  r({
    id: 'riz-au-lait-coco-mangue', minutes: 35, name: 'Riz au lait coco-mangue protéiné', cuisine: 'TH', slots: ['collation'], tags: ['diete', 'dessert'], mode: 'batch',
    declared: { kcal: 330, protein: 25 },
    lines: [l('riz-japonais', 30), l('lait-demi-ecreme', 150, 'ml'), l('lait-coco-light', 50, 'ml'), l('whey', 20), l('mangue-surgelee', 80)],
    steps: [
      'Dans une casserole : le riz non rincé, le lait et le lait de coco. Porter à frémissement.',
      'Cuire 25 min à feu très doux, en remuant souvent.',
      'Laisser tiédir 10 min avant d’incorporer la whey : trop chaud, elle fait des grumeaux.',
      'Ajouter la mangue en dés. Au frigo.',
    ],
  }),
  r({
    id: 'onigiri-thon-mayo', minutes: 15, name: 'Onigiris thon-mayo (×2)', cuisine: 'JP', slots: ['collation'], tags: ['diete', 'rapide'], declared: { kcal: 350, protein: 30 },
    lines: [l('riz-japonais', 60), l('thon-naturel', 100), l('mayo-light', 15)],
    steps: [
      RIZ_JAPONAIS,
      'Égoutter le thon, le mélanger à la mayonnaise.',
      'Mains mouillées et légèrement salées : aplatir la moitié du riz tiède dans la paume, poser la moitié du thon au centre, refermer et former un triangle.',
      'Recommencer pour le second onigiri.',
    ],
  }),
  r({
    id: 'edamame-sales', minutes: 8, name: 'Edamame salés', cuisine: 'JP', slots: ['collation'], tags: ['diete', 'rapide'], mode: 'batch', declared: { kcal: 180, protein: 17 },
    lines: [l('edamame-surgeles', 150)],
    steps: [
      'Plonger les edamame encore surgelés 4 min dans l’eau bouillante salée, ou 3 min au micro-ondes à couvert.',
      'Égoutter et saler. Se mangent tièdes ou froids.',
    ],
  }),

  // Plats « plaisir » (hors diète) : servent d'exemples au moteur d'adaptation.
  r({
    id: 'brownie', minutes: 45, name: 'Brownie au chocolat (1 part sur 12)', cuisine: 'FR', slots: ['collation'], tags: ['plaisir', 'dessert', 'week_end'], mode: 'week_end',
    equipment: ['four', 'casserole'], maxFridgeDays: 4,
    lines: [l('chocolat-noir', 16.7), l('beurre', 10.4), l('sucre', 10), l('oeuf', 0.25, 'piece'), l('farine', 5)],
    steps: ['Fondre chocolat et beurre.', 'Ajouter sucre, œufs puis farine.', 'Four 180 °C, 20 à 25 min.'],
  }),
  r({
    id: 'korean-chicken', minutes: 50, name: 'Korean fried chicken soja-miel-ail', cuisine: 'KR', slots: REPAS, tags: ['plaisir', 'week_end'], mode: 'week_end',
    lines: [l('poulet-cuisse-desossee', 200), l('fecule-mais', 30), l('huile-friture-absorbee', 15, 'ml'), l('sauce-soja', 1, 'c_a_soupe'),
      l('miel', 15), l('sucre', 5), l('ail', 1, 'piece'), l('riz-japonais', 70)],
    steps: [
      RIZ_JAPONAIS,
      'Couper le poulet en bouchées, le saler, l’enrober de fécule.',
      'Le frire 5 min dans l’huile à 170 °C, l’égoutter, puis le replonger 2 min à 180 °C pour le croustillant.',
      'Sauce : sauce soja, miel, sucre et ail haché. Réduire 2 min, jusqu’à ce qu’elle nappe.',
      'Hors du feu, enrober le poulet de sauce. Servir aussitôt.',
    ],
  }),
];
