import { t as __exportAll } from "./rolldown-runtime-Cbj13DAv.js";
import { Q as normalizeDiscordToken, Z as resolveDiscordAccount } from "./image-ops-CQkyIkuI.js";
import { n as loadConfig } from "./config-DAGaFnCt.js";
import { n as ensureTargetId, r as requireTargetKind, t as buildMessagingTarget } from "./targets-B3t7Q-86.js";
import { n as retryAsync, t as resolveRetryConfig } from "./retry-BhlI4gtw.js";
import { a as loadWebMediaRaw, i as loadWebMedia, o as resolveMarkdownTableMode, p as resolveChunkMode, u as chunkMarkdownTextWithMode } from "./ir-XjRYsEjJ.js";
import { t as resolveFetch } from "./fetch-C7ufkwV6.js";
import { n as normalizePollInput, t as normalizePollDurationHours } from "./polls-C_EZXz9S.js";
import { n as recordChannelActivity, r as createDiscordRetryRunner } from "./channel-activity-BHDtnoEK.js";
import { t as convertMarkdownTables } from "./tables-BY2rftQn.js";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import crypto from "node:crypto";
import { ChannelType, PermissionFlagsBits, Routes } from "discord-api-types/v10";
import { RequestClient } from "@buape/carbon";
import { PollLayoutType } from "discord-api-types/payloads/v10";

//#region src/channels/channel-config.ts
function applyChannelMatchMeta(result, match) {
	if (match.matchKey && match.matchSource) {
		result.matchKey = match.matchKey;
		result.matchSource = match.matchSource;
	}
	return result;
}
function resolveChannelMatchConfig(match, resolveEntry) {
	if (!match.entry) return null;
	return applyChannelMatchMeta(resolveEntry(match.entry), match);
}
function buildChannelKeyCandidates(...keys) {
	const seen = /* @__PURE__ */ new Set();
	const candidates = [];
	for (const key of keys) {
		if (typeof key !== "string") continue;
		const trimmed = key.trim();
		if (!trimmed || seen.has(trimmed)) continue;
		seen.add(trimmed);
		candidates.push(trimmed);
	}
	return candidates;
}
function resolveChannelEntryMatch(params) {
	const entries = params.entries ?? {};
	const match = {};
	for (const key of params.keys) {
		if (!Object.prototype.hasOwnProperty.call(entries, key)) continue;
		match.entry = entries[key];
		match.key = key;
		break;
	}
	if (params.wildcardKey && Object.prototype.hasOwnProperty.call(entries, params.wildcardKey)) {
		match.wildcardEntry = entries[params.wildcardKey];
		match.wildcardKey = params.wildcardKey;
	}
	return match;
}
function resolveChannelEntryMatchWithFallback(params) {
	const direct = resolveChannelEntryMatch({
		entries: params.entries,
		keys: params.keys,
		wildcardKey: params.wildcardKey
	});
	if (direct.entry && direct.key) return {
		...direct,
		matchKey: direct.key,
		matchSource: "direct"
	};
	const normalizeKey = params.normalizeKey;
	if (normalizeKey) {
		const normalizedKeys = params.keys.map((key) => normalizeKey(key)).filter(Boolean);
		if (normalizedKeys.length > 0) for (const [entryKey, entry] of Object.entries(params.entries ?? {})) {
			const normalizedEntry = normalizeKey(entryKey);
			if (normalizedEntry && normalizedKeys.includes(normalizedEntry)) return {
				...direct,
				entry,
				key: entryKey,
				matchKey: entryKey,
				matchSource: "direct"
			};
		}
	}
	const parentKeys = params.parentKeys ?? [];
	if (parentKeys.length > 0) {
		const parent = resolveChannelEntryMatch({
			entries: params.entries,
			keys: parentKeys
		});
		if (parent.entry && parent.key) return {
			...direct,
			entry: parent.entry,
			key: parent.key,
			parentEntry: parent.entry,
			parentKey: parent.key,
			matchKey: parent.key,
			matchSource: "parent"
		};
		if (normalizeKey) {
			const normalizedParentKeys = parentKeys.map((key) => normalizeKey(key)).filter(Boolean);
			if (normalizedParentKeys.length > 0) for (const [entryKey, entry] of Object.entries(params.entries ?? {})) {
				const normalizedEntry = normalizeKey(entryKey);
				if (normalizedEntry && normalizedParentKeys.includes(normalizedEntry)) return {
					...direct,
					entry,
					key: entryKey,
					parentEntry: entry,
					parentKey: entryKey,
					matchKey: entryKey,
					matchSource: "parent"
				};
			}
		}
	}
	if (direct.wildcardEntry && direct.wildcardKey) return {
		...direct,
		entry: direct.wildcardEntry,
		key: direct.wildcardKey,
		matchKey: direct.wildcardKey,
		matchSource: "wildcard"
	};
	return direct;
}

//#endregion
//#region src/discord/api.ts
const DISCORD_API_BASE = "https://discord.com/api/v10";
const DISCORD_API_RETRY_DEFAULTS = {
	attempts: 3,
	minDelayMs: 500,
	maxDelayMs: 3e4,
	jitter: .1
};
function parseDiscordApiErrorPayload(text) {
	const trimmed = text.trim();
	if (!trimmed.startsWith("{") || !trimmed.endsWith("}")) return null;
	try {
		const payload = JSON.parse(trimmed);
		if (payload && typeof payload === "object") return payload;
	} catch {
		return null;
	}
	return null;
}
function parseRetryAfterSeconds(text, response) {
	const payload = parseDiscordApiErrorPayload(text);
	const retryAfter = payload && typeof payload.retry_after === "number" && Number.isFinite(payload.retry_after) ? payload.retry_after : void 0;
	if (retryAfter !== void 0) return retryAfter;
	const header = response.headers.get("Retry-After");
	if (!header) return;
	const parsed = Number(header);
	return Number.isFinite(parsed) ? parsed : void 0;
}
function formatRetryAfterSeconds(value) {
	if (value === void 0 || !Number.isFinite(value) || value < 0) return;
	return `${value < 10 ? value.toFixed(1) : Math.round(value).toString()}s`;
}
function formatDiscordApiErrorText(text) {
	const trimmed = text.trim();
	if (!trimmed) return;
	const payload = parseDiscordApiErrorPayload(trimmed);
	if (!payload) return trimmed.startsWith("{") && trimmed.endsWith("}") ? "unknown error" : trimmed;
	const message = typeof payload.message === "string" && payload.message.trim() ? payload.message.trim() : "unknown error";
	const retryAfter = formatRetryAfterSeconds(typeof payload.retry_after === "number" ? payload.retry_after : void 0);
	return retryAfter ? `${message} (retry after ${retryAfter})` : message;
}
var DiscordApiError = class extends Error {
	constructor(message, status, retryAfter) {
		super(message);
		this.status = status;
		this.retryAfter = retryAfter;
	}
};
async function fetchDiscord(path, token, fetcher = fetch, options) {
	const fetchImpl = resolveFetch(fetcher);
	if (!fetchImpl) throw new Error("fetch is not available");
	return retryAsync(async () => {
		const res = await fetchImpl(`${DISCORD_API_BASE}${path}`, { headers: { Authorization: `Bot ${token}` } });
		if (!res.ok) {
			const text = await res.text().catch(() => "");
			const detail = formatDiscordApiErrorText(text);
			const suffix = detail ? `: ${detail}` : "";
			const retryAfter = res.status === 429 ? parseRetryAfterSeconds(text, res) : void 0;
			throw new DiscordApiError(`Discord API ${path} failed (${res.status})${suffix}`, res.status, retryAfter);
		}
		return await res.json();
	}, {
		...resolveRetryConfig(DISCORD_API_RETRY_DEFAULTS, options?.retry),
		label: options?.label ?? path,
		shouldRetry: (err) => err instanceof DiscordApiError && err.status === 429,
		retryAfterMs: (err) => err instanceof DiscordApiError && typeof err.retryAfter === "number" ? err.retryAfter * 1e3 : void 0
	});
}

//#endregion
//#region src/discord/monitor/format.ts
function resolveDiscordSystemLocation(params) {
	const { isDirectMessage, isGroupDm, guild, channelName } = params;
	if (isDirectMessage) return "DM";
	if (isGroupDm) return `Group DM #${channelName}`;
	return guild?.name ? `${guild.name} #${channelName}` : `#${channelName}`;
}
function formatDiscordReactionEmoji(emoji) {
	if (emoji.id && emoji.name) return `${emoji.name}:${emoji.id}`;
	return emoji.name ?? "emoji";
}
function formatDiscordUserTag(user) {
	const discriminator = (user.discriminator ?? "").trim();
	if (discriminator && discriminator !== "0") return `${user.username}#${discriminator}`;
	return user.username ?? user.id;
}
function resolveTimestampMs(timestamp) {
	if (!timestamp) return;
	const parsed = Date.parse(timestamp);
	return Number.isNaN(parsed) ? void 0 : parsed;
}

//#endregion
//#region src/discord/monitor/allow-list.ts
function normalizeDiscordAllowList(raw, prefixes) {
	if (!raw || raw.length === 0) return null;
	const ids = /* @__PURE__ */ new Set();
	const names = /* @__PURE__ */ new Set();
	const allowAll = raw.some((entry) => String(entry).trim() === "*");
	for (const entry of raw) {
		const text = String(entry).trim();
		if (!text || text === "*") continue;
		const normalized = normalizeDiscordSlug(text);
		const maybeId = text.replace(/^<@!?/, "").replace(/>$/, "");
		if (/^\d+$/.test(maybeId)) {
			ids.add(maybeId);
			continue;
		}
		const prefix = prefixes.find((entry) => text.startsWith(entry));
		if (prefix) {
			const candidate = text.slice(prefix.length);
			if (candidate) ids.add(candidate);
			continue;
		}
		if (normalized) names.add(normalized);
	}
	return {
		allowAll,
		ids,
		names
	};
}
function normalizeDiscordSlug(value) {
	return value.trim().toLowerCase().replace(/^#/, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}
function allowListMatches(list, candidate) {
	if (list.allowAll) return true;
	if (candidate.id && list.ids.has(candidate.id)) return true;
	const slug = candidate.name ? normalizeDiscordSlug(candidate.name) : "";
	if (slug && list.names.has(slug)) return true;
	if (candidate.tag && list.names.has(normalizeDiscordSlug(candidate.tag))) return true;
	return false;
}
function resolveDiscordAllowListMatch(params) {
	const { allowList, candidate } = params;
	if (allowList.allowAll) return {
		allowed: true,
		matchKey: "*",
		matchSource: "wildcard"
	};
	if (candidate.id && allowList.ids.has(candidate.id)) return {
		allowed: true,
		matchKey: candidate.id,
		matchSource: "id"
	};
	const nameSlug = candidate.name ? normalizeDiscordSlug(candidate.name) : "";
	if (nameSlug && allowList.names.has(nameSlug)) return {
		allowed: true,
		matchKey: nameSlug,
		matchSource: "name"
	};
	const tagSlug = candidate.tag ? normalizeDiscordSlug(candidate.tag) : "";
	if (tagSlug && allowList.names.has(tagSlug)) return {
		allowed: true,
		matchKey: tagSlug,
		matchSource: "tag"
	};
	return { allowed: false };
}
function resolveDiscordUserAllowed(params) {
	const allowList = normalizeDiscordAllowList(params.allowList, [
		"discord:",
		"user:",
		"pk:"
	]);
	if (!allowList) return true;
	return allowListMatches(allowList, {
		id: params.userId,
		name: params.userName,
		tag: params.userTag
	});
}
function resolveDiscordRoleAllowed(params) {
	const allowList = normalizeDiscordAllowList(params.allowList, ["role:"]);
	if (!allowList) return true;
	if (allowList.allowAll) return true;
	return params.memberRoleIds.some((roleId) => allowList.ids.has(roleId));
}
function resolveDiscordMemberAllowed(params) {
	const hasUserRestriction = Array.isArray(params.userAllowList) && params.userAllowList.length > 0;
	const hasRoleRestriction = Array.isArray(params.roleAllowList) && params.roleAllowList.length > 0;
	if (!hasUserRestriction && !hasRoleRestriction) return true;
	const userOk = hasUserRestriction ? resolveDiscordUserAllowed({
		allowList: params.userAllowList,
		userId: params.userId,
		userName: params.userName,
		userTag: params.userTag
	}) : false;
	const roleOk = hasRoleRestriction ? resolveDiscordRoleAllowed({
		allowList: params.roleAllowList,
		memberRoleIds: params.memberRoleIds
	}) : false;
	return userOk || roleOk;
}
function resolveDiscordOwnerAllowFrom(params) {
	const rawAllowList = params.channelConfig?.users ?? params.guildInfo?.users;
	if (!Array.isArray(rawAllowList) || rawAllowList.length === 0) return;
	const allowList = normalizeDiscordAllowList(rawAllowList, [
		"discord:",
		"user:",
		"pk:"
	]);
	if (!allowList) return;
	const match = resolveDiscordAllowListMatch({
		allowList,
		candidate: {
			id: params.sender.id,
			name: params.sender.name,
			tag: params.sender.tag
		}
	});
	if (!match.allowed || !match.matchKey || match.matchKey === "*") return;
	return [match.matchKey];
}
function resolveDiscordGuildEntry(params) {
	const guild = params.guild;
	const entries = params.guildEntries;
	if (!guild || !entries) return null;
	const byId = entries[guild.id];
	if (byId) return {
		...byId,
		id: guild.id
	};
	const slug = normalizeDiscordSlug(guild.name ?? "");
	const bySlug = entries[slug];
	if (bySlug) return {
		...bySlug,
		id: guild.id,
		slug: slug || bySlug.slug
	};
	const wildcard = entries["*"];
	if (wildcard) return {
		...wildcard,
		id: guild.id,
		slug: slug || wildcard.slug
	};
	return null;
}
function buildDiscordChannelKeys(params) {
	const allowNameMatch = params.allowNameMatch !== false;
	return buildChannelKeyCandidates(params.id, allowNameMatch ? params.slug : void 0, allowNameMatch ? params.name : void 0);
}
function resolveDiscordChannelEntryMatch(channels, params, parentParams) {
	return resolveChannelEntryMatchWithFallback({
		entries: channels,
		keys: buildDiscordChannelKeys(params),
		parentKeys: parentParams ? buildDiscordChannelKeys(parentParams) : void 0,
		wildcardKey: "*"
	});
}
function resolveDiscordChannelConfigEntry(entry) {
	return {
		allowed: entry.allow !== false,
		requireMention: entry.requireMention,
		skills: entry.skills,
		enabled: entry.enabled,
		users: entry.users,
		roles: entry.roles,
		systemPrompt: entry.systemPrompt,
		includeThreadStarter: entry.includeThreadStarter,
		autoThread: entry.autoThread
	};
}
function resolveDiscordChannelConfigWithFallback(params) {
	const { guildInfo, channelId, channelName, channelSlug, parentId, parentName, parentSlug, scope } = params;
	const channels = guildInfo?.channels;
	if (!channels) return null;
	const resolvedParentSlug = parentSlug ?? (parentName ? normalizeDiscordSlug(parentName) : "");
	return resolveChannelMatchConfig(resolveDiscordChannelEntryMatch(channels, {
		id: channelId,
		name: channelName,
		slug: channelSlug,
		allowNameMatch: scope !== "thread"
	}, parentId || parentName || parentSlug ? {
		id: parentId ?? "",
		name: parentName,
		slug: resolvedParentSlug
	} : void 0), resolveDiscordChannelConfigEntry) ?? { allowed: false };
}
function resolveDiscordShouldRequireMention(params) {
	if (!params.isGuildMessage) return false;
	if (params.isAutoThreadOwnedByBot ?? isDiscordAutoThreadOwnedByBot(params)) return false;
	return params.channelConfig?.requireMention ?? params.guildInfo?.requireMention ?? true;
}
function isDiscordAutoThreadOwnedByBot(params) {
	if (!params.isThread) return false;
	if (!params.channelConfig?.autoThread) return false;
	const botId = params.botId?.trim();
	const threadOwnerId = params.threadOwnerId?.trim();
	return Boolean(botId && threadOwnerId && botId === threadOwnerId);
}
function isDiscordGroupAllowedByPolicy(params) {
	const { groupPolicy, guildAllowlisted, channelAllowlistConfigured, channelAllowed } = params;
	if (groupPolicy === "disabled") return false;
	if (groupPolicy === "open") return true;
	if (!guildAllowlisted) return false;
	if (!channelAllowlistConfigured) return true;
	return channelAllowed;
}
function resolveGroupDmAllow(params) {
	const { channels, channelId, channelName, channelSlug } = params;
	if (!channels || channels.length === 0) return true;
	const allowList = new Set(channels.map((entry) => normalizeDiscordSlug(String(entry))));
	const candidates = [
		normalizeDiscordSlug(channelId),
		channelSlug,
		channelName ? normalizeDiscordSlug(channelName) : ""
	].filter(Boolean);
	return allowList.has("*") || candidates.some((candidate) => allowList.has(candidate));
}
function shouldEmitDiscordReactionNotification(params) {
	const mode = params.mode ?? "own";
	if (mode === "off") return false;
	if (mode === "all") return true;
	if (mode === "own") return Boolean(params.botId && params.messageAuthorId === params.botId);
	if (mode === "allowlist") {
		const list = normalizeDiscordAllowList(params.allowlist, [
			"discord:",
			"user:",
			"pk:"
		]);
		if (!list) return false;
		return allowListMatches(list, {
			id: params.userId,
			name: params.userName,
			tag: params.userTag
		});
	}
	return false;
}

//#endregion
//#region src/discord/directory-live.ts
function normalizeQuery(value) {
	return value?.trim().toLowerCase() ?? "";
}
function buildUserRank(user) {
	return user.bot ? 0 : 1;
}
async function listDiscordDirectoryGroupsLive(params) {
	const token = normalizeDiscordToken(resolveDiscordAccount({
		cfg: params.cfg,
		accountId: params.accountId
	}).token);
	if (!token) return [];
	const query = normalizeQuery(params.query);
	const guilds = (await fetchDiscord("/users/@me/guilds", token)).filter((g) => g.id && g.name);
	const rows = [];
	for (const guild of guilds) {
		const channels = await fetchDiscord(`/guilds/${guild.id}/channels`, token);
		for (const channel of channels) {
			const name = channel.name?.trim();
			if (!name) continue;
			if (query && !normalizeDiscordSlug(name).includes(normalizeDiscordSlug(query))) continue;
			rows.push({
				kind: "group",
				id: `channel:${channel.id}`,
				name,
				handle: `#${name}`,
				raw: channel
			});
			if (typeof params.limit === "number" && params.limit > 0 && rows.length >= params.limit) return rows;
		}
	}
	return rows;
}
async function listDiscordDirectoryPeersLive(params) {
	const token = normalizeDiscordToken(resolveDiscordAccount({
		cfg: params.cfg,
		accountId: params.accountId
	}).token);
	if (!token) return [];
	const query = normalizeQuery(params.query);
	if (!query) return [];
	const guilds = (await fetchDiscord("/users/@me/guilds", token)).filter((g) => g.id && g.name);
	const rows = [];
	const limit = typeof params.limit === "number" && params.limit > 0 ? params.limit : 25;
	for (const guild of guilds) {
		const paramsObj = new URLSearchParams({
			query,
			limit: String(Math.min(limit, 100))
		});
		const members = await fetchDiscord(`/guilds/${guild.id}/members/search?${paramsObj.toString()}`, token);
		for (const member of members) {
			const user = member.user;
			if (!user?.id) continue;
			const name = member.nick?.trim() || user.global_name?.trim() || user.username?.trim();
			rows.push({
				kind: "user",
				id: `user:${user.id}`,
				name: name || void 0,
				handle: user.username ? `@${user.username}` : void 0,
				rank: buildUserRank(user),
				raw: member
			});
			if (rows.length >= limit) return rows;
		}
	}
	return rows;
}

//#endregion
//#region src/discord/targets.ts
function parseDiscordTarget(raw, options = {}) {
	const trimmed = raw.trim();
	if (!trimmed) return;
	const mentionMatch = trimmed.match(/^<@!?(\d+)>$/);
	if (mentionMatch) return buildMessagingTarget("user", mentionMatch[1], trimmed);
	if (trimmed.startsWith("user:")) {
		const id = trimmed.slice(5).trim();
		return id ? buildMessagingTarget("user", id, trimmed) : void 0;
	}
	if (trimmed.startsWith("channel:")) {
		const id = trimmed.slice(8).trim();
		return id ? buildMessagingTarget("channel", id, trimmed) : void 0;
	}
	if (trimmed.startsWith("discord:")) {
		const id = trimmed.slice(8).trim();
		return id ? buildMessagingTarget("user", id, trimmed) : void 0;
	}
	if (trimmed.startsWith("@")) return buildMessagingTarget("user", ensureTargetId({
		candidate: trimmed.slice(1).trim(),
		pattern: /^\d+$/,
		errorMessage: "Discord DMs require a user id (use user:<id> or a <@id> mention)"
	}), trimmed);
	if (/^\d+$/.test(trimmed)) {
		if (options.defaultKind) return buildMessagingTarget(options.defaultKind, trimmed, trimmed);
		throw new Error(options.ambiguousMessage ?? `Ambiguous Discord recipient "${trimmed}". Use "user:${trimmed}" for DMs or "channel:${trimmed}" for channel messages.`);
	}
	return buildMessagingTarget("channel", trimmed, trimmed);
}
function resolveDiscordChannelId(raw) {
	return requireTargetKind({
		platform: "Discord",
		target: parseDiscordTarget(raw, { defaultKind: "channel" }),
		kind: "channel"
	});
}
/**
* Resolve a Discord username to user ID using the directory lookup.
* This enables sending DMs by username instead of requiring explicit user IDs.
*
* @param raw - The username or raw target string (e.g., "john.doe")
* @param options - Directory configuration params (cfg, accountId, limit)
* @param parseOptions - Messaging target parsing options (defaults, ambiguity message)
* @returns Parsed MessagingTarget with user ID, or undefined if not found
*/
async function resolveDiscordTarget(raw, options, parseOptions = {}) {
	const trimmed = raw.trim();
	if (!trimmed) return;
	const likelyUsername = isLikelyUsername(trimmed);
	const shouldLookup = isExplicitUserLookup(trimmed, parseOptions) || likelyUsername;
	const directParse = safeParseDiscordTarget(trimmed, parseOptions);
	if (directParse && directParse.kind !== "channel" && !likelyUsername) return directParse;
	if (!shouldLookup) return directParse ?? parseDiscordTarget(trimmed, parseOptions);
	try {
		const match = (await listDiscordDirectoryPeersLive({
			...options,
			query: trimmed,
			limit: 1
		}))[0];
		if (match && match.kind === "user") return buildMessagingTarget("user", match.id.replace(/^user:/, ""), trimmed);
	} catch {}
	return parseDiscordTarget(trimmed, parseOptions);
}
function safeParseDiscordTarget(input, options) {
	try {
		return parseDiscordTarget(input, options);
	} catch {
		return;
	}
}
function isExplicitUserLookup(input, options) {
	if (/^<@!?(\d+)>$/.test(input)) return true;
	if (/^(user:|discord:)/.test(input)) return true;
	if (input.startsWith("@")) return true;
	if (/^\d+$/.test(input)) return options.defaultKind === "user";
	return false;
}
/**
* Check if a string looks like a Discord username (not a mention, prefix, or ID).
* Usernames typically don't start with special characters except underscore.
*/
function isLikelyUsername(input) {
	if (/^(user:|channel:|discord:|@|<@!?)|[\d]+$/.test(input)) return false;
	return true;
}

//#endregion
//#region src/discord/chunk.ts
const DEFAULT_MAX_CHARS = 2e3;
const DEFAULT_MAX_LINES = 17;
const FENCE_RE = /^( {0,3})(`{3,}|~{3,})(.*)$/;
function countLines(text) {
	if (!text) return 0;
	return text.split("\n").length;
}
function parseFenceLine(line) {
	const match = line.match(FENCE_RE);
	if (!match) return null;
	const indent = match[1] ?? "";
	const marker = match[2] ?? "";
	return {
		indent,
		markerChar: marker[0] ?? "`",
		markerLen: marker.length,
		openLine: line
	};
}
function closeFenceLine(openFence) {
	return `${openFence.indent}${openFence.markerChar.repeat(openFence.markerLen)}`;
}
function closeFenceIfNeeded(text, openFence) {
	if (!openFence) return text;
	const closeLine = closeFenceLine(openFence);
	if (!text) return closeLine;
	if (!text.endsWith("\n")) return `${text}\n${closeLine}`;
	return `${text}${closeLine}`;
}
function splitLongLine(line, maxChars, opts) {
	const limit = Math.max(1, Math.floor(maxChars));
	if (line.length <= limit) return [line];
	const out = [];
	let remaining = line;
	while (remaining.length > limit) {
		if (opts.preserveWhitespace) {
			out.push(remaining.slice(0, limit));
			remaining = remaining.slice(limit);
			continue;
		}
		const window = remaining.slice(0, limit);
		let breakIdx = -1;
		for (let i = window.length - 1; i >= 0; i--) if (/\s/.test(window[i])) {
			breakIdx = i;
			break;
		}
		if (breakIdx <= 0) breakIdx = limit;
		out.push(remaining.slice(0, breakIdx));
		remaining = remaining.slice(breakIdx);
	}
	if (remaining.length) out.push(remaining);
	return out;
}
/**
* Chunks outbound Discord text by both character count and (soft) line count,
* while keeping fenced code blocks balanced across chunks.
*/
function chunkDiscordText(text, opts = {}) {
	const maxChars = Math.max(1, Math.floor(opts.maxChars ?? DEFAULT_MAX_CHARS));
	const maxLines = Math.max(1, Math.floor(opts.maxLines ?? DEFAULT_MAX_LINES));
	const body = text ?? "";
	if (!body) return [];
	if (body.length <= maxChars && countLines(body) <= maxLines) return [body];
	const lines = body.split("\n");
	const chunks = [];
	let current = "";
	let currentLines = 0;
	let openFence = null;
	const flush = () => {
		if (!current) return;
		const payload = closeFenceIfNeeded(current, openFence);
		if (payload.trim().length) chunks.push(payload);
		current = "";
		currentLines = 0;
		if (openFence) {
			current = openFence.openLine;
			currentLines = 1;
		}
	};
	for (const originalLine of lines) {
		const fenceInfo = parseFenceLine(originalLine);
		const wasInsideFence = openFence !== null;
		let nextOpenFence = openFence;
		if (fenceInfo) {
			if (!openFence) nextOpenFence = fenceInfo;
			else if (openFence.markerChar === fenceInfo.markerChar && fenceInfo.markerLen >= openFence.markerLen) nextOpenFence = null;
		}
		const reserveChars = nextOpenFence ? closeFenceLine(nextOpenFence).length + 1 : 0;
		const reserveLines = nextOpenFence ? 1 : 0;
		const effectiveMaxChars = maxChars - reserveChars;
		const effectiveMaxLines = maxLines - reserveLines;
		const charLimit = effectiveMaxChars > 0 ? effectiveMaxChars : maxChars;
		const lineLimit = effectiveMaxLines > 0 ? effectiveMaxLines : maxLines;
		const prefixLen = current.length > 0 ? current.length + 1 : 0;
		const segments = splitLongLine(originalLine, Math.max(1, charLimit - prefixLen), { preserveWhitespace: wasInsideFence });
		for (let segIndex = 0; segIndex < segments.length; segIndex++) {
			const segment = segments[segIndex];
			const isLineContinuation = segIndex > 0;
			const addition = `${isLineContinuation ? "" : current.length > 0 ? "\n" : ""}${segment}`;
			const nextLen = current.length + addition.length;
			const nextLines = currentLines + (isLineContinuation ? 0 : 1);
			if ((nextLen > charLimit || nextLines > lineLimit) && current.length > 0) flush();
			if (current.length > 0) {
				current += addition;
				if (!isLineContinuation) currentLines += 1;
			} else {
				current = segment;
				currentLines = 1;
			}
		}
		openFence = nextOpenFence;
	}
	if (current.length) {
		const payload = closeFenceIfNeeded(current, openFence);
		if (payload.trim().length) chunks.push(payload);
	}
	return rebalanceReasoningItalics(text, chunks);
}
function chunkDiscordTextWithMode(text, opts) {
	if ((opts.chunkMode ?? "length") !== "newline") return chunkDiscordText(text, opts);
	const lineChunks = chunkMarkdownTextWithMode(text, Math.max(1, Math.floor(opts.maxChars ?? DEFAULT_MAX_CHARS)), "newline");
	const chunks = [];
	for (const line of lineChunks) {
		const nested = chunkDiscordText(line, opts);
		if (!nested.length && line) {
			chunks.push(line);
			continue;
		}
		chunks.push(...nested);
	}
	return chunks;
}
function rebalanceReasoningItalics(source, chunks) {
	if (chunks.length <= 1) return chunks;
	if (!(source.startsWith("Reasoning:\n_") && source.trimEnd().endsWith("_"))) return chunks;
	const adjusted = [...chunks];
	for (let i = 0; i < adjusted.length; i++) {
		const isLast = i === adjusted.length - 1;
		const current = adjusted[i];
		if (!current.trimEnd().endsWith("_")) adjusted[i] = `${current}_`;
		if (isLast) break;
		const next = adjusted[i + 1];
		const leadingWhitespaceLen = next.length - next.trimStart().length;
		const leadingWhitespace = next.slice(0, leadingWhitespaceLen);
		const nextBody = next.slice(leadingWhitespaceLen);
		if (!nextBody.startsWith("_")) adjusted[i + 1] = `${leadingWhitespace}_${nextBody}`;
	}
	return adjusted;
}

//#endregion
//#region src/discord/send.permissions.ts
const PERMISSION_ENTRIES = Object.entries(PermissionFlagsBits).filter(([, value]) => typeof value === "bigint");
const ALL_PERMISSIONS = PERMISSION_ENTRIES.reduce((acc, [, value]) => acc | value, 0n);
const ADMINISTRATOR_BIT = PermissionFlagsBits.Administrator;
function resolveToken$1(params) {
	const explicit = normalizeDiscordToken(params.explicit);
	if (explicit) return explicit;
	const fallback = normalizeDiscordToken(params.fallbackToken);
	if (!fallback) throw new Error(`Discord bot token missing for account "${params.accountId}" (set discord.accounts.${params.accountId}.token or DISCORD_BOT_TOKEN for default).`);
	return fallback;
}
function resolveRest$1(token, rest) {
	return rest ?? new RequestClient(token);
}
function resolveDiscordRest$1(opts) {
	const account = resolveDiscordAccount({
		cfg: loadConfig(),
		accountId: opts.accountId
	});
	return resolveRest$1(resolveToken$1({
		explicit: opts.token,
		accountId: account.accountId,
		fallbackToken: account.token
	}), opts.rest);
}
function addPermissionBits(base, add) {
	if (!add) return base;
	return base | BigInt(add);
}
function removePermissionBits(base, deny) {
	if (!deny) return base;
	return base & ~BigInt(deny);
}
function bitfieldToPermissions(bitfield) {
	return PERMISSION_ENTRIES.filter(([, value]) => (bitfield & value) === value).map(([name]) => name).toSorted();
}
function hasAdministrator(bitfield) {
	return (bitfield & ADMINISTRATOR_BIT) === ADMINISTRATOR_BIT;
}
function isThreadChannelType(channelType) {
	return channelType === ChannelType.GuildNewsThread || channelType === ChannelType.GuildPublicThread || channelType === ChannelType.GuildPrivateThread;
}
async function fetchBotUserId(rest) {
	const me = await rest.get(Routes.user("@me"));
	if (!me?.id) throw new Error("Failed to resolve bot user id");
	return me.id;
}
async function fetchChannelPermissionsDiscord(channelId, opts = {}) {
	const rest = resolveDiscordRest$1(opts);
	const channel = await rest.get(Routes.channel(channelId));
	const channelType = "type" in channel ? channel.type : void 0;
	const guildId = "guild_id" in channel ? channel.guild_id : void 0;
	if (!guildId) return {
		channelId,
		permissions: [],
		raw: "0",
		isDm: true,
		channelType
	};
	const botId = await fetchBotUserId(rest);
	const [guild, member] = await Promise.all([rest.get(Routes.guild(guildId)), rest.get(Routes.guildMember(guildId, botId))]);
	const rolesById = new Map((guild.roles ?? []).map((role) => [role.id, role]));
	const everyoneRole = rolesById.get(guildId);
	let base = 0n;
	if (everyoneRole?.permissions) base = addPermissionBits(base, everyoneRole.permissions);
	for (const roleId of member.roles ?? []) {
		const role = rolesById.get(roleId);
		if (role?.permissions) base = addPermissionBits(base, role.permissions);
	}
	if (hasAdministrator(base)) return {
		channelId,
		guildId,
		permissions: bitfieldToPermissions(ALL_PERMISSIONS),
		raw: ALL_PERMISSIONS.toString(),
		isDm: false,
		channelType
	};
	let permissions = base;
	const overwrites = "permission_overwrites" in channel ? channel.permission_overwrites ?? [] : [];
	for (const overwrite of overwrites) if (overwrite.id === guildId) {
		permissions = removePermissionBits(permissions, overwrite.deny ?? "0");
		permissions = addPermissionBits(permissions, overwrite.allow ?? "0");
	}
	for (const overwrite of overwrites) if (member.roles?.includes(overwrite.id)) {
		permissions = removePermissionBits(permissions, overwrite.deny ?? "0");
		permissions = addPermissionBits(permissions, overwrite.allow ?? "0");
	}
	for (const overwrite of overwrites) if (overwrite.id === botId) {
		permissions = removePermissionBits(permissions, overwrite.deny ?? "0");
		permissions = addPermissionBits(permissions, overwrite.allow ?? "0");
	}
	return {
		channelId,
		guildId,
		permissions: bitfieldToPermissions(permissions),
		raw: permissions.toString(),
		isDm: false,
		channelType
	};
}

//#endregion
//#region src/discord/send.types.ts
var DiscordSendError = class extends Error {
	constructor(message, opts) {
		super(message);
		this.name = "DiscordSendError";
		if (opts) Object.assign(this, opts);
	}
	toString() {
		return this.message;
	}
};
const DISCORD_MAX_EMOJI_BYTES = 256 * 1024;
const DISCORD_MAX_STICKER_BYTES = 512 * 1024;

//#endregion
//#region src/discord/send.shared.ts
const DISCORD_TEXT_LIMIT = 2e3;
const DISCORD_MAX_STICKERS = 3;
const DISCORD_POLL_MAX_ANSWERS = 10;
const DISCORD_POLL_MAX_DURATION_HOURS = 768;
const DISCORD_MISSING_PERMISSIONS = 50013;
const DISCORD_CANNOT_DM = 50007;
function resolveToken(params) {
	const explicit = normalizeDiscordToken(params.explicit);
	if (explicit) return explicit;
	const fallback = normalizeDiscordToken(params.fallbackToken);
	if (!fallback) throw new Error(`Discord bot token missing for account "${params.accountId}" (set discord.accounts.${params.accountId}.token or DISCORD_BOT_TOKEN for default).`);
	return fallback;
}
function resolveRest(token, rest) {
	return rest ?? new RequestClient(token);
}
function createDiscordClient(opts, cfg = loadConfig()) {
	const account = resolveDiscordAccount({
		cfg,
		accountId: opts.accountId
	});
	const token = resolveToken({
		explicit: opts.token,
		accountId: account.accountId,
		fallbackToken: account.token
	});
	return {
		token,
		rest: resolveRest(token, opts.rest),
		request: createDiscordRetryRunner({
			retry: opts.retry,
			configRetry: account.config.retry,
			verbose: opts.verbose
		})
	};
}
function resolveDiscordRest(opts) {
	return createDiscordClient(opts).rest;
}
function normalizeReactionEmoji(raw) {
	const trimmed = raw.trim();
	if (!trimmed) throw new Error("emoji required");
	const customMatch = trimmed.match(/^<a?:([^:>]+):(\d+)>$/);
	const identifier = customMatch ? `${customMatch[1]}:${customMatch[2]}` : trimmed.replace(/[\uFE0E\uFE0F]/g, "");
	return encodeURIComponent(identifier);
}
/**
* Parse and resolve Discord recipient, including username lookup.
* This enables sending DMs by username (e.g., "john.doe") by querying
* the Discord directory to resolve usernames to user IDs.
*
* @param raw - The recipient string (username, ID, or known format)
* @param accountId - Discord account ID to use for directory lookup
* @returns Parsed DiscordRecipient with resolved user ID if applicable
*/
async function parseAndResolveRecipient(raw, accountId) {
	const cfg = loadConfig();
	const accountInfo = resolveDiscordAccount({
		cfg,
		accountId
	});
	const trimmed = raw.trim();
	const parseOptions = { ambiguousMessage: `Ambiguous Discord recipient "${trimmed}". Use "user:${trimmed}" for DMs or "channel:${trimmed}" for channel messages.` };
	const resolved = await resolveDiscordTarget(raw, {
		cfg,
		accountId: accountInfo.accountId
	}, parseOptions);
	if (resolved) return {
		kind: resolved.kind,
		id: resolved.id
	};
	const parsed = parseDiscordTarget(raw, parseOptions);
	if (!parsed) throw new Error("Recipient is required for Discord sends");
	return {
		kind: parsed.kind,
		id: parsed.id
	};
}
function normalizeStickerIds(raw) {
	const ids = raw.map((entry) => entry.trim()).filter(Boolean);
	if (ids.length === 0) throw new Error("At least one sticker id is required");
	if (ids.length > DISCORD_MAX_STICKERS) throw new Error("Discord supports up to 3 stickers per message");
	return ids;
}
function normalizeEmojiName(raw, label) {
	const name = raw.trim();
	if (!name) throw new Error(`${label} is required`);
	return name;
}
function normalizeDiscordPollInput(input) {
	const poll = normalizePollInput(input, { maxOptions: DISCORD_POLL_MAX_ANSWERS });
	const duration = normalizePollDurationHours(poll.durationHours, {
		defaultHours: 24,
		maxHours: DISCORD_POLL_MAX_DURATION_HOURS
	});
	return {
		question: { text: poll.question },
		answers: poll.options.map((answer) => ({ poll_media: { text: answer } })),
		duration,
		allow_multiselect: poll.maxSelections > 1,
		layout_type: PollLayoutType.Default
	};
}
function getDiscordErrorCode(err) {
	if (!err || typeof err !== "object") return;
	const candidate = "code" in err && err.code !== void 0 ? err.code : "rawError" in err && err.rawError && typeof err.rawError === "object" ? err.rawError.code : void 0;
	if (typeof candidate === "number") return candidate;
	if (typeof candidate === "string" && /^\d+$/.test(candidate)) return Number(candidate);
}
async function buildDiscordSendError(err, ctx) {
	if (err instanceof DiscordSendError) return err;
	const code = getDiscordErrorCode(err);
	if (code === DISCORD_CANNOT_DM) return new DiscordSendError("discord dm failed: user blocks dms or privacy settings disallow it", { kind: "dm-blocked" });
	if (code !== DISCORD_MISSING_PERMISSIONS) return err;
	let missing = [];
	try {
		const permissions = await fetchChannelPermissionsDiscord(ctx.channelId, {
			rest: ctx.rest,
			token: ctx.token
		});
		const current = new Set(permissions.permissions);
		const required = ["ViewChannel", "SendMessages"];
		if (isThreadChannelType(permissions.channelType)) required.push("SendMessagesInThreads");
		if (ctx.hasMedia) required.push("AttachFiles");
		missing = required.filter((permission) => !current.has(permission));
	} catch {}
	return new DiscordSendError(`${missing.length ? `missing permissions in channel ${ctx.channelId}: ${missing.join(", ")}` : `missing permissions in channel ${ctx.channelId}`}. bot might be muted or blocked by role/channel overrides`, {
		kind: "missing-permissions",
		channelId: ctx.channelId,
		missingPermissions: missing
	});
}
async function resolveChannelId(rest, recipient, request) {
	if (recipient.kind === "channel") return { channelId: recipient.id };
	const dmChannel = await request(() => rest.post(Routes.userChannels(), { body: { recipient_id: recipient.id } }), "dm-channel");
	if (!dmChannel?.id) throw new Error("Failed to create Discord DM channel");
	return {
		channelId: dmChannel.id,
		dm: true
	};
}
const SUPPRESS_NOTIFICATIONS_FLAG$1 = 4096;
function buildDiscordTextChunks(text, opts = {}) {
	if (!text) return [];
	const chunks = chunkDiscordTextWithMode(text, {
		maxChars: opts.maxChars ?? DISCORD_TEXT_LIMIT,
		maxLines: opts.maxLinesPerMessage,
		chunkMode: opts.chunkMode
	});
	if (!chunks.length && text) chunks.push(text);
	return chunks;
}
async function sendDiscordText(rest, channelId, text, replyTo, request, maxLinesPerMessage, embeds, chunkMode, silent) {
	if (!text.trim()) throw new Error("Message must be non-empty for Discord sends");
	const messageReference = replyTo ? {
		message_id: replyTo,
		fail_if_not_exists: false
	} : void 0;
	const flags = silent ? SUPPRESS_NOTIFICATIONS_FLAG$1 : void 0;
	const chunks = buildDiscordTextChunks(text, {
		maxLinesPerMessage,
		chunkMode
	});
	if (chunks.length === 1) return await request(() => rest.post(Routes.channelMessages(channelId), { body: {
		content: chunks[0],
		message_reference: messageReference,
		...embeds?.length ? { embeds } : {},
		...flags ? { flags } : {}
	} }), "text");
	let last = null;
	let isFirst = true;
	for (const chunk of chunks) {
		last = await request(() => rest.post(Routes.channelMessages(channelId), { body: {
			content: chunk,
			message_reference: isFirst ? messageReference : void 0,
			...isFirst && embeds?.length ? { embeds } : {},
			...flags ? { flags } : {}
		} }), "text");
		isFirst = false;
	}
	if (!last) throw new Error("Discord send failed (empty chunk result)");
	return last;
}
async function sendDiscordMedia(rest, channelId, text, mediaUrl, replyTo, request, maxLinesPerMessage, embeds, chunkMode, silent) {
	const media = await loadWebMedia(mediaUrl);
	const chunks = text ? buildDiscordTextChunks(text, {
		maxLinesPerMessage,
		chunkMode
	}) : [];
	const caption = chunks[0] ?? "";
	const hasCaption = caption.trim().length > 0;
	const messageReference = replyTo ? {
		message_id: replyTo,
		fail_if_not_exists: false
	} : void 0;
	const flags = silent ? SUPPRESS_NOTIFICATIONS_FLAG$1 : void 0;
	const res = await request(() => rest.post(Routes.channelMessages(channelId), { body: {
		...hasCaption ? { content: caption } : {},
		...messageReference ? { message_reference: messageReference } : {},
		...embeds?.length ? { embeds } : {},
		...flags ? { flags } : {},
		files: [{
			data: media.buffer,
			name: media.fileName ?? "upload"
		}]
	} }), "media");
	for (const chunk of chunks.slice(1)) {
		if (!chunk.trim()) continue;
		await sendDiscordText(rest, channelId, chunk, void 0, request, maxLinesPerMessage, void 0, chunkMode, silent);
	}
	return res;
}
function buildReactionIdentifier(emoji) {
	if (emoji.id && emoji.name) return `${emoji.name}:${emoji.id}`;
	return emoji.name ?? "";
}
function formatReactionEmoji(emoji) {
	return buildReactionIdentifier(emoji);
}

//#endregion
//#region src/discord/send.channels.ts
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
//#region src/discord/send.emojis-stickers.ts
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
//#region src/discord/send.guild.ts
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
//#region src/discord/send.messages.ts
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
	const isForumLike = channelType === ChannelType.GuildForum || channelType === ChannelType.GuildMedia;
	if (isForumLike) body.message = { content: payload.content?.trim() ? payload.content : payload.name };
	if (!payload.messageId && !isForumLike && body.type === void 0) body.type = ChannelType.PublicThread;
	const route = payload.messageId ? Routes.threads(channelId, payload.messageId) : Routes.threads(channelId);
	return await rest.post(route, { body });
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
//#region src/discord/voice-message.ts
const execFileAsync = promisify(execFile);
const DISCORD_VOICE_MESSAGE_FLAG = 8192;
const SUPPRESS_NOTIFICATIONS_FLAG = 4096;
const WAVEFORM_SAMPLES = 256;
/**
* Get audio duration using ffprobe
*/
async function getAudioDuration(filePath) {
	try {
		const { stdout } = await execFileAsync("ffprobe", [
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
	const tempDir = os.tmpdir();
	const tempPcm = path.join(tempDir, `waveform-${crypto.randomUUID()}.raw`);
	try {
		await execFileAsync("ffmpeg", [
			"-y",
			"-i",
			filePath,
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
		try {
			await fs.unlink(tempPcm);
		} catch {}
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
	if (path.extname(filePath).toLowerCase() === ".ogg") try {
		const { stdout } = await execFileAsync("ffprobe", [
			"-v",
			"error",
			"-select_streams",
			"a:0",
			"-show_entries",
			"stream=codec_name",
			"-of",
			"csv=p=0",
			filePath
		]);
		if (stdout.trim().toLowerCase() === "opus") return {
			path: filePath,
			cleanup: false
		};
	} catch {}
	const tempDir = os.tmpdir();
	const outputPath = path.join(tempDir, `voice-${crypto.randomUUID()}.ogg`);
	await execFileAsync("ffmpeg", [
		"-y",
		"-i",
		filePath,
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
async function sendDiscordVoiceMessage(rest, channelId, audioBuffer, metadata, replyTo, request, silent) {
	const filename = "voice-message.ogg";
	const fileSize = audioBuffer.byteLength;
	const uploadUrlResponse = await request(() => rest.post(`/channels/${channelId}/attachments`, { body: { files: [{
		filename,
		file_size: fileSize,
		id: "0"
	}] } }), "voice-upload-url");
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
//#region src/discord/send.outbound.ts
/** Discord thread names are capped at 100 characters. */
const DISCORD_THREAD_NAME_LIMIT = 100;
/** Derive a thread title from the first non-empty line of the message text. */
function deriveForumThreadName(text) {
	return (text.split("\n").find((l) => l.trim())?.trim() ?? "").slice(0, DISCORD_THREAD_NAME_LIMIT) || (/* @__PURE__ */ new Date()).toISOString().slice(0, 16);
}
/** Forum/Media channels cannot receive regular messages; detect them here. */
function isForumLikeType(channelType) {
	return channelType === ChannelType.GuildForum || channelType === ChannelType.GuildMedia;
}
async function sendMessageDiscord(to, text, opts = {}) {
	const cfg = loadConfig();
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
	const textWithTables = convertMarkdownTables(text ?? "", tableMode);
	const { token, rest, request } = createDiscordClient(opts, cfg);
	const { channelId } = await resolveChannelId(rest, await parseAndResolveRecipient(to, opts.accountId), request);
	let channelType;
	try {
		channelType = (await rest.get(Routes.channel(channelId)))?.type;
	} catch {}
	if (isForumLikeType(channelType)) {
		const threadName = deriveForumThreadName(textWithTables);
		const chunks = buildDiscordTextChunks(textWithTables, {
			maxLinesPerMessage: accountInfo.config.maxLinesPerMessage,
			chunkMode
		});
		const starterContent = chunks[0]?.trim() ? chunks[0] : threadName;
		const starterEmbeds = opts.embeds?.length ? opts.embeds : void 0;
		let threadRes;
		try {
			threadRes = await request(() => rest.post(Routes.threads(channelId), { body: {
				name: threadName,
				message: {
					content: starterContent,
					...starterEmbeds ? { embeds: starterEmbeds } : {}
				}
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
				await sendDiscordMedia(rest, threadId, mediaCaption ?? "", opts.mediaUrl, void 0, request, accountInfo.config.maxLinesPerMessage, void 0, chunkMode, opts.silent);
				for (const chunk of afterMediaChunks) await sendDiscordText(rest, threadId, chunk, void 0, request, accountInfo.config.maxLinesPerMessage, void 0, chunkMode, opts.silent);
			} else for (const chunk of remainingChunks) await sendDiscordText(rest, threadId, chunk, void 0, request, accountInfo.config.maxLinesPerMessage, void 0, chunkMode, opts.silent);
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
		return {
			messageId: messageId ? String(messageId) : "unknown",
			channelId: String(resultChannelId ?? channelId)
		};
	}
	let result;
	try {
		if (opts.mediaUrl) result = await sendDiscordMedia(rest, channelId, textWithTables, opts.mediaUrl, opts.replyTo, request, accountInfo.config.maxLinesPerMessage, opts.embeds, chunkMode, opts.silent);
		else result = await sendDiscordText(rest, channelId, textWithTables, opts.replyTo, request, accountInfo.config.maxLinesPerMessage, opts.embeds, chunkMode, opts.silent);
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
	return {
		messageId: result.id ? String(result.id) : "unknown",
		channelId: String(result.channel_id ?? channelId)
	};
}
async function sendStickerDiscord(to, stickerIds, opts = {}) {
	const { rest, request } = createDiscordClient(opts, loadConfig());
	const { channelId } = await resolveChannelId(rest, await parseAndResolveRecipient(to, opts.accountId), request);
	const content = opts.content?.trim();
	const stickers = normalizeStickerIds(stickerIds);
	const res = await request(() => rest.post(Routes.channelMessages(channelId), { body: {
		content: content || void 0,
		sticker_ids: stickers
	} }), "sticker");
	return {
		messageId: res.id ? String(res.id) : "unknown",
		channelId: String(res.channel_id ?? channelId)
	};
}
async function sendPollDiscord(to, poll, opts = {}) {
	const { rest, request } = createDiscordClient(opts, loadConfig());
	const { channelId } = await resolveChannelId(rest, await parseAndResolveRecipient(to, opts.accountId), request);
	const content = opts.content?.trim();
	const payload = normalizeDiscordPollInput(poll);
	const res = await request(() => rest.post(Routes.channelMessages(channelId), { body: {
		content: content || void 0,
		poll: payload
	} }), "poll");
	return {
		messageId: res.id ? String(res.id) : "unknown",
		channelId: String(res.channel_id ?? channelId)
	};
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
	const cfg = loadConfig();
	const accountInfo = resolveDiscordAccount({
		cfg,
		accountId: opts.accountId
	});
	const { token, rest, request } = createDiscordClient(opts, cfg);
	const { channelId } = await resolveChannelId(rest, await parseAndResolveRecipient(to, opts.accountId), request);
	const { path: oggPath, cleanup } = await ensureOggOpus(audioPath);
	try {
		const metadata = await getVoiceMessageMetadata(oggPath);
		const result = await sendDiscordVoiceMessage(rest, channelId, await fs.readFile(oggPath), metadata, opts.replyTo, request, opts.silent);
		recordChannelActivity({
			channel: "discord",
			accountId: accountInfo.accountId,
			direction: "outbound"
		});
		return {
			messageId: result.id ? String(result.id) : "unknown",
			channelId: String(result.channel_id ?? channelId)
		};
	} catch (err) {
		throw await buildDiscordSendError(err, {
			channelId,
			rest,
			token,
			hasMedia: true
		});
	} finally {
		if (cleanup) try {
			await fs.unlink(oggPath);
		} catch {}
	}
}

//#endregion
//#region src/discord/send.reactions.ts
async function reactMessageDiscord(channelId, messageId, emoji, opts = {}) {
	const { rest, request } = createDiscordClient(opts, loadConfig());
	const encoded = normalizeReactionEmoji(emoji);
	await request(() => rest.put(Routes.channelMessageOwnReaction(channelId, messageId, encoded)), "react");
	return { ok: true };
}
async function removeReactionDiscord(channelId, messageId, emoji, opts = {}) {
	const rest = resolveDiscordRest(opts);
	const encoded = normalizeReactionEmoji(emoji);
	await rest.delete(Routes.channelMessageOwnReaction(channelId, messageId, encoded));
	return { ok: true };
}
async function removeOwnReactionsDiscord(channelId, messageId, opts = {}) {
	const rest = resolveDiscordRest(opts);
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
	const rest = resolveDiscordRest(opts);
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
//#region src/discord/send.ts
var send_exports = /* @__PURE__ */ __exportAll({ sendMessageDiscord: () => sendMessageDiscord });

//#endregion
export { resolveDiscordChannelConfigWithFallback as $, removeRoleDiscord as A, setChannelPermissionDiscord as B, fetchChannelInfoDiscord as C, kickMemberDiscord as D, fetchVoiceStatusDiscord as E, createChannelDiscord as F, resolveDiscordChannelId as G, fetchChannelPermissionsDiscord as H, deleteChannelDiscord as I, allowListMatches as J, listDiscordDirectoryGroupsLive as K, editChannelDiscord as L, listGuildEmojisDiscord as M, uploadEmojiDiscord as N, listGuildChannelsDiscord as O, uploadStickerDiscord as P, resolveDiscordAllowListMatch as Q, moveChannelDiscord as R, createScheduledEventDiscord as S, fetchRoleInfoDiscord as T, chunkDiscordTextWithMode as U, createDiscordClient as V, parseDiscordTarget as W, normalizeDiscordAllowList as X, isDiscordGroupAllowedByPolicy as Y, normalizeDiscordSlug as Z, readMessagesDiscord as _, removeReactionDiscord as a, shouldEmitDiscordReactionNotification as at, addRoleDiscord as b, sendStickerDiscord as c, resolveDiscordSystemLocation as ct, deleteMessageDiscord as d, applyChannelMatchMeta as dt, resolveDiscordGuildEntry as et, editMessageDiscord as f, buildChannelKeyCandidates as ft, pinMessageDiscord as g, listThreadsDiscord as h, removeOwnReactionsDiscord as i, resolveGroupDmAllow as it, timeoutMemberDiscord as j, listScheduledEventsDiscord as k, sendVoiceMessageDiscord as l, resolveTimestampMs as lt, listPinsDiscord as m, fetchReactionsDiscord as n, resolveDiscordOwnerAllowFrom as nt, sendMessageDiscord as o, formatDiscordReactionEmoji as ot, fetchMessageDiscord as p, resolveChannelEntryMatchWithFallback as pt, listDiscordDirectoryPeersLive as q, reactMessageDiscord as r, resolveDiscordShouldRequireMention as rt, sendPollDiscord as s, formatDiscordUserTag as st, send_exports as t, resolveDiscordMemberAllowed as tt, createThreadDiscord as u, fetchDiscord as ut, searchMessagesDiscord as v, fetchMemberInfoDiscord as w, banMemberDiscord as x, unpinMessageDiscord as y, removeChannelPermissionDiscord as z };