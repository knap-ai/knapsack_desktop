import { n as OLLAMA_DEFAULT_BASE_URL } from "./defaults-DOKD5eTO.js";
import { l as resolveOllamaApiBase } from "./provider-models-13s6KSAW.js";
//#region extensions/ollama/src/discovery-shared.ts
const OLLAMA_PROVIDER_ID = "ollama";
const OLLAMA_DEFAULT_API_KEY = "ollama-local";
function normalizeOptionalString(value) {
	return typeof value === "string" && value.trim() ? value.trim() : void 0;
}
function readStringValue(value) {
	if (typeof value === "string") return normalizeOptionalString(value);
	if (value && typeof value === "object" && "value" in value) return normalizeOptionalString(value.value);
}
function resolveOllamaDiscoveryApiKey(params) {
	const envApiKey = params.env.OLLAMA_API_KEY?.trim() ? "OLLAMA_API_KEY" : void 0;
	const resolvedApiKey = normalizeOptionalString(params.resolvedApiKey);
	return envApiKey ?? params.explicitApiKey ?? resolvedApiKey ?? "ollama-local";
}
function shouldSkipAmbientOllamaDiscovery(env) {
	return Boolean(env.VITEST) || env.NODE_ENV === "test";
}
function hasMeaningfulExplicitOllamaConfig(providerConfig) {
	if (!providerConfig) return false;
	if (Array.isArray(providerConfig.models) && providerConfig.models.length > 0) return true;
	if (typeof providerConfig.baseUrl === "string" && providerConfig.baseUrl.trim()) return resolveOllamaApiBase(providerConfig.baseUrl) !== OLLAMA_DEFAULT_BASE_URL;
	if (readStringValue(providerConfig.apiKey)) return true;
	if (providerConfig.auth) return true;
	if (typeof providerConfig.authHeader === "boolean") return true;
	if (providerConfig.headers && typeof providerConfig.headers === "object" && Object.keys(providerConfig.headers).length > 0) return true;
	if (providerConfig.request) return true;
	if (typeof providerConfig.injectNumCtxForOpenAICompat === "boolean") return true;
	return false;
}
async function resolveOllamaDiscoveryResult(params) {
	const explicit = params.ctx.config.models?.providers?.ollama;
	const hasExplicitModels = Array.isArray(explicit?.models) && explicit.models.length > 0;
	const hasMeaningfulExplicitConfig = hasMeaningfulExplicitOllamaConfig(explicit);
	const discoveryEnabled = params.pluginConfig.discovery?.enabled ?? params.ctx.config.models?.ollamaDiscovery?.enabled;
	if (!hasExplicitModels && discoveryEnabled === false) return null;
	const ollamaKey = params.ctx.resolveProviderApiKey(OLLAMA_PROVIDER_ID).apiKey;
	const hasRealOllamaKey = typeof ollamaKey === "string" && ollamaKey.trim().length > 0 && ollamaKey.trim() !== "ollama-local";
	const explicitApiKey = readStringValue(explicit?.apiKey);
	if (hasExplicitModels && explicit) return { provider: {
		...explicit,
		baseUrl: typeof explicit.baseUrl === "string" && explicit.baseUrl.trim() ? resolveOllamaApiBase(explicit.baseUrl) : OLLAMA_DEFAULT_BASE_URL,
		api: explicit.api ?? "ollama",
		apiKey: resolveOllamaDiscoveryApiKey({
			env: params.ctx.env,
			explicitApiKey,
			resolvedApiKey: ollamaKey
		})
	} };
	if (!hasRealOllamaKey && !hasMeaningfulExplicitConfig && shouldSkipAmbientOllamaDiscovery(params.ctx.env)) return null;
	const provider = await params.buildProvider(explicit?.baseUrl, { quiet: !hasRealOllamaKey && !hasMeaningfulExplicitConfig });
	if (provider.models?.length === 0 && !ollamaKey && !explicit?.apiKey) return null;
	return { provider: {
		...provider,
		apiKey: resolveOllamaDiscoveryApiKey({
			env: params.ctx.env,
			explicitApiKey,
			resolvedApiKey: ollamaKey
		})
	} };
}
//#endregion
export { resolveOllamaDiscoveryResult as i, OLLAMA_PROVIDER_ID as n, hasMeaningfulExplicitOllamaConfig as r, OLLAMA_DEFAULT_API_KEY as t };
