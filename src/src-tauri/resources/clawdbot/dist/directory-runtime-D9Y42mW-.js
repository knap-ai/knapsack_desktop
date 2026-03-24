//#region src/channels/plugins/directory-adapters.ts
const nullChannelDirectorySelf = async () => null;
const emptyChannelDirectoryList = async () => [];
/** Build a channel directory adapter with a null self resolver by default. */
function createChannelDirectoryAdapter(params = {}) {
	return {
		self: params.self ?? nullChannelDirectorySelf,
		...params
	};
}
/** Build the common empty directory surface for channels without directory support. */
function createEmptyChannelDirectoryAdapter() {
	return createChannelDirectoryAdapter({
		listPeers: emptyChannelDirectoryList,
		listGroups: emptyChannelDirectoryList
	});
}
//#endregion
//#region src/channels/plugins/directory-config-helpers.ts
function resolveDirectoryQuery(query) {
	return query?.trim().toLowerCase() || "";
}
function resolveDirectoryLimit(limit) {
	return typeof limit === "number" && limit > 0 ? limit : void 0;
}
function applyDirectoryQueryAndLimit(ids, params) {
	const q = resolveDirectoryQuery(params.query);
	const limit = resolveDirectoryLimit(params.limit);
	const filtered = ids.filter((id) => q ? id.toLowerCase().includes(q) : true);
	return typeof limit === "number" ? filtered.slice(0, limit) : filtered;
}
function toDirectoryEntries(kind, ids) {
	return ids.map((id) => ({
		kind,
		id
	}));
}
function normalizeDirectoryIds(params) {
	return params.rawIds.map((entry) => entry.trim()).filter((entry) => Boolean(entry) && entry !== "*").map((entry) => {
		const normalized = params.normalizeId ? params.normalizeId(entry) : entry;
		return typeof normalized === "string" ? normalized.trim() : "";
	}).filter(Boolean);
}
function collectDirectoryIdsFromEntries(params) {
	return normalizeDirectoryIds({
		rawIds: (params.entries ?? []).map((entry) => String(entry)),
		normalizeId: params.normalizeId
	});
}
function collectDirectoryIdsFromMapKeys(params) {
	return normalizeDirectoryIds({
		rawIds: Object.keys(params.groups ?? {}),
		normalizeId: params.normalizeId
	});
}
function dedupeDirectoryIds(ids) {
	return Array.from(new Set(ids));
}
function collectNormalizedDirectoryIds(params) {
	const ids = /* @__PURE__ */ new Set();
	for (const source of params.sources) for (const value of source) {
		const raw = String(value).trim();
		if (!raw || raw === "*") continue;
		const normalized = params.normalizeId(raw);
		const trimmed = typeof normalized === "string" ? normalized.trim() : "";
		if (trimmed) ids.add(trimmed);
	}
	return Array.from(ids);
}
function listDirectoryEntriesFromSources(params) {
	const ids = collectNormalizedDirectoryIds({
		sources: params.sources,
		normalizeId: params.normalizeId
	});
	return toDirectoryEntries(params.kind, applyDirectoryQueryAndLimit(ids, params));
}
function listInspectedDirectoryEntriesFromSources(params) {
	const account = params.inspectAccount(params.cfg, params.accountId);
	if (!account) return [];
	return listDirectoryEntriesFromSources({
		kind: params.kind,
		sources: params.resolveSources(account),
		query: params.query,
		limit: params.limit,
		normalizeId: params.normalizeId
	});
}
function listResolvedDirectoryEntriesFromSources(params) {
	const account = params.resolveAccount(params.cfg, params.accountId);
	return listDirectoryEntriesFromSources({
		kind: params.kind,
		sources: params.resolveSources(account),
		query: params.query,
		limit: params.limit,
		normalizeId: params.normalizeId
	});
}
function listDirectoryUserEntriesFromAllowFrom(params) {
	return toDirectoryEntries("user", applyDirectoryQueryAndLimit(dedupeDirectoryIds(collectDirectoryIdsFromEntries({
		entries: params.allowFrom,
		normalizeId: params.normalizeId
	})), params));
}
function listDirectoryUserEntriesFromAllowFromAndMapKeys(params) {
	return toDirectoryEntries("user", applyDirectoryQueryAndLimit(dedupeDirectoryIds([...collectDirectoryIdsFromEntries({
		entries: params.allowFrom,
		normalizeId: params.normalizeAllowFromId
	}), ...collectDirectoryIdsFromMapKeys({
		groups: params.map,
		normalizeId: params.normalizeMapKeyId
	})]), params));
}
function listDirectoryGroupEntriesFromMapKeys(params) {
	return toDirectoryEntries("group", applyDirectoryQueryAndLimit(dedupeDirectoryIds(collectDirectoryIdsFromMapKeys({
		groups: params.groups,
		normalizeId: params.normalizeId
	})), params));
}
function listDirectoryGroupEntriesFromMapKeysAndAllowFrom(params) {
	return toDirectoryEntries("group", applyDirectoryQueryAndLimit(dedupeDirectoryIds([...collectDirectoryIdsFromMapKeys({
		groups: params.groups,
		normalizeId: params.normalizeMapKeyId
	}), ...collectDirectoryIdsFromEntries({
		entries: params.allowFrom,
		normalizeId: params.normalizeAllowFromId
	})]), params));
}
function listResolvedDirectoryUserEntriesFromAllowFrom(params) {
	const account = params.resolveAccount(params.cfg, params.accountId);
	return listDirectoryUserEntriesFromAllowFrom({
		allowFrom: params.resolveAllowFrom(account),
		query: params.query,
		limit: params.limit,
		normalizeId: params.normalizeId
	});
}
function listResolvedDirectoryGroupEntriesFromMapKeys(params) {
	const account = params.resolveAccount(params.cfg, params.accountId);
	return listDirectoryGroupEntriesFromMapKeys({
		groups: params.resolveGroups(account),
		query: params.query,
		limit: params.limit,
		normalizeId: params.normalizeId
	});
}
//#endregion
export { listDirectoryGroupEntriesFromMapKeysAndAllowFrom as a, listInspectedDirectoryEntriesFromSources as c, listResolvedDirectoryUserEntriesFromAllowFrom as d, toDirectoryEntries as f, nullChannelDirectorySelf as g, emptyChannelDirectoryList as h, listDirectoryGroupEntriesFromMapKeys as i, listResolvedDirectoryEntriesFromSources as l, createEmptyChannelDirectoryAdapter as m, collectNormalizedDirectoryIds as n, listDirectoryUserEntriesFromAllowFrom as o, createChannelDirectoryAdapter as p, listDirectoryEntriesFromSources as r, listDirectoryUserEntriesFromAllowFromAndMapKeys as s, applyDirectoryQueryAndLimit as t, listResolvedDirectoryGroupEntriesFromMapKeys as u };
