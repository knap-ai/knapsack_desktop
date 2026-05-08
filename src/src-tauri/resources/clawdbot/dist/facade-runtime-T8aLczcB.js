import { t as resolveBundledPluginsDir } from "./bundled-dir-DygrJuRr.js";
import { t as getCachedPluginJitiLoader } from "./jiti-loader-cache-DLO0UJX_.js";
import { l as resolveLoaderPackageRoot } from "./sdk-alias-Cx73ipZ2.js";
import { n as resolveBundledFacadeModuleLocation, r as resolveCachedFacadeModuleLocation, t as createFacadeResolutionKey$1 } from "./facade-resolution-shared-DueUCXAq.js";
import { a as loadFacadeModuleAtLocationSync$1, i as loadBundledPluginPublicSurfaceModuleSync$1 } from "./facade-loader-BAtcmKGO.js";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import path from "node:path";
//#region src/plugin-sdk/facade-runtime.ts
function createLazyFacadeValue(loadFacadeModule, key) {
	return ((...args) => {
		const value = loadFacadeModule()[key];
		if (typeof value !== "function") return value;
		return value(...args);
	});
}
const OPENCLAW_PACKAGE_ROOT = resolveLoaderPackageRoot({
	modulePath: fileURLToPath(import.meta.url),
	moduleUrl: import.meta.url
}) ?? fileURLToPath(new URL("../..", import.meta.url));
const CURRENT_MODULE_PATH = fileURLToPath(import.meta.url);
const OPENCLAW_SOURCE_EXTENSIONS_ROOT = path.resolve(OPENCLAW_PACKAGE_ROOT, "extensions");
const cachedFacadeModuleLocationsByKey = /* @__PURE__ */ new Map();
function createFacadeResolutionKey(params) {
	const bundledPluginsDir = resolveBundledPluginsDir(params.env ?? process.env);
	return createFacadeResolutionKey$1({
		...params,
		bundledPluginsDir
	});
}
function resolveRegistryPluginModuleLocation(params) {
	return loadFacadeActivationCheckRuntime().resolveRegistryPluginModuleLocation({
		...params,
		resolutionKey: createFacadeResolutionKey(params)
	});
}
function resolveFacadeModuleLocationUncached(params) {
	const bundledPluginsDir = resolveBundledPluginsDir(params.env ?? process.env);
	const bundledLocation = resolveBundledFacadeModuleLocation({
		...params,
		currentModulePath: CURRENT_MODULE_PATH,
		packageRoot: OPENCLAW_PACKAGE_ROOT,
		bundledPluginsDir
	});
	if (bundledLocation) return bundledLocation;
	return resolveRegistryPluginModuleLocation(params);
}
function resolveFacadeModuleLocation(params) {
	return resolveCachedFacadeModuleLocation({
		cache: cachedFacadeModuleLocationsByKey,
		key: createFacadeResolutionKey(params),
		resolve: () => resolveFacadeModuleLocationUncached(params)
	});
}
const nodeRequire = createRequire(import.meta.url);
const FACADE_ACTIVATION_CHECK_RUNTIME_CANDIDATES = ["./facade-activation-check.runtime.js", "./facade-activation-check.runtime.ts"];
let facadeActivationCheckRuntimeModule;
const facadeActivationCheckRuntimeJitiLoaders = /* @__PURE__ */ new Map();
function getFacadeActivationCheckRuntimeJiti(modulePath) {
	return getCachedPluginJitiLoader({
		cache: facadeActivationCheckRuntimeJitiLoaders,
		modulePath,
		importerUrl: import.meta.url,
		jitiFilename: import.meta.url,
		aliasMap: {},
		tryNative: false
	});
}
function loadFacadeActivationCheckRuntimeFromCandidates(loadCandidate) {
	for (const candidate of FACADE_ACTIVATION_CHECK_RUNTIME_CANDIDATES) try {
		return loadCandidate(candidate);
	} catch {}
}
function loadFacadeActivationCheckRuntime() {
	if (facadeActivationCheckRuntimeModule) return facadeActivationCheckRuntimeModule;
	facadeActivationCheckRuntimeModule = loadFacadeActivationCheckRuntimeFromCandidates((candidate) => nodeRequire(candidate));
	if (facadeActivationCheckRuntimeModule) return facadeActivationCheckRuntimeModule;
	facadeActivationCheckRuntimeModule = loadFacadeActivationCheckRuntimeFromCandidates((candidate) => getFacadeActivationCheckRuntimeJiti(candidate)(candidate));
	if (facadeActivationCheckRuntimeModule) return facadeActivationCheckRuntimeModule;
	throw new Error("Unable to load facade activation check runtime");
}
function loadFacadeModuleAtLocationSync(params) {
	return loadFacadeModuleAtLocationSync$1(params);
}
function buildFacadeActivationCheckParams(params, location = resolveFacadeModuleLocation(params)) {
	return {
		...params,
		location,
		sourceExtensionsRoot: OPENCLAW_SOURCE_EXTENSIONS_ROOT,
		resolutionKey: createFacadeResolutionKey(params)
	};
}
function loadBundledPluginPublicSurfaceModuleSync(params) {
	const location = resolveFacadeModuleLocation(params);
	const trackedPluginId = () => loadFacadeActivationCheckRuntime().resolveTrackedFacadePluginId(buildFacadeActivationCheckParams(params, location));
	if (!location) return loadBundledPluginPublicSurfaceModuleSync$1({
		...params,
		trackedPluginId
	});
	return loadFacadeModuleAtLocationSync({
		location,
		trackedPluginId
	});
}
function loadActivatedBundledPluginPublicSurfaceModuleSync(params) {
	loadFacadeActivationCheckRuntime().resolveActivatedBundledPluginPublicSurfaceAccessOrThrow(buildFacadeActivationCheckParams(params));
	return loadBundledPluginPublicSurfaceModuleSync(params);
}
function tryLoadActivatedBundledPluginPublicSurfaceModuleSync(params) {
	if (!loadFacadeActivationCheckRuntime().resolveBundledPluginPublicSurfaceAccess(buildFacadeActivationCheckParams(params)).allowed) return null;
	return loadBundledPluginPublicSurfaceModuleSync(params);
}
//#endregion
export { tryLoadActivatedBundledPluginPublicSurfaceModuleSync as i, loadActivatedBundledPluginPublicSurfaceModuleSync as n, loadBundledPluginPublicSurfaceModuleSync as r, createLazyFacadeValue as t };
