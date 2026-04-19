import { t as resolveBundledPluginsDir } from "./bundled-dir-D4Wk35JT.js";
import { i as openBoundaryFileSync } from "./boundary-file-read-DXLy_w6L.js";
import { r as resolveBundledPluginPublicSurfacePath } from "./public-surface-runtime-nilbjlrn.js";
import { d as resolvePluginLoaderJitiTryNative, i as isBundledPluginExtensionPath, l as resolveLoaderPackageRoot, t as buildPluginLoaderAliasMap } from "./sdk-alias-w29OTN9p.js";
import { t as getCachedPluginJitiLoader } from "./jiti-loader-cache-D_0TILck.js";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import fs from "node:fs";
import path from "node:path";
//#region src/plugins/public-surface-loader.ts
const OPENCLAW_PACKAGE_ROOT = resolveLoaderPackageRoot({
	modulePath: fileURLToPath(import.meta.url),
	moduleUrl: import.meta.url
}) ?? fileURLToPath(new URL("../..", import.meta.url));
const loadedPublicSurfaceModules = /* @__PURE__ */ new Map();
const sourceArtifactRequire = createRequire(import.meta.url);
const publicSurfaceLocations = /* @__PURE__ */ new Map();
const jitiLoaders = /* @__PURE__ */ new Map();
const sharedBundledPublicSurfaceJitiLoaders = /* @__PURE__ */ new Map();
function isSourceArtifactPath(modulePath) {
	switch (path.extname(modulePath).toLowerCase()) {
		case ".ts":
		case ".tsx":
		case ".mts":
		case ".cts":
		case ".mtsx":
		case ".ctsx": return true;
		default: return false;
	}
}
function canUseSourceArtifactRequire(params) {
	return !params.tryNative && isSourceArtifactPath(params.modulePath) && typeof sourceArtifactRequire.extensions?.[".ts"] === "function";
}
function createResolutionKey(params) {
	const bundledPluginsDir = resolveBundledPluginsDir();
	return `${params.dirName}::${params.artifactBasename}::${bundledPluginsDir ? path.resolve(bundledPluginsDir) : "<default>"}`;
}
function resolvePublicSurfaceLocationUncached(params) {
	const bundledPluginsDir = resolveBundledPluginsDir();
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
function resolvePublicSurfaceLocation(params) {
	const key = createResolutionKey(params);
	if (publicSurfaceLocations.has(key)) return publicSurfaceLocations.get(key) ?? null;
	const resolved = resolvePublicSurfaceLocationUncached(params);
	publicSurfaceLocations.set(key, resolved);
	return resolved;
}
function getJiti(modulePath) {
	const sharedLoader = getSharedBundledPublicSurfaceJiti(modulePath, resolvePluginLoaderJitiTryNative(modulePath, { preferBuiltDist: true }));
	if (sharedLoader) return sharedLoader;
	return getCachedPluginJitiLoader({
		cache: jitiLoaders,
		modulePath,
		importerUrl: import.meta.url,
		preferBuiltDist: true,
		jitiFilename: import.meta.url
	});
}
function loadPublicSurfaceModule(modulePath) {
	if (canUseSourceArtifactRequire({
		modulePath,
		tryNative: resolvePluginLoaderJitiTryNative(modulePath, { preferBuiltDist: true })
	})) return sourceArtifactRequire(modulePath);
	return getJiti(modulePath)(modulePath);
}
function getSharedBundledPublicSurfaceJiti(modulePath, tryNative) {
	const bundledPluginsDir = resolveBundledPluginsDir();
	if (!isBundledPluginExtensionPath({
		modulePath,
		openClawPackageRoot: OPENCLAW_PACKAGE_ROOT,
		...bundledPluginsDir ? { bundledPluginsDir } : {}
	})) return null;
	const cacheKey = tryNative ? "bundled:native" : "bundled:source";
	const aliasMap = buildPluginLoaderAliasMap(modulePath, process.argv[1], import.meta.url);
	return getCachedPluginJitiLoader({
		cache: sharedBundledPublicSurfaceJitiLoaders,
		modulePath,
		importerUrl: import.meta.url,
		jitiFilename: import.meta.url,
		cacheScopeKey: cacheKey,
		aliasMap,
		tryNative
	});
}
function loadBundledPluginPublicArtifactModuleSync(params) {
	const location = resolvePublicSurfaceLocation(params);
	if (!location) throw new Error(`Unable to resolve bundled plugin public surface ${params.dirName}/${params.artifactBasename}`);
	const cached = loadedPublicSurfaceModules.get(location.modulePath);
	if (cached) return cached;
	const opened = openBoundaryFileSync({
		absolutePath: location.modulePath,
		rootPath: location.boundaryRoot,
		boundaryLabel: location.boundaryRoot === OPENCLAW_PACKAGE_ROOT ? "OpenClaw package root" : "bundled plugin directory",
		rejectHardlinks: false
	});
	if (!opened.ok) throw new Error(`Unable to open bundled plugin public surface ${params.dirName}/${params.artifactBasename}`, { cause: opened.error });
	fs.closeSync(opened.fd);
	const sentinel = {};
	loadedPublicSurfaceModules.set(location.modulePath, sentinel);
	try {
		const loaded = loadPublicSurfaceModule(location.modulePath);
		Object.assign(sentinel, loaded);
		return sentinel;
	} catch (error) {
		loadedPublicSurfaceModules.delete(location.modulePath);
		throw error;
	}
}
//#endregion
export { loadBundledPluginPublicArtifactModuleSync as t };
