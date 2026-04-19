import { t as listMatrixAccountIds } from "./accounts-B8C2wBWb.js";
import { a as isMatrixExecApprovalAuthorizedSender, c as shouldHandleMatrixApprovalRequest, d as matrixApprovalAuth, f as normalizeMatrixApproverId, i as isMatrixApprovalClientEnabled, m as normalizeMatrixUserId, n as getMatrixExecApprovalApprovers, o as isMatrixExecApprovalClientEnabled, r as isMatrixAnyApprovalClientEnabled, s as resolveMatrixExecApprovalTarget, t as getMatrixApprovalApprovers, u as getMatrixApprovalAuthApprovers } from "./exec-approvals-6lCjP2at.js";
import { a as resolveMatrixTargetIdentity, i as resolveMatrixDirectUserId } from "./target-ids-SzOps7vq.js";
import { normalizeLowercaseStringOrEmpty, normalizeOptionalStringifiedId } from "openclaw/plugin-sdk/text-runtime";
import { normalizeAccountId } from "openclaw/plugin-sdk/account-id";
import { formatLocationText, logInboundDrop, toLocationContext } from "openclaw/plugin-sdk/channel-inbound";
import { logTypingFailure, resolveAckReaction } from "openclaw/plugin-sdk/channel-feedback";
import { ensureConfiguredAcpBindingReady } from "openclaw/plugin-sdk/acp-binding-runtime";
import { createReplyPrefixOptions, createTypingCallbacks } from "openclaw/plugin-sdk/channel-reply-pipeline";
import { buildChannelKeyCandidates, resolveChannelEntryMatch } from "openclaw/plugin-sdk/channel-targets";
import { createApproverRestrictedNativeApprovalCapability, createChannelApprovalCapability, splitChannelApprovalCapability } from "openclaw/plugin-sdk/approval-delivery-runtime";
import { createLazyChannelApprovalNativeRuntimeAdapter } from "openclaw/plugin-sdk/approval-handler-adapter-runtime";
import { createChannelNativeOriginTargetResolver, resolveApprovalRequestSessionConversation } from "openclaw/plugin-sdk/approval-native-runtime";
import { addAllowlistUserEntriesFromConfigEntry, buildAllowlistResolutionSummary, canonicalizeAllowlistWithResolvedIds, formatAllowlistMatchMeta, patchAllowlistUsersInConfigEntries, summarizeMapping } from "openclaw/plugin-sdk/allow-from";
import { getAgentScopedMediaLocalRoots } from "openclaw/plugin-sdk/agent-media-payload";
//#region extensions/matrix/src/approval-native.ts
function normalizeComparableTarget(value) {
	const target = resolveMatrixTargetIdentity(value);
	if (!target) return normalizeLowercaseStringOrEmpty(value);
	if (target.kind === "user") return `user:${normalizeMatrixUserId(target.id)}`;
	return `${normalizeLowercaseStringOrEmpty(target.kind)}:${target.id}`;
}
function resolveMatrixNativeTarget(raw) {
	const target = resolveMatrixTargetIdentity(raw);
	if (!target) return null;
	return target.kind === "user" ? `user:${target.id}` : `room:${target.id}`;
}
function resolveTurnSourceMatrixOriginTarget(request) {
	const turnSourceChannel = normalizeLowercaseStringOrEmpty(request.request.turnSourceChannel);
	const target = resolveMatrixNativeTarget(request.request.turnSourceTo?.trim() || "");
	if (turnSourceChannel !== "matrix" || !target) return null;
	return {
		to: target,
		threadId: normalizeOptionalStringifiedId(request.request.turnSourceThreadId)
	};
}
function resolveSessionMatrixOriginTarget(sessionTarget) {
	const target = resolveMatrixNativeTarget(sessionTarget.to);
	if (!target) return null;
	return {
		to: target,
		threadId: normalizeOptionalStringifiedId(sessionTarget.threadId)
	};
}
function matrixTargetsMatch(a, b) {
	return normalizeComparableTarget(a.to) === normalizeComparableTarget(b.to) && (a.threadId ?? "") === (b.threadId ?? "");
}
function hasMatrixPluginApprovers(params) {
	return getMatrixApprovalAuthApprovers(params).length > 0;
}
function availabilityState(enabled) {
	return enabled ? { kind: "enabled" } : { kind: "disabled" };
}
function hasMatrixApprovalApprovers(params) {
	return getMatrixApprovalApprovers({
		cfg: params.cfg,
		accountId: params.accountId,
		approvalKind: params.approvalKind
	}).length > 0;
}
function hasAnyMatrixApprovalApprovers(params) {
	return getMatrixExecApprovalApprovers(params).length > 0 || getMatrixApprovalAuthApprovers(params).length > 0;
}
function isMatrixPluginAuthorizedSender(params) {
	const normalizedSenderId = params.senderId ? normalizeMatrixApproverId(params.senderId) : void 0;
	if (!normalizedSenderId) return false;
	return getMatrixApprovalAuthApprovers(params).includes(normalizedSenderId);
}
function resolveSuppressionAccountId(params) {
	return params.target.accountId?.trim() || params.request.request.turnSourceAccountId?.trim() || void 0;
}
const resolveMatrixOriginTarget = createChannelNativeOriginTargetResolver({
	channel: "matrix",
	shouldHandleRequest: ({ cfg, accountId, request }) => shouldHandleMatrixApprovalRequest({
		cfg,
		accountId,
		request
	}),
	resolveTurnSourceTarget: resolveTurnSourceMatrixOriginTarget,
	resolveSessionTarget: resolveSessionMatrixOriginTarget,
	targetsMatch: matrixTargetsMatch,
	resolveFallbackTarget: (request) => {
		const sessionConversation = resolveApprovalRequestSessionConversation({
			request,
			channel: "matrix"
		});
		if (!sessionConversation) return null;
		const target = resolveMatrixNativeTarget(sessionConversation.id);
		if (!target) return null;
		return {
			to: target,
			threadId: normalizeOptionalStringifiedId(sessionConversation.threadId)
		};
	}
});
function resolveMatrixApproverDmTargets(params) {
	if (!shouldHandleMatrixApprovalRequest(params)) return [];
	return getMatrixApprovalApprovers(params).map((approver) => {
		const normalized = normalizeMatrixUserId(approver);
		return normalized ? { to: `user:${normalized}` } : null;
	}).filter((target) => target !== null);
}
const matrixNativeApprovalCapability = createApproverRestrictedNativeApprovalCapability({
	channel: "matrix",
	channelLabel: "Matrix",
	describeExecApprovalSetup: ({ accountId }) => {
		const prefix = accountId && accountId !== "default" ? `channels.matrix.accounts.${accountId}` : "channels.matrix";
		return `Approve it from the Web UI or terminal UI for now. Matrix supports native exec approvals for this account. Configure \`${prefix}.execApprovals.approvers\` or \`${prefix}.dm.allowFrom\`; leave \`${prefix}.execApprovals.enabled\` unset/\`auto\` or set it to \`true\`.`;
	},
	listAccountIds: listMatrixAccountIds,
	hasApprovers: ({ cfg, accountId }) => hasAnyMatrixApprovalApprovers({
		cfg,
		accountId
	}),
	isExecAuthorizedSender: ({ cfg, accountId, senderId }) => isMatrixExecApprovalAuthorizedSender({
		cfg,
		accountId,
		senderId
	}),
	isPluginAuthorizedSender: ({ cfg, accountId, senderId }) => isMatrixPluginAuthorizedSender({
		cfg,
		accountId,
		senderId
	}),
	isNativeDeliveryEnabled: ({ cfg, accountId }) => isMatrixExecApprovalClientEnabled({
		cfg,
		accountId
	}),
	resolveNativeDeliveryMode: ({ cfg, accountId }) => resolveMatrixExecApprovalTarget({
		cfg,
		accountId
	}),
	requireMatchingTurnSourceChannel: true,
	resolveSuppressionAccountId,
	resolveOriginTarget: resolveMatrixOriginTarget,
	resolveApproverDmTargets: resolveMatrixApproverDmTargets,
	notifyOriginWhenDmOnly: true,
	nativeRuntime: createLazyChannelApprovalNativeRuntimeAdapter({
		eventKinds: ["exec", "plugin"],
		isConfigured: ({ cfg, accountId }) => isMatrixAnyApprovalClientEnabled({
			cfg,
			accountId
		}),
		shouldHandle: ({ cfg, accountId, request }) => shouldHandleMatrixApprovalRequest({
			cfg,
			accountId,
			request
		}),
		load: async () => (await import("./approval-handler.runtime-C_jvBGs4.js")).matrixApprovalNativeRuntime
	})
});
const splitMatrixApprovalCapability = splitChannelApprovalCapability(matrixNativeApprovalCapability);
const matrixBaseNativeApprovalAdapter = splitMatrixApprovalCapability.native;
const matrixBaseDeliveryAdapter = splitMatrixApprovalCapability.delivery;
const matrixDeliveryAdapter = matrixBaseDeliveryAdapter && {
	...matrixBaseDeliveryAdapter,
	shouldSuppressForwardingFallback: (params) => {
		const accountId = resolveSuppressionAccountId(params);
		if (!hasMatrixApprovalApprovers({
			cfg: params.cfg,
			accountId,
			approvalKind: params.approvalKind
		})) return false;
		return matrixBaseDeliveryAdapter.shouldSuppressForwardingFallback?.(params) ?? false;
	}
};
const matrixNativeAdapter = matrixBaseNativeApprovalAdapter && {
	describeDeliveryCapabilities: (params) => {
		const capabilities = matrixBaseNativeApprovalAdapter.describeDeliveryCapabilities(params);
		const hasApprovers = hasMatrixApprovalApprovers({
			cfg: params.cfg,
			accountId: params.accountId,
			approvalKind: params.approvalKind
		});
		const clientEnabled = isMatrixApprovalClientEnabled({
			cfg: params.cfg,
			accountId: params.accountId,
			approvalKind: params.approvalKind
		});
		return {
			...capabilities,
			enabled: capabilities.enabled && hasApprovers && clientEnabled
		};
	},
	resolveOriginTarget: matrixBaseNativeApprovalAdapter.resolveOriginTarget,
	resolveApproverDmTargets: matrixBaseNativeApprovalAdapter.resolveApproverDmTargets
};
const matrixApprovalCapability = createChannelApprovalCapability({
	authorizeActorAction: (params) => {
		if (params.approvalKind !== "plugin") return matrixNativeApprovalCapability.authorizeActorAction?.(params) ?? { authorized: true };
		if (!hasMatrixPluginApprovers({
			cfg: params.cfg,
			accountId: params.accountId
		})) return {
			authorized: false,
			reason: "❌ Matrix plugin approvals are not enabled for this bot account."
		};
		return matrixApprovalAuth.authorizeActorAction(params);
	},
	getActionAvailabilityState: (params) => {
		if (params.approvalKind === "plugin") return availabilityState(hasMatrixPluginApprovers({
			cfg: params.cfg,
			accountId: params.accountId
		}));
		return matrixNativeApprovalCapability.getActionAvailabilityState?.(params) ?? { kind: "disabled" };
	},
	getExecInitiatingSurfaceState: (params) => matrixNativeApprovalCapability.getExecInitiatingSurfaceState?.(params) ?? { kind: "disabled" },
	describeExecApprovalSetup: matrixNativeApprovalCapability.describeExecApprovalSetup,
	delivery: matrixDeliveryAdapter,
	nativeRuntime: matrixNativeApprovalCapability.nativeRuntime,
	native: matrixNativeAdapter,
	render: matrixNativeApprovalCapability.render
});
//#endregion
//#region extensions/matrix/src/matrix/monitor/rooms.ts
function readLegacyRoomAllowAlias(room) {
	const rawRoom = room;
	return typeof rawRoom?.allow === "boolean" ? rawRoom.allow : void 0;
}
function resolveMatrixRoomConfig(params) {
	const rooms = params.rooms ?? {};
	const allowlistConfigured = Object.keys(rooms).length > 0;
	const { entry: matched, key: matchedKey, wildcardEntry, wildcardKey } = resolveChannelEntryMatch({
		entries: rooms,
		keys: buildChannelKeyCandidates(params.roomId, `room:${params.roomId}`, ...params.aliases),
		wildcardKey: "*"
	});
	const resolved = matched ?? wildcardEntry;
	const legacyAllow = readLegacyRoomAllowAlias(resolved);
	return {
		allowed: resolved ? resolved.enabled !== false && legacyAllow !== false : false,
		allowlistConfigured,
		config: resolved,
		matchKey: matchedKey ?? wildcardKey,
		matchSource: matched ? "direct" : wildcardEntry ? "wildcard" : void 0
	};
}
//#endregion
//#region extensions/matrix/src/matrix/session-store-metadata.ts
function trimMaybeString(value) {
	if (typeof value !== "string") return;
	const trimmed = value.trim();
	return trimmed.length > 0 ? trimmed : void 0;
}
function resolveMatrixRoomTargetId(value) {
	const trimmed = trimMaybeString(value);
	if (!trimmed) return;
	const target = resolveMatrixTargetIdentity(trimmed);
	return target?.kind === "room" && target.id.startsWith("!") ? target.id : void 0;
}
function resolveMatrixSessionAccountId(value) {
	const trimmed = trimMaybeString(value);
	return trimmed ? normalizeAccountId(trimmed) : void 0;
}
function resolveMatrixStoredRoomId(params) {
	return resolveMatrixRoomTargetId(params.deliveryTo) ?? resolveMatrixRoomTargetId(params.lastTo) ?? resolveMatrixRoomTargetId(params.originNativeChannelId) ?? resolveMatrixRoomTargetId(params.originTo);
}
function resolveMatrixStoredSessionMeta(entry) {
	if (!entry) return null;
	const channel = trimMaybeString(entry.deliveryContext?.channel) ?? trimMaybeString(entry.lastChannel) ?? trimMaybeString(entry.origin?.provider);
	const accountId = resolveMatrixSessionAccountId(entry.deliveryContext?.accountId ?? entry.lastAccountId ?? entry.origin?.accountId) ?? void 0;
	const roomId = resolveMatrixStoredRoomId({
		deliveryTo: entry.deliveryContext?.to,
		lastTo: entry.lastTo,
		originNativeChannelId: entry.origin?.nativeChannelId,
		originTo: entry.origin?.to
	});
	const chatType = trimMaybeString(entry.origin?.chatType) ?? trimMaybeString(entry.chatType) ?? void 0;
	const directUserId = chatType === "direct" ? trimMaybeString(entry.origin?.nativeDirectUserId) ?? resolveMatrixDirectUserId({
		from: trimMaybeString(entry.origin?.from),
		to: (roomId ? `room:${roomId}` : void 0) ?? trimMaybeString(entry.deliveryContext?.to) ?? trimMaybeString(entry.lastTo) ?? trimMaybeString(entry.origin?.to),
		chatType
	}) : void 0;
	if (!channel && !accountId && !roomId && !directUserId) return null;
	return {
		...channel ? { channel } : {},
		...accountId ? { accountId } : {},
		...roomId ? { roomId } : {},
		...directUserId ? { directUserId } : {}
	};
}
//#endregion
export { toLocationContext as _, canonicalizeAllowlistWithResolvedIds as a, ensureConfiguredAcpBindingReady as c, getAgentScopedMediaLocalRoots as d, logInboundDrop as f, summarizeMapping as g, resolveAckReaction as h, buildAllowlistResolutionSummary as i, formatAllowlistMatchMeta as l, patchAllowlistUsersInConfigEntries as m, resolveMatrixRoomConfig as n, createReplyPrefixOptions as o, logTypingFailure as p, addAllowlistUserEntriesFromConfigEntry as r, createTypingCallbacks as s, resolveMatrixStoredSessionMeta as t, formatLocationText as u, matrixApprovalCapability as v };
