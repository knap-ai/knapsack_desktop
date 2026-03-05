#!/usr/bin/env bash
set -euo pipefail

# sign-knapsack.sh — Deep-sign the Knapsack.app bundle for notarization.
#
# Usage (from the src/ directory):
#   SIGN_IDENTITY="Developer ID Application: Your Name (TEAMID)" bash scripts/sign-knapsack.sh
#
# Or let it auto-detect your Developer ID certificate:
#   bash scripts/sign-knapsack.sh
#
# The script signs every Mach-O binary inside the .app bundle with:
#   --options runtime   (hardened runtime, required for notarization)
#   --timestamp         (secure timestamp, required for notarization)
#   --force             (replace Tauri's default signature)
#
# Binaries are signed inside-out: embedded dylibs/frameworks first, then
# the main executable, then the .app bundle itself.

APP_BUNDLE="${1:-src-tauri/target/release/bundle/macos/Knapsack.app}"
IDENTITY="${SIGN_IDENTITY:-}"
ENTITLEMENTS="src-tauri/tauri.entitlements"

if [[ "${1:-}" == "--help" || "${1:-}" == "-h" ]]; then
  sed -n '3,16p' "$0"
  exit 0
fi

if [ ! -d "$APP_BUNDLE" ]; then
  echo "ERROR: App bundle not found: $APP_BUNDLE" >&2
  echo "Run this from the src/ directory after 'npm run tauri -- build'" >&2
  exit 1
fi

if [ ! -f "$ENTITLEMENTS" ]; then
  echo "ERROR: Entitlements file not found: $ENTITLEMENTS" >&2
  echo "Run this from the src/ directory." >&2
  exit 1
fi

# Auto-detect Developer ID Application certificate if not specified
if [ -z "$IDENTITY" ]; then
  IDENTITY="$(security find-identity -p codesigning -v 2>/dev/null \
    | awk -F'"' '/Developer ID Application/ { print $2; exit }')"
  if [ -z "$IDENTITY" ]; then
    echo "ERROR: No 'Developer ID Application' certificate found." >&2
    echo "Set SIGN_IDENTITY env var or install a Developer ID certificate." >&2
    exit 1
  fi
fi

echo "App bundle:  $APP_BUNDLE"
echo "Identity:    $IDENTITY"
echo "Entitlements: $ENTITLEMENTS"
echo ""

# Clear extended attributes (removes quarantine flags, stale signatures)
echo "Clearing extended attributes..."
xattr -cr "$APP_BUNDLE" 2>/dev/null || true

# Step 1: Sign all embedded dylibs, .so, and .node files (deepest first)
echo ""
echo "=== Signing embedded binaries ==="
SIGNED=0
while IFS= read -r -d '' f; do
  if /usr/bin/file "$f" | /usr/bin/grep -q "Mach-O"; then
    echo "  Signing: ${f#$APP_BUNDLE/}"
    codesign --force --options runtime --timestamp --sign "$IDENTITY" "$f"
    SIGNED=$((SIGNED + 1))
  fi
done < <(find "$APP_BUNDLE/Contents/Resources" -type f \( -name "*.dylib" -o -name "*.so" -o -name "*.node" \) -print0 2>/dev/null || true)
echo "  Signed $SIGNED resource binaries"

# Step 2: Sign any other Mach-O binaries in Resources (e.g., node binary)
echo ""
echo "=== Signing resource executables ==="
while IFS= read -r -d '' f; do
  if /usr/bin/file "$f" | /usr/bin/grep -q "Mach-O"; then
    # Skip files already signed above
    case "$f" in
      *.dylib|*.so|*.node) continue ;;
    esac
    echo "  Signing: ${f#$APP_BUNDLE/}"
    codesign --force --options runtime --timestamp --sign "$IDENTITY" "$f"
    SIGNED=$((SIGNED + 1))
  fi
done < <(find "$APP_BUNDLE/Contents/Resources" -type f -print0 2>/dev/null || true)

# Step 3: Sign any frameworks in Contents/Frameworks/
if [ -d "$APP_BUNDLE/Contents/Frameworks" ]; then
  echo ""
  echo "=== Signing frameworks ==="
  while IFS= read -r -d '' f; do
    if /usr/bin/file "$f" | /usr/bin/grep -q "Mach-O"; then
      echo "  Signing: ${f#$APP_BUNDLE/}"
      codesign --force --options runtime --timestamp --sign "$IDENTITY" "$f"
    fi
  done < <(find "$APP_BUNDLE/Contents/Frameworks" -type f -print0)

  # Sign framework bundles themselves
  find "$APP_BUNDLE/Contents/Frameworks" -name "*.framework" -print0 | while IFS= read -r -d '' fw; do
    echo "  Signing framework bundle: ${fw#$APP_BUNDLE/}"
    codesign --force --options runtime --timestamp --sign "$IDENTITY" "$fw"
  done
fi

# Step 4: Sign the main executable with entitlements
echo ""
echo "=== Signing main executable ==="
MAIN_BIN="$APP_BUNDLE/Contents/MacOS/Knapsack"
if [ -f "$MAIN_BIN" ]; then
  echo "  Signing: Contents/MacOS/Knapsack (with entitlements)"
  codesign --force --options runtime --timestamp --entitlements "$ENTITLEMENTS" --sign "$IDENTITY" "$MAIN_BIN"
else
  echo "ERROR: Main binary not found: $MAIN_BIN" >&2
  exit 1
fi

# Step 5: Sign the .app bundle itself
echo ""
echo "=== Signing app bundle ==="
codesign --force --options runtime --timestamp --entitlements "$ENTITLEMENTS" --sign "$IDENTITY" "$APP_BUNDLE"

# Step 6: Verify
echo ""
echo "=== Verifying ==="
codesign --verify --deep --strict --verbose=2 "$APP_BUNDLE"
echo ""
echo "Signing complete. You can now zip and submit for notarization:"
echo ""
echo "  cd $(dirname "$APP_BUNDLE")"
echo "  ditto -c -k --keepParent Knapsack.app Knapsack.zip"
echo "  xcrun notarytool submit Knapsack.zip --apple-id YOUR_EMAIL --team-id YOUR_TEAM_ID --password YOUR_APP_PASSWORD --wait"
echo "  xcrun stapler staple Knapsack.app"
