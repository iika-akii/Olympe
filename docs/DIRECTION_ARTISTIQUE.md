# Olympe : direction artistique « Palestre »

> 12 novembre 2026 · Tokens : `apps/mobile/src/theme/tokens.ts` · En-tête à statue : `apps/mobile/src/components/Hero.tsx` · Primitives : `apps/mobile/src/components/ui.tsx`

## Idée

La palestre des héros : des **corps sculptés de la statuaire grecque** sortent de l'ombre, éclairés par une braise. Le grec porte l'image (marbre, bronze, athlètes, dieux). Le néo-gothique vient par-dessus, en trois touches seulement : l'arc brisé derrière chaque statue, la lettre gothique des titres, le quadrilobe des titres de section.

La DA habille l'app, elle n'y ajoute rien : aucun chiffre, aucune fonction, et pour tout texte une ligne de crédit des statues en bas de l'onglet Profil.

## Statues

Une par onglet, en tête d'écran. Aucune sur les écrans de travail (recette, courses, plat plaisir).

| Écran | Statue | Œuvre (Metropolitan Museum of Art, objet n°) |
|---|---|---|
| Olympe (aujourd'hui) | Hercule jeune | Statue en marbre d'un Hercule juvénile, 69–96 apr. J.-C. (247000) |
| Entraînement | Torse d'athlète | Torse en marbre d'un jeune homme, v. 118–161 apr. J.-C. (250556) |
| Forger | Torse de bronze | Torse en bronze d'un jeune homme, 1re moitié du Ve s. av. J.-C. (250947) |
| Cuisine | Dionysos | Statue en marbre de Dionysos, Ier–IIe s. apr. J.-C. (256879) |
| Profil | Éphèbe | Tête en marbre d'un athlète, v. 138–192 apr. J.-C. (248579) |
| Icône, attente | Zeus | Tête en marbre de Zeus Ammon, v. 120–160 apr. J.-C. (257864) |

- Source : collection **Open Access** du Met, images en domaine public (CC0). Une ligne de crédit figure dans l'onglet Profil.
- Traitement : détourage, cadrage au-dessus du bassin, couleur à moitié retirée pour unifier les marbres, fondu vers le bas (`apps/mobile/scripts/prepare-statues.py`).
- Ajouter une statue : la détourer, l'ajouter à la liste du script, puis à `STATUES` dans `Hero.tsx`.

## Couleurs

Thème unique, sombre. Les écrans n'utilisent que les rôles.

| Matière | Valeur | Rôle |
|---|---|---|
| Nuit | `#0B0A09` | Fond |
| Pierre / pierre claire | `#161412` / `#221F1B` | Cartes, surface pressée |
| Joint / joint fort | `#2E2A25` / `#4D463D` | Bordures, contours des contrôles |
| Marbre | `#F2ECE1` | Texte principal |
| Marbre voilé | `#ADA598` | Texte secondaire |
| Marbre d'ombre | `#70695F` | Décor, icônes inactives. Jamais un texte à lire |
| **Braise** | `#FF6B3D` (claire `#FFB46E`, sombre `#A8371C`) | Accent : action, sélection, halo des statues |
| Égée | `#8CC4FF` | Ce qui concerne ta compagne |
| Ambre | `#F5C451` | Avertissements |
| Carmin | `#FF5D7A` | Danger, action destructive |

Une seule couleur chaude domine : la braise. Le bleu d'Égée est réservé à ta compagne, pour qu'on la repère sans lire.

## Typographie

| Police | Usage |
|---|---|
| **Grenze Gotisch** 600 | Titres d'écran et de carte forte. La seule lettre gothique, jamais pour un texte courant |
| **Barlow** 400 / 500 / 600 | Texte courant, noms de plats, quantités |
| **Barlow Condensed** 600 | Libellés en capitales espacées : créneaux, sections, boutons, badges |

## Formes

| Motif | Origine | Où |
|---|---|---|
| Arc brisé en lancette, double trait | Néo-gothique | Derrière chaque statue, sur l'icône |
| Halo de braise | Torche, feu sacré | Derrière chaque statue |
| Quadrilobe | Remplage gothique | Devant chaque titre de section |
| Angles presque vifs (3 à 5 px) | Pierre taillée | Cartes, boutons, cases |

## Limites connues

- Rendu vérifié sur l'export web (412 × 915) seulement ; à confirmer sur ton téléphone avec l'APK.
- Pas de thème clair, pas d'animation.
