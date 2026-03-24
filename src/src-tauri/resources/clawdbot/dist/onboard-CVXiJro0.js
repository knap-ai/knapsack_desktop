import { F as SYNTHETIC_BASE_URL, I as SYNTHETIC_DEFAULT_MODEL_REF, L as SYNTHETIC_MODEL_CATALOG, R as buildSyntheticModelDefinition } from "./provider-models-BKjzpTsb.js";
import { d as createModelCatalogPresetAppliers } from "./provider-onboarding-config-AjQQP6EK.js";
//#region extensions/synthetic/onboard.ts
const syntheticPresetAppliers = createModelCatalogPresetAppliers({
	primaryModelRef: SYNTHETIC_DEFAULT_MODEL_REF,
	resolveParams: (_cfg) => ({
		providerId: "synthetic",
		api: "anthropic-messages",
		baseUrl: SYNTHETIC_BASE_URL,
		catalogModels: SYNTHETIC_MODEL_CATALOG.map(buildSyntheticModelDefinition),
		aliases: [{
			modelRef: SYNTHETIC_DEFAULT_MODEL_REF,
			alias: "MiniMax M2.5"
		}]
	})
});
function applySyntheticProviderConfig(cfg) {
	return syntheticPresetAppliers.applyProviderConfig(cfg);
}
function applySyntheticConfig(cfg) {
	return syntheticPresetAppliers.applyConfig(cfg);
}
//#endregion
export { applySyntheticProviderConfig as n, applySyntheticConfig as t };
