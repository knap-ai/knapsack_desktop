import { d as readStringValue } from "./string-coerce-BUSzWgUA.js";
import { r as normalizeProviderId } from "./provider-id-KaStHhRz.js";
import { n as resolveProviderEndpoint } from "./provider-attribution-BJhkfmfB.js";
import "./provider-tools-Z_yR2St8.js";
import { o as getModelProviderHint } from "./provider-model-shared-DyDnBaDe.js";
import "./text-runtime-DTMxvodz.js";
import "./model-definitions-ASgg9Ved.js";
import "./provider-catalog-CAjZQu79.js";
import "./onboard-MTq3iaV4.js";
import "./provider-models-DBZIiLTe.js";
//#region extensions/xai/api.ts
function isXaiNativeEndpoint(baseUrl) {
	return typeof baseUrl === "string" && resolveProviderEndpoint(baseUrl).endpointClass === "xai-native";
}
function isXaiModelHint(modelId) {
	return getModelProviderHint(modelId) === "x-ai";
}
function shouldUseXaiResponsesTransport(params) {
	if (params.api !== "openai-completions") return false;
	if (isXaiNativeEndpoint(params.baseUrl)) return true;
	return normalizeProviderId(params.provider) === "xai" && !params.baseUrl;
}
function shouldContributeXaiCompat(params) {
	if (params.model.api !== "openai-completions") return false;
	return isXaiNativeEndpoint(params.model.baseUrl) || isXaiModelHint(params.modelId);
}
function resolveXaiTransport(params) {
	if (!shouldUseXaiResponsesTransport(params)) return;
	return {
		api: "openai-responses",
		baseUrl: readStringValue(params.baseUrl)
	};
}
//#endregion
export { resolveXaiTransport as n, shouldContributeXaiCompat as r, isXaiModelHint as t };
