import type { ModelDefinitionConfig } from "openclaw/plugin-sdk/provider-onboard";
export type OllamaTagModel = {
    name: string;
    modified_at?: string;
    size?: number;
    digest?: string;
    remote_host?: string;
    details?: {
        family?: string;
        parameter_size?: string;
    };
};
export type OllamaTagsResponse = {
    models?: OllamaTagModel[];
};
export type OllamaModelWithContext = OllamaTagModel & {
    contextWindow?: number;
    capabilities?: string[];
};
export declare function buildOllamaBaseUrlSsrFPolicy(baseUrl: string): {
    hostnameAllowlist: string[];
    allowPrivateNetwork: boolean;
} | undefined;
export declare function resolveOllamaApiBase(configuredBaseUrl?: string): string;
export type OllamaModelShowInfo = {
    contextWindow?: number;
    capabilities?: string[];
};
export declare function queryOllamaModelShowInfo(apiBase: string, modelName: string): Promise<OllamaModelShowInfo>;
/** @deprecated Use queryOllamaModelShowInfo instead. */
export declare function queryOllamaContextWindow(apiBase: string, modelName: string): Promise<number | undefined>;
export declare function enrichOllamaModelsWithContext(apiBase: string, models: OllamaTagModel[], opts?: {
    concurrency?: number;
}): Promise<OllamaModelWithContext[]>;
export declare function isReasoningModelHeuristic(modelId: string): boolean;
export declare function buildOllamaModelDefinition(modelId: string, contextWindow?: number, capabilities?: string[]): ModelDefinitionConfig;
export declare function fetchOllamaModels(baseUrl: string): Promise<{
    reachable: boolean;
    models: OllamaTagModel[];
}>;
export declare function resetOllamaModelShowInfoCacheForTest(): void;
