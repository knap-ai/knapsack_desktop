//#region src/plugins/registry-empty.ts
function createEmptyPluginRegistry() {
	return {
		plugins: [],
		tools: [],
		hooks: [],
		typedHooks: [],
		channels: [],
		channelSetups: [],
		providers: [],
		cliBackends: [],
		speechProviders: [],
		mediaUnderstandingProviders: [],
		imageGenerationProviders: [],
		webFetchProviders: [],
		webSearchProviders: [],
		gatewayHandlers: {},
		gatewayMethodScopes: {},
		httpRoutes: [],
		cliRegistrars: [],
		services: [],
		commands: [],
		conversationBindingResolvedHandlers: [],
		diagnostics: []
	};
}
//#endregion
//#region src/plugins/runtime.ts
const REGISTRY_STATE = Symbol.for("openclaw.pluginRegistryState");
const state = (() => {
	const globalState = globalThis;
	if (!globalState[REGISTRY_STATE]) globalState[REGISTRY_STATE] = {
		activeRegistry: null,
		activeVersion: 0,
		httpRoute: {
			registry: null,
			pinned: false,
			version: 0
		},
		channel: {
			registry: null,
			pinned: false,
			version: 0
		},
		key: null,
		runtimeSubagentMode: "default",
		importedPluginIds: /* @__PURE__ */ new Set()
	};
	return globalState[REGISTRY_STATE];
})();
function recordImportedPluginId(pluginId) {
	state.importedPluginIds.add(pluginId);
}
function installSurfaceRegistry(surface, registry, pinned) {
	if (surface.registry === registry && surface.pinned === pinned) return;
	surface.registry = registry;
	surface.pinned = pinned;
	surface.version += 1;
}
function syncTrackedSurface(surface, registry, refreshVersion = false) {
	if (surface.pinned) return;
	if (surface.registry === registry && !surface.pinned) {
		if (refreshVersion) surface.version += 1;
		return;
	}
	installSurfaceRegistry(surface, registry, false);
}
function setActivePluginRegistry(registry, cacheKey, runtimeSubagentMode = "default") {
	state.activeRegistry = registry;
	state.activeVersion += 1;
	syncTrackedSurface(state.httpRoute, registry, true);
	syncTrackedSurface(state.channel, registry, true);
	state.key = cacheKey ?? null;
	state.runtimeSubagentMode = runtimeSubagentMode;
}
function getActivePluginRegistry() {
	return state.activeRegistry;
}
function requireActivePluginRegistry() {
	if (!state.activeRegistry) {
		state.activeRegistry = createEmptyPluginRegistry();
		state.activeVersion += 1;
		syncTrackedSurface(state.httpRoute, state.activeRegistry);
		syncTrackedSurface(state.channel, state.activeRegistry);
	}
	return state.activeRegistry;
}
function pinActivePluginHttpRouteRegistry(registry) {
	installSurfaceRegistry(state.httpRoute, registry, true);
}
function releasePinnedPluginHttpRouteRegistry(registry) {
	if (registry && state.httpRoute.registry !== registry) return;
	installSurfaceRegistry(state.httpRoute, state.activeRegistry, false);
}
function getActivePluginHttpRouteRegistry() {
	return state.httpRoute.registry ?? state.activeRegistry;
}
function requireActivePluginHttpRouteRegistry() {
	const existing = getActivePluginHttpRouteRegistry();
	if (existing) return existing;
	const created = requireActivePluginRegistry();
	installSurfaceRegistry(state.httpRoute, created, false);
	return created;
}
function resolveActivePluginHttpRouteRegistry(fallback) {
	const routeRegistry = getActivePluginHttpRouteRegistry();
	if (!routeRegistry) return fallback;
	const routeCount = routeRegistry.httpRoutes?.length ?? 0;
	const fallbackRouteCount = fallback.httpRoutes?.length ?? 0;
	if (routeCount === 0 && fallbackRouteCount > 0) return fallback;
	return routeRegistry;
}
/** Pin the channel registry so that subsequent `setActivePluginRegistry` calls
*  do not replace the channel snapshot used by `getChannelPlugin`. Call at
*  gateway startup after the initial plugin load so that config-schema reads
*  and other non-primary registry loads cannot evict channel plugins. */
function pinActivePluginChannelRegistry(registry) {
	installSurfaceRegistry(state.channel, registry, true);
}
function releasePinnedPluginChannelRegistry(registry) {
	if (registry && state.channel.registry !== registry) return;
	installSurfaceRegistry(state.channel, state.activeRegistry, false);
}
/** Return the registry that should be used for channel plugin resolution.
*  When pinned, this returns the startup registry regardless of subsequent
*  `setActivePluginRegistry` calls. */
function getActivePluginChannelRegistry() {
	return state.channel.registry ?? state.activeRegistry;
}
function getActivePluginChannelRegistryVersion() {
	return state.channel.registry ? state.channel.version : state.activeVersion;
}
function requireActivePluginChannelRegistry() {
	const existing = getActivePluginChannelRegistry();
	if (existing) return existing;
	const created = requireActivePluginRegistry();
	installSurfaceRegistry(state.channel, created, false);
	return created;
}
function getActivePluginRegistryKey() {
	return state.key;
}
function getActivePluginRuntimeSubagentMode() {
	return state.runtimeSubagentMode;
}
function getActivePluginRegistryVersion() {
	return state.activeVersion;
}
function collectLoadedPluginIds(registry, ids) {
	if (!registry) return;
	for (const plugin of registry.plugins) if (plugin.status === "loaded" && plugin.format !== "bundle") ids.add(plugin.id);
}
/**
* Returns plugin ids that were imported by plugin runtime or registry loading in
* the current process.
*
* This is a process-level view, not a fresh import trace: cached registry reuse
* still counts because the plugin code was loaded earlier in this process.
* Explicit loader import tracking covers plugins that were imported but later
* ended in an error state during registration.
* Bundle-format plugins are excluded because they can be "loaded" from metadata
* without importing any JS entrypoint.
*/
function listImportedRuntimePluginIds() {
	const imported = new Set(state.importedPluginIds);
	collectLoadedPluginIds(state.activeRegistry, imported);
	collectLoadedPluginIds(state.channel.registry, imported);
	collectLoadedPluginIds(state.httpRoute.registry, imported);
	return [...imported].toSorted((left, right) => left.localeCompare(right));
}
function resetPluginRuntimeStateForTest() {
	state.activeRegistry = null;
	state.activeVersion += 1;
	installSurfaceRegistry(state.httpRoute, null, false);
	installSurfaceRegistry(state.channel, null, false);
	state.key = null;
	state.runtimeSubagentMode = "default";
	state.importedPluginIds.clear();
}
//#endregion
export { resolveActivePluginHttpRouteRegistry as _, getActivePluginRegistryVersion as a, pinActivePluginChannelRegistry as c, releasePinnedPluginChannelRegistry as d, releasePinnedPluginHttpRouteRegistry as f, resetPluginRuntimeStateForTest as g, requireActivePluginRegistry as h, getActivePluginRegistryKey as i, pinActivePluginHttpRouteRegistry as l, requireActivePluginHttpRouteRegistry as m, getActivePluginChannelRegistryVersion as n, getActivePluginRuntimeSubagentMode as o, requireActivePluginChannelRegistry as p, getActivePluginRegistry as r, listImportedRuntimePluginIds as s, getActivePluginChannelRegistry as t, recordImportedPluginId as u, setActivePluginRegistry as v, createEmptyPluginRegistry as y };
