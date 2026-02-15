import { l as createSubsystemLogger } from "./exec-DBtWJ4Ld.js";
import { o as resolveSessionTranscriptsDirForAgent } from "./paths-CpGplyYJ.js";
import { t as redactSensitiveText } from "./redact-DcuzVizL.js";
import { createRequire } from "node:module";
import fs from "node:fs/promises";
import path from "node:path";
import fs$1 from "node:fs";
import crypto from "node:crypto";

//#region src/memory/internal.ts
function ensureDir(dir) {
	try {
		fs$1.mkdirSync(dir, { recursive: true });
	} catch {}
	return dir;
}
function normalizeRelPath(value) {
	return value.trim().replace(/^[./]+/, "").replace(/\\/g, "/");
}
function normalizeExtraMemoryPaths(workspaceDir, extraPaths) {
	if (!extraPaths?.length) return [];
	const resolved = extraPaths.map((value) => value.trim()).filter(Boolean).map((value) => path.isAbsolute(value) ? path.resolve(value) : path.resolve(workspaceDir, value));
	return Array.from(new Set(resolved));
}
function isMemoryPath(relPath) {
	const normalized = normalizeRelPath(relPath);
	if (!normalized) return false;
	if (normalized === "MEMORY.md" || normalized === "memory.md") return true;
	return normalized.startsWith("memory/");
}
async function walkDir(dir, files) {
	const entries = await fs.readdir(dir, { withFileTypes: true });
	for (const entry of entries) {
		const full = path.join(dir, entry.name);
		if (entry.isSymbolicLink()) continue;
		if (entry.isDirectory()) {
			await walkDir(full, files);
			continue;
		}
		if (!entry.isFile()) continue;
		if (!entry.name.endsWith(".md")) continue;
		files.push(full);
	}
}
async function listMemoryFiles(workspaceDir, extraPaths) {
	const result = [];
	const memoryFile = path.join(workspaceDir, "MEMORY.md");
	const altMemoryFile = path.join(workspaceDir, "memory.md");
	const memoryDir = path.join(workspaceDir, "memory");
	const addMarkdownFile = async (absPath) => {
		try {
			const stat = await fs.lstat(absPath);
			if (stat.isSymbolicLink() || !stat.isFile()) return;
			if (!absPath.endsWith(".md")) return;
			result.push(absPath);
		} catch {}
	};
	await addMarkdownFile(memoryFile);
	await addMarkdownFile(altMemoryFile);
	try {
		const dirStat = await fs.lstat(memoryDir);
		if (!dirStat.isSymbolicLink() && dirStat.isDirectory()) await walkDir(memoryDir, result);
	} catch {}
	const normalizedExtraPaths = normalizeExtraMemoryPaths(workspaceDir, extraPaths);
	if (normalizedExtraPaths.length > 0) for (const inputPath of normalizedExtraPaths) try {
		const stat = await fs.lstat(inputPath);
		if (stat.isSymbolicLink()) continue;
		if (stat.isDirectory()) {
			await walkDir(inputPath, result);
			continue;
		}
		if (stat.isFile() && inputPath.endsWith(".md")) result.push(inputPath);
	} catch {}
	if (result.length <= 1) return result;
	const seen = /* @__PURE__ */ new Set();
	const deduped = [];
	for (const entry of result) {
		let key = entry;
		try {
			key = await fs.realpath(entry);
		} catch {}
		if (seen.has(key)) continue;
		seen.add(key);
		deduped.push(entry);
	}
	return deduped;
}
function hashText(value) {
	return crypto.createHash("sha256").update(value).digest("hex");
}
async function buildFileEntry(absPath, workspaceDir) {
	const stat = await fs.stat(absPath);
	const hash = hashText(await fs.readFile(absPath, "utf-8"));
	return {
		path: path.relative(workspaceDir, absPath).replace(/\\/g, "/"),
		absPath,
		mtimeMs: stat.mtimeMs,
		size: stat.size,
		hash
	};
}
function chunkMarkdown(content, chunking) {
	const lines = content.split("\n");
	if (lines.length === 0) return [];
	const maxChars = Math.max(32, chunking.tokens * 4);
	const overlapChars = Math.max(0, chunking.overlap * 4);
	const chunks = [];
	let current = [];
	let currentChars = 0;
	const flush = () => {
		if (current.length === 0) return;
		const firstEntry = current[0];
		const lastEntry = current[current.length - 1];
		if (!firstEntry || !lastEntry) return;
		const text = current.map((entry) => entry.line).join("\n");
		const startLine = firstEntry.lineNo;
		const endLine = lastEntry.lineNo;
		chunks.push({
			startLine,
			endLine,
			text,
			hash: hashText(text)
		});
	};
	const carryOverlap = () => {
		if (overlapChars <= 0 || current.length === 0) {
			current = [];
			currentChars = 0;
			return;
		}
		let acc = 0;
		const kept = [];
		for (let i = current.length - 1; i >= 0; i -= 1) {
			const entry = current[i];
			if (!entry) continue;
			acc += entry.line.length + 1;
			kept.unshift(entry);
			if (acc >= overlapChars) break;
		}
		current = kept;
		currentChars = kept.reduce((sum, entry) => sum + entry.line.length + 1, 0);
	};
	for (let i = 0; i < lines.length; i += 1) {
		const line = lines[i] ?? "";
		const lineNo = i + 1;
		const segments = [];
		if (line.length === 0) segments.push("");
		else for (let start = 0; start < line.length; start += maxChars) segments.push(line.slice(start, start + maxChars));
		for (const segment of segments) {
			const lineSize = segment.length + 1;
			if (currentChars + lineSize > maxChars && current.length > 0) {
				flush();
				carryOverlap();
			}
			current.push({
				line: segment,
				lineNo
			});
			currentChars += lineSize;
		}
	}
	flush();
	return chunks;
}
/**
* Remap chunk startLine/endLine from content-relative positions to original
* source file positions using a lineMap.  Each entry in lineMap gives the
* 1-indexed source line for the corresponding 0-indexed content line.
*
* This is used for session JSONL files where buildSessionEntry() flattens
* messages into a plain-text string before chunking.  Without remapping the
* stored line numbers would reference positions in the flattened text rather
* than the original JSONL file.
*/
function remapChunkLines(chunks, lineMap) {
	if (!lineMap || lineMap.length === 0) return;
	for (const chunk of chunks) {
		chunk.startLine = lineMap[chunk.startLine - 1] ?? chunk.startLine;
		chunk.endLine = lineMap[chunk.endLine - 1] ?? chunk.endLine;
	}
}
function parseEmbedding(raw) {
	try {
		const parsed = JSON.parse(raw);
		return Array.isArray(parsed) ? parsed : [];
	} catch {
		return [];
	}
}
function cosineSimilarity(a, b) {
	if (a.length === 0 || b.length === 0) return 0;
	const len = Math.min(a.length, b.length);
	let dot = 0;
	let normA = 0;
	let normB = 0;
	for (let i = 0; i < len; i += 1) {
		const av = a[i] ?? 0;
		const bv = b[i] ?? 0;
		dot += av * bv;
		normA += av * av;
		normB += bv * bv;
	}
	if (normA === 0 || normB === 0) return 0;
	return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}
async function runWithConcurrency(tasks, limit) {
	if (tasks.length === 0) return [];
	const resolvedLimit = Math.max(1, Math.min(limit, tasks.length));
	const results = Array.from({ length: tasks.length });
	let next = 0;
	let firstError = null;
	const workers = Array.from({ length: resolvedLimit }, async () => {
		while (true) {
			if (firstError) return;
			const index = next;
			next += 1;
			if (index >= tasks.length) return;
			try {
				results[index] = await tasks[index]();
			} catch (err) {
				firstError = err;
				return;
			}
		}
	});
	await Promise.allSettled(workers);
	if (firstError) throw firstError;
	return results;
}

//#endregion
//#region src/memory/session-files.ts
const log = createSubsystemLogger("memory");
async function listSessionFilesForAgent(agentId) {
	const dir = resolveSessionTranscriptsDirForAgent(agentId);
	try {
		return (await fs.readdir(dir, { withFileTypes: true })).filter((entry) => entry.isFile()).map((entry) => entry.name).filter((name) => name.endsWith(".jsonl")).map((name) => path.join(dir, name));
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
		log.debug(`Failed reading session file ${absPath}: ${String(err)}`);
		return null;
	}
}

//#endregion
//#region src/infra/warning-filter.ts
const warningFilterKey = Symbol.for("openclaw.warning-filter");
function shouldIgnoreWarning(warning) {
	if (warning.code === "DEP0040" && warning.message?.includes("punycode")) return true;
	if (warning.code === "DEP0060" && warning.message?.includes("util._extend")) return true;
	if (warning.name === "ExperimentalWarning" && warning.message?.includes("SQLite is an experimental feature")) return true;
	return false;
}
function normalizeWarningArgs(args) {
	const warningArg = args[0];
	const secondArg = args[1];
	const thirdArg = args[2];
	let name;
	let code;
	let message;
	if (warningArg instanceof Error) {
		name = warningArg.name;
		message = warningArg.message;
		code = warningArg.code;
	} else if (typeof warningArg === "string") message = warningArg;
	if (secondArg && typeof secondArg === "object" && !Array.isArray(secondArg)) {
		const options = secondArg;
		if (typeof options.type === "string") name = options.type;
		if (typeof options.code === "string") code = options.code;
	} else {
		if (typeof secondArg === "string") name = secondArg;
		if (typeof thirdArg === "string") code = thirdArg;
	}
	return {
		name,
		code,
		message
	};
}
function installProcessWarningFilter() {
	const globalState = globalThis;
	if (globalState[warningFilterKey]?.installed) return;
	const originalEmitWarning = process.emitWarning.bind(process);
	const wrappedEmitWarning = ((...args) => {
		if (shouldIgnoreWarning(normalizeWarningArgs(args))) return;
		return Reflect.apply(originalEmitWarning, process, args);
	});
	process.emitWarning = wrappedEmitWarning;
	globalState[warningFilterKey] = { installed: true };
}

//#endregion
//#region src/memory/sqlite.ts
const require = createRequire(import.meta.url);
function requireNodeSqlite() {
	installProcessWarningFilter();
	return require("node:sqlite");
}

//#endregion
export { buildFileEntry as a, ensureDir as c, listMemoryFiles as d, normalizeExtraMemoryPaths as f, runWithConcurrency as h, sessionPathForFile as i, hashText as l, remapChunkLines as m, buildSessionEntry as n, chunkMarkdown as o, parseEmbedding as p, listSessionFilesForAgent as r, cosineSimilarity as s, requireNodeSqlite as t, isMemoryPath as u };