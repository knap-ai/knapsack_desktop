import type { ProviderAugmentModelCatalogContext, ProviderBuiltInModelSuppressionContext } from "./types.js";
export declare function resolveBundledProviderBuiltInModelSuppression(context: ProviderBuiltInModelSuppressionContext): {
    suppress: boolean;
    errorMessage: string;
} | undefined;
export declare function augmentBundledProviderCatalog(context: ProviderAugmentModelCatalogContext): ProviderAugmentModelCatalogContext["entries"];
