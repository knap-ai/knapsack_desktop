import { r as normalizeProviderId } from "./provider-id-CTiEzT1T.js";
import { o as normalizeModelCompat, r as applyModelCompatPatch } from "./provider-model-shared-B0P3sbBu.js";
import { t as XAI_UNSUPPORTED_SCHEMA_KEYWORDS } from "./provider-tools-Cjq0r_cA.js";
import { f as resolveXaiCatalogEntry } from "./model-definitions-BZH0OzdF.js";
import "./provider-catalog-BK0ohwR_.js";
import "./onboard-CaJD-Ao-.js";
//#region extensions/xai/provider-models.ts
const XAI_MODERN_MODEL_PREFIXES = [
	"grok-3",
	"grok-4",
	"grok-code-fast"
];
function isModernXaiModel(modelId) {
	const lower = modelId.trim().toLowerCase();
	if (!lower || lower.includes("multi-agent")) return false;
	return XAI_MODERN_MODEL_PREFIXES.some((prefix) => lower.startsWith(prefix));
}
function resolveXaiForwardCompatModel(params) {
	const definition = resolveXaiCatalogEntry(params.ctx.modelId);
	if (!definition) return;
	return applyXaiModelCompat(normalizeModelCompat({
		id: definition.id,
		name: definition.name,
		api: params.ctx.providerConfig?.api ?? "openai-responses",
		provider: params.providerId,
		baseUrl: params.ctx.providerConfig?.baseUrl ?? "https://api.x.ai/v1",
		reasoning: definition.reasoning,
		input: definition.input,
		cost: definition.cost,
		contextWindow: definition.contextWindow,
		maxTokens: definition.maxTokens
	}));
}
//#endregion
//#region extensions/xai/api.ts
const XAI_TOOL_SCHEMA_PROFILE = "xai";
const HTML_ENTITY_TOOL_CALL_ARGUMENTS_ENCODING = "html-entities";
function resolveXaiModelCompatPatch() {
	return {
		toolSchemaProfile: "xai",
		unsupportedToolSchemaKeywords: Array.from(XAI_UNSUPPORTED_SCHEMA_KEYWORDS),
		nativeWebSearchTool: true,
		toolCallArgumentsEncoding: HTML_ENTITY_TOOL_CALL_ARGUMENTS_ENCODING
	};
}
function applyXaiModelCompat(model) {
	return applyModelCompatPatch(model, resolveXaiModelCompatPatch());
}
function isXaiBaseUrl(baseUrl) {
	if (typeof baseUrl !== "string" || !baseUrl.trim()) return false;
	try {
		return new URL(baseUrl).hostname.toLowerCase() === "api.x.ai";
	} catch {
		return baseUrl.toLowerCase().includes("api.x.ai");
	}
}
function isXaiModelHint(modelId) {
	return modelId.trim().toLowerCase().startsWith("x-ai/");
}
function shouldUseXaiResponsesTransport(params) {
	if (params.api !== "openai-completions") return false;
	if (isXaiBaseUrl(params.baseUrl)) return true;
	return normalizeProviderId(params.provider) === "xai" && !params.baseUrl;
}
function shouldContributeXaiCompat(params) {
	if (params.model.api !== "openai-completions") return false;
	return isXaiBaseUrl(params.model.baseUrl) || isXaiModelHint(params.modelId);
}
function resolveXaiTransport(params) {
	if (!shouldUseXaiResponsesTransport(params)) return;
	return {
		api: "openai-responses",
		baseUrl: typeof params.baseUrl === "string" ? params.baseUrl : void 0
	};
}
//#endregion
export { resolveXaiTransport as a, resolveXaiForwardCompatModel as c, resolveXaiModelCompatPatch as i, XAI_TOOL_SCHEMA_PROFILE as n, shouldContributeXaiCompat as o, applyXaiModelCompat as r, isModernXaiModel as s, HTML_ENTITY_TOOL_CALL_ARGUMENTS_ENCODING as t };
