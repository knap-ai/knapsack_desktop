#!/usr/bin/env bash
#
# prepare-node.sh — Downloads the Node.js binary for bundling into the Knapsack app.
#
# Runs automatically via the npm `prebuild` hook (before `tsc && vite build`),
# so every `tauri build` gets the right binary without manual intervention.
#
# Override the version:  NODE_VERSION=22.15.0 bash scripts/prepare-node.sh
#
set -euo pipefail

NODE_VERSION="${NODE_VERSION:-22.14.0}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
TARGET_DIR="$PROJECT_DIR/src-tauri/resources/node"

# ---------------------------------------------------------------------------
# Detect OS
# ---------------------------------------------------------------------------
case "$(uname -s)" in
  Darwin)            OS="darwin" ;;
  Linux)             OS="linux" ;;
  MINGW*|MSYS*|CYGWIN*) OS="win" ;;
  *)  echo "ERROR: Unsupported OS: $(uname -s)" >&2; exit 1 ;;
esac

# ---------------------------------------------------------------------------
# Detect architecture
# ---------------------------------------------------------------------------
case "$(uname -m)" in
  x86_64|amd64)   ARCH="x64" ;;
  arm64|aarch64)   ARCH="arm64" ;;
  *)  echo "ERROR: Unsupported architecture: $(uname -m)" >&2; exit 1 ;;
esac

# ---------------------------------------------------------------------------
# Target binary path
# ---------------------------------------------------------------------------
if [ "$OS" = "win" ]; then
  TARGET_BIN="$TARGET_DIR/node.exe"
else
  TARGET_BIN="$TARGET_DIR/node"
fi

# ---------------------------------------------------------------------------
# Skip download if the correct version is already present
# ---------------------------------------------------------------------------
if [ -f "$TARGET_BIN" ]; then
  CURRENT_VERSION=$("$TARGET_BIN" --version 2>/dev/null || echo "unknown")
  if [ "$CURRENT_VERSION" = "v$NODE_VERSION" ]; then
    echo "[prepare-node] Node.js v$NODE_VERSION ($OS-$ARCH) already present — skipping download."
    exit 0
  fi
  echo "[prepare-node] Found $CURRENT_VERSION, need v$NODE_VERSION — re-downloading."
  rm -f "$TARGET_BIN"
fi

mkdir -p "$TARGET_DIR"

# ---------------------------------------------------------------------------
# Download
# ---------------------------------------------------------------------------
if [ "$OS" = "win" ]; then
  ARCHIVE="node-v${NODE_VERSION}-${OS}-${ARCH}.zip"
else
  ARCHIVE="node-v${NODE_VERSION}-${OS}-${ARCH}.tar.gz"
fi
URL="https://nodejs.org/dist/v${NODE_VERSION}/${ARCHIVE}"

TMPDIR=$(mktemp -d)
trap 'rm -rf "$TMPDIR"' EXIT

echo "[prepare-node] Downloading Node.js v${NODE_VERSION} for ${OS}-${ARCH}…"
echo "[prepare-node]   $URL"

curl -fsSL --retry 3 --retry-delay 2 "$URL" -o "$TMPDIR/$ARCHIVE"

# ---------------------------------------------------------------------------
# Extract just the node binary
# ---------------------------------------------------------------------------
echo "[prepare-node] Extracting node binary…"
if [ "$OS" = "win" ]; then
  unzip -qo "$TMPDIR/$ARCHIVE" "node-v${NODE_VERSION}-${OS}-${ARCH}/node.exe" -d "$TMPDIR"
  mv "$TMPDIR/node-v${NODE_VERSION}-${OS}-${ARCH}/node.exe" "$TARGET_BIN"
else
  tar -xzf "$TMPDIR/$ARCHIVE" -C "$TMPDIR" "node-v${NODE_VERSION}-${OS}-${ARCH}/bin/node"
  mv "$TMPDIR/node-v${NODE_VERSION}-${OS}-${ARCH}/bin/node" "$TARGET_BIN"
  chmod +x "$TARGET_BIN"
fi

# ---------------------------------------------------------------------------
# Verify
# ---------------------------------------------------------------------------
INSTALLED_VERSION=$("$TARGET_BIN" --version 2>/dev/null || echo "FAILED")
if [ "$INSTALLED_VERSION" != "v$NODE_VERSION" ]; then
  echo "ERROR: Verification failed — expected v$NODE_VERSION, got $INSTALLED_VERSION" >&2
  exit 1
fi

echo "[prepare-node] ✓ Node.js $INSTALLED_VERSION installed at $TARGET_BIN"
