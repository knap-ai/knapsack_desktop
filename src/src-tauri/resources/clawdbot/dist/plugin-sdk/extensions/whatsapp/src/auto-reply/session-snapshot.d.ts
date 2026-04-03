import type { loadConfig } from "openclaw/plugin-sdk/config-runtime";
export declare function getSessionSnapshot(cfg: ReturnType<typeof loadConfig>, from: string, _isHeartbeat?: boolean, ctx?: {
    sessionKey?: string | null;
    isGroup?: boolean;
    messageThreadId?: string | number | null;
    threadLabel?: string | null;
    threadStarterBody?: string | null;
    parentSessionKey?: string | null;
}): {
    key: string;
    entry: import("openclaw/plugin-sdk/voice-call").SessionEntry;
    fresh: boolean;
    resetPolicy: import("../../../../src/config/sessions.ts").SessionResetPolicy;
    resetType: import("../../../../src/config/sessions.ts").SessionResetType;
    dailyResetAt: number | undefined;
    idleExpiresAt: number | undefined;
};
