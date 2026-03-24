import { P as consumeRootOptionToken } from "./logger-kwZIqwuw.js";
import { a as resolveOpenClawAgentDir } from "./paths-C4Oy7wjk.js";
import { n as resolveAuthProfileOrder, s as isProfileInCooldown } from "./auth-profiles-DRuJBw5y.js";
import { f as normalizeVerboseLevel } from "./thinking.shared-BtwPxLYS.js";
import { E as resolveThreadParentSessionKey } from "./session-key-DAhnzjyr.js";
import { i as resolveAgentConfig } from "./agent-scope-bjWqU22i.js";
import "./defaults-eEZJg44K.js";
import { S as resolveThinkingDefault, l as modelKey, r as buildConfiguredModelCatalog, t as buildAllowedModelSet, u as normalizeModelRef, v as resolveModelRefFromString, y as resolveReasoningDefault } from "./model-selection-BnFtDmP7.js";
import { r as normalizeProviderId } from "./provider-id-Cjha-r0T.js";
import { s as loadConfig } from "./io-y3Az_Onx.js";
import { c as ensureAuthProfileStore } from "./profiles-COPO-hHI.js";
import { t as applyModelOverrideToSessionEntry } from "./model-overrides-B_s4f-Dt.js";
import path from "node:path";
import { setTimeout } from "node:timers/promises";
//#region src/infra/backoff.ts
function computeBackoff(policy, attempt) {
	const base = policy.initialMs * policy.factor ** Math.max(attempt - 1, 0);
	const jitter = base * policy.jitter * Math.random();
	return Math.min(policy.maxMs, Math.round(base + jitter));
}
async function sleepWithAbort(ms, abortSignal) {
	if (ms <= 0) return;
	try {
		await setTimeout(ms, void 0, { signal: abortSignal });
	} catch (err) {
		if (abortSignal?.aborted) throw new Error("aborted", { cause: err });
		throw err;
	}
}
//#endregion
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
	modelsConfigRuntimePromise ??= import("./models-config.runtime-DX2RkBw2.js");
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
			const { discoverAuthStorage, discoverModels } = await import("./pi-model-discovery-runtime-DgMni_xt.js");
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
	if (providerRaw) return {
		provider: providerRaw.toLowerCase(),
		model: modelRaw
	};
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
//#region src/agents/auth-profiles/session-override.ts
let sessionStoreRuntimePromise$1;
function loadSessionStoreRuntime$1() {
	sessionStoreRuntimePromise$1 ??= import("./store.runtime-BUH06cih.js");
	return sessionStoreRuntimePromise$1;
}
function isProfileForProvider(params) {
	const entry = params.store.profiles[params.profileId];
	if (!entry?.provider) return false;
	return normalizeProviderId(entry.provider) === normalizeProviderId(params.provider);
}
async function clearSessionAuthProfileOverride(params) {
	const { sessionEntry, sessionStore, sessionKey, storePath } = params;
	delete sessionEntry.authProfileOverride;
	delete sessionEntry.authProfileOverrideSource;
	delete sessionEntry.authProfileOverrideCompactionCount;
	sessionEntry.updatedAt = Date.now();
	sessionStore[sessionKey] = sessionEntry;
	if (storePath) await (await loadSessionStoreRuntime$1()).updateSessionStore(storePath, (store) => {
		store[sessionKey] = sessionEntry;
	});
}
async function resolveSessionAuthProfileOverride(params) {
	const { cfg, provider, agentDir, sessionEntry, sessionStore, sessionKey, storePath, isNewSession } = params;
	if (!sessionEntry || !sessionStore || !sessionKey) return sessionEntry?.authProfileOverride;
	const store = ensureAuthProfileStore(agentDir, { allowKeychainPrompt: false });
	const order = resolveAuthProfileOrder({
		cfg,
		store,
		provider
	});
	let current = sessionEntry.authProfileOverride?.trim();
	if (current && !store.profiles[current]) {
		await clearSessionAuthProfileOverride({
			sessionEntry,
			sessionStore,
			sessionKey,
			storePath
		});
		current = void 0;
	}
	if (current && !isProfileForProvider({
		provider,
		profileId: current,
		store
	})) {
		await clearSessionAuthProfileOverride({
			sessionEntry,
			sessionStore,
			sessionKey,
			storePath
		});
		current = void 0;
	}
	if (current && order.length > 0 && !order.includes(current)) {
		await clearSessionAuthProfileOverride({
			sessionEntry,
			sessionStore,
			sessionKey,
			storePath
		});
		current = void 0;
	}
	if (order.length === 0) return;
	const pickFirstAvailable = () => order.find((profileId) => !isProfileInCooldown(store, profileId)) ?? order[0];
	const pickNextAvailable = (active) => {
		const startIndex = order.indexOf(active);
		if (startIndex < 0) return pickFirstAvailable();
		for (let offset = 1; offset <= order.length; offset += 1) {
			const candidate = order[(startIndex + offset) % order.length];
			if (!isProfileInCooldown(store, candidate)) return candidate;
		}
		return order[startIndex] ?? order[0];
	};
	const compactionCount = sessionEntry.compactionCount ?? 0;
	const storedCompaction = typeof sessionEntry.authProfileOverrideCompactionCount === "number" ? sessionEntry.authProfileOverrideCompactionCount : compactionCount;
	if ((sessionEntry.authProfileOverrideSource ?? (typeof sessionEntry.authProfileOverrideCompactionCount === "number" ? "auto" : current ? "user" : void 0)) === "user" && current && !isNewSession) return current;
	let next = current;
	if (isNewSession) next = current ? pickNextAvailable(current) : pickFirstAvailable();
	else if (current && compactionCount > storedCompaction) next = pickNextAvailable(current);
	else if (!current || isProfileInCooldown(store, current)) next = pickFirstAvailable();
	if (!next) return current;
	if (next !== sessionEntry.authProfileOverride || sessionEntry.authProfileOverrideSource !== "auto" || sessionEntry.authProfileOverrideCompactionCount !== compactionCount) {
		sessionEntry.authProfileOverride = next;
		sessionEntry.authProfileOverrideSource = "auto";
		sessionEntry.authProfileOverrideCompactionCount = compactionCount;
		sessionEntry.updatedAt = Date.now();
		sessionStore[sessionKey] = sessionEntry;
		if (storePath) await (await loadSessionStoreRuntime$1()).updateSessionStore(storePath, (store) => {
			store[sessionKey] = sessionEntry;
		});
	}
	return next;
}
//#endregion
//#region src/auto-reply/reply/model-selection.ts
function shouldLogModelSelectionTiming() {
	return process.env.OPENCLAW_DEBUG_INGRESS_TIMING === "1";
}
let modelCatalogRuntimePromise;
let sessionStoreRuntimePromise;
function loadModelCatalogRuntime() {
	modelCatalogRuntimePromise ??= import("./model-catalog.runtime-EA0HGEiM.js");
	return modelCatalogRuntimePromise;
}
function loadSessionStoreRuntime() {
	sessionStoreRuntimePromise ??= import("./store.runtime-BUH06cih.js");
	return sessionStoreRuntimePromise;
}
const FUZZY_VARIANT_TOKENS = [
	"lightning",
	"preview",
	"mini",
	"fast",
	"turbo",
	"lite",
	"beta",
	"small",
	"nano"
];
function boundedLevenshteinDistance(a, b, maxDistance) {
	if (a === b) return 0;
	if (!a || !b) return null;
	const aLen = a.length;
	const bLen = b.length;
	if (Math.abs(aLen - bLen) > maxDistance) return null;
	const prev = Array.from({ length: bLen + 1 }, (_, idx) => idx);
	const curr = Array.from({ length: bLen + 1 }, () => 0);
	for (let i = 1; i <= aLen; i++) {
		curr[0] = i;
		let rowMin = curr[0];
		const aChar = a.charCodeAt(i - 1);
		for (let j = 1; j <= bLen; j++) {
			const cost = aChar === b.charCodeAt(j - 1) ? 0 : 1;
			curr[j] = Math.min(prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + cost);
			if (curr[j] < rowMin) rowMin = curr[j];
		}
		if (rowMin > maxDistance) return null;
		for (let j = 0; j <= bLen; j++) prev[j] = curr[j] ?? 0;
	}
	const dist = prev[bLen] ?? null;
	if (dist == null || dist > maxDistance) return null;
	return dist;
}
function resolveModelOverrideFromEntry(entry) {
	const model = entry?.modelOverride?.trim();
	if (!model) return null;
	return {
		provider: entry?.providerOverride?.trim() || void 0,
		model
	};
}
function resolveParentSessionKeyCandidate(params) {
	const explicit = params.parentSessionKey?.trim();
	if (explicit && explicit !== params.sessionKey) return explicit;
	const derived = resolveThreadParentSessionKey(params.sessionKey);
	if (derived && derived !== params.sessionKey) return derived;
	return null;
}
function resolveStoredModelOverride(params) {
	const direct = resolveModelOverrideFromEntry(params.sessionEntry);
	if (direct) return {
		...direct,
		source: "session"
	};
	const parentKey = resolveParentSessionKeyCandidate({
		sessionKey: params.sessionKey,
		parentSessionKey: params.parentSessionKey
	});
	if (!parentKey || !params.sessionStore) return null;
	const parentEntry = params.sessionStore[parentKey];
	const parentOverride = resolveModelOverrideFromEntry(parentEntry);
	if (!parentOverride) return null;
	return {
		...parentOverride,
		source: "parent"
	};
}
function scoreFuzzyMatch(params) {
	const provider = normalizeProviderId(params.provider);
	const model = params.model;
	const fragment = params.fragment.trim().toLowerCase();
	const providerLower = provider.toLowerCase();
	const modelLower = model.toLowerCase();
	const haystack = `${providerLower}/${modelLower}`;
	const key = modelKey(provider, model);
	const scoreFragment = (value, weights) => {
		if (!fragment) return 0;
		let score = 0;
		if (value === fragment) score = Math.max(score, weights.exact);
		if (value.startsWith(fragment)) score = Math.max(score, weights.starts);
		if (value.includes(fragment)) score = Math.max(score, weights.includes);
		return score;
	};
	let score = 0;
	score += scoreFragment(haystack, {
		exact: 220,
		starts: 140,
		includes: 110
	});
	score += scoreFragment(providerLower, {
		exact: 180,
		starts: 120,
		includes: 90
	});
	score += scoreFragment(modelLower, {
		exact: 160,
		starts: 110,
		includes: 80
	});
	const distModel = boundedLevenshteinDistance(fragment, modelLower, 3);
	if (distModel != null) score += (3 - distModel) * 70;
	const aliases = params.aliasIndex.byKey.get(key) ?? [];
	for (const alias of aliases) score += scoreFragment(alias.toLowerCase(), {
		exact: 140,
		starts: 90,
		includes: 60
	});
	if (modelLower.startsWith(providerLower)) score += 30;
	const fragmentVariants = FUZZY_VARIANT_TOKENS.filter((token) => fragment.includes(token));
	const modelVariants = FUZZY_VARIANT_TOKENS.filter((token) => modelLower.includes(token));
	const variantMatchCount = fragmentVariants.filter((token) => modelLower.includes(token)).length;
	const variantCount = modelVariants.length;
	if (fragmentVariants.length === 0 && variantCount > 0) score -= variantCount * 30;
	else if (fragmentVariants.length > 0) {
		if (variantMatchCount > 0) score += variantMatchCount * 40;
		if (variantMatchCount === 0) score -= 20;
	}
	const isDefault = provider === normalizeProviderId(params.defaultProvider) && model === params.defaultModel;
	if (isDefault) score += 20;
	return {
		score,
		isDefault,
		variantCount,
		variantMatchCount,
		modelLength: modelLower.length,
		key
	};
}
async function createModelSelectionState(params) {
	const timingEnabled = shouldLogModelSelectionTiming();
	const startMs = timingEnabled ? Date.now() : 0;
	const logStage = (stage, extra) => {
		if (!timingEnabled) return;
		const suffix = extra ? ` ${extra}` : "";
		console.log(`[model-selection] session=${params.sessionKey ?? "(no-session)"} stage=${stage} elapsedMs=${Date.now() - startMs}${suffix}`);
	};
	const { cfg, agentCfg, sessionEntry, sessionStore, sessionKey, parentSessionKey, storePath, defaultProvider, defaultModel } = params;
	let provider = params.provider;
	let model = params.model;
	const hasAllowlist = agentCfg?.models && Object.keys(agentCfg.models).length > 0;
	const initialStoredOverride = resolveStoredModelOverride({
		sessionEntry,
		sessionStore,
		sessionKey,
		parentSessionKey
	});
	const hasStoredOverride = Boolean(initialStoredOverride);
	const configuredModelCatalog = buildConfiguredModelCatalog({ cfg });
	const needsModelCatalog = params.hasModelDirective;
	let allowedModelKeys = /* @__PURE__ */ new Set();
	let allowedModelCatalog = configuredModelCatalog;
	let modelCatalog = null;
	let resetModelOverride = false;
	const agentEntry = params.agentId ? resolveAgentConfig(cfg, params.agentId) : void 0;
	if (needsModelCatalog) {
		modelCatalog = await (await loadModelCatalogRuntime()).loadModelCatalog({ config: cfg });
		logStage("catalog-loaded", `entries=${modelCatalog.length}`);
		const allowed = buildAllowedModelSet({
			cfg,
			catalog: modelCatalog,
			defaultProvider,
			defaultModel,
			agentId: params.agentId
		});
		allowedModelCatalog = allowed.allowedCatalog;
		allowedModelKeys = allowed.allowedKeys;
		logStage("allowlist-built", `allowed=${allowedModelCatalog.length} keys=${allowedModelKeys.size}`);
	} else if (hasAllowlist) {
		const allowed = buildAllowedModelSet({
			cfg,
			catalog: configuredModelCatalog,
			defaultProvider,
			defaultModel,
			agentId: params.agentId
		});
		allowedModelCatalog = allowed.allowedCatalog;
		allowedModelKeys = allowed.allowedKeys;
		logStage("configured-allowlist-built", `allowed=${allowedModelCatalog.length} keys=${allowedModelKeys.size}`);
	} else if (configuredModelCatalog.length > 0) logStage("configured-catalog-ready", `entries=${configuredModelCatalog.length}`);
	if (sessionEntry && sessionStore && sessionKey && hasStoredOverride) {
		const overrideProvider = sessionEntry.providerOverride?.trim() || defaultProvider;
		const overrideModel = sessionEntry.modelOverride?.trim();
		if (overrideModel) {
			const normalizedOverride = normalizeModelRef(overrideProvider, overrideModel);
			const key = modelKey(normalizedOverride.provider, normalizedOverride.model);
			if (allowedModelKeys.size > 0 && !allowedModelKeys.has(key)) {
				const { updated } = applyModelOverrideToSessionEntry({
					entry: sessionEntry,
					selection: {
						provider: defaultProvider,
						model: defaultModel,
						isDefault: true
					}
				});
				if (updated) {
					sessionStore[sessionKey] = sessionEntry;
					if (storePath) await (await loadSessionStoreRuntime()).updateSessionStore(storePath, (store) => {
						store[sessionKey] = sessionEntry;
					});
				}
				resetModelOverride = updated;
			}
		}
	}
	const storedOverride = resolveStoredModelOverride({
		sessionEntry,
		sessionStore,
		sessionKey,
		parentSessionKey
	});
	const skipStoredOverride = params.hasResolvedHeartbeatModelOverride === true;
	if (storedOverride?.model && !skipStoredOverride) {
		const normalizedStoredOverride = normalizeModelRef(storedOverride.provider || defaultProvider, storedOverride.model);
		const key = modelKey(normalizedStoredOverride.provider, normalizedStoredOverride.model);
		if (allowedModelKeys.size === 0 || allowedModelKeys.has(key)) {
			provider = normalizedStoredOverride.provider;
			model = normalizedStoredOverride.model;
		}
	}
	if (sessionEntry && sessionStore && sessionKey && sessionEntry.authProfileOverride) {
		const { ensureAuthProfileStore } = await import("./auth-profiles.runtime-CVkZJAGE.js");
		const store = ensureAuthProfileStore(void 0, { allowKeychainPrompt: false });
		logStage("auth-profile-store-loaded", `profiles=${Object.keys(store.profiles).length}`);
		const profile = store.profiles[sessionEntry.authProfileOverride];
		const providerKey = normalizeProviderId(provider);
		if (!profile || normalizeProviderId(profile.provider) !== providerKey) await clearSessionAuthProfileOverride({
			sessionEntry,
			sessionStore,
			sessionKey,
			storePath
		});
	}
	let defaultThinkingLevel;
	const resolveDefaultThinkingLevel = async () => {
		if (defaultThinkingLevel) return defaultThinkingLevel;
		let catalogForThinking = modelCatalog ?? allowedModelCatalog;
		if (!catalogForThinking || catalogForThinking.length === 0) {
			modelCatalog = await (await loadModelCatalogRuntime()).loadModelCatalog({ config: cfg });
			logStage("catalog-loaded-for-thinking", `entries=${modelCatalog.length}`);
			catalogForThinking = modelCatalog;
		}
		const resolved = resolveThinkingDefault({
			cfg,
			provider,
			model,
			catalog: catalogForThinking
		});
		defaultThinkingLevel = agentEntry?.thinkingDefault ?? resolved ?? agentCfg?.thinkingDefault ?? "off";
		return defaultThinkingLevel;
	};
	const resolveDefaultReasoningLevel = async () => {
		let catalogForReasoning = modelCatalog ?? allowedModelCatalog;
		if (!catalogForReasoning || catalogForReasoning.length === 0) {
			modelCatalog = await (await loadModelCatalogRuntime()).loadModelCatalog({ config: cfg });
			logStage("catalog-loaded-for-reasoning", `entries=${modelCatalog.length}`);
			catalogForReasoning = modelCatalog;
		}
		return resolveReasoningDefault({
			provider,
			model,
			catalog: catalogForReasoning
		});
	};
	return {
		provider,
		model,
		allowedModelKeys,
		allowedModelCatalog,
		resetModelOverride,
		resolveDefaultThinkingLevel,
		resolveDefaultReasoningLevel,
		needsModelCatalog
	};
}
function resolveModelDirectiveSelection(params) {
	const { raw, defaultProvider, defaultModel, aliasIndex, allowedModelKeys } = params;
	const rawTrimmed = raw.trim();
	const rawLower = rawTrimmed.toLowerCase();
	const pickAliasForKey = (provider, model) => aliasIndex.byKey.get(modelKey(provider, model))?.[0];
	const buildSelection = (provider, model) => {
		const alias = pickAliasForKey(provider, model);
		return {
			provider,
			model,
			isDefault: provider === defaultProvider && model === defaultModel,
			...alias ? { alias } : void 0
		};
	};
	const resolveFuzzy = (params) => {
		const fragment = params.fragment.trim().toLowerCase();
		if (!fragment) return {};
		const providerFilter = params.provider ? normalizeProviderId(params.provider) : void 0;
		const candidates = [];
		for (const key of allowedModelKeys) {
			const slash = key.indexOf("/");
			if (slash <= 0) continue;
			const provider = normalizeProviderId(key.slice(0, slash));
			const model = key.slice(slash + 1);
			if (providerFilter && provider !== providerFilter) continue;
			candidates.push({
				provider,
				model
			});
		}
		if (!params.provider) {
			const aliasMatches = [];
			for (const [aliasKey, entry] of aliasIndex.byAlias.entries()) {
				if (!aliasKey.includes(fragment)) continue;
				aliasMatches.push({
					provider: entry.ref.provider,
					model: entry.ref.model
				});
			}
			for (const match of aliasMatches) {
				const key = modelKey(match.provider, match.model);
				if (!allowedModelKeys.has(key)) continue;
				if (!candidates.some((c) => c.provider === match.provider && c.model === match.model)) candidates.push(match);
			}
		}
		if (candidates.length === 0) return {};
		const bestScored = candidates.map((candidate) => {
			const details = scoreFuzzyMatch({
				provider: candidate.provider,
				model: candidate.model,
				fragment,
				aliasIndex,
				defaultProvider,
				defaultModel
			});
			return Object.assign({ candidate }, details);
		}).toSorted((a, b) => {
			if (b.score !== a.score) return b.score - a.score;
			if (a.isDefault !== b.isDefault) return a.isDefault ? -1 : 1;
			if (a.variantMatchCount !== b.variantMatchCount) return b.variantMatchCount - a.variantMatchCount;
			if (a.variantCount !== b.variantCount) return a.variantCount - b.variantCount;
			if (a.modelLength !== b.modelLength) return a.modelLength - b.modelLength;
			return a.key.localeCompare(b.key);
		})[0];
		const best = bestScored?.candidate;
		if (!best || !bestScored) return {};
		const minScore = providerFilter ? 90 : 120;
		if (bestScored.score < minScore) return {};
		return { selection: buildSelection(best.provider, best.model) };
	};
	const resolved = resolveModelRefFromString({
		raw: rawTrimmed,
		defaultProvider,
		aliasIndex
	});
	if (!resolved) {
		const fuzzy = resolveFuzzy({ fragment: rawTrimmed });
		if (fuzzy.selection || fuzzy.error) return fuzzy;
		return { error: `Unrecognized model "${rawTrimmed}". Use /models to list providers, or /models <provider> to list models.` };
	}
	const resolvedKey = modelKey(resolved.ref.provider, resolved.ref.model);
	if (allowedModelKeys.size === 0 || allowedModelKeys.has(resolvedKey)) return { selection: {
		provider: resolved.ref.provider,
		model: resolved.ref.model,
		isDefault: resolved.ref.provider === defaultProvider && resolved.ref.model === defaultModel,
		alias: resolved.alias
	} };
	if (rawLower.includes("/")) {
		const slash = rawTrimmed.indexOf("/");
		const fuzzy = resolveFuzzy({
			provider: normalizeProviderId(rawTrimmed.slice(0, slash).trim()),
			fragment: rawTrimmed.slice(slash + 1).trim()
		});
		if (fuzzy.selection || fuzzy.error) return fuzzy;
	}
	const fuzzy = resolveFuzzy({ fragment: rawTrimmed });
	if (fuzzy.selection || fuzzy.error) return fuzzy;
	return { error: `Model "${resolved.ref.provider}/${resolved.ref.model}" is not allowed. Use /models to list providers, or /models <provider> to list models.` };
}
function resolveContextTokens(params) {
	return params.agentCfg?.contextTokens ?? lookupContextTokens(params.model, { allowAsyncLoad: false }) ?? 2e5;
}
//#endregion
//#region src/sessions/level-overrides.ts
function parseVerboseOverride(raw) {
	if (raw === null) return {
		ok: true,
		value: null
	};
	if (raw === void 0) return {
		ok: true,
		value: void 0
	};
	if (typeof raw !== "string") return {
		ok: false,
		error: "invalid verboseLevel (use \"on\"|\"off\")"
	};
	const normalized = normalizeVerboseLevel(raw);
	if (!normalized) return {
		ok: false,
		error: "invalid verboseLevel (use \"on\"|\"off\")"
	};
	return {
		ok: true,
		value: normalized
	};
}
function applyVerboseOverride(entry, level) {
	if (level === void 0) return;
	if (level === null) {
		delete entry.verboseLevel;
		return;
	}
	entry.verboseLevel = level;
}
//#endregion
export { resolveModelDirectiveSelection as a, resolveSessionAuthProfileOverride as c, lookupCachedContextTokens as d, computeBackoff as f, resolveContextTokens as i, lookupContextTokens as l, parseVerboseOverride as n, resolveStoredModelOverride as o, sleepWithAbort as p, createModelSelectionState as r, clearSessionAuthProfileOverride as s, applyVerboseOverride as t, resolveContextTokensForModel as u };
