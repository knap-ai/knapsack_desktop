import { f as DOUBAO_BASE_URL, g as buildDoubaoModelDefinition, h as DOUBAO_MODEL_CATALOG, m as DOUBAO_CODING_MODEL_CATALOG, p as DOUBAO_CODING_BASE_URL } from "./provider-models-BKjzpTsb.js";
//#region extensions/volcengine/provider-catalog.ts
function buildDoubaoProvider() {
	return {
		baseUrl: DOUBAO_BASE_URL,
		api: "openai-completions",
		models: DOUBAO_MODEL_CATALOG.map(buildDoubaoModelDefinition)
	};
}
function buildDoubaoCodingProvider() {
	return {
		baseUrl: DOUBAO_CODING_BASE_URL,
		api: "openai-completions",
		models: DOUBAO_CODING_MODEL_CATALOG.map(buildDoubaoModelDefinition)
	};
}
//#endregion
export { buildDoubaoProvider as n, buildDoubaoCodingProvider as t };
