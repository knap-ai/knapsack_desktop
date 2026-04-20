import { n as findNormalizedProviderValue } from "./provider-id-KaStHhRz.js";
import { n as resolveProviderEndpoint } from "./provider-attribution-BJhkfmfB.js";
//#region src/agents/context-window-guard.ts
const CONTEXT_WINDOW_HARD_MIN_TOKENS = 16e3;
const CONTEXT_WINDOW_WARN_BELOW_TOKENS = 32e3;
function normalizePositiveInt(value) {
	if (typeof value !== "number" || !Number.isFinite(value)) return null;
	const int = Math.floor(value);
	return int > 0 ? int : null;
}
function resolveContextWindowInfo(params) {
	const fromModelsConfig = (() => {
		const providers = params.cfg?.models?.providers;
		const providerEntry = findNormalizedProviderValue(providers, params.provider);
		const match = (Array.isArray(providerEntry?.models) ? providerEntry.models : []).find((m) => m?.id === params.modelId);
		return normalizePositiveInt(match?.contextTokens) ?? normalizePositiveInt(match?.contextWindow);
	})();
	const fromModel = normalizePositiveInt(params.modelContextTokens) ?? normalizePositiveInt(params.modelContextWindow);
	const baseInfo = fromModelsConfig ? {
		tokens: fromModelsConfig,
		source: "modelsConfig"
	} : fromModel ? {
		tokens: fromModel,
		source: "model"
	} : {
		tokens: Math.floor(params.defaultTokens),
		source: "default"
	};
	const capTokens = normalizePositiveInt(params.cfg?.agents?.defaults?.contextTokens);
	if (capTokens && capTokens < baseInfo.tokens) return {
		tokens: capTokens,
		source: "agentContextTokens"
	};
	return baseInfo;
}
function resolveContextWindowGuardHint(params) {
	const endpoint = resolveProviderEndpoint(params.runtimeBaseUrl ?? void 0);
	return {
		endpointClass: endpoint.endpointClass,
		likelySelfHosted: endpoint.endpointClass === "local"
	};
}
function formatContextWindowWarningMessage(params) {
	const base = `low context window: ${params.provider}/${params.modelId} ctx=${params.guard.tokens} (warn<${CONTEXT_WINDOW_WARN_BELOW_TOKENS}) source=${params.guard.source}`;
	if (!resolveContextWindowGuardHint({ runtimeBaseUrl: params.runtimeBaseUrl }).likelySelfHosted) return base;
	if (params.guard.source === "agentContextTokens") return `${base}; OpenClaw is capped by agents.defaults.contextTokens, so raise that cap if you want to use more of the model context window`;
	if (params.guard.source === "modelsConfig") return `${base}; OpenClaw is using the configured model context limit for this model, so raise contextWindow/contextTokens if it is set too low`;
	return `${base}; local/self-hosted runs work best at ${CONTEXT_WINDOW_WARN_BELOW_TOKENS}+ tokens and may show weaker tool use or more compaction until the server/model context limit is raised`;
}
function formatContextWindowBlockMessage(params) {
	const base = `Model context window too small (${params.guard.tokens} tokens; source=${params.guard.source}). Minimum is ${CONTEXT_WINDOW_HARD_MIN_TOKENS}.`;
	if (!resolveContextWindowGuardHint({ runtimeBaseUrl: params.runtimeBaseUrl }).likelySelfHosted) return base;
	if (params.guard.source === "agentContextTokens") return `${base} OpenClaw is capped by agents.defaults.contextTokens. Raise that cap.`;
	if (params.guard.source === "modelsConfig") return `${base} OpenClaw is using the configured model context limit for this model. Raise contextWindow/contextTokens or choose a larger model.`;
	return `${base} This looks like a local model endpoint. Raise the server/model context limit or choose a larger model. OpenClaw local/self-hosted runs work best at ${CONTEXT_WINDOW_WARN_BELOW_TOKENS}+ tokens.`;
}
function evaluateContextWindowGuard(params) {
	const warnBelow = Math.max(1, Math.floor(params.warnBelowTokens ?? 32e3));
	const hardMin = Math.max(1, Math.floor(params.hardMinTokens ?? 16e3));
	const tokens = Math.max(0, Math.floor(params.info.tokens));
	return {
		...params.info,
		tokens,
		shouldWarn: tokens > 0 && tokens < warnBelow,
		shouldBlock: tokens > 0 && tokens < hardMin
	};
}
//#endregion
export { formatContextWindowWarningMessage as a, formatContextWindowBlockMessage as i, CONTEXT_WINDOW_WARN_BELOW_TOKENS as n, resolveContextWindowInfo as o, evaluateContextWindowGuard as r, CONTEXT_WINDOW_HARD_MIN_TOKENS as t };
