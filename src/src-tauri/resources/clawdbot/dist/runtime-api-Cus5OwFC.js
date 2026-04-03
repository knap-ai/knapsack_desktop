import { p as createNonExitingRuntime } from "./subsystem-CJEvHE2o.js";
import { _ as normalizeAccountId, u as resolveAgentIdFromSessionKey } from "./session-key-D7XpmyVq.js";
import { a as shouldLogVerbose, r as logVerbose, t as danger } from "./globals-BJZkpw-q.js";
import { c as loadConfig } from "./io-DhtVmzAJ.js";
import { r as buildChannelConfigSchema } from "./config-schema-BoSEJoAt.js";
import { t as resolveAccountEntry } from "./account-lookup-DI_0omIr.js";
import { r as getSessionBindingService } from "./session-binding-service-CAxmjUEJ.js";
import { a as normalizePluginHttpPath } from "./http-route-overlap-COhYSRcV.js";
import { a as warnMissingProviderGroupPolicyFallbackOnce, n as resolveAllowlistProviderRuntimeGroupPolicy, r as resolveDefaultGroupPolicy } from "./runtime-group-policy-Dj5ka44z.js";
import "./status-helpers-CtpWf3f1.js";
import { p as resolveSendableOutboundReplyParts } from "./reply-payload-SzVz53hc.js";
import { r as chunkMarkdownText } from "./chunk-D6CtZg6q.js";
import { t as buildRandomTempFilePath } from "./temp-download-BOGUEcoP.js";
import "./temp-path-CThcxCcD.js";
import { i as resolveAgentRoute, n as deriveLastRoutePolicy } from "./resolve-route-DID7K3Jm.js";
import "./core-BghMcc08.js";
import "./routing-Br1fEo8A.js";
import { t as hasControlCommand } from "./command-detection-Bz_HOEgu.js";
import { t as finalizeInboundContext } from "./inbound-context-1KETU_yq.js";
import { r as formatInboundEnvelope } from "./envelope-CTj2Ympv.js";
import { n as buildMentionRegexes, r as matchesMentionPatterns } from "./mentions-Bfkn0E5p.js";
import { t as dispatchReplyWithBufferedBlockDispatcher } from "./provider-dispatcher-B2dh4tuq.js";
import { n as resolveControlCommandGate } from "./command-gating-Ch_OhMao.js";
import { t as recordInboundSession } from "./session-BiguA5nC.js";
import { c as recordChannelActivity } from "./heartbeat-visibility-CIk_o9BM.js";
import { a as readChannelAllowFromStore, d as upsertChannelPairingRequest } from "./pairing-store-DxNrxr_7.js";
import { n as isSenderIdAllowed, r as mergeDmAllowFromSources, t as firstDefined } from "./allow-from-B0YDSOuL.js";
import "./channel-config-schema-BAlK8Vas.js";
import { n as evaluateMatchedGroupAccessForPolicy } from "./group-access-Cc77nG5J.js";
import { c as resolvePinnedMainDmOwnerFromAllowlist } from "./dm-policy-shared-ikRqobo8.js";
import { s as clearHistoryEntriesIfEnabled, u as recordPendingHistoryEntryIfEnabled } from "./history-5RBVRj2e.js";
import "./reply-history-D4cGNH0x.js";
import { t as waitForAbortSignal } from "./abort-signal-DSOoJR_B.js";
import "./runtime-DQYrJ0Nk.js";
import { t as withTimeout } from "./with-timeout-DUjG22ty.js";
import "./runtime-env-CoykX19-.js";
import "./setup-CPpe7OZc.js";
import "./config-runtime-CmISCurQ.js";
import "./reply-runtime-DxFWfQpm.js";
import "./reply-dispatch-runtime-ChRff2BZ.js";
import { t as createChannelReplyPipeline } from "./channel-reply-pipeline-S26JmiPz.js";
import "./channel-runtime-BQArgtty.js";
import { a as isRequestBodyLimitError, c as requestBodyErrorToText, s as readRequestBodyWithLimit } from "./http-body-BFWxPfKm.js";
import { i as resolveConfiguredBindingRoute, r as ensureConfiguredBindingRouteReady } from "./conversation-runtime-DIsQmaYR.js";
import { t as resolvePairingIdLabel } from "./pairing-labels-tGdvd1m_.js";
import { r as stripMarkdown } from "./text-runtime-B0ZpmkER.js";
import { t as registerPluginHttpRoute } from "./http-registry-DGzPTdhP.js";
import "./account-resolution-CahYTlaB.js";
import { t as createChannelPairingChallengeIssuer } from "./channel-pairing-Nk7oRFrM.js";
import { a as createWebhookInFlightLimiter, i as beginWebhookRequestPipelineOrReject } from "./webhook-request-guards-CGLEqexw.js";
import "./webhook-ingress-B2uHxBM3.js";
import "./command-auth-Bajp-QXz.js";
import "./channel-inbound-BTUonbdp.js";
import { n as resolveMentionGatingWithBypass } from "./mention-gating-DzHPTjeG.js";
import { n as toLocationContext, t as formatLocationText } from "./location-ZVNxeZlc.js";
import { t as resolveInboundSessionEnvelopeContext } from "./session-envelope-B7B9p70N.js";
import { t as zod_exports } from "./zod-DCTDn17d.js";
import { i as resolveLineAccount } from "./accounts-xKF9ehiT.js";
import fsSync from "node:fs";
import { readFile } from "node:fs/promises";
import crypto from "node:crypto";
import { messagingApi } from "@line/bot-sdk";
//#region extensions/line/src/bot-access.ts
function normalizeAllowEntry(value) {
	const trimmed = String(value).trim();
	if (!trimmed) return "";
	if (trimmed === "*") return "*";
	return trimmed.replace(/^line:(?:user:)?/i, "");
}
const normalizeAllowFrom = (list) => {
	const entries = (list ?? []).map((value) => normalizeAllowEntry(value)).filter(Boolean);
	return {
		entries,
		hasWildcard: entries.includes("*"),
		hasEntries: entries.length > 0
	};
};
const normalizeDmAllowFromWithStore = (params) => normalizeAllowFrom(mergeDmAllowFromSources(params));
const isSenderAllowed = (params) => {
	const { allow, senderId } = params;
	return isSenderIdAllowed(allow, senderId, false);
};
//#endregion
//#region extensions/line/src/download.ts
const AUDIO_BRANDS = new Set([
	"m4a ",
	"m4b ",
	"m4p ",
	"m4r ",
	"f4a ",
	"f4b "
]);
async function downloadLineMedia(messageId, channelAccessToken, maxBytes = 10 * 1024 * 1024) {
	const response = await new messagingApi.MessagingApiBlobClient({ channelAccessToken }).getMessageContent(messageId);
	const chunks = [];
	let totalSize = 0;
	for await (const chunk of response) {
		totalSize += chunk.length;
		if (totalSize > maxBytes) throw new Error(`Media exceeds ${Math.round(maxBytes / (1024 * 1024))}MB limit`);
		chunks.push(chunk);
	}
	const buffer = Buffer.concat(chunks);
	const contentType = detectContentType(buffer);
	const filePath = buildRandomTempFilePath({
		prefix: "line-media",
		extension: getExtensionForContentType(contentType)
	});
	await fsSync.promises.writeFile(filePath, buffer);
	logVerbose(`line: downloaded media ${messageId} to ${filePath} (${buffer.length} bytes)`);
	return {
		path: filePath,
		contentType,
		size: buffer.length
	};
}
function detectContentType(buffer) {
	const hasFtypBox = buffer.length >= 12 && buffer[4] === 102 && buffer[5] === 116 && buffer[6] === 121 && buffer[7] === 112;
	if (buffer.length >= 2) {
		if (buffer[0] === 255 && buffer[1] === 216) return "image/jpeg";
		if (buffer[0] === 137 && buffer[1] === 80 && buffer[2] === 78 && buffer[3] === 71) return "image/png";
		if (buffer[0] === 71 && buffer[1] === 73 && buffer[2] === 70) return "image/gif";
		if (buffer[0] === 82 && buffer[1] === 73 && buffer[2] === 70 && buffer[3] === 70 && buffer[8] === 87 && buffer[9] === 69 && buffer[10] === 66 && buffer[11] === 80) return "image/webp";
		if (hasFtypBox) {
			const majorBrand = buffer.toString("ascii", 8, 12).toLowerCase();
			if (AUDIO_BRANDS.has(majorBrand)) return "audio/mp4";
			return "video/mp4";
		}
	}
	return "application/octet-stream";
}
function getExtensionForContentType(contentType) {
	switch (contentType) {
		case "image/jpeg": return ".jpg";
		case "image/png": return ".png";
		case "image/gif": return ".gif";
		case "image/webp": return ".webp";
		case "video/mp4": return ".mp4";
		case "audio/mp4": return ".m4a";
		case "audio/mpeg": return ".mp3";
		default: return ".bin";
	}
}
//#endregion
//#region extensions/line/src/probe.ts
async function probeLineBot(channelAccessToken, timeoutMs = 5e3) {
	if (!channelAccessToken?.trim()) return {
		ok: false,
		error: "Channel access token not configured"
	};
	const client = new messagingApi.MessagingApiClient({ channelAccessToken: channelAccessToken.trim() });
	try {
		const profile = await withTimeout(client.getBotInfo(), timeoutMs);
		return {
			ok: true,
			bot: {
				displayName: profile.displayName,
				userId: profile.userId,
				basicId: profile.basicId,
				pictureUrl: profile.pictureUrl
			}
		};
	} catch (err) {
		return {
			ok: false,
			error: err instanceof Error ? err.message : String(err)
		};
	}
}
//#endregion
//#region extensions/line/src/actions.ts
/**
* Create a message action (sends text when tapped)
*/
function messageAction(label, text) {
	return {
		type: "message",
		label: label.slice(0, 20),
		text: text ?? label
	};
}
/**
* Create a URI action (opens a URL when tapped)
*/
function uriAction(label, uri) {
	return {
		type: "uri",
		label: label.slice(0, 20),
		uri
	};
}
/**
* Create a postback action (sends data to webhook when tapped)
*/
function postbackAction(label, data, displayText) {
	return {
		type: "postback",
		label: label.slice(0, 20),
		data: data.slice(0, 300),
		displayText: displayText?.slice(0, 300)
	};
}
/**
* Create a datetime picker action
*/
function datetimePickerAction(label, data, mode, options) {
	return {
		type: "datetimepicker",
		label: label.slice(0, 20),
		data: data.slice(0, 300),
		mode,
		initial: options?.initial,
		max: options?.max,
		min: options?.min
	};
}
//#endregion
//#region extensions/line/src/template-messages.ts
function buildTemplatePayloadAction(action) {
	if (action.type === "uri" && action.uri) return uriAction(action.label, action.uri);
	if (action.type === "postback" && action.data) return postbackAction(action.label, action.data, action.label);
	return messageAction(action.label, action.data ?? action.label);
}
/**
* Create a confirm template (yes/no style dialog)
*/
function createConfirmTemplate(text, confirmAction, cancelAction, altText) {
	const template = {
		type: "confirm",
		text: text.slice(0, 240),
		actions: [confirmAction, cancelAction]
	};
	return {
		type: "template",
		altText: altText?.slice(0, 400) ?? text.slice(0, 400),
		template
	};
}
/**
* Create a button template with title, text, and action buttons
*/
function createButtonTemplate(title, text, actions, options) {
	const textLimit = Boolean(options?.thumbnailImageUrl?.trim()) ? 160 : 60;
	const template = {
		type: "buttons",
		title: title.slice(0, 40),
		text: text.slice(0, textLimit),
		actions: actions.slice(0, 4),
		thumbnailImageUrl: options?.thumbnailImageUrl,
		imageAspectRatio: options?.imageAspectRatio ?? "rectangle",
		imageSize: options?.imageSize ?? "cover",
		imageBackgroundColor: options?.imageBackgroundColor,
		defaultAction: options?.defaultAction
	};
	return {
		type: "template",
		altText: options?.altText?.slice(0, 400) ?? `${title}: ${text}`.slice(0, 400),
		template
	};
}
/**
* Create a carousel template with multiple columns
*/
function createTemplateCarousel(columns, options) {
	const template = {
		type: "carousel",
		columns: columns.slice(0, 10),
		imageAspectRatio: options?.imageAspectRatio ?? "rectangle",
		imageSize: options?.imageSize ?? "cover"
	};
	return {
		type: "template",
		altText: options?.altText?.slice(0, 400) ?? "View carousel",
		template
	};
}
/**
* Create a carousel column for use with createTemplateCarousel
*/
function createCarouselColumn(params) {
	return {
		title: params.title?.slice(0, 40),
		text: params.text.slice(0, 120),
		actions: params.actions.slice(0, 3),
		thumbnailImageUrl: params.thumbnailImageUrl,
		imageBackgroundColor: params.imageBackgroundColor,
		defaultAction: params.defaultAction
	};
}
/**
* Create an image carousel template (simpler, image-focused carousel)
*/
function createImageCarousel(columns, altText) {
	const template = {
		type: "image_carousel",
		columns: columns.slice(0, 10)
	};
	return {
		type: "template",
		altText: altText?.slice(0, 400) ?? "View images",
		template
	};
}
/**
* Create an image carousel column for use with createImageCarousel
*/
function createImageCarouselColumn(imageUrl, action) {
	return {
		imageUrl,
		action
	};
}
/**
* Create a simple yes/no confirmation dialog
*/
function createYesNoConfirm(question, options) {
	return createConfirmTemplate(question, options?.yesData ? postbackAction(options.yesText ?? "Yes", options.yesData, options.yesText ?? "Yes") : messageAction(options?.yesText ?? "Yes"), options?.noData ? postbackAction(options.noText ?? "No", options.noData, options.noText ?? "No") : messageAction(options?.noText ?? "No"), options?.altText);
}
/**
* Create a button menu with simple text buttons
*/
function createButtonMenu(title, text, buttons, options) {
	return createButtonTemplate(title, text, buttons.slice(0, 4).map((btn) => messageAction(btn.label, btn.text)), {
		thumbnailImageUrl: options?.thumbnailImageUrl,
		altText: options?.altText
	});
}
/**
* Create a button menu with URL links
*/
function createLinkMenu(title, text, links, options) {
	return createButtonTemplate(title, text, links.slice(0, 4).map((link) => uriAction(link.label, link.url)), {
		thumbnailImageUrl: options?.thumbnailImageUrl,
		altText: options?.altText
	});
}
/**
* Create a simple product/item carousel
*/
function createProductCarousel(products, altText) {
	return createTemplateCarousel(products.slice(0, 10).map((product) => {
		const actions = [];
		if (product.actionUrl) actions.push(uriAction(product.actionLabel ?? "View", product.actionUrl));
		else if (product.actionData) actions.push(postbackAction(product.actionLabel ?? "Select", product.actionData));
		else actions.push(messageAction(product.actionLabel ?? "Select", product.title));
		return createCarouselColumn({
			title: product.title,
			text: product.price ? `${product.description}\n${product.price}`.slice(0, 120) : product.description,
			thumbnailImageUrl: product.imageUrl,
			actions
		});
	}), { altText });
}
/**
* Convert a TemplateMessagePayload from ReplyPayload to a LINE TemplateMessage
*/
function buildTemplateMessageFromPayload(payload) {
	switch (payload.type) {
		case "confirm": {
			const confirmAction = payload.confirmData.startsWith("http") ? uriAction(payload.confirmLabel, payload.confirmData) : payload.confirmData.includes("=") ? postbackAction(payload.confirmLabel, payload.confirmData, payload.confirmLabel) : messageAction(payload.confirmLabel, payload.confirmData);
			const cancelAction = payload.cancelData.startsWith("http") ? uriAction(payload.cancelLabel, payload.cancelData) : payload.cancelData.includes("=") ? postbackAction(payload.cancelLabel, payload.cancelData, payload.cancelLabel) : messageAction(payload.cancelLabel, payload.cancelData);
			return createConfirmTemplate(payload.text, confirmAction, cancelAction, payload.altText);
		}
		case "buttons": {
			const actions = payload.actions.slice(0, 4).map((action) => buildTemplatePayloadAction(action));
			return createButtonTemplate(payload.title, payload.text, actions, {
				thumbnailImageUrl: payload.thumbnailImageUrl,
				altText: payload.altText
			});
		}
		case "carousel": return createTemplateCarousel(payload.columns.slice(0, 10).map((col) => {
			const colActions = col.actions.slice(0, 3).map((action) => buildTemplatePayloadAction(action));
			return createCarouselColumn({
				title: col.title,
				text: col.text,
				thumbnailImageUrl: col.thumbnailImageUrl,
				actions: colActions
			});
		}), { altText: payload.altText });
		default: return null;
	}
}
//#endregion
//#region extensions/line/src/channel-access-token.ts
function resolveLineChannelAccessToken(explicit, params) {
	if (explicit?.trim()) return explicit.trim();
	if (!params.channelAccessToken) throw new Error(`LINE channel access token missing for account "${params.accountId}" (set channels.line.channelAccessToken or LINE_CHANNEL_ACCESS_TOKEN).`);
	return params.channelAccessToken.trim();
}
//#endregion
//#region extensions/line/src/send.ts
const userProfileCache = /* @__PURE__ */ new Map();
const PROFILE_CACHE_TTL_MS = 300 * 1e3;
function normalizeTarget(to) {
	const trimmed = to.trim();
	if (!trimmed) throw new Error("Recipient is required for LINE sends");
	const normalized = trimmed.replace(/^line:group:/i, "").replace(/^line:room:/i, "").replace(/^line:user:/i, "").replace(/^line:/i, "");
	if (!normalized) throw new Error("Recipient is required for LINE sends");
	return normalized;
}
function isLineUserChatId(chatId) {
	return /^U/i.test(chatId);
}
function createLineMessagingClient(opts) {
	const account = resolveLineAccount({
		cfg: opts.cfg ?? loadConfig(),
		accountId: opts.accountId
	});
	const token = resolveLineChannelAccessToken(opts.channelAccessToken, account);
	return {
		account,
		client: new messagingApi.MessagingApiClient({ channelAccessToken: token })
	};
}
function createLinePushContext(to, opts) {
	const { account, client } = createLineMessagingClient(opts);
	return {
		account,
		client,
		chatId: normalizeTarget(to)
	};
}
function createTextMessage(text) {
	return {
		type: "text",
		text
	};
}
function createImageMessage(originalContentUrl, previewImageUrl) {
	return {
		type: "image",
		originalContentUrl,
		previewImageUrl: previewImageUrl ?? originalContentUrl
	};
}
function createVideoMessage(originalContentUrl, previewImageUrl, trackingId) {
	return {
		type: "video",
		originalContentUrl,
		previewImageUrl,
		...trackingId ? { trackingId } : {}
	};
}
function createAudioMessage(originalContentUrl, durationMs) {
	return {
		type: "audio",
		originalContentUrl,
		duration: durationMs
	};
}
function createLocationMessage(location) {
	return {
		type: "location",
		title: location.title.slice(0, 100),
		address: location.address.slice(0, 100),
		latitude: location.latitude,
		longitude: location.longitude
	};
}
function logLineHttpError(err, context) {
	if (!err || typeof err !== "object") return;
	const { status, statusText, body } = err;
	if (typeof body === "string") logVerbose(`line: ${context} failed (${status ? `${status} ${statusText ?? ""}`.trim() : "unknown status"}): ${body}`);
}
function recordLineOutboundActivity(accountId) {
	recordChannelActivity({
		channel: "line",
		accountId,
		direction: "outbound"
	});
}
async function pushLineMessages(to, messages, opts = {}, behavior = {}) {
	if (messages.length === 0) throw new Error("Message must be non-empty for LINE sends");
	const { account, client, chatId } = createLinePushContext(to, opts);
	const pushRequest = client.pushMessage({
		to: chatId,
		messages
	});
	if (behavior.errorContext) await pushRequest.catch((err) => {
		logLineHttpError(err, behavior.errorContext);
		throw err;
	});
	else await pushRequest;
	recordLineOutboundActivity(account.accountId);
	if (opts.verbose) logVerbose(behavior.verboseMessage?.(chatId, messages.length) ?? `line: pushed ${messages.length} messages to ${chatId}`);
	return {
		messageId: "push",
		chatId
	};
}
async function replyLineMessages(replyToken, messages, opts = {}, behavior = {}) {
	const { account, client } = createLineMessagingClient(opts);
	await client.replyMessage({
		replyToken,
		messages
	});
	recordLineOutboundActivity(account.accountId);
	if (opts.verbose) logVerbose(behavior.verboseMessage?.(messages.length) ?? `line: replied with ${messages.length} messages`);
}
async function sendMessageLine(to, text, opts = {}) {
	const chatId = normalizeTarget(to);
	const messages = [];
	const mediaUrl = opts.mediaUrl?.trim();
	if (mediaUrl) switch (opts.mediaKind) {
		case "video": {
			const previewImageUrl = opts.previewImageUrl?.trim();
			if (!previewImageUrl) throw new Error("LINE video messages require previewImageUrl to reference an image URL");
			const trackingId = isLineUserChatId(chatId) ? opts.trackingId : void 0;
			messages.push(createVideoMessage(mediaUrl, previewImageUrl, trackingId));
			break;
		}
		case "audio":
			messages.push(createAudioMessage(mediaUrl, opts.durationMs ?? 6e4));
			break;
		default:
			messages.push(createImageMessage(mediaUrl, opts.previewImageUrl?.trim() || mediaUrl));
			break;
	}
	if (text?.trim()) messages.push(createTextMessage(text.trim()));
	if (messages.length === 0) throw new Error("Message must be non-empty for LINE sends");
	if (opts.replyToken) {
		await replyLineMessages(opts.replyToken, messages, opts, { verboseMessage: () => `line: replied to ${chatId}` });
		return {
			messageId: "reply",
			chatId
		};
	}
	return pushLineMessages(chatId, messages, opts, { verboseMessage: (resolvedChatId) => `line: pushed message to ${resolvedChatId}` });
}
async function pushMessageLine(to, text, opts = {}) {
	return sendMessageLine(to, text, {
		...opts,
		replyToken: void 0
	});
}
async function replyMessageLine(replyToken, messages, opts = {}) {
	await replyLineMessages(replyToken, messages, opts);
}
async function pushMessagesLine(to, messages, opts = {}) {
	return pushLineMessages(to, messages, opts, { errorContext: "push message" });
}
function createFlexMessage(altText, contents) {
	return {
		type: "flex",
		altText,
		contents
	};
}
async function pushImageMessage(to, originalContentUrl, previewImageUrl, opts = {}) {
	return pushLineMessages(to, [createImageMessage(originalContentUrl, previewImageUrl)], opts, { verboseMessage: (chatId) => `line: pushed image to ${chatId}` });
}
async function pushLocationMessage(to, location, opts = {}) {
	return pushLineMessages(to, [createLocationMessage(location)], opts, { verboseMessage: (chatId) => `line: pushed location to ${chatId}` });
}
async function pushFlexMessage(to, altText, contents, opts = {}) {
	return pushLineMessages(to, [{
		type: "flex",
		altText: altText.slice(0, 400),
		contents
	}], opts, {
		errorContext: "push flex message",
		verboseMessage: (chatId) => `line: pushed flex message to ${chatId}`
	});
}
async function pushTemplateMessage(to, template, opts = {}) {
	return pushLineMessages(to, [template], opts, { verboseMessage: (chatId) => `line: pushed template message to ${chatId}` });
}
async function pushTextMessageWithQuickReplies(to, text, quickReplyLabels, opts = {}) {
	return pushLineMessages(to, [createTextMessageWithQuickReplies(text, quickReplyLabels)], opts, { verboseMessage: (chatId) => `line: pushed message with quick replies to ${chatId}` });
}
function createQuickReplyItems(labels) {
	return { items: labels.slice(0, 13).map((label) => ({
		type: "action",
		action: {
			type: "message",
			label: label.slice(0, 20),
			text: label
		}
	})) };
}
function createTextMessageWithQuickReplies(text, quickReplyLabels) {
	return {
		type: "text",
		text,
		quickReply: createQuickReplyItems(quickReplyLabels)
	};
}
async function showLoadingAnimation(chatId, opts = {}) {
	const { client } = createLineMessagingClient(opts);
	try {
		await client.showLoadingAnimation({
			chatId: normalizeTarget(chatId),
			loadingSeconds: opts.loadingSeconds ?? 20
		});
		logVerbose(`line: showing loading animation to ${chatId}`);
	} catch (err) {
		logVerbose(`line: loading animation failed (non-fatal): ${String(err)}`);
	}
}
async function getUserProfile(userId, opts = {}) {
	if (opts.useCache ?? true) {
		const cached = userProfileCache.get(userId);
		if (cached && Date.now() - cached.fetchedAt < PROFILE_CACHE_TTL_MS) return {
			displayName: cached.displayName,
			pictureUrl: cached.pictureUrl
		};
	}
	const { client } = createLineMessagingClient(opts);
	try {
		const profile = await client.getProfile(userId);
		const result = {
			displayName: profile.displayName,
			pictureUrl: profile.pictureUrl
		};
		userProfileCache.set(userId, {
			...result,
			fetchedAt: Date.now()
		});
		return result;
	} catch (err) {
		logVerbose(`line: failed to fetch profile for ${userId}: ${String(err)}`);
		return null;
	}
}
async function getUserDisplayName(userId, opts = {}) {
	return (await getUserProfile(userId, opts))?.displayName ?? userId;
}
//#endregion
//#region extensions/line/src/auto-reply-delivery.ts
async function deliverLineAutoReply(params) {
	const { payload, lineData, replyToken, accountId, to, textLimit, deps } = params;
	let replyTokenUsed = params.replyTokenUsed;
	const pushLineMessages = async (messages) => {
		if (messages.length === 0) return;
		for (let i = 0; i < messages.length; i += 5) await deps.pushMessagesLine(to, messages.slice(i, i + 5), { accountId });
	};
	const sendLineMessages = async (messages, allowReplyToken) => {
		if (messages.length === 0) return;
		let remaining = messages;
		if (allowReplyToken && replyToken && !replyTokenUsed) {
			const replyBatch = remaining.slice(0, 5);
			try {
				await deps.replyMessageLine(replyToken, replyBatch, { accountId });
			} catch (err) {
				deps.onReplyError?.(err);
				await pushLineMessages(replyBatch);
			}
			replyTokenUsed = true;
			remaining = remaining.slice(replyBatch.length);
		}
		if (remaining.length > 0) await pushLineMessages(remaining);
	};
	const richMessages = [];
	const hasQuickReplies = Boolean(lineData.quickReplies?.length);
	if (lineData.flexMessage) richMessages.push(deps.createFlexMessage(lineData.flexMessage.altText.slice(0, 400), lineData.flexMessage.contents));
	if (lineData.templateMessage) {
		const templateMsg = deps.buildTemplateMessageFromPayload(lineData.templateMessage);
		if (templateMsg) richMessages.push(templateMsg);
	}
	if (lineData.location) richMessages.push(deps.createLocationMessage(lineData.location));
	const processed = payload.text ? deps.processLineMessage(payload.text) : {
		text: "",
		flexMessages: []
	};
	for (const flexMsg of processed.flexMessages) richMessages.push(deps.createFlexMessage(flexMsg.altText.slice(0, 400), flexMsg.contents));
	const chunks = processed.text ? deps.chunkMarkdownText(processed.text, textLimit) : [];
	const mediaMessages = resolveSendableOutboundReplyParts(payload).mediaUrls.map((url) => url?.trim()).filter((url) => Boolean(url)).map((url) => deps.createImageMessage(url));
	if (chunks.length > 0) {
		const hasRichOrMedia = richMessages.length > 0 || mediaMessages.length > 0;
		if (hasQuickReplies && hasRichOrMedia) try {
			await sendLineMessages([...richMessages, ...mediaMessages], false);
		} catch (err) {
			deps.onReplyError?.(err);
		}
		const { replyTokenUsed: nextReplyTokenUsed } = await deps.sendLineReplyChunks({
			to,
			chunks,
			quickReplies: lineData.quickReplies,
			replyToken,
			replyTokenUsed,
			accountId,
			replyMessageLine: deps.replyMessageLine,
			pushMessageLine: deps.pushMessageLine,
			pushTextMessageWithQuickReplies: deps.pushTextMessageWithQuickReplies,
			createTextMessageWithQuickReplies: deps.createTextMessageWithQuickReplies
		});
		replyTokenUsed = nextReplyTokenUsed;
		if (!hasQuickReplies || !hasRichOrMedia) {
			await sendLineMessages(richMessages, false);
			if (mediaMessages.length > 0) await sendLineMessages(mediaMessages, false);
		}
	} else {
		const combined = [...richMessages, ...mediaMessages];
		if (hasQuickReplies && combined.length > 0) {
			const quickReply = deps.createQuickReplyItems(lineData.quickReplies);
			const targetIndex = replyToken && !replyTokenUsed ? Math.min(4, combined.length - 1) : combined.length - 1;
			combined[targetIndex] = {
				...combined[targetIndex],
				quickReply
			};
		}
		await sendLineMessages(combined, true);
	}
	return { replyTokenUsed };
}
//#endregion
//#region extensions/line/src/group-keys.ts
function resolveLineGroupLookupIds(groupId) {
	const normalized = groupId?.trim();
	if (!normalized) return [];
	if (normalized.startsWith("group:") || normalized.startsWith("room:")) {
		const rawId = normalized.split(":").slice(1).join(":");
		return rawId ? [rawId, normalized] : [normalized];
	}
	return [
		normalized,
		`group:${normalized}`,
		`room:${normalized}`
	];
}
function resolveLineGroupConfigEntry(groups, params) {
	if (!groups) return;
	for (const candidate of resolveLineGroupLookupIds(params.groupId)) {
		const hit = groups[candidate];
		if (hit) return hit;
	}
	for (const candidate of resolveLineGroupLookupIds(params.roomId)) {
		const hit = groups[candidate];
		if (hit) return hit;
	}
	return groups["*"];
}
function resolveLineGroupsConfig(cfg, accountId) {
	const lineConfig = cfg.channels?.line;
	if (!lineConfig) return;
	const normalizedAccountId = normalizeAccountId(accountId);
	return resolveAccountEntry(lineConfig.accounts, normalizedAccountId)?.groups ?? lineConfig.groups;
}
function resolveExactLineGroupConfigKey(params) {
	const groups = resolveLineGroupsConfig(params.cfg, params.accountId);
	if (!groups) return;
	return resolveLineGroupLookupIds(params.groupId).find((candidate) => Object.hasOwn(groups, candidate));
}
function resolveLineGroupHistoryKey(params) {
	return params.groupId?.trim() || params.roomId?.trim() || void 0;
}
//#endregion
//#region extensions/line/src/bot-message-context.ts
function getLineSourceInfo(source) {
	return {
		userId: source.type === "user" ? source.userId : source.type === "group" ? source.userId : source.type === "room" ? source.userId : void 0,
		groupId: source.type === "group" ? source.groupId : void 0,
		roomId: source.type === "room" ? source.roomId : void 0,
		isGroup: source.type === "group" || source.type === "room"
	};
}
function buildPeerId(source) {
	const groupKey = resolveLineGroupHistoryKey({
		groupId: source.type === "group" ? source.groupId : void 0,
		roomId: source.type === "room" ? source.roomId : void 0
	});
	if (groupKey) return groupKey;
	if (source.type === "user" && source.userId) return source.userId;
	return "unknown";
}
async function resolveLineInboundRoute(params) {
	recordChannelActivity({
		channel: "line",
		accountId: params.account.accountId,
		direction: "inbound"
	});
	const { userId, groupId, roomId, isGroup } = getLineSourceInfo(params.source);
	const peerId = buildPeerId(params.source);
	let route = resolveAgentRoute({
		cfg: params.cfg,
		channel: "line",
		accountId: params.account.accountId,
		peer: {
			kind: isGroup ? "group" : "direct",
			id: peerId
		}
	});
	const configuredRoute = resolveConfiguredBindingRoute({
		cfg: params.cfg,
		route,
		conversation: {
			channel: "line",
			accountId: params.account.accountId,
			conversationId: peerId
		}
	});
	let configuredBinding = configuredRoute.bindingResolution;
	const configuredBindingSessionKey = configuredRoute.boundSessionKey ?? "";
	route = configuredRoute.route;
	const boundConversation = getSessionBindingService().resolveByConversation({
		channel: "line",
		accountId: params.account.accountId,
		conversationId: peerId
	});
	const boundSessionKey = boundConversation?.targetSessionKey?.trim();
	if (boundConversation && boundSessionKey) {
		route = {
			...route,
			sessionKey: boundSessionKey,
			agentId: resolveAgentIdFromSessionKey(boundSessionKey) || route.agentId,
			lastRoutePolicy: deriveLastRoutePolicy({
				sessionKey: boundSessionKey,
				mainSessionKey: route.mainSessionKey
			}),
			matchedBy: "binding.channel"
		};
		configuredBinding = null;
		getSessionBindingService().touch(boundConversation.bindingId);
		logVerbose(`line: routed via bound conversation ${peerId} -> ${boundSessionKey}`);
	}
	if (configuredBinding) {
		const ensured = await ensureConfiguredBindingRouteReady({
			cfg: params.cfg,
			bindingResolution: configuredBinding
		});
		if (!ensured.ok) {
			logVerbose(`line: configured ACP binding unavailable for ${peerId} -> ${configuredBindingSessionKey}: ${ensured.error}`);
			throw new Error(`Configured ACP binding unavailable: ${ensured.error}`);
		}
		logVerbose(`line: using configured ACP binding for ${peerId} -> ${configuredBindingSessionKey}`);
	}
	return {
		userId,
		groupId,
		roomId,
		isGroup,
		peerId,
		route
	};
}
const STICKER_PACKAGES = {
	"1": "Moon & James",
	"2": "Cony & Brown",
	"3": "Brown & Friends",
	"4": "Moon Special",
	"789": "LINE Characters",
	"6136": "Cony's Happy Life",
	"6325": "Brown's Life",
	"6359": "Choco",
	"6362": "Sally",
	"6370": "Edward",
	"11537": "Cony",
	"11538": "Brown",
	"11539": "Moon"
};
function describeStickerKeywords(sticker) {
	const keywords = sticker.keywords;
	if (keywords && keywords.length > 0) return keywords.slice(0, 3).join(", ");
	const stickerText = sticker.text;
	if (stickerText) return stickerText;
	return "";
}
function extractMessageText(message) {
	if (message.type === "text") return message.text;
	if (message.type === "location") {
		const loc = message;
		return formatLocationText({
			latitude: loc.latitude,
			longitude: loc.longitude,
			name: loc.title,
			address: loc.address
		}) ?? "";
	}
	if (message.type === "sticker") {
		const sticker = message;
		const packageName = STICKER_PACKAGES[sticker.packageId] ?? "sticker";
		const keywords = describeStickerKeywords(sticker);
		if (keywords) return `[Sent a ${packageName} sticker: ${keywords}]`;
		return `[Sent a ${packageName} sticker]`;
	}
	return "";
}
function extractMediaPlaceholder(message) {
	switch (message.type) {
		case "image": return "<media:image>";
		case "video": return "<media:video>";
		case "audio": return "<media:audio>";
		case "file": return "<media:document>";
		default: return "";
	}
}
function resolveLineConversationLabel(params) {
	return params.isGroup ? params.groupId ? `group:${params.groupId}` : params.roomId ? `room:${params.roomId}` : "unknown-group" : params.senderLabel;
}
function resolveLineAddresses(params) {
	const fromAddress = params.isGroup ? params.groupId ? `line:group:${params.groupId}` : params.roomId ? `line:room:${params.roomId}` : `line:${params.peerId}` : `line:${params.userId ?? params.peerId}`;
	return {
		fromAddress,
		toAddress: params.isGroup ? fromAddress : `line:${params.userId ?? params.peerId}`,
		originatingTo: params.isGroup ? fromAddress : `line:${params.userId ?? params.peerId}`
	};
}
function resolveLineGroupSystemPrompt(groups, source) {
	return resolveLineGroupConfigEntry(groups, {
		groupId: source.groupId,
		roomId: source.roomId
	})?.systemPrompt?.trim() || void 0;
}
async function finalizeLineInboundContext(params) {
	const { fromAddress, toAddress, originatingTo } = resolveLineAddresses({
		isGroup: params.source.isGroup,
		groupId: params.source.groupId,
		roomId: params.source.roomId,
		userId: params.source.userId,
		peerId: params.source.peerId
	});
	const senderId = params.source.userId ?? "unknown";
	const senderLabel = params.source.userId ? `user:${params.source.userId}` : "unknown";
	const conversationLabel = resolveLineConversationLabel({
		isGroup: params.source.isGroup,
		groupId: params.source.groupId,
		roomId: params.source.roomId,
		senderLabel
	});
	const { storePath, envelopeOptions, previousTimestamp } = resolveInboundSessionEnvelopeContext({
		cfg: params.cfg,
		agentId: params.route.agentId,
		sessionKey: params.route.sessionKey
	});
	const body = formatInboundEnvelope({
		channel: "LINE",
		from: conversationLabel,
		timestamp: params.timestamp,
		body: params.rawBody,
		chatType: params.source.isGroup ? "group" : "direct",
		sender: { id: senderId },
		previousTimestamp,
		envelope: envelopeOptions
	});
	const ctxPayload = finalizeInboundContext({
		Body: body,
		BodyForAgent: params.rawBody,
		RawBody: params.rawBody,
		CommandBody: params.rawBody,
		From: fromAddress,
		To: toAddress,
		SessionKey: params.route.sessionKey,
		AccountId: params.route.accountId,
		ChatType: params.source.isGroup ? "group" : "direct",
		ConversationLabel: conversationLabel,
		GroupSubject: params.source.isGroup ? params.source.groupId ?? params.source.roomId : void 0,
		SenderId: senderId,
		Provider: "line",
		Surface: "line",
		MessageSid: params.messageSid,
		Timestamp: params.timestamp,
		MediaPath: params.media.firstPath,
		MediaType: params.media.firstContentType,
		MediaUrl: params.media.firstPath,
		MediaPaths: params.media.paths,
		MediaUrls: params.media.paths,
		MediaTypes: params.media.types,
		...params.locationContext,
		CommandAuthorized: params.commandAuthorized,
		OriginatingChannel: "line",
		OriginatingTo: originatingTo,
		GroupSystemPrompt: params.source.isGroup ? resolveLineGroupSystemPrompt(params.account.config.groups, params.source) : void 0,
		InboundHistory: params.inboundHistory
	});
	const pinnedMainDmOwner = !params.source.isGroup ? resolvePinnedMainDmOwnerFromAllowlist({
		dmScope: params.cfg.session?.dmScope,
		allowFrom: params.account.config.allowFrom,
		normalizeEntry: (entry) => normalizeAllowFrom([entry]).entries[0]
	}) : null;
	await recordInboundSession({
		storePath,
		sessionKey: ctxPayload.SessionKey ?? params.route.sessionKey,
		ctx: ctxPayload,
		updateLastRoute: !params.source.isGroup ? {
			sessionKey: params.route.mainSessionKey,
			channel: "line",
			to: params.source.userId ?? params.source.peerId,
			accountId: params.route.accountId,
			mainDmOwnerPin: pinnedMainDmOwner && params.source.userId ? {
				ownerRecipient: pinnedMainDmOwner,
				senderRecipient: params.source.userId,
				onSkip: ({ ownerRecipient, senderRecipient }) => {
					logVerbose(`line: skip main-session last route for ${senderRecipient} (pinned owner ${ownerRecipient})`);
				}
			} : void 0
		} : void 0,
		onRecordError: (err) => {
			logVerbose(`line: failed updating session meta: ${String(err)}`);
		}
	});
	if (shouldLogVerbose()) {
		const preview = body.slice(0, 200).replace(/\n/g, "\\n");
		const mediaInfo = params.verboseLog.kind === "inbound" && (params.verboseLog.mediaCount ?? 0) > 1 ? ` mediaCount=${params.verboseLog.mediaCount}` : "";
		logVerbose(`${params.verboseLog.kind === "inbound" ? "line inbound" : "line postback"}: from=${ctxPayload.From} len=${body.length}${mediaInfo} preview="${preview}"`);
	}
	return {
		ctxPayload,
		replyToken: params.event.replyToken
	};
}
async function buildLineMessageContext(params) {
	const { event, allMedia, cfg, account, commandAuthorized, groupHistories, historyLimit } = params;
	const source = event.source;
	const { userId, groupId, roomId, isGroup, peerId, route } = await resolveLineInboundRoute({
		source,
		cfg,
		account
	});
	const message = event.message;
	const messageId = message.id;
	const timestamp = event.timestamp;
	const textContent = extractMessageText(message);
	const placeholder = extractMediaPlaceholder(message);
	let rawBody = textContent || placeholder;
	if (!rawBody && allMedia.length > 0) rawBody = `<media:image>${allMedia.length > 1 ? ` (${allMedia.length} images)` : ""}`;
	if (!rawBody && allMedia.length === 0) return null;
	let locationContext;
	if (message.type === "location") {
		const loc = message;
		locationContext = toLocationContext({
			latitude: loc.latitude,
			longitude: loc.longitude,
			name: loc.title,
			address: loc.address
		});
	}
	const historyKey = isGroup ? peerId : void 0;
	const inboundHistory = historyKey && groupHistories && (historyLimit ?? 0) > 0 ? (groupHistories.get(historyKey) ?? []).map((entry) => ({
		sender: entry.sender,
		body: entry.body,
		timestamp: entry.timestamp
	})) : void 0;
	const { ctxPayload } = await finalizeLineInboundContext({
		cfg,
		account,
		event,
		route,
		source: {
			userId,
			groupId,
			roomId,
			isGroup,
			peerId
		},
		rawBody,
		timestamp,
		messageSid: messageId,
		commandAuthorized,
		media: {
			firstPath: allMedia[0]?.path,
			firstContentType: allMedia[0]?.contentType,
			paths: allMedia.length > 0 ? allMedia.map((m) => m.path) : void 0,
			types: allMedia.length > 0 ? allMedia.map((m) => m.contentType).filter(Boolean) : void 0
		},
		locationContext,
		verboseLog: {
			kind: "inbound",
			mediaCount: allMedia.length
		},
		inboundHistory
	});
	return {
		ctxPayload,
		event,
		userId,
		groupId,
		roomId,
		isGroup,
		route,
		replyToken: event.replyToken,
		accountId: account.accountId
	};
}
async function buildLinePostbackContext(params) {
	const { event, cfg, account, commandAuthorized } = params;
	const source = event.source;
	const { userId, groupId, roomId, isGroup, peerId, route } = await resolveLineInboundRoute({
		source,
		cfg,
		account
	});
	const timestamp = event.timestamp;
	const rawData = event.postback?.data?.trim() ?? "";
	if (!rawData) return null;
	let rawBody = rawData;
	if (rawData.includes("line.action=")) {
		const searchParams = new URLSearchParams(rawData);
		const action = searchParams.get("line.action") ?? "";
		const device = searchParams.get("line.device");
		rawBody = device ? `line action ${action} device ${device}` : `line action ${action}`;
	}
	const messageSid = event.replyToken ? `postback:${event.replyToken}` : `postback:${timestamp}`;
	const { ctxPayload } = await finalizeLineInboundContext({
		cfg,
		account,
		event,
		route,
		source: {
			userId,
			groupId,
			roomId,
			isGroup,
			peerId
		},
		rawBody,
		timestamp,
		messageSid,
		commandAuthorized,
		media: {
			firstPath: "",
			firstContentType: void 0,
			paths: void 0,
			types: void 0
		},
		verboseLog: { kind: "postback" }
	});
	return {
		ctxPayload,
		event,
		userId,
		groupId,
		roomId,
		isGroup,
		route,
		replyToken: event.replyToken,
		accountId: account.accountId
	};
}
//#endregion
//#region extensions/line/src/bot-handlers.ts
const LINE_DOWNLOADABLE_MESSAGE_TYPES = new Set([
	"image",
	"video",
	"audio",
	"file"
]);
function isDownloadableLineMessageType(messageType) {
	return LINE_DOWNLOADABLE_MESSAGE_TYPES.has(messageType);
}
const LINE_WEBHOOK_REPLAY_WINDOW_MS = 600 * 1e3;
const LINE_WEBHOOK_REPLAY_MAX_ENTRIES = 4096;
const LINE_WEBHOOK_REPLAY_PRUNE_INTERVAL_MS = 1e3;
function createLineWebhookReplayCache() {
	return {
		seenEvents: /* @__PURE__ */ new Map(),
		inFlightEvents: /* @__PURE__ */ new Map(),
		lastPruneAtMs: 0
	};
}
function pruneLineWebhookReplayCache(cache, nowMs) {
	const minSeenAt = nowMs - LINE_WEBHOOK_REPLAY_WINDOW_MS;
	for (const [key, seenAt] of cache.seenEvents) if (seenAt < minSeenAt) cache.seenEvents.delete(key);
	if (cache.seenEvents.size > LINE_WEBHOOK_REPLAY_MAX_ENTRIES) {
		const deleteCount = cache.seenEvents.size - LINE_WEBHOOK_REPLAY_MAX_ENTRIES;
		let deleted = 0;
		for (const key of cache.seenEvents.keys()) {
			if (deleted >= deleteCount) break;
			cache.seenEvents.delete(key);
			deleted += 1;
		}
	}
}
function buildLineWebhookReplayKey(event, accountId) {
	if (event.type === "message") {
		const messageId = event.message?.id?.trim();
		if (messageId) return {
			key: `${accountId}|message:${messageId}`,
			eventId: `message:${messageId}`
		};
	}
	const eventId = event.webhookEventId?.trim();
	if (!eventId) return null;
	const source = event.source;
	const sourceId = source?.type === "group" ? `group:${source.groupId ?? ""}` : source?.type === "room" ? `room:${source.roomId ?? ""}` : `user:${source?.userId ?? ""}`;
	return {
		key: `${accountId}|${event.type}|${sourceId}|${eventId}`,
		eventId: `event:${eventId}`
	};
}
function getLineReplayCandidate(event, context) {
	const replay = buildLineWebhookReplayKey(event, context.account.accountId);
	const cache = context.replayCache;
	if (!replay || !cache) return null;
	const nowMs = Date.now();
	if (nowMs - cache.lastPruneAtMs >= LINE_WEBHOOK_REPLAY_PRUNE_INTERVAL_MS || cache.seenEvents.size >= LINE_WEBHOOK_REPLAY_MAX_ENTRIES) {
		pruneLineWebhookReplayCache(cache, nowMs);
		cache.lastPruneAtMs = nowMs;
	}
	return {
		key: replay.key,
		eventId: replay.eventId,
		seenAtMs: nowMs,
		cache
	};
}
function shouldSkipLineReplayEvent(candidate) {
	const inFlightResult = candidate.cache.inFlightEvents.get(candidate.key);
	if (inFlightResult) {
		logVerbose(`line: skipped in-flight replayed webhook event ${candidate.eventId}`);
		return {
			skip: true,
			inFlightResult
		};
	}
	if (candidate.cache.seenEvents.has(candidate.key)) {
		logVerbose(`line: skipped replayed webhook event ${candidate.eventId}`);
		return { skip: true };
	}
	return { skip: false };
}
function markLineReplayEventInFlight(candidate) {
	let resolve;
	let reject;
	const promise = new Promise((resolvePromise, rejectPromise) => {
		resolve = resolvePromise;
		reject = rejectPromise;
	});
	promise.catch(() => {});
	candidate.cache.inFlightEvents.set(candidate.key, promise);
	return {
		promise,
		resolve,
		reject
	};
}
function clearLineReplayEventInFlight(candidate) {
	candidate.cache.inFlightEvents.delete(candidate.key);
}
function rememberLineReplayEvent(candidate) {
	candidate.cache.seenEvents.set(candidate.key, candidate.seenAtMs);
}
function resolveLineGroupConfig(params) {
	return resolveLineGroupConfigEntry(params.config.groups, {
		groupId: params.groupId,
		roomId: params.roomId
	});
}
async function sendLinePairingReply(params) {
	const { senderId, replyToken, context } = params;
	const idLabel = (() => {
		try {
			return resolvePairingIdLabel("line");
		} catch {
			return "lineUserId";
		}
	})();
	await createChannelPairingChallengeIssuer({
		channel: "line",
		upsertPairingRequest: async ({ id, meta }) => await upsertChannelPairingRequest({
			channel: "line",
			id,
			accountId: context.account.accountId,
			meta
		})
	})({
		senderId,
		senderIdLine: `Your ${idLabel}: ${senderId}`,
		onCreated: () => {
			logVerbose(`line pairing request sender=${senderId}`);
		},
		sendPairingReply: async (text) => {
			if (replyToken) try {
				await replyMessageLine(replyToken, [{
					type: "text",
					text
				}], {
					accountId: context.account.accountId,
					channelAccessToken: context.account.channelAccessToken
				});
				return;
			} catch (err) {
				logVerbose(`line pairing reply failed for ${senderId}: ${String(err)}`);
			}
			try {
				await pushMessageLine(`line:${senderId}`, text, {
					accountId: context.account.accountId,
					channelAccessToken: context.account.channelAccessToken
				});
			} catch (err) {
				logVerbose(`line pairing reply failed for ${senderId}: ${String(err)}`);
			}
		}
	});
}
async function shouldProcessLineEvent(event, context) {
	const denied = {
		allowed: false,
		commandAuthorized: false
	};
	const { cfg, account } = context;
	const { userId, groupId, roomId, isGroup } = getLineSourceInfo(event.source);
	const senderId = userId ?? "";
	const dmPolicy = account.config.dmPolicy ?? "pairing";
	const storeAllowFrom = await readChannelAllowFromStore("line", void 0, account.accountId).catch(() => []);
	const effectiveDmAllow = normalizeDmAllowFromWithStore({
		allowFrom: account.config.allowFrom,
		storeAllowFrom,
		dmPolicy
	});
	const groupConfig = resolveLineGroupConfig({
		config: account.config,
		groupId,
		roomId
	});
	const groupAllowOverride = groupConfig?.allowFrom;
	const fallbackGroupAllowFrom = account.config.allowFrom?.length ? account.config.allowFrom : void 0;
	const effectiveGroupAllow = normalizeAllowFrom(firstDefined(groupAllowOverride, account.config.groupAllowFrom, fallbackGroupAllowFrom));
	const defaultGroupPolicy = resolveDefaultGroupPolicy(cfg);
	const { groupPolicy, providerMissingFallbackApplied } = resolveAllowlistProviderRuntimeGroupPolicy({
		providerConfigPresent: cfg.channels?.line !== void 0,
		groupPolicy: account.config.groupPolicy,
		defaultGroupPolicy
	});
	warnMissingProviderGroupPolicyFallbackOnce({
		providerMissingFallbackApplied,
		providerKey: "line",
		accountId: account.accountId,
		log: (message) => logVerbose(message)
	});
	if (isGroup) {
		if (groupConfig?.enabled === false) {
			logVerbose(`Blocked line group ${groupId ?? roomId ?? "unknown"} (group disabled)`);
			return denied;
		}
		if (typeof groupAllowOverride !== "undefined") {
			if (!senderId) {
				logVerbose("Blocked line group message (group allowFrom override, no sender ID)");
				return denied;
			}
			if (!isSenderAllowed({
				allow: effectiveGroupAllow,
				senderId
			})) {
				logVerbose(`Blocked line group sender ${senderId} (group allowFrom override)`);
				return denied;
			}
		}
		const senderGroupAccess = evaluateMatchedGroupAccessForPolicy({
			groupPolicy,
			requireMatchInput: true,
			hasMatchInput: Boolean(senderId),
			allowlistConfigured: effectiveGroupAllow.entries.length > 0,
			allowlistMatched: Boolean(senderId) && isSenderAllowed({
				allow: effectiveGroupAllow,
				senderId
			})
		});
		if (!senderGroupAccess.allowed && senderGroupAccess.reason === "disabled") {
			logVerbose("Blocked line group message (groupPolicy: disabled)");
			return denied;
		}
		if (!senderGroupAccess.allowed && senderGroupAccess.reason === "missing_match_input") {
			logVerbose("Blocked line group message (no sender ID, groupPolicy: allowlist)");
			return denied;
		}
		if (!senderGroupAccess.allowed && senderGroupAccess.reason === "empty_allowlist") {
			logVerbose("Blocked line group message (groupPolicy: allowlist, no groupAllowFrom)");
			return denied;
		}
		if (!senderGroupAccess.allowed && senderGroupAccess.reason === "not_allowlisted") {
			logVerbose(`Blocked line group message from ${senderId} (groupPolicy: allowlist)`);
			return denied;
		}
		return {
			allowed: true,
			commandAuthorized: resolveLineCommandAuthorized({
				cfg,
				event,
				senderId,
				allow: effectiveGroupAllow
			})
		};
	}
	if (dmPolicy === "disabled") {
		logVerbose("Blocked line sender (dmPolicy: disabled)");
		return denied;
	}
	if (!(dmPolicy === "open" || isSenderAllowed({
		allow: effectiveDmAllow,
		senderId
	}))) {
		if (dmPolicy === "pairing") {
			if (!senderId) {
				logVerbose("Blocked line sender (dmPolicy: pairing, no sender ID)");
				return denied;
			}
			await sendLinePairingReply({
				senderId,
				replyToken: "replyToken" in event ? event.replyToken : void 0,
				context
			});
		} else logVerbose(`Blocked line sender ${senderId || "unknown"} (dmPolicy: ${dmPolicy})`);
		return denied;
	}
	return {
		allowed: true,
		commandAuthorized: resolveLineCommandAuthorized({
			cfg,
			event,
			senderId,
			allow: effectiveDmAllow
		})
	};
}
function getLineMentionees(message) {
	if (message.type !== "text") return [];
	const mentionees = message.mention?.mentionees;
	return Array.isArray(mentionees) ? mentionees : [];
}
function isLineBotMentioned(message) {
	return getLineMentionees(message).some((m) => m.isSelf === true || m.type === "all");
}
function hasAnyLineMention(message) {
	return getLineMentionees(message).length > 0;
}
function resolveEventRawText(event) {
	if (event.type === "message") {
		const msg = event.message;
		if (msg.type === "text") return msg.text;
		return "";
	}
	if (event.type === "postback") return event.postback?.data?.trim() ?? "";
	return "";
}
function resolveLineCommandAuthorized(params) {
	const senderAllowedForCommands = isSenderAllowed({
		allow: params.allow,
		senderId: params.senderId
	});
	const useAccessGroups = params.cfg.commands?.useAccessGroups !== false;
	const rawText = resolveEventRawText(params.event);
	return resolveControlCommandGate({
		useAccessGroups,
		authorizers: [{
			configured: params.allow.hasEntries,
			allowed: senderAllowedForCommands
		}],
		allowTextCommands: true,
		hasControlCommand: hasControlCommand(rawText, params.cfg)
	}).commandAuthorized;
}
async function handleMessageEvent(event, context) {
	const { cfg, account, runtime, mediaMaxBytes, processMessage } = context;
	const message = event.message;
	const decision = await shouldProcessLineEvent(event, context);
	if (!decision.allowed) return;
	const { isGroup, groupId, roomId } = getLineSourceInfo(event.source);
	if (isGroup) {
		const requireMention = resolveLineGroupConfig({
			config: account.config,
			groupId,
			roomId
		})?.requireMention !== false;
		const rawText = message.type === "text" ? message.text : "";
		const peerId = groupId ?? roomId ?? event.source.userId ?? "unknown";
		const { agentId } = resolveAgentRoute({
			cfg,
			channel: "line",
			accountId: account.accountId,
			peer: {
				kind: "group",
				id: peerId
			}
		});
		const mentionRegexes = buildMentionRegexes(cfg, agentId);
		const wasMentionedByNative = isLineBotMentioned(message);
		const wasMentionedByPattern = message.type === "text" ? matchesMentionPatterns(rawText, mentionRegexes) : false;
		const wasMentioned = wasMentionedByNative || wasMentionedByPattern;
		if (resolveMentionGatingWithBypass({
			isGroup: true,
			requireMention,
			canDetectMention: message.type === "text",
			wasMentioned,
			hasAnyMention: hasAnyLineMention(message),
			allowTextCommands: true,
			hasControlCommand: hasControlCommand(rawText, cfg),
			commandAuthorized: decision.commandAuthorized
		}).shouldSkip) {
			logVerbose(`line: skipping group message (requireMention, not mentioned)`);
			const historyKey = groupId ?? roomId;
			const senderId = event.source.type === "group" || event.source.type === "room" ? event.source.userId ?? "unknown" : "unknown";
			if (historyKey && context.groupHistories) recordPendingHistoryEntryIfEnabled({
				historyMap: context.groupHistories,
				historyKey,
				limit: context.historyLimit ?? 50,
				entry: {
					sender: `user:${senderId}`,
					body: rawText || `<${message.type}>`,
					timestamp: event.timestamp
				}
			});
			return;
		}
	}
	const allMedia = [];
	if (isDownloadableLineMessageType(message.type)) try {
		const media = await downloadLineMedia(message.id, account.channelAccessToken, mediaMaxBytes);
		allMedia.push({
			path: media.path,
			contentType: media.contentType
		});
	} catch (err) {
		const errMsg = String(err);
		if (errMsg.includes("exceeds") && errMsg.includes("limit")) logVerbose(`line: media exceeds size limit for message ${message.id}`);
		else runtime.error?.(danger(`line: failed to download media: ${errMsg}`));
	}
	const messageContext = await buildLineMessageContext({
		event,
		allMedia,
		cfg,
		account,
		commandAuthorized: decision.commandAuthorized,
		groupHistories: context.groupHistories,
		historyLimit: context.historyLimit ?? 50
	});
	if (!messageContext) {
		logVerbose("line: skipping empty message");
		return;
	}
	await processMessage(messageContext);
	if (isGroup && context.groupHistories) {
		const historyKey = groupId ?? roomId;
		if (historyKey && context.groupHistories.has(historyKey)) clearHistoryEntriesIfEnabled({
			historyMap: context.groupHistories,
			historyKey,
			limit: context.historyLimit ?? 50
		});
	}
}
async function handleFollowEvent(event, _context) {
	logVerbose(`line: user ${(event.source.type === "user" ? event.source.userId : void 0) ?? "unknown"} followed`);
}
async function handleUnfollowEvent(event, _context) {
	logVerbose(`line: user ${(event.source.type === "user" ? event.source.userId : void 0) ?? "unknown"} unfollowed`);
}
async function handleJoinEvent(event, _context) {
	const groupId = event.source.type === "group" ? event.source.groupId : void 0;
	const roomId = event.source.type === "room" ? event.source.roomId : void 0;
	logVerbose(`line: bot joined ${groupId ? `group ${groupId}` : `room ${roomId}`}`);
}
async function handleLeaveEvent(event, _context) {
	const groupId = event.source.type === "group" ? event.source.groupId : void 0;
	const roomId = event.source.type === "room" ? event.source.roomId : void 0;
	logVerbose(`line: bot left ${groupId ? `group ${groupId}` : `room ${roomId}`}`);
}
async function handlePostbackEvent(event, context) {
	const data = event.postback.data;
	logVerbose(`line: received postback: ${data}`);
	const decision = await shouldProcessLineEvent(event, context);
	if (!decision.allowed) return;
	const postbackContext = await buildLinePostbackContext({
		event,
		cfg: context.cfg,
		account: context.account,
		commandAuthorized: decision.commandAuthorized
	});
	if (!postbackContext) return;
	await context.processMessage(postbackContext);
}
async function handleLineWebhookEvents(events, context) {
	let firstError;
	for (const event of events) {
		const replayCandidate = getLineReplayCandidate(event, context);
		const replaySkip = replayCandidate ? shouldSkipLineReplayEvent(replayCandidate) : null;
		if (replaySkip?.skip) {
			if (replaySkip.inFlightResult) try {
				await replaySkip.inFlightResult;
			} catch (err) {
				context.runtime.error?.(danger(`line: replayed in-flight event failed: ${String(err)}`));
				firstError ??= err;
			}
			continue;
		}
		const inFlightReservation = replayCandidate ? markLineReplayEventInFlight(replayCandidate) : null;
		try {
			switch (event.type) {
				case "message":
					await handleMessageEvent(event, context);
					break;
				case "follow":
					await handleFollowEvent(event, context);
					break;
				case "unfollow":
					await handleUnfollowEvent(event, context);
					break;
				case "join":
					await handleJoinEvent(event, context);
					break;
				case "leave":
					await handleLeaveEvent(event, context);
					break;
				case "postback":
					await handlePostbackEvent(event, context);
					break;
				default: logVerbose(`line: unhandled event type: ${event.type}`);
			}
			if (replayCandidate) {
				rememberLineReplayEvent(replayCandidate);
				inFlightReservation?.resolve();
				clearLineReplayEventInFlight(replayCandidate);
			}
		} catch (err) {
			if (replayCandidate) {
				inFlightReservation?.reject(err);
				clearLineReplayEventInFlight(replayCandidate);
			}
			context.runtime.error?.(danger(`line: event handler failed: ${String(err)}`));
			firstError ??= err;
		}
	}
	if (firstError) throw firstError;
}
//#endregion
//#region extensions/line/src/signature.ts
function validateLineSignature(body, signature, channelSecret) {
	const hash = crypto.createHmac("SHA256", channelSecret).update(body).digest("base64");
	const hashBuffer = Buffer.from(hash);
	const signatureBuffer = Buffer.from(signature);
	const maxLen = Math.max(hashBuffer.length, signatureBuffer.length);
	const paddedHash = Buffer.alloc(maxLen);
	const paddedSig = Buffer.alloc(maxLen);
	hashBuffer.copy(paddedHash);
	signatureBuffer.copy(paddedSig);
	const timingResult = crypto.timingSafeEqual(paddedHash, paddedSig);
	return hashBuffer.length === signatureBuffer.length && timingResult;
}
//#endregion
//#region extensions/line/src/webhook-utils.ts
function parseLineWebhookBody(rawBody) {
	try {
		return JSON.parse(rawBody);
	} catch {
		return null;
	}
}
//#endregion
//#region extensions/line/src/webhook.ts
const LINE_WEBHOOK_MAX_RAW_BODY_BYTES = 64 * 1024;
function readRawBody(req) {
	const rawBody = req.rawBody ?? (typeof req.body === "string" || Buffer.isBuffer(req.body) ? req.body : null);
	if (!rawBody) return null;
	return Buffer.isBuffer(rawBody) ? rawBody.toString("utf-8") : rawBody;
}
function parseWebhookBody(rawBody) {
	if (!rawBody) return null;
	return parseLineWebhookBody(rawBody);
}
function createLineWebhookMiddleware(options) {
	const { channelSecret, onEvents, runtime } = options;
	return async (req, res, _next) => {
		try {
			const signature = req.headers["x-line-signature"];
			if (!signature || typeof signature !== "string") {
				res.status(400).json({ error: "Missing X-Line-Signature header" });
				return;
			}
			const rawBody = readRawBody(req);
			if (!rawBody) {
				res.status(400).json({ error: "Missing raw request body for signature verification" });
				return;
			}
			if (Buffer.byteLength(rawBody, "utf-8") > LINE_WEBHOOK_MAX_RAW_BODY_BYTES) {
				res.status(413).json({ error: "Payload too large" });
				return;
			}
			if (!validateLineSignature(rawBody, signature, channelSecret)) {
				logVerbose("line: webhook signature validation failed");
				res.status(401).json({ error: "Invalid signature" });
				return;
			}
			const body = parseWebhookBody(rawBody);
			if (!body) {
				res.status(400).json({ error: "Invalid webhook payload" });
				return;
			}
			if (body.events && body.events.length > 0) {
				logVerbose(`line: received ${body.events.length} webhook events`);
				await onEvents(body);
			}
			res.status(200).json({ status: "ok" });
		} catch (err) {
			runtime?.error?.(danger(`line webhook error: ${String(err)}`));
			if (!res.headersSent) res.status(500).json({ error: "Internal server error" });
		}
	};
}
function startLineWebhook(options) {
	const channelSecret = typeof options.channelSecret === "string" ? options.channelSecret.trim() : "";
	if (!channelSecret) throw new Error("LINE webhook mode requires a non-empty channel secret. Set channels.line.channelSecret in your config.");
	return {
		path: options.path ?? "/line/webhook",
		handler: createLineWebhookMiddleware({
			channelSecret,
			onEvents: options.onEvents,
			runtime: options.runtime
		})
	};
}
//#endregion
//#region extensions/line/src/bot.ts
function createLineBot(opts) {
	const runtime = opts.runtime ?? createNonExitingRuntime();
	const cfg = opts.config ?? loadConfig();
	const account = resolveLineAccount({
		cfg,
		accountId: opts.accountId
	});
	const mediaMaxBytes = (opts.mediaMaxMb ?? account.config.mediaMaxMb ?? 10) * 1024 * 1024;
	const processMessage = opts.onMessage ?? (async () => {
		logVerbose("line: no message handler configured");
	});
	const replayCache = createLineWebhookReplayCache();
	const groupHistories = /* @__PURE__ */ new Map();
	const handleWebhook = async (body) => {
		if (!body.events || body.events.length === 0) return;
		await handleLineWebhookEvents(body.events, {
			cfg,
			account,
			runtime,
			mediaMaxBytes,
			processMessage,
			replayCache,
			groupHistories,
			historyLimit: cfg.messages?.groupChat?.historyLimit ?? 50
		});
	};
	return {
		handleWebhook,
		account
	};
}
//#endregion
//#region extensions/line/src/flex-templates/common.ts
function attachFooterText(bubble, footer) {
	bubble.footer = {
		type: "box",
		layout: "vertical",
		contents: [{
			type: "text",
			text: footer,
			size: "xs",
			color: "#AAAAAA",
			wrap: true,
			align: "center"
		}],
		paddingAll: "lg",
		backgroundColor: "#FAFAFA"
	};
}
//#endregion
//#region extensions/line/src/flex-templates/basic-cards.ts
/**
* Create an info card with title, body, and optional footer
*
* Editorial design: Clean hierarchy with accent bar, generous spacing,
* and subtle background zones for visual separation.
*/
function createInfoCard(title, body, footer) {
	const bubble = {
		type: "bubble",
		size: "mega",
		body: {
			type: "box",
			layout: "vertical",
			contents: [{
				type: "box",
				layout: "horizontal",
				contents: [{
					type: "box",
					layout: "vertical",
					contents: [],
					width: "4px",
					backgroundColor: "#06C755",
					cornerRadius: "2px"
				}, {
					type: "text",
					text: title,
					weight: "bold",
					size: "xl",
					color: "#111111",
					wrap: true,
					flex: 1,
					margin: "lg"
				}]
			}, {
				type: "box",
				layout: "vertical",
				contents: [{
					type: "text",
					text: body,
					size: "md",
					color: "#444444",
					wrap: true,
					lineSpacing: "6px"
				}],
				margin: "xl",
				paddingAll: "lg",
				backgroundColor: "#F8F9FA",
				cornerRadius: "lg"
			}],
			paddingAll: "xl",
			backgroundColor: "#FFFFFF"
		}
	};
	if (footer) attachFooterText(bubble, footer);
	return bubble;
}
/**
* Create a list card with title and multiple items
*
* Editorial design: Numbered/bulleted list with clear visual hierarchy,
* accent dots for each item, and generous spacing.
*/
function createListCard(title, items) {
	const itemContents = items.slice(0, 8).map((item, index) => {
		const itemContents = [{
			type: "text",
			text: item.title,
			size: "md",
			weight: "bold",
			color: "#1a1a1a",
			wrap: true
		}];
		if (item.subtitle) itemContents.push({
			type: "text",
			text: item.subtitle,
			size: "sm",
			color: "#888888",
			wrap: true,
			margin: "xs"
		});
		const itemBox = {
			type: "box",
			layout: "horizontal",
			contents: [{
				type: "box",
				layout: "vertical",
				contents: [{
					type: "box",
					layout: "vertical",
					contents: [],
					width: "8px",
					height: "8px",
					backgroundColor: index === 0 ? "#06C755" : "#DDDDDD",
					cornerRadius: "4px"
				}],
				width: "20px",
				alignItems: "center",
				paddingTop: "sm"
			}, {
				type: "box",
				layout: "vertical",
				contents: itemContents,
				flex: 1
			}],
			margin: index > 0 ? "lg" : void 0
		};
		if (item.action) itemBox.action = item.action;
		return itemBox;
	});
	return {
		type: "bubble",
		size: "mega",
		body: {
			type: "box",
			layout: "vertical",
			contents: [
				{
					type: "text",
					text: title,
					weight: "bold",
					size: "xl",
					color: "#111111",
					wrap: true
				},
				{
					type: "separator",
					margin: "lg",
					color: "#EEEEEE"
				},
				{
					type: "box",
					layout: "vertical",
					contents: itemContents,
					margin: "lg"
				}
			],
			paddingAll: "xl",
			backgroundColor: "#FFFFFF"
		}
	};
}
/**
* Create an image card with image, title, and optional body text
*/
function createImageCard(imageUrl, title, body, options) {
	const bubble = {
		type: "bubble",
		hero: {
			type: "image",
			url: imageUrl,
			size: "full",
			aspectRatio: options?.aspectRatio ?? "20:13",
			aspectMode: options?.aspectMode ?? "cover",
			action: options?.action
		},
		body: {
			type: "box",
			layout: "vertical",
			contents: [{
				type: "text",
				text: title,
				weight: "bold",
				size: "xl",
				wrap: true
			}],
			paddingAll: "lg"
		}
	};
	if (body && bubble.body) bubble.body.contents.push({
		type: "text",
		text: body,
		size: "md",
		wrap: true,
		margin: "md",
		color: "#666666"
	});
	return bubble;
}
/**
* Create an action card with title, body, and action buttons
*/
function createActionCard(title, body, actions, options) {
	const bubble = {
		type: "bubble",
		body: {
			type: "box",
			layout: "vertical",
			contents: [{
				type: "text",
				text: title,
				weight: "bold",
				size: "xl",
				wrap: true
			}, {
				type: "text",
				text: body,
				size: "md",
				wrap: true,
				margin: "md",
				color: "#666666"
			}],
			paddingAll: "lg"
		},
		footer: {
			type: "box",
			layout: "vertical",
			contents: actions.slice(0, 4).map((action, index) => ({
				type: "button",
				action: action.action,
				style: index === 0 ? "primary" : "secondary",
				margin: index > 0 ? "sm" : void 0
			})),
			paddingAll: "md"
		}
	};
	if (options?.imageUrl) bubble.hero = {
		type: "image",
		url: options.imageUrl,
		size: "full",
		aspectRatio: options.aspectRatio ?? "20:13",
		aspectMode: "cover"
	};
	return bubble;
}
/**
* Create a carousel container from multiple bubbles
* LINE allows max 12 bubbles in a carousel
*/
function createCarousel(bubbles) {
	return {
		type: "carousel",
		contents: bubbles.slice(0, 12)
	};
}
/**
* Create a notification bubble (for alerts, status updates)
*
* Editorial design: Bold status indicator with accent color,
* clear typography, optional icon for context.
*/
function createNotificationBubble(text, options) {
	const typeColors = {
		info: {
			accent: "#3B82F6",
			bg: "#EFF6FF"
		},
		success: {
			accent: "#06C755",
			bg: "#F0FDF4"
		},
		warning: {
			accent: "#F59E0B",
			bg: "#FFFBEB"
		},
		error: {
			accent: "#EF4444",
			bg: "#FEF2F2"
		}
	}[options?.type ?? "info"];
	const contents = [];
	contents.push({
		type: "box",
		layout: "vertical",
		contents: [],
		width: "4px",
		backgroundColor: typeColors.accent,
		cornerRadius: "2px"
	});
	const textContents = [];
	if (options?.title) textContents.push({
		type: "text",
		text: options.title,
		size: "md",
		weight: "bold",
		color: "#111111",
		wrap: true
	});
	textContents.push({
		type: "text",
		text,
		size: options?.title ? "sm" : "md",
		color: options?.title ? "#666666" : "#333333",
		wrap: true,
		margin: options?.title ? "sm" : void 0
	});
	contents.push({
		type: "box",
		layout: "vertical",
		contents: textContents,
		flex: 1,
		paddingStart: "lg"
	});
	return {
		type: "bubble",
		body: {
			type: "box",
			layout: "horizontal",
			contents,
			paddingAll: "xl",
			backgroundColor: typeColors.bg
		}
	};
}
//#endregion
//#region extensions/line/src/flex-templates/schedule-cards.ts
function buildTitleSubtitleHeader(params) {
	const { title, subtitle } = params;
	const headerContents = [{
		type: "text",
		text: title,
		weight: "bold",
		size: "xl",
		color: "#111111",
		wrap: true
	}];
	if (subtitle) headerContents.push({
		type: "text",
		text: subtitle,
		size: "sm",
		color: "#888888",
		margin: "sm",
		wrap: true
	});
	return headerContents;
}
function buildCardHeaderSections(headerContents) {
	return [{
		type: "box",
		layout: "vertical",
		contents: headerContents,
		paddingBottom: "lg"
	}, {
		type: "separator",
		color: "#EEEEEE"
	}];
}
function createMegaBubbleWithFooter(params) {
	const bubble = {
		type: "bubble",
		size: "mega",
		body: {
			type: "box",
			layout: "vertical",
			contents: params.bodyContents,
			paddingAll: "xl",
			backgroundColor: "#FFFFFF"
		}
	};
	if (params.footer) attachFooterText(bubble, params.footer);
	return bubble;
}
/**
* Create a receipt/summary card (for orders, transactions, data tables)
*
* Editorial design: Clean table layout with alternating row backgrounds,
* prominent total section, and clear visual hierarchy.
*/
function createReceiptCard(params) {
	const { title, subtitle, items, total, footer } = params;
	const itemRows = items.slice(0, 12).map((item, index) => ({
		type: "box",
		layout: "horizontal",
		contents: [{
			type: "text",
			text: item.name,
			size: "sm",
			color: item.highlight ? "#111111" : "#666666",
			weight: item.highlight ? "bold" : "regular",
			flex: 3,
			wrap: true
		}, {
			type: "text",
			text: item.value,
			size: "sm",
			color: item.highlight ? "#06C755" : "#333333",
			weight: item.highlight ? "bold" : "regular",
			flex: 2,
			align: "end",
			wrap: true
		}],
		paddingAll: "md",
		backgroundColor: index % 2 === 0 ? "#FFFFFF" : "#FAFAFA"
	}));
	const bodyContents = [...buildCardHeaderSections(buildTitleSubtitleHeader({
		title,
		subtitle
	})), {
		type: "box",
		layout: "vertical",
		contents: itemRows,
		margin: "md",
		cornerRadius: "md",
		borderWidth: "light",
		borderColor: "#EEEEEE"
	}];
	if (total) bodyContents.push({
		type: "box",
		layout: "horizontal",
		contents: [{
			type: "text",
			text: total.label,
			size: "lg",
			weight: "bold",
			color: "#111111",
			flex: 2
		}, {
			type: "text",
			text: total.value,
			size: "xl",
			weight: "bold",
			color: "#06C755",
			flex: 2,
			align: "end"
		}],
		margin: "xl",
		paddingAll: "lg",
		backgroundColor: "#F0FDF4",
		cornerRadius: "lg"
	});
	return createMegaBubbleWithFooter({
		bodyContents,
		footer
	});
}
/**
* Create a calendar event card (for meetings, appointments, reminders)
*
* Editorial design: Date as hero, strong typographic hierarchy,
* color-blocked zones, full text wrapping for readability.
*/
function createEventCard(params) {
	const { title, date, time, location, description, calendar, isAllDay, action } = params;
	const dateBlock = {
		type: "box",
		layout: "vertical",
		contents: [{
			type: "text",
			text: date.toUpperCase(),
			size: "sm",
			weight: "bold",
			color: "#06C755",
			wrap: true
		}, {
			type: "text",
			text: isAllDay ? "ALL DAY" : time ?? "",
			size: "xxl",
			weight: "bold",
			color: "#111111",
			wrap: true,
			margin: "xs"
		}],
		paddingBottom: "lg",
		borderWidth: "none"
	};
	if (!time && !isAllDay) dateBlock.contents = [{
		type: "text",
		text: date,
		size: "xl",
		weight: "bold",
		color: "#111111",
		wrap: true
	}];
	const bodyContents = [dateBlock, {
		type: "box",
		layout: "horizontal",
		contents: [{
			type: "box",
			layout: "vertical",
			contents: [],
			width: "4px",
			backgroundColor: "#06C755",
			cornerRadius: "2px"
		}, {
			type: "box",
			layout: "vertical",
			contents: [{
				type: "text",
				text: title,
				size: "lg",
				weight: "bold",
				color: "#1a1a1a",
				wrap: true
			}, ...calendar ? [{
				type: "text",
				text: calendar,
				size: "xs",
				color: "#888888",
				margin: "sm",
				wrap: true
			}] : []],
			flex: 1,
			paddingStart: "lg"
		}],
		paddingTop: "lg",
		paddingBottom: "lg",
		borderWidth: "light",
		borderColor: "#EEEEEE"
	}];
	if (location || description) {
		const detailItems = [];
		if (location) detailItems.push({
			type: "box",
			layout: "horizontal",
			contents: [{
				type: "text",
				text: "📍",
				size: "sm",
				flex: 0
			}, {
				type: "text",
				text: location,
				size: "sm",
				color: "#444444",
				margin: "md",
				flex: 1,
				wrap: true
			}],
			alignItems: "flex-start"
		});
		if (description) detailItems.push({
			type: "text",
			text: description,
			size: "sm",
			color: "#666666",
			wrap: true,
			margin: location ? "lg" : "none"
		});
		bodyContents.push({
			type: "box",
			layout: "vertical",
			contents: detailItems,
			margin: "lg",
			paddingAll: "lg",
			backgroundColor: "#F8F9FA",
			cornerRadius: "lg"
		});
	}
	return {
		type: "bubble",
		size: "mega",
		body: {
			type: "box",
			layout: "vertical",
			contents: bodyContents,
			paddingAll: "xl",
			backgroundColor: "#FFFFFF",
			action
		}
	};
}
/**
* Create a calendar agenda card showing multiple events
*
* Editorial timeline design: Time-focused left column with event details
* on the right. Visual accent bars indicate event priority/recency.
*/
function createAgendaCard(params) {
	const { title, subtitle, events, footer } = params;
	const headerContents = buildTitleSubtitleHeader({
		title,
		subtitle
	});
	const eventItems = events.slice(0, 6).map((event, index) => {
		const isActive = event.isNow || index === 0;
		const accentColor = isActive ? "#06C755" : "#E5E5E5";
		const timeColumn = {
			type: "box",
			layout: "vertical",
			contents: [{
				type: "text",
				text: event.time ?? "—",
				size: "sm",
				weight: isActive ? "bold" : "regular",
				color: isActive ? "#06C755" : "#666666",
				align: "end",
				wrap: true
			}],
			width: "65px",
			justifyContent: "flex-start"
		};
		const dotColumn = {
			type: "box",
			layout: "vertical",
			contents: [{
				type: "box",
				layout: "vertical",
				contents: [],
				width: "10px",
				height: "10px",
				backgroundColor: accentColor,
				cornerRadius: "5px"
			}],
			width: "24px",
			alignItems: "center",
			justifyContent: "flex-start",
			paddingTop: "xs"
		};
		const detailContents = [{
			type: "text",
			text: event.title,
			size: "md",
			weight: "bold",
			color: "#1a1a1a",
			wrap: true
		}];
		const secondaryParts = [];
		if (event.location) secondaryParts.push(event.location);
		if (event.calendar) secondaryParts.push(event.calendar);
		if (secondaryParts.length > 0) detailContents.push({
			type: "text",
			text: secondaryParts.join(" · "),
			size: "xs",
			color: "#888888",
			wrap: true,
			margin: "xs"
		});
		return {
			type: "box",
			layout: "horizontal",
			contents: [
				timeColumn,
				dotColumn,
				{
					type: "box",
					layout: "vertical",
					contents: detailContents,
					flex: 1
				}
			],
			margin: index > 0 ? "xl" : void 0,
			alignItems: "flex-start"
		};
	});
	return createMegaBubbleWithFooter({
		bodyContents: [...buildCardHeaderSections(headerContents), {
			type: "box",
			layout: "vertical",
			contents: eventItems,
			paddingTop: "xl"
		}],
		footer
	});
}
//#endregion
//#region extensions/line/src/flex-templates/media-control-cards.ts
/**
* Create a media player card for Sonos, Spotify, Apple Music, etc.
*
* Editorial design: Album art hero with gradient overlay for text,
* prominent now-playing indicator, refined playback controls.
*/
function createMediaPlayerCard(params) {
	const { title, subtitle, source, imageUrl, isPlaying, progress, controls, extraActions } = params;
	const trackInfo = [{
		type: "text",
		text: title,
		weight: "bold",
		size: "xl",
		color: "#111111",
		wrap: true
	}];
	if (subtitle) trackInfo.push({
		type: "text",
		text: subtitle,
		size: "md",
		color: "#666666",
		wrap: true,
		margin: "sm"
	});
	const statusItems = [];
	if (isPlaying !== void 0) statusItems.push({
		type: "box",
		layout: "horizontal",
		contents: [{
			type: "box",
			layout: "vertical",
			contents: [],
			width: "8px",
			height: "8px",
			backgroundColor: isPlaying ? "#06C755" : "#CCCCCC",
			cornerRadius: "4px"
		}, {
			type: "text",
			text: isPlaying ? "Now Playing" : "Paused",
			size: "xs",
			color: isPlaying ? "#06C755" : "#888888",
			weight: "bold",
			margin: "sm"
		}],
		alignItems: "center"
	});
	if (source) statusItems.push({
		type: "text",
		text: source,
		size: "xs",
		color: "#AAAAAA",
		margin: statusItems.length > 0 ? "lg" : void 0
	});
	if (progress) statusItems.push({
		type: "text",
		text: progress,
		size: "xs",
		color: "#888888",
		align: "end",
		flex: 1
	});
	const bodyContents = [{
		type: "box",
		layout: "vertical",
		contents: trackInfo
	}];
	if (statusItems.length > 0) bodyContents.push({
		type: "box",
		layout: "horizontal",
		contents: statusItems,
		margin: "lg",
		alignItems: "center"
	});
	const bubble = {
		type: "bubble",
		size: "mega",
		body: {
			type: "box",
			layout: "vertical",
			contents: bodyContents,
			paddingAll: "xl",
			backgroundColor: "#FFFFFF"
		}
	};
	if (imageUrl) bubble.hero = {
		type: "image",
		url: imageUrl,
		size: "full",
		aspectRatio: "1:1",
		aspectMode: "cover"
	};
	if (controls || extraActions?.length) {
		const footerContents = [];
		if (controls) {
			const controlButtons = [];
			if (controls.previous) controlButtons.push({
				type: "button",
				action: {
					type: "postback",
					label: "⏮",
					data: controls.previous.data
				},
				style: "secondary",
				flex: 1,
				height: "sm"
			});
			if (controls.play) controlButtons.push({
				type: "button",
				action: {
					type: "postback",
					label: "▶",
					data: controls.play.data
				},
				style: isPlaying ? "secondary" : "primary",
				flex: 1,
				height: "sm",
				margin: controls.previous ? "md" : void 0
			});
			if (controls.pause) controlButtons.push({
				type: "button",
				action: {
					type: "postback",
					label: "⏸",
					data: controls.pause.data
				},
				style: isPlaying ? "primary" : "secondary",
				flex: 1,
				height: "sm",
				margin: controlButtons.length > 0 ? "md" : void 0
			});
			if (controls.next) controlButtons.push({
				type: "button",
				action: {
					type: "postback",
					label: "⏭",
					data: controls.next.data
				},
				style: "secondary",
				flex: 1,
				height: "sm",
				margin: controlButtons.length > 0 ? "md" : void 0
			});
			if (controlButtons.length > 0) footerContents.push({
				type: "box",
				layout: "horizontal",
				contents: controlButtons
			});
		}
		if (extraActions?.length) footerContents.push({
			type: "box",
			layout: "horizontal",
			contents: extraActions.slice(0, 2).map((action, index) => ({
				type: "button",
				action: {
					type: "postback",
					label: action.label.slice(0, 15),
					data: action.data
				},
				style: "secondary",
				flex: 1,
				height: "sm",
				margin: index > 0 ? "md" : void 0
			})),
			margin: "md"
		});
		if (footerContents.length > 0) bubble.footer = {
			type: "box",
			layout: "vertical",
			contents: footerContents,
			paddingAll: "lg",
			backgroundColor: "#FAFAFA"
		};
	}
	return bubble;
}
/**
* Create an Apple TV remote card with a D-pad and control rows.
*/
function createAppleTvRemoteCard(params) {
	const { deviceName, status, actionData } = params;
	const headerContents = [{
		type: "text",
		text: deviceName,
		weight: "bold",
		size: "xl",
		color: "#111111",
		wrap: true
	}];
	if (status) headerContents.push({
		type: "text",
		text: status,
		size: "sm",
		color: "#666666",
		wrap: true,
		margin: "sm"
	});
	const makeButton = (label, data, style = "secondary") => ({
		type: "button",
		action: {
			type: "postback",
			label,
			data
		},
		style,
		height: "sm",
		flex: 1
	});
	const dpadRows = [
		{
			type: "box",
			layout: "horizontal",
			contents: [
				{ type: "filler" },
				makeButton("↑", actionData.up),
				{ type: "filler" }
			]
		},
		{
			type: "box",
			layout: "horizontal",
			contents: [
				makeButton("←", actionData.left),
				makeButton("OK", actionData.select, "primary"),
				makeButton("→", actionData.right)
			],
			margin: "md"
		},
		{
			type: "box",
			layout: "horizontal",
			contents: [
				{ type: "filler" },
				makeButton("↓", actionData.down),
				{ type: "filler" }
			],
			margin: "md"
		}
	];
	const menuRow = {
		type: "box",
		layout: "horizontal",
		contents: [makeButton("Menu", actionData.menu), makeButton("Home", actionData.home)],
		margin: "lg"
	};
	const playbackRow = {
		type: "box",
		layout: "horizontal",
		contents: [makeButton("Play", actionData.play), makeButton("Pause", actionData.pause)],
		margin: "md"
	};
	const volumeRow = {
		type: "box",
		layout: "horizontal",
		contents: [
			makeButton("Vol +", actionData.volumeUp),
			makeButton("Mute", actionData.mute),
			makeButton("Vol -", actionData.volumeDown)
		],
		margin: "md"
	};
	return {
		type: "bubble",
		size: "mega",
		body: {
			type: "box",
			layout: "vertical",
			contents: [
				{
					type: "box",
					layout: "vertical",
					contents: headerContents
				},
				{
					type: "separator",
					margin: "lg",
					color: "#EEEEEE"
				},
				...dpadRows,
				menuRow,
				playbackRow,
				volumeRow
			],
			paddingAll: "xl",
			backgroundColor: "#FFFFFF"
		}
	};
}
/**
* Create a device control card for Apple TV, smart home devices, etc.
*
* Editorial design: Device-focused header with status indicator,
* clean control grid with clear visual hierarchy.
*/
function createDeviceControlCard(params) {
	const { deviceName, deviceType, status, isOnline, imageUrl, controls } = params;
	const headerContents = [{
		type: "box",
		layout: "horizontal",
		contents: [{
			type: "box",
			layout: "vertical",
			contents: [],
			width: "10px",
			height: "10px",
			backgroundColor: isOnline !== false ? "#06C755" : "#FF5555",
			cornerRadius: "5px"
		}, {
			type: "text",
			text: deviceName,
			weight: "bold",
			size: "xl",
			color: "#111111",
			wrap: true,
			flex: 1,
			margin: "md"
		}],
		alignItems: "center"
	}];
	if (deviceType) headerContents.push({
		type: "text",
		text: deviceType,
		size: "sm",
		color: "#888888",
		margin: "sm"
	});
	if (status) headerContents.push({
		type: "box",
		layout: "vertical",
		contents: [{
			type: "text",
			text: status,
			size: "sm",
			color: "#444444",
			wrap: true
		}],
		margin: "lg",
		paddingAll: "md",
		backgroundColor: "#F8F9FA",
		cornerRadius: "md"
	});
	const bubble = {
		type: "bubble",
		size: "mega",
		body: {
			type: "box",
			layout: "vertical",
			contents: headerContents,
			paddingAll: "xl",
			backgroundColor: "#FFFFFF"
		}
	};
	if (imageUrl) bubble.hero = {
		type: "image",
		url: imageUrl,
		size: "full",
		aspectRatio: "16:9",
		aspectMode: "cover"
	};
	if (controls.length > 0) {
		const rows = [];
		const limitedControls = controls.slice(0, 6);
		for (let i = 0; i < limitedControls.length; i += 2) {
			const rowButtons = [];
			for (let j = i; j < Math.min(i + 2, limitedControls.length); j++) {
				const ctrl = limitedControls[j];
				const buttonLabel = ctrl.icon ? `${ctrl.icon} ${ctrl.label}` : ctrl.label;
				rowButtons.push({
					type: "button",
					action: {
						type: "postback",
						label: buttonLabel.slice(0, 18),
						data: ctrl.data
					},
					style: ctrl.style ?? "secondary",
					flex: 1,
					height: "sm",
					margin: j > i ? "md" : void 0
				});
			}
			if (rowButtons.length === 1) rowButtons.push({ type: "filler" });
			rows.push({
				type: "box",
				layout: "horizontal",
				contents: rowButtons,
				margin: i > 0 ? "md" : void 0
			});
		}
		bubble.footer = {
			type: "box",
			layout: "vertical",
			contents: rows,
			paddingAll: "lg",
			backgroundColor: "#FAFAFA"
		};
	}
	return bubble;
}
//#endregion
//#region extensions/line/src/flex-templates/message.ts
/**
* Wrap a FlexContainer in a FlexMessage
*/
function toFlexMessage(altText, contents) {
	return {
		type: "flex",
		altText,
		contents
	};
}
//#endregion
//#region extensions/line/src/markdown-to-line.ts
/**
* Regex patterns for markdown detection
*/
const MARKDOWN_TABLE_REGEX = /^\|(.+)\|[\r\n]+\|[-:\s|]+\|[\r\n]+((?:\|.+\|[\r\n]*)+)/gm;
const MARKDOWN_CODE_BLOCK_REGEX = /```(\w*)\n([\s\S]*?)```/g;
const MARKDOWN_LINK_REGEX = /\[([^\]]+)\]\(([^)]+)\)/g;
/**
* Detect and extract markdown tables from text
*/
function extractMarkdownTables(text) {
	const tables = [];
	let textWithoutTables = text;
	MARKDOWN_TABLE_REGEX.lastIndex = 0;
	let match;
	const matches = [];
	while ((match = MARKDOWN_TABLE_REGEX.exec(text)) !== null) {
		const fullMatch = match[0];
		const headerLine = match[1];
		const bodyLines = match[2];
		const headers = parseTableRow(headerLine);
		const rows = bodyLines.trim().split(/[\r\n]+/).filter((line) => line.trim()).map(parseTableRow);
		if (headers.length > 0 && rows.length > 0) matches.push({
			fullMatch,
			table: {
				headers,
				rows
			}
		});
	}
	for (let i = matches.length - 1; i >= 0; i--) {
		const { fullMatch, table } = matches[i];
		tables.unshift(table);
		textWithoutTables = textWithoutTables.replace(fullMatch, "");
	}
	return {
		tables,
		textWithoutTables
	};
}
/**
* Parse a single table row (pipe-separated values)
*/
function parseTableRow(row) {
	return row.split("|").map((cell) => cell.trim()).filter((cell, index, arr) => {
		if (index === 0 && cell === "") return false;
		if (index === arr.length - 1 && cell === "") return false;
		return true;
	});
}
/**
* Convert a markdown table to a LINE Flex Message bubble
*/
function convertTableToFlexBubble(table) {
	const parseCell = (value) => {
		const raw = value?.trim() ?? "";
		if (!raw) return {
			text: "-",
			bold: false,
			hasMarkup: false
		};
		let hasMarkup = false;
		return {
			text: raw.replace(/\*\*(.+?)\*\*/g, (_, inner) => {
				hasMarkup = true;
				return String(inner);
			}).trim() || "-",
			bold: /^\*\*.+\*\*$/.test(raw),
			hasMarkup
		};
	};
	const headerCells = table.headers.map((header) => parseCell(header));
	const rowCells = table.rows.map((row) => row.map((cell) => parseCell(cell)));
	const hasInlineMarkup = headerCells.some((cell) => cell.hasMarkup) || rowCells.some((row) => row.some((cell) => cell.hasMarkup));
	if (table.headers.length === 2 && !hasInlineMarkup) {
		const items = rowCells.map((row) => ({
			name: row[0]?.text ?? "-",
			value: row[1]?.text ?? "-"
		}));
		return createReceiptCard({
			title: headerCells.map((cell) => cell.text).join(" / "),
			items
		});
	}
	return {
		type: "bubble",
		body: {
			type: "box",
			layout: "vertical",
			contents: [
				{
					type: "box",
					layout: "horizontal",
					contents: headerCells.map((cell) => ({
						type: "text",
						text: cell.text,
						weight: "bold",
						size: "sm",
						color: "#333333",
						flex: 1,
						wrap: true
					})),
					paddingBottom: "sm"
				},
				{
					type: "separator",
					margin: "sm"
				},
				...rowCells.slice(0, 10).map((row, rowIndex) => {
					return {
						type: "box",
						layout: "horizontal",
						contents: table.headers.map((_, colIndex) => {
							const cell = row[colIndex] ?? {
								text: "-",
								bold: false,
								hasMarkup: false
							};
							return {
								type: "text",
								text: cell.text,
								size: "sm",
								color: "#666666",
								flex: 1,
								wrap: true,
								weight: cell.bold ? "bold" : void 0
							};
						}),
						margin: rowIndex === 0 ? "md" : "sm"
					};
				})
			],
			paddingAll: "lg"
		}
	};
}
/**
* Detect and extract code blocks from text
*/
function extractCodeBlocks(text) {
	const codeBlocks = [];
	let textWithoutCode = text;
	MARKDOWN_CODE_BLOCK_REGEX.lastIndex = 0;
	let match;
	const matches = [];
	while ((match = MARKDOWN_CODE_BLOCK_REGEX.exec(text)) !== null) {
		const fullMatch = match[0];
		const language = match[1] || void 0;
		const code = match[2];
		matches.push({
			fullMatch,
			block: {
				language,
				code: code.trim()
			}
		});
	}
	for (let i = matches.length - 1; i >= 0; i--) {
		const { fullMatch, block } = matches[i];
		codeBlocks.unshift(block);
		textWithoutCode = textWithoutCode.replace(fullMatch, "");
	}
	return {
		codeBlocks,
		textWithoutCode
	};
}
/**
* Convert a code block to a LINE Flex Message bubble
*/
function convertCodeBlockToFlexBubble(block) {
	const titleText = block.language ? `Code (${block.language})` : "Code";
	const displayCode = block.code.length > 2e3 ? block.code.slice(0, 2e3) + "\n..." : block.code;
	return {
		type: "bubble",
		body: {
			type: "box",
			layout: "vertical",
			contents: [{
				type: "text",
				text: titleText,
				weight: "bold",
				size: "sm",
				color: "#666666"
			}, {
				type: "box",
				layout: "vertical",
				contents: [{
					type: "text",
					text: displayCode,
					size: "xs",
					color: "#333333",
					wrap: true
				}],
				backgroundColor: "#F5F5F5",
				paddingAll: "md",
				cornerRadius: "md",
				margin: "sm"
			}],
			paddingAll: "lg"
		}
	};
}
/**
* Extract markdown links from text
*/
function extractLinks(text) {
	const links = [];
	MARKDOWN_LINK_REGEX.lastIndex = 0;
	let match;
	while ((match = MARKDOWN_LINK_REGEX.exec(text)) !== null) links.push({
		text: match[1],
		url: match[2]
	});
	return {
		links,
		textWithLinks: text.replace(MARKDOWN_LINK_REGEX, "$1")
	};
}
/**
* Create a Flex Message with tappable link buttons
*/
function convertLinksToFlexBubble(links) {
	return {
		type: "bubble",
		body: {
			type: "box",
			layout: "vertical",
			contents: [{
				type: "text",
				text: "Links",
				weight: "bold",
				size: "md",
				color: "#333333"
			}],
			paddingAll: "lg",
			paddingBottom: "sm"
		},
		footer: {
			type: "box",
			layout: "vertical",
			contents: links.slice(0, 4).map((link, index) => ({
				type: "button",
				action: {
					type: "uri",
					label: link.text.slice(0, 20),
					uri: link.url
				},
				style: index === 0 ? "primary" : "secondary",
				margin: index > 0 ? "sm" : void 0
			})),
			paddingAll: "md"
		}
	};
}
/**
* Main function: Process text for LINE output
* - Extracts tables → Flex Messages
* - Extracts code blocks → Flex Messages
* - Strips remaining markdown
* - Returns processed text + Flex Messages
*/
function processLineMessage(text) {
	const flexMessages = [];
	let processedText = text;
	const { tables, textWithoutTables } = extractMarkdownTables(processedText);
	processedText = textWithoutTables;
	for (const table of tables) {
		const bubble = convertTableToFlexBubble(table);
		flexMessages.push(toFlexMessage("Table", bubble));
	}
	const { codeBlocks, textWithoutCode } = extractCodeBlocks(processedText);
	processedText = textWithoutCode;
	for (const block of codeBlocks) {
		const bubble = convertCodeBlockToFlexBubble(block);
		flexMessages.push(toFlexMessage("Code", bubble));
	}
	const { textWithLinks } = extractLinks(processedText);
	processedText = textWithLinks;
	processedText = stripMarkdown(processedText);
	return {
		text: processedText,
		flexMessages
	};
}
/**
* Check if text contains markdown that needs conversion
*/
function hasMarkdownToConvert(text) {
	MARKDOWN_TABLE_REGEX.lastIndex = 0;
	if (MARKDOWN_TABLE_REGEX.test(text)) return true;
	MARKDOWN_CODE_BLOCK_REGEX.lastIndex = 0;
	if (MARKDOWN_CODE_BLOCK_REGEX.test(text)) return true;
	if (/\*\*[^*]+\*\*/.test(text)) return true;
	if (/~~[^~]+~~/.test(text)) return true;
	if (/^#{1,6}\s+/m.test(text)) return true;
	if (/^>\s+/m.test(text)) return true;
	return false;
}
//#endregion
//#region extensions/line/src/reply-chunks.ts
async function sendLineReplyChunks(params) {
	const hasQuickReplies = Boolean(params.quickReplies?.length);
	let replyTokenUsed = Boolean(params.replyTokenUsed);
	if (params.chunks.length === 0) return { replyTokenUsed };
	if (params.replyToken && !replyTokenUsed) try {
		const replyBatch = params.chunks.slice(0, 5);
		const remaining = params.chunks.slice(replyBatch.length);
		const replyMessages = replyBatch.map((chunk) => ({
			type: "text",
			text: chunk
		}));
		if (hasQuickReplies && remaining.length === 0 && replyMessages.length > 0) {
			const lastIndex = replyMessages.length - 1;
			replyMessages[lastIndex] = params.createTextMessageWithQuickReplies(replyBatch[lastIndex], params.quickReplies);
		}
		await params.replyMessageLine(params.replyToken, replyMessages, { accountId: params.accountId });
		replyTokenUsed = true;
		for (let i = 0; i < remaining.length; i += 1) if (i === remaining.length - 1 && hasQuickReplies) await params.pushTextMessageWithQuickReplies(params.to, remaining[i], params.quickReplies, { accountId: params.accountId });
		else await params.pushMessageLine(params.to, remaining[i], { accountId: params.accountId });
		return { replyTokenUsed };
	} catch (err) {
		params.onReplyError?.(err);
		replyTokenUsed = true;
	}
	for (let i = 0; i < params.chunks.length; i += 1) if (i === params.chunks.length - 1 && hasQuickReplies) await params.pushTextMessageWithQuickReplies(params.to, params.chunks[i], params.quickReplies, { accountId: params.accountId });
	else await params.pushMessageLine(params.to, params.chunks[i], { accountId: params.accountId });
	return { replyTokenUsed };
}
//#endregion
//#region extensions/line/src/webhook-node.ts
const LINE_WEBHOOK_MAX_BODY_BYTES = 1024 * 1024;
const LINE_WEBHOOK_PREAUTH_MAX_BODY_BYTES = 64 * 1024;
const LINE_WEBHOOK_PREAUTH_BODY_TIMEOUT_MS = 5e3;
async function readLineWebhookRequestBody(req, maxBytes = LINE_WEBHOOK_MAX_BODY_BYTES, timeoutMs = LINE_WEBHOOK_PREAUTH_BODY_TIMEOUT_MS) {
	return await readRequestBodyWithLimit(req, {
		maxBytes,
		timeoutMs
	});
}
function createLineNodeWebhookHandler(params) {
	const maxBodyBytes = params.maxBodyBytes ?? LINE_WEBHOOK_MAX_BODY_BYTES;
	const readBody = params.readBody ?? readLineWebhookRequestBody;
	return async (req, res) => {
		if (req.method === "GET" || req.method === "HEAD") {
			if (req.method === "HEAD") {
				res.statusCode = 204;
				res.end();
				return;
			}
			res.statusCode = 200;
			res.setHeader("Content-Type", "text/plain");
			res.end("OK");
			return;
		}
		if (req.method !== "POST") {
			res.statusCode = 405;
			res.setHeader("Allow", "GET, HEAD, POST");
			res.setHeader("Content-Type", "application/json");
			res.end(JSON.stringify({ error: "Method Not Allowed" }));
			return;
		}
		try {
			const signatureHeader = req.headers["x-line-signature"];
			const signature = typeof signatureHeader === "string" ? signatureHeader.trim() : Array.isArray(signatureHeader) ? (signatureHeader[0] ?? "").trim() : "";
			if (!signature) {
				logVerbose("line: webhook missing X-Line-Signature header");
				res.statusCode = 400;
				res.setHeader("Content-Type", "application/json");
				res.end(JSON.stringify({ error: "Missing X-Line-Signature header" }));
				return;
			}
			const rawBody = await readBody(req, Math.min(maxBodyBytes, LINE_WEBHOOK_PREAUTH_MAX_BODY_BYTES), LINE_WEBHOOK_PREAUTH_BODY_TIMEOUT_MS);
			if (!validateLineSignature(rawBody, signature, params.channelSecret)) {
				logVerbose("line: webhook signature validation failed");
				res.statusCode = 401;
				res.setHeader("Content-Type", "application/json");
				res.end(JSON.stringify({ error: "Invalid signature" }));
				return;
			}
			const body = parseLineWebhookBody(rawBody);
			if (!body) {
				res.statusCode = 400;
				res.setHeader("Content-Type", "application/json");
				res.end(JSON.stringify({ error: "Invalid webhook payload" }));
				return;
			}
			params.onRequestAuthenticated?.();
			if (body.events && body.events.length > 0) {
				logVerbose(`line: received ${body.events.length} webhook events`);
				await params.bot.handleWebhook(body);
			}
			res.statusCode = 200;
			res.setHeader("Content-Type", "application/json");
			res.end(JSON.stringify({ status: "ok" }));
		} catch (err) {
			if (isRequestBodyLimitError(err, "PAYLOAD_TOO_LARGE")) {
				res.statusCode = 413;
				res.setHeader("Content-Type", "application/json");
				res.end(JSON.stringify({ error: "Payload too large" }));
				return;
			}
			if (isRequestBodyLimitError(err, "REQUEST_BODY_TIMEOUT")) {
				res.statusCode = 408;
				res.setHeader("Content-Type", "application/json");
				res.end(JSON.stringify({ error: requestBodyErrorToText("REQUEST_BODY_TIMEOUT") }));
				return;
			}
			params.runtime.error?.(danger(`line webhook error: ${String(err)}`));
			if (!res.headersSent) {
				res.statusCode = 500;
				res.setHeader("Content-Type", "application/json");
				res.end(JSON.stringify({ error: "Internal server error" }));
			}
		}
	};
}
//#endregion
//#region extensions/line/src/monitor.ts
const runtimeState = /* @__PURE__ */ new Map();
const lineWebhookInFlightLimiter = createWebhookInFlightLimiter();
function recordChannelRuntimeState(params) {
	const key = `${params.channel}:${params.accountId}`;
	const existing = runtimeState.get(key) ?? {
		running: false,
		lastStartAt: null,
		lastStopAt: null,
		lastError: null
	};
	runtimeState.set(key, {
		...existing,
		...params.state
	});
}
function startLineLoadingKeepalive(params) {
	const intervalMs = params.intervalMs ?? 18e3;
	const loadingSeconds = params.loadingSeconds ?? 20;
	let stopped = false;
	const trigger = () => {
		if (stopped) return;
		showLoadingAnimation(params.userId, {
			accountId: params.accountId,
			loadingSeconds
		}).catch(() => {});
	};
	trigger();
	const timer = setInterval(trigger, intervalMs);
	return () => {
		if (stopped) return;
		stopped = true;
		clearInterval(timer);
	};
}
async function monitorLineProvider(opts) {
	const { channelAccessToken, channelSecret, accountId, config, runtime, abortSignal, webhookPath } = opts;
	const resolvedAccountId = accountId ?? "default";
	const token = channelAccessToken.trim();
	const secret = channelSecret.trim();
	if (!token) throw new Error("LINE webhook mode requires a non-empty channel access token.");
	if (!secret) throw new Error("LINE webhook mode requires a non-empty channel secret.");
	recordChannelRuntimeState({
		channel: "line",
		accountId: resolvedAccountId,
		state: {
			running: true,
			lastStartAt: Date.now()
		}
	});
	const bot = createLineBot({
		channelAccessToken: token,
		channelSecret: secret,
		accountId,
		runtime,
		config,
		onMessage: async (ctx) => {
			if (!ctx) return;
			const { ctxPayload, replyToken, route } = ctx;
			recordChannelRuntimeState({
				channel: "line",
				accountId: resolvedAccountId,
				state: { lastInboundAt: Date.now() }
			});
			const shouldShowLoading = Boolean(ctx.userId && !ctx.isGroup);
			const displayNamePromise = ctx.userId ? getUserDisplayName(ctx.userId, { accountId: ctx.accountId }) : Promise.resolve(ctxPayload.From);
			const stopLoading = shouldShowLoading ? startLineLoadingKeepalive({
				userId: ctx.userId,
				accountId: ctx.accountId
			}) : null;
			logVerbose(`line: received message from ${await displayNamePromise} (${ctxPayload.From})`);
			try {
				const textLimit = 5e3;
				let replyTokenUsed = false;
				const { onModelSelected, ...replyPipeline } = createChannelReplyPipeline({
					cfg: config,
					agentId: route.agentId,
					channel: "line",
					accountId: route.accountId
				});
				const { queuedFinal } = await dispatchReplyWithBufferedBlockDispatcher({
					ctx: ctxPayload,
					cfg: config,
					dispatcherOptions: {
						...replyPipeline,
						deliver: async (payload, _info) => {
							const lineData = payload.channelData?.line ?? {};
							if (ctx.userId && !ctx.isGroup) showLoadingAnimation(ctx.userId, { accountId: ctx.accountId }).catch(() => {});
							const { replyTokenUsed: nextReplyTokenUsed } = await deliverLineAutoReply({
								payload,
								lineData,
								to: ctxPayload.From,
								replyToken,
								replyTokenUsed,
								accountId: ctx.accountId,
								textLimit,
								deps: {
									buildTemplateMessageFromPayload,
									processLineMessage,
									chunkMarkdownText,
									sendLineReplyChunks,
									replyMessageLine,
									pushMessageLine,
									pushTextMessageWithQuickReplies,
									createQuickReplyItems,
									createTextMessageWithQuickReplies,
									pushMessagesLine,
									createFlexMessage,
									createImageMessage,
									createLocationMessage,
									onReplyError: (replyErr) => {
										logVerbose(`line: reply token failed, falling back to push: ${String(replyErr)}`);
									}
								}
							});
							replyTokenUsed = nextReplyTokenUsed;
							recordChannelRuntimeState({
								channel: "line",
								accountId: resolvedAccountId,
								state: { lastOutboundAt: Date.now() }
							});
						},
						onError: (err, info) => {
							runtime.error?.(danger(`line ${info.kind} reply failed: ${String(err)}`));
						}
					},
					replyOptions: { onModelSelected }
				});
				if (!queuedFinal) logVerbose(`line: no response generated for message from ${ctxPayload.From}`);
			} catch (err) {
				runtime.error?.(danger(`line: auto-reply failed: ${String(err)}`));
				if (replyToken) try {
					await replyMessageLine(replyToken, [{
						type: "text",
						text: "Sorry, I encountered an error processing your message."
					}], { accountId: ctx.accountId });
				} catch (replyErr) {
					runtime.error?.(danger(`line: error reply failed: ${String(replyErr)}`));
				}
			} finally {
				stopLoading?.();
			}
		}
	});
	const normalizedPath = normalizePluginHttpPath(webhookPath, "/line/webhook") ?? "/line/webhook";
	const createScopedLineWebhookHandler = (onRequestAuthenticated) => createLineNodeWebhookHandler({
		channelSecret: secret,
		bot,
		runtime,
		onRequestAuthenticated
	});
	const unregisterHttp = registerPluginHttpRoute({
		path: normalizedPath,
		auth: "plugin",
		replaceExisting: true,
		pluginId: "line",
		accountId: resolvedAccountId,
		log: (msg) => logVerbose(msg),
		handler: async (req, res) => {
			if (req.method !== "POST") {
				await createScopedLineWebhookHandler()(req, res);
				return;
			}
			const requestLifecycle = beginWebhookRequestPipelineOrReject({
				req,
				res,
				inFlightLimiter: lineWebhookInFlightLimiter,
				inFlightKey: `line:${resolvedAccountId}`
			});
			if (!requestLifecycle.ok) return;
			try {
				await createScopedLineWebhookHandler(requestLifecycle.release)(req, res);
			} finally {
				requestLifecycle.release();
			}
		}
	});
	logVerbose(`line: registered webhook handler at ${normalizedPath}`);
	let stopped = false;
	const stopHandler = () => {
		if (stopped) return;
		stopped = true;
		logVerbose(`line: stopping provider for account ${resolvedAccountId}`);
		unregisterHttp();
		recordChannelRuntimeState({
			channel: "line",
			accountId: resolvedAccountId,
			state: {
				running: false,
				lastStopAt: Date.now()
			}
		});
	};
	if (abortSignal?.aborted) stopHandler();
	else if (abortSignal) {
		abortSignal.addEventListener("abort", stopHandler, { once: true });
		await waitForAbortSignal(abortSignal);
	}
	return {
		account: bot.account,
		handleWebhook: bot.handleWebhook,
		stop: () => {
			stopHandler();
			abortSignal?.removeEventListener("abort", stopHandler);
		}
	};
}
//#endregion
//#region extensions/line/src/config-schema.ts
const DmPolicySchema = zod_exports.z.enum([
	"open",
	"allowlist",
	"pairing",
	"disabled"
]);
const GroupPolicySchema = zod_exports.z.enum([
	"open",
	"allowlist",
	"disabled"
]);
const ThreadBindingsSchema = zod_exports.z.object({
	enabled: zod_exports.z.boolean().optional(),
	idleHours: zod_exports.z.number().optional(),
	maxAgeHours: zod_exports.z.number().optional(),
	spawnSubagentSessions: zod_exports.z.boolean().optional(),
	spawnAcpSessions: zod_exports.z.boolean().optional()
}).strict();
const LineCommonConfigSchema = zod_exports.z.object({
	enabled: zod_exports.z.boolean().optional(),
	channelAccessToken: zod_exports.z.string().optional(),
	channelSecret: zod_exports.z.string().optional(),
	tokenFile: zod_exports.z.string().optional(),
	secretFile: zod_exports.z.string().optional(),
	name: zod_exports.z.string().optional(),
	allowFrom: zod_exports.z.array(zod_exports.z.union([zod_exports.z.string(), zod_exports.z.number()])).optional(),
	groupAllowFrom: zod_exports.z.array(zod_exports.z.union([zod_exports.z.string(), zod_exports.z.number()])).optional(),
	dmPolicy: DmPolicySchema.optional().default("pairing"),
	groupPolicy: GroupPolicySchema.optional().default("allowlist"),
	responsePrefix: zod_exports.z.string().optional(),
	mediaMaxMb: zod_exports.z.number().optional(),
	webhookPath: zod_exports.z.string().optional(),
	threadBindings: ThreadBindingsSchema.optional()
});
const LineGroupConfigSchema = zod_exports.z.object({
	enabled: zod_exports.z.boolean().optional(),
	allowFrom: zod_exports.z.array(zod_exports.z.union([zod_exports.z.string(), zod_exports.z.number()])).optional(),
	requireMention: zod_exports.z.boolean().optional(),
	systemPrompt: zod_exports.z.string().optional(),
	skills: zod_exports.z.array(zod_exports.z.string()).optional()
}).strict();
const LineAccountConfigSchema = LineCommonConfigSchema.extend({ groups: zod_exports.z.record(zod_exports.z.string(), LineGroupConfigSchema.optional()).optional() }).strict();
const LineConfigSchema = LineCommonConfigSchema.extend({
	accounts: zod_exports.z.record(zod_exports.z.string(), LineAccountConfigSchema.optional()).optional(),
	defaultAccount: zod_exports.z.string().optional(),
	groups: zod_exports.z.record(zod_exports.z.string(), LineGroupConfigSchema.optional()).optional()
}).strict();
const LineChannelConfigSchema = buildChannelConfigSchema(LineConfigSchema);
//#endregion
//#region extensions/line/src/rich-menu.ts
const USER_BATCH_SIZE = 500;
function getClient(opts = {}) {
	const account = resolveLineAccount({
		cfg: loadConfig(),
		accountId: opts.accountId
	});
	const token = resolveLineChannelAccessToken(opts.channelAccessToken, account);
	return new messagingApi.MessagingApiClient({ channelAccessToken: token });
}
function getBlobClient(opts = {}) {
	const account = resolveLineAccount({
		cfg: loadConfig(),
		accountId: opts.accountId
	});
	const token = resolveLineChannelAccessToken(opts.channelAccessToken, account);
	return new messagingApi.MessagingApiBlobClient({ channelAccessToken: token });
}
function chunkUserIds(userIds) {
	const batches = [];
	for (let i = 0; i < userIds.length; i += USER_BATCH_SIZE) batches.push(userIds.slice(i, i + USER_BATCH_SIZE));
	return batches;
}
async function createRichMenu(menu, opts = {}) {
	const client = getClient(opts);
	const richMenuRequest = {
		size: menu.size,
		selected: menu.selected ?? false,
		name: menu.name.slice(0, 300),
		chatBarText: menu.chatBarText.slice(0, 14),
		areas: menu.areas
	};
	const response = await client.createRichMenu(richMenuRequest);
	if (opts.verbose) logVerbose(`line: created rich menu ${response.richMenuId}`);
	return response.richMenuId;
}
async function uploadRichMenuImage(richMenuId, imagePath, opts = {}) {
	const blobClient = getBlobClient(opts);
	const imageData = await readFile(imagePath);
	const contentType = imagePath.toLowerCase().endsWith(".png") ? "image/png" : "image/jpeg";
	await blobClient.setRichMenuImage(richMenuId, new Blob([imageData], { type: contentType }));
	if (opts.verbose) logVerbose(`line: uploaded image to rich menu ${richMenuId}`);
}
async function setDefaultRichMenu(richMenuId, opts = {}) {
	await getClient(opts).setDefaultRichMenu(richMenuId);
	if (opts.verbose) logVerbose(`line: set default rich menu to ${richMenuId}`);
}
async function cancelDefaultRichMenu(opts = {}) {
	await getClient(opts).cancelDefaultRichMenu();
	if (opts.verbose) logVerbose("line: cancelled default rich menu");
}
async function getDefaultRichMenuId(opts = {}) {
	const client = getClient(opts);
	try {
		return (await client.getDefaultRichMenuId()).richMenuId ?? null;
	} catch {
		return null;
	}
}
async function linkRichMenuToUser(userId, richMenuId, opts = {}) {
	await getClient(opts).linkRichMenuIdToUser(userId, richMenuId);
	if (opts.verbose) logVerbose(`line: linked rich menu ${richMenuId} to user ${userId}`);
}
async function linkRichMenuToUsers(userIds, richMenuId, opts = {}) {
	const client = getClient(opts);
	for (const batch of chunkUserIds(userIds)) await client.linkRichMenuIdToUsers({
		richMenuId,
		userIds: batch
	});
	if (opts.verbose) logVerbose(`line: linked rich menu ${richMenuId} to ${userIds.length} users`);
}
async function unlinkRichMenuFromUser(userId, opts = {}) {
	await getClient(opts).unlinkRichMenuIdFromUser(userId);
	if (opts.verbose) logVerbose(`line: unlinked rich menu from user ${userId}`);
}
async function unlinkRichMenuFromUsers(userIds, opts = {}) {
	const client = getClient(opts);
	for (const batch of chunkUserIds(userIds)) await client.unlinkRichMenuIdFromUsers({ userIds: batch });
	if (opts.verbose) logVerbose(`line: unlinked rich menu from ${userIds.length} users`);
}
async function getRichMenuIdOfUser(userId, opts = {}) {
	const client = getClient(opts);
	try {
		return (await client.getRichMenuIdOfUser(userId)).richMenuId ?? null;
	} catch {
		return null;
	}
}
async function getRichMenuList(opts = {}) {
	return (await getClient(opts).getRichMenuList()).richmenus ?? [];
}
async function getRichMenu(richMenuId, opts = {}) {
	const client = getClient(opts);
	try {
		return await client.getRichMenu(richMenuId);
	} catch {
		return null;
	}
}
async function deleteRichMenu(richMenuId, opts = {}) {
	await getClient(opts).deleteRichMenu(richMenuId);
	if (opts.verbose) logVerbose(`line: deleted rich menu ${richMenuId}`);
}
async function createRichMenuAlias(richMenuId, aliasId, opts = {}) {
	await getClient(opts).createRichMenuAlias({
		richMenuId,
		richMenuAliasId: aliasId
	});
	if (opts.verbose) logVerbose(`line: created alias ${aliasId} for rich menu ${richMenuId}`);
}
async function deleteRichMenuAlias(aliasId, opts = {}) {
	await getClient(opts).deleteRichMenuAlias(aliasId);
	if (opts.verbose) logVerbose(`line: deleted alias ${aliasId}`);
}
function createGridLayout(height, actions) {
	const colWidth = Math.floor(2500 / 3);
	const rowHeight = Math.floor(height / 2);
	return [
		{
			bounds: {
				x: 0,
				y: 0,
				width: colWidth,
				height: rowHeight
			},
			action: actions[0]
		},
		{
			bounds: {
				x: colWidth,
				y: 0,
				width: colWidth,
				height: rowHeight
			},
			action: actions[1]
		},
		{
			bounds: {
				x: colWidth * 2,
				y: 0,
				width: colWidth,
				height: rowHeight
			},
			action: actions[2]
		},
		{
			bounds: {
				x: 0,
				y: rowHeight,
				width: colWidth,
				height: rowHeight
			},
			action: actions[3]
		},
		{
			bounds: {
				x: colWidth,
				y: rowHeight,
				width: colWidth,
				height: rowHeight
			},
			action: actions[4]
		},
		{
			bounds: {
				x: colWidth * 2,
				y: rowHeight,
				width: colWidth,
				height: rowHeight
			},
			action: actions[5]
		}
	];
}
function createDefaultMenuConfig() {
	return {
		size: {
			width: 2500,
			height: 843
		},
		selected: false,
		name: "Default Menu",
		chatBarText: "Menu",
		areas: createGridLayout(843, [
			messageAction("Help", "/help"),
			messageAction("Status", "/status"),
			messageAction("Settings", "/settings"),
			messageAction("About", "/about"),
			messageAction("Feedback", "/feedback"),
			messageAction("Contact", "/contact")
		])
	};
}
//#endregion
export { createAudioMessage as $, processLineMessage as A, datetimePickerAction as At, createImageCard as B, convertCodeBlockToFlexBubble as C, createConfirmTemplate as Ct, extractLinks as D, createProductCarousel as Dt, extractCodeBlocks as E, createLinkMenu as Et, createAgendaCard as F, downloadLineMedia as Ft, startLineWebhook as G, createListCard as H, createEventCard as I, isSenderAllowed as It, resolveExactLineGroupConfigKey as J, parseLineWebhookBody as K, createReceiptCard as L, normalizeAllowFrom as Lt, createAppleTvRemoteCard as M, postbackAction as Mt, createDeviceControlCard as N, uriAction as Nt, extractMarkdownTables as O, createTemplateCarousel as Ot, createMediaPlayerCard as P, probeLineBot as Pt, resolveLineGroupsConfig as Q, createActionCard as R, normalizeDmAllowFromWithStore as Rt, readLineWebhookRequestBody as S, createCarouselColumn as St, convertTableToFlexBubble as T, createImageCarouselColumn as Tt, createNotificationBubble as U, createInfoCard as V, createLineWebhookMiddleware as W, resolveLineGroupHistoryKey as X, resolveLineGroupConfigEntry as Y, resolveLineGroupLookupIds as Z, uploadRichMenuImage as _, showLoadingAnimation as _t, createRichMenuAlias as a, createVideoMessage as at, monitorLineProvider as b, createButtonMenu as bt, getDefaultRichMenuId as c, pushFlexMessage as ct, getRichMenuList as d, pushMessageLine as dt, createFlexMessage as et, linkRichMenuToUser as f, pushMessagesLine as ft, unlinkRichMenuFromUsers as g, sendMessageLine as gt, unlinkRichMenuFromUser as h, replyMessageLine as ht, createRichMenu as i, createTextMessageWithQuickReplies as it, toFlexMessage as j, messageAction as jt, hasMarkdownToConvert as k, createYesNoConfirm as kt, getRichMenu as l, pushImageMessage as lt, setDefaultRichMenu as m, pushTextMessageWithQuickReplies as mt, createDefaultMenuConfig as n, createLocationMessage as nt, deleteRichMenu as o, getUserDisplayName as ot, linkRichMenuToUsers as p, pushTemplateMessage as pt, validateLineSignature as q, createGridLayout as r, createQuickReplyItems as rt, deleteRichMenuAlias as s, getUserProfile as st, cancelDefaultRichMenu as t, createImageMessage as tt, getRichMenuIdOfUser as u, pushLocationMessage as ut, LineChannelConfigSchema as v, resolveLineChannelAccessToken as vt, convertLinksToFlexBubble as w, createImageCarousel as wt, createLineNodeWebhookHandler as x, createButtonTemplate as xt, LineConfigSchema as y, buildTemplateMessageFromPayload as yt, createCarousel as z };
