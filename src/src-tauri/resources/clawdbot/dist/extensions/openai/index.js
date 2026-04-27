import { a as buildProviderToolCompatFamilyHooks } from "../../provider-tools-VpDDhpdz.js";
import { t as definePluginEntry } from "../../plugin-entry-oWwpQhIC.js";
import { r as resolvePluginConfigObject } from "../../config-runtime-Dutm3Ah0.js";
import { t as buildOpenAICodexCliBackend } from "../../cli-backend-JwVjPiHZ.js";
import { t as buildOpenAIImageGenerationProvider } from "../../image-generation-provider-DCtzDaXb.js";
import { n as openaiCodexMediaUnderstandingProvider, r as openaiMediaUnderstandingProvider } from "../../media-understanding-provider-D-CF-Ud7.js";
import { t as openAiMemoryEmbeddingProviderAdapter } from "../../memory-embedding-adapter-B89PEU6k.js";
import { t as buildOpenAICodexProviderPlugin } from "../../openai-codex-provider-CAil1DSq.js";
import { t as buildOpenAIProvider } from "../../openai-provider-CV7ZDU34.js";
import { i as resolveOpenAISystemPromptContribution, r as resolveOpenAIPromptOverlayMode } from "../../prompt-overlay-DBqjJVVT.js";
import { t as buildOpenAIRealtimeTranscriptionProvider } from "../../realtime-transcription-provider-DS6PLcFC.js";
import { t as buildOpenAIRealtimeVoiceProvider } from "../../realtime-voice-provider-BIA7LItQ.js";
import { t as buildOpenAISpeechProvider } from "../../speech-provider-DtEuf3jc.js";
import { t as buildOpenAIVideoGenerationProvider } from "../../video-generation-provider-Duwz-JjX.js";
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
