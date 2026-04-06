import { T as parseAgentSessionKey, v as normalizeOptionalAccountId } from "./session-key-D7XpmyVq.js";
import { d as normalizeMessageChannel } from "./message-channel-D19EDm2g.js";
import { i as loadSessionStore } from "./store-BGmy-Wot.js";
import "./sessions-DC7OiAdD.js";
import { l as resolveStorePath } from "./paths-DBIQqSpZ.js";
import { i as resolveSessionDeliveryTarget } from "./targets-DjOu09mG.js";
//#region src/infra/exec-approval-command-display.ts
const EXEC_APPROVAL_INVISIBLE_CHAR_REGEX = /[\p{Cf}\u115F\u1160\u3164\uFFA0]/gu;
function formatCodePointEscape(char) {
	return `\\u{${char.codePointAt(0)?.toString(16).toUpperCase() ?? "FFFD"}}`;
}
function sanitizeExecApprovalDisplayText(commandText) {
	return commandText.replace(EXEC_APPROVAL_INVISIBLE_CHAR_REGEX, formatCodePointEscape);
}
function normalizePreview(commandText, commandPreview) {
	const previewRaw = commandPreview?.trim() ?? "";
	if (!previewRaw) return null;
	const preview = sanitizeExecApprovalDisplayText(previewRaw);
	if (preview === commandText) return null;
	return preview;
}
function resolveExecApprovalCommandDisplay(request) {
	const commandText = sanitizeExecApprovalDisplayText(request.command || (request.host === "node" && request.systemRunPlan ? request.systemRunPlan.commandText : ""));
	return {
		commandText,
		commandPreview: normalizePreview(commandText, request.commandPreview ?? (request.host === "node" ? request.systemRunPlan?.commandPreview ?? null : null))
	};
}
//#endregion
//#region src/infra/exec-approval-session-target.ts
function normalizeOptionalString(value) {
	const normalized = value?.trim();
	return normalized ? normalized : void 0;
}
function normalizeOptionalThreadId(value) {
	if (typeof value === "number") return Number.isFinite(value) ? value : void 0;
	if (typeof value !== "string") return;
	const normalized = Number.parseInt(value, 10);
	return Number.isFinite(normalized) ? normalized : void 0;
}
function isExecApprovalRequest(request) {
	return "command" in request.request;
}
function toExecLikeApprovalRequest(request) {
	if (isExecApprovalRequest(request)) return request;
	return {
		id: request.id,
		request: {
			command: request.request.title,
			sessionKey: request.request.sessionKey ?? void 0,
			turnSourceChannel: request.request.turnSourceChannel ?? void 0,
			turnSourceTo: request.request.turnSourceTo ?? void 0,
			turnSourceAccountId: request.request.turnSourceAccountId ?? void 0,
			turnSourceThreadId: request.request.turnSourceThreadId ?? void 0
		},
		createdAtMs: request.createdAtMs,
		expiresAtMs: request.expiresAtMs
	};
}
function normalizeOptionalChannel(value) {
	return normalizeMessageChannel(value);
}
function resolveExecApprovalSessionTarget(params) {
	const sessionKey = normalizeOptionalString(params.request.request.sessionKey);
	if (!sessionKey) return null;
	const agentId = parseAgentSessionKey(sessionKey)?.agentId ?? params.request.request.agentId ?? "main";
	const entry = loadSessionStore(resolveStorePath(params.cfg.session?.store, { agentId }))[sessionKey];
	if (!entry) return null;
	const target = resolveSessionDeliveryTarget({
		entry,
		requestedChannel: "last",
		turnSourceChannel: normalizeOptionalString(params.turnSourceChannel),
		turnSourceTo: normalizeOptionalString(params.turnSourceTo),
		turnSourceAccountId: normalizeOptionalString(params.turnSourceAccountId),
		turnSourceThreadId: normalizeOptionalThreadId(params.turnSourceThreadId)
	});
	if (!target.to) return null;
	return {
		channel: normalizeOptionalString(target.channel),
		to: target.to,
		accountId: normalizeOptionalString(target.accountId),
		threadId: normalizeOptionalThreadId(target.threadId)
	};
}
function resolveApprovalRequestSessionBinding(params) {
	const sessionKey = normalizeOptionalString(params.request.request.sessionKey);
	if (!sessionKey) return null;
	const agentId = parseAgentSessionKey(sessionKey)?.agentId ?? params.request.request.agentId ?? "main";
	const entry = loadSessionStore(resolveStorePath(params.cfg.session?.store, { agentId }))[sessionKey];
	if (!entry) return null;
	return {
		channel: normalizeOptionalChannel(entry.origin?.provider ?? entry.lastChannel),
		accountId: normalizeOptionalAccountId(entry.origin?.accountId ?? entry.lastAccountId)
	};
}
function resolveApprovalRequestSessionTarget(params) {
	const execLikeRequest = toExecLikeApprovalRequest(params.request);
	return resolveExecApprovalSessionTarget({
		cfg: params.cfg,
		request: execLikeRequest,
		turnSourceChannel: execLikeRequest.request.turnSourceChannel ?? void 0,
		turnSourceTo: execLikeRequest.request.turnSourceTo ?? void 0,
		turnSourceAccountId: execLikeRequest.request.turnSourceAccountId ?? void 0,
		turnSourceThreadId: execLikeRequest.request.turnSourceThreadId ?? void 0
	});
}
function resolveApprovalRequestStoredSessionTarget(params) {
	const execLikeRequest = toExecLikeApprovalRequest(params.request);
	return resolveExecApprovalSessionTarget({
		cfg: params.cfg,
		request: execLikeRequest
	});
}
function resolveApprovalRequestAccountId(params) {
	const expectedChannel = normalizeOptionalChannel(params.channel);
	const turnSourceChannel = normalizeOptionalChannel(params.request.request.turnSourceChannel);
	if (expectedChannel && turnSourceChannel && turnSourceChannel !== expectedChannel) return null;
	const turnSourceAccountId = normalizeOptionalAccountId(params.request.request.turnSourceAccountId);
	if (turnSourceAccountId) return turnSourceAccountId;
	const sessionTarget = resolveApprovalRequestSessionTarget(params);
	const sessionBinding = resolveApprovalRequestSessionBinding(params);
	const sessionChannel = normalizeOptionalChannel(sessionTarget?.channel ?? sessionBinding?.channel);
	if (expectedChannel && sessionChannel && sessionChannel !== expectedChannel) return null;
	return normalizeOptionalAccountId(sessionTarget?.accountId ?? sessionBinding?.accountId) ?? null;
}
function doesApprovalRequestMatchChannelAccount(params) {
	const expectedChannel = normalizeOptionalChannel(params.channel);
	if (!expectedChannel) return false;
	const turnSourceChannel = normalizeOptionalChannel(params.request.request.turnSourceChannel);
	if (turnSourceChannel && turnSourceChannel !== expectedChannel) return false;
	const turnSourceAccountId = normalizeOptionalAccountId(params.request.request.turnSourceAccountId);
	const expectedAccountId = normalizeOptionalAccountId(params.accountId);
	if (turnSourceAccountId) return !expectedAccountId || expectedAccountId === turnSourceAccountId;
	const sessionTarget = resolveApprovalRequestSessionTarget(params);
	const sessionBinding = resolveApprovalRequestSessionBinding(params);
	const sessionChannel = normalizeOptionalChannel(sessionTarget?.channel ?? sessionBinding?.channel);
	if (sessionChannel && sessionChannel !== expectedChannel) return false;
	const boundAccountId = normalizeOptionalAccountId(sessionTarget?.accountId ?? sessionBinding?.accountId);
	return !expectedAccountId || !boundAccountId || expectedAccountId === boundAccountId;
}
function resolveApprovalRequestOriginTarget(params) {
	if (!doesApprovalRequestMatchChannelAccount({
		cfg: params.cfg,
		request: params.request,
		channel: params.channel,
		accountId: params.accountId
	})) return null;
	const turnSourceTarget = params.resolveTurnSourceTarget(params.request);
	const expectedChannel = normalizeOptionalChannel(params.channel);
	const sessionTargetBinding = resolveApprovalRequestStoredSessionTarget({
		cfg: params.cfg,
		request: params.request
	});
	const sessionTarget = sessionTargetBinding && normalizeOptionalChannel(sessionTargetBinding.channel) === expectedChannel ? params.resolveSessionTarget(sessionTargetBinding) : null;
	if (turnSourceTarget && sessionTarget && !params.targetsMatch(turnSourceTarget, sessionTarget)) return null;
	return turnSourceTarget ?? sessionTarget ?? params.resolveFallbackTarget?.(params.request) ?? null;
}
//#endregion
export { resolveExecApprovalSessionTarget as a, resolveApprovalRequestSessionTarget as i, resolveApprovalRequestAccountId as n, resolveExecApprovalCommandDisplay as o, resolveApprovalRequestOriginTarget as r, sanitizeExecApprovalDisplayText as s, doesApprovalRequestMatchChannelAccount as t };
