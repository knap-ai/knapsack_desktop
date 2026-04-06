import { t as createSubsystemLogger } from "./subsystem-CJEvHE2o.js";
import { n as resolveProviderRequestCapabilities } from "./provider-attribution-BrdhzyJa.js";
import { r as streamWithPayloadPatch } from "./moonshot-thinking-stream-wrappers-ARhjUCLc.js";
import "./runtime-env-CoykX19-.js";
import "./provider-http-CMHzFsgV.js";
import "./provider-stream-D_iORY-e.js";
import { streamSimple } from "@mariozechner/pi-ai";
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
	const normalized = modelId.trim().toLowerCase();
	return ANTHROPIC_1M_MODEL_PREFIXES.some((prefix) => normalized.startsWith(prefix));
}
function parseHeaderList(value) {
	if (typeof value !== "string") return [];
	return value.split(",").map((item) => item.trim()).filter(Boolean);
}
function mergeAnthropicBetaHeader(headers, betas) {
	const merged = { ...headers };
	const existingKey = Object.keys(merged).find((key) => key.toLowerCase() === "anthropic-beta");
	const existing = existingKey ? parseHeaderList(merged[existingKey]) : [];
	const values = Array.from(new Set([...existing, ...betas]));
	const key = existingKey ?? "anthropic-beta";
	merged[key] = values.join(",");
	return merged;
}
function isAnthropicOAuthApiKey(apiKey) {
	return typeof apiKey === "string" && apiKey.includes("sk-ant-oat");
}
function allowsAnthropicServiceTier(model) {
	return resolveProviderRequestCapabilities({
		provider: typeof model.provider === "string" ? model.provider : void 0,
		api: typeof model.api === "string" ? model.api : void 0,
		baseUrl: typeof model.baseUrl === "string" ? model.baseUrl : void 0,
		capability: "llm",
		transport: "stream"
	}).allowsAnthropicServiceTier;
}
function resolveAnthropicFastServiceTier(enabled) {
	return enabled ? "auto" : "standard_only";
}
function normalizeFastMode(raw) {
	if (typeof raw === "boolean") return raw;
	if (!raw) return;
	const key = raw.toLowerCase();
	if ([
		"off",
		"false",
		"no",
		"0",
		"disable",
		"disabled",
		"normal"
	].includes(key)) return false;
	if ([
		"on",
		"true",
		"yes",
		"1",
		"enable",
		"enabled",
		"fast"
	].includes(key)) return true;
}
function normalizeAnthropicServiceTier(value) {
	if (typeof value !== "string") return;
	const normalized = value.trim().toLowerCase();
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
		if (isOauth && requestedContext1m) log.warn(`ignoring context1m for Anthropic subscription (OAuth setup-token) auth on ${model.provider}/${model.id}; falling back to the standard context window because Anthropic rejects context-1m beta with OAuth auth`);
		const allBetas = [...new Set([...isOauth ? PI_AI_OAUTH_ANTHROPIC_BETAS : PI_AI_DEFAULT_ANTHROPIC_BETAS, ...effectiveBetas])];
		return underlying(model, context, {
			...options,
			headers: mergeAnthropicBetaHeader(options?.headers, allBetas)
		});
	};
}
function createAnthropicFastModeWrapper(baseStreamFn, enabled) {
	const underlying = baseStreamFn ?? streamSimple;
	const serviceTier = resolveAnthropicFastServiceTier(enabled);
	return (model, context, options) => {
		if (!allowsAnthropicServiceTier(model)) return underlying(model, context, options);
		return streamWithPayloadPatch(underlying, model, context, options, (payloadObj) => {
			if (payloadObj.service_tier === void 0) payloadObj.service_tier = serviceTier;
		});
	};
}
function createAnthropicServiceTierWrapper(baseStreamFn, serviceTier) {
	const underlying = baseStreamFn ?? streamSimple;
	return (model, context, options) => {
		if (!allowsAnthropicServiceTier(model)) return underlying(model, context, options);
		return streamWithPayloadPatch(underlying, model, context, options, (payloadObj) => {
			if (payloadObj.service_tier === void 0) payloadObj.service_tier = serviceTier;
		});
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
const __testing = { log };
//#endregion
export { resolveAnthropicBetas as a, createAnthropicServiceTierWrapper as i, createAnthropicBetaHeadersWrapper as n, resolveAnthropicFastMode as o, createAnthropicFastModeWrapper as r, resolveAnthropicServiceTier as s, __testing as t };
