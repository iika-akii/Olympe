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

Empreinte SHA-256 du certificat de signature (clé de debug du modèle Expo) :
`fac61745dc0903786fb9ede62a962b399f7348f0bb6f899b8332667591033b9c`.
Une nouvelle version ne s'installe par-dessus l'ancienne, sans perte de données, que si cette empreinte est identique
(vérifier avec `apksigner verify --print-certs`). Sinon Android impose de désinstaller, ce qui efface les données.

Dans un conteneur Claude Code : `apps/mobile/scripts/setup-android-sdk.sh` installe le JDK 17 et le SDK (hôte `dl.google.com` requis),
et `build-apk.sh` passe par le miroir Google de Maven Central (`scripts/maven-central-mirror.init.gradle`) pour éviter les erreurs 429.

Alternative cloud : EAS Build (`apps/mobile/eas.json`, profil `preview`), avec un compte Expo gratuit.

## Tests

```bash
pnpm test
```

```bash
pnpm typecheck
```
