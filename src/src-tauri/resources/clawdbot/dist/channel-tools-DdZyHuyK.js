import { a as normalizeAnyChannelId } from "./registry-CENZffQG.js";
import { r as listChannelPlugins, t as getChannelPlugin } from "./registry-Delpa74L.js";
import { a as normalizePluginsConfig, t as applyTestPluginDefaults } from "./config-state-CcN3bZ9D.js";
import { a as resolveRuntimePluginRegistry } from "./loader-DYW2PvbF.js";
import "./plugins-D4ODSIPT.js";
import { i as getActivePluginRegistryKey, r as getActivePluginRegistry, s as getActivePluginRuntimeSubagentMode } from "./runtime-BB1a2aCy.js";
import { i as resolvePluginRuntimeLoadContext, t as buildPluginRuntimeLoadOptions } from "./load-context-HY3FwKJn.js";
import { l as normalizeToolName } from "./tool-policy-C3rJHw58.js";
import { o as resolveMessageActionDiscoveryChannelId, r as createMessageActionDiscoveryContext, s as resolveMessageActionDiscoveryForPlugin } from "./message-action-discovery-BTz8VrH1.js";
//#region src/plugins/tools.ts
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
//#region src/agents/channel-tools.ts
const channelAgentToolMeta = /* @__PURE__ */ new WeakMap();
function getChannelAgentToolMeta(tool) {
	return channelAgentToolMeta.get(tool);
}
function copyChannelAgentToolMeta(source, target) {
	const meta = channelAgentToolMeta.get(source);
	if (meta) channelAgentToolMeta.set(target, meta);
}
/**
* Get the list of supported message actions for a specific channel.
* Returns an empty array if channel is not found or has no actions configured.
*/
function listChannelSupportedActions(params) {
	const channelId = resolveMessageActionDiscoveryChannelId(params.channel);
	if (!channelId) return [];
	const plugin = getChannelPlugin(channelId);
	if (!plugin?.actions) return [];
	return resolveMessageActionDiscoveryForPlugin({
		pluginId: plugin.id,
		actions: plugin.actions,
		context: createMessageActionDiscoveryContext(params),
		includeActions: true
	}).actions;
}
/**
* Get the list of all supported message actions across all configured channels.
*/
function listAllChannelSupportedActions(params) {
	const actions = /* @__PURE__ */ new Set();
	for (const plugin of listChannelPlugins()) {
		const channelActions = resolveMessageActionDiscoveryForPlugin({
			pluginId: plugin.id,
			actions: plugin.actions,
			context: createMessageActionDiscoveryContext({
				...params,
				currentChannelProvider: plugin.id
			}),
			includeActions: true
		}).actions;
		for (const action of channelActions) actions.add(action);
	}
	return Array.from(actions);
}
function listChannelAgentTools(params) {
	const tools = [];
	for (const plugin of listChannelPlugins()) {
		const entry = plugin.agentTools;
		if (!entry) continue;
		const resolved = typeof entry === "function" ? entry(params) : entry;
		if (Array.isArray(resolved)) {
			for (const tool of resolved) channelAgentToolMeta.set(tool, { channelId: plugin.id });
			tools.push(...resolved);
		}
	}
	return tools;
}
function resolveChannelMessageToolHints(params) {
	const channelId = normalizeAnyChannelId(params.channel);
	if (!channelId) return [];
	const resolve = getChannelPlugin(channelId)?.agentPrompt?.messageToolHints;
	if (!resolve) return [];
	return (resolve({
		cfg: params.cfg ?? {},
		accountId: params.accountId
	}) ?? []).map((entry) => entry.trim()).filter(Boolean);
}
function resolveChannelMessageToolCapabilities(params) {
	const channelId = normalizeAnyChannelId(params.channel);
	if (!channelId) return [];
	const resolve = getChannelPlugin(channelId)?.agentPrompt?.messageToolCapabilities;
	if (!resolve) return [];
	return (resolve({
		cfg: params.cfg ?? {},
		accountId: params.accountId
	}) ?? []).map((entry) => entry.trim()).filter(Boolean);
}
function resolveChannelReactionGuidance(params) {
	const channelId = normalizeAnyChannelId(params.channel);
	if (!channelId) return;
	const resolve = getChannelPlugin(channelId)?.agentPrompt?.reactionGuidance;
	if (!resolve) return;
	const resolved = resolve({
		cfg: params.cfg ?? {},
		accountId: params.accountId
	});
	if (!resolved?.level) return;
	return {
		level: resolved.level,
		channel: resolved.channelLabel?.trim() || channelId
	};
}
//#endregion
export { listChannelSupportedActions as a, resolveChannelReactionGuidance as c, resolvePluginTools as d, listChannelAgentTools as i, copyPluginToolMeta as l, getChannelAgentToolMeta as n, resolveChannelMessageToolCapabilities as o, listAllChannelSupportedActions as r, resolveChannelMessageToolHints as s, copyChannelAgentToolMeta as t, getPluginToolMeta as u };
