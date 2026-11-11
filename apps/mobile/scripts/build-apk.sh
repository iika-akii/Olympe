#!/usr/bin/env bash
# Construit un APK Android installable directement sur le téléphone (sans Play Store).
# - Build « release » (JS embarqué, pas besoin d'ordinateur ni d'Expo Go pour l'utiliser)
# - signé avec la clé de debug du modèle Expo : installable en « sources inconnues »
# - architecture arm64-v8a uniquement (tous les téléphones Android récents) pour réduire la taille
#
# Prérequis : JDK 17+, Node 22, pnpm install fait, et ANDROID_HOME pointant vers un SDK contenant
# platforms/android-37.0, build-tools/37.0.0, ndk/27.1.12297006, cmake/3.22.1.
set -euo pipefail

cd "$(dirname "$0")/.."
: "${ANDROID_HOME:?ANDROID_HOME doit pointer vers le SDK Android}"

# `expo prebuild` réécrit le script "android" de package.json : on le sauvegarde puis on le restaure.
backup="$(mktemp)"
cp package.json "$backup"
trap 'cp "$backup" package.json; rm -f "$backup"' EXIT

EXPO_OFFLINE="${EXPO_OFFLINE:-1}" CI=1 npx expo prebuild --platform android --no-install

(
  cd android
  ./gradlew assembleRelease \
    -PreactNativeArchitectures=arm64-v8a \
    -Dorg.gradle.jvmargs="-Xmx4g -XX:MaxMetaspaceSize=1g" \
    --no-daemon
)

apk="android/app/build/outputs/apk/release/app-release.apk"
ls -lh "$apk"
echo "APK : $(pwd)/$apk"
