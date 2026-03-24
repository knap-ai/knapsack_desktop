import { Qc as createSlackWebClient } from "./pi-embedded-CbCYZxIb.js";
//#region extensions/slack/src/resolve-allowlist-common.ts
function readSlackNextCursor(response) {
	const next = response.response_metadata?.next_cursor?.trim();
	return next ? next : void 0;
}
async function collectSlackCursorItems(params) {
	const items = [];
	let cursor;
	do {
		const response = await params.fetchPage(cursor);
		items.push(...params.collectPageItems(response));
		cursor = readSlackNextCursor(response);
	} while (cursor);
	return items;
}
function resolveSlackAllowlistEntries(params) {
	const results = [];
	for (const input of params.entries) {
		const parsed = params.parseInput(input);
		if (parsed.id) {
			const match = params.findById(params.lookup, parsed.id);
			results.push(params.buildIdResolved({
				input,
				parsed,
				match
			}));
			continue;
		}
		const resolved = params.resolveNonId({
			input,
			parsed,
			lookup: params.lookup
		});
		if (resolved) {
			results.push(resolved);
			continue;
		}
		results.push(params.buildUnresolved(input));
	}
	return results;
}
//#endregion
//#region extensions/slack/src/resolve-channels.ts
function parseSlackChannelMention(raw) {
	const trimmed = raw.trim();
	if (!trimmed) return {};
	const mention = trimmed.match(/^<#([A-Z0-9]+)(?:\|([^>]+))?>$/i);
	if (mention) return {
		id: mention[1]?.toUpperCase(),
		name: mention[2]?.trim()
	};
	const prefixed = trimmed.replace(/^(slack:|channel:)/i, "");
	if (/^[CG][A-Z0-9]+$/i.test(prefixed)) return { id: prefixed.toUpperCase() };
	const name = prefixed.replace(/^#/, "").trim();
	return name ? { name } : {};
}
async function listSlackChannels(client) {
	return collectSlackCursorItems({
		fetchPage: async (cursor) => await client.conversations.list({
			types: "public_channel,private_channel",
			exclude_archived: false,
			limit: 1e3,
			cursor
		}),
		collectPageItems: (res) => (res.channels ?? []).map((channel) => {
			const id = channel.id?.trim();
			const name = channel.name?.trim();
			if (!id || !name) return null;
			return {
				id,
				name,
				archived: Boolean(channel.is_archived),
				isPrivate: Boolean(channel.is_private)
			};
		}).filter(Boolean)
	});
}
function resolveByName(name, channels) {
	const target = name.trim().toLowerCase();
	if (!target) return;
	const matches = channels.filter((channel) => channel.name.toLowerCase() === target);
	if (matches.length === 0) return;
	return matches.find((channel) => !channel.archived) ?? matches[0];
}
async function resolveSlackChannelAllowlist(params) {
	const channels = await listSlackChannels(params.client ?? createSlackWebClient(params.token));
	return resolveSlackAllowlistEntries({
		entries: params.entries,
		lookup: channels,
		parseInput: parseSlackChannelMention,
		findById: (lookup, id) => lookup.find((channel) => channel.id === id),
		buildIdResolved: ({ input, parsed, match }) => ({
			input,
			resolved: true,
			id: parsed.id,
			name: match?.name ?? parsed.name,
			archived: match?.archived
		}),
		resolveNonId: ({ input, parsed, lookup }) => {
			if (!parsed.name) return;
			const match = resolveByName(parsed.name, lookup);
			if (!match) return;
			return {
				input,
				resolved: true,
				id: match.id,
				name: match.name,
				archived: match.archived
			};
		},
		buildUnresolved: (input) => ({
			input,
			resolved: false
		})
	});
}
//#endregion
//#region extensions/slack/src/resolve-users.ts
function parseSlackUserInput(raw) {
	const trimmed = raw.trim();
	if (!trimmed) return {};
	const mention = trimmed.match(/^<@([A-Z0-9]+)>$/i);
	if (mention) return { id: mention[1]?.toUpperCase() };
	const prefixed = trimmed.replace(/^(slack:|user:)/i, "");
	if (/^[A-Z][A-Z0-9]+$/i.test(prefixed)) return { id: prefixed.toUpperCase() };
	if (trimmed.includes("@") && !trimmed.startsWith("@")) return { email: trimmed.toLowerCase() };
	const name = trimmed.replace(/^@/, "").trim();
	return name ? { name } : {};
}
async function listSlackUsers(client) {
	return collectSlackCursorItems({
		fetchPage: async (cursor) => await client.users.list({
			limit: 200,
			cursor
		}),
		collectPageItems: (res) => (res.members ?? []).map((member) => {
			const id = member.id?.trim();
			const name = member.name?.trim();
			if (!id || !name) return null;
			const profile = member.profile ?? {};
			return {
				id,
				name,
				displayName: profile.display_name?.trim() || void 0,
				realName: profile.real_name?.trim() || member.real_name?.trim() || void 0,
				email: profile.email?.trim()?.toLowerCase() || void 0,
				deleted: Boolean(member.deleted),
				isBot: Boolean(member.is_bot),
				isAppUser: Boolean(member.is_app_user)
			};
		}).filter(Boolean)
	});
}
function scoreSlackUser(user, match) {
	let score = 0;
	if (!user.deleted) score += 3;
	if (!user.isBot && !user.isAppUser) score += 2;
	if (match.email && user.email === match.email) score += 5;
	if (match.name) {
		const target = match.name.toLowerCase();
		if ([
			user.name,
			user.displayName,
			user.realName
		].map((value) => value?.toLowerCase()).filter(Boolean).some((value) => value === target)) score += 2;
	}
	return score;
}
function resolveSlackUserFromMatches(input, matches, parsed) {
	const best = matches.map((user) => ({
		user,
		score: scoreSlackUser(user, parsed)
	})).toSorted((a, b) => b.score - a.score)[0]?.user ?? matches[0];
	return {
		input,
		resolved: true,
		id: best.id,
		name: best.displayName ?? best.realName ?? best.name,
		email: best.email,
		deleted: best.deleted,
		isBot: best.isBot,
		note: matches.length > 1 ? "multiple matches; chose best" : void 0
	};
}
async function resolveSlackUserAllowlist(params) {
	const users = await listSlackUsers(params.client ?? createSlackWebClient(params.token));
	return resolveSlackAllowlistEntries({
		entries: params.entries,
		lookup: users,
		parseInput: parseSlackUserInput,
		findById: (lookup, id) => lookup.find((user) => user.id === id),
		buildIdResolved: ({ input, parsed, match }) => ({
			input,
			resolved: true,
			id: parsed.id,
			name: match?.displayName ?? match?.realName ?? match?.name,
			email: match?.email,
			deleted: match?.deleted,
			isBot: match?.isBot
		}),
		resolveNonId: ({ input, parsed, lookup }) => {
			if (parsed.email) {
				const matches = lookup.filter((user) => user.email === parsed.email);
				if (matches.length > 0) return resolveSlackUserFromMatches(input, matches, parsed);
			}
			if (parsed.name) {
				const target = parsed.name.toLowerCase();
				const matches = lookup.filter((user) => {
					return [
						user.name,
						user.displayName,
						user.realName
					].map((value) => value?.toLowerCase()).filter(Boolean).includes(target);
				});
				if (matches.length > 0) return resolveSlackUserFromMatches(input, matches, parsed);
			}
		},
		buildUnresolved: (input) => ({
			input,
			resolved: false
		})
	});
}
//#endregion
export { resolveSlackChannelAllowlist as n, resolveSlackUserAllowlist as t };
