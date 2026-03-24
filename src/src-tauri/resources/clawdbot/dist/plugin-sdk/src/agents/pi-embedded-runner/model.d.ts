import type { Api, Model } from "@mariozechner/pi-ai";
import type { AuthStorage, ModelRegistry } from "@mariozechner/pi-coding-agent";
import type { OpenClawConfig } from "../../config/config.js";
import type { ModelDefinitionConfig } from "../../config/types.js";
import { prepareProviderDynamicModel, runProviderDynamicModel, normalizeProviderResolvedModelWithPlugin } from "../../plugins/provider-runtime.js";
import { buildModelAliasLines } from "../model-alias-lines.js";
type InlineModelEntry = ModelDefinitionConfig & {
    provider: string;
    baseUrl?: string;
    headers?: Record<string, string>;
};
type InlineProviderConfig = {
    baseUrl?: string;
    api?: ModelDefinitionConfig["api"];
    models?: ModelDefinitionConfig[];
    headers?: unknown;
};
type ProviderRuntimeHooks = {
    prepareProviderDynamicModel: (params: Parameters<typeof prepareProviderDynamicModel>[0]) => Promise<void>;
    runProviderDynamicModel: (params: Parameters<typeof runProviderDynamicModel>[0]) => unknown;
    normalizeProviderResolvedModelWithPlugin: (params: Parameters<typeof normalizeProviderResolvedModelWithPlugin>[0]) => unknown;
};
export { buildModelAliasLines };
export declare function buildInlineProviderModels(providers: Record<string, InlineProviderConfig>): InlineModelEntry[];
export declare function resolveModelWithRegistry(params: {
    provider: string;
    modelId: string;
    modelRegistry: ModelRegistry;
    cfg?: OpenClawConfig;
    agentDir?: string;
    runtimeHooks?: ProviderRuntimeHooks;
}): Model<Api> | undefined;
export declare function resolveModel(provider: string, modelId: string, agentDir?: string, cfg?: OpenClawConfig, options?: {
    authStorage?: AuthStorage;
    modelRegistry?: ModelRegistry;
    runtimeHooks?: ProviderRuntimeHooks;
}): {
    model?: Model<Api>;
    error?: string;
    authStorage: AuthStorage;
    modelRegistry: ModelRegistry;
};
export declare function resolveModelAsync(provider: string, modelId: string, agentDir?: string, cfg?: OpenClawConfig, options?: {
    authStorage?: AuthStorage;
    modelRegistry?: ModelRegistry;
    retryTransientProviderRuntimeMiss?: boolean;
    runtimeHooks?: ProviderRuntimeHooks;
}): Promise<{
    model?: Model<Api>;
    error?: string;
    authStorage: AuthStorage;
    modelRegistry: ModelRegistry;
}>;
