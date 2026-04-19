import { s as normalizeOptionalString } from "./string-coerce-BUSzWgUA.js";
import "./image-runtime-H0HMzsrb.js";
import { a as postTranscriptionRequest, o as requireTranscriptionText, s as resolveProviderHttpRequestConfig, t as assertOkOrThrowHttpError } from "./shared-Csk0T9PR.js";
import path from "node:path";
//#region src/media-understanding/openai-compatible-video.ts
function resolveMediaUnderstandingString(value, fallback) {
	return normalizeOptionalString(value) || fallback;
}
function coerceOpenAiCompatibleVideoText(payload) {
	const message = payload.choices?.[0]?.message;
	if (!message) return null;
	if (typeof message.content === "string" && message.content.trim()) return message.content.trim();
	if (Array.isArray(message.content)) {
		const text = message.content.map((part) => typeof part.text === "string" ? part.text.trim() : "").filter(Boolean).join("\n").trim();
		if (text) return text;
	}
	if (typeof message.reasoning_content === "string" && message.reasoning_content.trim()) return message.reasoning_content.trim();
	return null;
}
function buildOpenAiCompatibleVideoRequestBody(params) {
	return {
		model: params.model,
		messages: [{
			role: "user",
			content: [{
				type: "text",
				text: params.prompt
			}, {
				type: "video_url",
				video_url: { url: `data:${params.mime};base64,${params.buffer.toString("base64")}` }
			}]
		}]
	};
}
//#endregion
//#region src/media-understanding/openai-compatible-audio.ts
function resolveModel(model, fallback) {
	return model?.trim() || fallback;
}
function resolveUploadFileName(fileName, mime) {
	const trimmed = fileName?.trim();
	const baseName = trimmed ? path.basename(trimmed) : "audio";
	const lowerMime = mime?.trim().toLowerCase();
	if (/\.aac$/i.test(baseName)) return `${baseName.slice(0, -4) || "audio"}.m4a`;
	if (!path.extname(baseName) && lowerMime === "audio/aac") return `${baseName || "audio"}.m4a`;
	return baseName;
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
	const fileName = resolveUploadFileName(params.fileName, params.mime);
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
		pinDns: false,
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
export { resolveMediaUnderstandingString as i, buildOpenAiCompatibleVideoRequestBody as n, coerceOpenAiCompatibleVideoText as r, transcribeOpenAiCompatibleAudio as t };
