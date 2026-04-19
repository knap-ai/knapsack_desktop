import { $ as stopBackgroundTokenRefresh, A as readString, B as sendC2CMessage, C as convertSilkToWav, D as resolveTTSConfig, E as isVoiceAttachment, F as initApiConfig, G as sendGroupFileMessage, H as sendC2CVoiceMessage, I as onMessageSent, J as sendGroupVideoMessage, K as sendGroupImageMessage, L as sendC2CFileMessage, M as clearTokenCache, N as getAccessToken, O as textToSilk, P as getGatewayUrl, Q as startBackgroundTokenRefresh, R as sendC2CImageMessage, S as audioFileToSilkBase64, T as isGlobalTTSAvailable, U as sendChannelMessage, V as sendC2CVideoMessage, W as sendDmMessage, Y as sendGroupVoiceMessage, _ as parseQQBotPayload, at as normalizePath, b as downloadFile, c as sendMedia, ct as sanitizeFileName, f as sendVideoMsg, g as isMediaPayload, h as isCronReminderPayload, j as PLUGIN_USER_AGENT, k as asRecord, l as sendPhoto, lt as debugError, m as encodePayloadForCron, nt as getQQBotMediaDir, ot as resolveQQBotPayloadLocalFilePath, p as sendVoice, q as sendGroupMessage, rt as isLocalPath, s as sendDocument, st as runDiagnostics, tt as getQQBotDataDir, ut as debugLog, v as normalizeMediaTags, w as formatDuration, x as formatFileSize, y as MAX_UPLOAD_SIZE, z as sendC2CInputNotify } from "./outbound-Nkg_Sn0w.js";
import { a as recordKnownUser, c as matchSlashCommand, d as formatQQBotAllowFrom, l as TEXT_CHUNK_LIMIT, n as flushKnownUsers, u as chunkText } from "./known-users-CX1XBPSa.js";
import { t as getQQBotRuntime } from "./runtime-B2Qn21pE.js";
import { normalizeLowercaseStringOrEmpty, normalizeOptionalString } from "openclaw/plugin-sdk/text-runtime";
import * as fs$1 from "node:fs";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { estimateBase64DecodedBytes, fetchRemoteMedia } from "openclaw/plugin-sdk/media-runtime";
import WebSocket from "ws";
import { Buffer as Buffer$1 } from "buffer";
//#region extensions/qqbot/src/stt.ts
/**
* OpenAI-compatible STT used at the plugin layer.
*
* This avoids pushing raw WAV PCM into the framework media-understanding pipeline.
*/
function resolveSTTConfig(cfg) {
	const channelStt = asRecord(asRecord(asRecord(cfg.channels)?.qqbot)?.stt);
	const providers = asRecord(asRecord(cfg.models)?.providers);
	if (channelStt && channelStt.enabled !== false) {
		const providerId = readString(channelStt, "provider") ?? "openai";
		const providerCfg = asRecord(providers?.[providerId]);
		const baseUrl = readString(channelStt, "baseUrl") ?? readString(providerCfg, "baseUrl");
		const apiKey = readString(channelStt, "apiKey") ?? readString(providerCfg, "apiKey");
		const model = readString(channelStt, "model") ?? "whisper-1";
		if (baseUrl && apiKey) return {
			baseUrl: baseUrl.replace(/\/+$/, ""),
			apiKey,
			model
		};
	}
	const audioModels = asRecord(asRecord(asRecord(cfg.tools)?.media)?.audio)?.models;
	const audioModelEntry = Array.isArray(audioModels) ? asRecord(audioModels[0]) : void 0;
	if (audioModelEntry) {
		const providerId = readString(audioModelEntry, "provider") ?? "openai";
		const providerCfg = asRecord(providers?.[providerId]);
		const baseUrl = readString(audioModelEntry, "baseUrl") ?? readString(providerCfg, "baseUrl");
		const apiKey = readString(audioModelEntry, "apiKey") ?? readString(providerCfg, "apiKey");
		const model = readString(audioModelEntry, "model") ?? "whisper-1";
		if (baseUrl && apiKey) return {
			baseUrl: baseUrl.replace(/\/+$/, ""),
			apiKey,
			model
		};
	}
	return null;
}
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
//#region extensions/qqbot/src/inbound-attachments.ts
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
	const { accountId, cfg, log } = ctx;
	const downloadDir = getQQBotMediaDir("downloads");
	const prefix = `[qqbot:${accountId}]`;
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
		const isVoice = isVoiceAttachment(att);
		const wavUrl = isVoice && att.voice_wav_url ? att.voice_wav_url.startsWith("//") ? `https:${att.voice_wav_url}` : att.voice_wav_url : "";
		let localPath = null;
		let audioPath = null;
		if (isVoice && wavUrl) {
			const wavLocalPath = await downloadFile(wavUrl, downloadDir);
			if (wavLocalPath) {
				localPath = wavLocalPath;
				audioPath = wavLocalPath;
				log?.info(`${prefix} Voice attachment: ${att.filename}, downloaded WAV directly (skip SILK→WAV)`);
			} else log?.error(`${prefix} Failed to download voice_wav_url, falling back to original URL`);
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
		if (localPath) if (att.content_type?.startsWith("image/")) {
			log?.info(`${prefix} Downloaded attachment to: ${localPath}`);
			return {
				localPath,
				type: "image",
				contentType: att.content_type,
				meta
			};
		} else if (isVoice) {
			log?.info(`${prefix} Downloaded attachment to: ${localPath}`);
			return processVoiceAttachment(localPath, audioPath, att, asrReferText, cfg, downloadDir, log, prefix);
		} else {
			log?.info(`${prefix} Downloaded attachment to: ${localPath}`);
			return {
				localPath,
				type: "other",
				filename: att.filename,
				meta
			};
		}
		else {
			log?.error(`${prefix} Failed to download: ${attUrl}`);
			if (att.content_type?.startsWith("image/")) return {
				localPath: null,
				type: "image-fallback",
				attUrl,
				contentType: att.content_type,
				meta
			};
			else if (isVoice && asrReferText) {
				log?.info(`${prefix} Voice attachment download failed, using asr_refer_text fallback`);
				return {
					localPath: null,
					type: "voice-fallback",
					transcript: asrReferText,
					meta
				};
			} else return {
				localPath: null,
				type: "other-fallback",
				filename: att.filename ?? att.content_type,
				meta
			};
		}
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
/** Format voice transcripts into user-visible text. */
function formatVoiceText(transcripts) {
	if (transcripts.length === 0) return "";
	return transcripts.length === 1 ? `[Voice message] ${transcripts[0]}` : transcripts.map((t, i) => `[Voice ${i + 1}] ${t}`).join("\n");
}
async function processVoiceAttachment(localPath, audioPath, att, asrReferText, cfg, downloadDir, log, prefix) {
	const wavUrl = att.voice_wav_url ? att.voice_wav_url.startsWith("//") ? `https:${att.voice_wav_url}` : att.voice_wav_url : "";
	const attUrl = att.url?.startsWith("//") ? `https:${att.url}` : att.url;
	const meta = {
		voiceUrl: wavUrl || attUrl || void 0,
		asrReferText: asrReferText || void 0
	};
	if (!resolveSTTConfig(cfg)) {
		if (asrReferText) {
			log?.info(`${prefix} Voice attachment: ${att.filename} (STT not configured, using asr_refer_text fallback)`);
			return {
				localPath,
				type: "voice",
				transcript: asrReferText,
				transcriptSource: "asr",
				meta
			};
		}
		log?.info(`${prefix} Voice attachment: ${att.filename} (STT not configured, skipping transcription)`);
		return {
			localPath,
			type: "voice",
			transcript: "[Voice message - transcription unavailable because STT is not configured]",
			transcriptSource: "fallback",
			meta
		};
	}
	if (!audioPath) {
		log?.info(`${prefix} Voice attachment: ${att.filename}, converting SILK→WAV...`);
		try {
			const wavResult = await convertSilkToWav(localPath, downloadDir);
			if (wavResult) {
				audioPath = wavResult.wavPath;
				log?.info(`${prefix} Voice converted: ${wavResult.wavPath} (${formatDuration(wavResult.duration)})`);
			} else audioPath = localPath;
		} catch (convertErr) {
			log?.error(`${prefix} Voice conversion failed: ${convertErr instanceof Error ? convertErr.message : JSON.stringify(convertErr)}`);
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
			log?.info(`${prefix} STT transcript: ${transcript.slice(0, 100)}...`);
			return {
				localPath,
				type: "voice",
				transcript,
				transcriptSource: "stt",
				meta
			};
		}
		if (asrReferText) {
			log?.info(`${prefix} STT returned empty result, using asr_refer_text fallback`);
			return {
				localPath,
				type: "voice",
				transcript: asrReferText,
				transcriptSource: "asr",
				meta
			};
		}
		log?.info(`${prefix} STT returned empty result`);
		return {
			localPath,
			type: "voice",
			transcript: "[Voice message - transcription returned an empty result]",
			transcriptSource: "fallback",
			meta
		};
	} catch (sttErr) {
		log?.error(`${prefix} STT failed: ${sttErr instanceof Error ? sttErr.message : JSON.stringify(sttErr)}`);
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
//#region extensions/qqbot/src/message-queue.ts
const MESSAGE_QUEUE_SIZE = 1e3;
const PER_USER_QUEUE_SIZE = 20;
const MAX_CONCURRENT_USERS = 10;
/**
* Create a per-user concurrent queue.
* Messages are serialized per user and processed in parallel across users.
*/
function createMessageQueue(ctx) {
	const { accountId, log } = ctx;
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
			log?.info(`[qqbot:${accountId}] Max concurrent users (${MAX_CONCURRENT_USERS}) reached, ${peerId} will wait`);
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
					log?.error(`[qqbot:${accountId}] Message processor error for ${peerId}: ${String(err)}`);
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
			log?.error(`[qqbot:${accountId}] Per-user queue full for ${peerId}, dropping oldest message ${dropped?.messageId}`);
		}
		totalEnqueued++;
		if (totalEnqueued > MESSAGE_QUEUE_SIZE) log?.error(`[qqbot:${accountId}] Global queue limit reached (${totalEnqueued}), message from ${peerId} may be delayed`);
		queue.push(msg);
		log?.debug?.(`[qqbot:${accountId}] Message enqueued for ${peerId}, user queue: ${queue.length}, active users: ${activeUsers.size}`);
		drainUserQueue(peerId);
	};
	const startProcessor = (handleMessageFn) => {
		handleMessageFnRef = handleMessageFn;
		log?.info(`[qqbot:${accountId}] Message processor started (per-user concurrency, max ${MAX_CONCURRENT_USERS} users)`);
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
			log?.error(`[qqbot:${accountId}] Immediate execution error: ${err}`);
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
//#region extensions/qqbot/src/utils/image-size.ts
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
			const { buffer } = await fetchRemoteMedia({
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
		debugLog(`[image-size] Error fetching ${url.slice(0, 60)}...: ${String(err)}`);
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
		debugLog(`[image-size] Error parsing Base64: ${String(err)}`);
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
//#region extensions/qqbot/src/utils/text-parsing.ts
const MAX_FACE_EXT_BYTES = 64 * 1024;
/** Replace QQ face tags with readable text labels. */
function parseFaceTags(text) {
	if (!text) return "";
	return text.replace(/<faceType=\d+,faceId="[^"]*",ext="([^"]*)">/g, (_match, ext) => {
		try {
			if (estimateBase64DecodedBytes(ext) > MAX_FACE_EXT_BYTES) return "[Emoji: unknown emoji]";
			const decoded = Buffer.from(ext, "base64").toString("utf-8");
			return `[Emoji: ${JSON.parse(decoded).text || "unknown emoji"}]`;
		} catch {
			return _match;
		}
	});
}
/** Remove internal framework markers before sending text outward. */
function filterInternalMarkers(text) {
	if (!text) return "";
	let result = text.replace(/\[\[[a-z_]+:\s*[^\]]*\]\]/gi, "");
	result = result.replace(/@(?:image|voice|video|file):[a-zA-Z0-9_.-]+/g, "");
	result = result.replace(/\n{3,}/g, "\n\n").trim();
	return result;
}
/** Parse quote-related ref indices from `message_scene.ext`. */
function parseRefIndices(ext) {
	if (!ext || ext.length === 0) return {};
	let refMsgIdx;
	let msgIdx;
	for (const item of ext) if (item.startsWith("ref_msg_idx=")) refMsgIdx = item.slice(12);
	else if (item.startsWith("msg_idx=")) msgIdx = item.slice(8);
	return {
		refMsgIdx,
		msgIdx
	};
}
/** Build attachment summaries for ref-index caching. */
function buildAttachmentSummaries(attachments, localPaths) {
	if (!attachments || attachments.length === 0) return;
	return attachments.map((att, idx) => {
		const ct = normalizeLowercaseStringOrEmpty(att.content_type);
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
//#region extensions/qqbot/src/outbound-deliver.ts
/**
* Outbound delivery helpers.
*
* The gateway deliver callback uses two pipelines:
* 1. `parseAndSendMediaTags` handles `<qqimg/qqvoice/qqvideo/qqfile/qqmedia>` tags in order.
* 2. `sendPlainReply` handles plain replies, including markdown images and mixed text/media.
*/
function resolveQQBotMediaTargetContext(event, account, prefix) {
	return {
		targetType: event.type === "c2c" ? "c2c" : event.type === "group" ? "group" : event.type === "dm" ? "dm" : "channel",
		targetId: event.type === "c2c" ? event.senderId : event.type === "group" ? event.groupOpenid : event.type === "dm" ? event.guildId : event.channelId,
		account,
		replyToId: event.messageId,
		logPrefix: prefix
	};
}
async function sendQQBotAutoMediaBatch(params) {
	for (const mediaUrl of params.mediaUrls) try {
		const result = await sendMedia({
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
		params.log?.error(params.onThrownError(mediaUrl, String(err)));
	}
}
/**
* Parse media tags from the reply text and send them in order.
*
* @returns `true` when media tags were found and handled; `false` when the caller
* should continue through the plain-text pipeline.
*/
async function parseAndSendMediaTags(replyText, event, actx, sendWithRetry, consumeQuoteRef) {
	const { account, log } = actx;
	const prefix = `[qqbot:${account.accountId}]`;
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
	log?.info(`${prefix} Detected media tags: ${Object.entries(tagCounts).map(([k, v]) => `${v} <${k}>`).join(", ")}`);
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
		let mediaPath = decodeMediaPath(normalizeOptionalString(match[2]) ?? "", log, prefix);
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
			log?.info(`${prefix} Found ${itemType} in <${tagName}>: ${mediaPath}`);
		}
		lastIndex = match.index + match[0].length;
	}
	const textAfter = text.slice(lastIndex).replace(/\n{3,}/g, "\n\n").trim();
	if (textAfter) sendQueue.push({
		type: "text",
		content: filterInternalMarkers(textAfter)
	});
	log?.info(`${prefix} Send queue: ${sendQueue.map((item) => item.type).join(" -> ")}`);
	const mediaTarget = resolveQQBotMediaTargetContext(event, account, prefix);
	for (const item of sendQueue) if (item.type === "text") await sendTextChunks(item.content, event, actx, sendWithRetry, consumeQuoteRef);
	else if (item.type === "image") await sendQQBotPhotoWithLogging({
		target: mediaTarget,
		imageUrl: item.content,
		log,
		onError: (error) => `${prefix} sendPhoto error: ${error}`
	});
	else if (item.type === "voice") await sendVoiceWithTimeout(mediaTarget, item.content, account, log, prefix);
	else if (item.type === "video") await sendQQBotResultWithLogging({
		run: async () => await sendVideoMsg(mediaTarget, item.content),
		log,
		onError: (error) => `${prefix} sendVideoMsg error: ${error}`
	});
	else if (item.type === "file") await sendQQBotResultWithLogging({
		run: async () => await sendDocument(mediaTarget, item.content),
		log,
		onError: (error) => `${prefix} sendDocument error: ${error}`
	});
	else if (item.type === "media") await sendQQBotResultWithLogging({
		run: async () => await sendMedia({
			to: actx.qualifiedTarget,
			text: "",
			mediaUrl: item.content,
			accountId: account.accountId,
			replyToId: event.messageId,
			account
		}),
		log,
		onError: (error) => `${prefix} sendMedia(auto) error: ${error}`
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
async function sendPlainReply(payload, replyText, event, actx, sendWithRetry, consumeQuoteRef, toolMediaUrls) {
	const { account, qualifiedTarget, log } = actx;
	const prefix = `[qqbot:${account.accountId}]`;
	const collectedImageUrls = [];
	const localMediaToSend = [];
	const collectImageUrl = (url) => {
		if (!url) return false;
		const isHttpUrl = url.startsWith("http://") || url.startsWith("https://");
		const isDataUrl = url.startsWith("data:image/");
		if (isHttpUrl || isDataUrl) {
			if (!collectedImageUrls.includes(url)) {
				collectedImageUrls.push(url);
				log?.info(`${prefix} Collected ${isDataUrl ? "Base64" : "media URL"}: ${isDataUrl ? `(length: ${url.length})` : url.slice(0, 80) + "..."}`);
			}
			return true;
		}
		if (isLocalPath(url)) {
			if (!localMediaToSend.includes(url)) {
				localMediaToSend.push(url);
				log?.info(`${prefix} Collected local media for auto-routing: ${url}`);
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
				log?.info(`${prefix} Extracted HTTP image from markdown: ${url.slice(0, 80)}...`);
			} else if (isLocalPath(url)) {
				if (!localMediaToSend.includes(url)) {
					localMediaToSend.push(url);
					log?.info(`${prefix} Collected local media from markdown for auto-routing: ${url}`);
				}
			}
		}
	}
	const bareUrlMatches = [...replyText.matchAll(/(?<![(["'])(https?:\/\/[^\s)"'<>]+\.(?:png|jpg|jpeg|gif|webp)(?:\?[^\s"'<>]*)?)/gi)];
	for (const m of bareUrlMatches) {
		const url = m[1];
		if (url && !collectedImageUrls.includes(url)) {
			collectedImageUrls.push(url);
			log?.info(`${prefix} Extracted bare image URL: ${url.slice(0, 80)}...`);
		}
	}
	const useMarkdown = account.markdownSupport;
	log?.info(`${prefix} Markdown mode: ${useMarkdown}, images: ${collectedImageUrls.length}`);
	let textWithoutImages = filterInternalMarkers(replyText);
	for (const m of mdMatches) {
		const url = m[2]?.trim();
		if (url && !url.startsWith("http://") && !url.startsWith("https://") && !isLocalPath(url)) textWithoutImages = textWithoutImages.replace(m[0], "").trim();
	}
	if (useMarkdown) await sendMarkdownReply(textWithoutImages, collectedImageUrls, mdMatches, bareUrlMatches, event, actx, sendWithRetry, consumeQuoteRef);
	else await sendPlainTextReply(textWithoutImages, collectedImageUrls, mdMatches, bareUrlMatches, event, actx, sendWithRetry, consumeQuoteRef);
	if (localMediaToSend.length > 0) {
		log?.info(`${prefix} Sending ${localMediaToSend.length} local media via sendMedia auto-routing`);
		await sendQQBotAutoMediaBatch({
			qualifiedTarget,
			account,
			replyToId: event.messageId,
			mediaUrls: localMediaToSend,
			log,
			onSuccess: (mediaPath) => `${prefix} Sent local media: ${mediaPath}`,
			onResultError: (mediaPath, error) => `${prefix} sendMedia(auto) error for ${mediaPath}: ${error}`,
			onThrownError: (mediaPath, error) => `${prefix} sendMedia(auto) failed for ${mediaPath}: ${error}`
		});
	}
	if (toolMediaUrls.length > 0) {
		log?.info(`${prefix} Forwarding ${toolMediaUrls.length} tool-collected media URL(s) after block deliver`);
		await sendQQBotAutoMediaBatch({
			qualifiedTarget,
			account,
			replyToId: event.messageId,
			mediaUrls: toolMediaUrls,
			log,
			onSuccess: (mediaUrl) => `${prefix} Forwarded tool media: ${mediaUrl.slice(0, 80)}...`,
			onResultError: (_mediaUrl, error) => `${prefix} Tool media forward error: ${error}`,
			onThrownError: (_mediaUrl, error) => `${prefix} Tool media forward failed: ${error}`
		});
		toolMediaUrls.length = 0;
	}
}
/** Decode a media path by stripping `MEDIA:`, expanding `~`, and unescaping. */
function decodeMediaPath(raw, log, prefix) {
	let mediaPath = raw;
	if (mediaPath.startsWith("MEDIA:")) mediaPath = mediaPath.slice(6);
	mediaPath = normalizePath(mediaPath);
	mediaPath = mediaPath.replace(/\\\\/g, "\\");
	const isWinLocal = /^[a-zA-Z]:[\\/]/.test(mediaPath) || mediaPath.startsWith("\\\\");
	try {
		const hasOctal = /\\[0-7]{1,3}/.test(mediaPath);
		const hasNonASCII = /[\u0080-\u00FF]/.test(mediaPath);
		if (!isWinLocal && (hasOctal || hasNonASCII)) {
			log?.debug?.(`${prefix} Decoding path with mixed encoding: ${mediaPath}`);
			let decoded = mediaPath.replace(/\\([0-7]{1,3})/g, (_, octal) => {
				return String.fromCharCode(parseInt(octal, 8));
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
				log?.debug?.(`${prefix} Successfully decoded path: ${mediaPath}`);
			}
		}
	} catch (decodeErr) {
		log?.error(`${prefix} Path decode error: ${String(decodeErr)}`);
	}
	return mediaPath;
}
/** Shared helper for sending chunked text replies. */
async function sendQQBotTextChunk(params) {
	const { account, event, token, text, consumeQuoteRef, allowDm } = params;
	const ref = consumeQuoteRef();
	if (event.type === "c2c") return await sendC2CMessage(account.appId, token, event.senderId, text, event.messageId, ref);
	if (event.type === "group" && event.groupOpenid) return await sendGroupMessage(account.appId, token, event.groupOpenid, text, event.messageId);
	if (allowDm && event.type === "dm" && event.guildId) return await sendDmMessage(token, event.guildId, text, event.messageId);
	if (event.channelId) return await sendChannelMessage(token, event.channelId, text, event.messageId);
}
async function sendTextChunks(text, event, actx, sendWithRetry, consumeQuoteRef) {
	const { account, log } = actx;
	const prefix = `[qqbot:${account.accountId}]`;
	await sendQQBotTextChunksWithRetry({
		account,
		event,
		chunks: getQQBotRuntime().channel.text.chunkMarkdownText(text, TEXT_CHUNK_LIMIT),
		sendWithRetry,
		consumeQuoteRef,
		allowDm: true,
		log,
		onSuccess: (chunk) => `${prefix} Sent text chunk (${chunk.length}/${text.length} chars): ${chunk.slice(0, 50)}...`,
		onError: (err) => `${prefix} Failed to send text chunk: ${String(err)}`
	});
}
async function sendQQBotTextChunksWithRetry(params) {
	const { account, event, chunks, sendWithRetry, consumeQuoteRef, allowDm, log } = params;
	for (const chunk of chunks) try {
		await sendWithRetry((token) => sendQQBotTextChunk({
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
async function sendQQBotResultWithLogging(params) {
	try {
		const result = await params.run();
		if (result.error) {
			params.log?.error(params.onError(result.error));
			return;
		}
		const successMessage = params.onSuccess?.();
		if (successMessage) params.log?.info(successMessage);
	} catch (err) {
		params.log?.error(params.onError(String(err)));
	}
}
async function sendQQBotPhotoWithLogging(params) {
	await sendQQBotResultWithLogging({
		run: async () => await sendPhoto(params.target, params.imageUrl),
		log: params.log,
		onSuccess: params.onSuccess ? () => params.onSuccess?.(params.imageUrl) : void 0,
		onError: params.onError
	});
}
/** Send voice with a 45s timeout guard. */
async function sendVoiceWithTimeout(target, voicePath, account, log, prefix) {
	const uploadFormats = account.config?.audioFormatPolicy?.uploadDirectFormats ?? account.config?.voiceDirectUploadFormats;
	const transcodeEnabled = account.config?.audioFormatPolicy?.transcodeEnabled !== false;
	const voiceTimeout = 45e3;
	const ac = new AbortController();
	try {
		const result = await Promise.race([sendVoice(target, voicePath, uploadFormats, transcodeEnabled).then((r) => {
			if (ac.signal.aborted) {
				log?.info(`${prefix} sendVoice completed after timeout, suppressing late delivery`);
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
		if (result.error) log?.error(`${prefix} sendVoice error: ${result.error}`);
	} catch (err) {
		log?.error(`${prefix} sendVoice unexpected error: ${String(err)}`);
	}
}
/** Send in markdown mode. */
async function sendMarkdownReply(textWithoutImages, imageUrls, mdMatches, bareUrlMatches, event, actx, sendWithRetry, consumeQuoteRef) {
	const { account, log } = actx;
	const prefix = `[qqbot:${account.accountId}]`;
	const httpImageUrls = [];
	const base64ImageUrls = [];
	for (const url of imageUrls) if (url.startsWith("data:image/")) base64ImageUrls.push(url);
	else if (url.startsWith("http://") || url.startsWith("https://")) httpImageUrls.push(url);
	log?.info(`${prefix} Image classification: httpUrls=${httpImageUrls.length}, base64=${base64ImageUrls.length}`);
	if (base64ImageUrls.length > 0) {
		log?.info(`${prefix} Sending ${base64ImageUrls.length} image(s) via Rich Media API...`);
		for (const imageUrl of base64ImageUrls) try {
			await sendWithRetry(async (token) => {
				if (event.type === "c2c") await sendC2CImageMessage(account.appId, token, event.senderId, imageUrl, event.messageId);
				else if (event.type === "group" && event.groupOpenid) await sendGroupImageMessage(account.appId, token, event.groupOpenid, imageUrl, event.messageId);
				else if (event.type === "dm" && event.guildId) log?.info(`${prefix} DM does not support rich media image, skipping Base64 image`);
				else if (event.channelId) log?.info(`${prefix} Channel does not support rich media, skipping Base64 image`);
			});
			log?.info(`${prefix} Sent Base64 image via Rich Media API (size: ${imageUrl.length} chars)`);
		} catch (imgErr) {
			log?.error(`${prefix} Failed to send Base64 image via Rich Media API: ${String(imgErr)}`);
		}
	}
	const existingMdUrls = new Set(mdMatches.map((m) => m[2]));
	const imagesToAppend = [];
	for (const url of httpImageUrls) if (!existingMdUrls.has(url)) try {
		const size = await getImageSize(url);
		imagesToAppend.push(formatQQBotMarkdownImage(url, size));
		log?.info(`${prefix} Formatted HTTP image: ${size ? `${size.width}x${size.height}` : "default size"} - ${url.slice(0, 60)}...`);
	} catch (err) {
		log?.info(`${prefix} Failed to get image size, using default: ${String(err)}`);
		imagesToAppend.push(formatQQBotMarkdownImage(url, null));
	}
	let result = textWithoutImages;
	for (const m of mdMatches) {
		const fullMatch = m[0];
		const imgUrl = m[2];
		if ((imgUrl.startsWith("http://") || imgUrl.startsWith("https://")) && !hasQQBotImageSize(fullMatch)) try {
			const size = await getImageSize(imgUrl);
			result = result.replace(fullMatch, formatQQBotMarkdownImage(imgUrl, size));
			log?.info(`${prefix} Updated image with size: ${size ? `${size.width}x${size.height}` : "default"} - ${imgUrl.slice(0, 60)}...`);
		} catch (err) {
			log?.info(`${prefix} Failed to get image size for existing md, using default: ${String(err)}`);
			result = result.replace(fullMatch, formatQQBotMarkdownImage(imgUrl, null));
		}
	}
	for (const m of bareUrlMatches) result = result.replace(m[0], "").trim();
	if (imagesToAppend.length > 0) {
		result = result.trim();
		result = result ? result + "\n\n" + imagesToAppend.join("\n") : imagesToAppend.join("\n");
	}
	if (result.trim()) await sendQQBotTextChunksWithRetry({
		account,
		event,
		chunks: chunkText(result, TEXT_CHUNK_LIMIT),
		sendWithRetry,
		consumeQuoteRef,
		allowDm: true,
		log,
		onSuccess: (chunk) => `${prefix} Sent markdown chunk (${chunk.length}/${result.length} chars) with ${httpImageUrls.length} HTTP images (${event.type})`,
		onError: (err) => `${prefix} Failed to send markdown message chunk: ${String(err)}`
	});
}
/** Send in plain-text mode. */
async function sendPlainTextReply(textWithoutImages, imageUrls, mdMatches, bareUrlMatches, event, actx, sendWithRetry, consumeQuoteRef) {
	const { account, log } = actx;
	const prefix = `[qqbot:${account.accountId}]`;
	const imgMediaTarget = resolveQQBotMediaTargetContext(event, account, prefix);
	let result = textWithoutImages;
	for (const m of mdMatches) result = result.replace(m[0], "").trim();
	for (const m of bareUrlMatches) result = result.replace(m[0], "").trim();
	if (result && event.type !== "c2c") result = result.replace(/([a-zA-Z0-9])\.([a-zA-Z0-9])/g, "$1_$2");
	try {
		for (const imageUrl of imageUrls) await sendQQBotPhotoWithLogging({
			target: imgMediaTarget,
			imageUrl,
			log,
			onSuccess: (nextImageUrl) => `${prefix} Sent image via sendPhoto: ${nextImageUrl.slice(0, 80)}...`,
			onError: (error) => `${prefix} Failed to send image: ${error}`
		});
		if (result.trim()) await sendQQBotTextChunksWithRetry({
			account,
			event,
			chunks: chunkText(result, TEXT_CHUNK_LIMIT),
			sendWithRetry,
			consumeQuoteRef,
			allowDm: false,
			log,
			onSuccess: (chunk) => `${prefix} Sent text chunk (${chunk.length}/${result.length} chars) (${event.type})`,
			onError: (err) => `${prefix} Send failed: ${String(err)}`
		});
	} catch (err) {
		log?.error(`${prefix} Send failed: ${String(err)}`);
	}
}
//#endregion
//#region extensions/qqbot/src/ref-index-store.ts
const STORAGE_DIR = getQQBotDataDir("data");
const REF_INDEX_FILE = path.join(STORAGE_DIR, "ref-index.jsonl");
const MAX_ENTRIES = 5e4;
const TTL_MS = 10080 * 60 * 1e3;
const COMPACT_THRESHOLD_RATIO = 2;
let cache = null;
let totalLinesOnDisk = 0;
/** Lazily load the JSONL store into memory. */
function loadFromFile() {
	if (cache !== null) return cache;
	cache = /* @__PURE__ */ new Map();
	totalLinesOnDisk = 0;
	try {
		if (!fs.existsSync(REF_INDEX_FILE)) return cache;
		const lines = fs.readFileSync(REF_INDEX_FILE, "utf-8").split("\n");
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
		debugError(`[ref-index-store] Failed to load: ${String(err)}`);
		cache = /* @__PURE__ */ new Map();
	}
	return cache;
}
/** Append one record to the JSONL file. */
function appendLine(line) {
	try {
		ensureDir$1();
		fs.appendFileSync(REF_INDEX_FILE, JSON.stringify(line) + "\n", "utf-8");
		totalLinesOnDisk++;
	} catch (err) {
		debugError(`[ref-index-store] Failed to append: ${String(err)}`);
	}
}
function ensureDir$1() {
	if (!fs.existsSync(STORAGE_DIR)) fs.mkdirSync(STORAGE_DIR, { recursive: true });
}
function shouldCompact() {
	if (!cache) return false;
	return totalLinesOnDisk > cache.size * COMPACT_THRESHOLD_RATIO && totalLinesOnDisk > 1e3;
}
function compactFile() {
	if (!cache) return;
	const before = totalLinesOnDisk;
	try {
		ensureDir$1();
		const tmpPath = REF_INDEX_FILE + ".tmp";
		const lines = [];
		for (const [key, entry] of cache) {
			const line = {
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
			};
			lines.push(JSON.stringify(line));
		}
		fs.writeFileSync(tmpPath, lines.join("\n") + "\n", "utf-8");
		fs.renameSync(tmpPath, REF_INDEX_FILE);
		totalLinesOnDisk = cache.size;
		debugLog(`[ref-index-store] Compacted: ${before} lines → ${totalLinesOnDisk} lines`);
	} catch (err) {
		debugError(`[ref-index-store] Compact failed: ${err instanceof Error ? err.message : JSON.stringify(err)}`);
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
		content: entry.content,
		senderId: entry.senderId,
		senderName: entry.senderName,
		timestamp: entry.timestamp,
		isBot: entry.isBot,
		attachments: entry.attachments,
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
/** Compact the store before process exit when needed. */
function flushRefIndex() {
	if (cache && shouldCompact()) compactFile();
}
//#endregion
//#region extensions/qqbot/src/reply-dispatcher.ts
/** Send a message and retry once if the token appears to have expired. */
async function sendWithTokenRetry(appId, clientSecret, sendFn, log, accountId) {
	try {
		return await sendFn(await getAccessToken(appId, clientSecret));
	} catch (err) {
		const errMsg = String(err);
		if (errMsg.includes("401") || errMsg.includes("token") || errMsg.includes("access_token")) {
			log?.info(`[qqbot:${accountId}] Token may be expired, refreshing...`);
			clearTokenCache(appId);
			return await sendFn(await getAccessToken(appId, clientSecret));
		} else throw err;
	}
}
/** Route a text message to the correct QQ target type. */
async function sendTextToTarget(ctx, text, refIdx) {
	const { target, account } = ctx;
	await sendWithTokenRetry(account.appId, account.clientSecret, async (token) => {
		if (target.type === "c2c") await sendC2CMessage(account.appId, token, target.senderId, text, target.messageId, refIdx);
		else if (target.type === "group" && target.groupOpenid) await sendGroupMessage(account.appId, token, target.groupOpenid, text, target.messageId);
		else if (target.channelId) await sendChannelMessage(token, target.channelId, text, target.messageId);
		else if (target.type === "dm" && target.guildId) await sendDmMessage(token, target.guildId, text, target.messageId);
	}, ctx.log, account.accountId);
}
/** Best-effort delivery for error text back to the user. */
async function sendErrorToTarget(ctx, errorText) {
	try {
		await sendTextToTarget(ctx, errorText);
	} catch (sendErr) {
		ctx.log?.error(`[qqbot:${ctx.account.accountId}] Failed to send error message: ${String(sendErr)}`);
	}
}
/**
* Handle a structured payload prefixed with `QQBOT_PAYLOAD:`.
* Returns true when the reply was handled here, otherwise false.
*/
async function handleStructuredPayload(ctx, replyText, recordActivity) {
	const { account, log } = ctx;
	const payloadResult = parseQQBotPayload(replyText);
	if (!payloadResult.isPayload) return false;
	if (payloadResult.error) {
		log?.error(`[qqbot:${account.accountId}] Payload parse error: ${payloadResult.error}`);
		return true;
	}
	if (!payloadResult.payload) return true;
	const parsedPayload = payloadResult.payload;
	const unknownPayload = payloadResult.payload;
	log?.info(`[qqbot:${account.accountId}] Detected structured payload, type: ${parsedPayload.type}`);
	if (isCronReminderPayload(parsedPayload)) {
		log?.info(`[qqbot:${account.accountId}] Processing cron_reminder payload`);
		const cronMessage = encodePayloadForCron(parsedPayload);
		const confirmText = `⏰ Reminder scheduled. It will be sent at the configured time: "${parsedPayload.content}"`;
		try {
			await sendTextToTarget(ctx, confirmText);
			log?.info(`[qqbot:${account.accountId}] Cron reminder confirmation sent, cronMessage: ${cronMessage}`);
		} catch (err) {
			log?.error(`[qqbot:${account.accountId}] Failed to send cron confirmation: ${err instanceof Error ? err.message : JSON.stringify(err)}`);
		}
		recordActivity();
		return true;
	}
	if (isMediaPayload(parsedPayload)) {
		log?.info(`[qqbot:${account.accountId}] Processing media payload, mediaType: ${parsedPayload.mediaType}`);
		if (parsedPayload.mediaType === "image") await handleImagePayload(ctx, parsedPayload);
		else if (parsedPayload.mediaType === "audio") await handleAudioPayload(ctx, parsedPayload);
		else if (parsedPayload.mediaType === "video") await handleVideoPayload(ctx, parsedPayload);
		else if (parsedPayload.mediaType === "file") await handleFilePayload(ctx, parsedPayload);
		else log?.error(`[qqbot:${account.accountId}] Unknown media type: ${JSON.stringify(parsedPayload.mediaType)}`);
		recordActivity();
		return true;
	}
	const payloadType = typeof unknownPayload === "object" && unknownPayload !== null && "type" in unknownPayload && typeof unknownPayload.type === "string" ? unknownPayload.type : "unknown";
	log?.error(`[qqbot:${account.accountId}] Unknown payload type: ${payloadType}`);
	return true;
}
function validateStructuredPayloadLocalPath(ctx, payloadPath, mediaType) {
	const allowedPath = resolveQQBotPayloadLocalFilePath(payloadPath);
	if (allowedPath) return allowedPath;
	ctx.log?.error(`[qqbot:${ctx.account.accountId}] Blocked ${mediaType} payload local path outside QQ Bot media storage`);
	return null;
}
function isRemoteHttpUrl(p) {
	return p.startsWith("http://") || p.startsWith("https://");
}
function isInlineImageDataUrl(p) {
	return /^data:image\/[^;]+;base64,/i.test(p);
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
	const normalizedPath = normalizePath(payload.path);
	let imageUrl;
	if (payload.source === "file") imageUrl = validateStructuredPayloadLocalPath(ctx, normalizedPath, "image");
	else if (isRemoteHttpUrl(normalizedPath) || isInlineImageDataUrl(normalizedPath)) imageUrl = normalizedPath;
	else {
		log?.error(`[qqbot:${account.accountId}] Image payload URL must use http(s) or data:image/: ${sanitizeForLog(payload.path)}`);
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
			log?.error(`[qqbot:${account.accountId}] Unsupported image format: ${ext}`);
			return;
		}
		imageUrl = `data:${mimeType};base64,${base64Data}`;
		log?.info(`[qqbot:${account.accountId}] Converted local image to Base64 (size: ${formatFileSize(fileBuffer.length)})`);
	} catch (readErr) {
		log?.error(`[qqbot:${account.accountId}] Failed to read local image: ${readErr instanceof Error ? readErr.message : JSON.stringify(readErr)}`);
		return;
	}
	try {
		await sendWithTokenRetry(account.appId, account.clientSecret, async (token) => {
			if (target.type === "c2c") await sendC2CImageMessage(account.appId, token, target.senderId, imageUrl, target.messageId, void 0, originalImagePath);
			else if (target.type === "group" && target.groupOpenid) await sendGroupImageMessage(account.appId, token, target.groupOpenid, imageUrl, target.messageId);
			else if (target.type === "dm" && target.guildId) await sendDmMessage(token, target.guildId, `![](${payload.path})`, target.messageId);
			else if (target.channelId) await sendChannelMessage(token, target.channelId, `![](${payload.path})`, target.messageId);
		}, log, account.accountId);
		log?.info(`[qqbot:${account.accountId}] Sent image via media payload`);
		if (payload.caption) await sendTextToTarget(ctx, payload.caption);
	} catch (err) {
		log?.error(`[qqbot:${account.accountId}] Failed to send image: ${err instanceof Error ? err.message : JSON.stringify(err)}`);
	}
}
async function handleAudioPayload(ctx, payload) {
	const { target, account, cfg, log } = ctx;
	try {
		const ttsText = payload.caption || payload.path;
		if (!ttsText?.trim()) {
			log?.error(`[qqbot:${account.accountId}] Voice missing text`);
			return;
		}
		let silkBase64;
		let silkPath;
		let duration;
		let providerLabel;
		const ttsCfg = resolveTTSConfig(cfg);
		if (ttsCfg) {
			log?.info(`[qqbot:${account.accountId}] TTS (plugin): "${ttsText.slice(0, 50)}..." via ${ttsCfg.model}`);
			const result = await textToSilk(ttsText, ttsCfg, getQQBotDataDir("tts"));
			silkBase64 = result.silkBase64;
			silkPath = result.silkPath;
			duration = result.duration;
			providerLabel = ttsCfg.model;
		} else {
			if (!isGlobalTTSAvailable(cfg)) {
				log?.error(`[qqbot:${account.accountId}] TTS not configured (neither plugin channels.qqbot.tts nor global messages.tts)`);
				return;
			}
			log?.info(`[qqbot:${account.accountId}] TTS (global fallback): "${ttsText.slice(0, 50)}..."`);
			const globalResult = await getQQBotRuntime().tts.textToSpeech({
				text: ttsText,
				cfg,
				channel: "qqbot"
			});
			if (!globalResult.success || !globalResult.audioPath) {
				log?.error(`[qqbot:${account.accountId}] Global TTS failed: ${globalResult.error ?? "unknown"}`);
				return;
			}
			log?.info(`[qqbot:${account.accountId}] Global TTS returned: provider=${globalResult.provider}, format=${globalResult.outputFormat}, path=${globalResult.audioPath}`);
			providerLabel = globalResult.provider ?? "global";
			const base64 = await audioFileToSilkBase64(globalResult.audioPath);
			if (!base64) {
				log?.error(`[qqbot:${account.accountId}] Failed to convert global TTS audio to SILK`);
				return;
			}
			silkBase64 = base64;
			silkPath = globalResult.audioPath;
			duration = 0;
		}
		if (!silkBase64) {
			log?.error(`[qqbot:${account.accountId}] TTS produced no audio output`);
			return;
		}
		log?.info(`[qqbot:${account.accountId}] TTS done (${providerLabel}): ${duration ? formatDuration(duration) : "N/A"}, file: ${silkPath ?? "N/A"}`);
		await sendWithTokenRetry(account.appId, account.clientSecret, async (token) => {
			if (target.type === "c2c") await sendC2CVoiceMessage(account.appId, token, target.senderId, silkBase64, void 0, target.messageId, ttsText, silkPath);
			else if (target.type === "group" && target.groupOpenid) await sendGroupVoiceMessage(account.appId, token, target.groupOpenid, silkBase64, void 0, target.messageId);
			else if (target.type === "dm" && target.guildId) {
				log?.error(`[qqbot:${account.accountId}] Voice not supported in DM, sending text fallback`);
				await sendDmMessage(token, target.guildId, ttsText, target.messageId);
			} else if (target.channelId) {
				log?.error(`[qqbot:${account.accountId}] Voice not supported in channel, sending text fallback`);
				await sendChannelMessage(token, target.channelId, ttsText, target.messageId);
			}
		}, log, account.accountId);
		log?.info(`[qqbot:${account.accountId}] Voice message sent`);
	} catch (err) {
		log?.error(`[qqbot:${account.accountId}] TTS/voice send failed: ${err instanceof Error ? err.message : JSON.stringify(err)}`);
	}
}
async function handleVideoPayload(ctx, payload) {
	const { target, account, log } = ctx;
	try {
		const originalPath = payload.path ?? "";
		const normalizedPath = normalizePath(originalPath);
		const isHttpUrl = isRemoteHttpUrl(normalizedPath);
		const videoPath = isHttpUrl ? normalizedPath : validateStructuredPayloadLocalPath(ctx, originalPath, "video");
		if (!videoPath) return;
		if (!videoPath.trim()) {
			log?.error(`[qqbot:${account.accountId}] Video missing path`);
			return;
		}
		log?.info(`[qqbot:${account.accountId}] Video send: ${describeMediaTargetForLog(videoPath, isHttpUrl)}`);
		await sendWithTokenRetry(account.appId, account.clientSecret, async (token) => {
			if (isHttpUrl) {
				if (target.type === "c2c") await sendC2CVideoMessage(account.appId, token, target.senderId, videoPath, void 0, target.messageId);
				else if (target.type === "group" && target.groupOpenid) await sendGroupVideoMessage(account.appId, token, target.groupOpenid, videoPath, void 0, target.messageId);
				else if (target.type === "dm") log?.error(`[qqbot:${account.accountId}] Video not supported in DM`);
				else if (target.channelId) log?.error(`[qqbot:${account.accountId}] Video not supported in channel`);
			} else {
				const fileBuffer = await readStructuredPayloadLocalFile(videoPath);
				const videoBase64 = fileBuffer.toString("base64");
				log?.info(`[qqbot:${account.accountId}] Read local video (${formatFileSize(fileBuffer.length)}): ${describeMediaTargetForLog(videoPath, false)}`);
				if (target.type === "c2c") await sendC2CVideoMessage(account.appId, token, target.senderId, void 0, videoBase64, target.messageId, void 0, videoPath);
				else if (target.type === "group" && target.groupOpenid) await sendGroupVideoMessage(account.appId, token, target.groupOpenid, void 0, videoBase64, target.messageId);
				else if (target.type === "dm") log?.error(`[qqbot:${account.accountId}] Video not supported in DM`);
				else if (target.channelId) log?.error(`[qqbot:${account.accountId}] Video not supported in channel`);
			}
		}, log, account.accountId);
		log?.info(`[qqbot:${account.accountId}] Video message sent`);
		if (payload.caption) await sendTextToTarget(ctx, payload.caption);
	} catch (err) {
		const errMsg = err instanceof Error ? err.message : typeof err === "string" ? err : JSON.stringify(err);
		log?.error(`[qqbot:${account.accountId}] Video send failed: ${errMsg}`);
	}
}
async function handleFilePayload(ctx, payload) {
	const { target, account, log } = ctx;
	try {
		const originalPath = payload.path ?? "";
		const normalizedPath = normalizePath(originalPath);
		const isHttpUrl = isRemoteHttpUrl(normalizedPath);
		const filePath = isHttpUrl ? normalizedPath : validateStructuredPayloadLocalPath(ctx, originalPath, "file");
		if (!filePath) return;
		if (!filePath.trim()) {
			log?.error(`[qqbot:${account.accountId}] File missing path`);
			return;
		}
		const fileName = sanitizeFileName(path.basename(filePath));
		log?.info(`[qqbot:${account.accountId}] File send: ${describeMediaTargetForLog(filePath, isHttpUrl)} (${isHttpUrl ? "URL" : "local"})`);
		await sendWithTokenRetry(account.appId, account.clientSecret, async (token) => {
			if (isHttpUrl) {
				if (target.type === "c2c") await sendC2CFileMessage(account.appId, token, target.senderId, void 0, filePath, target.messageId, fileName);
				else if (target.type === "group" && target.groupOpenid) await sendGroupFileMessage(account.appId, token, target.groupOpenid, void 0, filePath, target.messageId, fileName);
				else if (target.type === "dm") log?.error(`[qqbot:${account.accountId}] File not supported in DM`);
				else if (target.channelId) log?.error(`[qqbot:${account.accountId}] File not supported in channel`);
			} else {
				const fileBase64 = (await readStructuredPayloadLocalFile(filePath)).toString("base64");
				if (target.type === "c2c") await sendC2CFileMessage(account.appId, token, target.senderId, fileBase64, void 0, target.messageId, fileName, filePath);
				else if (target.type === "group" && target.groupOpenid) await sendGroupFileMessage(account.appId, token, target.groupOpenid, fileBase64, void 0, target.messageId, fileName);
				else if (target.type === "dm") log?.error(`[qqbot:${account.accountId}] File not supported in DM`);
				else if (target.channelId) log?.error(`[qqbot:${account.accountId}] File not supported in channel`);
			}
		}, log, account.accountId);
		log?.info(`[qqbot:${account.accountId}] File message sent`);
	} catch (err) {
		const errMsg = err instanceof Error ? err.message : typeof err === "string" ? err : JSON.stringify(err);
		log?.error(`[qqbot:${account.accountId}] File send failed: ${errMsg}`);
	}
}
//#endregion
//#region extensions/qqbot/src/session-store.ts
const SESSION_DIR = getQQBotDataDir("sessions");
const SESSION_EXPIRE_TIME = 300 * 1e3;
const SAVE_THROTTLE_MS = 1e3;
const throttleState = /* @__PURE__ */ new Map();
/** Ensure the session directory exists. */
function ensureDir() {
	if (!fs.existsSync(SESSION_DIR)) fs.mkdirSync(SESSION_DIR, { recursive: true });
}
function encodeAccountIdForFileName(accountId) {
	return Buffer.from(accountId, "utf8").toString("base64url");
}
function getLegacySessionPath(accountId) {
	const safeId = accountId.replace(/[^a-zA-Z0-9_-]/g, "_");
	return path.join(SESSION_DIR, `session-${safeId}.json`);
}
/** Return the session file path for one account. */
function getSessionPath(accountId) {
	const encodedId = encodeAccountIdForFileName(accountId);
	return path.join(SESSION_DIR, `session-${encodedId}.json`);
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
		debugError(`[session-store] Failed to load session for ${accountId}: ${String(err)}`);
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
				if (t && t.pendingState) {
					doSaveSession(t.pendingState);
					t.lastSaveTime = Date.now();
					t.pendingState = null;
				}
				if (t) t.throttleTimer = null;
			}, delay);
		}
	}
}
/** Write one session file to disk immediately. */
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
		debugError(`[session-store] Failed to save session for ${state.accountId}: ${String(err)}`);
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
		debugError(`[session-store] Failed to clear session for ${accountId}: ${String(err)}`);
	}
}
//#endregion
//#region extensions/qqbot/src/typing-keepalive.ts
/** Periodically refresh C2C typing state while a response is still in progress. */
const TYPING_INTERVAL_MS = 5e4;
var TypingKeepAlive = class {
	constructor(getToken, clearCache, openid, msgId, log, logPrefix = "[qqbot]") {
		this.getToken = getToken;
		this.clearCache = clearCache;
		this.openid = openid;
		this.msgId = msgId;
		this.log = log;
		this.logPrefix = logPrefix;
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
			await sendC2CInputNotify(await this.getToken(), this.openid, this.msgId, 60);
			this.log?.debug?.(`${this.logPrefix} Typing keep-alive sent to ${this.openid}`);
		} catch (err) {
			try {
				this.clearCache();
				await sendC2CInputNotify(await this.getToken(), this.openid, this.msgId, 60);
			} catch {
				this.log?.debug?.(`${this.logPrefix} Typing keep-alive failed for ${this.openid}: ${String(err)}`);
			}
		}
	}
};
//#endregion
//#region extensions/qqbot/src/gateway.ts
const INTENTS = {
	GUILDS: 1,
	GUILD_MEMBERS: 2,
	PUBLIC_GUILD_MESSAGES: 1 << 30,
	DIRECT_MESSAGE: 4096,
	GROUP_AND_C2C: 1 << 25
};
const FULL_INTENTS = INTENTS.PUBLIC_GUILD_MESSAGES | INTENTS.DIRECT_MESSAGE | INTENTS.GROUP_AND_C2C;
const FULL_INTENTS_DESC = "groups + DMs + channels";
const RECONNECT_DELAYS = [
	1e3,
	2e3,
	5e3,
	1e4,
	3e4,
	6e4
];
const RATE_LIMIT_DELAY = 6e4;
const MAX_RECONNECT_ATTEMPTS = 100;
const MAX_QUICK_DISCONNECT_COUNT = 3;
const QUICK_DISCONNECT_THRESHOLD = 5e3;
function decodeGatewayMessageData(data) {
	if (typeof data === "string") return data;
	if (Buffer.isBuffer(data)) return data.toString("utf8");
	if (Array.isArray(data) && data.every((chunk) => Buffer.isBuffer(chunk))) return Buffer.concat(data).toString("utf8");
	if (data instanceof ArrayBuffer) return Buffer.from(data).toString("utf8");
	if (ArrayBuffer.isView(data)) return Buffer.from(data.buffer, data.byteOffset, data.byteLength).toString("utf8");
	return "";
}
function readOptionalMessageSceneExt(event) {
	if (!("message_scene" in event)) return;
	return event.message_scene?.ext;
}
/**
* Start the Gateway WebSocket connection with automatic reconnect support.
*/
async function startGateway(ctx) {
	const { account, abortSignal, cfg, onReady, onError, log } = ctx;
	if (!account.appId || !account.clientSecret) throw new Error("QQBot not configured (missing appId or clientSecret)");
	const diag = await runDiagnostics();
	if (diag.warnings.length > 0) for (const w of diag.warnings) log?.info(`[qqbot:${account.accountId}] ${w}`);
	initApiConfig(account.appId, { markdownSupport: account.markdownSupport });
	log?.info(`[qqbot:${account.accountId}] API config: markdownSupport=${account.markdownSupport}`);
	onMessageSent(account.appId, (refIdx, meta) => {
		log?.info(`[qqbot:${account.accountId}] onMessageSent called: refIdx=${refIdx}, mediaType=${meta.mediaType}, ttsText=${meta.ttsText?.slice(0, 30)}`);
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
				log?.info(`[qqbot:${account.accountId}] Saving voice transcript (TTS): ${meta.ttsText.slice(0, 50)}`);
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
		log?.info(`[qqbot:${account.accountId}] Cached outbound refIdx: ${refIdx}, attachments=${JSON.stringify(attachments)}`);
	});
	const ttsCfg = resolveTTSConfig(cfg);
	if (ttsCfg) {
		const maskedKey = ttsCfg.apiKey.length > 8 ? `${ttsCfg.apiKey.slice(0, 4)}****${ttsCfg.apiKey.slice(-4)}` : "****";
		log?.info(`[qqbot:${account.accountId}] TTS configured (plugin): model=${ttsCfg.model}, voice=${ttsCfg.voice}, authStyle=${ttsCfg.authStyle ?? "bearer"}, baseUrl=${ttsCfg.baseUrl}`);
		log?.info(`[qqbot:${account.accountId}] TTS apiKey: ${maskedKey}${ttsCfg.queryParams ? `, queryParams=${JSON.stringify(ttsCfg.queryParams)}` : ""}${ttsCfg.speed !== void 0 ? `, speed=${ttsCfg.speed}` : ""}`);
	} else if (isGlobalTTSAvailable(cfg)) {
		const globalProvider = cfg.messages?.tts?.provider ?? "auto";
		log?.info(`[qqbot:${account.accountId}] TTS configured (global fallback): provider=${globalProvider}`);
	} else log?.info(`[qqbot:${account.accountId}] TTS not configured (voice messages will be unavailable)`);
	let reconnectAttempts = 0;
	let isAborted = false;
	let currentWs = null;
	let heartbeatInterval = null;
	let sessionId = null;
	let lastSeq = null;
	let lastConnectTime = 0;
	let quickDisconnectCount = 0;
	let isConnecting = false;
	let reconnectTimer = null;
	let shouldRefreshToken = false;
	const savedSession = loadSession(account.accountId, account.appId);
	if (savedSession) {
		sessionId = savedSession.sessionId;
		lastSeq = savedSession.lastSeq;
		log?.info(`[qqbot:${account.accountId}] Restored session from storage: sessionId=${sessionId}, lastSeq=${lastSeq}`);
	}
	const msgQueue = createMessageQueue({
		accountId: account.accountId,
		log,
		isAborted: () => isAborted
	});
	const URGENT_COMMANDS = ["/stop"];
	const trySlashCommandOrEnqueue = async (msg) => {
		const content = (msg.content ?? "").trim();
		if (!content.startsWith("/")) {
			msgQueue.enqueue(msg);
			return;
		}
		const contentLower = normalizeLowercaseStringOrEmpty(content);
		if (URGENT_COMMANDS.some((cmd) => contentLower === normalizeLowercaseStringOrEmpty(cmd) || contentLower.startsWith(normalizeLowercaseStringOrEmpty(cmd) + " "))) {
			log?.info(`[qqbot:${account.accountId}] Urgent command detected: ${content.slice(0, 20)}, executing immediately`);
			const peerId = msgQueue.getMessagePeerId(msg);
			const droppedCount = msgQueue.clearUserQueue(peerId);
			if (droppedCount > 0) log?.info(`[qqbot:${account.accountId}] Dropped ${droppedCount} queued messages for ${peerId} due to urgent command`);
			msgQueue.executeImmediate(msg);
			return;
		}
		const receivedAt = Date.now();
		const peerId = msgQueue.getMessagePeerId(msg);
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
			queueSnapshot: msgQueue.getSnapshot(peerId)
		};
		try {
			const reply = await matchSlashCommand(cmdCtx);
			if (reply === null) {
				msgQueue.enqueue(msg);
				return;
			}
			log?.info(`[qqbot:${account.accountId}] Slash command matched: ${content}, replying directly`);
			const token = await getAccessToken(account.appId, account.clientSecret);
			const isFileResult = typeof reply === "object" && reply !== null && "filePath" in reply;
			const replyText = isFileResult ? reply.text : reply;
			const replyFile = isFileResult ? reply.filePath : null;
			if (msg.type === "c2c") await sendC2CMessage(account.appId, token, msg.senderId, replyText, msg.messageId);
			else if (msg.type === "group" && msg.groupOpenid) await sendGroupMessage(account.appId, token, msg.groupOpenid, replyText, msg.messageId);
			else if (msg.channelId) await sendChannelMessage(token, msg.channelId, replyText, msg.messageId);
			else if (msg.type === "dm" && msg.guildId) await sendDmMessage(token, msg.guildId, replyText, msg.messageId);
			if (replyFile) try {
				await sendDocument({
					targetType: msg.type === "group" ? "group" : msg.type === "dm" ? "dm" : msg.type === "c2c" ? "c2c" : "channel",
					targetId: msg.type === "group" ? msg.groupOpenid || msg.senderId : msg.type === "dm" ? msg.guildId || msg.senderId : msg.type === "c2c" ? msg.senderId : msg.channelId || msg.senderId,
					account,
					replyToId: msg.messageId,
					logPrefix: `[qqbot:${account.accountId}]`
				}, replyFile);
				log?.info(`[qqbot:${account.accountId}] Slash command file sent: ${replyFile}`);
			} catch (fileErr) {
				log?.error(`[qqbot:${account.accountId}] Failed to send slash command file: ${String(fileErr)}`);
			}
		} catch (err) {
			log?.error(`[qqbot:${account.accountId}] Slash command error: ${String(err)}`);
			msgQueue.enqueue(msg);
		}
	};
	abortSignal.addEventListener("abort", () => {
		isAborted = true;
		if (reconnectTimer) {
			clearTimeout(reconnectTimer);
			reconnectTimer = null;
		}
		cleanup();
		stopBackgroundTokenRefresh(account.appId);
		flushKnownUsers();
		flushRefIndex();
	});
	const cleanup = () => {
		if (heartbeatInterval) {
			clearInterval(heartbeatInterval);
			heartbeatInterval = null;
		}
		if (currentWs && (currentWs.readyState === WebSocket.OPEN || currentWs.readyState === WebSocket.CONNECTING)) currentWs.close();
		currentWs = null;
	};
	const getReconnectDelay = () => {
		return RECONNECT_DELAYS[Math.min(reconnectAttempts, RECONNECT_DELAYS.length - 1)];
	};
	const scheduleReconnect = (customDelay) => {
		if (isAborted || reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
			log?.error(`[qqbot:${account.accountId}] Max reconnect attempts reached or aborted`);
			return;
		}
		if (reconnectTimer) {
			clearTimeout(reconnectTimer);
			reconnectTimer = null;
		}
		const delay = customDelay ?? getReconnectDelay();
		reconnectAttempts++;
		log?.info(`[qqbot:${account.accountId}] Reconnecting in ${delay}ms (attempt ${reconnectAttempts})`);
		reconnectTimer = setTimeout(() => {
			reconnectTimer = null;
			if (!isAborted) connect();
		}, delay);
	};
	const connect = async () => {
		if (isConnecting) {
			log?.debug?.(`[qqbot:${account.accountId}] Already connecting, skip`);
			return;
		}
		isConnecting = true;
		try {
			cleanup();
			if (shouldRefreshToken) {
				log?.info(`[qqbot:${account.accountId}] Refreshing token...`);
				clearTokenCache(account.appId);
				shouldRefreshToken = false;
			}
			const accessToken = await getAccessToken(account.appId, account.clientSecret);
			log?.info(`[qqbot:${account.accountId}] ✅ Access token obtained successfully`);
			const gatewayUrl = await getGatewayUrl(accessToken);
			log?.info(`[qqbot:${account.accountId}] Connecting to ${gatewayUrl}`);
			const ws = new WebSocket(gatewayUrl, { headers: { "User-Agent": PLUGIN_USER_AGENT } });
			currentWs = ws;
			const pluginRuntime = getQQBotRuntime();
			const handleMessage = async (event) => {
				log?.debug?.(`[qqbot:${account.accountId}] Received message: ${JSON.stringify(event)}`);
				log?.info(`[qqbot:${account.accountId}] Processing message from ${event.senderId}: ${event.content}`);
				if (event.attachments?.length) log?.info(`[qqbot:${account.accountId}] Attachments: ${event.attachments.length}`);
				pluginRuntime.channel.activity.record({
					channel: "qqbot",
					accountId: account.accountId,
					direction: "inbound"
				});
				const isC2C = event.type === "c2c" || event.type === "dm";
				const typing = { keepAlive: null };
				const inputNotifyPromise = (async () => {
					if (!isC2C) return;
					try {
						let token = await getAccessToken(account.appId, account.clientSecret);
						try {
							const notifyResponse = await sendC2CInputNotify(token, event.senderId, event.messageId, 60);
							log?.info(`[qqbot:${account.accountId}] Sent input notify to ${event.senderId}${notifyResponse.refIdx ? `, got refIdx=${notifyResponse.refIdx}` : ""}`);
							typing.keepAlive = new TypingKeepAlive(() => getAccessToken(account.appId, account.clientSecret), () => clearTokenCache(account.appId), event.senderId, event.messageId, log, `[qqbot:${account.accountId}]`);
							typing.keepAlive.start();
							return notifyResponse.refIdx;
						} catch (notifyErr) {
							const errMsg = String(notifyErr);
							if (errMsg.includes("token") || errMsg.includes("401") || errMsg.includes("11244")) {
								log?.info(`[qqbot:${account.accountId}] InputNotify token expired, refreshing...`);
								clearTokenCache(account.appId);
								token = await getAccessToken(account.appId, account.clientSecret);
								const notifyResponse = await sendC2CInputNotify(token, event.senderId, event.messageId, 60);
								typing.keepAlive = new TypingKeepAlive(() => getAccessToken(account.appId, account.clientSecret), () => clearTokenCache(account.appId), event.senderId, event.messageId, log, `[qqbot:${account.accountId}]`);
								typing.keepAlive.start();
								return notifyResponse.refIdx;
							} else throw notifyErr;
						}
					} catch (err) {
						log?.error(`[qqbot:${account.accountId}] sendC2CInputNotify error: ${err instanceof Error ? err.message : JSON.stringify(err)}`);
						return;
					}
				})();
				const isGroupChat = event.type === "guild" || event.type === "group";
				const peerId = event.type === "guild" ? event.channelId ?? "unknown" : event.type === "group" ? event.groupOpenid ?? "unknown" : event.senderId;
				const route = pluginRuntime.channel.routing.resolveAgentRoute({
					cfg,
					channel: "qqbot",
					accountId: account.accountId,
					peer: {
						kind: isGroupChat ? "group" : "direct",
						id: peerId
					}
				});
				const envelopeOptions = pluginRuntime.channel.reply.resolveEnvelopeFormatOptions(cfg);
				const systemPrompts = [];
				if (account.systemPrompt) systemPrompts.push(account.systemPrompt);
				const { attachmentInfo, imageUrls, imageMediaTypes, voiceAttachmentPaths, voiceAttachmentUrls, voiceAsrReferTexts, voiceTranscripts, voiceTranscriptSources, attachmentLocalPaths } = await processAttachments(event.attachments, {
					accountId: account.accountId,
					cfg,
					log
				});
				const voiceText = formatVoiceText(voiceTranscripts);
				const hasAsrReferFallback = voiceTranscriptSources.includes("asr");
				const parsedContent = parseFaceTags(event.content);
				const userContent = voiceText ? (parsedContent.trim() ? `${parsedContent}\n${voiceText}` : voiceText) + attachmentInfo : parsedContent + attachmentInfo;
				let replyToId;
				let replyToBody;
				let replyToSender;
				let replyToIsQuote = false;
				if (event.refMsgIdx) {
					const refEntry = getRefIndex(event.refMsgIdx);
					if (refEntry) {
						replyToId = event.refMsgIdx;
						replyToBody = formatRefEntryForAgent(refEntry);
						replyToSender = refEntry.senderName ?? refEntry.senderId;
						replyToIsQuote = true;
						log?.info(`[qqbot:${account.accountId}] Quote detected: refMsgIdx=${event.refMsgIdx}, sender=${replyToSender}, content="${replyToBody.slice(0, 80)}..."`);
					} else {
						log?.info(`[qqbot:${account.accountId}] Quote detected but refMsgIdx not in cache: ${event.refMsgIdx}`);
						replyToId = event.refMsgIdx;
						replyToIsQuote = true;
					}
				}
				const inputNotifyRefIdx = await inputNotifyPromise;
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
					log?.info(`[qqbot:${account.accountId}] Cached msgIdx=${currentMsgIdx} for future reference (source: ${event.msgIdx ? "message_scene.ext" : "InputNotify"})`);
				}
				const body = pluginRuntime.channel.reply.formatInboundEnvelope({
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
				const sttTranscriptCount = voiceTranscriptSources.filter((s) => s === "stt").length;
				const asrFallbackCount = voiceTranscriptSources.filter((s) => s === "asr").length;
				const fallbackCount = voiceTranscriptSources.filter((s) => s === "fallback").length;
				if (voiceAttachmentPaths.length > 0 || voiceAttachmentUrls.length > 0 || uniqueVoiceAsrReferTexts.length > 0) {
					const asrPreview = uniqueVoiceAsrReferTexts.length > 0 ? uniqueVoiceAsrReferTexts[0].slice(0, 50) : "";
					log?.info(`[qqbot:${account.accountId}] Voice input summary: local=${uniqueVoicePaths.length}, remote=${uniqueVoiceUrls.length}, asrReferTexts=${uniqueVoiceAsrReferTexts.length}, transcripts=${voiceTranscripts.length}, source(stt/asr/fallback)=${sttTranscriptCount}/${asrFallbackCount}/${fallbackCount}` + (asrPreview ? `, asr_preview="${asrPreview}${uniqueVoiceAsrReferTexts[0].length > 50 ? "..." : ""}"` : ""));
				}
				const qualifiedTarget = isGroupChat ? event.type === "guild" ? `qqbot:channel:${event.channelId}` : `qqbot:group:${event.groupOpenid}` : event.type === "dm" ? `qqbot:dm:${event.guildId}` : `qqbot:c2c:${event.senderId}`;
				const hasTTS = !!resolveTTSConfig(cfg) || isGlobalTTSAvailable(cfg);
				let quotePart = "";
				if (replyToIsQuote) if (replyToBody) quotePart = `[Quoted message begins]\n${replyToBody}\n[Quoted message ends]\n`;
				else quotePart = `[Quoted message begins]\nOriginal content unavailable\n[Quoted message ends]\n`;
				const staticParts = [`[QQBot] to=${qualifiedTarget}`];
				if (hasTTS) staticParts.push("voice synthesis enabled");
				const staticInstruction = staticParts.join(" | ");
				systemPrompts.unshift(staticInstruction);
				const dynLines = [];
				if (imageUrls.length > 0) dynLines.push(`- Images: ${imageUrls.join(", ")}`);
				if (uniqueVoicePaths.length > 0 || uniqueVoiceUrls.length > 0) dynLines.push(`- Voice: ${[...uniqueVoicePaths, ...uniqueVoiceUrls].join(", ")}`);
				if (uniqueVoiceAsrReferTexts.length > 0) dynLines.push(`- ASR: ${uniqueVoiceAsrReferTexts.join(" | ")}`);
				const dynamicCtx = dynLines.length > 0 ? dynLines.join("\n") + "\n" : "";
				const userMessage = `${quotePart}${userContent}`;
				const agentBody = userContent.startsWith("/") ? userContent : `${systemPrompts.join("\n")}\n\n${dynamicCtx}${userMessage}`;
				log?.info(`[qqbot:${account.accountId}] agentBody length: ${agentBody.length}`);
				const fromAddress = event.type === "guild" ? `qqbot:channel:${event.channelId}` : event.type === "group" ? `qqbot:group:${event.groupOpenid}` : `qqbot:c2c:${event.senderId}`;
				const toAddress = fromAddress;
				const normalizedAllowFrom = formatQQBotAllowFrom({ allowFrom: account.config?.allowFrom ?? [] });
				const normalizedSenderId = event.senderId.replace(/^qqbot:/i, "").toUpperCase();
				const commandAuthorized = normalizedAllowFrom.length === 0 || normalizedAllowFrom.some((e) => e === "*") || normalizedAllowFrom.includes(normalizedSenderId);
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
				const ctxPayload = pluginRuntime.channel.reply.finalizeInboundContext({
					Body: body,
					BodyForAgent: agentBody,
					RawBody: event.content,
					CommandBody: event.content,
					From: fromAddress,
					To: toAddress,
					SessionKey: route.sessionKey,
					AccountId: route.accountId,
					ChatType: isGroupChat ? "group" : "direct",
					SenderId: event.senderId,
					SenderName: event.senderName,
					Provider: "qqbot",
					Surface: "qqbot",
					MessageSid: event.messageId,
					Timestamp: new Date(event.timestamp).getTime(),
					OriginatingChannel: "qqbot",
					OriginatingTo: toAddress,
					QQChannelId: event.channelId,
					QQGuildId: event.guildId,
					QQGroupOpenid: event.groupOpenid,
					QQVoiceAsrReferAvailable: hasAsrReferFallback,
					QQVoiceTranscriptSources: voiceTranscriptSources,
					QQVoiceAttachmentPaths: uniqueVoicePaths,
					QQVoiceAttachmentUrls: uniqueVoiceUrls,
					QQVoiceAsrReferTexts: uniqueVoiceAsrReferTexts,
					QQVoiceInputStrategy: "prefer_audio_stt_then_asr_fallback",
					CommandAuthorized: commandAuthorized,
					...localMediaPaths.length > 0 ? {
						MediaPaths: localMediaPaths,
						MediaPath: localMediaPaths[0],
						MediaTypes: localMediaTypes,
						MediaType: localMediaTypes[0]
					} : {},
					...remoteMediaUrls.length > 0 ? {
						MediaUrls: remoteMediaUrls,
						MediaUrl: remoteMediaUrls[0]
					} : {},
					...replyToId ? {
						ReplyToId: replyToId,
						ReplyToBody: replyToBody,
						ReplyToSender: replyToSender,
						ReplyToIsQuote: replyToIsQuote
					} : {}
				});
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
				try {
					const messagesConfig = pluginRuntime.channel.reply.resolveEffectiveMessagesConfig(cfg, route.agentId);
					let hasResponse = false;
					let hasBlockResponse = false;
					let toolDeliverCount = 0;
					const toolTexts = [];
					const toolMediaUrls = [];
					let toolFallbackSent = false;
					const responseTimeout = 12e4;
					const toolOnlyTimeout = 6e4;
					const maxToolRenewals = 3;
					let toolRenewalCount = 0;
					let timeoutId = null;
					let toolOnlyTimeoutId = null;
					const sendToolFallback = async () => {
						if (toolMediaUrls.length > 0) {
							log?.info(`[qqbot:${account.accountId}] Tool fallback: forwarding ${toolMediaUrls.length} media URL(s) from tool deliver(s)`);
							const mediaTimeout = 45e3;
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
										if (ac.signal.aborted) {
											log?.info(`[qqbot:${account.accountId}] Tool fallback sendMedia completed after timeout, suppressing late delivery`);
											return {
												channel: "qqbot",
												error: "Media send completed after timeout (suppressed)"
											};
										}
										return r;
									}), new Promise((resolve) => setTimeout(() => {
										ac.abort();
										resolve({
											channel: "qqbot",
											error: `Tool fallback media send timeout (${mediaTimeout / 1e3}s)`
										});
									}, mediaTimeout))]);
									if (result.error) log?.error(`[qqbot:${account.accountId}] Tool fallback sendMedia error: ${result.error}`);
								} catch (err) {
									log?.error(`[qqbot:${account.accountId}] Tool fallback sendMedia failed: ${err instanceof Error ? err.message : JSON.stringify(err)}`);
								}
							}
							return;
						}
						if (toolTexts.length > 0) {
							const text = toolTexts.slice(-3).join("\n---\n").slice(0, 2e3);
							log?.info(`[qqbot:${account.accountId}] Tool fallback: forwarding tool text (${text.length} chars)`);
							await sendErrorMessage(text);
							return;
						}
						log?.info(`[qqbot:${account.accountId}] Tool fallback: no media or text collected from ${toolDeliverCount} tool deliver(s), silently dropping`);
					};
					const timeoutPromise = new Promise((_, reject) => {
						timeoutId = setTimeout(() => {
							if (!hasResponse) reject(/* @__PURE__ */ new Error("Response timeout"));
						}, responseTimeout);
					});
					const dispatchPromise = pluginRuntime.channel.reply.dispatchReplyWithBufferedBlockDispatcher({
						ctx: ctxPayload,
						cfg,
						dispatcherOptions: {
							responsePrefix: messagesConfig.responsePrefix,
							deliver: async (payload, info) => {
								hasResponse = true;
								log?.info(`[qqbot:${account.accountId}] deliver called, kind: ${info.kind}, payload keys: ${Object.keys(payload).join(", ")}`);
								if (info.kind === "tool") {
									toolDeliverCount++;
									const toolText = (payload.text ?? "").trim();
									if (toolText) toolTexts.push(toolText);
									if (payload.mediaUrls?.length) toolMediaUrls.push(...payload.mediaUrls);
									if (payload.mediaUrl && !toolMediaUrls.includes(payload.mediaUrl)) toolMediaUrls.push(payload.mediaUrl);
									log?.info(`[qqbot:${account.accountId}] Collected tool deliver #${toolDeliverCount}: text=${toolText.length} chars, media=${toolMediaUrls.length} URLs`);
									if (hasBlockResponse && toolMediaUrls.length > 0) {
										log?.info(`[qqbot:${account.accountId}] Block already sent, immediately forwarding ${toolMediaUrls.length} tool media URL(s)`);
										const urlsToSend = [...toolMediaUrls];
										toolMediaUrls.length = 0;
										for (const mediaUrl of urlsToSend) try {
											const result = await sendMedia({
												to: qualifiedTarget,
												text: "",
												mediaUrl,
												accountId: account.accountId,
												replyToId: event.messageId,
												account
											});
											if (result.error) log?.error(`[qqbot:${account.accountId}] Tool media immediate forward error: ${result.error}`);
											else log?.info(`[qqbot:${account.accountId}] Forwarded tool media (post-block): ${mediaUrl.slice(0, 80)}...`);
										} catch (err) {
											log?.error(`[qqbot:${account.accountId}] Tool media immediate forward failed: ${err instanceof Error ? err.message : JSON.stringify(err)}`);
										}
										return;
									}
									if (toolFallbackSent) return;
									if (toolOnlyTimeoutId) if (toolRenewalCount < maxToolRenewals) {
										clearTimeout(toolOnlyTimeoutId);
										toolRenewalCount++;
										log?.info(`[qqbot:${account.accountId}] Tool-only timer renewed (${toolRenewalCount}/${maxToolRenewals})`);
									} else {
										log?.info(`[qqbot:${account.accountId}] Tool-only timer renewal limit reached (${maxToolRenewals}), waiting for timeout`);
										return;
									}
									toolOnlyTimeoutId = setTimeout(async () => {
										if (!hasBlockResponse && !toolFallbackSent) {
											toolFallbackSent = true;
											log?.error(`[qqbot:${account.accountId}] Tool-only timeout: ${toolDeliverCount} tool deliver(s) but no block within ${toolOnlyTimeout / 1e3}s, sending fallback`);
											try {
												await sendToolFallback();
											} catch (sendErr) {
												log?.error(`[qqbot:${account.accountId}] Failed to send tool-only fallback: ${sendErr instanceof Error ? sendErr.message : JSON.stringify(sendErr)}`);
											}
										}
									}, toolOnlyTimeout);
									return;
								}
								hasBlockResponse = true;
								typing.keepAlive?.stop();
								if (timeoutId) {
									clearTimeout(timeoutId);
									timeoutId = null;
								}
								if (toolOnlyTimeoutId) {
									clearTimeout(toolOnlyTimeoutId);
									toolOnlyTimeoutId = null;
								}
								if (toolDeliverCount > 0) log?.info(`[qqbot:${account.accountId}] Block deliver after ${toolDeliverCount} tool deliver(s)`);
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
								const mediaResult = await parseAndSendMediaTags(replyText, deliverEvent, deliverActx, sendWithRetry, consumeQuoteRef);
								if (mediaResult.handled) {
									pluginRuntime.channel.activity.record({
										channel: "qqbot",
										accountId: account.accountId,
										direction: "outbound"
									});
									return;
								}
								replyText = mediaResult.normalizedText;
								const recordOutboundActivity = () => pluginRuntime.channel.activity.record({
									channel: "qqbot",
									accountId: account.accountId,
									direction: "outbound"
								});
								if (await handleStructuredPayload(replyCtx, replyText, recordOutboundActivity)) return;
								await sendPlainReply(payload, replyText, deliverEvent, deliverActx, sendWithRetry, consumeQuoteRef, toolMediaUrls);
								pluginRuntime.channel.activity.record({
									channel: "qqbot",
									accountId: account.accountId,
									direction: "outbound"
								});
							},
							onError: async (err) => {
								const errMsg = err instanceof Error ? err.message : typeof err === "string" ? err : JSON.stringify(err);
								log?.error(`[qqbot:${account.accountId}] Dispatch error: ${errMsg}`);
								hasResponse = true;
								if (timeoutId) {
									clearTimeout(timeoutId);
									timeoutId = null;
								}
								if (errMsg.includes("401") || errMsg.includes("key") || errMsg.includes("auth")) log?.error(`[qqbot:${account.accountId}] AI auth error: ${errMsg}`);
								else log?.error(`[qqbot:${account.accountId}] AI process error: ${errMsg}`);
							}
						},
						replyOptions: { disableBlockStreaming: account.config.streaming?.mode === "off" }
					});
					try {
						await Promise.race([dispatchPromise, timeoutPromise]);
					} catch {
						if (timeoutId) clearTimeout(timeoutId);
						if (!hasResponse) log?.error(`[qqbot:${account.accountId}] No response within timeout`);
					} finally {
						if (toolOnlyTimeoutId) {
							clearTimeout(toolOnlyTimeoutId);
							toolOnlyTimeoutId = null;
						}
						if (toolDeliverCount > 0 && !hasBlockResponse && !toolFallbackSent) {
							toolFallbackSent = true;
							log?.error(`[qqbot:${account.accountId}] Dispatch completed with ${toolDeliverCount} tool deliver(s) but no block deliver, sending fallback`);
							await sendToolFallback();
						}
					}
				} catch (err) {
					const errMsg = err instanceof Error ? err.message : typeof err === "string" ? err : JSON.stringify(err);
					log?.error(`[qqbot:${account.accountId}] Message processing failed: ${errMsg}`);
				} finally {
					typing.keepAlive?.stop();
				}
			};
			ws.on("open", () => {
				log?.info(`[qqbot:${account.accountId}] WebSocket connected`);
				isConnecting = false;
				reconnectAttempts = 0;
				lastConnectTime = Date.now();
				msgQueue.startProcessor(handleMessage);
				startBackgroundTokenRefresh(account.appId, account.clientSecret, { log });
			});
			ws.on("message", async (data) => {
				try {
					const rawData = decodeGatewayMessageData(data);
					const { op, d, s, t } = JSON.parse(rawData);
					if (s) {
						lastSeq = s;
						if (sessionId) saveSession({
							sessionId,
							lastSeq,
							lastConnectedAt: lastConnectTime,
							intentLevelIndex: 0,
							accountId: account.accountId,
							savedAt: Date.now(),
							appId: account.appId
						});
					}
					log?.debug?.(`[qqbot:${account.accountId}] Received op=${op} t=${t}`);
					switch (op) {
						case 10:
							log?.info(`[qqbot:${account.accountId}] Hello received`);
							if (sessionId && lastSeq !== null) {
								log?.info(`[qqbot:${account.accountId}] Attempting to resume session ${sessionId}`);
								ws.send(JSON.stringify({
									op: 6,
									d: {
										token: `QQBot ${accessToken}`,
										session_id: sessionId,
										seq: lastSeq
									}
								}));
							} else {
								log?.info(`[qqbot:${account.accountId}] Sending identify with intents: ${FULL_INTENTS} (${FULL_INTENTS_DESC})`);
								ws.send(JSON.stringify({
									op: 2,
									d: {
										token: `QQBot ${accessToken}`,
										intents: FULL_INTENTS,
										shard: [0, 1]
									}
								}));
							}
							const interval = d.heartbeat_interval;
							if (heartbeatInterval) clearInterval(heartbeatInterval);
							heartbeatInterval = setInterval(() => {
								if (ws.readyState === WebSocket.OPEN) {
									ws.send(JSON.stringify({
										op: 1,
										d: lastSeq
									}));
									log?.debug?.(`[qqbot:${account.accountId}] Heartbeat sent`);
								}
							}, interval);
							break;
						case 0:
							log?.info(`[qqbot:${account.accountId}] 📩 Dispatch event: t=${t}, d=${JSON.stringify(d)}`);
							if (t === "READY") {
								sessionId = d.session_id;
								log?.info(`[qqbot:${account.accountId}] Ready with ${FULL_INTENTS_DESC}, session: ${sessionId}`);
								saveSession({
									sessionId,
									lastSeq,
									lastConnectedAt: Date.now(),
									intentLevelIndex: 0,
									accountId: account.accountId,
									savedAt: Date.now(),
									appId: account.appId
								});
								onReady?.(d);
							} else if (t === "RESUMED") {
								log?.info(`[qqbot:${account.accountId}] Session resumed`);
								onReady?.(d);
								if (sessionId) saveSession({
									sessionId,
									lastSeq,
									lastConnectedAt: Date.now(),
									intentLevelIndex: 0,
									accountId: account.accountId,
									savedAt: Date.now(),
									appId: account.appId
								});
							} else if (t === "C2C_MESSAGE_CREATE") {
								const event = d;
								recordKnownUser({
									openid: event.author.user_openid,
									type: "c2c",
									accountId: account.accountId
								});
								const c2cRefs = parseRefIndices(event.message_scene?.ext);
								trySlashCommandOrEnqueue({
									type: "c2c",
									senderId: event.author.user_openid,
									content: event.content,
									messageId: event.id,
									timestamp: event.timestamp,
									attachments: event.attachments,
									refMsgIdx: c2cRefs.refMsgIdx,
									msgIdx: c2cRefs.msgIdx
								});
							} else if (t === "AT_MESSAGE_CREATE") {
								const event = d;
								const guildRefs = parseRefIndices(readOptionalMessageSceneExt(event));
								trySlashCommandOrEnqueue({
									type: "guild",
									senderId: event.author.id,
									senderName: event.author.username,
									content: event.content,
									messageId: event.id,
									timestamp: event.timestamp,
									channelId: event.channel_id,
									guildId: event.guild_id,
									attachments: event.attachments,
									refMsgIdx: guildRefs.refMsgIdx,
									msgIdx: guildRefs.msgIdx
								});
							} else if (t === "DIRECT_MESSAGE_CREATE") {
								const event = d;
								const dmRefs = parseRefIndices(readOptionalMessageSceneExt(event));
								trySlashCommandOrEnqueue({
									type: "dm",
									senderId: event.author.id,
									senderName: event.author.username,
									content: event.content,
									messageId: event.id,
									timestamp: event.timestamp,
									guildId: event.guild_id,
									attachments: event.attachments,
									refMsgIdx: dmRefs.refMsgIdx,
									msgIdx: dmRefs.msgIdx
								});
							} else if (t === "GROUP_AT_MESSAGE_CREATE") {
								const event = d;
								recordKnownUser({
									openid: event.author.member_openid,
									type: "group",
									groupOpenid: event.group_openid,
									accountId: account.accountId
								});
								const groupRefs = parseRefIndices(event.message_scene?.ext);
								trySlashCommandOrEnqueue({
									type: "group",
									senderId: event.author.member_openid,
									content: event.content,
									messageId: event.id,
									timestamp: event.timestamp,
									groupOpenid: event.group_openid,
									attachments: event.attachments,
									refMsgIdx: groupRefs.refMsgIdx,
									msgIdx: groupRefs.msgIdx
								});
							}
							break;
						case 11:
							log?.debug?.(`[qqbot:${account.accountId}] Heartbeat ACK`);
							break;
						case 7:
							log?.info(`[qqbot:${account.accountId}] Server requested reconnect`);
							cleanup();
							scheduleReconnect();
							break;
						case 9:
							const canResume = d;
							log?.error(`[qqbot:${account.accountId}] Invalid session (${FULL_INTENTS_DESC}), can resume: ${canResume}, raw: ${rawData}`);
							if (!canResume) {
								sessionId = null;
								lastSeq = null;
								clearSession(account.accountId);
								shouldRefreshToken = true;
								log?.info(`[qqbot:${account.accountId}] Will refresh token and retry with full intents (${FULL_INTENTS_DESC})`);
							}
							cleanup();
							scheduleReconnect(3e3);
							break;
					}
				} catch (err) {
					log?.error(`[qqbot:${account.accountId}] Message parse error: ${err instanceof Error ? err.message : JSON.stringify(err)}`);
				}
			});
			ws.on("close", (code, reason) => {
				log?.info(`[qqbot:${account.accountId}] WebSocket closed: ${code} ${reason.toString()}`);
				isConnecting = false;
				if (code === 4914 || code === 4915) {
					log?.error(`[qqbot:${account.accountId}] Bot is ${code === 4914 ? "offline/sandbox-only" : "banned"}. Please contact QQ platform.`);
					cleanup();
					return;
				}
				if (code === 4004) {
					log?.info(`[qqbot:${account.accountId}] Invalid token (4004), will refresh token and reconnect`);
					shouldRefreshToken = true;
					cleanup();
					if (!isAborted) scheduleReconnect();
					return;
				}
				if (code === 4008) {
					log?.info(`[qqbot:${account.accountId}] Rate limited (4008), waiting ${RATE_LIMIT_DELAY}ms before reconnect`);
					cleanup();
					if (!isAborted) scheduleReconnect(RATE_LIMIT_DELAY);
					return;
				}
				if (code === 4006 || code === 4007 || code === 4009) {
					log?.info(`[qqbot:${account.accountId}] Error ${code} (${{
						4006: "session no longer valid",
						4007: "invalid seq on resume",
						4009: "session timed out"
					}[code]}), will re-identify`);
					sessionId = null;
					lastSeq = null;
					clearSession(account.accountId);
					shouldRefreshToken = true;
				} else if (code >= 4900 && code <= 4913) {
					log?.info(`[qqbot:${account.accountId}] Internal error (${code}), will re-identify`);
					sessionId = null;
					lastSeq = null;
					clearSession(account.accountId);
					shouldRefreshToken = true;
				}
				const connectionDuration = Date.now() - lastConnectTime;
				if (connectionDuration < QUICK_DISCONNECT_THRESHOLD && lastConnectTime > 0) {
					quickDisconnectCount++;
					log?.info(`[qqbot:${account.accountId}] Quick disconnect detected (${connectionDuration}ms), count: ${quickDisconnectCount}`);
					if (quickDisconnectCount >= MAX_QUICK_DISCONNECT_COUNT) {
						log?.error(`[qqbot:${account.accountId}] Too many quick disconnects. This may indicate a permission issue.`);
						log?.error(`[qqbot:${account.accountId}] Please check: 1) AppID/Secret correct 2) Bot permissions on QQ Open Platform`);
						quickDisconnectCount = 0;
						cleanup();
						if (!isAborted && code !== 1e3) scheduleReconnect(RATE_LIMIT_DELAY);
						return;
					}
				} else quickDisconnectCount = 0;
				cleanup();
				if (!isAborted && code !== 1e3) scheduleReconnect();
			});
			ws.on("error", (err) => {
				log?.error(`[qqbot:${account.accountId}] WebSocket error: ${err.message}`);
				onError?.(err);
			});
		} catch (err) {
			isConnecting = false;
			const errMsg = err instanceof Error ? err.message : JSON.stringify(err) ?? "Unknown error";
			log?.error(`[qqbot:${account.accountId}] Connection failed: ${errMsg}`);
			if (errMsg.includes("Too many requests") || errMsg.includes("100001")) {
				log?.info(`[qqbot:${account.accountId}] Rate limited, waiting ${RATE_LIMIT_DELAY}ms before retry`);
				scheduleReconnect(RATE_LIMIT_DELAY);
			} else scheduleReconnect();
		}
	};
	await connect();
	return new Promise((resolve) => {
		abortSignal.addEventListener("abort", () => resolve());
	});
}
//#endregion
export { startGateway };
