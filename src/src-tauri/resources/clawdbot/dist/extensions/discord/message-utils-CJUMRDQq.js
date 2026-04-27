import { o as mergeAbortSignals } from "./timeouts-DDxjtlnF.js";
import { normalizeLowercaseStringOrEmpty, normalizeOptionalString, normalizeOptionalStringifiedId } from "openclaw/plugin-sdk/text-runtime";
import { StickerFormatType } from "discord-api-types/v10";
import { fetchRemoteMedia, saveMediaBuffer } from "openclaw/plugin-sdk/media-runtime";
import { buildMediaPayload } from "openclaw/plugin-sdk/reply-payload";
import { logVerbose } from "openclaw/plugin-sdk/runtime-env";
//#region extensions/discord/src/monitor/channel-access.ts
function readDiscordChannelPropertySafe(channel, key) {
	if (!channel || typeof channel !== "object") return;
	try {
		if (!(key in channel)) return;
		return channel[key];
	} catch {
		return;
	}
}
function resolveDiscordChannelStringPropertySafe(channel, key) {
	const value = readDiscordChannelPropertySafe(channel, key);
	return typeof value === "string" ? value : void 0;
}
function resolveDiscordChannelNumberPropertySafe(channel, key) {
	const value = readDiscordChannelPropertySafe(channel, key);
	return typeof value === "number" ? value : void 0;
}
function resolveDiscordChannelNameSafe(channel) {
	return resolveDiscordChannelStringPropertySafe(channel, "name");
}
function resolveDiscordChannelIdSafe(channel) {
	return resolveDiscordChannelStringPropertySafe(channel, "id");
}
function resolveDiscordChannelTopicSafe(channel) {
	return resolveDiscordChannelStringPropertySafe(channel, "topic");
}
function resolveDiscordChannelParentIdSafe(channel) {
	return resolveDiscordChannelStringPropertySafe(channel, "parentId");
}
function resolveDiscordChannelParentSafe(channel) {
	return readDiscordChannelPropertySafe(channel, "parent");
}
function resolveDiscordChannelInfoSafe(channel) {
	const parent = resolveDiscordChannelParentSafe(channel);
	return {
		name: resolveDiscordChannelNameSafe(channel),
		topic: resolveDiscordChannelTopicSafe(channel),
		type: resolveDiscordChannelNumberPropertySafe(channel, "type"),
		parentId: resolveDiscordChannelStringPropertySafe(channel, "parentId"),
		ownerId: resolveDiscordChannelStringPropertySafe(channel, "ownerId"),
		parentName: resolveDiscordChannelNameSafe(parent)
	};
}
//#endregion
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
const FORWARD_MESSAGE_REFERENCE_TYPE = 1;
const DISCORD_CHANNEL_INFO_CACHE_TTL_MS = 300 * 1e3;
const DISCORD_CHANNEL_INFO_NEGATIVE_CACHE_TTL_MS = 30 * 1e3;
const DISCORD_CHANNEL_INFO_CACHE = /* @__PURE__ */ new Map();
const DISCORD_STICKER_ASSET_BASE_URL = "https://media.discordapp.net/stickers";
function normalizeDiscordChannelId(value) {
	return normalizeOptionalStringifiedId(value) ?? "";
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
		const channelInfo = resolveDiscordChannelInfoSafe(channel);
		const payload = {
			type: channelInfo.type ?? channel.type,
			name: channelInfo.name,
			topic: channelInfo.topic,
			parentId: channelInfo.parentId,
			ownerId: channelInfo.ownerId
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
	const out = [];
	const resolvedSsrFPolicy = resolveDiscordMediaSsrFPolicy(options?.ssrfPolicy);
	if (snapshots.length > 0) {
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
	const referencedForward = resolveDiscordReferencedForwardMessage(message);
	if (!referencedForward) return out;
	await appendResolvedMediaFromAttachments({
		attachments: referencedForward.attachments,
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
		stickers: resolveDiscordMessageStickers(referencedForward),
		maxBytes,
		out,
		errorPrefix: "discord: failed to download forwarded sticker",
		fetchImpl: options?.fetchImpl,
		ssrfPolicy: resolvedSsrFPolicy,
		readIdleTimeoutMs: options?.readIdleTimeoutMs,
		totalTimeoutMs: options?.totalTimeoutMs,
		abortSignal: options?.abortSignal
	});
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
	const name = normalizeLowercaseStringOrEmpty(attachment.filename);
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
	const title = normalizeOptionalString(embed?.title) ?? "";
	const description = normalizeOptionalString(embed?.description) ?? "";
	if (title && description) return `${title}\n${description}`;
	return title || description || "";
}
function resolveDiscordMessageText(message, options) {
	const embedText = resolveDiscordEmbedText(message.embeds?.[0] ?? null);
	const baseText = resolveDiscordMentions(normalizeOptionalString(message.content) || buildDiscordMediaPlaceholder({
		attachments: message.attachments ?? void 0,
		stickers: resolveDiscordMessageStickers(message)
	}) || embedText || normalizeOptionalString(options?.fallbackText) || "", message);
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
	if (snapshots.length > 0) return resolveDiscordForwardedMessagesTextFromSnapshots(snapshots);
	const referencedForward = resolveDiscordReferencedForwardMessage(message);
	if (!referencedForward) return "";
	const referencedText = resolveDiscordMessageText(referencedForward);
	if (!referencedText) return "";
	const authorLabel = formatDiscordSnapshotAuthor(referencedForward.author);
	return `${authorLabel ? `[Forwarded message from ${authorLabel}]` : "[Forwarded message]"}\n${referencedText}`;
}
function resolveDiscordMessageSnapshots(message) {
	const rawData = message.rawData;
	return normalizeDiscordMessageSnapshots(rawData?.message_snapshots ?? message.message_snapshots ?? message.messageSnapshots);
}
function normalizeDiscordMessageSnapshots(snapshots) {
	if (!Array.isArray(snapshots)) return [];
	return snapshots.filter((entry) => Boolean(entry) && typeof entry === "object");
}
function resolveDiscordForwardedMessagesTextFromSnapshots(snapshots) {
	const forwardedBlocks = normalizeDiscordMessageSnapshots(snapshots).map((snapshot) => buildDiscordForwardedMessageBlock(snapshot.message)).filter((entry) => Boolean(entry));
	if (forwardedBlocks.length === 0) return "";
	return forwardedBlocks.join("\n\n");
}
function buildDiscordForwardedMessageBlock(snapshotMessage) {
	if (!snapshotMessage) return null;
	const text = resolveDiscordSnapshotMessageText(snapshotMessage);
	if (!text) return null;
	const authorLabel = formatDiscordSnapshotAuthor(snapshotMessage.author);
	return `${authorLabel ? `[Forwarded message from ${authorLabel}]` : "[Forwarded message]"}\n${text}`;
}
function resolveDiscordReferencedForwardMessage(message) {
	const referenceType = message.messageReference?.type;
	return Number(referenceType) === FORWARD_MESSAGE_REFERENCE_TYPE ? message.referencedMessage : null;
}
function resolveDiscordSnapshotMessageText(snapshot) {
	const content = normalizeOptionalString(snapshot.content) ?? "";
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
export { resolveDiscordForwardedMessagesTextFromSnapshots as a, resolveForwardedMediaList as c, resolveDiscordChannelInfoSafe as d, resolveDiscordChannelNameSafe as f, resolveDiscordChannelTopicSafe as h, resolveDiscordEmbedText as i, resolveMediaList as l, resolveDiscordChannelParentSafe as m, hasDiscordMessageStickers as n, resolveDiscordMessageChannelId as o, resolveDiscordChannelParentIdSafe as p, resolveDiscordChannelInfo as r, resolveDiscordMessageText as s, buildDiscordMediaPayload as t, resolveDiscordChannelIdSafe as u };
