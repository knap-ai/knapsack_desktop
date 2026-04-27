import { s as normalizeOptionalLowercaseString } from "./string-coerce-C1IzJjqi.js";
import { t as loadPluginManifestRegistry } from "./manifest-registry-pYrbrdHJ.js";
import { r as hasKind } from "./slots-ClU32VIo.js";
import { a as normalizePluginId, c as resolveEffectivePluginActivationState, n as createPluginActivationSource, o as normalizePluginsConfig } from "./config-state-UvzNc3si.js";
import { t as isSafeChannelEnvVarTriggerName } from "./channel-env-var-names-BZYQKaGo.js";
import { b as resolveAgentWorkspaceDir, x as resolveDefaultAgentId } from "./agent-scope-_6dFncNS.js";
import { a as collectConfiguredAgentHarnessRuntimes, c as isBundledManifestOwner, i as listPotentialConfiguredChannelPresenceSignals, l as passesManifestOwnerBasePolicy, o as hasExplicitManifestOwnerTrust, r as listPotentialConfiguredChannelIds, s as isActivatedManifestOwner, t as hasMeaningfulChannelConfig } from "./config-presence-CO6lJB79.js";
import { t as resolveManifestActivationPluginIds } from "./activation-planner-BpVQ6KIv.js";
import { I as resolveMemoryDreamingConfig, L as resolveMemoryDreamingPluginConfig, R as resolveMemoryDreamingPluginId, _ as DEFAULT_MEMORY_DREAMING_PLUGIN_ID } from "./dreaming-K8xreO0H.js";
//#region src/plugins/channel-presence-policy.ts
const IGNORED_CHANNEL_CONFIG_KEYS = new Set(["defaults", "modelByChannel"]);
function dedupeSortedPluginIds(values) {
	return [...new Set(values)].toSorted((left, right) => left.localeCompare(right));
}
function normalizeChannelIds(channelIds) {
	return Array.from(new Set([...channelIds].map((channelId) => normalizeOptionalLowercaseString(channelId)).filter((channelId) => Boolean(channelId)))).toSorted((left, right) => left.localeCompare(right));
}
function hasNonEmptyEnvValue(env, key) {
	if (!isSafeChannelEnvVarTriggerName(key)) return false;
	const trimmed = key.trim();
	const value = env[trimmed] ?? env[trimmed.toUpperCase()];
	return typeof value === "string" && value.trim().length > 0;
}
function hasExplicitChannelConfig(params) {
	const channels = params.config.channels;
	if (!channels || typeof channels !== "object" || Array.isArray(channels)) return false;
	const entry = channels[params.channelId];
	if (!entry || typeof entry !== "object" || Array.isArray(entry)) return false;
	const enabled = entry.enabled;
	if (enabled === false) return false;
	return enabled === true || hasMeaningfulChannelConfig(entry);
}
function listExplicitConfiguredChannelIdsForConfig(config) {
	const channels = config.channels;
	if (!channels || typeof channels !== "object" || Array.isArray(channels)) return [];
	return Object.keys(channels).filter((channelId) => !IGNORED_CHANNEL_CONFIG_KEYS.has(channelId) && hasExplicitChannelConfig({
		config,
		channelId
	})).toSorted((left, right) => left.localeCompare(right));
}
function recordDeclaresChannel(record, channelId) {
	const normalizedChannelId = normalizeOptionalLowercaseString(channelId) ?? "";
	if (!normalizedChannelId) return false;
	return record.channels.some((ownedChannelId) => (normalizeOptionalLowercaseString(ownedChannelId) ?? "") === normalizedChannelId);
}
function listManifestEnvConfiguredChannelSignals(params) {
	const signals = [];
	const seen = /* @__PURE__ */ new Set();
	const trustConfig = params.activationSourceConfig ?? params.config;
	const normalizedConfig = normalizePluginsConfig(trustConfig.plugins);
	for (const record of params.records) {
		if (!isChannelPluginEligibleForScopedOwnership({
			plugin: record,
			normalizedConfig,
			rootConfig: trustConfig
		})) continue;
		for (const channelId of record.channels) {
			if (!(record.channelEnvVars?.[channelId] ?? []).some((envVar) => hasNonEmptyEnvValue(params.env, envVar))) continue;
			if (seen.has(channelId)) continue;
			seen.add(channelId);
			signals.push({
				channelId,
				source: "manifest-env"
			});
		}
	}
	return signals.toSorted((left, right) => left.channelId.localeCompare(right.channelId));
}
function normalizeActivationBlockedReason(reason) {
	switch (reason) {
		case "plugins disabled": return "plugins-disabled";
		case "blocked by denylist": return "blocked-by-denylist";
		case "disabled in config": return "plugin-disabled";
		case "not in allowlist": return "not-in-allowlist";
		case "workspace plugin (disabled by default)": return "workspace-disabled-by-default";
		case "bundled (disabled by default)": return "bundled-disabled-by-default";
		default: return "not-activated";
	}
}
function resolveBasePolicyBlockedReason(params) {
	if (!params.normalizedConfig.enabled) return "plugins-disabled";
	if (params.normalizedConfig.deny.includes(params.plugin.id)) return "blocked-by-denylist";
	if (params.normalizedConfig.entries[params.plugin.id]?.enabled === false) return "plugin-disabled";
	if (params.allowRestrictiveAllowlistBypass !== true && params.normalizedConfig.allow.length > 0 && !params.normalizedConfig.allow.includes(params.plugin.id)) return "not-in-allowlist";
	return null;
}
function isChannelPluginEligibleForScopedOwnership(params) {
	const allowRestrictiveAllowlistBypass = params.channelId !== void 0 && isBundledManifestOwner(params.plugin) && hasExplicitChannelConfig({
		config: params.rootConfig,
		channelId: params.channelId
	});
	if (!passesManifestOwnerBasePolicy({
		plugin: params.plugin,
		normalizedConfig: params.normalizedConfig,
		allowRestrictiveAllowlistBypass
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
function evaluateEffectiveChannelPlugin(params) {
	const explicitBundledChannelConfig = isBundledManifestOwner(params.plugin) && hasExplicitChannelConfig({
		config: params.activationSource.rootConfig ?? params.config,
		channelId: params.channelId
	});
	const baseBlockedReason = resolveBasePolicyBlockedReason({
		plugin: params.plugin,
		normalizedConfig: params.normalizedConfig,
		allowRestrictiveAllowlistBypass: explicitBundledChannelConfig
	});
	if (baseBlockedReason) return {
		effective: false,
		pluginId: params.plugin.id,
		blockedReason: baseBlockedReason
	};
	if (!isBundledManifestOwner(params.plugin)) {
		if (params.plugin.origin === "global" || params.plugin.origin === "config") return hasExplicitManifestOwnerTrust({
			plugin: params.plugin,
			normalizedConfig: params.normalizedConfig
		}) ? {
			effective: true,
			pluginId: params.plugin.id
		} : {
			effective: false,
			pluginId: params.plugin.id,
			blockedReason: "untrusted-plugin"
		};
		return isActivatedManifestOwner({
			plugin: params.plugin,
			normalizedConfig: params.normalizedConfig,
			rootConfig: params.activationSource.rootConfig
		}) ? {
			effective: true,
			pluginId: params.plugin.id
		} : {
			effective: false,
			pluginId: params.plugin.id,
			blockedReason: "untrusted-plugin"
		};
	}
	if (explicitBundledChannelConfig) return {
		effective: true,
		pluginId: params.plugin.id
	};
	const activationState = resolveEffectivePluginActivationState({
		id: params.plugin.id,
		origin: params.plugin.origin,
		config: params.normalizedConfig,
		rootConfig: params.config,
		enabledByDefault: params.plugin.enabledByDefault,
		activationSource: params.activationSource
	});
	return activationState.enabled ? {
		effective: true,
		pluginId: params.plugin.id
	} : {
		effective: false,
		pluginId: params.plugin.id,
		blockedReason: normalizeActivationBlockedReason(activationState.reason)
	};
}
function addPolicySignal(entries, channelId, source) {
	const normalized = normalizeOptionalLowercaseString(channelId);
	if (!normalized) return;
	let sources = entries.get(normalized);
	if (!sources) {
		sources = /* @__PURE__ */ new Set();
		entries.set(normalized, sources);
	}
	sources.add(source);
}
function listDisabledChannelIdsForConfig(config) {
	const channels = config.channels;
	if (!channels || typeof channels !== "object" || Array.isArray(channels)) return [];
	return Object.entries(channels).filter(([, value]) => {
		return value && typeof value === "object" && !Array.isArray(value) && value.enabled === false;
	}).map(([channelId]) => normalizeOptionalLowercaseString(channelId)).filter((channelId) => Boolean(channelId));
}
function resolveConfiguredChannelPresencePolicy(params) {
	const env = params.env ?? process.env;
	const workspaceDir = params.workspaceDir ?? resolveAgentWorkspaceDir(params.config, resolveDefaultAgentId(params.config));
	const records = params.manifestRecords ?? loadPluginManifestRegistry({
		config: params.config,
		workspaceDir,
		env,
		cache: params.cache
	}).plugins;
	const disabledChannelIds = new Set(listDisabledChannelIdsForConfig(params.config));
	const entrySources = /* @__PURE__ */ new Map();
	for (const channelId of listExplicitConfiguredChannelIdsForConfig(params.config)) addPolicySignal(entrySources, channelId, "explicit-config");
	for (const signal of listPotentialConfiguredChannelPresenceSignals(params.config, env, { includePersistedAuthState: params.includePersistedAuthState })) {
		if (signal.source === "config") continue;
		addPolicySignal(entrySources, signal.channelId, signal.source);
	}
	for (const signal of listManifestEnvConfiguredChannelSignals({
		records,
		config: params.config,
		activationSourceConfig: params.activationSourceConfig,
		env
	})) addPolicySignal(entrySources, signal.channelId, signal.source);
	for (const channelId of disabledChannelIds) entrySources.delete(channelId);
	const activationSource = createPluginActivationSource({ config: params.activationSourceConfig ?? params.config });
	const normalizedConfig = activationSource.plugins;
	const entries = [];
	for (const channelId of normalizeChannelIds(entrySources.keys())) {
		const owningRecords = records.filter((record) => recordDeclaresChannel(record, channelId));
		const evaluations = owningRecords.map((plugin) => evaluateEffectiveChannelPlugin({
			plugin,
			channelId,
			normalizedConfig,
			config: params.config,
			activationSource
		}));
		const effectivePluginIds = evaluations.filter((entry) => entry.effective).map((entry) => entry.pluginId);
		const blockedReasons = owningRecords.length === 0 ? ["no-channel-owner"] : [...new Set(evaluations.map((entry) => entry.blockedReason).filter((reason) => Boolean(reason)))].toSorted((left, right) => left.localeCompare(right));
		entries.push({
			channelId,
			sources: [...entrySources.get(channelId) ?? []].toSorted((left, right) => left.localeCompare(right)),
			effective: effectivePluginIds.length > 0,
			pluginIds: dedupeSortedPluginIds(effectivePluginIds),
			blockedReasons
		});
	}
	return entries;
}
function listConfiguredChannelIdsForReadOnlyScope(params) {
	return resolveConfiguredChannelPresencePolicy(params).filter((entry) => entry.effective).map((entry) => entry.channelId);
}
function hasConfiguredChannelsForReadOnlyScope(params) {
	return listConfiguredChannelIdsForReadOnlyScope(params).length > 0;
}
function listConfiguredAnnounceChannelIdsForConfig(params) {
	const disabledChannelIds = new Set(listDisabledChannelIdsForConfig(params.config));
	return normalizeChannelIds([...listExplicitConfiguredChannelIdsForConfig(params.config), ...listConfiguredChannelIdsForReadOnlyScope({
		config: params.config,
		activationSourceConfig: params.activationSourceConfig,
		workspaceDir: params.workspaceDir,
		env: params.env,
		cache: params.cache,
		includePersistedAuthState: false
	})]).filter((channelId) => !disabledChannelIds.has(channelId));
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
			rootConfig: trustConfig,
			channelId: channelIds.find((channelId) => recordDeclaresChannel(plugin, channelId))
		});
	}).map((plugin) => plugin.id).toSorted((left, right) => left.localeCompare(right));
}
function resolveDiscoverableScopedChannelPluginIds(params) {
	return resolveScopedChannelOwnerPluginIds(params);
}
function resolveConfiguredChannelPluginIds(params) {
	const configuredChannelIds = normalizeChannelIds([...listConfiguredChannelIdsForReadOnlyScope({
		config: params.config,
		activationSourceConfig: params.activationSourceConfig,
		workspaceDir: params.workspaceDir,
		env: params.env
	}), ...listExplicitConfiguredChannelIdsForConfig(params.activationSourceConfig ?? params.config)]);
	if (configuredChannelIds.length === 0) return [];
	return resolveScopedChannelOwnerPluginIds({
		...params,
		channelIds: configuredChannelIds
	});
}
//#endregion
//#region src/plugins/gateway-startup-plugin-ids.ts
function listDisabledChannelIds(config) {
	const channels = config.channels;
	if (!channels || typeof channels !== "object" || Array.isArray(channels)) return /* @__PURE__ */ new Set();
	return new Set(Object.entries(channels).filter(([, value]) => {
		return value && typeof value === "object" && !Array.isArray(value) && value.enabled === false;
	}).map(([channelId]) => normalizeOptionalLowercaseString(channelId)).filter((channelId) => Boolean(channelId)));
}
function listPotentialEnabledChannelIds(config, env) {
	const disabled = listDisabledChannelIds(config);
	return listPotentialConfiguredChannelIds(config, env).map((id) => normalizeOptionalLowercaseString(id) ?? "").filter((id) => id && !disabled.has(id));
}
function hasRuntimeContractSurface(plugin) {
	return Boolean(plugin.providers.length > 0 || plugin.cliBackends.length > 0 || plugin.contracts?.speechProviders?.length || plugin.contracts?.mediaUnderstandingProviders?.length || plugin.contracts?.documentExtractors?.length || plugin.contracts?.imageGenerationProviders?.length || plugin.contracts?.videoGenerationProviders?.length || plugin.contracts?.musicGenerationProviders?.length || plugin.contracts?.webContentExtractors?.length || plugin.contracts?.webFetchProviders?.length || plugin.contracts?.webSearchProviders?.length || plugin.contracts?.memoryEmbeddingProviders?.length || hasKind(plugin.kind, "memory"));
}
function isGatewayStartupMemoryPlugin(plugin) {
	return hasKind(plugin.kind, "memory");
}
function isGatewayStartupSidecar(plugin) {
	return plugin.channels.length === 0 && !hasRuntimeContractSurface(plugin);
}
function resolveGatewayStartupDreamingPluginIds(config) {
	if (!resolveMemoryDreamingConfig({
		pluginConfig: resolveMemoryDreamingPluginConfig(config),
		cfg: config
	}).enabled) return /* @__PURE__ */ new Set();
	return new Set([DEFAULT_MEMORY_DREAMING_PLUGIN_ID, resolveMemoryDreamingPluginId(config)]);
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
function hasConfiguredStartupChannel(params) {
	return params.plugin.channels.some((channelId) => params.configuredChannelIds.has(channelId));
}
function canStartConfiguredChannelPlugin(params) {
	if (!params.pluginsConfig.enabled) return false;
	if (params.pluginsConfig.deny.includes(params.plugin.id)) return false;
	if (params.pluginsConfig.entries[params.plugin.id]?.enabled === false) return false;
	const explicitBundledChannelConfig = params.plugin.origin === "bundled" && params.plugin.channels.some((channelId) => hasExplicitChannelConfig({
		config: params.activationSource.rootConfig ?? params.config,
		channelId
	}));
	if (params.pluginsConfig.allow.length > 0 && !params.pluginsConfig.allow.includes(params.plugin.id) && !explicitBundledChannelConfig) return false;
	if (params.plugin.origin === "bundled") return true;
	const activationState = resolveEffectivePluginActivationState({
		id: params.plugin.id,
		origin: params.plugin.origin,
		config: params.pluginsConfig,
		rootConfig: params.config,
		enabledByDefault: params.plugin.enabledByDefault,
		activationSource: params.activationSource
	});
	return activationState.enabled && activationState.explicitlyEnabled;
}
function resolveChannelPluginIds(params) {
	return loadPluginManifestRegistry({
		config: params.config,
		workspaceDir: params.workspaceDir,
		env: params.env
	}).plugins.filter((plugin) => plugin.channels.length > 0).map((plugin) => plugin.id);
}
function resolveConfiguredDeferredChannelPluginIds(params) {
	const configuredChannelIds = new Set(listPotentialEnabledChannelIds(params.config, params.env));
	if (configuredChannelIds.size === 0) return [];
	const pluginsConfig = normalizePluginsConfig(params.config.plugins);
	const activationSource = createPluginActivationSource({ config: params.config });
	return loadPluginManifestRegistry({
		config: params.config,
		workspaceDir: params.workspaceDir,
		env: params.env
	}).plugins.filter((plugin) => hasConfiguredStartupChannel({
		plugin,
		configuredChannelIds
	}) && plugin.startupDeferConfiguredChannelFullLoadUntilAfterListen === true && canStartConfiguredChannelPlugin({
		plugin,
		config: params.config,
		pluginsConfig,
		activationSource
	})).map((plugin) => plugin.id);
}
function resolveGatewayStartupPluginIds(params) {
	const configuredChannelIds = new Set(listPotentialEnabledChannelIds(params.config, params.env));
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
		if (hasConfiguredStartupChannel({
			plugin,
			configuredChannelIds
		})) return canStartConfiguredChannelPlugin({
			plugin,
			config: params.config,
			pluginsConfig,
			activationSource
		});
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
export { hasExplicitChannelConfig as a, listExplicitConfiguredChannelIdsForConfig as c, resolveDiscoverableScopedChannelPluginIds as d, hasConfiguredChannelsForReadOnlyScope as i, resolveConfiguredChannelPluginIds as l, resolveConfiguredDeferredChannelPluginIds as n, listConfiguredAnnounceChannelIdsForConfig as o, resolveGatewayStartupPluginIds as r, listConfiguredChannelIdsForReadOnlyScope as s, resolveChannelPluginIds as t, resolveConfiguredChannelPresencePolicy as u };
