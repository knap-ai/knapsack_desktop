import { r as formatErrorMessage } from "./errors-Bs2h5H8p.js";
import { r as logVerbose, s as warn, t as danger } from "./globals-BJZkpw-q.js";
import { t as getGlobalHookRunner } from "./hook-runner-global-CmW7Xsw3.js";
import { n as createInternalHookEvent, p as triggerInternalHook } from "./internal-hooks-LWzilokd.js";
import { o as isGifMedia, s as kindFromMime } from "./mime-C9472kP8.js";
import { i as chunkMarkdownTextWithMode } from "./chunk-D6CtZg6q.js";
import { a as toInternalMessageSentContext, d as toPluginMessageSentEvent, f as fireAndForgetHook, l as toPluginMessageContext, t as buildCanonicalSentMessageHookContext } from "./message-hook-mappers-DkZ6SgzR.js";
import { l as saveMediaBuffer } from "./store-CCBPdtW9.js";
import { n as fetchRemoteMedia } from "./fetch-ClF-ZgDC.js";
import { t as loadWebMedia } from "./web-media-4TOxrRxF.js";
import { t as buildOutboundMediaLoadOptions } from "./load-options-3Kn0T7Wg.js";
import { n as retryAsync } from "./retry-BhtTDmeJ.js";
import "./runtime-env-CoykX19-.js";
import "./reply-runtime-DxFWfQpm.js";
import "./ssrf-runtime-BoGiIhjZ.js";
import "./media-runtime-DdCWeFPm.js";
import "./plugin-runtime-CR3GBFZ-.js";
import "./hook-runtime-v16LFQU2.js";
import "./web-media-DPyBx-37.js";
import { i as shouldRetryTelegramTransportFallback, t as resolveTelegramApiBase } from "./fetch-DttJw83W.js";
import { M as resolveTelegramMediaPlaceholder, N as normalizeTelegramReplyToMessageId, i as renderTelegramHtmlText, n as markdownToTelegramHtml, o as wrapFileReferencesInHtml, p as buildTelegramThreadParams, s as withTelegramApiErrorLogging, t as markdownToTelegramChunks, x as resolveTelegramReplyId } from "./format-DqAjfaGj.js";
import { O as splitTelegramCaption, a as getCachedSticker, s as buildInlineKeyboard, t as cacheSticker, x as resolveTelegramVoiceSend } from "./sticker-cache-Cf0p9p0n.js";
import path from "node:path";
import { GrammyError, InputFile } from "grammy";
//#region extensions/telegram/src/bot/delivery.send.ts
const PARSE_ERR_RE = /can't parse entities|parse entities|find end of the entity/i;
const EMPTY_TEXT_ERR_RE = /message text is empty/i;
const THREAD_NOT_FOUND_RE = /message thread not found/i;
const GrammyErrorCtor$2 = typeof GrammyError === "function" ? GrammyError : void 0;
function isTelegramThreadNotFoundError(err) {
	if (GrammyErrorCtor$2 && err instanceof GrammyErrorCtor$2) return THREAD_NOT_FOUND_RE.test(err.description);
	return THREAD_NOT_FOUND_RE.test(formatErrorMessage(err));
}
function hasMessageThreadIdParam(params) {
	if (!params) return false;
	return typeof params.message_thread_id === "number";
}
function removeMessageThreadIdParam(params) {
	if (!params) return {};
	const { message_thread_id: _ignored, ...rest } = params;
	return rest;
}
async function sendTelegramWithThreadFallback(params) {
	const allowThreadlessRetry = params.thread?.scope === "dm";
	const hasThreadId = hasMessageThreadIdParam(params.requestParams);
	const shouldSuppressFirstErrorLog = (err) => allowThreadlessRetry && hasThreadId && isTelegramThreadNotFoundError(err);
	const mergedShouldLog = params.shouldLog ? (err) => params.shouldLog(err) && !shouldSuppressFirstErrorLog(err) : (err) => !shouldSuppressFirstErrorLog(err);
	try {
		return await withTelegramApiErrorLogging({
			operation: params.operation,
			runtime: params.runtime,
			shouldLog: mergedShouldLog,
			fn: () => params.send(params.requestParams)
		});
	} catch (err) {
		if (!allowThreadlessRetry || !hasThreadId || !isTelegramThreadNotFoundError(err)) throw err;
		const retryParams = removeMessageThreadIdParam(params.requestParams);
		params.runtime.log?.(`telegram ${params.operation}: message thread not found; retrying without message_thread_id`);
		return await withTelegramApiErrorLogging({
			operation: `${params.operation} (threadless retry)`,
			runtime: params.runtime,
			fn: () => params.send(retryParams)
		});
	}
}
function buildTelegramSendParams(opts) {
	const threadParams = buildTelegramThreadParams(opts?.thread);
	const params = {};
	const replyToMessageId = normalizeTelegramReplyToMessageId(opts?.replyToMessageId);
	if (replyToMessageId != null) {
		params.reply_to_message_id = replyToMessageId;
		params.allow_sending_without_reply = true;
	}
	if (threadParams) params.message_thread_id = threadParams.message_thread_id;
	if (opts?.silent === true) params.disable_notification = true;
	return params;
}
async function sendTelegramText(bot, chatId, text, runtime, opts) {
	const baseParams = buildTelegramSendParams({
		replyToMessageId: opts?.replyToMessageId,
		thread: opts?.thread,
		silent: opts?.silent
	});
	const linkPreviewOptions = opts?.linkPreview ?? true ? void 0 : { is_disabled: true };
	const htmlText = (opts?.textMode ?? "markdown") === "html" ? text : markdownToTelegramHtml(text);
	const fallbackText = opts?.plainText ?? text;
	const hasFallbackText = fallbackText.trim().length > 0;
	const sendPlainFallback = async () => {
		const res = await sendTelegramWithThreadFallback({
			operation: "sendMessage",
			runtime,
			thread: opts?.thread,
			requestParams: baseParams,
			send: (effectiveParams) => bot.api.sendMessage(chatId, fallbackText, {
				...linkPreviewOptions ? { link_preview_options: linkPreviewOptions } : {},
				...opts?.replyMarkup ? { reply_markup: opts.replyMarkup } : {},
				...effectiveParams
			})
		});
		runtime.log?.(`telegram sendMessage ok chat=${chatId} message=${res.message_id} (plain)`);
		return res.message_id;
	};
	if (!htmlText.trim()) {
		if (!hasFallbackText) throw new Error("telegram sendMessage failed: empty formatted text and empty plain fallback");
		return await sendPlainFallback();
	}
	try {
		const res = await sendTelegramWithThreadFallback({
			operation: "sendMessage",
			runtime,
			thread: opts?.thread,
			requestParams: baseParams,
			shouldLog: (err) => {
				const errText = formatErrorMessage(err);
				return !PARSE_ERR_RE.test(errText) && !EMPTY_TEXT_ERR_RE.test(errText);
			},
			send: (effectiveParams) => bot.api.sendMessage(chatId, htmlText, {
				parse_mode: "HTML",
				...linkPreviewOptions ? { link_preview_options: linkPreviewOptions } : {},
				...opts?.replyMarkup ? { reply_markup: opts.replyMarkup } : {},
				...effectiveParams
			})
		});
		runtime.log?.(`telegram sendMessage ok chat=${chatId} message=${res.message_id}`);
		return res.message_id;
	} catch (err) {
		const errText = formatErrorMessage(err);
		if (PARSE_ERR_RE.test(errText) || EMPTY_TEXT_ERR_RE.test(errText)) {
			if (!hasFallbackText) throw err;
			runtime.log?.(`telegram formatted send failed; retrying without formatting: ${errText}`);
			return await sendPlainFallback();
		}
		throw err;
	}
}
//#endregion
//#region extensions/telegram/src/bot/reply-threading.ts
function resolveReplyToForSend(params) {
	return params.replyToId && (params.replyToMode === "all" || !params.progress.hasReplied) ? params.replyToId : void 0;
}
function markReplyApplied(progress, replyToId) {
	if (replyToId && !progress.hasReplied) progress.hasReplied = true;
}
function markDelivered$1(progress) {
	progress.hasDelivered = true;
}
async function sendChunkedTelegramReplyText(params) {
	const applyDelivered = params.markDelivered ?? markDelivered$1;
	for (let i = 0; i < params.chunks.length; i += 1) {
		const chunk = params.chunks[i];
		if (!chunk) continue;
		const isFirstChunk = i === 0;
		const replyToMessageId = resolveReplyToForSend({
			replyToId: params.replyToId,
			replyToMode: params.replyToMode,
			progress: params.progress
		});
		const shouldAttachQuote = Boolean(replyToMessageId) && Boolean(params.replyQuoteText) && (params.quoteOnlyOnFirstChunk !== true || isFirstChunk);
		await params.sendChunk({
			chunk,
			isFirstChunk,
			replyToMessageId,
			replyMarkup: isFirstChunk ? params.replyMarkup : void 0,
			replyQuoteText: shouldAttachQuote ? params.replyQuoteText : void 0
		});
		markReplyApplied(params.progress, replyToMessageId);
		applyDelivered(params.progress);
	}
}
//#endregion
//#region extensions/telegram/src/bot/delivery.replies.ts
const VOICE_FORBIDDEN_RE = /VOICE_MESSAGES_FORBIDDEN/;
const CAPTION_TOO_LONG_RE = /caption is too long/i;
const GrammyErrorCtor$1 = typeof GrammyError === "function" ? GrammyError : void 0;
function buildChunkTextResolver(params) {
	return (markdown) => {
		const markdownChunks = params.chunkMode === "newline" ? chunkMarkdownTextWithMode(markdown, params.textLimit, params.chunkMode) : [markdown];
		const chunks = [];
		for (const chunk of markdownChunks) {
			const nested = markdownToTelegramChunks(chunk, params.textLimit, { tableMode: params.tableMode });
			if (!nested.length && chunk) {
				chunks.push({
					html: wrapFileReferencesInHtml(markdownToTelegramHtml(chunk, {
						tableMode: params.tableMode,
						wrapFileRefs: false
					})),
					text: chunk
				});
				continue;
			}
			chunks.push(...nested);
		}
		return chunks;
	};
}
function markDelivered(progress) {
	progress.hasDelivered = true;
	progress.deliveredCount += 1;
}
function filterEmptyTelegramTextChunks(chunks) {
	return chunks.filter((chunk) => chunk.text.trim().length > 0);
}
async function deliverTextReply(params) {
	let firstDeliveredMessageId;
	await sendChunkedTelegramReplyText({
		chunks: filterEmptyTelegramTextChunks(params.chunkText(params.replyText)),
		progress: params.progress,
		replyToId: params.replyToId,
		replyToMode: params.replyToMode,
		replyMarkup: params.replyMarkup,
		replyQuoteText: params.replyQuoteText,
		markDelivered,
		sendChunk: async ({ chunk, replyToMessageId, replyMarkup, replyQuoteText }) => {
			const messageId = await sendTelegramText(params.bot, params.chatId, chunk.html, params.runtime, {
				replyToMessageId,
				replyQuoteText,
				thread: params.thread,
				textMode: "html",
				plainText: chunk.text,
				linkPreview: params.linkPreview,
				silent: params.silent,
				replyMarkup
			});
			if (firstDeliveredMessageId == null) firstDeliveredMessageId = messageId;
		}
	});
	return firstDeliveredMessageId;
}
async function sendPendingFollowUpText(params) {
	await sendChunkedTelegramReplyText({
		chunks: filterEmptyTelegramTextChunks(params.chunkText(params.text)),
		progress: params.progress,
		replyToId: params.replyToId,
		replyToMode: params.replyToMode,
		replyMarkup: params.replyMarkup,
		markDelivered,
		sendChunk: async ({ chunk, replyToMessageId, replyMarkup }) => {
			await sendTelegramText(params.bot, params.chatId, chunk.html, params.runtime, {
				replyToMessageId,
				thread: params.thread,
				textMode: "html",
				plainText: chunk.text,
				linkPreview: params.linkPreview,
				silent: params.silent,
				replyMarkup
			});
		}
	});
}
function isVoiceMessagesForbidden(err) {
	if (GrammyErrorCtor$1 && err instanceof GrammyErrorCtor$1) return VOICE_FORBIDDEN_RE.test(err.description);
	return VOICE_FORBIDDEN_RE.test(formatErrorMessage(err));
}
function isCaptionTooLong(err) {
	if (GrammyErrorCtor$1 && err instanceof GrammyErrorCtor$1) return CAPTION_TOO_LONG_RE.test(err.description);
	return CAPTION_TOO_LONG_RE.test(formatErrorMessage(err));
}
async function sendTelegramVoiceFallbackText(opts) {
	let firstDeliveredMessageId;
	const chunks = filterEmptyTelegramTextChunks(opts.chunkText(opts.text));
	let appliedReplyTo = false;
	for (let i = 0; i < chunks.length; i += 1) {
		const chunk = chunks[i];
		const replyToForChunk = !appliedReplyTo ? opts.replyToId : void 0;
		const messageId = await sendTelegramText(opts.bot, opts.chatId, chunk.html, opts.runtime, {
			replyToMessageId: replyToForChunk,
			replyQuoteText: !appliedReplyTo ? opts.replyQuoteText : void 0,
			thread: opts.thread,
			textMode: "html",
			plainText: chunk.text,
			linkPreview: opts.linkPreview,
			silent: opts.silent,
			replyMarkup: !appliedReplyTo ? opts.replyMarkup : void 0
		});
		if (firstDeliveredMessageId == null) firstDeliveredMessageId = messageId;
		if (replyToForChunk) appliedReplyTo = true;
	}
	return firstDeliveredMessageId;
}
async function deliverMediaReply(params) {
	let firstDeliveredMessageId;
	let first = true;
	let pendingFollowUpText;
	for (const mediaUrl of params.mediaList) {
		const isFirstMedia = first;
		const media = await params.mediaLoader(mediaUrl, buildOutboundMediaLoadOptions({ mediaLocalRoots: params.mediaLocalRoots }));
		const kind = kindFromMime(media.contentType ?? void 0);
		const isGif = isGifMedia({
			contentType: media.contentType,
			fileName: media.fileName
		});
		const fileName = media.fileName ?? (isGif ? "animation.gif" : "file");
		const file = new InputFile(media.buffer, fileName);
		const { caption, followUpText } = splitTelegramCaption(isFirstMedia ? params.reply.text ?? void 0 : void 0);
		const htmlCaption = caption ? renderTelegramHtmlText(caption, { tableMode: params.tableMode }) : void 0;
		if (followUpText) pendingFollowUpText = followUpText;
		first = false;
		const replyToMessageId = resolveReplyToForSend({
			replyToId: params.replyToId,
			replyToMode: params.replyToMode,
			progress: params.progress
		});
		const shouldAttachButtonsToMedia = isFirstMedia && params.replyMarkup && !followUpText;
		const mediaParams = {
			caption: htmlCaption,
			...htmlCaption ? { parse_mode: "HTML" } : {},
			...shouldAttachButtonsToMedia ? { reply_markup: params.replyMarkup } : {},
			...buildTelegramSendParams({
				replyToMessageId,
				thread: params.thread,
				silent: params.silent
			})
		};
		if (isGif) {
			const result = await sendTelegramWithThreadFallback({
				operation: "sendAnimation",
				runtime: params.runtime,
				thread: params.thread,
				requestParams: mediaParams,
				send: (effectiveParams) => params.bot.api.sendAnimation(params.chatId, file, { ...effectiveParams })
			});
			if (firstDeliveredMessageId == null) firstDeliveredMessageId = result.message_id;
			markDelivered(params.progress);
		} else if (kind === "image") {
			const result = await sendTelegramWithThreadFallback({
				operation: "sendPhoto",
				runtime: params.runtime,
				thread: params.thread,
				requestParams: mediaParams,
				send: (effectiveParams) => params.bot.api.sendPhoto(params.chatId, file, { ...effectiveParams })
			});
			if (firstDeliveredMessageId == null) firstDeliveredMessageId = result.message_id;
			markDelivered(params.progress);
		} else if (kind === "video") {
			const result = await sendTelegramWithThreadFallback({
				operation: "sendVideo",
				runtime: params.runtime,
				thread: params.thread,
				requestParams: mediaParams,
				send: (effectiveParams) => params.bot.api.sendVideo(params.chatId, file, { ...effectiveParams })
			});
			if (firstDeliveredMessageId == null) firstDeliveredMessageId = result.message_id;
			markDelivered(params.progress);
		} else if (kind === "audio") {
			const { useVoice } = resolveTelegramVoiceSend({
				wantsVoice: params.reply.audioAsVoice === true,
				contentType: media.contentType,
				fileName,
				logFallback: logVerbose
			});
			if (useVoice) {
				const sendVoiceMedia = async (requestParams, shouldLog) => {
					const result = await sendTelegramWithThreadFallback({
						operation: "sendVoice",
						runtime: params.runtime,
						thread: params.thread,
						requestParams,
						shouldLog,
						send: (effectiveParams) => params.bot.api.sendVoice(params.chatId, file, { ...effectiveParams })
					});
					if (firstDeliveredMessageId == null) firstDeliveredMessageId = result.message_id;
					markDelivered(params.progress);
				};
				await params.onVoiceRecording?.();
				try {
					await sendVoiceMedia(mediaParams, (err) => !isVoiceMessagesForbidden(err));
				} catch (voiceErr) {
					if (isVoiceMessagesForbidden(voiceErr)) {
						const fallbackText = params.reply.text;
						if (!fallbackText || !fallbackText.trim()) throw voiceErr;
						logVerbose("telegram sendVoice forbidden (recipient has voice messages blocked in privacy settings); falling back to text");
						const voiceFallbackReplyTo = resolveReplyToForSend({
							replyToId: params.replyToId,
							replyToMode: params.replyToMode,
							progress: params.progress
						});
						const fallbackMessageId = await sendTelegramVoiceFallbackText({
							bot: params.bot,
							chatId: params.chatId,
							runtime: params.runtime,
							text: fallbackText,
							chunkText: params.chunkText,
							replyToId: voiceFallbackReplyTo,
							thread: params.thread,
							linkPreview: params.linkPreview,
							silent: params.silent,
							replyMarkup: params.replyMarkup,
							replyQuoteText: params.replyQuoteText
						});
						if (firstDeliveredMessageId == null) firstDeliveredMessageId = fallbackMessageId;
						markReplyApplied(params.progress, voiceFallbackReplyTo);
						markDelivered(params.progress);
						continue;
					}
					if (isCaptionTooLong(voiceErr)) {
						logVerbose("telegram sendVoice caption too long; resending voice without caption + text separately");
						const noCaptionParams = { ...mediaParams };
						delete noCaptionParams.caption;
						delete noCaptionParams.parse_mode;
						await sendVoiceMedia(noCaptionParams);
						const fallbackText = params.reply.text;
						if (fallbackText?.trim()) await sendTelegramVoiceFallbackText({
							bot: params.bot,
							chatId: params.chatId,
							runtime: params.runtime,
							text: fallbackText,
							chunkText: params.chunkText,
							replyToId: void 0,
							thread: params.thread,
							linkPreview: params.linkPreview,
							silent: params.silent,
							replyMarkup: params.replyMarkup
						});
						markReplyApplied(params.progress, replyToMessageId);
						continue;
					}
					throw voiceErr;
				}
			} else {
				const result = await sendTelegramWithThreadFallback({
					operation: "sendAudio",
					runtime: params.runtime,
					thread: params.thread,
					requestParams: mediaParams,
					send: (effectiveParams) => params.bot.api.sendAudio(params.chatId, file, { ...effectiveParams })
				});
				if (firstDeliveredMessageId == null) firstDeliveredMessageId = result.message_id;
				markDelivered(params.progress);
			}
		} else {
			const result = await sendTelegramWithThreadFallback({
				operation: "sendDocument",
				runtime: params.runtime,
				thread: params.thread,
				requestParams: mediaParams,
				send: (effectiveParams) => params.bot.api.sendDocument(params.chatId, file, { ...effectiveParams })
			});
			if (firstDeliveredMessageId == null) firstDeliveredMessageId = result.message_id;
			markDelivered(params.progress);
		}
		markReplyApplied(params.progress, replyToMessageId);
		if (pendingFollowUpText && isFirstMedia) {
			await sendPendingFollowUpText({
				bot: params.bot,
				chatId: params.chatId,
				runtime: params.runtime,
				thread: params.thread,
				chunkText: params.chunkText,
				text: pendingFollowUpText,
				replyMarkup: params.replyMarkup,
				linkPreview: params.linkPreview,
				silent: params.silent,
				replyToId: params.replyToId,
				replyToMode: params.replyToMode,
				progress: params.progress
			});
			pendingFollowUpText = void 0;
		}
	}
	return firstDeliveredMessageId;
}
async function maybePinFirstDeliveredMessage(params) {
	if (!params.shouldPin || typeof params.firstDeliveredMessageId !== "number") return;
	try {
		await params.bot.api.pinChatMessage(params.chatId, params.firstDeliveredMessageId, { disable_notification: true });
	} catch (err) {
		logVerbose(`telegram pinChatMessage failed chat=${params.chatId} message=${params.firstDeliveredMessageId}: ${formatErrorMessage(err)}`);
	}
}
function buildTelegramSentHookContext(params) {
	return buildCanonicalSentMessageHookContext({
		to: params.chatId,
		content: params.content,
		success: params.success,
		error: params.error,
		channelId: "telegram",
		accountId: params.accountId,
		conversationId: params.chatId,
		messageId: typeof params.messageId === "number" ? String(params.messageId) : void 0,
		isGroup: params.isGroup,
		groupId: params.groupId
	});
}
function emitInternalMessageSentHook(params) {
	if (!params.sessionKeyForInternalHooks) return;
	const canonical = buildTelegramSentHookContext(params);
	fireAndForgetHook(triggerInternalHook(createInternalHookEvent("message", "sent", params.sessionKeyForInternalHooks, toInternalMessageSentContext(canonical))), "telegram: message:sent internal hook failed");
}
function emitMessageSentHooks(params) {
	if (!params.enabled && !params.sessionKeyForInternalHooks) return;
	const canonical = buildTelegramSentHookContext(params);
	if (params.enabled) fireAndForgetHook(Promise.resolve(params.hookRunner.runMessageSent(toPluginMessageSentEvent(canonical), toPluginMessageContext(canonical))), "telegram: message_sent plugin hook failed");
	emitInternalMessageSentHook(params);
}
async function deliverReplies(params) {
	const progress = {
		hasReplied: false,
		hasDelivered: false,
		deliveredCount: 0
	};
	const mediaLoader = params.mediaLoader ?? loadWebMedia;
	const hookRunner = getGlobalHookRunner();
	const hasMessageSendingHooks = hookRunner?.hasHooks("message_sending") ?? false;
	const hasMessageSentHooks = hookRunner?.hasHooks("message_sent") ?? false;
	const chunkText = buildChunkTextResolver({
		textLimit: params.textLimit,
		chunkMode: params.chunkMode ?? "length",
		tableMode: params.tableMode
	});
	for (const originalReply of params.replies) {
		let reply = originalReply;
		const mediaList = reply?.mediaUrls?.length ? reply.mediaUrls : reply?.mediaUrl ? [reply.mediaUrl] : [];
		const hasMedia = mediaList.length > 0;
		if (!reply?.text && !hasMedia) {
			if (reply?.audioAsVoice) {
				logVerbose("telegram reply has audioAsVoice without media/text; skipping");
				continue;
			}
			params.runtime.error?.(danger("reply missing text/media"));
			continue;
		}
		const rawContent = reply.text || "";
		if (hasMessageSendingHooks) {
			const hookResult = await hookRunner?.runMessageSending({
				to: params.chatId,
				content: rawContent,
				metadata: {
					channel: "telegram",
					mediaUrls: mediaList,
					threadId: params.thread?.id
				}
			}, {
				channelId: "telegram",
				accountId: params.accountId,
				conversationId: params.chatId
			});
			if (hookResult?.cancel) continue;
			if (typeof hookResult?.content === "string" && hookResult.content !== rawContent) reply = {
				...reply,
				text: hookResult.content
			};
		}
		const contentForSentHook = reply.text || "";
		try {
			const deliveredCountBeforeReply = progress.deliveredCount;
			const replyToId = params.replyToMode === "off" ? void 0 : resolveTelegramReplyId(reply.replyToId);
			const telegramData = reply.channelData?.telegram;
			const shouldPinFirstMessage = telegramData?.pin === true;
			const replyMarkup = buildInlineKeyboard(telegramData?.buttons);
			let firstDeliveredMessageId;
			if (mediaList.length === 0) firstDeliveredMessageId = await deliverTextReply({
				bot: params.bot,
				chatId: params.chatId,
				runtime: params.runtime,
				thread: params.thread,
				chunkText,
				replyText: reply.text || "",
				replyMarkup,
				replyQuoteText: params.replyQuoteText,
				linkPreview: params.linkPreview,
				silent: params.silent,
				replyToId,
				replyToMode: params.replyToMode,
				progress
			});
			else firstDeliveredMessageId = await deliverMediaReply({
				reply,
				mediaList,
				bot: params.bot,
				chatId: params.chatId,
				runtime: params.runtime,
				thread: params.thread,
				tableMode: params.tableMode,
				mediaLocalRoots: params.mediaLocalRoots,
				chunkText,
				mediaLoader,
				onVoiceRecording: params.onVoiceRecording,
				linkPreview: params.linkPreview,
				silent: params.silent,
				replyQuoteText: params.replyQuoteText,
				replyMarkup,
				replyToId,
				replyToMode: params.replyToMode,
				progress
			});
			await maybePinFirstDeliveredMessage({
				shouldPin: shouldPinFirstMessage,
				bot: params.bot,
				chatId: params.chatId,
				runtime: params.runtime,
				firstDeliveredMessageId
			});
			emitMessageSentHooks({
				hookRunner,
				enabled: hasMessageSentHooks,
				sessionKeyForInternalHooks: params.sessionKeyForInternalHooks,
				chatId: params.chatId,
				accountId: params.accountId,
				content: contentForSentHook,
				success: progress.deliveredCount > deliveredCountBeforeReply,
				messageId: firstDeliveredMessageId,
				isGroup: params.mirrorIsGroup,
				groupId: params.mirrorGroupId
			});
		} catch (error) {
			emitMessageSentHooks({
				hookRunner,
				enabled: hasMessageSentHooks,
				sessionKeyForInternalHooks: params.sessionKeyForInternalHooks,
				chatId: params.chatId,
				accountId: params.accountId,
				content: contentForSentHook,
				success: false,
				error: error instanceof Error ? error.message : String(error),
				isGroup: params.mirrorIsGroup,
				groupId: params.mirrorGroupId
			});
			throw error;
		}
	}
	return { delivered: progress.hasDelivered };
}
//#endregion
//#region extensions/telegram/src/bot/delivery.resolve-media.ts
const FILE_TOO_BIG_RE = /file is too big/i;
const GrammyErrorCtor = typeof GrammyError === "function" ? GrammyError : void 0;
function buildTelegramMediaSsrfPolicy(apiRoot) {
	const hostnames = ["api.telegram.org"];
	let allowedHostnames;
	if (apiRoot) try {
		const customHost = new URL(apiRoot).hostname;
		if (customHost && !hostnames.includes(customHost)) {
			hostnames.push(customHost);
			allowedHostnames = [customHost];
		}
	} catch {}
	return {
		hostnameAllowlist: hostnames,
		...allowedHostnames ? { allowedHostnames } : {},
		allowRfc2544BenchmarkRange: true
	};
}
/**
* Returns true if the error is Telegram's "file is too big" error.
* This happens when trying to download files >20MB via the Bot API.
* Unlike network errors, this is a permanent error and should not be retried.
*/
function isFileTooBigError(err) {
	if (GrammyErrorCtor && err instanceof GrammyErrorCtor) return FILE_TOO_BIG_RE.test(err.description);
	return FILE_TOO_BIG_RE.test(formatErrorMessage(err));
}
/**
* Returns true if the error is a transient network error that should be retried.
* Returns false for permanent errors like "file is too big" (400 Bad Request).
*/
function isRetryableGetFileError(err) {
	if (isFileTooBigError(err)) return false;
	return true;
}
function resolveMediaFileRef(msg) {
	return msg.photo?.[msg.photo.length - 1] ?? msg.video ?? msg.video_note ?? msg.document ?? msg.audio ?? msg.voice;
}
function resolveTelegramFileName(msg) {
	return msg.document?.file_name ?? msg.audio?.file_name ?? msg.video?.file_name ?? msg.animation?.file_name;
}
function resolveTelegramMimeType(msg) {
	return msg.audio?.mime_type ?? msg.voice?.mime_type ?? msg.video?.mime_type ?? msg.document?.mime_type ?? msg.animation?.mime_type ?? void 0;
}
async function resolveTelegramFileWithRetry(ctx) {
	try {
		return await retryAsync(() => ctx.getFile(), {
			attempts: 3,
			minDelayMs: 1e3,
			maxDelayMs: 4e3,
			jitter: .2,
			label: "telegram:getFile",
			shouldRetry: isRetryableGetFileError,
			onRetry: ({ attempt, maxAttempts }) => logVerbose(`telegram: getFile retry ${attempt}/${maxAttempts}`)
		});
	} catch (err) {
		if (isFileTooBigError(err)) {
			logVerbose(warn("telegram: getFile failed - file exceeds Telegram Bot API 20MB limit; skipping attachment"));
			return null;
		}
		logVerbose(`telegram: getFile failed after retries: ${String(err)}`);
		return null;
	}
}
function resolveRequiredTelegramTransport(transport) {
	if (transport) return transport;
	const resolvedFetch = globalThis.fetch;
	if (!resolvedFetch) throw new Error("fetch is not available; set channels.telegram.proxy in config");
	return {
		fetch: resolvedFetch,
		sourceFetch: resolvedFetch
	};
}
function resolveOptionalTelegramTransport(transport) {
	try {
		return resolveRequiredTelegramTransport(transport);
	} catch {
		return null;
	}
}
/** Default idle timeout for Telegram media downloads (30 seconds). */
const TELEGRAM_DOWNLOAD_IDLE_TIMEOUT_MS = 3e4;
async function downloadAndSaveTelegramFile(params) {
	if (path.isAbsolute(params.filePath)) return {
		path: params.filePath,
		contentType: params.mimeType
	};
	const fetched = await fetchRemoteMedia({
		url: `${resolveTelegramApiBase(params.apiRoot)}/file/bot${params.token}/${params.filePath}`,
		fetchImpl: params.transport.sourceFetch,
		dispatcherAttempts: params.transport.dispatcherAttempts,
		shouldRetryFetchError: shouldRetryTelegramTransportFallback,
		filePathHint: params.filePath,
		maxBytes: params.maxBytes,
		readIdleTimeoutMs: TELEGRAM_DOWNLOAD_IDLE_TIMEOUT_MS,
		ssrfPolicy: buildTelegramMediaSsrfPolicy(params.apiRoot)
	});
	const originalName = params.telegramFileName ?? fetched.fileName ?? params.filePath;
	return saveMediaBuffer(fetched.buffer, fetched.contentType, "inbound", params.maxBytes, originalName);
}
async function resolveStickerMedia(params) {
	const { msg, ctx, maxBytes, token, transport } = params;
	if (!msg.sticker) return;
	const sticker = msg.sticker;
	if (sticker.is_animated || sticker.is_video) {
		logVerbose("telegram: skipping animated/video sticker (only static stickers supported)");
		return null;
	}
	if (!sticker.file_id) return null;
	try {
		const file = await resolveTelegramFileWithRetry(ctx);
		if (!file?.file_path) {
			logVerbose("telegram: getFile returned no file_path for sticker");
			return null;
		}
		const resolvedTransport = resolveOptionalTelegramTransport(transport);
		if (!resolvedTransport) {
			logVerbose("telegram: fetch not available for sticker download");
			return null;
		}
		const saved = await downloadAndSaveTelegramFile({
			filePath: file.file_path,
			token,
			transport: resolvedTransport,
			maxBytes,
			apiRoot: params.apiRoot
		});
		const cached = sticker.file_unique_id ? getCachedSticker(sticker.file_unique_id) : null;
		if (cached) {
			logVerbose(`telegram: sticker cache hit for ${sticker.file_unique_id}`);
			const fileId = sticker.file_id ?? cached.fileId;
			const emoji = sticker.emoji ?? cached.emoji;
			const setName = sticker.set_name ?? cached.setName;
			if (fileId !== cached.fileId || emoji !== cached.emoji || setName !== cached.setName) cacheSticker({
				...cached,
				fileId,
				emoji,
				setName
			});
			return {
				path: saved.path,
				contentType: saved.contentType,
				placeholder: "<media:sticker>",
				stickerMetadata: {
					emoji,
					setName,
					fileId,
					fileUniqueId: sticker.file_unique_id,
					cachedDescription: cached.description
				}
			};
		}
		return {
			path: saved.path,
			contentType: saved.contentType,
			placeholder: "<media:sticker>",
			stickerMetadata: {
				emoji: sticker.emoji ?? void 0,
				setName: sticker.set_name ?? void 0,
				fileId: sticker.file_id,
				fileUniqueId: sticker.file_unique_id
			}
		};
	} catch (err) {
		logVerbose(`telegram: failed to process sticker: ${String(err)}`);
		return null;
	}
}
async function resolveMedia(ctx, maxBytes, token, transport, apiRoot) {
	const msg = ctx.message;
	const stickerResolved = await resolveStickerMedia({
		msg,
		ctx,
		maxBytes,
		token,
		transport,
		apiRoot
	});
	if (stickerResolved !== void 0) return stickerResolved;
	if (!resolveMediaFileRef(msg)?.file_id) return null;
	const file = await resolveTelegramFileWithRetry(ctx);
	if (!file) return null;
	if (!file.file_path) throw new Error("Telegram getFile returned no file_path");
	const saved = await downloadAndSaveTelegramFile({
		filePath: file.file_path,
		token,
		transport: resolveRequiredTelegramTransport(transport),
		maxBytes,
		telegramFileName: resolveTelegramFileName(msg),
		mimeType: resolveTelegramMimeType(msg),
		apiRoot
	});
	const placeholder = resolveTelegramMediaPlaceholder(msg) ?? "<media:document>";
	return {
		path: saved.path,
		contentType: saved.contentType,
		placeholder
	};
}
//#endregion
export { deliverReplies as n, emitInternalMessageSentHook as r, resolveMedia as t };
