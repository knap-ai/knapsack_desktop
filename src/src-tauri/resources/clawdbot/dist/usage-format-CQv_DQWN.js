import { a as normalizeLowercaseStringOrEmpty, c as normalizeOptionalString, p as resolvePrimaryStringValue } from "./string-coerce-C1IzJjqi.js";
import { t as createSubsystemLogger } from "./subsystem-CWI_MDy_.js";
import { r as resolveManifestContractPluginIds } from "./manifest-registry-pYrbrdHJ.js";
import { r as normalizeProviderId } from "./provider-id-BLh32HP1.js";
import { r as DEFAULT_PROVIDER } from "./defaults-DM8yIn8C.js";
import { g as normalizeProviderModelIdWithPlugin } from "./provider-runtime-C1HXSRlX.js";
import { t as resolveOpenClawAgentDir } from "./agent-paths-Df60yWjf.js";
import { b as normalizeModelRef, h as resolveModelRefFromString, i as buildModelAliasIndex, x as parseModelRef, y as modelKey } from "./model-selection-shared-grYiFZof.js";
import "./model-selection-hTT37jzm.js";
import { t as resolvePluginWebSearchConfig } from "./plugin-web-search-config-D2QHOU-p.js";
import fs from "node:fs";
import path from "node:path";
//#region src/gateway/model-pricing-cache-state.ts
let cachedPricing = /* @__PURE__ */ new Map();
let cachedAt = 0;
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
	cachedAt = nextCachedAt;
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
function getGatewayModelPricingCacheMeta() {
	return {
		cachedAt,
		ttlMs: 0,
		size: cachedPricing.size
	};
}
//#endregion
//#region src/gateway/model-pricing-cache.ts
const OPENROUTER_MODELS_URL = "https://openrouter.ai/api/v1/models";
const LITELLM_PRICING_URL = "https://raw.githubusercontent.com/BerriAI/litellm/main/model_prices_and_context_window.json";
const CACHE_TTL_MS = 1440 * 6e4;
const FETCH_TIMEOUT_MS = 3e4;
const MAX_PRICING_CATALOG_BYTES = 5 * 1024 * 1024;
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
function formatTimeoutSeconds(timeoutMs) {
	const seconds = timeoutMs / 1e3;
	return Number.isInteger(seconds) ? `${seconds}s` : `${seconds.toFixed(1)}s`;
}
function readErrorName(error) {
	return error && typeof error === "object" && "name" in error ? String(error.name) : void 0;
}
function isTimeoutError(error) {
	if (readErrorName(error) === "TimeoutError") return true;
	return /\bTimeoutError\b/u.test(String(error));
}
function formatPricingFetchFailure(source, error) {
	if (isTimeoutError(error)) return `${source} pricing fetch failed (timeout ${formatTimeoutSeconds(FETCH_TIMEOUT_MS)}): ${String(error)}`;
	return `${source} pricing fetch failed: ${String(error)}`;
}
function toPricePerMillion(value) {
	if (value === null || value < 0 || !Number.isFinite(value)) return 0;
	const scaled = value * 1e6;
	return Number.isFinite(scaled) ? scaled : 0;
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
async function readPricingJsonObject(response, source) {
	const contentLength = parseNumberString(response.headers.get("content-length"));
	if (contentLength !== null && contentLength > MAX_PRICING_CATALOG_BYTES) throw new Error(`${source} pricing response too large: ${contentLength} bytes`);
	const buffer = await response.arrayBuffer();
	if (buffer.byteLength > MAX_PRICING_CATALOG_BYTES) throw new Error(`${source} pricing response too large: ${buffer.byteLength} bytes`);
	const payload = JSON.parse(Buffer.from(buffer).toString("utf8"));
	if (!payload || typeof payload !== "object" || Array.isArray(payload)) throw new Error(`${source} pricing response is not a JSON object`);
	return payload;
}
function parseLiteLLMTieredPricing(tiers) {
	if (!Array.isArray(tiers) || tiers.length === 0) return;
	const result = [];
	for (const raw of tiers) {
		if (!raw || typeof raw !== "object") continue;
		const tier = raw;
		const inputPerToken = parseNumberString(tier.input_cost_per_token);
		const outputPerToken = parseNumberString(tier.output_cost_per_token);
		if (inputPerToken === null || outputPerToken === null) continue;
		const range = tier.range;
		if (!Array.isArray(range) || range.length < 1) continue;
		const start = parseNumberString(range[0]);
		if (start === null) continue;
		const rawEnd = range.length >= 2 ? parseNumberString(range[1]) : null;
		const end = rawEnd === null || rawEnd <= start ? Infinity : rawEnd;
		if (!Number.isFinite(inputPerToken) || !Number.isFinite(outputPerToken) || inputPerToken < 0 || outputPerToken < 0) continue;
		result.push({
			input: toPricePerMillion(inputPerToken),
			output: toPricePerMillion(outputPerToken),
			cacheRead: toPricePerMillion(parseNumberString(tier.cache_read_input_token_cost)),
			cacheWrite: toPricePerMillion(parseNumberString(tier.cache_creation_input_token_cost)),
			range: [start, end]
		});
	}
	return result.length > 0 ? result.toSorted((a, b) => a.range[0] - b.range[0]) : void 0;
}
function parseLiteLLMPricing(entry) {
	const inputPerToken = parseNumberString(entry.input_cost_per_token);
	const outputPerToken = parseNumberString(entry.output_cost_per_token);
	if (inputPerToken === null || outputPerToken === null) return null;
	const pricing = {
		input: toPricePerMillion(inputPerToken),
		output: toPricePerMillion(outputPerToken),
		cacheRead: toPricePerMillion(parseNumberString(entry.cache_read_input_token_cost)),
		cacheWrite: toPricePerMillion(parseNumberString(entry.cache_creation_input_token_cost))
	};
	const tieredPricing = parseLiteLLMTieredPricing(entry.tiered_pricing);
	if (tieredPricing) pricing.tieredPricing = tieredPricing;
	return pricing;
}
async function fetchLiteLLMPricingCatalog(fetchImpl) {
	const response = await fetchImpl(LITELLM_PRICING_URL, {
		headers: { Accept: "application/json" },
		signal: AbortSignal.timeout(FETCH_TIMEOUT_MS)
	});
	if (!response.ok) throw new Error(`LiteLLM pricing fetch failed: HTTP ${response.status}`);
	const payload = await readPricingJsonObject(response, "LiteLLM");
	const catalog = /* @__PURE__ */ new Map();
	for (const [key, value] of Object.entries(payload)) {
		if (!value || typeof value !== "object") continue;
		const pricing = parseLiteLLMPricing(value);
		if (!pricing) continue;
		catalog.set(key, pricing);
	}
	return catalog;
}
function resolveLiteLLMPricingForRef(params) {
	return params.catalog.get(`${params.ref.provider}/${params.ref.model}`);
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
	const payload = await readPricingJsonObject(response, "OpenRouter");
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
		let openRouterFailed = false;
		let litellmFailed = false;
		const [catalogById, litellmCatalog] = await Promise.all([fetchOpenRouterPricingCatalog(fetchImpl).catch((error) => {
			log.warn(formatPricingFetchFailure("OpenRouter", error));
			openRouterFailed = true;
			return /* @__PURE__ */ new Map();
		}), fetchLiteLLMPricingCatalog(fetchImpl).catch((error) => {
			log.warn(formatPricingFetchFailure("LiteLLM", error));
			litellmFailed = true;
			return /* @__PURE__ */ new Map();
		})]);
		const catalogByNormalizedId = /* @__PURE__ */ new Map();
		for (const entry of catalogById.values()) {
			const normalizedId = canonicalizeOpenRouterLookupId(entry.id);
			if (!normalizedId || catalogByNormalizedId.has(normalizedId)) continue;
			catalogByNormalizedId.set(normalizedId, entry);
		}
		const nextPricing = /* @__PURE__ */ new Map();
		for (const ref of refs) {
			const openRouterPricing = resolveCatalogPricingForRef({
				ref,
				catalogById,
				catalogByNormalizedId
			});
			const litellmPricing = resolveLiteLLMPricingForRef({
				ref,
				catalog: litellmCatalog
			});
			if (openRouterPricing && litellmPricing?.tieredPricing) nextPricing.set(modelKey(ref.provider, ref.model), {
				...openRouterPricing,
				tieredPricing: litellmPricing.tieredPricing
			});
			else if (openRouterPricing) nextPricing.set(modelKey(ref.provider, ref.model), openRouterPricing);
			else if (litellmPricing) nextPricing.set(modelKey(ref.provider, ref.model), litellmPricing);
		}
		if (openRouterFailed || litellmFailed) {
			const existingMeta = getGatewayModelPricingCacheMeta();
			if (nextPricing.size === 0 && existingMeta.size > 0) {
				log.warn("Both pricing sources returned empty data — retaining existing cache");
				scheduleRefresh({
					config: params.config,
					fetchImpl
				});
				return;
			}
			for (const ref of refs) {
				const key = modelKey(ref.provider, ref.model);
				if (!nextPricing.has(key)) {
					const existing = getCachedGatewayModelPricing({
						provider: ref.provider,
						model: ref.model
					});
					if (existing) nextPricing.set(key, existing);
				}
			}
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
	let stopped = false;
	queueMicrotask(() => {
		if (stopped) return;
		refreshGatewayModelPricingCache(params).catch((error) => {
			log.warn(`pricing bootstrap failed: ${String(error)}`);
		});
	});
	return () => {
		stopped = true;
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
/**
* Normalize a raw tieredPricing array from models.json / config.
* Supports open-ended ranges such as `[128000]` or `[128000, -1]`,
* which are converted to `[128000, Infinity]`.
*/
function normalizeTieredPricing(raw) {
	if (!raw || raw.length === 0) return;
	const result = [];
	for (const tier of raw) {
		const range = tier.range;
		if (!Array.isArray(range) || range.length < 1) continue;
		const start = typeof range[0] === "number" ? range[0] : NaN;
		if (!Number.isFinite(start)) continue;
		const rawEnd = range.length >= 2 ? range[1] : null;
		const end = typeof rawEnd === "number" && Number.isFinite(rawEnd) && rawEnd > start ? rawEnd : Infinity;
		if (!Number.isFinite(tier.input) || !Number.isFinite(tier.output) || !Number.isFinite(tier.cacheRead) || !Number.isFinite(tier.cacheWrite)) continue;
		result.push({
			input: tier.input,
			output: tier.output,
			cacheRead: tier.cacheRead,
			cacheWrite: tier.cacheWrite,
			range: [start, end]
		});
	}
	return result.length > 0 ? result.toSorted((a, b) => a.range[0] - b.range[0]) : void 0;
}
function buildProviderCostIndex(providers, options) {
	const entries = /* @__PURE__ */ new Map();
	if (!providers) return entries;
	for (const [providerKey, providerConfig] of Object.entries(providers)) {
		const normalizedProvider = normalizeProviderId(providerKey);
		for (const model of providerConfig?.models ?? []) {
			const normalized = normalizeModelRef(normalizedProvider, model.id, { allowPluginNormalization: options?.allowPluginNormalization });
			const cost = { ...model.cost };
			const normalizedTiers = normalizeTieredPricing(cost.tieredPricing);
			const costConfig = {
				input: cost.input,
				output: cost.output,
				cacheRead: cost.cacheRead,
				cacheWrite: cost.cacheWrite,
				...normalizedTiers ? { tieredPricing: normalizedTiers } : {}
			};
			entries.set(modelKey(normalized.provider, normalized.model), costConfig);
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
function selectPricingTier(tiers, input) {
	const sortedTiers = tiers.toSorted((a, b) => a.range[0] - b.range[0]);
	if (sortedTiers.length === 0) return;
	if (input <= 0) return sortedTiers[0];
	for (const tier of sortedTiers) {
		const [start, end] = tier.range;
		if (input >= start && input < end) return tier;
	}
	for (let index = sortedTiers.length - 1; index >= 0; index -= 1) {
		const tier = sortedTiers[index];
		if (input >= tier.range[0]) return tier;
	}
	return sortedTiers[0];
}
function computeTieredCost(tiers, input, output, cacheRead, cacheWrite) {
	const tier = selectPricingTier(tiers, input);
	if (!tier) return 0;
	return input * tier.input + output * tier.output + cacheRead * tier.cacheRead + cacheWrite * tier.cacheWrite;
}
function estimateUsageCost(params) {
	const usage = params.usage;
	const cost = params.cost;
	if (!usage || !cost) return;
	const input = toNumber(usage.input);
	const output = toNumber(usage.output);
	const cacheRead = toNumber(usage.cacheRead);
	const cacheWrite = toNumber(usage.cacheWrite);
	let total;
	if (cost.tieredPricing && cost.tieredPricing.length > 0) total = computeTieredCost(cost.tieredPricing, input, output, cacheRead, cacheWrite);
	else total = input * cost.input + output * cost.output + cacheRead * cost.cacheRead + cacheWrite * cost.cacheWrite;
	if (!Number.isFinite(total)) return;
	return total / 1e6;
}
function __resetUsageFormatCachesForTest() {
	modelsJsonCostCache = null;
}
//#endregion
export { resolveModelCostConfig as a, formatUsd as i, estimateUsageCost as n, startGatewayModelPricingRefresh as o, formatTokenCount as r, __resetUsageFormatCachesForTest as t };
