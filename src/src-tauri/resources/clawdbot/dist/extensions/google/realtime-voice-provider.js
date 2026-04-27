import { createGoogleGenAI } from "./google-genai-runtime.js";
import { normalizeOptionalString } from "openclaw/plugin-sdk/text-runtime";
import { randomUUID } from "node:crypto";
import { EndSensitivity, Modality, StartSensitivity } from "@google/genai";
import { convertPcmToMulaw8k, mulawToPcm, resamplePcm } from "openclaw/plugin-sdk/realtime-voice";
import { normalizeResolvedSecretInputString } from "openclaw/plugin-sdk/secret-input";
//#region extensions/google/realtime-voice-provider.ts
const GOOGLE_REALTIME_DEFAULT_MODEL = "gemini-2.5-flash-native-audio-preview-12-2025";
const GOOGLE_REALTIME_DEFAULT_VOICE = "Kore";
const GOOGLE_REALTIME_DEFAULT_API_VERSION = "v1beta";
const GOOGLE_REALTIME_INPUT_SAMPLE_RATE = 16e3;
const TELEPHONY_SAMPLE_RATE = 8e3;
const MAX_PENDING_AUDIO_CHUNKS = 320;
const DEFAULT_AUDIO_STREAM_END_SILENCE_MS = 700;
function trimToUndefined(value) {
	return normalizeOptionalString(value);
}
function asFiniteNumber(value) {
	return typeof value === "number" && Number.isFinite(value) ? value : void 0;
}
function asBoolean(value) {
	return typeof value === "boolean" ? value : void 0;
}
function asSensitivity(value) {
	const normalized = normalizeOptionalString(value)?.toLowerCase();
	return normalized === "low" || normalized === "high" ? normalized : void 0;
}
function asThinkingLevel(value) {
	const normalized = normalizeOptionalString(value)?.toLowerCase();
	return normalized === "minimal" || normalized === "low" || normalized === "medium" || normalized === "high" ? normalized : void 0;
}
function resolveGoogleRealtimeProviderConfigRecord(config) {
	const nested = (typeof config.providers === "object" && config.providers !== null && !Array.isArray(config.providers) ? config.providers : void 0)?.google;
	return typeof nested === "object" && nested !== null && !Array.isArray(nested) ? nested : typeof config.google === "object" && config.google !== null && !Array.isArray(config.google) ? config.google : config;
}
function normalizeProviderConfig(config, cfg) {
	const raw = resolveGoogleRealtimeProviderConfigRecord(config);
	return {
		apiKey: normalizeResolvedSecretInputString({
			value: raw?.apiKey ?? cfg?.models?.providers?.google?.apiKey,
			path: "plugins.entries.voice-call.config.realtime.providers.google.apiKey"
		}),
		model: trimToUndefined(raw?.model),
		voice: trimToUndefined(raw?.voice),
		temperature: asFiniteNumber(raw?.temperature),
		apiVersion: trimToUndefined(raw?.apiVersion),
		prefixPaddingMs: asFiniteNumber(raw?.prefixPaddingMs),
		silenceDurationMs: asFiniteNumber(raw?.silenceDurationMs),
		startSensitivity: asSensitivity(raw?.startSensitivity),
		endSensitivity: asSensitivity(raw?.endSensitivity),
		enableAffectiveDialog: asBoolean(raw?.enableAffectiveDialog),
		thinkingLevel: asThinkingLevel(raw?.thinkingLevel),
		thinkingBudget: asFiniteNumber(raw?.thinkingBudget)
	};
}
function resolveEnvApiKey() {
	return trimToUndefined(process.env.GEMINI_API_KEY) ?? trimToUndefined(process.env.GOOGLE_API_KEY);
}
function mapStartSensitivity(value) {
	switch (value) {
		case "high": return StartSensitivity.START_SENSITIVITY_HIGH;
		case "low": return StartSensitivity.START_SENSITIVITY_LOW;
		default: return;
	}
}
function mapEndSensitivity(value) {
	switch (value) {
		case "high": return EndSensitivity.END_SENSITIVITY_HIGH;
		case "low": return EndSensitivity.END_SENSITIVITY_LOW;
		default: return;
	}
}
function buildThinkingConfig(config) {
	if (config.thinkingLevel) return { thinkingLevel: config.thinkingLevel.toUpperCase() };
	if (typeof config.thinkingBudget === "number") return { thinkingBudget: config.thinkingBudget };
}
function buildRealtimeInputConfig(config) {
	const startSensitivity = mapStartSensitivity(config.startSensitivity);
	const endSensitivity = mapEndSensitivity(config.endSensitivity);
	const automaticActivityDetection = {
		...startSensitivity ? { startOfSpeechSensitivity: startSensitivity } : {},
		...endSensitivity ? { endOfSpeechSensitivity: endSensitivity } : {},
		...typeof config.prefixPaddingMs === "number" ? { prefixPaddingMs: Math.max(0, Math.floor(config.prefixPaddingMs)) } : {},
		...typeof config.silenceDurationMs === "number" ? { silenceDurationMs: Math.max(0, Math.floor(config.silenceDurationMs)) } : {}
	};
	return Object.keys(automaticActivityDetection).length > 0 ? { automaticActivityDetection } : void 0;
}
function buildFunctionDeclarations(tools) {
	return (tools ?? []).map((tool) => ({
		name: tool.name,
		description: tool.description,
		parametersJsonSchema: tool.parameters
	}));
}
function parsePcmSampleRate(mimeType) {
	const match = mimeType?.match(/(?:^|[;,\s])rate=(\d+)/i);
	const parsed = match ? Number.parseInt(match[1] ?? "", 10) : NaN;
	return Number.isFinite(parsed) && parsed > 0 ? parsed : 24e3;
}
function isMulawSilence(audio) {
	return audio.length > 0 && audio.every((sample) => sample === 255);
}
var GoogleRealtimeVoiceBridge = class {
	constructor(config) {
		this.config = config;
		this.session = null;
		this.connected = false;
		this.sessionConfigured = false;
		this.intentionallyClosed = false;
		this.pendingAudio = [];
		this.sessionReadyFired = false;
		this.consecutiveSilenceMs = 0;
		this.audioStreamEnded = false;
	}
	async connect() {
		this.intentionallyClosed = false;
		this.sessionConfigured = false;
		this.sessionReadyFired = false;
		this.consecutiveSilenceMs = 0;
		this.audioStreamEnded = false;
		const ai = createGoogleGenAI({
			apiKey: this.config.apiKey,
			httpOptions: { apiVersion: this.config.apiVersion ?? "v1beta" }
		});
		const functionDeclarations = buildFunctionDeclarations(this.config.tools);
		this.session = await ai.live.connect({
			model: this.config.model ?? "gemini-2.5-flash-native-audio-preview-12-2025",
			config: {
				responseModalities: [Modality.AUDIO],
				...typeof this.config.temperature === "number" && this.config.temperature > 0 ? { temperature: this.config.temperature } : {},
				speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: this.config.voice ?? "Kore" } } },
				systemInstruction: this.config.instructions,
				...functionDeclarations.length > 0 ? { tools: [{ functionDeclarations }] } : {},
				...this.realtimeInputConfig ? { realtimeInputConfig: this.realtimeInputConfig } : {},
				inputAudioTranscription: {},
				outputAudioTranscription: {},
				...typeof this.config.enableAffectiveDialog === "boolean" ? { enableAffectiveDialog: this.config.enableAffectiveDialog } : {},
				...this.thinkingConfig ? { thinkingConfig: this.thinkingConfig } : {}
			},
			callbacks: {
				onopen: () => {
					this.connected = true;
				},
				onmessage: (message) => {
					this.handleMessage(message);
				},
				onerror: (event) => {
					const error = event.error instanceof Error ? event.error : new Error(typeof event.message === "string" ? event.message : "Google Live API error");
					this.config.onError?.(error);
				},
				onclose: () => {
					this.connected = false;
					this.sessionConfigured = false;
					const reason = this.intentionallyClosed ? "completed" : "error";
					this.session = null;
					this.config.onClose?.(reason);
				}
			}
		});
	}
	sendAudio(audio) {
		if (!this.session || !this.connected || !this.sessionConfigured) {
			if (this.pendingAudio.length < MAX_PENDING_AUDIO_CHUNKS) this.pendingAudio.push(audio);
			return;
		}
		const silent = isMulawSilence(audio);
		if (silent && this.audioStreamEnded) return;
		if (!silent) {
			this.consecutiveSilenceMs = 0;
			this.audioStreamEnded = false;
		}
		const pcm16k = resamplePcm(mulawToPcm(audio), TELEPHONY_SAMPLE_RATE, GOOGLE_REALTIME_INPUT_SAMPLE_RATE);
		this.session.sendRealtimeInput({ audio: {
			data: pcm16k.toString("base64"),
			mimeType: `audio/pcm;rate=${GOOGLE_REALTIME_INPUT_SAMPLE_RATE}`
		} });
		if (!silent) return;
		const silenceThresholdMs = typeof this.config.silenceDurationMs === "number" ? Math.max(0, Math.floor(this.config.silenceDurationMs)) : DEFAULT_AUDIO_STREAM_END_SILENCE_MS;
		this.consecutiveSilenceMs += Math.round(audio.length / TELEPHONY_SAMPLE_RATE * 1e3);
		if (!this.audioStreamEnded && this.consecutiveSilenceMs >= silenceThresholdMs) {
			this.session.sendRealtimeInput({ audioStreamEnd: true });
			this.audioStreamEnded = true;
		}
	}
	setMediaTimestamp(_ts) {}
	sendUserMessage(text) {
		const normalized = text.trim();
		if (!normalized || !this.session || !this.connected || !this.sessionConfigured) return;
		this.session.sendClientContent({
			turns: [{
				role: "user",
				parts: [{ text: normalized }]
			}],
			turnComplete: true
		});
	}
	triggerGreeting(instructions) {
		const greetingPrompt = instructions?.trim() || "Start the call now. Greet the caller naturally and keep it brief.";
		this.sendUserMessage(greetingPrompt);
	}
	submitToolResult(callId, result) {
		if (!this.session) return;
		this.session.sendToolResponse({ functionResponses: [{
			id: callId,
			response: result && typeof result === "object" ? result : { output: result }
		}] });
	}
	acknowledgeMark() {}
	close() {
		this.intentionallyClosed = true;
		this.connected = false;
		this.sessionConfigured = false;
		this.pendingAudio = [];
		this.consecutiveSilenceMs = 0;
		this.audioStreamEnded = false;
		const session = this.session;
		this.session = null;
		session?.close();
	}
	isConnected() {
		return this.connected && this.sessionConfigured;
	}
	handleMessage(message) {
		if (message.setupComplete) this.handleSetupComplete();
		if (message.serverContent) this.handleServerContent(message.serverContent);
		if (message.toolCall) this.handleToolCall(message.toolCall);
	}
	handleSetupComplete() {
		this.sessionConfigured = true;
		for (const chunk of this.pendingAudio.splice(0)) this.sendAudio(chunk);
		if (!this.sessionReadyFired) {
			this.sessionReadyFired = true;
			this.config.onReady?.();
		}
	}
	handleServerContent(content) {
		if (content.interrupted) this.config.onClearAudio();
		if (content.inputTranscription?.text) this.config.onTranscript?.("user", content.inputTranscription.text, content.inputTranscription.finished ?? false);
		if (content.outputTranscription?.text) this.config.onTranscript?.("assistant", content.outputTranscription.text, content.outputTranscription.finished ?? false);
		let emittedAssistantText = false;
		for (const part of content.modelTurn?.parts ?? []) {
			if (part.inlineData?.data) {
				const muLaw = convertPcmToMulaw8k(Buffer.from(part.inlineData.data, "base64"), parsePcmSampleRate(part.inlineData.mimeType));
				if (muLaw.length > 0) {
					this.config.onAudio(muLaw);
					this.config.onMark?.(`audio-${randomUUID()}`);
				}
				continue;
			}
			if (part.thought) continue;
			if (!content.outputTranscription?.text && typeof part.text === "string" && part.text.trim()) {
				emittedAssistantText = true;
				this.config.onTranscript?.("assistant", part.text, content.turnComplete ?? false);
			}
		}
		if (!emittedAssistantText && content.turnComplete && content.waitingForInput === false) return;
	}
	handleToolCall(toolCall) {
		for (const call of toolCall.functionCalls ?? []) {
			const name = call.name?.trim();
			if (!name) continue;
			const callId = call.id?.trim() || `google-live-${randomUUID()}`;
			this.config.onToolCall?.({
				itemId: callId,
				callId,
				name,
				args: call.args ?? {}
			});
		}
	}
	get realtimeInputConfig() {
		return buildRealtimeInputConfig(this.config);
	}
	get thinkingConfig() {
		return buildThinkingConfig(this.config);
	}
};
function buildGoogleRealtimeVoiceProvider() {
	return {
		id: "google",
		label: "Google Live Voice",
		autoSelectOrder: 20,
		resolveConfig: ({ cfg, rawConfig }) => normalizeProviderConfig(rawConfig, cfg),
		isConfigured: ({ providerConfig }) => Boolean(normalizeProviderConfig(providerConfig).apiKey || resolveEnvApiKey()),
		createBridge: (req) => {
			const config = normalizeProviderConfig(req.providerConfig);
			const apiKey = config.apiKey || resolveEnvApiKey();
			if (!apiKey) throw new Error("Google Gemini API key missing");
			return new GoogleRealtimeVoiceBridge({
				...req,
				apiKey,
				model: config.model,
				voice: config.voice,
				temperature: config.temperature,
				apiVersion: config.apiVersion,
				prefixPaddingMs: config.prefixPaddingMs,
				silenceDurationMs: config.silenceDurationMs,
				startSensitivity: config.startSensitivity,
				endSensitivity: config.endSensitivity,
				enableAffectiveDialog: config.enableAffectiveDialog,
				thinkingLevel: config.thinkingLevel,
				thinkingBudget: config.thinkingBudget
			});
		}
	};
}
//#endregion
export { GOOGLE_REALTIME_DEFAULT_API_VERSION, GOOGLE_REALTIME_DEFAULT_MODEL, GOOGLE_REALTIME_DEFAULT_VOICE, buildGoogleRealtimeVoiceProvider };
