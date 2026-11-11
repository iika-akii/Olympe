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

## Construire l'APK (installation directe, sans Expo Go)

Prérequis : JDK 17 (exactement, exigé par React Native), Node 22, `pnpm install`, et un SDK Android (`ANDROID_HOME`, voir `apps/mobile/scripts/setup-android-sdk.sh`) avec
`platforms/android-37.0`, `build-tools/37.0.0`, `ndk/27.1.12297006`, `cmake/3.22.1`.

```bash
ANDROID_HOME=/chemin/vers/android-sdk apps/mobile/scripts/build-apk.sh
```

L'APK sort dans `apps/mobile/android/app/build/outputs/apk/release/app-release.apk` (arm64-v8a, signé avec la clé de debug du modèle Expo).
Sur le téléphone : autoriser l'installation depuis la source (navigateur, Fichiers…), puis ouvrir l'APK.

Alternative cloud : EAS Build (`apps/mobile/eas.json`, profil `preview`), avec un compte Expo gratuit.

## Tests

```bash
pnpm test
```

```bash
pnpm typecheck
```
