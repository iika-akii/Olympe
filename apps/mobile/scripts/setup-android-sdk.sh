#!/usr/bin/env bash
# Installe le SDK Android nécessaire à scripts/build-apk.sh (environ 1,5 Go).
# Usage : ANDROID_HOME=/root/android-sdk apps/mobile/scripts/setup-android-sdk.sh
# Réseau requis : dl.google.com (SDK et dépôt Maven Google).
set -euo pipefail

: "${ANDROID_HOME:=/root/android-sdk}"
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
