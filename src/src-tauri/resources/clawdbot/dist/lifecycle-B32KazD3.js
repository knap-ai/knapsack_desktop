import { a as resolveSessionFilePathOptions, i as resolveSessionFilePath } from "./paths-CHP3g1Fg.js";
import fs from "node:fs";
//#region src/config/sessions/lifecycle.ts
function resolveTimestamp(value) {
	return typeof value === "number" && Number.isFinite(value) && value >= 0 ? value : void 0;
}
function parseTimestampMs(value) {
	if (typeof value === "number") return resolveTimestamp(value);
	if (typeof value !== "string" || !value.trim()) return;
	const parsed = Date.parse(value);
	return Number.isFinite(parsed) && parsed >= 0 ? parsed : void 0;
}
function readFirstLine(filePath) {
	try {
		const fd = fs.openSync(filePath, "r");
		try {
			const buffer = Buffer.alloc(8192);
			const bytesRead = fs.readSync(fd, buffer, 0, buffer.length, 0);
			if (bytesRead <= 0) return;
			const chunk = buffer.subarray(0, bytesRead).toString("utf8");
			const newline = chunk.indexOf("\n");
			return newline >= 0 ? chunk.slice(0, newline) : chunk;
		} finally {
			fs.closeSync(fd);
		}
	} catch {
		return;
	}
}
function readSessionHeaderStartedAtMs(params) {
	const sessionId = params.entry?.sessionId?.trim();
	if (!sessionId) return;
	const pathOptions = params.pathOptions ?? resolveSessionFilePathOptions({
		agentId: params.agentId,
		storePath: params.storePath
	});
	let sessionFile;
	try {
		sessionFile = resolveSessionFilePath(sessionId, params.entry, pathOptions);
	} catch {
		return;
	}
	const firstLine = readFirstLine(sessionFile);
	if (!firstLine) return;
	try {
		const header = JSON.parse(firstLine);
		if (header.type !== "session") return;
		if (typeof header.id === "string" && header.id.trim() && header.id !== sessionId) return;
		return parseTimestampMs(header.timestamp);
	} catch {
		return;
	}
}
function resolveSessionLifecycleTimestamps(params) {
	const entry = params.entry;
	if (!entry) return {};
	return {
		sessionStartedAt: resolveTimestamp(entry.sessionStartedAt) ?? readSessionHeaderStartedAtMs({
			entry,
			agentId: params.agentId,
			storePath: params.storePath,
			pathOptions: params.pathOptions
		}),
		lastInteractionAt: resolveTimestamp(entry.lastInteractionAt)
	};
}
//#endregion
export { resolveSessionLifecycleTimestamps as n, readSessionHeaderStartedAtMs as t };
