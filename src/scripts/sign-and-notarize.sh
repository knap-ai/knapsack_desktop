#!/usr/bin/env bash
#
# sign-and-notarize.sh — Complete macOS code-signing & notarization script.
#
# 1. Strips unsigned node-llama-cpp binaries (app falls back to remote providers)
# 2. Signs ALL embedded binaries inside-out (.node → .dylib → executables → Node.js → main → bundle)
# 3. Optionally notarizes + staples the app
#
# Usage:
#   cd src/
#   npm run tauri -- build
#   bash scripts/sign-and-notarize.sh           # sign only
#   bash scripts/sign-and-notarize.sh --notarize # sign + notarize + staple
#
# Environment variables (set in .env.signing or export before running):
#
#   SIGN_IDENTITY       — Developer ID Application certificate name or SHA-1.
#                         Auto-detected from keychain when not set.
#   APPLE_ID            — Your Apple ID email (required for --notarize)
#   APPLE_TEAM_ID       — Your Apple Developer Team ID (required for --notarize)
#   APPLE_APP_PASSWORD  — App-specific password from https://appleid.apple.com
#                         (required for --notarize)
#
# You can store these in src/.env.signing (git-ignored) to avoid re-entering:
#
#   export SIGN_IDENTITY="Developer ID Application: Your Name (TEAMID)"
#   export APPLE_ID="your@email.com"
#   export APPLE_TEAM_ID="TEAMID"
#   export APPLE_APP_PASSWORD="xxxx-xxxx-xxxx-xxxx"
#
set -euo pipefail

# ---------------------------------------------------------------------------
# Parse arguments
# ---------------------------------------------------------------------------
DO_NOTARIZE=false
for arg in "$@"; do
  case "$arg" in
    --notarize) DO_NOTARIZE=true ;;
    *) echo "Unknown argument: $arg"; exit 1 ;;
  esac
done

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

# ---------------------------------------------------------------------------
# Source .env.signing if it exists
# ---------------------------------------------------------------------------
if [ -f "$PROJECT_DIR/.env.signing" ]; then
  echo "[sign] Loading credentials from .env.signing"
  # shellcheck disable=SC1091
  source "$PROJECT_DIR/.env.signing"
fi

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------
APP_ENTITLEMENTS="$PROJECT_DIR/src-tauri/tauri.entitlements"
NODE_ENTITLEMENTS="$PROJECT_DIR/../build/entitlements/node.entitlements.plist"
# Check for universal build first, then fall back to standard
UNIVERSAL_BUNDLE="$PROJECT_DIR/src-tauri/target/universal-apple-darwin/release/bundle/macos"
STANDARD_BUNDLE="$PROJECT_DIR/src-tauri/target/release/bundle/macos"

if [ -d "$UNIVERSAL_BUNDLE" ]; then
  BUNDLE_DIR="$UNIVERSAL_BUNDLE"
  echo "[sign] Using universal binary bundle"
else
  BUNDLE_DIR="$STANDARD_BUNDLE"
fi

# ---------------------------------------------------------------------------
# Locate the .app bundle
# ---------------------------------------------------------------------------
APP_PATH=""
for app in "$BUNDLE_DIR"/*.app; do
  if [ -d "$app" ]; then
    APP_PATH="$app"
    break
  fi
done

if [ -z "$APP_PATH" ]; then
  echo "ERROR: No .app bundle found in $BUNDLE_DIR" >&2
  exit 1
fi

echo "[sign] Found app bundle: $APP_PATH"
CONTENTS="$APP_PATH/Contents"

remove_legacy_coderesources() {
  local app_path="$1"
  local legacy="$app_path/Contents/CodeResources"

  if [ -e "$legacy" ]; then
    echo "[sign] Removing stray legacy CodeResources file: $legacy"
    rm -f "$legacy"
  fi
}

assert_no_legacy_coderesources() {
  local app_path="$1"
  local legacy="$app_path/Contents/CodeResources"

  if [ -e "$legacy" ]; then
    echo "ERROR: Unexpected $legacy; only Contents/_CodeSignature/CodeResources is allowed." >&2
    exit 1
  fi
}

# ---------------------------------------------------------------------------
# Verify the .app version matches package.json (catch stale builds)
# ---------------------------------------------------------------------------
EXPECTED_VERSION=$(node -p "require('$PROJECT_DIR/package.json').version")
APP_VERSION=$(/usr/libexec/PlistBuddy -c "Print :CFBundleShortVersionString" "$CONTENTS/Info.plist" 2>/dev/null || echo "unknown")

if [ "$APP_VERSION" != "$EXPECTED_VERSION" ]; then
  echo "ERROR: App version mismatch — signing a stale build!" >&2
  echo "       package.json version: $EXPECTED_VERSION" >&2
  echo "       .app bundle version:  $APP_VERSION" >&2
  echo "       Run 'npm run tauri build' to rebuild with the current version." >&2
  exit 1
fi
echo "[sign] Version verified: $APP_VERSION"

# ---------------------------------------------------------------------------
# Verify entitlements files exist
# ---------------------------------------------------------------------------
for f in "$APP_ENTITLEMENTS" "$NODE_ENTITLEMENTS"; do
  if [ ! -f "$f" ]; then
    echo "ERROR: Entitlements file not found: $f" >&2
    exit 1
  fi
done

# ---------------------------------------------------------------------------
# Detect or use provided signing identity
# ---------------------------------------------------------------------------
if [ -z "${SIGN_IDENTITY:-}" ]; then
  SIGN_IDENTITY=$(security find-identity -v -p codesigning | \
    grep "Developer ID Application" | \
    head -1 | \
    sed -E 's/.*"(Developer ID Application[^"]+)".*/\1/')

  if [ -z "$SIGN_IDENTITY" ]; then
    echo "ERROR: No Developer ID Application certificate found in keychain." >&2
    echo "       Set SIGN_IDENTITY env var or install a valid certificate." >&2
    exit 1
  fi
fi

echo "[sign] Signing identity: $SIGN_IDENTITY"

# ---------------------------------------------------------------------------
# 1. Strip node-llama-cpp binaries (unsigned, not needed — remote fallback)
# ---------------------------------------------------------------------------
RESOURCES="$CONTENTS/Resources"
# Remove both node-llama-cpp and @node-llama-cpp (scoped package)
for LLAMA_DIR in \
  "$RESOURCES/resources/clawdbot/node_modules/node-llama-cpp" \
  "$RESOURCES/resources/clawdbot/node_modules/@node-llama-cpp"; do
  if [ -d "$LLAMA_DIR" ]; then
    echo "[sign] Removing $(basename "$LLAMA_DIR") directory..."
    rm -rf "$LLAMA_DIR"
  fi
done

# Remove hoisted node-llama-cpp artifacts (matches both scoped and unscoped)
while IFS= read -r -d '' f; do
  echo "[sign]   Removing stray llama binary: $f"
  rm -f "$f"
done < <(find "$RESOURCES" \( -path "*/node-llama-cpp*" -o -path "*/@node-llama-cpp*" \) \( -name "*.node" -o -name "*.dylib" -o -name "*.so" \) -print0 2>/dev/null || true)

# ---------------------------------------------------------------------------
# 2. Clear extended attributes
# ---------------------------------------------------------------------------
echo "[sign] Clearing extended attributes..."
xattr -cr "$APP_PATH"

# Tauri/codesign should only keep the resource seal in
# Contents/_CodeSignature/CodeResources. A stray legacy Contents/CodeResources
# file can be copied into DMGs and confuse downstream verification after users
# drag the app into /Applications.
remove_legacy_coderesources "$APP_PATH"

# ---------------------------------------------------------------------------
# 3. Sign all native .node addon files
# ---------------------------------------------------------------------------
echo "[sign] Signing .node native addons..."
NODE_COUNT=0
while IFS= read -r -d '' f; do
  codesign --force --options runtime --timestamp --sign "$SIGN_IDENTITY" "$f"
  NODE_COUNT=$((NODE_COUNT + 1))
done < <(find "$APP_PATH" -name "*.node" -print0 2>/dev/null || true)
echo "[sign]   Signed $NODE_COUNT .node file(s)"

# ---------------------------------------------------------------------------
# 4. Sign all .dylib and .so files
# ---------------------------------------------------------------------------
echo "[sign] Signing .dylib and .so files..."
DYLIB_COUNT=0
while IFS= read -r -d '' f; do
  codesign --force --options runtime --timestamp --sign "$SIGN_IDENTITY" "$f"
  DYLIB_COUNT=$((DYLIB_COUNT + 1))
done < <(find "$APP_PATH" \( -name "*.dylib" -o -name "*.so" \) -print0 2>/dev/null || true)
echo "[sign]   Signed $DYLIB_COUNT .dylib/.so file(s)"

# ---------------------------------------------------------------------------
# 5. Sign all Mach-O executables (replaces the brittle filename whitelist).
#
# Strategy: find every regular file in Resources, check if it is a Mach-O
# binary via `file`, skip already-handled .node/.dylib/.so files, and sign
# with NODE_ENTITLEMENTS so spawned child processes (exec tool, cron, etc.)
# inherit the JIT + network entitlements rather than running under the most
# restrictive hardened-runtime defaults.  Without this, macOS SIGKILLs any
# child process spawned by the gateway that tries to execute dynamic code.
# ---------------------------------------------------------------------------
echo "[sign] Signing Mach-O executables (all, with JIT entitlements)..."
EXEC_COUNT=0
while IFS= read -r -d '' f; do
  # Skip files already handled in steps 3 and 4
  case "$f" in *.node|*.dylib|*.so) continue ;; esac
  # Only sign actual Mach-O binaries (skip scripts, JSON, etc.)
  if file "$f" 2>/dev/null | grep -qE "Mach-O|executable|binary"; then
    codesign --force --options runtime --timestamp \
      --entitlements "$NODE_ENTITLEMENTS" \
      --sign "$SIGN_IDENTITY" "$f" 2>/dev/null || true
    EXEC_COUNT=$((EXEC_COUNT + 1))
  fi
done < <(find "$APP_PATH/Contents/Resources" -type f -print0 2>/dev/null || true)
echo "[sign]   Signed $EXEC_COUNT Mach-O executable(s)"

# ---------------------------------------------------------------------------
# 6. Sign the bundled Node.js binary WITH JIT entitlements
# ---------------------------------------------------------------------------
NODE_BINARY="$CONTENTS/Resources/resources/node/node"
if [ -f "$NODE_BINARY" ]; then
  echo "[sign] Signing Node.js binary (with JIT entitlements): $NODE_BINARY"
  codesign --force --options runtime --timestamp \
    --entitlements "$NODE_ENTITLEMENTS" \
    --sign "$SIGN_IDENTITY" \
    "$NODE_BINARY"
else
  echo "WARNING: Bundled Node.js binary not found at $NODE_BINARY" >&2
fi

# ---------------------------------------------------------------------------
# 7. Sign the main Knapsack binary
# ---------------------------------------------------------------------------
MAIN_BINARY="$CONTENTS/MacOS/Knapsack"
if [ ! -f "$MAIN_BINARY" ]; then
  echo "ERROR: Main binary not found at $MAIN_BINARY" >&2
  exit 1
fi

echo "[sign] Signing main binary: $MAIN_BINARY"
codesign --force --options runtime --timestamp \
  --entitlements "$APP_ENTITLEMENTS" \
  --sign "$SIGN_IDENTITY" \
  "$MAIN_BINARY"

# ---------------------------------------------------------------------------
# 8. Sign the .app bundle (must come last — inside-out signing order)
# ---------------------------------------------------------------------------
echo "[sign] Signing app bundle: $APP_PATH"
codesign --force --options runtime --timestamp \
  --entitlements "$APP_ENTITLEMENTS" \
  --sign "$SIGN_IDENTITY" \
  "$APP_PATH"

# ---------------------------------------------------------------------------
# 9. Verify the signature
# ---------------------------------------------------------------------------
echo "[sign] Verifying signature..."
codesign --verify --deep --strict --verbose=2 "$APP_PATH"
assert_no_legacy_coderesources "$APP_PATH"
echo "[sign] Signature verification passed."

# ---------------------------------------------------------------------------
# 10. Notarize (if requested)
# ---------------------------------------------------------------------------
if [ "$DO_NOTARIZE" = true ]; then
  poll_notarization() {
    local submission_id="$1"
    local label="$2"
    local status=""
    local poll_delay="${NOTARY_POLL_DELAY_SECONDS:-30}"
    local poll_max="${NOTARY_POLL_MAX_ATTEMPTS:-120}"

    echo "[notarize] Polling ${label} notarization status (up to ${poll_max} attempts)..." >&2
    for attempt in $(seq 1 "$poll_max"); do
      local info_output
      info_output=$(xcrun notarytool info "$submission_id" \
        --apple-id "$APPLE_ID" \
        --team-id "$APPLE_TEAM_ID" \
        --password "$APPLE_APP_PASSWORD" 2>&1) || true

      status=$(echo "$info_output" | sed -n 's/^[[:space:]]*status:[[:space:]]*//p' | tail -1)
      echo "[notarize] ${label} attempt ${attempt}/${poll_max}: status=${status:-<network error>}" >&2

      case "$status" in
        Accepted|Invalid|Rejected)
          printf '%s\n' "$status"
          return 0
          ;;
      esac

      sleep "$poll_delay"
    done

    printf '%s\n' "$status"
  }

  submit_to_notarytool() {
    local path="$1"
    local label="$2"
    local max_retries="${NOTARY_SUBMIT_RETRIES:-3}"
    local retry_delay="${NOTARY_SUBMIT_RETRY_SECONDS:-30}"
    local attempt

    for attempt in $(seq 1 "$max_retries"); do
      echo "[notarize] ${label} submit attempt ${attempt}/${max_retries}..."
      local attempt_output
      local attempt_exit

      # Capture all output even on failure so CI logs tell us exactly why.
      attempt_output=$(xcrun notarytool submit "$path" \
        --apple-id "$APPLE_ID" \
        --team-id "$APPLE_TEAM_ID" \
        --password "$APPLE_APP_PASSWORD" 2>&1)
      attempt_exit=$?
      echo "[notarize] ${label} submit exit code: ${attempt_exit}" >&2
      echo "$attempt_output" >&2

      if [ "$attempt_exit" -eq 0 ]; then
        echo "$attempt_output"
        return 0
      fi

      echo "[notarize] ${label} submit failed; retrying in ${retry_delay}s..."
      sleep "$retry_delay"
    done

    # Preserve the final output for callers (especially when retries are exhausted).
    echo "$attempt_output"
    return 1
  }

  extract_notary_submission_id() {
    local raw_output="$1"
    local submission_id=""

    # Preferred: parse JSON-style id fields when available.
    if command -v jq >/dev/null 2>&1; then
      submission_id=$(printf '%s\n' "$raw_output" | jq -r '.id // .submissionId // .submission_id // .requestUUID // .requestId // .request_id // empty' 2>/dev/null | head -n1)
      if [ -n "$submission_id" ] && [ "$submission_id" != "null" ]; then
        printf '%s\n' "$submission_id"
        return 0
      fi
    fi

    # Fallback for non-JSON text output (including older notarytool formats).
    # Strip everything up to and including the first : or = so the greedy .* in
    # sed cannot consume part of the UUID (old bug: s/.*([a-zA-Z0-9-]{10,})$/\1/
    # captured only the minimum 10 chars, e.g. "00b9e90128" instead of the full UUID).
    submission_id=$(printf '%s\n' "$raw_output" | grep -Eio '(^|[[:space:]])(id|request[-_ ]?id|request[-_ ]?uuid)\s*[:=]\s*[a-zA-Z0-9-]{10,}' | head -n1 | sed -E 's/^[^:=]*[:=][[:space:]]*//' || true)
    if [ -n "$submission_id" ]; then
      printf '%s\n' "$submission_id"
      return 0
    fi

    submission_id=$(printf '%s\n' "$raw_output" | grep -Eio '[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}' | head -n1 || true)
    if [ -n "$submission_id" ]; then
      printf '%s\n' "$submission_id"
      return 0
    fi

    return 1
  }

  # Validate required env vars
  for var in APPLE_ID APPLE_TEAM_ID APPLE_APP_PASSWORD; do
    if [ -z "${!var:-}" ]; then
      echo "ERROR: $var is required for notarization." >&2
      echo "       Set it in .env.signing or export it before running." >&2
      exit 1
    fi
  done

  APP_NAME="$(basename "$APP_PATH" .app)"
  ZIP_PATH="$BUNDLE_DIR/${APP_NAME}.zip"

  echo "[notarize] Creating zip: $ZIP_PATH"
  ditto -c -k --keepParent "$APP_PATH" "$ZIP_PATH"

  echo "[notarize] Submitting .app to Apple (upload only — poll separately to survive network blips)..."
  if ! SUBMIT_OUTPUT=$(submit_to_notarytool "$ZIP_PATH" ".app"); then
    echo "[notarize] ERROR: .app submission failed after all retries."
    echo "$SUBMIT_OUTPUT"
    exit 1
  fi

  # Re-print output here so it stays grouped with the successful flow in CI logs.
  SUBMISSION_ID=$(extract_notary_submission_id "$SUBMIT_OUTPUT")
  if [ -z "$SUBMISSION_ID" ]; then
    echo "[notarize] ERROR: No submission ID received; upload failed." >&2
    echo "$SUBMIT_OUTPUT"
    exit 1
  fi
  echo "[notarize] Submission ID: $SUBMISSION_ID"

  NOTARY_STATUS=$(poll_notarization "$SUBMISSION_ID" ".app" | tail -1)

  if [ "$NOTARY_STATUS" != "Accepted" ]; then
    echo "[notarize] ERROR: Notarization failed with status: $NOTARY_STATUS" >&2
    if [ -n "$SUBMISSION_ID" ]; then
      echo "[notarize] Fetching rejection log..." >&2
      xcrun notarytool log "$SUBMISSION_ID" \
        --apple-id "$APPLE_ID" \
        --team-id "$APPLE_TEAM_ID" \
        --password "$APPLE_APP_PASSWORD" || true
    fi
    exit 1
  fi

  echo "[notarize] Stapling notarization ticket to .app..."
  xcrun stapler staple "$APP_PATH"
  echo "[notarize] Validating .app staple ticket..."
  xcrun stapler validate "$APP_PATH" || {
    echo "[notarize] ERROR: .app staple ticket invalid — users would see 'damaged'." >&2
    exit 1
  }

  # Recreate DMG with the stapled .app, then notarize & staple the DMG
  DMG_DIR="$(dirname "$BUNDLE_DIR")/dmg"
  if [ -d "$DMG_DIR" ]; then
    # Find the architecture suffix from the existing DMG filename
    EXISTING_DMG=$(find "$DMG_DIR" -name "*.dmg" -print -quit 2>/dev/null || true)
    if [ -n "$EXISTING_DMG" ]; then
      DMG_PATH="$EXISTING_DMG"
      echo "[notarize] Recreating DMG with stapled .app: $DMG_PATH"

      # Create a fresh DMG containing the signed+stapled .app
      DMG_TEMP="$(mktemp -d /tmp/knapsack-dmg.XXXXXX)"
      DMG_APP="$DMG_TEMP/$(basename "$APP_PATH")"
      ditto --noextattr --noqtn "$APP_PATH" "$DMG_APP"
      remove_legacy_coderesources "$DMG_APP"
      assert_no_legacy_coderesources "$DMG_APP"
      codesign --verify --deep --strict --verbose=2 "$DMG_APP"
      ln -s /Applications "$DMG_TEMP/Applications"

      # codesign/stapler can leave files with the immutable (locked) flag or
      # owner-only permissions. Finder refuses to copy such files from a DMG,
      # showing "items had to be skipped / Locked". Clear the flags and ensure
      # all files are world-readable before packaging into the DMG.
      chflags -R nouchg,noschg "$DMG_TEMP" 2>/dev/null || true
      chmod -R a+rX "$DMG_TEMP"

      rm -f "$DMG_PATH"

      # Detach any lingering mounts with the same volume name — a previous
      # build step or failed run can leave /Volumes/<AppName> attached, which
      # causes hdiutil create to fail with "Resource busy".
      for vol in /Volumes/"$APP_NAME"*; do
        [ -d "$vol" ] && hdiutil detach "$vol" -force 2>/dev/null || true
      done

      hdiutil create -volname "$APP_NAME" -srcfolder "$DMG_TEMP" \
        -ov -format UDZO "$DMG_PATH"
      rm -rf "$DMG_TEMP"

      # Sign the DMG
      echo "[notarize] Signing DMG..."
      codesign --force --timestamp --sign "$SIGN_IDENTITY" "$DMG_PATH"

      # Notarize the DMG — submit only, then poll with retries
      echo "[notarize] Submitting DMG to Apple (upload only — poll separately to survive network blips)..."
      if ! DMG_SUBMIT_OUTPUT=$(submit_to_notarytool "$DMG_PATH" "DMG"); then
        echo "[notarize] ERROR: DMG submission failed after all retries."
        echo "$DMG_SUBMIT_OUTPUT"
        exit 1
      fi
      DMG_SUBMISSION_ID=$(extract_notary_submission_id "$DMG_SUBMIT_OUTPUT")
      if [ -z "$DMG_SUBMISSION_ID" ]; then
        echo "[notarize] ERROR: No DMG submission ID received; upload failed." >&2
        echo "$DMG_SUBMIT_OUTPUT"
        exit 1
      fi
      echo "[notarize] DMG submission ID: $DMG_SUBMISSION_ID"

      DMG_STATUS=$(poll_notarization "$DMG_SUBMISSION_ID" "DMG" | tail -1)

      if [ "$DMG_STATUS" = "Accepted" ]; then
        echo "[notarize] Stapling DMG..."
        xcrun stapler staple "$DMG_PATH"
        echo "[notarize] Validating DMG staple ticket..."
        xcrun stapler validate "$DMG_PATH" || {
          echo "[notarize] ERROR: DMG staple ticket invalid — users would see 'damaged'." >&2
          exit 1
        }
        echo "[notarize] Verifying Gatekeeper approval of DMG..."
        spctl --assess --type open --context context:primary-signature --verbose=2 "$DMG_PATH" || {
          echo "[notarize] ERROR: DMG fails Gatekeeper check — users would see 'damaged' on download." >&2
          exit 1
        }
      else
        echo "[notarize] ERROR: DMG notarization failed with status: $DMG_STATUS" >&2
        echo "[notarize]        An unnotarized DMG will show 'damaged' on user machines." >&2
        echo "[notarize]        Fix the issue and re-run, or users cannot open the app." >&2
        exit 1
      fi
    fi
  fi

  echo "[notarize] Verifying Gatekeeper approval..."
  # --type open --context context:primary-signature is exactly what Finder uses
  # when a user double-clicks the app.  --type execute (command-line executables)
  # produces a different assessment and can pass even when the Finder open check
  # fails, which means CI passes but users see "damaged or incomplete".
  spctl --assess --type open --context context:primary-signature --verbose=2 "$APP_PATH"

  echo "[notarize] Done! App is signed, notarized, and stapled."
else
  cat <<EOF

================================================================================
  SIGNING COMPLETE — Next Steps
================================================================================

To notarize, either:

  A) Re-run with --notarize flag (requires APPLE_ID, APPLE_TEAM_ID,
     APPLE_APP_PASSWORD in .env.signing or environment):

     bash scripts/sign-and-notarize.sh --notarize

  B) Or manually:

     cd "$BUNDLE_DIR"
     ditto -c -k --keepParent "$(basename "$APP_PATH")" "$(basename "$APP_PATH" .app).zip"
     xcrun notarytool submit *.zip \\
       --apple-id "\$APPLE_ID" --team-id "\$APPLE_TEAM_ID" \\
       --password "\$APPLE_APP_PASSWORD" --wait
     xcrun stapler staple "$(basename "$APP_PATH")"

================================================================================
EOF
fi
