import { s as normalizeOptionalString } from "./string-coerce-BUSzWgUA.js";
import { a as normalizePluginIdScope, r as hasExplicitPluginIdScope } from "./channel-configured-BTEJAT4e.js";
import { r as withActivatedPluginIds } from "./activation-context-elA3ysm4.js";
import { a as resolveRuntimePluginRegistry, i as resolveCompatibleRuntimePluginRegistry, r as loadOpenClawPlugins, t as isPluginRegistryLoadInFlight } from "./loader-DYW2PvbF.js";
import { o as getActivePluginRegistryWorkspaceDir } from "./runtime-BB1a2aCy.js";
import { n as buildPluginRuntimeLoadOptionsFromValues, r as createPluginRuntimeLoaderLogger } from "./load-context-HY3FwKJn.js";
import { a as mapRegistryProviders, i as buildWebProviderSnapshotCacheKey, n as sortWebSearchProviders, s as resolveManifestDeclaredWebProviderCandidatePluginIds, t as resolveBundledWebSearchResolutionConfig } from "./web-search-providers.shared-BiBdRUdb.js";
//#region src/plugins/cache-controls.ts
const DEFAULT_PLUGIN_DISCOVERY_CACHE_MS = 1e3;
const DEFAULT_PLUGIN_MANIFEST_CACHE_MS = 1e3;
function shouldUsePluginSnapshotCache(env) {
	if (normalizeOptionalString(env.OPENCLAW_DISABLE_PLUGIN_DISCOVERY_CACHE)) return false;
	if (normalizeOptionalString(env.OPENCLAW_DISABLE_PLUGIN_MANIFEST_CACHE)) return false;
	if (normalizeOptionalString(env.OPENCLAW_PLUGIN_DISCOVERY_CACHE_MS) === "0") return false;
	if (normalizeOptionalString(env.OPENCLAW_PLUGIN_MANIFEST_CACHE_MS) === "0") return false;
	return true;
}
function resolvePluginCacheMs(rawValue, defaultMs) {
	const raw = normalizeOptionalString(rawValue);
	if (raw === "" || raw === "0") return 0;
	if (!raw) return defaultMs;
	const parsed = Number.parseInt(raw, 10);
	if (!Number.isFinite(parsed)) return defaultMs;
	return Math.max(0, parsed);
}
function resolvePluginSnapshotCacheTtlMs(env) {
	const discoveryCacheMs = resolvePluginCacheMs(env.OPENCLAW_PLUGIN_DISCOVERY_CACHE_MS, DEFAULT_PLUGIN_DISCOVERY_CACHE_MS);
	const manifestCacheMs = resolvePluginCacheMs(env.OPENCLAW_PLUGIN_MANIFEST_CACHE_MS, DEFAULT_PLUGIN_MANIFEST_CACHE_MS);
	return Math.min(discoveryCacheMs, manifestCacheMs);
}
function buildPluginSnapshotCacheEnvKey(env) {
	return JSON.stringify({
		OPENCLAW_BUNDLED_PLUGINS_DIR: env.OPENCLAW_BUNDLED_PLUGINS_DIR ?? "",
		OPENCLAW_DISABLE_PLUGIN_DISCOVERY_CACHE: env.OPENCLAW_DISABLE_PLUGIN_DISCOVERY_CACHE ?? "",
		OPENCLAW_DISABLE_PLUGIN_MANIFEST_CACHE: env.OPENCLAW_DISABLE_PLUGIN_MANIFEST_CACHE ?? "",
		OPENCLAW_PLUGIN_DISCOVERY_CACHE_MS: env.OPENCLAW_PLUGIN_DISCOVERY_CACHE_MS ?? "",
		OPENCLAW_PLUGIN_MANIFEST_CACHE_MS: env.OPENCLAW_PLUGIN_MANIFEST_CACHE_MS ?? "",
		OPENCLAW_HOME: env.OPENCLAW_HOME ?? "",
		OPENCLAW_STATE_DIR: env.OPENCLAW_STATE_DIR ?? "",
		OPENCLAW_CONFIG_PATH: env.OPENCLAW_CONFIG_PATH ?? "",
		HOME: env.HOME ?? "",
		USERPROFILE: env.USERPROFILE ?? "",
		VITEST: env.VITEST ?? ""
	});
}
//#endregion
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
//#region src/plugins/web-search-providers.runtime.ts
let webSearchProviderSnapshotCache = createWebProviderSnapshotCache();
function resolveWebSearchCandidatePluginIds(params) {
	return resolveManifestDeclaredWebProviderCandidatePluginIds({
		contract: "webSearchProviders",
		configKey: "webSearch",
		config: params.config,
		workspaceDir: params.workspaceDir,
		env: params.env,
		onlyPluginIds: params.onlyPluginIds,
		origin: params.origin
	});
}
function mapRegistryWebSearchProviders(params) {
	return mapRegistryProviders({
		entries: params.registry.webSearchProviders,
		onlyPluginIds: params.onlyPluginIds,
		sortProviders: sortWebSearchProviders
	});
}
function resolvePluginWebSearchProviders(params) {
	return resolvePluginWebProviders(params, {
		snapshotCache: webSearchProviderSnapshotCache,
		resolveBundledResolutionConfig: resolveBundledWebSearchResolutionConfig,
		resolveCandidatePluginIds: resolveWebSearchCandidatePluginIds,
		mapRegistryProviders: mapRegistryWebSearchProviders
	});
}
function resolveRuntimeWebSearchProviders(params) {
	return resolveRuntimeWebProviders(params, {
		snapshotCache: webSearchProviderSnapshotCache,
		resolveBundledResolutionConfig: resolveBundledWebSearchResolutionConfig,
		resolveCandidatePluginIds: resolveWebSearchCandidatePluginIds,
		mapRegistryProviders: mapRegistryWebSearchProviders
	});
}
//#endregion
export { resolvePluginWebProviders as i, resolveRuntimeWebSearchProviders as n, createWebProviderSnapshotCache as r, resolvePluginWebSearchProviders as t };
