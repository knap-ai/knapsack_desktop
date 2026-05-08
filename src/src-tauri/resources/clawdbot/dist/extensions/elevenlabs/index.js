import { t as definePluginEntry } from "../../plugin-entry-BBPiA0af.js";
import { t as elevenLabsMediaUnderstandingProvider } from "../../media-understanding-provider-Cqdi-L2a.js";
import { n as buildElevenLabsRealtimeTranscriptionProvider } from "../../realtime-transcription-provider-CcdE_7WF.js";
import { t as buildElevenLabsSpeechProvider } from "../../speech-provider-C6Yjr44t.js";
//#region extensions/elevenlabs/index.ts
var elevenlabs_default = definePluginEntry({
	id: "elevenlabs",
	name: "ElevenLabs Speech",
	description: "Bundled ElevenLabs speech provider",
	register(api) {
		api.registerSpeechProvider(buildElevenLabsSpeechProvider());
		api.registerMediaUnderstandingProvider(elevenLabsMediaUnderstandingProvider);
		api.registerRealtimeTranscriptionProvider(buildElevenLabsRealtimeTranscriptionProvider());
	}
});
//#endregion
export { elevenlabs_default as default };
