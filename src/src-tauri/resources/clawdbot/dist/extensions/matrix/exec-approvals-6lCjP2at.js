import { i as resolveMatrixAccount, t as listMatrixAccountIds } from "./accounts-B8C2wBWb.js";
import { normalizeLowercaseStringOrEmpty } from "openclaw/plugin-sdk/text-runtime";
import { normalizeAccountId } from "openclaw/plugin-sdk/routing";
import { resolveApprovalRequestChannelAccountId } from "openclaw/plugin-sdk/approval-native-runtime";
import { createResolvedApproverActionAuthAdapter, resolveApprovalApprovers } from "openclaw/plugin-sdk/approval-auth-runtime";
import { resolveAllowlistMatchByCandidates } from "openclaw/plugin-sdk/allow-from";
import { normalizeStringEntries } from "openclaw/plugin-sdk/string-normalization-runtime";
import { createChannelExecApprovalProfile, getExecApprovalReplyMetadata, isChannelExecApprovalClientEnabledFromConfig, isChannelExecApprovalTargetRecipient, matchesApprovalRequestFilters } from "openclaw/plugin-sdk/approval-client-runtime";
//#region extensions/matrix/src/matrix/monitor/allowlist.ts
function normalizeAllowList(list) {
	return normalizeStringEntries(list);
}
function normalizeMatrixUser(raw) {
	const value = (raw ?? "").trim();
	if (!value) return "";
	if (!value.startsWith("@") || !value.includes(":")) return normalizeLowercaseStringOrEmpty(value);
	const withoutAt = value.slice(1);
	const splitIndex = withoutAt.indexOf(":");
	if (splitIndex === -1) return normalizeLowercaseStringOrEmpty(value);
	const localpart = normalizeLowercaseStringOrEmpty(withoutAt.slice(0, splitIndex));
	const server = normalizeLowercaseStringOrEmpty(withoutAt.slice(splitIndex + 1));
	if (!server) return normalizeLowercaseStringOrEmpty(value);
	return `@${localpart}:${server}`;
}
function normalizeMatrixUserId(raw) {
	const trimmed = (raw ?? "").trim();
	if (!trimmed) return "";
	const lowered = normalizeLowercaseStringOrEmpty(trimmed);
	if (lowered.startsWith("matrix:")) return normalizeMatrixUser(trimmed.slice(7));
	if (lowered.startsWith("user:")) return normalizeMatrixUser(trimmed.slice(5));
	return normalizeMatrixUser(trimmed);
}
function normalizeMatrixAllowListEntry(raw) {
	const trimmed = raw.trim();
	if (!trimmed) return "";
	if (trimmed === "*") return trimmed;
	const lowered = normalizeLowercaseStringOrEmpty(trimmed);
	if (lowered.startsWith("matrix:")) return `matrix:${normalizeMatrixUser(trimmed.slice(7))}`;
	if (lowered.startsWith("user:")) return `user:${normalizeMatrixUser(trimmed.slice(5))}`;
	return normalizeMatrixUser(trimmed);
}
function normalizeMatrixAllowList(list) {
	return normalizeAllowList(list).map((entry) => normalizeMatrixAllowListEntry(entry));
}
function resolveMatrixAllowListMatch(params) {
	const allowList = params.allowList;
	if (allowList.length === 0) return { allowed: false };
	if (allowList.includes("*")) return {
		allowed: true,
		matchKey: "*",
		matchSource: "wildcard"
	};
	const userId = normalizeMatrixUser(params.userId);
	return resolveAllowlistMatchByCandidates({
		allowList,
		candidates: [
			{
				value: userId,
				source: "id"
			},
			{
				value: userId ? `matrix:${userId}` : "",
				source: "prefixed-id"
			},
			{
				value: userId ? `user:${userId}` : "",
				source: "prefixed-user"
			}
		]
	});
}
//#endregion
//#region extensions/matrix/src/approval-ids.ts
function normalizeMatrixApproverId(value) {
	return normalizeMatrixUserId(String(value)) || void 0;
}
//#endregion
//#region extensions/matrix/src/approval-auth.ts
function getMatrixApprovalAuthApprovers(params) {
	return resolveApprovalApprovers({
		allowFrom: resolveMatrixAccount(params).config.dm?.allowFrom,
		normalizeApprover: normalizeMatrixApproverId
	});
}
const matrixApprovalAuth = createResolvedApproverActionAuthAdapter({
	channelLabel: "Matrix",
	resolveApprovers: ({ cfg, accountId }) => getMatrixApprovalAuthApprovers({
		cfg,
		accountId
	}),
	normalizeSenderId: (value) => normalizeMatrixApproverId(value)
});
//#endregion
//#region extensions/matrix/src/exec-approvals.ts
function normalizeMatrixExecApproverId(value) {
	const normalized = normalizeMatrixApproverId(value);
	return normalized === "*" ? void 0 : normalized;
}
function resolveMatrixExecApprovalConfig(params) {
	const account = resolveMatrixAccount(params);
	const config = account.config.execApprovals;
	if (!config) return;
	return {
		...config,
		enabled: account.enabled && account.configured ? config.enabled : false
	};
}
function countMatrixExecApprovalEligibleAccounts(params) {
	return listMatrixAccountIds(params.cfg).filter((accountId) => {
		const account = resolveMatrixAccount({
			cfg: params.cfg,
			accountId
		});
		if (!account.enabled || !account.configured) return false;
		const config = resolveMatrixExecApprovalConfig({
			cfg: params.cfg,
			accountId
		});
		const filters = config?.enabled ? {
			agentFilter: config.agentFilter,
			sessionFilter: config.sessionFilter
		} : {
			agentFilter: void 0,
			sessionFilter: void 0
		};
		return isChannelExecApprovalClientEnabledFromConfig({
			enabled: config?.enabled,
			approverCount: getMatrixApprovalApprovers({
				cfg: params.cfg,
				accountId,
				approvalKind: params.approvalKind
			}).length
		}) && matchesApprovalRequestFilters({
			request: params.request.request,
			agentFilter: filters.agentFilter,
			sessionFilter: filters.sessionFilter
		});
	}).length;
}
function matchesMatrixRequestAccount(params) {
	const turnSourceChannel = normalizeLowercaseStringOrEmpty(params.request.request.turnSourceChannel);
	const boundAccountId = resolveApprovalRequestChannelAccountId({
		cfg: params.cfg,
		request: params.request,
		channel: "matrix"
	});
	if (turnSourceChannel && turnSourceChannel !== "matrix" && !boundAccountId) return countMatrixExecApprovalEligibleAccounts({
		cfg: params.cfg,
		request: params.request,
		approvalKind: params.approvalKind
	}) <= 1;
	return !boundAccountId || !params.accountId || normalizeAccountId(boundAccountId) === normalizeAccountId(params.accountId);
}
function getMatrixExecApprovalApprovers(params) {
	const account = resolveMatrixAccount(params).config;
	return resolveApprovalApprovers({
		explicit: account.execApprovals?.approvers,
		allowFrom: account.dm?.allowFrom,
		normalizeApprover: normalizeMatrixExecApproverId
	});
}
function resolveMatrixApprovalKind(request) {
	return request.id.startsWith("plugin:") ? "plugin" : "exec";
}
function getMatrixApprovalApprovers(params) {
	if (params.approvalKind === "plugin") return getMatrixApprovalAuthApprovers({
		cfg: params.cfg,
		accountId: params.accountId
	});
	return getMatrixExecApprovalApprovers(params);
}
function isMatrixExecApprovalTargetRecipient(params) {
	return isChannelExecApprovalTargetRecipient({
		...params,
		channel: "matrix",
		normalizeSenderId: normalizeMatrixApproverId,
		matchTarget: ({ target, normalizedSenderId }) => normalizeMatrixApproverId(target.to) === normalizedSenderId
	});
}
const matrixExecApprovalProfile = createChannelExecApprovalProfile({
	resolveConfig: resolveMatrixExecApprovalConfig,
	resolveApprovers: getMatrixExecApprovalApprovers,
	normalizeSenderId: normalizeMatrixApproverId,
	isTargetRecipient: isMatrixExecApprovalTargetRecipient,
	matchesRequestAccount: (params) => matchesMatrixRequestAccount({
		...params,
		approvalKind: "exec"
	})
});
const isMatrixExecApprovalClientEnabled = matrixExecApprovalProfile.isClientEnabled;
matrixExecApprovalProfile.isApprover;
const isMatrixExecApprovalAuthorizedSender = matrixExecApprovalProfile.isAuthorizedSender;
const resolveMatrixExecApprovalTarget = matrixExecApprovalProfile.resolveTarget;
matrixExecApprovalProfile.shouldHandleRequest;
function isMatrixApprovalClientEnabled(params) {
	if (params.approvalKind === "exec") return isMatrixExecApprovalClientEnabled(params);
	return isChannelExecApprovalClientEnabledFromConfig({
		enabled: resolveMatrixExecApprovalConfig(params)?.enabled,
		approverCount: getMatrixApprovalApprovers(params).length
	});
}
function isMatrixAnyApprovalClientEnabled(params) {
	return isMatrixApprovalClientEnabled({
		...params,
		approvalKind: "exec"
	}) || isMatrixApprovalClientEnabled({
		...params,
		approvalKind: "plugin"
	});
}
function shouldHandleMatrixApprovalRequest(params) {
	const approvalKind = resolveMatrixApprovalKind(params.request);
	if (!matchesMatrixRequestAccount({
		...params,
		approvalKind
	})) return false;
	const config = resolveMatrixExecApprovalConfig(params);
	if (!isChannelExecApprovalClientEnabledFromConfig({
		enabled: config?.enabled,
		approverCount: getMatrixApprovalApprovers({
			...params,
			approvalKind
		}).length
	})) return false;
	return matchesApprovalRequestFilters({
		request: params.request.request,
		agentFilter: config?.agentFilter,
		sessionFilter: config?.sessionFilter
	});
}
function buildFilterCheckRequest(params) {
	if (params.metadata.approvalKind === "plugin") return {
		id: params.metadata.approvalId,
		request: {
			title: "Plugin Approval Required",
			description: "",
			agentId: params.metadata.agentId ?? null,
			sessionKey: params.metadata.sessionKey ?? null
		},
		createdAtMs: 0,
		expiresAtMs: 0
	};
	return {
		id: params.metadata.approvalId,
		request: {
			command: "",
			agentId: params.metadata.agentId ?? null,
			sessionKey: params.metadata.sessionKey ?? null
		},
		createdAtMs: 0,
		expiresAtMs: 0
	};
}
function shouldSuppressLocalMatrixExecApprovalPrompt(params) {
	if (!matrixExecApprovalProfile.shouldSuppressLocalPrompt(params)) return false;
	const metadata = getExecApprovalReplyMetadata(params.payload);
	if (!metadata) return false;
	const request = buildFilterCheckRequest({ metadata });
	return shouldHandleMatrixApprovalRequest({
		cfg: params.cfg,
		accountId: params.accountId,
		request
	});
}
//#endregion
export { isMatrixExecApprovalAuthorizedSender as a, shouldHandleMatrixApprovalRequest as c, matrixApprovalAuth as d, normalizeMatrixApproverId as f, resolveMatrixAllowListMatch as h, isMatrixApprovalClientEnabled as i, shouldSuppressLocalMatrixExecApprovalPrompt as l, normalizeMatrixUserId as m, getMatrixExecApprovalApprovers as n, isMatrixExecApprovalClientEnabled as o, normalizeMatrixAllowList as p, isMatrixAnyApprovalClientEnabled as r, resolveMatrixExecApprovalTarget as s, getMatrixApprovalApprovers as t, getMatrixApprovalAuthApprovers as u };
