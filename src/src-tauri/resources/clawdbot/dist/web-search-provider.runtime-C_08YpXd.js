import { l as isRecord } from "./utils-BMRcljdi.js";
import { t as formatCliCommand } from "./command-format-BFuugklF.js";
import { f as readNumberParam, g as readStringParam } from "./common-B4WrK_Ib.js";
import { a as wrapWebContent } from "./external-content-BNyMCWFo.js";
import { i as readCache, l as writeCache, o as resolveCacheTtlMs, r as normalizeCacheKey, s as resolveTimeoutSeconds } from "./web-shared-I_0Jr7ES.js";
import { u as postTrustedWebToolsJson } from "./web-search-provider-common-R-M-_9hO.js";
import { i as resolveProviderWebSearchPluginConfig, r as mergeScopedSearchConfig, t as getScopedCredentialValue } from "./web-search-provider-config-OljE13lA.js";
import { n as resolveWebSearchProviderCredential } from "./provider-web-search-DiAvE6oC.js";
import { t as normalizeXaiModelId } from "./model-id-DnbLdbzT.js";
import "./tool-config-shared-BHuW7jcw.js";
import { n as setPluginXSearchConfigValue, t as resolveEffectiveXSearchConfig } from "./x-search-config-BoH5v_CJ.js";
import { a as resolveXaiResponseTextCitationsAndInline, n as buildXaiResponsesToolBody, r as extractXaiWebSearchContent, t as XAI_RESPONSES_ENDPOINT } from "./responses-tool-shared-CzT0bOjp.js";
import { t as XAI_DEFAULT_X_SEARCH_MODEL } from "./x-search-shared-DzteBbt1.js";
//#region extensions/xai/src/web-search-shared.ts
const XAI_WEB_SEARCH_ENDPOINT = XAI_RESPONSES_ENDPOINT;
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
function resolveXaiSearchConfig(searchConfig) {
	return (isRecord(searchConfig?.grok) ? searchConfig.grok : void 0) ?? {};
}
function resolveXaiWebSearchModel(searchConfig) {
	const config = resolveXaiSearchConfig(searchConfig);
	return typeof config.model === "string" && config.model.trim() ? normalizeXaiModelId(config.model.trim()) : XAI_DEFAULT_WEB_SEARCH_MODEL;
}
function resolveXaiInlineCitations(searchConfig) {
	return resolveXaiSearchConfig(searchConfig).inlineCitations === true;
}
async function requestXaiWebSearch(params) {
	return await postTrustedWebToolsJson({
		url: XAI_WEB_SEARCH_ENDPOINT,
		timeoutSeconds: params.timeoutSeconds,
		apiKey: params.apiKey,
		body: buildXaiResponsesToolBody({
			model: params.model,
			inputText: params.query,
			tools: [{ type: "web_search" }]
		}),
		errorLabel: "xAI"
	}, async (response) => {
		return resolveXaiResponseTextCitationsAndInline(await response.json(), params.inlineCitations);
	});
}
//#endregion
//#region extensions/xai/src/web-search-provider.runtime.ts
const XAI_WEB_SEARCH_CACHE = /* @__PURE__ */ new Map();
const X_SEARCH_MODEL_OPTIONS = [{
	value: XAI_DEFAULT_X_SEARCH_MODEL,
	label: XAI_DEFAULT_X_SEARCH_MODEL,
	hint: "default · fast, no reasoning"
}, {
	value: "grok-4-1-fast",
	label: "grok-4-1-fast",
	hint: "fast with reasoning"
}];
function resolveXSearchConfigRecord(config) {
	return resolveEffectiveXSearchConfig(config);
}
async function runXaiSearchProviderSetup(ctx) {
	const existingXSearch = resolveXSearchConfigRecord(ctx.config);
	if (existingXSearch?.enabled === false) return ctx.config;
	await ctx.prompter.note([
		"x_search lets your agent search X (formerly Twitter) posts via xAI.",
		"It reuses the same xAI API key you just configured for Grok web search.",
		`You can change this later with ${formatCliCommand("openclaw configure --section web")}.`
	].join("\n"), "X search");
	if (await ctx.prompter.select({
		message: "Enable x_search too?",
		options: [{
			value: "yes",
			label: "Yes, enable x_search",
			hint: "Search X posts with the same xAI key"
		}, {
			value: "skip",
			label: "Skip for now",
			hint: "Keep Grok web_search only"
		}],
		initialValue: existingXSearch?.enabled === true || ctx.quickstartDefaults ? "yes" : "skip"
	}) === "skip") return ctx.config;
	const existingModel = typeof existingXSearch?.model === "string" && existingXSearch.model.trim() ? existingXSearch.model.trim() : "";
	const knownModel = X_SEARCH_MODEL_OPTIONS.find((entry) => entry.value === existingModel)?.value;
	const modelPick = await ctx.prompter.select({
		message: "Grok model for x_search",
		options: [...X_SEARCH_MODEL_OPTIONS, {
			value: "__custom__",
			label: "Enter custom model name",
			hint: ""
		}],
		initialValue: knownModel ?? "grok-4-1-fast-non-reasoning"
	});
	let model = modelPick;
	if (modelPick === "__custom__") model = (await ctx.prompter.text({
		message: "Custom Grok model name",
		initialValue: existingModel || "grok-4-1-fast-non-reasoning",
		placeholder: "grok-4-1-fast-non-reasoning"
	})).trim() || "grok-4-1-fast-non-reasoning";
	const next = structuredClone(ctx.config);
	setPluginXSearchConfigValue(next, "enabled", true);
	setPluginXSearchConfigValue(next, "model", model || "grok-4-1-fast-non-reasoning");
	return next;
}
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
function resolveXaiToolSearchConfig(ctx) {
	return mergeScopedSearchConfig(ctx.searchConfig, "grok", resolveProviderWebSearchPluginConfig(ctx.config, "xai"));
}
function resolveXaiWebSearchCredential(searchConfig) {
	return resolveWebSearchProviderCredential({
		credentialValue: getScopedCredentialValue(searchConfig, "grok"),
		path: "tools.web.search.grok.apiKey",
		envVars: ["XAI_API_KEY"]
	});
}
async function executeXaiWebSearchProviderTool(ctx, args) {
	const searchConfig = resolveXaiToolSearchConfig(ctx);
	const apiKey = resolveXaiWebSearchCredential(searchConfig);
	if (!apiKey) return {
		error: "missing_xai_api_key",
		message: "web_search (grok) needs an xAI API key. Set XAI_API_KEY in the Gateway environment, or configure plugins.entries.xai.config.webSearch.apiKey.",
		docs: "https://docs.openclaw.ai/tools/web"
	};
	const query = readStringParam(args, "query", { required: true });
	readNumberParam(args, "count", { integer: true });
	return await runXaiWebSearch({
		query,
		model: resolveXaiWebSearchModel(searchConfig),
		apiKey,
		timeoutSeconds: resolveTimeoutSeconds(searchConfig?.timeoutSeconds, 30),
		inlineCitations: resolveXaiInlineCitations(searchConfig),
		cacheTtlMs: resolveCacheTtlMs(searchConfig?.cacheTtlMinutes, 15)
	});
}
const __testing = {
	buildXaiWebSearchPayload,
	extractXaiWebSearchContent,
	resolveXaiToolSearchConfig,
	resolveXaiInlineCitations,
	resolveXaiWebSearchCredential,
	resolveXaiWebSearchModel,
	requestXaiWebSearch
};
//#endregion
export { executeXaiWebSearchProviderTool as n, runXaiSearchProviderSetup as r, __testing as t };
