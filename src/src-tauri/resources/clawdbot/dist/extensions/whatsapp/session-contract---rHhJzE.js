import { normalizeLowercaseStringOrEmpty } from "openclaw/plugin-sdk/text-runtime";
//#region extensions/whatsapp/src/group-session-contract.ts
function resolveLegacyGroupSessionKey(ctx) {
	const from = typeof ctx.From === "string" ? ctx.From.trim() : "";
	const normalized = normalizeLowercaseStringOrEmpty(from);
	if (!from || from.includes(":") || !normalized.endsWith("@g.us")) return null;
	return {
		key: `whatsapp:group:${normalized}`,
		channel: "whatsapp",
		id: normalized,
		chatType: "group"
	};
}
//#endregion
//#region extensions/whatsapp/src/session-contract.ts
function extractLegacyWhatsAppGroupId(key) {
	const trimmed = key.trim();
	if (!trimmed) return null;
	const lower = normalizeLowercaseStringOrEmpty(trimmed);
	if (trimmed.startsWith("group:")) {
		const id = trimmed.slice(6).trim();
		return normalizeLowercaseStringOrEmpty(id).includes("@g.us") ? id : null;
	}
	if (!lower.includes("@g.us")) return null;
	if (!trimmed.includes(":")) return trimmed;
	if (lower.startsWith("whatsapp:") && !trimmed.includes(":group:")) return trimmed.slice(9).trim().replace(/^group:/i, "").trim() || null;
	return null;
}
function isLegacyGroupSessionKey(key) {
	return extractLegacyWhatsAppGroupId(key) !== null;
}
function canonicalizeLegacySessionKey(params) {
	const legacyGroupId = extractLegacyWhatsAppGroupId(params.key);
	return legacyGroupId ? `agent:${normalizeLowercaseStringOrEmpty(params.agentId)}:whatsapp:group:${normalizeLowercaseStringOrEmpty(legacyGroupId)}` : null;
}
//#endregion
export { isLegacyGroupSessionKey as n, resolveLegacyGroupSessionKey as r, canonicalizeLegacySessionKey as t };
