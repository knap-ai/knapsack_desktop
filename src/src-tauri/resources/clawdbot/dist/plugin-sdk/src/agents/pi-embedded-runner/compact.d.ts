import type { AgentMessage } from "@mariozechner/pi-agent-core";
import type { ReasoningLevel, ThinkLevel } from "../../auto-reply/thinking.js";
import type { OpenClawConfig } from "../../config/config.js";
import { type enqueueCommand } from "../../process/command-queue.js";
import type { ExecElevatedDefaults } from "../bash-tools.js";
import { hasMeaningfulConversationContent } from "../compaction-real-conversation.js";
import { type SkillSnapshot } from "../skills.js";
import type { EmbeddedPiCompactResult } from "./types.js";
export type CompactEmbeddedPiSessionParams = {
    sessionId: string;
    runId?: string;
    sessionKey?: string;
    messageChannel?: string;
    messageProvider?: string;
    agentAccountId?: string;
    currentChannelId?: string;
    currentThreadTs?: string;
    currentMessageId?: string | number;
    /** Trusted sender id from inbound context for scoped message-tool discovery. */
    senderId?: string;
    authProfileId?: string;
    /** Group id for channel-level tool policy resolution. */
    groupId?: string | null;
    /** Group channel label (e.g. #general) for channel-level tool policy resolution. */
    groupChannel?: string | null;
    /** Group space label (e.g. guild/team id) for channel-level tool policy resolution. */
    groupSpace?: string | null;
    /** Parent session key for subagent policy inheritance. */
    spawnedBy?: string | null;
    /** Whether the sender is an owner (required for owner-only tools). */
    senderIsOwner?: boolean;
    sessionFile: string;
    /** Optional caller-observed live prompt tokens used for compaction diagnostics. */
    currentTokenCount?: number;
    workspaceDir: string;
    agentDir?: string;
    config?: OpenClawConfig;
    skillsSnapshot?: SkillSnapshot;
    provider?: string;
    model?: string;
    thinkLevel?: ThinkLevel;
    reasoningLevel?: ReasoningLevel;
    bashElevated?: ExecElevatedDefaults;
    customInstructions?: string;
    tokenBudget?: number;
    force?: boolean;
    trigger?: "overflow" | "manual";
    diagId?: string;
    attempt?: number;
    maxAttempts?: number;
    lane?: string;
    enqueue?: typeof enqueueCommand;
    extraSystemPrompt?: string;
    ownerNumbers?: string[];
    abortSignal?: AbortSignal;
    /** Allow runtime plugins for this compaction to late-bind the gateway subagent. */
    allowGatewaySubagentBinding?: boolean;
};
declare function hasRealConversationContent(msg: AgentMessage, messages: AgentMessage[], index: number): boolean;
declare function runPostCompactionSideEffects(params: {
    config?: OpenClawConfig;
    sessionKey?: string;
    sessionFile: string;
}): Promise<void>;
type CompactionHookRunner = {
    hasHooks?: (hookName?: string) => boolean;
    runBeforeCompaction?: (metrics: {
        messageCount: number;
        tokenCount?: number;
        sessionFile?: string;
    }, context: {
        sessionId: string;
        agentId: string;
        sessionKey: string;
        workspaceDir: string;
        messageProvider?: string;
    }) => Promise<void> | void;
    runAfterCompaction?: (metrics: {
        messageCount: number;
        tokenCount?: number;
        compactedCount: number;
        sessionFile: string;
    }, context: {
        sessionId: string;
        agentId: string;
        sessionKey: string;
        workspaceDir: string;
        messageProvider?: string;
    }) => Promise<void> | void;
};
declare function buildBeforeCompactionHookMetrics(params: {
    originalMessages: AgentMessage[];
    currentMessages: AgentMessage[];
    observedTokenCount?: number;
    estimateTokensFn: (message: AgentMessage) => number;
}): {
    messageCountOriginal: number;
    tokenCountOriginal: number | undefined;
    messageCountBefore: number;
    tokenCountBefore: number | undefined;
};
declare function runBeforeCompactionHooks(params: {
    hookRunner?: CompactionHookRunner | null;
    sessionId: string;
    sessionKey?: string;
    sessionAgentId: string;
    workspaceDir: string;
    messageProvider?: string;
    metrics: ReturnType<typeof buildBeforeCompactionHookMetrics>;
}): Promise<{
    hookSessionKey: string;
    missingSessionKey: boolean;
}>;
declare function containsRealConversationMessages(messages: AgentMessage[]): boolean;
declare function estimateTokensAfterCompaction(params: {
    messagesAfter: AgentMessage[];
    observedTokenCount?: number;
    fullSessionTokensBefore: number;
    estimateTokensFn: (message: AgentMessage) => number;
}): number | undefined;
declare function runAfterCompactionHooks(params: {
    hookRunner?: CompactionHookRunner | null;
    sessionId: string;
    sessionAgentId: string;
    hookSessionKey: string;
    missingSessionKey: boolean;
    workspaceDir: string;
    messageProvider?: string;
    messageCountAfter: number;
    tokensAfter?: number;
    compactedCount: number;
    sessionFile: string;
    summaryLength?: number;
    tokensBefore?: number;
    firstKeptEntryId?: string;
}): Promise<void>;
/**
 * Core compaction logic without lane queueing.
 * Use this when already inside a session/global lane to avoid deadlocks.
 */
export declare function compactEmbeddedPiSessionDirect(params: CompactEmbeddedPiSessionParams): Promise<EmbeddedPiCompactResult>;
/**
 * Compacts a session with lane queueing (session lane + global lane).
 * Use this from outside a lane context. If already inside a lane, use
 * `compactEmbeddedPiSessionDirect` to avoid deadlocks.
 */
export declare function compactEmbeddedPiSession(params: CompactEmbeddedPiSessionParams): Promise<EmbeddedPiCompactResult>;
export declare const __testing: {
    readonly hasRealConversationContent: typeof hasRealConversationContent;
    readonly hasMeaningfulConversationContent: typeof hasMeaningfulConversationContent;
    readonly containsRealConversationMessages: typeof containsRealConversationMessages;
    readonly estimateTokensAfterCompaction: typeof estimateTokensAfterCompaction;
    readonly buildBeforeCompactionHookMetrics: typeof buildBeforeCompactionHookMetrics;
    readonly runBeforeCompactionHooks: typeof runBeforeCompactionHooks;
    readonly runAfterCompactionHooks: typeof runAfterCompactionHooks;
    readonly runPostCompactionSideEffects: typeof runPostCompactionSideEffects;
};
export {};
