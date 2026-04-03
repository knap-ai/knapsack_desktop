import { n as redactSensitiveText } from "./redact-BDinS1q9.js";
import { t as createSubsystemLogger } from "./subsystem-CJEvHE2o.js";
import { T as parseAgentSessionKey } from "./session-key-D7XpmyVq.js";
import { i as isUsageCountedSessionTranscriptFileName } from "./artifacts-DtJnd71X.js";
import { c as resolveSessionTranscriptsDirForAgent } from "./paths-DBIQqSpZ.js";
import { i as resolveWindowsSpawnProgram, n as materializeWindowsSpawnProgram } from "./windows-spawn-Bwy9t01K.js";
import "./query-expansion-BuwogHeA.js";
import { o as hashText } from "./internal-CcZnGEyS.js";
import path from "node:path";
import { spawn } from "node:child_process";
import fs from "node:fs/promises";
//#region packages/memory-host-sdk/src/host/session-files.ts
const log$1 = createSubsystemLogger("memory");
async function listSessionFilesForAgent(agentId) {
	const dir = resolveSessionTranscriptsDirForAgent(agentId);
	try {
		return (await fs.readdir(dir, { withFileTypes: true })).filter((entry) => entry.isFile()).map((entry) => entry.name).filter((name) => isUsageCountedSessionTranscriptFileName(name)).map((name) => path.join(dir, name));
	} catch {
		return [];
	}
}
function sessionPathForFile(absPath) {
	return path.join("sessions", path.basename(absPath)).replace(/\\/g, "/");
}
function normalizeSessionText(value) {
	return value.replace(/\s*\n+\s*/g, " ").replace(/\s+/g, " ").trim();
}
function extractSessionText(content) {
	if (typeof content === "string") {
		const normalized = normalizeSessionText(content);
		return normalized ? normalized : null;
	}
	if (!Array.isArray(content)) return null;
	const parts = [];
	for (const block of content) {
		if (!block || typeof block !== "object") continue;
		const record = block;
		if (record.type !== "text" || typeof record.text !== "string") continue;
		const normalized = normalizeSessionText(record.text);
		if (normalized) parts.push(normalized);
	}
	if (parts.length === 0) return null;
	return parts.join(" ");
}
async function buildSessionEntry(absPath) {
	try {
		const stat = await fs.stat(absPath);
		const lines = (await fs.readFile(absPath, "utf-8")).split("\n");
		const collected = [];
		const lineMap = [];
		for (let jsonlIdx = 0; jsonlIdx < lines.length; jsonlIdx++) {
			const line = lines[jsonlIdx];
			if (!line.trim()) continue;
			let record;
			try {
				record = JSON.parse(line);
			} catch {
				continue;
			}
			if (!record || typeof record !== "object" || record.type !== "message") continue;
			const message = record.message;
			if (!message || typeof message.role !== "string") continue;
			if (message.role !== "user" && message.role !== "assistant") continue;
			const text = extractSessionText(message.content);
			if (!text) continue;
			const safe = redactSensitiveText(text, { mode: "tools" });
			const label = message.role === "user" ? "User" : "Assistant";
			collected.push(`${label}: ${safe}`);
			lineMap.push(jsonlIdx + 1);
		}
		const content = collected.join("\n");
		return {
			path: sessionPathForFile(absPath),
			absPath,
			mtimeMs: stat.mtimeMs,
			size: stat.size,
			hash: hashText(content + "\n" + lineMap.join(",")),
			content,
			lineMap
		};
	} catch (err) {
		log$1.debug(`Failed reading session file ${absPath}: ${String(err)}`);
		return null;
	}
}
//#endregion
//#region packages/memory-host-sdk/src/host/qmd-query-parser.ts
const log = createSubsystemLogger("memory");
function parseQmdQueryJson(stdout, stderr) {
	const trimmedStdout = stdout.trim();
	const trimmedStderr = stderr.trim();
	const stdoutIsMarker = trimmedStdout.length > 0 && isQmdNoResultsOutput(trimmedStdout);
	const stderrIsMarker = trimmedStderr.length > 0 && isQmdNoResultsOutput(trimmedStderr);
	if (stdoutIsMarker || !trimmedStdout && stderrIsMarker) return [];
	if (!trimmedStdout) {
		const message = `stdout empty${trimmedStderr ? ` (stderr: ${summarizeQmdStderr(trimmedStderr)})` : ""}`;
		log.warn(`qmd query returned invalid JSON: ${message}`);
		throw new Error(`qmd query returned invalid JSON: ${message}`);
	}
	try {
		const parsed = parseQmdQueryResultArray(trimmedStdout);
		if (parsed !== null) return parsed;
		const noisyPayload = extractFirstJsonArray(trimmedStdout);
		if (!noisyPayload) throw new Error("qmd query JSON response was not an array");
		const fallback = parseQmdQueryResultArray(noisyPayload);
		if (fallback !== null) return fallback;
		throw new Error("qmd query JSON response was not an array");
	} catch (err) {
		const message = err instanceof Error ? err.message : String(err);
		log.warn(`qmd query returned invalid JSON: ${message}`);
		throw new Error(`qmd query returned invalid JSON: ${message}`, { cause: err });
	}
}
function isQmdNoResultsOutput(raw) {
	return raw.split(/\r?\n/).map((line) => line.trim().toLowerCase().replace(/\s+/g, " ")).filter((line) => line.length > 0).some((line) => isQmdNoResultsLine(line));
}
function isQmdNoResultsLine(line) {
	if (line === "no results found" || line === "no results found.") return true;
	return /^(?:\[[^\]]+\]\s*)?(?:(?:warn(?:ing)?|info|error|qmd)\s*:\s*)+no results found\.?$/.test(line);
}
function summarizeQmdStderr(raw) {
	return raw.length <= 120 ? raw : `${raw.slice(0, 117)}...`;
}
function parseQmdQueryResultArray(raw) {
	try {
		const parsed = JSON.parse(raw);
		if (!Array.isArray(parsed)) return null;
		return parsed.map((item) => {
			if (typeof item !== "object" || item === null) return item;
			const record = item;
			return {
				docid: typeof record.docid === "string" ? record.docid : void 0,
				score: typeof record.score === "number" && Number.isFinite(record.score) ? record.score : void 0,
				collection: typeof record.collection === "string" ? record.collection : void 0,
				file: typeof record.file === "string" ? record.file : void 0,
				snippet: typeof record.snippet === "string" ? record.snippet : void 0,
				body: typeof record.body === "string" ? record.body : void 0,
				startLine: parseQmdLineNumber(record.start_line ?? record.startLine),
				endLine: parseQmdLineNumber(record.end_line ?? record.endLine)
			};
		});
	} catch {
		return null;
	}
}
function parseQmdLineNumber(value) {
	return typeof value === "number" && Number.isFinite(value) && value > 0 ? value : void 0;
}
function extractFirstJsonArray(raw) {
	const start = raw.indexOf("[");
	if (start < 0) return null;
	let depth = 0;
	let inString = false;
	let escaped = false;
	for (let i = start; i < raw.length; i += 1) {
		const char = raw[i];
		if (char === void 0) break;
		if (inString) {
			if (escaped) {
				escaped = false;
				continue;
			}
			if (char === "\\") escaped = true;
			else if (char === "\"") inString = false;
			continue;
		}
		if (char === "\"") {
			inString = true;
			continue;
		}
		if (char === "[") depth += 1;
		else if (char === "]") {
			depth -= 1;
			if (depth === 0) return raw.slice(start, i + 1);
		}
	}
	return null;
}
//#endregion
//#region packages/memory-host-sdk/src/host/qmd-scope.ts
function isQmdScopeAllowed(scope, sessionKey) {
	if (!scope) return true;
	const parsed = parseQmdSessionScope(sessionKey);
	const channel = parsed.channel;
	const chatType = parsed.chatType;
	const normalizedKey = parsed.normalizedKey ?? "";
	const rawKey = sessionKey?.trim().toLowerCase() ?? "";
	for (const rule of scope.rules ?? []) {
		if (!rule) continue;
		const match = rule.match ?? {};
		if (match.channel && match.channel !== channel) continue;
		if (match.chatType && match.chatType !== chatType) continue;
		const normalizedPrefix = match.keyPrefix?.trim().toLowerCase() || void 0;
		const rawPrefix = match.rawKeyPrefix?.trim().toLowerCase() || void 0;
		if (rawPrefix && !rawKey.startsWith(rawPrefix)) continue;
		if (normalizedPrefix) {
			if (normalizedPrefix.startsWith("agent:")) {
				if (!rawKey.startsWith(normalizedPrefix)) continue;
			} else if (!normalizedKey.startsWith(normalizedPrefix)) continue;
		}
		return rule.action === "allow";
	}
	return (scope.default ?? "allow") === "allow";
}
function deriveQmdScopeChannel(key) {
	return parseQmdSessionScope(key).channel;
}
function deriveQmdScopeChatType(key) {
	return parseQmdSessionScope(key).chatType;
}
function parseQmdSessionScope(key) {
	const normalized = normalizeQmdSessionKey(key);
	if (!normalized) return {};
	const parts = normalized.split(":").filter(Boolean);
	let chatType;
	if (parts.length >= 2 && (parts[1] === "group" || parts[1] === "channel" || parts[1] === "direct" || parts[1] === "dm")) {
		if (parts.includes("group")) chatType = "group";
		else if (parts.includes("channel")) chatType = "channel";
		return {
			normalizedKey: normalized,
			channel: parts[0]?.toLowerCase(),
			chatType: chatType ?? "direct"
		};
	}
	if (normalized.includes(":group:")) return {
		normalizedKey: normalized,
		chatType: "group"
	};
	if (normalized.includes(":channel:")) return {
		normalizedKey: normalized,
		chatType: "channel"
	};
	return {
		normalizedKey: normalized,
		chatType: "direct"
	};
}
function normalizeQmdSessionKey(key) {
	if (!key) return;
	const trimmed = key.trim();
	if (!trimmed) return;
	const normalized = (parseAgentSessionKey(trimmed)?.rest ?? trimmed).toLowerCase();
	if (normalized.startsWith("subagent:")) return;
	return normalized;
}
//#endregion
//#region packages/memory-host-sdk/src/host/qmd-process.ts
function resolveCliSpawnInvocation(params) {
	return materializeWindowsSpawnProgram(resolveWindowsSpawnProgram({
		command: params.command,
		platform: process.platform,
		env: params.env,
		execPath: process.execPath,
		packageName: params.packageName,
		allowShellFallback: false
	}), params.args);
}
async function checkQmdBinaryAvailability(params) {
	let spawnInvocation;
	try {
		spawnInvocation = resolveCliSpawnInvocation({
			command: params.command,
			args: [],
			env: params.env,
			packageName: "qmd"
		});
	} catch (err) {
		return {
			available: false,
			error: formatQmdAvailabilityError(err)
		};
	}
	return await new Promise((resolve) => {
		let settled = false;
		let didSpawn = false;
		const finish = (result) => {
			if (settled) return;
			settled = true;
			if (timer) clearTimeout(timer);
			resolve(result);
		};
		const child = spawn(spawnInvocation.command, spawnInvocation.argv, {
			env: params.env,
			cwd: params.cwd ?? process.cwd(),
			shell: spawnInvocation.shell,
			windowsHide: spawnInvocation.windowsHide,
			stdio: "ignore"
		});
		const timer = setTimeout(() => {
			child.kill("SIGKILL");
			finish({
				available: false,
				error: `spawn ${params.command} timed out after ${params.timeoutMs ?? 2e3}ms`
			});
		}, params.timeoutMs ?? 2e3);
		child.once("error", (err) => {
			finish({
				available: false,
				error: formatQmdAvailabilityError(err)
			});
		});
		child.once("spawn", () => {
			didSpawn = true;
			child.kill();
			finish({ available: true });
		});
		child.once("close", () => {
			if (!didSpawn) return;
			finish({ available: true });
		});
	});
}
async function runCliCommand(params) {
	return await new Promise((resolve, reject) => {
		const child = spawn(params.spawnInvocation.command, params.spawnInvocation.argv, {
			env: params.env,
			cwd: params.cwd,
			shell: params.spawnInvocation.shell,
			windowsHide: params.spawnInvocation.windowsHide
		});
		let stdout = "";
		let stderr = "";
		let stdoutTruncated = false;
		let stderrTruncated = false;
		const discardStdout = params.discardStdout === true;
		const timer = params.timeoutMs ? setTimeout(() => {
			child.kill("SIGKILL");
			reject(/* @__PURE__ */ new Error(`${params.commandSummary} timed out after ${params.timeoutMs}ms`));
		}, params.timeoutMs) : null;
		child.stdout.on("data", (data) => {
			if (discardStdout) return;
			const next = appendOutputWithCap(stdout, data.toString("utf8"), params.maxOutputChars);
			stdout = next.text;
			stdoutTruncated = stdoutTruncated || next.truncated;
		});
		child.stderr.on("data", (data) => {
			const next = appendOutputWithCap(stderr, data.toString("utf8"), params.maxOutputChars);
			stderr = next.text;
			stderrTruncated = stderrTruncated || next.truncated;
		});
		child.on("error", (err) => {
			if (timer) clearTimeout(timer);
			reject(err);
		});
		child.on("close", (code) => {
			if (timer) clearTimeout(timer);
			if (!discardStdout && (stdoutTruncated || stderrTruncated)) {
				reject(/* @__PURE__ */ new Error(`${params.commandSummary} produced too much output (limit ${params.maxOutputChars} chars)`));
				return;
			}
			if (code === 0) resolve({
				stdout,
				stderr
			});
			else reject(/* @__PURE__ */ new Error(`${params.commandSummary} failed (code ${code}): ${stderr || stdout}`));
		});
	});
}
function appendOutputWithCap(current, chunk, maxChars) {
	const appended = current + chunk;
	if (appended.length <= maxChars) return {
		text: appended,
		truncated: false
	};
	return {
		text: appended.slice(-maxChars),
		truncated: true
	};
}
function formatQmdAvailabilityError(err) {
	if (err instanceof Error && err.message) return err.message;
	return String(err);
}
//#endregion
export { deriveQmdScopeChatType as a, buildSessionEntry as c, deriveQmdScopeChannel as i, listSessionFilesForAgent as l, resolveCliSpawnInvocation as n, isQmdScopeAllowed as o, runCliCommand as r, parseQmdQueryJson as s, checkQmdBinaryAvailability as t, sessionPathForFile as u };
