import { A as TOGETHER_MODEL_CATALOG, j as buildTogetherModelDefinition, k as TOGETHER_BASE_URL } from "./provider-models-BKjzpTsb.js";
//#region extensions/together/provider-catalog.ts
function buildTogetherProvider() {
	return {
		baseUrl: TOGETHER_BASE_URL,
		api: "openai-completions",
		models: TOGETHER_MODEL_CATALOG.map(buildTogetherModelDefinition)
	};
}
//#endregion
export { buildTogetherProvider as t };
