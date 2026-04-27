import "./types.secrets-Zn5Zyn7M.js";
import "./resolve-configured-secret-input-string-CbTtvIcl.js";
import "./io-Dv_xNAZB.js";
import "./agent-scope-_6dFncNS.js";
import "./paths-DvU8Tgvw.js";
import "./store-Bm25Mivo.js";
import "./reset-BjF1l1uy.js";
import "./session-key-BKBHc44r.js";
import "./markdown-tables-DPeXG03j.js";
import "./logging-BkeHTbB2.js";
import "./shared-BRpkDqTT.js";
import "./model-overrides-CMkd-jDt.js";
import "./commands-BZgXSI56.js";
import "./store-x8RlGnHR.js";
//#region src/plugin-sdk/config-runtime.ts
function requireRuntimeConfig(config, context) {
	if (config) return config;
	throw new Error(`${context} requires a resolved runtime config. Load and resolve config at the command or gateway boundary, then pass cfg through the runtime path.`);
}
function resolvePluginConfigObject(config, pluginId) {
	const plugins = config?.plugins && typeof config.plugins === "object" && !Array.isArray(config.plugins) ? config.plugins : void 0;
	const entry = (plugins?.entries && typeof plugins.entries === "object" && !Array.isArray(plugins.entries) ? plugins.entries : void 0)?.[pluginId];
	if (!entry || typeof entry !== "object" || Array.isArray(entry)) return;
	const pluginConfig = entry.config;
	return pluginConfig && typeof pluginConfig === "object" && !Array.isArray(pluginConfig) ? pluginConfig : void 0;
}
function resolveLivePluginConfigObject(runtimeConfigLoader, pluginId, startupPluginConfig) {
	if (typeof runtimeConfigLoader !== "function") return startupPluginConfig;
	return resolvePluginConfigObject(runtimeConfigLoader(), pluginId);
}
//#endregion
export { resolveLivePluginConfigObject as n, resolvePluginConfigObject as r, requireRuntimeConfig as t };
