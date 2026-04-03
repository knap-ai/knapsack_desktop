import { t as XAI_BASE_URL, u as buildXaiCatalogModels } from "./model-definitions-BZH0OzdF.js";
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
