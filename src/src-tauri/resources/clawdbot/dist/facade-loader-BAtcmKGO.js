import { t as resolveBundledPluginsDir } from "./bundled-dir-DygrJuRr.js";
import { i as openBoundaryFileSync } from "./boundary-file-read-C8TEdk8a.js";
import { t as getCachedPluginJitiLoader } from "./jiti-loader-cache-DLO0UJX_.js";
import { l as resolveLoaderPackageRoot } from "./sdk-alias-Cx73ipZ2.js";
import { n as resolveBundledFacadeModuleLocation, r as resolveCachedFacadeModuleLocation, t as createFacadeResolutionKey$1 } from "./facade-resolution-shared-DueUCXAq.js";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import fs from "node:fs";
import path from "node:path";
//#region src/plugin-sdk/facade-loader.ts
const CURRENT_MODULE_PATH = fileURLToPath(import.meta.url);
const nodeRequire = createRequire(import.meta.url);
const jitiLoaders = /* @__PURE__ */ new Map();
const loadedFacadeModules = /* @__PURE__ */ new Map();
const loadedFacadePluginIds = /* @__PURE__ */ new Set();
const cachedFacadeModuleLocationsByKey = /* @__PURE__ */ new Map();
let facadeLoaderJitiFactory;
let cachedOpenClawPackageRoot;
function getJitiFactory() {
	if (facadeLoaderJitiFactory) return facadeLoaderJitiFactory;
	const { createJiti } = nodeRequire("jiti");
	facadeLoaderJitiFactory = createJiti;
	return facadeLoaderJitiFactory;
}
function getOpenClawPackageRoot() {
	if (cachedOpenClawPackageRoot) return cachedOpenClawPackageRoot;
	cachedOpenClawPackageRoot = resolveLoaderPackageRoot({
		modulePath: fileURLToPath(import.meta.url),
		moduleUrl: import.meta.url
	}) ?? fileURLToPath(new URL("../..", import.meta.url));
	return cachedOpenClawPackageRoot;
}
function createFacadeResolutionKey(params) {
	const bundledPluginsDir = resolveBundledPluginsDir(params.env ?? process.env);
	return createFacadeResolutionKey$1({
		...params,
		bundledPluginsDir
	});
}
function resolveFacadeModuleLocationUncached(params) {
	const bundledPluginsDir = resolveBundledPluginsDir(params.env ?? process.env);
	return resolveBundledFacadeModuleLocation({
		...params,
		currentModulePath: CURRENT_MODULE_PATH,
		packageRoot: getOpenClawPackageRoot(),
		bundledPluginsDir
	});
}
function resolveFacadeModuleLocation(params) {
	return resolveCachedFacadeModuleLocation({
		cache: cachedFacadeModuleLocationsByKey,
		key: createFacadeResolutionKey(params),
		resolve: () => resolveFacadeModuleLocationUncached(params)
	});
}
function getJiti(modulePath) {
	return getCachedPluginJitiLoader({
		cache: jitiLoaders,
		modulePath,
		importerUrl: import.meta.url,
		preferBuiltDist: true,
		jitiFilename: import.meta.url,
		createLoader: getJitiFactory()
	});
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
function loadFacadeModuleAtLocationSync(params) {
	const cached = loadedFacadeModules.get(params.location.modulePath);
	if (cached) return cached;
	const opened = openBoundaryFileSync({
		absolutePath: params.location.modulePath,
		rootPath: params.location.boundaryRoot,
		boundaryLabel: params.location.boundaryRoot === getOpenClawPackageRoot() ? "OpenClaw package root" : (() => {
			const bundledDir = resolveBundledPluginsDir();
			return bundledDir && path.resolve(params.location.boundaryRoot) === path.resolve(bundledDir) ? "bundled plugin directory" : "plugin root";
		})(),
		rejectHardlinks: false
	});
	if (!opened.ok) throw new Error(`Unable to open bundled plugin public surface ${params.location.modulePath}`, { cause: opened.error });
	fs.closeSync(opened.fd);
	const sentinel = {};
	loadedFacadeModules.set(params.location.modulePath, sentinel);
	let loaded;
	try {
		loaded = params.loadModule?.(params.location.modulePath) ?? getJiti(params.location.modulePath)(params.location.modulePath);
		Object.assign(sentinel, loaded);
		loadedFacadePluginIds.add(typeof params.trackedPluginId === "function" ? params.trackedPluginId() : params.trackedPluginId);
	} catch (err) {
		loadedFacadeModules.delete(params.location.modulePath);
		throw err;
	}
	return sentinel;
}
function loadBundledPluginPublicSurfaceModuleSync(params) {
	const location = resolveFacadeModuleLocation(params);
	if (!location) throw new Error(`Unable to resolve bundled plugin public surface ${params.dirName}/${params.artifactBasename}`);
	return loadFacadeModuleAtLocationSync({
		location,
		trackedPluginId: params.trackedPluginId ?? params.dirName
	});
}
function listImportedBundledPluginFacadeIds() {
	return [...loadedFacadePluginIds].toSorted((left, right) => left.localeCompare(right));
}
//#endregion
export { loadFacadeModuleAtLocationSync as a, loadBundledPluginPublicSurfaceModuleSync as i, createLazyFacadeObjectValue as n, listImportedBundledPluginFacadeIds as r, createLazyFacadeArrayValue as t };
