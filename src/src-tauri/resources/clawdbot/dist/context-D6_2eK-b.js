import { i as normalizeLowercaseStringOrEmpty } from "./string-coerce-BUSzWgUA.js";
import { I as consumeRootOptionToken } from "./logger-D8OnBgBc.js";
import { a as loadConfig } from "./io-5pxHCi7V.js";
import { r as normalizeProviderId } from "./provider-id-KaStHhRz.js";
import "./config-Q9XZc_2I.js";
import { t as resolveOpenClawAgentDir } from "./agent-paths-JWlHCT48.js";
import "./model-selection-CTdyYoio.js";
import { t as computeBackoff } from "./backoff-DdY2WS-F.js";
import path from "node:path";
//#region src/agents/context-cache.ts
const MODEL_CONTEXT_TOKEN_CACHE = /* @__PURE__ */ new Map();
function lookupCachedContextTokens(modelId) {
	if (!modelId) return;
	return MODEL_CONTEXT_TOKEN_CACHE.get(modelId);
}
//#endregion
//#region src/agents/context-runtime-state.ts
const CONTEXT_WINDOW_RUNTIME_STATE_KEY = Symbol.for("openclaw.contextWindowRuntimeState");
const CONTEXT_WINDOW_RUNTIME_STATE = (() => {
	const globalState = globalThis;
	if (!globalState[CONTEXT_WINDOW_RUNTIME_STATE_KEY]) globalState[CONTEXT_WINDOW_RUNTIME_STATE_KEY] = {
		loadPromise: null,
		configuredConfig: void 0,
		configLoadFailures: 0,
		nextConfigLoadAttemptAtMs: 0,
		modelsConfigRuntimePromise: void 0
	};
	return globalState[CONTEXT_WINDOW_RUNTIME_STATE_KEY];
})();
function resetContextWindowCacheForTest() {
	CONTEXT_WINDOW_RUNTIME_STATE.loadPromise = null;
	CONTEXT_WINDOW_RUNTIME_STATE.configuredConfig = void 0;
	CONTEXT_WINDOW_RUNTIME_STATE.configLoadFailures = 0;
	CONTEXT_WINDOW_RUNTIME_STATE.nextConfigLoadAttemptAtMs = 0;
	CONTEXT_WINDOW_RUNTIME_STATE.modelsConfigRuntimePromise = void 0;
	MODEL_CONTEXT_TOKEN_CACHE.clear();
}
//#endregion
//#region src/agents/context.ts
const ANTHROPIC_1M_MODEL_PREFIXES = ["claude-opus-4", "claude-sonnet-4"];
const ANTHROPIC_CONTEXT_1M_TOKENS = 1048576;
const CONFIG_LOAD_RETRY_POLICY = {
	initialMs: 1e3,
	maxMs: 6e4,
	factor: 2,
	jitter: 0
};
function applyDiscoveredContextWindows(params) {
	for (const model of params.models) {
		if (!model?.id) continue;
		const contextTokens = typeof model.contextTokens === "number" ? Math.trunc(model.contextTokens) : typeof model.contextWindow === "number" ? Math.trunc(model.contextWindow) : void 0;
		if (!contextTokens || contextTokens <= 0) continue;
		const existing = params.cache.get(model.id);
		if (existing === void 0 || contextTokens < existing) params.cache.set(model.id, contextTokens);
	}
}
function applyConfiguredContextWindows(params) {
	const providers = params.modelsConfig?.providers;
	if (!providers || typeof providers !== "object") return;
	for (const provider of Object.values(providers)) {
		if (!Array.isArray(provider?.models)) continue;
		for (const model of provider.models) {
			const modelId = typeof model?.id === "string" ? model.id : void 0;
			const contextTokens = typeof model?.contextTokens === "number" ? model.contextTokens : typeof model?.contextWindow === "number" ? model.contextWindow : void 0;
			if (!modelId || !contextTokens || contextTokens <= 0) continue;
			params.cache.set(modelId, contextTokens);
		}
	}
}
function loadModelsConfigRuntime() {
	CONTEXT_WINDOW_RUNTIME_STATE.modelsConfigRuntimePromise ??= import("./agents/models-config.runtime.js");
	return CONTEXT_WINDOW_RUNTIME_STATE.modelsConfigRuntimePromise;
}
function isLikelyOpenClawCliProcess(argv = process.argv) {
	const entryBasename = normalizeLowercaseStringOrEmpty(path.basename(argv[1] ?? ""));
	return entryBasename === "openclaw" || entryBasename === "openclaw.mjs" || entryBasename === "entry.js" || entryBasename === "entry.mjs";
}
function getCommandPathFromArgv(argv) {
	const args = argv.slice(2);
	const tokens = [];
	for (let i = 0; i < args.length; i += 1) {
		const arg = args[i];
		if (!arg || arg === "--") break;
		const consumed = consumeRootOptionToken(args, i);
		if (consumed > 0) {
			i += consumed - 1;
			continue;
		}
		if (arg.startsWith("-")) continue;
		tokens.push(arg);
		if (tokens.length >= 2) break;
	}
	return tokens;
}
const SKIP_EAGER_WARMUP_PRIMARY_COMMANDS = new Set([
	"agent",
	"backup",
	"completion",
	"config",
	"directory",
	"doctor",
	"gateway",
	"health",
	"hooks",
	"logs",
	"models",
	"plugins",
	"secrets",
	"status",
	"update",
	"webhooks"
]);
function shouldEagerWarmContextWindowCache(argv = process.argv) {
	if (!isLikelyOpenClawCliProcess(argv)) return false;
	const [primary] = getCommandPathFromArgv(argv);
	return Boolean(primary) && !SKIP_EAGER_WARMUP_PRIMARY_COMMANDS.has(primary);
}
function primeConfiguredContextWindows() {
	if (CONTEXT_WINDOW_RUNTIME_STATE.configuredConfig) {
		applyConfiguredContextWindows({
			cache: MODEL_CONTEXT_TOKEN_CACHE,
			modelsConfig: CONTEXT_WINDOW_RUNTIME_STATE.configuredConfig.models
		});
		return CONTEXT_WINDOW_RUNTIME_STATE.configuredConfig;
	}
	if (Date.now() < CONTEXT_WINDOW_RUNTIME_STATE.nextConfigLoadAttemptAtMs) return;
	try {
		const cfg = loadConfig();
		applyConfiguredContextWindows({
			cache: MODEL_CONTEXT_TOKEN_CACHE,
			modelsConfig: cfg.models
		});
		CONTEXT_WINDOW_RUNTIME_STATE.configuredConfig = cfg;
		CONTEXT_WINDOW_RUNTIME_STATE.configLoadFailures = 0;
		CONTEXT_WINDOW_RUNTIME_STATE.nextConfigLoadAttemptAtMs = 0;
		return cfg;
	} catch {
		CONTEXT_WINDOW_RUNTIME_STATE.configLoadFailures += 1;
		const backoffMs = computeBackoff(CONFIG_LOAD_RETRY_POLICY, CONTEXT_WINDOW_RUNTIME_STATE.configLoadFailures);
		CONTEXT_WINDOW_RUNTIME_STATE.nextConfigLoadAttemptAtMs = Date.now() + backoffMs;
		return;
	}
}
function ensureContextWindowCacheLoaded() {
	if (CONTEXT_WINDOW_RUNTIME_STATE.loadPromise) return CONTEXT_WINDOW_RUNTIME_STATE.loadPromise;
	const cfg = primeConfiguredContextWindows();
	if (!cfg) return Promise.resolve();
	CONTEXT_WINDOW_RUNTIME_STATE.loadPromise = (async () => {
		try {
			await (await loadModelsConfigRuntime()).ensureOpenClawModelsJson(cfg);
		} catch {}
		try {
			const { discoverAuthStorage, discoverModels } = await import("./agents/pi-model-discovery-runtime.js");
			const agentDir = resolveOpenClawAgentDir();
			const modelRegistry = discoverModels(discoverAuthStorage(agentDir), agentDir);
			applyDiscoveredContextWindows({
				cache: MODEL_CONTEXT_TOKEN_CACHE,
				models: typeof modelRegistry.getAvailable === "function" ? modelRegistry.getAvailable() : modelRegistry.getAll()
			});
		} catch {}
		applyConfiguredContextWindows({
			cache: MODEL_CONTEXT_TOKEN_CACHE,
			modelsConfig: cfg.models
		});
	})().catch(() => {});
	return CONTEXT_WINDOW_RUNTIME_STATE.loadPromise;
}
function lookupContextTokens(modelId, options) {
	if (!modelId) return;
	if (options?.allowAsyncLoad === false) primeConfiguredContextWindows();
	else ensureContextWindowCacheLoaded();
	return lookupCachedContextTokens(modelId);
}
if (shouldEagerWarmContextWindowCache()) ensureContextWindowCacheLoaded();
function resolveConfiguredModelParams(cfg, provider, model) {
	const models = cfg?.agents?.defaults?.models;
	if (!models) return;
	const key = normalizeLowercaseStringOrEmpty(`${provider}/${model}`);
	for (const [rawKey, entry] of Object.entries(models)) if (normalizeLowercaseStringOrEmpty(rawKey) === key) {
		const params = entry?.params;
		return params && typeof params === "object" ? params : void 0;
	}
}
function resolveProviderModelRef(params) {
	const modelRaw = params.model?.trim();
	if (!modelRaw) return;
	const providerRaw = params.provider?.trim();
	if (providerRaw) {
		const provider = normalizeProviderId(providerRaw);
		if (!provider) return;
		return {
			provider,
			model: modelRaw
		};
	}
	const slash = modelRaw.indexOf("/");
	if (slash <= 0) return;
	const provider = normalizeProviderId(modelRaw.slice(0, slash));
	const model = modelRaw.slice(slash + 1).trim();
	if (!provider || !model) return;
	return {
		provider,
		model
	};
}
function resolveConfiguredProviderContextTokens(cfg, provider, model) {
	const providers = (cfg?.models)?.providers;
	if (!providers) return;
	function findContextTokens(matchProviderId) {
		for (const [providerId, providerConfig] of Object.entries(providers)) {
			if (!matchProviderId(providerId)) continue;
			if (!Array.isArray(providerConfig?.models)) continue;
			for (const m of providerConfig.models) {
				const contextTokens = typeof m?.contextTokens === "number" ? m.contextTokens : typeof m?.contextWindow === "number" ? m.contextWindow : void 0;
				if (typeof m?.id === "string" && m.id === model && typeof contextTokens === "number" && contextTokens > 0) return contextTokens;
			}
		}
	}
	const exactResult = findContextTokens((id) => normalizeLowercaseStringOrEmpty(id) === normalizeLowercaseStringOrEmpty(provider));
	if (exactResult !== void 0) return exactResult;
	const normalizedProvider = normalizeProviderId(provider);
	return findContextTokens((id) => normalizeProviderId(id) === normalizedProvider);
}
function isAnthropic1MModel(provider, model) {
	if (provider !== "anthropic") return false;
	const normalized = normalizeLowercaseStringOrEmpty(model);
	const modelId = normalized.includes("/") ? normalized.split("/").at(-1) ?? normalized : normalized;
	return ANTHROPIC_1M_MODEL_PREFIXES.some((prefix) => modelId.startsWith(prefix));
}
function resolveContextTokensForModel(params) {
	if (typeof params.contextTokensOverride === "number" && params.contextTokensOverride > 0) return params.contextTokensOverride;
	const ref = resolveProviderModelRef({
		provider: params.provider,
		model: params.model
	});
	const explicitProvider = params.provider?.trim();
	if (ref) {
		if (resolveConfiguredModelParams(params.cfg, ref.provider, ref.model)?.context1m === true && isAnthropic1MModel(ref.provider, ref.model)) return ANTHROPIC_CONTEXT_1M_TOKENS;
		if (explicitProvider) {
			const configuredWindow = resolveConfiguredProviderContextTokens(params.cfg, explicitProvider, ref.model);
			if (configuredWindow !== void 0) return configuredWindow;
		}
	}
	if (params.provider && ref && !ref.model.includes("/")) {
		const qualifiedResult = lookupContextTokens(`${normalizeProviderId(ref.provider)}/${ref.model}`, { allowAsyncLoad: params.allowAsyncLoad });
		if (qualifiedResult !== void 0) return qualifiedResult;
	}
	const bareResult = lookupContextTokens(params.model, { allowAsyncLoad: params.allowAsyncLoad });
	if (bareResult !== void 0) return bareResult;
	if (!params.provider && ref && !ref.model.includes("/")) {
		const qualifiedResult = lookupContextTokens(`${normalizeProviderId(ref.provider)}/${ref.model}`, { allowAsyncLoad: params.allowAsyncLoad });
		if (qualifiedResult !== void 0) return qualifiedResult;
	}
	return params.fallbackContextTokens;
}
//#endregion
export { resolveContextTokensForModel as a, lookupContextTokens as i, applyConfiguredContextWindows as n, resetContextWindowCacheForTest as o, applyDiscoveredContextWindows as r, ANTHROPIC_CONTEXT_1M_TOKENS as t };
