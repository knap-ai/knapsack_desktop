import { i as normalizeLowercaseStringOrEmpty, o as normalizeOptionalLowercaseString } from "./string-coerce-BUSzWgUA.js";
import { c as normalizeResolvedSecretInputString } from "./types.secrets-CeL3gSMO.js";
import "./text-runtime-DTMxvodz.js";
import "./secret-input-BEMaS7ol.js";
import { a as trimToUndefined, i as resolveOpenAIProviderConfigRecord, n as asObjectRecord, t as asFiniteNumber } from "./realtime-provider-shared-Dy5mDedN.js";
import { a as isValidOpenAIVoice, i as isValidOpenAIModel, n as OPENAI_TTS_MODELS, o as normalizeOpenAITtsBaseUrl, r as OPENAI_TTS_VOICES, s as openaiTTS } from "./tts-Dl_pvXux.js";
//#region extensions/openai/speech-provider.ts
const OPENAI_SPEECH_RESPONSE_FORMATS = [
	"mp3",
	"opus",
	"wav"
];
function normalizeOpenAISpeechResponseFormat(value) {
	const next = normalizeOptionalLowercaseString(value);
	if (!next) return;
	if (OPENAI_SPEECH_RESPONSE_FORMATS.includes(next)) return next;
	throw new Error(`Invalid OpenAI speech responseFormat: ${next}`);
}
function isGroqSpeechBaseUrl(baseUrl) {
	try {
		const hostname = normalizeLowercaseStringOrEmpty(new URL(baseUrl).hostname);
		return hostname === "groq.com" || hostname.endsWith(".groq.com");
	} catch {
		return false;
	}
}
function resolveSpeechResponseFormat(baseUrl, target, configuredFormat) {
	if (configuredFormat) return configuredFormat;
	if (isGroqSpeechBaseUrl(baseUrl)) return "wav";
	return target === "voice-note" ? "opus" : "mp3";
}
function responseFormatToFileExtension(format) {
	switch (format) {
		case "opus": return ".opus";
		case "wav": return ".wav";
		default: return ".mp3";
	}
}
function normalizeOpenAIProviderConfig(rawConfig) {
	const raw = resolveOpenAIProviderConfigRecord(rawConfig);
	return {
		apiKey: normalizeResolvedSecretInputString({
			value: raw?.apiKey,
			path: "messages.tts.providers.openai.apiKey"
		}),
		baseUrl: normalizeOpenAITtsBaseUrl(trimToUndefined(raw?.baseUrl) ?? trimToUndefined(process.env.OPENAI_TTS_BASE_URL) ?? "https://api.openai.com/v1"),
		model: trimToUndefined(raw?.model) ?? "gpt-4o-mini-tts",
		voice: trimToUndefined(raw?.voice) ?? "coral",
		speed: asFiniteNumber(raw?.speed),
		instructions: trimToUndefined(raw?.instructions),
		responseFormat: normalizeOpenAISpeechResponseFormat(raw?.responseFormat)
	};
}
function readOpenAIProviderConfig(config) {
	const normalized = normalizeOpenAIProviderConfig({});
	return {
		apiKey: trimToUndefined(config.apiKey) ?? normalized.apiKey,
		baseUrl: trimToUndefined(config.baseUrl) ?? normalized.baseUrl,
		model: trimToUndefined(config.model) ?? normalized.model,
		voice: trimToUndefined(config.voice) ?? normalized.voice,
		speed: asFiniteNumber(config.speed) ?? normalized.speed,
		instructions: trimToUndefined(config.instructions) ?? normalized.instructions,
		responseFormat: normalizeOpenAISpeechResponseFormat(config.responseFormat) ?? normalized.responseFormat
	};
}
function readOpenAIOverrides(overrides) {
	if (!overrides) return {};
	return {
		model: trimToUndefined(overrides.model),
		voice: trimToUndefined(overrides.voice),
		speed: asFiniteNumber(overrides.speed)
	};
}
function parseDirectiveToken(ctx) {
	const baseUrl = trimToUndefined(asObjectRecord(ctx.providerConfig)?.baseUrl);
	switch (ctx.key) {
		case "voice":
		case "openai_voice":
		case "openaivoice":
			if (!ctx.policy.allowVoice) return { handled: true };
			if (!isValidOpenAIVoice(ctx.value, baseUrl)) return {
				handled: true,
				warnings: [`invalid OpenAI voice "${ctx.value}"`]
			};
			return {
				handled: true,
				overrides: { voice: ctx.value }
			};
		case "model":
		case "openai_model":
		case "openaimodel":
			if (!ctx.policy.allowModelId) return { handled: true };
			if (!isValidOpenAIModel(ctx.value, baseUrl)) return { handled: false };
			return {
				handled: true,
				overrides: { model: ctx.value }
			};
		default: return { handled: false };
	}
}
function buildOpenAISpeechProvider() {
	return {
		id: "openai",
		label: "OpenAI",
		autoSelectOrder: 10,
		models: OPENAI_TTS_MODELS,
		voices: OPENAI_TTS_VOICES,
		resolveConfig: ({ rawConfig }) => normalizeOpenAIProviderConfig(rawConfig),
		parseDirectiveToken,
		resolveTalkConfig: ({ baseTtsConfig, talkProviderConfig }) => {
			const base = normalizeOpenAIProviderConfig(baseTtsConfig);
			const responseFormat = normalizeOpenAISpeechResponseFormat(talkProviderConfig.responseFormat);
			return {
				...base,
				...talkProviderConfig.apiKey === void 0 ? {} : { apiKey: normalizeResolvedSecretInputString({
					value: talkProviderConfig.apiKey,
					path: "talk.providers.openai.apiKey"
				}) },
				...trimToUndefined(talkProviderConfig.baseUrl) == null ? {} : { baseUrl: trimToUndefined(talkProviderConfig.baseUrl) },
				...trimToUndefined(talkProviderConfig.modelId) == null ? {} : { model: trimToUndefined(talkProviderConfig.modelId) },
				...trimToUndefined(talkProviderConfig.voiceId) == null ? {} : { voice: trimToUndefined(talkProviderConfig.voiceId) },
				...asFiniteNumber(talkProviderConfig.speed) == null ? {} : { speed: asFiniteNumber(talkProviderConfig.speed) },
				...trimToUndefined(talkProviderConfig.instructions) == null ? {} : { instructions: trimToUndefined(talkProviderConfig.instructions) },
				...responseFormat == null ? {} : { responseFormat }
			};
		},
		resolveTalkOverrides: ({ params }) => ({
			...trimToUndefined(params.voiceId) == null ? {} : { voice: trimToUndefined(params.voiceId) },
			...trimToUndefined(params.modelId) == null ? {} : { model: trimToUndefined(params.modelId) },
			...asFiniteNumber(params.speed) == null ? {} : { speed: asFiniteNumber(params.speed) }
		}),
		listVoices: async () => OPENAI_TTS_VOICES.map((voice) => ({
			id: voice,
			name: voice
		})),
		isConfigured: ({ providerConfig }) => Boolean(readOpenAIProviderConfig(providerConfig).apiKey || process.env.OPENAI_API_KEY),
		synthesize: async (req) => {
			const config = readOpenAIProviderConfig(req.providerConfig);
			const overrides = readOpenAIOverrides(req.providerOverrides);
			const apiKey = config.apiKey || process.env.OPENAI_API_KEY;
			if (!apiKey) throw new Error("OpenAI API key missing");
			const responseFormat = resolveSpeechResponseFormat(config.baseUrl, req.target, config.responseFormat);
			return {
				audioBuffer: await openaiTTS({
					text: req.text,
					apiKey,
					baseUrl: config.baseUrl,
					model: overrides.model ?? config.model,
					voice: overrides.voice ?? config.voice,
					speed: overrides.speed ?? config.speed,
					instructions: config.instructions,
					responseFormat,
					timeoutMs: req.timeoutMs
				}),
				outputFormat: responseFormat,
				fileExtension: responseFormatToFileExtension(responseFormat),
				voiceCompatible: req.target === "voice-note" && responseFormat === "opus"
			};
		},
		synthesizeTelephony: async (req) => {
			const config = readOpenAIProviderConfig(req.providerConfig);
			const apiKey = config.apiKey || process.env.OPENAI_API_KEY;
			if (!apiKey) throw new Error("OpenAI API key missing");
			const outputFormat = "pcm";
			return {
				audioBuffer: await openaiTTS({
					text: req.text,
					apiKey,
					baseUrl: config.baseUrl,
					model: config.model,
					voice: config.voice,
					speed: config.speed,
					instructions: config.instructions,
					responseFormat: outputFormat,
					timeoutMs: req.timeoutMs
				}),
				outputFormat,
				sampleRate: 24e3
			};
		}
	};
}
//#endregion
export { buildOpenAISpeechProvider as t };
