import { a as resolveSlackAccount, c as resolveSlackBotToken } from "./accounts-DJiceqJx.js";
import { r as parseSlackTarget } from "./target-parsing-CQmv-iSm.js";
import "./targets-B1tYCAr6.js";
import { r as validateSlackBlocksArray } from "./blocks-input-DBKMsIf6.js";
import { i as createSlackWriteClient } from "./client-BfPZ6k8d.js";
import { t as SLACK_TEXT_LIMIT } from "./limits-DeULmw1T.js";
import { i as loadOutboundMediaFromUrl } from "./runtime-api-CRvq4bcp.js";
import { markdownToIR, normalizeLowercaseStringOrEmpty, normalizeOptionalString, renderMarkdownIRChunksWithinLimit, renderMarkdownWithMarkers } from "openclaw/plugin-sdk/text-runtime";
import { resolveTextChunksWithFallback } from "openclaw/plugin-sdk/reply-payload";
import { loadConfig, resolveMarkdownTableMode } from "openclaw/plugin-sdk/config-runtime";
import { logVerbose } from "openclaw/plugin-sdk/runtime-env";
import { withTrustedEnvProxyGuardedFetchMode } from "openclaw/plugin-sdk/fetch-runtime";
import { chunkMarkdownTextWithMode, isSilentReplyText, resolveChunkMode, resolveTextChunkLimit } from "openclaw/plugin-sdk/reply-chunking";
import { fetchWithSsrFGuard } from "openclaw/plugin-sdk/ssrf-runtime";
//#region extensions/slack/src/blocks-fallback.ts
function cleanCandidate(value) {
	if (typeof value !== "string") return;
	const normalized = value.replace(/\s+/g, " ").trim();
	return normalized.length > 0 ? normalized : void 0;
}
function readSectionText(block) {
	return cleanCandidate(block.text?.text);
}
function readHeaderText(block) {
	return cleanCandidate(block.text?.text);
}
function readImageText(block) {
	return cleanCandidate(block.alt_text) ?? cleanCandidate(block.title?.text);
}
function readVideoText(block) {
	return cleanCandidate(block.title?.text) ?? cleanCandidate(block.alt_text);
}
function readContextText(block) {
	if (!Array.isArray(block.elements)) return;
	const textParts = block.elements.map((element) => cleanCandidate(element.text)).filter((value) => Boolean(value));
	return textParts.length > 0 ? textParts.join(" ") : void 0;
}
function buildSlackBlocksFallbackText(blocks) {
	for (const raw of blocks) {
		const block = raw;
		switch (block.type) {
			case "header": {
				const text = readHeaderText(block);
				if (text) return text;
				break;
			}
			case "section": {
				const text = readSectionText(block);
				if (text) return text;
				break;
			}
			case "image": {
				const text = readImageText(block);
				if (text) return text;
				return "Shared an image";
			}
			case "video": {
				const text = readVideoText(block);
				if (text) return text;
				return "Shared a video";
			}
			case "file": return "Shared a file";
			case "context": {
				const text = readContextText(block);
				if (text) return text;
				break;
			}
			default: break;
		}
	}
	return "Shared a Block Kit message";
}
//#endregion
//#region extensions/slack/src/format.ts
function escapeSlackMrkdwnSegment(text) {
	return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
const SLACK_ANGLE_TOKEN_RE = /<[^>\n]+>/g;
function isAllowedSlackAngleToken(token) {
	if (!token.startsWith("<") || !token.endsWith(">")) return false;
	const inner = token.slice(1, -1);
	return inner.startsWith("@") || inner.startsWith("#") || inner.startsWith("!") || inner.startsWith("mailto:") || inner.startsWith("tel:") || inner.startsWith("http://") || inner.startsWith("https://") || inner.startsWith("slack://");
}
function escapeSlackMrkdwnContent(text) {
	if (!text) return "";
	if (!text.includes("&") && !text.includes("<") && !text.includes(">")) return text;
	SLACK_ANGLE_TOKEN_RE.lastIndex = 0;
	const out = [];
	let lastIndex = 0;
	for (let match = SLACK_ANGLE_TOKEN_RE.exec(text); match; match = SLACK_ANGLE_TOKEN_RE.exec(text)) {
		const matchIndex = match.index ?? 0;
		out.push(escapeSlackMrkdwnSegment(text.slice(lastIndex, matchIndex)));
		const token = match[0] ?? "";
		out.push(isAllowedSlackAngleToken(token) ? token : escapeSlackMrkdwnSegment(token));
		lastIndex = matchIndex + token.length;
	}
	out.push(escapeSlackMrkdwnSegment(text.slice(lastIndex)));
	return out.join("");
}
function escapeSlackMrkdwnText(text) {
	if (!text) return "";
	if (!text.includes("&") && !text.includes("<") && !text.includes(">")) return text;
	return text.split("\n").map((line) => {
		if (line.startsWith("> ")) return `> ${escapeSlackMrkdwnContent(line.slice(2))}`;
		return escapeSlackMrkdwnContent(line);
	}).join("\n");
}
function buildSlackLink(link, text) {
	const href = link.href.trim();
	if (!href) return null;
	const trimmedLabel = text.slice(link.start, link.end).trim();
	const comparableHref = href.startsWith("mailto:") ? href.slice(7) : href;
	if (!(trimmedLabel.length > 0 && trimmedLabel !== href && trimmedLabel !== comparableHref)) return null;
	const safeHref = escapeSlackMrkdwnSegment(href);
	return {
		start: link.start,
		end: link.end,
		open: `<${safeHref}|`,
		close: ">"
	};
}
function buildSlackRenderOptions() {
	return {
		styleMarkers: {
			bold: {
				open: "*",
				close: "*"
			},
			italic: {
				open: "_",
				close: "_"
			},
			strikethrough: {
				open: "~",
				close: "~"
			},
			code: {
				open: "`",
				close: "`"
			},
			code_block: {
				open: "```\n",
				close: "```"
			}
		},
		escapeText: escapeSlackMrkdwnText,
		buildLink: buildSlackLink
	};
}
function markdownToSlackMrkdwn(markdown, options = {}) {
	return renderMarkdownWithMarkers(markdownToIR(markdown ?? "", {
		linkify: false,
		autolink: false,
		headingStyle: "bold",
		blockquotePrefix: "> ",
		tableMode: options.tableMode
	}), buildSlackRenderOptions());
}
function normalizeSlackOutboundText(markdown) {
	return markdownToSlackMrkdwn(markdown ?? "");
}
function markdownToSlackMrkdwnChunks(markdown, limit, options = {}) {
	const ir = markdownToIR(markdown ?? "", {
		linkify: false,
		autolink: false,
		headingStyle: "bold",
		blockquotePrefix: "> ",
		tableMode: options.tableMode
	});
	const renderOptions = buildSlackRenderOptions();
	return renderMarkdownIRChunksWithinLimit({
		ir,
		limit,
		renderChunk: (chunk) => renderMarkdownWithMarkers(chunk, renderOptions),
		measureRendered: (rendered) => rendered.length
	}).map(({ rendered }) => rendered);
}
//#endregion
//#region extensions/slack/src/send.ts
const SLACK_UPLOAD_SSRF_POLICY = {
	allowedHostnames: [
		"*.slack.com",
		"*.slack-edge.com",
		"*.slack-files.com"
	],
	allowRfc2544BenchmarkRange: true
};
const SLACK_DM_CHANNEL_CACHE_MAX = 1024;
const slackDmChannelCache = /* @__PURE__ */ new Map();
function hasCustomIdentity(identity) {
	return Boolean(identity?.username || identity?.iconUrl || identity?.iconEmoji);
}
function isSlackCustomizeScopeError(err) {
	if (!(err instanceof Error)) return false;
	const maybeData = err;
	if (normalizeLowercaseStringOrEmpty(maybeData.data?.error) !== "missing_scope") return false;
	if (normalizeLowercaseStringOrEmpty(maybeData.data?.needed)?.includes("chat:write.customize")) return true;
	return [...maybeData.data?.response_metadata?.scopes ?? [], ...maybeData.data?.response_metadata?.acceptedScopes ?? []].map((scope) => normalizeLowercaseStringOrEmpty(scope)).includes("chat:write.customize");
}
async function postSlackMessageBestEffort(params) {
	const basePayload = {
		channel: params.channelId,
		text: params.text,
		thread_ts: params.threadTs,
		...params.blocks?.length ? { blocks: params.blocks } : {}
	};
	const postChatMessage = params.client.chat.postMessage.bind(params.client.chat);
	try {
		if (params.identity?.iconUrl) return await postChatMessage({
			...basePayload,
			...params.identity.username ? { username: params.identity.username } : {},
			icon_url: params.identity.iconUrl
		});
		if (params.identity?.iconEmoji) return await postChatMessage({
			...basePayload,
			...params.identity.username ? { username: params.identity.username } : {},
			icon_emoji: params.identity.iconEmoji
		});
		return await postChatMessage({
			...basePayload,
			...params.identity?.username ? { username: params.identity.username } : {}
		});
	} catch (err) {
		if (!hasCustomIdentity(params.identity) || !isSlackCustomizeScopeError(err)) throw err;
		logVerbose("slack send: missing chat:write.customize, retrying without custom identity");
		return postChatMessage(basePayload);
	}
}
function resolveToken(params) {
	const explicit = resolveSlackBotToken(params.explicit);
	if (explicit) return explicit;
	const fallback = resolveSlackBotToken(params.fallbackToken);
	if (!fallback) {
		logVerbose(`slack send: missing bot token for account=${params.accountId} explicit=${Boolean(params.explicit)} source=${params.fallbackSource ?? "unknown"}`);
		throw new Error(`Slack bot token missing for account "${params.accountId}" (set channels.slack.accounts.${params.accountId}.botToken or SLACK_BOT_TOKEN for default).`);
	}
	return fallback;
}
function parseRecipient(raw) {
	const target = parseSlackTarget(raw);
	if (!target) throw new Error("Recipient is required for Slack sends");
	return {
		kind: target.kind,
		id: target.id
	};
}
function createSlackDmCacheKey(params) {
	return `${params.accountId ?? "default"}:${params.token}:${params.recipientId}`;
}
function setSlackDmChannelCache(key, channelId) {
	if (slackDmChannelCache.has(key)) slackDmChannelCache.delete(key);
	else if (slackDmChannelCache.size >= SLACK_DM_CHANNEL_CACHE_MAX) {
		const oldest = slackDmChannelCache.keys().next().value;
		if (oldest) slackDmChannelCache.delete(oldest);
	}
	slackDmChannelCache.set(key, channelId);
}
async function resolveChannelId(client, recipient, params) {
	if (!(recipient.kind === "user" || /^U[A-Z0-9]+$/i.test(recipient.id))) return { channelId: recipient.id };
	const cacheKey = createSlackDmCacheKey({
		accountId: params.accountId,
		token: params.token,
		recipientId: recipient.id
	});
	const cachedChannelId = slackDmChannelCache.get(cacheKey);
	if (cachedChannelId) return {
		channelId: cachedChannelId,
		isDm: true,
		cacheHit: true
	};
	const channelId = (await client.conversations.open({ users: recipient.id })).channel?.id;
	if (!channelId) throw new Error("Failed to open Slack DM channel");
	setSlackDmChannelCache(cacheKey, channelId);
	return {
		channelId,
		isDm: true,
		cacheHit: false
	};
}
async function uploadSlackFile(params) {
	const { buffer, contentType, fileName } = await loadOutboundMediaFromUrl(params.mediaUrl, {
		maxBytes: params.maxBytes,
		mediaAccess: params.mediaAccess,
		mediaLocalRoots: params.mediaLocalRoots,
		mediaReadFile: params.mediaReadFile
	});
	const uploadFileName = params.uploadFileName ?? fileName ?? "upload";
	const uploadTitle = params.uploadTitle ?? uploadFileName;
	const uploadUrlResp = await params.client.files.getUploadURLExternal({
		filename: uploadFileName,
		length: buffer.length
	});
	if (!uploadUrlResp.ok || !uploadUrlResp.upload_url || !uploadUrlResp.file_id) throw new Error(`Failed to get upload URL: ${uploadUrlResp.error ?? "unknown error"}`);
	const uploadBody = new Uint8Array(buffer);
	const { response: uploadResp, release } = await fetchWithSsrFGuard(withTrustedEnvProxyGuardedFetchMode({
		url: uploadUrlResp.upload_url,
		init: {
			method: "POST",
			...contentType ? { headers: { "Content-Type": contentType } } : {},
			body: uploadBody
		},
		policy: SLACK_UPLOAD_SSRF_POLICY,
		auditContext: "slack-upload-file"
	}));
	try {
		if (!uploadResp.ok) throw new Error(`Failed to upload file: HTTP ${uploadResp.status}`);
	} finally {
		await release();
	}
	const completeResp = await params.client.files.completeUploadExternal({
		files: [{
			id: uploadUrlResp.file_id,
			title: uploadTitle
		}],
		channel_id: params.channelId,
		...params.caption ? { initial_comment: params.caption } : {},
		...params.threadTs ? { thread_ts: params.threadTs } : {}
	});
	if (!completeResp.ok) throw new Error(`Failed to complete upload: ${completeResp.error ?? "unknown error"}`);
	return uploadUrlResp.file_id;
}
async function sendMessageSlack(to, message, opts = {}) {
	const trimmedMessage = normalizeOptionalString(message) ?? "";
	if (isSilentReplyText(trimmedMessage) && !opts.mediaUrl && !opts.blocks) {
		logVerbose("slack send: suppressed NO_REPLY token before API call");
		return {
			messageId: "suppressed",
			channelId: ""
		};
	}
	const blocks = opts.blocks == null ? void 0 : validateSlackBlocksArray(opts.blocks);
	if (!trimmedMessage && !opts.mediaUrl && !blocks) throw new Error("Slack send requires text, blocks, or media");
	const cfg = opts.cfg ?? loadConfig();
	const account = resolveSlackAccount({
		cfg,
		accountId: opts.accountId
	});
	const token = resolveToken({
		explicit: opts.token,
		accountId: account.accountId,
		fallbackToken: account.botToken,
		fallbackSource: account.botTokenSource
	});
	const client = opts.client ?? createSlackWriteClient(token);
	const { channelId } = await resolveChannelId(client, parseRecipient(to), {
		accountId: account.accountId,
		token
	});
	if (blocks) {
		if (opts.mediaUrl) throw new Error("Slack send does not support blocks with mediaUrl");
		return {
			messageId: (await postSlackMessageBestEffort({
				client,
				channelId,
				text: trimmedMessage || buildSlackBlocksFallbackText(blocks),
				threadTs: opts.threadTs,
				identity: opts.identity,
				blocks
			})).ts ?? "unknown",
			channelId
		};
	}
	const textLimit = resolveTextChunkLimit(cfg, "slack", account.accountId, { fallbackLimit: SLACK_TEXT_LIMIT });
	const chunkLimit = Math.min(textLimit, SLACK_TEXT_LIMIT);
	const tableMode = resolveMarkdownTableMode({
		cfg,
		channel: "slack",
		accountId: account.accountId
	});
	const chunkMode = resolveChunkMode(cfg, "slack", account.accountId);
	const resolvedChunks = resolveTextChunksWithFallback(trimmedMessage, (chunkMode === "newline" ? chunkMarkdownTextWithMode(trimmedMessage, chunkLimit, chunkMode) : [trimmedMessage]).flatMap((markdown) => markdownToSlackMrkdwnChunks(markdown, chunkLimit, { tableMode })));
	const mediaMaxBytes = typeof account.config.mediaMaxMb === "number" ? account.config.mediaMaxMb * 1024 * 1024 : void 0;
	let lastMessageId = "";
	if (opts.mediaUrl) {
		const [firstChunk, ...rest] = resolvedChunks;
		lastMessageId = await uploadSlackFile({
			client,
			channelId,
			mediaUrl: opts.mediaUrl,
			mediaAccess: opts.mediaAccess,
			uploadFileName: opts.uploadFileName,
			uploadTitle: opts.uploadTitle,
			mediaLocalRoots: opts.mediaLocalRoots,
			mediaReadFile: opts.mediaReadFile,
			caption: firstChunk,
			threadTs: opts.threadTs,
			maxBytes: mediaMaxBytes
		});
		for (const chunk of rest) lastMessageId = (await postSlackMessageBestEffort({
			client,
			channelId,
			text: chunk,
			threadTs: opts.threadTs,
			identity: opts.identity
		})).ts ?? lastMessageId;
	} else for (const chunk of resolvedChunks.length ? resolvedChunks : [""]) lastMessageId = (await postSlackMessageBestEffort({
		client,
		channelId,
		text: chunk,
		threadTs: opts.threadTs,
		identity: opts.identity
	})).ts ?? lastMessageId;
	return {
		messageId: lastMessageId || "unknown",
		channelId
	};
}
//#endregion
export { buildSlackBlocksFallbackText as i, markdownToSlackMrkdwnChunks as n, normalizeSlackOutboundText as r, sendMessageSlack as t };
