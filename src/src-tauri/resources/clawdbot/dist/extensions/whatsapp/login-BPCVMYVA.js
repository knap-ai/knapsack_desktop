import { a as markdownToWhatsApp, i as jidToE164, o as resolveJidToE164, r as isSelfChatMode, s as toWhatsappJid, t as text_runtime_exports } from "./text-runtime-Daz12Pek.js";
import { l as resolveWhatsAppMediaMaxBytes, s as resolveWhatsAppAccount } from "./accounts-DgAsOTS-.js";
import { t as resolveWhatsAppReactionLevel } from "./reaction-level-D8AVT3ws.js";
import { r as sendReactionWhatsApp } from "./send-RylHu2jU.js";
import { _ as getSenderIdentity, c as readWebSelfId, f as getComparableIdentityValues, g as getSelfIdentity, h as getReplyContext, l as readWebSelfIdentity, m as getPrimaryIdentityId, n as getWebAuthAgeMs, p as getMentionIdentities, v as identitiesOverlap, y as resolveComparableIdentity } from "./auth-store-3FRPEigM.js";
import { n as checkInboundAccessControl } from "./access-control-D0WpKaWO.js";
import { n as getStatusCode, t as formatError } from "./session-errors-CjMYNFqh.js";
import { _ as sleepWithAbort, a as waitForWhatsAppLoginResult, f as DEFAULT_RECONNECT_POLICY, g as resolveReconnectPolicy, h as resolveHeartbeatSeconds, i as closeWaSocketSoon, m as newConnectionId, n as WhatsAppConnectionController, o as createWaSocket, p as computeBackoff, u as waitForWaConnection } from "./connection-controller-ByQ0-fZO.js";
import { getChildLogger, logInfo, normalizeLowercaseStringOrEmpty } from "openclaw/plugin-sdk/text-runtime";
import { shouldAckReactionForWhatsApp } from "openclaw/plugin-sdk/channel-feedback";
import { formatCliCommand } from "openclaw/plugin-sdk/cli-runtime";
import { evaluateSessionFreshness, loadConfig, loadConfig as loadConfig$1, loadSessionStore, recordSessionMetaFromInbound, resolveChannelContextVisibilityMode, resolveChannelGroupPolicy, resolveChannelGroupRequireMention, resolveChannelResetConfig, resolveGroupSessionKey, resolveSessionKey, resolveSessionResetPolicy, resolveSessionResetType, resolveStorePath, resolveThreadFlag, updateLastRoute } from "openclaw/plugin-sdk/config-runtime";
import { createDedupeCache } from "openclaw/plugin-sdk/core";
import { getAgentScopedMediaLocalRoots, saveMediaBuffer } from "openclaw/plugin-sdk/media-runtime";
import { createSubsystemLogger, danger, defaultRuntime, formatDurationPrecise, getChildLogger as getChildLogger$1, logVerbose, logVerbose as logVerbose$1, registerUnhandledRejectionHandler, shouldLogVerbose, shouldLogVerbose as shouldLogVerbose$1, success } from "openclaw/plugin-sdk/runtime-env";
import { LocalMediaAccessError, getDefaultLocalRoots, loadWebMedia as loadWebMedia$1, loadWebMediaRaw, optimizeImageToJpeg, optimizeImageToPng } from "openclaw/plugin-sdk/web-media";
import { chunkMarkdownTextWithMode } from "openclaw/plugin-sdk/reply-chunking";
import { drainPendingDeliveries, enqueueSystemEvent, recordChannelActivity } from "openclaw/plugin-sdk/infra-runtime";
import { DEFAULT_MAIN_KEY, buildAgentMainSessionKey, buildAgentSessionKey, buildGroupHistoryKey, deriveLastRoutePolicy, normalizeAgentId, resolveAgentRoute, resolveInboundLastRouteSessionKey } from "openclaw/plugin-sdk/routing";
import { evaluateSupplementalContextVisibility, filterSupplementalContextItems, readStoreAllowFromForDmPolicy as readStoreAllowFromForDmPolicy$1, resolveDmGroupAccessWithCommandGate, resolvePinnedMainDmOwnerFromAllowlist } from "openclaw/plugin-sdk/security-runtime";
import { dispatchReplyWithBufferedBlockDispatcher, finalizeInboundContext, normalizeGroupActivation, parseActivationCommand, resolveChunkMode, resolveTextChunkLimit } from "openclaw/plugin-sdk/reply-runtime";
import { resolveIdentityNamePrefix, resolveMessagePrefix } from "openclaw/plugin-sdk/agent-runtime";
import { resolveOutboundMediaUrls, resolveSendableOutboundReplyParts as resolveSendableOutboundReplyParts$1, sendMediaWithLeadingCaption } from "openclaw/plugin-sdk/reply-payload";
import { DisconnectReason as DisconnectReason$1, downloadMediaMessage, extractMessageContent, getContentType, isJidGroup, normalizeMessageContent, normalizeMessageContent as normalizeMessageContent$1 } from "@whiskeysockets/baileys";
import { buildMentionRegexes, createInboundDebouncer, formatInboundEnvelope, formatInboundEnvelope as formatInboundEnvelope$1, formatLocationText, implicitMentionKindWhen, normalizeMentionText, resolveInboundDebounceMs, resolveInboundMentionDecision, resolveInboundSessionEnvelopeContext, toLocationContext } from "openclaw/plugin-sdk/channel-inbound";
import { hasControlCommand, hasControlCommand as hasControlCommand$1, shouldComputeCommandAuthorized } from "openclaw/plugin-sdk/command-detection";
import { DEFAULT_GROUP_HISTORY_LIMIT, buildHistoryContextFromEntries, recordPendingHistoryEntryIfEnabled } from "openclaw/plugin-sdk/reply-history";
import { createClaimableDedupe } from "openclaw/plugin-sdk/persistent-dedupe";
import { createConnectedChannelStatusPatch } from "openclaw/plugin-sdk/gateway-runtime";
import { createChannelReplyPipeline } from "openclaw/plugin-sdk/channel-reply-pipeline";
import { resolveMarkdownTableMode as resolveMarkdownTableMode$1 } from "openclaw/plugin-sdk/markdown-table-runtime";
//#region extensions/whatsapp/src/auto-reply/loggers.ts
const whatsappLog = createSubsystemLogger("gateway/channels/whatsapp");
const whatsappInboundLog = whatsappLog.child("inbound");
const whatsappOutboundLog = whatsappLog.child("outbound");
const whatsappHeartbeatLog = whatsappLog.child("heartbeat");
//#endregion
//#region extensions/whatsapp/src/inbound/dedupe.ts
const RECENT_WEB_MESSAGE_TTL_MS = 20 * 6e4;
const RECENT_WEB_MESSAGE_MAX = 5e3;
const RECENT_OUTBOUND_MESSAGE_TTL_MS = 20 * 6e4;
const RECENT_OUTBOUND_MESSAGE_MAX = 5e3;
const recentInboundMessages = createDedupeCache({
	ttlMs: RECENT_WEB_MESSAGE_TTL_MS,
	maxSize: RECENT_WEB_MESSAGE_MAX
});
const claimableInboundMessages = createClaimableDedupe({
	ttlMs: RECENT_WEB_MESSAGE_TTL_MS,
	memoryMaxSize: RECENT_WEB_MESSAGE_MAX
});
const recentOutboundMessages = createDedupeCache({
	ttlMs: RECENT_OUTBOUND_MESSAGE_TTL_MS,
	maxSize: RECENT_OUTBOUND_MESSAGE_MAX
});
var WhatsAppRetryableInboundError = class extends Error {
	constructor(message, options) {
		super(message, options);
		this.name = "WhatsAppRetryableInboundError";
	}
};
function buildMessageKey(params) {
	const accountId = params.accountId.trim();
	const remoteJid = params.remoteJid.trim();
	const messageId = params.messageId.trim();
	if (!accountId || !remoteJid || !messageId || messageId === "unknown") return null;
	return `${accountId}:${remoteJid}:${messageId}`;
}
function resetWebInboundDedupe() {
	recentInboundMessages.clear();
	claimableInboundMessages.clearMemory();
	recentOutboundMessages.clear();
}
async function claimRecentInboundMessage(key) {
	return (await claimableInboundMessages.claim(key)).kind === "claimed";
}
async function commitRecentInboundMessage(key) {
	await claimableInboundMessages.commit(key);
	recentInboundMessages.check(key);
}
function releaseRecentInboundMessage(key, error) {
	claimableInboundMessages.release(key, { error });
}
function rememberRecentOutboundMessage(params) {
	const key = buildMessageKey(params);
	if (!key) return;
	recentOutboundMessages.check(key);
}
function isRecentOutboundMessage(params) {
	const key = buildMessageKey(params);
	if (!key) return false;
	return recentOutboundMessages.peek(key);
}
//#endregion
//#region extensions/whatsapp/src/vcard.ts
const ALLOWED_VCARD_KEYS = new Set([
	"FN",
	"N",
	"TEL"
]);
function parseVcard(vcard) {
	if (!vcard) return { phones: [] };
	const lines = vcard.split(/\r?\n/);
	let nameFromN;
	let nameFromFn;
	const phones = [];
	for (const rawLine of lines) {
		const line = rawLine.trim();
		if (!line) continue;
		const colonIndex = line.indexOf(":");
		if (colonIndex === -1) continue;
		const key = line.slice(0, colonIndex).toUpperCase();
		const rawValue = line.slice(colonIndex + 1).trim();
		if (!rawValue) continue;
		const baseKey = normalizeVcardKey(key);
		if (!baseKey || !ALLOWED_VCARD_KEYS.has(baseKey)) continue;
		const value = cleanVcardValue(rawValue);
		if (!value) continue;
		if (baseKey === "FN" && !nameFromFn) {
			nameFromFn = normalizeVcardName(value);
			continue;
		}
		if (baseKey === "N" && !nameFromN) {
			nameFromN = normalizeVcardName(value);
			continue;
		}
		if (baseKey === "TEL") {
			const phone = normalizeVcardPhone(value);
			if (phone) phones.push(phone);
		}
	}
	return {
		name: nameFromFn ?? nameFromN,
		phones
	};
}
function normalizeVcardKey(key) {
	const [primary] = key.split(";");
	if (!primary) return;
	const segments = primary.split(".");
	return segments[segments.length - 1] || void 0;
}
function cleanVcardValue(value) {
	return value.replace(/\\n/gi, " ").replace(/\\,/g, ",").replace(/\\;/g, ";").trim();
}
function normalizeVcardName(value) {
	return value.replace(/;/g, " ").replace(/\s+/g, " ").trim();
}
function normalizeVcardPhone(value) {
	const trimmed = value.trim();
	if (!trimmed) return "";
	if (normalizeLowercaseStringOrEmpty(trimmed).startsWith("tel:")) return trimmed.slice(4).trim();
	return trimmed;
}
//#endregion
//#region extensions/whatsapp/src/inbound/extract.ts
const MESSAGE_WRAPPER_KEYS = [
	"botInvokeMessage",
	"ephemeralMessage",
	"viewOnceMessage",
	"viewOnceMessageV2",
	"viewOnceMessageV2Extension",
	"documentWithCaptionMessage",
	"groupMentionedMessage"
];
const MESSAGE_CONTENT_KEYS = [
	"conversation",
	"extendedTextMessage",
	"imageMessage",
	"videoMessage",
	"audioMessage",
	"documentMessage",
	"stickerMessage",
	"locationMessage",
	"liveLocationMessage",
	"contactMessage",
	"contactsArrayMessage",
	"buttonsResponseMessage",
	"listResponseMessage",
	"templateButtonReplyMessage",
	"interactiveResponseMessage",
	"buttonsMessage",
	"listMessage"
];
function fallbackNormalizeMessageContent(message) {
	let current = message;
	while (current && typeof current === "object") {
		let unwrapped = false;
		for (const key of MESSAGE_WRAPPER_KEYS) {
			const candidate = current[key];
			if (candidate && typeof candidate === "object" && "message" in candidate && candidate.message) {
				current = candidate.message;
				unwrapped = true;
				break;
			}
		}
		if (!unwrapped) break;
	}
	return current;
}
function normalizeMessage(message) {
	if (typeof normalizeMessageContent === "function") return normalizeMessageContent(message);
	return fallbackNormalizeMessageContent(message);
}
function fallbackGetContentType(message) {
	const normalized = fallbackNormalizeMessageContent(message);
	if (!normalized || typeof normalized !== "object") return;
	for (const key of MESSAGE_CONTENT_KEYS) if (normalized[key] != null) return key;
}
function getMessageContentType(message) {
	if (typeof getContentType === "function") return getContentType(message);
	return fallbackGetContentType(message);
}
function extractMessage(message) {
	if (typeof extractMessageContent === "function") return extractMessageContent(message);
	const normalized = fallbackNormalizeMessageContent(message);
	const contentType = fallbackGetContentType(normalized);
	if (!normalized || !contentType || contentType === "conversation") return normalized;
	const candidate = normalized[contentType];
	return candidate && typeof candidate === "object" ? candidate : normalized;
}
function getFutureProofInnerMessage(message) {
	const contentType = getMessageContentType(message);
	const candidate = contentType ? message[contentType] : void 0;
	if (candidate && typeof candidate === "object" && "message" in candidate && candidate.message && typeof candidate.message === "object") {
		const inner = normalizeMessage(candidate.message);
		if (inner) {
			const innerType = getMessageContentType(inner);
			if (innerType && innerType !== contentType) return inner;
		}
	}
}
function buildMessageChain(message) {
	const chain = [];
	let current = normalizeMessage(message);
	while (current && chain.length < 4) {
		chain.push(current);
		current = getFutureProofInnerMessage(current);
	}
	return chain;
}
function unwrapMessage$1(message) {
	return buildMessageChain(message).at(-1);
}
function extractContextInfoFromMessage(message) {
	const contentType = getMessageContentType(message);
	const candidate = contentType ? message[contentType] : void 0;
	const contextInfo = candidate && typeof candidate === "object" && "contextInfo" in candidate ? candidate.contextInfo : void 0;
	if (contextInfo) return contextInfo;
	const fallback = message.extendedTextMessage?.contextInfo ?? message.imageMessage?.contextInfo ?? message.videoMessage?.contextInfo ?? message.documentMessage?.contextInfo ?? message.audioMessage?.contextInfo ?? message.stickerMessage?.contextInfo ?? message.buttonsResponseMessage?.contextInfo ?? message.listResponseMessage?.contextInfo ?? message.templateButtonReplyMessage?.contextInfo ?? message.interactiveResponseMessage?.contextInfo ?? message.buttonsMessage?.contextInfo ?? message.listMessage?.contextInfo;
	if (fallback) return fallback;
	for (const value of Object.values(message)) {
		if (!value || typeof value !== "object") continue;
		if ("contextInfo" in value) {
			const candidateContext = value.contextInfo;
			if (candidateContext) return candidateContext;
		}
		if ("message" in value) {
			const inner = value.message;
			if (inner) {
				const innerCtx = extractContextInfo(inner);
				if (innerCtx) return innerCtx;
			}
		}
	}
}
function extractContextInfo(message) {
	for (const candidate of buildMessageChain(message)) {
		const contextInfo = extractContextInfoFromMessage(candidate);
		if (contextInfo) return contextInfo;
	}
}
function extractMentionedJids(rawMessage) {
	const message = unwrapMessage$1(rawMessage);
	if (!message) return;
	const flattened = [
		message.extendedTextMessage?.contextInfo?.mentionedJid,
		message.imageMessage?.contextInfo?.mentionedJid,
		message.videoMessage?.contextInfo?.mentionedJid,
		message.documentMessage?.contextInfo?.mentionedJid,
		message.audioMessage?.contextInfo?.mentionedJid,
		message.stickerMessage?.contextInfo?.mentionedJid,
		message.buttonsResponseMessage?.contextInfo?.mentionedJid,
		message.listResponseMessage?.contextInfo?.mentionedJid
	].flatMap((arr) => arr ?? []).filter(Boolean);
	if (flattened.length === 0) return;
	return Array.from(new Set(flattened));
}
function extractText(rawMessage) {
	const message = unwrapMessage$1(rawMessage);
	if (!message) return;
	const extracted = extractMessage(message);
	const candidates = [message, extracted && extracted !== message ? extracted : void 0];
	for (const candidate of candidates) {
		if (!candidate) continue;
		if (typeof candidate.conversation === "string" && candidate.conversation.trim()) return candidate.conversation.trim();
		const extended = candidate.extendedTextMessage?.text;
		if (extended?.trim()) return extended.trim();
		const caption = candidate.imageMessage?.caption ?? candidate.videoMessage?.caption ?? candidate.documentMessage?.caption;
		if (caption?.trim()) return caption.trim();
	}
	const contactPlaceholder = extractContactPlaceholder(message) ?? (extracted && extracted !== message ? extractContactPlaceholder(extracted) : void 0);
	if (contactPlaceholder) return contactPlaceholder;
}
function extractMediaPlaceholder(rawMessage) {
	const message = unwrapMessage$1(rawMessage);
	if (!message) return;
	if (message.imageMessage) return "<media:image>";
	if (message.videoMessage) return "<media:video>";
	if (message.audioMessage) return "<media:audio>";
	if (message.documentMessage) return "<media:document>";
	if (message.stickerMessage) return "<media:sticker>";
}
function extractContactPlaceholder(rawMessage) {
	const message = unwrapMessage$1(rawMessage);
	if (!message) return;
	const contact = message.contactMessage ?? void 0;
	if (contact) {
		const { name, phones } = describeContact({
			displayName: contact.displayName,
			vcard: contact.vcard
		});
		return formatContactPlaceholder(name, phones);
	}
	const contactsArray = message.contactsArrayMessage?.contacts ?? void 0;
	if (!contactsArray || contactsArray.length === 0) return;
	return formatContactsPlaceholder(contactsArray.map((entry) => describeContact({
		displayName: entry.displayName,
		vcard: entry.vcard
	})).map((entry) => formatContactLabel(entry.name, entry.phones)).filter((value) => Boolean(value)), contactsArray.length);
}
function describeContact(input) {
	const displayName = (input.displayName ?? "").trim();
	const parsed = parseVcard(input.vcard ?? void 0);
	return {
		name: displayName || parsed.name,
		phones: parsed.phones
	};
}
function formatContactPlaceholder(name, phones) {
	const label = formatContactLabel(name, phones);
	if (!label) return "<contact>";
	return `<contact: ${label}>`;
}
function formatContactsPlaceholder(labels, total) {
	const cleaned = labels.map((label) => label.trim()).filter(Boolean);
	if (cleaned.length === 0) return `<contacts: ${total} ${total === 1 ? "contact" : "contacts"}>`;
	const remaining = Math.max(total - cleaned.length, 0);
	const suffix = remaining > 0 ? ` +${remaining} more` : "";
	return `<contacts: ${cleaned.join(", ")}${suffix}>`;
}
function formatContactLabel(name, phones) {
	const parts = [name, formatPhoneList(phones)].filter((value) => Boolean(value));
	if (parts.length === 0) return;
	return parts.join(", ");
}
function formatPhoneList(phones) {
	const cleaned = phones?.map((phone) => phone.trim()).filter(Boolean) ?? [];
	if (cleaned.length === 0) return;
	const { shown, remaining } = summarizeList(cleaned, cleaned.length, 1);
	const [primary] = shown;
	if (!primary) return;
	if (remaining === 0) return primary;
	return `${primary} (+${remaining} more)`;
}
function summarizeList(values, total, maxShown) {
	const shown = values.slice(0, maxShown);
	return {
		shown,
		remaining: Math.max(total - shown.length, 0)
	};
}
function extractLocationData(rawMessage) {
	const message = unwrapMessage$1(rawMessage);
	if (!message) return null;
	const live = message.liveLocationMessage ?? void 0;
	if (live) {
		const latitudeRaw = live.degreesLatitude;
		const longitudeRaw = live.degreesLongitude;
		if (latitudeRaw != null && longitudeRaw != null) {
			const latitude = latitudeRaw;
			const longitude = longitudeRaw;
			if (Number.isFinite(latitude) && Number.isFinite(longitude)) return {
				latitude,
				longitude,
				accuracy: live.accuracyInMeters ?? void 0,
				caption: live.caption ?? void 0,
				source: "live",
				isLive: true
			};
		}
	}
	const location = message.locationMessage ?? void 0;
	if (location) {
		const latitudeRaw = location.degreesLatitude;
		const longitudeRaw = location.degreesLongitude;
		if (latitudeRaw != null && longitudeRaw != null) {
			const latitude = latitudeRaw;
			const longitude = longitudeRaw;
			if (Number.isFinite(latitude) && Number.isFinite(longitude)) {
				const isLive = Boolean(location.isLive);
				return {
					latitude,
					longitude,
					accuracy: location.accuracyInMeters ?? void 0,
					name: location.name ?? void 0,
					address: location.address ?? void 0,
					caption: location.comment ?? void 0,
					source: isLive ? "live" : location.name || location.address ? "place" : "pin",
					isLive
				};
			}
		}
	}
	return null;
}
function describeReplyContext(rawMessage) {
	const message = unwrapMessage$1(rawMessage);
	if (!message) return null;
	const contextInfo = extractContextInfo(message);
	const quoted = normalizeMessage(contextInfo?.quotedMessage);
	if (!quoted) return null;
	const location = extractLocationData(quoted);
	const locationText = location ? formatLocationText(location) : void 0;
	let body = [extractText(quoted), locationText].filter(Boolean).join("\n").trim();
	if (!body) body = extractMediaPlaceholder(quoted);
	if (!body) {
		const quotedType = quoted ? getMessageContentType(quoted) : void 0;
		logVerbose(`Quoted message missing extractable body${quotedType ? ` (type ${quotedType})` : ""}`);
		return null;
	}
	const senderJid = contextInfo?.participant ?? void 0;
	const sender = resolveComparableIdentity({
		jid: senderJid,
		label: senderJid ? jidToE164(senderJid) ?? senderJid : "unknown sender"
	});
	return {
		id: contextInfo?.stanzaId || void 0,
		body,
		sender
	};
}
//#endregion
//#region extensions/whatsapp/src/inbound/lifecycle.ts
function attachEmitterListener(emitter, event, listener) {
	emitter.on(event, listener);
	return () => {
		if (typeof emitter.off === "function") {
			emitter.off(event, listener);
			return;
		}
		if (typeof emitter.removeListener === "function") emitter.removeListener(event, listener);
	};
}
function closeInboundMonitorSocket(sock) {
	sock.ws?.close?.();
}
//#endregion
//#region extensions/whatsapp/src/inbound/media.ts
function unwrapMessage(message) {
	return normalizeMessageContent$1(message);
}
/**
* Resolve the MIME type for an inbound media message.
* Falls back to WhatsApp's standard formats when Baileys omits the MIME.
*/
function resolveMediaMimetype(message) {
	const explicit = message.imageMessage?.mimetype ?? message.videoMessage?.mimetype ?? message.documentMessage?.mimetype ?? message.audioMessage?.mimetype ?? message.stickerMessage?.mimetype ?? void 0;
	if (explicit) return explicit;
	if (message.audioMessage) return "audio/ogg; codecs=opus";
	if (message.imageMessage) return "image/jpeg";
	if (message.videoMessage) return "video/mp4";
	if (message.stickerMessage) return "image/webp";
}
async function downloadInboundMedia(msg, sock) {
	const message = unwrapMessage(msg.message);
	if (!message) return;
	const mimetype = resolveMediaMimetype(message);
	const fileName = message.documentMessage?.fileName ?? void 0;
	if (!message.imageMessage && !message.videoMessage && !message.documentMessage && !message.audioMessage && !message.stickerMessage) return;
	try {
		return {
			buffer: await downloadMediaMessage(msg, "buffer", {}, {
				reuploadRequest: sock.updateMediaMessage,
				logger: sock.logger
			}),
			mimetype,
			fileName
		};
	} catch (err) {
		logVerbose(`downloadMediaMessage failed: ${String(err)}`);
		return;
	}
}
//#endregion
//#region extensions/whatsapp/src/inbound/send-api.ts
function recordWhatsAppOutbound(accountId) {
	recordChannelActivity({
		channel: "whatsapp",
		accountId,
		direction: "outbound"
	});
}
function resolveOutboundMessageId(result) {
	return typeof result === "object" && result && "key" in result ? result.key?.id ?? "unknown" : "unknown";
}
function createWebSendApi(params) {
	return {
		sendMessage: async (to, text, mediaBuffer, mediaType, sendOptions) => {
			const jid = toWhatsappJid(to);
			let payload;
			if (mediaBuffer) mediaType ??= "application/octet-stream";
			if (mediaBuffer && mediaType) if (mediaType.startsWith("image/")) payload = {
				image: mediaBuffer,
				caption: text || void 0,
				mimetype: mediaType
			};
			else if (mediaType.startsWith("audio/")) payload = {
				audio: mediaBuffer,
				ptt: true,
				mimetype: mediaType
			};
			else if (mediaType.startsWith("video/")) {
				const gifPlayback = sendOptions?.gifPlayback;
				payload = {
					video: mediaBuffer,
					caption: text || void 0,
					mimetype: mediaType,
					...gifPlayback ? { gifPlayback: true } : {}
				};
			} else payload = {
				document: mediaBuffer,
				fileName: sendOptions?.fileName?.trim() || "file",
				caption: text || void 0,
				mimetype: mediaType
			};
			else payload = { text };
			const result = await params.sock.sendMessage(jid, payload);
			recordWhatsAppOutbound(sendOptions?.accountId ?? params.defaultAccountId);
			return { messageId: resolveOutboundMessageId(result) };
		},
		sendPoll: async (to, poll) => {
			const jid = toWhatsappJid(to);
			const result = await params.sock.sendMessage(jid, { poll: {
				name: poll.question,
				values: poll.options,
				selectableCount: poll.maxSelections ?? 1
			} });
			recordWhatsAppOutbound(params.defaultAccountId);
			return { messageId: resolveOutboundMessageId(result) };
		},
		sendReaction: async (chatJid, messageId, emoji, fromMe, participant) => {
			const jid = toWhatsappJid(chatJid);
			await params.sock.sendMessage(jid, { react: {
				text: emoji,
				key: {
					remoteJid: jid,
					id: messageId,
					fromMe,
					participant: participant ? toWhatsappJid(participant) : void 0
				}
			} });
		},
		sendComposingTo: async (to) => {
			const jid = toWhatsappJid(to);
			await params.sock.sendPresenceUpdate("composing", jid);
		}
	};
}
//#endregion
//#region extensions/whatsapp/src/inbound/monitor.ts
const LOGGED_OUT_STATUS = DisconnectReason$1?.loggedOut ?? 401;
const RECONNECT_IN_PROGRESS_ERROR = "no active socket - reconnection in progress";
function isGroupJid(jid) {
	return (typeof isJidGroup === "function" ? isJidGroup(jid) : jid.endsWith("@g.us")) === true;
}
function isRetryableSendDisconnectError(err) {
	return /closed|reset|timed\s*out|disconnect|no active socket/i.test(formatError(err));
}
function shouldClearSocketRefAfterSendFailure(err) {
	return /closed|reset|disconnect|no active socket/i.test(formatError(err));
}
function isNonEmptyString(value) {
	return Boolean(value);
}
async function attachWebInboxToSocket(options) {
	const inboundLogger = getChildLogger({ module: "web-inbound" });
	const inboundConsoleLog = createSubsystemLogger("gateway/channels/whatsapp").child("inbound");
	const sock = options.sock;
	const connectedAtMs = Date.now();
	if (options.socketRef) options.socketRef.current = sock;
	const getCurrentSock = () => options.socketRef ? options.socketRef.current : sock;
	const shouldRetryDisconnect = () => options.shouldRetryDisconnect?.() === true;
	const disconnectRetryPolicy = options.disconnectRetryPolicy ?? DEFAULT_RECONNECT_POLICY;
	const sendRetryMaxAttempts = disconnectRetryPolicy.maxAttempts > 0 ? disconnectRetryPolicy.maxAttempts : DEFAULT_RECONNECT_POLICY.maxAttempts;
	let onCloseResolve = null;
	const onClose = new Promise((resolve) => {
		onCloseResolve = resolve;
	});
	const resolveClose = (reason) => {
		if (!onCloseResolve) return;
		const resolver = onCloseResolve;
		onCloseResolve = null;
		resolver(reason);
	};
	const presence = options.selfChatMode ? "unavailable" : "available";
	try {
		await sock.sendPresenceUpdate(presence);
		if (shouldLogVerbose()) logVerbose(`Sent global '${presence}' presence on connect`);
	} catch (err) {
		logVerbose(`Failed to send '${presence}' presence on connect: ${String(err)}`);
	}
	const self = await readWebSelfIdentity(options.authDir, sock.user);
	const finalizeInboundDedupe = async (entries, error) => {
		const dedupeKeys = [...new Set(entries.map((entry) => entry.dedupeKey).filter(isNonEmptyString))];
		if (dedupeKeys.length === 0) return;
		if (error instanceof WhatsAppRetryableInboundError) {
			dedupeKeys.forEach((dedupeKey) => releaseRecentInboundMessage(dedupeKey, error));
			return;
		}
		await Promise.all(dedupeKeys.map((dedupeKey) => commitRecentInboundMessage(dedupeKey)));
	};
	const debouncer = createInboundDebouncer({
		debounceMs: options.debounceMs ?? 0,
		buildKey: (msg) => {
			const sender = msg.sender;
			const senderKey = msg.chatType === "group" ? getPrimaryIdentityId(sender ?? null) ?? msg.senderJid ?? msg.senderE164 ?? msg.senderName ?? msg.from : msg.from;
			if (!senderKey) return null;
			const conversationKey = msg.chatType === "group" ? msg.chatId : msg.from;
			return `${msg.accountId}:${conversationKey}:${senderKey}`;
		},
		shouldDebounce: options.shouldDebounce,
		onFlush: async (entries) => {
			const last = entries.at(-1);
			if (!last) return;
			try {
				if (entries.length === 1) {
					await options.onMessage(last);
					await finalizeInboundDedupe(entries);
					return;
				}
				const mentioned = /* @__PURE__ */ new Set();
				for (const entry of entries) for (const jid of entry.mentions ?? entry.mentionedJids ?? []) mentioned.add(jid);
				const combinedBody = entries.map((entry) => entry.body).filter(Boolean).join("\n");
				const combinedMessage = {
					...last,
					body: combinedBody,
					mentions: mentioned.size > 0 ? Array.from(mentioned) : void 0,
					mentionedJids: mentioned.size > 0 ? Array.from(mentioned) : void 0
				};
				await options.onMessage(combinedMessage);
				await finalizeInboundDedupe(entries);
			} catch (error) {
				await finalizeInboundDedupe(entries, error);
				throw error;
			}
		},
		onError: (err) => {
			inboundLogger.error({ error: String(err) }, "failed handling inbound web message");
			inboundConsoleLog.error(`Failed handling inbound web message: ${String(err)}`);
		}
	});
	const groupMetaCache = /* @__PURE__ */ new Map();
	const GROUP_META_TTL_MS = 300 * 1e3;
	const lidLookup = sock.signalRepository?.lidMapping;
	const resolveInboundJid = async (jid) => resolveJidToE164(jid, {
		authDir: options.authDir,
		lidLookup
	});
	const rememberOutboundMessage = (remoteJid, result) => {
		const messageId = typeof result === "object" && result && "key" in result ? result.key?.id ?? "" : "";
		if (!messageId) return;
		rememberRecentOutboundMessage({
			accountId: options.accountId,
			remoteJid,
			messageId
		});
	};
	const sendTrackedMessage = async (jid, content) => {
		let lastErr = new Error(RECONNECT_IN_PROGRESS_ERROR);
		for (let attempt = 1;; attempt++) {
			const currentSock = getCurrentSock();
			if (currentSock) try {
				const result = await currentSock.sendMessage(jid, content);
				rememberOutboundMessage(jid, result);
				return result;
			} catch (err) {
				if (!shouldRetryDisconnect() || !isRetryableSendDisconnectError(err)) throw err;
				lastErr = err;
				if (shouldClearSocketRefAfterSendFailure(err) && options.socketRef?.current === currentSock) options.socketRef.current = null;
			}
			else if (!shouldRetryDisconnect()) throw lastErr;
			if (attempt >= sendRetryMaxAttempts) throw lastErr;
			const delayMs = computeBackoff(disconnectRetryPolicy, attempt);
			logVerbose(`Waiting ${delayMs}ms for WhatsApp reconnect before retrying send to ${jid}: ${formatError(lastErr)}`);
			try {
				await sleepWithAbort(delayMs, options.disconnectRetryAbortSignal);
			} catch {
				throw lastErr;
			}
		}
	};
	const getGroupMeta = async (jid) => {
		const cached = groupMetaCache.get(jid);
		if (cached && cached.expires > Date.now()) return cached;
		try {
			const meta = await sock.groupMetadata(jid);
			const participants = (await Promise.all(meta.participants?.map(async (p) => {
				return await resolveInboundJid(p.id) ?? p.id;
			}) ?? [])).filter(Boolean) ?? [];
			const entry = {
				subject: meta.subject,
				participants,
				expires: Date.now() + GROUP_META_TTL_MS
			};
			groupMetaCache.set(jid, entry);
			return entry;
		} catch (err) {
			logVerbose(`Failed to fetch group metadata for ${jid}: ${String(err)}`);
			return { expires: Date.now() + GROUP_META_TTL_MS };
		}
	};
	const normalizeInboundMessage = async (msg) => {
		const id = msg.key?.id ?? void 0;
		const remoteJid = msg.key?.remoteJid;
		if (!remoteJid) return null;
		if (remoteJid.endsWith("@status") || remoteJid.endsWith("@broadcast")) return null;
		const group = isGroupJid(remoteJid);
		if (Boolean(msg.key?.fromMe) && id && isRecentOutboundMessage({
			accountId: options.accountId,
			remoteJid,
			messageId: id
		})) {
			logVerbose(`Skipping recent outbound WhatsApp echo ${id} for ${remoteJid}`);
			return null;
		}
		const participantJid = msg.key?.participant ?? void 0;
		const from = group ? remoteJid : await resolveInboundJid(remoteJid);
		if (!from) return null;
		const senderE164 = group ? participantJid ? await resolveInboundJid(participantJid) : null : from;
		let groupSubject;
		let groupParticipants;
		if (group) {
			const meta = await getGroupMeta(remoteJid);
			groupSubject = meta.subject;
			groupParticipants = meta.participants;
		}
		const messageTimestampMs = msg.messageTimestamp ? Number(msg.messageTimestamp) * 1e3 : void 0;
		const access = await checkInboundAccessControl({
			accountId: options.accountId,
			from,
			selfE164: self.e164 ?? null,
			senderE164,
			group,
			pushName: msg.pushName ?? void 0,
			isFromMe: Boolean(msg.key?.fromMe),
			messageTimestampMs,
			connectedAtMs,
			sock: { sendMessage: (jid, content) => sendTrackedMessage(jid, content) },
			remoteJid
		});
		if (!access.allowed) return null;
		return {
			id,
			remoteJid,
			group,
			participantJid,
			from,
			senderE164,
			groupSubject,
			groupParticipants,
			messageTimestampMs,
			access
		};
	};
	const maybeMarkInboundAsRead = async (inbound) => {
		const { id, remoteJid, participantJid, access } = inbound;
		if (id && !access.isSelfChat && options.sendReadReceipts !== false) try {
			await sock.readMessages([{
				remoteJid,
				id,
				participant: participantJid,
				fromMe: false
			}]);
			if (shouldLogVerbose()) logVerbose(`Marked message ${id} as read for ${remoteJid}${participantJid ? ` (participant ${participantJid})` : ""}`);
		} catch (err) {
			logVerbose(`Failed to mark message ${id} read: ${String(err)}`);
		}
		else if (id && access.isSelfChat && shouldLogVerbose()) logVerbose(`Self-chat mode: skipping read receipt for ${id}`);
	};
	const enrichInboundMessage = async (msg) => {
		const location = extractLocationData(msg.message ?? void 0);
		const locationText = location ? formatLocationText(location) : void 0;
		let body = extractText(msg.message ?? void 0);
		if (locationText) body = [body, locationText].filter(Boolean).join("\n").trim();
		if (!body) {
			body = extractMediaPlaceholder(msg.message ?? void 0);
			if (!body) return null;
		}
		const replyContext = describeReplyContext(msg.message);
		let mediaPath;
		let mediaType;
		let mediaFileName;
		try {
			const inboundMedia = await downloadInboundMedia(msg, sock);
			if (inboundMedia) {
				const maxBytes = (typeof options.mediaMaxMb === "number" && options.mediaMaxMb > 0 ? options.mediaMaxMb : 50) * 1024 * 1024;
				mediaPath = (await saveMediaBuffer(inboundMedia.buffer, inboundMedia.mimetype, "inbound", maxBytes, inboundMedia.fileName)).path;
				mediaType = inboundMedia.mimetype;
				mediaFileName = inboundMedia.fileName;
			}
		} catch (err) {
			logVerbose(`Inbound media download failed: ${String(err)}`);
		}
		return {
			body,
			location: location ?? void 0,
			replyContext,
			mediaPath,
			mediaType,
			mediaFileName
		};
	};
	const enqueueInboundMessage = async (msg, inbound, enriched) => {
		const chatJid = inbound.remoteJid;
		const sendComposing = async () => {
			const currentSock = getCurrentSock();
			if (!currentSock) return;
			try {
				await currentSock.sendPresenceUpdate("composing", chatJid);
			} catch (err) {
				logVerbose(`Presence update failed: ${String(err)}`);
			}
		};
		const reply = async (text) => {
			await sendTrackedMessage(chatJid, { text });
		};
		const sendMedia = async (payload) => {
			await sendTrackedMessage(chatJid, payload);
		};
		const timestamp = inbound.messageTimestampMs;
		const mentionedJids = extractMentionedJids(msg.message);
		const senderName = msg.pushName ?? void 0;
		inboundLogger.info({
			from: inbound.from,
			to: self.e164 ?? "me",
			body: enriched.body,
			mediaPath: enriched.mediaPath,
			mediaType: enriched.mediaType,
			mediaFileName: enriched.mediaFileName,
			timestamp
		}, "inbound message");
		const inboundMessage = {
			id: inbound.id,
			from: inbound.from,
			conversationId: inbound.from,
			to: self.e164 ?? "me",
			accountId: inbound.access.resolvedAccountId,
			body: enriched.body,
			pushName: senderName,
			timestamp,
			chatType: inbound.group ? "group" : "direct",
			chatId: inbound.remoteJid,
			sender: resolveComparableIdentity({
				jid: inbound.participantJid,
				e164: inbound.senderE164 ?? void 0,
				name: senderName
			}),
			senderJid: inbound.participantJid,
			senderE164: inbound.senderE164 ?? void 0,
			senderName,
			replyTo: enriched.replyContext ?? void 0,
			replyToId: enriched.replyContext?.id,
			replyToBody: enriched.replyContext?.body,
			replyToSender: enriched.replyContext?.sender?.label ?? void 0,
			replyToSenderJid: enriched.replyContext?.sender?.jid ?? void 0,
			replyToSenderE164: enriched.replyContext?.sender?.e164 ?? void 0,
			groupSubject: inbound.groupSubject,
			groupParticipants: inbound.groupParticipants,
			mentions: mentionedJids ?? void 0,
			mentionedJids: mentionedJids ?? void 0,
			self,
			selfJid: self.jid ?? void 0,
			selfLid: self.lid ?? void 0,
			selfE164: self.e164 ?? void 0,
			fromMe: Boolean(msg.key?.fromMe),
			location: enriched.location ?? void 0,
			sendComposing,
			reply,
			sendMedia,
			mediaPath: enriched.mediaPath,
			mediaType: enriched.mediaType,
			mediaFileName: enriched.mediaFileName,
			dedupeKey: inbound.id ? `${options.accountId}:${inbound.remoteJid}:${inbound.id}` : void 0
		};
		try {
			Promise.resolve(debouncer.enqueue(inboundMessage)).catch((err) => {
				inboundLogger.error({ error: String(err) }, "failed handling inbound web message");
				inboundConsoleLog.error(`Failed handling inbound web message: ${String(err)}`);
			});
		} catch (err) {
			inboundLogger.error({ error: String(err) }, "failed handling inbound web message");
			inboundConsoleLog.error(`Failed handling inbound web message: ${String(err)}`);
		}
	};
	const handleMessagesUpsert = async (upsert) => {
		if (upsert.type !== "notify" && upsert.type !== "append") return;
		for (const msg of upsert.messages ?? []) {
			recordChannelActivity({
				channel: "whatsapp",
				accountId: options.accountId,
				direction: "inbound"
			});
			const inbound = await normalizeInboundMessage(msg);
			if (!inbound) continue;
			await maybeMarkInboundAsRead(inbound);
			if (upsert.type === "append") {
				const APPEND_RECENT_GRACE_MS = 6e4;
				const msgTsRaw = msg.messageTimestamp;
				const msgTsNum = msgTsRaw != null ? Number(msgTsRaw) : NaN;
				if ((Number.isFinite(msgTsNum) ? msgTsNum * 1e3 : 0) < connectedAtMs - APPEND_RECENT_GRACE_MS) continue;
			}
			const enriched = await enrichInboundMessage(msg);
			if (!enriched) continue;
			const dedupeKey = inbound.id ? `${options.accountId}:${inbound.remoteJid}:${inbound.id}` : "";
			if (dedupeKey && !await claimRecentInboundMessage(dedupeKey)) continue;
			await enqueueInboundMessage(msg, inbound, enriched);
		}
	};
	const handleConnectionUpdate = (update) => {
		try {
			if (update.connection === "close") {
				if (options.socketRef?.current === sock) options.socketRef.current = null;
				const status = getStatusCode(update.lastDisconnect?.error);
				resolveClose({
					status,
					isLoggedOut: status === LOGGED_OUT_STATUS,
					error: update.lastDisconnect?.error
				});
			}
		} catch (err) {
			inboundLogger.error({ error: String(err) }, "connection.update handler error");
			resolveClose({
				status: void 0,
				isLoggedOut: false,
				error: err
			});
		}
	};
	const detachMessagesUpsert = attachEmitterListener(sock.ev, "messages.upsert", handleMessagesUpsert);
	const detachConnectionUpdate = attachEmitterListener(sock.ev, "connection.update", handleConnectionUpdate);
	(async () => {
		try {
			const groups = await sock.groupFetchAllParticipating();
			if (shouldLogVerbose()) logVerbose(`Hydrated ${Object.keys(groups ?? {}).length} participating groups on connect`);
		} catch (err) {
			const error = String(err);
			inboundLogger.warn({ error }, "failed hydrating participating groups on connect");
			inboundConsoleLog.warn(`Failed hydrating participating groups on connect: ${error}`);
			logVerbose(`Failed to hydrate participating groups on connect: ${error}`);
		}
	})();
	return {
		close: async () => {
			try {
				detachMessagesUpsert();
				detachConnectionUpdate();
				closeInboundMonitorSocket(sock);
			} catch (err) {
				logVerbose(`Socket close failed: ${String(err)}`);
			}
		},
		onClose,
		signalClose: (reason) => {
			resolveClose(reason ?? {
				status: void 0,
				isLoggedOut: false,
				error: "closed"
			});
		},
		...createWebSendApi({
			sock: {
				sendMessage: (jid, content) => sendTrackedMessage(jid, content),
				sendPresenceUpdate: async (presence, jid) => {
					const currentSock = getCurrentSock();
					if (!currentSock) throw new Error(RECONNECT_IN_PROGRESS_ERROR);
					return currentSock.sendPresenceUpdate(presence, jid);
				}
			},
			defaultAccountId: options.accountId
		})
	};
}
async function monitorWebInbox(options) {
	const sock = await createWaSocket(false, options.verbose, { authDir: options.authDir });
	await waitForWaConnection(sock);
	return attachWebInboxToSocket({
		...options,
		sock
	});
}
//#endregion
//#region extensions/whatsapp/src/auto-reply/mentions.ts
function buildMentionConfig(cfg, agentId) {
	return {
		mentionRegexes: buildMentionRegexes(cfg, agentId),
		allowFrom: cfg.channels?.whatsapp?.allowFrom
	};
}
function resolveMentionTargets(msg, authDir) {
	return {
		normalizedMentions: getMentionIdentities(msg, authDir),
		self: getSelfIdentity(msg, authDir)
	};
}
function isBotMentionedFromTargets(msg, mentionCfg, targets) {
	const clean = (text) => normalizeMentionText(text);
	const isSelfChat = isSelfChatMode(targets.self.e164, mentionCfg.allowFrom);
	const hasMentions = targets.normalizedMentions.length > 0;
	if (hasMentions && !isSelfChat) {
		for (const mention of targets.normalizedMentions) if (identitiesOverlap(targets.self, mention)) return true;
		return false;
	} else if (hasMentions && isSelfChat) {}
	const bodyClean = clean(msg.body);
	if (mentionCfg.mentionRegexes.some((re) => re.test(bodyClean))) return true;
	if (targets.self.e164) {
		const selfDigits = targets.self.e164.replace(/\D/g, "");
		if (selfDigits) {
			if (bodyClean.replace(/[^\d]/g, "").includes(selfDigits)) return true;
			const bodyNoSpace = msg.body.replace(/[\s-]/g, "");
			if (new RegExp(`\\+?${selfDigits}`, "i").test(bodyNoSpace)) return true;
		}
	}
	return false;
}
function debugMention(msg, mentionCfg, authDir) {
	const mentionTargets = resolveMentionTargets(msg, authDir);
	return {
		wasMentioned: isBotMentionedFromTargets(msg, mentionCfg, mentionTargets),
		details: {
			from: msg.from,
			body: msg.body,
			bodyClean: normalizeMentionText(msg.body),
			mentionedJids: msg.mentions ?? msg.mentionedJids ?? null,
			normalizedMentionedJids: mentionTargets.normalizedMentions.length ? mentionTargets.normalizedMentions.map((identity) => getComparableIdentityValues(identity)) : null,
			selfJid: msg.self?.jid ?? msg.selfJid ?? null,
			selfLid: msg.self?.lid ?? msg.selfLid ?? null,
			selfE164: msg.self?.e164 ?? msg.selfE164 ?? null,
			resolvedSelf: mentionTargets.self
		}
	};
}
function resolveOwnerList(mentionCfg, selfE164) {
	const allowFrom = mentionCfg.allowFrom;
	return (Array.isArray(allowFrom) && allowFrom.length > 0 ? allowFrom : selfE164 ? [selfE164] : []).filter((entry) => Boolean(entry && entry !== "*")).map((entry) => (0, text_runtime_exports.normalizeE164)(entry)).filter((entry) => Boolean(entry));
}
//#endregion
//#region extensions/whatsapp/src/auto-reply/monitor-state.ts
function cloneStatus(status) {
	return {
		...status,
		lastDisconnect: status.lastDisconnect ? { ...status.lastDisconnect } : null
	};
}
function isTerminalHealthState(healthState) {
	return healthState === "conflict" || healthState === "logged-out" || healthState === "stopped";
}
function createWebChannelStatusController(statusSink) {
	const status = {
		running: true,
		connected: false,
		reconnectAttempts: 0,
		lastConnectedAt: null,
		lastDisconnect: null,
		lastInboundAt: null,
		lastMessageAt: null,
		lastEventAt: null,
		lastError: null,
		healthState: "starting"
	};
	const emit = () => {
		statusSink?.(cloneStatus(status));
	};
	return {
		emit,
		snapshot: () => status,
		noteConnected(at = Date.now()) {
			Object.assign(status, createConnectedChannelStatusPatch(at));
			status.lastError = null;
			status.healthState = "healthy";
			emit();
		},
		noteInbound(at = Date.now()) {
			status.lastInboundAt = at;
			status.lastMessageAt = at;
			status.lastEventAt = at;
			if (status.connected) status.healthState = "healthy";
			emit();
		},
		noteWatchdogStale(at = Date.now()) {
			status.lastEventAt = at;
			if (status.connected) status.healthState = "stale";
			emit();
		},
		noteReconnectAttempts(reconnectAttempts) {
			status.reconnectAttempts = reconnectAttempts;
			emit();
		},
		noteClose(params) {
			const at = params.at ?? Date.now();
			status.connected = false;
			status.lastEventAt = at;
			status.lastDisconnect = {
				at,
				status: params.statusCode,
				error: params.error,
				loggedOut: Boolean(params.loggedOut)
			};
			status.lastError = params.error ?? null;
			status.reconnectAttempts = params.reconnectAttempts;
			status.healthState = params.healthState;
			emit();
		},
		markStopped(at = Date.now()) {
			status.running = false;
			status.connected = false;
			status.lastEventAt = at;
			if (!isTerminalHealthState(status.healthState)) status.healthState = "stopped";
			emit();
		}
	};
}
//#endregion
//#region extensions/whatsapp/src/auto-reply/monitor/echo.ts
function createEchoTracker(params) {
	const recentlySent = /* @__PURE__ */ new Set();
	const maxItems = Math.max(1, params.maxItems ?? 100);
	const buildCombinedKey = (p) => `combined:${p.sessionKey}:${p.combinedBody}`;
	const trim = () => {
		while (recentlySent.size > maxItems) {
			const firstKey = recentlySent.values().next().value;
			if (!firstKey) break;
			recentlySent.delete(firstKey);
		}
	};
	const rememberText = (text, opts) => {
		if (!text) return;
		recentlySent.add(text);
		if (opts.combinedBody && opts.combinedBodySessionKey) recentlySent.add(buildCombinedKey({
			sessionKey: opts.combinedBodySessionKey,
			combinedBody: opts.combinedBody
		}));
		if (opts.logVerboseMessage) params.logVerbose?.(`Added to echo detection set (size now: ${recentlySent.size}): ${text.substring(0, 50)}...`);
		trim();
	};
	return {
		rememberText,
		has: (key) => recentlySent.has(key),
		forget: (key) => {
			recentlySent.delete(key);
		},
		buildCombinedKey
	};
}
//#endregion
//#region extensions/whatsapp/src/auto-reply/monitor/broadcast.ts
function buildBroadcastRouteKeys(params) {
	const sessionKey = buildAgentSessionKey({
		agentId: params.agentId,
		channel: "whatsapp",
		accountId: params.route.accountId,
		peer: {
			kind: params.msg.chatType === "group" ? "group" : "direct",
			id: params.peerId
		},
		dmScope: params.cfg.session?.dmScope,
		identityLinks: params.cfg.session?.identityLinks
	});
	const mainSessionKey = buildAgentMainSessionKey({
		agentId: params.agentId,
		mainKey: DEFAULT_MAIN_KEY
	});
	return {
		sessionKey,
		mainSessionKey,
		lastRoutePolicy: deriveLastRoutePolicy({
			sessionKey,
			mainSessionKey
		})
	};
}
async function maybeBroadcastMessage(params) {
	const broadcastAgents = params.cfg.broadcast?.[params.peerId];
	if (!broadcastAgents || !Array.isArray(broadcastAgents)) return false;
	if (broadcastAgents.length === 0) return false;
	const strategy = params.cfg.broadcast?.strategy || "parallel";
	whatsappInboundLog.info(`Broadcasting message to ${broadcastAgents.length} agents (${strategy})`);
	const agentIds = params.cfg.agents?.list?.map((agent) => normalizeAgentId(agent.id));
	const hasKnownAgents = (agentIds?.length ?? 0) > 0;
	const groupHistorySnapshot = params.msg.chatType === "group" ? params.groupHistories.get(params.groupHistoryKey) ?? [] : void 0;
	const processForAgent = async (agentId) => {
		const normalizedAgentId = normalizeAgentId(agentId);
		if (hasKnownAgents && !agentIds?.includes(normalizedAgentId)) {
			whatsappInboundLog.warn(`Broadcast agent ${agentId} not found in agents.list; skipping`);
			return false;
		}
		const routeKeys = buildBroadcastRouteKeys({
			cfg: params.cfg,
			msg: params.msg,
			route: params.route,
			peerId: params.peerId,
			agentId: normalizedAgentId
		});
		const agentRoute = {
			...params.route,
			agentId: normalizedAgentId,
			...routeKeys
		};
		try {
			return await params.processMessage(params.msg, agentRoute, params.groupHistoryKey, {
				groupHistory: groupHistorySnapshot,
				suppressGroupHistoryClear: true
			});
		} catch (err) {
			whatsappInboundLog.error(`Broadcast agent ${agentId} failed: ${formatError(err)}`);
			return false;
		}
	};
	if (strategy === "sequential") for (const agentId of broadcastAgents) await processForAgent(agentId);
	else await Promise.allSettled(broadcastAgents.map(processForAgent));
	if (params.msg.chatType === "group") params.groupHistories.set(params.groupHistoryKey, []);
	return true;
}
//#endregion
//#region extensions/whatsapp/src/auto-reply/monitor/commands.ts
function stripMentionsForCommand(text, mentionRegexes, selfE164) {
	let result = text;
	for (const re of mentionRegexes) result = result.replace(re, " ");
	if (selfE164) {
		const digits = selfE164.replace(/\D/g, "");
		if (digits) {
			const pattern = new RegExp(`\\+?${digits}`, "g");
			result = result.replace(pattern, " ");
		}
	}
	return result.replace(/\s+/g, " ").trim();
}
//#endregion
//#region extensions/whatsapp/src/auto-reply/monitor/group-activation.ts
function resolveGroupPolicyFor(cfg, conversationId) {
	const groupId = resolveGroupSessionKey({
		From: conversationId,
		ChatType: "group",
		Provider: "whatsapp"
	})?.id;
	const whatsappCfg = cfg.channels?.whatsapp;
	const hasGroupAllowFrom = Boolean(whatsappCfg?.groupAllowFrom?.length || whatsappCfg?.allowFrom?.length);
	return resolveChannelGroupPolicy({
		cfg,
		channel: "whatsapp",
		groupId: groupId ?? conversationId,
		hasGroupAllowFrom
	});
}
function resolveGroupRequireMentionFor(cfg, conversationId) {
	const groupId = resolveGroupSessionKey({
		From: conversationId,
		ChatType: "group",
		Provider: "whatsapp"
	})?.id;
	return resolveChannelGroupRequireMention({
		cfg,
		channel: "whatsapp",
		groupId: groupId ?? conversationId
	});
}
function resolveGroupActivationFor(params) {
	const entry = loadSessionStore(resolveStorePath(params.cfg.session?.store, { agentId: params.agentId }))[params.sessionKey];
	const defaultActivation = !resolveGroupRequireMentionFor(params.cfg, params.conversationId) ? "always" : "mention";
	return normalizeGroupActivation(entry?.groupActivation) ?? defaultActivation;
}
//#endregion
//#region extensions/whatsapp/src/auto-reply/monitor/group-members.ts
function appendNormalizedUnique(entries, seen, ordered) {
	for (const entry of entries) {
		const normalized = (0, text_runtime_exports.normalizeE164)(entry) ?? entry;
		if (!normalized || seen.has(normalized)) continue;
		seen.add(normalized);
		ordered.push(normalized);
	}
}
function noteGroupMember(groupMemberNames, conversationId, e164, name) {
	if (!e164 || !name) return;
	const key = (0, text_runtime_exports.normalizeE164)(e164) ?? e164;
	if (!key) return;
	let roster = groupMemberNames.get(conversationId);
	if (!roster) {
		roster = /* @__PURE__ */ new Map();
		groupMemberNames.set(conversationId, roster);
	}
	roster.set(key, name);
}
function formatGroupMembers(params) {
	const { participants, roster, fallbackE164 } = params;
	const seen = /* @__PURE__ */ new Set();
	const ordered = [];
	if (participants?.length) appendNormalizedUnique(participants, seen, ordered);
	if (roster) appendNormalizedUnique(roster.keys(), seen, ordered);
	if (ordered.length === 0 && fallbackE164) {
		const normalized = (0, text_runtime_exports.normalizeE164)(fallbackE164) ?? fallbackE164;
		if (normalized) ordered.push(normalized);
	}
	if (ordered.length === 0) return;
	return ordered.map((entry) => {
		const name = roster?.get(entry);
		return name ? `${name} (${entry})` : entry;
	}).join(", ");
}
//#endregion
//#region extensions/whatsapp/src/auto-reply/monitor/group-gating.ts
function isOwnerSender(baseMentionConfig, msg) {
	const sender = (0, text_runtime_exports.normalizeE164)(getSenderIdentity(msg).e164 ?? "");
	if (!sender) return false;
	return resolveOwnerList(baseMentionConfig, getSelfIdentity(msg).e164 ?? void 0).includes(sender);
}
function recordPendingGroupHistoryEntry(params) {
	const senderIdentity = getSenderIdentity(params.msg);
	const sender = senderIdentity.name && senderIdentity.e164 ? `${senderIdentity.name} (${senderIdentity.e164})` : senderIdentity.name ?? senderIdentity.e164 ?? getPrimaryIdentityId(senderIdentity) ?? "Unknown";
	recordPendingHistoryEntryIfEnabled({
		historyMap: params.groupHistories,
		historyKey: params.groupHistoryKey,
		limit: params.groupHistoryLimit,
		entry: {
			sender,
			body: params.msg.body,
			timestamp: params.msg.timestamp,
			id: params.msg.id,
			senderJid: senderIdentity.jid ?? params.msg.senderJid
		}
	});
}
function skipGroupMessageAndStoreHistory(params, verboseMessage) {
	params.logVerbose(verboseMessage);
	recordPendingGroupHistoryEntry({
		msg: params.msg,
		groupHistories: params.groupHistories,
		groupHistoryKey: params.groupHistoryKey,
		groupHistoryLimit: params.groupHistoryLimit
	});
	return { shouldProcess: false };
}
function applyGroupGating(params) {
	const sender = getSenderIdentity(params.msg);
	const self = getSelfIdentity(params.msg, params.authDir);
	const groupPolicy = resolveGroupPolicyFor(params.cfg, params.conversationId);
	if (groupPolicy.allowlistEnabled && !groupPolicy.allowed) {
		params.logVerbose(`Skipping group message ${params.conversationId} (not in allowlist)`);
		return { shouldProcess: false };
	}
	noteGroupMember(params.groupMemberNames, params.groupHistoryKey, sender.e164 ?? void 0, sender.name ?? void 0);
	const mentionConfig = buildMentionConfig(params.cfg, params.agentId);
	const commandBody = stripMentionsForCommand(params.msg.body, mentionConfig.mentionRegexes, self.e164);
	const activationCommand = parseActivationCommand(commandBody);
	const owner = isOwnerSender(params.baseMentionConfig, params.msg);
	const shouldBypassMention = owner && hasControlCommand$1(commandBody, params.cfg);
	if (activationCommand.hasCommand && !owner) return skipGroupMessageAndStoreHistory(params, `Ignoring /activation from non-owner in group ${params.conversationId}`);
	const mentionDebug = debugMention(params.msg, mentionConfig, params.authDir);
	params.replyLogger.debug({
		conversationId: params.conversationId,
		wasMentioned: mentionDebug.wasMentioned,
		...mentionDebug.details
	}, "group mention debug");
	const wasMentioned = mentionDebug.wasMentioned;
	const requireMention = resolveGroupActivationFor({
		cfg: params.cfg,
		agentId: params.agentId,
		sessionKey: params.sessionKey,
		conversationId: params.conversationId
	}) !== "always";
	const replyContext = getReplyContext(params.msg, params.authDir);
	const mentionDecision = resolveInboundMentionDecision({
		facts: {
			canDetectMention: true,
			wasMentioned,
			implicitMentionKinds: implicitMentionKindWhen("quoted_bot", !(params.selfChatMode === true && identitiesOverlap(self, sender)) && identitiesOverlap(self, replyContext?.sender))
		},
		policy: {
			isGroup: true,
			requireMention,
			allowTextCommands: false,
			hasControlCommand: false,
			commandAuthorized: false
		}
	});
	const effectiveWasMentioned = mentionDecision.effectiveWasMentioned || shouldBypassMention;
	params.msg.wasMentioned = effectiveWasMentioned;
	if (!shouldBypassMention && requireMention && mentionDecision.shouldSkip) return skipGroupMessageAndStoreHistory(params, `Group message stored for context (no mention detected) in ${params.conversationId}: ${params.msg.body}`);
	return { shouldProcess: true };
}
//#endregion
//#region extensions/whatsapp/src/auto-reply/monitor/last-route.ts
function trackBackgroundTask(backgroundTasks, task) {
	backgroundTasks.add(task);
	const cleanup = () => {
		backgroundTasks.delete(task);
	};
	task.then(cleanup, cleanup);
}
function updateLastRouteInBackground(params) {
	const storePath = resolveStorePath(params.cfg.session?.store, { agentId: params.storeAgentId });
	const task = updateLastRoute({
		storePath,
		sessionKey: params.sessionKey,
		deliveryContext: {
			channel: params.channel,
			to: params.to,
			accountId: params.accountId
		},
		ctx: params.ctx
	}).catch((err) => {
		params.warn({
			error: formatError(err),
			storePath,
			sessionKey: params.sessionKey,
			to: params.to
		}, "failed updating last route");
	});
	trackBackgroundTask(params.backgroundTasks, task);
}
//#endregion
//#region extensions/whatsapp/src/auto-reply/monitor/peer.ts
function resolvePeerId(msg) {
	if (msg.chatType === "group") return msg.conversationId ?? msg.from;
	const sender = getSenderIdentity(msg);
	if (sender.e164) return (0, text_runtime_exports.normalizeE164)(sender.e164) ?? sender.e164;
	if (msg.from.includes("@")) return jidToE164(msg.from) ?? msg.from;
	return (0, text_runtime_exports.normalizeE164)(msg.from) ?? msg.from;
}
//#endregion
//#region extensions/whatsapp/src/auto-reply/util.ts
function elide(text, limit = 400) {
	if (!text) return text;
	if (text.length <= limit) return text;
	return `${text.slice(0, limit)}… (truncated ${text.length - limit} chars)`;
}
function isLikelyWhatsAppCryptoError(reason) {
	const formatReason = (value) => {
		if (value == null) return "";
		if (typeof value === "string") return value;
		if (value instanceof Error) return `${value.message}\n${value.stack ?? ""}`;
		if (typeof value === "object") try {
			return JSON.stringify(value);
		} catch {
			return Object.prototype.toString.call(value);
		}
		if (typeof value === "number") return String(value);
		if (typeof value === "boolean") return String(value);
		if (typeof value === "bigint") return String(value);
		if (typeof value === "symbol") return value.description ?? value.toString();
		if (typeof value === "function") return value.name ? `[function ${value.name}]` : "[function]";
		return Object.prototype.toString.call(value);
	};
	const haystack = normalizeLowercaseStringOrEmpty(reason instanceof Error ? `${reason.message}\n${reason.stack ?? ""}` : formatReason(reason));
	if (!(haystack.includes("unsupported state or unable to authenticate data") || haystack.includes("bad mac"))) return false;
	return haystack.includes("@whiskeysockets/baileys") || haystack.includes("baileys") || haystack.includes("noise-handler") || haystack.includes("aesdecryptgcm");
}
//#endregion
//#region extensions/whatsapp/src/auto-reply/deliver-reply.ts
const REASONING_PREFIX = "reasoning:";
function shouldSuppressReasoningReply(payload) {
	if (payload.isReasoning === true) return true;
	const text = payload.text;
	if (typeof text !== "string") return false;
	return normalizeLowercaseStringOrEmpty(text.trimStart()).startsWith(REASONING_PREFIX);
}
async function deliverWebReply(params) {
	const { replyResult, msg, maxMediaBytes, textLimit, replyLogger, connectionId, skipLog } = params;
	const replyStarted = Date.now();
	if (shouldSuppressReasoningReply(replyResult)) {
		whatsappOutboundLog.debug(`Suppressed reasoning payload to ${msg.from}`);
		return;
	}
	const tableMode = params.tableMode ?? "code";
	const chunkMode = params.chunkMode ?? "length";
	const textChunks = chunkMarkdownTextWithMode(markdownToWhatsApp((0, text_runtime_exports.convertMarkdownTables)(replyResult.text || "", tableMode)), textLimit, chunkMode);
	const mediaList = resolveOutboundMediaUrls(replyResult);
	const sendWithRetry = async (fn, label, maxAttempts = 3) => {
		let lastErr;
		for (let attempt = 1; attempt <= maxAttempts; attempt++) try {
			return await fn();
		} catch (err) {
			lastErr = err;
			const errText = formatError(err);
			const isLast = attempt === maxAttempts;
			if (!/closed|reset|timed\s*out|disconnect/i.test(errText) || isLast) throw err;
			const backoffMs = 500 * attempt;
			logVerbose(`Retrying ${label} to ${msg.from} after failure (${attempt}/${maxAttempts - 1}) in ${backoffMs}ms: ${errText}`);
			await (0, text_runtime_exports.sleep)(backoffMs);
		}
		throw lastErr;
	};
	if (mediaList.length === 0 && textChunks.length) {
		const totalChunks = textChunks.length;
		for (const [index, chunk] of textChunks.entries()) {
			const chunkStarted = Date.now();
			await sendWithRetry(() => msg.reply(chunk), "text");
			if (!skipLog) {
				const durationMs = Date.now() - chunkStarted;
				whatsappOutboundLog.debug(`Sent chunk ${index + 1}/${totalChunks} to ${msg.from} (${durationMs.toFixed(0)}ms)`);
			}
		}
		replyLogger.info({
			correlationId: msg.id ?? newConnectionId(),
			connectionId: connectionId ?? null,
			to: msg.from,
			from: msg.to,
			text: elide(replyResult.text, 240),
			mediaUrl: null,
			mediaSizeBytes: null,
			mediaKind: null,
			durationMs: Date.now() - replyStarted
		}, "auto-reply sent (text)");
		return;
	}
	const remainingText = [...textChunks];
	await sendMediaWithLeadingCaption({
		mediaUrls: mediaList,
		caption: remainingText.shift() || "",
		send: async ({ mediaUrl, caption }) => {
			const media = await loadWebMedia$1(mediaUrl, {
				maxBytes: maxMediaBytes,
				localRoots: params.mediaLocalRoots
			});
			if (shouldLogVerbose()) {
				logVerbose(`Web auto-reply media size: ${(media.buffer.length / (1024 * 1024)).toFixed(2)}MB`);
				logVerbose(`Web auto-reply media source: ${mediaUrl} (kind ${media.kind})`);
			}
			if (media.kind === "image") await sendWithRetry(() => msg.sendMedia({
				image: media.buffer,
				caption,
				mimetype: media.contentType
			}), "media:image");
			else if (media.kind === "audio") await sendWithRetry(() => msg.sendMedia({
				audio: media.buffer,
				ptt: true,
				mimetype: media.contentType,
				caption
			}), "media:audio");
			else if (media.kind === "video") await sendWithRetry(() => msg.sendMedia({
				video: media.buffer,
				caption,
				mimetype: media.contentType
			}), "media:video");
			else {
				const fileName = media.fileName ?? mediaUrl.split("/").pop() ?? "file";
				const mimetype = media.contentType ?? "application/octet-stream";
				await sendWithRetry(() => msg.sendMedia({
					document: media.buffer,
					fileName,
					caption,
					mimetype
				}), "media:document");
			}
			whatsappOutboundLog.info(`Sent media reply to ${msg.from} (${(media.buffer.length / (1024 * 1024)).toFixed(2)}MB)`);
			replyLogger.info({
				correlationId: msg.id ?? newConnectionId(),
				connectionId: connectionId ?? null,
				to: msg.from,
				from: msg.to,
				text: caption ?? null,
				mediaUrl,
				mediaSizeBytes: media.buffer.length,
				mediaKind: media.kind,
				durationMs: Date.now() - replyStarted
			}, "auto-reply sent (media)");
		},
		onError: async ({ error, mediaUrl, caption, isFirst }) => {
			whatsappOutboundLog.error(`Failed sending web media to ${msg.from}: ${formatError(error)}`);
			replyLogger.warn({
				err: error,
				mediaUrl
			}, "failed to send web media reply");
			if (!isFirst) return;
			const warning = error instanceof Error ? `⚠️ Media failed: ${error.message}` : "⚠️ Media failed.";
			const fallbackText = [remainingText.shift() ?? caption ?? "", warning].filter(Boolean).join("\n");
			if (!fallbackText) return;
			whatsappOutboundLog.warn(`Media skipped; sent text-only to ${msg.from}`);
			await msg.reply(fallbackText);
		}
	});
	for (const chunk of remainingText) await msg.reply(chunk);
}
//#endregion
//#region extensions/whatsapp/src/auto-reply/monitor/ack-reaction.ts
function maybeSendAckReaction(params) {
	if (!params.msg.id) return;
	if (resolveWhatsAppReactionLevel({
		cfg: params.cfg,
		accountId: params.accountId
	}).level === "off") return;
	const ackConfig = params.cfg.channels?.whatsapp?.ackReaction;
	const emoji = (ackConfig?.emoji ?? "").trim();
	const directEnabled = ackConfig?.direct ?? true;
	const groupMode = ackConfig?.group ?? "mentions";
	const conversationIdForCheck = params.msg.conversationId ?? params.msg.from;
	const activation = params.msg.chatType === "group" ? resolveGroupActivationFor({
		cfg: params.cfg,
		agentId: params.agentId,
		sessionKey: params.sessionKey,
		conversationId: conversationIdForCheck
	}) : null;
	const shouldSendReaction = () => shouldAckReactionForWhatsApp({
		emoji,
		isDirect: params.msg.chatType === "direct",
		isGroup: params.msg.chatType === "group",
		directEnabled,
		groupMode,
		wasMentioned: params.msg.wasMentioned === true,
		groupActivated: activation === "always"
	});
	if (!shouldSendReaction()) return;
	params.info({
		chatId: params.msg.chatId,
		messageId: params.msg.id,
		emoji
	}, "sending ack reaction");
	const sender = getSenderIdentity(params.msg);
	sendReactionWhatsApp(params.msg.chatId, params.msg.id, emoji, {
		verbose: params.verbose,
		fromMe: false,
		participant: sender.jid ?? void 0,
		accountId: params.accountId
	}).catch((err) => {
		params.warn({
			error: formatError(err),
			chatId: params.msg.chatId,
			messageId: params.msg.id
		}, "failed to send ack reaction");
		logVerbose(`WhatsApp ack reaction failed for chat ${params.msg.chatId}: ${formatError(err)}`);
	});
}
//#endregion
//#region extensions/whatsapp/src/auto-reply/monitor/inbound-context.ts
function isWhatsAppSupplementalSenderAllowed(params) {
	if (params.allowFrom.includes("*")) return true;
	const senderValues = new Set(getComparableIdentityValues(params.sender));
	if (senderValues.size === 0) return false;
	for (const entry of params.allowFrom) {
		const rawEntry = entry.trim();
		if (!rawEntry) continue;
		const normalizedEntry = (0, text_runtime_exports.normalizeE164)(rawEntry);
		if (normalizedEntry && senderValues.has(normalizedEntry) || senderValues.has(rawEntry)) return true;
	}
	return false;
}
function resolveVisibleWhatsAppGroupHistory(params) {
	if (params.groupPolicy !== "allowlist") return params.history;
	return filterSupplementalContextItems({
		items: params.history,
		mode: params.mode,
		kind: "history",
		isSenderAllowed: (entry) => isWhatsAppSupplementalSenderAllowed({
			allowFrom: params.groupAllowFrom,
			sender: entry.senderJid ? { jid: entry.senderJid } : null
		})
	}).items;
}
function resolveVisibleWhatsAppReplyContext(params) {
	const replyTo = getReplyContext(params.msg, params.authDir);
	if (!replyTo) return null;
	return evaluateSupplementalContextVisibility({
		mode: params.mode,
		kind: "quote",
		senderAllowed: params.msg.chatType !== "group" || params.groupPolicy !== "allowlist" ? true : isWhatsAppSupplementalSenderAllowed({
			allowFrom: params.groupAllowFrom,
			sender: replyTo.sender
		})
	}).include ? replyTo : null;
}
//#endregion
//#region extensions/whatsapp/src/auto-reply/monitor/inbound-dispatch.ts
function resolveWhatsAppDisableBlockStreaming(cfg) {
	if (typeof cfg.channels?.whatsapp?.blockStreaming !== "boolean") return;
	return !cfg.channels.whatsapp.blockStreaming;
}
function shouldSuppressWhatsAppPayload(payload, info) {
	if (info.kind === "tool") return true;
	if (payload.isReasoning === true || payload.isCompactionNotice === true) return true;
	return false;
}
function resolveWhatsAppResponsePrefix(params) {
	const configuredResponsePrefix = params.cfg.messages?.responsePrefix;
	return params.pipelineResponsePrefix ?? (configuredResponsePrefix === void 0 && params.isSelfChat ? resolveIdentityNamePrefix(params.cfg, params.agentId) : void 0);
}
function buildWhatsAppInboundContext(params) {
	const inboundHistory = params.msg.chatType === "group" ? (params.groupHistory ?? []).map((entry) => ({
		sender: entry.sender,
		body: entry.body,
		timestamp: entry.timestamp
	})) : void 0;
	return finalizeInboundContext({
		Body: params.combinedBody,
		BodyForAgent: params.msg.body,
		InboundHistory: inboundHistory,
		RawBody: params.msg.body,
		CommandBody: params.msg.body,
		From: params.msg.from,
		To: params.msg.to,
		SessionKey: params.route.sessionKey,
		AccountId: params.route.accountId,
		MessageSid: params.msg.id,
		ReplyToId: params.visibleReplyTo?.id,
		ReplyToBody: params.visibleReplyTo?.body,
		ReplyToSender: params.visibleReplyTo?.sender?.label,
		MediaPath: params.msg.mediaPath,
		MediaUrl: params.msg.mediaUrl,
		MediaType: params.msg.mediaType,
		ChatType: params.msg.chatType,
		Timestamp: params.msg.timestamp,
		ConversationLabel: params.msg.chatType === "group" ? params.conversationId : params.msg.from,
		GroupSubject: params.msg.groupSubject,
		GroupMembers: formatGroupMembers({
			participants: params.msg.groupParticipants,
			roster: params.groupMemberRoster,
			fallbackE164: params.sender.e164
		}),
		SenderName: params.sender.name,
		SenderId: params.sender.id ?? params.sender.e164,
		SenderE164: params.sender.e164,
		CommandAuthorized: params.commandAuthorized,
		WasMentioned: params.msg.wasMentioned,
		...params.msg.location ? toLocationContext(params.msg.location) : {},
		Provider: "whatsapp",
		Surface: "whatsapp",
		OriginatingChannel: "whatsapp",
		OriginatingTo: params.msg.from
	});
}
function resolveWhatsAppDmRouteTarget(params) {
	if (params.msg.chatType === "group") return;
	if (params.senderE164) return params.normalizeE164(params.senderE164) ?? void 0;
	if (params.msg.from.includes("@")) return jidToE164(params.msg.from) ?? void 0;
	return params.normalizeE164(params.msg.from) ?? void 0;
}
function updateWhatsAppMainLastRoute(params) {
	const shouldUpdateMainLastRoute = !params.pinnedMainDmRecipient || params.pinnedMainDmRecipient === params.dmRouteTarget;
	const inboundLastRouteSessionKey = resolveInboundLastRouteSessionKey({
		route: params.route,
		sessionKey: params.route.sessionKey
	});
	if (params.dmRouteTarget && inboundLastRouteSessionKey === params.route.mainSessionKey && shouldUpdateMainLastRoute) {
		params.updateLastRoute({
			cfg: params.cfg,
			backgroundTasks: params.backgroundTasks,
			storeAgentId: params.route.agentId,
			sessionKey: params.route.mainSessionKey,
			channel: "whatsapp",
			to: params.dmRouteTarget,
			accountId: params.route.accountId,
			ctx: params.ctx,
			warn: params.warn
		});
		return;
	}
	if (params.dmRouteTarget && inboundLastRouteSessionKey === params.route.mainSessionKey && params.pinnedMainDmRecipient) logVerbose$1(`Skipping main-session last route update for ${params.dmRouteTarget} (pinned owner ${params.pinnedMainDmRecipient})`);
}
async function dispatchWhatsAppBufferedReply(params) {
	const textLimit = params.maxMediaTextChunkLimit ?? resolveTextChunkLimit(params.cfg, "whatsapp");
	const chunkMode = resolveChunkMode(params.cfg, "whatsapp", params.route.accountId);
	const tableMode = resolveMarkdownTableMode$1({
		cfg: params.cfg,
		channel: "whatsapp",
		accountId: params.route.accountId
	});
	const mediaLocalRoots = getAgentScopedMediaLocalRoots(params.cfg, params.route.agentId);
	const disableBlockStreaming = resolveWhatsAppDisableBlockStreaming(params.cfg);
	let didSendReply = false;
	let didLogHeartbeatStrip = false;
	const { queuedFinal, counts } = await dispatchReplyWithBufferedBlockDispatcher({
		ctx: params.context,
		cfg: params.cfg,
		replyResolver: params.replyResolver,
		dispatcherOptions: {
			...params.replyPipeline,
			onHeartbeatStrip: () => {
				if (!didLogHeartbeatStrip) {
					didLogHeartbeatStrip = true;
					logVerbose$1("Stripped stray HEARTBEAT_OK token from web reply");
				}
			},
			deliver: async (payload, info) => {
				if (shouldSuppressWhatsAppPayload(payload, info)) return;
				await params.deliverReply({
					replyResult: payload,
					msg: params.msg,
					mediaLocalRoots,
					maxMediaBytes: params.maxMediaBytes,
					textLimit,
					chunkMode,
					replyLogger: params.replyLogger,
					connectionId: params.connectionId,
					skipLog: false,
					tableMode
				});
				didSendReply = true;
				const shouldLog = payload.text ? true : void 0;
				params.rememberSentText(payload.text, {
					combinedBody: params.context.Body,
					combinedBodySessionKey: params.route.sessionKey,
					logVerboseMessage: shouldLog
				});
				const fromDisplay = params.msg.chatType === "group" ? params.conversationId : params.msg.from ?? "unknown";
				const reply = resolveSendableOutboundReplyParts$1(payload);
				if (shouldLogVerbose$1()) logVerbose$1(`Reply body: ${payload.text != null ? reply.text : "<media>"}${reply.hasMedia ? " (media)" : ""} -> ${fromDisplay}`);
			},
			onReplyStart: params.msg.sendComposing
		},
		replyOptions: {
			disableBlockStreaming,
			onModelSelected: params.onModelSelected
		}
	});
	if (!(queuedFinal || counts.block > 0 || counts.final > 0)) {
		if (params.shouldClearGroupHistory) params.groupHistories.set(params.groupHistoryKey, []);
		logVerbose$1("Skipping auto-reply: silent token or no text/media returned from resolver");
		return false;
	}
	if (params.shouldClearGroupHistory) params.groupHistories.set(params.groupHistoryKey, []);
	return didSendReply;
}
//#endregion
//#region extensions/whatsapp/src/auto-reply/monitor/message-line.ts
function formatReplyContext(msg) {
	const replyTo = getReplyContext(msg);
	if (!replyTo?.body) return null;
	return `[Replying to ${replyTo.sender?.label ?? replyTo.sender?.e164 ?? "unknown sender"}${replyTo.id ? ` id:${replyTo.id}` : ""}]\n${replyTo.body}\n[/Replying]`;
}
function buildInboundLine(params) {
	const { cfg, msg, agentId, previousTimestamp, envelope } = params;
	const messagePrefix = resolveMessagePrefix(cfg, agentId, {
		configured: cfg.channels?.whatsapp?.messagePrefix,
		hasAllowFrom: (cfg.channels?.whatsapp?.allowFrom?.length ?? 0) > 0
	});
	const prefixStr = messagePrefix ? `${messagePrefix} ` : "";
	const replyContext = formatReplyContext(msg);
	const baseLine = `${prefixStr}${msg.body}${replyContext ? `\n\n${replyContext}` : ""}`;
	const sender = getSenderIdentity(msg);
	return formatInboundEnvelope({
		channel: "WhatsApp",
		from: msg.chatType === "group" ? msg.from : msg.from?.replace(/^whatsapp:/, ""),
		timestamp: msg.timestamp,
		body: baseLine,
		chatType: msg.chatType,
		sender: {
			name: sender.name ?? void 0,
			e164: sender.e164 ?? void 0,
			id: getPrimaryIdentityId(sender) ?? void 0
		},
		previousTimestamp,
		envelope,
		fromMe: msg.fromMe
	});
}
//#endregion
//#region extensions/whatsapp/src/auto-reply/monitor/process-message.ts
async function resolveWhatsAppCommandAuthorized(params) {
	const useAccessGroups = params.cfg.commands?.useAccessGroups !== false;
	if (!useAccessGroups) return true;
	const isGroup = params.msg.chatType === "group";
	const sender = getSenderIdentity(params.msg);
	const self = getSelfIdentity(params.msg);
	const senderE164 = (0, text_runtime_exports.normalizeE164)(isGroup ? sender.e164 ?? "" : sender.e164 ?? params.msg.from ?? "");
	if (!senderE164) return false;
	const account = resolveWhatsAppAccount({
		cfg: params.cfg,
		accountId: params.msg.accountId
	});
	const dmPolicy = account.dmPolicy ?? "pairing";
	const groupPolicy = account.groupPolicy ?? "allowlist";
	const configuredAllowFrom = account.allowFrom ?? [];
	const configuredGroupAllowFrom = account.groupAllowFrom ?? (configuredAllowFrom.length > 0 ? configuredAllowFrom : void 0);
	const storeAllowFrom = isGroup ? [] : await readStoreAllowFromForDmPolicy$1({
		provider: "whatsapp",
		accountId: params.msg.accountId,
		dmPolicy
	});
	return resolveDmGroupAccessWithCommandGate({
		isGroup,
		dmPolicy,
		groupPolicy,
		allowFrom: configuredAllowFrom.length > 0 ? configuredAllowFrom : self.e164 ? [self.e164] : [],
		groupAllowFrom: configuredGroupAllowFrom,
		storeAllowFrom,
		isSenderAllowed: (allowEntries) => {
			if (allowEntries.includes("*")) return true;
			return allowEntries.map((entry) => (0, text_runtime_exports.normalizeE164)(entry)).filter((entry) => Boolean(entry)).includes(senderE164);
		},
		command: {
			useAccessGroups,
			allowTextCommands: true,
			hasControlCommand: true
		}
	}).commandAuthorized;
}
function resolvePinnedMainDmRecipient(params) {
	const account = resolveWhatsAppAccount({
		cfg: params.cfg,
		accountId: params.msg.accountId
	});
	return resolvePinnedMainDmOwnerFromAllowlist({
		dmScope: params.cfg.session?.dmScope,
		allowFrom: account.allowFrom,
		normalizeEntry: (entry) => (0, text_runtime_exports.normalizeE164)(entry)
	});
}
async function processMessage(params) {
	const conversationId = params.msg.conversationId ?? params.msg.from;
	const account = resolveWhatsAppAccount({
		cfg: params.cfg,
		accountId: params.route.accountId ?? params.msg.accountId
	});
	const contextVisibilityMode = resolveChannelContextVisibilityMode({
		cfg: params.cfg,
		channel: "whatsapp",
		accountId: account.accountId
	});
	const configuredAllowFrom = account.allowFrom ?? [];
	const groupAllowFrom = account.groupAllowFrom ?? (configuredAllowFrom.length > 0 ? configuredAllowFrom : void 0) ?? [];
	const groupPolicy = account.groupPolicy ?? "allowlist";
	const { storePath, envelopeOptions, previousTimestamp } = resolveInboundSessionEnvelopeContext({
		cfg: params.cfg,
		agentId: params.route.agentId,
		sessionKey: params.route.sessionKey
	});
	let combinedBody = buildInboundLine({
		cfg: params.cfg,
		msg: params.msg,
		agentId: params.route.agentId,
		previousTimestamp,
		envelope: envelopeOptions
	});
	let shouldClearGroupHistory = false;
	const visibleGroupHistory = params.msg.chatType === "group" ? resolveVisibleWhatsAppGroupHistory({
		history: params.groupHistory ?? params.groupHistories.get(params.groupHistoryKey) ?? [],
		mode: contextVisibilityMode,
		groupPolicy,
		groupAllowFrom
	}) : void 0;
	if (params.msg.chatType === "group") {
		const history = visibleGroupHistory ?? [];
		if (history.length > 0) combinedBody = buildHistoryContextFromEntries({
			entries: history.map((m) => ({
				sender: m.sender,
				body: m.body,
				timestamp: m.timestamp
			})),
			currentMessage: combinedBody,
			excludeLast: false,
			formatEntry: (entry) => {
				return formatInboundEnvelope$1({
					channel: "WhatsApp",
					from: conversationId,
					timestamp: entry.timestamp,
					body: entry.body,
					chatType: "group",
					senderLabel: entry.sender,
					envelope: envelopeOptions
				});
			}
		});
		shouldClearGroupHistory = !(params.suppressGroupHistoryClear ?? false);
	}
	const combinedEchoKey = params.buildCombinedEchoKey({
		sessionKey: params.route.sessionKey,
		combinedBody
	});
	if (params.echoHas(combinedEchoKey)) {
		logVerbose$1("Skipping auto-reply: detected echo for combined message");
		params.echoForget(combinedEchoKey);
		return false;
	}
	maybeSendAckReaction({
		cfg: params.cfg,
		msg: params.msg,
		agentId: params.route.agentId,
		sessionKey: params.route.sessionKey,
		conversationId,
		verbose: params.verbose,
		accountId: params.route.accountId,
		info: params.replyLogger.info.bind(params.replyLogger),
		warn: params.replyLogger.warn.bind(params.replyLogger)
	});
	const correlationId = params.msg.id ?? newConnectionId();
	params.replyLogger.info({
		connectionId: params.connectionId,
		correlationId,
		from: params.msg.chatType === "group" ? conversationId : params.msg.from,
		to: params.msg.to,
		body: elide(combinedBody, 240),
		mediaType: params.msg.mediaType ?? null,
		mediaPath: params.msg.mediaPath ?? null
	}, "inbound web message");
	const fromDisplay = params.msg.chatType === "group" ? conversationId : params.msg.from;
	const kindLabel = params.msg.mediaType ? `, ${params.msg.mediaType}` : "";
	whatsappInboundLog.info(`Inbound message ${fromDisplay} -> ${params.msg.to} (${params.msg.chatType}${kindLabel}, ${combinedBody.length} chars)`);
	if (shouldLogVerbose$1()) whatsappInboundLog.debug(`Inbound body: ${elide(combinedBody, 400)}`);
	const sender = getSenderIdentity(params.msg);
	const self = getSelfIdentity(params.msg);
	const visibleReplyTo = resolveVisibleWhatsAppReplyContext({
		msg: params.msg,
		authDir: account.authDir,
		mode: contextVisibilityMode,
		groupPolicy,
		groupAllowFrom
	});
	const dmRouteTarget = resolveWhatsAppDmRouteTarget({
		msg: params.msg,
		senderE164: sender.e164 ?? void 0,
		normalizeE164: text_runtime_exports.normalizeE164
	});
	const commandAuthorized = shouldComputeCommandAuthorized(params.msg.body, params.cfg) ? await resolveWhatsAppCommandAuthorized({
		cfg: params.cfg,
		msg: params.msg
	}) : void 0;
	const { onModelSelected, ...replyPipeline } = createChannelReplyPipeline({
		cfg: params.cfg,
		agentId: params.route.agentId,
		channel: "whatsapp",
		accountId: params.route.accountId
	});
	const isSelfChat = params.msg.chatType !== "group" && Boolean(self.e164) && (0, text_runtime_exports.normalizeE164)(params.msg.from) === (0, text_runtime_exports.normalizeE164)(self.e164 ?? "");
	const responsePrefix = resolveWhatsAppResponsePrefix({
		cfg: params.cfg,
		agentId: params.route.agentId,
		isSelfChat,
		pipelineResponsePrefix: replyPipeline.responsePrefix
	});
	const ctxPayload = buildWhatsAppInboundContext({
		combinedBody,
		commandAuthorized,
		conversationId,
		groupHistory: visibleGroupHistory,
		groupMemberRoster: params.groupMemberNames.get(params.groupHistoryKey),
		msg: params.msg,
		route: params.route,
		sender: {
			id: getPrimaryIdentityId(sender) ?? void 0,
			name: sender.name ?? void 0,
			e164: sender.e164 ?? void 0
		},
		visibleReplyTo: visibleReplyTo ?? void 0
	});
	const pinnedMainDmRecipient = resolvePinnedMainDmRecipient({
		cfg: params.cfg,
		msg: params.msg
	});
	updateWhatsAppMainLastRoute({
		backgroundTasks: params.backgroundTasks,
		cfg: params.cfg,
		ctx: ctxPayload,
		dmRouteTarget,
		pinnedMainDmRecipient,
		route: params.route,
		updateLastRoute: updateLastRouteInBackground,
		warn: params.replyLogger.warn.bind(params.replyLogger)
	});
	const metaTask = recordSessionMetaFromInbound({
		storePath,
		sessionKey: params.route.sessionKey,
		ctx: ctxPayload
	}).catch((err) => {
		params.replyLogger.warn({
			error: formatError(err),
			storePath,
			sessionKey: params.route.sessionKey
		}, "failed updating session meta");
	});
	trackBackgroundTask(params.backgroundTasks, metaTask);
	return dispatchWhatsAppBufferedReply({
		cfg: params.cfg,
		connectionId: params.connectionId,
		context: ctxPayload,
		conversationId,
		deliverReply: deliverWebReply,
		groupHistories: params.groupHistories,
		groupHistoryKey: params.groupHistoryKey,
		maxMediaBytes: params.maxMediaBytes,
		maxMediaTextChunkLimit: params.maxMediaTextChunkLimit,
		msg: params.msg,
		onModelSelected,
		rememberSentText: params.rememberSentText,
		replyLogger: params.replyLogger,
		replyPipeline: {
			...replyPipeline,
			responsePrefix
		},
		replyResolver: params.replyResolver,
		route: params.route,
		shouldClearGroupHistory
	});
}
//#endregion
//#region extensions/whatsapp/src/auto-reply/monitor/on-message.ts
function createWebOnMessageHandler(params) {
	const processForRoute = async (msg, route, groupHistoryKey, opts) => processMessage({
		cfg: params.cfg,
		msg,
		route,
		groupHistoryKey,
		groupHistories: params.groupHistories,
		groupMemberNames: params.groupMemberNames,
		connectionId: params.connectionId,
		verbose: params.verbose,
		maxMediaBytes: params.maxMediaBytes,
		replyResolver: params.replyResolver,
		replyLogger: params.replyLogger,
		backgroundTasks: params.backgroundTasks,
		rememberSentText: params.echoTracker.rememberText,
		echoHas: params.echoTracker.has,
		echoForget: params.echoTracker.forget,
		buildCombinedEchoKey: params.echoTracker.buildCombinedKey,
		groupHistory: opts?.groupHistory,
		suppressGroupHistoryClear: opts?.suppressGroupHistoryClear
	});
	return async (msg) => {
		const conversationId = msg.conversationId ?? msg.from;
		const peerId = resolvePeerId(msg);
		const route = resolveAgentRoute({
			cfg: loadConfig$1(),
			channel: "whatsapp",
			accountId: msg.accountId,
			peer: {
				kind: msg.chatType === "group" ? "group" : "direct",
				id: peerId
			}
		});
		const groupHistoryKey = msg.chatType === "group" ? buildGroupHistoryKey({
			channel: "whatsapp",
			accountId: route.accountId,
			peerKind: "group",
			peerId
		}) : route.sessionKey;
		if (msg.from === msg.to) logVerbose(`📱 Same-phone mode detected (from === to: ${msg.from})`);
		if (params.echoTracker.has(msg.body)) {
			logVerbose("Skipping auto-reply: detected echo (message matches recently sent text)");
			params.echoTracker.forget(msg.body);
			return;
		}
		if (msg.chatType === "group") {
			const sender = getSenderIdentity(msg);
			const metaCtx = {
				From: msg.from,
				To: msg.to,
				SessionKey: route.sessionKey,
				AccountId: route.accountId,
				ChatType: msg.chatType,
				ConversationLabel: conversationId,
				GroupSubject: msg.groupSubject,
				SenderName: sender.name ?? void 0,
				SenderId: getPrimaryIdentityId(sender) ?? void 0,
				SenderE164: sender.e164 ?? void 0,
				Provider: "whatsapp",
				Surface: "whatsapp",
				OriginatingChannel: "whatsapp",
				OriginatingTo: conversationId
			};
			updateLastRouteInBackground({
				cfg: params.cfg,
				backgroundTasks: params.backgroundTasks,
				storeAgentId: route.agentId,
				sessionKey: route.sessionKey,
				channel: "whatsapp",
				to: conversationId,
				accountId: route.accountId,
				ctx: metaCtx,
				warn: params.replyLogger.warn.bind(params.replyLogger)
			});
			if (!applyGroupGating({
				cfg: params.cfg,
				msg,
				conversationId,
				groupHistoryKey,
				agentId: route.agentId,
				sessionKey: route.sessionKey,
				baseMentionConfig: params.baseMentionConfig,
				authDir: params.account.authDir,
				selfChatMode: params.account.selfChatMode,
				groupHistories: params.groupHistories,
				groupHistoryLimit: params.groupHistoryLimit,
				groupMemberNames: params.groupMemberNames,
				logVerbose,
				replyLogger: params.replyLogger
			}).shouldProcess) return;
		} else if (!msg.sender?.e164 && !msg.senderE164 && peerId && peerId.startsWith("+")) {
			const normalized = (0, text_runtime_exports.normalizeE164)(peerId);
			if (normalized) {
				msg.sender = {
					...msg.sender,
					e164: normalized
				};
				msg.senderE164 = normalized;
			}
		}
		if (await maybeBroadcastMessage({
			cfg: params.cfg,
			msg,
			peerId,
			route,
			groupHistoryKey,
			groupHistories: params.groupHistories,
			processMessage: processForRoute
		})) return;
		await processForRoute(msg, route, groupHistoryKey);
	};
}
//#endregion
//#region extensions/whatsapp/src/auto-reply/monitor.ts
function isNonRetryableWebCloseStatus(statusCode) {
	return statusCode === 440;
}
let replyResolverRuntimePromise = null;
function loadReplyResolverRuntime() {
	replyResolverRuntimePromise ??= import("./reply-resolver.runtime-CdzjkeyD.js");
	return replyResolverRuntimePromise;
}
function normalizeReconnectAccountId(accountId) {
	return (accountId ?? "").trim() || "default";
}
function isNoListenerReconnectError(lastError) {
	return typeof lastError === "string" && /No active WhatsApp Web listener/i.test(lastError);
}
async function monitorWebChannel(verbose, listenerFactory = attachWebInboxToSocket, keepAlive = true, replyResolver, runtime = defaultRuntime, abortSignal, tuning = {}) {
	const activeReplyResolver = replyResolver ?? (await loadReplyResolverRuntime()).getReplyFromConfig;
	const runId = newConnectionId();
	const replyLogger = getChildLogger$1({
		module: "web-auto-reply",
		runId
	});
	const heartbeatLogger = getChildLogger$1({
		module: "web-heartbeat",
		runId
	});
	const reconnectLogger = getChildLogger$1({
		module: "web-reconnect",
		runId
	});
	const statusController = createWebChannelStatusController(tuning.statusSink);
	statusController.snapshot();
	statusController.emit();
	const baseCfg = loadConfig$1();
	const account = resolveWhatsAppAccount({
		cfg: baseCfg,
		accountId: tuning.accountId
	});
	const cfg = {
		...baseCfg,
		channels: {
			...baseCfg.channels,
			whatsapp: {
				...baseCfg.channels?.whatsapp,
				ackReaction: account.ackReaction,
				messagePrefix: account.messagePrefix,
				allowFrom: account.allowFrom,
				groupAllowFrom: account.groupAllowFrom,
				groupPolicy: account.groupPolicy,
				textChunkLimit: account.textChunkLimit,
				chunkMode: account.chunkMode,
				mediaMaxMb: account.mediaMaxMb,
				blockStreaming: account.blockStreaming,
				groups: account.groups
			}
		}
	};
	const maxMediaBytes = resolveWhatsAppMediaMaxBytes(account);
	const heartbeatSeconds = resolveHeartbeatSeconds(cfg, tuning.heartbeatSeconds);
	const reconnectPolicy = resolveReconnectPolicy(cfg, tuning.reconnect);
	const baseMentionConfig = buildMentionConfig(cfg);
	const groupHistoryLimit = cfg.channels?.whatsapp?.accounts?.[tuning.accountId ?? ""]?.historyLimit ?? cfg.channels?.whatsapp?.historyLimit ?? cfg.messages?.groupChat?.historyLimit ?? DEFAULT_GROUP_HISTORY_LIMIT;
	const groupHistories = /* @__PURE__ */ new Map();
	const groupMemberNames = /* @__PURE__ */ new Map();
	const echoTracker = createEchoTracker({
		maxItems: 100,
		logVerbose
	});
	const sleep = tuning.sleep ?? ((ms, signal) => sleepWithAbort(ms, signal ?? abortSignal));
	const stopRequested = () => abortSignal?.aborted === true;
	const currentMaxListeners = process.getMaxListeners?.() ?? 10;
	if (process.setMaxListeners && currentMaxListeners < 50) process.setMaxListeners(50);
	let sigintStop = false;
	const handleSigint = () => {
		sigintStop = true;
	};
	process.once("SIGINT", handleSigint);
	const messageTimeoutMs = tuning.messageTimeoutMs ?? 1800 * 1e3;
	const watchdogCheckMs = tuning.watchdogCheckMs ?? 60 * 1e3;
	const controller = new WhatsAppConnectionController({
		accountId: account.accountId,
		authDir: account.authDir,
		verbose,
		keepAlive,
		heartbeatSeconds,
		messageTimeoutMs,
		watchdogCheckMs,
		reconnectPolicy,
		abortSignal,
		sleep,
		isNonRetryableStatus: isNonRetryableWebCloseStatus
	});
	try {
		while (true) {
			if (stopRequested()) break;
			const connectionId = newConnectionId();
			const inboundDebounceMs = resolveInboundDebounceMs({
				cfg,
				channel: "whatsapp"
			});
			const shouldDebounce = (msg) => {
				if (msg.mediaPath || msg.mediaType) return false;
				if (msg.location) return false;
				if (msg.replyToId || msg.replyToBody) return false;
				return !hasControlCommand(msg.body, cfg);
			};
			const connection = await controller.openConnection({
				connectionId,
				createListener: async ({ sock, connection }) => {
					const onMessage = createWebOnMessageHandler({
						cfg,
						verbose,
						connectionId,
						maxMediaBytes,
						groupHistoryLimit,
						groupHistories,
						groupMemberNames,
						echoTracker,
						backgroundTasks: connection.backgroundTasks,
						replyResolver: activeReplyResolver,
						replyLogger,
						baseMentionConfig,
						account
					});
					return await (listenerFactory ?? attachWebInboxToSocket)({
						verbose,
						accountId: account.accountId,
						authDir: account.authDir,
						mediaMaxMb: account.mediaMaxMb,
						selfChatMode: account.selfChatMode,
						sendReadReceipts: account.sendReadReceipts,
						debounceMs: inboundDebounceMs,
						shouldDebounce,
						socketRef: controller.socketRef,
						shouldRetryDisconnect: () => !sigintStop && controller.shouldRetryDisconnect(),
						disconnectRetryPolicy: reconnectPolicy,
						disconnectRetryAbortSignal: controller.getDisconnectRetryAbortSignal(),
						onMessage: async (msg) => {
							const inboundAt = Date.now();
							controller.noteInbound(inboundAt);
							statusController.noteInbound(inboundAt);
							await onMessage(msg);
						},
						sock
					});
				},
				onHeartbeat: (snapshot) => {
					const authAgeMs = getWebAuthAgeMs(account.authDir);
					const minutesSinceLastMessage = snapshot.lastInboundAt ? Math.floor((Date.now() - snapshot.lastInboundAt) / 6e4) : null;
					const logData = {
						connectionId: snapshot.connectionId,
						reconnectAttempts: snapshot.reconnectAttempts,
						messagesHandled: snapshot.handledMessages,
						lastInboundAt: snapshot.lastInboundAt,
						authAgeMs,
						uptimeMs: snapshot.uptimeMs,
						...minutesSinceLastMessage !== null && minutesSinceLastMessage > 30 ? { minutesSinceLastMessage } : {}
					};
					if (minutesSinceLastMessage && minutesSinceLastMessage > 30) heartbeatLogger.warn(logData, "⚠️ web gateway heartbeat - no messages in 30+ minutes");
					else heartbeatLogger.info(logData, "web gateway heartbeat");
				},
				onWatchdogTimeout: (snapshot) => {
					const watchdogBaselineAt = snapshot.lastInboundAt ?? snapshot.startedAt;
					const minutesSinceLastMessage = Math.floor((Date.now() - watchdogBaselineAt) / 6e4);
					statusController.noteWatchdogStale();
					heartbeatLogger.warn({
						connectionId: snapshot.connectionId,
						minutesSinceLastMessage,
						lastInboundAt: snapshot.lastInboundAt ? new Date(snapshot.lastInboundAt) : null,
						messagesHandled: snapshot.handledMessages
					}, "Message timeout detected - forcing reconnect");
					whatsappHeartbeatLog.warn(`No messages received in ${minutesSinceLastMessage}m - restarting connection`);
				}
			});
			statusController.noteConnected();
			controller.setUnhandledRejectionCleanup(registerUnhandledRejectionHandler((reason) => {
				if (!isLikelyWhatsAppCryptoError(reason)) return false;
				const errorStr = formatError(reason);
				reconnectLogger.warn({
					connectionId: connection.connectionId,
					error: errorStr
				}, "web reconnect: unhandled rejection from WhatsApp socket; forcing reconnect");
				controller.forceClose({
					status: 499,
					isLoggedOut: false,
					error: reason
				});
				return true;
			}));
			const { e164: selfE164 } = readWebSelfId(account.authDir);
			const connectRoute = resolveAgentRoute({
				cfg,
				channel: "whatsapp",
				accountId: account.accountId
			});
			enqueueSystemEvent(`WhatsApp gateway connected${selfE164 ? ` as ${selfE164}` : ""}.`, { sessionKey: connectRoute.sessionKey });
			const normalizedAccountId = normalizeReconnectAccountId(account.accountId);
			drainPendingDeliveries({
				drainKey: `whatsapp:${normalizedAccountId}`,
				logLabel: "WhatsApp reconnect drain",
				cfg,
				log: reconnectLogger,
				selectEntry: (entry) => ({
					match: entry.channel === "whatsapp" && normalizeReconnectAccountId(entry.accountId) === normalizedAccountId,
					bypassBackoff: isNoListenerReconnectError(entry.lastError)
				})
			}).catch((err) => {
				reconnectLogger.warn({
					connectionId: connection.connectionId,
					error: String(err)
				}, "reconnect drain failed");
			});
			whatsappLog.info("Listening for personal WhatsApp inbound messages.");
			if (process.stdout.isTTY || process.stderr.isTTY) whatsappLog.raw("Ctrl+C to stop.");
			if (!keepAlive) {
				await controller.shutdown();
				return;
			}
			const reason = await controller.waitForClose();
			if (stopRequested() || sigintStop || reason === "aborted") {
				await controller.shutdown();
				break;
			}
			const decision = controller.resolveCloseDecision(reason);
			if (decision === "aborted") {
				await controller.shutdown();
				break;
			}
			statusController.noteReconnectAttempts(controller.getReconnectAttempts());
			reconnectLogger.info({
				connectionId: connection.connectionId,
				status: decision.normalized.statusLabel,
				loggedOut: decision.normalized.isLoggedOut,
				reconnectAttempts: decision.reconnectAttempts,
				error: decision.normalized.errorText
			}, "web reconnect: connection closed");
			enqueueSystemEvent(`WhatsApp gateway disconnected (status ${decision.normalized.statusLabel})`, { sessionKey: connectRoute.sessionKey });
			if (decision.action === "stop") {
				statusController.noteClose({
					statusCode: decision.normalized.statusCode,
					loggedOut: decision.normalized.isLoggedOut,
					error: decision.normalized.errorText,
					reconnectAttempts: decision.reconnectAttempts,
					healthState: decision.healthState
				});
				if (decision.healthState === "logged-out") runtime.error(`WhatsApp session logged out. Run \`${formatCliCommand("openclaw channels login --channel web")}\` to relink.`);
				else if (decision.healthState === "conflict") {
					reconnectLogger.warn({
						connectionId: connection.connectionId,
						status: decision.normalized.statusLabel,
						error: decision.normalized.errorText
					}, "web reconnect: non-retryable close status; stopping monitor");
					runtime.error(`WhatsApp Web connection closed (status ${decision.normalized.statusLabel}: session conflict). Resolve conflicting WhatsApp Web sessions, then relink with \`${formatCliCommand("openclaw channels login --channel web")}\`. Stopping web monitoring.`);
				} else {
					reconnectLogger.warn({
						connectionId: connection.connectionId,
						status: decision.normalized.statusLabel,
						reconnectAttempts: decision.reconnectAttempts,
						maxAttempts: reconnectPolicy.maxAttempts
					}, "web reconnect: max attempts reached; continuing in degraded mode");
					runtime.error(`WhatsApp Web reconnect: max attempts reached (${decision.reconnectAttempts}/${reconnectPolicy.maxAttempts}). Stopping web monitoring.`);
				}
				await controller.shutdown();
				break;
			}
			statusController.noteClose({
				statusCode: decision.normalized.statusCode,
				error: decision.normalized.errorText,
				reconnectAttempts: decision.reconnectAttempts,
				healthState: decision.healthState
			});
			reconnectLogger.info({
				connectionId: connection.connectionId,
				status: decision.normalized.statusLabel,
				reconnectAttempts: decision.reconnectAttempts,
				maxAttempts: reconnectPolicy.maxAttempts || "unlimited",
				delayMs: decision.delayMs
			}, "web reconnect: scheduling retry");
			runtime.error(`WhatsApp Web connection closed (status ${decision.normalized.statusLabel}). Retry ${decision.reconnectAttempts}/${reconnectPolicy.maxAttempts || "∞"} in ${formatDurationPrecise(decision.delayMs ?? 0)}… (${decision.normalized.errorText})`);
			await controller.closeCurrentConnection();
			try {
				await controller.waitBeforeRetry(decision.delayMs ?? 0);
			} catch {
				break;
			}
		}
	} finally {
		statusController.markStopped();
		process.removeListener("SIGINT", handleSigint);
		await controller.shutdown();
	}
}
//#endregion
//#region extensions/whatsapp/src/login.ts
async function loginWeb(verbose, waitForConnection, runtime = defaultRuntime, accountId) {
	const account = resolveWhatsAppAccount({
		cfg: loadConfig(),
		accountId
	});
	let sock = await createWaSocket(true, verbose, { authDir: account.authDir });
	logInfo("Waiting for WhatsApp connection...", runtime);
	try {
		const result = await waitForWhatsAppLoginResult({
			sock,
			authDir: account.authDir,
			isLegacyAuthDir: account.isLegacyAuthDir,
			verbose,
			runtime,
			waitForConnection,
			onSocketReplaced: (replacementSock) => {
				sock = replacementSock;
			}
		});
		if (result.outcome === "connected") {
			console.log(success(result.restarted ? "✅ Linked after restart; web session ready." : "✅ Linked! Credentials saved for future sends."));
			return;
		}
		if (result.outcome === "logged-out") {
			console.error(danger(`WhatsApp reported the session is logged out. Cleared cached web session; please rerun ${formatCliCommand("openclaw channels login")} and scan the QR again.`));
			throw new Error("Session logged out; cache cleared. Re-run login.", { cause: result.error });
		}
		console.error(danger(`WhatsApp Web connection ended before fully opening. ${result.message}`));
		throw new Error(result.message, { cause: result.error });
	} finally {
		closeWaSocketSoon(sock);
	}
}
//#endregion
export { whatsappHeartbeatLog as S, resolveSessionKey as _, loadWebMedia$1 as a, resolveStorePath as b, optimizeImageToPng as c, extractMediaPlaceholder as d, extractText as f, resolveChannelResetConfig as g, loadSessionStore as h, getDefaultLocalRoots as i, monitorWebInbox as l, evaluateSessionFreshness as m, monitorWebChannel as n, loadWebMediaRaw as o, resetWebInboundDedupe as p, LocalMediaAccessError as r, optimizeImageToJpeg as s, loginWeb as t, extractLocationData as u, resolveSessionResetPolicy as v, resolveThreadFlag as x, resolveSessionResetType as y };
