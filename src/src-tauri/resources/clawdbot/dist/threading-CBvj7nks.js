import { T as truncateUtf16Safe } from "./utils-CE3P21nG.js";
import { r as logVerbose } from "./globals-BJZkpw-q.js";
import { x as buildMediaPayload } from "./reply-payload-SzVz53hc.js";
import { p as extractAssistantText } from "./minimax-vlm-uN3pFvTM.js";
import { l as saveMediaBuffer } from "./store-CCBPdtW9.js";
import { n as fetchRemoteMedia } from "./fetch-ClF-ZgDC.js";
import { t as buildAgentSessionKey } from "./resolve-route-DID7K3Jm.js";
import { t as resolveChannelModelOverride } from "./model-overrides-5dbuzSBv.js";
import "./routing-Br1fEo8A.js";
import "./runtime-env-CoykX19-.js";
import "./config-runtime-CmISCurQ.js";
import { r as createReplyReferencePlanner } from "./reply-runtime-DxFWfQpm.js";
import "./media-runtime-DdCWeFPm.js";
import "./text-runtime-B0ZpmkER.js";
import { r as prepareSimpleCompletionModelForAgent, t as completeWithPreparedSimpleCompletionModel } from "./agent-runtime-B7ucOTD-.js";
import { o as Routes, s as StickerFormatType } from "./v10-BAfWMthH.js";
import { o as mergeAbortSignals } from "./timeouts-Rxac5izA.js";
import { ChannelType } from "@buape/carbon";
//#region extensions/discord/src/monitor/message-utils.ts
const DISCORD_MEDIA_SSRF_POLICY = {
	hostnameAllowlist: [
		"cdn.discordapp.com",
		"media.discordapp.net",
		"*.discordapp.com",
		"*.discordapp.net"
	],
	allowRfc2544BenchmarkRange: true
};
function mergeHostnameList(...lists) {
	const merged = lists.flatMap((list) => list ?? []).map((value) => value.trim()).filter((value) => value.length > 0);
	if (merged.length === 0) return;
	return Array.from(new Set(merged));
}
function resolveDiscordMediaSsrFPolicy(policy) {
	if (!policy) return DISCORD_MEDIA_SSRF_POLICY;
	const hostnameAllowlist = mergeHostnameList(DISCORD_MEDIA_SSRF_POLICY.hostnameAllowlist, policy.hostnameAllowlist);
	const allowedHostnames = mergeHostnameList(DISCORD_MEDIA_SSRF_POLICY.allowedHostnames, policy.allowedHostnames);
	return {
		...DISCORD_MEDIA_SSRF_POLICY,
		...policy,
		...allowedHostnames ? { allowedHostnames } : {},
		...hostnameAllowlist ? { hostnameAllowlist } : {},
		allowRfc2544BenchmarkRange: Boolean(DISCORD_MEDIA_SSRF_POLICY.allowRfc2544BenchmarkRange) || Boolean(policy.allowRfc2544BenchmarkRange)
	};
}
const DISCORD_CHANNEL_INFO_CACHE_TTL_MS = 300 * 1e3;
const DISCORD_CHANNEL_INFO_NEGATIVE_CACHE_TTL_MS = 30 * 1e3;
const DISCORD_CHANNEL_INFO_CACHE = /* @__PURE__ */ new Map();
const DISCORD_STICKER_ASSET_BASE_URL = "https://media.discordapp.net/stickers";
function normalizeDiscordChannelId(value) {
	if (typeof value === "string") return value.trim();
	if (typeof value === "number" || typeof value === "bigint") return String(value).trim();
	return "";
}
function resolveDiscordMessageChannelId(params) {
	const message = params.message;
	return normalizeDiscordChannelId(message.channelId) || normalizeDiscordChannelId(message.channel_id) || normalizeDiscordChannelId(message.rawData?.channel_id) || normalizeDiscordChannelId(params.eventChannelId);
}
async function resolveDiscordChannelInfo(client, channelId) {
	const cached = DISCORD_CHANNEL_INFO_CACHE.get(channelId);
	if (cached) {
		if (cached.expiresAt > Date.now()) return cached.value;
		DISCORD_CHANNEL_INFO_CACHE.delete(channelId);
	}
	try {
		const channel = await client.fetchChannel(channelId);
		if (!channel) {
			DISCORD_CHANNEL_INFO_CACHE.set(channelId, {
				value: null,
				expiresAt: Date.now() + DISCORD_CHANNEL_INFO_NEGATIVE_CACHE_TTL_MS
			});
			return null;
		}
		const name = "name" in channel ? channel.name ?? void 0 : void 0;
		const topic = "topic" in channel ? channel.topic ?? void 0 : void 0;
		const parentId = "parentId" in channel ? channel.parentId ?? void 0 : void 0;
		const ownerId = "ownerId" in channel ? channel.ownerId ?? void 0 : void 0;
		const payload = {
			type: channel.type,
			name,
			topic,
			parentId,
			ownerId
		};
		DISCORD_CHANNEL_INFO_CACHE.set(channelId, {
			value: payload,
			expiresAt: Date.now() + DISCORD_CHANNEL_INFO_CACHE_TTL_MS
		});
		return payload;
	} catch (err) {
		logVerbose(`discord: failed to fetch channel ${channelId}: ${String(err)}`);
		DISCORD_CHANNEL_INFO_CACHE.set(channelId, {
			value: null,
			expiresAt: Date.now() + DISCORD_CHANNEL_INFO_NEGATIVE_CACHE_TTL_MS
		});
		return null;
	}
}
function normalizeStickerItems(value) {
	if (!Array.isArray(value)) return [];
	return value.filter((entry) => Boolean(entry) && typeof entry === "object" && typeof entry.id === "string" && typeof entry.name === "string");
}
function resolveDiscordMessageStickers(message) {
	const stickers = message.stickers;
	const normalized = normalizeStickerItems(stickers);
	if (normalized.length > 0) return normalized;
	const rawData = message.rawData;
	return normalizeStickerItems(rawData?.sticker_items ?? rawData?.stickers);
}
function resolveDiscordSnapshotStickers(snapshot) {
	return normalizeStickerItems(snapshot.stickers ?? snapshot.sticker_items);
}
function hasDiscordMessageStickers(message) {
	return resolveDiscordMessageStickers(message).length > 0;
}
async function resolveMediaList(message, maxBytes, options) {
	const out = [];
	const resolvedSsrFPolicy = resolveDiscordMediaSsrFPolicy(options?.ssrfPolicy);
	await appendResolvedMediaFromAttachments({
		attachments: message.attachments ?? [],
		maxBytes,
		out,
		errorPrefix: "discord: failed to download attachment",
		fetchImpl: options?.fetchImpl,
		ssrfPolicy: resolvedSsrFPolicy,
		readIdleTimeoutMs: options?.readIdleTimeoutMs,
		totalTimeoutMs: options?.totalTimeoutMs,
		abortSignal: options?.abortSignal
	});
	await appendResolvedMediaFromStickers({
		stickers: resolveDiscordMessageStickers(message),
		maxBytes,
		out,
		errorPrefix: "discord: failed to download sticker",
		fetchImpl: options?.fetchImpl,
		ssrfPolicy: resolvedSsrFPolicy,
		readIdleTimeoutMs: options?.readIdleTimeoutMs,
		totalTimeoutMs: options?.totalTimeoutMs,
		abortSignal: options?.abortSignal
	});
	return out;
}
async function resolveForwardedMediaList(message, maxBytes, options) {
	const snapshots = resolveDiscordMessageSnapshots(message);
	if (snapshots.length === 0) return [];
	const out = [];
	const resolvedSsrFPolicy = resolveDiscordMediaSsrFPolicy(options?.ssrfPolicy);
	for (const snapshot of snapshots) {
		await appendResolvedMediaFromAttachments({
			attachments: snapshot.message?.attachments,
			maxBytes,
			out,
			errorPrefix: "discord: failed to download forwarded attachment",
			fetchImpl: options?.fetchImpl,
			ssrfPolicy: resolvedSsrFPolicy,
			readIdleTimeoutMs: options?.readIdleTimeoutMs,
			totalTimeoutMs: options?.totalTimeoutMs,
			abortSignal: options?.abortSignal
		});
		await appendResolvedMediaFromStickers({
			stickers: snapshot.message ? resolveDiscordSnapshotStickers(snapshot.message) : [],
			maxBytes,
			out,
			errorPrefix: "discord: failed to download forwarded sticker",
			fetchImpl: options?.fetchImpl,
			ssrfPolicy: resolvedSsrFPolicy,
			readIdleTimeoutMs: options?.readIdleTimeoutMs,
			totalTimeoutMs: options?.totalTimeoutMs,
			abortSignal: options?.abortSignal
		});
	}
	return out;
}
async function fetchDiscordMedia(params) {
	const timeoutAbortController = params.totalTimeoutMs ? new AbortController() : void 0;
	const signal = mergeAbortSignals([params.abortSignal, timeoutAbortController?.signal]);
	let timedOut = false;
	let timeoutHandle = null;
	const fetchPromise = fetchRemoteMedia({
		url: params.url,
		filePathHint: params.filePathHint,
		maxBytes: params.maxBytes,
		fetchImpl: params.fetchImpl,
		ssrfPolicy: params.ssrfPolicy,
		readIdleTimeoutMs: params.readIdleTimeoutMs,
		...signal ? { requestInit: { signal } } : {}
	}).catch((error) => {
		if (timedOut) return new Promise(() => {});
		throw error;
	});
	try {
		if (!params.totalTimeoutMs) return await fetchPromise;
		const timeoutPromise = new Promise((_, reject) => {
			timeoutHandle = setTimeout(() => {
				timedOut = true;
				timeoutAbortController?.abort();
				reject(/* @__PURE__ */ new Error(`discord media download timed out after ${params.totalTimeoutMs}ms`));
			}, params.totalTimeoutMs);
			timeoutHandle.unref?.();
		});
		return await Promise.race([fetchPromise, timeoutPromise]);
	} finally {
		if (timeoutHandle) clearTimeout(timeoutHandle);
	}
}
async function appendResolvedMediaFromAttachments(params) {
	const attachments = params.attachments;
	if (!attachments || attachments.length === 0) return;
	for (const attachment of attachments) try {
		const fetched = await fetchDiscordMedia({
			url: attachment.url,
			filePathHint: attachment.filename ?? attachment.url,
			maxBytes: params.maxBytes,
			fetchImpl: params.fetchImpl,
			ssrfPolicy: params.ssrfPolicy,
			readIdleTimeoutMs: params.readIdleTimeoutMs,
			totalTimeoutMs: params.totalTimeoutMs,
			abortSignal: params.abortSignal
		});
		const saved = await saveMediaBuffer(fetched.buffer, fetched.contentType ?? attachment.content_type, "inbound", params.maxBytes);
		params.out.push({
			path: saved.path,
			contentType: saved.contentType,
			placeholder: inferPlaceholder(attachment)
		});
	} catch (err) {
		const id = attachment.id ?? attachment.url;
		logVerbose(`${params.errorPrefix} ${id}: ${String(err)}`);
		params.out.push({
			path: attachment.url,
			contentType: attachment.content_type,
			placeholder: inferPlaceholder(attachment)
		});
	}
}
function resolveStickerAssetCandidates(sticker) {
	const baseName = sticker.name?.trim() || `sticker-${sticker.id}`;
	switch (sticker.format_type) {
		case StickerFormatType.GIF: return [{
			url: `${DISCORD_STICKER_ASSET_BASE_URL}/${sticker.id}.gif`,
			fileName: `${baseName}.gif`
		}];
		case StickerFormatType.Lottie: return [{
			url: `${DISCORD_STICKER_ASSET_BASE_URL}/${sticker.id}.png?size=160`,
			fileName: `${baseName}.png`
		}, {
			url: `${DISCORD_STICKER_ASSET_BASE_URL}/${sticker.id}.json`,
			fileName: `${baseName}.json`
		}];
		case StickerFormatType.APNG:
		case StickerFormatType.PNG:
		default: return [{
			url: `${DISCORD_STICKER_ASSET_BASE_URL}/${sticker.id}.png`,
			fileName: `${baseName}.png`
		}];
	}
}
function formatStickerError(err) {
	if (err instanceof Error) return err.message;
	if (typeof err === "string") return err;
	try {
		return JSON.stringify(err) ?? "unknown error";
	} catch {
		return "unknown error";
	}
}
function inferStickerContentType(sticker) {
	switch (sticker.format_type) {
		case StickerFormatType.GIF: return "image/gif";
		case StickerFormatType.APNG:
		case StickerFormatType.Lottie:
		case StickerFormatType.PNG: return "image/png";
		default: return;
	}
}
async function appendResolvedMediaFromStickers(params) {
	const stickers = params.stickers;
	if (!stickers || stickers.length === 0) return;
	for (const sticker of stickers) {
		const candidates = resolveStickerAssetCandidates(sticker);
		let lastError;
		for (const candidate of candidates) try {
			const fetched = await fetchDiscordMedia({
				url: candidate.url,
				filePathHint: candidate.fileName,
				maxBytes: params.maxBytes,
				fetchImpl: params.fetchImpl,
				ssrfPolicy: params.ssrfPolicy,
				readIdleTimeoutMs: params.readIdleTimeoutMs,
				totalTimeoutMs: params.totalTimeoutMs,
				abortSignal: params.abortSignal
			});
			const saved = await saveMediaBuffer(fetched.buffer, fetched.contentType, "inbound", params.maxBytes);
			params.out.push({
				path: saved.path,
				contentType: saved.contentType,
				placeholder: "<media:sticker>"
			});
			lastError = null;
			break;
		} catch (err) {
			lastError = err;
		}
		if (lastError) {
			logVerbose(`${params.errorPrefix} ${sticker.id}: ${formatStickerError(lastError)}`);
			const fallback = candidates[0];
			if (fallback) params.out.push({
				path: fallback.url,
				contentType: inferStickerContentType(sticker),
				placeholder: "<media:sticker>"
			});
		}
	}
}
function inferPlaceholder(attachment) {
	const mime = attachment.content_type ?? "";
	if (mime.startsWith("image/")) return "<media:image>";
	if (mime.startsWith("video/")) return "<media:video>";
	if (mime.startsWith("audio/")) return "<media:audio>";
	return "<media:document>";
}
function isImageAttachment(attachment) {
	if ((attachment.content_type ?? "").startsWith("image/")) return true;
	const name = attachment.filename?.toLowerCase() ?? "";
	if (!name) return false;
	return /\.(avif|bmp|gif|heic|heif|jpe?g|png|tiff?|webp)$/.test(name);
}
function buildDiscordAttachmentPlaceholder(attachments) {
	if (!attachments || attachments.length === 0) return "";
	const count = attachments.length;
	const allImages = attachments.every(isImageAttachment);
	const label = allImages ? "image" : "file";
	const suffix = count === 1 ? label : `${label}s`;
	return `${allImages ? "<media:image>" : "<media:document>"} (${count} ${suffix})`;
}
function buildDiscordStickerPlaceholder(stickers) {
	if (!stickers || stickers.length === 0) return "";
	const count = stickers.length;
	return `<media:sticker> (${count} ${count === 1 ? "sticker" : "stickers"})`;
}
function buildDiscordMediaPlaceholder(params) {
	const attachmentText = buildDiscordAttachmentPlaceholder(params.attachments);
	const stickerText = buildDiscordStickerPlaceholder(params.stickers);
	if (attachmentText && stickerText) return `${attachmentText}\n${stickerText}`;
	return attachmentText || stickerText || "";
}
function resolveDiscordEmbedText(embed) {
	const title = embed?.title?.trim() || "";
	const description = embed?.description?.trim() || "";
	if (title && description) return `${title}\n${description}`;
	return title || description || "";
}
function resolveDiscordMessageText(message, options) {
	const embedText = resolveDiscordEmbedText(message.embeds?.[0] ?? null);
	const baseText = resolveDiscordMentions(message.content?.trim() || buildDiscordMediaPlaceholder({
		attachments: message.attachments ?? void 0,
		stickers: resolveDiscordMessageStickers(message)
	}) || embedText || options?.fallbackText?.trim() || "", message);
	if (!options?.includeForwarded) return baseText;
	const forwardedText = resolveDiscordForwardedMessagesText(message);
	if (!forwardedText) return baseText;
	if (!baseText) return forwardedText;
	return `${baseText}\n${forwardedText}`;
}
function resolveDiscordMentions(text, message) {
	if (!text.includes("<")) return text;
	const mentions = message.mentionedUsers ?? [];
	if (!Array.isArray(mentions) || mentions.length === 0) return text;
	let out = text;
	for (const user of mentions) {
		const label = user.globalName || user.username;
		out = out.replace(new RegExp(`<@!?${user.id}>`, "g"), `@${label}`);
	}
	return out;
}
function resolveDiscordForwardedMessagesText(message) {
	const snapshots = resolveDiscordMessageSnapshots(message);
	if (snapshots.length === 0) return "";
	const forwardedBlocks = snapshots.map((snapshot) => {
		const snapshotMessage = snapshot.message;
		if (!snapshotMessage) return null;
		const text = resolveDiscordSnapshotMessageText(snapshotMessage);
		if (!text) return null;
		const authorLabel = formatDiscordSnapshotAuthor(snapshotMessage.author);
		return `${authorLabel ? `[Forwarded message from ${authorLabel}]` : "[Forwarded message]"}\n${text}`;
	}).filter((entry) => Boolean(entry));
	if (forwardedBlocks.length === 0) return "";
	return forwardedBlocks.join("\n\n");
}
function resolveDiscordMessageSnapshots(message) {
	const snapshots = message.rawData?.message_snapshots ?? message.message_snapshots ?? message.messageSnapshots;
	if (!Array.isArray(snapshots)) return [];
	return snapshots.filter((entry) => Boolean(entry) && typeof entry === "object");
}
function resolveDiscordSnapshotMessageText(snapshot) {
	const content = snapshot.content?.trim() ?? "";
	const attachmentText = buildDiscordMediaPlaceholder({
		attachments: snapshot.attachments ?? void 0,
		stickers: resolveDiscordSnapshotStickers(snapshot)
	});
	const embedText = resolveDiscordEmbedText(snapshot.embeds?.[0]);
	return content || attachmentText || embedText || "";
}
function formatDiscordSnapshotAuthor(author) {
	if (!author) return;
	const globalName = author.global_name ?? void 0;
	const username = author.username ?? void 0;
	const name = author.name ?? void 0;
	const discriminator = author.discriminator ?? void 0;
	const base = globalName || username || name;
	if (username && discriminator && discriminator !== "0") return `@${username}#${discriminator}`;
	if (base) return `@${base}`;
	if (author.id) return `@${author.id}`;
}
function buildDiscordMediaPayload(mediaList) {
	return buildMediaPayload(mediaList);
}
//#endregion
//#region extensions/discord/src/monitor/thread-title.ts
const DEFAULT_THREAD_TITLE_TIMEOUT_MS = 1e4;
const MAX_THREAD_TITLE_SOURCE_CHARS = 600;
const MAX_THREAD_TITLE_CHANNEL_NAME_CHARS = 120;
const MAX_THREAD_TITLE_CHANNEL_DESCRIPTION_CHARS = 320;
const DISCORD_THREAD_TITLE_MAX_TOKENS = 24;
const DISCORD_THREAD_TITLE_TEMPERATURE = .2;
const DISCORD_THREAD_TITLE_SYSTEM_PROMPT = "Generate a concise Discord thread title (3-6 words). Return only the title. Use channel context when provided and avoid redundant channel-name words unless needed for clarity.";
async function generateThreadTitle(params) {
	const sourceText = params.messageText.trim();
	if (!sourceText) return null;
	const prepared = await prepareSimpleCompletionModelForAgent({
		cfg: params.cfg,
		agentId: params.agentId,
		...params.modelRef ? { modelRef: params.modelRef } : {},
		allowMissingApiKeyModes: ["aws-sdk"]
	});
	if ("error" in prepared) {
		const modelLabel = prepared.selection ? `${prepared.selection.provider}/${prepared.selection.modelId}` : "unknown";
		logVerbose(`thread-title: ${prepared.error} (agent=${params.agentId}, model=${modelLabel})`);
		return null;
	}
	try {
		const userMessage = buildThreadTitleUserMessage({
			sourceText: truncateThreadTitleSourceText(sourceText),
			channelName: params.channelName,
			channelDescription: params.channelDescription
		});
		const timeoutMs = resolveThreadTitleTimeoutMs(params.timeoutMs);
		return normalizeGeneratedThreadTitle(extractAssistantText(await completeThreadTitle({
			model: prepared.model,
			auth: prepared.auth,
			userMessage,
			timeoutMs
		}))) || null;
	} catch (err) {
		logVerbose(`thread-title: title generation failed for agent ${params.agentId}: ${String(err)}`);
		return null;
	}
}
async function completeThreadTitle(params) {
	const controller = new AbortController();
	const timer = setTimeout(() => controller.abort(), params.timeoutMs);
	try {
		return await completeWithPreparedSimpleCompletionModel({
			model: params.model,
			auth: params.auth,
			context: {
				systemPrompt: DISCORD_THREAD_TITLE_SYSTEM_PROMPT,
				messages: [{
					role: "user",
					content: params.userMessage,
					timestamp: Date.now()
				}]
			},
			options: {
				maxTokens: DISCORD_THREAD_TITLE_MAX_TOKENS,
				temperature: DISCORD_THREAD_TITLE_TEMPERATURE,
				signal: controller.signal
			}
		});
	} finally {
		clearTimeout(timer);
	}
}
function buildThreadTitleUserMessage(params) {
	const channelName = normalizeTitleContextField(params.channelName, MAX_THREAD_TITLE_CHANNEL_NAME_CHARS);
	const channelDescription = normalizeTitleContextField(params.channelDescription, MAX_THREAD_TITLE_CHANNEL_DESCRIPTION_CHARS);
	const messageLines = [];
	if (channelName) messageLines.push(`Channel: ${channelName}`);
	if (channelDescription) messageLines.push(`Channel description: ${channelDescription}`);
	messageLines.push(`Message:\n${params.sourceText}`);
	return messageLines.join("\n\n");
}
function truncateThreadTitleSourceText(sourceText) {
	if (sourceText.length <= MAX_THREAD_TITLE_SOURCE_CHARS) return sourceText;
	return `${sourceText.slice(0, MAX_THREAD_TITLE_SOURCE_CHARS)}...`;
}
function resolveThreadTitleTimeoutMs(timeoutMs) {
	return Math.max(100, Math.floor(timeoutMs ?? DEFAULT_THREAD_TITLE_TIMEOUT_MS));
}
function normalizeGeneratedThreadTitle(raw) {
	const lines = raw.replace(/\r/g, "").split("\n");
	let firstLine = "";
	for (const line of lines) {
		const trimmed = line.trim();
		if (!trimmed) continue;
		if (!firstLine && trimmed.startsWith("```")) continue;
		firstLine = trimmed;
		break;
	}
	return stripThreadTitleWrappers(firstLine);
}
function stripThreadTitleWrappers(raw) {
	let current = raw.trim();
	let previous = "";
	while (current && current !== previous) {
		previous = current;
		current = current.replace(/^["'`]+|["'`]+$/g, "").trim();
		current = current.replace(/^\*\*(.+)\*\*$/u, "$1").trim();
		current = current.replace(/^__(.+)__$/u, "$1").trim();
		current = current.replace(/^\*(.+)\*$/u, "$1").trim();
		current = current.replace(/^_(.+)_$/u, "$1").trim();
		current = current.replace(/^~~(.+)~~$/u, "$1").trim();
	}
	return current;
}
function normalizeTitleContextField(raw, maxChars) {
	const value = raw?.trim();
	if (!value) return;
	const singleLine = value.replace(/\s+/g, " ");
	if (singleLine.length <= maxChars) return singleLine;
	return `${singleLine.slice(0, maxChars)}...`;
}
//#endregion
//#region extensions/discord/src/monitor/threading.ts
const DISCORD_THREAD_STARTER_CACHE_TTL_MS = 300 * 1e3;
const DISCORD_THREAD_STARTER_CACHE_MAX = 500;
const DISCORD_THREAD_STARTER_CACHE = /* @__PURE__ */ new Map();
function __resetDiscordThreadStarterCacheForTest() {
	DISCORD_THREAD_STARTER_CACHE.clear();
}
function getCachedThreadStarter(key, now) {
	const entry = DISCORD_THREAD_STARTER_CACHE.get(key);
	if (!entry) return;
	if (now - entry.updatedAt > DISCORD_THREAD_STARTER_CACHE_TTL_MS) {
		DISCORD_THREAD_STARTER_CACHE.delete(key);
		return;
	}
	DISCORD_THREAD_STARTER_CACHE.delete(key);
	DISCORD_THREAD_STARTER_CACHE.set(key, {
		...entry,
		updatedAt: now
	});
	return entry.value;
}
function setCachedThreadStarter(key, value, now) {
	DISCORD_THREAD_STARTER_CACHE.delete(key);
	DISCORD_THREAD_STARTER_CACHE.set(key, {
		value,
		updatedAt: now
	});
	while (DISCORD_THREAD_STARTER_CACHE.size > DISCORD_THREAD_STARTER_CACHE_MAX) {
		const iter = DISCORD_THREAD_STARTER_CACHE.keys().next();
		if (iter.done) break;
		DISCORD_THREAD_STARTER_CACHE.delete(iter.value);
	}
}
function isDiscordThreadType(type) {
	return type === ChannelType.PublicThread || type === ChannelType.PrivateThread || type === ChannelType.AnnouncementThread;
}
function resolveTrimmedDiscordMessageChannelId(params) {
	return (params.messageChannelId || resolveDiscordMessageChannelId({ message: params.message })).trim();
}
function resolveDiscordThreadChannel(params) {
	if (!params.isGuildMessage) return null;
	const { message, channelInfo } = params;
	const channel = "channel" in message ? message.channel : void 0;
	if (channel && typeof channel === "object" && "isThread" in channel && typeof channel.isThread === "function" && channel.isThread()) return channel;
	if (!isDiscordThreadType(channelInfo?.type)) return null;
	const messageChannelId = params.messageChannelId || resolveDiscordMessageChannelId({ message });
	if (!messageChannelId) return null;
	return {
		id: messageChannelId,
		name: channelInfo?.name ?? void 0,
		parentId: channelInfo?.parentId ?? void 0,
		parent: void 0,
		ownerId: channelInfo?.ownerId ?? void 0
	};
}
async function resolveDiscordThreadParentInfo(params) {
	const { threadChannel, channelInfo, client } = params;
	let parentId = threadChannel.parentId ?? threadChannel.parent?.id ?? channelInfo?.parentId ?? void 0;
	if (!parentId && threadChannel.id) parentId = (await resolveDiscordChannelInfo(client, threadChannel.id))?.parentId ?? void 0;
	if (!parentId) return {};
	let parentName = threadChannel.parent?.name;
	const parentInfo = await resolveDiscordChannelInfo(client, parentId);
	parentName = parentName ?? parentInfo?.name;
	const parentType = parentInfo?.type;
	return {
		id: parentId,
		name: parentName,
		type: parentType
	};
}
async function resolveDiscordThreadStarter(params) {
	const cacheKey = params.channel.id;
	const cached = getCachedThreadStarter(cacheKey, Date.now());
	if (cached) return cached;
	try {
		const parentType = params.parentType;
		const messageChannelId = parentType === ChannelType.GuildForum || parentType === ChannelType.GuildMedia ? params.channel.id : params.parentId;
		if (!messageChannelId) return null;
		const starter = await params.client.rest.get(Routes.channelMessage(messageChannelId, params.channel.id));
		if (!starter) return null;
		const content = starter.content?.trim() ?? "";
		const embedText = resolveDiscordEmbedText(starter.embeds?.[0]);
		const text = content || embedText;
		if (!text) return null;
		const payload = {
			text,
			author: starter.member?.nick ?? starter.member?.displayName ?? (starter.author ? starter.author.discriminator && starter.author.discriminator !== "0" ? `${starter.author.username ?? "Unknown"}#${starter.author.discriminator}` : starter.author.username ?? starter.author.id ?? "Unknown" : "Unknown"),
			timestamp: params.resolveTimestampMs(starter.timestamp) ?? void 0
		};
		setCachedThreadStarter(cacheKey, payload, Date.now());
		return payload;
	} catch {
		return null;
	}
}
function resolveDiscordReplyTarget(opts) {
	if (opts.replyToMode === "off") return;
	const replyToId = opts.replyToId?.trim();
	if (!replyToId) return;
	if (opts.replyToMode === "all") return replyToId;
	return opts.hasReplied ? void 0 : replyToId;
}
function sanitizeDiscordThreadName(rawName, fallbackId) {
	return truncateUtf16Safe(truncateUtf16Safe(rawName.replace(/<@!?\d+>/g, "").replace(/<@&\d+>/g, "").replace(/<#\d+>/g, "").replace(/\s+/g, " ").trim() || `Thread ${fallbackId}`, 80), 100) || `Thread ${fallbackId}`;
}
function resolveDiscordAutoThreadContext(params) {
	const createdThreadId = String(params.createdThreadId ?? "").trim();
	if (!createdThreadId) return null;
	const messageChannelId = params.messageChannelId.trim();
	if (!messageChannelId) return null;
	const threadSessionKey = buildAgentSessionKey({
		agentId: params.agentId,
		channel: params.channel,
		peer: {
			kind: "channel",
			id: createdThreadId
		}
	});
	const parentSessionKey = buildAgentSessionKey({
		agentId: params.agentId,
		channel: params.channel,
		peer: {
			kind: "channel",
			id: messageChannelId
		}
	});
	return {
		createdThreadId,
		From: `${params.channel}:channel:${createdThreadId}`,
		To: `channel:${createdThreadId}`,
		OriginatingTo: `channel:${createdThreadId}`,
		SessionKey: threadSessionKey,
		ParentSessionKey: parentSessionKey
	};
}
async function resolveDiscordAutoThreadReplyPlan(params) {
	const messageChannelId = resolveTrimmedDiscordMessageChannelId(params);
	const originalReplyTarget = `channel:${params.threadChannel?.id ?? (messageChannelId || "unknown")}`;
	const createdThreadId = await maybeCreateDiscordAutoThread({
		client: params.client,
		message: params.message,
		messageChannelId: messageChannelId || void 0,
		channel: params.channel,
		isGuildMessage: params.isGuildMessage,
		channelConfig: params.channelConfig,
		threadChannel: params.threadChannel,
		channelType: params.channelType,
		channelName: params.channelName,
		channelDescription: params.channelDescription,
		baseText: params.baseText,
		combinedBody: params.combinedBody,
		cfg: params.cfg,
		agentId: params.agentId
	});
	const deliveryPlan = resolveDiscordReplyDeliveryPlan({
		replyTarget: originalReplyTarget,
		replyToMode: params.replyToMode,
		messageId: params.message.id,
		threadChannel: params.threadChannel,
		createdThreadId
	});
	const autoThreadContext = params.isGuildMessage ? resolveDiscordAutoThreadContext({
		agentId: params.agentId,
		channel: params.channel,
		messageChannelId,
		createdThreadId
	}) : null;
	return {
		...deliveryPlan,
		createdThreadId,
		autoThreadContext
	};
}
async function maybeCreateDiscordAutoThread(params) {
	if (!params.isGuildMessage) return;
	if (!params.channelConfig?.autoThread) return;
	if (params.threadChannel) return;
	if (params.channelType === ChannelType.GuildForum || params.channelType === ChannelType.GuildMedia || params.channelType === ChannelType.GuildVoice || params.channelType === ChannelType.GuildStageVoice) return;
	const messageChannelId = resolveTrimmedDiscordMessageChannelId(params);
	if (!messageChannelId) return;
	try {
		const rawThreadSource = params.baseText || params.combinedBody || "Thread";
		const threadName = sanitizeDiscordThreadName(rawThreadSource, params.message.id);
		const archiveDuration = params.channelConfig?.autoArchiveDuration ? Number(params.channelConfig.autoArchiveDuration) : 60;
		const created = await params.client.rest.post(`${Routes.channelMessage(messageChannelId, params.message.id)}/threads`, { body: {
			name: threadName,
			auto_archive_duration: archiveDuration
		} });
		const createdId = created?.id ? String(created.id) : "";
		if (createdId && params.channelConfig?.autoThreadName === "generated" && params.cfg && params.agentId) {
			const modelRef = resolveDiscordThreadTitleModelRef({
				cfg: params.cfg,
				channel: params.channel,
				agentId: params.agentId,
				threadId: createdId,
				messageChannelId,
				channelName: params.channelName
			});
			maybeRenameDiscordAutoThread({
				client: params.client,
				threadId: createdId,
				currentName: threadName,
				fallbackId: params.message.id,
				sourceText: rawThreadSource,
				modelRef,
				channelName: params.channelName,
				channelDescription: params.channelDescription,
				cfg: params.cfg,
				agentId: params.agentId
			});
		}
		return createdId || void 0;
	} catch (err) {
		logVerbose(`discord: autoThread creation failed for ${messageChannelId}/${params.message.id}: ${String(err)}`);
		try {
			const msg = await params.client.rest.get(Routes.channelMessage(messageChannelId, params.message.id));
			const existingThreadId = msg?.thread?.id ? String(msg.thread.id) : "";
			if (existingThreadId) {
				logVerbose(`discord: autoThread reusing existing thread ${existingThreadId} on ${messageChannelId}/${params.message.id}`);
				return existingThreadId;
			}
		} catch {}
		return;
	}
}
function resolveDiscordThreadTitleModelRef(params) {
	const channel = params.channel?.trim();
	if (!channel) return;
	const parentSessionKey = buildAgentSessionKey({
		agentId: params.agentId,
		channel,
		peer: {
			kind: "channel",
			id: params.messageChannelId
		}
	});
	const channelLabel = params.channelName?.trim();
	const groupChannel = channelLabel ? `#${channelLabel}` : void 0;
	return resolveChannelModelOverride({
		cfg: params.cfg,
		channel,
		groupId: params.threadId,
		groupChatType: "channel",
		groupChannel,
		groupSubject: groupChannel,
		parentSessionKey
	})?.model;
}
async function maybeRenameDiscordAutoThread(params) {
	try {
		const fallbackName = sanitizeDiscordThreadName("", params.fallbackId);
		const generated = await generateThreadTitle({
			cfg: params.cfg,
			agentId: params.agentId,
			messageText: params.sourceText,
			modelRef: params.modelRef,
			channelName: params.channelName,
			channelDescription: params.channelDescription
		});
		if (!generated) return;
		const nextName = sanitizeDiscordThreadName(generated, params.fallbackId);
		if (!nextName || nextName === params.currentName || nextName === fallbackName) return;
		await params.client.rest.patch(Routes.channel(params.threadId), { body: { name: nextName } });
	} catch (err) {
		logVerbose(`discord: autoThread rename failed for ${params.threadId}: ${String(err)}`);
	}
}
function resolveDiscordReplyDeliveryPlan(params) {
	const originalReplyTarget = params.replyTarget;
	let deliverTarget = originalReplyTarget;
	let replyTarget = originalReplyTarget;
	if (params.createdThreadId) {
		deliverTarget = `channel:${params.createdThreadId}`;
		replyTarget = deliverTarget;
	}
	const allowReference = deliverTarget === originalReplyTarget;
	const replyReference = createReplyReferencePlanner({
		replyToMode: allowReference ? params.replyToMode : "off",
		existingId: params.threadChannel ? params.messageId : void 0,
		startId: params.messageId,
		allowReference
	});
	return {
		deliverTarget,
		replyTarget,
		replyReference
	};
}
//#endregion
export { resolveMediaList as _, resolveDiscordReplyDeliveryPlan as a, resolveDiscordThreadParentInfo as c, buildDiscordMediaPayload as d, hasDiscordMessageStickers as f, resolveForwardedMediaList as g, resolveDiscordMessageText as h, resolveDiscordAutoThreadReplyPlan as i, resolveDiscordThreadStarter as l, resolveDiscordMessageChannelId as m, maybeCreateDiscordAutoThread as n, resolveDiscordReplyTarget as o, resolveDiscordChannelInfo as p, resolveDiscordAutoThreadContext as r, resolveDiscordThreadChannel as s, __resetDiscordThreadStarterCacheForTest as t, sanitizeDiscordThreadName as u };
