import { s as normalizeOptionalLowercaseString } from "./string-coerce-Bje8XVt9.js";
import { t as resolveBundledPluginsDir } from "./bundled-dir-DygrJuRr.js";
import { i as loadPluginManifest } from "./manifest-DkU_xlZi.js";
import { o as normalizePluginsConfig } from "./config-state-Bw_lAn0M.js";
import { r as listPotentialConfiguredChannelIds } from "./config-presence-D-WZXiRB.js";
import { t as applyPluginAutoEnable } from "./plugin-auto-enable-BlWaQbGq.js";
import { a as resolveGatewayStartupPluginIds, d as listExplicitConfiguredChannelIdsForConfig, f as resolveConfiguredChannelPluginIds } from "./channel-plugin-ids-BLUq4AzU.js";
import fs from "node:fs";
import path from "node:path";
//#region src/plugins/effective-plugin-ids.ts
function listExplicitlyDisabledChannelIds(config) {
	const channels = config.channels;
	if (!channels || typeof channels !== "object" || Array.isArray(channels)) return /* @__PURE__ */ new Set();
	return new Set(Object.entries(channels).filter(([, value]) => {
		return value && typeof value === "object" && !Array.isArray(value) && value.enabled === false;
	}).map(([channelId]) => normalizeOptionalLowercaseString(channelId)).filter((channelId) => Boolean(channelId)));
}
function collectConfiguredChannelIds(config, activationSourceConfig, env) {
	const disabled = new Set([...listExplicitlyDisabledChannelIds(config), ...listExplicitlyDisabledChannelIds(activationSourceConfig)]);
	return [...new Set([...listPotentialConfiguredChannelIds(config, env, { includePersistedAuthState: false }), ...listExplicitConfiguredChannelIdsForConfig(activationSourceConfig)])].map((channelId) => normalizeOptionalLowercaseString(channelId)).filter((channelId) => {
		if (!channelId) return false;
		return !disabled.has(channelId);
	}).toSorted((left, right) => left.localeCompare(right));
}
function collectBundledChannelOwnerPluginIds(params) {
	const channelIds = new Set(params.channelIds.map((channelId) => normalizeOptionalLowercaseString(channelId)).filter((channelId) => Boolean(channelId)));
	if (channelIds.size === 0) return [];
	const bundledDir = resolveBundledPluginsDir(params.env);
	if (!bundledDir) return [];
	let entries;
	try {
		entries = fs.readdirSync(bundledDir, { withFileTypes: true });
	} catch {
		return [];
	}
	const pluginIds = /* @__PURE__ */ new Set();
	for (const entry of entries) {
		if (!entry.isDirectory()) continue;
		const manifest = loadPluginManifest(path.join(bundledDir, entry.name), false);
		if (!manifest.ok) continue;
		if ((manifest.manifest.channels ?? []).some((channelId) => channelIds.has(normalizeOptionalLowercaseString(channelId) ?? ""))) {
			const pluginId = normalizeOptionalLowercaseString(manifest.manifest.id);
			if (pluginId) pluginIds.add(pluginId);
		}
	}
	return [...pluginIds].toSorted((left, right) => left.localeCompare(right));
}
function collectExplicitEffectivePluginIds(config) {
	const plugins = normalizePluginsConfig(config.plugins);
	if (!plugins.enabled) return [];
	const ids = new Set(plugins.allow);
	for (const [pluginId, entry] of Object.entries(plugins.entries)) if (entry?.enabled === true && (plugins.allow.length === 0 || plugins.allow.includes(pluginId))) ids.add(pluginId);
	for (const pluginId of plugins.deny) ids.delete(pluginId);
	for (const [pluginId, entry] of Object.entries(plugins.entries)) if (entry?.enabled === false) ids.delete(pluginId);
	return [...ids].toSorted((left, right) => left.localeCompare(right));
}
function resolveEffectivePluginIds(params) {
	const effectiveConfig = applyPluginAutoEnable({
		config: params.config,
		env: params.env
	}).config;
	const ids = new Set(collectExplicitEffectivePluginIds(effectiveConfig));
	const configuredChannelIds = collectConfiguredChannelIds(effectiveConfig, params.config, params.env);
	for (const pluginId of resolveConfiguredChannelPluginIds({
		config: effectiveConfig,
		activationSourceConfig: params.config,
		workspaceDir: params.workspaceDir,
		env: params.env
	})) ids.add(pluginId);
	for (const pluginId of collectBundledChannelOwnerPluginIds({
		channelIds: configuredChannelIds,
		env: params.env
	})) ids.add(pluginId);
	for (const pluginId of resolveGatewayStartupPluginIds({
		config: effectiveConfig,
		activationSourceConfig: params.config,
		workspaceDir: params.workspaceDir,
		env: params.env
	})) ids.add(pluginId);
	return [...ids].toSorted((left, right) => left.localeCompare(right));
}
//#endregion
export { resolveEffectivePluginIds as t };
