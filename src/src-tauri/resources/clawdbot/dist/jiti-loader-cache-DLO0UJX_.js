import { n as buildPluginLoaderJitiOptions, r as createPluginLoaderJitiCacheKey, u as resolvePluginLoaderJitiConfig } from "./sdk-alias-Cx73ipZ2.js";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";
import path from "node:path";
import { createJiti } from "jiti";
//#region src/shared/import-specifier.ts
/**
* On Windows, Node's ESM loader requires absolute paths to be expressed as
* file:// URLs. Raw drive-letter paths like C:\... are parsed as URL schemes.
*/
function toSafeImportPath(specifier) {
	if (process.platform !== "win32") return specifier;
	if (specifier.startsWith("file://")) return specifier;
	if (path.win32.isAbsolute(specifier)) return pathToFileURL(specifier, { windows: true }).href;
	return specifier;
}
//#endregion
//#region src/plugins/native-module-require.ts
const nodeRequire = createRequire(import.meta.url);
function isJavaScriptModulePath(modulePath) {
	return [
		".js",
		".mjs",
		".cjs"
	].includes(path.extname(modulePath).toLowerCase());
}
function tryNativeRequireJavaScriptModule(modulePath, options = {}) {
	if (process.platform === "win32" && options.allowWindows !== true) return { ok: false };
	if (!isJavaScriptModulePath(modulePath)) return { ok: false };
	try {
		return {
			ok: true,
			moduleExport: nodeRequire(modulePath)
		};
	} catch {
		return { ok: false };
	}
}
//#endregion
//#region src/plugins/jiti-loader-cache.ts
function getCachedPluginJitiLoader(params) {
	const jitiFilename = toSafeImportPath(params.jitiFilename ?? params.modulePath);
	if (params.cacheScopeKey) {
		const scopedCacheKey = `${jitiFilename}::${params.cacheScopeKey}`;
		const cached = params.cache.get(scopedCacheKey);
		if (cached) return cached;
	}
	const hasAliasOverride = Boolean(params.aliasMap);
	const hasTryNativeOverride = typeof params.tryNative === "boolean";
	const defaultConfig = hasAliasOverride || hasTryNativeOverride ? resolvePluginLoaderJitiConfig({
		modulePath: params.modulePath,
		argv1: params.argvEntry ?? process.argv[1],
		moduleUrl: params.importerUrl,
		...params.preferBuiltDist ? { preferBuiltDist: true } : {},
		...params.pluginSdkResolution ? { pluginSdkResolution: params.pluginSdkResolution } : {}
	}) : null;
	const canReuseDefaultCacheKey = defaultConfig !== null && (!hasAliasOverride || params.aliasMap === defaultConfig.aliasMap) && (!hasTryNativeOverride || params.tryNative === defaultConfig.tryNative);
	const resolved = defaultConfig ? {
		tryNative: params.tryNative ?? defaultConfig.tryNative,
		aliasMap: params.aliasMap ?? defaultConfig.aliasMap,
		cacheKey: canReuseDefaultCacheKey ? defaultConfig.cacheKey : void 0
	} : resolvePluginLoaderJitiConfig({
		modulePath: params.modulePath,
		argv1: params.argvEntry ?? process.argv[1],
		moduleUrl: params.importerUrl,
		...params.preferBuiltDist ? { preferBuiltDist: true } : {},
		...params.pluginSdkResolution ? { pluginSdkResolution: params.pluginSdkResolution } : {}
	});
	const { tryNative, aliasMap } = resolved;
	const cacheKey = resolved.cacheKey ?? createPluginLoaderJitiCacheKey({
		tryNative,
		aliasMap
	});
	const scopedCacheKey = `${jitiFilename}::${params.cacheScopeKey ?? cacheKey}`;
	const cached = params.cache.get(scopedCacheKey);
	if (cached) return cached;
	const jitiLoader = (params.createLoader ?? createJiti)(jitiFilename, {
		...buildPluginLoaderJitiOptions(aliasMap),
		tryNative
	});
	const loadWithJiti = new Proxy(jitiLoader, { apply(target, thisArg, argArray) {
		const [first, ...rest] = argArray;
		if (typeof first === "string") return Reflect.apply(target, thisArg, [toSafeImportPath(first), ...rest]);
		return Reflect.apply(target, thisArg, argArray);
	} });
	if (!tryNative) {
		params.cache.set(scopedCacheKey, loadWithJiti);
		return loadWithJiti;
	}
	const loader = ((target, ...rest) => {
		const native = tryNativeRequireJavaScriptModule(target);
		if (native.ok) return native.moduleExport;
		return loadWithJiti(target, ...rest);
	});
	params.cache.set(scopedCacheKey, loader);
	return loader;
}
//#endregion
export { toSafeImportPath as i, isJavaScriptModulePath as n, tryNativeRequireJavaScriptModule as r, getCachedPluginJitiLoader as t };
