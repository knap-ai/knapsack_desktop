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
		speechProviders: [],
		mediaUnderstandingProviders: [],
		imageGenerationProviders: [],
		webSearchProviders: [],
		gatewayHandlers: {},
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
		registry: createEmptyPluginRegistry(),
		httpRouteRegistry: null,
		httpRouteRegistryPinned: false,
		key: null,
		version: 0
	};
	return globalState[REGISTRY_STATE];
})();
function setActivePluginRegistry(registry, cacheKey) {
	state.registry = registry;
	if (!state.httpRouteRegistryPinned) state.httpRouteRegistry = registry;
	state.key = cacheKey ?? null;
	state.version += 1;
}
function getActivePluginRegistry() {
	return state.registry;
}
function requireActivePluginRegistry() {
	if (!state.registry) {
		state.registry = createEmptyPluginRegistry();
		if (!state.httpRouteRegistryPinned) state.httpRouteRegistry = state.registry;
		state.version += 1;
	}
	return state.registry;
}
function pinActivePluginHttpRouteRegistry(registry) {
	state.httpRouteRegistry = registry;
	state.httpRouteRegistryPinned = true;
}
function releasePinnedPluginHttpRouteRegistry(registry) {
	if (registry && state.httpRouteRegistry !== registry) return;
	state.httpRouteRegistryPinned = false;
	state.httpRouteRegistry = state.registry;
}
function getActivePluginHttpRouteRegistry() {
	return state.httpRouteRegistry ?? state.registry;
}
function requireActivePluginHttpRouteRegistry() {
	const existing = getActivePluginHttpRouteRegistry();
	if (existing) return existing;
	const created = requireActivePluginRegistry();
	state.httpRouteRegistry = created;
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
function getActivePluginRegistryKey() {
	return state.key;
}
function getActivePluginRegistryVersion() {
	return state.version;
}
//#endregion
export { releasePinnedPluginHttpRouteRegistry as a, resolveActivePluginHttpRouteRegistry as c, pinActivePluginHttpRouteRegistry as i, setActivePluginRegistry as l, getActivePluginRegistryKey as n, requireActivePluginHttpRouteRegistry as o, getActivePluginRegistryVersion as r, requireActivePluginRegistry as s, getActivePluginRegistry as t, createEmptyPluginRegistry as u };
