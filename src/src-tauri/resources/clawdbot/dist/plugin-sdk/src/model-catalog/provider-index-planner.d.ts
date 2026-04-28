import type { OpenClawProviderIndex } from "./provider-index/index.js";
import type { NormalizedModelCatalogRow } from "./types.js";
export type ProviderIndexModelCatalogPlanEntry = {
    provider: string;
    pluginId: string;
    rows: readonly NormalizedModelCatalogRow[];
};
export type ProviderIndexModelCatalogPlan = {
    rows: readonly NormalizedModelCatalogRow[];
    entries: readonly ProviderIndexModelCatalogPlanEntry[];
};
export declare function planProviderIndexModelCatalogRows(params: {
    index: OpenClawProviderIndex;
    providerFilter?: string;
}): ProviderIndexModelCatalogPlan;
