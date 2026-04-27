import { a as resolveQQBotAccount, r as listQQBotAccountIds } from "./config--Jdei9fe.js";
import { resolveApprovalRequestChannelAccountId } from "openclaw/plugin-sdk/approval-native-runtime";
import { normalizeLowercaseStringOrEmpty, normalizeOptionalString } from "openclaw/plugin-sdk/text-runtime";
import { resolveApprovalApprovers } from "openclaw/plugin-sdk/approval-auth-runtime";
import { createChannelExecApprovalProfile, isChannelExecApprovalClientEnabledFromConfig, matchesApprovalRequestFilters } from "openclaw/plugin-sdk/approval-client-runtime";
import { normalizeAccountId } from "openclaw/plugin-sdk/routing";
//#region extensions/qqbot/src/exec-approvals.ts
function normalizeApproverId(value) {
	return normalizeOptionalString(String(value)) || void 0;
}
function resolveQQBotExecApprovalConfig(params) {
	const account = resolveQQBotAccount(params.cfg, params.accountId);
	const config = account.config.execApprovals;
	if (!config) return;
	return {
		...config,
		enabled: account.enabled && account.secretSource !== "none" ? config.enabled : false
	};
}
function getQQBotExecApprovalApprovers(params) {
	const accountConfig = resolveQQBotAccount(params.cfg, params.accountId).config;
	return resolveApprovalApprovers({
		explicit: resolveQQBotExecApprovalConfig(params)?.approvers,
		allowFrom: accountConfig.allowFrom,
		normalizeApprover: normalizeApproverId
	});
}
function countQQBotExecApprovalEligibleAccounts(params) {
	return listQQBotAccountIds(params.cfg).filter((accountId) => {
		const account = resolveQQBotAccount(params.cfg, accountId);
		if (!account.enabled || account.secretSource === "none") return false;
		const config = resolveQQBotExecApprovalConfig({
			cfg: params.cfg,
			accountId
		});
		return isChannelExecApprovalClientEnabledFromConfig({
			enabled: config?.enabled,
			approverCount: getQQBotExecApprovalApprovers({
				cfg: params.cfg,
				accountId
			}).length
		}) && matchesApprovalRequestFilters({
			request: params.request.request,
			agentFilter: config?.agentFilter,
			sessionFilter: config?.sessionFilter,
			fallbackAgentIdFromSessionKey: true
		});
	}).length;
}
function matchesQQBotRequestAccount(params) {
	const turnSourceChannel = normalizeLowercaseStringOrEmpty(params.request.request.turnSourceChannel);
	const boundAccountId = resolveApprovalRequestChannelAccountId({
		cfg: params.cfg,
		request: params.request,
		channel: "qqbot"
	});
	if (turnSourceChannel && turnSourceChannel !== "qqbot" && !boundAccountId) return countQQBotExecApprovalEligibleAccounts({
		cfg: params.cfg,
		request: params.request
	}) <= 1;
	return !boundAccountId || !params.accountId || normalizeAccountId(boundAccountId) === normalizeAccountId(params.accountId);
}
/**
* Count QQBot accounts that could actually deliver a native approval
* message — i.e. accounts that are enabled and have resolvable secrets.
* Disabled or unconfigured accounts never spawn a handler, so they
* must not contribute to the single-account shortcut in the fallback
* ownership check below.
*/
function countQQBotFallbackEligibleAccounts(cfg) {
	return listQQBotAccountIds(cfg).filter((accountId) => {
		const account = resolveQQBotAccount(cfg, accountId);
		return account.enabled && account.secretSource !== "none";
	}).length;
}
/**
* Fallback account-ownership check — applied when `execApprovals` is NOT
* configured for any QQBot account. In this mode every enabled account
* handler would otherwise race to deliver the same approval to its own
* openid namespace, so we must enforce per-account isolation.
*
* Rules:
*   - If the request carries a bound account (via `turnSourceAccountId`
*     or session binding), only the handler whose `accountId` matches it
*     delivers the approval. This is strict: a handler with an unknown
*     `accountId` (null/undefined) must not claim a bound request.
*   - If no account is bound, only deliver when there is a single
*     *eligible* QQBot account (enabled + secret resolved). Disabled or
*     unconfigured accounts never deliver anyway, so they shouldn't
*     block the remaining single account from handling the approval.
*     Multiple eligible accounts cannot safely race because openids are
*     account-scoped — cross-account delivery hits the QQ Bot API with
*     a mismatched token and fails.
*/
function matchesQQBotFallbackRequestAccount(params) {
	const boundAccountId = resolveApprovalRequestChannelAccountId({
		cfg: params.cfg,
		request: params.request,
		channel: "qqbot"
	});
	if (boundAccountId) {
		if (!params.accountId) return false;
		return normalizeAccountId(boundAccountId) === normalizeAccountId(params.accountId);
	}
	return countQQBotFallbackEligibleAccounts(params.cfg) <= 1;
}
/**
* Unified per-account ownership check used by both the profile and
* fallback approval paths. Dispatches to the profile rules when the
* current account has `execApprovals` configured, otherwise uses the
* fallback rules.
*
* This is the single source of truth for "does this QQBot handler own
* this approval request?" and is consumed by both the capability
* gate (shouldHandle) and the lazy native runtime adapter.
*/
function matchesQQBotApprovalAccount(params) {
	const normalized = {
		cfg: params.cfg,
		accountId: params.accountId,
		request: params.request
	};
	if (resolveQQBotExecApprovalConfig(normalized) !== void 0) return matchesQQBotRequestAccount(normalized);
	return matchesQQBotFallbackRequestAccount(normalized);
}
const qqbotExecApprovalProfile = createChannelExecApprovalProfile({
	resolveConfig: resolveQQBotExecApprovalConfig,
	resolveApprovers: getQQBotExecApprovalApprovers,
	matchesRequestAccount: matchesQQBotRequestAccount,
	fallbackAgentIdFromSessionKey: true,
	requireClientEnabledForLocalPromptSuppression: false
});
const isQQBotExecApprovalClientEnabled = qqbotExecApprovalProfile.isClientEnabled;
const isQQBotExecApprovalApprover = qqbotExecApprovalProfile.isApprover;
const isQQBotExecApprovalAuthorizedSender = qqbotExecApprovalProfile.isAuthorizedSender;
qqbotExecApprovalProfile.resolveTarget;
const shouldHandleQQBotExecApprovalRequest = qqbotExecApprovalProfile.shouldHandleRequest;
//#endregion
export { resolveQQBotExecApprovalConfig as a, matchesQQBotApprovalAccount as i, isQQBotExecApprovalAuthorizedSender as n, shouldHandleQQBotExecApprovalRequest as o, isQQBotExecApprovalClientEnabled as r, isQQBotExecApprovalApprover as t };
