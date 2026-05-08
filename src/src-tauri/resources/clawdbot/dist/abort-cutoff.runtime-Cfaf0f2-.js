import { o as updateSessionStore } from "./store-CR7YmZjp.js";
import { n as hasAbortCutoff, t as applyAbortCutoffToSessionEntry } from "./abort-cutoff-CBx1z2gb.js";
//#region src/auto-reply/reply/abort-cutoff.runtime.ts
async function clearAbortCutoffInSessionRuntime(params) {
	const { sessionEntry, sessionStore, sessionKey, storePath } = params;
	if (!sessionEntry || !sessionStore || !sessionKey || !hasAbortCutoff(sessionEntry)) return false;
	applyAbortCutoffToSessionEntry(sessionEntry, void 0);
	sessionEntry.updatedAt = Date.now();
	sessionStore[sessionKey] = sessionEntry;
	if (storePath) await updateSessionStore(storePath, (store) => {
		const existing = store[sessionKey] ?? sessionEntry;
		if (!existing) return;
		applyAbortCutoffToSessionEntry(existing, void 0);
		existing.updatedAt = Date.now();
		store[sessionKey] = existing;
	});
	return true;
}
//#endregion
export { clearAbortCutoffInSessionRuntime };
