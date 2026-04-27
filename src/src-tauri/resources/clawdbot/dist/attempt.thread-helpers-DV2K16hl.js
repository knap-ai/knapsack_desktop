import { r as resolveProviderEndpoint } from "./provider-attribution-DMdhUxEe.js";
import { s as joinPresentTextSegments } from "./hook-runner-global-C-5w-v1N.js";
import { n as normalizeStructuredPromptSection } from "./prompt-cache-stability-D3r6Fd59.js";
//#region src/agents/pi-embedded-runner/compaction-runtime-context.ts
/**
* Resolve the effective compaction target from config, falling back to the
* caller-supplied provider/model and optionally applying runtime defaults.
*/
function resolveEmbeddedCompactionTarget(params) {
	const provider = params.provider?.trim() || params.defaultProvider;
	const model = params.modelId?.trim() || params.defaultModel;
	const override = params.config?.agents?.defaults?.compaction?.model?.trim();
	if (!override) return {
		provider,
		model,
		authProfileId: params.authProfileId ?? void 0
	};
	const slashIdx = override.indexOf("/");
	if (slashIdx > 0) {
		const overrideProvider = override.slice(0, slashIdx).trim();
		return {
			provider: overrideProvider,
			model: override.slice(slashIdx + 1).trim() || params.defaultModel,
			authProfileId: overrideProvider !== (params.provider ?? "")?.trim() ? void 0 : params.authProfileId ?? void 0
		};
	}
	return {
		provider,
		model: override,
		authProfileId: params.authProfileId ?? void 0
	};
}
function buildEmbeddedCompactionRuntimeContext(params) {
	const resolved = resolveEmbeddedCompactionTarget({
		config: params.config,
		provider: params.provider,
		modelId: params.modelId,
		authProfileId: params.authProfileId
	});
	return {
		sessionKey: params.sessionKey ?? void 0,
		messageChannel: params.messageChannel ?? void 0,
		messageProvider: params.messageProvider ?? void 0,
		agentAccountId: params.agentAccountId ?? void 0,
		currentChannelId: params.currentChannelId ?? void 0,
		currentThreadTs: params.currentThreadTs ?? void 0,
		currentMessageId: params.currentMessageId ?? void 0,
		authProfileId: resolved.authProfileId,
		workspaceDir: params.workspaceDir,
		agentDir: params.agentDir,
		config: params.config,
		skillsSnapshot: params.skillsSnapshot,
		senderIsOwner: params.senderIsOwner,
		senderId: params.senderId ?? void 0,
		provider: resolved.provider,
		model: resolved.model,
		thinkLevel: params.thinkLevel,
		reasoningLevel: params.reasoningLevel,
		bashElevated: params.bashElevated,
		extraSystemPrompt: params.extraSystemPrompt,
		ownerNumbers: params.ownerNumbers
	};
}
//#endregion
//#region src/agents/pi-embedded-runner/run/attempt.thread-helpers.ts
const ATTEMPT_CACHE_TTL_CUSTOM_TYPE = "openclaw.cache-ttl";
function composeSystemPromptWithHookContext(params) {
	const prependSystem = typeof params.prependSystemContext === "string" ? normalizeStructuredPromptSection(params.prependSystemContext) : "";
	const appendSystem = typeof params.appendSystemContext === "string" ? normalizeStructuredPromptSection(params.appendSystemContext) : "";
	if (!prependSystem && !appendSystem) return;
	return joinPresentTextSegments([
		prependSystem,
		params.baseSystemPrompt,
		appendSystem
	], { trim: true });
}
function resolveAttemptSpawnWorkspaceDir(params) {
	return params.sandbox?.enabled && params.sandbox.workspaceAccess !== "rw" ? params.resolvedWorkspace : void 0;
}
function shouldUseOpenAIWebSocketTransport(params) {
	if (params.modelApi !== "openai-responses" || params.provider !== "openai") return false;
	const endpointClass = resolveProviderEndpoint(params.modelBaseUrl).endpointClass;
	return endpointClass === "default" || endpointClass === "openai-public";
}
function shouldAppendAttemptCacheTtl(params) {
	if (params.timedOutDuringCompaction || params.compactionOccurredThisAttempt) return false;
	return params.config?.agents?.defaults?.contextPruning?.mode === "cache-ttl" && params.isCacheTtlEligibleProvider(params.provider, params.modelId, params.modelApi);
}
function appendAttemptCacheTtlIfNeeded(params) {
	if (!shouldAppendAttemptCacheTtl(params)) return false;
	params.sessionManager.appendCustomEntry?.(ATTEMPT_CACHE_TTL_CUSTOM_TYPE, {
		timestamp: params.now ?? Date.now(),
		provider: params.provider,
		modelId: params.modelId
	});
	return true;
}
function shouldPersistCompletedBootstrapTurn(params) {
	if (!params.shouldRecordCompletedBootstrapTurn || params.promptError || params.aborted) return false;
	if (params.timedOutDuringCompaction || params.compactionOccurredThisAttempt) return false;
	return true;
}
//#endregion
export { shouldUseOpenAIWebSocketTransport as a, shouldPersistCompletedBootstrapTurn as i, composeSystemPromptWithHookContext as n, buildEmbeddedCompactionRuntimeContext as o, resolveAttemptSpawnWorkspaceDir as r, resolveEmbeddedCompactionTarget as s, appendAttemptCacheTtlIfNeeded as t };
