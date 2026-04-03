import { i as formatUncaughtError } from "./errors-Bs2h5H8p.js";
import { i as getChildLogger } from "./logger-BCzP_yik.js";
import { p as createNonExitingRuntime, t as createSubsystemLogger } from "./subsystem-CJEvHE2o.js";
import { g as resolveDefaultModelForAgent } from "./model-selection-8a6zD_aX.js";
import { _ as resolveStateDir } from "./paths-CD8i0MSg.js";
import { _ as normalizeAccountId, d as resolveThreadSessionKeys } from "./session-key-D7XpmyVq.js";
import { a as shouldLogVerbose, r as logVerbose, s as warn, t as danger } from "./globals-BJZkpw-q.js";
import { a as resolveAgentDir, m as resolveDefaultAgentId } from "./agent-scope-CYXg_wTS.js";
import { c as loadConfig, o as getRuntimeConfigSnapshot, x as writeConfigFile } from "./io-DhtVmzAJ.js";
import { i as resolveTelegramCustomCommands, r as normalizeTelegramCommandName, t as TELEGRAM_COMMAND_NAME_PATTERN } from "./telegram-custom-commands-DRQzwr0w.js";
import { c as resolveSessionStoreEntry, d as updateSessionStore, i as loadSessionStore } from "./store-BGmy-Wot.js";
import { l as resolveStorePath } from "./paths-DBIQqSpZ.js";
import { a as resolveNativeSkillsEnabled, i as resolveNativeCommandsEnabled, n as isNativeCommandsExplicitlyDisabled } from "./commands-Cgp2RFyz.js";
import { m as dispatchPluginInteractiveHandler, v as getPluginCommandSpecs } from "./types-BKsOYeOd.js";
import { t as createDedupeCache } from "./dedupe-_6bbS8VC.js";
import { f as parsePluginBindingApprovalCustomId, i as buildPluginBindingResolvedText, m as resolvePluginConversationBindingApproval } from "./conversation-binding-oQzcUiHT.js";
import { $ as buildCommandsMessagePaginated } from "./pi-embedded-BYdcxQ5A.js";
import { T as resolveExecApprovalRequestAllowedDecisions } from "./exec-approvals-D6YTmZxM.js";
import { r as enqueueSystemEvent } from "./system-events-DOxYwk9w.js";
import { a as buildExecApprovalPendingReplyPayload, u as parseExecApprovalCommandText } from "./exec-approval-reply-B909d7mK.js";
import { p as resolveSendableOutboundReplyParts } from "./reply-payload-SzVz53hc.js";
import { c as resolveTextChunkLimit, s as resolveChunkMode } from "./chunk-D6CtZg6q.js";
import { n as getAgentScopedMediaLocalRoots } from "./local-roots-CaV3b967.js";
import { _ as resolveChannelConfigWrites } from "./channel-config-helpers-B0S2z66F.js";
import { _ as formatReasoningMessage } from "./minimax-vlm-uN3pFvTM.js";
import { n as findCodeRegions, r as isInsideCode, t as stripReasoningTagsFromText } from "./reasoning-tags-D1eMJn9V.js";
import { t as MediaFetchError } from "./fetch-ClF-ZgDC.js";
import { t as loadWebMedia } from "./web-media-4TOxrRxF.js";
import { a as modelSupportsVision, n as findModelInCatalog, r as loadModelCatalog } from "./model-catalog-k0g7_9Nb.js";
import { i as resolveAgentRoute } from "./resolve-route-DID7K3Jm.js";
import { n as sleepWithAbort, t as computeBackoff } from "./backoff-JR-Kmsdz.js";
import { d as listNativeCommandSpecsForConfig, g as resolveCommandArgMenu, m as parseCommandArgs, n as buildCommandTextFromArgs, r as findCommandByNativeName, u as listNativeCommandSpecs } from "./commands-registry-dA2_ExHR.js";
import { t as applyModelOverrideToSessionEntry } from "./model-overrides-C9noPWm6.js";
import { c as resolveThreadBindingIdleTimeoutMsForChannel, d as resolveThreadBindingMaxAgeMsForChannel, p as resolveThreadBindingSpawnPolicy } from "./thread-bindings-policy-ypJ47uk9.js";
import { n as resolveChannelGroupRequireMention, t as resolveChannelGroupPolicy } from "./group-policy-B1uRyci5.js";
import "./core-BghMcc08.js";
import "./routing-Br1fEo8A.js";
import { n as isAbortRequestText } from "./abort-primitives-BdKXAi1U.js";
import { n as resolveInboundDebounceMs, t as createInboundDebouncer } from "./inbound-debounce-DcwkFaUr.js";
import { t as dispatchReplyWithBufferedBlockDispatcher } from "./provider-dispatcher-B2dh4tuq.js";
import { t as removeAckReactionAfterReply } from "./ack-reactions-cTTW0IRo.js";
import { t as resolveCommandAuthorizedFromAuthorizers } from "./command-gating-Ch_OhMao.js";
import { t as resolveMarkdownTableMode } from "./markdown-tables-DAbwMp5F.js";
import { a as readChannelAllowFromStore, d as upsertChannelPairingRequest } from "./pairing-store-DxNrxr_7.js";
import { t as resolveCommandAuthorization } from "./command-auth-BeHp6PUO.js";
import { i as resolveStoredModelOverride } from "./model-selection-CiyK6Yti.js";
import { s as clearHistoryEntriesIfEnabled } from "./history-5RBVRj2e.js";
import "./reply-history-D4cGNH0x.js";
import "./runtime-env-CoykX19-.js";
import { o as resolveExecApprovalCommandDisplay } from "./exec-approval-session-target-C1KSzAWi.js";
import "./approval-runtime-8-_vGYcG.js";
import { r as buildPluginApprovalPendingReplyPayload } from "./approval-renderers-0W2CFM48.js";
import { t as createChannelNativeApprovalRuntime } from "./approval-native-runtime-C3EqZgQD.js";
import { t as createOperatorApprovalsGatewayClient } from "./operator-approvals-client-DS85D1Fh.js";
import "./config-runtime-CmISCurQ.js";
import { n as isBtwRequestText } from "./btw-command-BCEsTWw2.js";
import { n as resolveAutoTopicLabelConfig, t as generateTopicLabel } from "./reply-runtime-DxFWfQpm.js";
import "./reply-dispatch-runtime-ChRff2BZ.js";
import "./reply-chunking-CIe6J6dn.js";
import { t as createChannelReplyPipeline } from "./channel-reply-pipeline-S26JmiPz.js";
import "./channel-runtime-BQArgtty.js";
import "./infra-runtime-bLI1f-xh.js";
import "./runtime-config-snapshot-BhVAZnEW.js";
import "./media-runtime-DdCWeFPm.js";
import "./conversation-runtime-DIsQmaYR.js";
import "./text-runtime-B0ZpmkER.js";
import "./agent-runtime-B7ucOTD-.js";
import "./plugin-runtime-CR3GBFZ-.js";
import "./gateway-runtime-B7jG4Cjq.js";
import { n as formatModelsAvailableHeader, t as buildModelsProviderData } from "./commands-models-C7cfE2pl.js";
import "./markdown-table-runtime-4CgY-jlq.js";
import { r as logTypingFailure, t as logAckFailure } from "./logging-N7W67_op.js";
import { t as resolveNativeCommandSessionTargets } from "./native-command-session-targets-C-trSwJC.js";
import { t as listSkillCommandsForAgents } from "./skill-commands-nVTmVENA.js";
import { t as buildCommandsPaginationKeyboard } from "./commands-info-BCoEfQIG.js";
import "./command-auth-Bajp-QXz.js";
import "./command-auth-native-m2se5Aky.js";
import "./web-media-DPyBx-37.js";
import "./error-runtime-CNBJ43xY.js";
import { n as shouldDebounceTextInbound } from "./channel-inbound-BTUonbdp.js";
import { i as createFinalizableDraftLifecycle } from "./channel-lifecycle-BW1n4hjx.js";
import "./state-paths-DQuHVxrl.js";
import "./models-provider-runtime-n06xGF4d.js";
import "./skill-commands-runtime-BX-7wihc.js";
import { s as resolveTelegramAccount } from "./accounts-Dh_rfg3W.js";
import { r as resolveTelegramTransport } from "./fetch-DttJw83W.js";
import { a as isTelegramExecApprovalHandlerConfigured, f as shouldSuppressLocalTelegramExecApprovalPrompt, h as resolveTelegramInlineButtonsScope, l as shouldEnableTelegramExecApprovalButtons, n as isTelegramExecApprovalApprover, r as isTelegramExecApprovalAuthorizedSender, u as shouldHandleTelegramExecApprovalRequest } from "./exec-approvals-BVAdWdf7.js";
import { n as telegramNativeApprovalAdapter } from "./approval-native-YG1Yh0R2.js";
import { C as resolveTelegramThreadSpec, E as buildSenderName, I as isSenderAllowed, N as normalizeTelegramReplyToMessageId, R as normalizeDmAllowFromWithStore, S as resolveTelegramStreamMode, b as resolveTelegramGroupAllowFromContext, d as buildTelegramParentPeer, f as buildTelegramRoutingTarget, g as extractTelegramForumFlag, i as renderTelegramHtmlText, k as getTelegramTextParts, l as buildTelegramGroupFrom, p as buildTelegramThreadParams, s as withTelegramApiErrorLogging, u as buildTelegramGroupPeerId, v as resolveTelegramForumFlag, w as withResolvedTelegramForumFlag, y as resolveTelegramForumThreadId } from "./format-DqAjfaGj.js";
import { t as resolveTelegramInlineButtons } from "./button-types-BhHJDvdC.js";
import { C as isRecoverableTelegramNetworkError, D as tagTelegramNetworkError, S as wasSentByBot, T as isTelegramClientRejection, d as editMessageReplyMarkupTelegram, f as editMessageTelegram, g as sendMessageTelegram, n as describeStickerImage, s as buildInlineKeyboard, t as cacheSticker, w as isSafeToRetrySendError, y as sendTypingTelegram } from "./sticker-cache-Cf0p9p0n.js";
import { t as createTelegramThreadBindingManager } from "./thread-bindings-DcAsaRyS.js";
import { a as calculateTotalPages, c as resolveModelSelection, i as buildProviderKeyboard, o as getModelsPageSize, r as buildModelsKeyboard, s as parseModelCallbackData } from "./model-buttons-C1wBLjq-.js";
import { n as evaluateTelegramGroupPolicyAccess, t as evaluateTelegramGroupBaseAccess } from "./group-access-Cggb-vdS.js";
import { a as resolveTelegramGroupPromptSettings, i as resolveTelegramConversationRoute, n as enforceTelegramDmAccess, r as resolveTelegramConversationBaseSessionKey, t as buildTelegramMessageContext } from "./bot-message-context-LcO78rYq.js";
import { n as deliverReplies, r as emitInternalMessageSentHook, t as resolveMedia } from "./delivery-Cjwmouy_.js";
import path from "node:path";
import os from "node:os";
import fs from "node:fs/promises";
import { createHash } from "node:crypto";
import { Bot as Bot$1 } from "grammy";
import { sequentialize } from "@grammyjs/runner";
import { apiThrottler } from "@grammyjs/transformer-throttler";
//#region extensions/telegram/src/exec-approvals-handler.ts
const log = createSubsystemLogger("telegram/exec-approvals");
function isHandlerConfigured(params) {
	return isTelegramExecApprovalHandlerConfigured(params);
}
var TelegramExecApprovalHandler = class {
	constructor(opts, deps = {}) {
		this.opts = opts;
		this.nowMs = deps.nowMs ?? Date.now;
		this.sendTyping = deps.sendTyping ?? sendTypingTelegram;
		this.sendMessage = deps.sendMessage ?? sendMessageTelegram;
		this.editReplyMarkup = deps.editReplyMarkup ?? editMessageReplyMarkupTelegram;
		this.runtime = createChannelNativeApprovalRuntime({
			label: "telegram/exec-approvals",
			clientDisplayName: `Telegram Exec Approvals (${this.opts.accountId})`,
			cfg: this.opts.cfg,
			accountId: this.opts.accountId,
			gatewayUrl: this.opts.gatewayUrl,
			eventKinds: ["exec", "plugin"],
			nowMs: this.nowMs,
			nativeAdapter: telegramNativeApprovalAdapter.native,
			isConfigured: () => isHandlerConfigured({
				cfg: this.opts.cfg,
				accountId: this.opts.accountId
			}),
			shouldHandle: (request) => shouldHandleTelegramExecApprovalRequest({
				cfg: this.opts.cfg,
				accountId: this.opts.accountId,
				request
			}),
			buildPendingContent: ({ request, approvalKind, nowMs }) => {
				const payload = approvalKind === "plugin" ? buildPluginApprovalPendingReplyPayload({
					request,
					nowMs
				}) : buildExecApprovalPendingReplyPayload({
					approvalId: request.id,
					approvalSlug: request.id.slice(0, 8),
					approvalCommandId: request.id,
					command: resolveExecApprovalCommandDisplay(request.request).commandText,
					cwd: request.request.cwd ?? void 0,
					host: request.request.host === "node" ? "node" : "gateway",
					nodeId: request.request.nodeId ?? void 0,
					allowedDecisions: resolveExecApprovalRequestAllowedDecisions(request.request),
					expiresAtMs: request.expiresAtMs,
					nowMs
				});
				return {
					text: payload.text ?? "",
					buttons: resolveTelegramInlineButtons({ interactive: payload.interactive })
				};
			},
			prepareTarget: ({ plannedTarget }) => ({
				dedupeKey: `${plannedTarget.target.to}:${plannedTarget.target.threadId == null ? "" : String(plannedTarget.target.threadId)}`,
				target: {
					chatId: plannedTarget.target.to,
					messageThreadId: typeof plannedTarget.target.threadId === "number" ? plannedTarget.target.threadId : void 0
				}
			}),
			deliverTarget: async ({ preparedTarget, pendingContent }) => {
				await this.sendTyping(preparedTarget.chatId, {
					cfg: this.opts.cfg,
					token: this.opts.token,
					accountId: this.opts.accountId,
					...preparedTarget.messageThreadId != null ? { messageThreadId: preparedTarget.messageThreadId } : {}
				}).catch(() => {});
				const result = await this.sendMessage(preparedTarget.chatId, pendingContent.text, {
					cfg: this.opts.cfg,
					token: this.opts.token,
					accountId: this.opts.accountId,
					buttons: pendingContent.buttons,
					...preparedTarget.messageThreadId != null ? { messageThreadId: preparedTarget.messageThreadId } : {}
				});
				return {
					chatId: result.chatId,
					messageId: result.messageId
				};
			},
			onDeliveryError: ({ error, request }) => {
				log.error(`telegram exec approvals: failed to send request ${request.id}: ${String(error)}`);
			},
			finalizeResolved: async ({ resolved, entries }) => {
				await this.finalizeResolved(resolved, entries);
			},
			finalizeExpired: async ({ entries }) => {
				await this.clearPending(entries);
			}
		});
	}
	shouldHandle(request) {
		return shouldHandleTelegramExecApprovalRequest({
			cfg: this.opts.cfg,
			accountId: this.opts.accountId,
			request
		});
	}
	async start() {
		await this.runtime.start();
	}
	async stop() {
		await this.runtime.stop();
	}
	async handleRequested(request) {
		await this.runtime.handleRequested(request);
	}
	async handleResolved(resolved) {
		await this.runtime.handleResolved(resolved);
	}
	async finalizeResolved(_resolved, messages) {
		await this.clearPending(messages);
	}
	async clearPending(messages) {
		await Promise.allSettled(messages.map(async (message) => {
			await this.editReplyMarkup(message.chatId, message.messageId, [], {
				cfg: this.opts.cfg,
				token: this.opts.token,
				accountId: this.opts.accountId
			});
		}));
	}
};
const TELEGRAM_COMMAND_RETRY_RATIO = .8;
function readErrorTextField(value, key) {
	if (!value || typeof value !== "object" || !(key in value)) return;
	const text = value[key];
	return typeof text === "string" ? text : void 0;
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
		const description = typeof spec.description === "string" ? spec.description.trim() : "";
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
	const totalCommands = allCommands.length;
	const overflowCount = Math.max(0, totalCommands - maxCommands);
	return {
		commandsToRegister: allCommands.slice(0, maxCommands),
		totalCommands,
		maxCommands,
		overflowCount
	};
}
/** Compute a stable hash of the command list for change detection. */
function hashCommandList(commands) {
	const sorted = [...commands].toSorted((a, b) => a.command.localeCompare(b.command));
	return createHash("sha256").update(JSON.stringify(sorted)).digest("hex").slice(0, 16);
}
function hashBotIdentity(botIdentity) {
	const normalized = botIdentity?.trim();
	if (!normalized) return "no-bot";
	return createHash("sha256").update(normalized).digest("hex").slice(0, 16);
}
function resolveCommandHashPath(accountId, botIdentity) {
	const stateDir = resolveStateDir(process.env, os.homedir);
	const normalizedAccount = accountId?.trim().replace(/[^a-z0-9._-]+/gi, "_") || "default";
	const botHash = hashBotIdentity(botIdentity);
	return path.join(stateDir, "telegram", `command-hash-${normalizedAccount}-${botHash}.txt`);
}
async function readCachedCommandHash(accountId, botIdentity) {
	try {
		return (await fs.readFile(resolveCommandHashPath(accountId, botIdentity), "utf-8")).trim();
	} catch {
		return null;
	}
}
async function writeCachedCommandHash(accountId, botIdentity, hash) {
	const filePath = resolveCommandHashPath(accountId, botIdentity);
	try {
		await fs.mkdir(path.dirname(filePath), { recursive: true });
		await fs.writeFile(filePath, hash, "utf-8");
	} catch {}
}
function syncTelegramMenuCommands(params) {
	const { bot, runtime, commandsToRegister, accountId, botIdentity } = params;
	const sync = async () => {
		const currentHash = hashCommandList(commandsToRegister);
		if (await readCachedCommandHash(accountId, botIdentity) === currentHash) {
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
			await writeCachedCommandHash(accountId, botIdentity, currentHash);
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
			await writeCachedCommandHash(accountId, botIdentity, currentHash);
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
			const threadlessParams = { ...sendParams ?? {} };
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
			params.warn?.(`telegram stream preview failed: ${err instanceof Error ? err.message : String(err)}`);
			return false;
		}
	};
	const { loop, update, stop, clear } = createFinalizableDraftLifecycle({
		throttleMs,
		state: streamState,
		sendOrEditStreamMessage,
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
	/**
	* Materialize the current draft into a permanent message.
	* For draft transport: sends the accumulated text as a real sendMessage.
	* For message transport: the message is already permanent (noop).
	* Returns the permanent message id, or undefined if nothing to materialize.
	*/
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
			params.warn?.(`telegram stream preview materialize failed: ${err instanceof Error ? err.message : String(err)}`);
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
		materialize,
		forceNewMessage,
		sendMayHaveLanded: () => messageSendAttempted && typeof streamMessageId !== "number"
	};
}
//#endregion
//#region extensions/telegram/src/exec-approval-resolver.ts
const INVALID_REQUEST = "INVALID_REQUEST";
const APPROVAL_NOT_FOUND = "APPROVAL_NOT_FOUND";
function readErrorCode(value) {
	return typeof value === "string" && value.trim() ? value : null;
}
function readApprovalNotFoundDetailsReason(value) {
	if (!value || typeof value !== "object" || Array.isArray(value)) return null;
	const reason = value.reason;
	return typeof reason === "string" && reason.trim() ? reason : null;
}
function isApprovalNotFoundError(err) {
	if (!(err instanceof Error)) return false;
	const gatewayCode = readErrorCode(err.gatewayCode);
	if (gatewayCode === APPROVAL_NOT_FOUND) return true;
	const detailsReason = readApprovalNotFoundDetailsReason(err.details);
	if (gatewayCode === INVALID_REQUEST && detailsReason === APPROVAL_NOT_FOUND) return true;
	return /unknown or expired approval id/i.test(err.message);
}
async function resolveTelegramExecApproval(params) {
	let readySettled = false;
	let resolveReady;
	let rejectReady;
	const ready = new Promise((resolve, reject) => {
		resolveReady = resolve;
		rejectReady = reject;
	});
	const markReady = () => {
		if (readySettled) return;
		readySettled = true;
		resolveReady();
	};
	const failReady = (err) => {
		if (readySettled) return;
		readySettled = true;
		rejectReady(err);
	};
	const gatewayClient = await createOperatorApprovalsGatewayClient({
		config: params.cfg,
		gatewayUrl: params.gatewayUrl,
		clientDisplayName: `Telegram approval (${params.senderId?.trim() || "unknown"})`,
		onHelloOk: () => {
			markReady();
		},
		onConnectError: (err) => {
			failReady(err);
		},
		onClose: (code, reason) => {
			failReady(/* @__PURE__ */ new Error(`gateway closed (${code}): ${reason}`));
		}
	});
	try {
		gatewayClient.start();
		await ready;
		const requestApproval = async (method) => {
			await gatewayClient.request(method, {
				id: params.approvalId,
				decision: params.decision
			});
		};
		if (params.approvalId.startsWith("plugin:")) await requestApproval("plugin.approval.resolve");
		else try {
			await requestApproval("exec.approval.resolve");
		} catch (err) {
			if (!params.allowPluginFallback || !isApprovalNotFoundError(err)) throw err;
			await requestApproval("plugin.approval.resolve");
		}
	} finally {
		await gatewayClient.stopAndWait().catch(() => {
			gatewayClient.stop();
		});
	}
}
//#endregion
//#region extensions/telegram/src/bot-deps.ts
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
//#region extensions/telegram/src/bot-handlers.media.ts
function isMediaSizeLimitError(err) {
	const errMsg = String(err);
	return errMsg.includes("exceeds") && errMsg.includes("MB limit");
}
function isRecoverableMediaGroupError(err) {
	return err instanceof MediaFetchError || isMediaSizeLimitError(err);
}
function hasInboundMedia(msg) {
	return Boolean(msg.media_group_id) || Array.isArray(msg.photo) && msg.photo.length > 0 || Boolean(msg.video ?? msg.video_note ?? msg.document ?? msg.audio ?? msg.voice ?? msg.sticker);
}
function hasReplyTargetMedia(msg) {
	const externalReply = msg.external_reply;
	const replyTarget = msg.reply_to_message ?? externalReply;
	return Boolean(replyTarget && hasInboundMedia(replyTarget));
}
function resolveInboundMediaFileId(msg) {
	return msg.sticker?.file_id ?? msg.photo?.[msg.photo.length - 1]?.file_id ?? msg.video?.file_id ?? msg.video_note?.file_id ?? msg.document?.file_id ?? msg.audio?.file_id ?? msg.voice?.file_id;
}
//#endregion
//#region extensions/telegram/src/bot-native-commands.ts
const EMPTY_RESPONSE_FALLBACK$1 = "No response generated. Please try again.";
const TELEGRAM_NATIVE_COMMAND_CALLBACK_PREFIX = "tgcmd:";
let telegramNativeCommandDeliveryRuntimePromise;
async function loadTelegramNativeCommandDeliveryRuntime() {
	telegramNativeCommandDeliveryRuntimePromise ??= import("./bot-native-commands.delivery.runtime-BPrJOjqR.js");
	return await telegramNativeCommandDeliveryRuntimePromise;
}
let telegramNativeCommandRuntimePromise;
async function loadTelegramNativeCommandRuntime() {
	telegramNativeCommandRuntimePromise ??= import("./bot-native-commands.runtime-DmqbZsFC.js");
	return await telegramNativeCommandRuntimePromise;
}
function buildTelegramNativeCommandCallbackData(commandText) {
	return `${TELEGRAM_NATIVE_COMMAND_CALLBACK_PREFIX}${commandText}`;
}
function parseTelegramNativeCommandCallbackData(data) {
	if (!data) return null;
	const trimmed = data.trim();
	if (!trimmed.startsWith(TELEGRAM_NATIVE_COMMAND_CALLBACK_PREFIX)) return null;
	const commandText = trimmed.slice(6).trim();
	return commandText.startsWith("/") ? commandText : null;
}
async function resolveTelegramCommandAuth(params) {
	const { msg, bot, cfg, accountId, telegramCfg, readChannelAllowFromStore, allowFrom, groupAllowFrom, useAccessGroups, resolveGroupPolicy, resolveTelegramGroupConfig, requireAuth } = params;
	const chatId = msg.chat.id;
	const isGroup = msg.chat.type === "group" || msg.chat.type === "supergroup";
	const messageThreadId = msg.message_thread_id;
	const getChat = typeof bot.api.getChat === "function" ? bot.api.getChat.bind(bot.api) : void 0;
	const isForum = await resolveTelegramForumFlag({
		chatId,
		chatType: msg.chat.type,
		isGroup,
		isForum: extractTelegramForumFlag(msg.chat),
		getChat
	});
	const threadParams = buildTelegramThreadParams(resolveTelegramThreadSpec({
		isGroup,
		isForum,
		messageThreadId
	})) ?? {};
	const { resolvedThreadId, dmThreadId, storeAllowFrom, groupConfig, topicConfig, groupAllowOverride, effectiveGroupAllow, hasGroupAllowOverride } = await resolveTelegramGroupAllowFromContext({
		chatId,
		accountId,
		isGroup,
		isForum,
		messageThreadId,
		groupAllowFrom,
		readChannelAllowFromStore,
		resolveTelegramGroupConfig
	});
	const effectiveDmPolicy = !isGroup && groupConfig && "dmPolicy" in groupConfig ? groupConfig.dmPolicy ?? telegramCfg.dmPolicy ?? "pairing" : telegramCfg.dmPolicy ?? "pairing";
	const requireTopic = groupConfig?.requireTopic;
	if (!isGroup && requireTopic === true && dmThreadId == null) {
		logVerbose(`Blocked telegram command in DM ${chatId}: requireTopic=true but no topic present`);
		return null;
	}
	const dmAllowFrom = groupAllowOverride ?? allowFrom;
	const senderId = msg.from?.id ? String(msg.from.id) : "";
	const senderUsername = msg.from?.username ?? "";
	const commandsAllowFrom = cfg.commands?.allowFrom;
	const commandsAllowFromConfigured = commandsAllowFrom != null && typeof commandsAllowFrom === "object" && (Array.isArray(commandsAllowFrom.telegram) || Array.isArray(commandsAllowFrom["*"]));
	const commandsAllowFromAccess = commandsAllowFromConfigured ? resolveCommandAuthorization({
		ctx: {
			Provider: "telegram",
			Surface: "telegram",
			OriginatingChannel: "telegram",
			AccountId: accountId,
			ChatType: isGroup ? "group" : "direct",
			From: isGroup ? buildTelegramGroupFrom(chatId, resolvedThreadId) : `telegram:${chatId}`,
			SenderId: senderId || void 0,
			SenderUsername: senderUsername || void 0
		},
		cfg,
		commandAuthorized: false
	}) : null;
	const sendAuthMessage = async (text) => {
		await withTelegramApiErrorLogging({
			operation: "sendMessage",
			fn: () => bot.api.sendMessage(chatId, text, threadParams)
		});
		return null;
	};
	const rejectNotAuthorized = async () => {
		return await sendAuthMessage("You are not authorized to use this command.");
	};
	const baseAccess = evaluateTelegramGroupBaseAccess({
		isGroup,
		groupConfig,
		topicConfig,
		hasGroupAllowOverride,
		effectiveGroupAllow,
		senderId,
		senderUsername,
		enforceAllowOverride: requireAuth,
		requireSenderForAllowOverride: true
	});
	if (!baseAccess.allowed) {
		if (baseAccess.reason === "group-disabled") return await sendAuthMessage("This group is disabled.");
		if (baseAccess.reason === "topic-disabled") return await sendAuthMessage("This topic is disabled.");
		return await rejectNotAuthorized();
	}
	const policyAccess = evaluateTelegramGroupPolicyAccess({
		isGroup,
		chatId,
		cfg,
		telegramCfg,
		topicConfig,
		groupConfig,
		effectiveGroupAllow,
		senderId,
		senderUsername,
		resolveGroupPolicy,
		enforcePolicy: useAccessGroups,
		useTopicAndGroupOverrides: false,
		enforceAllowlistAuthorization: requireAuth && !commandsAllowFromConfigured,
		allowEmptyAllowlistEntries: true,
		requireSenderForAllowlistAuthorization: true,
		checkChatAllowlist: useAccessGroups
	});
	if (!policyAccess.allowed) {
		if (policyAccess.reason === "group-policy-disabled") return await sendAuthMessage("Telegram group commands are disabled.");
		if (policyAccess.reason === "group-policy-allowlist-no-sender" || policyAccess.reason === "group-policy-allowlist-unauthorized") return await rejectNotAuthorized();
		if (policyAccess.reason === "group-chat-not-allowed") return await sendAuthMessage("This group is not allowed.");
	}
	const dmAllow = normalizeDmAllowFromWithStore({
		allowFrom: dmAllowFrom,
		storeAllowFrom: isGroup ? [] : storeAllowFrom,
		dmPolicy: effectiveDmPolicy
	});
	const senderAllowed = isSenderAllowed({
		allow: dmAllow,
		senderId,
		senderUsername
	});
	const groupSenderAllowed = isGroup ? isSenderAllowed({
		allow: effectiveGroupAllow,
		senderId,
		senderUsername
	}) : false;
	const commandAuthorized = commandsAllowFromConfigured ? Boolean(commandsAllowFromAccess?.isAuthorizedSender) : resolveCommandAuthorizedFromAuthorizers({
		useAccessGroups,
		authorizers: [{
			configured: dmAllow.hasEntries,
			allowed: senderAllowed
		}, ...isGroup ? [{
			configured: effectiveGroupAllow.hasEntries,
			allowed: groupSenderAllowed
		}] : []],
		modeWhenAccessGroupsOff: "configured"
	});
	if (requireAuth && !commandAuthorized) return await rejectNotAuthorized();
	return {
		chatId,
		isGroup,
		isForum,
		resolvedThreadId,
		senderId,
		senderUsername,
		groupConfig,
		topicConfig,
		commandAuthorized
	};
}
const registerTelegramNativeCommands = ({ bot, cfg, runtime, accountId, telegramCfg, allowFrom, groupAllowFrom, replyToMode, textLimit, useAccessGroups, nativeEnabled, nativeSkillsEnabled, nativeDisabledExplicit, resolveGroupPolicy, resolveTelegramGroupConfig, shouldSkipUpdate, telegramDeps = defaultTelegramBotDeps, opts }) => {
	const boundRoute = nativeEnabled && nativeSkillsEnabled ? resolveAgentRoute({
		cfg,
		channel: "telegram",
		accountId
	}) : null;
	if (nativeEnabled && nativeSkillsEnabled && !boundRoute) runtime.log?.("nativeSkillsEnabled is true but no agent route is bound for this Telegram account; skill commands will not appear in the native menu.");
	const skillCommands = nativeEnabled && nativeSkillsEnabled && boundRoute ? telegramDeps.listSkillCommandsForAgents({
		cfg,
		agentIds: [boundRoute.agentId]
	}) : [];
	const nativeCommands = nativeEnabled ? listNativeCommandSpecsForConfig(cfg, {
		skillCommands,
		provider: "telegram"
	}) : [];
	const reservedCommands = new Set(listNativeCommandSpecs().map((command) => normalizeTelegramCommandName(command.name)));
	for (const command of skillCommands) reservedCommands.add(command.name.toLowerCase());
	const customResolution = resolveTelegramCustomCommands({
		commands: telegramCfg.customCommands,
		reservedCommands
	});
	for (const issue of customResolution.issues) runtime.error?.(danger(issue.message));
	const customCommands = customResolution.commands;
	const pluginCatalog = buildPluginTelegramMenuCommands({
		specs: getPluginCommandSpecs("telegram"),
		existingCommands: new Set([...nativeCommands.map((command) => normalizeTelegramCommandName(command.name)), ...customCommands.map((command) => command.command)].map((command) => command.toLowerCase()))
	});
	for (const issue of pluginCatalog.issues) runtime.error?.(danger(issue));
	const loadFreshRuntimeConfig = () => telegramDeps.loadConfig();
	const resolveFreshTelegramConfig = (runtimeCfg) => {
		try {
			return resolveTelegramAccount({
				cfg: runtimeCfg,
				accountId
			}).config;
		} catch (error) {
			logVerbose(`telegram native command: failed to load fresh account config for ${accountId}; using startup snapshot: ${String(error)}`);
			return telegramCfg;
		}
	};
	const { commandsToRegister, totalCommands, maxCommands, overflowCount } = buildCappedTelegramMenuCommands({ allCommands: [
		...nativeCommands.map((command) => {
			const normalized = normalizeTelegramCommandName(command.name);
			if (!TELEGRAM_COMMAND_NAME_PATTERN.test(normalized)) {
				runtime.error?.(danger(`Native command "${command.name}" is invalid for Telegram (resolved to "${normalized}"). Skipping.`));
				return null;
			}
			return {
				command: normalized,
				description: command.description
			};
		}).filter((cmd) => cmd !== null),
		...nativeEnabled ? pluginCatalog.commands : [],
		...customCommands
	] });
	if (overflowCount > 0) runtime.log?.(`Telegram limits bots to ${maxCommands} commands. ${totalCommands} configured; registering first ${maxCommands}. Use channels.telegram.commands.native: false to disable, or reduce plugin/skill/custom commands.`);
	(telegramDeps.syncTelegramMenuCommands ?? syncTelegramMenuCommands)({
		bot,
		runtime,
		commandsToRegister,
		accountId,
		botIdentity: opts.token
	});
	const resolveCommandRuntimeContext = async (params) => {
		const { msg, runtimeCfg, isGroup, isForum, resolvedThreadId, senderId, topicAgentId } = params;
		const chatId = msg.chat.id;
		const messageThreadId = msg.message_thread_id;
		const threadSpec = resolveTelegramThreadSpec({
			isGroup,
			isForum,
			messageThreadId: resolvedThreadId ?? messageThreadId
		});
		let { route, configuredBinding } = resolveTelegramConversationRoute({
			cfg: runtimeCfg,
			accountId,
			chatId,
			isGroup,
			resolvedThreadId,
			replyThreadId: threadSpec.id,
			senderId,
			topicAgentId
		});
		const nativeCommandRuntime = await loadTelegramNativeCommandRuntime();
		if (configuredBinding) {
			const ensured = await nativeCommandRuntime.ensureConfiguredBindingRouteReady({
				cfg: runtimeCfg,
				bindingResolution: configuredBinding
			});
			if (!ensured.ok) {
				logVerbose(`telegram native command: configured ACP binding unavailable for topic ${configuredBinding.record.conversation.conversationId}: ${ensured.error}`);
				await withTelegramApiErrorLogging({
					operation: "sendMessage",
					runtime,
					fn: () => bot.api.sendMessage(chatId, "Configured ACP binding is unavailable right now. Please try again.", buildTelegramThreadParams(threadSpec) ?? {})
				});
				return null;
			}
		}
		return {
			chatId,
			threadSpec,
			route,
			mediaLocalRoots: nativeCommandRuntime.getAgentScopedMediaLocalRoots(runtimeCfg, route.agentId),
			tableMode: resolveMarkdownTableMode({
				cfg: runtimeCfg,
				channel: "telegram",
				accountId: route.accountId
			}),
			chunkMode: nativeCommandRuntime.resolveChunkMode(runtimeCfg, "telegram", route.accountId)
		};
	};
	const buildCommandDeliveryBaseOptions = (params) => ({
		chatId: String(params.chatId),
		accountId: params.accountId,
		sessionKeyForInternalHooks: params.sessionKeyForInternalHooks,
		mirrorIsGroup: params.mirrorIsGroup,
		mirrorGroupId: params.mirrorGroupId,
		token: opts.token,
		runtime,
		bot,
		mediaLocalRoots: params.mediaLocalRoots,
		replyToMode,
		textLimit,
		thread: params.threadSpec,
		tableMode: params.tableMode,
		chunkMode: params.chunkMode,
		linkPreview: params.linkPreview
	});
	if (commandsToRegister.length > 0 || pluginCatalog.commands.length > 0) {
		for (const command of nativeCommands) {
			const normalizedCommandName = normalizeTelegramCommandName(command.name);
			bot.command(normalizedCommandName, async (ctx) => {
				const msg = ctx.message;
				if (!msg) return;
				if (shouldSkipUpdate(ctx)) return;
				const runtimeCfg = loadFreshRuntimeConfig();
				const runtimeTelegramCfg = resolveFreshTelegramConfig(runtimeCfg);
				const auth = await resolveTelegramCommandAuth({
					msg,
					bot,
					cfg: runtimeCfg,
					accountId,
					telegramCfg: runtimeTelegramCfg,
					readChannelAllowFromStore: telegramDeps.readChannelAllowFromStore,
					allowFrom,
					groupAllowFrom,
					useAccessGroups,
					resolveGroupPolicy,
					resolveTelegramGroupConfig,
					requireAuth: true
				});
				if (!auth) return;
				const { chatId, isGroup, isForum, resolvedThreadId, senderId, senderUsername, groupConfig, topicConfig, commandAuthorized } = auth;
				const runtimeContext = await resolveCommandRuntimeContext({
					msg,
					runtimeCfg,
					isGroup,
					isForum,
					resolvedThreadId,
					senderId,
					topicAgentId: topicConfig?.agentId
				});
				if (!runtimeContext) return;
				const { threadSpec, route, mediaLocalRoots, tableMode, chunkMode } = runtimeContext;
				const threadParams = buildTelegramThreadParams(threadSpec) ?? {};
				const originatingTo = buildTelegramRoutingTarget(chatId, threadSpec);
				const executionCfg = getRuntimeConfigSnapshot() ?? cfg;
				const commandDefinition = findCommandByNativeName(command.name, "telegram");
				const rawText = ctx.match?.trim() ?? "";
				const commandArgs = commandDefinition ? parseCommandArgs(commandDefinition, rawText) : rawText ? { raw: rawText } : void 0;
				const prompt = commandDefinition ? buildCommandTextFromArgs(commandDefinition, commandArgs) : rawText ? `/${command.name} ${rawText}` : `/${command.name}`;
				const menu = commandDefinition ? resolveCommandArgMenu({
					command: commandDefinition,
					args: commandArgs,
					cfg: runtimeCfg
				}) : null;
				if (menu && commandDefinition) {
					const title = menu.title ?? `Choose ${menu.arg.description || menu.arg.name} for /${commandDefinition.nativeName ?? commandDefinition.key}.`;
					const rows = [];
					for (let i = 0; i < menu.choices.length; i += 2) {
						const slice = menu.choices.slice(i, i + 2);
						rows.push(slice.map((choice) => {
							const args = { values: { [menu.arg.name]: choice.value } };
							return {
								text: choice.label,
								callback_data: buildTelegramNativeCommandCallbackData(buildCommandTextFromArgs(commandDefinition, args))
							};
						}));
					}
					const replyMarkup = buildInlineKeyboard(rows);
					await withTelegramApiErrorLogging({
						operation: "sendMessage",
						runtime,
						fn: () => bot.api.sendMessage(chatId, title, {
							...replyMarkup ? { reply_markup: replyMarkup } : {},
							...threadParams
						})
					});
					return;
				}
				const baseSessionKey = resolveTelegramConversationBaseSessionKey({
					cfg: runtimeCfg,
					route,
					chatId,
					isGroup,
					senderId
				});
				const dmThreadId = threadSpec.scope === "dm" ? threadSpec.id : void 0;
				const nativeCommandRuntime = await loadTelegramNativeCommandRuntime();
				const sessionKey = (dmThreadId != null ? nativeCommandRuntime.resolveThreadSessionKeys({
					baseSessionKey,
					threadId: `${chatId}:${dmThreadId}`
				}) : null)?.sessionKey ?? baseSessionKey;
				const { skillFilter, groupSystemPrompt } = resolveTelegramGroupPromptSettings({
					groupConfig,
					topicConfig
				});
				const { sessionKey: commandSessionKey, commandTargetSessionKey } = resolveNativeCommandSessionTargets({
					agentId: route.agentId,
					sessionPrefix: "telegram:slash",
					userId: String(senderId || chatId),
					targetSessionKey: sessionKey
				});
				const deliveryBaseOptions = buildCommandDeliveryBaseOptions({
					chatId,
					accountId: route.accountId,
					sessionKeyForInternalHooks: commandSessionKey,
					mirrorIsGroup: isGroup,
					mirrorGroupId: isGroup ? String(chatId) : void 0,
					mediaLocalRoots,
					threadSpec,
					tableMode,
					chunkMode,
					linkPreview: runtimeTelegramCfg.linkPreview
				});
				const conversationLabel = isGroup ? msg.chat.title ? `${msg.chat.title} id:${chatId}` : `group:${chatId}` : buildSenderName(msg) ?? String(senderId || chatId);
				const ctxPayload = nativeCommandRuntime.finalizeInboundContext({
					Body: prompt,
					BodyForAgent: prompt,
					RawBody: prompt,
					CommandBody: prompt,
					CommandArgs: commandArgs,
					From: isGroup ? buildTelegramGroupFrom(chatId, resolvedThreadId) : `telegram:${chatId}`,
					To: `slash:${senderId || chatId}`,
					ChatType: isGroup ? "group" : "direct",
					ConversationLabel: conversationLabel,
					GroupSubject: isGroup ? msg.chat.title ?? void 0 : void 0,
					GroupSystemPrompt: isGroup || !isGroup && groupConfig ? groupSystemPrompt : void 0,
					SenderName: buildSenderName(msg),
					SenderId: senderId || void 0,
					SenderUsername: senderUsername || void 0,
					Surface: "telegram",
					Provider: "telegram",
					MessageSid: String(msg.message_id),
					Timestamp: msg.date ? msg.date * 1e3 : void 0,
					WasMentioned: true,
					CommandAuthorized: commandAuthorized,
					CommandSource: "native",
					SessionKey: commandSessionKey,
					AccountId: route.accountId,
					CommandTargetSessionKey: commandTargetSessionKey,
					MessageThreadId: threadSpec.id,
					IsForum: isForum,
					OriginatingChannel: "telegram",
					OriginatingTo: originatingTo
				});
				await nativeCommandRuntime.recordInboundSessionMetaSafe({
					cfg: executionCfg,
					agentId: route.agentId,
					sessionKey: ctxPayload.SessionKey ?? route.sessionKey,
					ctx: ctxPayload,
					onError: (err) => runtime.error?.(danger(`telegram slash: failed updating session meta: ${String(err)}`))
				});
				const disableBlockStreaming = typeof runtimeTelegramCfg.blockStreaming === "boolean" ? !runtimeTelegramCfg.blockStreaming : void 0;
				const deliveryState = {
					delivered: false,
					skippedNonSilent: 0
				};
				const { createChannelReplyPipeline, deliverReplies } = await loadTelegramNativeCommandDeliveryRuntime();
				const { onModelSelected, ...replyPipeline } = createChannelReplyPipeline({
					cfg: executionCfg,
					agentId: route.agentId,
					channel: "telegram",
					accountId: route.accountId
				});
				await telegramDeps.dispatchReplyWithBufferedBlockDispatcher({
					ctx: ctxPayload,
					cfg: executionCfg,
					dispatcherOptions: {
						...replyPipeline,
						deliver: async (payload, _info) => {
							if (shouldSuppressLocalTelegramExecApprovalPrompt({
								cfg: executionCfg,
								accountId: route.accountId,
								payload
							})) {
								deliveryState.delivered = true;
								return;
							}
							if ((await deliverReplies({
								replies: [payload],
								...deliveryBaseOptions,
								silent: runtimeTelegramCfg.silentErrorReplies === true && payload.isError === true
							})).delivered) deliveryState.delivered = true;
						},
						onSkip: (_payload, info) => {
							if (info.reason !== "silent") deliveryState.skippedNonSilent += 1;
						},
						onError: (err, info) => {
							runtime.error?.(danger(`telegram slash ${info.kind} reply failed: ${String(err)}`));
						}
					},
					replyOptions: {
						skillFilter,
						disableBlockStreaming,
						onModelSelected
					}
				});
				if (!deliveryState.delivered && deliveryState.skippedNonSilent > 0) await deliverReplies({
					replies: [{ text: EMPTY_RESPONSE_FALLBACK$1 }],
					...deliveryBaseOptions
				});
			});
		}
		for (const pluginCommand of pluginCatalog.commands) bot.command(pluginCommand.command, async (ctx) => {
			const msg = ctx.message;
			if (!msg) return;
			if (shouldSkipUpdate(ctx)) return;
			const chatId = msg.chat.id;
			const runtimeCfg = loadFreshRuntimeConfig();
			const runtimeTelegramCfg = resolveFreshTelegramConfig(runtimeCfg);
			const rawText = ctx.match?.trim() ?? "";
			const commandBody = `/${pluginCommand.command}${rawText ? ` ${rawText}` : ""}`;
			const nativeCommandRuntime = await loadTelegramNativeCommandRuntime();
			const match = nativeCommandRuntime.matchPluginCommand(commandBody);
			if (!match) {
				await withTelegramApiErrorLogging({
					operation: "sendMessage",
					runtime,
					fn: () => bot.api.sendMessage(chatId, "Command not found.")
				});
				return;
			}
			const auth = await resolveTelegramCommandAuth({
				msg,
				bot,
				cfg: runtimeCfg,
				accountId,
				telegramCfg: runtimeTelegramCfg,
				readChannelAllowFromStore: telegramDeps.readChannelAllowFromStore,
				allowFrom,
				groupAllowFrom,
				useAccessGroups,
				resolveGroupPolicy,
				resolveTelegramGroupConfig,
				requireAuth: match.command.requireAuth !== false
			});
			if (!auth) return;
			const { senderId, commandAuthorized, isGroup, isForum, resolvedThreadId } = auth;
			const runtimeContext = await resolveCommandRuntimeContext({
				msg,
				runtimeCfg,
				isGroup,
				isForum,
				resolvedThreadId,
				senderId,
				topicAgentId: auth.topicConfig?.agentId
			});
			if (!runtimeContext) return;
			const { threadSpec, route, mediaLocalRoots, tableMode, chunkMode } = runtimeContext;
			const deliveryBaseOptions = buildCommandDeliveryBaseOptions({
				chatId,
				accountId: route.accountId,
				sessionKeyForInternalHooks: route.sessionKey,
				mirrorIsGroup: isGroup,
				mirrorGroupId: isGroup ? String(chatId) : void 0,
				mediaLocalRoots,
				threadSpec,
				tableMode,
				chunkMode,
				linkPreview: runtimeTelegramCfg.linkPreview
			});
			const from = isGroup ? buildTelegramGroupFrom(chatId, threadSpec.id) : `telegram:${chatId}`;
			const to = `telegram:${chatId}`;
			const { deliverReplies } = await loadTelegramNativeCommandDeliveryRuntime();
			const result = await nativeCommandRuntime.executePluginCommand({
				command: match.command,
				args: match.args,
				senderId,
				channel: "telegram",
				isAuthorizedSender: commandAuthorized,
				sessionKey: route.sessionKey,
				commandBody,
				config: runtimeCfg,
				from,
				to,
				accountId,
				messageThreadId: threadSpec.id
			});
			if (!shouldSuppressLocalTelegramExecApprovalPrompt({
				cfg: runtimeCfg,
				accountId: route.accountId,
				payload: result
			})) await deliverReplies({
				replies: [result],
				...deliveryBaseOptions,
				silent: runtimeTelegramCfg.silentErrorReplies === true && result.isError === true
			});
		});
	} else if (nativeDisabledExplicit) withTelegramApiErrorLogging({
		operation: "setMyCommands",
		runtime,
		fn: () => bot.api.setMyCommands([])
	}).catch(() => {});
};
//#endregion
//#region extensions/telegram/src/bot-updates.ts
const RECENT_TELEGRAM_UPDATE_TTL_MS = 5 * 6e4;
const RECENT_TELEGRAM_UPDATE_MAX = 2e3;
const resolveTelegramUpdateId = (ctx) => ctx.update?.update_id ?? ctx.update_id;
const buildTelegramUpdateKey = (ctx) => {
	const updateId = resolveTelegramUpdateId(ctx);
	if (typeof updateId === "number") return `update:${updateId}`;
	const callbackId = ctx.callbackQuery?.id;
	if (callbackId) return `callback:${callbackId}`;
	const msg = ctx.message ?? ctx.channelPost ?? ctx.editedChannelPost ?? ctx.update?.message ?? ctx.update?.edited_message ?? ctx.update?.channel_post ?? ctx.update?.edited_channel_post ?? ctx.callbackQuery?.message;
	const chatId = msg?.chat?.id;
	const messageId = msg?.message_id;
	if (typeof chatId !== "undefined" && typeof messageId === "number") return `message:${chatId}:${messageId}`;
};
const createTelegramUpdateDedupe = () => createDedupeCache({
	ttlMs: RECENT_TELEGRAM_UPDATE_TTL_MS,
	maxSize: RECENT_TELEGRAM_UPDATE_MAX
});
//#endregion
//#region extensions/telegram/src/group-migration.ts
function resolveAccountGroups(cfg, accountId) {
	if (!accountId) return {};
	const normalized = normalizeAccountId(accountId);
	const accounts = cfg.channels?.telegram?.accounts;
	if (!accounts || typeof accounts !== "object") return {};
	const exact = accounts[normalized];
	if (exact?.groups) return { groups: exact.groups };
	const matchKey = Object.keys(accounts).find((key) => key.toLowerCase() === normalized.toLowerCase());
	return { groups: matchKey ? accounts[matchKey]?.groups : void 0 };
}
function migrateTelegramGroupsInPlace(groups, oldChatId, newChatId) {
	if (!groups) return {
		migrated: false,
		skippedExisting: false
	};
	if (oldChatId === newChatId) return {
		migrated: false,
		skippedExisting: false
	};
	if (!Object.hasOwn(groups, oldChatId)) return {
		migrated: false,
		skippedExisting: false
	};
	if (Object.hasOwn(groups, newChatId)) return {
		migrated: false,
		skippedExisting: true
	};
	groups[newChatId] = groups[oldChatId];
	delete groups[oldChatId];
	return {
		migrated: true,
		skippedExisting: false
	};
}
function migrateTelegramGroupConfig(params) {
	const scopes = [];
	let migrated = false;
	let skippedExisting = false;
	const migrationTargets = [{
		scope: "account",
		groups: resolveAccountGroups(params.cfg, params.accountId).groups
	}, {
		scope: "global",
		groups: params.cfg.channels?.telegram?.groups
	}];
	for (const target of migrationTargets) {
		const result = migrateTelegramGroupsInPlace(target.groups, params.oldChatId, params.newChatId);
		if (result.migrated) {
			migrated = true;
			scopes.push(target.scope);
		}
		if (result.skippedExisting) skippedExisting = true;
	}
	return {
		migrated,
		skippedExisting,
		scopes
	};
}
//#endregion
//#region extensions/telegram/src/bot-handlers.runtime.ts
const registerTelegramHandlers = ({ cfg, accountId, bot, opts, telegramTransport, runtime, mediaMaxBytes, telegramCfg, allowFrom, groupAllowFrom, resolveGroupPolicy, resolveTelegramGroupConfig, shouldSkipUpdate, processMessage, logger, telegramDeps = defaultTelegramBotDeps }) => {
	const DEFAULT_TEXT_FRAGMENT_MAX_GAP_MS = 1500;
	const TELEGRAM_TEXT_FRAGMENT_START_THRESHOLD_CHARS = 4e3;
	const TELEGRAM_TEXT_FRAGMENT_MAX_GAP_MS = typeof opts.testTimings?.textFragmentGapMs === "number" && Number.isFinite(opts.testTimings.textFragmentGapMs) ? Math.max(10, Math.floor(opts.testTimings.textFragmentGapMs)) : DEFAULT_TEXT_FRAGMENT_MAX_GAP_MS;
	const TELEGRAM_TEXT_FRAGMENT_MAX_ID_GAP = 1;
	const TELEGRAM_TEXT_FRAGMENT_MAX_PARTS = 12;
	const TELEGRAM_TEXT_FRAGMENT_MAX_TOTAL_CHARS = 5e4;
	const mediaGroupTimeoutMs = typeof opts.testTimings?.mediaGroupFlushMs === "number" && Number.isFinite(opts.testTimings.mediaGroupFlushMs) ? Math.max(10, Math.floor(opts.testTimings.mediaGroupFlushMs)) : 500;
	const mediaGroupBuffer = /* @__PURE__ */ new Map();
	let mediaGroupProcessing = Promise.resolve();
	const textFragmentBuffer = /* @__PURE__ */ new Map();
	let textFragmentProcessing = Promise.resolve();
	const debounceMs = resolveInboundDebounceMs({
		cfg,
		channel: "telegram"
	});
	const FORWARD_BURST_DEBOUNCE_MS = 80;
	const resolveTelegramDebounceLane = (msg) => {
		const forwardMeta = msg;
		return forwardMeta.forward_origin ?? forwardMeta.forward_from ?? forwardMeta.forward_from_chat ?? forwardMeta.forward_sender_name ?? forwardMeta.forward_date ? "forward" : "default";
	};
	const buildSyntheticTextMessage = (params) => ({
		...params.base,
		...params.from ? { from: params.from } : {},
		text: params.text,
		caption: void 0,
		caption_entities: void 0,
		entities: void 0,
		...params.date != null ? { date: params.date } : {}
	});
	const buildSyntheticContext = (ctx, message) => {
		const getFile = typeof ctx.getFile === "function" ? ctx.getFile.bind(ctx) : async () => ({});
		return {
			message,
			me: ctx.me,
			getFile
		};
	};
	const inboundDebouncer = createInboundDebouncer({
		debounceMs,
		resolveDebounceMs: (entry) => entry.debounceLane === "forward" ? FORWARD_BURST_DEBOUNCE_MS : debounceMs,
		buildKey: (entry) => entry.debounceKey,
		shouldDebounce: (entry) => {
			const hasDebounceableText = shouldDebounceTextInbound({
				text: entry.msg.text ?? entry.msg.caption ?? "",
				cfg,
				commandOptions: { botUsername: entry.botUsername }
			});
			if (entry.debounceLane === "forward") return hasDebounceableText || entry.allMedia.length > 0;
			if (!hasDebounceableText) return false;
			return entry.allMedia.length === 0;
		},
		onFlush: async (entries) => {
			const last = entries.at(-1);
			if (!last) return;
			if (entries.length === 1) {
				const replyMedia = await resolveReplyMediaForMessage(last.ctx, last.msg);
				await processMessage(last.ctx, last.allMedia, last.storeAllowFrom, {
					receivedAtMs: last.receivedAtMs,
					ingressBuffer: "inbound-debounce"
				}, replyMedia);
				return;
			}
			const combinedText = entries.map((entry) => entry.msg.text ?? entry.msg.caption ?? "").filter(Boolean).join("\n");
			const combinedMedia = entries.flatMap((entry) => entry.allMedia);
			if (!combinedText.trim() && combinedMedia.length === 0) return;
			const first = entries[0];
			const baseCtx = first.ctx;
			const syntheticMessage = buildSyntheticTextMessage({
				base: first.msg,
				text: combinedText,
				date: last.msg.date ?? first.msg.date
			});
			const messageIdOverride = last.msg.message_id ? String(last.msg.message_id) : void 0;
			const syntheticCtx = buildSyntheticContext(baseCtx, syntheticMessage);
			const replyMedia = await resolveReplyMediaForMessage(baseCtx, syntheticMessage);
			await processMessage(syntheticCtx, combinedMedia, first.storeAllowFrom, {
				...messageIdOverride ? { messageIdOverride } : {},
				receivedAtMs: first.receivedAtMs,
				ingressBuffer: "inbound-debounce"
			}, replyMedia);
		},
		onError: (err, items) => {
			runtime.error?.(danger(`telegram debounce flush failed: ${String(err)}`));
			const chatId = items[0]?.msg.chat.id;
			if (chatId != null) {
				const threadId = items[0]?.msg.message_thread_id;
				bot.api.sendMessage(chatId, "Something went wrong while processing your message. Please try again.", threadId != null ? { message_thread_id: threadId } : void 0).catch((sendErr) => {
					logVerbose(`telegram: error fallback send failed: ${String(sendErr)}`);
				});
			}
		}
	});
	const resolveTelegramSessionState = (params) => {
		const runtimeCfg = telegramDeps.loadConfig();
		const resolvedThreadId = params.resolvedThreadId ?? resolveTelegramForumThreadId({
			isForum: params.isForum,
			messageThreadId: params.messageThreadId
		});
		const dmThreadId = !params.isGroup ? params.messageThreadId : void 0;
		const topicThreadId = resolvedThreadId ?? dmThreadId;
		const { topicConfig } = resolveTelegramGroupConfig(params.chatId, topicThreadId);
		const { route } = resolveTelegramConversationRoute({
			cfg: runtimeCfg,
			accountId,
			chatId: params.chatId,
			isGroup: params.isGroup,
			resolvedThreadId,
			replyThreadId: topicThreadId,
			senderId: params.senderId,
			topicAgentId: topicConfig?.agentId
		});
		const baseSessionKey = resolveTelegramConversationBaseSessionKey({
			cfg: runtimeCfg,
			route,
			chatId: params.chatId,
			isGroup: params.isGroup,
			senderId: params.senderId
		});
		const sessionKey = (dmThreadId != null ? resolveThreadSessionKeys({
			baseSessionKey,
			threadId: `${params.chatId}:${dmThreadId}`
		}) : null)?.sessionKey ?? baseSessionKey;
		const store = loadSessionStore(telegramDeps.resolveStorePath(runtimeCfg.session?.store, { agentId: route.agentId }));
		const entry = resolveSessionStoreEntry({
			store,
			sessionKey
		}).existing;
		const storedOverride = resolveStoredModelOverride({
			sessionEntry: entry,
			sessionStore: store,
			sessionKey
		});
		if (storedOverride) return {
			agentId: route.agentId,
			sessionEntry: entry,
			sessionKey,
			model: storedOverride.provider ? `${storedOverride.provider}/${storedOverride.model}` : storedOverride.model
		};
		const provider = entry?.modelProvider?.trim();
		const model = entry?.model?.trim();
		if (provider && model) return {
			agentId: route.agentId,
			sessionEntry: entry,
			sessionKey,
			model: `${provider}/${model}`
		};
		const modelCfg = runtimeCfg.agents?.defaults?.model;
		return {
			agentId: route.agentId,
			sessionEntry: entry,
			sessionKey,
			model: typeof modelCfg === "string" ? modelCfg : modelCfg?.primary
		};
	};
	const processMediaGroup = async (entry) => {
		try {
			entry.messages.sort((a, b) => a.msg.message_id - b.msg.message_id);
			const primaryEntry = entry.messages.find((m) => m.msg.caption || m.msg.text) ?? entry.messages[0];
			const allMedia = [];
			for (const { ctx } of entry.messages) {
				let media;
				try {
					media = await resolveMedia(ctx, mediaMaxBytes, opts.token, telegramTransport, telegramCfg.apiRoot);
				} catch (mediaErr) {
					if (!isRecoverableMediaGroupError(mediaErr)) throw mediaErr;
					runtime.log?.(warn(`media group: skipping photo that failed to fetch: ${String(mediaErr)}`));
					continue;
				}
				if (media) allMedia.push({
					path: media.path,
					contentType: media.contentType,
					stickerMetadata: media.stickerMetadata
				});
			}
			const storeAllowFrom = await loadStoreAllowFrom();
			const replyMedia = await resolveReplyMediaForMessage(primaryEntry.ctx, primaryEntry.msg);
			await processMessage(primaryEntry.ctx, allMedia, storeAllowFrom, void 0, replyMedia);
		} catch (err) {
			runtime.error?.(danger(`media group handler failed: ${String(err)}`));
		}
	};
	const flushTextFragments = async (entry) => {
		try {
			entry.messages.sort((a, b) => a.msg.message_id - b.msg.message_id);
			const first = entry.messages[0];
			const last = entry.messages.at(-1);
			if (!first || !last) return;
			const combinedText = entry.messages.map((m) => m.msg.text ?? "").join("");
			if (!combinedText.trim()) return;
			const syntheticMessage = buildSyntheticTextMessage({
				base: first.msg,
				text: combinedText,
				date: last.msg.date ?? first.msg.date
			});
			const storeAllowFrom = await loadStoreAllowFrom();
			const baseCtx = first.ctx;
			await processMessage(buildSyntheticContext(baseCtx, syntheticMessage), [], storeAllowFrom, {
				messageIdOverride: String(last.msg.message_id),
				receivedAtMs: first.receivedAtMs,
				ingressBuffer: "text-fragment"
			});
		} catch (err) {
			runtime.error?.(danger(`text fragment handler failed: ${String(err)}`));
		}
	};
	const queueTextFragmentFlush = async (entry) => {
		textFragmentProcessing = textFragmentProcessing.then(async () => {
			await flushTextFragments(entry);
		}).catch(() => void 0);
		await textFragmentProcessing;
	};
	const runTextFragmentFlush = async (entry) => {
		textFragmentBuffer.delete(entry.key);
		await queueTextFragmentFlush(entry);
	};
	const scheduleTextFragmentFlush = (entry) => {
		clearTimeout(entry.timer);
		entry.timer = setTimeout(async () => {
			await runTextFragmentFlush(entry);
		}, TELEGRAM_TEXT_FRAGMENT_MAX_GAP_MS);
	};
	const loadStoreAllowFrom = async () => telegramDeps.readChannelAllowFromStore("telegram", process.env, accountId).catch(() => []);
	const resolveReplyMediaForMessage = async (ctx, msg) => {
		const replyMessage = msg.reply_to_message;
		if (!replyMessage || !hasInboundMedia(replyMessage)) return [];
		const replyFileId = resolveInboundMediaFileId(replyMessage);
		if (!replyFileId) return [];
		try {
			const media = await resolveMedia({
				message: replyMessage,
				me: ctx.me,
				getFile: async () => await bot.api.getFile(replyFileId)
			}, mediaMaxBytes, opts.token, telegramTransport, telegramCfg.apiRoot);
			if (!media) return [];
			return [{
				path: media.path,
				contentType: media.contentType,
				stickerMetadata: media.stickerMetadata
			}];
		} catch (err) {
			logger.warn({
				chatId: msg.chat.id,
				error: String(err)
			}, "reply media fetch failed");
			return [];
		}
	};
	const isAllowlistAuthorized = (allow, senderId, senderUsername) => allow.hasWildcard || allow.hasEntries && isSenderAllowed({
		allow,
		senderId,
		senderUsername
	});
	const shouldSkipGroupMessage = (params) => {
		const { isGroup, chatId, chatTitle, resolvedThreadId, senderId, senderUsername, effectiveGroupAllow, hasGroupAllowOverride, groupConfig, topicConfig } = params;
		const baseAccess = evaluateTelegramGroupBaseAccess({
			isGroup,
			groupConfig,
			topicConfig,
			hasGroupAllowOverride,
			effectiveGroupAllow,
			senderId,
			senderUsername,
			enforceAllowOverride: true,
			requireSenderForAllowOverride: true
		});
		if (!baseAccess.allowed) {
			if (baseAccess.reason === "group-disabled") {
				logVerbose(`Blocked telegram group ${chatId} (group disabled)`);
				return true;
			}
			if (baseAccess.reason === "topic-disabled") {
				logVerbose(`Blocked telegram topic ${chatId} (${resolvedThreadId ?? "unknown"}) (topic disabled)`);
				return true;
			}
			logVerbose(`Blocked telegram group sender ${senderId || "unknown"} (group allowFrom override)`);
			return true;
		}
		if (!isGroup) return false;
		const policyAccess = evaluateTelegramGroupPolicyAccess({
			isGroup,
			chatId,
			cfg,
			telegramCfg,
			topicConfig,
			groupConfig,
			effectiveGroupAllow,
			senderId,
			senderUsername,
			resolveGroupPolicy,
			enforcePolicy: true,
			useTopicAndGroupOverrides: true,
			enforceAllowlistAuthorization: true,
			allowEmptyAllowlistEntries: false,
			requireSenderForAllowlistAuthorization: true,
			checkChatAllowlist: true
		});
		if (!policyAccess.allowed) {
			if (policyAccess.reason === "group-policy-disabled") {
				logVerbose("Blocked telegram group message (groupPolicy: disabled)");
				return true;
			}
			if (policyAccess.reason === "group-policy-allowlist-no-sender") {
				logVerbose("Blocked telegram group message (no sender ID, groupPolicy: allowlist)");
				return true;
			}
			if (policyAccess.reason === "group-policy-allowlist-empty") {
				logVerbose("Blocked telegram group message (groupPolicy: allowlist, no group allowlist entries)");
				return true;
			}
			if (policyAccess.reason === "group-policy-allowlist-unauthorized") {
				logVerbose(`Blocked telegram group message from ${senderId} (groupPolicy: allowlist)`);
				return true;
			}
			logger.info({
				chatId,
				title: chatTitle,
				reason: "not-allowed"
			}, "skipping group message");
			return true;
		}
		return false;
	};
	const getChat = typeof bot.api.getChat === "function" ? bot.api.getChat.bind(bot.api) : void 0;
	const TELEGRAM_EVENT_AUTH_RULES = {
		reaction: {
			enforceDirectAuthorization: true,
			enforceGroupAllowlistAuthorization: false,
			deniedDmReason: "reaction unauthorized by dm policy/allowlist",
			deniedGroupReason: "reaction unauthorized by group allowlist"
		},
		"callback-scope": {
			enforceDirectAuthorization: false,
			enforceGroupAllowlistAuthorization: false,
			deniedDmReason: "callback unauthorized by inlineButtonsScope",
			deniedGroupReason: "callback unauthorized by inlineButtonsScope"
		},
		"callback-allowlist": {
			enforceDirectAuthorization: true,
			enforceGroupAllowlistAuthorization: false,
			deniedDmReason: "callback unauthorized by inlineButtonsScope allowlist",
			deniedGroupReason: "callback unauthorized by inlineButtonsScope allowlist"
		}
	};
	const resolveTelegramEventAuthorizationContext = async (params) => {
		const groupAllowContext = params.groupAllowContext ?? await resolveTelegramGroupAllowFromContext({
			chatId: params.chatId,
			accountId,
			isGroup: params.isGroup,
			isForum: params.isForum,
			messageThreadId: params.messageThreadId,
			groupAllowFrom,
			readChannelAllowFromStore: telegramDeps.readChannelAllowFromStore,
			resolveTelegramGroupConfig
		});
		return {
			dmPolicy: !params.isGroup && groupAllowContext.groupConfig && "dmPolicy" in groupAllowContext.groupConfig ? groupAllowContext.groupConfig.dmPolicy ?? telegramCfg.dmPolicy ?? "pairing" : telegramCfg.dmPolicy ?? "pairing",
			...groupAllowContext
		};
	};
	const authorizeTelegramEventSender = (params) => {
		const { chatId, chatTitle, isGroup, senderId, senderUsername, mode, context } = params;
		const { dmPolicy, resolvedThreadId, storeAllowFrom, groupConfig, topicConfig, groupAllowOverride, effectiveGroupAllow, hasGroupAllowOverride } = context;
		const { enforceDirectAuthorization, enforceGroupAllowlistAuthorization, deniedDmReason, deniedGroupReason } = TELEGRAM_EVENT_AUTH_RULES[mode];
		if (shouldSkipGroupMessage({
			isGroup,
			chatId,
			chatTitle,
			resolvedThreadId,
			senderId,
			senderUsername,
			effectiveGroupAllow,
			hasGroupAllowOverride,
			groupConfig,
			topicConfig
		})) return {
			allowed: false,
			reason: "group-policy"
		};
		if (!isGroup && enforceDirectAuthorization) {
			if (dmPolicy === "disabled") {
				logVerbose(`Blocked telegram direct event from ${senderId || "unknown"} (${deniedDmReason})`);
				return {
					allowed: false,
					reason: "direct-disabled"
				};
			}
			if (dmPolicy !== "open") {
				if (!isAllowlistAuthorized(normalizeDmAllowFromWithStore({
					allowFrom: groupAllowOverride ?? allowFrom,
					storeAllowFrom,
					dmPolicy
				}), senderId, senderUsername)) {
					logVerbose(`Blocked telegram direct sender ${senderId || "unknown"} (${deniedDmReason})`);
					return {
						allowed: false,
						reason: "direct-unauthorized"
					};
				}
			}
		}
		if (isGroup && enforceGroupAllowlistAuthorization) {
			if (!isAllowlistAuthorized(effectiveGroupAllow, senderId, senderUsername)) {
				logVerbose(`Blocked telegram group sender ${senderId || "unknown"} (${deniedGroupReason})`);
				return {
					allowed: false,
					reason: "group-unauthorized"
				};
			}
		}
		return { allowed: true };
	};
	bot.on("message_reaction", async (ctx) => {
		try {
			const reaction = ctx.messageReaction;
			if (!reaction) return;
			if (shouldSkipUpdate(ctx)) return;
			const chatId = reaction.chat.id;
			const messageId = reaction.message_id;
			const user = reaction.user;
			const senderId = user?.id != null ? String(user.id) : "";
			const senderUsername = user?.username ?? "";
			const isGroup = reaction.chat.type === "group" || reaction.chat.type === "supergroup";
			const isForum = reaction.chat.is_forum === true;
			const reactionMode = telegramCfg.reactionNotifications ?? "own";
			if (reactionMode === "off") return;
			if (user?.is_bot) return;
			if (reactionMode === "own" && !telegramDeps.wasSentByBot(chatId, messageId)) return;
			const eventAuthContext = await resolveTelegramEventAuthorizationContext({
				chatId,
				isGroup,
				isForum
			});
			if (!authorizeTelegramEventSender({
				chatId,
				chatTitle: reaction.chat.title,
				isGroup,
				senderId,
				senderUsername,
				mode: "reaction",
				context: eventAuthContext
			}).allowed) return;
			if (!isGroup) {
				if (eventAuthContext.groupConfig?.requireTopic === true) {
					logVerbose(`Blocked telegram reaction in DM ${chatId}: requireTopic=true but topic unknown for reactions`);
					return;
				}
			}
			const oldEmojis = new Set(reaction.old_reaction.filter((r) => r.type === "emoji").map((r) => r.emoji));
			const addedReactions = reaction.new_reaction.filter((r) => r.type === "emoji").filter((r) => !oldEmojis.has(r.emoji));
			if (addedReactions.length === 0) return;
			const senderName = user ? [user.first_name, user.last_name].filter(Boolean).join(" ").trim() || user.username : void 0;
			const senderUsernameLabel = user?.username ? `@${user.username}` : void 0;
			let senderLabel = senderName;
			if (senderName && senderUsernameLabel) senderLabel = `${senderName} (${senderUsernameLabel})`;
			else if (!senderName && senderUsernameLabel) senderLabel = senderUsernameLabel;
			if (!senderLabel && user?.id) senderLabel = `id:${user.id}`;
			senderLabel = senderLabel || "unknown";
			const resolvedThreadId = isForum ? resolveTelegramForumThreadId({
				isForum,
				messageThreadId: void 0
			}) : void 0;
			const peerId = isGroup ? buildTelegramGroupPeerId(chatId, resolvedThreadId) : String(chatId);
			const parentPeer = buildTelegramParentPeer({
				isGroup,
				resolvedThreadId,
				chatId
			});
			const sessionKey = resolveAgentRoute({
				cfg: telegramDeps.loadConfig(),
				channel: "telegram",
				accountId,
				peer: {
					kind: isGroup ? "group" : "direct",
					id: peerId
				},
				parentPeer
			}).sessionKey;
			for (const r of addedReactions) {
				const emoji = r.emoji;
				const text = `Telegram reaction added: ${emoji} by ${senderLabel} on msg ${messageId}`;
				telegramDeps.enqueueSystemEvent(text, {
					sessionKey,
					contextKey: `telegram:reaction:add:${chatId}:${messageId}:${user?.id ?? "anon"}:${emoji}`
				});
				logVerbose(`telegram: reaction event enqueued: ${text}`);
			}
		} catch (err) {
			runtime.error?.(danger(`telegram reaction handler failed: ${String(err)}`));
		}
	});
	const processInboundMessage = async (params) => {
		const { ctx, msg, chatId, resolvedThreadId, dmThreadId, storeAllowFrom, sendOversizeWarning, oversizeLogMessage } = params;
		const text = typeof msg.text === "string" ? msg.text : void 0;
		const isCommandLike = (text ?? "").trim().startsWith("/");
		if (text && !isCommandLike) {
			const nowMs = Date.now();
			const senderId = msg.from?.id != null ? String(msg.from.id) : "unknown";
			const key = `text:${chatId}:${resolvedThreadId ?? dmThreadId ?? "main"}:${senderId}`;
			const existing = textFragmentBuffer.get(key);
			if (existing) {
				const last = existing.messages.at(-1);
				const lastMsgId = last?.msg.message_id;
				const lastReceivedAtMs = last?.receivedAtMs ?? nowMs;
				const idGap = typeof lastMsgId === "number" ? msg.message_id - lastMsgId : Infinity;
				const timeGapMs = nowMs - lastReceivedAtMs;
				if (idGap > 0 && idGap <= TELEGRAM_TEXT_FRAGMENT_MAX_ID_GAP && timeGapMs >= 0 && timeGapMs <= TELEGRAM_TEXT_FRAGMENT_MAX_GAP_MS) {
					const nextTotalChars = existing.messages.reduce((sum, m) => sum + (m.msg.text?.length ?? 0), 0) + text.length;
					if (existing.messages.length + 1 <= TELEGRAM_TEXT_FRAGMENT_MAX_PARTS && nextTotalChars <= TELEGRAM_TEXT_FRAGMENT_MAX_TOTAL_CHARS) {
						existing.messages.push({
							msg,
							ctx,
							receivedAtMs: nowMs
						});
						scheduleTextFragmentFlush(existing);
						return;
					}
				}
				clearTimeout(existing.timer);
				textFragmentBuffer.delete(key);
				textFragmentProcessing = textFragmentProcessing.then(async () => {
					await flushTextFragments(existing);
				}).catch(() => void 0);
				await textFragmentProcessing;
			}
			if (text.length >= TELEGRAM_TEXT_FRAGMENT_START_THRESHOLD_CHARS) {
				const entry = {
					key,
					messages: [{
						msg,
						ctx,
						receivedAtMs: nowMs
					}],
					timer: setTimeout(() => {}, TELEGRAM_TEXT_FRAGMENT_MAX_GAP_MS)
				};
				textFragmentBuffer.set(key, entry);
				scheduleTextFragmentFlush(entry);
				return;
			}
		}
		const mediaGroupId = msg.media_group_id;
		if (mediaGroupId) {
			const existing = mediaGroupBuffer.get(mediaGroupId);
			if (existing) {
				clearTimeout(existing.timer);
				existing.messages.push({
					msg,
					ctx
				});
				existing.timer = setTimeout(async () => {
					mediaGroupBuffer.delete(mediaGroupId);
					mediaGroupProcessing = mediaGroupProcessing.then(async () => {
						await processMediaGroup(existing);
					}).catch(() => void 0);
					await mediaGroupProcessing;
				}, mediaGroupTimeoutMs);
			} else {
				const entry = {
					messages: [{
						msg,
						ctx
					}],
					timer: setTimeout(async () => {
						mediaGroupBuffer.delete(mediaGroupId);
						mediaGroupProcessing = mediaGroupProcessing.then(async () => {
							await processMediaGroup(entry);
						}).catch(() => void 0);
						await mediaGroupProcessing;
					}, mediaGroupTimeoutMs)
				};
				mediaGroupBuffer.set(mediaGroupId, entry);
			}
			return;
		}
		let media = null;
		try {
			media = await resolveMedia(ctx, mediaMaxBytes, opts.token, telegramTransport, telegramCfg.apiRoot);
		} catch (mediaErr) {
			if (isMediaSizeLimitError(mediaErr)) {
				if (sendOversizeWarning) {
					const limitMb = Math.round(mediaMaxBytes / (1024 * 1024));
					await withTelegramApiErrorLogging({
						operation: "sendMessage",
						runtime,
						fn: () => bot.api.sendMessage(chatId, `⚠️ File too large. Maximum size is ${limitMb}MB.`, { reply_parameters: {
							message_id: msg.message_id,
							allow_sending_without_reply: true
						} })
					}).catch(() => {});
				}
				logger.warn({
					chatId,
					error: String(mediaErr)
				}, oversizeLogMessage);
				return;
			}
			logger.warn({
				chatId,
				error: String(mediaErr)
			}, "media fetch failed");
			await withTelegramApiErrorLogging({
				operation: "sendMessage",
				runtime,
				fn: () => bot.api.sendMessage(chatId, "⚠️ Failed to download media. Please try again.", { reply_parameters: {
					message_id: msg.message_id,
					allow_sending_without_reply: true
				} })
			}).catch(() => {});
			return;
		}
		const hasText = Boolean(getTelegramTextParts(msg).text.trim());
		if (msg.sticker && !media && !hasText) {
			logVerbose("telegram: skipping sticker-only message (unsupported sticker type)");
			return;
		}
		const allMedia = media ? [{
			path: media.path,
			contentType: media.contentType,
			stickerMetadata: media.stickerMetadata
		}] : [];
		const senderId = msg.from?.id ? String(msg.from.id) : "";
		const conversationThreadId = resolvedThreadId ?? dmThreadId;
		const conversationKey = conversationThreadId != null ? `${chatId}:topic:${conversationThreadId}` : String(chatId);
		const debounceLane = resolveTelegramDebounceLane(msg);
		const debounceKey = senderId ? `telegram:${accountId ?? "default"}:${conversationKey}:${senderId}:${debounceLane}` : null;
		await inboundDebouncer.enqueue({
			ctx,
			msg,
			allMedia,
			storeAllowFrom,
			receivedAtMs: Date.now(),
			debounceKey,
			debounceLane,
			botUsername: ctx.me?.username
		});
	};
	bot.on("callback_query", async (ctx) => {
		const callback = ctx.callbackQuery;
		if (!callback) return;
		if (shouldSkipUpdate(ctx)) return;
		await withTelegramApiErrorLogging({
			operation: "answerCallbackQuery",
			runtime,
			fn: typeof ctx.answerCallbackQuery === "function" ? () => ctx.answerCallbackQuery() : () => bot.api.answerCallbackQuery(callback.id)
		}).catch(() => {});
		try {
			const data = (callback.data ?? "").trim();
			const callbackMessage = callback.message;
			if (!data || !callbackMessage) return;
			const editCallbackMessage = async (text, params) => {
				if (typeof ctx.editMessageText === "function") return await ctx.editMessageText(text, params);
				return await bot.api.editMessageText(callbackMessage.chat.id, callbackMessage.message_id, text, params);
			};
			const clearCallbackButtons = async () => {
				const replyMarkup = { reply_markup: { inline_keyboard: [] } };
				if (typeof ctx.editMessageReplyMarkup === "function") return await ctx.editMessageReplyMarkup(replyMarkup);
				if (typeof bot.api.editMessageReplyMarkup === "function") return await bot.api.editMessageReplyMarkup(callbackMessage.chat.id, callbackMessage.message_id, replyMarkup);
				const messageText = callbackMessage.text ?? callbackMessage.caption;
				if (typeof messageText !== "string" || messageText.trim().length === 0) return;
				return await editCallbackMessage(messageText, replyMarkup);
			};
			const editCallbackButtons = async (buttons) => {
				const replyMarkup = { reply_markup: buildInlineKeyboard(buttons) ?? { inline_keyboard: [] } };
				if (typeof ctx.editMessageReplyMarkup === "function") return await ctx.editMessageReplyMarkup(replyMarkup);
				return await bot.api.editMessageReplyMarkup(callbackMessage.chat.id, callbackMessage.message_id, replyMarkup);
			};
			const deleteCallbackMessage = async () => {
				if (typeof ctx.deleteMessage === "function") return await ctx.deleteMessage();
				return await bot.api.deleteMessage(callbackMessage.chat.id, callbackMessage.message_id);
			};
			const replyToCallbackChat = async (text, params) => {
				if (typeof ctx.reply === "function") return await ctx.reply(text, params);
				return await bot.api.sendMessage(callbackMessage.chat.id, text, params);
			};
			const chatId = callbackMessage.chat.id;
			const isGroup = callbackMessage.chat.type === "group" || callbackMessage.chat.type === "supergroup";
			const approvalCallback = parseExecApprovalCommandText(data);
			const isApprovalCallback = approvalCallback !== null;
			const inlineButtonsScope = resolveTelegramInlineButtonsScope({
				cfg,
				accountId
			});
			const execApprovalButtonsEnabled = isApprovalCallback && shouldEnableTelegramExecApprovalButtons({
				cfg,
				accountId,
				to: String(chatId)
			});
			if (!execApprovalButtonsEnabled) {
				if (inlineButtonsScope === "off") return;
				if (inlineButtonsScope === "dm" && isGroup) return;
				if (inlineButtonsScope === "group" && !isGroup) return;
			}
			const messageThreadId = callbackMessage.message_thread_id;
			const isForum = await resolveTelegramForumFlag({
				chatId,
				chatType: callbackMessage.chat.type,
				isGroup,
				isForum: callbackMessage.chat.is_forum,
				getChat
			});
			const eventAuthContext = await resolveTelegramEventAuthorizationContext({
				chatId,
				isGroup,
				isForum,
				messageThreadId
			});
			const { resolvedThreadId, dmThreadId, storeAllowFrom, groupConfig } = eventAuthContext;
			const requireTopic = groupConfig?.requireTopic;
			if (!isGroup && requireTopic === true && dmThreadId == null) {
				logVerbose(`Blocked telegram callback in DM ${chatId}: requireTopic=true but no topic present`);
				return;
			}
			const senderId = callback.from?.id ? String(callback.from.id) : "";
			const senderUsername = callback.from?.username ?? "";
			const authorizationMode = !isGroup || !execApprovalButtonsEnabled && inlineButtonsScope === "allowlist" ? "callback-allowlist" : "callback-scope";
			if (!authorizeTelegramEventSender({
				chatId,
				chatTitle: callbackMessage.chat.title,
				isGroup,
				senderId,
				senderUsername,
				mode: authorizationMode,
				context: eventAuthContext
			}).allowed) return;
			const callbackThreadId = resolvedThreadId ?? dmThreadId;
			const callbackConversationId = callbackThreadId != null ? `${chatId}:topic:${callbackThreadId}` : String(chatId);
			const pluginBindingApproval = parsePluginBindingApprovalCustomId(data);
			if (pluginBindingApproval) {
				const resolved = await resolvePluginConversationBindingApproval({
					approvalId: pluginBindingApproval.approvalId,
					decision: pluginBindingApproval.decision,
					senderId: senderId || void 0
				});
				await clearCallbackButtons();
				await replyToCallbackChat(buildPluginBindingResolvedText(resolved));
				return;
			}
			if ((await dispatchPluginInteractiveHandler({
				channel: "telegram",
				data,
				callbackId: callback.id,
				ctx: {
					accountId,
					callbackId: callback.id,
					conversationId: callbackConversationId,
					parentConversationId: callbackThreadId != null ? String(chatId) : void 0,
					senderId: senderId || void 0,
					senderUsername: senderUsername || void 0,
					threadId: callbackThreadId,
					isGroup,
					isForum,
					auth: { isAuthorizedSender: true },
					callbackMessage: {
						messageId: callbackMessage.message_id,
						chatId: String(chatId),
						messageText: callbackMessage.text ?? callbackMessage.caption
					}
				},
				respond: {
					reply: async ({ text, buttons }) => {
						await replyToCallbackChat(text, buttons ? { reply_markup: buildInlineKeyboard(buttons) } : void 0);
					},
					editMessage: async ({ text, buttons }) => {
						await editCallbackMessage(text, buttons ? { reply_markup: buildInlineKeyboard(buttons) } : void 0);
					},
					editButtons: async ({ buttons }) => {
						await editCallbackButtons(buttons);
					},
					clearButtons: async () => {
						await clearCallbackButtons();
					},
					deleteMessage: async () => {
						await deleteCallbackMessage();
					}
				}
			})).handled) return;
			const runtimeCfg = telegramDeps.loadConfig();
			if (approvalCallback) {
				const isPluginApproval = approvalCallback.approvalId.startsWith("plugin:");
				const pluginApprovalAuthorizedSender = isTelegramExecApprovalApprover({
					cfg: runtimeCfg,
					accountId,
					senderId
				});
				const execApprovalAuthorizedSender = isTelegramExecApprovalAuthorizedSender({
					cfg: runtimeCfg,
					accountId,
					senderId
				});
				if (!(isPluginApproval ? pluginApprovalAuthorizedSender : execApprovalAuthorizedSender || pluginApprovalAuthorizedSender)) {
					logVerbose(`Blocked telegram approval callback from ${senderId || "unknown"} (not authorized)`);
					return;
				}
				try {
					await (telegramDeps.resolveExecApproval ?? resolveTelegramExecApproval)({
						cfg: runtimeCfg,
						approvalId: approvalCallback.approvalId,
						decision: approvalCallback.decision,
						senderId,
						allowPluginFallback: pluginApprovalAuthorizedSender
					});
				} catch (resolveErr) {
					const errStr = String(resolveErr);
					logVerbose(`telegram: failed to resolve approval callback ${approvalCallback.approvalId}: ${errStr}`);
					await replyToCallbackChat("❌ Failed to submit approval. Please try again or contact an admin.");
					return;
				}
				try {
					await clearCallbackButtons();
				} catch (editErr) {
					const errStr = String(editErr);
					if (errStr.includes("message is not modified") || errStr.includes("there is no text in the message to edit")) return;
					logVerbose(`telegram: failed to clear approval callback buttons: ${errStr}`);
				}
				return;
			}
			const paginationMatch = data.match(/^commands_page_(\d+|noop)(?::(.+))?$/);
			if (paginationMatch) {
				const pageValue = paginationMatch[1];
				if (pageValue === "noop") return;
				const page = Number.parseInt(pageValue, 10);
				if (Number.isNaN(page) || page < 1) return;
				const agentId = paginationMatch[2]?.trim() || resolveDefaultAgentId(runtimeCfg);
				const result = buildCommandsMessagePaginated(runtimeCfg, telegramDeps.listSkillCommandsForAgents({
					cfg: runtimeCfg,
					agentIds: [agentId]
				}), {
					page,
					surface: "telegram"
				});
				const keyboard = result.totalPages > 1 ? buildInlineKeyboard(buildCommandsPaginationKeyboard(result.currentPage, result.totalPages, agentId)) : void 0;
				try {
					await editCallbackMessage(result.text, keyboard ? { reply_markup: keyboard } : void 0);
				} catch (editErr) {
					if (!String(editErr).includes("message is not modified")) throw editErr;
				}
				return;
			}
			const modelCallback = parseModelCallbackData(data);
			if (modelCallback) {
				const sessionState = resolveTelegramSessionState({
					chatId,
					isGroup,
					isForum,
					messageThreadId,
					resolvedThreadId,
					senderId
				});
				const { byProvider, providers } = await telegramDeps.buildModelsProviderData(runtimeCfg, sessionState.agentId);
				const editMessageWithButtons = async (text, buttons) => {
					const keyboard = buildInlineKeyboard(buttons);
					try {
						await editCallbackMessage(text, keyboard ? { reply_markup: keyboard } : void 0);
					} catch (editErr) {
						const errStr = String(editErr);
						if (errStr.includes("no text in the message")) {
							try {
								await deleteCallbackMessage();
							} catch {}
							await replyToCallbackChat(text, keyboard ? { reply_markup: keyboard } : void 0);
						} else if (!errStr.includes("message is not modified")) throw editErr;
					}
				};
				if (modelCallback.type === "providers" || modelCallback.type === "back") {
					if (providers.length === 0) {
						await editMessageWithButtons("No providers available.", []);
						return;
					}
					await editMessageWithButtons("Select a provider:", buildProviderKeyboard(providers.map((p) => ({
						id: p,
						count: byProvider.get(p)?.size ?? 0
					}))));
					return;
				}
				if (modelCallback.type === "list") {
					const { provider, page } = modelCallback;
					const modelSet = byProvider.get(provider);
					if (!modelSet || modelSet.size === 0) {
						const buttons = buildProviderKeyboard(providers.map((p) => ({
							id: p,
							count: byProvider.get(p)?.size ?? 0
						})));
						await editMessageWithButtons(`Unknown provider: ${provider}\n\nSelect a provider:`, buttons);
						return;
					}
					const models = [...modelSet].toSorted();
					const pageSize = getModelsPageSize();
					const totalPages = calculateTotalPages(models.length, pageSize);
					const safePage = Math.max(1, Math.min(page, totalPages));
					const currentSessionState = resolveTelegramSessionState({
						chatId,
						isGroup,
						isForum,
						messageThreadId,
						resolvedThreadId,
						senderId
					});
					const currentModel = currentSessionState.model;
					const buttons = buildModelsKeyboard({
						provider,
						models,
						currentModel,
						currentPage: safePage,
						totalPages,
						pageSize
					});
					await editMessageWithButtons(formatModelsAvailableHeader({
						provider,
						total: models.length,
						cfg,
						agentDir: resolveAgentDir(cfg, currentSessionState.agentId),
						sessionEntry: currentSessionState.sessionEntry
					}), buttons);
					return;
				}
				if (modelCallback.type === "select") {
					const selection = resolveModelSelection({
						callback: modelCallback,
						providers,
						byProvider
					});
					if (selection.kind !== "resolved") {
						const buttons = buildProviderKeyboard(providers.map((p) => ({
							id: p,
							count: byProvider.get(p)?.size ?? 0
						})));
						await editMessageWithButtons(`Could not resolve model "${selection.model}".\n\nSelect a provider:`, buttons);
						return;
					}
					if (!byProvider.get(selection.provider)?.has(selection.model)) {
						await editMessageWithButtons(`❌ Model "${selection.provider}/${selection.model}" is not allowed.`, []);
						return;
					}
					try {
						const storePath = telegramDeps.resolveStorePath(cfg.session?.store, { agentId: sessionState.agentId });
						const resolvedDefault = resolveDefaultModelForAgent({
							cfg,
							agentId: sessionState.agentId
						});
						const isDefaultSelection = selection.provider === resolvedDefault.provider && selection.model === resolvedDefault.model;
						await updateSessionStore(storePath, (store) => {
							const sessionKey = sessionState.sessionKey;
							const entry = store[sessionKey] ?? {};
							store[sessionKey] = entry;
							applyModelOverrideToSessionEntry({
								entry,
								selection: {
									provider: selection.provider,
									model: selection.model,
									isDefault: isDefaultSelection
								}
							});
						});
						await editMessageWithButtons(`✅ Model ${isDefaultSelection ? "reset to default" : `changed to **${selection.provider}/${selection.model}**`}\n\nThis model will be used for your next message.`, []);
					} catch (err) {
						await editMessageWithButtons(`❌ Failed to change model: ${String(err)}`, []);
					}
					return;
				}
				return;
			}
			const nativeCallbackCommand = parseTelegramNativeCommandCallbackData(data);
			await processMessage(buildSyntheticContext(ctx, buildSyntheticTextMessage({
				base: withResolvedTelegramForumFlag(callbackMessage, isForum),
				from: callback.from,
				text: nativeCallbackCommand ?? data
			})), [], storeAllowFrom, {
				...nativeCallbackCommand ? { commandSource: "native" } : {},
				forceWasMentioned: true,
				messageIdOverride: callback.id
			});
		} catch (err) {
			runtime.error?.(danger(`callback handler failed: ${String(err)}`));
		}
	});
	bot.on("message:migrate_to_chat_id", async (ctx) => {
		try {
			const msg = ctx.message;
			if (!msg?.migrate_to_chat_id) return;
			if (shouldSkipUpdate(ctx)) return;
			const oldChatId = String(msg.chat.id);
			const newChatId = String(msg.migrate_to_chat_id);
			const chatTitle = msg.chat.title ?? "Unknown";
			runtime.log?.(warn(`[telegram] Group migrated: "${chatTitle}" ${oldChatId} → ${newChatId}`));
			if (!resolveChannelConfigWrites({
				cfg,
				channelId: "telegram",
				accountId
			})) {
				runtime.log?.(warn("[telegram] Config writes disabled; skipping group config migration."));
				return;
			}
			const currentConfig = telegramDeps.loadConfig();
			const migration = migrateTelegramGroupConfig({
				cfg: currentConfig,
				accountId,
				oldChatId,
				newChatId
			});
			if (migration.migrated) {
				runtime.log?.(warn(`[telegram] Migrating group config from ${oldChatId} to ${newChatId}`));
				migrateTelegramGroupConfig({
					cfg,
					accountId,
					oldChatId,
					newChatId
				});
				await writeConfigFile(currentConfig);
				runtime.log?.(warn(`[telegram] Group config migrated and saved successfully`));
			} else if (migration.skippedExisting) runtime.log?.(warn(`[telegram] Group config already exists for ${newChatId}; leaving ${oldChatId} unchanged`));
			else runtime.log?.(warn(`[telegram] No config found for old group ID ${oldChatId}, migration logged only`));
		} catch (err) {
			runtime.error?.(danger(`[telegram] Group migration handler failed: ${String(err)}`));
		}
	});
	const handleInboundMessageLike = async (event) => {
		try {
			if (shouldSkipUpdate(event.ctxForDedupe)) return;
			const { dmPolicy, resolvedThreadId, dmThreadId, storeAllowFrom, groupConfig, topicConfig, groupAllowOverride, effectiveGroupAllow, hasGroupAllowOverride } = await resolveTelegramEventAuthorizationContext({
				chatId: event.chatId,
				isGroup: event.isGroup,
				isForum: event.isForum,
				messageThreadId: event.messageThreadId
			});
			const effectiveDmAllow = normalizeDmAllowFromWithStore({
				allowFrom: groupAllowOverride ?? allowFrom,
				storeAllowFrom,
				dmPolicy
			});
			if (event.requireConfiguredGroup && (!groupConfig || groupConfig.enabled === false)) {
				logVerbose(`Blocked telegram channel ${event.chatId} (channel disabled)`);
				return;
			}
			if (shouldSkipGroupMessage({
				isGroup: event.isGroup,
				chatId: event.chatId,
				chatTitle: event.msg.chat.title,
				resolvedThreadId,
				senderId: event.senderId,
				senderUsername: event.senderUsername,
				effectiveGroupAllow,
				hasGroupAllowOverride,
				groupConfig,
				topicConfig
			})) return;
			if (!event.isGroup && (hasInboundMedia(event.msg) || hasReplyTargetMedia(event.msg))) {
				if (!await enforceTelegramDmAccess({
					isGroup: event.isGroup,
					dmPolicy,
					msg: event.msg,
					chatId: event.chatId,
					effectiveDmAllow,
					accountId,
					bot,
					logger,
					upsertPairingRequest: telegramDeps.upsertChannelPairingRequest
				})) return;
			}
			await processInboundMessage({
				ctx: event.ctx,
				msg: event.msg,
				chatId: event.chatId,
				resolvedThreadId,
				dmThreadId,
				storeAllowFrom,
				sendOversizeWarning: event.sendOversizeWarning,
				oversizeLogMessage: event.oversizeLogMessage
			});
		} catch (err) {
			runtime.error?.(danger(`${event.errorMessage}: ${String(err)}`));
		}
	};
	bot.on("message", async (ctx) => {
		const msg = ctx.message;
		if (!msg) return;
		const isGroup = msg.chat.type === "group" || msg.chat.type === "supergroup";
		const isForum = await resolveTelegramForumFlag({
			chatId: msg.chat.id,
			chatType: msg.chat.type,
			isGroup,
			isForum: msg.chat.is_forum,
			getChat
		});
		const normalizedMsg = withResolvedTelegramForumFlag(msg, isForum);
		if (normalizedMsg.from?.id != null && normalizedMsg.from.id === ctx.me?.id) return;
		await handleInboundMessageLike({
			ctxForDedupe: ctx,
			ctx: buildSyntheticContext(ctx, normalizedMsg),
			msg: normalizedMsg,
			chatId: normalizedMsg.chat.id,
			isGroup,
			isForum,
			messageThreadId: normalizedMsg.message_thread_id,
			senderId: normalizedMsg.from?.id != null ? String(normalizedMsg.from.id) : "",
			senderUsername: normalizedMsg.from?.username ?? "",
			requireConfiguredGroup: false,
			sendOversizeWarning: true,
			oversizeLogMessage: "media exceeds size limit",
			errorMessage: "handler failed"
		});
	});
	bot.on("channel_post", async (ctx) => {
		const post = ctx.channelPost;
		if (!post) return;
		const chatId = post.chat.id;
		const syntheticFrom = post.sender_chat ? {
			id: post.sender_chat.id,
			is_bot: true,
			first_name: post.sender_chat.title || "Channel",
			username: post.sender_chat.username
		} : {
			id: chatId,
			is_bot: true,
			first_name: post.chat.title || "Channel",
			username: post.chat.username
		};
		const syntheticMsg = {
			...post,
			from: post.from ?? syntheticFrom,
			chat: {
				...post.chat,
				type: "supergroup"
			}
		};
		await handleInboundMessageLike({
			ctxForDedupe: ctx,
			ctx: buildSyntheticContext(ctx, syntheticMsg),
			msg: syntheticMsg,
			chatId,
			isGroup: true,
			isForum: false,
			senderId: post.sender_chat?.id != null ? String(post.sender_chat.id) : post.from?.id != null ? String(post.from.id) : "",
			senderUsername: post.sender_chat?.username ?? post.from?.username ?? "",
			requireConfiguredGroup: true,
			sendOversizeWarning: false,
			oversizeLogMessage: "channel post media exceeds size limit",
			errorMessage: "channel_post handler failed"
		});
	});
};
//#endregion
//#region extensions/telegram/src/error-policy.ts
const errorCooldownStore = /* @__PURE__ */ new Map();
const DEFAULT_ERROR_COOLDOWN_MS = 144e5;
function pruneExpiredCooldowns(messageStore, now) {
	for (const [message, expiresAt] of messageStore) if (expiresAt <= now) messageStore.delete(message);
}
function resolveTelegramErrorPolicy(params) {
	const configs = [
		params.accountConfig,
		params.groupConfig,
		params.topicConfig
	];
	let policy = "always";
	let cooldownMs = DEFAULT_ERROR_COOLDOWN_MS;
	for (const config of configs) {
		if (config?.errorPolicy) policy = config.errorPolicy;
		if (typeof config?.errorCooldownMs === "number") cooldownMs = config.errorCooldownMs;
	}
	return {
		policy,
		cooldownMs
	};
}
function buildTelegramErrorScopeKey(params) {
	const threadId = params.threadId == null ? "main" : String(params.threadId);
	return `${params.accountId}:${String(params.chatId)}:${threadId}`;
}
function shouldSuppressTelegramError(params) {
	const { scopeKey, cooldownMs, errorMessage } = params;
	const now = Date.now();
	const messageKey = errorMessage ?? "";
	const scopeStore = errorCooldownStore.get(scopeKey);
	if (scopeStore) {
		pruneExpiredCooldowns(scopeStore, now);
		if (scopeStore.size === 0) errorCooldownStore.delete(scopeKey);
	}
	if (errorCooldownStore.size > 100) for (const [scope, messageStore] of errorCooldownStore) {
		pruneExpiredCooldowns(messageStore, now);
		if (messageStore.size === 0) errorCooldownStore.delete(scope);
	}
	const expiresAt = scopeStore?.get(messageKey);
	if (typeof expiresAt === "number" && expiresAt > now) return true;
	const nextScopeStore = scopeStore ?? /* @__PURE__ */ new Map();
	nextScopeStore.set(messageKey, now + cooldownMs);
	errorCooldownStore.set(scopeKey, nextScopeStore);
	return false;
}
function isSilentErrorPolicy(policy) {
	return policy === "silent";
}
//#endregion
//#region extensions/telegram/src/lane-delivery-text-deliverer.ts
const MESSAGE_NOT_MODIFIED_RE = /400:\s*Bad Request:\s*message is not modified|MESSAGE_NOT_MODIFIED/i;
const MESSAGE_NOT_FOUND_RE = /400:\s*Bad Request:\s*message to edit not found|MESSAGE_ID_INVALID|message can't be edited/i;
function extractErrorText(err) {
	return typeof err === "string" ? err : err instanceof Error ? err.message : typeof err === "object" && err && "description" in err ? typeof err.description === "string" ? err.description : "" : "";
}
function isMessageNotModifiedError(err) {
	return MESSAGE_NOT_MODIFIED_RE.test(extractErrorText(err));
}
/**
* Returns true when Telegram rejects an edit because the target message can no
* longer be resolved or edited. The caller still needs preview context to
* decide whether to retain a different visible preview or fall back to send.
*/
function isMissingPreviewMessageError(err) {
	return MESSAGE_NOT_FOUND_RE.test(extractErrorText(err));
}
function result(kind, delivery) {
	if (kind === "preview-finalized") return {
		kind,
		delivery
	};
	return { kind };
}
function shouldSkipRegressivePreviewUpdate(args) {
	const currentPreviewText = args.currentPreviewText;
	if (currentPreviewText === void 0) return false;
	return currentPreviewText.startsWith(args.text) && args.text.length < currentPreviewText.length && (args.skipRegressive === "always" || args.hadPreviewMessage);
}
function resolvePreviewTarget(params) {
	const lanePreviewMessageId = params.lane.stream?.messageId();
	const previewMessageId = typeof params.previewMessageIdOverride === "number" ? params.previewMessageIdOverride : lanePreviewMessageId;
	const hadPreviewMessage = typeof params.previewMessageIdOverride === "number" || typeof lanePreviewMessageId === "number";
	return {
		hadPreviewMessage,
		previewMessageId: typeof previewMessageId === "number" ? previewMessageId : void 0,
		stopCreatesFirstPreview: params.stopBeforeEdit && !hadPreviewMessage && params.context === "final"
	};
}
function createLaneTextDeliverer(params) {
	const getLanePreviewText = (lane) => lane.lastPartialText;
	const markActivePreviewComplete = (laneName) => {
		params.activePreviewLifecycleByLane[laneName] = "complete";
		params.retainPreviewOnCleanupByLane[laneName] = true;
	};
	const isDraftPreviewLane = (lane) => lane.stream?.previewMode?.() === "draft";
	const canMaterializeDraftFinal = (lane, previewButtons) => {
		const hasPreviewButtons = Boolean(previewButtons && previewButtons.length > 0);
		return isDraftPreviewLane(lane) && !hasPreviewButtons && typeof lane.stream?.materialize === "function";
	};
	const tryMaterializeDraftPreviewForFinal = async (args) => {
		const stream = args.lane.stream;
		if (!stream || !isDraftPreviewLane(args.lane)) return;
		stream.update(args.text);
		const materializedMessageId = await stream.materialize?.();
		if (typeof materializedMessageId !== "number") {
			params.log(`telegram: ${args.laneName} draft preview materialize produced no message id; falling back to standard send`);
			return;
		}
		args.lane.lastPartialText = args.text;
		params.markDelivered();
		return materializedMessageId;
	};
	const tryEditPreviewMessage = async (args) => {
		try {
			await params.editPreview({
				laneName: args.laneName,
				messageId: args.messageId,
				text: args.text,
				previewButtons: args.previewButtons,
				context: args.context
			});
			if (args.updateLaneSnapshot) args.lane.lastPartialText = args.text;
			params.markDelivered();
			return "edited";
		} catch (err) {
			if (isMessageNotModifiedError(err)) {
				params.log(`telegram: ${args.laneName} preview ${args.context} edit returned "message is not modified"; treating as delivered`);
				params.markDelivered();
				return "edited";
			}
			if (args.context === "final") {
				if (args.finalTextAlreadyLanded) {
					params.log(`telegram: ${args.laneName} preview final edit failed after stop flush; keeping existing preview (${String(err)})`);
					params.markDelivered();
					return "retained";
				}
				if (isSafeToRetrySendError(err)) {
					params.log(`telegram: ${args.laneName} preview final edit failed before reaching Telegram; falling back to standard send (${String(err)})`);
					return "fallback";
				}
				if (isMissingPreviewMessageError(err)) {
					if (args.retainAlternatePreviewOnMissingTarget) {
						params.log(`telegram: ${args.laneName} preview final edit target missing; keeping alternate preview without fallback (${String(err)})`);
						params.markDelivered();
						return "retained";
					}
					params.log(`telegram: ${args.laneName} preview final edit target missing with no alternate preview; falling back to standard send (${String(err)})`);
					return "fallback";
				}
				if (isRecoverableTelegramNetworkError(err, { allowMessageMatch: true })) {
					params.log(`telegram: ${args.laneName} preview final edit may have landed despite network error; keeping existing preview (${String(err)})`);
					params.markDelivered();
					return "retained";
				}
				if (isTelegramClientRejection(err)) {
					params.log(`telegram: ${args.laneName} preview final edit rejected by Telegram (client error); falling back to standard send (${String(err)})`);
					return "fallback";
				}
				params.log(`telegram: ${args.laneName} preview final edit failed with ambiguous error; keeping existing preview to avoid duplicate (${String(err)})`);
				params.markDelivered();
				return "retained";
			}
			params.log(`telegram: ${args.laneName} preview ${args.context} edit failed; falling back to standard send (${String(err)})`);
			return "fallback";
		}
	};
	const tryUpdatePreviewForLane = async ({ lane, laneName, text, previewButtons, stopBeforeEdit = false, updateLaneSnapshot = false, skipRegressive, context, previewMessageId: previewMessageIdOverride, previewTextSnapshot }) => {
		const editPreview = (messageId, finalTextAlreadyLanded, retainAlternatePreviewOnMissingTarget) => tryEditPreviewMessage({
			laneName,
			messageId,
			text,
			context,
			previewButtons,
			updateLaneSnapshot,
			lane,
			finalTextAlreadyLanded,
			retainAlternatePreviewOnMissingTarget
		});
		const finalizePreview = (previewMessageId, finalTextAlreadyLanded, hadPreviewMessage, retainAlternatePreviewOnMissingTarget = false) => {
			if (shouldSkipRegressivePreviewUpdate({
				currentPreviewText: previewTextSnapshot ?? getLanePreviewText(lane),
				text,
				skipRegressive,
				hadPreviewMessage
			})) {
				params.markDelivered();
				return "regressive-skipped";
			}
			return editPreview(previewMessageId, finalTextAlreadyLanded, retainAlternatePreviewOnMissingTarget);
		};
		if (!lane.stream) return "fallback";
		if (resolvePreviewTarget({
			lane,
			previewMessageIdOverride,
			stopBeforeEdit,
			context
		}).stopCreatesFirstPreview) {
			lane.stream.update(text);
			await params.stopDraftLane(lane);
			const previewTargetAfterStop = resolvePreviewTarget({
				lane,
				stopBeforeEdit: false,
				context
			});
			if (typeof previewTargetAfterStop.previewMessageId !== "number") return "fallback";
			return finalizePreview(previewTargetAfterStop.previewMessageId, true, false);
		}
		if (stopBeforeEdit) await params.stopDraftLane(lane);
		const previewTargetAfterStop = resolvePreviewTarget({
			lane,
			previewMessageIdOverride,
			stopBeforeEdit: false,
			context
		});
		if (typeof previewTargetAfterStop.previewMessageId !== "number") {
			if (context === "final" && lane.hasStreamedMessage && lane.stream?.sendMayHaveLanded?.()) {
				params.log(`telegram: ${laneName} preview send may have landed despite missing message id; keeping to avoid duplicate`);
				params.markDelivered();
				return "retained";
			}
			return "fallback";
		}
		const activePreviewMessageId = lane.stream?.messageId();
		return finalizePreview(previewTargetAfterStop.previewMessageId, false, previewTargetAfterStop.hadPreviewMessage, typeof activePreviewMessageId === "number" && activePreviewMessageId !== previewTargetAfterStop.previewMessageId);
	};
	const consumeArchivedAnswerPreviewForFinal = async ({ lane, text, payload, previewButtons, canEditViaPreview }) => {
		const archivedPreview = params.archivedAnswerPreviews.shift();
		if (!archivedPreview) return;
		if (canEditViaPreview) {
			const finalized = await tryUpdatePreviewForLane({
				lane,
				laneName: "answer",
				text,
				previewButtons,
				stopBeforeEdit: false,
				skipRegressive: "existingOnly",
				context: "final",
				previewMessageId: archivedPreview.messageId,
				previewTextSnapshot: archivedPreview.textSnapshot
			});
			if (finalized === "edited") return result("preview-finalized", {
				content: text,
				messageId: archivedPreview.messageId
			});
			if (finalized === "regressive-skipped") return result("preview-finalized", {
				content: archivedPreview.textSnapshot,
				messageId: archivedPreview.messageId
			});
			if (finalized === "retained") {
				params.retainPreviewOnCleanupByLane.answer = true;
				return result("preview-retained");
			}
		}
		const delivered = await params.sendPayload(params.applyTextToPayload(payload, text));
		if (delivered || archivedPreview.deleteIfUnused !== false) try {
			await params.deletePreviewMessage(archivedPreview.messageId);
		} catch (err) {
			params.log(`telegram: archived answer preview cleanup failed (${archivedPreview.messageId}): ${String(err)}`);
		}
		return delivered ? result("sent") : result("skipped");
	};
	return async ({ laneName, text, payload, infoKind, previewButtons, allowPreviewUpdateForNonFinal = false }) => {
		const lane = params.lanes[laneName];
		const hasMedia = resolveSendableOutboundReplyParts(payload, { text }).hasMedia;
		const canEditViaPreview = !hasMedia && text.length > 0 && text.length <= params.draftMaxChars && !payload.isError;
		if (infoKind === "final") {
			if (params.activePreviewLifecycleByLane[laneName] === "transient") params.retainPreviewOnCleanupByLane[laneName] = false;
			if (laneName === "answer") {
				const archivedResult = await consumeArchivedAnswerPreviewForFinal({
					lane,
					text,
					payload,
					previewButtons,
					canEditViaPreview
				});
				if (archivedResult) return archivedResult;
			}
			if (canEditViaPreview && params.activePreviewLifecycleByLane[laneName] === "transient") {
				await params.flushDraftLane(lane);
				if (laneName === "answer") {
					const archivedResultAfterFlush = await consumeArchivedAnswerPreviewForFinal({
						lane,
						text,
						payload,
						previewButtons,
						canEditViaPreview
					});
					if (archivedResultAfterFlush) return archivedResultAfterFlush;
				}
				if (canMaterializeDraftFinal(lane, previewButtons)) {
					const materializedMessageId = await tryMaterializeDraftPreviewForFinal({
						lane,
						laneName,
						text
					});
					if (typeof materializedMessageId === "number") {
						markActivePreviewComplete(laneName);
						return result("preview-finalized", {
							content: text,
							messageId: materializedMessageId
						});
					}
				}
				const previewMessageId = lane.stream?.messageId();
				const finalized = await tryUpdatePreviewForLane({
					lane,
					laneName,
					text,
					previewButtons,
					stopBeforeEdit: true,
					skipRegressive: "existingOnly",
					context: "final"
				});
				if (finalized === "edited") {
					markActivePreviewComplete(laneName);
					return result("preview-finalized", {
						content: text,
						messageId: previewMessageId ?? lane.stream?.messageId()
					});
				}
				if (finalized === "regressive-skipped") {
					markActivePreviewComplete(laneName);
					return result("preview-finalized", {
						content: lane.lastPartialText,
						messageId: previewMessageId ?? lane.stream?.messageId()
					});
				}
				if (finalized === "retained") {
					markActivePreviewComplete(laneName);
					return result("preview-retained");
				}
			} else if (!hasMedia && !payload.isError && text.length > params.draftMaxChars) params.log(`telegram: preview final too long for edit (${text.length} > ${params.draftMaxChars}); falling back to standard send`);
			await params.stopDraftLane(lane);
			return await params.sendPayload(params.applyTextToPayload(payload, text)) ? result("sent") : result("skipped");
		}
		if (allowPreviewUpdateForNonFinal && canEditViaPreview) {
			if (isDraftPreviewLane(lane)) {
				const previewRevisionBeforeFlush = lane.stream?.previewRevision?.() ?? 0;
				lane.stream?.update(text);
				await params.flushDraftLane(lane);
				if (!((lane.stream?.previewRevision?.() ?? 0) > previewRevisionBeforeFlush)) {
					params.log(`telegram: ${laneName} draft preview update not emitted; falling back to standard send`);
					return await params.sendPayload(params.applyTextToPayload(payload, text)) ? result("sent") : result("skipped");
				}
				lane.lastPartialText = text;
				params.markDelivered();
				return result("preview-updated");
			}
			const updated = await tryUpdatePreviewForLane({
				lane,
				laneName,
				text,
				previewButtons,
				stopBeforeEdit: false,
				updateLaneSnapshot: true,
				skipRegressive: "always",
				context: "update"
			});
			if (updated === "edited" || updated === "regressive-skipped") return result("preview-updated");
		}
		return await params.sendPayload(params.applyTextToPayload(payload, text)) ? result("sent") : result("skipped");
	};
}
//#endregion
//#region extensions/telegram/src/lane-delivery-state.ts
function createLaneDeliveryStateTracker() {
	const state = {
		delivered: false,
		skippedNonSilent: 0,
		failedNonSilent: 0
	};
	return {
		markDelivered: () => {
			state.delivered = true;
		},
		markNonSilentSkip: () => {
			state.skippedNonSilent += 1;
		},
		markNonSilentFailure: () => {
			state.failedNonSilent += 1;
		},
		snapshot: () => ({ ...state })
	};
}
//#endregion
//#region extensions/telegram/src/reasoning-lane-coordinator.ts
const REASONING_MESSAGE_PREFIX = "Reasoning:\n";
const REASONING_TAG_PREFIXES = [
	"<think",
	"<thinking",
	"<thought",
	"<antthinking",
	"</think",
	"</thinking",
	"</thought",
	"</antthinking"
];
const THINKING_TAG_RE = /<\s*(\/?)\s*(?:think(?:ing)?|thought|antthinking)\b[^<>]*>/gi;
function extractThinkingFromTaggedStreamOutsideCode(text) {
	if (!text) return "";
	const codeRegions = findCodeRegions(text);
	let result = "";
	let lastIndex = 0;
	let inThinking = false;
	THINKING_TAG_RE.lastIndex = 0;
	for (const match of text.matchAll(THINKING_TAG_RE)) {
		const idx = match.index ?? 0;
		if (isInsideCode(idx, codeRegions)) continue;
		if (inThinking) result += text.slice(lastIndex, idx);
		inThinking = !(match[1] === "/");
		lastIndex = idx + match[0].length;
	}
	if (inThinking) result += text.slice(lastIndex);
	return result.trim();
}
function isPartialReasoningTagPrefix(text) {
	const trimmed = text.trimStart().toLowerCase();
	if (!trimmed.startsWith("<")) return false;
	if (trimmed.includes(">")) return false;
	return REASONING_TAG_PREFIXES.some((prefix) => prefix.startsWith(trimmed));
}
function splitTelegramReasoningText(text) {
	if (typeof text !== "string") return {};
	const trimmed = text.trim();
	if (isPartialReasoningTagPrefix(trimmed)) return {};
	if (trimmed.startsWith(REASONING_MESSAGE_PREFIX) && trimmed.length > 11) return { reasoningText: trimmed };
	const taggedReasoning = extractThinkingFromTaggedStreamOutsideCode(text);
	const strippedAnswer = stripReasoningTagsFromText(text, {
		mode: "strict",
		trim: "both"
	});
	if (!taggedReasoning && strippedAnswer === text) return { answerText: text };
	return {
		reasoningText: taggedReasoning ? formatReasoningMessage(taggedReasoning) : void 0,
		answerText: strippedAnswer || void 0
	};
}
function createTelegramReasoningStepState() {
	let reasoningStatus = "none";
	let bufferedFinalAnswer;
	const noteReasoningHint = () => {
		if (reasoningStatus === "none") reasoningStatus = "hinted";
	};
	const noteReasoningDelivered = () => {
		reasoningStatus = "delivered";
	};
	const shouldBufferFinalAnswer = () => {
		return reasoningStatus === "hinted" && !bufferedFinalAnswer;
	};
	const bufferFinalAnswer = (value) => {
		bufferedFinalAnswer = value;
	};
	const takeBufferedFinalAnswer = () => {
		const value = bufferedFinalAnswer;
		bufferedFinalAnswer = void 0;
		return value;
	};
	const resetForNextStep = () => {
		reasoningStatus = "none";
		bufferedFinalAnswer = void 0;
	};
	return {
		noteReasoningHint,
		noteReasoningDelivered,
		shouldBufferFinalAnswer,
		bufferFinalAnswer,
		takeBufferedFinalAnswer,
		resetForNextStep
	};
}
//#endregion
//#region extensions/telegram/src/bot-message-dispatch.ts
const EMPTY_RESPONSE_FALLBACK = "No response generated. Please try again.";
/** Minimum chars before sending first streaming message (improves push notification UX) */
const DRAFT_MIN_INITIAL_CHARS = 30;
async function resolveStickerVisionSupport(cfg, agentId) {
	try {
		const catalog = await loadModelCatalog({ config: cfg });
		const defaultModel = resolveDefaultModelForAgent({
			cfg,
			agentId
		});
		const entry = findModelInCatalog(catalog, defaultModel.provider, defaultModel.model);
		if (!entry) return false;
		return modelSupportsVision(entry);
	} catch {
		return false;
	}
}
function pruneStickerMediaFromContext(ctxPayload, opts) {
	if (opts?.stickerMediaIncluded === false) return;
	const nextMediaPaths = Array.isArray(ctxPayload.MediaPaths) ? ctxPayload.MediaPaths.slice(1) : void 0;
	const nextMediaUrls = Array.isArray(ctxPayload.MediaUrls) ? ctxPayload.MediaUrls.slice(1) : void 0;
	const nextMediaTypes = Array.isArray(ctxPayload.MediaTypes) ? ctxPayload.MediaTypes.slice(1) : void 0;
	ctxPayload.MediaPaths = nextMediaPaths && nextMediaPaths.length > 0 ? nextMediaPaths : void 0;
	ctxPayload.MediaUrls = nextMediaUrls && nextMediaUrls.length > 0 ? nextMediaUrls : void 0;
	ctxPayload.MediaTypes = nextMediaTypes && nextMediaTypes.length > 0 ? nextMediaTypes : void 0;
	ctxPayload.MediaPath = ctxPayload.MediaPaths?.[0];
	ctxPayload.MediaUrl = ctxPayload.MediaUrls?.[0] ?? ctxPayload.MediaPath;
	ctxPayload.MediaType = ctxPayload.MediaTypes?.[0];
}
function resolveTelegramReasoningLevel(params) {
	const { cfg, sessionKey, agentId, telegramDeps } = params;
	if (!sessionKey) return "off";
	try {
		const storePath = telegramDeps.resolveStorePath(cfg.session?.store, { agentId });
		const level = resolveSessionStoreEntry({
			store: (telegramDeps.loadSessionStore ?? loadSessionStore)(storePath, { skipCache: true }),
			sessionKey
		}).existing?.reasoningLevel;
		if (level === "on" || level === "stream") return level;
	} catch {}
	return "off";
}
const dispatchTelegramMessage = async ({ context, bot, cfg, runtime, replyToMode, streamMode, textLimit, telegramCfg, telegramDeps = defaultTelegramBotDeps, opts }) => {
	const { ctxPayload, msg, chatId, isGroup, groupConfig, topicConfig, threadSpec, historyKey, historyLimit, groupHistories, route, skillFilter, sendTyping, sendRecordVoice, ackReactionPromise, reactionApi, removeAckAfterReply, statusReactionController } = context;
	const draftMaxChars = Math.min(textLimit, 4096);
	const tableMode = resolveMarkdownTableMode({
		cfg,
		channel: "telegram",
		accountId: route.accountId
	});
	const renderDraftPreview = (text) => ({
		text: renderTelegramHtmlText(text, { tableMode }),
		parseMode: "HTML"
	});
	const accountBlockStreamingEnabled = typeof telegramCfg.blockStreaming === "boolean" ? telegramCfg.blockStreaming : cfg.agents?.defaults?.blockStreamingDefault === "on";
	const resolvedReasoningLevel = resolveTelegramReasoningLevel({
		cfg,
		sessionKey: ctxPayload.SessionKey,
		agentId: route.agentId,
		telegramDeps
	});
	const forceBlockStreamingForReasoning = resolvedReasoningLevel === "on";
	const streamReasoningDraft = resolvedReasoningLevel === "stream";
	const previewStreamingEnabled = streamMode !== "off";
	const canStreamAnswerDraft = previewStreamingEnabled && !accountBlockStreamingEnabled && !forceBlockStreamingForReasoning;
	const canStreamReasoningDraft = canStreamAnswerDraft || streamReasoningDraft;
	const draftReplyToMessageId = replyToMode !== "off" && typeof msg.message_id === "number" ? msg.message_id : void 0;
	const draftMinInitialChars = DRAFT_MIN_INITIAL_CHARS;
	const useMessagePreviewTransportForDm = threadSpec?.scope === "dm" && canStreamAnswerDraft;
	const mediaLocalRoots = getAgentScopedMediaLocalRoots(cfg, route.agentId);
	const archivedAnswerPreviews = [];
	const archivedReasoningPreviewIds = [];
	const createDraftLane = (laneName, enabled) => {
		return {
			stream: enabled ? (telegramDeps.createTelegramDraftStream ?? createTelegramDraftStream)({
				api: bot.api,
				chatId,
				maxChars: draftMaxChars,
				thread: threadSpec,
				previewTransport: useMessagePreviewTransportForDm ? "message" : "auto",
				replyToMessageId: draftReplyToMessageId,
				minInitialChars: draftMinInitialChars,
				renderText: renderDraftPreview,
				onSupersededPreview: laneName === "answer" || laneName === "reasoning" ? (preview) => {
					if (laneName === "reasoning") {
						if (!archivedReasoningPreviewIds.includes(preview.messageId)) archivedReasoningPreviewIds.push(preview.messageId);
						return;
					}
					archivedAnswerPreviews.push({
						messageId: preview.messageId,
						textSnapshot: preview.textSnapshot,
						deleteIfUnused: true
					});
				} : void 0,
				log: logVerbose,
				warn: logVerbose
			}) : void 0,
			lastPartialText: "",
			hasStreamedMessage: false
		};
	};
	const lanes = {
		answer: createDraftLane("answer", canStreamAnswerDraft),
		reasoning: createDraftLane("reasoning", canStreamReasoningDraft)
	};
	const activePreviewLifecycleByLane = {
		answer: "transient",
		reasoning: "transient"
	};
	const retainPreviewOnCleanupByLane = {
		answer: false,
		reasoning: false
	};
	const answerLane = lanes.answer;
	const reasoningLane = lanes.reasoning;
	let splitReasoningOnNextStream = false;
	let skipNextAnswerMessageStartRotation = false;
	let draftLaneEventQueue = Promise.resolve();
	const reasoningStepState = createTelegramReasoningStepState();
	const enqueueDraftLaneEvent = (task) => {
		draftLaneEventQueue = draftLaneEventQueue.then(task).catch((err) => {
			logVerbose(`telegram: draft lane callback failed: ${String(err)}`);
		});
		return draftLaneEventQueue;
	};
	const splitTextIntoLaneSegments = (text) => {
		const split = splitTelegramReasoningText(text);
		const segments = [];
		const suppressReasoning = resolvedReasoningLevel === "off";
		if (split.reasoningText && !suppressReasoning) segments.push({
			lane: "reasoning",
			text: split.reasoningText
		});
		if (split.answerText) segments.push({
			lane: "answer",
			text: split.answerText
		});
		return {
			segments,
			suppressedReasoningOnly: Boolean(split.reasoningText) && suppressReasoning && !split.answerText
		};
	};
	const resetDraftLaneState = (lane) => {
		lane.lastPartialText = "";
		lane.hasStreamedMessage = false;
	};
	const rotateAnswerLaneForNewAssistantMessage = async () => {
		let didForceNewMessage = false;
		if (answerLane.hasStreamedMessage) {
			const previewMessageId = await answerLane.stream?.materialize?.() ?? answerLane.stream?.messageId();
			if (typeof previewMessageId === "number" && activePreviewLifecycleByLane.answer === "transient") archivedAnswerPreviews.push({
				messageId: previewMessageId,
				textSnapshot: answerLane.lastPartialText,
				deleteIfUnused: false
			});
			answerLane.stream?.forceNewMessage();
			didForceNewMessage = true;
		}
		resetDraftLaneState(answerLane);
		if (didForceNewMessage) {
			activePreviewLifecycleByLane.answer = "transient";
			retainPreviewOnCleanupByLane.answer = false;
		}
		return didForceNewMessage;
	};
	const updateDraftFromPartial = (lane, text) => {
		const laneStream = lane.stream;
		if (!laneStream || !text) return;
		if (text === lane.lastPartialText) return;
		lane.hasStreamedMessage = true;
		if (lane.lastPartialText && lane.lastPartialText.startsWith(text) && text.length < lane.lastPartialText.length) return;
		lane.lastPartialText = text;
		laneStream.update(text);
	};
	const ingestDraftLaneSegments = async (text) => {
		const split = splitTextIntoLaneSegments(text);
		if (split.segments.some((segment) => segment.lane === "answer") && activePreviewLifecycleByLane.answer !== "transient") skipNextAnswerMessageStartRotation = await rotateAnswerLaneForNewAssistantMessage();
		for (const segment of split.segments) {
			if (segment.lane === "reasoning") {
				reasoningStepState.noteReasoningHint();
				reasoningStepState.noteReasoningDelivered();
			}
			updateDraftFromPartial(lanes[segment.lane], segment.text);
		}
	};
	const flushDraftLane = async (lane) => {
		if (!lane.stream) return;
		await lane.stream.flush();
	};
	const disableBlockStreaming = !previewStreamingEnabled ? true : forceBlockStreamingForReasoning ? false : typeof telegramCfg.blockStreaming === "boolean" ? !telegramCfg.blockStreaming : canStreamAnswerDraft ? true : void 0;
	const chunkMode = resolveChunkMode(cfg, "telegram", route.accountId);
	const sticker = ctxPayload.Sticker;
	if (sticker?.fileId && sticker.fileUniqueId && ctxPayload.MediaPath) {
		const agentDir = resolveAgentDir(cfg, route.agentId);
		const stickerSupportsVision = await resolveStickerVisionSupport(cfg, route.agentId);
		let description = sticker.cachedDescription ?? null;
		if (!description) description = await describeStickerImage({
			imagePath: ctxPayload.MediaPath,
			cfg,
			agentDir,
			agentId: route.agentId
		});
		if (description) {
			const stickerContext = [sticker.emoji, sticker.setName ? `from "${sticker.setName}"` : null].filter(Boolean).join(" ");
			const formattedDesc = `[Sticker${stickerContext ? ` ${stickerContext}` : ""}] ${description}`;
			sticker.cachedDescription = description;
			if (!stickerSupportsVision) {
				ctxPayload.Body = formattedDesc;
				ctxPayload.BodyForAgent = formattedDesc;
				pruneStickerMediaFromContext(ctxPayload, { stickerMediaIncluded: ctxPayload.StickerMediaIncluded });
			}
			if (sticker.fileId) {
				cacheSticker({
					fileId: sticker.fileId,
					fileUniqueId: sticker.fileUniqueId,
					emoji: sticker.emoji,
					setName: sticker.setName,
					description,
					cachedAt: (/* @__PURE__ */ new Date()).toISOString(),
					receivedFrom: ctxPayload.From
				});
				logVerbose(`telegram: cached sticker description for ${sticker.fileUniqueId}`);
			} else logVerbose(`telegram: skipped sticker cache (missing fileId)`);
		}
	}
	const replyQuoteText = ctxPayload.ReplyToIsQuote && ctxPayload.ReplyToBody ? ctxPayload.ReplyToBody.trim() || void 0 : void 0;
	const deliveryState = createLaneDeliveryStateTracker();
	const clearGroupHistory = () => {
		if (isGroup && historyKey) clearHistoryEntriesIfEnabled({
			historyMap: groupHistories,
			historyKey,
			limit: historyLimit
		});
	};
	const deliveryBaseOptions = {
		chatId: String(chatId),
		accountId: route.accountId,
		sessionKeyForInternalHooks: ctxPayload.SessionKey,
		mirrorIsGroup: isGroup,
		mirrorGroupId: isGroup ? String(chatId) : void 0,
		token: opts.token,
		runtime,
		bot,
		mediaLocalRoots,
		replyToMode,
		textLimit,
		thread: threadSpec,
		tableMode,
		chunkMode,
		linkPreview: telegramCfg.linkPreview,
		replyQuoteText
	};
	const silentErrorReplies = telegramCfg.silentErrorReplies === true;
	const applyTextToPayload = (payload, text) => {
		if (payload.text === text) return payload;
		return {
			...payload,
			text
		};
	};
	const sendPayload = async (payload) => {
		const result = await (telegramDeps.deliverReplies ?? deliverReplies)({
			...deliveryBaseOptions,
			replies: [payload],
			onVoiceRecording: sendRecordVoice,
			silent: silentErrorReplies && payload.isError === true,
			mediaLoader: telegramDeps.loadWebMedia
		});
		if (result.delivered) deliveryState.markDelivered();
		return result.delivered;
	};
	const emitPreviewFinalizedHook = (result) => {
		if (result.kind !== "preview-finalized") return;
		(telegramDeps.emitInternalMessageSentHook ?? emitInternalMessageSentHook)({
			sessionKeyForInternalHooks: deliveryBaseOptions.sessionKeyForInternalHooks,
			chatId: deliveryBaseOptions.chatId,
			accountId: deliveryBaseOptions.accountId,
			content: result.delivery.content,
			success: true,
			messageId: result.delivery.messageId,
			isGroup: deliveryBaseOptions.mirrorIsGroup,
			groupId: deliveryBaseOptions.mirrorGroupId
		});
	};
	const deliverLaneText = createLaneTextDeliverer({
		lanes,
		archivedAnswerPreviews,
		activePreviewLifecycleByLane,
		retainPreviewOnCleanupByLane,
		draftMaxChars,
		applyTextToPayload,
		sendPayload,
		flushDraftLane,
		stopDraftLane: async (lane) => {
			await lane.stream?.stop();
		},
		editPreview: async ({ messageId, text, previewButtons }) => {
			await (telegramDeps.editMessageTelegram ?? editMessageTelegram)(chatId, messageId, text, {
				api: bot.api,
				cfg,
				accountId: route.accountId,
				linkPreview: telegramCfg.linkPreview,
				buttons: previewButtons
			});
		},
		deletePreviewMessage: async (messageId) => {
			await bot.api.deleteMessage(chatId, messageId);
		},
		log: logVerbose,
		markDelivered: () => {
			deliveryState.markDelivered();
		}
	});
	let queuedFinal = false;
	let hadErrorReplyFailureOrSkip = false;
	const isDmTopic = !isGroup && threadSpec.scope === "dm" && threadSpec.id != null;
	let isFirstTurnInSession = false;
	if (isDmTopic) try {
		const storePath = telegramDeps.resolveStorePath(cfg.session?.store, { agentId: route.agentId });
		const store = (telegramDeps.loadSessionStore ?? loadSessionStore)(storePath, { skipCache: true });
		const sessionKey = ctxPayload.SessionKey;
		if (sessionKey) isFirstTurnInSession = !resolveSessionStoreEntry({
			store,
			sessionKey
		}).existing?.systemSent;
		else logVerbose("auto-topic-label: SessionKey is absent, skipping first-turn detection");
	} catch (err) {
		logVerbose(`auto-topic-label: session store error: ${err instanceof Error ? err.message : String(err)}`);
	}
	if (statusReactionController) statusReactionController.setThinking();
	const { onModelSelected, ...replyPipeline } = (telegramDeps.createChannelReplyPipeline ?? createChannelReplyPipeline)({
		cfg,
		agentId: route.agentId,
		channel: "telegram",
		accountId: route.accountId,
		typing: {
			start: sendTyping,
			onStartError: (err) => {
				logTypingFailure({
					log: logVerbose,
					channel: "telegram",
					target: String(chatId),
					error: err
				});
			}
		}
	});
	let dispatchError;
	try {
		({queuedFinal} = await telegramDeps.dispatchReplyWithBufferedBlockDispatcher({
			ctx: ctxPayload,
			cfg,
			dispatcherOptions: {
				...replyPipeline,
				deliver: async (payload, info) => {
					if (payload.isError === true) hadErrorReplyFailureOrSkip = true;
					if (info.kind === "final") await enqueueDraftLaneEvent(async () => {});
					if (shouldSuppressLocalTelegramExecApprovalPrompt({
						cfg,
						accountId: route.accountId,
						payload
					})) {
						queuedFinal = true;
						return;
					}
					const previewButtons = (payload.channelData?.telegram)?.buttons;
					const split = splitTextIntoLaneSegments(payload.text);
					const segments = split.segments;
					const reply = resolveSendableOutboundReplyParts(payload);
					reply.hasMedia;
					const flushBufferedFinalAnswer = async () => {
						const buffered = reasoningStepState.takeBufferedFinalAnswer();
						if (!buffered) return;
						const bufferedButtons = (buffered.payload.channelData?.telegram)?.buttons;
						await deliverLaneText({
							laneName: "answer",
							text: buffered.text,
							payload: buffered.payload,
							infoKind: "final",
							previewButtons: bufferedButtons
						});
						reasoningStepState.resetForNextStep();
					};
					for (const segment of segments) {
						if (segment.lane === "answer" && info.kind === "final" && reasoningStepState.shouldBufferFinalAnswer()) {
							reasoningStepState.bufferFinalAnswer({
								payload,
								text: segment.text
							});
							continue;
						}
						if (segment.lane === "reasoning") reasoningStepState.noteReasoningHint();
						const result = await deliverLaneText({
							laneName: segment.lane,
							text: segment.text,
							payload,
							infoKind: info.kind,
							previewButtons,
							allowPreviewUpdateForNonFinal: segment.lane === "reasoning"
						});
						if (info.kind === "final") emitPreviewFinalizedHook(result);
						if (segment.lane === "reasoning") {
							if (result.kind !== "skipped") {
								reasoningStepState.noteReasoningDelivered();
								await flushBufferedFinalAnswer();
							}
							continue;
						}
						if (info.kind === "final") {
							if (reasoningLane.hasStreamedMessage) {
								activePreviewLifecycleByLane.reasoning = "complete";
								retainPreviewOnCleanupByLane.reasoning = true;
							}
							reasoningStepState.resetForNextStep();
						}
					}
					if (segments.length > 0) return;
					if (split.suppressedReasoningOnly) {
						if (reply.hasMedia) await sendPayload(typeof payload.text === "string" ? {
							...payload,
							text: ""
						} : payload);
						if (info.kind === "final") await flushBufferedFinalAnswer();
						return;
					}
					if (info.kind === "final") {
						await answerLane.stream?.stop();
						await reasoningLane.stream?.stop();
						reasoningStepState.resetForNextStep();
					}
					if (!(reply.hasMedia || reply.text.length > 0)) {
						if (info.kind === "final") await flushBufferedFinalAnswer();
						return;
					}
					await sendPayload(payload);
					if (info.kind === "final") await flushBufferedFinalAnswer();
				},
				onSkip: (payload, info) => {
					if (payload.isError === true) hadErrorReplyFailureOrSkip = true;
					if (info.reason !== "silent") deliveryState.markNonSilentSkip();
				},
				onError: (err, info) => {
					const errorPolicy = resolveTelegramErrorPolicy({
						accountConfig: telegramCfg,
						groupConfig,
						topicConfig
					});
					if (isSilentErrorPolicy(errorPolicy.policy)) return;
					if (errorPolicy.policy === "once" && shouldSuppressTelegramError({
						scopeKey: buildTelegramErrorScopeKey({
							accountId: route.accountId,
							chatId,
							threadId: threadSpec.id
						}),
						cooldownMs: errorPolicy.cooldownMs,
						errorMessage: String(err)
					})) return;
					deliveryState.markNonSilentFailure();
					runtime.error?.(danger(`telegram ${info.kind} reply failed: ${String(err)}`));
				}
			},
			replyOptions: {
				skillFilter,
				disableBlockStreaming,
				onPartialReply: answerLane.stream || reasoningLane.stream ? (payload) => enqueueDraftLaneEvent(async () => {
					await ingestDraftLaneSegments(payload.text);
				}) : void 0,
				onReasoningStream: reasoningLane.stream ? (payload) => enqueueDraftLaneEvent(async () => {
					if (splitReasoningOnNextStream) {
						reasoningLane.stream?.forceNewMessage();
						resetDraftLaneState(reasoningLane);
						splitReasoningOnNextStream = false;
					}
					await ingestDraftLaneSegments(payload.text);
				}) : void 0,
				onAssistantMessageStart: answerLane.stream ? () => enqueueDraftLaneEvent(async () => {
					reasoningStepState.resetForNextStep();
					if (skipNextAnswerMessageStartRotation) {
						skipNextAnswerMessageStartRotation = false;
						activePreviewLifecycleByLane.answer = "transient";
						retainPreviewOnCleanupByLane.answer = false;
						return;
					}
					await rotateAnswerLaneForNewAssistantMessage();
					activePreviewLifecycleByLane.answer = "transient";
					retainPreviewOnCleanupByLane.answer = false;
				}) : void 0,
				onReasoningEnd: reasoningLane.stream ? () => enqueueDraftLaneEvent(async () => {
					splitReasoningOnNextStream = reasoningLane.hasStreamedMessage;
				}) : void 0,
				onToolStart: statusReactionController ? async (payload) => {
					await statusReactionController.setTool(payload.name);
				} : void 0,
				onCompactionStart: statusReactionController ? () => statusReactionController.setCompacting() : void 0,
				onCompactionEnd: statusReactionController ? async () => {
					statusReactionController.cancelPending();
					await statusReactionController.setThinking();
				} : void 0,
				onModelSelected
			}
		}));
	} catch (err) {
		dispatchError = err;
		runtime.error?.(danger(`telegram dispatch failed: ${String(err)}`));
	} finally {
		await draftLaneEventQueue;
		const streamCleanupStates = /* @__PURE__ */ new Map();
		const lanesToCleanup = [{
			laneName: "answer",
			lane: answerLane
		}, {
			laneName: "reasoning",
			lane: reasoningLane
		}];
		for (const laneState of lanesToCleanup) {
			const stream = laneState.lane.stream;
			if (!stream) continue;
			const activePreviewMessageId = stream.messageId();
			const hasBoundaryFinalizedActivePreview = laneState.laneName === "answer" && typeof activePreviewMessageId === "number" && archivedAnswerPreviews.some((p) => p.deleteIfUnused === false && p.messageId === activePreviewMessageId);
			const shouldClear = !retainPreviewOnCleanupByLane[laneState.laneName] && !hasBoundaryFinalizedActivePreview;
			const existing = streamCleanupStates.get(stream);
			if (!existing) {
				streamCleanupStates.set(stream, { shouldClear });
				continue;
			}
			existing.shouldClear = existing.shouldClear && shouldClear;
		}
		for (const [stream, cleanupState] of streamCleanupStates) {
			await stream.stop();
			if (cleanupState.shouldClear) await stream.clear();
		}
		for (const archivedPreview of archivedAnswerPreviews) {
			if (archivedPreview.deleteIfUnused === false) continue;
			try {
				await bot.api.deleteMessage(chatId, archivedPreview.messageId);
			} catch (err) {
				logVerbose(`telegram: archived answer preview cleanup failed (${archivedPreview.messageId}): ${String(err)}`);
			}
		}
		for (const messageId of archivedReasoningPreviewIds) try {
			await bot.api.deleteMessage(chatId, messageId);
		} catch (err) {
			logVerbose(`telegram: archived reasoning preview cleanup failed (${messageId}): ${String(err)}`);
		}
	}
	let sentFallback = false;
	const deliverySummary = deliveryState.snapshot();
	if (dispatchError || !deliverySummary.delivered && (deliverySummary.skippedNonSilent > 0 || deliverySummary.failedNonSilent > 0)) {
		const fallbackText = dispatchError ? "Something went wrong while processing your request. Please try again." : EMPTY_RESPONSE_FALLBACK;
		sentFallback = (await (telegramDeps.deliverReplies ?? deliverReplies)({
			replies: [{ text: fallbackText }],
			...deliveryBaseOptions,
			silent: silentErrorReplies && (dispatchError != null || hadErrorReplyFailureOrSkip),
			mediaLoader: telegramDeps.loadWebMedia
		})).delivered;
	}
	const hasFinalResponse = queuedFinal || sentFallback;
	if (statusReactionController && !hasFinalResponse) statusReactionController.setError().catch((err) => {
		logVerbose(`telegram: status reaction error finalize failed: ${String(err)}`);
	});
	if (!hasFinalResponse) {
		clearGroupHistory();
		return;
	}
	if (isDmTopic && isFirstTurnInSession) {
		const userMessage = (ctxPayload.RawBody ?? ctxPayload.Body ?? "").slice(0, 500);
		if (userMessage.trim()) {
			const agentDir = resolveAgentDir(cfg, route.agentId);
			const directAutoTopicLabel = (!isGroup ? groupConfig : void 0)?.autoTopicLabel;
			const accountAutoTopicLabel = telegramCfg?.autoTopicLabel;
			const autoTopicConfig = resolveAutoTopicLabelConfig(directAutoTopicLabel, accountAutoTopicLabel);
			if (autoTopicConfig) {
				const topicThreadId = threadSpec.id;
				(async () => {
					try {
						const label = await generateTopicLabel({
							userMessage,
							prompt: autoTopicConfig.prompt,
							cfg,
							agentId: route.agentId,
							agentDir
						});
						if (!label) {
							logVerbose("auto-topic-label: LLM returned empty label");
							return;
						}
						logVerbose(`auto-topic-label: generated label (len=${label.length})`);
						await bot.api.editForumTopic(chatId, topicThreadId, { name: label });
						logVerbose(`auto-topic-label: renamed topic ${chatId}/${topicThreadId}`);
					} catch (err) {
						logVerbose(`auto-topic-label: failed: ${err instanceof Error ? err.message : String(err)}`);
					}
				})();
			}
		}
	}
	if (statusReactionController) statusReactionController.setDone().catch((err) => {
		logVerbose(`telegram: status reaction finalize failed: ${String(err)}`);
	});
	else removeAckReactionAfterReply({
		removeAfterReply: removeAckAfterReply,
		ackReactionPromise,
		ackReactionValue: ackReactionPromise ? "ack" : null,
		remove: () => (reactionApi?.(chatId, msg.message_id ?? 0, []) ?? Promise.resolve()).then(() => {}),
		onError: (err) => {
			if (!msg.message_id) return;
			logAckFailure({
				log: logVerbose,
				channel: "telegram",
				target: `${chatId}/${msg.message_id}`,
				error: err
			});
		}
	});
	clearGroupHistory();
};
//#endregion
//#region extensions/telegram/src/bot-message.ts
const createTelegramMessageProcessor = (deps) => {
	const { bot, cfg, account, telegramCfg, historyLimit, groupHistories, dmPolicy, allowFrom, groupAllowFrom, ackReactionScope, logger, resolveGroupActivation, resolveGroupRequireMention, resolveTelegramGroupConfig, loadFreshConfig, sendChatActionHandler, runtime, replyToMode, streamMode, textLimit, telegramDeps, opts } = deps;
	return async (primaryCtx, allMedia, storeAllowFrom, options, replyMedia) => {
		const ingressReceivedAtMs = typeof options?.receivedAtMs === "number" && Number.isFinite(options.receivedAtMs) ? options.receivedAtMs : void 0;
		const ingressDebugEnabled = shouldLogVerbose() || process.env.OPENCLAW_DEBUG_TELEGRAM_INGRESS === "1";
		const ingressContextStartMs = ingressReceivedAtMs ? Date.now() : void 0;
		const context = await buildTelegramMessageContext({
			primaryCtx,
			allMedia,
			replyMedia,
			storeAllowFrom,
			options,
			bot,
			cfg,
			account,
			historyLimit,
			groupHistories,
			dmPolicy,
			allowFrom,
			groupAllowFrom,
			ackReactionScope,
			logger,
			resolveGroupActivation,
			resolveGroupRequireMention,
			resolveTelegramGroupConfig,
			sendChatActionHandler,
			loadFreshConfig,
			upsertPairingRequest: telegramDeps.upsertChannelPairingRequest
		});
		if (!context) {
			if (ingressDebugEnabled && ingressReceivedAtMs && ingressContextStartMs) logVerbose(`telegram ingress: chatId=${primaryCtx.message.chat.id} dropped after ${Date.now() - ingressReceivedAtMs}ms${options?.ingressBuffer ? ` buffer=${options.ingressBuffer}` : ""}`);
			return;
		}
		if (ingressDebugEnabled && ingressReceivedAtMs && ingressContextStartMs) logVerbose(`telegram ingress: chatId=${context.chatId} contextReadyMs=${Date.now() - ingressReceivedAtMs} preDispatchMs=${Date.now() - ingressContextStartMs}${options?.ingressBuffer ? ` buffer=${options.ingressBuffer}` : ""}`);
		try {
			await dispatchTelegramMessage({
				context,
				bot,
				cfg,
				runtime,
				replyToMode,
				streamMode,
				textLimit,
				telegramCfg,
				telegramDeps,
				opts
			});
			if (ingressDebugEnabled && ingressReceivedAtMs) logVerbose(`telegram ingress: chatId=${context.chatId} dispatchCompleteMs=${Date.now() - ingressReceivedAtMs}${options?.ingressBuffer ? ` buffer=${options.ingressBuffer}` : ""}`);
		} catch (err) {
			runtime.error?.(danger(`telegram message processing failed: ${String(err)}`));
			try {
				await bot.api.sendMessage(context.chatId, "Something went wrong while processing your request. Please try again.", buildTelegramThreadParams(context.threadSpec));
			} catch {}
		}
	};
};
//#endregion
//#region extensions/telegram/src/sendchataction-401-backoff.ts
const BACKOFF_POLICY = {
	initialMs: 1e3,
	maxMs: 3e5,
	factor: 2,
	jitter: .1
};
function is401Error(error) {
	if (!error) return false;
	const message = error instanceof Error ? error.message : JSON.stringify(error);
	return message.includes("401") || message.toLowerCase().includes("unauthorized");
}
/**
* Creates a GLOBAL (per-account) handler for sendChatAction that tracks 401 errors
* across all message contexts. This prevents the infinite loop that caused Telegram
* to delete bots (issue #27092).
*
* When a 401 occurs, exponential backoff is applied (1s → 2s → 4s → ... → 5min).
* After maxConsecutive401 failures (default 10), all sendChatAction calls are
* suspended until reset() is called.
*/
function createTelegramSendChatActionHandler({ sendChatActionFn, logger, maxConsecutive401 = 10 }) {
	let consecutive401Failures = 0;
	let suspended = false;
	const reset = () => {
		consecutive401Failures = 0;
		suspended = false;
	};
	const sendChatAction = async (chatId, action, threadParams) => {
		if (suspended) return;
		if (consecutive401Failures > 0) {
			const backoffMs = computeBackoff(BACKOFF_POLICY, consecutive401Failures);
			logger(`sendChatAction backoff: waiting ${backoffMs}ms before retry (failure ${consecutive401Failures}/${maxConsecutive401})`);
			await sleepWithAbort(backoffMs);
		}
		try {
			await sendChatActionFn(chatId, action, threadParams);
			if (consecutive401Failures > 0) {
				logger(`sendChatAction recovered after ${consecutive401Failures} consecutive 401 failures`);
				consecutive401Failures = 0;
			}
		} catch (error) {
			if (is401Error(error)) {
				consecutive401Failures++;
				if (consecutive401Failures >= maxConsecutive401) {
					suspended = true;
					logger(`CRITICAL: sendChatAction suspended after ${consecutive401Failures} consecutive 401 errors. Bot token is likely invalid. Telegram may DELETE the bot if requests continue. Replace the token and restart: openclaw channels restart telegram`);
				} else logger(`sendChatAction 401 error (${consecutive401Failures}/${maxConsecutive401}). Retrying with exponential backoff.`);
			}
			throw error;
		}
	};
	return {
		sendChatAction,
		isSuspended: () => suspended,
		reset
	};
}
//#endregion
//#region extensions/telegram/src/sequential-key.ts
function getTelegramSequentialKey(ctx) {
	const reaction = ctx.update?.message_reaction;
	if (reaction?.chat?.id) return `telegram:${reaction.chat.id}`;
	const msg = ctx.message ?? ctx.channelPost ?? ctx.editedChannelPost ?? ctx.update?.message ?? ctx.update?.edited_message ?? ctx.update?.channel_post ?? ctx.update?.edited_channel_post ?? ctx.update?.callback_query?.message;
	const chatId = msg?.chat?.id ?? ctx.chat?.id;
	const rawText = msg?.text ?? msg?.caption;
	const botUsername = ctx.me?.username;
	if (isAbortRequestText(rawText, botUsername ? { botUsername } : void 0)) {
		if (typeof chatId === "number") return `telegram:${chatId}:control`;
		return "telegram:control";
	}
	if (isBtwRequestText(rawText, botUsername ? { botUsername } : void 0)) {
		const messageId = msg?.message_id;
		if (typeof chatId === "number" && typeof messageId === "number") return `telegram:${chatId}:btw:${messageId}`;
		if (typeof chatId === "number") return `telegram:${chatId}:btw`;
		return "telegram:btw";
	}
	const isGroup = msg?.chat?.type === "group" || msg?.chat?.type === "supergroup";
	const messageThreadId = msg?.message_thread_id;
	const isForum = msg?.chat?.is_forum;
	const threadId = isGroup ? resolveTelegramForumThreadId({
		isForum,
		messageThreadId
	}) : messageThreadId;
	if (typeof chatId === "number") return threadId != null ? `telegram:${chatId}:topic:${threadId}` : `telegram:${chatId}`;
	return "telegram:unknown";
}
//#endregion
//#region extensions/telegram/src/bot.ts
const DEFAULT_TELEGRAM_BOT_RUNTIME = {
	Bot: Bot$1,
	sequentialize,
	apiThrottler
};
const TELEGRAM_GET_UPDATES_REQUEST_TIMEOUT_MS = 45e3;
let telegramBotRuntimeForTest;
function asTelegramClientFetch(fetchImpl) {
	return fetchImpl;
}
function asTelegramCompatFetch(fetchImpl) {
	return fetchImpl;
}
function readRequestUrl(input) {
	if (typeof input === "string") return input;
	if (input instanceof URL) return input.toString();
	if (input instanceof Request) return input.url;
	return null;
}
function extractTelegramApiMethod(input) {
	const url = readRequestUrl(input);
	if (!url) return null;
	try {
		const segments = new URL(url).pathname.split("/").filter(Boolean);
		return (segments.length > 0 ? segments.at(-1) ?? null : null)?.toLowerCase() ?? null;
	} catch {
		return null;
	}
}
function createTelegramBot(opts) {
	const botRuntime = telegramBotRuntimeForTest ?? DEFAULT_TELEGRAM_BOT_RUNTIME;
	const runtime = opts.runtime ?? createNonExitingRuntime();
	const telegramDeps = opts.telegramDeps ?? defaultTelegramBotDeps;
	const cfg = opts.config ?? telegramDeps.loadConfig();
	const account = resolveTelegramAccount({
		cfg,
		accountId: opts.accountId
	});
	const threadBindingManager = resolveThreadBindingSpawnPolicy({
		cfg,
		channel: "telegram",
		accountId: account.accountId,
		kind: "subagent"
	}).enabled ? createTelegramThreadBindingManager({
		accountId: account.accountId,
		idleTimeoutMs: resolveThreadBindingIdleTimeoutMsForChannel({
			cfg,
			channel: "telegram",
			accountId: account.accountId
		}),
		maxAgeMs: resolveThreadBindingMaxAgeMsForChannel({
			cfg,
			channel: "telegram",
			accountId: account.accountId
		})
	}) : null;
	const telegramCfg = account.config;
	const telegramTransport = opts.telegramTransport ?? resolveTelegramTransport(opts.proxyFetch, { network: telegramCfg.network });
	const shouldProvideFetch = Boolean(telegramTransport.fetch);
	const fetchForClient = telegramTransport.fetch ? asTelegramCompatFetch(asTelegramClientFetch(telegramTransport.fetch)) : void 0;
	let finalFetch = shouldProvideFetch ? fetchForClient : void 0;
	if (finalFetch || opts.fetchAbortSignal) {
		const callFetch = finalFetch ?? asTelegramCompatFetch(asTelegramClientFetch(globalThis.fetch));
		finalFetch = (input, init) => {
			const controller = new AbortController();
			const abortWith = (signal) => controller.abort(signal.reason);
			const shutdownSignal = opts.fetchAbortSignal;
			const onShutdown = () => {
				if (shutdownSignal) abortWith(shutdownSignal);
			};
			const method = extractTelegramApiMethod(input);
			const requestTimeoutMs = method === "getupdates" ? TELEGRAM_GET_UPDATES_REQUEST_TIMEOUT_MS : void 0;
			let requestTimeout;
			let onRequestAbort;
			const requestSignal = init?.signal;
			if (shutdownSignal?.aborted) abortWith(shutdownSignal);
			else if (shutdownSignal) shutdownSignal.addEventListener("abort", onShutdown, { once: true });
			if (requestSignal) if (requestSignal.aborted) abortWith(requestSignal);
			else {
				onRequestAbort = () => abortWith(requestSignal);
				requestSignal.addEventListener("abort", onRequestAbort);
			}
			if (requestTimeoutMs) {
				requestTimeout = setTimeout(() => {
					controller.abort(/* @__PURE__ */ new Error(`Telegram ${method} timed out after ${requestTimeoutMs}ms`));
				}, requestTimeoutMs);
				requestTimeout.unref?.();
			}
			return callFetch(input, {
				...init,
				signal: controller.signal
			}).finally(() => {
				if (requestTimeout) clearTimeout(requestTimeout);
				shutdownSignal?.removeEventListener("abort", onShutdown);
				if (requestSignal && onRequestAbort) requestSignal.removeEventListener("abort", onRequestAbort);
			});
		};
	}
	if (finalFetch) {
		const baseFetch = finalFetch;
		finalFetch = (input, init) => {
			return Promise.resolve(baseFetch(input, init)).catch((err) => {
				try {
					tagTelegramNetworkError(err, {
						method: extractTelegramApiMethod(input),
						url: readRequestUrl(input)
					});
				} catch {}
				throw err;
			});
		};
	}
	const timeoutSeconds = typeof telegramCfg?.timeoutSeconds === "number" && Number.isFinite(telegramCfg.timeoutSeconds) ? Math.max(1, Math.floor(telegramCfg.timeoutSeconds)) : void 0;
	const apiRoot = telegramCfg.apiRoot?.trim() || void 0;
	const client = finalFetch || timeoutSeconds || apiRoot ? {
		...finalFetch ? { fetch: asTelegramClientFetch(finalFetch) } : {},
		...timeoutSeconds ? { timeoutSeconds } : {},
		...apiRoot ? { apiRoot } : {}
	} : void 0;
	const bot = new botRuntime.Bot(opts.token, client ? { client } : void 0);
	bot.api.config.use(botRuntime.apiThrottler());
	bot.catch((err) => {
		runtime.error?.(danger(`telegram bot error: ${formatUncaughtError(err)}`));
	});
	const recentUpdates = createTelegramUpdateDedupe();
	const initialUpdateId = typeof opts.updateOffset?.lastUpdateId === "number" ? opts.updateOffset.lastUpdateId : null;
	const pendingUpdateIds = /* @__PURE__ */ new Set();
	let highestCompletedUpdateId = initialUpdateId;
	let highestPersistedUpdateId = initialUpdateId;
	const maybePersistSafeWatermark = () => {
		if (typeof opts.updateOffset?.onUpdateId !== "function") return;
		if (highestCompletedUpdateId === null) return;
		let safe = highestCompletedUpdateId;
		if (pendingUpdateIds.size > 0) {
			let minPending = null;
			for (const id of pendingUpdateIds) if (minPending === null || id < minPending) minPending = id;
			if (minPending !== null) safe = Math.min(safe, minPending - 1);
		}
		if (highestPersistedUpdateId !== null && safe <= highestPersistedUpdateId) return;
		highestPersistedUpdateId = safe;
		opts.updateOffset.onUpdateId(safe);
	};
	const shouldSkipUpdate = (ctx) => {
		const updateId = resolveTelegramUpdateId(ctx);
		const skipCutoff = highestPersistedUpdateId ?? initialUpdateId;
		if (typeof updateId === "number" && skipCutoff !== null && updateId <= skipCutoff) return true;
		const key = buildTelegramUpdateKey(ctx);
		const skipped = recentUpdates.check(key);
		if (skipped && key && shouldLogVerbose()) logVerbose(`telegram dedupe: skipped ${key}`);
		return skipped;
	};
	bot.use(async (ctx, next) => {
		const updateId = resolveTelegramUpdateId(ctx);
		if (typeof updateId === "number") pendingUpdateIds.add(updateId);
		try {
			await next();
		} finally {
			if (typeof updateId === "number") {
				pendingUpdateIds.delete(updateId);
				if (highestCompletedUpdateId === null || updateId > highestCompletedUpdateId) highestCompletedUpdateId = updateId;
				maybePersistSafeWatermark();
			}
		}
	});
	bot.use(botRuntime.sequentialize(getTelegramSequentialKey));
	const rawUpdateLogger = createSubsystemLogger("gateway/channels/telegram/raw-update");
	const MAX_RAW_UPDATE_CHARS = 8e3;
	const MAX_RAW_UPDATE_STRING = 500;
	const MAX_RAW_UPDATE_ARRAY = 20;
	const stringifyUpdate = (update) => {
		const seen = /* @__PURE__ */ new WeakSet();
		return JSON.stringify(update ?? null, (key, value) => {
			if (typeof value === "string" && value.length > MAX_RAW_UPDATE_STRING) return `${value.slice(0, MAX_RAW_UPDATE_STRING)}...`;
			if (Array.isArray(value) && value.length > MAX_RAW_UPDATE_ARRAY) return [...value.slice(0, MAX_RAW_UPDATE_ARRAY), `...(${value.length - MAX_RAW_UPDATE_ARRAY} more)`];
			if (value && typeof value === "object") {
				if (seen.has(value)) return "[Circular]";
				seen.add(value);
			}
			return value;
		});
	};
	bot.use(async (ctx, next) => {
		if (shouldLogVerbose()) try {
			const raw = stringifyUpdate(ctx.update);
			const preview = raw.length > MAX_RAW_UPDATE_CHARS ? `${raw.slice(0, MAX_RAW_UPDATE_CHARS)}...` : raw;
			rawUpdateLogger.debug(`telegram update: ${preview}`);
		} catch (err) {
			rawUpdateLogger.debug(`telegram update log failed: ${String(err)}`);
		}
		await next();
	});
	const historyLimit = Math.max(0, telegramCfg.historyLimit ?? cfg.messages?.groupChat?.historyLimit ?? 50);
	const groupHistories = /* @__PURE__ */ new Map();
	const textLimit = resolveTextChunkLimit(cfg, "telegram", account.accountId);
	const dmPolicy = telegramCfg.dmPolicy ?? "pairing";
	const allowFrom = opts.allowFrom ?? telegramCfg.allowFrom;
	const groupAllowFrom = opts.groupAllowFrom ?? telegramCfg.groupAllowFrom ?? telegramCfg.allowFrom ?? allowFrom;
	const replyToMode = opts.replyToMode ?? telegramCfg.replyToMode ?? "off";
	const nativeEnabled = resolveNativeCommandsEnabled({
		providerId: "telegram",
		providerSetting: telegramCfg.commands?.native,
		globalSetting: cfg.commands?.native
	});
	const nativeSkillsEnabled = resolveNativeSkillsEnabled({
		providerId: "telegram",
		providerSetting: telegramCfg.commands?.nativeSkills,
		globalSetting: cfg.commands?.nativeSkills
	});
	const nativeDisabledExplicit = isNativeCommandsExplicitlyDisabled({
		providerSetting: telegramCfg.commands?.native,
		globalSetting: cfg.commands?.native
	});
	const useAccessGroups = cfg.commands?.useAccessGroups !== false;
	const ackReactionScope = cfg.messages?.ackReactionScope ?? "group-mentions";
	const mediaMaxBytes = (opts.mediaMaxMb ?? telegramCfg.mediaMaxMb ?? 100) * 1024 * 1024;
	const logger = getChildLogger({ module: "telegram-auto-reply" });
	const streamMode = resolveTelegramStreamMode(telegramCfg);
	const resolveGroupPolicy = (chatId) => resolveChannelGroupPolicy({
		cfg,
		channel: "telegram",
		accountId: account.accountId,
		groupId: String(chatId)
	});
	const resolveGroupActivation = (params) => {
		const agentId = params.agentId ?? resolveDefaultAgentId(cfg);
		const sessionKey = params.sessionKey ?? `agent:${agentId}:telegram:group:${buildTelegramGroupPeerId(params.chatId, params.messageThreadId)}`;
		const storePath = resolveStorePath(cfg.session?.store, { agentId });
		try {
			const entry = (telegramDeps.loadSessionStore ?? loadSessionStore)(storePath)[sessionKey];
			if (entry?.groupActivation === "always") return false;
			if (entry?.groupActivation === "mention") return true;
		} catch (err) {
			logVerbose(`Failed to load session for activation check: ${String(err)}`);
		}
	};
	const resolveGroupRequireMention = (chatId) => resolveChannelGroupRequireMention({
		cfg,
		channel: "telegram",
		accountId: account.accountId,
		groupId: String(chatId),
		requireMentionOverride: opts.requireMention,
		overrideOrder: "after-config"
	});
	const loadFreshTelegramAccountConfig = () => {
		try {
			return resolveTelegramAccount({
				cfg: telegramDeps.loadConfig(),
				accountId: account.accountId
			}).config;
		} catch (error) {
			logVerbose(`telegram: failed to load fresh config for account ${account.accountId}; using startup snapshot: ${String(error)}`);
			return telegramCfg;
		}
	};
	const resolveTelegramGroupConfig = (chatId, messageThreadId) => {
		const freshTelegramCfg = loadFreshTelegramAccountConfig();
		const groups = freshTelegramCfg.groups;
		const direct = freshTelegramCfg.direct;
		const chatIdStr = String(chatId);
		if (!chatIdStr.startsWith("-")) {
			const directConfig = direct?.[chatIdStr] ?? direct?.["*"];
			if (directConfig) return {
				groupConfig: directConfig,
				topicConfig: messageThreadId != null ? directConfig.topics?.[String(messageThreadId)] : void 0
			};
			return {
				groupConfig: void 0,
				topicConfig: void 0
			};
		}
		if (!groups) return {
			groupConfig: void 0,
			topicConfig: void 0
		};
		const groupConfig = groups[chatIdStr] ?? groups["*"];
		return {
			groupConfig,
			topicConfig: messageThreadId != null ? groupConfig?.topics?.[String(messageThreadId)] : void 0
		};
	};
	const processMessage = createTelegramMessageProcessor({
		bot,
		cfg,
		account,
		telegramCfg,
		historyLimit,
		groupHistories,
		dmPolicy,
		allowFrom,
		groupAllowFrom,
		ackReactionScope,
		logger,
		resolveGroupActivation,
		resolveGroupRequireMention,
		resolveTelegramGroupConfig,
		loadFreshConfig: () => telegramDeps.loadConfig(),
		sendChatActionHandler: createTelegramSendChatActionHandler({
			sendChatActionFn: (chatId, action, threadParams) => bot.api.sendChatAction(chatId, action, threadParams),
			logger: (message) => logVerbose(`telegram: ${message}`)
		}),
		runtime,
		replyToMode,
		streamMode,
		textLimit,
		opts,
		telegramDeps
	});
	registerTelegramNativeCommands({
		bot,
		cfg,
		runtime,
		accountId: account.accountId,
		telegramCfg,
		allowFrom,
		groupAllowFrom,
		replyToMode,
		textLimit,
		useAccessGroups,
		nativeEnabled,
		nativeSkillsEnabled,
		nativeDisabledExplicit,
		resolveGroupPolicy,
		resolveTelegramGroupConfig,
		shouldSkipUpdate,
		opts,
		telegramDeps
	});
	registerTelegramHandlers({
		cfg,
		accountId: account.accountId,
		bot,
		opts,
		telegramTransport,
		runtime,
		mediaMaxBytes,
		telegramCfg,
		allowFrom,
		groupAllowFrom,
		resolveGroupPolicy,
		resolveTelegramGroupConfig,
		shouldSkipUpdate,
		processMessage,
		logger,
		telegramDeps
	});
	const originalStop = bot.stop.bind(bot);
	bot.stop = ((...args) => {
		threadBindingManager?.stop();
		return originalStop(...args);
	});
	return bot;
}
//#endregion
export { TelegramExecApprovalHandler as n, createTelegramBot as t };
