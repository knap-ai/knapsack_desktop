import { A as normalizeMatrixMessagingTarget, J as MatrixAuthedHttpClient, U as resolveMatrixAuth, k as isMatrixQualifiedUserId } from "./send-C-3t8GKS.js";
//#region extensions/matrix/src/directory-live.ts
const MATRIX_DIRECTORY_TIMEOUT_MS = 1e4;
function normalizeQuery(value) {
	return value?.trim() ?? "";
}
function resolveMatrixDirectoryLimit(limit) {
	return typeof limit === "number" && Number.isFinite(limit) && limit > 0 ? Math.max(1, Math.floor(limit)) : 20;
}
function createMatrixDirectoryClient(auth) {
	return new MatrixAuthedHttpClient(auth.homeserver, auth.accessToken, auth.ssrfPolicy);
}
async function resolveMatrixDirectoryContext(params) {
	const query = normalizeQuery(params.query);
	if (!query) return null;
	const auth = await resolveMatrixAuth({
		cfg: params.cfg,
		accountId: params.accountId
	});
	return {
		auth,
		client: createMatrixDirectoryClient(auth),
		query,
		queryLower: query.toLowerCase()
	};
}
function createGroupDirectoryEntry(params) {
	return {
		kind: "group",
		id: params.id,
		name: params.name,
		handle: params.handle
	};
}
async function requestMatrixJson(client, params) {
	return await client.requestJson({
		method: params.method,
		endpoint: params.endpoint,
		body: params.body,
		timeoutMs: MATRIX_DIRECTORY_TIMEOUT_MS
	});
}
async function listMatrixDirectoryPeersLive(params) {
	const context = await resolveMatrixDirectoryContext(params);
	if (!context) return [];
	const directUserId = normalizeMatrixMessagingTarget(context.query);
	if (directUserId && isMatrixQualifiedUserId(directUserId)) return [{
		kind: "user",
		id: directUserId
	}];
	return ((await requestMatrixJson(context.client, {
		method: "POST",
		endpoint: "/_matrix/client/v3/user_directory/search",
		body: {
			search_term: context.query,
			limit: resolveMatrixDirectoryLimit(params.limit)
		}
	})).results ?? []).map((entry) => {
		const userId = entry.user_id?.trim();
		if (!userId) return null;
		return {
			kind: "user",
			id: userId,
			name: entry.display_name?.trim() || void 0,
			handle: entry.display_name ? `@${entry.display_name.trim()}` : void 0,
			raw: entry
		};
	}).filter(Boolean);
}
async function resolveMatrixRoomAlias(client, alias) {
	try {
		return (await requestMatrixJson(client, {
			method: "GET",
			endpoint: `/_matrix/client/v3/directory/room/${encodeURIComponent(alias)}`
		})).room_id?.trim() || null;
	} catch {
		return null;
	}
}
async function fetchMatrixRoomName(client, roomId) {
	try {
		return (await requestMatrixJson(client, {
			method: "GET",
			endpoint: `/_matrix/client/v3/rooms/${encodeURIComponent(roomId)}/state/m.room.name`
		})).name?.trim() || null;
	} catch {
		return null;
	}
}
async function listMatrixDirectoryGroupsLive(params) {
	const context = await resolveMatrixDirectoryContext(params);
	if (!context) return [];
	const { client, query, queryLower } = context;
	const limit = resolveMatrixDirectoryLimit(params.limit);
	const directTarget = normalizeMatrixMessagingTarget(query);
	if (directTarget?.startsWith("!")) return [createGroupDirectoryEntry({
		id: directTarget,
		name: directTarget
	})];
	if (directTarget?.startsWith("#")) {
		const roomId = await resolveMatrixRoomAlias(client, directTarget);
		if (!roomId) return [];
		return [createGroupDirectoryEntry({
			id: roomId,
			name: directTarget,
			handle: directTarget
		})];
	}
	const rooms = ((await requestMatrixJson(client, {
		method: "GET",
		endpoint: "/_matrix/client/v3/joined_rooms"
	})).joined_rooms ?? []).map((roomId) => roomId.trim()).filter(Boolean);
	const results = [];
	for (const roomId of rooms) {
		const name = await fetchMatrixRoomName(client, roomId);
		if (!name || !name.toLowerCase().includes(queryLower)) continue;
		results.push({
			kind: "group",
			id: roomId,
			name,
			handle: `#${name}`
		});
		if (results.length >= limit) break;
	}
	return results;
}
//#endregion
//#region extensions/matrix/src/resolve-targets.ts
function normalizeLookupQuery(query) {
	return query.trim().toLowerCase();
}
function findExactDirectoryMatches(matches, query) {
	const normalized = normalizeLookupQuery(query);
	if (!normalized) return [];
	return matches.filter((match) => {
		const id = match.id.trim().toLowerCase();
		const name = match.name?.trim().toLowerCase();
		const handle = match.handle?.trim().toLowerCase();
		return normalized === id || normalized === name || normalized === handle;
	});
}
function pickBestGroupMatch(matches, query) {
	if (matches.length === 0) return {};
	const exact = findExactDirectoryMatches(matches, query);
	if (exact.length > 1) return {
		best: exact[0],
		note: "multiple exact matches; chose first"
	};
	if (exact.length === 1) return { best: exact[0] };
	return {
		best: matches[0],
		note: matches.length > 1 ? "multiple matches; chose first" : void 0
	};
}
function pickBestUserMatch(matches, query) {
	if (matches.length === 0) return;
	const exact = findExactDirectoryMatches(matches, query);
	if (exact.length === 1) return exact[0];
}
function describeUserMatchFailure(matches, query) {
	if (matches.length === 0) return "no matches";
	const normalized = normalizeLookupQuery(query);
	if (!normalized) return "empty input";
	const exact = findExactDirectoryMatches(matches, normalized);
	if (exact.length === 0) return "no exact match; use full Matrix ID";
	if (exact.length > 1) return "multiple exact matches; use full Matrix ID";
	return "no exact match; use full Matrix ID";
}
async function readCachedMatches(cache, query, lookup) {
	const key = normalizeLookupQuery(query);
	if (!key) return [];
	const cached = cache.get(key);
	if (cached) return cached;
	const matches = await lookup(query.trim());
	cache.set(key, matches);
	return matches;
}
async function resolveMatrixTargets(params) {
	const results = [];
	const userLookupCache = /* @__PURE__ */ new Map();
	const groupLookupCache = /* @__PURE__ */ new Map();
	for (const input of params.inputs) {
		const trimmed = input.trim();
		if (!trimmed) {
			results.push({
				input,
				resolved: false,
				note: "empty input"
			});
			continue;
		}
		if (params.kind === "user") {
			const normalizedTarget = normalizeMatrixMessagingTarget(trimmed);
			if (normalizedTarget && isMatrixQualifiedUserId(normalizedTarget)) {
				results.push({
					input,
					resolved: true,
					id: normalizedTarget
				});
				continue;
			}
			try {
				const matches = await readCachedMatches(userLookupCache, trimmed, (query) => listMatrixDirectoryPeersLive({
					cfg: params.cfg,
					accountId: params.accountId,
					query,
					limit: 5
				}));
				const best = pickBestUserMatch(matches, trimmed);
				results.push({
					input,
					resolved: Boolean(best?.id),
					id: best?.id,
					name: best?.name,
					note: best ? void 0 : describeUserMatchFailure(matches, trimmed)
				});
			} catch (err) {
				params.runtime?.error?.(`matrix resolve failed: ${String(err)}`);
				results.push({
					input,
					resolved: false,
					note: "lookup failed"
				});
			}
			continue;
		}
		const normalizedTarget = normalizeMatrixMessagingTarget(trimmed);
		if (normalizedTarget?.startsWith("!")) {
			results.push({
				input,
				resolved: true,
				id: normalizedTarget
			});
			continue;
		}
		try {
			const { best, note } = pickBestGroupMatch(await readCachedMatches(groupLookupCache, trimmed, (query) => listMatrixDirectoryGroupsLive({
				cfg: params.cfg,
				accountId: params.accountId,
				query,
				limit: 5
			})), trimmed);
			results.push({
				input,
				resolved: Boolean(best?.id),
				id: best?.id,
				name: best?.name,
				note
			});
		} catch (err) {
			params.runtime?.error?.(`matrix resolve failed: ${String(err)}`);
			results.push({
				input,
				resolved: false,
				note: "lookup failed"
			});
		}
	}
	return results;
}
//#endregion
export { listMatrixDirectoryGroupsLive as n, listMatrixDirectoryPeersLive as r, resolveMatrixTargets as t };
