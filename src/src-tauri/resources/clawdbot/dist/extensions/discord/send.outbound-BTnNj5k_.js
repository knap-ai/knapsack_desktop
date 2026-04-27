import { o as resolveDiscordAccount } from "./accounts-zcI4mtzH.js";
import { A as createDiscordClient, N as resolveDiscordClientAccountContext, O as parseAndResolveRecipient, _ as sendDiscordText, d as resolveChannelId, f as resolveDiscordChannelType, g as sendDiscordMedia, i as buildDiscordTextChunks, m as resolveDiscordSendEmbeds, n as buildDiscordMessagePayload, p as resolveDiscordSendComponents, r as buildDiscordSendError, s as normalizeDiscordPollInput, t as SUPPRESS_NOTIFICATIONS_FLAG$1, u as normalizeStickerIds, v as stripUndefinedFields } from "./send.shared-G5HPu1EM.js";
import { n as rewriteDiscordKnownMentions } from "./mentions-siazGkME.js";
import { convertMarkdownTables, normalizeLowercaseStringOrEmpty, normalizeOptionalString } from "openclaw/plugin-sdk/text-runtime";
import { ChannelType, Routes } from "discord-api-types/v10";
import { RateLimitError, serializePayload } from "@buape/carbon";
import { requireRuntimeConfig, resolveMarkdownTableMode } from "openclaw/plugin-sdk/config-runtime";
import { MEDIA_FFMPEG_MAX_AUDIO_DURATION_SECS, extensionForMime, maxBytesForKind, parseFfprobeCodecAndSampleRate, runFfmpeg, runFfprobe, unlinkIfExists } from "openclaw/plugin-sdk/media-runtime";
import { loadWebMediaRaw } from "openclaw/plugin-sdk/web-media";
import { resolveChunkMode } from "openclaw/plugin-sdk/reply-chunking";
import { recordChannelActivity } from "openclaw/plugin-sdk/infra-runtime";
import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { resolvePreferredOpenClawTmpDir } from "openclaw/plugin-sdk/temp-path";
import { formatErrorMessage } from "openclaw/plugin-sdk/error-runtime";
//#region extensions/discord/src/voice-message.ts
/**
* Discord Voice Message Support
*
* Implements sending voice messages via Discord's API.
* Voice messages require:
* - OGG/Opus format audio
* - Waveform data (base64 encoded, up to 256 samples, 0-255 values)
* - Duration in seconds
* - Message flag 8192 (IS_VOICE_MESSAGE)
* - No other content (text, embeds, etc.)
*/
const DISCORD_VOICE_MESSAGE_FLAG = 8192;
const SUPPRESS_NOTIFICATIONS_FLAG = 4096;
const WAVEFORM_SAMPLES = 256;
const DISCORD_OPUS_SAMPLE_RATE_HZ = 48e3;
function createRateLimitError(response, body, request) {
	return new RateLimitError(response, body, request ?? new Request("https://discord.com/api/v10/channels/voice/messages", { method: "POST" }));
}
/**
* Get audio duration using ffprobe
*/
async function getAudioDuration(filePath) {
	try {
		const stdout = await runFfprobe([
			"-v",
			"error",
			"-show_entries",
			"format=duration",
			"-of",
			"csv=p=0",
			filePath
		]);
		const duration = Number.parseFloat(stdout.trim());
		if (Number.isNaN(duration)) throw new Error("Could not parse duration");
		return Math.round(duration * 100) / 100;
	} catch (err) {
		const errMessage = formatErrorMessage(err);
		throw new Error(`Failed to get audio duration: ${errMessage}`, { cause: err });
	}
}
/**
* Generate waveform data from audio file using ffmpeg
* Returns base64 encoded byte array of amplitude samples (0-255)
*/
async function generateWaveform(filePath) {
	try {
		return await generateWaveformFromPcm(filePath);
	} catch {
		return generatePlaceholderWaveform();
	}
}
/**
* Generate waveform by extracting raw PCM data and sampling amplitudes
*/
async function generateWaveformFromPcm(filePath) {
	const tempDir = resolvePreferredOpenClawTmpDir();
	const tempPcm = path.join(tempDir, `waveform-${crypto.randomUUID()}.raw`);
	try {
		await runFfmpeg([
			"-y",
			"-i",
			filePath,
			"-vn",
			"-sn",
			"-dn",
			"-t",
			String(MEDIA_FFMPEG_MAX_AUDIO_DURATION_SECS),
			"-f",
			"s16le",
			"-acodec",
			"pcm_s16le",
			"-ac",
			"1",
			"-ar",
			"8000",
			tempPcm
		]);
		const pcmData = await fs.readFile(tempPcm);
		const samples = new Int16Array(pcmData.buffer, pcmData.byteOffset, pcmData.byteLength / 2);
		const step = Math.max(1, Math.floor(samples.length / WAVEFORM_SAMPLES));
		const waveform = [];
		for (let i = 0; i < WAVEFORM_SAMPLES && i * step < samples.length; i++) {
			let sum = 0;
			let count = 0;
			for (let j = 0; j < step && i * step + j < samples.length; j++) {
				sum += Math.abs(samples[i * step + j]);
				count++;
			}
			const avg = count > 0 ? sum / count : 0;
			const normalized = Math.min(255, Math.round(avg / 32767 * 255));
			waveform.push(normalized);
		}
		while (waveform.length < WAVEFORM_SAMPLES) waveform.push(0);
		return Buffer.from(waveform).toString("base64");
	} finally {
		await unlinkIfExists(tempPcm);
	}
}
/**
* Generate a placeholder waveform (for when audio processing fails)
*/
function generatePlaceholderWaveform() {
	const waveform = [];
	for (let i = 0; i < WAVEFORM_SAMPLES; i++) {
		const value = Math.round(128 + 64 * Math.sin(i / WAVEFORM_SAMPLES * Math.PI * 8));
		waveform.push(Math.min(255, Math.max(0, value)));
	}
	return Buffer.from(waveform).toString("base64");
}
/**
* Convert audio file to OGG/Opus format if needed
* Returns path to the OGG file (may be same as input if already OGG/Opus)
*/
async function ensureOggOpus(filePath) {
	const trimmed = filePath.trim();
	if (/^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed)) throw new Error(`Voice message conversion requires a local file path; received a URL/protocol source: ${trimmed}`);
	if (normalizeLowercaseStringOrEmpty(path.extname(filePath)) === ".ogg") try {
		const { codec, sampleRateHz } = parseFfprobeCodecAndSampleRate(await runFfprobe([
			"-v",
			"error",
			"-select_streams",
			"a:0",
			"-show_entries",
			"stream=codec_name,sample_rate",
			"-of",
			"csv=p=0",
			filePath
		]));
		if (codec === "opus" && sampleRateHz === DISCORD_OPUS_SAMPLE_RATE_HZ) return {
			path: filePath,
			cleanup: false
		};
	} catch {}
	const tempDir = resolvePreferredOpenClawTmpDir();
	const outputPath = path.join(tempDir, `voice-${crypto.randomUUID()}.ogg`);
	await runFfmpeg([
		"-y",
		"-i",
		filePath,
		"-vn",
		"-sn",
		"-dn",
		"-t",
		String(MEDIA_FFMPEG_MAX_AUDIO_DURATION_SECS),
		"-ar",
		String(DISCORD_OPUS_SAMPLE_RATE_HZ),
		"-c:a",
		"libopus",
		"-b:a",
		"64k",
		outputPath
	]);
	return {
		path: outputPath,
		cleanup: true
	};
}
/**
* Get voice message metadata (duration and waveform)
*/
async function getVoiceMessageMetadata(filePath) {
	const [durationSecs, waveform] = await Promise.all([getAudioDuration(filePath), generateWaveform(filePath)]);
	return {
		durationSecs,
		waveform
	};
}
/**
* Send a voice message to Discord
*
* This follows Discord's voice message protocol:
* 1. Request upload URL from Discord
* 2. Upload the OGG file to the provided URL
* 3. Send the message with flag 8192 and attachment metadata
*/
async function sendDiscordVoiceMessage(rest, channelId, audioBuffer, metadata, replyTo, request, silent, token) {
	const filename = "voice-message.ogg";
	const fileSize = audioBuffer.byteLength;
	const botToken = token;
	if (!botToken) throw new Error("Discord bot token is required for voice message upload");
	const uploadUrlResponse = await request(async () => {
		const url = `${rest.options?.baseUrl ?? "https://discord.com/api"}/channels/${channelId}/attachments`;
		const uploadUrlRequest = new Request(url, {
			method: "POST",
			headers: {
				Authorization: `Bot ${botToken}`,
				"Content-Type": "application/json"
			},
			body: JSON.stringify({ files: [{
				filename,
				file_size: fileSize,
				id: "0"
			}] })
		});
		const res = await fetch(uploadUrlRequest);
		if (!res.ok) {
			if (res.status === 429) {
				const retryData = await res.json().catch(() => ({}));
				throw createRateLimitError(res, {
					message: retryData.message ?? "You are being rate limited.",
					retry_after: retryData.retry_after ?? 1,
					global: retryData.global ?? false
				});
			}
			const errorBody = await res.json().catch(() => null);
			const err = /* @__PURE__ */ new Error(`Upload URL request failed: ${res.status} ${errorBody?.message ?? ""}`);
			if (errorBody?.code !== void 0) err.code = errorBody.code;
			throw err;
		}
		return await res.json();
	}, "voice-upload-url");
	if (!uploadUrlResponse.attachments?.[0]) throw new Error("Failed to get upload URL for voice message");
	const { upload_url, upload_filename } = uploadUrlResponse.attachments[0];
	const uploadResponse = await fetch(upload_url, {
		method: "PUT",
		headers: { "Content-Type": "audio/ogg" },
		body: new Uint8Array(audioBuffer)
	});
	if (!uploadResponse.ok) throw new Error(`Failed to upload voice message: ${uploadResponse.status}`);
	const messagePayload = {
		flags: silent ? DISCORD_VOICE_MESSAGE_FLAG | SUPPRESS_NOTIFICATIONS_FLAG : DISCORD_VOICE_MESSAGE_FLAG,
		attachments: [{
			id: "0",
			filename,
			uploaded_filename: upload_filename,
			duration_secs: metadata.durationSecs,
			waveform: metadata.waveform
		}]
	};
	if (replyTo) messagePayload.message_reference = {
		message_id: replyTo,
		fail_if_not_exists: false
	};
	return await request(() => rest.post(`/channels/${channelId}/messages`, { body: messagePayload }), "voice-message");
}
//#endregion
//#region extensions/discord/src/send.outbound.ts
const DEFAULT_DISCORD_MEDIA_MAX_MB = 100;
async function sendDiscordThreadTextChunks(params) {
	for (const chunk of params.chunks) await sendDiscordText(params.rest, params.threadId, chunk, void 0, params.request, params.maxLinesPerMessage, void 0, void 0, params.chunkMode, params.silent, params.maxChars);
}
/** Discord thread names are capped at 100 characters. */
const DISCORD_THREAD_NAME_LIMIT = 100;
/** Derive a thread title from the first non-empty line of the message text. */
function deriveForumThreadName(text) {
	return (normalizeOptionalString(text.split("\n").find((line) => normalizeOptionalString(line))) ?? "").slice(0, DISCORD_THREAD_NAME_LIMIT) || (/* @__PURE__ */ new Date()).toISOString().slice(0, 16);
}
/** Forum/Media channels cannot receive regular messages; detect them here. */
function isForumLikeType(channelType) {
	return channelType === ChannelType.GuildForum || channelType === ChannelType.GuildMedia;
}
function toDiscordSendResult(result, fallbackChannelId) {
	return {
		messageId: result.id || "unknown",
		channelId: result.channel_id ?? fallbackChannelId
	};
}
async function resolveDiscordSendTarget(to, opts) {
	const cfg = requireRuntimeConfig(opts.cfg, "Discord send target resolution");
	const { rest, request } = createDiscordClient({
		...opts,
		cfg
	});
	const { channelId } = await resolveChannelId(rest, await parseAndResolveRecipient(to, cfg, opts.accountId), request);
	return {
		rest,
		request,
		channelId
	};
}
async function sendMessageDiscord(to, text, opts) {
	const cfg = requireRuntimeConfig(opts.cfg, "Discord send");
	const accountInfo = resolveDiscordAccount({
		cfg,
		accountId: opts.accountId
	});
	const tableMode = resolveMarkdownTableMode({
		cfg,
		channel: "discord",
		accountId: accountInfo.accountId
	});
	const effectiveTableMode = opts.tableMode ?? tableMode;
	const chunkMode = opts.chunkMode ?? resolveChunkMode(cfg, "discord", accountInfo.accountId);
	const maxLinesPerMessage = opts.maxLinesPerMessage ?? accountInfo.config.maxLinesPerMessage;
	const textLimit = typeof opts.textLimit === "number" && Number.isFinite(opts.textLimit) ? Math.max(1, Math.min(Math.floor(opts.textLimit), 2e3)) : void 0;
	const mediaMaxBytes = typeof accountInfo.config.mediaMaxMb === "number" ? accountInfo.config.mediaMaxMb * 1024 * 1024 : DEFAULT_DISCORD_MEDIA_MAX_MB * 1024 * 1024;
	const textWithTables = convertMarkdownTables(text ?? "", effectiveTableMode);
	const textWithMentions = rewriteDiscordKnownMentions(textWithTables, { accountId: accountInfo.accountId });
	const { token, rest, request } = createDiscordClient({
		...opts,
		cfg
	});
	const { channelId } = await resolveChannelId(rest, await parseAndResolveRecipient(to, cfg, opts.accountId), request);
	if (isForumLikeType(await resolveDiscordChannelType(rest, channelId))) {
		const threadName = deriveForumThreadName(textWithTables);
		const chunks = buildDiscordTextChunks(textWithMentions, {
			maxLinesPerMessage,
			chunkMode,
			maxChars: textLimit
		});
		const starterContent = chunks[0]?.trim() ? chunks[0] : threadName;
		const starterPayload = buildDiscordMessagePayload({
			text: starterContent,
			components: resolveDiscordSendComponents({
				components: opts.components,
				text: starterContent,
				isFirst: true
			}),
			embeds: resolveDiscordSendEmbeds({
				embeds: opts.embeds,
				isFirst: true
			}),
			flags: opts.silent ? 4096 : void 0
		});
		let threadRes;
		try {
			threadRes = await request(() => rest.post(Routes.threads(channelId), { body: {
				name: threadName,
				message: stripUndefinedFields(serializePayload(starterPayload))
			} }), "forum-thread");
		} catch (err) {
			throw await buildDiscordSendError(err, {
				channelId,
				cfg,
				rest,
				token,
				hasMedia: Boolean(opts.mediaUrl)
			});
		}
		const threadId = threadRes.id;
		const messageId = threadRes.message?.id ?? threadId;
		const resultChannelId = threadRes.message?.channel_id ?? threadId;
		const remainingChunks = chunks.slice(1);
		try {
			if (opts.mediaUrl) {
				const [mediaCaption, ...afterMediaChunks] = remainingChunks;
				await sendDiscordMedia(rest, threadId, mediaCaption ?? "", opts.mediaUrl, opts.filename, opts.mediaLocalRoots, opts.mediaReadFile, mediaMaxBytes, void 0, request, maxLinesPerMessage, void 0, void 0, chunkMode, opts.silent, textLimit);
				await sendDiscordThreadTextChunks({
					rest,
					threadId,
					chunks: afterMediaChunks,
					request,
					maxLinesPerMessage,
					chunkMode,
					maxChars: textLimit,
					silent: opts.silent
				});
			} else await sendDiscordThreadTextChunks({
				rest,
				threadId,
				chunks: remainingChunks,
				request,
				maxLinesPerMessage,
				chunkMode,
				maxChars: textLimit,
				silent: opts.silent
			});
		} catch (err) {
			throw await buildDiscordSendError(err, {
				channelId: threadId,
				cfg,
				rest,
				token,
				hasMedia: Boolean(opts.mediaUrl)
			});
		}
		recordChannelActivity({
			channel: "discord",
			accountId: accountInfo.accountId,
			direction: "outbound"
		});
		return toDiscordSendResult({
			id: messageId,
			channel_id: resultChannelId
		}, channelId);
	}
	let result;
	try {
		if (opts.mediaUrl) result = await sendDiscordMedia(rest, channelId, textWithMentions, opts.mediaUrl, opts.filename, opts.mediaLocalRoots, opts.mediaReadFile, mediaMaxBytes, opts.replyTo, request, maxLinesPerMessage, opts.components, opts.embeds, chunkMode, opts.silent, textLimit);
		else result = await sendDiscordText(rest, channelId, textWithMentions, opts.replyTo, request, maxLinesPerMessage, opts.components, opts.embeds, chunkMode, opts.silent, textLimit);
	} catch (err) {
		throw await buildDiscordSendError(err, {
			channelId,
			cfg,
			rest,
			token,
			hasMedia: Boolean(opts.mediaUrl)
		});
	}
	recordChannelActivity({
		channel: "discord",
		accountId: accountInfo.accountId,
		direction: "outbound"
	});
	return toDiscordSendResult(result, channelId);
}
function resolveWebhookExecutionUrl(params) {
	const baseUrl = new URL(`https://discord.com/api/v10/webhooks/${encodeURIComponent(params.webhookId)}/${encodeURIComponent(params.webhookToken)}`);
	baseUrl.searchParams.set("wait", params.wait === false ? "false" : "true");
	if (params.threadId !== void 0 && params.threadId !== null && params.threadId !== "") baseUrl.searchParams.set("thread_id", String(params.threadId));
	return baseUrl.toString();
}
async function sendWebhookMessageDiscord(text, opts) {
	const webhookId = normalizeOptionalString(opts.webhookId) ?? "";
	const webhookToken = normalizeOptionalString(opts.webhookToken) ?? "";
	if (!webhookId || !webhookToken) throw new Error("Discord webhook id/token are required");
	const replyTo = normalizeOptionalString(opts.replyTo) ?? "";
	const messageReference = replyTo ? {
		message_id: replyTo,
		fail_if_not_exists: false
	} : void 0;
	const { account, proxyFetch } = resolveDiscordClientAccountContext({
		cfg: opts.cfg,
		accountId: opts.accountId
	});
	const rewrittenText = rewriteDiscordKnownMentions(text, { accountId: account.accountId });
	const response = await (proxyFetch ?? fetch)(resolveWebhookExecutionUrl({
		webhookId,
		webhookToken,
		threadId: opts.threadId,
		wait: opts.wait
	}), {
		method: "POST",
		headers: { "content-type": "application/json" },
		body: JSON.stringify({
			content: rewrittenText,
			username: normalizeOptionalString(opts.username),
			avatar_url: normalizeOptionalString(opts.avatarUrl),
			...messageReference ? { message_reference: messageReference } : {}
		})
	});
	if (!response.ok) {
		const raw = await response.text().catch(() => "");
		throw new Error(`Discord webhook send failed (${response.status}${raw ? `: ${raw.slice(0, 200)}` : ""})`);
	}
	const payload = await response.json().catch(() => ({}));
	try {
		recordChannelActivity({
			channel: "discord",
			accountId: account.accountId,
			direction: "outbound"
		});
	} catch {}
	return {
		messageId: payload.id || "unknown",
		channelId: payload.channel_id ? payload.channel_id : opts.threadId ? String(opts.threadId) : ""
	};
}
async function sendStickerDiscord(to, stickerIds, opts) {
	const { rest, request, channelId, rewrittenContent } = await resolveDiscordStructuredSendContext(to, opts);
	const stickers = normalizeStickerIds(stickerIds);
	return toDiscordSendResult(await request(() => rest.post(Routes.channelMessages(channelId), { body: {
		content: rewrittenContent || void 0,
		sticker_ids: stickers
	} }), "sticker"), channelId);
}
async function sendPollDiscord(to, poll, opts) {
	const { rest, request, channelId, rewrittenContent } = await resolveDiscordStructuredSendContext(to, opts);
	if (poll.durationSeconds !== void 0) throw new Error("Discord polls do not support durationSeconds; use durationHours");
	const payload = normalizeDiscordPollInput(poll);
	const flags = opts.silent ? SUPPRESS_NOTIFICATIONS_FLAG$1 : void 0;
	return toDiscordSendResult(await request(() => rest.post(Routes.channelMessages(channelId), { body: {
		content: rewrittenContent || void 0,
		poll: payload,
		...flags ? { flags } : {}
	} }), "poll"), channelId);
}
async function resolveDiscordStructuredSendContext(to, opts) {
	const accountInfo = resolveDiscordAccount({
		cfg: requireRuntimeConfig(opts.cfg, "Discord structured send"),
		accountId: opts.accountId
	});
	const { rest, request, channelId } = await resolveDiscordSendTarget(to, opts);
	const content = opts.content?.trim();
	return {
		rest,
		request,
		channelId,
		rewrittenContent: content ? rewriteDiscordKnownMentions(content, { accountId: accountInfo.accountId }) : void 0
	};
}
async function materializeVoiceMessageInput(mediaUrl) {
	const media = await loadWebMediaRaw(mediaUrl, maxBytesForKind("audio"));
	const extFromName = media.fileName ? path.extname(media.fileName) : "";
	const extFromMime = media.contentType ? extensionForMime(media.contentType) : "";
	const ext = extFromName || extFromMime || ".bin";
	const tempDir = resolvePreferredOpenClawTmpDir();
	const filePath = path.join(tempDir, `voice-src-${crypto.randomUUID()}${ext}`);
	await fs.writeFile(filePath, media.buffer, { mode: 384 });
	return { filePath };
}
/**
* Send a voice message to Discord.
*
* Voice messages are a special Discord feature that displays audio with a waveform
* visualization. They require OGG/Opus format and cannot include text content.
*
* @param to - Recipient (user ID for DM or channel ID)
* @param audioPath - Path to local audio file (will be converted to OGG/Opus if needed)
* @param opts - Send options
*/
async function sendVoiceMessageDiscord(to, audioPath, opts) {
	const { filePath: localInputPath } = await materializeVoiceMessageInput(audioPath);
	let oggPath = null;
	let oggCleanup = false;
	let token;
	let rest;
	let channelId;
	const cfg = requireRuntimeConfig(opts.cfg, "Discord voice send");
	try {
		const accountInfo = resolveDiscordAccount({
			cfg,
			accountId: opts.accountId
		});
		const client = createDiscordClient({
			...opts,
			cfg
		});
		token = client.token;
		rest = client.rest;
		const request = client.request;
		const recipient = await parseAndResolveRecipient(to, cfg, opts.accountId);
		channelId = (await resolveChannelId(rest, recipient, request)).channelId;
		const ogg = await ensureOggOpus(localInputPath);
		oggPath = ogg.path;
		oggCleanup = ogg.cleanup;
		const metadata = await getVoiceMessageMetadata(oggPath);
		const audioBuffer = await fs.readFile(oggPath);
		const result = await sendDiscordVoiceMessage(rest, channelId, audioBuffer, metadata, opts.replyTo, request, opts.silent, token);
		recordChannelActivity({
			channel: "discord",
			accountId: accountInfo.accountId,
			direction: "outbound"
		});
		return toDiscordSendResult(result, channelId);
	} catch (err) {
		if (channelId && rest && token) throw await buildDiscordSendError(err, {
			channelId,
			cfg,
			rest,
			token,
			hasMedia: true
		});
		throw err;
	} finally {
		await unlinkIfExists(oggCleanup ? oggPath : null);
		await unlinkIfExists(localInputPath);
	}
}
//#endregion
export { sendWebhookMessageDiscord as a, sendVoiceMessageDiscord as i, sendPollDiscord as n, sendStickerDiscord as r, sendMessageDiscord as t };
