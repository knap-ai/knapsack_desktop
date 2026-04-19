import type { OpenClawConfig } from "../config/types.openclaw.js";
import type { MemoryEmbeddingProviderAdapter } from "./memory-embedding-providers.js";
import type { AnyAgentTool, AgentHarness, CliBackendPlugin, ImageGenerationProviderPlugin, MediaUnderstandingProviderPlugin, MusicGenerationProviderPlugin, OpenClawPluginApi, OpenClawPluginCliCommandDescriptor, OpenClawPluginCliRegistrar, PluginTextTransformRegistration, ProviderPlugin, RealtimeTranscriptionProviderPlugin, RealtimeVoiceProviderPlugin, SpeechProviderPlugin, VideoGenerationProviderPlugin, WebFetchProviderPlugin, WebSearchProviderPlugin } from "./types.js";
type CapturedPluginCliRegistration = {
    register: OpenClawPluginCliRegistrar;
    commands: string[];
    descriptors: OpenClawPluginCliCommandDescriptor[];
};
export type CapturedPluginRegistration = {
    api: OpenClawPluginApi;
    providers: ProviderPlugin[];
    agentHarnesses: AgentHarness[];
    cliRegistrars: CapturedPluginCliRegistration[];
    cliBackends: CliBackendPlugin[];
    textTransforms: PluginTextTransformRegistration[];
    speechProviders: SpeechProviderPlugin[];
    realtimeTranscriptionProviders: RealtimeTranscriptionProviderPlugin[];
    realtimeVoiceProviders: RealtimeVoiceProviderPlugin[];
    mediaUnderstandingProviders: MediaUnderstandingProviderPlugin[];
    imageGenerationProviders: ImageGenerationProviderPlugin[];
    videoGenerationProviders: VideoGenerationProviderPlugin[];
    musicGenerationProviders: MusicGenerationProviderPlugin[];
    webFetchProviders: WebFetchProviderPlugin[];
    webSearchProviders: WebSearchProviderPlugin[];
    memoryEmbeddingProviders: MemoryEmbeddingProviderAdapter[];
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
