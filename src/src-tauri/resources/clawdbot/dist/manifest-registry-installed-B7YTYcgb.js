import { r as getPackageManifestMetadata, t as DEFAULT_PLUGIN_ENTRY_CANDIDATES } from "./manifest-DkU_xlZi.js";
import { g as extractPluginInstallRecordsFromInstalledPluginIndex, h as hashJson, m as resolveInstalledPluginIndexPolicyHash } from "./installed-plugin-index-store-Bg0YPG9v.js";
import { t as loadPluginManifestRegistry } from "./manifest-registry-CXpW6f0a.js";
import fs from "node:fs";
import path from "node:path";
//#region src/plugins/manifest-registry-installed.ts
const INSTALLED_MANIFEST_REGISTRY_FALLBACK_CACHE_MAX_ENTRIES = 64;
const installedManifestRegistryFallbackCache = /* @__PURE__ */ new Map();
let installedManifestRegistryFallbackCacheTick = 0;
function normalizePluginIdFilter(pluginIds) {
	if (!pluginIds?.length) return;
	return [...new Set(pluginIds)].toSorted((left, right) => left.localeCompare(right));
}
function resolvePackageJsonPath(record) {
	if (!record.packageJson?.path) return;
	const rootDir = resolveInstalledPluginRootDir(record);
	const packageJsonPath = path.resolve(rootDir, record.packageJson.path);
	const relative = path.relative(rootDir, packageJsonPath);
	if (relative.startsWith("..") || path.isAbsolute(relative)) return;
	return packageJsonPath;
}
function safeFileSignature(filePath) {
	if (!filePath) return;
	try {
		const stat = fs.statSync(filePath);
		return `${filePath}:${stat.size}:${stat.mtimeMs}`;
	} catch {
		return `${filePath}:missing`;
	}
}
function shouldUseInstalledManifestRegistryCache(params) {
	if (params.bundledChannelConfigCollector) return false;
	if (params.env.OPENCLAW_DISABLE_INSTALLED_PLUGIN_MANIFEST_REGISTRY_CACHE?.trim()) return false;
	return !params.env.OPENCLAW_DISABLE_PLUGIN_MANIFEST_CACHE?.trim();
}
function buildInstalledManifestRegistryIndexKey(index) {
	return {
		version: index.version,
		hostContractVersion: index.hostContractVersion,
		compatRegistryVersion: index.compatRegistryVersion,
		migrationVersion: index.migrationVersion,
		policyHash: index.policyHash,
		installRecords: index.installRecords,
		diagnostics: index.diagnostics,
		plugins: index.plugins.map((record) => {
			const packageJsonPath = resolvePackageJsonPath(record);
			return {
				pluginId: record.pluginId,
				packageName: record.packageName,
				packageVersion: record.packageVersion,
				installRecord: record.installRecord,
				installRecordHash: record.installRecordHash,
				packageInstall: record.packageInstall,
				packageChannel: record.packageChannel,
				manifestPath: record.manifestPath,
				manifestHash: record.manifestHash,
				manifestFile: safeFileSignature(record.manifestPath),
				format: record.format,
				bundleFormat: record.bundleFormat,
				source: record.source,
				setupSource: record.setupSource,
				packageJson: record.packageJson,
				packageJsonFile: safeFileSignature(packageJsonPath),
				rootDir: record.rootDir,
				origin: record.origin,
				enabled: record.enabled,
				enabledByDefault: record.enabledByDefault,
				syntheticAuthRefs: record.syntheticAuthRefs,
				startup: record.startup,
				compat: record.compat
			};
		})
	};
}
function resolveInstalledManifestRegistryIndexFingerprint(index) {
	return hashJson(buildInstalledManifestRegistryIndexKey(index));
}
function buildInstalledManifestRegistryCacheKey(params) {
	return hashJson({
		index: buildInstalledManifestRegistryIndexKey(params.index),
		request: {
			workspaceDir: params.workspaceDir,
			pluginIds: normalizePluginIdFilter(params.pluginIds),
			includeDisabled: params.includeDisabled === true,
			configPolicyHash: resolveInstalledPluginIndexPolicyHash(params.config),
			env: {
				OPENCLAW_VERSION: params.env.OPENCLAW_VERSION,
				HOME: params.env.HOME,
				USERPROFILE: params.env.USERPROFILE
			}
		}
	});
}
function getCachedInstalledManifestRegistry(cacheKey) {
	const cached = installedManifestRegistryFallbackCache.get(cacheKey);
	if (!cached) return;
	cached.lastUsed = ++installedManifestRegistryFallbackCacheTick;
	return cached.registry;
}
function setCachedInstalledManifestRegistry(cacheKey, registry) {
	if (!installedManifestRegistryFallbackCache.has(cacheKey) && installedManifestRegistryFallbackCache.size >= INSTALLED_MANIFEST_REGISTRY_FALLBACK_CACHE_MAX_ENTRIES) {
		let oldestKey;
		let oldestTick = Number.POSITIVE_INFINITY;
		for (const [key, entry] of installedManifestRegistryFallbackCache) if (entry.lastUsed < oldestTick) {
			oldestKey = key;
			oldestTick = entry.lastUsed;
		}
		if (oldestKey) installedManifestRegistryFallbackCache.delete(oldestKey);
	}
	installedManifestRegistryFallbackCache.set(cacheKey, {
		registry,
		lastUsed: ++installedManifestRegistryFallbackCacheTick
	});
}
function resolveInstalledPluginRootDir(record) {
	return record.rootDir || path.dirname(record.manifestPath || process.cwd());
}
function resolveFallbackPluginSource(record) {
	const rootDir = resolveInstalledPluginRootDir(record);
	for (const entry of DEFAULT_PLUGIN_ENTRY_CANDIDATES) {
		const candidate = path.join(rootDir, entry);
		if (fs.existsSync(candidate)) return candidate;
	}
	return path.join(rootDir, DEFAULT_PLUGIN_ENTRY_CANDIDATES[0]);
}
function resolveInstalledPackageManifest(record) {
	if (!record.packageChannel) return;
	if (record.packageChannel.commands) return { channel: record.packageChannel };
	const rootDir = resolveInstalledPluginRootDir(record);
	const packageJsonPath = record.packageJson?.path ? path.resolve(rootDir, record.packageJson.path) : void 0;
	if (!packageJsonPath) return { channel: record.packageChannel };
	const relative = path.relative(rootDir, packageJsonPath);
	if (relative.startsWith("..") || path.isAbsolute(relative)) return { channel: record.packageChannel };
	try {
		const packageManifest = getPackageManifestMetadata(JSON.parse(fs.readFileSync(packageJsonPath, "utf8")));
		return { channel: {
			...record.packageChannel,
			...packageManifest?.channel?.commands ? { commands: packageManifest.channel.commands } : {}
		} };
	} catch {
		return { channel: record.packageChannel };
	}
}
function toPluginCandidate(record) {
	const rootDir = resolveInstalledPluginRootDir(record);
	const packageManifest = resolveInstalledPackageManifest(record);
	return {
		idHint: record.pluginId,
		source: record.source ?? resolveFallbackPluginSource(record),
		...record.setupSource ? { setupSource: record.setupSource } : {},
		rootDir,
		origin: record.origin,
		...record.format ? { format: record.format } : {},
		...record.bundleFormat ? { bundleFormat: record.bundleFormat } : {},
		...record.packageName ? { packageName: record.packageName } : {},
		...record.packageVersion ? { packageVersion: record.packageVersion } : {},
		...packageManifest ? { packageManifest } : {},
		packageDir: rootDir
	};
}
function loadPluginManifestRegistryForInstalledIndex(params) {
	if (params.pluginIds && params.pluginIds.length === 0) return {
		plugins: [],
		diagnostics: []
	};
	const env = params.env ?? process.env;
	const cacheKey = shouldUseInstalledManifestRegistryCache({
		env,
		bundledChannelConfigCollector: params.bundledChannelConfigCollector
	}) ? buildInstalledManifestRegistryCacheKey({
		index: params.index,
		config: params.config,
		workspaceDir: params.workspaceDir,
		env,
		pluginIds: params.pluginIds,
		includeDisabled: params.includeDisabled
	}) : void 0;
	if (cacheKey) {
		const cached = getCachedInstalledManifestRegistry(cacheKey);
		if (cached) return cached;
	}
	const pluginIdSet = params.pluginIds?.length ? new Set(params.pluginIds) : null;
	const diagnostics = pluginIdSet ? params.index.diagnostics.filter((diagnostic) => {
		const pluginId = diagnostic.pluginId;
		return !pluginId || pluginIdSet.has(pluginId);
	}) : params.index.diagnostics;
	const candidates = params.index.plugins.filter((plugin) => params.includeDisabled || plugin.enabled).filter((plugin) => !pluginIdSet || pluginIdSet.has(plugin.pluginId)).map(toPluginCandidate);
	const registry = loadPluginManifestRegistry({
		config: params.config,
		workspaceDir: params.workspaceDir,
		env,
		cache: false,
		candidates,
		diagnostics: [...diagnostics],
		installRecords: extractPluginInstallRecordsFromInstalledPluginIndex(params.index),
		...params.bundledChannelConfigCollector ? { bundledChannelConfigCollector: params.bundledChannelConfigCollector } : {}
	});
	if (cacheKey) setCachedInstalledManifestRegistry(cacheKey, registry);
	return registry;
}
//#endregion
export { resolveInstalledManifestRegistryIndexFingerprint as n, loadPluginManifestRegistryForInstalledIndex as t };
