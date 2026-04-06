//#region src/plugin-sdk/allow-from.ts
/** Lowercase and optionally strip prefixes from allowlist entries before sender comparisons. */
function formatAllowFromLowercase(params) {
	return params.allowFrom.map((entry) => String(entry).trim()).filter(Boolean).map((entry) => params.stripPrefixRe ? entry.replace(params.stripPrefixRe, "") : entry).map((entry) => entry.toLowerCase());
}
/** Normalize allowlist entries through a channel-provided parser or canonicalizer. */
function formatNormalizedAllowFromEntries(params) {
	return params.allowFrom.map((entry) => String(entry).trim()).filter(Boolean).map((entry) => params.normalizeEntry(entry)).filter((entry) => Boolean(entry));
}
/** Check whether a sender id matches a simple normalized allowlist with wildcard support. */
function isNormalizedSenderAllowed(params) {
	const normalizedAllow = formatAllowFromLowercase({
		allowFrom: params.allowFrom,
		stripPrefixRe: params.stripPrefixRe
	});
	if (normalizedAllow.length === 0) return false;
	if (normalizedAllow.includes("*")) return true;
	const sender = String(params.senderId).trim().toLowerCase();
	return normalizedAllow.includes(sender);
}
/** Match chat-aware allowlist entries against sender, chat id, guid, or identifier fields. */
function isAllowedParsedChatSender(params) {
	const allowFrom = params.allowFrom.map((entry) => String(entry).trim());
	if (allowFrom.length === 0) return false;
	if (allowFrom.includes("*")) return true;
	const senderNormalized = params.normalizeSender(params.sender);
	const chatId = params.chatId ?? void 0;
	const chatGuid = params.chatGuid?.trim();
	const chatIdentifier = params.chatIdentifier?.trim();
	for (const entry of allowFrom) {
		if (!entry) continue;
		const parsed = params.parseAllowTarget(entry);
		if (parsed.kind === "chat_id" && chatId !== void 0) {
			if (parsed.chatId === chatId) return true;
		} else if (parsed.kind === "chat_guid" && chatGuid) {
			if (parsed.chatGuid === chatGuid) return true;
		} else if (parsed.kind === "chat_identifier" && chatIdentifier) {
			if (parsed.chatIdentifier === chatIdentifier) return true;
		} else if (parsed.kind === "handle" && senderNormalized) {
			if (parsed.handle === senderNormalized) return true;
		}
	}
	return false;
}
/** Clone allowlist resolution entries into a plain serializable shape for UI and docs output. */
function mapBasicAllowlistResolutionEntries(entries) {
	return entries.map((entry) => ({
		input: entry.input,
		resolved: entry.resolved,
		id: entry.id,
		name: entry.name,
		note: entry.note
	}));
}
/** Map allowlist inputs sequentially so resolver side effects stay ordered and predictable. */
async function mapAllowlistResolutionInputs(params) {
	const results = [];
	for (const input of params.inputs) results.push(await params.mapInput(input));
	return results;
}
//#endregion
export { mapAllowlistResolutionInputs as a, isNormalizedSenderAllowed as i, formatNormalizedAllowFromEntries as n, mapBasicAllowlistResolutionEntries as o, isAllowedParsedChatSender as r, formatAllowFromLowercase as t };
