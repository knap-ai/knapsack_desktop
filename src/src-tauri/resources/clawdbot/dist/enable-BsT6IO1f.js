import { r as normalizeChatChannelId } from "./ids-C5uBFLeA.js";
import { t as setPluginEnabledInConfig } from "./toggle-config-DABeGYsX.js";
//#region src/plugins/enable.ts
function enablePluginInConfig(cfg, pluginId, options = {}) {
	const resolvedId = normalizeChatChannelId(pluginId) ?? pluginId;
	if (cfg.plugins?.enabled === false) return {
		config: cfg,
		enabled: false,
		reason: "plugins disabled"
	};
	if (cfg.plugins?.deny?.includes(pluginId) || cfg.plugins?.deny?.includes(resolvedId)) return {
		config: cfg,
		enabled: false,
		reason: "blocked by denylist"
	};
	const allow = cfg.plugins?.allow;
	if (Array.isArray(allow) && allow.length > 0 && !allow.includes(pluginId) && !allow.includes(resolvedId)) return {
		config: cfg,
		enabled: false,
		reason: "blocked by allowlist"
	};
	return {
		config: setPluginEnabledInConfig(cfg, resolvedId, true, options),
		enabled: true
	};
}
//#endregion
export { enablePluginInConfig as t };
