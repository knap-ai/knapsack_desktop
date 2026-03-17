import type { AuthProfileCredential } from "../agents/auth-profiles/types.js";
import type { OpenClawConfig } from "../config/config.js";
import type { ProviderDiscoveryContext, ProviderAuthResult, ProviderAuthMethodNonInteractiveContext } from "../plugins/types.js";
import type { WizardPrompter } from "../wizard/prompts.js";
export declare const SELF_HOSTED_DEFAULT_CONTEXT_WINDOW = 128000;
export declare const SELF_HOSTED_DEFAULT_MAX_TOKENS = 8192;
export declare const SELF_HOSTED_DEFAULT_COST: {
    input: number;
    output: number;
    cacheRead: number;
    cacheWrite: number;
};
export declare function applyProviderDefaultModel(cfg: OpenClawConfig, modelRef: string): OpenClawConfig;
type OpenAICompatibleSelfHostedProviderSetupParams = {
    cfg: OpenClawConfig;
    prompter: WizardPrompter;
    providerId: string;
    providerLabel: string;
    defaultBaseUrl: string;
    defaultApiKeyEnvVar: string;
    modelPlaceholder: string;
    input?: Array<"text" | "image">;
    reasoning?: boolean;
    contextWindow?: number;
    maxTokens?: number;
};
type OpenAICompatibleSelfHostedProviderPromptResult = {
    config: OpenClawConfig;
    credential: AuthProfileCredential;
    modelId: string;
    modelRef: string;
    profileId: string;
};
export declare function promptAndConfigureOpenAICompatibleSelfHostedProvider(params: OpenAICompatibleSelfHostedProviderSetupParams): Promise<OpenAICompatibleSelfHostedProviderPromptResult>;
export declare function promptAndConfigureOpenAICompatibleSelfHostedProviderAuth(params: OpenAICompatibleSelfHostedProviderSetupParams): Promise<ProviderAuthResult>;
export declare function discoverOpenAICompatibleSelfHostedProvider<T extends Record<string, unknown>>(params: {
    ctx: ProviderDiscoveryContext;
    providerId: string;
    buildProvider: (params: {
        apiKey?: string;
    }) => Promise<T>;
}): Promise<{
    provider: T & {
        apiKey: string;
    };
} | null>;
export declare function configureOpenAICompatibleSelfHostedProviderNonInteractive(params: {
    ctx: ProviderAuthMethodNonInteractiveContext;
    providerId: string;
    providerLabel: string;
    defaultBaseUrl: string;
    defaultApiKeyEnvVar: string;
    modelPlaceholder: string;
    input?: Array<"text" | "image">;
    reasoning?: boolean;
    contextWindow?: number;
    maxTokens?: number;
}): Promise<OpenClawConfig | null>;
export {};
