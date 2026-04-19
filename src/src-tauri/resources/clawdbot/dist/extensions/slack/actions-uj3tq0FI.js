import { a as resolveSlackAccount, c as resolveSlackBotToken } from "./accounts-DJiceqJx.js";
import { r as validateSlackBlocksArray } from "./blocks-input-DBKMsIf6.js";
import { i as createSlackWriteClient, r as createSlackWebClient } from "./client-BfPZ6k8d.js";
import { i as buildSlackBlocksFallbackText, t as sendMessageSlack } from "./send-a7txocw9.js";
import { normalizeLowercaseStringOrEmpty, normalizeOptionalLowercaseString } from "openclaw/plugin-sdk/text-runtime";
import { fetchWithRuntimeDispatcher } from "openclaw/plugin-sdk/infra-runtime";
import { loadConfig } from "openclaw/plugin-sdk/config-runtime";
import { logVerbose } from "openclaw/plugin-sdk/runtime-env";
import { normalizeHostname } from "openclaw/plugin-sdk/host-runtime";
import { fetchRemoteMedia, saveMediaBuffer } from "openclaw/plugin-sdk/media-runtime";
import { resolveRequestUrl } from "openclaw/plugin-sdk/request-url";
//#region extensions/slack/src/monitor/media.ts
function isSlackHostname(hostname) {
	const normalized = normalizeHostname(hostname);
	if (!normalized) return false;
	return [
		"slack.com",
		"slack-edge.com",
		"slack-files.com"
	].some((suffix) => normalized === suffix || normalized.endsWith(`.${suffix}`));
}
function assertSlackFileUrl(rawUrl) {
	let parsed;
	try {
		parsed = new URL(rawUrl);
	} catch {
		throw new Error(`Invalid Slack file URL: ${rawUrl}`);
	}
	if (parsed.protocol !== "https:") throw new Error(`Refusing Slack file URL with non-HTTPS protocol: ${parsed.protocol}`);
	if (!isSlackHostname(parsed.hostname)) throw new Error(`Refusing to send Slack token to non-Slack host "${parsed.hostname}" (url: ${rawUrl})`);
	return parsed;
}
function createSlackAuthHeaders(token) {
	return { Authorization: `Bearer ${token}` };
}
function createSlackMediaRequest(url, token) {
	return {
		url: assertSlackFileUrl(url).href,
		requestInit: { headers: createSlackAuthHeaders(token) }
	};
}
function isMockedFetch(fetchImpl) {
	if (typeof fetchImpl !== "function") return false;
	return typeof fetchImpl.mock === "object";
}
function createSlackMediaFetch() {
	return async (input, init) => {
		const url = resolveRequestUrl(input);
		if (!url) throw new Error("Unsupported fetch input: expected string, URL, or Request");
		const parsed = assertSlackFileUrl(url);
		return ("dispatcher" in (init ?? {}) && !isMockedFetch(globalThis.fetch) ? fetchWithRuntimeDispatcher : globalThis.fetch)(parsed.href, {
			...init,
			redirect: "manual"
		});
	};
}
const SLACK_MEDIA_SSRF_POLICY = {
	allowedHostnames: [
		"*.slack.com",
		"*.slack-edge.com",
		"*.slack-files.com"
	],
	hostnameAllowlist: [
		"*.slack.com",
		"*.slack-edge.com",
		"*.slack-files.com"
	],
	allowRfc2544BenchmarkRange: true
};
/**
* Slack voice messages (audio clips, huddle recordings) carry a `subtype` of
* `"slack_audio"` but are served with a `video/*` MIME type (e.g. `video/mp4`,
* `video/webm`).  Override the primary type to `audio/` so the
* media-understanding pipeline routes them to transcription.
*/
function resolveSlackMediaMimetype(file, fetchedContentType) {
	const mime = fetchedContentType ?? file.mimetype;
	if (file.subtype === "slack_audio" && mime?.startsWith("video/")) return mime.replace("video/", "audio/");
	return mime;
}
function looksLikeHtmlBuffer(buffer) {
	const head = normalizeLowercaseStringOrEmpty(buffer.subarray(0, 512).toString("utf-8").replace(/^\s+/, ""));
	return head.startsWith("<!doctype html") || head.startsWith("<html");
}
const MAX_SLACK_MEDIA_CONCURRENCY = 3;
const MAX_SLACK_FORWARDED_ATTACHMENTS = 8;
function isForwardedSlackAttachment(attachment) {
	return attachment.is_share === true;
}
function resolveForwardedAttachmentImageUrl(attachment) {
	const rawUrl = attachment.image_url?.trim();
	if (!rawUrl) return null;
	try {
		const parsed = new URL(rawUrl);
		if (parsed.protocol !== "https:" || !isSlackHostname(parsed.hostname)) return null;
		return parsed.toString();
	} catch {
		return null;
	}
}
async function mapLimit(items, limit, fn) {
	if (items.length === 0) return [];
	const results = [];
	results.length = items.length;
	let nextIndex = 0;
	const workerCount = Math.max(1, Math.min(limit, items.length));
	await Promise.all(Array.from({ length: workerCount }, async () => {
		while (true) {
			const idx = nextIndex++;
			if (idx >= items.length) return;
			results[idx] = await fn(items[idx]);
		}
	}));
	return results;
}
/**
* Downloads all files attached to a Slack message and returns them as an array.
* Returns `null` when no files could be downloaded.
*/
async function resolveSlackMedia(params) {
	const files = params.files ?? [];
	const results = (await mapLimit(files.length > 8 ? files.slice(0, 8) : files, MAX_SLACK_MEDIA_CONCURRENCY, async (file) => {
		const url = file.url_private_download ?? file.url_private;
		if (!url) return null;
		try {
			const { url: slackUrl, requestInit } = createSlackMediaRequest(url, params.token);
			const fetched = await fetchRemoteMedia({
				url: slackUrl,
				fetchImpl: createSlackMediaFetch(),
				requestInit,
				filePathHint: file.name,
				maxBytes: params.maxBytes,
				ssrfPolicy: SLACK_MEDIA_SSRF_POLICY
			});
			if (fetched.buffer.byteLength > params.maxBytes) return null;
			const fileMime = normalizeOptionalLowercaseString(file.mimetype);
			const fileName = normalizeLowercaseStringOrEmpty(file.name);
			if (!(fileMime === "text/html" || fileName.endsWith(".html") || fileName.endsWith(".htm"))) {
				if (normalizeOptionalLowercaseString(fetched.contentType?.split(";")[0]) === "text/html" || looksLikeHtmlBuffer(fetched.buffer)) return null;
			}
			const effectiveMime = resolveSlackMediaMimetype(file, fetched.contentType);
			const saved = await saveMediaBuffer(fetched.buffer, effectiveMime, "inbound", params.maxBytes);
			const label = fetched.fileName ?? file.name;
			const contentType = effectiveMime ?? saved.contentType;
			return {
				path: saved.path,
				...contentType ? { contentType } : {},
				placeholder: label ? `[Slack file: ${label}]` : "[Slack file]"
			};
		} catch {
			return null;
		}
	})).filter((entry) => Boolean(entry));
	return results.length > 0 ? results : null;
}
/** Extracts text and media from forwarded-message attachments. Returns null when empty. */
async function resolveSlackAttachmentContent(params) {
	const attachments = params.attachments;
	if (!attachments || attachments.length === 0) return null;
	const forwardedAttachments = attachments.filter((attachment) => isForwardedSlackAttachment(attachment)).slice(0, MAX_SLACK_FORWARDED_ATTACHMENTS);
	if (forwardedAttachments.length === 0) return null;
	const textBlocks = [];
	const allMedia = [];
	for (const att of forwardedAttachments) {
		const text = att.text?.trim() || att.fallback?.trim();
		if (text) {
			const author = att.author_name;
			const heading = author ? `[Forwarded message from ${author}]` : "[Forwarded message]";
			textBlocks.push(`${heading}\n${text}`);
		}
		const imageUrl = resolveForwardedAttachmentImageUrl(att);
		if (imageUrl) try {
			const { url: slackUrl, requestInit } = createSlackMediaRequest(imageUrl, params.token);
			const fetched = await fetchRemoteMedia({
				url: slackUrl,
				fetchImpl: createSlackMediaFetch(),
				requestInit,
				maxBytes: params.maxBytes,
				ssrfPolicy: SLACK_MEDIA_SSRF_POLICY
			});
			if (fetched.buffer.byteLength <= params.maxBytes) {
				const saved = await saveMediaBuffer(fetched.buffer, fetched.contentType, "inbound", params.maxBytes);
				const label = fetched.fileName ?? "forwarded image";
				allMedia.push({
					path: saved.path,
					contentType: fetched.contentType ?? saved.contentType,
					placeholder: `[Forwarded image: ${label}]`
				});
			}
		} catch {}
		if (att.files && att.files.length > 0) {
			const fileMedia = await resolveSlackMedia({
				files: att.files,
				token: params.token,
				maxBytes: params.maxBytes
			});
			if (fileMedia) allMedia.push(...fileMedia);
		}
	}
	const combinedText = textBlocks.join("\n\n");
	if (!combinedText && allMedia.length === 0) return null;
	return {
		text: combinedText,
		media: allMedia
	};
}
const THREAD_STARTER_CACHE = /* @__PURE__ */ new Map();
const THREAD_STARTER_CACHE_TTL_MS = 360 * 6e4;
const THREAD_STARTER_CACHE_MAX = 2e3;
function evictThreadStarterCache() {
	const now = Date.now();
	for (const [cacheKey, entry] of THREAD_STARTER_CACHE.entries()) if (now - entry.cachedAt > THREAD_STARTER_CACHE_TTL_MS) THREAD_STARTER_CACHE.delete(cacheKey);
	if (THREAD_STARTER_CACHE.size <= THREAD_STARTER_CACHE_MAX) return;
	const excess = THREAD_STARTER_CACHE.size - THREAD_STARTER_CACHE_MAX;
	let removed = 0;
	for (const cacheKey of THREAD_STARTER_CACHE.keys()) {
		THREAD_STARTER_CACHE.delete(cacheKey);
		removed += 1;
		if (removed >= excess) break;
	}
}
async function resolveSlackThreadStarter(params) {
	evictThreadStarterCache();
	const cacheKey = `${params.channelId}:${params.threadTs}`;
	const cached = THREAD_STARTER_CACHE.get(cacheKey);
	if (cached && Date.now() - cached.cachedAt <= THREAD_STARTER_CACHE_TTL_MS) return cached.value;
	if (cached) THREAD_STARTER_CACHE.delete(cacheKey);
	try {
		const message = (await params.client.conversations.replies({
			channel: params.channelId,
			ts: params.threadTs,
			limit: 1,
			inclusive: true
		}))?.messages?.[0];
		const text = (message?.text ?? "").trim();
		if (!message || !text) return null;
		const starter = {
			text,
			userId: message.user,
			botId: message.bot_id,
			ts: message.ts,
			files: message.files
		};
		if (THREAD_STARTER_CACHE.has(cacheKey)) THREAD_STARTER_CACHE.delete(cacheKey);
		THREAD_STARTER_CACHE.set(cacheKey, {
			value: starter,
			cachedAt: Date.now()
		});
		evictThreadStarterCache();
		return starter;
	} catch {
		return null;
	}
}
/**
* Fetches the most recent messages in a Slack thread (excluding the current message).
* Used to populate thread context when a new thread session starts.
*
* Uses cursor pagination and keeps only the latest N retained messages so long threads
* still produce up-to-date context without unbounded memory growth.
*/
async function resolveSlackThreadHistory(params) {
	const maxMessages = params.limit ?? 20;
	if (!Number.isFinite(maxMessages) || maxMessages <= 0) return [];
	const fetchLimit = 200;
	const retained = [];
	let cursor;
	try {
		do {
			const response = await params.client.conversations.replies({
				channel: params.channelId,
				ts: params.threadTs,
				limit: fetchLimit,
				inclusive: true,
				...cursor ? { cursor } : {}
			});
			for (const msg of response.messages ?? []) {
				if (!msg.text?.trim() && !msg.files?.length) continue;
				if (params.currentMessageTs && msg.ts === params.currentMessageTs) continue;
				retained.push(msg);
				if (retained.length > maxMessages) retained.shift();
			}
			const next = response.response_metadata?.next_cursor;
			cursor = typeof next === "string" && next.trim().length > 0 ? next.trim() : void 0;
		} while (cursor);
		return retained.map((msg) => ({
			text: msg.text?.trim() ? msg.text : `[attached: ${msg.files?.map((f) => f.name ?? "file").join(", ")}]`,
			userId: msg.user,
			botId: msg.bot_id,
			ts: msg.ts,
			files: msg.files
		}));
	} catch {
		return [];
	}
}
//#endregion
//#region extensions/slack/src/actions.ts
function resolveToken(explicit, accountId) {
	const account = resolveSlackAccount({
		cfg: loadConfig(),
		accountId
	});
	const token = resolveSlackBotToken(explicit ?? account.botToken ?? void 0);
	if (!token) {
		logVerbose(`slack actions: missing bot token for account=${account.accountId} explicit=${Boolean(explicit)} source=${account.botTokenSource ?? "unknown"}`);
		throw new Error("SLACK_BOT_TOKEN or channels.slack.botToken is required for Slack actions");
	}
	return token;
}
function normalizeEmoji(raw) {
	const trimmed = raw.trim();
	if (!trimmed) throw new Error("Emoji is required for Slack reactions");
	return trimmed.replace(/^:+|:+$/g, "");
}
async function getClient(opts = {}, mode = "read") {
	if (opts.client) return opts.client;
	const token = resolveToken(opts.token, opts.accountId);
	return mode === "write" ? createSlackWriteClient(token) : createSlackWebClient(token);
}
async function resolveBotUserId(client) {
	const auth = await client.auth.test();
	if (!auth?.user_id) throw new Error("Failed to resolve Slack bot user id");
	return auth.user_id;
}
async function reactSlackMessage(channelId, messageId, emoji, opts = {}) {
	await (await getClient(opts, "write")).reactions.add({
		channel: channelId,
		timestamp: messageId,
		name: normalizeEmoji(emoji)
	});
}
async function removeSlackReaction(channelId, messageId, emoji, opts = {}) {
	await (await getClient(opts, "write")).reactions.remove({
		channel: channelId,
		timestamp: messageId,
		name: normalizeEmoji(emoji)
	});
}
async function removeOwnSlackReactions(channelId, messageId, opts = {}) {
	const client = await getClient(opts, "write");
	const userId = await resolveBotUserId(client);
	const reactions = await listSlackReactions(channelId, messageId, { client });
	const toRemove = /* @__PURE__ */ new Set();
	for (const reaction of reactions ?? []) {
		const name = reaction?.name;
		if (!name) continue;
		if ((reaction?.users ?? []).includes(userId)) toRemove.add(name);
	}
	if (toRemove.size === 0) return [];
	await Promise.all(Array.from(toRemove, (name) => client.reactions.remove({
		channel: channelId,
		timestamp: messageId,
		name
	})));
	return Array.from(toRemove);
}
async function listSlackReactions(channelId, messageId, opts = {}) {
	return (await (await getClient(opts)).reactions.get({
		channel: channelId,
		timestamp: messageId,
		full: true
	})).message?.reactions ?? [];
}
async function sendSlackMessage(to, content, opts = {}) {
	return await sendMessageSlack(to, content, {
		accountId: opts.accountId,
		token: opts.token,
		mediaUrl: opts.mediaUrl,
		mediaAccess: opts.mediaAccess,
		mediaLocalRoots: opts.mediaLocalRoots,
		mediaReadFile: opts.mediaReadFile,
		client: opts.client,
		threadTs: opts.threadTs,
		...opts.uploadFileName ? { uploadFileName: opts.uploadFileName } : {},
		...opts.uploadTitle ? { uploadTitle: opts.uploadTitle } : {},
		blocks: opts.blocks
	});
}
async function editSlackMessage(channelId, messageId, content, opts = {}) {
	const client = await getClient(opts, "write");
	const blocks = opts.blocks == null ? void 0 : validateSlackBlocksArray(opts.blocks);
	const trimmedContent = content.trim();
	await client.chat.update({
		channel: channelId,
		ts: messageId,
		text: trimmedContent || (blocks ? buildSlackBlocksFallbackText(blocks) : " "),
		...blocks ? { blocks } : {}
	});
}
async function deleteSlackMessage(channelId, messageId, opts = {}) {
	await (await getClient(opts, "write")).chat.delete({
		channel: channelId,
		ts: messageId
	});
}
async function readSlackMessages(channelId, opts = {}) {
	const client = await getClient(opts);
	if (opts.threadId) {
		const result = await client.conversations.replies({
			channel: channelId,
			ts: opts.threadId,
			limit: opts.limit,
			latest: opts.before,
			oldest: opts.after
		});
		return {
			messages: (result.messages ?? []).filter((message) => message?.ts !== opts.threadId),
			hasMore: Boolean(result.has_more)
		};
	}
	const result = await client.conversations.history({
		channel: channelId,
		limit: opts.limit,
		latest: opts.before,
		oldest: opts.after
	});
	return {
		messages: result.messages ?? [],
		hasMore: Boolean(result.has_more)
	};
}
async function getSlackMemberInfo(userId, opts = {}) {
	return await (await getClient(opts)).users.info({ user: userId });
}
async function listSlackEmojis(opts = {}) {
	return await (await getClient(opts)).emoji.list();
}
async function pinSlackMessage(channelId, messageId, opts = {}) {
	await (await getClient(opts, "write")).pins.add({
		channel: channelId,
		timestamp: messageId
	});
}
async function unpinSlackMessage(channelId, messageId, opts = {}) {
	await (await getClient(opts, "write")).pins.remove({
		channel: channelId,
		timestamp: messageId
	});
}
async function listSlackPins(channelId, opts = {}) {
	return (await (await getClient(opts)).pins.list({ channel: channelId })).items ?? [];
}
function normalizeSlackScopeValue(value) {
	const trimmed = value?.trim();
	return trimmed ? trimmed : void 0;
}
function collectSlackDirectShareChannelIds(file) {
	const ids = /* @__PURE__ */ new Set();
	for (const group of [
		file.channels,
		file.groups,
		file.ims
	]) {
		if (!Array.isArray(group)) continue;
		for (const entry of group) {
			if (typeof entry !== "string") continue;
			const normalized = normalizeSlackScopeValue(entry);
			if (normalized) ids.add(normalized);
		}
	}
	return ids;
}
function collectSlackShareMaps(file) {
	if (!file.shares || typeof file.shares !== "object" || Array.isArray(file.shares)) return [];
	const shares = file.shares;
	return [shares.public, shares.private].filter((value) => Boolean(value) && typeof value === "object" && !Array.isArray(value));
}
function collectSlackSharedChannelIds(file) {
	const ids = /* @__PURE__ */ new Set();
	for (const shareMap of collectSlackShareMaps(file)) for (const channelId of Object.keys(shareMap)) {
		const normalized = normalizeSlackScopeValue(channelId);
		if (normalized) ids.add(normalized);
	}
	return ids;
}
function collectSlackThreadShares(file, channelId) {
	const matches = [];
	for (const shareMap of collectSlackShareMaps(file)) {
		const rawEntries = shareMap[channelId];
		if (!Array.isArray(rawEntries)) continue;
		for (const rawEntry of rawEntries) {
			if (!rawEntry || typeof rawEntry !== "object" || Array.isArray(rawEntry)) continue;
			const entry = rawEntry;
			const ts = typeof entry.ts === "string" ? normalizeSlackScopeValue(entry.ts) : void 0;
			const threadTs = typeof entry.thread_ts === "string" ? normalizeSlackScopeValue(entry.thread_ts) : void 0;
			matches.push({
				channelId,
				ts,
				threadTs
			});
		}
	}
	return matches;
}
function hasSlackScopeMismatch(params) {
	const channelId = normalizeSlackScopeValue(params.channelId);
	if (!channelId) return false;
	const threadId = normalizeSlackScopeValue(params.threadId);
	const directIds = collectSlackDirectShareChannelIds(params.file);
	const sharedIds = collectSlackSharedChannelIds(params.file);
	const hasChannelEvidence = directIds.size > 0 || sharedIds.size > 0;
	const inChannel = directIds.has(channelId) || sharedIds.has(channelId);
	if (hasChannelEvidence && !inChannel) return true;
	if (!threadId) return false;
	const threadShares = collectSlackThreadShares(params.file, channelId);
	if (threadShares.length === 0) return false;
	const threadEvidence = threadShares.filter((entry) => entry.threadTs || entry.ts);
	if (threadEvidence.length === 0) return false;
	return !threadEvidence.some((entry) => entry.threadTs === threadId || entry.ts === threadId);
}
/**
* Downloads a Slack file by ID and saves it to the local media store.
* Fetches a fresh download URL via files.info to avoid using stale private URLs.
* Returns null when the file cannot be found or downloaded.
*/
async function downloadSlackFile(fileId, opts) {
	const token = resolveToken(opts.token, opts.accountId);
	const file = (await (await getClient(opts)).files.info({ file: fileId })).file;
	if (!file?.url_private_download && !file?.url_private) return null;
	if (hasSlackScopeMismatch({
		file,
		channelId: opts.channelId,
		threadId: opts.threadId
	})) return null;
	return (await resolveSlackMedia({
		files: [{
			id: file.id,
			name: file.name,
			mimetype: file.mimetype,
			url_private: file.url_private,
			url_private_download: file.url_private_download
		}],
		token,
		maxBytes: opts.maxBytes
	}))?.[0] ?? null;
}
//#endregion
export { resolveSlackThreadHistory as _, listSlackEmojis as a, pinSlackMessage as c, removeOwnSlackReactions as d, removeSlackReaction as f, resolveSlackMedia as g, resolveSlackAttachmentContent as h, getSlackMemberInfo as i, reactSlackMessage as l, unpinSlackMessage as m, downloadSlackFile as n, listSlackPins as o, sendSlackMessage as p, editSlackMessage as r, listSlackReactions as s, deleteSlackMessage as t, readSlackMessages as u, resolveSlackThreadStarter as v };
