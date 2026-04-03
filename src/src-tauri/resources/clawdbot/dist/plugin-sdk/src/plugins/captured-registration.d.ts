import type { OpenClawConfig } from "../config/config.js";
import type { AnyAgentTool, CliBackendPlugin, ImageGenerationProviderPlugin, MediaUnderstandingProviderPlugin, OpenClawPluginApi, OpenClawPluginCliCommandDescriptor, OpenClawPluginCliRegistrar, ProviderPlugin, SpeechProviderPlugin, WebFetchProviderPlugin, WebSearchProviderPlugin } from "./types.js";
type CapturedPluginCliRegistration = {
    register: OpenClawPluginCliRegistrar;
    commands: string[];
    descriptors: OpenClawPluginCliCommandDescriptor[];
};
export type CapturedPluginRegistration = {
    api: OpenClawPluginApi;
    providers: ProviderPlugin[];
    cliRegistrars: CapturedPluginCliRegistration[];
    cliBackends: CliBackendPlugin[];
    speechProviders: SpeechProviderPlugin[];
    mediaUnderstandingProviders: MediaUnderstandingProviderPlugin[];
    imageGenerationProviders: ImageGenerationProviderPlugin[];
    webFetchProviders: WebFetchProviderPlugin[];
    webSearchProviders: WebSearchProviderPlugin[];
    tools: AnyAgentTool[];
};
export declare function createCapturedPluginRegistration(params?: {
    config?: OpenClawConfig;
    registrationMode?: OpenClawPluginApi["registrationMode"];
}): CapturedPluginRegistration;
export declare function capturePluginRegistration(params: {
    register(api: OpenClawPluginApi): void;
}): CapturedPluginRegistration;
export {};
