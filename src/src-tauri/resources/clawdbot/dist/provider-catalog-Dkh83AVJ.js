import { n as TOGETHER_MODEL_CATALOG, r as buildTogetherModelDefinition, t as TOGETHER_BASE_URL } from "./models-CiBl9LB1.js";
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
