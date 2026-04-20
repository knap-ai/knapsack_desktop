import { t as formatMention } from "./mentions-BJtDuuvX.js";
import { n as formatDiscordUserTag } from "./format-XDPCvGK4.js";
import { i as normalizeDiscordSlug, p as resolveDiscordOwnerAccess } from "./allow-list-MMNtJoJ7.js";
import { t as getDiscordRuntime } from "./runtime-DT1yDtrK.js";
import { t as authorizeDiscordVoiceIngress } from "./access-CJk9VIIB.js";
import { createRequire } from "node:module";
import { normalizeOptionalString, stripInlineDirectiveTagsForDisplay } from "openclaw/plugin-sdk/text-runtime";
import { resolveAgentRoute } from "openclaw/plugin-sdk/routing";
import { ChannelType, ReadyListener } from "@buape/carbon";
import { createSubsystemLogger, logVerbose, shouldLogVerbose } from "openclaw/plugin-sdk/runtime-env";
import { randomUUID } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { resolvePreferredOpenClawTmpDir } from "openclaw/plugin-sdk/temp-path";
import { agentCommandFromIngress, getTtsProvider, resolveAgentDir, resolveTtsConfig, resolveTtsPrefsPath } from "openclaw/plugin-sdk/agent-runtime";
import { formatErrorMessage } from "openclaw/plugin-sdk/ssrf-runtime";
import { parseTtsDirectives } from "openclaw/plugin-sdk/speech";
//#region extensions/discord/src/voice/capture-state.ts
function createVoiceCaptureState() {
	return {
		activeSpeakers: /* @__PURE__ */ new Set(),
		activeCaptureStreams: /* @__PURE__ */ new Map(),
		captureFinalizeTimers: /* @__PURE__ */ new Map(),
		captureGenerations: /* @__PURE__ */ new Map()
	};
}
function stopVoiceCaptureState(state) {
	for (const { timer } of state.captureFinalizeTimers.values()) clearTimeout(timer);
	state.captureFinalizeTimers.clear();
	for (const { stream } of state.activeCaptureStreams.values()) stream.destroy();
	state.activeCaptureStreams.clear();
	state.captureGenerations.clear();
	state.activeSpeakers.clear();
}
function getActiveVoiceCapture(state, userId) {
	return state.activeCaptureStreams.get(userId);
}
function isVoiceCaptureActive(state, userId) {
	return state.activeSpeakers.has(userId);
}
function clearVoiceCaptureFinalizeTimer(state, userId, generation) {
	const scheduled = state.captureFinalizeTimers.get(userId);
	if (!scheduled || generation !== void 0 && scheduled.generation !== generation) return false;
	clearTimeout(scheduled.timer);
	state.captureFinalizeTimers.delete(userId);
	return true;
}
function beginVoiceCapture(state, userId, stream) {
	const generation = (state.captureGenerations.get(userId) ?? 0) + 1;
	state.captureGenerations.set(userId, generation);
	state.activeSpeakers.add(userId);
	state.activeCaptureStreams.set(userId, {
		generation,
		stream
	});
	clearVoiceCaptureFinalizeTimer(state, userId, generation);
	return generation;
}
function finishVoiceCapture(state, userId, generation) {
	clearVoiceCaptureFinalizeTimer(state, userId, generation);
	if (state.activeCaptureStreams.get(userId)?.generation !== generation) return false;
	state.activeCaptureStreams.delete(userId);
	state.activeSpeakers.delete(userId);
	return true;
}
function scheduleVoiceCaptureFinalize(params) {
	const { state, userId, delayMs, onFinalize } = params;
	const capture = state.activeCaptureStreams.get(userId);
	if (!capture) return false;
	clearVoiceCaptureFinalizeTimer(state, userId, capture.generation);
	const timer = setTimeout(() => {
		const activeCapture = state.activeCaptureStreams.get(userId);
		if (!activeCapture || activeCapture.generation !== capture.generation) return;
		state.captureFinalizeTimers.delete(userId);
		state.activeCaptureStreams.delete(userId);
		state.activeSpeakers.delete(userId);
		onFinalize?.(activeCapture);
		activeCapture.stream.destroy();
	}, delayMs);
	state.captureFinalizeTimers.set(userId, {
		generation: capture.generation,
		timer
	});
	return true;
}
//#endregion
//#region extensions/discord/src/voice/prompt.ts
function formatVoiceIngressPrompt(transcript, speakerLabel) {
	const cleanedTranscript = transcript.trim();
	const cleanedLabel = speakerLabel?.trim();
	if (!cleanedLabel) return cleanedTranscript;
	return [`Voice transcript from speaker "${cleanedLabel}":`, cleanedTranscript].join("\n");
}
//#endregion
//#region extensions/discord/src/voice/receive-recovery.ts
const DECRYPT_FAILURE_WINDOW_MS = 3e4;
const DECRYPT_FAILURE_RECONNECT_THRESHOLD = 3;
const DECRYPT_FAILURE_PATTERN = /DecryptionFailed\(/;
const DAVE_PASSTHROUGH_DISABLED_PATTERN = /UnencryptedWhenPassthroughDisabled/;
function createVoiceReceiveRecoveryState() {
	return {
		decryptFailureCount: 0,
		lastDecryptFailureAt: 0,
		decryptRecoveryInFlight: false
	};
}
function isAbortLikeReceiveError(err) {
	if (!err || typeof err !== "object") return false;
	const name = "name" in err && typeof err.name === "string" ? err.name : "";
	const message = "message" in err && typeof err.message === "string" ? err.message : "";
	return name === "AbortError" || message.includes("The operation was aborted") || message.includes("aborted");
}
function analyzeVoiceReceiveError(err) {
	const message = formatErrorMessage(err);
	const shouldAttemptPassthrough = DAVE_PASSTHROUGH_DISABLED_PATTERN.test(message);
	return {
		message,
		isAbortLike: isAbortLikeReceiveError(err),
		shouldAttemptPassthrough,
		countsAsDecryptFailure: DECRYPT_FAILURE_PATTERN.test(message) || shouldAttemptPassthrough
	};
}
function noteVoiceDecryptFailure(state, now = Date.now()) {
	if (now - state.lastDecryptFailureAt > DECRYPT_FAILURE_WINDOW_MS) state.decryptFailureCount = 0;
	state.lastDecryptFailureAt = now;
	state.decryptFailureCount += 1;
	const firstFailure = state.decryptFailureCount === 1;
	if (state.decryptFailureCount < DECRYPT_FAILURE_RECONNECT_THRESHOLD || state.decryptRecoveryInFlight) return {
		firstFailure,
		shouldRecover: false
	};
	state.decryptRecoveryInFlight = true;
	resetVoiceReceiveRecoveryState(state);
	return {
		firstFailure,
		shouldRecover: true
	};
}
function resetVoiceReceiveRecoveryState(state) {
	state.decryptFailureCount = 0;
	state.lastDecryptFailureAt = 0;
}
function finishVoiceDecryptRecovery(state) {
	state.decryptRecoveryInFlight = false;
}
function enableDaveReceivePassthrough(params) {
	const { target, sdk, reason, expirySeconds, onVerbose, onWarn } = params;
	const networkingState = target.connection.state.networking?.state;
	if (target.connection.state.status !== sdk.VoiceConnectionStatus.Ready || !networkingState || networkingState.code !== sdk.NetworkingStatusCode.Ready && networkingState.code !== sdk.NetworkingStatusCode.Resuming) return false;
	const daveSession = networkingState.dave?.session;
	if (!daveSession) return false;
	try {
		daveSession.setPassthroughMode(true, expirySeconds);
		onVerbose(`enabled DAVE receive passthrough: guild ${target.guildId} channel ${target.channelId} expiry=${expirySeconds}s reason=${reason}`);
		return true;
	} catch (err) {
		onWarn(`discord voice: failed to enable DAVE passthrough guild=${target.guildId} channel=${target.channelId} reason=${reason}: ${formatErrorMessage(err)}`);
		return false;
	}
}
//#endregion
//#region extensions/discord/src/voice/sanitize.ts
const SPEECH_EMOJI_RE = /(?:\p{Extended_Pictographic}(?:\uFE0F|\u200D|\p{Extended_Pictographic}|\p{Emoji_Modifier})*)+/gu;
function escapeRegExp(value) {
	return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function stripEmojiForSpeech(text) {
	return text.replace(SPEECH_EMOJI_RE, " ").replace(/\s+([?!.,:;])/g, "$1").replace(/[ \t]{2,}/g, " ").replace(/ *\n */g, "\n").trim();
}
function sanitizeVoiceReplyTextForSpeech(text, speakerLabel) {
	let cleaned = stripInlineDirectiveTagsForDisplay(text).text.trim();
	if (!cleaned) return "";
	const label = speakerLabel?.trim();
	if (label) {
		const prefix = new RegExp(`^${escapeRegExp(label)}\\s*:\\s*`, "i");
		cleaned = cleaned.replace(prefix, "").trim();
	}
	return stripEmojiForSpeech(cleaned);
}
//#endregion
//#region extensions/discord/src/voice/sdk-runtime.ts
let cachedDiscordVoiceSdk = null;
function loadDiscordVoiceSdk() {
	if (cachedDiscordVoiceSdk) return cachedDiscordVoiceSdk;
	cachedDiscordVoiceSdk = createRequire(import.meta.url)("@discordjs/voice");
	return cachedDiscordVoiceSdk;
}
//#endregion
//#region extensions/discord/src/voice/manager.ts
const require = createRequire(import.meta.url);
const SAMPLE_RATE = 48e3;
const CHANNELS = 2;
const BIT_DEPTH = 16;
const MIN_SEGMENT_SECONDS = .35;
const CAPTURE_FINALIZE_GRACE_MS = 1200;
const VOICE_CONNECT_READY_TIMEOUT_MS = 15e3;
const PLAYBACK_READY_TIMEOUT_MS = 6e4;
const SPEAKING_READY_TIMEOUT_MS = 6e4;
const SPEAKER_CONTEXT_CACHE_TTL_MS = 6e4;
const logger = createSubsystemLogger("discord/voice");
const logVoiceVerbose = (message) => {
	logVerbose(`discord voice: ${message}`);
};
function mergeTtsConfig(base, override) {
	if (!override) return base;
	const baseProviders = base.providers ?? {};
	const overrideProviders = override.providers ?? {};
	const mergedProviders = Object.fromEntries([...new Set([...Object.keys(baseProviders), ...Object.keys(overrideProviders)])].map((providerId) => {
		const baseProvider = baseProviders[providerId] ?? {};
		const overrideProvider = overrideProviders[providerId] ?? {};
		return [providerId, {
			...baseProvider,
			...overrideProvider
		}];
	}));
	return {
		...base,
		...override,
		modelOverrides: {
			...base.modelOverrides,
			...override.modelOverrides
		},
		...Object.keys(mergedProviders).length === 0 ? {} : { providers: mergedProviders }
	};
}
function resolveVoiceTtsConfig(params) {
	if (!params.override) return {
		cfg: params.cfg,
		resolved: resolveTtsConfig(params.cfg)
	};
	const merged = mergeTtsConfig(params.cfg.messages?.tts ?? {}, params.override);
	const messages = params.cfg.messages ?? {};
	const cfg = {
		...params.cfg,
		messages: {
			...messages,
			tts: merged
		}
	};
	return {
		cfg,
		resolved: resolveTtsConfig(cfg)
	};
}
function buildWavBuffer(pcm) {
	const blockAlign = CHANNELS * BIT_DEPTH / 8;
	const byteRate = SAMPLE_RATE * blockAlign;
	const header = Buffer.alloc(44);
	header.write("RIFF", 0);
	header.writeUInt32LE(36 + pcm.length, 4);
	header.write("WAVE", 8);
	header.write("fmt ", 12);
	header.writeUInt32LE(16, 16);
	header.writeUInt16LE(1, 20);
	header.writeUInt16LE(CHANNELS, 22);
	header.writeUInt32LE(SAMPLE_RATE, 24);
	header.writeUInt32LE(byteRate, 28);
	header.writeUInt16LE(blockAlign, 32);
	header.writeUInt16LE(BIT_DEPTH, 34);
	header.write("data", 36);
	header.writeUInt32LE(pcm.length, 40);
	return Buffer.concat([header, pcm]);
}
let warnedOpusMissing = false;
let cachedOpusDecoderFactory = "unresolved";
function resolveOpusDecoderFactory() {
	const factories = [{
		name: "@discordjs/opus",
		load: () => {
			return new (require("@discordjs/opus")).OpusEncoder(SAMPLE_RATE, CHANNELS);
		}
	}, {
		name: "opusscript",
		load: () => {
			const OpusScript = require("opusscript");
			return new OpusScript(SAMPLE_RATE, CHANNELS, OpusScript.Application.AUDIO);
		}
	}];
	const failures = [];
	for (const factory of factories) try {
		factory.load();
		return factory;
	} catch (err) {
		failures.push(`${factory.name}: ${formatErrorMessage(err)}`);
	}
	if (!warnedOpusMissing) {
		warnedOpusMissing = true;
		logger.warn(`discord voice: no usable opus decoder available (${failures.join("; ")}); cannot decode voice audio`);
	}
	return null;
}
function createOpusDecoder() {
	const factory = getOrCreateOpusDecoderFactory();
	if (!factory) return null;
	return {
		decoder: factory.load(),
		name: factory.name
	};
}
function getOrCreateOpusDecoderFactory() {
	if (cachedOpusDecoderFactory !== "unresolved") return cachedOpusDecoderFactory;
	cachedOpusDecoderFactory = resolveOpusDecoderFactory();
	return cachedOpusDecoderFactory;
}
async function decodeOpusStream(stream) {
	const selected = createOpusDecoder();
	if (!selected) return Buffer.alloc(0);
	logVoiceVerbose(`opus decoder: ${selected.name}`);
	const chunks = [];
	try {
		for await (const chunk of stream) {
			if (!chunk || !(chunk instanceof Buffer) || chunk.length === 0) continue;
			const decoded = selected.decoder.decode(chunk);
			if (decoded && decoded.length > 0) chunks.push(Buffer.from(decoded));
		}
	} catch (err) {
		if (shouldLogVerbose()) logVerbose(`discord voice: opus decode failed: ${formatErrorMessage(err)}`);
	}
	return chunks.length > 0 ? Buffer.concat(chunks) : Buffer.alloc(0);
}
function estimateDurationSeconds(pcm) {
	const bytesPerSample = BIT_DEPTH / 8 * CHANNELS;
	if (bytesPerSample <= 0) return 0;
	return pcm.length / (bytesPerSample * SAMPLE_RATE);
}
async function writeWavFile(pcm) {
	const tempDir = await fs.mkdtemp(path.join(resolvePreferredOpenClawTmpDir(), "discord-voice-"));
	const filePath = path.join(tempDir, `segment-${randomUUID()}.wav`);
	const wav = buildWavBuffer(pcm);
	await fs.writeFile(filePath, wav);
	scheduleTempCleanup(tempDir);
	return {
		path: filePath,
		durationSeconds: estimateDurationSeconds(pcm)
	};
}
function scheduleTempCleanup(tempDir, delayMs = 1800 * 1e3) {
	setTimeout(() => {
		fs.rm(tempDir, {
			recursive: true,
			force: true
		}).catch((err) => {
			if (shouldLogVerbose()) logVerbose(`discord voice: temp cleanup failed for ${tempDir}: ${formatErrorMessage(err)}`);
		});
	}, delayMs).unref();
}
async function transcribeAudio(params) {
	return normalizeOptionalString((await getDiscordRuntime().mediaUnderstanding.transcribeAudioFile({
		filePath: params.filePath,
		cfg: params.cfg,
		agentDir: resolveAgentDir(params.cfg, params.agentId),
		mime: "audio/wav"
	})).text);
}
var DiscordVoiceManager$1 = class {
	constructor(params) {
		this.params = params;
		this.sessions = /* @__PURE__ */ new Map();
		this.autoJoinTask = null;
		this.speakerContextCache = /* @__PURE__ */ new Map();
		this.botUserId = params.botUserId;
		this.voiceEnabled = params.discordConfig.voice?.enabled !== false;
		this.ownerAllowFrom = params.discordConfig.allowFrom ?? params.discordConfig.dm?.allowFrom ?? [];
	}
	setBotUserId(id) {
		if (id) this.botUserId = id;
	}
	isEnabled() {
		return this.voiceEnabled;
	}
	async autoJoin() {
		if (!this.voiceEnabled) return;
		if (this.autoJoinTask) return this.autoJoinTask;
		this.autoJoinTask = (async () => {
			const entries = this.params.discordConfig.voice?.autoJoin ?? [];
			logVoiceVerbose(`autoJoin: ${entries.length} entries`);
			const seenGuilds = /* @__PURE__ */ new Set();
			for (const entry of entries) {
				const guildId = entry.guildId.trim();
				if (!guildId) continue;
				if (seenGuilds.has(guildId)) {
					logger.warn(`discord voice: autoJoin has multiple entries for guild ${guildId}; skipping`);
					continue;
				}
				seenGuilds.add(guildId);
				logVoiceVerbose(`autoJoin: joining guild ${guildId} channel ${entry.channelId}`);
				await this.join({
					guildId: entry.guildId,
					channelId: entry.channelId
				});
			}
		})().finally(() => {
			this.autoJoinTask = null;
		});
		return this.autoJoinTask;
	}
	status() {
		return Array.from(this.sessions.values()).map((session) => ({
			ok: true,
			message: `connected: guild ${session.guildId} channel ${session.channelId}`,
			guildId: session.guildId,
			channelId: session.channelId
		}));
	}
	async join(params) {
		if (!this.voiceEnabled) return {
			ok: false,
			message: "Discord voice is disabled (channels.discord.voice.enabled)."
		};
		const guildId = params.guildId.trim();
		const channelId = params.channelId.trim();
		if (!guildId || !channelId) return {
			ok: false,
			message: "Missing guildId or channelId."
		};
		logVoiceVerbose(`join requested: guild ${guildId} channel ${channelId}`);
		const existing = this.sessions.get(guildId);
		if (existing && existing.channelId === channelId) {
			logVoiceVerbose(`join: already connected to guild ${guildId} channel ${channelId}`);
			return {
				ok: true,
				message: `Already connected to ${formatMention({ channelId })}.`,
				guildId,
				channelId
			};
		}
		if (existing) {
			logVoiceVerbose(`join: replacing existing session for guild ${guildId}`);
			await this.leave({ guildId });
		}
		const channelInfo = await this.params.client.fetchChannel(channelId).catch(() => null);
		if (!channelInfo || "type" in channelInfo && !isVoiceChannel(channelInfo.type)) return {
			ok: false,
			message: `Channel ${channelId} is not a voice channel.`
		};
		const channelGuildId = "guildId" in channelInfo ? channelInfo.guildId : void 0;
		if (channelGuildId && channelGuildId !== guildId) return {
			ok: false,
			message: "Voice channel is not in this guild."
		};
		const voicePlugin = this.params.client.getPlugin("voice");
		if (!voicePlugin) return {
			ok: false,
			message: "Discord voice plugin is not available."
		};
		const adapterCreator = voicePlugin.getGatewayAdapterCreator(guildId);
		const daveEncryption = this.params.discordConfig.voice?.daveEncryption;
		const decryptionFailureTolerance = this.params.discordConfig.voice?.decryptionFailureTolerance;
		logVoiceVerbose(`join: DAVE settings encryption=${daveEncryption === false ? "off" : "on"} tolerance=${decryptionFailureTolerance ?? "default"}`);
		const voiceSdk = loadDiscordVoiceSdk();
		const connection = voiceSdk.joinVoiceChannel({
			channelId,
			guildId,
			adapterCreator,
			selfDeaf: false,
			selfMute: false,
			daveEncryption,
			decryptionFailureTolerance
		});
		try {
			await voiceSdk.entersState(connection, voiceSdk.VoiceConnectionStatus.Ready, VOICE_CONNECT_READY_TIMEOUT_MS);
			logVoiceVerbose(`join: connected to guild ${guildId} channel ${channelId}`);
		} catch (err) {
			connection.destroy();
			return {
				ok: false,
				message: `Failed to join voice channel: ${formatErrorMessage(err)}`
			};
		}
		const sessionChannelId = channelInfo?.id ?? channelId;
		if (sessionChannelId !== channelId) logVoiceVerbose(`join: using session channel ${sessionChannelId} for voice channel ${channelId}`);
		const route = resolveAgentRoute({
			cfg: this.params.cfg,
			channel: "discord",
			accountId: this.params.accountId,
			guildId,
			peer: {
				kind: "channel",
				id: sessionChannelId
			}
		});
		const player = voiceSdk.createAudioPlayer();
		connection.subscribe(player);
		let speakingHandler;
		let speakingEndHandler;
		let disconnectedHandler;
		let destroyedHandler;
		let playerErrorHandler;
		const clearSessionIfCurrent = () => {
			if (this.sessions.get(guildId)?.connection === connection) this.sessions.delete(guildId);
		};
		const entry = {
			guildId,
			guildName: channelInfo && "guild" in channelInfo && channelInfo.guild && typeof channelInfo.guild.name === "string" ? channelInfo.guild.name : void 0,
			channelId,
			channelName: channelInfo && "name" in channelInfo && typeof channelInfo.name === "string" ? channelInfo.name : void 0,
			sessionChannelId,
			route,
			connection,
			player,
			playbackQueue: Promise.resolve(),
			processingQueue: Promise.resolve(),
			capture: createVoiceCaptureState(),
			receiveRecovery: createVoiceReceiveRecoveryState(),
			stop: () => {
				if (speakingHandler) connection.receiver.speaking.off("start", speakingHandler);
				if (speakingEndHandler) connection.receiver.speaking.off("end", speakingEndHandler);
				stopVoiceCaptureState(entry.capture);
				if (disconnectedHandler) connection.off(voiceSdk.VoiceConnectionStatus.Disconnected, disconnectedHandler);
				if (destroyedHandler) connection.off(voiceSdk.VoiceConnectionStatus.Destroyed, destroyedHandler);
				if (playerErrorHandler) player.off("error", playerErrorHandler);
				player.stop();
				connection.destroy();
			}
		};
		speakingHandler = (userId) => {
			this.handleSpeakingStart(entry, userId).catch((err) => {
				logger.warn(`discord voice: capture failed: ${formatErrorMessage(err)}`);
			});
		};
		speakingEndHandler = (userId) => {
			this.scheduleCaptureFinalize(entry, userId, "speaker end");
		};
		disconnectedHandler = async () => {
			try {
				await Promise.race([voiceSdk.entersState(connection, voiceSdk.VoiceConnectionStatus.Signalling, 5e3), voiceSdk.entersState(connection, voiceSdk.VoiceConnectionStatus.Connecting, 5e3)]);
			} catch {
				clearSessionIfCurrent();
				connection.destroy();
			}
		};
		destroyedHandler = () => {
			clearSessionIfCurrent();
		};
		playerErrorHandler = (err) => {
			logger.warn(`discord voice: playback error: ${formatErrorMessage(err)}`);
		};
		this.enableDaveReceivePassthrough(entry, "post-join warmup", 30);
		connection.receiver.speaking.on("start", speakingHandler);
		connection.receiver.speaking.on("end", speakingEndHandler);
		connection.on(voiceSdk.VoiceConnectionStatus.Disconnected, disconnectedHandler);
		connection.on(voiceSdk.VoiceConnectionStatus.Destroyed, destroyedHandler);
		player.on("error", playerErrorHandler);
		this.sessions.set(guildId, entry);
		return {
			ok: true,
			message: `Joined ${formatMention({ channelId })}.`,
			guildId,
			channelId
		};
	}
	async leave(params) {
		const guildId = params.guildId.trim();
		logVoiceVerbose(`leave requested: guild ${guildId} channel ${params.channelId ?? "current"}`);
		const entry = this.sessions.get(guildId);
		if (!entry) return {
			ok: false,
			message: "Not connected to a voice channel."
		};
		if (params.channelId && params.channelId !== entry.channelId) return {
			ok: false,
			message: "Not connected to that voice channel."
		};
		entry.stop();
		this.sessions.delete(guildId);
		logVoiceVerbose(`leave: disconnected from guild ${guildId} channel ${entry.channelId}`);
		return {
			ok: true,
			message: `Left ${formatMention({ channelId: entry.channelId })}.`,
			guildId,
			channelId: entry.channelId
		};
	}
	async destroy() {
		for (const entry of this.sessions.values()) entry.stop();
		this.sessions.clear();
	}
	enqueueProcessing(entry, task) {
		entry.processingQueue = entry.processingQueue.then(task).catch((err) => logger.warn(`discord voice: processing failed: ${formatErrorMessage(err)}`));
	}
	enqueuePlayback(entry, task) {
		entry.playbackQueue = entry.playbackQueue.then(task).catch((err) => logger.warn(`discord voice: playback failed: ${formatErrorMessage(err)}`));
	}
	clearCaptureFinalizeTimer(entry, userId, generation) {
		return clearVoiceCaptureFinalizeTimer(entry.capture, userId, generation);
	}
	scheduleCaptureFinalize(entry, userId, reason) {
		scheduleVoiceCaptureFinalize({
			state: entry.capture,
			userId,
			delayMs: CAPTURE_FINALIZE_GRACE_MS,
			onFinalize: () => {
				logVoiceVerbose(`capture finalize: guild ${entry.guildId} channel ${entry.channelId} user ${userId} reason=${reason} grace=${CAPTURE_FINALIZE_GRACE_MS}ms`);
			}
		});
	}
	async handleSpeakingStart(entry, userId) {
		if (!userId) return;
		if (this.botUserId && userId === this.botUserId) return;
		if (isVoiceCaptureActive(entry.capture, userId)) {
			const activeCapture = getActiveVoiceCapture(entry.capture, userId);
			const extended = activeCapture ? this.clearCaptureFinalizeTimer(entry, userId, activeCapture.generation) : false;
			logVoiceVerbose(`capture start ignored (already active): guild ${entry.guildId} channel ${entry.channelId} user ${userId}${extended ? " (finalize canceled)" : ""}`);
			return;
		}
		logVoiceVerbose(`capture start: guild ${entry.guildId} channel ${entry.channelId} user ${userId}`);
		const voiceSdk = loadDiscordVoiceSdk();
		this.enableDaveReceivePassthrough(entry, `speaker ${userId} start`, 15);
		if (entry.player.state.status === voiceSdk.AudioPlayerStatus.Playing) entry.player.stop(true);
		const stream = entry.connection.receiver.subscribe(userId, { end: { behavior: voiceSdk.EndBehaviorType.Manual } });
		const generation = beginVoiceCapture(entry.capture, userId, stream);
		let streamAborted = false;
		stream.on("error", (err) => {
			streamAborted = analyzeVoiceReceiveError(err).isAbortLike;
			this.handleReceiveError(entry, err);
		});
		try {
			const pcm = await decodeOpusStream(stream);
			if (pcm.length === 0) {
				logVoiceVerbose(`capture empty: guild ${entry.guildId} channel ${entry.channelId} user ${userId}`);
				return;
			}
			this.resetDecryptFailureState(entry);
			const { path: wavPath, durationSeconds } = await writeWavFile(pcm);
			if (durationSeconds < (streamAborted ? .2 : MIN_SEGMENT_SECONDS)) {
				logVoiceVerbose(`capture too short (${durationSeconds.toFixed(2)}s): guild ${entry.guildId} channel ${entry.channelId} user ${userId}`);
				return;
			}
			logVoiceVerbose(`capture ready (${durationSeconds.toFixed(2)}s): guild ${entry.guildId} channel ${entry.channelId} user ${userId}`);
			this.enqueueProcessing(entry, async () => {
				await this.processSegment({
					entry,
					wavPath,
					userId,
					durationSeconds
				});
			});
		} finally {
			finishVoiceCapture(entry.capture, userId, generation);
		}
	}
	async processSegment(params) {
		const { entry, wavPath, userId, durationSeconds } = params;
		logVoiceVerbose(`segment processing (${durationSeconds.toFixed(2)}s): guild ${entry.guildId} channel ${entry.channelId}`);
		if (!entry.guildName) {
			const guild = await this.params.client.fetchGuild(entry.guildId).catch(() => null);
			if (guild && typeof guild.name === "string" && guild.name.trim()) entry.guildName = guild.name;
		}
		const speaker = await this.resolveSpeakerContext(entry.guildId, userId);
		const speakerIdentity = await this.resolveSpeakerIdentity(entry.guildId, userId);
		const access = await authorizeDiscordVoiceIngress({
			cfg: this.params.cfg,
			discordConfig: this.params.discordConfig,
			guildName: entry.guildName,
			guildId: entry.guildId,
			channelId: entry.channelId,
			channelName: entry.channelName,
			channelSlug: entry.channelName ? normalizeDiscordSlug(entry.channelName) : "",
			channelLabel: formatMention({ channelId: entry.channelId }),
			memberRoleIds: speakerIdentity.memberRoleIds,
			sender: {
				id: speakerIdentity.id,
				name: speakerIdentity.name,
				tag: speakerIdentity.tag
			}
		});
		if (!access.ok) {
			logVoiceVerbose(`segment unauthorized: guild ${entry.guildId} channel ${entry.channelId} user ${userId} reason=${access.message}`);
			return;
		}
		const transcript = await transcribeAudio({
			cfg: this.params.cfg,
			agentId: entry.route.agentId,
			filePath: wavPath
		});
		if (!transcript) {
			logVoiceVerbose(`transcription empty: guild ${entry.guildId} channel ${entry.channelId} user ${userId}`);
			return;
		}
		logVoiceVerbose(`transcription ok (${transcript.length} chars): guild ${entry.guildId} channel ${entry.channelId}`);
		const replyText = ((await agentCommandFromIngress({
			message: formatVoiceIngressPrompt(transcript, speaker.label),
			sessionKey: entry.route.sessionKey,
			agentId: entry.route.agentId,
			messageChannel: "discord",
			senderIsOwner: speaker.senderIsOwner,
			allowModelOverride: false,
			deliver: false
		}, this.params.runtime)).payloads ?? []).map((payload) => payload.text).filter((text) => typeof text === "string" && text.trim()).join("\n").trim();
		if (!replyText) {
			logVoiceVerbose(`reply empty: guild ${entry.guildId} channel ${entry.channelId} user ${userId}`);
			return;
		}
		logVoiceVerbose(`reply ok (${replyText.length} chars): guild ${entry.guildId} channel ${entry.channelId}`);
		const { cfg: ttsCfg, resolved: ttsConfig } = resolveVoiceTtsConfig({
			cfg: this.params.cfg,
			override: this.params.discordConfig.voice?.tts
		});
		const directive = parseTtsDirectives(replyText, ttsConfig.modelOverrides, {
			cfg: ttsCfg,
			providerConfigs: ttsConfig.providerConfigs,
			preferredProviderId: getTtsProvider(ttsConfig, resolveTtsPrefsPath(ttsConfig))
		});
		const speakText = sanitizeVoiceReplyTextForSpeech(directive.overrides.ttsText ?? directive.cleanedText.trim(), speaker.label);
		if (!speakText) {
			logVoiceVerbose(`tts skipped (empty): guild ${entry.guildId} channel ${entry.channelId} user ${userId}`);
			return;
		}
		const ttsResult = await getDiscordRuntime().tts.textToSpeech({
			text: speakText,
			cfg: ttsCfg,
			channel: "discord",
			overrides: directive.overrides
		});
		if (!ttsResult.success || !ttsResult.audioPath) {
			logger.warn(`discord voice: TTS failed: ${ttsResult.error ?? "unknown error"}`);
			return;
		}
		const audioPath = ttsResult.audioPath;
		logVoiceVerbose(`tts ok (${speakText.length} chars): guild ${entry.guildId} channel ${entry.channelId}`);
		this.enqueuePlayback(entry, async () => {
			logVoiceVerbose(`playback start: guild ${entry.guildId} channel ${entry.channelId} file ${path.basename(audioPath)}`);
			const voiceSdk = loadDiscordVoiceSdk();
			const resource = voiceSdk.createAudioResource(audioPath);
			entry.player.play(resource);
			await voiceSdk.entersState(entry.player, voiceSdk.AudioPlayerStatus.Playing, PLAYBACK_READY_TIMEOUT_MS).catch(() => void 0);
			await voiceSdk.entersState(entry.player, voiceSdk.AudioPlayerStatus.Idle, SPEAKING_READY_TIMEOUT_MS).catch(() => void 0);
			logVoiceVerbose(`playback done: guild ${entry.guildId} channel ${entry.channelId}`);
		});
	}
	handleReceiveError(entry, err) {
		const analysis = analyzeVoiceReceiveError(err);
		logger.warn(`discord voice: receive error: ${analysis.message}`);
		if (analysis.shouldAttemptPassthrough) this.enableDaveReceivePassthrough(entry, "receive decrypt error", 15);
		if (!analysis.countsAsDecryptFailure) return;
		const decryptFailure = noteVoiceDecryptFailure(entry.receiveRecovery);
		if (decryptFailure.firstFailure) logger.warn("discord voice: DAVE decrypt failures detected; voice receive may be unstable (upstream: discordjs/discord.js#11419)");
		if (!decryptFailure.shouldRecover) return;
		this.recoverFromDecryptFailures(entry).catch((recoverErr) => logger.warn(`discord voice: decrypt recovery failed: ${formatErrorMessage(recoverErr)}`)).finally(() => {
			finishVoiceDecryptRecovery(entry.receiveRecovery);
		});
	}
	enableDaveReceivePassthrough(entry, reason, expirySeconds) {
		const voiceSdk = loadDiscordVoiceSdk();
		return enableDaveReceivePassthrough({
			target: {
				guildId: entry.guildId,
				channelId: entry.channelId,
				connection: entry.connection
			},
			sdk: {
				VoiceConnectionStatus: { Ready: voiceSdk.VoiceConnectionStatus.Ready },
				NetworkingStatusCode: {
					Ready: voiceSdk.NetworkingStatusCode.Ready,
					Resuming: voiceSdk.NetworkingStatusCode.Resuming
				}
			},
			reason,
			expirySeconds,
			onVerbose: logVoiceVerbose,
			onWarn: (message) => logger.warn(message)
		});
	}
	resetDecryptFailureState(entry) {
		resetVoiceReceiveRecoveryState(entry.receiveRecovery);
	}
	async recoverFromDecryptFailures(entry) {
		const active = this.sessions.get(entry.guildId);
		if (!active || active.connection !== entry.connection) return;
		logger.warn(`discord voice: repeated decrypt failures; attempting rejoin for guild ${entry.guildId} channel ${entry.channelId}`);
		const leaveResult = await this.leave({ guildId: entry.guildId });
		if (!leaveResult.ok) {
			logger.warn(`discord voice: decrypt recovery leave failed: ${leaveResult.message}`);
			return;
		}
		const result = await this.join({
			guildId: entry.guildId,
			channelId: entry.channelId
		});
		if (!result.ok) logger.warn(`discord voice: rejoin after decrypt failures failed: ${result.message}`);
	}
	resolveSpeakerIsOwner(params) {
		return resolveDiscordOwnerAccess({
			allowFrom: this.ownerAllowFrom,
			sender: {
				id: params.id,
				name: params.name,
				tag: params.tag
			},
			allowNameMatching: false
		}).ownerAllowed;
	}
	resolveSpeakerContextCacheKey(guildId, userId) {
		return `${guildId}:${userId}`;
	}
	getCachedSpeakerContext(guildId, userId) {
		const key = this.resolveSpeakerContextCacheKey(guildId, userId);
		const cached = this.speakerContextCache.get(key);
		if (!cached) return;
		if (cached.expiresAt <= Date.now()) {
			this.speakerContextCache.delete(key);
			return;
		}
		return {
			id: cached.id,
			label: cached.label,
			name: cached.name,
			tag: cached.tag,
			senderIsOwner: cached.senderIsOwner
		};
	}
	setCachedSpeakerContext(guildId, userId, context) {
		const key = this.resolveSpeakerContextCacheKey(guildId, userId);
		this.speakerContextCache.set(key, {
			id: context.id,
			label: context.label,
			name: context.name,
			tag: context.tag,
			senderIsOwner: context.senderIsOwner,
			expiresAt: Date.now() + SPEAKER_CONTEXT_CACHE_TTL_MS
		});
	}
	async resolveSpeakerContext(guildId, userId) {
		const cached = this.getCachedSpeakerContext(guildId, userId);
		if (cached) return cached;
		const identity = await this.resolveSpeakerIdentity(guildId, userId);
		const context = {
			id: identity.id,
			label: identity.label,
			name: identity.name,
			tag: identity.tag,
			senderIsOwner: this.resolveSpeakerIsOwner({
				id: identity.id,
				name: identity.name,
				tag: identity.tag
			})
		};
		this.setCachedSpeakerContext(guildId, userId, context);
		return context;
	}
	async resolveSpeakerIdentity(guildId, userId) {
		try {
			const member = await this.params.client.fetchMember(guildId, userId);
			const username = member.user?.username ?? void 0;
			return {
				id: userId,
				label: member.nickname ?? member.user?.globalName ?? username ?? userId,
				name: username,
				tag: member.user ? formatDiscordUserTag(member.user) : void 0,
				memberRoleIds: Array.isArray(member.roles) ? member.roles.map((role) => typeof role === "string" ? role : typeof role?.id === "string" ? role.id : "").filter(Boolean) : []
			};
		} catch {
			try {
				const user = await this.params.client.fetchUser(userId);
				const username = user.username ?? void 0;
				return {
					id: userId,
					label: user.globalName ?? username ?? userId,
					name: username,
					tag: formatDiscordUserTag(user),
					memberRoleIds: []
				};
			} catch {
				return {
					id: userId,
					label: userId,
					memberRoleIds: []
				};
			}
		}
	}
};
var DiscordVoiceReadyListener$1 = class extends ReadyListener {
	constructor(manager) {
		super();
		this.manager = manager;
	}
	async handle(_data, _client) {
		this.manager.autoJoin().catch((err) => logger.warn(`discord voice: autoJoin failed: ${formatErrorMessage(err)}`));
	}
};
function isVoiceChannel(type) {
	return type === ChannelType.GuildVoice || type === ChannelType.GuildStageVoice;
}
//#endregion
//#region extensions/discord/src/voice/manager.runtime.ts
var DiscordVoiceManager = class extends DiscordVoiceManager$1 {};
var DiscordVoiceReadyListener = class extends DiscordVoiceReadyListener$1 {};
//#endregion
export { DiscordVoiceManager, DiscordVoiceReadyListener };
