import { i as normalizeLowercaseStringOrEmpty, o as normalizeOptionalLowercaseString, s as normalizeOptionalString } from "./string-coerce-BUSzWgUA.js";
import { r as stripAnsi, t as sanitizeForLog } from "./ansi-Bs_ZZlnS.js";
import { t as createSubsystemLogger } from "./subsystem-Cgmckbux.js";
import { r as normalizeProviderId } from "./provider-id-KaStHhRz.js";
import { n as DEFAULT_MODEL, r as DEFAULT_PROVIDER } from "./defaults-CiQa3xnX.js";
import { n as resolveAgentModelPrimaryValue, r as toAgentModelListLike, t as resolveAgentModelFallbackValues } from "./model-input-DFbXtnkw.js";
import { _ as resolveAgentConfig, n as resolveAgentEffectiveModelPrimary, s as resolveAgentModelFallbacksOverride } from "./agent-scope-KFH9bkHi.js";
import { d as legacyModelKey, f as modelKey, g as resolveConfiguredProviderFallback, h as splitTrailingAuthProfile, m as parseModelRef, o as normalizeModelSelection$1 } from "./model-selection-cli-_3Gn8Wcd.js";
import { p as resolveThinkingDefaultForModel } from "./thinking.shared-CAbk7EZs.js";
//#region src/agents/model-thinking-default.ts
function resolveThinkingDefault(params) {
	const normalizedProvider = normalizeProviderId(params.provider);
	const normalizedModel = normalizeLowercaseStringOrEmpty(params.model).replace(/\./g, "-");
	const catalogCandidate = Array.isArray(params.catalog) ? params.catalog.find((entry) => entry.provider === params.provider && entry.id === params.model) : void 0;
	const configuredModels = params.cfg.agents?.defaults?.models;
	const canonicalKey = modelKey(params.provider, params.model);
	const legacyKey = legacyModelKey(params.provider, params.model);
	const normalizedCanonicalKey = normalizeLowercaseStringOrEmpty(canonicalKey);
	const normalizedLegacyKey = normalizeOptionalLowercaseString(legacyKey);
	const normalizedPrimarySelection = normalizeOptionalLowercaseString(normalizeModelSelection$1(params.cfg.agents?.defaults?.model));
	const explicitModelConfigured = (configuredModels ? canonicalKey in configuredModels : false) || Boolean(legacyKey && configuredModels && legacyKey in configuredModels) || normalizedPrimarySelection === normalizedCanonicalKey || Boolean(normalizedLegacyKey && normalizedPrimarySelection === normalizedLegacyKey) || normalizedPrimarySelection === normalizeLowercaseStringOrEmpty(params.model);
	const perModelThinking = configuredModels?.[canonicalKey]?.params?.thinking ?? (legacyKey ? configuredModels?.[legacyKey]?.params?.thinking : void 0);
	if (perModelThinking === "off" || perModelThinking === "minimal" || perModelThinking === "low" || perModelThinking === "medium" || perModelThinking === "high" || perModelThinking === "xhigh" || perModelThinking === "adaptive") return perModelThinking;
	const configured = params.cfg.agents?.defaults?.thinkingDefault;
	if (configured) return configured;
	if (normalizedProvider === "anthropic" && explicitModelConfigured && typeof catalogCandidate?.name === "string" && /4\.6\b/.test(catalogCandidate.name) && (normalizedModel.startsWith("claude-opus-4-6") || normalizedModel.startsWith("claude-sonnet-4-6"))) return "adaptive";
	return resolveThinkingDefaultForModel({
		provider: params.provider,
		model: params.model,
		catalog: params.catalog
	});
}
//#endregion
//#region src/agents/model-selection.ts
let log = null;
function getLog() {
	log ??= createSubsystemLogger("model-selection");
	return log;
}
function sanitizeModelWarningValue(value) {
	const stripped = value ? stripAnsi(value) : "";
	let controlBoundary = -1;
	for (let index = 0; index < stripped.length; index += 1) {
		const code = stripped.charCodeAt(index);
		if (code <= 31 || code === 127) {
			controlBoundary = index;
			break;
		}
	}
	if (controlBoundary === -1) return sanitizeForLog(stripped);
	return sanitizeForLog(stripped.slice(0, controlBoundary));
}
function resolvePersistedOverrideModelRef(params) {
	const defaultProvider = params.defaultProvider.trim();
	const overrideProvider = params.overrideProvider?.trim();
	const overrideModel = params.overrideModel?.trim();
	if (!overrideModel) return null;
	return parseModelRef(overrideProvider ? `${overrideProvider}/${overrideModel}` : overrideModel, defaultProvider) ?? {
		provider: overrideProvider || defaultProvider,
		model: overrideModel
	};
}
/**
* Runtime-first resolver for persisted model metadata.
* Use this when callers intentionally want the last executed model identity.
*/
function resolvePersistedModelRef(params) {
	const defaultProvider = params.defaultProvider.trim();
	const runtimeProvider = params.runtimeProvider?.trim();
	const runtimeModel = params.runtimeModel?.trim();
	if (runtimeModel) {
		if (runtimeProvider) return {
			provider: runtimeProvider,
			model: runtimeModel
		};
		return parseModelRef(runtimeModel, defaultProvider) ?? {
			provider: defaultProvider,
			model: runtimeModel
		};
	}
	return resolvePersistedOverrideModelRef({
		defaultProvider,
		overrideProvider: params.overrideProvider,
		overrideModel: params.overrideModel
	});
}
/**
* Selected-model resolver for persisted model metadata.
* Use this for control/status/UI surfaces that should honor explicit session
* overrides before falling back to runtime identity.
*/
function resolvePersistedSelectedModelRef(params) {
	const override = resolvePersistedOverrideModelRef({
		defaultProvider: params.defaultProvider,
		overrideProvider: params.overrideProvider,
		overrideModel: params.overrideModel
	});
	if (override) return override;
	return resolvePersistedModelRef({
		defaultProvider: params.defaultProvider,
		runtimeProvider: params.runtimeProvider,
		runtimeModel: params.runtimeModel
	});
}
function normalizeStoredOverrideModel(params) {
	const providerOverride = params.providerOverride?.trim();
	const modelOverride = params.modelOverride?.trim();
	if (!providerOverride || !modelOverride) return {
		providerOverride,
		modelOverride
	};
	const providerPrefix = `${providerOverride.toLowerCase()}/`;
	return {
		providerOverride,
		modelOverride: modelOverride.toLowerCase().startsWith(providerPrefix) ? modelOverride.slice(providerOverride.length + 1).trim() || modelOverride : modelOverride
	};
}
function inferUniqueProviderFromConfiguredModels(params) {
	const model = params.model.trim();
	if (!model) return;
	const normalized = normalizeLowercaseStringOrEmpty(model);
	const providers = /* @__PURE__ */ new Set();
	const addProvider = (provider) => {
		const normalizedProvider = normalizeProviderId(provider);
		if (!normalizedProvider) return;
		providers.add(normalizedProvider);
	};
	const configuredModels = params.cfg.agents?.defaults?.models;
	if (configuredModels) for (const key of Object.keys(configuredModels)) {
		const ref = key.trim();
		if (!ref || !ref.includes("/")) continue;
		const parsed = parseModelRef(ref, DEFAULT_PROVIDER, { allowPluginNormalization: false });
		if (!parsed) continue;
		if (parsed.model === model || normalizeLowercaseStringOrEmpty(parsed.model) === normalized) {
			addProvider(parsed.provider);
			if (providers.size > 1) return;
		}
	}
	const configuredProviders = params.cfg.models?.providers;
	if (configuredProviders) for (const [providerId, providerConfig] of Object.entries(configuredProviders)) {
		const models = providerConfig?.models;
		if (!Array.isArray(models)) continue;
		for (const entry of models) {
			const modelId = entry?.id?.trim();
			if (!modelId) continue;
			if (modelId === model || normalizeLowercaseStringOrEmpty(modelId) === normalized) addProvider(providerId);
		}
		if (providers.size > 1) return;
	}
	if (providers.size !== 1) return;
	return providers.values().next().value;
}
function resolveAllowlistModelKey(raw, defaultProvider) {
	const parsed = parseModelRef(raw, defaultProvider);
	if (!parsed) return null;
	return modelKey(parsed.provider, parsed.model);
}
function buildConfiguredAllowlistKeys(params) {
	const rawAllowlist = Object.keys(params.cfg?.agents?.defaults?.models ?? {});
	if (rawAllowlist.length === 0) return null;
	const keys = /* @__PURE__ */ new Set();
	for (const raw of rawAllowlist) {
		const key = resolveAllowlistModelKey(raw, params.defaultProvider);
		if (key) keys.add(key);
	}
	return keys.size > 0 ? keys : null;
}
function buildModelAliasIndex(params) {
	const byAlias = /* @__PURE__ */ new Map();
	const byKey = /* @__PURE__ */ new Map();
	const rawModels = params.cfg.agents?.defaults?.models ?? {};
	for (const [keyRaw, entryRaw] of Object.entries(rawModels)) {
		const parsed = parseModelRef(keyRaw, params.defaultProvider, { allowPluginNormalization: params.allowPluginNormalization });
		if (!parsed) continue;
		const alias = normalizeOptionalString(entryRaw?.alias) ?? "";
		if (!alias) continue;
		const aliasKey = normalizeLowercaseStringOrEmpty(alias);
		byAlias.set(aliasKey, {
			alias,
			ref: parsed
		});
		const key = modelKey(parsed.provider, parsed.model);
		const existing = byKey.get(key) ?? [];
		existing.push(alias);
		byKey.set(key, existing);
	}
	return {
		byAlias,
		byKey
	};
}
function buildModelCatalogMetadata(params) {
	const configuredByKey = /* @__PURE__ */ new Map();
	for (const entry of buildConfiguredModelCatalog({ cfg: params.cfg })) configuredByKey.set(modelKey(entry.provider, entry.id), entry);
	const aliasByKey = /* @__PURE__ */ new Map();
	const configuredModels = params.cfg.agents?.defaults?.models ?? {};
	for (const [rawKey, entryRaw] of Object.entries(configuredModels)) {
		const key = resolveAllowlistModelKey(rawKey, params.defaultProvider);
		if (!key) continue;
		const alias = (entryRaw?.alias ?? "").trim();
		if (!alias) continue;
		aliasByKey.set(key, alias);
	}
	return {
		configuredByKey,
		aliasByKey
	};
}
function applyModelCatalogMetadata(params) {
	const key = modelKey(params.entry.provider, params.entry.id);
	const configuredEntry = params.metadata.configuredByKey.get(key);
	const alias = params.metadata.aliasByKey.get(key);
	if (!configuredEntry && !alias) return params.entry;
	const nextAlias = alias ?? params.entry.alias;
	const nextContextWindow = configuredEntry?.contextWindow ?? params.entry.contextWindow;
	const nextReasoning = configuredEntry?.reasoning ?? params.entry.reasoning;
	const nextInput = configuredEntry?.input ?? params.entry.input;
	return {
		...params.entry,
		name: configuredEntry?.name ?? params.entry.name,
		...nextAlias ? { alias: nextAlias } : {},
		...nextContextWindow !== void 0 ? { contextWindow: nextContextWindow } : {},
		...nextReasoning !== void 0 ? { reasoning: nextReasoning } : {},
		...nextInput ? { input: nextInput } : {}
	};
}
function buildSyntheticAllowedCatalogEntry(params) {
	const key = modelKey(params.parsed.provider, params.parsed.model);
	const configuredEntry = params.metadata.configuredByKey.get(key);
	const alias = params.metadata.aliasByKey.get(key);
	const nextContextWindow = configuredEntry?.contextWindow;
	const nextReasoning = configuredEntry?.reasoning;
	const nextInput = configuredEntry?.input;
	return {
		id: params.parsed.model,
		name: configuredEntry?.name ?? params.parsed.model,
		provider: params.parsed.provider,
		...alias ? { alias } : {},
		...nextContextWindow !== void 0 ? { contextWindow: nextContextWindow } : {},
		...nextReasoning !== void 0 ? { reasoning: nextReasoning } : {},
		...nextInput ? { input: nextInput } : {}
	};
}
function resolveModelRefFromString(params) {
	const { model } = splitTrailingAuthProfile(params.raw);
	if (!model) return null;
	if (!model.includes("/")) {
		const aliasKey = normalizeLowercaseStringOrEmpty(model);
		const aliasMatch = params.aliasIndex?.byAlias.get(aliasKey);
		if (aliasMatch) return {
			ref: aliasMatch.ref,
			alias: aliasMatch.alias
		};
	}
	const parsed = parseModelRef(model, params.defaultProvider, { allowPluginNormalization: params.allowPluginNormalization });
	if (!parsed) return null;
	return { ref: parsed };
}
function resolveConfiguredModelRef(params) {
	const rawModel = resolveAgentModelPrimaryValue(params.cfg.agents?.defaults?.model) ?? "";
	if (rawModel) {
		const trimmed = rawModel.trim();
		const aliasIndex = buildModelAliasIndex({
			cfg: params.cfg,
			defaultProvider: params.defaultProvider,
			allowPluginNormalization: params.allowPluginNormalization
		});
		if (!trimmed.includes("/")) {
			const aliasKey = normalizeLowercaseStringOrEmpty(trimmed);
			const aliasMatch = aliasIndex.byAlias.get(aliasKey);
			if (aliasMatch) return aliasMatch.ref;
			const inferredProvider = inferUniqueProviderFromConfiguredModels({
				cfg: params.cfg,
				model: trimmed
			});
			if (inferredProvider) return {
				provider: inferredProvider,
				model: trimmed
			};
			const safeTrimmed = sanitizeModelWarningValue(trimmed);
			const safeResolved = sanitizeForLog(`${params.defaultProvider}/${safeTrimmed}`);
			getLog().warn(`Model "${safeTrimmed}" specified without provider. Falling back to "${safeResolved}". Please use "${safeResolved}" in your config.`);
			return {
				provider: params.defaultProvider,
				model: trimmed
			};
		}
		const resolved = resolveModelRefFromString({
			raw: trimmed,
			defaultProvider: params.defaultProvider,
			aliasIndex,
			allowPluginNormalization: params.allowPluginNormalization
		});
		if (resolved) return resolved.ref;
		const safe = sanitizeForLog(trimmed);
		const safeFallback = sanitizeForLog(`${params.defaultProvider}/${params.defaultModel}`);
		getLog().warn(`Model "${safe}" could not be resolved. Falling back to default "${safeFallback}".`);
	}
	const fallbackProvider = resolveConfiguredProviderFallback({
		cfg: params.cfg,
		defaultProvider: params.defaultProvider
	});
	if (fallbackProvider) return fallbackProvider;
	return {
		provider: params.defaultProvider,
		model: params.defaultModel
	};
}
function resolveDefaultModelForAgent(params) {
	const agentModelOverride = params.agentId ? resolveAgentEffectiveModelPrimary(params.cfg, params.agentId) : void 0;
	return resolveConfiguredModelRef({
		cfg: agentModelOverride && agentModelOverride.length > 0 ? {
			...params.cfg,
			agents: {
				...params.cfg.agents,
				defaults: {
					...params.cfg.agents?.defaults,
					model: {
						...toAgentModelListLike(params.cfg.agents?.defaults?.model),
						primary: agentModelOverride
					}
				}
			}
		} : params.cfg,
		defaultProvider: DEFAULT_PROVIDER,
		defaultModel: DEFAULT_MODEL
	});
}
function resolveAllowedFallbacks(params) {
	if (params.agentId) {
		const override = resolveAgentModelFallbacksOverride(params.cfg, params.agentId);
		if (override !== void 0) return override;
	}
	return resolveAgentModelFallbackValues(params.cfg.agents?.defaults?.model);
}
function resolveSubagentConfiguredModelSelection(params) {
	const agentConfig = resolveAgentConfig(params.cfg, params.agentId);
	return normalizeModelSelection(agentConfig?.subagents?.model) ?? normalizeModelSelection(agentConfig?.model) ?? normalizeModelSelection(params.cfg.agents?.defaults?.subagents?.model);
}
function resolveSubagentSpawnModelSelection(params) {
	const runtimeDefault = resolveDefaultModelForAgent({
		cfg: params.cfg,
		agentId: params.agentId
	});
	return normalizeModelSelection(params.modelOverride) ?? resolveSubagentConfiguredModelSelection({
		cfg: params.cfg,
		agentId: params.agentId
	}) ?? normalizeModelSelection(resolveAgentModelPrimaryValue(params.cfg.agents?.defaults?.model)) ?? `${runtimeDefault.provider}/${runtimeDefault.model}`;
}
function buildAllowedModelSet(params) {
	const metadata = buildModelCatalogMetadata({
		cfg: params.cfg,
		defaultProvider: params.defaultProvider
	});
	const catalog = params.catalog.map((entry) => applyModelCatalogMetadata({
		entry,
		metadata
	}));
	const rawAllowlist = (() => {
		const modelMap = params.cfg.agents?.defaults?.models ?? {};
		return Object.keys(modelMap);
	})();
	const allowAny = rawAllowlist.length === 0;
	const defaultModel = params.defaultModel?.trim();
	const defaultRef = defaultModel && params.defaultProvider ? parseModelRef(defaultModel, params.defaultProvider) : null;
	const defaultKey = defaultRef ? modelKey(defaultRef.provider, defaultRef.model) : void 0;
	const catalogKeys = new Set(catalog.map((entry) => modelKey(entry.provider, entry.id)));
	if (allowAny) {
		if (defaultKey) catalogKeys.add(defaultKey);
		return {
			allowAny: true,
			allowedCatalog: catalog,
			allowedKeys: catalogKeys
		};
	}
	const allowedKeys = /* @__PURE__ */ new Set();
	const syntheticCatalogEntries = /* @__PURE__ */ new Map();
	for (const raw of rawAllowlist) {
		const parsed = parseModelRef(raw, params.defaultProvider);
		if (!parsed) continue;
		const key = modelKey(parsed.provider, parsed.model);
		allowedKeys.add(key);
		if (!catalogKeys.has(key) && !syntheticCatalogEntries.has(key)) syntheticCatalogEntries.set(key, buildSyntheticAllowedCatalogEntry({
			parsed,
			metadata
		}));
	}
	for (const fallback of resolveAllowedFallbacks({
		cfg: params.cfg,
		agentId: params.agentId
	})) {
		const parsed = parseModelRef(fallback, params.defaultProvider);
		if (parsed) {
			const key = modelKey(parsed.provider, parsed.model);
			allowedKeys.add(key);
			if (!catalogKeys.has(key) && !syntheticCatalogEntries.has(key)) syntheticCatalogEntries.set(key, buildSyntheticAllowedCatalogEntry({
				parsed,
				metadata
			}));
		}
	}
	if (defaultKey) allowedKeys.add(defaultKey);
	const allowedCatalog = [...catalog.filter((entry) => allowedKeys.has(modelKey(entry.provider, entry.id))), ...syntheticCatalogEntries.values()];
	if (allowedCatalog.length === 0 && allowedKeys.size === 0) {
		if (defaultKey) catalogKeys.add(defaultKey);
		return {
			allowAny: true,
			allowedCatalog: catalog,
			allowedKeys: catalogKeys
		};
	}
	return {
		allowAny: false,
		allowedCatalog,
		allowedKeys
	};
}
function buildConfiguredModelCatalog(params) {
	const providers = params.cfg.models?.providers;
	if (!providers || typeof providers !== "object") return [];
	const catalog = [];
	for (const [providerRaw, provider] of Object.entries(providers)) {
		const providerId = normalizeProviderId(providerRaw);
		if (!providerId || !Array.isArray(provider?.models)) continue;
		for (const model of provider.models) {
			const id = normalizeOptionalString(model?.id) ?? "";
			if (!id) continue;
			const name = normalizeOptionalString(model?.name) || id;
			const contextWindow = typeof model?.contextWindow === "number" && model.contextWindow > 0 ? model.contextWindow : void 0;
			const reasoning = typeof model?.reasoning === "boolean" ? model.reasoning : void 0;
			const input = Array.isArray(model?.input) ? model.input : void 0;
			catalog.push({
				provider: providerId,
				id,
				name,
				contextWindow,
				reasoning,
				input
			});
		}
	}
	return catalog;
}
function getModelRefStatus(params) {
	const allowed = buildAllowedModelSet({
		cfg: params.cfg,
		catalog: params.catalog,
		defaultProvider: params.defaultProvider,
		defaultModel: params.defaultModel
	});
	const key = modelKey(params.ref.provider, params.ref.model);
	return {
		key,
		inCatalog: params.catalog.some((entry) => modelKey(entry.provider, entry.id) === key),
		allowAny: allowed.allowAny,
		allowed: allowed.allowAny || allowed.allowedKeys.has(key)
	};
}
function resolveAllowedModelRef(params) {
	const trimmed = params.raw.trim();
	if (!trimmed) return { error: "invalid model: empty" };
	const aliasIndex = buildModelAliasIndex({
		cfg: params.cfg,
		defaultProvider: params.defaultProvider
	});
	const resolved = resolveModelRefFromString({
		raw: trimmed,
		defaultProvider: !trimmed.includes("/") ? inferUniqueProviderFromConfiguredModels({
			cfg: params.cfg,
			model: trimmed
		}) ?? params.defaultProvider : params.defaultProvider,
		aliasIndex
	});
	if (!resolved) return { error: `invalid model: ${trimmed}` };
	const status = getModelRefStatus({
		cfg: params.cfg,
		catalog: params.catalog,
		ref: resolved.ref,
		defaultProvider: params.defaultProvider,
		defaultModel: params.defaultModel
	});
	if (!status.allowed) return { error: `model not allowed: ${status.key}` };
	return {
		ref: resolved.ref,
		key: status.key
	};
}
/** Default reasoning level when session/directive do not set it: "on" if model supports reasoning, else "off". */
function resolveReasoningDefault(params) {
	const key = modelKey(params.provider, params.model);
	return (params.catalog?.find((entry) => entry.provider === params.provider && entry.id === params.model || entry.provider === key && entry.id === params.model))?.reasoning === true ? "on" : "off";
}
/**
* Resolve the model configured for Gmail hook processing.
* Returns null if hooks.gmail.model is not set.
*/
function resolveHooksGmailModel(params) {
	const hooksModel = params.cfg.hooks?.gmail?.model;
	if (!hooksModel?.trim()) return null;
	const aliasIndex = buildModelAliasIndex({
		cfg: params.cfg,
		defaultProvider: params.defaultProvider
	});
	return resolveModelRefFromString({
		raw: hooksModel,
		defaultProvider: params.defaultProvider,
		aliasIndex
	})?.ref ?? null;
}
/**
* Normalize a model selection value (string or `{primary?: string}`) to a
* plain trimmed string.  Returns `undefined` when the input is empty/missing.
* Shared by sessions-spawn and cron isolated-agent model resolution.
*/
function normalizeModelSelection(value) {
	if (typeof value === "string") return value.trim() || void 0;
	if (!value || typeof value !== "object") return;
	const primary = value.primary;
	if (typeof primary === "string" && primary.trim()) return primary.trim();
}
//#endregion
export { resolvePersistedSelectedModelRef as _, getModelRefStatus as a, resolveSubagentSpawnModelSelection as b, normalizeStoredOverrideModel as c, resolveConfiguredModelRef as d, resolveDefaultModelForAgent as f, resolvePersistedOverrideModelRef as g, resolvePersistedModelRef as h, buildModelAliasIndex as i, resolveAllowedModelRef as l, resolveModelRefFromString as m, buildConfiguredAllowlistKeys as n, inferUniqueProviderFromConfiguredModels as o, resolveHooksGmailModel as p, buildConfiguredModelCatalog as r, normalizeModelSelection as s, buildAllowedModelSet as t, resolveAllowlistModelKey as u, resolveReasoningDefault as v, resolveThinkingDefault as x, resolveSubagentConfiguredModelSelection as y };
