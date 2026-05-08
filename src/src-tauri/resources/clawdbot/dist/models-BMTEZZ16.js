import { r as discoverOpenAICompatibleLocalModels } from "./provider-self-hosted-setup-C17w8z3a.js";
import "./provider-setup-35TPpZBn.js";
import { i as SGLANG_PROVIDER_LABEL } from "./defaults-DasxD1la.js";
//#region extensions/sglang/models.ts
async function buildSglangProvider(params) {
	const baseUrl = (params?.baseUrl?.trim() || "http://127.0.0.1:30000/v1").replace(/\/+$/, "");
	return {
		baseUrl,
		api: "openai-completions",
		models: await discoverOpenAICompatibleLocalModels({
			baseUrl,
			apiKey: params?.apiKey,
			label: SGLANG_PROVIDER_LABEL
		})
	};
}
//#endregion
export { buildSglangProvider as t };
