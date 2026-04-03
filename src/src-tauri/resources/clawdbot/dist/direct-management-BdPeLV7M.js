import { t as KeyedAsyncQueue } from "./keyed-async-queue-BkMLZAw9.js";
import "./core-BghMcc08.js";
import { t as isMatrixQualifiedUserId } from "./target-ids-CDZUajR8.js";
import { n as inspectMatrixDirectRoomEvidence } from "./direct-room-CQa3X8cA.js";
//#region extensions/matrix/src/matrix/reaction-common.ts
const MATRIX_ANNOTATION_RELATION_TYPE = "m.annotation";
const MATRIX_REACTION_EVENT_TYPE = "m.reaction";
function normalizeMatrixReactionMessageId(messageId) {
	const normalized = messageId.trim();
	if (!normalized) throw new Error("Matrix reaction requires a messageId");
	return normalized;
}
function normalizeMatrixReactionEmoji(emoji) {
	const normalized = emoji.trim();
	if (!normalized) throw new Error("Matrix reaction requires an emoji");
	return normalized;
}
function buildMatrixReactionContent(messageId, emoji) {
	return { "m.relates_to": {
		rel_type: MATRIX_ANNOTATION_RELATION_TYPE,
		event_id: normalizeMatrixReactionMessageId(messageId),
		key: normalizeMatrixReactionEmoji(emoji)
	} };
}
function buildMatrixReactionRelationsPath(roomId, messageId) {
	return `/_matrix/client/v1/rooms/${encodeURIComponent(roomId)}/relations/${encodeURIComponent(normalizeMatrixReactionMessageId(messageId))}/${MATRIX_ANNOTATION_RELATION_TYPE}/${MATRIX_REACTION_EVENT_TYPE}`;
}
function extractMatrixReactionAnnotation(content) {
	if (!content || typeof content !== "object") return;
	const relatesTo = content["m.relates_to"];
	if (!relatesTo || typeof relatesTo !== "object") return;
	if (typeof relatesTo.rel_type === "string" && relatesTo.rel_type !== "m.annotation") return;
	const key = typeof relatesTo.key === "string" ? relatesTo.key.trim() : "";
	if (!key) return;
	return {
		key,
		eventId: (typeof relatesTo.event_id === "string" ? relatesTo.event_id.trim() : "") || void 0
	};
}
function extractMatrixReactionKey(content) {
	return extractMatrixReactionAnnotation(content)?.key;
}
function summarizeMatrixReactionEvents(events) {
	const summaries = /* @__PURE__ */ new Map();
	for (const event of events) {
		const key = extractMatrixReactionKey(event.content);
		if (!key) continue;
		const sender = event.sender?.trim() ?? "";
		const entry = summaries.get(key) ?? {
			key,
			count: 0,
			users: []
		};
		entry.count += 1;
		if (sender && !entry.users.includes(sender)) entry.users.push(sender);
		summaries.set(key, entry);
	}
	return Array.from(summaries.values());
}
function selectOwnMatrixReactionEventIds(events, userId, emoji) {
	const senderId = userId.trim();
	if (!senderId) return [];
	const targetEmoji = emoji?.trim();
	const ids = [];
	for (const event of events) {
		if ((event.sender?.trim() ?? "") !== senderId) continue;
		if (targetEmoji && extractMatrixReactionKey(event.content) !== targetEmoji) continue;
		const eventId = event.event_id?.trim();
		if (eventId) ids.push(eventId);
	}
	return ids;
}
//#endregion
//#region extensions/matrix/src/matrix/send/types.ts
const MsgType = {
	Text: "m.text",
	Image: "m.image",
	Audio: "m.audio",
	Video: "m.video",
	File: "m.file",
	Notice: "m.notice"
};
const RelationType = {
	Annotation: MATRIX_ANNOTATION_RELATION_TYPE,
	Replace: "m.replace",
	Thread: "m.thread"
};
const EventType = {
	Direct: "m.direct",
	Reaction: MATRIX_REACTION_EVENT_TYPE,
	RoomMessage: "m.room.message"
};
//#endregion
//#region extensions/matrix/src/matrix/direct-management.ts
const DIRECT_ACCOUNT_DATA_QUEUE_KEY = EventType.Direct;
const directAccountDataWriteQueues = /* @__PURE__ */ new WeakMap();
async function readMatrixDirectAccountData(client) {
	try {
		const direct = await client.getAccountData(EventType.Direct);
		return direct && typeof direct === "object" && !Array.isArray(direct) ? direct : {};
	} catch {
		return {};
	}
}
function normalizeRemoteUserId(remoteUserId) {
	const normalized = remoteUserId.trim();
	if (!isMatrixQualifiedUserId(normalized)) throw new Error(`Matrix user IDs must be fully qualified (got "${remoteUserId}")`);
	return normalized;
}
function normalizeMappedRoomIds(direct, remoteUserId) {
	const current = direct[remoteUserId];
	if (!Array.isArray(current)) return [];
	const seen = /* @__PURE__ */ new Set();
	const normalized = [];
	for (const value of current) {
		const roomId = typeof value === "string" ? value.trim() : "";
		if (!roomId || seen.has(roomId)) continue;
		seen.add(roomId);
		normalized.push(roomId);
	}
	return normalized;
}
function normalizeRoomIdList(values) {
	const seen = /* @__PURE__ */ new Set();
	const normalized = [];
	for (const value of values) {
		const roomId = value.trim();
		if (!roomId || seen.has(roomId)) continue;
		seen.add(roomId);
		normalized.push(roomId);
	}
	return normalized;
}
function hasPrimaryMatrixDirectRoomMapping(params) {
	return normalizeMappedRoomIds(params.directContent, params.remoteUserId)[0] === params.roomId;
}
function resolveDirectAccountDataWriteQueue(client) {
	const existing = directAccountDataWriteQueues.get(client);
	if (existing) return existing;
	const created = new KeyedAsyncQueue();
	directAccountDataWriteQueues.set(client, created);
	return created;
}
async function writeMatrixDirectRoomMapping(params) {
	return await resolveDirectAccountDataWriteQueue(params.client).enqueue(DIRECT_ACCOUNT_DATA_QUEUE_KEY, async () => {
		const directContentBefore = await readMatrixDirectAccountData(params.client);
		const directContentAfter = buildNextDirectContent({
			directContent: directContentBefore,
			remoteUserId: params.remoteUserId,
			roomId: params.roomId
		});
		const changed = !hasPrimaryMatrixDirectRoomMapping({
			directContent: directContentBefore,
			remoteUserId: params.remoteUserId,
			roomId: params.roomId
		});
		if (changed) await params.client.setAccountData(EventType.Direct, directContentAfter);
		return {
			changed,
			directContentBefore,
			directContentAfter
		};
	});
}
async function classifyDirectRoomCandidate(params) {
	const evidence = await inspectMatrixDirectRoomEvidence({
		client: params.client,
		roomId: params.roomId,
		remoteUserId: params.remoteUserId,
		selfUserId: params.selfUserId
	});
	return {
		roomId: params.roomId,
		joinedMembers: evidence.joinedMembers,
		strict: evidence.strict && (params.source === "account-data" || evidence.memberStateFlag !== false),
		explicit: evidence.strict && (params.source === "account-data" || evidence.memberStateFlag !== false) && (params.source === "account-data" || evidence.viaMemberState),
		source: params.source
	};
}
function buildNextDirectContent(params) {
	const current = normalizeMappedRoomIds(params.directContent, params.remoteUserId);
	const nextRooms = normalizeRoomIdList([params.roomId, ...current]);
	return {
		...params.directContent,
		[params.remoteUserId]: nextRooms
	};
}
async function persistMatrixDirectRoomMapping(params) {
	const remoteUserId = normalizeRemoteUserId(params.remoteUserId);
	return (await writeMatrixDirectRoomMapping({
		client: params.client,
		remoteUserId,
		roomId: params.roomId
	})).changed;
}
async function promoteMatrixDirectRoomCandidate(params) {
	const remoteUserId = normalizeRemoteUserId(params.remoteUserId);
	const evidence = await inspectMatrixDirectRoomEvidence({
		client: params.client,
		roomId: params.roomId,
		remoteUserId,
		selfUserId: params.selfUserId
	});
	if (!evidence.strict) return {
		classifyAsDirect: false,
		repaired: false,
		reason: "not-strict"
	};
	if (evidence.memberStateFlag === false) return {
		classifyAsDirect: false,
		repaired: false,
		reason: "local-explicit-false"
	};
	try {
		const repaired = await persistMatrixDirectRoomMapping({
			client: params.client,
			remoteUserId,
			roomId: params.roomId
		});
		return {
			classifyAsDirect: true,
			repaired,
			roomId: params.roomId,
			reason: repaired ? "promoted" : "already-mapped"
		};
	} catch {
		return {
			classifyAsDirect: true,
			repaired: false,
			roomId: params.roomId,
			reason: "repair-failed"
		};
	}
}
async function inspectMatrixDirectRooms(params) {
	const remoteUserId = normalizeRemoteUserId(params.remoteUserId);
	const selfUserId = (await params.client.getUserId().catch(() => null))?.trim() || null;
	const mappedRoomIds = normalizeMappedRoomIds(await readMatrixDirectAccountData(params.client), remoteUserId);
	const mappedRooms = await Promise.all(mappedRoomIds.map(async (roomId) => await classifyDirectRoomCandidate({
		client: params.client,
		roomId,
		remoteUserId,
		selfUserId,
		source: "account-data"
	})));
	const mappedStrict = mappedRooms.find((room) => room.strict);
	let joinedRooms = [];
	if (!mappedStrict && typeof params.client.getJoinedRooms === "function") try {
		const resolved = await params.client.getJoinedRooms();
		joinedRooms = Array.isArray(resolved) ? resolved : [];
	} catch {
		joinedRooms = [];
	}
	const discoveredStrictRooms = [];
	for (const roomId of normalizeRoomIdList(joinedRooms)) {
		if (mappedRoomIds.includes(roomId)) continue;
		const candidate = await classifyDirectRoomCandidate({
			client: params.client,
			roomId,
			remoteUserId,
			selfUserId,
			source: "joined"
		});
		if (candidate.strict) discoveredStrictRooms.push(candidate);
	}
	const discoveredStrictRoomIds = discoveredStrictRooms.map((room) => room.roomId);
	const discoveredExplicit = discoveredStrictRooms.find((room) => room.explicit);
	return {
		selfUserId,
		remoteUserId,
		mappedRoomIds,
		mappedRooms,
		discoveredStrictRoomIds,
		activeRoomId: mappedStrict?.roomId ?? discoveredExplicit?.roomId ?? discoveredStrictRoomIds[0] ?? null
	};
}
async function repairMatrixDirectRooms(params) {
	const remoteUserId = normalizeRemoteUserId(params.remoteUserId);
	const inspected = await inspectMatrixDirectRooms({
		client: params.client,
		remoteUserId
	});
	const activeRoomId = inspected.activeRoomId ?? await params.client.createDirectRoom(remoteUserId, { encrypted: params.encrypted === true });
	const createdRoomId = inspected.activeRoomId ? null : activeRoomId;
	const mappingWrite = await writeMatrixDirectRoomMapping({
		client: params.client,
		remoteUserId,
		roomId: activeRoomId
	});
	return {
		...inspected,
		activeRoomId,
		createdRoomId,
		changed: mappingWrite.changed,
		directContentBefore: mappingWrite.directContentBefore,
		directContentAfter: mappingWrite.directContentAfter
	};
}
//#endregion
export { EventType as a, MATRIX_REACTION_EVENT_TYPE as c, extractMatrixReactionAnnotation as d, selectOwnMatrixReactionEventIds as f, repairMatrixDirectRooms as i, buildMatrixReactionContent as l, persistMatrixDirectRoomMapping as n, MsgType as o, summarizeMatrixReactionEvents as p, promoteMatrixDirectRoomCandidate as r, RelationType as s, inspectMatrixDirectRooms as t, buildMatrixReactionRelationsPath as u };
