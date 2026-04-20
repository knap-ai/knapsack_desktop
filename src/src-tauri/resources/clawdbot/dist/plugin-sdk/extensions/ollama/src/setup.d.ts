import type { OpenClawConfig, SecretInput, SecretInputMode } from "openclaw/plugin-sdk/provider-auth";
import type { RuntimeEnv } from "openclaw/plugin-sdk/runtime";
import { type WizardPrompter } from "openclaw/plugin-sdk/setup";
import { buildOllamaModelDefinition } from "./provider-models.js";
type OllamaSetupOptions = {
    customBaseUrl?: string;
    customModelId?: string;
};
type OllamaSetupResult = {
    config: OpenClawConfig;
    credential: SecretInput;
    credentialMode?: SecretInputMode;
};
type ProviderConfig = {
    baseUrl: string;
    api: "ollama";
    models: ReturnType<typeof buildOllamaModelDefinition>[];
};
export declare function checkOllamaCloudAuth(baseUrl: string): Promise<{
    signedIn: boolean;
    signinUrl?: string;
}>;
export declare function buildOllamaProvider(configuredBaseUrl?: string, opts?: {
    quiet?: boolean;
}): Promise<ProviderConfig>;
export declare function promptAndConfigureOllama(params: {
    cfg: OpenClawConfig;
    env?: NodeJS.ProcessEnv;
    opts?: Record<string, unknown>;
    prompter: WizardPrompter;
    secretInputMode?: SecretInputMode;
    allowSecretRefPrompt?: boolean;
}): Promise<OllamaSetupResult>;
export declare function configureOllamaNonInteractive(params: {
    nextConfig: OpenClawConfig;
    opts: OllamaSetupOptions;
    runtime: RuntimeEnv;
    agentDir?: string;
}): Promise<OpenClawConfig>;
export declare function ensureOllamaModelPulled(params: {
    config: OpenClawConfig;
    model: string;
    prompter: WizardPrompter;
}): Promise<void>;
export {};
