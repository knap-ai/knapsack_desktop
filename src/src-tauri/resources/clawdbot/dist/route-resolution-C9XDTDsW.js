import { a as logVerbose } from "./globals-DBUMOBZ8.js";
import { E as truncateUtf16Safe } from "./utils-CS0Ikux6.js";
import { u as resolveAgentIdFromSessionKey } from "./session-key-DAhnzjyr.js";
import { Bi as ChannelType, Br as resolveDiscordAllowListMatch, Ji as Routes, Kn as sendMessageDiscord, QS as resolveDiscordAccount, Qr as formatDiscordUserTag, Rr as normalizeDiscordAllowList, Xn as sendWebhookMessageDiscord, Yi as StickerFormatType, Yn as sendVoiceMessageDiscord, di as chunkDiscordTextWithMode, ei as resolveTimestampMs, kr as sendDiscordText, qr as resolveDiscordOwnerAllowFrom, ui as createDiscordRetryRunner, wl as createReplyReferencePlanner } from "./pi-embedded-CbCYZxIb.js";
import { i as resolveAgentRoute, n as deriveLastRoutePolicy, t as buildAgentSessionKey } from "./resolve-route-DwFWP4JW.js";
import { i as resolveAgentAvatar } from "./outbound-runtime-m-y0nd6F.js";
import { D as resolveRetryConfig, O as retryAsync } from "./provider-models-BKjzpTsb.js";
import { u as convertMarkdownTables } from "./text-runtime-DVXt5xhi.js";
import { d as upsertChannelPairingRequest } from "./pairing-store-BGKLrjo6.js";
import { t as createChannelPairingChallengeIssuer } from "./channel-pairing-BrG9NqjP.js";
import { l as resolveCommandAuthorizedFromAuthorizers, n as readStoreAllowFromForDmPolicy, o as resolveDmGroupAccessWithLists } from "./dm-policy-shared-DtcQProI.js";
import { h as sendMediaWithLeadingCaption, m as resolveTextChunksWithFallback, p as resolveSendableOutboundReplyParts, x as buildMediaPayload } from "./reply-payload-CiQ7TPgp.js";
import { P as saveMediaBuffer } from "./routes-XT2JfvT-.js";
import { l as fetchRemoteMedia } from "./web-media-PKy3RbRG.js";
import { s as wrapExternalContent } from "./external-content-DZI9vlJn.js";
import { t as buildUntrustedChannelMetadata } from "./security-runtime-xlw0Fxx2.js";
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
async function resolveMediaList(message, maxBytes, fetchImpl, ssrfPolicy) {
	const out = [];
	const resolvedSsrFPolicy = resolveDiscordMediaSsrFPolicy(ssrfPolicy);
	await appendResolvedMediaFromAttachments({
		attachments: message.attachments ?? [],
		maxBytes,
		out,
		errorPrefix: "discord: failed to download attachment",
		fetchImpl,
		ssrfPolicy: resolvedSsrFPolicy
	});
	await appendResolvedMediaFromStickers({
		stickers: resolveDiscordMessageStickers(message),
		maxBytes,
		out,
		errorPrefix: "discord: failed to download sticker",
		fetchImpl,
		ssrfPolicy: resolvedSsrFPolicy
	});
	return out;
}
async function resolveForwardedMediaList(message, maxBytes, fetchImpl, ssrfPolicy) {
	const snapshots = resolveDiscordMessageSnapshots(message);
	if (snapshots.length === 0) return [];
	const out = [];
	const resolvedSsrFPolicy = resolveDiscordMediaSsrFPolicy(ssrfPolicy);
	for (const snapshot of snapshots) {
		await appendResolvedMediaFromAttachments({
			attachments: snapshot.message?.attachments,
			maxBytes,
			out,
			errorPrefix: "discord: failed to download forwarded attachment",
			fetchImpl,
			ssrfPolicy: resolvedSsrFPolicy
		});
		await appendResolvedMediaFromStickers({
			stickers: snapshot.message ? resolveDiscordSnapshotStickers(snapshot.message) : [],
			maxBytes,
			out,
			errorPrefix: "discord: failed to download forwarded sticker",
			fetchImpl,
			ssrfPolicy: resolvedSsrFPolicy
		});
	}
	return out;
}
async function appendResolvedMediaFromAttachments(params) {
	const attachments = params.attachments;
	if (!attachments || attachments.length === 0) return;
	for (const attachment of attachments) try {
		const fetched = await fetchRemoteMedia({
			url: attachment.url,
			filePathHint: attachment.filename ?? attachment.url,
			maxBytes: params.maxBytes,
			fetchImpl: params.fetchImpl,
			ssrfPolicy: params.ssrfPolicy
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
			const fetched = await fetchRemoteMedia({
				url: candidate.url,
				filePathHint: candidate.fileName,
				maxBytes: params.maxBytes,
				fetchImpl: params.fetchImpl,
				ssrfPolicy: params.ssrfPolicy
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
//#region extensions/discord/src/monitor/inbound-context.ts
function buildDiscordGroupSystemPrompt(channelConfig) {
	const systemPromptParts = [channelConfig?.systemPrompt?.trim() || null].filter((entry) => Boolean(entry));
	return systemPromptParts.length > 0 ? systemPromptParts.join("\n\n") : void 0;
}
function buildDiscordUntrustedContext(params) {
	if (!params.isGuild) return;
	const entries = [buildUntrustedChannelMetadata({
		source: "discord",
		label: "Discord channel topic",
		entries: [params.channelTopic]
	}), typeof params.messageBody === "string" && params.messageBody.trim().length > 0 ? wrapExternalContent(`UNTRUSTED Discord message body\n${params.messageBody.trim()}`, {
		source: "unknown",
		includeWarning: false
	}) : void 0].filter((entry) => Boolean(entry));
	return entries.length > 0 ? entries : void 0;
}
function buildDiscordInboundAccessContext(params) {
	return {
		groupSystemPrompt: params.isGuild ? buildDiscordGroupSystemPrompt(params.channelConfig) : void 0,
		untrustedContext: buildDiscordUntrustedContext({
			isGuild: params.isGuild,
			channelTopic: params.channelTopic,
			messageBody: params.messageBody
		}),
		ownerAllowFrom: resolveDiscordOwnerAllowFrom({
			channelConfig: params.channelConfig,
			guildInfo: params.guildInfo,
			sender: params.sender,
			allowNameMatching: params.allowNameMatching
		})
	};
}
//#endregion
//#region extensions/discord/src/monitor/sender-identity.ts
function resolveDiscordWebhookId(message) {
	const candidate = message.webhookId ?? message.webhook_id;
	return typeof candidate === "string" && candidate.trim() ? candidate.trim() : null;
}
function resolveDiscordSenderIdentity(params) {
	const pkInfo = params.pluralkitInfo ?? null;
	const pkMember = pkInfo?.member ?? void 0;
	const pkSystem = pkInfo?.system ?? void 0;
	const memberId = pkMember?.id?.trim();
	const memberName = (pkMember?.display_name ?? pkMember?.name ?? "")?.trim();
	if (memberId && memberName) {
		const systemName = pkSystem?.name?.trim();
		const label = systemName ? `${memberName} (PK:${systemName})` : `${memberName} (PK)`;
		return {
			id: memberId,
			name: memberName,
			tag: pkMember?.name?.trim() || void 0,
			label,
			isPluralKit: true,
			pluralkit: {
				memberId,
				memberName,
				systemId: pkSystem?.id?.trim() || void 0,
				systemName
			}
		};
	}
	const senderTag = formatDiscordUserTag(params.author);
	const senderDisplay = params.member?.nickname ?? params.author.globalName ?? params.author.username;
	const senderLabel = senderDisplay && senderTag && senderDisplay !== senderTag ? `${senderDisplay} (${senderTag})` : senderDisplay ?? senderTag ?? params.author.id;
	return {
		id: params.author.id,
		name: params.author.username ?? void 0,
		tag: senderTag,
		label: senderLabel,
		isPluralKit: false
	};
}
//#endregion
//#region extensions/discord/src/monitor/reply-context.ts
function resolveReplyContext(message, resolveDiscordMessageText) {
	const referenced = message.referencedMessage;
	if (!referenced?.author) return null;
	const referencedText = resolveDiscordMessageText(referenced, { includeForwarded: true });
	if (!referencedText) return null;
	const sender = resolveDiscordSenderIdentity({
		author: referenced.author,
		pluralkitInfo: null
	});
	return {
		id: referenced.id,
		channelId: referenced.channelId,
		sender: sender.tag ?? sender.label ?? "unknown",
		body: referencedText,
		timestamp: resolveTimestampMs(referenced.timestamp)
	};
}
function buildDirectLabel(author, tagOverride) {
	return `${(tagOverride?.trim() || resolveDiscordSenderIdentity({
		author,
		pluralkitInfo: null
	}).tag) ?? "unknown"} user id:${author.id}`;
}
function buildGuildLabel(params) {
	const { guild, channelName, channelId } = params;
	return `${guild?.name ?? "Guild"} #${channelName} channel id:${channelId}`;
}
//#endregion
//#region extensions/discord/src/monitor/reply-delivery.ts
const DISCORD_DELIVERY_RETRY_DEFAULTS = {
	attempts: 3,
	minDelayMs: 1e3,
	maxDelayMs: 3e4,
	jitter: 0
};
function isRetryableDiscordError(err) {
	const status = err.status ?? err.statusCode;
	return status === 429 || status !== void 0 && status >= 500;
}
function getDiscordRetryAfterMs(err) {
	if (!err || typeof err !== "object") return;
	if ("retryAfter" in err && typeof err.retryAfter === "number" && Number.isFinite(err.retryAfter)) return err.retryAfter * 1e3;
	const retryAfterRaw = err.headers?.["retry-after"];
	if (!retryAfterRaw) return;
	const retryAfterMs = Number(retryAfterRaw) * 1e3;
	return Number.isFinite(retryAfterMs) ? retryAfterMs : void 0;
}
function resolveDeliveryRetryConfig(retry) {
	return resolveRetryConfig(DISCORD_DELIVERY_RETRY_DEFAULTS, retry);
}
async function sendWithRetry(fn, retryConfig) {
	await retryAsync(fn, {
		...retryConfig,
		shouldRetry: (err) => isRetryableDiscordError(err),
		retryAfterMs: getDiscordRetryAfterMs
	});
}
function resolveTargetChannelId(target) {
	if (!target.startsWith("channel:")) return;
	return target.slice(8).trim() || void 0;
}
function resolveBoundThreadBinding(params) {
	const sessionKey = params.sessionKey?.trim();
	if (!params.threadBindings || !sessionKey) return;
	const bindings = params.threadBindings.listBySessionKey(sessionKey);
	if (bindings.length === 0) return;
	const targetChannelId = resolveTargetChannelId(params.target);
	if (!targetChannelId) return;
	return bindings.find((entry) => entry.threadId === targetChannelId);
}
function resolveBindingPersona(cfg, binding) {
	if (!binding) return {};
	const username = (`🤖 ${binding.label?.trim() || binding.agentId}`.trim() || "🤖 agent").slice(0, 80);
	let avatarUrl;
	try {
		const avatar = resolveAgentAvatar(cfg, binding.agentId);
		if (avatar.kind === "remote") avatarUrl = avatar.url;
	} catch {
		avatarUrl = void 0;
	}
	return {
		username,
		avatarUrl
	};
}
async function sendDiscordChunkWithFallback(params) {
	if (!params.text.trim()) return;
	const text = params.text;
	const binding = params.binding;
	if (binding?.webhookId && binding?.webhookToken) try {
		await sendWebhookMessageDiscord(text, {
			cfg: params.cfg,
			webhookId: binding.webhookId,
			webhookToken: binding.webhookToken,
			accountId: binding.accountId,
			threadId: binding.threadId,
			replyTo: params.replyTo,
			username: params.username,
			avatarUrl: params.avatarUrl
		});
		return;
	} catch {}
	if (params.channelId && params.request && params.rest) {
		const { channelId, request, rest } = params;
		await sendWithRetry(() => sendDiscordText(rest, channelId, text, params.replyTo, request, params.maxLinesPerMessage, void 0, void 0, params.chunkMode), params.retryConfig);
		return;
	}
	await sendWithRetry(() => sendMessageDiscord(params.target, text, {
		cfg: params.cfg,
		token: params.token,
		rest: params.rest,
		accountId: params.accountId,
		replyTo: params.replyTo
	}), params.retryConfig);
}
async function deliverDiscordReply(params) {
	const chunkLimit = Math.min(params.textLimit, 2e3);
	const replyTo = params.replyToId?.trim() || void 0;
	const replyOnce = (params.replyToMode ?? "all") === "first";
	let replyUsed = false;
	const resolveReplyTo = () => {
		if (!replyTo) return;
		if (!replyOnce) return replyTo;
		if (replyUsed) return;
		replyUsed = true;
		return replyTo;
	};
	const binding = resolveBoundThreadBinding({
		threadBindings: params.threadBindings,
		sessionKey: params.sessionKey,
		target: params.target
	});
	const persona = resolveBindingPersona(params.cfg, binding);
	const channelId = resolveTargetChannelId(params.target);
	const account = resolveDiscordAccount({
		cfg: params.cfg,
		accountId: params.accountId
	});
	const retryConfig = resolveDeliveryRetryConfig(account.config.retry);
	const request = channelId ? createDiscordRetryRunner({ configRetry: account.config.retry }) : void 0;
	let deliveredAny = false;
	for (const payload of params.replies) {
		const tableMode = params.tableMode ?? "code";
		const reply = resolveSendableOutboundReplyParts(payload, { text: convertMarkdownTables(payload.text ?? "", tableMode) });
		if (!reply.hasContent) continue;
		if (!reply.hasMedia) {
			const mode = params.chunkMode ?? "length";
			const chunks = resolveTextChunksWithFallback(reply.text, chunkDiscordTextWithMode(reply.text, {
				maxChars: chunkLimit,
				maxLines: params.maxLinesPerMessage,
				chunkMode: mode
			}));
			for (const chunk of chunks) {
				if (!chunk.trim()) continue;
				const replyTo = resolveReplyTo();
				await sendDiscordChunkWithFallback({
					cfg: params.cfg,
					target: params.target,
					text: chunk,
					token: params.token,
					rest: params.rest,
					accountId: params.accountId,
					maxLinesPerMessage: params.maxLinesPerMessage,
					replyTo,
					binding,
					chunkMode: params.chunkMode,
					username: persona.username,
					avatarUrl: persona.avatarUrl,
					channelId,
					request,
					retryConfig
				});
				deliveredAny = true;
			}
			continue;
		}
		const firstMedia = reply.mediaUrls[0];
		if (!firstMedia) continue;
		if (payload.audioAsVoice) {
			const replyTo = resolveReplyTo();
			await sendVoiceMessageDiscord(params.target, firstMedia, {
				cfg: params.cfg,
				token: params.token,
				rest: params.rest,
				accountId: params.accountId,
				replyTo
			});
			deliveredAny = true;
			await sendDiscordChunkWithFallback({
				cfg: params.cfg,
				target: params.target,
				text: reply.text,
				token: params.token,
				rest: params.rest,
				accountId: params.accountId,
				maxLinesPerMessage: params.maxLinesPerMessage,
				replyTo: resolveReplyTo(),
				binding,
				chunkMode: params.chunkMode,
				username: persona.username,
				avatarUrl: persona.avatarUrl,
				channelId,
				request,
				retryConfig
			});
			await sendMediaWithLeadingCaption({
				mediaUrls: reply.mediaUrls.slice(1),
				caption: "",
				send: async ({ mediaUrl }) => {
					const replyTo = resolveReplyTo();
					await sendWithRetry(() => sendMessageDiscord(params.target, "", {
						cfg: params.cfg,
						token: params.token,
						rest: params.rest,
						mediaUrl,
						accountId: params.accountId,
						mediaLocalRoots: params.mediaLocalRoots,
						replyTo
					}), retryConfig);
				}
			});
			continue;
		}
		await sendMediaWithLeadingCaption({
			mediaUrls: reply.mediaUrls,
			caption: reply.text,
			send: async ({ mediaUrl, caption }) => {
				const replyTo = resolveReplyTo();
				await sendWithRetry(() => sendMessageDiscord(params.target, caption ?? "", {
					cfg: params.cfg,
					token: params.token,
					rest: params.rest,
					mediaUrl,
					accountId: params.accountId,
					mediaLocalRoots: params.mediaLocalRoots,
					replyTo
				}), retryConfig);
			}
		});
		deliveredAny = true;
	}
	if (binding && deliveredAny) params.threadBindings?.touchThread?.({ threadId: binding.threadId });
}
//#endregion
//#region extensions/discord/src/monitor/threading.ts
const DISCORD_THREAD_STARTER_CACHE_TTL_MS = 300 * 1e3;
const DISCORD_THREAD_STARTER_CACHE_MAX = 500;
const DISCORD_THREAD_STARTER_CACHE = /* @__PURE__ */ new Map();
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
		isGuildMessage: params.isGuildMessage,
		channelConfig: params.channelConfig,
		threadChannel: params.threadChannel,
		channelType: params.channelType,
		baseText: params.baseText,
		combinedBody: params.combinedBody
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
		const threadName = sanitizeDiscordThreadName(params.baseText || params.combinedBody || "Thread", params.message.id);
		const archiveDuration = params.channelConfig?.autoArchiveDuration ? Number(params.channelConfig.autoArchiveDuration) : 60;
		const created = await params.client.rest.post(`${Routes.channelMessage(messageChannelId, params.message.id)}/threads`, { body: {
			name: threadName,
			auto_archive_duration: archiveDuration
		} });
		return (created?.id ? String(created.id) : "") || void 0;
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
//#region extensions/discord/src/monitor/typing.ts
async function sendTyping(params) {
	const channel = await params.client.fetchChannel(params.channelId);
	if (!channel) return;
	if ("triggerTyping" in channel && typeof channel.triggerTyping === "function") await channel.triggerTyping();
}
//#endregion
//#region extensions/discord/src/monitor/dm-command-auth.ts
const DISCORD_ALLOW_LIST_PREFIXES = [
	"discord:",
	"user:",
	"pk:"
];
function resolveSenderAllowMatch(params) {
	const allowList = normalizeDiscordAllowList(params.allowEntries, DISCORD_ALLOW_LIST_PREFIXES);
	return allowList ? resolveDiscordAllowListMatch({
		allowList,
		candidate: params.sender,
		allowNameMatching: params.allowNameMatching
	}) : { allowed: false };
}
function resolveDmPolicyCommandAuthorization(params) {
	if (params.dmPolicy === "open" && params.decision === "allow") return true;
	return params.commandAuthorized;
}
async function resolveDiscordDmCommandAccess(params) {
	const storeAllowFrom = params.readStoreAllowFrom ? await params.readStoreAllowFrom().catch(() => []) : await readStoreAllowFromForDmPolicy({
		provider: "discord",
		accountId: params.accountId,
		dmPolicy: params.dmPolicy
	});
	const access = resolveDmGroupAccessWithLists({
		isGroup: false,
		dmPolicy: params.dmPolicy,
		allowFrom: params.configuredAllowFrom,
		groupAllowFrom: [],
		storeAllowFrom,
		isSenderAllowed: (allowEntries) => resolveSenderAllowMatch({
			allowEntries,
			sender: params.sender,
			allowNameMatching: params.allowNameMatching
		}).allowed
	});
	const allowMatch = resolveSenderAllowMatch({
		allowEntries: access.effectiveAllowFrom,
		sender: params.sender,
		allowNameMatching: params.allowNameMatching
	});
	const commandAuthorized = resolveCommandAuthorizedFromAuthorizers({
		useAccessGroups: params.useAccessGroups,
		authorizers: [{
			configured: access.effectiveAllowFrom.length > 0,
			allowed: allowMatch.allowed
		}],
		modeWhenAccessGroupsOff: "configured"
	});
	return {
		decision: access.decision,
		reason: access.reason,
		commandAuthorized: resolveDmPolicyCommandAuthorization({
			dmPolicy: params.dmPolicy,
			decision: access.decision,
			commandAuthorized
		}),
		allowMatch
	};
}
//#endregion
//#region extensions/discord/src/monitor/dm-command-decision.ts
async function handleDiscordDmCommandDecision(params) {
	if (params.dmAccess.decision === "allow") return true;
	if (params.dmAccess.decision === "pairing") {
		const upsertPairingRequest = params.upsertPairingRequest ?? upsertChannelPairingRequest;
		const result = await createChannelPairingChallengeIssuer({
			channel: "discord",
			upsertPairingRequest: async ({ id, meta }) => await upsertPairingRequest({
				channel: "discord",
				id,
				accountId: params.accountId,
				meta
			})
		})({
			senderId: params.sender.id,
			senderIdLine: `Your Discord user id: ${params.sender.id}`,
			meta: {
				tag: params.sender.tag,
				name: params.sender.name
			},
			sendPairingReply: async () => {}
		});
		if (result.created && result.code) await params.onPairingCreated(result.code);
		return false;
	}
	await params.onUnauthorized();
	return false;
}
//#endregion
//#region extensions/discord/src/monitor/route-resolution.ts
function buildDiscordRoutePeer(params) {
	return {
		kind: params.isDirectMessage ? "direct" : params.isGroupDm ? "group" : "channel",
		id: params.isDirectMessage ? params.directUserId?.trim() || params.conversationId : params.conversationId
	};
}
function resolveDiscordConversationRoute(params) {
	return resolveAgentRoute({
		cfg: params.cfg,
		channel: "discord",
		accountId: params.accountId,
		guildId: params.guildId ?? void 0,
		memberRoleIds: params.memberRoleIds,
		peer: params.peer,
		parentPeer: params.parentConversationId ? {
			kind: "channel",
			id: params.parentConversationId
		} : void 0
	});
}
function resolveDiscordBoundConversationRoute(params) {
	return resolveDiscordEffectiveRoute({
		route: resolveDiscordConversationRoute({
			cfg: params.cfg,
			accountId: params.accountId,
			guildId: params.guildId,
			memberRoleIds: params.memberRoleIds,
			peer: buildDiscordRoutePeer({
				isDirectMessage: params.isDirectMessage,
				isGroupDm: params.isGroupDm,
				directUserId: params.directUserId,
				conversationId: params.conversationId
			}),
			parentConversationId: params.parentConversationId
		}),
		boundSessionKey: params.boundSessionKey,
		configuredRoute: params.configuredRoute,
		matchedBy: params.matchedBy
	});
}
function resolveDiscordEffectiveRoute(params) {
	const boundSessionKey = params.boundSessionKey?.trim();
	if (!boundSessionKey) return params.configuredRoute?.route ?? params.route;
	return {
		...params.route,
		sessionKey: boundSessionKey,
		agentId: resolveAgentIdFromSessionKey(boundSessionKey),
		lastRoutePolicy: deriveLastRoutePolicy({
			sessionKey: boundSessionKey,
			mainSessionKey: params.route.mainSessionKey
		}),
		...params.matchedBy ? { matchedBy: params.matchedBy } : {}
	};
}
//#endregion
export { hasDiscordMessageStickers as C, resolveForwardedMediaList as D, resolveDiscordMessageText as E, resolveMediaList as O, buildDiscordMediaPayload as S, resolveDiscordMessageChannelId as T, resolveReplyContext as _, handleDiscordDmCommandDecision as a, buildDiscordGroupSystemPrompt as b, resolveDiscordAutoThreadReplyPlan as c, resolveDiscordThreadParentInfo as d, resolveDiscordThreadStarter as f, buildGuildLabel as g, buildDirectLabel as h, resolveDiscordEffectiveRoute as i, resolveDiscordReplyTarget as l, deliverDiscordReply as m, resolveDiscordBoundConversationRoute as n, resolveDiscordDmCommandAccess as o, sanitizeDiscordThreadName as p, resolveDiscordConversationRoute as r, sendTyping as s, buildDiscordRoutePeer as t, resolveDiscordThreadChannel as u, resolveDiscordSenderIdentity as v, resolveDiscordChannelInfo as w, buildDiscordInboundAccessContext as x, resolveDiscordWebhookId as y };
