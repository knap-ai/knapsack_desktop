import { n as fetchWithSsrFGuard } from "./fetch-guard-CYl1q2XH.js";
import { n as createLazyRuntimeMethodBinder, r as createLazyRuntimeModule } from "./lazy-runtime-CPDBPNrj.js";
import path from "node:path";
//#region src/media-understanding/shared.ts
const MAX_ERROR_CHARS = 300;
function normalizeBaseUrl(baseUrl, fallback) {
	return (baseUrl?.trim() || fallback).replace(/\/+$/, "");
}
async function fetchWithTimeoutGuarded(url, init, timeoutMs, fetchFn, options) {
	return await fetchWithSsrFGuard({
		url,
		fetchImpl: fetchFn,
		init,
		timeoutMs,
		policy: options?.ssrfPolicy,
		lookupFn: options?.lookupFn,
		pinDns: options?.pinDns
	});
}
async function postTranscriptionRequest(params) {
	return fetchWithTimeoutGuarded(params.url, {
		method: "POST",
		headers: params.headers,
		body: params.body
	}, params.timeoutMs, params.fetchFn, params.allowPrivateNetwork ? { ssrfPolicy: { allowPrivateNetwork: true } } : void 0);
}
async function postJsonRequest(params) {
	return fetchWithTimeoutGuarded(params.url, {
		method: "POST",
		headers: params.headers,
		body: JSON.stringify(params.body)
	}, params.timeoutMs, params.fetchFn, params.allowPrivateNetwork ? { ssrfPolicy: { allowPrivateNetwork: true } } : void 0);
}
async function readErrorResponse(res) {
	try {
		const collapsed = (await res.text()).replace(/\s+/g, " ").trim();
		if (!collapsed) return;
		if (collapsed.length <= MAX_ERROR_CHARS) return collapsed;
		return `${collapsed.slice(0, MAX_ERROR_CHARS)}…`;
	} catch {
		return;
	}
}
async function assertOkOrThrowHttpError(res, label) {
	if (res.ok) return;
	const detail = await readErrorResponse(res);
	const suffix = detail ? `: ${detail}` : "";
	throw new Error(`${label} (HTTP ${res.status})${suffix}`);
}
function requireTranscriptionText(value, missingMessage) {
	const text = value?.trim();
	if (!text) throw new Error(missingMessage);
	return text;
}
//#endregion
//#region src/media-understanding/image-runtime.ts
const bindImageRuntime = createLazyRuntimeMethodBinder(createLazyRuntimeModule(() => import("./image-BgDRUJYP.js")));
const describeImageWithModel = bindImageRuntime((runtime) => runtime.describeImageWithModel);
const describeImagesWithModel = bindImageRuntime((runtime) => runtime.describeImagesWithModel);
//#endregion
//#region src/media-understanding/openai-compatible-audio.ts
function resolveModel$1(model, fallback) {
	return model?.trim() || fallback;
}
async function transcribeOpenAiCompatibleAudio(params) {
	const fetchFn = params.fetchFn ?? fetch;
	const baseUrl = normalizeBaseUrl(params.baseUrl, params.defaultBaseUrl);
	const allowPrivate = Boolean(params.baseUrl?.trim());
	const url = `${baseUrl}/audio/transcriptions`;
	const model = resolveModel$1(params.model, params.defaultModel);
	const form = new FormData();
	const fileName = params.fileName?.trim() || path.basename(params.fileName) || "audio";
	const bytes = new Uint8Array(params.buffer);
	const blob = new Blob([bytes], { type: params.mime ?? "application/octet-stream" });
	form.append("file", blob, fileName);
	form.append("model", model);
	if (params.language?.trim()) form.append("language", params.language.trim());
	if (params.prompt?.trim()) form.append("prompt", params.prompt.trim());
	const headers = new Headers(params.headers);
	if (!headers.has("authorization")) headers.set("authorization", `Bearer ${params.apiKey}`);
	const { response: res, release } = await postTranscriptionRequest({
		url,
		headers,
		body: form,
		timeoutMs: params.timeoutMs,
		fetchFn,
		allowPrivateNetwork: allowPrivate
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
//#region extensions/deepgram/audio.ts
const DEFAULT_DEEPGRAM_AUDIO_BASE_URL = "https://api.deepgram.com/v1";
const DEFAULT_DEEPGRAM_AUDIO_MODEL = "nova-3";
function resolveModel(model) {
	return model?.trim() || "nova-3";
}
async function transcribeDeepgramAudio(params) {
	const fetchFn = params.fetchFn ?? fetch;
	const baseUrl = normalizeBaseUrl(params.baseUrl, DEFAULT_DEEPGRAM_AUDIO_BASE_URL);
	const allowPrivate = Boolean(params.baseUrl?.trim());
	const model = resolveModel(params.model);
	const url = new URL(`${baseUrl}/listen`);
	url.searchParams.set("model", model);
	if (params.language?.trim()) url.searchParams.set("language", params.language.trim());
	if (params.query) for (const [key, value] of Object.entries(params.query)) {
		if (value === void 0) continue;
		url.searchParams.set(key, String(value));
	}
	const headers = new Headers(params.headers);
	if (!headers.has("authorization")) headers.set("authorization", `Token ${params.apiKey}`);
	if (!headers.has("content-type")) headers.set("content-type", params.mime ?? "application/octet-stream");
	const body = new Uint8Array(params.buffer);
	const { response: res, release } = await postTranscriptionRequest({
		url: url.toString(),
		headers,
		body,
		timeoutMs: params.timeoutMs,
		fetchFn,
		allowPrivateNetwork: allowPrivate
	});
	try {
		await assertOkOrThrowHttpError(res, "Audio transcription failed");
		return {
			text: requireTranscriptionText((await res.json()).results?.channels?.[0]?.alternatives?.[0]?.transcript, "Audio transcription response missing transcript"),
			model
		};
	} finally {
		await release();
	}
}
//#endregion
//#region extensions/deepgram/media-understanding-provider.ts
const deepgramMediaUnderstandingProvider = {
	id: "deepgram",
	capabilities: ["audio"],
	transcribeAudio: transcribeDeepgramAudio
};
//#endregion
//#region extensions/groq/media-understanding-provider.ts
const DEFAULT_GROQ_AUDIO_BASE_URL = "https://api.groq.com/openai/v1";
const DEFAULT_GROQ_AUDIO_MODEL = "whisper-large-v3-turbo";
const groqMediaUnderstandingProvider = {
	id: "groq",
	capabilities: ["audio"],
	transcribeAudio: (req) => transcribeOpenAiCompatibleAudio({
		...req,
		baseUrl: req.baseUrl ?? DEFAULT_GROQ_AUDIO_BASE_URL,
		defaultBaseUrl: DEFAULT_GROQ_AUDIO_BASE_URL,
		defaultModel: DEFAULT_GROQ_AUDIO_MODEL
	})
};
//#endregion
export { transcribeDeepgramAudio as a, describeImagesWithModel as c, postJsonRequest as d, postTranscriptionRequest as f, DEFAULT_DEEPGRAM_AUDIO_MODEL as i, assertOkOrThrowHttpError as l, deepgramMediaUnderstandingProvider as n, transcribeOpenAiCompatibleAudio as o, requireTranscriptionText as p, DEFAULT_DEEPGRAM_AUDIO_BASE_URL as r, describeImageWithModel as s, groqMediaUnderstandingProvider as t, normalizeBaseUrl as u };
