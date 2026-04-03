import { i as testRegexWithBoundedInput, t as compileSafeRegex } from "./safe-regex-tLlDZYfM.js";
import { T as parseAgentSessionKey } from "./session-key-D7XpmyVq.js";
import { cn as buildPluginApprovalRequestMessage, ln as buildPluginApprovalResolvedMessage } from "./method-scopes-DNlWj6m4.js";
import { t as buildApprovalInteractiveReply } from "./exec-approval-reply-B909d7mK.js";
//#region src/infra/approval-request-filters.ts
function matchesApprovalRequestSessionFilter(sessionKey, patterns) {
	return patterns.some((pattern) => {
		if (sessionKey.includes(pattern)) return true;
		const regex = compileSafeRegex(pattern);
		return regex ? testRegexWithBoundedInput(regex, sessionKey) : false;
	});
}
function matchesApprovalRequestFilters(params) {
	if (params.agentFilter?.length) {
		const explicitAgentId = params.request.agentId?.trim() || void 0;
		const sessionAgentId = params.fallbackAgentIdFromSessionKey ? parseAgentSessionKey(params.request.sessionKey)?.agentId ?? void 0 : void 0;
		const agentId = explicitAgentId ?? sessionAgentId;
		if (!agentId || !params.agentFilter.includes(agentId)) return false;
	}
	if (params.sessionFilter?.length) {
		const sessionKey = params.request.sessionKey?.trim();
		if (!sessionKey || !matchesApprovalRequestSessionFilter(sessionKey, params.sessionFilter)) return false;
	}
	return true;
}
//#endregion
//#region src/plugin-sdk/approval-renderers.ts
const DEFAULT_ALLOWED_DECISIONS = [
	"allow-once",
	"allow-always",
	"deny"
];
function buildApprovalPendingReplyPayload(params) {
	const allowedDecisions = params.allowedDecisions ?? DEFAULT_ALLOWED_DECISIONS;
	return {
		text: params.text,
		interactive: buildApprovalInteractiveReply({
			approvalId: params.approvalId,
			allowedDecisions
		}),
		channelData: {
			execApproval: {
				approvalId: params.approvalId,
				approvalSlug: params.approvalSlug,
				allowedDecisions,
				state: "pending"
			},
			...params.channelData
		}
	};
}
function buildApprovalResolvedReplyPayload(params) {
	return {
		text: params.text,
		channelData: {
			execApproval: {
				approvalId: params.approvalId,
				approvalSlug: params.approvalSlug,
				state: "resolved"
			},
			...params.channelData
		}
	};
}
function buildPluginApprovalPendingReplyPayload(params) {
	return buildApprovalPendingReplyPayload({
		approvalId: params.request.id,
		approvalSlug: params.approvalSlug ?? params.request.id.slice(0, 8),
		text: params.text ?? buildPluginApprovalRequestMessage(params.request, params.nowMs),
		allowedDecisions: params.allowedDecisions,
		channelData: params.channelData
	});
}
function buildPluginApprovalResolvedReplyPayload(params) {
	return buildApprovalResolvedReplyPayload({
		approvalId: params.resolved.id,
		approvalSlug: params.approvalSlug ?? params.resolved.id.slice(0, 8),
		text: params.text ?? buildPluginApprovalResolvedMessage(params.resolved),
		channelData: params.channelData
	});
}
//#endregion
export { matchesApprovalRequestFilters as a, buildPluginApprovalResolvedReplyPayload as i, buildApprovalResolvedReplyPayload as n, matchesApprovalRequestSessionFilter as o, buildPluginApprovalPendingReplyPayload as r, buildApprovalPendingReplyPayload as t };
