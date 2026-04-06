import { i as openBoundaryFileSync } from "./boundary-file-read-LPHTYrMX.js";
import { c as loadConfig } from "./io-DhtVmzAJ.js";
import { _ as resolveBundledPluginsDir, c as resolveBundledPluginPublicSurfacePath, d as buildPluginLoaderJitiOptions, f as resolveLoaderPackageRoot, g as shouldPreferNativeJiti, u as buildPluginLoaderAliasMap } from "./chat-meta-Cdrnv7R-.js";
import { a as normalizePluginsConfig, s as resolveEffectivePluginActivationState } from "./config-state-zclcq4hc.js";
import { n as loadPluginManifestRegistry } from "./manifest-registry-BSmqODu2.js";
import "./config-CJQx-9zo.js";
import { t as applyPluginAutoEnable } from "./plugin-auto-enable-CqpAn9Qh.js";
import { fileURLToPath } from "node:url";
import fsSync from "node:fs";
import path from "node:path";
import { createJiti } from "jiti";
//#region src/plugin-sdk/facade-runtime.ts
const OPENCLAW_PACKAGE_ROOT = resolveLoaderPackageRoot({
	modulePath: fileURLToPath(import.meta.url),
	moduleUrl: import.meta.url
}) ?? fileURLToPath(new URL("../..", import.meta.url));
const CURRENT_MODULE_PATH = fileURLToPath(import.meta.url);
const PUBLIC_SURFACE_SOURCE_EXTENSIONS = [
	".ts",
	".mts",
	".js",
	".mjs",
	".cts",
	".cjs"
];
const ALWAYS_ALLOWED_RUNTIME_DIR_NAMES = new Set([
	"image-generation-core",
	"media-understanding-core",
	"speech-core"
]);
const EMPTY_FACADE_BOUNDARY_CONFIG = {};
const jitiLoaders = /* @__PURE__ */ new Map();
const loadedFacadeModules = /* @__PURE__ */ new Map();
const loadedFacadePluginIds = /* @__PURE__ */ new Set();
let cachedBoundaryRawConfig;
let cachedBoundaryResolvedConfig;
function resolveSourceFirstPublicSurfacePath(params) {
	const sourceBaseName = params.artifactBasename.replace(/\.js$/u, "");
	const sourceRoot = params.bundledPluginsDir ?? path.resolve(OPENCLAW_PACKAGE_ROOT, "extensions");
	for (const ext of PUBLIC_SURFACE_SOURCE_EXTENSIONS) {
		const candidate = path.resolve(sourceRoot, params.dirName, `${sourceBaseName}${ext}`);
		if (fsSync.existsSync(candidate)) return candidate;
	}
	return null;
}
function resolveFacadeModuleLocation(params) {
	const bundledPluginsDir = resolveBundledPluginsDir();
	if (!CURRENT_MODULE_PATH.includes(`${path.sep}dist${path.sep}`)) {
		const modulePath = resolveSourceFirstPublicSurfacePath({
			...params,
			...bundledPluginsDir ? { bundledPluginsDir } : {}
		}) ?? resolveSourceFirstPublicSurfacePath(params) ?? resolveBundledPluginPublicSurfacePath({
			rootDir: OPENCLAW_PACKAGE_ROOT,
			...bundledPluginsDir ? { bundledPluginsDir } : {},
			dirName: params.dirName,
			artifactBasename: params.artifactBasename
		});
		if (!modulePath) return null;
		return {
			modulePath,
			boundaryRoot: bundledPluginsDir && modulePath.startsWith(path.resolve(bundledPluginsDir) + path.sep) ? path.resolve(bundledPluginsDir) : OPENCLAW_PACKAGE_ROOT
		};
	}
	const modulePath = resolveBundledPluginPublicSurfacePath({
		rootDir: OPENCLAW_PACKAGE_ROOT,
		...bundledPluginsDir ? { bundledPluginsDir } : {},
		dirName: params.dirName,
		artifactBasename: params.artifactBasename
	});
	if (!modulePath) return null;
	return {
		modulePath,
		boundaryRoot: bundledPluginsDir && modulePath.startsWith(path.resolve(bundledPluginsDir) + path.sep) ? path.resolve(bundledPluginsDir) : OPENCLAW_PACKAGE_ROOT
	};
}
function getJiti(modulePath) {
	const tryNative = shouldPreferNativeJiti(modulePath) || modulePath.includes(`${path.sep}dist${path.sep}`);
	const aliasMap = buildPluginLoaderAliasMap(modulePath, process.argv[1], import.meta.url);
	const cacheKey = JSON.stringify({
		tryNative,
		aliasMap: Object.entries(aliasMap).toSorted(([left], [right]) => left.localeCompare(right))
	});
	const cached = jitiLoaders.get(cacheKey);
	if (cached) return cached;
	const loader = createJiti(import.meta.url, {
		...buildPluginLoaderJitiOptions(aliasMap),
		tryNative
	});
	jitiLoaders.set(cacheKey, loader);
	return loader;
}
function readFacadeBoundaryConfigSafely() {
	try {
		const config = loadConfig();
		return config && typeof config === "object" ? config : EMPTY_FACADE_BOUNDARY_CONFIG;
	} catch {
		return EMPTY_FACADE_BOUNDARY_CONFIG;
	}
}
function getFacadeBoundaryResolvedConfig() {
	const rawConfig = readFacadeBoundaryConfigSafely();
	if (cachedBoundaryResolvedConfig && cachedBoundaryRawConfig === rawConfig) return cachedBoundaryResolvedConfig;
	const autoEnabled = applyPluginAutoEnable({
		config: rawConfig,
		env: process.env
	});
	const config = autoEnabled.config;
	const resolved = {
		rawConfig,
		config,
		normalizedPluginsConfig: normalizePluginsConfig(config?.plugins),
		sourceNormalizedPluginsConfig: normalizePluginsConfig(rawConfig?.plugins),
		autoEnabledReasons: autoEnabled.autoEnabledReasons
	};
	cachedBoundaryRawConfig = rawConfig;
	cachedBoundaryResolvedConfig = resolved;
	return resolved;
}
function resolveBundledPluginManifestRecordByDirName(dirName) {
	const { config } = getFacadeBoundaryResolvedConfig();
	return loadPluginManifestRegistry({
		config,
		cache: true
	}).plugins.find((plugin) => plugin.origin === "bundled" && path.basename(plugin.rootDir) === dirName) ?? null;
}
function resolveTrackedFacadePluginId(dirName) {
	return resolveBundledPluginManifestRecordByDirName(dirName)?.id ?? dirName;
}
function resolveBundledPluginPublicSurfaceAccess(params) {
	if (params.artifactBasename === "runtime-api.js" && ALWAYS_ALLOWED_RUNTIME_DIR_NAMES.has(params.dirName)) return {
		allowed: true,
		pluginId: params.dirName
	};
	const manifestRecord = resolveBundledPluginManifestRecordByDirName(params.dirName);
	if (!manifestRecord) return {
		allowed: false,
		reason: `no bundled plugin manifest found for ${params.dirName}`
	};
	const { rawConfig, config, normalizedPluginsConfig, sourceNormalizedPluginsConfig, autoEnabledReasons } = getFacadeBoundaryResolvedConfig();
	const activationState = resolveEffectivePluginActivationState({
		id: manifestRecord.id,
		origin: manifestRecord.origin,
		config: normalizedPluginsConfig,
		rootConfig: config,
		enabledByDefault: manifestRecord.enabledByDefault,
		sourceConfig: sourceNormalizedPluginsConfig,
		sourceRootConfig: rawConfig,
		autoEnabledReason: autoEnabledReasons[manifestRecord.id]?.[0]
	});
	if (activationState.enabled) return {
		allowed: true,
		pluginId: manifestRecord.id
	};
	return {
		allowed: false,
		pluginId: manifestRecord.id,
		reason: activationState.reason ?? "plugin runtime is not activated"
	};
}
function createLazyFacadeValueLoader(load) {
	let loaded = false;
	let value;
	return () => {
		if (!loaded) {
			value = load();
			loaded = true;
		}
		return value;
	};
}
function createLazyFacadeProxyValue(params) {
	const resolve = createLazyFacadeValueLoader(params.load);
	return new Proxy(params.target, {
		defineProperty(_target, property, descriptor) {
			return Reflect.defineProperty(resolve(), property, descriptor);
		},
		deleteProperty(_target, property) {
			return Reflect.deleteProperty(resolve(), property);
		},
		get(_target, property, receiver) {
			return Reflect.get(resolve(), property, receiver);
		},
		getOwnPropertyDescriptor(_target, property) {
			return Reflect.getOwnPropertyDescriptor(resolve(), property);
		},
		getPrototypeOf() {
			return Reflect.getPrototypeOf(resolve());
		},
		has(_target, property) {
			return Reflect.has(resolve(), property);
		},
		isExtensible() {
			return Reflect.isExtensible(resolve());
		},
		ownKeys() {
			return Reflect.ownKeys(resolve());
		},
		preventExtensions() {
			return Reflect.preventExtensions(resolve());
		},
		set(_target, property, value, receiver) {
			return Reflect.set(resolve(), property, value, receiver);
		},
		setPrototypeOf(_target, prototype) {
			return Reflect.setPrototypeOf(resolve(), prototype);
		}
	});
}
function createLazyFacadeObjectValue(load) {
	return createLazyFacadeProxyValue({
		load,
		target: {}
	});
}
function createLazyFacadeArrayValue(load) {
	return createLazyFacadeProxyValue({
		load,
		target: []
	});
}
function loadBundledPluginPublicSurfaceModuleSync(params) {
	const location = resolveFacadeModuleLocation(params);
	if (!location) throw new Error(`Unable to resolve bundled plugin public surface ${params.dirName}/${params.artifactBasename}`);
	const cached = loadedFacadeModules.get(location.modulePath);
	if (cached) return cached;
	const opened = openBoundaryFileSync({
		absolutePath: location.modulePath,
		rootPath: location.boundaryRoot,
		boundaryLabel: location.boundaryRoot === OPENCLAW_PACKAGE_ROOT ? "OpenClaw package root" : "bundled plugin directory",
		rejectHardlinks: false
	});
	if (!opened.ok) throw new Error(`Unable to open bundled plugin public surface ${params.dirName}/${params.artifactBasename}`, { cause: opened.error });
	fsSync.closeSync(opened.fd);
	const sentinel = {};
	loadedFacadeModules.set(location.modulePath, sentinel);
	let loaded;
	try {
		loadedFacadePluginIds.add(resolveTrackedFacadePluginId(params.dirName));
		loaded = getJiti(location.modulePath)(location.modulePath);
		Object.assign(sentinel, loaded);
	} catch (err) {
		loadedFacadeModules.delete(location.modulePath);
		throw err;
	}
	return sentinel;
}
function loadActivatedBundledPluginPublicSurfaceModuleSync(params) {
	const access = resolveBundledPluginPublicSurfaceAccess(params);
	if (!access.allowed) {
		const pluginLabel = access.pluginId ?? params.dirName;
		throw new Error(`Bundled plugin public surface access blocked for "${pluginLabel}" via ${params.dirName}/${params.artifactBasename}: ${access.reason ?? "plugin runtime is not activated"}`);
	}
	return loadBundledPluginPublicSurfaceModuleSync(params);
}
function tryLoadActivatedBundledPluginPublicSurfaceModuleSync(params) {
	if (!resolveBundledPluginPublicSurfaceAccess(params).allowed) return null;
	return loadBundledPluginPublicSurfaceModuleSync(params);
}
function listImportedBundledPluginFacadeIds() {
	return [...loadedFacadePluginIds].toSorted((left, right) => left.localeCompare(right));
}
//#endregion
export { loadBundledPluginPublicSurfaceModuleSync as a, loadActivatedBundledPluginPublicSurfaceModuleSync as i, createLazyFacadeObjectValue as n, tryLoadActivatedBundledPluginPublicSurfaceModuleSync as o, listImportedBundledPluginFacadeIds as r, createLazyFacadeArrayValue as t };
