import { o as normalizePluginsConfig, t as applyTestPluginDefaults } from "./config-state-UvzNc3si.js";
import { a as resolveRuntimePluginRegistry } from "./loader-NucjcOgv.js";
import { a as getActivePluginRegistry, l as getActivePluginRuntimeSubagentMode, o as getActivePluginRegistryKey } from "./runtime-BFywV6BM.js";
import { i as resolvePluginRuntimeLoadContext, t as buildPluginRuntimeLoadOptions } from "./load-context-D240_UuB.js";
import { p as normalizeToolName } from "./tool-policy-DArLXMH2.js";
//#region src/plugins/tools.ts
const pluginToolMeta = /* @__PURE__ */ new WeakMap();
function setPluginToolMeta(tool, meta) {
	pluginToolMeta.set(tool, meta);
}
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
	const context = resolvePluginRuntimeLoadContext({
		config: applyTestPluginDefaults(params.context.config ?? {}, env),
		env,
		workspaceDir: params.context.workspaceDir
	});
	if (!normalizePluginsConfig(context.config.plugins).enabled) return [];
	const registry = resolvePluginToolRegistry({
		loadOptions: buildPluginRuntimeLoadOptions(context, { runtimeOptions: params.allowGatewaySubagentBinding ? { allowGatewaySubagentBinding: true } : void 0 }),
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
				context.logger.error(message);
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
			context.logger.error(`plugin tool failed (${entry.pluginId}): ${String(err)}`);
			continue;
		}
		if (!resolved) {
			if (entry.names.length > 0) context.logger.debug?.(`plugin tool factory returned null (${entry.pluginId}): [${entry.names.join(", ")}]`);
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
					context.logger.error(message);
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
export { setPluginToolMeta as i, getPluginToolMeta as n, resolvePluginTools as r, copyPluginToolMeta as t };
