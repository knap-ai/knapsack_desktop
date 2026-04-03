import { n as resolvePreferredOpenClawTmpDir } from "./tmp-openclaw-dir-Day5KPIY.js";
import { c as loadConfig } from "./io-DhtVmzAJ.js";
import { n as extensionForMime, p as maxBytesForKind } from "./mime-C9472kP8.js";
import { s as resolveChunkMode } from "./chunk-D6CtZg6q.js";
import { n as loadWebMediaRaw } from "./web-media-4TOxrRxF.js";
import { c as parseFfprobeCodecAndSampleRate, d as runFfprobe, f as MEDIA_FFMPEG_MAX_AUDIO_DURATION_SECS, u as runFfmpeg } from "./runner-D2riOkUz.js";
import "./temp-path-CThcxCcD.js";
import { t as resolveMarkdownTableMode } from "./markdown-tables-DAbwMp5F.js";
import { c as recordChannelActivity } from "./heartbeat-visibility-CIk_o9BM.js";
import { t as convertMarkdownTables } from "./tables-Dmh1EQ3k.js";
import "./config-runtime-CmISCurQ.js";
import "./reply-runtime-DxFWfQpm.js";
import "./channel-runtime-BQArgtty.js";
import { a as unlinkIfExists } from "./media-runtime-DdCWeFPm.js";
import "./text-runtime-B0ZpmkER.js";
import "./web-media-DPyBx-37.js";
import { o as resolveDiscordAccount } from "./accounts-7Ym6HIvs.js";
import { o as Routes, r as ChannelType$1 } from "./v10-BAfWMthH.js";
import { C as stripUndefinedFields, N as resolveDiscordRest, S as sendDiscordText, T as DISCORD_MAX_STICKER_BYTES, _ as resolveChannelId, b as resolveDiscordSendEmbeds, c as buildDiscordSendError, d as formatReactionEmoji, f as normalizeDiscordPollInput, g as parseAndResolveRecipient, h as normalizeStickerIds, j as createDiscordClient, l as buildDiscordTextChunks, m as normalizeReactionEmoji, o as SUPPRESS_NOTIFICATIONS_FLAG$1, p as normalizeEmojiName, s as buildDiscordMessagePayload, u as buildReactionIdentifier, v as resolveDiscordChannelType, w as DISCORD_MAX_EMOJI_BYTES, x as sendDiscordMedia, y as resolveDiscordSendComponents } from "./send.components-sVt5Smd7.js";
import { n as rewriteDiscordKnownMentions } from "./mentions-XkTIcOKK.js";
import path from "node:path";
import fs from "node:fs/promises";
import crypto from "node:crypto";
import { RateLimitError, serializePayload } from "@buape/carbon";
//#region extensions/discord/src/send.channels.ts
async function createChannelDiscord(payload, opts = {}) {
	const rest = resolveDiscordRest(opts);
	const body = { name: payload.name };
	if (payload.type !== void 0) body.type = payload.type;
	if (payload.parentId) body.parent_id = payload.parentId;
	if (payload.topic) body.topic = payload.topic;
	if (payload.position !== void 0) body.position = payload.position;
	if (payload.nsfw !== void 0) body.nsfw = payload.nsfw;
	return await rest.post(Routes.guildChannels(payload.guildId), { body });
}
async function editChannelDiscord(payload, opts = {}) {
	const rest = resolveDiscordRest(opts);
	const body = {};
	if (payload.name !== void 0) body.name = payload.name;
	if (payload.topic !== void 0) body.topic = payload.topic;
	if (payload.position !== void 0) body.position = payload.position;
	if (payload.parentId !== void 0) body.parent_id = payload.parentId;
	if (payload.nsfw !== void 0) body.nsfw = payload.nsfw;
	if (payload.rateLimitPerUser !== void 0) body.rate_limit_per_user = payload.rateLimitPerUser;
	if (payload.archived !== void 0) body.archived = payload.archived;
	if (payload.locked !== void 0) body.locked = payload.locked;
	if (payload.autoArchiveDuration !== void 0) body.auto_archive_duration = payload.autoArchiveDuration;
	if (payload.availableTags !== void 0) body.available_tags = payload.availableTags.map((t) => ({
		...t.id !== void 0 && { id: t.id },
		name: t.name,
		...t.moderated !== void 0 && { moderated: t.moderated },
		...t.emoji_id !== void 0 && { emoji_id: t.emoji_id },
		...t.emoji_name !== void 0 && { emoji_name: t.emoji_name }
	}));
	return await rest.patch(Routes.channel(payload.channelId), { body });
}
async function deleteChannelDiscord(channelId, opts = {}) {
	await resolveDiscordRest(opts).delete(Routes.channel(channelId));
	return {
		ok: true,
		channelId
	};
}
async function moveChannelDiscord(payload, opts = {}) {
	const rest = resolveDiscordRest(opts);
	const body = [{
		id: payload.channelId,
		...payload.parentId !== void 0 && { parent_id: payload.parentId },
		...payload.position !== void 0 && { position: payload.position }
	}];
	await rest.patch(Routes.guildChannels(payload.guildId), { body });
	return { ok: true };
}
async function setChannelPermissionDiscord(payload, opts = {}) {
	const rest = resolveDiscordRest(opts);
	const body = { type: payload.targetType };
	if (payload.allow !== void 0) body.allow = payload.allow;
	if (payload.deny !== void 0) body.deny = payload.deny;
	await rest.put(`/channels/${payload.channelId}/permissions/${payload.targetId}`, { body });
	return { ok: true };
}
async function removeChannelPermissionDiscord(channelId, targetId, opts = {}) {
	await resolveDiscordRest(opts).delete(`/channels/${channelId}/permissions/${targetId}`);
	return { ok: true };
}
//#endregion
//#region extensions/discord/src/send.emojis-stickers.ts
async function listGuildEmojisDiscord(guildId, opts = {}) {
	return await resolveDiscordRest(opts).get(Routes.guildEmojis(guildId));
}
async function uploadEmojiDiscord(payload, opts = {}) {
	const rest = resolveDiscordRest(opts);
	const media = await loadWebMediaRaw(payload.mediaUrl, DISCORD_MAX_EMOJI_BYTES);
	const contentType = media.contentType?.toLowerCase();
	if (!contentType || ![
		"image/png",
		"image/jpeg",
		"image/jpg",
		"image/gif"
	].includes(contentType)) throw new Error("Discord emoji uploads require a PNG, JPG, or GIF image");
	const image = `data:${contentType};base64,${media.buffer.toString("base64")}`;
	const roleIds = (payload.roleIds ?? []).map((id) => id.trim()).filter(Boolean);
	return await rest.post(Routes.guildEmojis(payload.guildId), { body: {
		name: normalizeEmojiName(payload.name, "Emoji name"),
		image,
		roles: roleIds.length ? roleIds : void 0
	} });
}
async function uploadStickerDiscord(payload, opts = {}) {
	const rest = resolveDiscordRest(opts);
	const media = await loadWebMediaRaw(payload.mediaUrl, DISCORD_MAX_STICKER_BYTES);
	const contentType = media.contentType?.toLowerCase();
	if (!contentType || ![
		"image/png",
		"image/apng",
		"application/json"
	].includes(contentType)) throw new Error("Discord sticker uploads require a PNG, APNG, or Lottie JSON file");
	return await rest.post(Routes.guildStickers(payload.guildId), { body: {
		name: normalizeEmojiName(payload.name, "Sticker name"),
		description: normalizeEmojiName(payload.description, "Sticker description"),
		tags: normalizeEmojiName(payload.tags, "Sticker tags"),
		files: [{
			data: media.buffer,
			name: media.fileName ?? "sticker",
			contentType
		}]
	} });
}
//#endregion
//#region extensions/discord/src/send.guild.ts
async function fetchMemberInfoDiscord(guildId, userId, opts = {}) {
	return await resolveDiscordRest(opts).get(Routes.guildMember(guildId, userId));
}
async function fetchRoleInfoDiscord(guildId, opts = {}) {
	return await resolveDiscordRest(opts).get(Routes.guildRoles(guildId));
}
async function addRoleDiscord(payload, opts = {}) {
	await resolveDiscordRest(opts).put(Routes.guildMemberRole(payload.guildId, payload.userId, payload.roleId));
	return { ok: true };
}
async function removeRoleDiscord(payload, opts = {}) {
	await resolveDiscordRest(opts).delete(Routes.guildMemberRole(payload.guildId, payload.userId, payload.roleId));
	return { ok: true };
}
async function fetchChannelInfoDiscord(channelId, opts = {}) {
	return await resolveDiscordRest(opts).get(Routes.channel(channelId));
}
async function listGuildChannelsDiscord(guildId, opts = {}) {
	return await resolveDiscordRest(opts).get(Routes.guildChannels(guildId));
}
async function fetchVoiceStatusDiscord(guildId, userId, opts = {}) {
	return await resolveDiscordRest(opts).get(Routes.guildVoiceState(guildId, userId));
}
async function listScheduledEventsDiscord(guildId, opts = {}) {
	return await resolveDiscordRest(opts).get(Routes.guildScheduledEvents(guildId));
}
async function createScheduledEventDiscord(guildId, payload, opts = {}) {
	return await resolveDiscordRest(opts).post(Routes.guildScheduledEvents(guildId), { body: payload });
}
async function timeoutMemberDiscord(payload, opts = {}) {
	const rest = resolveDiscordRest(opts);
	let until = payload.until;
	if (!until && payload.durationMinutes) {
		const ms = payload.durationMinutes * 60 * 1e3;
		until = new Date(Date.now() + ms).toISOString();
	}
	return await rest.patch(Routes.guildMember(payload.guildId, payload.userId), {
		body: { communication_disabled_until: until ?? null },
		headers: payload.reason ? { "X-Audit-Log-Reason": encodeURIComponent(payload.reason) } : void 0
	});
}
async function kickMemberDiscord(payload, opts = {}) {
	await resolveDiscordRest(opts).delete(Routes.guildMember(payload.guildId, payload.userId), { headers: payload.reason ? { "X-Audit-Log-Reason": encodeURIComponent(payload.reason) } : void 0 });
	return { ok: true };
}
async function banMemberDiscord(payload, opts = {}) {
	const rest = resolveDiscordRest(opts);
	const deleteMessageDays = typeof payload.deleteMessageDays === "number" && Number.isFinite(payload.deleteMessageDays) ? Math.min(Math.max(Math.floor(payload.deleteMessageDays), 0), 7) : void 0;
	await rest.put(Routes.guildBan(payload.guildId, payload.userId), {
		body: deleteMessageDays !== void 0 ? { delete_message_days: deleteMessageDays } : void 0,
		headers: payload.reason ? { "X-Audit-Log-Reason": encodeURIComponent(payload.reason) } : void 0
	});
	return { ok: true };
}
//#endregion
//#region extensions/discord/src/send.messages.ts
async function readMessagesDiscord(channelId, query = {}, opts = {}) {
	const rest = resolveDiscordRest(opts);
	const limit = typeof query.limit === "number" && Number.isFinite(query.limit) ? Math.min(Math.max(Math.floor(query.limit), 1), 100) : void 0;
	const params = {};
	if (limit) params.limit = limit;
	if (query.before) params.before = query.before;
	if (query.after) params.after = query.after;
	if (query.around) params.around = query.around;
	return await rest.get(Routes.channelMessages(channelId), params);
}
async function fetchMessageDiscord(channelId, messageId, opts = {}) {
	return await resolveDiscordRest(opts).get(Routes.channelMessage(channelId, messageId));
}
async function editMessageDiscord(channelId, messageId, payload, opts = {}) {
	return await resolveDiscordRest(opts).patch(Routes.channelMessage(channelId, messageId), { body: { content: payload.content } });
}
async function deleteMessageDiscord(channelId, messageId, opts = {}) {
	await resolveDiscordRest(opts).delete(Routes.channelMessage(channelId, messageId));
	return { ok: true };
}
async function pinMessageDiscord(channelId, messageId, opts = {}) {
	await resolveDiscordRest(opts).put(Routes.channelPin(channelId, messageId));
	return { ok: true };
}
async function unpinMessageDiscord(channelId, messageId, opts = {}) {
	await resolveDiscordRest(opts).delete(Routes.channelPin(channelId, messageId));
	return { ok: true };
}
async function listPinsDiscord(channelId, opts = {}) {
	return await resolveDiscordRest(opts).get(Routes.channelPins(channelId));
}
async function createThreadDiscord(channelId, payload, opts = {}) {
	const rest = resolveDiscordRest(opts);
	const body = { name: payload.name };
	if (payload.autoArchiveMinutes) body.auto_archive_duration = payload.autoArchiveMinutes;
	if (!payload.messageId && payload.type !== void 0) body.type = payload.type;
	let channelType;
	if (!payload.messageId) try {
		channelType = (await rest.get(Routes.channel(channelId)))?.type;
	} catch {
		channelType = void 0;
	}
	const isForumLike = channelType === ChannelType$1.GuildForum || channelType === ChannelType$1.GuildMedia;
	if (isForumLike) {
		body.message = { content: payload.content?.trim() ? payload.content : payload.name };
		if (payload.appliedTags?.length) body.applied_tags = payload.appliedTags;
	}
	if (!payload.messageId && !isForumLike && body.type === void 0) body.type = ChannelType$1.PublicThread;
	const route = payload.messageId ? Routes.threads(channelId, payload.messageId) : Routes.threads(channelId);
	const thread = await rest.post(route, { body });
	if (!isForumLike && payload.content?.trim()) await rest.post(Routes.channelMessages(thread.id), { body: { content: payload.content } });
	return thread;
}
async function listThreadsDiscord(payload, opts = {}) {
	const rest = resolveDiscordRest(opts);
	if (payload.includeArchived) {
		if (!payload.channelId) throw new Error("channelId required to list archived threads");
		const params = {};
		if (payload.before) params.before = payload.before;
		if (payload.limit) params.limit = payload.limit;
		return await rest.get(Routes.channelThreads(payload.channelId, "public"), params);
	}
	return await rest.get(Routes.guildActiveThreads(payload.guildId));
}
async function searchMessagesDiscord(query, opts = {}) {
	const rest = resolveDiscordRest(opts);
	const params = new URLSearchParams();
	params.set("content", query.content);
	if (query.channelIds?.length) for (const channelId of query.channelIds) params.append("channel_id", channelId);
	if (query.authorIds?.length) for (const authorId of query.authorIds) params.append("author_id", authorId);
	if (query.limit) {
		const limit = Math.min(Math.max(Math.floor(query.limit), 1), 25);
		params.set("limit", String(limit));
	}
	return await rest.get(`/guilds/${query.guildId}/messages/search?${params.toString()}`);
}
//#endregion
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
		const duration = parseFloat(stdout.trim());
		if (isNaN(duration)) throw new Error("Could not parse duration");
		return Math.round(duration * 100) / 100;
	} catch (err) {
		const errMessage = err instanceof Error ? err.message : String(err);
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
	if (path.extname(filePath).toLowerCase() === ".ogg") try {
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
async function sendDiscordThreadTextChunks(params) {
	for (const chunk of params.chunks) await sendDiscordText(params.rest, params.threadId, chunk, void 0, params.request, params.maxLinesPerMessage, void 0, void 0, params.chunkMode, params.silent);
}
/** Discord thread names are capped at 100 characters. */
const DISCORD_THREAD_NAME_LIMIT = 100;
/** Derive a thread title from the first non-empty line of the message text. */
function deriveForumThreadName(text) {
	return (text.split("\n").find((l) => l.trim())?.trim() ?? "").slice(0, DISCORD_THREAD_NAME_LIMIT) || (/* @__PURE__ */ new Date()).toISOString().slice(0, 16);
}
/** Forum/Media channels cannot receive regular messages; detect them here. */
function isForumLikeType(channelType) {
	return channelType === ChannelType$1.GuildForum || channelType === ChannelType$1.GuildMedia;
}
function toDiscordSendResult(result, fallbackChannelId) {
	return {
		messageId: result.id ? String(result.id) : "unknown",
		channelId: String(result.channel_id ?? fallbackChannelId)
	};
}
async function resolveDiscordSendTarget(to, opts) {
	const cfg = opts.cfg ?? loadConfig();
	const { rest, request } = createDiscordClient(opts, cfg);
	const { channelId } = await resolveChannelId(rest, await parseAndResolveRecipient(to, opts.accountId, cfg), request);
	return {
		rest,
		request,
		channelId
	};
}
async function sendMessageDiscord(to, text, opts = {}) {
	const cfg = opts.cfg ?? loadConfig();
	const accountInfo = resolveDiscordAccount({
		cfg,
		accountId: opts.accountId
	});
	const tableMode = resolveMarkdownTableMode({
		cfg,
		channel: "discord",
		accountId: accountInfo.accountId
	});
	const chunkMode = resolveChunkMode(cfg, "discord", accountInfo.accountId);
	const mediaMaxBytes = typeof accountInfo.config.mediaMaxMb === "number" ? accountInfo.config.mediaMaxMb * 1024 * 1024 : 8 * 1024 * 1024;
	const textWithTables = convertMarkdownTables(text ?? "", tableMode);
	const textWithMentions = rewriteDiscordKnownMentions(textWithTables, { accountId: accountInfo.accountId });
	const { token, rest, request } = createDiscordClient(opts, cfg);
	const { channelId } = await resolveChannelId(rest, await parseAndResolveRecipient(to, opts.accountId, cfg), request);
	if (isForumLikeType(await resolveDiscordChannelType(rest, channelId))) {
		const threadName = deriveForumThreadName(textWithTables);
		const chunks = buildDiscordTextChunks(textWithMentions, {
			maxLinesPerMessage: accountInfo.config.maxLinesPerMessage,
			chunkMode
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
				await sendDiscordMedia(rest, threadId, mediaCaption ?? "", opts.mediaUrl, opts.filename, opts.mediaLocalRoots, opts.mediaReadFile, mediaMaxBytes, void 0, request, accountInfo.config.maxLinesPerMessage, void 0, void 0, chunkMode, opts.silent);
				await sendDiscordThreadTextChunks({
					rest,
					threadId,
					chunks: afterMediaChunks,
					request,
					maxLinesPerMessage: accountInfo.config.maxLinesPerMessage,
					chunkMode,
					silent: opts.silent
				});
			} else await sendDiscordThreadTextChunks({
				rest,
				threadId,
				chunks: remainingChunks,
				request,
				maxLinesPerMessage: accountInfo.config.maxLinesPerMessage,
				chunkMode,
				silent: opts.silent
			});
		} catch (err) {
			throw await buildDiscordSendError(err, {
				channelId: threadId,
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
		if (opts.mediaUrl) result = await sendDiscordMedia(rest, channelId, textWithMentions, opts.mediaUrl, opts.filename, opts.mediaLocalRoots, opts.mediaReadFile, mediaMaxBytes, opts.replyTo, request, accountInfo.config.maxLinesPerMessage, opts.components, opts.embeds, chunkMode, opts.silent);
		else result = await sendDiscordText(rest, channelId, textWithMentions, opts.replyTo, request, accountInfo.config.maxLinesPerMessage, opts.components, opts.embeds, chunkMode, opts.silent);
	} catch (err) {
		throw await buildDiscordSendError(err, {
			channelId,
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
	const webhookId = opts.webhookId.trim();
	const webhookToken = opts.webhookToken.trim();
	if (!webhookId || !webhookToken) throw new Error("Discord webhook id/token are required");
	const rewrittenText = rewriteDiscordKnownMentions(text, { accountId: opts.accountId });
	const replyTo = typeof opts.replyTo === "string" ? opts.replyTo.trim() : "";
	const messageReference = replyTo ? {
		message_id: replyTo,
		fail_if_not_exists: false
	} : void 0;
	const response = await fetch(resolveWebhookExecutionUrl({
		webhookId,
		webhookToken,
		threadId: opts.threadId,
		wait: opts.wait
	}), {
		method: "POST",
		headers: { "content-type": "application/json" },
		body: JSON.stringify({
			content: rewrittenText,
			username: opts.username?.trim() || void 0,
			avatar_url: opts.avatarUrl?.trim() || void 0,
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
			accountId: resolveDiscordAccount({
				cfg: opts.cfg ?? loadConfig(),
				accountId: opts.accountId
			}).accountId,
			direction: "outbound"
		});
	} catch {}
	return {
		messageId: payload.id ? String(payload.id) : "unknown",
		channelId: payload.channel_id ? String(payload.channel_id) : opts.threadId ? String(opts.threadId) : ""
	};
}
async function sendStickerDiscord(to, stickerIds, opts = {}) {
	const { rest, request, channelId } = await resolveDiscordSendTarget(to, opts);
	const content = opts.content?.trim();
	const rewrittenContent = content ? rewriteDiscordKnownMentions(content, { accountId: opts.accountId }) : void 0;
	const stickers = normalizeStickerIds(stickerIds);
	return toDiscordSendResult(await request(() => rest.post(Routes.channelMessages(channelId), { body: {
		content: rewrittenContent || void 0,
		sticker_ids: stickers
	} }), "sticker"), channelId);
}
async function sendPollDiscord(to, poll, opts = {}) {
	const { rest, request, channelId } = await resolveDiscordSendTarget(to, opts);
	const content = opts.content?.trim();
	const rewrittenContent = content ? rewriteDiscordKnownMentions(content, { accountId: opts.accountId }) : void 0;
	if (poll.durationSeconds !== void 0) throw new Error("Discord polls do not support durationSeconds; use durationHours");
	const payload = normalizeDiscordPollInput(poll);
	const flags = opts.silent ? SUPPRESS_NOTIFICATIONS_FLAG$1 : void 0;
	return toDiscordSendResult(await request(() => rest.post(Routes.channelMessages(channelId), { body: {
		content: rewrittenContent || void 0,
		poll: payload,
		...flags ? { flags } : {}
	} }), "poll"), channelId);
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
async function sendVoiceMessageDiscord(to, audioPath, opts = {}) {
	const { filePath: localInputPath } = await materializeVoiceMessageInput(audioPath);
	let oggPath = null;
	let oggCleanup = false;
	let token;
	let rest;
	let channelId;
	try {
		const cfg = opts.cfg ?? loadConfig();
		const accountInfo = resolveDiscordAccount({
			cfg,
			accountId: opts.accountId
		});
		const client = createDiscordClient(opts, cfg);
		token = client.token;
		rest = client.rest;
		const request = client.request;
		const recipient = await parseAndResolveRecipient(to, opts.accountId, cfg);
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
//#region extensions/discord/src/send.typing.ts
async function sendTypingDiscord(channelId, opts = {}) {
	await resolveDiscordRest(opts).post(Routes.channelTyping(channelId));
	return {
		ok: true,
		channelId
	};
}
//#endregion
//#region extensions/discord/src/send.reactions.ts
async function reactMessageDiscord(channelId, messageId, emoji, opts = {}) {
	const { rest, request } = createDiscordClient(opts, opts.cfg ?? loadConfig());
	const encoded = normalizeReactionEmoji(emoji);
	await request(() => rest.put(Routes.channelMessageOwnReaction(channelId, messageId, encoded)), "react");
	return { ok: true };
}
async function removeReactionDiscord(channelId, messageId, emoji, opts = {}) {
	const { rest } = createDiscordClient(opts, opts.cfg ?? loadConfig());
	const encoded = normalizeReactionEmoji(emoji);
	await rest.delete(Routes.channelMessageOwnReaction(channelId, messageId, encoded));
	return { ok: true };
}
async function removeOwnReactionsDiscord(channelId, messageId, opts = {}) {
	const { rest } = createDiscordClient(opts, opts.cfg ?? loadConfig());
	const message = await rest.get(Routes.channelMessage(channelId, messageId));
	const identifiers = /* @__PURE__ */ new Set();
	for (const reaction of message.reactions ?? []) {
		const identifier = buildReactionIdentifier(reaction.emoji);
		if (identifier) identifiers.add(identifier);
	}
	if (identifiers.size === 0) return {
		ok: true,
		removed: []
	};
	const removed = [];
	await Promise.allSettled(Array.from(identifiers, (identifier) => {
		removed.push(identifier);
		return rest.delete(Routes.channelMessageOwnReaction(channelId, messageId, normalizeReactionEmoji(identifier)));
	}));
	return {
		ok: true,
		removed
	};
}
async function fetchReactionsDiscord(channelId, messageId, opts = {}) {
	const { rest } = createDiscordClient(opts, opts.cfg ?? loadConfig());
	const reactions = (await rest.get(Routes.channelMessage(channelId, messageId))).reactions ?? [];
	if (reactions.length === 0) return [];
	const limit = typeof opts.limit === "number" && Number.isFinite(opts.limit) ? Math.min(Math.max(Math.floor(opts.limit), 1), 100) : 100;
	const summaries = [];
	for (const reaction of reactions) {
		const identifier = buildReactionIdentifier(reaction.emoji);
		if (!identifier) continue;
		const encoded = encodeURIComponent(identifier);
		const users = await rest.get(Routes.channelMessageReaction(channelId, messageId, encoded), { limit });
		summaries.push({
			emoji: {
				id: reaction.emoji.id ?? null,
				name: reaction.emoji.name ?? null,
				raw: formatReactionEmoji(reaction.emoji)
			},
			count: reaction.count,
			users: users.map((user) => ({
				id: user.id,
				username: user.username,
				tag: user.username && user.discriminator ? `${user.username}#${user.discriminator}` : user.username
			}))
		});
	}
	return summaries;
}
//#endregion
export { listScheduledEventsDiscord as A, removeChannelPermissionDiscord as B, createScheduledEventDiscord as C, fetchVoiceStatusDiscord as D, fetchRoleInfoDiscord as E, uploadStickerDiscord as F, createChannelDiscord as I, deleteChannelDiscord as L, timeoutMemberDiscord as M, listGuildEmojisDiscord as N, kickMemberDiscord as O, uploadEmojiDiscord as P, editChannelDiscord as R, banMemberDiscord as S, fetchMemberInfoDiscord as T, setChannelPermissionDiscord as V, pinMessageDiscord as _, sendTypingDiscord as a, unpinMessageDiscord as b, sendStickerDiscord as c, createThreadDiscord as d, deleteMessageDiscord as f, listThreadsDiscord as g, listPinsDiscord as h, removeReactionDiscord as i, removeRoleDiscord as j, listGuildChannelsDiscord as k, sendVoiceMessageDiscord as l, fetchMessageDiscord as m, reactMessageDiscord as n, sendMessageDiscord as o, editMessageDiscord as p, removeOwnReactionsDiscord as r, sendPollDiscord as s, fetchReactionsDiscord as t, sendWebhookMessageDiscord as u, readMessagesDiscord as v, fetchChannelInfoDiscord as w, addRoleDiscord as x, searchMessagesDiscord as y, moveChannelDiscord as z };
