import { n as isAbortError } from "./unhandled-rejections-BWJ-75jM.js";
import { n as resolvePreferredOpenClawTmpDir } from "./tmp-openclaw-dir-Day5KPIY.js";
import { n as resolveAgentModelPrimaryValue, t as resolveAgentModelFallbackValues } from "./model-input-DR9jgad-.js";
import { a as shouldLogVerbose, r as logVerbose } from "./globals-BJZkpw-q.js";
import { i as runExec } from "./exec-nWahKiCu.js";
import { d as isInboundPathAllowed, h as resolveIMessageAttachmentRoots, p as mergeInboundPathRoots, u as DEFAULT_IMESSAGE_ATTACHMENT_ROOTS } from "./zod-schema.providers-core-BJorTsd7.js";
import { t as resolveSystemBin } from "./resolve-system-bin-BbebyaM2.js";
import { t as requireApiKey } from "./model-auth-runtime-shared-DSbChRle.js";
import { a as hasAvailableAuthForProvider, s as resolveApiKeyForProvider } from "./model-auth-BxuwOp1l.js";
import { a as isAudioFileName, r as getFileExtension, s as kindFromMime, t as detectMime } from "./mime-C9472kP8.js";
import { r as fetchWithTimeout } from "./fetch-timeout-C2XH7I0A.js";
import { i as safeFileURLToPath, t as assertNoWindowsNetworkPath } from "./local-file-access-Cfyt4pIe.js";
import { i as getDefaultMediaLocalRoots } from "./local-roots-CaV3b967.js";
import { n as fetchRemoteMedia, t as MediaFetchError } from "./fetch-ClF-ZgDC.js";
import { t as resolvePluginCapabilityProviders } from "./capability-provider-runtime-PYXIzZGK.js";
import { C as MIN_AUDIO_FILE_BYTES, S as DEFAULT_VIDEO_MAX_BASE64_BYTES, a as resolvePrompt, d as AUTO_IMAGE_KEY_PROVIDERS, f as AUTO_VIDEO_KEY_PROVIDERS, h as DEFAULT_IMAGE_MODELS, i as resolveModelEntries, m as DEFAULT_AUDIO_MODELS, n as resolveMaxBytes, o as resolveScopeDecision, p as CLI_OUTPUT_MAX_BUFFER, r as resolveMaxChars, s as resolveTimeoutMs, u as AUTO_AUDIO_KEY_PROVIDERS, w as normalizeMediaProviderId, x as DEFAULT_TIMEOUT_SECONDS } from "./resolve-B10t5zo0.js";
import { a as modelSupportsVision, n as findModelInCatalog, r as loadModelCatalog } from "./model-catalog-k0g7_9Nb.js";
import { t as buildRandomTempFilePath } from "./temp-download-BOGUEcoP.js";
import "./temp-path-CThcxCcD.js";
import "./shared-bNb64sx7.js";
import { n as executeWithApiKeyRotation, t as collectProviderApiKeysForExecution } from "./api-key-rotation-NdqhYXXq.js";
import { t as applyTemplate } from "./templating-DJb7QXiA.js";
import { i as resolveProxyFetchFromEnv } from "./proxy-fetch-Bib4caGq.js";
import { t as describeImageWithModel } from "./image-runtime-DrCqEvKh.js";
import { constants } from "node:fs";
import path from "node:path";
import { execFile } from "node:child_process";
import os from "node:os";
import { promisify } from "node:util";
import fs from "node:fs/promises";
//#region src/media-understanding/provider-registry.ts
function mergeProviderIntoRegistry(registry, provider) {
	const normalizedKey = normalizeMediaProviderId(provider.id);
	const existing = registry.get(normalizedKey);
	const merged = existing ? {
		...existing,
		...provider,
		capabilities: provider.capabilities ?? existing.capabilities
	} : provider;
	registry.set(normalizedKey, merged);
}
function buildMediaUnderstandingRegistry(overrides, cfg) {
	const registry = /* @__PURE__ */ new Map();
	for (const provider of resolvePluginCapabilityProviders({
		key: "mediaUnderstandingProviders",
		cfg
	})) mergeProviderIntoRegistry(registry, provider);
	if (overrides) for (const [key, provider] of Object.entries(overrides)) {
		const normalizedKey = normalizeMediaProviderId(key);
		const existing = registry.get(normalizedKey);
		const merged = existing ? {
			...existing,
			...provider,
			capabilities: provider.capabilities ?? existing.capabilities
		} : provider;
		registry.set(normalizedKey, merged);
	}
	return registry;
}
function getMediaUnderstandingProvider(id, registry) {
	return registry.get(normalizeMediaProviderId(id));
}
//#endregion
//#region src/media-understanding/attachments.normalize.ts
function normalizeAttachmentPath(raw) {
	const value = raw?.trim();
	if (!value) return;
	if (value.startsWith("file://")) try {
		return safeFileURLToPath(value);
	} catch {
		return;
	}
	try {
		assertNoWindowsNetworkPath(value, "Attachment path");
	} catch {
		return;
	}
	return value;
}
function normalizeAttachments(ctx) {
	const pathsFromArray = Array.isArray(ctx.MediaPaths) ? ctx.MediaPaths : void 0;
	const urlsFromArray = Array.isArray(ctx.MediaUrls) ? ctx.MediaUrls : void 0;
	const typesFromArray = Array.isArray(ctx.MediaTypes) ? ctx.MediaTypes : void 0;
	const resolveMime = (count, index) => {
		const typeHint = typesFromArray?.[index];
		const trimmed = typeof typeHint === "string" ? typeHint.trim() : "";
		if (trimmed) return trimmed;
		return count === 1 ? ctx.MediaType : void 0;
	};
	if (pathsFromArray && pathsFromArray.length > 0) {
		const count = pathsFromArray.length;
		const urls = urlsFromArray && urlsFromArray.length > 0 ? urlsFromArray : void 0;
		return pathsFromArray.map((value, index) => ({
			path: value?.trim() || void 0,
			url: urls?.[index] ?? ctx.MediaUrl,
			mime: resolveMime(count, index),
			index
		})).filter((entry) => Boolean(entry.path?.trim() || entry.url?.trim()));
	}
	if (urlsFromArray && urlsFromArray.length > 0) {
		const count = urlsFromArray.length;
		return urlsFromArray.map((value, index) => ({
			path: void 0,
			url: value?.trim() || void 0,
			mime: resolveMime(count, index),
			index
		})).filter((entry) => Boolean(entry.url?.trim()));
	}
	const pathValue = ctx.MediaPath?.trim();
	const url = ctx.MediaUrl?.trim();
	if (!pathValue && !url) return [];
	return [{
		path: pathValue || void 0,
		url: url || void 0,
		mime: ctx.MediaType,
		index: 0
	}];
}
function resolveAttachmentKind(attachment) {
	const kind = kindFromMime(attachment.mime);
	if (kind === "image" || kind === "audio" || kind === "video") return kind;
	const ext = getFileExtension(attachment.path ?? attachment.url);
	if (!ext) return "unknown";
	if ([
		".mp4",
		".mov",
		".mkv",
		".webm",
		".avi",
		".m4v"
	].includes(ext)) return "video";
	if (isAudioFileName(attachment.path ?? attachment.url)) return "audio";
	if ([
		".png",
		".jpg",
		".jpeg",
		".webp",
		".gif",
		".bmp",
		".tiff",
		".tif"
	].includes(ext)) return "image";
	return "unknown";
}
function isVideoAttachment(attachment) {
	return resolveAttachmentKind(attachment) === "video";
}
function isAudioAttachment(attachment) {
	return resolveAttachmentKind(attachment) === "audio";
}
function isImageAttachment(attachment) {
	return resolveAttachmentKind(attachment) === "image";
}
//#endregion
//#region src/media-understanding/attachments.select.ts
const DEFAULT_MAX_ATTACHMENTS = 1;
function orderAttachments(attachments, prefer) {
	const list = Array.isArray(attachments) ? attachments.filter(isAttachmentRecord) : [];
	if (!prefer || prefer === "first") return list;
	if (prefer === "last") return [...list].toReversed();
	if (prefer === "path") {
		const withPath = list.filter((item) => item.path);
		const withoutPath = list.filter((item) => !item.path);
		return [...withPath, ...withoutPath];
	}
	if (prefer === "url") {
		const withUrl = list.filter((item) => item.url);
		const withoutUrl = list.filter((item) => !item.url);
		return [...withUrl, ...withoutUrl];
	}
	return list;
}
function isAttachmentRecord(value) {
	if (!value || typeof value !== "object") return false;
	const entry = value;
	if (typeof entry.index !== "number") return false;
	if (entry.path !== void 0 && typeof entry.path !== "string") return false;
	if (entry.url !== void 0 && typeof entry.url !== "string") return false;
	if (entry.mime !== void 0 && typeof entry.mime !== "string") return false;
	if (entry.alreadyTranscribed !== void 0 && typeof entry.alreadyTranscribed !== "boolean") return false;
	return true;
}
function selectAttachments(params) {
	const { capability, attachments, policy } = params;
	const matches = (Array.isArray(attachments) ? attachments.filter(isAttachmentRecord) : []).filter((item) => {
		if (capability === "audio" && item.alreadyTranscribed) return false;
		if (capability === "image") return isImageAttachment(item);
		if (capability === "audio") return isAudioAttachment(item);
		return isVideoAttachment(item);
	});
	if (matches.length === 0) return [];
	const ordered = orderAttachments(matches, policy?.prefer);
	const mode = policy?.mode ?? "first";
	const maxAttachments = policy?.maxAttachments ?? DEFAULT_MAX_ATTACHMENTS;
	if (mode === "all") return ordered.slice(0, Math.max(1, maxAttachments));
	return ordered.slice(0, 1);
}
//#endregion
//#region src/media-understanding/errors.ts
var MediaUnderstandingSkipError = class extends Error {
	constructor(reason, message) {
		super(message);
		this.reason = reason;
		this.name = "MediaUnderstandingSkipError";
	}
};
function isMediaUnderstandingSkipError(err) {
	return err instanceof MediaUnderstandingSkipError;
}
//#endregion
//#region src/media-understanding/attachments.cache.ts
let defaultLocalPathRoots;
function getDefaultLocalPathRoots() {
	defaultLocalPathRoots ??= mergeInboundPathRoots(getDefaultMediaLocalRoots(), DEFAULT_IMESSAGE_ATTACHMENT_ROOTS);
	return defaultLocalPathRoots;
}
function resolveRequestUrl(input) {
	if (typeof input === "string") return input;
	if (input instanceof URL) return input.toString();
	return input.url;
}
var MediaAttachmentCache = class {
	constructor(attachments, options) {
		this.entries = /* @__PURE__ */ new Map();
		this.attachments = attachments;
		this.localPathRoots = mergeInboundPathRoots(options?.localPathRoots, getDefaultLocalPathRoots());
		for (const attachment of attachments) this.entries.set(attachment.index, { attachment });
	}
	async getBuffer(params) {
		const entry = await this.ensureEntry(params.attachmentIndex);
		if (entry.buffer) {
			if (entry.buffer.length > params.maxBytes) throw new MediaUnderstandingSkipError("maxBytes", `Attachment ${params.attachmentIndex + 1} exceeds maxBytes ${params.maxBytes}`);
			return {
				buffer: entry.buffer,
				mime: entry.bufferMime,
				fileName: entry.bufferFileName ?? `media-${params.attachmentIndex + 1}`,
				size: entry.buffer.length
			};
		}
		if (entry.resolvedPath) {
			const size = await this.ensureLocalStat(entry);
			if (entry.resolvedPath) {
				if (size !== void 0 && size > params.maxBytes) throw new MediaUnderstandingSkipError("maxBytes", `Attachment ${params.attachmentIndex + 1} exceeds maxBytes ${params.maxBytes}`);
				const { buffer, filePath } = await this.readLocalBuffer({
					attachmentIndex: params.attachmentIndex,
					filePath: entry.resolvedPath,
					maxBytes: params.maxBytes
				});
				entry.resolvedPath = filePath;
				entry.buffer = buffer;
				entry.bufferMime = entry.bufferMime ?? entry.attachment.mime ?? await detectMime({
					buffer,
					filePath
				});
				entry.bufferFileName = path.basename(filePath) || `media-${params.attachmentIndex + 1}`;
				return {
					buffer,
					mime: entry.bufferMime,
					fileName: entry.bufferFileName,
					size: buffer.length
				};
			}
		}
		const url = entry.attachment.url?.trim();
		if (!url) throw new MediaUnderstandingSkipError("empty", `Attachment ${params.attachmentIndex + 1} has no path or URL.`);
		try {
			const fetchImpl = (input, init) => fetchWithTimeout(resolveRequestUrl(input), init ?? {}, params.timeoutMs, fetch);
			const fetched = await fetchRemoteMedia({
				url,
				fetchImpl,
				maxBytes: params.maxBytes
			});
			entry.buffer = fetched.buffer;
			entry.bufferMime = entry.attachment.mime ?? fetched.contentType ?? await detectMime({
				buffer: fetched.buffer,
				filePath: fetched.fileName ?? url
			});
			entry.bufferFileName = fetched.fileName ?? `media-${params.attachmentIndex + 1}`;
			return {
				buffer: fetched.buffer,
				mime: entry.bufferMime,
				fileName: entry.bufferFileName,
				size: fetched.buffer.length
			};
		} catch (err) {
			if (err instanceof MediaFetchError && err.code === "max_bytes") throw new MediaUnderstandingSkipError("maxBytes", `Attachment ${params.attachmentIndex + 1} exceeds maxBytes ${params.maxBytes}`);
			if (isAbortError(err)) throw new MediaUnderstandingSkipError("timeout", `Attachment ${params.attachmentIndex + 1} timed out while fetching.`);
			throw err;
		}
	}
	async getPath(params) {
		const entry = await this.ensureEntry(params.attachmentIndex);
		if (entry.resolvedPath) {
			if (params.maxBytes) {
				const size = await this.ensureLocalStat(entry);
				if (entry.resolvedPath) {
					if (size !== void 0 && size > params.maxBytes) throw new MediaUnderstandingSkipError("maxBytes", `Attachment ${params.attachmentIndex + 1} exceeds maxBytes ${params.maxBytes}`);
				}
			}
			if (entry.resolvedPath) return { path: entry.resolvedPath };
		}
		if (entry.tempPath) {
			if (params.maxBytes && entry.buffer && entry.buffer.length > params.maxBytes) throw new MediaUnderstandingSkipError("maxBytes", `Attachment ${params.attachmentIndex + 1} exceeds maxBytes ${params.maxBytes}`);
			return {
				path: entry.tempPath,
				cleanup: entry.tempCleanup
			};
		}
		const maxBytes = params.maxBytes ?? Number.POSITIVE_INFINITY;
		const bufferResult = await this.getBuffer({
			attachmentIndex: params.attachmentIndex,
			maxBytes,
			timeoutMs: params.timeoutMs
		});
		const tmpPath = buildRandomTempFilePath({
			prefix: "openclaw-media",
			extension: path.extname(bufferResult.fileName || "") || ""
		});
		await fs.writeFile(tmpPath, bufferResult.buffer);
		entry.tempPath = tmpPath;
		entry.tempCleanup = async () => {
			await fs.unlink(tmpPath).catch(() => {});
		};
		return {
			path: tmpPath,
			cleanup: entry.tempCleanup
		};
	}
	async cleanup() {
		const cleanups = [];
		for (const entry of this.entries.values()) if (entry.tempCleanup) {
			cleanups.push(Promise.resolve(entry.tempCleanup()));
			entry.tempCleanup = void 0;
		}
		await Promise.all(cleanups);
	}
	async ensureEntry(attachmentIndex) {
		const existing = this.entries.get(attachmentIndex);
		if (existing) {
			if (!existing.resolvedPath) existing.resolvedPath = this.resolveLocalPath(existing.attachment);
			return existing;
		}
		const attachment = this.attachments.find((item) => item.index === attachmentIndex) ?? { index: attachmentIndex };
		const entry = {
			attachment,
			resolvedPath: this.resolveLocalPath(attachment)
		};
		this.entries.set(attachmentIndex, entry);
		return entry;
	}
	resolveLocalPath(attachment) {
		const rawPath = normalizeAttachmentPath(attachment.path);
		if (!rawPath) return;
		return path.isAbsolute(rawPath) ? rawPath : path.resolve(rawPath);
	}
	async ensureLocalStat(entry) {
		if (!entry.resolvedPath) return;
		if (!isInboundPathAllowed({
			filePath: entry.resolvedPath,
			roots: this.localPathRoots
		})) {
			entry.resolvedPath = void 0;
			if (shouldLogVerbose()) logVerbose(`Blocked attachment path outside allowed roots: ${entry.attachment.path ?? entry.attachment.url ?? "(unknown)"}`);
			return;
		}
		if (entry.statSize !== void 0) return entry.statSize;
		try {
			const currentPath = entry.resolvedPath;
			const stat = await fs.stat(currentPath);
			if (!stat.isFile()) {
				entry.resolvedPath = void 0;
				return;
			}
			const canonicalPath = await fs.realpath(currentPath).catch(() => currentPath);
			if (!isInboundPathAllowed({
				filePath: canonicalPath,
				roots: await this.getCanonicalLocalPathRoots()
			})) {
				entry.resolvedPath = void 0;
				if (shouldLogVerbose()) logVerbose(`Blocked canonicalized attachment path outside allowed roots: ${canonicalPath}`);
				return;
			}
			entry.resolvedPath = canonicalPath;
			entry.statSize = stat.size;
			return stat.size;
		} catch (err) {
			entry.resolvedPath = void 0;
			if (shouldLogVerbose()) logVerbose(`Failed to read attachment ${entry.attachment.index + 1}: ${String(err)}`);
			return;
		}
	}
	async getCanonicalLocalPathRoots() {
		if (this.canonicalLocalPathRoots) return await this.canonicalLocalPathRoots;
		this.canonicalLocalPathRoots = (async () => mergeInboundPathRoots(this.localPathRoots, await Promise.all(this.localPathRoots.map(async (root) => {
			if (root.includes("*")) return root;
			return await fs.realpath(root).catch(() => root);
		}))))();
		return await this.canonicalLocalPathRoots;
	}
	async readLocalBuffer(params) {
		const flags = constants.O_RDONLY | (process.platform === "win32" ? 0 : constants.O_NOFOLLOW);
		const handle = await fs.open(params.filePath, flags);
		try {
			if (!(await handle.stat()).isFile()) throw new MediaUnderstandingSkipError("empty", `Attachment ${params.attachmentIndex + 1} has no path or URL.`);
			const canonicalPath = await fs.realpath(params.filePath).catch(() => params.filePath);
			if (!isInboundPathAllowed({
				filePath: canonicalPath,
				roots: await this.getCanonicalLocalPathRoots()
			})) throw new MediaUnderstandingSkipError("empty", `Attachment ${params.attachmentIndex + 1} has no path or URL.`);
			const buffer = await handle.readFile();
			if (buffer.length > params.maxBytes) throw new MediaUnderstandingSkipError("maxBytes", `Attachment ${params.attachmentIndex + 1} exceeds maxBytes ${params.maxBytes}`);
			return {
				buffer,
				filePath: canonicalPath
			};
		} finally {
			await handle.close().catch(() => {});
		}
	}
};
//#endregion
//#region src/media-understanding/fs.ts
async function fileExists(filePath) {
	if (!filePath) return false;
	try {
		await fs.stat(filePath);
		return true;
	} catch {
		return false;
	}
}
//#endregion
//#region src/media-understanding/output-extract.ts
function extractLastJsonObject(raw) {
	const trimmed = raw.trim();
	const start = trimmed.lastIndexOf("{");
	if (start === -1) return null;
	const slice = trimmed.slice(start);
	try {
		return JSON.parse(slice);
	} catch {
		return null;
	}
}
function extractGeminiResponse(raw) {
	const payload = extractLastJsonObject(raw);
	if (!payload || typeof payload !== "object") return null;
	const response = payload.response;
	if (typeof response !== "string") return null;
	return response.trim() || null;
}
//#endregion
//#region src/media/ffmpeg-limits.ts
const MEDIA_FFMPEG_MAX_BUFFER_BYTES = 10 * 1024 * 1024;
const MEDIA_FFPROBE_TIMEOUT_MS = 1e4;
const MEDIA_FFMPEG_TIMEOUT_MS = 45e3;
const MEDIA_FFMPEG_MAX_AUDIO_DURATION_SECS = 1200;
//#endregion
//#region src/media/ffmpeg-exec.ts
const execFileAsync = promisify(execFile);
function resolveExecOptions(defaultTimeoutMs, options) {
	return {
		timeout: options?.timeoutMs ?? defaultTimeoutMs,
		maxBuffer: options?.maxBufferBytes ?? 10485760
	};
}
function requireSystemBin(name) {
	const resolved = resolveSystemBin(name, { trust: "standard" });
	if (!resolved) {
		const hint = process.platform === "darwin" ? "e.g. brew install ffmpeg" : "e.g. apt install ffmpeg / dnf install ffmpeg";
		throw new Error(`${name} not found in trusted system directories. Install it via your system package manager (${hint}).`);
	}
	return resolved;
}
async function runFfprobe(args, options) {
	const { stdout } = await execFileAsync(requireSystemBin("ffprobe"), args, resolveExecOptions(MEDIA_FFPROBE_TIMEOUT_MS, options));
	return stdout.toString();
}
async function runFfmpeg(args, options) {
	const { stdout } = await execFileAsync(requireSystemBin("ffmpeg"), args, resolveExecOptions(MEDIA_FFMPEG_TIMEOUT_MS, options));
	return stdout.toString();
}
function parseFfprobeCsvFields(stdout, maxFields) {
	return stdout.trim().toLowerCase().split(/[,\r\n]+/, maxFields).map((field) => field.trim());
}
function parseFfprobeCodecAndSampleRate(stdout) {
	const [codecRaw, sampleRateRaw] = parseFfprobeCsvFields(stdout, 2);
	const codec = codecRaw ? codecRaw : null;
	const sampleRate = sampleRateRaw ? Number.parseInt(sampleRateRaw, 10) : NaN;
	return {
		codec,
		sampleRateHz: Number.isFinite(sampleRate) ? sampleRate : null
	};
}
//#endregion
//#region src/media-understanding/video.ts
function estimateBase64Size(bytes) {
	return Math.ceil(bytes / 3) * 4;
}
function resolveVideoMaxBase64Bytes(maxBytes) {
	const expanded = Math.floor(maxBytes * (4 / 3));
	return Math.min(expanded, DEFAULT_VIDEO_MAX_BASE64_BYTES);
}
//#endregion
//#region src/media-understanding/runner.entries.ts
function sanitizeProviderHeaders(headers) {
	if (!headers) return;
	const next = {};
	for (const [key, value] of Object.entries(headers)) {
		if (typeof value !== "string") continue;
		next[key] = value;
	}
	return Object.keys(next).length > 0 ? next : void 0;
}
function trimOutput(text, maxChars) {
	const trimmed = text.trim();
	if (!maxChars || trimmed.length <= maxChars) return trimmed;
	return trimmed.slice(0, maxChars).trim();
}
function extractSherpaOnnxText(raw) {
	const tryParse = (value) => {
		const trimmed = value.trim();
		if (!trimmed) return null;
		const head = trimmed[0];
		if (head !== "{" && head !== "\"") return null;
		try {
			const parsed = JSON.parse(trimmed);
			if (typeof parsed === "string") return tryParse(parsed);
			if (parsed && typeof parsed === "object") {
				const text = parsed.text;
				if (typeof text === "string" && text.trim()) return text.trim();
			}
		} catch {}
		return null;
	};
	const direct = tryParse(raw);
	if (direct) return direct;
	const lines = raw.split("\n").map((line) => line.trim()).filter(Boolean);
	for (let i = lines.length - 1; i >= 0; i -= 1) {
		const parsed = tryParse(lines[i] ?? "");
		if (parsed) return parsed;
	}
	return null;
}
function commandBase(command) {
	return path.parse(command).name;
}
function findArgValue(args, keys) {
	for (let i = 0; i < args.length; i += 1) if (keys.includes(args[i] ?? "")) {
		const value = args[i + 1];
		if (value) return value;
	}
}
function hasArg(args, keys) {
	return args.some((arg) => keys.includes(arg));
}
function resolveWhisperOutputPath(args, mediaPath) {
	const outputDir = findArgValue(args, ["--output_dir", "-o"]);
	const outputFormat = findArgValue(args, ["--output_format"]);
	if (!outputDir || !outputFormat) return null;
	if (!outputFormat.split(",").map((value) => value.trim()).includes("txt")) return null;
	const base = path.parse(mediaPath).name;
	return path.join(outputDir, `${base}.txt`);
}
function resolveWhisperCppOutputPath(args) {
	if (!hasArg(args, ["-otxt", "--output-txt"])) return null;
	const outputBase = findArgValue(args, ["-of", "--output-file"]);
	if (!outputBase) return null;
	return `${outputBase}.txt`;
}
function resolveParakeetOutputPath(args, mediaPath) {
	const outputDir = findArgValue(args, ["--output-dir"]);
	const outputFormat = findArgValue(args, ["--output-format"]);
	if (!outputDir) return null;
	if (outputFormat && outputFormat !== "txt") return null;
	const base = path.parse(mediaPath).name;
	return path.join(outputDir, `${base}.txt`);
}
async function resolveCliOutput(params) {
	const commandId = commandBase(params.command);
	const fileOutput = commandId === "whisper-cli" ? resolveWhisperCppOutputPath(params.args) : commandId === "whisper" ? resolveWhisperOutputPath(params.args, params.mediaPath) : commandId === "parakeet-mlx" ? resolveParakeetOutputPath(params.args, params.mediaPath) : null;
	if (fileOutput && await fileExists(fileOutput)) try {
		const content = await fs.readFile(fileOutput, "utf8");
		if (content.trim()) return content.trim();
	} catch {}
	if (commandId === "gemini") {
		const response = extractGeminiResponse(params.stdout);
		if (response) return response;
	}
	if (commandId === "sherpa-onnx-offline") {
		const response = extractSherpaOnnxText(params.stdout);
		if (response) return response;
	}
	return params.stdout.trim();
}
async function resolveCliMediaPath(params) {
	const commandId = commandBase(params.command);
	if (params.capability !== "audio" || commandId !== "whisper-cli") return params.mediaPath;
	if (path.extname(params.mediaPath).toLowerCase() === ".wav") return params.mediaPath;
	const wavPath = path.join(params.outputDir, `${path.parse(params.mediaPath).name}.wav`);
	await runFfmpeg([
		"-y",
		"-i",
		params.mediaPath,
		"-ac",
		"1",
		"-ar",
		"16000",
		"-c:a",
		"pcm_s16le",
		wavPath
	]);
	return wavPath;
}
function normalizeProviderQuery(options) {
	if (!options) return;
	const query = {};
	for (const [key, value] of Object.entries(options)) {
		if (value === void 0) continue;
		query[key] = value;
	}
	return Object.keys(query).length > 0 ? query : void 0;
}
function buildDeepgramCompatQuery(options) {
	if (!options) return;
	const query = {};
	if (typeof options.detectLanguage === "boolean") query.detect_language = options.detectLanguage;
	if (typeof options.punctuate === "boolean") query.punctuate = options.punctuate;
	if (typeof options.smartFormat === "boolean") query.smart_format = options.smartFormat;
	return Object.keys(query).length > 0 ? query : void 0;
}
function normalizeDeepgramQueryKeys(query) {
	const normalized = { ...query };
	if ("detectLanguage" in normalized) {
		normalized.detect_language = normalized.detectLanguage;
		delete normalized.detectLanguage;
	}
	if ("smartFormat" in normalized) {
		normalized.smart_format = normalized.smartFormat;
		delete normalized.smartFormat;
	}
	return normalized;
}
function resolveProviderQuery(params) {
	const { providerId, config, entry } = params;
	const mergedOptions = normalizeProviderQuery({
		...config?.providerOptions?.[providerId],
		...entry.providerOptions?.[providerId]
	});
	if (providerId !== "deepgram") return mergedOptions;
	const query = normalizeDeepgramQueryKeys(mergedOptions ?? {});
	const compat = buildDeepgramCompatQuery({
		...config?.deepgram,
		...entry.deepgram
	});
	for (const [key, value] of Object.entries(compat ?? {})) if (query[key] === void 0) query[key] = value;
	return Object.keys(query).length > 0 ? query : void 0;
}
function buildModelDecision(params) {
	if (params.entryType === "cli") {
		const command = params.entry.command?.trim();
		return {
			type: "cli",
			provider: command ?? "cli",
			model: params.entry.model ?? command,
			outcome: params.outcome,
			reason: params.reason
		};
	}
	const providerIdRaw = params.entry.provider?.trim();
	return {
		type: "provider",
		provider: (providerIdRaw ? normalizeMediaProviderId(providerIdRaw) : void 0) ?? providerIdRaw,
		model: params.entry.model,
		outcome: params.outcome,
		reason: params.reason
	};
}
function resolveEntryRunOptions(params) {
	const { capability, entry, cfg } = params;
	const maxBytes = resolveMaxBytes({
		capability,
		entry,
		cfg,
		config: params.config
	});
	const maxChars = resolveMaxChars({
		capability,
		entry,
		cfg,
		config: params.config
	});
	return {
		maxBytes,
		maxChars,
		timeoutMs: resolveTimeoutMs(entry.timeoutSeconds ?? params.config?.timeoutSeconds ?? cfg.tools?.media?.[capability]?.timeoutSeconds, DEFAULT_TIMEOUT_SECONDS[capability]),
		prompt: resolvePrompt(capability, entry.prompt ?? params.config?.prompt ?? cfg.tools?.media?.[capability]?.prompt, maxChars)
	};
}
async function resolveProviderExecutionAuth(params) {
	const auth = await resolveApiKeyForProvider({
		provider: params.providerId,
		cfg: params.cfg,
		profileId: params.entry.profile,
		preferredProfile: params.entry.preferredProfile,
		agentDir: params.agentDir
	});
	return {
		apiKeys: collectProviderApiKeysForExecution({
			provider: params.providerId,
			primaryApiKey: requireApiKey(auth, params.providerId)
		}),
		providerConfig: params.cfg.models?.providers?.[params.providerId]
	};
}
async function resolveProviderExecutionContext(params) {
	const { apiKeys, providerConfig } = await resolveProviderExecutionAuth({
		providerId: params.providerId,
		cfg: params.cfg,
		entry: params.entry,
		agentDir: params.agentDir
	});
	const baseUrl = params.entry.baseUrl ?? params.config?.baseUrl ?? providerConfig?.baseUrl;
	const mergedHeaders = {
		...sanitizeProviderHeaders(providerConfig?.headers),
		...sanitizeProviderHeaders(params.config?.headers),
		...sanitizeProviderHeaders(params.entry.headers)
	};
	return {
		apiKeys,
		baseUrl,
		headers: Object.keys(mergedHeaders).length > 0 ? mergedHeaders : void 0
	};
}
function formatDecisionSummary(decision) {
	const attachments = Array.isArray(decision.attachments) ? decision.attachments : [];
	const total = attachments.length;
	const success = attachments.filter((entry) => entry?.chosen?.outcome === "success").length;
	const chosen = attachments.find((entry) => entry?.chosen)?.chosen;
	const provider = typeof chosen?.provider === "string" ? chosen.provider.trim() : void 0;
	const model = typeof chosen?.model === "string" ? chosen.model.trim() : void 0;
	const modelLabel = provider ? model ? `${provider}/${model}` : provider : void 0;
	const reason = attachments.flatMap((entry) => {
		return (Array.isArray(entry?.attempts) ? entry.attempts : []).map((attempt) => typeof attempt?.reason === "string" ? attempt.reason : void 0).filter((value) => Boolean(value));
	}).find((value) => value.trim().length > 0);
	const shortReason = reason ? reason.split(":")[0]?.trim() : void 0;
	const countLabel = total > 0 ? ` (${success}/${total})` : "";
	const viaLabel = modelLabel ? ` via ${modelLabel}` : "";
	const reasonLabel = shortReason ? ` reason=${shortReason}` : "";
	return `${decision.capability}: ${decision.outcome}${countLabel}${viaLabel}${reasonLabel}`;
}
function assertMinAudioSize(params) {
	if (params.size >= 1024) return;
	throw new MediaUnderstandingSkipError("tooSmall", `Audio attachment ${params.attachmentIndex + 1} is too small (${params.size} bytes, minimum ${MIN_AUDIO_FILE_BYTES})`);
}
async function runProviderEntry(params) {
	const { entry, capability, cfg } = params;
	const providerIdRaw = entry.provider?.trim();
	if (!providerIdRaw) throw new Error(`Provider entry missing provider for ${capability}`);
	const providerId = normalizeMediaProviderId(providerIdRaw);
	const { maxBytes, maxChars, timeoutMs, prompt } = resolveEntryRunOptions({
		capability,
		entry,
		cfg,
		config: params.config
	});
	if (capability === "image") {
		if (!params.agentDir) throw new Error("Image understanding requires agentDir");
		const modelId = entry.model?.trim();
		if (!modelId) throw new Error("Image understanding requires model id");
		const media = await params.cache.getBuffer({
			attachmentIndex: params.attachmentIndex,
			maxBytes,
			timeoutMs
		});
		const provider = getMediaUnderstandingProvider(providerId, params.providerRegistry);
		const imageInput = {
			buffer: media.buffer,
			fileName: media.fileName,
			mime: media.mime,
			model: modelId,
			provider: providerId,
			prompt,
			timeoutMs,
			profile: entry.profile,
			preferredProfile: entry.preferredProfile,
			agentDir: params.agentDir,
			cfg: params.cfg
		};
		const result = await (provider?.describeImage ?? describeImageWithModel)(imageInput);
		return {
			kind: "image.description",
			attachmentIndex: params.attachmentIndex,
			text: trimOutput(result.text, maxChars),
			provider: providerId,
			model: result.model ?? modelId
		};
	}
	const provider = getMediaUnderstandingProvider(providerId, params.providerRegistry);
	if (!provider) throw new Error(`Media provider not available: ${providerId}`);
	const fetchFn = resolveProxyFetchFromEnv();
	if (capability === "audio") {
		if (!provider.transcribeAudio) throw new Error(`Audio transcription provider "${providerId}" not available.`);
		const transcribeAudio = provider.transcribeAudio;
		const media = await params.cache.getBuffer({
			attachmentIndex: params.attachmentIndex,
			maxBytes,
			timeoutMs
		});
		assertMinAudioSize({
			size: media.size,
			attachmentIndex: params.attachmentIndex
		});
		const { apiKeys, baseUrl, headers } = await resolveProviderExecutionContext({
			providerId,
			cfg,
			entry,
			config: params.config,
			agentDir: params.agentDir
		});
		const providerQuery = resolveProviderQuery({
			providerId,
			config: params.config,
			entry
		});
		const model = entry.model?.trim() || DEFAULT_AUDIO_MODELS[providerId] || entry.model;
		const result = await executeWithApiKeyRotation({
			provider: providerId,
			apiKeys,
			execute: async (apiKey) => transcribeAudio({
				buffer: media.buffer,
				fileName: media.fileName,
				mime: media.mime,
				apiKey,
				baseUrl,
				headers,
				model,
				language: entry.language ?? params.config?.language ?? cfg.tools?.media?.audio?.language,
				prompt,
				query: providerQuery,
				timeoutMs,
				fetchFn
			})
		});
		return {
			kind: "audio.transcription",
			attachmentIndex: params.attachmentIndex,
			text: trimOutput(result.text, maxChars),
			provider: providerId,
			model: result.model ?? model
		};
	}
	if (!provider.describeVideo) throw new Error(`Video understanding provider "${providerId}" not available.`);
	const describeVideo = provider.describeVideo;
	const media = await params.cache.getBuffer({
		attachmentIndex: params.attachmentIndex,
		maxBytes,
		timeoutMs
	});
	const estimatedBase64Bytes = estimateBase64Size(media.size);
	const maxBase64Bytes = resolveVideoMaxBase64Bytes(maxBytes);
	if (estimatedBase64Bytes > maxBase64Bytes) throw new MediaUnderstandingSkipError("maxBytes", `Video attachment ${params.attachmentIndex + 1} base64 payload ${estimatedBase64Bytes} exceeds ${maxBase64Bytes}`);
	const { apiKeys, baseUrl, headers } = await resolveProviderExecutionContext({
		providerId,
		cfg,
		entry,
		config: params.config,
		agentDir: params.agentDir
	});
	const result = await executeWithApiKeyRotation({
		provider: providerId,
		apiKeys,
		execute: (apiKey) => describeVideo({
			buffer: media.buffer,
			fileName: media.fileName,
			mime: media.mime,
			apiKey,
			baseUrl,
			headers,
			model: entry.model,
			prompt,
			timeoutMs,
			fetchFn
		})
	});
	return {
		kind: "video.description",
		attachmentIndex: params.attachmentIndex,
		text: trimOutput(result.text, maxChars),
		provider: providerId,
		model: result.model ?? entry.model
	};
}
async function runCliEntry(params) {
	const { entry, capability, cfg, ctx } = params;
	const command = entry.command?.trim();
	const args = entry.args ?? [];
	if (!command) throw new Error(`CLI entry missing command for ${capability}`);
	const { maxBytes, maxChars, timeoutMs, prompt } = resolveEntryRunOptions({
		capability,
		entry,
		cfg,
		config: params.config
	});
	const pathResult = await params.cache.getPath({
		attachmentIndex: params.attachmentIndex,
		maxBytes,
		timeoutMs
	});
	if (capability === "audio") assertMinAudioSize({
		size: (await fs.stat(pathResult.path)).size,
		attachmentIndex: params.attachmentIndex
	});
	const outputDir = await fs.mkdtemp(path.join(resolvePreferredOpenClawTmpDir(), "openclaw-media-cli-"));
	const mediaPath = await resolveCliMediaPath({
		capability,
		command,
		mediaPath: pathResult.path,
		outputDir
	});
	const outputBase = path.join(outputDir, path.parse(mediaPath).name);
	const templCtx = {
		...ctx,
		MediaPath: mediaPath,
		MediaDir: path.dirname(mediaPath),
		OutputDir: outputDir,
		OutputBase: outputBase,
		Prompt: prompt,
		MaxChars: maxChars
	};
	const argv = [command, ...args].map((part, index) => index === 0 ? part : applyTemplate(part, templCtx));
	try {
		if (shouldLogVerbose()) logVerbose(`Media understanding via CLI: ${argv.join(" ")}`);
		const { stdout } = await runExec(argv[0], argv.slice(1), {
			timeoutMs,
			maxBuffer: CLI_OUTPUT_MAX_BUFFER
		});
		const text = trimOutput(await resolveCliOutput({
			command,
			args: argv.slice(1),
			stdout,
			mediaPath
		}), maxChars);
		if (!text) return null;
		return {
			kind: capability === "audio" ? "audio.transcription" : `${capability}.description`,
			attachmentIndex: params.attachmentIndex,
			text,
			provider: "cli",
			model: command
		};
	} finally {
		await fs.rm(outputDir, {
			recursive: true,
			force: true
		}).catch(() => {});
	}
}
//#endregion
//#region src/media-understanding/runner.ts
function buildProviderRegistry(overrides, cfg) {
	return buildMediaUnderstandingRegistry(overrides, cfg);
}
function normalizeMediaAttachments(ctx) {
	return normalizeAttachments(ctx);
}
function resolveMediaAttachmentLocalRoots(params) {
	return mergeInboundPathRoots(getDefaultMediaLocalRoots(), resolveIMessageAttachmentRoots({
		cfg: params.cfg,
		accountId: params.ctx.AccountId
	}));
}
function createMediaAttachmentCache(attachments, options) {
	return new MediaAttachmentCache(attachments, options);
}
const binaryCache = /* @__PURE__ */ new Map();
const geminiProbeCache = /* @__PURE__ */ new Map();
function clearMediaUnderstandingBinaryCacheForTests() {
	binaryCache.clear();
	geminiProbeCache.clear();
}
function expandHomeDir(value) {
	if (!value.startsWith("~")) return value;
	const home = os.homedir();
	if (value === "~") return home;
	if (value.startsWith("~/")) return path.join(home, value.slice(2));
	return value;
}
function hasPathSeparator(value) {
	return value.includes("/") || value.includes("\\");
}
function candidateBinaryNames(name) {
	if (process.platform !== "win32") return [name];
	if (path.extname(name)) return [name];
	const pathext = (process.env.PATHEXT ?? ".EXE;.CMD;.BAT;.COM").split(";").map((item) => item.trim()).filter(Boolean).map((item) => item.startsWith(".") ? item : `.${item}`);
	return [name, ...Array.from(new Set(pathext)).map((item) => `${name}${item}`)];
}
async function isExecutable(filePath) {
	try {
		if (!(await fs.stat(filePath)).isFile()) return false;
		if (process.platform === "win32") return true;
		await fs.access(filePath, constants.X_OK);
		return true;
	} catch {
		return false;
	}
}
async function findBinary(name) {
	const cached = binaryCache.get(name);
	if (cached) return cached;
	const resolved = (async () => {
		const direct = expandHomeDir(name.trim());
		if (direct && hasPathSeparator(direct)) {
			for (const candidate of candidateBinaryNames(direct)) if (await isExecutable(candidate)) return candidate;
		}
		const searchName = name.trim();
		if (!searchName) return null;
		const pathEntries = (process.env.PATH ?? "").split(path.delimiter);
		const candidates = candidateBinaryNames(searchName);
		for (const entryRaw of pathEntries) {
			const entry = expandHomeDir(entryRaw.trim().replace(/^"(.*)"$/, "$1"));
			if (!entry) continue;
			for (const candidate of candidates) {
				const fullPath = path.join(entry, candidate);
				if (await isExecutable(fullPath)) return fullPath;
			}
		}
		return null;
	})();
	binaryCache.set(name, resolved);
	return resolved;
}
async function hasBinary(name) {
	return Boolean(await findBinary(name));
}
async function probeGeminiCli() {
	const cached = geminiProbeCache.get("gemini");
	if (cached) return cached;
	const resolved = (async () => {
		if (!await hasBinary("gemini")) return false;
		try {
			const { stdout } = await runExec("gemini", [
				"--output-format",
				"json",
				"ok"
			], { timeoutMs: 8e3 });
			return Boolean(extractGeminiResponse(stdout) ?? stdout.toLowerCase().includes("ok"));
		} catch {
			return false;
		}
	})();
	geminiProbeCache.set("gemini", resolved);
	return resolved;
}
async function resolveLocalWhisperCppEntry() {
	if (!await hasBinary("whisper-cli")) return null;
	const envModel = process.env.WHISPER_CPP_MODEL?.trim();
	const modelPath = envModel && await fileExists(envModel) ? envModel : "/opt/homebrew/share/whisper-cpp/for-tests-ggml-tiny.bin";
	if (!await fileExists(modelPath)) return null;
	return {
		type: "cli",
		command: "whisper-cli",
		args: [
			"-m",
			modelPath,
			"-otxt",
			"-of",
			"{{OutputBase}}",
			"-np",
			"-nt",
			"{{MediaPath}}"
		]
	};
}
async function resolveLocalWhisperEntry() {
	if (!await hasBinary("whisper")) return null;
	return {
		type: "cli",
		command: "whisper",
		args: [
			"--model",
			"turbo",
			"--output_format",
			"txt",
			"--output_dir",
			"{{OutputDir}}",
			"--verbose",
			"False",
			"{{MediaPath}}"
		]
	};
}
async function resolveSherpaOnnxEntry() {
	if (!await hasBinary("sherpa-onnx-offline")) return null;
	const modelDir = process.env.SHERPA_ONNX_MODEL_DIR?.trim();
	if (!modelDir) return null;
	const tokens = path.join(modelDir, "tokens.txt");
	const encoder = path.join(modelDir, "encoder.onnx");
	const decoder = path.join(modelDir, "decoder.onnx");
	const joiner = path.join(modelDir, "joiner.onnx");
	if (!await fileExists(tokens)) return null;
	if (!await fileExists(encoder)) return null;
	if (!await fileExists(decoder)) return null;
	if (!await fileExists(joiner)) return null;
	return {
		type: "cli",
		command: "sherpa-onnx-offline",
		args: [
			`--tokens=${tokens}`,
			`--encoder=${encoder}`,
			`--decoder=${decoder}`,
			`--joiner=${joiner}`,
			"{{MediaPath}}"
		]
	};
}
async function resolveLocalAudioEntry() {
	const sherpa = await resolveSherpaOnnxEntry();
	if (sherpa) return sherpa;
	const whisperCpp = await resolveLocalWhisperCppEntry();
	if (whisperCpp) return whisperCpp;
	return await resolveLocalWhisperEntry();
}
async function resolveGeminiCliEntry(_capability) {
	if (!await probeGeminiCli()) return null;
	return {
		type: "cli",
		command: "gemini",
		args: [
			"--output-format",
			"json",
			"--allowed-tools",
			"read_many_files",
			"--include-directories",
			"{{MediaDir}}",
			"{{Prompt}}",
			"Use read_many_files to read {{MediaPath}} and respond with only the text output."
		]
	};
}
async function resolveKeyEntry(params) {
	const { cfg, agentDir, providerRegistry, capability } = params;
	const checkProvider = async (providerId, model) => {
		const provider = getMediaUnderstandingProvider(providerId, providerRegistry);
		if (!provider) return null;
		if (capability === "audio" && !provider.transcribeAudio) return null;
		if (capability === "image" && !provider.describeImage) return null;
		if (capability === "video" && !provider.describeVideo) return null;
		if (!await hasAvailableAuthForProvider({
			provider: providerId,
			cfg,
			agentDir
		})) return null;
		return {
			type: "provider",
			provider: providerId,
			model
		};
	};
	if (capability === "image") {
		const activeProvider = params.activeModel?.provider?.trim();
		if (activeProvider) {
			const activeEntry = await checkProvider(activeProvider, params.activeModel?.model);
			if (activeEntry) return activeEntry;
		}
		for (const providerId of AUTO_IMAGE_KEY_PROVIDERS) {
			const model = DEFAULT_IMAGE_MODELS[providerId];
			const entry = await checkProvider(providerId, model);
			if (entry) return entry;
		}
		return null;
	}
	if (capability === "video") {
		const activeProvider = params.activeModel?.provider?.trim();
		if (activeProvider) {
			const activeEntry = await checkProvider(activeProvider, params.activeModel?.model);
			if (activeEntry) return activeEntry;
		}
		for (const providerId of AUTO_VIDEO_KEY_PROVIDERS) {
			const entry = await checkProvider(providerId, void 0);
			if (entry) return entry;
		}
		return null;
	}
	const activeProvider = params.activeModel?.provider?.trim();
	if (activeProvider) {
		const activeEntry = await checkProvider(activeProvider, params.activeModel?.model);
		if (activeEntry) return activeEntry;
	}
	for (const providerId of AUTO_AUDIO_KEY_PROVIDERS) {
		const entry = await checkProvider(providerId, void 0);
		if (entry) return entry;
	}
	return null;
}
function resolveImageModelFromAgentDefaults(cfg) {
	const refs = [];
	const primary = resolveAgentModelPrimaryValue(cfg.agents?.defaults?.imageModel);
	if (primary?.trim()) refs.push(primary.trim());
	for (const fb of resolveAgentModelFallbackValues(cfg.agents?.defaults?.imageModel)) if (fb?.trim()) refs.push(fb.trim());
	if (refs.length === 0) return [];
	const entries = [];
	for (const ref of refs) {
		const slashIdx = ref.indexOf("/");
		if (slashIdx <= 0 || slashIdx >= ref.length - 1) continue;
		entries.push({
			type: "provider",
			provider: ref.slice(0, slashIdx),
			model: ref.slice(slashIdx + 1)
		});
	}
	return entries;
}
async function resolveAutoEntries(params) {
	const activeEntry = await resolveActiveModelEntry(params);
	if (activeEntry) return [activeEntry];
	if (params.capability === "audio") {
		const localAudio = await resolveLocalAudioEntry();
		if (localAudio) return [localAudio];
	}
	if (params.capability === "image") {
		const imageModelEntries = resolveImageModelFromAgentDefaults(params.cfg);
		if (imageModelEntries.length > 0) return imageModelEntries;
	}
	const gemini = await resolveGeminiCliEntry(params.capability);
	if (gemini) return [gemini];
	const keys = await resolveKeyEntry(params);
	if (keys) return [keys];
	return [];
}
async function resolveAutoImageModel(params) {
	const providerRegistry = buildProviderRegistry(void 0, params.cfg);
	const toActive = (entry) => {
		if (!entry || entry.type === "cli") return null;
		const provider = entry.provider;
		if (!provider) return null;
		const model = entry.model ?? DEFAULT_IMAGE_MODELS[provider];
		if (!model) return null;
		return {
			provider,
			model
		};
	};
	const resolvedActive = toActive(await resolveActiveModelEntry({
		cfg: params.cfg,
		agentDir: params.agentDir,
		providerRegistry,
		capability: "image",
		activeModel: params.activeModel
	}));
	if (resolvedActive) return resolvedActive;
	return toActive(await resolveKeyEntry({
		cfg: params.cfg,
		agentDir: params.agentDir,
		providerRegistry,
		capability: "image",
		activeModel: params.activeModel
	}));
}
async function resolveActiveModelEntry(params) {
	const activeProviderRaw = params.activeModel?.provider?.trim();
	if (!activeProviderRaw) return null;
	const providerId = normalizeMediaProviderId(activeProviderRaw);
	if (!providerId) return null;
	const provider = getMediaUnderstandingProvider(providerId, params.providerRegistry);
	if (!provider) return null;
	if (params.capability === "audio" && !provider.transcribeAudio) return null;
	if (params.capability === "image" && !provider.describeImage) return null;
	if (params.capability === "video" && !provider.describeVideo) return null;
	if (!await hasAvailableAuthForProvider({
		provider: providerId,
		cfg: params.cfg,
		agentDir: params.agentDir
	})) return null;
	return {
		type: "provider",
		provider: providerId,
		model: params.activeModel?.model
	};
}
async function runAttachmentEntries(params) {
	const { entries, capability } = params;
	const attempts = [];
	for (const entry of entries) {
		const entryType = entry.type ?? (entry.command ? "cli" : "provider");
		try {
			const result = entryType === "cli" ? await runCliEntry({
				capability,
				entry,
				cfg: params.cfg,
				ctx: params.ctx,
				attachmentIndex: params.attachmentIndex,
				cache: params.cache,
				config: params.config
			}) : await runProviderEntry({
				capability,
				entry,
				cfg: params.cfg,
				ctx: params.ctx,
				attachmentIndex: params.attachmentIndex,
				cache: params.cache,
				agentDir: params.agentDir,
				providerRegistry: params.providerRegistry,
				config: params.config
			});
			if (result) {
				const decision = buildModelDecision({
					entry,
					entryType,
					outcome: "success"
				});
				if (result.provider) decision.provider = result.provider;
				if (result.model) decision.model = result.model;
				attempts.push(decision);
				return {
					output: result,
					attempts
				};
			}
			attempts.push(buildModelDecision({
				entry,
				entryType,
				outcome: "skipped",
				reason: "empty output"
			}));
		} catch (err) {
			if (isMediaUnderstandingSkipError(err)) {
				attempts.push(buildModelDecision({
					entry,
					entryType,
					outcome: "skipped",
					reason: `${err.reason}: ${err.message}`
				}));
				if (shouldLogVerbose()) logVerbose(`Skipping ${capability} model due to ${err.reason}: ${err.message}`);
				continue;
			}
			attempts.push(buildModelDecision({
				entry,
				entryType,
				outcome: "failed",
				reason: String(err)
			}));
			if (shouldLogVerbose()) logVerbose(`${capability} understanding failed: ${String(err)}`);
		}
	}
	return {
		output: null,
		attempts
	};
}
async function runCapability(params) {
	const { capability, cfg, ctx } = params;
	const config = params.config ?? cfg.tools?.media?.[capability];
	if (config?.enabled === false) return {
		outputs: [],
		decision: {
			capability,
			outcome: "disabled",
			attachments: []
		}
	};
	const attachmentPolicy = config?.attachments;
	const selected = selectAttachments({
		capability,
		attachments: params.media,
		policy: attachmentPolicy
	});
	if (selected.length === 0) return {
		outputs: [],
		decision: {
			capability,
			outcome: "no-attachment",
			attachments: []
		}
	};
	if (resolveScopeDecision({
		scope: config?.scope,
		ctx
	}) === "deny") {
		if (shouldLogVerbose()) logVerbose(`${capability} understanding disabled by scope policy.`);
		return {
			outputs: [],
			decision: {
				capability,
				outcome: "scope-deny",
				attachments: selected.map((item) => ({
					attachmentIndex: item.index,
					attempts: []
				}))
			}
		};
	}
	const activeProvider = params.activeModel?.provider?.trim();
	if (capability === "image" && activeProvider) {
		if (modelSupportsVision(findModelInCatalog(await loadModelCatalog({ config: cfg }), activeProvider, params.activeModel?.model ?? ""))) {
			if (shouldLogVerbose()) logVerbose("Skipping image understanding: primary model supports vision natively");
			const model = params.activeModel?.model?.trim();
			const reason = "primary model supports vision natively";
			return {
				outputs: [],
				decision: {
					capability,
					outcome: "skipped",
					attachments: selected.map((item) => {
						const attempt = {
							type: "provider",
							provider: activeProvider,
							model: model || void 0,
							outcome: "skipped",
							reason
						};
						return {
							attachmentIndex: item.index,
							attempts: [attempt],
							chosen: attempt
						};
					})
				}
			};
		}
	}
	let resolvedEntries = resolveModelEntries({
		cfg,
		capability,
		config,
		providerRegistry: params.providerRegistry
	});
	if (resolvedEntries.length === 0) resolvedEntries = await resolveAutoEntries({
		cfg,
		agentDir: params.agentDir,
		providerRegistry: params.providerRegistry,
		capability,
		activeModel: params.activeModel
	});
	if (resolvedEntries.length === 0) return {
		outputs: [],
		decision: {
			capability,
			outcome: "skipped",
			attachments: selected.map((item) => ({
				attachmentIndex: item.index,
				attempts: []
			}))
		}
	};
	const outputs = [];
	const attachmentDecisions = [];
	for (const attachment of selected) {
		const { output, attempts } = await runAttachmentEntries({
			capability,
			cfg,
			ctx,
			attachmentIndex: attachment.index,
			agentDir: params.agentDir,
			providerRegistry: params.providerRegistry,
			cache: params.attachments,
			entries: resolvedEntries,
			config
		});
		if (output) outputs.push(output);
		attachmentDecisions.push({
			attachmentIndex: attachment.index,
			attempts,
			chosen: attempts.find((attempt) => attempt.outcome === "success")
		});
	}
	const decision = {
		capability,
		outcome: outputs.length > 0 ? "success" : "skipped",
		attachments: attachmentDecisions
	};
	if (shouldLogVerbose()) logVerbose(`Media understanding ${formatDecisionSummary(decision)}`);
	return {
		outputs,
		decision
	};
}
//#endregion
export { isMediaUnderstandingSkipError as _, resolveAutoImageModel as a, resolveAttachmentKind as b, parseFfprobeCodecAndSampleRate as c, runFfprobe as d, MEDIA_FFMPEG_MAX_AUDIO_DURATION_SECS as f, MediaAttachmentCache as g, MEDIA_FFPROBE_TIMEOUT_MS as h, normalizeMediaAttachments as i, parseFfprobeCsvFields as l, MEDIA_FFMPEG_TIMEOUT_MS as m, clearMediaUnderstandingBinaryCacheForTests as n, resolveMediaAttachmentLocalRoots as o, MEDIA_FFMPEG_MAX_BUFFER_BYTES as p, createMediaAttachmentCache as r, runCapability as s, buildProviderRegistry as t, runFfmpeg as u, isAudioAttachment as v, getMediaUnderstandingProvider as x, normalizeAttachments as y };
