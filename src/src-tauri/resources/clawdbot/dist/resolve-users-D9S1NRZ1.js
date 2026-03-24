import { ni as fetchDiscord, tC as normalizeDiscordToken, zr as normalizeDiscordSlug } from "./pi-embedded-CbCYZxIb.js";
//#region extensions/discord/src/guilds.ts
async function listGuilds(token, fetcher) {
	return (await fetchDiscord("/users/@me/guilds", token, fetcher)).filter((guild) => typeof guild.id === "string" && typeof guild.name === "string").map((guild) => ({
		id: guild.id,
		name: guild.name,
		slug: normalizeDiscordSlug(guild.name)
	}));
}
//#endregion
//#region extensions/discord/src/resolve-allowlist-common.ts
function resolveDiscordAllowlistToken(token) {
	return normalizeDiscordToken(token, "channels.discord.token");
}
function buildDiscordUnresolvedResults(entries, buildResult) {
	return entries.map((input) => buildResult(input));
}
function findDiscordGuildByName(guilds, input) {
	const slug = normalizeDiscordSlug(input);
	if (!slug) return;
	return guilds.find((guild) => guild.slug === slug);
}
function filterDiscordGuilds(guilds, params) {
	if (params.guildId) return guilds.filter((guild) => guild.id === params.guildId);
	if (params.guildName) {
		const match = findDiscordGuildByName(guilds, params.guildName);
		return match ? [match] : [];
	}
	return guilds;
}
//#endregion
//#region extensions/discord/src/resolve-users.ts
function parseDiscordUserInput(raw) {
	const trimmed = raw.trim();
	if (!trimmed) return {};
	const mention = trimmed.match(/^<@!?(\d+)>$/);
	if (mention) return { userId: mention[1] };
	const prefixed = trimmed.match(/^(?:user:|discord:)?(\d+)$/i);
	if (prefixed) return { userId: prefixed[1] };
	const split = trimmed.includes("/") ? trimmed.split("/") : trimmed.split("#");
	if (split.length >= 2) {
		const guild = split[0]?.trim();
		const user = split.slice(1).join("#").trim();
		if (guild && /^\d+$/.test(guild)) return {
			guildId: guild,
			userName: user
		};
		return {
			guildName: guild,
			userName: user
		};
	}
	return { userName: trimmed.replace(/^@/, "") };
}
function scoreDiscordMember(member, query) {
	const q = query.toLowerCase();
	const user = member.user;
	const candidates = [
		user.username,
		user.global_name,
		member.nick ?? void 0
	].map((value) => value?.toLowerCase()).filter(Boolean);
	let score = 0;
	if (candidates.some((value) => value === q)) score += 3;
	if (candidates.some((value) => value?.includes(q))) score += 1;
	if (!user.bot) score += 1;
	return score;
}
async function resolveDiscordUserAllowlist(params) {
	const token = resolveDiscordAllowlistToken(params.token);
	if (!token) return buildDiscordUnresolvedResults(params.entries, (input) => ({
		input,
		resolved: false
	}));
	const fetcher = params.fetcher ?? fetch;
	let guilds = null;
	const getGuilds = async () => {
		if (!guilds) guilds = await listGuilds(token, fetcher);
		return guilds;
	};
	const results = [];
	for (const input of params.entries) {
		const parsed = parseDiscordUserInput(input);
		if (parsed.userId) {
			results.push({
				input,
				resolved: true,
				id: parsed.userId
			});
			continue;
		}
		const query = parsed.userName?.trim();
		if (!query) {
			results.push({
				input,
				resolved: false
			});
			continue;
		}
		const guildList = filterDiscordGuilds(await getGuilds(), {
			guildId: parsed.guildId,
			guildName: parsed.guildName?.trim()
		});
		let best = null;
		let matches = 0;
		for (const guild of guildList) {
			const paramsObj = new URLSearchParams({
				query,
				limit: "25"
			});
			const members = await fetchDiscord(`/guilds/${guild.id}/members/search?${paramsObj.toString()}`, token, fetcher);
			for (const member of members) {
				const score = scoreDiscordMember(member, query);
				if (score === 0) continue;
				matches += 1;
				if (!best || score > best.score) best = {
					member,
					guild,
					score
				};
			}
		}
		if (best) {
			const user = best.member.user;
			const name = best.member.nick?.trim() || user.global_name?.trim() || user.username?.trim() || void 0;
			results.push({
				input,
				resolved: true,
				id: user.id,
				name,
				guildId: best.guild.id,
				guildName: best.guild.name,
				note: matches > 1 ? "multiple matches; chose best" : void 0
			});
		} else results.push({
			input,
			resolved: false
		});
	}
	return results;
}
//#endregion
export { listGuilds as a, resolveDiscordAllowlistToken as i, buildDiscordUnresolvedResults as n, filterDiscordGuilds as r, resolveDiscordUserAllowlist as t };
