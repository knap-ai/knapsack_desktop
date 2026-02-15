import { t as __exportAll } from "./rolldown-runtime-Cbj13DAv.js";
import { X as logVerbose } from "./exec-DBtWJ4Ld.js";
import { G as resolveSlackAccount, J as resolveSlackBotToken } from "./image-ops-CQkyIkuI.js";
import { n as loadConfig } from "./config-DAGaFnCt.js";
import { n as ensureTargetId, r as requireTargetKind, t as buildMessagingTarget } from "./targets-B3t7Q-86.js";
import { i as loadWebMedia, m as resolveTextChunkLimit, n as markdownToIR, o as resolveMarkdownTableMode, p as resolveChunkMode, t as chunkMarkdownIR, u as chunkMarkdownTextWithMode } from "./ir-XjRYsEjJ.js";
import { t as renderMarkdownWithMarkers } from "./render-CiikiGbn.js";
import { WebClient } from "@slack/web-api";

//#region src/slack/targets.ts
function parseSlackTarget(raw, options = {}) {
	const trimmed = raw.trim();
	if (!trimmed) return;
	const mentionMatch = trimmed.match(/^<@([A-Z0-9]+)>$/i);
	if (mentionMatch) return buildMessagingTarget("user", mentionMatch[1], trimmed);
	if (trimmed.startsWith("user:")) {
		const id = trimmed.slice(5).trim();
		return id ? buildMessagingTarget("user", id, trimmed) : void 0;
	}
	if (trimmed.startsWith("channel:")) {
		const id = trimmed.slice(8).trim();
		return id ? buildMessagingTarget("channel", id, trimmed) : void 0;
	}
	if (trimmed.startsWith("slack:")) {
		const id = trimmed.slice(6).trim();
		return id ? buildMessagingTarget("user", id, trimmed) : void 0;
	}
	if (trimmed.startsWith("@")) return buildMessagingTarget("user", ensureTargetId({
		candidate: trimmed.slice(1).trim(),
		pattern: /^[A-Z0-9]+$/i,
		errorMessage: "Slack DMs require a user id (use user:<id> or <@id>)"
	}), trimmed);
	if (trimmed.startsWith("#")) return buildMessagingTarget("channel", ensureTargetId({
		candidate: trimmed.slice(1).trim(),
		pattern: /^[A-Z0-9]+$/i,
		errorMessage: "Slack channels require a channel id (use channel:<id>)"
	}), trimmed);
	if (options.defaultKind) return buildMessagingTarget(options.defaultKind, trimmed, trimmed);
	return buildMessagingTarget("channel", trimmed, trimmed);
}
function resolveSlackChannelId(raw) {
	return requireTargetKind({
		platform: "Slack",
		target: parseSlackTarget(raw, { defaultKind: "channel" }),
		kind: "channel"
	});
}

//#endregion
//#region src/slack/client.ts
const SLACK_DEFAULT_RETRY_OPTIONS = {
	retries: 2,
	factor: 2,
	minTimeout: 500,
	maxTimeout: 3e3,
	randomize: true
};
function resolveSlackWebClientOptions(options = {}) {
	return {
		...options,
		retryConfig: options.retryConfig ?? SLACK_DEFAULT_RETRY_OPTIONS
	};
}
function createSlackWebClient(token, options = {}) {
	return new WebClient(token, resolveSlackWebClientOptions(options));
}

//#endregion
//#region src/slack/format.ts
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
function markdownToSlackMrkdwnChunks(markdown, limit, options = {}) {
	return chunkMarkdownIR(markdownToIR(markdown ?? "", {
		linkify: false,
		autolink: false,
		headingStyle: "bold",
		blockquotePrefix: "> ",
		tableMode: options.tableMode
	}), limit).map((chunk) => renderMarkdownWithMarkers(chunk, {
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
	}));
}

//#endregion
//#region src/slack/send.ts
var send_exports = /* @__PURE__ */ __exportAll({ sendMessageSlack: () => sendMessageSlack });
const SLACK_TEXT_LIMIT = 4e3;
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
async function resolveChannelId(client, recipient) {
	if (recipient.kind === "channel") return { channelId: recipient.id };
	const channelId = (await client.conversations.open({ users: recipient.id })).channel?.id;
	if (!channelId) throw new Error("Failed to open Slack DM channel");
	return {
		channelId,
		isDm: true
	};
}
async function uploadSlackFile(params) {
	const { buffer, contentType: _contentType, fileName } = await loadWebMedia(params.mediaUrl, params.maxBytes);
	const basePayload = {
		channel_id: params.channelId,
		file: buffer,
		filename: fileName,
		...params.caption ? { initial_comment: params.caption } : {}
	};
	const payload = params.threadTs ? {
		...basePayload,
		thread_ts: params.threadTs
	} : basePayload;
	const parsed = await params.client.files.uploadV2(payload);
	return parsed.files?.[0]?.id ?? parsed.file?.id ?? parsed.files?.[0]?.name ?? parsed.file?.name ?? "unknown";
}
async function sendMessageSlack(to, message, opts = {}) {
	const trimmedMessage = message?.trim() ?? "";
	if (!trimmedMessage && !opts.mediaUrl) throw new Error("Slack send requires text or media");
	const cfg = loadConfig();
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
	const client = opts.client ?? createSlackWebClient(token);
	const { channelId } = await resolveChannelId(client, parseRecipient(to));
	const textLimit = resolveTextChunkLimit(cfg, "slack", account.accountId);
	const chunkLimit = Math.min(textLimit, SLACK_TEXT_LIMIT);
	const tableMode = resolveMarkdownTableMode({
		cfg,
		channel: "slack",
		accountId: account.accountId
	});
	const chunkMode = resolveChunkMode(cfg, "slack", account.accountId);
	const chunks = (chunkMode === "newline" ? chunkMarkdownTextWithMode(trimmedMessage, chunkLimit, chunkMode) : [trimmedMessage]).flatMap((markdown) => markdownToSlackMrkdwnChunks(markdown, chunkLimit, { tableMode }));
	if (!chunks.length && trimmedMessage) chunks.push(trimmedMessage);
	const mediaMaxBytes = typeof account.config.mediaMaxMb === "number" ? account.config.mediaMaxMb * 1024 * 1024 : void 0;
	let lastMessageId = "";
	if (opts.mediaUrl) {
		const [firstChunk, ...rest] = chunks;
		lastMessageId = await uploadSlackFile({
			client,
			channelId,
			mediaUrl: opts.mediaUrl,
			caption: firstChunk,
			threadTs: opts.threadTs,
			maxBytes: mediaMaxBytes
		});
		for (const chunk of rest) lastMessageId = (await client.chat.postMessage({
			channel: channelId,
			text: chunk,
			thread_ts: opts.threadTs
		})).ts ?? lastMessageId;
	} else for (const chunk of chunks.length ? chunks : [""]) lastMessageId = (await client.chat.postMessage({
		channel: channelId,
		text: chunk,
		thread_ts: opts.threadTs
	})).ts ?? lastMessageId;
	return {
		messageId: lastMessageId || "unknown",
		channelId
	};
}

//#endregion
export { resolveSlackWebClientOptions as a, createSlackWebClient as i, send_exports as n, parseSlackTarget as o, markdownToSlackMrkdwnChunks as r, resolveSlackChannelId as s, sendMessageSlack as t };