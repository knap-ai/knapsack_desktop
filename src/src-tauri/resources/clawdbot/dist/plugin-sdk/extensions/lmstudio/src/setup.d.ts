import { type OpenClawConfig, type SecretInputMode } from "openclaw/plugin-sdk/provider-auth";
import type { ModelProviderConfig } from "openclaw/plugin-sdk/provider-model-shared";
import { type ProviderAuthMethodNonInteractiveContext, type ProviderAuthResult, type ProviderCatalogContext, type ProviderPrepareDynamicModelContext, type ProviderRuntimeModel } from "openclaw/plugin-sdk/provider-setup";
import { type WizardPrompter } from "openclaw/plugin-sdk/setup";
type ProviderPromptText = (params: {
    message: string;
    initialValue?: string;
    placeholder?: string;
    validate?: (value: string | undefined) => string | undefined;
}) => Promise<string | undefined>;
type ProviderPromptNote = (message: string, title?: string) => Promise<void> | void;
/** Interactive LM Studio setup with connectivity and model-availability checks. */
export declare function promptAndConfigureLmstudioInteractive(params: {
    config: OpenClawConfig;
    prompter?: WizardPrompter;
    secretInputMode?: SecretInputMode;
    allowSecretRefPrompt?: boolean;
    promptText?: ProviderPromptText;
    note?: ProviderPromptNote;
}): Promise<ProviderAuthResult>;
/** Non-interactive setup path backed by the shared self-hosted helper. */
export declare function configureLmstudioNonInteractive(ctx: ProviderAuthMethodNonInteractiveContext): Promise<OpenClawConfig | null>;
/** Discovers provider settings, merging explicit config with live model discovery. */
export declare function discoverLmstudioProvider(ctx: ProviderCatalogContext): Promise<{
    provider: ModelProviderConfig;
} | null>;
export declare function prepareLmstudioDynamicModels(ctx: ProviderPrepareDynamicModelContext): Promise<ProviderRuntimeModel[]>;
export {};
