import { F as SYNTHETIC_BASE_URL, L as SYNTHETIC_MODEL_CATALOG, R as buildSyntheticModelDefinition } from "./provider-models-BKjzpTsb.js";
//#region extensions/synthetic/provider-catalog.ts
function buildSyntheticProvider() {
	return {
		baseUrl: SYNTHETIC_BASE_URL,
		api: "anthropic-messages",
		models: SYNTHETIC_MODEL_CATALOG.map(buildSyntheticModelDefinition)
	};
}
//#endregion
export { buildSyntheticProvider as t };
