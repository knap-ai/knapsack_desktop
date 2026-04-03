//#region src/channels/plugins/normalize/signal.ts
function normalizeSignalMessagingTarget(raw) {
	const trimmed = raw.trim();
	if (!trimmed) return;
	let normalized = trimmed;
	if (normalized.toLowerCase().startsWith("signal:")) normalized = normalized.slice(7).trim();
	if (!normalized) return;
	const lower = normalized.toLowerCase();
	if (lower.startsWith("group:")) {
		const id = normalized.slice(6).trim();
		return id ? `group:${id}` : void 0;
	}
	if (lower.startsWith("username:")) {
		const id = normalized.slice(9).trim();
		return id ? `username:${id}`.toLowerCase() : void 0;
	}
	if (lower.startsWith("u:")) {
		const id = normalized.slice(2).trim();
		return id ? `username:${id}`.toLowerCase() : void 0;
	}
	if (lower.startsWith("uuid:")) {
		const id = normalized.slice(5).trim();
		return id ? id.toLowerCase() : void 0;
	}
	return normalized.toLowerCase();
}
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const UUID_COMPACT_PATTERN = /^[0-9a-f]{32}$/i;
function looksLikeSignalTargetId(raw, normalized) {
	const candidates = [raw, normalized ?? ""].map((value) => value.trim()).filter(Boolean);
	for (const candidate of candidates) {
		if (/^(signal:)?(group:|username:|u:)/i.test(candidate)) return true;
		if (/^(signal:)?uuid:/i.test(candidate)) {
			const stripped = candidate.replace(/^signal:/i, "").replace(/^uuid:/i, "").trim();
			if (!stripped) continue;
			if (UUID_PATTERN.test(stripped) || UUID_COMPACT_PATTERN.test(stripped)) return true;
			continue;
		}
		const withoutSignalPrefix = candidate.replace(/^signal:/i, "").trim();
		if (UUID_PATTERN.test(withoutSignalPrefix) || UUID_COMPACT_PATTERN.test(withoutSignalPrefix)) return true;
		if (/^\+?\d{3,}$/.test(withoutSignalPrefix)) return true;
	}
	return false;
}
//#endregion
export { normalizeSignalMessagingTarget as n, looksLikeSignalTargetId as t };
