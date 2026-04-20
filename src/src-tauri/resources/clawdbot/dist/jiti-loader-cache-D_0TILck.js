import { n as buildPluginLoaderJitiOptions, r as createPluginLoaderJitiCacheKey, u as resolvePluginLoaderJitiConfig } from "./sdk-alias-w29OTN9p.js";
import { createJiti } from "jiti";
//#region src/plugins/jiti-loader-cache.ts
function getCachedPluginJitiLoader(params) {
	const defaultConfig = params.aliasMap || typeof params.tryNative === "boolean" ? resolvePluginLoaderJitiConfig({
		modulePath: params.modulePath,
		argv1: params.argvEntry ?? process.argv[1],
		moduleUrl: params.importerUrl,
		...params.preferBuiltDist ? { preferBuiltDist: true } : {}
	}) : null;
	const { tryNative, aliasMap } = defaultConfig ? {
		tryNative: params.tryNative ?? defaultConfig.tryNative,
		aliasMap: params.aliasMap ?? defaultConfig.aliasMap
	} : resolvePluginLoaderJitiConfig({
		modulePath: params.modulePath,
		argv1: params.argvEntry ?? process.argv[1],
		moduleUrl: params.importerUrl,
		...params.preferBuiltDist ? { preferBuiltDist: true } : {}
	});
	const cacheKey = createPluginLoaderJitiCacheKey({
		tryNative,
		aliasMap
	});
	const scopedCacheKey = `${params.jitiFilename ?? params.modulePath}::${params.cacheScopeKey ?? cacheKey}`;
	const cached = params.cache.get(scopedCacheKey);
	if (cached) return cached;
	const loader = (params.createLoader ?? createJiti)(params.jitiFilename ?? params.modulePath, {
		...buildPluginLoaderJitiOptions(aliasMap),
		tryNative
	});
	params.cache.set(scopedCacheKey, loader);
	return loader;
}
//#endregion
export { getCachedPluginJitiLoader as t };
