import { t as __exportAll } from "./rolldown-runtime-D7D4PA-g.js";
import { a as resolveSlackAccount, d as resolveSlackBotToken } from "./accounts-BnLQ3fe2.js";
import { a as validateSlackBlocksArray, o as SLACK_TEXT_LIMIT, s as truncateSlackText } from "./thread-ts-ks-O8cEG.js";
import { a as getSlackWriteClient, r as createSlackWebClient } from "./client-BY0ZhGHl.js";
import { c as buildSlackBlocksFallbackText, t as sendMessageSlack } from "./send-Bpc-Eks7.js";
import { normalizeLowercaseStringOrEmpty, normalizeOptionalLowercaseString, normalizeOptionalString } from "openclaw/plugin-sdk/string-coerce-runtime";
import { requireRuntimeConfig } from "openclaw/plugin-sdk/plugin-config-runtime";
import { logVerbose, logVerbose as logVerbose$1 } from "openclaw/plugin-sdk/runtime-env";
import { z } from "zod";
import fs from "node:fs/promises";
import { formatErrorMessage } from "openclaw/plugin-sdk/error-runtime";
import { normalizeHostname } from "openclaw/plugin-sdk/host-runtime";
import { resolveRequestUrl } from "openclaw/plugin-sdk/request-url";
import { fetchWithRuntimeDispatcher } from "openclaw/plugin-sdk/runtime-fetch";
import { saveRemoteMedia } from "openclaw/plugin-sdk/media-runtime";
import { pruneMapToMaxSize } from "openclaw/plugin-sdk/collection-runtime";
//#region extensions/slack/src/edit-text.ts
function buildSlackEditTextPayload(content, blocks) {
	const trimmedContent = content.trim();
	if (trimmedContent) return trimmedContent;
	if (blocks?.length) return truncateSlackText(buildSlackBlocksFallbackText(blocks), SLACK_TEXT_LIMIT);
	return " ";
}
//#endregion
//#region extensions/slack/src/file-reference.ts
function formatSlackFileReference(file) {
	const name = normalizeOptionalString(file?.name) ?? "file";
	const fileId = normalizeOptionalString(file?.id);
	return fileId ? `${name} (fileId: ${fileId})` : name;
}
function formatSlackFileReferenceList(files) {
	if (!files?.length) return "file";
	return files.map((file) => formatSlackFileReference(file)).join(", ");
}
//#endregion
//#region extensions/slack/src/monitor/media-types.ts
const MAX_SLACK_MEDIA_FILES = 8;
//#endregion
//#region extensions/slack/src/monitor/thread.ts
const THREAD_STARTER_CACHE = /* @__PURE__ */ new Map();
const THREAD_STARTER_CACHE_TTL_MS = 360 * 6e4;
const THREAD_STARTER_CACHE_MAX = 2e3;
function evictThreadStarterCache() {
	const now = Date.now();
	for (const [cacheKey, entry] of THREAD_STARTER_CACHE.entries()) if (now - entry.cachedAt > THREAD_STARTER_CACHE_TTL_MS) THREAD_STARTER_CACHE.delete(cacheKey);
	pruneMapToMaxSize(THREAD_STARTER_CACHE, THREAD_STARTER_CACHE_MAX);
}
function formatSlackFilePlaceholder(files) {
	return `[attached: ${formatSlackFileReferenceList(files)}]`;
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
		const files = message?.files?.length ? message.files : void 0;
		if (!message || !text && !files) return null;
		const starter = {
			text: text || formatSlackFilePlaceholder(files),
			userId: message.user,
			botId: message.bot_id,
			ts: message.ts,
			files
		};
		if (THREAD_STARTER_CACHE.has(cacheKey)) THREAD_STARTER_CACHE.delete(cacheKey);
		THREAD_STARTER_CACHE.set(cacheKey, {
			value: starter,
			cachedAt: Date.now()
		});
		evictThreadStarterCache();
		return starter;
	} catch (err) {
		logVerbose$1(`slack thread starter fetch failed channel=${params.channelId} ts=${params.threadTs}: ${formatErrorMessage(err)}`);
		return null;
	}
}
function resetSlackThreadStarterCacheForTest() {
	THREAD_STARTER_CACHE.clear();
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
			}
			if (retained.length > maxMessages) retained.splice(0, retained.length - maxMessages);
			const next = response.response_metadata?.next_cursor;
			cursor = typeof next === "string" && next.trim().length > 0 ? next.trim() : void 0;
		} while (cursor);
		return retained.map((msg) => ({
			text: msg.text?.trim() ? msg.text : formatSlackFilePlaceholder(msg.files),
			userId: msg.user,
			botId: msg.bot_id,
			ts: msg.ts,
			files: msg.files
		}));
	} catch (err) {
		logVerbose$1(`slack thread history fetch failed channel=${params.channelId} ts=${params.threadTs}: ${formatErrorMessage(err)}`);
		return [];
	}
}
//#endregion
//#region extensions/slack/src/monitor/media.ts
var media_exports = /* @__PURE__ */ __exportAll({
	MAX_SLACK_MEDIA_FILES: () => 8,
	SLACK_MEDIA_READ_IDLE_TIMEOUT_MS: () => SLACK_MEDIA_READ_IDLE_TIMEOUT_MS,
	SLACK_MEDIA_TOTAL_TIMEOUT_MS: () => SLACK_MEDIA_TOTAL_TIMEOUT_MS,
	fetchWithSlackAuth: () => fetchWithSlackAuth,
	resetSlackThreadStarterCacheForTest: () => resetSlackThreadStarterCacheForTest,
	resolveSlackAttachmentContent: () => resolveSlackAttachmentContent,
	resolveSlackMedia: () => resolveSlackMedia,
	resolveSlackThreadHistory: () => resolveSlackThreadHistory,
	resolveSlackThreadStarter: () => resolveSlackThreadStarter
});
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
	const candidate = fetchImpl;
	return candidate.mock !== void 0 || candidate["_isMockFunction"] === true;
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
function resolveSlackFetchForRuntime() {
	return isMockedFetch(globalThis.fetch) ? globalThis.fetch : fetchWithRuntimeDispatcher;
}
/**
* Fetches a URL with Authorization header while keeping same-origin redirects
* authenticated and dropping auth once the redirect crosses origins.
*/
async function fetchWithSlackAuth(url, token) {
	const parsed = assertSlackFileUrl(url);
	const authHeaders = createSlackAuthHeaders(token);
	const fetchImpl = resolveSlackFetchForRuntime();
	const initialRes = await fetchImpl(parsed.href, {
		headers: authHeaders,
		redirect: "manual"
	});
	if (initialRes.status < 300 || initialRes.status >= 400) return initialRes;
	const redirectUrl = initialRes.headers.get("location");
	if (!redirectUrl) return initialRes;
	let resolvedUrl;
	try {
		resolvedUrl = new URL(redirectUrl, parsed.href);
	} catch {
		return initialRes;
	}
	if (resolvedUrl.protocol !== "https:") return initialRes;
	if (resolvedUrl.origin === parsed.origin) return fetchImpl(resolvedUrl.toString(), {
		headers: authHeaders,
		redirect: "follow"
	});
	return fetchImpl(resolvedUrl.toString(), { redirect: "follow" });
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
const SLACK_MEDIA_READ_IDLE_TIMEOUT_MS = 6e4;
const SLACK_MEDIA_TOTAL_TIMEOUT_MS = 12e4;
function mergeAbortSignals(signals) {
	const activeSignals = signals.filter((signal) => Boolean(signal));
	if (activeSignals.length === 0) return;
	if (activeSignals.length === 1) return activeSignals[0];
	if (typeof AbortSignal.any === "function") return AbortSignal.any(activeSignals);
	const controller = new AbortController();
	for (const signal of activeSignals) if (signal.aborted) {
		controller.abort();
		return controller.signal;
	}
	const abort = () => {
		controller.abort();
		for (const signal of activeSignals) signal.removeEventListener("abort", abort);
	};
	for (const signal of activeSignals) signal.addEventListener("abort", abort, { once: true });
	return controller.signal;
}
async function saveSlackMedia(params) {
	const timeoutAbortController = params.totalTimeoutMs ? new AbortController() : void 0;
	const signal = mergeAbortSignals([
		params.abortSignal,
		params.options.requestInit?.signal ?? void 0,
		timeoutAbortController?.signal
	]);
	let timedOut = false;
	let timeoutHandle = null;
	const savePromise = saveRemoteMedia({
		...params.options,
		readIdleTimeoutMs: params.readIdleTimeoutMs ?? 6e4,
		...signal ? { requestInit: {
			...params.options.requestInit,
			signal
		} } : {}
	}).catch((error) => {
		if (timedOut) return new Promise(() => {});
		throw error;
	});
	try {
		if (!params.totalTimeoutMs) return await savePromise;
		const timeoutPromise = new Promise((_, reject) => {
			timeoutHandle = setTimeout(() => {
				timedOut = true;
				timeoutAbortController?.abort();
				reject(/* @__PURE__ */ new Error(`slack media download timed out after ${params.totalTimeoutMs}ms`));
			}, params.totalTimeoutMs);
			timeoutHandle.unref?.();
		});
		return await Promise.race([savePromise, timeoutPromise]);
	} finally {
		if (timeoutHandle) clearTimeout(timeoutHandle);
	}
}
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
async function looksLikeHtmlFile(filePath) {
	const handle = await fs.open(filePath, "r").catch(() => null);
	if (!handle) return false;
	try {
		const buffer = Buffer.alloc(512);
		const { bytesRead } = await handle.read(buffer, 0, buffer.byteLength, 0);
		return looksLikeHtmlBuffer(buffer.subarray(0, bytesRead));
	} finally {
		await handle.close().catch(() => void 0);
	}
}
const MAX_SLACK_MEDIA_CONCURRENCY = 3;
const MAX_SLACK_FORWARDED_ATTACHMENTS = 8;
async function fetchFreshSlackFileUrl(params) {
	if (!params.file.id || !params.client) return null;
	try {
		const freshFile = (await params.client.files.info({ file: params.file.id })).file;
		const freshUrl = freshFile?.url_private_download ?? freshFile?.url_private;
		if (freshUrl) {
			logVerbose$1(`slack: refreshed file URL via files.info for file id=${params.file.id}`);
			return freshUrl;
		}
		logVerbose$1(`slack: files.info returned no private URL for file id=${params.file.id}`);
		return null;
	} catch (error) {
		logVerbose$1(`slack: files.info failed for file id=${params.file.id}: ${formatErrorMessage(error)}`);
		return null;
	}
}
async function downloadSlackMediaFile(params) {
	const { url: slackUrl, requestInit } = createSlackMediaRequest(params.url, params.token);
	const saved = await saveSlackMedia({
		options: {
			url: slackUrl,
			fetchImpl: createSlackMediaFetch(),
			requestInit,
			filePathHint: params.file.name,
			fallbackContentType: resolveSlackMediaMimetype(params.file, params.file.mimetype),
			maxBytes: params.maxBytes,
			ssrfPolicy: SLACK_MEDIA_SSRF_POLICY
		},
		readIdleTimeoutMs: params.readIdleTimeoutMs,
		totalTimeoutMs: params.totalTimeoutMs ?? 12e4,
		abortSignal: params.abortSignal
	});
	const fileMime = normalizeOptionalLowercaseString(params.file.mimetype);
	const fileName = normalizeLowercaseStringOrEmpty(params.file.name);
	if (!(fileMime === "text/html" || fileName.endsWith(".html") || fileName.endsWith(".htm"))) {
		if (normalizeOptionalLowercaseString(saved.contentType?.split(";")[0]) === "text/html" || await looksLikeHtmlFile(saved.path)) {
			await fs.rm(saved.path, { force: true }).catch(() => void 0);
			return null;
		}
	}
	const effectiveMime = resolveSlackMediaMimetype(params.file, saved.contentType);
	const label = saved.fileName ?? params.file.name;
	const contentType = effectiveMime ?? saved.contentType;
	return {
		path: saved.path,
		...contentType ? { contentType } : {},
		placeholder: `[Slack file: ${formatSlackFileReference({
			...params.file,
			name: label
		})}]`
	};
}
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
		const eventUrl = file.url_private_download ?? file.url_private;
		const url = eventUrl ?? await fetchFreshSlackFileUrl({
			file,
			client: params.client
		});
		if (!url) return null;
		const result = await downloadSlackMediaFile({
			file,
			url,
			token: params.token,
			maxBytes: params.maxBytes,
			readIdleTimeoutMs: params.readIdleTimeoutMs,
			totalTimeoutMs: params.totalTimeoutMs,
			abortSignal: params.abortSignal
		}).catch(() => null);
		if (result || !eventUrl) return result;
		const freshUrl = await fetchFreshSlackFileUrl({
			file,
			client: params.client
		});
		if (!freshUrl) return null;
		return await downloadSlackMediaFile({
			file,
			url: freshUrl,
			token: params.token,
			maxBytes: params.maxBytes,
			readIdleTimeoutMs: params.readIdleTimeoutMs,
			totalTimeoutMs: params.totalTimeoutMs,
			abortSignal: params.abortSignal
		}).catch(() => null);
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
			const saved = await saveSlackMedia({
				options: {
					url: slackUrl,
					fetchImpl: createSlackMediaFetch(),
					requestInit,
					maxBytes: params.maxBytes,
					ssrfPolicy: SLACK_MEDIA_SSRF_POLICY
				},
				readIdleTimeoutMs: params.readIdleTimeoutMs,
				totalTimeoutMs: params.totalTimeoutMs ?? 12e4,
				abortSignal: params.abortSignal
			});
			const label = saved.fileName ?? "forwarded image";
			allMedia.push({
				path: saved.path,
				contentType: saved.contentType,
				placeholder: `[Forwarded image: ${label}]`
			});
		} catch {}
		if (att.files && att.files.length > 0) {
			const fileMedia = await resolveSlackMedia({
				files: att.files,
				client: params.client,
				token: params.token,
				maxBytes: params.maxBytes,
				readIdleTimeoutMs: params.readIdleTimeoutMs,
				totalTimeoutMs: params.totalTimeoutMs,
				abortSignal: params.abortSignal
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
//#endregion
//#region extensions/slack/src/actions.ts
function resolveToken(explicit, accountId, cfg) {
	if (explicit?.trim()) {
		const token = resolveSlackBotToken(explicit);
		if (token) return token;
	}
	if (!cfg) throw new Error("Slack actions requires a resolved runtime config. Load and resolve config at the command or gateway boundary, then pass cfg through the runtime path.");
	const account = resolveSlackAccount({
		cfg: requireRuntimeConfig(cfg, "Slack actions"),
		accountId
	});
	const token = resolveSlackBotToken(account.botToken ?? void 0);
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
const SLACK_TIMESTAMP_RE = /^\d+(?:\.\d+)?$/;
const ISO_8601_TIMESTAMP_SCHEMA = z.iso.datetime({ offset: true });
function formatEpochSeconds(milliseconds) {
	const seconds = milliseconds / 1e3;
	if (Number.isInteger(seconds)) return String(seconds);
	return seconds.toFixed(3).replace(/0+$/, "").replace(/\.$/, "");
}
function normalizeSlackReadTimestamp(raw, field) {
	const trimmed = raw?.trim();
	if (!trimmed) return;
	if (SLACK_TIMESTAMP_RE.test(trimmed)) return trimmed;
	if (!ISO_8601_TIMESTAMP_SCHEMA.safeParse(trimmed).success) throw new Error(`Invalid Slack read ${field} timestamp "${trimmed}": expected a Slack timestamp or ISO-8601 date string`);
	const parsed = Date.parse(trimmed);
	if (!Number.isFinite(parsed)) throw new Error(`Invalid Slack read ${field} timestamp "${trimmed}": expected a Slack timestamp or ISO-8601 date string`);
	return formatEpochSeconds(parsed);
}
function hasSlackPlatformError(err, code) {
	if (!err || typeof err !== "object") return false;
	const data = err.data;
	if (!data || typeof data !== "object") return false;
	return data.error === code;
}
async function getClient(opts = {}, mode = "read") {
	if (opts.client) return opts.client;
	const token = resolveToken(opts.token, opts.accountId, opts.cfg);
	return mode === "write" ? getSlackWriteClient(token) : createSlackWebClient(token);
}
async function resolveBotUserId(client) {
	const auth = await client.auth.test();
	if (!auth?.user_id) throw new Error("Failed to resolve Slack bot user id");
	return auth.user_id;
}
async function reactSlackMessage(channelId, messageId, emoji, opts = {}) {
	const client = await getClient(opts, "write");
	try {
		await client.reactions.add({
			channel: channelId,
			timestamp: messageId,
			name: normalizeEmoji(emoji)
		});
	} catch (err) {
		if (hasSlackPlatformError(err, "already_reacted")) return;
		throw err;
	}
}
async function removeSlackReaction(channelId, messageId, emoji, opts = {}) {
	const client = await getClient(opts, "write");
	try {
		await client.reactions.remove({
			channel: channelId,
			timestamp: messageId,
			name: normalizeEmoji(emoji)
		});
	} catch (err) {
		if (hasSlackPlatformError(err, "no_reaction")) return;
		throw err;
	}
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
	await Promise.all(Array.from(toRemove, (name) => removeSlackReaction(channelId, messageId, name, {
		...opts,
		client
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
async function sendSlackMessage(to, content, opts) {
	return await sendMessageSlack(to, content, {
		accountId: opts.accountId,
		cfg: opts.cfg,
		token: opts.token,
		mediaUrl: opts.mediaUrl,
		mediaAccess: opts.mediaAccess,
		mediaLocalRoots: opts.mediaLocalRoots,
		mediaReadFile: opts.mediaReadFile,
		client: opts.client,
		threadTs: opts.threadTs,
		replyBroadcast: opts.replyBroadcast,
		...opts.uploadFileName ? { uploadFileName: opts.uploadFileName } : {},
		...opts.uploadTitle ? { uploadTitle: opts.uploadTitle } : {},
		blocks: opts.blocks
	});
}
async function editSlackMessage(channelId, messageId, content, opts = {}) {
	const client = await getClient(opts, "write");
	const blocks = opts.blocks == null ? void 0 : validateSlackBlocksArray(opts.blocks);
	await client.chat.update({
		channel: channelId,
		ts: messageId,
		text: buildSlackEditTextPayload(content, blocks),
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
	const exactMessageId = opts.messageId?.trim();
	const readLimit = exactMessageId ? 1 : opts.limit;
	const exactBounds = exactMessageId ? {
		inclusive: true,
		latest: exactMessageId,
		oldest: void 0
	} : {
		latest: normalizeSlackReadTimestamp(opts.before, "before"),
		oldest: normalizeSlackReadTimestamp(opts.after, "after")
	};
	const client = await getClient(opts);
	if (opts.threadId) {
		const result = await client.conversations.replies({
			channel: channelId,
			ts: opts.threadId,
			limit: readLimit,
			...exactBounds
		});
		return {
			messages: (result.messages ?? []).filter((message) => {
				if (exactMessageId) return message.ts === exactMessageId;
				return message.ts !== opts.threadId;
			}),
			hasMore: exactMessageId ? false : Boolean(result.has_more)
		};
	}
	const result = await client.conversations.history({
		channel: channelId,
		limit: readLimit,
		...exactBounds
	});
	return {
		messages: (result.messages ?? []).filter((message) => !exactMessageId || message.ts === exactMessageId),
		hasMore: exactMessageId ? false : Boolean(result.has_more)
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
	const token = resolveToken(opts.token, opts.accountId, opts.cfg);
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
export { resolveSlackThreadStarter as _, listSlackEmojis as a, buildSlackEditTextPayload as b, pinSlackMessage as c, removeOwnSlackReactions as d, removeSlackReaction as f, resolveSlackThreadHistory as g, media_exports as h, getSlackMemberInfo as i, reactSlackMessage as l, unpinSlackMessage as m, downloadSlackFile as n, listSlackPins as o, sendSlackMessage as p, editSlackMessage as r, listSlackReactions as s, deleteSlackMessage as t, readSlackMessages as u, MAX_SLACK_MEDIA_FILES as v, formatSlackFileReference as y };
