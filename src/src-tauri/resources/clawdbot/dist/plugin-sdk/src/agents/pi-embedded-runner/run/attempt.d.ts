import { resetEmbeddedAgentBaseStreamFnCacheForTest, resolveEmbeddedAgentBaseStreamFn, resolveEmbeddedAgentStreamFn } from "../stream-resolution.js";
import type { EmbeddedRunAttemptParams, EmbeddedRunAttemptResult } from "./types.js";
export { appendAttemptCacheTtlIfNeeded, composeSystemPromptWithHookContext, resolveAttemptSpawnWorkspaceDir, } from "./attempt.thread-helpers.js";
export { buildAfterTurnRuntimeContext, mergeOrphanedTrailingUserPrompt, prependSystemPromptAddition, resolveAttemptFsWorkspaceOnly, resolveAttemptPrependSystemContext, resolvePromptBuildHookResult, resolvePromptModeForSession, shouldWarnOnOrphanedUserRepair, shouldInjectHeartbeatPrompt, } from "./attempt.prompt-helpers.js";
export { buildSessionsYieldContextMessage, persistSessionsYieldContextMessage, queueSessionsYieldInterruptMessage, stripSessionsYieldArtifacts, } from "./attempt.sessions-yield.js";
export { isOllamaCompatProvider, resolveOllamaCompatNumCtxEnabled, shouldInjectOllamaCompatNumCtx, wrapOllamaCompatNumCtx, } from "../../../plugin-sdk/ollama-runtime.js";
export { decodeHtmlEntitiesInObject, wrapStreamFnRepairMalformedToolCallArguments, } from "./attempt.tool-call-argument-repair.js";
export { wrapStreamFnSanitizeMalformedToolCalls, wrapStreamFnTrimToolCallNames, } from "./attempt.tool-call-normalization.js";
export { resetEmbeddedAgentBaseStreamFnCacheForTest, resolveEmbeddedAgentBaseStreamFn, resolveEmbeddedAgentStreamFn, };
export declare function resolveUnknownToolGuardThreshold(loopDetection?: {
    enabled?: boolean;
    unknownToolThreshold?: number;
}): number;
export declare function runEmbeddedAttempt(params: EmbeddedRunAttemptParams): Promise<EmbeddedRunAttemptResult>;
