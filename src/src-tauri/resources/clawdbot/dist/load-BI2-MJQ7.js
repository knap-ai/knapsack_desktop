import { t as getActivePluginChannelRegistry } from "./runtime-BB1a2aCy.js";
//#region src/channels/plugins/registry-loader.ts
function createChannelRegistryLoader(resolveValue) {
	const cache = /* @__PURE__ */ new Map();
	let lastRegistry = null;
	return async (id) => {
		const registry = getActivePluginChannelRegistry();
		if (registry !== lastRegistry) {
			cache.clear();
			lastRegistry = registry;
		}
		const cached = cache.get(id);
		if (cached) return cached;
		const pluginEntry = registry?.channels.find((entry) => entry.plugin.id === id);
		if (!pluginEntry) return;
		const resolved = resolveValue(pluginEntry);
		if (resolved) cache.set(id, resolved);
		return resolved;
	};
}
//#endregion
//#region src/channels/plugins/outbound/load.ts
const loadOutboundAdapterFromRegistry = createChannelRegistryLoader((entry) => entry.plugin.outbound);
async function loadChannelOutboundAdapter(id) {
	return loadOutboundAdapterFromRegistry(id);
}
//#endregion
export { loadChannelOutboundAdapter as t };
