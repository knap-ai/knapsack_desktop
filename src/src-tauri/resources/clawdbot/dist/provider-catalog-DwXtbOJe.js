import { n as CEREBRAS_MODEL_CATALOG, r as buildCerebrasModelDefinition, t as CEREBRAS_BASE_URL } from "./models-CuW4Epl0.js";
//#region extensions/cerebras/provider-catalog.ts
function buildCerebrasProvider() {
	return {
		baseUrl: CEREBRAS_BASE_URL,
		api: "openai-completions",
		models: CEREBRAS_MODEL_CATALOG.map(buildCerebrasModelDefinition)
	};
}
//#endregion
export { buildCerebrasProvider as t };
