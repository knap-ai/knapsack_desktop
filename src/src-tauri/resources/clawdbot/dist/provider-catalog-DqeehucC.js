import { n as ARCEE_MODEL_CATALOG, r as buildArceeModelDefinition, t as ARCEE_BASE_URL } from "./models-ZcNke8-X.js";
//#region extensions/arcee/provider-catalog.ts
const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1";
function normalizeBaseUrl(baseUrl) {
	return (baseUrl ?? "").trim().replace(/\/+$/, "");
}
function isArceeOpenRouterBaseUrl(baseUrl) {
	return normalizeBaseUrl(baseUrl) === OPENROUTER_BASE_URL;
}
function toArceeOpenRouterModelId(modelId) {
	const normalized = modelId.trim();
	if (!normalized || normalized.startsWith("arcee/")) return normalized;
	return `arcee/${normalized}`;
}
function buildArceeCatalogModels() {
	return ARCEE_MODEL_CATALOG.map(buildArceeModelDefinition);
}
function buildArceeOpenRouterCatalogModels() {
	return buildArceeCatalogModels().map((model) => ({
		...model,
		id: toArceeOpenRouterModelId(model.id)
	}));
}
function buildArceeProvider() {
	return {
		baseUrl: ARCEE_BASE_URL,
		api: "openai-completions",
		models: buildArceeCatalogModels()
	};
}
function buildArceeOpenRouterProvider() {
	return {
		baseUrl: OPENROUTER_BASE_URL,
		api: "openai-completions",
		models: buildArceeOpenRouterCatalogModels()
	};
}
//#endregion
export { buildArceeProvider as a, buildArceeOpenRouterProvider as i, buildArceeCatalogModels as n, isArceeOpenRouterBaseUrl as o, buildArceeOpenRouterCatalogModels as r, toArceeOpenRouterModelId as s, OPENROUTER_BASE_URL as t };
