# Olympe : propositions de couleurs « doom » et « raven »

> 14 novembre 2026 · Branche `claude/da-couleurs` · Palettes : `apps/mobile/src/theme/palettes/` · Planches : `docs/couleurs/`

**[Certain]** Je recommande de garder « Gravure ». Les deux palettes demandées sont sombres par nature. Sur un fond sombre, les gravures, dessinées pour l'encre sur papier, s'affichent en négatif. Si le précédent thème vous a paru « trop foncé » parce qu'il était sombre (et pas seulement parce qu'il était terne), ces deux-là vous gêneront aussi. Elles sont pourtant plus contrastées que lui, mesures à l'appui.

Ces palettes reprennent des teintes et une ambiance, rien d'autre : aucun logo, personnage ni élément graphique des jeux.

## Activer une palette

Dans `apps/mobile/src/theme/tokens.ts`, changer une seule ligne :

```ts
export const ACTIVE_PALETTE: PaletteName = 'gravure'; // ou 'doom', ou 'raven'
```

Tout le reste suit : écrans, onglets, barre de titre, gravures (teintées par `theme.text`), barre d'état (claire ou sombre selon le nouveau rôle `scheme`).

**[Certain]** Restent sur le papier clair, parce qu'ils sont réglés dans `app.json` et pas par le thème : l'écran de démarrage natif (`splash`), le fond de l'icône adaptative et `userInterfaceStyle: "light"`, qui garde le clavier et les boîtes de dialogue système en clair. Pour un essai, ce n'est pas gênant. Si une palette sombre est adoptée, il faudra modifier ces trois valeurs, sinon un éclair clair apparaîtra au lancement.

## Ce qui a changé dans le code

- `theme/types.ts` : l'interface `Theme`, avec un rôle de plus, `scheme: 'light' | 'dark'`, renseigné dans les trois palettes. `_layout.tsx` s'en sert pour la barre d'état et le thème de navigation, et rien d'autre.
- `theme/palettes/gravure.ts`, `doom.ts`, `raven.ts` : chaque fichier contient sa palette (matières) et son `Theme` (rôles). « Gravure » reprend les valeurs d'avant à l'identique.
- `theme/tokens.ts` : `ACTIVE_PALETTE` choisit la palette ; la valeur par défaut reste `gravure`.
- Aucun écran, aucune police, aucune image ni mise en page modifiés.

## Les trois palettes

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

1. **Gravure, à garder comme thème principal.** **[Probable]** C'est celle qui sert le mieux l'usage réel de l'app, en cuisine et en rayon : lisible en pleine lumière, des images rendues comme prévu, une identité qui ne ressemble à aucune autre appli. Je corrigerais seulement les libellés d'onglets inactifs (`faint` → `muted` pour le texte de l'onglet), si vous le souhaitez.
2. **Raven, si vous voulez un thème sombre.** **[Probable]** C'est la plus lisible des deux et la seule qui reste calme. À essayer le soir sur votre téléphone avant de juger.
3. **Doom : je la déconseille comme thème principal.** **[Probable]** Elle est lisible et respecte la règle des trois couleurs, mais son vert et son rouge se battent pour l'attention, la paire rouge-vert pose problème aux daltoniens, et ses gravures en négatif sont les plus dures à regarder. Elle dessert une app qu'on ouvre surtout pour lire une recette.

Limites : **[Certain]** toutes ces observations viennent de l'export web (412 × 915). Sur un écran OLED Android, le noir est plus profond et le rendu sera encore plus contrasté ; la seule façon de trancher est d'essayer en APK.

## Planches

| Fichier | Contenu |
|---|---|
| `docs/couleurs/planche-gravure.jpg` | Aujourd'hui, Cuisine (haut et planning), Suivi (haut et courbe), Profil, Entraînement, Forger |
| `docs/couleurs/planche-doom.jpg` | Idem, palette Doom |
| `docs/couleurs/planche-raven.jpg` | Idem, palette Raven |
| `docs/couleurs/comparatif-aujourdhui.jpg` | Aujourd'hui dans les trois palettes |
| `docs/couleurs/comparatif-cuisine-bas.jpg` | Planning de la semaine dans les trois palettes |
| `docs/couleurs/comparatif-profil.jpg` | Profil : effet du négatif sur *L'Ange déchu* |

Captures prises sur des exports web réels, avec une semaine générée et une pesée de 100 kg saisie dans l'interface. Aucune donnée de démonstration n'est enregistrée dans le code.
