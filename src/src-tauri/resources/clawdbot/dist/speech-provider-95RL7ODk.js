import { c as normalizeOptionalString, s as normalizeOptionalLowercaseString } from "./string-coerce-Bje8XVt9.js";
import { l as normalizeResolvedSecretInputString } from "./types.secrets-ClP-vJ-P.js";
import { t as asFiniteNumber } from "./number-coercion-CAeXAmlV.js";
import { n as asObject, r as assertOkOrThrowHttpError } from "./provider-http-errors-DzWFsTc6.js";
import { a as postJsonRequest, u as resolveProviderHttpRequestConfig } from "./shared-BaGWsvKy.js";
import "./text-runtime-DfALcXL5.js";
import "./secret-input-DpyDR7r6.js";
import "./provider-http-CPMTAn4V.js";
import "./speech-BeW866F0.js";
import { i as normalizeOpenRouterBaseUrl, t as OPENROUTER_BASE_URL } from "./provider-catalog-DM2joWwF.js";
//#region extensions/openrouter/speech-provider.ts
const DEFAULT_OPENROUTER_TTS_MODEL = "hexgrad/kokoro-82m";
const DEFAULT_OPENROUTER_TTS_VOICE = "af_alloy";
const OPENROUTER_TTS_MODELS = [
	DEFAULT_OPENROUTER_TTS_MODEL,
	"google/gemini-3.1-flash-tts-preview",
	"mistralai/voxtral-mini-tts-2603",
	"elevenlabs/eleven-turbo-v2"
];
const OPENROUTER_TTS_RESPONSE_FORMATS = ["mp3", "pcm"];
function normalizeOpenRouterTtsResponseFormat(value) {
	const next = normalizeOptionalLowercaseString(value);
	if (!next) return;
	if (OPENROUTER_TTS_RESPONSE_FORMATS.some((format) => format === next)) return next;
	throw new Error(`Invalid OpenRouter speech responseFormat: ${next}`);
}
function normalizeOpenRouterTtsBaseUrl(value) {
	return normalizeOpenRouterBaseUrl(normalizeOptionalString(value) ?? "https://openrouter.ai/api/v1") ?? "https://openrouter.ai/api/v1";
}
function resolveOpenRouterProviderConfigRecord(rawConfig) {
	return asObject(asObject(rawConfig.providers)?.openrouter) ?? asObject(rawConfig.openrouter);
}
function normalizeOpenRouterTtsProviderConfig(rawConfig) {
	const raw = resolveOpenRouterProviderConfigRecord(rawConfig);
	return {
		apiKey: normalizeResolvedSecretInputString({
			value: raw?.apiKey,
			path: "messages.tts.providers.openrouter.apiKey"
		}),
		baseUrl: normalizeOptionalString(raw?.baseUrl) == null ? void 0 : normalizeOpenRouterTtsBaseUrl(raw?.baseUrl),
		model: normalizeOptionalString(raw?.model ?? raw?.modelId) ?? DEFAULT_OPENROUTER_TTS_MODEL,
		voice: normalizeOptionalString(raw?.voice ?? raw?.voiceId) ?? DEFAULT_OPENROUTER_TTS_VOICE,
		speed: asFiniteNumber(raw?.speed),
		responseFormat: normalizeOpenRouterTtsResponseFormat(raw?.responseFormat),
		provider: asObject(raw?.provider)
	};
}
function readOpenRouterTtsProviderConfig(config) {
	const normalized = normalizeOpenRouterTtsProviderConfig({});
	return {
		apiKey: normalizeOptionalString(config.apiKey) ?? normalized.apiKey,
		baseUrl: normalizeOptionalString(config.baseUrl) == null ? normalized.baseUrl : normalizeOpenRouterTtsBaseUrl(config.baseUrl),
		model: normalizeOptionalString(config.model ?? config.modelId) ?? normalized.model,
		voice: normalizeOptionalString(config.voice ?? config.voiceId) ?? normalized.voice,
		speed: asFiniteNumber(config.speed) ?? normalized.speed,
		responseFormat: normalizeOpenRouterTtsResponseFormat(config.responseFormat) ?? normalized.responseFormat,
		provider: asObject(config.provider) ?? normalized.provider
	};
}
function readOpenRouterTtsOverrides(overrides) {
	if (!overrides) return {};
	return {
		model: normalizeOptionalString(overrides.model ?? overrides.modelId),
		voice: normalizeOptionalString(overrides.voice ?? overrides.voiceId),
		speed: asFiniteNumber(overrides.speed)
	};
}
function resolveOpenRouterTtsApiKey(params) {
	return params.providerConfig.apiKey ?? normalizeResolvedSecretInputString({
		value: params.cfg?.models?.providers?.openrouter?.apiKey,
		path: "models.providers.openrouter.apiKey"
	}) ?? normalizeOptionalString(process.env.OPENROUTER_API_KEY);
}
function resolveOpenRouterTtsBaseUrl(params) {
	return normalizeOpenRouterTtsBaseUrl(params.providerConfig.baseUrl ?? normalizeOptionalString(params.cfg?.models?.providers?.openrouter?.baseUrl) ?? "https://openrouter.ai/api/v1");
}
function resolveOpenRouterTtsResponseFormat(configuredFormat) {
	if (configuredFormat) return configuredFormat;
	return "mp3";
}
function responseFormatToFileExtension(format) {
	return format === "pcm" ? ".pcm" : ".mp3";
}
function parseDirectiveToken(ctx) {
	switch (ctx.key) {
		case "voice":
		case "voice_id":
		case "voiceid":
		case "openrouter_voice":
		case "openroutervoice":
			if (!ctx.policy.allowVoice) return { handled: true };
			return {
				handled: true,
				overrides: { voice: ctx.value }
			};
		case "model":
		case "model_id":
		case "modelid":
		case "openrouter_model":
		case "openroutermodel":
			if (!ctx.policy.allowModelId) return { handled: true };
			return {
				handled: true,
				overrides: { model: ctx.value }
			};
		default: return { handled: false };
	}
}
function buildOpenRouterSpeechProvider() {
	return {
		id: "openrouter",
		label: "OpenRouter",
		autoSelectOrder: 35,
		models: OPENROUTER_TTS_MODELS,
		voices: [DEFAULT_OPENROUTER_TTS_VOICE],
		resolveConfig: ({ rawConfig }) => normalizeOpenRouterTtsProviderConfig(rawConfig),
		parseDirectiveToken,
		resolveTalkConfig: ({ baseTtsConfig, talkProviderConfig }) => {
			const base = normalizeOpenRouterTtsProviderConfig(baseTtsConfig);
			const responseFormat = normalizeOpenRouterTtsResponseFormat(talkProviderConfig.responseFormat);
			return {
				...base,
				...talkProviderConfig.apiKey === void 0 ? {} : { apiKey: normalizeResolvedSecretInputString({
					value: talkProviderConfig.apiKey,
					path: "talk.providers.openrouter.apiKey"
				}) },
				...normalizeOptionalString(talkProviderConfig.baseUrl) == null ? {} : { baseUrl: normalizeOpenRouterTtsBaseUrl(talkProviderConfig.baseUrl) },
				...normalizeOptionalString(talkProviderConfig.modelId) == null ? {} : { model: normalizeOptionalString(talkProviderConfig.modelId) },
				...normalizeOptionalString(talkProviderConfig.voiceId) == null ? {} : { voice: normalizeOptionalString(talkProviderConfig.voiceId) },
				...asFiniteNumber(talkProviderConfig.speed) == null ? {} : { speed: asFiniteNumber(talkProviderConfig.speed) },
				...responseFormat == null ? {} : { responseFormat }
			};
		},
		resolveTalkOverrides: ({ params }) => ({
			...normalizeOptionalString(params.voiceId ?? params.voice) == null ? {} : { voice: normalizeOptionalString(params.voiceId ?? params.voice) },
			...normalizeOptionalString(params.modelId ?? params.model) == null ? {} : { model: normalizeOptionalString(params.modelId ?? params.model) },
			...asFiniteNumber(params.speed) == null ? {} : { speed: asFiniteNumber(params.speed) }
		}),
		listVoices: async () => [{
			id: DEFAULT_OPENROUTER_TTS_VOICE,
			name: DEFAULT_OPENROUTER_TTS_VOICE
		}],
		isConfigured: ({ cfg, providerConfig }) => {
			const config = readOpenRouterTtsProviderConfig(providerConfig);
			return Boolean(resolveOpenRouterTtsApiKey({
				cfg,
				providerConfig: config
			}));
		},
		synthesize: async (req) => {
			const config = readOpenRouterTtsProviderConfig(req.providerConfig);
			const overrides = readOpenRouterTtsOverrides(req.providerOverrides);
			const apiKey = resolveOpenRouterTtsApiKey({
				cfg: req.cfg,
				providerConfig: config
			});
			if (!apiKey) throw new Error("OpenRouter API key missing");
			const baseUrl = resolveOpenRouterTtsBaseUrl({
				cfg: req.cfg,
				providerConfig: config
			});
			const responseFormat = resolveOpenRouterTtsResponseFormat(config.responseFormat);
			const speed = overrides.speed ?? config.speed;
			const { allowPrivateNetwork, headers, dispatcherPolicy } = resolveProviderHttpRequestConfig({
				baseUrl,
				defaultBaseUrl: OPENROUTER_BASE_URL,
				allowPrivateNetwork: false,
				defaultHeaders: {
					Authorization: `Bearer ${apiKey}`,
					"Content-Type": "application/json",
					"HTTP-Referer": "https://openclaw.ai",
					"X-OpenRouter-Title": "OpenClaw"
				},
				provider: "openrouter",
				capability: "audio",
				transport: "http"
			});
			const { response, release } = await postJsonRequest({
				url: `${baseUrl}/audio/speech`,
				headers,
				body: {
					model: overrides.model ?? config.model,
					input: req.text,
					voice: overrides.voice ?? config.voice,
					response_format: responseFormat,
					...speed == null ? {} : { speed },
					...config.provider == null ? {} : { provider: config.provider }
				},
				timeoutMs: req.timeoutMs,
				fetchFn: fetch,
				allowPrivateNetwork,
				dispatcherPolicy
			});
			try {
				await assertOkOrThrowHttpError(response, "OpenRouter TTS API error");
				return {
					audioBuffer: Buffer.from(await response.arrayBuffer()),
					outputFormat: responseFormat,
					fileExtension: responseFormatToFileExtension(responseFormat),
					voiceCompatible: responseFormat === "mp3"
				};
			} finally {
				await release();
			}
		}
	};
}
//#endregion
export { buildOpenRouterSpeechProvider as t };
