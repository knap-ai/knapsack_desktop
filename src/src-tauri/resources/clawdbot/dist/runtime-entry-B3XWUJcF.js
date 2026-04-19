import { i as formatErrorMessage } from "./errors-D8p6rxH8.js";
import { s as normalizeOptionalString } from "./string-coerce-BUSzWgUA.js";
import "./text-runtime-DTMxvodz.js";
import "./error-runtime-CgBDklBz.js";
import { a as isRequestBodyLimitError, c as requestBodyErrorToText, s as readRequestBodyWithLimit } from "./http-body-CmkD5yuo.js";
import { a as createWebhookInFlightLimiter, t as WEBHOOK_BODY_READ_DEFAULTS } from "./webhook-request-guards-Df6jC-7E.js";
import "./webhook-ingress-KrGlV9-3.js";
import { t as zod_exports } from "./zod-BUbl8seT.js";
import "./api-Bp0lE5j9.js";
import { a as deepMergeDefined, i as validateProviderConfig, n as normalizeVoiceCallConfig, r as resolveVoiceCallConfig } from "./config-u-yK0fdI.js";
import { n as mapVoiceToPolly, t as escapeXml } from "./voice-mapping-BdFOh49T.js";
import { a as convertPcmToMulaw8k, t as isProviderStatusTerminal } from "./call-status-CPClb3Yb.js";
import { t as getHeader } from "./http-headers-B6UQ3-vJ.js";
import { URL as URL$1 } from "node:url";
import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import os from "node:os";
import fs$1 from "node:fs/promises";
import crypto from "node:crypto";
import { WebSocket as WebSocket$1, WebSocketServer } from "ws";
import http from "node:http";
//#region extensions/voice-call/src/allowlist.ts
function normalizePhoneNumber(input) {
	if (!input) return "";
	return input.replace(/\D/g, "");
}
function isAllowlistedCaller(normalizedFrom, allowFrom) {
	if (!normalizedFrom) return false;
	return (allowFrom ?? []).some((num) => {
		const normalizedAllow = normalizePhoneNumber(num);
		return normalizedAllow !== "" && normalizedAllow === normalizedFrom;
	});
}
//#endregion
//#region extensions/voice-call/src/types.ts
const ProviderNameSchema = zod_exports.z.enum([
	"telnyx",
	"twilio",
	"plivo",
	"mock"
]);
const CallStateSchema = zod_exports.z.enum([
	"initiated",
	"ringing",
	"answered",
	"active",
	"speaking",
	"listening",
	"completed",
	"hangup-user",
	"hangup-bot",
	"timeout",
	"error",
	"failed",
	"no-answer",
	"busy",
	"voicemail"
]);
const TerminalStates = new Set([
	"completed",
	"hangup-user",
	"hangup-bot",
	"timeout",
	"error",
	"failed",
	"no-answer",
	"busy",
	"voicemail"
]);
const EndReasonSchema = zod_exports.z.enum([
	"completed",
	"hangup-user",
	"hangup-bot",
	"timeout",
	"error",
	"failed",
	"no-answer",
	"busy",
	"voicemail"
]);
const BaseEventSchema = zod_exports.z.object({
	id: zod_exports.z.string(),
	dedupeKey: zod_exports.z.string().optional(),
	callId: zod_exports.z.string(),
	providerCallId: zod_exports.z.string().optional(),
	timestamp: zod_exports.z.number(),
	turnToken: zod_exports.z.string().optional(),
	direction: zod_exports.z.enum(["inbound", "outbound"]).optional(),
	from: zod_exports.z.string().optional(),
	to: zod_exports.z.string().optional()
});
zod_exports.z.discriminatedUnion("type", [
	BaseEventSchema.extend({ type: zod_exports.z.literal("call.initiated") }),
	BaseEventSchema.extend({ type: zod_exports.z.literal("call.ringing") }),
	BaseEventSchema.extend({ type: zod_exports.z.literal("call.answered") }),
	BaseEventSchema.extend({ type: zod_exports.z.literal("call.active") }),
	BaseEventSchema.extend({
		type: zod_exports.z.literal("call.speaking"),
		text: zod_exports.z.string()
	}),
	BaseEventSchema.extend({
		type: zod_exports.z.literal("call.speech"),
		transcript: zod_exports.z.string(),
		isFinal: zod_exports.z.boolean(),
		confidence: zod_exports.z.number().min(0).max(1).optional()
	}),
	BaseEventSchema.extend({
		type: zod_exports.z.literal("call.silence"),
		durationMs: zod_exports.z.number()
	}),
	BaseEventSchema.extend({
		type: zod_exports.z.literal("call.dtmf"),
		digits: zod_exports.z.string()
	}),
	BaseEventSchema.extend({
		type: zod_exports.z.literal("call.ended"),
		reason: EndReasonSchema
	}),
	BaseEventSchema.extend({
		type: zod_exports.z.literal("call.error"),
		error: zod_exports.z.string(),
		retryable: zod_exports.z.boolean().optional()
	})
]);
const CallDirectionSchema = zod_exports.z.enum(["outbound", "inbound"]);
const TranscriptEntrySchema = zod_exports.z.object({
	timestamp: zod_exports.z.number(),
	speaker: zod_exports.z.enum(["bot", "user"]),
	text: zod_exports.z.string(),
	isFinal: zod_exports.z.boolean().default(true)
});
const CallRecordSchema = zod_exports.z.object({
	callId: zod_exports.z.string(),
	providerCallId: zod_exports.z.string().optional(),
	provider: ProviderNameSchema,
	direction: CallDirectionSchema,
	state: CallStateSchema,
	from: zod_exports.z.string(),
	to: zod_exports.z.string(),
	sessionKey: zod_exports.z.string().optional(),
	startedAt: zod_exports.z.number(),
	answeredAt: zod_exports.z.number().optional(),
	endedAt: zod_exports.z.number().optional(),
	endReason: EndReasonSchema.optional(),
	transcript: zod_exports.z.array(TranscriptEntrySchema).default([]),
	processedEventIds: zod_exports.z.array(zod_exports.z.string()).default([]),
	metadata: zod_exports.z.record(zod_exports.z.string(), zod_exports.z.unknown()).optional()
});
//#endregion
//#region extensions/voice-call/src/manager/state.ts
const ConversationStates = new Set(["speaking", "listening"]);
const StateOrder = [
	"initiated",
	"ringing",
	"answered",
	"active",
	"speaking",
	"listening"
];
function transitionState(call, newState) {
	if (call.state === newState || TerminalStates.has(call.state)) return;
	if (TerminalStates.has(newState)) {
		call.state = newState;
		return;
	}
	if (ConversationStates.has(call.state) && ConversationStates.has(newState)) {
		call.state = newState;
		return;
	}
	const currentIndex = StateOrder.indexOf(call.state);
	if (StateOrder.indexOf(newState) > currentIndex) call.state = newState;
}
function addTranscriptEntry(call, speaker, text) {
	const entry = {
		timestamp: Date.now(),
		speaker,
		text,
		isFinal: true
	};
	call.transcript.push(entry);
}
//#endregion
//#region extensions/voice-call/src/manager/store.ts
function persistCallRecord(storePath, call) {
	const logPath = path.join(storePath, "calls.jsonl");
	const line = `${JSON.stringify(call)}\n`;
	fs$1.appendFile(logPath, line).catch((err) => {
		console.error("[voice-call] Failed to persist call record:", err);
	});
}
function loadActiveCallsFromStore(storePath) {
	const logPath = path.join(storePath, "calls.jsonl");
	if (!fs.existsSync(logPath)) return {
		activeCalls: /* @__PURE__ */ new Map(),
		providerCallIdMap: /* @__PURE__ */ new Map(),
		processedEventIds: /* @__PURE__ */ new Set(),
		rejectedProviderCallIds: /* @__PURE__ */ new Set()
	};
	const lines = fs.readFileSync(logPath, "utf-8").split("\n");
	const callMap = /* @__PURE__ */ new Map();
	for (const line of lines) {
		if (!line.trim()) continue;
		try {
			const call = CallRecordSchema.parse(JSON.parse(line));
			callMap.set(call.callId, call);
		} catch {}
	}
	const activeCalls = /* @__PURE__ */ new Map();
	const providerCallIdMap = /* @__PURE__ */ new Map();
	const processedEventIds = /* @__PURE__ */ new Set();
	const rejectedProviderCallIds = /* @__PURE__ */ new Set();
	for (const [callId, call] of callMap) {
		for (const eventId of call.processedEventIds) processedEventIds.add(eventId);
		if (TerminalStates.has(call.state)) continue;
		activeCalls.set(callId, call);
		if (call.providerCallId) providerCallIdMap.set(call.providerCallId, callId);
	}
	return {
		activeCalls,
		providerCallIdMap,
		processedEventIds,
		rejectedProviderCallIds
	};
}
async function getCallHistoryFromStore(storePath, limit = 50) {
	const logPath = path.join(storePath, "calls.jsonl");
	try {
		await fs$1.access(logPath);
	} catch {
		return [];
	}
	const lines = (await fs$1.readFile(logPath, "utf-8")).trim().split("\n").filter(Boolean);
	const calls = [];
	for (const line of lines.slice(-limit)) try {
		const parsed = CallRecordSchema.parse(JSON.parse(line));
		calls.push(parsed);
	} catch {}
	return calls;
}
//#endregion
//#region extensions/voice-call/src/manager/timers.ts
function clearMaxDurationTimer(ctx, callId) {
	const timer = ctx.maxDurationTimers.get(callId);
	if (timer) {
		clearTimeout(timer);
		ctx.maxDurationTimers.delete(callId);
	}
}
function startMaxDurationTimer(params) {
	clearMaxDurationTimer(params.ctx, params.callId);
	const maxDurationMs = params.ctx.config.maxDurationSeconds * 1e3;
	console.log(`[voice-call] Starting max duration timer (${params.ctx.config.maxDurationSeconds}s) for call ${params.callId}`);
	const timer = setTimeout(async () => {
		params.ctx.maxDurationTimers.delete(params.callId);
		const call = params.ctx.activeCalls.get(params.callId);
		if (call && !TerminalStates.has(call.state)) {
			console.log(`[voice-call] Max duration reached (${params.ctx.config.maxDurationSeconds}s), ending call ${params.callId}`);
			call.endReason = "timeout";
			persistCallRecord(params.ctx.storePath, call);
			await params.onTimeout(params.callId);
		}
	}, maxDurationMs);
	params.ctx.maxDurationTimers.set(params.callId, timer);
}
function clearTranscriptWaiter(ctx, callId) {
	const waiter = ctx.transcriptWaiters.get(callId);
	if (!waiter) return;
	clearTimeout(waiter.timeout);
	ctx.transcriptWaiters.delete(callId);
}
function rejectTranscriptWaiter(ctx, callId, reason) {
	const waiter = ctx.transcriptWaiters.get(callId);
	if (!waiter) return;
	clearTranscriptWaiter(ctx, callId);
	waiter.reject(new Error(reason));
}
function resolveTranscriptWaiter(ctx, callId, transcript, turnToken) {
	const waiter = ctx.transcriptWaiters.get(callId);
	if (!waiter) return false;
	if (waiter.turnToken && waiter.turnToken !== turnToken) return false;
	clearTranscriptWaiter(ctx, callId);
	waiter.resolve(transcript);
	return true;
}
function waitForFinalTranscript(ctx, callId, turnToken) {
	if (ctx.transcriptWaiters.has(callId)) return Promise.reject(/* @__PURE__ */ new Error("Already waiting for transcript"));
	const timeoutMs = ctx.config.transcriptTimeoutMs;
	return new Promise((resolve, reject) => {
		const timeout = setTimeout(() => {
			ctx.transcriptWaiters.delete(callId);
			reject(/* @__PURE__ */ new Error(`Timed out waiting for transcript after ${timeoutMs}ms`));
		}, timeoutMs);
		ctx.transcriptWaiters.set(callId, {
			resolve,
			reject,
			timeout,
			turnToken
		});
	});
}
//#endregion
//#region extensions/voice-call/src/manager/lifecycle.ts
function removeProviderCallMapping(providerCallIdMap, call) {
	if (!call.providerCallId) return;
	if (providerCallIdMap.get(call.providerCallId) === call.callId) providerCallIdMap.delete(call.providerCallId);
}
function finalizeCall(params) {
	const { ctx, call, endReason } = params;
	call.endedAt = params.endedAt ?? Date.now();
	call.endReason = endReason;
	transitionState(call, endReason);
	persistCallRecord(ctx.storePath, call);
	if (ctx.maxDurationTimers) clearMaxDurationTimer({ maxDurationTimers: ctx.maxDurationTimers }, call.callId);
	if (ctx.transcriptWaiters) rejectTranscriptWaiter({ transcriptWaiters: ctx.transcriptWaiters }, call.callId, params.transcriptRejectReason ?? `Call ended: ${endReason}`);
	ctx.activeCalls.delete(call.callId);
	removeProviderCallMapping(ctx.providerCallIdMap, call);
}
//#endregion
//#region extensions/voice-call/src/manager/lookup.ts
function getCallByProviderCallId(params) {
	const callId = params.providerCallIdMap.get(params.providerCallId);
	if (callId) return params.activeCalls.get(callId);
	for (const call of params.activeCalls.values()) if (call.providerCallId === params.providerCallId) return call;
}
function findCall(params) {
	const directCall = params.activeCalls.get(params.callIdOrProviderCallId);
	if (directCall) return directCall;
	return getCallByProviderCallId({
		activeCalls: params.activeCalls,
		providerCallIdMap: params.providerCallIdMap,
		providerCallId: params.callIdOrProviderCallId
	});
}
//#endregion
//#region extensions/voice-call/src/tts-provider-voice.ts
function resolveProviderVoiceSetting(providerConfig) {
	if (!providerConfig || typeof providerConfig !== "object") return;
	const candidate = providerConfig;
	return normalizeOptionalString(candidate.voice) ?? normalizeOptionalString(candidate.voiceId);
}
function resolvePreferredTtsVoice(config) {
	const providerId = config.tts?.provider;
	if (!providerId) return;
	return resolveProviderVoiceSetting(config.tts?.providers?.[providerId]);
}
//#endregion
//#region extensions/voice-call/src/manager/twiml.ts
function generateNotifyTwiml(message, voice) {
	return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="${voice}">${escapeXml(message)}</Say>
  <Hangup/>
</Response>`;
}
//#endregion
//#region extensions/voice-call/src/manager/outbound.ts
function lookupConnectedCall(ctx, callId) {
	const call = ctx.activeCalls.get(callId);
	if (!call) return {
		kind: "error",
		error: "Call not found"
	};
	if (!ctx.provider || !call.providerCallId) return {
		kind: "error",
		error: "Call not connected"
	};
	if (TerminalStates.has(call.state)) return {
		kind: "ended",
		call
	};
	return {
		kind: "ok",
		call,
		providerCallId: call.providerCallId,
		provider: ctx.provider
	};
}
function requireConnectedCall(ctx, callId) {
	const lookup = lookupConnectedCall(ctx, callId);
	if (lookup.kind === "error") return {
		ok: false,
		error: lookup.error
	};
	if (lookup.kind === "ended") return {
		ok: false,
		error: "Call has ended"
	};
	return {
		ok: true,
		call: lookup.call,
		providerCallId: lookup.providerCallId,
		provider: lookup.provider
	};
}
async function initiateCall(ctx, to, sessionKey, options) {
	const opts = typeof options === "string" ? { message: options } : options ?? {};
	const initialMessage = opts.message;
	const mode = opts.mode ?? ctx.config.outbound.defaultMode;
	if (!ctx.provider) return {
		callId: "",
		success: false,
		error: "Provider not initialized"
	};
	if (!ctx.webhookUrl) return {
		callId: "",
		success: false,
		error: "Webhook URL not configured"
	};
	if (ctx.activeCalls.size >= ctx.config.maxConcurrentCalls) return {
		callId: "",
		success: false,
		error: `Maximum concurrent calls (${ctx.config.maxConcurrentCalls}) reached`
	};
	const callId = crypto.randomUUID();
	const from = ctx.config.fromNumber || (ctx.provider?.name === "mock" ? "+15550000000" : void 0);
	if (!from) return {
		callId: "",
		success: false,
		error: "fromNumber not configured"
	};
	const callRecord = {
		callId,
		provider: ctx.provider.name,
		direction: "outbound",
		state: "initiated",
		from,
		to,
		sessionKey,
		startedAt: Date.now(),
		transcript: [],
		processedEventIds: [],
		metadata: {
			...initialMessage && { initialMessage },
			mode
		}
	};
	ctx.activeCalls.set(callId, callRecord);
	persistCallRecord(ctx.storePath, callRecord);
	try {
		let inlineTwiml;
		if (mode === "notify" && initialMessage) {
			const pollyVoice = mapVoiceToPolly(resolvePreferredTtsVoice(ctx.config));
			inlineTwiml = generateNotifyTwiml(initialMessage, pollyVoice);
			console.log(`[voice-call] Using inline TwiML for notify mode (voice: ${pollyVoice})`);
		}
		const result = await ctx.provider.initiateCall({
			callId,
			from,
			to,
			webhookUrl: ctx.webhookUrl,
			inlineTwiml
		});
		callRecord.providerCallId = result.providerCallId;
		ctx.providerCallIdMap.set(result.providerCallId, callId);
		persistCallRecord(ctx.storePath, callRecord);
		return {
			callId,
			success: true
		};
	} catch (err) {
		finalizeCall({
			ctx,
			call: callRecord,
			endReason: "failed"
		});
		return {
			callId,
			success: false,
			error: formatErrorMessage(err)
		};
	}
}
async function speak(ctx, callId, text) {
	const connected = requireConnectedCall(ctx, callId);
	if (!connected.ok) return {
		success: false,
		error: connected.error
	};
	const { call, providerCallId, provider } = connected;
	try {
		transitionState(call, "speaking");
		persistCallRecord(ctx.storePath, call);
		const voice = provider.name === "twilio" ? resolvePreferredTtsVoice(ctx.config) : void 0;
		await provider.playTts({
			callId,
			providerCallId,
			text,
			voice
		});
		addTranscriptEntry(call, "bot", text);
		persistCallRecord(ctx.storePath, call);
		return { success: true };
	} catch (err) {
		transitionState(call, "listening");
		persistCallRecord(ctx.storePath, call);
		return {
			success: false,
			error: formatErrorMessage(err)
		};
	}
}
async function speakInitialMessage(ctx, providerCallId) {
	const call = getCallByProviderCallId({
		activeCalls: ctx.activeCalls,
		providerCallIdMap: ctx.providerCallIdMap,
		providerCallId
	});
	if (!call) {
		console.warn(`[voice-call] speakInitialMessage: no call found for ${providerCallId}`);
		return;
	}
	const initialMessage = call.metadata?.initialMessage;
	const mode = call.metadata?.mode ?? "conversation";
	if (!initialMessage) {
		console.log(`[voice-call] speakInitialMessage: no initial message for ${call.callId}`);
		return;
	}
	if (ctx.initialMessageInFlight.has(call.callId)) {
		console.log(`[voice-call] speakInitialMessage: initial message already in flight for ${call.callId}`);
		return;
	}
	ctx.initialMessageInFlight.add(call.callId);
	try {
		console.log(`[voice-call] Speaking initial message for call ${call.callId} (mode: ${mode})`);
		const result = await speak(ctx, call.callId, initialMessage);
		if (!result.success) {
			console.warn(`[voice-call] Failed to speak initial message: ${result.error}`);
			return;
		}
		if (call.metadata) {
			delete call.metadata.initialMessage;
			persistCallRecord(ctx.storePath, call);
		}
		if (mode === "notify") {
			const delaySec = ctx.config.outbound.notifyHangupDelaySec;
			console.log(`[voice-call] Notify mode: auto-hangup in ${delaySec}s for call ${call.callId}`);
			setTimeout(async () => {
				const currentCall = ctx.activeCalls.get(call.callId);
				if (currentCall && !TerminalStates.has(currentCall.state)) {
					console.log(`[voice-call] Notify mode: hanging up call ${call.callId}`);
					await endCall(ctx, call.callId);
				}
			}, delaySec * 1e3);
		}
	} finally {
		ctx.initialMessageInFlight.delete(call.callId);
	}
}
async function continueCall(ctx, callId, prompt) {
	const connected = requireConnectedCall(ctx, callId);
	if (!connected.ok) return {
		success: false,
		error: connected.error
	};
	const { call, providerCallId, provider } = connected;
	if (ctx.activeTurnCalls.has(callId) || ctx.transcriptWaiters.has(callId)) return {
		success: false,
		error: "Already waiting for transcript"
	};
	ctx.activeTurnCalls.add(callId);
	const turnStartedAt = Date.now();
	const turnToken = provider.name === "twilio" ? crypto.randomUUID() : void 0;
	try {
		await speak(ctx, callId, prompt);
		transitionState(call, "listening");
		persistCallRecord(ctx.storePath, call);
		const listenStartedAt = Date.now();
		await provider.startListening({
			callId,
			providerCallId,
			turnToken
		});
		const transcript = await waitForFinalTranscript(ctx, callId, turnToken);
		const transcriptReceivedAt = Date.now();
		await provider.stopListening({
			callId,
			providerCallId
		});
		const lastTurnLatencyMs = transcriptReceivedAt - turnStartedAt;
		const lastTurnListenWaitMs = transcriptReceivedAt - listenStartedAt;
		const turnCount = call.metadata && typeof call.metadata.turnCount === "number" ? call.metadata.turnCount + 1 : 1;
		call.metadata = {
			...call.metadata,
			turnCount,
			lastTurnLatencyMs,
			lastTurnListenWaitMs,
			lastTurnCompletedAt: transcriptReceivedAt
		};
		persistCallRecord(ctx.storePath, call);
		console.log("[voice-call] continueCall latency call=" + call.callId + " totalMs=" + String(lastTurnLatencyMs) + " listenWaitMs=" + String(lastTurnListenWaitMs));
		return {
			success: true,
			transcript
		};
	} catch (err) {
		return {
			success: false,
			error: formatErrorMessage(err)
		};
	} finally {
		ctx.activeTurnCalls.delete(callId);
		clearTranscriptWaiter(ctx, callId);
	}
}
async function endCall(ctx, callId, options) {
	const lookup = lookupConnectedCall(ctx, callId);
	if (lookup.kind === "error") return {
		success: false,
		error: lookup.error
	};
	if (lookup.kind === "ended") return { success: true };
	const { call, providerCallId, provider } = lookup;
	const reason = options?.reason ?? "hangup-bot";
	try {
		await provider.hangupCall({
			callId,
			providerCallId,
			reason
		});
		finalizeCall({
			ctx,
			call,
			endReason: reason
		});
		return { success: true };
	} catch (err) {
		return {
			success: false,
			error: formatErrorMessage(err)
		};
	}
}
//#endregion
//#region extensions/voice-call/src/manager/events.ts
function shouldAcceptInbound(config, from) {
	const { inboundPolicy: policy, allowFrom } = config;
	switch (policy) {
		case "disabled":
			console.log("[voice-call] Inbound call rejected: policy is disabled");
			return false;
		case "open":
			console.log("[voice-call] Inbound call accepted: policy is open");
			return true;
		case "allowlist":
		case "pairing": {
			const normalized = normalizePhoneNumber(from);
			if (!normalized) {
				console.log("[voice-call] Inbound call rejected: missing caller ID");
				return false;
			}
			const allowed = isAllowlistedCaller(normalized, allowFrom);
			console.log(`[voice-call] Inbound call ${allowed ? "accepted" : "rejected"}: ${from} ${allowed ? "is in" : "not in"} allowlist`);
			return allowed;
		}
		default: return false;
	}
}
function createWebhookCall(params) {
	const callId = crypto.randomUUID();
	const callRecord = {
		callId,
		providerCallId: params.providerCallId,
		provider: params.ctx.provider?.name || "twilio",
		direction: params.direction,
		state: "ringing",
		from: params.from,
		to: params.to,
		startedAt: Date.now(),
		transcript: [],
		processedEventIds: [],
		metadata: { initialMessage: params.direction === "inbound" ? params.ctx.config.inboundGreeting || "Hello! How can I help you today?" : void 0 }
	};
	params.ctx.activeCalls.set(callId, callRecord);
	params.ctx.providerCallIdMap.set(params.providerCallId, callId);
	persistCallRecord(params.ctx.storePath, callRecord);
	console.log(`[voice-call] Created ${params.direction} call record: ${callId} from ${params.from}`);
	return callRecord;
}
function processEvent(ctx, event) {
	const dedupeKey = event.dedupeKey || event.id;
	if (ctx.processedEventIds.has(dedupeKey)) return;
	let call = findCall({
		activeCalls: ctx.activeCalls,
		providerCallIdMap: ctx.providerCallIdMap,
		callIdOrProviderCallId: event.callId
	});
	const providerCallId = event.providerCallId;
	const eventDirection = event.direction === "inbound" || event.direction === "outbound" ? event.direction : void 0;
	if (!call && providerCallId && eventDirection) {
		if (eventDirection === "inbound" && !shouldAcceptInbound(ctx.config, event.from)) {
			const pid = providerCallId;
			if (!ctx.provider) {
				console.warn(`[voice-call] Inbound call rejected by policy but no provider to hang up (providerCallId: ${pid}, from: ${event.from}); call will time out on provider side.`);
				return;
			}
			ctx.processedEventIds.add(dedupeKey);
			if (ctx.rejectedProviderCallIds.has(pid)) return;
			ctx.rejectedProviderCallIds.add(pid);
			const callId = event.callId ?? pid;
			console.log(`[voice-call] Rejecting inbound call by policy: ${pid}`);
			ctx.provider.hangupCall({
				callId,
				providerCallId: pid,
				reason: "hangup-bot"
			}).catch((err) => {
				ctx.rejectedProviderCallIds.delete(pid);
				const message = formatErrorMessage(err);
				console.warn(`[voice-call] Failed to reject inbound call ${pid}:`, message);
			});
			return;
		}
		call = createWebhookCall({
			ctx,
			providerCallId,
			direction: eventDirection === "outbound" ? "outbound" : "inbound",
			from: event.from || "unknown",
			to: event.to || ctx.config.fromNumber || "unknown"
		});
		event.callId = call.callId;
	}
	if (!call) return;
	if (event.providerCallId && event.providerCallId !== call.providerCallId) {
		const previousProviderCallId = call.providerCallId;
		call.providerCallId = event.providerCallId;
		ctx.providerCallIdMap.set(event.providerCallId, call.callId);
		if (previousProviderCallId) {
			if (ctx.providerCallIdMap.get(previousProviderCallId) === call.callId) ctx.providerCallIdMap.delete(previousProviderCallId);
		}
	}
	if (!(event.type === "call.error" && event.retryable)) {
		ctx.processedEventIds.add(dedupeKey);
		call.processedEventIds.push(dedupeKey);
	}
	switch (event.type) {
		case "call.initiated":
			transitionState(call, "initiated");
			break;
		case "call.ringing":
			transitionState(call, "ringing");
			break;
		case "call.answered":
			call.answeredAt = event.timestamp;
			transitionState(call, "answered");
			startMaxDurationTimer({
				ctx,
				callId: call.callId,
				onTimeout: async (callId) => {
					await endCall(ctx, callId, { reason: "timeout" });
				}
			});
			ctx.onCallAnswered?.(call);
			break;
		case "call.active":
			transitionState(call, "active");
			break;
		case "call.speaking":
			transitionState(call, "speaking");
			break;
		case "call.speech":
			if (event.isFinal) {
				const hadWaiter = ctx.transcriptWaiters.has(call.callId);
				const resolved = resolveTranscriptWaiter(ctx, call.callId, event.transcript, event.turnToken);
				if (hadWaiter && !resolved) {
					console.warn(`[voice-call] Ignoring speech event with mismatched turn token for ${call.callId}`);
					break;
				}
				addTranscriptEntry(call, "user", event.transcript);
			}
			transitionState(call, "listening");
			break;
		case "call.ended":
			finalizeCall({
				ctx,
				call,
				endReason: event.reason,
				endedAt: event.timestamp
			});
			return;
		case "call.error":
			if (!event.retryable) {
				finalizeCall({
					ctx,
					call,
					endReason: "error",
					endedAt: event.timestamp,
					transcriptRejectReason: `Call error: ${event.error}`
				});
				return;
			}
			break;
	}
	persistCallRecord(ctx.storePath, call);
}
//#endregion
//#region extensions/voice-call/src/utils.ts
function resolveUserPath(input) {
	const trimmed = input.trim();
	if (!trimmed) return trimmed;
	if (trimmed.startsWith("~")) {
		const expanded = trimmed.replace(/^~(?=$|[\\/])/, os.homedir());
		return path.resolve(expanded);
	}
	return path.resolve(trimmed);
}
//#endregion
//#region extensions/voice-call/src/manager.ts
function resolveDefaultStoreBase(config, storePath) {
	const rawOverride = storePath?.trim() || config.store?.trim();
	if (rawOverride) return resolveUserPath(rawOverride);
	const preferred = path.join(os.homedir(), ".openclaw", "voice-calls");
	return [preferred].map((dir) => resolveUserPath(dir)).find((dir) => {
		try {
			return fs.existsSync(path.join(dir, "calls.jsonl")) || fs.existsSync(dir);
		} catch {
			return false;
		}
	}) ?? resolveUserPath(preferred);
}
/**
* Manages voice calls: state ownership and delegation to manager helper modules.
*/
var CallManager = class {
	constructor(config, storePath) {
		this.activeCalls = /* @__PURE__ */ new Map();
		this.providerCallIdMap = /* @__PURE__ */ new Map();
		this.processedEventIds = /* @__PURE__ */ new Set();
		this.rejectedProviderCallIds = /* @__PURE__ */ new Set();
		this.provider = null;
		this.webhookUrl = null;
		this.activeTurnCalls = /* @__PURE__ */ new Set();
		this.transcriptWaiters = /* @__PURE__ */ new Map();
		this.maxDurationTimers = /* @__PURE__ */ new Map();
		this.initialMessageInFlight = /* @__PURE__ */ new Set();
		this.config = config;
		this.storePath = resolveDefaultStoreBase(config, storePath);
	}
	/**
	* Initialize the call manager with a provider.
	* Verifies persisted calls with the provider and restarts timers.
	*/
	async initialize(provider, webhookUrl) {
		this.provider = provider;
		this.webhookUrl = webhookUrl;
		fs.mkdirSync(this.storePath, { recursive: true });
		const persisted = loadActiveCallsFromStore(this.storePath);
		this.processedEventIds = persisted.processedEventIds;
		this.rejectedProviderCallIds = persisted.rejectedProviderCallIds;
		const verified = await this.verifyRestoredCalls(provider, persisted.activeCalls);
		this.activeCalls = verified;
		this.providerCallIdMap = /* @__PURE__ */ new Map();
		for (const [callId, call] of verified) if (call.providerCallId) this.providerCallIdMap.set(call.providerCallId, callId);
		for (const [callId, call] of verified) if (call.answeredAt && !TerminalStates.has(call.state)) {
			if (Date.now() - call.answeredAt >= this.config.maxDurationSeconds * 1e3) {
				verified.delete(callId);
				if (call.providerCallId) this.providerCallIdMap.delete(call.providerCallId);
				console.log(`[voice-call] Skipping restored call ${callId} (max duration already elapsed)`);
				continue;
			}
			startMaxDurationTimer({
				ctx: this.getContext(),
				callId,
				onTimeout: async (id) => {
					await endCall(this.getContext(), id, { reason: "timeout" });
				}
			});
			console.log(`[voice-call] Restarted max-duration timer for restored call ${callId}`);
		}
		if (verified.size > 0) console.log(`[voice-call] Restored ${verified.size} active call(s) from store`);
	}
	/**
	* Verify persisted calls with the provider before restoring.
	* Calls without providerCallId or older than maxDurationSeconds are skipped.
	* Transient provider errors keep the call (rely on timer fallback).
	*/
	async verifyRestoredCalls(provider, candidates) {
		if (candidates.size === 0) return /* @__PURE__ */ new Map();
		const maxAgeMs = this.config.maxDurationSeconds * 1e3;
		const now = Date.now();
		const verified = /* @__PURE__ */ new Map();
		const verifyTasks = [];
		for (const [callId, call] of candidates) {
			if (!call.providerCallId) {
				console.log(`[voice-call] Skipping restored call ${callId} (no providerCallId)`);
				continue;
			}
			if (now - call.startedAt > maxAgeMs) {
				console.log(`[voice-call] Skipping restored call ${callId} (older than maxDurationSeconds)`);
				continue;
			}
			const task = {
				callId,
				call,
				promise: provider.getCallStatus({ providerCallId: call.providerCallId }).then((result) => {
					if (result.isTerminal) console.log(`[voice-call] Skipping restored call ${callId} (provider status: ${result.status})`);
					else if (result.isUnknown) {
						console.log(`[voice-call] Keeping restored call ${callId} (provider status unknown, relying on timer)`);
						verified.set(callId, call);
					} else verified.set(callId, call);
				}).catch(() => {
					console.log(`[voice-call] Keeping restored call ${callId} (verification failed, relying on timer)`);
					verified.set(callId, call);
				})
			};
			verifyTasks.push(task);
		}
		await Promise.allSettled(verifyTasks.map((t) => t.promise));
		return verified;
	}
	/**
	* Get the current provider.
	*/
	getProvider() {
		return this.provider;
	}
	/**
	* Initiate an outbound call.
	*/
	async initiateCall(to, sessionKey, options) {
		return initiateCall(this.getContext(), to, sessionKey, options);
	}
	/**
	* Speak to user in an active call.
	*/
	async speak(callId, text) {
		return speak(this.getContext(), callId, text);
	}
	/**
	* Speak the initial message for a call (called when media stream connects).
	*/
	async speakInitialMessage(providerCallId) {
		return speakInitialMessage(this.getContext(), providerCallId);
	}
	/**
	* Continue call: speak prompt, then wait for user's final transcript.
	*/
	async continueCall(callId, prompt) {
		return continueCall(this.getContext(), callId, prompt);
	}
	/**
	* End an active call.
	*/
	async endCall(callId) {
		return endCall(this.getContext(), callId);
	}
	getContext() {
		return {
			activeCalls: this.activeCalls,
			providerCallIdMap: this.providerCallIdMap,
			processedEventIds: this.processedEventIds,
			rejectedProviderCallIds: this.rejectedProviderCallIds,
			provider: this.provider,
			config: this.config,
			storePath: this.storePath,
			webhookUrl: this.webhookUrl,
			activeTurnCalls: this.activeTurnCalls,
			transcriptWaiters: this.transcriptWaiters,
			maxDurationTimers: this.maxDurationTimers,
			initialMessageInFlight: this.initialMessageInFlight,
			onCallAnswered: (call) => {
				this.maybeSpeakInitialMessageOnAnswered(call);
			}
		};
	}
	/**
	* Process a webhook event.
	*/
	processEvent(event) {
		processEvent(this.getContext(), event);
	}
	shouldDeferConversationInitialMessageUntilStreamConnect() {
		if (!this.provider || this.provider.name !== "twilio" || !this.config.streaming.enabled) return false;
		const streamAwareProvider = this.provider;
		if (typeof streamAwareProvider.isConversationStreamConnectEnabled !== "function") return false;
		return streamAwareProvider.isConversationStreamConnectEnabled();
	}
	maybeSpeakInitialMessageOnAnswered(call) {
		if (!(normalizeOptionalString(call.metadata?.initialMessage) ?? "")) return;
		const mode = call.metadata?.mode ?? "conversation";
		if (mode === "conversation") {
			if (this.shouldDeferConversationInitialMessageUntilStreamConnect()) return;
		} else if (mode !== "notify") return;
		if (!this.provider || !call.providerCallId) return;
		this.speakInitialMessage(call.providerCallId);
	}
	/**
	* Get an active call by ID.
	*/
	getCall(callId) {
		return this.activeCalls.get(callId);
	}
	/**
	* Get an active call by provider call ID (e.g., Twilio CallSid).
	*/
	getCallByProviderCallId(providerCallId) {
		return getCallByProviderCallId({
			activeCalls: this.activeCalls,
			providerCallIdMap: this.providerCallIdMap,
			providerCallId
		});
	}
	/**
	* Get all active calls.
	*/
	getActiveCalls() {
		return Array.from(this.activeCalls.values());
	}
	/**
	* Get call history (from persisted logs).
	*/
	async getCallHistory(limit = 50) {
		return getCallHistoryFromStore(this.storePath, limit);
	}
};
//#endregion
//#region extensions/voice-call/src/provider-selection.ts
function selectConfiguredOrAutoProvider(params) {
	const configuredProviderId = normalizeOptionalString(params.configuredProviderId);
	const configuredProvider = params.getConfiguredProvider(configuredProviderId);
	if (configuredProviderId && !configuredProvider) return {
		configuredProviderId,
		missingConfiguredProvider: true,
		provider: void 0
	};
	return {
		configuredProviderId,
		missingConfiguredProvider: false,
		provider: configuredProvider ?? [...params.listProviders()].toSorted((left, right) => (left.autoSelectOrder ?? Number.MAX_SAFE_INTEGER) - (right.autoSelectOrder ?? Number.MAX_SAFE_INTEGER))[0]
	};
}
function resolveProviderRawConfig(params) {
	const canonicalProviderConfig = params.providerConfigs?.[params.providerId] && typeof params.providerConfigs[params.providerId] === "object" ? params.providerConfigs[params.providerId] : void 0;
	const selectedProviderConfig = params.configuredProviderId && params.providerConfigs?.[params.configuredProviderId] && typeof params.providerConfigs[params.configuredProviderId] === "object" ? params.providerConfigs[params.configuredProviderId] : void 0;
	return {
		...canonicalProviderConfig,
		...selectedProviderConfig
	};
}
//#endregion
//#region extensions/voice-call/src/provider-runtime-resolution.ts
function resolveConfiguredCapabilityProvider(params) {
	const selection = selectConfiguredOrAutoProvider({
		configuredProviderId: params.configuredProviderId,
		getConfiguredProvider: params.getConfiguredProvider,
		listProviders: params.listProviders
	});
	if (selection.missingConfiguredProvider) return {
		ok: false,
		code: "missing-configured-provider",
		configuredProviderId: selection.configuredProviderId
	};
	const provider = selection.provider;
	if (!provider) return {
		ok: false,
		code: "no-registered-provider",
		configuredProviderId: selection.configuredProviderId
	};
	const rawProviderConfig = resolveProviderRawConfig({
		providerId: provider.id,
		configuredProviderId: selection.configuredProviderId,
		providerConfigs: params.providerConfigs
	});
	const providerConfig = params.resolveProviderConfig({
		provider,
		cfg: params.cfgForResolve,
		rawConfig: rawProviderConfig
	});
	if (!params.isProviderConfigured({
		provider,
		cfg: params.cfg,
		providerConfig
	})) return {
		ok: false,
		code: "provider-not-configured",
		configuredProviderId: selection.configuredProviderId,
		provider
	};
	return {
		ok: true,
		configuredProviderId: selection.configuredProviderId,
		provider,
		providerConfig
	};
}
//#endregion
//#region extensions/voice-call/src/telephony-tts.ts
function createTelephonyTtsProvider(params) {
	const { coreConfig, ttsOverride, runtime, logger } = params;
	const mergedConfig = applyTtsOverride(coreConfig, ttsOverride);
	return { synthesizeForTelephony: async (text) => {
		const result = await runtime.textToSpeechTelephony({
			text,
			cfg: mergedConfig
		});
		if (!result.success || !result.audioBuffer || !result.sampleRate) throw new Error(result.error ?? "TTS conversion failed");
		if (result.fallbackFrom && result.provider && result.fallbackFrom !== result.provider) {
			const attemptedChain = result.attemptedProviders && result.attemptedProviders.length > 0 ? result.attemptedProviders.join(" -> ") : `${result.fallbackFrom} -> ${result.provider}`;
			logger?.warn?.(`[voice-call] Telephony TTS fallback used from=${result.fallbackFrom} to=${result.provider} attempts=${attemptedChain}`);
		}
		return convertPcmToMulaw8k(result.audioBuffer, result.sampleRate);
	} };
}
function applyTtsOverride(coreConfig, override) {
	if (!override) return coreConfig;
	const base = coreConfig.messages?.tts;
	const merged = mergeTtsConfig(base, override);
	if (!merged) return coreConfig;
	return {
		...coreConfig,
		messages: {
			...coreConfig.messages,
			tts: merged
		}
	};
}
function mergeTtsConfig(base, override) {
	if (!base && !override) return;
	if (!override) return base;
	if (!base) return override;
	return deepMergeDefined(base, override);
}
//#endregion
//#region extensions/voice-call/src/webhook/tailscale.ts
function runTailscaleCommand(args, timeoutMs = 2500) {
	return new Promise((resolve) => {
		const proc = spawn("tailscale", args, { stdio: [
			"ignore",
			"pipe",
			"pipe"
		] });
		let stdout = "";
		proc.stdout.on("data", (data) => {
			stdout += data;
		});
		const timer = setTimeout(() => {
			proc.kill("SIGKILL");
			resolve({
				code: -1,
				stdout: ""
			});
		}, timeoutMs);
		proc.on("close", (code) => {
			clearTimeout(timer);
			resolve({
				code: code ?? -1,
				stdout
			});
		});
	});
}
async function getTailscaleSelfInfo() {
	const { code, stdout } = await runTailscaleCommand(["status", "--json"]);
	if (code !== 0) return null;
	try {
		const status = JSON.parse(stdout);
		return {
			dnsName: status.Self?.DNSName?.replace(/\.$/, "") || null,
			nodeId: status.Self?.ID || null
		};
	} catch {
		return null;
	}
}
async function getTailscaleDnsName() {
	return (await getTailscaleSelfInfo())?.dnsName ?? null;
}
async function setupTailscaleExposureRoute(opts) {
	const dnsName = await getTailscaleDnsName();
	if (!dnsName) {
		console.warn("[voice-call] Could not get Tailscale DNS name");
		return null;
	}
	const { code } = await runTailscaleCommand([
		opts.mode,
		"--bg",
		"--yes",
		"--set-path",
		opts.path,
		opts.localUrl
	]);
	if (code === 0) {
		const publicUrl = `https://${dnsName}${opts.path}`;
		console.log(`[voice-call] Tailscale ${opts.mode} active: ${publicUrl}`);
		return publicUrl;
	}
	console.warn(`[voice-call] Tailscale ${opts.mode} failed`);
	return null;
}
async function cleanupTailscaleExposureRoute(opts) {
	await runTailscaleCommand([
		opts.mode,
		"off",
		opts.path
	]);
}
async function setupTailscaleExposure(config) {
	if (config.tailscale.mode === "off") return null;
	const mode = config.tailscale.mode === "funnel" ? "funnel" : "serve";
	const localUrl = `http://127.0.0.1:${config.serve.port}${config.serve.path}`;
	return setupTailscaleExposureRoute({
		mode,
		path: config.tailscale.path,
		localUrl
	});
}
async function cleanupTailscaleExposure(config) {
	if (config.tailscale.mode === "off") return;
	await cleanupTailscaleExposureRoute({
		mode: config.tailscale.mode === "funnel" ? "funnel" : "serve",
		path: config.tailscale.path
	});
}
//#endregion
//#region extensions/voice-call/src/tunnel.ts
/**
* Start an ngrok tunnel to expose the local webhook server.
*
* Uses the ngrok CLI which must be installed: https://ngrok.com/download
*
* @example
* const tunnel = await startNgrokTunnel({ port: 3334, path: '/voice/webhook' });
* console.log('Public URL:', tunnel.publicUrl);
* // Later: await tunnel.stop();
*/
async function startNgrokTunnel(config) {
	if (config.authToken) await runNgrokCommand([
		"config",
		"add-authtoken",
		config.authToken
	]);
	const args = [
		"http",
		String(config.port),
		"--log",
		"stdout",
		"--log-format",
		"json"
	];
	if (config.domain) args.push("--domain", config.domain);
	return new Promise((resolve, reject) => {
		const proc = spawn("ngrok", args, { stdio: [
			"ignore",
			"pipe",
			"pipe"
		] });
		let resolved = false;
		let publicUrl = null;
		let outputBuffer = "";
		const timeout = setTimeout(() => {
			if (!resolved) {
				resolved = true;
				proc.kill("SIGTERM");
				reject(/* @__PURE__ */ new Error("ngrok startup timed out (30s)"));
			}
		}, 3e4);
		const processLine = (line) => {
			try {
				const log = JSON.parse(line);
				if (log.msg === "started tunnel" && log.url) publicUrl = log.url;
				if (log.addr && log.url && !publicUrl) publicUrl = log.url;
				if (publicUrl && !resolved) {
					resolved = true;
					clearTimeout(timeout);
					const fullUrl = publicUrl + config.path;
					console.log(`[voice-call] ngrok tunnel active: ${fullUrl}`);
					resolve({
						publicUrl: fullUrl,
						provider: "ngrok",
						stop: async () => {
							proc.kill("SIGTERM");
							await new Promise((res) => {
								proc.on("close", () => res());
								setTimeout(res, 2e3);
							});
						}
					});
				}
			} catch {}
		};
		proc.stdout.on("data", (data) => {
			outputBuffer += data.toString();
			const lines = outputBuffer.split("\n");
			outputBuffer = lines.pop() || "";
			for (const line of lines) if (line.trim()) processLine(line);
		});
		proc.stderr.on("data", (data) => {
			const msg = data.toString();
			if (msg.includes("ERR_NGROK")) {
				if (!resolved) {
					resolved = true;
					clearTimeout(timeout);
					reject(/* @__PURE__ */ new Error(`ngrok error: ${msg}`));
				}
			}
		});
		proc.on("error", (err) => {
			if (!resolved) {
				resolved = true;
				clearTimeout(timeout);
				reject(/* @__PURE__ */ new Error(`Failed to start ngrok: ${err.message}`));
			}
		});
		proc.on("close", (code) => {
			if (!resolved) {
				resolved = true;
				clearTimeout(timeout);
				reject(/* @__PURE__ */ new Error(`ngrok exited unexpectedly with code ${code}`));
			}
		});
	});
}
/**
* Run an ngrok command and wait for completion.
*/
async function runNgrokCommand(args) {
	return new Promise((resolve, reject) => {
		const proc = spawn("ngrok", args, { stdio: [
			"ignore",
			"pipe",
			"pipe"
		] });
		let stdout = "";
		let stderr = "";
		proc.stdout.on("data", (data) => {
			stdout += data.toString();
		});
		proc.stderr.on("data", (data) => {
			stderr += data.toString();
		});
		proc.on("close", (code) => {
			if (code === 0) resolve(stdout);
			else reject(/* @__PURE__ */ new Error(`ngrok command failed: ${stderr || stdout}`));
		});
		proc.on("error", reject);
	});
}
/**
* Start a Tailscale serve/funnel tunnel.
*/
async function startTailscaleTunnel(config) {
	const dnsName = await getTailscaleDnsName();
	if (!dnsName) throw new Error("Could not get Tailscale DNS name. Is Tailscale running?");
	const path = config.path.startsWith("/") ? config.path : `/${config.path}`;
	const localUrl = `http://127.0.0.1:${config.port}${path}`;
	return new Promise((resolve, reject) => {
		const proc = spawn("tailscale", [
			config.mode,
			"--bg",
			"--yes",
			"--set-path",
			path,
			localUrl
		], { stdio: [
			"ignore",
			"pipe",
			"pipe"
		] });
		const timeout = setTimeout(() => {
			proc.kill("SIGKILL");
			reject(/* @__PURE__ */ new Error(`Tailscale ${config.mode} timed out`));
		}, 1e4);
		proc.on("close", (code) => {
			clearTimeout(timeout);
			if (code === 0) {
				const publicUrl = `https://${dnsName}${path}`;
				console.log(`[voice-call] Tailscale ${config.mode} active: ${publicUrl}`);
				resolve({
					publicUrl,
					provider: `tailscale-${config.mode}`,
					stop: async () => {
						await stopTailscaleTunnel(config.mode, path);
					}
				});
			} else reject(/* @__PURE__ */ new Error(`Tailscale ${config.mode} failed with code ${code}`));
		});
		proc.on("error", (err) => {
			clearTimeout(timeout);
			reject(err);
		});
	});
}
/**
* Stop a Tailscale serve/funnel tunnel.
*/
async function stopTailscaleTunnel(mode, path) {
	return new Promise((resolve) => {
		const proc = spawn("tailscale", [
			mode,
			"off",
			path
		], { stdio: "ignore" });
		const timeout = setTimeout(() => {
			proc.kill("SIGKILL");
			resolve();
		}, 5e3);
		proc.on("close", () => {
			clearTimeout(timeout);
			resolve();
		});
	});
}
/**
* Start a tunnel based on configuration.
*/
async function startTunnel(config) {
	switch (config.provider) {
		case "ngrok": return startNgrokTunnel({
			port: config.port,
			path: config.path,
			authToken: config.ngrokAuthToken,
			domain: config.ngrokDomain
		});
		case "tailscale-serve": return startTailscaleTunnel({
			mode: "serve",
			port: config.port,
			path: config.path
		});
		case "tailscale-funnel": return startTailscaleTunnel({
			mode: "funnel",
			port: config.port,
			path: config.path
		});
		default: return null;
	}
}
//#endregion
//#region extensions/voice-call/src/media-stream.ts
const DEFAULT_PRE_START_TIMEOUT_MS = 5e3;
const DEFAULT_MAX_PENDING_CONNECTIONS = 32;
const DEFAULT_MAX_PENDING_CONNECTIONS_PER_IP = 4;
const DEFAULT_MAX_CONNECTIONS = 128;
const MAX_INBOUND_MESSAGE_BYTES = 64 * 1024;
const MAX_WS_BUFFERED_BYTES = 1024 * 1024;
const CLOSE_REASON_LOG_MAX_CHARS = 120;
function sanitizeLogText(value, maxChars) {
	const sanitized = value.replace(/\p{Cc}/gu, " ").replace(/\s+/g, " ").trim();
	if (sanitized.length <= maxChars) return sanitized;
	return `${sanitized.slice(0, maxChars)}...`;
}
function normalizeWsMessageData(data) {
	if (Buffer.isBuffer(data)) return data;
	if (Array.isArray(data)) return Buffer.concat(data);
	return Buffer.from(data);
}
/**
* Manages WebSocket connections for Twilio media streams.
*/
var MediaStreamHandler = class {
	constructor(config) {
		this.wss = null;
		this.sessions = /* @__PURE__ */ new Map();
		this.pendingConnections = /* @__PURE__ */ new Map();
		this.pendingByIp = /* @__PURE__ */ new Map();
		this.inflightUpgrades = 0;
		this.ttsQueues = /* @__PURE__ */ new Map();
		this.ttsPlaying = /* @__PURE__ */ new Map();
		this.ttsActiveControllers = /* @__PURE__ */ new Map();
		this.config = config;
		this.preStartTimeoutMs = config.preStartTimeoutMs ?? DEFAULT_PRE_START_TIMEOUT_MS;
		this.maxPendingConnections = config.maxPendingConnections ?? DEFAULT_MAX_PENDING_CONNECTIONS;
		this.maxPendingConnectionsPerIp = config.maxPendingConnectionsPerIp ?? DEFAULT_MAX_PENDING_CONNECTIONS_PER_IP;
		this.maxConnections = config.maxConnections ?? DEFAULT_MAX_CONNECTIONS;
	}
	/**
	* Handle WebSocket upgrade for media stream connections.
	*/
	handleUpgrade(request, socket, head) {
		if (!this.wss) {
			this.wss = new WebSocketServer({
				noServer: true,
				maxPayload: MAX_INBOUND_MESSAGE_BYTES
			});
			this.wss.on("connection", (ws, req) => this.handleConnection(ws, req));
		}
		if (this.getCurrentConnectionCount() >= this.maxConnections) {
			this.rejectUpgrade(socket, 503, "Too many media stream connections");
			return;
		}
		this.inflightUpgrades += 1;
		let released = false;
		const releaseUpgradeReservation = () => {
			if (released) return;
			released = true;
			this.inflightUpgrades = Math.max(0, this.inflightUpgrades - 1);
		};
		const handleUpgradeAbort = () => {
			socket.removeListener("error", handleUpgradeAbort);
			socket.removeListener("close", handleUpgradeAbort);
			releaseUpgradeReservation();
		};
		socket.once("error", handleUpgradeAbort);
		socket.once("close", handleUpgradeAbort);
		try {
			this.wss.handleUpgrade(request, socket, head, (ws) => {
				socket.removeListener("error", handleUpgradeAbort);
				socket.removeListener("close", handleUpgradeAbort);
				releaseUpgradeReservation();
				this.wss?.emit("connection", ws, request);
			});
		} catch (error) {
			socket.removeListener("error", handleUpgradeAbort);
			socket.removeListener("close", handleUpgradeAbort);
			releaseUpgradeReservation();
			throw error;
		}
	}
	/**
	* Handle new WebSocket connection from Twilio.
	*/
	async handleConnection(ws, _request) {
		let session = null;
		const streamToken = this.getStreamToken(_request);
		const ip = this.getClientIp(_request);
		if (!this.registerPendingConnection(ws, ip)) {
			ws.close(1013, "Too many pending media stream connections");
			return;
		}
		ws.on("message", async (data) => {
			try {
				const raw = normalizeWsMessageData(data);
				const message = JSON.parse(raw.toString("utf8"));
				switch (message.event) {
					case "connected":
						console.log("[MediaStream] Twilio connected");
						break;
					case "start":
						session = await this.handleStart(ws, message, streamToken);
						if (session) this.clearPendingConnection(ws);
						break;
					case "media":
						if (session && message.media?.payload) {
							const audioBuffer = Buffer.from(message.media.payload, "base64");
							session.sttSession.sendAudio(audioBuffer);
						}
						break;
					case "stop":
						if (session) {
							this.handleStop(session);
							session = null;
						}
						break;
				}
			} catch (error) {
				console.error("[MediaStream] Error processing message:", error);
			}
		});
		ws.on("close", (code, reason) => {
			const reasonText = sanitizeLogText(Buffer.isBuffer(reason) ? reason.toString("utf8") : String(reason || ""), CLOSE_REASON_LOG_MAX_CHARS);
			console.log(`[MediaStream] WebSocket closed (code: ${code}, reason: ${reasonText || "none"})`);
			this.clearPendingConnection(ws);
			if (session) this.handleStop(session);
		});
		ws.on("error", (error) => {
			console.error("[MediaStream] WebSocket error:", error);
		});
	}
	/**
	* Handle stream start event.
	*/
	async handleStart(ws, message, streamToken) {
		const streamSid = message.streamSid || "";
		const callSid = message.start?.callSid || "";
		const effectiveToken = message.start?.customParameters?.token ?? streamToken;
		console.log(`[MediaStream] Stream started: ${streamSid} (call: ${callSid})`);
		if (!callSid) {
			console.warn("[MediaStream] Missing callSid; closing stream");
			ws.close(1008, "Missing callSid");
			return null;
		}
		if (this.config.shouldAcceptStream && !this.config.shouldAcceptStream({
			callId: callSid,
			streamSid,
			token: effectiveToken
		})) {
			console.warn(`[MediaStream] Rejecting stream for unknown call: ${callSid}`);
			ws.close(1008, "Unknown call");
			return null;
		}
		const sttSession = this.config.transcriptionProvider.createSession({
			providerConfig: this.config.providerConfig,
			onPartial: (partial) => {
				this.config.onPartialTranscript?.(callSid, partial);
			},
			onTranscript: (transcript) => {
				this.config.onTranscript?.(callSid, transcript);
			},
			onSpeechStart: () => {
				this.config.onSpeechStart?.(callSid);
			},
			onError: (error) => {
				console.warn("[MediaStream] Transcription session error:", error.message);
			}
		});
		const session = {
			callId: callSid,
			streamSid,
			ws,
			sttSession
		};
		this.sessions.set(streamSid, session);
		this.config.onConnect?.(callSid, streamSid);
		sttSession.connect().catch((err) => {
			console.warn(`[MediaStream] STT connection failed (TTS still works):`, err.message);
		});
		return session;
	}
	/**
	* Handle stream stop event.
	*/
	handleStop(session) {
		console.log(`[MediaStream] Stream stopped: ${session.streamSid}`);
		this.clearTtsState(session.streamSid);
		session.sttSession.close();
		this.sessions.delete(session.streamSid);
		this.config.onDisconnect?.(session.callId, session.streamSid);
	}
	getStreamToken(request) {
		if (!request.url || !request.headers.host) return;
		try {
			return new URL(request.url, `http://${request.headers.host}`).searchParams.get("token") ?? void 0;
		} catch {
			return;
		}
	}
	getClientIp(request) {
		const resolvedIp = this.config.resolveClientIp?.(request)?.trim();
		if (resolvedIp) return resolvedIp;
		return request.socket.remoteAddress || "unknown";
	}
	getCurrentConnectionCount() {
		return this.wss ? this.wss.clients.size + this.inflightUpgrades : this.inflightUpgrades;
	}
	registerPendingConnection(ws, ip) {
		if (this.pendingConnections.size >= this.maxPendingConnections) {
			console.warn("[MediaStream] Rejecting connection: pending connection limit reached");
			return false;
		}
		const pendingForIp = this.pendingByIp.get(ip) ?? 0;
		if (pendingForIp >= this.maxPendingConnectionsPerIp) {
			console.warn(`[MediaStream] Rejecting connection: pending per-IP limit reached (${ip})`);
			return false;
		}
		const timeout = setTimeout(() => {
			if (!this.pendingConnections.has(ws)) return;
			console.warn(`[MediaStream] Closing pre-start idle connection after ${this.preStartTimeoutMs}ms (${ip})`);
			ws.close(1008, "Start timeout");
		}, this.preStartTimeoutMs);
		timeout.unref?.();
		this.pendingConnections.set(ws, {
			ip,
			timeout
		});
		this.pendingByIp.set(ip, pendingForIp + 1);
		return true;
	}
	clearPendingConnection(ws) {
		const pending = this.pendingConnections.get(ws);
		if (!pending) return;
		clearTimeout(pending.timeout);
		this.pendingConnections.delete(ws);
		const current = this.pendingByIp.get(pending.ip) ?? 0;
		if (current <= 1) {
			this.pendingByIp.delete(pending.ip);
			return;
		}
		this.pendingByIp.set(pending.ip, current - 1);
	}
	rejectUpgrade(socket, statusCode, message) {
		const statusText = statusCode === 429 ? "Too Many Requests" : "Service Unavailable";
		const body = `${message}\n`;
		socket.write(`HTTP/1.1 ${statusCode} ${statusText}\r\nConnection: close\r
Content-Type: text/plain; charset=utf-8\r
Content-Length: ${Buffer.byteLength(body)}\r\n\r
` + body);
		socket.destroy();
	}
	/**
	* Get an active session with an open WebSocket, or undefined if unavailable.
	*/
	getOpenSession(streamSid) {
		const session = this.sessions.get(streamSid);
		return session?.ws.readyState === WebSocket$1.OPEN ? session : void 0;
	}
	/**
	* Send a message to a stream's WebSocket if available.
	*/
	sendToStream(streamSid, message) {
		const session = this.sessions.get(streamSid);
		if (!session) return {
			sent: false,
			bufferedBeforeBytes: 0,
			bufferedAfterBytes: 0
		};
		const readyState = session.ws.readyState;
		const bufferedBeforeBytes = session.ws.bufferedAmount;
		if (readyState !== WebSocket$1.OPEN) return {
			sent: false,
			readyState,
			bufferedBeforeBytes,
			bufferedAfterBytes: session.ws.bufferedAmount
		};
		if (bufferedBeforeBytes > MAX_WS_BUFFERED_BYTES) {
			try {
				session.ws.close(1013, "Backpressure: send buffer exceeded");
			} catch {}
			return {
				sent: false,
				readyState,
				bufferedBeforeBytes,
				bufferedAfterBytes: session.ws.bufferedAmount
			};
		}
		try {
			session.ws.send(JSON.stringify(message));
			const bufferedAfterBytes = session.ws.bufferedAmount;
			if (bufferedAfterBytes > MAX_WS_BUFFERED_BYTES) {
				try {
					session.ws.close(1013, "Backpressure: send buffer exceeded");
				} catch {}
				return {
					sent: false,
					readyState,
					bufferedBeforeBytes,
					bufferedAfterBytes
				};
			}
			return {
				sent: true,
				readyState,
				bufferedBeforeBytes,
				bufferedAfterBytes
			};
		} catch {
			return {
				sent: false,
				readyState,
				bufferedBeforeBytes,
				bufferedAfterBytes: session.ws.bufferedAmount
			};
		}
	}
	/**
	* Send audio to a specific stream (for TTS playback).
	* Audio should be mu-law encoded at 8kHz mono.
	*/
	sendAudio(streamSid, muLawAudio) {
		return this.sendToStream(streamSid, {
			event: "media",
			streamSid,
			media: { payload: muLawAudio.toString("base64") }
		});
	}
	/**
	* Send a mark event to track audio playback position.
	*/
	sendMark(streamSid, name) {
		return this.sendToStream(streamSid, {
			event: "mark",
			streamSid,
			mark: { name }
		});
	}
	/**
	* Clear audio buffer (interrupt playback).
	*/
	clearAudio(streamSid) {
		return this.sendToStream(streamSid, {
			event: "clear",
			streamSid
		});
	}
	/**
	* Queue a TTS operation for sequential playback.
	* Only one TTS operation plays at a time per stream to prevent overlap.
	*/
	async queueTts(streamSid, playFn) {
		const queue = this.getTtsQueue(streamSid);
		let resolveEntry;
		let rejectEntry;
		const promise = new Promise((resolve, reject) => {
			resolveEntry = resolve;
			rejectEntry = reject;
		});
		queue.push({
			playFn,
			controller: new AbortController(),
			resolve: resolveEntry,
			reject: rejectEntry
		});
		if (!this.ttsPlaying.get(streamSid)) this.processQueue(streamSid);
		return promise;
	}
	/**
	* Clear TTS queue and interrupt current playback (barge-in).
	*/
	clearTtsQueue(streamSid, _reason = "unspecified") {
		const queue = this.getTtsQueue(streamSid);
		queue.length = 0;
		this.ttsActiveControllers.get(streamSid)?.abort();
		this.clearAudio(streamSid);
	}
	/**
	* Get active session by call ID.
	*/
	getSessionByCallId(callId) {
		return [...this.sessions.values()].find((session) => session.callId === callId);
	}
	/**
	* Close all sessions.
	*/
	closeAll() {
		for (const session of this.sessions.values()) {
			this.clearTtsState(session.streamSid);
			session.sttSession.close();
			session.ws.close();
		}
		this.sessions.clear();
	}
	getTtsQueue(streamSid) {
		const existing = this.ttsQueues.get(streamSid);
		if (existing) return existing;
		const queue = [];
		this.ttsQueues.set(streamSid, queue);
		return queue;
	}
	/**
	* Process the TTS queue for a stream.
	* Uses iterative approach to avoid stack accumulation from recursion.
	*/
	async processQueue(streamSid) {
		this.ttsPlaying.set(streamSid, true);
		while (true) {
			const queue = this.ttsQueues.get(streamSid);
			if (!queue || queue.length === 0) {
				this.ttsPlaying.set(streamSid, false);
				this.ttsActiveControllers.delete(streamSid);
				return;
			}
			const entry = queue.shift();
			this.ttsActiveControllers.set(streamSid, entry.controller);
			try {
				await entry.playFn(entry.controller.signal);
				entry.resolve();
			} catch (error) {
				if (entry.controller.signal.aborted) entry.resolve();
				else {
					console.error("[MediaStream] TTS playback error:", error);
					entry.reject(error);
				}
			} finally {
				if (this.ttsActiveControllers.get(streamSid) === entry.controller) this.ttsActiveControllers.delete(streamSid);
			}
		}
	}
	clearTtsState(streamSid) {
		const queue = this.ttsQueues.get(streamSid);
		if (queue) queue.length = 0;
		this.ttsActiveControllers.get(streamSid)?.abort();
		this.ttsActiveControllers.delete(streamSid);
		this.ttsPlaying.delete(streamSid);
		this.ttsQueues.delete(streamSid);
	}
};
//#endregion
//#region extensions/voice-call/src/webhook/stale-call-reaper.ts
const CHECK_INTERVAL_MS = 3e4;
function startStaleCallReaper(params) {
	const maxAgeSeconds = params.staleCallReaperSeconds;
	if (!maxAgeSeconds || maxAgeSeconds <= 0) return null;
	const maxAgeMs = maxAgeSeconds * 1e3;
	const interval = setInterval(() => {
		const now = Date.now();
		for (const call of params.manager.getActiveCalls()) {
			const age = now - call.startedAt;
			if (age > maxAgeMs) {
				console.log(`[voice-call] Reaping stale call ${call.callId} (age: ${Math.round(age / 1e3)}s, state: ${call.state})`);
				params.manager.endCall(call.callId).catch((err) => {
					console.warn(`[voice-call] Reaper failed to end call ${call.callId}:`, err);
				});
			}
		}
	}, CHECK_INTERVAL_MS);
	return () => {
		clearInterval(interval);
	};
}
//#endregion
//#region extensions/voice-call/src/webhook.ts
const MAX_WEBHOOK_BODY_BYTES = WEBHOOK_BODY_READ_DEFAULTS.preAuth.maxBytes;
const WEBHOOK_BODY_TIMEOUT_MS = WEBHOOK_BODY_READ_DEFAULTS.preAuth.timeoutMs;
const STREAM_DISCONNECT_HANGUP_GRACE_MS = 2e3;
const TRANSCRIPT_LOG_MAX_CHARS = 200;
function sanitizeTranscriptForLog(value) {
	const sanitized = value.replace(/\p{Cc}/gu, " ").replace(/\s+/g, " ").trim();
	if (sanitized.length <= TRANSCRIPT_LOG_MAX_CHARS) return sanitized;
	return `${sanitized.slice(0, TRANSCRIPT_LOG_MAX_CHARS)}...`;
}
function buildRequestUrl(requestUrl, requestHost, fallbackHost = "localhost") {
	return new URL$1(requestUrl ?? "/", `http://${requestHost ?? fallbackHost}`);
}
function normalizeProxyIp(value) {
	const trimmed = value?.trim();
	if (!trimmed) return;
	const normalized = (trimmed.startsWith("[") && trimmed.endsWith("]") ? trimmed.slice(1, -1) : trimmed).toLowerCase();
	if (normalized.startsWith("::ffff:")) {
		const mappedIpv4 = normalized.slice(7);
		if (/^\d{1,3}(?:\.\d{1,3}){3}$/.test(mappedIpv4)) return mappedIpv4;
	}
	return normalized;
}
function resolveForwardedClientIp(request, trustedProxyIPs) {
	const normalizedTrustedProxyIps = new Set(trustedProxyIPs.map((ip) => normalizeProxyIp(ip)).filter((ip) => Boolean(ip)));
	const forwardedFor = getHeader(request.headers, "x-forwarded-for");
	if (forwardedFor) {
		const forwardedIps = forwardedFor.split(",").map((part) => part.trim()).filter(Boolean);
		if (forwardedIps.length > 0) {
			if (normalizedTrustedProxyIps.size === 0) return forwardedIps[0];
			for (let index = forwardedIps.length - 1; index >= 0; index -= 1) {
				const hop = forwardedIps[index];
				if (!normalizedTrustedProxyIps.has(normalizeProxyIp(hop) ?? "")) return hop;
			}
			return forwardedIps[0];
		}
	}
	return getHeader(request.headers, "x-real-ip")?.trim() || void 0;
}
function normalizeWebhookResponse(parsed) {
	return {
		statusCode: parsed.statusCode ?? 200,
		headers: parsed.providerResponseHeaders,
		body: parsed.providerResponseBody ?? "OK"
	};
}
/**
* HTTP server for receiving voice call webhooks from providers.
* Supports WebSocket upgrades for media streams when streaming is enabled.
*/
var VoiceCallWebhookServer = class {
	constructor(config, manager, provider, coreConfig, fullConfig, agentRuntime) {
		this.server = null;
		this.listeningUrl = null;
		this.stopStaleCallReaper = null;
		this.webhookInFlightLimiter = createWebhookInFlightLimiter();
		this.mediaStreamHandler = null;
		this.pendingDisconnectHangups = /* @__PURE__ */ new Map();
		this.realtimeHandler = null;
		this.config = normalizeVoiceCallConfig(config);
		this.manager = manager;
		this.provider = provider;
		this.coreConfig = coreConfig ?? null;
		this.fullConfig = fullConfig ?? null;
		this.agentRuntime = agentRuntime ?? null;
	}
	/**
	* Get the media stream handler (for wiring to provider).
	*/
	getMediaStreamHandler() {
		return this.mediaStreamHandler;
	}
	getRealtimeHandler() {
		return this.realtimeHandler;
	}
	setRealtimeHandler(handler) {
		this.realtimeHandler = handler;
	}
	clearPendingDisconnectHangup(providerCallId) {
		const existing = this.pendingDisconnectHangups.get(providerCallId);
		if (!existing) return;
		clearTimeout(existing);
		this.pendingDisconnectHangups.delete(providerCallId);
	}
	resolveMediaStreamClientIp(request) {
		const remoteIp = request.socket.remoteAddress ?? void 0;
		const trustedProxyIPs = this.config.webhookSecurity.trustedProxyIPs.filter(Boolean);
		const normalizedTrustedProxyIps = new Set(trustedProxyIPs.map((ip) => normalizeProxyIp(ip)).filter((ip) => Boolean(ip)));
		const normalizedRemoteIp = normalizeProxyIp(remoteIp);
		const fromTrustedProxy = normalizedTrustedProxyIps.size > 0 && normalizedRemoteIp !== void 0 && normalizedTrustedProxyIps.has(normalizedRemoteIp);
		if (this.config.webhookSecurity.trustForwardingHeaders && fromTrustedProxy) {
			const forwardedIp = resolveForwardedClientIp(request, trustedProxyIPs);
			if (forwardedIp) return forwardedIp;
		}
		return remoteIp;
	}
	shouldSuppressBargeInForInitialMessage(call) {
		if (!call || call.direction !== "outbound") return false;
		if (call.state !== "speaking") return false;
		if ((call.metadata?.mode ?? "conversation") !== "conversation") return false;
		return (normalizeOptionalString(call.metadata?.initialMessage) ?? "").length > 0;
	}
	/**
	* Initialize media streaming with the selected realtime transcription provider.
	*/
	async initializeMediaStreaming() {
		const streaming = this.config.streaming;
		const pluginConfig = this.fullConfig ?? this.coreConfig;
		const { getRealtimeTranscriptionProvider, listRealtimeTranscriptionProviders } = await import("./realtime-transcription.runtime-DI55TXh6.js");
		const resolution = resolveConfiguredCapabilityProvider({
			configuredProviderId: streaming.provider,
			providerConfigs: streaming.providers,
			cfg: pluginConfig,
			cfgForResolve: pluginConfig ?? {},
			getConfiguredProvider: (providerId) => getRealtimeTranscriptionProvider(providerId, pluginConfig),
			listProviders: () => listRealtimeTranscriptionProviders(pluginConfig),
			resolveProviderConfig: ({ provider, cfg, rawConfig }) => provider.resolveConfig?.({
				cfg,
				rawConfig
			}) ?? rawConfig,
			isProviderConfigured: ({ provider, cfg, providerConfig }) => provider.isConfigured({
				cfg,
				providerConfig
			})
		});
		if (!resolution.ok && resolution.code === "missing-configured-provider") {
			console.warn(`[voice-call] Streaming enabled but realtime transcription provider "${resolution.configuredProviderId}" is not registered`);
			return;
		}
		if (!resolution.ok && resolution.code === "no-registered-provider") {
			console.warn("[voice-call] Streaming enabled but no realtime transcription provider is registered");
			return;
		}
		if (!resolution.ok) {
			console.warn(`[voice-call] Streaming enabled but provider "${resolution.provider?.id}" is not configured`);
			return;
		}
		this.mediaStreamHandler = new MediaStreamHandler({
			transcriptionProvider: resolution.provider,
			providerConfig: resolution.providerConfig,
			preStartTimeoutMs: streaming.preStartTimeoutMs,
			maxPendingConnections: streaming.maxPendingConnections,
			maxPendingConnectionsPerIp: streaming.maxPendingConnectionsPerIp,
			maxConnections: streaming.maxConnections,
			resolveClientIp: (request) => this.resolveMediaStreamClientIp(request),
			shouldAcceptStream: ({ callId, token }) => {
				if (!this.manager.getCallByProviderCallId(callId)) return false;
				if (this.provider.name === "twilio") {
					if (!this.provider.isValidStreamToken(callId, token)) {
						console.warn(`[voice-call] Rejecting media stream: invalid token for ${callId}`);
						return false;
					}
				}
				return true;
			},
			onTranscript: (providerCallId, transcript) => {
				const safeTranscript = sanitizeTranscriptForLog(transcript);
				console.log(`[voice-call] Transcript for ${providerCallId}: ${safeTranscript} (chars=${transcript.length})`);
				const call = this.manager.getCallByProviderCallId(providerCallId);
				if (!call) {
					console.warn(`[voice-call] No active call found for provider ID: ${providerCallId}`);
					return;
				}
				if (this.shouldSuppressBargeInForInitialMessage(call)) {
					console.log(`[voice-call] Ignoring barge transcript while initial message is still playing (${providerCallId})`);
					return;
				}
				if (this.provider.name === "twilio") this.provider.clearTtsQueue(providerCallId);
				const event = {
					id: `stream-transcript-${Date.now()}`,
					type: "call.speech",
					callId: call.callId,
					providerCallId,
					timestamp: Date.now(),
					transcript,
					isFinal: true
				};
				this.manager.processEvent(event);
				const callMode = call.metadata?.mode;
				if (call.direction === "inbound" || callMode === "conversation") this.handleInboundResponse(call.callId, transcript).catch((err) => {
					console.warn(`[voice-call] Failed to auto-respond:`, err);
				});
			},
			onSpeechStart: (providerCallId) => {
				if (this.provider.name !== "twilio") return;
				const call = this.manager.getCallByProviderCallId(providerCallId);
				if (this.shouldSuppressBargeInForInitialMessage(call)) return;
				this.provider.clearTtsQueue(providerCallId);
			},
			onPartialTranscript: (callId, partial) => {
				const safePartial = sanitizeTranscriptForLog(partial);
				console.log(`[voice-call] Partial for ${callId}: ${safePartial} (chars=${partial.length})`);
			},
			onConnect: (callId, streamSid) => {
				console.log(`[voice-call] Media stream connected: ${callId} -> ${streamSid}`);
				this.clearPendingDisconnectHangup(callId);
				if (this.provider.name === "twilio") this.provider.registerCallStream(callId, streamSid);
				this.manager.speakInitialMessage(callId).catch((err) => {
					console.warn(`[voice-call] Failed to speak initial message:`, err);
				});
			},
			onDisconnect: (callId, streamSid) => {
				console.log(`[voice-call] Media stream disconnected: ${callId} (${streamSid})`);
				if (this.provider.name === "twilio") this.provider.unregisterCallStream(callId, streamSid);
				this.clearPendingDisconnectHangup(callId);
				const timer = setTimeout(() => {
					this.pendingDisconnectHangups.delete(callId);
					const disconnectedCall = this.manager.getCallByProviderCallId(callId);
					if (!disconnectedCall) return;
					if (this.provider.name === "twilio") {
						if (this.provider.hasRegisteredStream(callId)) return;
					}
					console.log(`[voice-call] Auto-ending call ${disconnectedCall.callId} after stream disconnect grace`);
					this.manager.endCall(disconnectedCall.callId).catch((err) => {
						console.warn(`[voice-call] Failed to auto-end call ${disconnectedCall.callId}:`, err);
					});
				}, STREAM_DISCONNECT_HANGUP_GRACE_MS);
				timer.unref?.();
				this.pendingDisconnectHangups.set(callId, timer);
			}
		});
		console.log("[voice-call] Media streaming initialized");
	}
	/**
	* Start the webhook server.
	* Idempotent: returns immediately if the server is already listening.
	*/
	async start() {
		const { port, bind, path: webhookPath } = this.config.serve;
		const streamPath = this.config.streaming.streamPath;
		if (this.server?.listening) return this.listeningUrl ?? this.resolveListeningUrl(bind, webhookPath);
		if (this.config.streaming.enabled && !this.mediaStreamHandler) await this.initializeMediaStreaming();
		return new Promise((resolve, reject) => {
			this.server = http.createServer((req, res) => {
				this.handleRequest(req, res, webhookPath).catch((err) => {
					console.error("[voice-call] Webhook error:", err);
					res.statusCode = 500;
					res.end("Internal Server Error");
				});
			});
			if (this.realtimeHandler || this.mediaStreamHandler) this.server.on("upgrade", (request, socket, head) => {
				if (this.realtimeHandler && this.isRealtimeWebSocketUpgrade(request)) {
					this.realtimeHandler.handleWebSocketUpgrade(request, socket, head);
					return;
				}
				if (this.getUpgradePathname(request) === streamPath && this.mediaStreamHandler) this.mediaStreamHandler?.handleUpgrade(request, socket, head);
				else socket.destroy();
			});
			this.server.on("error", reject);
			this.server.listen(port, bind, () => {
				const url = this.resolveListeningUrl(bind, webhookPath);
				this.listeningUrl = url;
				console.log(`[voice-call] Webhook server listening on ${url}`);
				if (this.mediaStreamHandler) {
					const address = this.server?.address();
					const actualPort = address && typeof address === "object" ? address.port : this.config.serve.port;
					console.log(`[voice-call] Media stream WebSocket on ws://${bind}:${actualPort}${streamPath}`);
				}
				resolve(url);
				this.stopStaleCallReaper = startStaleCallReaper({
					manager: this.manager,
					staleCallReaperSeconds: this.config.staleCallReaperSeconds
				});
			});
		});
	}
	/**
	* Stop the webhook server.
	*/
	async stop() {
		for (const timer of this.pendingDisconnectHangups.values()) clearTimeout(timer);
		this.pendingDisconnectHangups.clear();
		this.webhookInFlightLimiter.clear();
		if (this.stopStaleCallReaper) {
			this.stopStaleCallReaper();
			this.stopStaleCallReaper = null;
		}
		return new Promise((resolve) => {
			if (this.server) this.server.close(() => {
				this.server = null;
				this.listeningUrl = null;
				resolve();
			});
			else {
				this.listeningUrl = null;
				resolve();
			}
		});
	}
	resolveListeningUrl(bind, webhookPath) {
		const address = this.server?.address();
		if (address && typeof address === "object") {
			const host = address.address && address.address.length > 0 ? address.address : bind;
			return `http://${host.includes(":") && !host.startsWith("[") ? `[${host}]` : host}:${address.port}${webhookPath}`;
		}
		return `http://${bind}:${this.config.serve.port}${webhookPath}`;
	}
	getUpgradePathname(request) {
		try {
			return buildRequestUrl(request.url, request.headers.host).pathname;
		} catch {
			return null;
		}
	}
	normalizeWebhookPathForMatch(pathname) {
		const trimmed = pathname.trim();
		if (!trimmed) return "/";
		const prefixed = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
		if (prefixed === "/") return prefixed;
		return prefixed.endsWith("/") ? prefixed.slice(0, -1) : prefixed;
	}
	isWebhookPathMatch(requestPath, configuredPath) {
		return this.normalizeWebhookPathForMatch(requestPath) === this.normalizeWebhookPathForMatch(configuredPath);
	}
	/**
	* Handle incoming HTTP request.
	*/
	async handleRequest(req, res, webhookPath) {
		const payload = await this.runWebhookPipeline(req, webhookPath);
		this.writeWebhookResponse(res, payload);
	}
	async runWebhookPipeline(req, webhookPath) {
		const url = buildRequestUrl(req.url, req.headers.host);
		if (url.pathname === "/voice/hold-music") return {
			statusCode: 200,
			headers: { "Content-Type": "text/xml" },
			body: `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">All agents are currently busy. Please hold.</Say>
  <Play loop="0">https://s3.amazonaws.com/com.twilio.music.classical/BusyStrings.mp3</Play>
</Response>`
		};
		if (!this.isWebhookPathMatch(url.pathname, webhookPath)) return {
			statusCode: 404,
			body: "Not Found"
		};
		if (req.method !== "POST") return {
			statusCode: 405,
			body: "Method Not Allowed"
		};
		const headerGate = this.verifyPreAuthWebhookHeaders(req.headers);
		if (!headerGate.ok) {
			console.warn(`[voice-call] Webhook rejected before body read: ${headerGate.reason}`);
			return {
				statusCode: 401,
				body: "Unauthorized"
			};
		}
		const inFlightKey = req.socket.remoteAddress ?? "";
		if (!this.webhookInFlightLimiter.tryAcquire(inFlightKey)) {
			console.warn(`[voice-call] Webhook rejected before body read: too many in-flight requests`);
			return {
				statusCode: 429,
				body: "Too Many Requests"
			};
		}
		try {
			let body = "";
			try {
				body = await this.readBody(req, MAX_WEBHOOK_BODY_BYTES, WEBHOOK_BODY_TIMEOUT_MS);
			} catch (err) {
				if (isRequestBodyLimitError(err, "PAYLOAD_TOO_LARGE")) return {
					statusCode: 413,
					body: "Payload Too Large"
				};
				if (isRequestBodyLimitError(err, "REQUEST_BODY_TIMEOUT")) return {
					statusCode: 408,
					body: requestBodyErrorToText("REQUEST_BODY_TIMEOUT")
				};
				throw err;
			}
			const ctx = {
				headers: req.headers,
				rawBody: body,
				url: url.toString(),
				method: "POST",
				query: Object.fromEntries(url.searchParams),
				remoteAddress: req.socket.remoteAddress ?? void 0
			};
			const verification = this.provider.verifyWebhook(ctx);
			if (!verification.ok) {
				console.warn(`[voice-call] Webhook verification failed: ${verification.reason}`);
				return {
					statusCode: 401,
					body: "Unauthorized"
				};
			}
			if (!verification.verifiedRequestKey) {
				console.warn("[voice-call] Webhook verification succeeded without request identity key");
				return {
					statusCode: 401,
					body: "Unauthorized"
				};
			}
			if (this.shouldShortCircuitToRealtimeTwiml(ctx)) return this.realtimeHandler.buildTwiMLPayload(req, new URLSearchParams(ctx.rawBody));
			const parsed = this.provider.parseWebhookEvent(ctx, { verifiedRequestKey: verification.verifiedRequestKey });
			if (verification.isReplay) console.warn("[voice-call] Replay detected; skipping event side effects");
			else this.processParsedEvents(parsed.events);
			return normalizeWebhookResponse(parsed);
		} finally {
			this.webhookInFlightLimiter.release(inFlightKey);
		}
	}
	verifyPreAuthWebhookHeaders(headers) {
		if (this.config.skipSignatureVerification) return { ok: true };
		switch (this.provider.name) {
			case "telnyx": {
				const signature = getHeader(headers, "telnyx-signature-ed25519");
				const timestamp = getHeader(headers, "telnyx-timestamp");
				if (signature && timestamp) return { ok: true };
				return {
					ok: false,
					reason: "missing Telnyx signature or timestamp header"
				};
			}
			case "twilio":
				if (getHeader(headers, "x-twilio-signature")) return { ok: true };
				return {
					ok: false,
					reason: "missing X-Twilio-Signature header"
				};
			case "plivo": {
				const hasV3 = Boolean(getHeader(headers, "x-plivo-signature-v3")) && Boolean(getHeader(headers, "x-plivo-signature-v3-nonce"));
				const hasV2 = Boolean(getHeader(headers, "x-plivo-signature-v2")) && Boolean(getHeader(headers, "x-plivo-signature-v2-nonce"));
				if (hasV3 || hasV2) return { ok: true };
				return {
					ok: false,
					reason: "missing Plivo signature headers"
				};
			}
			default: return { ok: true };
		}
	}
	isRealtimeWebSocketUpgrade(req) {
		try {
			const pathname = buildRequestUrl(req.url, req.headers.host).pathname;
			const pattern = this.realtimeHandler?.getStreamPathPattern();
			return Boolean(pattern && pathname.startsWith(pattern));
		} catch {
			return false;
		}
	}
	shouldShortCircuitToRealtimeTwiml(ctx) {
		if (!this.realtimeHandler || this.provider.name !== "twilio") return false;
		const params = new URLSearchParams(ctx.rawBody);
		const direction = params.get("Direction");
		if (!(!direction || direction === "inbound")) return false;
		if (ctx.query?.type === "status") return false;
		const callStatus = params.get("CallStatus");
		if (callStatus && isProviderStatusTerminal(callStatus)) return false;
		return !params.get("SpeechResult") && !params.get("Digits");
	}
	processParsedEvents(events) {
		for (const event of events) try {
			this.manager.processEvent(event);
		} catch (err) {
			console.error(`[voice-call] Error processing event ${event.type}:`, err);
		}
	}
	writeWebhookResponse(res, payload) {
		res.statusCode = payload.statusCode;
		if (payload.headers) for (const [key, value] of Object.entries(payload.headers)) res.setHeader(key, value);
		res.end(payload.body);
	}
	/**
	* Read request body as string with timeout protection.
	*/
	readBody(req, maxBytes, timeoutMs = WEBHOOK_BODY_TIMEOUT_MS) {
		return readRequestBodyWithLimit(req, {
			maxBytes,
			timeoutMs
		});
	}
	/**
	* Handle auto-response for inbound calls using the agent system.
	* Supports tool calling for richer voice interactions.
	*/
	async handleInboundResponse(callId, userMessage) {
		console.log(`[voice-call] Auto-responding to inbound call ${callId}: "${userMessage}"`);
		const call = this.manager.getCall(callId);
		if (!call) {
			console.warn(`[voice-call] Call ${callId} not found for auto-response`);
			return;
		}
		if (!this.coreConfig) {
			console.warn("[voice-call] Core config missing; skipping auto-response");
			return;
		}
		if (!this.agentRuntime) {
			console.warn("[voice-call] Agent runtime missing; skipping auto-response");
			return;
		}
		try {
			const { generateVoiceResponse } = await import("./response-generator-CUj6Uer8.js");
			const result = await generateVoiceResponse({
				voiceConfig: this.config,
				coreConfig: this.coreConfig,
				agentRuntime: this.agentRuntime,
				callId,
				from: call.from,
				transcript: call.transcript,
				userMessage
			});
			if (result.error) {
				console.error(`[voice-call] Response generation error: ${result.error}`);
				return;
			}
			if (result.text) {
				console.log(`[voice-call] AI response: "${result.text}"`);
				await this.manager.speak(callId, result.text);
			}
		} catch (err) {
			console.error(`[voice-call] Auto-response error:`, err);
		}
	}
};
//#endregion
//#region extensions/voice-call/src/runtime.ts
function createRuntimeResourceLifecycle(params) {
	let tunnelResult = null;
	let stopped = false;
	const runStep = async (step, suppressErrors) => {
		if (suppressErrors) {
			await step().catch(() => {});
			return;
		}
		await step();
	};
	return {
		setTunnelResult: (result) => {
			tunnelResult = result;
		},
		stop: async (opts) => {
			if (stopped) return;
			stopped = true;
			const suppressErrors = opts?.suppressErrors ?? false;
			await runStep(async () => {
				if (tunnelResult) await tunnelResult.stop();
			}, suppressErrors);
			await runStep(async () => {
				await cleanupTailscaleExposure(params.config);
			}, suppressErrors);
			await runStep(async () => {
				await params.webhookServer.stop();
			}, suppressErrors);
		}
	};
}
function isLoopbackBind(bind) {
	if (!bind) return false;
	return bind === "127.0.0.1" || bind === "::1" || bind === "localhost";
}
async function resolveProvider(config) {
	const allowNgrokFreeTierLoopbackBypass = config.tunnel?.provider === "ngrok" && isLoopbackBind(config.serve?.bind) && (config.tunnel?.allowNgrokFreeTierLoopbackBypass ?? false);
	switch (config.provider) {
		case "telnyx": {
			const { TelnyxProvider } = await import("./telnyx-Dx6AtjKC.js");
			return new TelnyxProvider({
				apiKey: config.telnyx?.apiKey,
				connectionId: config.telnyx?.connectionId,
				publicKey: config.telnyx?.publicKey
			}, { skipVerification: config.skipSignatureVerification });
		}
		case "twilio": {
			const { TwilioProvider } = await import("./twilio-B4pHSpnr.js");
			return new TwilioProvider({
				accountSid: config.twilio?.accountSid,
				authToken: config.twilio?.authToken
			}, {
				allowNgrokFreeTierLoopbackBypass,
				publicUrl: config.publicUrl,
				skipVerification: config.skipSignatureVerification,
				streamPath: config.streaming?.enabled ? config.streaming.streamPath : void 0,
				webhookSecurity: config.webhookSecurity
			});
		}
		case "plivo": {
			const { PlivoProvider } = await import("./plivo-CzKjahL2.js");
			return new PlivoProvider({
				authId: config.plivo?.authId,
				authToken: config.plivo?.authToken
			}, {
				publicUrl: config.publicUrl,
				skipVerification: config.skipSignatureVerification,
				ringTimeoutSec: Math.max(1, Math.floor(config.ringTimeoutMs / 1e3)),
				webhookSecurity: config.webhookSecurity
			});
		}
		case "mock": {
			const { MockProvider } = await import("./mock-DQCKz3yZ.js");
			return new MockProvider();
		}
		default: throw new Error(`Unsupported voice-call provider: ${String(config.provider)}`);
	}
}
async function resolveRealtimeProvider(params) {
	const { getRealtimeVoiceProvider, listRealtimeVoiceProviders } = await import("./realtime-voice.runtime-BPEr6jzc.js");
	const resolution = resolveConfiguredCapabilityProvider({
		configuredProviderId: params.config.realtime.provider,
		providerConfigs: params.config.realtime.providers,
		cfg: params.fullConfig,
		cfgForResolve: params.fullConfig,
		getConfiguredProvider: (providerId) => getRealtimeVoiceProvider(providerId, params.fullConfig),
		listProviders: () => listRealtimeVoiceProviders(params.fullConfig),
		resolveProviderConfig: ({ provider, cfg, rawConfig }) => provider.resolveConfig?.({
			cfg,
			rawConfig
		}) ?? rawConfig,
		isProviderConfigured: ({ provider, cfg, providerConfig }) => provider.isConfigured({
			cfg,
			providerConfig
		})
	});
	if (!resolution.ok && resolution.code === "missing-configured-provider") throw new Error(`Realtime voice provider "${resolution.configuredProviderId}" is not registered`);
	if (!resolution.ok && resolution.code === "no-registered-provider") throw new Error("No realtime voice provider registered");
	if (!resolution.ok) throw new Error(`Realtime voice provider "${resolution.provider?.id}" is not configured`);
	return {
		provider: resolution.provider,
		providerConfig: resolution.providerConfig
	};
}
async function createVoiceCallRuntime(params) {
	const { config: rawConfig, coreConfig, fullConfig, agentRuntime, ttsRuntime, logger } = params;
	const log = logger ?? {
		info: console.log,
		warn: console.warn,
		error: console.error,
		debug: console.debug
	};
	const config = resolveVoiceCallConfig(rawConfig);
	if (!config.enabled) throw new Error("Voice call disabled. Enable the plugin entry in config.");
	if (config.skipSignatureVerification) log.warn("[voice-call] SECURITY WARNING: skipSignatureVerification=true disables webhook signature verification (development only). Do not use in production.");
	const validation = validateProviderConfig(config);
	if (!validation.valid) throw new Error(`Invalid voice-call config: ${validation.errors.join("; ")}`);
	const provider = await resolveProvider(config);
	const manager = new CallManager(config);
	const realtimeProvider = config.realtime.enabled ? await resolveRealtimeProvider({
		config,
		fullConfig: fullConfig ?? coreConfig
	}) : null;
	const webhookServer = new VoiceCallWebhookServer(config, manager, provider, coreConfig, fullConfig ?? coreConfig, agentRuntime);
	if (realtimeProvider) {
		const { RealtimeCallHandler } = await import("./realtime-handler-CTBnn3Ju.js");
		webhookServer.setRealtimeHandler(new RealtimeCallHandler(config.realtime, manager, provider, realtimeProvider.provider, realtimeProvider.providerConfig, config.serve.path));
	}
	const lifecycle = createRuntimeResourceLifecycle({
		config,
		webhookServer
	});
	const localUrl = await webhookServer.start();
	try {
		let publicUrl = config.publicUrl ?? null;
		if (!publicUrl && config.tunnel?.provider && config.tunnel.provider !== "none") try {
			const nextTunnelResult = await startTunnel({
				provider: config.tunnel.provider,
				port: config.serve.port,
				path: config.serve.path,
				ngrokAuthToken: config.tunnel.ngrokAuthToken,
				ngrokDomain: config.tunnel.ngrokDomain
			});
			lifecycle.setTunnelResult(nextTunnelResult);
			publicUrl = nextTunnelResult?.publicUrl ?? null;
		} catch (err) {
			log.error(`[voice-call] Tunnel setup failed: ${formatErrorMessage(err)}`);
		}
		if (!publicUrl && config.tailscale?.mode !== "off") publicUrl = await setupTailscaleExposure(config);
		const webhookUrl = publicUrl ?? localUrl;
		if (publicUrl && provider.name === "twilio") provider.setPublicUrl(publicUrl);
		if (publicUrl && realtimeProvider) webhookServer.getRealtimeHandler()?.setPublicUrl(publicUrl);
		if (provider.name === "twilio" && config.streaming?.enabled) {
			const twilioProvider = provider;
			if (ttsRuntime?.textToSpeechTelephony) try {
				const ttsProvider = createTelephonyTtsProvider({
					coreConfig,
					ttsOverride: config.tts,
					runtime: ttsRuntime,
					logger: log
				});
				twilioProvider.setTTSProvider(ttsProvider);
				log.info("[voice-call] Telephony TTS provider configured");
			} catch (err) {
				log.warn(`[voice-call] Failed to initialize telephony TTS: ${formatErrorMessage(err)}`);
			}
			else log.warn("[voice-call] Telephony TTS unavailable; streaming TTS disabled");
			const mediaHandler = webhookServer.getMediaStreamHandler();
			if (mediaHandler) {
				twilioProvider.setMediaStreamHandler(mediaHandler);
				log.info("[voice-call] Media stream handler wired to provider");
			}
		}
		if (realtimeProvider) log.info(`[voice-call] Realtime voice provider: ${realtimeProvider.provider.id}`);
		await manager.initialize(provider, webhookUrl);
		const stop = async () => await lifecycle.stop();
		log.info("[voice-call] Runtime initialized");
		log.info(`[voice-call] Webhook URL: ${webhookUrl}`);
		if (publicUrl) log.info(`[voice-call] Public URL: ${publicUrl}`);
		return {
			config,
			provider,
			manager,
			webhookServer,
			webhookUrl,
			publicUrl,
			stop
		};
	} catch (err) {
		await lifecycle.stop({ suppressErrors: true });
		throw err;
	}
}
//#endregion
export { resolveUserPath as a, setupTailscaleExposureRoute as i, cleanupTailscaleExposureRoute as n, getTailscaleSelfInfo as r, createVoiceCallRuntime as t };
