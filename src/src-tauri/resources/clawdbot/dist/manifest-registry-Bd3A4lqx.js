import { o as normalizeOptionalLowercaseString, s as normalizeOptionalString } from "./string-coerce-BUSzWgUA.js";
import { m as resolveUserPath } from "./utils-D5DtWkEu.js";
import { r as normalizeChatChannelId } from "./ids-CYPyP4SY.js";
import { o as resolveCompatibilityHostVersion } from "./version-Bk5OW-rN.js";
import { a as normalizeOptionalTrimmedStringList } from "./string-normalization-xm3f27dv.js";
import { i as loadPluginManifest } from "./manifest-DKZWfJEu.js";
import { l as loadBundleManifest, n as isPathInside, r as safeRealpathSync } from "./path-safety-cMqhKBu0.js";
import { n as discoverOpenClawPlugins, r as resolvePluginCacheInputs } from "./discovery-DGQFjH8F.js";
import { n as defaultSlotIdForKey } from "./slots-MFUVcT3n.js";
import { t as checkMinHostVersion } from "./min-host-version-BZQ2SlKG.js";
import fs from "node:fs";
import path from "node:path";
//#region src/plugins/config-activation-shared.ts
function toEnableStateResult(state) {
	return state.enabled ? { enabled: true } : {
		enabled: false,
		reason: state.reason
	};
}
function resolveEnableStateResult(params, resolveState) {
	return toEnableStateResult(resolveState(params));
}
function resolveEnableStateShared(params, resolveState) {
	return resolveEnableStateResult(params, resolveState);
}
function hasKind(kind, target) {
	if (!kind) return false;
	return Array.isArray(kind) ? kind.includes(target) : kind === target;
}
function resolveMemorySlotDecisionShared(params) {
	if (!hasKind(params.kind, "memory")) return { enabled: true };
	const isMultiKind = Array.isArray(params.kind) && params.kind.length > 1;
	if (params.slot === null) return isMultiKind ? { enabled: true } : {
		enabled: false,
		reason: "memory slot disabled"
	};
	if (typeof params.slot === "string") {
		if (params.slot === params.id) return {
			enabled: true,
			selected: true
		};
		return isMultiKind ? { enabled: true } : {
			enabled: false,
			reason: `memory slot set to "${params.slot}"`
		};
	}
	if (params.selectedId && params.selectedId !== params.id) return isMultiKind ? { enabled: true } : {
		enabled: false,
		reason: `memory slot already filled by "${params.selectedId}"`
	};
	return {
		enabled: true,
		selected: true
	};
}
//#endregion
//#region src/plugins/config-normalization-shared.ts
const identityNormalizePluginId = (id) => id.trim();
function normalizeList(value, normalizePluginId) {
	if (!Array.isArray(value)) return [];
	return value.map((entry) => typeof entry === "string" ? normalizePluginId(entry) : "").filter(Boolean);
}
function normalizeSlotValue(value) {
	const trimmed = normalizeOptionalString(value);
	if (!trimmed) return;
	if (normalizeOptionalLowercaseString(trimmed) === "none") return null;
	return trimmed;
}
function normalizePluginEntries(entries, normalizePluginId) {
	if (!entries || typeof entries !== "object" || Array.isArray(entries)) return {};
	const normalized = {};
	for (const [key, value] of Object.entries(entries)) {
		const normalizedKey = normalizePluginId(key);
		if (!normalizedKey) continue;
		if (!value || typeof value !== "object" || Array.isArray(value)) {
			normalized[normalizedKey] = {};
			continue;
		}
		const entry = value;
		const hooksRaw = entry.hooks;
		const hooks = hooksRaw && typeof hooksRaw === "object" && !Array.isArray(hooksRaw) ? { allowPromptInjection: hooksRaw.allowPromptInjection } : void 0;
		const normalizedHooks = hooks && typeof hooks.allowPromptInjection === "boolean" ? { allowPromptInjection: hooks.allowPromptInjection } : void 0;
		const subagentRaw = entry.subagent;
		const subagent = subagentRaw && typeof subagentRaw === "object" && !Array.isArray(subagentRaw) ? {
			allowModelOverride: subagentRaw.allowModelOverride,
			hasAllowedModelsConfig: Array.isArray(subagentRaw.allowedModels),
			allowedModels: Array.isArray(subagentRaw.allowedModels) ? subagentRaw.allowedModels.map((model) => normalizeOptionalString(model)).filter((model) => Boolean(model)) : void 0
		} : void 0;
		const normalizedSubagent = subagent && (typeof subagent.allowModelOverride === "boolean" || subagent.hasAllowedModelsConfig || Array.isArray(subagent.allowedModels) && subagent.allowedModels.length > 0) ? {
			...typeof subagent.allowModelOverride === "boolean" ? { allowModelOverride: subagent.allowModelOverride } : {},
			...subagent.hasAllowedModelsConfig ? { hasAllowedModelsConfig: true } : {},
			...Array.isArray(subagent.allowedModels) && subagent.allowedModels.length > 0 ? { allowedModels: subagent.allowedModels } : {}
		} : void 0;
		normalized[normalizedKey] = {
			...normalized[normalizedKey],
			enabled: typeof entry.enabled === "boolean" ? entry.enabled : normalized[normalizedKey]?.enabled,
			hooks: normalizedHooks ?? normalized[normalizedKey]?.hooks,
			subagent: normalizedSubagent ?? normalized[normalizedKey]?.subagent,
			config: "config" in entry ? entry.config : normalized[normalizedKey]?.config
		};
	}
	return normalized;
}
function normalizePluginsConfigWithResolver$1(config, normalizePluginId = identityNormalizePluginId) {
	const memorySlot = normalizeSlotValue(config?.slots?.memory);
	return {
		enabled: config?.enabled !== false,
		allow: normalizeList(config?.allow, normalizePluginId),
		deny: normalizeList(config?.deny, normalizePluginId),
		loadPaths: normalizeList(config?.load?.paths, identityNormalizePluginId),
		slots: {
			memory: memorySlot === void 0 ? defaultSlotIdForKey("memory") : memorySlot,
			contextEngine: normalizeSlotValue(config?.slots?.contextEngine)
		},
		entries: normalizePluginEntries(config?.entries, normalizePluginId)
	};
}
function hasExplicitPluginConfig$1(plugins) {
	if (!plugins) return false;
	if (typeof plugins.enabled === "boolean") return true;
	if (Array.isArray(plugins.allow) && plugins.allow.length > 0) return true;
	if (Array.isArray(plugins.deny) && plugins.deny.length > 0) return true;
	if (plugins.load?.paths && Array.isArray(plugins.load.paths) && plugins.load.paths.length > 0) return true;
	if (plugins.slots && Object.keys(plugins.slots).length > 0) return true;
	if (plugins.entries && Object.keys(plugins.entries).length > 0) return true;
	return false;
}
function isBundledChannelEnabledByChannelConfig$1(cfg, pluginId) {
	if (!cfg) return false;
	const channelId = normalizeChatChannelId(pluginId);
	if (!channelId) return false;
	const entry = cfg.channels?.[channelId];
	if (!entry || typeof entry !== "object" || Array.isArray(entry)) return false;
	return entry.enabled === true;
}
//#endregion
//#region src/plugins/config-policy.ts
function normalizePluginsConfigWithResolver(config, normalizePluginId = identityNormalizePluginId) {
	return normalizePluginsConfigWithResolver$1(config, normalizePluginId);
}
function resolveExplicitPluginSelection(params) {
	if (params.config.entries[params.id]?.enabled === true) return {
		explicitlyEnabled: true,
		reason: "enabled in config"
	};
	if (params.origin === "bundled" && isBundledChannelEnabledByChannelConfig(params.rootConfig, params.id)) return {
		explicitlyEnabled: true,
		reason: "channel enabled in config"
	};
	if (params.config.slots.memory === params.id) return {
		explicitlyEnabled: true,
		reason: "selected memory slot"
	};
	if (params.config.slots.contextEngine === params.id) return {
		explicitlyEnabled: true,
		reason: "selected context engine slot"
	};
	if (params.origin !== "bundled" && params.config.allow.includes(params.id)) return {
		explicitlyEnabled: true,
		reason: "selected in allowlist"
	};
	return { explicitlyEnabled: false };
}
function resolvePluginActivationState(params) {
	const explicitSelection = resolveExplicitPluginSelection({
		id: params.id,
		origin: params.origin,
		config: params.sourceConfig ?? params.config,
		rootConfig: params.sourceRootConfig ?? params.rootConfig
	});
	if (!params.config.enabled) return {
		enabled: false,
		activated: false,
		explicitlyEnabled: explicitSelection.explicitlyEnabled,
		source: "disabled",
		reason: "plugins disabled"
	};
	if (params.config.deny.includes(params.id)) return {
		enabled: false,
		activated: false,
		explicitlyEnabled: explicitSelection.explicitlyEnabled,
		source: "disabled",
		reason: "blocked by denylist"
	};
	const entry = params.config.entries[params.id];
	if (entry?.enabled === false) return {
		enabled: false,
		activated: false,
		explicitlyEnabled: explicitSelection.explicitlyEnabled,
		source: "disabled",
		reason: "disabled in config"
	};
	const explicitlyAllowed = params.config.allow.includes(params.id);
	if (params.origin === "workspace" && !explicitlyAllowed && entry?.enabled !== true && explicitSelection.reason !== "selected context engine slot") return {
		enabled: false,
		activated: false,
		explicitlyEnabled: explicitSelection.explicitlyEnabled,
		source: "disabled",
		reason: "workspace plugin (disabled by default)"
	};
	if (params.config.slots.memory === params.id) return {
		enabled: true,
		activated: true,
		explicitlyEnabled: true,
		source: "explicit",
		reason: "selected memory slot"
	};
	if (params.config.slots.contextEngine === params.id) return {
		enabled: true,
		activated: true,
		explicitlyEnabled: true,
		source: "explicit",
		reason: "selected context engine slot"
	};
	if (params.config.allow.length > 0 && !explicitlyAllowed) return {
		enabled: false,
		activated: false,
		explicitlyEnabled: explicitSelection.explicitlyEnabled,
		source: "disabled",
		reason: "not in allowlist"
	};
	if (explicitSelection.explicitlyEnabled) return {
		enabled: true,
		activated: true,
		explicitlyEnabled: true,
		source: "explicit",
		reason: explicitSelection.reason
	};
	if (params.autoEnabledReason) return {
		enabled: true,
		activated: true,
		explicitlyEnabled: false,
		source: "auto",
		reason: params.autoEnabledReason
	};
	if (entry?.enabled === true) return {
		enabled: true,
		activated: true,
		explicitlyEnabled: false,
		source: "auto",
		reason: "enabled by effective config"
	};
	if (params.origin === "bundled" && isBundledChannelEnabledByChannelConfig(params.rootConfig, params.id)) return {
		enabled: true,
		activated: true,
		explicitlyEnabled: false,
		source: "auto",
		reason: "channel configured"
	};
	if (params.origin === "bundled" && params.enabledByDefault === true) return {
		enabled: true,
		activated: true,
		explicitlyEnabled: false,
		source: "default",
		reason: "bundled default enablement"
	};
	if (params.origin === "bundled") return {
		enabled: false,
		activated: false,
		explicitlyEnabled: false,
		source: "disabled",
		reason: "bundled (disabled by default)"
	};
	return {
		enabled: true,
		activated: true,
		explicitlyEnabled: explicitSelection.explicitlyEnabled,
		source: "default"
	};
}
function hasExplicitPluginConfig(plugins) {
	return hasExplicitPluginConfig$1(plugins);
}
function isBundledChannelEnabledByChannelConfig(cfg, pluginId) {
	return isBundledChannelEnabledByChannelConfig$1(cfg, pluginId);
}
function resolveEffectivePluginActivationState(params) {
	return resolvePluginActivationState(params);
}
function resolveMemorySlotDecision(params) {
	return resolveMemorySlotDecisionShared(params);
}
//#endregion
//#region src/plugins/manifest-registry-state.ts
const pluginManifestRegistryCache = /* @__PURE__ */ new Map();
function clearPluginManifestRegistryCache() {
	pluginManifestRegistryCache.clear();
}
//#endregion
//#region src/plugins/manifest-registry.ts
const PLUGIN_ORIGIN_RANK = {
	config: 0,
	workspace: 1,
	global: 2,
	bundled: 3
};
const registryCache = pluginManifestRegistryCache;
const DEFAULT_MANIFEST_CACHE_MS = 1e3;
function listContractValues(plugin, contract) {
	return plugin.contracts?.[contract] ?? [];
}
function resolveManifestContractPluginIds(params) {
	const onlyPluginIdSet = params.onlyPluginIds && params.onlyPluginIds.length > 0 ? new Set(params.onlyPluginIds) : null;
	return loadPluginManifestRegistry({
		config: params.config,
		workspaceDir: params.workspaceDir,
		env: params.env
	}).plugins.filter((plugin) => (!params.origin || plugin.origin === params.origin) && (!onlyPluginIdSet || onlyPluginIdSet.has(plugin.id)) && listContractValues(plugin, params.contract).length > 0).map((plugin) => plugin.id).toSorted((left, right) => left.localeCompare(right));
}
function resolveManifestContractPluginIdsByCompatibilityRuntimePath(params) {
	const normalizedPath = params.path?.trim();
	if (!normalizedPath) return [];
	return loadPluginManifestRegistry({
		config: params.config,
		workspaceDir: params.workspaceDir,
		env: params.env
	}).plugins.filter((plugin) => (!params.origin || plugin.origin === params.origin) && listContractValues(plugin, params.contract).length > 0 && (plugin.configContracts?.compatibilityRuntimePaths ?? []).includes(normalizedPath)).map((plugin) => plugin.id).toSorted((left, right) => left.localeCompare(right));
}
function resolveManifestContractOwnerPluginId(params) {
	const normalizedValue = normalizeOptionalLowercaseString(params.value);
	if (!normalizedValue) return;
	return loadPluginManifestRegistry({
		config: params.config,
		workspaceDir: params.workspaceDir,
		env: params.env
	}).plugins.find((plugin) => (!params.origin || plugin.origin === params.origin) && listContractValues(plugin, params.contract).some((candidate) => normalizeOptionalLowercaseString(candidate) === normalizedValue))?.id;
}
function resolveManifestCacheMs(env) {
	const raw = env.OPENCLAW_PLUGIN_MANIFEST_CACHE_MS?.trim();
	if (raw === "" || raw === "0") return 0;
	if (!raw) return DEFAULT_MANIFEST_CACHE_MS;
	const parsed = Number.parseInt(raw, 10);
	if (!Number.isFinite(parsed)) return DEFAULT_MANIFEST_CACHE_MS;
	return Math.max(0, parsed);
}
function shouldUseManifestCache(env) {
	if (env.OPENCLAW_DISABLE_PLUGIN_MANIFEST_CACHE?.trim()) return false;
	return resolveManifestCacheMs(env) > 0;
}
function buildCacheKey(params) {
	const { roots, loadPaths } = resolvePluginCacheInputs({
		workspaceDir: params.workspaceDir,
		loadPaths: params.plugins.loadPaths,
		env: params.env
	});
	return `${roots.workspace ?? ""}::${roots.global}::${roots.stock ?? ""}::${resolveCompatibilityHostVersion(params.env)}::${JSON.stringify(loadPaths)}`;
}
function safeStatMtimeMs(filePath) {
	try {
		return fs.statSync(filePath).mtimeMs;
	} catch {
		return null;
	}
}
function normalizePreferredPluginIds(raw) {
	return normalizeOptionalTrimmedStringList(raw);
}
function mergePackageChannelMetaIntoChannelConfigs(params) {
	const channelId = params.packageChannel?.id?.trim();
	if (!channelId || !params.channelConfigs?.[channelId]) return params.channelConfigs;
	const existing = params.channelConfigs[channelId];
	const label = existing.label ?? normalizeOptionalString(params.packageChannel?.label) ?? "";
	const description = existing.description ?? normalizeOptionalString(params.packageChannel?.blurb) ?? "";
	const preferOver = existing.preferOver ?? normalizePreferredPluginIds(params.packageChannel?.preferOver);
	return {
		...params.channelConfigs,
		[channelId]: {
			...existing,
			...label ? { label } : {},
			...description ? { description } : {},
			...preferOver?.length ? { preferOver } : {}
		}
	};
}
function buildRecord(params) {
	const channelConfigs = mergePackageChannelMetaIntoChannelConfigs({
		channelConfigs: params.manifest.channelConfigs,
		packageChannel: params.candidate.packageManifest?.channel
	});
	return {
		id: params.manifest.id,
		name: normalizeOptionalString(params.manifest.name) ?? params.candidate.packageName,
		description: normalizeOptionalString(params.manifest.description) ?? params.candidate.packageDescription,
		version: normalizeOptionalString(params.manifest.version) ?? params.candidate.packageVersion,
		enabledByDefault: params.manifest.enabledByDefault === true ? true : void 0,
		autoEnableWhenConfiguredProviders: params.manifest.autoEnableWhenConfiguredProviders,
		legacyPluginIds: params.manifest.legacyPluginIds,
		format: params.candidate.format ?? "openclaw",
		bundleFormat: params.candidate.bundleFormat,
		kind: params.manifest.kind,
		channels: params.manifest.channels ?? [],
		providers: params.manifest.providers ?? [],
		providerDiscoverySource: params.manifest.providerDiscoveryEntry ? path.resolve(params.candidate.rootDir, params.manifest.providerDiscoveryEntry) : void 0,
		modelSupport: params.manifest.modelSupport,
		cliBackends: params.manifest.cliBackends ?? [],
		commandAliases: params.manifest.commandAliases,
		providerAuthEnvVars: params.manifest.providerAuthEnvVars,
		providerAuthAliases: params.manifest.providerAuthAliases,
		channelEnvVars: params.manifest.channelEnvVars,
		providerAuthChoices: params.manifest.providerAuthChoices,
		activation: params.manifest.activation,
		setup: params.manifest.setup,
		qaRunners: params.manifest.qaRunners,
		skills: params.manifest.skills ?? [],
		settingsFiles: [],
		hooks: [],
		origin: params.candidate.origin,
		workspaceDir: params.candidate.workspaceDir,
		rootDir: params.candidate.rootDir,
		source: params.candidate.source,
		setupSource: params.candidate.setupSource,
		startupDeferConfiguredChannelFullLoadUntilAfterListen: params.candidate.packageManifest?.startup?.deferConfiguredChannelFullLoadUntilAfterListen === true,
		manifestPath: params.manifestPath,
		schemaCacheKey: params.schemaCacheKey,
		configSchema: params.configSchema,
		configUiHints: params.manifest.uiHints,
		contracts: params.manifest.contracts,
		configContracts: params.manifest.configContracts,
		channelConfigs,
		...params.candidate.packageManifest?.channel?.id ? { channelCatalogMeta: {
			id: params.candidate.packageManifest.channel.id,
			...typeof params.candidate.packageManifest.channel.label === "string" ? { label: params.candidate.packageManifest.channel.label } : {},
			...typeof params.candidate.packageManifest.channel.blurb === "string" ? { blurb: params.candidate.packageManifest.channel.blurb } : {},
			...params.candidate.packageManifest.channel.preferOver ? { preferOver: params.candidate.packageManifest.channel.preferOver } : {}
		} } : {}
	};
}
function buildBundleRecord(params) {
	return {
		id: params.manifest.id,
		name: normalizeOptionalString(params.manifest.name) ?? params.candidate.idHint,
		description: normalizeOptionalString(params.manifest.description),
		version: normalizeOptionalString(params.manifest.version),
		format: "bundle",
		bundleFormat: params.candidate.bundleFormat,
		bundleCapabilities: params.manifest.capabilities,
		channels: [],
		providers: [],
		cliBackends: [],
		skills: params.manifest.skills ?? [],
		settingsFiles: params.manifest.settingsFiles ?? [],
		hooks: params.manifest.hooks ?? [],
		origin: params.candidate.origin,
		workspaceDir: params.candidate.workspaceDir,
		rootDir: params.candidate.rootDir,
		source: params.candidate.source,
		manifestPath: params.manifestPath,
		schemaCacheKey: void 0,
		configSchema: void 0,
		configUiHints: void 0,
		configContracts: void 0,
		channelConfigs: void 0
	};
}
function matchesInstalledPluginRecord(params) {
	if (params.candidate.origin !== "global") return false;
	const record = params.config?.plugins?.installs?.[params.pluginId];
	if (!record) return false;
	const candidateSource = resolveUserPath(params.candidate.source, params.env);
	const trackedPaths = [record.installPath, record.sourcePath].filter((entry) => typeof entry === "string" && entry.trim().length > 0).map((entry) => resolveUserPath(entry, params.env));
	if (trackedPaths.length === 0) return false;
	return trackedPaths.some((trackedPath) => {
		return candidateSource === trackedPath || isPathInside(trackedPath, candidateSource);
	});
}
function resolveDuplicatePrecedenceRank(params) {
	if (params.candidate.origin === "config") return 0;
	if (params.candidate.origin === "global" && matchesInstalledPluginRecord({
		pluginId: params.pluginId,
		candidate: params.candidate,
		config: params.config,
		env: params.env
	})) return 1;
	if (params.candidate.origin === "bundled") return 2;
	if (params.candidate.origin === "workspace") return 3;
	return 4;
}
function loadPluginManifestRegistry(params = {}) {
	const config = params.config ?? {};
	const normalized = normalizePluginsConfigWithResolver(config.plugins);
	const env = params.env ?? process.env;
	const cacheKey = buildCacheKey({
		workspaceDir: params.workspaceDir,
		plugins: normalized,
		env
	});
	const cacheEnabled = params.cache !== false && shouldUseManifestCache(env);
	if (cacheEnabled) {
		const cached = registryCache.get(cacheKey);
		if (cached && cached.expiresAt > Date.now()) return cached.registry;
	}
	const discovery = params.candidates ? {
		candidates: params.candidates,
		diagnostics: params.diagnostics ?? []
	} : discoverOpenClawPlugins({
		workspaceDir: params.workspaceDir,
		extraPaths: normalized.loadPaths,
		cache: params.cache,
		env
	});
	const diagnostics = [...discovery.diagnostics];
	const candidates = discovery.candidates;
	const records = [];
	const seenIds = /* @__PURE__ */ new Map();
	const realpathCache = /* @__PURE__ */ new Map();
	const currentHostVersion = resolveCompatibilityHostVersion(env);
	for (const candidate of candidates) {
		const rejectHardlinks = candidate.origin !== "bundled";
		const isBundleRecord = (candidate.format ?? "openclaw") === "bundle";
		const manifestRes = candidate.origin === "bundled" && candidate.bundledManifest && candidate.bundledManifestPath ? {
			ok: true,
			manifest: candidate.bundledManifest,
			manifestPath: candidate.bundledManifestPath
		} : isBundleRecord && candidate.bundleFormat ? loadBundleManifest({
			rootDir: candidate.rootDir,
			bundleFormat: candidate.bundleFormat,
			rejectHardlinks
		}) : loadPluginManifest(candidate.rootDir, rejectHardlinks);
		if (!manifestRes.ok) {
			diagnostics.push({
				level: "error",
				message: manifestRes.error,
				source: manifestRes.manifestPath
			});
			continue;
		}
		const manifest = manifestRes.manifest;
		const minHostVersionCheck = checkMinHostVersion({
			currentVersion: currentHostVersion,
			minHostVersion: candidate.packageManifest?.install?.minHostVersion
		});
		if (!minHostVersionCheck.ok) {
			const packageManifestSource = path.join(candidate.packageDir ?? candidate.rootDir, "package.json");
			diagnostics.push({
				level: minHostVersionCheck.kind === "unknown_host_version" ? "warn" : "error",
				pluginId: manifest.id,
				source: packageManifestSource,
				message: minHostVersionCheck.kind === "invalid" ? `plugin manifest invalid | ${minHostVersionCheck.error}` : minHostVersionCheck.kind === "unknown_host_version" ? `plugin requires OpenClaw >=${minHostVersionCheck.requirement.minimumLabel}, but this host version could not be determined; skipping load` : `plugin requires OpenClaw >=${minHostVersionCheck.requirement.minimumLabel}, but this host is ${minHostVersionCheck.currentVersion}; skipping load`
			});
			continue;
		}
		const configSchema = "configSchema" in manifest ? manifest.configSchema : void 0;
		const schemaCacheKey = (() => {
			if (!configSchema) return;
			const manifestMtime = safeStatMtimeMs(manifestRes.manifestPath);
			return manifestMtime ? `${manifestRes.manifestPath}:${manifestMtime}` : manifestRes.manifestPath;
		})();
		const existing = seenIds.get(manifest.id);
		if (existing) {
			const samePath = existing.candidate.rootDir === candidate.rootDir;
			if ((() => {
				if (samePath) return true;
				const existingReal = safeRealpathSync(existing.candidate.rootDir, realpathCache);
				const candidateReal = safeRealpathSync(candidate.rootDir, realpathCache);
				return Boolean(existingReal && candidateReal && existingReal === candidateReal);
			})()) {
				if (PLUGIN_ORIGIN_RANK[candidate.origin] < PLUGIN_ORIGIN_RANK[existing.candidate.origin]) {
					records[existing.recordIndex] = isBundleRecord ? buildBundleRecord({
						manifest,
						candidate,
						manifestPath: manifestRes.manifestPath
					}) : buildRecord({
						manifest,
						candidate,
						manifestPath: manifestRes.manifestPath,
						schemaCacheKey,
						configSchema
					});
					seenIds.set(manifest.id, {
						candidate,
						recordIndex: existing.recordIndex
					});
				}
				continue;
			}
			diagnostics.push({
				level: "warn",
				pluginId: manifest.id,
				source: candidate.source,
				message: resolveDuplicatePrecedenceRank({
					pluginId: manifest.id,
					candidate,
					config,
					env
				}) < resolveDuplicatePrecedenceRank({
					pluginId: manifest.id,
					candidate: existing.candidate,
					config,
					env
				}) ? `duplicate plugin id detected; ${existing.candidate.origin} plugin will be overridden by ${candidate.origin} plugin (${candidate.source})` : `duplicate plugin id detected; ${candidate.origin} plugin will be overridden by ${existing.candidate.origin} plugin (${candidate.source})`
			});
		} else seenIds.set(manifest.id, {
			candidate,
			recordIndex: records.length
		});
		records.push(isBundleRecord ? buildBundleRecord({
			manifest,
			candidate,
			manifestPath: manifestRes.manifestPath
		}) : buildRecord({
			manifest,
			candidate,
			manifestPath: manifestRes.manifestPath,
			schemaCacheKey,
			configSchema
		}));
	}
	const registry = {
		plugins: records,
		diagnostics
	};
	if (cacheEnabled) {
		const ttl = resolveManifestCacheMs(env);
		if (ttl > 0) registryCache.set(cacheKey, {
			expiresAt: Date.now() + ttl,
			registry
		});
	}
	return registry;
}
//#endregion
export { clearPluginManifestRegistryCache as a, resolveEffectivePluginActivationState as c, isBundledChannelEnabledByChannelConfig$1 as d, normalizePluginsConfigWithResolver$1 as f, resolveMemorySlotDecisionShared as h, resolveManifestContractPluginIdsByCompatibilityRuntimePath as i, resolveMemorySlotDecision as l, resolveEnableStateShared as m, resolveManifestContractOwnerPluginId as n, hasExplicitPluginConfig as o, resolveEnableStateResult as p, resolveManifestContractPluginIds as r, normalizePluginsConfigWithResolver as s, loadPluginManifestRegistry as t, hasExplicitPluginConfig$1 as u };
