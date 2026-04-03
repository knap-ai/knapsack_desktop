import { _ as normalizeAccountId, g as DEFAULT_ACCOUNT_ID } from "./session-key-D7XpmyVq.js";
import { a as hasConfiguredSecretInput, l as normalizeSecretInputString } from "./types.secrets-DTXJhyWe.js";
import "./secret-input-C8U7qpTM.js";
import "./account-resolution-CahYTlaB.js";
import { a as resolveSlackAccount, i as resolveDefaultSlackAccountId, r as mergeSlackAccountConfig } from "./accounts-DHZuUL28.js";
//#region extensions/slack/src/interactive-replies.ts
function resolveInteractiveRepliesFromCapabilities(capabilities) {
	if (!capabilities) return false;
	if (Array.isArray(capabilities)) return capabilities.some((entry) => String(entry).trim().toLowerCase() === "interactivereplies");
	if (typeof capabilities === "object") return capabilities.interactiveReplies === true;
	return false;
}
function isSlackInteractiveRepliesEnabled(params) {
	return resolveInteractiveRepliesFromCapabilities(resolveSlackAccount({
		cfg: params.cfg,
		accountId: params.accountId ?? resolveDefaultSlackAccountId(params.cfg)
	}).config.capabilities);
}
//#endregion
//#region extensions/slack/src/account-inspect.ts
function inspectSlackToken(value) {
	const token = normalizeSecretInputString(value);
	if (token) return {
		token,
		source: "config",
		status: "available"
	};
	if (hasConfiguredSecretInput(value)) return {
		source: "config",
		status: "configured_unavailable"
	};
	return {
		source: "none",
		status: "missing"
	};
}
function inspectSlackAccount(params) {
	const accountId = normalizeAccountId(params.accountId ?? resolveDefaultSlackAccountId(params.cfg));
	const merged = mergeSlackAccountConfig(params.cfg, accountId);
	const enabled = params.cfg.channels?.slack?.enabled !== false && merged.enabled !== false;
	const allowEnv = accountId === DEFAULT_ACCOUNT_ID;
	const mode = merged.mode ?? "socket";
	const isHttpMode = mode === "http";
	const configBot = inspectSlackToken(merged.botToken);
	const configApp = inspectSlackToken(merged.appToken);
	const configSigningSecret = inspectSlackToken(merged.signingSecret);
	const configUser = inspectSlackToken(merged.userToken);
	const envBot = allowEnv ? normalizeSecretInputString(params.envBotToken ?? process.env.SLACK_BOT_TOKEN) : void 0;
	const envApp = allowEnv ? normalizeSecretInputString(params.envAppToken ?? process.env.SLACK_APP_TOKEN) : void 0;
	const envUser = allowEnv ? normalizeSecretInputString(params.envUserToken ?? process.env.SLACK_USER_TOKEN) : void 0;
	const botToken = configBot.token ?? envBot;
	const appToken = configApp.token ?? envApp;
	const signingSecret = configSigningSecret.token;
	const userToken = configUser.token ?? envUser;
	const botTokenSource = configBot.token ? "config" : configBot.status === "configured_unavailable" ? "config" : envBot ? "env" : "none";
	const appTokenSource = configApp.token ? "config" : configApp.status === "configured_unavailable" ? "config" : envApp ? "env" : "none";
	const signingSecretSource = configSigningSecret.token ? "config" : configSigningSecret.status === "configured_unavailable" ? "config" : "none";
	const userTokenSource = configUser.token ? "config" : configUser.status === "configured_unavailable" ? "config" : envUser ? "env" : "none";
	return {
		accountId,
		enabled,
		name: merged.name?.trim() || void 0,
		mode,
		botToken,
		appToken,
		...isHttpMode ? { signingSecret } : {},
		userToken,
		botTokenSource,
		appTokenSource,
		...isHttpMode ? { signingSecretSource } : {},
		userTokenSource,
		botTokenStatus: configBot.token ? "available" : configBot.status === "configured_unavailable" ? "configured_unavailable" : envBot ? "available" : "missing",
		appTokenStatus: configApp.token ? "available" : configApp.status === "configured_unavailable" ? "configured_unavailable" : envApp ? "available" : "missing",
		...isHttpMode ? { signingSecretStatus: configSigningSecret.token ? "available" : configSigningSecret.status === "configured_unavailable" ? "configured_unavailable" : "missing" } : {},
		userTokenStatus: configUser.token ? "available" : configUser.status === "configured_unavailable" ? "configured_unavailable" : envUser ? "available" : "missing",
		configured: isHttpMode ? (configBot.status !== "missing" || Boolean(envBot)) && configSigningSecret.status !== "missing" : (configBot.status !== "missing" || Boolean(envBot)) && (configApp.status !== "missing" || Boolean(envApp)),
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
//#endregion
export { isSlackInteractiveRepliesEnabled as n, inspectSlackAccount as t };
