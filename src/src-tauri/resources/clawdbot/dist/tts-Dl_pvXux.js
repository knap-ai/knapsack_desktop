import { s as normalizeOptionalString } from "./string-coerce-BUSzWgUA.js";
import { a as isDebugProxyGlobalFetchPatchInstalled, t as captureHttpExchange } from "./runtime-CdS7ehWO.js";
import "./proxy-capture-NT34yEe7.js";
import { i as truncateErrorDetail, n as asObject, r as readResponseTextLimited } from "./provider-error-utils-CyJAWFR1.js";
import "./speech-ACUvTzdV.js";
//#region extensions/openai/tts.ts
const DEFAULT_OPENAI_BASE_URL = "https://api.openai.com/v1";
const OPENAI_TTS_MODELS = [
	"gpt-4o-mini-tts",
	"tts-1",
	"tts-1-hd"
];
const OPENAI_TTS_VOICES = [
	"alloy",
	"ash",
	"ballad",
	"cedar",
	"coral",
	"echo",
	"fable",
	"juniper",
	"marin",
	"onyx",
	"nova",
	"sage",
	"shimmer",
	"verse"
];
function normalizeOpenAITtsBaseUrl(baseUrl) {
	const trimmed = baseUrl?.trim();
	if (!trimmed) return DEFAULT_OPENAI_BASE_URL;
	return trimmed.replace(/\/+$/, "");
}
function isCustomOpenAIEndpoint(baseUrl) {
	if (baseUrl != null) return normalizeOpenAITtsBaseUrl(baseUrl) !== DEFAULT_OPENAI_BASE_URL;
	return normalizeOpenAITtsBaseUrl(process.env.OPENAI_TTS_BASE_URL) !== DEFAULT_OPENAI_BASE_URL;
}
function isValidOpenAIModel(model, baseUrl) {
	if (isCustomOpenAIEndpoint(baseUrl)) return true;
	return OPENAI_TTS_MODELS.includes(model);
}
function isValidOpenAIVoice(voice, baseUrl) {
	if (isCustomOpenAIEndpoint(baseUrl)) return true;
	return OPENAI_TTS_VOICES.includes(voice);
}
function resolveOpenAITtsInstructions(model, instructions) {
	const next = instructions?.trim();
	return next && model.includes("gpt-4o-mini-tts") ? next : void 0;
}
function formatOpenAiErrorPayload(payload) {
	const root = asObject(payload);
	const subject = asObject(root?.error) ?? root;
	if (!subject) return;
	const message = normalizeOptionalString(subject.message) ?? normalizeOptionalString(subject.detail) ?? normalizeOptionalString(root?.message);
	const type = normalizeOptionalString(subject.type);
	const code = normalizeOptionalString(subject.code);
	const metadata = [type ? `type=${type}` : void 0, code ? `code=${code}` : void 0].filter((value) => Boolean(value)).join(", ");
	if (message && metadata) return `${truncateErrorDetail(message)} [${metadata}]`;
	if (message) return truncateErrorDetail(message);
	if (metadata) return `[${metadata}]`;
}
async function extractOpenAiErrorDetail(response) {
	const rawBody = normalizeOptionalString(await readResponseTextLimited(response));
	if (!rawBody) return;
	try {
		return formatOpenAiErrorPayload(JSON.parse(rawBody)) ?? truncateErrorDetail(rawBody);
	} catch {
		return truncateErrorDetail(rawBody);
	}
}
async function openaiTTS(params) {
	const { text, apiKey, baseUrl, model, voice, speed, instructions, responseFormat, timeoutMs } = params;
	const effectiveInstructions = resolveOpenAITtsInstructions(model, instructions);
	if (!isValidOpenAIModel(model, baseUrl)) throw new Error(`Invalid model: ${model}`);
	if (!isValidOpenAIVoice(voice, baseUrl)) throw new Error(`Invalid voice: ${voice}`);
	const controller = new AbortController();
	const timeout = setTimeout(() => controller.abort(), timeoutMs);
	try {
		const requestHeaders = {
			Authorization: `Bearer ${apiKey}`,
			"Content-Type": "application/json"
		};
		const requestBody = JSON.stringify({
			model,
			input: text,
			voice,
			response_format: responseFormat,
			...speed != null && { speed },
			...effectiveInstructions != null && { instructions: effectiveInstructions }
		});
		const response = await fetch(`${baseUrl}/audio/speech`, {
			method: "POST",
			headers: requestHeaders,
			body: requestBody,
			signal: controller.signal
		});
		if (!isDebugProxyGlobalFetchPatchInstalled()) captureHttpExchange({
			url: `${baseUrl}/audio/speech`,
			method: "POST",
			requestHeaders,
			requestBody,
			response,
			transport: "http",
			meta: {
				provider: "openai",
				capability: "tts"
			}
		});
		if (!response.ok) {
			const detail = await extractOpenAiErrorDetail(response);
			const requestId = normalizeOptionalString(response.headers.get("x-request-id")) ?? normalizeOptionalString(response.headers.get("request-id"));
			throw new Error(`OpenAI TTS API error (${response.status})` + (detail ? `: ${detail}` : "") + (requestId ? ` [request_id=${requestId}]` : ""));
		}
		return Buffer.from(await response.arrayBuffer());
	} finally {
		clearTimeout(timeout);
	}
}
//#endregion
export { isValidOpenAIVoice as a, resolveOpenAITtsInstructions as c, isValidOpenAIModel as i, OPENAI_TTS_MODELS as n, normalizeOpenAITtsBaseUrl as o, OPENAI_TTS_VOICES as r, openaiTTS as s, DEFAULT_OPENAI_BASE_URL as t };
