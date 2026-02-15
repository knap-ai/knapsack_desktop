import { n as runExec } from "./exec-B52LZOrO.js";
import path from "node:path";
import os from "node:os";
import fs from "node:fs/promises";
import { lookup } from "node:dns";
import { lookup as lookup$1 } from "node:dns/promises";
import { Agent } from "undici";
import { fileTypeFromBuffer } from "file-type";

//#region src/media/constants.ts
const MAX_IMAGE_BYTES = 6 * 1024 * 1024;
const MAX_AUDIO_BYTES = 16 * 1024 * 1024;
const MAX_VIDEO_BYTES = 16 * 1024 * 1024;
const MAX_DOCUMENT_BYTES = 100 * 1024 * 1024;
function mediaKindFromMime(mime) {
	if (!mime) return "unknown";
	if (mime.startsWith("image/")) return "image";
	if (mime.startsWith("audio/")) return "audio";
	if (mime.startsWith("video/")) return "video";
	if (mime === "application/pdf") return "document";
	if (mime.startsWith("text/")) return "document";
	if (mime.startsWith("application/")) return "document";
	return "unknown";
}
function maxBytesForKind(kind) {
	switch (kind) {
		case "image": return MAX_IMAGE_BYTES;
		case "audio": return MAX_AUDIO_BYTES;
		case "video": return MAX_VIDEO_BYTES;
		case "document": return MAX_DOCUMENT_BYTES;
		default: return MAX_DOCUMENT_BYTES;
	}
}

//#endregion
//#region src/infra/net/ssrf.ts
var SsrFBlockedError = class extends Error {
	constructor(message) {
		super(message);
		this.name = "SsrFBlockedError";
	}
};
const PRIVATE_IPV6_PREFIXES = [
	"fe80:",
	"fec0:",
	"fc",
	"fd"
];
const BLOCKED_HOSTNAMES = new Set(["localhost", "metadata.google.internal"]);
function normalizeHostname(hostname) {
	const normalized = hostname.trim().toLowerCase().replace(/\.$/, "");
	if (normalized.startsWith("[") && normalized.endsWith("]")) return normalized.slice(1, -1);
	return normalized;
}
function normalizeHostnameSet(values) {
	if (!values || values.length === 0) return /* @__PURE__ */ new Set();
	return new Set(values.map((value) => normalizeHostname(value)).filter(Boolean));
}
function normalizeHostnameAllowlist(values) {
	if (!values || values.length === 0) return [];
	return Array.from(new Set(values.map((value) => normalizeHostname(value)).filter((value) => value !== "*" && value !== "*." && value.length > 0)));
}
function isHostnameAllowedByPattern(hostname, pattern) {
	if (pattern.startsWith("*.")) {
		const suffix = pattern.slice(2);
		if (!suffix || hostname === suffix) return false;
		return hostname.endsWith(`.${suffix}`);
	}
	return hostname === pattern;
}
function matchesHostnameAllowlist(hostname, allowlist) {
	if (allowlist.length === 0) return true;
	return allowlist.some((pattern) => isHostnameAllowedByPattern(hostname, pattern));
}
function parseIpv4(address) {
	const parts = address.split(".");
	if (parts.length !== 4) return null;
	const numbers = parts.map((part) => Number.parseInt(part, 10));
	if (numbers.some((value) => Number.isNaN(value) || value < 0 || value > 255)) return null;
	return numbers;
}
function parseIpv4FromMappedIpv6(mapped) {
	if (mapped.includes(".")) return parseIpv4(mapped);
	const parts = mapped.split(":").filter(Boolean);
	if (parts.length === 1) {
		const value = Number.parseInt(parts[0], 16);
		if (Number.isNaN(value) || value < 0 || value > 4294967295) return null;
		return [
			value >>> 24 & 255,
			value >>> 16 & 255,
			value >>> 8 & 255,
			value & 255
		];
	}
	if (parts.length !== 2) return null;
	const high = Number.parseInt(parts[0], 16);
	const low = Number.parseInt(parts[1], 16);
	if (Number.isNaN(high) || Number.isNaN(low) || high < 0 || low < 0 || high > 65535 || low > 65535) return null;
	const value = (high << 16) + low;
	return [
		value >>> 24 & 255,
		value >>> 16 & 255,
		value >>> 8 & 255,
		value & 255
	];
}
function isPrivateIpv4(parts) {
	const [octet1, octet2] = parts;
	if (octet1 === 0) return true;
	if (octet1 === 10) return true;
	if (octet1 === 127) return true;
	if (octet1 === 169 && octet2 === 254) return true;
	if (octet1 === 172 && octet2 >= 16 && octet2 <= 31) return true;
	if (octet1 === 192 && octet2 === 168) return true;
	if (octet1 === 100 && octet2 >= 64 && octet2 <= 127) return true;
	return false;
}
function isPrivateIpAddress(address) {
	let normalized = address.trim().toLowerCase();
	if (normalized.startsWith("[") && normalized.endsWith("]")) normalized = normalized.slice(1, -1);
	if (!normalized) return false;
	if (normalized.startsWith("::ffff:")) {
		const ipv4 = parseIpv4FromMappedIpv6(normalized.slice(7));
		if (ipv4) return isPrivateIpv4(ipv4);
	}
	if (normalized.includes(":")) {
		if (normalized === "::" || normalized === "::1") return true;
		return PRIVATE_IPV6_PREFIXES.some((prefix) => normalized.startsWith(prefix));
	}
	const ipv4 = parseIpv4(normalized);
	if (!ipv4) return false;
	return isPrivateIpv4(ipv4);
}
function isBlockedHostname(hostname) {
	const normalized = normalizeHostname(hostname);
	if (!normalized) return false;
	if (BLOCKED_HOSTNAMES.has(normalized)) return true;
	return normalized.endsWith(".localhost") || normalized.endsWith(".local") || normalized.endsWith(".internal");
}
function createPinnedLookup(params) {
	const normalizedHost = normalizeHostname(params.hostname);
	const fallback = params.fallback ?? lookup;
	const fallbackLookup = fallback;
	const fallbackWithOptions = fallback;
	const records = params.addresses.map((address) => ({
		address,
		family: address.includes(":") ? 6 : 4
	}));
	let index = 0;
	return ((host, options, callback) => {
		const cb = typeof options === "function" ? options : callback;
		if (!cb) return;
		const normalized = normalizeHostname(host);
		if (!normalized || normalized !== normalizedHost) {
			if (typeof options === "function" || options === void 0) return fallbackLookup(host, cb);
			return fallbackWithOptions(host, options, cb);
		}
		const opts = typeof options === "object" && options !== null ? options : {};
		const requestedFamily = typeof options === "number" ? options : typeof opts.family === "number" ? opts.family : 0;
		const candidates = requestedFamily === 4 || requestedFamily === 6 ? records.filter((entry) => entry.family === requestedFamily) : records;
		const usable = candidates.length > 0 ? candidates : records;
		if (opts.all) {
			cb(null, usable);
			return;
		}
		const chosen = usable[index % usable.length];
		index += 1;
		cb(null, chosen.address, chosen.family);
	});
}
async function resolvePinnedHostnameWithPolicy(hostname, params = {}) {
	const normalized = normalizeHostname(hostname);
	if (!normalized) throw new Error("Invalid hostname");
	const allowPrivateNetwork = Boolean(params.policy?.allowPrivateNetwork);
	const allowedHostnames = normalizeHostnameSet(params.policy?.allowedHostnames);
	const hostnameAllowlist = normalizeHostnameAllowlist(params.policy?.hostnameAllowlist);
	const isExplicitAllowed = allowedHostnames.has(normalized);
	if (!matchesHostnameAllowlist(normalized, hostnameAllowlist)) throw new SsrFBlockedError(`Blocked hostname (not in allowlist): ${hostname}`);
	if (!allowPrivateNetwork && !isExplicitAllowed) {
		if (isBlockedHostname(normalized)) throw new SsrFBlockedError(`Blocked hostname: ${hostname}`);
		if (isPrivateIpAddress(normalized)) throw new SsrFBlockedError("Blocked: private/internal IP address");
	}
	const results = await (params.lookupFn ?? lookup$1)(normalized, { all: true });
	if (results.length === 0) throw new Error(`Unable to resolve hostname: ${hostname}`);
	if (!allowPrivateNetwork && !isExplicitAllowed) {
		for (const entry of results) if (isPrivateIpAddress(entry.address)) throw new SsrFBlockedError("Blocked: resolves to private/internal IP address");
	}
	const addresses = Array.from(new Set(results.map((entry) => entry.address)));
	if (addresses.length === 0) throw new Error(`Unable to resolve hostname: ${hostname}`);
	return {
		hostname: normalized,
		addresses,
		lookup: createPinnedLookup({
			hostname: normalized,
			addresses
		})
	};
}
function createPinnedDispatcher(pinned) {
	return new Agent({ connect: { lookup: pinned.lookup } });
}
async function closeDispatcher(dispatcher) {
	if (!dispatcher) return;
	const candidate = dispatcher;
	try {
		if (typeof candidate.close === "function") {
			await candidate.close();
			return;
		}
		if (typeof candidate.destroy === "function") candidate.destroy();
	} catch {}
}

//#endregion
//#region src/media/mime.ts
const EXT_BY_MIME = {
	"image/heic": ".heic",
	"image/heif": ".heif",
	"image/jpeg": ".jpg",
	"image/png": ".png",
	"image/webp": ".webp",
	"image/gif": ".gif",
	"audio/ogg": ".ogg",
	"audio/mpeg": ".mp3",
	"audio/x-m4a": ".m4a",
	"audio/mp4": ".m4a",
	"video/mp4": ".mp4",
	"video/quicktime": ".mov",
	"application/pdf": ".pdf",
	"application/json": ".json",
	"application/zip": ".zip",
	"application/gzip": ".gz",
	"application/x-tar": ".tar",
	"application/x-7z-compressed": ".7z",
	"application/vnd.rar": ".rar",
	"application/msword": ".doc",
	"application/vnd.ms-excel": ".xls",
	"application/vnd.ms-powerpoint": ".ppt",
	"application/vnd.openxmlformats-officedocument.wordprocessingml.document": ".docx",
	"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": ".xlsx",
	"application/vnd.openxmlformats-officedocument.presentationml.presentation": ".pptx",
	"text/csv": ".csv",
	"text/plain": ".txt",
	"text/markdown": ".md"
};
const MIME_BY_EXT = {
	...Object.fromEntries(Object.entries(EXT_BY_MIME).map(([mime, ext]) => [ext, mime])),
	".jpeg": "image/jpeg"
};
const AUDIO_FILE_EXTENSIONS = new Set([
	".aac",
	".caf",
	".flac",
	".m4a",
	".mp3",
	".oga",
	".ogg",
	".opus",
	".wav"
]);
function normalizeMimeType(mime) {
	if (!mime) return;
	return mime.split(";")[0]?.trim().toLowerCase() || void 0;
}
async function sniffMime(buffer) {
	if (!buffer) return;
	try {
		return (await fileTypeFromBuffer(buffer))?.mime ?? void 0;
	} catch {
		return;
	}
}
function getFileExtension(filePath) {
	if (!filePath) return;
	try {
		if (/^https?:\/\//i.test(filePath)) {
			const url = new URL(filePath);
			return path.extname(url.pathname).toLowerCase() || void 0;
		}
	} catch {}
	return path.extname(filePath).toLowerCase() || void 0;
}
function isAudioFileName(fileName) {
	const ext = getFileExtension(fileName);
	if (!ext) return false;
	return AUDIO_FILE_EXTENSIONS.has(ext);
}
function detectMime(opts) {
	return detectMimeImpl(opts);
}
function isGenericMime(mime) {
	if (!mime) return true;
	const m = mime.toLowerCase();
	return m === "application/octet-stream" || m === "application/zip";
}
async function detectMimeImpl(opts) {
	const ext = getFileExtension(opts.filePath);
	const extMime = ext ? MIME_BY_EXT[ext] : void 0;
	const headerMime = normalizeMimeType(opts.headerMime);
	const sniffed = await sniffMime(opts.buffer);
	if (sniffed && (!isGenericMime(sniffed) || !extMime)) return sniffed;
	if (extMime) return extMime;
	if (headerMime && !isGenericMime(headerMime)) return headerMime;
	if (sniffed) return sniffed;
	if (headerMime) return headerMime;
}
function extensionForMime(mime) {
	const normalized = normalizeMimeType(mime);
	if (!normalized) return;
	return EXT_BY_MIME[normalized];
}
function isGifMedia(opts) {
	if (opts.contentType?.toLowerCase() === "image/gif") return true;
	return getFileExtension(opts.fileName) === ".gif";
}
function imageMimeFromFormat(format) {
	if (!format) return;
	switch (format.toLowerCase()) {
		case "jpg":
		case "jpeg": return "image/jpeg";
		case "heic": return "image/heic";
		case "heif": return "image/heif";
		case "png": return "image/png";
		case "webp": return "image/webp";
		case "gif": return "image/gif";
		default: return;
	}
}
function kindFromMime(mime) {
	return mediaKindFromMime(mime);
}

//#endregion
//#region src/media/image-ops.ts
function isBun() {
	return typeof process.versions.bun === "string";
}
function prefersSips() {
	return process.env.OPENCLAW_IMAGE_BACKEND === "sips" || process.env.OPENCLAW_IMAGE_BACKEND !== "sharp" && isBun() && process.platform === "darwin";
}
async function loadSharp() {
	const mod = await import("sharp");
	const sharp = mod.default ?? mod;
	return (buffer) => sharp(buffer, { failOnError: false });
}
/**
* Reads EXIF orientation from JPEG buffer.
* Returns orientation value 1-8, or null if not found/not JPEG.
*
* EXIF orientation values:
* 1 = Normal, 2 = Flip H, 3 = Rotate 180, 4 = Flip V,
* 5 = Rotate 270 CW + Flip H, 6 = Rotate 90 CW, 7 = Rotate 90 CW + Flip H, 8 = Rotate 270 CW
*/
function readJpegExifOrientation(buffer) {
	if (buffer.length < 2 || buffer[0] !== 255 || buffer[1] !== 216) return null;
	let offset = 2;
	while (offset < buffer.length - 4) {
		if (buffer[offset] !== 255) {
			offset++;
			continue;
		}
		const marker = buffer[offset + 1];
		if (marker === 255) {
			offset++;
			continue;
		}
		if (marker === 225) {
			const exifStart = offset + 4;
			if (buffer.length > exifStart + 6 && buffer.toString("ascii", exifStart, exifStart + 4) === "Exif" && buffer[exifStart + 4] === 0 && buffer[exifStart + 5] === 0) {
				const tiffStart = exifStart + 6;
				if (buffer.length < tiffStart + 8) return null;
				const isLittleEndian = buffer.toString("ascii", tiffStart, tiffStart + 2) === "II";
				const readU16 = (pos) => isLittleEndian ? buffer.readUInt16LE(pos) : buffer.readUInt16BE(pos);
				const readU32 = (pos) => isLittleEndian ? buffer.readUInt32LE(pos) : buffer.readUInt32BE(pos);
				const ifd0Start = tiffStart + readU32(tiffStart + 4);
				if (buffer.length < ifd0Start + 2) return null;
				const numEntries = readU16(ifd0Start);
				for (let i = 0; i < numEntries; i++) {
					const entryOffset = ifd0Start + 2 + i * 12;
					if (buffer.length < entryOffset + 12) break;
					if (readU16(entryOffset) === 274) {
						const value = readU16(entryOffset + 8);
						return value >= 1 && value <= 8 ? value : null;
					}
				}
			}
			return null;
		}
		if (marker >= 224 && marker <= 239) {
			const segmentLength = buffer.readUInt16BE(offset + 2);
			offset += 2 + segmentLength;
			continue;
		}
		if (marker === 192 || marker === 218) break;
		offset++;
	}
	return null;
}
async function withTempDir(fn) {
	const dir = await fs.mkdtemp(path.join(os.tmpdir(), "openclaw-img-"));
	try {
		return await fn(dir);
	} finally {
		await fs.rm(dir, {
			recursive: true,
			force: true
		}).catch(() => {});
	}
}
async function sipsMetadataFromBuffer(buffer) {
	return await withTempDir(async (dir) => {
		const input = path.join(dir, "in.img");
		await fs.writeFile(input, buffer);
		const { stdout } = await runExec("/usr/bin/sips", [
			"-g",
			"pixelWidth",
			"-g",
			"pixelHeight",
			input
		], {
			timeoutMs: 1e4,
			maxBuffer: 512 * 1024
		});
		const w = stdout.match(/pixelWidth:\s*([0-9]+)/);
		const h = stdout.match(/pixelHeight:\s*([0-9]+)/);
		if (!w?.[1] || !h?.[1]) return null;
		const width = Number.parseInt(w[1], 10);
		const height = Number.parseInt(h[1], 10);
		if (!Number.isFinite(width) || !Number.isFinite(height)) return null;
		if (width <= 0 || height <= 0) return null;
		return {
			width,
			height
		};
	});
}
async function sipsResizeToJpeg(params) {
	return await withTempDir(async (dir) => {
		const input = path.join(dir, "in.img");
		const output = path.join(dir, "out.jpg");
		await fs.writeFile(input, params.buffer);
		await runExec("/usr/bin/sips", [
			"-Z",
			String(Math.max(1, Math.round(params.maxSide))),
			"-s",
			"format",
			"jpeg",
			"-s",
			"formatOptions",
			String(Math.max(1, Math.min(100, Math.round(params.quality)))),
			input,
			"--out",
			output
		], {
			timeoutMs: 2e4,
			maxBuffer: 1024 * 1024
		});
		return await fs.readFile(output);
	});
}
async function sipsConvertToJpeg(buffer) {
	return await withTempDir(async (dir) => {
		const input = path.join(dir, "in.heic");
		const output = path.join(dir, "out.jpg");
		await fs.writeFile(input, buffer);
		await runExec("/usr/bin/sips", [
			"-s",
			"format",
			"jpeg",
			input,
			"--out",
			output
		], {
			timeoutMs: 2e4,
			maxBuffer: 1024 * 1024
		});
		return await fs.readFile(output);
	});
}
async function getImageMetadata(buffer) {
	if (prefersSips()) return await sipsMetadataFromBuffer(buffer).catch(() => null);
	try {
		const meta = await (await loadSharp())(buffer).metadata();
		const width = Number(meta.width ?? 0);
		const height = Number(meta.height ?? 0);
		if (!Number.isFinite(width) || !Number.isFinite(height)) return null;
		if (width <= 0 || height <= 0) return null;
		return {
			width,
			height
		};
	} catch {
		return null;
	}
}
/**
* Applies rotation/flip to image buffer using sips based on EXIF orientation.
*/
async function sipsApplyOrientation(buffer, orientation) {
	const ops = [];
	switch (orientation) {
		case 2:
			ops.push("-f", "horizontal");
			break;
		case 3:
			ops.push("-r", "180");
			break;
		case 4:
			ops.push("-f", "vertical");
			break;
		case 5:
			ops.push("-r", "270", "-f", "horizontal");
			break;
		case 6:
			ops.push("-r", "90");
			break;
		case 7:
			ops.push("-r", "90", "-f", "horizontal");
			break;
		case 8:
			ops.push("-r", "270");
			break;
		default: return buffer;
	}
	return await withTempDir(async (dir) => {
		const input = path.join(dir, "in.jpg");
		const output = path.join(dir, "out.jpg");
		await fs.writeFile(input, buffer);
		await runExec("/usr/bin/sips", [
			...ops,
			input,
			"--out",
			output
		], {
			timeoutMs: 2e4,
			maxBuffer: 1024 * 1024
		});
		return await fs.readFile(output);
	});
}
async function resizeToJpeg(params) {
	if (prefersSips()) {
		const normalized = await normalizeExifOrientationSips(params.buffer);
		if (params.withoutEnlargement !== false) {
			const meta = await getImageMetadata(normalized);
			if (meta) {
				const maxDim = Math.max(meta.width, meta.height);
				if (maxDim > 0 && maxDim <= params.maxSide) return await sipsResizeToJpeg({
					buffer: normalized,
					maxSide: maxDim,
					quality: params.quality
				});
			}
		}
		return await sipsResizeToJpeg({
			buffer: normalized,
			maxSide: params.maxSide,
			quality: params.quality
		});
	}
	return await (await loadSharp())(params.buffer).rotate().resize({
		width: params.maxSide,
		height: params.maxSide,
		fit: "inside",
		withoutEnlargement: params.withoutEnlargement !== false
	}).jpeg({
		quality: params.quality,
		mozjpeg: true
	}).toBuffer();
}
async function convertHeicToJpeg(buffer) {
	if (prefersSips()) return await sipsConvertToJpeg(buffer);
	return await (await loadSharp())(buffer).jpeg({
		quality: 90,
		mozjpeg: true
	}).toBuffer();
}
/**
* Checks if an image has an alpha channel (transparency).
* Returns true if the image has alpha, false otherwise.
*/
async function hasAlphaChannel(buffer) {
	try {
		const meta = await (await loadSharp())(buffer).metadata();
		return meta.hasAlpha || meta.channels === 4;
	} catch {
		return false;
	}
}
/**
* Resizes an image to PNG format, preserving alpha channel (transparency).
* Falls back to sharp only (no sips fallback for PNG with alpha).
*/
async function resizeToPng(params) {
	const sharp = await loadSharp();
	const compressionLevel = params.compressionLevel ?? 6;
	return await sharp(params.buffer).rotate().resize({
		width: params.maxSide,
		height: params.maxSide,
		fit: "inside",
		withoutEnlargement: params.withoutEnlargement !== false
	}).png({ compressionLevel }).toBuffer();
}
async function optimizeImageToPng(buffer, maxBytes) {
	const sides = [
		2048,
		1536,
		1280,
		1024,
		800
	];
	const compressionLevels = [
		6,
		7,
		8,
		9
	];
	let smallest = null;
	for (const side of sides) for (const compressionLevel of compressionLevels) try {
		const out = await resizeToPng({
			buffer,
			maxSide: side,
			compressionLevel,
			withoutEnlargement: true
		});
		const size = out.length;
		if (!smallest || size < smallest.size) smallest = {
			buffer: out,
			size,
			resizeSide: side,
			compressionLevel
		};
		if (size <= maxBytes) return {
			buffer: out,
			optimizedSize: size,
			resizeSide: side,
			compressionLevel
		};
	} catch {}
	if (smallest) return {
		buffer: smallest.buffer,
		optimizedSize: smallest.size,
		resizeSide: smallest.resizeSide,
		compressionLevel: smallest.compressionLevel
	};
	throw new Error("Failed to optimize PNG image");
}
/**
* Internal sips-only EXIF normalization (no sharp fallback).
* Used by resizeToJpeg to normalize before sips resize.
*/
async function normalizeExifOrientationSips(buffer) {
	try {
		const orientation = readJpegExifOrientation(buffer);
		if (!orientation || orientation === 1) return buffer;
		return await sipsApplyOrientation(buffer, orientation);
	} catch {
		return buffer;
	}
}

//#endregion
export { mediaKindFromMime as S, isBlockedHostname as _, resizeToJpeg as a, MAX_IMAGE_BYTES as b, getFileExtension as c, isGifMedia as d, kindFromMime as f, createPinnedDispatcher as g, closeDispatcher as h, optimizeImageToPng as i, imageMimeFromFormat as l, SsrFBlockedError as m, getImageMetadata as n, detectMime as o, normalizeMimeType as p, hasAlphaChannel as r, extensionForMime as s, convertHeicToJpeg as t, isAudioFileName as u, isPrivateIpAddress as v, maxBytesForKind as x, resolvePinnedHostnameWithPolicy as y };