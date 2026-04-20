import type { ModelProviderConfig } from "openclaw/plugin-sdk/provider-model-shared";
export declare function hasLmstudioAuthorizationHeader(headers: unknown): boolean;
export declare function resolveLmstudioProviderAuthMode(apiKey: ModelProviderConfig["apiKey"] | undefined): ModelProviderConfig["auth"] | undefined;
export declare function shouldUseLmstudioApiKeyPlaceholder(params: {
    hasModels: boolean;
    resolvedApiKey: ModelProviderConfig["apiKey"] | undefined;
    hasAuthorizationHeader?: boolean;
}): boolean;
export declare function shouldUseLmstudioSyntheticAuth(providerConfig: ModelProviderConfig | undefined): boolean;
