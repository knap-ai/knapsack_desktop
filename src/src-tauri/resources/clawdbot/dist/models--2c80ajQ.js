import { r as discoverOpenAICompatibleLocalModels } from "./provider-self-hosted-setup-7ndHtLKG.js";
import "./provider-setup-CeDi3hga.js";
import { i as VLLM_PROVIDER_LABEL } from "./defaults-C5Eyo4Jx.js";
//#region extensions/vllm/models.ts
async function buildVllmProvider(params) {
	const baseUrl = (params?.baseUrl?.trim() || "http://127.0.0.1:8000/v1").replace(/\/+$/, "");
	return {
		baseUrl,
		api: "openai-completions",
		models: await discoverOpenAICompatibleLocalModels({
			baseUrl,
			apiKey: params?.apiKey,
			label: VLLM_PROVIDER_LABEL
		})
	};
}
//#endregion
export { buildVllmProvider as t };
