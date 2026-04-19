import { l as isRecord } from "./utils-D5DtWkEu.js";
import { b as resolveAgentWorkspaceDir, x as resolveDefaultAgentId } from "./agent-scope-KFH9bkHi.js";
import { a as collectPluginConfigContractMatches, o as resolvePluginConfigContractsById } from "./setup-registry-ytDuF5P6.js";
//#region src/security/dangerous-config-flags.ts
function formatDangerousConfigFlagValue(value) {
	return value === null ? "null" : String(value);
}
function collectEnabledInsecureOrDangerousFlags(cfg) {
	const enabledFlags = [];
	if (cfg.gateway?.controlUi?.allowInsecureAuth === true) enabledFlags.push("gateway.controlUi.allowInsecureAuth=true");
	if (cfg.gateway?.controlUi?.dangerouslyAllowHostHeaderOriginFallback === true) enabledFlags.push("gateway.controlUi.dangerouslyAllowHostHeaderOriginFallback=true");
	if (cfg.gateway?.controlUi?.dangerouslyDisableDeviceAuth === true) enabledFlags.push("gateway.controlUi.dangerouslyDisableDeviceAuth=true");
	if (cfg.hooks?.gmail?.allowUnsafeExternalContent === true) enabledFlags.push("hooks.gmail.allowUnsafeExternalContent=true");
	if (Array.isArray(cfg.hooks?.mappings)) {
		for (const [index, mapping] of cfg.hooks.mappings.entries()) if (mapping?.allowUnsafeExternalContent === true) enabledFlags.push(`hooks.mappings[${index}].allowUnsafeExternalContent=true`);
	}
	if (cfg.tools?.exec?.applyPatch?.workspaceOnly === false) enabledFlags.push("tools.exec.applyPatch.workspaceOnly=false");
	const pluginEntries = cfg.plugins?.entries;
	if (!isRecord(pluginEntries)) return enabledFlags;
	const configContracts = resolvePluginConfigContractsById({
		config: cfg,
		workspaceDir: resolveAgentWorkspaceDir(cfg, resolveDefaultAgentId(cfg)),
		env: process.env,
		cache: true,
		pluginIds: Object.keys(pluginEntries)
	});
	const seenFlags = /* @__PURE__ */ new Set();
	for (const [pluginId, metadata] of configContracts.entries()) {
		const dangerousFlags = metadata.configContracts.dangerousFlags;
		if (!dangerousFlags?.length) continue;
		const pluginEntry = pluginEntries[pluginId];
		if (!isRecord(pluginEntry) || !isRecord(pluginEntry.config)) continue;
		for (const flag of dangerousFlags) for (const match of collectPluginConfigContractMatches({
			root: pluginEntry.config,
			pathPattern: flag.path
		})) {
			if (!Object.is(match.value, flag.equals)) continue;
			const rendered = `plugins.entries.${pluginId}.config.${match.path}=${formatDangerousConfigFlagValue(flag.equals)}`;
			if (seenFlags.has(rendered)) continue;
			seenFlags.add(rendered);
			enabledFlags.push(rendered);
		}
	}
	return enabledFlags;
}
//#endregion
export { collectEnabledInsecureOrDangerousFlags as t };
