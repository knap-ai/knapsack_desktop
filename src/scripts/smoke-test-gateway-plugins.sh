#!/usr/bin/env bash
# smoke-test-gateway-plugins.sh — Starts the clawdbot gateway twice (cold + warm)
# and asserts that all plugins register without filesystem errors (ENOTEMPTY, etc.).
#
# Cold start: first run, no mirror dirs exist yet — exercises initial mirroring.
# Warm start: reuses same state dir so mirror dirs already exist — exercises the
#             rmSync + rename path that previously raced with concurrent plugins.
#
# Run after install-bundled-plugin-deps.cjs (plugins need their node_modules).
# Run before prune-clawdbot.cjs (some pruned extensions may lack deps after prune).
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CLAWDBOT_DIR="$(cd "$SCRIPT_DIR/../src-tauri/resources/clawdbot" && pwd)"
PORT_BASE=28789
# Browser plugin downloads playwright-core (~30 MB) on cold start; allow enough
# headroom for a slow CI network while keeping the overall bound reasonable.
TIMEOUT_S=180

STATE_DIR=""
LOG_FILE=""
GW_PID=""

remove_temp_path() {
  local path="$1"
  local attempt

  [[ -z "$path" ]] && return 0

  # Gateway child processes can finish flushing state just after the parent
  # exits. macOS rm may report ENOTEMPTY during that narrow race, so retry the
  # best-effort cleanup without turning a successful smoke test into a failure.
  for attempt in 1 2 3 4 5; do
    rm -rf "$path" 2>/dev/null && return 0
    sleep 0.2
  done

  echo "[smoke-test] WARN: could not remove temporary path: $path" >&2
  return 0
}

cleanup() {
  if [[ -n "$GW_PID" ]]; then
    kill "$GW_PID" 2>/dev/null || true
    wait "$GW_PID" 2>/dev/null || true
  fi
  remove_temp_path "$STATE_DIR"
  remove_temp_path "$LOG_FILE"
}
trap cleanup EXIT

STATE_DIR="$(mktemp -d)"
LOG_FILE="$(mktemp)"

# Isolated state dir so the test never touches ~/.openclaw
export OPENCLAW_STATE_DIR="$STATE_DIR"
# Skip legacy-dir scan to speed up startup
export OPENCLAW_TEST_FAST="1"
# Prevent entry.js from re-spawning itself (would make the PID useless)
export OPENCLAW_NO_RESPAWN="1"
export OPENCLAW_DISABLE_BONJOUR="1"
export JITI_FS_CACHE="false"

GW_TOKEN="ci-smoke-$$"

run_pass() {
  local pass_name="$1"
  local port="$2"
  GW_PID=""
  >"$LOG_FILE"

  echo "[smoke-test] $pass_name: starting gateway..."
  (cd "$CLAWDBOT_DIR" && node dist/entry.js gateway run \
    --allow-unconfigured \
    --verbose \
    --force \
    --bind loopback \
    --auth token \
    --token "$GW_TOKEN" \
    --port "$port") >>"$LOG_FILE" 2>&1 &
  GW_PID=$!

  # Poll until the gateway ready sentinel appears in the log, then bail on
  # timeout or early exit.
  # openclaw <=2026.4.24 emits "ready (…)"; 2026.4.25+ emits
  # "http server listening (…)".  Accept either so this script works across
  # the version boundary.
  local ticks=0
  local max_ticks=$(( TIMEOUT_S * 2 ))
  while ! grep -qF "ready (" "$LOG_FILE" 2>/dev/null && \
        ! grep -qF "http server listening (" "$LOG_FILE" 2>/dev/null; do
    if ! kill -0 "$GW_PID" 2>/dev/null; then
      echo "[smoke-test] FAIL: $pass_name — gateway exited before reaching ready state"
      echo "--- gateway output ---" >&2
      cat "$LOG_FILE" >&2
      exit 1
    fi
    if (( ticks >= max_ticks )); then
      echo "[smoke-test] FAIL: $pass_name — gateway did not reach ready state within ${TIMEOUT_S}s"
      echo "--- gateway output ---" >&2
      cat "$LOG_FILE" >&2
      exit 1
    fi
    sleep 0.5
    ticks=$(( ticks + 1 ))
  done

  kill "$GW_PID" 2>/dev/null || true
  wait "$GW_PID" 2>/dev/null || true
  GW_PID=""

  if grep -qF "plugin failed during register" "$LOG_FILE"; then
    echo "[smoke-test] FAIL: $pass_name — plugin registration errors:"
    grep "plugin failed during register" "$LOG_FILE" >&2
    exit 1
  fi

  echo "[smoke-test] $pass_name: OK"
}

run_pass "cold start (no mirror dirs)" "$PORT_BASE"
run_pass "warm start (mirror dirs exist from cold start)" "$((PORT_BASE + 1))"

echo "[smoke-test] All plugin registration checks passed."
