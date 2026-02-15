import { t as __exportAll } from "./rolldown-runtime-Cbj13DAv.js";
import { b as danger, n as isTruthyEnvValue, o as createSubsystemLogger, w as logVerbose } from "./entry.js";
import { i as loadConfig } from "./config-BJWIHf6x.js";
import { c as resolveTelegramAccount } from "./plugins-DsHRVW6o.js";
import { _ as resolveMarkdownTableMode, i as markdownToIR, r as chunkMarkdownIR, t as loadWebMedia } from "./media-EWF5qDpT.js";
import { t as renderMarkdownWithMarkers } from "./render-DyRjoIgA.js";
import { S as mediaKindFromMime, c as getFileExtension, d as isGifMedia, p as normalizeMimeType } from "./image-ops-BuOO2fiP.js";
import { n as formatErrorMessage, r as formatUncaughtError, t as extractErrorCode } from "./errors-C34O4jLW.js";
import { n as redactSensitiveText } from "./redact-Bt-krp_b.js";
import { i as createTelegramRetryRunner, n as recordChannelActivity } from "./channel-activity-CuiCbmeL.js";
import { n as wrapFetchWithAbortSignal, t as resolveFetch } from "./fetch-Bpep0-d-.js";
import process$1 from "node:process";
import { ProxyAgent, fetch } from "undici";
import * as net$1 from "node:net";
import { Bot, HttpError, InputFile } from "grammy";

//#region src/telegram/targets.ts
function stripTelegramInternalPrefixes(to) {
	let trimmed = to.trim();
	let strippedTelegramPrefix = false;
	while (true) {
		const next = (() => {
			if (/^(telegram|tg):/i.test(trimmed)) {
				strippedTelegramPrefix = true;
				return trimmed.replace(/^(telegram|tg):/i, "").trim();
			}
			if (strippedTelegramPrefix && /^group:/i.test(trimmed)) return trimmed.replace(/^group:/i, "").trim();
			return trimmed;
		})();
		if (next === trimmed) return trimmed;
		trimmed = next;
	}
}
/**
* Parse a Telegram delivery target into chatId and optional topic/thread ID.
*
* Supported formats:
* - `chatId` (plain chat ID, t.me link, @username, or internal prefixes like `telegram:...`)
* - `chatId:topicId` (numeric topic/thread ID)
* - `chatId:topic:topicId` (explicit topic marker; preferred)
*/
function parseTelegramTarget(to) {
	const normalized = stripTelegramInternalPrefixes(to);
	const topicMatch = /^(.+?):topic:(\d+)$/.exec(normalized);
	if (topicMatch) return {
		chatId: topicMatch[1],
		messageThreadId: Number.parseInt(topicMatch[2], 10)
	};
	const colonMatch = /^(.+):(\d+)$/.exec(normalized);
	if (colonMatch) return {
		chatId: colonMatch[1],
		messageThreadId: Number.parseInt(colonMatch[2], 10)
	};
	return { chatId: normalized };
}

//#endregion
//#region src/media/audio.ts
const TELEGRAM_VOICE_AUDIO_EXTENSIONS = new Set([
	".oga",
	".ogg",
	".opus",
	".mp3",
	".m4a"
]);
/**
* MIME types compatible with voice messages.
* Telegram sendVoice supports OGG/Opus, MP3, and M4A.
* https://core.telegram.org/bots/api#sendvoice
*/
const TELEGRAM_VOICE_MIME_TYPES = new Set([
	"audio/ogg",
	"audio/opus",
	"audio/mpeg",
	"audio/mp3",
	"audio/mp4",
	"audio/x-m4a",
	"audio/m4a"
]);
function isTelegramVoiceCompatibleAudio(opts) {
	const mime = normalizeMimeType(opts.contentType);
	if (mime && TELEGRAM_VOICE_MIME_TYPES.has(mime)) return true;
	const fileName = opts.fileName?.trim();
	if (!fileName) return false;
	const ext = getFileExtension(fileName);
	if (!ext) return false;
	return TELEGRAM_VOICE_AUDIO_EXTENSIONS.has(ext);
}
/**
* Backward-compatible alias used across plugin/runtime call sites.
* Keeps existing behavior while making Telegram-specific policy explicit.
*/
function isVoiceCompatibleAudio(opts) {
	return isTelegramVoiceCompatibleAudio(opts);
}

//#endregion
//#region src/infra/diagnostic-flags.ts
const DIAGNOSTICS_ENV = "OPENCLAW_DIAGNOSTICS";
function normalizeFlag(value) {
	return value.trim().toLowerCase();
}
function parseEnvFlags(raw) {
	if (!raw) return [];
	const trimmed = raw.trim();
	if (!trimmed) return [];
	const lowered = trimmed.toLowerCase();
	if ([
		"0",
		"false",
		"off",
		"none"
	].includes(lowered)) return [];
	if ([
		"1",
		"true",
		"all",
		"*"
	].includes(lowered)) return ["*"];
	return trimmed.split(/[,\s]+/).map(normalizeFlag).filter(Boolean);
}
function uniqueFlags(flags) {
	const seen = /* @__PURE__ */ new Set();
	const out = [];
	for (const flag of flags) {
		const normalized = normalizeFlag(flag);
		if (!normalized || seen.has(normalized)) continue;
		seen.add(normalized);
		out.push(normalized);
	}
	return out;
}
function resolveDiagnosticFlags(cfg, env = process.env) {
	const configFlags = Array.isArray(cfg?.diagnostics?.flags) ? cfg?.diagnostics?.flags : [];
	const envFlags = parseEnvFlags(env[DIAGNOSTICS_ENV]);
	return uniqueFlags([...configFlags, ...envFlags]);
}
function matchesDiagnosticFlag(flag, enabledFlags) {
	const target = normalizeFlag(flag);
	if (!target) return false;
	for (const raw of enabledFlags) {
		const enabled = normalizeFlag(raw);
		if (!enabled) continue;
		if (enabled === "*" || enabled === "all") return true;
		if (enabled.endsWith(".*")) {
			const prefix = enabled.slice(0, -2);
			if (target === prefix || target.startsWith(`${prefix}.`)) return true;
		}
		if (enabled.endsWith("*")) {
			const prefix = enabled.slice(0, -1);
			if (target.startsWith(prefix)) return true;
		}
		if (enabled === target) return true;
	}
	return false;
}
function isDiagnosticFlagEnabled(flag, cfg, env = process.env) {
	return matchesDiagnosticFlag(flag, resolveDiagnosticFlags(cfg, env));
}

//#endregion
//#region src/telegram/api-logging.ts
const fallbackLogger = createSubsystemLogger("telegram/api");
function resolveTelegramApiLogger(runtime, logger) {
	if (logger) return logger;
	if (runtime?.error) return runtime.error;
	return (message) => fallbackLogger.error(message);
}
async function withTelegramApiErrorLogging({ operation, fn, runtime, logger, shouldLog }) {
	try {
		return await fn();
	} catch (err) {
		if (!shouldLog || shouldLog(err)) {
			const errText = formatErrorMessage(err);
			resolveTelegramApiLogger(runtime, logger)(danger(`telegram ${operation} failed: ${errText}`));
		}
		throw err;
	}
}

//#endregion
//#region src/channels/location.ts
function resolveLocation(location) {
	const source = location.source ?? (location.isLive ? "live" : location.name || location.address ? "place" : "pin");
	const isLive = Boolean(location.isLive ?? source === "live");
	return {
		...location,
		source,
		isLive
	};
}
function formatAccuracy(accuracy) {
	if (!Number.isFinite(accuracy)) return "";
	return ` ±${Math.round(accuracy ?? 0)}m`;
}
function formatCoords(latitude, longitude) {
	return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
}
function formatLocationText(location) {
	const resolved = resolveLocation(location);
	const coords = formatCoords(resolved.latitude, resolved.longitude);
	const accuracy = formatAccuracy(resolved.accuracy);
	const caption = resolved.caption?.trim();
	let header = "";
	if (resolved.source === "live" || resolved.isLive) header = `🛰 Live location: ${coords}${accuracy}`;
	else if (resolved.name || resolved.address) header = `📍 ${[resolved.name, resolved.address].filter(Boolean).join(" — ")} (${coords}${accuracy})`;
	else header = `📍 ${coords}${accuracy}`;
	return caption ? `${header}\n${caption}` : header;
}
function toLocationContext(location) {
	const resolved = resolveLocation(location);
	return {
		LocationLat: resolved.latitude,
		LocationLon: resolved.longitude,
		LocationAccuracy: resolved.accuracy,
		LocationName: resolved.name,
		LocationAddress: resolved.address,
		LocationSource: resolved.source,
		LocationIsLive: resolved.isLive
	};
}

//#endregion
//#region src/telegram/bot/helpers.ts
const TELEGRAM_GENERAL_TOPIC_ID = 1;
/**
* Resolve the thread ID for Telegram forum topics.
* For non-forum groups, returns undefined even if messageThreadId is present
* (reply threads in regular groups should not create separate sessions).
* For forum groups, returns the topic ID (or General topic ID=1 if unspecified).
*/
function resolveTelegramForumThreadId(params) {
	if (!params.isForum) return;
	if (params.messageThreadId == null) return TELEGRAM_GENERAL_TOPIC_ID;
	return params.messageThreadId;
}
function resolveTelegramThreadSpec(params) {
	if (params.isGroup) return {
		id: resolveTelegramForumThreadId({
			isForum: params.isForum,
			messageThreadId: params.messageThreadId
		}),
		scope: params.isForum ? "forum" : "none"
	};
	if (params.messageThreadId == null) return { scope: "dm" };
	return {
		id: params.messageThreadId,
		scope: "dm"
	};
}
/**
* Build thread params for Telegram API calls (messages, media).
* General forum topic (id=1) must be treated like a regular supergroup send:
* Telegram rejects sendMessage/sendMedia with message_thread_id=1 ("thread not found").
*/
function buildTelegramThreadParams(thread) {
	if (!thread?.id) return;
	const normalized = Math.trunc(thread.id);
	if (normalized === TELEGRAM_GENERAL_TOPIC_ID && thread.scope === "forum") return;
	return { message_thread_id: normalized };
}
/**
* Build thread params for typing indicators (sendChatAction).
* Empirically, General topic (id=1) needs message_thread_id for typing to appear.
*/
function buildTypingThreadParams(messageThreadId) {
	if (messageThreadId == null) return;
	return { message_thread_id: Math.trunc(messageThreadId) };
}
function resolveTelegramStreamMode(telegramCfg) {
	const raw = telegramCfg?.streamMode?.trim().toLowerCase();
	if (raw === "off" || raw === "partial" || raw === "block") return raw;
	return "partial";
}
function buildTelegramGroupPeerId(chatId, messageThreadId) {
	return messageThreadId != null ? `${chatId}:topic:${messageThreadId}` : String(chatId);
}
function buildTelegramGroupFrom(chatId, messageThreadId) {
	return `telegram:group:${buildTelegramGroupPeerId(chatId, messageThreadId)}`;
}
/**
* Build parentPeer for forum topic binding inheritance.
* When a message comes from a forum topic, the peer ID includes the topic suffix
* (e.g., `-1001234567890:topic:99`). To allow bindings configured for the base
* group ID to match, we provide the parent group as `parentPeer` so the routing
* layer can fall back to it when the exact peer doesn't match.
*/
function buildTelegramParentPeer(params) {
	if (!params.isGroup || params.resolvedThreadId == null) return;
	return {
		kind: "group",
		id: String(params.chatId)
	};
}
function buildSenderName(msg) {
	return [msg.from?.first_name, msg.from?.last_name].filter(Boolean).join(" ").trim() || msg.from?.username || void 0;
}
function buildSenderLabel(msg, senderId) {
	const name = buildSenderName(msg);
	const username = msg.from?.username ? `@${msg.from.username}` : void 0;
	let label = name;
	if (name && username) label = `${name} (${username})`;
	else if (!name && username) label = username;
	const fallbackId = (senderId != null && `${senderId}`.trim() ? `${senderId}`.trim() : void 0) ?? (msg.from?.id != null ? String(msg.from.id) : void 0);
	const idPart = fallbackId ? `id:${fallbackId}` : void 0;
	if (label && idPart) return `${label} ${idPart}`;
	if (label) return label;
	return idPart ?? "id:unknown";
}
function buildGroupLabel(msg, chatId, messageThreadId) {
	const title = msg.chat?.title;
	const topicSuffix = messageThreadId != null ? ` topic:${messageThreadId}` : "";
	if (title) return `${title} id:${chatId}${topicSuffix}`;
	return `group:${chatId}${topicSuffix}`;
}
function hasBotMention(msg, botUsername) {
	if ((msg.text ?? msg.caption ?? "").toLowerCase().includes(`@${botUsername}`)) return true;
	const entities = msg.entities ?? msg.caption_entities ?? [];
	for (const ent of entities) {
		if (ent.type !== "mention") continue;
		if ((msg.text ?? msg.caption ?? "").slice(ent.offset, ent.offset + ent.length).toLowerCase() === `@${botUsername}`) return true;
	}
	return false;
}
function expandTextLinks(text, entities) {
	if (!text || !entities?.length) return text;
	const textLinks = entities.filter((entity) => entity.type === "text_link" && Boolean(entity.url)).toSorted((a, b) => b.offset - a.offset);
	if (textLinks.length === 0) return text;
	let result = text;
	for (const entity of textLinks) {
		const markdown = `[${text.slice(entity.offset, entity.offset + entity.length)}](${entity.url})`;
		result = result.slice(0, entity.offset) + markdown + result.slice(entity.offset + entity.length);
	}
	return result;
}
function resolveTelegramReplyId(raw) {
	if (!raw) return;
	const parsed = Number(raw);
	if (!Number.isFinite(parsed)) return;
	return parsed;
}
function describeReplyTarget(msg) {
	const reply = msg.reply_to_message;
	const externalReply = msg.external_reply;
	const quoteText = msg.quote?.text ?? externalReply?.quote?.text;
	let body = "";
	let kind = "reply";
	if (typeof quoteText === "string") {
		body = quoteText.trim();
		if (body) kind = "quote";
	}
	const replyLike = reply ?? externalReply;
	if (!body && replyLike) {
		body = (replyLike.text ?? replyLike.caption ?? "").trim();
		if (!body) if (replyLike.photo) body = "<media:image>";
		else if (replyLike.video) body = "<media:video>";
		else if (replyLike.audio || replyLike.voice) body = "<media:audio>";
		else if (replyLike.document) body = "<media:document>";
		else {
			const locationData = extractTelegramLocation(replyLike);
			if (locationData) body = formatLocationText(locationData);
		}
	}
	if (!body) return null;
	const senderLabel = (replyLike ? buildSenderName(replyLike) : void 0) ?? "unknown sender";
	return {
		id: replyLike?.message_id ? String(replyLike.message_id) : void 0,
		sender: senderLabel,
		body,
		kind
	};
}
function normalizeForwardedUserLabel(user) {
	const name = [user.first_name, user.last_name].filter(Boolean).join(" ").trim();
	const username = user.username?.trim() || void 0;
	const id = String(user.id);
	return {
		display: (name && username ? `${name} (@${username})` : name || (username ? `@${username}` : void 0)) || `user:${id}`,
		name: name || void 0,
		username,
		id
	};
}
function normalizeForwardedChatLabel(chat, fallbackKind) {
	const title = chat.title?.trim() || void 0;
	const username = chat.username?.trim() || void 0;
	const id = String(chat.id);
	return {
		display: title || (username ? `@${username}` : void 0) || `${fallbackKind}:${id}`,
		title,
		username,
		id
	};
}
function buildForwardedContextFromUser(params) {
	const { display, name, username, id } = normalizeForwardedUserLabel(params.user);
	if (!display) return null;
	return {
		from: display,
		date: params.date,
		fromType: params.type,
		fromId: id,
		fromUsername: username,
		fromTitle: name
	};
}
function buildForwardedContextFromHiddenName(params) {
	const trimmed = params.name?.trim();
	if (!trimmed) return null;
	return {
		from: trimmed,
		date: params.date,
		fromType: params.type,
		fromTitle: trimmed
	};
}
function buildForwardedContextFromChat(params) {
	const fallbackKind = params.type === "channel" ? "channel" : "chat";
	const { display, title, username, id } = normalizeForwardedChatLabel(params.chat, fallbackKind);
	if (!display) return null;
	const signature = params.signature?.trim() || void 0;
	const from = signature ? `${display} (${signature})` : display;
	const chatType = params.chat.type?.trim() || void 0;
	return {
		from,
		date: params.date,
		fromType: params.type,
		fromId: id,
		fromUsername: username,
		fromTitle: title,
		fromSignature: signature,
		fromChatType: chatType,
		fromMessageId: params.messageId
	};
}
function resolveForwardOrigin(origin) {
	switch (origin.type) {
		case "user": return buildForwardedContextFromUser({
			user: origin.sender_user,
			date: origin.date,
			type: "user"
		});
		case "hidden_user": return buildForwardedContextFromHiddenName({
			name: origin.sender_user_name,
			date: origin.date,
			type: "hidden_user"
		});
		case "chat": return buildForwardedContextFromChat({
			chat: origin.sender_chat,
			date: origin.date,
			type: "chat",
			signature: origin.author_signature
		});
		case "channel": return buildForwardedContextFromChat({
			chat: origin.chat,
			date: origin.date,
			type: "channel",
			signature: origin.author_signature,
			messageId: origin.message_id
		});
		default: return null;
	}
}
/** Extract forwarded message origin info from Telegram message. */
function normalizeForwardedContext(msg) {
	if (!msg.forward_origin) return null;
	return resolveForwardOrigin(msg.forward_origin);
}
function extractTelegramLocation(msg) {
	const { venue, location } = msg;
	if (venue) return {
		latitude: venue.location.latitude,
		longitude: venue.location.longitude,
		accuracy: venue.location.horizontal_accuracy,
		name: venue.title,
		address: venue.address,
		source: "place",
		isLive: false
	};
	if (location) {
		const isLive = typeof location.live_period === "number" && location.live_period > 0;
		return {
			latitude: location.latitude,
			longitude: location.longitude,
			accuracy: location.horizontal_accuracy,
			source: isLive ? "live" : "pin",
			isLive
		};
	}
	return null;
}

//#endregion
//#region src/telegram/caption.ts
const TELEGRAM_MAX_CAPTION_LENGTH = 1024;
function splitTelegramCaption(text) {
	const trimmed = text?.trim() ?? "";
	if (!trimmed) return {
		caption: void 0,
		followUpText: void 0
	};
	if (trimmed.length > TELEGRAM_MAX_CAPTION_LENGTH) return {
		caption: void 0,
		followUpText: trimmed
	};
	return {
		caption: trimmed,
		followUpText: void 0
	};
}

//#endregion
//#region src/telegram/network-config.ts
const TELEGRAM_DISABLE_AUTO_SELECT_FAMILY_ENV = "OPENCLAW_TELEGRAM_DISABLE_AUTO_SELECT_FAMILY";
const TELEGRAM_ENABLE_AUTO_SELECT_FAMILY_ENV = "OPENCLAW_TELEGRAM_ENABLE_AUTO_SELECT_FAMILY";
function resolveTelegramAutoSelectFamilyDecision(params) {
	const env = params?.env ?? process$1.env;
	const nodeMajor = typeof params?.nodeMajor === "number" ? params.nodeMajor : Number(process$1.versions.node.split(".")[0]);
	if (isTruthyEnvValue(env[TELEGRAM_ENABLE_AUTO_SELECT_FAMILY_ENV])) return {
		value: true,
		source: `env:${TELEGRAM_ENABLE_AUTO_SELECT_FAMILY_ENV}`
	};
	if (isTruthyEnvValue(env[TELEGRAM_DISABLE_AUTO_SELECT_FAMILY_ENV])) return {
		value: false,
		source: `env:${TELEGRAM_DISABLE_AUTO_SELECT_FAMILY_ENV}`
	};
	if (typeof params?.network?.autoSelectFamily === "boolean") return {
		value: params.network.autoSelectFamily,
		source: "config"
	};
	if (Number.isFinite(nodeMajor) && nodeMajor >= 22) return {
		value: false,
		source: "default-node22"
	};
	return { value: null };
}

//#endregion
//#region src/telegram/fetch.ts
let appliedAutoSelectFamily = null;
const log = createSubsystemLogger("telegram/network");
function applyTelegramNetworkWorkarounds(network) {
	const decision = resolveTelegramAutoSelectFamilyDecision({ network });
	if (decision.value === null || decision.value === appliedAutoSelectFamily) return;
	appliedAutoSelectFamily = decision.value;
	if (typeof net$1.setDefaultAutoSelectFamily === "function") try {
		net$1.setDefaultAutoSelectFamily(decision.value);
		const label = decision.source ? ` (${decision.source})` : "";
		log.info(`telegram: autoSelectFamily=${decision.value}${label}`);
	} catch {}
}
function resolveTelegramFetch(proxyFetch, options) {
	applyTelegramNetworkWorkarounds(options?.network);
	if (proxyFetch) return resolveFetch(proxyFetch);
	const fetchImpl = resolveFetch();
	if (!fetchImpl) throw new Error("fetch is not available; set channels.telegram.proxy in config");
	return fetchImpl;
}

//#endregion
//#region src/telegram/format.ts
function escapeHtml(text) {
	return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
function escapeHtmlAttr(text) {
	return escapeHtml(text).replace(/"/g, "&quot;");
}
/**
* File extensions that share TLDs and commonly appear in code/documentation.
* These are wrapped in <code> tags to prevent Telegram from generating
* spurious domain registrar previews.
*
* Only includes extensions that are:
* 1. Commonly used as file extensions in code/docs
* 2. Rarely used as intentional domain references
*
* Excluded: .ai, .io, .tv, .fm (popular domain TLDs like x.ai, vercel.io, github.io)
*/
const FILE_EXTENSIONS_WITH_TLD = new Set([
	"md",
	"go",
	"py",
	"pl",
	"sh",
	"am",
	"at",
	"be",
	"cc"
]);
/** Detects when markdown-it linkify auto-generated a link from a bare filename (e.g. README.md → http://README.md) */
function isAutoLinkedFileRef(href, label) {
	if (href.replace(/^https?:\/\//i, "") !== label) return false;
	const dotIndex = label.lastIndexOf(".");
	if (dotIndex < 1) return false;
	const ext = label.slice(dotIndex + 1).toLowerCase();
	if (!FILE_EXTENSIONS_WITH_TLD.has(ext)) return false;
	const segments = label.split("/");
	if (segments.length > 1) {
		for (let i = 0; i < segments.length - 1; i++) if (segments[i].includes(".")) return false;
	}
	return true;
}
function buildTelegramLink(link, text) {
	const href = link.href.trim();
	if (!href) return null;
	if (link.start === link.end) return null;
	if (isAutoLinkedFileRef(href, text.slice(link.start, link.end))) return null;
	const safeHref = escapeHtmlAttr(href);
	return {
		start: link.start,
		end: link.end,
		open: `<a href="${safeHref}">`,
		close: "</a>"
	};
}
function renderTelegramHtml(ir) {
	return renderMarkdownWithMarkers(ir, {
		styleMarkers: {
			bold: {
				open: "<b>",
				close: "</b>"
			},
			italic: {
				open: "<i>",
				close: "</i>"
			},
			strikethrough: {
				open: "<s>",
				close: "</s>"
			},
			code: {
				open: "<code>",
				close: "</code>"
			},
			code_block: {
				open: "<pre><code>",
				close: "</code></pre>"
			},
			spoiler: {
				open: "<tg-spoiler>",
				close: "</tg-spoiler>"
			},
			blockquote: {
				open: "<blockquote>",
				close: "</blockquote>"
			}
		},
		escapeText: escapeHtml,
		buildLink: buildTelegramLink
	});
}
function markdownToTelegramHtml(markdown, options = {}) {
	const html = renderTelegramHtml(markdownToIR(markdown ?? "", {
		linkify: true,
		enableSpoilers: true,
		headingStyle: "none",
		blockquotePrefix: "",
		tableMode: options.tableMode
	}));
	if (options.wrapFileRefs !== false) return wrapFileReferencesInHtml(html);
	return html;
}
/**
* Wraps standalone file references (with TLD extensions) in <code> tags.
* This prevents Telegram from treating them as URLs and generating
* irrelevant domain registrar previews.
*
* Runs AFTER markdown→HTML conversion to avoid modifying HTML attributes.
* Skips content inside <code>, <pre>, and <a> tags to avoid nesting issues.
*/
/** Escape regex metacharacters in a string */
function escapeRegex(str) {
	return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
const FILE_EXTENSIONS_PATTERN = Array.from(FILE_EXTENSIONS_WITH_TLD).map(escapeRegex).join("|");
const AUTO_LINKED_ANCHOR_PATTERN = /<a\s+href="https?:\/\/([^"]+)"[^>]*>\1<\/a>/gi;
const FILE_REFERENCE_PATTERN = new RegExp(`(^|[^a-zA-Z0-9_\\-/])([a-zA-Z0-9_.\\-./]+\\.(?:${FILE_EXTENSIONS_PATTERN}))(?=$|[^a-zA-Z0-9_\\-/])`, "gi");
const ORPHANED_TLD_PATTERN = new RegExp(`([^a-zA-Z0-9]|^)([A-Za-z]\\.(?:${FILE_EXTENSIONS_PATTERN}))(?=[^a-zA-Z0-9/]|$)`, "g");
const HTML_TAG_PATTERN = /(<\/?)([a-zA-Z][a-zA-Z0-9-]*)\b[^>]*?>/gi;
function wrapStandaloneFileRef(match, prefix, filename) {
	if (filename.startsWith("//")) return match;
	if (/https?:\/\/$/i.test(prefix)) return match;
	return `${prefix}<code>${escapeHtml(filename)}</code>`;
}
function wrapSegmentFileRefs(text, codeDepth, preDepth, anchorDepth) {
	if (!text || codeDepth > 0 || preDepth > 0 || anchorDepth > 0) return text;
	return text.replace(FILE_REFERENCE_PATTERN, wrapStandaloneFileRef).replace(ORPHANED_TLD_PATTERN, (match, prefix, tld) => prefix === ">" ? match : `${prefix}<code>${escapeHtml(tld)}</code>`);
}
function wrapFileReferencesInHtml(html) {
	AUTO_LINKED_ANCHOR_PATTERN.lastIndex = 0;
	const deLinkified = html.replace(AUTO_LINKED_ANCHOR_PATTERN, (_match, label) => {
		if (!isAutoLinkedFileRef(`http://${label}`, label)) return _match;
		return `<code>${escapeHtml(label)}</code>`;
	});
	let codeDepth = 0;
	let preDepth = 0;
	let anchorDepth = 0;
	let result = "";
	let lastIndex = 0;
	HTML_TAG_PATTERN.lastIndex = 0;
	let match;
	while ((match = HTML_TAG_PATTERN.exec(deLinkified)) !== null) {
		const tagStart = match.index;
		const tagEnd = HTML_TAG_PATTERN.lastIndex;
		const isClosing = match[1] === "</";
		const tagName = match[2].toLowerCase();
		const textBefore = deLinkified.slice(lastIndex, tagStart);
		result += wrapSegmentFileRefs(textBefore, codeDepth, preDepth, anchorDepth);
		if (tagName === "code") codeDepth = isClosing ? Math.max(0, codeDepth - 1) : codeDepth + 1;
		else if (tagName === "pre") preDepth = isClosing ? Math.max(0, preDepth - 1) : preDepth + 1;
		else if (tagName === "a") anchorDepth = isClosing ? Math.max(0, anchorDepth - 1) : anchorDepth + 1;
		result += deLinkified.slice(tagStart, tagEnd);
		lastIndex = tagEnd;
	}
	const remainingText = deLinkified.slice(lastIndex);
	result += wrapSegmentFileRefs(remainingText, codeDepth, preDepth, anchorDepth);
	return result;
}
function renderTelegramHtmlText(text, options = {}) {
	if ((options.textMode ?? "markdown") === "html") return text;
	return markdownToTelegramHtml(text, { tableMode: options.tableMode });
}
function markdownToTelegramChunks(markdown, limit, options = {}) {
	return chunkMarkdownIR(markdownToIR(markdown ?? "", {
		linkify: true,
		enableSpoilers: true,
		headingStyle: "none",
		blockquotePrefix: "",
		tableMode: options.tableMode
	}), limit).map((chunk) => ({
		html: wrapFileReferencesInHtml(renderTelegramHtml(chunk)),
		text: chunk.text
	}));
}

//#endregion
//#region src/telegram/network-errors.ts
const RECOVERABLE_ERROR_CODES = new Set([
	"ECONNRESET",
	"ECONNREFUSED",
	"EPIPE",
	"ETIMEDOUT",
	"ESOCKETTIMEDOUT",
	"ENETUNREACH",
	"EHOSTUNREACH",
	"ENOTFOUND",
	"EAI_AGAIN",
	"UND_ERR_CONNECT_TIMEOUT",
	"UND_ERR_HEADERS_TIMEOUT",
	"UND_ERR_BODY_TIMEOUT",
	"UND_ERR_SOCKET",
	"UND_ERR_ABORTED",
	"ECONNABORTED",
	"ERR_NETWORK"
]);
const RECOVERABLE_ERROR_NAMES = new Set([
	"AbortError",
	"TimeoutError",
	"ConnectTimeoutError",
	"HeadersTimeoutError",
	"BodyTimeoutError"
]);
const RECOVERABLE_MESSAGE_SNIPPETS = [
	"fetch failed",
	"typeerror: fetch failed",
	"undici",
	"network error",
	"network request",
	"client network socket disconnected",
	"socket hang up",
	"getaddrinfo",
	"timeout",
	"timed out"
];
function normalizeCode(code) {
	return code?.trim().toUpperCase() ?? "";
}
function getErrorName(err) {
	if (!err || typeof err !== "object") return "";
	return "name" in err ? String(err.name) : "";
}
function getErrorCode(err) {
	const direct = extractErrorCode(err);
	if (direct) return direct;
	if (!err || typeof err !== "object") return;
	const errno = err.errno;
	if (typeof errno === "string") return errno;
	if (typeof errno === "number") return String(errno);
}
function collectErrorCandidates(err) {
	const queue = [err];
	const seen = /* @__PURE__ */ new Set();
	const candidates = [];
	while (queue.length > 0) {
		const current = queue.shift();
		if (current == null || seen.has(current)) continue;
		seen.add(current);
		candidates.push(current);
		if (typeof current === "object") {
			const cause = current.cause;
			if (cause && !seen.has(cause)) queue.push(cause);
			const reason = current.reason;
			if (reason && !seen.has(reason)) queue.push(reason);
			const errors = current.errors;
			if (Array.isArray(errors)) {
				for (const nested of errors) if (nested && !seen.has(nested)) queue.push(nested);
			}
			if (getErrorName(current) === "HttpError") {
				const wrappedError = current.error;
				if (wrappedError && !seen.has(wrappedError)) queue.push(wrappedError);
			}
		}
	}
	return candidates;
}
function isRecoverableTelegramNetworkError(err, options = {}) {
	if (!err) return false;
	const allowMessageMatch = typeof options.allowMessageMatch === "boolean" ? options.allowMessageMatch : options.context !== "send";
	for (const candidate of collectErrorCandidates(err)) {
		const code = normalizeCode(getErrorCode(candidate));
		if (code && RECOVERABLE_ERROR_CODES.has(code)) return true;
		const name = getErrorName(candidate);
		if (name && RECOVERABLE_ERROR_NAMES.has(name)) return true;
		if (allowMessageMatch) {
			const message = formatErrorMessage(candidate).toLowerCase();
			if (message && RECOVERABLE_MESSAGE_SNIPPETS.some((snippet) => message.includes(snippet))) return true;
		}
	}
	return false;
}

//#endregion
//#region src/telegram/proxy.ts
function makeProxyFetch(proxyUrl) {
	const agent = new ProxyAgent(proxyUrl);
	const fetcher = ((input, init) => fetch(input, {
		...init,
		dispatcher: agent
	}));
	return wrapFetchWithAbortSignal(fetcher);
}

//#endregion
//#region src/telegram/sent-message-cache.ts
/**
* In-memory cache of sent message IDs per chat.
* Used to identify bot's own messages for reaction filtering ("own" mode).
*/
const TTL_MS = 1440 * 60 * 1e3;
const sentMessages = /* @__PURE__ */ new Map();
function getChatKey(chatId) {
	return String(chatId);
}
function cleanupExpired(entry) {
	const now = Date.now();
	for (const [msgId, timestamp] of entry.timestamps) if (now - timestamp > TTL_MS) {
		entry.messageIds.delete(msgId);
		entry.timestamps.delete(msgId);
	}
}
/**
* Record a message ID as sent by the bot.
*/
function recordSentMessage(chatId, messageId) {
	const key = getChatKey(chatId);
	let entry = sentMessages.get(key);
	if (!entry) {
		entry = {
			messageIds: /* @__PURE__ */ new Set(),
			timestamps: /* @__PURE__ */ new Map()
		};
		sentMessages.set(key, entry);
	}
	entry.messageIds.add(messageId);
	entry.timestamps.set(messageId, Date.now());
	if (entry.messageIds.size > 100) cleanupExpired(entry);
}
/**
* Check if a message was sent by the bot.
*/
function wasSentByBot(chatId, messageId) {
	const key = getChatKey(chatId);
	const entry = sentMessages.get(key);
	if (!entry) return false;
	cleanupExpired(entry);
	return entry.messageIds.has(messageId);
}

//#endregion
//#region src/telegram/voice.ts
function resolveTelegramVoiceDecision(opts) {
	if (!opts.wantsVoice) return { useVoice: false };
	if (isTelegramVoiceCompatibleAudio(opts)) return { useVoice: true };
	return {
		useVoice: false,
		reason: `media is ${opts.contentType ?? "unknown"} (${opts.fileName ?? "unknown"})`
	};
}
function resolveTelegramVoiceSend(opts) {
	const decision = resolveTelegramVoiceDecision(opts);
	if (decision.reason && opts.logFallback) opts.logFallback(`Telegram voice requested but ${decision.reason}; sending as audio file instead.`);
	return { useVoice: decision.useVoice };
}

//#endregion
//#region src/telegram/send.ts
var send_exports = /* @__PURE__ */ __exportAll({
	buildInlineKeyboard: () => buildInlineKeyboard,
	deleteMessageTelegram: () => deleteMessageTelegram,
	editMessageTelegram: () => editMessageTelegram,
	reactMessageTelegram: () => reactMessageTelegram,
	sendMessageTelegram: () => sendMessageTelegram,
	sendStickerTelegram: () => sendStickerTelegram
});
const PARSE_ERR_RE = /can't parse entities|parse entities|find end of the entity/i;
const THREAD_NOT_FOUND_RE = /400:\s*Bad Request:\s*message thread not found/i;
const diagLogger = createSubsystemLogger("telegram/diagnostic");
function createTelegramHttpLogger(cfg) {
	if (!isDiagnosticFlagEnabled("telegram.http", cfg)) return () => {};
	return (label, err) => {
		if (!(err instanceof HttpError)) return;
		const detail = redactSensitiveText(formatUncaughtError(err.error ?? err));
		diagLogger.warn(`telegram http error (${label}): ${detail}`);
	};
}
function resolveTelegramClientOptions(account) {
	const proxyUrl = account.config.proxy?.trim();
	const fetchImpl = resolveTelegramFetch(proxyUrl ? makeProxyFetch(proxyUrl) : void 0, { network: account.config.network });
	const timeoutSeconds = typeof account.config.timeoutSeconds === "number" && Number.isFinite(account.config.timeoutSeconds) ? Math.max(1, Math.floor(account.config.timeoutSeconds)) : void 0;
	return fetchImpl || timeoutSeconds ? {
		...fetchImpl ? { fetch: fetchImpl } : {},
		...timeoutSeconds ? { timeoutSeconds } : {}
	} : void 0;
}
function resolveToken(explicit, params) {
	if (explicit?.trim()) return explicit.trim();
	if (!params.token) throw new Error(`Telegram bot token missing for account "${params.accountId}" (set channels.telegram.accounts.${params.accountId}.botToken/tokenFile or TELEGRAM_BOT_TOKEN for default).`);
	return params.token.trim();
}
function normalizeChatId(to) {
	const trimmed = to.trim();
	if (!trimmed) throw new Error("Recipient is required for Telegram sends");
	let normalized = stripTelegramInternalPrefixes(trimmed);
	const m = /^https?:\/\/t\.me\/([A-Za-z0-9_]+)$/i.exec(normalized) ?? /^t\.me\/([A-Za-z0-9_]+)$/i.exec(normalized);
	if (m?.[1]) normalized = `@${m[1]}`;
	if (!normalized) throw new Error("Recipient is required for Telegram sends");
	if (normalized.startsWith("@")) return normalized;
	if (/^-?\d+$/.test(normalized)) return normalized;
	if (/^[A-Za-z0-9_]{5,}$/i.test(normalized)) return `@${normalized}`;
	return normalized;
}
function normalizeMessageId(raw) {
	if (typeof raw === "number" && Number.isFinite(raw)) return Math.trunc(raw);
	if (typeof raw === "string") {
		const value = raw.trim();
		if (!value) throw new Error("Message id is required for Telegram actions");
		const parsed = Number.parseInt(value, 10);
		if (Number.isFinite(parsed)) return parsed;
	}
	throw new Error("Message id is required for Telegram actions");
}
function isTelegramThreadNotFoundError(err) {
	return THREAD_NOT_FOUND_RE.test(formatErrorMessage(err));
}
function hasMessageThreadIdParam(params) {
	if (!params) return false;
	const value = params.message_thread_id;
	if (typeof value === "number") return Number.isFinite(value);
	if (typeof value === "string") return value.trim().length > 0;
	return false;
}
function removeMessageThreadIdParam(params) {
	if (!params || !hasMessageThreadIdParam(params)) return params;
	const next = { ...params };
	delete next.message_thread_id;
	return Object.keys(next).length > 0 ? next : void 0;
}
function buildInlineKeyboard(buttons) {
	if (!buttons?.length) return;
	const rows = buttons.map((row) => row.filter((button) => button?.text && button?.callback_data).map((button) => ({
		text: button.text,
		callback_data: button.callback_data
	}))).filter((row) => row.length > 0);
	if (rows.length === 0) return;
	return { inline_keyboard: rows };
}
async function sendMessageTelegram(to, text, opts = {}) {
	const cfg = loadConfig();
	const account = resolveTelegramAccount({
		cfg,
		accountId: opts.accountId
	});
	const token = resolveToken(opts.token, account);
	const target = parseTelegramTarget(to);
	const chatId = normalizeChatId(target.chatId);
	const client = resolveTelegramClientOptions(account);
	const api = opts.api ?? new Bot(token, client ? { client } : void 0).api;
	const mediaUrl = opts.mediaUrl?.trim();
	const replyMarkup = buildInlineKeyboard(opts.buttons);
	const messageThreadId = opts.messageThreadId != null ? opts.messageThreadId : target.messageThreadId;
	const threadIdParams = buildTelegramThreadParams(messageThreadId != null ? {
		id: messageThreadId,
		scope: "forum"
	} : void 0);
	const threadParams = threadIdParams ? { ...threadIdParams } : {};
	const quoteText = opts.quoteText?.trim();
	if (opts.replyToMessageId != null) if (quoteText) threadParams.reply_parameters = {
		message_id: Math.trunc(opts.replyToMessageId),
		quote: quoteText
	};
	else threadParams.reply_to_message_id = Math.trunc(opts.replyToMessageId);
	const hasThreadParams = Object.keys(threadParams).length > 0;
	const request = createTelegramRetryRunner({
		retry: opts.retry,
		configRetry: account.config.retry,
		verbose: opts.verbose,
		shouldRetry: (err) => isRecoverableTelegramNetworkError(err, { context: "send" })
	});
	const logHttpError = createTelegramHttpLogger(cfg);
	const requestWithDiag = (fn, label) => withTelegramApiErrorLogging({
		operation: label ?? "request",
		fn: () => request(fn, label)
	}).catch((err) => {
		logHttpError(label ?? "request", err);
		throw err;
	});
	const wrapChatNotFound = (err) => {
		if (!/400: Bad Request: chat not found/i.test(formatErrorMessage(err))) return err;
		return new Error([
			`Telegram send failed: chat not found (chat_id=${chatId}).`,
			"Likely: bot not started in DM, bot removed from group/channel, group migrated (new -100… id), or wrong bot token.",
			`Input was: ${JSON.stringify(to)}.`
		].join(" "));
	};
	const sendWithThreadFallback = async (params, label, attempt) => {
		try {
			return await attempt(params, label);
		} catch (err) {
			if (!hasMessageThreadIdParam(params) || !isTelegramThreadNotFoundError(err)) throw err;
			if (opts.verbose) console.warn(`telegram ${label} failed with message_thread_id, retrying without thread: ${formatErrorMessage(err)}`);
			return await attempt(removeMessageThreadIdParam(params), `${label}-threadless`);
		}
	};
	const textMode = opts.textMode ?? "markdown";
	const tableMode = resolveMarkdownTableMode({
		cfg,
		channel: "telegram",
		accountId: account.accountId
	});
	const renderHtmlText = (value) => renderTelegramHtmlText(value, {
		textMode,
		tableMode
	});
	const linkPreviewOptions = account.config.linkPreview ?? true ? void 0 : { is_disabled: true };
	const sendTelegramText = async (rawText, params, fallbackText) => {
		return await sendWithThreadFallback(params, "message", async (effectiveParams, label) => {
			const htmlText = renderHtmlText(rawText);
			const baseParams = effectiveParams ? { ...effectiveParams } : {};
			if (linkPreviewOptions) baseParams.link_preview_options = linkPreviewOptions;
			const hasBaseParams = Object.keys(baseParams).length > 0;
			const sendParams = {
				parse_mode: "HTML",
				...baseParams,
				...opts.silent === true ? { disable_notification: true } : {}
			};
			return await requestWithDiag(() => api.sendMessage(chatId, htmlText, sendParams), label).catch(async (err) => {
				const errText = formatErrorMessage(err);
				if (PARSE_ERR_RE.test(errText)) {
					if (opts.verbose) console.warn(`telegram HTML parse failed, retrying as plain text: ${errText}`);
					const fallback = fallbackText ?? rawText;
					const plainParams = hasBaseParams ? baseParams : void 0;
					return await requestWithDiag(() => plainParams ? api.sendMessage(chatId, fallback, plainParams) : api.sendMessage(chatId, fallback), `${label}-plain`).catch((err2) => {
						throw wrapChatNotFound(err2);
					});
				}
				throw wrapChatNotFound(err);
			});
		});
	};
	if (mediaUrl) {
		const media = await loadWebMedia(mediaUrl, opts.maxBytes);
		const kind = mediaKindFromMime(media.contentType ?? void 0);
		const isGif = isGifMedia({
			contentType: media.contentType,
			fileName: media.fileName
		});
		const isVideoNote = kind === "video" && opts.asVideoNote === true;
		const fileName = media.fileName ?? (isGif ? "animation.gif" : inferFilename(kind)) ?? "file";
		const file = new InputFile(media.buffer, fileName);
		let caption;
		let followUpText;
		if (isVideoNote) {
			caption = void 0;
			followUpText = text.trim() ? text : void 0;
		} else {
			const split = splitTelegramCaption(text);
			caption = split.caption;
			followUpText = split.followUpText;
		}
		const htmlCaption = caption ? renderHtmlText(caption) : void 0;
		const needsSeparateText = Boolean(followUpText);
		const baseMediaParams = {
			...hasThreadParams ? threadParams : {},
			...!needsSeparateText && replyMarkup ? { reply_markup: replyMarkup } : {}
		};
		const mediaParams = {
			...htmlCaption ? {
				caption: htmlCaption,
				parse_mode: "HTML"
			} : {},
			...baseMediaParams,
			...opts.silent === true ? { disable_notification: true } : {}
		};
		let result;
		if (isGif) result = await sendWithThreadFallback(mediaParams, "animation", async (effectiveParams, label) => requestWithDiag(() => api.sendAnimation(chatId, file, effectiveParams), label).catch((err) => {
			throw wrapChatNotFound(err);
		}));
		else if (kind === "image") result = await sendWithThreadFallback(mediaParams, "photo", async (effectiveParams, label) => requestWithDiag(() => api.sendPhoto(chatId, file, effectiveParams), label).catch((err) => {
			throw wrapChatNotFound(err);
		}));
		else if (kind === "video") if (isVideoNote) result = await sendWithThreadFallback(mediaParams, "video_note", async (effectiveParams, label) => requestWithDiag(() => api.sendVideoNote(chatId, file, effectiveParams), label).catch((err) => {
			throw wrapChatNotFound(err);
		}));
		else result = await sendWithThreadFallback(mediaParams, "video", async (effectiveParams, label) => requestWithDiag(() => api.sendVideo(chatId, file, effectiveParams), label).catch((err) => {
			throw wrapChatNotFound(err);
		}));
		else if (kind === "audio") {
			const { useVoice } = resolveTelegramVoiceSend({
				wantsVoice: opts.asVoice === true,
				contentType: media.contentType,
				fileName,
				logFallback: logVerbose
			});
			if (useVoice) result = await sendWithThreadFallback(mediaParams, "voice", async (effectiveParams, label) => requestWithDiag(() => api.sendVoice(chatId, file, effectiveParams), label).catch((err) => {
				throw wrapChatNotFound(err);
			}));
			else result = await sendWithThreadFallback(mediaParams, "audio", async (effectiveParams, label) => requestWithDiag(() => api.sendAudio(chatId, file, effectiveParams), label).catch((err) => {
				throw wrapChatNotFound(err);
			}));
		} else result = await sendWithThreadFallback(mediaParams, "document", async (effectiveParams, label) => requestWithDiag(() => api.sendDocument(chatId, file, effectiveParams), label).catch((err) => {
			throw wrapChatNotFound(err);
		}));
		const mediaMessageId = String(result?.message_id ?? "unknown");
		const resolvedChatId = String(result?.chat?.id ?? chatId);
		if (result?.message_id) recordSentMessage(chatId, result.message_id);
		recordChannelActivity({
			channel: "telegram",
			accountId: account.accountId,
			direction: "outbound"
		});
		if (needsSeparateText && followUpText) {
			const textParams = hasThreadParams || replyMarkup ? {
				...threadParams,
				...replyMarkup ? { reply_markup: replyMarkup } : {}
			} : void 0;
			const textRes = await sendTelegramText(followUpText, textParams);
			return {
				messageId: String(textRes?.message_id ?? mediaMessageId),
				chatId: resolvedChatId
			};
		}
		return {
			messageId: mediaMessageId,
			chatId: resolvedChatId
		};
	}
	if (!text || !text.trim()) throw new Error("Message must be non-empty for Telegram sends");
	const res = await sendTelegramText(text, hasThreadParams || replyMarkup ? {
		...threadParams,
		...replyMarkup ? { reply_markup: replyMarkup } : {}
	} : void 0, opts.plainText);
	const messageId = String(res?.message_id ?? "unknown");
	if (res?.message_id) recordSentMessage(chatId, res.message_id);
	recordChannelActivity({
		channel: "telegram",
		accountId: account.accountId,
		direction: "outbound"
	});
	return {
		messageId,
		chatId: String(res?.chat?.id ?? chatId)
	};
}
async function reactMessageTelegram(chatIdInput, messageIdInput, emoji, opts = {}) {
	const cfg = loadConfig();
	const account = resolveTelegramAccount({
		cfg,
		accountId: opts.accountId
	});
	const token = resolveToken(opts.token, account);
	const chatId = normalizeChatId(String(chatIdInput));
	const messageId = normalizeMessageId(messageIdInput);
	const client = resolveTelegramClientOptions(account);
	const api = opts.api ?? new Bot(token, client ? { client } : void 0).api;
	const request = createTelegramRetryRunner({
		retry: opts.retry,
		configRetry: account.config.retry,
		verbose: opts.verbose,
		shouldRetry: (err) => isRecoverableTelegramNetworkError(err, { context: "send" })
	});
	const logHttpError = createTelegramHttpLogger(cfg);
	const requestWithDiag = (fn, label) => withTelegramApiErrorLogging({
		operation: label ?? "request",
		fn: () => request(fn, label)
	}).catch((err) => {
		logHttpError(label ?? "request", err);
		throw err;
	});
	const remove = opts.remove === true;
	const trimmedEmoji = emoji.trim();
	const reactions = remove || !trimmedEmoji ? [] : [{
		type: "emoji",
		emoji: trimmedEmoji
	}];
	if (typeof api.setMessageReaction !== "function") throw new Error("Telegram reactions are unavailable in this bot API.");
	try {
		await requestWithDiag(() => api.setMessageReaction(chatId, messageId, reactions), "reaction");
	} catch (err) {
		const msg = err instanceof Error ? err.message : String(err);
		if (/REACTION_INVALID/i.test(msg)) return {
			ok: false,
			warning: `Reaction unavailable: ${trimmedEmoji}`
		};
		throw err;
	}
	return { ok: true };
}
async function deleteMessageTelegram(chatIdInput, messageIdInput, opts = {}) {
	const cfg = loadConfig();
	const account = resolveTelegramAccount({
		cfg,
		accountId: opts.accountId
	});
	const token = resolveToken(opts.token, account);
	const chatId = normalizeChatId(String(chatIdInput));
	const messageId = normalizeMessageId(messageIdInput);
	const client = resolveTelegramClientOptions(account);
	const api = opts.api ?? new Bot(token, client ? { client } : void 0).api;
	const request = createTelegramRetryRunner({
		retry: opts.retry,
		configRetry: account.config.retry,
		verbose: opts.verbose,
		shouldRetry: (err) => isRecoverableTelegramNetworkError(err, { context: "send" })
	});
	const logHttpError = createTelegramHttpLogger(cfg);
	const requestWithDiag = (fn, label) => withTelegramApiErrorLogging({
		operation: label ?? "request",
		fn: () => request(fn, label)
	}).catch((err) => {
		logHttpError(label ?? "request", err);
		throw err;
	});
	await requestWithDiag(() => api.deleteMessage(chatId, messageId), "deleteMessage");
	logVerbose(`[telegram] Deleted message ${messageId} from chat ${chatId}`);
	return { ok: true };
}
async function editMessageTelegram(chatIdInput, messageIdInput, text, opts = {}) {
	const cfg = opts.cfg ?? loadConfig();
	const account = resolveTelegramAccount({
		cfg,
		accountId: opts.accountId
	});
	const token = resolveToken(opts.token, account);
	const chatId = normalizeChatId(String(chatIdInput));
	const messageId = normalizeMessageId(messageIdInput);
	const client = resolveTelegramClientOptions(account);
	const api = opts.api ?? new Bot(token, client ? { client } : void 0).api;
	const request = createTelegramRetryRunner({
		retry: opts.retry,
		configRetry: account.config.retry,
		verbose: opts.verbose
	});
	const logHttpError = createTelegramHttpLogger(cfg);
	const requestWithDiag = (fn, label) => withTelegramApiErrorLogging({
		operation: label ?? "request",
		fn: () => request(fn, label)
	}).catch((err) => {
		logHttpError(label ?? "request", err);
		throw err;
	});
	const htmlText = renderTelegramHtmlText(text, {
		textMode: opts.textMode ?? "markdown",
		tableMode: resolveMarkdownTableMode({
			cfg,
			channel: "telegram",
			accountId: account.accountId
		})
	});
	const shouldTouchButtons = opts.buttons !== void 0;
	const builtKeyboard = shouldTouchButtons ? buildInlineKeyboard(opts.buttons) : void 0;
	const replyMarkup = shouldTouchButtons ? builtKeyboard ?? { inline_keyboard: [] } : void 0;
	const editParams = { parse_mode: "HTML" };
	if (replyMarkup !== void 0) editParams.reply_markup = replyMarkup;
	await requestWithDiag(() => api.editMessageText(chatId, messageId, htmlText, editParams), "editMessage").catch(async (err) => {
		const errText = formatErrorMessage(err);
		if (PARSE_ERR_RE.test(errText)) {
			if (opts.verbose) console.warn(`telegram HTML parse failed, retrying as plain text: ${errText}`);
			const plainParams = {};
			if (replyMarkup !== void 0) plainParams.reply_markup = replyMarkup;
			return await requestWithDiag(() => Object.keys(plainParams).length > 0 ? api.editMessageText(chatId, messageId, text, plainParams) : api.editMessageText(chatId, messageId, text), "editMessage-plain");
		}
		throw err;
	});
	logVerbose(`[telegram] Edited message ${messageId} in chat ${chatId}`);
	return {
		ok: true,
		messageId: String(messageId),
		chatId
	};
}
function inferFilename(kind) {
	switch (kind) {
		case "image": return "image.jpg";
		case "video": return "video.mp4";
		case "audio": return "audio.ogg";
		default: return "file.bin";
	}
}
/**
* Send a sticker to a Telegram chat by file_id.
* @param to - Chat ID or username (e.g., "123456789" or "@username")
* @param fileId - Telegram file_id of the sticker to send
* @param opts - Optional configuration
*/
async function sendStickerTelegram(to, fileId, opts = {}) {
	if (!fileId?.trim()) throw new Error("Telegram sticker file_id is required");
	const cfg = loadConfig();
	const account = resolveTelegramAccount({
		cfg,
		accountId: opts.accountId
	});
	const token = resolveToken(opts.token, account);
	const target = parseTelegramTarget(to);
	const chatId = normalizeChatId(target.chatId);
	const client = resolveTelegramClientOptions(account);
	const api = opts.api ?? new Bot(token, client ? { client } : void 0).api;
	const messageThreadId = opts.messageThreadId != null ? opts.messageThreadId : target.messageThreadId;
	const threadIdParams = buildTelegramThreadParams(messageThreadId != null ? {
		id: messageThreadId,
		scope: "forum"
	} : void 0);
	const threadParams = threadIdParams ? { ...threadIdParams } : {};
	if (opts.replyToMessageId != null) threadParams.reply_to_message_id = Math.trunc(opts.replyToMessageId);
	const hasThreadParams = Object.keys(threadParams).length > 0;
	const request = createTelegramRetryRunner({
		retry: opts.retry,
		configRetry: account.config.retry,
		verbose: opts.verbose
	});
	const logHttpError = createTelegramHttpLogger(cfg);
	const requestWithDiag = (fn, label) => request(fn, label).catch((err) => {
		logHttpError(label ?? "request", err);
		throw err;
	});
	const wrapChatNotFound = (err) => {
		if (!/400: Bad Request: chat not found/i.test(formatErrorMessage(err))) return err;
		return new Error([
			`Telegram send failed: chat not found (chat_id=${chatId}).`,
			"Likely: bot not started in DM, bot removed from group/channel, group migrated (new -100… id), or wrong bot token.",
			`Input was: ${JSON.stringify(to)}.`
		].join(" "));
	};
	const sendWithThreadFallback = async (params, label, attempt) => {
		try {
			return await attempt(params, label);
		} catch (err) {
			if (!hasMessageThreadIdParam(params) || !isTelegramThreadNotFoundError(err)) throw err;
			if (opts.verbose) console.warn(`telegram ${label} failed with message_thread_id, retrying without thread: ${formatErrorMessage(err)}`);
			return await attempt(removeMessageThreadIdParam(params), `${label}-threadless`);
		}
	};
	const result = await sendWithThreadFallback(hasThreadParams ? threadParams : void 0, "sticker", async (effectiveParams, label) => requestWithDiag(() => api.sendSticker(chatId, fileId.trim(), effectiveParams), label).catch((err) => {
		throw wrapChatNotFound(err);
	}));
	const messageId = String(result?.message_id ?? "unknown");
	const resolvedChatId = String(result?.chat?.id ?? chatId);
	if (result?.message_id) recordSentMessage(chatId, result.message_id);
	recordChannelActivity({
		channel: "telegram",
		accountId: account.accountId,
		direction: "outbound"
	});
	return {
		messageId,
		chatId: resolvedChatId
	};
}

//#endregion
export { normalizeForwardedContext as A, buildTelegramParentPeer as C, expandTextLinks as D, describeReplyTarget as E, formatLocationText as F, toLocationContext as I, withTelegramApiErrorLogging as L, resolveTelegramReplyId as M, resolveTelegramStreamMode as N, extractTelegramLocation as O, resolveTelegramThreadSpec as P, isVoiceCompatibleAudio as R, buildTelegramGroupPeerId as S, buildTypingThreadParams as T, splitTelegramCaption as _, sendMessageTelegram as a, buildSenderName as b, resolveTelegramVoiceSend as c, isRecoverableTelegramNetworkError as d, markdownToTelegramChunks as f, resolveTelegramFetch as g, wrapFileReferencesInHtml as h, reactMessageTelegram as i, resolveTelegramForumThreadId as j, hasBotMention as k, wasSentByBot as l, renderTelegramHtmlText as m, deleteMessageTelegram as n, sendStickerTelegram as o, markdownToTelegramHtml as p, editMessageTelegram as r, send_exports as s, buildInlineKeyboard as t, makeProxyFetch as u, buildGroupLabel as v, buildTelegramThreadParams as w, buildTelegramGroupFrom as x, buildSenderLabel as y, parseTelegramTarget as z };