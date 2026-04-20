import { c as resolveOllamaApiBase, i as fetchOllamaModels, n as buildOllamaModelDefinition, r as enrichOllamaModelsWithContext, u as OLLAMA_DEFAULT_BASE_URL } from "../../provider-models-DyhFa3ck.js";
//#region extensions/ollama/provider-discovery.ts
const PROVIDER_ID = "ollama";
const DEFAULT_API_KEY = "ollama-local";
const OLLAMA_CONTEXT_ENRICH_LIMIT = 200;
function normalizeOptionalString(value) {
	return typeof value === "string" && value.trim() ? value.trim() : void 0;
}
function readStringValue(value) {
	if (typeof value === "string") return normalizeOptionalString(value);
	if (value && typeof value === "object" && "value" in value) return normalizeOptionalString(value.value);
}
function resolveOllamaDiscoveryApiKey(params) {
	return (params.env.OLLAMA_API_KEY?.trim() ? "OLLAMA_API_KEY" : void 0) ?? params.explicitApiKey ?? params.resolvedApiKey ?? DEFAULT_API_KEY;
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
async function buildOllamaProvider(configuredBaseUrl, opts) {
	const apiBase = resolveOllamaApiBase(configuredBaseUrl);
	const { reachable, models } = await fetchOllamaModels(apiBase);
	if (!reachable && !opts?.quiet) console.warn(`Ollama could not be reached at ${apiBase}.`);
	return {
		baseUrl: apiBase,
		api: "ollama",
		models: (await enrichOllamaModelsWithContext(apiBase, models.slice(0, OLLAMA_CONTEXT_ENRICH_LIMIT))).map((model) => buildOllamaModelDefinition(model.name, model.contextWindow, model.capabilities))
	};
}
function resolveOllamaPluginConfig(ctx) {
	return (ctx.config.plugins?.entries ?? {}).ollama?.config ?? {};
}
async function runOllamaDiscovery(ctx) {
	const pluginConfig = resolveOllamaPluginConfig(ctx);
	const explicit = ctx.config.models?.providers?.ollama;
	const hasExplicitModels = Array.isArray(explicit?.models) && explicit.models.length > 0;
	const hasMeaningfulExplicitConfig = hasMeaningfulExplicitOllamaConfig(explicit);
	const discoveryEnabled = pluginConfig.discovery?.enabled ?? ctx.config.models?.ollamaDiscovery?.enabled;
	if (!hasExplicitModels && discoveryEnabled === false) return null;
	const ollamaKey = ctx.resolveProviderApiKey(PROVIDER_ID).apiKey;
	const hasRealOllamaKey = typeof ollamaKey === "string" && ollamaKey.trim().length > 0 && ollamaKey.trim() !== DEFAULT_API_KEY;
	const explicitApiKey = readStringValue(explicit?.apiKey);
	if (hasExplicitModels && explicit) return { provider: {
		...explicit,
		baseUrl: typeof explicit.baseUrl === "string" && explicit.baseUrl.trim() ? resolveOllamaApiBase(explicit.baseUrl) : OLLAMA_DEFAULT_BASE_URL,
		api: explicit.api ?? "ollama",
		apiKey: resolveOllamaDiscoveryApiKey({
			env: ctx.env,
			explicitApiKey,
			resolvedApiKey: ollamaKey
		})
	} };
	if (!hasRealOllamaKey && !hasMeaningfulExplicitConfig && shouldSkipAmbientOllamaDiscovery(ctx.env)) return null;
	const provider = await buildOllamaProvider(explicit?.baseUrl, { quiet: !hasRealOllamaKey && !hasMeaningfulExplicitConfig });
	if (provider.models?.length === 0 && !ollamaKey && !explicit?.apiKey) return null;
	return { provider: {
		...provider,
		apiKey: resolveOllamaDiscoveryApiKey({
			env: ctx.env,
			explicitApiKey,
			resolvedApiKey: ollamaKey
		})
	} };
}
const ollamaProviderDiscovery = {
	id: PROVIDER_ID,
	label: "Ollama",
	docsPath: "/providers/ollama",
	envVars: ["OLLAMA_API_KEY"],
	auth: [],
	discovery: {
		order: "late",
		run: runOllamaDiscovery
	}
};
//#endregion
export { ollamaProviderDiscovery as default, ollamaProviderDiscovery };
