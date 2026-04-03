import { t as createSubsystemLogger } from "./subsystem-CJEvHE2o.js";
import { i as getActivePluginRegistryKey, o as getActivePluginRuntimeSubagentMode, r as getActivePluginRegistry } from "./runtime-DZz1f0_h.js";
import { a as normalizePluginsConfig, t as applyTestPluginDefaults } from "./config-state-zclcq4hc.js";
import { t as applyPluginAutoEnable } from "./plugin-auto-enable-CqpAn9Qh.js";
import { r as resolveRuntimePluginRegistry } from "./loader-BkOjign1.js";
import { t as createPluginLoaderLogger } from "./logger-D1mGp2bM.js";
import { l as normalizeToolName } from "./tool-policy-Bk9WQZ0U.js";
//#region src/plugins/tools.ts
const log = createSubsystemLogger("plugins");
const pluginToolMeta = /* @__PURE__ */ new WeakMap();
function getPluginToolMeta(tool) {
	return pluginToolMeta.get(tool);
}
function copyPluginToolMeta(source, target) {
	const meta = pluginToolMeta.get(source);
	if (meta) pluginToolMeta.set(target, meta);
}
function normalizeAllowlist(list) {
	return new Set((list ?? []).map(normalizeToolName).filter(Boolean));
}
function isOptionalToolAllowed(params) {
	if (params.allowlist.size === 0) return false;
	const toolName = normalizeToolName(params.toolName);
	if (params.allowlist.has(toolName)) return true;
	const pluginKey = normalizeToolName(params.pluginId);
	if (params.allowlist.has(pluginKey)) return true;
	return params.allowlist.has("group:plugins");
}
function resolvePluginToolRegistry(params) {
	if (params.allowGatewaySubagentBinding && getActivePluginRegistryKey() && getActivePluginRuntimeSubagentMode() === "gateway-bindable") return getActivePluginRegistry() ?? resolveRuntimePluginRegistry(params.loadOptions);
	return resolveRuntimePluginRegistry(params.loadOptions);
}
function resolvePluginTools(params) {
	const env = params.env ?? process.env;
	const baseConfig = applyTestPluginDefaults(params.context.config ?? {}, env);
	const autoEnabled = applyPluginAutoEnable({
		config: baseConfig,
		env
	});
	const effectiveConfig = autoEnabled.config;
	if (!normalizePluginsConfig(effectiveConfig.plugins).enabled) return [];
	const runtimeOptions = params.allowGatewaySubagentBinding ? { allowGatewaySubagentBinding: true } : void 0;
	const registry = resolvePluginToolRegistry({
		loadOptions: {
			config: effectiveConfig,
			activationSourceConfig: baseConfig,
			autoEnabledReasons: autoEnabled.autoEnabledReasons,
			workspaceDir: params.context.workspaceDir,
			runtimeOptions,
			env,
			logger: createPluginLoaderLogger(log)
		},
		allowGatewaySubagentBinding: params.allowGatewaySubagentBinding
	});
	if (!registry) return [];
	const tools = [];
	const existing = params.existingToolNames ?? /* @__PURE__ */ new Set();
	const existingNormalized = new Set(Array.from(existing, (tool) => normalizeToolName(tool)));
	const allowlist = normalizeAllowlist(params.toolAllowlist);
	const blockedPlugins = /* @__PURE__ */ new Set();
	for (const entry of registry.tools) {
		if (blockedPlugins.has(entry.pluginId)) continue;
		const pluginIdKey = normalizeToolName(entry.pluginId);
		if (existingNormalized.has(pluginIdKey)) {
			const message = `plugin id conflicts with core tool name (${entry.pluginId})`;
			if (!params.suppressNameConflicts) {
				log.error(message);
				registry.diagnostics.push({
					level: "error",
					pluginId: entry.pluginId,
					source: entry.source,
					message
				});
			}
			blockedPlugins.add(entry.pluginId);
			continue;
		}
		let resolved = null;
		try {
			resolved = entry.factory(params.context);
		} catch (err) {
			log.error(`plugin tool failed (${entry.pluginId}): ${String(err)}`);
			continue;
		}
		if (!resolved) {
			if (entry.names.length > 0) log.debug(`plugin tool factory returned null (${entry.pluginId}): [${entry.names.join(", ")}]`);
			continue;
		}
		const listRaw = Array.isArray(resolved) ? resolved : [resolved];
		const list = entry.optional ? listRaw.filter((tool) => isOptionalToolAllowed({
			toolName: tool.name,
			pluginId: entry.pluginId,
			allowlist
		})) : listRaw;
		if (list.length === 0) continue;
		const nameSet = /* @__PURE__ */ new Set();
		for (const tool of list) {
			if (nameSet.has(tool.name) || existing.has(tool.name)) {
				const message = `plugin tool name conflict (${entry.pluginId}): ${tool.name}`;
				if (!params.suppressNameConflicts) {
					log.error(message);
					registry.diagnostics.push({
						level: "error",
						pluginId: entry.pluginId,
						source: entry.source,
						message
					});
				}
				continue;
			}
			nameSet.add(tool.name);
			existing.add(tool.name);
			pluginToolMeta.set(tool, {
				pluginId: entry.pluginId,
				optional: entry.optional
			});
			tools.push(tool);
		}
	}
	return tools;
}
//#endregion
export { getPluginToolMeta as n, resolvePluginTools as r, copyPluginToolMeta as t };
