import type { Ingredient } from '../domain';

/**
 * Ingrédients de départ. Valeurs nutritionnelles pour 100 g : [Estimé], ordre de grandeur CIQUAL,
 * à remplacer par la table CIQUAL officielle (champ `ciqualCode`).
 */
type Def = Omit<Ingredient, 'freezable' | 'pantry' | 'packages'> & Partial<Pick<Ingredient, 'freezable' | 'pantry' | 'packages'>>;

const m = (kcal: number, protein: number, fat: number, carbs: number) => ({ kcal, protein, fat, carbs });

const defs: Def[] = [
  // Volaille et boucherie
  { id: 'poulet-filet', name: 'Filet de poulet', aisle: 'volaille_boucherie', unit: 'g', packages: [750], per100g: m(110, 23.5, 1.5, 0), role: 'meat', freezable: true },
  { id: 'poulet-hache', name: 'Poulet haché', aisle: 'volaille_boucherie', unit: 'g', packages: [500], per100g: m(145, 20, 7, 0), role: 'meat', freezable: true },
  { id: 'poulet-cuisse-desossee', name: 'Cuisses de poulet désossées', aisle: 'volaille_boucherie', unit: 'g', packages: [600], per100g: m(150, 19, 8, 0), role: 'meat', freezable: true },
  { id: 'boeuf-emince-maigre', name: 'Bœuf émincé maigre', aisle: 'volaille_boucherie', unit: 'g', packages: [400], per100g: m(125, 21, 4.5, 0), role: 'meat', freezable: true },
  { id: 'rumsteak', name: 'Rumsteak', aisle: 'volaille_boucherie', unit: 'g', packages: [400], per100g: m(125, 22, 4, 0), role: 'meat', freezable: true },

  // Fruits et légumes
  { id: 'banane', name: 'Banane', aisle: 'fruits_legumes', unit: 'piece', gramsPerPiece: 120, per100g: m(90, 1.1, 0.3, 20), role: 'vegetable' },
  { id: 'pomme-de-terre', name: 'Pomme de terre', aisle: 'fruits_legumes', unit: 'g', per100g: m(80, 2, 0.1, 17), role: 'starch' },
  { id: 'carotte', name: 'Carotte', aisle: 'fruits_legumes', unit: 'piece', gramsPerPiece: 100, per100g: m(36, 0.8, 0.2, 7.6), role: 'vegetable' },
  { id: 'oignon', name: 'Oignon', aisle: 'fruits_legumes', unit: 'piece', gramsPerPiece: 120, per100g: m(40, 1.2, 0.2, 8), role: 'vegetable' },
  { id: 'echalote', name: 'Échalote', aisle: 'fruits_legumes', unit: 'piece', gramsPerPiece: 30, per100g: m(72, 2.5, 0.1, 15), role: 'vegetable' },
  { id: 'ail', name: 'Ail', aisle: 'fruits_legumes', unit: 'piece', gramsPerPiece: 5, per100g: m(130, 6, 0.5, 25), role: 'other', pantry: true },
  { id: 'gingembre', name: 'Gingembre frais', aisle: 'fruits_legumes', unit: 'g', per100g: m(80, 1.8, 0.8, 15), role: 'other' },
  { id: 'ciboule', name: 'Ciboule', aisle: 'fruits_legumes', unit: 'g', packages: [100], per100g: m(30, 1.8, 0.2, 5), role: 'vegetable' },
  { id: 'poivron', name: 'Poivron', aisle: 'fruits_legumes', unit: 'piece', gramsPerPiece: 150, per100g: m(30, 1, 0.3, 5), role: 'vegetable' },
  { id: 'tomate', name: 'Tomate', aisle: 'fruits_legumes', unit: 'piece', gramsPerPiece: 120, per100g: m(20, 0.9, 0.2, 3), role: 'vegetable' },
  { id: 'chou', name: 'Chou blanc', aisle: 'fruits_legumes', unit: 'g', packages: [800], per100g: m(25, 1.3, 0.2, 4), role: 'vegetable' },
  { id: 'citron-vert', name: 'Citron vert', aisle: 'fruits_legumes', unit: 'piece', gramsPerPiece: 30, per100g: m(30, 0.5, 0.2, 8), role: 'other' },
  { id: 'menthe', name: 'Menthe fraîche', aisle: 'fruits_legumes', unit: 'g', packages: [30], per100g: m(50, 3.5, 0.7, 6), role: 'other' },
  { id: 'basilic', name: 'Basilic', aisle: 'fruits_legumes', unit: 'g', packages: [30], per100g: m(25, 3, 0.6, 2), role: 'other' },
  { id: 'basilic-thai', name: 'Basilic thaï', aisle: 'fruits_legumes', unit: 'g', packages: [30], per100g: m(25, 3, 0.6, 2), role: 'other' },

  // Crèmerie
  { id: 'oeuf', name: 'Œuf', aisle: 'cremerie', unit: 'piece', gramsPerPiece: 50, packages: [6, 12], per100g: m(140, 12.5, 9.7, 0.7), role: 'protein_other' },
  { id: 'blanc-oeuf-liquide', name: "Blanc d'œuf liquide", aisle: 'cremerie', unit: 'g', packages: [500], per100g: m(48, 10.5, 0.2, 0.7), role: 'protein_other' },
  { id: 'skyr', name: 'Skyr nature', aisle: 'cremerie', unit: 'g', packages: [450], per100g: m(60, 10, 0.2, 4), role: 'protein_other' },
  { id: 'fromage-blanc-0', name: 'Fromage blanc 0 %', aisle: 'cremerie', unit: 'g', packages: [1000], per100g: m(46, 7.5, 0.1, 4), role: 'protein_other' },
  { id: 'lait-demi-ecreme', name: 'Lait demi-écrémé', aisle: 'cremerie', unit: 'ml', densityGPerMl: 1.03, packages: [1000], per100g: m(46, 3.3, 1.6, 4.8), role: 'other' },
  { id: 'beurre', name: 'Beurre doux', aisle: 'cremerie', unit: 'g', packages: [250], per100g: m(745, 0.7, 82, 0.6), role: 'fat' },
  { id: 'creme-fraiche-30', name: 'Crème fraîche 30 %', aisle: 'cremerie', unit: 'g', packages: [200], per100g: m(300, 2.3, 30, 3), role: 'fat', trap: 'Crème entière : préférer le skyr ou une crème légère.' },

  // Surgelés
  { id: 'brocoli-surgele', name: 'Brocoli surgelé', aisle: 'surgeles', unit: 'g', packages: [1000], per100g: m(30, 3, 0.4, 3), role: 'vegetable' },
  { id: 'haricots-verts-surgeles', name: 'Haricots verts surgelés', aisle: 'surgeles', unit: 'g', packages: [1000], per100g: m(30, 2, 0.2, 4), role: 'vegetable' },
  { id: 'edamame-surgeles', name: 'Edamame écossés surgelés', aisle: 'surgeles', unit: 'g', packages: [500], per100g: m(125, 11, 5.5, 6), role: 'protein_other' },
  { id: 'mangue-surgelee', name: 'Mangue surgelée', aisle: 'surgeles', unit: 'g', packages: [500], per100g: m(65, 0.6, 0.3, 15), role: 'vegetable' },
  { id: 'fruits-rouges-surgeles', name: 'Fruits rouges surgelés', aisle: 'surgeles', unit: 'g', packages: [500], per100g: m(45, 1, 0.3, 7), role: 'vegetable' },

  // Épicerie et rayon asiatique
  { id: 'riz-japonais', name: 'Riz rond japonais', aisle: 'epicerie_asiatique', unit: 'g', packages: [1000], per100g: m(355, 7, 0.6, 78), role: 'starch', pantry: true },
  { id: 'riz-thai', name: 'Riz thaï', aisle: 'epicerie_asiatique', unit: 'g', packages: [1000], per100g: m(355, 7, 0.7, 79), role: 'starch', pantry: true },
  { id: 'nouilles-ramen', name: 'Nouilles à ramen', aisle: 'epicerie_asiatique', unit: 'g', packages: [300], per100g: m(350, 11, 1.5, 72), role: 'starch' },
  { id: 'feuilles-gyoza', name: 'Feuilles à gyoza', aisle: 'epicerie_asiatique', unit: 'piece', gramsPerPiece: 6, packages: [30], per100g: m(280, 8, 1, 58), role: 'starch' },
  { id: 'thon-naturel', name: 'Thon au naturel (égoutté)', aisle: 'epicerie_asiatique', unit: 'g', packages: [112], per100g: m(110, 25, 1, 0), role: 'protein_other' },
  { id: 'mayo-light', name: 'Mayonnaise allégée', aisle: 'epicerie_asiatique', unit: 'g', packages: [235], per100g: m(300, 1, 30, 6), role: 'fat' },
  { id: 'lait-coco-light', name: 'Lait de coco light', aisle: 'epicerie_asiatique', unit: 'ml', packages: [400], per100g: m(75, 0.7, 7, 2), role: 'fat' },
  { id: 'lait-coco', name: 'Lait de coco classique', aisle: 'epicerie_asiatique', unit: 'ml', packages: [400], per100g: m(180, 1.6, 18, 3), role: 'fat', trap: 'Lait de coco classique : environ +60 kcal par portion par rapport au light.' },
  { id: 'sauce-soja', name: 'Sauce soja', aisle: 'placard', unit: 'ml', densityGPerMl: 1.1, packages: [500], per100g: m(55, 8, 0, 5), role: 'sauce', pantry: true },
  { id: 'mirin', name: 'Mirin', aisle: 'placard', unit: 'ml', densityGPerMl: 1.2, packages: [300], per100g: m(230, 0.2, 0, 43), role: 'sauce', pantry: true },
  { id: 'sauce-huitre', name: 'Sauce huître', aisle: 'placard', unit: 'ml', densityGPerMl: 1.2, packages: [500], per100g: m(100, 2, 0.2, 22), role: 'sauce', pantry: true },
  { id: 'nuoc-mam', name: 'Nuoc-mâm', aisle: 'placard', unit: 'ml', densityGPerMl: 1.2, packages: [500], per100g: m(35, 5, 0, 3.5), role: 'sauce', pantry: true },
  { id: 'vinaigre-riz', name: 'Vinaigre de riz', aisle: 'placard', unit: 'ml', packages: [500], per100g: m(20, 0, 0, 1), role: 'sauce', pantry: true },
  { id: 'pate-curry-jaune', name: 'Pâte de curry jaune', aisle: 'placard', unit: 'g', packages: [112], per100g: m(130, 3, 6, 15), role: 'sauce', pantry: true },
  { id: 'pate-curry-rouge', name: 'Pâte de curry rouge', aisle: 'placard', unit: 'g', packages: [112], per100g: m(130, 3, 6, 15), role: 'sauce', pantry: true },
  { id: 'roux-curry-japonais', name: 'Roux de curry japonais (carré)', aisle: 'placard', unit: 'piece', gramsPerPiece: 18, packages: [12], per100g: m(510, 6, 35, 45), role: 'sauce', pantry: true, trap: 'Roux de curry japonais : 1 carré maximum par portion.' },
  { id: 'bouillon-cube', name: 'Bouillon de volaille (cube)', aisle: 'placard', unit: 'piece', gramsPerPiece: 10, packages: [10], per100g: m(250, 10, 15, 20), role: 'sauce', pantry: true },
  { id: 'fecule-mais', name: 'Fécule de maïs', aisle: 'placard', unit: 'g', packages: [400], per100g: m(350, 0.3, 0.1, 87), role: 'starch', pantry: true },
  { id: 'huile-neutre', name: 'Huile neutre', aisle: 'placard', unit: 'ml', densityGPerMl: 0.92, packages: [1000], per100g: m(900, 0, 100, 0), role: 'fat', pantry: true, trap: 'Huile : 1 c. à café pour 4 portions.' },
  { id: 'huile-friture-absorbee', name: 'Huile de friture (absorbée)', aisle: 'placard', unit: 'ml', densityGPerMl: 0.92, packages: [1000], per100g: m(900, 0, 100, 0), role: 'fat', pantry: true, trap: 'Friture : 10 à 15 g d’huile absorbée par portion. Air fryer conseillé.' },

  // Épicerie sucrée
  { id: 'flocons-avoine', name: "Flocons d'avoine", aisle: 'epicerie_sucree', unit: 'g', packages: [500], per100g: m(370, 13, 7, 59), role: 'starch' },
  { id: 'chia', name: 'Graines de chia', aisle: 'epicerie_sucree', unit: 'g', packages: [200], per100g: m(490, 17, 31, 8), role: 'fat', pantry: true },
  { id: 'whey', name: 'Whey (protéine en poudre)', aisle: 'placard', unit: 'g', packages: [1000], per100g: m(380, 78, 6, 6), role: 'protein_other', pantry: true },
  { id: 'speculoos', name: 'Spéculoos', aisle: 'epicerie_sucree', unit: 'piece', gramsPerPiece: 7.8, packages: [32], per100g: m(480, 5, 19, 72), role: 'sweet' },
  { id: 'miel', name: 'Miel', aisle: 'placard', unit: 'g', packages: [500], per100g: m(320, 0.4, 0, 80), role: 'sweet', pantry: true },
  { id: 'sucre', name: 'Sucre', aisle: 'placard', unit: 'g', packages: [1000], per100g: m(400, 0, 0, 100), role: 'sweet', pantry: true },
  { id: 'farine', name: 'Farine de blé', aisle: 'placard', unit: 'g', packages: [1000], per100g: m(350, 10, 1, 74), role: 'starch', pantry: true },
  { id: 'chocolat-noir', name: 'Chocolat noir pâtissier', aisle: 'epicerie_sucree', unit: 'g', packages: [200], per100g: m(530, 7, 38, 40), role: 'sweet' },
  { id: 'compote-sans-sucre', name: 'Compote de pomme sans sucre ajouté', aisle: 'epicerie_sucree', unit: 'g', packages: [400], per100g: m(50, 0.3, 0.1, 11), role: 'vegetable' },
];

export const INGREDIENTS: Ingredient[] = defs.map((d) => ({ pantry: false, freezable: false, packages: [], ...d }));
