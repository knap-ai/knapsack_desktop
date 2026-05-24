import { t as __exportAll } from "./rolldown-runtime-D7D4PA-g.js";
import { r as resolveDefaultWhatsAppAccountId } from "./account-ids-CB5SOWjc.js";
import { a as resolveWhatsAppAccount, s as resolveWhatsAppMediaMaxBytes } from "./accounts-BPYgj8Fv.js";
import { n as isWhatsAppNewsletterJid } from "./normalize-target-bVWjgftN.js";
import { t as getRegisteredWhatsAppConnectionController } from "./connection-controller-registry-TSX_udJp.js";
import { a as resolveWhatsAppOutboundMediaUrls, i as prepareWhatsAppOutboundMedia, n as normalizeWhatsAppPayloadText, s as resolveWhatsAppDocumentFileName } from "./outbound-media-contract-ioTkt8tn.js";
import "./normalize-Bxwqo-bW.js";
import { d as markdownToWhatsApp, p as toWhatsappJid } from "./text-runtime-Dk37KYHj.js";
import { formatCliCommand } from "openclaw/plugin-sdk/cli-runtime";
import { generateSecureUuid } from "openclaw/plugin-sdk/core";
import { redactIdentifier } from "openclaw/plugin-sdk/logging-core";
import { convertMarkdownTables, resolveMarkdownTableMode } from "openclaw/plugin-sdk/markdown-table-runtime";
import { requireRuntimeConfig } from "openclaw/plugin-sdk/plugin-config-runtime";
import { normalizePollInput } from "openclaw/plugin-sdk/poll-runtime";
import { createSubsystemLogger, getChildLogger as getChildLogger$1 } from "openclaw/plugin-sdk/runtime-env";
import { loadWebMedia } from "openclaw/plugin-sdk/web-media";
//#region extensions/whatsapp/src/outbound-media.runtime.ts
async function loadOutboundMediaFromUrl(mediaUrl, options = {}) {
	const readFile = options.mediaAccess?.readFile ?? options.mediaReadFile;
	const localRoots = options.mediaAccess?.localRoots?.length && options.mediaAccess.localRoots.length > 0 ? options.mediaAccess.localRoots : options.mediaLocalRoots && options.mediaLocalRoots.length > 0 ? options.mediaLocalRoots : void 0;
	const sharedOptions = {
		...options.maxBytes !== void 0 ? { maxBytes: options.maxBytes } : {},
		...options.optimizeImages !== void 0 ? { optimizeImages: options.optimizeImages } : {}
	};
	return await loadWebMedia(mediaUrl, readFile ? {
		...sharedOptions,
		localRoots: "any",
		readFile,
		hostReadCapability: true
	} : {
		...sharedOptions,
		...localRoots ? { localRoots } : {}
	});
}
//#endregion
//#region extensions/whatsapp/src/send.ts
var send_exports = /* @__PURE__ */ __exportAll({
	sendMessageWhatsApp: () => sendMessageWhatsApp,
	sendPollWhatsApp: () => sendPollWhatsApp,
	sendReactionWhatsApp: () => sendReactionWhatsApp,
	sendTypingWhatsApp: () => sendTypingWhatsApp
});
const outboundLog = createSubsystemLogger("gateway/channels/whatsapp").child("outbound");
function supportsForcedDocumentDelivery(kind) {
	return kind === "image" || kind === "video";
}
function resolveOutboundWhatsAppAccountId(params) {
	const explicitAccountId = params.accountId?.trim();
	if (explicitAccountId) return explicitAccountId;
	return resolveDefaultWhatsAppAccountId(params.cfg);
}
function requireOutboundActiveWebListener(params) {
	const resolvedAccountId = resolveOutboundWhatsAppAccountId(params) ?? resolveDefaultWhatsAppAccountId(params.cfg);
	const listener = getRegisteredWhatsAppConnectionController(resolvedAccountId)?.getActiveListener() ?? null;
	if (!listener) throw new Error(`No active WhatsApp Web listener (account: ${resolvedAccountId}). Start the gateway, then link WhatsApp with: ${formatCliCommand(`openclaw channels login --channel whatsapp --account ${resolvedAccountId}`)}.`);
	return {
		accountId: resolvedAccountId,
		listener
	};
}
async function sendMessageWhatsApp(to, body, options) {
	let text = options.preserveLeadingWhitespace ? body : normalizeWhatsAppPayloadText(body);
	const jid = toWhatsappJid(to);
	const mediaUrls = resolveWhatsAppOutboundMediaUrls(options);
	const mediaPayload = options.mediaPayload;
	const primaryMediaUrl = mediaUrls[0] ?? mediaPayload?.fileName;
	const hasMedia = Boolean(mediaPayload || primaryMediaUrl);
	if (!text && !hasMedia) return {
		messageId: "",
		toJid: jid
	};
	const correlationId = generateSecureUuid();
	const startedAt = Date.now();
	const cfg = requireRuntimeConfig(options.cfg, "WhatsApp send");
	const { listener: active, accountId: resolvedAccountId } = requireOutboundActiveWebListener({
		cfg,
		accountId: options.accountId
	});
	const account = resolveWhatsAppAccount({
		cfg,
		accountId: resolvedAccountId ?? options.accountId
	});
	const tableMode = resolveMarkdownTableMode({
		cfg,
		channel: "whatsapp",
		accountId: resolvedAccountId ?? options.accountId
	});
	text = convertMarkdownTables(text ?? "", tableMode);
	text = markdownToWhatsApp(text);
	const redactedTo = redactIdentifier(to);
	const logger = getChildLogger$1({
		module: "web-outbound",
		correlationId,
		to: redactedTo
	});
	try {
		const redactedJid = redactIdentifier(jid);
		let mediaBuffer;
		let mediaType;
		let documentFileName;
		let visibleTextAfterVoice;
		let forceDocumentDelivery = false;
		if (mediaPayload) {
			const media = await prepareWhatsAppOutboundMedia(mediaPayload, primaryMediaUrl);
			const caption = text || void 0;
			mediaBuffer = media.buffer;
			mediaType = media.mimetype;
			forceDocumentDelivery = Boolean(options.forceDocument && supportsForcedDocumentDelivery(media.kind));
			if (media.kind === "audio" && caption) {
				visibleTextAfterVoice = caption;
				text = "";
			} else if (media.kind === "document") {
				text = caption ?? "";
				documentFileName = media.fileName;
			} else text = caption ?? "";
			if (forceDocumentDelivery) documentFileName ??= resolveWhatsAppDocumentFileName({
				fileName: media.fileName,
				mimetype: media.mimetype
			});
		} else if (primaryMediaUrl) {
			const media = await prepareWhatsAppOutboundMedia(await loadOutboundMediaFromUrl(primaryMediaUrl, {
				maxBytes: resolveWhatsAppMediaMaxBytes(account),
				optimizeImages: options.forceDocument ? false : void 0,
				mediaAccess: options.mediaAccess,
				mediaLocalRoots: options.mediaLocalRoots,
				mediaReadFile: options.mediaReadFile
			}), primaryMediaUrl);
			const caption = text || void 0;
			mediaBuffer = media.buffer;
			mediaType = media.mimetype;
			forceDocumentDelivery = Boolean(options.forceDocument && supportsForcedDocumentDelivery(media.kind));
			if (media.kind === "audio" && caption) {
				visibleTextAfterVoice = caption;
				text = "";
			} else if (media.kind === "document") {
				text = caption ?? "";
				documentFileName = media.fileName;
			} else text = caption ?? "";
			if (forceDocumentDelivery) documentFileName ??= resolveWhatsAppDocumentFileName({
				fileName: media.fileName,
				mimetype: media.mimetype
			});
		}
		outboundLog.info(`Sending message -> ${redactedJid}${hasMedia ? " (media)" : ""}`);
		logger.info({
			jid: redactedJid,
			hasMedia
		}, "sending message");
		if (!isWhatsAppNewsletterJid(jid)) await active.sendComposingTo(to);
		const accountId = Boolean(options.accountId?.trim()) ? resolvedAccountId : void 0;
		const sendOptions = options.gifPlayback || forceDocumentDelivery || accountId || documentFileName || options.quotedMessageKey ? {
			...options.gifPlayback ? { gifPlayback: true } : {},
			...forceDocumentDelivery ? { asDocument: true } : {},
			...documentFileName ? { fileName: documentFileName } : {},
			...options.quotedMessageKey ? { quotedMessageKey: options.quotedMessageKey } : {},
			accountId
		} : void 0;
		const result = sendOptions ? await active.sendMessage(to, text, mediaBuffer, mediaType, sendOptions) : await active.sendMessage(to, text, mediaBuffer, mediaType);
		if (visibleTextAfterVoice) if (sendOptions) await active.sendMessage(to, visibleTextAfterVoice, void 0, void 0, sendOptions);
		else await active.sendMessage(to, visibleTextAfterVoice, void 0, void 0);
		const messageId = result?.messageId ?? "unknown";
		const durationMs = Date.now() - startedAt;
		outboundLog.info(`Sent message ${messageId} -> ${redactedJid}${hasMedia ? " (media)" : ""} (${durationMs}ms)`);
		logger.info({
			jid: redactedJid,
			messageId
		}, "sent message");
		return {
			messageId,
			toJid: jid
		};
	} catch (err) {
		logger.error({
			err: String(err),
			to: redactedTo,
			hasMedia
		}, "failed to send via web session");
		throw err;
	}
}
async function sendTypingWhatsApp(to, options) {
	const { listener: active } = requireOutboundActiveWebListener({
		cfg: requireRuntimeConfig(options.cfg, "WhatsApp typing send"),
		accountId: options.accountId
	});
	if (!isWhatsAppNewsletterJid(toWhatsappJid(to))) await active.sendComposingTo(to);
}
async function sendReactionWhatsApp(chatJid, messageId, emoji, options) {
	const correlationId = generateSecureUuid();
	const { listener: active } = requireOutboundActiveWebListener({
		cfg: requireRuntimeConfig(options.cfg, "WhatsApp reaction"),
		accountId: options.accountId
	});
	const redactedChatJid = redactIdentifier(chatJid);
	const logger = getChildLogger$1({
		module: "web-outbound",
		correlationId,
		chatJid: redactedChatJid,
		messageId
	});
	try {
		const redactedJid = redactIdentifier(toWhatsappJid(chatJid));
		outboundLog.info(`Sending reaction "${emoji}" -> message ${messageId}`);
		logger.info({
			chatJid: redactedJid,
			messageId,
			emoji
		}, "sending reaction");
		await active.sendReaction(chatJid, messageId, emoji, options.fromMe ?? false, options.participant);
		outboundLog.info(`Sent reaction "${emoji}" -> message ${messageId}`);
		logger.info({
			chatJid: redactedJid,
			messageId,
			emoji
		}, "sent reaction");
	} catch (err) {
		logger.error({
			err: String(err),
			chatJid: redactedChatJid,
			messageId,
			emoji
		}, "failed to send reaction via web session");
		throw err;
	}
}
async function sendPollWhatsApp(to, poll, options) {
	const correlationId = generateSecureUuid();
	const startedAt = Date.now();
	const { listener: active } = requireOutboundActiveWebListener({
		cfg: requireRuntimeConfig(options.cfg, "WhatsApp poll"),
		accountId: options.accountId
	});
	const redactedTo = redactIdentifier(to);
	const logger = getChildLogger$1({
		module: "web-outbound",
		correlationId,
		to: redactedTo
	});
	try {
		const jid = toWhatsappJid(to);
		const redactedJid = redactIdentifier(jid);
		const normalized = normalizePollInput(poll, { maxOptions: 12 });
		outboundLog.info(`Sending poll -> ${redactedJid}`);
		logger.info({
			jid: redactedJid,
			optionCount: normalized.options.length,
			maxSelections: normalized.maxSelections
		}, "sending poll");
		const messageId = (await active.sendPoll(to, normalized))?.messageId ?? "unknown";
		const durationMs = Date.now() - startedAt;
		outboundLog.info(`Sent poll ${messageId} -> ${redactedJid} (${durationMs}ms)`);
		logger.info({
			jid: redactedJid,
			messageId
		}, "sent poll");
		return {
			messageId,
			toJid: jid
		};
	} catch (err) {
		logger.error({
			err: String(err),
			to: redactedTo
		}, "failed to send poll via web session");
		throw err;
	}
}
//#endregion
export { send_exports as a, sendTypingWhatsApp as i, sendPollWhatsApp as n, sendReactionWhatsApp as r, sendMessageWhatsApp as t };
