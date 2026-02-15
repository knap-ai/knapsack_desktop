import { T as getActivePluginRegistry, g as CHAT_CHANNEL_ORDER, t as createSubsystemLogger } from "./subsystem-QRNIBE7-.js";
import { _t as loadOpenClawPlugins } from "./reply-BNEkWD6b.js";
import { c as resolveDefaultAgentId, s as resolveAgentWorkspaceDir } from "./agent-scope-DMGrQp5u.js";
import { t as isTruthyEnvValue } from "./env-BSjH4KuP.js";
import { i as loadConfig } from "./config-CWifpzL_.js";
import { n as listChannelPlugins } from "./plugins-CLo5nH74.js";
import { i as listChannelPluginCatalogEntries } from "./plugin-auto-enable-B_v9wM6g.js";

//#region src/cli/command-options.ts
function hasExplicitOptions(command, names) {
	if (typeof command.getOptionValueSource !== "function") return false;
	return names.some((name) => command.getOptionValueSource(name) === "cli");
}

//#endregion
//#region src/cli/plugin-registry.ts
const log = createSubsystemLogger("plugins");
let pluginRegistryLoaded = false;
function ensurePluginRegistryLoaded() {
	if (pluginRegistryLoaded) return;
	const active = getActivePluginRegistry();
	if (active && (active.plugins.length > 0 || active.channels.length > 0 || active.tools.length > 0)) {
		pluginRegistryLoaded = true;
		return;
	}
	const config = loadConfig();
	loadOpenClawPlugins({
		config,
		workspaceDir: resolveAgentWorkspaceDir(config, resolveDefaultAgentId(config)),
		logger: {
			info: (msg) => log.info(msg),
			warn: (msg) => log.warn(msg),
			error: (msg) => log.error(msg),
			debug: (msg) => log.debug(msg)
		}
	});
	pluginRegistryLoaded = true;
}

//#endregion
//#region src/cli/channel-options.ts
function dedupe(values) {
	const seen = /* @__PURE__ */ new Set();
	const resolved = [];
	for (const value of values) {
		if (!value || seen.has(value)) continue;
		seen.add(value);
		resolved.push(value);
	}
	return resolved;
}
function resolveCliChannelOptions() {
	const catalog = listChannelPluginCatalogEntries().map((entry) => entry.id);
	const base = dedupe([...CHAT_CHANNEL_ORDER, ...catalog]);
	if (isTruthyEnvValue(process.env.OPENCLAW_EAGER_CHANNEL_OPTIONS)) {
		ensurePluginRegistryLoaded();
		const pluginIds = listChannelPlugins().map((plugin) => plugin.id);
		return dedupe([...base, ...pluginIds]);
	}
	return base;
}
function formatCliChannelOptions(extra = []) {
	return [...extra, ...resolveCliChannelOptions()].join("|");
}

//#endregion
export { hasExplicitOptions as i, resolveCliChannelOptions as n, ensurePluginRegistryLoaded as r, formatCliChannelOptions as t };