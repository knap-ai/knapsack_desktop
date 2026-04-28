import { a as buildProviderToolCompatFamilyHooks } from "../../provider-tools-CjZl3FJf.js";
import { t as definePluginEntry } from "../../plugin-entry-BBPiA0af.js";
import { r as resolvePluginConfigObject } from "../../plugin-config-runtime-CZjU72lW.js";
import { t as buildOpenAICodexCliBackend } from "../../cli-backend-CNjcdP1x.js";
import { t as buildOpenAIImageGenerationProvider } from "../../image-generation-provider-CP286vHO.js";
import { n as openaiCodexMediaUnderstandingProvider, r as openaiMediaUnderstandingProvider } from "../../media-understanding-provider-VHMqV3Vg.js";
import { t as openAiMemoryEmbeddingProviderAdapter } from "../../memory-embedding-adapter-CFqpi9r9.js";
import { t as buildOpenAICodexProviderPlugin } from "../../openai-codex-provider-Bn2XPXMP.js";
import { t as buildOpenAIProvider } from "../../openai-provider-DhFKDZ6H.js";
import { i as resolveOpenAISystemPromptContribution, r as resolveOpenAIPromptOverlayMode } from "../../prompt-overlay-5ICTVk3X.js";
import { t as buildOpenAIRealtimeTranscriptionProvider } from "../../realtime-transcription-provider-89uaMP30.js";
import { t as buildOpenAIRealtimeVoiceProvider } from "../../realtime-voice-provider-CHJJ_VX5.js";
import { t as buildOpenAISpeechProvider } from "../../speech-provider-D4zT9eKR.js";
import { t as buildOpenAIVideoGenerationProvider } from "../../video-generation-provider-RZ86cD9W.js";
//#region extensions/openai/index.ts
var openai_default = definePluginEntry({
	id: "openai",
	name: "OpenAI Provider",
	description: "Bundled OpenAI provider plugins",
	register(api) {
		const openAIToolCompatHooks = buildProviderToolCompatFamilyHooks("openai");
		const buildProviderWithPromptContribution = (provider) => ({
			...provider,
			...openAIToolCompatHooks,
			resolveSystemPromptContribution: (ctx) => {
				const pluginConfig = resolvePluginConfigObject(ctx.config, "openai") ?? (ctx.config ? void 0 : api.pluginConfig);
				return resolveOpenAISystemPromptContribution({
					config: ctx.config,
					legacyPluginConfig: pluginConfig,
					mode: resolveOpenAIPromptOverlayMode(pluginConfig),
					modelProviderId: provider.id,
					modelId: ctx.modelId
				});
			}
		});
		api.registerCliBackend(buildOpenAICodexCliBackend());
		api.registerProvider(buildProviderWithPromptContribution(buildOpenAIProvider()));
		api.registerProvider(buildProviderWithPromptContribution(buildOpenAICodexProviderPlugin()));
		api.registerMemoryEmbeddingProvider(openAiMemoryEmbeddingProviderAdapter);
		api.registerImageGenerationProvider(buildOpenAIImageGenerationProvider());
		api.registerRealtimeTranscriptionProvider(buildOpenAIRealtimeTranscriptionProvider());
		api.registerRealtimeVoiceProvider(buildOpenAIRealtimeVoiceProvider());
		api.registerSpeechProvider(buildOpenAISpeechProvider());
		api.registerMediaUnderstandingProvider(openaiMediaUnderstandingProvider);
		api.registerMediaUnderstandingProvider(openaiCodexMediaUnderstandingProvider);
		api.registerVideoGenerationProvider(buildOpenAIVideoGenerationProvider());
	}
});
//#endregion
export { openai_default as default };
