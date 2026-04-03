import { p as normalizeE164 } from "./utils-CE3P21nG.js";
import { l as normalizeMainKey, r as buildAgentMainSessionKey, t as DEFAULT_AGENT_ID } from "./session-key-D7XpmyVq.js";
import { C as resolveGroupSessionKey } from "./store-BGmy-Wot.js";
import { t as normalizeExplicitDiscordSessionKey } from "./discord-session-key-SDilIbMY.js";
//#region src/config/sessions/explicit-session-key-normalization.ts
const EXPLICIT_SESSION_KEY_NORMALIZERS = [{
	provider: "discord",
	normalize: normalizeExplicitDiscordSessionKey,
	matches: ({ sessionKey, provider, surface, from }) => surface === "discord" || provider === "discord" || from.startsWith("discord:") || sessionKey.startsWith("discord:") || sessionKey.includes(":discord:")
}];
function resolveExplicitSessionKeyNormalizer(sessionKey, ctx) {
	const normalizedProvider = ctx.Provider?.trim().toLowerCase();
	const normalizedSurface = ctx.Surface?.trim().toLowerCase();
	const normalizedFrom = (ctx.From ?? "").trim().toLowerCase();
	return EXPLICIT_SESSION_KEY_NORMALIZERS.find((entry) => entry.matches({
		sessionKey,
		provider: normalizedProvider,
		surface: normalizedSurface,
		from: normalizedFrom
	}))?.normalize;
}
function normalizeExplicitSessionKey(sessionKey, ctx) {
	const normalized = sessionKey.trim().toLowerCase();
	const normalize = resolveExplicitSessionKeyNormalizer(normalized, ctx);
	return normalize ? normalize(normalized, ctx) : normalized;
}
//#endregion
//#region src/config/sessions/session-key.ts
function deriveSessionKey(scope, ctx) {
	if (scope === "global") return "global";
	const resolvedGroup = resolveGroupSessionKey(ctx);
	if (resolvedGroup) return resolvedGroup.key;
	return (ctx.From ? normalizeE164(ctx.From) : "") || "unknown";
}
/**
* Resolve the session key with a canonical direct-chat bucket (default: "main").
* All non-group direct chats collapse to this bucket; groups stay isolated.
*/
function resolveSessionKey(scope, ctx, mainKey) {
	const explicit = ctx.SessionKey?.trim();
	if (explicit) return normalizeExplicitSessionKey(explicit, ctx);
	const raw = deriveSessionKey(scope, ctx);
	if (scope === "global") return raw;
	const canonical = buildAgentMainSessionKey({
		agentId: DEFAULT_AGENT_ID,
		mainKey: normalizeMainKey(mainKey)
	});
	if (!(raw.includes(":group:") || raw.includes(":channel:"))) return canonical;
	return `agent:${DEFAULT_AGENT_ID}:${raw}`;
}
//#endregion
export { resolveSessionKey as n, deriveSessionKey as t };
