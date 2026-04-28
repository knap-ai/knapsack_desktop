import { c as normalizeOptionalString, s as normalizeOptionalLowercaseString } from "./string-coerce-Bje8XVt9.js";
import { s as resolveRuntimeServiceVersion } from "./version-vQIvyCe_.js";
import { r as normalizeProviderId } from "./provider-id-DRW5WMbW.js";
import { n as loadPluginManifestRegistryForPluginRegistry } from "./plugin-registry-CZ8QXP5l.js";
//#region src/agents/provider-attribution.ts
function readCompatBoolean(compat, key) {
	if (!compat || typeof compat !== "object") return;
	const value = compat[key];
	return typeof value === "boolean" ? value : void 0;
}
const OPENCLAW_ATTRIBUTION_PRODUCT = "OpenClaw";
const OPENCLAW_ATTRIBUTION_ORIGINATOR = "openclaw";
const LOCAL_ENDPOINT_HOSTS = new Set([
	"localhost",
	"127.0.0.1",
	"::1",
	"[::1]"
]);
const OPENAI_RESPONSES_APIS = new Set([
	"openai-responses",
	"azure-openai-responses",
	"openai-codex-responses"
]);
const OPENAI_RESPONSES_PROVIDERS = new Set([
	"openai",
	"azure-openai",
	"azure-openai-responses"
]);
const MANIFEST_PROVIDER_ENDPOINT_CLASSES = new Set([
	"anthropic-public",
	"cerebras-native",
	"chutes-native",
	"deepseek-native",
	"github-copilot-native",
	"groq-native",
	"mistral-public",
	"moonshot-native",
	"modelstudio-native",
	"openai-public",
	"openai-codex",
	"opencode-native",
	"azure-openai",
	"openrouter",
	"xai-native",
	"zai-native",
	"google-generative-ai",
	"google-vertex"
]);
let manifestProviderEndpointCache = null;
let manifestProviderRequestCache = null;
function formatOpenClawUserAgent(version) {
	return `${OPENCLAW_ATTRIBUTION_ORIGINATOR}/${version}`;
}
function tryParseHostname(value) {
	try {
		return normalizeOptionalLowercaseString(new URL(value).hostname);
	} catch {
		return;
	}
}
function isSchemelessHostnameCandidate(value) {
	return /^[a-z0-9.[\]-]+(?::\d+)?(?:[/?#].*)?$/i.test(value);
}
function resolveUrlHostname(value) {
	const trimmed = normalizeOptionalString(value);
	if (!trimmed) return;
	const parsedHostname = tryParseHostname(trimmed);
	if (parsedHostname) return parsedHostname;
	if (!isSchemelessHostnameCandidate(trimmed)) return;
	return tryParseHostname(`https://${trimmed}`);
}
function normalizeComparableBaseUrl(value) {
	const trimmed = normalizeOptionalString(value);
	if (!trimmed) return;
	const parsedValue = tryParseHostname(trimmed) || !isSchemelessHostnameCandidate(trimmed) ? trimmed : `https://${trimmed}`;
	try {
		const url = new URL(parsedValue);
		if (url.protocol !== "http:" && url.protocol !== "https:") return;
		url.hash = "";
		url.search = "";
		return normalizeOptionalLowercaseString(url.toString().replace(/\/+$/, ""));
	} catch {
		return;
	}
}
function isManifestProviderEndpointClass(value) {
	return MANIFEST_PROVIDER_ENDPOINT_CLASSES.has(value);
}
function loadManifestProviderEndpointCache() {
	if (!manifestProviderEndpointCache) {
		const registry = loadPluginManifestRegistryForPluginRegistry({ includeDisabled: true });
		const entries = [];
		for (const plugin of registry.plugins) for (const endpoint of plugin.providerEndpoints ?? []) {
			if (!isManifestProviderEndpointClass(endpoint.endpointClass)) continue;
			entries.push({
				endpointClass: endpoint.endpointClass,
				hosts: (endpoint.hosts ?? []).map((host) => host.toLowerCase()),
				hostSuffixes: (endpoint.hostSuffixes ?? []).map((host) => host.toLowerCase()),
				normalizedBaseUrls: (endpoint.baseUrls ?? []).map((baseUrl) => normalizeComparableBaseUrl(baseUrl)).filter((baseUrl) => baseUrl !== void 0),
				...endpoint.googleVertexRegion ? { googleVertexRegion: endpoint.googleVertexRegion } : {},
				...endpoint.googleVertexRegionHostSuffix ? { googleVertexRegionHostSuffix: endpoint.googleVertexRegionHostSuffix } : {}
			});
		}
		manifestProviderEndpointCache = entries;
	}
	return manifestProviderEndpointCache;
}
function loadManifestProviderRequestCache() {
	if (!manifestProviderRequestCache) {
		const registry = loadPluginManifestRegistryForPluginRegistry({ includeDisabled: true });
		const entries = /* @__PURE__ */ new Map();
		for (const plugin of registry.plugins) for (const [provider, request] of Object.entries(plugin.providerRequest?.providers ?? {})) entries.set(provider, {
			...request.family ? { family: request.family } : {},
			...request.compatibilityFamily ? { compatibilityFamily: request.compatibilityFamily } : {},
			...request.openAICompletions?.supportsStreamingUsage !== void 0 ? { supportsOpenAICompletionsStreamingUsageCompat: request.openAICompletions.supportsStreamingUsage } : {}
		});
		manifestProviderRequestCache = entries;
	}
	return manifestProviderRequestCache;
}
function resolveManifestProviderRequest(provider) {
	return provider ? loadManifestProviderRequestCache().get(provider) : void 0;
}
function hostMatchesSuffix(host, suffix) {
	if (!suffix) return false;
	return suffix.startsWith(".") || suffix.startsWith("-") ? host.endsWith(suffix) : host === suffix || host.endsWith(`.${suffix}`);
}
function buildManifestEndpointResolution(endpoint, host) {
	const regionSuffix = endpoint.googleVertexRegionHostSuffix;
	const googleVertexRegion = endpoint.googleVertexRegion ?? (regionSuffix && host.endsWith(regionSuffix) ? host.slice(0, -regionSuffix.length) : void 0);
	return {
		endpointClass: endpoint.endpointClass,
		hostname: host,
		...googleVertexRegion ? { googleVertexRegion } : {}
	};
}
function resolveManifestProviderEndpoint(params) {
	for (const endpoint of loadManifestProviderEndpointCache()) {
		if (endpoint.hosts.includes(params.host)) return buildManifestEndpointResolution(endpoint, params.host);
		if (endpoint.hostSuffixes.some((suffix) => hostMatchesSuffix(params.host, suffix))) return buildManifestEndpointResolution(endpoint, params.host);
		if (params.normalizedBaseUrl && endpoint.normalizedBaseUrls.includes(params.normalizedBaseUrl)) return buildManifestEndpointResolution(endpoint, params.host);
	}
}
function isLocalEndpointHost(host) {
	return LOCAL_ENDPOINT_HOSTS.has(host) || host.endsWith(".localhost") || host.endsWith(".local") || host.endsWith(".internal");
}
function resolveProviderEndpoint(baseUrl) {
	if (typeof baseUrl !== "string" || !baseUrl.trim()) return { endpointClass: "default" };
	const host = resolveUrlHostname(baseUrl);
	if (!host) return { endpointClass: "invalid" };
	const manifestEndpoint = resolveManifestProviderEndpoint({
		host,
		normalizedBaseUrl: normalizeComparableBaseUrl(baseUrl)
	});
	if (manifestEndpoint) return manifestEndpoint;
	if (isLocalEndpointHost(host)) return {
		endpointClass: "local",
		hostname: host
	};
	return {
		endpointClass: "custom",
		hostname: host
	};
}
function resolveKnownProviderFamily(provider) {
	const manifestFamily = resolveManifestProviderRequest(provider)?.family;
	if (manifestFamily) return manifestFamily;
	switch (provider) {
		case "openai":
		case "openai-codex":
		case "azure-openai":
		case "azure-openai-responses": return "openai-family";
		default: return provider || "unknown";
	}
}
function isOpenAIResponsesApi(api) {
	const normalizedApi = normalizeOptionalLowercaseString(api);
	return normalizedApi !== void 0 && OPENAI_RESPONSES_APIS.has(normalizedApi);
}
function resolveProviderAttributionIdentity(env = process.env) {
	return {
		product: OPENCLAW_ATTRIBUTION_PRODUCT,
		version: resolveRuntimeServiceVersion(env)
	};
}
function buildOpenRouterAttributionPolicy(env = process.env) {
	const identity = resolveProviderAttributionIdentity(env);
	return {
		provider: "openrouter",
		enabledByDefault: true,
		verification: "vendor-documented",
		hook: "request-headers",
		docsUrl: "https://openrouter.ai/docs/app-attribution",
		reviewNote: "Documented app attribution headers. Verified in OpenClaw runtime wrapper.",
		...identity,
		headers: {
			"HTTP-Referer": "https://openclaw.ai",
			"X-OpenRouter-Title": identity.product,
			"X-OpenRouter-Categories": "cli-agent"
		}
	};
}
function buildOpenAIAttributionPolicy(env = process.env) {
	const identity = resolveProviderAttributionIdentity(env);
	return {
		provider: "openai",
		enabledByDefault: true,
		verification: "vendor-hidden-api-spec",
		hook: "request-headers",
		reviewNote: "OpenAI native traffic supports hidden originator/User-Agent attribution. Verified against the Codex wire contract.",
		...identity,
		headers: {
			originator: OPENCLAW_ATTRIBUTION_ORIGINATOR,
			version: identity.version,
			"User-Agent": formatOpenClawUserAgent(identity.version)
		}
	};
}
function buildOpenAICodexAttributionPolicy(env = process.env) {
	const identity = resolveProviderAttributionIdentity(env);
	return {
		provider: "openai-codex",
		enabledByDefault: true,
		verification: "vendor-hidden-api-spec",
		hook: "request-headers",
		reviewNote: "OpenAI Codex ChatGPT-backed traffic supports the same hidden originator/User-Agent attribution contract.",
		...identity,
		headers: {
			originator: OPENCLAW_ATTRIBUTION_ORIGINATOR,
			version: identity.version,
			"User-Agent": formatOpenClawUserAgent(identity.version)
		}
	};
}
function buildSdkHookOnlyPolicy(provider, hook, reviewNote, env = process.env) {
	return {
		provider,
		enabledByDefault: false,
		verification: "vendor-sdk-hook-only",
		hook,
		reviewNote,
		...resolveProviderAttributionIdentity(env)
	};
}
function listProviderAttributionPolicies(env = process.env) {
	return [
		buildOpenRouterAttributionPolicy(env),
		buildOpenAIAttributionPolicy(env),
		buildOpenAICodexAttributionPolicy(env),
		buildSdkHookOnlyPolicy("anthropic", "default-headers", "Anthropic JS SDK exposes defaultHeaders, but app attribution is not yet verified.", env),
		buildSdkHookOnlyPolicy("google", "user-agent-extra", "Google GenAI JS SDK exposes userAgentExtra/httpOptions, but provider-side attribution is not yet verified.", env),
		buildSdkHookOnlyPolicy("groq", "default-headers", "Groq JS SDK exposes defaultHeaders, but app attribution is not yet verified.", env),
		buildSdkHookOnlyPolicy("mistral", "custom-user-agent", "Mistral JS SDK exposes a custom userAgent option, but app attribution is not yet verified.", env),
		buildSdkHookOnlyPolicy("together", "default-headers", "Together JS SDK exposes defaultHeaders, but app attribution is not yet verified.", env)
	];
}
function resolveProviderAttributionPolicy(provider, env = process.env) {
	const normalized = normalizeProviderId(provider ?? "");
	return listProviderAttributionPolicies(env).find((policy) => policy.provider === normalized);
}
function resolveProviderAttributionHeaders(provider, env = process.env) {
	const policy = resolveProviderAttributionPolicy(provider, env);
	if (!policy?.enabledByDefault) return;
	return policy.headers;
}
function resolveProviderRequestPolicy(input, env = process.env) {
	const provider = normalizeProviderId(input.provider ?? "");
	const policy = resolveProviderAttributionPolicy(provider, env);
	const endpointClass = resolveProviderEndpoint(input.baseUrl).endpointClass;
	const api = normalizeOptionalLowercaseString(input.api);
	const usesConfiguredBaseUrl = endpointClass !== "default";
	const usesKnownNativeOpenAIEndpoint = endpointClass === "openai-public" || endpointClass === "openai-codex" || endpointClass === "azure-openai";
	const usesOpenAIPublicAttributionHost = endpointClass === "openai-public";
	const usesOpenAICodexAttributionHost = endpointClass === "openai-codex";
	const usesVerifiedOpenAIAttributionHost = usesOpenAIPublicAttributionHost || usesOpenAICodexAttributionHost;
	const usesExplicitProxyLikeEndpoint = usesConfiguredBaseUrl && !usesKnownNativeOpenAIEndpoint;
	let attributionProvider;
	if (provider === "openai" && (api === "openai-completions" || api === "openai-responses" || input.capability === "audio" && api === "openai-audio-transcriptions") && usesOpenAIPublicAttributionHost) attributionProvider = "openai";
	else if (provider === "openai-codex" && (api === "openai-codex-responses" || api === "openai-responses") && usesOpenAICodexAttributionHost) attributionProvider = "openai-codex";
	else if (provider === "openrouter" && policy?.enabledByDefault) {
		if (endpointClass === "openrouter" || endpointClass === "default") attributionProvider = "openrouter";
	}
	const attributionHeaders = attributionProvider ? resolveProviderAttributionHeaders(attributionProvider, env) : void 0;
	return {
		provider: provider || void 0,
		policy,
		endpointClass,
		usesConfiguredBaseUrl,
		knownProviderFamily: resolveKnownProviderFamily(provider || void 0),
		attributionProvider,
		attributionHeaders,
		allowsHiddenAttribution: attributionProvider !== void 0 && policy?.verification === "vendor-hidden-api-spec",
		usesKnownNativeOpenAIEndpoint,
		usesKnownNativeOpenAIRoute: endpointClass === "default" ? provider === "openai" : usesKnownNativeOpenAIEndpoint,
		usesVerifiedOpenAIAttributionHost,
		usesExplicitProxyLikeEndpoint
	};
}
function resolveProviderRequestCapabilities(input, env = process.env) {
	const policy = resolveProviderRequestPolicy(input, env);
	const provider = policy.provider;
	const api = normalizeOptionalLowercaseString(input.api);
	const endpointClass = policy.endpointClass;
	const isKnownNativeEndpoint = endpointClass === "anthropic-public" || endpointClass === "cerebras-native" || endpointClass === "chutes-native" || endpointClass === "deepseek-native" || endpointClass === "github-copilot-native" || endpointClass === "groq-native" || endpointClass === "mistral-public" || endpointClass === "moonshot-native" || endpointClass === "modelstudio-native" || endpointClass === "openai-public" || endpointClass === "openai-codex" || endpointClass === "opencode-native" || endpointClass === "azure-openai" || endpointClass === "openrouter" || endpointClass === "xai-native" || endpointClass === "zai-native" || endpointClass === "google-generative-ai" || endpointClass === "google-vertex";
	const manifestProviderRequest = resolveManifestProviderRequest(provider);
	const compatibilityFamily = manifestProviderRequest?.compatibilityFamily;
	const isResponsesApi = isOpenAIResponsesApi(api);
	const promptCacheKeySupport = readCompatBoolean(input.compat, "supportsPromptCacheKey");
	const shouldStripResponsesPromptCache = promptCacheKeySupport === true ? false : promptCacheKeySupport === false ? isResponsesApi : isResponsesApi && policy.usesExplicitProxyLikeEndpoint;
	return {
		...policy,
		isKnownNativeEndpoint,
		allowsOpenAIServiceTier: provider === "openai" && api === "openai-responses" && endpointClass === "openai-public" || provider === "openai-codex" && (api === "openai-codex-responses" || api === "openai-responses") && endpointClass === "openai-codex",
		supportsOpenAIReasoningCompatPayload: provider !== void 0 && api !== void 0 && !policy.usesExplicitProxyLikeEndpoint && (provider === "openai" || provider === "openai-codex" || provider === "azure-openai" || provider === "azure-openai-responses") && (api === "openai-completions" || api === "openai-responses" || api === "openai-codex-responses" || api === "azure-openai-responses"),
		allowsAnthropicServiceTier: provider === "anthropic" && api === "anthropic-messages" && (endpointClass === "default" || endpointClass === "anthropic-public"),
		supportsResponsesStoreField: readCompatBoolean(input.compat, "supportsStore") !== false && isResponsesApi,
		allowsResponsesStore: readCompatBoolean(input.compat, "supportsStore") !== false && provider !== void 0 && isResponsesApi && OPENAI_RESPONSES_PROVIDERS.has(provider) && policy.usesKnownNativeOpenAIEndpoint,
		shouldStripResponsesPromptCache,
		supportsNativeStreamingUsageCompat: endpointClass === "moonshot-native" || endpointClass === "modelstudio-native",
		supportsOpenAICompletionsStreamingUsageCompat: manifestProviderRequest?.supportsOpenAICompletionsStreamingUsageCompat === true,
		compatibilityFamily
	};
}
function describeProviderRequestRoutingPolicy(policy) {
	if (!policy.attributionProvider) return "none";
	switch (policy.policy?.verification) {
		case "vendor-hidden-api-spec": return "hidden";
		case "vendor-documented": return "documented";
		case "vendor-sdk-hook-only": return "sdk-hook-only";
		default: return "none";
	}
}
function describeProviderRequestRouteClass(policy) {
	if (policy.endpointClass === "default") return "default";
	if (policy.endpointClass === "invalid") return "invalid";
	if (policy.endpointClass === "local") return "local";
	if (policy.endpointClass === "custom" || policy.endpointClass === "openrouter") return "proxy-like";
	return "native";
}
function describeProviderRequestRoutingSummary(input, env = process.env) {
	const policy = resolveProviderRequestPolicy(input, env);
	const api = normalizeOptionalLowercaseString(input.api) ?? "unknown";
	const provider = policy.provider ?? "unknown";
	const routeClass = describeProviderRequestRouteClass(policy);
	const routingPolicy = describeProviderRequestRoutingPolicy(policy);
	return [
		`provider=${provider}`,
		`api=${api}`,
		`endpoint=${policy.endpointClass}`,
		`route=${routeClass}`,
		`policy=${routingPolicy}`
	].join(" ");
}
//#endregion
export { resolveProviderRequestPolicy as a, resolveProviderRequestCapabilities as i, isOpenAIResponsesApi as n, resolveProviderEndpoint as r, describeProviderRequestRoutingSummary as t };
