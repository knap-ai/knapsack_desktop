import { parseGoogleOauthApiKey } from "./oauth-token-shared.js";
import { normalizeAntigravityModelId, normalizeGoogleModelId } from "./model-id.js";
import { DEFAULT_GOOGLE_API_BASE_URL, isGoogleGenerativeAiApi, normalizeGoogleApiBaseUrl, normalizeGoogleGenerativeAiBaseUrl, normalizeGoogleProviderConfig, resolveGoogleGenerativeAiApiOrigin, resolveGoogleGenerativeAiTransport, shouldNormalizeGoogleGenerativeAiProviderConfig, shouldNormalizeGoogleProviderConfig } from "./provider-policy.js";
import { resolveProviderHttpRequestConfig } from "openclaw/plugin-sdk/provider-http";
import { applyAgentDefaultModelPrimary } from "openclaw/plugin-sdk/provider-onboard";
//#region extensions/google/api.ts
function parseGeminiAuth(apiKey) {
	const parsed = apiKey.startsWith("{") ? parseGoogleOauthApiKey(apiKey) : null;
	if (parsed?.token) return { headers: {
		Authorization: `Bearer ${parsed.token}`,
		"Content-Type": "application/json"
	} };
	return { headers: {
		"x-goog-api-key": apiKey,
		"Content-Type": "application/json"
	} };
}
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
		allowPrivateNetwork: false,
		headers: params.headers,
		request: params.request,
		defaultHeaders: parseGeminiAuth(params.apiKey).headers,
		provider: "google",
		api: "google-generative-ai",
		capability: params.capability,
		transport: params.transport
	});
}
const GOOGLE_GEMINI_DEFAULT_MODEL = "google/gemini-3.1-pro-preview";
function applyGoogleGeminiModelDefault(cfg) {
	const current = cfg.agents?.defaults?.model;
	if ((typeof current === "string" ? current.trim() || void 0 : current && typeof current === "object" && typeof current.primary === "string" ? (current.primary || "").trim() || void 0 : void 0) === "google/gemini-3.1-pro-preview") return {
		next: cfg,
		changed: false
	};
	return {
		next: applyAgentDefaultModelPrimary(cfg, GOOGLE_GEMINI_DEFAULT_MODEL),
		changed: true
	};
}
//#endregion
export { DEFAULT_GOOGLE_API_BASE_URL, GOOGLE_GEMINI_DEFAULT_MODEL, applyGoogleGeminiModelDefault, isGoogleGenerativeAiApi, normalizeAntigravityModelId, normalizeGoogleApiBaseUrl, normalizeGoogleGenerativeAiBaseUrl, normalizeGoogleModelId, normalizeGoogleProviderConfig, parseGeminiAuth, resolveGoogleGenerativeAiApiOrigin, resolveGoogleGenerativeAiHttpRequestConfig, resolveGoogleGenerativeAiTransport, shouldNormalizeGoogleGenerativeAiProviderConfig, shouldNormalizeGoogleProviderConfig };
