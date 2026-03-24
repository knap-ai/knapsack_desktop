import type { OpenClawConfig } from "../config/config.js";
import type { RuntimeEnv } from "../runtime.js";
import { type WizardPrompter } from "../wizard/prompts.js";
import type { ProviderAuthOptionBag } from "./types.js";
export { OLLAMA_DEFAULT_BASE_URL } from "../agents/ollama-defaults.js";
export declare const OLLAMA_DEFAULT_MODEL = "glm-4.7-flash";
type OllamaSetupOptions = ProviderAuthOptionBag & {
    customBaseUrl?: string;
    customModelId?: string;
};
/**
 * Interactive: prompt for base URL, discover models, configure provider.
 * Model selection is handled by the standard model picker downstream.
 */
export declare function promptAndConfigureOllama(params: {
    cfg: OpenClawConfig;
    prompter: WizardPrompter;
}): Promise<{
    config: OpenClawConfig;
}>;
/** Non-interactive: auto-discover models and configure provider. */
export declare function configureOllamaNonInteractive(params: {
    nextConfig: OpenClawConfig;
    opts: OllamaSetupOptions;
    runtime: RuntimeEnv;
}): Promise<OpenClawConfig>;
/** Pull the configured default Ollama model if it isn't already available locally. */
export declare function ensureOllamaModelPulled(params: {
    config: OpenClawConfig;
    model: string;
    prompter: WizardPrompter;
}): Promise<void>;
