import { t as formatError } from "./session-errors-BAj9D2La.js";
import { a as sanitizeAssistantVisibleTextWithProfile, i as sanitizeAssistantVisibleText, o as sleep, s as stripToolCallXmlTags } from "./text-runtime-Dk37KYHj.js";
import path from "node:path";
import { writeExternalFileWithinRoot } from "openclaw/plugin-sdk/security-runtime";
import { extensionForMime } from "openclaw/plugin-sdk/media-mime";
import { MEDIA_FFMPEG_MAX_AUDIO_DURATION_SECS, runFfmpeg } from "openclaw/plugin-sdk/media-runtime";
import { sanitizeForPlainText } from "openclaw/plugin-sdk/outbound-runtime";
import { resolvePreferredOpenClawTmpDir, withTempWorkspace } from "openclaw/plugin-sdk/temp-path";
//#region extensions/whatsapp/src/document-filename.ts
const WHATSAPP_DEFAULT_DOCUMENT_FILE_NAME = "file";
function resolveWhatsAppDefaultDocumentFileName(mimetype) {
	const extension = extensionForMime(mimetype);
	return extension ? `${WHATSAPP_DEFAULT_DOCUMENT_FILE_NAME}${extension}` : WHATSAPP_DEFAULT_DOCUMENT_FILE_NAME;
}
function resolveWhatsAppDocumentFileName(params) {
	return params.fileName?.trim() || resolveWhatsAppDefaultDocumentFileName(params.mimetype);
}
//#endregion
//#region extensions/whatsapp/src/outbound-media-contract.ts
const WHATSAPP_VOICE_FILE_NAME = "voice.ogg";
const WHATSAPP_VOICE_SAMPLE_RATE_HZ = 48e3;
const WHATSAPP_VOICE_BITRATE = "64k";
const WHATSAPP_VOICE_MIMETYPE = "audio/ogg; codecs=opus";
function stripWhatsAppPluralToolXml(text) {
	return stripToolCallXmlTags(text, { stripFunctionCallsXmlPayloads: true });
}
function finalizeWhatsAppVisibleText(text) {
	return sanitizeForPlainText(stripWhatsAppPluralToolXml(text));
}
function normalizeWhatsAppPayloadText(text) {
	return finalizeWhatsAppVisibleText(sanitizeAssistantVisibleText(text ?? "")).trimStart();
}
function stripLeadingBlankLines(text) {
	return text.replace(/^(?:[ \t]*\r?\n)+/, "");
}
function normalizeWhatsAppPayloadTextPreservingIndentation(text) {
	const normalized = stripLeadingBlankLines(finalizeWhatsAppVisibleText(sanitizeAssistantVisibleTextWithProfile(stripLeadingBlankLines(text ?? ""), "history")));
	return normalized.trim() ? normalized : "";
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
function inferWhatsAppMediaKind(media) {
	if (media.kind === "image" || media.kind === "audio" || media.kind === "video" || media.kind === "document") return media.kind;
	const contentType = normalizeContentType(media.contentType);
	if (contentType.startsWith("image/")) return "image";
	if (contentType.startsWith("audio/")) return "audio";
	if (contentType.startsWith("video/")) return "video";
	return "document";
}
function normalizeWhatsAppLoadedMedia(media, mediaUrl) {
	const kind = inferWhatsAppMediaKind(media);
	const mimetype = kind === "audio" && isWhatsAppNativeVoiceAudio({
		contentType: media.contentType,
		mediaUrl
	}) ? WHATSAPP_VOICE_MIMETYPE : media.contentType ?? "application/octet-stream";
	const fileName = kind === "document" ? resolveWhatsAppDocumentFileName({
		fileName: media.fileName ?? deriveWhatsAppDocumentFileName(mediaUrl),
		mimetype
	}) : media.fileName;
	return {
		buffer: media.buffer,
		kind,
		mimetype,
		...fileName ? { fileName } : {}
	};
}
async function prepareWhatsAppOutboundMedia(media, mediaUrl) {
	const normalized = normalizeWhatsAppLoadedMedia(media, mediaUrl);
	if (normalized.kind !== "audio") return normalized;
	if (isWhatsAppNativeVoiceAudio({
		contentType: media.contentType,
		fileName: media.fileName,
		mediaUrl
	})) return normalized;
	return {
		buffer: await transcodeToWhatsAppVoiceOpus({
			buffer: media.buffer,
			fileName: media.fileName ?? deriveWhatsAppDocumentFileName(mediaUrl) ?? "audio"
		}),
		kind: "audio",
		mimetype: WHATSAPP_VOICE_MIMETYPE
	};
}
function normalizeContentType(value) {
	return value?.split(";", 1)[0]?.trim().toLowerCase() ?? "";
}
function isWhatsAppNativeVoiceAudio(params) {
	const contentType = normalizeContentType(params.contentType);
	if (contentType === "audio/ogg" || contentType === "audio/opus") return true;
	const fileName = params.fileName ?? deriveWhatsAppDocumentFileName(params.mediaUrl) ?? "";
	const ext = path.extname(fileName).toLowerCase();
	return ext === ".ogg" || ext === ".opus";
}
async function transcodeToWhatsAppVoiceOpus(params) {
	return await withTempWorkspace({
		rootDir: resolvePreferredOpenClawTmpDir(),
		prefix: "whatsapp-voice-"
	}, async (workspace) => {
		const ext = path.extname(params.fileName).toLowerCase();
		const inputExt = ext && ext.length <= 12 ? ext : ".audio";
		const inputPath = await workspace.write(`input${inputExt}`, params.buffer);
		await writeExternalFileWithinRoot({
			rootDir: workspace.dir,
			path: WHATSAPP_VOICE_FILE_NAME,
			write: async (outputPath) => {
				await runFfmpeg([
					"-hide_banner",
					"-loglevel",
					"error",
					"-y",
					"-i",
					inputPath,
					"-vn",
					"-sn",
					"-dn",
					"-t",
					String(MEDIA_FFMPEG_MAX_AUDIO_DURATION_SECS),
					"-ar",
					String(WHATSAPP_VOICE_SAMPLE_RATE_HZ),
					"-ac",
					"1",
					"-c:a",
					"libopus",
					"-b:a",
					WHATSAPP_VOICE_BITRATE,
					"-f",
					"ogg",
					outputPath
				]);
			}
		});
		return await workspace.read(WHATSAPP_VOICE_FILE_NAME);
	});
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
		await sleep(backoffMs);
	}
	throw lastError;
}
//#endregion
export { resolveWhatsAppOutboundMediaUrls as a, prepareWhatsAppOutboundMedia as i, normalizeWhatsAppPayloadText as n, sendWhatsAppOutboundWithRetry as o, normalizeWhatsAppPayloadTextPreservingIndentation as r, resolveWhatsAppDocumentFileName as s, normalizeWhatsAppOutboundPayload as t };
