import { i as formatErrorMessage } from "./errors-D8p6rxH8.js";
import { t as createSubsystemLogger } from "./subsystem-Cgmckbux.js";
import { n as resolveGlobalSingleton } from "./global-singleton-B80lD-oJ.js";
import { b as resolveAgentWorkspaceDir } from "./agent-scope-KFH9bkHi.js";
import "./error-runtime-CgBDklBz.js";
import { t as resolveMemoryBackendConfig } from "./backend-config-DAthUrjH.js";
import "./memory-core-host-engine-foundation-CRLtQO9K.js";
import { t as checkQmdBinaryAvailability } from "./engine-qmd-D2OISTWu.js";
import "./memory-core-host-engine-qmd-BNzUfcIP.js";
import "./memory-core-host-engine-storage-CUSy3hYk.js";
import "./manager-cQ8cHF3H.js";
import fs from "node:fs/promises";
//#region extensions/memory-core/src/memory/search-manager.ts
const MEMORY_SEARCH_MANAGER_CACHE_KEY = Symbol.for("openclaw.memorySearchManagerCache");
function getMemorySearchManagerCacheStore() {
	return resolveGlobalSingleton(MEMORY_SEARCH_MANAGER_CACHE_KEY, () => ({ qmdManagerCache: /* @__PURE__ */ new Map() }));
}
const log = createSubsystemLogger("memory");
const { qmdManagerCache: QMD_MANAGER_CACHE } = getMemorySearchManagerCacheStore();
let managerRuntimePromise = null;
function loadManagerRuntime() {
	managerRuntimePromise ??= import("./extensions/memory-core/manager-runtime.js");
	return managerRuntimePromise;
}
async function getMemorySearchManager(params) {
	const resolved = resolveMemoryBackendConfig(params);
	if (resolved.backend === "qmd" && resolved.qmd) {
		const statusOnly = params.purpose === "status";
		const baseCacheKey = buildQmdCacheKey(params.agentId, resolved.qmd);
		const cacheKey = `${baseCacheKey}:${statusOnly ? "status" : "full"}`;
		const cached = QMD_MANAGER_CACHE.get(cacheKey);
		if (cached) return { manager: cached };
		if (statusOnly) {
			const fullCached = QMD_MANAGER_CACHE.get(`${baseCacheKey}:full`);
			if (fullCached) return { manager: new BorrowedMemoryManager(fullCached) };
		}
		const workspaceDir = resolveAgentWorkspaceDir(params.cfg, params.agentId);
		try {
			await fs.mkdir(workspaceDir, { recursive: true });
		} catch (err) {
			log.warn(`qmd workspace unavailable (${workspaceDir}); falling back to builtin: ${formatErrorMessage(err)}`);
			return await getBuiltinMemorySearchManager(params);
		}
		const qmdBinary = await checkQmdBinaryAvailability({
			command: resolved.qmd.command,
			env: process.env,
			cwd: workspaceDir
		});
		if (!qmdBinary.available) log.warn(`qmd binary unavailable (${resolved.qmd.command}); falling back to builtin: ${qmdBinary.error ?? "unknown error"}`);
		else try {
			const { QmdMemoryManager } = await import("./qmd-manager-BQH7668H.js");
			const primary = await QmdMemoryManager.create({
				cfg: params.cfg,
				agentId: params.agentId,
				resolved,
				mode: statusOnly ? "status" : "full"
			});
			if (primary) {
				if (statusOnly) return { manager: primary };
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
			const message = formatErrorMessage(err);
			log.warn(`qmd memory unavailable; falling back to builtin: ${message}`);
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
	async probeVectorAvailability() {
		return await this.inner.probeVectorAvailability();
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
			const message = formatErrorMessage(err);
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
export { getMemorySearchManager as n, closeAllMemorySearchManagers as t };
