import { o as createSubsystemLogger } from "./entry.js";
import { a as resizeToJpeg, n as getImageMetadata } from "./image-ops-BuOO2fiP.js";

//#region src/agents/tool-images.ts
const MAX_IMAGE_DIMENSION_PX = 2e3;
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
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
async function resizeImageBase64IfNeeded(params) {
	const buf = Buffer.from(params.base64, "base64");
	const meta = await getImageMetadata(buf);
	const width = meta?.width;
	const height = meta?.height;
	const overBytes = buf.byteLength > params.maxBytes;
	const hasDimensions = typeof width === "number" && typeof height === "number";
	if (hasDimensions && !overBytes && width <= params.maxDimensionPx && height <= params.maxDimensionPx) return {
		base64: params.base64,
		mimeType: params.mimeType,
		resized: false,
		width,
		height
	};
	if (hasDimensions && (width > params.maxDimensionPx || height > params.maxDimensionPx || overBytes)) log.warn("Image exceeds limits; resizing", {
		label: params.label,
		width,
		height,
		maxDimensionPx: params.maxDimensionPx,
		maxBytes: params.maxBytes
	});
	const qualities = [
		85,
		75,
		65,
		55,
		45,
		35
	];
	const maxDim = hasDimensions ? Math.max(width ?? 0, height ?? 0) : params.maxDimensionPx;
	const sideGrid = [
		maxDim > 0 ? Math.min(params.maxDimensionPx, maxDim) : params.maxDimensionPx,
		1800,
		1600,
		1400,
		1200,
		1e3,
		800
	].map((v) => Math.min(params.maxDimensionPx, v)).filter((v, i, arr) => v > 0 && arr.indexOf(v) === i).toSorted((a, b) => b - a);
	let smallest = null;
	for (const side of sideGrid) for (const quality of qualities) {
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
			log.info("Image resized", {
				label: params.label,
				width,
				height,
				maxDimensionPx: params.maxDimensionPx,
				maxBytes: params.maxBytes,
				originalBytes: buf.byteLength,
				resizedBytes: out.byteLength,
				quality,
				side
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
	throw new Error(`Image could not be reduced below ${maxMb}MB (got ${gotMb}MB)`);
}
async function sanitizeContentBlocksImages(blocks, label, opts = {}) {
	const maxDimensionPx = Math.max(opts.maxDimensionPx ?? MAX_IMAGE_DIMENSION_PX, 1);
	const maxBytes = Math.max(opts.maxBytes ?? MAX_IMAGE_BYTES, 1);
	const out = [];
	for (const block of blocks) {
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
		try {
			const mimeType = inferMimeTypeFromBase64(data) ?? block.mimeType;
			const resized = await resizeImageBase64IfNeeded({
				base64: data,
				mimeType,
				maxDimensionPx,
				maxBytes,
				label
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
export { sanitizeImageBlocks as n, sanitizeToolResultImages as r, sanitizeContentBlocksImages as t };