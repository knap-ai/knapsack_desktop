import { I as consumeRootOptionToken } from "./logger-BCzP_yik.js";
import { r as normalizeProviderId } from "./provider-id-CTiEzT1T.js";
import "./model-selection-8a6zD_aX.js";
import { c as loadConfig } from "./io-DhtVmzAJ.js";
import "./config-CJQx-9zo.js";
import { t as resolveOpenClawAgentDir } from "./agent-paths-BiYMSfDv.js";
import { t as computeBackoff } from "./backoff-JR-Kmsdz.js";
import path from "node:path";
//#region src/agents/context-cache.ts
const MODEL_CONTEXT_TOKEN_CACHE = /* @__PURE__ */ new Map();
function lookupCachedContextTokens(modelId) {
	if (!modelId) return;
	return MODEL_CONTEXT_TOKEN_CACHE.get(modelId);
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
		const contextWindow = typeof model.contextWindow === "number" ? Math.trunc(model.contextWindow) : void 0;
		if (!contextWindow || contextWindow <= 0) continue;
		const existing = params.cache.get(model.id);
		if (existing === void 0 || contextWindow < existing) params.cache.set(model.id, contextWindow);
	}
}
function applyConfiguredContextWindows(params) {
	const providers = params.modelsConfig?.providers;
	if (!providers || typeof providers !== "object") return;
	for (const provider of Object.values(providers)) {
		if (!Array.isArray(provider?.models)) continue;
		for (const model of provider.models) {
			const modelId = typeof model?.id === "string" ? model.id : void 0;
			const contextWindow = typeof model?.contextWindow === "number" ? model.contextWindow : void 0;
			if (!modelId || !contextWindow || contextWindow <= 0) continue;
			params.cache.set(modelId, contextWindow);
		}
	}
}
let loadPromise = null;
let configuredConfig;
let configLoadFailures = 0;
let nextConfigLoadAttemptAtMs = 0;
let modelsConfigRuntimePromise;
function loadModelsConfigRuntime() {
	modelsConfigRuntimePromise ??= import("./models-config.runtime-Bhf9-CNN.js");
	return modelsConfigRuntimePromise;
}
function isLikelyOpenClawCliProcess(argv = process.argv) {
	const entryBasename = path.basename(argv[1] ?? "").trim().toLowerCase();
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
	"backup",
	"completion",
	"config",
	"directory",
	"doctor",
	"gateway",
	"health",
	"hooks",
	"logs",
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
	if (configuredConfig) return configuredConfig;
	if (Date.now() < nextConfigLoadAttemptAtMs) return;
	try {
		const cfg = loadConfig();
		applyConfiguredContextWindows({
			cache: MODEL_CONTEXT_TOKEN_CACHE,
			modelsConfig: cfg.models
		});
		configuredConfig = cfg;
		configLoadFailures = 0;
		nextConfigLoadAttemptAtMs = 0;
		return cfg;
	} catch {
		configLoadFailures += 1;
		const backoffMs = computeBackoff(CONFIG_LOAD_RETRY_POLICY, configLoadFailures);
		nextConfigLoadAttemptAtMs = Date.now() + backoffMs;
		return;
	}
}
function ensureContextWindowCacheLoaded() {
	if (loadPromise) return loadPromise;
	const cfg = primeConfiguredContextWindows();
	if (!cfg) return Promise.resolve();
	loadPromise = (async () => {
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
	return loadPromise;
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
	const key = `${provider}/${model}`.trim().toLowerCase();
	for (const [rawKey, entry] of Object.entries(models)) if (rawKey.trim().toLowerCase() === key) {
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
function resolveConfiguredProviderContextWindow(cfg, provider, model) {
	const providers = (cfg?.models)?.providers;
	if (!providers) return;
	function findContextWindow(matchProviderId) {
		for (const [providerId, providerConfig] of Object.entries(providers)) {
			if (!matchProviderId(providerId)) continue;
			if (!Array.isArray(providerConfig?.models)) continue;
			for (const m of providerConfig.models) if (typeof m?.id === "string" && m.id === model && typeof m?.contextWindow === "number" && m.contextWindow > 0) return m.contextWindow;
		}
	}
	const exactResult = findContextWindow((id) => id.trim().toLowerCase() === provider.toLowerCase());
	if (exactResult !== void 0) return exactResult;
	const normalizedProvider = normalizeProviderId(provider);
	return findContextWindow((id) => normalizeProviderId(id) === normalizedProvider);
}
function isAnthropic1MModel(provider, model) {
	if (provider !== "anthropic") return false;
	const normalized = model.trim().toLowerCase();
	const modelId = normalized.includes("/") ? normalized.split("/").at(-1) ?? normalized : normalized;
	return ANTHROPIC_1M_MODEL_PREFIXES.some((prefix) => modelId.startsWith(prefix));
}
function resolveContextTokensForModel(params) {
	if (typeof params.contextTokensOverride === "number" && params.contextTokensOverride > 0) return params.contextTokensOverride;
	const ref = resolveProviderModelRef({
		provider: params.provider,
		model: params.model
	});
	if (ref) {
		if (resolveConfiguredModelParams(params.cfg, ref.provider, ref.model)?.context1m === true && isAnthropic1MModel(ref.provider, ref.model)) return ANTHROPIC_CONTEXT_1M_TOKENS;
		if (params.provider) {
			const configuredWindow = resolveConfiguredProviderContextWindow(params.cfg, ref.provider, ref.model);
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
export { resolveContextTokensForModel as n, lookupCachedContextTokens as r, lookupContextTokens as t };
