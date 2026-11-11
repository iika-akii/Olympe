#!/usr/bin/env bash
# Construit un APK Android installable directement sur le téléphone (sans Play Store).
# - Build « release » (JS embarqué, pas besoin d'ordinateur ni d'Expo Go pour l'utiliser)
# - signé avec la clé de debug du modèle Expo : installable en « sources inconnues »
# - architecture arm64-v8a uniquement (tous les téléphones Android récents) pour réduire la taille
#
# Prérequis : JDK 17 (exigé par le plugin Gradle de React Native ; JAVA_HOME ou /usr/lib/jvm/java-17-*),
# Node 22, pnpm install fait, et ANDROID_HOME pointant vers un SDK contenant
# platforms/android-37.0, build-tools/37.0.0, ndk/27.1.12297006, cmake/3.22.1.
set -euo pipefail

cd "$(dirname "$0")/.."
: "${ANDROID_HOME:?ANDROID_HOME doit pointer vers le SDK Android}"

# Le plugin Gradle de React Native demande une chaîne d'outils Java 17.
if [ -z "${JAVA_HOME:-}" ] || ! "$JAVA_HOME/bin/java" -version 2>&1 | grep -q 'version "17'; then
  for candidate in /usr/lib/jvm/java-17-openjdk-*; do
    [ -x "$candidate/bin/java" ] && export JAVA_HOME="$candidate" && break
  done
fi
"${JAVA_HOME:?JDK 17 introuvable : installer openjdk-17-jdk-headless}/bin/java" -version 2>&1 | grep -q 'version "17' || { echo "JAVA_HOME doit pointer vers un JDK 17" >&2; exit 1; }

# `expo prebuild` réécrit le script "android" de package.json : on le sauvegarde puis on le restaure.
backup="$(mktemp)"
cp package.json "$backup"
trap 'cp "$backup" package.json; rm -f "$backup"' EXIT

EXPO_OFFLINE="${EXPO_OFFLINE:-1}" CI=1 npx expo prebuild --platform android --no-install

# Maven Central limite le débit (HTTP 429) derrière un proxy partagé : peu de parallélisme et reprises longues.
(
  cd android
  ./gradlew assembleRelease \
    --init-script ../scripts/maven-central-mirror.init.gradle \
    -PreactNativeArchitectures=arm64-v8a \
    -Dorg.gradle.jvmargs="-Xmx4g -XX:MaxMetaspaceSize=1g" \
    -Dorg.gradle.internal.repository.max.retries=10 \
    -Dorg.gradle.internal.repository.initial.backoff=5000 \
    --max-workers=2 \
    --no-daemon
)

apk="android/app/build/outputs/apk/release/app-release.apk"
ls -lh "$apk"
echo "APK : $(pwd)/$apk"
