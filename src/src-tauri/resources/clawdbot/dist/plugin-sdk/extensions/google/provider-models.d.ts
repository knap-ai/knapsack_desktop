import type { ProviderResolveDynamicModelContext, ProviderRuntimeModel } from "openclaw/plugin-sdk/plugin-entry";
export declare function resolveGoogle31ForwardCompatModel(params: {
    providerId: string;
    ctx: ProviderResolveDynamicModelContext;
}): ProviderRuntimeModel | undefined;
export declare function isModernGoogleModel(modelId: string): boolean;
