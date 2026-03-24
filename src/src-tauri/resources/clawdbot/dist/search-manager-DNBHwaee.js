import { _ as resolveStateDir } from "./paths-ViKUYWUK.js";
import { t as createSubsystemLogger } from "./subsystem-DISldKSB.js";
import { n as resolveGlobalSingleton } from "./global-singleton-D9TlHTN5.js";
import { y as resolveUserPath } from "./utils-CS0Ikux6.js";
import { p as resolveAgentWorkspaceDir } from "./agent-scope-bjWqU22i.js";
import { t as splitShellArgs } from "./shell-argv-DBxSfCs1.js";
import { t as parseDurationMs } from "./parse-duration-D6oKXEgx.js";
import path from "node:path";
import os from "node:os";
//#region src/memory/backend-config.ts
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
	maxResults: 6,
	maxSnippetChars: 700,
	maxInjectedChars: 4e3,
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
	}]
};
function sanitizeName(input) {
	return input.toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "") || "collection";
}
function scopeCollectionBase(base, agentId) {
	return `${base}-${sanitizeName(agentId)}`;
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
	rawPaths.forEach((entry, index) => {
		const trimmedPath = entry?.path?.trim();
		if (!trimmedPath) return;
		let resolved;
		try {
			resolved = resolvePath(trimmedPath, workspaceDir);
		} catch {
			return;
		}
		const pattern = entry.pattern?.trim() || "**/*.md";
		const name = ensureUniqueName(scopeCollectionBase(entry.name?.trim() || `custom-${index + 1}`, agentId), existing);
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
	return [
		{
			path: workspaceDir,
			pattern: "MEMORY.md",
			base: "memory-root"
		},
		{
			path: workspaceDir,
			pattern: "memory.md",
			base: "memory-alt"
		},
		{
			path: path.join(workspaceDir, "memory"),
			pattern: "**/*.md",
			base: "memory-dir"
		}
	].map((entry) => ({
		name: ensureUniqueName(scopeCollectionBase(entry.base, agentId), existing),
		path: entry.path,
		pattern: entry.pattern,
		kind: "memory"
	}));
}
function resolveMemoryBackendConfig(params) {
	const backend = params.cfg.memory?.backend ?? DEFAULT_BACKEND;
	const citations = params.cfg.memory?.citations ?? DEFAULT_CITATIONS;
	if (backend !== "qmd") return {
		backend: "builtin",
		citations
	};
	const workspaceDir = resolveAgentWorkspaceDir(params.cfg, params.agentId);
	const qmdCfg = params.cfg.memory?.qmd;
	const includeDefaultMemory = qmdCfg?.includeDefaultMemory !== false;
	const nameSet = /* @__PURE__ */ new Set();
	const collections = [...resolveDefaultCollections(includeDefaultMemory, workspaceDir, nameSet, params.agentId), ...resolveCustomPaths(qmdCfg?.paths, workspaceDir, nameSet, params.agentId)];
	const rawCommand = qmdCfg?.command?.trim() || "qmd";
	return {
		backend: "qmd",
		citations,
		qmd: {
			command: splitShellArgs(rawCommand)?.[0] || rawCommand.split(/\s+/)[0] || "qmd",
			mcporter: resolveMcporterConfig(qmdCfg?.mcporter),
			searchMode: resolveSearchMode(qmdCfg?.searchMode),
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
//#region src/memory/search-manager.ts
const MEMORY_SEARCH_MANAGER_CACHE_KEY = Symbol.for("openclaw.memorySearchManagerCache");
function getMemorySearchManagerCacheStore() {
	return resolveGlobalSingleton(MEMORY_SEARCH_MANAGER_CACHE_KEY, () => ({ qmdManagerCache: /* @__PURE__ */ new Map() }));
}
const log = createSubsystemLogger("memory");
const { qmdManagerCache: QMD_MANAGER_CACHE } = getMemorySearchManagerCacheStore();
let managerRuntimePromise = null;
function loadManagerRuntime() {
	managerRuntimePromise ??= import("./manager-runtime-DWtZmukI.js");
	return managerRuntimePromise;
}
async function getMemorySearchManager(params) {
	const resolved = resolveMemoryBackendConfig(params);
	if (resolved.backend === "qmd" && resolved.qmd) {
		const statusOnly = params.purpose === "status";
		const cacheKey = `${buildQmdCacheKey(params.agentId, resolved.qmd)}:${statusOnly ? "status" : "full"}`;
		const cached = QMD_MANAGER_CACHE.get(cacheKey);
		if (cached) return { manager: cached };
		if (statusOnly) {
			const manager = new QmdStatusOnlyManager({
				cfg: params.cfg,
				agentId: params.agentId,
				resolved: resolved.qmd
			});
			QMD_MANAGER_CACHE.set(cacheKey, manager);
			return { manager };
		}
		try {
			const { QmdMemoryManager } = await import("./qmd-manager-DI073cG2.js");
			const primary = await QmdMemoryManager.create({
				cfg: params.cfg,
				agentId: params.agentId,
				resolved,
				mode: statusOnly ? "status" : "full"
			});
			if (primary) {
				if (statusOnly) {
					QMD_MANAGER_CACHE.set(cacheKey, primary);
					return { manager: primary };
				}
				const wrapper = new FallbackMemoryManager({
					primary,
					fallbackFactory: async () => {
						const { MemoryIndexManager } = await loadManagerRuntime();
						return await MemoryIndexManager.get(params);
					}
				}, () => {
					QMD_MANAGER_CACHE.delete(cacheKey);
				});
				QMD_MANAGER_CACHE.set(cacheKey, wrapper);
				return { manager: wrapper };
			}
		} catch (err) {
			const message = err instanceof Error ? err.message : String(err);
			log.warn(`qmd memory unavailable; falling back to builtin: ${message}`);
		}
	}
	try {
		const { MemoryIndexManager } = await loadManagerRuntime();
		return { manager: await MemoryIndexManager.get(params) };
	} catch (err) {
		return {
			manager: null,
			error: err instanceof Error ? err.message : String(err)
		};
	}
}
var QmdStatusOnlyManager = class {
	constructor(params) {
		this.params = params;
		this.workspaceDir = resolveAgentWorkspaceDir(params.cfg, params.agentId);
		const stateDir = resolveStateDir(process.env, os.homedir);
		this.indexPath = path.join(stateDir, "agents", params.agentId, "qmd", "xdg-cache", "qmd", "index.sqlite");
		this.sourceSet = new Set(params.resolved.collections.map((collection) => collection.kind === "sessions" ? "sessions" : "memory"));
	}
	async search() {
		throw new Error("memory search unavailable in status-only mode");
	}
	async readFile() {
		throw new Error("memory read unavailable in status-only mode");
	}
	status() {
		return {
			backend: "qmd",
			provider: "qmd",
			model: "qmd",
			requestedProvider: "qmd",
			files: 0,
			chunks: 0,
			dirty: false,
			workspaceDir: this.workspaceDir,
			dbPath: this.indexPath,
			sources: Array.from(this.sourceSet),
			vector: {
				enabled: true,
				available: true
			},
			batch: {
				enabled: false,
				failures: 0,
				limit: 0,
				wait: false,
				concurrency: 0,
				pollIntervalMs: 0,
				timeoutMs: 0
			},
			custom: { qmd: {
				collections: this.params.resolved.collections.length,
				lastUpdateAt: null,
				lightweightStatus: true
			} }
		};
	}
	async sync() {}
	async probeEmbeddingAvailability() {
		return { ok: true };
	}
	async probeVectorAvailability() {
		return true;
	}
	async close() {}
};
async function closeAllMemorySearchManagers() {
	const managers = Array.from(QMD_MANAGER_CACHE.values());
	QMD_MANAGER_CACHE.clear();
	for (const manager of managers) try {
		await manager.close?.();
	} catch (err) {
		log.warn(`failed to close qmd memory manager: ${String(err)}`);
	}
	if (managerRuntimePromise !== null) {
		const { closeAllMemoryIndexManagers } = await loadManagerRuntime();
		await closeAllMemoryIndexManagers();
	}
}
var FallbackMemoryManager = class {
	constructor(deps, onClose) {
		this.deps = deps;
		this.onClose = onClose;
		this.fallback = null;
		this.primaryFailed = false;
		this.cacheEvicted = false;
	}
	async search(query, opts) {
		if (!this.primaryFailed) try {
			return await this.deps.primary.search(query, opts);
		} catch (err) {
			this.primaryFailed = true;
			this.lastError = err instanceof Error ? err.message : String(err);
			log.warn(`qmd memory failed; switching to builtin index: ${this.lastError}`);
			await this.deps.primary.close?.().catch(() => {});
			this.evictCacheEntry();
		}
		const fallback = await this.ensureFallback();
		if (fallback) return await fallback.search(query, opts);
		throw new Error(this.lastError ?? "memory search unavailable");
	}
	async readFile(params) {
		if (!this.primaryFailed) return await this.deps.primary.readFile(params);
		const fallback = await this.ensureFallback();
		if (fallback) return await fallback.readFile(params);
		throw new Error(this.lastError ?? "memory read unavailable");
	}
	status() {
		if (!this.primaryFailed) return this.deps.primary.status();
		const fallbackStatus = this.fallback?.status();
		const fallbackInfo = {
			from: "qmd",
			reason: this.lastError ?? "unknown"
		};
		if (fallbackStatus) {
			const custom = fallbackStatus.custom ?? {};
			return {
				...fallbackStatus,
				fallback: fallbackInfo,
				custom: {
					...custom,
					fallback: {
						disabled: true,
						reason: this.lastError ?? "unknown"
					}
				}
			};
		}
		const primaryStatus = this.deps.primary.status();
		const custom = primaryStatus.custom ?? {};
		return {
			...primaryStatus,
			fallback: fallbackInfo,
			custom: {
				...custom,
				fallback: {
					disabled: true,
					reason: this.lastError ?? "unknown"
				}
			}
		};
	}
	async sync(params) {
		if (!this.primaryFailed) {
			await this.deps.primary.sync?.(params);
			return;
		}
		await (await this.ensureFallback())?.sync?.(params);
	}
	async probeEmbeddingAvailability() {
		if (!this.primaryFailed) return await this.deps.primary.probeEmbeddingAvailability();
		const fallback = await this.ensureFallback();
		if (fallback) return await fallback.probeEmbeddingAvailability();
		return {
			ok: false,
			error: this.lastError ?? "memory embeddings unavailable"
		};
	}
	async probeVectorAvailability() {
		if (!this.primaryFailed) return await this.deps.primary.probeVectorAvailability();
		return await (await this.ensureFallback())?.probeVectorAvailability() ?? false;
	}
	async close() {
		await this.deps.primary.close?.();
		await this.fallback?.close?.();
		this.evictCacheEntry();
	}
	async ensureFallback() {
		if (this.fallback) return this.fallback;
		let fallback;
		try {
			fallback = await this.deps.fallbackFactory();
			if (!fallback) {
				log.warn("memory fallback requested but builtin index is unavailable");
				return null;
			}
		} catch (err) {
			const message = err instanceof Error ? err.message : String(err);
			log.warn(`memory fallback unavailable: ${message}`);
			return null;
		}
		this.fallback = fallback;
		return this.fallback;
	}
	evictCacheEntry() {
		if (this.cacheEvicted) return;
		this.cacheEvicted = true;
		this.onClose?.();
	}
};
function buildQmdCacheKey(agentId, config) {
	return `${agentId}:${JSON.stringify(config)}`;
}
//#endregion
export { getMemorySearchManager as n, resolveMemoryBackendConfig as r, closeAllMemorySearchManagers as t };
