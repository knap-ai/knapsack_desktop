import { i as normalizeProviderIdForAuth } from "./provider-id-Cjha-r0T.js";
import { t as getShellEnvAppliedKeys } from "./shell-env-BOu7XeT_.js";
import { t as normalizeOptionalSecretInput } from "./normalize-secret-input-BsX1agd_.js";
import { r as listKnownProviderAuthEnvVarNames, t as PROVIDER_AUTH_ENV_VAR_CANDIDATES } from "./provider-env-vars-CpUJqT5v.js";
import { t as hasAnthropicVertexAvailableAuth } from "./anthropic-vertex-provider-B2x4YywE.js";
import { t as resolveSecretInputModeForEnvSelection } from "./provider-auth-mode-DkhMmaR7.js";
import { n as promptSecretRefForSetup, r as resolveRefFallbackInput, t as extractEnvVarFromSourceLabel } from "./provider-auth-ref-CQEp9sp3.js";
import { getEnvApiKey } from "@mariozechner/pi-ai";
//#region src/agents/model-auth-env-vars.ts
const PROVIDER_ENV_API_KEY_CANDIDATES = PROVIDER_AUTH_ENV_VAR_CANDIDATES;
function listKnownProviderEnvApiKeyNames() {
	return listKnownProviderAuthEnvVarNames();
}
//#endregion
//#region src/agents/model-auth-markers.ts
const MINIMAX_OAUTH_MARKER = "minimax-oauth";
const OAUTH_API_KEY_MARKER_PREFIX = "oauth:";
const QWEN_OAUTH_MARKER = "qwen-oauth";
const OLLAMA_LOCAL_AUTH_MARKER = "ollama-local";
const CUSTOM_LOCAL_AUTH_MARKER = "custom-local";
const GCP_VERTEX_CREDENTIALS_MARKER = "gcp-vertex-credentials";
const NON_ENV_SECRETREF_MARKER = "secretref-managed";
const SECRETREF_ENV_HEADER_MARKER_PREFIX = "secretref-env:";
const AWS_SDK_ENV_MARKERS = new Set([
	"AWS_BEARER_TOKEN_BEDROCK",
	"AWS_ACCESS_KEY_ID",
	"AWS_PROFILE"
]);
const LEGACY_ENV_API_KEY_MARKERS = [
	"GOOGLE_API_KEY",
	"DEEPSEEK_API_KEY",
	"PERPLEXITY_API_KEY",
	"FIREWORKS_API_KEY",
	"NOVITA_API_KEY",
	"AZURE_OPENAI_API_KEY",
	"AZURE_API_KEY",
	"MINIMAX_CODE_PLAN_KEY"
];
const KNOWN_ENV_API_KEY_MARKERS = new Set([
	...listKnownProviderEnvApiKeyNames(),
	...LEGACY_ENV_API_KEY_MARKERS,
	...AWS_SDK_ENV_MARKERS
]);
function isAwsSdkAuthMarker(value) {
	return AWS_SDK_ENV_MARKERS.has(value.trim());
}
function isKnownEnvApiKeyMarker(value) {
	const trimmed = value.trim();
	return KNOWN_ENV_API_KEY_MARKERS.has(trimmed) && !isAwsSdkAuthMarker(trimmed);
}
function resolveOAuthApiKeyMarker(providerId) {
	return `${OAUTH_API_KEY_MARKER_PREFIX}${providerId.trim()}`;
}
function isOAuthApiKeyMarker(value) {
	return value.trim().startsWith(OAUTH_API_KEY_MARKER_PREFIX);
}
function resolveNonEnvSecretRefApiKeyMarker(_source) {
	return NON_ENV_SECRETREF_MARKER;
}
function resolveNonEnvSecretRefHeaderValueMarker(_source) {
	return NON_ENV_SECRETREF_MARKER;
}
function resolveEnvSecretRefHeaderValueMarker(envVarName) {
	return `${SECRETREF_ENV_HEADER_MARKER_PREFIX}${envVarName.trim()}`;
}
function isSecretRefHeaderValueMarker(value) {
	const trimmed = value.trim();
	return trimmed === "secretref-managed" || trimmed.startsWith("secretref-env:");
}
function isNonSecretApiKeyMarker(value, opts) {
	const trimmed = value.trim();
	if (!trimmed) return false;
	if (trimmed === "minimax-oauth" || trimmed === "qwen-oauth" || isOAuthApiKeyMarker(trimmed) || trimmed === "ollama-local" || trimmed === "custom-local" || trimmed === "gcp-vertex-credentials" || trimmed === "secretref-managed" || isAwsSdkAuthMarker(trimmed)) return true;
	if (opts?.includeEnvVarName === false) return false;
	return KNOWN_ENV_API_KEY_MARKERS.has(trimmed);
}
//#endregion
//#region src/agents/model-auth-env.ts
function resolveEnvApiKey(provider, env = process.env) {
	const normalized = normalizeProviderIdForAuth(provider);
	const applied = new Set(getShellEnvAppliedKeys());
	const pick = (envVar) => {
		const value = normalizeOptionalSecretInput(env[envVar]);
		if (!value) return null;
		return {
			apiKey: value,
			source: applied.has(envVar) ? `shell env: ${envVar}` : `env: ${envVar}`
		};
	};
	const candidates = PROVIDER_ENV_API_KEY_CANDIDATES[normalized];
	if (candidates) for (const envVar of candidates) {
		const resolved = pick(envVar);
		if (resolved) return resolved;
	}
	if (normalized === "google-vertex") {
		const envKey = getEnvApiKey(normalized);
		if (!envKey) return null;
		return {
			apiKey: envKey,
			source: "gcloud adc"
		};
	}
	if (normalized === "anthropic-vertex") {
		if (hasAnthropicVertexAvailableAuth(env)) return {
			apiKey: GCP_VERTEX_CREDENTIALS_MARKER,
			source: "gcloud adc"
		};
		return null;
	}
	return null;
}
//#endregion
//#region src/plugins/provider-auth-input.ts
const DEFAULT_KEY_PREVIEW = {
	head: 4,
	tail: 4
};
function normalizeApiKeyInput(raw) {
	const trimmed = String(raw ?? "").trim();
	if (!trimmed) return "";
	const assignmentMatch = trimmed.match(/^(?:export\s+)?[A-Za-z_][A-Za-z0-9_]*\s*=\s*(.+)$/);
	const valuePart = assignmentMatch ? assignmentMatch[1].trim() : trimmed;
	const unquoted = valuePart.length >= 2 && (valuePart.startsWith("\"") && valuePart.endsWith("\"") || valuePart.startsWith("'") && valuePart.endsWith("'") || valuePart.startsWith("`") && valuePart.endsWith("`")) ? valuePart.slice(1, -1) : valuePart;
	return (unquoted.endsWith(";") ? unquoted.slice(0, -1) : unquoted).trim();
}
const validateApiKeyInput = (value) => normalizeApiKeyInput(value).length > 0 ? void 0 : "Required";
function formatApiKeyPreview(raw, opts = {}) {
	const trimmed = raw.trim();
	if (!trimmed) return "…";
	const head = opts.head ?? DEFAULT_KEY_PREVIEW.head;
	const tail = opts.tail ?? DEFAULT_KEY_PREVIEW.tail;
	if (trimmed.length <= head + tail) {
		const shortHead = Math.min(2, trimmed.length);
		const shortTail = Math.min(2, trimmed.length - shortHead);
		if (shortTail <= 0) return `${trimmed.slice(0, shortHead)}…`;
		return `${trimmed.slice(0, shortHead)}…${trimmed.slice(-shortTail)}`;
	}
	return `${trimmed.slice(0, head)}…${trimmed.slice(-tail)}`;
}
function normalizeTokenProviderInput(tokenProvider) {
	return String(tokenProvider ?? "").trim().toLowerCase() || void 0;
}
function normalizeSecretInputModeInput(secretInputMode) {
	const normalized = String(secretInputMode ?? "").trim().toLowerCase();
	if (normalized === "plaintext" || normalized === "ref") return normalized;
}
async function maybeApplyApiKeyFromOption(params) {
	const tokenProvider = normalizeTokenProviderInput(params.tokenProvider);
	const expectedProviders = params.expectedProviders.map((provider) => normalizeTokenProviderInput(provider)).filter((provider) => Boolean(provider));
	if (!params.token || !tokenProvider || !expectedProviders.includes(tokenProvider)) return;
	const apiKey = params.normalize(params.token);
	await params.setCredential(apiKey, params.secretInputMode);
	return apiKey;
}
async function ensureApiKeyFromOptionEnvOrPrompt(params) {
	const optionApiKey = await maybeApplyApiKeyFromOption({
		token: params.token,
		tokenProvider: params.tokenProvider,
		secretInputMode: params.secretInputMode,
		expectedProviders: params.expectedProviders,
		normalize: params.normalize,
		setCredential: params.setCredential
	});
	if (optionApiKey) return optionApiKey;
	if (params.noteMessage) await params.prompter.note(params.noteMessage, params.noteTitle);
	return await ensureApiKeyFromEnvOrPrompt({
		config: params.config,
		provider: params.provider,
		envLabel: params.envLabel,
		promptMessage: params.promptMessage,
		normalize: params.normalize,
		validate: params.validate,
		prompter: params.prompter,
		secretInputMode: params.secretInputMode,
		setCredential: params.setCredential
	});
}
async function ensureApiKeyFromEnvOrPrompt(params) {
	const selectedMode = await resolveSecretInputModeForEnvSelection({
		prompter: params.prompter,
		explicitMode: params.secretInputMode
	});
	const envKey = resolveEnvApiKey(params.provider);
	if (selectedMode === "ref") {
		if (typeof params.prompter.select !== "function") {
			const fallback = resolveRefFallbackInput({
				config: params.config,
				provider: params.provider,
				preferredEnvVar: envKey?.source ? extractEnvVarFromSourceLabel(envKey.source) : void 0
			});
			await params.setCredential(fallback.ref, selectedMode);
			return fallback.resolvedValue;
		}
		const resolved = await promptSecretRefForSetup({
			provider: params.provider,
			config: params.config,
			prompter: params.prompter,
			preferredEnvVar: envKey?.source ? extractEnvVarFromSourceLabel(envKey.source) : void 0
		});
		await params.setCredential(resolved.ref, selectedMode);
		return resolved.resolvedValue;
	}
	if (envKey && selectedMode === "plaintext") {
		if (await params.prompter.confirm({
			message: `Use existing ${params.envLabel} (${envKey.source}, ${formatApiKeyPreview(envKey.apiKey)})?`,
			initialValue: true
		})) {
			await params.setCredential(envKey.apiKey, selectedMode);
			return envKey.apiKey;
		}
	}
	const key = await params.prompter.text({
		message: params.promptMessage,
		validate: params.validate
	});
	const apiKey = params.normalize(String(key ?? ""));
	await params.setCredential(apiKey, selectedMode);
	return apiKey;
}
//#endregion
export { resolveNonEnvSecretRefApiKeyMarker as C, resolveEnvSecretRefHeaderValueMarker as S, resolveOAuthApiKeyMarker as T, isAwsSdkAuthMarker as _, normalizeSecretInputModeInput as a, isOAuthApiKeyMarker as b, resolveEnvApiKey as c, MINIMAX_OAUTH_MARKER as d, NON_ENV_SECRETREF_MARKER as f, SECRETREF_ENV_HEADER_MARKER_PREFIX as g, QWEN_OAUTH_MARKER as h, normalizeApiKeyInput as i, CUSTOM_LOCAL_AUTH_MARKER as l, OLLAMA_LOCAL_AUTH_MARKER as m, ensureApiKeyFromOptionEnvOrPrompt as n, normalizeTokenProviderInput as o, OAUTH_API_KEY_MARKER_PREFIX as p, formatApiKeyPreview as r, validateApiKeyInput as s, ensureApiKeyFromEnvOrPrompt as t, GCP_VERTEX_CREDENTIALS_MARKER as u, isKnownEnvApiKeyMarker as v, resolveNonEnvSecretRefHeaderValueMarker as w, isSecretRefHeaderValueMarker as x, isNonSecretApiKeyMarker as y };
