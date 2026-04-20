import { f as createDefaultModelsPresetAppliers } from "./provider-onboard-CghzCQ2p.js";
import { a as buildFireworksCatalogModels, i as FIREWORKS_DEFAULT_MODEL_ID, o as buildFireworksProvider } from "./provider-catalog-B4goqFBu.js";
//#region extensions/fireworks/onboard.ts
const FIREWORKS_DEFAULT_MODEL_REF = `fireworks/${FIREWORKS_DEFAULT_MODEL_ID}`;
const fireworksPresetAppliers = createDefaultModelsPresetAppliers({
	primaryModelRef: FIREWORKS_DEFAULT_MODEL_REF,
	resolveParams: (_cfg) => {
		const defaultProvider = buildFireworksProvider();
		return {
			providerId: "fireworks",
			api: defaultProvider.api ?? "openai-completions",
			baseUrl: defaultProvider.baseUrl,
			defaultModels: buildFireworksCatalogModels(),
			defaultModelId: FIREWORKS_DEFAULT_MODEL_ID,
			aliases: [{
				modelRef: FIREWORKS_DEFAULT_MODEL_REF,
				alias: "Kimi K2.5 Turbo"
			}]
		};
	}
});
function applyFireworksProviderConfig(cfg) {
	return fireworksPresetAppliers.applyProviderConfig(cfg);
}
function applyFireworksConfig(cfg) {
	return fireworksPresetAppliers.applyConfig(cfg);
}
//#endregion
export { applyFireworksConfig as n, applyFireworksProviderConfig as r, FIREWORKS_DEFAULT_MODEL_REF as t };
