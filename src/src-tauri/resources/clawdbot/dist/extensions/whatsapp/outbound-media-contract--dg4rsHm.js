import { t as formatError } from "./session-errors-Ut-kDLfx.js";
import { t as text_runtime_exports } from "./text-runtime-BvOFWrFo.js";
import path from "node:path";
//#region extensions/whatsapp/src/outbound-media-contract.ts
function normalizeWhatsAppPayloadText(text) {
	return text?.trimStart() ?? "";
}
function normalizeWhatsAppPayloadTextPreservingIndentation(text) {
	return (text ?? "").replace(/^(?:[ \t]*\r?\n)+/, "");
}
function resolveWhatsAppOutboundMediaUrls(payload) {
	const orderedMediaUrls = [payload.mediaUrl?.trim(), ...(payload.mediaUrls ? [...payload.mediaUrls] : []).map((entry) => entry.trim()).filter((entry) => Boolean(entry))].filter((entry) => Boolean(entry));
	return Array.from(new Set(orderedMediaUrls));
}
function normalizeWhatsAppOutboundPayload(payload, options) {
	const mediaUrls = resolveWhatsAppOutboundMediaUrls(payload);
	const normalizeText = options?.normalizeText ?? normalizeWhatsAppPayloadText;
	return {
		...payload,
		text: normalizeText(payload.text),
		mediaUrl: mediaUrls[0],
		mediaUrls: mediaUrls.length > 0 ? mediaUrls : void 0
	};
}
function normalizeWhatsAppLoadedMedia(media, mediaUrl) {
	const kind = media.kind === "image" || media.kind === "audio" || media.kind === "video" ? media.kind : "document";
	const mimetype = kind === "audio" && media.contentType === "audio/ogg" ? "audio/ogg; codecs=opus" : media.contentType ?? "application/octet-stream";
	const fileName = kind === "document" ? media.fileName ?? deriveWhatsAppDocumentFileName(mediaUrl) ?? "file" : void 0;
	return {
		buffer: media.buffer,
		kind,
		mimetype,
		...fileName ? { fileName } : {}
	};
}
function deriveWhatsAppDocumentFileName(mediaUrl) {
	if (!mediaUrl) return;
	try {
		const parsed = new URL(mediaUrl);
		const fileName = path.posix.basename(parsed.pathname);
		return fileName ? decodeURIComponent(fileName) : void 0;
	} catch {
		return (mediaUrl.split(/[?#]/, 1)[0] ?? "").split(/[\\/]/).pop() || void 0;
	}
}
function isRetryableWhatsAppOutboundError(error) {
	return /closed|reset|timed\s*out|disconnect/i.test(formatError(error));
}
async function sendWhatsAppOutboundWithRetry(params) {
	const maxAttempts = params.maxAttempts ?? 3;
	let lastError;
	for (let attempt = 1; attempt <= maxAttempts; attempt += 1) try {
		return await params.send();
	} catch (error) {
		lastError = error;
		const errorText = formatError(error);
		const isLastAttempt = attempt === maxAttempts;
		if (!isRetryableWhatsAppOutboundError(error) || isLastAttempt) throw error;
		const backoffMs = 500 * attempt;
		await params.onRetry?.({
			attempt,
			maxAttempts,
			backoffMs,
			error,
			errorText
		});
		await (0, text_runtime_exports.sleep)(backoffMs);
	}
	throw lastError;
}
//#endregion
export { resolveWhatsAppOutboundMediaUrls as a, normalizeWhatsAppPayloadTextPreservingIndentation as i, normalizeWhatsAppOutboundPayload as n, sendWhatsAppOutboundWithRetry as o, normalizeWhatsAppPayloadText as r, normalizeWhatsAppLoadedMedia as t };
