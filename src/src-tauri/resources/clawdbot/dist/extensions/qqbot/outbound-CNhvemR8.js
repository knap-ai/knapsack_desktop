import { t as getPlatformAdapter } from "./adapter-DfD2SNGz.js";
import { i as normalizeOptionalString, n as normalizeLowercaseStringOrEmpty, s as sanitizeFileName } from "./string-normalize-C6Z4K8Fh.js";
import { E as debugWarn, O as formatErrorMessage, T as debugLog, _ as sendText$1, h as sendImage, m as sendFileMessage, t as accountToCreds, u as initApiConfig, v as sendVideoMessage, w as debugError, y as sendVoiceMessage } from "./sender-BZ_TJkxQ.js";
import { c as getQQBotDataDir, f as isLocalPath, h as resolveQQBotPayloadLocalFilePath, m as normalizePath, r as parseTarget$1, u as getQQBotMediaDir } from "./target-parser-C00R-uf5.js";
import * as fs$1 from "node:fs";
import crypto from "node:crypto";
import * as path$1 from "node:path";
//#region \0rolldown/runtime.js
var __defProp = Object.defineProperty;
var __exportAll = (all, no_symbols) => {
	let target = {};
	for (var name in all) __defProp(target, name, {
		get: all[name],
		enumerable: true
	});
	if (!no_symbols) __defProp(target, Symbol.toStringTag, { value: "Module" });
	return target;
};
//#endregion
//#region extensions/qqbot/src/engine/utils/file-utils.ts
/** Maximum file size accepted by the QQ Bot API. */
const MAX_UPLOAD_SIZE = 20 * 1024 * 1024;
const QQBOT_MEDIA_SSRF_POLICY = {
	hostnameAllowlist: [
		"*.qpic.cn",
		"*.qq.com",
		"*.weiyun.com",
		"*.qq.com.cn",
		"*.ugcimg.cn",
		"*.myqcloud.com",
		"*.tencentcos.cn",
		"*.tencentcos.com"
	],
	allowRfc2544BenchmarkRange: true
};
/** Validate that a file is within the allowed upload size. */
function checkFileSize(filePath, maxSize = MAX_UPLOAD_SIZE) {
	try {
		const stat = fs$1.statSync(filePath);
		if (stat.size > maxSize) {
			const sizeMB = (stat.size / (1024 * 1024)).toFixed(1);
			const limitMB = (maxSize / (1024 * 1024)).toFixed(0);
			return {
				ok: false,
				size: stat.size,
				error: `File is too large (${sizeMB}MB); QQ Bot API limit is ${limitMB}MB`
			};
		}
		return {
			ok: true,
			size: stat.size
		};
	} catch (err) {
		return {
			ok: false,
			size: 0,
			error: `Failed to read file metadata: ${formatErrorMessage(err)}`
		};
	}
}
/** Read file contents asynchronously. */
async function readFileAsync(filePath) {
	return fs$1.promises.readFile(filePath);
}
/** Check file readability asynchronously. */
async function fileExistsAsync(filePath) {
	try {
		await fs$1.promises.access(filePath, fs$1.constants.R_OK);
		return true;
	} catch {
		return false;
	}
}
/** Format a byte count into a human-readable size string. */
function formatFileSize(bytes) {
	if (bytes < 1024) return `${bytes}B`;
	if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
	return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}
/** Download a remote file into a local directory. */
async function downloadFile(url, destDir, originalFilename) {
	try {
		let parsedUrl;
		try {
			parsedUrl = new URL(url);
		} catch {
			return null;
		}
		if (parsedUrl.protocol !== "https:") return null;
		if (!fs$1.existsSync(destDir)) fs$1.mkdirSync(destDir, { recursive: true });
		const fetched = await getPlatformAdapter().fetchMedia({
			url: parsedUrl.toString(),
			filePathHint: originalFilename,
			ssrfPolicy: QQBOT_MEDIA_SSRF_POLICY
		});
		let filename = normalizeOptionalString(originalFilename) ?? "";
		if (!filename) filename = (normalizeOptionalString(fetched.fileName) ?? path$1.basename(parsedUrl.pathname)) || "download";
		const ts = Date.now();
		const ext = path$1.extname(filename);
		const safeFilename = `${path$1.basename(filename, ext) || "file"}_${ts}_${crypto.randomBytes(3).toString("hex")}${ext}`;
		const destPath = path$1.join(destDir, safeFilename);
		await fs$1.promises.writeFile(destPath, fetched.buffer);
		return destPath;
	} catch (err) {
		console.error(`[qqbot:downloadFile] FAILED url=${url.slice(0, 120)} error=${err instanceof Error ? err.message : String(err)}`);
		if (err instanceof Error && err.stack) console.error(`[qqbot:downloadFile] stack=${err.stack.split("\n").slice(0, 3).join(" | ")}`);
		if (err instanceof Error && err.cause) console.error(`[qqbot:downloadFile] cause=${formatErrorMessage(err.cause)}`);
		return null;
	}
}
//#endregion
//#region extensions/qqbot/src/engine/utils/media-tags.ts
/**
* Media tag normalization for QQ Bot messages.
*
* Normalizes malformed `<qqimg>`, `<qqvoice>`, etc. tags emitted by
* smaller models into canonical wrapped-tag format.
*
* Zero external dependencies.
*/
/** Lowercase and trim a string, returning empty string for falsy input. */
function lc(s) {
	return (s ?? "").toLowerCase().trim();
}
/** Expand `~` prefix to the process home directory. */
function expandTilde(p) {
	if (!p) return p;
	const home = typeof process !== "undefined" ? process.env.HOME ?? process.env.USERPROFILE : void 0;
	if (!home) return p;
	if (p === "~") return home;
	if (p.startsWith("~/") || p.startsWith("~\\")) return `${home}/${p.slice(2)}`;
	return p;
}
const VALID_TAGS = [
	"qqimg",
	"qqvoice",
	"qqvideo",
	"qqfile",
	"qqmedia"
];
const TAG_ALIASES = {
	qq_img: "qqimg",
	qqimage: "qqimg",
	qq_image: "qqimg",
	qqpic: "qqimg",
	qq_pic: "qqimg",
	qqpicture: "qqimg",
	qq_picture: "qqimg",
	qqphoto: "qqimg",
	qq_photo: "qqimg",
	img: "qqimg",
	image: "qqimg",
	pic: "qqimg",
	picture: "qqimg",
	photo: "qqimg",
	qq_voice: "qqvoice",
	qqaudio: "qqvoice",
	qq_audio: "qqvoice",
	voice: "qqvoice",
	audio: "qqvoice",
	qq_video: "qqvideo",
	video: "qqvideo",
	qq_file: "qqfile",
	qqdoc: "qqfile",
	qq_doc: "qqfile",
	file: "qqfile",
	doc: "qqfile",
	document: "qqfile",
	qq_media: "qqmedia",
	media: "qqmedia",
	attachment: "qqmedia",
	attach: "qqmedia",
	qqattachment: "qqmedia",
	qq_attachment: "qqmedia",
	qqsend: "qqmedia",
	qq_send: "qqmedia",
	send: "qqmedia"
};
const ALL_TAG_NAMES = [...VALID_TAGS, ...Object.keys(TAG_ALIASES)];
ALL_TAG_NAMES.sort((a, b) => b.length - a.length);
const TAG_NAME_PATTERN = ALL_TAG_NAMES.join("|");
const LEFT_BRACKET = "(?:[<＜<]|&lt;)";
/** Match self-closing media-tag syntax with file/src/path/url attributes. */
const SELF_CLOSING_TAG_REGEX = new RegExp("`?" + LEFT_BRACKET + "\\s*(" + TAG_NAME_PATTERN + ")(?:\\s+(?!file|src|path|url)[a-z_-]+\\s*=\\s*[\"']?[^\"'\\s＜<>＞>]*?[\"']?)*\\s+(?:file|src|path|url)\\s*=\\s*[\"']?([^\"'\\s>＞]+?)[\"']?(?:\\s+[a-z_-]+\\s*=\\s*[\"']?[^\"'\\s＜<>＞>]*?[\"']?)*\\s*/?\\s*(?:[>＞>]|&gt;)`?", "gi");
/** Match malformed wrapped media tags that should be normalized. */
const FUZZY_MEDIA_TAG_REGEX = new RegExp("`?" + LEFT_BRACKET + "\\s*(" + TAG_NAME_PATTERN + ")\\s*(?:[>＞>]|&gt;)[\"']?\\s*([^<＜<＞>\"'`]+?)\\s*[\"']?(?:[<＜<]|&lt;)\\s*/?\\s*(?:" + TAG_NAME_PATTERN + ")\\s*(?:[>＞>]|&gt;)`?", "gi");
/** Normalize a raw tag name into the canonical tag set. */
function resolveTagName(raw) {
	const lower = lc(raw);
	if (VALID_TAGS.includes(lower)) return lower;
	return TAG_ALIASES[lower] ?? "qqimg";
}
/** Match wrapped tags whose bodies need newline and tab cleanup. */
const MULTILINE_TAG_CLEANUP = new RegExp("(" + LEFT_BRACKET + "\\s*(?:" + TAG_NAME_PATTERN + ")\\s*(?:[>＞>]|&gt;))([\\s\\S]*?)((?:[<＜<]|&lt;)\\s*/?\\s*(?:" + TAG_NAME_PATTERN + ")\\s*(?:[>＞>]|&gt;))", "gi");
/** Normalize malformed media-tag output into canonical wrapped tags. */
function normalizeMediaTags(text) {
	const normalizeWrappedTag = (_match, rawTag, content) => {
		const tag = resolveTagName(rawTag);
		const trimmed = content.trim();
		if (!trimmed) return _match;
		return `<${tag}>${expandTilde(trimmed)}</${tag}>`;
	};
	let cleaned = text.replace(SELF_CLOSING_TAG_REGEX, normalizeWrappedTag);
	cleaned = cleaned.replace(MULTILINE_TAG_CLEANUP, (_m, open, body, close) => {
		return open + body.replace(/[\r\n\t]+/g, " ").replace(/ {2,}/g, " ") + close;
	});
	return cleaned.replace(FUZZY_MEDIA_TAG_REGEX, normalizeWrappedTag);
}
//#endregion
//#region extensions/qqbot/src/engine/utils/payload.ts
const PAYLOAD_PREFIX = "QQBOT_PAYLOAD:";
const CRON_PREFIX = "QQBOT_CRON:";
function formatErr(e) {
	return e instanceof Error ? e.message : String(e);
}
/** Parse model output that may start with the QQ Bot structured payload prefix. */
function parseQQBotPayload(text) {
	const trimmedText = text.trim();
	if (!trimmedText.startsWith(PAYLOAD_PREFIX)) return {
		isPayload: false,
		text
	};
	const jsonContent = trimmedText.slice(14).trim();
	if (!jsonContent) return {
		isPayload: true,
		error: "Payload body is empty"
	};
	try {
		const payload = JSON.parse(jsonContent);
		if (!payload.type) return {
			isPayload: true,
			error: "Payload is missing the type field"
		};
		if (payload.type === "cron_reminder") {
			if (!payload.content || !payload.targetType || !payload.targetAddress) return {
				isPayload: true,
				error: "cron_reminder payload is missing required fields (content, targetType, targetAddress)"
			};
		} else if (payload.type === "media") {
			if (!payload.mediaType || !payload.source || !payload.path) return {
				isPayload: true,
				error: "media payload is missing required fields (mediaType, source, path)"
			};
		}
		return {
			isPayload: true,
			payload
		};
	} catch (e) {
		return {
			isPayload: true,
			error: `Failed to parse JSON: ${formatErr(e)}`
		};
	}
}
/** Encode a cron reminder payload into the stored cron-message format. */
function encodePayloadForCron(payload) {
	const jsonString = JSON.stringify(payload);
	return `${CRON_PREFIX}${Buffer.from(jsonString, "utf-8").toString("base64")}`;
}
/** Decode a stored cron payload. */
function decodeCronPayload(message) {
	const trimmedMessage = message.trim();
	if (!trimmedMessage.startsWith(CRON_PREFIX)) return { isCronPayload: false };
	const base64Content = trimmedMessage.slice(11);
	if (!base64Content) return {
		isCronPayload: true,
		error: "Cron payload body is empty"
	};
	try {
		const jsonString = Buffer.from(base64Content, "base64").toString("utf-8");
		const payload = JSON.parse(jsonString);
		if (payload.type !== "cron_reminder") return {
			isCronPayload: true,
			error: `Expected type cron_reminder but got ${String(payload.type)}`
		};
		if (!payload.content || !payload.targetType || !payload.targetAddress) return {
			isCronPayload: true,
			error: "Cron payload is missing required fields"
		};
		return {
			isCronPayload: true,
			payload
		};
	} catch (e) {
		return {
			isCronPayload: true,
			error: `Failed to decode cron payload: ${formatErr(e)}`
		};
	}
}
/** Type guard for cron reminder payloads. */
function isCronReminderPayload(payload) {
	return payload.type === "cron_reminder";
}
/** Type guard for media payloads. */
function isMediaPayload(payload) {
	return payload.type === "media";
}
//#endregion
//#region extensions/qqbot/src/engine/messaging/media-type-detect.ts
const IMAGE_EXTENSIONS = new Set([
	".jpg",
	".jpeg",
	".png",
	".gif",
	".webp",
	".bmp"
]);
const VIDEO_EXTENSIONS = new Set([
	".mp4",
	".mov",
	".avi",
	".mkv",
	".webm",
	".flv",
	".wmv"
]);
/**
* Extract a lowercase file extension from a path or URL, ignoring query and hash.
*/
function getCleanExtension(filePath) {
	const cleanPath = filePath.split("?")[0].split("#")[0];
	const lastDot = cleanPath.lastIndexOf(".");
	if (lastDot < 0) return "";
	return cleanPath.slice(lastDot).toLowerCase();
}
/** Check whether a file is an image using MIME first and extension as fallback. */
function isImageFile$1(filePath, mimeType) {
	if (mimeType?.startsWith("image/")) return true;
	return IMAGE_EXTENSIONS.has(getCleanExtension(filePath));
}
/** Check whether a file is a video using MIME first and extension as fallback. */
function isVideoFile$1(filePath, mimeType) {
	if (mimeType?.startsWith("video/")) return true;
	return VIDEO_EXTENSIONS.has(getCleanExtension(filePath));
}
//#endregion
//#region extensions/qqbot/src/engine/messaging/reply-limiter.ts
const DEFAULT_LIMIT = 4;
const DEFAULT_TTL_MS = 3600 * 1e3;
const DEFAULT_MAX_TRACKED = 1e4;
/**
* Per-account reply limiter with automatic eviction.
*
* Usage:
* ```ts
* const limiter = new ReplyLimiter({ limit: 4, ttlMs: 3600000 });
* const check = limiter.checkLimit(messageId);
* if (check.allowed) {
*   await sendPassiveReply(...);
*   limiter.record(messageId);
* } else if (check.shouldFallbackToProactive) {
*   await sendProactiveMessage(...);
* }
* ```
*/
var ReplyLimiter = class {
	constructor(config) {
		this.tracker = /* @__PURE__ */ new Map();
		this.limit = config?.limit ?? DEFAULT_LIMIT;
		this.ttlMs = config?.ttlMs ?? DEFAULT_TTL_MS;
		this.maxTracked = config?.maxTrackedMessages ?? DEFAULT_MAX_TRACKED;
	}
	/** Check whether a passive reply is allowed for the given message. */
	checkLimit(messageId) {
		const now = Date.now();
		this.evictIfNeeded(now);
		const record = this.tracker.get(messageId);
		if (!record) return {
			allowed: true,
			remaining: this.limit,
			shouldFallbackToProactive: false
		};
		if (now - record.firstReplyAt > this.ttlMs) return {
			allowed: false,
			remaining: 0,
			shouldFallbackToProactive: true,
			fallbackReason: "expired",
			message: `Message is older than ${this.ttlMs / (3600 * 1e3)}h; sending as a proactive message instead`
		};
		const remaining = this.limit - record.count;
		if (remaining <= 0) return {
			allowed: false,
			remaining: 0,
			shouldFallbackToProactive: true,
			fallbackReason: "limit_exceeded",
			message: `Passive reply limit reached (${this.limit} per hour); sending proactively instead`
		};
		return {
			allowed: true,
			remaining,
			shouldFallbackToProactive: false
		};
	}
	/** Record one passive reply against a message. */
	record(messageId) {
		const now = Date.now();
		const existing = this.tracker.get(messageId);
		if (!existing) this.tracker.set(messageId, {
			count: 1,
			firstReplyAt: now
		});
		else if (now - existing.firstReplyAt > this.ttlMs) this.tracker.set(messageId, {
			count: 1,
			firstReplyAt: now
		});
		else existing.count++;
	}
	/** Return diagnostic stats. */
	getStats() {
		let totalReplies = 0;
		for (const record of this.tracker.values()) totalReplies += record.count;
		return {
			trackedMessages: this.tracker.size,
			totalReplies
		};
	}
	/** Return limiter configuration. */
	getConfig() {
		return {
			limit: this.limit,
			ttlMs: this.ttlMs,
			ttlHours: this.ttlMs / (3600 * 1e3)
		};
	}
	/** Clear all tracked records. */
	clear() {
		this.tracker.clear();
	}
	/** Opportunistically evict expired records to keep the tracker bounded. */
	evictIfNeeded(now) {
		if (this.tracker.size <= this.maxTracked) return;
		for (const [id, rec] of this.tracker) if (now - rec.firstReplyAt > this.ttlMs) this.tracker.delete(id);
	}
};
//#endregion
//#region extensions/qqbot/src/engine/messaging/outbound.ts
var outbound_exports = /* @__PURE__ */ __exportAll({
	checkMessageReplyLimit: () => checkMessageReplyLimit,
	getMessageReplyConfig: () => getMessageReplyConfig,
	getMessageReplyStats: () => getMessageReplyStats,
	recordMessageReply: () => recordMessageReply,
	registerOutboundAudioAdapter: () => registerOutboundAudioAdapter,
	registerOutboundAudioAdapterFactory: () => registerOutboundAudioAdapterFactory,
	sendCronMessage: () => sendCronMessage,
	sendDocument: () => sendDocument,
	sendMedia: () => sendMedia,
	sendPhoto: () => sendPhoto,
	sendProactiveMessage: () => sendProactiveMessage,
	sendText: () => sendText,
	sendVideoMsg: () => sendVideoMsg,
	sendVoice: () => sendVoice
});
let _audioAdapter = null;
let _audioAdapterFactory = null;
/** Register the audio conversion adapter — called by gateway startup. */
function registerOutboundAudioAdapter(adapter) {
	_audioAdapter = adapter;
}
/** Register a factory that creates the adapter on first access (lazy init). */
function registerOutboundAudioAdapterFactory(factory) {
	_audioAdapterFactory = factory;
}
function getAudio() {
	if (!_audioAdapter && _audioAdapterFactory) _audioAdapter = _audioAdapterFactory();
	if (!_audioAdapter) throw new Error("OutboundAudioAdapter not registered");
	return _audioAdapter;
}
function audioFileToSilkBase64(p, f) {
	return getAudio().audioFileToSilkBase64(p, f);
}
function isAudioFile(p, m) {
	try {
		return getAudio().isAudioFile(p, m);
	} catch {
		return false;
	}
}
function shouldTranscodeVoice(p) {
	return getAudio().shouldTranscodeVoice(p);
}
function waitForFile(p, ms) {
	return getAudio().waitForFile(p, ms);
}
const replyLimiter = new ReplyLimiter();
const MESSAGE_REPLY_LIMIT = 4;
/** Check whether a message can still receive a passive reply. */
function checkMessageReplyLimit(messageId) {
	return replyLimiter.checkLimit(messageId);
}
/** Record one passive reply against a message. */
function recordMessageReply(messageId) {
	replyLimiter.record(messageId);
	debugLog(`[qqbot] recordMessageReply: ${messageId}, count=${replyLimiter.getStats().totalReplies}`);
}
/** Return reply-tracker stats for diagnostics. */
function getMessageReplyStats() {
	return replyLimiter.getStats();
}
/** Return the passive-reply configuration. */
function getMessageReplyConfig() {
	return replyLimiter.getConfig();
}
/** Parse a qqbot target into a structured delivery target. */
function parseTarget(to) {
	const timestamp = (/* @__PURE__ */ new Date()).toISOString();
	debugLog(`[${timestamp}] [qqbot] parseTarget: input=${to}`);
	const parsed = parseTarget$1(to);
	debugLog(`[${timestamp}] [qqbot] parseTarget: ${parsed.type} target, ID=${parsed.id}`);
	return parsed;
}
/** Build a media target from a normal outbound context. */
function buildMediaTarget(ctx) {
	const target = parseTarget(ctx.to);
	return {
		targetType: target.type,
		targetId: target.id,
		account: ctx.account,
		replyToId: ctx.replyToId ?? void 0
	};
}
/** Return true when public URLs should be passed through directly. */
function shouldDirectUploadUrl(account) {
	return account.config?.urlDirectUpload !== false;
}
const qqBotMediaKindLabel = {
	image: "Image",
	voice: "Voice",
	video: "Video",
	file: "File",
	media: "Media"
};
function isHttpOrDataSource(pathValue) {
	return pathValue.startsWith("http://") || pathValue.startsWith("https://") || pathValue.startsWith("data:");
}
function isPathWithinRoot(candidate, root) {
	const relative = path$1.relative(root, candidate);
	return relative === "" || !relative.startsWith("..") && !path$1.isAbsolute(relative);
}
function resolveMissingPathWithinMediaRoot(normalizedPath) {
	const resolvedCandidate = path$1.resolve(normalizedPath);
	if (fs$1.existsSync(resolvedCandidate)) return null;
	const allowedRoot = path$1.resolve(getQQBotMediaDir());
	let canonicalAllowedRoot;
	try {
		canonicalAllowedRoot = fs$1.realpathSync(allowedRoot);
	} catch {
		return null;
	}
	const missingSegments = [];
	let cursor = resolvedCandidate;
	while (!fs$1.existsSync(cursor)) {
		const parent = path$1.dirname(cursor);
		if (parent === cursor) break;
		missingSegments.unshift(path$1.basename(cursor));
		cursor = parent;
	}
	if (!fs$1.existsSync(cursor)) return null;
	let canonicalCursor;
	try {
		canonicalCursor = fs$1.realpathSync(cursor);
	} catch {
		return null;
	}
	const canonicalCandidate = missingSegments.length > 0 ? path$1.join(canonicalCursor, ...missingSegments) : canonicalCursor;
	return isPathWithinRoot(canonicalCandidate, canonicalAllowedRoot) ? canonicalCandidate : null;
}
function resolveExistingPathWithinRoots(normalizedPath, allowedRoots) {
	const resolvedCandidate = path$1.resolve(normalizedPath);
	if (!fs$1.existsSync(resolvedCandidate)) return null;
	let canonicalCandidate;
	try {
		canonicalCandidate = fs$1.realpathSync(resolvedCandidate);
	} catch {
		return null;
	}
	for (const root of allowedRoots) {
		const resolvedRoot = path$1.resolve(root);
		const canonicalRoot = fs$1.existsSync(resolvedRoot) ? fs$1.realpathSync(resolvedRoot) : resolvedRoot;
		if (isPathWithinRoot(canonicalCandidate, canonicalRoot)) return canonicalCandidate;
	}
	return null;
}
function resolveOutboundMediaPath(rawPath, mediaKind, options = {}) {
	const normalizedPath = normalizePath(rawPath);
	if (isHttpOrDataSource(normalizedPath)) return {
		ok: true,
		mediaPath: normalizedPath
	};
	const allowedPath = resolveQQBotPayloadLocalFilePath(normalizedPath);
	if (allowedPath) return {
		ok: true,
		mediaPath: allowedPath
	};
	if (options.extraLocalRoots && options.extraLocalRoots.length > 0) {
		const extraAllowedPath = resolveExistingPathWithinRoots(normalizedPath, options.extraLocalRoots);
		if (extraAllowedPath) return {
			ok: true,
			mediaPath: extraAllowedPath
		};
	}
	if (options.allowMissingLocalPath) {
		const allowedMissingPath = resolveMissingPathWithinMediaRoot(normalizedPath);
		if (allowedMissingPath) return {
			ok: true,
			mediaPath: allowedMissingPath
		};
	}
	debugWarn(`blocked local ${mediaKind} path outside QQ Bot media storage`);
	return {
		ok: false,
		error: `${qqBotMediaKindLabel[mediaKind]} path must be inside QQ Bot media storage`
	};
}
/**
* Send a photo from a local file, public URL, or Base64 data URL.
*/
async function sendPhoto(ctx, imagePath) {
	const resolvedMediaPath = resolveOutboundMediaPath(imagePath, "image");
	if (!resolvedMediaPath.ok) return {
		channel: "qqbot",
		error: resolvedMediaPath.error
	};
	const mediaPath = resolvedMediaPath.mediaPath;
	const isLocal = isLocalPath(mediaPath);
	const isHttp = mediaPath.startsWith("http://") || mediaPath.startsWith("https://");
	const isData = mediaPath.startsWith("data:");
	if (isHttp && !shouldDirectUploadUrl(ctx.account)) {
		debugLog(`sendPhoto: urlDirectUpload=false, downloading URL first...`);
		const localFile = await downloadToFallbackDir(mediaPath, "sendPhoto");
		if (localFile) return await sendPhoto(ctx, localFile);
		return {
			channel: "qqbot",
			error: `Failed to download image: ${mediaPath.slice(0, 80)}`
		};
	}
	let imageUrl = mediaPath;
	if (isLocal) {
		if (!await fileExistsAsync(mediaPath)) return {
			channel: "qqbot",
			error: "Image not found"
		};
		const sizeCheck = checkFileSize(mediaPath);
		if (!sizeCheck.ok) return {
			channel: "qqbot",
			error: sizeCheck.error
		};
		const fileBuffer = await readFileAsync(mediaPath);
		const ext = normalizeLowercaseStringOrEmpty(path$1.extname(mediaPath));
		const mimeType = {
			".jpg": "image/jpeg",
			".jpeg": "image/jpeg",
			".png": "image/png",
			".gif": "image/gif",
			".webp": "image/webp",
			".bmp": "image/bmp"
		}[ext];
		if (!mimeType) return {
			channel: "qqbot",
			error: `Unsupported image format: ${ext}`
		};
		imageUrl = `data:${mimeType};base64,${fileBuffer.toString("base64")}`;
		debugLog(`sendPhoto: local → Base64 (${formatFileSize(fileBuffer.length)})`);
	} else if (!isHttp && !isData) return {
		channel: "qqbot",
		error: `Unsupported image source: ${mediaPath.slice(0, 50)}`
	};
	try {
		const localPath = isLocal ? mediaPath : void 0;
		const creds = accountToCreds(ctx.account);
		const target = {
			type: ctx.targetType,
			id: ctx.targetId
		};
		if (target.type === "c2c" || target.type === "group") {
			const r = await sendImage(target, imageUrl, creds, {
				msgId: ctx.replyToId,
				content: void 0,
				localPath
			});
			return {
				channel: "qqbot",
				messageId: r.id,
				timestamp: r.timestamp
			};
		}
		if (isHttp) {
			const r = await sendText$1(target, `![](${mediaPath})`, creds, { msgId: ctx.replyToId });
			return {
				channel: "qqbot",
				messageId: r.id,
				timestamp: r.timestamp
			};
		}
		debugLog(`sendPhoto: channel does not support local/Base64 images`);
		return {
			channel: "qqbot",
			error: "Channel does not support local/Base64 images"
		};
	} catch (err) {
		const msg = formatErrorMessage(err);
		if (isHttp && !isData) {
			debugWarn(`sendPhoto: URL direct upload failed (${msg}), downloading locally and retrying as Base64...`);
			const retryResult = await downloadAndRetrySendPhoto(ctx, mediaPath);
			if (retryResult) return retryResult;
		}
		debugError(`sendPhoto failed: ${msg}`);
		return {
			channel: "qqbot",
			error: msg
		};
	}
}
/** Download a remote image locally and retry `sendPhoto` through the local-file path. */
async function downloadAndRetrySendPhoto(ctx, httpUrl) {
	try {
		const localFile = await downloadFile(httpUrl, getQQBotMediaDir("downloads", "url-fallback"));
		if (!localFile) {
			debugError(`sendPhoto fallback: download also failed for ${httpUrl.slice(0, 80)}`);
			return null;
		}
		debugLog(`sendPhoto fallback: downloaded → ${localFile}, retrying as Base64`);
		return await sendPhoto(ctx, localFile);
	} catch (err) {
		debugError(`sendPhoto fallback error:`, err);
		return null;
	}
}
/**
* Send voice from either a local file or a public URL.
*
* URL handling respects `urlDirectUpload`, and local files are transcoded when needed.
*/
async function sendVoice(ctx, voicePath, directUploadFormats, transcodeEnabled = true) {
	const resolvedMediaPath = resolveOutboundMediaPath(voicePath, "voice", { allowMissingLocalPath: true });
	if (!resolvedMediaPath.ok) return {
		channel: "qqbot",
		error: resolvedMediaPath.error
	};
	const mediaPath = resolvedMediaPath.mediaPath;
	if (mediaPath.startsWith("http://") || mediaPath.startsWith("https://")) {
		if (shouldDirectUploadUrl(ctx.account)) try {
			const creds = accountToCreds(ctx.account);
			const target = {
				type: ctx.targetType,
				id: ctx.targetId
			};
			if (target.type === "c2c" || target.type === "group") {
				const r = await sendVoiceMessage(target, creds, {
					voiceUrl: mediaPath,
					msgId: ctx.replyToId
				});
				return {
					channel: "qqbot",
					messageId: r.id,
					timestamp: r.timestamp
				};
			}
			debugLog(`sendVoice: voice not supported in channel`);
			return {
				channel: "qqbot",
				error: "Voice not supported in channel"
			};
		} catch (err) {
			debugWarn(`sendVoice: URL direct upload failed (${formatErrorMessage(err)}), downloading locally and retrying...`);
		}
		else debugLog(`sendVoice: urlDirectUpload=false, downloading URL first...`);
		const localFile = await downloadToFallbackDir(mediaPath, "sendVoice");
		if (localFile) return await sendVoiceFromLocal(ctx, localFile, directUploadFormats, transcodeEnabled);
		return {
			channel: "qqbot",
			error: `Failed to download audio: ${mediaPath.slice(0, 80)}`
		};
	}
	return await sendVoiceFromLocal(ctx, mediaPath, directUploadFormats, transcodeEnabled);
}
/** Send voice from a local file. */
async function sendVoiceFromLocal(ctx, mediaPath, directUploadFormats, transcodeEnabled) {
	const fileSize = await waitForFile(mediaPath);
	if (fileSize === 0) return {
		channel: "qqbot",
		error: "Voice generate failed"
	};
	const safeMediaPath = resolveQQBotPayloadLocalFilePath(mediaPath);
	if (!safeMediaPath) {
		debugWarn(`sendVoice: blocked local voice path outside QQ Bot media storage`);
		return {
			channel: "qqbot",
			error: "Voice path must be inside QQ Bot media storage"
		};
	}
	if (shouldTranscodeVoice(safeMediaPath) && !transcodeEnabled) {
		const ext = normalizeLowercaseStringOrEmpty(path$1.extname(safeMediaPath));
		debugLog(`sendVoice: transcode disabled, format ${ext} needs transcode, returning error for fallback`);
		return {
			channel: "qqbot",
			error: `Voice transcoding is disabled and format ${ext} cannot be uploaded directly`
		};
	}
	try {
		let uploadBase64 = await audioFileToSilkBase64(safeMediaPath, directUploadFormats);
		if (!uploadBase64) {
			const buf = await readFileAsync(safeMediaPath);
			uploadBase64 = buf.toString("base64");
			debugLog(`sendVoice: SILK conversion failed, uploading raw (${formatFileSize(buf.length)})`);
		} else debugLog(`sendVoice: SILK ready (${fileSize} bytes)`);
		const creds = accountToCreds(ctx.account);
		const target = {
			type: ctx.targetType,
			id: ctx.targetId
		};
		if (target.type === "c2c" || target.type === "group") {
			const r = await sendVoiceMessage(target, creds, {
				voiceBase64: uploadBase64,
				msgId: ctx.replyToId,
				filePath: safeMediaPath
			});
			return {
				channel: "qqbot",
				messageId: r.id,
				timestamp: r.timestamp
			};
		}
		debugLog(`sendVoice: voice not supported in channel`);
		return {
			channel: "qqbot",
			error: "Voice not supported in channel"
		};
	} catch (err) {
		const msg = formatErrorMessage(err);
		debugError(`sendVoice (local) failed: ${msg}`);
		return {
			channel: "qqbot",
			error: msg
		};
	}
}
/** Send video from either a public URL or a local file. */
async function sendVideoMsg(ctx, videoPath) {
	const resolvedMediaPath = resolveOutboundMediaPath(videoPath, "video");
	if (!resolvedMediaPath.ok) return {
		channel: "qqbot",
		error: resolvedMediaPath.error
	};
	const mediaPath = resolvedMediaPath.mediaPath;
	const isHttp = mediaPath.startsWith("http://") || mediaPath.startsWith("https://");
	if (isHttp && !shouldDirectUploadUrl(ctx.account)) {
		debugLog(`sendVideoMsg: urlDirectUpload=false, downloading URL first...`);
		const localFile = await downloadToFallbackDir(mediaPath, "sendVideoMsg");
		if (localFile) return await sendVideoFromLocal(ctx, localFile);
		return {
			channel: "qqbot",
			error: `Failed to download video: ${mediaPath.slice(0, 80)}`
		};
	}
	try {
		if (isHttp) {
			const creds = accountToCreds(ctx.account);
			const target = {
				type: ctx.targetType,
				id: ctx.targetId
			};
			if (target.type === "c2c" || target.type === "group") {
				const r = await sendVideoMessage(target, creds, {
					videoUrl: mediaPath,
					msgId: ctx.replyToId
				});
				return {
					channel: "qqbot",
					messageId: r.id,
					timestamp: r.timestamp
				};
			}
			debugLog(`sendVideoMsg: video not supported in channel`);
			return {
				channel: "qqbot",
				error: "Video not supported in channel"
			};
		}
		return await sendVideoFromLocal(ctx, mediaPath);
	} catch (err) {
		const msg = formatErrorMessage(err);
		if (isHttp) {
			debugWarn(`sendVideoMsg: URL direct upload failed (${msg}), downloading locally and retrying as Base64...`);
			const localFile = await downloadToFallbackDir(mediaPath, "sendVideoMsg");
			if (localFile) return await sendVideoFromLocal(ctx, localFile);
		}
		debugError(`sendVideoMsg failed: ${msg}`);
		return {
			channel: "qqbot",
			error: msg
		};
	}
}
/** Send video from a local file. */
async function sendVideoFromLocal(ctx, mediaPath) {
	if (!await fileExistsAsync(mediaPath)) return {
		channel: "qqbot",
		error: "Video not found"
	};
	const sizeCheck = checkFileSize(mediaPath);
	if (!sizeCheck.ok) return {
		channel: "qqbot",
		error: sizeCheck.error
	};
	const fileBuffer = await readFileAsync(mediaPath);
	const videoBase64 = fileBuffer.toString("base64");
	debugLog(`sendVideoMsg: local video (${formatFileSize(fileBuffer.length)})`);
	try {
		const creds = accountToCreds(ctx.account);
		const target = {
			type: ctx.targetType,
			id: ctx.targetId
		};
		if (target.type === "c2c" || target.type === "group") {
			const r = await sendVideoMessage(target, creds, {
				videoBase64,
				msgId: ctx.replyToId,
				localPath: mediaPath
			});
			return {
				channel: "qqbot",
				messageId: r.id,
				timestamp: r.timestamp
			};
		}
		debugLog(`sendVideoMsg: video not supported in channel`);
		return {
			channel: "qqbot",
			error: "Video not supported in channel"
		};
	} catch (err) {
		const msg = formatErrorMessage(err);
		debugError(`sendVideoMsg (local) failed: ${msg}`);
		return {
			channel: "qqbot",
			error: msg
		};
	}
}
/** Send a file from a local path or public URL. */
async function sendDocument(ctx, filePath, options = {}) {
	const resolvedMediaPath = resolveOutboundMediaPath(filePath, "file", { extraLocalRoots: options.allowQQBotDataDownloads ? [getQQBotDataDir("downloads")] : void 0 });
	if (!resolvedMediaPath.ok) return {
		channel: "qqbot",
		error: resolvedMediaPath.error
	};
	const mediaPath = resolvedMediaPath.mediaPath;
	const isHttp = mediaPath.startsWith("http://") || mediaPath.startsWith("https://");
	const fileName = sanitizeFileName(path$1.basename(mediaPath));
	if (isHttp && !shouldDirectUploadUrl(ctx.account)) {
		debugLog(`sendDocument: urlDirectUpload=false, downloading URL first...`);
		const localFile = await downloadToFallbackDir(mediaPath, "sendDocument");
		if (localFile) return await sendDocumentFromLocal(ctx, localFile);
		return {
			channel: "qqbot",
			error: `Failed to download file: ${mediaPath.slice(0, 80)}`
		};
	}
	try {
		if (isHttp) {
			const creds = accountToCreds(ctx.account);
			const target = {
				type: ctx.targetType,
				id: ctx.targetId
			};
			if (target.type === "c2c" || target.type === "group") {
				const r = await sendFileMessage(target, creds, {
					fileUrl: mediaPath,
					msgId: ctx.replyToId,
					fileName
				});
				return {
					channel: "qqbot",
					messageId: r.id,
					timestamp: r.timestamp
				};
			}
			debugLog(`sendDocument: file not supported in channel`);
			return {
				channel: "qqbot",
				error: "File not supported in channel"
			};
		}
		return await sendDocumentFromLocal(ctx, mediaPath);
	} catch (err) {
		const msg = formatErrorMessage(err);
		if (isHttp) {
			debugWarn(`sendDocument: URL direct upload failed (${msg}), downloading locally and retrying as Base64...`);
			const localFile = await downloadToFallbackDir(mediaPath, "sendDocument");
			if (localFile) return await sendDocumentFromLocal(ctx, localFile);
		}
		debugError(`sendDocument failed: ${msg}`);
		return {
			channel: "qqbot",
			error: msg
		};
	}
}
/** Send a file from local storage. */
async function sendDocumentFromLocal(ctx, mediaPath) {
	const fileName = sanitizeFileName(path$1.basename(mediaPath));
	if (!await fileExistsAsync(mediaPath)) return {
		channel: "qqbot",
		error: "File not found"
	};
	const sizeCheck = checkFileSize(mediaPath);
	if (!sizeCheck.ok) return {
		channel: "qqbot",
		error: sizeCheck.error
	};
	const fileBuffer = await readFileAsync(mediaPath);
	if (fileBuffer.length === 0) return {
		channel: "qqbot",
		error: `File is empty: ${mediaPath}`
	};
	const fileBase64 = fileBuffer.toString("base64");
	debugLog(`sendDocument: local file (${formatFileSize(fileBuffer.length)})`);
	try {
		const creds = accountToCreds(ctx.account);
		const target = {
			type: ctx.targetType,
			id: ctx.targetId
		};
		if (target.type === "c2c" || target.type === "group") {
			const r = await sendFileMessage(target, creds, {
				fileBase64,
				msgId: ctx.replyToId,
				fileName,
				localFilePath: mediaPath
			});
			return {
				channel: "qqbot",
				messageId: r.id,
				timestamp: r.timestamp
			};
		}
		debugLog(`sendDocument: file not supported in channel`);
		return {
			channel: "qqbot",
			error: "File not supported in channel"
		};
	} catch (err) {
		const msg = formatErrorMessage(err);
		debugError(`sendDocument (local) failed: ${msg}`);
		return {
			channel: "qqbot",
			error: msg
		};
	}
}
/** Download a remote file into the fallback media directory. */
async function downloadToFallbackDir(httpUrl, caller) {
	try {
		const localFile = await downloadFile(httpUrl, getQQBotMediaDir("downloads", "url-fallback"));
		if (!localFile) {
			debugError(`${caller} fallback: download also failed for ${httpUrl.slice(0, 80)}`);
			return null;
		}
		debugLog(`${caller} fallback: downloaded → ${localFile}`);
		return localFile;
	} catch (err) {
		debugError(`${caller} fallback download error:`, err);
		return null;
	}
}
/**
* Send text, optionally falling back from passive reply mode to proactive mode.
*
* Also supports inline media tags such as `<qqimg>...</qqimg>`.
*/
async function sendText(ctx) {
	const { to, account } = ctx;
	let { text, replyToId } = ctx;
	let fallbackToProactive = false;
	initApiConfig(account.appId, { markdownSupport: account.markdownSupport });
	debugLog("[qqbot] sendText ctx:", JSON.stringify({
		to,
		text: text?.slice(0, 50),
		replyToId,
		accountId: account.accountId
	}, null, 2));
	if (replyToId) {
		const limitCheck = checkMessageReplyLimit(replyToId);
		if (!limitCheck.allowed) if (limitCheck.shouldFallbackToProactive) {
			debugWarn(`[qqbot] sendText: passive reply unavailable, falling back to proactive send - ${limitCheck.message}`);
			fallbackToProactive = true;
			replyToId = null;
		} else {
			debugError(`[qqbot] sendText: passive reply was blocked without a fallback path - ${limitCheck.message}`);
			return {
				channel: "qqbot",
				error: limitCheck.message
			};
		}
		else debugLog(`[qqbot] sendText: remaining passive replies for ${replyToId}: ${limitCheck.remaining}/${MESSAGE_REPLY_LIMIT}`);
	}
	text = normalizeMediaTags(text);
	const mediaTagMatches = text.match(/<(qqimg|qqvoice|qqvideo|qqfile|qqmedia)>([^<>]+)<\/(?:qqimg|qqvoice|qqvideo|qqfile|qqmedia|img)>/gi);
	if (mediaTagMatches && mediaTagMatches.length > 0) {
		debugLog(`[qqbot] sendText: Detected ${mediaTagMatches.length} media tag(s), processing...`);
		const sendQueue = [];
		let lastIndex = 0;
		const mediaTagRegexWithIndex = /<(qqimg|qqvoice|qqvideo|qqfile|qqmedia)>([^<>]+)<\/(?:qqimg|qqvoice|qqvideo|qqfile|qqmedia|img)>/gi;
		let match;
		while ((match = mediaTagRegexWithIndex.exec(text)) !== null) {
			const textBefore = text.slice(lastIndex, match.index).replace(/\n{3,}/g, "\n\n").trim();
			if (textBefore) sendQueue.push({
				type: "text",
				content: textBefore
			});
			const tagName = normalizeLowercaseStringOrEmpty(match[1]);
			let mediaPath = normalizeOptionalString(match[2]) ?? "";
			if (mediaPath.startsWith("MEDIA:")) mediaPath = mediaPath.slice(6);
			mediaPath = normalizePath(mediaPath);
			mediaPath = mediaPath.replace(/\\\\/g, "\\");
			const isWinLocal = /^[a-zA-Z]:[\\/]/.test(mediaPath) || mediaPath.startsWith("\\\\");
			try {
				const hasOctal = /\\[0-7]{1,3}/.test(mediaPath);
				const hasNonASCII = /[\u0080-\u00FF]/.test(mediaPath);
				if (!isWinLocal && (hasOctal || hasNonASCII)) {
					debugLog(`[qqbot] sendText: Decoding path with mixed encoding: ${mediaPath}`);
					let decoded = mediaPath.replace(/\\([0-7]{1,3})/g, (_, octal) => {
						return String.fromCharCode(Number.parseInt(octal, 8));
					});
					const bytes = [];
					for (let i = 0; i < decoded.length; i++) {
						const code = decoded.charCodeAt(i);
						if (code <= 255) bytes.push(code);
						else {
							const charBytes = Buffer.from(decoded[i], "utf8");
							bytes.push(...charBytes);
						}
					}
					const utf8Decoded = Buffer.from(bytes).toString("utf8");
					if (!utf8Decoded.includes("�") || utf8Decoded.length < decoded.length) {
						mediaPath = utf8Decoded;
						debugLog(`[qqbot] sendText: Successfully decoded path: ${mediaPath}`);
					}
				}
			} catch (decodeErr) {
				debugError(`[qqbot] sendText: Path decode error: ${decodeErr instanceof Error ? decodeErr.message : JSON.stringify(decodeErr)}`);
			}
			if (mediaPath) if (tagName === "qqmedia") {
				sendQueue.push({
					type: "media",
					content: mediaPath
				});
				debugLog(`[qqbot] sendText: Found auto-detect media in <qqmedia>: ${mediaPath}`);
			} else if (tagName === "qqvoice") {
				sendQueue.push({
					type: "voice",
					content: mediaPath
				});
				debugLog(`[qqbot] sendText: Found voice path in <qqvoice>: ${mediaPath}`);
			} else if (tagName === "qqvideo") {
				sendQueue.push({
					type: "video",
					content: mediaPath
				});
				debugLog(`[qqbot] sendText: Found video URL in <qqvideo>: ${mediaPath}`);
			} else if (tagName === "qqfile") {
				sendQueue.push({
					type: "file",
					content: mediaPath
				});
				debugLog(`[qqbot] sendText: Found file path in <qqfile>: ${mediaPath}`);
			} else {
				sendQueue.push({
					type: "image",
					content: mediaPath
				});
				debugLog(`[qqbot] sendText: Found image path in <qqimg>: ${mediaPath}`);
			}
			lastIndex = match.index + match[0].length;
		}
		const textAfter = text.slice(lastIndex).replace(/\n{3,}/g, "\n\n").trim();
		if (textAfter) sendQueue.push({
			type: "text",
			content: textAfter
		});
		debugLog(`[qqbot] sendText: Send queue: ${sendQueue.map((item) => item.type).join(" -> ")}`);
		const mediaTarget = buildMediaTarget({
			to,
			account,
			replyToId
		});
		let lastResult = { channel: "qqbot" };
		for (const item of sendQueue) try {
			if (item.type === "text") {
				const target = parseTarget(to);
				const creds = accountToCreds(account);
				const result = await sendText$1({
					type: target.type === "channel" ? "channel" : target.type,
					id: target.id
				}, item.content, creds, { msgId: replyToId ?? void 0 });
				if (replyToId) recordMessageReply(replyToId);
				lastResult = {
					channel: "qqbot",
					messageId: result.id,
					timestamp: result.timestamp,
					refIdx: result.ext_info?.ref_idx
				};
				debugLog(`[qqbot] sendText: Sent text part: ${item.content.slice(0, 30)}...`);
			} else if (item.type === "image") lastResult = await sendPhoto(mediaTarget, item.content);
			else if (item.type === "voice") lastResult = await sendVoice(mediaTarget, item.content, void 0, account.config?.audioFormatPolicy?.transcodeEnabled !== false);
			else if (item.type === "video") lastResult = await sendVideoMsg(mediaTarget, item.content);
			else if (item.type === "file") lastResult = await sendDocument(mediaTarget, item.content);
			else if (item.type === "media") lastResult = await sendMedia({
				to,
				text: "",
				mediaUrl: item.content,
				accountId: account.accountId,
				replyToId,
				account
			});
		} catch (err) {
			const errMsg = formatErrorMessage(err);
			debugError(`[qqbot] sendText: Failed to send ${item.type}: ${errMsg}`);
			lastResult = {
				channel: "qqbot",
				error: errMsg
			};
		}
		return lastResult;
	}
	if (!replyToId) {
		if (!text || text.trim().length === 0) {
			debugError("[qqbot] sendText error: proactive message content cannot be empty");
			return {
				channel: "qqbot",
				error: "Proactive messages require non-empty content (--message cannot be empty)"
			};
		}
		if (fallbackToProactive) debugLog(`[qqbot] sendText: [fallback] sending proactive message to ${to}, length=${text.length}`);
		else debugLog(`[qqbot] sendText: sending proactive message to ${to}, length=${text.length}`);
	}
	if (!account.appId || !account.clientSecret) return {
		channel: "qqbot",
		error: "QQBot not configured (missing appId or clientSecret)"
	};
	try {
		const target = parseTarget(to);
		const creds = accountToCreds(account);
		const deliveryTarget = {
			type: target.type === "channel" ? "channel" : target.type,
			id: target.id
		};
		debugLog("[qqbot] sendText target:", JSON.stringify(target));
		const result = await sendText$1(deliveryTarget, text, creds, { msgId: replyToId ?? void 0 });
		if (replyToId) recordMessageReply(replyToId);
		return {
			channel: "qqbot",
			messageId: result.id,
			timestamp: result.timestamp,
			refIdx: result.ext_info?.ref_idx
		};
	} catch (err) {
		return {
			channel: "qqbot",
			error: formatErrorMessage(err)
		};
	}
}
/** Send rich media, auto-routing by media type and source. */
async function sendMedia(ctx) {
	const { to, text, replyToId, account, mimeType } = ctx;
	initApiConfig(account.appId, { markdownSupport: account.markdownSupport });
	if (!account.appId || !account.clientSecret) return {
		channel: "qqbot",
		error: "QQBot not configured (missing appId or clientSecret)"
	};
	if (!ctx.mediaUrl) return {
		channel: "qqbot",
		error: "mediaUrl is required for sendMedia"
	};
	const resolvedMediaPath = resolveOutboundMediaPath(ctx.mediaUrl, "media", { allowMissingLocalPath: true });
	if (!resolvedMediaPath.ok) return {
		channel: "qqbot",
		error: resolvedMediaPath.error
	};
	const mediaUrl = resolvedMediaPath.mediaPath;
	const target = buildMediaTarget({
		to,
		account,
		replyToId
	});
	if (isAudioFile(mediaUrl, mimeType)) {
		const result = await sendVoice(target, mediaUrl, account.config?.audioFormatPolicy?.uploadDirectFormats ?? account.config?.voiceDirectUploadFormats, account.config?.audioFormatPolicy?.transcodeEnabled !== false);
		if (!result.error) {
			if (text?.trim()) await sendTextAfterMedia(target, text);
			return result;
		}
		const voiceError = result.error;
		debugWarn(`[qqbot] sendMedia: sendVoice failed (${voiceError}), falling back to sendDocument`);
		const fallback = await sendDocument(target, mediaUrl);
		if (!fallback.error) {
			if (text?.trim()) await sendTextAfterMedia(target, text);
			return fallback;
		}
		return {
			channel: "qqbot",
			error: `voice: ${voiceError} | fallback file: ${fallback.error}`
		};
	}
	if (isVideoFile(mediaUrl, mimeType)) {
		const result = await sendVideoMsg(target, mediaUrl);
		if (!result.error && text?.trim()) await sendTextAfterMedia(target, text);
		return result;
	}
	if (!isImageFile(mediaUrl, mimeType) && !isAudioFile(mediaUrl, mimeType) && !isVideoFile(mediaUrl, mimeType)) {
		const result = await sendDocument(target, mediaUrl);
		if (!result.error && text?.trim()) await sendTextAfterMedia(target, text);
		return result;
	}
	const result = await sendPhoto(target, mediaUrl);
	if (!result.error && text?.trim()) await sendTextAfterMedia(target, text);
	return result;
}
/** Send text after media when the transport supports a follow-up text message. */
async function sendTextAfterMedia(ctx, text) {
	try {
		const creds = accountToCreds(ctx.account);
		await sendText$1({
			type: ctx.targetType,
			id: ctx.targetId
		}, text, creds, { msgId: ctx.replyToId });
	} catch (err) {
		debugError(`[qqbot] sendTextAfterMedia failed: ${formatErrorMessage(err)}`);
	}
}
const isImageFile = isImageFile$1;
const isVideoFile = isVideoFile$1;
/**
* Send a proactive (no reply context) text message to a qualified target.
*
* Thin wrapper around {@link sendText} for callers that have a fully-qualified
* target string (e.g. `"qqbot:c2c:<openid>"`) and a {@link GatewayAccount},
* and do not want to manage access tokens or delivery-target parsing manually.
*
* @param account Resolved gateway account.
* @param to Fully-qualified target address (`qqbot:c2c:<openid>`, `qqbot:group:<id>`, etc.).
* @param content Message content.
*/
async function sendProactiveMessage(account, to, content) {
	return sendText({
		account,
		to,
		text: content
	});
}
/**
* Send a message emitted by an OpenClaw cron task.
*
* Cron output may be either:
* 1. A `QQBOT_CRON:{base64}` structured payload that includes target metadata.
* 2. Plain text that should be sent directly to the provided fallback target.
*
* @param account Resolved account configuration.
* @param to Fallback target address when the payload does not include one.
* @param message Message content, either `QQBOT_CRON:` payload or plain text.
* @returns Send result.
*
* @example
* ```typescript
* // Structured payload
* const result = await sendCronMessage(
*   account,
*   "user_openid",
*   "QQBOT_CRON:eyJ0eXBlIjoiY3Jvbl9yZW1pbmRlciIs..."
* );
*
* // Plain text
* const result = await sendCronMessage(account, "user_openid", "This is a plain reminder message.");
* ```
*/
async function sendCronMessage(account, to, message) {
	const timestamp = (/* @__PURE__ */ new Date()).toISOString();
	debugLog(`[${timestamp}] [qqbot] sendCronMessage: to=${to}, message length=${message.length}`);
	const cronResult = decodeCronPayload(message);
	if (cronResult.isCronPayload) {
		if (cronResult.error) {
			debugError(`[${timestamp}] [qqbot] sendCronMessage: cron payload decode error: ${cronResult.error}`);
			return {
				channel: "qqbot",
				error: `Failed to decode cron payload: ${cronResult.error}`
			};
		}
		if (cronResult.payload) {
			const payload = cronResult.payload;
			debugLog(`[${timestamp}] [qqbot] sendCronMessage: decoded cron payload, targetType=${payload.targetType}, targetAddress=${payload.targetAddress}, content length=${payload.content.length}`);
			const targetTo = payload.targetType === "group" ? `group:${payload.targetAddress}` : payload.targetAddress;
			debugLog(`[${timestamp}] [qqbot] sendCronMessage: sending proactive message to targetTo=${targetTo}`);
			const result = await sendText({
				account,
				to: targetTo,
				text: payload.content
			});
			if (result.error) debugError(`[${timestamp}] [qqbot] sendCronMessage: proactive message failed, error=${result.error}`);
			else debugLog(`[${timestamp}] [qqbot] sendCronMessage: proactive message sent successfully`);
			return result;
		}
	}
	debugLog(`[${timestamp}] [qqbot] sendCronMessage: plain text message, sending to ${to}`);
	return await sendText({
		account,
		to,
		text: message
	});
}
//#endregion
export { formatFileSize as C, downloadFile as S, isCronReminderPayload as _, recordMessageReply as a, normalizeMediaTags as b, sendCronMessage as c, sendPhoto as d, sendProactiveMessage as f, encodePayloadForCron as g, sendVoice as h, outbound_exports as i, sendDocument as l, sendVideoMsg as m, getMessageReplyConfig as n, registerOutboundAudioAdapter as o, sendText as p, getMessageReplyStats as r, registerOutboundAudioAdapterFactory as s, checkMessageReplyLimit as t, sendMedia as u, isMediaPayload as v, MAX_UPLOAD_SIZE as x, parseQQBotPayload as y };
