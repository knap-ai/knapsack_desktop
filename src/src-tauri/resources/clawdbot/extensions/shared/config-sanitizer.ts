/**
 * sanitizeOpenClawConfig
 *
 * Auto-heals an OpenClaw config object so that the gateway (and CLI commands
 * like `openclaw logs` / `openclaw status`) never crash due to a Zod
 * validation error caused by dmPolicy="allowlist" with a missing or empty
 * allowFrom array.
 *
 * Rules
 * ─────
 * • `dmPolicy="allowlist"` requires at least one entry in `allowFrom`.
 *   Without it the validator throws a fatal error and blocks ALL CLI commands.
 * • When the mismatch is detected we downgrade `dmPolicy` to "pairing" so the
 *   gateway can start. The rest of the channel config is left untouched.
 * • Google Chat uses `channels.googlechat.dm.policy` / `dm.allowFrom` instead
 *   of the top-level `dmPolicy` / `allowFrom` — both forms are handled.
 * • Per-account overrides (`channels.<ch>.accounts.<id>.dmPolicy`) are also
 *   checked; an account-level dmPolicy="allowlist" is only invalid when BOTH
 *   the account's own allowFrom AND the parent channel's allowFrom are empty.
 *
 * The function is:
 *   • Non-destructive  — valid configs are returned unchanged.
 *   • Idempotent       — safe to call on every load / startup.
 *   • Non-throwing     — never throws; logs warnings via console.warn instead.
 */

export type OpenClawConfigLike = Record<string, unknown>;

export interface SanitizeResult {
  /** The (possibly mutated) config object. */
  config: OpenClawConfigLike;
  /** Human-readable description of every change that was made. */
  changes: string[];
}

// ── helpers ──────────────────────────────────────────────────────────────────

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

/**
 * Returns true when an allowFrom value is absent or effectively empty
 * (empty array, or an array whose every string element is blank).
 */
function isEmptyAllowFrom(allowFrom: unknown): boolean {
  if (allowFrom === undefined || allowFrom === null) return true;
  if (!Array.isArray(allowFrom)) return true;
  if (allowFrom.length === 0) return true;
  return allowFrom.every(
    (entry) => typeof entry === "string" && entry.trim() === "",
  );
}

// ── core logic ────────────────────────────────────────────────────────────────

/**
 * Sanitize a single channel config entry (the object under
 * `channels.<channelName>`).  Mutates in-place and appends to `changes`.
 */
function sanitizeChannelEntry(
  channelName: string,
  channelCfg: Record<string, unknown>,
  changes: string[],
): void {
  // ── standard dmPolicy / allowFrom ──────────────────────────────────
  if (channelCfg["dmPolicy"] === "allowlist") {
    if (isEmptyAllowFrom(channelCfg["allowFrom"])) {
      channelCfg["dmPolicy"] = "pairing";
      const msg =
        `Auto-fixed invalid OpenClaw config: ` +
        `channels.${channelName}.dmPolicy="allowlist" but allowFrom is ` +
        `missing/empty — downgraded to "pairing"`;
      console.warn(`[openclaw/config-sanitizer] ${msg}`);
      changes.push(msg);
    }
  }

  // ── Google Chat: dm.policy / dm.allowFrom ──────────────────────────
  if (isRecord(channelCfg["dm"])) {
    const dm = channelCfg["dm"] as Record<string, unknown>;
    if (dm["policy"] === "allowlist") {
      if (isEmptyAllowFrom(dm["allowFrom"])) {
        dm["policy"] = "pairing";
        const msg =
          `Auto-fixed invalid OpenClaw config: ` +
          `channels.${channelName}.dm.policy="allowlist" but dm.allowFrom is ` +
          `missing/empty — downgraded to "pairing"`;
        console.warn(`[openclaw/config-sanitizer] ${msg}`);
        changes.push(msg);
      }
    }
  }

  // ── per-account overrides ──────────────────────────────────────────
  if (isRecord(channelCfg["accounts"])) {
    const accounts = channelCfg["accounts"] as Record<string, unknown>;
    // Parent-level allowFrom acts as fallback for account-level configs.
    const parentAllowFromEmpty = isEmptyAllowFrom(channelCfg["allowFrom"]);

    for (const [accountId, accountCfg] of Object.entries(accounts)) {
      if (!isRecord(accountCfg)) continue;

      if (accountCfg["dmPolicy"] === "allowlist") {
        const acctAllowFromEmpty = isEmptyAllowFrom(accountCfg["allowFrom"]);
        // Only invalid when both the account's own allowFrom AND the parent
        // channel's allowFrom are empty (gateway falls back to parent).
        if (acctAllowFromEmpty && parentAllowFromEmpty) {
          accountCfg["dmPolicy"] = "pairing";
          const msg =
            `Auto-fixed invalid OpenClaw config: ` +
            `channels.${channelName}.accounts.${accountId}.dmPolicy="allowlist" ` +
            `but allowFrom is missing/empty (and no parent allowFrom) ` +
            `— downgraded to "pairing"`;
          console.warn(`[openclaw/config-sanitizer] ${msg}`);
          changes.push(msg);
        }
      }
    }
  }
}

/**
 * Sanitize an OpenClaw config object in-place.
 *
 * @param config  The raw config object (parsed from openclaw.json).
 * @returns       `{ config, changes }` — `config` is the same reference,
 *                mutated only when a fix was needed.  `changes` is empty
 *                for valid configs.
 */
export function sanitizeOpenClawConfig(
  config: OpenClawConfigLike,
): SanitizeResult {
  const changes: string[] = [];

  try {
    if (!isRecord(config)) return { config, changes };

    const channels = config["channels"];
    if (!isRecord(channels)) return { config, changes };

    for (const [channelName, channelCfg] of Object.entries(channels)) {
      if (!isRecord(channelCfg)) continue;
      sanitizeChannelEntry(channelName, channelCfg, changes);
    }
  } catch (err) {
    // Never let a sanitizer bug crash the app.
    console.warn("[openclaw/config-sanitizer] Unexpected error during sanitize:", err);
  }

  return { config, changes };
}

/**
 * Convenience wrapper: parse, sanitize, and re-serialize a JSON config string.
 * Returns `null` when the input is not valid JSON (leaves it to the caller /
 * gateway to surface the real parse error).
 */
export function sanitizeOpenClawConfigJson(json: string): {
  json: string;
  changes: string[];
} | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    return null;
  }
  if (!isRecord(parsed)) return null;
  const { config, changes } = sanitizeOpenClawConfig(parsed);
  return { json: JSON.stringify(config, null, 2), changes };
}
