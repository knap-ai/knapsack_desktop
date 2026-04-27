import { m as resolveSessionAgentIds } from "./agent-scope-_6dFncNS.js";
import { a as resolveSessionFilePathOptions, i as resolveSessionFilePath } from "./paths-DvU8Tgvw.js";
import fs from "node:fs";
import path from "node:path";
import { SessionManager } from "@mariozechner/pi-coding-agent";
function limitAgentHookHistoryMessages(messages, maxMessages = 100) {
	if (maxMessages <= 0) return [];
	return messages.slice(-maxMessages);
}
function buildAgentHookConversationMessages(params) {
	return [...limitAgentHookHistoryMessages(params.historyMessages ?? []), ...params.currentTurnMessages ?? []];
}
const MAX_CLI_SESSION_HISTORY_MESSAGES = 100;
function safeRealpathSync(filePath) {
	try {
		return fs.realpathSync(filePath);
	} catch {
		return;
	}
}
function isPathWithinBase(basePath, targetPath) {
	const relative = path.relative(basePath, targetPath);
	return Boolean(relative) && !relative.startsWith("..") && !path.isAbsolute(relative);
}
function resolveSafeCliSessionFile(params) {
	const { defaultAgentId, sessionAgentId } = resolveSessionAgentIds({
		sessionKey: params.sessionKey,
		config: params.config,
		agentId: params.agentId
	});
	const pathOptions = resolveSessionFilePathOptions({
		agentId: sessionAgentId ?? defaultAgentId,
		storePath: params.config?.session?.store
	});
	const sessionFile = resolveSessionFilePath(params.sessionId, { sessionFile: params.sessionFile }, pathOptions);
	return {
		sessionFile,
		sessionsDir: pathOptions?.sessionsDir ?? path.dirname(sessionFile)
	};
}
function loadCliSessionHistoryMessages(params) {
	try {
		const { sessionFile, sessionsDir } = resolveSafeCliSessionFile(params);
		const entryStat = fs.lstatSync(sessionFile);
		if (!entryStat.isFile() || entryStat.isSymbolicLink()) return [];
		const realSessionsDir = safeRealpathSync(sessionsDir) ?? path.resolve(sessionsDir);
		const realSessionFile = safeRealpathSync(sessionFile);
		if (!realSessionFile || !isPathWithinBase(realSessionsDir, realSessionFile)) return [];
		const stat = fs.statSync(realSessionFile);
		if (!stat.isFile() || stat.size > 5242880) return [];
		return limitAgentHookHistoryMessages(SessionManager.open(realSessionFile).getEntries().flatMap((entry) => entry?.type === "message" ? [entry.message] : []), MAX_CLI_SESSION_HISTORY_MESSAGES);
	} catch {
		return [];
	}
}
//#endregion
export { buildAgentHookConversationMessages as n, loadCliSessionHistoryMessages as t };
