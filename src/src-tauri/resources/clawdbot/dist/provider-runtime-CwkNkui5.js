import { a as normalizeLowercaseStringOrEmpty, c as normalizeOptionalString } from "./string-coerce-Bje8XVt9.js";
import { t as sanitizeForLog } from "./ansi-Dqm1lzVL.js";
import { t as createSubsystemLogger } from "./subsystem-rHhUC6qs.js";
import { r as resolvePluginCacheInputs } from "./discovery-CRcfnviq.js";
import { it as resolveBundledProviderPolicySurface } from "./io-CFdEhZuM.js";
import { r as normalizeProviderId } from "./provider-id-DRW5WMbW.js";
import { n as getActivePluginRegistryWorkspaceDirFromState } from "./runtime-state-DibqiYLk.js";
import { s as resolveGpt5SystemPromptContribution } from "./gpt5-prompt-overlay-CYwbSgxN.js";
import { n as mergePluginTextTransforms, t as applyPluginTextReplacements } from "./plugin-text-transforms-CppVSZSV.js";
import { t as normalizeProviderModelIdWithManifest } from "./manifest-model-id-normalization-DWlr8GpT.js";
import { a as serializePluginIdScope, i as normalizePluginIdScope } from "./plugin-scope-C6pWBGis.js";
import { c as resolveExternalAuthProfileProviderPluginIds, d as resolveOwningPluginIdsForProvider, r as resolveCatalogHookProviderPluginIds, s as resolveExternalAuthProfileCompatFallbackPluginIds } from "./providers-CjE0WvyR.js";
import { n as resolvePluginProviders, r as resolveProviderConfigApiOwnerHint, t as isPluginProvidersLoadInFlight } from "./providers.runtime-h1H6iyrA.js";
import { t as resolvePluginDiscoveryProvidersRuntime } from "./provider-discovery.runtime-DFmTjZCf.js";
import { t as getActiveRuntimePluginRegistry } from "./active-runtime-registry-C8lFqbl_.js";
//#region src/plugins/provider-hook-runtime.ts
function matchesProviderId(provider, providerId) {
	const normalized = normalizeProviderId(providerId);
	if (!normalized) return false;
	if (normalizeProviderId(provider.id) === normalized) return true;
	return [...provider.aliases ?? [], ...provider.hookAliases ?? []].some((alias) => normalizeProviderId(alias) === normalized);
}
function matchesProviderLiteralId(provider, providerId) {
	const normalized = normalizeLowercaseStringOrEmpty(providerId);
	return !!normalized && normalizeLowercaseStringOrEmpty(provider.id) === normalized;
}
let cachedHookProvidersWithoutConfig = /* @__PURE__ */ new WeakMap();
let cachedHookProvidersByConfig = /* @__PURE__ */ new WeakMap();
function resolveHookProviderCacheBucket(params) {
	if (!params.config) {
		let bucket = cachedHookProvidersWithoutConfig.get(params.env);
		if (!bucket) {
			bucket = /* @__PURE__ */ new Map();
			cachedHookProvidersWithoutConfig.set(params.env, bucket);
		}
		return bucket;
	}
	let envBuckets = cachedHookProvidersByConfig.get(params.config);
	if (!envBuckets) {
		envBuckets = /* @__PURE__ */ new WeakMap();
		cachedHookProvidersByConfig.set(params.config, envBuckets);
	}
	let bucket = envBuckets.get(params.env);
	if (!bucket) {
		bucket = /* @__PURE__ */ new Map();
		envBuckets.set(params.env, bucket);
	}
	return bucket;
}
function buildHookProviderCacheKey(params) {
	const { roots } = resolvePluginCacheInputs({
		workspaceDir: params.workspaceDir,
		env: params.env
	});
	const onlyPluginIds = normalizePluginIdScope(params.onlyPluginIds);
	return `${roots.workspace ?? ""}::${roots.global}::${roots.stock ?? ""}::${JSON.stringify(params.config ?? null)}::${serializePluginIdScope(onlyPluginIds)}::${JSON.stringify(params.providerRefs ?? [])}`;
}
function clearProviderRuntimeHookCache$1() {
	cachedHookProvidersWithoutConfig = /* @__PURE__ */ new WeakMap();
	cachedHookProvidersByConfig = /* @__PURE__ */ new WeakMap();
}
const __testing$1 = { buildHookProviderCacheKey };
function resolveProviderPluginsForHooks(params) {
	const env = params.env ?? process.env;
	const workspaceDir = params.workspaceDir ?? getActivePluginRegistryWorkspaceDirFromState();
	const cacheBucket = resolveHookProviderCacheBucket({
		config: params.config,
		env
	});
	const cacheKey = buildHookProviderCacheKey({
		config: params.config,
		workspaceDir,
		onlyPluginIds: params.onlyPluginIds,
		providerRefs: params.providerRefs,
		env
	});
	const cached = cacheBucket.get(cacheKey);
	if (cached) return cached;
	if (isPluginProvidersLoadInFlight({
		...params,
		workspaceDir,
		env,
		activate: false,
		cache: false,
		applyAutoEnable: params.applyAutoEnable,
		bundledProviderAllowlistCompat: params.bundledProviderAllowlistCompat ?? true,
		bundledProviderVitestCompat: params.bundledProviderVitestCompat ?? true,
		installBundledRuntimeDeps: params.installBundledRuntimeDeps
	})) return [];
	const resolved = resolvePluginProviders({
		...params,
		workspaceDir,
		env,
		activate: false,
		cache: false,
		applyAutoEnable: params.applyAutoEnable,
		bundledProviderAllowlistCompat: params.bundledProviderAllowlistCompat ?? true,
		bundledProviderVitestCompat: params.bundledProviderVitestCompat ?? true,
		installBundledRuntimeDeps: params.installBundledRuntimeDeps
	});
	cacheBucket.set(cacheKey, resolved);
	return resolved;
}
function resolveProviderRuntimePlugin(params) {
	const apiOwnerHint = resolveProviderConfigApiOwnerHint({
		provider: params.provider,
		config: params.config
	});
	return resolveProviderPluginsForHooks({
		config: params.config,
		workspaceDir: params.workspaceDir ?? getActivePluginRegistryWorkspaceDirFromState(),
		env: params.env,
		providerRefs: apiOwnerHint ? [params.provider, apiOwnerHint] : [params.provider],
		applyAutoEnable: params.applyAutoEnable,
		bundledProviderAllowlistCompat: params.bundledProviderAllowlistCompat,
		bundledProviderVitestCompat: params.bundledProviderVitestCompat,
		installBundledRuntimeDeps: params.installBundledRuntimeDeps
	}).find((plugin) => {
		if (apiOwnerHint) return matchesProviderLiteralId(plugin, params.provider) || matchesProviderId(plugin, apiOwnerHint);
		return matchesProviderId(plugin, params.provider);
	});
}
function resolveProviderHookPlugin(params) {
	return resolveProviderRuntimePlugin(params) ?? resolveProviderPluginsForHooks({
		config: params.config,
		workspaceDir: params.workspaceDir,
		env: params.env
	}).find((candidate) => matchesProviderId(candidate, params.provider));
}
function prepareProviderExtraParams(params) {
	return resolveProviderRuntimePlugin(params)?.prepareExtraParams?.(params.context) ?? void 0;
}
function resolveProviderExtraParamsForTransport(params) {
	return resolveProviderHookPlugin(params)?.extraParamsForTransport?.(params.context) ?? void 0;
}
function resolveProviderAuthProfileId(params) {
	const resolved = resolveProviderHookPlugin(params)?.resolveAuthProfileId?.(params.context);
	return typeof resolved === "string" && resolved.trim() ? resolved.trim() : void 0;
}
function resolveProviderFollowupFallbackRoute(params) {
	return resolveProviderHookPlugin(params)?.followupFallbackRoute?.(params.context) ?? void 0;
}
function wrapProviderStreamFn(params) {
	return resolveProviderHookPlugin(params)?.wrapStreamFn?.(params.context) ?? void 0;
}
//#endregion
//#region src/plugins/text-transforms.runtime.ts
function resolveRuntimeTextTransforms() {
	const registry = getActiveRuntimePluginRegistry();
	return mergePluginTextTransforms(...Array.isArray(registry?.textTransforms) ? registry.textTransforms.map((entry) => entry.transforms) : []);
}
//#endregion
//#region src/plugins/provider-runtime.ts
const log = createSubsystemLogger("plugins/provider-runtime");
const warnedExternalAuthFallbackPluginIds = /* @__PURE__ */ new Set();
let catalogHookProvidersCache = /* @__PURE__ */ new WeakMap();
let catalogHookProviderIdCacheWithoutConfig = /* @__PURE__ */ new WeakMap();
let catalogHookProviderIdCacheByConfig = /* @__PURE__ */ new WeakMap();
function matchesProviderPluginRef(provider, providerId) {
	const normalized = normalizeProviderId(providerId);
	if (!normalized) return false;
	if (normalizeProviderId(provider.id) === normalized) return true;
	return [...provider.aliases ?? [], ...provider.hookAliases ?? []].some((alias) => normalizeProviderId(alias) === normalized);
}
function resolveProviderHookRefs(provider, providerConfig) {
	const refs = [provider];
	const apiRef = normalizeOptionalString(providerConfig?.api);
	if (apiRef && normalizeProviderId(apiRef) !== normalizeProviderId(provider)) refs.push(apiRef);
	return [...new Set(refs)];
}
function matchesAnyProviderPluginRef(provider, providerRefs) {
	return providerRefs.some((providerRef) => matchesProviderPluginRef(provider, providerRef));
}
function hasExplicitProviderRuntimePluginActivation(params) {
	if (!params.config) return true;
	const ownerPluginIds = resolveOwningPluginIdsForProvider({
		provider: params.provider,
		config: params.config,
		workspaceDir: params.workspaceDir,
		env: params.env
	}) ?? [];
	if (ownerPluginIds.length === 0) return false;
	const allow = new Set(params.config.plugins?.allow ?? []);
	const entries = params.config.plugins?.entries ?? {};
	return ownerPluginIds.some((pluginId) => allow.has(pluginId) || entries[pluginId] !== void 0);
}
function resetExternalAuthFallbackWarningCacheForTest() {
	warnedExternalAuthFallbackPluginIds.clear();
}
function resetCatalogHookProvidersCacheForTest() {
	catalogHookProvidersCache = /* @__PURE__ */ new WeakMap();
}
function clearCatalogHookProviderIdCache() {
	catalogHookProviderIdCacheWithoutConfig = /* @__PURE__ */ new WeakMap();
	catalogHookProviderIdCacheByConfig = /* @__PURE__ */ new WeakMap();
}
function resolveCatalogHookProviderIdCacheBucket(params) {
	if (!params.config) {
		let bucket = catalogHookProviderIdCacheWithoutConfig.get(params.env);
		if (!bucket) {
			bucket = /* @__PURE__ */ new Map();
			catalogHookProviderIdCacheWithoutConfig.set(params.env, bucket);
		}
		return bucket;
	}
	let envBuckets = catalogHookProviderIdCacheByConfig.get(params.config);
	if (!envBuckets) {
		envBuckets = /* @__PURE__ */ new WeakMap();
		catalogHookProviderIdCacheByConfig.set(params.config, envBuckets);
	}
	let bucket = envBuckets.get(params.env);
	if (!bucket) {
		bucket = /* @__PURE__ */ new Map();
		envBuckets.set(params.env, bucket);
	}
	return bucket;
}
function buildCatalogHookProviderIdCacheKey(params) {
	const { roots } = resolvePluginCacheInputs({
		workspaceDir: params.workspaceDir,
		env: params.env
	});
	return `${roots.workspace ?? ""}::${roots.global}::${roots.stock ?? ""}::${JSON.stringify(params.config ?? null)}`;
}
function resolveCachedCatalogHookProviderPluginIds(params) {
	const env = params.env ?? process.env;
	const bucket = resolveCatalogHookProviderIdCacheBucket({
		config: params.config,
		env
	});
	const key = buildCatalogHookProviderIdCacheKey({
		config: params.config,
		workspaceDir: params.workspaceDir,
		env
	});
	const cached = bucket.get(key);
	if (cached) return cached;
	const resolved = resolveCatalogHookProviderPluginIds({
		config: params.config,
		workspaceDir: params.workspaceDir,
		env
	});
	bucket.set(key, resolved);
	return resolved;
}
function clearProviderRuntimeHookCache() {
	resetCatalogHookProvidersCacheForTest();
	clearCatalogHookProviderIdCache();
	clearProviderRuntimeHookCache$1();
}
function resetProviderRuntimeHookCacheForTest() {
	clearProviderRuntimeHookCache();
}
const __testing = {
	...__testing$1,
	resetExternalAuthFallbackWarningCacheForTest,
	resetCatalogHookProvidersCacheForTest,
	resetProviderRuntimeHookCacheForTest
};
function resolveProviderPluginsForCatalogHooks(params) {
	const workspaceDir = params.workspaceDir ?? getActivePluginRegistryWorkspaceDirFromState();
	const env = params.env ?? process.env;
	let envCache = catalogHookProvidersCache.get(env);
	if (!envCache) {
		envCache = /* @__PURE__ */ new Map();
		catalogHookProvidersCache.set(env, envCache);
	}
	const cacheKey = JSON.stringify({
		workspaceDir: workspaceDir ?? "",
		plugins: params.config?.plugins ?? null
	});
	const cached = envCache.get(cacheKey);
	if (cached) return cached;
	const onlyPluginIds = resolveCachedCatalogHookProviderPluginIds({
		config: params.config,
		workspaceDir,
		env
	});
	if (onlyPluginIds.length === 0) {
		envCache.set(cacheKey, []);
		return [];
	}
	const providers = resolveProviderPluginsForHooks({
		...params,
		workspaceDir,
		env,
		onlyPluginIds
	});
	envCache.set(cacheKey, providers);
	return providers;
}
function runProviderDynamicModel(params) {
	return resolveProviderRuntimePlugin(params)?.resolveDynamicModel?.(params.context) ?? void 0;
}
function resolveProviderSystemPromptContribution(params) {
	const plugin = resolveProviderRuntimePlugin(params);
	const baseOverlay = resolveGpt5SystemPromptContribution({
		config: params.context.config ?? params.config,
		providerId: params.context.provider ?? params.provider,
		modelId: params.context.modelId
	});
	return mergeProviderSystemPromptContributions(mergeProviderSystemPromptContributions(baseOverlay, plugin?.resolvePromptOverlay?.({
		...params.context,
		baseOverlay
	}) ?? void 0), plugin?.resolveSystemPromptContribution?.(params.context) ?? void 0);
}
function mergeProviderSystemPromptContributions(base, override) {
	if (!base) return override;
	if (!override) return base;
	const stablePrefix = mergeUniquePromptSections(base.stablePrefix, override.stablePrefix);
	const dynamicSuffix = mergeUniquePromptSections(base.dynamicSuffix, override.dynamicSuffix);
	return {
		...stablePrefix ? { stablePrefix } : {},
		...dynamicSuffix ? { dynamicSuffix } : {},
		sectionOverrides: {
			...base.sectionOverrides,
			...override.sectionOverrides
		}
	};
}
function mergeUniquePromptSections(...sections) {
	const uniqueSections = [...new Set(sections.filter((section) => section?.trim()))];
	return uniqueSections.length > 0 ? uniqueSections.join("\n\n") : void 0;
}
function transformProviderSystemPrompt(params) {
	const plugin = resolveProviderRuntimePlugin(params);
	const textTransforms = mergePluginTextTransforms(resolveRuntimeTextTransforms(), plugin?.textTransforms);
	return applyPluginTextReplacements(plugin?.transformSystemPrompt?.(params.context) ?? params.context.systemPrompt, textTransforms?.input);
}
function resolveProviderTextTransforms(params) {
	return mergePluginTextTransforms(resolveRuntimeTextTransforms(), resolveProviderRuntimePlugin(params)?.textTransforms);
}
async function prepareProviderDynamicModel(params) {
	await resolveProviderRuntimePlugin(params)?.prepareDynamicModel?.(params.context);
}
function shouldPreferProviderRuntimeResolvedModel(params) {
	return resolveProviderRuntimePlugin(params)?.preferRuntimeResolvedModel?.(params.context) ?? false;
}
function normalizeProviderResolvedModelWithPlugin(params) {
	return resolveProviderRuntimePlugin(params)?.normalizeResolvedModel?.(params.context) ?? void 0;
}
function resolveProviderCompatHookPlugins(params) {
	const candidates = resolveProviderPluginsForHooks(params);
	const owner = resolveProviderRuntimePlugin(params);
	if (!owner) return candidates;
	const ordered = [owner, ...candidates];
	const seen = /* @__PURE__ */ new Set();
	return ordered.filter((candidate) => {
		const key = `${candidate.pluginId ?? ""}:${candidate.id}`;
		if (seen.has(key)) return false;
		seen.add(key);
		return true;
	});
}
function applyCompatPatchToModel(model, patch) {
	const compat = model.compat && typeof model.compat === "object" ? model.compat : void 0;
	if (Object.entries(patch).every(([key, value]) => compat?.[key] === value)) return model;
	return {
		...model,
		compat: {
			...compat,
			...patch
		}
	};
}
function applyProviderResolvedModelCompatWithPlugins(params) {
	let nextModel = params.context.model;
	let changed = false;
	for (const plugin of resolveProviderCompatHookPlugins(params)) {
		const patch = plugin.contributeResolvedModelCompat?.({
			...params.context,
			model: nextModel
		});
		if (!patch || typeof patch !== "object") continue;
		const patchedModel = applyCompatPatchToModel(nextModel, patch);
		if (patchedModel === nextModel) continue;
		nextModel = patchedModel;
		changed = true;
	}
	return changed ? nextModel : void 0;
}
function applyProviderResolvedTransportWithPlugin(params) {
	const normalized = normalizeProviderTransportWithPlugin({
		provider: params.provider,
		config: params.config,
		workspaceDir: params.workspaceDir,
		env: params.env,
		context: {
			provider: params.context.provider,
			api: params.context.model.api,
			baseUrl: params.context.model.baseUrl
		}
	});
	if (!normalized) return;
	const nextApi = normalized.api ?? params.context.model.api;
	const nextBaseUrl = normalized.baseUrl ?? params.context.model.baseUrl;
	if (nextApi === params.context.model.api && nextBaseUrl === params.context.model.baseUrl) return;
	return {
		...params.context.model,
		api: nextApi,
		baseUrl: nextBaseUrl
	};
}
function normalizeProviderModelIdWithPlugin(params) {
	return normalizeOptionalString(resolveProviderHookPlugin(params)?.normalizeModelId?.(params.context)) ?? normalizeProviderModelIdWithManifest(params);
}
function normalizeProviderTransportWithPlugin(params) {
	const hasTransportChange = (normalized) => (normalized.api ?? params.context.api) !== params.context.api || (normalized.baseUrl ?? params.context.baseUrl) !== params.context.baseUrl;
	const matchedPlugin = resolveProviderHookPlugin(params);
	const normalizedMatched = matchedPlugin?.normalizeTransport?.(params.context);
	if (normalizedMatched && hasTransportChange(normalizedMatched)) return normalizedMatched;
	for (const candidate of resolveProviderPluginsForHooks(params)) {
		if (!candidate.normalizeTransport || candidate === matchedPlugin) continue;
		const normalized = candidate.normalizeTransport(params.context);
		if (normalized && hasTransportChange(normalized)) return normalized;
	}
}
function normalizeProviderConfigWithPlugin(params) {
	const hasConfigChange = (normalized) => normalized !== params.context.providerConfig;
	const bundledSurface = resolveBundledProviderPolicySurface(params.provider);
	if (bundledSurface?.normalizeConfig) {
		const normalized = bundledSurface.normalizeConfig(params.context);
		return normalized && hasConfigChange(normalized) ? normalized : void 0;
	}
	if (!hasExplicitProviderRuntimePluginActivation(params)) return;
	if (params.allowRuntimePluginLoad === false) return;
	const normalizedMatched = resolveProviderRuntimePlugin(params)?.normalizeConfig?.(params.context);
	return normalizedMatched && hasConfigChange(normalizedMatched) ? normalizedMatched : void 0;
}
function applyProviderNativeStreamingUsageCompatWithPlugin(params) {
	if (params.allowRuntimePluginLoad === false) return;
	return resolveProviderRuntimePlugin(params)?.applyNativeStreamingUsageCompat?.(params.context) ?? void 0;
}
function resolveProviderConfigApiKeyWithPlugin(params) {
	const bundledSurface = resolveBundledProviderPolicySurface(params.provider);
	if (bundledSurface?.resolveConfigApiKey) return normalizeOptionalString(bundledSurface.resolveConfigApiKey(params.context));
	if (params.allowRuntimePluginLoad === false) return;
	return normalizeOptionalString(resolveProviderRuntimePlugin(params)?.resolveConfigApiKey?.(params.context));
}
function resolveProviderReplayPolicyWithPlugin(params) {
	return resolveProviderHookPlugin(params)?.buildReplayPolicy?.(params.context) ?? void 0;
}
async function sanitizeProviderReplayHistoryWithPlugin(params) {
	return await resolveProviderHookPlugin(params)?.sanitizeReplayHistory?.(params.context);
}
async function validateProviderReplayTurnsWithPlugin(params) {
	return await resolveProviderHookPlugin(params)?.validateReplayTurns?.(params.context);
}
function normalizeProviderToolSchemasWithPlugin(params) {
	return resolveProviderHookPlugin(params)?.normalizeToolSchemas?.(params.context) ?? void 0;
}
function inspectProviderToolSchemasWithPlugin(params) {
	return resolveProviderHookPlugin(params)?.inspectToolSchemas?.(params.context) ?? void 0;
}
function resolveProviderReasoningOutputModeWithPlugin(params) {
	const mode = resolveProviderHookPlugin(params)?.resolveReasoningOutputMode?.(params.context);
	return mode === "native" || mode === "tagged" ? mode : void 0;
}
function resolveProviderStreamFn(params) {
	return resolveProviderRuntimePlugin(params)?.createStreamFn?.(params.context) ?? void 0;
}
function resolveProviderTransportTurnStateWithPlugin(params) {
	return resolveProviderHookPlugin(params)?.resolveTransportTurnState?.(params.context) ?? void 0;
}
function resolveProviderWebSocketSessionPolicyWithPlugin(params) {
	return resolveProviderHookPlugin(params)?.resolveWebSocketSessionPolicy?.(params.context) ?? void 0;
}
async function createProviderEmbeddingProvider(params) {
	return await resolveProviderRuntimePlugin(params)?.createEmbeddingProvider?.(params.context);
}
async function prepareProviderRuntimeAuth(params) {
	return await resolveProviderRuntimePlugin(params)?.prepareRuntimeAuth?.(params.context);
}
async function resolveProviderUsageAuthWithPlugin(params) {
	return await resolveProviderRuntimePlugin(params)?.resolveUsageAuth?.(params.context);
}
async function resolveProviderUsageSnapshotWithPlugin(params) {
	return await resolveProviderRuntimePlugin(params)?.fetchUsageSnapshot?.(params.context);
}
function matchesProviderContextOverflowWithPlugin(params) {
	const plugins = params.provider ? [resolveProviderHookPlugin({
		...params,
		provider: params.provider
	})].filter((plugin) => Boolean(plugin)) : resolveProviderPluginsForHooks(params);
	for (const plugin of plugins) if (plugin.matchesContextOverflowError?.(params.context)) return true;
	return false;
}
function classifyProviderFailoverReasonWithPlugin(params) {
	const plugins = params.provider ? [resolveProviderHookPlugin({
		...params,
		provider: params.provider
	})].filter((plugin) => Boolean(plugin)) : resolveProviderPluginsForHooks(params);
	for (const plugin of plugins) {
		const reason = plugin.classifyFailoverReason?.(params.context);
		if (reason) return reason;
	}
}
function formatProviderAuthProfileApiKeyWithPlugin(params) {
	return resolveProviderRuntimePlugin(params)?.formatApiKey?.(params.context);
}
async function refreshProviderOAuthCredentialWithPlugin(params) {
	return await resolveProviderRuntimePlugin(params)?.refreshOAuth?.(params.context);
}
async function buildProviderAuthDoctorHintWithPlugin(params) {
	return await resolveProviderRuntimePlugin(params)?.buildAuthDoctorHint?.(params.context);
}
function resolveProviderCacheTtlEligibility(params) {
	return resolveProviderRuntimePlugin(params)?.isCacheTtlEligible?.(params.context);
}
function resolveProviderBinaryThinking(params) {
	return resolveProviderRuntimePlugin(params)?.isBinaryThinking?.(params.context);
}
function resolveProviderXHighThinking(params) {
	return resolveProviderRuntimePlugin(params)?.supportsXHighThinking?.(params.context);
}
function resolveProviderThinkingProfile(params) {
	return resolveProviderRuntimePlugin(params)?.resolveThinkingProfile?.(params.context);
}
function resolveProviderDefaultThinkingLevel(params) {
	return resolveProviderRuntimePlugin(params)?.resolveDefaultThinkingLevel?.(params.context);
}
function applyProviderConfigDefaultsWithPlugin(params) {
	const bundledSurface = resolveBundledProviderPolicySurface(params.provider);
	if (bundledSurface?.applyConfigDefaults) return bundledSurface.applyConfigDefaults(params.context) ?? void 0;
	return resolveProviderRuntimePlugin(params)?.applyConfigDefaults?.(params.context) ?? void 0;
}
function resolveProviderModernModelRef(params) {
	return resolveProviderRuntimePlugin(params)?.isModernModelRef?.(params.context);
}
function buildProviderMissingAuthMessageWithPlugin(params) {
	return resolveProviderRuntimePlugin(params)?.buildMissingAuthMessage?.(params.context) ?? void 0;
}
function buildProviderUnknownModelHintWithPlugin(params) {
	return resolveProviderRuntimePlugin(params)?.buildUnknownModelHint?.(params.context) ?? void 0;
}
function resolveProviderSyntheticAuthWithPlugin(params) {
	const providerRefs = resolveProviderHookRefs(params.provider, params.context.providerConfig);
	const discoveryPluginIds = [...new Set(providerRefs.flatMap((provider) => resolveOwningPluginIdsForProvider({
		provider,
		config: params.config,
		workspaceDir: params.workspaceDir,
		env: params.env
	}) ?? []))];
	const discoveryProvider = (discoveryPluginIds.length > 0 ? resolvePluginDiscoveryProvidersRuntime({
		config: params.config,
		workspaceDir: params.workspaceDir,
		env: params.env,
		onlyPluginIds: discoveryPluginIds,
		discoveryEntriesOnly: true
	}) : []).find((provider) => matchesAnyProviderPluginRef(provider, providerRefs));
	if (typeof discoveryProvider?.resolveSyntheticAuth === "function") return discoveryProvider.resolveSyntheticAuth(params.context) ?? void 0;
	const runtimeResolved = resolveProviderRuntimePlugin({
		...params,
		applyAutoEnable: false,
		bundledProviderAllowlistCompat: false,
		bundledProviderVitestCompat: false,
		installBundledRuntimeDeps: false
	})?.resolveSyntheticAuth?.(params.context);
	if (runtimeResolved) return runtimeResolved;
	for (const providerRef of providerRefs) {
		if (normalizeProviderId(providerRef) === normalizeProviderId(params.provider)) continue;
		const runtimeProviderResolved = resolveProviderRuntimePlugin({
			...params,
			provider: providerRef,
			applyAutoEnable: false,
			bundledProviderAllowlistCompat: false,
			bundledProviderVitestCompat: false,
			installBundledRuntimeDeps: false
		})?.resolveSyntheticAuth?.(params.context);
		if (runtimeProviderResolved) return runtimeProviderResolved;
	}
	if (providerRefs.length === 1) return resolvePluginDiscoveryProvidersRuntime({
		config: params.config,
		workspaceDir: params.workspaceDir,
		env: params.env
	}).find((provider) => matchesAnyProviderPluginRef(provider, providerRefs))?.resolveSyntheticAuth?.(params.context);
}
function resolveExternalAuthProfilesWithPlugins(params) {
	const workspaceDir = params.workspaceDir ?? getActivePluginRegistryWorkspaceDirFromState();
	const env = params.env ?? process.env;
	const externalAuthPluginIds = resolveExternalAuthProfileProviderPluginIds({
		config: params.config,
		workspaceDir,
		env
	});
	const declaredPluginIds = new Set(externalAuthPluginIds);
	const fallbackPluginIds = resolveExternalAuthProfileCompatFallbackPluginIds({
		config: params.config,
		workspaceDir,
		env,
		declaredPluginIds
	});
	const pluginIds = [...new Set([...externalAuthPluginIds, ...fallbackPluginIds])].toSorted((left, right) => left.localeCompare(right));
	if (pluginIds.length === 0) return [];
	const matches = [];
	for (const plugin of resolveProviderPluginsForHooks({
		...params,
		workspaceDir,
		env,
		onlyPluginIds: pluginIds
	})) {
		const profiles = plugin.resolveExternalAuthProfiles?.(params.context) ?? plugin.resolveExternalOAuthProfiles?.(params.context);
		if (!profiles || profiles.length === 0) continue;
		const pluginId = plugin.pluginId ?? plugin.id;
		if (!declaredPluginIds.has(pluginId) && !warnedExternalAuthFallbackPluginIds.has(pluginId)) {
			warnedExternalAuthFallbackPluginIds.add(pluginId);
			log.warn(`Provider plugin "${sanitizeForLog(pluginId)}" uses external auth hooks without declaring contracts.externalAuthProviders. This compatibility fallback is deprecated and will be removed in a future release.`);
		}
		matches.push(...profiles);
	}
	return matches;
}
function resolveExternalOAuthProfilesWithPlugins(params) {
	return resolveExternalAuthProfilesWithPlugins(params);
}
function shouldDeferProviderSyntheticProfileAuthWithPlugin(params) {
	const providerRefs = resolveProviderHookRefs(params.provider, params.context.providerConfig);
	for (const providerRef of providerRefs) {
		const resolved = resolveProviderRuntimePlugin({
			...params,
			provider: providerRef
		})?.shouldDeferSyntheticProfileAuth?.(params.context);
		if (resolved !== void 0) return resolved;
	}
}
function resolveProviderBuiltInModelSuppression(params) {
	for (const plugin of resolveProviderPluginsForCatalogHooks(params)) {
		const result = plugin.suppressBuiltInModel?.(params.context);
		if (result?.suppress) return result;
	}
}
async function augmentModelCatalogWithProviderPlugins(params) {
	const supplemental = [];
	for (const plugin of resolveProviderPluginsForCatalogHooks(params)) {
		const next = await plugin.augmentModelCatalog?.(params.context);
		if (!next || next.length === 0) continue;
		supplemental.push(...next);
	}
	return supplemental;
}
//#endregion
export { resolveProviderAuthProfileId as $, resolveProviderConfigApiKeyWithPlugin as A, resolveProviderTransportTurnStateWithPlugin as B, refreshProviderOAuthCredentialWithPlugin as C, resolveProviderBinaryThinking as D, resolveExternalOAuthProfilesWithPlugins as E, resolveProviderStreamFn as F, runProviderDynamicModel as G, resolveProviderUsageSnapshotWithPlugin as H, resolveProviderSyntheticAuthWithPlugin as I, shouldPreferProviderRuntimeResolvedModel as J, sanitizeProviderReplayHistoryWithPlugin as K, resolveProviderSystemPromptContribution as L, resolveProviderModernModelRef as M, resolveProviderReasoningOutputModeWithPlugin as N, resolveProviderBuiltInModelSuppression as O, resolveProviderReplayPolicyWithPlugin as P, prepareProviderExtraParams as Q, resolveProviderTextTransforms as R, prepareProviderRuntimeAuth as S, resolveExternalAuthProfilesWithPlugins as T, resolveProviderWebSocketSessionPolicyWithPlugin as U, resolveProviderUsageAuthWithPlugin as V, resolveProviderXHighThinking as W, validateProviderReplayTurnsWithPlugin as X, transformProviderSystemPrompt as Y, resolveRuntimeTextTransforms as Z, normalizeProviderModelIdWithPlugin as _, applyProviderResolvedTransportWithPlugin as a, normalizeProviderTransportWithPlugin as b, buildProviderMissingAuthMessageWithPlugin as c, clearProviderRuntimeHookCache as d, resolveProviderExtraParamsForTransport as et, createProviderEmbeddingProvider as f, normalizeProviderConfigWithPlugin as g, matchesProviderContextOverflowWithPlugin as h, applyProviderResolvedModelCompatWithPlugins as i, resolveProviderDefaultThinkingLevel as j, resolveProviderCacheTtlEligibility as k, buildProviderUnknownModelHintWithPlugin as l, inspectProviderToolSchemasWithPlugin as m, applyProviderConfigDefaultsWithPlugin as n, resolveProviderRuntimePlugin as nt, augmentModelCatalogWithProviderPlugins as o, formatProviderAuthProfileApiKeyWithPlugin as p, shouldDeferProviderSyntheticProfileAuthWithPlugin as q, applyProviderNativeStreamingUsageCompatWithPlugin as r, wrapProviderStreamFn as rt, buildProviderAuthDoctorHintWithPlugin as s, __testing as t, resolveProviderFollowupFallbackRoute as tt, classifyProviderFailoverReasonWithPlugin as u, normalizeProviderResolvedModelWithPlugin as v, resetProviderRuntimeHookCacheForTest as w, prepareProviderDynamicModel as x, normalizeProviderToolSchemasWithPlugin as y, resolveProviderThinkingProfile as z };
