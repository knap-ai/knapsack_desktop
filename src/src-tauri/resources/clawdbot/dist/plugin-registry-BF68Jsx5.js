import { t as createSubsystemLogger } from "./subsystem-CJEvHE2o.js";
import { m as resolveDefaultAgentId, p as resolveAgentWorkspaceDir } from "./agent-scope-CYXg_wTS.js";
import { c as loadConfig } from "./io-DhtVmzAJ.js";
import { r as getActivePluginRegistry } from "./runtime-DZz1f0_h.js";
import "./config-CJQx-9zo.js";
import { t as applyPluginAutoEnable } from "./plugin-auto-enable-CqpAn9Qh.js";
import "./logging-C0VWvR36.js";
import { n as loadOpenClawPlugins } from "./loader-BkOjign1.js";
import { n as resolveConfiguredChannelPluginIds, t as resolveChannelPluginIds } from "./channel-plugin-ids-CwlVEWHh.js";
//#region src/cli/plugin-registry.ts
const log = createSubsystemLogger("plugins");
let pluginRegistryLoaded = "none";
function scopeRank(scope) {
	switch (scope) {
		case "none": return 0;
		case "configured-channels": return 1;
		case "channels": return 2;
		case "all": return 3;
	}
}
function activeRegistrySatisfiesScope(scope, active, expectedChannelPluginIds) {
	if (!active) return false;
	const activeChannelPluginIds = new Set(active.channels.map((entry) => entry.plugin.id));
	switch (scope) {
		case "configured-channels":
		case "channels": return active.channels.length > 0 && expectedChannelPluginIds.every((pluginId) => activeChannelPluginIds.has(pluginId));
		case "all": return false;
	}
}
function ensurePluginRegistryLoaded(options) {
	const scope = options?.scope ?? "all";
	if (scopeRank(pluginRegistryLoaded) >= scopeRank(scope)) return;
	const config = loadConfig();
	const autoEnabled = applyPluginAutoEnable({
		config,
		env: process.env
	});
	const resolvedConfig = autoEnabled.config;
	const workspaceDir = resolveAgentWorkspaceDir(resolvedConfig, resolveDefaultAgentId(resolvedConfig));
	const expectedChannelPluginIds = scope === "configured-channels" ? resolveConfiguredChannelPluginIds({
		config: resolvedConfig,
		workspaceDir,
		env: process.env
	}) : scope === "channels" ? resolveChannelPluginIds({
		config: resolvedConfig,
		workspaceDir,
		env: process.env
	}) : [];
	const active = getActivePluginRegistry();
	if (pluginRegistryLoaded === "none" && activeRegistrySatisfiesScope(scope, active, expectedChannelPluginIds)) {
		pluginRegistryLoaded = scope;
		return;
	}
	loadOpenClawPlugins({
		config: resolvedConfig,
		activationSourceConfig: config,
		autoEnabledReasons: autoEnabled.autoEnabledReasons,
		workspaceDir,
		logger: {
			info: (msg) => log.info(msg),
			warn: (msg) => log.warn(msg),
			error: (msg) => log.error(msg),
			debug: (msg) => log.debug(msg)
		},
		throwOnLoadError: true,
		...scope === "configured-channels" ? { onlyPluginIds: expectedChannelPluginIds } : scope === "channels" ? { onlyPluginIds: expectedChannelPluginIds } : {}
	});
	pluginRegistryLoaded = scope;
}
const __testing = { resetPluginRegistryLoadedForTests() {
	pluginRegistryLoaded = "none";
} };
//#endregion
export { ensurePluginRegistryLoaded as n, __testing as t };
