import { p as createModelCatalogPresetAppliers } from "./provider-onboard-DXwevr7q.js";
import { a as VENICE_MODEL_CATALOG, i as VENICE_DEFAULT_MODEL_REF, o as buildVeniceModelDefinition, t as VENICE_BASE_URL } from "./models-ntl9WtnV.js";
import "./api-CAvbKJaK.js";
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
