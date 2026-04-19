import { f as resolvePrimaryStringValue, i as normalizeLowercaseStringOrEmpty, s as normalizeOptionalString } from "./string-coerce-BUSzWgUA.js";
import { t as createSubsystemLogger } from "./subsystem-Cgmckbux.js";
import { r as resolveManifestContractPluginIds } from "./manifest-registry-Bd3A4lqx.js";
import { r as normalizeProviderId } from "./provider-id-KaStHhRz.js";
import { r as DEFAULT_PROVIDER } from "./defaults-CiQa3xnX.js";
import { g as normalizeProviderModelIdWithPlugin } from "./provider-runtime-khVgWetm.js";
import { t as resolveOpenClawAgentDir } from "./agent-paths-JWlHCT48.js";
import { f as modelKey, m as parseModelRef, p as normalizeModelRef } from "./model-selection-cli-_3Gn8Wcd.js";
import { i as buildModelAliasIndex, m as resolveModelRefFromString } from "./model-selection-CTdyYoio.js";
import { t as resolvePluginWebSearchConfig } from "./plugin-web-search-config-zbc1Zmtu.js";
import fs from "node:fs";
import path from "node:path";
//#region src/gateway/model-pricing-cache-state.ts
let cachedPricing = /* @__PURE__ */ new Map();
const WRAPPER_PROVIDERS$1 = new Set([
	"cloudflare-ai-gateway",
	"kilocode",
	"openrouter",
	"vercel-ai-gateway"
]);
function modelPricingCacheKey(provider, model) {
	const providerId = normalizeProviderId(provider);
	const modelId = model.trim();
	if (!providerId || !modelId) return "";
	return normalizeLowercaseStringOrEmpty(modelId).startsWith(`${normalizeLowercaseStringOrEmpty(providerId)}/`) ? modelId : `${providerId}/${modelId}`;
}
function shouldNormalizeCachedPricingLookup(provider) {
	const normalized = normalizeProviderId(provider);
	return normalized === "anthropic" || normalized === "openrouter" || normalized === "xai" || WRAPPER_PROVIDERS$1.has(normalized);
}
function replaceGatewayModelPricingCache(nextPricing, nextCachedAt = Date.now()) {
	cachedPricing = nextPricing;
}
function getCachedGatewayModelPricing(params) {
	const provider = params.provider?.trim();
	const model = params.model?.trim();
	if (!provider || !model) return;
	const key = modelPricingCacheKey(provider, model);
	const direct = key ? cachedPricing.get(key) : void 0;
	if (direct) return direct;
	if (!shouldNormalizeCachedPricingLookup(provider)) return;
	const normalized = normalizeModelRef(provider, model);
	const normalizedKey = modelPricingCacheKey(normalized.provider, normalized.model);
	return normalizedKey ? cachedPricing.get(normalizedKey) : void 0;
}
//#endregion
//#region src/gateway/model-pricing-cache.ts
const OPENROUTER_MODELS_URL = "https://openrouter.ai/api/v1/models";
const CACHE_TTL_MS = 1440 * 6e4;
const FETCH_TIMEOUT_MS = 15e3;
const PROVIDER_ALIAS_TO_OPENROUTER = {
	"google-gemini-cli": "google",
	kimi: "moonshotai",
	"kimi-coding": "moonshotai",
	moonshot: "moonshotai",
	moonshotai: "moonshotai",
	"openai-codex": "openai",
	xai: "x-ai",
	zai: "z-ai"
};
const WRAPPER_PROVIDERS = new Set([
	"cloudflare-ai-gateway",
	"kilocode",
	"openrouter",
	"vercel-ai-gateway"
]);
const log = createSubsystemLogger("gateway").child("model-pricing");
let refreshTimer = null;
let inFlightRefresh = null;
function clearRefreshTimer() {
	if (!refreshTimer) return;
	clearTimeout(refreshTimer);
	refreshTimer = null;
}
function listLikeFallbacks(value) {
	if (!value || typeof value !== "object") return [];
	return Array.isArray(value.fallbacks) ? value.fallbacks.filter((entry) => typeof entry === "string").map((entry) => normalizeOptionalString(entry)).filter((entry) => Boolean(entry)) : [];
}
function parseNumberString(value) {
	if (typeof value === "number" && Number.isFinite(value)) return value;
	if (typeof value !== "string") return null;
	const trimmed = value.trim();
	if (!trimmed) return null;
	const parsed = Number(trimmed);
	return Number.isFinite(parsed) ? parsed : null;
}
function toPricePerMillion(value) {
	if (value === null || value < 0 || !Number.isFinite(value)) return 0;
	return value * 1e6;
}
function parseOpenRouterPricing(value) {
	if (!value || typeof value !== "object") return null;
	const pricing = value;
	const prompt = parseNumberString(pricing.prompt);
	const completion = parseNumberString(pricing.completion);
	if (prompt === null || completion === null) return null;
	return {
		input: toPricePerMillion(prompt),
		output: toPricePerMillion(completion),
		cacheRead: toPricePerMillion(parseNumberString(pricing.input_cache_read)),
		cacheWrite: toPricePerMillion(parseNumberString(pricing.input_cache_write))
	};
}
function canonicalizeOpenRouterProvider(provider) {
	const normalized = normalizeModelRef(provider, "placeholder").provider;
	return PROVIDER_ALIAS_TO_OPENROUTER[normalized] ?? normalized;
}
function canonicalizeOpenRouterLookupId(id) {
	const trimmed = id.trim();
	if (!trimmed) return "";
	const slash = trimmed.indexOf("/");
	if (slash === -1) return trimmed;
	const provider = canonicalizeOpenRouterProvider(trimmed.slice(0, slash));
	let model = trimmed.slice(slash + 1).trim();
	if (!model) return provider;
	if (provider === "anthropic") model = model.replace(/^claude-(\d+)\.(\d+)-/u, "claude-$1-$2-").replace(/^claude-([a-z]+)-(\d+)\.(\d+)$/u, "claude-$1-$2-$3");
	model = normalizeProviderModelIdWithPlugin({
		provider,
		context: {
			provider,
			modelId: model
		}
	}) ?? model;
	return `${provider}/${model}`;
}
function buildOpenRouterExactCandidates(ref, seen = /* @__PURE__ */ new Set()) {
	const refKey = modelKey(ref.provider, ref.model);
	if (seen.has(refKey)) return [];
	const nextSeen = new Set(seen);
	nextSeen.add(refKey);
	const candidates = /* @__PURE__ */ new Set();
	const canonicalProvider = canonicalizeOpenRouterProvider(ref.provider);
	const canonicalFullId = canonicalizeOpenRouterLookupId(modelKey(canonicalProvider, ref.model));
	if (canonicalFullId) candidates.add(canonicalFullId);
	if (canonicalProvider === "anthropic") {
		const slash = canonicalFullId.indexOf("/");
		const dotted = (slash === -1 ? canonicalFullId : canonicalFullId.slice(slash + 1)).replace(/^claude-(\d+)-(\d+)-/u, "claude-$1.$2-").replace(/^claude-([a-z]+)-(\d+)-(\d+)$/u, "claude-$1-$2.$3");
		candidates.add(`${canonicalProvider}/${dotted}`);
	}
	if (WRAPPER_PROVIDERS.has(ref.provider) && ref.model.includes("/")) {
		const nestedRef = parseModelRef(ref.model, DEFAULT_PROVIDER);
		if (nestedRef) for (const candidate of buildOpenRouterExactCandidates(nestedRef, nextSeen)) candidates.add(candidate);
	}
	return Array.from(candidates).filter(Boolean);
}
function addResolvedModelRef(params) {
	const raw = params.raw?.trim();
	if (!raw) return;
	const resolved = resolveModelRefFromString({
		raw,
		defaultProvider: DEFAULT_PROVIDER,
		aliasIndex: params.aliasIndex
	});
	if (!resolved) return;
	const normalized = normalizeModelRef(resolved.ref.provider, resolved.ref.model);
	params.refs.set(modelKey(normalized.provider, normalized.model), normalized);
}
function addModelListLike(params) {
	addResolvedModelRef({
		raw: resolvePrimaryStringValue(params.value),
		aliasIndex: params.aliasIndex,
		refs: params.refs
	});
	for (const fallback of listLikeFallbacks(params.value)) addResolvedModelRef({
		raw: fallback,
		aliasIndex: params.aliasIndex,
		refs: params.refs
	});
}
function addProviderModelPair(params) {
	const provider = params.provider?.trim();
	const model = params.model?.trim();
	if (!provider || !model) return;
	const normalized = normalizeModelRef(provider, model);
	params.refs.set(modelKey(normalized.provider, normalized.model), normalized);
}
function addConfiguredWebSearchPluginModels(params) {
	for (const pluginId of resolveManifestContractPluginIds({
		contract: "webSearchProviders",
		config: params.config
	})) addResolvedModelRef({
		raw: resolvePluginWebSearchConfig(params.config, pluginId)?.model,
		aliasIndex: params.aliasIndex,
		refs: params.refs
	});
}
function collectConfiguredModelPricingRefs(config) {
	const refs = /* @__PURE__ */ new Map();
	const aliasIndex = buildModelAliasIndex({
		cfg: config,
		defaultProvider: DEFAULT_PROVIDER
	});
	addModelListLike({
		value: config.agents?.defaults?.model,
		aliasIndex,
		refs
	});
	addModelListLike({
		value: config.agents?.defaults?.imageModel,
		aliasIndex,
		refs
	});
	addModelListLike({
		value: config.agents?.defaults?.pdfModel,
		aliasIndex,
		refs
	});
	addResolvedModelRef({
		raw: config.agents?.defaults?.compaction?.model,
		aliasIndex,
		refs
	});
	addResolvedModelRef({
		raw: config.agents?.defaults?.heartbeat?.model,
		aliasIndex,
		refs
	});
	addModelListLike({
		value: config.tools?.subagents?.model,
		aliasIndex,
		refs
	});
	addResolvedModelRef({
		raw: config.messages?.tts?.summaryModel,
		aliasIndex,
		refs
	});
	addResolvedModelRef({
		raw: config.hooks?.gmail?.model,
		aliasIndex,
		refs
	});
	for (const agent of config.agents?.list ?? []) {
		addModelListLike({
			value: agent.model,
			aliasIndex,
			refs
		});
		addModelListLike({
			value: agent.subagents?.model,
			aliasIndex,
			refs
		});
		addResolvedModelRef({
			raw: agent.heartbeat?.model,
			aliasIndex,
			refs
		});
	}
	for (const mapping of config.hooks?.mappings ?? []) addResolvedModelRef({
		raw: mapping.model,
		aliasIndex,
		refs
	});
	for (const channelMap of Object.values(config.channels?.modelByChannel ?? {})) {
		if (!channelMap || typeof channelMap !== "object") continue;
		for (const raw of Object.values(channelMap)) addResolvedModelRef({
			raw: typeof raw === "string" ? raw : void 0,
			aliasIndex,
			refs
		});
	}
	addConfiguredWebSearchPluginModels({
		config,
		aliasIndex,
		refs
	});
	for (const entry of config.tools?.media?.models ?? []) addProviderModelPair({
		provider: entry.provider,
		model: entry.model,
		refs
	});
	for (const entry of config.tools?.media?.image?.models ?? []) addProviderModelPair({
		provider: entry.provider,
		model: entry.model,
		refs
	});
	for (const entry of config.tools?.media?.audio?.models ?? []) addProviderModelPair({
		provider: entry.provider,
		model: entry.model,
		refs
	});
	for (const entry of config.tools?.media?.video?.models ?? []) addProviderModelPair({
		provider: entry.provider,
		model: entry.model,
		refs
	});
	return Array.from(refs.values());
}
async function fetchOpenRouterPricingCatalog(fetchImpl) {
	const response = await fetchImpl(OPENROUTER_MODELS_URL, {
		headers: { Accept: "application/json" },
		signal: AbortSignal.timeout(FETCH_TIMEOUT_MS)
	});
	if (!response.ok) throw new Error(`OpenRouter /models failed: HTTP ${response.status}`);
	const payload = await response.json();
	const entries = Array.isArray(payload.data) ? payload.data : [];
	const catalog = /* @__PURE__ */ new Map();
	for (const entry of entries) {
		const obj = entry;
		const id = normalizeOptionalString(obj.id) ?? "";
		const pricing = parseOpenRouterPricing(obj.pricing);
		if (!id || !pricing) continue;
		catalog.set(id, {
			id,
			pricing
		});
	}
	return catalog;
}
function resolveCatalogPricingForRef(params) {
	for (const candidate of buildOpenRouterExactCandidates(params.ref)) {
		const exact = params.catalogById.get(candidate);
		if (exact) return exact.pricing;
	}
	for (const candidate of buildOpenRouterExactCandidates(params.ref)) {
		const normalized = canonicalizeOpenRouterLookupId(candidate);
		if (!normalized) continue;
		const match = params.catalogByNormalizedId.get(normalized);
		if (match) return match.pricing;
	}
}
function scheduleRefresh(params) {
	clearRefreshTimer();
	refreshTimer = setTimeout(() => {
		refreshTimer = null;
		refreshGatewayModelPricingCache(params).catch((error) => {
			log.warn(`pricing refresh failed: ${String(error)}`);
		});
	}, CACHE_TTL_MS);
}
async function refreshGatewayModelPricingCache(params) {
	if (inFlightRefresh) return await inFlightRefresh;
	const fetchImpl = params.fetchImpl ?? fetch;
	inFlightRefresh = (async () => {
		const refs = collectConfiguredModelPricingRefs(params.config);
		if (refs.length === 0) {
			replaceGatewayModelPricingCache(/* @__PURE__ */ new Map());
			clearRefreshTimer();
			return;
		}
		const catalogById = await fetchOpenRouterPricingCatalog(fetchImpl);
		const catalogByNormalizedId = /* @__PURE__ */ new Map();
		for (const entry of catalogById.values()) {
			const normalizedId = canonicalizeOpenRouterLookupId(entry.id);
			if (!normalizedId || catalogByNormalizedId.has(normalizedId)) continue;
			catalogByNormalizedId.set(normalizedId, entry);
		}
		const nextPricing = /* @__PURE__ */ new Map();
		for (const ref of refs) {
			const pricing = resolveCatalogPricingForRef({
				ref,
				catalogById,
				catalogByNormalizedId
			});
			if (!pricing) continue;
			nextPricing.set(modelKey(ref.provider, ref.model), pricing);
		}
		replaceGatewayModelPricingCache(nextPricing);
		scheduleRefresh({
			config: params.config,
			fetchImpl
		});
	})();
	try {
		await inFlightRefresh;
	} finally {
		inFlightRefresh = null;
	}
}
function startGatewayModelPricingRefresh(params) {
	refreshGatewayModelPricingCache(params).catch((error) => {
		log.warn(`pricing bootstrap failed: ${String(error)}`);
	});
	return () => {
		clearRefreshTimer();
	};
}
//#endregion
//#region src/utils/usage-format.ts
let modelsJsonCostCache = null;
function formatTokenCount(value) {
	if (value === void 0 || !Number.isFinite(value)) return "0";
	const safe = Math.max(0, value);
	if (safe >= 1e6) return `${(safe / 1e6).toFixed(1)}m`;
	if (safe >= 1e3) {
		const precision = safe >= 1e4 ? 0 : 1;
		const formattedThousands = (safe / 1e3).toFixed(precision);
		if (Number(formattedThousands) >= 1e3) return `${(safe / 1e6).toFixed(1)}m`;
		return `${formattedThousands}k`;
	}
	return String(Math.round(safe));
}
function formatUsd(value) {
	if (value === void 0 || !Number.isFinite(value)) return;
	if (value >= 1) return `$${value.toFixed(2)}`;
	if (value >= .01) return `$${value.toFixed(2)}`;
	return `$${value.toFixed(4)}`;
}
function toResolvedModelKey(params) {
	const provider = normalizeOptionalString(params.provider);
	const model = normalizeOptionalString(params.model);
	if (!provider || !model) return null;
	const normalized = normalizeModelRef(provider, model, { allowPluginNormalization: params.allowPluginNormalization });
	return modelKey(normalized.provider, normalized.model);
}
function toDirectModelKey(params) {
	const provider = normalizeProviderId(normalizeOptionalString(params.provider) ?? "");
	const model = normalizeOptionalString(params.model);
	if (!provider || !model) return null;
	return modelKey(provider, model);
}
function shouldUseNormalizedCostLookup(params) {
	const provider = normalizeProviderId(normalizeOptionalString(params.provider) ?? "");
	const model = normalizeOptionalString(params.model) ?? "";
	if (!provider || !model) return false;
	return provider === "anthropic" || provider === "openrouter" || provider === "vercel-ai-gateway";
}
function buildProviderCostIndex(providers, options) {
	const entries = /* @__PURE__ */ new Map();
	if (!providers) return entries;
	for (const [providerKey, providerConfig] of Object.entries(providers)) {
		const normalizedProvider = normalizeProviderId(providerKey);
		for (const model of providerConfig?.models ?? []) {
			const normalized = normalizeModelRef(normalizedProvider, model.id, { allowPluginNormalization: options?.allowPluginNormalization });
			entries.set(modelKey(normalized.provider, normalized.model), model.cost);
		}
	}
	return entries;
}
function loadModelsJsonCostIndex(options) {
	const useRawEntries = options?.allowPluginNormalization === false;
	const modelsPath = path.join(resolveOpenClawAgentDir(), "models.json");
	try {
		const stat = fs.statSync(modelsPath);
		if (!modelsJsonCostCache || modelsJsonCostCache.path !== modelsPath || modelsJsonCostCache.mtimeMs !== stat.mtimeMs) {
			const parsed = JSON.parse(fs.readFileSync(modelsPath, "utf8"));
			modelsJsonCostCache = {
				path: modelsPath,
				mtimeMs: stat.mtimeMs,
				providers: parsed.providers,
				normalizedEntries: null,
				rawEntries: null
			};
		}
		if (useRawEntries) {
			modelsJsonCostCache.rawEntries ??= buildProviderCostIndex(modelsJsonCostCache.providers, { allowPluginNormalization: false });
			return modelsJsonCostCache.rawEntries;
		}
		modelsJsonCostCache.normalizedEntries ??= buildProviderCostIndex(modelsJsonCostCache.providers);
		return modelsJsonCostCache.normalizedEntries;
	} catch {
		const empty = /* @__PURE__ */ new Map();
		modelsJsonCostCache = {
			path: modelsPath,
			mtimeMs: -1,
			providers: void 0,
			normalizedEntries: empty,
			rawEntries: empty
		};
		return empty;
	}
}
function findConfiguredProviderCost(params) {
	const key = toResolvedModelKey(params);
	if (!key) return;
	return buildProviderCostIndex(params.config?.models?.providers, { allowPluginNormalization: params.allowPluginNormalization }).get(key);
}
function resolveModelCostConfig(params) {
	const rawKey = toDirectModelKey(params);
	if (!rawKey) return;
	const rawModelsJsonCost = loadModelsJsonCostIndex({ allowPluginNormalization: false }).get(rawKey);
	if (rawModelsJsonCost) return rawModelsJsonCost;
	const rawConfiguredCost = findConfiguredProviderCost({
		...params,
		allowPluginNormalization: false
	});
	if (rawConfiguredCost) return rawConfiguredCost;
	if (params.allowPluginNormalization === false) return;
	if (shouldUseNormalizedCostLookup(params)) {
		const key = toResolvedModelKey(params);
		if (key && key !== rawKey) {
			const modelsJsonCost = loadModelsJsonCostIndex().get(key);
			if (modelsJsonCost) return modelsJsonCost;
			const configuredCost = findConfiguredProviderCost(params);
			if (configuredCost) return configuredCost;
		}
	}
	return getCachedGatewayModelPricing(params);
}
const toNumber = (value) => typeof value === "number" && Number.isFinite(value) ? value : 0;
function estimateUsageCost(params) {
	const usage = params.usage;
	const cost = params.cost;
	if (!usage || !cost) return;
	const input = toNumber(usage.input);
	const output = toNumber(usage.output);
	const cacheRead = toNumber(usage.cacheRead);
	const cacheWrite = toNumber(usage.cacheWrite);
	const total = input * cost.input + output * cost.output + cacheRead * cost.cacheRead + cacheWrite * cost.cacheWrite;
	if (!Number.isFinite(total)) return;
	return total / 1e6;
}
function __resetUsageFormatCachesForTest() {
	modelsJsonCostCache = null;
}
//#endregion
export { resolveModelCostConfig as a, formatUsd as i, estimateUsageCost as n, startGatewayModelPricingRefresh as o, formatTokenCount as r, __resetUsageFormatCachesForTest as t };
