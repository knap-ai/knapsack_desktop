import { r as normalizeProviderId } from "./provider-id-CTiEzT1T.js";
import "./model-selection-8a6zD_aX.js";
import { a as shouldLogVerbose, r as logVerbose } from "./globals-BJZkpw-q.js";
import { t as normalizeChatType } from "./chat-type-C7RL3WXY.js";
//#region src/media-understanding/provider-id.ts
function normalizeMediaProviderId(id) {
	const normalized = normalizeProviderId(id);
	if (normalized === "gemini") return "google";
	return normalized;
}
//#endregion
//#region src/media-understanding/defaults.ts
const MB = 1024 * 1024;
const DEFAULT_MAX_CHARS = 500;
const DEFAULT_MAX_CHARS_BY_CAPABILITY = {
	image: 500,
	audio: void 0,
	video: 500
};
const DEFAULT_MAX_BYTES = {
	image: 10 * MB,
	audio: 20 * MB,
	video: 50 * MB
};
const DEFAULT_TIMEOUT_SECONDS = {
	image: 60,
	audio: 60,
	video: 120
};
const DEFAULT_PROMPT = {
	image: "Describe the image.",
	audio: "Transcribe the audio.",
	video: "Describe the video."
};
const DEFAULT_VIDEO_MAX_BASE64_BYTES = 70 * MB;
const DEFAULT_AUDIO_MODELS = {
	groq: "whisper-large-v3-turbo",
	openai: "gpt-4o-mini-transcribe",
	deepgram: "nova-3",
	mistral: "voxtral-mini-latest"
};
const AUTO_AUDIO_KEY_PROVIDERS = [
	"openai",
	"groq",
	"deepgram",
	"google",
	"mistral"
];
const AUTO_IMAGE_KEY_PROVIDERS = [
	"openai",
	"anthropic",
	"google",
	"minimax",
	"minimax-portal",
	"zai"
];
const AUTO_VIDEO_KEY_PROVIDERS = ["google", "moonshot"];
const DEFAULT_IMAGE_MODELS = {
	openai: "gpt-5-mini",
	anthropic: "claude-opus-4-6",
	google: "gemini-3-flash-preview",
	minimax: "MiniMax-VL-01",
	"minimax-portal": "MiniMax-VL-01",
	zai: "glm-4.6v"
};
const CLI_OUTPUT_MAX_BUFFER = 5 * MB;
const DEFAULT_MEDIA_CONCURRENCY = 2;
/**
* Minimum audio file size in bytes below which transcription is skipped.
* Files smaller than this threshold are almost certainly empty or corrupt
* and would cause unhelpful API errors from Whisper/transcription providers.
*/
const MIN_AUDIO_FILE_BYTES = 1024;
//#endregion
//#region src/media-understanding/scope.ts
function normalizeDecision(value) {
	const normalized = value?.trim().toLowerCase();
	if (normalized === "allow") return "allow";
	if (normalized === "deny") return "deny";
}
function normalizeMatch(value) {
	return value?.trim().toLowerCase() || void 0;
}
function normalizeMediaUnderstandingChatType(raw) {
	return normalizeChatType(raw ?? void 0);
}
function resolveMediaUnderstandingScope(params) {
	const scope = params.scope;
	if (!scope) return "allow";
	const channel = normalizeMatch(params.channel);
	const chatType = normalizeMediaUnderstandingChatType(params.chatType);
	const sessionKey = normalizeMatch(params.sessionKey) ?? "";
	for (const rule of scope.rules ?? []) {
		if (!rule) continue;
		const action = normalizeDecision(rule.action) ?? "allow";
		const match = rule.match ?? {};
		const matchChannel = normalizeMatch(match.channel);
		const matchChatType = normalizeMediaUnderstandingChatType(match.chatType);
		const matchPrefix = normalizeMatch(match.keyPrefix);
		if (matchChannel && matchChannel !== channel) continue;
		if (matchChatType && matchChatType !== chatType) continue;
		if (matchPrefix && !sessionKey.startsWith(matchPrefix)) continue;
		return action;
	}
	return normalizeDecision(scope.default) ?? "allow";
}
//#endregion
//#region src/media-understanding/resolve.ts
function resolveTimeoutMs(seconds, fallbackSeconds) {
	return Math.max(1e3, Math.floor((typeof seconds === "number" && Number.isFinite(seconds) ? seconds : fallbackSeconds) * 1e3));
}
function resolvePrompt(capability, prompt, maxChars) {
	const base = prompt?.trim() || DEFAULT_PROMPT[capability];
	if (!maxChars || capability === "audio") return base;
	return `${base} Respond in at most ${maxChars} characters.`;
}
function resolveMaxChars(params) {
	const { capability, entry, cfg } = params;
	const configured = entry.maxChars ?? params.config?.maxChars ?? cfg.tools?.media?.[capability]?.maxChars;
	if (typeof configured === "number") return configured;
	return DEFAULT_MAX_CHARS_BY_CAPABILITY[capability];
}
function resolveMaxBytes(params) {
	const configured = params.entry.maxBytes ?? params.config?.maxBytes ?? params.cfg.tools?.media?.[params.capability]?.maxBytes;
	if (typeof configured === "number") return configured;
	return DEFAULT_MAX_BYTES[params.capability];
}
function resolveScopeDecision(params) {
	return resolveMediaUnderstandingScope({
		scope: params.scope,
		sessionKey: params.ctx.SessionKey,
		channel: params.ctx.Surface ?? params.ctx.Provider,
		chatType: normalizeMediaUnderstandingChatType(params.ctx.ChatType)
	});
}
function resolveEntryCapabilities(params) {
	if ((params.entry.type ?? (params.entry.command ? "cli" : "provider")) === "cli") return;
	const providerId = normalizeMediaProviderId(params.entry.provider ?? "");
	if (!providerId) return;
	return params.providerRegistry.get(providerId)?.capabilities;
}
function resolveModelEntries(params) {
	const { cfg, capability, config } = params;
	const sharedModels = cfg.tools?.media?.models ?? [];
	const entries = [...(config?.models ?? []).map((entry) => ({
		entry,
		source: "capability"
	})), ...sharedModels.map((entry) => ({
		entry,
		source: "shared"
	}))];
	if (entries.length === 0) return [];
	return entries.filter(({ entry, source }) => {
		const caps = entry.capabilities && entry.capabilities.length > 0 ? entry.capabilities : source === "shared" ? resolveEntryCapabilities({
			entry,
			providerRegistry: params.providerRegistry
		}) : void 0;
		if (!caps || caps.length === 0) {
			if (source === "shared") {
				if (shouldLogVerbose()) logVerbose(`Skipping shared media model without capabilities: ${entry.provider ?? entry.command ?? "unknown"}`);
				return false;
			}
			return true;
		}
		return caps.includes(capability);
	}).map(({ entry }) => entry);
}
function resolveConcurrency(cfg) {
	const configured = cfg.tools?.media?.concurrency;
	if (typeof configured === "number" && Number.isFinite(configured) && configured > 0) return Math.floor(configured);
	return 2;
}
//#endregion
export { MIN_AUDIO_FILE_BYTES as C, DEFAULT_VIDEO_MAX_BASE64_BYTES as S, DEFAULT_MAX_CHARS as _, resolvePrompt as a, DEFAULT_PROMPT as b, normalizeMediaUnderstandingChatType as c, AUTO_IMAGE_KEY_PROVIDERS as d, AUTO_VIDEO_KEY_PROVIDERS as f, DEFAULT_MAX_BYTES as g, DEFAULT_IMAGE_MODELS as h, resolveModelEntries as i, resolveMediaUnderstandingScope as l, DEFAULT_AUDIO_MODELS as m, resolveMaxBytes as n, resolveScopeDecision as o, CLI_OUTPUT_MAX_BUFFER as p, resolveMaxChars as r, resolveTimeoutMs as s, resolveConcurrency as t, AUTO_AUDIO_KEY_PROVIDERS as u, DEFAULT_MAX_CHARS_BY_CAPABILITY as v, normalizeMediaProviderId as w, DEFAULT_TIMEOUT_SECONDS as x, DEFAULT_MEDIA_CONCURRENCY as y };
