import { s as normalizeOptionalLowercaseString } from "./string-coerce-Bje8XVt9.js";
import { n as isAllowedParsedChatSender$1 } from "./chat-target-prefixes-DGJm-EfY.js";
//#region src/plugin-sdk/allow-from.ts
/** Lowercase and optionally strip prefixes from allowlist entries before sender comparisons. */
function formatAllowFromLowercase(params) {
	return params.allowFrom.map((entry) => String(entry).trim()).filter(Boolean).map((entry) => params.stripPrefixRe ? entry.replace(params.stripPrefixRe, "") : entry).map((entry) => normalizeOptionalLowercaseString(entry)).filter((entry) => Boolean(entry));
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
	const sender = normalizeOptionalLowercaseString(String(params.senderId));
	return sender ? normalizedAllow.includes(sender) : false;
}
/** Match chat-aware allowlist entries against sender, chat id, guid, or identifier fields. */
function isAllowedParsedChatSender(params) {
	return isAllowedParsedChatSender$1(params);
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
