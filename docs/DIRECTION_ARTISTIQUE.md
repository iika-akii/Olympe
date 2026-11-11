# Olympe : direction artistique « Temple de nuit »

> 11 novembre 2026 · Tokens : `apps/mobile/src/theme/tokens.ts` · Primitives : `apps/mobile/src/components/ui.tsx` · Motifs : `apps/mobile/src/components/ornaments.tsx`

## Idée

Une nef gothique, la nuit, où l'on aurait posé un autel grec : pierre sombre, marbre, or du laurier, flamme de la torche. Le gothique donne la verticalité et l'ogive, l'antique donne l'inscription et la couronne, le futurisme donne la netteté (angles vifs, traits fins, chiffres en colonnes, lueur violette).

Règle qui prime sur toutes les autres : **le décor ne ralentit jamais la lecture**. L'app sert à savoir quoi manger et quoi acheter, en cuisine et en rayon. Le risque n°1 du projet est l'abandon de la diète, pas un écran trop sobre.

## Couleurs

Thème unique, sombre. Les noms désignent une matière ; les écrans n'utilisent que les rôles.

| Matière | Valeur | Rôle | Contraste sur la carte |
|---|---|---|---|
| Nyx | `#08070D` | Fond de l'app | |
| Crypte | `#110F1A` | Cartes | |
| Voûte | `#1A1728` | Surface pressée, badges neutres | |
| Ligne / ligne forte | `#2A2640` / `#453E6B` | Bordures, contours des contrôles | |
| Marbre | `#F2EDE3` | Texte principal | 16,3:1 |
| Veine | `#A8A2B8` | Texte secondaire | 7,7:1 |
| Cendre | `#6E6982` | Décor, icônes inactives. **Jamais un texte à lire** | 3,6:1 |
| **Or** | `#E9BE62` (clair `#F8DD9A`, sombre `#A27A28`) | Accent : sélection, action principale, tes données | 10,8:1 |
| **Flamme** | `#FF7A3D` | Attention : avertissements, pièges, plancher | 7,3:1 |
| **Éther** | `#A891FF` | Tout ce qui concerne ta compagne ; lueur d'ambiance en haut d'écran | 7,4:1 |
| Sang | `#FF5D73` | Danger, action destructive | 6,4:1 |

Trois couleurs vives, trois sens, jamais mélangés : **or = toi et l'action**, **flamme = attention**, **éther = elle**. Le dégradé flamme → or est réservé à trois endroits : l'anneau du jour, les barres de progression, l'emblème.

## Typographie

| Police | Usage | Pourquoi |
|---|---|---|
| **Cinzel** 600 / 700 | Titres d'écran, titres de section, en-têtes | Capitales des inscriptions romaines |
| **Jost** 400 → 700 | Tout le reste, **et tous les chiffres** | Géométrique (lignée Futura), lisible à 16 px |

- Cinzel dessine le « 1 » comme un « I » : un titre contenant une date passe ses chiffres en Jost (fonction `inscription()`).
- Petites capitales espacées en Jost pour les libellés (créneaux, badges, boutons).
- Une seule italique : la maxime du jour.
- Chiffres romains uniquement pour numéroter les étapes d'une recette, jamais pour une quantité.

## Formes et motifs

| Motif | Origine | Où | Règle |
|---|---|---|---|
| Angles vifs (rayon 2 à 4 px) | Pierre taillée | Partout | Aucune pilule, aucun cercle hors anneau |
| Équerres d'or | Cadre, viseur | Le bloc principal de l'écran | Un seul par écran |
| Niche ogivale | Gothique | Le total du jour | La niche d'une cathédrale reçoit une statue ; ici, le chiffre du jour |
| Couronne de laurier | Vainqueur des jeux | Autour de l'anneau | Seulement quand la journée est « dans le plan » |
| Méandre | Frise grecque | Sous le titre d'écran | Une fois par écran |
| Losange | Pointe de diamant | Devant un titre de section, puces | |
| Lueur d'éther | Vitrail, futurisme | Haut de chaque écran | Défile avec le contenu |
| Emblème (flamme sous une ogive, sur les degrés d'un temple) | Les trois sources réunies | Icône, écran d'attente, en-tête, onglets vides | |

## Voix

Tutoiement, français courant, aucun vocabulaire mythologique dans les libellés (« Liste de courses », pas « Offrandes »). La seule touche littéraire est la maxime antique du jour (`src/data/maxims.ts`, auteurs du domaine public, traductions libres).

## Ce qui n'est pas fait

- **Aucune statue.** Le conteneur de développement n'a pas accès aux banques d'images libres (Met Open Access, Wikimedia). Une photo de marbre en niveaux de gris, détourée, trouverait sa place dans la niche des onglets vides et sur l'écran de lancement. Il faut fournir l'image (domaine public ou générée) ; rien n'est à changer dans la structure.
- **Pas de thème clair.** Décision assumée, voir `docs/ARCHITECTURE.md` §2.
- **Pas d'animation.** À ajouter après usage réel, si un geste en a besoin.
- Rendu vérifié sur l'export web (412 × 915) ; **pas encore vu sur un téléphone Android**.
