import { s as normalizeOptionalLowercaseString } from "./string-coerce-C1IzJjqi.js";
import { a as normalizeModelCompat } from "./provider-model-compat-C_Djlg3U.js";
import { i as applyXaiModelCompat } from "./provider-tools-VpDDhpdz.js";
import "./provider-model-shared-D-iKoymz.js";
import "./text-runtime-B1c54bxG.js";
import { m as resolveXaiCatalogEntry } from "./model-definitions-B7RBP-PE.js";
//#region extensions/xai/provider-models.ts
const XAI_MODERN_MODEL_PREFIXES = [
	"grok-3",
	"grok-4",
	"grok-code-fast"
];
function isModernXaiModel(modelId) {
	const lower = normalizeOptionalLowercaseString(modelId) ?? "";
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
export { resolveXaiForwardCompatModel as n, isModernXaiModel as t };
