import { i as resolveSessionFilePath } from "./paths-CHP3g1Fg.js";
import { o as resolveFreshSessionTotalTokens } from "./types-UHw-opRq.js";
import { i as readSessionMessages } from "./session-utils.fs-BgGqlqA-.js";
import { i as estimateMessagesTokens } from "./compaction-CciVUU6P.js";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { CURRENT_SESSION_VERSION, SessionManager } from "@mariozechner/pi-coding-agent";
//#region src/auto-reply/reply/session-fork.runtime.ts
function resolvePositiveTokenCount(value) {
	return typeof value === "number" && Number.isFinite(value) && value > 0 ? Math.floor(value) : void 0;
}
function resolveParentForkTokenCountRuntime(params) {
	const freshPersistedTokens = resolveFreshSessionTotalTokens(params.parentEntry);
	if (typeof freshPersistedTokens === "number") return freshPersistedTokens;
	try {
		const transcriptMessages = readSessionMessages(params.parentEntry.sessionId, params.storePath, params.parentEntry.sessionFile);
		if (transcriptMessages.length > 0) {
			const estimatedTokens = estimateMessagesTokens(transcriptMessages);
			const transcriptTokens = resolvePositiveTokenCount(Number.isFinite(estimatedTokens) ? Math.ceil(estimatedTokens) : void 0);
			if (typeof transcriptTokens === "number") return transcriptTokens;
		}
	} catch {}
	return resolvePositiveTokenCount(params.parentEntry.totalTokens);
}
function forkSessionFromParentRuntime(params) {
	const parentSessionFile = resolveSessionFilePath(params.parentEntry.sessionId, params.parentEntry, {
		agentId: params.agentId,
		sessionsDir: params.sessionsDir
	});
	if (!parentSessionFile || !fs.existsSync(parentSessionFile)) return null;
	try {
		const manager = SessionManager.open(parentSessionFile);
		const leafId = manager.getLeafId();
		if (leafId) {
			const sessionFile = manager.createBranchedSession(leafId) ?? manager.getSessionFile();
			const sessionId = manager.getSessionId();
			if (sessionFile && sessionId) return {
				sessionId,
				sessionFile
			};
		}
		const sessionId = crypto.randomUUID();
		const timestamp = (/* @__PURE__ */ new Date()).toISOString();
		const fileTimestamp = timestamp.replace(/[:.]/g, "-");
		const sessionFile = path.join(manager.getSessionDir(), `${fileTimestamp}_${sessionId}.jsonl`);
		const header = {
			type: "session",
			version: CURRENT_SESSION_VERSION,
			id: sessionId,
			timestamp,
			cwd: manager.getCwd(),
			parentSession: parentSessionFile
		};
		fs.writeFileSync(sessionFile, `${JSON.stringify(header)}\n`, {
			encoding: "utf-8",
			mode: 384,
			flag: "wx"
		});
		return {
			sessionId,
			sessionFile
		};
	} catch {
		return null;
	}
}
//#endregion
export { forkSessionFromParentRuntime, resolveParentForkTokenCountRuntime };
