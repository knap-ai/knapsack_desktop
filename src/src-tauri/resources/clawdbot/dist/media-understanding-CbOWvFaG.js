import { a as requireTranscriptionText, i as postTranscriptionRequest, o as resolveProviderHttpRequestConfig, t as assertOkOrThrowHttpError } from "./shared-bNb64sx7.js";
import "./image-runtime-DrCqEvKh.js";
import path from "node:path";
//#region src/media-understanding/openai-compatible-audio.ts
function resolveModel(model, fallback) {
	return model?.trim() || fallback;
}
async function transcribeOpenAiCompatibleAudio(params) {
	const fetchFn = params.fetchFn ?? fetch;
	const { baseUrl, allowPrivateNetwork, headers, dispatcherPolicy } = resolveProviderHttpRequestConfig({
		baseUrl: params.baseUrl,
		defaultBaseUrl: params.defaultBaseUrl,
		headers: params.headers,
		request: params.request,
		defaultHeaders: { authorization: `Bearer ${params.apiKey}` },
		provider: params.provider,
		api: "openai-audio-transcriptions",
		capability: "audio",
		transport: "media-understanding"
	});
	const url = `${baseUrl}/audio/transcriptions`;
	const model = resolveModel(params.model, params.defaultModel);
	const form = new FormData();
	const fileName = params.fileName?.trim() || path.basename(params.fileName) || "audio";
	const bytes = new Uint8Array(params.buffer);
	const blob = new Blob([bytes], { type: params.mime ?? "application/octet-stream" });
	form.append("file", blob, fileName);
	form.append("model", model);
	if (params.language?.trim()) form.append("language", params.language.trim());
	if (params.prompt?.trim()) form.append("prompt", params.prompt.trim());
	const { response: res, release } = await postTranscriptionRequest({
		url,
		headers,
		body: form,
		timeoutMs: params.timeoutMs,
		fetchFn,
		allowPrivateNetwork,
		dispatcherPolicy
	});
	try {
		await assertOkOrThrowHttpError(res, "Audio transcription failed");
		return {
			text: requireTranscriptionText((await res.json()).text, "Audio transcription response missing text"),
			model
		};
	} finally {
		await release();
	}
}
//#endregion
export { transcribeOpenAiCompatibleAudio as t };
