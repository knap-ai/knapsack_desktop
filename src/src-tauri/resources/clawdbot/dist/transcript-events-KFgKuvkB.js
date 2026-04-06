//#region src/sessions/transcript-events.ts
const SESSION_TRANSCRIPT_LISTENERS = /* @__PURE__ */ new Set();
function onSessionTranscriptUpdate(listener) {
	SESSION_TRANSCRIPT_LISTENERS.add(listener);
	return () => {
		SESSION_TRANSCRIPT_LISTENERS.delete(listener);
	};
}
function emitSessionTranscriptUpdate(update) {
	const normalized = typeof update === "string" ? { sessionFile: update } : {
		sessionFile: update.sessionFile,
		sessionKey: update.sessionKey,
		message: update.message,
		messageId: update.messageId
	};
	const trimmed = normalized.sessionFile.trim();
	if (!trimmed) return;
	const nextUpdate = {
		sessionFile: trimmed,
		...typeof normalized.sessionKey === "string" && normalized.sessionKey.trim() ? { sessionKey: normalized.sessionKey.trim() } : {},
		...normalized.message !== void 0 ? { message: normalized.message } : {},
		...typeof normalized.messageId === "string" && normalized.messageId.trim() ? { messageId: normalized.messageId.trim() } : {}
	};
	for (const listener of SESSION_TRANSCRIPT_LISTENERS) try {
		listener(nextUpdate);
	} catch {}
}
//#endregion
export { onSessionTranscriptUpdate as n, emitSessionTranscriptUpdate as t };
