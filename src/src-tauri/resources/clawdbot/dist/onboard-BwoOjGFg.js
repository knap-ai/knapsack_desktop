import { p as createModelCatalogPresetAppliers } from "./provider-onboard-CghzCQ2p.js";
import { t as ARCEE_BASE_URL } from "./models-ZcNke8-X.js";
import { n as buildArceeCatalogModels, r as buildArceeOpenRouterCatalogModels, t as OPENROUTER_BASE_URL } from "./provider-catalog-DqeehucC.js";
//#region extensions/arcee/onboard.ts
const ARCEE_DEFAULT_MODEL_REF = "arcee/trinity-large-thinking";
const ARCEE_OPENROUTER_DEFAULT_MODEL_REF = "arcee/trinity-large-thinking";
const arceePresetAppliers = createModelCatalogPresetAppliers({
	primaryModelRef: ARCEE_DEFAULT_MODEL_REF,
	resolveParams: (_cfg) => ({
		providerId: "arcee",
		api: "openai-completions",
		baseUrl: ARCEE_BASE_URL,
		catalogModels: buildArceeCatalogModels(),
		aliases: [{
			modelRef: ARCEE_DEFAULT_MODEL_REF,
			alias: "Arcee AI"
		}]
	})
});
const arceeOpenRouterPresetAppliers = createModelCatalogPresetAppliers({
	primaryModelRef: ARCEE_OPENROUTER_DEFAULT_MODEL_REF,
	resolveParams: (_cfg) => ({
		providerId: "arcee",
		api: "openai-completions",
		baseUrl: OPENROUTER_BASE_URL,
		catalogModels: buildArceeOpenRouterCatalogModels(),
		aliases: [{
			modelRef: ARCEE_OPENROUTER_DEFAULT_MODEL_REF,
			alias: "Arcee AI (OpenRouter)"
		}]
	})
});
function applyArceeProviderConfig(cfg) {
	return arceePresetAppliers.applyProviderConfig(cfg);
}
function applyArceeConfig(cfg) {
	return arceePresetAppliers.applyConfig(cfg);
}
function applyArceeOpenRouterConfig(cfg) {
	return arceeOpenRouterPresetAppliers.applyConfig(cfg);
}
//#endregion
export { applyArceeProviderConfig as a, applyArceeOpenRouterConfig as i, ARCEE_OPENROUTER_DEFAULT_MODEL_REF as n, applyArceeConfig as r, ARCEE_DEFAULT_MODEL_REF as t };
