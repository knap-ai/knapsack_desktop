import { s as normalizeOptionalLowercaseString } from "./string-coerce-Bje8XVt9.js";
import { S as resolveDefaultAgentId, x as resolveAgentWorkspaceDir } from "./agent-scope-i10se9ty.js";
import { l as resolveEnableState, o as normalizePluginsConfig } from "./config-state-Bw_lAn0M.js";
import { i as normalizeChannelId, t as getChannelPlugin } from "./registry-yTN80EXi.js";
import "./plugins-D-K4uCVI.js";
import { t as createClackPrompter } from "./clack-prompter-j7MQtAii.js";
import { n as getChannelPluginCatalogEntry, r as listChannelPluginCatalogEntries } from "./catalog-Bs5xqjVh.js";
import { n as loadChannelSetupPluginRegistrySnapshotForChannel, t as ensureChannelSetupPluginInstalled } from "./plugin-install-DBzZALvw.js";
//#region src/commands/channel-setup/channel-plugin-resolution.ts
function resolveWorkspaceDir(cfg) {
	return resolveAgentWorkspaceDir(cfg, resolveDefaultAgentId(cfg));
}
function resolveResolvedChannelId(params) {
	const normalized = normalizeChannelId(params.rawChannel);
	if (normalized) return normalized;
	if (!params.catalogEntry) return;
	return normalizeChannelId(params.catalogEntry.id) ?? params.catalogEntry.id;
}
function resolveCatalogChannelEntry(raw, cfg) {
	const trimmed = normalizeOptionalLowercaseString(raw);
	if (!trimmed) return;
	return listChannelPluginCatalogEntries({ workspaceDir: cfg ? resolveWorkspaceDir(cfg) : void 0 }).find((entry) => {
		if (normalizeOptionalLowercaseString(entry.id) === trimmed) return true;
		return (entry.meta.aliases ?? []).some((alias) => normalizeOptionalLowercaseString(alias) === trimmed);
	});
}
function findScopedChannelPlugin(snapshot, channelId) {
	return snapshot.channels.find((entry) => entry.plugin.id === channelId)?.plugin ?? snapshot.channelSetups.find((entry) => entry.plugin.id === channelId)?.plugin;
}
function isTrustedWorkspaceChannelCatalogEntry(entry, cfg) {
	if (entry?.origin !== "workspace") return true;
	if (!entry.pluginId) return false;
	const plugins = cfg.plugins;
	if (plugins?.enabled === false) return false;
	const pluginEntry = plugins?.entries?.[entry.pluginId];
	if (pluginEntry?.enabled === false) return false;
	if (plugins?.deny?.length) return resolveEnableState(entry.pluginId, "workspace", normalizePluginsConfig(cfg.plugins)).enabled;
	if (plugins?.allow?.includes(entry.pluginId)) return true;
	if (pluginEntry?.enabled === true && !plugins?.allow?.length) return true;
	return resolveEnableState(entry.pluginId, "workspace", normalizePluginsConfig(cfg.plugins)).enabled;
}
function resolveTrustedCatalogEntry(params) {
	if (isTrustedWorkspaceChannelCatalogEntry(params.catalogEntry, params.cfg)) return params.catalogEntry;
	if (params.rawChannel) {
		const trimmed = normalizeOptionalLowercaseString(params.rawChannel);
		if (!trimmed) return;
		return listChannelPluginCatalogEntries({
			workspaceDir: params.workspaceDir,
			excludeWorkspace: true
		}).find((entry) => {
			if (normalizeOptionalLowercaseString(entry.id) === trimmed) return true;
			return (entry.meta.aliases ?? []).some((alias) => normalizeOptionalLowercaseString(alias) === trimmed);
		});
	}
	if (!params.channelId) return;
	return getChannelPluginCatalogEntry(params.channelId, {
		workspaceDir: params.workspaceDir,
		excludeWorkspace: true
	});
}
function loadScopedChannelPlugin(params) {
	return findScopedChannelPlugin(loadChannelSetupPluginRegistrySnapshotForChannel({
		cfg: params.cfg,
		runtime: params.runtime,
		channel: params.channelId,
		...params.pluginId ? { pluginId: params.pluginId } : {},
		workspaceDir: params.workspaceDir
	}), params.channelId);
}
async function resolveInstallableChannelPlugin(params) {
	const supports = params.supports ?? (() => true);
	let nextCfg = params.cfg;
	const workspaceDir = resolveWorkspaceDir(nextCfg);
	const unresolvedCatalogEntry = (params.rawChannel ? resolveCatalogChannelEntry(params.rawChannel, nextCfg) : void 0) ?? (params.channelId ? getChannelPluginCatalogEntry(params.channelId, { workspaceDir }) : void 0);
	const catalogEntry = resolveTrustedCatalogEntry({
		rawChannel: params.rawChannel,
		channelId: params.channelId,
		cfg: nextCfg,
		workspaceDir,
		catalogEntry: unresolvedCatalogEntry
	});
	const channelId = params.channelId ?? resolveResolvedChannelId({
		rawChannel: params.rawChannel,
		catalogEntry
	});
	if (!channelId) return {
		cfg: nextCfg,
		catalogEntry,
		configChanged: false,
		pluginInstalled: false
	};
	const existing = getChannelPlugin(channelId);
	if (existing && supports(existing)) return {
		cfg: nextCfg,
		channelId,
		plugin: existing,
		catalogEntry,
		configChanged: false,
		pluginInstalled: false
	};
	const resolvedPluginId = catalogEntry?.pluginId;
	if (catalogEntry) {
		const scoped = loadScopedChannelPlugin({
			cfg: nextCfg,
			runtime: params.runtime,
			channelId,
			pluginId: resolvedPluginId,
			workspaceDir
		});
		if (scoped && supports(scoped)) return {
			cfg: nextCfg,
			channelId,
			plugin: scoped,
			catalogEntry,
			configChanged: false,
			pluginInstalled: false
		};
		if (params.allowInstall !== false) {
			const installResult = await ensureChannelSetupPluginInstalled({
				cfg: nextCfg,
				entry: catalogEntry,
				prompter: params.prompter ?? createClackPrompter(),
				runtime: params.runtime,
				workspaceDir
			});
			nextCfg = installResult.cfg;
			const installedPluginId = installResult.pluginId ?? resolvedPluginId;
			const installedPlugin = installResult.installed ? loadScopedChannelPlugin({
				cfg: nextCfg,
				runtime: params.runtime,
				channelId,
				pluginId: installedPluginId,
				workspaceDir: resolveWorkspaceDir(nextCfg)
			}) : void 0;
			return {
				cfg: nextCfg,
				channelId,
				plugin: installedPlugin ?? existing,
				catalogEntry: installedPluginId && catalogEntry.pluginId !== installedPluginId ? {
					...catalogEntry,
					pluginId: installedPluginId
				} : catalogEntry,
				configChanged: nextCfg !== params.cfg,
				pluginInstalled: installResult.installed
			};
		}
	}
	return {
		cfg: nextCfg,
		channelId,
		plugin: existing,
		catalogEntry,
		configChanged: false,
		pluginInstalled: false
	};
}
//#endregion
export { resolveInstallableChannelPlugin as n, resolveCatalogChannelEntry as t };
