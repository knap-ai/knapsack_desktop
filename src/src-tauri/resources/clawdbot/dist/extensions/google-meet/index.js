import { i as formatErrorMessage } from "../../errors-Jbvi20TW.js";
import { c as normalizeOptionalString$1, s as normalizeOptionalLowercaseString } from "../../string-coerce-C1IzJjqi.js";
import { t as GatewayClient } from "../../client-kQ1-TM3I.js";
import "../../text-runtime-B1c54bxG.js";
import { t as definePluginEntry } from "../../plugin-entry-oWwpQhIC.js";
import "../../error-runtime-D8vVwCEz.js";
import "../../gateway-runtime-wqWHJ2Gj.js";
import { g as resolveRealtimeVoiceAgentConsultToolsAllow, h as resolveRealtimeVoiceAgentConsultTools, m as resolveRealtimeVoiceAgentConsultToolPolicy, s as REALTIME_VOICE_AGENT_CONSULT_TOOL_NAME, t as resolveConfiguredRealtimeVoiceProvider } from "../../provider-resolver-DacJ9YDL.js";
import { o as createRealtimeVoiceBridgeSession, s as consultRealtimeVoiceAgent } from "../../realtime-voice-0bAg9EuU.js";
import { a as fetchGoogleMeetSpace, i as fetchGoogleMeetAttendance, o as fetchLatestGoogleMeetConferenceRecord, r as fetchGoogleMeetArtifacts, t as buildGoogleMeetPreflightReport } from "../../meet-CxbS-CzY.js";
import { a as isSameMeetUrlForReuse, c as resolveChromeNode, i as callBrowserProxyOnNode, l as resolveChromeNodeInfo, n as isGoogleMeetBrowserManualActionError, o as normalizeMeetUrlForReuse, r as asBrowserTabs, s as readBrowserTab, t as createMeetWithBrowserProxyOnNode } from "../../chrome-create-BxTOQomR.js";
import fs from "node:fs";
import path from "node:path";
import { spawn, spawnSync } from "node:child_process";
import os from "node:os";
import { randomUUID } from "node:crypto";
import { Type } from "typebox";
import { setTimeout as setTimeout$1 } from "node:timers/promises";
//#region extensions/google-meet/src/config.ts
const DEFAULT_GOOGLE_MEET_AUDIO_INPUT_COMMAND = [
	"rec",
	"-q",
	"-t",
	"raw",
	"-r",
	"8000",
	"-c",
	"1",
	"-e",
	"mu-law",
	"-b",
	"8",
	"-"
];
const DEFAULT_GOOGLE_MEET_AUDIO_OUTPUT_COMMAND = [
	"play",
	"-q",
	"-t",
	"raw",
	"-r",
	"8000",
	"-c",
	"1",
	"-e",
	"mu-law",
	"-b",
	"8",
	"-"
];
const DEFAULT_GOOGLE_MEET_REALTIME_INSTRUCTIONS = `You are joining a private Google Meet as an OpenClaw agent. Keep spoken replies brief and natural. When a question needs deeper reasoning, current information, or tools, call ${REALTIME_VOICE_AGENT_CONSULT_TOOL_NAME} before answering.`;
const DEFAULT_GOOGLE_MEET_REALTIME_INTRO_MESSAGE = "Say exactly: I'm here and listening.";
const DEFAULT_GOOGLE_MEET_CONFIG = {
	enabled: true,
	defaults: {},
	preview: { enrollmentAcknowledged: false },
	defaultTransport: "chrome",
	defaultMode: "realtime",
	chrome: {
		audioBackend: "blackhole-2ch",
		launch: true,
		guestName: "OpenClaw Agent",
		reuseExistingTab: true,
		autoJoin: true,
		joinTimeoutMs: 3e4,
		waitForInCallMs: 2e4,
		audioInputCommand: [...DEFAULT_GOOGLE_MEET_AUDIO_INPUT_COMMAND],
		audioOutputCommand: [...DEFAULT_GOOGLE_MEET_AUDIO_OUTPUT_COMMAND]
	},
	chromeNode: {},
	twilio: {},
	voiceCall: {
		enabled: true,
		requestTimeoutMs: 3e4,
		dtmfDelayMs: 2500
	},
	realtime: {
		provider: "openai",
		instructions: DEFAULT_GOOGLE_MEET_REALTIME_INSTRUCTIONS,
		introMessage: DEFAULT_GOOGLE_MEET_REALTIME_INTRO_MESSAGE,
		toolPolicy: "safe-read-only",
		providers: {}
	},
	oauth: {},
	auth: { provider: "google-oauth" }
};
const GOOGLE_MEET_CLIENT_ID_KEYS = ["OPENCLAW_GOOGLE_MEET_CLIENT_ID", "GOOGLE_MEET_CLIENT_ID"];
const GOOGLE_MEET_CLIENT_SECRET_KEYS = ["OPENCLAW_GOOGLE_MEET_CLIENT_SECRET", "GOOGLE_MEET_CLIENT_SECRET"];
const GOOGLE_MEET_REFRESH_TOKEN_KEYS = ["OPENCLAW_GOOGLE_MEET_REFRESH_TOKEN", "GOOGLE_MEET_REFRESH_TOKEN"];
const GOOGLE_MEET_ACCESS_TOKEN_KEYS = ["OPENCLAW_GOOGLE_MEET_ACCESS_TOKEN", "GOOGLE_MEET_ACCESS_TOKEN"];
const GOOGLE_MEET_ACCESS_TOKEN_EXPIRES_AT_KEYS = ["OPENCLAW_GOOGLE_MEET_ACCESS_TOKEN_EXPIRES_AT", "GOOGLE_MEET_ACCESS_TOKEN_EXPIRES_AT"];
const GOOGLE_MEET_DEFAULT_MEETING_KEYS = ["OPENCLAW_GOOGLE_MEET_DEFAULT_MEETING", "GOOGLE_MEET_DEFAULT_MEETING"];
const GOOGLE_MEET_PREVIEW_ACK_KEYS = ["OPENCLAW_GOOGLE_MEET_PREVIEW_ACK", "GOOGLE_MEET_PREVIEW_ACK"];
function asRecord$3(value) {
	return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}
function resolveBoolean(value, fallback) {
	return typeof value === "boolean" ? value : fallback;
}
function resolveNumber(value, fallback) {
	return typeof value === "number" && Number.isFinite(value) && value > 0 ? value : fallback;
}
function resolveOptionalNumber(value) {
	if (typeof value === "number" && Number.isFinite(value)) return value;
	if (typeof value === "string" && value.trim()) {
		const parsed = Number(value);
		return Number.isFinite(parsed) ? parsed : void 0;
	}
}
function readEnvString(env, keys) {
	for (const key of keys) {
		const value = normalizeOptionalString$1(env[key]);
		if (value) return value;
	}
}
function readEnvBoolean(env, keys) {
	const normalized = normalizeOptionalLowercaseString(readEnvString(env, keys));
	if (!normalized) return;
	if ([
		"1",
		"true",
		"yes",
		"on"
	].includes(normalized)) return true;
	if ([
		"0",
		"false",
		"no",
		"off"
	].includes(normalized)) return false;
}
function readEnvNumber(env, keys) {
	return resolveOptionalNumber(readEnvString(env, keys));
}
function resolveStringArray(value) {
	if (!Array.isArray(value)) return;
	const normalized = value.map((entry) => normalizeOptionalString$1(entry)).filter((entry) => Boolean(entry));
	return normalized.length > 0 ? normalized : void 0;
}
function resolveProvidersConfig(value) {
	const raw = asRecord$3(value);
	const providers = {};
	for (const [key, entry] of Object.entries(raw)) {
		const providerId = normalizeOptionalLowercaseString(key);
		if (!providerId) continue;
		providers[providerId] = asRecord$3(entry);
	}
	return providers;
}
function resolveTransport$1(value, fallback) {
	const normalized = normalizeOptionalLowercaseString(value);
	return normalized === "chrome" || normalized === "chrome-node" || normalized === "twilio" ? normalized : fallback;
}
function resolveMode$1(value, fallback) {
	const normalized = normalizeOptionalLowercaseString(value);
	return normalized === "realtime" || normalized === "transcribe" ? normalized : fallback;
}
function resolveGoogleMeetConfig(input) {
	return resolveGoogleMeetConfigWithEnv(input);
}
function resolveGoogleMeetConfigWithEnv(input, env = process.env) {
	const raw = asRecord$3(input);
	const defaults = asRecord$3(raw.defaults);
	const preview = asRecord$3(raw.preview);
	const chrome = asRecord$3(raw.chrome);
	const chromeNode = asRecord$3(raw.chromeNode);
	const twilio = asRecord$3(raw.twilio);
	const voiceCall = asRecord$3(raw.voiceCall);
	const realtime = asRecord$3(raw.realtime);
	const oauth = asRecord$3(raw.oauth);
	const auth = asRecord$3(raw.auth);
	return {
		enabled: resolveBoolean(raw.enabled, DEFAULT_GOOGLE_MEET_CONFIG.enabled),
		defaults: { meeting: normalizeOptionalString$1(defaults.meeting) ?? readEnvString(env, GOOGLE_MEET_DEFAULT_MEETING_KEYS) },
		preview: { enrollmentAcknowledged: resolveBoolean(preview.enrollmentAcknowledged, readEnvBoolean(env, GOOGLE_MEET_PREVIEW_ACK_KEYS) ?? DEFAULT_GOOGLE_MEET_CONFIG.preview.enrollmentAcknowledged) },
		defaultTransport: resolveTransport$1(raw.defaultTransport, DEFAULT_GOOGLE_MEET_CONFIG.defaultTransport),
		defaultMode: resolveMode$1(raw.defaultMode, DEFAULT_GOOGLE_MEET_CONFIG.defaultMode),
		chrome: {
			audioBackend: "blackhole-2ch",
			launch: resolveBoolean(chrome.launch, DEFAULT_GOOGLE_MEET_CONFIG.chrome.launch),
			browserProfile: normalizeOptionalString$1(chrome.browserProfile),
			guestName: normalizeOptionalString$1(chrome.guestName) ?? DEFAULT_GOOGLE_MEET_CONFIG.chrome.guestName,
			reuseExistingTab: resolveBoolean(chrome.reuseExistingTab, DEFAULT_GOOGLE_MEET_CONFIG.chrome.reuseExistingTab),
			autoJoin: resolveBoolean(chrome.autoJoin, DEFAULT_GOOGLE_MEET_CONFIG.chrome.autoJoin),
			joinTimeoutMs: resolveNumber(chrome.joinTimeoutMs, DEFAULT_GOOGLE_MEET_CONFIG.chrome.joinTimeoutMs),
			waitForInCallMs: resolveNumber(chrome.waitForInCallMs, DEFAULT_GOOGLE_MEET_CONFIG.chrome.waitForInCallMs),
			audioInputCommand: resolveStringArray(chrome.audioInputCommand) ?? [...DEFAULT_GOOGLE_MEET_AUDIO_INPUT_COMMAND],
			audioOutputCommand: resolveStringArray(chrome.audioOutputCommand) ?? [...DEFAULT_GOOGLE_MEET_AUDIO_OUTPUT_COMMAND],
			audioBridgeCommand: resolveStringArray(chrome.audioBridgeCommand),
			audioBridgeHealthCommand: resolveStringArray(chrome.audioBridgeHealthCommand)
		},
		chromeNode: { node: normalizeOptionalString$1(chromeNode.node) },
		twilio: {
			defaultDialInNumber: normalizeOptionalString$1(twilio.defaultDialInNumber),
			defaultPin: normalizeOptionalString$1(twilio.defaultPin),
			defaultDtmfSequence: normalizeOptionalString$1(twilio.defaultDtmfSequence)
		},
		voiceCall: {
			enabled: resolveBoolean(voiceCall.enabled, DEFAULT_GOOGLE_MEET_CONFIG.voiceCall.enabled),
			gatewayUrl: normalizeOptionalString$1(voiceCall.gatewayUrl),
			token: normalizeOptionalString$1(voiceCall.token),
			requestTimeoutMs: resolveNumber(voiceCall.requestTimeoutMs, DEFAULT_GOOGLE_MEET_CONFIG.voiceCall.requestTimeoutMs),
			dtmfDelayMs: resolveNumber(voiceCall.dtmfDelayMs, DEFAULT_GOOGLE_MEET_CONFIG.voiceCall.dtmfDelayMs),
			introMessage: normalizeOptionalString$1(voiceCall.introMessage)
		},
		realtime: {
			provider: normalizeOptionalString$1(realtime.provider) ?? DEFAULT_GOOGLE_MEET_CONFIG.realtime.provider,
			model: normalizeOptionalString$1(realtime.model) ?? DEFAULT_GOOGLE_MEET_CONFIG.realtime.model,
			instructions: normalizeOptionalString$1(realtime.instructions) ?? DEFAULT_GOOGLE_MEET_CONFIG.realtime.instructions,
			introMessage: normalizeOptionalString$1(realtime.introMessage) ?? DEFAULT_GOOGLE_MEET_CONFIG.realtime.introMessage,
			toolPolicy: resolveRealtimeVoiceAgentConsultToolPolicy(realtime.toolPolicy, DEFAULT_GOOGLE_MEET_CONFIG.realtime.toolPolicy),
			providers: resolveProvidersConfig(realtime.providers)
		},
		oauth: {
			clientId: normalizeOptionalString$1(oauth.clientId) ?? normalizeOptionalString$1(auth.clientId) ?? readEnvString(env, GOOGLE_MEET_CLIENT_ID_KEYS),
			clientSecret: normalizeOptionalString$1(oauth.clientSecret) ?? normalizeOptionalString$1(auth.clientSecret) ?? readEnvString(env, GOOGLE_MEET_CLIENT_SECRET_KEYS),
			refreshToken: normalizeOptionalString$1(oauth.refreshToken) ?? readEnvString(env, GOOGLE_MEET_REFRESH_TOKEN_KEYS),
			accessToken: normalizeOptionalString$1(oauth.accessToken) ?? readEnvString(env, GOOGLE_MEET_ACCESS_TOKEN_KEYS),
			expiresAt: resolveOptionalNumber(oauth.expiresAt) ?? readEnvNumber(env, GOOGLE_MEET_ACCESS_TOKEN_EXPIRES_AT_KEYS)
		},
		auth: {
			provider: "google-oauth",
			clientId: normalizeOptionalString$1(auth.clientId),
			clientSecret: normalizeOptionalString$1(auth.clientSecret),
			tokenPath: normalizeOptionalString$1(auth.tokenPath)
		}
	};
}
//#endregion
//#region extensions/google-meet/src/agent-consult.ts
const GOOGLE_MEET_AGENT_CONSULT_TOOL_NAME = REALTIME_VOICE_AGENT_CONSULT_TOOL_NAME;
function resolveGoogleMeetRealtimeTools(policy) {
	return resolveRealtimeVoiceAgentConsultTools(policy);
}
async function consultOpenClawAgentForGoogleMeet(params) {
	return await consultRealtimeVoiceAgent({
		cfg: params.fullConfig,
		agentRuntime: params.runtime.agent,
		logger: params.logger,
		sessionKey: `google-meet:${params.meetingSessionId}`,
		messageProvider: "google-meet",
		lane: "google-meet",
		runIdPrefix: `google-meet:${params.meetingSessionId}`,
		args: params.args,
		transcript: params.transcript,
		surface: "a private Google Meet",
		userLabel: "Participant",
		assistantLabel: "Agent",
		questionSourceLabel: "participant",
		toolsAllow: resolveRealtimeVoiceAgentConsultToolsAllow(params.config.realtime.toolPolicy),
		extraSystemPrompt: "You are a behind-the-scenes consultant for a live meeting voice agent. Be accurate, brief, and speakable."
	});
}
//#endregion
//#region extensions/google-meet/src/realtime.ts
function splitCommand$1(argv) {
	const [command, ...args] = argv;
	if (!command) throw new Error("audio bridge command must not be empty");
	return {
		command,
		args
	};
}
function resolveGoogleMeetRealtimeProvider(params) {
	return resolveConfiguredRealtimeVoiceProvider({
		configuredProviderId: params.config.realtime.provider,
		providerConfigs: params.config.realtime.providers,
		cfg: params.fullConfig,
		providers: params.providers,
		defaultModel: params.config.realtime.model,
		noRegisteredProviderMessage: "No configured realtime voice provider registered"
	});
}
async function startCommandRealtimeAudioBridge(params) {
	const input = splitCommand$1(params.inputCommand);
	const output = splitCommand$1(params.outputCommand);
	const spawnFn = params.spawn ?? ((command, args, options) => spawn(command, args, options));
	const outputProcess = spawnFn(output.command, output.args, { stdio: [
		"pipe",
		"ignore",
		"pipe"
	] });
	const inputProcess = spawnFn(input.command, input.args, { stdio: [
		"ignore",
		"pipe",
		"pipe"
	] });
	let stopped = false;
	let bridge = null;
	let realtimeReady = false;
	let lastInputAt;
	let lastOutputAt;
	let lastInputBytes = 0;
	let lastOutputBytes = 0;
	const stop = async () => {
		if (stopped) return;
		stopped = true;
		try {
			bridge?.close();
		} catch (error) {
			params.logger.debug?.(`[google-meet] realtime voice bridge close ignored: ${formatErrorMessage(error)}`);
		}
		inputProcess.kill("SIGTERM");
		outputProcess.kill("SIGTERM");
	};
	const fail = (label) => (error) => {
		params.logger.warn(`[google-meet] ${label} failed: ${formatErrorMessage(error)}`);
		stop();
	};
	inputProcess.on("error", fail("audio input command"));
	outputProcess.on("error", fail("audio output command"));
	inputProcess.on("exit", (code, signal) => {
		if (!stopped) {
			params.logger.warn(`[google-meet] audio input command exited (${code ?? signal ?? "done"})`);
			stop();
		}
	});
	outputProcess.on("exit", (code, signal) => {
		if (!stopped) {
			params.logger.warn(`[google-meet] audio output command exited (${code ?? signal ?? "done"})`);
			stop();
		}
	});
	inputProcess.stderr?.on("data", (chunk) => {
		params.logger.debug?.(`[google-meet] audio input: ${String(chunk).trim()}`);
	});
	outputProcess.stderr?.on("data", (chunk) => {
		params.logger.debug?.(`[google-meet] audio output: ${String(chunk).trim()}`);
	});
	const resolved = resolveGoogleMeetRealtimeProvider({
		config: params.config,
		fullConfig: params.fullConfig,
		providers: params.providers
	});
	const transcript = [];
	bridge = createRealtimeVoiceBridgeSession({
		provider: resolved.provider,
		providerConfig: resolved.providerConfig,
		instructions: params.config.realtime.instructions,
		initialGreetingInstructions: params.config.realtime.introMessage,
		triggerGreetingOnReady: false,
		markStrategy: "ack-immediately",
		tools: resolveGoogleMeetRealtimeTools(params.config.realtime.toolPolicy),
		audioSink: {
			isOpen: () => !stopped,
			sendAudio: (muLaw) => {
				lastOutputAt = (/* @__PURE__ */ new Date()).toISOString();
				lastOutputBytes += muLaw.byteLength;
				outputProcess.stdin?.write(muLaw);
			}
		},
		onTranscript: (role, text, isFinal) => {
			if (isFinal) {
				transcript.push({
					role,
					text
				});
				if (transcript.length > 40) transcript.splice(0, transcript.length - 40);
				params.logger.debug?.(`[google-meet] ${role}: ${text}`);
			}
		},
		onToolCall: (event, session) => {
			if (event.name !== GOOGLE_MEET_AGENT_CONSULT_TOOL_NAME) {
				session.submitToolResult(event.callId || event.itemId, { error: `Tool "${event.name}" not available` });
				return;
			}
			consultOpenClawAgentForGoogleMeet({
				config: params.config,
				fullConfig: params.fullConfig,
				runtime: params.runtime,
				logger: params.logger,
				meetingSessionId: params.meetingSessionId,
				args: event.args,
				transcript
			}).then((result) => {
				session.submitToolResult(event.callId || event.itemId, result);
			}).catch((error) => {
				session.submitToolResult(event.callId || event.itemId, { error: formatErrorMessage(error) });
			});
		},
		onError: fail("realtime voice bridge"),
		onClose: (reason) => {
			realtimeReady = false;
			if (reason === "error") stop();
		},
		onReady: () => {
			realtimeReady = true;
		}
	});
	inputProcess.stdout?.on("data", (chunk) => {
		const audio = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
		if (!stopped && audio.byteLength > 0) {
			lastInputAt = (/* @__PURE__ */ new Date()).toISOString();
			lastInputBytes += audio.byteLength;
			bridge?.sendAudio(Buffer.from(audio));
		}
	});
	await bridge.connect();
	return {
		providerId: resolved.provider.id,
		inputCommand: params.inputCommand,
		outputCommand: params.outputCommand,
		speak: (instructions) => {
			bridge?.triggerGreeting(instructions);
		},
		getHealth: () => ({
			providerConnected: bridge?.bridge.isConnected() ?? false,
			realtimeReady,
			audioInputActive: lastInputBytes > 0,
			audioOutputActive: lastOutputBytes > 0,
			lastInputAt,
			lastOutputAt,
			lastInputBytes,
			lastOutputBytes,
			bridgeClosed: stopped
		}),
		stop
	};
}
//#endregion
//#region extensions/google-meet/src/realtime-node.ts
function asRecord$2(value) {
	return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}
function readString$1(value) {
	return typeof value === "string" && value.trim() ? value : void 0;
}
async function startNodeRealtimeAudioBridge(params) {
	let stopped = false;
	let bridge = null;
	let realtimeReady = false;
	let lastInputAt;
	let lastOutputAt;
	let lastInputBytes = 0;
	let lastOutputBytes = 0;
	const resolved = resolveGoogleMeetRealtimeProvider({
		config: params.config,
		fullConfig: params.fullConfig,
		providers: params.providers
	});
	const transcript = [];
	const stop = async () => {
		if (stopped) return;
		stopped = true;
		try {
			bridge?.close();
		} catch (error) {
			params.logger.debug?.(`[google-meet] node realtime bridge close ignored: ${formatErrorMessage(error)}`);
		}
		try {
			await params.runtime.nodes.invoke({
				nodeId: params.nodeId,
				command: "googlemeet.chrome",
				params: {
					action: "stop",
					bridgeId: params.bridgeId
				},
				timeoutMs: 5e3
			});
		} catch (error) {
			params.logger.debug?.(`[google-meet] node audio bridge stop ignored: ${formatErrorMessage(error)}`);
		}
	};
	bridge = createRealtimeVoiceBridgeSession({
		provider: resolved.provider,
		providerConfig: resolved.providerConfig,
		instructions: params.config.realtime.instructions,
		initialGreetingInstructions: params.config.realtime.introMessage,
		triggerGreetingOnReady: false,
		markStrategy: "ack-immediately",
		tools: resolveGoogleMeetRealtimeTools(params.config.realtime.toolPolicy),
		audioSink: {
			isOpen: () => !stopped,
			sendAudio: (muLaw) => {
				lastOutputAt = (/* @__PURE__ */ new Date()).toISOString();
				lastOutputBytes += muLaw.byteLength;
				params.runtime.nodes.invoke({
					nodeId: params.nodeId,
					command: "googlemeet.chrome",
					params: {
						action: "pushAudio",
						bridgeId: params.bridgeId,
						base64: Buffer.from(muLaw).toString("base64")
					},
					timeoutMs: 5e3
				}).catch((error) => {
					params.logger.warn(`[google-meet] node audio output failed: ${formatErrorMessage(error)}`);
					stop();
				});
			}
		},
		onTranscript: (role, text, isFinal) => {
			if (isFinal) {
				transcript.push({
					role,
					text
				});
				if (transcript.length > 40) transcript.splice(0, transcript.length - 40);
				params.logger.debug?.(`[google-meet] ${role}: ${text}`);
			}
		},
		onToolCall: (event, session) => {
			if (event.name !== GOOGLE_MEET_AGENT_CONSULT_TOOL_NAME) {
				session.submitToolResult(event.callId || event.itemId, { error: `Tool "${event.name}" not available` });
				return;
			}
			consultOpenClawAgentForGoogleMeet({
				config: params.config,
				fullConfig: params.fullConfig,
				runtime: params.runtime,
				logger: params.logger,
				meetingSessionId: params.meetingSessionId,
				args: event.args,
				transcript
			}).then((result) => {
				session.submitToolResult(event.callId || event.itemId, result);
			}).catch((error) => {
				session.submitToolResult(event.callId || event.itemId, { error: formatErrorMessage(error) });
			});
		},
		onError: (error) => {
			params.logger.warn(`[google-meet] node realtime voice bridge failed: ${formatErrorMessage(error)}`);
			stop();
		},
		onClose: (reason) => {
			realtimeReady = false;
			if (reason === "error") stop();
		},
		onReady: () => {
			realtimeReady = true;
		}
	});
	await bridge.connect();
	(async () => {
		for (;;) {
			if (stopped) break;
			try {
				const raw = await params.runtime.nodes.invoke({
					nodeId: params.nodeId,
					command: "googlemeet.chrome",
					params: {
						action: "pullAudio",
						bridgeId: params.bridgeId,
						timeoutMs: 250
					},
					timeoutMs: 2e3
				});
				const result = asRecord$2(asRecord$2(raw).payload ?? raw);
				const base64 = readString$1(result.base64);
				if (base64) {
					const audio = Buffer.from(base64, "base64");
					lastInputAt = (/* @__PURE__ */ new Date()).toISOString();
					lastInputBytes += audio.byteLength;
					bridge?.sendAudio(audio);
				}
				if (result.closed === true) await stop();
			} catch (error) {
				if (!stopped) {
					params.logger.warn(`[google-meet] node audio input failed: ${formatErrorMessage(error)}`);
					await stop();
				}
			}
		}
	})();
	return {
		type: "node-command-pair",
		providerId: resolved.provider.id,
		nodeId: params.nodeId,
		bridgeId: params.bridgeId,
		speak: (instructions) => {
			bridge?.triggerGreeting(instructions);
		},
		getHealth: () => ({
			providerConnected: bridge?.bridge.isConnected() ?? false,
			realtimeReady,
			audioInputActive: lastInputBytes > 0,
			audioOutputActive: lastOutputBytes > 0,
			lastInputAt,
			lastOutputAt,
			lastInputBytes,
			lastOutputBytes,
			bridgeClosed: stopped
		}),
		stop
	};
}
//#endregion
//#region extensions/google-meet/src/transports/chrome.ts
const GOOGLE_MEET_SYSTEM_PROFILER_COMMAND = "/usr/sbin/system_profiler";
function outputMentionsBlackHole2ch(output) {
	return /\bBlackHole\s+2ch\b/i.test(output);
}
async function assertBlackHole2chAvailable(params) {
	if (process.platform !== "darwin") throw new Error("Chrome Meet transport with blackhole-2ch audio is currently macOS-only");
	const result = await params.runtime.system.runCommandWithTimeout([GOOGLE_MEET_SYSTEM_PROFILER_COMMAND, "SPAudioDataType"], { timeoutMs: params.timeoutMs });
	const output = `${result.stdout ?? ""}\n${result.stderr ?? ""}`;
	if (result.code !== 0 || !outputMentionsBlackHole2ch(output)) {
		const hint = params.runtime.system.formatNativeDependencyHint?.({
			packageName: "BlackHole 2ch",
			downloadCommand: "brew install blackhole-2ch"
		}) ?? "";
		throw new Error([
			"BlackHole 2ch audio device not found.",
			"Install BlackHole 2ch and route Chrome input/output through the OpenClaw audio bridge.",
			hint
		].filter(Boolean).join(" "));
	}
}
async function launchChromeMeet(params) {
	await assertBlackHole2chAvailable({
		runtime: params.runtime,
		timeoutMs: Math.min(params.config.chrome.joinTimeoutMs, 1e4)
	});
	if (params.config.chrome.audioBridgeHealthCommand) {
		const health = await params.runtime.system.runCommandWithTimeout(params.config.chrome.audioBridgeHealthCommand, { timeoutMs: params.config.chrome.joinTimeoutMs });
		if (health.code !== 0) throw new Error(`Chrome audio bridge health check failed: ${health.stderr || health.stdout || health.code}`);
	}
	let audioBridge;
	if (params.config.chrome.audioBridgeCommand) {
		const bridge = await params.runtime.system.runCommandWithTimeout(params.config.chrome.audioBridgeCommand, { timeoutMs: params.config.chrome.joinTimeoutMs });
		if (bridge.code !== 0) throw new Error(`failed to start Chrome audio bridge: ${bridge.stderr || bridge.stdout || bridge.code}`);
		audioBridge = { type: "external-command" };
	} else if (params.mode === "realtime") {
		if (!params.config.chrome.audioInputCommand || !params.config.chrome.audioOutputCommand) throw new Error("Chrome realtime mode requires chrome.audioInputCommand and chrome.audioOutputCommand, or chrome.audioBridgeCommand for an external bridge.");
		audioBridge = {
			type: "command-pair",
			...await startCommandRealtimeAudioBridge({
				config: params.config,
				fullConfig: params.fullConfig,
				runtime: params.runtime,
				meetingSessionId: params.meetingSessionId,
				inputCommand: params.config.chrome.audioInputCommand,
				outputCommand: params.config.chrome.audioOutputCommand,
				logger: params.logger
			})
		};
	}
	if (!params.config.chrome.launch) return {
		launched: false,
		audioBridge
	};
	const argv = [
		"open",
		"-a",
		"Google Chrome"
	];
	if (params.config.chrome.browserProfile) argv.push("--args", `--profile-directory=${params.config.chrome.browserProfile}`);
	argv.push(params.url);
	let commandPairBridgeStopped = false;
	const stopCommandPairBridge = async () => {
		if (commandPairBridgeStopped) return;
		commandPairBridgeStopped = true;
		if (audioBridge?.type === "command-pair") await audioBridge.stop();
	};
	try {
		const result = await params.runtime.system.runCommandWithTimeout(argv, { timeoutMs: params.config.chrome.joinTimeoutMs });
		if (result.code === 0) return {
			launched: true,
			audioBridge
		};
		await stopCommandPairBridge();
		throw new Error(`failed to launch Chrome for Meet: ${result.stderr || result.stdout || result.code}`);
	} catch (error) {
		await stopCommandPairBridge();
		throw error;
	}
}
function parseNodeStartResult(raw) {
	const value = raw && typeof raw === "object" && "payload" in raw ? raw.payload : raw;
	if (!value || typeof value !== "object") throw new Error("Google Meet node returned an invalid start result.");
	return value;
}
function parseMeetBrowserStatus(result) {
	const raw = (result && typeof result === "object" ? result : {}).result;
	if (typeof raw !== "string" || !raw.trim()) return;
	const parsed = JSON.parse(raw);
	return {
		inCall: parsed.inCall,
		micMuted: parsed.micMuted,
		manualActionRequired: parsed.manualActionRequired,
		manualActionReason: parsed.manualActionReason,
		manualActionMessage: parsed.manualActionMessage,
		browserUrl: parsed.url,
		browserTitle: parsed.title,
		status: "browser-control",
		notes: Array.isArray(parsed.notes) ? parsed.notes.filter((note) => typeof note === "string") : void 0
	};
}
function meetStatusScript(params) {
	return `() => {
  const text = (node) => (node?.innerText || node?.textContent || "").trim();
  const buttons = [...document.querySelectorAll('button')];
  const notes = [];
  const findButton = (pattern) =>
    buttons.find((button) => {
      const label = [
        button.getAttribute("aria-label"),
        button.getAttribute("data-tooltip"),
        text(button),
      ]
        .filter(Boolean)
        .join(" ");
      return pattern.test(label) && !button.disabled;
    });
  const input = [...document.querySelectorAll('input')].find((el) =>
    /your name/i.test(el.getAttribute('aria-label') || el.placeholder || '')
  );
  if (${JSON.stringify(params.autoJoin)} && input && !input.value) {
    input.focus();
    input.value = ${JSON.stringify(params.guestName)};
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
  }
  const pageText = text(document.body).toLowerCase();
  const host = location.hostname.toLowerCase();
  const pageUrl = location.href;
  const join = ${JSON.stringify(params.autoJoin)}
    ? findButton(/join now|ask to join/i)
    : null;
  if (join) join.click();
  const microphoneChoice = findButton(/\\buse microphone\\b/i);
  if (microphoneChoice) {
    microphoneChoice.click();
    notes.push("Accepted Meet microphone prompt with browser automation.");
  }
  const mic = buttons.find((button) => /turn off microphone|turn on microphone|microphone/i.test(button.getAttribute('aria-label') || text(button)));
  const inCall = buttons.some((button) => /leave call/i.test(button.getAttribute('aria-label') || text(button)));
  let manualActionReason;
  let manualActionMessage;
  if (!inCall && (host === "accounts.google.com" || /use your google account|to continue to google meet|choose an account|sign in to (join|continue)/i.test(pageText))) {
    manualActionReason = "google-login-required";
    manualActionMessage = "Sign in to Google in the OpenClaw browser profile, then retry the Meet join.";
  } else if (!inCall && /asking to be let in|you.?ll join when someone lets you in|waiting to be let in|ask to join/i.test(pageText)) {
    manualActionReason = "meet-admission-required";
    manualActionMessage = "Admit the OpenClaw browser participant in Google Meet, then retry speech.";
  } else if (!inCall && /allow.*(microphone|camera)|blocked.*(microphone|camera)|permission.*(microphone|camera)/i.test(pageText)) {
    manualActionReason = "meet-permission-required";
    manualActionMessage = "Allow microphone/camera permissions for Meet in the OpenClaw browser profile, then retry.";
  } else if (!inCall && !microphoneChoice && /do you want people to hear you in the meeting/i.test(pageText)) {
    manualActionReason = "meet-audio-choice-required";
    manualActionMessage = "Meet is showing the microphone choice. Click Use microphone in the OpenClaw browser profile, then retry.";
  }
  return JSON.stringify({
    clickedJoin: Boolean(join),
    clickedMicrophoneChoice: Boolean(microphoneChoice),
    inCall,
    micMuted: mic ? /turn on microphone/i.test(mic.getAttribute('aria-label') || text(mic)) : undefined,
    manualActionRequired: Boolean(manualActionReason),
    manualActionReason,
    manualActionMessage,
    title: document.title,
    url: pageUrl,
    notes
  });
}`;
}
async function openMeetWithBrowserProxy(params) {
	if (!params.config.chrome.launch) return { launched: false };
	const timeoutMs = Math.max(1e3, params.config.chrome.joinTimeoutMs);
	let targetId;
	let tab;
	if (params.config.chrome.reuseExistingTab) {
		tab = asBrowserTabs(await callBrowserProxyOnNode({
			runtime: params.runtime,
			nodeId: params.nodeId,
			method: "GET",
			path: "/tabs",
			timeoutMs: Math.min(timeoutMs, 5e3)
		})).find((entry) => isSameMeetUrlForReuse(entry.url, params.url));
		targetId = tab?.targetId;
		if (targetId) await callBrowserProxyOnNode({
			runtime: params.runtime,
			nodeId: params.nodeId,
			method: "POST",
			path: "/tabs/focus",
			body: { targetId },
			timeoutMs: Math.min(timeoutMs, 5e3)
		});
	}
	if (!targetId) {
		tab = readBrowserTab(await callBrowserProxyOnNode({
			runtime: params.runtime,
			nodeId: params.nodeId,
			method: "POST",
			path: "/tabs/open",
			body: { url: params.url },
			timeoutMs
		}));
		targetId = tab?.targetId;
	}
	if (!targetId) return {
		launched: true,
		browser: {
			status: "browser-control",
			notes: ["Browser proxy opened Meet but did not return a targetId."],
			browserUrl: tab?.url,
			browserTitle: tab?.title
		}
	};
	const deadline = Date.now() + Math.max(0, params.config.chrome.waitForInCallMs);
	let browser = {
		status: "browser-control",
		browserUrl: tab?.url,
		browserTitle: tab?.title
	};
	do {
		try {
			browser = parseMeetBrowserStatus(await callBrowserProxyOnNode({
				runtime: params.runtime,
				nodeId: params.nodeId,
				method: "POST",
				path: "/act",
				body: {
					kind: "evaluate",
					targetId,
					fn: meetStatusScript({
						guestName: params.config.chrome.guestName,
						autoJoin: params.config.chrome.autoJoin
					})
				},
				timeoutMs: Math.min(timeoutMs, 1e4)
			})) ?? browser;
			if (browser?.inCall === true) return {
				launched: true,
				browser
			};
			if (browser?.manualActionRequired === true) return {
				launched: true,
				browser
			};
		} catch (error) {
			browser = {
				...browser,
				inCall: false,
				manualActionRequired: true,
				manualActionReason: "browser-control-unavailable",
				manualActionMessage: "Open the OpenClaw browser profile, finish Google Meet login, admission, or permission prompts, then retry.",
				notes: [`Browser control could not inspect or auto-join Meet: ${error instanceof Error ? error.message : String(error)}`]
			};
			break;
		}
		if (Date.now() <= deadline) await new Promise((resolve) => setTimeout(resolve, 750));
	} while (Date.now() <= deadline);
	return {
		launched: true,
		browser
	};
}
function isRecoverableMeetTab(tab, url) {
	if (url) return isSameMeetUrlForReuse(tab.url, url);
	if (normalizeMeetUrlForReuse(tab.url)) return true;
	return (tab.url ?? "").startsWith("https://accounts.google.com/") && /sign in|google accounts|meet/i.test(tab.title ?? "");
}
async function recoverCurrentMeetTabOnNode(params) {
	const nodeId = await resolveChromeNode({
		runtime: params.runtime,
		requestedNode: params.config.chromeNode.node
	});
	const timeoutMs = Math.max(1e3, params.config.chrome.joinTimeoutMs);
	const tab = asBrowserTabs(await callBrowserProxyOnNode({
		runtime: params.runtime,
		nodeId,
		method: "GET",
		path: "/tabs",
		timeoutMs: Math.min(timeoutMs, 5e3)
	})).find((entry) => isRecoverableMeetTab(entry, params.url));
	const targetId = tab?.targetId;
	if (!tab || !targetId) return {
		nodeId,
		found: false,
		tab,
		message: params.url ? `No existing Meet tab matched ${params.url}.` : "No existing Meet tab found on the selected Chrome node."
	};
	await callBrowserProxyOnNode({
		runtime: params.runtime,
		nodeId,
		method: "POST",
		path: "/tabs/focus",
		body: { targetId },
		timeoutMs: Math.min(timeoutMs, 5e3)
	});
	const browser = parseMeetBrowserStatus(await callBrowserProxyOnNode({
		runtime: params.runtime,
		nodeId,
		method: "POST",
		path: "/act",
		body: {
			kind: "evaluate",
			targetId,
			fn: meetStatusScript({
				guestName: params.config.chrome.guestName,
				autoJoin: false
			})
		},
		timeoutMs: Math.min(timeoutMs, 1e4)
	}));
	return {
		nodeId,
		found: true,
		targetId,
		tab,
		browser,
		message: (browser?.manualActionRequired ? browser.manualActionMessage || browser.manualActionReason : void 0) ?? (browser?.inCall ? "Existing Meet tab is in-call." : "Existing Meet tab focused.")
	};
}
async function launchChromeMeetOnNode(params) {
	const nodeId = await resolveChromeNode({
		runtime: params.runtime,
		requestedNode: params.config.chromeNode.node
	});
	const browserControl = await openMeetWithBrowserProxy({
		runtime: params.runtime,
		nodeId,
		config: params.config,
		url: params.url
	});
	const result = parseNodeStartResult(await params.runtime.nodes.invoke({
		nodeId,
		command: "googlemeet.chrome",
		params: {
			action: "start",
			url: params.url,
			mode: params.mode,
			launch: false,
			browserProfile: params.config.chrome.browserProfile,
			joinTimeoutMs: params.config.chrome.joinTimeoutMs,
			audioInputCommand: params.config.chrome.audioInputCommand,
			audioOutputCommand: params.config.chrome.audioOutputCommand,
			audioBridgeCommand: params.config.chrome.audioBridgeCommand,
			audioBridgeHealthCommand: params.config.chrome.audioBridgeHealthCommand
		},
		timeoutMs: params.config.chrome.joinTimeoutMs + 5e3
	}));
	if (result.audioBridge?.type === "node-command-pair") {
		if (!result.bridgeId) throw new Error("Google Meet node did not return an audio bridge id.");
		const bridge = await startNodeRealtimeAudioBridge({
			config: params.config,
			fullConfig: params.fullConfig,
			runtime: params.runtime,
			meetingSessionId: params.meetingSessionId,
			nodeId,
			bridgeId: result.bridgeId,
			logger: params.logger
		});
		return {
			nodeId,
			launched: browserControl.launched || result.launched === true,
			audioBridge: bridge,
			browser: browserControl.browser ?? result.browser
		};
	}
	if (result.audioBridge?.type === "external-command") return {
		nodeId,
		launched: browserControl.launched || result.launched === true,
		audioBridge: { type: "external-command" },
		browser: browserControl.browser ?? result.browser
	};
	return {
		nodeId,
		launched: browserControl.launched || result.launched === true,
		browser: browserControl.browser ?? result.browser
	};
}
//#endregion
//#region extensions/google-meet/src/node-host.ts
const sessions = /* @__PURE__ */ new Map();
function asRecord$1(value) {
	return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}
function readString(value) {
	return typeof value === "string" && value.trim() ? value.trim() : void 0;
}
function readStringArray(value) {
	if (!Array.isArray(value)) return;
	const result = value.filter((entry) => typeof entry === "string" && entry.length > 0);
	return result.length > 0 ? result : void 0;
}
function readNumber(value, fallback) {
	return typeof value === "number" && Number.isFinite(value) && value > 0 ? value : fallback;
}
function runCommandWithTimeout(argv, timeoutMs) {
	const [command, ...args] = argv;
	if (!command) throw new Error("command must not be empty");
	const result = spawnSync(command, args, {
		encoding: "utf8",
		timeout: timeoutMs
	});
	return {
		code: typeof result.status === "number" ? result.status : result.error ? 1 : 0,
		stdout: result.stdout ?? "",
		stderr: result.stderr ?? (result.error ? formatErrorMessage(result.error) : "")
	};
}
function assertBlackHoleAvailable(timeoutMs) {
	if (process.platform !== "darwin") throw new Error("Chrome Meet transport with blackhole-2ch audio is currently macOS-only");
	const result = runCommandWithTimeout([GOOGLE_MEET_SYSTEM_PROFILER_COMMAND, "SPAudioDataType"], timeoutMs);
	const output = `${result.stdout}\n${result.stderr}`;
	if (result.code !== 0 || !outputMentionsBlackHole2ch(output)) throw new Error("BlackHole 2ch audio device not found on the node.");
}
function splitCommand(argv) {
	const [command, ...args] = argv;
	if (!command) throw new Error("audio command must not be empty");
	return {
		command,
		args
	};
}
function wake(session) {
	const waiters = session.waiters.splice(0);
	for (const waiter of waiters) waiter();
}
function stopSession(session) {
	if (session.closed) return;
	session.closed = true;
	session.input?.kill("SIGTERM");
	session.output?.kill("SIGTERM");
	wake(session);
}
function startCommandPair(params) {
	const input = splitCommand(params.inputCommand);
	const output = splitCommand(params.outputCommand);
	const session = {
		id: `meet_node_${randomUUID()}`,
		chunks: [],
		waiters: [],
		closed: false,
		createdAt: (/* @__PURE__ */ new Date()).toISOString(),
		lastInputBytes: 0,
		lastOutputBytes: 0
	};
	const outputProcess = spawn(output.command, output.args, { stdio: [
		"pipe",
		"ignore",
		"pipe"
	] });
	const inputProcess = spawn(input.command, input.args, { stdio: [
		"ignore",
		"pipe",
		"pipe"
	] });
	session.input = inputProcess;
	session.output = outputProcess;
	inputProcess.stdout?.on("data", (chunk) => {
		const audio = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
		session.lastInputAt = (/* @__PURE__ */ new Date()).toISOString();
		session.lastInputBytes += audio.byteLength;
		session.chunks.push(audio);
		if (session.chunks.length > 200) session.chunks.splice(0, session.chunks.length - 200);
		wake(session);
	});
	inputProcess.on("exit", () => stopSession(session));
	outputProcess.on("exit", () => stopSession(session));
	inputProcess.on("error", () => stopSession(session));
	outputProcess.on("error", () => stopSession(session));
	sessions.set(session.id, session);
	return session;
}
async function pullAudio(params) {
	const bridgeId = readString(params.bridgeId);
	if (!bridgeId) throw new Error("bridgeId required");
	const session = sessions.get(bridgeId);
	if (!session) throw new Error(`unknown bridgeId: ${bridgeId}`);
	const timeoutMs = Math.min(readNumber(params.timeoutMs, 250), 2e3);
	if (session.chunks.length === 0 && !session.closed) await Promise.race([setTimeout$1(timeoutMs), new Promise((resolve) => {
		session.waiters.push(resolve);
	})]);
	const chunk = session.chunks.shift();
	return {
		bridgeId,
		closed: session.closed,
		base64: chunk ? chunk.toString("base64") : void 0
	};
}
function pushAudio(params) {
	const bridgeId = readString(params.bridgeId);
	const base64 = readString(params.base64);
	if (!bridgeId || !base64) throw new Error("bridgeId and base64 required");
	const session = sessions.get(bridgeId);
	if (!session || session.closed) throw new Error(`bridge is not open: ${bridgeId}`);
	const audio = Buffer.from(base64, "base64");
	session.lastOutputAt = (/* @__PURE__ */ new Date()).toISOString();
	session.lastOutputBytes += audio.byteLength;
	session.output?.stdin?.write(audio);
	return {
		bridgeId,
		ok: true
	};
}
function startChrome(params) {
	const url = readString(params.url);
	if (!url) throw new Error("url required");
	const timeoutMs = readNumber(params.joinTimeoutMs, 3e4);
	assertBlackHoleAvailable(Math.min(timeoutMs, 1e4));
	const healthCommand = readStringArray(params.audioBridgeHealthCommand);
	if (healthCommand) {
		const health = runCommandWithTimeout(healthCommand, timeoutMs);
		if (health.code !== 0) throw new Error(`Chrome audio bridge health check failed: ${health.stderr || health.stdout || health.code}`);
	}
	let bridgeId;
	let audioBridge;
	const bridgeCommand = readStringArray(params.audioBridgeCommand);
	if (bridgeCommand) {
		const bridge = runCommandWithTimeout(bridgeCommand, timeoutMs);
		if (bridge.code !== 0) throw new Error(`failed to start Chrome audio bridge: ${bridge.stderr || bridge.stdout || bridge.code}`);
		audioBridge = { type: "external-command" };
	} else if (params.mode === "realtime") {
		bridgeId = startCommandPair({
			inputCommand: readStringArray(params.audioInputCommand) ?? [...DEFAULT_GOOGLE_MEET_AUDIO_INPUT_COMMAND],
			outputCommand: readStringArray(params.audioOutputCommand) ?? [...DEFAULT_GOOGLE_MEET_AUDIO_OUTPUT_COMMAND]
		}).id;
		audioBridge = { type: "node-command-pair" };
	}
	if (params.launch !== false) {
		const argv = [
			"open",
			"-a",
			"Google Chrome"
		];
		const browserProfile = readString(params.browserProfile);
		if (browserProfile) argv.push("--args", `--profile-directory=${browserProfile}`);
		argv.push(url);
		const result = runCommandWithTimeout(argv, timeoutMs);
		if (result.code !== 0) {
			if (bridgeId) {
				const session = sessions.get(bridgeId);
				if (session) stopSession(session);
			}
			throw new Error(`failed to launch Chrome for Meet: ${result.stderr || result.stdout || result.code}`);
		}
	}
	return {
		launched: params.launch !== false,
		bridgeId,
		audioBridge,
		browser: params.launch !== false ? {
			status: "chrome-opened",
			browserUrl: url,
			notes: ["Browser page control is handled by OpenClaw browser automation when using chrome-node."]
		} : void 0
	};
}
function bridgeStatus(params) {
	const bridgeId = readString(params.bridgeId);
	const session = bridgeId ? sessions.get(bridgeId) : void 0;
	return { bridge: session ? {
		bridgeId,
		closed: session.closed,
		createdAt: session.createdAt,
		lastInputAt: session.lastInputAt,
		lastOutputAt: session.lastOutputAt,
		lastInputBytes: session.lastInputBytes,
		lastOutputBytes: session.lastOutputBytes
	} : bridgeId ? {
		bridgeId,
		closed: true
	} : void 0 };
}
function stopChrome(params) {
	const bridgeId = readString(params.bridgeId);
	if (!bridgeId) return {
		ok: true,
		stopped: false
	};
	const session = sessions.get(bridgeId);
	if (!session) return {
		ok: true,
		stopped: false
	};
	stopSession(session);
	sessions.delete(bridgeId);
	return {
		ok: true,
		stopped: true
	};
}
async function handleGoogleMeetNodeHostCommand(paramsJSON) {
	const params = asRecord$1(paramsJSON ? JSON.parse(paramsJSON) : {});
	const action = readString(params.action);
	let result;
	switch (action) {
		case "setup":
			assertBlackHoleAvailable(1e4);
			result = { ok: true };
			break;
		case "start":
			result = startChrome(params);
			break;
		case "status":
			result = bridgeStatus(params);
			break;
		case "pullAudio":
			result = await pullAudio(params);
			break;
		case "pushAudio":
			result = pushAudio(params);
			break;
		case "stop":
			result = stopChrome(params);
			break;
		default: throw new Error("unsupported googlemeet.chrome action");
	}
	return JSON.stringify(result);
}
//#endregion
//#region extensions/google-meet/src/setup.ts
function resolveUserPath(input) {
	if (input === "~") return os.homedir();
	if (input.startsWith("~/")) return path.join(os.homedir(), input.slice(2));
	return input;
}
function getGoogleMeetSetupStatus(config, options) {
	const checks = [];
	const env = options?.env ?? process.env;
	const fullConfig = asRecord(options?.fullConfig);
	const pluginEntries = asRecord(asRecord(fullConfig.plugins).entries);
	const pluginAllow = asRecord(fullConfig.plugins).allow;
	const voiceCallEntry = asRecord(pluginEntries["voice-call"]);
	const voiceCallConfig = asRecord(voiceCallEntry.config);
	const voiceCallTwilioConfig = asRecord(voiceCallConfig.twilio);
	if (config.auth.tokenPath) {
		const tokenPath = resolveUserPath(config.auth.tokenPath);
		checks.push({
			id: "google-oauth-token",
			ok: fs.existsSync(tokenPath),
			message: fs.existsSync(tokenPath) ? "Google OAuth token file found" : `Google OAuth token file missing at ${config.auth.tokenPath}`
		});
	} else checks.push({
		id: "google-oauth-token",
		ok: true,
		message: "Google OAuth token path not configured; Chrome profile auth will be used"
	});
	if (config.chrome.browserProfile) {
		const profilePath = path.join(os.homedir(), "Library", "Application Support", "Google", "Chrome", config.chrome.browserProfile);
		checks.push({
			id: "chrome-profile",
			ok: fs.existsSync(profilePath),
			message: fs.existsSync(profilePath) ? "Chrome profile found" : `Chrome profile missing: ${config.chrome.browserProfile}`
		});
	} else checks.push({
		id: "chrome-profile",
		ok: true,
		message: "Chrome profile not pinned; default signed-in profile will be used"
	});
	checks.push({
		id: "audio-bridge",
		ok: Boolean(config.chrome.audioBridgeCommand || config.chrome.audioInputCommand && config.chrome.audioOutputCommand),
		message: config.chrome.audioBridgeCommand ? "Chrome audio bridge command configured" : config.chrome.audioInputCommand && config.chrome.audioOutputCommand ? "Chrome command-pair realtime audio bridge configured" : "Chrome realtime audio bridge not configured"
	});
	checks.push({
		id: "guest-join-defaults",
		ok: Boolean(config.chrome.guestName && config.chrome.autoJoin && config.chrome.reuseExistingTab),
		message: config.chrome.guestName && config.chrome.autoJoin && config.chrome.reuseExistingTab ? "Guest auto-join and tab reuse defaults are enabled" : "Set chrome.guestName, chrome.autoJoin, and chrome.reuseExistingTab for unattended guest joins"
	});
	checks.push({
		id: "chrome-node-target",
		ok: config.defaultTransport !== "chrome-node" || Boolean(config.chromeNode.node),
		message: config.defaultTransport === "chrome-node" && !config.chromeNode.node ? "chrome-node default should pin chromeNode.node when multiple nodes may be connected" : config.chromeNode.node ? `Chrome node pinned to ${config.chromeNode.node}` : "Chrome node not pinned; automatic selection works when exactly one capable node is connected"
	});
	checks.push({
		id: "intro-after-in-call",
		ok: config.chrome.waitForInCallMs > 0,
		message: config.chrome.waitForInCallMs > 0 ? `Realtime intro waits up to ${config.chrome.waitForInCallMs}ms for the Meet tab to be in-call` : "Set chrome.waitForInCallMs to delay realtime intro until the Meet tab is in-call"
	});
	if (config.voiceCall.enabled && (config.defaultTransport === "twilio" || Boolean(config.twilio.defaultDialInNumber) || Object.hasOwn(pluginEntries, "voice-call"))) {
		const voiceCallAllowed = !Array.isArray(pluginAllow) || pluginAllow.includes("voice-call");
		const voiceCallEnabled = voiceCallEntry.enabled !== false;
		checks.push({
			id: "twilio-voice-call-plugin",
			ok: voiceCallAllowed && voiceCallEnabled,
			message: voiceCallAllowed && voiceCallEnabled ? "Twilio transport can delegate dialing to the voice-call plugin" : "Enable plugins.entries.voice-call and include voice-call in plugins.allow for Twilio dialing"
		});
		if ((normalizeOptionalString(voiceCallConfig.provider) ?? "twilio") === "twilio") {
			const accountSid = normalizeOptionalString(voiceCallTwilioConfig.accountSid);
			const authToken = normalizeOptionalString(voiceCallTwilioConfig.authToken);
			const fromNumber = normalizeOptionalString(voiceCallConfig.fromNumber);
			const twilioReady = Boolean((accountSid || env.TWILIO_ACCOUNT_SID) && (authToken || env.TWILIO_AUTH_TOKEN) && (fromNumber || env.TWILIO_FROM_NUMBER));
			checks.push({
				id: "twilio-voice-call-credentials",
				ok: twilioReady,
				message: twilioReady ? "Twilio voice-call credentials are configured" : "Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_FROM_NUMBER or configure voice-call Twilio credentials"
			});
		}
	}
	return {
		ok: checks.every((check) => check.ok),
		checks
	};
}
function addGoogleMeetSetupCheck(status, check) {
	const checks = [...status.checks, check];
	return {
		ok: checks.every((item) => item.ok),
		checks
	};
}
function asRecord(value) {
	return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}
function normalizeOptionalString(value) {
	return typeof value === "string" && value.trim() ? value.trim() : void 0;
}
//#endregion
//#region extensions/google-meet/src/transports/twilio.ts
const DTMF_PATTERN = /^[0-9*#wWpP,]+$/;
function normalizeDialInNumber(value) {
	const normalized = normalizeOptionalString$1(value);
	if (!normalized) return;
	const compact = normalized.replace(/[()\s.-]/g, "");
	if (!/^\+?[0-9]{5,20}$/.test(compact)) throw new Error("dialInNumber must be a phone number");
	return compact;
}
function normalizeDtmfSequence(value) {
	const normalized = normalizeOptionalString$1(value);
	if (!normalized) return;
	const compact = normalized.replace(/\s+/g, "");
	if (!DTMF_PATTERN.test(compact)) throw new Error("dtmfSequence may only contain digits, *, #, comma, w, p");
	return compact;
}
function buildMeetDtmfSequence(params) {
	const explicit = normalizeDtmfSequence(params.dtmfSequence);
	if (explicit) return explicit;
	const pin = normalizeOptionalString$1(params.pin);
	if (!pin) return;
	const compactPin = pin.replace(/\s+/g, "");
	if (!/^[0-9]+#?$/.test(compactPin)) throw new Error("pin may only contain digits and an optional trailing #");
	return compactPin.endsWith("#") ? compactPin : `${compactPin}#`;
}
//#endregion
//#region extensions/google-meet/src/voice-call-gateway.ts
async function createConnectedGatewayClient(config) {
	let client;
	await new Promise((resolve, reject) => {
		const timer = setTimeout(() => reject(/* @__PURE__ */ new Error("gateway connect timeout")), config.voiceCall.requestTimeoutMs);
		client = new GatewayClient({
			url: config.voiceCall.gatewayUrl,
			token: config.voiceCall.token,
			requestTimeoutMs: config.voiceCall.requestTimeoutMs,
			clientName: "cli",
			clientDisplayName: "Google Meet plugin",
			scopes: ["operator.write"],
			onHelloOk: () => {
				clearTimeout(timer);
				resolve();
			},
			onConnectError: (err) => {
				clearTimeout(timer);
				reject(err);
			}
		});
		client.start();
	});
	return client;
}
async function joinMeetViaVoiceCallGateway(params) {
	let client;
	try {
		client = await createConnectedGatewayClient(params.config);
		const start = await client.request("voicecall.start", {
			to: params.dialInNumber,
			message: params.config.voiceCall.introMessage,
			mode: "conversation"
		}, { timeoutMs: params.config.voiceCall.requestTimeoutMs });
		if (!start.callId) throw new Error(start.error || "voicecall.start did not return callId");
		if (params.dtmfSequence) {
			await setTimeout$1(params.config.voiceCall.dtmfDelayMs);
			await client.request("voicecall.dtmf", {
				callId: start.callId,
				digits: params.dtmfSequence
			}, { timeoutMs: params.config.voiceCall.requestTimeoutMs });
		}
		return {
			callId: start.callId,
			dtmfSent: Boolean(params.dtmfSequence)
		};
	} finally {
		await client?.stopAndWait({ timeoutMs: 1e3 });
	}
}
async function endMeetVoiceCallGatewayCall(params) {
	let client;
	try {
		client = await createConnectedGatewayClient(params.config);
		await client.request("voicecall.end", { callId: params.callId }, { timeoutMs: params.config.voiceCall.requestTimeoutMs });
	} finally {
		await client?.stopAndWait({ timeoutMs: 1e3 });
	}
}
//#endregion
//#region extensions/google-meet/src/runtime.ts
function nowIso() {
	return (/* @__PURE__ */ new Date()).toISOString();
}
function normalizeMeetUrl(input) {
	const raw = normalizeOptionalString$1(input);
	if (!raw) throw new Error("url required");
	let url;
	try {
		url = new URL(raw);
	} catch {
		throw new Error("url must be a valid Google Meet URL");
	}
	if (url.protocol !== "https:" || url.hostname.toLowerCase() !== "meet.google.com") throw new Error("url must be an explicit https://meet.google.com/... URL");
	if (!/^\/[a-z]{3}-[a-z]{4}-[a-z]{3}(?:$|[/?#])/i.test(url.pathname)) throw new Error("url must include a Google Meet meeting code");
	return url.toString();
}
function resolveTransport(input, config) {
	return input ?? config.defaultTransport;
}
function resolveMode(input, config) {
	return input ?? config.defaultMode;
}
var GoogleMeetRuntime = class {
	#sessions = /* @__PURE__ */ new Map();
	#sessionStops = /* @__PURE__ */ new Map();
	#sessionSpeakers = /* @__PURE__ */ new Map();
	#sessionHealth = /* @__PURE__ */ new Map();
	constructor(params) {
		this.params = params;
	}
	list() {
		this.#refreshHealth();
		return [...this.#sessions.values()].toSorted((a, b) => a.createdAt.localeCompare(b.createdAt));
	}
	status(sessionId) {
		this.#refreshHealth(sessionId);
		if (!sessionId) return {
			found: true,
			sessions: this.list()
		};
		const session = this.#sessions.get(sessionId);
		return session ? {
			found: true,
			session
		} : { found: false };
	}
	async setupStatus() {
		let status = getGoogleMeetSetupStatus(this.params.config, { fullConfig: this.params.fullConfig });
		if (this.params.config.defaultTransport === "chrome-node" || Boolean(this.params.config.chromeNode.node)) try {
			const node = await resolveChromeNodeInfo({
				runtime: this.params.runtime,
				requestedNode: this.params.config.chromeNode.node
			});
			const label = node.displayName ?? node.remoteIp ?? node.nodeId ?? "connected node";
			status = addGoogleMeetSetupCheck(status, {
				id: "chrome-node-connected",
				ok: true,
				message: `Connected Google Meet node ready: ${label}`
			});
		} catch (error) {
			status = addGoogleMeetSetupCheck(status, {
				id: "chrome-node-connected",
				ok: false,
				message: formatErrorMessage(error)
			});
		}
		return status;
	}
	async createViaBrowser() {
		return createMeetWithBrowserProxyOnNode({
			runtime: this.params.runtime,
			config: this.params.config
		});
	}
	async recoverCurrentTab(request = {}) {
		return recoverCurrentMeetTabOnNode({
			runtime: this.params.runtime,
			config: this.params.config,
			url: request.url ? normalizeMeetUrl(request.url) : void 0
		});
	}
	async join(request) {
		const url = normalizeMeetUrl(request.url);
		const transport = resolveTransport(request.transport, this.params.config);
		const mode = resolveMode(request.mode, this.params.config);
		const reusable = this.list().find((session) => session.state === "active" && isSameMeetUrlForReuse(session.url, url) && session.transport === transport && session.mode === mode);
		if (reusable) {
			reusable.notes = [...reusable.notes.filter((note) => note !== "Reused existing active Meet session."), "Reused existing active Meet session."];
			reusable.updatedAt = nowIso();
			if (request.message || this.params.config.realtime.introMessage) this.speak(reusable.id, request.message);
			return { session: reusable };
		}
		const createdAt = nowIso();
		const session = {
			id: `meet_${randomUUID()}`,
			url,
			transport,
			mode,
			state: "active",
			createdAt,
			updatedAt: createdAt,
			participantIdentity: transport === "twilio" ? "Twilio phone participant" : transport === "chrome-node" ? "signed-in Google Chrome profile on a paired node" : "signed-in Google Chrome profile",
			realtime: {
				enabled: mode === "realtime",
				provider: this.params.config.realtime.provider,
				model: this.params.config.realtime.model,
				toolPolicy: this.params.config.realtime.toolPolicy
			},
			notes: []
		};
		try {
			if (transport === "chrome" || transport === "chrome-node") {
				const result = transport === "chrome-node" ? await launchChromeMeetOnNode({
					runtime: this.params.runtime,
					config: this.params.config,
					fullConfig: this.params.fullConfig,
					meetingSessionId: session.id,
					mode,
					url,
					logger: this.params.logger
				}) : await launchChromeMeet({
					runtime: this.params.runtime,
					config: this.params.config,
					fullConfig: this.params.fullConfig,
					meetingSessionId: session.id,
					mode,
					url,
					logger: this.params.logger
				});
				session.chrome = {
					audioBackend: this.params.config.chrome.audioBackend,
					launched: result.launched,
					nodeId: "nodeId" in result ? result.nodeId : void 0,
					browserProfile: this.params.config.chrome.browserProfile,
					audioBridge: result.audioBridge ? {
						type: result.audioBridge.type,
						provider: result.audioBridge.type === "command-pair" || result.audioBridge.type === "node-command-pair" ? result.audioBridge.providerId : void 0
					} : void 0,
					health: "browser" in result ? result.browser : void 0
				};
				if (result.audioBridge?.type === "command-pair" || result.audioBridge?.type === "node-command-pair") {
					this.#sessionStops.set(session.id, result.audioBridge.stop);
					this.#sessionSpeakers.set(session.id, result.audioBridge.speak);
					this.#sessionHealth.set(session.id, result.audioBridge.getHealth);
				}
				session.notes.push(result.audioBridge ? transport === "chrome-node" ? "Chrome node transport joins as the signed-in Google profile on the selected node and routes realtime audio through the node bridge." : "Chrome transport joins as the signed-in Google profile and routes realtime audio through the configured bridge." : "Chrome transport joins as the signed-in Google profile and expects BlackHole 2ch audio routing.");
			} else {
				const dialInNumber = normalizeDialInNumber(request.dialInNumber ?? this.params.config.twilio.defaultDialInNumber);
				if (!dialInNumber) throw new Error("dialInNumber required for twilio transport");
				const dtmfSequence = buildMeetDtmfSequence({
					pin: request.pin ?? this.params.config.twilio.defaultPin,
					dtmfSequence: request.dtmfSequence ?? this.params.config.twilio.defaultDtmfSequence
				});
				const voiceCallResult = this.params.config.voiceCall.enabled ? await joinMeetViaVoiceCallGateway({
					config: this.params.config,
					dialInNumber,
					dtmfSequence
				}) : void 0;
				session.twilio = {
					dialInNumber,
					pinProvided: Boolean(request.pin ?? this.params.config.twilio.defaultPin),
					dtmfSequence,
					voiceCallId: voiceCallResult?.callId,
					dtmfSent: voiceCallResult?.dtmfSent
				};
				if (voiceCallResult?.callId) this.#sessionStops.set(session.id, async () => {
					await endMeetVoiceCallGatewayCall({
						config: this.params.config,
						callId: voiceCallResult.callId
					});
				});
				session.notes.push(this.params.config.voiceCall.enabled ? "Twilio transport delegated the call to the voice-call plugin and sent configured DTMF." : "Twilio transport is an explicit dial plan; voice-call delegation is disabled.");
			}
		} catch (err) {
			this.params.logger.warn(`[google-meet] join failed: ${formatErrorMessage(err)}`);
			throw err;
		}
		this.#sessions.set(session.id, session);
		if (mode === "realtime" && this.params.config.realtime.introMessage) this.speak(session.id, request.message);
		return { session };
	}
	async leave(sessionId) {
		const session = this.#sessions.get(sessionId);
		if (!session) return { found: false };
		const stop = this.#sessionStops.get(sessionId);
		if (stop) {
			this.#sessionStops.delete(sessionId);
			this.#sessionSpeakers.delete(sessionId);
			this.#sessionHealth.delete(sessionId);
			await stop();
		}
		session.state = "ended";
		session.updatedAt = nowIso();
		return {
			found: true,
			session
		};
	}
	speak(sessionId, instructions) {
		const session = this.#sessions.get(sessionId);
		if (!session) return {
			found: false,
			spoken: false
		};
		const speak = this.#sessionSpeakers.get(sessionId);
		if (!speak || session.state !== "active") return {
			found: true,
			spoken: false,
			session
		};
		speak(instructions || this.params.config.realtime.introMessage);
		session.updatedAt = nowIso();
		this.#refreshHealth(sessionId);
		return {
			found: true,
			spoken: true,
			session
		};
	}
	async testSpeech(request) {
		const before = new Set(this.list().map((session) => session.id));
		const result = await this.join(request);
		const spoken = this.speak(result.session.id, request.message ?? "Say exactly: Google Meet speech test complete.").spoken;
		const health = result.session.chrome?.health;
		return {
			createdSession: !before.has(result.session.id),
			inCall: health?.inCall,
			manualActionRequired: health?.manualActionRequired,
			manualActionReason: health?.manualActionReason,
			manualActionMessage: health?.manualActionMessage,
			spoken,
			session: result.session
		};
	}
	#refreshHealth(sessionId) {
		const ids = sessionId ? [sessionId] : [...this.#sessionHealth.keys()];
		for (const id of ids) {
			const session = this.#sessions.get(id);
			const getHealth = this.#sessionHealth.get(id);
			if (!session?.chrome || !getHealth) continue;
			session.chrome.health = {
				...session.chrome.health,
				...getHealth()
			};
		}
	}
};
//#endregion
//#region extensions/google-meet/index.ts
const googleMeetConfigSchema = {
	parse(value) {
		return resolveGoogleMeetConfig(value);
	},
	uiHints: {
		"defaults.meeting": {
			label: "Default Meeting",
			help: "Meet URL, meeting code, or spaces/{id} used when CLI commands omit a meeting."
		},
		"preview.enrollmentAcknowledged": {
			label: "Preview Acknowledged",
			help: "Confirms you understand the Google Meet Media API is still Developer Preview.",
			advanced: true
		},
		defaultTransport: {
			label: "Default Transport",
			help: "Chrome uses a signed-in browser profile. Chrome-node runs Chrome on a paired node. Twilio uses Meet dial-in numbers."
		},
		defaultMode: {
			label: "Default Mode",
			help: "Realtime starts the duplex voice model loop. Transcribe joins/observes without the realtime talk-back bridge."
		},
		"chrome.audioBackend": {
			label: "Chrome Audio Backend",
			help: "BlackHole 2ch is required for local duplex audio routing."
		},
		"chrome.launch": { label: "Launch Chrome" },
		"chrome.browserProfile": {
			label: "Chrome Profile",
			advanced: true
		},
		"chrome.guestName": {
			label: "Guest Name",
			help: "Used when Chrome lands on the signed-out Meet guest-name screen."
		},
		"chrome.reuseExistingTab": {
			label: "Reuse Existing Meet Tab",
			help: "Avoids opening duplicate tabs for the same Meet URL."
		},
		"chrome.autoJoin": {
			label: "Auto Join Guest Screen",
			help: "Best-effort guest-name fill and Join Now click through OpenClaw browser automation."
		},
		"chrome.waitForInCallMs": {
			label: "Wait For In-Call (ms)",
			help: "Waits for Chrome to report that the Meet tab is in-call before the realtime intro speaks.",
			advanced: true
		},
		"chrome.audioInputCommand": {
			label: "Audio Input Command",
			help: "Command that writes 8 kHz G.711 mu-law meeting audio to stdout.",
			advanced: true
		},
		"chrome.audioOutputCommand": {
			label: "Audio Output Command",
			help: "Command that reads 8 kHz G.711 mu-law assistant audio from stdin.",
			advanced: true
		},
		"chrome.audioBridgeCommand": {
			label: "Audio Bridge Command",
			advanced: true
		},
		"chrome.audioBridgeHealthCommand": {
			label: "Audio Bridge Health Command",
			advanced: true
		},
		"chromeNode.node": {
			label: "Chrome Node",
			help: "Node id/name/IP that owns Chrome, BlackHole, and SoX for chrome-node transport.",
			advanced: true
		},
		"twilio.defaultDialInNumber": {
			label: "Default Dial-In Number",
			placeholder: "+15551234567"
		},
		"twilio.defaultPin": {
			label: "Default PIN",
			advanced: true
		},
		"twilio.defaultDtmfSequence": {
			label: "Default DTMF Sequence",
			advanced: true
		},
		"voiceCall.enabled": { label: "Delegate To Voice Call" },
		"voiceCall.gatewayUrl": {
			label: "Voice Call Gateway URL",
			advanced: true
		},
		"voiceCall.token": {
			label: "Voice Call Gateway Token",
			sensitive: true,
			advanced: true
		},
		"voiceCall.requestTimeoutMs": {
			label: "Voice Call Request Timeout (ms)",
			advanced: true
		},
		"voiceCall.dtmfDelayMs": {
			label: "DTMF Delay (ms)",
			advanced: true
		},
		"voiceCall.introMessage": {
			label: "Voice Call Intro Message",
			advanced: true
		},
		"realtime.provider": {
			label: "Realtime Provider",
			help: "Defaults to OpenAI; uses OPENAI_API_KEY when no provider config is set."
		},
		"realtime.model": {
			label: "Realtime Model",
			advanced: true
		},
		"realtime.instructions": {
			label: "Realtime Instructions",
			advanced: true
		},
		"realtime.introMessage": {
			label: "Realtime Intro Message",
			help: "Spoken once when the realtime bridge is ready. Set to an empty string to join silently."
		},
		"realtime.toolPolicy": {
			label: "Realtime Tool Policy",
			help: "Safe read-only tools are available by default; owner requests can unlock broader tools.",
			advanced: true
		},
		"oauth.clientId": { label: "OAuth Client ID" },
		"oauth.clientSecret": {
			label: "OAuth Client Secret",
			sensitive: true
		},
		"oauth.refreshToken": {
			label: "OAuth Refresh Token",
			sensitive: true
		},
		"oauth.accessToken": {
			label: "Cached Access Token",
			sensitive: true,
			advanced: true
		},
		"oauth.expiresAt": {
			label: "Cached Access Token Expiry",
			help: "Unix epoch milliseconds used only for the cached access-token fast path.",
			advanced: true
		}
	}
};
const GoogleMeetToolSchema = Type.Object({
	action: Type.String({
		enum: [
			"join",
			"create",
			"status",
			"setup_status",
			"resolve_space",
			"preflight",
			"latest",
			"artifacts",
			"attendance",
			"recover_current_tab",
			"leave",
			"speak",
			"test_speech"
		],
		description: "Google Meet action to run. create creates and joins by default; pass join=false to only mint a URL. After a timeout or unclear browser state, call recover_current_tab before retrying join."
	}),
	join: Type.Optional(Type.Boolean({ description: "For action=create, set false to create the URL without joining." })),
	url: Type.Optional(Type.String({ description: "Explicit https://meet.google.com/... URL" })),
	transport: Type.Optional(Type.String({
		enum: [
			"chrome",
			"chrome-node",
			"twilio"
		],
		description: "Join transport"
	})),
	mode: Type.Optional(Type.String({
		enum: ["realtime", "transcribe"],
		description: "Join mode. realtime starts live listen/talk-back through the realtime voice model; transcribe joins without the realtime talk-back bridge."
	})),
	dialInNumber: Type.Optional(Type.String({ description: "Meet dial-in number for Twilio" })),
	pin: Type.Optional(Type.String({ description: "Meet phone PIN for Twilio" })),
	dtmfSequence: Type.Optional(Type.String({ description: "Explicit DTMF sequence for Twilio" })),
	sessionId: Type.Optional(Type.String({ description: "Meet session ID" })),
	message: Type.Optional(Type.String({ description: "Realtime instructions to speak now" })),
	meeting: Type.Optional(Type.String({ description: "Meet URL, meeting code, or spaces/{id}" })),
	conferenceRecord: Type.Optional(Type.String({ description: "Meet conferenceRecords/{id} resource name or id" })),
	pageSize: Type.Optional(Type.Number({ description: "Meet API page size for list actions" })),
	includeTranscriptEntries: Type.Optional(Type.Boolean({ description: "For artifacts, include structured transcript entries" })),
	includeAllConferenceRecords: Type.Optional(Type.Boolean({ description: "For artifacts or attendance with meeting input, fetch all conference records instead of only the latest." })),
	accessToken: Type.Optional(Type.String({ description: "Access token override" })),
	refreshToken: Type.Optional(Type.String({ description: "Refresh token override" })),
	clientId: Type.Optional(Type.String({ description: "OAuth client id override" })),
	clientSecret: Type.Optional(Type.String({ description: "OAuth client secret override" })),
	expiresAt: Type.Optional(Type.Number({ description: "Cached access token expiry ms" }))
});
function asParamRecord(params) {
	return params && typeof params === "object" && !Array.isArray(params) ? params : {};
}
function json(payload) {
	return {
		content: [{
			type: "text",
			text: JSON.stringify(payload, null, 2)
		}],
		details: payload
	};
}
function normalizeTransport(value) {
	return value === "chrome" || value === "chrome-node" || value === "twilio" ? value : void 0;
}
function normalizeMode(value) {
	return value === "realtime" || value === "transcribe" ? value : void 0;
}
function resolveMeetingInput(config, value) {
	const meeting = normalizeOptionalString$1(value) ?? config.defaults.meeting;
	if (!meeting) throw new Error("Meeting input is required");
	return meeting;
}
function resolveOptionalPositiveInteger(value) {
	if (value === void 0) return;
	const parsed = typeof value === "number" ? value : Number(normalizeOptionalString$1(value));
	if (!Number.isInteger(parsed) || parsed <= 0) throw new Error("Expected pageSize to be a positive integer");
	return parsed;
}
function shouldJoinCreatedMeet(raw) {
	return raw.join !== false && raw.join !== "false";
}
async function createMeetFromParams(params) {
	return (await import("../../create-cTpBHUOC.js")).createMeetFromParams(params);
}
async function createAndJoinMeetFromParams(params) {
	return (await import("../../create-cTpBHUOC.js")).createAndJoinMeetFromParams(params);
}
async function resolveGoogleMeetTokenFromParams(config, raw) {
	const { resolveGoogleMeetAccessToken } = await import("../../oauth-D1dIgZ3s.js");
	return resolveGoogleMeetAccessToken({
		clientId: normalizeOptionalString$1(raw.clientId) ?? config.oauth.clientId,
		clientSecret: normalizeOptionalString$1(raw.clientSecret) ?? config.oauth.clientSecret,
		refreshToken: normalizeOptionalString$1(raw.refreshToken) ?? config.oauth.refreshToken,
		accessToken: normalizeOptionalString$1(raw.accessToken) ?? config.oauth.accessToken,
		expiresAt: typeof raw.expiresAt === "number" ? raw.expiresAt : config.oauth.expiresAt
	});
}
async function resolveSpaceFromParams(config, raw) {
	const meeting = resolveMeetingInput(config, raw.meeting);
	const token = await resolveGoogleMeetTokenFromParams(config, raw);
	return {
		meeting,
		token,
		space: await fetchGoogleMeetSpace({
			accessToken: token.accessToken,
			meeting
		})
	};
}
async function resolveArtifactQueryFromParams(config, raw) {
	const meeting = normalizeOptionalString$1(raw.meeting) ?? config.defaults.meeting;
	const conferenceRecord = normalizeOptionalString$1(raw.conferenceRecord);
	if (!meeting && !conferenceRecord) throw new Error("Meeting input or conferenceRecord required");
	return {
		token: await resolveGoogleMeetTokenFromParams(config, raw),
		meeting,
		conferenceRecord,
		pageSize: resolveOptionalPositiveInteger(raw.pageSize),
		includeTranscriptEntries: raw.includeTranscriptEntries !== false,
		allConferenceRecords: raw.includeAllConferenceRecords === true
	};
}
var google_meet_default = definePluginEntry({
	id: "google-meet",
	name: "Google Meet",
	description: "Join Google Meet calls through Chrome or Twilio transports",
	configSchema: googleMeetConfigSchema,
	register(api) {
		const config = googleMeetConfigSchema.parse(api.pluginConfig);
		let runtime = null;
		const ensureRuntime = async () => {
			if (!config.enabled) throw new Error("Google Meet plugin disabled in plugin config");
			if (!runtime) runtime = new GoogleMeetRuntime({
				config,
				fullConfig: api.config,
				runtime: api.runtime,
				logger: api.logger
			});
			return runtime;
		};
		const formatGatewayError = (err) => isGoogleMeetBrowserManualActionError(err) ? err.payload : { error: formatErrorMessage(err) };
		const sendError = (respond, err) => {
			respond(false, formatGatewayError(err));
		};
		api.registerGatewayMethod("googlemeet.join", async ({ params, respond }) => {
			try {
				respond(true, await (await ensureRuntime()).join({
					url: resolveMeetingInput(config, params?.url),
					transport: normalizeTransport(params?.transport),
					mode: normalizeMode(params?.mode),
					dialInNumber: normalizeOptionalString$1(params?.dialInNumber),
					pin: normalizeOptionalString$1(params?.pin),
					dtmfSequence: normalizeOptionalString$1(params?.dtmfSequence),
					message: normalizeOptionalString$1(params?.message)
				}));
			} catch (err) {
				sendError(respond, err);
			}
		});
		api.registerGatewayMethod("googlemeet.create", async ({ params, respond }) => {
			try {
				const raw = asParamRecord(params);
				respond(true, shouldJoinCreatedMeet(raw) ? await createAndJoinMeetFromParams({
					config,
					runtime: api.runtime,
					raw,
					ensureRuntime
				}) : await createMeetFromParams({
					config,
					runtime: api.runtime,
					raw
				}));
			} catch (err) {
				sendError(respond, err);
			}
		});
		api.registerGatewayMethod("googlemeet.status", async ({ params, respond }) => {
			try {
				respond(true, (await ensureRuntime()).status(normalizeOptionalString$1(params?.sessionId)));
			} catch (err) {
				sendError(respond, err);
			}
		});
		api.registerGatewayMethod("googlemeet.recoverCurrentTab", async ({ params, respond }) => {
			try {
				respond(true, await (await ensureRuntime()).recoverCurrentTab({ url: normalizeOptionalString$1(params?.url) }));
			} catch (err) {
				sendError(respond, err);
			}
		});
		api.registerGatewayMethod("googlemeet.setup", async ({ respond }) => {
			try {
				respond(true, await (await ensureRuntime()).setupStatus());
			} catch (err) {
				sendError(respond, err);
			}
		});
		api.registerGatewayMethod("googlemeet.latest", async ({ params, respond }) => {
			try {
				const raw = asParamRecord(params);
				const meeting = resolveMeetingInput(config, raw.meeting);
				respond(true, await fetchLatestGoogleMeetConferenceRecord({
					accessToken: (await resolveGoogleMeetTokenFromParams(config, raw)).accessToken,
					meeting
				}));
			} catch (err) {
				sendError(respond, err);
			}
		});
		api.registerGatewayMethod("googlemeet.artifacts", async ({ params, respond }) => {
			try {
				const resolved = await resolveArtifactQueryFromParams(config, asParamRecord(params));
				respond(true, await fetchGoogleMeetArtifacts({
					accessToken: resolved.token.accessToken,
					meeting: resolved.meeting,
					conferenceRecord: resolved.conferenceRecord,
					pageSize: resolved.pageSize,
					includeTranscriptEntries: resolved.includeTranscriptEntries,
					allConferenceRecords: resolved.allConferenceRecords
				}));
			} catch (err) {
				sendError(respond, err);
			}
		});
		api.registerGatewayMethod("googlemeet.attendance", async ({ params, respond }) => {
			try {
				const resolved = await resolveArtifactQueryFromParams(config, asParamRecord(params));
				respond(true, await fetchGoogleMeetAttendance({
					accessToken: resolved.token.accessToken,
					meeting: resolved.meeting,
					conferenceRecord: resolved.conferenceRecord,
					pageSize: resolved.pageSize,
					allConferenceRecords: resolved.allConferenceRecords
				}));
			} catch (err) {
				sendError(respond, err);
			}
		});
		api.registerGatewayMethod("googlemeet.leave", async ({ params, respond }) => {
			try {
				const sessionId = normalizeOptionalString$1(params?.sessionId);
				if (!sessionId) {
					respond(false, { error: "sessionId required" });
					return;
				}
				respond(true, await (await ensureRuntime()).leave(sessionId));
			} catch (err) {
				sendError(respond, err);
			}
		});
		api.registerGatewayMethod("googlemeet.speak", async ({ params, respond }) => {
			try {
				const sessionId = normalizeOptionalString$1(params?.sessionId);
				if (!sessionId) {
					respond(false, { error: "sessionId required" });
					return;
				}
				respond(true, (await ensureRuntime()).speak(sessionId, normalizeOptionalString$1(params?.message)));
			} catch (err) {
				sendError(respond, err);
			}
		});
		api.registerGatewayMethod("googlemeet.testSpeech", async ({ params, respond }) => {
			try {
				respond(true, await (await ensureRuntime()).testSpeech({
					url: resolveMeetingInput(config, params?.url),
					transport: normalizeTransport(params?.transport),
					mode: normalizeMode(params?.mode),
					dialInNumber: normalizeOptionalString$1(params?.dialInNumber),
					pin: normalizeOptionalString$1(params?.pin),
					dtmfSequence: normalizeOptionalString$1(params?.dtmfSequence),
					message: normalizeOptionalString$1(params?.message)
				}));
			} catch (err) {
				sendError(respond, err);
			}
		});
		api.registerTool({
			name: "google_meet",
			label: "Google Meet",
			description: "Join and track Google Meet sessions through Chrome or Twilio. If a Meet tab is already open after a timeout, call recover_current_tab before retrying join to report login, permission, or admission blockers without opening another tab.",
			parameters: GoogleMeetToolSchema,
			async execute(_toolCallId, params) {
				const raw = asParamRecord(params);
				try {
					switch (raw.action) {
						case "join": return json(await (await ensureRuntime()).join({
							url: resolveMeetingInput(config, raw.url),
							transport: normalizeTransport(raw.transport),
							mode: normalizeMode(raw.mode),
							dialInNumber: normalizeOptionalString$1(raw.dialInNumber),
							pin: normalizeOptionalString$1(raw.pin),
							dtmfSequence: normalizeOptionalString$1(raw.dtmfSequence),
							message: normalizeOptionalString$1(raw.message)
						}));
						case "create": return json(shouldJoinCreatedMeet(raw) ? await createAndJoinMeetFromParams({
							config,
							runtime: api.runtime,
							raw,
							ensureRuntime
						}) : await createMeetFromParams({
							config,
							runtime: api.runtime,
							raw
						}));
						case "test_speech": return json(await (await ensureRuntime()).testSpeech({
							url: resolveMeetingInput(config, raw.url),
							transport: normalizeTransport(raw.transport),
							mode: normalizeMode(raw.mode),
							dialInNumber: normalizeOptionalString$1(raw.dialInNumber),
							pin: normalizeOptionalString$1(raw.pin),
							dtmfSequence: normalizeOptionalString$1(raw.dtmfSequence),
							message: normalizeOptionalString$1(raw.message)
						}));
						case "status": return json((await ensureRuntime()).status(normalizeOptionalString$1(raw.sessionId)));
						case "recover_current_tab": return json(await (await ensureRuntime()).recoverCurrentTab({ url: normalizeOptionalString$1(raw.url) }));
						case "setup_status": return json(await (await ensureRuntime()).setupStatus());
						case "resolve_space": {
							const { token: _token, ...result } = await resolveSpaceFromParams(config, raw);
							return json(result);
						}
						case "preflight": {
							const { meeting, token, space } = await resolveSpaceFromParams(config, raw);
							return json(buildGoogleMeetPreflightReport({
								input: meeting,
								space,
								previewAcknowledged: config.preview.enrollmentAcknowledged,
								tokenSource: token.refreshed ? "refresh-token" : "cached-access-token"
							}));
						}
						case "latest": {
							const meeting = resolveMeetingInput(config, raw.meeting);
							return json(await fetchLatestGoogleMeetConferenceRecord({
								accessToken: (await resolveGoogleMeetTokenFromParams(config, raw)).accessToken,
								meeting
							}));
						}
						case "artifacts": {
							const resolved = await resolveArtifactQueryFromParams(config, raw);
							return json(await fetchGoogleMeetArtifacts({
								accessToken: resolved.token.accessToken,
								meeting: resolved.meeting,
								conferenceRecord: resolved.conferenceRecord,
								pageSize: resolved.pageSize,
								includeTranscriptEntries: resolved.includeTranscriptEntries,
								allConferenceRecords: resolved.allConferenceRecords
							}));
						}
						case "attendance": {
							const resolved = await resolveArtifactQueryFromParams(config, raw);
							return json(await fetchGoogleMeetAttendance({
								accessToken: resolved.token.accessToken,
								meeting: resolved.meeting,
								conferenceRecord: resolved.conferenceRecord,
								pageSize: resolved.pageSize,
								allConferenceRecords: resolved.allConferenceRecords
							}));
						}
						case "leave": {
							const rt = await ensureRuntime();
							const sessionId = normalizeOptionalString$1(raw.sessionId);
							if (!sessionId) throw new Error("sessionId required");
							return json(await rt.leave(sessionId));
						}
						case "speak": {
							const rt = await ensureRuntime();
							const sessionId = normalizeOptionalString$1(raw.sessionId);
							if (!sessionId) throw new Error("sessionId required");
							return json(rt.speak(sessionId, normalizeOptionalString$1(raw.message)));
						}
						default: throw new Error("unknown google_meet action");
					}
				} catch (err) {
					return json(formatGatewayError(err));
				}
			}
		});
		api.registerNodeHostCommand({
			command: "googlemeet.chrome",
			cap: "google-meet",
			handle: handleGoogleMeetNodeHostCommand
		});
		api.registerCli(async ({ program }) => {
			const { registerGoogleMeetCli } = await import("../../cli-C4Pk4bcD.js");
			registerGoogleMeetCli({
				program,
				config,
				ensureRuntime
			});
		}, {
			commands: ["googlemeet"],
			descriptors: [{
				name: "googlemeet",
				description: "Join and manage Google Meet calls",
				hasSubcommands: true
			}]
		});
	}
});
//#endregion
export { google_meet_default as default };
