import { J as buildHuggingfaceModelDefinition, K as HUGGINGFACE_BASE_URL, q as HUGGINGFACE_MODEL_CATALOG } from "./provider-models-BKjzpTsb.js";
import { d as createModelCatalogPresetAppliers } from "./provider-onboarding-config-AjQQP6EK.js";
//#region extensions/huggingface/onboard.ts
const HUGGINGFACE_DEFAULT_MODEL_REF = "huggingface/deepseek-ai/DeepSeek-R1";
const huggingfacePresetAppliers = createModelCatalogPresetAppliers({
	primaryModelRef: HUGGINGFACE_DEFAULT_MODEL_REF,
	resolveParams: (_cfg) => ({
		providerId: "huggingface",
		api: "openai-completions",
		baseUrl: HUGGINGFACE_BASE_URL,
		catalogModels: HUGGINGFACE_MODEL_CATALOG.map(buildHuggingfaceModelDefinition),
		aliases: [{
			modelRef: HUGGINGFACE_DEFAULT_MODEL_REF,
			alias: "Hugging Face"
		}]
	})
});
function applyHuggingfaceProviderConfig(cfg) {
	return huggingfacePresetAppliers.applyProviderConfig(cfg);
}
function applyHuggingfaceConfig(cfg) {
	return huggingfacePresetAppliers.applyConfig(cfg);
}
//#endregion
export { applyHuggingfaceConfig as n, applyHuggingfaceProviderConfig as r, HUGGINGFACE_DEFAULT_MODEL_REF as t };
