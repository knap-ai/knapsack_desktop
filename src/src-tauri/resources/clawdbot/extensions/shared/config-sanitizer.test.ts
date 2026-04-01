import { describe, expect, it } from "vitest";
import {
  sanitizeOpenClawConfig,
  sanitizeOpenClawConfigJson,
  type OpenClawConfigLike,
} from "./config-sanitizer.js";

// ── helpers ────────────────────────────────────────────────────────────────

function cfg(channels: Record<string, unknown>): OpenClawConfigLike {
  return { channels };
}

// ── valid configs — must remain unchanged ──────────────────────────────────

describe("sanitizeOpenClawConfig — valid configs unchanged", () => {
  it("returns empty changes for a config with no channels", () => {
    const input: OpenClawConfigLike = { gateway: { mode: "local" } };
    const { changes } = sanitizeOpenClawConfig(input);
    expect(changes).toHaveLength(0);
  });

  it("leaves dmPolicy=pairing untouched (no allowFrom needed)", () => {
    const input = cfg({ telegram: { dmPolicy: "pairing" } });
    const { changes } = sanitizeOpenClawConfig(input);
    expect(changes).toHaveLength(0);
    expect((input.channels as any).telegram.dmPolicy).toBe("pairing");
  });

  it("leaves dmPolicy=open untouched (allowFrom with * is valid)", () => {
    const input = cfg({ discord: { dmPolicy: "open", allowFrom: ["*"] } });
    const { changes } = sanitizeOpenClawConfig(input);
    expect(changes).toHaveLength(0);
  });

  it("leaves dmPolicy=allowlist with a non-empty allowFrom untouched", () => {
    const input = cfg({
      telegram: { dmPolicy: "allowlist", allowFrom: ["123456789"] },
    });
    const { changes } = sanitizeOpenClawConfig(input);
    expect(changes).toHaveLength(0);
    expect((input.channels as any).telegram.dmPolicy).toBe("allowlist");
  });

  it("leaves allowlist with numeric allowFrom entry untouched", () => {
    const input = cfg({
      irc: { dmPolicy: "allowlist", allowFrom: [42, "alice"] },
    });
    const { changes } = sanitizeOpenClawConfig(input);
    expect(changes).toHaveLength(0);
  });

  it("leaves allowlist account with non-empty parent allowFrom untouched", () => {
    const input = cfg({
      discord: {
        dmPolicy: "pairing",
        allowFrom: ["987654321"],
        accounts: {
          mybot: { dmPolicy: "allowlist" }, // no own allowFrom — parent covers it
        },
      },
    });
    const { changes } = sanitizeOpenClawConfig(input);
    expect(changes).toHaveLength(0);
    expect((input.channels as any).discord.accounts.mybot.dmPolicy).toBe("allowlist");
  });
});

// ── invalid configs — must be auto-fixed ──────────────────────────────────

describe("sanitizeOpenClawConfig — auto-fix allowlist/allowFrom mismatch", () => {
  it("fixes missing allowFrom for dmPolicy=allowlist", () => {
    const input = cfg({ telegram: { dmPolicy: "allowlist" } });
    const { changes } = sanitizeOpenClawConfig(input);
    expect(changes).toHaveLength(1);
    expect((input.channels as any).telegram.dmPolicy).toBe("pairing");
  });

  it("fixes empty allowFrom array for dmPolicy=allowlist", () => {
    const input = cfg({ whatsapp: { dmPolicy: "allowlist", allowFrom: [] } });
    const { changes } = sanitizeOpenClawConfig(input);
    expect(changes).toHaveLength(1);
    expect((input.channels as any).whatsapp.dmPolicy).toBe("pairing");
  });

  it("treats an array of blank strings as empty (invalid)", () => {
    const input = cfg({ signal: { dmPolicy: "allowlist", allowFrom: ["  ", ""] } });
    const { changes } = sanitizeOpenClawConfig(input);
    expect(changes).toHaveLength(1);
    expect((input.channels as any).signal.dmPolicy).toBe("pairing");
  });

  it("fixes iMessage channel with empty allowFrom", () => {
    const input = cfg({ imessage: { dmPolicy: "allowlist", allowFrom: [] } });
    const { changes } = sanitizeOpenClawConfig(input);
    expect(changes).toHaveLength(1);
    expect((input.channels as any).imessage.dmPolicy).toBe("pairing");
  });

  it("fixes multiple channels in one pass", () => {
    const input = cfg({
      telegram: { dmPolicy: "allowlist" },
      whatsapp: { dmPolicy: "allowlist", allowFrom: [] },
      irc: { dmPolicy: "allowlist", allowFrom: ["alice"] }, // valid — must not change
    });
    const { changes } = sanitizeOpenClawConfig(input);
    expect(changes).toHaveLength(2);
    expect((input.channels as any).telegram.dmPolicy).toBe("pairing");
    expect((input.channels as any).whatsapp.dmPolicy).toBe("pairing");
    expect((input.channels as any).irc.dmPolicy).toBe("allowlist"); // untouched
  });

  it("fixes Google Chat dm.policy=allowlist with empty dm.allowFrom", () => {
    const input = cfg({
      googlechat: { dm: { policy: "allowlist", allowFrom: [] } },
    });
    const { changes } = sanitizeOpenClawConfig(input);
    expect(changes).toHaveLength(1);
    expect((input.channels as any).googlechat.dm.policy).toBe("pairing");
  });

  it("leaves valid Google Chat dm.policy=allowlist with non-empty dm.allowFrom untouched", () => {
    const input = cfg({
      googlechat: { dm: { policy: "allowlist", allowFrom: ["user@example.com"] } },
    });
    const { changes } = sanitizeOpenClawConfig(input);
    expect(changes).toHaveLength(0);
  });

  it("fixes per-account dmPolicy=allowlist when both account and parent allowFrom are empty", () => {
    const input = cfg({
      discord: {
        allowFrom: [],
        accounts: {
          mybot: { dmPolicy: "allowlist" }, // no own allowFrom, parent empty too
        },
      },
    });
    const { changes } = sanitizeOpenClawConfig(input);
    expect(changes).toHaveLength(1);
    expect((input.channels as any).discord.accounts.mybot.dmPolicy).toBe("pairing");
  });

  it("does NOT fix per-account dmPolicy=allowlist when parent allowFrom is non-empty", () => {
    const input = cfg({
      discord: {
        allowFrom: ["987654321"],
        accounts: {
          mybot: { dmPolicy: "allowlist", allowFrom: [] }, // parent covers it
        },
      },
    });
    const { changes } = sanitizeOpenClawConfig(input);
    expect(changes).toHaveLength(0);
    expect((input.channels as any).discord.accounts.mybot.dmPolicy).toBe("allowlist");
  });

  it("fixes per-account when account has non-empty own allowFrom — only parent check applies", () => {
    // Account has its OWN valid allowFrom → valid regardless of parent.
    const input = cfg({
      slack: {
        accounts: {
          workspace1: { dmPolicy: "allowlist", allowFrom: ["U12345"] },
        },
      },
    });
    const { changes } = sanitizeOpenClawConfig(input);
    expect(changes).toHaveLength(0);
  });
});

// ── idempotency ───────────────────────────────────────────────────────────

describe("sanitizeOpenClawConfig — idempotency", () => {
  it("is safe to call multiple times — second call makes no changes", () => {
    const input = cfg({ telegram: { dmPolicy: "allowlist" } });
    sanitizeOpenClawConfig(input); // first pass: fixes
    const { changes } = sanitizeOpenClawConfig(input); // second pass: already fixed
    expect(changes).toHaveLength(0);
    expect((input.channels as any).telegram.dmPolicy).toBe("pairing");
  });
});

// ── JSON helper ───────────────────────────────────────────────────────────

describe("sanitizeOpenClawConfigJson", () => {
  it("returns null for invalid JSON", () => {
    expect(sanitizeOpenClawConfigJson("not json")).toBeNull();
  });

  it("returns null for non-object JSON", () => {
    expect(sanitizeOpenClawConfigJson("[1,2,3]")).toBeNull();
  });

  it("serializes the fixed config back to pretty JSON", () => {
    const input = JSON.stringify({
      channels: { telegram: { dmPolicy: "allowlist" } },
    });
    const result = sanitizeOpenClawConfigJson(input);
    expect(result).not.toBeNull();
    expect(result!.changes).toHaveLength(1);
    const parsed = JSON.parse(result!.json);
    expect(parsed.channels.telegram.dmPolicy).toBe("pairing");
  });

  it("returns empty changes and unchanged JSON for a valid config", () => {
    const input = JSON.stringify({
      channels: { telegram: { dmPolicy: "allowlist", allowFrom: ["123"] } },
    });
    const result = sanitizeOpenClawConfigJson(input);
    expect(result).not.toBeNull();
    expect(result!.changes).toHaveLength(0);
    const parsed = JSON.parse(result!.json);
    expect(parsed.channels.telegram.dmPolicy).toBe("allowlist");
  });
});
