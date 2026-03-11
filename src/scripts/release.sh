#!/usr/bin/env bash
#
# release.sh — Creates a GitHub release and uploads build artifacts.
#
# Usage:  npm run release
#
# Reads the version from package.json, creates a GitHub release tag,
# and uploads any .dmg files found in the Tauri bundle output.
#
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

VERSION=$(node -p "require('$PROJECT_DIR/package.json').version")
TAG="v$VERSION"

BUNDLE_DIR="$PROJECT_DIR/src-tauri/target/release/bundle"

# Collect artifacts
ARTIFACTS=()

# macOS .dmg
for f in "$BUNDLE_DIR"/dmg/*.dmg; do
  [ -f "$f" ] && ARTIFACTS+=("$f")
done

# macOS .app.tar.gz (updater)
for f in "$BUNDLE_DIR"/macos/*.tar.gz; do
  [ -f "$f" ] && ARTIFACTS+=("$f")
done

# Linux .deb / .AppImage
for f in "$BUNDLE_DIR"/deb/*.deb; do
  [ -f "$f" ] && ARTIFACTS+=("$f")
done
for f in "$BUNDLE_DIR"/appimage/*.AppImage; do
  [ -f "$f" ] && ARTIFACTS+=("$f")
done

# Windows .msi / .exe
for f in "$BUNDLE_DIR"/msi/*.msi; do
  [ -f "$f" ] && ARTIFACTS+=("$f")
done
for f in "$BUNDLE_DIR"/nsis/*.exe; do
  [ -f "$f" ] && ARTIFACTS+=("$f")
done

if [ ${#ARTIFACTS[@]} -eq 0 ]; then
  echo "ERROR: No build artifacts found in $BUNDLE_DIR" >&2
  echo "       Run 'npm run tauri build' first." >&2
  exit 1
fi

echo "[release] Creating GitHub release $TAG with ${#ARTIFACTS[@]} artifact(s)…"

# Create release (or reuse existing) and upload artifacts
gh release create "$TAG" \
  --title "$TAG" \
  --generate-notes \
  "${ARTIFACTS[@]}" 2>/dev/null \
|| gh release upload "$TAG" "${ARTIFACTS[@]}" --clobber

echo "[release] ✓ Release $TAG published"
echo "[release]   $(gh release view "$TAG" --json url -q .url)"
