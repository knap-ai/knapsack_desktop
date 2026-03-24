import { _ as BYTEPLUS_BASE_URL, b as BYTEPLUS_MODEL_CATALOG, v as BYTEPLUS_CODING_BASE_URL, x as buildBytePlusModelDefinition, y as BYTEPLUS_CODING_MODEL_CATALOG } from "./provider-models-BKjzpTsb.js";
//#region extensions/byteplus/provider-catalog.ts
function buildBytePlusProvider() {
	return {
		baseUrl: BYTEPLUS_BASE_URL,
		api: "openai-completions",
		models: BYTEPLUS_MODEL_CATALOG.map(buildBytePlusModelDefinition)
	};
}
function buildBytePlusCodingProvider() {
	return {
		baseUrl: BYTEPLUS_CODING_BASE_URL,
		api: "openai-completions",
		models: BYTEPLUS_CODING_MODEL_CATALOG.map(buildBytePlusModelDefinition)
	};
}
//#endregion
export { buildBytePlusProvider as n, buildBytePlusCodingProvider as t };
