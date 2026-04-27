import { createGoogleThinkingPayloadWrapper, createGoogleThinkingStreamWrapper, isGoogleGemini3FlashModel, isGoogleGemini3ProModel, isGoogleGemini3ThinkingLevelModel, isGoogleThinkingRequiredModel, resolveGoogleGemini3ThinkingLevel, sanitizeGoogleThinkingPayload, stripInvalidGoogleThinkingBudget } from "./thinking.js";
import "./thinking-api.js";
import { buildGoogleGeminiCliProvider } from "./gemini-cli-provider.js";
import { normalizeAntigravityModelId, normalizeGoogleModelId } from "./model-id.js";
import { GOOGLE_GEMINI_DEFAULT_MODEL, applyGoogleGeminiModelDefault } from "./onboard.js";
import { DEFAULT_GOOGLE_API_BASE_URL, isGoogleGenerativeAiApi, normalizeGoogleApiBaseUrl, normalizeGoogleGenerativeAiBaseUrl, normalizeGoogleProviderConfig, resolveGoogleGenerativeAiApiOrigin, resolveGoogleGenerativeAiTransport, shouldNormalizeGoogleGenerativeAiProviderConfig, shouldNormalizeGoogleProviderConfig } from "./provider-policy.js";
import { parseGeminiAuth } from "./gemini-auth.js";
import { buildGoogleGenerativeAiParams, createGoogleGenerativeAiTransportStreamFn } from "./transport-stream.js";
import { buildGoogleProvider } from "./provider-registration.js";
import { resolveProviderHttpRequestConfig } from "openclaw/plugin-sdk/provider-http";
//#region extensions/google/api.ts
function resolveTrustedGoogleGenerativeAiBaseUrl(baseUrl) {
	const normalized = normalizeGoogleGenerativeAiBaseUrl(baseUrl ?? "https://generativelanguage.googleapis.com/v1beta") ?? "https://generativelanguage.googleapis.com/v1beta";
	let url;
	try {
		url = new URL(normalized);
	} catch {
		throw new Error("Google Generative AI baseUrl must be a valid https URL on generativelanguage.googleapis.com");
	}
	if (url.protocol !== "https:" || url.hostname.toLowerCase() !== "generativelanguage.googleapis.com") throw new Error("Google Generative AI baseUrl must use https://generativelanguage.googleapis.com");
	return normalized;
}
function resolveGoogleGenerativeAiHttpRequestConfig(params) {
	return resolveProviderHttpRequestConfig({
		baseUrl: resolveTrustedGoogleGenerativeAiBaseUrl(params.baseUrl),
		defaultBaseUrl: DEFAULT_GOOGLE_API_BASE_URL,
		allowPrivateNetwork: params.request?.allowPrivateNetwork,
		headers: params.headers,
		request: params.request,
		defaultHeaders: parseGeminiAuth(params.apiKey).headers,
		provider: "google",
		api: "google-generative-ai",
		capability: params.capability,
		transport: params.transport
	});
}
//#endregion
export { DEFAULT_GOOGLE_API_BASE_URL, GOOGLE_GEMINI_DEFAULT_MODEL, applyGoogleGeminiModelDefault, buildGoogleGeminiCliProvider, buildGoogleGenerativeAiParams, buildGoogleProvider, createGoogleGenerativeAiTransportStreamFn, createGoogleThinkingPayloadWrapper, createGoogleThinkingStreamWrapper, isGoogleGemini3FlashModel, isGoogleGemini3ProModel, isGoogleGemini3ThinkingLevelModel, isGoogleGenerativeAiApi, isGoogleThinkingRequiredModel, normalizeAntigravityModelId, normalizeGoogleApiBaseUrl, normalizeGoogleGenerativeAiBaseUrl, normalizeGoogleModelId, normalizeGoogleProviderConfig, parseGeminiAuth, resolveGoogleGemini3ThinkingLevel, resolveGoogleGenerativeAiApiOrigin, resolveGoogleGenerativeAiHttpRequestConfig, resolveGoogleGenerativeAiTransport, sanitizeGoogleThinkingPayload, shouldNormalizeGoogleGenerativeAiProviderConfig, shouldNormalizeGoogleProviderConfig, stripInvalidGoogleThinkingBudget };
