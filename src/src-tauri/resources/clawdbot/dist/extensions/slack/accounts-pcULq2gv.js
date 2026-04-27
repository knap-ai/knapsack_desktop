import { DEFAULT_ACCOUNT_ID, createAccountListHelpers, normalizeAccountId, resolveMergedAccountConfig } from "openclaw/plugin-sdk/account-resolution";
import { normalizeResolvedSecretInputString } from "openclaw/plugin-sdk/secret-input";
import { normalizeOptionalString } from "openclaw/plugin-sdk/text-runtime";
//#region extensions/slack/src/token.ts
function resolveSlackBotToken(raw, path = "channels.slack.botToken") {
	return normalizeResolvedSecretInputString({
		value: raw,
		path
	});
}
function resolveSlackAppToken(raw, path = "channels.slack.appToken") {
	return normalizeResolvedSecretInputString({
		value: raw,
		path
	});
}
function resolveSlackUserToken(raw, path = "channels.slack.userToken") {
	return normalizeResolvedSecretInputString({
		value: raw,
		path
	});
}
//#endregion
//#region extensions/slack/src/account-reply-mode.ts
function normalizeSlackChatType(raw) {
	const value = raw?.trim().toLowerCase();
	if (!value) return;
	if (value === "direct" || value === "dm") return "direct";
	if (value === "group" || value === "channel") return value;
}
function resolveSlackReplyToMode(account, chatType) {
	const normalized = normalizeSlackChatType(chatType ?? void 0);
	if (normalized && account.replyToModeByChatType?.[normalized] !== void 0) return account.replyToModeByChatType[normalized] ?? "off";
	if (normalized === "direct" && account.dm?.replyToMode !== void 0) return account.dm.replyToMode;
	return account.replyToMode ?? "off";
}
//#endregion
//#region extensions/slack/src/accounts.ts
const { listAccountIds, resolveDefaultAccountId } = createAccountListHelpers("slack");
const listSlackAccountIds = listAccountIds;
const resolveDefaultSlackAccountId = resolveDefaultAccountId;
function mergeSlackAccountConfig(cfg, accountId) {
	return resolveMergedAccountConfig({
		channelConfig: cfg.channels?.slack,
		accounts: cfg.channels?.slack?.accounts,
		accountId
	});
}
function resolveSlackAccount(params) {
	const accountId = normalizeAccountId(params.accountId ?? resolveDefaultSlackAccountId(params.cfg));
	const baseEnabled = params.cfg.channels?.slack?.enabled !== false;
	const merged = mergeSlackAccountConfig(params.cfg, accountId);
	const accountEnabled = merged.enabled !== false;
	const enabled = baseEnabled && accountEnabled;
	const mode = merged.mode ?? "socket";
	const baseAllowEnv = accountId === DEFAULT_ACCOUNT_ID;
	const botActive = enabled;
	const appActive = enabled && mode !== "http";
	const userActive = enabled;
	const envBot = botActive && baseAllowEnv ? resolveSlackBotToken(process.env.SLACK_BOT_TOKEN) : void 0;
	const envApp = appActive && baseAllowEnv ? resolveSlackAppToken(process.env.SLACK_APP_TOKEN) : void 0;
	const envUser = userActive && baseAllowEnv ? resolveSlackUserToken(process.env.SLACK_USER_TOKEN) : void 0;
	const configBot = botActive ? resolveSlackBotToken(merged.botToken, `channels.slack.accounts.${accountId}.botToken`) : void 0;
	const configApp = appActive ? resolveSlackAppToken(merged.appToken, `channels.slack.accounts.${accountId}.appToken`) : void 0;
	const configUser = userActive ? resolveSlackUserToken(merged.userToken, `channels.slack.accounts.${accountId}.userToken`) : void 0;
	const botToken = configBot ?? envBot;
	const appToken = configApp ?? envApp;
	const userToken = configUser ?? envUser;
	const botTokenSource = configBot ? "config" : envBot ? "env" : "none";
	const appTokenSource = configApp ? "config" : envApp ? "env" : "none";
	const userTokenSource = configUser ? "config" : envUser ? "env" : "none";
	return {
		accountId,
		enabled,
		name: normalizeOptionalString(merged.name),
		botToken,
		appToken,
		userToken,
		botTokenSource,
		appTokenSource,
		userTokenSource,
		config: merged,
		groupPolicy: merged.groupPolicy,
		textChunkLimit: merged.textChunkLimit,
		mediaMaxMb: merged.mediaMaxMb,
		reactionNotifications: merged.reactionNotifications,
		reactionAllowlist: merged.reactionAllowlist,
		replyToMode: merged.replyToMode,
		replyToModeByChatType: merged.replyToModeByChatType,
		actions: merged.actions,
		slashCommand: merged.slashCommand,
		dm: merged.dm,
		channels: merged.channels
	};
}
function listEnabledSlackAccounts(cfg) {
	return listSlackAccountIds(cfg).map((accountId) => resolveSlackAccount({
		cfg,
		accountId
	})).filter((account) => account.enabled);
}
//#endregion
export { resolveSlackAccount as a, resolveSlackBotToken as c, resolveDefaultSlackAccountId as i, listSlackAccountIds as n, resolveSlackReplyToMode as o, mergeSlackAccountConfig as r, resolveSlackAppToken as s, listEnabledSlackAccounts as t };
