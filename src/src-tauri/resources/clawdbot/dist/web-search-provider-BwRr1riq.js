import { c as normalizeOptionalString } from "./string-coerce-C1IzJjqi.js";
import { u as isNonSecretApiKeyMarker } from "./model-auth-markers-CZrGSAU9.js";
import { t as normalizeOptionalSecretInput } from "./normalize-secret-input-CkOd5v2f.js";
import { t as resolveEnvApiKey } from "./model-auth-env-CC-y_Bin.js";
import { n as fetchWithSsrFGuard } from "./fetch-guard-DKbwHPzH.js";
import { f as readNumberParam, g as readStringParam } from "./common-B4WrK_Ib.js";
import { a as wrapWebContent } from "./external-content-BNyMCWFo.js";
import { a as truncateText } from "./web-fetch-utils-qxtsbeaw.js";
import { a as readResponseText } from "./web-shared-I_0Jr7ES.js";
import { _ as resolveSiteName, h as resolveSearchCount } from "./web-search-provider-common-R-M-_9hO.js";
import "./text-runtime-B1c54bxG.js";
import "./provider-auth-B7ecZcum.js";
import "./ssrf-runtime-DjO5-xxH.js";
import "./provider-auth-runtime-CWqLpFd_.js";
import { t as enablePluginInConfig } from "./enable-y339R98P.js";
import { i as resolveProviderWebSearchPluginConfig } from "./web-search-provider-config-OljE13lA.js";
import "./provider-web-search-DiAvE6oC.js";
import { n as OLLAMA_DEFAULT_BASE_URL } from "./defaults-DOKD5eTO.js";
import { a as fetchOllamaModels, l as resolveOllamaApiBase, t as buildOllamaBaseUrlSsrFPolicy } from "./provider-models-13s6KSAW.js";
import { t as checkOllamaCloudAuth } from "./setup-BRcVshwu.js";
import { Type } from "typebox";
//#region extensions/ollama/src/web-search-provider.ts
const OLLAMA_WEB_SEARCH_SCHEMA = Type.Object({
	query: Type.String({ description: "Search query string." }),
	count: Type.Optional(Type.Number({
		description: "Number of results to return (1-10).",
		minimum: 1,
		maximum: 10
	}))
}, { additionalProperties: false });
const OLLAMA_WEB_SEARCH_PATH = "/api/experimental/web_search";
const DEFAULT_OLLAMA_WEB_SEARCH_COUNT = 5;
const DEFAULT_OLLAMA_WEB_SEARCH_TIMEOUT_MS = 15e3;
const OLLAMA_WEB_SEARCH_SNIPPET_MAX_CHARS = 300;
function resolveOllamaWebSearchApiKey(config) {
	const providerApiKey = normalizeOptionalSecretInput(config?.models?.providers?.ollama?.apiKey);
	if (providerApiKey && !isNonSecretApiKeyMarker(providerApiKey)) return providerApiKey;
	return resolveEnvApiKey("ollama")?.apiKey;
}
function resolveOllamaWebSearchBaseUrl(config) {
	const pluginBaseUrl = normalizeOptionalString(resolveProviderWebSearchPluginConfig(config, "ollama")?.baseUrl);
	if (pluginBaseUrl) return resolveOllamaApiBase(pluginBaseUrl);
	const configuredBaseUrl = config?.models?.providers?.ollama?.baseUrl;
	if (normalizeOptionalString(configuredBaseUrl)) {
		const baseUrl = resolveOllamaApiBase(configuredBaseUrl);
		if (baseUrl !== "https://ollama.com") return baseUrl;
	}
	return OLLAMA_DEFAULT_BASE_URL;
}
function normalizeOllamaWebSearchResult(result) {
	const url = normalizeOptionalString(result.url) ?? "";
	if (!url) return null;
	return {
		title: normalizeOptionalString(result.title) ?? "",
		url,
		content: normalizeOptionalString(result.content) ?? ""
	};
}
async function runOllamaWebSearch(params) {
	const query = params.query.trim();
	if (!query) throw new Error("query parameter is required");
	const baseUrl = resolveOllamaWebSearchBaseUrl(params.config);
	const apiKey = resolveOllamaWebSearchApiKey(params.config);
	const count = resolveSearchCount(params.count, DEFAULT_OLLAMA_WEB_SEARCH_COUNT);
	const startedAt = Date.now();
	const headers = { "Content-Type": "application/json" };
	if (apiKey) headers.Authorization = `Bearer ${apiKey}`;
	const { response, release } = await fetchWithSsrFGuard({
		url: `${baseUrl}${OLLAMA_WEB_SEARCH_PATH}`,
		init: {
			method: "POST",
			headers,
			body: JSON.stringify({
				query,
				max_results: count
			}),
			signal: AbortSignal.timeout(DEFAULT_OLLAMA_WEB_SEARCH_TIMEOUT_MS)
		},
		policy: buildOllamaBaseUrlSsrFPolicy(baseUrl),
		auditContext: "ollama-web-search.search"
	});
	try {
		if (response.status === 401) throw new Error("Ollama web search authentication failed. Run `ollama signin`.");
		if (response.status === 403) throw new Error("Ollama web search is unavailable. Ensure cloud-backed web search is enabled on the Ollama host.");
		if (!response.ok) {
			const detail = await readResponseText(response, { maxBytes: 64e3 });
			throw new Error(`Ollama web search failed (${response.status}): ${detail.text || ""}`.trim());
		}
		const payload = await response.json();
		const results = Array.isArray(payload.results) ? payload.results.map(normalizeOllamaWebSearchResult).filter((result) => result !== null).slice(0, count) : [];
		return {
			query,
			provider: "ollama",
			count: results.length,
			tookMs: Date.now() - startedAt,
			externalContent: {
				untrusted: true,
				source: "web_search",
				provider: "ollama",
				wrapped: true
			},
			results: results.map((result) => {
				const snippet = truncateText(result.content, OLLAMA_WEB_SEARCH_SNIPPET_MAX_CHARS).text;
				return {
					title: result.title ? wrapWebContent(result.title, "web_search") : "",
					url: result.url,
					snippet: snippet ? wrapWebContent(snippet, "web_search") : "",
					siteName: resolveSiteName(result.url) || void 0
				};
			})
		};
	} finally {
		await release();
	}
}
async function warnOllamaWebSearchPrereqs(params) {
	const baseUrl = resolveOllamaWebSearchBaseUrl(params.config);
	const { reachable } = await fetchOllamaModels(baseUrl);
	if (!reachable) {
		await params.prompter.note([
			"Ollama Web Search requires Ollama to be running.",
			`Expected host: ${baseUrl}`,
			"Start Ollama before using this provider."
		].join("\n"), "Ollama Web Search");
		return params.config;
	}
	const auth = await checkOllamaCloudAuth(baseUrl);
	if (!auth.signedIn) await params.prompter.note(["Ollama Web Search requires `ollama signin`.", ...auth.signinUrl ? [auth.signinUrl] : ["Run `ollama signin`."]].join("\n"), "Ollama Web Search");
	return params.config;
}
function createOllamaWebSearchProvider() {
	return {
		id: "ollama",
		label: "Ollama Web Search",
		hint: "Local Ollama host · requires ollama signin",
		onboardingScopes: ["text-inference"],
		requiresCredential: false,
		envVars: [],
		placeholder: "(run ollama signin)",
		signupUrl: "https://ollama.com/",
		docsUrl: "https://docs.openclaw.ai/tools/web",
		autoDetectOrder: 110,
		credentialPath: "",
		getCredentialValue: () => void 0,
		setCredentialValue: () => {},
		applySelectionConfig: (config) => enablePluginInConfig(config, "ollama").config,
		runSetup: async (ctx) => await warnOllamaWebSearchPrereqs({
			config: ctx.config,
			prompter: ctx.prompter
		}),
		createTool: (ctx) => ({
			description: "Search the web using Ollama's experimental web search API. Returns titles, URLs, and snippets from the configured Ollama host.",
			parameters: OLLAMA_WEB_SEARCH_SCHEMA,
			execute: async (args) => await runOllamaWebSearch({
				config: ctx.config,
				query: readStringParam(args, "query", { required: true }),
				count: readNumberParam(args, "count", { integer: true })
			})
		})
	};
}
//#endregion
export { createOllamaWebSearchProvider as t };
