import { o as registerProviderStreamForModel, s as ensureCustomApiRegistered, t as createAnthropicVertexStreamFnForModel } from "./anthropic-vertex-stream-DeiIH5Mp.js";
import { getApiProvider } from "@mariozechner/pi-ai";
//#region src/agents/simple-completion-transport.ts
function resolveAnthropicVertexSimpleApi(baseUrl) {
	return `openclaw-anthropic-vertex-simple:${baseUrl?.trim() ? encodeURIComponent(baseUrl.trim()) : "default"}`;
}
function prepareModelForSimpleCompletion(params) {
	const { model, cfg } = params;
	if (!getApiProvider(model.api) && registerProviderStreamForModel({
		model,
		cfg
	})) return model;
	if (model.provider === "anthropic-vertex") {
		const api = resolveAnthropicVertexSimpleApi(model.baseUrl);
		ensureCustomApiRegistered(api, createAnthropicVertexStreamFnForModel(model));
		return {
			...model,
			api
		};
	}
	return model;
}
//#endregion
export { prepareModelForSimpleCompletion as t };
