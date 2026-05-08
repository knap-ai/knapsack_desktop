import { a as normalizeLowercaseStringOrEmpty, c as normalizeOptionalString } from "./string-coerce-Bje8XVt9.js";
import { r as stripAnsi, t as sanitizeForLog } from "./ansi-Dqm1lzVL.js";
import { t as createSubsystemLogger } from "./subsystem-rHhUC6qs.js";
import { n as findNormalizedProviderValue, r as normalizeProviderId } from "./provider-id-DRW5WMbW.js";
import { r as DEFAULT_PROVIDER } from "./defaults-CRz26M83.js";
import { n as resolveAgentModelPrimaryValue } from "./model-input-Bac2nsYA.js";
import { t as splitTrailingAuthProfile } from "./model-ref-profile-x0tBJulg.js";
import { n as normalizeStaticProviderModelId, t as modelKey$1 } from "./model-ref-shared-1nQh-2FS.js";
import { createRequire } from "node:module";
//#region src/agents/provider-model-normalization.runtime.ts
const require = createRequire(import.meta.url);
const PROVIDER_RUNTIME_CANDIDATES = ["../plugins/provider-runtime.js", "../plugins/provider-runtime.ts"];
let providerRuntimeModule;
function loadProviderRuntime() {
	if (providerRuntimeModule) return providerRuntimeModule;
	for (const candidate of PROVIDER_RUNTIME_CANDIDATES) try {
		providerRuntimeModule = require(candidate);
		return providerRuntimeModule;
	} catch {}
	return null;
}
function normalizeProviderModelIdWithRuntime(params) {
	return loadProviderRuntime()?.normalizeProviderModelIdWithPlugin(params);
}
//#endregion
//#region src/agents/model-selection-normalize.ts
function modelKey(provider, model) {
	return modelKey$1(provider, model);
}
function legacyModelKey(provider, model) {
	const providerId = provider.trim();
	const modelId = model.trim();
	if (!providerId || !modelId) return null;
	const rawKey = `${providerId}/${modelId}`;
	return rawKey === modelKey(providerId, modelId) ? null : rawKey;
}
function normalizeProviderModelId(provider, model, options) {
	const staticModelId = normalizeStaticProviderModelId(provider, model);
	if (options?.allowPluginNormalization === false) return staticModelId;
	return normalizeProviderModelIdWithRuntime({
		provider,
		context: {
			provider,
			modelId: staticModelId
		}
	}) ?? staticModelId;
}
function normalizeModelRef(provider, model, options) {
	const normalizedProvider = normalizeProviderId(provider);
	return {
		provider: normalizedProvider,
		model: normalizeProviderModelId(normalizedProvider, model.trim(), options)
	};
}
const OPENROUTER_AUTO_COMPAT_ALIAS = "openrouter:auto";
function parseModelRef(raw, defaultProvider, options) {
	const trimmed = raw.trim();
	if (!trimmed) return null;
	if (normalizeLowercaseStringOrEmpty(trimmed) === OPENROUTER_AUTO_COMPAT_ALIAS) return normalizeModelRef("openrouter", "auto", options);
	const slash = trimmed.indexOf("/");
	if (slash === -1) return normalizeModelRef(defaultProvider, trimmed, options);
	const providerRaw = trimmed.slice(0, slash).trim();
	const model = trimmed.slice(slash + 1).trim();
	if (!providerRaw || !model) return null;
	return normalizeModelRef(providerRaw, model, options);
}
//#endregion
//#region src/agents/configured-provider-fallback.ts
function resolveConfiguredProviderFallback(params) {
	const configuredProviders = params.cfg.models?.providers;
	if (!configuredProviders || typeof configuredProviders !== "object") return null;
	const defaultProviderConfig = configuredProviders[params.defaultProvider];
	const defaultModel = params.defaultModel?.trim();
	const defaultProviderHasDefaultModel = !!defaultProviderConfig && !!defaultModel && Array.isArray(defaultProviderConfig.models) && defaultProviderConfig.models.some((model) => model?.id === defaultModel);
	if (defaultProviderConfig && (!defaultModel || defaultProviderHasDefaultModel)) return null;
	const availableProvider = Object.entries(configuredProviders).find(([, providerCfg]) => providerCfg && Array.isArray(providerCfg.models) && providerCfg.models.length > 0 && providerCfg.models[0]?.id);
	if (!availableProvider) return null;
	const [provider, providerCfg] = availableProvider;
	return {
		provider,
		model: providerCfg.models[0].id
	};
}
//#endregion
//#region src/agents/model-selection-shared.ts
let log = null;
function getLog() {
	log ??= createSubsystemLogger("model-selection");
	return log;
}
const OPENROUTER_COMPAT_FREE_ALIAS = "openrouter:free";
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
function inferUniqueProviderFromCatalog(params) {
	const model = params.model.trim();
	if (!model) return;
	const normalized = normalizeLowercaseStringOrEmpty(model);
	const providers = /* @__PURE__ */ new Set();
	for (const entry of params.catalog) {
		const entryId = entry.id.trim();
		if (!entryId) continue;
		if (entryId !== model && normalizeLowercaseStringOrEmpty(entryId) !== normalized) continue;
		const provider = normalizeProviderId(entry.provider);
		if (provider) providers.add(provider);
		if (providers.size > 1) return;
	}
	return providers.size === 1 ? providers.values().next().value : void 0;
}
function resolveBareModelDefaultProvider(params) {
	return inferUniqueProviderFromConfiguredModels({
		cfg: params.cfg,
		model: params.model
	}) ?? inferUniqueProviderFromCatalog({
		catalog: params.catalog,
		model: params.model
	}) ?? params.defaultProvider;
}
function isConcreteOpenRouterFreeModelRef(ref) {
	return ref.provider === "openrouter" && ref.model.includes("/") && ref.model.endsWith(":free");
}
function resolveConfiguredOpenRouterCompatFreeRef(params) {
	const configuredModels = params.cfg.agents?.defaults?.models ?? {};
	for (const raw of Object.keys(configuredModels)) {
		if (!raw.includes("/")) continue;
		const parsed = parseModelRef(raw, params.defaultProvider, { allowPluginNormalization: params.allowPluginNormalization });
		if (parsed && isConcreteOpenRouterFreeModelRef(parsed)) return parsed;
	}
	const openrouterProviderConfig = findNormalizedProviderValue(params.cfg.models?.providers, "openrouter");
	for (const entry of openrouterProviderConfig?.models ?? []) {
		const modelId = entry?.id?.trim();
		if (!modelId || !modelId.includes("/") || !modelId.endsWith(":free")) continue;
		return normalizeModelRef("openrouter", modelId, { allowPluginNormalization: params.allowPluginNormalization });
	}
	return null;
}
function resolveConfiguredOpenRouterCompatAlias(params) {
	const normalized = normalizeLowercaseStringOrEmpty(params.raw);
	if (normalized === "openrouter:auto") return normalizeModelRef("openrouter", "auto", { allowPluginNormalization: params.allowPluginNormalization });
	if (normalized !== OPENROUTER_COMPAT_FREE_ALIAS || !params.cfg) return null;
	return resolveConfiguredOpenRouterCompatFreeRef({
		cfg: params.cfg,
		defaultProvider: params.defaultProvider,
		allowPluginNormalization: params.allowPluginNormalization
	});
}
function parseModelRefWithCompatAlias(params) {
	return resolveConfiguredOpenRouterCompatAlias(params) ?? resolveExactConfiguredProviderRef(params) ?? parseModelRef(params.raw, params.defaultProvider, { allowPluginNormalization: params.allowPluginNormalization });
}
function resolveExactConfiguredProviderRef(params) {
	const slash = params.raw.indexOf("/");
	if (slash <= 0 || !params.cfg?.models?.providers) return null;
	const providerRaw = params.raw.slice(0, slash).trim();
	const modelRaw = params.raw.slice(slash + 1).trim();
	if (!providerRaw || !modelRaw) return null;
	const providerKey = normalizeLowercaseStringOrEmpty(providerRaw);
	const exactConfigured = Object.entries(params.cfg.models.providers).find(([key]) => normalizeLowercaseStringOrEmpty(key) === providerKey);
	if (!exactConfigured) return null;
	const [configuredProvider, providerConfig] = exactConfigured;
	const normalizedConfiguredProvider = normalizeProviderId(configuredProvider);
	const apiOwner = typeof providerConfig?.api === "string" ? normalizeProviderId(providerConfig.api) : "";
	if (!apiOwner || apiOwner === normalizedConfiguredProvider) return null;
	const provider = normalizeLowercaseStringOrEmpty(configuredProvider);
	return {
		provider,
		model: normalizeStaticProviderModelId(provider, modelRaw.trim())
	};
}
function resolveAllowlistModelKey(params) {
	const parsed = parseModelRefWithCompatAlias({
		cfg: params.cfg,
		raw: params.raw,
		defaultProvider: params.defaultProvider
	});
	if (!parsed) return null;
	return modelKey(parsed.provider, parsed.model);
}
function buildConfiguredAllowlistKeys(params) {
	const rawAllowlist = Object.keys(params.cfg?.agents?.defaults?.models ?? {});
	if (rawAllowlist.length === 0) return null;
	const keys = /* @__PURE__ */ new Set();
	for (const raw of rawAllowlist) {
		const key = resolveAllowlistModelKey({
			cfg: params.cfg,
			raw,
			defaultProvider: params.defaultProvider
		});
		if (key) keys.add(key);
	}
	return keys.size > 0 ? keys : null;
}
function buildModelAliasIndex(params) {
	const byAlias = /* @__PURE__ */ new Map();
	const byKey = /* @__PURE__ */ new Map();
	const rawModels = params.cfg.agents?.defaults?.models ?? {};
	for (const [keyRaw, entryRaw] of Object.entries(rawModels)) {
		const parsed = parseModelRefWithCompatAlias({
			cfg: params.cfg,
			raw: keyRaw,
			defaultProvider: params.defaultProvider,
			allowPluginNormalization: params.allowPluginNormalization
		});
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
		const key = resolveAllowlistModelKey({
			cfg: params.cfg,
			raw: rawKey,
			defaultProvider: params.defaultProvider
		});
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
	const parsed = parseModelRefWithCompatAlias({
		cfg: params.cfg,
		raw: model,
		defaultProvider: params.defaultProvider,
		allowPluginNormalization: params.allowPluginNormalization
	});
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
			const openrouterCompatRef = resolveConfiguredOpenRouterCompatAlias({
				cfg: params.cfg,
				raw: trimmed,
				defaultProvider: params.defaultProvider,
				allowPluginNormalization: params.allowPluginNormalization
			});
			if (openrouterCompatRef) return openrouterCompatRef;
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
			cfg: params.cfg,
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
function buildAllowedModelSetWithFallbacks(params) {
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
	const defaultRef = defaultModel && params.defaultProvider ? parseModelRefWithCompatAlias({
		cfg: params.cfg,
		raw: defaultModel,
		defaultProvider: params.defaultProvider
	}) : null;
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
	const addAllowedModelRef = (raw) => {
		const trimmed = raw.trim();
		const defaultProvider = !trimmed.includes("/") ? resolveBareModelDefaultProvider({
			cfg: params.cfg,
			catalog,
			model: trimmed,
			defaultProvider: params.defaultProvider
		}) : params.defaultProvider;
		const parsed = parseModelRefWithCompatAlias({
			cfg: params.cfg,
			raw,
			defaultProvider
		});
		if (!parsed) return;
		const key = modelKey(parsed.provider, parsed.model);
		allowedKeys.add(key);
		if (!catalogKeys.has(key) && !syntheticCatalogEntries.has(key)) syntheticCatalogEntries.set(key, buildSyntheticAllowedCatalogEntry({
			parsed,
			metadata
		}));
	};
	for (const raw of rawAllowlist) addAllowedModelRef(raw);
	for (const fallback of params.fallbackModels) addAllowedModelRef(fallback);
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
function getModelRefStatusFromAllowedSet(params) {
	const key = modelKey(params.ref.provider, params.ref.model);
	return {
		key,
		inCatalog: params.catalog.some((entry) => modelKey(entry.provider, entry.id) === key),
		allowAny: params.allowed.allowAny,
		allowed: params.allowed.allowAny || params.allowed.allowedKeys.has(key)
	};
}
function getModelRefStatusWithFallbackModels(params) {
	const allowed = buildAllowedModelSetWithFallbacks({
		cfg: params.cfg,
		catalog: params.catalog,
		defaultProvider: params.defaultProvider,
		defaultModel: params.defaultModel,
		fallbackModels: params.fallbackModels
	});
	return getModelRefStatusFromAllowedSet({
		catalog: params.catalog,
		ref: params.ref,
		allowed
	});
}
function resolveAllowedModelRefFromAliasIndex(params) {
	const trimmed = params.raw.trim();
	if (!trimmed) return { error: "invalid model: empty" };
	const effectiveDefaultProvider = !trimmed.includes("/") ? inferUniqueProviderFromConfiguredModels({
		cfg: params.cfg,
		model: trimmed
	}) ?? params.defaultProvider : params.defaultProvider;
	const resolved = resolveModelRefFromString({
		cfg: params.cfg,
		raw: trimmed,
		defaultProvider: effectiveDefaultProvider,
		aliasIndex: params.aliasIndex
	});
	if (!resolved) return { error: `invalid model: ${trimmed}` };
	const status = params.getStatus(resolved.ref);
	if (!status.allowed) return { error: `model not allowed: ${status.key}` };
	return {
		ref: resolved.ref,
		key: status.key
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
function resolveHooksGmailModel(params) {
	const hooksModel = params.cfg.hooks?.gmail?.model;
	if (!hooksModel?.trim()) return null;
	const aliasIndex = buildModelAliasIndex({
		cfg: params.cfg,
		defaultProvider: params.defaultProvider
	});
	return resolveModelRefFromString({
		cfg: params.cfg,
		raw: hooksModel,
		defaultProvider: params.defaultProvider,
		aliasIndex
	})?.ref ?? null;
}
function normalizeModelSelection(value) {
	if (typeof value === "string") return value.trim() || void 0;
	if (!value || typeof value !== "object") return;
	const primary = value.primary;
	if (typeof primary === "string" && primary.trim()) return primary.trim();
}
//#endregion
export { legacyModelKey as _, getModelRefStatusWithFallbackModels as a, parseModelRef as b, normalizeModelSelection as c, resolveBareModelDefaultProvider as d, resolveConfiguredModelRef as f, resolveConfiguredProviderFallback as g, resolveModelRefFromString as h, buildModelAliasIndex as i, resolveAllowedModelRefFromAliasIndex as l, resolveHooksGmailModel as m, buildConfiguredAllowlistKeys as n, inferUniqueProviderFromCatalog as o, resolveConfiguredOpenRouterCompatAlias as p, buildConfiguredModelCatalog as r, inferUniqueProviderFromConfiguredModels as s, buildAllowedModelSetWithFallbacks as t, resolveAllowlistModelKey as u, modelKey as v, normalizeModelRef as y };
