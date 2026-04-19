import { s as normalizeOptionalString } from "./string-coerce-BUSzWgUA.js";
import { i as truncateErrorDetail, n as asObject, r as readResponseTextLimited } from "./provider-error-utils-CyJAWFR1.js";
import { i as requireInRange, n as normalizeLanguageCode, r as normalizeSeed, t as normalizeApplyTextNormalization } from "./speech-ACUvTzdV.js";
import { n as isValidElevenLabsVoiceId, r as normalizeElevenLabsBaseUrl } from "./shared-ewwEJZIT.js";
//#region extensions/elevenlabs/tts.ts
function formatElevenLabsErrorPayload(payload) {
	const root = asObject(payload);
	if (!root) return;
	const detailObject = asObject(root.detail);
	const message = normalizeOptionalString(root.message) ?? normalizeOptionalString(detailObject?.message) ?? normalizeOptionalString(detailObject?.detail) ?? normalizeOptionalString(root.error);
	const code = normalizeOptionalString(root.code) ?? normalizeOptionalString(detailObject?.code) ?? normalizeOptionalString(detailObject?.status);
	if (message && code) return `${truncateErrorDetail(message)} [code=${code}]`;
	if (message) return truncateErrorDetail(message);
	if (code) return `[code=${code}]`;
}
async function extractElevenLabsErrorDetail(response) {
	const rawBody = normalizeOptionalString(await readResponseTextLimited(response));
	if (!rawBody) return;
	try {
		return formatElevenLabsErrorPayload(JSON.parse(rawBody)) ?? truncateErrorDetail(rawBody);
	} catch {
		return truncateErrorDetail(rawBody);
	}
}
function assertElevenLabsVoiceSettings(settings) {
	requireInRange(settings.stability, 0, 1, "stability");
	requireInRange(settings.similarityBoost, 0, 1, "similarityBoost");
	requireInRange(settings.style, 0, 1, "style");
	requireInRange(settings.speed, .5, 2, "speed");
}
async function elevenLabsTTS(params) {
	const { text, apiKey, baseUrl, voiceId, modelId, outputFormat, seed, applyTextNormalization, languageCode, latencyTier, voiceSettings, timeoutMs } = params;
	if (!isValidElevenLabsVoiceId(voiceId)) throw new Error("Invalid voiceId format");
	assertElevenLabsVoiceSettings(voiceSettings);
	const normalizedLanguage = normalizeLanguageCode(languageCode);
	const normalizedNormalization = normalizeApplyTextNormalization(applyTextNormalization);
	const normalizedSeed = normalizeSeed(seed);
	const controller = new AbortController();
	const timeout = setTimeout(() => controller.abort(), timeoutMs);
	try {
		const url = new URL(`${normalizeElevenLabsBaseUrl(baseUrl)}/v1/text-to-speech/${voiceId}`);
		if (outputFormat) url.searchParams.set("output_format", outputFormat);
		const response = await fetch(url.toString(), {
			method: "POST",
			headers: {
				"xi-api-key": apiKey,
				"Content-Type": "application/json",
				Accept: "audio/mpeg"
			},
			body: JSON.stringify({
				text,
				model_id: modelId,
				seed: normalizedSeed,
				apply_text_normalization: normalizedNormalization,
				language_code: normalizedLanguage,
				latency_optimization_level: latencyTier,
				voice_settings: {
					stability: voiceSettings.stability,
					similarity_boost: voiceSettings.similarityBoost,
					style: voiceSettings.style,
					use_speaker_boost: voiceSettings.useSpeakerBoost,
					speed: voiceSettings.speed
				}
			}),
			signal: controller.signal
		});
		if (!response.ok) {
			const detail = await extractElevenLabsErrorDetail(response);
			const requestId = normalizeOptionalString(response.headers.get("x-request-id")) ?? normalizeOptionalString(response.headers.get("request-id"));
			throw new Error(`ElevenLabs API error (${response.status})` + (detail ? `: ${detail}` : "") + (requestId ? ` [request_id=${requestId}]` : ""));
		}
		return Buffer.from(await response.arrayBuffer());
	} finally {
		clearTimeout(timeout);
	}
}
//#endregion
export { elevenLabsTTS as t };
