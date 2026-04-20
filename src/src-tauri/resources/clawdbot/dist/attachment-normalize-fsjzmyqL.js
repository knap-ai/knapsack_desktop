import { i as formatErrorMessage } from "./errors-D8p6rxH8.js";
import { i as normalizeLowercaseStringOrEmpty, o as normalizeOptionalLowercaseString } from "./string-coerce-BUSzWgUA.js";
import { n as estimateBase64DecodedBytes } from "./base64-BgT9iohk.js";
import { t as sniffMimeFromBase64 } from "./sniff-mime-from-base64-isS89uB9.js";
import { i as deleteMediaBuffer, l as saveMediaBuffer } from "./store-CFeRgpZO.js";
//#region src/gateway/chat-attachments.ts
const OFFLOAD_THRESHOLD_BYTES = 2e6;
const MIME_TO_EXT = {
	"image/jpeg": ".jpg",
	"image/jpg": ".jpg",
	"image/png": ".png",
	"image/webp": ".webp",
	"image/gif": ".gif",
	"image/heic": ".heic",
	"image/heif": ".heif",
	"image/bmp": ".bmp",
	"image/tiff": ".tiff"
};
const SUPPORTED_OFFLOAD_MIMES = new Set([
	"image/jpeg",
	"image/jpg",
	"image/png",
	"image/webp",
	"image/gif",
	"image/heic",
	"image/heif"
]);
/**
* Raised when the Gateway cannot persist an attachment to the media store.
*
* Distinct from ordinary input-validation errors so that Gateway handlers can
* map it to a server-side 5xx status rather than a client 4xx.
*
* Example causes: ENOSPC, EPERM, unexpected saveMediaBuffer return shape.
*/
var MediaOffloadError = class extends Error {
	constructor(message, options) {
		super(message, options);
		this.name = "MediaOffloadError";
		this.cause = options?.cause;
	}
};
function normalizeMime(mime) {
	if (!mime) return;
	return normalizeOptionalLowercaseString(mime.split(";")[0]) || void 0;
}
function isImageMime(mime) {
	return typeof mime === "string" && mime.startsWith("image/");
}
function isValidBase64(value) {
	if (value.length === 0 || value.length % 4 !== 0) return false;
	return /^[A-Za-z0-9+/]+={0,2}$/.test(value);
}
/**
* Confirms that the decoded buffer produced by Buffer.from(b64, 'base64')
* matches the pre-decode size estimate.
*
* Node's Buffer.from silently drops invalid base64 characters rather than
* throwing. A material size discrepancy means the source string contained
* embedded garbage that was silently stripped, which would produce a corrupted
* file on disk. ±3 bytes of slack accounts for base64 padding rounding.
*
* IMPORTANT: this is an input-validation check (4xx client error).
* It MUST be called OUTSIDE the MediaOffloadError try/catch so that
* corrupt-input errors are not misclassified as 5xx server errors.
*/
function verifyDecodedSize(buffer, estimatedBytes, label) {
	if (Math.abs(buffer.byteLength - estimatedBytes) > 3) throw new Error(`attachment ${label}: base64 contains invalid characters (expected ~${estimatedBytes} bytes decoded, got ${buffer.byteLength})`);
}
function ensureExtension(label, mime) {
	if (/\.[a-zA-Z0-9]+$/.test(label)) return label;
	const ext = MIME_TO_EXT[normalizeLowercaseStringOrEmpty(mime)] ?? "";
	return ext ? `${label}${ext}` : label;
}
/**
* Type guard for the return value of saveMediaBuffer.
*
* Also validates that the returned ID:
* - is a non-empty string
* - contains no path separators (/ or \) or null bytes
*
* Catching a bad shape here produces a cleaner error than a cryptic failure
* deeper in the stack, and is treated as a 5xx infrastructure error.
*/
function assertSavedMedia(value, label) {
	if (value !== null && typeof value === "object" && "id" in value && typeof value.id === "string") {
		const id = value.id;
		if (id.length === 0) throw new Error(`attachment ${label}: saveMediaBuffer returned an empty media ID`);
		if (id.includes("/") || id.includes("\\") || id.includes("\0")) throw new Error(`attachment ${label}: saveMediaBuffer returned an unsafe media ID (contains path separator or null byte)`);
		return value;
	}
	throw new Error(`attachment ${label}: saveMediaBuffer returned an unexpected shape`);
}
function normalizeAttachment(att, idx, opts) {
	const mime = att.mimeType ?? "";
	const content = att.content;
	const label = att.fileName || att.type || `attachment-${idx + 1}`;
	if (typeof content !== "string") throw new Error(`attachment ${label}: content must be base64 string`);
	if (opts.requireImageMime && !mime.startsWith("image/")) throw new Error(`attachment ${label}: only image/* supported`);
	let base64 = content.trim();
	if (opts.stripDataUrlPrefix) {
		const dataUrlMatch = /^data:[^;]+;base64,(.*)$/.exec(base64);
		if (dataUrlMatch) base64 = dataUrlMatch[1];
	}
	return {
		label,
		mime,
		base64
	};
}
/**
* Parse attachments and extract images as structured content blocks.
* Returns the message text, inline image blocks, and offloaded media refs.
*
* ## Offload behaviour
* Attachments whose decoded size exceeds OFFLOAD_THRESHOLD_BYTES are saved to
* disk via saveMediaBuffer and replaced with an opaque `media://inbound/<id>`
* URI appended to the message. The agent resolves these URIs via
* resolveMediaBufferPath before passing them to the model.
*
* ## Transcript metadata
* Callers MUST use `result.offloadedRefs` to persist structured media metadata
* for transcripts. These refs are intentionally excluded from `result.images`
* because they are not passed inline to the model.
*
* ## Text-only model runs
* Pass `supportsImages: false` for text-only model runs so that no media://
* markers are injected into prompt text.
*
* ⚠️  Call sites in chat.ts, agent.ts, and server-node-events.ts MUST be
* updated to pass `supportsImages: modelSupportsImages(model)`. Until they do,
* text-only model runs receive unresolvable media:// markers in their prompt.
*
* ## Cleanup on failure
* On any parse failure after files have already been offloaded, best-effort
* cleanup is performed before rethrowing so that malformed requests do not
* accumulate orphaned files on disk ahead of the periodic TTL sweep.
*
* ## Known ordering limitation
* In mixed large/small batches, the model receives images in a different order
* than the original attachment list because detectAndLoadPromptImages
* initialises from existingImages first, then appends prompt-detected refs.
* A future refactor should unify all image references into a single ordered list.
*
* @throws {MediaOffloadError} Infrastructure failure saving to media store → 5xx.
* @throws {Error} Input validation failure → 4xx.
*/
async function parseMessageWithAttachments(message, attachments, opts) {
	const maxBytes = opts?.maxBytes ?? 5e6;
	const log = opts?.log;
	if (!attachments || attachments.length === 0) return {
		message,
		images: [],
		imageOrder: [],
		offloadedRefs: []
	};
	if (opts?.supportsImages === false) {
		if (attachments.length > 0) log?.warn(`parseMessageWithAttachments: ${attachments.length} attachment(s) dropped — model does not support images`);
		return {
			message,
			images: [],
			imageOrder: [],
			offloadedRefs: []
		};
	}
	const images = [];
	const imageOrder = [];
	const offloadedRefs = [];
	let updatedMessage = message;
	const savedMediaIds = [];
	try {
		for (const [idx, att] of attachments.entries()) {
			if (!att) continue;
			const { base64: b64, label, mime } = normalizeAttachment(att, idx, {
				stripDataUrlPrefix: true,
				requireImageMime: false
			});
			if (!isValidBase64(b64)) throw new Error(`attachment ${label}: invalid base64 content`);
			const sizeBytes = estimateBase64DecodedBytes(b64);
			if (sizeBytes <= 0) {
				log?.warn(`attachment ${label}: estimated size is zero, dropping`);
				continue;
			}
			if (sizeBytes > maxBytes) throw new Error(`attachment ${label}: exceeds size limit (${sizeBytes} > ${maxBytes} bytes)`);
			const providedMime = normalizeMime(mime);
			const sniffedMime = normalizeMime(await sniffMimeFromBase64(b64));
			if (sniffedMime && !isImageMime(sniffedMime)) {
				log?.warn(`attachment ${label}: detected non-image (${sniffedMime}), dropping`);
				continue;
			}
			if (!sniffedMime && !isImageMime(providedMime)) {
				log?.warn(`attachment ${label}: unable to detect image mime type, dropping`);
				continue;
			}
			if (sniffedMime && providedMime && sniffedMime !== providedMime) log?.warn(`attachment ${label}: mime mismatch (${providedMime} -> ${sniffedMime}), using sniffed`);
			const finalMime = sniffedMime ?? providedMime ?? normalizeMime(mime) ?? mime;
			let isOffloaded = false;
			if (sizeBytes > OFFLOAD_THRESHOLD_BYTES) {
				if (!SUPPORTED_OFFLOAD_MIMES.has(finalMime)) throw new Error(`attachment ${label}: format ${finalMime} is too large to pass inline (${sizeBytes} > ${OFFLOAD_THRESHOLD_BYTES} bytes) and cannot be offloaded. Please convert to JPEG, PNG, WEBP, GIF, HEIC, or HEIF.`);
				const buffer = Buffer.from(b64, "base64");
				verifyDecodedSize(buffer, sizeBytes, label);
				try {
					const savedMedia = assertSavedMedia(await saveMediaBuffer(buffer, finalMime, "inbound", maxBytes, ensureExtension(label, finalMime)), label);
					savedMediaIds.push(savedMedia.id);
					const mediaRef = `media://inbound/${savedMedia.id}`;
					updatedMessage += `\n[media attached: ${mediaRef}]`;
					log?.info?.(`[Gateway] Intercepted large image payload. Saved: ${mediaRef}`);
					offloadedRefs.push({
						mediaRef,
						id: savedMedia.id,
						path: savedMedia.path ?? "",
						mimeType: finalMime,
						label
					});
					imageOrder.push("offloaded");
					isOffloaded = true;
				} catch (err) {
					throw new MediaOffloadError(`[Gateway Error] Failed to save intercepted media to disk: ${formatErrorMessage(err)}`, { cause: err });
				}
			}
			if (isOffloaded) continue;
			images.push({
				type: "image",
				data: b64,
				mimeType: finalMime
			});
			imageOrder.push("inline");
		}
	} catch (err) {
		if (savedMediaIds.length > 0) await Promise.allSettled(savedMediaIds.map((id) => deleteMediaBuffer(id, "inbound")));
		throw err;
	}
	return {
		message: updatedMessage !== message ? updatedMessage.trimEnd() : message,
		images,
		imageOrder,
		offloadedRefs
	};
}
//#endregion
//#region src/gateway/server-methods/attachment-normalize.ts
function normalizeAttachmentContent(content) {
	if (typeof content === "string") return content;
	if (ArrayBuffer.isView(content)) return Buffer.from(content.buffer, content.byteOffset, content.byteLength).toString("base64");
	if (content instanceof ArrayBuffer) return Buffer.from(content).toString("base64");
}
function normalizeRpcAttachmentsToChatAttachments(attachments) {
	return attachments?.map((a) => {
		const sourceRecord = a?.source && typeof a.source === "object" ? a.source : void 0;
		const sourceType = typeof sourceRecord?.type === "string" ? sourceRecord.type : void 0;
		const sourceMimeType = typeof sourceRecord?.media_type === "string" ? sourceRecord.media_type : void 0;
		const sourceContent = sourceType === "base64" ? normalizeAttachmentContent(sourceRecord?.data) : void 0;
		return {
			type: typeof a?.type === "string" ? a.type : void 0,
			mimeType: typeof a?.mimeType === "string" ? a.mimeType : sourceMimeType,
			fileName: typeof a?.fileName === "string" ? a.fileName : void 0,
			content: normalizeAttachmentContent(a?.content) ?? sourceContent
		};
	}).filter((a) => a.content) ?? [];
}
//#endregion
export { MediaOffloadError as n, parseMessageWithAttachments as r, normalizeRpcAttachmentsToChatAttachments as t };
