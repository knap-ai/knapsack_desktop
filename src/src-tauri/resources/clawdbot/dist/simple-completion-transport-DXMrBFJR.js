import { withDesktopPrivacy } from "./knapsack-privacy-policy.js";
import { a as ensureCustomApiRegistered, i as prepareTransportAwareSimpleModel, n as buildTransportAwareSimpleStreamFn, t as registerProviderStreamForModel } from "./provider-stream-qFQv-LxD.js";
import { t as createAnthropicVertexStreamFnForModel } from "./anthropic-vertex-stream-Cs6RnR5d.js";
import { getApiProvider, getEnvApiKey } from "@earendil-works/pi-ai";
//#region src/agents/simple-completion-transport.ts
function resolveAnthropicVertexSimpleApi(baseUrl) {
	return `openclaw-anthropic-vertex-simple:${baseUrl?.trim() ? encodeURIComponent(baseUrl.trim()) : "default"}`;
}
function prepareModelForSimpleCompletion(params) {
  const model = prepareModelForSimpleCompletionUnchecked(params);
  const provider = getApiProvider(model.api);
  if (!provider) throw new Error("No inference transport available");
  const api = `knapsack-private:${model.api}`;
  ensureCustomApiRegistered(api, withDesktopPrivacy((guardedModel, context, options) => provider.streamSimple({ ...guardedModel, api: model.api }, context, options), getEnvApiKey));
  return { ...model, api };
}
function prepareModelForSimpleCompletionUnchecked(params) {
	const { model, cfg } = params;
	if (!getApiProvider(model.api) && registerProviderStreamForModel({
		model,
		cfg
	})) return model;
	const transportAwareModel = prepareTransportAwareSimpleModel(model, { cfg });
	if (transportAwareModel !== model) {
		const streamFn = buildTransportAwareSimpleStreamFn(model, { cfg });
		if (streamFn) {
			ensureCustomApiRegistered(transportAwareModel.api, streamFn);
			return transportAwareModel;
		}
	}
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
