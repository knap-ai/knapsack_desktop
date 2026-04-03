import { i as getChildLogger } from "./logger-BCzP_yik.js";
import { t as createSubsystemLogger } from "./subsystem-CJEvHE2o.js";
import { w as toWhatsappJid } from "./utils-CE3P21nG.js";
import { c as loadConfig } from "./io-DhtVmzAJ.js";
import { t as redactIdentifier } from "./redact-identifier-3CI3eDo3.js";
import { a as generateSecureUuid } from "./secure-random-CzuMrSfY.js";
import { n as normalizePollInput } from "./polls-Dua9EwFF.js";
import "./core-BghMcc08.js";
import { t as resolveMarkdownTableMode } from "./markdown-tables-DAbwMp5F.js";
import { t as convertMarkdownTables } from "./tables-Dmh1EQ3k.js";
import "./runtime-env-CoykX19-.js";
import "./config-runtime-CmISCurQ.js";
import "./media-runtime-DdCWeFPm.js";
import { s as markdownToWhatsApp } from "./text-runtime-B0ZpmkER.js";
import { l as resolveWhatsAppMediaMaxBytes, s as resolveWhatsAppAccount } from "./accounts-C7z-45Me.js";
import { t as loadOutboundMediaFromUrl } from "./runtime-api-rROA7VYI.js";
import { n as requireActiveWebListener } from "./active-listener-HztIeFkJ.js";
//#region extensions/whatsapp/src/send.ts
const outboundLog = createSubsystemLogger("gateway/channels/whatsapp").child("outbound");
async function sendMessageWhatsApp(to, body, options) {
	let text = body.trimStart();
	const jid = toWhatsappJid(to);
	if (!text && !options.mediaUrl) return {
		messageId: "",
		toJid: jid
	};
	const correlationId = generateSecureUuid();
	const startedAt = Date.now();
	const { listener: active, accountId: resolvedAccountId } = requireActiveWebListener(options.accountId);
	const cfg = options.cfg ?? loadConfig();
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
	const logger = getChildLogger({
		module: "web-outbound",
		correlationId,
		to: redactedTo
	});
	try {
		const redactedJid = redactIdentifier(jid);
		let mediaBuffer;
		let mediaType;
		let documentFileName;
		if (options.mediaUrl) {
			const media = await loadOutboundMediaFromUrl(options.mediaUrl, {
				maxBytes: resolveWhatsAppMediaMaxBytes(account),
				mediaAccess: options.mediaAccess,
				mediaLocalRoots: options.mediaLocalRoots,
				mediaReadFile: options.mediaReadFile
			});
			const caption = text || void 0;
			mediaBuffer = media.buffer;
			mediaType = media.contentType ?? "application/octet-stream";
			if (media.kind === "audio") mediaType = media.contentType === "audio/ogg" ? "audio/ogg; codecs=opus" : media.contentType ?? "application/octet-stream";
			else if (media.kind === "video") text = caption ?? "";
			else if (media.kind === "image") text = caption ?? "";
			else {
				text = caption ?? "";
				documentFileName = media.fileName;
			}
		}
		outboundLog.info(`Sending message -> ${redactedJid}${options.mediaUrl ? " (media)" : ""}`);
		logger.info({
			jid: redactedJid,
			hasMedia: Boolean(options.mediaUrl)
		}, "sending message");
		await active.sendComposingTo(to);
		const accountId = Boolean(options.accountId?.trim()) ? resolvedAccountId : void 0;
		const sendOptions = options.gifPlayback || accountId || documentFileName ? {
			...options.gifPlayback ? { gifPlayback: true } : {},
			...documentFileName ? { fileName: documentFileName } : {},
			accountId
		} : void 0;
		const messageId = (sendOptions ? await active.sendMessage(to, text, mediaBuffer, mediaType, sendOptions) : await active.sendMessage(to, text, mediaBuffer, mediaType))?.messageId ?? "unknown";
		const durationMs = Date.now() - startedAt;
		outboundLog.info(`Sent message ${messageId} -> ${redactedJid}${options.mediaUrl ? " (media)" : ""} (${durationMs}ms)`);
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
			hasMedia: Boolean(options.mediaUrl)
		}, "failed to send via web session");
		throw err;
	}
}
async function sendReactionWhatsApp(chatJid, messageId, emoji, options) {
	const correlationId = generateSecureUuid();
	const { listener: active } = requireActiveWebListener(options.accountId);
	const redactedChatJid = redactIdentifier(chatJid);
	const logger = getChildLogger({
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
	const { listener: active } = requireActiveWebListener(options.accountId);
	const redactedTo = redactIdentifier(to);
	const logger = getChildLogger({
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
export { sendPollWhatsApp as n, sendReactionWhatsApp as r, sendMessageWhatsApp as t };
