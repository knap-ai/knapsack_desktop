import { A as TOGETHER_MODEL_CATALOG, j as buildTogetherModelDefinition, k as TOGETHER_BASE_URL } from "./provider-models-BKjzpTsb.js";
import { d as createModelCatalogPresetAppliers } from "./provider-onboarding-config-AjQQP6EK.js";
//#region extensions/together/onboard.ts
const TOGETHER_DEFAULT_MODEL_REF = "together/moonshotai/Kimi-K2.5";
const togetherPresetAppliers = createModelCatalogPresetAppliers({
	primaryModelRef: TOGETHER_DEFAULT_MODEL_REF,
	resolveParams: (_cfg) => ({
		providerId: "together",
		api: "openai-completions",
		baseUrl: TOGETHER_BASE_URL,
		catalogModels: TOGETHER_MODEL_CATALOG.map(buildTogetherModelDefinition),
		aliases: [{
			modelRef: TOGETHER_DEFAULT_MODEL_REF,
			alias: "Together AI"
		}]
	})
});
function applyTogetherProviderConfig(cfg) {
	return togetherPresetAppliers.applyProviderConfig(cfg);
}
function applyTogetherConfig(cfg) {
	return togetherPresetAppliers.applyConfig(cfg);
}
//#endregion
export { applyTogetherConfig as n, applyTogetherProviderConfig as r, TOGETHER_DEFAULT_MODEL_REF as t };
