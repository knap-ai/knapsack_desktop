import { t as sanitizeForLog } from "./ansi-BZHMLcUk.js";
import { t as loadPluginManifestRegistry } from "./manifest-registry-pYrbrdHJ.js";
import { a as normalizePluginId } from "./config-state-UvzNc3si.js";
import { b as resolveAgentWorkspaceDir, x as resolveDefaultAgentId } from "./agent-scope-_6dFncNS.js";
import { t as asObjectRecord } from "./object-DG5cjPE5.js";
//#region src/commands/doctor/shared/stale-plugin-config.ts
function collectPluginRegistryState(cfg, env) {
	const registry = loadPluginManifestRegistry({
		config: cfg,
		workspaceDir: resolveAgentWorkspaceDir(cfg, resolveDefaultAgentId(cfg)) ?? void 0,
		env
	});
	return {
		knownIds: new Set(registry.plugins.map((plugin) => plugin.id)),
		hasDiscoveryErrors: registry.diagnostics.some((diag) => diag.level === "error")
	};
}
function isStalePluginAutoRepairBlocked(cfg, env) {
	return collectPluginRegistryState(cfg, env).hasDiscoveryErrors;
}
function scanStalePluginConfig(cfg, env) {
	const plugins = asObjectRecord(cfg.plugins);
	if (!plugins) return [];
	return scanStalePluginConfigWithState(plugins, collectPluginRegistryState(cfg, env));
}
function scanStalePluginConfigWithState(plugins, registryState) {
	const { knownIds } = registryState;
	const hits = [];
	const allow = Array.isArray(plugins.allow) ? plugins.allow : [];
	for (const rawPluginId of allow) {
		if (typeof rawPluginId !== "string") continue;
		const pluginId = normalizePluginId(rawPluginId);
		if (!pluginId || knownIds.has(pluginId)) continue;
		hits.push({
			pluginId: rawPluginId,
			pathLabel: "plugins.allow",
			surface: "allow"
		});
	}
	const entries = asObjectRecord(plugins.entries);
	if (!entries) return hits;
	for (const rawPluginId of Object.keys(entries)) {
		if (knownIds.has(normalizePluginId(rawPluginId))) continue;
		hits.push({
			pluginId: rawPluginId,
			pathLabel: `plugins.entries.${rawPluginId}`,
			surface: "entries"
		});
	}
	return hits;
}
function collectStalePluginConfigWarnings(params) {
	if (params.hits.length === 0) return [];
	const lines = params.hits.map((hit) => `- ${hit.pathLabel}: stale plugin reference "${hit.pluginId}" was found.`);
	if (params.autoRepairBlocked) lines.push(`- Auto-removal is paused because plugin discovery currently has errors. Fix plugin discovery first, then rerun "${params.doctorFixCommand}".`);
	else lines.push(`- Run "${params.doctorFixCommand}" to remove stale plugins.allow and plugins.entries ids.`);
	return lines.map((line) => sanitizeForLog(line));
}
function maybeRepairStalePluginConfig(cfg, env) {
	const plugins = asObjectRecord(cfg.plugins);
	if (!plugins) return {
		config: cfg,
		changes: []
	};
	const registryState = collectPluginRegistryState(cfg, env);
	if (registryState.hasDiscoveryErrors) return {
		config: cfg,
		changes: []
	};
	const hits = scanStalePluginConfigWithState(plugins, registryState);
	if (hits.length === 0) return {
		config: cfg,
		changes: []
	};
	const next = structuredClone(cfg);
	const nextPlugins = asObjectRecord(next.plugins);
	if (!nextPlugins) return {
		config: cfg,
		changes: []
	};
	const allowIds = hits.filter((hit) => hit.surface === "allow").map((hit) => hit.pluginId);
	if (allowIds.length > 0 && Array.isArray(nextPlugins.allow)) {
		const staleAllowIds = new Set(allowIds.map((pluginId) => normalizePluginId(pluginId)));
		nextPlugins.allow = nextPlugins.allow.filter((pluginId) => typeof pluginId !== "string" || !staleAllowIds.has(normalizePluginId(pluginId)));
	}
	const entryIds = hits.filter((hit) => hit.surface === "entries").map((hit) => hit.pluginId);
	if (entryIds.length > 0) {
		const entries = asObjectRecord(nextPlugins.entries);
		if (entries) {
			const staleEntryIds = new Set(entryIds.map((pluginId) => normalizePluginId(pluginId)));
			for (const pluginId of Object.keys(entries)) if (staleEntryIds.has(normalizePluginId(pluginId))) delete entries[pluginId];
		}
	}
	const changes = [];
	if (allowIds.length > 0) changes.push(`- plugins.allow: removed ${allowIds.length} stale plugin id${allowIds.length === 1 ? "" : "s"} (${allowIds.join(", ")})`);
	if (entryIds.length > 0) changes.push(`- plugins.entries: removed ${entryIds.length} stale plugin entr${entryIds.length === 1 ? "y" : "ies"} (${entryIds.join(", ")})`);
	return {
		config: next,
		changes
	};
}
//#endregion
export { scanStalePluginConfig as i, isStalePluginAutoRepairBlocked as n, maybeRepairStalePluginConfig as r, collectStalePluginConfigWarnings as t };
