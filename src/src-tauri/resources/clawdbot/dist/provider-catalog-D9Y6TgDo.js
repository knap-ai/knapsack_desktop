import { s as buildMistralCatalogModels, t as MISTRAL_BASE_URL } from "./model-definitions-BLnbe7Dj.js";
//#region extensions/mistral/provider-catalog.ts
function buildMistralProvider() {
	return {
		baseUrl: MISTRAL_BASE_URL,
		api: "openai-completions",
		models: buildMistralCatalogModels()
	};
}
//#endregion
export { buildMistralProvider as t };
