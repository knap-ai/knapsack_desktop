import { r as normalizeProviderId } from "./provider-id-CTiEzT1T.js";
import { a as resolvePluginCacheInputs } from "./manifest-registry-BSmqODu2.js";
import { i as resolveOwningPluginIdsForProvider, n as resolveCatalogHookProviderPluginIds } from "./providers-4eDlTtuF.js";
import { t as resolvePluginProviders } from "./providers.runtime-DfKoBqxo.js";
//#region src/plugins/provider-runtime.ts
function matchesProviderId(provider, providerId) {
	const normalized = normalizeProviderId(providerId);
	if (!normalized) return false;
	if (normalizeProviderId(provider.id) === normalized) return true;
	return [...provider.aliases ?? [], ...provider.hookAliases ?? []].some((alias) => normalizeProviderId(alias) === normalized);
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
	return `${roots.workspace ?? ""}::${roots.global}::${roots.stock ?? ""}::${JSON.stringify(params.config ?? null)}::${JSON.stringify(params.onlyPluginIds ?? [])}`;
}
function clearProviderRuntimeHookCache() {
	cachedHookProvidersWithoutConfig = /* @__PURE__ */ new WeakMap();
	cachedHookProvidersByConfig = /* @__PURE__ */ new WeakMap();
}
function resetProviderRuntimeHookCacheForTest() {
	clearProviderRuntimeHookCache();
}
function resolveProviderPluginsForHooks(params) {
	const env = params.env ?? process.env;
	const cacheBucket = resolveHookProviderCacheBucket({
		config: params.config,
		env
	});
	const cacheKey = buildHookProviderCacheKey({
		config: params.config,
		workspaceDir: params.workspaceDir,
		onlyPluginIds: params.onlyPluginIds,
		env
	});
	const cached = cacheBucket.get(cacheKey);
	if (cached) return cached;
	const resolved = resolvePluginProviders({
		...params,
		env,
		activate: false,
		cache: false,
		bundledProviderAllowlistCompat: true,
		bundledProviderVitestCompat: true
	});
	cacheBucket.set(cacheKey, resolved);
	return resolved;
}
function resolveProviderPluginsForCatalogHooks(params) {
	const onlyPluginIds = resolveCatalogHookProviderPluginIds({
		config: params.config,
		workspaceDir: params.workspaceDir,
		env: params.env
	});
	if (onlyPluginIds.length === 0) return [];
	return resolveProviderPluginsForHooks({
		...params,
		onlyPluginIds
	});
}
function resolveProviderRuntimePlugin(params) {
	const owningPluginIds = resolveOwningPluginIdsForProvider({
		provider: params.provider,
		config: params.config,
		workspaceDir: params.workspaceDir,
		env: params.env
	});
	if (!owningPluginIds || owningPluginIds.length === 0) return;
	return resolveProviderPluginsForHooks({
		...params,
		onlyPluginIds: owningPluginIds
	}).find((plugin) => matchesProviderId(plugin, params.provider));
}
function runProviderDynamicModel(params) {
	return resolveProviderRuntimePlugin(params)?.resolveDynamicModel?.(params.context) ?? void 0;
}
async function prepareProviderDynamicModel(params) {
	await resolveProviderRuntimePlugin(params)?.prepareDynamicModel?.(params.context);
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
function resolveProviderHookPlugin(params) {
	return resolveProviderRuntimePlugin(params) ?? resolveProviderPluginsForHooks({
		config: params.config,
		workspaceDir: params.workspaceDir,
		env: params.env
	}).find((candidate) => matchesProviderId(candidate, params.provider));
}
function normalizeProviderModelIdWithPlugin(params) {
	const trimmed = (resolveProviderHookPlugin(params)?.normalizeModelId?.(params.context))?.trim();
	return trimmed ? trimmed : void 0;
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
	return resolveProviderHookPlugin(params)?.normalizeConfig?.(params.context) ?? void 0;
}
function applyProviderNativeStreamingUsageCompatWithPlugin(params) {
	return resolveProviderHookPlugin(params)?.applyNativeStreamingUsageCompat?.(params.context) ?? void 0;
}
function resolveProviderConfigApiKeyWithPlugin(params) {
	const trimmed = (resolveProviderHookPlugin(params)?.resolveConfigApiKey?.(params.context))?.trim();
	return trimmed ? trimmed : void 0;
}
function resolveProviderCapabilitiesWithPlugin(params) {
	return resolveProviderRuntimePlugin(params)?.capabilities;
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
function resolveProviderReasoningOutputModeWithPlugin(params) {
	const mode = resolveProviderHookPlugin(params)?.resolveReasoningOutputMode?.(params.context);
	return mode === "native" || mode === "tagged" ? mode : void 0;
}
function prepareProviderExtraParams(params) {
	return resolveProviderRuntimePlugin(params)?.prepareExtraParams?.(params.context) ?? void 0;
}
function resolveProviderStreamFn(params) {
	return resolveProviderRuntimePlugin(params)?.createStreamFn?.(params.context) ?? void 0;
}
function wrapProviderStreamFn(params) {
	return resolveProviderRuntimePlugin(params)?.wrapStreamFn?.(params.context) ?? void 0;
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
function resolveProviderDefaultThinkingLevel(params) {
	return resolveProviderRuntimePlugin(params)?.resolveDefaultThinkingLevel?.(params.context);
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
	return resolveProviderRuntimePlugin(params)?.resolveSyntheticAuth?.(params.context) ?? void 0;
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
export { resolveProviderRuntimePlugin as A, resolveProviderCacheTtlEligibility as C, resolveProviderModernModelRef as D, resolveProviderDefaultThinkingLevel as E, resolveProviderXHighThinking as F, runProviderDynamicModel as I, sanitizeProviderReplayHistoryWithPlugin as L, resolveProviderSyntheticAuthWithPlugin as M, resolveProviderUsageAuthWithPlugin as N, resolveProviderReasoningOutputModeWithPlugin as O, resolveProviderUsageSnapshotWithPlugin as P, validateProviderReplayTurnsWithPlugin as R, resolveProviderBuiltInModelSuppression as S, resolveProviderConfigApiKeyWithPlugin as T, prepareProviderExtraParams as _, buildProviderAuthDoctorHintWithPlugin as a, resetProviderRuntimeHookCacheForTest as b, clearProviderRuntimeHookCache as c, normalizeProviderConfigWithPlugin as d, normalizeProviderModelIdWithPlugin as f, prepareProviderDynamicModel as g, normalizeProviderTransportWithPlugin as h, augmentModelCatalogWithProviderPlugins as i, resolveProviderStreamFn as j, resolveProviderReplayPolicyWithPlugin as k, createProviderEmbeddingProvider as l, normalizeProviderToolSchemasWithPlugin as m, applyProviderResolvedModelCompatWithPlugins as n, buildProviderMissingAuthMessageWithPlugin as o, normalizeProviderResolvedModelWithPlugin as p, applyProviderResolvedTransportWithPlugin as r, buildProviderUnknownModelHintWithPlugin as s, applyProviderNativeStreamingUsageCompatWithPlugin as t, formatProviderAuthProfileApiKeyWithPlugin as u, prepareProviderRuntimeAuth as v, resolveProviderCapabilitiesWithPlugin as w, resolveProviderBinaryThinking as x, refreshProviderOAuthCredentialWithPlugin as y, wrapProviderStreamFn as z };
