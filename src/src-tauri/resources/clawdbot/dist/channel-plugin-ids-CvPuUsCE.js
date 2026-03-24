import { a as normalizePluginsConfig, o as resolveEffectiveEnableState } from "./config-state-Br0ucqMb.js";
import { n as loadPluginManifestRegistry } from "./manifest-registry-B5JNQdOM.js";
import { r as listPotentialConfiguredChannelIds } from "./config-presence-DA3j8Nmi.js";
//#region src/plugins/channel-plugin-ids.ts
function resolveChannelPluginIds(params) {
	return loadPluginManifestRegistry({
		config: params.config,
		workspaceDir: params.workspaceDir,
		env: params.env
	}).plugins.filter((plugin) => plugin.channels.length > 0).map((plugin) => plugin.id);
}
function resolveConfiguredChannelPluginIds(params) {
	const configuredChannelIds = new Set(listPotentialConfiguredChannelIds(params.config, params.env).map((id) => id.trim()));
	if (configuredChannelIds.size === 0) return [];
	return resolveChannelPluginIds(params).filter((pluginId) => configuredChannelIds.has(pluginId));
}
function resolveConfiguredDeferredChannelPluginIds(params) {
	const configuredChannelIds = new Set(listPotentialConfiguredChannelIds(params.config, params.env).map((id) => id.trim()));
	if (configuredChannelIds.size === 0) return [];
	return loadPluginManifestRegistry({
		config: params.config,
		workspaceDir: params.workspaceDir,
		env: params.env
	}).plugins.filter((plugin) => plugin.channels.some((channelId) => configuredChannelIds.has(channelId)) && plugin.startupDeferConfiguredChannelFullLoadUntilAfterListen === true).map((plugin) => plugin.id);
}
function resolveGatewayStartupPluginIds(params) {
	const configuredChannelIds = new Set(listPotentialConfiguredChannelIds(params.config, params.env).map((id) => id.trim()));
	const pluginsConfig = normalizePluginsConfig(params.config.plugins);
	return loadPluginManifestRegistry({
		config: params.config,
		workspaceDir: params.workspaceDir,
		env: params.env
	}).plugins.filter((plugin) => {
		if (plugin.channels.some((channelId) => configuredChannelIds.has(channelId))) return true;
		if (plugin.channels.length > 0) return false;
		if (!resolveEffectiveEnableState({
			id: plugin.id,
			origin: plugin.origin,
			config: pluginsConfig,
			rootConfig: params.config,
			enabledByDefault: plugin.enabledByDefault
		}).enabled) return false;
		if (plugin.origin !== "bundled") return true;
		return pluginsConfig.allow.includes(plugin.id) || pluginsConfig.entries[plugin.id]?.enabled === true || pluginsConfig.slots.memory === plugin.id;
	}).map((plugin) => plugin.id);
}
//#endregion
export { resolveGatewayStartupPluginIds as i, resolveConfiguredChannelPluginIds as n, resolveConfiguredDeferredChannelPluginIds as r, resolveChannelPluginIds as t };
