import { t as __exportAll } from "./rolldown-runtime-CiIaOW0V.js";
import { t as normalizeTelegramReplyToMessageId } from "./outbound-params-DGwD1V0i.js";
import { D as isSafeToRetrySendError, I as buildTelegramThreadParams, O as isTelegramClientRejection, _ as wasSentByBot, a as editMessageTelegram, b as withTelegramApiErrorLogging } from "./send-B5NZ9QZr.js";
import { r as normalizeTelegramCommandName, t as TELEGRAM_COMMAND_NAME_PATTERN } from "./command-config-DA0b2Fs4.js";
import { n as deliverReplies, r as emitInternalMessageSentHook } from "./delivery-DciAs6zG.js";
import { loadConfig, loadSessionStore, resolveStorePath } from "openclaw/plugin-sdk/config-runtime";
import { normalizeOptionalString, readStringValue } from "openclaw/plugin-sdk/text-runtime";
import { logVerbose } from "openclaw/plugin-sdk/runtime-env";
import { clearFinalizableDraftMessage, createFinalizableDraftStreamControlsForState } from "openclaw/plugin-sdk/channel-lifecycle";
import { formatErrorMessage } from "openclaw/plugin-sdk/error-runtime";
import { createHash } from "node:crypto";
import { readChannelAllowFromStore, upsertChannelPairingRequest } from "openclaw/plugin-sdk/conversation-runtime";
import { enqueueSystemEvent } from "openclaw/plugin-sdk/infra-runtime";
import { loadWebMedia } from "openclaw/plugin-sdk/web-media";
import { createChannelReplyPipeline } from "openclaw/plugin-sdk/channel-reply-pipeline";
import { buildModelsProviderData } from "openclaw/plugin-sdk/models-provider-runtime";
import { dispatchReplyWithBufferedBlockDispatcher } from "openclaw/plugin-sdk/reply-dispatch-runtime";
import { listSkillCommandsForAgents } from "openclaw/plugin-sdk/skill-commands-runtime";
import { resolveApprovalOverGateway } from "openclaw/plugin-sdk/approval-gateway-runtime";
const TELEGRAM_COMMAND_RETRY_RATIO = .8;
const TELEGRAM_MIN_COMMAND_DESCRIPTION_LENGTH = 1;
function countTelegramCommandText(value) {
	return Array.from(value).length;
}
function truncateTelegramCommandText(value, maxLength) {
	if (maxLength <= 0) return "";
	const chars = Array.from(value);
	if (chars.length <= maxLength) return value;
	if (maxLength === 1) return chars[0] ?? "";
	return `${chars.slice(0, maxLength - 1).join("")}…`;
}
function fitTelegramCommandsWithinTextBudget(commands, maxTotalChars) {
	let candidateCommands = [...commands];
	while (candidateCommands.length > 0) {
		const descriptionBudget = maxTotalChars - candidateCommands.reduce((total, command) => total + countTelegramCommandText(command.command), 0);
		if (descriptionBudget < candidateCommands.length * TELEGRAM_MIN_COMMAND_DESCRIPTION_LENGTH) {
			candidateCommands = candidateCommands.slice(0, -1);
			continue;
		}
		const descriptionCap = Math.max(TELEGRAM_MIN_COMMAND_DESCRIPTION_LENGTH, Math.floor(descriptionBudget / candidateCommands.length));
		let descriptionTrimmed = false;
		const fittedCommands = candidateCommands.map((command) => {
			const description = truncateTelegramCommandText(command.description, descriptionCap);
			if (description !== command.description) {
				descriptionTrimmed = true;
				return Object.assign({}, command, { description });
			}
			return command;
		});
		return {
			commands: fittedCommands,
			descriptionTrimmed,
			textBudgetDropCount: commands.length - fittedCommands.length
		};
	}
	return {
		commands: [],
		descriptionTrimmed: false,
		textBudgetDropCount: commands.length
	};
}
function readErrorTextField(value, key) {
	if (!value || typeof value !== "object" || !(key in value)) return;
	return readStringValue(value[key]);
}
function isBotCommandsTooMuchError(err) {
	if (!err) return false;
	const pattern = /\bBOT_COMMANDS_TOO_MUCH\b/i;
	if (typeof err === "string") return pattern.test(err);
	if (err instanceof Error) {
		if (pattern.test(err.message)) return true;
	}
	const description = readErrorTextField(err, "description");
	if (description && pattern.test(description)) return true;
	const message = readErrorTextField(err, "message");
	if (message && pattern.test(message)) return true;
	return false;
}
function formatTelegramCommandRetrySuccessLog(params) {
	const omittedCount = Math.max(0, params.initialCount - params.acceptedCount);
	return `Telegram accepted ${params.acceptedCount} commands after BOT_COMMANDS_TOO_MUCH (started with ${params.initialCount}; omitted ${omittedCount}). Reduce plugin/skill/custom commands to expose more menu entries.`;
}
function buildPluginTelegramMenuCommands(params) {
	const { specs, existingCommands } = params;
	const commands = [];
	const issues = [];
	const pluginCommandNames = /* @__PURE__ */ new Set();
	for (const spec of specs) {
		const rawName = typeof spec.name === "string" ? spec.name : "";
		const normalized = normalizeTelegramCommandName(rawName);
		if (!normalized || !TELEGRAM_COMMAND_NAME_PATTERN.test(normalized)) {
			const invalidName = rawName.trim() ? rawName : "<unknown>";
			issues.push(`Plugin command "/${invalidName}" is invalid for Telegram (use a-z, 0-9, underscore; max 32 chars).`);
			continue;
		}
		const description = normalizeOptionalString(spec.description) ?? "";
		if (!description) {
			issues.push(`Plugin command "/${normalized}" is missing a description.`);
			continue;
		}
		if (existingCommands.has(normalized)) {
			if (pluginCommandNames.has(normalized)) issues.push(`Plugin command "/${normalized}" is duplicated.`);
			else issues.push(`Plugin command "/${normalized}" conflicts with an existing Telegram command.`);
			continue;
		}
		pluginCommandNames.add(normalized);
		existingCommands.add(normalized);
		commands.push({
			command: normalized,
			description
		});
	}
	return {
		commands,
		issues
	};
}
function buildCappedTelegramMenuCommands(params) {
	const { allCommands } = params;
	const maxCommands = params.maxCommands ?? 100;
	const maxTotalChars = params.maxTotalChars ?? 5700;
	const totalCommands = allCommands.length;
	const overflowCount = Math.max(0, totalCommands - maxCommands);
	const { commands: commandsToRegister, descriptionTrimmed, textBudgetDropCount } = fitTelegramCommandsWithinTextBudget(allCommands.slice(0, maxCommands), maxTotalChars);
	return {
		commandsToRegister,
		totalCommands,
		maxCommands,
		overflowCount,
		maxTotalChars,
		descriptionTrimmed,
		textBudgetDropCount
	};
}
/** Compute a stable hash of the command list for change detection. */
function hashCommandList(commands) {
	const sorted = [...commands].toSorted((a, b) => a.command.localeCompare(b.command));
	return createHash("sha256").update(JSON.stringify(sorted)).digest("hex").slice(0, 16);
}
const syncedCommandHashes = /* @__PURE__ */ new Map();
function getCommandHashKey(accountId, botIdentity) {
	return `${accountId ?? "default"}:${botIdentity ?? ""}`;
}
function readCachedCommandHash(accountId, botIdentity) {
	const key = getCommandHashKey(accountId, botIdentity);
	return syncedCommandHashes.get(key) ?? null;
}
function writeCachedCommandHash(accountId, botIdentity, hash) {
	const key = getCommandHashKey(accountId, botIdentity);
	syncedCommandHashes.set(key, hash);
}
function syncTelegramMenuCommands(params) {
	const { bot, runtime, commandsToRegister, accountId, botIdentity } = params;
	const sync = async () => {
		const currentHash = hashCommandList(commandsToRegister);
		if (readCachedCommandHash(accountId, botIdentity) === currentHash) {
			logVerbose("telegram: command menu unchanged; skipping sync");
			return;
		}
		let deleteSucceeded = true;
		if (typeof bot.api.deleteMyCommands === "function") deleteSucceeded = await withTelegramApiErrorLogging({
			operation: "deleteMyCommands",
			runtime,
			fn: () => bot.api.deleteMyCommands()
		}).then(() => true).catch(() => false);
		if (commandsToRegister.length === 0) {
			if (!deleteSucceeded) {
				runtime.log?.("telegram: deleteMyCommands failed; skipping empty-menu hash cache write");
				return;
			}
			writeCachedCommandHash(accountId, botIdentity, currentHash);
			return;
		}
		let retryCommands = commandsToRegister;
		const initialCommandCount = commandsToRegister.length;
		while (retryCommands.length > 0) try {
			await withTelegramApiErrorLogging({
				operation: "setMyCommands",
				runtime,
				shouldLog: (err) => !isBotCommandsTooMuchError(err),
				fn: () => bot.api.setMyCommands(retryCommands)
			});
			if (retryCommands.length < initialCommandCount) runtime.log?.(formatTelegramCommandRetrySuccessLog({
				initialCount: initialCommandCount,
				acceptedCount: retryCommands.length
			}));
			writeCachedCommandHash(accountId, botIdentity, currentHash);
			return;
		} catch (err) {
			if (!isBotCommandsTooMuchError(err)) throw err;
			const nextCount = Math.floor(retryCommands.length * TELEGRAM_COMMAND_RETRY_RATIO);
			const reducedCount = nextCount < retryCommands.length ? nextCount : retryCommands.length - 1;
			if (reducedCount <= 0) {
				runtime.error?.("Telegram rejected native command registration (BOT_COMMANDS_TOO_MUCH); leaving menu empty. Reduce commands or disable channels.telegram.commands.native.");
				return;
			}
			runtime.log?.(`Telegram rejected ${retryCommands.length} commands (BOT_COMMANDS_TOO_MUCH); retrying with ${reducedCount}.`);
			retryCommands = retryCommands.slice(0, reducedCount);
		}
	};
	sync().catch((err) => {
		runtime.error?.(`Telegram command sync failed: ${String(err)}`);
	});
}
//#endregion
//#region extensions/telegram/src/draft-stream.ts
const TELEGRAM_STREAM_MAX_CHARS = 4096;
const DEFAULT_THROTTLE_MS = 1e3;
const TELEGRAM_DRAFT_ID_MAX = 2147483647;
const THREAD_NOT_FOUND_RE = /400:\s*Bad Request:\s*message thread not found/i;
const DRAFT_METHOD_UNAVAILABLE_RE = /(unknown method|method .*not (found|available|supported)|unsupported)/i;
const DRAFT_CHAT_UNSUPPORTED_RE = /(can't be used|can be used only)/i;
function hasNumericMessageThreadId(params) {
	return typeof params === "object" && params !== null && typeof params.message_thread_id === "number";
}
/**
* Keep draft-id allocation shared across bundled chunks so concurrent preview
* lanes do not accidentally reuse draft ids when code-split entries coexist.
*/
const TELEGRAM_DRAFT_STREAM_STATE_KEY = Symbol.for("openclaw.telegramDraftStreamState");
let draftStreamState;
function getDraftStreamState() {
	if (!draftStreamState) {
		const globalStore = globalThis;
		draftStreamState = globalStore[TELEGRAM_DRAFT_STREAM_STATE_KEY] ?? { nextDraftId: 0 };
		globalStore[TELEGRAM_DRAFT_STREAM_STATE_KEY] = draftStreamState;
	}
	return draftStreamState;
}
function allocateTelegramDraftId() {
	const state = getDraftStreamState();
	state.nextDraftId = state.nextDraftId >= TELEGRAM_DRAFT_ID_MAX ? 1 : state.nextDraftId + 1;
	return state.nextDraftId;
}
function resolveSendMessageDraftApi(api) {
	const sendMessageDraft = api.sendMessageDraft;
	if (typeof sendMessageDraft !== "function") return;
	return sendMessageDraft.bind(api);
}
function shouldFallbackFromDraftTransport(err) {
	const text = typeof err === "string" ? err : err instanceof Error ? err.message : typeof err === "object" && err && "description" in err ? typeof err.description === "string" ? err.description : "" : "";
	if (!/sendMessageDraft/i.test(text)) return false;
	return DRAFT_METHOD_UNAVAILABLE_RE.test(text) || DRAFT_CHAT_UNSUPPORTED_RE.test(text);
}
function createTelegramDraftStream(params) {
	const maxChars = Math.min(params.maxChars ?? TELEGRAM_STREAM_MAX_CHARS, TELEGRAM_STREAM_MAX_CHARS);
	const throttleMs = Math.max(250, params.throttleMs ?? DEFAULT_THROTTLE_MS);
	const minInitialChars = params.minInitialChars;
	const chatId = params.chatId;
	const requestedPreviewTransport = params.previewTransport ?? "auto";
	const prefersDraftTransport = requestedPreviewTransport === "draft" ? true : requestedPreviewTransport === "message" ? false : params.thread?.scope === "dm";
	const threadParams = buildTelegramThreadParams(params.thread);
	const replyToMessageId = normalizeTelegramReplyToMessageId(params.replyToMessageId);
	const replyParams = replyToMessageId != null ? {
		...threadParams,
		reply_to_message_id: replyToMessageId,
		allow_sending_without_reply: true
	} : threadParams;
	const resolvedDraftApi = prefersDraftTransport ? resolveSendMessageDraftApi(params.api) : void 0;
	const usesDraftTransport = Boolean(prefersDraftTransport && resolvedDraftApi);
	if (prefersDraftTransport && !usesDraftTransport) params.warn?.("telegram stream preview: sendMessageDraft unavailable; falling back to sendMessage/editMessageText");
	const streamState = {
		stopped: false,
		final: false
	};
	let messageSendAttempted = false;
	let streamMessageId;
	let streamDraftId = usesDraftTransport ? allocateTelegramDraftId() : void 0;
	let previewTransport = usesDraftTransport ? "draft" : "message";
	let lastSentText = "";
	let lastDeliveredText = "";
	let lastSentParseMode;
	let previewRevision = 0;
	let generation = 0;
	const sendRenderedMessageWithThreadFallback = async (sendArgs) => {
		const sendParams = sendArgs.renderedParseMode ? {
			...replyParams,
			parse_mode: sendArgs.renderedParseMode
		} : replyParams;
		const usedThreadParams = hasNumericMessageThreadId(sendParams);
		try {
			return {
				sent: await params.api.sendMessage(chatId, sendArgs.renderedText, sendParams),
				usedThreadParams
			};
		} catch (err) {
			if (!usedThreadParams || !THREAD_NOT_FOUND_RE.test(String(err))) throw err;
			const threadlessParams = { ...sendParams };
			delete threadlessParams.message_thread_id;
			params.warn?.(sendArgs.fallbackWarnMessage);
			return {
				sent: await params.api.sendMessage(chatId, sendArgs.renderedText, Object.keys(threadlessParams).length > 0 ? threadlessParams : void 0),
				usedThreadParams: false
			};
		}
	};
	const sendMessageTransportPreview = async ({ renderedText, renderedParseMode, sendGeneration }) => {
		if (typeof streamMessageId === "number") {
			if (renderedParseMode) await params.api.editMessageText(chatId, streamMessageId, renderedText, { parse_mode: renderedParseMode });
			else await params.api.editMessageText(chatId, streamMessageId, renderedText);
			return true;
		}
		messageSendAttempted = true;
		let sent;
		try {
			({sent} = await sendRenderedMessageWithThreadFallback({
				renderedText,
				renderedParseMode,
				fallbackWarnMessage: "telegram stream preview send failed with message_thread_id, retrying without thread"
			}));
		} catch (err) {
			if (isSafeToRetrySendError(err) || isTelegramClientRejection(err)) messageSendAttempted = false;
			throw err;
		}
		const sentMessageId = sent?.message_id;
		if (typeof sentMessageId !== "number" || !Number.isFinite(sentMessageId)) {
			streamState.stopped = true;
			params.warn?.("telegram stream preview stopped (missing message id from sendMessage)");
			return false;
		}
		const normalizedMessageId = Math.trunc(sentMessageId);
		if (sendGeneration !== generation) {
			params.onSupersededPreview?.({
				messageId: normalizedMessageId,
				textSnapshot: renderedText,
				parseMode: renderedParseMode
			});
			return true;
		}
		streamMessageId = normalizedMessageId;
		return true;
	};
	const sendDraftTransportPreview = async ({ renderedText, renderedParseMode }) => {
		const draftId = streamDraftId ?? allocateTelegramDraftId();
		streamDraftId = draftId;
		const draftParams = {
			...threadParams?.message_thread_id != null ? { message_thread_id: threadParams.message_thread_id } : {},
			...renderedParseMode ? { parse_mode: renderedParseMode } : {}
		};
		await resolvedDraftApi(chatId, draftId, renderedText, Object.keys(draftParams).length > 0 ? draftParams : void 0);
		return true;
	};
	const sendOrEditStreamMessage = async (text) => {
		if (streamState.stopped && !streamState.final) return false;
		const trimmed = text.trimEnd();
		if (!trimmed) return false;
		const rendered = params.renderText?.(trimmed) ?? { text: trimmed };
		const renderedText = rendered.text.trimEnd();
		const renderedParseMode = rendered.parseMode;
		if (!renderedText) return false;
		if (renderedText.length > maxChars) {
			streamState.stopped = true;
			params.warn?.(`telegram stream preview stopped (text length ${renderedText.length} > ${maxChars})`);
			return false;
		}
		if (renderedText === lastSentText && renderedParseMode === lastSentParseMode) return true;
		const sendGeneration = generation;
		if (typeof streamMessageId !== "number" && minInitialChars != null && !streamState.final) {
			if (renderedText.length < minInitialChars) return false;
		}
		lastSentText = renderedText;
		lastSentParseMode = renderedParseMode;
		try {
			let sent = false;
			if (previewTransport === "draft") try {
				sent = await sendDraftTransportPreview({
					renderedText,
					renderedParseMode,
					sendGeneration
				});
			} catch (err) {
				if (!shouldFallbackFromDraftTransport(err)) throw err;
				previewTransport = "message";
				streamDraftId = void 0;
				params.warn?.("telegram stream preview: sendMessageDraft rejected by API; falling back to sendMessage/editMessageText");
				sent = await sendMessageTransportPreview({
					renderedText,
					renderedParseMode,
					sendGeneration
				});
			}
			else sent = await sendMessageTransportPreview({
				renderedText,
				renderedParseMode,
				sendGeneration
			});
			if (sent) {
				previewRevision += 1;
				lastDeliveredText = trimmed;
			}
			return sent;
		} catch (err) {
			streamState.stopped = true;
			params.warn?.(`telegram stream preview failed: ${formatErrorMessage(err)}`);
			return false;
		}
	};
	const { loop, update, stop, stopForClear } = createFinalizableDraftStreamControlsForState({
		throttleMs,
		state: streamState,
		sendOrEditStreamMessage
	});
	const clear = async () => {
		await clearFinalizableDraftMessage({
			stopForClear,
			readMessageId: () => streamMessageId,
			clearMessageId: () => {
				streamMessageId = void 0;
			},
			isValidMessageId: (value) => typeof value === "number" && Number.isFinite(value),
			deleteMessage: async (messageId) => {
				await params.api.deleteMessage(chatId, messageId);
			},
			onDeleteSuccess: (messageId) => {
				params.log?.(`telegram stream preview deleted (chat=${chatId}, message=${messageId})`);
			},
			warn: params.warn,
			warnPrefix: "telegram stream preview cleanup failed"
		});
	};
	const discard = async () => {
		await stopForClear();
	};
	const forceNewMessage = () => {
		streamState.final = false;
		generation += 1;
		messageSendAttempted = false;
		streamMessageId = void 0;
		if (previewTransport === "draft") streamDraftId = allocateTelegramDraftId();
		lastSentText = "";
		lastSentParseMode = void 0;
		loop.resetPending();
		loop.resetThrottleWindow();
	};
	const materialize = async () => {
		await stop();
		if (previewTransport === "message" && typeof streamMessageId === "number") return streamMessageId;
		const renderedText = lastSentText || lastDeliveredText;
		if (!renderedText) return;
		const renderedParseMode = lastSentText ? lastSentParseMode : void 0;
		try {
			const { sent, usedThreadParams } = await sendRenderedMessageWithThreadFallback({
				renderedText,
				renderedParseMode,
				fallbackWarnMessage: "telegram stream preview materialize send failed with message_thread_id, retrying without thread"
			});
			const sentId = sent?.message_id;
			if (typeof sentId === "number" && Number.isFinite(sentId)) {
				streamMessageId = Math.trunc(sentId);
				if (resolvedDraftApi != null && streamDraftId != null) {
					const clearDraftId = streamDraftId;
					const clearThreadParams = usedThreadParams && threadParams?.message_thread_id != null ? { message_thread_id: threadParams.message_thread_id } : void 0;
					try {
						await resolvedDraftApi(chatId, clearDraftId, "", clearThreadParams);
					} catch {}
				}
				return streamMessageId;
			}
		} catch (err) {
			params.warn?.(`telegram stream preview materialize failed: ${formatErrorMessage(err)}`);
		}
	};
	params.log?.(`telegram stream preview ready (maxChars=${maxChars}, throttleMs=${throttleMs})`);
	return {
		update,
		flush: loop.flush,
		messageId: () => streamMessageId,
		previewMode: () => previewTransport,
		previewRevision: () => previewRevision,
		lastDeliveredText: () => lastDeliveredText,
		clear,
		stop,
		discard,
		materialize,
		forceNewMessage,
		sendMayHaveLanded: () => messageSendAttempted && typeof streamMessageId !== "number"
	};
}
//#endregion
//#region extensions/telegram/src/exec-approval-resolver.ts
async function resolveTelegramExecApproval(params) {
	await resolveApprovalOverGateway({
		cfg: params.cfg,
		approvalId: params.approvalId,
		decision: params.decision,
		senderId: params.senderId,
		gatewayUrl: params.gatewayUrl,
		allowPluginFallback: params.allowPluginFallback,
		clientDisplayName: `Telegram approval (${params.senderId?.trim() || "unknown"})`
	});
}
//#endregion
//#region extensions/telegram/src/bot-deps.ts
var bot_deps_exports = /* @__PURE__ */ __exportAll({ defaultTelegramBotDeps: () => defaultTelegramBotDeps });
const defaultTelegramBotDeps = {
	get loadConfig() {
		return loadConfig;
	},
	get resolveStorePath() {
		return resolveStorePath;
	},
	get readChannelAllowFromStore() {
		return readChannelAllowFromStore;
	},
	get loadSessionStore() {
		return loadSessionStore;
	},
	get upsertChannelPairingRequest() {
		return upsertChannelPairingRequest;
	},
	get enqueueSystemEvent() {
		return enqueueSystemEvent;
	},
	get dispatchReplyWithBufferedBlockDispatcher() {
		return dispatchReplyWithBufferedBlockDispatcher;
	},
	get loadWebMedia() {
		return loadWebMedia;
	},
	get buildModelsProviderData() {
		return buildModelsProviderData;
	},
	get listSkillCommandsForAgents() {
		return listSkillCommandsForAgents;
	},
	get syncTelegramMenuCommands() {
		return syncTelegramMenuCommands;
	},
	get wasSentByBot() {
		return wasSentByBot;
	},
	get resolveExecApproval() {
		return resolveTelegramExecApproval;
	},
	get createTelegramDraftStream() {
		return createTelegramDraftStream;
	},
	get deliverReplies() {
		return deliverReplies;
	},
	get emitInternalMessageSentHook() {
		return emitInternalMessageSentHook;
	},
	get editMessageTelegram() {
		return editMessageTelegram;
	},
	get createChannelReplyPipeline() {
		return createChannelReplyPipeline;
	}
};
//#endregion
export { buildCappedTelegramMenuCommands as a, createTelegramDraftStream as i, defaultTelegramBotDeps as n, buildPluginTelegramMenuCommands as o, resolveTelegramExecApproval as r, syncTelegramMenuCommands as s, bot_deps_exports as t };
