import { s as normalizeOptionalString } from "./string-coerce-BUSzWgUA.js";
import { c as normalizeResolvedSecretInputString } from "./types.secrets-CeL3gSMO.js";
import { t as asFiniteNumber } from "./number-coercion-Cl2KmzKx.js";
import "./secret-input-BEMaS7ol.js";
import "./speech-core-D2B95hFO.js";
import { n as asObject } from "./provider-error-utils-CyJAWFR1.js";
import { a as normalizeMinimaxTtsBaseUrl, i as minimaxTTS, n as MINIMAX_TTS_MODELS, r as MINIMAX_TTS_VOICES } from "./tts-Badkui6R.js";
//#region extensions/minimax/speech-provider.ts
function normalizeMinimaxProviderConfig(rawConfig) {
	const raw = asObject(asObject(rawConfig.providers)?.minimax) ?? asObject(rawConfig.minimax);
	return {
		apiKey: normalizeResolvedSecretInputString({
			value: raw?.apiKey,
			path: "messages.tts.providers.minimax.apiKey"
		}),
		baseUrl: normalizeMinimaxTtsBaseUrl(normalizeOptionalString(raw?.baseUrl) ?? normalizeOptionalString(process.env.MINIMAX_API_HOST) ?? "https://api.minimax.io"),
		model: normalizeOptionalString(raw?.model) ?? normalizeOptionalString(process.env.MINIMAX_TTS_MODEL) ?? "speech-2.8-hd",
		voiceId: normalizeOptionalString(raw?.voiceId) ?? normalizeOptionalString(process.env.MINIMAX_TTS_VOICE_ID) ?? "English_expressive_narrator",
		speed: asFiniteNumber(raw?.speed),
		vol: asFiniteNumber(raw?.vol),
		pitch: asFiniteNumber(raw?.pitch)
	};
}
function readMinimaxProviderConfig(config) {
	const normalized = normalizeMinimaxProviderConfig({});
	return {
		apiKey: normalizeOptionalString(config.apiKey) ?? normalized.apiKey,
		baseUrl: normalizeOptionalString(config.baseUrl) ?? normalized.baseUrl,
		model: normalizeOptionalString(config.model) ?? normalized.model,
		voiceId: normalizeOptionalString(config.voiceId) ?? normalized.voiceId,
		speed: asFiniteNumber(config.speed) ?? normalized.speed,
		vol: asFiniteNumber(config.vol) ?? normalized.vol,
		pitch: asFiniteNumber(config.pitch) ?? normalized.pitch
	};
}
function readMinimaxOverrides(overrides) {
	if (!overrides) return {};
	return {
		model: normalizeOptionalString(overrides.model),
		voiceId: normalizeOptionalString(overrides.voiceId),
		speed: asFiniteNumber(overrides.speed),
		vol: asFiniteNumber(overrides.vol),
		pitch: asFiniteNumber(overrides.pitch)
	};
}
function parseDirectiveToken(ctx) {
	switch (ctx.key) {
		case "voice":
		case "voiceid":
		case "voice_id":
		case "minimax_voice":
		case "minimaxvoice":
			if (!ctx.policy.allowVoice) return { handled: true };
			return {
				handled: true,
				overrides: { voiceId: ctx.value }
			};
		case "model":
		case "minimax_model":
		case "minimaxmodel":
			if (!ctx.policy.allowModelId) return { handled: true };
			return {
				handled: true,
				overrides: { model: ctx.value }
			};
		case "speed": {
			if (!ctx.policy.allowVoiceSettings) return { handled: true };
			const speed = Number(ctx.value);
			if (!Number.isFinite(speed) || speed < .5 || speed > 2) return {
				handled: true,
				warnings: [`invalid MiniMax speed "${ctx.value}" (0.5-2.0)`]
			};
			return {
				handled: true,
				overrides: { speed }
			};
		}
		case "vol":
		case "volume": {
			if (!ctx.policy.allowVoiceSettings) return { handled: true };
			const vol = Number(ctx.value);
			if (!Number.isFinite(vol) || vol <= 0 || vol > 10) return {
				handled: true,
				warnings: [`invalid MiniMax volume "${ctx.value}" (0-10, exclusive)`]
			};
			return {
				handled: true,
				overrides: { vol }
			};
		}
		case "pitch": {
			if (!ctx.policy.allowVoiceSettings) return { handled: true };
			const pitch = Number(ctx.value);
			if (!Number.isFinite(pitch) || pitch < -12 || pitch > 12) return {
				handled: true,
				warnings: [`invalid MiniMax pitch "${ctx.value}" (-12 to 12)`]
			};
			return {
				handled: true,
				overrides: { pitch }
			};
		}
		default: return { handled: false };
	}
}
function buildMinimaxSpeechProvider() {
	return {
		id: "minimax",
		label: "MiniMax",
		autoSelectOrder: 40,
		models: MINIMAX_TTS_MODELS,
		voices: MINIMAX_TTS_VOICES,
		resolveConfig: ({ rawConfig }) => normalizeMinimaxProviderConfig(rawConfig),
		parseDirectiveToken,
		resolveTalkConfig: ({ baseTtsConfig, talkProviderConfig }) => {
			return {
				...normalizeMinimaxProviderConfig(baseTtsConfig),
				...talkProviderConfig.apiKey === void 0 ? {} : { apiKey: normalizeResolvedSecretInputString({
					value: talkProviderConfig.apiKey,
					path: "talk.providers.minimax.apiKey"
				}) },
				...normalizeOptionalString(talkProviderConfig.baseUrl) == null ? {} : { baseUrl: normalizeMinimaxTtsBaseUrl(normalizeOptionalString(talkProviderConfig.baseUrl)) },
				...normalizeOptionalString(talkProviderConfig.modelId) == null ? {} : { model: normalizeOptionalString(talkProviderConfig.modelId) },
				...normalizeOptionalString(talkProviderConfig.voiceId) == null ? {} : { voiceId: normalizeOptionalString(talkProviderConfig.voiceId) },
				...asFiniteNumber(talkProviderConfig.speed) == null ? {} : { speed: asFiniteNumber(talkProviderConfig.speed) },
				...asFiniteNumber(talkProviderConfig.vol) == null ? {} : { vol: asFiniteNumber(talkProviderConfig.vol) },
				...asFiniteNumber(talkProviderConfig.pitch) == null ? {} : { pitch: asFiniteNumber(talkProviderConfig.pitch) }
			};
		},
		resolveTalkOverrides: ({ params }) => ({
			...normalizeOptionalString(params.voiceId) == null ? {} : { voiceId: normalizeOptionalString(params.voiceId) },
			...normalizeOptionalString(params.modelId) == null ? {} : { model: normalizeOptionalString(params.modelId) },
			...asFiniteNumber(params.speed) == null ? {} : { speed: asFiniteNumber(params.speed) },
			...asFiniteNumber(params.vol) == null ? {} : { vol: asFiniteNumber(params.vol) },
			...asFiniteNumber(params.pitch) == null ? {} : { pitch: asFiniteNumber(params.pitch) }
		}),
		listVoices: async () => MINIMAX_TTS_VOICES.map((voice) => ({
			id: voice,
			name: voice
		})),
		isConfigured: ({ providerConfig }) => Boolean(readMinimaxProviderConfig(providerConfig).apiKey || process.env.MINIMAX_API_KEY),
		synthesize: async (req) => {
			const config = readMinimaxProviderConfig(req.providerConfig);
			const overrides = readMinimaxOverrides(req.providerOverrides);
			const apiKey = config.apiKey || process.env.MINIMAX_API_KEY;
			if (!apiKey) throw new Error("MiniMax API key missing");
			return {
				audioBuffer: await minimaxTTS({
					text: req.text,
					apiKey,
					baseUrl: config.baseUrl,
					model: overrides.model ?? config.model,
					voiceId: overrides.voiceId ?? config.voiceId,
					speed: overrides.speed ?? config.speed,
					vol: overrides.vol ?? config.vol,
					pitch: overrides.pitch ?? config.pitch,
					timeoutMs: req.timeoutMs
				}),
				outputFormat: "mp3",
				fileExtension: ".mp3",
				voiceCompatible: false
			};
		}
	};
}
//#endregion
export { buildMinimaxSpeechProvider as t };
