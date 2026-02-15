/**
 * Plugin Hook Runner
 *
 * Provides utilities for executing plugin lifecycle hooks with proper
 * error handling, priority ordering, and async support.
 */
import type { PluginRegistry } from "./registry.js";
import type { PluginHookAfterCompactionEvent, PluginHookAfterToolCallEvent, PluginHookAgentContext, PluginHookAgentEndEvent, PluginHookBeforeAgentStartEvent, PluginHookBeforeAgentStartResult, PluginHookBeforeCompactionEvent, PluginHookBeforeResetEvent, PluginHookBeforeToolCallEvent, PluginHookBeforeToolCallResult, PluginHookGatewayContext, PluginHookGatewayStartEvent, PluginHookGatewayStopEvent, PluginHookMessageContext, PluginHookMessageReceivedEvent, PluginHookMessageSendingEvent, PluginHookMessageSendingResult, PluginHookMessageSentEvent, PluginHookName, PluginHookSessionContext, PluginHookSessionEndEvent, PluginHookSessionStartEvent, PluginHookToolContext, PluginHookToolResultPersistContext, PluginHookToolResultPersistEvent, PluginHookToolResultPersistResult } from "./types.js";
export type { PluginHookAgentContext, PluginHookBeforeAgentStartEvent, PluginHookBeforeAgentStartResult, PluginHookAgentEndEvent, PluginHookBeforeCompactionEvent, PluginHookBeforeResetEvent, PluginHookAfterCompactionEvent, PluginHookMessageContext, PluginHookMessageReceivedEvent, PluginHookMessageSendingEvent, PluginHookMessageSendingResult, PluginHookMessageSentEvent, PluginHookToolContext, PluginHookBeforeToolCallEvent, PluginHookBeforeToolCallResult, PluginHookAfterToolCallEvent, PluginHookToolResultPersistContext, PluginHookToolResultPersistEvent, PluginHookToolResultPersistResult, PluginHookSessionContext, PluginHookSessionStartEvent, PluginHookSessionEndEvent, PluginHookGatewayContext, PluginHookGatewayStartEvent, PluginHookGatewayStopEvent, };
export type HookRunnerLogger = {
    debug?: (message: string) => void;
    warn: (message: string) => void;
    error: (message: string) => void;
};
export type HookRunnerOptions = {
    logger?: HookRunnerLogger;
    /** If true, errors in hooks will be caught and logged instead of thrown */
    catchErrors?: boolean;
};
/**
 * Create a hook runner for a specific registry.
 */
export declare function createHookRunner(registry: PluginRegistry, options?: HookRunnerOptions): {
    runBeforeAgentStart: (event: PluginHookBeforeAgentStartEvent, ctx: PluginHookAgentContext) => Promise<PluginHookBeforeAgentStartResult | undefined>;
    runAgentEnd: (event: PluginHookAgentEndEvent, ctx: PluginHookAgentContext) => Promise<void>;
    runBeforeCompaction: (event: PluginHookBeforeCompactionEvent, ctx: PluginHookAgentContext) => Promise<void>;
    runAfterCompaction: (event: PluginHookAfterCompactionEvent, ctx: PluginHookAgentContext) => Promise<void>;
    runBeforeReset: (event: PluginHookBeforeResetEvent, ctx: PluginHookAgentContext) => Promise<void>;
    runMessageReceived: (event: PluginHookMessageReceivedEvent, ctx: PluginHookMessageContext) => Promise<void>;
    runMessageSending: (event: PluginHookMessageSendingEvent, ctx: PluginHookMessageContext) => Promise<PluginHookMessageSendingResult | undefined>;
    runMessageSent: (event: PluginHookMessageSentEvent, ctx: PluginHookMessageContext) => Promise<void>;
    runBeforeToolCall: (event: PluginHookBeforeToolCallEvent, ctx: PluginHookToolContext) => Promise<PluginHookBeforeToolCallResult | undefined>;
    runAfterToolCall: (event: PluginHookAfterToolCallEvent, ctx: PluginHookToolContext) => Promise<void>;
    runToolResultPersist: (event: PluginHookToolResultPersistEvent, ctx: PluginHookToolResultPersistContext) => PluginHookToolResultPersistResult | undefined;
    runSessionStart: (event: PluginHookSessionStartEvent, ctx: PluginHookSessionContext) => Promise<void>;
    runSessionEnd: (event: PluginHookSessionEndEvent, ctx: PluginHookSessionContext) => Promise<void>;
    runGatewayStart: (event: PluginHookGatewayStartEvent, ctx: PluginHookGatewayContext) => Promise<void>;
    runGatewayStop: (event: PluginHookGatewayStopEvent, ctx: PluginHookGatewayContext) => Promise<void>;
    hasHooks: (hookName: PluginHookName) => boolean;
    getHookCount: (hookName: PluginHookName) => number;
};
export type HookRunner = ReturnType<typeof createHookRunner>;
