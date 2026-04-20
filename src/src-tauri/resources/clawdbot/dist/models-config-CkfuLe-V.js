import { i as formatErrorMessage } from "./errors-D8p6rxH8.js";
import { s as normalizeOptionalString } from "./string-coerce-BUSzWgUA.js";
import { l as isRecord } from "./utils-D5DtWkEu.js";
import { t as createSubsystemLogger } from "./subsystem-Cgmckbux.js";
import { i as createConfigRuntimeEnv } from "./state-dir-dotenv-Ch7ZMbTt.js";
import { d as resolveSecretInputRef } from "./types.secrets-CeL3gSMO.js";
import { R as MODEL_APIS } from "./zod-schema.core-CYrn8zgQ.js";
import "./public-surface-runtime-nilbjlrn.js";
import "./bundled-plugin-metadata-Da-MNAHv.js";
import { a as loadConfig, s as projectConfigOntoRuntimeSourceSnapshot } from "./io-5pxHCi7V.js";
import { n as findNormalizedProviderValue, r as normalizeProviderId } from "./provider-id-KaStHhRz.js";
import { a as getRuntimeConfigSourceSnapshot } from "./runtime-snapshot-BwqEmc6G.js";
import "./config-Q9XZc_2I.js";
import { n as ensureAuthProfileStore } from "./store-C1I9Mkh8.js";
import { u as resolveOwningPluginIdsForProvider } from "./plugin-auto-enable-BbVfCcz-.js";
import { O as resolveProviderConfigApiKeyWithPlugin, h as normalizeProviderConfigWithPlugin, r as applyProviderNativeStreamingUsageCompatWithPlugin } from "./provider-runtime-khVgWetm.js";
import { t as resolveOpenClawAgentDir } from "./agent-paths-JWlHCT48.js";
import { h as resolveNonEnvSecretRefHeaderValueMarker, m as resolveNonEnvSecretRefApiKeyMarker, p as resolveEnvSecretRefHeaderValueMarker, u as isNonSecretApiKeyMarker } from "./model-auth-markers-ve-OgG6R.js";
import "./model-selection-CTdyYoio.js";
import { a as normalizeHeaderValues, c as resolveMissingProviderApiKey, i as normalizeConfiguredProviderApiKey, n as createProviderAuthResolver, o as normalizeResolvedEnvApiKey, s as resolveApiKeyFromProfiles, t as createProviderApiKeyResolver } from "./models-config.providers.secrets-ClAqHxSG.js";
import "./facade-loader-CGu7k8Om.js";
import "node:url";
import path from "node:path";
import fs from "node:fs/promises";
//#region src/agents/models-config-state.ts
const MODELS_JSON_STATE_KEY = Symbol.for("openclaw.modelsJsonState");
const MODELS_JSON_STATE = (() => {
	const globalState = globalThis;
	if (!globalState[MODELS_JSON_STATE_KEY]) globalState[MODELS_JSON_STATE_KEY] = {
		writeLocks: /* @__PURE__ */ new Map(),
		readyCache: /* @__PURE__ */ new Map()
	};
	return globalState[MODELS_JSON_STATE_KEY];
})();
//#endregion
//#region src/agents/models-config.merge.ts
function isPositiveFiniteTokenLimit(value) {
	return typeof value === "number" && Number.isFinite(value) && value > 0;
}
function resolvePreferredTokenLimit(params) {
	if (params.explicitPresent && isPositiveFiniteTokenLimit(params.explicitValue)) return params.explicitValue;
	if (isPositiveFiniteTokenLimit(params.implicitValue)) return params.implicitValue;
	return isPositiveFiniteTokenLimit(params.explicitValue) ? params.explicitValue : void 0;
}
function getProviderModelId(model) {
	if (!model || typeof model !== "object") return "";
	const id = model.id;
	return normalizeOptionalString(id) ?? "";
}
function mergeProviderModels(implicit, explicit) {
	const implicitModels = Array.isArray(implicit.models) ? implicit.models : [];
	const explicitModels = Array.isArray(explicit.models) ? explicit.models : [];
	const implicitHeaders = implicit.headers && typeof implicit.headers === "object" && !Array.isArray(implicit.headers) ? implicit.headers : void 0;
	const explicitHeaders = explicit.headers && typeof explicit.headers === "object" && !Array.isArray(explicit.headers) ? explicit.headers : void 0;
	if (implicitModels.length === 0) return {
		...implicit,
		...explicit,
		...implicitHeaders || explicitHeaders ? { headers: {
			...implicitHeaders,
			...explicitHeaders
		} } : {}
	};
	const implicitById = new Map(implicitModels.map((model) => [getProviderModelId(model), model]).filter(([id]) => Boolean(id)));
	const seen = /* @__PURE__ */ new Set();
	const mergedModels = explicitModels.map((explicitModel) => {
		const id = getProviderModelId(explicitModel);
		if (!id) return explicitModel;
		seen.add(id);
		const implicitModel = implicitById.get(id);
		if (!implicitModel) return explicitModel;
		const contextWindow = resolvePreferredTokenLimit({
			explicitPresent: "contextWindow" in explicitModel,
			explicitValue: explicitModel.contextWindow,
			implicitValue: implicitModel.contextWindow
		});
		const contextTokens = resolvePreferredTokenLimit({
			explicitPresent: "contextTokens" in explicitModel,
			explicitValue: explicitModel.contextTokens,
			implicitValue: implicitModel.contextTokens
		});
		const maxTokens = resolvePreferredTokenLimit({
			explicitPresent: "maxTokens" in explicitModel,
			explicitValue: explicitModel.maxTokens,
			implicitValue: implicitModel.maxTokens
		});
		return {
			...explicitModel,
			input: implicitModel.input,
			reasoning: "reasoning" in explicitModel ? explicitModel.reasoning : implicitModel.reasoning,
			...contextWindow === void 0 ? {} : { contextWindow },
			...contextTokens === void 0 ? {} : { contextTokens },
			...maxTokens === void 0 ? {} : { maxTokens }
		};
	});
	for (const implicitModel of implicitModels) {
		const id = getProviderModelId(implicitModel);
		if (!id || seen.has(id)) continue;
		seen.add(id);
		mergedModels.push(implicitModel);
	}
	return {
		...implicit,
		...explicit,
		...implicitHeaders || explicitHeaders ? { headers: {
			...implicitHeaders,
			...explicitHeaders
		} } : {},
		models: mergedModels
	};
}
function mergeProviders(params) {
	const out = params.implicit ? { ...params.implicit } : {};
	for (const [key, explicit] of Object.entries(params.explicit ?? {})) {
		const providerKey = normalizeOptionalString(key) ?? "";
		if (!providerKey) continue;
		const implicit = out[providerKey];
		out[providerKey] = implicit ? mergeProviderModels(implicit, explicit) : explicit;
	}
	return out;
}
function resolveProviderApi(entry) {
	return normalizeOptionalString(entry?.api);
}
function resolveModelApiSurface(entry) {
	if (!Array.isArray(entry?.models)) return;
	const apis = entry.models.flatMap((model) => {
		if (!model || typeof model !== "object") return [];
		const api = model.api;
		const normalized = normalizeOptionalString(api);
		return normalized ? [normalized] : [];
	}).toSorted();
	return apis.length > 0 ? JSON.stringify(apis) : void 0;
}
function resolveProviderApiSurface(entry) {
	return resolveProviderApi(entry) ?? resolveModelApiSurface(entry);
}
function shouldPreserveExistingApiKey(params) {
	const { providerKey, existing, nextEntry, secretRefManagedProviders } = params;
	const nextApiKey = typeof nextEntry.apiKey === "string" ? nextEntry.apiKey : "";
	if (nextApiKey && isNonSecretApiKeyMarker(nextApiKey)) return false;
	return !secretRefManagedProviders.has(providerKey) && typeof existing.apiKey === "string" && existing.apiKey.length > 0 && !isNonSecretApiKeyMarker(existing.apiKey, { includeEnvVarName: false });
}
function shouldPreserveExistingBaseUrl(params) {
	const { providerKey, existing, nextEntry, explicitBaseUrlProviders } = params;
	if (explicitBaseUrlProviders.has(providerKey) || typeof existing.baseUrl !== "string" || existing.baseUrl.length === 0) return false;
	const existingApi = resolveProviderApiSurface(existing);
	const nextApi = resolveProviderApiSurface(nextEntry);
	return !existingApi || !nextApi || existingApi === nextApi;
}
function mergeWithExistingProviderSecrets(params) {
	const { nextProviders, existingProviders, secretRefManagedProviders, explicitBaseUrlProviders } = params;
	const mergedProviders = {};
	for (const [key, entry] of Object.entries(existingProviders)) mergedProviders[key] = entry;
	for (const [key, newEntry] of Object.entries(nextProviders)) {
		const existing = existingProviders[key];
		if (!existing) {
			mergedProviders[key] = newEntry;
			continue;
		}
		const preserved = {};
		if (shouldPreserveExistingApiKey({
			providerKey: key,
			existing,
			nextEntry: newEntry,
			secretRefManagedProviders
		})) preserved.apiKey = existing.apiKey;
		if (shouldPreserveExistingBaseUrl({
			providerKey: key,
			existing,
			nextEntry: newEntry,
			explicitBaseUrlProviders
		})) preserved.baseUrl = existing.baseUrl;
		mergedProviders[key] = {
			...newEntry,
			...preserved
		};
	}
	return mergedProviders;
}
path.resolve(import.meta.dirname, "../..");
//#endregion
//#region src/plugins/provider-discovery.ts
const DISCOVERY_ORDER = [
	"simple",
	"profile",
	"paired",
	"late"
];
let providerRuntimePromise;
function loadProviderRuntime() {
	providerRuntimePromise ??= import("./plugins/provider-discovery.runtime.js");
	return providerRuntimePromise;
}
function resolveProviderCatalogHook(provider) {
	return provider.catalog ?? provider.discovery;
}
async function resolvePluginDiscoveryProviders(params) {
	return (await loadProviderRuntime()).resolvePluginDiscoveryProvidersRuntime(params).filter((provider) => resolveProviderCatalogHook(provider));
}
function groupPluginDiscoveryProvidersByOrder(providers) {
	const grouped = {
		simple: [],
		profile: [],
		paired: [],
		late: []
	};
	for (const provider of providers) grouped[resolveProviderCatalogHook(provider)?.order ?? "late"].push(provider);
	for (const order of DISCOVERY_ORDER) grouped[order].sort((a, b) => a.label.localeCompare(b.label));
	return grouped;
}
function normalizePluginDiscoveryResult(params) {
	const result = params.result;
	if (!result) return {};
	if ("provider" in result) {
		const normalized = {};
		for (const providerId of [
			params.provider.id,
			...params.provider.aliases ?? [],
			...params.provider.hookAliases ?? []
		]) {
			const normalizedKey = normalizeProviderId(providerId);
			if (!normalizedKey) continue;
			normalized[normalizedKey] = result.provider;
		}
		return normalized;
	}
	const normalized = {};
	for (const [key, value] of Object.entries(result.providers)) {
		const normalizedKey = normalizeProviderId(key);
		if (!normalizedKey || !value) continue;
		normalized[normalizedKey] = value;
	}
	return normalized;
}
function runProviderCatalog(params) {
	return resolveProviderCatalogHook(params.provider)?.run({
		config: params.config,
		agentDir: params.agentDir,
		workspaceDir: params.workspaceDir,
		env: params.env,
		resolveProviderApiKey: params.resolveProviderApiKey,
		resolveProviderAuth: params.resolveProviderAuth
	});
}
//#endregion
//#region src/agents/models-config.providers.implicit.ts
const log = createSubsystemLogger("agents/model-providers");
const PROVIDER_IMPLICIT_MERGERS = { ollama: ({ implicit }) => implicit };
const PLUGIN_DISCOVERY_ORDERS = [
	"simple",
	"profile",
	"paired",
	"late"
];
function resolveLiveProviderCatalogTimeoutMs(env) {
	if (!(env.OPENCLAW_LIVE_TEST === "1" || env.OPENCLAW_LIVE_GATEWAY === "1" || env.LIVE === "1")) return null;
	const raw = env.OPENCLAW_LIVE_PROVIDER_DISCOVERY_TIMEOUT_MS?.trim();
	if (!raw) return 15e3;
	const parsed = Number.parseInt(raw, 10);
	return Number.isFinite(parsed) && parsed > 0 ? parsed : 15e3;
}
function resolveProviderDiscoveryFilter(params) {
	const { config, workspaceDir, env } = params;
	const testRaw = env.OPENCLAW_TEST_ONLY_PROVIDER_PLUGIN_IDS?.trim();
	if (testRaw) {
		const ids = testRaw.split(",").map((value) => value.trim()).filter(Boolean);
		return ids.length > 0 ? [...new Set(ids)] : void 0;
	}
	if (!(env.OPENCLAW_LIVE_TEST === "1" || env.OPENCLAW_LIVE_GATEWAY === "1" || env.LIVE === "1")) return;
	const rawValues = [env.OPENCLAW_LIVE_PROVIDERS?.trim(), env.OPENCLAW_LIVE_GATEWAY_PROVIDERS?.trim()].filter((value) => Boolean(value && value !== "all"));
	if (rawValues.length === 0) return;
	const ids = rawValues.flatMap((value) => value.split(",")).map((value) => value.trim()).filter(Boolean);
	if (ids.length === 0) return;
	const pluginIds = /* @__PURE__ */ new Set();
	for (const id of ids) {
		const owners = resolveOwningPluginIdsForProvider({
			provider: id,
			config,
			workspaceDir,
			env
		}) ?? [];
		if (owners.length > 0) {
			for (const owner of owners) pluginIds.add(owner);
			continue;
		}
		pluginIds.add(id);
	}
	return pluginIds.size > 0 ? [...pluginIds].toSorted((left, right) => left.localeCompare(right)) : void 0;
}
function mergeImplicitProviderSet(target, additions) {
	if (!additions) return;
	for (const [key, value] of Object.entries(additions)) target[key] = value;
}
function mergeImplicitProviderConfig(params) {
	const { providerId, existing, implicit } = params;
	if (!existing) return implicit;
	const merge = PROVIDER_IMPLICIT_MERGERS[providerId];
	if (merge) return merge({
		existing,
		implicit
	});
	return {
		...implicit,
		...existing,
		models: Array.isArray(existing.models) && existing.models.length > 0 ? existing.models : implicit.models
	};
}
function resolveConfiguredImplicitProvider(params) {
	for (const providerId of params.providerIds) {
		const configured = findNormalizedProviderValue(params.configuredProviders ?? void 0, providerId);
		if (configured) return configured;
	}
}
function resolveExistingImplicitProviderFromContext(params) {
	return resolveConfiguredImplicitProvider({
		configuredProviders: params.ctx.explicitProviders,
		providerIds: params.providerIds
	}) ?? resolveConfiguredImplicitProvider({
		configuredProviders: params.ctx.config?.models?.providers,
		providerIds: params.providerIds
	});
}
async function resolvePluginImplicitProviders(ctx, providers, order) {
	const byOrder = groupPluginDiscoveryProvidersByOrder(providers);
	const discovered = {};
	const catalogConfig = buildPluginCatalogConfig(ctx);
	for (const provider of byOrder[order]) {
		const resolveCatalogProviderApiKey = (providerId) => {
			const resolvedProviderId = providerId?.trim() || provider.id;
			const resolved = ctx.resolveProviderApiKey(resolvedProviderId);
			if (resolved.apiKey) return resolved;
			if (!findNormalizedProviderValue({
				[provider.id]: true,
				...Object.fromEntries((provider.aliases ?? []).map((alias) => [alias, true])),
				...Object.fromEntries((provider.hookAliases ?? []).map((alias) => [alias, true]))
			}, resolvedProviderId)) return resolved;
			const syntheticApiKey = (provider.resolveSyntheticAuth?.({
				config: catalogConfig,
				provider: resolvedProviderId,
				providerConfig: catalogConfig.models?.providers?.[resolvedProviderId]
			}))?.apiKey?.trim();
			if (!syntheticApiKey) return resolved;
			return {
				apiKey: isNonSecretApiKeyMarker(syntheticApiKey) ? syntheticApiKey : resolveNonEnvSecretRefApiKeyMarker("file"),
				discoveryApiKey: void 0
			};
		};
		const result = await runProviderCatalogWithTimeout({
			provider,
			config: catalogConfig,
			agentDir: ctx.agentDir,
			workspaceDir: ctx.workspaceDir,
			env: ctx.env,
			resolveProviderApiKey: resolveCatalogProviderApiKey,
			resolveProviderAuth: (providerId, options) => ctx.resolveProviderAuth(providerId?.trim() || provider.id, options),
			timeoutMs: resolveLiveProviderCatalogTimeoutMs(ctx.env)
		});
		if (!result) continue;
		const normalizedResult = normalizePluginDiscoveryResult({
			provider,
			result
		});
		for (const [providerId, implicitProvider] of Object.entries(normalizedResult)) discovered[providerId] = mergeImplicitProviderConfig({
			providerId,
			existing: discovered[providerId] ?? resolveExistingImplicitProviderFromContext({
				ctx,
				providerIds: [
					providerId,
					provider.id,
					...provider.aliases ?? [],
					...provider.hookAliases ?? []
				]
			}),
			implicit: implicitProvider
		});
	}
	return Object.keys(discovered).length > 0 ? discovered : void 0;
}
function buildPluginCatalogConfig(ctx) {
	if (!ctx.explicitProviders || Object.keys(ctx.explicitProviders).length === 0) return ctx.config ?? {};
	return {
		...ctx.config,
		models: {
			...ctx.config?.models,
			providers: {
				...ctx.config?.models?.providers,
				...ctx.explicitProviders
			}
		}
	};
}
async function runProviderCatalogWithTimeout(params) {
	const catalogRun = runProviderCatalog(params);
	const timeoutMs = params.timeoutMs ?? void 0;
	if (!timeoutMs) return await catalogRun;
	let timer;
	try {
		return await Promise.race([catalogRun, new Promise((_, reject) => {
			timer = setTimeout(() => {
				reject(/* @__PURE__ */ new Error(`provider catalog timed out after ${timeoutMs}ms: ${params.provider.id}`));
			}, timeoutMs);
			timer.unref?.();
		})]);
	} catch (error) {
		const message = formatErrorMessage(error);
		if (message.includes("provider catalog timed out after")) {
			log.warn(`${message}; skipping provider discovery`);
			return;
		}
		throw error;
	} finally {
		if (timer) clearTimeout(timer);
	}
}
async function resolveImplicitProviders(params) {
	const providers = {};
	const env = params.env ?? process.env;
	let authStore;
	const getAuthStore = () => authStore ??= ensureAuthProfileStore(params.agentDir, { allowKeychainPrompt: false });
	const context = {
		...params,
		get authStore() {
			return getAuthStore();
		},
		env,
		resolveProviderApiKey: createProviderApiKeyResolver(env, getAuthStore, params.config),
		resolveProviderAuth: createProviderAuthResolver(env, getAuthStore, params.config)
	};
	const discoveryProviders = await resolvePluginDiscoveryProviders({
		config: params.config,
		workspaceDir: params.workspaceDir,
		env,
		onlyPluginIds: resolveProviderDiscoveryFilter({
			config: params.config,
			workspaceDir: params.workspaceDir,
			env
		})
	});
	for (const order of PLUGIN_DISCOVERY_ORDERS) mergeImplicitProviderSet(providers, await resolvePluginImplicitProviders(context, discoveryProviders, order));
	return providers;
}
//#endregion
//#region src/agents/models-config.providers.policy.lookup.ts
const GENERIC_PROVIDER_APIS = new Set([
	"openai-completions",
	"openai-responses",
	"anthropic-messages",
	"google-generative-ai"
]);
function resolveProviderPluginLookupKey(providerKey, provider) {
	const api = normalizeOptionalString(provider?.api) ?? "";
	if (providerKey === "google-antigravity" || providerKey === "google-vertex" || api === "google-generative-ai") return "google";
	if (provider?.models?.some((model) => normalizeOptionalString(model.api) === "google-generative-ai")) return "google";
	if (api && MODEL_APIS.includes(api) && !GENERIC_PROVIDER_APIS.has(api)) return api;
	return providerKey;
}
//#endregion
//#region src/agents/models-config.providers.policy.runtime.ts
function applyProviderNativeStreamingUsagePolicy(providerKey, provider) {
	return applyProviderNativeStreamingUsageCompatWithPlugin({
		provider: resolveProviderPluginLookupKey(providerKey, provider),
		context: {
			provider: providerKey,
			providerConfig: provider
		}
	}) ?? provider;
}
function normalizeProviderConfigPolicy(providerKey, provider) {
	return normalizeProviderConfigWithPlugin({
		provider: resolveProviderPluginLookupKey(providerKey, provider),
		context: {
			provider: providerKey,
			providerConfig: provider
		}
	}) ?? provider;
}
function resolveProviderConfigApiKeyPolicy(providerKey, provider) {
	const runtimeProviderKey = resolveProviderPluginLookupKey(providerKey, provider).trim();
	return (env) => resolveProviderConfigApiKeyWithPlugin({
		provider: runtimeProviderKey,
		context: {
			provider: providerKey,
			env
		}
	});
}
//#endregion
//#region src/agents/models-config.providers.policy.ts
function applyNativeStreamingUsageCompat(providers) {
	let changed = false;
	const nextProviders = {};
	for (const [providerKey, provider] of Object.entries(providers)) {
		const nextProvider = applyProviderNativeStreamingUsagePolicy(providerKey, provider);
		nextProviders[providerKey] = nextProvider;
		changed ||= nextProvider !== provider;
	}
	return changed ? nextProviders : providers;
}
function normalizeProviderSpecificConfig(providerKey, provider) {
	const normalized = normalizeProviderConfigPolicy(providerKey, provider);
	if (normalized && normalized !== provider) return normalized;
	return provider;
}
function resolveProviderConfigApiKeyResolver(providerKey, provider) {
	return resolveProviderConfigApiKeyPolicy(providerKey, provider);
}
//#endregion
//#region src/agents/models-config.providers.source-managed.ts
function normalizeSourceProviderLookup(providers) {
	if (!providers) return {};
	const out = {};
	for (const [key, provider] of Object.entries(providers)) {
		const normalizedKey = key.trim();
		if (!normalizedKey || !isRecord(provider)) continue;
		out[normalizedKey] = provider;
	}
	return out;
}
function resolveSourceManagedApiKeyMarker(params) {
	const sourceApiKeyRef = resolveSecretInputRef({
		value: params.sourceProvider?.apiKey,
		defaults: params.sourceSecretDefaults
	}).ref;
	if (!sourceApiKeyRef || !sourceApiKeyRef.id.trim()) return;
	return sourceApiKeyRef.source === "env" ? sourceApiKeyRef.id.trim() : resolveNonEnvSecretRefApiKeyMarker(sourceApiKeyRef.source);
}
function resolveSourceManagedHeaderMarkers(params) {
	const sourceHeaders = isRecord(params.sourceProvider?.headers) ? params.sourceProvider.headers : void 0;
	if (!sourceHeaders) return {};
	const markers = {};
	for (const [headerName, headerValue] of Object.entries(sourceHeaders)) {
		const sourceHeaderRef = resolveSecretInputRef({
			value: headerValue,
			defaults: params.sourceSecretDefaults
		}).ref;
		if (!sourceHeaderRef || !sourceHeaderRef.id.trim()) continue;
		markers[headerName] = sourceHeaderRef.source === "env" ? resolveEnvSecretRefHeaderValueMarker(sourceHeaderRef.id) : resolveNonEnvSecretRefHeaderValueMarker(sourceHeaderRef.source);
	}
	return markers;
}
function enforceSourceManagedProviderSecrets(params) {
	const { providers } = params;
	if (!providers) return providers;
	const sourceProvidersByKey = normalizeSourceProviderLookup(params.sourceProviders);
	if (Object.keys(sourceProvidersByKey).length === 0) return providers;
	let nextProviders = null;
	for (const [providerKey, provider] of Object.entries(providers)) {
		if (!isRecord(provider)) continue;
		const sourceProvider = sourceProvidersByKey[providerKey.trim()];
		if (!sourceProvider) continue;
		let nextProvider = provider;
		let providerMutated = false;
		const sourceApiKeyMarker = resolveSourceManagedApiKeyMarker({
			sourceProvider,
			sourceSecretDefaults: params.sourceSecretDefaults
		});
		if (sourceApiKeyMarker) {
			params.secretRefManagedProviders?.add(providerKey.trim());
			if (nextProvider.apiKey !== sourceApiKeyMarker) {
				providerMutated = true;
				nextProvider = {
					...nextProvider,
					apiKey: sourceApiKeyMarker
				};
			}
		}
		const sourceHeaderMarkers = resolveSourceManagedHeaderMarkers({
			sourceProvider,
			sourceSecretDefaults: params.sourceSecretDefaults
		});
		if (Object.keys(sourceHeaderMarkers).length > 0) {
			const currentHeaders = isRecord(nextProvider.headers) ? nextProvider.headers : void 0;
			const nextHeaders = { ...currentHeaders };
			let headersMutated = !currentHeaders;
			for (const [headerName, marker] of Object.entries(sourceHeaderMarkers)) {
				if (nextHeaders[headerName] === marker) continue;
				headersMutated = true;
				nextHeaders[headerName] = marker;
			}
			if (headersMutated) {
				providerMutated = true;
				nextProvider = {
					...nextProvider,
					headers: nextHeaders
				};
			}
		}
		if (!providerMutated) continue;
		if (!nextProviders) nextProviders = { ...providers };
		nextProviders[providerKey] = nextProvider;
	}
	return nextProviders ?? providers;
}
//#endregion
//#region src/agents/models-config.providers.normalize.ts
function normalizeProviders(params) {
	const { providers } = params;
	if (!providers) return providers;
	const env = params.env ?? process.env;
	let authStore;
	const resolveProfileApiKey = (providerKey) => {
		authStore ??= ensureAuthProfileStore(params.agentDir, { allowKeychainPrompt: false });
		return resolveApiKeyFromProfiles({
			provider: providerKey,
			store: authStore,
			env
		});
	};
	let mutated = false;
	const next = {};
	for (const [key, provider] of Object.entries(providers)) {
		const normalizedKey = key.trim();
		if (!normalizedKey) {
			mutated = true;
			continue;
		}
		if (normalizedKey !== key) mutated = true;
		let normalizedProvider = provider;
		const normalizedHeaders = normalizeHeaderValues({
			headers: normalizedProvider.headers,
			secretDefaults: params.secretDefaults
		});
		if (normalizedHeaders.mutated) {
			mutated = true;
			normalizedProvider = {
				...normalizedProvider,
				headers: normalizedHeaders.headers
			};
		}
		const providerWithConfiguredApiKey = normalizeConfiguredProviderApiKey({
			providerKey: normalizedKey,
			provider: normalizedProvider,
			secretDefaults: params.secretDefaults,
			profileApiKey: void 0,
			secretRefManagedProviders: params.secretRefManagedProviders
		});
		if (providerWithConfiguredApiKey !== normalizedProvider) {
			mutated = true;
			normalizedProvider = providerWithConfiguredApiKey;
		}
		const providerWithResolvedEnvApiKey = normalizeResolvedEnvApiKey({
			providerKey: normalizedKey,
			provider: normalizedProvider,
			env,
			secretRefManagedProviders: params.secretRefManagedProviders
		});
		if (providerWithResolvedEnvApiKey !== normalizedProvider) {
			mutated = true;
			normalizedProvider = providerWithResolvedEnvApiKey;
		}
		const needsProfileApiKey = Array.isArray(normalizedProvider.models) && normalizedProvider.models.length > 0 && !(typeof normalizedProvider.apiKey === "string" && normalizedProvider.apiKey.trim() || normalizedProvider.apiKey);
		const profileApiKey = needsProfileApiKey ? resolveProfileApiKey(normalizedKey) : void 0;
		const providerApiKeyResolver = needsProfileApiKey ? resolveProviderConfigApiKeyResolver(normalizedKey) : void 0;
		const providerWithApiKey = resolveMissingProviderApiKey({
			providerKey: normalizedKey,
			provider: normalizedProvider,
			env,
			profileApiKey,
			secretRefManagedProviders: params.secretRefManagedProviders,
			providerApiKeyResolver
		});
		if (providerWithApiKey !== normalizedProvider) {
			mutated = true;
			normalizedProvider = providerWithApiKey;
		}
		const providerSpecificNormalized = normalizeProviderSpecificConfig(normalizedKey, normalizedProvider);
		if (providerSpecificNormalized !== normalizedProvider) {
			mutated = true;
			normalizedProvider = providerSpecificNormalized;
		}
		const existing = next[normalizedKey];
		if (existing) {
			mutated = true;
			next[normalizedKey] = {
				...existing,
				...normalizedProvider,
				models: normalizedProvider.models ?? existing.models
			};
			continue;
		}
		next[normalizedKey] = normalizedProvider;
	}
	return enforceSourceManagedProviderSecrets({
		providers: mutated ? next : providers,
		sourceProviders: params.sourceProviders,
		sourceSecretDefaults: params.sourceSecretDefaults,
		secretRefManagedProviders: params.secretRefManagedProviders
	});
}
//#endregion
//#region src/agents/models-config.plan.ts
async function resolveProvidersForModelsJsonWithDeps(params, deps) {
	const { cfg, agentDir, env } = params;
	const explicitProviders = cfg.models?.providers ?? {};
	return mergeProviders({
		implicit: await (deps?.resolveImplicitProviders ?? resolveImplicitProviders)({
			agentDir,
			config: cfg,
			env,
			explicitProviders
		}),
		explicit: explicitProviders
	});
}
function resolveExplicitBaseUrlProviders(providers) {
	return new Set(Object.entries(providers?.providers ?? {}).map(([key, provider]) => [key.trim(), provider]).filter(([key, provider]) => Boolean(key) && typeof provider?.baseUrl === "string" && provider.baseUrl.trim()).map(([key]) => key));
}
function resolveProvidersForMode(params) {
	if (params.mode !== "merge") return params.providers;
	const existing = params.existingParsed;
	if (!isRecord(existing) || !isRecord(existing.providers)) return params.providers;
	const existingProviders = existing.providers;
	return mergeWithExistingProviderSecrets({
		nextProviders: params.providers,
		existingProviders,
		secretRefManagedProviders: params.secretRefManagedProviders,
		explicitBaseUrlProviders: params.explicitBaseUrlProviders
	});
}
async function planOpenClawModelsJsonWithDeps(params, deps) {
	const { cfg, agentDir, env } = params;
	const providers = await resolveProvidersForModelsJsonWithDeps({
		cfg,
		agentDir,
		env
	}, deps);
	if (Object.keys(providers).length === 0) return { action: "skip" };
	const mode = cfg.models?.mode ?? "merge";
	const secretRefManagedProviders = /* @__PURE__ */ new Set();
	const normalizedProviders = normalizeProviders({
		providers,
		agentDir,
		env,
		secretDefaults: cfg.secrets?.defaults,
		sourceProviders: params.sourceConfigForSecrets?.models?.providers,
		sourceSecretDefaults: params.sourceConfigForSecrets?.secrets?.defaults,
		secretRefManagedProviders
	}) ?? providers;
	const mergedProviders = resolveProvidersForMode({
		mode,
		existingParsed: params.existingParsed,
		providers: normalizedProviders,
		secretRefManagedProviders,
		explicitBaseUrlProviders: resolveExplicitBaseUrlProviders(cfg.models)
	});
	const finalProviders = applyNativeStreamingUsageCompat(enforceSourceManagedProviderSecrets({
		providers: mergedProviders,
		sourceProviders: params.sourceConfigForSecrets?.models?.providers,
		sourceSecretDefaults: params.sourceConfigForSecrets?.secrets?.defaults,
		secretRefManagedProviders
	}) ?? mergedProviders);
	const nextContents = `${JSON.stringify({ providers: finalProviders }, null, 2)}\n`;
	if (params.existingRaw === nextContents) return { action: "noop" };
	return {
		action: "write",
		contents: nextContents
	};
}
async function planOpenClawModelsJson(params) {
	return planOpenClawModelsJsonWithDeps(params);
}
//#endregion
//#region src/agents/models-config.ts
async function readFileMtimeMs(pathname) {
	try {
		const stat = await fs.stat(pathname);
		return Number.isFinite(stat.mtimeMs) ? stat.mtimeMs : null;
	} catch {
		return null;
	}
}
function stableStringify(value) {
	if (value === null || typeof value !== "object") return JSON.stringify(value);
	if (Array.isArray(value)) return `[${value.map((entry) => stableStringify(entry)).join(",")}]`;
	return `{${Object.entries(value).toSorted(([a], [b]) => a.localeCompare(b)).map(([key, entry]) => `${JSON.stringify(key)}:${stableStringify(entry)}`).join(",")}}`;
}
async function buildModelsJsonFingerprint(params) {
	const authProfilesMtimeMs = await readFileMtimeMs(path.join(params.agentDir, "auth-profiles.json"));
	const modelsFileMtimeMs = await readFileMtimeMs(path.join(params.agentDir, "models.json"));
	const envShape = createConfigRuntimeEnv(params.config, {});
	return stableStringify({
		config: params.config,
		sourceConfigForSecrets: params.sourceConfigForSecrets,
		envShape,
		authProfilesMtimeMs,
		modelsFileMtimeMs
	});
}
async function readExistingModelsFile(pathname) {
	try {
		const raw = await fs.readFile(pathname, "utf8");
		return {
			raw,
			parsed: JSON.parse(raw)
		};
	} catch {
		return {
			raw: "",
			parsed: null
		};
	}
}
async function ensureModelsFileModeForModelsJson(pathname) {
	await fs.chmod(pathname, 384).catch(() => {});
}
async function writeModelsFileAtomicForModelsJson(targetPath, contents) {
	const tempPath = `${targetPath}.${process.pid}.${Date.now()}.tmp`;
	await fs.writeFile(tempPath, contents, { mode: 384 });
	await fs.rename(tempPath, targetPath);
}
function resolveModelsConfigInput(config) {
	const runtimeSource = getRuntimeConfigSourceSnapshot();
	if (!config) {
		const loaded = loadConfig();
		return {
			config: runtimeSource ?? loaded,
			sourceConfigForSecrets: runtimeSource ?? loaded
		};
	}
	if (!runtimeSource) return {
		config,
		sourceConfigForSecrets: config
	};
	const projected = projectConfigOntoRuntimeSourceSnapshot(config);
	return {
		config: projected,
		sourceConfigForSecrets: projected === config ? runtimeSource : projected
	};
}
async function withModelsJsonWriteLock(targetPath, run) {
	const prior = MODELS_JSON_STATE.writeLocks.get(targetPath) ?? Promise.resolve();
	let release = () => {};
	const gate = new Promise((resolve) => {
		release = resolve;
	});
	const pending = prior.then(() => gate);
	MODELS_JSON_STATE.writeLocks.set(targetPath, pending);
	try {
		await prior;
		return await run();
	} finally {
		release();
		if (MODELS_JSON_STATE.writeLocks.get(targetPath) === pending) MODELS_JSON_STATE.writeLocks.delete(targetPath);
	}
}
async function ensureOpenClawModelsJson(config, agentDirOverride) {
	const resolved = resolveModelsConfigInput(config);
	const cfg = resolved.config;
	const agentDir = agentDirOverride?.trim() ? agentDirOverride.trim() : resolveOpenClawAgentDir();
	const targetPath = path.join(agentDir, "models.json");
	const fingerprint = await buildModelsJsonFingerprint({
		config: cfg,
		sourceConfigForSecrets: resolved.sourceConfigForSecrets,
		agentDir
	});
	const cached = MODELS_JSON_STATE.readyCache.get(targetPath);
	if (cached) {
		const settled = await cached;
		if (settled.fingerprint === fingerprint) {
			await ensureModelsFileModeForModelsJson(targetPath);
			return settled.result;
		}
	}
	const pending = withModelsJsonWriteLock(targetPath, async () => {
		const env = createConfigRuntimeEnv(cfg);
		const existingModelsFile = await readExistingModelsFile(targetPath);
		const plan = await planOpenClawModelsJson({
			cfg,
			sourceConfigForSecrets: resolved.sourceConfigForSecrets,
			agentDir,
			env,
			existingRaw: existingModelsFile.raw,
			existingParsed: existingModelsFile.parsed
		});
		if (plan.action === "skip") return {
			fingerprint,
			result: {
				agentDir,
				wrote: false
			}
		};
		if (plan.action === "noop") {
			await ensureModelsFileModeForModelsJson(targetPath);
			return {
				fingerprint,
				result: {
					agentDir,
					wrote: false
				}
			};
		}
		await fs.mkdir(agentDir, {
			recursive: true,
			mode: 448
		});
		await writeModelsFileAtomicForModelsJson(targetPath, plan.contents);
		await ensureModelsFileModeForModelsJson(targetPath);
		return {
			fingerprint,
			result: {
				agentDir,
				wrote: true
			}
		};
	});
	MODELS_JSON_STATE.readyCache.set(targetPath, pending);
	try {
		return (await pending).result;
	} catch (error) {
		if (MODELS_JSON_STATE.readyCache.get(targetPath) === pending) MODELS_JSON_STATE.readyCache.delete(targetPath);
		throw error;
	}
}
//#endregion
export { ensureOpenClawModelsJson as t };
