import { r as applyModelCompatPatch } from "../../provider-model-shared-B0P3sbBu.js";
import { t as XAI_UNSUPPORTED_SCHEMA_KEYWORDS } from "../../provider-tools-Cjq0r_cA.js";
import { t as defineSingleProviderPluginEntry } from "../../provider-entry-BnIQWKLx.js";
import { i as VENICE_DEFAULT_MODEL_REF } from "../../models-D2L2Be-9.js";
import { t as buildVeniceProvider } from "../../api-Cjsj1oLk.js";
import { t as applyVeniceConfig } from "../../onboard-_86VkqTZ.js";
//#region extensions/venice/index.ts
const PROVIDER_ID = "venice";
const XAI_TOOL_SCHEMA_PROFILE = "xai";
const HTML_ENTITY_TOOL_CALL_ARGUMENTS_ENCODING = "html-entities";
function isXaiBackedVeniceModel(modelId) {
	return modelId.trim().toLowerCase().includes("grok");
}
function resolveXaiCompatPatch() {
	return {
		toolSchemaProfile: XAI_TOOL_SCHEMA_PROFILE,
		unsupportedToolSchemaKeywords: Array.from(XAI_UNSUPPORTED_SCHEMA_KEYWORDS),
		nativeWebSearchTool: true,
		toolCallArgumentsEncoding: HTML_ENTITY_TOOL_CALL_ARGUMENTS_ENCODING
	};
}
function applyXaiCompat(model) {
	return applyModelCompatPatch(model, resolveXaiCompatPatch());
}
var venice_default = defineSingleProviderPluginEntry({
	id: PROVIDER_ID,
	name: "Venice Provider",
	description: "Bundled Venice provider plugin",
	provider: {
		label: "Venice",
		docsPath: "/providers/venice",
		auth: [{
			methodId: "api-key",
			label: "Venice AI API key",
			hint: "Privacy-focused (uncensored models)",
			optionKey: "veniceApiKey",
			flagName: "--venice-api-key",
			envVar: "VENICE_API_KEY",
			promptMessage: "Enter Venice AI API key",
			defaultModel: VENICE_DEFAULT_MODEL_REF,
			applyConfig: (cfg) => applyVeniceConfig(cfg),
			noteMessage: [
				"Venice AI provides privacy-focused inference with uncensored models.",
				"Get your API key at: https://venice.ai/settings/api",
				"Supports 'private' (fully private) and 'anonymized' (proxy) modes."
			].join("\n"),
			noteTitle: "Venice AI",
			wizard: { groupLabel: "Venice AI" }
		}],
		catalog: { buildProvider: buildVeniceProvider },
		normalizeResolvedModel: ({ modelId, model }) => isXaiBackedVeniceModel(modelId) ? applyXaiCompat(model) : void 0
	}
});
//#endregion
export { venice_default as default };
