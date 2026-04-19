import { l as isRecord } from "./utils-D5DtWkEu.js";
import "./text-runtime-DTMxvodz.js";
import { a as resolveBraveConfig, i as normalizeBraveLanguageParams, n as mapBraveLlmContextResults, o as resolveBraveMode, r as normalizeBraveCountry, t as createBraveSchema } from "./brave-web-search-provider.shared-XSSUBUbm.js";
//#region extensions/brave/src/brave-web-search-provider.ts
function resolveProviderWebSearchPluginConfig(config, pluginId) {
	if (!isRecord(config)) return;
	const plugins = isRecord(config.plugins) ? config.plugins : void 0;
	const entries = isRecord(plugins?.entries) ? plugins.entries : void 0;
	const entry = isRecord(entries?.[pluginId]) ? entries[pluginId] : void 0;
	const pluginConfig = isRecord(entry?.config) ? entry.config : void 0;
	return isRecord(pluginConfig?.webSearch) ? pluginConfig.webSearch : void 0;
}
function ensureObject(target, key) {
	const current = target[key];
	if (isRecord(current)) return current;
	const next = {};
	target[key] = next;
	return next;
}
function setProviderWebSearchPluginConfigValue(configTarget, pluginId, key, value) {
	const entry = ensureObject(ensureObject(ensureObject(configTarget, "plugins"), "entries"), pluginId);
	if (entry.enabled === void 0) entry.enabled = true;
	const webSearch = ensureObject(ensureObject(entry, "config"), "webSearch");
	webSearch[key] = value;
}
function setTopLevelCredentialValue(searchConfigTarget, value) {
	searchConfigTarget.apiKey = value;
}
function mergeScopedSearchConfig(searchConfig, key, pluginConfig, options) {
	if (!pluginConfig) return searchConfig;
	const currentScoped = isRecord(searchConfig?.[key]) ? searchConfig?.[key] : {};
	const next = {
		...searchConfig,
		[key]: {
			...currentScoped,
			...pluginConfig
		}
	};
	if (options?.mirrorApiKeyToTopLevel && pluginConfig.apiKey !== void 0) next.apiKey = pluginConfig.apiKey;
	return next;
}
function createBraveToolDefinition(searchConfig) {
	return {
		description: resolveBraveMode(resolveBraveConfig(searchConfig)) === "llm-context" ? "Search the web using Brave Search LLM Context API. Returns pre-extracted page content (text chunks, tables, code blocks) optimized for LLM grounding." : "Search the web using Brave Search API. Supports region-specific and localized search via country and language parameters. Returns titles, URLs, and snippets for fast research.",
		parameters: createBraveSchema(),
		execute: async (args) => {
			const { executeBraveSearch } = await import("./brave-web-search-provider.runtime-BA5CCUbh.js");
			return await executeBraveSearch(args, searchConfig);
		}
	};
}
function createBraveWebSearchProvider() {
	return {
		id: "brave",
		label: "Brave Search",
		hint: "Structured results · country/language/time filters",
		onboardingScopes: ["text-inference"],
		credentialLabel: "Brave Search API key",
		envVars: ["BRAVE_API_KEY"],
		placeholder: "BSA...",
		signupUrl: "https://brave.com/search/api/",
		docsUrl: "https://docs.openclaw.ai/brave-search",
		autoDetectOrder: 10,
		credentialPath: "plugins.entries.brave.config.webSearch.apiKey",
		inactiveSecretPaths: ["plugins.entries.brave.config.webSearch.apiKey"],
		getCredentialValue: (searchConfig) => searchConfig?.apiKey,
		setCredentialValue: setTopLevelCredentialValue,
		getConfiguredCredentialValue: (config) => resolveProviderWebSearchPluginConfig(config, "brave")?.apiKey,
		setConfiguredCredentialValue: (configTarget, value) => {
			setProviderWebSearchPluginConfigValue(configTarget, "brave", "apiKey", value);
		},
		createTool: (ctx) => createBraveToolDefinition(mergeScopedSearchConfig(ctx.searchConfig, "brave", resolveProviderWebSearchPluginConfig(ctx.config, "brave"), { mirrorApiKeyToTopLevel: true }))
	};
}
const __testing = {
	normalizeBraveCountry,
	normalizeBraveLanguageParams,
	resolveBraveMode,
	mapBraveLlmContextResults
};
//#endregion
export { createBraveWebSearchProvider as n, __testing as t };
