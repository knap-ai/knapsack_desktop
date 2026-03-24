import { ut as OPENAI_DEFAULT_AUDIO_TRANSCRIPTION_MODEL } from "./provider-models-BKjzpTsb.js";
import { c as describeImagesWithModel, o as transcribeOpenAiCompatibleAudio, s as describeImageWithModel } from "./media-understanding-BDOSvuM9.js";
//#region extensions/openai/media-understanding-provider.ts
const DEFAULT_OPENAI_AUDIO_BASE_URL = "https://api.openai.com/v1";
async function transcribeOpenAiAudio(params) {
	return await transcribeOpenAiCompatibleAudio({
		...params,
		defaultBaseUrl: DEFAULT_OPENAI_AUDIO_BASE_URL,
		defaultModel: OPENAI_DEFAULT_AUDIO_TRANSCRIPTION_MODEL
	});
}
const openaiMediaUnderstandingProvider = {
	id: "openai",
	capabilities: ["image", "audio"],
	describeImage: describeImageWithModel,
	describeImages: describeImagesWithModel,
	transcribeAudio: transcribeOpenAiAudio
};
//#endregion
export { openaiMediaUnderstandingProvider as n, transcribeOpenAiAudio as r, DEFAULT_OPENAI_AUDIO_BASE_URL as t };
