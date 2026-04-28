import { t as runTasksWithConcurrency } from "./run-with-concurrency-CBZG2z70.js";
import { x as resolveAgentWorkspaceDir, y as resolveAgentContextLimits } from "./agent-scope-i10se9ty.js";
import { n as detectMime } from "./mime-B-vvNIo6.js";
import { c as shouldSkipRootMemoryAuxiliaryPath, i as resolveCanonicalRootMemoryFile } from "./root-memory-files-C1geB1Vs.js";
import { t as estimateStringChars } from "./cjk-chars-BExHXToM.js";
import { n as buildMemoryMultimodalLabel, r as classifyMemoryMultimodalPath } from "./multimodal-CftZlPfF.js";
import { t as resolveMemorySearchConfig } from "./memory-search-BkPKyCZS.js";
import { r as estimateStructuredEmbeddingInputBytes, t as buildTextEmbeddingInput } from "./embedding-inputs-CGmwR8sj.js";
import { t as hashText } from "./hash-DyKb70k4.js";
import fs from "node:fs";
import path from "node:path";
import fs$1 from "node:fs/promises";
import crypto from "node:crypto";
//#region src/memory-host-sdk/host/fs-utils.ts
function isFileMissingError(err) {
	return Boolean(err && typeof err === "object" && "code" in err && err.code === "ENOENT");
}
async function statRegularFile(absPath) {
	let stat;
	try {
		stat = await fs$1.lstat(absPath);
	} catch (err) {
		if (isFileMissingError(err)) return { missing: true };
		throw err;
	}
	if (stat.isSymbolicLink() || !stat.isFile()) throw new Error("path required");
	return {
		missing: false,
		stat
	};
}
//#endregion
//#region src/memory-host-sdk/host/internal.ts
const DISABLED_MULTIMODAL_SETTINGS = {
	enabled: false,
	modalities: [],
	maxFileBytes: 0
};
function ensureDir(dir) {
	try {
		fs.mkdirSync(dir, { recursive: true });
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
	if (normalized === "MEMORY.md" || normalized === "DREAMS.md") return true;
	return normalized.startsWith("memory/");
}
function isAllowedMemoryFilePath(filePath, multimodal) {
	if (filePath.endsWith(".md")) return true;
	return classifyMemoryMultimodalPath(filePath, multimodal ?? DISABLED_MULTIMODAL_SETTINGS) !== null;
}
async function walkDir(dir, files, multimodal, shouldSkipPath) {
	const entries = await fs$1.readdir(dir, { withFileTypes: true });
	for (const entry of entries) {
		const full = path.join(dir, entry.name);
		if (shouldSkipPath?.(full)) continue;
		if (entry.isSymbolicLink()) continue;
		if (entry.isDirectory()) {
			if (entry.name === ".openclaw-repair") continue;
			await walkDir(full, files, multimodal, shouldSkipPath);
			continue;
		}
		if (!entry.isFile()) continue;
		if (!isAllowedMemoryFilePath(full, multimodal)) continue;
		files.push(full);
	}
}
async function listMemoryFiles(workspaceDir, extraPaths, multimodal) {
	const result = [];
	const memoryDir = path.join(workspaceDir, "memory");
	const shouldSkipWorkspaceMemoryPath = (absPath) => shouldSkipRootMemoryAuxiliaryPath({
		workspaceDir,
		absPath
	});
	const addMarkdownFile = async (absPath) => {
		try {
			const stat = await fs$1.lstat(absPath);
			if (stat.isSymbolicLink() || !stat.isFile()) return;
			if (!absPath.endsWith(".md")) return;
			result.push(absPath);
		} catch {}
	};
	const memoryFile = await resolveCanonicalRootMemoryFile(workspaceDir);
	if (memoryFile) await addMarkdownFile(memoryFile);
	try {
		const dirStat = await fs$1.lstat(memoryDir);
		if (!dirStat.isSymbolicLink() && dirStat.isDirectory()) await walkDir(memoryDir, result, multimodal, shouldSkipWorkspaceMemoryPath);
	} catch {}
	const normalizedExtraPaths = normalizeExtraMemoryPaths(workspaceDir, extraPaths);
	if (normalizedExtraPaths.length > 0) for (const inputPath of normalizedExtraPaths) {
		if (shouldSkipWorkspaceMemoryPath(inputPath)) continue;
		try {
			const stat = await fs$1.lstat(inputPath);
			if (stat.isSymbolicLink()) continue;
			if (stat.isDirectory()) {
				await walkDir(inputPath, result, multimodal, shouldSkipWorkspaceMemoryPath);
				continue;
			}
			if (stat.isFile() && isAllowedMemoryFilePath(inputPath, multimodal)) result.push(inputPath);
		} catch {}
	}
	if (result.length <= 1) return result;
	const seen = /* @__PURE__ */ new Set();
	const deduped = [];
	for (const entry of result) {
		let key = entry;
		try {
			key = await fs$1.realpath(entry);
		} catch {}
		if (seen.has(key)) continue;
		seen.add(key);
		deduped.push(entry);
	}
	return deduped;
}
async function buildFileEntry(absPath, workspaceDir, multimodal) {
	let stat;
	try {
		stat = await fs$1.stat(absPath);
	} catch (err) {
		if (isFileMissingError(err)) return null;
		throw err;
	}
	const normalizedPath = path.relative(workspaceDir, absPath).replace(/\\/g, "/");
	const multimodalSettings = multimodal ?? DISABLED_MULTIMODAL_SETTINGS;
	const modality = classifyMemoryMultimodalPath(absPath, multimodalSettings);
	if (modality) {
		if (stat.size > multimodalSettings.maxFileBytes) return null;
		let buffer;
		try {
			buffer = await fs$1.readFile(absPath);
		} catch (err) {
			if (isFileMissingError(err)) return null;
			throw err;
		}
		const mimeType = await detectMime({
			buffer: buffer.subarray(0, 512),
			filePath: absPath
		});
		if (!mimeType || !mimeType.startsWith(`${modality}/`)) return null;
		const contentText = buildMemoryMultimodalLabel(modality, normalizedPath);
		const dataHash = crypto.createHash("sha256").update(buffer).digest("hex");
		const chunkHash = hashText(JSON.stringify({
			path: normalizedPath,
			contentText,
			mimeType,
			dataHash
		}));
		return {
			path: normalizedPath,
			absPath,
			mtimeMs: stat.mtimeMs,
			size: stat.size,
			hash: chunkHash,
			dataHash,
			kind: "multimodal",
			contentText,
			modality,
			mimeType
		};
	}
	let content;
	try {
		content = await fs$1.readFile(absPath, "utf-8");
	} catch (err) {
		if (isFileMissingError(err)) return null;
		throw err;
	}
	const hash = hashText(content);
	return {
		path: normalizedPath,
		absPath,
		mtimeMs: stat.mtimeMs,
		size: stat.size,
		hash,
		kind: "markdown"
	};
}
async function loadMultimodalEmbeddingInput(entry) {
	if (entry.kind !== "multimodal" || !entry.contentText || !entry.mimeType) return null;
	let stat;
	try {
		stat = await fs$1.stat(entry.absPath);
	} catch (err) {
		if (isFileMissingError(err)) return null;
		throw err;
	}
	if (stat.size !== entry.size) return null;
	let buffer;
	try {
		buffer = await fs$1.readFile(entry.absPath);
	} catch (err) {
		if (isFileMissingError(err)) return null;
		throw err;
	}
	const dataHash = crypto.createHash("sha256").update(buffer).digest("hex");
	if (entry.dataHash && entry.dataHash !== dataHash) return null;
	return {
		text: entry.contentText,
		parts: [{
			type: "text",
			text: entry.contentText
		}, {
			type: "inline-data",
			mimeType: entry.mimeType,
			data: buffer.toString("base64")
		}]
	};
}
async function buildMultimodalChunkForIndexing(entry) {
	const embeddingInput = await loadMultimodalEmbeddingInput(entry);
	if (!embeddingInput) return null;
	return {
		chunk: {
			startLine: 1,
			endLine: 1,
			text: entry.contentText ?? embeddingInput.text,
			hash: entry.hash,
			embeddingInput
		},
		structuredInputBytes: estimateStructuredEmbeddingInputBytes(embeddingInput)
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
			hash: hashText(text),
			embeddingInput: buildTextEmbeddingInput(text)
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
			acc += estimateStringChars(entry.line) + 1;
			kept.unshift(entry);
			if (acc >= overlapChars) break;
		}
		current = kept;
		currentChars = acc;
	};
	for (let i = 0; i < lines.length; i += 1) {
		const line = lines[i] ?? "";
		const lineNo = i + 1;
		const segments = [];
		if (line.length === 0) segments.push("");
		else for (let start = 0; start < line.length; start += maxChars) {
			const coarse = line.slice(start, start + maxChars);
			if (estimateStringChars(coarse) > maxChars) {
				const fineStep = Math.max(1, chunking.tokens);
				for (let j = 0; j < coarse.length;) {
					let end = Math.min(j + fineStep, coarse.length);
					if (end < coarse.length) {
						const code = coarse.charCodeAt(end - 1);
						if (code >= 55296 && code <= 56319) end += 1;
					}
					segments.push(coarse.slice(j, end));
					j = end;
				}
			} else segments.push(coarse);
		}
		for (const segment of segments) {
			const lineSize = estimateStringChars(segment) + 1;
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
	const { results, firstError, hasError } = await runTasksWithConcurrency({
		tasks,
		limit,
		errorMode: "stop"
	});
	if (hasError) throw firstError;
	return results;
}
//#endregion
//#region src/memory-host-sdk/host/read-file-shared.ts
const DEFAULT_MEMORY_READ_LINES = 120;
const DEFAULT_MEMORY_READ_MAX_CHARS = 12e3;
function buildContinuationNotice(params) {
	const base = typeof params.nextFrom === "number" ? `[More content available. Use from=${params.nextFrom} to continue.]` : "[More content available. Requested excerpt exceeded the default maxChars budget.]";
	const fallback = params.suggestReadFallback ? " If you need the full raw line, use read on the source file." : "";
	return `\n\n${base.slice(0, -1)}${fallback}]`;
}
function fitLinesToCharBudget(params) {
	const { lines, maxChars } = params;
	if (lines.length === 0) return {
		text: "",
		includedLines: 0,
		hardTruncatedSingleLine: false
	};
	let includedLines = lines.length;
	let text = lines.join("\n");
	while (includedLines > 1 && text.length > maxChars) {
		includedLines -= 1;
		text = lines.slice(0, includedLines).join("\n");
	}
	if (text.length <= maxChars) return {
		text,
		includedLines,
		hardTruncatedSingleLine: false
	};
	return {
		text: text.slice(0, maxChars),
		includedLines: 1,
		hardTruncatedSingleLine: true
	};
}
function buildMemoryReadResultFromSlice(params) {
	const start = Math.max(1, params.startLine);
	const fitted = fitLinesToCharBudget({
		lines: params.selectedLines,
		maxChars: Math.max(1, params.maxChars ?? 12e3)
	});
	const moreSourceLinesRemain = params.moreSourceLinesRemain ?? false;
	const charCapTruncated = fitted.hardTruncatedSingleLine || fitted.includedLines < params.selectedLines.length;
	const nextFrom = !fitted.hardTruncatedSingleLine && (moreSourceLinesRemain || fitted.includedLines < params.selectedLines.length) ? start + fitted.includedLines : void 0;
	const truncated = charCapTruncated || moreSourceLinesRemain;
	return {
		text: truncated && fitted.text ? `${fitted.text}${buildContinuationNotice({
			nextFrom,
			suggestReadFallback: fitted.hardTruncatedSingleLine && params.suggestReadFallback
		})}` : fitted.text,
		path: params.relPath,
		from: start,
		lines: fitted.includedLines,
		...truncated ? { truncated: true } : {},
		...typeof nextFrom === "number" ? { nextFrom } : {}
	};
}
function buildMemoryReadResult(params) {
	const fileLines = params.content.split("\n");
	const start = Math.max(1, params.from ?? 1);
	const requestedCount = Math.max(1, params.lines ?? params.defaultLines ?? 120);
	const selectedLines = fileLines.slice(start - 1, start - 1 + requestedCount);
	const moreSourceLinesRemain = start - 1 + selectedLines.length < fileLines.length;
	return buildMemoryReadResultFromSlice({
		selectedLines,
		relPath: params.relPath,
		startLine: start,
		moreSourceLinesRemain,
		maxChars: params.maxChars,
		suggestReadFallback: params.suggestReadFallback
	});
}
//#endregion
//#region src/memory-host-sdk/host/read-file.ts
async function readMemoryFile(params) {
	const rawPath = params.relPath.trim();
	if (!rawPath) throw new Error("path required");
	const absPath = path.isAbsolute(rawPath) ? path.resolve(rawPath) : path.resolve(params.workspaceDir, rawPath);
	const relPath = path.relative(params.workspaceDir, absPath).replace(/\\/g, "/");
	const allowedWorkspace = relPath.length > 0 && !relPath.startsWith("..") && !path.isAbsolute(relPath) && isMemoryPath(relPath);
	let allowedAdditional = false;
	if (!allowedWorkspace && (params.extraPaths?.length ?? 0) > 0) {
		const additionalPaths = normalizeExtraMemoryPaths(params.workspaceDir, params.extraPaths);
		for (const additionalPath of additionalPaths) try {
			const stat = await fs$1.lstat(additionalPath);
			if (stat.isSymbolicLink()) continue;
			if (stat.isDirectory()) {
				if (absPath === additionalPath || absPath.startsWith(`${additionalPath}${path.sep}`)) {
					allowedAdditional = true;
					break;
				}
				continue;
			}
			if (stat.isFile() && absPath === additionalPath && absPath.endsWith(".md")) {
				allowedAdditional = true;
				break;
			}
		} catch {}
	}
	if (!allowedWorkspace && !allowedAdditional) throw new Error("path required");
	if (!absPath.endsWith(".md")) throw new Error("path required");
	if ((await statRegularFile(absPath)).missing) return {
		text: "",
		path: relPath
	};
	let content;
	try {
		content = await fs$1.readFile(absPath, "utf-8");
	} catch (err) {
		if (isFileMissingError(err)) return {
			text: "",
			path: relPath
		};
		throw err;
	}
	return buildMemoryReadResult({
		content,
		relPath,
		from: params.from,
		lines: params.lines,
		defaultLines: params.defaultLines ?? 120,
		maxChars: params.maxChars,
		suggestReadFallback: allowedWorkspace
	});
}
async function readAgentMemoryFile(params) {
	const settings = resolveMemorySearchConfig(params.cfg, params.agentId);
	if (!settings) throw new Error("memory search disabled");
	const contextLimits = resolveAgentContextLimits(params.cfg, params.agentId);
	return await readMemoryFile({
		workspaceDir: resolveAgentWorkspaceDir(params.cfg, params.agentId),
		extraPaths: settings.extraPaths,
		relPath: params.relPath,
		from: params.from,
		lines: params.lines,
		defaultLines: contextLimits?.memoryGetDefaultLines,
		maxChars: contextLimits?.memoryGetMaxChars
	});
}
//#endregion
export { isFileMissingError as _, buildMemoryReadResult as a, buildMultimodalChunkForIndexing as c, ensureDir as d, listMemoryFiles as f, runWithConcurrency as g, remapChunkLines as h, DEFAULT_MEMORY_READ_MAX_CHARS as i, chunkMarkdown as l, parseEmbedding as m, readMemoryFile as n, buildMemoryReadResultFromSlice as o, normalizeExtraMemoryPaths as p, DEFAULT_MEMORY_READ_LINES as r, buildFileEntry as s, readAgentMemoryFile as t, cosineSimilarity as u, statRegularFile as v };
