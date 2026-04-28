import { r as normalizeProviderId } from "./provider-id-DRW5WMbW.js";
import { t as loadPluginManifestRegistryForInstalledIndex } from "./manifest-registry-installed-B7YTYcgb.js";
import { v as loadPluginRegistrySnapshot } from "./plugin-registry-CZ8QXP5l.js";
import { t as resolveAgentModelFallbackValues } from "./model-input-Bac2nsYA.js";
import { t as getActiveRuntimePluginRegistry } from "./active-runtime-registry-C8lFqbl_.js";
import { a as getModelRefStatusWithFallbackModels, i as buildModelAliasIndex, l as resolveAllowedModelRefFromAliasIndex } from "./model-selection-shared-VQV3de71.js";
import { createRequire } from "node:module";
//#region src/agents/model-selection-resolve.ts
function resolveDefaultFallbackModels(cfg) {
	return resolveAgentModelFallbackValues(cfg.agents?.defaults?.model);
}
function getModelRefStatus(params) {
	const { cfg, catalog, ref, defaultProvider, defaultModel } = params;
	return getModelRefStatusWithFallbackModels({
		cfg,
		catalog,
		ref,
		defaultProvider,
		defaultModel,
		fallbackModels: resolveDefaultFallbackModels(cfg)
	});
}
function resolveAllowedModelRef(params) {
	const aliasIndex = buildModelAliasIndex({
		cfg: params.cfg,
		defaultProvider: params.defaultProvider
	});
	return resolveAllowedModelRefFromAliasIndex({
		cfg: params.cfg,
		raw: params.raw,
		defaultProvider: params.defaultProvider,
		aliasIndex,
		getStatus: (ref) => getModelRefStatus({
			cfg: params.cfg,
			catalog: params.catalog,
			ref,
			defaultProvider: params.defaultProvider,
			defaultModel: params.defaultModel
		})
	});
}
//#endregion
//#region src/plugins/cli-backends.runtime.ts
function resolveRuntimeCliBackends() {
	return (getActiveRuntimePluginRegistry()?.cliBackends ?? []).map((entry) => Object.assign({}, entry.backend, { pluginId: entry.pluginId }));
}
//#endregion
//#region src/plugins/setup-registry.runtime.ts
const require = createRequire(import.meta.url);
const SETUP_REGISTRY_RUNTIME_CANDIDATES = ["./setup-registry.js", "./setup-registry.ts"];
let setupRegistryRuntimeModule;
let bundledSetupCliBackendsCache;
function resolveBundledSetupCliBackends() {
	if (bundledSetupCliBackendsCache) return bundledSetupCliBackendsCache;
	bundledSetupCliBackendsCache = loadPluginManifestRegistryForInstalledIndex({ index: loadPluginRegistrySnapshot({ cache: true }) }).plugins.flatMap((plugin) => {
		if (plugin.origin !== "bundled") return [];
		return [...plugin.cliBackends, ...plugin.setup?.cliBackends ?? []].map((backendId) => ({
			pluginId: plugin.id,
			backend: { id: backendId }
		}));
	});
	return bundledSetupCliBackendsCache;
}
function loadSetupRegistryRuntime() {
	if (setupRegistryRuntimeModule !== void 0) return setupRegistryRuntimeModule;
	for (const candidate of SETUP_REGISTRY_RUNTIME_CANDIDATES) try {
		setupRegistryRuntimeModule = require(candidate);
		return setupRegistryRuntimeModule;
	} catch {}
	return null;
}
function resolvePluginSetupCliBackendRuntime(params) {
	const normalized = normalizeProviderId(params.backend);
	const runtime = loadSetupRegistryRuntime();
	if (runtime !== null) return runtime.resolvePluginSetupCliBackend(params);
	return resolveBundledSetupCliBackends().find((entry) => normalizeProviderId(entry.backend.id) === normalized);
}
//#endregion
//#region src/agents/model-selection-cli.ts
function isCliProvider(provider, cfg) {
	const normalized = normalizeProviderId(provider);
	const backends = cfg?.agents?.defaults?.cliBackends ?? {};
	if (Object.keys(backends).some((key) => normalizeProviderId(key) === normalized)) return true;
	if (resolveRuntimeCliBackends().some((backend) => normalizeProviderId(backend.id) === normalized)) return true;
	if (resolvePluginSetupCliBackendRuntime({ backend: normalized })) return true;
	return false;
}
//#endregion
export { resolveAllowedModelRef as i, resolveRuntimeCliBackends as n, getModelRefStatus as r, isCliProvider as t };
