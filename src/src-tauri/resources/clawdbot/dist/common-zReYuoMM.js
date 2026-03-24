import { t as createSubsystemLogger } from "./subsystem-DISldKSB.js";
import { c as resizeToJpeg, i as getImageMetadata, n as buildImageResizeSideGrid, t as IMAGE_REDUCE_QUALITY_STEPS } from "./image-ops-By4YfyWa.js";
import { t as detectMime } from "./mime-CsUtzcn2.js";
import fs from "node:fs/promises";
//#region src/media/base64.ts
function estimateBase64DecodedBytes(base64) {
	let effectiveLen = 0;
	for (let i = 0; i < base64.length; i += 1) {
		if (base64.charCodeAt(i) <= 32) continue;
		effectiveLen += 1;
	}
	if (effectiveLen === 0) return 0;
	let padding = 0;
	let end = base64.length - 1;
	while (end >= 0 && base64.charCodeAt(end) <= 32) end -= 1;
	if (end >= 0 && base64[end] === "=") {
		padding = 1;
		end -= 1;
		while (end >= 0 && base64.charCodeAt(end) <= 32) end -= 1;
		if (end >= 0 && base64[end] === "=") padding = 2;
	}
	const estimated = Math.floor(effectiveLen * 3 / 4) - padding;
	return Math.max(0, estimated);
}
const BASE64_CHARS_RE = /^[A-Za-z0-9+/]+={0,2}$/;
/**
* Normalize and validate a base64 string.
* Returns canonical base64 (no whitespace) or undefined when invalid.
*/
function canonicalizeBase64(base64) {
	const cleaned = base64.replace(/\s+/g, "");
	if (!cleaned || cleaned.length % 4 !== 0 || !BASE64_CHARS_RE.test(cleaned)) return;
	return cleaned;
}
//#endregion
//#region src/agents/image-sanitization.ts
const DEFAULT_IMAGE_MAX_DIMENSION_PX = 1200;
const DEFAULT_IMAGE_MAX_BYTES = 5 * 1024 * 1024;
function resolveImageSanitizationLimits(cfg) {
	const configured = cfg?.agents?.defaults?.imageMaxDimensionPx;
	if (typeof configured !== "number" || !Number.isFinite(configured)) return {};
	return { maxDimensionPx: Math.max(1, Math.floor(configured)) };
}
//#endregion
//#region src/agents/tool-images.ts
const MAX_IMAGE_DIMENSION_PX = DEFAULT_IMAGE_MAX_DIMENSION_PX;
const MAX_IMAGE_BYTES = DEFAULT_IMAGE_MAX_BYTES;
const log = createSubsystemLogger("agents/tool-images");
function isImageBlock(block) {
	if (!block || typeof block !== "object") return false;
	const rec = block;
	return rec.type === "image" && typeof rec.data === "string" && typeof rec.mimeType === "string";
}
function isTextBlock(block) {
	if (!block || typeof block !== "object") return false;
	const rec = block;
	return rec.type === "text" && typeof rec.text === "string";
}
function inferMimeTypeFromBase64(base64) {
	const trimmed = base64.trim();
	if (!trimmed) return;
	if (trimmed.startsWith("/9j/")) return "image/jpeg";
	if (trimmed.startsWith("iVBOR")) return "image/png";
	if (trimmed.startsWith("R0lGOD")) return "image/gif";
}
function formatBytesShort(bytes) {
	if (!Number.isFinite(bytes) || bytes < 1024) return `${Math.max(0, Math.round(bytes))}B`;
	if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
	return `${(bytes / (1024 * 1024)).toFixed(2)}MB`;
}
function parseMediaPathFromText(text) {
	for (const line of text.split(/\r?\n/u)) {
		const trimmed = line.trim();
		if (!trimmed.startsWith("MEDIA:")) continue;
		const raw = trimmed.slice(6).trim();
		if (!raw) continue;
		return (raw.match(/^`([^`]+)`$/u)?.[1] ?? raw).trim();
	}
}
function fileNameFromPathLike(pathLike) {
	const value = pathLike.trim();
	if (!value) return;
	try {
		const candidate = new URL(value).pathname.split("/").filter(Boolean).at(-1);
		return candidate && candidate.length > 0 ? candidate : void 0;
	} catch {}
	const candidate = value.replaceAll("\\", "/").split("/").filter(Boolean).at(-1);
	return candidate && candidate.length > 0 ? candidate : void 0;
}
function inferImageFileName(params) {
	const rec = params.block;
	for (const key of [
		"fileName",
		"filename",
		"path",
		"url"
	]) {
		const raw = rec[key];
		if (typeof raw !== "string" || raw.trim().length === 0) continue;
		const candidate = fileNameFromPathLike(raw);
		if (candidate) return candidate;
	}
	if (typeof rec.name === "string" && rec.name.trim().length > 0) return rec.name.trim();
	if (params.mediaPathHint) {
		const candidate = fileNameFromPathLike(params.mediaPathHint);
		if (candidate) return candidate;
	}
	if (typeof params.label === "string" && params.label.startsWith("read:")) {
		const candidate = fileNameFromPathLike(params.label.slice(5));
		if (candidate) return candidate;
	}
}
async function resizeImageBase64IfNeeded(params) {
	const buf = Buffer.from(params.base64, "base64");
	const meta = await getImageMetadata(buf);
	const width = meta?.width;
	const height = meta?.height;
	const overBytes = buf.byteLength > params.maxBytes;
	const hasDimensions = typeof width === "number" && typeof height === "number";
	const overDimensions = hasDimensions && (width > params.maxDimensionPx || height > params.maxDimensionPx);
	if (hasDimensions && !overBytes && width <= params.maxDimensionPx && height <= params.maxDimensionPx) return {
		base64: params.base64,
		mimeType: params.mimeType,
		resized: false,
		width,
		height
	};
	const maxDim = hasDimensions ? Math.max(width ?? 0, height ?? 0) : params.maxDimensionPx;
	const sideStart = maxDim > 0 ? Math.min(params.maxDimensionPx, maxDim) : params.maxDimensionPx;
	const sideGrid = buildImageResizeSideGrid(params.maxDimensionPx, sideStart);
	let smallest = null;
	for (const side of sideGrid) for (const quality of IMAGE_REDUCE_QUALITY_STEPS) {
		const out = await resizeToJpeg({
			buffer: buf,
			maxSide: side,
			quality,
			withoutEnlargement: true
		});
		if (!smallest || out.byteLength < smallest.size) smallest = {
			buffer: out,
			size: out.byteLength
		};
		if (out.byteLength <= params.maxBytes) {
			const sourcePixels = typeof width === "number" && typeof height === "number" ? `${width}x${height}px` : "unknown";
			const sourceWithFile = params.fileName ? `${params.fileName} ${sourcePixels}` : sourcePixels;
			const byteReductionPct = buf.byteLength > 0 ? Number(((buf.byteLength - out.byteLength) / buf.byteLength * 100).toFixed(1)) : 0;
			log.info(`Image resized to fit limits: ${sourceWithFile} ${formatBytesShort(buf.byteLength)} -> ${formatBytesShort(out.byteLength)} (-${byteReductionPct}%)`, {
				label: params.label,
				fileName: params.fileName,
				sourceMimeType: params.mimeType,
				sourceWidth: width,
				sourceHeight: height,
				sourceBytes: buf.byteLength,
				maxBytes: params.maxBytes,
				maxDimensionPx: params.maxDimensionPx,
				triggerOverBytes: overBytes,
				triggerOverDimensions: overDimensions,
				outputMimeType: "image/jpeg",
				outputBytes: out.byteLength,
				outputQuality: quality,
				outputMaxSide: side,
				byteReductionPct
			});
			return {
				base64: out.toString("base64"),
				mimeType: "image/jpeg",
				resized: true,
				width,
				height
			};
		}
	}
	const best = smallest?.buffer ?? buf;
	const maxMb = (params.maxBytes / (1024 * 1024)).toFixed(0);
	const gotMb = (best.byteLength / (1024 * 1024)).toFixed(2);
	const sourcePixels = typeof width === "number" && typeof height === "number" ? `${width}x${height}px` : "unknown";
	const sourceWithFile = params.fileName ? `${params.fileName} ${sourcePixels}` : sourcePixels;
	log.warn(`Image resize failed to fit limits: ${sourceWithFile} best=${formatBytesShort(best.byteLength)} limit=${formatBytesShort(params.maxBytes)}`, {
		label: params.label,
		fileName: params.fileName,
		sourceMimeType: params.mimeType,
		sourceWidth: width,
		sourceHeight: height,
		sourceBytes: buf.byteLength,
		maxDimensionPx: params.maxDimensionPx,
		maxBytes: params.maxBytes,
		smallestCandidateBytes: best.byteLength,
		triggerOverBytes: overBytes,
		triggerOverDimensions: overDimensions
	});
	throw new Error(`Image could not be reduced below ${maxMb}MB (got ${gotMb}MB)`);
}
async function sanitizeContentBlocksImages(blocks, label, opts = {}) {
	const maxDimensionPx = Math.max(opts.maxDimensionPx ?? MAX_IMAGE_DIMENSION_PX, 1);
	const maxBytes = Math.max(opts.maxBytes ?? MAX_IMAGE_BYTES, 1);
	const out = [];
	let mediaPathHint;
	for (const block of blocks) {
		if (isTextBlock(block)) {
			const mediaPath = parseMediaPathFromText(block.text);
			if (mediaPath) mediaPathHint = mediaPath;
		}
		if (!isImageBlock(block)) {
			out.push(block);
			continue;
		}
		const data = block.data.trim();
		if (!data) {
			out.push({
				type: "text",
				text: `[${label}] omitted empty image payload`
			});
			continue;
		}
		const canonicalData = canonicalizeBase64(data);
		if (!canonicalData) {
			out.push({
				type: "text",
				text: `[${label}] omitted image payload: invalid base64`
			});
			continue;
		}
		try {
			const mimeType = inferMimeTypeFromBase64(canonicalData) ?? block.mimeType;
			const resized = await resizeImageBase64IfNeeded({
				base64: canonicalData,
				mimeType,
				maxDimensionPx,
				maxBytes,
				label,
				fileName: inferImageFileName({
					block,
					label,
					mediaPathHint
				})
			});
			out.push({
				...block,
				data: resized.base64,
				mimeType: resized.resized ? resized.mimeType : mimeType
			});
		} catch (err) {
			out.push({
				type: "text",
				text: `[${label}] omitted image payload: ${String(err)}`
			});
		}
	}
	return out;
}
async function sanitizeImageBlocks(images, label, opts = {}) {
	if (images.length === 0) return {
		images,
		dropped: 0
	};
	const next = (await sanitizeContentBlocksImages(images, label, opts)).filter(isImageBlock);
	return {
		images: next,
		dropped: Math.max(0, images.length - next.length)
	};
}
async function sanitizeToolResultImages(result, label, opts = {}) {
	const content = Array.isArray(result.content) ? result.content : [];
	if (!content.some((b) => isImageBlock(b) || isTextBlock(b))) return result;
	const next = await sanitizeContentBlocksImages(content, label, opts);
	return {
		...result,
		content: next
	};
}
//#endregion
//#region src/param-key.ts
function toSnakeCaseKey(key) {
	return key.replace(/([A-Z]+)([A-Z][a-z])/g, "$1_$2").replace(/([a-z0-9])([A-Z])/g, "$1_$2").toLowerCase();
}
function readSnakeCaseParamRaw(params, key) {
	if (Object.hasOwn(params, key)) return params[key];
	const snakeKey = toSnakeCaseKey(key);
	if (snakeKey !== key && Object.hasOwn(params, snakeKey)) return params[snakeKey];
}
//#endregion
//#region src/agents/tools/common.ts
const OWNER_ONLY_TOOL_ERROR = "Tool restricted to owner senders.";
var ToolInputError = class extends Error {
	constructor(message) {
		super(message);
		this.status = 400;
		this.name = "ToolInputError";
	}
};
var ToolAuthorizationError = class extends ToolInputError {
	constructor(message) {
		super(message);
		this.status = 403;
		this.name = "ToolAuthorizationError";
	}
};
function createActionGate(actions) {
	return (key, defaultValue = true) => {
		const value = actions?.[key];
		if (value === void 0) return defaultValue;
		return value !== false;
	};
}
function readParamRaw(params, key) {
	return readSnakeCaseParamRaw(params, key);
}
function readStringParam(params, key, options = {}) {
	const { required = false, trim = true, label = key, allowEmpty = false } = options;
	const raw = readParamRaw(params, key);
	if (typeof raw !== "string") {
		if (required) throw new ToolInputError(`${label} required`);
		return;
	}
	const value = trim ? raw.trim() : raw;
	if (!value && !allowEmpty) {
		if (required) throw new ToolInputError(`${label} required`);
		return;
	}
	return value;
}
function readStringOrNumberParam(params, key, options = {}) {
	const { required = false, label = key } = options;
	const raw = readParamRaw(params, key);
	if (typeof raw === "number" && Number.isFinite(raw)) return String(raw);
	if (typeof raw === "string") {
		const value = raw.trim();
		if (value) return value;
	}
	if (required) throw new ToolInputError(`${label} required`);
}
function readNumberParam(params, key, options = {}) {
	const { required = false, label = key, integer = false, strict = false } = options;
	const raw = readParamRaw(params, key);
	let value;
	if (typeof raw === "number" && Number.isFinite(raw)) value = raw;
	else if (typeof raw === "string") {
		const trimmed = raw.trim();
		if (trimmed) {
			const parsed = strict ? Number(trimmed) : Number.parseFloat(trimmed);
			if (Number.isFinite(parsed)) value = parsed;
		}
	}
	if (value === void 0) {
		if (required) throw new ToolInputError(`${label} required`);
		return;
	}
	return integer ? Math.trunc(value) : value;
}
function readStringArrayParam(params, key, options = {}) {
	const { required = false, label = key } = options;
	const raw = readParamRaw(params, key);
	if (Array.isArray(raw)) {
		const values = raw.filter((entry) => typeof entry === "string").map((entry) => entry.trim()).filter(Boolean);
		if (values.length === 0) {
			if (required) throw new ToolInputError(`${label} required`);
			return;
		}
		return values;
	}
	if (typeof raw === "string") {
		const value = raw.trim();
		if (!value) {
			if (required) throw new ToolInputError(`${label} required`);
			return;
		}
		return [value];
	}
	if (required) throw new ToolInputError(`${label} required`);
}
function readReactionParams(params, options) {
	const emojiKey = options.emojiKey ?? "emoji";
	const removeKey = options.removeKey ?? "remove";
	const remove = typeof params[removeKey] === "boolean" ? params[removeKey] : false;
	const emoji = readStringParam(params, emojiKey, {
		required: true,
		allowEmpty: true
	});
	if (remove && !emoji) throw new ToolInputError(options.removeErrorMessage);
	return {
		emoji,
		remove,
		isEmpty: !emoji
	};
}
function stringifyToolPayload(payload) {
	if (typeof payload === "string") return payload;
	try {
		const encoded = JSON.stringify(payload, null, 2);
		if (typeof encoded === "string") return encoded;
	} catch {}
	return String(payload);
}
function textResult(text, details) {
	return {
		content: [{
			type: "text",
			text
		}],
		details
	};
}
function failedTextResult(text, details) {
	return textResult(text, details);
}
function payloadTextResult(payload) {
	return textResult(stringifyToolPayload(payload), payload);
}
function jsonResult(payload) {
	return textResult(JSON.stringify(payload, null, 2), payload);
}
function wrapOwnerOnlyToolExecution(tool, senderIsOwner) {
	if (tool.ownerOnly !== true || senderIsOwner || !tool.execute) return tool;
	return {
		...tool,
		execute: async () => {
			throw new Error(OWNER_ONLY_TOOL_ERROR);
		}
	};
}
async function imageResult(params) {
	const content = [...params.extraText ? [{
		type: "text",
		text: params.extraText
	}] : [], {
		type: "image",
		data: params.base64,
		mimeType: params.mimeType
	}];
	const detailsMedia = params.details?.media && typeof params.details.media === "object" && !Array.isArray(params.details.media) ? params.details.media : void 0;
	return await sanitizeToolResultImages({
		content,
		details: {
			path: params.path,
			...params.details,
			media: {
				...detailsMedia,
				mediaUrl: params.path
			}
		}
	}, params.label, params.imageSanitization);
}
async function imageResultFromFile(params) {
	const buf = await fs.readFile(params.path);
	const mimeType = await detectMime({ buffer: buf.slice(0, 256) }) ?? "image/png";
	return await imageResult({
		label: params.label,
		path: params.path,
		base64: buf.toString("base64"),
		mimeType,
		extraText: params.extraText,
		details: params.details,
		imageSanitization: params.imageSanitization
	});
}
/**
* Validate and parse an `availableTags` parameter from untrusted input.
* Returns `undefined` when the value is missing or not an array.
* Entries that lack a string `name` are silently dropped.
*/
function parseAvailableTags(raw) {
	if (raw === void 0 || raw === null) return;
	if (!Array.isArray(raw)) return;
	const result = raw.filter((t) => typeof t === "object" && t !== null && typeof t.name === "string").map((t) => ({
		...t.id !== void 0 && typeof t.id === "string" ? { id: t.id } : {},
		name: t.name,
		...typeof t.moderated === "boolean" ? { moderated: t.moderated } : {},
		...t.emoji_id === null || typeof t.emoji_id === "string" ? { emoji_id: t.emoji_id } : {},
		...t.emoji_name === null || typeof t.emoji_name === "string" ? { emoji_name: t.emoji_name } : {}
	}));
	return result.length ? result : void 0;
}
//#endregion
export { resolveImageSanitizationLimits as C, sanitizeToolResultImages as S, estimateBase64DecodedBytes as T, textResult as _, failedTextResult as a, sanitizeContentBlocksImages as b, jsonResult as c, readNumberParam as d, readReactionParams as f, stringifyToolPayload as g, readStringParam as h, createActionGate as i, parseAvailableTags as l, readStringOrNumberParam as m, ToolAuthorizationError as n, imageResult as o, readStringArrayParam as p, ToolInputError as r, imageResultFromFile as s, OWNER_ONLY_TOOL_ERROR as t, payloadTextResult as u, wrapOwnerOnlyToolExecution as v, canonicalizeBase64 as w, sanitizeImageBlocks as x, readSnakeCaseParamRaw as y };
