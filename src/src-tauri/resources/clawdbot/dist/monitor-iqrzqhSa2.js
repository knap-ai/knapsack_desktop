import { d as resolveThreadSessionKeys, u as resolveAgentIdFromSessionKey } from "./session-key-D7XpmyVq.js";
import { n as formatAllowlistMatchMeta } from "./allowlist-match-3bw5mXHZ.js";
import { n as writeJsonFileAtomically, t as readJsonFileWithFallback } from "./json-store-Bwo-RrS7.js";
import { r as getSessionBindingService } from "./session-binding-service-CAxmjUEJ.js";
import { a as warnMissingProviderGroupPolicyFallbackOnce, n as resolveAllowlistProviderRuntimeGroupPolicy, r as resolveDefaultGroupPolicy, t as GROUP_POLICY_BLOCKED_LABEL } from "./runtime-group-policy-Dj5ka44z.js";
import { t as resolveAckReaction } from "./identity-BVAU5Jb3.js";
import { n as getAgentScopedMediaLocalRoots } from "./local-roots-CaV3b967.js";
import { n as deriveLastRoutePolicy } from "./resolve-route-DID7K3Jm.js";
import { c as resolveThreadBindingIdleTimeoutMsForChannel, d as resolveThreadBindingMaxAgeMsForChannel } from "./thread-bindings-policy-ypJ47uk9.js";
import "./routing-Br1fEo8A.js";
import { n as resolveControlCommandGate } from "./command-gating-Ch_OhMao.js";
import { a as patchAllowlistUsersInConfigEntries, n as buildAllowlistResolutionSummary, o as summarizeMapping, r as canonicalizeAllowlistWithResolvedIds, t as addAllowlistUserEntriesFromConfigEntry } from "./resolve-utils-C87Wj7-V.js";
import { n as createReplyPrefixOptions } from "./reply-prefix--bHYafND.js";
import { t as createTypingCallbacks } from "./typing-AU_Tlp3A.js";
import "./conversation-runtime-DIsQmaYR.js";
import { i as resolveConfiguredAcpBindingRecord, t as ensureConfiguredAcpBindingReady } from "./persistent-bindings.lifecycle-CqLV8fwu.js";
import { n as logInboundDrop, r as logTypingFailure } from "./logging-N7W67_op.js";
import "./command-auth-Bajp-QXz.js";
import { n as toLocationContext, t as formatLocationText } from "./location-ZVNxeZlc.js";
import { c as createDraftStreamLoop } from "./channel-lifecycle-BW1n4hjx.js";
import { s as resolveMatrixAccountConfig } from "./config-paths-TkWX6drG.js";
import { t as getMatrixRuntime } from "./runtime-Jdij2_G2.js";
import { n as resolveConfiguredMatrixBotUserIds } from "./accounts-CPOjCaWO.js";
import "./runtime-api-eE9m_2UG.js";
import { i as resolveMatrixAllowListMatch, n as normalizeMatrixAllowList, r as normalizeMatrixUserId, t as resolveMatrixRoomConfig } from "./rooms-CPmdn4pI.js";
import { t as isMatrixQualifiedUserId } from "./target-ids-CDZUajR8.js";
import { t as isBunRuntime } from "./runtime-c7ORk0xL.js";
import { n as resolveMatrixAuth, r as resolveMatrixAuthContext } from "./config-CKBRoB-O.js";
import { n as resolveMatrixStateFilePath } from "./storage-BLMn_aoo.js";
import { n as LogService } from "./logger-a6JNXTRe.js";
import { i as resolveSharedMatrixClient, n as releaseSharedClientInstance } from "./shared-Flwsuy-g.js";
import "./client-DDs6B46n.js";
import { t as resolveMatrixTargets } from "./resolve-targets-BQLh2DsB.js";
import { a as sendMessageMatrix, c as sendSingleTextMessageMatrix, g as isPollStartType, h as isPollEventType, i as reactMatrixMessage, l as sendTypingMatrix, n as editMessageMatrix, p as formatPollAsText, r as prepareMatrixSingleText, s as sendReadReceiptMatrix, t as chunkMatrixText, v as parsePollStartContent } from "./send-DiGInKau.js";
import { c as MATRIX_REACTION_EVENT_TYPE, d as extractMatrixReactionAnnotation, r as promoteMatrixDirectRoomCandidate } from "./direct-management-BdPeLV7M.js";
import { o as readJoinedMatrixMembers, r as isStrictDirectMembership, t as hasDirectMatrixMemberFlag } from "./direct-room-CQa3X8cA.js";
import { t as createMatrixThreadBindingManager } from "./thread-bindings-DEOEpiSN.js";
import { n as setActiveMatrixClient } from "./active-client-CYPFV7jI.js";
import { t as formatMatrixEncryptedEventDisabledWarning } from "./encryption-guidance-BtSr1gWW.js";
import { a as formatMatrixMessageText, i as formatMatrixMediaUnavailableText, n as fetchMatrixPollSnapshot, o as resolveMatrixMessageAttachment, s as resolveMatrixMessageBody } from "./poll-summary-DtIBstcl.js";
import { t as createAsyncLock } from "./async-lock-BvF5r459.js";
import { t as isMatrixNotFoundError } from "./errors-MT_RWGl1.js";
import { format } from "node:util";
//#region extensions/matrix/src/matrix/monitor/auto-join.ts
function registerMatrixAutoJoin(params) {
	const { client, accountConfig, runtime } = params;
	const core = getMatrixRuntime();
	const logVerbose = (message) => {
		if (!core.logging.shouldLogVerbose()) return;
		runtime.log?.(message);
	};
	const autoJoin = accountConfig.autoJoin ?? "off";
	const rawAllowlist = (accountConfig.autoJoinAllowlist ?? []).map((entry) => String(entry).trim()).filter(Boolean);
	const autoJoinAllowlist = new Set(rawAllowlist);
	const allowedRoomIds = new Set(rawAllowlist.filter((entry) => entry.startsWith("!")));
	const allowedAliases = rawAllowlist.filter((entry) => entry.startsWith("#"));
	const resolvedAliasRoomIds = /* @__PURE__ */ new Map();
	if (autoJoin === "off") return;
	if (autoJoin === "always") logVerbose("matrix: auto-join enabled for all invites");
	else logVerbose("matrix: auto-join enabled for allowlist invites");
	const resolveAllowedAliasRoomId = async (alias) => {
		if (resolvedAliasRoomIds.has(alias)) return resolvedAliasRoomIds.get(alias) ?? null;
		const resolved = await params.client.resolveRoom(alias);
		if (resolved) resolvedAliasRoomIds.set(alias, resolved);
		return resolved;
	};
	const resolveAllowedAliasRoomIds = async () => {
		return (await Promise.all(allowedAliases.map(async (alias) => {
			try {
				return await resolveAllowedAliasRoomId(alias);
			} catch (err) {
				runtime.error?.(`matrix: failed resolving allowlisted alias ${alias}: ${String(err)}`);
				return null;
			}
		}))).filter((roomId) => Boolean(roomId));
	};
	client.on("room.invite", async (roomId, _inviteEvent) => {
		if (autoJoin === "allowlist") {
			const allowedAliasRoomIds = await resolveAllowedAliasRoomIds();
			if (!(autoJoinAllowlist.has("*") || allowedRoomIds.has(roomId) || allowedAliasRoomIds.some((resolvedRoomId) => resolvedRoomId === roomId))) {
				logVerbose(`matrix: invite ignored (not in allowlist) room=${roomId}`);
				return;
			}
		}
		try {
			await client.joinRoom(roomId);
			logVerbose(`matrix: joined room ${roomId}`);
		} catch (err) {
			runtime.error?.(`matrix: failed to join room ${roomId}: ${String(err)}`);
		}
	});
}
//#endregion
//#region extensions/matrix/src/matrix/monitor/config.ts
function normalizeMatrixUserLookupEntry(raw) {
	return raw.replace(/^matrix:/i, "").replace(/^user:/i, "").trim();
}
function normalizeMatrixRoomLookupEntry(raw) {
	return raw.replace(/^matrix:/i, "").replace(/^(room|channel):/i, "").trim();
}
function filterResolvedMatrixAllowlistEntries(entries) {
	return entries.filter((entry) => {
		const trimmed = entry.trim();
		if (!trimmed) return false;
		if (trimmed === "*") return true;
		return isMatrixQualifiedUserId(normalizeMatrixUserLookupEntry(trimmed));
	});
}
function sanitizeMatrixRoomUserAllowlists(entries) {
	const nextEntries = { ...entries };
	for (const [roomKey, roomConfig] of Object.entries(entries)) {
		const users = roomConfig?.users;
		if (!Array.isArray(users)) continue;
		nextEntries[roomKey] = {
			...roomConfig,
			users: filterResolvedMatrixAllowlistEntries(users.map(String))
		};
	}
	return nextEntries;
}
async function resolveMatrixMonitorUserEntries(params) {
	const directMatches = [];
	const pending = [];
	for (const entry of params.entries) {
		const input = String(entry).trim();
		if (!input) continue;
		const query = normalizeMatrixUserLookupEntry(input);
		if (!query || query === "*") continue;
		if (isMatrixQualifiedUserId(query)) {
			directMatches.push({
				input,
				resolved: true,
				id: normalizeMatrixUserId(query)
			});
			continue;
		}
		pending.push({
			input,
			query
		});
	}
	(pending.length === 0 ? [] : await params.resolveTargets({
		cfg: params.cfg,
		accountId: params.accountId,
		inputs: pending.map((entry) => entry.query),
		kind: "user",
		runtime: params.runtime
	})).forEach((entry, index) => {
		const source = pending[index];
		if (!source) return;
		directMatches.push({
			input: source.input,
			resolved: entry.resolved,
			id: entry.id ? normalizeMatrixUserId(entry.id) : void 0
		});
	});
	return buildAllowlistResolutionSummary(directMatches);
}
async function resolveMatrixMonitorUserAllowlist(params) {
	const allowList = (params.list ?? []).map(String);
	if (allowList.length === 0) return allowList;
	const resolution = await resolveMatrixMonitorUserEntries({
		cfg: params.cfg,
		accountId: params.accountId,
		entries: allowList,
		runtime: params.runtime,
		resolveTargets: params.resolveTargets
	});
	const canonicalized = canonicalizeAllowlistWithResolvedIds({
		existing: allowList,
		resolvedMap: resolution.resolvedMap
	});
	summarizeMapping(params.label, resolution.mapping, resolution.unresolved, params.runtime);
	if (resolution.unresolved.length > 0) params.runtime.log?.(`${params.label} entries must be full Matrix IDs (example: @user:server). Unresolved entries are ignored.`);
	return filterResolvedMatrixAllowlistEntries(canonicalized);
}
async function resolveMatrixMonitorRoomsConfig(params) {
	const roomsConfig = params.roomsConfig;
	if (!roomsConfig || Object.keys(roomsConfig).length === 0) return roomsConfig;
	const mapping = [];
	const unresolved = [];
	const nextRooms = {};
	if (roomsConfig["*"]) nextRooms["*"] = roomsConfig["*"];
	const pending = [];
	for (const [entry, roomConfig] of Object.entries(roomsConfig)) {
		if (entry === "*") continue;
		const input = entry.trim();
		if (!input) continue;
		const cleaned = normalizeMatrixRoomLookupEntry(input);
		if (!cleaned) {
			unresolved.push(entry);
			continue;
		}
		if (cleaned.startsWith("!") && cleaned.includes(":")) {
			if (!nextRooms[cleaned]) nextRooms[cleaned] = roomConfig;
			if (cleaned !== input) mapping.push(`${input}→${cleaned}`);
			continue;
		}
		pending.push({
			input,
			query: cleaned,
			config: roomConfig
		});
	}
	if (pending.length > 0) (await params.resolveTargets({
		cfg: params.cfg,
		accountId: params.accountId,
		inputs: pending.map((entry) => entry.query),
		kind: "group",
		runtime: params.runtime
	})).forEach((entry, index) => {
		const source = pending[index];
		if (!source) return;
		if (entry.resolved && entry.id) {
			const roomKey = normalizeMatrixRoomLookupEntry(entry.id);
			if (!nextRooms[roomKey]) nextRooms[roomKey] = source.config;
			mapping.push(`${source.input}→${roomKey}`);
		} else unresolved.push(source.input);
	});
	summarizeMapping("matrix rooms", mapping, unresolved, params.runtime);
	if (unresolved.length > 0) params.runtime.log?.("matrix rooms must be room IDs or aliases (example: !room:server or #alias:server). Unresolved entries are ignored.");
	const roomUsers = /* @__PURE__ */ new Set();
	for (const roomConfig of Object.values(nextRooms)) addAllowlistUserEntriesFromConfigEntry(roomUsers, roomConfig);
	if (roomUsers.size === 0) return nextRooms;
	const resolution = await resolveMatrixMonitorUserEntries({
		cfg: params.cfg,
		accountId: params.accountId,
		entries: Array.from(roomUsers),
		runtime: params.runtime,
		resolveTargets: params.resolveTargets
	});
	summarizeMapping("matrix room users", resolution.mapping, resolution.unresolved, params.runtime);
	if (resolution.unresolved.length > 0) params.runtime.log?.("matrix room users entries must be full Matrix IDs (example: @user:server). Unresolved entries are ignored.");
	return sanitizeMatrixRoomUserAllowlists(patchAllowlistUsersInConfigEntries({
		entries: nextRooms,
		resolvedMap: resolution.resolvedMap,
		strategy: "canonicalize"
	}));
}
async function resolveMatrixMonitorConfig(params) {
	const resolveTargets = params.resolveTargets ?? resolveMatrixTargets;
	const [allowFrom, groupAllowFrom, roomsConfig] = await Promise.all([
		resolveMatrixMonitorUserAllowlist({
			cfg: params.cfg,
			accountId: params.accountId,
			label: "matrix dm allowlist",
			list: params.allowFrom,
			runtime: params.runtime,
			resolveTargets
		}),
		resolveMatrixMonitorUserAllowlist({
			cfg: params.cfg,
			accountId: params.accountId,
			label: "matrix group allowlist",
			list: params.groupAllowFrom,
			runtime: params.runtime,
			resolveTargets
		}),
		resolveMatrixMonitorRoomsConfig({
			cfg: params.cfg,
			accountId: params.accountId,
			roomsConfig: params.roomsConfig,
			runtime: params.runtime,
			resolveTargets
		})
	]);
	return {
		allowFrom,
		groupAllowFrom,
		roomsConfig
	};
}
//#endregion
//#region extensions/matrix/src/matrix/monitor/direct.ts
const DM_CACHE_TTL_MS = 3e4;
const RECENT_INVITE_TTL_MS = 3e4;
const MAX_TRACKED_DM_ROOMS = 1024;
const MAX_TRACKED_DM_MEMBER_FLAGS = 2048;
function rememberBounded$1(map, key, value, maxSize = MAX_TRACKED_DM_ROOMS) {
	map.set(key, value);
	if (map.size > maxSize) {
		const oldest = map.keys().next().value;
		if (typeof oldest === "string") map.delete(oldest);
	}
}
function createDirectRoomTracker(client, opts = {}) {
	const log = opts.log ?? (() => {});
	let lastDmUpdateMs = 0;
	let hasSeededDmCache = false;
	let cachedSelfUserId = null;
	const joinedMembersCache = /* @__PURE__ */ new Map();
	const directMemberFlagCache = /* @__PURE__ */ new Map();
	const recentInviteCandidates = /* @__PURE__ */ new Map();
	const locallyPromotedDirectRooms = /* @__PURE__ */ new Map();
	const ensureSelfUserId = async () => {
		if (cachedSelfUserId) return cachedSelfUserId;
		try {
			cachedSelfUserId = await client.getUserId();
		} catch {
			cachedSelfUserId = null;
		}
		return cachedSelfUserId;
	};
	const refreshDmCache = async () => {
		const now = Date.now();
		if (now - lastDmUpdateMs < DM_CACHE_TTL_MS) return;
		lastDmUpdateMs = now;
		hasSeededDmCache = await client.dms.update() || hasSeededDmCache;
	};
	const resolveJoinedMembers = async (roomId) => {
		const cached = joinedMembersCache.get(roomId);
		const now = Date.now();
		if (cached && now - cached.ts < DM_CACHE_TTL_MS) return cached.members;
		try {
			const normalized = await readJoinedMatrixMembers(client, roomId);
			if (!normalized) throw new Error("membership unavailable");
			rememberBounded$1(joinedMembersCache, roomId, {
				members: normalized,
				ts: now
			});
			return normalized;
		} catch (err) {
			log(`matrix: dm member lookup failed room=${roomId} (${String(err)})`);
			return null;
		}
	};
	const resolveDirectMemberFlag = async (roomId, userId) => {
		const normalizedUserId = userId?.trim();
		if (!normalizedUserId) return null;
		const cacheKey = `${roomId}\n${normalizedUserId}`;
		const cached = directMemberFlagCache.get(cacheKey);
		const now = Date.now();
		if (cached && now - cached.ts < DM_CACHE_TTL_MS) return cached.isDirect;
		const isDirect = await hasDirectMatrixMemberFlag(client, roomId, normalizedUserId);
		rememberBounded$1(directMemberFlagCache, cacheKey, {
			isDirect,
			ts: now
		}, MAX_TRACKED_DM_MEMBER_FLAGS);
		return isDirect;
	};
	const hasRecentInviteCandidate = (roomId, remoteUserId) => {
		const normalizedRemoteUserId = remoteUserId?.trim();
		if (!normalizedRemoteUserId) return false;
		const cached = recentInviteCandidates.get(roomId);
		if (!cached) return false;
		if (Date.now() - cached.ts >= RECENT_INVITE_TTL_MS) {
			recentInviteCandidates.delete(roomId);
			return false;
		}
		return cached.remoteUserId === normalizedRemoteUserId;
	};
	const canPromoteRecentInvite = async (roomId) => {
		try {
			return await opts.canPromoteRecentInvite?.(roomId) ?? true;
		} catch (err) {
			log(`matrix: recent invite promotion veto failed room=${roomId} (${String(err)})`);
			return false;
		}
	};
	const shouldKeepLocallyPromotedDirectRoom = async (roomId) => {
		try {
			return await opts.shouldKeepLocallyPromotedDirectRoom?.(roomId);
		} catch (err) {
			log(`matrix: local promotion keep-check failed room=${roomId} (${String(err)})`);
			return;
		}
	};
	const hasLocallyPromotedDirectRoom = (roomId, remoteUserId) => {
		const normalizedRemoteUserId = remoteUserId?.trim();
		if (!normalizedRemoteUserId) return false;
		return locallyPromotedDirectRooms.get(roomId)?.remoteUserId === normalizedRemoteUserId;
	};
	const rememberLocallyPromotedDirectRoom = (roomId, remoteUserId) => {
		const normalizedRemoteUserId = remoteUserId.trim();
		if (!normalizedRemoteUserId) return;
		rememberBounded$1(locallyPromotedDirectRooms, roomId, { remoteUserId: normalizedRemoteUserId });
	};
	return {
		invalidateRoom: (roomId) => {
			joinedMembersCache.delete(roomId);
			for (const key of directMemberFlagCache.keys()) if (key.startsWith(`${roomId}\n`)) directMemberFlagCache.delete(key);
			lastDmUpdateMs = 0;
			log(`matrix: invalidated dm cache room=${roomId}`);
		},
		rememberInvite: (roomId, remoteUserId) => {
			const normalizedRemoteUserId = remoteUserId.trim();
			if (!normalizedRemoteUserId) return;
			rememberBounded$1(recentInviteCandidates, roomId, {
				remoteUserId: normalizedRemoteUserId,
				ts: Date.now()
			});
			log(`matrix: remembered invite candidate room=${roomId} sender=${normalizedRemoteUserId}`);
		},
		isDirectMessage: async (params) => {
			const { roomId, senderId } = params;
			const selfUserId = params.selfUserId ?? await ensureSelfUserId();
			const joinedMembers = await resolveJoinedMembers(roomId);
			const strictDirectMembership = isStrictDirectMembership({
				selfUserId,
				remoteUserId: senderId,
				joinedMembers
			});
			try {
				await refreshDmCache();
			} catch (err) {
				log(`matrix: dm cache refresh failed (${String(err)})`);
			}
			if (client.dms.isDm(roomId)) {
				if (strictDirectMembership) {
					log(`matrix: dm detected via m.direct room=${roomId}`);
					return true;
				}
				log(`matrix: ignoring stale m.direct classification room=${roomId}`);
			}
			if (strictDirectMembership) {
				const directViaSelf = await resolveDirectMemberFlag(roomId, selfUserId);
				if (directViaSelf === true) {
					log(`matrix: dm detected via member state room=${roomId}`);
					return true;
				}
				if (directViaSelf === false) {
					log(`matrix: dm rejected via member state room=${roomId}`);
					return false;
				}
				if (!hasSeededDmCache) {
					log(`matrix: dm detected via exact 2-member fallback before dm cache seed room=${roomId}`);
					return true;
				}
				if (hasLocallyPromotedDirectRoom(roomId, senderId)) {
					if (await shouldKeepLocallyPromotedDirectRoom(roomId) !== false) {
						log(`matrix: dm detected via local promotion room=${roomId}`);
						return true;
					}
					locallyPromotedDirectRooms.delete(roomId);
					log(`matrix: local promotion cleared room=${roomId}`);
				}
				if (hasRecentInviteCandidate(roomId, senderId) && await canPromoteRecentInvite(roomId)) {
					const promotion = await promoteMatrixDirectRoomCandidate({
						client,
						remoteUserId: senderId ?? "",
						roomId,
						selfUserId
					});
					if (promotion.classifyAsDirect) {
						rememberLocallyPromotedDirectRoom(roomId, senderId ?? "");
						log(`matrix: dm detected via recent invite room=${roomId} reason=${promotion.reason} repaired=${String(promotion.repaired)}`);
						return true;
					}
				}
			}
			log(`matrix: dm check room=${roomId} result=group members=${joinedMembers?.length ?? "unknown"}`);
			return false;
		}
	};
}
//#endregion
//#region extensions/matrix/src/matrix/monitor/types.ts
const EventType = {
	RoomMessage: "m.room.message",
	RoomMessageEncrypted: "m.room.encrypted",
	RoomMember: "m.room.member",
	Location: "m.location",
	Reaction: MATRIX_REACTION_EVENT_TYPE
};
const RelationType = {
	Replace: "m.replace",
	Thread: "m.thread"
};
//#endregion
//#region extensions/matrix/src/matrix/monitor/access-state.ts
function resolveMatrixMonitorAccessState(params) {
	const effectiveAllowFrom = normalizeMatrixAllowList([...params.allowFrom, ...params.storeAllowFrom]);
	const effectiveGroupAllowFrom = normalizeMatrixAllowList(params.groupAllowFrom);
	const effectiveRoomUsers = normalizeMatrixAllowList(params.roomUsers);
	const directAllowMatch = resolveMatrixAllowListMatch({
		allowList: effectiveAllowFrom,
		userId: params.senderId
	});
	const roomUserMatch = params.isRoom && effectiveRoomUsers.length > 0 ? resolveMatrixAllowListMatch({
		allowList: effectiveRoomUsers,
		userId: params.senderId
	}) : null;
	const groupAllowMatch = effectiveGroupAllowFrom.length > 0 ? resolveMatrixAllowListMatch({
		allowList: effectiveGroupAllowFrom,
		userId: params.senderId
	}) : null;
	return {
		effectiveAllowFrom,
		effectiveGroupAllowFrom,
		effectiveRoomUsers,
		groupAllowConfigured: effectiveGroupAllowFrom.length > 0,
		directAllowMatch,
		roomUserMatch,
		groupAllowMatch,
		commandAuthorizers: [
			{
				configured: effectiveAllowFrom.length > 0,
				allowed: directAllowMatch.allowed
			},
			{
				configured: effectiveRoomUsers.length > 0,
				allowed: roomUserMatch?.allowed ?? false
			},
			{
				configured: effectiveGroupAllowFrom.length > 0,
				allowed: groupAllowMatch?.allowed ?? false
			}
		]
	};
}
//#endregion
//#region extensions/matrix/src/matrix/monitor/verification-utils.ts
const VERIFICATION_EVENT_PREFIX = "m.key.verification.";
const VERIFICATION_REQUEST_MSGTYPE = "m.key.verification.request";
const VERIFICATION_NOTICE_PREFIXES = [
	"Matrix verification request received from ",
	"Matrix verification is ready with ",
	"Matrix verification started with ",
	"Matrix verification completed with ",
	"Matrix verification cancelled by ",
	"Matrix verification SAS with "
];
function trimMaybeString$1(input) {
	return typeof input === "string" ? input.trim() : "";
}
function isMatrixVerificationEventType(type) {
	return trimMaybeString$1(type).startsWith(VERIFICATION_EVENT_PREFIX);
}
function isMatrixVerificationRequestMsgType(msgtype) {
	return trimMaybeString$1(msgtype) === VERIFICATION_REQUEST_MSGTYPE;
}
function isMatrixVerificationNoticeBody(body) {
	const text = trimMaybeString$1(body);
	return VERIFICATION_NOTICE_PREFIXES.some((prefix) => text.startsWith(prefix));
}
function isMatrixVerificationRoomMessage(content) {
	return isMatrixVerificationRequestMsgType(content.msgtype) || trimMaybeString$1(content.msgtype) === "m.notice" && isMatrixVerificationNoticeBody(content.body);
}
const matrixVerificationConstants = {
	eventPrefix: VERIFICATION_EVENT_PREFIX,
	requestMsgtype: VERIFICATION_REQUEST_MSGTYPE
};
//#endregion
//#region extensions/matrix/src/matrix/monitor/verification-events.ts
const MAX_TRACKED_VERIFICATION_EVENTS = 1024;
const SAS_NOTICE_RETRY_DELAY_MS = 750;
const VERIFICATION_EVENT_STARTUP_GRACE_MS = 3e4;
let matrixDirectRoomDepsPromise;
async function loadMatrixDirectRoomDeps() {
	matrixDirectRoomDepsPromise ??= Promise.all([import("./direct-management-BdPEJk-q.js"), import("./direct-room-BzqZtX1n.js")]).then(([directManagementModule, directRoomModule]) => ({
		inspectMatrixDirectRooms: directManagementModule.inspectMatrixDirectRooms,
		isStrictDirectRoom: directRoomModule.isStrictDirectRoom
	}));
	return await matrixDirectRoomDepsPromise;
}
function trimMaybeString(input) {
	if (typeof input !== "string") return null;
	const trimmed = input.trim();
	return trimmed.length > 0 ? trimmed : null;
}
function readVerificationSignal(event) {
	const type = trimMaybeString(event?.type) ?? "";
	const content = event?.content ?? {};
	const msgtype = trimMaybeString(content.msgtype) ?? "";
	const relatedEventId = trimMaybeString(content["m.relates_to"]?.event_id);
	const transactionId = trimMaybeString(content.transaction_id);
	if (type === EventType.RoomMessage && isMatrixVerificationRequestMsgType(msgtype)) return {
		stage: "request",
		flowId: trimMaybeString(event.event_id) ?? transactionId ?? relatedEventId
	};
	if (!isMatrixVerificationEventType(type)) return null;
	const flowId = transactionId ?? relatedEventId ?? trimMaybeString(event.event_id);
	if (type === `${matrixVerificationConstants.eventPrefix}request`) return {
		stage: "request",
		flowId
	};
	if (type === `${matrixVerificationConstants.eventPrefix}ready`) return {
		stage: "ready",
		flowId
	};
	if (type === "m.key.verification.start") return {
		stage: "start",
		flowId
	};
	if (type === "m.key.verification.cancel") return {
		stage: "cancel",
		flowId
	};
	if (type === "m.key.verification.done") return {
		stage: "done",
		flowId
	};
	return {
		stage: "other",
		flowId
	};
}
function formatVerificationStageNotice(params) {
	const { stage, senderId, event } = params;
	const content = event.content;
	switch (stage) {
		case "request": return `Matrix verification request received from ${senderId}. Open "Verify by emoji" in your Matrix client to continue.`;
		case "ready": return `Matrix verification is ready with ${senderId}. Choose "Verify by emoji" to reveal the emoji sequence.`;
		case "start": return `Matrix verification started with ${senderId}.`;
		case "done": return `Matrix verification completed with ${senderId}.`;
		case "cancel": {
			const code = trimMaybeString(content.code);
			const reason = trimMaybeString(content.reason);
			if (code && reason) return `Matrix verification cancelled by ${senderId} (${code}: ${reason}).`;
			if (reason) return `Matrix verification cancelled by ${senderId} (${reason}).`;
			return `Matrix verification cancelled by ${senderId}.`;
		}
		default: return null;
	}
}
function formatVerificationSasNotice(summary) {
	const sas = summary.sas;
	if (!sas) return null;
	const emojiLine = Array.isArray(sas.emoji) && sas.emoji.length > 0 ? `SAS emoji: ${sas.emoji.map(([emoji, name]) => `${trimMaybeString(emoji) ?? "?"} ${trimMaybeString(name) ?? "?"}`).join(" | ")}` : null;
	const decimalLine = Array.isArray(sas.decimal) && sas.decimal.length === 3 ? `SAS decimal: ${sas.decimal.join(" ")}` : null;
	if (!emojiLine && !decimalLine) return null;
	const lines = [`Matrix verification SAS with ${summary.otherUserId}:`];
	if (emojiLine) lines.push(emojiLine);
	if (decimalLine) lines.push(decimalLine);
	lines.push("If both sides match, choose 'They match' in your Matrix app.");
	return lines.join("\n");
}
function resolveVerificationFlowCandidates(params) {
	const { event, flowId } = params;
	const content = event.content;
	const candidates = /* @__PURE__ */ new Set();
	const add = (value) => {
		const normalized = trimMaybeString(value);
		if (normalized) candidates.add(normalized);
	};
	add(flowId);
	add(event.event_id);
	add(content.transaction_id);
	add(content["m.relates_to"]?.event_id);
	return Array.from(candidates);
}
function resolveSummaryRecency(summary) {
	const ts = Date.parse(summary.updatedAt ?? "");
	return Number.isFinite(ts) ? ts : 0;
}
function isActiveVerificationSummary(summary) {
	if (summary.completed === true) return false;
	if (summary.phaseName === "cancelled" || summary.phaseName === "done") return false;
	if (typeof summary.phase === "number" && summary.phase >= 4) return false;
	return true;
}
async function resolveVerificationSummaryForSignal(client, params) {
	if (!client.crypto) return null;
	await client.crypto.ensureVerificationDmTracked({
		roomId: params.roomId,
		userId: params.senderId
	}).catch(() => null);
	const list = await client.crypto.listVerifications();
	if (list.length === 0) return null;
	const candidates = resolveVerificationFlowCandidates({
		event: params.event,
		flowId: params.flowId
	});
	const byTransactionId = list.find((entry) => candidates.some((candidate) => entry.transactionId === candidate));
	if (byTransactionId) return byTransactionId;
	const { inspectMatrixDirectRooms, isStrictDirectRoom } = await loadMatrixDirectRoomDeps();
	const activeRoomId = trimMaybeString((await inspectMatrixDirectRooms({
		client,
		remoteUserId: params.senderId
	}).catch(() => null))?.activeRoomId);
	if (activeRoomId) {
		if (activeRoomId !== params.roomId) return null;
	} else if (!await isStrictDirectRoom({
		client,
		roomId: params.roomId,
		remoteUserId: params.senderId
	})) return null;
	const activeByUser = list.filter((entry) => entry.otherUserId === params.senderId && isActiveVerificationSummary(entry)).sort((a, b) => resolveSummaryRecency(b) - resolveSummaryRecency(a));
	const activeInRoom = activeByUser.filter((entry) => {
		return trimMaybeString(entry.roomId) === params.roomId;
	});
	if (activeInRoom.length > 0) return activeInRoom[0] ?? null;
	return activeByUser[0] ?? null;
}
async function resolveVerificationSasNoticeForSignal(client, params) {
	const summary = await resolveVerificationSummaryForSignal(client, params);
	const immediateNotice = summary && isActiveVerificationSummary(summary) ? formatVerificationSasNotice(summary) : null;
	if (immediateNotice || params.stage !== "ready" && params.stage !== "start") return {
		summary,
		sasNotice: immediateNotice
	};
	await new Promise((resolve) => setTimeout(resolve, SAS_NOTICE_RETRY_DELAY_MS));
	const retriedSummary = await resolveVerificationSummaryForSignal(client, params);
	return {
		summary: retriedSummary,
		sasNotice: retriedSummary && isActiveVerificationSummary(retriedSummary) ? formatVerificationSasNotice(retriedSummary) : null
	};
}
function trackBounded(set, value) {
	if (!value || set.has(value)) return false;
	set.add(value);
	if (set.size > MAX_TRACKED_VERIFICATION_EVENTS) {
		const oldest = set.values().next().value;
		if (typeof oldest === "string") set.delete(oldest);
	}
	return true;
}
async function sendVerificationNotice(params) {
	const roomId = trimMaybeString(params.roomId);
	if (!roomId) return;
	try {
		await params.client.sendMessage(roomId, {
			msgtype: "m.notice",
			body: params.body
		});
	} catch (err) {
		params.logVerboseMessage(`matrix: failed sending verification notice room=${roomId}: ${String(err)}`);
	}
}
async function isVerificationNoticeAuthorized(params) {
	if (!params.dmEnabled || params.dmPolicy === "disabled") {
		params.logVerboseMessage(`matrix: blocked verification sender ${params.senderId} (dmPolicy=${params.dmPolicy}, dmEnabled=${String(params.dmEnabled)})`);
		return false;
	}
	if (params.dmPolicy === "open") return true;
	const storeAllowFrom = await params.readStoreAllowFrom();
	if (resolveMatrixMonitorAccessState({
		allowFrom: params.allowFrom,
		storeAllowFrom,
		groupAllowFrom: [],
		roomUsers: [],
		senderId: params.senderId,
		isRoom: false
	}).directAllowMatch.allowed) return true;
	params.logVerboseMessage(`matrix: blocked verification sender ${params.senderId} (dmPolicy=${params.dmPolicy})`);
	return false;
}
function createMatrixVerificationEventRouter(params) {
	const routerStartedAtMs = Date.now();
	const routedVerificationEvents = /* @__PURE__ */ new Set();
	const routedVerificationSasFingerprints = /* @__PURE__ */ new Set();
	const routedVerificationStageNotices = /* @__PURE__ */ new Set();
	const verificationFlowRooms = /* @__PURE__ */ new Map();
	const verificationUserRooms = /* @__PURE__ */ new Map();
	async function resolveActiveDirectRoomId(remoteUserId) {
		const { inspectMatrixDirectRooms } = await loadMatrixDirectRoomDeps();
		return trimMaybeString((await inspectMatrixDirectRooms({
			client: params.client,
			remoteUserId
		}).catch(() => null))?.activeRoomId);
	}
	function shouldEmitVerificationEventNotice(event) {
		const eventTs = typeof event.origin_server_ts === "number" && Number.isFinite(event.origin_server_ts) ? event.origin_server_ts : null;
		if (eventTs === null) return true;
		return eventTs >= routerStartedAtMs - VERIFICATION_EVENT_STARTUP_GRACE_MS;
	}
	function rememberVerificationRoom(roomId, event, flowId) {
		for (const candidate of resolveVerificationFlowCandidates({
			event,
			flowId
		})) {
			verificationFlowRooms.set(candidate, roomId);
			if (verificationFlowRooms.size > MAX_TRACKED_VERIFICATION_EVENTS) {
				const oldest = verificationFlowRooms.keys().next().value;
				if (typeof oldest === "string") verificationFlowRooms.delete(oldest);
			}
		}
	}
	function rememberVerificationUserRoom(remoteUserId, roomId) {
		const normalizedUserId = trimMaybeString(remoteUserId);
		const normalizedRoomId = trimMaybeString(roomId);
		if (!normalizedUserId || !normalizedRoomId) return;
		verificationUserRooms.delete(normalizedUserId);
		verificationUserRooms.set(normalizedUserId, normalizedRoomId);
		if (verificationUserRooms.size > MAX_TRACKED_VERIFICATION_EVENTS) {
			const oldest = verificationUserRooms.keys().next().value;
			if (typeof oldest === "string") verificationUserRooms.delete(oldest);
		}
	}
	async function resolveSummaryRoomId(summary) {
		const mappedRoomId = trimMaybeString(summary.roomId) ?? trimMaybeString(summary.transactionId ? verificationFlowRooms.get(summary.transactionId) : null) ?? trimMaybeString(verificationFlowRooms.get(summary.id));
		if (mappedRoomId) return mappedRoomId;
		const remoteUserId = trimMaybeString(summary.otherUserId);
		if (!remoteUserId) return null;
		const recentRoomId = trimMaybeString(verificationUserRooms.get(remoteUserId));
		const activeRoomId = await resolveActiveDirectRoomId(remoteUserId);
		if (recentRoomId && activeRoomId && recentRoomId === activeRoomId) return recentRoomId;
		if (activeRoomId) return activeRoomId;
		if (recentRoomId && await (await loadMatrixDirectRoomDeps()).isStrictDirectRoom({
			client: params.client,
			roomId: recentRoomId,
			remoteUserId
		})) return recentRoomId;
		return null;
	}
	async function routeVerificationSummary(summary) {
		const roomId = await resolveSummaryRoomId(summary);
		if (!roomId || !isActiveVerificationSummary(summary)) return;
		if (!await (await loadMatrixDirectRoomDeps()).isStrictDirectRoom({
			client: params.client,
			roomId,
			remoteUserId: summary.otherUserId
		})) {
			params.logVerboseMessage(`matrix: ignoring verification summary outside strict DM room=${roomId} sender=${summary.otherUserId}`);
			return;
		}
		if (!await isVerificationNoticeAuthorized({
			senderId: summary.otherUserId,
			allowFrom: params.allowFrom,
			dmEnabled: params.dmEnabled,
			dmPolicy: params.dmPolicy,
			readStoreAllowFrom: params.readStoreAllowFrom,
			logVerboseMessage: params.logVerboseMessage
		})) return;
		const sasNotice = formatVerificationSasNotice(summary);
		if (!sasNotice) return;
		if (!trackBounded(routedVerificationSasFingerprints, `${summary.id}:${JSON.stringify(summary.sas)}`)) return;
		await sendVerificationNotice({
			client: params.client,
			roomId,
			body: sasNotice,
			logVerboseMessage: params.logVerboseMessage
		});
	}
	function routeVerificationEvent(roomId, event) {
		const senderId = trimMaybeString(event?.sender);
		if (!senderId) return false;
		const signal = readVerificationSignal(event);
		if (!signal) return false;
		rememberVerificationRoom(roomId, event, signal.flowId);
		(async () => {
			if (!shouldEmitVerificationEventNotice(event)) {
				params.logVerboseMessage(`matrix: ignoring historical verification event room=${roomId} id=${event.event_id ?? "unknown"} type=${event.type ?? "unknown"}`);
				return;
			}
			const flowId = signal.flowId;
			const sourceFingerprint = trimMaybeString(event?.event_id) ?? `${senderId}:${event.type}:${flowId ?? "none"}`;
			if (!await (await loadMatrixDirectRoomDeps()).isStrictDirectRoom({
				client: params.client,
				roomId,
				remoteUserId: senderId
			})) {
				params.logVerboseMessage(`matrix: ignoring verification event outside strict DM room=${roomId} sender=${senderId}`);
				return;
			}
			if (!await isVerificationNoticeAuthorized({
				senderId,
				allowFrom: params.allowFrom,
				dmEnabled: params.dmEnabled,
				dmPolicy: params.dmPolicy,
				readStoreAllowFrom: params.readStoreAllowFrom,
				logVerboseMessage: params.logVerboseMessage
			})) return;
			rememberVerificationUserRoom(senderId, roomId);
			if (!trackBounded(routedVerificationEvents, sourceFingerprint)) return;
			const stageNotice = formatVerificationStageNotice({
				stage: signal.stage,
				senderId,
				event
			});
			const { summary, sasNotice } = await resolveVerificationSasNoticeForSignal(params.client, {
				roomId,
				event,
				senderId,
				flowId,
				stage: signal.stage
			}).catch(() => ({
				summary: null,
				sasNotice: null
			}));
			const notices = [];
			if (stageNotice) {
				if (trackBounded(routedVerificationStageNotices, `${roomId}:${senderId}:${flowId ?? sourceFingerprint}:${signal.stage}`)) notices.push(stageNotice);
			}
			if (summary && sasNotice) {
				if (trackBounded(routedVerificationSasFingerprints, `${summary.id}:${JSON.stringify(summary.sas)}`)) notices.push(sasNotice);
			}
			if (notices.length === 0) return;
			for (const body of notices) await sendVerificationNotice({
				client: params.client,
				roomId,
				body,
				logVerboseMessage: params.logVerboseMessage
			});
		})().catch((err) => {
			params.logVerboseMessage(`matrix: failed routing verification event: ${String(err)}`);
		});
		return true;
	}
	return {
		routeVerificationEvent,
		routeVerificationSummary
	};
}
//#endregion
//#region extensions/matrix/src/matrix/monitor/events.ts
function formatMatrixSelfDecryptionHint(accountId) {
	return `matrix: failed to decrypt a message from this same Matrix user. This usually means another Matrix device did not share the room key, or another OpenClaw runtime is using the same account. Check 'openclaw matrix verify status --verbose --account ${accountId}' and 'openclaw matrix devices list --account ${accountId}'.`;
}
async function resolveMatrixSelfUserId(client, logVerboseMessage) {
	if (typeof client.getUserId !== "function") return null;
	try {
		return await client.getUserId() ?? null;
	} catch (err) {
		logVerboseMessage(`matrix: failed resolving self user id for decrypt warning: ${String(err)}`);
		return null;
	}
}
function registerMatrixMonitorEvents(params) {
	const { cfg, client, auth, allowFrom, dmEnabled, dmPolicy, readStoreAllowFrom, directTracker, logVerboseMessage, warnedEncryptedRooms, warnedCryptoMissingRooms, logger, formatNativeDependencyHint, onRoomMessage } = params;
	const { routeVerificationEvent, routeVerificationSummary } = createMatrixVerificationEventRouter({
		client,
		allowFrom,
		dmEnabled,
		dmPolicy,
		readStoreAllowFrom,
		logVerboseMessage
	});
	client.on("room.message", (roomId, event) => {
		if (routeVerificationEvent(roomId, event)) return;
		onRoomMessage(roomId, event);
	});
	client.on("room.encrypted_event", (roomId, event) => {
		const eventId = event?.event_id ?? "unknown";
		logVerboseMessage(`matrix: encrypted event room=${roomId} type=${event?.type ?? "unknown"} id=${eventId}`);
	});
	client.on("room.decrypted_event", (roomId, event) => {
		const eventId = event?.event_id ?? "unknown";
		logVerboseMessage(`matrix: decrypted event room=${roomId} type=${event?.type ?? "unknown"} id=${eventId}`);
	});
	client.on("room.failed_decryption", async (roomId, event, error) => {
		const selfUserId = await resolveMatrixSelfUserId(client, logVerboseMessage);
		const sender = typeof event.sender === "string" ? event.sender : null;
		const senderMatchesOwnUser = Boolean(selfUserId && sender && selfUserId === sender);
		logger.warn("Failed to decrypt message", {
			roomId,
			eventId: event.event_id,
			sender,
			senderMatchesOwnUser,
			error: error.message
		});
		if (senderMatchesOwnUser) logger.warn(formatMatrixSelfDecryptionHint(auth.accountId), {
			roomId,
			eventId: event.event_id,
			sender
		});
		logVerboseMessage(`matrix: failed decrypt room=${roomId} id=${event.event_id ?? "unknown"} error=${error.message}`);
	});
	client.on("verification.summary", (summary) => {
		routeVerificationSummary(summary);
	});
	client.on("room.invite", (roomId, event) => {
		directTracker?.invalidateRoom(roomId);
		const eventId = event?.event_id ?? "unknown";
		const sender = event?.sender ?? "unknown";
		const invitee = typeof event?.state_key === "string" ? event.state_key.trim() : "";
		const senderIsInvitee = typeof event?.sender === "string" && invitee && event.sender.trim() === invitee;
		const isDirect = (event?.content)?.is_direct === true;
		if (typeof event?.sender === "string" && event.sender.trim() && !senderIsInvitee) directTracker?.rememberInvite?.(roomId, event.sender);
		logVerboseMessage(`matrix: invite room=${roomId} sender=${sender} direct=${String(isDirect)} id=${eventId}`);
	});
	client.on("room.join", (roomId, event) => {
		directTracker?.invalidateRoom(roomId);
		logVerboseMessage(`matrix: join room=${roomId} id=${event?.event_id ?? "unknown"}`);
	});
	client.on("room.event", (roomId, event) => {
		const eventType = event?.type ?? "unknown";
		if (eventType === EventType.RoomMessageEncrypted) {
			logVerboseMessage(`matrix: encrypted raw event room=${roomId} id=${event?.event_id ?? "unknown"}`);
			if (auth.encryption !== true && !warnedEncryptedRooms.has(roomId)) {
				warnedEncryptedRooms.add(roomId);
				const warning = formatMatrixEncryptedEventDisabledWarning(cfg, auth.accountId);
				logger.warn(warning, { roomId });
			}
			if (auth.encryption === true && !client.crypto && !warnedCryptoMissingRooms.has(roomId)) {
				warnedCryptoMissingRooms.add(roomId);
				const warning = `matrix: encryption enabled but crypto is unavailable; ${formatNativeDependencyHint({
					packageName: "@matrix-org/matrix-sdk-crypto-nodejs",
					manager: "pnpm",
					downloadCommand: "node node_modules/@matrix-org/matrix-sdk-crypto-nodejs/download-lib.js"
				})}`;
				logger.warn(warning, { roomId });
			}
			return;
		}
		if (eventType === EventType.RoomMember) {
			directTracker?.invalidateRoom(roomId);
			const membership = (event?.content)?.membership;
			logVerboseMessage(`matrix: member event room=${roomId} stateKey=${event.state_key ?? ""} membership=${membership ?? "unknown"}`);
		}
		if (eventType === EventType.Reaction) {
			onRoomMessage(roomId, event);
			return;
		}
		routeVerificationEvent(roomId, event);
	});
}
//#endregion
//#region extensions/matrix/src/matrix/draft-stream.ts
const DEFAULT_THROTTLE_MS = 1e3;
function createMatrixDraftStream(params) {
	const { roomId, client, cfg, threadId, accountId, log } = params;
	let currentEventId;
	let lastSentText = "";
	let stopped = false;
	let sendFailed = false;
	let finalizeInPlaceBlocked = false;
	let replyToId = params.replyToId;
	const sendOrEdit = async (text) => {
		const trimmed = text.trimEnd();
		if (!trimmed) return false;
		const preparedText = prepareMatrixSingleText(trimmed, {
			cfg,
			accountId
		});
		if (!preparedText.fitsInSingleEvent) {
			finalizeInPlaceBlocked = true;
			if (!currentEventId) sendFailed = true;
			stopped = true;
			log?.(`draft-stream: preview exceeded single-event limit (${preparedText.convertedText.length} > ${preparedText.singleEventLimit})`);
			return false;
		}
		if (sendFailed) return false;
		if (preparedText.trimmedText === lastSentText) return true;
		try {
			if (!currentEventId) {
				currentEventId = (await sendSingleTextMessageMatrix(roomId, preparedText.trimmedText, {
					client,
					cfg,
					replyToId,
					threadId,
					accountId
				})).messageId;
				lastSentText = preparedText.trimmedText;
				log?.(`draft-stream: created message ${currentEventId}`);
			} else {
				await editMessageMatrix(roomId, currentEventId, preparedText.trimmedText, {
					client,
					cfg,
					threadId,
					accountId
				});
				lastSentText = preparedText.trimmedText;
			}
			return true;
		} catch (err) {
			log?.(`draft-stream: send/edit failed: ${String(err)}`);
			if (err instanceof Error && err.message.startsWith("Matrix single-message text exceeds limit")) finalizeInPlaceBlocked = true;
			if (!currentEventId) sendFailed = true;
			stopped = true;
			return false;
		}
	};
	const loop = createDraftStreamLoop({
		throttleMs: DEFAULT_THROTTLE_MS,
		isStopped: () => stopped,
		sendOrEditStreamMessage: sendOrEdit
	});
	log?.(`draft-stream: ready (throttleMs=${DEFAULT_THROTTLE_MS})`);
	const stop = async () => {
		await loop.flush();
		stopped = true;
		return currentEventId;
	};
	const reset = () => {
		replyToId = params.preserveReplyId ? params.replyToId : void 0;
		currentEventId = void 0;
		lastSentText = "";
		stopped = false;
		sendFailed = false;
		finalizeInPlaceBlocked = false;
		loop.resetPending();
		loop.resetThrottleWindow();
	};
	return {
		update: (text) => {
			if (stopped) return;
			loop.update(text);
		},
		flush: loop.flush,
		stop,
		reset,
		eventId: () => currentEventId,
		lastSentText: () => lastSentText,
		mustDeliverFinalNormally: () => sendFailed || finalizeInPlaceBlocked
	};
}
//#endregion
//#region extensions/matrix/src/matrix/monitor/ack-config.ts
function resolveMatrixAckReactionConfig(params) {
	const matrixConfig = params.cfg.channels?.matrix;
	const accountConfig = resolveMatrixAccountConfig({
		cfg: params.cfg,
		accountId: params.accountId
	});
	return {
		ackReaction: resolveAckReaction(params.cfg, params.agentId, {
			channel: "matrix",
			accountId: params.accountId ?? void 0
		}).trim(),
		ackReactionScope: accountConfig.ackReactionScope ?? matrixConfig?.ackReactionScope ?? params.cfg.messages?.ackReactionScope ?? "group-mentions"
	};
}
//#endregion
//#region extensions/matrix/src/matrix/monitor/location.ts
function parseGeoUri(value) {
	const trimmed = value.trim();
	if (!trimmed) return null;
	if (!trimmed.toLowerCase().startsWith("geo:")) return null;
	const [coordsPart, ...paramParts] = trimmed.slice(4).split(";");
	const coords = coordsPart.split(",");
	if (coords.length < 2) return null;
	const latitude = Number.parseFloat(coords[0] ?? "");
	const longitude = Number.parseFloat(coords[1] ?? "");
	if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
	const params = /* @__PURE__ */ new Map();
	for (const part of paramParts) {
		const segment = part.trim();
		if (!segment) continue;
		const eqIndex = segment.indexOf("=");
		const rawKey = eqIndex === -1 ? segment : segment.slice(0, eqIndex);
		const rawValue = eqIndex === -1 ? "" : segment.slice(eqIndex + 1);
		const key = rawKey.trim().toLowerCase();
		if (!key) continue;
		const valuePart = rawValue.trim();
		params.set(key, valuePart ? decodeURIComponent(valuePart) : "");
	}
	const accuracyRaw = params.get("u");
	const accuracy = accuracyRaw ? Number.parseFloat(accuracyRaw) : void 0;
	return {
		latitude,
		longitude,
		accuracy: Number.isFinite(accuracy) ? accuracy : void 0
	};
}
function resolveMatrixLocation(params) {
	const { eventType, content } = params;
	if (!(eventType === EventType.Location || eventType === EventType.RoomMessage && content.msgtype === EventType.Location)) return null;
	const geoUri = typeof content.geo_uri === "string" ? content.geo_uri.trim() : "";
	if (!geoUri) return null;
	const parsed = parseGeoUri(geoUri);
	if (!parsed) return null;
	const caption = typeof content.body === "string" ? content.body.trim() : "";
	const location = {
		latitude: parsed.latitude,
		longitude: parsed.longitude,
		accuracy: parsed.accuracy,
		caption: caption || void 0,
		source: "pin",
		isLive: false
	};
	return {
		text: formatLocationText(location),
		context: toLocationContext(location)
	};
}
//#endregion
//#region extensions/matrix/src/matrix/monitor/media.ts
const MATRIX_MEDIA_DOWNLOAD_IDLE_TIMEOUT_MS = 3e4;
async function fetchMatrixMediaBuffer(params) {
	try {
		return { buffer: await params.client.downloadContent(params.mxcUrl, {
			maxBytes: params.maxBytes,
			readIdleTimeoutMs: MATRIX_MEDIA_DOWNLOAD_IDLE_TIMEOUT_MS
		}) };
	} catch (err) {
		throw new Error(`Matrix media download failed: ${String(err)}`, { cause: err });
	}
}
/**
* Download and decrypt encrypted media from a Matrix room.
* Uses the Matrix crypto adapter's decryptMedia helper.
*/
async function fetchEncryptedMediaBuffer(params) {
	if (!params.client.crypto) throw new Error("Cannot decrypt media: crypto not enabled");
	const decrypted = await params.client.crypto.decryptMedia(params.file, {
		maxBytes: params.maxBytes,
		readIdleTimeoutMs: MATRIX_MEDIA_DOWNLOAD_IDLE_TIMEOUT_MS
	});
	if (decrypted.byteLength > params.maxBytes) throw new Error("Matrix media exceeds configured size limit");
	return { buffer: decrypted };
}
async function downloadMatrixMedia(params) {
	let fetched;
	if (typeof params.sizeBytes === "number" && params.sizeBytes > params.maxBytes) throw new Error("Matrix media exceeds configured size limit");
	if (params.file) fetched = await fetchEncryptedMediaBuffer({
		client: params.client,
		file: params.file,
		maxBytes: params.maxBytes
	});
	else fetched = await fetchMatrixMediaBuffer({
		client: params.client,
		mxcUrl: params.mxcUrl,
		maxBytes: params.maxBytes
	});
	if (!fetched) return null;
	const headerType = params.contentType ?? void 0;
	const saved = await getMatrixRuntime().channel.media.saveMediaBuffer(fetched.buffer, headerType, "inbound", params.maxBytes, params.originalFilename);
	return {
		path: saved.path,
		contentType: saved.contentType,
		placeholder: "[matrix media]"
	};
}
//#endregion
//#region extensions/matrix/src/matrix/monitor/mentions.ts
const HTML_ENTITY_REPLACEMENTS = {
	amp: "&",
	apos: "'",
	gt: ">",
	lt: "<",
	nbsp: " ",
	quot: "\""
};
const MAX_UNICODE_SCALAR_VALUE = 1114111;
function decodeNumericHtmlEntity(match, rawValue, radix) {
	const codePoint = Number.parseInt(rawValue, radix);
	if (!Number.isSafeInteger(codePoint) || codePoint < 0 || codePoint > MAX_UNICODE_SCALAR_VALUE || codePoint >= 55296 && codePoint <= 57343) return match;
	return String.fromCodePoint(codePoint);
}
function decodeHtmlEntities(value) {
	return value.replace(/&(#x?[0-9a-f]+|\w+);/gi, (match, entity) => {
		const normalized = entity.toLowerCase();
		if (normalized.startsWith("#x")) return decodeNumericHtmlEntity(match, normalized.slice(2), 16);
		if (normalized.startsWith("#")) return decodeNumericHtmlEntity(match, normalized.slice(1), 10);
		return HTML_ENTITY_REPLACEMENTS[normalized] ?? match;
	});
}
function normalizeVisibleMentionText(value) {
	return decodeHtmlEntities(value.replace(/<[^>]+>/g, " ").replace(/[\u200b-\u200f\u202a-\u202e\u2060-\u206f]/g, "")).replace(/\s+/g, " ").trim().toLowerCase();
}
function extractVisibleMentionText(value) {
	return normalizeVisibleMentionText(value ?? "");
}
function resolveMatrixUserLocalpart(userId) {
	const trimmed = userId.trim();
	if (!trimmed.startsWith("@")) return null;
	const colonIndex = trimmed.indexOf(":");
	if (colonIndex <= 1) return null;
	return trimmed.slice(1, colonIndex).trim() || null;
}
function isVisibleMentionLabel(params) {
	const cleaned = extractVisibleMentionText(params.text);
	if (!cleaned) return false;
	if (params.mentionRegexes.some((pattern) => pattern.test(cleaned))) return true;
	const localpart = resolveMatrixUserLocalpart(params.userId);
	return [
		extractVisibleMentionText(params.userId),
		localpart ? extractVisibleMentionText(localpart) : null,
		localpart ? extractVisibleMentionText(`@${localpart}`) : null,
		params.displayName ? extractVisibleMentionText(params.displayName) : null
	].filter((value) => Boolean(value)).includes(cleaned);
}
function hasVisibleRoomMention(value) {
	const cleaned = extractVisibleMentionText(value);
	return /(^|[^a-z0-9_])@room\b/i.test(cleaned);
}
/**
* Check if formatted_body contains a matrix.to link whose visible label still
* looks like a real mention for the given user. Do not trust href alone, since
* senders can hide arbitrary matrix.to links behind unrelated link text.
* Many Matrix clients (including Element) use HTML links in formatted_body instead of
* or in addition to the m.mentions field.
*/
function checkFormattedBodyMention(params) {
	if (!params.formattedBody || !params.userId) return false;
	for (const match of params.formattedBody.matchAll(/<a\b[^>]*href=(["'])(https:\/\/matrix\.to\/#[^"']+)\1[^>]*>(.*?)<\/a>/gis)) {
		const href = match[2];
		const visibleLabel = match[3] ?? "";
		if (!href) continue;
		try {
			const parsed = new URL(href);
			if (decodeURIComponent(parsed.hash.replace(/^#\/?/, "").trim()) !== params.userId.trim()) continue;
			if (isVisibleMentionLabel({
				text: visibleLabel,
				userId: params.userId,
				mentionRegexes: params.mentionRegexes,
				displayName: params.displayName
			})) return true;
		} catch {
			continue;
		}
	}
	return false;
}
function resolveMentions(params) {
	const mentions = params.content["m.mentions"];
	const mentionedUsers = Array.isArray(mentions?.user_ids) ? new Set(mentions.user_ids) : /* @__PURE__ */ new Set();
	const textMentioned = getMatrixRuntime().channel.mentions.matchesMentionPatterns(params.text ?? "", params.mentionRegexes);
	const visibleRoomMention = hasVisibleRoomMention(params.text) || hasVisibleRoomMention(params.content.formatted_body);
	const mentionedInFormattedBody = params.userId ? checkFormattedBodyMention({
		formattedBody: params.content.formatted_body,
		userId: params.userId,
		displayName: params.displayName,
		mentionRegexes: params.mentionRegexes
	}) : false;
	const metadataBackedUserMention = Boolean(params.userId && mentionedUsers.has(params.userId) && (mentionedInFormattedBody || textMentioned));
	const metadataBackedRoomMention = Boolean(mentions?.room) && visibleRoomMention;
	const explicitMention = mentionedInFormattedBody || metadataBackedUserMention || metadataBackedRoomMention;
	return {
		wasMentioned: explicitMention || textMentioned || visibleRoomMention,
		hasExplicitMention: explicitMention
	};
}
//#endregion
//#region extensions/matrix/src/matrix/monitor/threads.ts
function resolveMatrixThreadSessionKeys(params) {
	return resolveThreadSessionKeys({
		...params,
		normalizeThreadId: (threadId) => threadId
	});
}
function resolveMatrixRelatedReplyToEventId(relates) {
	if (!relates || typeof relates !== "object") return;
	if ("m.in_reply_to" in relates && typeof relates["m.in_reply_to"] === "object" && relates["m.in_reply_to"] && "event_id" in relates["m.in_reply_to"] && typeof relates["m.in_reply_to"].event_id === "string") return relates["m.in_reply_to"].event_id;
}
function resolveMatrixThreadRouting(params) {
	const effectiveThreadReplies = params.isDirectMessage && params.dmThreadReplies !== void 0 ? params.dmThreadReplies : params.threadReplies;
	const messageId = params.messageId.trim();
	const threadRootId = params.threadRootId?.trim();
	const inboundThreadId = threadRootId && threadRootId !== messageId ? threadRootId : void 0;
	return { threadId: effectiveThreadReplies === "off" ? void 0 : effectiveThreadReplies === "inbound" ? inboundThreadId : inboundThreadId ?? (messageId || void 0) };
}
function resolveMatrixThreadRootId(params) {
	const relates = params.content["m.relates_to"];
	if (!relates || typeof relates !== "object") return;
	if ("rel_type" in relates && relates.rel_type === RelationType.Thread) {
		if ("event_id" in relates && typeof relates.event_id === "string") return relates.event_id;
		return resolveMatrixRelatedReplyToEventId(relates);
	}
}
function resolveMatrixReplyToEventId(content) {
	return resolveMatrixRelatedReplyToEventId(content["m.relates_to"]);
}
//#endregion
//#region extensions/matrix/src/matrix/monitor/route.ts
function resolveMatrixInboundRoute(params) {
	const baseRoute = params.resolveAgentRoute({
		cfg: params.cfg,
		channel: "matrix",
		accountId: params.accountId,
		peer: {
			kind: params.isDirectMessage ? "direct" : "channel",
			id: params.isDirectMessage ? params.senderId : params.roomId
		},
		parentPeer: params.isDirectMessage ? {
			kind: "channel",
			id: params.roomId
		} : void 0
	});
	const bindingConversationId = params.threadId ?? params.roomId;
	const bindingParentConversationId = params.threadId ? params.roomId : void 0;
	const runtimeBinding = getSessionBindingService().resolveByConversation({
		channel: "matrix",
		accountId: params.accountId,
		conversationId: bindingConversationId,
		parentConversationId: bindingParentConversationId
	});
	const boundSessionKey = runtimeBinding?.targetSessionKey?.trim();
	if (runtimeBinding && boundSessionKey) return {
		route: {
			...baseRoute,
			sessionKey: boundSessionKey,
			agentId: resolveAgentIdFromSessionKey(boundSessionKey) || baseRoute.agentId,
			lastRoutePolicy: deriveLastRoutePolicy({
				sessionKey: boundSessionKey,
				mainSessionKey: baseRoute.mainSessionKey
			}),
			matchedBy: "binding.channel"
		},
		configuredBinding: null,
		runtimeBindingId: runtimeBinding.bindingId
	};
	const configuredBinding = runtimeBinding == null ? resolveConfiguredAcpBindingRecord({
		cfg: params.cfg,
		channel: "matrix",
		accountId: params.accountId,
		conversationId: bindingConversationId,
		parentConversationId: bindingParentConversationId
	}) : null;
	const configuredSessionKey = configuredBinding?.record.targetSessionKey?.trim();
	const effectiveRoute = configuredBinding && configuredSessionKey ? {
		...baseRoute,
		sessionKey: configuredSessionKey,
		agentId: resolveAgentIdFromSessionKey(configuredSessionKey) || configuredBinding.spec.agentId || baseRoute.agentId,
		lastRoutePolicy: deriveLastRoutePolicy({
			sessionKey: configuredSessionKey,
			mainSessionKey: baseRoute.mainSessionKey
		}),
		matchedBy: "binding.channel"
	} : baseRoute;
	if (!configuredBinding && !configuredSessionKey && params.threadId) {
		const threadKeys = resolveMatrixThreadSessionKeys({
			baseSessionKey: effectiveRoute.sessionKey,
			threadId: params.threadId,
			parentSessionKey: effectiveRoute.sessionKey
		});
		return {
			route: {
				...effectiveRoute,
				sessionKey: threadKeys.sessionKey,
				mainSessionKey: threadKeys.parentSessionKey ?? effectiveRoute.sessionKey,
				lastRoutePolicy: deriveLastRoutePolicy({
					sessionKey: threadKeys.sessionKey,
					mainSessionKey: threadKeys.parentSessionKey ?? effectiveRoute.sessionKey
				})
			},
			configuredBinding,
			runtimeBindingId: null
		};
	}
	return {
		route: effectiveRoute,
		configuredBinding,
		runtimeBindingId: null
	};
}
//#endregion
//#region extensions/matrix/src/matrix/monitor/reaction-events.ts
function resolveMatrixReactionNotificationMode(params) {
	const matrixConfig = params.cfg.channels?.matrix;
	return resolveMatrixAccountConfig({
		cfg: params.cfg,
		accountId: params.accountId
	}).reactionNotifications ?? matrixConfig?.reactionNotifications ?? "own";
}
async function handleInboundMatrixReaction(params) {
	const notificationMode = resolveMatrixReactionNotificationMode({
		cfg: params.cfg,
		accountId: params.accountId
	});
	if (notificationMode === "off") return;
	const reaction = extractMatrixReactionAnnotation(params.event.content);
	if (!reaction?.eventId) return;
	const targetEvent = await params.client.getEvent(params.roomId, reaction.eventId).catch((err) => {
		params.logVerboseMessage(`matrix: failed resolving reaction target room=${params.roomId} id=${reaction.eventId}: ${String(err)}`);
		return null;
	});
	const targetSender = targetEvent && typeof targetEvent.sender === "string" ? targetEvent.sender.trim() : "";
	if (!targetSender) return;
	if (notificationMode === "own" && targetSender !== params.selfUserId) return;
	const targetContent = targetEvent && targetEvent.content && typeof targetEvent.content === "object" ? targetEvent.content : void 0;
	const threadRootId = targetContent ? resolveMatrixThreadRootId({
		event: targetEvent,
		content: targetContent
	}) : void 0;
	const accountConfig = resolveMatrixAccountConfig({
		cfg: params.cfg,
		accountId: params.accountId
	});
	const thread = resolveMatrixThreadRouting({
		isDirectMessage: params.isDirectMessage,
		threadReplies: accountConfig.threadReplies ?? "inbound",
		dmThreadReplies: accountConfig.dm?.threadReplies,
		messageId: reaction.eventId,
		threadRootId
	});
	const { route, runtimeBindingId } = resolveMatrixInboundRoute({
		cfg: params.cfg,
		accountId: params.accountId,
		roomId: params.roomId,
		senderId: params.senderId,
		isDirectMessage: params.isDirectMessage,
		threadId: thread.threadId,
		eventTs: params.event.origin_server_ts,
		resolveAgentRoute: params.core.channel.routing.resolveAgentRoute
	});
	if (runtimeBindingId) getSessionBindingService().touch(runtimeBindingId, params.event.origin_server_ts);
	const text = `Matrix reaction added: ${reaction.key} by ${params.senderLabel} on msg ${reaction.eventId}`;
	params.core.system.enqueueSystemEvent(text, {
		sessionKey: route.sessionKey,
		contextKey: `matrix:reaction:add:${params.roomId}:${reaction.eventId}:${params.senderId}:${reaction.key}`
	});
	params.logVerboseMessage(`matrix: reaction event enqueued room=${params.roomId} target=${reaction.eventId} sender=${params.senderId} emoji=${reaction.key}`);
}
//#endregion
//#region extensions/matrix/src/matrix/monitor/replies.ts
const THINKING_TAG_RE = /<\s*\/?\s*(?:think(?:ing)?|thought|antthinking)\b[^<>]*>/gi;
const THINKING_BLOCK_RE = /<\s*(?:think(?:ing)?|thought|antthinking)\b[^<>]*>[\s\S]*?<\s*\/\s*(?:think(?:ing)?|thought|antthinking)\s*>/gi;
function shouldSuppressReasoningReplyText(text) {
	if (typeof text !== "string") return false;
	const trimmedStart = text.trimStart();
	if (!trimmedStart) return false;
	if (trimmedStart.toLowerCase().startsWith("reasoning:")) return true;
	THINKING_TAG_RE.lastIndex = 0;
	if (!THINKING_TAG_RE.test(text)) return false;
	THINKING_BLOCK_RE.lastIndex = 0;
	const withoutThinkingBlocks = text.replace(THINKING_BLOCK_RE, "");
	THINKING_TAG_RE.lastIndex = 0;
	return !withoutThinkingBlocks.replace(THINKING_TAG_RE, "").trim();
}
async function deliverMatrixReplies(params) {
	const core = getMatrixRuntime();
	const tableMode = params.tableMode ?? core.channel.text.resolveMarkdownTableMode({
		cfg: params.cfg,
		channel: "matrix",
		accountId: params.accountId
	});
	const logVerbose = (message) => {
		if (core.logging.shouldLogVerbose()) params.runtime.log?.(message);
	};
	let hasReplied = false;
	for (const reply of params.replies) {
		if (reply.isReasoning === true || shouldSuppressReasoningReplyText(reply.text)) {
			logVerbose("matrix reply suppressed as reasoning-only");
			continue;
		}
		const hasMedia = Boolean(reply?.mediaUrl) || (reply?.mediaUrls?.length ?? 0) > 0;
		if (!reply?.text && !hasMedia) {
			if (reply?.audioAsVoice) {
				logVerbose("matrix reply has audioAsVoice without media/text; skipping");
				continue;
			}
			params.runtime.error?.("matrix reply missing text/media");
			continue;
		}
		const replyToIdRaw = reply.replyToId?.trim();
		const replyToId = params.threadId || params.replyToMode === "off" ? void 0 : replyToIdRaw;
		const rawText = reply.text ?? "";
		const mediaList = reply.mediaUrls?.length ? reply.mediaUrls : reply.mediaUrl ? [reply.mediaUrl] : [];
		const shouldIncludeReply = (id) => Boolean(id) && (params.replyToMode === "all" || !hasReplied);
		const replyToIdForReply = shouldIncludeReply(replyToId) ? replyToId : void 0;
		if (mediaList.length === 0) {
			let sentTextChunk = false;
			const { chunks } = chunkMatrixText(rawText, {
				cfg: params.cfg,
				accountId: params.accountId,
				tableMode
			});
			for (const chunk of chunks) {
				const trimmed = chunk.trim();
				if (!trimmed) continue;
				await sendMessageMatrix(params.roomId, trimmed, {
					client: params.client,
					cfg: params.cfg,
					replyToId: replyToIdForReply,
					threadId: params.threadId,
					accountId: params.accountId
				});
				sentTextChunk = true;
			}
			if (replyToIdForReply && !hasReplied && sentTextChunk) hasReplied = true;
			continue;
		}
		let first = true;
		for (const mediaUrl of mediaList) {
			const caption = first ? rawText : "";
			await sendMessageMatrix(params.roomId, caption, {
				client: params.client,
				cfg: params.cfg,
				mediaUrl,
				mediaLocalRoots: params.mediaLocalRoots,
				replyToId: replyToIdForReply,
				threadId: params.threadId,
				audioAsVoice: reply.audioAsVoice,
				accountId: params.accountId
			});
			first = false;
		}
		if (replyToIdForReply && !hasReplied) hasReplied = true;
	}
}
//#endregion
//#region extensions/matrix/src/matrix/monitor/context-summary.ts
function trimMatrixMaybeString(value) {
	if (typeof value !== "string") return;
	return value.trim() || void 0;
}
function summarizeMatrixMessageContextEvent(event) {
	if (isPollStartType(event.type)) {
		const pollSummary = parsePollStartContent(event.content);
		if (pollSummary) return formatPollAsText(pollSummary);
	}
	const content = event.content;
	return formatMatrixMessageText({
		body: resolveMatrixMessageBody({
			body: trimMatrixMaybeString(content.body),
			filename: trimMatrixMaybeString(content.filename),
			msgtype: trimMatrixMaybeString(content.msgtype)
		}),
		attachment: resolveMatrixMessageAttachment({
			body: trimMatrixMaybeString(content.body),
			filename: trimMatrixMaybeString(content.filename),
			msgtype: trimMatrixMaybeString(content.msgtype)
		})
	});
}
//#endregion
//#region extensions/matrix/src/matrix/monitor/reply-context.ts
const MAX_CACHED_REPLY_CONTEXTS = 256;
const MAX_REPLY_BODY_LENGTH = 500;
function truncateReplyBody(value) {
	if (value.length <= MAX_REPLY_BODY_LENGTH) return value;
	return `${value.slice(0, MAX_REPLY_BODY_LENGTH - 3)}...`;
}
function summarizeMatrixReplyEvent(event) {
	const body = summarizeMatrixMessageContextEvent(event);
	return body ? truncateReplyBody(body) : void 0;
}
/**
* Creates a cached resolver that fetches the body and sender of a replied-to
* Matrix event. This allows the agent to see the content of the message being
* replied to, not just its event ID.
*/
function createMatrixReplyContextResolver(params) {
	const cache = /* @__PURE__ */ new Map();
	const remember = (key, value) => {
		cache.set(key, value);
		if (cache.size > MAX_CACHED_REPLY_CONTEXTS) {
			const oldest = cache.keys().next().value;
			if (typeof oldest === "string") cache.delete(oldest);
		}
		return value;
	};
	return async (input) => {
		const cacheKey = `${input.roomId}:${input.eventId}`;
		const cached = cache.get(cacheKey);
		if (cached) {
			cache.delete(cacheKey);
			cache.set(cacheKey, cached);
			return cached;
		}
		const event = await params.client.getEvent(input.roomId, input.eventId).catch((err) => {
			params.logVerboseMessage(`matrix: failed resolving reply context room=${input.roomId} id=${input.eventId}: ${String(err)}`);
			return null;
		});
		if (!event) return {};
		const rawEvent = event;
		if (rawEvent.unsigned?.redacted_because) return remember(cacheKey, {});
		const replyToBody = summarizeMatrixReplyEvent(rawEvent);
		if (!replyToBody) return remember(cacheKey, {});
		const senderId = trimMatrixMaybeString(rawEvent.sender);
		return remember(cacheKey, {
			replyToBody,
			replyToSender: (senderId && await params.getMemberDisplayName(input.roomId, senderId).catch(() => void 0)) ?? senderId,
			replyToSenderId: senderId
		});
	};
}
//#endregion
//#region extensions/matrix/src/matrix/monitor/room-history.ts
/** Maximum entries retained per room (hard cap to bound memory). */
const DEFAULT_MAX_QUEUE_SIZE = 200;
/** Maximum number of rooms to retain queues for (FIFO eviction beyond this). */
const DEFAULT_MAX_ROOM_QUEUES = 1e3;
/** Maximum number of (agentId, roomId) watermark entries to retain. */
const MAX_WATERMARK_ENTRIES = 5e3;
/** Maximum prepared trigger snapshots retained per room for retry reuse. */
const MAX_PREPARED_TRIGGER_ENTRIES = 500;
function createRoomHistoryTrackerInternal(maxQueueSize = DEFAULT_MAX_QUEUE_SIZE, maxRoomQueues = DEFAULT_MAX_ROOM_QUEUES, maxWatermarkEntries = MAX_WATERMARK_ENTRIES, maxPreparedTriggerEntries = MAX_PREPARED_TRIGGER_ENTRIES) {
	const roomQueues = /* @__PURE__ */ new Map();
	/** Maps `${agentId}:${roomId}` → absolute consumed-up-to index */
	const agentWatermarks = /* @__PURE__ */ new Map();
	let nextQueueGeneration = 1;
	function clearRoomWatermarks(roomId) {
		const roomSuffix = `:${roomId}`;
		for (const key of agentWatermarks.keys()) if (key.endsWith(roomSuffix)) agentWatermarks.delete(key);
	}
	function getOrCreateQueue(roomId) {
		let queue = roomQueues.get(roomId);
		if (!queue) {
			queue = {
				entries: [],
				baseIndex: 0,
				generation: nextQueueGeneration++,
				preparedTriggers: /* @__PURE__ */ new Map()
			};
			roomQueues.set(roomId, queue);
			if (roomQueues.size > maxRoomQueues) {
				const oldest = roomQueues.keys().next().value;
				if (oldest !== void 0) {
					roomQueues.delete(oldest);
					clearRoomWatermarks(oldest);
				}
			}
		}
		return queue;
	}
	function appendToQueue(queue, entry) {
		queue.entries.push(entry);
		if (queue.entries.length > maxQueueSize) {
			const overflow = queue.entries.length - maxQueueSize;
			queue.entries.splice(0, overflow);
			queue.baseIndex += overflow;
		}
		return {
			snapshotIdx: queue.baseIndex + queue.entries.length,
			queueGeneration: queue.generation
		};
	}
	function wmKey(agentId, roomId) {
		return `${agentId}:${roomId}`;
	}
	function preparedTriggerKey(agentId, messageId) {
		if (!messageId?.trim()) return null;
		return `${agentId}:${messageId.trim()}`;
	}
	function rememberWatermark(key, snapshotIdx) {
		const nextSnapshotIdx = Math.max(agentWatermarks.get(key) ?? 0, snapshotIdx);
		if (agentWatermarks.has(key)) agentWatermarks.delete(key);
		agentWatermarks.set(key, nextSnapshotIdx);
		if (agentWatermarks.size > maxWatermarkEntries) {
			const oldest = agentWatermarks.keys().next().value;
			if (oldest !== void 0) agentWatermarks.delete(oldest);
		}
	}
	function rememberPreparedTrigger(queue, retryKey, prepared) {
		if (queue.preparedTriggers.has(retryKey)) queue.preparedTriggers.delete(retryKey);
		queue.preparedTriggers.set(retryKey, prepared);
		if (queue.preparedTriggers.size > maxPreparedTriggerEntries) {
			const oldest = queue.preparedTriggers.keys().next().value;
			if (oldest !== void 0) queue.preparedTriggers.delete(oldest);
		}
		return prepared;
	}
	function computePendingHistory(queue, agentId, roomId, limit) {
		if (limit <= 0 || queue.entries.length === 0) return [];
		const wm = agentWatermarks.get(wmKey(agentId, roomId)) ?? 0;
		const startRel = Math.max(wm, queue.baseIndex) - queue.baseIndex;
		const available = queue.entries.slice(startRel);
		return available.length > limit ? available.slice(-limit) : available;
	}
	return {
		recordPending(roomId, entry) {
			appendToQueue(getOrCreateQueue(roomId), entry);
		},
		getPendingHistory(agentId, roomId, limit) {
			const queue = roomQueues.get(roomId);
			if (!queue) return [];
			return computePendingHistory(queue, agentId, roomId, limit);
		},
		recordTrigger(roomId, entry) {
			return appendToQueue(getOrCreateQueue(roomId), entry);
		},
		prepareTrigger(agentId, roomId, limit, entry) {
			const queue = getOrCreateQueue(roomId);
			const retryKey = preparedTriggerKey(agentId, entry.messageId);
			if (retryKey) {
				const prepared = queue.preparedTriggers.get(retryKey);
				if (prepared) return rememberPreparedTrigger(queue, retryKey, prepared);
			}
			const prepared = {
				history: computePendingHistory(queue, agentId, roomId, limit),
				...appendToQueue(queue, entry)
			};
			if (retryKey) return rememberPreparedTrigger(queue, retryKey, prepared);
			return prepared;
		},
		consumeHistory(agentId, roomId, snapshot, messageId) {
			const key = wmKey(agentId, roomId);
			const queue = roomQueues.get(roomId);
			if (!queue) {
				agentWatermarks.delete(key);
				return;
			}
			if (queue.generation !== snapshot.queueGeneration) return;
			rememberWatermark(key, snapshot.snapshotIdx);
			const retryKey = preparedTriggerKey(agentId, messageId);
			if (queue && retryKey) queue.preparedTriggers.delete(retryKey);
		}
	};
}
function createRoomHistoryTracker(maxQueueSize = DEFAULT_MAX_QUEUE_SIZE, maxRoomQueues = DEFAULT_MAX_ROOM_QUEUES, maxWatermarkEntries = MAX_WATERMARK_ENTRIES, maxPreparedTriggerEntries = MAX_PREPARED_TRIGGER_ENTRIES) {
	const tracker = createRoomHistoryTrackerInternal(maxQueueSize, maxRoomQueues, maxWatermarkEntries, maxPreparedTriggerEntries);
	return {
		recordPending: tracker.recordPending,
		prepareTrigger: tracker.prepareTrigger,
		consumeHistory: tracker.consumeHistory
	};
}
//#endregion
//#region extensions/matrix/src/matrix/monitor/thread-context.ts
const MAX_TRACKED_THREAD_STARTERS = 256;
const MAX_THREAD_STARTER_BODY_LENGTH = 500;
function truncateThreadStarterBody(value) {
	if (value.length <= MAX_THREAD_STARTER_BODY_LENGTH) return value;
	return `${value.slice(0, MAX_THREAD_STARTER_BODY_LENGTH - 3)}...`;
}
function summarizeMatrixThreadStarterEvent(event) {
	const body = summarizeMatrixMessageContextEvent(event);
	if (body) return truncateThreadStarterBody(body);
	const content = event.content;
	const msgtype = trimMatrixMaybeString(content.msgtype);
	if (msgtype) return `Matrix ${msgtype} message`;
	const eventType = trimMatrixMaybeString(event.type);
	return eventType ? `Matrix ${eventType} event` : void 0;
}
function formatMatrixThreadStarterBody(params) {
	const senderLabel = params.senderName ?? params.senderId ?? "unknown sender";
	const lines = [`Matrix thread root ${params.threadRootId} from ${senderLabel}:`];
	if (params.summary) lines.push(params.summary);
	return lines.join("\n");
}
function createMatrixThreadContextResolver(params) {
	const cache = /* @__PURE__ */ new Map();
	const remember = (key, value) => {
		cache.set(key, value);
		if (cache.size > MAX_TRACKED_THREAD_STARTERS) {
			const oldest = cache.keys().next().value;
			if (typeof oldest === "string") cache.delete(oldest);
		}
		return value;
	};
	return async (input) => {
		const cacheKey = `${input.roomId}:${input.threadRootId}`;
		const cached = cache.get(cacheKey);
		if (cached) return cached;
		const rootEvent = await params.client.getEvent(input.roomId, input.threadRootId).catch((err) => {
			params.logVerboseMessage(`matrix: failed resolving thread root room=${input.roomId} id=${input.threadRootId}: ${String(err)}`);
			return null;
		});
		if (!rootEvent) return { threadStarterBody: `Matrix thread root ${input.threadRootId}` };
		const rawEvent = rootEvent;
		const senderId = trimMatrixMaybeString(rawEvent.sender);
		const senderName = senderId && await params.getMemberDisplayName(input.roomId, senderId).catch(() => void 0);
		const senderLabel = senderName ?? senderId;
		const summary = summarizeMatrixThreadStarterEvent(rawEvent);
		return remember(cacheKey, {
			threadStarterBody: formatMatrixThreadStarterBody({
				threadRootId: input.threadRootId,
				senderId,
				senderName,
				summary
			}),
			senderId,
			senderLabel,
			summary
		});
	};
}
//#endregion
//#region extensions/matrix/src/matrix/monitor/handler.ts
const ALLOW_FROM_STORE_CACHE_TTL_MS = 3e4;
const PAIRING_REPLY_COOLDOWN_MS = 5 * 6e4;
const MAX_TRACKED_PAIRING_REPLY_SENDERS = 512;
function resolveMatrixMentionPrecheckText(params) {
	if (params.locationText?.trim()) return params.locationText.trim();
	if (typeof params.content.body === "string" && params.content.body.trim()) return params.content.body.trim();
	if (isPollStartType(params.eventType)) {
		const parsed = parsePollStartContent(params.content);
		if (parsed) return formatPollAsText(parsed);
	}
	return "";
}
function resolveMatrixInboundBodyText(params) {
	if (params.mediaPlaceholder) return params.rawBody || params.mediaPlaceholder;
	if (!params.mediaDownloadFailed || !params.hadMediaUrl) return params.rawBody;
	return formatMatrixMediaUnavailableText({
		body: params.rawBody,
		filename: params.filename,
		msgtype: params.msgtype
	});
}
function resolveMatrixPendingHistoryText(params) {
	if (params.mentionPrecheckText) return params.mentionPrecheckText;
	if (!params.mediaUrl) return "";
	const body = typeof params.content.body === "string" ? params.content.body.trim() : void 0;
	const filename = typeof params.content.filename === "string" ? params.content.filename.trim() : void 0;
	const msgtype = typeof params.content.msgtype === "string" ? params.content.msgtype : void 0;
	return formatMatrixMessageText({
		body: resolveMatrixMessageBody({
			body,
			filename,
			msgtype
		}),
		attachment: resolveMatrixMessageAttachment({
			body,
			filename,
			msgtype
		})
	}) ?? "";
}
function resolveMatrixAllowBotsMode(value) {
	if (value === true) return "all";
	if (value === "mentions") return "mentions";
	return "off";
}
function createMatrixRoomMessageHandler(params) {
	const { client, core, cfg, accountId, runtime, logger, logVerboseMessage, allowFrom, groupAllowFrom = [], roomsConfig, accountAllowBots, configuredBotUserIds = /* @__PURE__ */ new Set(), groupPolicy, replyToMode, threadReplies, dmThreadReplies, streaming, blockStreamingEnabled, dmEnabled, dmPolicy, textLimit, mediaMaxBytes, historyLimit, startupMs, startupGraceMs, dropPreStartupMessages, inboundDeduper, directTracker, getRoomInfo, getMemberDisplayName, needsRoomAliasesForConfig } = params;
	let cachedStoreAllowFrom = null;
	const pairingReplySentAtMsBySender = /* @__PURE__ */ new Map();
	const resolveThreadContext = createMatrixThreadContextResolver({
		client,
		getMemberDisplayName,
		logVerboseMessage
	});
	const resolveReplyContext = createMatrixReplyContextResolver({
		client,
		getMemberDisplayName,
		logVerboseMessage
	});
	const roomHistoryTracker = createRoomHistoryTracker();
	const roomIngressTails = /* @__PURE__ */ new Map();
	const readStoreAllowFrom = async () => {
		const now = Date.now();
		if (cachedStoreAllowFrom && now < cachedStoreAllowFrom.expiresAtMs) return cachedStoreAllowFrom.value;
		const value = await core.channel.pairing.readAllowFromStore({
			channel: "matrix",
			env: process.env,
			accountId
		}).catch(() => []);
		cachedStoreAllowFrom = {
			value,
			expiresAtMs: now + ALLOW_FROM_STORE_CACHE_TTL_MS
		};
		return value;
	};
	const shouldSendPairingReply = (senderId, created) => {
		const now = Date.now();
		if (created) {
			pairingReplySentAtMsBySender.set(senderId, now);
			return true;
		}
		const lastSentAtMs = pairingReplySentAtMsBySender.get(senderId);
		if (typeof lastSentAtMs === "number" && now - lastSentAtMs < PAIRING_REPLY_COOLDOWN_MS) return false;
		pairingReplySentAtMsBySender.set(senderId, now);
		if (pairingReplySentAtMsBySender.size > MAX_TRACKED_PAIRING_REPLY_SENDERS) {
			const oldestSender = pairingReplySentAtMsBySender.keys().next().value;
			if (typeof oldestSender === "string") pairingReplySentAtMsBySender.delete(oldestSender);
		}
		return true;
	};
	const runRoomIngress = async (roomId, task) => {
		const previous = roomIngressTails.get(roomId) ?? Promise.resolve();
		let releaseCurrent;
		const current = new Promise((resolve) => {
			releaseCurrent = resolve;
		});
		const chain = previous.catch(() => {}).then(() => current);
		roomIngressTails.set(roomId, chain);
		await previous.catch(() => {});
		try {
			return await task();
		} finally {
			releaseCurrent();
			if (roomIngressTails.get(roomId) === chain) roomIngressTails.delete(roomId);
		}
	};
	return async (roomId, event) => {
		const eventId = typeof event.event_id === "string" ? event.event_id.trim() : "";
		let claimedInboundEvent = false;
		let draftStreamRef;
		try {
			const eventType = event.type;
			if (eventType === EventType.RoomMessageEncrypted) return;
			const isPollEvent = isPollEventType(eventType);
			const isReactionEvent = eventType === EventType.Reaction;
			const locationContent = event.content;
			const isLocationEvent = eventType === EventType.Location || eventType === EventType.RoomMessage && locationContent.msgtype === EventType.Location;
			if (eventType !== EventType.RoomMessage && !isPollEvent && !isLocationEvent && !isReactionEvent) return;
			logVerboseMessage(`matrix: inbound event room=${roomId} type=${eventType} id=${event.event_id ?? "unknown"}`);
			if (event.unsigned?.redacted_because) return;
			const senderId = event.sender;
			if (!senderId) return;
			const eventTs = event.origin_server_ts;
			const eventAge = event.unsigned?.age;
			const commitInboundEventIfClaimed = async () => {
				if (!claimedInboundEvent || !inboundDeduper || !eventId) return;
				await inboundDeduper.commitEvent({
					roomId,
					eventId
				});
				claimedInboundEvent = false;
			};
			const readIngressPrefix = async () => {
				const selfUserId = await client.getUserId();
				if (senderId === selfUserId) return;
				if (dropPreStartupMessages) {
					if (typeof eventTs === "number" && eventTs < startupMs - startupGraceMs) return;
					if (typeof eventTs !== "number" && typeof eventAge === "number" && eventAge > startupGraceMs) return;
				}
				let content = event.content;
				if (eventType === EventType.RoomMessage && isMatrixVerificationRoomMessage({
					msgtype: content.msgtype,
					body: content.body
				})) {
					logVerboseMessage(`matrix: skip verification/system room message room=${roomId}`);
					return;
				}
				const locationPayload = resolveMatrixLocation({
					eventType,
					content
				});
				const relates = content["m.relates_to"];
				if (relates && "rel_type" in relates && relates.rel_type === RelationType.Replace) return;
				if (eventId && inboundDeduper) {
					claimedInboundEvent = inboundDeduper.claimEvent({
						roomId,
						eventId
					});
					if (!claimedInboundEvent) {
						logVerboseMessage(`matrix: skip duplicate inbound event room=${roomId} id=${eventId}`);
						return;
					}
				}
				return {
					content,
					isDirectMessage: await directTracker.isDirectMessage({
						roomId,
						senderId,
						selfUserId
					}),
					locationPayload,
					selfUserId
				};
			};
			const continueIngress = async (params) => {
				let content = params.content;
				const isDirectMessage = params.isDirectMessage;
				const isRoom = !isDirectMessage;
				const { locationPayload, selfUserId } = params;
				if (isRoom && groupPolicy === "disabled") {
					await commitInboundEventIfClaimed();
					return;
				}
				const roomInfoForConfig = isRoom && needsRoomAliasesForConfig ? await getRoomInfo(roomId, { includeAliases: true }) : void 0;
				const roomAliasesForConfig = roomInfoForConfig ? [roomInfoForConfig.canonicalAlias ?? "", ...roomInfoForConfig.altAliases].filter(Boolean) : [];
				const roomConfigInfo = isRoom ? resolveMatrixRoomConfig({
					rooms: roomsConfig,
					roomId,
					aliases: roomAliasesForConfig
				}) : void 0;
				const roomConfig = roomConfigInfo?.config;
				const allowBotsMode = resolveMatrixAllowBotsMode(roomConfig?.allowBots ?? accountAllowBots);
				const isConfiguredBotSender = configuredBotUserIds.has(senderId);
				const roomMatchMeta = roomConfigInfo ? `matchKey=${roomConfigInfo.matchKey ?? "none"} matchSource=${roomConfigInfo.matchSource ?? "none"}` : "matchKey=none matchSource=none";
				if (isConfiguredBotSender && allowBotsMode === "off") {
					logVerboseMessage(`matrix: drop configured bot sender=${senderId} (allowBots=false${isDirectMessage ? "" : `, ${roomMatchMeta}`})`);
					await commitInboundEventIfClaimed();
					return;
				}
				if (isRoom && roomConfig && !roomConfigInfo?.allowed) {
					logVerboseMessage(`matrix: room disabled room=${roomId} (${roomMatchMeta})`);
					await commitInboundEventIfClaimed();
					return;
				}
				if (isRoom && groupPolicy === "allowlist") {
					if (!roomConfigInfo?.allowlistConfigured) {
						logVerboseMessage(`matrix: drop room message (no allowlist, ${roomMatchMeta})`);
						await commitInboundEventIfClaimed();
						return;
					}
					if (!roomConfig) {
						logVerboseMessage(`matrix: drop room message (not in allowlist, ${roomMatchMeta})`);
						await commitInboundEventIfClaimed();
						return;
					}
				}
				let senderNamePromise = null;
				const getSenderName = async () => {
					senderNamePromise ??= getMemberDisplayName(roomId, senderId).catch(() => senderId);
					return await senderNamePromise;
				};
				const { effectiveGroupAllowFrom, effectiveRoomUsers, groupAllowConfigured, directAllowMatch, roomUserMatch, groupAllowMatch, commandAuthorizers } = resolveMatrixMonitorAccessState({
					allowFrom,
					storeAllowFrom: await readStoreAllowFrom(),
					groupAllowFrom,
					roomUsers: roomConfig?.users ?? [],
					senderId,
					isRoom
				});
				if (isDirectMessage) {
					if (!dmEnabled || dmPolicy === "disabled") {
						await commitInboundEventIfClaimed();
						return;
					}
					if (dmPolicy !== "open") {
						const allowMatchMeta = formatAllowlistMatchMeta(directAllowMatch);
						if (!directAllowMatch.allowed) {
							if (!isReactionEvent && dmPolicy === "pairing") {
								const senderName = await getSenderName();
								const { code, created } = await core.channel.pairing.upsertPairingRequest({
									channel: "matrix",
									id: senderId,
									accountId,
									meta: { name: senderName }
								});
								if (shouldSendPairingReply(senderId, created)) {
									const pairingReply = core.channel.pairing.buildPairingReply({
										channel: "matrix",
										idLine: `Your Matrix user id: ${senderId}`,
										code
									});
									logVerboseMessage(created ? `matrix pairing request sender=${senderId} name=${senderName ?? "unknown"} (${allowMatchMeta})` : `matrix pairing reminder sender=${senderId} name=${senderName ?? "unknown"} (${allowMatchMeta})`);
									try {
										await sendMessageMatrix(`room:${roomId}`, created ? pairingReply : `${pairingReply}\n\nPairing request is still pending approval. Reusing existing code.`, {
											client,
											cfg,
											accountId
										});
										await commitInboundEventIfClaimed();
									} catch (err) {
										logVerboseMessage(`matrix pairing reply failed for ${senderId}: ${String(err)}`);
										return;
									}
								} else {
									logVerboseMessage(`matrix pairing reminder suppressed sender=${senderId} (cooldown)`);
									await commitInboundEventIfClaimed();
								}
							}
							if (isReactionEvent || dmPolicy !== "pairing") {
								logVerboseMessage(`matrix: blocked ${isReactionEvent ? "reaction" : "dm"} sender ${senderId} (dmPolicy=${dmPolicy}, ${allowMatchMeta})`);
								await commitInboundEventIfClaimed();
							}
							return;
						}
					}
				}
				if (isRoom && roomUserMatch && !roomUserMatch.allowed) {
					logVerboseMessage(`matrix: blocked sender ${senderId} (room users allowlist, ${roomMatchMeta}, ${formatAllowlistMatchMeta(roomUserMatch)})`);
					await commitInboundEventIfClaimed();
					return;
				}
				if (isRoom && groupPolicy === "allowlist" && effectiveRoomUsers.length === 0 && groupAllowConfigured && groupAllowMatch && !groupAllowMatch.allowed) {
					logVerboseMessage(`matrix: blocked sender ${senderId} (groupAllowFrom, ${roomMatchMeta}, ${formatAllowlistMatchMeta(groupAllowMatch)})`);
					await commitInboundEventIfClaimed();
					return;
				}
				if (isRoom) logVerboseMessage(`matrix: allow room ${roomId} (${roomMatchMeta})`);
				if (isReactionEvent) {
					await handleInboundMatrixReaction({
						client,
						core,
						cfg,
						accountId,
						roomId,
						event,
						senderId,
						senderLabel: await getSenderName(),
						selfUserId,
						isDirectMessage,
						logVerboseMessage
					});
					await commitInboundEventIfClaimed();
					return;
				}
				let pollSnapshotPromise = null;
				const getPollSnapshot = async () => {
					if (!isPollEvent) return null;
					pollSnapshotPromise ??= fetchMatrixPollSnapshot(client, roomId, event).catch((err) => {
						logVerboseMessage(`matrix: failed resolving poll snapshot room=${roomId} id=${event.event_id ?? "unknown"}: ${String(err)}`);
						return null;
					});
					return await pollSnapshotPromise;
				};
				const mentionPrecheckText = resolveMatrixMentionPrecheckText({
					eventType,
					content,
					locationText: locationPayload?.text
				});
				const contentUrl = "url" in content && typeof content.url === "string" ? content.url : void 0;
				const contentFile = "file" in content && content.file && typeof content.file === "object" ? content.file : void 0;
				const mediaUrl = contentUrl ?? contentFile?.url;
				const pendingHistoryText = resolveMatrixPendingHistoryText({
					mentionPrecheckText,
					content,
					mediaUrl
				});
				const pendingHistoryPollText = !pendingHistoryText && isPollEvent && historyLimit > 0 ? (await getPollSnapshot())?.text : "";
				if (!mentionPrecheckText && !mediaUrl && !isPollEvent) {
					await commitInboundEventIfClaimed();
					return;
				}
				const _messageId = event.event_id ?? "";
				const _threadRootId = resolveMatrixThreadRootId({
					event,
					content
				});
				const thread = resolveMatrixThreadRouting({
					isDirectMessage,
					threadReplies,
					dmThreadReplies,
					messageId: _messageId,
					threadRootId: _threadRootId
				});
				const { route: _route, configuredBinding: _configuredBinding, runtimeBindingId: _runtimeBindingId } = resolveMatrixInboundRoute({
					cfg,
					accountId,
					roomId,
					senderId,
					isDirectMessage,
					threadId: thread.threadId,
					eventTs: eventTs ?? void 0,
					resolveAgentRoute: core.channel.routing.resolveAgentRoute
				});
				const agentMentionRegexes = core.channel.mentions.buildMentionRegexes(cfg, _route.agentId);
				const selfDisplayName = content.formatted_body ? await getMemberDisplayName(roomId, selfUserId).catch(() => void 0) : void 0;
				const { wasMentioned, hasExplicitMention } = resolveMentions({
					content,
					userId: selfUserId,
					displayName: selfDisplayName,
					text: mentionPrecheckText,
					mentionRegexes: agentMentionRegexes
				});
				if (isConfiguredBotSender && allowBotsMode === "mentions" && !isDirectMessage && !wasMentioned) {
					logVerboseMessage(`matrix: drop configured bot sender=${senderId} (allowBots=mentions, missing mention, ${roomMatchMeta})`);
					await commitInboundEventIfClaimed();
					return;
				}
				const allowTextCommands = core.channel.commands.shouldHandleTextCommands({
					cfg,
					surface: "matrix"
				});
				const useAccessGroups = cfg.commands?.useAccessGroups !== false;
				const hasControlCommandInMessage = core.channel.text.hasControlCommand(mentionPrecheckText, cfg);
				const commandGate = resolveControlCommandGate({
					useAccessGroups,
					authorizers: commandAuthorizers,
					allowTextCommands,
					hasControlCommand: hasControlCommandInMessage
				});
				const commandAuthorized = commandGate.commandAuthorized;
				if (isRoom && commandGate.shouldBlock) {
					logInboundDrop({
						log: logVerboseMessage,
						channel: "matrix",
						reason: "control command (unauthorized)",
						target: senderId
					});
					await commitInboundEventIfClaimed();
					return;
				}
				const shouldRequireMention = isRoom ? roomConfig?.autoReply === true ? false : roomConfig?.autoReply === false ? true : typeof roomConfig?.requireMention === "boolean" ? roomConfig?.requireMention : true : false;
				const shouldBypassMention = allowTextCommands && isRoom && shouldRequireMention && !wasMentioned && !hasExplicitMention && commandAuthorized && hasControlCommandInMessage;
				const canDetectMention = agentMentionRegexes.length > 0 || hasExplicitMention;
				if (isRoom && shouldRequireMention && !wasMentioned && !shouldBypassMention) {
					const pendingHistoryBody = pendingHistoryText || pendingHistoryPollText;
					if (historyLimit > 0 && pendingHistoryBody) {
						const pendingEntry = {
							sender: senderId,
							body: pendingHistoryBody,
							timestamp: eventTs ?? void 0,
							messageId: _messageId
						};
						roomHistoryTracker.recordPending(roomId, pendingEntry);
					}
					logger.info("skipping room message", {
						roomId,
						reason: "no-mention"
					});
					await commitInboundEventIfClaimed();
					return;
				}
				if (isPollEvent) {
					const pollSnapshot = await getPollSnapshot();
					if (!pollSnapshot) return;
					content = {
						msgtype: "m.text",
						body: pollSnapshot.text
					};
				}
				let media = null;
				let mediaDownloadFailed = false;
				const finalContentUrl = "url" in content && typeof content.url === "string" ? content.url : void 0;
				const finalContentFile = "file" in content && content.file && typeof content.file === "object" ? content.file : void 0;
				const finalMediaUrl = finalContentUrl ?? finalContentFile?.url;
				const contentBody = typeof content.body === "string" ? content.body.trim() : "";
				const originalFilename = (typeof content.filename === "string" ? content.filename.trim() : "") || contentBody || void 0;
				const contentInfo = "info" in content && content.info && typeof content.info === "object" ? content.info : void 0;
				const contentType = contentInfo?.mimetype;
				const contentSize = typeof contentInfo?.size === "number" ? contentInfo.size : void 0;
				if (finalMediaUrl?.startsWith("mxc://")) try {
					media = await downloadMatrixMedia({
						client,
						mxcUrl: finalMediaUrl,
						contentType,
						sizeBytes: contentSize,
						maxBytes: mediaMaxBytes,
						file: finalContentFile,
						originalFilename
					});
				} catch (err) {
					mediaDownloadFailed = true;
					const errorText = err instanceof Error ? err.message : String(err);
					logVerboseMessage(`matrix: media download failed room=${roomId} id=${event.event_id ?? "unknown"} type=${content.msgtype} error=${errorText}`);
					logger.warn("matrix media download failed", {
						roomId,
						eventId: event.event_id,
						msgtype: content.msgtype,
						encrypted: Boolean(finalContentFile),
						error: errorText
					});
				}
				const bodyText = resolveMatrixInboundBodyText({
					rawBody: locationPayload?.text ?? contentBody,
					filename: typeof content.filename === "string" ? content.filename : void 0,
					mediaPlaceholder: media?.placeholder,
					msgtype: content.msgtype,
					hadMediaUrl: Boolean(finalMediaUrl),
					mediaDownloadFailed
				});
				if (!bodyText) {
					await commitInboundEventIfClaimed();
					return;
				}
				const senderName = await getSenderName();
				if (_configuredBinding) {
					if (!(await ensureConfiguredAcpBindingReady({
						cfg,
						configuredBinding: _configuredBinding
					})).ok) {
						logInboundDrop({
							log: logVerboseMessage,
							channel: "matrix",
							reason: "configured ACP binding unavailable",
							target: _configuredBinding.spec.conversationId
						});
						return;
					}
				}
				if (_runtimeBindingId) getSessionBindingService().touch(_runtimeBindingId, eventTs ?? void 0);
				const preparedTrigger = isRoom && historyLimit > 0 ? roomHistoryTracker.prepareTrigger(_route.agentId, roomId, historyLimit, {
					sender: senderName,
					body: bodyText,
					timestamp: eventTs ?? void 0,
					messageId: _messageId
				}) : void 0;
				return {
					route: _route,
					roomConfig,
					isDirectMessage,
					isRoom,
					shouldRequireMention,
					wasMentioned,
					shouldBypassMention,
					canDetectMention,
					commandAuthorized,
					inboundHistory: preparedTrigger?.history,
					senderName,
					bodyText,
					media,
					locationPayload,
					messageId: _messageId,
					triggerSnapshot: preparedTrigger,
					threadRootId: _threadRootId,
					thread,
					effectiveGroupAllowFrom,
					effectiveRoomUsers
				};
			};
			const ingressResult = historyLimit > 0 ? await runRoomIngress(roomId, async () => {
				const prefix = await readIngressPrefix();
				if (!prefix) return;
				if (prefix.isDirectMessage) return { deferredPrefix: prefix };
				return { ingressResult: await continueIngress(prefix) };
			}) : void 0;
			const resolvedIngressResult = historyLimit > 0 ? ingressResult?.deferredPrefix ? await continueIngress(ingressResult.deferredPrefix) : ingressResult?.ingressResult : await (async () => {
				const prefix = await readIngressPrefix();
				if (!prefix) return;
				return await continueIngress(prefix);
			})();
			if (!resolvedIngressResult) return;
			const { route: _route, roomConfig, isDirectMessage, isRoom, shouldRequireMention, wasMentioned, shouldBypassMention, canDetectMention, commandAuthorized, inboundHistory, senderName, bodyText, media, locationPayload, messageId: _messageId, triggerSnapshot, threadRootId: _threadRootId, thread, effectiveGroupAllowFrom, effectiveRoomUsers } = resolvedIngressResult;
			const replyToEventId = resolveMatrixReplyToEventId(event.content);
			const threadTarget = thread.threadId;
			const shouldIncludeRoomContextSender = (contextSenderId) => {
				if (!isRoom || !contextSenderId) return true;
				if (effectiveRoomUsers.length > 0) return resolveMatrixAllowListMatch({
					allowList: effectiveRoomUsers,
					userId: contextSenderId
				}).allowed;
				if (groupPolicy === "allowlist" && effectiveGroupAllowFrom.length > 0) return resolveMatrixAllowListMatch({
					allowList: effectiveGroupAllowFrom,
					userId: contextSenderId
				}).allowed;
				return true;
			};
			let threadContext = _threadRootId ? await resolveThreadContext({
				roomId,
				threadRootId: _threadRootId
			}) : void 0;
			let threadContextBlockedByAllowlist = false;
			if (threadContext?.senderId && !shouldIncludeRoomContextSender(threadContext.senderId)) {
				logVerboseMessage("matrix: drop thread root context (sender allowlist)");
				threadContextBlockedByAllowlist = true;
				threadContext = void 0;
			}
			let replyContext;
			if (replyToEventId && replyToEventId === _threadRootId && threadContextBlockedByAllowlist) replyContext = void 0;
			else if (replyToEventId && replyToEventId === _threadRootId && threadContext?.summary) replyContext = {
				replyToBody: threadContext.summary,
				replyToSender: threadContext.senderLabel,
				replyToSenderId: threadContext.senderId
			};
			else replyContext = replyToEventId ? await resolveReplyContext({
				roomId,
				eventId: replyToEventId
			}) : void 0;
			if (replyContext?.replyToSenderId && !shouldIncludeRoomContextSender(replyContext.replyToSenderId)) {
				logVerboseMessage("matrix: drop reply context (sender allowlist)");
				replyContext = void 0;
			}
			const roomName = (isRoom ? await getRoomInfo(roomId) : void 0)?.name;
			const envelopeFrom = isDirectMessage ? senderName : roomName ?? roomId;
			const textWithId = `${bodyText}\n[matrix event id: ${_messageId} room: ${roomId}]`;
			const storePath = core.channel.session.resolveStorePath(cfg.session?.store, { agentId: _route.agentId });
			const envelopeOptions = core.channel.reply.resolveEnvelopeFormatOptions(cfg);
			const previousTimestamp = core.channel.session.readSessionUpdatedAt({
				storePath,
				sessionKey: _route.sessionKey
			});
			const body = core.channel.reply.formatAgentEnvelope({
				channel: "Matrix",
				from: envelopeFrom,
				timestamp: eventTs ?? void 0,
				previousTimestamp,
				envelope: envelopeOptions,
				body: textWithId
			});
			const groupSystemPrompt = roomConfig?.systemPrompt?.trim() || void 0;
			const ctxPayload = core.channel.reply.finalizeInboundContext({
				Body: body,
				RawBody: bodyText,
				CommandBody: bodyText,
				InboundHistory: inboundHistory && inboundHistory.length > 0 ? inboundHistory : void 0,
				From: isDirectMessage ? `matrix:${senderId}` : `matrix:channel:${roomId}`,
				To: `room:${roomId}`,
				SessionKey: _route.sessionKey,
				AccountId: _route.accountId,
				ChatType: isDirectMessage ? "direct" : "channel",
				ConversationLabel: envelopeFrom,
				SenderName: senderName,
				SenderId: senderId,
				SenderUsername: senderId.split(":")[0]?.replace(/^@/, ""),
				GroupSubject: isRoom ? roomName ?? roomId : void 0,
				GroupId: isRoom ? roomId : void 0,
				GroupSystemPrompt: isRoom ? groupSystemPrompt : void 0,
				Provider: "matrix",
				Surface: "matrix",
				WasMentioned: isRoom ? wasMentioned : void 0,
				MessageSid: _messageId,
				ReplyToId: threadTarget ? void 0 : replyToEventId ?? void 0,
				ReplyToBody: replyContext?.replyToBody,
				ReplyToSender: replyContext?.replyToSender,
				MessageThreadId: threadTarget,
				ThreadStarterBody: threadContext?.threadStarterBody,
				Timestamp: eventTs ?? void 0,
				MediaPath: media?.path,
				MediaType: media?.contentType,
				MediaUrl: media?.path,
				...locationPayload?.context,
				CommandAuthorized: commandAuthorized,
				CommandSource: "text",
				OriginatingChannel: "matrix",
				OriginatingTo: `room:${roomId}`
			});
			await core.channel.session.recordInboundSession({
				storePath,
				sessionKey: ctxPayload.SessionKey ?? _route.sessionKey,
				ctx: ctxPayload,
				updateLastRoute: isDirectMessage ? {
					sessionKey: _route.mainSessionKey,
					channel: "matrix",
					to: `room:${roomId}`,
					accountId: _route.accountId
				} : void 0,
				onRecordError: (err) => {
					logger.warn("failed updating session meta", {
						error: String(err),
						storePath,
						sessionKey: ctxPayload.SessionKey ?? _route.sessionKey
					});
				}
			});
			logVerboseMessage(`matrix inbound: room=${roomId} from=${senderId} preview="${bodyText.slice(0, 200).replace(/\n/g, "\\n")}"`);
			const replyTarget = ctxPayload.To;
			if (!replyTarget) {
				runtime.error?.("matrix: missing reply target");
				return;
			}
			const { ackReaction, ackReactionScope: ackScope } = resolveMatrixAckReactionConfig({
				cfg,
				agentId: _route.agentId,
				accountId
			});
			const shouldAckReaction = () => Boolean(ackReaction && core.channel.reactions.shouldAckReaction({
				scope: ackScope,
				isDirect: isDirectMessage,
				isGroup: isRoom,
				isMentionableGroup: isRoom,
				requireMention: Boolean(shouldRequireMention),
				canDetectMention,
				effectiveWasMentioned: wasMentioned || shouldBypassMention,
				shouldBypassMention
			}));
			if (shouldAckReaction() && _messageId) reactMatrixMessage(roomId, _messageId, ackReaction, client).catch((err) => {
				logVerboseMessage(`matrix react failed for room ${roomId}: ${String(err)}`);
			});
			if (_messageId) sendReadReceiptMatrix(roomId, _messageId, client).catch((err) => {
				logVerboseMessage(`matrix: read receipt failed room=${roomId} id=${_messageId}: ${String(err)}`);
			});
			const tableMode = core.channel.text.resolveMarkdownTableMode({
				cfg,
				channel: "matrix",
				accountId: _route.accountId
			});
			const mediaLocalRoots = getAgentScopedMediaLocalRoots(cfg, _route.agentId);
			let finalReplyDeliveryFailed = false;
			let nonFinalReplyDeliveryFailed = false;
			const { onModelSelected, ...prefixOptions } = createReplyPrefixOptions({
				cfg,
				agentId: _route.agentId,
				channel: "matrix",
				accountId: _route.accountId
			});
			const typingCallbacks = createTypingCallbacks({
				start: () => sendTypingMatrix(roomId, true, void 0, client),
				stop: () => sendTypingMatrix(roomId, false, void 0, client),
				onStartError: (err) => {
					logTypingFailure({
						log: logVerboseMessage,
						channel: "matrix",
						action: "start",
						target: roomId,
						error: err
					});
				},
				onStopError: (err) => {
					logTypingFailure({
						log: logVerboseMessage,
						channel: "matrix",
						action: "stop",
						target: roomId,
						error: err
					});
				}
			});
			const draftStreamingEnabled = streaming === "partial";
			const draftReplyToId = replyToMode !== "off" && !threadTarget ? _messageId : void 0;
			let currentDraftReplyToId = draftReplyToId;
			const draftStream = draftStreamingEnabled ? createMatrixDraftStream({
				roomId,
				client,
				cfg,
				threadId: threadTarget,
				replyToId: draftReplyToId,
				preserveReplyId: replyToMode === "all",
				accountId: _route.accountId,
				log: logVerboseMessage
			}) : void 0;
			draftStreamRef = draftStream;
			let currentDraftMessageGeneration = 0;
			let currentDraftBlockOffset = 0;
			let latestDraftFullText = "";
			const pendingDraftBoundaries = [];
			const latestQueuedDraftBoundaryOffsets = /* @__PURE__ */ new Map();
			let draftConsumed = false;
			const getDisplayableDraftText = () => {
				const nextDraftBoundaryOffset = pendingDraftBoundaries.find((boundary) => boundary.messageGeneration === currentDraftMessageGeneration)?.endOffset;
				if (nextDraftBoundaryOffset === void 0) return latestDraftFullText.slice(currentDraftBlockOffset);
				return latestDraftFullText.slice(currentDraftBlockOffset, nextDraftBoundaryOffset);
			};
			const updateDraftFromLatestFullText = () => {
				const blockText = getDisplayableDraftText();
				if (blockText) draftStream?.update(blockText);
			};
			const queueDraftBlockBoundary = (payload, context) => {
				const payloadTextLength = payload.text?.length ?? 0;
				const messageGeneration = context?.assistantMessageIndex ?? currentDraftMessageGeneration;
				const nextDraftBoundaryOffset = (latestQueuedDraftBoundaryOffsets.get(messageGeneration) ?? 0) + payloadTextLength;
				latestQueuedDraftBoundaryOffsets.set(messageGeneration, nextDraftBoundaryOffset);
				pendingDraftBoundaries.push({
					messageGeneration,
					endOffset: nextDraftBoundaryOffset
				});
			};
			const advanceDraftBlockBoundary = (options) => {
				const completedBoundary = pendingDraftBoundaries.shift();
				if (completedBoundary) {
					if (!pendingDraftBoundaries.some((entry) => entry.messageGeneration === completedBoundary.messageGeneration)) latestQueuedDraftBoundaryOffsets.delete(completedBoundary.messageGeneration);
					if (completedBoundary.messageGeneration === currentDraftMessageGeneration) currentDraftBlockOffset = completedBoundary.endOffset;
					return;
				}
				if (options?.fallbackToLatestEnd) currentDraftBlockOffset = latestDraftFullText.length;
			};
			const resetDraftBlockOffsets = () => {
				currentDraftMessageGeneration += 1;
				currentDraftBlockOffset = 0;
				latestDraftFullText = "";
			};
			const { dispatcher, replyOptions, markDispatchIdle, markRunComplete } = core.channel.reply.createReplyDispatcherWithTyping({
				...prefixOptions,
				humanDelay: core.channel.reply.resolveHumanDelayConfig(cfg, _route.agentId),
				deliver: async (payload, info) => {
					if (draftStream && info.kind !== "tool" && !payload.isCompactionNotice) {
						const hasMedia = Boolean(payload.mediaUrl) || (payload.mediaUrls?.length ?? 0) > 0;
						await draftStream.stop();
						if (draftConsumed) {
							await deliverMatrixReplies({
								cfg,
								replies: [payload],
								roomId,
								client,
								runtime,
								textLimit,
								replyToMode,
								threadId: threadTarget,
								accountId: _route.accountId,
								mediaLocalRoots,
								tableMode
							});
							return;
						}
						const draftEventId = draftStream.eventId();
						const payloadReplyToId = payload.replyToId?.trim() || void 0;
						const payloadReplyMismatch = replyToMode !== "off" && !threadTarget && payloadReplyToId !== currentDraftReplyToId;
						const mustDeliverFinalNormally = draftStream.mustDeliverFinalNormally();
						if (draftEventId && payload.text && !hasMedia && !payloadReplyMismatch && !mustDeliverFinalNormally) {
							if (payload.text !== draftStream.lastSentText()) try {
								await editMessageMatrix(roomId, draftEventId, payload.text, {
									client,
									cfg,
									threadId: threadTarget,
									accountId: _route.accountId
								});
							} catch {
								await client.redactEvent(roomId, draftEventId).catch(() => {});
								await deliverMatrixReplies({
									cfg,
									replies: [payload],
									roomId,
									client,
									runtime,
									textLimit,
									replyToMode,
									threadId: threadTarget,
									accountId: _route.accountId,
									mediaLocalRoots,
									tableMode
								});
							}
							draftConsumed = true;
						} else if (draftEventId && hasMedia && !payloadReplyMismatch) {
							let textEditOk = !mustDeliverFinalNormally;
							if (textEditOk && payload.text && payload.text !== draftStream.lastSentText()) textEditOk = await editMessageMatrix(roomId, draftEventId, payload.text, {
								client,
								cfg,
								threadId: threadTarget,
								accountId: _route.accountId
							}).then(() => true, () => false);
							const reusesDraftAsFinalText = Boolean(payload.text?.trim()) && textEditOk;
							if (!reusesDraftAsFinalText) await client.redactEvent(roomId, draftEventId).catch(() => {});
							await deliverMatrixReplies({
								cfg,
								replies: [{
									...payload,
									text: reusesDraftAsFinalText ? void 0 : payload.text
								}],
								roomId,
								client,
								runtime,
								textLimit,
								replyToMode,
								threadId: threadTarget,
								accountId: _route.accountId,
								mediaLocalRoots,
								tableMode
							});
							draftConsumed = true;
						} else {
							if (draftEventId && (payloadReplyMismatch || mustDeliverFinalNormally)) await client.redactEvent(roomId, draftEventId).catch(() => {});
							await deliverMatrixReplies({
								cfg,
								replies: [payload],
								roomId,
								client,
								runtime,
								textLimit,
								replyToMode,
								threadId: threadTarget,
								accountId: _route.accountId,
								mediaLocalRoots,
								tableMode
							});
						}
						if (info.kind === "block") {
							draftConsumed = false;
							advanceDraftBlockBoundary({ fallbackToLatestEnd: true });
							draftStream.reset();
							currentDraftReplyToId = replyToMode === "all" ? draftReplyToId : void 0;
							updateDraftFromLatestFullText();
							await sendTypingMatrix(roomId, true, void 0, client).catch(() => {});
						}
					} else await deliverMatrixReplies({
						cfg,
						replies: [payload],
						roomId,
						client,
						runtime,
						textLimit,
						replyToMode,
						threadId: threadTarget,
						accountId: _route.accountId,
						mediaLocalRoots,
						tableMode
					});
				},
				onError: (err, info) => {
					if (info.kind === "final") finalReplyDeliveryFailed = true;
					else nonFinalReplyDeliveryFailed = true;
					if (info.kind === "block") advanceDraftBlockBoundary({ fallbackToLatestEnd: true });
					runtime.error?.(`matrix ${info.kind} reply failed: ${String(err)}`);
				},
				onReplyStart: typingCallbacks.onReplyStart,
				onIdle: typingCallbacks.onIdle
			});
			const { queuedFinal, counts } = await core.channel.reply.withReplyDispatcher({
				dispatcher,
				onSettled: () => {
					markDispatchIdle();
				},
				run: async () => {
					try {
						return await core.channel.reply.dispatchReplyFromConfig({
							ctx: ctxPayload,
							cfg,
							dispatcher,
							replyOptions: {
								...replyOptions,
								skillFilter: roomConfig?.skills,
								disableBlockStreaming: !blockStreamingEnabled,
								onPartialReply: draftStream ? (payload) => {
									latestDraftFullText = payload.text ?? "";
									updateDraftFromLatestFullText();
								} : void 0,
								onBlockReplyQueued: draftStream ? (payload, context) => {
									if (payload.isCompactionNotice === true) return;
									queueDraftBlockBoundary(payload, context);
								} : void 0,
								onAssistantMessageStart: draftStream ? () => {
									resetDraftBlockOffsets();
								} : void 0,
								onModelSelected
							}
						});
					} finally {
						markRunComplete();
					}
				}
			});
			if (finalReplyDeliveryFailed) {
				logVerboseMessage(`matrix: final reply delivery failed room=${roomId} id=${_messageId}; leaving event uncommitted`);
				return;
			}
			if (!queuedFinal && nonFinalReplyDeliveryFailed) {
				logVerboseMessage(`matrix: non-final reply delivery failed room=${roomId} id=${_messageId}; leaving event uncommitted`);
				return;
			}
			if (isRoom && triggerSnapshot) roomHistoryTracker.consumeHistory(_route.agentId, roomId, triggerSnapshot, _messageId);
			if (!queuedFinal) {
				await commitInboundEventIfClaimed();
				return;
			}
			const finalCount = counts.final;
			logVerboseMessage(`matrix: delivered ${finalCount} reply${finalCount === 1 ? "" : "ies"} to ${replyTarget}`);
			await commitInboundEventIfClaimed();
		} catch (err) {
			runtime.error?.(`matrix handler failed: ${String(err)}`);
		} finally {
			if (draftStreamRef) await draftStreamRef.stop().catch(() => {});
			if (claimedInboundEvent && inboundDeduper && eventId) inboundDeduper.releaseEvent({
				roomId,
				eventId
			});
		}
	};
}
//#endregion
//#region extensions/matrix/src/matrix/monitor/inbound-dedupe.ts
const INBOUND_DEDUPE_FILENAME = "inbound-dedupe.json";
const STORE_VERSION = 1;
const DEFAULT_MAX_ENTRIES = 2e4;
const DEFAULT_TTL_MS = 720 * 60 * 60 * 1e3;
const PERSIST_DEBOUNCE_MS = 250;
function normalizeEventPart(value) {
	return value.trim();
}
function buildEventKey(params) {
	const roomId = normalizeEventPart(params.roomId);
	const eventId = normalizeEventPart(params.eventId);
	return roomId && eventId ? `${roomId}|${eventId}` : "";
}
function resolveInboundDedupeStatePath(params) {
	return resolveMatrixStateFilePath({
		auth: params.auth,
		env: params.env,
		stateDir: params.stateDir,
		filename: INBOUND_DEDUPE_FILENAME
	});
}
function normalizeTimestamp(raw) {
	if (typeof raw !== "number" || !Number.isFinite(raw)) return null;
	return Math.max(0, Math.floor(raw));
}
function pruneSeenEvents(params) {
	const { seen, ttlMs, maxEntries, nowMs } = params;
	if (ttlMs > 0) {
		const cutoff = nowMs - ttlMs;
		for (const [key, ts] of seen) if (ts < cutoff) seen.delete(key);
	}
	const max = Math.max(0, Math.floor(maxEntries));
	if (max <= 0) {
		seen.clear();
		return;
	}
	while (seen.size > max) {
		const oldestKey = seen.keys().next().value;
		if (typeof oldestKey !== "string") break;
		seen.delete(oldestKey);
	}
}
function toStoredState(params) {
	pruneSeenEvents(params);
	return {
		version: STORE_VERSION,
		entries: Array.from(params.seen.entries()).map(([key, ts]) => ({
			key,
			ts
		}))
	};
}
async function readStoredState(storagePath) {
	const { value } = await readJsonFileWithFallback(storagePath, null);
	if (value?.version !== STORE_VERSION || !Array.isArray(value.entries)) return null;
	return value;
}
async function createMatrixInboundEventDeduper(params) {
	const nowMs = params.nowMs ?? (() => Date.now());
	const ttlMs = typeof params.ttlMs === "number" && Number.isFinite(params.ttlMs) ? Math.max(0, Math.floor(params.ttlMs)) : DEFAULT_TTL_MS;
	const maxEntries = typeof params.maxEntries === "number" && Number.isFinite(params.maxEntries) ? Math.max(0, Math.floor(params.maxEntries)) : DEFAULT_MAX_ENTRIES;
	const storagePath = params.storagePath ?? resolveInboundDedupeStatePath({
		auth: params.auth,
		env: params.env,
		stateDir: params.stateDir
	});
	const seen = /* @__PURE__ */ new Map();
	const pending = /* @__PURE__ */ new Set();
	const persistLock = createAsyncLock();
	try {
		const stored = await readStoredState(storagePath);
		for (const entry of stored?.entries ?? []) {
			if (!entry || typeof entry.key !== "string") continue;
			const key = entry.key.trim();
			const ts = normalizeTimestamp(entry.ts);
			if (!key || ts === null) continue;
			seen.set(key, ts);
		}
		pruneSeenEvents({
			seen,
			ttlMs,
			maxEntries,
			nowMs: nowMs()
		});
	} catch (err) {
		LogService.warn("MatrixInboundDedupe", "Failed loading Matrix inbound dedupe store:", err);
	}
	let dirty = false;
	let persistTimer = null;
	let persistPromise = null;
	const persist = async () => {
		dirty = false;
		const payload = toStoredState({
			seen,
			ttlMs,
			maxEntries,
			nowMs: nowMs()
		});
		try {
			await persistLock(async () => {
				await writeJsonFileAtomically(storagePath, payload);
			});
		} catch (err) {
			dirty = true;
			throw err;
		}
	};
	const flush = async () => {
		if (persistTimer) {
			clearTimeout(persistTimer);
			persistTimer = null;
		}
		while (dirty || persistPromise) {
			if (dirty && !persistPromise) persistPromise = persist().finally(() => {
				persistPromise = null;
			});
			await persistPromise;
		}
	};
	const schedulePersist = () => {
		dirty = true;
		if (persistTimer) return;
		persistTimer = setTimeout(() => {
			persistTimer = null;
			flush().catch((err) => {
				LogService.warn("MatrixInboundDedupe", "Failed persisting Matrix inbound dedupe store:", err);
			});
		}, PERSIST_DEBOUNCE_MS);
		persistTimer.unref?.();
	};
	return {
		claimEvent: ({ roomId, eventId }) => {
			const key = buildEventKey({
				roomId,
				eventId
			});
			if (!key) return true;
			pruneSeenEvents({
				seen,
				ttlMs,
				maxEntries,
				nowMs: nowMs()
			});
			if (seen.has(key) || pending.has(key)) return false;
			pending.add(key);
			return true;
		},
		commitEvent: async ({ roomId, eventId }) => {
			const key = buildEventKey({
				roomId,
				eventId
			});
			if (!key) return;
			pending.delete(key);
			const ts = nowMs();
			seen.delete(key);
			seen.set(key, ts);
			pruneSeenEvents({
				seen,
				ttlMs,
				maxEntries,
				nowMs: nowMs()
			});
			schedulePersist();
		},
		releaseEvent: ({ roomId, eventId }) => {
			const key = buildEventKey({
				roomId,
				eventId
			});
			if (!key) return;
			pending.delete(key);
		},
		flush,
		stop: async () => {
			try {
				await flush();
			} catch (err) {
				LogService.warn("MatrixInboundDedupe", "Failed to flush Matrix inbound dedupe store during stop():", err);
			}
		}
	};
}
//#endregion
//#region extensions/matrix/src/matrix/monitor/recent-invite.ts
function shouldPromoteRecentInviteRoom(params) {
	if (!params.roomInfo.nameResolved || !params.roomInfo.aliasesResolved) return false;
	const roomAliases = [params.roomInfo.canonicalAlias ?? "", ...params.roomInfo.altAliases].filter(Boolean);
	if ((params.roomInfo.name?.trim() ?? "") || roomAliases.length > 0) return false;
	return resolveMatrixRoomConfig({
		rooms: params.rooms,
		roomId: params.roomId,
		aliases: roomAliases
	}).matchSource === void 0;
}
//#endregion
//#region extensions/matrix/src/matrix/monitor/room-info.ts
const MAX_TRACKED_ROOM_INFO = 1024;
const MAX_TRACKED_MEMBER_DISPLAY_NAMES = 4096;
function rememberBounded(map, key, value, maxEntries) {
	map.set(key, value);
	if (map.size > maxEntries) {
		const oldest = map.keys().next().value;
		if (typeof oldest === "string") map.delete(oldest);
	}
}
function createMatrixRoomInfoResolver(client) {
	const roomNameCache = /* @__PURE__ */ new Map();
	const roomAliasCache = /* @__PURE__ */ new Map();
	const memberDisplayNameCache = /* @__PURE__ */ new Map();
	const getRoomName = async (roomId) => {
		if (roomNameCache.has(roomId)) return roomNameCache.get(roomId) ?? { nameResolved: false };
		let name;
		let nameResolved = false;
		try {
			const nameState = await client.getRoomStateEvent(roomId, "m.room.name", "");
			nameResolved = true;
			if (nameState && typeof nameState.name === "string") name = nameState.name;
		} catch (err) {
			if (isMatrixNotFoundError(err)) nameResolved = true;
		}
		const info = {
			name,
			nameResolved
		};
		if (nameResolved) rememberBounded(roomNameCache, roomId, info, MAX_TRACKED_ROOM_INFO);
		return info;
	};
	const getRoomAliases = async (roomId) => {
		const cached = roomAliasCache.get(roomId);
		if (cached) return cached;
		let canonicalAlias;
		let altAliases = [];
		let aliasesResolved = false;
		try {
			const aliasState = await client.getRoomStateEvent(roomId, "m.room.canonical_alias", "");
			aliasesResolved = true;
			if (aliasState && typeof aliasState.alias === "string") canonicalAlias = aliasState.alias;
			const rawAliases = aliasState?.alt_aliases;
			if (Array.isArray(rawAliases)) altAliases = rawAliases.filter((entry) => typeof entry === "string");
		} catch (err) {
			if (isMatrixNotFoundError(err)) aliasesResolved = true;
		}
		const info = {
			canonicalAlias,
			altAliases,
			aliasesResolved
		};
		if (aliasesResolved) rememberBounded(roomAliasCache, roomId, info, MAX_TRACKED_ROOM_INFO);
		return info;
	};
	const getRoomInfo = async (roomId, opts = {}) => {
		const { name, nameResolved } = await getRoomName(roomId);
		if (!opts.includeAliases) return {
			name,
			altAliases: [],
			nameResolved,
			aliasesResolved: false
		};
		return {
			name,
			nameResolved,
			...await getRoomAliases(roomId)
		};
	};
	const getMemberDisplayName = async (roomId, userId) => {
		const cacheKey = `${roomId}:${userId}`;
		if (memberDisplayNameCache.has(cacheKey)) return memberDisplayNameCache.get(cacheKey) ?? userId;
		const memberState = await client.getRoomStateEvent(roomId, "m.room.member", userId).catch(() => null);
		const displayName = memberState && typeof memberState.displayname === "string" ? memberState.displayname : userId;
		rememberBounded(memberDisplayNameCache, cacheKey, displayName, MAX_TRACKED_MEMBER_DISPLAY_NAMES);
		return displayName;
	};
	return {
		getRoomInfo,
		getMemberDisplayName
	};
}
//#endregion
//#region extensions/matrix/src/matrix/monitor/startup.ts
let matrixStartupMaintenanceDepsPromise;
async function loadMatrixStartupMaintenanceDeps() {
	matrixStartupMaintenanceDepsPromise ??= Promise.all([
		import("./config-update-C8aQRa2d.js"),
		import("./device-health-B2ZsPBQA.js"),
		import("./profile-DqMjPiow.js"),
		import("./legacy-crypto-restore-Duk-lhwy.js"),
		import("./startup-verification-DV5vgUJV.js")
	]).then(([configUpdateModule, deviceHealthModule, profileModule, legacyCryptoRestoreModule, startupVerificationModule]) => ({
		updateMatrixAccountConfig: configUpdateModule.updateMatrixAccountConfig,
		summarizeMatrixDeviceHealth: deviceHealthModule.summarizeMatrixDeviceHealth,
		syncMatrixOwnProfile: profileModule.syncMatrixOwnProfile,
		maybeRestoreLegacyMatrixBackup: legacyCryptoRestoreModule.maybeRestoreLegacyMatrixBackup,
		ensureMatrixStartupVerification: startupVerificationModule.ensureMatrixStartupVerification
	}));
	return await matrixStartupMaintenanceDepsPromise;
}
async function runMatrixStartupMaintenance(params, deps) {
	const runtimeDeps = deps ?? await loadMatrixStartupMaintenanceDeps();
	try {
		const profileSync = await runtimeDeps.syncMatrixOwnProfile({
			client: params.client,
			userId: params.auth.userId,
			displayName: params.accountConfig.name,
			avatarUrl: params.accountConfig.avatarUrl,
			loadAvatarFromUrl: async (url, maxBytes) => await params.loadWebMedia(url, maxBytes)
		});
		if (profileSync.displayNameUpdated) params.logger.info(`matrix: profile display name updated for ${params.auth.userId}`);
		if (profileSync.avatarUpdated) params.logger.info(`matrix: profile avatar updated for ${params.auth.userId}`);
		if (profileSync.convertedAvatarFromHttp && profileSync.resolvedAvatarUrl && params.accountConfig.avatarUrl !== profileSync.resolvedAvatarUrl) {
			const latestCfg = params.loadConfig();
			const updatedCfg = runtimeDeps.updateMatrixAccountConfig(latestCfg, params.accountId, { avatarUrl: profileSync.resolvedAvatarUrl });
			await params.writeConfigFile(updatedCfg);
			params.logVerboseMessage(`matrix: persisted converted avatar URL for account ${params.accountId} (${profileSync.resolvedAvatarUrl})`);
		}
	} catch (err) {
		params.logger.warn("matrix: failed to sync profile from config", { error: String(err) });
	}
	if (!(params.auth.encryption && params.client.crypto)) return;
	try {
		const deviceHealth = runtimeDeps.summarizeMatrixDeviceHealth(await params.client.listOwnDevices());
		if (deviceHealth.staleOpenClawDevices.length > 0) params.logger.warn(`matrix: stale OpenClaw devices detected for ${params.auth.userId}: ${deviceHealth.staleOpenClawDevices.map((device) => device.deviceId).join(", ")}. Run 'openclaw matrix devices prune-stale --account ${params.effectiveAccountId}' to keep encrypted-room trust healthy.`);
	} catch (err) {
		params.logger.debug?.("Failed to inspect matrix device hygiene (non-fatal)", { error: String(err) });
	}
	try {
		const startupVerification = await runtimeDeps.ensureMatrixStartupVerification({
			client: params.client,
			auth: params.auth,
			accountConfig: params.accountConfig,
			env: params.env
		});
		if (startupVerification.kind === "verified") params.logger.info("matrix: device is verified by its owner and ready for encrypted rooms");
		else if (startupVerification.kind === "disabled" || startupVerification.kind === "cooldown" || startupVerification.kind === "pending" || startupVerification.kind === "request-failed") {
			params.logger.info("matrix: device not verified — run 'openclaw matrix verify device <key>' to enable E2EE");
			if (startupVerification.kind === "pending") params.logger.info("matrix: startup verification request is already pending; finish it in another Matrix client");
			else if (startupVerification.kind === "cooldown") params.logVerboseMessage(`matrix: skipped startup verification request due to cooldown (retryAfterMs=${startupVerification.retryAfterMs ?? 0})`);
			else if (startupVerification.kind === "request-failed") params.logger.debug?.("Matrix startup verification request failed (non-fatal)", { error: startupVerification.error ?? "unknown" });
		} else if (startupVerification.kind === "requested") params.logger.info("matrix: device not verified — requested verification in another Matrix client");
	} catch (err) {
		params.logger.debug?.("Failed to resolve matrix verification status (non-fatal)", { error: String(err) });
	}
	try {
		const legacyCryptoRestore = await runtimeDeps.maybeRestoreLegacyMatrixBackup({
			client: params.client,
			auth: params.auth,
			env: params.env
		});
		if (legacyCryptoRestore.kind === "restored") {
			params.logger.info(`matrix: restored ${legacyCryptoRestore.imported}/${legacyCryptoRestore.total} room key(s) from legacy encrypted-state backup`);
			if (legacyCryptoRestore.localOnlyKeys > 0) params.logger.warn(`matrix: ${legacyCryptoRestore.localOnlyKeys} legacy local-only room key(s) were never backed up and could not be restored automatically`);
		} else if (legacyCryptoRestore.kind === "failed") {
			params.logger.warn(`matrix: failed restoring room keys from legacy encrypted-state backup: ${legacyCryptoRestore.error}`);
			if (legacyCryptoRestore.localOnlyKeys > 0) params.logger.warn(`matrix: ${legacyCryptoRestore.localOnlyKeys} legacy local-only room key(s) were never backed up and may remain unavailable until manually recovered`);
		}
	} catch (err) {
		params.logger.warn("matrix: failed restoring legacy encrypted-state backup", { error: String(err) });
	}
}
//#endregion
//#region extensions/matrix/src/matrix/monitor/index.ts
const DEFAULT_MEDIA_MAX_MB = 20;
async function monitorMatrixProvider(opts = {}) {
	if (opts.abortSignal?.aborted) return;
	if (isBunRuntime()) throw new Error("Matrix provider requires Node (bun runtime not supported)");
	const core = getMatrixRuntime();
	let cfg = core.config.loadConfig();
	if (cfg.channels?.["matrix"]?.enabled === false) return;
	const logger = core.logging.getChildLogger({ module: "matrix-auto-reply" });
	const formatRuntimeMessage = (...args) => format(...args);
	const runtime = opts.runtime ?? {
		log: (...args) => {
			logger.info(formatRuntimeMessage(...args));
		},
		error: (...args) => {
			logger.error(formatRuntimeMessage(...args));
		},
		exit: (code) => {
			throw new Error(`exit ${code}`);
		}
	};
	const logVerboseMessage = (message) => {
		if (!core.logging.shouldLogVerbose()) return;
		logger.debug?.(message);
	};
	const effectiveAccountId = resolveMatrixAuthContext({
		cfg,
		accountId: opts.accountId
	}).accountId;
	const accountConfig = resolveMatrixAccountConfig({
		cfg,
		accountId: effectiveAccountId
	});
	const allowlistOnly = accountConfig.allowlistOnly === true;
	const accountAllowBots = accountConfig.allowBots;
	let allowFrom = (accountConfig.dm?.allowFrom ?? []).map(String);
	let groupAllowFrom = (accountConfig.groupAllowFrom ?? []).map(String);
	let roomsConfig = accountConfig.groups ?? accountConfig.rooms;
	let needsRoomAliasesForConfig = false;
	const configuredBotUserIds = resolveConfiguredMatrixBotUserIds({
		cfg,
		accountId: effectiveAccountId
	});
	({allowFrom, groupAllowFrom, roomsConfig} = await resolveMatrixMonitorConfig({
		cfg,
		accountId: effectiveAccountId,
		allowFrom,
		groupAllowFrom,
		roomsConfig,
		runtime
	}));
	needsRoomAliasesForConfig = Boolean(roomsConfig && Object.keys(roomsConfig).some((key) => key.trim().startsWith("#")));
	cfg = {
		...cfg,
		channels: {
			...cfg.channels,
			matrix: {
				...cfg.channels?.["matrix"],
				dm: {
					...cfg.channels?.["matrix"]?.dm,
					allowFrom
				},
				groupAllowFrom,
				...roomsConfig ? { groups: roomsConfig } : {}
			}
		}
	};
	const auth = await resolveMatrixAuth({
		cfg,
		accountId: effectiveAccountId
	});
	const resolvedInitialSyncLimit = typeof opts.initialSyncLimit === "number" ? Math.max(0, Math.floor(opts.initialSyncLimit)) : auth.initialSyncLimit;
	const authWithLimit = resolvedInitialSyncLimit === auth.initialSyncLimit ? auth : {
		...auth,
		initialSyncLimit: resolvedInitialSyncLimit
	};
	const client = await resolveSharedMatrixClient({
		cfg,
		auth: authWithLimit,
		startClient: false,
		accountId: auth.accountId
	});
	setActiveMatrixClient(client, auth.accountId);
	let cleanedUp = false;
	let threadBindingManager = null;
	const inboundDeduper = await createMatrixInboundEventDeduper({
		auth,
		env: process.env
	});
	const inFlightRoomMessages = /* @__PURE__ */ new Set();
	const waitForInFlightRoomMessages = async () => {
		while (inFlightRoomMessages.size > 0) await Promise.allSettled(Array.from(inFlightRoomMessages));
	};
	const cleanup = async () => {
		if (cleanedUp) return;
		cleanedUp = true;
		try {
			client.stopSyncWithoutPersist();
			await client.drainPendingDecryptions("matrix monitor shutdown");
			await waitForInFlightRoomMessages();
			threadBindingManager?.stop();
			await inboundDeduper.stop();
			await releaseSharedClientInstance(client, "persist");
		} finally {
			setActiveMatrixClient(null, auth.accountId);
		}
	};
	const defaultGroupPolicy = resolveDefaultGroupPolicy(cfg);
	const { groupPolicy: groupPolicyRaw, providerMissingFallbackApplied } = resolveAllowlistProviderRuntimeGroupPolicy({
		providerConfigPresent: cfg.channels?.["matrix"] !== void 0,
		groupPolicy: accountConfig.groupPolicy,
		defaultGroupPolicy
	});
	warnMissingProviderGroupPolicyFallbackOnce({
		providerMissingFallbackApplied,
		providerKey: "matrix",
		accountId: effectiveAccountId,
		blockedLabel: GROUP_POLICY_BLOCKED_LABEL.room,
		log: (message) => logVerboseMessage(message)
	});
	const groupPolicy = allowlistOnly && groupPolicyRaw === "open" ? "allowlist" : groupPolicyRaw;
	const replyToMode = opts.replyToMode ?? accountConfig.replyToMode ?? "off";
	const threadReplies = accountConfig.threadReplies ?? "inbound";
	const dmThreadReplies = accountConfig.dm?.threadReplies;
	const threadBindingIdleTimeoutMs = resolveThreadBindingIdleTimeoutMsForChannel({
		cfg,
		channel: "matrix",
		accountId: effectiveAccountId
	});
	const threadBindingMaxAgeMs = resolveThreadBindingMaxAgeMsForChannel({
		cfg,
		channel: "matrix",
		accountId: effectiveAccountId
	});
	const dmConfig = accountConfig.dm;
	const dmEnabled = dmConfig?.enabled ?? true;
	const dmPolicyRaw = dmConfig?.policy ?? "pairing";
	const dmPolicy = allowlistOnly && dmPolicyRaw !== "disabled" ? "allowlist" : dmPolicyRaw;
	const textLimit = core.channel.text.resolveTextChunkLimit(cfg, "matrix", effectiveAccountId);
	const globalGroupChatHistoryLimit = cfg.messages?.groupChat?.historyLimit;
	const historyLimit = Math.max(0, accountConfig.historyLimit ?? globalGroupChatHistoryLimit ?? 0);
	const mediaMaxMb = opts.mediaMaxMb ?? accountConfig.mediaMaxMb ?? DEFAULT_MEDIA_MAX_MB;
	const mediaMaxBytes = Math.max(1, mediaMaxMb) * 1024 * 1024;
	const streaming = accountConfig.streaming === true || accountConfig.streaming === "partial" ? "partial" : "off";
	const blockStreamingEnabled = accountConfig.blockStreaming === true;
	const startupMs = Date.now();
	const startupGraceMs = 0;
	const dropPreStartupMessages = !client.hasPersistedSyncState();
	const { getRoomInfo, getMemberDisplayName } = createMatrixRoomInfoResolver(client);
	const directTracker = createDirectRoomTracker(client, {
		log: logVerboseMessage,
		canPromoteRecentInvite: async (roomId) => shouldPromoteRecentInviteRoom({
			roomId,
			roomInfo: await getRoomInfo(roomId, { includeAliases: true }),
			rooms: roomsConfig
		}),
		shouldKeepLocallyPromotedDirectRoom: async (roomId) => {
			try {
				const roomInfo = await getRoomInfo(roomId, { includeAliases: true });
				if (!roomInfo.nameResolved || !roomInfo.aliasesResolved) return;
				return shouldPromoteRecentInviteRoom({
					roomId,
					roomInfo,
					rooms: roomsConfig
				});
			} catch (err) {
				logVerboseMessage(`matrix: local promotion revalidation failed room=${roomId} (${String(err)})`);
				return;
			}
		}
	});
	registerMatrixAutoJoin({
		client,
		accountConfig,
		runtime
	});
	const warnedEncryptedRooms = /* @__PURE__ */ new Set();
	const warnedCryptoMissingRooms = /* @__PURE__ */ new Set();
	const handleRoomMessage = createMatrixRoomMessageHandler({
		client,
		core,
		cfg,
		accountId: effectiveAccountId,
		runtime,
		logger,
		logVerboseMessage,
		allowFrom,
		groupAllowFrom,
		roomsConfig,
		accountAllowBots,
		configuredBotUserIds,
		groupPolicy,
		replyToMode,
		threadReplies,
		dmThreadReplies,
		streaming,
		blockStreamingEnabled,
		dmEnabled,
		dmPolicy,
		textLimit,
		mediaMaxBytes,
		historyLimit,
		startupMs,
		startupGraceMs,
		dropPreStartupMessages,
		inboundDeduper,
		directTracker,
		getRoomInfo,
		getMemberDisplayName,
		needsRoomAliasesForConfig
	});
	const trackRoomMessage = (roomId, event) => {
		const task = Promise.resolve(handleRoomMessage(roomId, event)).finally(() => {
			inFlightRoomMessages.delete(task);
		});
		inFlightRoomMessages.add(task);
		return task;
	};
	try {
		threadBindingManager = await createMatrixThreadBindingManager({
			accountId: effectiveAccountId,
			auth,
			client,
			env: process.env,
			idleTimeoutMs: threadBindingIdleTimeoutMs,
			maxAgeMs: threadBindingMaxAgeMs,
			logVerboseMessage
		});
		logVerboseMessage(`matrix: thread bindings ready account=${threadBindingManager.accountId} idleMs=${threadBindingIdleTimeoutMs} maxAgeMs=${threadBindingMaxAgeMs}`);
		registerMatrixMonitorEvents({
			cfg,
			client,
			auth,
			allowFrom,
			dmEnabled,
			dmPolicy,
			readStoreAllowFrom: async () => await core.channel.pairing.readAllowFromStore({
				channel: "matrix",
				env: process.env,
				accountId: effectiveAccountId
			}).catch(() => []),
			directTracker,
			logVerboseMessage,
			warnedEncryptedRooms,
			warnedCryptoMissingRooms,
			logger,
			formatNativeDependencyHint: core.system.formatNativeDependencyHint,
			onRoomMessage: trackRoomMessage
		});
		logVerboseMessage("matrix: starting client");
		await resolveSharedMatrixClient({
			cfg,
			auth: authWithLimit,
			accountId: auth.accountId
		});
		logVerboseMessage("matrix: client started");
		logger.info(`matrix: logged in as ${auth.userId}`);
		await runMatrixStartupMaintenance({
			client,
			auth,
			accountId: effectiveAccountId,
			effectiveAccountId,
			accountConfig,
			logger,
			logVerboseMessage,
			loadConfig: () => core.config.loadConfig(),
			writeConfigFile: async (nextCfg) => await core.config.writeConfigFile(nextCfg),
			loadWebMedia: async (url, maxBytes) => await core.media.loadWebMedia(url, maxBytes),
			env: process.env
		});
		await new Promise((resolve) => {
			const stopAndResolve = async () => {
				try {
					logVerboseMessage("matrix: stopping client");
					await cleanup();
				} catch (err) {
					logger.warn("matrix: failed during monitor shutdown cleanup", { error: String(err) });
				} finally {
					resolve();
				}
			};
			if (opts.abortSignal?.aborted) {
				stopAndResolve();
				return;
			}
			opts.abortSignal?.addEventListener("abort", () => {
				stopAndResolve();
			}, { once: true });
		});
	} catch (err) {
		await cleanup();
		throw err;
	}
}
//#endregion
export { monitorMatrixProvider };
