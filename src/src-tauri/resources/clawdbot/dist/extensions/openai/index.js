import { a as buildProviderToolCompatFamilyHooks } from "../../provider-tools-Z_yR2St8.js";
import { t as definePluginEntry } from "../../plugin-entry-Bkat4og3.js";
import { t as buildOpenAICodexCliBackend } from "../../cli-backend-gBOMQFPa.js";
import { t as buildOpenAIImageGenerationProvider } from "../../image-generation-provider-Cb-lbwSv.js";
import { n as openaiCodexMediaUnderstandingProvider, r as openaiMediaUnderstandingProvider } from "../../media-understanding-provider-DayHFJFC.js";
import { t as buildOpenAICodexProviderPlugin } from "../../openai-codex-provider-QEuYACvP.js";
import { t as buildOpenAIProvider } from "../../openai-provider-BOl0OfvL.js";
import { a as resolveOpenAIPromptOverlayMode, o as resolveOpenAISystemPromptContribution } from "../../prompt-overlay-BYKXKuK8.js";
import { t as buildOpenAIRealtimeTranscriptionProvider } from "../../realtime-transcription-provider-Go1TEQlr.js";
import { t as buildOpenAIRealtimeVoiceProvider } from "../../realtime-voice-provider-CIPwH743.js";
import { t as buildOpenAISpeechProvider } from "../../speech-provider-DjkBcRt3.js";
import { t as buildOpenAIVideoGenerationProvider } from "../../video-generation-provider-iBkMhHn-.js";
//#region extensions/openai/index.ts
var openai_default = definePluginEntry({
	id: "openai",
	name: "OpenAI Provider",
	description: "Bundled OpenAI provider plugins",
	register(api) {
		const promptOverlayMode = resolveOpenAIPromptOverlayMode(api.pluginConfig);
		const openAIToolCompatHooks = buildProviderToolCompatFamilyHooks("openai");
		const buildProviderWithPromptContribution = (provider) => ({
			...provider,
			...openAIToolCompatHooks,
			resolveSystemPromptContribution: (ctx) => resolveOpenAISystemPromptContribution({
				mode: promptOverlayMode,
				modelProviderId: provider.id,
				modelId: ctx.modelId
			})
		});
		api.registerCliBackend(buildOpenAICodexCliBackend());
		api.registerProvider(buildProviderWithPromptContribution(buildOpenAIProvider()));
		api.registerProvider(buildProviderWithPromptContribution(buildOpenAICodexProviderPlugin()));
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
