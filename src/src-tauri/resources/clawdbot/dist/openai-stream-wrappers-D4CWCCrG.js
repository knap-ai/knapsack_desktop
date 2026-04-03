import { t as createSubsystemLogger } from "./subsystem-CJEvHE2o.js";
import { r as streamWithPayloadPatch } from "./moonshot-thinking-stream-wrappers-ARhjUCLc.js";
import { c as resolveCodexNativeSearchActivation, s as patchCodexNativeWebSearchPayload } from "./codex-native-web-search-pOKJYmAV.js";
import { a as resolveProviderRequestPolicyConfig } from "./provider-request-config-0I1kx7Qd.js";
import { streamSimple } from "@mariozechner/pi-ai";
//#region src/agents/pi-embedded-runner/bedrock-stream-wrappers.ts
function createBedrockNoCacheWrapper(baseStreamFn) {
	const underlying = baseStreamFn ?? streamSimple;
	return (model, context, options) => underlying(model, context, {
		...options,
		cacheRetention: "none"
	});
}
function isAnthropicBedrockModel(modelId) {
	const normalized = modelId.toLowerCase();
	return normalized.includes("anthropic.claude") || normalized.includes("anthropic/claude");
}
//#endregion
//#region src/agents/pi-embedded-runner/google-stream-wrappers.ts
function isGemini31Model(modelId) {
	const normalized = modelId.toLowerCase();
	return normalized.includes("gemini-3.1-pro") || normalized.includes("gemini-3.1-flash");
}
function mapThinkLevelToGoogleThinkingLevel(thinkingLevel) {
	switch (thinkingLevel) {
		case "minimal": return "MINIMAL";
		case "low": return "LOW";
		case "medium":
		case "adaptive": return "MEDIUM";
		case "high":
		case "xhigh": return "HIGH";
		default: return;
	}
}
function sanitizeGoogleThinkingPayload(params) {
	if (!params.payload || typeof params.payload !== "object") return;
	const config = params.payload.config;
	if (!config || typeof config !== "object") return;
	const thinkingConfig = config.thinkingConfig;
	if (!thinkingConfig || typeof thinkingConfig !== "object") return;
	const thinkingConfigObj = thinkingConfig;
	const thinkingBudget = thinkingConfigObj.thinkingBudget;
	if (typeof thinkingBudget !== "number" || thinkingBudget >= 0) return;
	delete thinkingConfigObj.thinkingBudget;
	if (typeof params.modelId === "string" && isGemini31Model(params.modelId) && params.thinkingLevel && params.thinkingLevel !== "off" && thinkingConfigObj.thinkingLevel === void 0) {
		const mappedLevel = mapThinkLevelToGoogleThinkingLevel(params.thinkingLevel);
		if (mappedLevel) thinkingConfigObj.thinkingLevel = mappedLevel;
	}
}
function createGoogleThinkingPayloadWrapper(baseStreamFn, thinkingLevel) {
	const underlying = baseStreamFn ?? streamSimple;
	return (model, context, options) => {
		return streamWithPayloadPatch(underlying, model, context, options, (payload) => {
			if (model.api === "google-generative-ai") sanitizeGoogleThinkingPayload({
				payload,
				modelId: model.id,
				thinkingLevel
			});
		});
	};
}
//#endregion
//#region src/agents/pi-embedded-runner/logger.ts
const log = createSubsystemLogger("agent/embedded");
//#endregion
//#region src/agents/pi-embedded-runner/openai-stream-wrappers.ts
const OPENAI_RESPONSES_APIS = new Set(["openai-responses", "azure-openai-responses"]);
const OPENAI_REASONING_COMPAT_PROVIDERS = new Set([
	"openai",
	"openai-codex",
	"azure-openai",
	"azure-openai-responses"
]);
function resolveOpenAIRequestCapabilities(model) {
	return resolveProviderRequestPolicyConfig({
		provider: typeof model.provider === "string" ? model.provider : void 0,
		api: typeof model.api === "string" ? model.api : void 0,
		baseUrl: typeof model.baseUrl === "string" ? model.baseUrl : void 0,
		compat: model.compat,
		capability: "llm",
		transport: "stream"
	}).capabilities;
}
function shouldApplyOpenAIAttributionHeaders(model) {
	const attributionProvider = resolveOpenAIRequestCapabilities(model).attributionProvider;
	return attributionProvider === "openai" || attributionProvider === "openai-codex" ? attributionProvider : void 0;
}
function shouldApplyOpenAIServiceTier(model) {
	return resolveOpenAIRequestCapabilities(model).allowsOpenAIServiceTier;
}
function shouldForceResponsesStore(model) {
	return resolveOpenAIRequestCapabilities(model).allowsResponsesStore;
}
function parsePositiveInteger(value) {
	if (typeof value === "number" && Number.isFinite(value) && value > 0) return Math.floor(value);
	if (typeof value === "string") {
		const parsed = Number.parseInt(value, 10);
		if (Number.isFinite(parsed) && parsed > 0) return parsed;
	}
}
function resolveOpenAIResponsesCompactThreshold(model) {
	const contextWindow = parsePositiveInteger(model.contextWindow);
	if (contextWindow) return Math.max(1e3, Math.floor(contextWindow * .7));
	return 8e4;
}
function shouldEnableOpenAIResponsesServerCompaction(model, extraParams) {
	const configured = extraParams?.responsesServerCompaction;
	if (configured === false) return false;
	if (!shouldForceResponsesStore(model)) return false;
	if (configured === true) return true;
	return model.provider === "openai";
}
function shouldStripResponsesStore(model, forceStore) {
	if (forceStore) return false;
	if (typeof model.api !== "string") return false;
	return OPENAI_RESPONSES_APIS.has(model.api) && model.compat?.supportsStore === false;
}
function shouldStripResponsesPromptCache(model) {
	return resolveOpenAIRequestCapabilities(model).shouldStripResponsesPromptCache;
}
function shouldApplyOpenAIReasoningCompatibility(model) {
	if (typeof model.api !== "string" || typeof model.provider !== "string") return false;
	if (model.api !== "openai-completions" && model.api !== "openai-responses" && model.api !== "openai-codex-responses" && model.api !== "azure-openai-responses") return false;
	return OPENAI_REASONING_COMPAT_PROVIDERS.has(model.provider);
}
function stripDisabledOpenAIReasoningPayload(payloadObj) {
	const reasoning = payloadObj.reasoning;
	if (reasoning === "none") {
		delete payloadObj.reasoning;
		return;
	}
	if (!reasoning || typeof reasoning !== "object" || Array.isArray(reasoning)) return;
	if (reasoning.effort === "none") delete payloadObj.reasoning;
}
function applyOpenAIResponsesPayloadOverrides(params) {
	if (params.forceStore) params.payloadObj.store = true;
	if (params.stripStore) delete params.payloadObj.store;
	if (params.stripPromptCache) {
		delete params.payloadObj.prompt_cache_key;
		delete params.payloadObj.prompt_cache_retention;
	}
	if (params.useServerCompaction && params.payloadObj.context_management === void 0) params.payloadObj.context_management = [{
		type: "compaction",
		compact_threshold: params.compactThreshold
	}];
}
function normalizeOpenAIServiceTier(value) {
	if (typeof value !== "string") return;
	const normalized = value.trim().toLowerCase();
	if (normalized === "auto" || normalized === "default" || normalized === "flex" || normalized === "priority") return normalized;
}
function resolveOpenAIServiceTier(extraParams) {
	const raw = extraParams?.serviceTier ?? extraParams?.service_tier;
	const normalized = normalizeOpenAIServiceTier(raw);
	if (raw !== void 0 && normalized === void 0) {
		const rawSummary = typeof raw === "string" ? raw : typeof raw;
		log.warn(`ignoring invalid OpenAI service tier param: ${rawSummary}`);
	}
	return normalized;
}
function normalizeOpenAITextVerbosity(value) {
	if (typeof value !== "string") return;
	const normalized = value.trim().toLowerCase();
	if (normalized === "low" || normalized === "medium" || normalized === "high") return normalized;
}
function resolveOpenAITextVerbosity(extraParams) {
	const raw = extraParams?.textVerbosity ?? extraParams?.text_verbosity;
	const normalized = normalizeOpenAITextVerbosity(raw);
	if (raw !== void 0 && normalized === void 0) {
		const rawSummary = typeof raw === "string" ? raw : typeof raw;
		log.warn(`ignoring invalid OpenAI text verbosity param: ${rawSummary}`);
	}
	return normalized;
}
function normalizeOpenAIFastMode(value) {
	if (typeof value === "boolean") return value;
	if (typeof value !== "string") return;
	const normalized = value.trim().toLowerCase();
	if (normalized === "on" || normalized === "true" || normalized === "yes" || normalized === "1" || normalized === "fast") return true;
	if (normalized === "off" || normalized === "false" || normalized === "no" || normalized === "0" || normalized === "normal") return false;
}
function resolveOpenAIFastMode(extraParams) {
	const raw = extraParams?.fastMode ?? extraParams?.fast_mode;
	const normalized = normalizeOpenAIFastMode(raw);
	if (raw !== void 0 && normalized === void 0) {
		const rawSummary = typeof raw === "string" ? raw : typeof raw;
		log.warn(`ignoring invalid OpenAI fast mode param: ${rawSummary}`);
	}
	return normalized;
}
function applyOpenAIFastModePayloadOverrides(params) {
	if (params.payloadObj.service_tier === void 0 && shouldApplyOpenAIServiceTier(params.model)) params.payloadObj.service_tier = "priority";
}
function createOpenAIResponsesContextManagementWrapper(baseStreamFn, extraParams) {
	const underlying = baseStreamFn ?? streamSimple;
	return (model, context, options) => {
		const forceStore = shouldForceResponsesStore(model);
		const useServerCompaction = shouldEnableOpenAIResponsesServerCompaction(model, extraParams);
		const stripStore = shouldStripResponsesStore(model, forceStore);
		const stripPromptCache = shouldStripResponsesPromptCache(model);
		if (!forceStore && !useServerCompaction && !stripStore && !stripPromptCache) return underlying(model, context, options);
		const compactThreshold = parsePositiveInteger(extraParams?.responsesCompactThreshold) ?? resolveOpenAIResponsesCompactThreshold(model);
		const originalOnPayload = options?.onPayload;
		return underlying(model, context, {
			...options,
			onPayload: (payload) => {
				if (payload && typeof payload === "object") applyOpenAIResponsesPayloadOverrides({
					payloadObj: payload,
					forceStore,
					stripStore,
					stripPromptCache,
					useServerCompaction,
					compactThreshold
				});
				return originalOnPayload?.(payload, model);
			}
		});
	};
}
function createOpenAIReasoningCompatibilityWrapper(baseStreamFn) {
	const underlying = baseStreamFn ?? streamSimple;
	return (model, context, options) => {
		if (!shouldApplyOpenAIReasoningCompatibility(model)) return underlying(model, context, options);
		return streamWithPayloadPatch(underlying, model, context, options, (payloadObj) => {
			stripDisabledOpenAIReasoningPayload(payloadObj);
		});
	};
}
function createOpenAIFastModeWrapper(baseStreamFn) {
	const underlying = baseStreamFn ?? streamSimple;
	return (model, context, options) => {
		if (model.api !== "openai-responses" && model.api !== "openai-codex-responses" && model.api !== "azure-openai-responses" || model.provider !== "openai" && model.provider !== "openai-codex") return underlying(model, context, options);
		const originalOnPayload = options?.onPayload;
		return underlying(model, context, {
			...options,
			onPayload: (payload) => {
				if (payload && typeof payload === "object") applyOpenAIFastModePayloadOverrides({
					payloadObj: payload,
					model
				});
				return originalOnPayload?.(payload, model);
			}
		});
	};
}
function createOpenAIServiceTierWrapper(baseStreamFn, serviceTier) {
	const underlying = baseStreamFn ?? streamSimple;
	return (model, context, options) => {
		if (!shouldApplyOpenAIServiceTier(model)) return underlying(model, context, options);
		return streamWithPayloadPatch(underlying, model, context, options, (payloadObj) => {
			if (payloadObj.service_tier === void 0) payloadObj.service_tier = serviceTier;
		});
	};
}
function createOpenAITextVerbosityWrapper(baseStreamFn, verbosity) {
	const underlying = baseStreamFn ?? streamSimple;
	return (model, context, options) => {
		if (model.api !== "openai-responses" && model.api !== "openai-codex-responses") return underlying(model, context, options);
		const shouldOverrideExistingVerbosity = model.api === "openai-codex-responses";
		const originalOnPayload = options?.onPayload;
		return underlying(model, context, {
			...options,
			onPayload: (payload) => {
				if (payload && typeof payload === "object") {
					const payloadObj = payload;
					const existingText = payloadObj.text && typeof payloadObj.text === "object" ? payloadObj.text : {};
					if (shouldOverrideExistingVerbosity || existingText.verbosity === void 0) payloadObj.text = {
						...existingText,
						verbosity
					};
				}
				return originalOnPayload?.(payload, model);
			}
		});
	};
}
function createCodexNativeWebSearchWrapper(baseStreamFn, params) {
	const underlying = baseStreamFn ?? streamSimple;
	return (model, context, options) => {
		const activation = resolveCodexNativeSearchActivation({
			config: params.config,
			modelProvider: typeof model.provider === "string" ? model.provider : void 0,
			modelApi: typeof model.api === "string" ? model.api : void 0,
			agentDir: params.agentDir
		});
		if (activation.state !== "native_active") {
			if (activation.codexNativeEnabled) log.debug(`skipping Codex native web search (${activation.inactiveReason ?? "inactive"}) for ${String(model.provider ?? "unknown")}/${String(model.id ?? "unknown")}`);
			return underlying(model, context, options);
		}
		log.debug(`activating Codex native web search (${activation.codexMode}) for ${String(model.provider ?? "unknown")}/${String(model.id ?? "unknown")}`);
		const originalOnPayload = options?.onPayload;
		return underlying(model, context, {
			...options,
			onPayload: (payload) => {
				const result = patchCodexNativeWebSearchPayload({
					payload,
					config: params.config
				});
				if (result.status === "payload_not_object") log.debug("Skipping Codex native web search injection because provider payload is not an object");
				else if (result.status === "native_tool_already_present") log.debug("Codex native web search tool already present in provider payload");
				else if (result.status === "injected") log.debug("Injected Codex native web search tool into provider payload");
				return originalOnPayload?.(payload, model);
			}
		});
	};
}
function createOpenAIDefaultTransportWrapper(baseStreamFn) {
	const underlying = baseStreamFn ?? streamSimple;
	return (model, context, options) => {
		const typedOptions = options;
		return underlying(model, context, {
			...options,
			transport: options?.transport ?? "auto",
			openaiWsWarmup: typedOptions?.openaiWsWarmup ?? false
		});
	};
}
function createOpenAIAttributionHeadersWrapper(baseStreamFn) {
	const underlying = baseStreamFn ?? streamSimple;
	return (model, context, options) => {
		const attributionProvider = shouldApplyOpenAIAttributionHeaders(model);
		if (!attributionProvider) return underlying(model, context, options);
		return underlying(model, context, {
			...options,
			headers: resolveProviderRequestPolicyConfig({
				provider: attributionProvider,
				api: typeof model.api === "string" ? model.api : void 0,
				baseUrl: typeof model.baseUrl === "string" ? model.baseUrl : void 0,
				capability: "llm",
				transport: "stream",
				callerHeaders: options?.headers,
				precedence: "defaults-win"
			}).headers
		});
	};
}
//#endregion
export { createOpenAIReasoningCompatibilityWrapper as a, createOpenAITextVerbosityWrapper as c, resolveOpenAITextVerbosity as d, log as f, isAnthropicBedrockModel as g, createBedrockNoCacheWrapper as h, createOpenAIFastModeWrapper as i, resolveOpenAIFastMode as l, sanitizeGoogleThinkingPayload as m, createOpenAIAttributionHeadersWrapper as n, createOpenAIResponsesContextManagementWrapper as o, createGoogleThinkingPayloadWrapper as p, createOpenAIDefaultTransportWrapper as r, createOpenAIServiceTierWrapper as s, createCodexNativeWebSearchWrapper as t, resolveOpenAIServiceTier as u };
