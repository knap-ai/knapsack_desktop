import { _ as normalizeAccountId } from "./session-key-D7XpmyVq.js";
import { i as normalizeStringEntriesLower, n as normalizeHyphenSlug, r as normalizeStringEntries } from "./string-normalization-De1VSx5S.js";
import { o as resolveCompiledAllowlistMatch, t as compileAllowlist } from "./allowlist-match-3bw5mXHZ.js";
import { n as resolveGlobalDedupeCache } from "./dedupe-_6bbS8VC.js";
import { i as resolveToolsBySender } from "./group-policy-B1uRyci5.js";
import "./core-BghMcc08.js";
import "./channel-policy-Dqo0XdDX.js";
import { t as withTimeout } from "./with-timeout-DUjG22ty.js";
import { t as doesApprovalRequestMatchChannelAccount } from "./exec-approval-session-target-C1KSzAWi.js";
import { a as splitChannelApprovalCapability, c as createChannelExecApprovalProfile, d as createResolvedApproverActionAuthAdapter, o as createChannelApproverDmTargetResolver, r as createApproverRestrictedNativeApprovalCapability, s as createChannelNativeOriginTargetResolver, t as resolveApprovalApprovers, u as isChannelExecApprovalTargetRecipient } from "./approval-runtime-8-_vGYcG.js";
import "./text-runtime-B0ZpmkER.js";
import "./account-resolution-CahYTlaB.js";
import { a as resolveSlackAccount, i as resolveDefaultSlackAccountId, n as listSlackAccountIds, r as mergeSlackAccountConfig } from "./accounts-DHZuUL28.js";
import { l as parseSlackTarget, r as createSlackWebClient } from "./client-Cm0jR4_W.js";
//#region extensions/slack/src/exec-approvals.ts
function normalizeSlackApproverId(value) {
	const trimmed = String(value).trim();
	if (!trimmed) return;
	const prefixed = trimmed.match(/^(?:slack|user):([A-Z0-9]+)$/i);
	if (prefixed?.[1]) return prefixed[1];
	const mention = trimmed.match(/^<@([A-Z0-9]+)>$/i);
	if (mention?.[1]) return mention[1];
	return /^[UW][A-Z0-9]+$/i.test(trimmed) ? trimmed : void 0;
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
const shouldHandleSlackExecApprovalRequest = slackExecApprovalProfile.shouldHandleRequest;
const shouldSuppressLocalSlackExecApprovalPrompt = slackExecApprovalProfile.shouldSuppressLocalPrompt;
//#endregion
//#region extensions/slack/src/approval-auth.ts
function getSlackApprovalApprovers(params) {
	const account = resolveSlackAccount(params).config;
	return resolveApprovalApprovers({
		allowFrom: account.allowFrom,
		extraAllowFrom: account.dm?.allowFrom,
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
//#region extensions/slack/src/approval-native.ts
function extractSlackSessionKind(sessionKey) {
	if (!sessionKey) return null;
	const match = sessionKey.match(/slack:(direct|channel|group):/i);
	return match?.[1] ? match[1].toLowerCase() : null;
}
function normalizeComparableTarget(value) {
	return value.trim().toLowerCase();
}
function normalizeSlackThreadMatchKey(threadId) {
	const trimmed = threadId?.trim();
	if (!trimmed) return "";
	return trimmed.match(/^\d+/)?.[0] ?? trimmed;
}
function resolveTurnSourceSlackOriginTarget(request) {
	const turnSourceChannel = request.request.turnSourceChannel?.trim().toLowerCase() || "";
	const turnSourceTo = request.request.turnSourceTo?.trim() || "";
	if (turnSourceChannel !== "slack" || !turnSourceTo) return null;
	const parsed = parseSlackTarget(turnSourceTo, { defaultKind: extractSlackSessionKind(request.request.sessionKey ?? void 0) === "direct" ? "user" : "channel" });
	if (!parsed) return null;
	const threadId = typeof request.request.turnSourceThreadId === "string" ? request.request.turnSourceThreadId.trim() || void 0 : typeof request.request.turnSourceThreadId === "number" ? String(request.request.turnSourceThreadId) : void 0;
	return {
		to: `${parsed.kind}:${parsed.id}`,
		threadId
	};
}
function resolveSessionSlackOriginTarget(sessionTarget) {
	return {
		to: sessionTarget.to,
		threadId: typeof sessionTarget.threadId === "string" ? sessionTarget.threadId : typeof sessionTarget.threadId === "number" ? String(sessionTarget.threadId) : void 0
	};
}
function slackTargetsMatch(a, b) {
	return normalizeComparableTarget(a.to) === normalizeComparableTarget(b.to) && normalizeSlackThreadMatchKey(a.threadId) === normalizeSlackThreadMatchKey(b.threadId);
}
const slackApprovalCapability = createApproverRestrictedNativeApprovalCapability({
	channel: "slack",
	channelLabel: "Slack",
	listAccountIds: listSlackAccountIds,
	hasApprovers: ({ cfg, accountId }) => getSlackExecApprovalApprovers({
		cfg,
		accountId
	}).length > 0,
	isExecAuthorizedSender: ({ cfg, accountId, senderId }) => isSlackExecApprovalAuthorizedSender({
		cfg,
		accountId,
		senderId
	}),
	isPluginAuthorizedSender: ({ cfg, accountId, senderId }) => isSlackApprovalAuthorizedSender({
		cfg,
		accountId,
		senderId
	}),
	isNativeDeliveryEnabled: ({ cfg, accountId }) => isSlackExecApprovalClientEnabled({
		cfg,
		accountId
	}),
	resolveNativeDeliveryMode: ({ cfg, accountId }) => resolveSlackExecApprovalTarget({
		cfg,
		accountId
	}),
	requireMatchingTurnSourceChannel: true,
	resolveSuppressionAccountId: ({ target, request }) => target.accountId?.trim() || request.request.turnSourceAccountId?.trim() || void 0,
	resolveOriginTarget: createChannelNativeOriginTargetResolver({
		channel: "slack",
		shouldHandleRequest: ({ cfg, accountId, request }) => shouldHandleSlackExecApprovalRequest({
			cfg,
			accountId,
			request
		}),
		resolveTurnSourceTarget: resolveTurnSourceSlackOriginTarget,
		resolveSessionTarget: resolveSessionSlackOriginTarget,
		targetsMatch: slackTargetsMatch
	}),
	resolveApproverDmTargets: createChannelApproverDmTargetResolver({
		shouldHandleRequest: ({ cfg, accountId, request }) => shouldHandleSlackExecApprovalRequest({
			cfg,
			accountId,
			request
		}),
		resolveApprovers: getSlackExecApprovalApprovers,
		mapApprover: (approver) => ({ to: `user:${approver}` })
	}),
	notifyOriginWhenDmOnly: true
});
const slackNativeApprovalAdapter = splitChannelApprovalCapability(slackApprovalCapability);
//#endregion
//#region extensions/slack/src/sent-thread-cache.ts
const threadParticipation = resolveGlobalDedupeCache(Symbol.for("openclaw.slackThreadParticipation"), {
	ttlMs: 1440 * 60 * 1e3,
	maxSize: 5e3
});
function makeKey(accountId, channelId, threadTs) {
	return `${accountId}:${channelId}:${threadTs}`;
}
function recordSlackThreadParticipation(accountId, channelId, threadTs) {
	if (!accountId || !channelId || !threadTs) return;
	threadParticipation.check(makeKey(accountId, channelId, threadTs));
}
function hasSlackThreadParticipation(accountId, channelId, threadTs) {
	if (!accountId || !channelId || !threadTs) return false;
	return threadParticipation.peek(makeKey(accountId, channelId, threadTs));
}
function clearSlackThreadParticipationCache() {
	threadParticipation.clear();
}
//#endregion
//#region extensions/slack/src/monitor/allow-list.ts
const SLACK_SLUG_CACHE_MAX = 512;
const slackSlugCache = /* @__PURE__ */ new Map();
function normalizeSlackSlug(raw) {
	const key = raw ?? "";
	const cached = slackSlugCache.get(key);
	if (cached !== void 0) return cached;
	const normalized = normalizeHyphenSlug(raw);
	slackSlugCache.set(key, normalized);
	if (slackSlugCache.size > SLACK_SLUG_CACHE_MAX) {
		const oldest = slackSlugCache.keys().next();
		if (!oldest.done) slackSlugCache.delete(oldest.value);
	}
	return normalized;
}
function normalizeAllowList(list) {
	return normalizeStringEntries(list);
}
function normalizeAllowListLower(list) {
	return normalizeStringEntriesLower(list);
}
function normalizeSlackAllowOwnerEntry(entry) {
	const trimmed = entry.trim().toLowerCase();
	if (!trimmed || trimmed === "*") return;
	const withoutPrefix = trimmed.replace(/^(slack:|user:)/, "");
	return /^u[a-z0-9]+$/.test(withoutPrefix) ? withoutPrefix : void 0;
}
function resolveSlackAllowListMatch(params) {
	const compiledAllowList = compileAllowlist(params.allowList);
	const id = params.id?.toLowerCase();
	const name = params.name?.toLowerCase();
	const slug = normalizeSlackSlug(name);
	return resolveCompiledAllowlistMatch({
		compiledAllowlist: compiledAllowList,
		candidates: [
			{
				value: id,
				source: "id"
			},
			{
				value: id ? `slack:${id}` : void 0,
				source: "prefixed-id"
			},
			{
				value: id ? `user:${id}` : void 0,
				source: "prefixed-user"
			},
			...params.allowNameMatching === true ? [
				{
					value: name,
					source: "name"
				},
				{
					value: name ? `slack:${name}` : void 0,
					source: "prefixed-name"
				},
				{
					value: slug,
					source: "slug"
				}
			] : []
		]
	});
}
function allowListMatches(params) {
	return resolveSlackAllowListMatch(params).allowed;
}
function resolveSlackUserAllowed(params) {
	const allowList = normalizeAllowListLower(params.allowList);
	if (allowList.length === 0) return true;
	return allowListMatches({
		allowList,
		id: params.userId,
		name: params.userName,
		allowNameMatching: params.allowNameMatching
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
//#region extensions/slack/src/probe.ts
async function probeSlack(token, timeoutMs = 2500) {
	const client = createSlackWebClient(token);
	const start = Date.now();
	try {
		const result = await withTimeout(client.auth.test(), timeoutMs);
		if (!result.ok) return {
			ok: false,
			status: 200,
			error: result.error ?? "unknown",
			elapsedMs: Date.now() - start
		};
		return {
			ok: true,
			status: 200,
			elapsedMs: Date.now() - start,
			bot: {
				id: result.user_id,
				name: result.user
			},
			team: {
				id: result.team_id,
				name: result.team
			}
		};
	} catch (err) {
		const message = err instanceof Error ? err.message : String(err);
		return {
			ok: false,
			status: typeof err.status === "number" ? err.status : null,
			error: message,
			elapsedMs: Date.now() - start
		};
	}
}
//#endregion
export { normalizeSlackApproverId as _, normalizeAllowList as a, normalizeSlackSlug as c, clearSlackThreadParticipationCache as d, hasSlackThreadParticipation as f, isSlackExecApprovalClientEnabled as g, slackNativeApprovalAdapter as h, allowListMatches as i, resolveSlackAllowListMatch as l, slackApprovalCapability as m, resolveSlackGroupRequireMention as n, normalizeAllowListLower as o, recordSlackThreadParticipation as p, resolveSlackGroupToolPolicy as r, normalizeSlackAllowOwnerEntry as s, probeSlack as t, resolveSlackUserAllowed as u, shouldHandleSlackExecApprovalRequest as v, shouldSuppressLocalSlackExecApprovalPrompt as y };
