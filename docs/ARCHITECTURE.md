# Olympe : architecture

> Mise à jour : 9 novembre 2026 · Règles métier : `docs/CONTEXTE_UTILISATEUR.md`
> Légende : **[Certain]** preuve concrète · **[Probable]** déduction forte · **[Incertain]** hypothèse à valider

---

## 0. Contraintes structurantes

1. **[Certain] L'API Web Fitbit est coupée depuis le 30 octobre 2026.** La Google Health API qui la remplace classe tous ses scopes en « Restricted » (revue de sécurité obligatoire) : irréaliste pour une app perso. Le téléphone est sous **Android**, donc on lit les **pas et le sommeil total via Health Connect**, directement sur le téléphone. La pesée se saisit à la main (1 tap) ; l'historique depuis septembre 2026 s'importe depuis l'export Fitbit (Google Takeout).
2. **[Certain] Pas de backend.** Usage strictement personnel. Le seul partage, la liste de courses envoyée à la compagne, passe par le menu de partage Android (texte).
3. **[Probable] Le risque n°1 reste l'adhérence, pas la technique.** Chaque tranche livrée doit servir dès la semaine suivante. La diète n'attend pas l'app.

## 1. Dimensionnement

| Élément | Volume |
|---|---|
| Utilisateurs | 1 (la compagne n'intervient que comme convive) |
| Recettes | ~25 au départ, 100-200 à terme (diète + plaisir) |
| Ingrédients | ~60 au départ, quelques centaines à terme |
| Pesées, séries, plans | quelques milliers de lignes par an |

**[Certain]** SQLite local suffit largement. La complexité est dans les règles, pas dans les volumes :

| Module | Complexité |
|---|---|
| Planificateur hebdo (batch, riz 3 jours, congélation, riz de la veille, mutualisation, ≥ 3 plats) | Élevée |
| Moteur d'adaptation d'un plat aux macros | Moyenne-élevée |
| Liste de courses (unités, conditionnements, placard, rayons) | Moyenne |
| Import de recettes (format standard des sites, puis IA) | Moyenne |
| Règles d'ajustement calorique, double progression | Faible |

## 2. Décisions

| Sujet | Décision | Pourquoi |
|---|---|---|
| Plateforme | App **Expo / React Native** en *development build* | Health Connect et notifications fiables (minuteur) impossibles en web |
| Données | **SQLite local** (`expo-sqlite`) derrière un pilote minimal `SqlDriver` (exec / run / all) et des migrations `PRAGMA user_version` | 1 utilisateur, hors ligne, aucun coût. Drizzle écarté (11/11/2026) : sa chaîne de migrations Expo demande des plugins Babel/Metro pour 5 tables ; le pilote maison se teste en Node avec `node:sqlite` |
| Recettes | **Stockées dans SQLite**, ajoutées depuis le téléphone ; **export Markdown compatible Obsidian** | L'utilisateur n'utilise pas Obsidian et ajoute ses recettes le week-end, depuis son téléphone. Un dossier Markdown versionné imposerait un commit à chaque recette |
| « Cerveau » | Base de plats générale, étiquetée `diete` / `plaisir`, reliée par ingrédients | Les plats plaisir doivent pouvoir être adaptés |
| Ajout de recette | Coller un texte ou un lien → lecture du format standard `schema.org/Recipe` des sites (gratuit) → sinon API Claude → validation par l'utilisateur | Saisie manuelle = cause d'abandon |
| Adaptation | 3 modes au choix : **réajuster**, **alléger**, **compenser** | Choix de l'utilisateur, « ça dépend » |
| Levier calorique | **Féculents** | La collation seule ne pouvait retirer que 70 kcal |
| Journée | 2 modèles stockés comme données ; **défaut : 3 repas** (petit-déj banane + whey 230 kcal, repas 750, collation 400) | Choix de l'utilisateur. Les plats diète sont réajustés de ~650 à ~750 kcal |
| Logique | **Headless-first** : toute règle dans `packages/core`, fonctions pures testées | Imposé |

## 3. Vue d'ensemble

```
apps/mobile (Expo Router, 5 onglets : Olympe, Entraînement, Forger, Cuisine, Profil)   [tranche 3 ✔]
   │  écrans → hooks
   ├── adapters : Health Connect (pas, sommeil) · notifications · partage Android · API Claude (import)
   ▼
packages/db  (pilote SqlDriver, migrations, repositories, génération de semaine)          [tranche 3 ✔]
   ▼
packages/core  (TypeScript pur, sans React / Expo / base)                                 [tranche 1 ✔]
   domain.ts · units · nutrition (macros, ajustement) · recipes (portions, adaptation, exclusions)
   shopping (liste, texte à partager) · seed (ingrédients, recettes, substitutions, modèles de journée)
   planner ✔ · dates, vue des portions, export Markdown ✔ · training [tranche 6] · tracking [tranche 4]
```

## 4. Moteur d'adaptation (`recipes/adapt.ts`)

Entrée : un plat, le créneau visé (cible kcal + protéines du modèle de journée), les substitutions.

| Mode | Ce qu'il fait | Limites assumées |
|---|---|---|
| **Réajuster** | Un facteur par rôle d'ingrédient (viande 0,8-1,6 ; féculent 0,5-1,3 ; gras 0,3-1 ; sauce et sucre 0,5-1 ; légumes 0,8-2), descente coordonnée déterministe (pas de 0,05) qui minimise l'écart aux kcal et le manque de protéines, avec une pénalité pour rester proche de la recette | Le plat reste reconnaissable : un brownie ne deviendra jamais une collation à 50 g de protéines. L'app l'affiche au lieu de le cacher |
| **Alléger** | Applique les substitutions d'allègement : friture → air fryer, cuisse → filet, coco → light, crème → skyr, moitié du beurre → compote, une partie de la farine → whey, sucre −30 % | Seulement les substitutions connues de la base |
| **Compenser** | Garde le plat tel quel et retire l'excédent sur les autres créneaux du jour (30 % maximum chacun), traduit en grammes de riz cru | Avertit si l'excédent n'est pas absorbable, si la journée passe sous 1 900 kcal, ou si les protéines du jour chutent |

Exemples réels (modèle « 2 repas ») :
- Korean chicken au dîner (cible 850 / 65) : 861 kcal / 45 g P. **Réajuster** → 866 / 62 (viande ×1,5, féculent ×0,65). **Alléger** → 676 / 54 (air fryer, filet, sucre réduit).
- Brownie en collation (cible 450 / 50) : 241 kcal / 3 g P. **Compenser** → la journée finit à ~133 g de protéines, l'app le signale.

Prochaine étape [Probable] : combiner un plat plaisir avec un complément protéiné (brownie + skyr-whey) dans le même créneau.

## 4 bis. Planificateur (`planner/week.ts`)

Recherche déterministe : toutes les paires de recettes batch (A ≠ B), puis remplissage glouton des repas frais dans l'ordre chronologique.
Pour chaque repas frais, les candidats passent des filtres durs (temps, week-end, riz de la veille, verdict « non » de la compagne, 2 fois maximum, 4 occurrences maximum par semaine, pas deux fois d'affilée), puis un ordre de préférence quand la compagne est là : plats validés → plats déjà testés cette semaine → nouveau test sous le plafond → nouveau test au-delà (avertissement).
À palier égal, on choisit le coût le plus bas : restes d'ingrédients frais entamés (poids réel après arrondi aux conditionnements) + pénalité de répétition. Les portions de l'utilisateur sont réajustées à la cible du créneau ; celles de la compagne restent ⅔ / ½ de la recette d'origine.

## 5. Modèle de données

Typé dans `packages/core/src/domain.ts`. Unités canoniques g / ml / pièce ; les cuillères sont converties via la densité.

- **Référentiel** (seed puis SQLite) : `Ingredient` (rayon, unité d'achat, g par pièce, densité, conditionnements, macros pour 100 g, rôle, placard, alerte piège, congelable), `Recipe` (cuisine, créneaux, étiquettes, mode batch, matériel, durée frigo, riz de la veille, lignes, étapes, retours d'expérience), `Substitution` (dépannage ou allègement), `DayTemplate`.
- **Quotidien** (SQLite) : `RecipeRating`, `PlannedMeal` (avec jour de cuisson pour la règle de congélation), liste de courses cochée, stock placard, `WeighIn`, `DailyHealth`, séances et séries.

## 6. Feuille de route

| Tranche | Contenu | Statut |
|---|---|---|
| 0 | Planning et courses de la semaine sur tableur, sans app | À faire par l'utilisateur, maintenant |
| **1** | `packages/core` : domaine, seed (60 ingrédients, 23 recettes), portions, adaptation, exclusions, courses, texte à partager, règles d'ajustement ; 34 tests | **Fait** |
| **2** | Planificateur hebdo `planner/week.ts` : dimanche → samedi, batch A dimanche + batch B mercredi (utilisateur seul), dîners frais à deux, samedi midi frais, dimanche midi libre, ≤ 30 min (≤ 20 le mercredi), plafond de recettes à tester, riz de la veille, congélation / décongélation, report des courses au lundi, liste de courses ; 58 tests au total | **Fait** |
| **3** | App Expo SDK 58 (compatible Expo Go) + `packages/db` : Aujourd'hui (repas, rappels, « elle a aimé ? »), Cuisine (jours de la compagne, génération, semaine), fiche recette (portions toi / elle, batch, verdicts), courses à cocher + partage, plats plaisir (3 modes), Profil (modèle de journée, export Markdown) | **Fait** |
| 3b | Import de recettes : format standard des sites, puis API Claude | Clé API à fournir |
| 4 | Socle métriques : pesée 1 tap, import Google Takeout, bilan du dimanche, règles d'ajustement | |
| 5 | Health Connect (pas, sommeil total) | |
| 6 | Entraînement : séance du jour, saisie, minuteur, double progression (Hevy en attendant) | Programme à fournir |

Données nutritionnelles : valeurs **[Estimé]** à remplacer par la table **CIQUAL** (ANSES, licence ouverte), ingrédient par ingrédient (`ciqualCode`).

## 7. Risques

| Risque | Parade |
|---|---|
| Le développement remplace la diète | Tranche 0 immédiate |
| Retour de la compagne = choc de goûts | Note « plaît à la compagne » dès la tranche 3 |
| Données nutritionnelles à ±10 % | On juge sur la balance (moyenne hebdo), pas sur les kcal calculées |
| Saisie quotidienne trop lourde | Seules saisies quotidiennes : pesée + « hors plan oui / non » |
| Clé API Claude stockée sur le téléphone | Usage perso, stockage chiffré (`expo-secure-store`), plafond de dépense côté console Anthropic |

## Sources

- Google Health API et fin de l'API Fitbit : [About the Google Health API](https://developers.google.com/health/about), [newsletter](https://developers.google.com/health/newsletters), [Open Wearables](https://openwearables.io/blog/fitbit-web-api-shutdown-2026-migration-guide)
- Health Connect : [react-native-health-connect](https://matinzd.github.io/react-native-health-connect/docs/get-started), [FitMesh (source commerciale)](https://www.fitmesh.fit/en/sync/fitbit)
- Expo SQLite + Drizzle : [Drizzle](https://orm.drizzle.team/docs/quick-sqlite), [Expo](https://expo.dev/blog/modern-sqlite-for-react-native-apps)
- Alternatives : [Mealie / Tandoor / Grocy](https://sumguy.com/mealie-vs-tandoor-vs-grocy/)
- CIQUAL : [ANSES](https://www.anses.fr/en/node/79557), [data.gouv.fr](https://www.data.gouv.fr/fr/datasets/table-de-composition-nutritionnelle-des-aliments-ciqual/)
