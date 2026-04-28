import { i as formatErrorMessage } from "./errors-CDFVCV9D.js";
import { n as resolveGlobalSingleton } from "./global-singleton-COlWgaGc.js";
import { t as createSubsystemLogger } from "./subsystem-rHhUC6qs.js";
import { c as normalizeAgentId } from "./session-key-hxP9B3Or.js";
import { x as resolveAgentWorkspaceDir, y as resolveAgentContextLimits } from "./agent-scope-i10se9ty.js";
import { n as resolveMemorySearchSyncConfig } from "./memory-search-BkPKyCZS.js";
import "./routing-C--bwZIc.js";
import "./error-runtime-CrtIwOpQ.js";
import { t as resolveMemoryBackendConfig } from "./backend-config-BEtQXaHi.js";
import "./memory-core-host-engine-foundation-Colhnf6q.js";
import { t as checkQmdBinaryAvailability } from "./engine-qmd-BKL1dhli.js";
import "./memory-core-host-engine-qmd-CifASbT7.js";
import "./memory-core-host-engine-storage-1Pbm98Xf.js";
import "./manager-ICKYl3BU.js";
import fs from "node:fs/promises";
//#region extensions/memory-core/src/memory/search-manager.ts
const MEMORY_SEARCH_MANAGER_CACHE_KEY = Symbol.for("openclaw.memorySearchManagerCache");
function createMemorySearchManagerCacheStore() {
	return {
		qmdManagerCache: /* @__PURE__ */ new Map(),
		pendingQmdManagerCreates: /* @__PURE__ */ new Map()
	};
}
function getMemorySearchManagerCacheStore() {
	const resolved = resolveGlobalSingleton(MEMORY_SEARCH_MANAGER_CACHE_KEY, createMemorySearchManagerCacheStore);
	if (typeof resolved === "object" && resolved !== null && resolved.qmdManagerCache instanceof Map && resolved.pendingQmdManagerCreates instanceof Map) return resolved;
	const repaired = createMemorySearchManagerCacheStore();
	globalThis[MEMORY_SEARCH_MANAGER_CACHE_KEY] = repaired;
	return repaired;
}
const log = createSubsystemLogger("memory");
const { qmdManagerCache: QMD_MANAGER_CACHE, pendingQmdManagerCreates: PENDING_QMD_MANAGER_CREATES } = getMemorySearchManagerCacheStore();
let managerRuntimePromise = null;
let qmdManagerModulePromise = null;
function loadManagerRuntime() {
	managerRuntimePromise ??= import("./extensions/memory-core/manager-runtime.js");
	return managerRuntimePromise;
}
function loadQmdManagerModule() {
	qmdManagerModulePromise ??= import("./qmd-manager-DpwrRQ6w.js");
	return qmdManagerModulePromise;
}
async function getMemorySearchManager(params) {
	const resolved = resolveMemoryBackendConfig(params);
	if (resolved.backend === "qmd" && resolved.qmd) {
		const qmdResolved = resolved.qmd;
		const normalizedAgentId = normalizeAgentId(params.agentId);
		const runtimeConfig = resolveQmdManagerRuntimeConfig(params.cfg, normalizedAgentId);
		const { workspaceDir } = runtimeConfig;
		const transient = params.purpose === "status" || params.purpose === "cli";
		const scopeKey = buildQmdManagerScopeKey(normalizedAgentId);
		const identityKey = buildQmdManagerIdentityKey(normalizedAgentId, qmdResolved, runtimeConfig);
		const createPrimaryQmdManager = async (mode) => {
			try {
				await fs.mkdir(workspaceDir, { recursive: true });
			} catch (err) {
				log.warn(`qmd workspace unavailable (${workspaceDir}); falling back to builtin: ${formatErrorMessage(err)}`);
				return null;
			}
			const qmdBinary = await checkQmdBinaryAvailability({
				command: qmdResolved.command,
				env: process.env,
				cwd: workspaceDir
			});
			if (!qmdBinary.available) {
				log.warn(`qmd binary unavailable (${qmdResolved.command}); falling back to builtin: ${qmdBinary.error ?? "unknown error"}`);
				return null;
			}
			try {
				const { QmdMemoryManager } = await loadQmdManagerModule();
				const primary = await QmdMemoryManager.create({
					cfg: params.cfg,
					agentId: normalizedAgentId,
					resolved: {
						...resolved,
						qmd: qmdResolved
					},
					mode,
					runtimeConfig
				});
				if (primary) return primary;
			} catch (err) {
				const message = formatErrorMessage(err);
				log.warn(`qmd memory unavailable; falling back to builtin: ${message}`);
			}
			return null;
		};
		const createFullQmdManager = async (expectedIdentityKey) => {
			const primary = await createPrimaryQmdManager("full");
			if (!primary) return null;
			let cacheEntry;
			cacheEntry = {
				identityKey: expectedIdentityKey,
				manager: new FallbackMemoryManager({
					primary,
					fallbackFactory: async () => {
						const { MemoryIndexManager } = await loadManagerRuntime();
						return await MemoryIndexManager.get(params);
					}
				}, () => {
					if (QMD_MANAGER_CACHE.get(scopeKey) === cacheEntry) QMD_MANAGER_CACHE.delete(scopeKey);
				})
			};
			return cacheEntry;
		};
		while (true) {
			const cached = QMD_MANAGER_CACHE.get(scopeKey);
			if (cached?.identityKey === identityKey) {
				if (params.purpose === "status") return { manager: new BorrowedMemoryManager(cached.manager) };
				if (params.purpose !== "cli") return { manager: cached.manager };
			}
			if (transient) {
				const manager = await createPrimaryQmdManager(params.purpose === "cli" ? "cli" : "status");
				return manager ? { manager } : await getBuiltinMemorySearchManager(params);
			}
			const pending = PENDING_QMD_MANAGER_CREATES.get(scopeKey);
			if (pending) {
				await pending.promise;
				continue;
			}
			const pendingCreate = {
				identityKey,
				promise: (async () => {
					const created = await createFullQmdManager(identityKey);
					if (!created) return null;
					QMD_MANAGER_CACHE.set(scopeKey, created);
					if (cached) await closeQmdManagerForReplacement(cached.manager).catch((err) => {
						log.warn(`failed to retire replaced qmd memory manager: ${formatErrorMessage(err)}`);
					});
					return created.manager;
				})().finally(() => {
					if (PENDING_QMD_MANAGER_CREATES.get(scopeKey) === pendingCreate) PENDING_QMD_MANAGER_CREATES.delete(scopeKey);
				})
			};
			PENDING_QMD_MANAGER_CREATES.set(scopeKey, pendingCreate);
			const manager = await pendingCreate.promise;
			return manager ? { manager } : await getBuiltinMemorySearchManager(params);
		}
	}
	return await getBuiltinMemorySearchManager(params);
}
async function getBuiltinMemorySearchManager(params) {
	try {
		const { MemoryIndexManager } = await loadManagerRuntime();
		return { manager: await MemoryIndexManager.get(params) };
	} catch (err) {
		return {
			manager: null,
			error: formatErrorMessage(err)
		};
	}
}
var BorrowedMemoryManager = class {
	constructor(inner) {
		this.inner = inner;
	}
	async search(query, opts) {
		return await this.inner.search(query, opts);
	}
	async readFile(params) {
		return await this.inner.readFile(params);
	}
	status() {
		return this.inner.status();
	}
	async sync(params) {
		await this.inner.sync?.(params);
	}
	async probeEmbeddingAvailability() {
		return await this.inner.probeEmbeddingAvailability();
	}
	getCachedEmbeddingAvailability() {
		return this.inner.getCachedEmbeddingAvailability?.() ?? null;
	}
	async probeVectorAvailability() {
		return await this.inner.probeVectorAvailability();
	}
	async close() {}
};
async function closeAllMemorySearchManagers() {
	const pendingCreates = Array.from(PENDING_QMD_MANAGER_CREATES.values(), (entry) => entry.promise);
	await Promise.allSettled(pendingCreates);
	const managers = Array.from(QMD_MANAGER_CACHE.values(), (entry) => entry.manager);
	PENDING_QMD_MANAGER_CREATES.clear();
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
		this.closed = false;
		this.closeReason = "memory search manager is closed";
	}
	async search(query, opts) {
		this.ensureOpen();
		if (!this.primaryFailed) try {
			return await this.deps.primary.search(query, opts);
		} catch (err) {
			this.primaryFailed = true;
			this.lastError = formatErrorMessage(err);
			log.warn(`qmd memory failed; switching to builtin index: ${this.lastError}`);
			await this.deps.primary.close?.().catch(() => {});
			this.evictCacheEntry();
		}
		const fallback = await this.ensureFallback();
		if (fallback) return await fallback.search(query, opts);
		throw new Error(this.lastError ?? "memory search unavailable");
	}
	async readFile(params) {
		this.ensureOpen();
		if (!this.primaryFailed) return await this.deps.primary.readFile(params);
		const fallback = await this.ensureFallback();
		if (fallback) return await fallback.readFile(params);
		throw new Error(this.lastError ?? "memory read unavailable");
	}
	status() {
		this.ensureOpen();
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
		this.ensureOpen();
		if (!this.primaryFailed) {
			await this.deps.primary.sync?.(params);
			return;
		}
		await (await this.ensureFallback())?.sync?.(params);
	}
	async probeEmbeddingAvailability() {
		this.ensureOpen();
		if (!this.primaryFailed) return await this.deps.primary.probeEmbeddingAvailability();
		const fallback = await this.ensureFallback();
		if (fallback) return await fallback.probeEmbeddingAvailability();
		return {
			ok: false,
			error: this.lastError ?? "memory embeddings unavailable"
		};
	}
	getCachedEmbeddingAvailability() {
		this.ensureOpen();
		if (!this.primaryFailed) return this.deps.primary.getCachedEmbeddingAvailability?.() ?? null;
		return this.fallback?.getCachedEmbeddingAvailability?.() ?? null;
	}
	async probeVectorAvailability() {
		this.ensureOpen();
		if (!this.primaryFailed) return await this.deps.primary.probeVectorAvailability();
		return await (await this.ensureFallback())?.probeVectorAvailability() ?? false;
	}
	async close() {
		if (this.closed) return;
		this.closed = true;
		await this.deps.primary.close?.();
		await this.fallback?.close?.();
		this.evictCacheEntry();
	}
	async invalidate(reason) {
		this.closeReason = reason;
		await this.close();
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
			const message = formatErrorMessage(err);
			log.warn(`memory fallback unavailable: ${message}`);
			return null;
		}
		this.fallback = fallback;
		return this.fallback;
	}
	ensureOpen() {
		if (this.closed) throw new Error(this.closeReason);
	}
	evictCacheEntry() {
		if (this.cacheEvicted) return;
		this.cacheEvicted = true;
		this.onClose?.();
	}
};
async function closeQmdManagerForReplacement(manager) {
	if (manager instanceof FallbackMemoryManager) {
		await manager.invalidate("memory search manager was replaced by a newer qmd manager");
		return;
	}
	await manager.close?.();
}
function buildQmdManagerScopeKey(agentId) {
	return agentId;
}
function buildQmdManagerIdentityKey(agentId, config, runtimeConfig) {
	return `${agentId}:${JSON.stringify(config)}:${JSON.stringify(runtimeConfig.syncSettings ?? null)}:${JSON.stringify(runtimeConfig.contextLimits ?? null)}:${runtimeConfig.workspaceDir}`;
}
function resolveQmdManagerRuntimeConfig(cfg, agentId) {
	return {
		workspaceDir: resolveAgentWorkspaceDir(cfg, agentId),
		syncSettings: resolveMemorySearchSyncConfig(cfg, agentId),
		contextLimits: resolveAgentContextLimits(cfg, agentId)
	};
}
//#endregion
export { getMemorySearchManager as n, closeAllMemorySearchManagers as t };
