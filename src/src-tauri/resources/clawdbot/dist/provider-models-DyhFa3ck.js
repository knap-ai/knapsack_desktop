import { n as fetchWithSsrFGuard } from "./fetch-guard-B3p4gGaY.js";
import "./ssrf-runtime-CmuKDV7X.js";
//#region extensions/ollama/src/defaults.ts
const OLLAMA_DEFAULT_BASE_URL = "http://127.0.0.1:11434";
const OLLAMA_CLOUD_BASE_URL = "https://ollama.com";
const OLLAMA_DEFAULT_CONTEXT_WINDOW = 128e3;
const OLLAMA_DEFAULT_MAX_TOKENS = 8192;
const OLLAMA_DEFAULT_COST = {
	input: 0,
	output: 0,
	cacheRead: 0,
	cacheWrite: 0
};
const OLLAMA_DEFAULT_MODEL = "gemma4";
//#endregion
//#region extensions/ollama/src/provider-models.ts
const OLLAMA_SHOW_CONCURRENCY = 8;
const MAX_OLLAMA_SHOW_CACHE_ENTRIES = 256;
const ollamaModelShowInfoCache = /* @__PURE__ */ new Map();
const OLLAMA_ALWAYS_BLOCKED_HOSTNAMES = new Set(["metadata.google.internal"]);
function buildOllamaBaseUrlSsrFPolicy(baseUrl) {
	const trimmed = baseUrl.trim();
	if (!trimmed) return;
	try {
		const parsed = new URL(trimmed);
		if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return;
		if (OLLAMA_ALWAYS_BLOCKED_HOSTNAMES.has(parsed.hostname)) return;
		return {
			hostnameAllowlist: [parsed.hostname],
			allowPrivateNetwork: true
		};
	} catch {
		return;
	}
}
function resolveOllamaApiBase(configuredBaseUrl) {
	if (!configuredBaseUrl) return OLLAMA_DEFAULT_BASE_URL;
	return configuredBaseUrl.replace(/\/+$/, "").replace(/\/v1$/i, "");
}
function buildOllamaModelShowCacheKey(apiBase, model) {
	const version = model.digest?.trim() || model.modified_at?.trim();
	if (!version) return;
	return `${resolveOllamaApiBase(apiBase)}|${model.name}|${version}`;
}
function setOllamaModelShowCacheEntry(key, value) {
	if (ollamaModelShowInfoCache.size >= MAX_OLLAMA_SHOW_CACHE_ENTRIES) {
		const oldestKey = ollamaModelShowInfoCache.keys().next().value;
		if (typeof oldestKey === "string") ollamaModelShowInfoCache.delete(oldestKey);
	}
	ollamaModelShowInfoCache.set(key, value);
}
function hasCachedOllamaModelShowInfo(info) {
	return typeof info.contextWindow === "number" || (info.capabilities?.length ?? 0) > 0;
}
async function queryOllamaModelShowInfo(apiBase, modelName) {
	const normalizedApiBase = resolveOllamaApiBase(apiBase);
	try {
		const { response, release } = await fetchWithSsrFGuard({
			url: `${normalizedApiBase}/api/show`,
			init: {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ name: modelName }),
				signal: AbortSignal.timeout(3e3)
			},
			policy: buildOllamaBaseUrlSsrFPolicy(normalizedApiBase),
			auditContext: "ollama-provider-models.show"
		});
		try {
			if (!response.ok) return {};
			const data = await response.json();
			let contextWindow;
			if (data.model_info) {
				for (const [key, value] of Object.entries(data.model_info)) if (key.endsWith(".context_length") && typeof value === "number" && Number.isFinite(value)) {
					const ctx = Math.floor(value);
					if (ctx > 0) {
						contextWindow = ctx;
						break;
					}
				}
			}
			const capabilities = Array.isArray(data.capabilities) ? data.capabilities.filter((c) => typeof c === "string") : void 0;
			return {
				contextWindow,
				capabilities
			};
		} finally {
			await release();
		}
	} catch {
		return {};
	}
}
async function queryOllamaModelShowInfoCached(apiBase, model) {
	const normalizedApiBase = resolveOllamaApiBase(apiBase);
	const cacheKey = buildOllamaModelShowCacheKey(normalizedApiBase, model);
	if (!cacheKey) return await queryOllamaModelShowInfo(normalizedApiBase, model.name);
	const cached = ollamaModelShowInfoCache.get(cacheKey);
	if (cached) return await cached;
	const pending = queryOllamaModelShowInfo(normalizedApiBase, model.name).then((result) => {
		if (!hasCachedOllamaModelShowInfo(result)) ollamaModelShowInfoCache.delete(cacheKey);
		return result;
	});
	setOllamaModelShowCacheEntry(cacheKey, pending);
	return await pending;
}
/** @deprecated Use queryOllamaModelShowInfo instead. */
async function queryOllamaContextWindow(apiBase, modelName) {
	return (await queryOllamaModelShowInfo(apiBase, modelName)).contextWindow;
}
async function enrichOllamaModelsWithContext(apiBase, models, opts) {
	const concurrency = Math.max(1, Math.floor(opts?.concurrency ?? OLLAMA_SHOW_CONCURRENCY));
	const enriched = [];
	for (let index = 0; index < models.length; index += concurrency) {
		const batch = models.slice(index, index + concurrency);
		const batchResults = await Promise.all(batch.map(async (model) => {
			const showInfo = await queryOllamaModelShowInfoCached(apiBase, model);
			return {
				...model,
				contextWindow: showInfo.contextWindow,
				capabilities: showInfo.capabilities
			};
		}));
		enriched.push(...batchResults);
	}
	return enriched;
}
function isReasoningModelHeuristic(modelId) {
	return /r1|reasoning|think|reason/i.test(modelId);
}
function buildOllamaModelDefinition(modelId, contextWindow, capabilities) {
	const input = capabilities?.includes("vision") ?? false ? ["text", "image"] : ["text"];
	return {
		id: modelId,
		name: modelId,
		reasoning: isReasoningModelHeuristic(modelId),
		input,
		cost: OLLAMA_DEFAULT_COST,
		contextWindow: contextWindow ?? 128e3,
		maxTokens: OLLAMA_DEFAULT_MAX_TOKENS
	};
}
async function fetchOllamaModels(baseUrl) {
	try {
		const apiBase = resolveOllamaApiBase(baseUrl);
		const { response, release } = await fetchWithSsrFGuard({
			url: `${apiBase}/api/tags`,
			init: { signal: AbortSignal.timeout(5e3) },
			policy: buildOllamaBaseUrlSsrFPolicy(apiBase),
			auditContext: "ollama-provider-models.tags"
		});
		try {
			if (!response.ok) return {
				reachable: true,
				models: []
			};
			return {
				reachable: true,
				models: ((await response.json()).models ?? []).filter((m) => m.name)
			};
		} finally {
			await release();
		}
	} catch {
		return {
			reachable: false,
			models: []
		};
	}
}
//#endregion
export { isReasoningModelHeuristic as a, resolveOllamaApiBase as c, OLLAMA_DEFAULT_CONTEXT_WINDOW as d, OLLAMA_DEFAULT_COST as f, fetchOllamaModels as i, OLLAMA_CLOUD_BASE_URL as l, OLLAMA_DEFAULT_MODEL as m, buildOllamaModelDefinition as n, queryOllamaContextWindow as o, OLLAMA_DEFAULT_MAX_TOKENS as p, enrichOllamaModelsWithContext as r, queryOllamaModelShowInfo as s, buildOllamaBaseUrlSsrFPolicy as t, OLLAMA_DEFAULT_BASE_URL as u };
