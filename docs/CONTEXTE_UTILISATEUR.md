# Contexte utilisateur : diète, courses, repas, entraînement

> Fichier de contexte pour Claude Code. À placer à la racine du repo (ou à référencer depuis `CLAUDE.md`).
> Ces données décrivent l'utilisateur unique de l'app. Elles servent à générer les données de départ (seed), les règles métier et les tests.
> Légende : **[Certain]** = valeur fixée par l'utilisateur · **[Estimé]** = calcul, marge ±10 % · **[À confirmer]** = information manquante, à demander à l'utilisateur avant de coder la fonctionnalité concernée.

---

## 0. Avant de coder : décision de périmètre

L'utilisateur a déjà un projet **Olympe** (React Native + Expo, 5 onglets : Olympe, Entraînement, Forger, Cuisine, Profil), qui couvre déjà le suivi de diète, la planification de repas avec liste de courses et l'entraînement. L'ordre de construction prévu est : Cuisine → Entraînement → Socle métriques → Podomètre → Journal nutrition → Tes travaux → Forger → Coach.

**Décision du 9/11/2026** : le dépôt `iika-akii/Olympe` est créé de zéro (aucun code Olympe n'existait). Ce fichier sert de contexte à tout le projet.

Discipline de développement imposée : **headless-first**. Les règles métier, le modèle de données et les tests passent avant l'UI.

---

## 1. Profil

| Champ | Valeur | Statut |
|---|---|---|
| Sexe | Homme | Certain |
| Âge | 24 ans | Certain |
| Taille | 178 cm | Certain |
| Poids de départ | 100 kg (avant cela, 102 kg en septembre 2026) | Certain |
| Masse grasse | ~30 % (estimation de l'utilisateur) | Estimé |
| Objectif | 85 kg, perte de poids en préservant le muscle | Certain |
| Travail | Bureau, environ 7 h assis par jour | Certain |
| Horaires | Départ tôt, retour vers 17h30-18h | Certain |
| Objet connecté | Google Fitbit (pas, sommeil, dépense) | Certain |
| Téléphone | **Android** (lecture des pas et du sommeil via Health Connect) | Certain |
| Langue de l'app | Français | Certain |

---

## 2. Cibles nutritionnelles

| Paramètre | Valeur | Statut |
|---|---|---|
| Calories / jour | 2 100 à 2 200 kcal, sans cyclage entre jours d'entraînement et de repos | Certain |
| Plancher absolu | 1 900 kcal (l'app doit alerter en dessous) | Certain |
| Protéines | ~180 g / jour | Certain |
| Lipides | ~65 g / jour (plancher hormonal) | Estimé |
| Glucides | le reste (~200-220 g) | Estimé |
| BMR (Katch-McArdle) | ~1 900 kcal | Estimé |
| Dépense jour d'entraînement | ~2 700 kcal | Estimé |
| Dépense jour de repos | ~2 350 kcal | Estimé |
| Rythme visé | 0,4 à 0,5 kg / semaine | Estimé |

### Règles d'ajustement (à implémenter comme règles déterministes)

- On juge sur la **moyenne hebdomadaire** des pesées du matin à jeun, jamais sur une pesée isolée.
- Ajustement uniquement après **3 semaines** de données.
- Perte inférieure à 0,3 kg / semaine : baisser la cible de ~100 à 200 kcal (sans passer sous 1 900).
- Perte supérieure à 0,7 kg / semaine : monter de ~100 kcal (risque pour le muscle).
- **Le levier de réglage est le féculent** (décision du 9/11/2026, remplace « la collation est le levier », qui ne permettait de retirer que 70 kcal). Une baisse de 150 kcal ≈ 42 g de riz cru en moins par jour.
- **Ne jamais ajouter au budget les calories « brûlées » affichées par le Fitbit.**

---

## 3. Structure d'une journée type

> **Mise à jour du 9/11/2026.** Habitude actuelle : **pas de petit-déjeuner**, 2 plats + 1 collation (skyr, 30-45 g de whey, zeste de citron, fruits rouges, 2 spéculoos ≈ 365 kcal / 49 g P). Avec des plats à ~650 kcal, la journée tombe vers 1 650-1 750 kcal, **sous le plancher**. L'app propose donc deux modèles de journée, au choix [Estimé] :
>
> | Modèle | Petit-déj | Déjeuner | Collation | Dîner | Total |
> |---|---|---|---|---|---|
> | 2 repas + collation | — | 850 kcal / 65 g P | 450 / 50 | 850 / 65 | 2 150 / 180 |
> | **3 repas + collation (par défaut)** | 230 / 25 (banane + shaker de whey) | 750 / 60 | 400 / 45 | 750 / 55 | 2 130 / 185 |
>
> Modèle par défaut choisi le 9/11/2026 : **3 repas**, petit-déjeuner = banane + shaker de whey (30 g dans l'eau). Les recettes « diète » (570-680 kcal) sont réajustées à ~750 kcal par le moteur d'adaptation (environ +30 % de viande, +15 à 30 % de riz).
>
> Le tableau ci-dessous décrit l'ancienne journée type, gardée pour référence.

| Moment | Repas | Cible indicative |
|---|---|---|
| 5h-5h30 | Réveil. Whey dans l'eau en option | ~120 kcal / 25 g P (facultatif) |
| 6h-7h20 | Séance (lun, mer, jeu, ven), à jeun | |
| 8h-9h, au bureau | Petit-déjeuner batché (overnight oats protéinés) | ~560 kcal / 52 g P |
| ~12h-13h | Déjeuner en gamelle (batch), micro-ondes disponible | 600 à 680 kcal / ~50 g P |
| ~16h | Collation sucrée (peut être reportée en dessert) | ~260 à 300 kcal / ~22 g P |
| ~19h-20h | Dîner cuisiné frais | 600 à 680 kcal / ~50 g P |

**Règle métier** : une collation non prise à 16h est **reportée en dessert**, pas supprimée. Sinon la journée passe sous le plancher.

---

## 4. Préférences et contraintes alimentaires

| Sujet | Valeur | Statut |
|---|---|---|
| Cuisines explorées | Asiatique : thaï et japonaise | Certain |
| Poisson | Très peu. Seulement sardines et thon en boîte | Certain |
| Tofu | **Exclu** | Certain |
| Piment | Tolérance 1 sur 5 | Certain |
| Sucré | Aime le sucré, collation de préférence en dessert sucré | Certain |
| Crevettes | **Exclues** | Certain |
| Coriandre, champignons | **Exclus** | Certain |
| Approvisionnement | Supermarché classique avec rayon asiatique ; épicerie spécialisée seulement si indispensable | Certain |
| Matériel de cuisine | Poêle, casserole, micro-ondes, blender portable Ninja, **air fryer, four, plaque induction** | Certain |
| Wok, cuiseur à riz | **Non** (riz à la casserole ; karaage à l'air fryer) | Certain |
| Temps de cuisine | Batch : ~1h pour au moins 4 repas. Dîner frais en semaine : court | Certain |

### Contexte du foyer

- Vit en couple. La compagne est **absente en novembre 2026** (alternance). Pendant cette période, l'utilisateur cuisine pour lui seul.
- Quand elle est là : mêmes plats pour les deux, **portion de la compagne ≈ 2/3** de celle de l'utilisateur (**1/2 pour la viande**). Leurs goûts diffèrent, et c'est une cause d'abandon de la diète.
- Notes de départ (9/11/2026) : **toutes les recettes du seed plaisent à l'utilisateur** ; la compagne n'en a goûté aucune (« à tester »).
- Dates de présence de la compagne : **saisies par l'utilisateur dans l'app** (calendrier), pas de date fixe.
- Partage : l'app est **strictement personnelle**. Seul besoin : **envoyer la liste de courses** à la compagne (texte via le menu de partage Android).
- **Exigence pour l'app** : chaque recette doit pouvoir sortir 2 portions différentes (utilisateur / compagne) à partir d'un seul batch, et les recettes doivent pouvoir être notées « plaît aussi à la compagne : oui / non / à tester ».

---

## 5. Système de repas (règles métier pour le planificateur)

> **Organisation validée le 11/11/2026.**
> - Semaine planifiée = du **dimanche des courses au samedi**.
> - **Batchs pour l'utilisateur seul** (gamelles du travail) : batch A le **dimanche** (midis lundi → mercredi), batch B le **mercredi soir** (jeudi, vendredi).
> - **Dîners frais à deux** tous les soirs quand la compagne est là, plus le **samedi midi**. **Dimanche midi = repas libre** (plat plaisir, adapté au choix).
> - Dîners en semaine : **30 min maximum** ; mercredi (soir de batch) : **20 min maximum**.
> - Compagne : **2 nouvelles recettes « à tester » par semaine au plus**, chacune servie 2 fois au plus ; le plafond n'est dépassé, avec un avertissement, que si aucun plat validé ne permet de remplir la semaine.
> - Variété : jamais deux repas frais identiques d'affilée ; un même plat au plus 4 fois par semaine, batch compris.
> - Petit-déjeuner et collation sont des habitudes fixes : ils ne sont pas réajustés.

1. **Midi = batch, soir = cuisine fraîche.**
2. **Mutualisation des ingrédients** entre batchs et dîners de la même semaine. Exemples : une barquette de poulet de 700-800 g couvre le batch et un ou deux dîners ; un concombre est fini sur deux repas consécutifs. Le planificateur doit minimiser les restes d'ingrédients entamés.
3. **Riz cuit : 3 jours maximum au frigo.** Une semaine de 5 midis demande donc 2 sessions de batch (ex. dimanche ×3 et mercredi ×3).
4. **Viande achetée en début de semaine et consommée à partir de J+3 : à congeler** à l'achat. L'app génère le rappel « congeler X g » et « sortir la veille au soir ».
5. Le riz sauté (khao pad, yakimeshi) utilise du riz cuit **la veille**, jamais de plus de 2 jours.
6. Sauces stockées à côté des féculents quand c'est possible, pour la texture au réchauffage.
7. **Pesée** : riz pesé cru ; riz cuit pesé au total puis divisé par le nombre de portions.
8. Monotonie : au moins 3 plats différents par semaine sur les 10 repas, pour limiter le risque d'abandon.
9. Mode dégradé (semaine perturbée) : portions protéinées à chaque repas, pesée quotidienne maintenue, reprise complète le lundi suivant.

---

## 6. Base de recettes de départ (seed)

> **Mise à jour du 9/11/2026.** La base de plats n'est **pas réservée à la diète** : elle accueille aussi les plats essayés le week-end (ex. korean chicken, brownie), étiquetés « plaisir ». Les plats « diète » sont recommandés par défaut. Pour un plat « plaisir », l'utilisateur choisit à chaque fois comment l'adapter : **réajuster** les quantités, **alléger** (substitutions), ou **compenser** sur les autres repas de la journée.
> Ajout d'une recette : **coller un texte ou un lien** ; l'app lit le format standard des sites de recettes, sinon l'API Claude structure la recette, puis l'utilisateur valide.

Valeurs par portion utilisateur. Toutes **[Estimé]** ±10 %.

| Recette | Cuisine | kcal | P (g) | Ingrédients clés (portion) | Batch ? |
|---|---|---|---|---|---|
| Poulet teriyaki, brocoli, edamame | JP | ~600 | 58 | poulet 180 g, riz 60 g cru, brocoli 150 g, edamame 60 g, soja, mirin, miel | Oui |
| Gyudon | JP | ~600 | 48 | bœuf maigre 180 g, oignon, soja, mirin, gingembre, riz 75 g | Non (frais) |
| Oyakodon | JP | ~670 | 55 | poulet 180 g, 1 œuf + 2 blancs, oignon, soja, mirin, riz 75 g | Non |
| Curry japonais | JP | ~660 | 48 | poulet 180 g, pomme de terre, carotte, oignon, **1 carré de roux max**, riz 65 g | Oui |
| Soboro don | JP | ~640 | 58 | poulet haché 180 g, œuf brouillé, haricots verts, riz 70 g | Oui |
| Yakimeshi (riz sauté) | JP | ~680 | 55 | poulet 180 g, riz cuit la veille, 2 œufs, carotte, ciboule | Non |
| Curry jaune de poulet | TH | ~650 | 50 | poulet 180 g, **coco light 100 ml max**, poivron, oignon, pâte de curry jaune, riz 70 g | Oui |
| Pad kra pao | TH | ~630 | 52 | poulet haché 200 g, haricots verts, sauce soja et huître, basilic, riz 75 g | Non |
| Larb gai | TH | ~570 | 50 | poulet haché 200 g, citron vert, nuoc-mâm, menthe, échalote, riz 70 g | Non |
| Bœuf sauce huître et brocoli | TH | ~670 | 50 | rumsteak 180 g, brocoli 200 g, sauce huître, ail, riz 75 g | Oui |
| Poulet sauté au gingembre | TH | ~600 | 50 | poulet 180 g, gingembre, oignon, haricots verts, sauce huître, riz 75 g | Non |
| Khao pad | TH | ~680 | 55 | poulet 180 g, riz de la veille, 1 œuf, tomate, oignon, soja | Non |
| Ramen shoyu au poulet | JP | ~650 | 50 | bouillon, nouilles 80 g, poulet, œuf mollet | Week-end |
| Karaage au four | JP | ~700 | 50 | cuisses désossées, fécule, chou, riz 60 g | Week-end |
| Gyozas poulet-chou (12) | JP | ~550 | 40 | poulet haché, chou, feuilles à gyoza | Week-end |
| Overnight oats protéinés | Petit-déj | ~560 | 52 | flocons d'avoine, chia, whey, fromage blanc | Oui (2× / sem) |
| Verrine cheesecake skyr-spéculoos | Collation | ~260 | 22 | skyr 200 g, 2 spéculoos, fruits rouges 80 g, miel 5 g | Préparable J-1 |
| Riz au lait coco-mangue protéiné | Collation | ~330 | 25 | riz rond, lait, coco light, whey, mangue | Oui (×4) |
| Onigiris thon-mayo (×2) | Collation | ~350 | 30 | riz 60 g cru, thon naturel, mayo light | Non (minute) |
| Edamame salés | Collation | ~180 | 17 | 150 g écossés | Oui |

### Retours d'expérience à encoder

- **Sauce teriyaki** : ne pas ajouter d'eau. Saisir le poulet en 2 fois, le retirer, puis réduire la sauce seule à feu vif. Variante sans mirin : 40 ml de vinaigre de riz + 20 g de miel en plus pour 4 portions.
- **Substitutions** à modéliser comme données (ingrédient → remplaçant + ratio) : mirin → vinaigre de riz + miel ; pâte de curry jaune → pâte rouge à demi-dose ; basilic thaï → basilic classique ; mangue surgelée → ananas ou fruits rouges.
- Ingrédients « pièges » à marquer avec une alerte : lait de coco classique (+60 kcal / portion par rapport au light), roux de curry japonais (1 carré par portion), huile (1 c. à café pour 4 portions).

---

## 7. Courses

- Liste générée depuis le planning de la semaine, **regroupée par rayon** dans cet ordre : Volaille et boucherie, Fruits et légumes, Crèmerie, Surgelés, Épicerie et rayon asiatique, Épicerie sucrée, Placard à vérifier.
- Chaque ligne indique : quantité totale, **les repas qui l'utilisent**, et une note éventuelle (congeler, substitution).
- Quantités arrondies aux conditionnements du commerce (barquettes de poulet de 700-800 g, sachets de surgelés de 1 kg).
- Gestion du **stock placard** (sauces, riz, miel, épices) : déduit de la liste quand c'est déjà en stock.
- Cases à cocher persistantes pendant les courses.
- Contrainte réelle : les supermarchés ferment le dimanche vers 12h30-13h. Si les courses ne sont pas faites le dimanche matin, le planificateur décale le premier batch et propose une solution pour le lundi midi.

---

## 8. Entraînement

| Paramètre | Valeur | Statut |
|---|---|---|
| Split | Upper / lower, 4 séances par semaine | Certain |
| Jours | Lundi, mercredi, jeudi, vendredi | Certain |
| Créneau | 6h00-7h20, échauffement compris (durée max 1h20) | Certain |
| Format | Supersets antagonistes ; 3 séries sur les gros mouvements ; durée visée 60-65 min | Certain |
| Repos | 2 min, **chronométrés** (minuteur intégré à l'app) | Certain |
| Progression | Double progression | Certain |
| Finishers | Avant-bras et abdos (2-3 exercices) en fin de séance | Certain |
| Jours de repos | Salle légère le matin : abdos courts et marche inclinée | Certain |
| Matériel à la maison | Élastiques uniquement | Certain |
| Liste exacte des exercices, séries, répétitions | Non fournie | **À confirmer** |
| Objectif abdos | Esthétique (la visibilité dépend du taux de masse grasse, pas du volume d'abdos) | Certain |

Fonctions attendues : séance du jour, saisie charge × reps par série, suggestion de progression (double progression), minuteur de repos, historique par exercice, plan B si un poste est occupé (on abandonne le superset).

---

## 9. Suivi et bilan hebdomadaire

Bilan **chaque dimanche** :
- Moyenne des 7 pesées du matin à jeun
- Nombre moyen de pas
- Sommeil moyen
- Séances faites sur 4
- Nombre de repas hors plan

L'app affiche la tendance et applique les règles du §2. Pas de réaction aux variations d'un jour sur l'autre.

---

## 10. Historique d'adhérence (à garder en tête pour l'UX)

- Deux tentatives précédentes ont échoué. **C'est la diète qui a lâché, pas les séances.** Causes : vacances, emménagement en couple, goûts différents dans le couple.
- Conséquence pour l'app : réduire la friction au maximum (peu de recettes à la fois, planning prêt à suivre, liste de courses en un clic). Les fonctions qui demandent de saisir beaucoup chaque jour risquent d'être abandonnées.

---

## 11. Questions ouvertes à poser à l'utilisateur

Résolues le 9/11/2026 : nouveau projet (§0) ; crevettes, coriandre, champignons exclus ; pas de wok ni de cuiseur à riz ; Android ; levier = féculents ; pesées historiques dans l'app Fitbit (import via l'export Google Takeout).

Restantes, à poser au début de la tranche concernée :
1. Programme d'entraînement détaillé : exercices, séries, répétitions, charges actuelles (tranche Entraînement). L'utilisateur le fournira.
2. Clé API Anthropic pour l'import de recettes par IA (tranche Import) : saisie dans l'app, jamais dans le chat ni dans le dépôt.

Résolues ensuite (9/11/2026) : modèle de journée par défaut = 3 repas ; recettes du seed toutes aimées, compagne « à tester » ; dates de la compagne saisies dans l'app.
