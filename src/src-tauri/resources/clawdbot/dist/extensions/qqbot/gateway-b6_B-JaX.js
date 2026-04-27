import { C as formatFileSize, S as downloadFile, _ as isCronReminderPayload, b as normalizeMediaTags, d as sendPhoto, g as encodePayloadForCron, h as sendVoice, l as sendDocument, m as sendVideoMsg, o as registerOutboundAudioAdapter, s as registerOutboundAudioAdapterFactory, u as sendMedia, v as isMediaPayload, x as MAX_UPLOAD_SIZE, y as parseQQBotPayload } from "./outbound-CNhvemR8.js";
import { t as getPlatformAdapter } from "./adapter-DfD2SNGz.js";
import { r as setBridgeLogger, t as ensurePlatformAdapter } from "./bootstrap-DP2UpEF-.js";
import { i as parseApprovalButtonData } from "./approval-cg0SVahb.js";
import { i as normalizeOptionalString, n as normalizeLowercaseStringOrEmpty, o as readStringField, s as sanitizeFileName, t as asOptionalObjectRecord } from "./string-normalize-C6Z4K8Fh.js";
import { C as withTokenRetry, D as formatDuration, E as debugWarn, O as formatErrorMessage, S as stopBackgroundTokenRefresh, T as debugLog, _ as sendText, a as createRawInputNotifyFn, d as initSender, f as onMessageSent, g as sendInputNotify, h as sendImage, i as clearTokenCache, l as getPluginUserAgent, m as sendFileMessage, n as acknowledgeInteraction, o as getAccessToken, p as registerAccount, r as buildDeliveryTarget, s as getGatewayUrl, t as accountToCreds, u as initApiConfig, v as sendVideoMessage, w as debugError, x as startBackgroundTokenRefresh, y as sendVoiceMessage } from "./sender-BZ_TJkxQ.js";
import { n as getQQBotRuntimeForEngine, t as getQQBotRuntime } from "./runtime-BWC3dtWO.js";
import { a as detectFfmpeg, c as getQQBotDataDir, d as getTempDir, f as isLocalPath, h as resolveQQBotPayloadLocalFilePath, i as checkSilkWasmAvailable, l as getQQBotDataPath, m as normalizePath$1, o as getHomeDir, p as isWindows, s as getPlatform, u as getQQBotMediaDir } from "./target-parser-C00R-uf5.js";
import { t as registerTextChunker } from "./text-chunk-jl3-82oM.js";
import { a as registerApproveRuntimeGetter, i as matchSlashCommand, n as runWithRequestContext, o as registerPluginVersion, s as registerVersionResolver } from "./request-context-DM5_RNBD.js";
import * as fs$1 from "node:fs";
import fs from "node:fs";
import * as os$1 from "node:os";
import crypto from "node:crypto";
import * as path$1 from "node:path";
import path from "node:path";
import { execFile } from "node:child_process";
import { resolveRuntimeServiceVersion } from "openclaw/plugin-sdk/cli-runtime";
import WebSocket from "ws";
import { Buffer as Buffer$1 } from "node:buffer";
import { fileURLToPath } from "node:url";
//#region extensions/qqbot/src/engine/ref/format-ref-entry.ts
/** Format a ref-index entry into text suitable for model context. */
function formatRefEntryForAgent(entry) {
	const parts = [];
	if (entry.content.trim()) parts.push(entry.content);
	if (entry.attachments?.length) for (const att of entry.attachments) {
		const sourceHint = att.localPath ? ` (${att.localPath})` : att.url ? ` (${att.url})` : "";
		switch (att.type) {
			case "image":
				parts.push(`[image${att.filename ? `: ${att.filename}` : ""}${sourceHint}]`);
				break;
			case "voice":
				if (att.transcript) {
					const sourceTag = att.transcriptSource ? ` - ${{
						stt: "local STT",
						asr: "platform ASR",
						tts: "TTS source",
						fallback: "fallback text"
					}[att.transcriptSource] || att.transcriptSource}` : "";
					parts.push(`[voice message (content: "${att.transcript}"${sourceTag})${sourceHint}]`);
				} else parts.push(`[voice message${sourceHint}]`);
				break;
			case "video":
				parts.push(`[video${att.filename ? `: ${att.filename}` : ""}${sourceHint}]`);
				break;
			case "file":
				parts.push(`[file${att.filename ? `: ${att.filename}` : ""}${sourceHint}]`);
				break;
			default: parts.push(`[attachment${att.filename ? `: ${att.filename}` : ""}${sourceHint}]`);
		}
	}
	return parts.join(" ") || "[empty message]";
}
//#endregion
//#region extensions/qqbot/src/engine/ref/store.ts
/**
* Ref-index store — JSONL file-based store for message reference index.
*
* Migrated from src/ref-index-store.ts. Dependencies are only Node.js
* built-ins + log + platform (both zero plugin-sdk).
*/
const MAX_ENTRIES = 5e4;
const TTL_MS = 10080 * 60 * 1e3;
const COMPACT_THRESHOLD_RATIO = 2;
let cache = null;
let totalLinesOnDisk = 0;
function getRefIndexFile() {
	return path.join(getQQBotDataPath("data"), "ref-index.jsonl");
}
function loadFromFile() {
	if (cache !== null) return cache;
	cache = /* @__PURE__ */ new Map();
	totalLinesOnDisk = 0;
	try {
		const refIndexFile = getRefIndexFile();
		if (!fs.existsSync(refIndexFile)) return cache;
		const lines = fs.readFileSync(refIndexFile, "utf-8").split("\n");
		const now = Date.now();
		let expired = 0;
		for (const line of lines) {
			const trimmed = line.trim();
			if (!trimmed) continue;
			totalLinesOnDisk++;
			try {
				const entry = JSON.parse(trimmed);
				if (!entry.k || !entry.v || !entry.t) continue;
				if (now - entry.t > TTL_MS) {
					expired++;
					continue;
				}
				cache.set(entry.k, {
					...entry.v,
					_createdAt: entry.t
				});
			} catch {}
		}
		debugLog(`[ref-index-store] Loaded ${cache.size} entries from ${totalLinesOnDisk} lines (${expired} expired)`);
		if (shouldCompact()) compactFile();
	} catch (err) {
		debugError(`[ref-index-store] Failed to load: ${formatErrorMessage(err)}`);
		cache = /* @__PURE__ */ new Map();
	}
	return cache;
}
function ensureDir$2() {
	getQQBotDataDir("data");
}
function appendLine(line) {
	try {
		ensureDir$2();
		fs.appendFileSync(getRefIndexFile(), JSON.stringify(line) + "\n", "utf-8");
		totalLinesOnDisk++;
	} catch (err) {
		debugError(`[ref-index-store] Failed to append: ${formatErrorMessage(err)}`);
	}
}
function shouldCompact() {
	return !!cache && totalLinesOnDisk > cache.size * COMPACT_THRESHOLD_RATIO && totalLinesOnDisk > 1e3;
}
function compactFile() {
	if (!cache) return;
	const before = totalLinesOnDisk;
	try {
		ensureDir$2();
		const refIndexFile = getRefIndexFile();
		const tmpPath = refIndexFile + ".tmp";
		const lines = [];
		for (const [key, entry] of cache) lines.push(JSON.stringify({
			k: key,
			v: {
				content: entry.content,
				senderId: entry.senderId,
				senderName: entry.senderName,
				timestamp: entry.timestamp,
				isBot: entry.isBot,
				attachments: entry.attachments
			},
			t: entry._createdAt
		}));
		fs.writeFileSync(tmpPath, lines.join("\n") + "\n", "utf-8");
		fs.renameSync(tmpPath, refIndexFile);
		totalLinesOnDisk = cache.size;
		debugLog(`[ref-index-store] Compacted: ${before} lines → ${totalLinesOnDisk} lines`);
	} catch (err) {
		debugError(`[ref-index-store] Compact failed: ${formatErrorMessage(err)}`);
	}
}
function evictIfNeeded() {
	if (!cache || cache.size < MAX_ENTRIES) return;
	const now = Date.now();
	for (const [key, entry] of cache) if (now - entry._createdAt > TTL_MS) cache.delete(key);
	if (cache.size >= MAX_ENTRIES) {
		const toRemove = [...cache.entries()].toSorted((a, b) => a[1]._createdAt - b[1]._createdAt).slice(0, cache.size - MAX_ENTRIES + 1e3);
		for (const [key] of toRemove) cache.delete(key);
		debugLog(`[ref-index-store] Evicted ${toRemove.length} oldest entries`);
	}
}
/** Persist a refIdx mapping for one message. */
function setRefIndex(refIdx, entry) {
	const store = loadFromFile();
	evictIfNeeded();
	const now = Date.now();
	store.set(refIdx, {
		...entry,
		_createdAt: now
	});
	appendLine({
		k: refIdx,
		v: {
			content: entry.content,
			senderId: entry.senderId,
			senderName: entry.senderName,
			timestamp: entry.timestamp,
			isBot: entry.isBot,
			attachments: entry.attachments
		},
		t: now
	});
	if (shouldCompact()) compactFile();
}
/** Look up one quoted message by refIdx. */
function getRefIndex(refIdx) {
	const store = loadFromFile();
	const entry = store.get(refIdx);
	if (!entry) return null;
	if (Date.now() - entry._createdAt > TTL_MS) {
		store.delete(refIdx);
		return null;
	}
	return {
		content: entry.content,
		senderId: entry.senderId,
		senderName: entry.senderName,
		timestamp: entry.timestamp,
		isBot: entry.isBot,
		attachments: entry.attachments
	};
}
/** Compact the store before process exit when needed. */
function flushRefIndex() {
	if (cache && shouldCompact()) compactFile();
}
//#endregion
//#region extensions/qqbot/src/engine/utils/audio.ts
/**
* Audio format conversion utilities.
* 音频格式转换工具。
*
* Handles SILK ↔ PCM ↔ WAV ↔ MP3 conversions for QQ Bot voice messaging.
* Prefers ffmpeg when available; falls back to WASM decoders (silk-wasm,
* mpg123-decoder) for environments without native tooling.
*
* Self-contained within engine/ — no framework SDK dependency.
*/
let _silkWasmPromise = null;
/** Lazy-load the silk-wasm module (singleton cache; returns null on failure). */
function loadSilkWasm() {
	if (_silkWasmPromise) return _silkWasmPromise;
	_silkWasmPromise = import("silk-wasm").catch((err) => {
		debugWarn(`[audio-convert] silk-wasm not available; SILK encode/decode disabled (${formatErrorMessage(err)})`);
		return null;
	});
	return _silkWasmPromise;
}
/** Wrap raw PCM s16le data into a standard WAV file. */
function pcmToWav(pcmData, sampleRate, channels = 1, bitsPerSample = 16) {
	const byteRate = sampleRate * channels * (bitsPerSample / 8);
	const blockAlign = channels * (bitsPerSample / 8);
	const dataSize = pcmData.length;
	const headerSize = 44;
	const fileSize = headerSize + dataSize;
	const buffer = Buffer.alloc(fileSize);
	buffer.write("RIFF", 0);
	buffer.writeUInt32LE(fileSize - 8, 4);
	buffer.write("WAVE", 8);
	buffer.write("fmt ", 12);
	buffer.writeUInt32LE(16, 16);
	buffer.writeUInt16LE(1, 20);
	buffer.writeUInt16LE(channels, 22);
	buffer.writeUInt32LE(sampleRate, 24);
	buffer.writeUInt32LE(byteRate, 28);
	buffer.writeUInt16LE(blockAlign, 32);
	buffer.writeUInt16LE(bitsPerSample, 34);
	buffer.write("data", 36);
	buffer.writeUInt32LE(dataSize, 40);
	Buffer.from(pcmData.buffer, pcmData.byteOffset, pcmData.byteLength).copy(buffer, headerSize);
	return buffer;
}
/** Strip the AMR header that may be present in QQ voice payloads. */
function stripAmrHeader(buf) {
	const AMR_HEADER = Buffer.from("#!AMR\n");
	if (buf.length > 6 && buf.subarray(0, 6).equals(AMR_HEADER)) return buf.subarray(6);
	return buf;
}
/** Convert a SILK or AMR voice file to WAV format. */
async function convertSilkToWav(inputPath, outputDir) {
	if (!fs$1.existsSync(inputPath)) return null;
	const strippedBuf = stripAmrHeader(fs$1.readFileSync(inputPath));
	const rawData = new Uint8Array(strippedBuf.buffer, strippedBuf.byteOffset, strippedBuf.byteLength);
	const silk = await loadSilkWasm();
	if (!silk || !silk.isSilk(rawData)) return null;
	const sampleRate = 24e3;
	const result = await silk.decode(rawData, sampleRate);
	const wavBuffer = pcmToWav(result.data, sampleRate);
	const dir = outputDir || path$1.dirname(inputPath);
	if (!fs$1.existsSync(dir)) fs$1.mkdirSync(dir, { recursive: true });
	const baseName = path$1.basename(inputPath, path$1.extname(inputPath));
	const wavPath = path$1.join(dir, `${baseName}.wav`);
	fs$1.writeFileSync(wavPath, wavBuffer);
	return {
		wavPath,
		duration: result.duration
	};
}
/** Check whether an attachment is a voice file (by MIME type or extension). */
function isVoiceAttachment(att) {
	if (att.content_type === "voice" || att.content_type?.startsWith("audio/")) return true;
	const ext = att.filename ? normalizeLowercaseStringOrEmpty(path$1.extname(att.filename)) : "";
	return [
		".amr",
		".silk",
		".slk",
		".slac"
	].includes(ext);
}
/** Check whether a file path is a known audio format. */
function isAudioFile(filePath, mimeType) {
	if (mimeType) {
		if (mimeType === "voice" || mimeType.startsWith("audio/")) return true;
	}
	const ext = normalizeLowercaseStringOrEmpty(path$1.extname(filePath));
	return [
		".silk",
		".slk",
		".amr",
		".wav",
		".mp3",
		".ogg",
		".opus",
		".aac",
		".flac",
		".m4a",
		".wma",
		".pcm"
	].includes(ext);
}
const QQ_NATIVE_VOICE_MIMES = new Set([
	"audio/silk",
	"audio/amr",
	"audio/wav",
	"audio/wave",
	"audio/x-wav",
	"audio/mpeg",
	"audio/mp3"
]);
const QQ_NATIVE_VOICE_EXTS = new Set([
	".silk",
	".slk",
	".amr",
	".wav",
	".mp3"
]);
/** Check whether a voice file needs transcoding for upload (QQ-native formats skip it). */
function shouldTranscodeVoice(filePath, mimeType) {
	if (mimeType && QQ_NATIVE_VOICE_MIMES.has(normalizeLowercaseStringOrEmpty(mimeType))) return false;
	const ext = normalizeLowercaseStringOrEmpty(path$1.extname(filePath));
	if (QQ_NATIVE_VOICE_EXTS.has(ext)) return false;
	return isAudioFile(filePath, mimeType);
}
const QQ_NATIVE_UPLOAD_FORMATS = [
	".wav",
	".mp3",
	".silk"
];
function normalizeFormats(formats) {
	return formats.map((f) => {
		const lower = normalizeLowercaseStringOrEmpty(f);
		return lower.startsWith(".") ? lower : `.${lower}`;
	});
}
/**
* Convert a local audio file to Base64-encoded SILK for QQ API upload.
*
* Attempts conversion via ffmpeg → WASM decoders → null fallback chain.
*/
async function audioFileToSilkBase64(filePath, directUploadFormats) {
	if (!fs$1.existsSync(filePath)) return null;
	const buf = fs$1.readFileSync(filePath);
	if (buf.length === 0) {
		debugError(`[audio-convert] file is empty: ${filePath}`);
		return null;
	}
	const ext = normalizeLowercaseStringOrEmpty(path$1.extname(filePath));
	if ((directUploadFormats ? normalizeFormats(directUploadFormats) : QQ_NATIVE_UPLOAD_FORMATS).includes(ext)) {
		debugLog(`[audio-convert] direct upload (QQ native format): ${ext} (${buf.length} bytes)`);
		return buf.toString("base64");
	}
	if ([".slk", ".slac"].includes(ext)) {
		const stripped = stripAmrHeader(buf);
		const raw = new Uint8Array(stripped.buffer, stripped.byteOffset, stripped.byteLength);
		if ((await loadSilkWasm())?.isSilk(raw)) {
			debugLog(`[audio-convert] SILK file, direct use: ${filePath} (${buf.length} bytes)`);
			return buf.toString("base64");
		}
	}
	const rawCheck = new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength);
	const strippedCheck = stripAmrHeader(buf);
	const strippedRaw = new Uint8Array(strippedCheck.buffer, strippedCheck.byteOffset, strippedCheck.byteLength);
	const silkForCheck = await loadSilkWasm();
	if (silkForCheck?.isSilk(rawCheck) || silkForCheck?.isSilk(strippedRaw)) {
		debugLog(`[audio-convert] SILK detected by header: ${filePath} (${buf.length} bytes)`);
		return buf.toString("base64");
	}
	const targetRate = 24e3;
	const ffmpegCmd = await detectFfmpeg();
	if (ffmpegCmd) try {
		debugLog(`[audio-convert] ffmpeg (${ffmpegCmd}): converting ${ext} (${buf.length} bytes) → PCM s16le ${targetRate}Hz`);
		const pcmBuf = await ffmpegToPCM(ffmpegCmd, filePath, targetRate);
		if (pcmBuf.length === 0) {
			debugError(`[audio-convert] ffmpeg produced empty PCM output`);
			return null;
		}
		const { silkBuffer } = await pcmToSilk(pcmBuf, targetRate);
		debugLog(`[audio-convert] ffmpeg: ${ext} → SILK done (${silkBuffer.length} bytes)`);
		return silkBuffer.toString("base64");
	} catch (err) {
		debugError(`[audio-convert] ffmpeg conversion failed: ${formatErrorMessage(err)}`);
	}
	debugLog(`[audio-convert] fallback: trying WASM decoders for ${ext}`);
	if (ext === ".pcm") {
		const { silkBuffer } = await pcmToSilk(Buffer.from(buf.buffer, buf.byteOffset, buf.byteLength), targetRate);
		return silkBuffer.toString("base64");
	}
	if (ext === ".wav" || buf.length >= 4 && buf.toString("ascii", 0, 4) === "RIFF") {
		const wavInfo = parseWavFallback(buf);
		if (wavInfo) {
			const { silkBuffer } = await pcmToSilk(wavInfo, targetRate);
			return silkBuffer.toString("base64");
		}
	}
	if (ext === ".mp3" || ext === ".mpeg") {
		const pcmBuf = await wasmDecodeMp3ToPCM(buf, targetRate);
		if (pcmBuf) {
			const { silkBuffer } = await pcmToSilk(pcmBuf, targetRate);
			debugLog(`[audio-convert] WASM: MP3 → SILK done (${silkBuffer.length} bytes)`);
			return silkBuffer.toString("base64");
		}
	}
	debugError(`[audio-convert] unsupported format: ${ext} (no ffmpeg available). ${isWindows() ? "Install ffmpeg with choco install ffmpeg, scoop install ffmpeg, or from https://ffmpeg.org" : process.platform === "darwin" ? "Install ffmpeg with brew install ffmpeg" : "Install ffmpeg with sudo apt install ffmpeg or sudo yum install ffmpeg"}`);
	return null;
}
/**
* Wait for a file to appear and stabilize, then return its final size.
*
* Polls at `pollMs` intervals; returns 0 on timeout or persistent empty file.
*/
async function waitForFile(filePath, timeoutMs = 3e4, pollMs = 500) {
	const start = Date.now();
	let lastSize = -1;
	let stableCount = 0;
	let fileExists = false;
	let fileAppearedAt = 0;
	let pollCount = 0;
	const emptyGiveUpMs = 1e4;
	const noFileGiveUpMs = 15e3;
	while (Date.now() - start < timeoutMs) {
		pollCount++;
		try {
			const stat = fs$1.statSync(filePath);
			if (!fileExists) {
				fileExists = true;
				fileAppearedAt = Date.now();
				debugLog(`[audio-convert] waitForFile: file appeared (${stat.size} bytes, after ${Date.now() - start}ms): ${path$1.basename(filePath)}`);
			}
			if (stat.size > 0) {
				if (stat.size === lastSize) {
					stableCount++;
					if (stableCount >= 2) {
						debugLog(`[audio-convert] waitForFile: ready (${stat.size} bytes, waited ${Date.now() - start}ms, polls=${pollCount})`);
						return stat.size;
					}
				} else stableCount = 0;
				lastSize = stat.size;
			} else if (Date.now() - fileAppearedAt > emptyGiveUpMs) {
				debugError(`[audio-convert] waitForFile: file still empty after ${emptyGiveUpMs}ms, giving up: ${path$1.basename(filePath)}`);
				return 0;
			}
		} catch {
			if (!fileExists && Date.now() - start > noFileGiveUpMs) {
				debugError(`[audio-convert] waitForFile: file never appeared after ${noFileGiveUpMs}ms, giving up: ${path$1.basename(filePath)}`);
				return 0;
			}
		}
		await new Promise((r) => setTimeout(r, pollMs));
	}
	try {
		const finalStat = fs$1.statSync(filePath);
		if (finalStat.size > 0) {
			debugWarn(`[audio-convert] waitForFile: timeout but file has data (${finalStat.size} bytes), using it`);
			return finalStat.size;
		}
		debugError(`[audio-convert] waitForFile: timeout after ${timeoutMs}ms, file exists but empty (0 bytes): ${path$1.basename(filePath)}`);
	} catch {
		debugError(`[audio-convert] waitForFile: timeout after ${timeoutMs}ms, file never appeared: ${path$1.basename(filePath)}`);
	}
	return 0;
}
/** Encode PCM s16le data into SILK format. */
async function pcmToSilk(pcmBuffer, sampleRate) {
	const silk = await loadSilkWasm();
	if (!silk) throw new Error("silk-wasm is not available; cannot encode PCM to SILK");
	const pcmData = new Uint8Array(pcmBuffer.buffer, pcmBuffer.byteOffset, pcmBuffer.byteLength);
	const result = await silk.encode(pcmData, sampleRate);
	return {
		silkBuffer: Buffer.from(result.data.buffer, result.data.byteOffset, result.data.byteLength),
		duration: result.duration
	};
}
/** Use ffmpeg to convert any audio to mono 24 kHz PCM s16le. */
function ffmpegToPCM(ffmpegCmd, inputPath, sampleRate = 24e3) {
	return new Promise((resolve, reject) => {
		execFile(ffmpegCmd, [
			"-i",
			inputPath,
			"-f",
			"s16le",
			"-ar",
			String(sampleRate),
			"-ac",
			"1",
			"-acodec",
			"pcm_s16le",
			"-v",
			"error",
			"pipe:1"
		], {
			maxBuffer: 50 * 1024 * 1024,
			encoding: "buffer",
			...isWindows() ? { windowsHide: true } : {}
		}, (err, stdout) => {
			if (err) {
				reject(/* @__PURE__ */ new Error(`ffmpeg failed: ${err.message}`));
				return;
			}
			resolve(stdout);
		});
	});
}
/** Decode MP3 to PCM via mpg123-decoder WASM (fallback when ffmpeg is unavailable). */
async function wasmDecodeMp3ToPCM(buf, targetRate) {
	try {
		const { MPEGDecoder } = await import("mpg123-decoder");
		debugLog(`[audio-convert] WASM MP3 decode: size=${buf.length} bytes`);
		const decoder = new MPEGDecoder();
		await decoder.ready;
		const decoded = decoder.decode(new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength));
		decoder.free();
		if (decoded.samplesDecoded === 0 || decoded.channelData.length === 0) {
			debugError(`[audio-convert] WASM MP3 decode: no samples (samplesDecoded=${decoded.samplesDecoded})`);
			return null;
		}
		debugLog(`[audio-convert] WASM MP3 decode: samples=${decoded.samplesDecoded}, sampleRate=${decoded.sampleRate}, channels=${decoded.channelData.length}`);
		let floatMono;
		if (decoded.channelData.length === 1) floatMono = decoded.channelData[0];
		else {
			floatMono = new Float32Array(decoded.samplesDecoded);
			const channels = decoded.channelData.length;
			for (let i = 0; i < decoded.samplesDecoded; i++) {
				let sum = 0;
				for (let ch = 0; ch < channels; ch++) sum += decoded.channelData[ch][i];
				floatMono[i] = sum / channels;
			}
		}
		const s16 = new Uint8Array(floatMono.length * 2);
		const view = new DataView(s16.buffer);
		for (let i = 0; i < floatMono.length; i++) {
			const clamped = Math.max(-1, Math.min(1, floatMono[i]));
			const val = clamped < 0 ? clamped * 32768 : clamped * 32767;
			view.setInt16(i * 2, Math.round(val), true);
		}
		let pcm = s16;
		if (decoded.sampleRate !== targetRate) {
			const inputSamples = s16.length / 2;
			const outputSamples = Math.round(inputSamples * targetRate / decoded.sampleRate);
			const output = new Uint8Array(outputSamples * 2);
			const inView = new DataView(s16.buffer, s16.byteOffset, s16.byteLength);
			const outView = new DataView(output.buffer, output.byteOffset, output.byteLength);
			for (let i = 0; i < outputSamples; i++) {
				const srcIdx = i * decoded.sampleRate / targetRate;
				const idx0 = Math.floor(srcIdx);
				const idx1 = Math.min(idx0 + 1, inputSamples - 1);
				const frac = srcIdx - idx0;
				const s0 = inView.getInt16(idx0 * 2, true);
				const s1 = inView.getInt16(idx1 * 2, true);
				const sample = Math.round(s0 + (s1 - s0) * frac);
				outView.setInt16(i * 2, Math.max(-32768, Math.min(32767, sample)), true);
			}
			pcm = output;
		}
		return Buffer.from(pcm.buffer, pcm.byteOffset, pcm.byteLength);
	} catch (err) {
		debugError(`[audio-convert] WASM MP3 decode failed: ${formatErrorMessage(err)}`);
		if (err instanceof Error && err.stack) debugError(`[audio-convert] stack: ${err.stack}`);
		return null;
	}
}
/** Parse a standard PCM WAV and extract mono 24 kHz PCM data (fallback without ffmpeg). */
function parseWavFallback(buf) {
	if (buf.length < 44) return null;
	if (buf.toString("ascii", 0, 4) !== "RIFF") return null;
	if (buf.toString("ascii", 8, 12) !== "WAVE") return null;
	if (buf.toString("ascii", 12, 16) !== "fmt ") return null;
	if (buf.readUInt16LE(20) !== 1) return null;
	const channels = buf.readUInt16LE(22);
	const sampleRate = buf.readUInt32LE(24);
	if (buf.readUInt16LE(34) !== 16) return null;
	let offset = 36;
	while (offset < buf.length - 8) {
		const chunkId = buf.toString("ascii", offset, offset + 4);
		const chunkSize = buf.readUInt32LE(offset + 4);
		if (chunkId === "data") {
			const dataStart = offset + 8;
			const dataEnd = Math.min(dataStart + chunkSize, buf.length);
			let pcm = new Uint8Array(buf.buffer, buf.byteOffset + dataStart, dataEnd - dataStart);
			if (channels > 1) {
				const samplesPerCh = pcm.length / (2 * channels);
				const mono = new Uint8Array(samplesPerCh * 2);
				const inV = new DataView(pcm.buffer, pcm.byteOffset, pcm.byteLength);
				const outV = new DataView(mono.buffer, mono.byteOffset, mono.byteLength);
				for (let i = 0; i < samplesPerCh; i++) {
					let sum = 0;
					for (let ch = 0; ch < channels; ch++) sum += inV.getInt16((i * channels + ch) * 2, true);
					outV.setInt16(i * 2, Math.max(-32768, Math.min(32767, Math.round(sum / channels))), true);
				}
				pcm = mono;
			}
			const targetRate = 24e3;
			if (sampleRate !== targetRate) {
				const inSamples = pcm.length / 2;
				const outSamples = Math.round(inSamples * targetRate / sampleRate);
				const out = new Uint8Array(outSamples * 2);
				const inV = new DataView(pcm.buffer, pcm.byteOffset, pcm.byteLength);
				const outV = new DataView(out.buffer, out.byteOffset, out.byteLength);
				for (let i = 0; i < outSamples; i++) {
					const src = i * sampleRate / targetRate;
					const i0 = Math.floor(src);
					const i1 = Math.min(i0 + 1, inSamples - 1);
					const f = src - i0;
					const s0 = inV.getInt16(i0 * 2, true);
					const s1 = inV.getInt16(i1 * 2, true);
					outV.setInt16(i * 2, Math.max(-32768, Math.min(32767, Math.round(s0 + (s1 - s0) * f))), true);
				}
				pcm = out;
			}
			return Buffer.from(pcm.buffer, pcm.byteOffset, pcm.byteLength);
		}
		offset += 8 + chunkSize;
	}
	return null;
}
//#endregion
//#region extensions/qqbot/src/engine/utils/diagnostics.ts
/**
* Gateway startup diagnostics — extracted from utils/platform.ts.
*
* Depends on utils/platform.ts for detection functions, but no plugin-sdk.
*/
/**
* Run startup diagnostics and return an environment report.
* Called during gateway startup to log environment details and warnings.
*/
async function runDiagnostics() {
	const warnings = [];
	const platform = `${process.platform} (${os$1.release()})`;
	const arch = process.arch;
	const nodeVersion = process.version;
	const homeDir = getHomeDir();
	const tempDir = getTempDir();
	const dataDir = getQQBotDataDir();
	const ffmpegPath = await detectFfmpeg();
	if (!ffmpegPath) warnings.push(isWindows() ? "⚠️ ffmpeg is not installed. Audio/video conversion will be limited. Install it with choco install ffmpeg, scoop install ffmpeg, or from https://ffmpeg.org." : getPlatform() === "darwin" ? "⚠️ ffmpeg is not installed. Audio/video conversion will be limited. Install it with brew install ffmpeg." : "⚠️ ffmpeg is not installed. Audio/video conversion will be limited. Install it with sudo apt install ffmpeg or sudo yum install ffmpeg.");
	const silkWasm = await checkSilkWasmAvailable();
	if (!silkWasm) warnings.push("⚠️ silk-wasm is unavailable. QQ voice send/receive will not work. Ensure Node.js >= 16 and WASM support are available.");
	try {
		const testFile = path$1.join(dataDir, ".write-test");
		fs$1.writeFileSync(testFile, "test");
		fs$1.unlinkSync(testFile);
	} catch {
		warnings.push(`⚠️ Data directory is not writable: ${dataDir}. Check filesystem permissions.`);
	}
	if (isWindows()) {
		if (/[\u4e00-\u9fa5]/.test(homeDir) || homeDir.includes(" ")) warnings.push(`⚠️ Home directory contains Chinese characters or spaces: ${homeDir}. Some tools may fail. Consider setting QQBOT_DATA_DIR to an ASCII-only path.`);
	}
	const report = {
		platform,
		arch,
		nodeVersion,
		homeDir,
		tempDir,
		dataDir,
		ffmpeg: ffmpegPath,
		silkWasm,
		warnings
	};
	debugLog("=== QQBot Environment Diagnostics ===");
	debugLog(`  Platform: ${platform} (${arch})`);
	debugLog(`  Node: ${nodeVersion}`);
	debugLog(`  Home: ${homeDir}`);
	debugLog(`  Data dir: ${dataDir}`);
	debugLog(`  ffmpeg: ${ffmpegPath ?? "not installed"}`);
	debugLog(`  silk-wasm: ${silkWasm ? "available" : "unavailable"}`);
	if (warnings.length > 0) {
		debugLog("  --- Warnings ---");
		for (const w of warnings) debugLog(`  ${w}`);
	}
	debugLog("======================");
	return report;
}
//#endregion
//#region extensions/qqbot/src/engine/commands/slash-command-handler.ts
const URGENT_COMMANDS = ["/stop"];
/**
* Check if the message is a slash command and handle it.
*
* @returns `true` if handled (command executed or enqueued as urgent),
*          `false` if the message should be queued for normal processing.
*/
async function trySlashCommand(msg, ctx) {
	const { account, log } = ctx;
	const content = (msg.content ?? "").trim();
	if (!content.startsWith("/")) return "enqueue";
	const contentLower = content.toLowerCase();
	if (URGENT_COMMANDS.some((cmd) => contentLower === cmd.toLowerCase() || contentLower.startsWith(cmd.toLowerCase() + " "))) {
		log?.info(`Urgent command detected: ${content.slice(0, 20)}`);
		return "urgent";
	}
	const receivedAt = Date.now();
	const peerId = ctx.getMessagePeerId(msg);
	const cmdCtx = {
		type: msg.type,
		senderId: msg.senderId,
		senderName: msg.senderName,
		messageId: msg.messageId,
		eventTimestamp: msg.timestamp,
		receivedAt,
		rawContent: content,
		args: "",
		channelId: msg.channelId,
		groupOpenid: msg.groupOpenid,
		accountId: account.accountId,
		appId: account.appId,
		accountConfig: account.config,
		commandAuthorized: true,
		queueSnapshot: ctx.getQueueSnapshot(peerId)
	};
	try {
		const reply = await matchSlashCommand(cmdCtx);
		if (reply === null) return "enqueue";
		log?.debug?.(`Slash command matched: ${content}`);
		const isFileResult = typeof reply === "object" && reply !== null && "filePath" in reply;
		const replyText = isFileResult ? reply.text : reply;
		const replyFile = isFileResult ? reply.filePath : null;
		if (msg.type === "c2c" || msg.type === "group" || msg.type === "dm" || msg.type === "guild") await sendText(buildDeliveryTarget(msg), replyText, accountToCreds(account), { msgId: msg.messageId });
		if (replyFile) try {
			await sendDocument({
				targetType: msg.type === "group" ? "group" : msg.type === "dm" ? "dm" : msg.type === "c2c" ? "c2c" : "channel",
				targetId: msg.type === "group" ? msg.groupOpenid || msg.senderId : msg.type === "dm" ? msg.guildId || msg.senderId : msg.type === "c2c" ? msg.senderId : msg.channelId || msg.senderId,
				account,
				replyToId: msg.messageId
			}, replyFile);
		} catch (fileErr) {
			log?.error(`Failed to send slash command file: ${String(fileErr)}`);
		}
		return "handled";
	} catch (err) {
		log?.error(`Slash command error: ${String(err)}`);
		return "enqueue";
	}
}
//#endregion
//#region extensions/qqbot/src/engine/session/known-users.ts
/**
* Known user tracking — JSON file-based store.
*
* Migrated from src/known-users.ts. Dependencies are only Node.js
* built-ins + log + platform (both zero plugin-sdk).
*/
let usersCache = null;
const SAVE_THROTTLE_MS$1 = 5e3;
let saveTimer = null;
let isDirty = false;
function ensureDir$1() {
	getQQBotDataDir("data");
}
function getKnownUsersFile() {
	return path.join(getQQBotDataPath("data"), "known-users.json");
}
function makeUserKey(user) {
	const base = `${user.accountId}:${user.type}:${user.openid}`;
	return user.type === "group" && user.groupOpenid ? `${base}:${user.groupOpenid}` : base;
}
function loadUsersFromFile() {
	if (usersCache !== null) return usersCache;
	usersCache = /* @__PURE__ */ new Map();
	try {
		const knownUsersFile = getKnownUsersFile();
		if (fs.existsSync(knownUsersFile)) {
			const data = fs.readFileSync(knownUsersFile, "utf-8");
			const users = JSON.parse(data);
			for (const user of users) usersCache.set(makeUserKey(user), user);
			debugLog(`[known-users] Loaded ${usersCache.size} users`);
		}
	} catch (err) {
		debugError(`[known-users] Failed to load users: ${formatErrorMessage(err)}`);
		usersCache = /* @__PURE__ */ new Map();
	}
	return usersCache;
}
function saveUsersToFile() {
	if (!isDirty || saveTimer) return;
	saveTimer = setTimeout(() => {
		saveTimer = null;
		doSaveUsersToFile();
	}, SAVE_THROTTLE_MS$1);
}
function doSaveUsersToFile() {
	if (!usersCache || !isDirty) return;
	try {
		ensureDir$1();
		fs.writeFileSync(getKnownUsersFile(), JSON.stringify(Array.from(usersCache.values()), null, 2), "utf-8");
		isDirty = false;
	} catch (err) {
		debugError(`[known-users] Failed to save users: ${formatErrorMessage(err)}`);
	}
}
/** Flush pending writes immediately, typically during shutdown. */
function flushKnownUsers() {
	if (saveTimer) {
		clearTimeout(saveTimer);
		saveTimer = null;
	}
	doSaveUsersToFile();
}
/** Record a known user whenever a message is received. */
function recordKnownUser(user) {
	const cache = loadUsersFromFile();
	const key = makeUserKey(user);
	const now = Date.now();
	const existing = cache.get(key);
	if (existing) {
		existing.lastSeenAt = now;
		existing.interactionCount++;
		if (user.nickname && user.nickname !== existing.nickname) existing.nickname = user.nickname;
	} else {
		cache.set(key, {
			openid: user.openid,
			type: user.type,
			nickname: user.nickname,
			groupOpenid: user.groupOpenid,
			accountId: user.accountId,
			firstSeenAt: now,
			lastSeenAt: now,
			interactionCount: 1
		});
		debugLog(`[known-users] New user: ${user.openid} (${user.type})`);
	}
	isDirty = true;
	saveUsersToFile();
}
//#endregion
//#region extensions/qqbot/src/engine/session/session-store.ts
/**
* Gateway session persistence — JSONL file-based store.
*
* Migrated from src/session-store.ts. Dependencies are only Node.js
* built-ins + log + platform (both zero plugin-sdk).
*/
const SESSION_EXPIRE_TIME = 300 * 1e3;
const SAVE_THROTTLE_MS = 1e3;
const throttleState = /* @__PURE__ */ new Map();
function ensureDir() {
	getQQBotDataDir("sessions");
}
function getSessionDir() {
	return getQQBotDataPath("sessions");
}
function encodeAccountIdForFileName(accountId) {
	return Buffer.from(accountId, "utf8").toString("base64url");
}
function getLegacySessionPath(accountId) {
	const safeId = accountId.replace(/[^a-zA-Z0-9_-]/g, "_");
	return path.join(getSessionDir(), `session-${safeId}.json`);
}
function getSessionPath(accountId) {
	const encodedId = encodeAccountIdForFileName(accountId);
	return path.join(getSessionDir(), `session-${encodedId}.json`);
}
function getCandidateSessionPaths(accountId) {
	const primaryPath = getSessionPath(accountId);
	const legacyPath = getLegacySessionPath(accountId);
	return primaryPath === legacyPath ? [primaryPath] : [primaryPath, legacyPath];
}
/** Load a saved session, rejecting expired or mismatched appId entries. */
function loadSession(accountId, expectedAppId) {
	try {
		let filePath = null;
		for (const candidatePath of getCandidateSessionPaths(accountId)) if (fs.existsSync(candidatePath)) {
			filePath = candidatePath;
			break;
		}
		if (!filePath) return null;
		const data = fs.readFileSync(filePath, "utf-8");
		const state = JSON.parse(data);
		const now = Date.now();
		if (now - state.savedAt > SESSION_EXPIRE_TIME) {
			debugLog(`[session-store] Session expired for ${accountId}, age: ${Math.round((now - state.savedAt) / 1e3)}s`);
			try {
				fs.unlinkSync(filePath);
			} catch {}
			return null;
		}
		if (expectedAppId && state.appId && state.appId !== expectedAppId) {
			debugLog(`[session-store] appId mismatch for ${accountId}: saved=${state.appId}, current=${expectedAppId}. Discarding stale session.`);
			try {
				fs.unlinkSync(filePath);
			} catch {}
			return null;
		}
		if (!state.sessionId || state.lastSeq === null || state.lastSeq === void 0) {
			debugLog(`[session-store] Invalid session data for ${accountId}`);
			return null;
		}
		debugLog(`[session-store] Loaded session for ${accountId}: sessionId=${state.sessionId}, lastSeq=${state.lastSeq}, appId=${state.appId ?? "unknown"}, age=${Math.round((now - state.savedAt) / 1e3)}s`);
		return state;
	} catch (err) {
		debugError(`[session-store] Failed to load session for ${accountId}: ${formatErrorMessage(err)}`);
		return null;
	}
}
/** Save session state with throttling. */
function saveSession(state) {
	const { accountId } = state;
	let throttle = throttleState.get(accountId);
	if (!throttle) {
		throttle = {
			pendingState: null,
			lastSaveTime: 0,
			throttleTimer: null
		};
		throttleState.set(accountId, throttle);
	}
	const now = Date.now();
	const timeSinceLastSave = now - throttle.lastSaveTime;
	if (timeSinceLastSave >= SAVE_THROTTLE_MS) {
		doSaveSession(state);
		throttle.lastSaveTime = now;
		throttle.pendingState = null;
		if (throttle.throttleTimer) {
			clearTimeout(throttle.throttleTimer);
			throttle.throttleTimer = null;
		}
	} else {
		throttle.pendingState = state;
		if (!throttle.throttleTimer) {
			const delay = SAVE_THROTTLE_MS - timeSinceLastSave;
			throttle.throttleTimer = setTimeout(() => {
				const t = throttleState.get(accountId);
				if (t?.pendingState) {
					doSaveSession(t.pendingState);
					t.lastSaveTime = Date.now();
					t.pendingState = null;
				}
				if (t) t.throttleTimer = null;
			}, delay);
		}
	}
}
function doSaveSession(state) {
	const filePath = getSessionPath(state.accountId);
	const legacyPath = getLegacySessionPath(state.accountId);
	try {
		ensureDir();
		const stateToSave = {
			...state,
			savedAt: Date.now()
		};
		fs.writeFileSync(filePath, JSON.stringify(stateToSave, null, 2), "utf-8");
		if (legacyPath !== filePath && fs.existsSync(legacyPath)) fs.unlinkSync(legacyPath);
		debugLog(`[session-store] Saved session for ${state.accountId}: sessionId=${state.sessionId}, lastSeq=${state.lastSeq}`);
	} catch (err) {
		debugError(`[session-store] Failed to save session for ${state.accountId}: ${formatErrorMessage(err)}`);
	}
}
/** Clear a saved session and any pending throttle state. */
function clearSession(accountId) {
	const throttle = throttleState.get(accountId);
	if (throttle) {
		if (throttle.throttleTimer) clearTimeout(throttle.throttleTimer);
		throttleState.delete(accountId);
	}
	try {
		let cleared = false;
		for (const filePath of getCandidateSessionPaths(accountId)) if (fs.existsSync(filePath)) {
			fs.unlinkSync(filePath);
			cleared = true;
		}
		if (cleared) debugLog(`[session-store] Cleared session for ${accountId}`);
	} catch (err) {
		debugError(`[session-store] Failed to clear session for ${accountId}: ${formatErrorMessage(err)}`);
	}
}
//#endregion
//#region extensions/qqbot/src/engine/gateway/codec.ts
/**
* Gateway message decoding utilities.
*
* Extracted from `gateway.ts` — handles the various data formats that
* the QQ Bot WebSocket can deliver (string, Buffer, Buffer[], ArrayBuffer).
*
* Zero external dependencies beyond Node.js built-ins.
*/
/**
* Decode raw WebSocket `data` into a UTF-8 string.
*
* The QQ Bot gateway can send data as a plain string, a single Buffer,
* an array of Buffer chunks, an ArrayBuffer, or a typed array view.
*/
function decodeGatewayMessageData(data) {
	if (typeof data === "string") return data;
	if (Buffer.isBuffer(data)) return data.toString("utf8");
	if (Array.isArray(data) && data.every((chunk) => Buffer.isBuffer(chunk))) return Buffer.concat(data).toString("utf8");
	if (data instanceof ArrayBuffer) return Buffer.from(data).toString("utf8");
	if (ArrayBuffer.isView(data)) return Buffer.from(data.buffer, data.byteOffset, data.byteLength).toString("utf8");
	return "";
}
/**
* Read the optional `message_scene.ext` array from an event payload.
*
* Guild, C2C, and Group events may carry a `message_scene` object
* with an `ext` string array used for ref-index parsing.
*/
function readOptionalMessageSceneExt(event) {
	if (!("message_scene" in event)) return;
	return event.message_scene?.ext;
}
//#endregion
//#region extensions/qqbot/src/engine/gateway/constants.ts
/**
* QQ Bot WebSocket Gateway protocol constants.
*
* Extracted from `gateway.ts` to share between both plugin versions.
* Zero external dependencies.
*/
/** QQ Bot WebSocket intents grouped by permission level. */
const INTENTS = {
	GUILDS: 1,
	GUILD_MEMBERS: 2,
	PUBLIC_GUILD_MESSAGES: 1 << 30,
	DIRECT_MESSAGE: 4096,
	GROUP_AND_C2C: 1 << 25,
	INTERACTION: 1 << 26
};
/** Full intent mask: groups + DMs + channels + interaction. */
const FULL_INTENTS = INTENTS.PUBLIC_GUILD_MESSAGES | INTENTS.DIRECT_MESSAGE | INTENTS.GROUP_AND_C2C | INTENTS.INTERACTION;
/** Exponential backoff delays for reconnection attempts (ms). */
const RECONNECT_DELAYS = [
	1e3,
	2e3,
	5e3,
	1e4,
	3e4,
	6e4
];
/** Delay after receiving a rate-limit close code (ms). */
const RATE_LIMIT_DELAY = 6e4;
/** Gateway opcodes used by the QQ Bot WebSocket protocol. */
const GatewayOp = {
	DISPATCH: 0,
	HEARTBEAT: 1,
	IDENTIFY: 2,
	RESUME: 6,
	RECONNECT: 7,
	INVALID_SESSION: 9,
	HELLO: 10,
	HEARTBEAT_ACK: 11
};
/** WebSocket close codes used by the QQ Gateway. */
const GatewayCloseCode = {
	NORMAL: 1e3,
	AUTH_FAILED: 4004,
	INVALID_SESSION: 4006,
	SEQ_OUT_OF_RANGE: 4007,
	RATE_LIMITED: 4008,
	SESSION_TIMEOUT: 4009,
	SERVER_ERROR_START: 4900,
	SERVER_ERROR_END: 4913,
	INSUFFICIENT_INTENTS: 4914,
	DISALLOWED_INTENTS: 4915
};
/** Event type strings dispatched under opcode 0 (DISPATCH). */
const GatewayEvent = {
	READY: "READY",
	RESUMED: "RESUMED",
	C2C_MESSAGE_CREATE: "C2C_MESSAGE_CREATE",
	AT_MESSAGE_CREATE: "AT_MESSAGE_CREATE",
	DIRECT_MESSAGE_CREATE: "DIRECT_MESSAGE_CREATE",
	GROUP_AT_MESSAGE_CREATE: "GROUP_AT_MESSAGE_CREATE",
	INTERACTION_CREATE: "INTERACTION_CREATE"
};
//#endregion
//#region extensions/qqbot/src/engine/utils/text-parsing.ts
const INTERNAL_MARKER_RE = /\[internal:?\s*[^\]]*\]|\[debug:?\s*[^\]]*\]|\[system:?\s*[^\]]*\]/gi;
/** Remove internal markers like `[internal:...]`, `[debug:...]`, `[system:...]`. */
function filterInternalMarkers(text) {
	if (!text) return "";
	return text.replace(INTERNAL_MARKER_RE, "").trim();
}
/**
* Parse message_scene.ext to extract refMsgIdx and msgIdx.
*
* Supports both ext prefix formats:
* - `ref_msg_idx=` / `msg_idx=` (platform native format)
* - `refMsgIdx:` / `msgIdx:` (legacy internal format)
*
* When `messageType` equals `MSG_TYPE_QUOTE` (103) and `msgElements` is
* provided, `msgElements[0].msg_idx` takes precedence over the ext-parsed
* `refMsgIdx` value — the element-level index is more authoritative for
* quote messages.
*/
function parseRefIndices(ext, messageType, msgElements) {
	let refMsgIdx;
	let msgIdx;
	if (ext && ext.length > 0) for (const item of ext) {
		if (typeof item !== "string") continue;
		if (item.startsWith("ref_msg_idx=")) refMsgIdx = item.slice(12).trim();
		else if (item.startsWith("msg_idx=")) msgIdx = item.slice(8).trim();
		else if (item.startsWith("refMsgIdx:")) refMsgIdx = item.slice(10).trim();
		else if (item.startsWith("msgIdx:")) msgIdx = item.slice(7).trim();
	}
	if (messageType === 103) {
		const refElement = msgElements?.[0];
		if (refElement?.msg_idx) refMsgIdx = refElement.msg_idx;
	}
	return {
		refMsgIdx,
		msgIdx
	};
}
const MAX_FACE_EXT_BYTES = 64 * 1024;
/** Estimate Base64 decoded byte size (replaces plugin-sdk estimateBase64DecodedBytes). */
function estimateBase64Size(base64) {
	const len = base64.length;
	const padding = base64.endsWith("==") ? 2 : base64.endsWith("=") ? 1 : 0;
	return Math.ceil(len * 3 / 4) - padding;
}
/** Replace QQ face tags with readable text labels. */
function parseFaceTags(text) {
	if (!text) return "";
	return text.replace(/<faceType=\d+,faceId="[^"]*",ext="([^"]*)">/g, (_match, ext) => {
		try {
			if (estimateBase64Size(ext) > MAX_FACE_EXT_BYTES) return "[Emoji: unknown emoji]";
			const decoded = Buffer.from(ext, "base64").toString("utf-8");
			return `[Emoji: ${JSON.parse(decoded).text || "unknown emoji"}]`;
		} catch {
			return _match;
		}
	});
}
/** Lowercase a string safely (replaces plugin-sdk normalizeLowercaseStringOrEmpty). */
function lc(s) {
	return (s ?? "").toLowerCase();
}
/** Build attachment summaries for ref-index caching. */
function buildAttachmentSummaries(attachments, localPaths) {
	if (!attachments || attachments.length === 0) return;
	return attachments.map((att, idx) => {
		const ct = lc(att.content_type);
		let type = "unknown";
		if (ct.startsWith("image/")) type = "image";
		else if (ct === "voice" || ct.startsWith("audio/") || ct.includes("silk") || ct.includes("amr")) type = "voice";
		else if (ct.startsWith("video/")) type = "video";
		else if (ct.startsWith("application/") || ct.startsWith("text/")) type = "file";
		return {
			type,
			filename: att.filename,
			contentType: att.content_type,
			localPath: localPaths?.[idx] ?? void 0
		};
	});
}
//#endregion
//#region extensions/qqbot/src/engine/gateway/event-dispatcher.ts
/**
* Event dispatcher — convert raw WebSocket op=0 events into QueuedMessage objects.
*
* Pure mapping logic with zero side effects (except known-user recording).
* Independently testable.
*/
/**
* Map a raw op=0 event into a structured dispatch result.
*
* Returns "message" for events that should be queued for processing,
* "ready"/"resumed" for session lifecycle events, and "ignore" otherwise.
*/
function dispatchEvent(eventType, data, accountId, _log) {
	if (eventType === GatewayEvent.READY) return {
		action: "ready",
		data,
		sessionId: data.session_id
	};
	if (eventType === GatewayEvent.RESUMED) return {
		action: "resumed",
		data
	};
	if (eventType === GatewayEvent.C2C_MESSAGE_CREATE) {
		const ev = data;
		recordKnownUser({
			openid: ev.author.user_openid,
			type: "c2c",
			accountId
		});
		const refs = parseRefIndices(ev.message_scene?.ext, ev.message_type, ev.msg_elements);
		return {
			action: "message",
			msg: {
				type: "c2c",
				senderId: ev.author.user_openid,
				content: ev.content,
				messageId: ev.id,
				timestamp: ev.timestamp,
				attachments: ev.attachments,
				refMsgIdx: refs.refMsgIdx,
				msgIdx: refs.msgIdx,
				msgType: ev.message_type,
				msgElements: ev.msg_elements
			}
		};
	}
	if (eventType === GatewayEvent.AT_MESSAGE_CREATE) {
		const ev = data;
		const refs = parseRefIndices(readOptionalMessageSceneExt(ev));
		return {
			action: "message",
			msg: {
				type: "guild",
				senderId: ev.author.id,
				senderName: ev.author.username,
				content: ev.content,
				messageId: ev.id,
				timestamp: ev.timestamp,
				channelId: ev.channel_id,
				guildId: ev.guild_id,
				attachments: ev.attachments,
				refMsgIdx: refs.refMsgIdx,
				msgIdx: refs.msgIdx
			}
		};
	}
	if (eventType === GatewayEvent.DIRECT_MESSAGE_CREATE) {
		const ev = data;
		const refs = parseRefIndices(readOptionalMessageSceneExt(ev));
		return {
			action: "message",
			msg: {
				type: "dm",
				senderId: ev.author.id,
				senderName: ev.author.username,
				content: ev.content,
				messageId: ev.id,
				timestamp: ev.timestamp,
				guildId: ev.guild_id,
				attachments: ev.attachments,
				refMsgIdx: refs.refMsgIdx,
				msgIdx: refs.msgIdx
			}
		};
	}
	if (eventType === GatewayEvent.GROUP_AT_MESSAGE_CREATE) {
		const ev = data;
		recordKnownUser({
			openid: ev.author.member_openid,
			type: "group",
			groupOpenid: ev.group_openid,
			accountId
		});
		const refs = parseRefIndices(ev.message_scene?.ext, ev.message_type, ev.msg_elements);
		return {
			action: "message",
			msg: {
				type: "group",
				senderId: ev.author.member_openid,
				content: ev.content,
				messageId: ev.id,
				timestamp: ev.timestamp,
				groupOpenid: ev.group_openid,
				attachments: ev.attachments,
				refMsgIdx: refs.refMsgIdx,
				msgIdx: refs.msgIdx,
				msgType: ev.message_type,
				msgElements: ev.msg_elements
			}
		};
	}
	if (eventType === GatewayEvent.INTERACTION_CREATE) return {
		action: "interaction",
		event: data
	};
	return { action: "ignore" };
}
//#endregion
//#region extensions/qqbot/src/engine/gateway/message-queue.ts
/**
* Per-user concurrent message queue.
*
* Messages are serialized per user (peer) and processed in parallel across
* users, up to a configurable concurrency limit.
*
* This module is independent of any framework SDK — it only needs a logger
* and an abort-state probe supplied via {@link MessageQueueContext}.
*/
const MESSAGE_QUEUE_SIZE = 1e3;
const PER_USER_QUEUE_SIZE = 20;
const MAX_CONCURRENT_USERS = 10;
/**
* Create a per-user concurrent queue.
* Messages are serialized per user and processed in parallel across users.
*/
function createMessageQueue(ctx) {
	const { accountId: _accountId, log } = ctx;
	const userQueues = /* @__PURE__ */ new Map();
	const activeUsers = /* @__PURE__ */ new Set();
	let messagesProcessed = 0;
	let handleMessageFnRef = null;
	let totalEnqueued = 0;
	const getMessagePeerId = (msg) => {
		if (msg.type === "guild") return `guild:${msg.channelId ?? "unknown"}`;
		if (msg.type === "group") return `group:${msg.groupOpenid ?? "unknown"}`;
		return `dm:${msg.senderId}`;
	};
	const drainUserQueue = async (peerId) => {
		if (activeUsers.has(peerId)) return;
		if (activeUsers.size >= MAX_CONCURRENT_USERS) {
			log?.info(`Max concurrent users (${MAX_CONCURRENT_USERS}) reached, ${peerId} will wait`);
			return;
		}
		const queue = userQueues.get(peerId);
		if (!queue || queue.length === 0) {
			userQueues.delete(peerId);
			return;
		}
		activeUsers.add(peerId);
		try {
			while (queue.length > 0 && !ctx.isAborted()) {
				const msg = queue.shift();
				totalEnqueued = Math.max(0, totalEnqueued - 1);
				try {
					if (handleMessageFnRef) {
						await handleMessageFnRef(msg);
						messagesProcessed++;
					}
				} catch (err) {
					log?.error(`Message processor error for ${peerId}: ${formatErrorMessage(err)}`);
				}
			}
		} finally {
			activeUsers.delete(peerId);
			userQueues.delete(peerId);
			for (const [waitingPeerId, waitingQueue] of userQueues) {
				if (activeUsers.size >= MAX_CONCURRENT_USERS) break;
				if (waitingQueue.length > 0 && !activeUsers.has(waitingPeerId)) drainUserQueue(waitingPeerId);
			}
		}
	};
	const enqueue = (msg) => {
		const peerId = getMessagePeerId(msg);
		let queue = userQueues.get(peerId);
		if (!queue) {
			queue = [];
			userQueues.set(peerId, queue);
		}
		if (queue.length >= PER_USER_QUEUE_SIZE) {
			const dropped = queue.shift();
			log?.error(`Per-user queue full for ${peerId}, dropping oldest message ${dropped?.messageId}`);
		}
		totalEnqueued++;
		if (totalEnqueued > MESSAGE_QUEUE_SIZE) log?.error(`Global queue limit reached (${totalEnqueued}), message from ${peerId} may be delayed`);
		queue.push(msg);
		log?.debug?.(`Message enqueued for ${peerId}, user queue: ${queue.length}, active users: ${activeUsers.size}`);
		drainUserQueue(peerId);
	};
	const startProcessor = (handleMessageFn) => {
		handleMessageFnRef = handleMessageFn;
		log?.debug?.(`Message processor started (per-user concurrency, max ${MAX_CONCURRENT_USERS} users)`);
	};
	const getSnapshot = (senderPeerId) => {
		let totalPending = 0;
		for (const [, q] of userQueues) totalPending += q.length;
		const senderQueue = userQueues.get(senderPeerId);
		return {
			totalPending,
			activeUsers: activeUsers.size,
			maxConcurrentUsers: MAX_CONCURRENT_USERS,
			senderPending: senderQueue ? senderQueue.length : 0
		};
	};
	const clearUserQueue = (peerId) => {
		const queue = userQueues.get(peerId);
		if (!queue || queue.length === 0) return 0;
		const droppedCount = queue.length;
		queue.length = 0;
		totalEnqueued = Math.max(0, totalEnqueued - droppedCount);
		return droppedCount;
	};
	const executeImmediate = (msg) => {
		if (handleMessageFnRef) handleMessageFnRef(msg).catch((err) => {
			log?.error(`Immediate execution error: ${err}`);
		});
	};
	return {
		enqueue,
		startProcessor,
		getSnapshot,
		getMessagePeerId,
		clearUserQueue,
		executeImmediate
	};
}
//#endregion
//#region extensions/qqbot/src/engine/gateway/reconnect.ts
/**
* Reconnection state machine.
*
* Usage:
* ```ts
* const rs = new ReconnectState('account-1', log);
* // On successful connect:
* rs.onConnected();
* // On close:
* const action = rs.handleClose(code);
* if (action.shouldReconnect) {
*   const delay = rs.getNextDelay(action.reconnectDelay);
*   setTimeout(connect, delay);
* }
* ```
*/
var ReconnectState = class {
	constructor(accountId, log) {
		this.accountId = accountId;
		this.log = log;
		this.attempts = 0;
		this.lastConnectTime = 0;
		this.quickDisconnectCount = 0;
	}
	/** Call when a WebSocket connection is successfully established. */
	onConnected() {
		this.attempts = 0;
		this.lastConnectTime = Date.now();
	}
	/** Whether reconnection attempts are exhausted. */
	isExhausted() {
		return this.attempts >= 100;
	}
	/**
	* Compute the next reconnect delay and increment the attempt counter.
	*
	* @param customDelay Override from `CloseAction.reconnectDelay`.
	* @returns Delay in milliseconds.
	*/
	getNextDelay(customDelay) {
		const delay = customDelay ?? RECONNECT_DELAYS[Math.min(this.attempts, RECONNECT_DELAYS.length - 1)];
		this.attempts++;
		this.log?.debug?.(`Reconnecting in ${delay}ms (attempt ${this.attempts})`);
		return delay;
	}
	/**
	* Interpret a WebSocket close code and return the appropriate action.
	*/
	handleClose(code, isAborted) {
		if (code === GatewayCloseCode.INSUFFICIENT_INTENTS || code === GatewayCloseCode.DISALLOWED_INTENTS) {
			const reason = code === GatewayCloseCode.INSUFFICIENT_INTENTS ? "offline/sandbox-only" : "banned";
			this.log?.error(`Bot is ${reason}. Please contact QQ platform.`);
			return {
				shouldReconnect: false,
				clearSession: false,
				refreshToken: false,
				fatal: true,
				reason
			};
		}
		if (code === GatewayCloseCode.AUTH_FAILED) {
			this.log?.info(`Invalid token (4004), will refresh token and reconnect`);
			return {
				shouldReconnect: !isAborted,
				clearSession: false,
				refreshToken: true,
				fatal: false,
				reason: "invalid token (4004)"
			};
		}
		if (code === GatewayCloseCode.RATE_LIMITED) {
			this.log?.info(`Rate limited (4008), waiting ${RATE_LIMIT_DELAY}ms`);
			return {
				shouldReconnect: !isAborted,
				reconnectDelay: RATE_LIMIT_DELAY,
				clearSession: false,
				refreshToken: false,
				fatal: false,
				reason: "rate limited (4008)"
			};
		}
		if (code === GatewayCloseCode.INVALID_SESSION || code === GatewayCloseCode.SEQ_OUT_OF_RANGE || code === GatewayCloseCode.SESSION_TIMEOUT) {
			const codeDesc = {
				[GatewayCloseCode.INVALID_SESSION]: "session no longer valid",
				[GatewayCloseCode.SEQ_OUT_OF_RANGE]: "invalid seq on resume",
				[GatewayCloseCode.SESSION_TIMEOUT]: "session timed out"
			};
			this.log?.info(`Error ${code} (${codeDesc[code]}), will re-identify`);
			return {
				shouldReconnect: !isAborted,
				clearSession: true,
				refreshToken: true,
				fatal: false,
				reason: codeDesc[code]
			};
		}
		if (code >= GatewayCloseCode.SERVER_ERROR_START && code <= GatewayCloseCode.SERVER_ERROR_END) {
			this.log?.info(`Internal error (${code}), will re-identify`);
			return {
				shouldReconnect: !isAborted && code !== GatewayCloseCode.NORMAL,
				clearSession: true,
				refreshToken: true,
				fatal: false,
				reason: `internal error (${code})`
			};
		}
		const connectionDuration = Date.now() - this.lastConnectTime;
		if (connectionDuration < 5e3 && this.lastConnectTime > 0) {
			this.quickDisconnectCount++;
			this.log?.debug?.(`Quick disconnect detected (${connectionDuration}ms), count: ${this.quickDisconnectCount}`);
			if (this.quickDisconnectCount >= 3) {
				this.log?.error(`Too many quick disconnects. This may indicate a permission issue.`);
				this.quickDisconnectCount = 0;
				return {
					shouldReconnect: !isAborted && code !== 1e3,
					reconnectDelay: RATE_LIMIT_DELAY,
					clearSession: false,
					refreshToken: false,
					fatal: false,
					reason: "too many quick disconnects"
				};
			}
		} else this.quickDisconnectCount = 0;
		return {
			shouldReconnect: !isAborted && code !== GatewayCloseCode.NORMAL,
			clearSession: false,
			refreshToken: false,
			fatal: false,
			reason: `close code ${code}`
		};
	}
};
//#endregion
//#region extensions/qqbot/src/engine/gateway/gateway-connection.ts
/**
* GatewayConnection — WebSocket lifecycle, heartbeat, reconnect, and session persistence.
*
* Encapsulates all connection state as class fields (replaces 11 closure variables).
* Event handling and message processing are delegated to injected handlers.
*/
var GatewayConnection = class {
	constructor(ctx) {
		this.isAborted = false;
		this.currentWs = null;
		this.heartbeatInterval = null;
		this.sessionId = null;
		this.lastSeq = null;
		this.isConnecting = false;
		this.reconnectTimer = null;
		this.shouldRefreshToken = false;
		this.ctx = ctx;
		this.reconnect = new ReconnectState(ctx.account.accountId, ctx.log);
		this.msgQueue = createMessageQueue({
			accountId: ctx.account.accountId,
			log: ctx.log,
			isAborted: () => this.isAborted
		});
	}
	/** Start the connection loop. Resolves when abortSignal fires. */
	async start() {
		this.restoreSession();
		this.registerAbortHandler();
		await this.connect();
		return new Promise((resolve) => {
			this.ctx.abortSignal.addEventListener("abort", () => resolve());
		});
	}
	restoreSession() {
		const { account, log } = this.ctx;
		const saved = loadSession(account.accountId, account.appId);
		if (saved) {
			this.sessionId = saved.sessionId;
			this.lastSeq = saved.lastSeq;
			log?.info(`Restored session: sessionId=${this.sessionId}, lastSeq=${this.lastSeq}`);
		}
	}
	saveCurrentSession() {
		const { account } = this.ctx;
		if (!this.sessionId) return;
		saveSession({
			sessionId: this.sessionId,
			lastSeq: this.lastSeq,
			lastConnectedAt: Date.now(),
			intentLevelIndex: 0,
			accountId: account.accountId,
			savedAt: Date.now(),
			appId: account.appId
		});
	}
	registerAbortHandler() {
		const { account, abortSignal, log: _log } = this.ctx;
		abortSignal.addEventListener("abort", () => {
			this.isAborted = true;
			if (this.reconnectTimer) {
				clearTimeout(this.reconnectTimer);
				this.reconnectTimer = null;
			}
			this.cleanup();
			stopBackgroundTokenRefresh(account.appId);
			flushKnownUsers();
			flushRefIndex();
		});
	}
	cleanup() {
		if (this.heartbeatInterval) {
			clearInterval(this.heartbeatInterval);
			this.heartbeatInterval = null;
		}
		if (this.currentWs && (this.currentWs.readyState === WebSocket.OPEN || this.currentWs.readyState === WebSocket.CONNECTING)) this.currentWs.close();
		this.currentWs = null;
	}
	scheduleReconnect(customDelay) {
		const { account: _account, log } = this.ctx;
		if (this.isAborted || this.reconnect.isExhausted()) {
			log?.error(`Max reconnect attempts reached or aborted`);
			return;
		}
		if (this.reconnectTimer) {
			clearTimeout(this.reconnectTimer);
			this.reconnectTimer = null;
		}
		const delay = this.reconnect.getNextDelay(customDelay);
		this.reconnectTimer = setTimeout(() => {
			this.reconnectTimer = null;
			if (!this.isAborted) this.connect();
		}, delay);
	}
	async connect() {
		const { account, log } = this.ctx;
		if (this.isConnecting) {
			log?.debug?.(`Already connecting, skip`);
			return;
		}
		this.isConnecting = true;
		try {
			this.cleanup();
			if (this.shouldRefreshToken) {
				log?.debug?.(`Refreshing token...`);
				clearTokenCache(account.appId);
				this.shouldRefreshToken = false;
			}
			const accessToken = await getAccessToken(account.appId, account.clientSecret);
			log?.info(`✅ Access token obtained successfully`);
			const gatewayUrl = await getGatewayUrl(accessToken, account.appId);
			log?.info(`Connecting to ${gatewayUrl}`);
			const ws = new WebSocket(gatewayUrl, { headers: { "User-Agent": getPluginUserAgent() } });
			this.currentWs = ws;
			const slashCtx = {
				account,
				log,
				getMessagePeerId: (msg) => this.msgQueue.getMessagePeerId(msg),
				getQueueSnapshot: (peerId) => this.msgQueue.getSnapshot(peerId)
			};
			const trySlashCommandOrEnqueue = async (msg) => {
				const result = await trySlashCommand(msg, slashCtx);
				if (result === "enqueue") this.msgQueue.enqueue(msg);
				else if (result === "urgent") {
					const peerId = this.msgQueue.getMessagePeerId(msg);
					this.msgQueue.clearUserQueue(peerId);
					this.msgQueue.executeImmediate(msg);
				}
			};
			ws.on("open", () => {
				log?.info(`WebSocket connected`);
				this.isConnecting = false;
				this.reconnect.onConnected();
				this.msgQueue.startProcessor(this.ctx.handleMessage);
				startBackgroundTokenRefresh(account.appId, account.clientSecret, { log });
			});
			ws.on("message", async (data) => {
				try {
					const rawData = decodeGatewayMessageData(data);
					const { op, d, s, t } = JSON.parse(rawData);
					if (s) {
						this.lastSeq = s;
						this.saveCurrentSession();
					}
					switch (op) {
						case GatewayOp.HELLO:
							this.handleHello(ws, d, accessToken);
							break;
						case GatewayOp.DISPATCH: {
							log?.debug?.(`Dispatch event: t=${t}, d=${JSON.stringify(d)}`);
							const result = dispatchEvent(t ?? "", d, account.accountId, log);
							if (result.action === "ready") {
								this.sessionId = result.sessionId;
								this.saveCurrentSession();
								this.ctx.onReady?.(result.data);
							} else if (result.action === "resumed") {
								(this.ctx.onResumed ?? this.ctx.onReady)?.(result.data);
								this.saveCurrentSession();
							} else if (result.action === "interaction") this.ctx.onInteraction?.(result.event);
							else if (result.action === "message") trySlashCommandOrEnqueue(result.msg);
							break;
						}
						case GatewayOp.HEARTBEAT_ACK: break;
						case GatewayOp.RECONNECT:
							this.cleanup();
							this.scheduleReconnect();
							break;
						case GatewayOp.INVALID_SESSION:
							if (!d) {
								this.sessionId = null;
								this.lastSeq = null;
								clearSession(account.accountId);
								this.shouldRefreshToken = true;
							}
							this.cleanup();
							this.scheduleReconnect(3e3);
							break;
					}
				} catch (err) {
					log?.error(`Message parse error: ${err instanceof Error ? err.message : String(err)}`);
				}
			});
			ws.on("close", (code, reason) => {
				log?.info(`WebSocket closed: ${code} ${reason.toString()}`);
				this.isConnecting = false;
				this.handleClose(code);
			});
			ws.on("error", (err) => {
				log?.error(`WebSocket error: ${err.message}`);
				this.ctx.onError?.(err);
			});
		} catch (err) {
			this.isConnecting = false;
			const errMsg = err instanceof Error ? err.message : String(err);
			log?.error(`Connection failed: ${errMsg}`);
			if (errMsg.includes("Too many requests") || errMsg.includes("100001")) this.scheduleReconnect(RATE_LIMIT_DELAY);
			else this.scheduleReconnect();
		}
	}
	handleHello(ws, d, accessToken) {
		if (this.sessionId && this.lastSeq !== null) ws.send(JSON.stringify({
			op: GatewayOp.RESUME,
			d: {
				token: `QQBot ${accessToken}`,
				session_id: this.sessionId,
				seq: this.lastSeq
			}
		}));
		else ws.send(JSON.stringify({
			op: GatewayOp.IDENTIFY,
			d: {
				token: `QQBot ${accessToken}`,
				intents: FULL_INTENTS,
				shard: [0, 1]
			}
		}));
		const interval = d.heartbeat_interval;
		if (this.heartbeatInterval) clearInterval(this.heartbeatInterval);
		this.heartbeatInterval = setInterval(() => {
			if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify({
				op: GatewayOp.HEARTBEAT,
				d: this.lastSeq
			}));
		}, interval);
	}
	handleClose(code) {
		const { account } = this.ctx;
		const action = this.reconnect.handleClose(code, this.isAborted);
		if (action.clearSession) {
			this.sessionId = null;
			this.lastSeq = null;
			clearSession(account.accountId);
		}
		if (action.refreshToken) this.shouldRefreshToken = true;
		this.cleanup();
		if (action.fatal) return;
		if (action.shouldReconnect) this.scheduleReconnect(action.reconnectDelay);
	}
};
//#endregion
//#region extensions/qqbot/src/engine/utils/stt.ts
/**
* OpenAI-compatible STT (Speech-to-Text) configuration and transcription.
*
* Migrated from `src/stt.ts` — uses core/utils/string-normalize instead
* of openclaw/plugin-sdk/text-runtime.
*/
/** Resolve the STT configuration from the nested config object. */
function resolveSTTConfig(cfg) {
	const channelStt = asOptionalObjectRecord(asOptionalObjectRecord(asOptionalObjectRecord(cfg.channels)?.qqbot)?.stt);
	const providers = asOptionalObjectRecord(asOptionalObjectRecord(cfg.models)?.providers);
	if (channelStt && channelStt.enabled !== false) {
		const providerId = readStringField(channelStt, "provider") ?? "openai";
		const providerCfg = asOptionalObjectRecord(providers?.[providerId]);
		const baseUrl = readStringField(channelStt, "baseUrl") ?? readStringField(providerCfg, "baseUrl");
		const apiKey = readStringField(channelStt, "apiKey") ?? readStringField(providerCfg, "apiKey");
		const model = readStringField(channelStt, "model") ?? "whisper-1";
		if (baseUrl && apiKey) return {
			baseUrl: baseUrl.replace(/\/+$/, ""),
			apiKey,
			model
		};
	}
	const audioModels = asOptionalObjectRecord(asOptionalObjectRecord(asOptionalObjectRecord(cfg.tools)?.media)?.audio)?.models;
	const audioModelEntry = Array.isArray(audioModels) ? asOptionalObjectRecord(audioModels[0]) : void 0;
	if (audioModelEntry) {
		const providerId = readStringField(audioModelEntry, "provider") ?? "openai";
		const providerCfg = asOptionalObjectRecord(providers?.[providerId]);
		const baseUrl = readStringField(audioModelEntry, "baseUrl") ?? readStringField(providerCfg, "baseUrl");
		const apiKey = readStringField(audioModelEntry, "apiKey") ?? readStringField(providerCfg, "apiKey");
		const model = readStringField(audioModelEntry, "model") ?? "whisper-1";
		if (baseUrl && apiKey) return {
			baseUrl: baseUrl.replace(/\/+$/, ""),
			apiKey,
			model
		};
	}
	return null;
}
/** Send audio to an OpenAI-compatible STT endpoint and return the transcript. */
async function transcribeAudio(audioPath, cfg) {
	const sttCfg = resolveSTTConfig(cfg);
	if (!sttCfg) return null;
	const fileBuffer = fs$1.readFileSync(audioPath);
	const fileName = sanitizeFileName(path.basename(audioPath));
	const mime = fileName.endsWith(".wav") ? "audio/wav" : fileName.endsWith(".mp3") ? "audio/mpeg" : fileName.endsWith(".ogg") ? "audio/ogg" : "application/octet-stream";
	const form = new FormData();
	form.append("file", new Blob([fileBuffer], { type: mime }), fileName);
	form.append("model", sttCfg.model);
	const resp = await fetch(`${sttCfg.baseUrl}/audio/transcriptions`, {
		method: "POST",
		headers: { Authorization: `Bearer ${sttCfg.apiKey}` },
		body: form
	});
	if (!resp.ok) {
		const detail = await resp.text().catch(() => "");
		throw new Error(`STT failed (HTTP ${resp.status}): ${detail.slice(0, 300)}`);
	}
	return normalizeOptionalString((await resp.json()).text) ?? null;
}
//#endregion
//#region extensions/qqbot/src/engine/utils/voice-text.ts
/**
* Voice transcript formatting utility.
*
* Zero external dependencies — pure string formatting.
*/
/** Format voice transcripts into user-visible text. */
function formatVoiceText(transcripts) {
	if (transcripts.length === 0) return "";
	return transcripts.length === 1 ? `[Voice message] ${transcripts[0]}` : transcripts.map((t, i) => `[Voice ${i + 1}] ${t}`).join("\n");
}
//#endregion
//#region extensions/qqbot/src/engine/gateway/inbound-attachments.ts
let _audioAdapter = null;
/** Register the audio conversion adapter — called by gateway startup. */
function registerAudioConvertAdapter(adapter) {
	_audioAdapter = adapter;
}
function getAudioAdapter() {
	if (!_audioAdapter) throw new Error("AudioConvertAdapter not registered — call registerAudioConvertAdapter first");
	return _audioAdapter;
}
const EMPTY_RESULT = {
	attachmentInfo: "",
	imageUrls: [],
	imageMediaTypes: [],
	voiceAttachmentPaths: [],
	voiceAttachmentUrls: [],
	voiceAsrReferTexts: [],
	voiceTranscripts: [],
	voiceTranscriptSources: [],
	attachmentLocalPaths: []
};
/** Download, convert, transcribe, and classify inbound attachments. */
async function processAttachments(attachments, ctx) {
	if (!attachments?.length) return EMPTY_RESULT;
	const { accountId: _accountId, cfg, log } = ctx;
	const downloadDir = getQQBotMediaDir("downloads");
	const imageUrls = [];
	const imageMediaTypes = [];
	const voiceAttachmentPaths = [];
	const voiceAttachmentUrls = [];
	const voiceAsrReferTexts = [];
	const voiceTranscripts = [];
	const voiceTranscriptSources = [];
	const attachmentLocalPaths = [];
	const otherAttachments = [];
	const downloadTasks = attachments.map(async (att) => {
		const attUrl = att.url?.startsWith("//") ? `https:${att.url}` : att.url;
		const isVoice = getAudioAdapter().isVoiceAttachment(att);
		const wavUrl = isVoice && att.voice_wav_url ? att.voice_wav_url.startsWith("//") ? `https:${att.voice_wav_url}` : att.voice_wav_url : "";
		let localPath = null;
		let audioPath = null;
		if (isVoice && wavUrl) {
			const wavLocalPath = await downloadFile(wavUrl, downloadDir);
			if (wavLocalPath) {
				localPath = wavLocalPath;
				audioPath = wavLocalPath;
				log?.debug?.(`Voice attachment: ${att.filename}, downloaded WAV directly (skip SILK→WAV)`);
			} else log?.error(`Failed to download voice_wav_url, falling back to original URL`);
		}
		if (!localPath) localPath = await downloadFile(attUrl, downloadDir, att.filename);
		return {
			att,
			attUrl,
			isVoice,
			localPath,
			audioPath
		};
	});
	const processTasks = (await Promise.all(downloadTasks)).map(async ({ att, attUrl, isVoice, localPath, audioPath }) => {
		const asrReferText = normalizeOptionalString(att.asr_refer_text) ?? "";
		const voiceSourceUrl = (isVoice && att.voice_wav_url ? att.voice_wav_url.startsWith("//") ? `https:${att.voice_wav_url}` : att.voice_wav_url : "") || attUrl;
		const meta = {
			voiceUrl: isVoice && voiceSourceUrl ? voiceSourceUrl : void 0,
			asrReferText: isVoice && asrReferText ? asrReferText : void 0
		};
		if (localPath) {
			if (att.content_type?.startsWith("image/")) {
				log?.debug?.(`Downloaded attachment to: ${localPath}`);
				return {
					localPath,
					type: "image",
					contentType: att.content_type,
					meta
				};
			}
			if (isVoice) {
				log?.debug?.(`Downloaded attachment to: ${localPath}`);
				return processVoiceAttachment(localPath, audioPath, att, asrReferText, cfg, downloadDir, log);
			}
			log?.debug?.(`Downloaded attachment to: ${localPath}`);
			return {
				localPath,
				type: "other",
				filename: att.filename,
				meta
			};
		}
		log?.error(`Failed to download: ${attUrl}`);
		if (att.content_type?.startsWith("image/")) return {
			localPath: null,
			type: "image-fallback",
			attUrl,
			contentType: att.content_type,
			meta
		};
		if (isVoice && asrReferText) {
			log?.info(`Voice attachment download failed, using asr_refer_text fallback`);
			return {
				localPath: null,
				type: "voice-fallback",
				transcript: asrReferText,
				meta
			};
		}
		return {
			localPath: null,
			type: "other-fallback",
			filename: att.filename ?? att.content_type,
			meta
		};
	});
	const processResults = await Promise.all(processTasks);
	for (const result of processResults) {
		if (result.meta.voiceUrl) voiceAttachmentUrls.push(result.meta.voiceUrl);
		if (result.meta.asrReferText) voiceAsrReferTexts.push(result.meta.asrReferText);
		if (result.type === "image" && result.localPath) {
			imageUrls.push(result.localPath);
			imageMediaTypes.push(result.contentType);
			attachmentLocalPaths.push(result.localPath);
		} else if (result.type === "voice" && result.localPath) {
			voiceAttachmentPaths.push(result.localPath);
			voiceTranscripts.push(result.transcript);
			voiceTranscriptSources.push(result.transcriptSource);
			attachmentLocalPaths.push(result.localPath);
		} else if (result.type === "other" && result.localPath) {
			otherAttachments.push(`[Attachment: ${result.localPath}]`);
			attachmentLocalPaths.push(result.localPath);
		} else if (result.type === "image-fallback") {
			imageUrls.push(result.attUrl);
			imageMediaTypes.push(result.contentType);
			attachmentLocalPaths.push(null);
		} else if (result.type === "voice-fallback") {
			voiceTranscripts.push(result.transcript);
			voiceTranscriptSources.push("asr");
			attachmentLocalPaths.push(null);
		} else if (result.type === "other-fallback") {
			otherAttachments.push(`[Attachment: ${result.filename}] (download failed)`);
			attachmentLocalPaths.push(null);
		}
	}
	return {
		attachmentInfo: otherAttachments.length > 0 ? "\n" + otherAttachments.join("\n") : "",
		imageUrls,
		imageMediaTypes,
		voiceAttachmentPaths,
		voiceAttachmentUrls,
		voiceAsrReferTexts,
		voiceTranscripts,
		voiceTranscriptSources,
		attachmentLocalPaths
	};
}
async function processVoiceAttachment(localPath, audioPath, att, asrReferText, cfg, downloadDir, log) {
	const wavUrl = att.voice_wav_url ? att.voice_wav_url.startsWith("//") ? `https:${att.voice_wav_url}` : att.voice_wav_url : "";
	const attUrl = att.url?.startsWith("//") ? `https:${att.url}` : att.url;
	const meta = {
		voiceUrl: wavUrl || attUrl || void 0,
		asrReferText: asrReferText || void 0
	};
	if (!resolveSTTConfig(cfg)) {
		if (asrReferText) {
			log?.debug?.(`Voice attachment: ${att.filename} (STT not configured, using asr_refer_text fallback)`);
			return {
				localPath,
				type: "voice",
				transcript: asrReferText,
				transcriptSource: "asr",
				meta
			};
		}
		log?.debug?.(`Voice attachment: ${att.filename} (STT not configured, skipping transcription)`);
		return {
			localPath,
			type: "voice",
			transcript: "[Voice message - transcription unavailable because STT is not configured]",
			transcriptSource: "fallback",
			meta
		};
	}
	if (!audioPath) {
		log?.debug?.(`Voice attachment: ${att.filename}, converting SILK→WAV...`);
		try {
			const wavResult = await getAudioAdapter().convertSilkToWav(localPath, downloadDir);
			if (wavResult) {
				audioPath = wavResult.wavPath;
				log?.debug?.(`Voice converted: ${wavResult.wavPath} (${getAudioAdapter().formatDuration(wavResult.duration)})`);
			} else audioPath = localPath;
		} catch (convertErr) {
			log?.error(`Voice conversion failed: ${convertErr instanceof Error ? convertErr.message : JSON.stringify(convertErr)}`);
			if (asrReferText) return {
				localPath,
				type: "voice",
				transcript: asrReferText,
				transcriptSource: "asr",
				meta
			};
			return {
				localPath,
				type: "voice",
				transcript: "[Voice message - format conversion failed]",
				transcriptSource: "fallback",
				meta
			};
		}
	}
	try {
		const transcript = await transcribeAudio(audioPath, cfg);
		if (transcript) {
			log?.debug?.(`STT transcript: ${transcript.slice(0, 100)}...`);
			return {
				localPath,
				type: "voice",
				transcript,
				transcriptSource: "stt",
				meta
			};
		}
		if (asrReferText) {
			log?.debug?.(`STT returned empty result, using asr_refer_text fallback`);
			return {
				localPath,
				type: "voice",
				transcript: asrReferText,
				transcriptSource: "asr",
				meta
			};
		}
		log?.debug?.(`STT returned empty result`);
		return {
			localPath,
			type: "voice",
			transcript: "[Voice message - transcription returned an empty result]",
			transcriptSource: "fallback",
			meta
		};
	} catch (sttErr) {
		log?.error(`STT failed: ${sttErr instanceof Error ? sttErr.message : JSON.stringify(sttErr)}`);
		if (asrReferText) return {
			localPath,
			type: "voice",
			transcript: asrReferText,
			transcriptSource: "asr",
			meta
		};
		return {
			localPath,
			type: "voice",
			transcript: "[Voice message - transcription failed]",
			transcriptSource: "fallback",
			meta
		};
	}
}
//#endregion
//#region extensions/qqbot/src/engine/access/resolve-policy.ts
function hasRealRestriction(list) {
	if (!list || list.length === 0) return false;
	return !list.every((entry) => String(entry).trim() === "*");
}
/**
* Derive the effective dmPolicy and groupPolicy applied at runtime.
*
* Caller should pass the raw `QQBotAccountConfig`. The resolver does
* not look at `groups[id]` overrides — per-group overrides are layered
* on top elsewhere (see `inbound-pipeline` mention gating).
*/
function resolveQQBotEffectivePolicies(input) {
	const allowFromRestricted = hasRealRestriction(input.allowFrom);
	const groupAllowFromRestricted = hasRealRestriction(input.groupAllowFrom);
	return {
		dmPolicy: input.dmPolicy ?? (allowFromRestricted ? "allowlist" : "open"),
		groupPolicy: input.groupPolicy ?? (groupAllowFromRestricted || allowFromRestricted ? "allowlist" : "open")
	};
}
//#endregion
//#region extensions/qqbot/src/engine/access/sender-match.ts
/**
* QQBot sender normalization and allowlist matching.
*
* Keeps QQ-specific quirks (the `qqbot:` prefix, uppercase-insensitive
* comparison) localized to this module so the policy engine itself can
* stay channel-agnostic.
*/
/** Normalize a single entry (openid): strip `qqbot:` prefix, uppercase, trim. */
function normalizeQQBotSenderId(raw) {
	if (typeof raw !== "string" && typeof raw !== "number") return "";
	return String(raw).trim().replace(/^qqbot:/i, "").toUpperCase();
}
/** Normalize an entire allowFrom list, dropping empty entries. */
function normalizeQQBotAllowFrom(list) {
	if (!list || list.length === 0) return [];
	const out = [];
	for (const entry of list) {
		const normalized = normalizeQQBotSenderId(entry);
		if (normalized) out.push(normalized);
	}
	return out;
}
/**
* Build a matcher closure suitable for passing to the policy engine's
* `isSenderAllowed` callback. The caller supplies the sender once, and
* the returned function can be invoked against different allowlists
* (DM allowlist vs group allowlist) without repeating normalization.
*/
function createQQBotSenderMatcher(senderId) {
	const normalizedSender = normalizeQQBotSenderId(senderId);
	return (allowFrom) => {
		if (allowFrom.length === 0) return false;
		if (allowFrom.includes("*")) return true;
		if (!normalizedSender) return false;
		return allowFrom.some((entry) => normalizeQQBotSenderId(entry) === normalizedSender);
	};
}
//#endregion
//#region extensions/qqbot/src/engine/access/types.ts
/** Structured reason codes used in logs and metrics. */
const QQBOT_ACCESS_REASON = {
	DM_POLICY_OPEN: "dm_policy_open",
	DM_POLICY_DISABLED: "dm_policy_disabled",
	DM_POLICY_ALLOWLISTED: "dm_policy_allowlisted",
	DM_POLICY_NOT_ALLOWLISTED: "dm_policy_not_allowlisted",
	DM_POLICY_EMPTY_ALLOWLIST: "dm_policy_empty_allowlist",
	GROUP_POLICY_ALLOWED: "group_policy_allowed",
	GROUP_POLICY_DISABLED: "group_policy_disabled",
	GROUP_POLICY_EMPTY_ALLOWLIST: "group_policy_empty_allowlist",
	GROUP_POLICY_NOT_ALLOWLISTED: "group_policy_not_allowlisted"
};
//#endregion
//#region extensions/qqbot/src/engine/access/access-control.ts
/**
* QQBot inbound access decision.
*
* This module is the single place where the QQBot engine decides
* whether an inbound message from a given sender is allowed to
* proceed into the outbound pipeline. The implementation mirrors the
* semantics of the framework-wide `resolveDmGroupAccessDecision`
* (`src/security/dm-policy-shared.ts`) but is kept standalone so the
* `engine/` layer does not pull in `openclaw/plugin-sdk/*` modules —
* a hard constraint shared with the standalone `openclaw-qqbot` build.
*
* If in the future we lift the zero-dependency rule in the engine
* layer, this file can be replaced by a thin adapter around the
* framework API with identical semantics.
*/
/**
* Evaluate the inbound access policy.
*
* Semantics (aligned with `resolveDmGroupAccessDecision`):
*   - Group message:
*     - `groupPolicy=disabled` → block
*     - `groupPolicy=open`     → allow
*     - `groupPolicy=allowlist`:
*         - empty effectiveGroupAllowFrom → block (empty_allowlist)
*         - sender not in list            → block (not_allowlisted)
*         - otherwise                     → allow
*   - Direct message:
*     - `dmPolicy=disabled`    → block
*     - `dmPolicy=open`        → allow
*     - `dmPolicy=allowlist`:
*         - empty effectiveAllowFrom → block (empty_allowlist)
*         - sender not in list       → block (not_allowlisted)
*         - otherwise                → allow
*
* The function never throws; callers can rely on the returned
* `decision`/`reasonCode` pair for branching.
*/
function resolveQQBotAccess(input) {
	const { dmPolicy, groupPolicy } = resolveQQBotEffectivePolicies(input);
	const rawGroupAllowFrom = input.groupAllowFrom && input.groupAllowFrom.length > 0 ? input.groupAllowFrom : input.allowFrom ?? [];
	const effectiveAllowFrom = normalizeQQBotAllowFrom(input.allowFrom);
	const effectiveGroupAllowFrom = normalizeQQBotAllowFrom(rawGroupAllowFrom);
	const isSenderAllowed = createQQBotSenderMatcher(input.senderId);
	if (input.isGroup) return evaluateGroupDecision({
		groupPolicy,
		dmPolicy,
		effectiveAllowFrom,
		effectiveGroupAllowFrom,
		isSenderAllowed
	});
	return evaluateDmDecision({
		groupPolicy,
		dmPolicy,
		effectiveAllowFrom,
		effectiveGroupAllowFrom,
		isSenderAllowed
	});
}
function evaluateGroupDecision(ctx) {
	const base = buildResultBase(ctx);
	if (ctx.groupPolicy === "disabled") return {
		...base,
		decision: "block",
		reasonCode: QQBOT_ACCESS_REASON.GROUP_POLICY_DISABLED,
		reason: "groupPolicy=disabled"
	};
	if (ctx.groupPolicy === "open") return {
		...base,
		decision: "allow",
		reasonCode: QQBOT_ACCESS_REASON.GROUP_POLICY_ALLOWED,
		reason: "groupPolicy=open"
	};
	if (ctx.effectiveGroupAllowFrom.length === 0) return {
		...base,
		decision: "block",
		reasonCode: QQBOT_ACCESS_REASON.GROUP_POLICY_EMPTY_ALLOWLIST,
		reason: "groupPolicy=allowlist (empty allowlist)"
	};
	if (!ctx.isSenderAllowed(ctx.effectiveGroupAllowFrom)) return {
		...base,
		decision: "block",
		reasonCode: QQBOT_ACCESS_REASON.GROUP_POLICY_NOT_ALLOWLISTED,
		reason: "groupPolicy=allowlist (not allowlisted)"
	};
	return {
		...base,
		decision: "allow",
		reasonCode: QQBOT_ACCESS_REASON.GROUP_POLICY_ALLOWED,
		reason: "groupPolicy=allowlist (allowlisted)"
	};
}
function evaluateDmDecision(ctx) {
	const base = buildResultBase(ctx);
	if (ctx.dmPolicy === "disabled") return {
		...base,
		decision: "block",
		reasonCode: QQBOT_ACCESS_REASON.DM_POLICY_DISABLED,
		reason: "dmPolicy=disabled"
	};
	if (ctx.dmPolicy === "open") return {
		...base,
		decision: "allow",
		reasonCode: QQBOT_ACCESS_REASON.DM_POLICY_OPEN,
		reason: "dmPolicy=open"
	};
	if (ctx.effectiveAllowFrom.length === 0) return {
		...base,
		decision: "block",
		reasonCode: QQBOT_ACCESS_REASON.DM_POLICY_EMPTY_ALLOWLIST,
		reason: "dmPolicy=allowlist (empty allowlist)"
	};
	if (!ctx.isSenderAllowed(ctx.effectiveAllowFrom)) return {
		...base,
		decision: "block",
		reasonCode: QQBOT_ACCESS_REASON.DM_POLICY_NOT_ALLOWLISTED,
		reason: "dmPolicy=allowlist (not allowlisted)"
	};
	return {
		...base,
		decision: "allow",
		reasonCode: QQBOT_ACCESS_REASON.DM_POLICY_ALLOWLISTED,
		reason: "dmPolicy=allowlist (allowlisted)"
	};
}
function buildResultBase(ctx) {
	return {
		effectiveAllowFrom: ctx.effectiveAllowFrom,
		effectiveGroupAllowFrom: ctx.effectiveGroupAllowFrom,
		dmPolicy: ctx.dmPolicy,
		groupPolicy: ctx.groupPolicy
	};
}
//#endregion
//#region extensions/qqbot/src/engine/ref/format-message-ref.ts
/**
* Format a quoted message reference into human-readable text for model context.
*
* This mirrors the independent version's `formatMessageReferenceForAgent` —
* processing attachments (download + STT) and combining them with parsed text.
*
* @param ref - The msg_elements[0] data from the QQ push event.
* @param ctx - Context containing appId, peerId, config, and logger.
* @param processor - Injected attachment processor (download + voice transcription).
*/
async function formatMessageReferenceForAgent(ref, ctx, processor) {
	if (!ref) return "";
	const { attachmentInfo, voiceTranscripts, voiceTranscriptSources, attachmentLocalPaths } = await processor.processAttachments(ref.attachments, ctx);
	const voiceText = processor.formatVoiceText(voiceTranscripts);
	const parsedContent = parseFaceTags(ref.content ?? "");
	const userContent = voiceText ? (parsedContent.trim() ? `${parsedContent}\n${voiceText}` : voiceText) + attachmentInfo : parsedContent + attachmentInfo;
	const attSummaries = buildAttachmentSummaries(ref.attachments, attachmentLocalPaths);
	if (attSummaries && voiceTranscripts.length > 0) {
		let voiceIdx = 0;
		for (const att of attSummaries) if (att.type === "voice" && voiceIdx < voiceTranscripts.length) {
			att.transcript = voiceTranscripts[voiceIdx];
			if (voiceIdx < voiceTranscriptSources.length) att.transcriptSource = voiceTranscriptSources[voiceIdx];
			voiceIdx++;
		}
	}
	const formattedAttachments = formatRefEntryForAgent({
		content: userContent.trim(),
		senderId: "",
		timestamp: Date.now(),
		attachments: attSummaries
	});
	if (formattedAttachments !== "[empty message]") return formattedAttachments;
	return userContent.trim() || "";
}
//#endregion
//#region extensions/qqbot/src/engine/gateway/inbound-pipeline.ts
/**
* Inbound pipeline — build a fully resolved InboundContext from a raw QueuedMessage.
*
* Responsibilities:
* 1. Route resolution
* 2. Attachment processing (download + STT)
* 3. Content building (parseFaceTags + voiceText + attachmentInfo)
* 4. Quote / reply-to resolution (three-level fallback)
* 5. RefIdx cache write (setRefIndex)
* 6. Body / agentBody / ctxPayload data assembly
*
* No message sending. Independently testable.
*/
/**
* Process a raw queued message through the full inbound pipeline and return
* a structured {@link InboundContext} ready for outbound dispatch.
*/
async function buildInboundContext(event, deps) {
	const { account, cfg, log, runtime } = deps;
	const isGroupChat = event.type === "guild" || event.type === "group";
	const peerId = event.type === "guild" ? event.channelId ?? "unknown" : event.type === "group" ? event.groupOpenid ?? "unknown" : event.senderId;
	const route = runtime.channel.routing.resolveAgentRoute({
		cfg,
		channel: "qqbot",
		accountId: account.accountId,
		peer: {
			kind: isGroupChat ? "group" : "direct",
			id: peerId
		}
	});
	const access = resolveQQBotAccess({
		isGroup: isGroupChat,
		senderId: event.senderId,
		allowFrom: account.config?.allowFrom,
		groupAllowFrom: account.config?.groupAllowFrom,
		dmPolicy: account.config?.dmPolicy,
		groupPolicy: account.config?.groupPolicy
	});
	const qualifiedTarget = isGroupChat ? event.type === "guild" ? `qqbot:channel:${event.channelId}` : `qqbot:group:${event.groupOpenid}` : event.type === "dm" ? `qqbot:dm:${event.guildId}` : `qqbot:c2c:${event.senderId}`;
	const fromAddress = qualifiedTarget;
	if (access.decision !== "allow") {
		log?.info(`Blocked qqbot inbound: decision=${access.decision} reasonCode=${access.reasonCode} reason=${access.reason} senderId=${normalizeQQBotSenderId(event.senderId)} accountId=${account.accountId} isGroup=${isGroupChat}`);
		return buildBlockedInboundContext({
			event,
			route,
			isGroupChat,
			peerId,
			qualifiedTarget,
			fromAddress,
			access
		});
	}
	const systemPrompts = [];
	if (account.systemPrompt) systemPrompts.push(account.systemPrompt);
	const typingPromise = deps.startTyping(event);
	const processed = await processAttachments(event.attachments, {
		accountId: account.accountId,
		cfg,
		log
	});
	const { attachmentInfo, imageUrls, imageMediaTypes, voiceAttachmentPaths, voiceAttachmentUrls, voiceAsrReferTexts, voiceTranscripts, voiceTranscriptSources, attachmentLocalPaths } = processed;
	const voiceText = formatVoiceText(voiceTranscripts);
	const hasAsrReferFallback = voiceTranscriptSources.includes("asr");
	const parsedContent = parseFaceTags(event.content);
	const userContent = voiceText ? (parsedContent.trim() ? `${parsedContent}\n${voiceText}` : voiceText) + attachmentInfo : parsedContent + attachmentInfo;
	const replyTo = await resolveQuote(event, account, cfg, log);
	const typingResult = await typingPromise;
	const inputNotifyRefIdx = typingResult.refIdx;
	const currentMsgIdx = event.msgIdx ?? inputNotifyRefIdx;
	if (currentMsgIdx) {
		const attSummaries = buildAttachmentSummaries(event.attachments, attachmentLocalPaths);
		if (attSummaries && voiceTranscripts.length > 0) {
			let voiceIdx = 0;
			for (const att of attSummaries) if (att.type === "voice" && voiceIdx < voiceTranscripts.length) {
				att.transcript = voiceTranscripts[voiceIdx];
				if (voiceIdx < voiceTranscriptSources.length) att.transcriptSource = voiceTranscriptSources[voiceIdx];
				voiceIdx++;
			}
		}
		setRefIndex(currentMsgIdx, {
			content: parsedContent,
			senderId: event.senderId,
			senderName: event.senderName,
			timestamp: new Date(event.timestamp).getTime(),
			attachments: attSummaries
		});
	}
	const envelopeOptions = runtime.channel.reply.resolveEnvelopeFormatOptions(cfg);
	const body = runtime.channel.reply.formatInboundEnvelope({
		channel: "qqbot",
		from: event.senderName ?? event.senderId,
		timestamp: new Date(event.timestamp).getTime(),
		body: userContent,
		chatType: isGroupChat ? "group" : "direct",
		sender: {
			id: event.senderId,
			name: event.senderName
		},
		envelope: envelopeOptions,
		...imageUrls.length > 0 ? { imageUrls } : {}
	});
	const uniqueVoicePaths = [...new Set(voiceAttachmentPaths)];
	const uniqueVoiceUrls = [...new Set(voiceAttachmentUrls)];
	const uniqueVoiceAsrReferTexts = [...new Set(voiceAsrReferTexts)].filter(Boolean);
	let quotePart = "";
	if (replyTo) quotePart = replyTo.body ? `[Quoted message begins]\n${replyTo.body}\n[Quoted message ends]\n` : `[Quoted message begins]\nOriginal content unavailable\n[Quoted message ends]\n`;
	const dynLines = [];
	if (imageUrls.length > 0) dynLines.push(`- Images: ${imageUrls.join(", ")}`);
	if (uniqueVoicePaths.length > 0 || uniqueVoiceUrls.length > 0) dynLines.push(`- Voice: ${[...uniqueVoicePaths, ...uniqueVoiceUrls].join(", ")}`);
	if (uniqueVoiceAsrReferTexts.length > 0) dynLines.push(`- ASR: ${uniqueVoiceAsrReferTexts.join(" | ")}`);
	const dynamicCtx = dynLines.length > 0 ? dynLines.join("\n") + "\n\n" : "";
	const userMessage = `${quotePart}${userContent}`;
	const agentBody = userContent.startsWith("/") ? userContent : `${dynamicCtx}${userMessage}`;
	const groupSystemPrompt = (systemPrompts.length > 0 ? systemPrompts.join("\n") : "") || void 0;
	const commandAuthorized = access.reasonCode === "dm_policy_open" || access.reasonCode === "dm_policy_allowlisted" || access.reasonCode === "group_policy_allowed" && access.effectiveGroupAllowFrom.length > 0 && access.groupPolicy === "allowlist";
	const localMediaPaths = [];
	const localMediaTypes = [];
	const remoteMediaUrls = [];
	const remoteMediaTypes = [];
	for (let i = 0; i < imageUrls.length; i++) {
		const u = imageUrls[i];
		const t = imageMediaTypes[i] ?? "image/png";
		if (u.startsWith("http://") || u.startsWith("https://")) {
			remoteMediaUrls.push(u);
			remoteMediaTypes.push(t);
		} else {
			localMediaPaths.push(u);
			localMediaTypes.push(t);
		}
	}
	return {
		event,
		route,
		isGroupChat,
		peerId,
		qualifiedTarget,
		fromAddress,
		parsedContent,
		userContent,
		quotePart,
		dynamicCtx,
		userMessage,
		agentBody,
		body,
		systemPrompts,
		groupSystemPrompt,
		attachments: processed,
		localMediaPaths,
		localMediaTypes,
		remoteMediaUrls,
		remoteMediaTypes,
		uniqueVoicePaths,
		uniqueVoiceUrls,
		uniqueVoiceAsrReferTexts,
		hasAsrReferFallback,
		voiceTranscriptSources,
		replyTo,
		commandAuthorized,
		blocked: false,
		accessDecision: access.decision,
		typing: { keepAlive: typingResult.keepAlive },
		inputNotifyRefIdx
	};
}
/**
* Build a stub InboundContext for blocked (unauthorized) messages.
*
* The gateway handler inspects `blocked` and skips outbound dispatch,
* so most fields can be left empty. We still populate routing/peer
* fields so logs and metrics remain meaningful.
*/
function buildBlockedInboundContext(params) {
	return {
		event: params.event,
		route: params.route,
		isGroupChat: params.isGroupChat,
		peerId: params.peerId,
		qualifiedTarget: params.qualifiedTarget,
		fromAddress: params.fromAddress,
		parsedContent: "",
		userContent: "",
		quotePart: "",
		dynamicCtx: "",
		userMessage: "",
		agentBody: "",
		body: "",
		systemPrompts: [],
		groupSystemPrompt: void 0,
		attachments: {
			attachmentInfo: "",
			imageUrls: [],
			imageMediaTypes: [],
			voiceAttachmentPaths: [],
			voiceAttachmentUrls: [],
			voiceAsrReferTexts: [],
			voiceTranscripts: [],
			voiceTranscriptSources: [],
			attachmentLocalPaths: []
		},
		localMediaPaths: [],
		localMediaTypes: [],
		remoteMediaUrls: [],
		remoteMediaTypes: [],
		uniqueVoicePaths: [],
		uniqueVoiceUrls: [],
		uniqueVoiceAsrReferTexts: [],
		hasAsrReferFallback: false,
		voiceTranscriptSources: [],
		replyTo: void 0,
		commandAuthorized: false,
		blocked: true,
		blockReason: params.access.reason,
		blockReasonCode: params.access.reasonCode,
		accessDecision: params.access.decision,
		typing: { keepAlive: null },
		inputNotifyRefIdx: void 0
	};
}
async function resolveQuote(event, account, cfg, log) {
	if (!event.refMsgIdx) return;
	const refEntry = getRefIndex(event.refMsgIdx);
	if (refEntry) {
		log?.debug?.(`Quote detected via refMsgIdx cache: refMsgIdx=${event.refMsgIdx}, sender=${refEntry.senderName ?? refEntry.senderId}`);
		return {
			id: event.refMsgIdx,
			body: formatRefEntryForAgent(refEntry),
			sender: refEntry.senderName ?? refEntry.senderId,
			isQuote: true
		};
	}
	if (event.msgType === 103 && event.msgElements?.[0]) try {
		const refElement = event.msgElements[0];
		const refData = {
			content: refElement.content ?? "",
			attachments: refElement.attachments
		};
		const attachmentProcessor = {
			processAttachments: async (atts, refCtx) => {
				const result = await processAttachments(atts, {
					accountId: account.accountId,
					cfg: refCtx.cfg,
					log: refCtx.log
				});
				return {
					attachmentInfo: result.attachmentInfo,
					voiceTranscripts: result.voiceTranscripts,
					voiceTranscriptSources: result.voiceTranscriptSources,
					attachmentLocalPaths: result.attachmentLocalPaths
				};
			},
			formatVoiceText: (transcripts) => formatVoiceText(transcripts)
		};
		const refPeerId = event.type === "group" && event.groupOpenid ? event.groupOpenid : event.senderId;
		const refBody = await formatMessageReferenceForAgent(refData, {
			appId: account.appId,
			peerId: refPeerId,
			cfg: account.config,
			log
		}, attachmentProcessor);
		log?.debug?.(`Quote detected via msg_elements[0] (cache miss): id=${event.refMsgIdx}, content="${(refBody ?? "").slice(0, 80)}..."`);
		return {
			id: event.refMsgIdx,
			body: refBody || void 0,
			isQuote: true
		};
	} catch (refErr) {
		log?.error(`Failed to format quoted message from msg_elements: ${String(refErr)}`);
	}
	else log?.debug?.(`Quote detected but no cache and msgType=${event.msgType}: refMsgIdx=${event.refMsgIdx}`);
	return {
		id: event.refMsgIdx,
		isQuote: true
	};
}
//#endregion
//#region extensions/qqbot/src/engine/utils/image-size.ts
/**
* Image dimension helpers for QQ Bot markdown image syntax.
*
* QQ Bot markdown images use `![#widthpx #heightpx](url)`.
*/
/** Default dimensions used when probing fails. */
const DEFAULT_IMAGE_SIZE = {
	width: 512,
	height: 512
};
/**
* Parse image dimensions from the PNG header.
*/
function parsePngSize(buffer) {
	if (buffer.length < 24) return null;
	if (buffer[0] !== 137 || buffer[1] !== 80 || buffer[2] !== 78 || buffer[3] !== 71) return null;
	return {
		width: buffer.readUInt32BE(16),
		height: buffer.readUInt32BE(20)
	};
}
/** Parse image dimensions from JPEG SOF0/SOF2 markers. */
function parseJpegSize(buffer) {
	if (buffer.length < 4) return null;
	if (buffer[0] !== 255 || buffer[1] !== 216) return null;
	let offset = 2;
	while (offset < buffer.length - 9) {
		if (buffer[offset] !== 255) {
			offset++;
			continue;
		}
		const marker = buffer[offset + 1];
		if (marker === 192 || marker === 194) {
			if (offset + 9 <= buffer.length) {
				const height = buffer.readUInt16BE(offset + 5);
				return {
					width: buffer.readUInt16BE(offset + 7),
					height
				};
			}
		}
		if (offset + 3 < buffer.length) {
			const blockLength = buffer.readUInt16BE(offset + 2);
			offset += 2 + blockLength;
		} else break;
	}
	return null;
}
/** Parse image dimensions from the GIF header. */
function parseGifSize(buffer) {
	if (buffer.length < 10) return null;
	const signature = buffer.toString("ascii", 0, 6);
	if (signature !== "GIF87a" && signature !== "GIF89a") return null;
	return {
		width: buffer.readUInt16LE(6),
		height: buffer.readUInt16LE(8)
	};
}
/** Parse image dimensions from WebP headers. */
function parseWebpSize(buffer) {
	if (buffer.length < 30) return null;
	const riff = buffer.toString("ascii", 0, 4);
	const webp = buffer.toString("ascii", 8, 12);
	if (riff !== "RIFF" || webp !== "WEBP") return null;
	const chunkType = buffer.toString("ascii", 12, 16);
	if (chunkType === "VP8 ") {
		if (buffer.length >= 30 && buffer[23] === 157 && buffer[24] === 1 && buffer[25] === 42) return {
			width: buffer.readUInt16LE(26) & 16383,
			height: buffer.readUInt16LE(28) & 16383
		};
	}
	if (chunkType === "VP8L") {
		if (buffer.length >= 25 && buffer[20] === 47) {
			const bits = buffer.readUInt32LE(21);
			return {
				width: (bits & 16383) + 1,
				height: (bits >> 14 & 16383) + 1
			};
		}
	}
	if (chunkType === "VP8X") {
		if (buffer.length >= 30) return {
			width: (buffer[24] | buffer[25] << 8 | buffer[26] << 16) + 1,
			height: (buffer[27] | buffer[28] << 8 | buffer[29] << 16) + 1
		};
	}
	return null;
}
/** Parse image dimensions from raw image bytes. */
function parseImageSize(buffer) {
	return parsePngSize(buffer) ?? parseJpegSize(buffer) ?? parseGifSize(buffer) ?? parseWebpSize(buffer);
}
/**
* SSRF policy for image-dimension probing.  Generic public-network-only blocking
* (no hostname allowlist) because markdown image URLs can legitimately point to
* any public host, not just QQ-owned CDNs.
*/
const IMAGE_PROBE_SSRF_POLICY = {};
/**
* Fetch image dimensions from a public URL using only the first 64 KB.
*
* Uses {@link fetchRemoteMedia} with SSRF guard to block probes against
* private/reserved/loopback/link-local/metadata destinations.
*/
async function getImageSizeFromUrl(url, timeoutMs = 5e3) {
	try {
		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
		try {
			const { buffer } = await getPlatformAdapter().fetchMedia({
				url,
				maxBytes: 65536,
				maxRedirects: 0,
				ssrfPolicy: IMAGE_PROBE_SSRF_POLICY,
				requestInit: {
					signal: controller.signal,
					headers: {
						Range: "bytes=0-65535",
						"User-Agent": "QQBot-Image-Size-Detector/1.0"
					}
				}
			});
			const size = parseImageSize(buffer);
			if (size) debugLog(`[image-size] Got size from URL: ${size.width}x${size.height} - ${url.slice(0, 60)}...`);
			return size;
		} finally {
			clearTimeout(timeoutId);
		}
	} catch (err) {
		debugLog(`[image-size] Error fetching ${url.slice(0, 60)}...: ${formatErrorMessage(err)}`);
		return null;
	}
}
/** Parse image dimensions from a Base64 data URL. */
function getImageSizeFromDataUrl(dataUrl) {
	try {
		const matches = dataUrl.match(/^data:image\/[^;]+;base64,(.+)$/);
		if (!matches) return null;
		const base64Data = matches[1];
		const size = parseImageSize(Buffer$1.from(base64Data, "base64"));
		if (size) debugLog(`[image-size] Got size from Base64: ${size.width}x${size.height}`);
		return size;
	} catch (err) {
		debugLog(`[image-size] Error parsing Base64: ${formatErrorMessage(err)}`);
		return null;
	}
}
/**
* Resolve image dimensions from either an HTTP URL or a Base64 data URL.
*/
async function getImageSize(source) {
	if (source.startsWith("data:")) return getImageSizeFromDataUrl(source);
	if (source.startsWith("http://") || source.startsWith("https://")) return getImageSizeFromUrl(source);
	return null;
}
/** Format a markdown image with QQ Bot width/height annotations. */
function formatQQBotMarkdownImage(url, size) {
	const { width, height } = size ?? DEFAULT_IMAGE_SIZE;
	return `![#${width}px #${height}px](${url})`;
}
/** Return true when markdown already contains QQ Bot size annotations. */
function hasQQBotImageSize(markdownImage) {
	return /!\[#\d+px\s+#\d+px\]/.test(markdownImage);
}
//#endregion
//#region extensions/qqbot/src/engine/messaging/decode-media-path.ts
/**
* Normalize a file path by expanding `~` to the home directory and trimming.
*
* This is a minimal re-implementation of `utils/platform.ts#normalizePath`
* so that `core/` remains self-contained.
*/
function normalizePath(p) {
	let result = p.trim();
	if (result.startsWith("~/") || result === "~") {
		const home = typeof process !== "undefined" ? process.env.HOME ?? process.env.USERPROFILE : void 0;
		if (home) result = result === "~" ? home : `${home}${result.slice(1)}`;
	}
	return result;
}
/**
* Decode a media path by stripping `MEDIA:`, expanding `~`, and unescaping
* octal/UTF-8 byte sequences.
*
* @param raw - Raw path string from a media tag.
* @param log - Optional logger for decode diagnostics.
* @returns The decoded, normalized media path.
*/
function decodeMediaPath(raw, log) {
	let mediaPath = raw;
	if (mediaPath.startsWith("MEDIA:")) mediaPath = mediaPath.slice(6);
	mediaPath = normalizePath(mediaPath);
	mediaPath = mediaPath.replace(/\\\\/g, "\\");
	const isWinLocal = /^[a-zA-Z]:[\\/]/.test(mediaPath) || mediaPath.startsWith("\\\\");
	try {
		const hasOctal = /\\[0-7]{1,3}/.test(mediaPath);
		const hasNonASCII = /[\u0080-\u00FF]/.test(mediaPath);
		if (!isWinLocal && (hasOctal || hasNonASCII)) {
			log?.debug?.(`Decoding path with mixed encoding: ${mediaPath}`);
			const decoded = mediaPath.replace(/\\([0-7]{1,3})/g, (_, octal) => {
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
				log?.debug?.(`Successfully decoded path: ${mediaPath}`);
			}
		}
	} catch (decodeErr) {
		log?.error(`Path decode error: ${String(decodeErr)}`);
	}
	return mediaPath;
}
//#endregion
//#region extensions/qqbot/src/engine/messaging/outbound-deliver.ts
/** Maximum text length for a single QQ Bot message. */
const TEXT_CHUNK_LIMIT = 5e3;
function resolveMediaTargetContext(event, account) {
	return {
		targetType: event.type === "c2c" ? "c2c" : event.type === "group" ? "group" : event.type === "dm" ? "dm" : "channel",
		targetId: event.type === "c2c" ? event.senderId : event.type === "group" ? event.groupOpenid : event.type === "dm" ? event.guildId : event.channelId,
		account,
		replyToId: event.messageId
	};
}
async function autoMediaBatch(params) {
	for (const mediaUrl of params.mediaUrls) try {
		const result = await params.mediaSender.sendMedia({
			to: params.qualifiedTarget,
			text: "",
			mediaUrl,
			accountId: params.account.accountId,
			replyToId: params.replyToId,
			account: params.account
		});
		if (result.error) {
			params.log?.error(params.onResultError(mediaUrl, result.error));
			continue;
		}
		const successMessage = params.onSuccess?.(mediaUrl);
		if (successMessage) params.log?.info(successMessage);
	} catch (err) {
		params.log?.error(params.onThrownError(mediaUrl, formatErrorMessage(err)));
	}
}
async function sendTextChunkToTarget(params) {
	const { account, event, text, consumeQuoteRef, allowDm } = params;
	const ref = consumeQuoteRef();
	const target = buildDeliveryTarget(event);
	if (target.type === "dm" && !allowDm) return;
	return await sendText(target, text, accountToCreds(account), {
		msgId: event.messageId,
		messageReference: ref
	});
}
async function sendTextChunks(text, event, actx, sendWithRetry, consumeQuoteRef, deps) {
	const { account, log } = actx;
	await sendTextChunksWithRetry({
		account,
		event,
		chunks: deps.chunkText(text, TEXT_CHUNK_LIMIT),
		sendWithRetry,
		consumeQuoteRef,
		allowDm: true,
		log,
		onSuccess: (chunk) => `Sent text chunk (${chunk.length}/${text.length} chars): ${chunk.slice(0, 50)}...`,
		onError: (err) => `Failed to send text chunk: ${formatErrorMessage(err)}`
	});
}
async function sendTextChunksWithRetry(params) {
	const { account, event, chunks, sendWithRetry, consumeQuoteRef, allowDm, log } = params;
	for (const chunk of chunks) try {
		await sendWithRetry((token) => sendTextChunkToTarget({
			account,
			event,
			token,
			text: chunk,
			consumeQuoteRef,
			allowDm
		}));
		log?.info(params.onSuccess(chunk));
	} catch (err) {
		log?.error(params.onError(err));
	}
}
async function sendWithResultLogging(params) {
	try {
		const result = await params.run();
		if (result.error) {
			params.log?.error(params.onError(result.error));
			return;
		}
		const successMessage = params.onSuccess?.();
		if (successMessage) params.log?.info(successMessage);
	} catch (err) {
		params.log?.error(params.onError(formatErrorMessage(err)));
	}
}
async function sendPhotoWithLogging(params) {
	await sendWithResultLogging({
		run: async () => await params.mediaSender.sendPhoto(params.target, params.imageUrl),
		log: params.log,
		onSuccess: params.onSuccess ? () => params.onSuccess?.(params.imageUrl) : void 0,
		onError: params.onError
	});
}
/** Send voice with a 45s timeout guard. */
async function sendVoiceWithTimeout(target, voicePath, account, mediaSender, log) {
	const uploadFormats = account.config?.audioFormatPolicy?.uploadDirectFormats ?? account.config?.voiceDirectUploadFormats;
	const transcodeEnabled = account.config?.audioFormatPolicy?.transcodeEnabled !== false;
	const voiceTimeout = 45e3;
	const ac = new AbortController();
	try {
		const result = await Promise.race([mediaSender.sendVoice(target, voicePath, uploadFormats, transcodeEnabled).then((r) => {
			if (ac.signal.aborted) {
				log?.debug?.(`sendVoice completed after timeout, suppressing late delivery`);
				return {
					channel: "qqbot",
					error: "Voice send completed after timeout (suppressed)"
				};
			}
			return r;
		}), new Promise((resolve) => setTimeout(() => {
			ac.abort();
			resolve({
				channel: "qqbot",
				error: "Voice send timed out and was skipped"
			});
		}, voiceTimeout))]);
		if (result.error) log?.error(`sendVoice error: ${result.error}`);
	} catch (err) {
		log?.error(`sendVoice unexpected error: ${formatErrorMessage(err)}`);
	}
}
/**
* Parse media tags from the reply text and send them in order.
*
* @returns `true` when media tags were found and handled; `false` when the caller
* should continue through the plain-text pipeline.
*/
async function parseAndSendMediaTags(replyText, event, actx, sendWithRetry, consumeQuoteRef, deps) {
	const { account, log } = actx;
	const text = normalizeMediaTags(replyText);
	const mediaTagMatches = [...text.matchAll(/<(qqimg|qqvoice|qqvideo|qqfile|qqmedia)>([^<>]+)<\/(?:qqimg|qqvoice|qqvideo|qqfile|qqmedia|img)>/gi)];
	if (mediaTagMatches.length === 0) return {
		handled: false,
		normalizedText: text
	};
	const tagCounts = mediaTagMatches.reduce((acc, m) => {
		const t = normalizeLowercaseStringOrEmpty(m[1]);
		acc[t] = (acc[t] ?? 0) + 1;
		return acc;
	}, {});
	log?.debug?.(`Detected media tags: ${Object.entries(tagCounts).map(([k, v]) => `${v} <${k}>`).join(", ")}`);
	const sendQueue = [];
	let lastIndex = 0;
	const regex2 = /<(qqimg|qqvoice|qqvideo|qqfile|qqmedia)>([^<>]+)<\/(?:qqimg|qqvoice|qqvideo|qqfile|qqmedia|img)>/gi;
	let match;
	while ((match = regex2.exec(text)) !== null) {
		const textBefore = text.slice(lastIndex, match.index).replace(/\n{3,}/g, "\n\n").trim();
		if (textBefore) sendQueue.push({
			type: "text",
			content: filterInternalMarkers(textBefore)
		});
		const tagName = normalizeLowercaseStringOrEmpty(match[1]);
		const mediaPath = decodeMediaPath(normalizeOptionalString(match[2]) ?? "", log);
		if (mediaPath) {
			const itemType = {
				qqmedia: "media",
				qqvoice: "voice",
				qqvideo: "video",
				qqfile: "file"
			}[tagName] ?? "image";
			sendQueue.push({
				type: itemType,
				content: mediaPath
			});
			log?.debug?.(`Found ${itemType} in <${tagName}>: ${mediaPath}`);
		}
		lastIndex = match.index + match[0].length;
	}
	const textAfter = text.slice(lastIndex).replace(/\n{3,}/g, "\n\n").trim();
	if (textAfter) sendQueue.push({
		type: "text",
		content: filterInternalMarkers(textAfter)
	});
	log?.debug?.(`Send queue: ${sendQueue.map((item) => item.type).join(" -> ")}`);
	const mediaTarget = resolveMediaTargetContext(event, account);
	for (const item of sendQueue) if (item.type === "text") await sendTextChunks(item.content, event, actx, sendWithRetry, consumeQuoteRef, deps);
	else if (item.type === "image") await sendPhotoWithLogging({
		target: mediaTarget,
		imageUrl: item.content,
		mediaSender: deps.mediaSender,
		log,
		onError: (error) => `sendPhoto error: ${error}`
	});
	else if (item.type === "voice") await sendVoiceWithTimeout(mediaTarget, item.content, account, deps.mediaSender, log);
	else if (item.type === "video") await sendWithResultLogging({
		run: async () => await deps.mediaSender.sendVideoMsg(mediaTarget, item.content),
		log,
		onError: (error) => `sendVideoMsg error: ${error}`
	});
	else if (item.type === "file") await sendWithResultLogging({
		run: async () => await deps.mediaSender.sendDocument(mediaTarget, item.content),
		log,
		onError: (error) => `sendDocument error: ${error}`
	});
	else if (item.type === "media") await sendWithResultLogging({
		run: async () => await deps.mediaSender.sendMedia({
			to: actx.qualifiedTarget,
			text: "",
			mediaUrl: item.content,
			accountId: account.accountId,
			replyToId: event.messageId,
			account
		}),
		log,
		onError: (error) => `sendMedia(auto) error: ${error}`
	});
	return {
		handled: true,
		normalizedText: text
	};
}
/**
* Send a reply that does not contain structured media tags.
* Handles markdown image embeds, Base64 media, plain-text chunking, and local media routing.
*/
async function sendPlainReply(payload, replyText, event, actx, sendWithRetry, consumeQuoteRef, toolMediaUrls, deps) {
	const { account, qualifiedTarget, log } = actx;
	const collectedImageUrls = [];
	const localMediaToSend = [];
	const collectImageUrl = (url) => {
		if (!url) return false;
		const isHttpUrl = url.startsWith("http://") || url.startsWith("https://");
		const isDataUrl = url.startsWith("data:image/");
		if (isHttpUrl || isDataUrl) {
			if (!collectedImageUrls.includes(url)) {
				collectedImageUrls.push(url);
				log?.debug?.(`Collected ${isDataUrl ? "Base64" : "media URL"}: ${isDataUrl ? `(length: ${url.length})` : url.slice(0, 80) + "..."}`);
			}
			return true;
		}
		if (isLocalPath(url)) {
			if (!localMediaToSend.includes(url)) {
				localMediaToSend.push(url);
				log?.debug?.(`Collected local media for auto-routing: ${url}`);
			}
			return true;
		}
		return false;
	};
	if (payload.mediaUrls?.length) for (const url of payload.mediaUrls) collectImageUrl(url);
	if (payload.mediaUrl) collectImageUrl(payload.mediaUrl);
	const mdMatches = [...replyText.matchAll(/!\[([^\]]*)\]\(([^)]+)\)/gi)];
	for (const m of mdMatches) {
		const url = m[2]?.trim();
		if (url && !collectedImageUrls.includes(url)) {
			if (url.startsWith("http://") || url.startsWith("https://")) {
				collectedImageUrls.push(url);
				log?.debug?.(`Extracted HTTP image from markdown: ${url.slice(0, 80)}...`);
			} else if (isLocalPath(url)) {
				if (!localMediaToSend.includes(url)) {
					localMediaToSend.push(url);
					log?.debug?.(`Collected local media from markdown for auto-routing: ${url}`);
				}
			}
		}
	}
	const bareUrlMatches = [...replyText.matchAll(/(?<![(["'])(https?:\/\/[^\s)"'<>]+\.(?:png|jpg|jpeg|gif|webp)(?:\?[^\s"'<>]*)?)/gi)];
	for (const m of bareUrlMatches) {
		const url = m[1];
		if (url && !collectedImageUrls.includes(url)) {
			collectedImageUrls.push(url);
			log?.debug?.(`Extracted bare image URL: ${url.slice(0, 80)}...`);
		}
	}
	const useMarkdown = account.markdownSupport;
	log?.debug?.(`Markdown mode: ${useMarkdown}, images: ${collectedImageUrls.length}`);
	let textWithoutImages = filterInternalMarkers(replyText);
	for (const m of mdMatches) {
		const url = m[2]?.trim();
		if (url && !url.startsWith("http://") && !url.startsWith("https://") && !isLocalPath(url)) textWithoutImages = textWithoutImages.replace(m[0], "").trim();
	}
	if (useMarkdown) await sendMarkdownReply(textWithoutImages, collectedImageUrls, mdMatches, bareUrlMatches, event, actx, sendWithRetry, consumeQuoteRef, deps);
	else await sendPlainTextReply(textWithoutImages, collectedImageUrls, mdMatches, bareUrlMatches, event, actx, sendWithRetry, consumeQuoteRef, deps);
	if (localMediaToSend.length > 0) {
		log?.debug?.(`Sending ${localMediaToSend.length} local media via sendMedia auto-routing`);
		await autoMediaBatch({
			qualifiedTarget,
			account,
			replyToId: event.messageId,
			mediaUrls: localMediaToSend,
			mediaSender: deps.mediaSender,
			log,
			onSuccess: (mediaPath) => `Sent local media: ${mediaPath}`,
			onResultError: (mediaPath, error) => `sendMedia(auto) error for ${mediaPath}: ${error}`,
			onThrownError: (mediaPath, error) => `sendMedia(auto) failed for ${mediaPath}: ${error}`
		});
	}
	if (toolMediaUrls.length > 0) {
		log?.debug?.(`Forwarding ${toolMediaUrls.length} tool-collected media URL(s) after block deliver`);
		await autoMediaBatch({
			qualifiedTarget,
			account,
			replyToId: event.messageId,
			mediaUrls: toolMediaUrls,
			mediaSender: deps.mediaSender,
			log,
			onSuccess: (mediaUrl) => `Forwarded tool media: ${mediaUrl.slice(0, 80)}...`,
			onResultError: (_mediaUrl, error) => `Tool media forward error: ${error}`,
			onThrownError: (_mediaUrl, error) => `Tool media forward failed: ${error}`
		});
		toolMediaUrls.length = 0;
	}
}
async function sendMarkdownReply(textWithoutImages, imageUrls, mdMatches, bareUrlMatches, event, actx, sendWithRetry, consumeQuoteRef, deps) {
	const { account, log } = actx;
	const httpImageUrls = [];
	const base64ImageUrls = [];
	for (const url of imageUrls) if (url.startsWith("data:image/")) base64ImageUrls.push(url);
	else if (url.startsWith("http://") || url.startsWith("https://")) httpImageUrls.push(url);
	log?.debug?.(`Image classification: httpUrls=${httpImageUrls.length}, base64=${base64ImageUrls.length}`);
	if (base64ImageUrls.length > 0) {
		log?.debug?.(`Sending ${base64ImageUrls.length} image(s) via Rich Media API...`);
		for (const imageUrl of base64ImageUrls) try {
			const target = buildDeliveryTarget(event);
			const creds = accountToCreds(account);
			if (target.type === "c2c" || target.type === "group") await withTokenRetry(creds, async () => {
				await sendImage(target, imageUrl, creds, { msgId: event.messageId });
			});
			else log?.debug?.(`${target.type} does not support rich media, skipping Base64 image`);
			log?.debug?.(`Sent Base64 image via Rich Media API (size: ${imageUrl.length} chars)`);
		} catch (imgErr) {
			log?.error(`Failed to send Base64 image via Rich Media API: ${String(imgErr)}`);
		}
	}
	const existingMdUrls = new Set(mdMatches.map((m) => m[2]));
	const imagesToAppend = [];
	for (const url of httpImageUrls) if (!existingMdUrls.has(url)) try {
		const size = await getImageSize(url);
		imagesToAppend.push(formatQQBotMarkdownImage(url, size));
		log?.debug?.(`Formatted HTTP image: ${size ? `${size.width}x${size.height}` : "default size"} - ${url.slice(0, 60)}...`);
	} catch (err) {
		log?.debug?.(`Failed to get image size, using default: ${formatErrorMessage(err)}`);
		imagesToAppend.push(formatQQBotMarkdownImage(url, null));
	}
	let result = textWithoutImages;
	for (const m of mdMatches) {
		const fullMatch = m[0];
		const imgUrl = m[2];
		if ((imgUrl.startsWith("http://") || imgUrl.startsWith("https://")) && !hasQQBotImageSize(fullMatch)) try {
			const size = await getImageSize(imgUrl);
			result = result.replace(fullMatch, formatQQBotMarkdownImage(imgUrl, size));
			log?.debug?.(`Updated image with size: ${size ? `${size.width}x${size.height}` : "default"} - ${imgUrl.slice(0, 60)}...`);
		} catch (err) {
			log?.debug?.(`Failed to get image size for existing md, using default: ${formatErrorMessage(err)}`);
			result = result.replace(fullMatch, formatQQBotMarkdownImage(imgUrl, null));
		}
	}
	for (const m of bareUrlMatches) result = result.replace(m[0], "").trim();
	if (imagesToAppend.length > 0) {
		result = result.trim();
		result = result ? result + "\n\n" + imagesToAppend.join("\n") : imagesToAppend.join("\n");
	}
	if (result.trim()) await sendTextChunksWithRetry({
		account,
		event,
		chunks: deps.chunkText(result, TEXT_CHUNK_LIMIT),
		sendWithRetry,
		consumeQuoteRef,
		allowDm: true,
		log,
		onSuccess: (chunk) => `Sent markdown chunk (${chunk.length}/${result.length} chars) with ${httpImageUrls.length} HTTP images (${event.type})`,
		onError: (err) => `Failed to send markdown message chunk: ${formatErrorMessage(err)}`
	});
}
async function sendPlainTextReply(textWithoutImages, imageUrls, mdMatches, bareUrlMatches, event, actx, sendWithRetry, consumeQuoteRef, deps) {
	const { account, log } = actx;
	const imgMediaTarget = resolveMediaTargetContext(event, account);
	let result = textWithoutImages;
	for (const m of mdMatches) result = result.replace(m[0], "").trim();
	for (const m of bareUrlMatches) result = result.replace(m[0], "").trim();
	if (result && event.type !== "c2c") result = result.replace(/([a-zA-Z0-9])\.([a-zA-Z0-9])/g, "$1_$2");
	try {
		for (const imageUrl of imageUrls) await sendPhotoWithLogging({
			target: imgMediaTarget,
			imageUrl,
			mediaSender: deps.mediaSender,
			log,
			onSuccess: (nextImageUrl) => `Sent image via sendPhoto: ${nextImageUrl.slice(0, 80)}...`,
			onError: (error) => `Failed to send image: ${error}`
		});
		if (result.trim()) await sendTextChunksWithRetry({
			account,
			event,
			chunks: deps.chunkText(result, TEXT_CHUNK_LIMIT),
			sendWithRetry,
			consumeQuoteRef,
			allowDm: false,
			log,
			onSuccess: (chunk) => `Sent text chunk (${chunk.length}/${result.length} chars) (${event.type})`,
			onError: (err) => `Send failed: ${formatErrorMessage(err)}`
		});
	} catch (err) {
		log?.error(`Send failed: ${formatErrorMessage(err)}`);
	}
}
//#endregion
//#region extensions/qqbot/src/engine/messaging/reply-dispatcher.ts
/**
* Reply dispatcher — structured payload handling and text routing.
*
* Uses the unified `sender.ts` business function layer for all message
* sending. TTS is injected via `ReplyDispatcherDeps`.
*/
/** Send a message and retry once if the token appears to have expired. */
async function sendWithTokenRetry(appId, clientSecret, sendFn, log, accountId) {
	return withTokenRetry({
		appId,
		clientSecret
	}, sendFn, log, accountId);
}
/** Route a text message to the correct QQ target type. */
async function sendTextToTarget(ctx, text, refIdx) {
	const { target, account } = ctx;
	const deliveryTarget = buildDeliveryTarget(target);
	const creds = accountToCreds(account);
	await withTokenRetry(creds, async () => {
		await sendText(deliveryTarget, text, creds, {
			msgId: target.messageId,
			messageReference: refIdx
		});
	}, ctx.log, account.accountId);
}
/** Best-effort delivery for error text back to the user. */
async function sendErrorToTarget(ctx, errorText) {
	try {
		await sendTextToTarget(ctx, errorText);
	} catch (sendErr) {
		ctx.log?.error(`Failed to send error message: ${String(sendErr)}`);
	}
}
/**
* Handle a structured payload prefixed with `QQBOT_PAYLOAD:`.
* Returns true when the reply was handled here, otherwise false.
*/
async function handleStructuredPayload(ctx, replyText, recordActivity, deps) {
	const { account: _account, log } = ctx;
	const payloadResult = parseQQBotPayload(replyText);
	if (!payloadResult.isPayload) return false;
	if (payloadResult.error) {
		log?.error(`Payload parse error: ${payloadResult.error}`);
		return true;
	}
	if (!payloadResult.payload) return true;
	const parsedPayload = payloadResult.payload;
	const unknownPayload = payloadResult.payload;
	log?.info(`Detected structured payload, type: ${parsedPayload.type}`);
	if (isCronReminderPayload(parsedPayload)) {
		log?.debug?.(`Processing cron_reminder payload`);
		const cronMessage = encodePayloadForCron(parsedPayload);
		const confirmText = `⏰ Reminder scheduled. It will be sent at the configured time: "${parsedPayload.content}"`;
		try {
			await sendTextToTarget(ctx, confirmText);
			log?.debug?.(`Cron reminder confirmation sent, cronMessage: ${cronMessage}`);
		} catch (err) {
			log?.error(`Failed to send cron confirmation: ${formatErrorMessage(err)}`);
		}
		recordActivity();
		return true;
	}
	if (isMediaPayload(parsedPayload)) {
		log?.debug?.(`Processing media payload, mediaType: ${parsedPayload.mediaType}`);
		if (parsedPayload.mediaType === "image") await handleImagePayload(ctx, parsedPayload);
		else if (parsedPayload.mediaType === "audio") await handleAudioPayload(ctx, parsedPayload, deps);
		else if (parsedPayload.mediaType === "video") await handleVideoPayload(ctx, parsedPayload);
		else if (parsedPayload.mediaType === "file") await handleFilePayload(ctx, parsedPayload);
		else log?.error(`Unknown media type: ${JSON.stringify(parsedPayload.mediaType)}`);
		recordActivity();
		return true;
	}
	const payloadType = typeof unknownPayload === "object" && unknownPayload !== null && "type" in unknownPayload && typeof unknownPayload.type === "string" ? unknownPayload.type : "unknown";
	log?.error(`Unknown payload type: ${payloadType}`);
	return true;
}
function formatMediaTypeLabel(mediaType) {
	return mediaType[0].toUpperCase() + mediaType.slice(1);
}
function validateStructuredPayloadLocalPath(ctx, payloadPath, mediaType) {
	const allowedPath = resolveQQBotPayloadLocalFilePath(payloadPath);
	if (allowedPath) return allowedPath;
	ctx.log?.error(`Blocked ${mediaType} payload local path outside QQ Bot media storage`);
	return null;
}
function isRemoteHttpUrl(p) {
	return p.startsWith("http://") || p.startsWith("https://");
}
function isInlineImageDataUrl(p) {
	return /^data:image\/[^;]+;base64,/i.test(p);
}
function resolveStructuredPayloadPath(ctx, payload, mediaType) {
	const originalPath = payload.path ?? "";
	const normalizedPath = normalizePath$1(originalPath);
	const isHttpUrl = isRemoteHttpUrl(normalizedPath);
	const resolvedPath = isHttpUrl ? normalizedPath : validateStructuredPayloadLocalPath(ctx, originalPath, mediaType);
	if (!resolvedPath) return null;
	if (!resolvedPath.trim()) {
		ctx.log?.error(`[qqbot:${ctx.account.accountId}] ${formatMediaTypeLabel(mediaType)} missing path`);
		return null;
	}
	return {
		path: resolvedPath,
		isHttpUrl
	};
}
function sanitizeForLog(value, maxLen = 200) {
	return value.replace(/[\r\n\t]/g, " ").replaceAll("\0", " ").slice(0, maxLen);
}
function describeMediaTargetForLog(pathValue, isHttpUrl) {
	if (!isHttpUrl) return "<local-file>";
	try {
		const url = new URL(pathValue);
		url.username = "";
		url.password = "";
		const urlId = crypto.createHash("sha256").update(url.toString()).digest("hex").slice(0, 12);
		return sanitizeForLog(`${url.protocol}//${url.host}#${urlId}`);
	} catch {
		return "<invalid-url>";
	}
}
async function readStructuredPayloadLocalFile(filePath) {
	const openFlags = fs.constants.O_RDONLY | ("O_NOFOLLOW" in fs.constants ? fs.constants.O_NOFOLLOW : 0);
	const handle = await fs.promises.open(filePath, openFlags);
	try {
		const stat = await handle.stat();
		if (!stat.isFile()) throw new Error("Path is not a regular file");
		if (stat.size > 20971520) throw new Error(`File is too large (${formatFileSize(stat.size)}); QQ Bot API limit is ${formatFileSize(MAX_UPLOAD_SIZE)}`);
		return handle.readFile();
	} finally {
		await handle.close();
	}
}
async function handleImagePayload(ctx, payload) {
	const { target, account, log } = ctx;
	const normalizedPath = normalizePath$1(payload.path);
	let imageUrl;
	if (payload.source === "file") imageUrl = validateStructuredPayloadLocalPath(ctx, normalizedPath, "image");
	else if (isRemoteHttpUrl(normalizedPath) || isInlineImageDataUrl(normalizedPath)) imageUrl = normalizedPath;
	else {
		log?.error(`Image payload URL must use http(s) or data:image/: ${sanitizeForLog(payload.path)}`);
		return;
	}
	if (!imageUrl) return;
	const originalImagePath = payload.source === "file" ? imageUrl : void 0;
	if (payload.source === "file") try {
		const fileBuffer = await readStructuredPayloadLocalFile(imageUrl);
		const base64Data = fileBuffer.toString("base64");
		const ext = normalizeLowercaseStringOrEmpty(path.extname(imageUrl));
		const mimeType = {
			".jpg": "image/jpeg",
			".jpeg": "image/jpeg",
			".png": "image/png",
			".gif": "image/gif",
			".webp": "image/webp",
			".bmp": "image/bmp"
		}[ext];
		if (!mimeType) {
			log?.error(`Unsupported image format: ${ext}`);
			return;
		}
		imageUrl = `data:${mimeType};base64,${base64Data}`;
		log?.debug?.(`Converted local image to Base64 (size: ${formatFileSize(fileBuffer.length)})`);
	} catch (readErr) {
		log?.error(`Failed to read local image: ${readErr instanceof Error ? readErr.message : JSON.stringify(readErr)}`);
		return;
	}
	try {
		const deliveryTarget = buildDeliveryTarget(target);
		const creds = accountToCreds(account);
		await withTokenRetry(creds, async () => {
			if (deliveryTarget.type === "c2c" || deliveryTarget.type === "group") await sendImage(deliveryTarget, imageUrl, creds, {
				msgId: target.messageId,
				localPath: originalImagePath
			});
			else if (deliveryTarget.type === "dm") await sendText(deliveryTarget, `![](${payload.path})`, creds, { msgId: target.messageId });
			else await sendText(deliveryTarget, `![](${payload.path})`, creds, { msgId: target.messageId });
		}, log, account.accountId);
		log?.debug?.(`Sent image via media payload`);
		if (payload.caption) await sendTextToTarget(ctx, payload.caption);
	} catch (err) {
		log?.error(`Failed to send image: ${formatErrorMessage(err)}`);
	}
}
async function handleAudioPayload(ctx, payload, deps) {
	const { target, account, cfg, log } = ctx;
	if (!deps) {
		log?.error(`TTS deps not provided, cannot handle audio payload`);
		return;
	}
	try {
		const ttsText = payload.caption || payload.path;
		if (!ttsText?.trim()) {
			log?.error(`Voice missing text`);
			return;
		}
		log?.debug?.(`TTS: "${ttsText.slice(0, 50)}..."`);
		const ttsResult = await deps.tts.textToSpeech({
			text: ttsText,
			cfg,
			channel: "qqbot"
		});
		if (!ttsResult.success || !ttsResult.audioPath) {
			log?.error(`TTS failed: ${ttsResult.error ?? "unknown"}`);
			return;
		}
		const providerLabel = ttsResult.provider ?? "unknown";
		log?.debug?.(`TTS returned: provider=${providerLabel}, format=${ttsResult.outputFormat}, path=${ttsResult.audioPath}`);
		const silkBase64 = await deps.tts.audioFileToSilkBase64(ttsResult.audioPath);
		if (!silkBase64) {
			log?.error(`Failed to convert TTS audio to SILK`);
			return;
		}
		const silkPath = ttsResult.audioPath;
		log?.debug?.(`TTS done (${providerLabel}), file: ${silkPath}`);
		const deliveryTarget = buildDeliveryTarget(target);
		const creds = accountToCreds(account);
		await withTokenRetry(creds, async () => {
			if (deliveryTarget.type === "c2c" || deliveryTarget.type === "group") await sendVoiceMessage(deliveryTarget, creds, {
				voiceBase64: silkBase64,
				msgId: target.messageId,
				ttsText,
				filePath: silkPath
			});
			else {
				log?.error(`Voice not supported in ${deliveryTarget.type}, sending text fallback`);
				await sendText(deliveryTarget, ttsText, creds, { msgId: target.messageId });
			}
		}, log, account.accountId);
		log?.debug?.(`Voice message sent`);
	} catch (err) {
		log?.error(`TTS/voice send failed: ${formatErrorMessage(err)}`);
	}
}
async function handleVideoPayload(ctx, payload) {
	const { target, account, log } = ctx;
	try {
		const resolved = resolveStructuredPayloadPath(ctx, payload, "video");
		if (!resolved) return;
		const videoPath = resolved.path;
		const isHttpUrl = resolved.isHttpUrl;
		log?.debug?.(`Video send: ${describeMediaTargetForLog(videoPath, isHttpUrl)}`);
		const deliveryTarget = buildDeliveryTarget(target);
		const creds = accountToCreds(account);
		if (deliveryTarget.type !== "c2c" && deliveryTarget.type !== "group") {
			log?.error(`Video not supported in ${deliveryTarget.type}`);
			return;
		}
		await withTokenRetry(creds, async () => {
			if (isHttpUrl) await sendVideoMessage(deliveryTarget, creds, {
				videoUrl: videoPath,
				msgId: target.messageId
			});
			else {
				const fileBuffer = await readStructuredPayloadLocalFile(videoPath);
				const videoBase64 = fileBuffer.toString("base64");
				log?.debug?.(`Read local video (${formatFileSize(fileBuffer.length)}): ${describeMediaTargetForLog(videoPath, false)}`);
				await sendVideoMessage(deliveryTarget, creds, {
					videoBase64,
					msgId: target.messageId,
					localPath: videoPath
				});
			}
		}, log, account.accountId);
		log?.debug?.(`Video message sent`);
		if (payload.caption) await sendTextToTarget(ctx, payload.caption);
	} catch (err) {
		log?.error(`Video send failed: ${formatErrorMessage(err)}`);
	}
}
async function handleFilePayload(ctx, payload) {
	const { target, account, log } = ctx;
	try {
		const resolved = resolveStructuredPayloadPath(ctx, payload, "file");
		if (!resolved) return;
		const filePath = resolved.path;
		const isHttpUrl = resolved.isHttpUrl;
		const fileName = sanitizeFileName(path.basename(filePath));
		log?.debug?.(`File send: ${describeMediaTargetForLog(filePath, isHttpUrl)} (${isHttpUrl ? "URL" : "local"})`);
		const deliveryTarget = buildDeliveryTarget(target);
		const creds = accountToCreds(account);
		if (deliveryTarget.type !== "c2c" && deliveryTarget.type !== "group") {
			log?.error(`File not supported in ${deliveryTarget.type}`);
			return;
		}
		await withTokenRetry(creds, async () => {
			if (isHttpUrl) await sendFileMessage(deliveryTarget, creds, {
				fileUrl: filePath,
				msgId: target.messageId,
				fileName
			});
			else await sendFileMessage(deliveryTarget, creds, {
				fileBase64: (await readStructuredPayloadLocalFile(filePath)).toString("base64"),
				msgId: target.messageId,
				fileName,
				localFilePath: filePath
			});
		}, log, account.accountId);
		log?.debug?.(`File message sent`);
	} catch (err) {
		log?.error(`File send failed: ${formatErrorMessage(err)}`);
	}
}
//#endregion
//#region extensions/qqbot/src/engine/gateway/outbound-dispatch.ts
/**
* Outbound dispatcher — manage AI reply delivery, tool fallback, and timeouts.
*
* Responsibilities:
* 1. Build ctxPayload and call runtime.dispatchReply
* 2. Tool deliver collection + fallback timeout
* 3. Block deliver pipeline (consumeQuoteRef → media tags → structured payload → plain text)
* 4. Timeout / error handling
*
* Separated from gateway.ts for testability and to keep handleMessage thin.
*/
const RESPONSE_TIMEOUT = 12e4;
const TOOL_ONLY_TIMEOUT = 6e4;
const MAX_TOOL_RENEWALS = 3;
const TOOL_MEDIA_SEND_TIMEOUT = 45e3;
/**
* Dispatch the AI reply for the given inbound context.
*
* Handles tool deliver collection, block deliver pipeline, and timeouts.
* The caller is responsible for stopping typing.keepAlive in `finally`.
*/
async function dispatchOutbound(inbound, deps) {
	const { runtime, cfg, account, log } = deps;
	const { event, qualifiedTarget } = inbound;
	const replyCtx = {
		target: {
			type: event.type,
			senderId: event.senderId,
			messageId: event.messageId,
			channelId: event.channelId,
			guildId: event.guildId,
			groupOpenid: event.groupOpenid
		},
		account,
		cfg,
		log
	};
	const sendWithRetry = (sendFn) => sendWithTokenRetry(account.appId, account.clientSecret, sendFn, log, account.accountId);
	const sendErrorMessage = (errorText) => sendErrorToTarget(replyCtx, errorText);
	const ctxPayload = buildCtxPayload(inbound, runtime);
	let hasResponse = false;
	let hasBlockResponse = false;
	let toolDeliverCount = 0;
	const toolTexts = [];
	const toolMediaUrls = [];
	let toolFallbackSent = false;
	let toolRenewalCount = 0;
	let timeoutId = null;
	let toolOnlyTimeoutId = null;
	const sendToolFallback = async () => {
		if (toolMediaUrls.length > 0) {
			for (const mediaUrl of toolMediaUrls) {
				const ac = new AbortController();
				try {
					const result = await Promise.race([sendMedia({
						to: qualifiedTarget,
						text: "",
						mediaUrl,
						accountId: account.accountId,
						replyToId: event.messageId,
						account
					}).then((r) => {
						if (ac.signal.aborted) return {
							channel: "qqbot",
							error: "suppressed"
						};
						return r;
					}), new Promise((resolve) => setTimeout(() => {
						ac.abort();
						resolve({
							channel: "qqbot",
							error: "timeout"
						});
					}, TOOL_MEDIA_SEND_TIMEOUT))]);
					if (result.error) log?.error(`Tool fallback error: ${result.error}`);
				} catch (err) {
					log?.error(`Tool fallback failed: ${String(err)}`);
				}
			}
			return;
		}
		if (toolTexts.length > 0) await sendErrorMessage(toolTexts.slice(-3).join("\n---\n").slice(0, 2e3));
	};
	const timeoutPromise = new Promise((_, reject) => {
		timeoutId = setTimeout(() => {
			if (!hasResponse) reject(/* @__PURE__ */ new Error("Response timeout"));
		}, RESPONSE_TIMEOUT);
	});
	const deliverDeps = {
		mediaSender: {
			sendPhoto: (target, imageUrl) => sendPhoto(target, imageUrl),
			sendVoice: (target, voicePath, uploadFormats, transcodeEnabled) => sendVoice(target, voicePath, uploadFormats, transcodeEnabled),
			sendVideoMsg: (target, videoPath) => sendVideoMsg(target, videoPath),
			sendDocument: (target, filePath) => sendDocument(target, filePath),
			sendMedia: (opts) => sendMedia(opts)
		},
		chunkText: (text, limit) => runtime.channel.text.chunkMarkdownText(text, limit)
	};
	const replyDeps = { tts: {
		textToSpeech: (params) => runtime.tts.textToSpeech(params),
		audioFileToSilkBase64: async (p) => await audioFileToSilkBase64(p) ?? void 0
	} };
	const recordOutbound = () => runtime.channel.activity.record({
		channel: "qqbot",
		accountId: account.accountId,
		direction: "outbound"
	});
	const messagesConfig = runtime.channel.reply.resolveEffectiveMessagesConfig(cfg, inbound.route.agentId);
	const dispatchPromise = runtime.channel.reply.dispatchReplyWithBufferedBlockDispatcher({
		ctx: ctxPayload,
		cfg,
		dispatcherOptions: {
			responsePrefix: messagesConfig.responsePrefix,
			deliver: async (payload, info) => {
				hasResponse = true;
				if (info.kind === "tool") {
					toolDeliverCount++;
					const toolText = (payload.text ?? "").trim();
					if (toolText) toolTexts.push(toolText);
					if (payload.mediaUrls?.length) toolMediaUrls.push(...payload.mediaUrls);
					if (payload.mediaUrl && !toolMediaUrls.includes(payload.mediaUrl)) toolMediaUrls.push(payload.mediaUrl);
					if (hasBlockResponse && toolMediaUrls.length > 0) {
						const urlsToSend = [...toolMediaUrls];
						toolMediaUrls.length = 0;
						for (const mediaUrl of urlsToSend) try {
							await sendMedia({
								to: qualifiedTarget,
								text: "",
								mediaUrl,
								accountId: account.accountId,
								replyToId: event.messageId,
								account
							});
						} catch {}
						return;
					}
					if (toolFallbackSent) return;
					if (toolOnlyTimeoutId) if (toolRenewalCount < MAX_TOOL_RENEWALS) {
						clearTimeout(toolOnlyTimeoutId);
						toolRenewalCount++;
					} else return;
					toolOnlyTimeoutId = setTimeout(async () => {
						if (!hasBlockResponse && !toolFallbackSent) {
							toolFallbackSent = true;
							try {
								await sendToolFallback();
							} catch {}
						}
					}, TOOL_ONLY_TIMEOUT);
					return;
				}
				hasBlockResponse = true;
				inbound.typing.keepAlive?.stop();
				if (timeoutId) {
					clearTimeout(timeoutId);
					timeoutId = null;
				}
				if (toolOnlyTimeoutId) {
					clearTimeout(toolOnlyTimeoutId);
					toolOnlyTimeoutId = null;
				}
				const quoteRef = event.msgIdx;
				let quoteRefUsed = false;
				const consumeQuoteRef = () => {
					if (quoteRef && !quoteRefUsed) {
						quoteRefUsed = true;
						return quoteRef;
					}
				};
				let replyText = payload.text ?? "";
				const deliverEvent = {
					type: event.type,
					senderId: event.senderId,
					messageId: event.messageId,
					channelId: event.channelId,
					groupOpenid: event.groupOpenid,
					msgIdx: event.msgIdx
				};
				const deliverActx = {
					account,
					qualifiedTarget,
					log
				};
				const mediaResult = await parseAndSendMediaTags(replyText, deliverEvent, deliverActx, sendWithRetry, consumeQuoteRef, deliverDeps);
				if (mediaResult.handled) {
					recordOutbound();
					return;
				}
				replyText = mediaResult.normalizedText;
				if (await handleStructuredPayload(replyCtx, replyText, recordOutbound, replyDeps)) return;
				await sendPlainReply(payload, replyText, deliverEvent, deliverActx, sendWithRetry, consumeQuoteRef, toolMediaUrls, deliverDeps);
				recordOutbound();
			},
			onError: async (err) => {
				const errMsg = err instanceof Error ? err.message : String(err);
				log?.error(`Dispatch error: ${errMsg}`);
				hasResponse = true;
				if (timeoutId) {
					clearTimeout(timeoutId);
					timeoutId = null;
				}
			}
		},
		replyOptions: { disableBlockStreaming: account.config.streaming?.mode === "off" }
	});
	try {
		await Promise.race([dispatchPromise, timeoutPromise]);
	} catch {
		if (timeoutId) clearTimeout(timeoutId);
	} finally {
		if (toolOnlyTimeoutId) {
			clearTimeout(toolOnlyTimeoutId);
			toolOnlyTimeoutId = null;
		}
		if (toolDeliverCount > 0 && !hasBlockResponse && !toolFallbackSent) {
			toolFallbackSent = true;
			await sendToolFallback();
		}
	}
}
function buildCtxPayload(inbound, runtime) {
	const { event } = inbound;
	return runtime.channel.reply.finalizeInboundContext({
		Body: inbound.body,
		BodyForAgent: inbound.agentBody,
		RawBody: event.content,
		CommandBody: event.content,
		From: inbound.fromAddress,
		To: inbound.fromAddress,
		SessionKey: inbound.route.sessionKey,
		AccountId: inbound.route.accountId,
		ChatType: inbound.isGroupChat ? "group" : "direct",
		GroupSystemPrompt: inbound.groupSystemPrompt,
		SenderId: event.senderId,
		SenderName: event.senderName,
		Provider: "qqbot",
		Surface: "qqbot",
		MessageSid: event.messageId,
		Timestamp: new Date(event.timestamp).getTime(),
		OriginatingChannel: "qqbot",
		OriginatingTo: inbound.fromAddress,
		QQChannelId: event.channelId,
		QQGuildId: event.guildId,
		QQGroupOpenid: event.groupOpenid,
		QQVoiceAsrReferAvailable: inbound.hasAsrReferFallback,
		QQVoiceTranscriptSources: inbound.voiceTranscriptSources,
		QQVoiceAttachmentPaths: inbound.uniqueVoicePaths,
		QQVoiceAttachmentUrls: inbound.uniqueVoiceUrls,
		QQVoiceAsrReferTexts: inbound.uniqueVoiceAsrReferTexts,
		QQVoiceInputStrategy: "prefer_audio_stt_then_asr_fallback",
		CommandAuthorized: inbound.commandAuthorized,
		...inbound.localMediaPaths.length > 0 ? {
			MediaPaths: inbound.localMediaPaths,
			MediaPath: inbound.localMediaPaths[0],
			MediaTypes: inbound.localMediaTypes,
			MediaType: inbound.localMediaTypes[0]
		} : {},
		...inbound.remoteMediaUrls.length > 0 ? {
			MediaUrls: inbound.remoteMediaUrls,
			MediaUrl: inbound.remoteMediaUrls[0]
		} : {},
		...inbound.replyTo ? {
			ReplyToId: inbound.replyTo.id,
			ReplyToBody: inbound.replyTo.body,
			ReplyToSender: inbound.replyTo.sender,
			ReplyToIsQuote: inbound.replyTo.isQuote
		} : {}
	});
}
//#endregion
//#region extensions/qqbot/src/engine/gateway/typing-keepalive.ts
/**
* Periodically refresh C2C typing state while a response is in progress.
*
* All I/O operations are injected via constructor parameters so this
* module has zero external dependencies and can run in both plugin versions.
*/
/** Refresh every 50s for the QQ API's 60s input-notify window. */
const TYPING_INTERVAL_MS = 5e4;
var TypingKeepAlive = class {
	constructor(getToken, clearCache, sendInputNotify, openid, msgId, log) {
		this.getToken = getToken;
		this.clearCache = clearCache;
		this.sendInputNotify = sendInputNotify;
		this.openid = openid;
		this.msgId = msgId;
		this.log = log;
		this.timer = null;
		this.stopped = false;
	}
	/** Start periodic keep-alive sends. */
	start() {
		if (this.stopped) return;
		this.timer = setInterval(() => {
			if (this.stopped) {
				this.stop();
				return;
			}
			this.send().catch(() => {});
		}, TYPING_INTERVAL_MS);
	}
	/** Stop periodic keep-alive sends. */
	stop() {
		this.stopped = true;
		if (this.timer) {
			clearInterval(this.timer);
			this.timer = null;
		}
	}
	async send() {
		try {
			const token = await this.getToken();
			await this.sendInputNotify(token, this.openid, this.msgId, 60);
			this.log?.debug?.(`Typing keep-alive sent to ${this.openid}`);
		} catch (err) {
			try {
				this.clearCache();
				const token = await this.getToken();
				await this.sendInputNotify(token, this.openid, this.msgId, 60);
			} catch {
				this.log?.debug?.(`Typing keep-alive failed for ${this.openid}: ${formatErrorMessage(err)}`);
			}
		}
	}
};
//#endregion
//#region extensions/qqbot/src/engine/gateway/gateway.ts
/**
* Core gateway entry point — thin shell that wires together:
*
* - GatewayConnection: WebSocket lifecycle, heartbeat, reconnect
* - buildInboundContext: content building, attachments, quote resolution
* - dispatchOutbound: AI dispatch, deliver callbacks, timeouts
*
* The only responsibilities of this file are:
* 1. Register audio adapters
* 2. Initialize API config + refIdx cache hook
* 3. Create the message handler (inbound → outbound pipeline)
* 4. Start GatewayConnection
*/
/**
* Start the Gateway WebSocket connection with automatic reconnect support.
*/
async function startGateway$1(ctx) {
	const { account, log, runtime } = ctx;
	registerAudioConvertAdapter({
		convertSilkToWav,
		isVoiceAttachment,
		formatDuration
	});
	registerOutboundAudioAdapter({
		audioFileToSilkBase64: async (p, f) => await audioFileToSilkBase64(p, f) ?? void 0,
		isAudioFile,
		shouldTranscodeVoice,
		waitForFile
	});
	if (!account.appId || !account.clientSecret) throw new Error("QQBot not configured (missing appId or clientSecret)");
	const diag = await runDiagnostics();
	if (diag.warnings.length > 0) for (const w of diag.warnings) log?.info(w);
	initApiConfig(account.appId, { markdownSupport: account.markdownSupport });
	log?.debug?.(`API config: markdownSupport=${account.markdownSupport}`);
	onMessageSent(account.appId, (refIdx, meta) => {
		log?.info(`onMessageSent called: refIdx=${refIdx}, mediaType=${meta.mediaType}, ttsText=${meta.ttsText?.slice(0, 30)}`);
		const attachments = [];
		if (meta.mediaType) {
			const localPath = meta.mediaLocalPath;
			const filename = localPath ? path.basename(localPath) : void 0;
			const attachment = {
				type: meta.mediaType,
				...localPath ? { localPath } : {},
				...filename ? { filename } : {},
				...meta.mediaUrl ? { url: meta.mediaUrl } : {}
			};
			if (meta.mediaType === "voice" && meta.ttsText) {
				attachment.transcript = meta.ttsText;
				attachment.transcriptSource = "tts";
			}
			attachments.push(attachment);
		}
		setRefIndex(refIdx, {
			content: meta.text ?? "",
			senderId: account.accountId,
			senderName: account.accountId,
			timestamp: Date.now(),
			isBot: true,
			...attachments.length > 0 ? { attachments } : {}
		});
	});
	const handleMessage = async (event) => {
		log?.info(`Processing message from ${event.senderId}: ${event.content}`);
		runtime.channel.activity.record({
			channel: "qqbot",
			accountId: account.accountId,
			direction: "inbound"
		});
		const inbound = await buildInboundContext(event, {
			account,
			cfg: ctx.cfg,
			log,
			runtime,
			startTyping: (ev) => startTypingForEvent(ev, account, log)
		});
		if (inbound.blocked) {
			log?.info(`Dropped inbound qqbot message: ${inbound.blockReason ?? "blocked by allowFrom"}`);
			inbound.typing.keepAlive?.stop();
			return;
		}
		try {
			await runWithRequestContext({
				accountId: account.accountId,
				target: inbound.qualifiedTarget,
				targetId: inbound.peerId,
				chatType: event.type
			}, () => dispatchOutbound(inbound, {
				runtime,
				cfg: ctx.cfg,
				account,
				log
			}));
		} catch (err) {
			log?.error(`Message processing failed: ${err instanceof Error ? err.message : String(err)}`);
		} finally {
			inbound.typing.keepAlive?.stop();
		}
	};
	const handleInteraction = createApprovalInteractionHandler(account, log);
	await new GatewayConnection({
		account,
		abortSignal: ctx.abortSignal,
		cfg: ctx.cfg,
		log,
		runtime,
		onReady: ctx.onReady,
		onResumed: ctx.onResumed,
		onError: ctx.onError,
		onInteraction: handleInteraction,
		handleMessage
	}).start();
}
/**
* Start typing indicator for a C2C event.
* Returns the refIdx from InputNotify and a TypingKeepAlive handle.
*/
async function startTypingForEvent(event, account, log) {
	if (!(event.type === "c2c" || event.type === "dm")) return { keepAlive: null };
	try {
		const creds = accountToCreds(account);
		const rawNotifyFn = createRawInputNotifyFn(account.appId);
		try {
			const resp = await sendInputNotify({
				openid: event.senderId,
				creds,
				msgId: event.messageId,
				inputSecond: 60
			});
			const keepAlive = new TypingKeepAlive(() => getAccessToken(account.appId, account.clientSecret), () => clearTokenCache(account.appId), rawNotifyFn, event.senderId, event.messageId, log);
			keepAlive.start();
			return {
				refIdx: resp.refIdx,
				keepAlive
			};
		} catch (notifyErr) {
			const errMsg = String(notifyErr);
			if (errMsg.includes("token") || errMsg.includes("401") || errMsg.includes("11244")) {
				clearTokenCache(account.appId);
				const resp = await sendInputNotify({
					openid: event.senderId,
					creds,
					msgId: event.messageId,
					inputSecond: 60
				});
				const keepAlive = new TypingKeepAlive(() => getAccessToken(account.appId, account.clientSecret), () => clearTokenCache(account.appId), rawNotifyFn, event.senderId, event.messageId, log);
				keepAlive.start();
				return {
					refIdx: resp.refIdx,
					keepAlive
				};
			}
			throw notifyErr;
		}
	} catch (err) {
		log?.error(`sendInputNotify error: ${err instanceof Error ? err.message : String(err)}`);
		return { keepAlive: null };
	}
}
/**
* Default INTERACTION_CREATE handler — ACK the interaction and resolve
* approval button clicks via the registered PlatformAdapter.
*/
function createApprovalInteractionHandler(account, log) {
	return (event) => {
		acknowledgeInteraction(accountToCreds(account), event.id).catch((err) => {
			log?.error(`Interaction ACK failed: ${err instanceof Error ? err.message : String(err)}`);
		});
		const parsed = parseApprovalButtonData(event.data?.resolved?.button_data ?? "");
		if (!parsed) return;
		const adapter = getPlatformAdapter();
		if (!adapter.resolveApproval) {
			log?.error(`resolveApproval not available on PlatformAdapter`);
			return;
		}
		adapter.resolveApproval(parsed.approvalId, parsed.decision).then((ok) => {
			if (ok) log?.info(`Approval resolved: id=${parsed.approvalId}, decision=${parsed.decision}`);
			else log?.error(`Approval resolve failed: id=${parsed.approvalId}`);
		});
	};
}
//#endregion
//#region extensions/qqbot/src/bridge/plugin-version.ts
/**
* QQBot plugin version resolver.
*
* Reads the version field from this plugin's own `package.json` by
* walking up the directory tree starting from `import.meta.url` of the
* caller until a `package.json` whose `name` field matches the plugin
* package id is located.
*
* Why not a hardcoded relative path?
*   - The source file can live at different depths depending on whether
*     we run from raw sources (`src/bridge/gateway.ts`) or a future
*     compiled output. Hardcoding `"../../package.json"` breaks as soon
*     as the source layout changes, which is what caused the previous
*     `vunknown` regression.
*   - A `name` guard prevents accidentally reading the parent
*     `openclaw/package.json` (the framework root) when the plugin
*     lives inside the monorepo.
*
* The lookup is performed only once per process at startup, so the
* synchronous file I/O is negligible.
*/
/** `name` field in this plugin's `package.json`. */
const QQBOT_PLUGIN_PKG_NAME = "@openclaw/qqbot";
/** Sentinel used when the version cannot be resolved. */
const QQBOT_PLUGIN_VERSION_UNKNOWN = "unknown";
/**
* Resolve the QQBot plugin version from `package.json`.
*
* @param startUrl — pass `import.meta.url` from the call site so the
*   lookup begins at the caller's file regardless of where this helper
*   itself lives. Falls back to this module's own location when omitted.
*/
function resolveQQBotPluginVersion(startUrl) {
	const entryUrl = startUrl ?? import.meta.url;
	let dir;
	try {
		dir = path.dirname(fileURLToPath(entryUrl));
	} catch {
		return QQBOT_PLUGIN_VERSION_UNKNOWN;
	}
	const root = path.parse(dir).root;
	while (dir && dir !== root) {
		const candidate = path.join(dir, "package.json");
		if (fs.existsSync(candidate)) {
			const version = readQQBotVersionFromManifest(candidate);
			if (version) return version;
		}
		const parent = path.dirname(dir);
		if (parent === dir) break;
		dir = parent;
	}
	return QQBOT_PLUGIN_VERSION_UNKNOWN;
}
/**
* Read the `version` field from a `package.json` file and return it
* only when the manifest describes the QQBot plugin itself.
*
* Returning `null` for mismatched or malformed manifests lets the
* caller keep walking up the directory tree until the correct package
* boundary is located.
*/
function readQQBotVersionFromManifest(manifestPath) {
	let raw;
	try {
		raw = fs.readFileSync(manifestPath, "utf8");
	} catch {
		return null;
	}
	let parsed;
	try {
		parsed = JSON.parse(raw);
	} catch {
		return null;
	}
	if (!parsed || typeof parsed !== "object") return null;
	const manifest = parsed;
	if (manifest.name !== QQBOT_PLUGIN_PKG_NAME) return null;
	if (typeof manifest.version !== "string" || manifest.version.length === 0) return null;
	return manifest.version;
}
//#endregion
//#region extensions/qqbot/src/bridge/gateway.ts
/**
* Gateway entry point — thin shell that passes the PluginRuntime to
* core/gateway/gateway.ts.
*
* All module dependencies are imported directly by the core gateway.
* This file only provides the runtime object (which is dynamically
* injected by the framework at startup).
*/
registerVersionResolver(resolveRuntimeServiceVersion);
const _pluginVersion = resolveQQBotPluginVersion(import.meta.url);
initSender({
	pluginVersion: _pluginVersion,
	openclawVersion: resolveRuntimeServiceVersion()
});
registerPluginVersion(_pluginVersion);
registerApproveRuntimeGetter(() => {
	return { config: getQQBotRuntime().config };
});
registerOutboundAudioAdapterFactory(() => {
	return {
		audioFileToSilkBase64: async (p, f) => await audioFileToSilkBase64(p, f) ?? void 0,
		isAudioFile: (p, m) => isAudioFile(p, m),
		shouldTranscodeVoice: (p) => shouldTranscodeVoice(p),
		waitForFile: (p, ms) => waitForFile(p, ms)
	};
});
/**
* Start the Gateway WebSocket connection.
*
* Passes the PluginRuntime to core/gateway/gateway.ts.
* All other dependencies are imported directly by the core module.
*/
async function startGateway(ctx) {
	ensurePlatformAdapter();
	const runtime = getQQBotRuntimeForEngine();
	const accountLogger = createAccountLogger(ctx.log, ctx.account.accountId);
	registerAccount(ctx.account.appId, {
		logger: accountLogger,
		markdownSupport: ctx.account.markdownSupport
	});
	setBridgeLogger(accountLogger);
	registerTextChunker((text, limit) => runtime.channel.text.chunkMarkdownText(text, limit));
	if (ctx.channelRuntime) {
		accountLogger.info("Registering approval.native runtime context");
		const lease = ctx.channelRuntime.runtimeContexts.register({
			channelId: "qqbot",
			accountId: ctx.account.accountId,
			capability: "approval.native",
			context: { account: ctx.account },
			abortSignal: ctx.abortSignal
		});
		accountLogger.info(`approval.native context registered (lease=${!!lease})`);
	} else accountLogger.info("No channelRuntime — skipping approval.native registration");
	return startGateway$1({
		account: ctx.account,
		abortSignal: ctx.abortSignal,
		cfg: ctx.cfg,
		onReady: ctx.onReady,
		onResumed: ctx.onResumed,
		onError: ctx.onError,
		log: accountLogger,
		runtime
	});
}
/**
* Create an EngineLogger that auto-prefixes all messages with `[qqbot:{accountId}]`.
*
* Follows the WhatsApp pattern of per-connection loggers — each account gets
* its own logger instance so multi-account logs are automatically attributed.
*/
function createAccountLogger(raw, accountId) {
	const prefix = `[${accountId}]`;
	if (!raw) return {
		info: (msg) => debugLog(`${prefix} ${msg}`),
		error: (msg) => debugError(`${prefix} ${msg}`),
		warn: (msg) => debugError(`${prefix} ${msg}`),
		debug: (msg) => debugLog(`${prefix} ${msg}`)
	};
	return {
		info: (msg) => raw.info(`${prefix} ${msg}`),
		error: (msg) => raw.error(`${prefix} ${msg}`),
		warn: (msg) => raw.error(`${prefix} ${msg}`),
		debug: (msg) => raw.debug?.(`${prefix} ${msg}`)
	};
}
//#endregion
export { startGateway };
