#!/usr/bin/env bash
# Installe le SDK Android nécessaire à scripts/build-apk.sh (environ 1,5 Go).
# Usage : ANDROID_HOME=/root/android-sdk apps/mobile/scripts/setup-android-sdk.sh
# Réseau requis : dl.google.com (SDK et dépôt Maven Google).
set -euo pipefail

: "${ANDROID_HOME:=/root/android-sdk}"

# Le plugin Gradle de React Native exige un JDK 17.
if ! ls -d /usr/lib/jvm/java-17-openjdk-* >/dev/null 2>&1; then
  if command -v apt-get >/dev/null 2>&1 && [ "$(id -u)" = 0 ]; then
    apt-get update -qq && apt-get install -y -qq openjdk-17-jdk-headless
  else
    echo "Installer un JDK 17 (openjdk-17-jdk-headless) puis relancer." >&2
    exit 1
  fi
fi
CMDLINE_TOOLS="commandlinetools-linux-16111833_latest.zip"
PACKAGES=(platform-tools platforms/android-37.0 build-tools/37.0.0 ndk/27.1.12297006 cmake/3.22.1)

if [ ! -x "$ANDROID_HOME/cmdline-tools/latest/bin/android" ]; then
  tmp="$(mktemp -d)"
  curl -fsSL -o "$tmp/cmdline.zip" "https://dl.google.com/android/repository/$CMDLINE_TOOLS"
  unzip -q "$tmp/cmdline.zip" -d "$tmp"
  mkdir -p "$ANDROID_HOME/cmdline-tools"
  rm -rf "$ANDROID_HOME/cmdline-tools/latest"
  mv "$tmp/cmdline-tools" "$ANDROID_HOME/cmdline-tools/latest"
  rm -rf "$tmp"
fi

# Depuis 2026, `sdkmanager` est remplacé par la CLI `android` (paquets notés avec « / »).
"$ANDROID_HOME/cmdline-tools/latest/bin/android" --no-metrics --sdk="$ANDROID_HOME" sdk install "${PACKAGES[@]}"
echo "SDK prêt dans $ANDROID_HOME"
