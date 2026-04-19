import { c as normalizeResolvedSecretInputString } from "./types.secrets-CeL3gSMO.js";
import { n as normalizeSecretInput } from "./normalize-secret-input-DqcJmob1.js";
import { d as readNumberParam, h as readStringParam } from "./common-BWtun2If.js";
import { a as wrapWebContent } from "./external-content-Ds7ZVhiZ.js";
import { a as readResponseText, i as readCache, l as writeCache, o as resolveCacheTtlMs, r as normalizeCacheKey, s as resolveTimeoutSeconds } from "./web-shared-BfvYKFo5.js";
import { _ as resolveSiteName, h as resolveSearchCount, y as withTrustedWebSearchEndpoint } from "./web-search-provider-common-EFbs_Gas.js";
import "./secret-input-BEMaS7ol.js";
import { t as assertHttpUrlTargetsPrivateNetwork } from "./ssrf-policy-CChtVzhj.js";
import "./ssrf-runtime-CmuKDV7X.js";
import { t as enablePluginInConfig } from "./enable-CYwosJmY.js";
import { a as setProviderWebSearchPluginConfigValue, i as resolveProviderWebSearchPluginConfig, o as setScopedCredentialValue, t as getScopedCredentialValue } from "./web-search-provider-config-DP0GzBOv.js";
import "./provider-web-search-B6Xg-MPv.js";
import { Type } from "@sinclair/typebox";
//#region extensions/searxng/src/config.ts
function normalizeConfiguredString(value, path) {
	try {
		return normalizeSecretInput(normalizeResolvedSecretInputString({
			value,
			path
		}));
	} catch {
		return;
	}
}
function readInlineEnvSecretRefValue(value, env) {
	if (!value || typeof value !== "object" || Array.isArray(value)) return;
	const record = value;
	if (record.source !== "env" || typeof record.id !== "string") return;
	return normalizeSecretInput(env[record.id]);
}
function normalizeTrimmedString(value) {
	if (typeof value !== "string") return;
	return value.trim() || void 0;
}
function normalizeBaseUrl(value) {
	return value?.replace(/\/+$/u, "") || void 0;
}
function resolveSearxngWebSearchConfig(config) {
	const webSearch = (config?.plugins?.entries?.searxng?.config)?.webSearch;
	if (webSearch && typeof webSearch === "object" && !Array.isArray(webSearch)) return webSearch;
}
function resolveSearxngBaseUrl(config, env = process.env) {
	const webSearch = resolveSearxngWebSearchConfig(config);
	return normalizeBaseUrl(normalizeConfiguredString(webSearch?.baseUrl, "plugins.entries.searxng.config.webSearch.baseUrl")) ?? normalizeBaseUrl(readInlineEnvSecretRefValue(webSearch?.baseUrl, env)) ?? normalizeBaseUrl(normalizeSecretInput(env.SEARXNG_BASE_URL));
}
function resolveSearxngCategories(config) {
	return normalizeTrimmedString(resolveSearxngWebSearchConfig(config)?.categories);
}
function resolveSearxngLanguage(config) {
	return normalizeTrimmedString(resolveSearxngWebSearchConfig(config)?.language);
}
//#endregion
//#region extensions/searxng/src/searxng-client.ts
const DEFAULT_TIMEOUT_SECONDS = 20;
const MAX_RESPONSE_BYTES = 1e6;
const SEARXNG_SEARCH_CACHE = /* @__PURE__ */ new Map();
function normalizeSearxngResult(value) {
	if (!value || typeof value !== "object") return null;
	const candidate = value;
	if (typeof candidate.url !== "string" || typeof candidate.title !== "string") return null;
	return {
		url: candidate.url,
		title: candidate.title,
		content: typeof candidate.content === "string" ? candidate.content : void 0
	};
}
function buildSearxngSearchUrl(params) {
	const url = new URL(params.baseUrl);
	url.pathname = url.pathname.endsWith("/") ? `${url.pathname}search` : `${url.pathname}/search`;
	url.search = "";
	url.searchParams.set("q", params.query);
	url.searchParams.set("format", "json");
	if (params.categories) url.searchParams.set("categories", params.categories);
	if (params.language) url.searchParams.set("language", params.language);
	return url.toString();
}
async function validateSearxngBaseUrl(baseUrl, lookupFn) {
	let parsed;
	try {
		parsed = new URL(baseUrl);
	} catch {
		throw new Error("SearXNG base URL must be a valid http:// or https:// URL.");
	}
	if (parsed.protocol !== "http:" && parsed.protocol !== "https:") throw new Error("SearXNG base URL must use http:// or https://.");
	if (parsed.protocol === "http:") await assertHttpUrlTargetsPrivateNetwork(parsed.toString(), {
		dangerouslyAllowPrivateNetwork: true,
		lookupFn,
		errorMessage: "SearXNG HTTP base URL must target a trusted private or loopback host. Use https:// for public hosts."
	});
}
function parseSearxngResponseText(text, count) {
	let parsed;
	try {
		parsed = JSON.parse(text);
	} catch {
		throw new Error("SearXNG returned invalid JSON.");
	}
	if (!parsed || typeof parsed !== "object") return [];
	const response = parsed;
	const rawResults = Array.isArray(response.results) ? response.results : [];
	const results = [];
	for (const rawResult of rawResults) {
		const result = normalizeSearxngResult(rawResult);
		if (result) results.push(result);
		if (results.length >= count) break;
	}
	return results;
}
async function runSearxngSearch(params) {
	const count = resolveSearchCount(params.count, 5);
	const categories = params.categories ?? resolveSearxngCategories(params.config);
	const language = params.language ?? resolveSearxngLanguage(params.config);
	const baseUrl = params.baseUrl ?? resolveSearxngBaseUrl(params.config);
	const timeoutSeconds = resolveTimeoutSeconds(params.timeoutSeconds, DEFAULT_TIMEOUT_SECONDS);
	const cacheTtlMs = resolveCacheTtlMs(params.cacheTtlMinutes, 15);
	if (!baseUrl) throw new Error("SearXNG base URL is not configured. Set SEARXNG_BASE_URL or configure plugins.entries.searxng.config.webSearch.baseUrl.");
	await validateSearxngBaseUrl(baseUrl);
	const cacheKey = normalizeCacheKey(JSON.stringify({
		provider: "searxng",
		query: params.query,
		count,
		categories: categories ?? "",
		language: language ?? "",
		baseUrl
	}));
	const cached = readCache(SEARXNG_SEARCH_CACHE, cacheKey);
	if (cached) return {
		...cached.value,
		cached: true
	};
	const url = buildSearxngSearchUrl({
		baseUrl,
		query: params.query,
		categories,
		language
	});
	const startedAt = Date.now();
	const results = await withTrustedWebSearchEndpoint({
		url,
		timeoutSeconds,
		init: {
			method: "GET",
			headers: { Accept: "application/json" }
		}
	}, async (response) => {
		if (!response.ok) {
			const detail = (await readResponseText(response, { maxBytes: 64e3 })).text;
			throw new Error(`SearXNG search error (${response.status}): ${detail || response.statusText}`);
		}
		const body = await readResponseText(response, { maxBytes: MAX_RESPONSE_BYTES });
		if (body.truncated) throw new Error("SearXNG response too large.");
		return parseSearxngResponseText(body.text, count);
	});
	const payload = {
		query: params.query,
		provider: "searxng",
		count: results.length,
		tookMs: Date.now() - startedAt,
		externalContent: {
			untrusted: true,
			source: "web_search",
			provider: "searxng",
			wrapped: true
		},
		results: results.map((result) => ({
			title: wrapWebContent(result.title, "web_search"),
			url: result.url,
			snippet: result.content ? wrapWebContent(result.content, "web_search") : "",
			siteName: resolveSiteName(result.url) || void 0
		}))
	};
	writeCache(SEARXNG_SEARCH_CACHE, cacheKey, payload, cacheTtlMs);
	return payload;
}
//#endregion
//#region extensions/searxng/src/searxng-search-provider.ts
const SearxngSearchSchema = Type.Object({
	query: Type.String({ description: "Search query string." }),
	count: Type.Optional(Type.Number({
		description: "Number of results to return (1-10).",
		minimum: 1,
		maximum: 10
	})),
	categories: Type.Optional(Type.String({ description: "Optional comma-separated search categories such as general, news, or science." })),
	language: Type.Optional(Type.String({ description: "Optional language code for results such as en, de, or fr." }))
}, { additionalProperties: false });
function createSearxngWebSearchProvider() {
	return {
		id: "searxng",
		label: "SearXNG Search",
		hint: "Self-hosted meta-search with no API key required",
		onboardingScopes: ["text-inference"],
		requiresCredential: true,
		credentialLabel: "SearXNG Base URL",
		envVars: ["SEARXNG_BASE_URL"],
		placeholder: "http://localhost:8080",
		signupUrl: "https://docs.searxng.org/",
		autoDetectOrder: 200,
		credentialPath: "plugins.entries.searxng.config.webSearch.baseUrl",
		inactiveSecretPaths: ["plugins.entries.searxng.config.webSearch.baseUrl"],
		getCredentialValue: (searchConfig) => getScopedCredentialValue(searchConfig, "searxng"),
		setCredentialValue: (searchConfigTarget, value) => setScopedCredentialValue(searchConfigTarget, "searxng", value),
		getConfiguredCredentialValue: (config) => resolveProviderWebSearchPluginConfig(config, "searxng")?.baseUrl,
		setConfiguredCredentialValue: (configTarget, value) => {
			setProviderWebSearchPluginConfigValue(configTarget, "searxng", "baseUrl", value);
		},
		applySelectionConfig: (config) => enablePluginInConfig(config, "searxng").config,
		createTool: (ctx) => ({
			description: "Search the web using a self-hosted SearXNG instance. Returns titles, URLs, and snippets.",
			parameters: SearxngSearchSchema,
			execute: async (args) => await runSearxngSearch({
				config: ctx.config,
				query: readStringParam(args, "query", { required: true }),
				count: readNumberParam(args, "count", { integer: true }),
				categories: readStringParam(args, "categories"),
				language: readStringParam(args, "language")
			})
		})
	};
}
//#endregion
export { createSearxngWebSearchProvider as t };
