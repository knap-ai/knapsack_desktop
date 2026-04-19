import { i as resolveMatrixAuth } from "./config-CjEkxZYF.js";
import { n as normalizeMatrixMessagingTarget, t as isMatrixQualifiedUserId } from "./target-ids-SzOps7vq.js";
import "./client-DqoFZ3x6.js";
import { t as MatrixAuthedHttpClient } from "./http-client-C8bX5g1T.js";
import { normalizeLowercaseStringOrEmpty, normalizeOptionalLowercaseString, normalizeOptionalString } from "openclaw/plugin-sdk/text-runtime";
//#region extensions/matrix/src/directory-live.ts
const MATRIX_DIRECTORY_TIMEOUT_MS = 1e4;
function resolveMatrixDirectoryLimit(limit) {
	return typeof limit === "number" && Number.isFinite(limit) && limit > 0 ? Math.max(1, Math.floor(limit)) : 20;
}
function createMatrixDirectoryClient(auth) {
	return new MatrixAuthedHttpClient({
		homeserver: auth.homeserver,
		accessToken: auth.accessToken,
		ssrfPolicy: auth.ssrfPolicy,
		dispatcherPolicy: auth.dispatcherPolicy
	});
}
async function resolveMatrixDirectoryContext(params) {
	const query = normalizeOptionalString(params.query) ?? "";
	if (!query) return null;
	const auth = await resolveMatrixAuth({
		cfg: params.cfg,
		accountId: params.accountId
	});
	return {
		auth,
		client: createMatrixDirectoryClient(auth),
		query,
		queryLower: normalizeLowercaseStringOrEmpty(query)
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
	const query = normalizeOptionalString(params.query) ?? "";
	if (!query) return [];
	const directUserId = normalizeMatrixMessagingTarget(query);
	if (directUserId && isMatrixQualifiedUserId(directUserId)) return [{
		kind: "user",
		id: directUserId
	}];
	const context = await resolveMatrixDirectoryContext({
		...params,
		query
	});
	if (!context) return [];
	return ((await requestMatrixJson(context.client, {
		method: "POST",
		endpoint: "/_matrix/client/v3/user_directory/search",
		body: {
			search_term: context.query,
			limit: resolveMatrixDirectoryLimit(params.limit)
		}
	})).results ?? []).map((entry) => {
		const userId = normalizeOptionalString(entry.user_id);
		if (!userId) return null;
		const displayName = normalizeOptionalString(entry.display_name);
		return {
			kind: "user",
			id: userId,
			name: displayName,
			handle: displayName ? `@${displayName}` : void 0,
			raw: entry
		};
	}).filter(Boolean);
}
async function resolveMatrixRoomAlias(client, alias) {
	try {
		return normalizeOptionalString((await requestMatrixJson(client, {
			method: "GET",
			endpoint: `/_matrix/client/v3/directory/room/${encodeURIComponent(alias)}`
		})).room_id) ?? null;
	} catch {
		return null;
	}
}
async function fetchMatrixRoomName(client, roomId) {
	try {
		return normalizeOptionalString((await requestMatrixJson(client, {
			method: "GET",
			endpoint: `/_matrix/client/v3/rooms/${encodeURIComponent(roomId)}/state/m.room.name`
		})).name) ?? null;
	} catch {
		return null;
	}
}
async function listMatrixDirectoryGroupsLive(params) {
	const query = normalizeOptionalString(params.query) ?? "";
	if (!query) return [];
	const directTarget = normalizeMatrixMessagingTarget(query);
	if (directTarget?.startsWith("!")) return [createGroupDirectoryEntry({
		id: directTarget,
		name: directTarget
	})];
	const context = await resolveMatrixDirectoryContext({
		...params,
		query
	});
	if (!context) return [];
	const { client, queryLower } = context;
	const limit = resolveMatrixDirectoryLimit(params.limit);
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
	})).joined_rooms ?? []).map((roomId) => normalizeOptionalString(roomId)).filter((roomId) => Boolean(roomId));
	const results = [];
	for (const roomId of rooms) {
		const name = await fetchMatrixRoomName(client, roomId);
		if (!name || !normalizeLowercaseStringOrEmpty(name).includes(queryLower)) continue;
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
	return normalizeOptionalLowercaseString(query) ?? "";
}
function findExactDirectoryMatches(matches, query) {
	const normalized = normalizeLookupQuery(query);
	if (!normalized) return [];
	return matches.filter((match) => {
		const id = normalizeOptionalLowercaseString(match.id);
		const name = normalizeOptionalLowercaseString(match.name);
		const handle = normalizeOptionalLowercaseString(match.handle);
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
