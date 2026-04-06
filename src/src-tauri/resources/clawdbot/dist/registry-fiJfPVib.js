import { n as getActivePluginChannelRegistryVersion, p as requireActivePluginChannelRegistry } from "./runtime-DZz1f0_h.js";
import { a as CHAT_CHANNEL_ORDER } from "./chat-meta-Cdrnv7R-.js";
import { a as normalizeAnyChannelId } from "./registry-DTO_OK4F.js";
//#region src/channels/plugins/registry.ts
function dedupeChannels(channels) {
	const seen = /* @__PURE__ */ new Set();
	const resolved = [];
	for (const plugin of channels) {
		const id = String(plugin.id).trim();
		if (!id || seen.has(id)) continue;
		seen.add(id);
		resolved.push(plugin);
	}
	return resolved;
}
let cachedChannelPlugins = {
	registryVersion: -1,
	sorted: [],
	byId: /* @__PURE__ */ new Map()
};
function resolveCachedChannelPlugins() {
	const registry = requireActivePluginChannelRegistry();
	const registryVersion = getActivePluginChannelRegistryVersion();
	const cached = cachedChannelPlugins;
	if (cached.registryVersion === registryVersion) return cached;
	const channelPlugins = [];
	if (Array.isArray(registry.channels)) {
		for (const entry of registry.channels) if (entry?.plugin) channelPlugins.push(entry.plugin);
	}
	const sorted = dedupeChannels(channelPlugins).toSorted((a, b) => {
		const indexA = CHAT_CHANNEL_ORDER.indexOf(a.id);
		const indexB = CHAT_CHANNEL_ORDER.indexOf(b.id);
		const orderA = a.meta.order ?? (indexA === -1 ? 999 : indexA);
		const orderB = b.meta.order ?? (indexB === -1 ? 999 : indexB);
		if (orderA !== orderB) return orderA - orderB;
		return a.id.localeCompare(b.id);
	});
	const byId = /* @__PURE__ */ new Map();
	for (const plugin of sorted) byId.set(plugin.id, plugin);
	const next = {
		registryVersion,
		sorted,
		byId
	};
	cachedChannelPlugins = next;
	return next;
}
function listChannelPlugins() {
	return resolveCachedChannelPlugins().sorted.slice();
}
function getChannelPlugin(id) {
	const resolvedId = String(id).trim();
	if (!resolvedId) return;
	return resolveCachedChannelPlugins().byId.get(resolvedId);
}
function normalizeChannelId(raw) {
	return normalizeAnyChannelId(raw);
}
//#endregion
export { listChannelPlugins as n, normalizeChannelId as r, getChannelPlugin as t };
