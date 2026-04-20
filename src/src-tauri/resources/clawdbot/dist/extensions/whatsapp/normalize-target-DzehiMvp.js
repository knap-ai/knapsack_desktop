import { normalizeLowercaseStringOrEmpty } from "openclaw/plugin-sdk/text-runtime";
import { normalizeE164 } from "openclaw/plugin-sdk/account-resolution";
//#region extensions/whatsapp/src/normalize-target.ts
const WHATSAPP_USER_JID_RE = /^(\d+)(?::\d+)?@s\.whatsapp\.net$/i;
const WHATSAPP_LEGACY_USER_JID_RE = /^(\d+)@c\.us$/i;
const WHATSAPP_LID_RE = /^(\d+)@lid$/i;
function stripWhatsAppTargetPrefixes(value) {
	let candidate = value.trim();
	for (;;) {
		const before = candidate;
		candidate = candidate.replace(/^whatsapp:/i, "").trim();
		if (candidate === before) return candidate;
	}
}
function isWhatsAppGroupJid(value) {
	const candidate = stripWhatsAppTargetPrefixes(value);
	if (!normalizeLowercaseStringOrEmpty(candidate).endsWith("@g.us")) return false;
	const localPart = candidate.slice(0, candidate.length - 5);
	if (!localPart || localPart.includes("@")) return false;
	return /^[0-9]+(-[0-9]+)*$/.test(localPart);
}
function isWhatsAppUserTarget(value) {
	const candidate = stripWhatsAppTargetPrefixes(value);
	return WHATSAPP_USER_JID_RE.test(candidate) || WHATSAPP_LEGACY_USER_JID_RE.test(candidate) || WHATSAPP_LID_RE.test(candidate);
}
function extractUserJidPhone(jid) {
	const userMatch = jid.match(WHATSAPP_USER_JID_RE);
	if (userMatch) return userMatch[1];
	const legacyUserMatch = jid.match(WHATSAPP_LEGACY_USER_JID_RE);
	if (legacyUserMatch) return legacyUserMatch[1];
	const lidMatch = jid.match(WHATSAPP_LID_RE);
	if (lidMatch) return lidMatch[1];
	return null;
}
function normalizeWhatsAppTarget(value) {
	const candidate = stripWhatsAppTargetPrefixes(value);
	if (!candidate) return null;
	if (isWhatsAppGroupJid(candidate)) return `${candidate.slice(0, candidate.length - 5)}@g.us`;
	if (isWhatsAppUserTarget(candidate)) {
		const phone = extractUserJidPhone(candidate);
		if (!phone) return null;
		const normalized = normalizeE164(phone);
		return normalized.length > 1 ? normalized : null;
	}
	if (candidate.includes("@")) return null;
	const normalized = normalizeE164(candidate);
	return normalized.length > 1 ? normalized : null;
}
function normalizeWhatsAppMessagingTarget(raw) {
	const trimmed = raw.trim();
	if (!trimmed) return;
	return normalizeWhatsAppTarget(trimmed) ?? void 0;
}
function normalizeWhatsAppAllowFromEntries(allowFrom) {
	return allowFrom.map((entry) => String(entry).trim()).filter((entry) => Boolean(entry)).map((entry) => entry === "*" ? entry : normalizeWhatsAppTarget(entry)).filter((entry) => Boolean(entry));
}
function looksLikeWhatsAppTargetId(raw) {
	const trimmed = raw.trim();
	if (!trimmed) return false;
	return /^whatsapp:/i.test(trimmed) || isWhatsAppGroupJid(trimmed) || isWhatsAppUserTarget(trimmed) || normalizeWhatsAppTarget(trimmed) !== null;
}
//#endregion
export { normalizeWhatsAppMessagingTarget as a, normalizeWhatsAppAllowFromEntries as i, isWhatsAppUserTarget as n, normalizeWhatsAppTarget as o, looksLikeWhatsAppTargetId as r, isWhatsAppGroupJid as t };
