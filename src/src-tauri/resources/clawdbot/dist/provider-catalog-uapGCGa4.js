import { M as DEEPSEEK_BASE_URL, N as DEEPSEEK_MODEL_CATALOG, P as buildDeepSeekModelDefinition } from "./provider-models-BKjzpTsb.js";
//#region extensions/deepseek/provider-catalog.ts
function buildDeepSeekProvider() {
	return {
		baseUrl: DEEPSEEK_BASE_URL,
		api: "openai-completions",
		models: DEEPSEEK_MODEL_CATALOG.map(buildDeepSeekModelDefinition)
	};
}
//#endregion
export { buildDeepSeekProvider as t };
