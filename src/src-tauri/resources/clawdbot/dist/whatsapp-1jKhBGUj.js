import { r as normalizeWhatsAppTarget } from "./whatsapp-targets-og67hl7D.js";
//#region src/channels/plugins/normalize/shared.ts
function trimMessagingTarget(raw) {
	return raw.trim() || void 0;
}
function looksLikeHandleOrPhoneTarget(params) {
	const trimmed = params.raw.trim();
	if (!trimmed) return false;
	if (params.prefixPattern.test(trimmed)) return true;
	if (trimmed.includes("@")) return true;
	return (params.phonePattern ?? /^\+?\d{3,}$/).test(trimmed);
}
//#endregion
//#region src/channels/plugins/normalize/whatsapp.ts
function normalizeWhatsAppMessagingTarget(raw) {
	const trimmed = trimMessagingTarget(raw);
	if (!trimmed) return;
	return normalizeWhatsAppTarget(trimmed) ?? void 0;
}
function normalizeWhatsAppAllowFromEntries(allowFrom) {
	return allowFrom.map((entry) => String(entry).trim()).filter((entry) => Boolean(entry)).map((entry) => entry === "*" ? entry : normalizeWhatsAppTarget(entry)).filter((entry) => Boolean(entry));
}
function looksLikeWhatsAppTargetId(raw) {
	return looksLikeHandleOrPhoneTarget({
		raw,
		prefixPattern: /^whatsapp:/i
	});
}
//#endregion
export { normalizeWhatsAppAllowFromEntries as n, normalizeWhatsAppMessagingTarget as r, looksLikeWhatsAppTargetId as t };
