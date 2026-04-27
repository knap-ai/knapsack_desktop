import { c as normalizeOptionalString, s as normalizeOptionalLowercaseString } from "./string-coerce-C1IzJjqi.js";
import { f as resolveConfigDir, l as isRecord, m as resolveUserPath } from "./utils-BMRcljdi.js";
import { r as normalizeChatChannelId } from "./ids-2bZIXJNM.js";
import { t as isBlockedObjectKey } from "./prototype-keys-CL1-mnaY.js";
import { s as normalizeStringEntries } from "./string-normalization-Bvcn03I9.js";
import { n as resolveManifestContractOwnerPluginId, r as resolveManifestContractPluginIds, t as loadPluginManifestRegistry } from "./manifest-registry-pYrbrdHJ.js";
import { c as resolveEffectivePluginActivationState, o as normalizePluginsConfig } from "./config-state-UvzNc3si.js";
import { r as normalizeProviderId } from "./provider-id-BLh32HP1.js";
import { s as getChatChannelMeta } from "./registry-B9khhdbq.js";
import { r as withBundledPluginVitestCompat } from "./bundled-compat-DMGPGgc3.js";
import { a as collectConfiguredAgentHarnessRuntimes, l as passesManifestOwnerBasePolicy, n as hasPotentialConfiguredChannels, r as listPotentialConfiguredChannelIds, s as isActivatedManifestOwner } from "./config-presence-CO6lJB79.js";
import { i as createPluginIdScopeSet } from "./persisted-auth-state-DdqnHcUm.js";
import { t as resolvePluginSetupAutoEnableReasons } from "./setup-registry-Del9y1XK.js";
import { t as isChannelConfigured } from "./channel-configured-DUn6ASTQ.js";
import { t as ensurePluginAllowlisted } from "./plugins-allowlist-B77WZT3v.js";
import fs from "node:fs";
import path from "node:path";
//#region src/plugins/providers.ts
function loadProviderManifestRegistry(params) {
	return loadPluginManifestRegistry({
		config: params.config,
		workspaceDir: params.workspaceDir,
		env: params.env
	});
}
function loadScopedProviderManifestRegistry(params) {
	return {
		registry: loadProviderManifestRegistry(params),
		onlyPluginIdSet: createPluginIdScopeSet(params.onlyPluginIds)
	};
}
function listManifestPluginIds(registry, predicate) {
	return registry.plugins.filter(predicate).map((plugin) => plugin.id).toSorted((left, right) => left.localeCompare(right));
}
function resolveProviderOwnerPluginIds(params) {
	if (params.pluginIds.length === 0) return [];
	const pluginIdSet = new Set(params.pluginIds);
	const registry = loadProviderManifestRegistry(params);
	const normalizedConfig = normalizePluginsConfig(params.config?.plugins);
	return listManifestPluginIds(registry, (plugin) => pluginIdSet.has(plugin.id) && params.isEligible(plugin, normalizedConfig));
}
function withBundledProviderVitestCompat(params) {
	return withBundledPluginVitestCompat(params);
}
function resolveBundledProviderCompatPluginIds(params) {
	const { registry, onlyPluginIdSet } = loadScopedProviderManifestRegistry(params);
	return listManifestPluginIds(registry, (plugin) => plugin.origin === "bundled" && plugin.providers.length > 0 && (!onlyPluginIdSet || onlyPluginIdSet.has(plugin.id)));
}
function resolveEnabledProviderPluginIds(params) {
	const { registry, onlyPluginIdSet } = loadScopedProviderManifestRegistry(params);
	const normalizedConfig = normalizePluginsConfig(params.config?.plugins);
	return listManifestPluginIds(registry, (plugin) => plugin.providers.length > 0 && (!onlyPluginIdSet || onlyPluginIdSet.has(plugin.id)) && resolveEffectivePluginActivationState({
		id: plugin.id,
		origin: plugin.origin,
		config: normalizedConfig,
		rootConfig: params.config,
		enabledByDefault: plugin.enabledByDefault
	}).activated);
}
function resolveExternalAuthProfileProviderPluginIds(params) {
	return resolveManifestContractPluginIds({
		contract: "externalAuthProviders",
		config: params.config,
		workspaceDir: params.workspaceDir,
		env: params.env
	});
}
function resolveExternalAuthProfileCompatFallbackPluginIds(params) {
	const declaredPluginIds = params.declaredPluginIds ?? new Set(resolveExternalAuthProfileProviderPluginIds(params));
	const registry = loadProviderManifestRegistry(params);
	const normalizedConfig = normalizePluginsConfig(params.config?.plugins);
	return listManifestPluginIds(registry, (plugin) => plugin.origin !== "bundled" && plugin.providers.length > 0 && !declaredPluginIds.has(plugin.id) && isProviderPluginEligibleForRuntimeOwnerActivation({
		plugin,
		normalizedConfig,
		rootConfig: params.config
	}));
}
function resolveDiscoveredProviderPluginIds(params) {
	const { registry, onlyPluginIdSet } = loadScopedProviderManifestRegistry(params);
	const shouldFilterUntrustedWorkspacePlugins = params.includeUntrustedWorkspacePlugins === false;
	const normalizedConfig = normalizePluginsConfig(params.config?.plugins);
	return listManifestPluginIds(registry, (plugin) => {
		if (!(plugin.providers.length > 0 && (!onlyPluginIdSet || onlyPluginIdSet.has(plugin.id)))) return false;
		return isProviderPluginEligibleForSetupDiscovery({
			plugin,
			shouldFilterUntrustedWorkspacePlugins,
			normalizedConfig,
			rootConfig: params.config
		});
	});
}
function isProviderPluginEligibleForSetupDiscovery(params) {
	if (!params.shouldFilterUntrustedWorkspacePlugins || params.plugin.origin !== "workspace") return true;
	if (!passesManifestOwnerBasePolicy({
		plugin: params.plugin,
		normalizedConfig: params.normalizedConfig
	})) return false;
	return isActivatedManifestOwner({
		plugin: params.plugin,
		normalizedConfig: params.normalizedConfig,
		rootConfig: params.rootConfig
	});
}
function resolveDiscoverableProviderOwnerPluginIds(params) {
	const shouldFilterUntrustedWorkspacePlugins = params.includeUntrustedWorkspacePlugins === false;
	return resolveProviderOwnerPluginIds({
		...params,
		isEligible: (plugin, normalizedConfig) => isProviderPluginEligibleForSetupDiscovery({
			plugin,
			shouldFilterUntrustedWorkspacePlugins,
			normalizedConfig,
			rootConfig: params.config
		})
	});
}
function isProviderPluginEligibleForRuntimeOwnerActivation(params) {
	if (!passesManifestOwnerBasePolicy({
		plugin: params.plugin,
		normalizedConfig: params.normalizedConfig
	})) return false;
	if (params.plugin.origin !== "workspace") return true;
	return isActivatedManifestOwner({
		plugin: params.plugin,
		normalizedConfig: params.normalizedConfig,
		rootConfig: params.rootConfig
	});
}
function resolveActivatableProviderOwnerPluginIds(params) {
	return resolveProviderOwnerPluginIds({
		...params,
		isEligible: (plugin, normalizedConfig) => isProviderPluginEligibleForRuntimeOwnerActivation({
			plugin,
			normalizedConfig,
			rootConfig: params.config
		})
	});
}
function resolveManifestRegistry(params) {
	return params.manifestRegistry ?? loadProviderManifestRegistry(params);
}
function stripModelProfileSuffix(value) {
	const trimmed = value.trim();
	const at = trimmed.indexOf("@");
	return at <= 0 ? trimmed : trimmed.slice(0, at).trim();
}
function splitExplicitModelRef(rawModel) {
	const trimmed = rawModel.trim();
	if (!trimmed) return null;
	const slash = trimmed.indexOf("/");
	if (slash === -1) {
		const modelId = stripModelProfileSuffix(trimmed);
		return modelId ? { modelId } : null;
	}
	const provider = normalizeProviderId(trimmed.slice(0, slash));
	const modelId = stripModelProfileSuffix(trimmed.slice(slash + 1));
	if (!provider || !modelId) return null;
	return {
		provider,
		modelId
	};
}
function resolveModelSupportMatchKind(plugin, modelId) {
	const patterns = plugin.modelSupport?.modelPatterns ?? [];
	for (const patternSource of patterns) try {
		if (new RegExp(patternSource, "u").test(modelId)) return "pattern";
	} catch {
		continue;
	}
	const prefixes = plugin.modelSupport?.modelPrefixes ?? [];
	for (const prefix of prefixes) if (modelId.startsWith(prefix)) return "prefix";
}
function dedupeSortedPluginIds(values) {
	return [...new Set(values)].toSorted((left, right) => left.localeCompare(right));
}
function resolvePreferredManifestPluginIds(registry, matchedPluginIds) {
	if (matchedPluginIds.length === 0) return;
	const uniquePluginIds = dedupeSortedPluginIds(matchedPluginIds);
	if (uniquePluginIds.length <= 1) return uniquePluginIds;
	const nonBundledPluginIds = uniquePluginIds.filter((pluginId) => {
		return registry.plugins.find((entry) => entry.id === pluginId)?.origin !== "bundled";
	});
	if (nonBundledPluginIds.length === 1) return nonBundledPluginIds;
	if (nonBundledPluginIds.length > 1) return;
}
function resolveOwningPluginIdsForProvider(params) {
	const normalizedProvider = normalizeProviderId(params.provider);
	if (!normalizedProvider) return;
	const pluginIds = resolveManifestRegistry(params).plugins.filter((plugin) => plugin.providers.some((providerId) => normalizeProviderId(providerId) === normalizedProvider) || plugin.cliBackends.some((backendId) => normalizeProviderId(backendId) === normalizedProvider)).map((plugin) => plugin.id);
	return pluginIds.length > 0 ? pluginIds : void 0;
}
function resolveOwningPluginIdsForModelRef(params) {
	const parsed = splitExplicitModelRef(params.model);
	if (!parsed) return;
	if (parsed.provider) return resolveOwningPluginIdsForProvider({
		provider: parsed.provider,
		config: params.config,
		workspaceDir: params.workspaceDir,
		env: params.env,
		manifestRegistry: params.manifestRegistry
	});
	const registry = resolveManifestRegistry(params);
	const preferredPatternPluginIds = resolvePreferredManifestPluginIds(registry, registry.plugins.filter((plugin) => resolveModelSupportMatchKind(plugin, parsed.modelId) === "pattern").map((plugin) => plugin.id));
	if (preferredPatternPluginIds) return preferredPatternPluginIds;
	return resolvePreferredManifestPluginIds(registry, registry.plugins.filter((plugin) => resolveModelSupportMatchKind(plugin, parsed.modelId) === "prefix").map((plugin) => plugin.id));
}
function resolveOwningPluginIdsForModelRefs(params) {
	const registry = resolveManifestRegistry(params);
	return dedupeSortedPluginIds(params.models.flatMap((model) => resolveOwningPluginIdsForModelRef({
		model,
		config: params.config,
		workspaceDir: params.workspaceDir,
		env: params.env,
		manifestRegistry: registry
	}) ?? []));
}
function resolveCatalogHookProviderPluginIds(params) {
	const registry = loadProviderManifestRegistry(params);
	const normalizedConfig = normalizePluginsConfig(params.config?.plugins);
	const enabledProviderPluginIds = listManifestPluginIds(registry, (plugin) => plugin.providers.length > 0 && resolveEffectivePluginActivationState({
		id: plugin.id,
		origin: plugin.origin,
		config: normalizedConfig,
		rootConfig: params.config,
		enabledByDefault: plugin.enabledByDefault
	}).activated);
	const bundledCompatPluginIds = resolveBundledProviderCompatPluginIds(params);
	return [...new Set([...enabledProviderPluginIds, ...bundledCompatPluginIds])].toSorted((left, right) => left.localeCompare(right));
}
//#endregion
//#region src/config/plugin-auto-enable.prefer-over.ts
const ENV_CATALOG_PATHS = ["OPENCLAW_PLUGIN_CATALOG_PATHS", "OPENCLAW_MPM_CATALOG_PATHS"];
function splitEnvPaths(value) {
	const trimmed = normalizeOptionalString(value) ?? "";
	if (!trimmed) return [];
	return normalizeStringEntries(trimmed.split(/[;,]/g).flatMap((chunk) => chunk.split(path.delimiter)));
}
function resolveExternalCatalogPaths(env) {
	for (const key of ENV_CATALOG_PATHS) {
		const raw = normalizeOptionalString(env[key]);
		if (raw) return splitEnvPaths(raw);
	}
	const configDir = resolveConfigDir(env);
	return [
		path.join(configDir, "mpm", "plugins.json"),
		path.join(configDir, "mpm", "catalog.json"),
		path.join(configDir, "plugins", "catalog.json")
	];
}
function parseExternalCatalogChannelEntries(raw) {
	const list = (() => {
		if (Array.isArray(raw)) return raw;
		if (!isRecord(raw)) return [];
		const entries = raw.entries ?? raw.packages ?? raw.plugins;
		return Array.isArray(entries) ? entries : [];
	})();
	const channels = [];
	for (const entry of list) {
		if (!isRecord(entry) || !isRecord(entry.openclaw) || !isRecord(entry.openclaw.channel)) continue;
		const channel = entry.openclaw.channel;
		const id = normalizeOptionalString(channel.id) ?? "";
		if (!id) continue;
		const preferOver = Array.isArray(channel.preferOver) ? channel.preferOver.filter((value) => typeof value === "string") : [];
		channels.push({
			id,
			preferOver
		});
	}
	return channels;
}
function resolveExternalCatalogPreferOver(channelId, env) {
	for (const rawPath of resolveExternalCatalogPaths(env)) {
		const resolved = resolveUserPath(rawPath, env);
		if (!fs.existsSync(resolved)) continue;
		try {
			const channel = parseExternalCatalogChannelEntries(JSON.parse(fs.readFileSync(resolved, "utf-8"))).find((entry) => entry.id === channelId);
			if (channel) return channel.preferOver;
		} catch {}
	}
	return [];
}
function resolveBuiltInChannelPreferOver(channelId) {
	const builtInChannelId = normalizeChatChannelId(channelId);
	if (!builtInChannelId) return [];
	return getChatChannelMeta(builtInChannelId)?.preferOver ?? [];
}
function resolvePreferredOverIds(candidate, env, registry) {
	const channelId = candidate.kind === "channel-configured" ? candidate.channelId : candidate.pluginId;
	const installedPlugin = registry.plugins.find((record) => record.id === candidate.pluginId);
	const manifestChannelPreferOver = installedPlugin?.channelConfigs?.[channelId]?.preferOver;
	if (manifestChannelPreferOver?.length) return [...manifestChannelPreferOver];
	const installedChannelMeta = installedPlugin?.channelCatalogMeta;
	if (installedChannelMeta?.preferOver?.length) return [...installedChannelMeta.preferOver];
	const builtInChannelPreferOver = resolveBuiltInChannelPreferOver(channelId);
	if (builtInChannelPreferOver.length) return [...builtInChannelPreferOver];
	return resolveExternalCatalogPreferOver(channelId, env);
}
function getPluginAutoEnableCandidateCacheKey(candidate) {
	return `${candidate.pluginId}:${candidate.kind === "channel-configured" ? candidate.channelId : candidate.pluginId}`;
}
function shouldSkipPreferredPluginAutoEnable(params) {
	const getPreferredOverIds = (candidate) => {
		const cacheKey = getPluginAutoEnableCandidateCacheKey(candidate);
		const cached = params.preferOverCache.get(cacheKey);
		if (cached) return cached;
		const resolved = resolvePreferredOverIds(candidate, params.env, params.registry);
		params.preferOverCache.set(cacheKey, resolved);
		return resolved;
	};
	for (const other of params.configured) {
		if (other.pluginId === params.entry.pluginId) continue;
		if (params.isPluginDenied(params.config, other.pluginId) || params.isPluginExplicitlyDisabled(params.config, other.pluginId)) continue;
		if (getPreferredOverIds(other).includes(params.entry.pluginId)) return true;
	}
	return false;
}
//#endregion
//#region src/config/plugin-auto-enable.shared.ts
const EMPTY_PLUGIN_MANIFEST_REGISTRY = {
	plugins: [],
	diagnostics: []
};
function resolveAutoEnableProviderPluginIds(registry) {
	const entries = /* @__PURE__ */ new Map();
	for (const plugin of registry.plugins) for (const providerId of plugin.autoEnableWhenConfiguredProviders ?? []) if (!entries.has(providerId)) entries.set(providerId, plugin.id);
	return Object.fromEntries(entries);
}
function collectModelRefs(cfg) {
	const refs = [];
	const pushModelRef = (value) => {
		if (typeof value === "string" && value.trim()) refs.push(value.trim());
	};
	const collectFromAgent = (agent) => {
		if (!agent) return;
		const model = agent.model;
		if (typeof model === "string") pushModelRef(model);
		else if (isRecord(model)) {
			pushModelRef(model.primary);
			const fallbacks = model.fallbacks;
			if (Array.isArray(fallbacks)) for (const entry of fallbacks) pushModelRef(entry);
		}
		const models = agent.models;
		if (isRecord(models)) for (const key of Object.keys(models)) pushModelRef(key);
	};
	collectFromAgent(cfg.agents?.defaults);
	const list = cfg.agents?.list;
	if (Array.isArray(list)) {
		for (const entry of list) if (isRecord(entry)) collectFromAgent(entry);
	}
	return refs;
}
function extractProviderFromModelRef(value) {
	const trimmed = value.trim();
	const slash = trimmed.indexOf("/");
	if (slash <= 0) return null;
	return normalizeProviderId(trimmed.slice(0, slash));
}
function hasConfiguredEmbeddedHarnessRuntime(cfg, env) {
	return collectConfiguredAgentHarnessRuntimes(cfg, env).length > 0;
}
function resolveAgentHarnessOwnerPluginIds(registry, runtime) {
	const normalizedRuntime = normalizeOptionalLowercaseString(runtime);
	if (!normalizedRuntime) return [];
	return registry.plugins.filter((plugin) => (plugin.activation?.onAgentHarnesses ?? []).some((entry) => normalizeOptionalLowercaseString(entry) === normalizedRuntime)).map((plugin) => plugin.id).toSorted((left, right) => left.localeCompare(right));
}
function isProviderConfigured(cfg, providerId) {
	const normalized = normalizeProviderId(providerId);
	const profiles = cfg.auth?.profiles;
	if (profiles && typeof profiles === "object") for (const profile of Object.values(profiles)) {
		if (!isRecord(profile)) continue;
		if (normalizeProviderId(profile.provider ?? "") === normalized) return true;
	}
	const providerConfig = cfg.models?.providers;
	if (providerConfig && typeof providerConfig === "object") {
		for (const key of Object.keys(providerConfig)) if (normalizeProviderId(key) === normalized) return true;
	}
	for (const ref of collectModelRefs(cfg)) {
		const provider = extractProviderFromModelRef(ref);
		if (provider && provider === normalized) return true;
	}
	return false;
}
function hasPluginOwnedWebSearchConfig(cfg, pluginId) {
	const pluginConfig = cfg.plugins?.entries?.[pluginId]?.config;
	return isRecord(pluginConfig) && isRecord(pluginConfig.webSearch);
}
function hasPluginOwnedWebFetchConfig(cfg, pluginId) {
	const pluginConfig = cfg.plugins?.entries?.[pluginId]?.config;
	return isRecord(pluginConfig) && isRecord(pluginConfig.webFetch);
}
function resolvePluginOwnedToolConfigKeys(plugin) {
	if ((plugin.contracts?.tools?.length ?? 0) === 0) return [];
	const properties = isRecord(plugin.configSchema) ? plugin.configSchema.properties : void 0;
	if (!isRecord(properties)) return [];
	return Object.keys(properties).filter((key) => key !== "webSearch" && key !== "webFetch");
}
function hasPluginOwnedToolConfig(cfg, plugin) {
	const pluginConfig = cfg.plugins?.entries?.[plugin.id]?.config;
	if (!isRecord(pluginConfig)) return false;
	return resolvePluginOwnedToolConfigKeys(plugin).some((key) => pluginConfig[key] !== void 0);
}
function resolveProviderPluginsWithOwnedWebSearch(registry) {
	return registry.plugins.filter((plugin) => (plugin.providers?.length ?? 0) > 0).filter((plugin) => (plugin.contracts?.webSearchProviders?.length ?? 0) > 0);
}
function resolveProviderPluginsWithOwnedWebFetch(registry) {
	return registry.plugins.filter((plugin) => (plugin.contracts?.webFetchProviders?.length ?? 0) > 0);
}
function resolvePluginsWithOwnedToolConfig(registry) {
	return registry.plugins.filter((plugin) => (plugin.contracts?.tools?.length ?? 0) > 0);
}
function resolvePluginIdForConfiguredWebFetchProvider(providerId, env) {
	return resolveManifestContractOwnerPluginId({
		contract: "webFetchProviders",
		value: normalizeOptionalLowercaseString(providerId) ?? "",
		origin: "bundled",
		env
	});
}
function buildChannelToPluginIdMap(registry) {
	const map = /* @__PURE__ */ new Map();
	for (const record of registry.plugins) for (const channelId of record.channels ?? []) if (channelId && !map.has(channelId)) map.set(channelId, record.id);
	return map;
}
function resolvePluginIdForChannel(channelId, channelToPluginId) {
	const builtInId = normalizeChatChannelId(channelId);
	if (builtInId) return builtInId;
	return channelToPluginId.get(channelId) ?? channelId;
}
function collectCandidateChannelIds(cfg, env) {
	return listPotentialConfiguredChannelIds(cfg, env).map((channelId) => normalizeChatChannelId(channelId) ?? channelId);
}
function hasConfiguredWebSearchPluginEntry(cfg) {
	const entries = cfg.plugins?.entries;
	return !!entries && typeof entries === "object" && Object.values(entries).some((entry) => isRecord(entry) && isRecord(entry.config) && isRecord(entry.config.webSearch));
}
function hasConfiguredWebFetchPluginEntry(cfg) {
	const entries = cfg.plugins?.entries;
	return !!entries && typeof entries === "object" && Object.values(entries).some((entry) => isRecord(entry) && isRecord(entry.config) && isRecord(entry.config.webFetch));
}
function hasConfiguredPluginConfigEntry(cfg) {
	const entries = cfg.plugins?.entries;
	return !!entries && typeof entries === "object" && Object.values(entries).some((entry) => isRecord(entry) && isRecord(entry.config));
}
function listContainsNormalized(value, expected) {
	return Array.isArray(value) && value.some((entry) => normalizeOptionalLowercaseString(entry) === expected);
}
function toolPolicyReferencesBrowser(value) {
	return isRecord(value) && (listContainsNormalized(value.allow, "browser") || listContainsNormalized(value.alsoAllow, "browser"));
}
function hasBrowserToolReference(cfg) {
	if (toolPolicyReferencesBrowser(cfg.tools)) return true;
	const agentList = cfg.agents?.list;
	return Array.isArray(agentList) ? agentList.some((entry) => isRecord(entry) && toolPolicyReferencesBrowser(entry.tools)) : false;
}
function collectConfiguredPluginEntryIds(cfg) {
	const entries = cfg.plugins?.entries;
	if (!entries || typeof entries !== "object") return [];
	return Object.keys(entries).map((pluginId) => pluginId.trim()).filter(Boolean);
}
function resolveRelevantSetupAutoEnablePluginIds(cfg) {
	const pluginIds = new Set(collectConfiguredPluginEntryIds(cfg));
	if (isRecord(cfg.browser) || isRecord(cfg.plugins?.entries?.browser) || hasBrowserToolReference(cfg)) pluginIds.add("browser");
	if (isRecord(cfg.acp) || isRecord(cfg.plugins?.entries?.acpx)) pluginIds.add("acpx");
	if (isRecord(cfg.plugins?.entries?.xai) || isRecord(cfg.tools?.web) && isRecord(cfg.tools.web.x_search)) pluginIds.add("xai");
	return [...pluginIds].toSorted((left, right) => left.localeCompare(right));
}
function hasSetupAutoEnableRelevantConfig(cfg) {
	const entries = cfg.plugins?.entries;
	if (isRecord(cfg.browser) || isRecord(cfg.acp) || hasBrowserToolReference(cfg)) return true;
	if (isRecord(entries?.browser) || isRecord(entries?.acpx) || isRecord(entries?.xai)) return true;
	if (isRecord(cfg.tools?.web) && isRecord(cfg.tools.web.x_search)) return true;
	return hasConfiguredPluginConfigEntry(cfg);
}
function hasPluginEntries(cfg) {
	const entries = cfg.plugins?.entries;
	return !!entries && typeof entries === "object" && Object.keys(entries).length > 0;
}
function hasPluginAllowlistWithEntries(cfg) {
	return Array.isArray(cfg.plugins?.allow) && cfg.plugins.allow.length > 0 && hasPluginEntries(cfg);
}
function hasConfiguredProviderModelOrHarness(cfg, env) {
	if (cfg.auth?.profiles && Object.keys(cfg.auth.profiles).length > 0) return true;
	if (cfg.models?.providers && Object.keys(cfg.models.providers).length > 0) return true;
	if (collectModelRefs(cfg).length > 0) return true;
	return hasConfiguredEmbeddedHarnessRuntime(cfg, env);
}
function configMayNeedPluginManifestRegistry(cfg, env) {
	if (hasPluginAllowlistWithEntries(cfg)) return true;
	if (hasConfiguredPluginConfigEntry(cfg)) return true;
	if (hasConfiguredProviderModelOrHarness(cfg, env)) return true;
	const configuredChannels = cfg.channels;
	if (!configuredChannels || typeof configuredChannels !== "object") return false;
	for (const key of Object.keys(configuredChannels)) {
		if (key === "defaults" || key === "modelByChannel") continue;
		if (!normalizeChatChannelId(key)) return true;
	}
	return false;
}
function configMayNeedPluginAutoEnable(cfg, env) {
	if (hasPluginAllowlistWithEntries(cfg)) return true;
	if (hasConfiguredPluginConfigEntry(cfg)) return true;
	if (hasPotentialConfiguredChannels(cfg, env)) return true;
	if (hasConfiguredProviderModelOrHarness(cfg, env)) return true;
	if (hasConfiguredWebSearchPluginEntry(cfg) || hasConfiguredWebFetchPluginEntry(cfg)) return true;
	if (!hasSetupAutoEnableRelevantConfig(cfg)) return false;
	return resolvePluginSetupAutoEnableReasons({
		config: cfg,
		env,
		pluginIds: resolveRelevantSetupAutoEnablePluginIds(cfg)
	}).length > 0;
}
function resolvePluginAutoEnableCandidateReason(candidate) {
	switch (candidate.kind) {
		case "channel-configured": return `${candidate.channelId} configured`;
		case "provider-auth-configured": return `${candidate.providerId} auth configured`;
		case "provider-model-configured": return `${candidate.modelRef} model configured`;
		case "agent-harness-runtime-configured": return `${candidate.runtime} agent harness runtime configured`;
		case "web-fetch-provider-selected": return `${candidate.providerId} web fetch provider selected`;
		case "plugin-web-search-configured": return `${candidate.pluginId} web search configured`;
		case "plugin-web-fetch-configured": return `${candidate.pluginId} web fetch configured`;
		case "plugin-tool-configured": return `${candidate.pluginId} tool configured`;
		case "setup-auto-enable": return candidate.reason;
	}
	throw new Error("Unsupported plugin auto-enable candidate");
}
function resolveConfiguredPluginAutoEnableCandidates(params) {
	const changes = [];
	const channelToPluginId = buildChannelToPluginIdMap(params.registry);
	for (const channelId of collectCandidateChannelIds(params.config, params.env)) {
		const pluginId = resolvePluginIdForChannel(channelId, channelToPluginId);
		if (isChannelConfigured(params.config, channelId, params.env)) changes.push({
			pluginId,
			kind: "channel-configured",
			channelId
		});
	}
	for (const [providerId, pluginId] of Object.entries(resolveAutoEnableProviderPluginIds(params.registry))) if (isProviderConfigured(params.config, providerId)) changes.push({
		pluginId,
		kind: "provider-auth-configured",
		providerId
	});
	for (const modelRef of collectModelRefs(params.config)) {
		const owningPluginIds = resolveOwningPluginIdsForModelRef({
			model: modelRef,
			config: params.config,
			env: params.env,
			manifestRegistry: params.registry
		});
		if (owningPluginIds?.length === 1) changes.push({
			pluginId: owningPluginIds[0],
			kind: "provider-model-configured",
			modelRef
		});
	}
	for (const runtime of collectConfiguredAgentHarnessRuntimes(params.config, params.env)) {
		const pluginIds = resolveAgentHarnessOwnerPluginIds(params.registry, runtime);
		for (const pluginId of pluginIds) changes.push({
			pluginId,
			kind: "agent-harness-runtime-configured",
			runtime
		});
	}
	const webFetchProvider = typeof params.config.tools?.web?.fetch?.provider === "string" ? params.config.tools.web.fetch.provider : void 0;
	const webFetchPluginId = resolvePluginIdForConfiguredWebFetchProvider(webFetchProvider, params.env);
	if (webFetchPluginId) changes.push({
		pluginId: webFetchPluginId,
		kind: "web-fetch-provider-selected",
		providerId: normalizeOptionalLowercaseString(webFetchProvider) ?? ""
	});
	for (const plugin of resolveProviderPluginsWithOwnedWebSearch(params.registry)) {
		const pluginId = plugin.id;
		if (hasPluginOwnedWebSearchConfig(params.config, pluginId)) changes.push({
			pluginId,
			kind: "plugin-web-search-configured"
		});
	}
	for (const plugin of resolvePluginsWithOwnedToolConfig(params.registry)) {
		const pluginId = plugin.id;
		if (hasPluginOwnedToolConfig(params.config, plugin)) changes.push({
			pluginId,
			kind: "plugin-tool-configured"
		});
	}
	for (const plugin of resolveProviderPluginsWithOwnedWebFetch(params.registry)) {
		const pluginId = plugin.id;
		if (hasPluginOwnedWebFetchConfig(params.config, pluginId)) changes.push({
			pluginId,
			kind: "plugin-web-fetch-configured"
		});
	}
	if (hasSetupAutoEnableRelevantConfig(params.config)) {
		const manifestMatchedPluginIds = new Set(changes.map((entry) => entry.pluginId));
		const setupPluginIds = resolveRelevantSetupAutoEnablePluginIds(params.config).filter((pluginId) => !manifestMatchedPluginIds.has(pluginId));
		for (const entry of resolvePluginSetupAutoEnableReasons({
			config: params.config,
			env: params.env,
			pluginIds: setupPluginIds
		})) changes.push({
			pluginId: entry.pluginId,
			kind: "setup-auto-enable",
			reason: entry.reason
		});
	}
	return changes;
}
function isPluginExplicitlyDisabled(cfg, pluginId) {
	const builtInChannelId = normalizeChatChannelId(pluginId);
	if (builtInChannelId) {
		const channelConfig = cfg.channels?.[builtInChannelId];
		if (channelConfig && typeof channelConfig === "object" && !Array.isArray(channelConfig) && channelConfig.enabled === false) return true;
	}
	return cfg.plugins?.entries?.[pluginId]?.enabled === false;
}
function isPluginDenied(cfg, pluginId) {
	const deny = cfg.plugins?.deny;
	return Array.isArray(deny) && deny.includes(pluginId);
}
function isBuiltInChannelAlreadyEnabled(cfg, channelId) {
	const channelConfig = cfg.channels?.[channelId];
	return !!channelConfig && typeof channelConfig === "object" && !Array.isArray(channelConfig) && channelConfig.enabled === true;
}
function registerPluginEntry(cfg, pluginId) {
	const builtInChannelId = normalizeChatChannelId(pluginId);
	if (builtInChannelId) {
		const existing = cfg.channels?.[builtInChannelId];
		const existingRecord = existing && typeof existing === "object" && !Array.isArray(existing) ? existing : {};
		return {
			...cfg,
			channels: {
				...cfg.channels,
				[builtInChannelId]: {
					...existingRecord,
					enabled: true
				}
			}
		};
	}
	return {
		...cfg,
		plugins: {
			...cfg.plugins,
			entries: {
				...cfg.plugins?.entries,
				[pluginId]: {
					...cfg.plugins?.entries?.[pluginId],
					enabled: true
				}
			}
		}
	};
}
function hasMaterialPluginEntryConfig(entry) {
	if (!isRecord(entry)) return false;
	return entry.enabled === true || isRecord(entry.config) || isRecord(entry.hooks) || isRecord(entry.subagent) || entry.apiKey !== void 0 || entry.env !== void 0;
}
function isKnownPluginId(pluginId, manifestRegistry) {
	if (normalizeChatChannelId(pluginId)) return true;
	return manifestRegistry.plugins.some((plugin) => plugin.id === pluginId);
}
function materializeConfiguredPluginEntryAllowlist(params) {
	let next = params.config;
	const allow = next.plugins?.allow;
	const entries = next.plugins?.entries;
	if (!Array.isArray(allow) || allow.length === 0 || !entries || typeof entries !== "object") return next;
	for (const pluginId of Object.keys(entries).toSorted((left, right) => left.localeCompare(right))) {
		const entry = entries[pluginId];
		if (!hasMaterialPluginEntryConfig(entry) || isPluginDenied(next, pluginId) || isPluginExplicitlyDisabled(next, pluginId) || allow.includes(pluginId) || !isKnownPluginId(pluginId, params.manifestRegistry)) continue;
		next = ensurePluginAllowlisted(next, pluginId);
		params.changes.push(`${pluginId} plugin config present, added to plugin allowlist.`);
	}
	return next;
}
function resolveChannelAutoEnableDisplayLabel(entry, manifestRegistry) {
	const builtInChannelId = normalizeChatChannelId(entry.channelId);
	if (builtInChannelId) return getChatChannelMeta(builtInChannelId)?.label;
	const plugin = manifestRegistry.plugins.find((record) => record.id === entry.pluginId);
	return plugin?.channelConfigs?.[entry.channelId]?.label ?? plugin?.channelCatalogMeta?.label;
}
function formatAutoEnableChange(entry, manifestRegistry) {
	if (entry.kind === "channel-configured") {
		const label = resolveChannelAutoEnableDisplayLabel(entry, manifestRegistry);
		if (label) return `${label} configured, enabled automatically.`;
	}
	return `${resolvePluginAutoEnableCandidateReason(entry).trim()}, enabled automatically.`;
}
function resolvePluginAutoEnableManifestRegistry(params) {
	return params.manifestRegistry ?? (configMayNeedPluginManifestRegistry(params.config, params.env) ? loadPluginManifestRegistry({
		config: params.config,
		env: params.env
	}) : EMPTY_PLUGIN_MANIFEST_REGISTRY);
}
function materializePluginAutoEnableCandidatesInternal(params) {
	let next = params.config ?? {};
	const changes = [];
	const autoEnabledReasons = /* @__PURE__ */ new Map();
	if (next.plugins?.enabled === false) return {
		config: next,
		changes,
		autoEnabledReasons: {}
	};
	const preferOverCache = /* @__PURE__ */ new Map();
	for (const entry of params.candidates) {
		const builtInChannelId = normalizeChatChannelId(entry.pluginId);
		if (isPluginDenied(next, entry.pluginId) || isPluginExplicitlyDisabled(next, entry.pluginId)) continue;
		if (shouldSkipPreferredPluginAutoEnable({
			config: next,
			entry,
			configured: params.candidates,
			env: params.env,
			registry: params.manifestRegistry,
			isPluginDenied,
			isPluginExplicitlyDisabled,
			preferOverCache
		})) continue;
		const allow = next.plugins?.allow;
		const allowMissing = Array.isArray(allow) && !allow.includes(entry.pluginId);
		if ((builtInChannelId != null ? isBuiltInChannelAlreadyEnabled(next, builtInChannelId) : next.plugins?.entries?.[entry.pluginId]?.enabled === true) && !allowMissing) continue;
		next = registerPluginEntry(next, entry.pluginId);
		next = ensurePluginAllowlisted(next, entry.pluginId);
		const reason = resolvePluginAutoEnableCandidateReason(entry);
		autoEnabledReasons.set(entry.pluginId, [...autoEnabledReasons.get(entry.pluginId) ?? [], reason]);
		changes.push(formatAutoEnableChange(entry, params.manifestRegistry));
	}
	next = materializeConfiguredPluginEntryAllowlist({
		config: next,
		changes,
		manifestRegistry: params.manifestRegistry
	});
	const autoEnabledReasonRecord = Object.create(null);
	for (const [pluginId, reasons] of autoEnabledReasons) if (!isBlockedObjectKey(pluginId)) autoEnabledReasonRecord[pluginId] = [...reasons];
	return {
		config: next,
		changes,
		autoEnabledReasons: autoEnabledReasonRecord
	};
}
//#endregion
//#region src/config/plugin-auto-enable.detect.ts
function detectPluginAutoEnableCandidates(params) {
	const env = params.env ?? process.env;
	const config = params.config ?? {};
	if (!configMayNeedPluginAutoEnable(config, env)) return [];
	return resolveConfiguredPluginAutoEnableCandidates({
		config,
		env,
		registry: resolvePluginAutoEnableManifestRegistry({
			config,
			env,
			manifestRegistry: params.manifestRegistry
		})
	});
}
//#endregion
//#region src/config/plugin-auto-enable.apply.ts
function materializePluginAutoEnableCandidates(params) {
	const env = params.env ?? process.env;
	const config = params.config ?? {};
	const manifestRegistry = resolvePluginAutoEnableManifestRegistry({
		config,
		env,
		manifestRegistry: params.manifestRegistry
	});
	return materializePluginAutoEnableCandidatesInternal({
		config,
		candidates: params.candidates,
		env,
		manifestRegistry
	});
}
function applyPluginAutoEnable(params) {
	const candidates = detectPluginAutoEnableCandidates(params);
	return materializePluginAutoEnableCandidates({
		config: params.config,
		candidates,
		env: params.env,
		manifestRegistry: params.manifestRegistry
	});
}
//#endregion
export { resolvePluginAutoEnableCandidateReason as a, resolveCatalogHookProviderPluginIds as c, resolveEnabledProviderPluginIds as d, resolveExternalAuthProfileCompatFallbackPluginIds as f, withBundledProviderVitestCompat as g, resolveOwningPluginIdsForProvider as h, configMayNeedPluginAutoEnable as i, resolveDiscoverableProviderOwnerPluginIds as l, resolveOwningPluginIdsForModelRefs as m, materializePluginAutoEnableCandidates as n, resolveActivatableProviderOwnerPluginIds as o, resolveExternalAuthProfileProviderPluginIds as p, detectPluginAutoEnableCandidates as r, resolveBundledProviderCompatPluginIds as s, applyPluginAutoEnable as t, resolveDiscoveredProviderPluginIds as u };
