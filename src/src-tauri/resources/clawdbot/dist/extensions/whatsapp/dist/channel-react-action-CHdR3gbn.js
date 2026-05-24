import { a as resolveWhatsAppAccount, s as resolveWhatsAppMediaMaxBytes } from "./accounts-BPYgj8Fv.js";
import { c as normalizeWhatsAppTarget, t as isWhatsAppGroupJid } from "./normalize-target-bVWjgftN.js";
import { r as resolveAuthorizedWhatsAppOutboundTarget, t as handleWhatsAppAction } from "./action-runtime-D4UqEXqf.js";
import "./normalize-Bxwqo-bW.js";
import { t as sendMessageWhatsApp } from "./send-E_kMiuZP.js";
import { jsonResult, readStringOrNumberParam, readStringParam as readStringParam$1, resolveReactionMessageId } from "openclaw/plugin-sdk/channel-actions";
//#region extensions/whatsapp/src/channel-react-action.ts
const WHATSAPP_CHANNEL = "whatsapp";
function readUploadFileMediaSource(args) {
	return readStringParam$1(args, "media", { trim: false }) ?? readStringParam$1(args, "mediaUrl", { trim: false }) ?? readStringParam$1(args, "filePath", { trim: false }) ?? readStringParam$1(args, "path", { trim: false }) ?? readStringParam$1(args, "fileUrl", { trim: false });
}
function readUploadFileCaptionText(args) {
	return readStringParam$1(args, "message", { allowEmpty: true }) ?? readStringParam$1(args, "content", { allowEmpty: true }) ?? readStringParam$1(args, "caption", { allowEmpty: true }) ?? "";
}
function readBooleanParam(args, key) {
	const value = args[key];
	if (typeof value === "boolean") return value;
	if (typeof value !== "string") return;
	const normalized = value.trim().toLowerCase();
	if (normalized === "true") return true;
	if (normalized === "false") return false;
}
function hasUploadFileBufferPayload(args) {
	return readStringParam$1(args, "buffer", { trim: false }) !== void 0;
}
function extractBase64Payload(encoded) {
	const match = /^data:[^;]+;base64,(.*)$/i.exec(encoded.trim());
	return match ? match[1] : encoded;
}
function estimateBase64DecodedBytes(encoded) {
	const compact = extractBase64Payload(encoded).replace(/\s/g, "");
	if (!compact) return 0;
	const padding = compact.endsWith("==") ? 2 : compact.endsWith("=") ? 1 : 0;
	return Math.max(0, Math.floor(compact.length * 3 / 4) - padding);
}
function decodeUploadFileMediaPayload(params) {
	if (params.maxBytes !== void 0) {
		const estimatedBytes = estimateBase64DecodedBytes(params.encoded);
		if (estimatedBytes > params.maxBytes) throw new Error(`WhatsApp upload-file buffer exceeds configured media limit (${estimatedBytes} bytes > ${params.maxBytes} bytes).`);
	}
	const contentType = readStringParam$1(params.args, "contentType") ?? readStringParam$1(params.args, "mimeType");
	const fileName = readStringParam$1(params.args, "filename") ?? readStringParam$1(params.args, "fileName");
	const buffer = Buffer.from(extractBase64Payload(params.encoded), "base64");
	if (params.maxBytes !== void 0 && buffer.byteLength > params.maxBytes) throw new Error(`WhatsApp upload-file buffer exceeds configured media limit (${buffer.byteLength} bytes > ${params.maxBytes} bytes).`);
	return {
		buffer,
		...contentType ? { contentType } : {},
		...fileName ? { fileName } : {}
	};
}
async function handleWhatsAppUploadFileAction(params) {
	const mediaUrl = readUploadFileMediaSource(params.params);
	const encodedPayload = readStringParam$1(params.params, "buffer", { trim: false });
	if (!mediaUrl && !hasUploadFileBufferPayload(params.params)) throw new Error("WhatsApp upload-file requires media, mediaUrl, filePath, path, fileUrl, or buffer.");
	const to = readStringParam$1(params.params, "to", { required: true });
	const resolved = resolveAuthorizedWhatsAppOutboundTarget({
		cfg: params.cfg,
		chatJid: to,
		accountId: params.accountId ?? void 0,
		actionLabel: "upload-file"
	});
	const account = resolveWhatsAppAccount({
		cfg: params.cfg,
		accountId: resolved.accountId
	});
	const mediaPayload = encodedPayload ? decodeUploadFileMediaPayload({
		args: params.params,
		encoded: encodedPayload,
		maxBytes: resolveWhatsAppMediaMaxBytes(account)
	}) : void 0;
	const result = await sendMessageWhatsApp(resolved.to, readUploadFileCaptionText(params.params), {
		verbose: false,
		cfg: params.cfg,
		...mediaUrl && !mediaPayload ? { mediaUrl } : {},
		...mediaPayload ? { mediaPayload } : {},
		mediaAccess: params.mediaAccess,
		mediaLocalRoots: params.mediaLocalRoots,
		mediaReadFile: params.mediaReadFile,
		gifPlayback: readBooleanParam(params.params, "gifPlayback") ?? void 0,
		audioAsVoice: readBooleanParam(params.params, "asVoice") ?? readBooleanParam(params.params, "audioAsVoice") ?? void 0,
		forceDocument: readBooleanParam(params.params, "forceDocument") ?? readBooleanParam(params.params, "asDocument") ?? void 0,
		accountId: resolved.accountId
	});
	return jsonResult({
		ok: true,
		channel: WHATSAPP_CHANNEL,
		action: "upload-file",
		messageId: result.messageId,
		toJid: result.toJid
	});
}
async function handleWhatsAppMessageAction(params) {
	if (params.action === "upload-file") return await handleWhatsAppUploadFileAction(params);
	if (params.action !== "react") throw new Error(`Action ${params.action} is not supported for provider ${WHATSAPP_CHANNEL}.`);
	const isWhatsAppSource = params.toolContext?.currentChannelProvider === WHATSAPP_CHANNEL;
	const explicitTarget = readStringParam$1(params.params, "chatJid") ?? readStringParam$1(params.params, "to");
	const normalizedTarget = explicitTarget ? normalizeWhatsAppTarget(explicitTarget) : null;
	const normalizedCurrent = isWhatsAppSource && params.toolContext?.currentChannelId ? normalizeWhatsAppTarget(params.toolContext.currentChannelId) : null;
	const isCrossChat = normalizedTarget != null && (normalizedCurrent == null || normalizedTarget !== normalizedCurrent);
	const scopedContext = !isWhatsAppSource || isCrossChat || !params.toolContext ? void 0 : {
		currentChannelId: params.toolContext.currentChannelId ?? void 0,
		currentChannelProvider: params.toolContext.currentChannelProvider ?? void 0,
		currentMessageId: params.toolContext.currentMessageId ?? void 0
	};
	const messageIdRaw = resolveReactionMessageId({
		args: params.params,
		toolContext: scopedContext
	});
	if (messageIdRaw == null) readStringParam$1(params.params, "messageId", { required: true });
	const messageId = String(messageIdRaw);
	const explicitMessageId = readStringOrNumberParam(params.params, "messageId");
	const emoji = readStringParam$1(params.params, "emoji", { allowEmpty: true });
	const remove = typeof params.params.remove === "boolean" ? params.params.remove : void 0;
	const explicitParticipant = readStringParam$1(params.params, "participant");
	const inferredParticipant = explicitParticipant || explicitMessageId != null || !isWhatsAppSource || isCrossChat || !isWhatsAppGroupJid(explicitTarget ?? params.toolContext?.currentChannelId ?? "") ? void 0 : typeof params.requesterSenderId === "string" && params.requesterSenderId.trim().length > 0 ? params.requesterSenderId.trim() : void 0;
	return await handleWhatsAppAction({
		action: "react",
		chatJid: readStringParam$1(params.params, "chatJid") ?? readStringParam$1(params.params, "to", { required: true }),
		messageId,
		emoji,
		remove,
		participant: explicitParticipant ?? inferredParticipant,
		accountId: params.accountId ?? void 0,
		fromMe: typeof params.params.fromMe === "boolean" ? params.params.fromMe : void 0
	}, params.cfg);
}
const handleWhatsAppReactAction = handleWhatsAppMessageAction;
//#endregion
export { handleWhatsAppMessageAction, handleWhatsAppReactAction };
