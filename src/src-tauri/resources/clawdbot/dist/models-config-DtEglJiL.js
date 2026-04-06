import { t as createSubsystemLogger } from "./subsystem-CJEvHE2o.js";
import { u as isRecord } from "./utils-CE3P21nG.js";
import { n as ensureAuthProfileStore } from "./store-CY-e50gT.js";
import { n as findNormalizedProviderValue, r as normalizeProviderId } from "./provider-id-CTiEzT1T.js";
import "./model-selection-8a6zD_aX.js";
import { Qt as createConfigRuntimeEnv, c as loadConfig, s as getRuntimeConfigSourceSnapshot, u as projectConfigOntoRuntimeSourceSnapshot } from "./io-DhtVmzAJ.js";
import { d as resolveSecretInputRef, i as coerceSecretRef } from "./types.secrets-DTXJhyWe.js";
import "./config-CJQx-9zo.js";
import { t as resolveOpenClawAgentDir } from "./agent-paths-BiYMSfDv.js";
import { t as normalizeOptionalSecretInput } from "./normalize-secret-input-CRNbANMO.js";
import { n as listProfilesForProvider } from "./profiles-RmR8EAZC.js";
import { A as resolveProviderRuntimePlugin, M as resolveProviderSyntheticAuthWithPlugin, T as resolveProviderConfigApiKeyWithPlugin, d as normalizeProviderConfigWithPlugin, t as applyProviderNativeStreamingUsageCompatWithPlugin } from "./provider-runtime-Dhor2yYF.js";
import { h as resolveNonEnvSecretRefHeaderValueMarker, m as resolveNonEnvSecretRefApiKeyMarker, p as resolveEnvSecretRefHeaderValueMarker, u as isNonSecretApiKeyMarker } from "./model-auth-markers-BjPX15EF.js";
import { t as resolveEnvApiKey } from "./model-auth-env-Cr_twdPk.js";
import { n as resolveAwsSdkEnvVarName } from "./model-auth-runtime-shared-DSbChRle.js";
import { o as resolveProviderWebSearchPluginConfig } from "./provider-web-search-BvBfxXst.js";
import path from "node:path";
import fs from "node:fs/promises";
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
	return typeof id === "string" ? id.trim() : "";
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
		const providerKey = key.trim();
		if (!providerKey) continue;
		const implicit = out[providerKey];
		out[providerKey] = implicit ? mergeProviderModels(implicit, explicit) : explicit;
	}
	return out;
}
function resolveProviderApi(entry) {
	if (typeof entry?.api !== "string") return;
	return entry.api.trim() || void 0;
}
function resolveModelApiSurface(entry) {
	if (!Array.isArray(entry?.models)) return;
	const apis = entry.models.flatMap((model) => {
		if (!model || typeof model !== "object") return [];
		const api = model.api;
		return typeof api === "string" && api.trim() ? [api.trim()] : [];
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
	providerRuntimePromise ??= import("./provider-discovery.runtime-XHrSdt9y.js");
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
	if ("provider" in result) return { [normalizeProviderId(params.provider.id)]: result.provider };
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
//#region src/agents/models-config.providers.secrets.ts
const ENV_VAR_NAME_RE = /^[A-Z_][A-Z0-9_]*$/;
function normalizeApiKeyConfig(value) {
	const trimmed = value.trim();
	return /^\$\{([A-Z0-9_]+)\}$/.exec(trimmed)?.[1] ?? trimmed;
}
function toDiscoveryApiKey(value) {
	const trimmed = value?.trim();
	if (!trimmed || isNonSecretApiKeyMarker(trimmed)) return;
	return trimmed;
}
function resolveEnvApiKeyVarName(provider, env = process.env) {
	const resolved = resolveEnvApiKey(provider, env);
	if (!resolved) return;
	const match = /^(?:env: |shell env: )([A-Z0-9_]+)$/.exec(resolved.source);
	return match ? match[1] : void 0;
}
function resolveAwsSdkApiKeyVarName(env = process.env) {
	return resolveAwsSdkEnvVarName(env) ?? "AWS_PROFILE";
}
function normalizeHeaderValues(params) {
	const { headers } = params;
	if (!headers) return {
		headers,
		mutated: false
	};
	let mutated = false;
	const nextHeaders = {};
	for (const [headerName, headerValue] of Object.entries(headers)) {
		const resolvedRef = resolveSecretInputRef({
			value: headerValue,
			defaults: params.secretDefaults
		}).ref;
		if (!resolvedRef || !resolvedRef.id.trim()) {
			nextHeaders[headerName] = headerValue;
			continue;
		}
		mutated = true;
		nextHeaders[headerName] = resolvedRef.source === "env" ? resolveEnvSecretRefHeaderValueMarker(resolvedRef.id) : resolveNonEnvSecretRefHeaderValueMarker(resolvedRef.source);
	}
	if (!mutated) return {
		headers,
		mutated: false
	};
	return {
		headers: nextHeaders,
		mutated: true
	};
}
function resolveApiKeyFromCredential(cred, env = process.env) {
	if (!cred) return;
	if (cred.type === "api_key") {
		const keyRef = coerceSecretRef(cred.keyRef);
		if (keyRef && keyRef.id.trim()) {
			if (keyRef.source === "env") {
				const envVar = keyRef.id.trim();
				return {
					apiKey: envVar,
					source: "env-ref",
					discoveryApiKey: toDiscoveryApiKey(env[envVar])
				};
			}
			return {
				apiKey: resolveNonEnvSecretRefApiKeyMarker(keyRef.source),
				source: "non-env-ref"
			};
		}
		if (cred.key?.trim()) return {
			apiKey: cred.key,
			source: "plaintext",
			discoveryApiKey: toDiscoveryApiKey(cred.key)
		};
		return;
	}
	if (cred.type === "token") {
		const tokenRef = coerceSecretRef(cred.tokenRef);
		if (tokenRef && tokenRef.id.trim()) {
			if (tokenRef.source === "env") {
				const envVar = tokenRef.id.trim();
				return {
					apiKey: envVar,
					source: "env-ref",
					discoveryApiKey: toDiscoveryApiKey(env[envVar])
				};
			}
			return {
				apiKey: resolveNonEnvSecretRefApiKeyMarker(tokenRef.source),
				source: "non-env-ref"
			};
		}
		if (cred.token?.trim()) return {
			apiKey: cred.token,
			source: "plaintext",
			discoveryApiKey: toDiscoveryApiKey(cred.token)
		};
	}
}
function resolveApiKeyFromProfiles(params) {
	const ids = listProfilesForProvider(params.store, params.provider);
	for (const id of ids) {
		const resolved = resolveApiKeyFromCredential(params.store.profiles[id], params.env);
		if (resolved) return resolved;
	}
}
function normalizeConfiguredProviderApiKey(params) {
	const configuredApiKey = params.provider.apiKey;
	const configuredApiKeyRef = resolveSecretInputRef({
		value: configuredApiKey,
		defaults: params.secretDefaults
	}).ref;
	if (configuredApiKeyRef && configuredApiKeyRef.id.trim()) {
		const marker = configuredApiKeyRef.source === "env" ? configuredApiKeyRef.id.trim() : resolveNonEnvSecretRefApiKeyMarker(configuredApiKeyRef.source);
		params.secretRefManagedProviders?.add(params.providerKey);
		if (params.provider.apiKey === marker) return params.provider;
		return {
			...params.provider,
			apiKey: marker
		};
	}
	if (typeof configuredApiKey !== "string") return params.provider;
	const normalizedConfiguredApiKey = normalizeApiKeyConfig(configuredApiKey);
	if (isNonSecretApiKeyMarker(normalizedConfiguredApiKey)) params.secretRefManagedProviders?.add(params.providerKey);
	if (params.profileApiKey && params.profileApiKey.source !== "plaintext" && normalizedConfiguredApiKey === params.profileApiKey.apiKey) params.secretRefManagedProviders?.add(params.providerKey);
	if (normalizedConfiguredApiKey === configuredApiKey) return params.provider;
	return {
		...params.provider,
		apiKey: normalizedConfiguredApiKey
	};
}
function normalizeResolvedEnvApiKey(params) {
	const currentApiKey = params.provider.apiKey;
	if (typeof currentApiKey !== "string" || !currentApiKey.trim() || ENV_VAR_NAME_RE.test(currentApiKey.trim())) return params.provider;
	const envVarName = resolveEnvApiKeyVarName(params.providerKey, params.env);
	if (!envVarName || params.env[envVarName] !== currentApiKey) return params.provider;
	params.secretRefManagedProviders?.add(params.providerKey);
	return {
		...params.provider,
		apiKey: envVarName
	};
}
function resolveMissingProviderApiKey(params) {
	const hasModels = Array.isArray(params.provider.models) && params.provider.models.length > 0;
	const normalizedApiKey = normalizeOptionalSecretInput(params.provider.apiKey);
	const hasConfiguredApiKey = Boolean(normalizedApiKey || params.provider.apiKey);
	if (!hasModels || hasConfiguredApiKey) return params.provider;
	const authMode = params.provider.auth;
	if (params.providerApiKeyResolver && (!authMode || authMode === "aws-sdk")) return {
		...params.provider,
		apiKey: params.providerApiKeyResolver(params.env)
	};
	if (authMode === "aws-sdk") return {
		...params.provider,
		apiKey: resolveAwsSdkApiKeyVarName(params.env)
	};
	const apiKey = resolveEnvApiKeyVarName(params.providerKey, params.env) ?? params.profileApiKey?.apiKey;
	if (!apiKey?.trim()) return params.provider;
	if (params.profileApiKey && params.profileApiKey.source !== "plaintext") params.secretRefManagedProviders?.add(params.providerKey);
	return {
		...params.provider,
		apiKey
	};
}
function createProviderApiKeyResolver(env, authStore, config) {
	return (provider) => {
		const envVar = resolveEnvApiKeyVarName(provider, env);
		if (envVar) return {
			apiKey: envVar,
			discoveryApiKey: toDiscoveryApiKey(env[envVar])
		};
		const fromProfiles = resolveApiKeyFromProfiles({
			provider,
			store: authStore,
			env
		});
		if (fromProfiles?.apiKey) return {
			apiKey: fromProfiles.apiKey,
			discoveryApiKey: fromProfiles.discoveryApiKey
		};
		const fromConfig = resolveConfigBackedProviderAuth({
			provider,
			config
		});
		return {
			apiKey: fromConfig?.apiKey,
			discoveryApiKey: fromConfig?.discoveryApiKey
		};
	};
}
function createProviderAuthResolver(env, authStore, config) {
	return (provider, options) => {
		const ids = listProfilesForProvider(authStore, provider);
		let oauthCandidate;
		for (const id of ids) {
			const cred = authStore.profiles[id];
			if (!cred) continue;
			if (cred.type === "oauth") {
				oauthCandidate ??= {
					apiKey: options?.oauthMarker,
					discoveryApiKey: toDiscoveryApiKey(cred.access),
					mode: "oauth",
					source: "profile",
					profileId: id
				};
				continue;
			}
			const resolved = resolveApiKeyFromCredential(cred, env);
			if (!resolved) continue;
			return {
				apiKey: resolved.apiKey,
				discoveryApiKey: resolved.discoveryApiKey,
				mode: cred.type,
				source: "profile",
				profileId: id
			};
		}
		if (oauthCandidate) return oauthCandidate;
		const envVar = resolveEnvApiKeyVarName(provider, env);
		if (envVar) return {
			apiKey: envVar,
			discoveryApiKey: toDiscoveryApiKey(env[envVar]),
			mode: "api_key",
			source: "env"
		};
		const fromConfig = resolveConfigBackedProviderAuth({
			provider,
			config
		});
		if (fromConfig) return {
			apiKey: fromConfig.apiKey,
			discoveryApiKey: fromConfig.discoveryApiKey,
			mode: fromConfig.mode,
			source: "none"
		};
		return {
			apiKey: void 0,
			discoveryApiKey: void 0,
			mode: "none",
			source: "none"
		};
	};
}
function resolveConfigBackedProviderAuth(params) {
	const apiKey = (resolveProviderSyntheticAuthWithPlugin({
		provider: params.provider,
		config: params.config,
		context: {
			config: params.config,
			provider: params.provider,
			providerConfig: params.config?.models?.providers?.[params.provider]
		}
	}) ?? resolveXaiConfigFallbackAuth(params))?.apiKey?.trim();
	if (!apiKey) return;
	return isNonSecretApiKeyMarker(apiKey) ? {
		apiKey,
		discoveryApiKey: toDiscoveryApiKey(apiKey),
		mode: "api_key",
		source: "config"
	} : {
		apiKey: resolveNonEnvSecretRefApiKeyMarker("file"),
		discoveryApiKey: toDiscoveryApiKey(apiKey),
		mode: "api_key",
		source: "config"
	};
}
function resolveXaiConfigFallbackAuth(params) {
	if (params.provider.trim().toLowerCase() !== "xai") return;
	if ((params.config?.plugins?.entries?.xai)?.enabled === false) return;
	const pluginApiKey = normalizeOptionalSecretInput(resolveProviderWebSearchPluginConfig(params.config, "xai")?.apiKey);
	if (pluginApiKey) return {
		apiKey: pluginApiKey,
		source: "plugins.entries.xai.config.webSearch.apiKey",
		mode: "api-key"
	};
	const pluginApiKeyRef = coerceSecretRef(resolveProviderWebSearchPluginConfig(params.config, "xai")?.apiKey);
	if (pluginApiKeyRef) return {
		apiKey: pluginApiKeyRef.source === "env" ? pluginApiKeyRef.id.trim() : resolveNonEnvSecretRefApiKeyMarker(pluginApiKeyRef.source),
		source: "plugins.entries.xai.config.webSearch.apiKey",
		mode: "api-key"
	};
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
function resolveLiveProviderDiscoveryFilter(env) {
	if (!(env.OPENCLAW_LIVE_TEST === "1" || env.OPENCLAW_LIVE_GATEWAY === "1" || env.LIVE === "1")) return;
	const raw = env.OPENCLAW_LIVE_PROVIDERS?.trim();
	if (!raw || raw === "all") return;
	const ids = raw.split(",").map((value) => value.trim()).filter(Boolean);
	return ids.length > 0 ? [...new Set(ids)] : void 0;
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
async function resolvePluginImplicitProviders(ctx, order) {
	const onlyPluginIds = resolveLiveProviderDiscoveryFilter(ctx.env);
	const byOrder = groupPluginDiscoveryProvidersByOrder(await resolvePluginDiscoveryProviders({
		config: ctx.config,
		workspaceDir: ctx.workspaceDir,
		env: ctx.env,
		onlyPluginIds
	}));
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
		const message = error instanceof Error ? error.message : String(error);
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
	const authStore = ensureAuthProfileStore(params.agentDir, { allowKeychainPrompt: false });
	const context = {
		...params,
		authStore,
		env,
		resolveProviderApiKey: createProviderApiKeyResolver(env, authStore, params.config),
		resolveProviderAuth: createProviderAuthResolver(env, authStore, params.config)
	};
	for (const order of PLUGIN_DISCOVERY_ORDERS) mergeImplicitProviderSet(providers, await resolvePluginImplicitProviders(context, order));
	return providers;
}
//#endregion
//#region src/agents/models-config.providers.policy.ts
function applyNativeStreamingUsageCompat(providers) {
	let changed = false;
	const nextProviders = {};
	for (const [providerKey, provider] of Object.entries(providers)) {
		const nextProvider = applyProviderNativeStreamingUsageCompatWithPlugin({
			provider: providerKey,
			context: {
				provider: providerKey,
				providerConfig: provider
			}
		}) ?? provider;
		nextProviders[providerKey] = nextProvider;
		changed ||= nextProvider !== provider;
	}
	return changed ? nextProviders : providers;
}
function normalizeProviderSpecificConfig(providerKey, provider) {
	return normalizeProviderConfigWithPlugin({
		provider: providerKey,
		context: {
			provider: providerKey,
			providerConfig: provider
		}
	}) ?? provider;
}
function resolveProviderConfigApiKeyResolver(providerKey) {
	if (!resolveProviderRuntimePlugin({ provider: providerKey })?.resolveConfigApiKey) return;
	return (env) => {
		return resolveProviderConfigApiKeyWithPlugin({
			provider: providerKey,
			env,
			context: {
				provider: providerKey,
				env
			}
		})?.trim() || void 0;
	};
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
async function resolveProvidersForModelsJson(params) {
	const { cfg, agentDir, env } = params;
	const explicitProviders = cfg.models?.providers ?? {};
	return mergeProviders({
		implicit: await resolveImplicitProviders({
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
async function planOpenClawModelsJson(params) {
	const { cfg, agentDir, env } = params;
	const providers = await resolveProvidersForModelsJson({
		cfg,
		agentDir,
		env
	});
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
//#endregion
//#region src/agents/models-config.ts
const MODELS_JSON_WRITE_LOCKS = /* @__PURE__ */ new Map();
const MODELS_JSON_READY_CACHE = /* @__PURE__ */ new Map();
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
async function ensureModelsFileMode(pathname) {
	await fs.chmod(pathname, 384).catch(() => {});
}
async function writeModelsFileAtomic(targetPath, contents) {
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
	const prior = MODELS_JSON_WRITE_LOCKS.get(targetPath) ?? Promise.resolve();
	let release = () => {};
	const gate = new Promise((resolve) => {
		release = resolve;
	});
	const pending = prior.then(() => gate);
	MODELS_JSON_WRITE_LOCKS.set(targetPath, pending);
	try {
		await prior;
		return await run();
	} finally {
		release();
		if (MODELS_JSON_WRITE_LOCKS.get(targetPath) === pending) MODELS_JSON_WRITE_LOCKS.delete(targetPath);
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
	const cached = MODELS_JSON_READY_CACHE.get(targetPath);
	if (cached) {
		const settled = await cached;
		if (settled.fingerprint === fingerprint) {
			await ensureModelsFileMode(targetPath);
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
			await ensureModelsFileMode(targetPath);
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
		await writeModelsFileAtomic(targetPath, plan.contents);
		await ensureModelsFileMode(targetPath);
		return {
			fingerprint,
			result: {
				agentDir,
				wrote: true
			}
		};
	});
	MODELS_JSON_READY_CACHE.set(targetPath, pending);
	try {
		return (await pending).result;
	} catch (error) {
		if (MODELS_JSON_READY_CACHE.get(targetPath) === pending) MODELS_JSON_READY_CACHE.delete(targetPath);
		throw error;
	}
}
//#endregion
export { ensureOpenClawModelsJson as t };
