//#region src/auto-reply/reply/abort-cutoff.ts
function resolveAbortCutoffFromContext(ctx) {
	const messageSid = typeof ctx.MessageSidFull === "string" && ctx.MessageSidFull.trim() || typeof ctx.MessageSid === "string" && ctx.MessageSid.trim() || void 0;
	const timestamp = typeof ctx.Timestamp === "number" && Number.isFinite(ctx.Timestamp) ? ctx.Timestamp : void 0;
	if (!messageSid && timestamp === void 0) return;
	return {
		messageSid,
		timestamp
	};
}
function readAbortCutoffFromSessionEntry(entry) {
	if (!entry) return;
	const messageSid = entry.abortCutoffMessageSid?.trim() || void 0;
	const timestamp = typeof entry.abortCutoffTimestamp === "number" && Number.isFinite(entry.abortCutoffTimestamp) ? entry.abortCutoffTimestamp : void 0;
	if (!messageSid && timestamp === void 0) return;
	return {
		messageSid,
		timestamp
	};
}
function hasAbortCutoff(entry) {
	return readAbortCutoffFromSessionEntry(entry) !== void 0;
}
function applyAbortCutoffToSessionEntry(entry, cutoff) {
	entry.abortCutoffMessageSid = cutoff?.messageSid;
	entry.abortCutoffTimestamp = cutoff?.timestamp;
}
function toNumericMessageSid(value) {
	const trimmed = value?.trim();
	if (!trimmed || !/^\d+$/.test(trimmed)) return;
	try {
		return BigInt(trimmed);
	} catch {
		return;
	}
}
function shouldSkipMessageByAbortCutoff(params) {
	const cutoffSid = params.cutoffMessageSid?.trim();
	const currentSid = params.messageSid?.trim();
	if (cutoffSid && currentSid) {
		const cutoffNumeric = toNumericMessageSid(cutoffSid);
		const currentNumeric = toNumericMessageSid(currentSid);
		if (cutoffNumeric !== void 0 && currentNumeric !== void 0) return currentNumeric <= cutoffNumeric;
		if (currentSid === cutoffSid) return true;
	}
	if (typeof params.cutoffTimestamp === "number" && Number.isFinite(params.cutoffTimestamp) && typeof params.timestamp === "number" && Number.isFinite(params.timestamp)) return params.timestamp <= params.cutoffTimestamp;
	return false;
}
function shouldPersistAbortCutoff(params) {
	const commandSessionKey = params.commandSessionKey?.trim();
	const targetSessionKey = params.targetSessionKey?.trim();
	if (!commandSessionKey || !targetSessionKey) return true;
	return commandSessionKey === targetSessionKey;
}
//#endregion
export { shouldPersistAbortCutoff as a, resolveAbortCutoffFromContext as i, hasAbortCutoff as n, shouldSkipMessageByAbortCutoff as o, readAbortCutoffFromSessionEntry as r, applyAbortCutoffToSessionEntry as t };
