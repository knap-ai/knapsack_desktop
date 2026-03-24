import { C as VENICE_DEFAULT_MODEL_REF, S as VENICE_BASE_URL, T as buildVeniceModelDefinition, w as VENICE_MODEL_CATALOG } from "./provider-models-BKjzpTsb.js";
import { d as createModelCatalogPresetAppliers } from "./provider-onboarding-config-AjQQP6EK.js";
//#region extensions/venice/onboard.ts
const venicePresetAppliers = createModelCatalogPresetAppliers({
	primaryModelRef: VENICE_DEFAULT_MODEL_REF,
	resolveParams: (_cfg) => ({
		providerId: "venice",
		api: "openai-completions",
		baseUrl: VENICE_BASE_URL,
		catalogModels: VENICE_MODEL_CATALOG.map(buildVeniceModelDefinition),
		aliases: [{
			modelRef: VENICE_DEFAULT_MODEL_REF,
			alias: "Kimi K2.5"
		}]
	})
});
function applyVeniceProviderConfig(cfg) {
	return venicePresetAppliers.applyProviderConfig(cfg);
}
function applyVeniceConfig(cfg) {
	return venicePresetAppliers.applyConfig(cfg);
}
//#endregion
export { applyVeniceProviderConfig as n, applyVeniceConfig as t };
