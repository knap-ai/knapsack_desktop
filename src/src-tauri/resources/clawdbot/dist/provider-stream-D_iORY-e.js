import { t as createSubsystemLogger } from "./subsystem-CJEvHE2o.js";
import { r as streamWithPayloadPatch } from "./moonshot-thinking-stream-wrappers-ARhjUCLc.js";
import { _ as resolveStateDir } from "./paths-CD8i0MSg.js";
import { a as resolveProviderRequestPolicyConfig } from "./provider-request-config-0I1kx7Qd.js";
import { i as resolveProxyFetchFromEnv } from "./proxy-fetch-Bib4caGq.js";
import "./openai-stream-wrappers-D4CWCCrG.js";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { streamSimple } from "@mariozechner/pi-ai";
//#region src/agents/pi-embedded-runner/proxy-stream-wrappers.ts
const KILOCODE_FEATURE_HEADER = "X-KILOCODE-FEATURE";
const KILOCODE_FEATURE_DEFAULT = "openclaw";
const KILOCODE_FEATURE_ENV_VAR = "KILOCODE_FEATURE";
function resolveKilocodeAppHeaders() {
	const feature = process.env[KILOCODE_FEATURE_ENV_VAR]?.trim() || KILOCODE_FEATURE_DEFAULT;
	return { [KILOCODE_FEATURE_HEADER]: feature };
}
function isOpenRouterAnthropicModel(provider, modelId) {
	return provider.toLowerCase() === "openrouter" && modelId.toLowerCase().startsWith("anthropic/");
}
function mapThinkingLevelToOpenRouterReasoningEffort(thinkingLevel) {
	if (thinkingLevel === "off") return "none";
	if (thinkingLevel === "adaptive") return "medium";
	return thinkingLevel;
}
function normalizeProxyReasoningPayload(payload, thinkingLevel) {
	if (!payload || typeof payload !== "object") return;
	const payloadObj = payload;
	delete payloadObj.reasoning_effort;
	if (!thinkingLevel || thinkingLevel === "off") return;
	const existingReasoning = payloadObj.reasoning;
	if (existingReasoning && typeof existingReasoning === "object" && !Array.isArray(existingReasoning)) {
		const reasoningObj = existingReasoning;
		if (!("max_tokens" in reasoningObj) && !("effort" in reasoningObj)) reasoningObj.effort = mapThinkingLevelToOpenRouterReasoningEffort(thinkingLevel);
	} else if (!existingReasoning) payloadObj.reasoning = { effort: mapThinkingLevelToOpenRouterReasoningEffort(thinkingLevel) };
}
function createOpenRouterSystemCacheWrapper(baseStreamFn) {
	const underlying = baseStreamFn ?? streamSimple;
	return (model, context, options) => {
		if (typeof model.provider !== "string" || typeof model.id !== "string" || !isOpenRouterAnthropicModel(model.provider, model.id)) return underlying(model, context, options);
		return streamWithPayloadPatch(underlying, model, context, options, (payloadObj) => {
			const messages = payloadObj.messages;
			if (Array.isArray(messages)) for (const msg of messages) {
				if (msg.role === "system" || msg.role === "developer") {
					if (typeof msg.content === "string") msg.content = [{
						type: "text",
						text: msg.content,
						cache_control: { type: "ephemeral" }
					}];
					else if (Array.isArray(msg.content) && msg.content.length > 0) {
						const last = msg.content[msg.content.length - 1];
						if (last && typeof last === "object") {
							const record = last;
							if (record.type !== "thinking" && record.type !== "redacted_thinking") record.cache_control = { type: "ephemeral" };
						}
					}
					continue;
				}
				if (msg.role === "assistant" && Array.isArray(msg.content)) for (const block of msg.content) {
					if (!block || typeof block !== "object") continue;
					const record = block;
					if (record.type === "thinking" || record.type === "redacted_thinking") delete record.cache_control;
				}
			}
		});
	};
}
function createOpenRouterWrapper(baseStreamFn, thinkingLevel) {
	const underlying = baseStreamFn ?? streamSimple;
	return (model, context, options) => {
		const headers = resolveProviderRequestPolicyConfig({
			provider: typeof model.provider === "string" ? model.provider : "openrouter",
			api: typeof model.api === "string" ? model.api : void 0,
			baseUrl: typeof model.baseUrl === "string" ? model.baseUrl : void 0,
			capability: "llm",
			transport: "stream",
			callerHeaders: options?.headers,
			precedence: "caller-wins"
		}).headers;
		return streamWithPayloadPatch(underlying, model, context, {
			...options,
			headers
		}, (payload) => {
			normalizeProxyReasoningPayload(payload, thinkingLevel);
		});
	};
}
function isProxyReasoningUnsupported(modelId) {
	return modelId.toLowerCase().startsWith("x-ai/");
}
function createKilocodeWrapper(baseStreamFn, thinkingLevel) {
	const underlying = baseStreamFn ?? streamSimple;
	return (model, context, options) => {
		const headers = resolveProviderRequestPolicyConfig({
			provider: typeof model.provider === "string" ? model.provider : "kilocode",
			api: typeof model.api === "string" ? model.api : void 0,
			baseUrl: typeof model.baseUrl === "string" ? model.baseUrl : void 0,
			capability: "llm",
			transport: "stream",
			callerHeaders: options?.headers,
			providerHeaders: resolveKilocodeAppHeaders(),
			precedence: "defaults-win"
		}).headers;
		return streamWithPayloadPatch(underlying, model, context, {
			...options,
			headers
		}, (payload) => {
			normalizeProxyReasoningPayload(payload, thinkingLevel);
		});
	};
}
//#endregion
//#region src/agents/pi-embedded-runner/zai-stream-wrappers.ts
/**
* Inject `tool_stream=true` so tool-call deltas stream in real time.
* Providers can disable this by setting `params.tool_stream=false`.
*/
function createToolStreamWrapper(baseStreamFn, enabled) {
	const underlying = baseStreamFn ?? streamSimple;
	return (model, context, options) => {
		if (!enabled) return underlying(model, context, options);
		return streamWithPayloadPatch(underlying, model, context, options, (payloadObj) => {
			payloadObj.tool_stream = true;
		});
	};
}
const createZaiToolStreamWrapper = createToolStreamWrapper;
//#endregion
//#region src/agents/pi-embedded-runner/openrouter-model-capabilities.ts
/**
* Runtime OpenRouter model capability detection.
*
* When an OpenRouter model is not in the built-in static list, we look up its
* actual capabilities from a cached copy of the OpenRouter model catalog.
*
* Cache layers (checked in order):
* 1. In-memory Map (instant, cleared on process restart)
* 2. On-disk JSON file (<stateDir>/cache/openrouter-models.json)
* 3. OpenRouter API fetch (populates both layers)
*
* Model capabilities are assumed stable — the cache has no TTL expiry.
* A background refresh is triggered only when a model is not found in
* the cache (i.e. a newly added model on OpenRouter).
*
* Sync callers can read whatever is already cached. Async callers can await a
* one-time fetch so the first unknown-model lookup resolves with real
* capabilities instead of the text-only fallback.
*/
const log = createSubsystemLogger("openrouter-model-capabilities");
const OPENROUTER_MODELS_URL = "https://openrouter.ai/api/v1/models";
const FETCH_TIMEOUT_MS = 1e4;
const DISK_CACHE_FILENAME = "openrouter-models.json";
function resolveDiskCacheDir() {
	return join(resolveStateDir(), "cache");
}
function resolveDiskCachePath() {
	return join(resolveDiskCacheDir(), DISK_CACHE_FILENAME);
}
function writeDiskCache(map) {
	try {
		const cacheDir = resolveDiskCacheDir();
		if (!existsSync(cacheDir)) mkdirSync(cacheDir, { recursive: true });
		const payload = { models: Object.fromEntries(map) };
		writeFileSync(resolveDiskCachePath(), JSON.stringify(payload), "utf-8");
	} catch (err) {
		const message = err instanceof Error ? err.message : String(err);
		log.debug(`Failed to write OpenRouter disk cache: ${message}`);
	}
}
function isValidCapabilities(value) {
	if (!value || typeof value !== "object") return false;
	const record = value;
	return typeof record.name === "string" && Array.isArray(record.input) && typeof record.reasoning === "boolean" && typeof record.contextWindow === "number" && typeof record.maxTokens === "number";
}
function readDiskCache() {
	try {
		const cachePath = resolveDiskCachePath();
		if (!existsSync(cachePath)) return;
		const raw = readFileSync(cachePath, "utf-8");
		const payload = JSON.parse(raw);
		if (!payload || typeof payload !== "object") return;
		const models = payload.models;
		if (!models || typeof models !== "object") return;
		const map = /* @__PURE__ */ new Map();
		for (const [id, caps] of Object.entries(models)) if (isValidCapabilities(caps)) map.set(id, caps);
		return map.size > 0 ? map : void 0;
	} catch {
		return;
	}
}
let cache;
let fetchInFlight;
const skipNextMissRefresh = /* @__PURE__ */ new Set();
function parseModel(model) {
	const input = ["text"];
	if (((model.architecture?.modality ?? model.modality ?? "").split("->")[0] ?? "").includes("image")) input.push("image");
	return {
		name: model.name || model.id,
		input,
		reasoning: model.supported_parameters?.includes("reasoning") ?? false,
		contextWindow: model.context_length || 128e3,
		maxTokens: model.top_provider?.max_completion_tokens ?? model.max_completion_tokens ?? model.max_output_tokens ?? 8192,
		cost: {
			input: parseFloat(model.pricing?.prompt || "0") * 1e6,
			output: parseFloat(model.pricing?.completion || "0") * 1e6,
			cacheRead: parseFloat(model.pricing?.input_cache_read || "0") * 1e6,
			cacheWrite: parseFloat(model.pricing?.input_cache_write || "0") * 1e6
		}
	};
}
async function doFetch() {
	const controller = new AbortController();
	const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
	try {
		const response = await (resolveProxyFetchFromEnv() ?? globalThis.fetch)(OPENROUTER_MODELS_URL, { signal: controller.signal });
		if (!response.ok) {
			log.warn(`OpenRouter models API returned ${response.status}`);
			return;
		}
		const models = (await response.json()).data ?? [];
		const map = /* @__PURE__ */ new Map();
		for (const model of models) {
			if (!model.id) continue;
			map.set(model.id, parseModel(model));
		}
		cache = map;
		writeDiskCache(map);
		log.debug(`Cached ${map.size} OpenRouter models from API`);
	} catch (err) {
		const message = err instanceof Error ? err.message : String(err);
		log.warn(`Failed to fetch OpenRouter models: ${message}`);
	} finally {
		clearTimeout(timeout);
	}
}
function triggerFetch() {
	if (fetchInFlight) return;
	fetchInFlight = doFetch().finally(() => {
		fetchInFlight = void 0;
	});
}
/**
* Ensure the cache is populated. Checks in-memory first, then disk, then
* triggers a background API fetch as a last resort.
* Does not block — returns immediately.
*/
function ensureOpenRouterModelCache() {
	if (cache) return;
	const disk = readDiskCache();
	if (disk) {
		cache = disk;
		log.debug(`Loaded ${disk.size} OpenRouter models from disk cache`);
		return;
	}
	triggerFetch();
}
/**
* Ensure capabilities for a specific model are available before first use.
*
* Known cached entries return immediately. Unknown entries wait for at most
* one catalog fetch, then leave sync resolution to read from the populated
* cache on the same request.
*/
async function loadOpenRouterModelCapabilities(modelId) {
	ensureOpenRouterModelCache();
	if (cache?.has(modelId)) return;
	let fetchPromise = fetchInFlight;
	if (!fetchPromise) {
		triggerFetch();
		fetchPromise = fetchInFlight;
	}
	await fetchPromise;
	if (!cache?.has(modelId)) skipNextMissRefresh.add(modelId);
}
/**
* Synchronously look up model capabilities from the cache.
*
* If a model is not found but the cache exists, a background refresh is
* triggered in case it's a newly added model not yet in the cache.
*/
function getOpenRouterModelCapabilities(modelId) {
	ensureOpenRouterModelCache();
	const result = cache?.get(modelId);
	if (!result && skipNextMissRefresh.delete(modelId)) return;
	if (!result && cache && !fetchInFlight) triggerFetch();
	return result;
}
//#endregion
export { createKilocodeWrapper as a, isProxyReasoningUnsupported as c, createZaiToolStreamWrapper as i, loadOpenRouterModelCapabilities as n, createOpenRouterSystemCacheWrapper as o, createToolStreamWrapper as r, createOpenRouterWrapper as s, getOpenRouterModelCapabilities as t };
