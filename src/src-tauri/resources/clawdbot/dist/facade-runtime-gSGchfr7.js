import { t as resolveBundledPluginsDir } from "./bundled-dir-D4Wk35JT.js";
import { i as resolveBundledPluginSourcePublicSurfacePath, r as resolveBundledPluginPublicSurfacePath } from "./public-surface-runtime-nilbjlrn.js";
import { l as resolveLoaderPackageRoot } from "./sdk-alias-w29OTN9p.js";
import { t as getCachedPluginJitiLoader } from "./jiti-loader-cache-D_0TILck.js";
import { a as loadFacadeModuleAtLocationSync$1, i as loadBundledPluginPublicSurfaceModuleSync$1 } from "./facade-loader-CGu7k8Om.js";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import "node:fs";
import path from "node:path";
//#region src/plugin-sdk/facade-runtime.ts
const OPENCLAW_PACKAGE_ROOT = resolveLoaderPackageRoot({
	modulePath: fileURLToPath(import.meta.url),
	moduleUrl: import.meta.url
}) ?? fileURLToPath(new URL("../..", import.meta.url));
const CURRENT_MODULE_PATH = fileURLToPath(import.meta.url);
const OPENCLAW_SOURCE_EXTENSIONS_ROOT = path.resolve(OPENCLAW_PACKAGE_ROOT, "extensions");
const cachedFacadeModuleLocationsByKey = /* @__PURE__ */ new Map();
function createFacadeResolutionKey(params) {
	const bundledPluginsDir = resolveBundledPluginsDir(params.env ?? process.env);
	return `${params.dirName}::${params.artifactBasename}::${bundledPluginsDir ? path.resolve(bundledPluginsDir) : "<default>"}`;
}
function resolveRegistryPluginModuleLocation(params) {
	return loadFacadeActivationCheckRuntime().resolveRegistryPluginModuleLocation({
		...params,
		resolutionKey: createFacadeResolutionKey(params)
	});
}
function resolveFacadeModuleLocationUncached(params) {
	const bundledPluginsDir = resolveBundledPluginsDir(params.env ?? process.env);
	if (!CURRENT_MODULE_PATH.includes(`${path.sep}dist${path.sep}`)) {
		const modulePath = resolveBundledPluginSourcePublicSurfacePath({
			...params,
			sourceRoot: bundledPluginsDir ?? path.resolve(OPENCLAW_PACKAGE_ROOT, "extensions")
		}) ?? resolveBundledPluginPublicSurfacePath({
			rootDir: OPENCLAW_PACKAGE_ROOT,
			env: params.env,
			...bundledPluginsDir ? { bundledPluginsDir } : {},
			dirName: params.dirName,
			artifactBasename: params.artifactBasename
		});
		if (modulePath) return {
			modulePath,
			boundaryRoot: bundledPluginsDir && modulePath.startsWith(path.resolve(bundledPluginsDir) + path.sep) ? path.resolve(bundledPluginsDir) : OPENCLAW_PACKAGE_ROOT
		};
		return resolveRegistryPluginModuleLocation(params);
	}
	const modulePath = resolveBundledPluginPublicSurfacePath({
		rootDir: OPENCLAW_PACKAGE_ROOT,
		env: params.env,
		...bundledPluginsDir ? { bundledPluginsDir } : {},
		dirName: params.dirName,
		artifactBasename: params.artifactBasename
	});
	if (modulePath) return {
		modulePath,
		boundaryRoot: bundledPluginsDir && modulePath.startsWith(path.resolve(bundledPluginsDir) + path.sep) ? path.resolve(bundledPluginsDir) : OPENCLAW_PACKAGE_ROOT
	};
	return resolveRegistryPluginModuleLocation(params);
}
function resolveFacadeModuleLocation(params) {
	const key = createFacadeResolutionKey(params);
	if (cachedFacadeModuleLocationsByKey.has(key)) return cachedFacadeModuleLocationsByKey.get(key) ?? null;
	const resolved = resolveFacadeModuleLocationUncached(params);
	cachedFacadeModuleLocationsByKey.set(key, resolved);
	return resolved;
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
export { loadBundledPluginPublicSurfaceModuleSync as n, tryLoadActivatedBundledPluginPublicSurfaceModuleSync as r, loadActivatedBundledPluginPublicSurfaceModuleSync as t };
