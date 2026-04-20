import { l as isRecord } from "./utils-D5DtWkEu.js";
import { a as wrapWebContent } from "./external-content-Ds7ZVhiZ.js";
import { u as postTrustedWebToolsJson } from "./web-search-provider-common-EFbs_Gas.js";
import "./provider-web-search-B6Xg-MPv.js";
import { n as resolveNormalizedXaiToolModel, r as resolvePositiveIntegerToolConfig, t as coerceXaiToolConfig } from "./tool-config-shared-DY2e2EAe.js";
import { a as resolveXaiResponseTextCitationsAndInline, n as buildXaiResponsesToolBody, t as XAI_RESPONSES_ENDPOINT } from "./responses-tool-shared-Bw7IEztF.js";
//#region extensions/xai/src/x-search-config.ts
function cloneRecord(value) {
	if (!value) return value;
	return { ...value };
}
function resolveLegacyXSearchConfig(config) {
	const xSearch = (config?.tools?.web)?.x_search;
	return isRecord(xSearch) ? cloneRecord(xSearch) : void 0;
}
function resolvePluginXSearchConfig(config) {
	const pluginConfig = config?.plugins?.entries?.xai?.config;
	if (!isRecord(pluginConfig?.xSearch)) return;
	return cloneRecord(pluginConfig.xSearch);
}
function resolveEffectiveXSearchConfig(config) {
	const legacy = resolveLegacyXSearchConfig(config);
	const pluginOwned = resolvePluginXSearchConfig(config);
	if (!legacy) return pluginOwned;
	if (!pluginOwned) return legacy;
	return {
		...legacy,
		...pluginOwned
	};
}
function setPluginXSearchConfigValue(configTarget, key, value) {
	const plugins = configTarget.plugins ??= {};
	const entries = plugins.entries ??= {};
	const entry = entries.xai ??= {};
	const config = entry.config ??= {};
	const xSearch = config.xSearch ??= {};
	xSearch[key] = value;
}
//#endregion
//#region extensions/xai/src/x-search-shared.ts
const XAI_X_SEARCH_ENDPOINT = XAI_RESPONSES_ENDPOINT;
const XAI_DEFAULT_X_SEARCH_MODEL = "grok-4-1-fast-non-reasoning";
function resolveXaiXSearchConfig(config) {
	return coerceXaiToolConfig(config);
}
function resolveXaiXSearchModel(config) {
	return resolveNormalizedXaiToolModel({
		config,
		defaultModel: XAI_DEFAULT_X_SEARCH_MODEL
	});
}
function resolveXaiXSearchInlineCitations(config) {
	return resolveXaiXSearchConfig(config).inlineCitations === true;
}
function resolveXaiXSearchMaxTurns(config) {
	return resolvePositiveIntegerToolConfig(config, "maxTurns");
}
function buildXSearchTool(options) {
	return {
		type: "x_search",
		...options.allowedXHandles?.length ? { allowed_x_handles: options.allowedXHandles } : {},
		...options.excludedXHandles?.length ? { excluded_x_handles: options.excludedXHandles } : {},
		...options.fromDate ? { from_date: options.fromDate } : {},
		...options.toDate ? { to_date: options.toDate } : {},
		...options.enableImageUnderstanding ? { enable_image_understanding: true } : {},
		...options.enableVideoUnderstanding ? { enable_video_understanding: true } : {}
	};
}
function buildXaiXSearchPayload(params) {
	return {
		query: params.query,
		provider: "xai",
		model: params.model,
		tookMs: params.tookMs,
		externalContent: {
			untrusted: true,
			source: "x_search",
			provider: "xai",
			wrapped: true
		},
		content: wrapWebContent(params.content, "web_search"),
		citations: params.citations,
		...params.inlineCitations ? { inlineCitations: params.inlineCitations } : {},
		...params.options?.allowedXHandles?.length ? { allowedXHandles: params.options.allowedXHandles } : {},
		...params.options?.excludedXHandles?.length ? { excludedXHandles: params.options.excludedXHandles } : {},
		...params.options?.fromDate ? { fromDate: params.options.fromDate } : {},
		...params.options?.toDate ? { toDate: params.options.toDate } : {},
		...params.options?.enableImageUnderstanding ? { enableImageUnderstanding: true } : {},
		...params.options?.enableVideoUnderstanding ? { enableVideoUnderstanding: true } : {}
	};
}
async function requestXaiXSearch(params) {
	return await postTrustedWebToolsJson({
		url: XAI_X_SEARCH_ENDPOINT,
		timeoutSeconds: params.timeoutSeconds,
		apiKey: params.apiKey,
		body: buildXaiResponsesToolBody({
			model: params.model,
			inputText: params.options.query,
			tools: [buildXSearchTool(params.options)],
			maxTurns: params.maxTurns
		}),
		errorLabel: "xAI"
	}, async (response) => {
		return resolveXaiResponseTextCitationsAndInline(await response.json(), params.inlineCitations);
	});
}
//#endregion
export { resolveXaiXSearchMaxTurns as a, setPluginXSearchConfigValue as c, resolveXaiXSearchInlineCitations as i, buildXaiXSearchPayload as n, resolveXaiXSearchModel as o, requestXaiXSearch as r, resolveEffectiveXSearchConfig as s, XAI_DEFAULT_X_SEARCH_MODEL as t };
