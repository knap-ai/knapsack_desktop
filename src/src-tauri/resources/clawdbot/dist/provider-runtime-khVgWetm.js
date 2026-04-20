import { s as normalizeOptionalString } from "./string-coerce-BUSzWgUA.js";
import { r as resolvePluginCacheInputs } from "./discovery-DGQFjH8F.js";
import { Q as resolveBundledProviderPolicySurface } from "./io-5pxHCi7V.js";
import { r as normalizeProviderId } from "./provider-id-KaStHhRz.js";
import { n as getActivePluginRegistryWorkspaceDirFromState } from "./runtime-state-2uqC88Ju.js";
import { n as mergePluginTextTransforms, t as applyPluginTextReplacements } from "./plugin-text-transforms-BQzFygd9.js";
import { a as normalizePluginIdScope, o as serializePluginIdScope } from "./channel-configured-BTEJAT4e.js";
import { a as resolveCatalogHookProviderPluginIds } from "./plugin-auto-enable-BbVfCcz-.js";
import { n as resolvePluginProviders, t as isPluginProvidersLoadInFlight } from "./providers.runtime-Qry7Vql_.js";
import { createRequire } from "node:module";
//#region src/plugins/provider-hook-runtime.ts
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
	const onlyPluginIds = normalizePluginIdScope(params.onlyPluginIds);
	return `${roots.workspace ?? ""}::${roots.global}::${roots.stock ?? ""}::${JSON.stringify(params.config ?? null)}::${serializePluginIdScope(onlyPluginIds)}::${JSON.stringify(params.providerRefs ?? [])}`;
}
function clearProviderRuntimeHookCache() {
	cachedHookProvidersWithoutConfig = /* @__PURE__ */ new WeakMap();
	cachedHookProvidersByConfig = /* @__PURE__ */ new WeakMap();
}
function resetProviderRuntimeHookCacheForTest() {
	clearProviderRuntimeHookCache();
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
		bundledProviderAllowlistCompat: true,
		bundledProviderVitestCompat: true
	})) return [];
	const resolved = resolvePluginProviders({
		...params,
		workspaceDir,
		env,
		activate: false,
		cache: false,
		bundledProviderAllowlistCompat: true,
		bundledProviderVitestCompat: true
	});
	cacheBucket.set(cacheKey, resolved);
	return resolved;
}
function resolveProviderRuntimePlugin(params) {
	return resolveProviderPluginsForHooks({
		config: params.config,
		workspaceDir: params.workspaceDir ?? getActivePluginRegistryWorkspaceDirFromState(),
		env: params.env,
		providerRefs: [params.provider]
	}).find((plugin) => matchesProviderId(plugin, params.provider));
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
function wrapProviderStreamFn(params) {
	return resolveProviderHookPlugin(params)?.wrapStreamFn?.(params.context) ?? void 0;
}
//#endregion
//#region src/plugins/text-transforms.runtime.ts
const require = createRequire(import.meta.url);
const RUNTIME_MODULE_CANDIDATES = ["./runtime.js", "./runtime.ts"];
let pluginRuntimeModule;
function loadPluginRuntime() {
	if (pluginRuntimeModule) return pluginRuntimeModule;
	for (const candidate of RUNTIME_MODULE_CANDIDATES) try {
		pluginRuntimeModule = require(candidate);
		return pluginRuntimeModule;
	} catch {}
	return null;
}
function resolveRuntimeTextTransforms() {
	const registry = loadPluginRuntime()?.getActivePluginRegistry();
	return mergePluginTextTransforms(...Array.isArray(registry?.textTransforms) ? registry.textTransforms.map((entry) => entry.transforms) : []);
}
//#endregion
//#region src/plugins/provider-runtime.ts
const __testing = { ...__testing$1 };
function resolveProviderPluginsForCatalogHooks(params) {
	const workspaceDir = params.workspaceDir ?? getActivePluginRegistryWorkspaceDirFromState();
	const onlyPluginIds = resolveCatalogHookProviderPluginIds({
		config: params.config,
		workspaceDir,
		env: params.env
	});
	if (onlyPluginIds.length === 0) return [];
	return resolveProviderPluginsForHooks({
		...params,
		workspaceDir,
		onlyPluginIds
	});
}
function runProviderDynamicModel(params) {
	return resolveProviderRuntimePlugin(params)?.resolveDynamicModel?.(params.context) ?? void 0;
}
function resolveProviderSystemPromptContribution(params) {
	return resolveProviderRuntimePlugin(params)?.resolveSystemPromptContribution?.(params.context) ?? void 0;
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
	return normalizeOptionalString(resolveProviderHookPlugin(params)?.normalizeModelId?.(params.context));
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
	const matchedPlugin = resolveProviderHookPlugin(params);
	const normalizedMatched = matchedPlugin?.normalizeConfig?.(params.context);
	if (normalizedMatched && hasConfigChange(normalizedMatched)) return normalizedMatched;
	for (const candidate of resolveProviderPluginsForHooks(params)) {
		if (!candidate.normalizeConfig || candidate === matchedPlugin) continue;
		const normalized = candidate.normalizeConfig(params.context);
		if (normalized && hasConfigChange(normalized)) return normalized;
	}
}
function applyProviderNativeStreamingUsageCompatWithPlugin(params) {
	return resolveProviderHookPlugin(params)?.applyNativeStreamingUsageCompat?.(params.context) ?? void 0;
}
function resolveProviderConfigApiKeyWithPlugin(params) {
	const bundledSurface = resolveBundledProviderPolicySurface(params.provider);
	if (bundledSurface?.resolveConfigApiKey) return normalizeOptionalString(bundledSurface.resolveConfigApiKey(params.context));
	return normalizeOptionalString(resolveProviderHookPlugin(params)?.resolveConfigApiKey?.(params.context));
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
	return resolveProviderRuntimePlugin(params)?.resolveSyntheticAuth?.(params.context) ?? void 0;
}
function resolveExternalAuthProfilesWithPlugins(params) {
	const matches = [];
	for (const plugin of resolveProviderPluginsForHooks(params)) {
		const profiles = plugin.resolveExternalAuthProfiles?.(params.context) ?? plugin.resolveExternalOAuthProfiles?.(params.context);
		if (!profiles || profiles.length === 0) continue;
		matches.push(...profiles);
	}
	return matches;
}
function resolveExternalOAuthProfilesWithPlugins(params) {
	return resolveExternalAuthProfilesWithPlugins(params);
}
function shouldDeferProviderSyntheticProfileAuthWithPlugin(params) {
	return resolveProviderRuntimePlugin(params)?.shouldDeferSyntheticProfileAuth?.(params.context) ?? void 0;
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
export { wrapProviderStreamFn as $, resolveProviderModernModelRef as A, resolveProviderWebSocketSessionPolicyWithPlugin as B, resolveExternalAuthProfilesWithPlugins as C, resolveProviderCacheTtlEligibility as D, resolveProviderBuiltInModelSuppression as E, resolveProviderSystemPromptContribution as F, shouldPreferProviderRuntimeResolvedModel as G, runProviderDynamicModel as H, resolveProviderTextTransforms as I, resolveRuntimeTextTransforms as J, transformProviderSystemPrompt as K, resolveProviderTransportTurnStateWithPlugin as L, resolveProviderReplayPolicyWithPlugin as M, resolveProviderStreamFn as N, resolveProviderConfigApiKeyWithPlugin as O, resolveProviderSyntheticAuthWithPlugin as P, resolveProviderRuntimePlugin as Q, resolveProviderUsageAuthWithPlugin as R, refreshProviderOAuthCredentialWithPlugin as S, resolveProviderBinaryThinking as T, sanitizeProviderReplayHistoryWithPlugin as U, resolveProviderXHighThinking as V, shouldDeferProviderSyntheticProfileAuthWithPlugin as W, prepareProviderExtraParams as X, clearProviderRuntimeHookCache as Y, resetProviderRuntimeHookCacheForTest as Z, normalizeProviderResolvedModelWithPlugin as _, applyProviderResolvedTransportWithPlugin as a, prepareProviderDynamicModel as b, buildProviderMissingAuthMessageWithPlugin as c, createProviderEmbeddingProvider as d, formatProviderAuthProfileApiKeyWithPlugin as f, normalizeProviderModelIdWithPlugin as g, normalizeProviderConfigWithPlugin as h, applyProviderResolvedModelCompatWithPlugins as i, resolveProviderReasoningOutputModeWithPlugin as j, resolveProviderDefaultThinkingLevel as k, buildProviderUnknownModelHintWithPlugin as l, matchesProviderContextOverflowWithPlugin as m, applyProviderConfigDefaultsWithPlugin as n, augmentModelCatalogWithProviderPlugins as o, inspectProviderToolSchemasWithPlugin as p, validateProviderReplayTurnsWithPlugin as q, applyProviderNativeStreamingUsageCompatWithPlugin as r, buildProviderAuthDoctorHintWithPlugin as s, __testing as t, classifyProviderFailoverReasonWithPlugin as u, normalizeProviderToolSchemasWithPlugin as v, resolveExternalOAuthProfilesWithPlugins as w, prepareProviderRuntimeAuth as x, normalizeProviderTransportWithPlugin as y, resolveProviderUsageSnapshotWithPlugin as z };
