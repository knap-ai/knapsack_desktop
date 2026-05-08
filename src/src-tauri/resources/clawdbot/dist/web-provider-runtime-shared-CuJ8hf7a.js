import { i as normalizePluginIdScope, n as hasExplicitPluginIdScope } from "./plugin-scope-C6pWBGis.js";
import { r as withActivatedPluginIds } from "./activation-context-BoOFvRID.js";
import { a as resolveRuntimePluginRegistry, i as resolveCompatibleRuntimePluginRegistry, r as loadOpenClawPlugins, t as isPluginRegistryLoadInFlight } from "./loader--FR-1ZCZ.js";
import { c as getActivePluginRegistryWorkspaceDir } from "./runtime-Df1Zlb_-.js";
import { n as buildPluginRuntimeLoadOptionsFromValues, r as createPluginRuntimeLoaderLogger } from "./load-context-CLK7HMMp.js";
import { n as resolvePluginSnapshotCacheTtlMs, r as shouldUsePluginSnapshotCache, t as buildPluginSnapshotCacheEnvKey } from "./cache-controls-BiAmHxm6.js";
import { s as buildWebProviderSnapshotCacheKey } from "./web-search-providers.shared-DN1TwPn0.js";
//#region src/plugins/web-provider-runtime-shared.ts
function createWebProviderSnapshotCache() {
	return /* @__PURE__ */ new WeakMap();
}
function resolveWebProviderLoadOptions(params, deps) {
	const env = params.env ?? process.env;
	const workspaceDir = params.workspaceDir ?? getActivePluginRegistryWorkspaceDir();
	const { config, activationSourceConfig, autoEnabledReasons } = deps.resolveBundledResolutionConfig({
		...params,
		workspaceDir,
		env
	});
	const onlyPluginIds = normalizePluginIdScope(deps.resolveCandidatePluginIds({
		config,
		workspaceDir,
		env,
		onlyPluginIds: params.onlyPluginIds,
		origin: params.origin
	}));
	return buildPluginRuntimeLoadOptionsFromValues({
		env,
		config,
		activationSourceConfig,
		autoEnabledReasons,
		workspaceDir,
		logger: createPluginRuntimeLoaderLogger()
	}, {
		cache: params.cache ?? false,
		activate: params.activate ?? false,
		...hasExplicitPluginIdScope(onlyPluginIds) ? { onlyPluginIds } : {}
	});
}
function resolvePluginWebProviders(params, deps) {
	const env = params.env ?? process.env;
	const workspaceDir = params.workspaceDir ?? getActivePluginRegistryWorkspaceDir();
	if (params.mode === "setup") {
		const pluginIds = deps.resolveCandidatePluginIds({
			config: params.config,
			workspaceDir,
			env,
			onlyPluginIds: params.onlyPluginIds,
			origin: params.origin
		}) ?? [];
		if (pluginIds.length === 0) return [];
		if (params.activate !== true) {
			const bundledArtifactProviders = deps.resolveBundledPublicArtifactProviders?.({
				config: params.config,
				workspaceDir,
				env,
				bundledAllowlistCompat: params.bundledAllowlistCompat,
				onlyPluginIds: pluginIds
			});
			if (bundledArtifactProviders) return bundledArtifactProviders;
		}
		const registry = loadOpenClawPlugins(buildPluginRuntimeLoadOptionsFromValues({
			config: withActivatedPluginIds({
				config: params.config,
				pluginIds
			}),
			activationSourceConfig: params.config,
			autoEnabledReasons: {},
			workspaceDir,
			env,
			logger: createPluginRuntimeLoaderLogger()
		}, {
			onlyPluginIds: pluginIds,
			cache: params.cache ?? false,
			activate: params.activate ?? false
		}));
		return deps.mapRegistryProviders({
			registry,
			onlyPluginIds: pluginIds
		});
	}
	const cacheOwnerConfig = params.config;
	const shouldMemoizeSnapshot = params.activate !== true && params.cache !== true && shouldUsePluginSnapshotCache(env);
	const cacheKey = buildWebProviderSnapshotCacheKey({
		config: cacheOwnerConfig,
		workspaceDir,
		bundledAllowlistCompat: params.bundledAllowlistCompat,
		onlyPluginIds: params.onlyPluginIds,
		origin: params.origin,
		envKey: buildPluginSnapshotCacheEnvKey(env)
	});
	if (cacheOwnerConfig && shouldMemoizeSnapshot) {
		const cached = (deps.snapshotCache.get(cacheOwnerConfig)?.get(env))?.get(cacheKey);
		if (cached && cached.expiresAt > Date.now()) return cached.providers;
	}
	const memoizeSnapshot = (providers) => {
		if (!cacheOwnerConfig || !shouldMemoizeSnapshot) return;
		const ttlMs = resolvePluginSnapshotCacheTtlMs(env);
		let configCache = deps.snapshotCache.get(cacheOwnerConfig);
		if (!configCache) {
			configCache = /* @__PURE__ */ new WeakMap();
			deps.snapshotCache.set(cacheOwnerConfig, configCache);
		}
		let envCache = configCache.get(env);
		if (!envCache) {
			envCache = /* @__PURE__ */ new Map();
			configCache.set(env, envCache);
		}
		envCache.set(cacheKey, {
			expiresAt: Date.now() + ttlMs,
			providers
		});
	};
	const loadOptions = resolveWebProviderLoadOptions(params, deps);
	const compatible = resolveCompatibleRuntimePluginRegistry(loadOptions);
	if (compatible) {
		const resolved = deps.mapRegistryProviders({
			registry: compatible,
			onlyPluginIds: params.onlyPluginIds
		});
		memoizeSnapshot(resolved);
		return resolved;
	}
	if (isPluginRegistryLoadInFlight(loadOptions)) return [];
	const resolved = deps.mapRegistryProviders({
		registry: loadOpenClawPlugins(loadOptions),
		onlyPluginIds: params.onlyPluginIds
	});
	memoizeSnapshot(resolved);
	return resolved;
}
function resolveRuntimeWebProviders(params, deps) {
	const runtimeRegistry = resolveRuntimePluginRegistry(params.config === void 0 ? void 0 : resolveWebProviderLoadOptions(params, deps));
	if (runtimeRegistry) return deps.mapRegistryProviders({
		registry: runtimeRegistry,
		onlyPluginIds: params.onlyPluginIds
	});
	return resolvePluginWebProviders(params, deps);
}
//#endregion
export { resolvePluginWebProviders as n, resolveRuntimeWebProviders as r, createWebProviderSnapshotCache as t };
