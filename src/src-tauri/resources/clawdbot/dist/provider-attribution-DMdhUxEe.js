import { c as normalizeOptionalString, s as normalizeOptionalLowercaseString } from "./string-coerce-C1IzJjqi.js";
import { s as resolveRuntimeServiceVersion } from "./version-DZq9J0ei.js";
import { t as loadPluginManifestRegistry } from "./manifest-registry-pYrbrdHJ.js";
import { r as normalizeProviderId } from "./provider-id-BLh32HP1.js";
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
const MOONSHOT_NATIVE_BASE_URLS = new Set(["https://api.moonshot.ai/v1", "https://api.moonshot.cn/v1"]);
const MODELSTUDIO_NATIVE_BASE_URLS = new Set([
	"https://coding-intl.dashscope.aliyuncs.com/v1",
	"https://coding.dashscope.aliyuncs.com/v1",
	"https://dashscope.aliyuncs.com/compatible-mode/v1",
	"https://dashscope-intl.aliyuncs.com/compatible-mode/v1"
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
const MOONSHOT_COMPAT_PROVIDERS = new Set(["moonshot", "kimi"]);
const MANIFEST_PROVIDER_ENDPOINT_CLASSES = new Set(["xai-native"]);
let manifestProviderEndpointCache = null;
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
		const registry = loadPluginManifestRegistry({ cache: true });
		const entries = [];
		for (const plugin of registry.plugins) for (const endpoint of plugin.providerEndpoints ?? []) {
			if (!isManifestProviderEndpointClass(endpoint.endpointClass)) continue;
			entries.push({
				endpointClass: endpoint.endpointClass,
				hosts: (endpoint.hosts ?? []).map((host) => host.toLowerCase()),
				normalizedBaseUrls: (endpoint.baseUrls ?? []).map((baseUrl) => normalizeComparableBaseUrl(baseUrl)).filter((baseUrl) => baseUrl !== void 0)
			});
		}
		manifestProviderEndpointCache = entries;
	}
	return manifestProviderEndpointCache;
}
function resolveManifestProviderEndpoint(params) {
	for (const endpoint of loadManifestProviderEndpointCache()) {
		if (endpoint.hosts.includes(params.host)) return {
			endpointClass: endpoint.endpointClass,
			hostname: params.host
		};
		if (params.normalizedBaseUrl && endpoint.normalizedBaseUrls.includes(params.normalizedBaseUrl)) return {
			endpointClass: endpoint.endpointClass,
			hostname: params.host
		};
	}
}
function isLocalEndpointHost(host) {
	return LOCAL_ENDPOINT_HOSTS.has(host) || host.endsWith(".localhost") || host.endsWith(".local") || host.endsWith(".internal");
}
function resolveProviderEndpoint(baseUrl) {
	if (typeof baseUrl !== "string" || !baseUrl.trim()) return { endpointClass: "default" };
	const host = resolveUrlHostname(baseUrl);
	if (!host) return { endpointClass: "invalid" };
	const normalizedBaseUrl = normalizeComparableBaseUrl(baseUrl);
	if (normalizedBaseUrl && MOONSHOT_NATIVE_BASE_URLS.has(normalizedBaseUrl)) return {
		endpointClass: "moonshot-native",
		hostname: host
	};
	if (normalizedBaseUrl && MODELSTUDIO_NATIVE_BASE_URLS.has(normalizedBaseUrl)) return {
		endpointClass: "modelstudio-native",
		hostname: host
	};
	if (host === "api.openai.com") return {
		endpointClass: "openai-public",
		hostname: host
	};
	if (host === "api.anthropic.com") return {
		endpointClass: "anthropic-public",
		hostname: host
	};
	if (host === "api.mistral.ai") return {
		endpointClass: "mistral-public",
		hostname: host
	};
	if (host === "api.cerebras.ai") return {
		endpointClass: "cerebras-native",
		hostname: host
	};
	if (host === "llm.chutes.ai") return {
		endpointClass: "chutes-native",
		hostname: host
	};
	if (host === "api.deepseek.com") return {
		endpointClass: "deepseek-native",
		hostname: host
	};
	if (host.endsWith(".githubcopilot.com")) return {
		endpointClass: "github-copilot-native",
		hostname: host
	};
	if (host === "api.groq.com") return {
		endpointClass: "groq-native",
		hostname: host
	};
	if (host === "chatgpt.com") return {
		endpointClass: "openai-codex",
		hostname: host
	};
	if (host === "opencode.ai" || host.endsWith(".opencode.ai")) return {
		endpointClass: "opencode-native",
		hostname: host
	};
	if (host === "openrouter.ai" || host.endsWith(".openrouter.ai")) return {
		endpointClass: "openrouter",
		hostname: host
	};
	if (host === "api.z.ai") return {
		endpointClass: "zai-native",
		hostname: host
	};
	if (host.endsWith(".openai.azure.com")) return {
		endpointClass: "azure-openai",
		hostname: host
	};
	if (host === "generativelanguage.googleapis.com") return {
		endpointClass: "google-generative-ai",
		hostname: host
	};
	if (host === "aiplatform.googleapis.com") return {
		endpointClass: "google-vertex",
		hostname: host,
		googleVertexRegion: "global"
	};
	const googleVertexHost = /^([a-z0-9-]+)-aiplatform\.googleapis\.com$/.exec(host);
	if (googleVertexHost) return {
		endpointClass: "google-vertex",
		hostname: host,
		googleVertexRegion: googleVertexHost[1]
	};
	const manifestEndpoint = resolveManifestProviderEndpoint({
		host,
		normalizedBaseUrl
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
	switch (provider) {
		case "openai":
		case "openai-codex":
		case "azure-openai":
		case "azure-openai-responses": return "openai-family";
		case "openrouter": return "openrouter";
		case "anthropic": return "anthropic";
		case "chutes": return "chutes";
		case "deepseek": return "deepseek";
		case "google": return "google";
		case "xai": return "xai";
		case "zai": return "zai";
		case "moonshot":
		case "kimi": return "moonshot";
		case "qwen":
		case "qwencloud":
		case "modelstudio":
		case "dashscope": return "modelstudio";
		case "github-copilot": return "github-copilot";
		case "groq": return "groq";
		case "mistral": return "mistral";
		case "together": return "together";
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
	let compatibilityFamily;
	if (provider && MOONSHOT_COMPAT_PROVIDERS.has(provider)) compatibilityFamily = "moonshot";
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
