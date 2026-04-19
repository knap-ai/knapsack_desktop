import { o as normalizeOptionalLowercaseString } from "./string-coerce-BUSzWgUA.js";
import { t as loadPluginManifestRegistry } from "./manifest-registry-Bd3A4lqx.js";
import { r as hasKind } from "./slots-MFUVcT3n.js";
import { a as normalizePluginsConfig, i as normalizePluginId, n as createPluginActivationSource, s as resolveEffectivePluginActivationState } from "./config-state-CcN3bZ9D.js";
import { f as hasExplicitManifestOwnerTrust, g as collectConfiguredAgentHarnessRuntimes, h as passesManifestOwnerBasePolicy, m as isBundledManifestOwner, p as isActivatedManifestOwner } from "./plugin-auto-enable-BbVfCcz-.js";
import { n as listPotentialConfiguredChannelIds } from "./config-presence-B8rnssE9.js";
import { t as resolveManifestActivationPluginIds } from "./activation-planner-Cty9b1m-.js";
import { I as resolveMemoryDreamingConfig, L as resolveMemoryDreamingPluginConfig, R as resolveMemoryDreamingPluginId } from "./dreaming-BHkWSJTy.js";
//#region src/plugins/channel-plugin-ids.ts
function hasRuntimeContractSurface(plugin) {
	return Boolean(plugin.providers.length > 0 || plugin.cliBackends.length > 0 || plugin.contracts?.speechProviders?.length || plugin.contracts?.mediaUnderstandingProviders?.length || plugin.contracts?.imageGenerationProviders?.length || plugin.contracts?.videoGenerationProviders?.length || plugin.contracts?.musicGenerationProviders?.length || plugin.contracts?.webFetchProviders?.length || plugin.contracts?.webSearchProviders?.length || plugin.contracts?.memoryEmbeddingProviders?.length || hasKind(plugin.kind, "memory"));
}
function isGatewayStartupMemoryPlugin(plugin) {
	return hasKind(plugin.kind, "memory");
}
function isGatewayStartupSidecar(plugin) {
	return plugin.channels.length === 0 && !hasRuntimeContractSurface(plugin);
}
function dedupeSortedPluginIds(values) {
	return [...new Set(values)].toSorted((left, right) => left.localeCompare(right));
}
function normalizeChannelIds(channelIds) {
	return Array.from(new Set([...channelIds].map((channelId) => normalizeOptionalLowercaseString(channelId)).filter((channelId) => Boolean(channelId)))).toSorted((left, right) => left.localeCompare(right));
}
function isChannelPluginEligibleForScopedOwnership(params) {
	if (!passesManifestOwnerBasePolicy({
		plugin: params.plugin,
		normalizedConfig: params.normalizedConfig
	})) return false;
	if (isBundledManifestOwner(params.plugin)) return true;
	if (params.plugin.origin === "global" || params.plugin.origin === "config") return hasExplicitManifestOwnerTrust({
		plugin: params.plugin,
		normalizedConfig: params.normalizedConfig
	});
	return isActivatedManifestOwner({
		plugin: params.plugin,
		normalizedConfig: params.normalizedConfig,
		rootConfig: params.rootConfig
	});
}
function resolveScopedChannelOwnerPluginIds(params) {
	const channelIds = normalizeChannelIds(params.channelIds);
	if (channelIds.length === 0) return [];
	const registry = loadPluginManifestRegistry({
		config: params.config,
		workspaceDir: params.workspaceDir,
		env: params.env,
		cache: params.cache
	});
	const trustConfig = params.activationSourceConfig ?? params.config;
	const normalizedConfig = normalizePluginsConfig(trustConfig.plugins);
	const candidateIds = dedupeSortedPluginIds(channelIds.flatMap((channelId) => {
		return resolveManifestActivationPluginIds({
			trigger: {
				kind: "channel",
				channel: channelId
			},
			config: params.config,
			workspaceDir: params.workspaceDir,
			env: params.env,
			cache: params.cache
		});
	}));
	if (candidateIds.length === 0) return [];
	const candidateIdSet = new Set(candidateIds);
	return registry.plugins.filter((plugin) => {
		if (!candidateIdSet.has(plugin.id)) return false;
		return isChannelPluginEligibleForScopedOwnership({
			plugin,
			normalizedConfig,
			rootConfig: trustConfig
		});
	}).map((plugin) => plugin.id).toSorted((left, right) => left.localeCompare(right));
}
function resolveScopedChannelPluginIds(params) {
	return resolveScopedChannelOwnerPluginIds(params);
}
function resolveDiscoverableScopedChannelPluginIds(params) {
	return resolveScopedChannelOwnerPluginIds(params);
}
function resolveGatewayStartupDreamingPluginIds(config) {
	if (!resolveMemoryDreamingConfig({
		pluginConfig: resolveMemoryDreamingPluginConfig(config),
		cfg: config
	}).enabled) return /* @__PURE__ */ new Set();
	return new Set(["memory-core", resolveMemoryDreamingPluginId(config)]);
}
function resolveExplicitMemorySlotStartupPluginId(config) {
	const configuredSlot = config.plugins?.slots?.memory?.trim();
	if (!configuredSlot || configuredSlot.toLowerCase() === "none") return;
	return normalizePluginId(configuredSlot);
}
function shouldConsiderForGatewayStartup(params) {
	if (isGatewayStartupSidecar(params.plugin)) return true;
	if (!isGatewayStartupMemoryPlugin(params.plugin)) return false;
	if (params.startupDreamingPluginIds.has(params.plugin.id)) return true;
	return params.explicitMemorySlotStartupPluginId === params.plugin.id;
}
function resolveChannelPluginIds(params) {
	return loadPluginManifestRegistry({
		config: params.config,
		workspaceDir: params.workspaceDir,
		env: params.env
	}).plugins.filter((plugin) => plugin.channels.length > 0).map((plugin) => plugin.id);
}
function resolveConfiguredChannelPluginIds(params) {
	const configuredChannelIds = new Set(listPotentialConfiguredChannelIds(params.config, params.env).map((id) => id.trim()));
	if (configuredChannelIds.size === 0) return [];
	return resolveScopedChannelPluginIds({
		...params,
		channelIds: [...configuredChannelIds]
	});
}
function resolveConfiguredDeferredChannelPluginIds(params) {
	const configuredChannelIds = new Set(listPotentialConfiguredChannelIds(params.config, params.env).map((id) => id.trim()));
	if (configuredChannelIds.size === 0) return [];
	return loadPluginManifestRegistry({
		config: params.config,
		workspaceDir: params.workspaceDir,
		env: params.env
	}).plugins.filter((plugin) => plugin.channels.some((channelId) => configuredChannelIds.has(channelId)) && plugin.startupDeferConfiguredChannelFullLoadUntilAfterListen === true).map((plugin) => plugin.id);
}
function resolveGatewayStartupPluginIds(params) {
	const configuredChannelIds = new Set(listPotentialConfiguredChannelIds(params.config, params.env).map((id) => id.trim()));
	const pluginsConfig = normalizePluginsConfig(params.config.plugins);
	const activationSource = createPluginActivationSource({ config: params.activationSourceConfig ?? params.config });
	const requiredAgentHarnessPluginIds = new Set(collectConfiguredAgentHarnessRuntimes(params.activationSourceConfig ?? params.config, params.env).flatMap((runtime) => resolveManifestActivationPluginIds({
		trigger: {
			kind: "agentHarness",
			runtime
		},
		config: params.config,
		workspaceDir: params.workspaceDir,
		env: params.env,
		cache: true
	})));
	const startupDreamingPluginIds = resolveGatewayStartupDreamingPluginIds(params.config);
	const explicitMemorySlotStartupPluginId = resolveExplicitMemorySlotStartupPluginId(params.activationSourceConfig ?? params.config);
	return loadPluginManifestRegistry({
		config: params.config,
		workspaceDir: params.workspaceDir,
		env: params.env
	}).plugins.filter((plugin) => {
		if (plugin.channels.some((channelId) => configuredChannelIds.has(channelId))) return true;
		if (requiredAgentHarnessPluginIds.has(plugin.id)) return resolveEffectivePluginActivationState({
			id: plugin.id,
			origin: plugin.origin,
			config: pluginsConfig,
			rootConfig: params.config,
			enabledByDefault: plugin.enabledByDefault,
			activationSource
		}).enabled;
		if (!shouldConsiderForGatewayStartup({
			plugin,
			startupDreamingPluginIds,
			explicitMemorySlotStartupPluginId
		})) return false;
		const activationState = resolveEffectivePluginActivationState({
			id: plugin.id,
			origin: plugin.origin,
			config: pluginsConfig,
			rootConfig: params.config,
			enabledByDefault: plugin.enabledByDefault,
			activationSource
		});
		if (!activationState.enabled) return false;
		if (plugin.origin !== "bundled") return activationState.explicitlyEnabled;
		return activationState.source === "explicit" || activationState.source === "default";
	}).map((plugin) => plugin.id);
}
//#endregion
export { resolveGatewayStartupPluginIds as a, resolveDiscoverableScopedChannelPluginIds as i, resolveConfiguredChannelPluginIds as n, resolveConfiguredDeferredChannelPluginIds as r, resolveChannelPluginIds as t };
