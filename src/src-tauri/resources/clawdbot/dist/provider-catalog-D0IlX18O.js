import { J as buildHuggingfaceModelDefinition, K as HUGGINGFACE_BASE_URL, Y as discoverHuggingfaceModels, q as HUGGINGFACE_MODEL_CATALOG } from "./provider-models-BKjzpTsb.js";
//#region extensions/huggingface/provider-catalog.ts
async function buildHuggingfaceProvider(discoveryApiKey) {
	const resolvedSecret = discoveryApiKey?.trim() ?? "";
	return {
		baseUrl: HUGGINGFACE_BASE_URL,
		api: "openai-completions",
		models: resolvedSecret !== "" ? await discoverHuggingfaceModels(resolvedSecret) : HUGGINGFACE_MODEL_CATALOG.map(buildHuggingfaceModelDefinition)
	};
}
//#endregion
export { buildHuggingfaceProvider as t };
