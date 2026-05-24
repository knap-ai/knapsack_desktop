import { a as resolveSlackAccount, i as resolveDefaultSlackAccountId, o as resolveSlackAccountAllowFrom, r as mergeSlackAccountConfig } from "./accounts-BnLQ3fe2.js";
import { n as buildSlackPresentationBlocks, r as resolveSlackInteractiveBlockOffsets, t as buildSlackInteractiveBlocks } from "./blocks-render-CNC4vQnd.js";
import { i as parseSlackBlocksInput } from "./thread-ts-ks-O8cEG.js";
import { normalizeAccountId } from "openclaw/plugin-sdk/account-resolution";
import { normalizeOptionalString, normalizeStringifiedOptionalString } from "openclaw/plugin-sdk/string-coerce-runtime";
import { normalizeMessageChannel } from "openclaw/plugin-sdk/routing";
import { doesApprovalRequestMatchChannelAccount, resolveApprovalRequestSessionConversation } from "openclaw/plugin-sdk/approval-native-runtime";
import { createResolvedApproverActionAuthAdapter, resolveApprovalApprovers } from "openclaw/plugin-sdk/approval-auth-runtime";
import { createChannelExecApprovalProfile, isChannelExecApprovalClientEnabledFromConfig, isChannelExecApprovalTargetRecipient, matchesApprovalRequestFilters } from "openclaw/plugin-sdk/approval-client-runtime";
import { normalizeHyphenSlug } from "openclaw/plugin-sdk/string-normalization-runtime";
import { resolveToolsBySender } from "openclaw/plugin-sdk/channel-policy";
//#region extensions/slack/src/exec-approvals.ts
function normalizeSlackUserLikeId(value) {
	const upper = value.toUpperCase();
	return /^[UW][A-Z0-9]+$/.test(upper) ? upper : void 0;
}
function normalizeSlackApproverId(value) {
	const trimmed = normalizeStringifiedOptionalString(value);
	if (!trimmed) return;
	const prefixed = trimmed.match(/^(?:slack|user):([A-Z0-9]+)$/i);
	if (prefixed?.[1]) return normalizeSlackUserLikeId(prefixed[1]);
	const mention = trimmed.match(/^<@([A-Z0-9]+)>$/i);
	if (mention?.[1]) return normalizeSlackUserLikeId(mention[1]);
	return normalizeSlackUserLikeId(trimmed);
}
function resolveSlackOwnerApprovers(cfg) {
	const ownerAllowFrom = cfg.commands?.ownerAllowFrom;
	if (!Array.isArray(ownerAllowFrom) || ownerAllowFrom.length === 0) return [];
	return resolveApprovalApprovers({
		explicit: ownerAllowFrom,
		normalizeApprover: normalizeSlackApproverId
	});
}
function getSlackExecApprovalApprovers(params) {
	const account = resolveSlackAccount(params).config;
	return resolveApprovalApprovers({
		explicit: account.execApprovals?.approvers ?? resolveSlackOwnerApprovers(params.cfg),
		normalizeApprover: normalizeSlackApproverId
	});
}
function isSlackExecApprovalTargetRecipient(params) {
	return isChannelExecApprovalTargetRecipient({
		...params,
		channel: "slack",
		normalizeSenderId: normalizeSlackApproverId,
		matchTarget: ({ target, normalizedSenderId }) => normalizeSlackApproverId(target.to) === normalizedSenderId
	});
}
const slackExecApprovalProfile = createChannelExecApprovalProfile({
	resolveConfig: (params) => resolveSlackAccount(params).config.execApprovals,
	resolveApprovers: getSlackExecApprovalApprovers,
	normalizeSenderId: normalizeSlackApproverId,
	isTargetRecipient: isSlackExecApprovalTargetRecipient,
	matchesRequestAccount: (params) => doesApprovalRequestMatchChannelAccount({
		cfg: params.cfg,
		request: params.request,
		channel: "slack",
		accountId: params.accountId
	})
});
const isSlackExecApprovalClientEnabled = slackExecApprovalProfile.isClientEnabled;
slackExecApprovalProfile.isApprover;
const isSlackExecApprovalAuthorizedSender = slackExecApprovalProfile.isAuthorizedSender;
const resolveSlackExecApprovalTarget = slackExecApprovalProfile.resolveTarget;
slackExecApprovalProfile.shouldHandleRequest;
const shouldSuppressLocalSlackExecApprovalPrompt = slackExecApprovalProfile.shouldSuppressLocalPrompt;
//#endregion
//#region extensions/slack/src/approval-auth.ts
function getSlackApprovalApprovers(params) {
	const account = resolveSlackAccount(params).config;
	return resolveApprovalApprovers({
		allowFrom: resolveSlackAccountAllowFrom(params),
		defaultTo: account.defaultTo,
		normalizeApprover: normalizeSlackApproverId,
		normalizeDefaultTo: normalizeSlackApproverId
	});
}
function isSlackApprovalAuthorizedSender(params) {
	const senderId = params.senderId ? normalizeSlackApproverId(params.senderId) : void 0;
	if (!senderId) return false;
	return getSlackApprovalApprovers(params).includes(senderId);
}
createResolvedApproverActionAuthAdapter({
	channelLabel: "Slack",
	resolveApprovers: ({ cfg, accountId }) => getSlackApprovalApprovers({
		cfg,
		accountId
	}),
	normalizeSenderId: (value) => normalizeSlackApproverId(value)
});
//#endregion
//#region extensions/slack/src/approval-native-gates.ts
function resolveSlackApprovalKind(request) {
	return request.id.startsWith("plugin:") ? "plugin" : "exec";
}
function resolveSlackNativeApprovalConfig(params) {
	return resolveSlackAccount(params).config.execApprovals;
}
function resolvePluginApprovalForwardingConfig(cfg) {
	return cfg.approvals?.plugin;
}
function getSlackNativeApprovalApprovers(params) {
	return params.approvalKind === "plugin" ? getSlackApprovalApprovers(params) : getSlackExecApprovalApprovers(params);
}
function normalizeAccountId$2(value) {
	return normalizeOptionalString(value)?.toLowerCase();
}
function matchesSlackAccount(params) {
	const expected = normalizeAccountId$2(params.expectedAccountId);
	const actual = normalizeAccountId$2(params.actualAccountId);
	return !expected || !actual || expected === actual;
}
function modeIncludesSession(mode) {
	return mode === void 0 || mode === "session" || mode === "both";
}
function modeIncludesTargets(mode) {
	return mode === "targets" || mode === "both";
}
function hasSlackPluginForwardingTarget(params) {
	return (resolvePluginApprovalForwardingConfig(params.cfg)?.targets ?? []).some((target) => {
		return (normalizeMessageChannel(target.channel) ?? target.channel) === "slack" && matchesSlackAccount({
			expectedAccountId: params.accountId,
			actualAccountId: target.accountId
		});
	});
}
function requestHasSlackOriginOrSession(params) {
	const request = params.request.request;
	const turnSourceChannel = normalizeMessageChannel(request.turnSourceChannel);
	if (turnSourceChannel) return turnSourceChannel === "slack" && matchesSlackAccount({
		expectedAccountId: params.accountId,
		actualAccountId: request.turnSourceAccountId
	});
	return resolveApprovalRequestSessionConversation({
		request: params.request,
		channel: "slack",
		bundledFallback: false
	}) !== null && doesApprovalRequestMatchChannelAccount({
		cfg: params.cfg,
		request: params.request,
		channel: "slack",
		accountId: params.accountId
	});
}
function isPluginForwardingEnabledForRequest(params) {
	const config = resolvePluginApprovalForwardingConfig(params.cfg);
	if (!config?.enabled) return false;
	return matchesApprovalRequestFilters({
		request: params.request.request,
		agentFilter: config.agentFilter,
		sessionFilter: config.sessionFilter
	});
}
function canPluginForwardingRouteToSlack(params) {
	const mode = resolvePluginApprovalForwardingConfig(params.cfg)?.mode;
	if (modeIncludesSession(mode) && requestHasSlackOriginOrSession({
		cfg: params.cfg,
		request: params.request,
		accountId: params.accountId
	})) return true;
	return modeIncludesTargets(mode) && hasSlackPluginForwardingTarget(params);
}
function isSlackPluginNativeApprovalClientEnabled(params) {
	if (isChannelExecApprovalClientEnabledFromConfig({
		enabled: resolveSlackNativeApprovalConfig(params)?.enabled,
		approverCount: getSlackApprovalApprovers(params).length
	})) return true;
	const config = resolvePluginApprovalForwardingConfig(params.cfg);
	if (!config?.enabled || getSlackApprovalApprovers(params).length <= 0) return false;
	const mode = config.mode;
	return modeIncludesSession(mode) || modeIncludesTargets(mode) && hasSlackPluginForwardingTarget(params);
}
function shouldHandleSlackPluginViaNativeClientConfig(params) {
	if (!doesApprovalRequestMatchChannelAccount({
		cfg: params.cfg,
		request: params.request,
		channel: "slack",
		accountId: params.accountId
	})) return false;
	const config = resolveSlackNativeApprovalConfig(params);
	if (!isChannelExecApprovalClientEnabledFromConfig({
		enabled: config?.enabled,
		approverCount: getSlackApprovalApprovers(params).length
	})) return false;
	return matchesApprovalRequestFilters({
		request: params.request.request,
		agentFilter: config?.agentFilter,
		sessionFilter: config?.sessionFilter
	});
}
function shouldHandleSlackPluginNativeApprovalRequest(params) {
	if (getSlackApprovalApprovers(params).length <= 0) return false;
	if (shouldHandleSlackPluginViaNativeClientConfig(params)) return true;
	if (!isPluginForwardingEnabledForRequest(params)) return false;
	return canPluginForwardingRouteToSlack(params);
}
function isSlackNativeApprovalClientEnabled(params) {
	if (params.approvalKind === "exec") return isSlackExecApprovalClientEnabled(params);
	return isSlackPluginNativeApprovalClientEnabled(params);
}
function isSlackAnyNativeApprovalClientEnabled(params) {
	return isSlackNativeApprovalClientEnabled({
		...params,
		approvalKind: "exec"
	}) || isSlackNativeApprovalClientEnabled({
		...params,
		approvalKind: "plugin"
	});
}
function shouldHandleSlackNativeApprovalRequest(params) {
	const approvalKind = params.approvalKind ?? resolveSlackApprovalKind(params.request);
	if (approvalKind === "plugin") return shouldHandleSlackPluginNativeApprovalRequest({
		cfg: params.cfg,
		accountId: params.accountId,
		request: params.request
	});
	if (!doesApprovalRequestMatchChannelAccount({
		cfg: params.cfg,
		request: params.request,
		channel: "slack",
		accountId: params.accountId
	})) return false;
	const config = resolveSlackNativeApprovalConfig(params);
	if (!isChannelExecApprovalClientEnabledFromConfig({
		enabled: config?.enabled,
		approverCount: getSlackNativeApprovalApprovers({
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
//#endregion
//#region extensions/slack/src/group-policy.ts
function resolveSlackChannelPolicyEntry(params) {
	const accountId = normalizeAccountId(params.accountId ?? resolveDefaultSlackAccountId(params.cfg));
	const channelMap = mergeSlackAccountConfig(params.cfg, accountId).channels ?? {};
	if (Object.keys(channelMap).length === 0) return;
	const channelId = params.groupId?.trim();
	const channelName = params.groupChannel?.replace(/^#/, "");
	const normalizedName = normalizeHyphenSlug(channelName);
	const candidates = [
		channelId ?? "",
		channelName ? `#${channelName}` : "",
		channelName ?? "",
		normalizedName
	].filter(Boolean);
	for (const candidate of candidates) if (candidate && channelMap[candidate]) return channelMap[candidate];
	return channelMap["*"];
}
function resolveSenderToolsEntry(entry, params) {
	if (!entry) return;
	return resolveToolsBySender({
		toolsBySender: entry.toolsBySender,
		senderId: params.senderId,
		senderName: params.senderName,
		senderUsername: params.senderUsername,
		senderE164: params.senderE164
	}) ?? entry.tools;
}
function resolveSlackGroupRequireMention(params) {
	const resolved = resolveSlackChannelPolicyEntry(params);
	if (typeof resolved?.requireMention === "boolean") return resolved.requireMention;
	return true;
}
function resolveSlackGroupToolPolicy(params) {
	return resolveSenderToolsEntry(resolveSlackChannelPolicyEntry(params), params);
}
//#endregion
//#region extensions/slack/src/reply-blocks.ts
function resolveSlackReplyBlocks(payload) {
	const slackData = payload.channelData?.slack;
	let channelBlocks = [];
	if (slackData && typeof slackData === "object" && !Array.isArray(slackData)) channelBlocks = parseSlackBlocksInput(slackData.blocks) ?? [];
	const presentationBlocks = buildSlackPresentationBlocks(payload.presentation, resolveSlackInteractiveBlockOffsets(channelBlocks));
	const interactiveBlocks = buildSlackInteractiveBlocks(payload.interactive, resolveSlackInteractiveBlockOffsets([...channelBlocks, ...presentationBlocks]));
	const blocks = [
		...channelBlocks,
		...presentationBlocks,
		...interactiveBlocks
	];
	if (blocks.length > 50) throw new Error(`Slack blocks cannot exceed 50 items after interactive render`);
	return blocks.length > 0 ? blocks : void 0;
}
//#endregion
export { resolveSlackApprovalKind as a, isSlackApprovalAuthorizedSender as c, isSlackExecApprovalClientEnabled as d, normalizeSlackApproverId as f, isSlackAnyNativeApprovalClientEnabled as i, getSlackExecApprovalApprovers as l, shouldSuppressLocalSlackExecApprovalPrompt as m, resolveSlackGroupRequireMention as n, shouldHandleSlackNativeApprovalRequest as o, resolveSlackExecApprovalTarget as p, resolveSlackGroupToolPolicy as r, getSlackApprovalApprovers as s, resolveSlackReplyBlocks as t, isSlackExecApprovalAuthorizedSender as u };
