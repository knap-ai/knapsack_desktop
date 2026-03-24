//#region src/plugins/provider-model-kilocode.ts
const KILOCODE_BASE_URL = "https://api.kilo.ai/api/gateway/";
const KILOCODE_DEFAULT_MODEL_ID = "kilo/auto";
const KILOCODE_DEFAULT_MODEL_REF = `kilocode/${KILOCODE_DEFAULT_MODEL_ID}`;
const KILOCODE_DEFAULT_MODEL_NAME = "Kilo Auto";
/**
* Static fallback catalog used by synchronous config surfaces and as the
* discovery fallback when the gateway model endpoint is unavailable.
*/
const KILOCODE_MODEL_CATALOG = [{
	id: KILOCODE_DEFAULT_MODEL_ID,
	name: KILOCODE_DEFAULT_MODEL_NAME,
	reasoning: true,
	input: ["text", "image"],
	contextWindow: 1e6,
	maxTokens: 128e3
}];
const KILOCODE_DEFAULT_CONTEXT_WINDOW = 1e6;
const KILOCODE_DEFAULT_MAX_TOKENS = 128e3;
const KILOCODE_DEFAULT_COST = {
	input: 0,
	output: 0,
	cacheRead: 0,
	cacheWrite: 0
};
//#endregion
//#region src/agents/model-compat.ts
const XAI_TOOL_SCHEMA_PROFILE = "xai";
const HTML_ENTITY_TOOL_CALL_ARGUMENTS_ENCODING = "html-entities";
function extractModelCompat(modelOrCompat) {
	if (!modelOrCompat || typeof modelOrCompat !== "object") return;
	if ("compat" in modelOrCompat) {
		const compat = modelOrCompat.compat;
		return compat && typeof compat === "object" ? compat : void 0;
	}
	return modelOrCompat;
}
function applyModelCompatPatch(model, patch) {
	const nextCompat = {
		...model.compat,
		...patch
	};
	if (model.compat && Object.entries(patch).every(([key, value]) => model.compat?.[key] === value)) return model;
	return {
		...model,
		compat: nextCompat
	};
}
function applyXaiModelCompat(model) {
	return applyModelCompatPatch(model, {
		toolSchemaProfile: "xai",
		nativeWebSearchTool: true,
		toolCallArgumentsEncoding: HTML_ENTITY_TOOL_CALL_ARGUMENTS_ENCODING
	});
}
function usesXaiToolSchemaProfile(modelOrCompat) {
	return extractModelCompat(modelOrCompat)?.toolSchemaProfile === "xai";
}
function hasNativeWebSearchTool(modelOrCompat) {
	return extractModelCompat(modelOrCompat)?.nativeWebSearchTool === true;
}
function resolveToolCallArgumentsEncoding(modelOrCompat) {
	return extractModelCompat(modelOrCompat)?.toolCallArgumentsEncoding;
}
function isOpenAiCompletionsModel(model) {
	return model.api === "openai-completions";
}
/**
* Returns true only for endpoints that are confirmed to be native OpenAI
* infrastructure and therefore accept the `developer` message role.
* Azure OpenAI uses the Chat Completions API and does NOT accept `developer`.
* All other openai-completions backends (proxies, Qwen, GLM, DeepSeek, etc.)
* only support the standard `system` role.
*/
function isOpenAINativeEndpoint(baseUrl) {
	try {
		return new URL(baseUrl).hostname.toLowerCase() === "api.openai.com";
	} catch {
		return false;
	}
}
function isAnthropicMessagesModel(model) {
	return model.api === "anthropic-messages";
}
/**
* pi-ai constructs the Anthropic API endpoint as `${baseUrl}/v1/messages`.
* If a user configures `baseUrl` with a trailing `/v1` (e.g. the previously
* recommended format "https://api.anthropic.com/v1"), the resulting URL
* becomes "…/v1/v1/messages" which the Anthropic API rejects with a 404.
*
* Strip a single trailing `/v1` (with optional trailing slash) from the
* baseUrl for anthropic-messages models so users with either format work.
*/
function normalizeAnthropicBaseUrl(baseUrl) {
	return baseUrl.replace(/\/v1\/?$/, "");
}
function normalizeModelCompat(model) {
	const baseUrl = model.baseUrl ?? "";
	if (isAnthropicMessagesModel(model) && baseUrl) {
		const normalised = normalizeAnthropicBaseUrl(baseUrl);
		if (normalised !== baseUrl) return {
			...model,
			baseUrl: normalised
		};
	}
	if (!isOpenAiCompletionsModel(model)) return model;
	const compat = model.compat ?? void 0;
	if (!(baseUrl ? !isOpenAINativeEndpoint(baseUrl) : false)) return model;
	const forcedDeveloperRole = compat?.supportsDeveloperRole === true;
	const hasStreamingUsageOverride = compat?.supportsUsageInStreaming !== void 0;
	const targetStrictMode = compat?.supportsStrictMode ?? false;
	if (compat?.supportsDeveloperRole !== void 0 && hasStreamingUsageOverride && compat?.supportsStrictMode !== void 0) return model;
	return {
		...model,
		compat: compat ? {
			...compat,
			supportsDeveloperRole: forcedDeveloperRole || false,
			...hasStreamingUsageOverride ? {} : { supportsUsageInStreaming: false },
			supportsStrictMode: targetStrictMode
		} : {
			supportsDeveloperRole: false,
			supportsUsageInStreaming: false,
			supportsStrictMode: false
		}
	};
}
//#endregion
//#region src/plugins/provider-model-helpers.ts
function matchesExactOrPrefix(id, values) {
	const normalizedId = id.trim().toLowerCase();
	return values.some((value) => {
		const normalizedValue = value.trim().toLowerCase();
		return normalizedId === normalizedValue || normalizedId.startsWith(normalizedValue);
	});
}
function cloneFirstTemplateModel(params) {
	const trimmedModelId = params.modelId.trim();
	for (const templateId of [...new Set(params.templateIds)].filter(Boolean)) {
		const template = params.ctx.modelRegistry.find(params.providerId, templateId);
		if (!template) continue;
		return normalizeModelCompat({
			...template,
			id: trimmedModelId,
			name: trimmedModelId,
			...params.patch
		});
	}
}
//#endregion
//#region src/plugins/provider-model-minimax.ts
const MINIMAX_DEFAULT_MODEL_ID = "MiniMax-M2.7";
const MINIMAX_DEFAULT_MODEL_REF = `minimax/${MINIMAX_DEFAULT_MODEL_ID}`;
const MINIMAX_TEXT_MODEL_ORDER = [
	"MiniMax-M2",
	"MiniMax-M2.1",
	"MiniMax-M2.1-highspeed",
	"MiniMax-M2.7",
	"MiniMax-M2.7-highspeed",
	"MiniMax-M2.5",
	"MiniMax-M2.5-highspeed"
];
const MINIMAX_TEXT_MODEL_CATALOG = {
	"MiniMax-M2": {
		name: "MiniMax M2",
		reasoning: true
	},
	"MiniMax-M2.1": {
		name: "MiniMax M2.1",
		reasoning: true
	},
	"MiniMax-M2.1-highspeed": {
		name: "MiniMax M2.1 Highspeed",
		reasoning: true
	},
	"MiniMax-M2.7": {
		name: "MiniMax M2.7",
		reasoning: true
	},
	"MiniMax-M2.7-highspeed": {
		name: "MiniMax M2.7 Highspeed",
		reasoning: true
	},
	"MiniMax-M2.5": {
		name: "MiniMax M2.5",
		reasoning: true
	},
	"MiniMax-M2.5-highspeed": {
		name: "MiniMax M2.5 Highspeed",
		reasoning: true
	}
};
const MINIMAX_TEXT_MODEL_REFS = MINIMAX_TEXT_MODEL_ORDER.map((modelId) => `minimax/${modelId}`);
const MINIMAX_MODERN_MODEL_MATCHERS = [
	"minimax-m2",
	"minimax-m2.1",
	"minimax-m2.5",
	"minimax-m2.7"
];
function isMiniMaxModernModelId(modelId) {
	return matchesExactOrPrefix(modelId, MINIMAX_MODERN_MODEL_MATCHERS);
}
//#endregion
export { KILOCODE_MODEL_CATALOG as C, KILOCODE_DEFAULT_MODEL_REF as S, KILOCODE_DEFAULT_CONTEXT_WINDOW as _, MINIMAX_TEXT_MODEL_REFS as a, KILOCODE_DEFAULT_MODEL_ID as b, matchesExactOrPrefix as c, applyXaiModelCompat as d, hasNativeWebSearchTool as f, KILOCODE_BASE_URL as g, usesXaiToolSchemaProfile as h, MINIMAX_TEXT_MODEL_ORDER as i, HTML_ENTITY_TOOL_CALL_ARGUMENTS_ENCODING as l, resolveToolCallArgumentsEncoding as m, MINIMAX_DEFAULT_MODEL_REF as n, isMiniMaxModernModelId as o, normalizeModelCompat as p, MINIMAX_TEXT_MODEL_CATALOG as r, cloneFirstTemplateModel as s, MINIMAX_DEFAULT_MODEL_ID as t, XAI_TOOL_SCHEMA_PROFILE as u, KILOCODE_DEFAULT_COST as v, KILOCODE_DEFAULT_MODEL_NAME as x, KILOCODE_DEFAULT_MAX_TOKENS as y };
