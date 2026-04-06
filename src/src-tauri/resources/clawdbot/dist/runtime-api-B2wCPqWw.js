import { d as resolveThreadSessionKeys } from "./session-key-D7XpmyVq.js";
import { t as buildOutboundBaseSessionKey } from "./base-session-key-BM8QSZQb.js";
import { t as normalizeOutboundThreadId } from "./routing-Br1fEo8A.js";
import "./secret-input-C8U7qpTM.js";
import { a as parseMentionPrefixOrAtUserTarget, l as requireTargetKind, t as buildMessagingTarget } from "./targets-B_oqkqrL.js";
import "./discord-CTYSqjcM.js";
import "./discord-core-DOd3m5dZ.js";
import "./channel-status-BM83XYut.js";
import { t as normalizeDiscordToken } from "./token-MkG2GNpU.js";
import { o as resolveDiscordAccount } from "./accounts-7Ym6HIvs.js";
import { t as rememberDiscordDirectoryUser } from "./directory-cache-BIA7cG2V.js";
import { n as fetchDiscord } from "./api-llgU5gUi.js";
import { i as normalizeDiscordSlug } from "./allow-list-qE0AJ4XV.js";
//#region extensions/discord/src/directory-live.ts
function normalizeQuery(value) {
	return value?.trim().toLowerCase() ?? "";
}
function buildUserRank(user) {
	return user.bot ? 0 : 1;
}
function resolveDiscordDirectoryAccess(params) {
	const token = normalizeDiscordToken(resolveDiscordAccount({
		cfg: params.cfg,
		accountId: params.accountId
	}).token, "channels.discord.token");
	if (!token) return null;
	return {
		token,
		query: normalizeQuery(params.query)
	};
}
async function listDiscordGuilds(token) {
	return (await fetchDiscord("/users/@me/guilds", token)).filter((guild) => guild.id && guild.name);
}
async function listDiscordDirectoryGroupsLive(params) {
	const access = resolveDiscordDirectoryAccess(params);
	if (!access) return [];
	const { token, query } = access;
	const guilds = await listDiscordGuilds(token);
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
	const access = resolveDiscordDirectoryAccess(params);
	if (!access) return [];
	const { token, query } = access;
	if (!query) return [];
	const guilds = await listDiscordGuilds(token);
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
			rememberDiscordDirectoryUser({
				accountId: params.accountId,
				userId: user.id,
				handles: [
					user.username,
					user.global_name,
					member.nick,
					user.username ? `@${user.username}` : null
				]
			});
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
//#region extensions/discord/src/targets.ts
function parseDiscordTarget(raw, options = {}) {
	const trimmed = raw.trim();
	if (!trimmed) return;
	const userTarget = parseMentionPrefixOrAtUserTarget({
		raw: trimmed,
		mentionPattern: /^<@!?(\d+)>$/,
		prefixes: [
			{
				prefix: "user:",
				kind: "user"
			},
			{
				prefix: "channel:",
				kind: "channel"
			},
			{
				prefix: "discord:",
				kind: "user"
			}
		],
		atUserPattern: /^\d+$/,
		atUserErrorMessage: "Discord DMs require a user id (use user:<id> or a <@id> mention)"
	});
	if (userTarget) return userTarget;
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
		if (match && match.kind === "user") {
			const userId = match.id.replace(/^user:/, "");
			rememberDiscordDirectoryUser({
				accountId: options.accountId,
				userId,
				handles: [
					trimmed,
					match.name,
					match.handle
				]
			});
			return buildMessagingTarget("user", userId, trimmed);
		}
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
//#region extensions/discord/src/outbound-session-route.ts
function resolveDiscordOutboundSessionRoute(params) {
	const parsed = parseDiscordTarget(params.target, { defaultKind: resolveDiscordOutboundTargetKindHint(params) });
	if (!parsed) return null;
	const isDm = parsed.kind === "user";
	const peer = {
		kind: isDm ? "direct" : "channel",
		id: parsed.id
	};
	const baseSessionKey = buildOutboundBaseSessionKey({
		cfg: params.cfg,
		agentId: params.agentId,
		channel: "discord",
		accountId: params.accountId,
		peer
	});
	const explicitThreadId = normalizeOutboundThreadId(params.threadId);
	return {
		sessionKey: resolveThreadSessionKeys({
			baseSessionKey,
			threadId: explicitThreadId ?? normalizeOutboundThreadId(params.replyToId),
			useSuffix: false
		}).sessionKey,
		baseSessionKey,
		peer,
		chatType: isDm ? "direct" : "channel",
		from: isDm ? `discord:${parsed.id}` : `discord:channel:${parsed.id}`,
		to: isDm ? `user:${parsed.id}` : `channel:${parsed.id}`,
		threadId: explicitThreadId ?? void 0
	};
}
function resolveDiscordOutboundTargetKindHint(params) {
	const resolvedKind = params.resolvedTarget?.kind;
	if (resolvedKind === "user") return "user";
	if (resolvedKind === "group" || resolvedKind === "channel") return "channel";
	const target = params.target.trim();
	if (/^channel:/i.test(target)) return "channel";
	if (/^(user:|discord:|@|<@!?)/i.test(target)) return "user";
}
//#endregion
export { listDiscordDirectoryGroupsLive as a, resolveDiscordTarget as i, parseDiscordTarget as n, listDiscordDirectoryPeersLive as o, resolveDiscordChannelId as r, resolveDiscordOutboundSessionRoute as t };
