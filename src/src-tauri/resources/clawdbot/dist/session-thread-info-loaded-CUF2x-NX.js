import { c as normalizeOptionalString } from "./string-coerce-Bje8XVt9.js";
import { c as parseThreadSessionSuffix, s as parseRawSessionConversationRef } from "./session-key-utils-naHBWFyS.js";
import { t as getLoadedChannelPluginForRead } from "./registry-loaded-read-C_Xq9jeg.js";
//#region src/channels/plugins/session-thread-info-loaded.ts
function resolveLoadedSessionConversationThreadInfo(sessionKey) {
	const raw = parseRawSessionConversationRef(sessionKey);
	if (!raw) return null;
	const rawId = raw.rawId.trim();
	if (!rawId) return null;
	const resolved = (getLoadedChannelPluginForRead(raw.channel)?.messaging)?.resolveSessionConversation?.({
		kind: raw.kind,
		rawId
	});
	if (!resolved?.id?.trim()) return null;
	const id = resolved.id.trim();
	const threadId = normalizeOptionalString(resolved.threadId);
	return {
		baseSessionKey: threadId ? `${raw.prefix}:${id}` : normalizeOptionalString(sessionKey),
		threadId
	};
}
function resolveLoadedSessionThreadInfo(sessionKey) {
	return resolveLoadedSessionConversationThreadInfo(sessionKey) ?? parseThreadSessionSuffix(sessionKey);
}
//#endregion
export { resolveLoadedSessionThreadInfo as t };
