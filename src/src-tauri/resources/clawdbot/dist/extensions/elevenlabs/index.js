import { t as definePluginEntry } from "../../plugin-entry-oWwpQhIC.js";
import { t as elevenLabsMediaUnderstandingProvider } from "../../media-understanding-provider-DS8ztHwQ.js";
import { n as buildElevenLabsRealtimeTranscriptionProvider } from "../../realtime-transcription-provider-E4Cbuod5.js";
import { t as buildElevenLabsSpeechProvider } from "../../speech-provider-L__jONZ-.js";
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
