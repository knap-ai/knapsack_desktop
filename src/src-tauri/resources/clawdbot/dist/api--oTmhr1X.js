import { f as readStringValue } from "./string-coerce-Bje8XVt9.js";
import { r as normalizeProviderId } from "./provider-id-DRW5WMbW.js";
import "./provider-tools-CjZl3FJf.js";
import { o as getModelProviderHint } from "./provider-model-shared-Bqo51Ufw.js";
import "./text-runtime-DfALcXL5.js";
import "./model-definitions-CEROa3L0.js";
import "./provider-catalog-C270A2u1.js";
import "./onboard-DgANjVrE.js";
import "./image-generation-provider-BajpFpDV.js";
import "./provider-models-T4kyAooa.js";
//#region extensions/xai/api.ts
const XAI_NATIVE_ENDPOINT_HOSTS = new Set(["api.x.ai", "api.grok.x.ai"]);
function resolveHostname(value) {
	try {
		return new URL(value).hostname.toLowerCase();
	} catch {
		return;
	}
}
function isXaiNativeEndpoint(baseUrl) {
	return typeof baseUrl === "string" && XAI_NATIVE_ENDPOINT_HOSTS.has(resolveHostname(baseUrl) ?? "");
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
function resolveXaiBaseUrl(baseUrlOrConfig) {
	let candidate = baseUrlOrConfig;
	if (baseUrlOrConfig && typeof baseUrlOrConfig === "object" && !Array.isArray(baseUrlOrConfig) && "cfg" in baseUrlOrConfig) candidate = baseUrlOrConfig.cfg?.models?.providers?.xai?.baseUrl ?? baseUrlOrConfig;
	return readStringValue(candidate) || "https://api.x.ai/v1";
}
//#endregion
export { shouldContributeXaiCompat as i, resolveXaiBaseUrl as n, resolveXaiTransport as r, isXaiModelHint as t };
