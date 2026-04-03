import { m as resolveDefaultAgentId, p as resolveAgentWorkspaceDir } from "./agent-scope-CYXg_wTS.js";
import { n as getActivePluginChannelRegistryVersion, r as getActivePluginRegistry } from "./runtime-DZz1f0_h.js";
import { d as normalizeMessageChannel, r as isDeliverableMessageChannel } from "./message-channel-D19EDm2g.js";
import { t as getChannelPlugin } from "./registry-fiJfPVib.js";
import "./plugins-DF32jmMU.js";
import { t as applyPluginAutoEnable } from "./plugin-auto-enable-CqpAn9Qh.js";
import { r as resolveRuntimePluginRegistry } from "./loader-BkOjign1.js";
//#region src/infra/outbound/channel-resolution.ts
const bootstrapAttempts = /* @__PURE__ */ new Set();
function normalizeDeliverableOutboundChannel(raw) {
	const normalized = normalizeMessageChannel(raw);
	if (!normalized || !isDeliverableMessageChannel(normalized)) return;
	return normalized;
}
function maybeBootstrapChannelPlugin(params) {
	const cfg = params.cfg;
	if (!cfg) return;
	if (getActivePluginRegistry()?.channels?.some((entry) => entry?.plugin?.id === params.channel)) return;
	const attemptKey = `${getActivePluginChannelRegistryVersion()}:${params.channel}`;
	if (bootstrapAttempts.has(attemptKey)) return;
	bootstrapAttempts.add(attemptKey);
	const autoEnabled = applyPluginAutoEnable({ config: cfg });
	const defaultAgentId = resolveDefaultAgentId(autoEnabled.config);
	const workspaceDir = resolveAgentWorkspaceDir(autoEnabled.config, defaultAgentId);
	try {
		resolveRuntimePluginRegistry({
			config: autoEnabled.config,
			activationSourceConfig: cfg,
			autoEnabledReasons: autoEnabled.autoEnabledReasons,
			workspaceDir,
			runtimeOptions: { allowGatewaySubagentBinding: true }
		});
	} catch {
		bootstrapAttempts.delete(attemptKey);
	}
}
function resolveDirectFromActiveRegistry(channel) {
	const activeRegistry = getActivePluginRegistry();
	if (!activeRegistry) return;
	for (const entry of activeRegistry.channels) {
		const plugin = entry?.plugin;
		if (plugin?.id === channel) return plugin;
	}
}
function resolveOutboundChannelPlugin(params) {
	const normalized = normalizeDeliverableOutboundChannel(params.channel);
	if (!normalized) return;
	const resolve = () => getChannelPlugin(normalized);
	const current = resolve();
	if (current) return current;
	const directCurrent = resolveDirectFromActiveRegistry(normalized);
	if (directCurrent) return directCurrent;
	maybeBootstrapChannelPlugin({
		channel: normalized,
		cfg: params.cfg
	});
	return resolve() ?? resolveDirectFromActiveRegistry(normalized);
}
//#endregion
export { resolveOutboundChannelPlugin as n, normalizeDeliverableOutboundChannel as t };
