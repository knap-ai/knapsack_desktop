import { t as sanitizeForLog } from "./ansi-Dqm1lzVL.js";
import { c as resolveEffectivePluginActivationState, o as normalizePluginsConfig } from "./config-state-Bw_lAn0M.js";
import { n as loadPluginManifestRegistryForPluginRegistry } from "./plugin-registry-CZ8QXP5l.js";
import { d as listExplicitConfiguredChannelIdsForConfig } from "./channel-plugin-ids-BLUq4AzU.js";
//#region src/commands/doctor/shared/channel-plugin-blockers.ts
function hasExplicitChannelPluginBlockerConfig(cfg) {
	if (cfg.plugins?.enabled === false) return true;
	const entries = cfg.plugins?.entries;
	if (!entries || typeof entries !== "object") return false;
	return Object.values(entries).some((entry) => {
		return entry && typeof entry === "object" && !Array.isArray(entry) && "enabled" in entry && entry.enabled === false;
	});
}
function scanConfiguredChannelPluginBlockers(cfg, env = process.env) {
	if (!hasExplicitChannelPluginBlockerConfig(cfg)) return [];
	const configuredChannelIds = new Set(listExplicitConfiguredChannelIdsForConfig(cfg));
	if (configuredChannelIds.size === 0) return [];
	const pluginsConfig = normalizePluginsConfig(cfg.plugins);
	const registry = loadPluginManifestRegistryForPluginRegistry({
		config: cfg,
		env,
		includeDisabled: true
	});
	const hits = [];
	for (const plugin of registry.plugins) {
		if (plugin.channels.length === 0) continue;
		const activationState = resolveEffectivePluginActivationState({
			id: plugin.id,
			origin: plugin.origin,
			config: pluginsConfig,
			rootConfig: cfg,
			enabledByDefault: plugin.enabledByDefault
		});
		if (activationState.activated || !activationState.reason || activationState.reason !== "disabled in config" && activationState.reason !== "plugins disabled") continue;
		for (const channelId of plugin.channels) {
			if (!configuredChannelIds.has(channelId)) continue;
			hits.push({
				channelId,
				pluginId: plugin.id,
				reason: activationState.reason
			});
		}
	}
	return hits;
}
function formatReason(hit) {
	if (hit.reason === "disabled in config") return `plugin "${sanitizeForLog(hit.pluginId)}" is disabled by plugins.entries.${sanitizeForLog(hit.pluginId)}.enabled=false.`;
	if (hit.reason === "plugins disabled") return `plugins.enabled=false blocks channel plugins globally.`;
	return `plugin "${sanitizeForLog(hit.pluginId)}" is not loadable (${sanitizeForLog(hit.reason)}).`;
}
function collectConfiguredChannelPluginBlockerWarnings(hits) {
	return hits.map((hit) => `- channels.${sanitizeForLog(hit.channelId)}: channel is configured, but ${formatReason(hit)} Fix plugin enablement before relying on setup guidance for this channel.`);
}
function isWarningBlockedByChannelPlugin(warning, hits) {
	return hits.some((hit) => {
		const prefix = `channels.${sanitizeForLog(hit.channelId)}`;
		return warning.includes(`${prefix}:`) || warning.includes(`${prefix}.`);
	});
}
//#endregion
export { collectConfiguredChannelPluginBlockerWarnings, isWarningBlockedByChannelPlugin, scanConfiguredChannelPluginBlockers };
