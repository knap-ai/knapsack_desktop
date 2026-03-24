import { type ModelRef } from "../agents/model-selection.js";
import type { OpenClawConfig } from "../config/config.js";
export type CachedModelPricing = {
    input: number;
    output: number;
    cacheRead: number;
    cacheWrite: number;
};
export declare function collectConfiguredModelPricingRefs(config: OpenClawConfig): ModelRef[];
export declare function refreshGatewayModelPricingCache(params: {
    config: OpenClawConfig;
    fetchImpl?: typeof fetch;
}): Promise<void>;
export declare function startGatewayModelPricingRefresh(params: {
    config: OpenClawConfig;
    fetchImpl?: typeof fetch;
}): () => void;
export declare function getCachedGatewayModelPricing(params: {
    provider?: string;
    model?: string;
}): CachedModelPricing | undefined;
export declare function getGatewayModelPricingCacheMeta(): {
    cachedAt: number;
    ttlMs: number;
    size: number;
};
export declare function __resetGatewayModelPricingCacheForTest(): void;
export declare function __setGatewayModelPricingForTest(entries: Array<{
    provider: string;
    model: string;
    pricing: CachedModelPricing;
}>): void;
