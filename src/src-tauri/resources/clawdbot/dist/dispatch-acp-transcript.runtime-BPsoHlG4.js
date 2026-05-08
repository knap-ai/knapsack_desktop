import { p as resolveSessionAgentId } from "./agent-scope-i10se9ty.js";
import { u as resolveStorePath } from "./paths-CHP3g1Fg.js";
import { t as loadSessionStore } from "./store-load-DLuD4etm.js";
import { l as resolveSessionStoreEntry } from "./store-CR7YmZjp.js";
import "./sessions-CLHVJJOI.js";
import { n as resolveAcpSessionCwd } from "./session-identifiers-pF6jmcaN.js";
import { o as persistAcpTurnTranscript } from "./attempt-execution-BCGZPEwY.js";
//#region src/auto-reply/reply/dispatch-acp-transcript.runtime.ts
async function persistAcpDispatchTranscript(params) {
	const promptText = params.promptText.trim();
	const finalText = params.finalText.trim();
	if (!promptText && !finalText) return;
	const sessionAgentId = resolveSessionAgentId({
		sessionKey: params.sessionKey,
		config: params.cfg
	});
	const storePath = resolveStorePath(params.cfg.session?.store, { agentId: sessionAgentId });
	const sessionStore = loadSessionStore(storePath, { skipCache: true });
	const sessionEntry = resolveSessionStoreEntry({
		store: sessionStore,
		sessionKey: params.sessionKey
	}).existing;
	const sessionId = sessionEntry?.sessionId;
	if (!sessionId) throw new Error(`unknown ACP session key: ${params.sessionKey}`);
	await persistAcpTurnTranscript({
		body: promptText,
		transcriptBody: promptText,
		finalText,
		sessionId,
		sessionKey: params.sessionKey,
		sessionEntry,
		sessionStore,
		storePath,
		sessionAgentId,
		threadId: params.threadId,
		sessionCwd: resolveAcpSessionCwd(params.meta) ?? process.cwd()
	});
}
//#endregion
export { persistAcpDispatchTranscript };
