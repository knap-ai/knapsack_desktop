#!/usr/bin/env bash
#
# restyle-dmg.sh — Restyle a Tauri-built DMG with a background image and
# proper Finder layout. Run this after `npm run tauri build` to improve
# the DMG appearance on macOS.
#
# Usage:
#   bash scripts/restyle-dmg.sh [path/to/existing.dmg]
#
# If no DMG path is given, it searches the standard Tauri output directories.
#
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

DMG_INPUT="${1:-}"

# Auto-detect DMG if not provided
if [[ -z "$DMG_INPUT" ]]; then
  for dir in \
    "$PROJECT_DIR/src-tauri/target/universal-apple-darwin/release/bundle/dmg" \
    "$PROJECT_DIR/src-tauri/target/release/bundle/dmg" \
    "$PROJECT_DIR/src-tauri/target/aarch64-apple-darwin/release/bundle/dmg" \
    "$PROJECT_DIR/src-tauri/target/x86_64-apple-darwin/release/bundle/dmg"; do
    if [[ -d "$dir" ]]; then
      DMG_INPUT=$(find "$dir" -name "*.dmg" -print -quit 2>/dev/null || true)
      [[ -n "$DMG_INPUT" ]] && break
    fi
  done
fi

if [[ -z "$DMG_INPUT" || ! -f "$DMG_INPUT" ]]; then
  echo "ERROR: No DMG found. Build first with 'npm run tauri build' or pass a path." >&2
  exit 1
fi

echo "Restyling DMG: $DMG_INPUT"

# Extract app name from the DMG
VOLUME_NAME=$(hdiutil imageinfo "$DMG_INPUT" 2>/dev/null | grep -m1 "partition-name" | sed 's/.*: //' || echo "Knapsack")
[[ -z "$VOLUME_NAME" ]] && VOLUME_NAME="Knapsack"
APP_NAME="$VOLUME_NAME"
echo "Volume name: $VOLUME_NAME"

# Mount original DMG read-only and copy contents
ORIG_MOUNT="$(mktemp -d /tmp/knapsack-orig.XXXXXX)"
hdiutil attach "$DMG_INPUT" -mountpoint "$ORIG_MOUNT" -nobrowse -readonly

DMG_TEMP="$(mktemp -d /tmp/knapsack-dmg.XXXXXX)"
# Copy app and create Applications symlink
for item in "$ORIG_MOUNT"/*.app; do
  [[ -d "$item" ]] && cp -R "$item" "$DMG_TEMP/"
done
ln -s /Applications "$DMG_TEMP/Applications"

hdiutil detach "$ORIG_MOUNT" -quiet
rmdir "$ORIG_MOUNT"

# Determine size
APP_SIZE_MB=$(du -sm "$DMG_TEMP" | awk '{print $1}')
DMG_SIZE_MB=$((APP_SIZE_MB + 80))

# Create RW DMG
DMG_RW="${DMG_INPUT%.dmg}-rw.dmg"
rm -f "$DMG_RW"
hdiutil create -volname "$VOLUME_NAME" -srcfolder "$DMG_TEMP" \
  -ov -format UDRW -size "${DMG_SIZE_MB}m" "$DMG_RW"
rm -rf "$DMG_TEMP"

# Mount RW DMG
DMG_MOUNT="/Volumes/$VOLUME_NAME"
if [[ -d "$DMG_MOUNT" ]]; then
  hdiutil detach "$DMG_MOUNT" -force 2>/dev/null || true
  sleep 1
fi
hdiutil attach "$DMG_RW" -mountpoint "$DMG_MOUNT" -nobrowse

# Copy background image
DMG_BG="$PROJECT_DIR/src-tauri/icons/dmg-background.png"
if [[ -f "$DMG_BG" ]]; then
  mkdir -p "$DMG_MOUNT/.background"
  cp "$DMG_BG" "$DMG_MOUNT/.background/background.png"
  echo "Background image applied."
else
  echo "WARNING: Background image not found at $DMG_BG" >&2
fi

# Apply Finder styling
echo "Applying Finder styling..."
osascript <<APPLESCRIPT
tell application "Finder"
  tell disk "$VOLUME_NAME"
    open
    set current view of container window to icon view
    set toolbar visible of container window to false
    set statusbar visible of container window to false
    set the bounds of container window to {400, 100, 1060, 500}
    set viewOptions to the icon view options of container window
    set arrangement of viewOptions to not arranged
    set icon size of viewOptions to 128
    if exists file ".background:background.png" then
      set background picture of viewOptions to file ".background:background.png"
    end if
    set text size of viewOptions to 13
    set label position of viewOptions to bottom
    set position of item "${APP_NAME}.app" of container window to {180, 170}
    set position of item "Applications" of container window to {480, 170}
    update without registering applications
    delay 2
    close
    open
    delay 1
  end tell
end tell
APPLESCRIPT

sleep 2
osascript -e 'tell application "Finder" to close every window' || true

# Detach
for i in {1..5}; do
  if hdiutil detach "$DMG_MOUNT" -quiet 2>/dev/null; then break; fi
  [[ "$i" == "3" ]] && hdiutil detach "$DMG_MOUNT" -force 2>/dev/null || true
  sleep 2
done

# Convert to compressed read-only DMG (overwrite original)
echo "Converting to compressed DMG..."
rm -f "$DMG_INPUT"
hdiutil convert "$DMG_RW" -format UDZO -o "$DMG_INPUT" -ov
rm -f "$DMG_RW"

echo "✅ Restyled DMG: $DMG_INPUT"
