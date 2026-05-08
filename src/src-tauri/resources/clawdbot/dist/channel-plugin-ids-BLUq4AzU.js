import { s as normalizeOptionalLowercaseString } from "./string-coerce-Bje8XVt9.js";
import { S as resolveDefaultAgentId, x as resolveAgentWorkspaceDir } from "./agent-scope-i10se9ty.js";
import { c as resolveEffectivePluginActivationState, n as createPluginActivationSource, o as normalizePluginsConfig } from "./config-state-Bw_lAn0M.js";
import { t as loadPluginManifestRegistryForInstalledIndex } from "./manifest-registry-installed-B7YTYcgb.js";
import { n as loadPluginManifestRegistryForPluginRegistry, r as normalizePluginsConfigWithRegistry, v as loadPluginRegistrySnapshot, x as createPluginRegistryIdNormalizer } from "./plugin-registry-CZ8QXP5l.js";
import { t as isSafeChannelEnvVarTriggerName } from "./channel-env-var-names-SmU9HdCt.js";
import { i as passesManifestOwnerBasePolicy, n as isActivatedManifestOwner, r as isBundledManifestOwner, t as hasExplicitManifestOwnerTrust } from "./manifest-owner-policy-B1ssLOwR.js";
import { a as collectConfiguredAgentHarnessRuntimes, i as listPotentialConfiguredChannelPresenceSignals, r as listPotentialConfiguredChannelIds, t as hasMeaningfulChannelConfig } from "./config-presence-D-WZXiRB.js";
import { t as collectPluginConfigContractMatches } from "./config-contracts-D19c8FGW.js";
import { t as resolveManifestActivationPluginIds } from "./activation-planner-Dj0gw5wE.js";
import { G as resolveMemoryDreamingConfig, K as resolveMemoryDreamingPluginConfig, _ as DEFAULT_MEMORY_DREAMING_PLUGIN_ID, q as resolveMemoryDreamingPluginId } from "./dreaming-B_EmO0tQ.js";
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
function loadInstalledChannelManifestRecords(params) {
	return loadPluginManifestRegistryForPluginRegistry({
		config: params.config,
		workspaceDir: params.workspaceDir,
		env: params.env,
		cache: params.cache,
		includeDisabled: true
	}).plugins;
}
function resolveConfiguredChannelPresencePolicy(params) {
	const env = params.env ?? process.env;
	const workspaceDir = params.workspaceDir ?? resolveAgentWorkspaceDir(params.config, resolveDefaultAgentId(params.config));
	const records = params.manifestRecords ?? loadInstalledChannelManifestRecords({
		config: params.config,
		workspaceDir,
		env,
		cache: params.cache
	});
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
	const records = params.manifestRecords ?? loadInstalledChannelManifestRecords({
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
			cache: params.cache,
			manifestRecords: records
		});
	}));
	if (candidateIds.length === 0) return [];
	const candidateIdSet = new Set(candidateIds);
	return records.filter((plugin) => {
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
function isRecord(value) {
	return Boolean(value && typeof value === "object" && !Array.isArray(value));
}
function isConfigActivationValueEnabled(value) {
	if (value === false) return false;
	if (isRecord(value) && value.enabled === false) return false;
	return true;
}
function listPotentialEnabledChannelIds(config, env) {
	const disabled = listDisabledChannelIds(config);
	return listPotentialConfiguredChannelIds(config, env, { includePersistedAuthState: false }).map((id) => normalizeOptionalLowercaseString(id) ?? "").filter((id) => id && !disabled.has(id));
}
function isGatewayStartupMemoryPlugin(plugin) {
	return plugin.startup.memory;
}
function isGatewayStartupSidecar(plugin) {
	return plugin.startup.sidecar;
}
function resolveGatewayStartupDreamingPluginIds(config) {
	if (!resolveMemoryDreamingConfig({
		pluginConfig: resolveMemoryDreamingPluginConfig(config),
		cfg: config
	}).enabled) return /* @__PURE__ */ new Set();
	return new Set([DEFAULT_MEMORY_DREAMING_PLUGIN_ID, resolveMemoryDreamingPluginId(config)]);
}
function resolveMemorySlotStartupPluginId(params) {
	const { activationSourceConfig, activationSourcePlugins, normalizePluginId } = params;
	const configuredSlot = activationSourceConfig.plugins?.slots?.memory?.trim();
	if (configuredSlot?.toLowerCase() === "none") return;
	if (!configuredSlot) {
		const defaultSlot = activationSourcePlugins.slots.memory;
		if (typeof defaultSlot !== "string") return;
		if (activationSourcePlugins.allow.length > 0 && !activationSourcePlugins.allow.includes(defaultSlot)) return;
		return defaultSlot;
	}
	return normalizePluginId(configuredSlot);
}
function shouldConsiderForGatewayStartup(params) {
	if (isGatewayStartupSidecar(params.plugin)) return true;
	if (!isGatewayStartupMemoryPlugin(params.plugin)) return false;
	if (params.startupDreamingPluginIds.has(params.plugin.pluginId)) return true;
	return params.memorySlotStartupPluginId === params.plugin.pluginId;
}
function hasConfiguredStartupChannel(params) {
	return listManifestChannelIds(params.manifestRegistry, params.plugin.pluginId).some((channelId) => params.configuredChannelIds.has(channelId));
}
function listManifestChannelIds(manifestRegistry, pluginId) {
	return manifestRegistry.plugins.find((plugin) => plugin.id === pluginId)?.channels ?? [];
}
function findManifestPlugin(manifestRegistry, pluginId) {
	return manifestRegistry.plugins.find((plugin) => plugin.id === pluginId);
}
function hasConfiguredActivationPath(params) {
	const paths = params.manifest?.activation?.onConfigPaths;
	if (!paths?.length) return false;
	return paths.some((pathPattern) => collectPluginConfigContractMatches({
		root: params.config,
		pathPattern
	}).some((match) => isConfigActivationValueEnabled(match.value)));
}
function canStartConfiguredRootPlugin(params) {
	if (params.plugin.origin !== "bundled") return false;
	if (!hasConfiguredActivationPath({
		manifest: params.manifest,
		config: params.config
	})) return false;
	if (!params.pluginsConfig.enabled || !params.activationSourcePlugins.enabled) return false;
	if (params.pluginsConfig.deny.includes(params.plugin.pluginId) || params.activationSourcePlugins.deny.includes(params.plugin.pluginId)) return false;
	if (params.pluginsConfig.entries[params.plugin.pluginId]?.enabled === false || params.activationSourcePlugins.entries[params.plugin.pluginId]?.enabled === false) return false;
	return true;
}
function canStartConfiguredChannelPlugin(params) {
	if (!params.pluginsConfig.enabled) return false;
	if (params.pluginsConfig.deny.includes(params.plugin.pluginId)) return false;
	if (params.pluginsConfig.entries[params.plugin.pluginId]?.enabled === false) return false;
	const explicitBundledChannelConfig = params.plugin.origin === "bundled" && listManifestChannelIds(params.manifestRegistry, params.plugin.pluginId).some((channelId) => hasExplicitChannelConfig({
		config: params.activationSource.rootConfig ?? params.config,
		channelId
	}));
	if (params.pluginsConfig.allow.length > 0 && !params.pluginsConfig.allow.includes(params.plugin.pluginId) && !explicitBundledChannelConfig) return false;
	if (params.plugin.origin === "bundled") return true;
	const activationState = resolveEffectivePluginActivationState({
		id: params.plugin.pluginId,
		origin: params.plugin.origin,
		config: params.pluginsConfig,
		rootConfig: params.config,
		enabledByDefault: params.plugin.enabledByDefault,
		activationSource: params.activationSource
	});
	return activationState.enabled && activationState.explicitlyEnabled;
}
function resolveChannelPluginIds(params) {
	return resolveChannelPluginIdsFromRegistry({ manifestRegistry: loadPluginManifestRegistryForInstalledIndex({
		index: loadPluginRegistrySnapshot({
			config: params.config,
			workspaceDir: params.workspaceDir,
			env: params.env
		}),
		config: params.config,
		workspaceDir: params.workspaceDir,
		env: params.env,
		includeDisabled: true
	}) });
}
function resolveChannelPluginIdsFromRegistry(params) {
	const { manifestRegistry } = params;
	return manifestRegistry.plugins.filter((plugin) => plugin.channels.length > 0).map((plugin) => plugin.id);
}
function resolveConfiguredDeferredChannelPluginIdsFromRegistry(params) {
	const configuredChannelIds = new Set(listPotentialEnabledChannelIds(params.config, params.env));
	if (configuredChannelIds.size === 0) return [];
	const pluginsConfig = normalizePluginsConfigWithRegistry(params.config.plugins, params.index, { manifestRegistry: params.manifestRegistry });
	const activationSource = {
		plugins: pluginsConfig,
		rootConfig: params.config
	};
	return params.index.plugins.filter((plugin) => hasConfiguredStartupChannel({
		plugin,
		manifestRegistry: params.manifestRegistry,
		configuredChannelIds
	}) && plugin.startup.deferConfiguredChannelFullLoadUntilAfterListen && canStartConfiguredChannelPlugin({
		plugin,
		config: params.config,
		pluginsConfig,
		activationSource,
		manifestRegistry: params.manifestRegistry
	})).map((plugin) => plugin.pluginId);
}
function resolveConfiguredDeferredChannelPluginIds(params) {
	const index = loadPluginRegistrySnapshot({
		config: params.config,
		workspaceDir: params.workspaceDir,
		env: params.env
	});
	const manifestRegistry = loadPluginManifestRegistryForInstalledIndex({
		index,
		config: params.config,
		workspaceDir: params.workspaceDir,
		env: params.env,
		includeDisabled: true
	});
	return resolveConfiguredDeferredChannelPluginIdsFromRegistry({
		config: params.config,
		env: params.env,
		index,
		manifestRegistry
	});
}
function resolveGatewayStartupPluginIdsFromRegistry(params) {
	const configuredChannelIds = new Set(listPotentialEnabledChannelIds(params.config, params.env));
	const pluginsConfig = normalizePluginsConfigWithRegistry(params.config.plugins, params.index, { manifestRegistry: params.manifestRegistry });
	const activationSourceConfig = params.activationSourceConfig ?? params.config;
	const activationSourcePlugins = normalizePluginsConfigWithRegistry(activationSourceConfig.plugins, params.index, { manifestRegistry: params.manifestRegistry });
	const activationSource = {
		plugins: activationSourcePlugins,
		rootConfig: activationSourceConfig
	};
	const requiredAgentHarnessRuntimes = new Set(collectConfiguredAgentHarnessRuntimes(activationSourceConfig, params.env));
	const startupDreamingPluginIds = resolveGatewayStartupDreamingPluginIds(params.config);
	const memorySlotStartupPluginId = resolveMemorySlotStartupPluginId({
		activationSourceConfig,
		activationSourcePlugins,
		normalizePluginId: createPluginRegistryIdNormalizer(params.index, { manifestRegistry: params.manifestRegistry })
	});
	return params.index.plugins.filter((plugin) => {
		const manifest = findManifestPlugin(params.manifestRegistry, plugin.pluginId);
		if (hasConfiguredStartupChannel({
			plugin,
			manifestRegistry: params.manifestRegistry,
			configuredChannelIds
		})) return canStartConfiguredChannelPlugin({
			plugin,
			config: params.config,
			pluginsConfig,
			activationSource,
			manifestRegistry: params.manifestRegistry
		});
		if (plugin.startup.agentHarnesses.some((runtime) => requiredAgentHarnessRuntimes.has(runtime))) return resolveEffectivePluginActivationState({
			id: plugin.pluginId,
			origin: plugin.origin,
			config: pluginsConfig,
			rootConfig: params.config,
			enabledByDefault: plugin.enabledByDefault,
			activationSource
		}).enabled;
		if (!shouldConsiderForGatewayStartup({
			plugin,
			startupDreamingPluginIds,
			memorySlotStartupPluginId
		})) return false;
		if (canStartConfiguredRootPlugin({
			plugin,
			manifest,
			config: activationSourceConfig,
			pluginsConfig,
			activationSourcePlugins
		})) return true;
		const activationState = resolveEffectivePluginActivationState({
			id: plugin.pluginId,
			origin: plugin.origin,
			config: pluginsConfig,
			rootConfig: params.config,
			enabledByDefault: plugin.enabledByDefault,
			activationSource
		});
		if (!activationState.enabled) return false;
		if (plugin.origin !== "bundled") return activationState.explicitlyEnabled;
		return activationState.source === "explicit" || activationState.source === "default";
	}).map((plugin) => plugin.pluginId);
}
function resolveGatewayStartupPluginIds(params) {
	const index = loadPluginRegistrySnapshot({
		config: params.config,
		workspaceDir: params.workspaceDir,
		env: params.env
	});
	const manifestRegistry = loadPluginManifestRegistryForInstalledIndex({
		index,
		config: params.config,
		workspaceDir: params.workspaceDir,
		env: params.env,
		includeDisabled: true
	});
	return resolveGatewayStartupPluginIdsFromRegistry({
		config: params.config,
		...params.activationSourceConfig !== void 0 ? { activationSourceConfig: params.activationSourceConfig } : {},
		env: params.env,
		index,
		manifestRegistry
	});
}
//#endregion
export { resolveGatewayStartupPluginIds as a, hasExplicitChannelConfig as c, listExplicitConfiguredChannelIdsForConfig as d, resolveConfiguredChannelPluginIds as f, resolveConfiguredDeferredChannelPluginIdsFromRegistry as i, listConfiguredAnnounceChannelIdsForConfig as l, resolveDiscoverableScopedChannelPluginIds as m, resolveChannelPluginIdsFromRegistry as n, resolveGatewayStartupPluginIdsFromRegistry as o, resolveConfiguredChannelPresencePolicy as p, resolveConfiguredDeferredChannelPluginIds as r, hasConfiguredChannelsForReadOnlyScope as s, resolveChannelPluginIds as t, listConfiguredChannelIdsForReadOnlyScope as u };
