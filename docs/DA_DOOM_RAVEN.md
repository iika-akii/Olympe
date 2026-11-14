# Olympe : directions artistiques « Doom » et « Raven »

> 14 novembre 2026 · Branche `claude/da-couleurs` · Directions : `apps/mobile/src/theme/directions/` · Palettes : `apps/mobile/src/theme/palettes/` · Planches : `docs/couleurs/`

Ce sont deux directions artistiques complètes, en plus de « Gravure » : polices, échelle typographique, formes, ornement, en-tête et images. Les fonctions ne changent pas : mêmes écrans, mêmes données, mêmes textes. On choisit dans **Profil → Apparence** ; Gravure reste l'apparence par défaut.

Elles reprennent une ambiance et des teintes, rien d'autre : aucun logo, personnage, police ni élément graphique des jeux. Les images sont des gravures de Gustave Doré, dans le domaine public, sans lien avec les jeux.

**[Certain]** Les deux sont sombres. Les contrastes sont mesurés et dépassent 4,5:1 pour tout texte courant, mais un fond sombre reste moins lisible en pleine lumière qu'un papier clair.

## Ce qui change d'une direction à l'autre

| | Gravure | Doom | Raven |
|---|---|---|---|
| **Idée** | Un livre de mythologie gravé | La salle des machines : métal, rivets, capitales d'atelier | Un recueil de poèmes noirs, à la bougie |
| **Couleurs** (3) | papier · encre · rouge sang | acier · vert armure · rouge | plume (noir violacé) · lueur (blanc froid) · améthyste |
| **Titres** | Grenze Gotisch (lettre gothique) | Teko 600/700, capitales étroites et hautes | IM Fell English, italique d'imprimerie ancienne |
| **Texte courant** | Barlow | Chakra Petch (dessin anguleux) | Spectral (romain de lecture) |
| **Libellés** | Barlow Condensed, capitales | Teko 500, capitales | Cinzel, capitales lapidaires |
| **Puce de section** | Quadrilobe | Rivet (carré à coins coupés) | Croissant de lune |
| **Cartes** | Angles presque vifs (5 px), filet fin | Plaque : angles vifs (2 px), tranche gauche épaisse (4 px) | Arrondies (14 px) |
| **Boutons, puces** | Rectangles à 5 px | Rectangles à 2 px, bord de 2 px | Pilules |
| **En-tête** | Gravure qui s'efface, titre qui mord dessus | Image, titre géant en capitales derrière une barre rouge | Image, titre centré en italique, filet orné d'un croissant |
| **Images** | Gravures mythologiques « encre seule » | Doré, *L'Enfer* de Dante (1861), « trait clair » | Doré, *Le Corbeau* d'Edgar Poe (1884), « trait clair » |
| **Filet des sections** | 1 px | 2 px | 1 px |

## Doom

### Couleurs

| Couleur | Nuances | Rôle |
|---|---|---|
| **Acier** (dominante) | `#161A19` fond · `#202524` cartes · `#2B312F` pressé · `#3A423F` filet · `#7F8A85` terne · `#AEB8B3` voilé · `#EEF1EE` poli | Fond, cartes, bordures et texte |
| **Vert armure** | `#8CAF52` · ombre `#26301E` | Bouton principal, repas avec la compagne |
| **Rouge** | `#FF4A5E` · clair `#FF8593` · ombre `#3A1419` | Rehaut : sélection, jour, alertes, courbe |

**[Certain]** Pas d'orange : le rouge est tiré vers le carmin, le vert vers l'olive.

### Images (Gustave Doré, *L'Enfer* de Dante, 1861)

| Écran | Planche | Pourquoi |
|---|---|---|
| Olympe (aujourd'hui) | Pl. 8, chant III, la porte de l'Enfer | Le seuil : on entre dans la journée |
| Entraînement | Pl. 22, chant VII, avares et prodigues | Des hommes qui poussent d'énormes poids |
| Forger | Pl. 65, chant XXXI, les Titans | La force brute |
| Cuisine | Pl. 3, chant I, le lion | Le lion « à la faim enragée » |
| Profil | Pl. 1, chant I, la forêt obscure | « Au milieu du chemin de notre vie » : où j'en suis |
| Écran d'attente | Pl. 9, chant III, Charon | Le passeur |

## Raven

### Couleurs

| Couleur | Nuances | Rôle |
|---|---|---|
| **Plume** (dominante) | `#100D16` fond · `#1A1622` cartes · `#252030` pressé · `#342D42` filet · `#8A8299` terne | Fond, cartes, bordures |
| **Lueur** | `#F1EEF8` · voilée `#B7B0C6` | Texte, images, bouton principal, compagne |
| **Améthyste** | `#B28CFF` · claire `#CDB4FF` · ombre `#2E2245` | Rehaut : sélection, jour, alertes, courbe |

### Images (Gustave Doré, *Le Corbeau* d'Edgar Poe, 1884)

| Écran | Planche | Pourquoi |
|---|---|---|
| Olympe (aujourd'hui) | n° 15, le cimetière sous la lune | Le décor du poème |
| Entraînement | n° 12, la fenêtre ouverte en grand | Le seul geste vif du recueil |
| Forger | n° 21, le bras levé vers le buste | L'effort tendu vers le haut |
| Cuisine | n° 17, la table sous la lampe | L'intérieur, la lumière posée |
| Profil | n° 24, le spectre sur la mer | La silhouette seule |
| Écran d'attente | n° 1, le corbeau qui entre | L'arrivée |

## Les images en « trait clair »

Les gravures « encre seule » de Gravure (noir + transparence, teintées à la couleur du texte) passent en négatif sur un fond sombre : les ombres gravées deviennent les zones les plus claires. Pour Doom et Raven, `apps/mobile/scripts/prepare-dore.py` fait l'inverse : l'opacité suit la **clarté** de la gravure. Teinte en clair, l'image reste un positif, comme une gravure éclairée dans le noir. Les ciels blancs sont plafonnés à 86 % pour ne pas éblouir, et le bas de chaque image se fond dans le fond.

## Contrastes mesurés

Calcul WCAG 2.1 sur les valeurs des fichiers de palette.

| Paire (rôles) | Usage | Doom | Raven |
|---|---|---|---|
| `text` / `bg` | Texte courant | 15,4 | 16,8 |
| `text` / `card` | Texte en carte | 13,7 | 15,5 |
| `muted` / `card` | Texte secondaire, onglets inactifs | 7,6 | 8,5 |
| `accent` / `bg` | Sur-titres, créneaux | 5,3 | 7,4 |
| `accent` / `card` | Créneaux en carte | **4,7** | 6,8 |
| `accentDeep` / `accentSoft` | Badges, puces cochées | 7,0 | 8,1 |
| `onInk` / `ink` | Bouton principal | 7,0 | 16,8 |

## Ce que chaque direction fait bien, et mal

### Doom
- **Bien.** Elle a une vraie personnalité, celle d'une app de salle de sport : chiffres géants en Teko (pesée, statistiques), plaques d'acier, bouton vert franc. Les planches de Doré collent au propos (les damnés qui poussent des poids, les Titans). Le vert donne à la compagne une couleur à elle.
- **Mal.**
  - Teko est une police d'affichage : très bien pour les titres et les chiffres, mais ses capitales étroites se lisent moins vite que Barlow dans les libellés. C'est pour cela que le texte courant est en Chakra Petch, pas en Teko.
  - Le rouge et le vert se disputent l'attention, et c'est la paire que confondent les daltoniens rouge-vert. La compagne se reconnaît aussi à l'aplat plein, donc rien ne devient illisible.
  - Le rouge sur une carte, à 4,7:1, passe de peu.

### Raven
- **Bien.** La plus élégante et la plus calme. Spectral est la meilleure police de lecture des trois directions : longues étapes de recette confortables. Les illustrations du *Corbeau* donnent une ambiance forte sans rien emprunter au jeu.
- **Mal.**
  - Les titres en italique ancien (IM Fell) ont du caractère mais un dessin irrégulier : réservés aux titres, jamais au texte.
  - Les capitales de Cinzel sont larges : j'ai réduit leur taille et leur espacement pour que « COLLATION » tienne dans sa colonne.
  - En alerte, le violet ne crie pas : seule l'icône du bandeau signale l'urgence.

## Recommandation

1. **Gravure (rouge sang) reste ma recommandation pour l'usage quotidien.** **[Probable]** C'est la plus lisible en pleine lumière, en cuisine et en rayon, et la seule dont les images sont rendues comme elles ont été dessinées.
2. **Raven est la meilleure des deux nouvelles DA.** **[Probable]** C'est la plus confortable à lire (Spectral), la plus reposante le soir, et les images de Doré y sont les plus cohérentes avec l'ambiance. Si vous voulez une app sombre, c'est celle-là.
3. **Doom est la plus spectaculaire, mais la plus fatigante.** **[Probable]** Elle convient à l'onglet Entraînement plus qu'à une recette lue pendant 30 minutes. Si elle vous plaît, je garderais sa typographie et ses plaques, mais j'éteindrais le vert du bouton principal au profit de l'acier poli : on reviendrait à une seule couleur saturée.

Le seul moyen de trancher : installer l'APK et passer d'une apparence à l'autre dans Profil, le soir puis en cuisine.

## Limites

- **[Certain]** Rendu vérifié sur l'export web (412 × 915) seulement. Sur Android, les polices et les arrondis peuvent différer légèrement. À confirmer sur l'APK.
- **[Certain]** Changer d'apparence remonte toute l'interface et ramène sur le premier onglet. Les données ne sont pas touchées.
- **[Certain]** L'écran de démarrage natif, le fond de l'icône et le clavier restent clairs (`app.json`).
- **[Certain]** Deux styles hors primitives gardent les rayons de Gravure : la barre de progression de l'objectif (`GoalPath.tsx`) et les flèches de semaine (`cuisine.tsx`). La différence se voit à peine ; je n'ai pas modifié ces fichiers, sur lesquels l'autre session travaille.
- Les polices des trois directions sont chargées au démarrage, ce qui ajoute environ 2 Mo à l’app (13 fichiers de police).
