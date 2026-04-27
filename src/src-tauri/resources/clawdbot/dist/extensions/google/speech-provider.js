import { resolveGoogleGenerativeAiHttpRequestConfig } from "./api.js";
import { normalizeOptionalString } from "openclaw/plugin-sdk/text-runtime";
import { assertOkOrThrowProviderError, postJsonRequest } from "openclaw/plugin-sdk/provider-http";
import { normalizeResolvedSecretInputString } from "openclaw/plugin-sdk/secret-input";
import { asObject, trimToUndefined } from "openclaw/plugin-sdk/speech-core";
//#region extensions/google/speech-provider.ts
const DEFAULT_GOOGLE_TTS_MODEL = "gemini-3.1-flash-tts-preview";
const DEFAULT_GOOGLE_TTS_VOICE = "Kore";
const GOOGLE_TTS_SAMPLE_RATE = 24e3;
const GOOGLE_TTS_CHANNELS = 1;
const GOOGLE_TTS_BITS_PER_SAMPLE = 16;
const GOOGLE_TTS_VOICES = [
	"Zephyr",
	"Puck",
	"Charon",
	"Kore",
	"Fenrir",
	"Leda",
	"Orus",
	"Aoede",
	"Callirrhoe",
	"Autonoe",
	"Enceladus",
	"Iapetus",
	"Umbriel",
	"Algieba",
	"Despina",
	"Erinome",
	"Algenib",
	"Rasalgethi",
	"Laomedeia",
	"Achernar",
	"Alnilam",
	"Schedar",
	"Gacrux",
	"Pulcherrima",
	"Achird",
	"Zubenelgenubi",
	"Vindemiatrix",
	"Sadachbia",
	"Sadaltager",
	"Sulafat"
];
function normalizeGoogleTtsModel(model) {
	const trimmed = normalizeOptionalString(model);
	if (!trimmed) return DEFAULT_GOOGLE_TTS_MODEL;
	const withoutProvider = trimmed.startsWith("google/") ? trimmed.slice(7) : trimmed;
	return withoutProvider === "gemini-3.1-flash-tts" ? DEFAULT_GOOGLE_TTS_MODEL : withoutProvider;
}
function normalizeGoogleTtsVoiceName(voiceName) {
	return normalizeOptionalString(voiceName) ?? DEFAULT_GOOGLE_TTS_VOICE;
}
function resolveGoogleTtsEnvApiKey() {
	return normalizeOptionalString(process.env.GEMINI_API_KEY) ?? normalizeOptionalString(process.env.GOOGLE_API_KEY);
}
function resolveGoogleTtsModelProviderApiKey(cfg) {
	return normalizeResolvedSecretInputString({
		value: cfg?.models?.providers?.google?.apiKey,
		path: "models.providers.google.apiKey"
	});
}
function resolveGoogleTtsApiKey(params) {
	return readGoogleTtsProviderConfig(params.providerConfig).apiKey ?? resolveGoogleTtsModelProviderApiKey(params.cfg) ?? resolveGoogleTtsEnvApiKey();
}
function resolveGoogleTtsBaseUrl(params) {
	return params.providerConfig.baseUrl ?? trimToUndefined(params.cfg?.models?.providers?.google?.baseUrl);
}
function resolveGoogleTtsConfigRecord(rawConfig) {
	return asObject(asObject(rawConfig.providers)?.google) ?? asObject(rawConfig.google);
}
function normalizeGoogleTtsProviderConfig(rawConfig) {
	const raw = resolveGoogleTtsConfigRecord(rawConfig);
	return {
		apiKey: normalizeResolvedSecretInputString({
			value: raw?.apiKey,
			path: "messages.tts.providers.google.apiKey"
		}),
		baseUrl: trimToUndefined(raw?.baseUrl),
		model: normalizeGoogleTtsModel(raw?.model),
		voiceName: normalizeGoogleTtsVoiceName(raw?.voiceName ?? raw?.voice),
		audioProfile: trimToUndefined(raw?.audioProfile),
		speakerName: trimToUndefined(raw?.speakerName)
	};
}
function readGoogleTtsProviderConfig(config) {
	const normalized = normalizeGoogleTtsProviderConfig({});
	return {
		apiKey: trimToUndefined(config.apiKey) ?? normalized.apiKey,
		baseUrl: trimToUndefined(config.baseUrl) ?? normalized.baseUrl,
		model: normalizeGoogleTtsModel(config.model ?? normalized.model),
		voiceName: normalizeGoogleTtsVoiceName(config.voiceName ?? config.voice ?? normalized.voiceName),
		audioProfile: trimToUndefined(config.audioProfile) ?? normalized.audioProfile,
		speakerName: trimToUndefined(config.speakerName) ?? normalized.speakerName
	};
}
function readGoogleTtsOverrides(overrides) {
	if (!overrides) return {};
	return {
		model: normalizeOptionalString(overrides.model),
		voiceName: normalizeOptionalString(overrides.voiceName ?? overrides.voice),
		audioProfile: normalizeOptionalString(overrides.audioProfile),
		speakerName: normalizeOptionalString(overrides.speakerName)
	};
}
function composeGoogleTtsText(params) {
	return [
		trimToUndefined(params.audioProfile),
		trimToUndefined(params.speakerName) ? `Speaker name: ${params.speakerName}` : void 0,
		params.text
	].filter((part) => part !== void 0).join("\n\n");
}
function parseDirectiveToken(ctx) {
	switch (ctx.key) {
		case "voicename":
		case "voice_name":
		case "google_voice":
		case "googlevoice":
			if (!ctx.policy.allowVoice) return { handled: true };
			return {
				handled: true,
				overrides: { voiceName: ctx.value }
			};
		case "google_model":
		case "googlemodel":
			if (!ctx.policy.allowModelId) return { handled: true };
			return {
				handled: true,
				overrides: { model: ctx.value }
			};
		default: return { handled: false };
	}
}
function extractGoogleSpeechPcm(payload) {
	for (const candidate of payload.candidates ?? []) for (const part of candidate.content?.parts ?? []) {
		const data = normalizeOptionalString((part.inlineData ?? part.inline_data)?.data);
		if (!data) continue;
		return Buffer.from(data, "base64");
	}
	throw new Error("Google TTS response missing audio data");
}
function wrapPcm16MonoToWav(pcm, sampleRate = GOOGLE_TTS_SAMPLE_RATE) {
	const byteRate = sampleRate * GOOGLE_TTS_CHANNELS * (GOOGLE_TTS_BITS_PER_SAMPLE / 8);
	const blockAlign = GOOGLE_TTS_CHANNELS * (GOOGLE_TTS_BITS_PER_SAMPLE / 8);
	const header = Buffer.alloc(44);
	header.write("RIFF", 0, "ascii");
	header.writeUInt32LE(36 + pcm.length, 4);
	header.write("WAVE", 8, "ascii");
	header.write("fmt ", 12, "ascii");
	header.writeUInt32LE(16, 16);
	header.writeUInt16LE(1, 20);
	header.writeUInt16LE(GOOGLE_TTS_CHANNELS, 22);
	header.writeUInt32LE(sampleRate, 24);
	header.writeUInt32LE(byteRate, 28);
	header.writeUInt16LE(blockAlign, 32);
	header.writeUInt16LE(GOOGLE_TTS_BITS_PER_SAMPLE, 34);
	header.write("data", 36, "ascii");
	header.writeUInt32LE(pcm.length, 40);
	return Buffer.concat([header, pcm]);
}
async function synthesizeGoogleTtsPcm(params) {
	const { baseUrl, allowPrivateNetwork, headers, dispatcherPolicy } = resolveGoogleGenerativeAiHttpRequestConfig({
		apiKey: params.apiKey,
		baseUrl: params.baseUrl,
		capability: "audio",
		transport: "http"
	});
	const { response: res, release } = await postJsonRequest({
		url: `${baseUrl}/models/${params.model}:generateContent`,
		headers,
		body: {
			contents: [{
				role: "user",
				parts: [{ text: composeGoogleTtsText({
					text: params.text,
					audioProfile: params.audioProfile,
					speakerName: params.speakerName
				}) }]
			}],
			generationConfig: {
				responseModalities: ["AUDIO"],
				speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: params.voiceName } } }
			}
		},
		timeoutMs: params.timeoutMs,
		fetchFn: fetch,
		pinDns: false,
		allowPrivateNetwork,
		dispatcherPolicy
	});
	try {
		await assertOkOrThrowProviderError(res, "Google TTS failed");
		return extractGoogleSpeechPcm(await res.json());
	} finally {
		await release();
	}
}
function buildGoogleSpeechProvider() {
	return {
		id: "google",
		label: "Google",
		autoSelectOrder: 50,
		models: [DEFAULT_GOOGLE_TTS_MODEL],
		voices: GOOGLE_TTS_VOICES,
		resolveConfig: ({ rawConfig }) => normalizeGoogleTtsProviderConfig(rawConfig),
		parseDirectiveToken,
		resolveTalkConfig: ({ baseTtsConfig, talkProviderConfig }) => {
			return {
				...normalizeGoogleTtsProviderConfig(baseTtsConfig),
				...talkProviderConfig.apiKey === void 0 ? {} : { apiKey: normalizeResolvedSecretInputString({
					value: talkProviderConfig.apiKey,
					path: "talk.providers.google.apiKey"
				}) },
				...trimToUndefined(talkProviderConfig.baseUrl) == null ? {} : { baseUrl: trimToUndefined(talkProviderConfig.baseUrl) },
				...trimToUndefined(talkProviderConfig.modelId) == null ? {} : { model: normalizeGoogleTtsModel(talkProviderConfig.modelId) },
				...trimToUndefined(talkProviderConfig.voiceId) == null ? {} : { voiceName: normalizeGoogleTtsVoiceName(talkProviderConfig.voiceId) }
			};
		},
		resolveTalkOverrides: ({ params }) => ({
			...trimToUndefined(params.voiceId) == null ? {} : { voiceName: normalizeGoogleTtsVoiceName(params.voiceId) },
			...trimToUndefined(params.modelId) == null ? {} : { model: normalizeGoogleTtsModel(params.modelId) }
		}),
		listVoices: async () => GOOGLE_TTS_VOICES.map((voice) => ({
			id: voice,
			name: voice
		})),
		isConfigured: ({ cfg, providerConfig }) => Boolean(resolveGoogleTtsApiKey({
			cfg,
			providerConfig
		})),
		synthesize: async (req) => {
			const config = readGoogleTtsProviderConfig(req.providerConfig);
			const overrides = readGoogleTtsOverrides(req.providerOverrides);
			const apiKey = resolveGoogleTtsApiKey({
				cfg: req.cfg,
				providerConfig: req.providerConfig
			});
			if (!apiKey) throw new Error("Google API key missing");
			return {
				audioBuffer: wrapPcm16MonoToWav(await synthesizeGoogleTtsPcm({
					text: req.text,
					apiKey,
					baseUrl: resolveGoogleTtsBaseUrl({
						cfg: req.cfg,
						providerConfig: config
					}),
					model: normalizeGoogleTtsModel(overrides.model ?? config.model),
					voiceName: normalizeGoogleTtsVoiceName(overrides.voiceName ?? config.voiceName),
					audioProfile: overrides.audioProfile ?? config.audioProfile,
					speakerName: overrides.speakerName ?? config.speakerName,
					timeoutMs: req.timeoutMs
				})),
				outputFormat: "wav",
				fileExtension: ".wav",
				voiceCompatible: false
			};
		},
		synthesizeTelephony: async (req) => {
			const config = readGoogleTtsProviderConfig(req.providerConfig);
			const apiKey = resolveGoogleTtsApiKey({
				cfg: req.cfg,
				providerConfig: req.providerConfig
			});
			if (!apiKey) throw new Error("Google API key missing");
			return {
				audioBuffer: await synthesizeGoogleTtsPcm({
					text: req.text,
					apiKey,
					baseUrl: resolveGoogleTtsBaseUrl({
						cfg: req.cfg,
						providerConfig: config
					}),
					model: config.model,
					voiceName: config.voiceName,
					audioProfile: config.audioProfile,
					speakerName: config.speakerName,
					timeoutMs: req.timeoutMs
				}),
				outputFormat: "pcm",
				sampleRate: GOOGLE_TTS_SAMPLE_RATE
			};
		}
	};
}
const __testing = {
	DEFAULT_GOOGLE_TTS_MODEL,
	DEFAULT_GOOGLE_TTS_VOICE,
	GOOGLE_TTS_SAMPLE_RATE,
	normalizeGoogleTtsModel,
	wrapPcm16MonoToWav
};
//#endregion
export { __testing, buildGoogleSpeechProvider };
