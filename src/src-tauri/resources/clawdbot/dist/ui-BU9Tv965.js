import { By as resolveFetch, KS as inspectDiscordAccount, mi as Container, tC as normalizeDiscordToken } from "./pi-embedded-CbCYZxIb.js";
import { n as fetchWithTimeout } from "./fetch-timeout-BFj-W7kF.js";
//#region extensions/discord/src/probe.ts
const DISCORD_API_BASE = "https://discord.com/api/v10";
const DISCORD_APP_FLAG_GATEWAY_PRESENCE = 4096;
const DISCORD_APP_FLAG_GATEWAY_PRESENCE_LIMITED = 8192;
const DISCORD_APP_FLAG_GATEWAY_GUILD_MEMBERS = 16384;
const DISCORD_APP_FLAG_GATEWAY_GUILD_MEMBERS_LIMITED = 32768;
const DISCORD_APP_FLAG_GATEWAY_MESSAGE_CONTENT = 1 << 18;
const DISCORD_APP_FLAG_GATEWAY_MESSAGE_CONTENT_LIMITED = 1 << 19;
async function fetchDiscordApplicationMe(token, timeoutMs, fetcher) {
	try {
		const appResponse = await fetchDiscordApplicationMeResponse(token, timeoutMs, fetcher);
		if (!appResponse || !appResponse.ok) return;
		return await appResponse.json();
	} catch {
		return;
	}
}
async function fetchDiscordApplicationMeResponse(token, timeoutMs, fetcher) {
	const normalized = normalizeDiscordToken(token, "channels.discord.token");
	if (!normalized) return;
	return await fetchWithTimeout(`${DISCORD_API_BASE}/oauth2/applications/@me`, { headers: { Authorization: `Bot ${normalized}` } }, timeoutMs, getResolvedFetch(fetcher));
}
function resolveDiscordPrivilegedIntentsFromFlags(flags) {
	const resolve = (enabledBit, limitedBit) => {
		if ((flags & enabledBit) !== 0) return "enabled";
		if ((flags & limitedBit) !== 0) return "limited";
		return "disabled";
	};
	return {
		presence: resolve(DISCORD_APP_FLAG_GATEWAY_PRESENCE, DISCORD_APP_FLAG_GATEWAY_PRESENCE_LIMITED),
		guildMembers: resolve(DISCORD_APP_FLAG_GATEWAY_GUILD_MEMBERS, DISCORD_APP_FLAG_GATEWAY_GUILD_MEMBERS_LIMITED),
		messageContent: resolve(DISCORD_APP_FLAG_GATEWAY_MESSAGE_CONTENT, DISCORD_APP_FLAG_GATEWAY_MESSAGE_CONTENT_LIMITED)
	};
}
async function fetchDiscordApplicationSummary(token, timeoutMs, fetcher = fetch) {
	const json = await fetchDiscordApplicationMe(token, timeoutMs, fetcher);
	if (!json) return;
	const flags = typeof json.flags === "number" && Number.isFinite(json.flags) ? json.flags : void 0;
	return {
		id: json.id ?? null,
		flags: flags ?? null,
		intents: typeof flags === "number" ? resolveDiscordPrivilegedIntentsFromFlags(flags) : void 0
	};
}
function getResolvedFetch(fetcher) {
	const fetchImpl = resolveFetch(fetcher);
	if (!fetchImpl) throw new Error("fetch is not available");
	return fetchImpl;
}
async function probeDiscord(token, timeoutMs, opts) {
	const started = Date.now();
	const fetcher = opts?.fetcher ?? fetch;
	const includeApplication = opts?.includeApplication === true;
	const normalized = normalizeDiscordToken(token, "channels.discord.token");
	const result = {
		ok: false,
		status: null,
		error: null,
		elapsedMs: 0
	};
	if (!normalized) return {
		...result,
		error: "missing token",
		elapsedMs: Date.now() - started
	};
	try {
		const res = await fetchWithTimeout(`${DISCORD_API_BASE}/users/@me`, { headers: { Authorization: `Bot ${normalized}` } }, timeoutMs, getResolvedFetch(fetcher));
		if (!res.ok) {
			result.status = res.status;
			result.error = `getMe failed (${res.status})`;
			return {
				...result,
				elapsedMs: Date.now() - started
			};
		}
		const json = await res.json();
		result.ok = true;
		result.bot = {
			id: json.id ?? null,
			username: json.username ?? null
		};
		if (includeApplication) result.application = await fetchDiscordApplicationSummary(normalized, timeoutMs, fetcher) ?? void 0;
		return {
			...result,
			elapsedMs: Date.now() - started
		};
	} catch (err) {
		return {
			...result,
			status: err instanceof Response ? err.status : result.status,
			error: err instanceof Error ? err.message : String(err),
			elapsedMs: Date.now() - started
		};
	}
}
/**
* Extract the application (bot user) ID from a Discord bot token by
* base64-decoding the first segment.  Discord tokens have the format:
*   base64(user_id) . timestamp . hmac
* The decoded first segment is the numeric snowflake ID as a plain string,
* so we keep it as a string to avoid precision loss for IDs that exceed
* Number.MAX_SAFE_INTEGER.
*/
function parseApplicationIdFromToken(token) {
	const normalized = normalizeDiscordToken(token, "channels.discord.token");
	if (!normalized) return;
	const firstDot = normalized.indexOf(".");
	if (firstDot <= 0) return;
	try {
		const decoded = Buffer.from(normalized.slice(0, firstDot), "base64").toString("utf-8");
		if (/^\d+$/.test(decoded)) return decoded;
		return;
	} catch {
		return;
	}
}
async function fetchDiscordApplicationId(token, timeoutMs, fetcher = fetch) {
	if (!normalizeDiscordToken(token, "channels.discord.token")) return;
	try {
		const res = await fetchDiscordApplicationMeResponse(token, timeoutMs, fetcher);
		if (!res) return;
		if (res.ok) {
			const json = await res.json();
			if (json?.id) return json.id;
		}
		return;
	} catch {
		return parseApplicationIdFromToken(token);
	}
}
//#endregion
//#region extensions/discord/src/ui.ts
const DEFAULT_DISCORD_ACCENT_COLOR = "#5865F2";
function normalizeDiscordAccentColor(raw) {
	const trimmed = (raw ?? "").trim();
	if (!trimmed) return null;
	const normalized = trimmed.startsWith("#") ? trimmed : `#${trimmed}`;
	if (!/^#[0-9a-fA-F]{6}$/.test(normalized)) return null;
	return normalized.toUpperCase();
}
function resolveDiscordAccentColor(params) {
	return normalizeDiscordAccentColor(inspectDiscordAccount({
		cfg: params.cfg,
		accountId: params.accountId
	}).config.ui?.components?.accentColor) ?? DEFAULT_DISCORD_ACCENT_COLOR;
}
var DiscordUiContainer = class extends Container {
	constructor(params) {
		const accentColor = normalizeDiscordAccentColor(params.accentColor) ?? resolveDiscordAccentColor({
			cfg: params.cfg,
			accountId: params.accountId
		});
		super(params.components, {
			accentColor,
			spoiler: params.spoiler
		});
	}
};
//#endregion
export { probeDiscord as a, parseApplicationIdFromToken as i, fetchDiscordApplicationId as n, resolveDiscordPrivilegedIntentsFromFlags as o, fetchDiscordApplicationSummary as r, DiscordUiContainer as t };
