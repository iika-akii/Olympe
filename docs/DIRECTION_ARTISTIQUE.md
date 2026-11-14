# Olympe : direction artistique « Gravure »

> 12 novembre 2026 · Palette : `apps/mobile/src/theme/palettes/gravure.ts` · En-tête gravé : `apps/mobile/src/components/Hero.tsx` · Primitives : `apps/mobile/src/components/ui.tsx`

## Idée

Un livre de mythologie gravé : des corps de héros et de dieux tracés à l'encre, au trait qui enfle et s'amincit comme une calligraphie ou un tatouage, sur un papier clair. La lettre gothique des titres et le quadrilobe des sections apportent la touche néo-gothique. Rien d'autre.

## Trois couleurs, pas une de plus

| Couleur | Valeur | Rôle |
|---|---|---|
| **Papier** (dominante) | `#F4EFE6` · cartes `#FBF8F2` · ombre `#E8E1D4` · filet `#D3CABA` | Fond, cartes, bordures |
| **Encre** | `#17130F` · voilée `#5B5348` · pâle `#988F82` | Texte, gravures, bouton principal, repas cochés pour la compagne |
| **Rouge sang** | `#B3122B` · sombre `#8A0E21` · pâle `#F2DCD9` | Le seul rehaut : onglet actif, sur-titres, sélection, jour en cours, alertes, courbe du poids |

- Pas de quatrième teinte : ce qui concerne la compagne se dit par un aplat d'encre, une alerte par le rouge et une icône.
- Contrastes sur le papier : encre 16:1, encre voilée 6,6:1, rouge 6,0:1. L'encre pâle ne sert jamais à un texte à lire.
- Trois autres palettes pour Gravure (vert-de-gris, outremer, nuit) et deux autres directions artistiques (Doom, Raven), au choix dans Profil → Apparence. Analyse : `docs/PROPOSITIONS_COULEURS.md` et `docs/DA_DOOM_RAVEN.md`.

## Gravures

Une par onglet, en tête d'écran. Aucune sur les écrans de travail (recette, courses, plat plaisir, suivi).

| Écran | Image | Œuvre | Source |
|---|---|---|---|
| Olympe (aujourd'hui) | La fresque entière : Adam et Dieu | Michel-Ange, *La Création d'Adam*, v. 1511, chapelle Sixtine | Wikimedia Commons |
| Icône | Les deux mains | Détail de la même fresque | Wikimedia Commons |
| Entraînement | Le Grand Hercule | Hendrick Goltzius, *The Great Hercules*, 1589 | Met, objet 343586 |
| Forger | La forge | Cornelis Bos, *The Forge of Vulcan*, 1546 | Met, objet 399871 |
| Cuisine | Bacchus, médaillon presque entier | Hendrick Goltzius, *Bacchus* | Met, objet 373160 |
| Profil | L'ange déchu | Alexandre Cabanel, *L'Ange déchu*, 1847 | Wikimedia Commons |
| Écran d'attente | La chute de Phaéton | Hendrick Goltzius, *Phaeton*, des « Quatre Disgraciés », 1588 | Met, objet 343581 |

- Toutes les œuvres sont dans le domaine public ; les images du Met sont sous licence CC0 (Open Access).
- Deux traitements (`apps/mobile/scripts/prepare-engravings.py`) :
  - une vraie gravure est débarrassée de son papier, on ne garde que le trait ;
  - une peinture est **regravée** : tailles croisées dont l'épaisseur suit l'ombre, contours cernés. Le pas des tailles se règle par image : serré pour une vue d'ensemble (la fresque), large pour un gros plan.
- Une gravure n'est jamais agrandie au-delà de sa définition d'origine, et les tailles s'effilent au lieu de s'arrêter net : ce sont les deux causes du rendu « pixelisé » corrigé le 14/11/2026.
- Chaque image est en « encre seule » (noir + transparence). L'app la teinte à la couleur d'encre du thème : changer la palette ne demande pas de refaire les images.
- Ajouter une image : déposer l'original, ajouter une ligne à `JOBS` dans le script, puis à `ENGRAVINGS` dans `Hero.tsx`.

## Typographie

| Police | Usage |
|---|---|
| **Grenze Gotisch** 600 | Titres d'écran et de carte forte. La seule lettre gothique, jamais pour un texte courant |
| **Barlow** 400 / 500 / 600 | Texte courant, noms de plats, quantités |
| **Barlow Condensed** 600 | Libellés en capitales espacées : créneaux, sections, boutons, badges |

## Formes

| Motif | Où |
|---|---|
| Gravure qui s'efface dans le papier, titre gothique qui mord dessus | En tête de chaque onglet |
| Quadrilobe rouge (remplage gothique) | Devant chaque titre de section |
| Aplat d'encre | Bouton principal, repas coché pour la compagne |
| Angles presque vifs (3 à 5 px), filets fins | Cartes, boutons, cases |

## Limites connues

- Rendu vérifié sur l'export web (412 × 915) seulement ; à confirmer sur ton téléphone avec l'APK.
- Sur *L'Ange déchu*, le regard reste dans l'ombre : c'est la chevelure, l'aile et le bras qui portent l'image.
- Pas d'animation. La palette « nuit » est sombre : les gravures « encre seule » y passent en négatif.
