#!/usr/bin/env bash
#
# release.sh — Creates a GitHub release and uploads build artifacts.
#
# Usage:  npm run release
#
# Reads the version from package.json, creates a GitHub release tag,
# and uploads build artifacts + a latest.json for the Tauri auto-updater.
#
# Prerequisites:
#   - TAURI_PRIVATE_KEY env var must be set (used by `tauri build` to generate
#     .sig signature files alongside updater artifacts).
#   - gh CLI must be authenticated.
#
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

VERSION=$(node -p "require('$PROJECT_DIR/package.json').version")
TAG="v$VERSION"

BUNDLE_DIR="$PROJECT_DIR/src-tauri/target/release/bundle"
GITHUB_REPO="knap-ai/knapsack_desktop"

# Collect artifacts
ARTIFACTS=()

# macOS .dmg
for f in "$BUNDLE_DIR"/dmg/*.dmg; do
  [ -f "$f" ] && ARTIFACTS+=("$f")
done

# macOS .app.tar.gz (updater) + .sig
for f in "$BUNDLE_DIR"/macos/*.tar.gz; do
  [ -f "$f" ] && ARTIFACTS+=("$f")
done
for f in "$BUNDLE_DIR"/macos/*.tar.gz.sig; do
  [ -f "$f" ] && ARTIFACTS+=("$f")
done

# Linux .deb / .AppImage + .sig
for f in "$BUNDLE_DIR"/deb/*.deb; do
  [ -f "$f" ] && ARTIFACTS+=("$f")
done
for f in "$BUNDLE_DIR"/appimage/*.AppImage; do
  [ -f "$f" ] && ARTIFACTS+=("$f")
done
for f in "$BUNDLE_DIR"/appimage/*.AppImage.tar.gz; do
  [ -f "$f" ] && ARTIFACTS+=("$f")
done
for f in "$BUNDLE_DIR"/appimage/*.AppImage.tar.gz.sig; do
  [ -f "$f" ] && ARTIFACTS+=("$f")
done

# Windows .msi / .exe + .sig
for f in "$BUNDLE_DIR"/msi/*.msi; do
  [ -f "$f" ] && ARTIFACTS+=("$f")
done
for f in "$BUNDLE_DIR"/msi/*.msi.zip; do
  [ -f "$f" ] && ARTIFACTS+=("$f")
done
for f in "$BUNDLE_DIR"/msi/*.msi.zip.sig; do
  [ -f "$f" ] && ARTIFACTS+=("$f")
done
for f in "$BUNDLE_DIR"/nsis/*.exe; do
  [ -f "$f" ] && ARTIFACTS+=("$f")
done
for f in "$BUNDLE_DIR"/nsis/*.nsis.zip; do
  [ -f "$f" ] && ARTIFACTS+=("$f")
done
for f in "$BUNDLE_DIR"/nsis/*.nsis.zip.sig; do
  [ -f "$f" ] && ARTIFACTS+=("$f")
done

if [ ${#ARTIFACTS[@]} -eq 0 ]; then
  echo "ERROR: No build artifacts found in $BUNDLE_DIR" >&2
  echo "       Run 'npm run tauri build' first." >&2
  exit 1
fi

# Verify DMG filenames match the expected version to prevent releasing stale builds
for f in "${ARTIFACTS[@]}"; do
  BASENAME="$(basename "$f")"
  if [[ "$BASENAME" == *.dmg ]] && [[ "$BASENAME" != *"$VERSION"* ]]; then
    echo "ERROR: DMG version mismatch!" >&2
    echo "       package.json version: $VERSION" >&2
    echo "       DMG filename:         $BASENAME" >&2
    echo "       Run 'npm run tauri build' to rebuild with the current version." >&2
    exit 1
  fi
done

# ---------------------------------------------------------------------------
# Generate latest.json for the Tauri auto-updater
# ---------------------------------------------------------------------------
# Tauri updater expects a JSON file with platform keys and download URLs.
# When TAURI_PRIVATE_KEY is set during `tauri build`, .sig files are produced
# alongside the updater bundles. We read those signatures into latest.json.
# ---------------------------------------------------------------------------

RELEASE_URL="https://github.com/$GITHUB_REPO/releases/download/$TAG"
LATEST_JSON="$BUNDLE_DIR/latest.json"
PUB_DATE=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

# Helper: read a .sig file's contents (single-line base64 signature)
read_sig() {
  local sig_file="$1"
  if [ -f "$sig_file" ]; then
    cat "$sig_file"
  else
    echo ""
  fi
}

# Detect available platform artifacts and build the platforms JSON
PLATFORMS=()

# macOS (darwin-x86_64 and darwin-aarch64 use the same universal .app.tar.gz)
MACOS_TAR=$(find "$BUNDLE_DIR/macos" -name "*.app.tar.gz" 2>/dev/null | head -1)
if [ -n "$MACOS_TAR" ] && [ -f "$MACOS_TAR" ]; then
  MACOS_TAR_NAME=$(basename "$MACOS_TAR")
  MACOS_SIG=$(read_sig "$MACOS_TAR.sig")
  MACOS_ENTRY=$(cat <<ENTRY
    "darwin-x86_64": {
      "url": "$RELEASE_URL/$MACOS_TAR_NAME",
      "signature": "$MACOS_SIG"
    },
    "darwin-aarch64": {
      "url": "$RELEASE_URL/$MACOS_TAR_NAME",
      "signature": "$MACOS_SIG"
    }
ENTRY
)
  PLATFORMS+=("$MACOS_ENTRY")
fi

# Linux (AppImage.tar.gz)
LINUX_TAR=$(find "$BUNDLE_DIR/appimage" -name "*.AppImage.tar.gz" 2>/dev/null | head -1)
if [ -n "$LINUX_TAR" ] && [ -f "$LINUX_TAR" ]; then
  LINUX_TAR_NAME=$(basename "$LINUX_TAR")
  LINUX_SIG=$(read_sig "$LINUX_TAR.sig")
  LINUX_ENTRY=$(cat <<ENTRY
    "linux-x86_64": {
      "url": "$RELEASE_URL/$LINUX_TAR_NAME",
      "signature": "$LINUX_SIG"
    }
ENTRY
)
  PLATFORMS+=("$LINUX_ENTRY")
fi

# Windows NSIS (.nsis.zip)
WIN_NSIS_ZIP=$(find "$BUNDLE_DIR/nsis" -name "*.nsis.zip" 2>/dev/null | head -1)
if [ -n "$WIN_NSIS_ZIP" ] && [ -f "$WIN_NSIS_ZIP" ]; then
  WIN_NSIS_NAME=$(basename "$WIN_NSIS_ZIP")
  WIN_NSIS_SIG=$(read_sig "$WIN_NSIS_ZIP.sig")
  WIN_ENTRY=$(cat <<ENTRY
    "windows-x86_64": {
      "url": "$RELEASE_URL/$WIN_NSIS_NAME",
      "signature": "$WIN_NSIS_SIG"
    }
ENTRY
)
  PLATFORMS+=("$WIN_ENTRY")
fi

# If no updater-compatible artifacts found, warn but continue (DMG-only releases)
if [ ${#PLATFORMS[@]} -eq 0 ]; then
  echo "[release] WARNING: No updater-compatible artifacts (.tar.gz / .nsis.zip) found."
  echo "          latest.json will NOT be generated."
  echo "          Ensure TAURI_PRIVATE_KEY is set when running 'tauri build'."
else
  # Join platform entries with commas
  PLATFORMS_JSON=""
  for i in "${!PLATFORMS[@]}"; do
    if [ "$i" -gt 0 ]; then
      PLATFORMS_JSON+=","
    fi
    PLATFORMS_JSON+=$'\n'"${PLATFORMS[$i]}"
  done

  cat > "$LATEST_JSON" <<EOF
{
  "version": "$TAG",
  "notes": "Knapsack $TAG",
  "pub_date": "$PUB_DATE",
  "platforms": {
$PLATFORMS_JSON
  }
}
EOF

  echo "[release] Generated latest.json for Tauri updater"
  ARTIFACTS+=("$LATEST_JSON")
fi

echo "[release] Creating GitHub release $TAG with ${#ARTIFACTS[@]} artifact(s)..."

# Create release (or reuse existing) and upload artifacts
gh release create "$TAG" \
  --title "$TAG" \
  --generate-notes \
  "${ARTIFACTS[@]}" 2>/dev/null \
|| gh release upload "$TAG" "${ARTIFACTS[@]}" --clobber

echo "[release] Release $TAG published"
echo "[release]   $(gh release view "$TAG" --json url -q .url)"
