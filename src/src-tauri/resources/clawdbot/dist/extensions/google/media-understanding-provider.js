import { o as resolveProviderHttpRequestConfig, r as postJsonRequest, t as assertOkOrThrowHttpError } from "../../shared-bNb64sx7.js";
import { n as describeImagesWithModel, t as describeImageWithModel } from "../../image-runtime-DrCqEvKh.js";
import "../../media-understanding-CbOWvFaG.js";
import "../../provider-http-CMHzFsgV.js";
import { n as normalizeGoogleModelId } from "../../model-id-GSg7lJuG.js";
import { a as normalizeGoogleApiBaseUrl, c as parseGeminiAuth, t as DEFAULT_GOOGLE_API_BASE_URL } from "../../api-tF_YSNoD.js";
import "../../runtime-api-Ciu7TJQF.js";
//#region extensions/google/media-understanding-provider.ts
const DEFAULT_GOOGLE_AUDIO_BASE_URL = DEFAULT_GOOGLE_API_BASE_URL;
const DEFAULT_GOOGLE_VIDEO_BASE_URL = DEFAULT_GOOGLE_API_BASE_URL;
const DEFAULT_GOOGLE_AUDIO_MODEL = "gemini-3-flash-preview";
const DEFAULT_GOOGLE_VIDEO_MODEL = "gemini-3-flash-preview";
const DEFAULT_GOOGLE_AUDIO_PROMPT = "Transcribe the audio.";
const DEFAULT_GOOGLE_VIDEO_PROMPT = "Describe the video.";
async function generateGeminiInlineDataText(params) {
	const fetchFn = params.fetchFn ?? fetch;
	const model = (() => {
		const trimmed = params.model?.trim();
		if (!trimmed) return params.defaultModel;
		return normalizeGoogleModelId(trimmed);
	})();
	const { baseUrl, allowPrivateNetwork, headers, dispatcherPolicy } = resolveProviderHttpRequestConfig({
		baseUrl: normalizeGoogleApiBaseUrl(params.baseUrl ?? params.defaultBaseUrl),
		defaultBaseUrl: DEFAULT_GOOGLE_API_BASE_URL,
		allowPrivateNetwork: Boolean(params.baseUrl?.trim()),
		headers: params.headers,
		request: params.request,
		defaultHeaders: parseGeminiAuth(params.apiKey).headers,
		provider: "google",
		api: "google-generative-ai",
		capability: params.defaultMime.startsWith("audio/") ? "audio" : "video",
		transport: "media-understanding"
	});
	const { response: res, release } = await postJsonRequest({
		url: `${baseUrl}/models/${model}:generateContent`,
		headers,
		body: { contents: [{
			role: "user",
			parts: [{ text: params.prompt?.trim() || params.defaultPrompt }, { inline_data: {
				mime_type: params.mime ?? params.defaultMime,
				data: params.buffer.toString("base64")
			} }]
		}] },
		timeoutMs: params.timeoutMs,
		fetchFn,
		allowPrivateNetwork,
		dispatcherPolicy
	});
	try {
		await assertOkOrThrowHttpError(res, params.httpErrorLabel);
		const text = ((await res.json()).candidates?.[0]?.content?.parts ?? []).map((part) => part?.text?.trim()).filter(Boolean).join("\n");
		if (!text) throw new Error(params.missingTextError);
		return {
			text,
			model
		};
	} finally {
		await release();
	}
}
async function transcribeGeminiAudio(params) {
	const { text, model } = await generateGeminiInlineDataText({
		...params,
		defaultBaseUrl: DEFAULT_GOOGLE_AUDIO_BASE_URL,
		defaultModel: DEFAULT_GOOGLE_AUDIO_MODEL,
		defaultPrompt: DEFAULT_GOOGLE_AUDIO_PROMPT,
		defaultMime: "audio/wav",
		httpErrorLabel: "Audio transcription failed",
		missingTextError: "Audio transcription response missing text"
	});
	return {
		text,
		model
	};
}
async function describeGeminiVideo(params) {
	const { text, model } = await generateGeminiInlineDataText({
		...params,
		defaultBaseUrl: DEFAULT_GOOGLE_VIDEO_BASE_URL,
		defaultModel: DEFAULT_GOOGLE_VIDEO_MODEL,
		defaultPrompt: DEFAULT_GOOGLE_VIDEO_PROMPT,
		defaultMime: "video/mp4",
		httpErrorLabel: "Video description failed",
		missingTextError: "Video description response missing text"
	});
	return {
		text,
		model
	};
}
const googleMediaUnderstandingProvider = {
	id: "google",
	capabilities: [
		"image",
		"audio",
		"video"
	],
	describeImage: describeImageWithModel,
	describeImages: describeImagesWithModel,
	transcribeAudio: transcribeGeminiAudio,
	describeVideo: describeGeminiVideo
};
//#endregion
export { DEFAULT_GOOGLE_AUDIO_BASE_URL, DEFAULT_GOOGLE_VIDEO_BASE_URL, describeGeminiVideo, googleMediaUnderstandingProvider, transcribeGeminiAudio };
