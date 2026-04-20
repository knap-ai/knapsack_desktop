import type { AgentMessage } from "@mariozechner/pi-agent-core";
import type { AssistantMessage } from "@mariozechner/pi-ai";
import type { MemoryCitationsMode } from "../../../config/types.memory.js";
import type { ContextEngine, ContextEngineRuntimeContext } from "../../../context-engine/types.js";
import { type NormalizedUsage } from "../../usage.js";
import type { PromptCacheChange } from "../prompt-cache-observability.js";
import type { EmbeddedRunAttemptResult } from "./types.js";
export type AttemptContextEngine = ContextEngine;
export type AttemptBootstrapContext = {
    bootstrapFiles: unknown[];
    contextFiles: unknown[];
};
export declare function resolveAttemptBootstrapContext<TContext extends AttemptBootstrapContext>(params: {
    contextInjectionMode: "always" | "continuation-skip";
    bootstrapContextMode?: string;
    bootstrapContextRunKind?: string;
    sessionFile: string;
    hasCompletedBootstrapTurn: (sessionFile: string) => Promise<boolean>;
    resolveBootstrapContextForRun: () => Promise<TContext>;
}): Promise<TContext & {
    isContinuationTurn: boolean;
    shouldRecordCompletedBootstrapTurn: boolean;
}>;
export declare function buildContextEnginePromptCacheInfo(params: {
    retention?: "none" | "short" | "long";
    lastCallUsage?: NormalizedUsage;
    observation?: {
        broke: boolean;
        previousCacheRead?: number;
        cacheRead?: number;
        changes?: PromptCacheChange[] | null;
    } | undefined;
    lastCacheTouchAt?: number | null;
}): EmbeddedRunAttemptResult["promptCache"];
export declare function findCurrentAttemptAssistantMessage(params: {
    messagesSnapshot: AgentMessage[];
    prePromptMessageCount: number;
}): AssistantMessage | undefined;
/** Resolve the effective prompt-cache touch timestamp for the current assistant turn. */
export declare function resolvePromptCacheTouchTimestamp(params: {
    lastCallUsage?: NormalizedUsage;
    assistantTimestamp?: unknown;
    fallbackLastCacheTouchAt?: number | null;
}): number | null;
export declare function buildLoopPromptCacheInfo(params: {
    messagesSnapshot: AgentMessage[];
    prePromptMessageCount: number;
    retention?: "none" | "short" | "long";
    fallbackLastCacheTouchAt?: number | null;
}): EmbeddedRunAttemptResult["promptCache"];
export declare function runAttemptContextEngineBootstrap(params: {
    hadSessionFile: boolean;
    contextEngine?: AttemptContextEngine;
    sessionId: string;
    sessionKey?: string;
    sessionFile: string;
    sessionManager: unknown;
    runtimeContext?: ContextEngineRuntimeContext;
    runMaintenance: (params: {
        contextEngine?: unknown;
        sessionId: string;
        sessionKey?: string;
        sessionFile: string;
        reason: "bootstrap";
        sessionManager: unknown;
        runtimeContext?: ContextEngineRuntimeContext;
    }) => Promise<unknown>;
    warn: (message: string) => void;
}): Promise<void>;
export declare function assembleAttemptContextEngine(params: {
    contextEngine?: AttemptContextEngine;
    sessionId: string;
    sessionKey?: string;
    messages: AgentMessage[];
    tokenBudget?: number;
    availableTools?: Set<string>;
    citationsMode?: MemoryCitationsMode;
    modelId: string;
    prompt?: string;
}): Promise<import("../../../context-engine/types.js").AssembleResult | undefined>;
export declare function finalizeAttemptContextEngineTurn(params: {
    contextEngine?: AttemptContextEngine;
    promptError: boolean;
    aborted: boolean;
    yieldAborted: boolean;
    sessionIdUsed: string;
    sessionKey?: string;
    sessionFile: string;
    messagesSnapshot: AgentMessage[];
    prePromptMessageCount: number;
    tokenBudget?: number;
    runtimeContext?: ContextEngineRuntimeContext;
    runMaintenance: (params: {
        contextEngine?: unknown;
        sessionId: string;
        sessionKey?: string;
        sessionFile: string;
        reason: "turn";
        sessionManager: unknown;
        runtimeContext?: ContextEngineRuntimeContext;
    }) => Promise<unknown>;
    sessionManager: unknown;
    warn: (message: string) => void;
}): Promise<{
    postTurnFinalizationSucceeded: boolean;
}>;
