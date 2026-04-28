import { c as isRecord } from "./utils-DvkbxKCZ.js";
import "./tool-config-shared-CmnZ6od1.js";
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
export { setPluginXSearchConfigValue as n, resolveEffectiveXSearchConfig as t };
