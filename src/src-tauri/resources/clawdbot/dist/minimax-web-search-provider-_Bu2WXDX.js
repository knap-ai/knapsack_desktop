import { s as normalizeOptionalString } from "./string-coerce-BUSzWgUA.js";
import { t as formatCliCommand } from "./command-format-Dd3uP9-6.js";
import { d as readNumberParam, h as readStringParam } from "./common-BWtun2If.js";
import { a as wrapWebContent } from "./external-content-Ds7ZVhiZ.js";
import { _ as resolveSiteName, b as writeCachedSearchPayload, d as readCachedSearchPayload, f as readConfiguredSecretString, g as resolveSearchTimeoutSeconds, h as resolveSearchCount, i as buildSearchCacheKey, m as resolveSearchCacheTtlMs, p as readProviderEnvValue, y as withTrustedWebSearchEndpoint } from "./web-search-provider-common-EFbs_Gas.js";
import "./text-runtime-DTMxvodz.js";
import { a as setProviderWebSearchPluginConfigValue, i as resolveProviderWebSearchPluginConfig, r as mergeScopedSearchConfig, s as setTopLevelCredentialValue } from "./web-search-provider-config-DP0GzBOv.js";
import "./provider-web-search-B6Xg-MPv.js";
import { Type } from "@sinclair/typebox";
//#region extensions/minimax/src/minimax-web-search-provider.ts
const MINIMAX_SEARCH_ENDPOINT_GLOBAL = "https://api.minimax.io/v1/coding_plan/search";
const MINIMAX_SEARCH_ENDPOINT_CN = "https://api.minimaxi.com/v1/coding_plan/search";
const MINIMAX_CODING_PLAN_ENV_VARS = ["MINIMAX_CODE_PLAN_KEY", "MINIMAX_CODING_API_KEY"];
function resolveMiniMaxApiKey(searchConfig) {
	return readConfiguredSecretString(searchConfig?.apiKey, "tools.web.search.apiKey") ?? readProviderEnvValue([...MINIMAX_CODING_PLAN_ENV_VARS, "MINIMAX_API_KEY"]);
}
function isMiniMaxCnHost(value) {
	const trimmed = normalizeOptionalString(value);
	if (!trimmed) return false;
	try {
		return new URL(trimmed).hostname.endsWith("minimaxi.com");
	} catch {
		return trimmed.includes("minimaxi.com");
	}
}
function resolveMiniMaxRegion(searchConfig, config) {
	const minimax = typeof searchConfig?.minimax === "object" && searchConfig.minimax !== null && !Array.isArray(searchConfig.minimax) ? searchConfig.minimax : void 0;
	const configuredRegion = typeof minimax?.region === "string" ? normalizeOptionalString(minimax.region) : void 0;
	if (configuredRegion) return configuredRegion === "cn" ? "cn" : "global";
	if (isMiniMaxCnHost(process.env.MINIMAX_API_HOST)) return "cn";
	const providers = (config?.models)?.providers;
	const minimaxProvider = providers?.minimax;
	const portalProvider = providers?.["minimax-portal"];
	const baseUrl = typeof minimaxProvider?.baseUrl === "string" ? minimaxProvider.baseUrl : "";
	const portalBaseUrl = typeof portalProvider?.baseUrl === "string" ? portalProvider.baseUrl : "";
	if (isMiniMaxCnHost(baseUrl) || isMiniMaxCnHost(portalBaseUrl)) return "cn";
	return "global";
}
function resolveMiniMaxEndpoint(searchConfig, config) {
	return resolveMiniMaxRegion(searchConfig, config) === "cn" ? MINIMAX_SEARCH_ENDPOINT_CN : MINIMAX_SEARCH_ENDPOINT_GLOBAL;
}
async function runMiniMaxSearch(params) {
	return withTrustedWebSearchEndpoint({
		url: params.endpoint,
		timeoutSeconds: params.timeoutSeconds,
		init: {
			method: "POST",
			headers: {
				Authorization: `Bearer ${params.apiKey}`,
				"Content-Type": "application/json",
				Accept: "application/json"
			},
			body: JSON.stringify({ q: params.query })
		}
	}, async (res) => {
		if (!res.ok) {
			const detail = await res.text();
			throw new Error(`MiniMax Search API error (${res.status}): ${detail || res.statusText}`);
		}
		const data = await res.json();
		if (data.base_resp?.status_code && data.base_resp.status_code !== 0) throw new Error(`MiniMax Search API error (${data.base_resp.status_code}): ${data.base_resp.status_msg || "unknown error"}`);
		return {
			results: (Array.isArray(data.organic) ? data.organic : []).slice(0, params.count).map((entry) => {
				const title = entry.title ?? "";
				const url = entry.link ?? "";
				const snippet = entry.snippet ?? "";
				return {
					title: title ? wrapWebContent(title, "web_search") : "",
					url,
					description: snippet ? wrapWebContent(snippet, "web_search") : "",
					published: entry.date || void 0,
					siteName: resolveSiteName(url) || void 0
				};
			}),
			relatedSearches: Array.isArray(data.related_searches) ? data.related_searches.map((r) => r.query).filter((q) => typeof q === "string" && q.length > 0).map((q) => wrapWebContent(q, "web_search")) : void 0
		};
	});
}
const MiniMaxSearchSchema = Type.Object({
	query: Type.String({ description: "Search query string." }),
	count: Type.Optional(Type.Number({
		description: "Number of results to return (1-10).",
		minimum: 1,
		maximum: 10
	}))
});
function missingMiniMaxKeyPayload() {
	return {
		error: "missing_minimax_api_key",
		message: `web_search (minimax) needs a MiniMax Coding Plan key. Run \`${formatCliCommand("openclaw configure --section web")}\` to store it, or set MINIMAX_CODE_PLAN_KEY, MINIMAX_CODING_API_KEY, or MINIMAX_API_KEY in the Gateway environment.`,
		docs: "https://docs.openclaw.ai/tools/web"
	};
}
function createMiniMaxToolDefinition(searchConfig, config) {
	return {
		description: "Search the web using MiniMax Search API. Returns titles, URLs, snippets, and related search suggestions.",
		parameters: MiniMaxSearchSchema,
		execute: async (args) => {
			const apiKey = resolveMiniMaxApiKey(searchConfig);
			if (!apiKey) return missingMiniMaxKeyPayload();
			const params = args;
			const query = readStringParam(params, "query", { required: true });
			const resolvedCount = resolveSearchCount(readNumberParam(params, "count", { integer: true }) ?? searchConfig?.maxResults ?? void 0, 5);
			const endpoint = resolveMiniMaxEndpoint(searchConfig, config);
			const cacheKey = buildSearchCacheKey([
				"minimax",
				endpoint,
				query,
				resolvedCount
			]);
			const cached = readCachedSearchPayload(cacheKey);
			if (cached) return cached;
			const start = Date.now();
			const timeoutSeconds = resolveSearchTimeoutSeconds(searchConfig);
			const cacheTtlMs = resolveSearchCacheTtlMs(searchConfig);
			const { results, relatedSearches } = await runMiniMaxSearch({
				query,
				count: resolvedCount,
				apiKey,
				endpoint,
				timeoutSeconds
			});
			const payload = {
				query,
				provider: "minimax",
				count: results.length,
				tookMs: Date.now() - start,
				externalContent: {
					untrusted: true,
					source: "web_search",
					provider: "minimax",
					wrapped: true
				},
				results
			};
			if (relatedSearches && relatedSearches.length > 0) payload.relatedSearches = relatedSearches;
			writeCachedSearchPayload(cacheKey, payload, cacheTtlMs);
			return payload;
		}
	};
}
function createMiniMaxWebSearchProvider() {
	return {
		id: "minimax",
		label: "MiniMax Search",
		hint: "Structured results via MiniMax Coding Plan search API",
		credentialLabel: "MiniMax Coding Plan key",
		envVars: [...MINIMAX_CODING_PLAN_ENV_VARS],
		placeholder: "sk-cp-...",
		signupUrl: "https://platform.minimax.io/user-center/basic-information/interface-key",
		docsUrl: "https://docs.openclaw.ai/tools/minimax-search",
		autoDetectOrder: 15,
		credentialPath: "plugins.entries.minimax.config.webSearch.apiKey",
		inactiveSecretPaths: ["plugins.entries.minimax.config.webSearch.apiKey"],
		getCredentialValue: (searchConfig) => searchConfig?.apiKey,
		setCredentialValue: setTopLevelCredentialValue,
		getConfiguredCredentialValue: (config) => resolveProviderWebSearchPluginConfig(config, "minimax")?.apiKey,
		setConfiguredCredentialValue: (configTarget, value) => {
			setProviderWebSearchPluginConfigValue(configTarget, "minimax", "apiKey", value);
		},
		createTool: (ctx) => createMiniMaxToolDefinition(mergeScopedSearchConfig(ctx.searchConfig, "minimax", resolveProviderWebSearchPluginConfig(ctx.config, "minimax"), { mirrorApiKeyToTopLevel: true }), ctx.config)
	};
}
//#endregion
export { createMiniMaxWebSearchProvider as t };
