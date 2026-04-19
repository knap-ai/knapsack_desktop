import { t as resolveBundledPluginsDir } from "./bundled-dir-D4Wk35JT.js";
import { o as resolveConfigPath } from "./paths-Dvv9VRAc.js";
import { n as normalizeBundledPluginArtifactSubpath, t as PUBLIC_SURFACE_SOURCE_EXTENSIONS } from "./public-surface-runtime-nilbjlrn.js";
import { t as loadPluginManifestRegistry } from "./manifest-registry-Bd3A4lqx.js";
import { r as getRuntimeConfigSnapshot } from "./runtime-snapshot-BwqEmc6G.js";
import { a as normalizePluginsConfig, n as createPluginActivationSource, s as resolveEffectivePluginActivationState } from "./config-state-CcN3bZ9D.js";
import { n as configMayNeedPluginAutoEnable, t as applyPluginAutoEnable } from "./plugin-auto-enable-BbVfCcz-.js";
import fs from "node:fs";
import path from "node:path";
import JSON5 from "json5";
//#region src/plugin-sdk/facade-activation-check.runtime.ts
const ALWAYS_ALLOWED_RUNTIME_DIR_NAMES = new Set([
	"image-generation-core",
	"media-understanding-core",
	"speech-core"
]);
const EMPTY_FACADE_BOUNDARY_CONFIG = {};
let cachedBoundaryRawConfig;
let cachedBoundaryResolvedConfigKey;
let cachedBoundaryConfigFileState;
let cachedBoundaryResolvedConfig;
let cachedManifestRegistryByKey = /* @__PURE__ */ new Map();
const cachedFacadeManifestRecordsByKey = /* @__PURE__ */ new Map();
const cachedFacadePublicSurfaceAccessByKey = /* @__PURE__ */ new Map();
function readFacadeBoundaryConfigSafely() {
	try {
		const runtimeSnapshot = getRuntimeConfigSnapshot();
		if (runtimeSnapshot) return { rawConfig: runtimeSnapshot };
		const configPath = resolveConfigPath();
		if (!fs.existsSync(configPath)) return {
			rawConfig: EMPTY_FACADE_BOUNDARY_CONFIG,
			cacheKey: `missing:${configPath}`
		};
		const stat = fs.statSync(configPath);
		if (cachedBoundaryConfigFileState && cachedBoundaryConfigFileState.configPath === configPath && cachedBoundaryConfigFileState.mtimeMs === stat.mtimeMs && cachedBoundaryConfigFileState.size === stat.size) return {
			rawConfig: cachedBoundaryConfigFileState.rawConfig,
			cacheKey: `file:${configPath}:${stat.mtimeMs}:${stat.size}`
		};
		const raw = fs.readFileSync(configPath, "utf8");
		const parsed = JSON5.parse(raw);
		const rawConfig = parsed && typeof parsed === "object" ? parsed : EMPTY_FACADE_BOUNDARY_CONFIG;
		cachedBoundaryConfigFileState = {
			configPath,
			mtimeMs: stat.mtimeMs,
			size: stat.size,
			rawConfig
		};
		return {
			rawConfig,
			cacheKey: `file:${configPath}:${stat.mtimeMs}:${stat.size}`
		};
	} catch {
		return { rawConfig: EMPTY_FACADE_BOUNDARY_CONFIG };
	}
}
function getFacadeBoundaryResolvedConfig() {
	const readResult = readFacadeBoundaryConfigSafely();
	const { rawConfig } = readResult;
	if (cachedBoundaryResolvedConfig && (readResult.cacheKey && cachedBoundaryResolvedConfigKey === readResult.cacheKey || !readResult.cacheKey && cachedBoundaryRawConfig === rawConfig)) return cachedBoundaryResolvedConfig;
	const autoEnabled = configMayNeedPluginAutoEnable(rawConfig, process.env) ? applyPluginAutoEnable({
		config: rawConfig,
		env: process.env
	}) : {
		config: rawConfig,
		autoEnabledReasons: {}
	};
	const config = autoEnabled.config;
	const resolved = {
		rawConfig,
		config,
		normalizedPluginsConfig: normalizePluginsConfig(config?.plugins),
		activationSource: createPluginActivationSource({ config: rawConfig }),
		autoEnabledReasons: autoEnabled.autoEnabledReasons
	};
	cachedBoundaryRawConfig = rawConfig;
	cachedBoundaryResolvedConfigKey = readResult.cacheKey;
	cachedBoundaryResolvedConfig = resolved;
	return resolved;
}
function getFacadeManifestRegistry(params) {
	const cached = cachedManifestRegistryByKey.get(params.cacheKey);
	if (cached) return cached;
	const loaded = loadPluginManifestRegistry({
		config: getFacadeBoundaryResolvedConfig().config,
		cache: true,
		...params.env ? { env: params.env } : {}
	}).plugins;
	cachedManifestRegistryByKey.set(params.cacheKey, loaded);
	return loaded;
}
function resolveRegistryPluginModuleLocation(params) {
	const registry = getFacadeManifestRegistry({
		cacheKey: params.resolutionKey,
		...params.env ? { env: params.env } : {}
	});
	const tiers = [
		(plugin) => plugin.id === params.dirName,
		(plugin) => path.basename(plugin.rootDir) === params.dirName,
		(plugin) => plugin.channels.includes(params.dirName)
	];
	const artifactBasename = normalizeBundledPluginArtifactSubpath(params.artifactBasename);
	const sourceBaseName = artifactBasename.replace(/\.js$/u, "");
	for (const matchFn of tiers) for (const record of registry.filter(matchFn)) {
		const rootDir = path.resolve(record.rootDir);
		const builtCandidate = path.join(rootDir, artifactBasename);
		if (fs.existsSync(builtCandidate)) return {
			modulePath: builtCandidate,
			boundaryRoot: rootDir
		};
		for (const ext of PUBLIC_SURFACE_SOURCE_EXTENSIONS) {
			const sourceCandidate = path.join(rootDir, `${sourceBaseName}${ext}`);
			if (fs.existsSync(sourceCandidate)) return {
				modulePath: sourceCandidate,
				boundaryRoot: rootDir
			};
		}
	}
	return null;
}
function readBundledPluginManifestRecordFromDir(params) {
	const manifestPath = path.join(params.pluginsRoot, params.resolvedDirName, "openclaw.plugin.json");
	if (!fs.existsSync(manifestPath)) return null;
	try {
		const raw = JSON5.parse(fs.readFileSync(manifestPath, "utf8"));
		if (typeof raw.id !== "string" || raw.id.trim().length === 0) return null;
		return {
			id: raw.id,
			origin: "bundled",
			enabledByDefault: raw.enabledByDefault === true,
			rootDir: path.join(params.pluginsRoot, params.resolvedDirName),
			channels: Array.isArray(raw.channels) ? raw.channels.filter((entry) => typeof entry === "string") : []
		};
	} catch {
		return null;
	}
}
function resolveBundledMetadataManifestRecord(params) {
	if (!params.location) return null;
	if (params.location.modulePath.startsWith(`${params.sourceExtensionsRoot}${path.sep}`)) {
		const resolvedDirName = path.relative(params.sourceExtensionsRoot, params.location.modulePath).split(path.sep)[0];
		if (!resolvedDirName) return null;
		return readBundledPluginManifestRecordFromDir({
			pluginsRoot: params.sourceExtensionsRoot,
			resolvedDirName
		});
	}
	const bundledPluginsDir = resolveBundledPluginsDir(params.env ?? process.env);
	if (!bundledPluginsDir) return null;
	const normalizedBundledPluginsDir = path.resolve(bundledPluginsDir);
	if (!params.location.modulePath.startsWith(`${normalizedBundledPluginsDir}${path.sep}`)) return null;
	const resolvedDirName = path.relative(normalizedBundledPluginsDir, params.location.modulePath).split(path.sep)[0];
	if (!resolvedDirName) return null;
	return readBundledPluginManifestRecordFromDir({
		pluginsRoot: normalizedBundledPluginsDir,
		resolvedDirName
	});
}
function resolveBundledPluginManifestRecord(params) {
	if (cachedFacadeManifestRecordsByKey.has(params.resolutionKey)) return cachedFacadeManifestRecordsByKey.get(params.resolutionKey) ?? null;
	const metadataRecord = resolveBundledMetadataManifestRecord(params);
	if (metadataRecord) {
		cachedFacadeManifestRecordsByKey.set(params.resolutionKey, metadataRecord);
		return metadataRecord;
	}
	const registry = getFacadeManifestRegistry({
		cacheKey: params.resolutionKey,
		...params.env ? { env: params.env } : {}
	});
	const resolved = (params.location ? registry.find((plugin) => {
		const normalizedRootDir = path.resolve(plugin.rootDir);
		const normalizedModulePath = path.resolve(params.location.modulePath);
		return normalizedModulePath === normalizedRootDir || normalizedModulePath.startsWith(`${normalizedRootDir}${path.sep}`);
	}) : null) ?? registry.find((plugin) => plugin.id === params.dirName) ?? registry.find((plugin) => path.basename(plugin.rootDir) === params.dirName) ?? registry.find((plugin) => plugin.channels.includes(params.dirName)) ?? null;
	cachedFacadeManifestRecordsByKey.set(params.resolutionKey, resolved);
	return resolved;
}
function resolveTrackedFacadePluginId(params) {
	return resolveBundledPluginManifestRecord(params)?.id ?? params.dirName;
}
function resolveBundledPluginPublicSurfaceAccess(params) {
	const cached = cachedFacadePublicSurfaceAccessByKey.get(params.resolutionKey);
	if (cached) return cached;
	if (params.artifactBasename === "runtime-api.js" && ALWAYS_ALLOWED_RUNTIME_DIR_NAMES.has(params.dirName)) {
		const resolved = {
			allowed: true,
			pluginId: params.dirName
		};
		cachedFacadePublicSurfaceAccessByKey.set(params.resolutionKey, resolved);
		return resolved;
	}
	const manifestRecord = resolveBundledPluginManifestRecord(params);
	if (!manifestRecord) {
		const resolved = {
			allowed: false,
			reason: `no bundled plugin manifest found for ${params.dirName}`
		};
		cachedFacadePublicSurfaceAccessByKey.set(params.resolutionKey, resolved);
		return resolved;
	}
	const { config, normalizedPluginsConfig, activationSource, autoEnabledReasons } = getFacadeBoundaryResolvedConfig();
	const resolved = evaluateBundledPluginPublicSurfaceAccess({
		params,
		manifestRecord,
		config,
		normalizedPluginsConfig,
		activationSource,
		autoEnabledReasons
	});
	cachedFacadePublicSurfaceAccessByKey.set(params.resolutionKey, resolved);
	return resolved;
}
function evaluateBundledPluginPublicSurfaceAccess(params) {
	const activationState = resolveEffectivePluginActivationState({
		id: params.manifestRecord.id,
		origin: params.manifestRecord.origin,
		config: params.normalizedPluginsConfig,
		rootConfig: params.config,
		enabledByDefault: params.manifestRecord.enabledByDefault,
		activationSource: params.activationSource,
		autoEnabledReason: params.autoEnabledReasons[params.manifestRecord.id]?.[0]
	});
	if (activationState.enabled) return {
		allowed: true,
		pluginId: params.manifestRecord.id
	};
	return {
		allowed: false,
		pluginId: params.manifestRecord.id,
		reason: activationState.reason ?? "plugin runtime is not activated"
	};
}
function throwForBundledPluginPublicSurfaceAccess(params) {
	const pluginLabel = params.access.pluginId ?? params.request.dirName;
	throw new Error(`Bundled plugin public surface access blocked for "${pluginLabel}" via ${params.request.dirName}/${params.request.artifactBasename}: ${params.access.reason ?? "plugin runtime is not activated"}`);
}
function resolveActivatedBundledPluginPublicSurfaceAccessOrThrow(params) {
	const access = resolveBundledPluginPublicSurfaceAccess(params);
	if (!access.allowed) throwForBundledPluginPublicSurfaceAccess({
		access,
		request: params
	});
	return access;
}
function resetFacadeActivationCheckRuntimeStateForTest() {
	cachedManifestRegistryByKey.clear();
	cachedBoundaryRawConfig = void 0;
	cachedBoundaryResolvedConfigKey = void 0;
	cachedBoundaryConfigFileState = void 0;
	cachedBoundaryResolvedConfig = void 0;
	cachedFacadeManifestRecordsByKey.clear();
	cachedFacadePublicSurfaceAccessByKey.clear();
}
//#endregion
export { evaluateBundledPluginPublicSurfaceAccess, resetFacadeActivationCheckRuntimeStateForTest, resolveActivatedBundledPluginPublicSurfaceAccessOrThrow, resolveBundledPluginPublicSurfaceAccess, resolveRegistryPluginModuleLocation, resolveTrackedFacadePluginId, throwForBundledPluginPublicSurfaceAccess };
