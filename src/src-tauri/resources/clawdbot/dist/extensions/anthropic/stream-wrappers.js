import { normalizeFastMode, normalizeLowercaseStringOrEmpty, readStringValue } from "openclaw/plugin-sdk/text-runtime";
import { streamSimple } from "@mariozechner/pi-ai";
import { applyAnthropicPayloadPolicyToParams, composeProviderStreamWrappers, resolveAnthropicPayloadPolicy, streamWithPayloadPatch } from "openclaw/plugin-sdk/provider-stream-shared";
import { createSubsystemLogger } from "openclaw/plugin-sdk/runtime-env";
//#region extensions/anthropic/stream-wrappers.ts
const log = createSubsystemLogger("anthropic-stream");
const ANTHROPIC_CONTEXT_1M_BETA = "context-1m-2025-08-07";
const ANTHROPIC_1M_MODEL_PREFIXES = ["claude-opus-4", "claude-sonnet-4"];
const PI_AI_DEFAULT_ANTHROPIC_BETAS = ["fine-grained-tool-streaming-2025-05-14", "interleaved-thinking-2025-05-14"];
const PI_AI_OAUTH_ANTHROPIC_BETAS = [
	"claude-code-20250219",
	"oauth-2025-04-20",
	...PI_AI_DEFAULT_ANTHROPIC_BETAS
];
function isAnthropic1MModel(modelId) {
	const normalized = normalizeLowercaseStringOrEmpty(modelId);
	return ANTHROPIC_1M_MODEL_PREFIXES.some((prefix) => normalized.startsWith(prefix));
}
function parseHeaderList(value) {
	if (typeof value !== "string") return [];
	return value.split(",").map((item) => item.trim()).filter(Boolean);
}
function mergeAnthropicBetaHeader(headers, betas) {
	const merged = { ...headers };
	const existingKey = Object.keys(merged).find((key) => normalizeLowercaseStringOrEmpty(key) === "anthropic-beta");
	const existing = existingKey ? parseHeaderList(merged[existingKey]) : [];
	const values = Array.from(new Set([...existing, ...betas]));
	const key = existingKey ?? "anthropic-beta";
	merged[key] = values.join(",");
	return merged;
}
function isAnthropicOAuthApiKey(apiKey) {
	return typeof apiKey === "string" && apiKey.includes("sk-ant-oat");
}
function resolveAnthropicFastServiceTier(enabled) {
	return enabled ? "auto" : "standard_only";
}
function normalizeAnthropicServiceTier(value) {
	if (typeof value !== "string") return;
	const normalized = normalizeLowercaseStringOrEmpty(value);
	if (normalized === "auto" || normalized === "standard_only") return normalized;
}
function resolveAnthropicBetas(extraParams, modelId) {
	const betas = /* @__PURE__ */ new Set();
	const configured = extraParams?.anthropicBeta;
	if (typeof configured === "string" && configured.trim()) betas.add(configured.trim());
	else if (Array.isArray(configured)) {
		for (const beta of configured) if (typeof beta === "string" && beta.trim()) betas.add(beta.trim());
	}
	if (extraParams?.context1m === true) if (isAnthropic1MModel(modelId)) betas.add(ANTHROPIC_CONTEXT_1M_BETA);
	else log.warn(`ignoring context1m for non-opus/sonnet model: anthropic/${modelId}`);
	return betas.size > 0 ? [...betas] : void 0;
}
function createAnthropicBetaHeadersWrapper(baseStreamFn, betas) {
	const underlying = baseStreamFn ?? streamSimple;
	return (model, context, options) => {
		const isOauth = isAnthropicOAuthApiKey(options?.apiKey);
		const requestedContext1m = betas.includes(ANTHROPIC_CONTEXT_1M_BETA);
		const effectiveBetas = isOauth && requestedContext1m ? betas.filter((beta) => beta !== ANTHROPIC_CONTEXT_1M_BETA) : betas;
		if (isOauth && requestedContext1m) log.warn(`ignoring context1m for Anthropic Claude CLI or legacy token auth on ${model.provider}/${model.id}; falling back to the standard context window because Anthropic rejects context-1m beta with non-API-key auth`);
		const allBetas = [...new Set([...isOauth ? PI_AI_OAUTH_ANTHROPIC_BETAS : PI_AI_DEFAULT_ANTHROPIC_BETAS, ...effectiveBetas])];
		return underlying(model, context, {
			...options,
			headers: mergeAnthropicBetaHeader(options?.headers, allBetas)
		});
	};
}
function createAnthropicFastModeWrapper(baseStreamFn, enabled) {
	return createAnthropicServiceTierWrapper(baseStreamFn, resolveAnthropicFastServiceTier(enabled));
}
function createAnthropicServiceTierWrapper(baseStreamFn, serviceTier) {
	const underlying = baseStreamFn ?? streamSimple;
	return (model, context, options) => {
		if (isAnthropicOAuthApiKey(options?.apiKey)) return underlying(model, context, options);
		const payloadPolicy = resolveAnthropicPayloadPolicy({
			provider: readStringValue(model.provider),
			api: readStringValue(model.api),
			baseUrl: readStringValue(model.baseUrl),
			serviceTier
		});
		if (!payloadPolicy.allowsServiceTier) return underlying(model, context, options);
		return streamWithPayloadPatch(underlying, model, context, options, (payloadObj) => applyAnthropicPayloadPolicyToParams(payloadObj, payloadPolicy));
	};
}
function resolveAnthropicFastMode(extraParams) {
	return normalizeFastMode(extraParams?.fastMode ?? extraParams?.fast_mode);
}
function resolveAnthropicServiceTier(extraParams) {
	const raw = extraParams?.serviceTier ?? extraParams?.service_tier;
	const normalized = normalizeAnthropicServiceTier(raw);
	if (raw !== void 0 && normalized === void 0) {
		const rawSummary = typeof raw === "string" ? raw : typeof raw;
		log.warn(`ignoring invalid Anthropic service tier param: ${rawSummary}`);
	}
	return normalized;
}
function wrapAnthropicProviderStream(ctx) {
	const anthropicBetas = resolveAnthropicBetas(ctx.extraParams, ctx.modelId);
	const serviceTier = resolveAnthropicServiceTier(ctx.extraParams);
	const fastMode = resolveAnthropicFastMode(ctx.extraParams);
	return composeProviderStreamWrappers(ctx.streamFn, anthropicBetas?.length ? (streamFn) => createAnthropicBetaHeadersWrapper(streamFn, anthropicBetas) : void 0, serviceTier ? (streamFn) => createAnthropicServiceTierWrapper(streamFn, serviceTier) : void 0, fastMode !== void 0 ? (streamFn) => createAnthropicFastModeWrapper(streamFn, fastMode) : void 0);
}
const __testing = { log };
//#endregion
export { __testing, createAnthropicBetaHeadersWrapper, createAnthropicFastModeWrapper, createAnthropicServiceTierWrapper, resolveAnthropicBetas, resolveAnthropicFastMode, resolveAnthropicServiceTier, wrapAnthropicProviderStream };
