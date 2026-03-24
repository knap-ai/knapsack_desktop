import { n as normalizeXaiModelId } from "./model-id-normalization-ClJ_-LQt.js";
import { d as readNumberParam, h as readStringParam } from "./common-zReYuoMM.js";
import { F as normalizeCacheKey, I as readCache, R as resolveCacheTtlMs, V as writeCache, a as getScopedCredentialValue, b as postTrustedWebToolsJson, i as resolveWebSearchProviderCredential, u as setScopedCredentialValue, z as resolveTimeoutSeconds } from "./provider-web-search-COZNygbd.js";
import { c as wrapWebContent } from "./external-content-DZI9vlJn.js";
import { Type } from "@sinclair/typebox";
//#region extensions/xai/src/web-search-shared.ts
const XAI_WEB_SEARCH_ENDPOINT = "https://api.x.ai/v1/responses";
const XAI_DEFAULT_WEB_SEARCH_MODEL = "grok-4-1-fast";
function buildXaiWebSearchPayload(params) {
	return {
		query: params.query,
		provider: params.provider,
		model: params.model,
		tookMs: params.tookMs,
		externalContent: {
			untrusted: true,
			source: "web_search",
			provider: params.provider,
			wrapped: true
		},
		content: wrapWebContent(params.content, "web_search"),
		citations: params.citations,
		...params.inlineCitations ? { inlineCitations: params.inlineCitations } : {}
	};
}
function asRecord(value) {
	return value && typeof value === "object" && !Array.isArray(value) ? value : void 0;
}
function resolveXaiSearchConfig(searchConfig) {
	return asRecord(searchConfig?.grok) ?? {};
}
function resolveXaiWebSearchModel(searchConfig) {
	const config = resolveXaiSearchConfig(searchConfig);
	return typeof config.model === "string" && config.model.trim() ? normalizeXaiModelId(config.model.trim()) : XAI_DEFAULT_WEB_SEARCH_MODEL;
}
function resolveXaiInlineCitations(searchConfig) {
	return resolveXaiSearchConfig(searchConfig).inlineCitations === true;
}
function extractXaiWebSearchContent(data) {
	for (const output of data.output ?? []) {
		if (output.type === "message") {
			for (const block of output.content ?? []) if (block.type === "output_text" && typeof block.text === "string" && block.text) {
				const urls = (block.annotations ?? []).filter((annotation) => annotation.type === "url_citation" && typeof annotation.url === "string").map((annotation) => annotation.url);
				return {
					text: block.text,
					annotationCitations: [...new Set(urls)]
				};
			}
		}
		if (output.type === "output_text" && typeof output.text === "string" && output.text) {
			const urls = (output.annotations ?? []).filter((annotation) => annotation.type === "url_citation" && typeof annotation.url === "string").map((annotation) => annotation.url);
			return {
				text: output.text,
				annotationCitations: [...new Set(urls)]
			};
		}
	}
	return {
		text: typeof data.output_text === "string" ? data.output_text : void 0,
		annotationCitations: []
	};
}
async function requestXaiWebSearch(params) {
	return await postTrustedWebToolsJson({
		url: XAI_WEB_SEARCH_ENDPOINT,
		timeoutSeconds: params.timeoutSeconds,
		apiKey: params.apiKey,
		body: {
			model: params.model,
			input: [{
				role: "user",
				content: params.query
			}],
			tools: [{ type: "web_search" }]
		},
		errorLabel: "xAI"
	}, async (response) => {
		const data = await response.json();
		const { text, annotationCitations } = extractXaiWebSearchContent(data);
		const citations = Array.isArray(data.citations) && data.citations.length > 0 ? data.citations : annotationCitations;
		return {
			content: text ?? "No response",
			citations,
			inlineCitations: params.inlineCitations && Array.isArray(data.inline_citations) ? data.inline_citations : void 0
		};
	});
}
//#endregion
//#region extensions/xai/web-search.ts
const XAI_WEB_SEARCH_CACHE = /* @__PURE__ */ new Map();
function runXaiWebSearch(params) {
	const cacheKey = normalizeCacheKey(`grok:${params.model}:${String(params.inlineCitations)}:${params.query}`);
	const cached = readCache(XAI_WEB_SEARCH_CACHE, cacheKey);
	if (cached) return Promise.resolve({
		...cached.value,
		cached: true
	});
	return (async () => {
		const startedAt = Date.now();
		const result = await requestXaiWebSearch({
			query: params.query,
			model: params.model,
			apiKey: params.apiKey,
			timeoutSeconds: params.timeoutSeconds,
			inlineCitations: params.inlineCitations
		});
		const payload = buildXaiWebSearchPayload({
			query: params.query,
			provider: "grok",
			model: params.model,
			tookMs: Date.now() - startedAt,
			content: result.content,
			citations: result.citations,
			inlineCitations: result.inlineCitations
		});
		writeCache(XAI_WEB_SEARCH_CACHE, cacheKey, payload, params.cacheTtlMs);
		return payload;
	})();
}
function createXaiWebSearchProvider() {
	return {
		id: "grok",
		label: "Grok (xAI)",
		hint: "Requires xAI API key · xAI web-grounded responses",
		credentialLabel: "xAI API key",
		envVars: ["XAI_API_KEY"],
		placeholder: "xai-...",
		signupUrl: "https://console.x.ai/",
		docsUrl: "https://docs.openclaw.ai/tools/web",
		autoDetectOrder: 30,
		credentialPath: "plugins.entries.xai.config.webSearch.apiKey",
		inactiveSecretPaths: ["plugins.entries.xai.config.webSearch.apiKey"],
		getCredentialValue: (searchConfig) => getScopedCredentialValue(searchConfig, "grok"),
		setCredentialValue: (searchConfigTarget, value) => setScopedCredentialValue(searchConfigTarget, "grok", value),
		createTool: (ctx) => ({
			description: "Search the web using xAI Grok. Returns AI-synthesized answers with citations from real-time web search.",
			parameters: Type.Object({
				query: Type.String({ description: "Search query string." }),
				count: Type.Optional(Type.Number({
					description: "Number of results to return (1-10).",
					minimum: 1,
					maximum: 10
				}))
			}),
			execute: async (args) => {
				const apiKey = resolveWebSearchProviderCredential({
					credentialValue: getScopedCredentialValue(ctx.searchConfig, "grok"),
					path: "tools.web.search.grok.apiKey",
					envVars: ["XAI_API_KEY"]
				});
				if (!apiKey) return {
					error: "missing_xai_api_key",
					message: "web_search (grok) needs an xAI API key. Set XAI_API_KEY in the Gateway environment, or configure plugins.entries.xai.config.webSearch.apiKey.",
					docs: "https://docs.openclaw.ai/tools/web"
				};
				const query = readStringParam(args, "query", { required: true });
				readNumberParam(args, "count", { integer: true });
				return await runXaiWebSearch({
					query,
					model: resolveXaiWebSearchModel(ctx.searchConfig),
					apiKey,
					timeoutSeconds: resolveTimeoutSeconds(ctx.searchConfig?.timeoutSeconds ?? void 0, 30),
					inlineCitations: resolveXaiInlineCitations(ctx.searchConfig),
					cacheTtlMs: resolveCacheTtlMs(ctx.searchConfig?.cacheTtlMinutes ?? void 0, 15)
				});
			}
		})
	};
}
const __testing = {
	buildXaiWebSearchPayload,
	extractXaiWebSearchContent,
	resolveXaiInlineCitations,
	resolveXaiWebSearchModel,
	requestXaiWebSearch
};
//#endregion
export { createXaiWebSearchProvider as n, __testing as t };
