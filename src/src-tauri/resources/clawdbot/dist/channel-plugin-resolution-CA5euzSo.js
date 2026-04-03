import { m as resolveDefaultAgentId, p as resolveAgentWorkspaceDir } from "./agent-scope-CYXg_wTS.js";
import { a as normalizePluginsConfig, c as resolveEnableState } from "./config-state-zclcq4hc.js";
import { r as normalizeChannelId, t as getChannelPlugin } from "./registry-fiJfPVib.js";
import "./plugins-DF32jmMU.js";
import { n as getChannelPluginCatalogEntry, r as listChannelPluginCatalogEntries } from "./catalog-CAEFn2QM.js";
import { t as createClackPrompter } from "./clack-prompter-D0YWkrDK.js";
import { n as loadChannelSetupPluginRegistrySnapshotForChannel, t as ensureChannelSetupPluginInstalled } from "./plugin-install-CsVSPbgh.js";
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
	const trimmed = raw.trim().toLowerCase();
	if (!trimmed) return;
	return listChannelPluginCatalogEntries({ workspaceDir: cfg ? resolveWorkspaceDir(cfg) : void 0 }).find((entry) => {
		if (entry.id.toLowerCase() === trimmed) return true;
		return (entry.meta.aliases ?? []).some((alias) => alias.trim().toLowerCase() === trimmed);
	});
}
function findScopedChannelPlugin(snapshot, channelId) {
	return snapshot.channels.find((entry) => entry.plugin.id === channelId)?.plugin ?? snapshot.channelSetups.find((entry) => entry.plugin.id === channelId)?.plugin;
}
function isTrustedWorkspaceChannelCatalogEntry(entry, cfg) {
	if (entry?.origin !== "workspace") return true;
	if (!entry.pluginId) return false;
	return resolveEnableState(entry.pluginId, "workspace", normalizePluginsConfig(cfg.plugins)).enabled;
}
function resolveTrustedCatalogEntry(params) {
	if (isTrustedWorkspaceChannelCatalogEntry(params.catalogEntry, params.cfg)) return params.catalogEntry;
	if (params.rawChannel) {
		const trimmed = params.rawChannel.trim().toLowerCase();
		return listChannelPluginCatalogEntries({
			workspaceDir: params.workspaceDir,
			excludeWorkspace: true
		}).find((entry) => {
			if (entry.id.toLowerCase() === trimmed) return true;
			return (entry.meta.aliases ?? []).some((alias) => alias.trim().toLowerCase() === trimmed);
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
		configChanged: false
	};
	const existing = getChannelPlugin(channelId);
	if (existing && supports(existing)) return {
		cfg: nextCfg,
		channelId,
		plugin: existing,
		catalogEntry,
		configChanged: false
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
			configChanged: false
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
				configChanged: nextCfg !== params.cfg
			};
		}
	}
	return {
		cfg: nextCfg,
		channelId,
		plugin: existing,
		catalogEntry,
		configChanged: false
	};
}
//#endregion
export { resolveInstallableChannelPlugin as t };
