import { a as normalizeLowercaseStringOrEmpty } from "./string-coerce-Bje8XVt9.js";
import { o as parseAgentSessionKey } from "./session-key-utils-naHBWFyS.js";
import { r as iterateBootstrapChannelPlugins } from "./bootstrap-registry-fBj8HD5R.js";
//#region src/sessions/session-chat-type-shared.ts
function deriveBuiltInLegacySessionChatType(scopedSessionKey) {
	if (/^group:[^:]+$/.test(scopedSessionKey)) return "group";
}
function deriveSessionChatTypeFromScopedKey(scopedSessionKey, deriveLegacySessionChatTypes = []) {
	const tokens = new Set(scopedSessionKey.split(":").filter(Boolean));
	if (tokens.has("group")) return "group";
	if (tokens.has("channel")) return "channel";
	if (tokens.has("direct") || tokens.has("dm")) return "direct";
	const builtInLegacy = deriveBuiltInLegacySessionChatType(scopedSessionKey);
	if (builtInLegacy) return builtInLegacy;
	for (const deriveLegacySessionChatType of deriveLegacySessionChatTypes) {
		const derived = deriveLegacySessionChatType(scopedSessionKey);
		if (derived) return derived;
	}
	return "unknown";
}
/**
* Best-effort chat-type extraction from session keys across canonical and legacy formats.
*/
function deriveSessionChatTypeFromKey(sessionKey, deriveLegacySessionChatTypes = []) {
	const raw = normalizeLowercaseStringOrEmpty(sessionKey);
	if (!raw) return "unknown";
	return deriveSessionChatTypeFromScopedKey(parseAgentSessionKey(raw)?.rest ?? raw, deriveLegacySessionChatTypes);
}
//#endregion
//#region src/sessions/session-chat-type.ts
function deriveSessionChatType(sessionKey) {
	const builtInType = deriveSessionChatTypeFromKey(sessionKey);
	if (builtInType !== "unknown") return builtInType;
	return deriveSessionChatTypeFromKey(sessionKey, Array.from(iterateBootstrapChannelPlugins()).map((plugin) => plugin.messaging?.deriveLegacySessionChatType).filter((deriveLegacySessionChatType) => Boolean(deriveLegacySessionChatType)));
}
//#endregion
export { deriveSessionChatType as t };
