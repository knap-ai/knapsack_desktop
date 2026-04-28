import { f as buildXaiCatalogModels, t as XAI_BASE_URL } from "./model-definitions-CEROa3L0.js";
//#region extensions/xai/provider-catalog.ts
function buildXaiProvider(api = "openai-responses") {
	return {
		baseUrl: XAI_BASE_URL,
		api,
		models: buildXaiCatalogModels()
	};
}
//#endregion
export { buildXaiProvider as t };
