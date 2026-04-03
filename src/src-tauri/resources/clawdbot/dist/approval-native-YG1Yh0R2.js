import { a as splitChannelApprovalCapability, o as createChannelApproverDmTargetResolver, r as createApproverRestrictedNativeApprovalCapability, s as createChannelNativeOriginTargetResolver } from "./approval-runtime-8-_vGYcG.js";
import { r as listTelegramAccountIds } from "./accounts-Dh_rfg3W.js";
import { i as parseTelegramTarget, n as normalizeTelegramChatId } from "./targets-CxxizSi5.js";
import { c as resolveTelegramExecApprovalTarget, i as isTelegramExecApprovalClientEnabled, n as isTelegramExecApprovalApprover, r as isTelegramExecApprovalAuthorizedSender, t as getTelegramExecApprovalApprovers, u as shouldHandleTelegramExecApprovalRequest } from "./exec-approvals-BVAdWdf7.js";
//#region extensions/telegram/src/approval-native.ts
function resolveTurnSourceTelegramOriginTarget(request) {
	const turnSourceChannel = request.request.turnSourceChannel?.trim().toLowerCase() || "";
	const rawTurnSourceTo = request.request.turnSourceTo?.trim() || "";
	const parsedTurnSourceTarget = rawTurnSourceTo ? parseTelegramTarget(rawTurnSourceTo) : null;
	const turnSourceTo = normalizeTelegramChatId(parsedTurnSourceTarget?.chatId ?? rawTurnSourceTo);
	if (turnSourceChannel !== "telegram" || !turnSourceTo) return null;
	const rawThreadId = request.request.turnSourceThreadId ?? parsedTurnSourceTarget?.messageThreadId ?? void 0;
	const threadId = typeof rawThreadId === "number" ? rawThreadId : typeof rawThreadId === "string" ? Number.parseInt(rawThreadId, 10) : void 0;
	return {
		to: turnSourceTo,
		threadId: Number.isFinite(threadId) ? threadId : void 0
	};
}
function resolveSessionTelegramOriginTarget(sessionTarget) {
	return {
		to: normalizeTelegramChatId(sessionTarget.to) ?? sessionTarget.to,
		threadId: sessionTarget.threadId ?? void 0
	};
}
function telegramTargetsMatch(a, b) {
	return (normalizeTelegramChatId(a.to) ?? a.to) === (normalizeTelegramChatId(b.to) ?? b.to) && a.threadId === b.threadId;
}
const telegramApprovalCapability = createApproverRestrictedNativeApprovalCapability({
	channel: "telegram",
	channelLabel: "Telegram",
	listAccountIds: listTelegramAccountIds,
	hasApprovers: ({ cfg, accountId }) => getTelegramExecApprovalApprovers({
		cfg,
		accountId
	}).length > 0,
	isExecAuthorizedSender: ({ cfg, accountId, senderId }) => isTelegramExecApprovalAuthorizedSender({
		cfg,
		accountId,
		senderId
	}),
	isPluginAuthorizedSender: ({ cfg, accountId, senderId }) => isTelegramExecApprovalApprover({
		cfg,
		accountId,
		senderId
	}),
	isNativeDeliveryEnabled: ({ cfg, accountId }) => isTelegramExecApprovalClientEnabled({
		cfg,
		accountId
	}),
	resolveNativeDeliveryMode: ({ cfg, accountId }) => resolveTelegramExecApprovalTarget({
		cfg,
		accountId
	}),
	requireMatchingTurnSourceChannel: true,
	resolveSuppressionAccountId: ({ target, request }) => target.accountId?.trim() || request.request.turnSourceAccountId?.trim() || void 0,
	resolveOriginTarget: createChannelNativeOriginTargetResolver({
		channel: "telegram",
		shouldHandleRequest: ({ cfg, accountId, request }) => shouldHandleTelegramExecApprovalRequest({
			cfg,
			accountId,
			request
		}),
		resolveTurnSourceTarget: resolveTurnSourceTelegramOriginTarget,
		resolveSessionTarget: resolveSessionTelegramOriginTarget,
		targetsMatch: telegramTargetsMatch
	}),
	resolveApproverDmTargets: createChannelApproverDmTargetResolver({
		shouldHandleRequest: ({ cfg, accountId, request }) => shouldHandleTelegramExecApprovalRequest({
			cfg,
			accountId,
			request
		}),
		resolveApprovers: getTelegramExecApprovalApprovers,
		mapApprover: (approver) => ({ to: approver })
	})
});
const telegramNativeApprovalAdapter = splitChannelApprovalCapability(telegramApprovalCapability);
//#endregion
export { telegramNativeApprovalAdapter as n, telegramApprovalCapability as t };
