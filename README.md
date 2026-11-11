# Olympe

App personnelle : diète, cuisine et courses, base de plats adaptable aux macros, entraînement, suivi du poids.

- `docs/CONTEXTE_UTILISATEUR.md` : profil, cibles et règles métier
- `docs/ARCHITECTURE.md` : décisions, architecture, feuille de route
- `packages/core` : logique métier pure et testée (planificateur, adaptation, courses…)
- `packages/db` : stockage SQLite (pilote, migrations, repositories)
- `apps/mobile` : app Expo (Android)

## Lancer l'app sur le téléphone (Expo Go)

Il faut un ordinateur avec Node 22 et le téléphone Android sur le même Wi-Fi.

1. Installer **Expo Go** depuis le Play Store.
2. Sur l'ordinateur :

```bash
git clone https://github.com/iika-akii/olympe.git
```

```bash
cd olympe && corepack enable && pnpm install
```

```bash
pnpm mobile
```

3. Scanner le QR code affiché avec Expo Go.

Sans ordinateur : construire un APK avec EAS (`apps/mobile/eas.json`, profil `preview`), qui demande un compte Expo gratuit.

## Tests

```bash
pnpm test
```

```bash
pnpm typecheck
```
