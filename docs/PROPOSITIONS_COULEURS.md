# Olympe : propositions de couleurs

> 14 novembre 2026 · Branche `claude/da-couleurs` · Palettes : `apps/mobile/src/theme/palettes/` · Planches : `docs/couleurs/`
>
> Mise à jour du soir : les palettes « doom » et « raven » sont désormais portées par deux directions artistiques complètes (`docs/DA_DOOM_RAVEN.md`). Ce document ajoute trois autres palettes pour Gravure : vert-de-gris (claire), outremer (tranchée), nuit (sombre).

**[Certain]** Je recommande de garder « Gravure » en rouge sang. Les palettes sombres affichent les gravures, dessinées pour l'encre sur papier, en négatif. Si le précédent thème vous a paru « trop foncé » parce qu'il était sombre (et pas seulement parce qu'il était terne), elles vous gêneront aussi, même si leurs contrastes sont meilleurs que les siens, mesures à l'appui.

Ces palettes reprennent des teintes et une ambiance, rien d'autre : aucun logo, personnage ni élément graphique des jeux.

## Changer d'apparence

Dans l'app : **Profil → Apparence**. Les trois premières puces choisissent la direction artistique (Gravure, Doom, Raven). Sous Gravure, quatre puces choisissent la palette (rouge sang, vert-de-gris, outremer, nuit). Le choix est mémorisé dans la base du téléphone.

**[Certain]** Ce qui ne suit pas, parce que c'est réglé dans `app.json` et non par le thème : l'écran de démarrage natif (`splash`), le fond de l'icône adaptative et `userInterfaceStyle: "light"`, qui garde le clavier et les boîtes de dialogue système en clair. Pour un essai, ce n'est pas gênant. Si une apparence sombre est adoptée, il faudra modifier ces trois valeurs, sinon un éclair clair apparaîtra au lancement.

## Ce qui a changé dans le code

- `theme/types.ts` : l'interface `Theme`, avec un rôle de plus, `scheme: 'light' | 'dark'`, qui règle la barre d'état et le thème de navigation, rien d'autre.
- `theme/palettes/` : un fichier par palette, avec ses matières et son `Theme` (ses rôles). `gravure.ts` reprend les valeurs d'origine à l'identique.
- `theme/looks.ts` : la liste des apparences, chacune associant une direction et une palette. Par défaut : `gravure`.
- Onglets inactifs : leur libellé passe de `faint` à `muted` (6,6:1 au lieu de 2,8:1 sur le papier). La même correction existait déjà sur `claude/da-olympe`, que j'ai fusionnée.

## Trois variantes de Gravure

Même direction artistique (gravures, lettre gothique, quadrilobe). Seules les couleurs changent, toujours trois.

| Variante | Couleurs | Rôle de chacune |
|---|---|---|
| **Vert-de-gris** (claire) | papier `#F4EFE6` · encre `#17130F` · vert-de-gris `#2E6B5E` (sombre `#1F4D43`, pâle `#DCE8E3`) | Gravure telle quelle, le rouge remplacé par la patine du cuivre |
| **Outremer** (tranchée) | blanc `#FFFFFF` (pressé `#EDEDED`) · noir `#000000` (voilé `#4A4A4A`, pâle `#7A7A7A`) · outremer `#1A3FD9` (sombre `#102A9E`, pâle `#E3E8FF`) | Aucun gris de papier, des bordures noires : chaque carte est un cadre net |
| **Nuit** (sombre) | encre `#17130F` (cartes `#211C17`, filet `#3D352C`) · papier `#F4EFE6` (voilé `#BDB3A3`) · rouge `#F0566A` (clair `#F59AA5`, ombre `#3E1A1D`) | Gravure retournée : l'encre fait le fond, le papier fait le texte |

| Paire (rôles) | Rouge sang | Vert-de-gris | Outremer | Nuit |
|---|---|---|---|---|
| `text` / `bg` | 16,1 | 16,1 | 21,0 | 16,1 |
| `muted` / `card` | 7,1 | 7,1 | 8,9 | 8,2 |
| `accent` / `bg` | 6,0 | 5,4 | 7,6 | 5,5 |
| `accent` / `card` | 6,5 | 5,9 | 7,6 | 5,0 |
| `accentDeep` / `accentSoft` | 7,4 | 7,6 | 9,3 | 7,3 |
| `onInk` / `ink` | 17,4 | 17,4 | 21,0 | 16,1 |
| `faint` / `bg` (décor seulement) | 2,8 | 2,8 | 4,3 | 5,1 |

**[Certain]** Toutes dépassent 4,5:1 pour le texte courant.

- **Vert-de-gris.** La plus douce, et la plus « cuisine ». Mais le vert, moins chaud que le rouge, signale moins bien une alerte : les bandeaux se repèrent surtout à leur icône. **[Probable]** C'est la seule qui pourrait remplacer le rouge sang sans rien perdre en lisibilité.
- **Outremer.** La plus lisible en plein soleil (21:1) et la plus « affiche ». Les bordures noires alourdissent les longues listes (planning, courses) ; c'est voulu, puisque vous demandiez du « très tranché », mais l'œil fatigue plus vite. Le papier disparaît, et avec lui une partie du charme du livre ancien.
- **Nuit.** Reposante le soir, mais les gravures « encre seule » y passent en négatif, comme dans les premières propositions sombres. Je l'ai gardée parce que vous vouliez une variante sombre ; je ne la recommande pas sans gravures retravaillées.

## Les palettes de départ : Gravure, Doom, Raven

### Gravure (actuelle) : papier, encre, rouge sang

| Couleur | Nuances | Rôle |
|---|---|---|
| **Papier** (dominante) | `#F4EFE6` fond · `#FBF8F2` cartes · `#E8E1D4` pressé · `#D3CABA` filet | Fond, cartes, bordures |
| **Encre** | `#17130F` · voilée `#5B5348` · pâle `#988F82` | Texte, gravures, bouton principal, compagne |
| **Rouge sang** | `#B3122B` · sombre `#8A0E21` · pâle `#F2DCD9` | Rehaut unique : sélection, jour, alertes, courbe |

### Doom : acier, vert armure, rouge, sans orange

L'univers d'origine est saturé d'orange (feu, lave, interface). **[Certain]** Cette palette n'en contient pas : le rouge est tiré vers le carmin (`#FF4A5E`), pas vers le vermillon, et le vert vers l'olive.

| Couleur | Nuances | Rôle |
|---|---|---|
| **Acier** (dominante) | `#161A19` fond · `#202524` cartes · `#2B312F` pressé · `#3A423F` filet · `#7F8A85` terne · `#AEB8B3` voilé · `#EEF1EE` poli | Du métal brut au métal poli : fond, cartes, bordures **et** texte |
| **Vert armure** | `#8CAF52` · ombre `#26301E` | Aplat : bouton principal, repas avec la compagne |
| **Rouge** | `#FF4A5E` · clair `#FF8593` · ombre `#3A1419` | Rehaut unique : sélection, jour, alertes, courbe |

Le texte est la nuance la plus claire de l'acier : on reste à trois couleurs. Contrairement à Gravure, la compagne a sa propre couleur d'aplat (le vert), distincte du texte.

### Raven : plume, lueur, améthyste

| Couleur | Nuances | Rôle |
|---|---|---|
| **Plume** (dominante) | `#100D16` fond · `#1A1622` cartes · `#252030` pressé · `#342D42` filet · `#8A8299` terne | Noir violacé : fond, cartes, bordures |
| **Lueur** | `#F1EEF8` · voilée `#B7B0C6` | Blanc froid : texte, gravures, bouton principal, compagne |
| **Améthyste** | `#B28CFF` · claire `#CDB4FF` · ombre `#2E2245` | Rehaut unique : sélection, jour, alertes, courbe |

Même logique que Gravure, inversée : la compagne est un aplat de lueur et l'alerte passe par l'améthyste et une icône.

## Contrastes mesurés

Calcul WCAG 2.1 (luminance relative) appliqué aux valeurs des fichiers de palette. Seuils : 4,5:1 pour un texte courant, 3:1 pour une icône ou une bordure qui porte un sens.

| Paire (rôles) | Usage | Gravure | Doom | Raven |
|---|---|---|---|---|
| `text` / `bg` | Texte courant | 16,1 | 15,4 | 16,8 |
| `text` / `card` | Texte dans une carte | 17,4 | 13,7 | 15,5 |
| `muted` / `bg` | Texte secondaire | 6,6 | 8,6 | 9,2 |
| `muted` / `card` | Texte secondaire en carte | 7,1 | 7,6 | 8,5 |
| `accent` / `bg` | Sur-titres, créneaux, jour | 6,0 | 5,3 | 7,4 |
| `accent` / `card` | Créneaux dans une carte | 6,5 | **4,7** | 6,8 |
| `accentDeep` / `accentSoft` | Badges, puces cochées, bandeaux | 7,4 | 7,0 | 8,1 |
| `onInk` / `ink` | Bouton principal, puce compagne | 17,4 | 7,0 | 16,8 |
| `onInk` / `accent` | Coche d'une case | 6,5 | 5,3 | 7,4 |
| `partner` / `card` | « Elle » dans une recette | 17,4 | 6,2 | 15,5 |
| `danger` / `bg` | Bouton « Regénérer » | 6,0 | 5,3 | 7,4 |
| `faint` / `bg` | Libellés d'onglets inactifs | **2,8** | 4,9 | 5,3 |
| `borderStrong` / `card` | Bord des cases et puces | 3,0 | 4,3 | 4,9 |

- **[Certain]** Les trois palettes dépassent 4,5:1 pour tout texte courant.
- **[Certain]** Point faible de Doom : le rouge sur une carte, à 4,7:1, passe de peu. Je ne l'ai pas éclairci davantage, car au-delà il vire au rose.
- **[Certain]** Défaut existant de Gravure, que je n'ai pas corrigé (ce n'était pas la demande) : les libellés des onglets inactifs sont en `faint`, à 2,8:1. Ils restent lisibles grâce à l'icône, mais ce sont des mots à lire. Les deux palettes sombres n'ont pas ce défaut.

## Ce que chaque palette fait bien, et mal

### Gravure
- **Bien.** C'est la meilleure en cuisine et en magasin, en pleine lumière : un fond clair ne laisse pas de reflets sur l'écran. Les gravures s'affichent telles qu'elles ont été dessinées, ombres en noir. Le rouge, rare, se repère d'un coup d'œil. Trois couleurs vraiment distinctes.
- **Mal.** Fatigante le soir au lit, l'écran éclaire. Les onglets inactifs sont trop pâles (voir plus haut).

### Doom
- **Bien.** C'est la palette la plus « salle de sport » : métal et vert militaire, ambiance énergique sans orange. Le vert donne à la compagne une couleur propre, plus lisible que l'aplat d'encre de Gravure dans la grille des repas partagés. Pas de fond noir pur : l'acier légèrement verdi garde des cartes nettement détachées du fond.
- **Mal.**
  - Deux couleurs saturées se disputent l'attention : le gros bouton vert et le rouge, sur le même écran (Profil, Cuisine). Le vert, surtout, attire l'œil plus que tout le reste.
  - Le rouge et le vert sont la paire que confondent les daltoniens rouge-vert (environ 1 homme sur 12). L'app distingue aussi la compagne par la forme (aplat plein, contre contour pour la sélection), donc rien n'est illisible, mais la couleur seule ne suffit pas.
  - Gravures en négatif (voir plus bas).

### Raven
- **Bien.** C'est la plus calme et la mieux construite : contrastes les plus élevés des trois, un seul rehaut froid qui ne fatigue pas, et un bouton blanc qui marque l'action principale sans crier. Gravures en négatif mais teintées de lueur froide, ce qui donne une ambiance spectrale cohérente avec le nom. C'est la plus reposante le soir.
- **Mal.**
  - Un noir-violet avec du lavande, c'est le « mode sombre » le plus répandu des applis : l'identité gothique de Gravure s'efface au profit d'un look générique.
  - Difficile à lire en pleine lumière, en cuisine sous un plafonnier ou en rayon : c'est le défaut de tout fond sombre.
  - Bandeaux d'alerte en violet : une alerte qui ne ressemble pas à une alerte. Seule l'icône la signale.

### Les gravures sur fond sombre

**[Certain, vu sur les captures]** L'app teinte les images d'une seule couleur. Sur fond sombre, les traits deviennent clairs et le fond reste sombre : on obtient un **négatif**. Les zones gravées serrées (les ombres d'origine) deviennent donc les zones les plus lumineuses.
- *La Création d'Adam* et *Bacchus* tiennent bien : on dirait de la craie sur une ardoise.
- *L'Ange déchu*, *Hercule* et *La forge* perdent leur modelé : la chevelure et les muscles, très gravés, se transforment en masses blanches, et les visages ressemblent à une radiographie (planche comparative « Profil »).

Pour corriger cela, il faudrait préparer pour les thèmes sombres une version inversée des images (le trait suit la lumière au lieu de l'ombre). Cela change les images, ce qui sort du cadre de cette demande.

## Recommandation

1. **Gravure en rouge sang, à garder par défaut.** **[Probable]** C'est celle qui sert le mieux l'usage réel de l'app, en cuisine et en rayon : lisible en pleine lumière, des images rendues comme prévu, une identité qui ne ressemble à aucune autre appli. Les libellés d'onglets inactifs sont maintenant corrigés.
2. **Vert-de-gris, la seule variante qui la vaut.** **[Probable]** Même lisibilité, ambiance plus douce ; on y perd un peu de force dans les alertes.
3. **Outremer et Nuit : à essayer, pas à adopter les yeux fermés.** Outremer est la plus lisible mais la plus dure à l'œil sur une longue liste ; Nuit affiche les gravures en négatif.
4. **Pour un thème sombre, préférez la DA Raven à la palette Nuit** : ses images ont été préparées pour le fond sombre. Voir `docs/DA_DOOM_RAVEN.md`.

Limites : **[Certain]** toutes ces observations viennent de l'export web (412 × 915). Sur un écran OLED Android, le noir est plus profond et le rendu sera encore plus contrasté ; la seule façon de trancher est d'essayer en APK.

## Planches

Captures réelles de l'export web (412 × 915), semaine générée et pesée de 100 kg saisies dans l'interface. Aucune donnée de démonstration n'est enregistrée dans le code.

| Fichier | Contenu |
|---|---|
| `docs/couleurs/comparatif-gravure-palettes.jpg` | Aujourd'hui dans les quatre palettes de Gravure |
| `docs/couleurs/comparatif-da-aujourdhui.jpg` · `-recette.jpg` · `-entrainement.jpg` | Gravure, Doom et Raven côte à côte |
| `docs/couleurs/planche-<apparence>.jpg` | Huit écrans par apparence : gravure, gravure-verdegris, gravure-outremer, gravure-nuit, doom, raven |

Les sections « Doom » et « Raven » plus haut décrivent les palettes des premières propositions ; elles sont reprises telles quelles dans les DA complètes (`docs/DA_DOOM_RAVEN.md`).
