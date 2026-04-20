import { c as normalizeResolvedSecretInputString } from "./types.secrets-CeL3gSMO.js";
import { i as postJsonRequest, s as resolveProviderHttpRequestConfig, t as assertOkOrThrowHttpError } from "./shared-Csk0T9PR.js";
import "./secret-input-BEMaS7ol.js";
import "./speech-core-D2B95hFO.js";
import { n as asObject } from "./provider-error-utils-CyJAWFR1.js";
import "./provider-http--wdeUhlc.js";
import { c as extractVydraResultUrls, g as trimToUndefined, i as DEFAULT_VYDRA_SPEECH_MODEL, l as normalizeVydraBaseUrl, n as DEFAULT_VYDRA_BASE_URL, o as DEFAULT_VYDRA_VOICE_ID, s as downloadVydraAsset } from "./shared-BnaU2Ni3.js";
//#region extensions/vydra/speech-provider.ts
const VYDRA_SPEECH_VOICES = [{
	id: DEFAULT_VYDRA_VOICE_ID,
	name: "Rachel"
}];
function normalizeVydraSpeechConfig(rawConfig) {
	const raw = asObject(asObject(rawConfig.providers)?.vydra) ?? asObject(rawConfig.vydra);
	return {
		apiKey: normalizeResolvedSecretInputString({
			value: raw?.apiKey,
			path: "messages.tts.providers.vydra.apiKey"
		}),
		baseUrl: normalizeVydraBaseUrl(trimToUndefined(raw?.baseUrl) ?? trimToUndefined(process.env.VYDRA_BASE_URL)),
		model: trimToUndefined(raw?.model) ?? trimToUndefined(process.env.VYDRA_TTS_MODEL) ?? "elevenlabs/tts",
		voiceId: trimToUndefined(raw?.voiceId) ?? trimToUndefined(process.env.VYDRA_TTS_VOICE_ID) ?? "21m00Tcm4TlvDq8ikWAM"
	};
}
function readVydraSpeechConfig(config) {
	const normalized = normalizeVydraSpeechConfig({});
	return {
		apiKey: trimToUndefined(config.apiKey) ?? normalized.apiKey,
		baseUrl: normalizeVydraBaseUrl(trimToUndefined(config.baseUrl) ?? normalized.baseUrl),
		model: trimToUndefined(config.model) ?? normalized.model,
		voiceId: trimToUndefined(config.voiceId) ?? normalized.voiceId
	};
}
function readVydraOverrides(overrides) {
	if (!overrides) return {};
	return {
		model: trimToUndefined(overrides.model),
		voiceId: trimToUndefined(overrides.voiceId)
	};
}
function buildVydraSpeechProvider() {
	return {
		id: "vydra",
		label: "Vydra",
		models: [DEFAULT_VYDRA_SPEECH_MODEL],
		voices: VYDRA_SPEECH_VOICES.map((voice) => voice.id),
		resolveConfig: ({ rawConfig }) => normalizeVydraSpeechConfig(rawConfig),
		listVoices: async () => VYDRA_SPEECH_VOICES.map((voice) => ({ ...voice })),
		isConfigured: ({ providerConfig }) => Boolean(readVydraSpeechConfig(providerConfig).apiKey || process.env.VYDRA_API_KEY),
		synthesize: async (req) => {
			const config = readVydraSpeechConfig(req.providerConfig);
			const overrides = readVydraOverrides(req.providerOverrides);
			const apiKey = config.apiKey || process.env.VYDRA_API_KEY;
			if (!apiKey) throw new Error("Vydra API key missing");
			const fetchFn = fetch;
			const { baseUrl, allowPrivateNetwork, headers, dispatcherPolicy } = resolveProviderHttpRequestConfig({
				baseUrl: config.baseUrl,
				defaultBaseUrl: DEFAULT_VYDRA_BASE_URL,
				allowPrivateNetwork: false,
				defaultHeaders: {
					Authorization: `Bearer ${apiKey}`,
					"Content-Type": "application/json"
				},
				provider: "vydra",
				capability: "audio",
				transport: "http"
			});
			const { response, release } = await postJsonRequest({
				url: `${baseUrl}/models/${overrides.model ?? config.model}`,
				headers,
				body: {
					text: req.text,
					voice_id: overrides.voiceId ?? config.voiceId
				},
				timeoutMs: req.timeoutMs,
				fetchFn,
				allowPrivateNetwork,
				dispatcherPolicy
			});
			try {
				await assertOkOrThrowHttpError(response, "Vydra speech synthesis failed");
				const audioUrl = extractVydraResultUrls(await response.json(), "audio")[0];
				if (!audioUrl) throw new Error("Vydra speech synthesis response missing audio URL");
				const audio = await downloadVydraAsset({
					url: audioUrl,
					kind: "audio",
					timeoutMs: req.timeoutMs,
					fetchFn
				});
				return {
					audioBuffer: audio.buffer,
					outputFormat: audio.mimeType.includes("wav") ? "wav" : "mp3",
					fileExtension: audio.fileName.endsWith(".wav") ? ".wav" : ".mp3",
					voiceCompatible: false
				};
			} finally {
				await release();
			}
		}
	};
}
//#endregion
export { buildVydraSpeechProvider as t };
