import { o as normalizeAnyChannelId, u as CHAT_CHANNEL_ORDER } from "./registry-C5UkPpaO.js";
import { r as getActivePluginRegistryVersion, s as requireActivePluginRegistry } from "./runtime-Iz8uZ7EU.js";
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
	const registry = requireActivePluginRegistry();
	const registryVersion = getActivePluginRegistryVersion();
	const cached = cachedChannelPlugins;
	if (cached.registryVersion === registryVersion) return cached;
	const sorted = dedupeChannels(registry.channels.map((entry) => entry.plugin)).toSorted((a, b) => {
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
//#region src/channels/allowlist-match.ts
function formatAllowlistMatchMeta(match) {
	return `matchKey=${match?.matchKey ?? "none"} matchSource=${match?.matchSource ?? "none"}`;
}
function compileAllowlist(entries) {
	const set = new Set(entries.filter(Boolean));
	return {
		set,
		wildcard: set.has("*")
	};
}
function compileSimpleAllowlist(entries) {
	return compileAllowlist(entries.map((entry) => String(entry).trim().toLowerCase()).filter(Boolean));
}
function resolveAllowlistCandidates(params) {
	for (const candidate of params.candidates) {
		if (!candidate.value) continue;
		if (params.compiledAllowlist.set.has(candidate.value)) return {
			allowed: true,
			matchKey: candidate.value,
			matchSource: candidate.source
		};
	}
	return { allowed: false };
}
function resolveCompiledAllowlistMatch(params) {
	if (params.compiledAllowlist.set.size === 0) return { allowed: false };
	if (params.compiledAllowlist.wildcard) return {
		allowed: true,
		matchKey: "*",
		matchSource: "wildcard"
	};
	return resolveAllowlistCandidates(params);
}
function resolveAllowlistMatchByCandidates(params) {
	return resolveCompiledAllowlistMatch({
		compiledAllowlist: compileAllowlist(params.allowList),
		candidates: params.candidates
	});
}
function resolveAllowlistMatchSimple(params) {
	const allowFrom = compileSimpleAllowlist(params.allowFrom);
	if (allowFrom.set.size === 0) return { allowed: false };
	if (allowFrom.wildcard) return {
		allowed: true,
		matchKey: "*",
		matchSource: "wildcard"
	};
	const senderId = params.senderId.toLowerCase();
	const senderName = params.senderName?.toLowerCase();
	return resolveAllowlistCandidates({
		compiledAllowlist: allowFrom,
		candidates: [{
			value: senderId,
			source: "id"
		}, ...params.allowNameMatching === true && senderName ? [{
			value: senderName,
			source: "name"
		}] : []]
	});
}
//#endregion
export { resolveAllowlistMatchSimple as a, listChannelPlugins as c, resolveAllowlistMatchByCandidates as i, normalizeChannelId as l, formatAllowlistMatchMeta as n, resolveCompiledAllowlistMatch as o, resolveAllowlistCandidates as r, getChannelPlugin as s, compileAllowlist as t };
