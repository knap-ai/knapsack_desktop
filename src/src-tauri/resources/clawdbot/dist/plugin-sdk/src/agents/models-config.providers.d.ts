import type { OpenClawConfig } from "../config/config.js";
import { normalizeGoogleModelId, normalizeXaiModelId } from "./model-id-normalization.js";
export { buildKimiCodingProvider, buildKilocodeProvider, MODELSTUDIO_BASE_URL, MODELSTUDIO_DEFAULT_MODEL_ID, buildModelStudioProvider, buildNvidiaProvider, QIANFAN_BASE_URL, QIANFAN_DEFAULT_MODEL_ID, buildQianfanProvider, XIAOMI_DEFAULT_MODEL_ID, buildXiaomiProvider, } from "../plugin-sdk/provider-catalog.js";
export { resolveOllamaApiBase } from "./models-config.providers.discovery.js";
export { normalizeGoogleModelId, normalizeXaiModelId };
type ModelsConfig = NonNullable<OpenClawConfig["models"]>;
export type ProviderConfig = NonNullable<ModelsConfig["providers"]>[string];
type SecretDefaults = {
    env?: string;
    file?: string;
    exec?: string;
};
export declare function applyNativeStreamingUsageCompat(providers: Record<string, ProviderConfig>): Record<string, ProviderConfig>;
export declare function normalizeAntigravityModelId(id: string): string;
export declare function enforceSourceManagedProviderSecrets(params: {
    providers: ModelsConfig["providers"];
    sourceProviders: ModelsConfig["providers"] | undefined;
    sourceSecretDefaults?: SecretDefaults;
    secretRefManagedProviders?: Set<string>;
}): ModelsConfig["providers"];
export declare function normalizeProviders(params: {
    providers: ModelsConfig["providers"];
    agentDir: string;
    env?: NodeJS.ProcessEnv;
    secretDefaults?: SecretDefaults;
    sourceProviders?: ModelsConfig["providers"];
    sourceSecretDefaults?: SecretDefaults;
    secretRefManagedProviders?: Set<string>;
}): ModelsConfig["providers"];
type ImplicitProviderParams = {
    agentDir: string;
    config?: OpenClawConfig;
    env?: NodeJS.ProcessEnv;
    workspaceDir?: string;
    explicitProviders?: Record<string, ProviderConfig> | null;
};
export declare function resolveImplicitProviders(params: ImplicitProviderParams): Promise<ModelsConfig["providers"]>;
export declare function resolveImplicitAnthropicVertexProvider(params: {
    env?: NodeJS.ProcessEnv;
}): ProviderConfig | null;
export declare function resolveImplicitBedrockProvider(params: {
    agentDir: string;
    config?: OpenClawConfig;
    env?: NodeJS.ProcessEnv;
}): Promise<ProviderConfig | null>;
