import { i as coerceSecretRef, l as normalizeSecretInputString } from "../../types.secrets-DTXJhyWe.js";
import { m as resolveNonEnvSecretRefApiKeyMarker } from "../../model-auth-markers-BjPX15EF.js";
import { o as resolveProviderWebSearchPluginConfig } from "../../provider-web-search-BvBfxXst.js";
import "../../secret-input-C8U7qpTM.js";
import "../../provider-auth-rTeK2_Yu.js";
import { t as defineSingleProviderPluginEntry } from "../../provider-entry-BnIQWKLx.js";
import { r as createToolStreamWrapper } from "../../provider-stream-D_iORY-e.js";
import { t as buildXaiProvider } from "../../provider-catalog-BK0ohwR_.js";
import { n as applyXaiConfig, t as XAI_DEFAULT_MODEL_REF } from "../../onboard-CaJD-Ao-.js";
import { a as resolveXaiTransport, c as resolveXaiForwardCompatModel, i as resolveXaiModelCompatPatch, o as shouldContributeXaiCompat, r as applyXaiModelCompat, s as isModernXaiModel } from "../../api-BxiD-3Ux.js";
import { t as normalizeXaiModelId } from "../../model-id-CIBZa1lG.js";
import { t as createCodeExecutionTool } from "../../code-execution-B3-P50Kg.js";
import { n as createXaiToolCallArgumentDecodingWrapper, r as createXaiToolPayloadCompatibilityWrapper, t as createXaiFastModeWrapper } from "../../stream-Cyyg1UrL.js";
import { n as createXaiWebSearchProvider } from "../../web-search-72j67XkQ.js";
import { t as createXSearchTool } from "../../x-search-6OqhuZul.js";
//#region extensions/xai/index.ts
const PROVIDER_ID = "xai";
function readConfiguredOrManagedApiKey(value) {
	const literal = normalizeSecretInputString(value);
	if (literal) return literal;
	const ref = coerceSecretRef(value);
	return ref ? resolveNonEnvSecretRefApiKeyMarker(ref.source) : void 0;
}
function readLegacyGrokFallback(config) {
	const tools = config.tools;
	if (!tools || typeof tools !== "object") return;
	const web = tools.web;
	if (!web || typeof web !== "object") return;
	const search = web.search;
	if (!search || typeof search !== "object") return;
	const grok = search.grok;
	if (!grok || typeof grok !== "object") return;
	const apiKey = readConfiguredOrManagedApiKey(grok.apiKey);
	return apiKey ? {
		apiKey,
		source: "tools.web.search.grok.apiKey"
	} : void 0;
}
function resolveXaiProviderFallbackAuth(config) {
	if (!config || typeof config !== "object") return;
	const record = config;
	const pluginApiKey = readConfiguredOrManagedApiKey(resolveProviderWebSearchPluginConfig(record, PROVIDER_ID)?.apiKey);
	if (pluginApiKey) return {
		apiKey: pluginApiKey,
		source: "plugins.entries.xai.config.webSearch.apiKey"
	};
	return readLegacyGrokFallback(record);
}
var xai_default = defineSingleProviderPluginEntry({
	id: "xai",
	name: "xAI Plugin",
	description: "Bundled xAI plugin",
	provider: {
		label: "xAI",
		aliases: ["x-ai"],
		docsPath: "/providers/xai",
		auth: [{
			methodId: "api-key",
			label: "xAI API key",
			hint: "API key",
			optionKey: "xaiApiKey",
			flagName: "--xai-api-key",
			envVar: "XAI_API_KEY",
			promptMessage: "Enter xAI API key",
			defaultModel: XAI_DEFAULT_MODEL_REF,
			applyConfig: (cfg) => applyXaiConfig(cfg),
			wizard: { groupLabel: "xAI (Grok)" }
		}],
		catalog: { buildProvider: buildXaiProvider },
		prepareExtraParams: (ctx) => {
			if (ctx.extraParams?.tool_stream !== void 0) return ctx.extraParams;
			return {
				...ctx.extraParams,
				tool_stream: true
			};
		},
		wrapStreamFn: (ctx) => {
			let streamFn = createXaiToolPayloadCompatibilityWrapper(ctx.streamFn);
			if (typeof ctx.extraParams?.fastMode === "boolean") streamFn = createXaiFastModeWrapper(streamFn, ctx.extraParams.fastMode);
			streamFn = createXaiToolCallArgumentDecodingWrapper(streamFn);
			return createToolStreamWrapper(streamFn, ctx.extraParams?.tool_stream !== false);
		},
		resolveSyntheticAuth: ({ config }) => {
			const fallbackAuth = resolveXaiProviderFallbackAuth(config);
			if (!fallbackAuth) return;
			return {
				apiKey: fallbackAuth.apiKey,
				source: fallbackAuth.source,
				mode: "api-key"
			};
		},
		normalizeResolvedModel: ({ model }) => applyXaiModelCompat(model),
		normalizeTransport: ({ provider, api, baseUrl }) => resolveXaiTransport({
			provider,
			api,
			baseUrl
		}),
		contributeResolvedModelCompat: ({ modelId, model }) => shouldContributeXaiCompat({
			modelId,
			model
		}) ? resolveXaiModelCompatPatch() : void 0,
		normalizeModelId: ({ modelId }) => normalizeXaiModelId(modelId),
		resolveDynamicModel: (ctx) => resolveXaiForwardCompatModel({
			providerId: PROVIDER_ID,
			ctx
		}),
		isModernModelRef: ({ modelId }) => isModernXaiModel(modelId)
	},
	register(api) {
		api.registerWebSearchProvider(createXaiWebSearchProvider());
		api.registerTool((ctx) => createCodeExecutionTool({
			config: ctx.config,
			runtimeConfig: ctx.runtimeConfig
		}), { name: "code_execution" });
		api.registerTool((ctx) => createXSearchTool({
			config: ctx.config,
			runtimeConfig: ctx.runtimeConfig
		}), { name: "x_search" });
	}
});
//#endregion
export { xai_default as default };
