export declare function normalizeProviderModelIdWithManifest(params: {
    provider: string;
    context: {
        provider: string;
        modelId: string;
    };
}): string | undefined;
export declare function clearManifestModelIdNormalizationCacheForTest(): void;
