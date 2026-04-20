import { i as normalizeLowercaseStringOrEmpty, s as normalizeOptionalString } from "./string-coerce-BUSzWgUA.js";
import { m as resolveUserPath } from "./utils-D5DtWkEu.js";
import { c as normalizeAgentId } from "./session-key-Bh1lMwK5.js";
import { b as resolveAgentWorkspaceDir, v as resolveAgentContextLimits } from "./agent-scope-KFH9bkHi.js";
import { t as parseDurationMs } from "./parse-duration-DHL2gXIv.js";
import { t as splitShellArgs } from "./shell-argv-DluwKu9O.js";
import { t as resolveMemorySearchConfig } from "./memory-search-ABYPOqC9.js";
import { l as normalizeExtraMemoryPaths, m as statRegularFile, p as isFileMissingError, s as isMemoryPath } from "./internal-DHMTwtHq.js";
import fs from "node:fs";
import path from "node:path";
import fs$1 from "node:fs/promises";
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
//#region src/memory-host-sdk/host/backend-config.ts
const DEFAULT_BACKEND = "builtin";
const DEFAULT_CITATIONS = "auto";
const DEFAULT_QMD_INTERVAL = "5m";
const DEFAULT_QMD_DEBOUNCE_MS = 15e3;
const DEFAULT_QMD_TIMEOUT_MS = 4e3;
const DEFAULT_QMD_SEARCH_MODE = "search";
const DEFAULT_QMD_EMBED_INTERVAL = "60m";
const DEFAULT_QMD_COMMAND_TIMEOUT_MS = 3e4;
const DEFAULT_QMD_UPDATE_TIMEOUT_MS = 12e4;
const DEFAULT_QMD_EMBED_TIMEOUT_MS = 12e4;
const DEFAULT_QMD_LIMITS = {
	maxResults: 4,
	maxSnippetChars: 450,
	maxInjectedChars: 2200,
	timeoutMs: DEFAULT_QMD_TIMEOUT_MS
};
const DEFAULT_QMD_MCPORTER = {
	enabled: false,
	serverName: "qmd",
	startDaemon: true
};
const DEFAULT_QMD_SCOPE = {
	default: "deny",
	rules: [{
		action: "allow",
		match: { chatType: "direct" }
	}, {
		action: "allow",
		match: { chatType: "channel" }
	}]
};
function sanitizeName(input) {
	return normalizeLowercaseStringOrEmpty(input).replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "") || "collection";
}
function scopeCollectionBase(base, agentId) {
	return `${base}-${sanitizeName(agentId)}`;
}
function canonicalizePathForContainment(rawPath) {
	const resolved = path.resolve(rawPath);
	let current = resolved;
	const suffix = [];
	while (true) try {
		const canonical = path.normalize(fs.realpathSync.native(current));
		return path.normalize(path.join(canonical, ...suffix));
	} catch {
		const parent = path.dirname(current);
		if (parent === current) return path.normalize(resolved);
		suffix.unshift(path.basename(current));
		current = parent;
	}
}
function isPathInsideRoot(candidatePath, rootPath) {
	const relative = path.relative(canonicalizePathForContainment(rootPath), canonicalizePathForContainment(candidatePath));
	return relative === "" || !relative.startsWith("..") && !path.isAbsolute(relative);
}
function ensureUniqueName(base, existing) {
	let name = sanitizeName(base);
	if (!existing.has(name)) {
		existing.add(name);
		return name;
	}
	let suffix = 2;
	while (existing.has(`${name}-${suffix}`)) suffix += 1;
	const unique = `${name}-${suffix}`;
	existing.add(unique);
	return unique;
}
function resolvePath(raw, workspaceDir) {
	const trimmed = raw.trim();
	if (!trimmed) throw new Error("path required");
	if (trimmed.startsWith("~") || path.isAbsolute(trimmed)) return path.normalize(resolveUserPath(trimmed));
	return path.normalize(path.resolve(workspaceDir, trimmed));
}
function resolveIntervalMs(raw) {
	const value = raw?.trim();
	if (!value) return parseDurationMs(DEFAULT_QMD_INTERVAL, { defaultUnit: "m" });
	try {
		return parseDurationMs(value, { defaultUnit: "m" });
	} catch {
		return parseDurationMs(DEFAULT_QMD_INTERVAL, { defaultUnit: "m" });
	}
}
function resolveEmbedIntervalMs(raw) {
	const value = raw?.trim();
	if (!value) return parseDurationMs(DEFAULT_QMD_EMBED_INTERVAL, { defaultUnit: "m" });
	try {
		return parseDurationMs(value, { defaultUnit: "m" });
	} catch {
		return parseDurationMs(DEFAULT_QMD_EMBED_INTERVAL, { defaultUnit: "m" });
	}
}
function resolveDebounceMs(raw) {
	if (typeof raw === "number" && Number.isFinite(raw) && raw >= 0) return Math.floor(raw);
	return DEFAULT_QMD_DEBOUNCE_MS;
}
function resolveTimeoutMs(raw, fallback) {
	if (typeof raw === "number" && Number.isFinite(raw) && raw > 0) return Math.floor(raw);
	return fallback;
}
function resolveLimits(raw) {
	const parsed = { ...DEFAULT_QMD_LIMITS };
	if (raw?.maxResults && raw.maxResults > 0) parsed.maxResults = Math.floor(raw.maxResults);
	if (raw?.maxSnippetChars && raw.maxSnippetChars > 0) parsed.maxSnippetChars = Math.floor(raw.maxSnippetChars);
	if (raw?.maxInjectedChars && raw.maxInjectedChars > 0) parsed.maxInjectedChars = Math.floor(raw.maxInjectedChars);
	if (raw?.timeoutMs && raw.timeoutMs > 0) parsed.timeoutMs = Math.floor(raw.timeoutMs);
	return parsed;
}
function resolveSearchMode(raw) {
	if (raw === "search" || raw === "vsearch" || raw === "query") return raw;
	return DEFAULT_QMD_SEARCH_MODE;
}
function resolveSearchTool(raw) {
	const value = raw?.trim();
	return value ? value : void 0;
}
function resolveSessionConfig(cfg, workspaceDir) {
	const enabled = Boolean(cfg?.enabled);
	const exportDirRaw = cfg?.exportDir?.trim();
	return {
		enabled,
		exportDir: exportDirRaw ? resolvePath(exportDirRaw, workspaceDir) : void 0,
		retentionDays: cfg?.retentionDays && cfg.retentionDays > 0 ? Math.floor(cfg.retentionDays) : void 0
	};
}
function resolveCustomPaths(rawPaths, workspaceDir, existing, agentId) {
	if (!rawPaths?.length) return [];
	const collections = [];
	const seenRoots = /* @__PURE__ */ new Set();
	rawPaths.forEach((entry, index) => {
		const trimmedPath = normalizeOptionalString(entry?.path);
		if (!trimmedPath) return;
		let resolved;
		try {
			resolved = resolvePath(trimmedPath, workspaceDir);
		} catch {
			return;
		}
		const pattern = normalizeOptionalString(entry.pattern) || "**/*.md";
		const dedupeKey = `${resolved}\u0000${pattern}`;
		if (seenRoots.has(dedupeKey)) return;
		seenRoots.add(dedupeKey);
		const explicitName = entry.name?.trim();
		const name = ensureUniqueName(explicitName && !isPathInsideRoot(resolved, workspaceDir) ? explicitName : scopeCollectionBase(explicitName || `custom-${index + 1}`, agentId), existing);
		collections.push({
			name,
			path: resolved,
			pattern,
			kind: "custom"
		});
	});
	return collections;
}
function resolveMcporterConfig(raw) {
	const parsed = { ...DEFAULT_QMD_MCPORTER };
	if (!raw) return parsed;
	if (raw.enabled !== void 0) parsed.enabled = raw.enabled;
	if (typeof raw.serverName === "string" && raw.serverName.trim()) parsed.serverName = raw.serverName.trim();
	if (raw.startDaemon !== void 0) parsed.startDaemon = raw.startDaemon;
	if (parsed.enabled && raw.startDaemon === void 0) parsed.startDaemon = true;
	return parsed;
}
function resolveDefaultCollections(include, workspaceDir, existing, agentId) {
	if (!include) return [];
	return [{
		path: workspaceDir,
		pattern: "MEMORY.md",
		base: "memory-root"
	}, {
		path: path.join(workspaceDir, "memory"),
		pattern: "**/*.md",
		base: "memory-dir"
	}].map((entry) => ({
		name: ensureUniqueName(scopeCollectionBase(entry.base, agentId), existing),
		path: entry.path,
		pattern: entry.pattern,
		kind: "memory"
	}));
}
function resolveMemoryBackendConfig(params) {
	const normalizedAgentId = normalizeAgentId(params.agentId);
	const backend = params.cfg.memory?.backend ?? DEFAULT_BACKEND;
	const citations = params.cfg.memory?.citations ?? DEFAULT_CITATIONS;
	if (backend !== "qmd") return {
		backend: "builtin",
		citations
	};
	const workspaceDir = resolveAgentWorkspaceDir(params.cfg, normalizedAgentId);
	const qmdCfg = params.cfg.memory?.qmd;
	const includeDefaultMemory = qmdCfg?.includeDefaultMemory !== false;
	const nameSet = /* @__PURE__ */ new Set();
	const agentEntry = params.cfg.agents?.list?.find((entry) => normalizeAgentId(entry?.id) === normalizedAgentId);
	const mergedExtraPaths = [...params.cfg.agents?.defaults?.memorySearch?.extraPaths ?? [], ...agentEntry?.memorySearch?.extraPaths ?? []].filter((value) => typeof value === "string").map((value) => value.trim()).filter(Boolean);
	const searchExtraPaths = Array.from(new Set(mergedExtraPaths)).map((pathValue) => ({ path: pathValue }));
	const mergedExtraCollections = [...params.cfg.agents?.defaults?.memorySearch?.qmd?.extraCollections ?? [], ...agentEntry?.memorySearch?.qmd?.extraCollections ?? []].filter((value) => value !== null && typeof value === "object" && typeof value.path === "string");
	const allQmdPaths = [
		...qmdCfg?.paths ?? [],
		...searchExtraPaths,
		...mergedExtraCollections
	];
	const collections = [...resolveDefaultCollections(includeDefaultMemory, workspaceDir, nameSet, normalizedAgentId), ...resolveCustomPaths(allQmdPaths, workspaceDir, nameSet, normalizedAgentId)];
	const rawCommand = normalizeOptionalString(qmdCfg?.command) || "qmd";
	return {
		backend: "qmd",
		citations,
		qmd: {
			command: splitShellArgs(rawCommand)?.[0] || rawCommand.split(/\s+/)[0] || "qmd",
			mcporter: resolveMcporterConfig(qmdCfg?.mcporter),
			searchMode: resolveSearchMode(qmdCfg?.searchMode),
			searchTool: resolveSearchTool(qmdCfg?.searchTool),
			collections,
			includeDefaultMemory,
			sessions: resolveSessionConfig(qmdCfg?.sessions, workspaceDir),
			update: {
				intervalMs: resolveIntervalMs(qmdCfg?.update?.interval),
				debounceMs: resolveDebounceMs(qmdCfg?.update?.debounceMs),
				onBoot: qmdCfg?.update?.onBoot !== false,
				waitForBootSync: qmdCfg?.update?.waitForBootSync === true,
				embedIntervalMs: resolveEmbedIntervalMs(qmdCfg?.update?.embedInterval),
				commandTimeoutMs: resolveTimeoutMs(qmdCfg?.update?.commandTimeoutMs, DEFAULT_QMD_COMMAND_TIMEOUT_MS),
				updateTimeoutMs: resolveTimeoutMs(qmdCfg?.update?.updateTimeoutMs, DEFAULT_QMD_UPDATE_TIMEOUT_MS),
				embedTimeoutMs: resolveTimeoutMs(qmdCfg?.update?.embedTimeoutMs, DEFAULT_QMD_EMBED_TIMEOUT_MS)
			},
			limits: resolveLimits(qmdCfg?.limits),
			scope: qmdCfg?.scope ?? DEFAULT_QMD_SCOPE
		}
	};
}
//#endregion
export { DEFAULT_MEMORY_READ_MAX_CHARS as a, DEFAULT_MEMORY_READ_LINES as i, readAgentMemoryFile as n, buildMemoryReadResult as o, readMemoryFile as r, buildMemoryReadResultFromSlice as s, resolveMemoryBackendConfig as t };
