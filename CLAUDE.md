# Olympe

App perso diète, cuisine, courses, entraînement, suivi. Utilisateur unique, interface en français.

- Contexte et règles métier : `docs/CONTEXTE_UTILISATEUR.md` (fait foi)
- Architecture et décisions : `docs/ARCHITECTURE.md`
- Modèle de domaine : `packages/core/src/domain.ts`

## Règles de développement
- **Headless-first** : toute règle métier va dans `packages/core` (fonctions pures + tests Vitest) avant toute UI.
- `packages/core` n'importe jamais React, React Native, Expo ni la base de données.
- Recettes et ingrédients : seed TypeScript dans `packages/core/src/seed`, puis SQLite dans l'app. Le Markdown compatible Obsidian est un format d'export.
- Données du quotidien (plans, pesées, séances, notes) : SQLite via `packages/db`.
- Pas de backend : usage personnel, Android.
- Commandes : `pnpm install`, `pnpm test`, `pnpm typecheck`, `pnpm mobile` (serveur Expo).
- App : `apps/mobile`, Expo SDK 58, doit rester compatible Expo Go (pas de module natif hors Expo Go avant la tranche Health Connect). Lire `apps/mobile/AGENTS.md` avant de toucher une API Expo.
- Dans un conteneur sans accès à api.expo.dev : `EXPO_OFFLINE=1 npx expo install <paquet>` et `EXPO_OFFLINE=1 npx expo export --platform android|web`.
- Unités canoniques : g, ml, piece.
- Ne jamais ajouter au budget calorique les calories « brûlées » du Fitbit.
- Une information marquée « À confirmer » dans le contexte est demandée à l'utilisateur avant de coder la fonction concernée.
