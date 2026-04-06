import { _ as normalizeAccountId } from "./session-key-D7XpmyVq.js";
import { i as createActionGate } from "./common-RGbDbB5n.js";
import "./directory-runtime-Rwkajwwt.js";
import { i as createResolvedDirectoryEntriesLister } from "./directory-config-helpers-C_EYixJ2.js";
import "./agent-runtime-B7ucOTD-.js";
import "./account-resolution-CahYTlaB.js";
import { a as resolveSlackAccount, i as resolveDefaultSlackAccountId, o as resolveSlackReplyToMode, r as mergeSlackAccountConfig, t as listEnabledSlackAccounts } from "./accounts-DHZuUL28.js";
import { l as parseSlackTarget, r as createSlackWebClient } from "./client-Cm0jR4_W.js";
import { o as normalizeAllowListLower } from "./probe-B3VY9yHG.js";
//#region extensions/slack/src/action-threading.ts
function resolveSlackAutoThreadId(params) {
	const context = params.toolContext;
	if (!context?.currentThreadTs || !context.currentChannelId) return;
	if (context.replyToMode !== "all" && context.replyToMode !== "first") return;
	const parsedTarget = parseSlackTarget(params.to, { defaultKind: "channel" });
	if (!parsedTarget || parsedTarget.kind !== "channel") return;
	if (parsedTarget.id.toLowerCase() !== context.currentChannelId.toLowerCase()) return;
	if (context.replyToMode === "first" && context.hasRepliedRef?.value) return;
	return context.currentThreadTs;
}
//#endregion
//#region extensions/slack/src/message-actions.ts
function listSlackMessageActions(cfg) {
	const accounts = listEnabledSlackAccounts(cfg).filter((account) => account.botTokenSource !== "none");
	if (accounts.length === 0) return [];
	const isActionEnabled = (key, defaultValue = true) => {
		for (const account of accounts) if (createActionGate(account.actions ?? cfg.channels?.slack?.actions)(key, defaultValue)) return true;
		return false;
	};
	const actions = new Set(["send"]);
	if (isActionEnabled("reactions")) {
		actions.add("react");
		actions.add("reactions");
	}
	if (isActionEnabled("messages")) {
		actions.add("read");
		actions.add("edit");
		actions.add("delete");
		actions.add("download-file");
		actions.add("upload-file");
	}
	if (isActionEnabled("pins")) {
		actions.add("pin");
		actions.add("unpin");
		actions.add("list-pins");
	}
	if (isActionEnabled("memberInfo")) actions.add("member-info");
	if (isActionEnabled("emojiList")) actions.add("emoji-list");
	return Array.from(actions);
}
function extractSlackToolSend(args) {
	if ((typeof args.action === "string" ? args.action.trim() : "") !== "sendMessage") return null;
	const to = typeof args.to === "string" ? args.to : void 0;
	if (!to) return null;
	return {
		to,
		accountId: typeof args.accountId === "string" ? args.accountId.trim() : void 0
	};
}
//#endregion
//#region extensions/slack/src/channel-type.ts
const SLACK_CHANNEL_TYPE_CACHE = /* @__PURE__ */ new Map();
async function resolveSlackChannelType(params) {
	const channelId = params.channelId.trim();
	if (!channelId) return "unknown";
	const cacheKey = `${params.accountId ?? "default"}:${channelId}`;
	const cached = SLACK_CHANNEL_TYPE_CACHE.get(cacheKey);
	if (cached) return cached;
	const account = resolveSlackAccount({
		cfg: params.cfg,
		accountId: params.accountId
	});
	const groupChannels = normalizeAllowListLower(account.dm?.groupChannels);
	const channelIdLower = channelId.toLowerCase();
	if (groupChannels.includes(channelIdLower) || groupChannels.includes(`slack:${channelIdLower}`) || groupChannels.includes(`channel:${channelIdLower}`) || groupChannels.includes(`group:${channelIdLower}`) || groupChannels.includes(`mpim:${channelIdLower}`)) {
		SLACK_CHANNEL_TYPE_CACHE.set(cacheKey, "group");
		return "group";
	}
	if (Object.keys(account.channels ?? {}).some((key) => {
		const normalized = key.trim().toLowerCase();
		return normalized === channelIdLower || normalized === `channel:${channelIdLower}` || normalized.replace(/^#/, "") === channelIdLower;
	})) {
		SLACK_CHANNEL_TYPE_CACHE.set(cacheKey, "channel");
		return "channel";
	}
	const token = account.botToken?.trim() || account.config.userToken?.trim() || "";
	if (!token) {
		SLACK_CHANNEL_TYPE_CACHE.set(cacheKey, "unknown");
		return "unknown";
	}
	try {
		const channel = (await createSlackWebClient(token).conversations.info({ channel: channelId })).channel;
		const type = channel?.is_im ? "dm" : channel?.is_mpim ? "group" : "channel";
		SLACK_CHANNEL_TYPE_CACHE.set(cacheKey, type);
		return type;
	} catch {
		SLACK_CHANNEL_TYPE_CACHE.set(cacheKey, "unknown");
		return "unknown";
	}
}
//#endregion
//#region extensions/slack/src/directory-config.ts
function resolveSlackDirectoryConfigAccount(cfg, accountId) {
	const resolvedAccountId = normalizeAccountId(accountId ?? resolveDefaultSlackAccountId(cfg));
	const config = mergeSlackAccountConfig(cfg, resolvedAccountId);
	return {
		accountId: resolvedAccountId,
		config,
		dm: config.dm
	};
}
const listSlackDirectoryPeersFromConfig = createResolvedDirectoryEntriesLister({
	kind: "user",
	resolveAccount: (cfg, accountId) => resolveSlackDirectoryConfigAccount(cfg, accountId),
	resolveSources: (account) => {
		const allowFrom = account.config.allowFrom ?? account.dm?.allowFrom ?? [];
		const channelUsers = Object.values(account.config.channels ?? {}).flatMap((channel) => channel.users ?? []);
		return [
			allowFrom,
			Object.keys(account.config.dms ?? {}),
			channelUsers
		];
	},
	normalizeId: (raw) => {
		const normalizedUserId = (raw.match(/^<@([A-Z0-9]+)>$/i)?.[1] ?? raw).replace(/^(slack|user):/i, "").trim();
		if (!normalizedUserId) return null;
		const normalized = parseSlackTarget(`user:${normalizedUserId}`, { defaultKind: "user" });
		return normalized?.kind === "user" ? `user:${normalized.id.toLowerCase()}` : null;
	}
});
const listSlackDirectoryGroupsFromConfig = createResolvedDirectoryEntriesLister({
	kind: "group",
	resolveAccount: (cfg, accountId) => resolveSlackDirectoryConfigAccount(cfg, accountId),
	resolveSources: (account) => [Object.keys(account.config.channels ?? {})],
	normalizeId: (raw) => {
		const normalized = parseSlackTarget(raw, { defaultKind: "channel" });
		return normalized?.kind === "channel" ? `channel:${normalized.id.toLowerCase()}` : null;
	}
});
//#endregion
//#region extensions/slack/src/threading-tool-context.ts
function buildSlackThreadingToolContext(params) {
	const configuredReplyToMode = resolveSlackReplyToMode(resolveSlackAccount({
		cfg: params.cfg,
		accountId: params.accountId
	}), params.context.ChatType);
	const effectiveReplyToMode = params.context.MessageThreadId != null ? "all" : configuredReplyToMode;
	const threadId = params.context.MessageThreadId ?? params.context.ReplyToId;
	return {
		currentChannelId: params.context.To?.startsWith("channel:") ? params.context.To.slice(8) : params.context.NativeChannelId?.trim() || void 0,
		currentThreadTs: threadId != null ? String(threadId) : void 0,
		replyToMode: effectiveReplyToMode,
		hasRepliedRef: params.hasRepliedRef
	};
}
//#endregion
export { extractSlackToolSend as a, resolveSlackChannelType as i, listSlackDirectoryGroupsFromConfig as n, listSlackMessageActions as o, listSlackDirectoryPeersFromConfig as r, resolveSlackAutoThreadId as s, buildSlackThreadingToolContext as t };
