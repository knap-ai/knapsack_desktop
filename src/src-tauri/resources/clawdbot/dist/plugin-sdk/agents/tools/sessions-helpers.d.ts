import type { OpenClawConfig } from "../../config/config.js";
export type SessionKind = "main" | "group" | "cron" | "hook" | "node" | "other";
export type SessionListDeliveryContext = {
    channel?: string;
    to?: string;
    accountId?: string;
};
export type SessionListRow = {
    key: string;
    kind: SessionKind;
    channel: string;
    label?: string;
    displayName?: string;
    deliveryContext?: SessionListDeliveryContext;
    updatedAt?: number | null;
    sessionId?: string;
    model?: string;
    contextTokens?: number | null;
    totalTokens?: number | null;
    thinkingLevel?: string;
    verboseLevel?: string;
    systemSent?: boolean;
    abortedLastRun?: boolean;
    sendPolicy?: string;
    lastChannel?: string;
    lastTo?: string;
    lastAccountId?: string;
    transcriptPath?: string;
    messages?: unknown[];
};
export declare function resolveMainSessionAlias(cfg: OpenClawConfig): {
    mainKey: string;
    alias: string;
    scope: import("../../config/types.base.ts").SessionScope;
};
export declare function resolveDisplaySessionKey(params: {
    key: string;
    alias: string;
    mainKey: string;
}): string;
export declare function resolveInternalSessionKey(params: {
    key: string;
    alias: string;
    mainKey: string;
}): string;
export type AgentToAgentPolicy = {
    enabled: boolean;
    matchesAllow: (agentId: string) => boolean;
    isAllowed: (requesterAgentId: string, targetAgentId: string) => boolean;
};
export declare function createAgentToAgentPolicy(cfg: OpenClawConfig): AgentToAgentPolicy;
export declare function looksLikeSessionId(value: string): boolean;
export declare function looksLikeSessionKey(value: string): boolean;
export declare function shouldResolveSessionIdInput(value: string): boolean;
export type SessionReferenceResolution = {
    ok: true;
    key: string;
    displayKey: string;
    resolvedViaSessionId: boolean;
} | {
    ok: false;
    status: "error" | "forbidden";
    error: string;
};
export declare function resolveSessionReference(params: {
    sessionKey: string;
    alias: string;
    mainKey: string;
    requesterInternalKey?: string;
    restrictToSpawned: boolean;
}): Promise<SessionReferenceResolution>;
export declare function classifySessionKind(params: {
    key: string;
    gatewayKind?: string | null;
    alias: string;
    mainKey: string;
}): SessionKind;
export declare function deriveChannel(params: {
    key: string;
    kind: SessionKind;
    channel?: string | null;
    lastChannel?: string | null;
}): string;
export declare function stripToolMessages(messages: unknown[]): unknown[];
/**
 * Sanitize text content to strip tool call markers and thinking tags.
 * This ensures user-facing text doesn't leak internal tool representations.
 */
export declare function sanitizeTextContent(text: string): string;
export declare function extractAssistantText(message: unknown): string | undefined;
