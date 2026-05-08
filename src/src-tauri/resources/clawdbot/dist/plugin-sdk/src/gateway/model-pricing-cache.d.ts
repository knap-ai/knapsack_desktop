import { type ModelRef } from "../agents/model-selection.js";
import type { OpenClawConfig } from "../config/types.openclaw.js";
import type { PluginManifestRegistry } from "../plugins/manifest-registry.js";
import type { PluginLookUpTable } from "../plugins/plugin-lookup-table.js";
import { getCachedGatewayModelPricing } from "./model-pricing-cache-state.js";
export { getCachedGatewayModelPricing };
export declare function collectConfiguredModelPricingRefs(config: OpenClawConfig, options?: {
    manifestRegistry?: PluginManifestRegistry;
}): ModelRef[];
export declare function refreshGatewayModelPricingCache(params: {
    config: OpenClawConfig;
    fetchImpl?: typeof fetch;
    pluginLookUpTable?: Pick<PluginLookUpTable, "index" | "manifestRegistry">;
    manifestRegistry?: PluginManifestRegistry;
}): Promise<void>;
export declare function startGatewayModelPricingRefresh(params: {
    config: OpenClawConfig;
    fetchImpl?: typeof fetch;
    pluginLookUpTable?: Pick<PluginLookUpTable, "index" | "manifestRegistry">;
    manifestRegistry?: PluginManifestRegistry;
}): () => void;
export declare function getGatewayModelPricingCacheMeta(): {
    cachedAt: number;
    ttlMs: number;
    size: number;
};
export declare function __resetGatewayModelPricingCacheForTest(): void;
