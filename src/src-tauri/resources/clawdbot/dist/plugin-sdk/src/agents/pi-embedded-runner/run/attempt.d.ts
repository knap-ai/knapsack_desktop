import type { AgentMessage, StreamFn } from "@mariozechner/pi-agent-core";
import type { OpenClawConfig } from "../../../config/config.js";
import type { PluginHookAgentContext, PluginHookBeforeAgentStartResult, PluginHookBeforePromptBuildResult } from "../../../plugins/types.js";
import type { TranscriptPolicy } from "../../transcript-policy.js";
import type { CompactEmbeddedPiSessionParams } from "../compact.js";
import type { EmbeddedRunAttemptParams, EmbeddedRunAttemptResult } from "./types.js";
type PromptBuildHookRunner = {
    hasHooks: (hookName: "before_prompt_build" | "before_agent_start") => boolean;
    runBeforePromptBuild: (event: {
        prompt: string;
        messages: unknown[];
    }, ctx: PluginHookAgentContext) => Promise<PluginHookBeforePromptBuildResult | undefined>;
    runBeforeAgentStart: (event: {
        prompt: string;
        messages: unknown[];
    }, ctx: PluginHookAgentContext) => Promise<PluginHookBeforeAgentStartResult | undefined>;
};
export declare function buildSessionsYieldContextMessage(message: string): string;
export declare function queueSessionsYieldInterruptMessage(activeSession: {
    agent: {
        steer: (message: AgentMessage) => void;
    };
}): void;
export declare function persistSessionsYieldContextMessage(activeSession: {
    sendCustomMessage: (message: {
        customType: string;
        content: string;
        display: boolean;
        details?: Record<string, unknown>;
    }, options?: {
        triggerTurn?: boolean;
    }) => Promise<void>;
}, message: string): Promise<void>;
export declare function stripSessionsYieldArtifacts(activeSession: {
    messages: AgentMessage[];
    agent: {
        replaceMessages: (messages: AgentMessage[]) => void;
    };
    sessionManager?: unknown;
}): void;
export declare function isOllamaCompatProvider(model: {
    provider?: string;
    baseUrl?: string;
    api?: string;
}): boolean;
export declare function resolveOllamaCompatNumCtxEnabled(params: {
    config?: OpenClawConfig;
    providerId?: string;
}): boolean;
export declare function shouldInjectOllamaCompatNumCtx(params: {
    model: {
        api?: string;
        provider?: string;
        baseUrl?: string;
    };
    config?: OpenClawConfig;
    providerId?: string;
}): boolean;
export declare function wrapOllamaCompatNumCtx(baseFn: StreamFn | undefined, numCtx: number): StreamFn;
export declare function wrapStreamFnTrimToolCallNames(baseFn: StreamFn, allowedToolNames?: Set<string>): StreamFn;
export declare function wrapStreamFnSanitizeMalformedToolCalls(baseFn: StreamFn, allowedToolNames?: Set<string>, transcriptPolicy?: Pick<TranscriptPolicy, "validateGeminiTurns" | "validateAnthropicTurns">): StreamFn;
export declare function wrapStreamFnRepairMalformedToolCallArguments(baseFn: StreamFn): StreamFn;
export declare function decodeHtmlEntitiesInObject(obj: unknown): unknown;
export declare function resolvePromptBuildHookResult(params: {
    prompt: string;
    messages: unknown[];
    hookCtx: PluginHookAgentContext;
    hookRunner?: PromptBuildHookRunner | null;
    legacyBeforeAgentStartResult?: PluginHookBeforeAgentStartResult;
}): Promise<PluginHookBeforePromptBuildResult>;
export { appendAttemptCacheTtlIfNeeded, composeSystemPromptWithHookContext, resolveAttemptSpawnWorkspaceDir, } from "./attempt.thread-helpers.js";
export declare function resolvePromptModeForSession(sessionKey?: string): "minimal" | "full";
export declare function resolveAttemptFsWorkspaceOnly(params: {
    config?: OpenClawConfig;
    sessionAgentId: string;
}): boolean;
export declare function prependSystemPromptAddition(params: {
    systemPrompt: string;
    systemPromptAddition?: string;
}): string;
/** Build runtime context passed into context-engine afterTurn hooks. */
export declare function buildAfterTurnRuntimeContext(params: {
    attempt: Pick<EmbeddedRunAttemptParams, "sessionKey" | "messageChannel" | "messageProvider" | "agentAccountId" | "currentChannelId" | "currentThreadTs" | "currentMessageId" | "config" | "skillsSnapshot" | "senderIsOwner" | "senderId" | "provider" | "modelId" | "thinkLevel" | "reasoningLevel" | "bashElevated" | "extraSystemPrompt" | "ownerNumbers" | "authProfileId">;
    workspaceDir: string;
    agentDir: string;
}): Partial<CompactEmbeddedPiSessionParams>;
export declare function runEmbeddedAttempt(params: EmbeddedRunAttemptParams): Promise<EmbeddedRunAttemptResult>;
