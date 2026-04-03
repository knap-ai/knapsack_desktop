import { r as formatErrorMessage } from "./errors-Bs2h5H8p.js";
import { s as registerUnhandledRejectionHandler } from "./unhandled-rejections-BWJ-75jM.js";
import { Ht as resolveAgentMaxConcurrent, c as loadConfig } from "./io-DhtVmzAJ.js";
import { c as jsonResult, d as readNumberParam, f as readReactionParams, h as readStringParam, m as readStringOrNumberParam, p as readStringArrayParam } from "./common-RGbDbB5n.js";
import { r as resolvePollMaxSelections } from "./polls-Dua9EwFF.js";
import { r as makeProxyFetch } from "./proxy-fetch-Bib4caGq.js";
import { t as readBooleanParam } from "./boolean-param-ykmVVkpE.js";
import { t as resolveTelegramToken } from "./token-c341LyYr.js";
import { t as waitForAbortSignal } from "./abort-signal-DSOoJR_B.js";
import "./runtime-env-CoykX19-.js";
import "./config-runtime-CmISCurQ.js";
import "./ssrf-runtime-BoGiIhjZ.js";
import { t as extractToolSend } from "./tool-send-CcRqBFAk.js";
import { a as listTokenSourcedAccounts, i as createUnionActionGate, r as resolveReactionMessageId, t as createMessageToolButtonsSchema } from "./channel-actions-DVMcrs0t.js";
import "./telegram-core-D06a1-N4.js";
import { l as resolveTelegramPollActionGateState, n as listEnabledTelegramAccounts, s as resolveTelegramAccount, t as createTelegramActionGate } from "./accounts-Dh_rfg3W.js";
import { a as resolveTelegramTargetChatType } from "./targets-CxxizSi5.js";
import { r as resolveTelegramTransport } from "./fetch-DttJw83W.js";
import { a as isTelegramExecApprovalHandlerConfigured, h as resolveTelegramInlineButtonsScope, p as isTelegramInlineButtonsEnabled } from "./exec-approvals-BVAdWdf7.js";
import { n as fitsTelegramCallbackData, t as resolveTelegramInlineButtons } from "./button-types-BhHJDvdC.js";
import { a as resolveTelegramReactionLevel } from "./probe-DlyAwB0k.js";
import { C as isRecoverableTelegramNetworkError, E as isTelegramPollingNetworkError, _ as sendPollTelegram, c as createForumTopicTelegram, f as editMessageTelegram, g as sendMessageTelegram, i as getCacheStats, l as deleteMessageTelegram, m as reactMessageTelegram, o as searchStickers, u as editForumTopicTelegram, v as sendStickerTelegram } from "./sticker-cache-Cf0p9p0n.js";
import { t as resolveTelegramAllowedUpdates } from "./allowed-updates-DrmjQgd3.js";
import { Type } from "@sinclair/typebox";
//#region extensions/telegram/src/action-runtime.ts
const telegramActionRuntime = {
	createForumTopicTelegram,
	deleteMessageTelegram,
	editForumTopicTelegram,
	editMessageTelegram,
	getCacheStats,
	reactMessageTelegram,
	searchStickers,
	sendMessageTelegram,
	sendPollTelegram,
	sendStickerTelegram
};
const TELEGRAM_BUTTON_STYLES = [
	"danger",
	"success",
	"primary"
];
const TELEGRAM_FORUM_TOPIC_ICON_COLORS = [
	7322096,
	16766590,
	13338331,
	9367192,
	16749490,
	16478047
];
const TELEGRAM_ACTION_ALIASES = {
	createForumTopic: "createForumTopic",
	delete: "deleteMessage",
	deleteMessage: "deleteMessage",
	edit: "editMessage",
	editForumTopic: "editForumTopic",
	editMessage: "editMessage",
	poll: "poll",
	react: "react",
	searchSticker: "searchSticker",
	send: "sendMessage",
	sendMessage: "sendMessage",
	sendSticker: "sendSticker",
	sticker: "sendSticker",
	stickerCacheStats: "stickerCacheStats",
	"sticker-search": "searchSticker",
	"topic-create": "createForumTopic",
	"topic-edit": "editForumTopic"
};
function readTelegramForumTopicIconColor(params) {
	const iconColor = readNumberParam(params, "iconColor", { integer: true });
	if (iconColor == null) return;
	if (!TELEGRAM_FORUM_TOPIC_ICON_COLORS.includes(iconColor)) throw new Error("iconColor must be one of Telegram's supported forum topic colors.");
	return iconColor;
}
function resolveTelegramPollVisibility(params) {
	if (params.pollAnonymous && params.pollPublic) throw new Error("pollAnonymous and pollPublic are mutually exclusive");
	if (params.pollAnonymous) return true;
	if (params.pollPublic) return false;
}
function readTelegramButtons(params) {
	const raw = params.buttons;
	if (raw == null) return;
	if (!Array.isArray(raw)) throw new Error("buttons must be an array of button rows");
	const filtered = raw.map((row, rowIndex) => {
		if (!Array.isArray(row)) throw new Error(`buttons[${rowIndex}] must be an array`);
		return row.map((button, buttonIndex) => {
			if (!button || typeof button !== "object") throw new Error(`buttons[${rowIndex}][${buttonIndex}] must be an object`);
			const rawButton = button;
			const text = typeof rawButton.text === "string" ? rawButton.text.trim() : "";
			const callbackData = typeof rawButton.callback_data === "string" ? rawButton.callback_data.trim() : "";
			if (!text || !callbackData) throw new Error(`buttons[${rowIndex}][${buttonIndex}] requires text and callback_data`);
			if (!fitsTelegramCallbackData(callbackData)) throw new Error(`buttons[${rowIndex}][${buttonIndex}] callback_data too long (max 64 bytes)`);
			const styleRaw = rawButton.style;
			const style = typeof styleRaw === "string" ? styleRaw.trim().toLowerCase() : void 0;
			if (styleRaw !== void 0 && !style) throw new Error(`buttons[${rowIndex}][${buttonIndex}] style must be string`);
			if (style && !TELEGRAM_BUTTON_STYLES.includes(style)) throw new Error(`buttons[${rowIndex}][${buttonIndex}] style must be one of ${TELEGRAM_BUTTON_STYLES.join(", ")}`);
			return {
				text,
				callback_data: callbackData,
				...style ? { style } : {}
			};
		});
	}).filter((row) => row.length > 0);
	return filtered.length > 0 ? filtered : void 0;
}
function normalizeTelegramActionName(action) {
	const normalized = TELEGRAM_ACTION_ALIASES[action];
	if (!normalized) throw new Error(`Unsupported Telegram action: ${action}`);
	return normalized;
}
function readTelegramChatId(params) {
	return readStringOrNumberParam(params, "chatId") ?? readStringOrNumberParam(params, "channelId") ?? readStringOrNumberParam(params, "to", { required: true });
}
function readTelegramThreadId(params) {
	return readNumberParam(params, "messageThreadId", { integer: true }) ?? readNumberParam(params, "threadId", { integer: true });
}
function readTelegramReplyToMessageId(params) {
	return readNumberParam(params, "replyToMessageId", { integer: true }) ?? readNumberParam(params, "replyTo", { integer: true });
}
function resolveTelegramButtonsFromParams(params) {
	return resolveTelegramInlineButtons({
		buttons: readTelegramButtons(params),
		interactive: params.interactive
	});
}
function readTelegramSendContent(params) {
	const content = readStringParam(params.args, "content", { allowEmpty: true }) ?? readStringParam(params.args, "message", { allowEmpty: true }) ?? readStringParam(params.args, "caption", { allowEmpty: true });
	if (content == null && !params.mediaUrl && !params.hasButtons) throw new Error("content required.");
	return content ?? "";
}
async function handleTelegramAction(params, cfg, options) {
	const { action, accountId } = {
		action: normalizeTelegramActionName(readStringParam(params, "action", { required: true })),
		accountId: readStringParam(params, "accountId")
	};
	const isActionEnabled = createTelegramActionGate({
		cfg,
		accountId
	});
	if (action === "react") {
		const reactionLevelInfo = resolveTelegramReactionLevel({
			cfg,
			accountId: accountId ?? void 0
		});
		if (!reactionLevelInfo.agentReactionsEnabled) return jsonResult({
			ok: false,
			reason: "disabled",
			hint: `Telegram agent reactions disabled (reactionLevel="${reactionLevelInfo.level}"). Do not retry.`
		});
		if (!isActionEnabled("reactions")) return jsonResult({
			ok: false,
			reason: "disabled",
			hint: "Telegram reactions are disabled via actions.reactions. Do not retry."
		});
		const chatId = readTelegramChatId(params);
		const messageId = readNumberParam(params, "messageId", { integer: true }) ?? resolveReactionMessageId({ args: params });
		if (typeof messageId !== "number" || !Number.isFinite(messageId) || messageId <= 0) return jsonResult({
			ok: false,
			reason: "missing_message_id",
			hint: "Telegram reaction requires a valid messageId (or inbound context fallback). Do not retry."
		});
		const { emoji, remove, isEmpty } = readReactionParams(params, { removeErrorMessage: "Emoji is required to remove a Telegram reaction." });
		const token = resolveTelegramToken(cfg, { accountId }).token;
		if (!token) return jsonResult({
			ok: false,
			reason: "missing_token",
			hint: "Telegram bot token missing. Do not retry."
		});
		let reactionResult;
		try {
			reactionResult = await telegramActionRuntime.reactMessageTelegram(chatId ?? "", messageId ?? 0, emoji ?? "", {
				cfg,
				token,
				remove,
				accountId: accountId ?? void 0
			});
		} catch (err) {
			const isInvalid = String(err).includes("REACTION_INVALID");
			return jsonResult({
				ok: false,
				reason: isInvalid ? "REACTION_INVALID" : "error",
				emoji,
				hint: isInvalid ? "This emoji is not supported for Telegram reactions. Add it to your reaction disallow list so you do not try it again." : "Reaction failed. Do not retry."
			});
		}
		if (!reactionResult.ok) return jsonResult({
			ok: false,
			warning: reactionResult.warning,
			...remove || isEmpty ? { removed: true } : { added: emoji }
		});
		if (!remove && !isEmpty) return jsonResult({
			ok: true,
			added: emoji
		});
		return jsonResult({
			ok: true,
			removed: true
		});
	}
	if (action === "sendMessage") {
		if (!isActionEnabled("sendMessage")) throw new Error("Telegram sendMessage is disabled.");
		const to = readStringParam(params, "to", { required: true });
		const mediaUrl = readStringParam(params, "mediaUrl") ?? readStringParam(params, "media", { trim: false });
		const buttons = resolveTelegramButtonsFromParams(params);
		const content = readTelegramSendContent({
			args: params,
			mediaUrl: mediaUrl ?? void 0,
			hasButtons: Array.isArray(buttons) && buttons.length > 0
		});
		if (buttons) {
			const inlineButtonsScope = resolveTelegramInlineButtonsScope({
				cfg,
				accountId: accountId ?? void 0
			});
			if (inlineButtonsScope === "off") throw new Error("Telegram inline buttons are disabled. Set channels.telegram.capabilities.inlineButtons to \"dm\", \"group\", \"all\", or \"allowlist\".");
			if (inlineButtonsScope === "dm" || inlineButtonsScope === "group") {
				const targetType = resolveTelegramTargetChatType(to);
				if (targetType === "unknown") throw new Error(`Telegram inline buttons require a numeric chat id when inlineButtons="${inlineButtonsScope}".`);
				if (inlineButtonsScope === "dm" && targetType !== "direct") throw new Error("Telegram inline buttons are limited to DMs when inlineButtons=\"dm\".");
				if (inlineButtonsScope === "group" && targetType !== "group") throw new Error("Telegram inline buttons are limited to groups when inlineButtons=\"group\".");
			}
		}
		const replyToMessageId = readTelegramReplyToMessageId(params);
		const messageThreadId = readTelegramThreadId(params);
		const quoteText = readStringParam(params, "quoteText");
		const token = resolveTelegramToken(cfg, { accountId }).token;
		if (!token) throw new Error("Telegram bot token missing. Set TELEGRAM_BOT_TOKEN or channels.telegram.botToken.");
		const result = await telegramActionRuntime.sendMessageTelegram(to, content, {
			cfg,
			token,
			accountId: accountId ?? void 0,
			mediaUrl: mediaUrl || void 0,
			mediaLocalRoots: options?.mediaLocalRoots,
			mediaReadFile: options?.mediaReadFile,
			buttons,
			replyToMessageId: replyToMessageId ?? void 0,
			messageThreadId: messageThreadId ?? void 0,
			quoteText: quoteText ?? void 0,
			asVoice: readBooleanParam(params, "asVoice"),
			silent: readBooleanParam(params, "silent"),
			forceDocument: readBooleanParam(params, "forceDocument") ?? readBooleanParam(params, "asDocument") ?? false
		});
		return jsonResult({
			ok: true,
			messageId: result.messageId,
			chatId: result.chatId
		});
	}
	if (action === "poll") {
		const pollActionState = resolveTelegramPollActionGateState(isActionEnabled);
		if (!pollActionState.sendMessageEnabled) throw new Error("Telegram sendMessage is disabled.");
		if (!pollActionState.pollEnabled) throw new Error("Telegram polls are disabled.");
		const to = readStringParam(params, "to", { required: true });
		const question = readStringParam(params, "question") ?? readStringParam(params, "pollQuestion", { required: true });
		const answers = readStringArrayParam(params, "answers") ?? readStringArrayParam(params, "pollOption", { required: true });
		const allowMultiselect = readBooleanParam(params, "allowMultiselect") ?? readBooleanParam(params, "pollMulti");
		const durationSeconds = readNumberParam(params, "durationSeconds", { integer: true }) ?? readNumberParam(params, "pollDurationSeconds", {
			integer: true,
			strict: true
		});
		const durationHours = readNumberParam(params, "durationHours", { integer: true }) ?? readNumberParam(params, "pollDurationHours", {
			integer: true,
			strict: true
		});
		const replyToMessageId = readTelegramReplyToMessageId(params);
		const messageThreadId = readTelegramThreadId(params);
		const isAnonymous = readBooleanParam(params, "isAnonymous") ?? resolveTelegramPollVisibility({
			pollAnonymous: readBooleanParam(params, "pollAnonymous"),
			pollPublic: readBooleanParam(params, "pollPublic")
		});
		const silent = readBooleanParam(params, "silent");
		const token = resolveTelegramToken(cfg, { accountId }).token;
		if (!token) throw new Error("Telegram bot token missing. Set TELEGRAM_BOT_TOKEN or channels.telegram.botToken.");
		const result = await telegramActionRuntime.sendPollTelegram(to, {
			question,
			options: answers,
			maxSelections: resolvePollMaxSelections(answers.length, allowMultiselect ?? false),
			durationSeconds: durationSeconds ?? void 0,
			durationHours: durationHours ?? void 0
		}, {
			cfg,
			token,
			accountId: accountId ?? void 0,
			replyToMessageId: replyToMessageId ?? void 0,
			messageThreadId: messageThreadId ?? void 0,
			isAnonymous: isAnonymous ?? void 0,
			silent: silent ?? void 0
		});
		return jsonResult({
			ok: true,
			messageId: result.messageId,
			chatId: result.chatId,
			pollId: result.pollId
		});
	}
	if (action === "deleteMessage") {
		if (!isActionEnabled("deleteMessage")) throw new Error("Telegram deleteMessage is disabled.");
		const chatId = readTelegramChatId(params);
		const messageId = readNumberParam(params, "messageId", {
			required: true,
			integer: true
		});
		const token = resolveTelegramToken(cfg, { accountId }).token;
		if (!token) throw new Error("Telegram bot token missing. Set TELEGRAM_BOT_TOKEN or channels.telegram.botToken.");
		await telegramActionRuntime.deleteMessageTelegram(chatId ?? "", messageId ?? 0, {
			cfg,
			token,
			accountId: accountId ?? void 0
		});
		return jsonResult({
			ok: true,
			deleted: true
		});
	}
	if (action === "editMessage") {
		if (!isActionEnabled("editMessage")) throw new Error("Telegram editMessage is disabled.");
		const chatId = readTelegramChatId(params);
		const messageId = readNumberParam(params, "messageId", {
			required: true,
			integer: true
		});
		const content = readStringParam(params, "content", { allowEmpty: false }) ?? readStringParam(params, "message", {
			required: true,
			allowEmpty: false
		});
		const buttons = resolveTelegramButtonsFromParams(params);
		if (buttons) {
			if (resolveTelegramInlineButtonsScope({
				cfg,
				accountId: accountId ?? void 0
			}) === "off") throw new Error("Telegram inline buttons are disabled. Set channels.telegram.capabilities.inlineButtons to \"dm\", \"group\", \"all\", or \"allowlist\".");
		}
		const token = resolveTelegramToken(cfg, { accountId }).token;
		if (!token) throw new Error("Telegram bot token missing. Set TELEGRAM_BOT_TOKEN or channels.telegram.botToken.");
		const result = await telegramActionRuntime.editMessageTelegram(chatId ?? "", messageId ?? 0, content, {
			cfg,
			token,
			accountId: accountId ?? void 0,
			buttons
		});
		return jsonResult({
			ok: true,
			messageId: result.messageId,
			chatId: result.chatId
		});
	}
	if (action === "sendSticker") {
		if (!isActionEnabled("sticker", false)) throw new Error("Telegram sticker actions are disabled. Set channels.telegram.actions.sticker to true.");
		const to = readStringParam(params, "to") ?? readStringParam(params, "target", { required: true });
		const fileId = readStringParam(params, "fileId") ?? readStringArrayParam(params, "stickerId")?.[0];
		if (!fileId) throw new Error("fileId is required.");
		const replyToMessageId = readTelegramReplyToMessageId(params);
		const messageThreadId = readTelegramThreadId(params);
		const token = resolveTelegramToken(cfg, { accountId }).token;
		if (!token) throw new Error("Telegram bot token missing. Set TELEGRAM_BOT_TOKEN or channels.telegram.botToken.");
		const result = await telegramActionRuntime.sendStickerTelegram(to, fileId, {
			cfg,
			token,
			accountId: accountId ?? void 0,
			replyToMessageId: replyToMessageId ?? void 0,
			messageThreadId: messageThreadId ?? void 0
		});
		return jsonResult({
			ok: true,
			messageId: result.messageId,
			chatId: result.chatId
		});
	}
	if (action === "searchSticker") {
		if (!isActionEnabled("sticker", false)) throw new Error("Telegram sticker actions are disabled. Set channels.telegram.actions.sticker to true.");
		const query = readStringParam(params, "query", { required: true });
		const limit = readNumberParam(params, "limit", { integer: true }) ?? 5;
		const results = telegramActionRuntime.searchStickers(query, limit);
		return jsonResult({
			ok: true,
			count: results.length,
			stickers: results.map((s) => ({
				fileId: s.fileId,
				emoji: s.emoji,
				description: s.description,
				setName: s.setName
			}))
		});
	}
	if (action === "stickerCacheStats") return jsonResult({
		ok: true,
		...telegramActionRuntime.getCacheStats()
	});
	if (action === "createForumTopic") {
		if (!isActionEnabled("createForumTopic")) throw new Error("Telegram createForumTopic is disabled.");
		const chatId = readTelegramChatId(params);
		const name = readStringParam(params, "name", { required: true });
		const iconColor = readTelegramForumTopicIconColor(params);
		const iconCustomEmojiId = readStringParam(params, "iconCustomEmojiId");
		const token = resolveTelegramToken(cfg, { accountId }).token;
		if (!token) throw new Error("Telegram bot token missing. Set TELEGRAM_BOT_TOKEN or channels.telegram.botToken.");
		const result = await telegramActionRuntime.createForumTopicTelegram(chatId ?? "", name, {
			cfg,
			token,
			accountId: accountId ?? void 0,
			iconColor,
			iconCustomEmojiId: iconCustomEmojiId ?? void 0
		});
		return jsonResult({
			ok: true,
			topicId: result.topicId,
			name: result.name,
			chatId: result.chatId
		});
	}
	if (action === "editForumTopic") {
		if (!isActionEnabled("editForumTopic")) throw new Error("Telegram editForumTopic is disabled.");
		const chatId = readTelegramChatId(params);
		const messageThreadId = readTelegramThreadId(params);
		if (typeof messageThreadId !== "number") throw new Error("messageThreadId or threadId is required.");
		const name = readStringParam(params, "name");
		const iconCustomEmojiId = readStringParam(params, "iconCustomEmojiId");
		const token = resolveTelegramToken(cfg, { accountId }).token;
		if (!token) throw new Error("Telegram bot token missing. Set TELEGRAM_BOT_TOKEN or channels.telegram.botToken.");
		return jsonResult(await telegramActionRuntime.editForumTopicTelegram(chatId ?? "", messageThreadId, {
			cfg,
			token,
			accountId: accountId ?? void 0,
			name: name ?? void 0,
			iconCustomEmojiId: iconCustomEmojiId ?? void 0
		}));
	}
	throw new Error(`Unsupported Telegram action: ${action}`);
}
//#endregion
//#region extensions/telegram/src/message-tool-schema.ts
function createTelegramPollExtraToolSchemas() {
	return {
		pollDurationSeconds: Type.Optional(Type.Number()),
		pollAnonymous: Type.Optional(Type.Boolean()),
		pollPublic: Type.Optional(Type.Boolean())
	};
}
//#endregion
//#region extensions/telegram/src/channel-actions.ts
const telegramMessageActionRuntime = { handleTelegramAction };
const TELEGRAM_MESSAGE_ACTION_MAP = {
	delete: "deleteMessage",
	edit: "editMessage",
	poll: "poll",
	react: "react",
	send: "sendMessage",
	sticker: "sendSticker",
	"sticker-search": "searchSticker",
	"topic-create": "createForumTopic",
	"topic-edit": "editForumTopic"
};
function resolveTelegramMessageActionName(action) {
	return TELEGRAM_MESSAGE_ACTION_MAP[action];
}
function resolveTelegramActionDiscovery(cfg) {
	const accounts = listTokenSourcedAccounts(listEnabledTelegramAccounts(cfg));
	if (accounts.length === 0) return null;
	const unionGate = createUnionActionGate(accounts, (account) => createTelegramActionGate({
		cfg,
		accountId: account.accountId
	}));
	return {
		isEnabled: (key, defaultValue = true) => unionGate(key, defaultValue),
		pollEnabled: accounts.some((account) => {
			return resolveTelegramPollActionGateState(createTelegramActionGate({
				cfg,
				accountId: account.accountId
			})).enabled;
		}),
		buttonsEnabled: accounts.some((account) => isTelegramInlineButtonsEnabled({
			cfg,
			accountId: account.accountId
		}))
	};
}
function describeTelegramMessageTool({ cfg }) {
	const discovery = resolveTelegramActionDiscovery(cfg);
	if (!discovery) return {
		actions: [],
		capabilities: [],
		schema: null
	};
	const actions = new Set(["send"]);
	if (discovery.pollEnabled) actions.add("poll");
	if (discovery.isEnabled("reactions")) actions.add("react");
	if (discovery.isEnabled("deleteMessage")) actions.add("delete");
	if (discovery.isEnabled("editMessage")) actions.add("edit");
	if (discovery.isEnabled("sticker", false)) {
		actions.add("sticker");
		actions.add("sticker-search");
	}
	if (discovery.isEnabled("createForumTopic")) actions.add("topic-create");
	if (discovery.isEnabled("editForumTopic")) actions.add("topic-edit");
	const schema = [];
	if (discovery.buttonsEnabled) schema.push({ properties: { buttons: createMessageToolButtonsSchema() } });
	if (discovery.pollEnabled) schema.push({
		properties: createTelegramPollExtraToolSchemas(),
		visibility: "all-configured"
	});
	return {
		actions: Array.from(actions),
		capabilities: discovery.buttonsEnabled ? ["interactive", "buttons"] : [],
		schema
	};
}
const telegramMessageActions = {
	describeMessageTool: describeTelegramMessageTool,
	extractToolSend: ({ args }) => {
		return extractToolSend(args, "sendMessage");
	},
	handleAction: async ({ action, params, cfg, accountId, mediaLocalRoots, toolContext }) => {
		const telegramAction = resolveTelegramMessageActionName(action);
		if (!telegramAction) throw new Error(`Unsupported Telegram action: ${action}`);
		return await telegramMessageActionRuntime.handleTelegramAction({
			...params,
			action: telegramAction,
			accountId: accountId ?? void 0,
			...action === "react" ? { messageId: resolveReactionMessageId({
				args: params,
				toolContext
			}) } : {}
		}, cfg, { mediaLocalRoots });
	}
};
//#endregion
//#region extensions/telegram/src/monitor.ts
function createTelegramRunnerOptions(cfg) {
	return {
		sink: { concurrency: resolveAgentMaxConcurrent(cfg) },
		runner: {
			fetch: {
				timeout: 30,
				allowed_updates: resolveTelegramAllowedUpdates()
			},
			silent: true,
			maxRetryTime: 3600 * 1e3,
			retryInterval: "exponential"
		}
	};
}
function normalizePersistedUpdateId(value) {
	if (value === null) return null;
	if (!Number.isSafeInteger(value) || value < 0) return null;
	return value;
}
/** Check if error is a Grammy HttpError (used to scope unhandled rejection handling) */
const isGrammyHttpError = (err) => {
	if (!err || typeof err !== "object") return false;
	return err.name === "HttpError";
};
let telegramMonitorPollingRuntimePromise;
async function loadTelegramMonitorPollingRuntime() {
	telegramMonitorPollingRuntimePromise ??= import("./monitor-polling.runtime-8uTL2FHJ.js");
	return await telegramMonitorPollingRuntimePromise;
}
let telegramMonitorWebhookRuntimePromise;
async function loadTelegramMonitorWebhookRuntime() {
	telegramMonitorWebhookRuntimePromise ??= import("./monitor-webhook.runtime-D6PDlESc.js");
	return await telegramMonitorWebhookRuntimePromise;
}
async function monitorTelegramProvider(opts = {}) {
	const log = opts.runtime?.error ?? console.error;
	let pollingSession;
	let execApprovalsHandler;
	const unregisterHandler = registerUnhandledRejectionHandler((err) => {
		const isNetworkError = isRecoverableTelegramNetworkError(err, { context: "polling" });
		const isTelegramPollingError = isTelegramPollingNetworkError(err);
		if (isGrammyHttpError(err) && isNetworkError && isTelegramPollingError) {
			log(`[telegram] Suppressed network error: ${formatErrorMessage(err)}`);
			return true;
		}
		const activeRunner = pollingSession?.activeRunner;
		if (isNetworkError && isTelegramPollingError && activeRunner && activeRunner.isRunning()) {
			pollingSession?.markForceRestarted();
			pollingSession?.markTransportDirty();
			pollingSession?.abortActiveFetch();
			activeRunner.stop().catch(() => {});
			log("[telegram][diag] marking transport dirty after polling network failure");
			log(`[telegram] Restarting polling after unhandled network error: ${formatErrorMessage(err)}`);
			return true;
		}
		return false;
	});
	try {
		const cfg = opts.config ?? loadConfig();
		const account = resolveTelegramAccount({
			cfg,
			accountId: opts.accountId
		});
		const token = opts.token?.trim() || account.token;
		if (!token) throw new Error(`Telegram bot token missing for account "${account.accountId}" (set channels.telegram.accounts.${account.accountId}.botToken/tokenFile or TELEGRAM_BOT_TOKEN for default).`);
		const proxyFetch = opts.proxyFetch ?? (account.config.proxy ? makeProxyFetch(account.config.proxy) : void 0);
		if (opts.useWebhook) {
			const { TelegramExecApprovalHandler, startTelegramWebhook } = await loadTelegramMonitorWebhookRuntime();
			if (isTelegramExecApprovalHandlerConfigured({
				cfg,
				accountId: account.accountId
			})) {
				execApprovalsHandler = new TelegramExecApprovalHandler({
					token,
					accountId: account.accountId,
					cfg,
					runtime: opts.runtime
				});
				await execApprovalsHandler.start();
			}
			await startTelegramWebhook({
				token,
				accountId: account.accountId,
				config: cfg,
				path: opts.webhookPath,
				port: opts.webhookPort,
				secret: opts.webhookSecret ?? account.config.webhookSecret,
				host: opts.webhookHost ?? account.config.webhookHost,
				runtime: opts.runtime,
				fetch: proxyFetch,
				abortSignal: opts.abortSignal,
				publicUrl: opts.webhookUrl,
				webhookCertPath: opts.webhookCertPath
			});
			await waitForAbortSignal(opts.abortSignal);
			return;
		}
		const { TelegramExecApprovalHandler, TelegramPollingSession, readTelegramUpdateOffset, writeTelegramUpdateOffset } = await loadTelegramMonitorPollingRuntime();
		if (isTelegramExecApprovalHandlerConfigured({
			cfg,
			accountId: account.accountId
		})) {
			execApprovalsHandler = new TelegramExecApprovalHandler({
				token,
				accountId: account.accountId,
				cfg,
				runtime: opts.runtime
			});
			await execApprovalsHandler.start();
		}
		const persistedOffsetRaw = await readTelegramUpdateOffset({
			accountId: account.accountId,
			botToken: token
		});
		let lastUpdateId = normalizePersistedUpdateId(persistedOffsetRaw);
		if (persistedOffsetRaw !== null && lastUpdateId === null) log(`[telegram] Ignoring invalid persisted update offset (${String(persistedOffsetRaw)}); starting without offset confirmation.`);
		const persistUpdateId = async (updateId) => {
			const normalizedUpdateId = normalizePersistedUpdateId(updateId);
			if (normalizedUpdateId === null) {
				log(`[telegram] Ignoring invalid update_id value: ${String(updateId)}`);
				return;
			}
			if (lastUpdateId !== null && normalizedUpdateId <= lastUpdateId) return;
			lastUpdateId = normalizedUpdateId;
			try {
				await writeTelegramUpdateOffset({
					accountId: account.accountId,
					updateId: normalizedUpdateId,
					botToken: token
				});
			} catch (err) {
				(opts.runtime?.error ?? console.error)(`telegram: failed to persist update offset: ${String(err)}`);
			}
		};
		const createTelegramTransportForPolling = () => resolveTelegramTransport(proxyFetch, { network: account.config.network });
		const telegramTransport = createTelegramTransportForPolling();
		pollingSession = new TelegramPollingSession({
			token,
			config: cfg,
			accountId: account.accountId,
			runtime: opts.runtime,
			proxyFetch,
			abortSignal: opts.abortSignal,
			runnerOptions: createTelegramRunnerOptions(cfg),
			getLastUpdateId: () => lastUpdateId,
			persistUpdateId,
			log,
			telegramTransport,
			createTelegramTransport: createTelegramTransportForPolling
		});
		await pollingSession.runUntilAbort();
	} finally {
		await execApprovalsHandler?.stop().catch(() => {});
		unregisterHandler();
	}
}
//#endregion
export { handleTelegramAction as i, telegramMessageActionRuntime as n, telegramMessageActions as r, monitorTelegramProvider as t };
