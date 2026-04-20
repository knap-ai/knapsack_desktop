import { runEmbeddedPiAgent } from "../../agents/pi-embedded.js";
import { type SessionEntry } from "../../config/sessions.js";
import type { TemplateContext } from "../templating.js";
import type { VerboseLevel } from "../thinking.js";
import type { GetReplyOptions, ReplyPayload } from "../types.js";
import { type BlockReplyPipeline } from "./block-reply-pipeline.js";
import type { FollowupRun } from "./queue.js";
import type { ReplyOperation } from "./reply-run-registry.js";
import type { TypingSignaler } from "./typing-mode.js";
export declare const MAX_LIVE_SWITCH_RETRIES = 2;
export type RuntimeFallbackAttempt = {
    provider: string;
    model: string;
    error: string;
    reason?: string;
    status?: number;
    code?: string;
};
export type AgentRunLoopResult = {
    kind: "success";
    runId: string;
    runResult: Awaited<ReturnType<typeof runEmbeddedPiAgent>>;
    fallbackProvider?: string;
    fallbackModel?: string;
    fallbackAttempts: RuntimeFallbackAttempt[];
    didLogHeartbeatStrip: boolean;
    autoCompactionCount: number;
    /** Payload keys sent directly (not via pipeline) during tool flush. */
    directlySentBlockKeys?: Set<string>;
} | {
    kind: "final";
    payload: ReplyPayload;
};
type FallbackSelectionState = Pick<SessionEntry, "providerOverride" | "modelOverride" | "modelOverrideSource" | "authProfileOverride" | "authProfileOverrideSource" | "authProfileOverrideCompactionCount">;
export declare function applyFallbackCandidateSelectionToEntry(params: {
    entry: SessionEntry;
    run: FollowupRun["run"];
    provider: string;
    model: string;
    now?: number;
}): {
    updated: boolean;
    nextState?: FallbackSelectionState;
};
export declare function runAgentTurnWithFallback(params: {
    commandBody: string;
    followupRun: FollowupRun;
    sessionCtx: TemplateContext;
    replyOperation?: ReplyOperation;
    opts?: GetReplyOptions;
    typingSignals: TypingSignaler;
    blockReplyPipeline: BlockReplyPipeline | null;
    blockStreamingEnabled: boolean;
    blockReplyChunking?: {
        minChars: number;
        maxChars: number;
        breakPreference: "paragraph" | "newline" | "sentence";
        flushOnParagraph?: boolean;
    };
    resolvedBlockStreamingBreak: "text_end" | "message_end";
    applyReplyToMode: (payload: ReplyPayload) => ReplyPayload;
    shouldEmitToolResult: () => boolean;
    shouldEmitToolOutput: () => boolean;
    pendingToolTasks: Set<Promise<void>>;
    resetSessionAfterCompactionFailure: (reason: string) => Promise<boolean>;
    resetSessionAfterRoleOrderingConflict: (reason: string) => Promise<boolean>;
    isHeartbeat: boolean;
    sessionKey?: string;
    getActiveSessionEntry: () => SessionEntry | undefined;
    activeSessionStore?: Record<string, SessionEntry>;
    storePath?: string;
    resolvedVerboseLevel: VerboseLevel;
}): Promise<AgentRunLoopResult>;
export {};
