import { c as normalizeOptionalString, s as normalizeOptionalLowercaseString } from "../../string-coerce-Bje8XVt9.js";
import { i as formatErrorMessage } from "../../errors-CDFVCV9D.js";
import { _ as sleep } from "../../utils-DvkbxKCZ.js";
import "../../text-runtime-DfALcXL5.js";
import { t as definePluginEntry } from "../../plugin-entry-BBPiA0af.js";
import "../../error-runtime-CrtIwOpQ.js";
import "../../api-BpZsjPsQ.js";
import { i as validateProviderConfig, r as resolveVoiceCallConfig } from "../../config-dq8yIvtn.js";
import { a as resolveUserPath, i as setupTailscaleExposureRoute, n as cleanupTailscaleExposureRoute, r as getTailscaleSelfInfo, t as createVoiceCallRuntime } from "../../runtime-entry-E00TPeAl.js";
import { i as parseVoiceCallPluginConfig, r as normalizeVoiceCallLegacyConfigInput, t as formatVoiceCallLegacyConfigWarnings } from "../../config-compat-CMK0r75q.js";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { format } from "node:util";
import { Type } from "typebox";
//#region extensions/voice-call/src/cli.ts
function writeStdoutLine(...values) {
	process.stdout.write(`${format(...values)}\n`);
}
function writeStdoutJson(value) {
	process.stdout.write(`${JSON.stringify(value, null, 2)}\n`);
}
function resolveMode(input) {
	const raw = normalizeOptionalLowercaseString(input) ?? "";
	if (raw === "serve" || raw === "off") return raw;
	return "funnel";
}
function resolveDefaultStorePath(config) {
	const resolvedPreferred = resolveUserPath(path.join(os.homedir(), ".openclaw", "voice-calls"));
	const existing = [resolvedPreferred].find((dir) => {
		try {
			return fs.existsSync(path.join(dir, "calls.jsonl")) || fs.existsSync(dir);
		} catch {
			return false;
		}
	}) ?? resolvedPreferred;
	const base = config.store?.trim() ? resolveUserPath(config.store) : existing;
	return path.join(base, "calls.jsonl");
}
function percentile(values, p) {
	if (values.length === 0) return 0;
	const sorted = [...values].toSorted((a, b) => a - b);
	return sorted[Math.min(sorted.length - 1, Math.max(0, Math.ceil(p / 100 * sorted.length) - 1))] ?? 0;
}
function summarizeSeries(values) {
	if (values.length === 0) return {
		count: 0,
		minMs: 0,
		maxMs: 0,
		avgMs: 0,
		p50Ms: 0,
		p95Ms: 0
	};
	const minMs = values.reduce((min, value) => value < min ? value : min, Number.POSITIVE_INFINITY);
	const maxMs = values.reduce((max, value) => value > max ? value : max, Number.NEGATIVE_INFINITY);
	const avgMs = values.reduce((sum, value) => sum + value, 0) / values.length;
	return {
		count: values.length,
		minMs,
		maxMs,
		avgMs,
		p50Ms: percentile(values, 50),
		p95Ms: percentile(values, 95)
	};
}
function resolveCallMode(mode) {
	return mode === "notify" || mode === "conversation" ? mode : void 0;
}
function hasPublicExposure(config) {
	return Boolean(config.publicUrl || config.tunnel?.provider && config.tunnel.provider !== "none" || config.tailscale?.mode && config.tailscale.mode !== "off");
}
function buildSetupStatus(config) {
	const validation = validateProviderConfig(config);
	const checks = [
		{
			id: "plugin-enabled",
			ok: config.enabled,
			message: config.enabled ? "Voice Call plugin is enabled" : "Enable plugins.entries.voice-call.enabled"
		},
		{
			id: "provider",
			ok: Boolean(config.provider),
			message: config.provider ? `Provider configured: ${config.provider}` : "Set plugins.entries.voice-call.config.provider"
		},
		{
			id: "provider-config",
			ok: validation.valid,
			message: validation.valid ? "Provider credentials/config look complete" : validation.errors.join("; ")
		},
		{
			id: "webhook-exposure",
			ok: config.provider === "mock" || hasPublicExposure(config),
			message: config.provider === "mock" ? "Mock provider does not need a public webhook" : hasPublicExposure(config) ? config.publicUrl ? `Public webhook URL configured: ${config.publicUrl}` : "Webhook exposure configured through tunnel or Tailscale" : "Set publicUrl or configure tunnel/tailscale so the provider can reach webhooks"
		},
		{
			id: "mode",
			ok: !(config.streaming.enabled && config.realtime.enabled),
			message: config.streaming.enabled && config.realtime.enabled ? "streaming.enabled and realtime.enabled cannot both be true" : config.realtime.enabled ? `Realtime voice enabled (${config.realtime.provider ?? "first registered provider"})` : config.streaming.enabled ? `Streaming transcription enabled (${config.streaming.provider ?? "first registered provider"})` : "Notify/conversation calls use normal TTS/STT flow"
		}
	];
	return {
		ok: checks.every((check) => check.ok),
		checks
	};
}
function writeSetupStatus(status) {
	writeStdoutLine("Voice Call setup: %s", status.ok ? "OK" : "needs attention");
	for (const check of status.checks) writeStdoutLine("%s %s: %s", check.ok ? "OK" : "FAIL", check.id, check.message);
}
async function initiateCallAndPrintId(params) {
	const result = await params.runtime.manager.initiateCall(params.to, void 0, {
		message: params.message,
		mode: resolveCallMode(params.mode)
	});
	if (!result.success) throw new Error(result.error || "initiate failed");
	writeStdoutJson({ callId: result.callId });
}
function registerVoiceCallCli(params) {
	const { program, config, ensureRuntime, logger } = params;
	const root = program.command("voicecall").description("Voice call utilities").addHelpText("after", () => `\nDocs: https://docs.openclaw.ai/cli/voicecall\n`);
	root.command("setup").description("Show Voice Call provider and webhook setup status").option("--json", "Print machine-readable JSON").action((options) => {
		const status = buildSetupStatus(config);
		if (options.json) {
			writeStdoutJson(status);
			return;
		}
		writeSetupStatus(status);
	});
	root.command("smoke").description("Check Voice Call readiness and optionally place a short outbound test call").option("-t, --to <phone>", "Phone number to call for a live smoke").option("--message <text>", "Message to speak during the smoke call", "OpenClaw voice call smoke test.").option("--mode <mode>", "Call mode: notify or conversation", "notify").option("--yes", "Actually place the live outbound call").option("--json", "Print machine-readable JSON").action(async (options) => {
		const setup = buildSetupStatus(config);
		if (!setup.ok) {
			if (options.json) writeStdoutJson({
				ok: false,
				setup
			});
			else writeSetupStatus(setup);
			process.exitCode = 1;
			return;
		}
		if (!options.to) {
			if (options.json) writeStdoutJson({
				ok: true,
				setup,
				liveCall: false
			});
			else {
				writeSetupStatus(setup);
				writeStdoutLine("live-call: skipped (pass --to and --yes to place one)");
			}
			return;
		}
		if (!options.yes) {
			if (options.json) writeStdoutJson({
				ok: true,
				setup,
				liveCall: false,
				wouldCall: options.to
			});
			else {
				writeSetupStatus(setup);
				writeStdoutLine("live-call: dry run for %s (add --yes to place it)", options.to);
			}
			return;
		}
		const result = await (await ensureRuntime()).manager.initiateCall(options.to, void 0, {
			message: options.message,
			mode: resolveCallMode(options.mode) ?? "notify"
		});
		if (!result.success) throw new Error(result.error || "smoke call failed");
		if (options.json) {
			writeStdoutJson({
				ok: true,
				setup,
				liveCall: true,
				callId: result.callId
			});
			return;
		}
		writeSetupStatus(setup);
		writeStdoutLine("live-call: started %s", result.callId);
	});
	root.command("call").description("Initiate an outbound voice call").requiredOption("-m, --message <text>", "Message to speak when call connects").option("-t, --to <phone>", "Phone number to call (E.164 format, uses config toNumber if not set)").option("--mode <mode>", "Call mode: notify (hangup after message) or conversation (stay open)", "conversation").action(async (options) => {
		const rt = await ensureRuntime();
		const to = options.to ?? rt.config.toNumber;
		if (!to) throw new Error("Missing --to and no toNumber configured");
		await initiateCallAndPrintId({
			runtime: rt,
			to,
			message: options.message,
			mode: options.mode
		});
	});
	root.command("start").description("Alias for voicecall call").requiredOption("--to <phone>", "Phone number to call").option("--message <text>", "Message to speak when call connects").option("--mode <mode>", "Call mode: notify (hangup after message) or conversation (stay open)", "conversation").action(async (options) => {
		await initiateCallAndPrintId({
			runtime: await ensureRuntime(),
			to: options.to,
			message: options.message,
			mode: options.mode
		});
	});
	root.command("continue").description("Speak a message and wait for a response").requiredOption("--call-id <id>", "Call ID").requiredOption("--message <text>", "Message to speak").action(async (options) => {
		const result = await (await ensureRuntime()).manager.continueCall(options.callId, options.message);
		if (!result.success) throw new Error(result.error || "continue failed");
		writeStdoutJson(result);
	});
	root.command("speak").description("Speak a message without waiting for response").requiredOption("--call-id <id>", "Call ID").requiredOption("--message <text>", "Message to speak").action(async (options) => {
		const result = await (await ensureRuntime()).manager.speak(options.callId, options.message);
		if (!result.success) throw new Error(result.error || "speak failed");
		writeStdoutJson(result);
	});
	root.command("dtmf").description("Send DTMF digits to an active call").requiredOption("--call-id <id>", "Call ID").requiredOption("--digits <digits>", "DTMF digits").action(async (options) => {
		const result = await (await ensureRuntime()).manager.sendDtmf(options.callId, options.digits);
		if (!result.success) throw new Error(result.error || "dtmf failed");
		writeStdoutJson(result);
	});
	root.command("end").description("Hang up an active call").requiredOption("--call-id <id>", "Call ID").action(async (options) => {
		const result = await (await ensureRuntime()).manager.endCall(options.callId);
		if (!result.success) throw new Error(result.error || "end failed");
		writeStdoutJson(result);
	});
	root.command("status").description("Show call status").requiredOption("--call-id <id>", "Call ID").action(async (options) => {
		writeStdoutJson((await ensureRuntime()).manager.getCall(options.callId) ?? { found: false });
	});
	root.command("tail").description("Tail voice-call JSONL logs (prints new lines; useful during provider tests)").option("--file <path>", "Path to calls.jsonl", resolveDefaultStorePath(config)).option("--since <n>", "Print last N lines first", "25").option("--poll <ms>", "Poll interval in ms", "250").action(async (options) => {
		const file = options.file;
		const since = Math.max(0, Number(options.since ?? 0));
		const pollMs = Math.max(50, Number(options.poll ?? 250));
		if (!fs.existsSync(file)) {
			logger.error(`No log file at ${file}`);
			process.exit(1);
		}
		const initial = fs.readFileSync(file, "utf8");
		const lines = initial.split("\n").filter(Boolean);
		for (const line of lines.slice(Math.max(0, lines.length - since))) writeStdoutLine(line);
		let offset = Buffer.byteLength(initial, "utf8");
		for (;;) {
			try {
				const stat = fs.statSync(file);
				if (stat.size < offset) offset = 0;
				if (stat.size > offset) {
					const fd = fs.openSync(file, "r");
					try {
						const buf = Buffer.alloc(stat.size - offset);
						fs.readSync(fd, buf, 0, buf.length, offset);
						offset = stat.size;
						const text = buf.toString("utf8");
						for (const line of text.split("\n").filter(Boolean)) writeStdoutLine(line);
					} finally {
						fs.closeSync(fd);
					}
				}
			} catch {}
			await sleep(pollMs);
		}
	});
	root.command("latency").description("Summarize turn latency metrics from voice-call JSONL logs").option("--file <path>", "Path to calls.jsonl", resolveDefaultStorePath(config)).option("--last <n>", "Analyze last N records", "200").action(async (options) => {
		const file = options.file;
		const last = Math.max(1, Number(options.last ?? 200));
		if (!fs.existsSync(file)) throw new Error("No log file at " + file);
		const lines = fs.readFileSync(file, "utf8").split("\n").filter(Boolean).slice(-last);
		const turnLatencyMs = [];
		const listenWaitMs = [];
		for (const line of lines) try {
			const parsed = JSON.parse(line);
			const latency = parsed.metadata?.lastTurnLatencyMs;
			const listenWait = parsed.metadata?.lastTurnListenWaitMs;
			if (typeof latency === "number" && Number.isFinite(latency)) turnLatencyMs.push(latency);
			if (typeof listenWait === "number" && Number.isFinite(listenWait)) listenWaitMs.push(listenWait);
		} catch {}
		writeStdoutJson({
			recordsScanned: lines.length,
			turnLatency: summarizeSeries(turnLatencyMs),
			listenWait: summarizeSeries(listenWaitMs)
		});
	});
	root.command("expose").description("Enable/disable Tailscale serve/funnel for the webhook").option("--mode <mode>", "off | serve (tailnet) | funnel (public)", "funnel").option("--path <path>", "Tailscale path to expose (recommend matching serve.path)").option("--port <port>", "Local webhook port").option("--serve-path <path>", "Local webhook path").action(async (options) => {
		const mode = resolveMode(options.mode ?? "funnel");
		const servePort = Number(options.port ?? config.serve.port ?? 3334);
		const servePath = options.servePath ?? config.serve.path ?? "/voice/webhook";
		const tsPath = options.path ?? config.tailscale?.path ?? servePath;
		const localUrl = `http://127.0.0.1:${servePort}`;
		if (mode === "off") {
			await cleanupTailscaleExposureRoute({
				mode: "serve",
				path: tsPath
			});
			await cleanupTailscaleExposureRoute({
				mode: "funnel",
				path: tsPath
			});
			writeStdoutJson({
				ok: true,
				mode: "off",
				path: tsPath
			});
			return;
		}
		const publicUrl = await setupTailscaleExposureRoute({
			mode,
			path: tsPath,
			localUrl
		});
		const tsInfo = publicUrl ? null : await getTailscaleSelfInfo();
		const enableUrl = tsInfo?.nodeId ? `https://login.tailscale.com/f/${mode}?node=${tsInfo.nodeId}` : null;
		writeStdoutJson({
			ok: Boolean(publicUrl),
			mode,
			path: tsPath,
			localUrl,
			publicUrl,
			hint: publicUrl ? void 0 : {
				note: "Tailscale serve/funnel may be disabled on this tailnet (or require admin enable).",
				enableUrl
			}
		});
	});
}
//#endregion
//#region extensions/voice-call/index.ts
const voiceCallConfigSchema = {
	parse(value) {
		const normalized = normalizeVoiceCallLegacyConfigInput(value);
		const enabled = typeof normalized.enabled === "boolean" ? normalized.enabled : true;
		return parseVoiceCallPluginConfig({
			...normalized,
			enabled,
			provider: normalized.provider ?? (enabled ? "mock" : void 0)
		});
	},
	uiHints: {
		provider: {
			label: "Provider",
			help: "Use twilio, telnyx, or mock for dev/no-network."
		},
		fromNumber: {
			label: "From Number",
			placeholder: "+15550001234"
		},
		toNumber: {
			label: "Default To Number",
			placeholder: "+15550001234"
		},
		inboundPolicy: { label: "Inbound Policy" },
		allowFrom: { label: "Inbound Allowlist" },
		inboundGreeting: {
			label: "Inbound Greeting",
			advanced: true
		},
		"telnyx.apiKey": {
			label: "Telnyx API Key",
			sensitive: true
		},
		"telnyx.connectionId": { label: "Telnyx Connection ID" },
		"telnyx.publicKey": {
			label: "Telnyx Public Key",
			sensitive: true
		},
		"twilio.accountSid": { label: "Twilio Account SID" },
		"twilio.authToken": {
			label: "Twilio Auth Token",
			sensitive: true
		},
		"outbound.defaultMode": { label: "Default Call Mode" },
		"outbound.notifyHangupDelaySec": {
			label: "Notify Hangup Delay (sec)",
			advanced: true
		},
		"serve.port": { label: "Webhook Port" },
		"serve.bind": { label: "Webhook Bind" },
		"serve.path": { label: "Webhook Path" },
		"tailscale.mode": {
			label: "Tailscale Mode",
			advanced: true
		},
		"tailscale.path": {
			label: "Tailscale Path",
			advanced: true
		},
		"tunnel.provider": {
			label: "Tunnel Provider",
			advanced: true
		},
		"tunnel.ngrokAuthToken": {
			label: "ngrok Auth Token",
			sensitive: true,
			advanced: true
		},
		"tunnel.ngrokDomain": {
			label: "ngrok Domain",
			advanced: true
		},
		"tunnel.allowNgrokFreeTierLoopbackBypass": {
			label: "Allow ngrok Free Tier (Loopback Bypass)",
			advanced: true
		},
		"streaming.enabled": {
			label: "Enable Streaming",
			advanced: true
		},
		"streaming.provider": {
			label: "Streaming Provider",
			help: "Uses the first registered realtime transcription provider when unset.",
			advanced: true
		},
		"streaming.providers": {
			label: "Streaming Provider Config",
			advanced: true
		},
		"streaming.streamPath": {
			label: "Media Stream Path",
			advanced: true
		},
		"realtime.enabled": {
			label: "Enable Realtime Voice",
			advanced: true
		},
		"realtime.provider": {
			label: "Realtime Voice Provider",
			help: "Uses the first registered realtime voice provider when unset.",
			advanced: true
		},
		"realtime.streamPath": {
			label: "Realtime Stream Path",
			advanced: true
		},
		"realtime.instructions": {
			label: "Realtime Instructions",
			advanced: true
		},
		"realtime.toolPolicy": {
			label: "Realtime Tool Policy",
			help: "Controls the shared openclaw_agent_consult tool.",
			advanced: true
		},
		"realtime.providers": {
			label: "Realtime Provider Config",
			advanced: true
		},
		"tts.provider": {
			label: "TTS Provider Override",
			help: "Deep-merges with messages.tts (Microsoft is ignored for calls).",
			advanced: true
		},
		"tts.providers": {
			label: "TTS Provider Config",
			advanced: true
		},
		publicUrl: {
			label: "Public Webhook URL",
			advanced: true
		},
		skipSignatureVerification: {
			label: "Skip Signature Verification",
			advanced: true
		},
		store: {
			label: "Call Log Store Path",
			advanced: true
		},
		agentId: {
			label: "Response Agent ID",
			help: "Agent workspace used for voice response generation. Defaults to \"main\".",
			advanced: true
		},
		responseModel: {
			label: "Response Model",
			help: "Optional override. Falls back to the runtime default model when unset.",
			advanced: true
		},
		responseSystemPrompt: {
			label: "Response System Prompt",
			advanced: true
		},
		responseTimeoutMs: {
			label: "Response Timeout (ms)",
			advanced: true
		}
	}
};
const VoiceCallToolSchema = Type.Union([
	Type.Object({
		action: Type.Literal("initiate_call"),
		to: Type.Optional(Type.String({ description: "Call target" })),
		message: Type.String({ description: "Intro message" }),
		mode: Type.Optional(Type.Union([Type.Literal("notify"), Type.Literal("conversation")]))
	}),
	Type.Object({
		action: Type.Literal("continue_call"),
		callId: Type.String({ description: "Call ID" }),
		message: Type.String({ description: "Follow-up message" })
	}),
	Type.Object({
		action: Type.Literal("speak_to_user"),
		callId: Type.String({ description: "Call ID" }),
		message: Type.String({ description: "Message to speak" })
	}),
	Type.Object({
		action: Type.Literal("send_dtmf"),
		callId: Type.String({ description: "Call ID" }),
		digits: Type.String({ description: "DTMF digits to send" })
	}),
	Type.Object({
		action: Type.Literal("end_call"),
		callId: Type.String({ description: "Call ID" })
	}),
	Type.Object({
		action: Type.Literal("get_status"),
		callId: Type.String({ description: "Call ID" })
	}),
	Type.Object({
		mode: Type.Optional(Type.Union([Type.Literal("call"), Type.Literal("status")])),
		to: Type.Optional(Type.String({ description: "Call target" })),
		sid: Type.Optional(Type.String({ description: "Call SID" })),
		message: Type.Optional(Type.String({ description: "Optional intro message" }))
	})
]);
function asParamRecord(params) {
	return params && typeof params === "object" && !Array.isArray(params) ? params : {};
}
const VOICE_CALL_RUNTIME_KEY = Symbol.for("openclaw.voice-call.runtime");
const VOICE_CALL_RUNTIME_PROMISE_KEY = Symbol.for("openclaw.voice-call.runtimePromise");
const VOICE_CALL_RUNTIME_STOP_PROMISE_KEY = Symbol.for("openclaw.voice-call.runtimeStopPromise");
function getVoiceCallRuntimeGlobalState() {
	const state = globalThis;
	state[VOICE_CALL_RUNTIME_KEY] ??= null;
	state[VOICE_CALL_RUNTIME_PROMISE_KEY] ??= null;
	state[VOICE_CALL_RUNTIME_STOP_PROMISE_KEY] ??= null;
	return state;
}
var voice_call_default = definePluginEntry({
	id: "voice-call",
	name: "Voice Call",
	description: "Voice-call plugin with Telnyx/Twilio/Plivo providers",
	configSchema: voiceCallConfigSchema,
	register(api) {
		const config = resolveVoiceCallConfig(voiceCallConfigSchema.parse(api.pluginConfig));
		const validation = validateProviderConfig(config);
		if (api.pluginConfig && typeof api.pluginConfig === "object") for (const warning of formatVoiceCallLegacyConfigWarnings({
			value: api.pluginConfig,
			configPathPrefix: "plugins.entries.voice-call.config",
			doctorFixCommand: "openclaw doctor --fix"
		})) api.logger.warn(warning);
		const runtimeState = getVoiceCallRuntimeGlobalState();
		const ensureRuntime = async () => {
			if (!config.enabled) throw new Error("Voice call disabled in plugin config");
			if (!validation.valid) throw new Error(validation.errors.join("; "));
			while (true) {
				if (runtimeState[VOICE_CALL_RUNTIME_STOP_PROMISE_KEY]) {
					await runtimeState[VOICE_CALL_RUNTIME_STOP_PROMISE_KEY];
					continue;
				}
				const runtime = runtimeState[VOICE_CALL_RUNTIME_KEY];
				if (runtime) return runtime;
				let runtimePromise = runtimeState[VOICE_CALL_RUNTIME_PROMISE_KEY];
				if (!runtimePromise) {
					runtimePromise = createVoiceCallRuntime({
						config,
						coreConfig: api.config,
						fullConfig: api.config,
						agentRuntime: api.runtime.agent,
						ttsRuntime: api.runtime.tts,
						logger: api.logger
					});
					runtimeState[VOICE_CALL_RUNTIME_PROMISE_KEY] = runtimePromise;
				}
				try {
					const createdRuntime = await runtimePromise;
					if (runtimeState[VOICE_CALL_RUNTIME_STOP_PROMISE_KEY]) continue;
					if (runtimeState[VOICE_CALL_RUNTIME_PROMISE_KEY] !== runtimePromise) continue;
					runtimeState[VOICE_CALL_RUNTIME_KEY] = createdRuntime;
					return createdRuntime;
				} catch (err) {
					if (runtimeState[VOICE_CALL_RUNTIME_PROMISE_KEY] === runtimePromise) {
						runtimeState[VOICE_CALL_RUNTIME_PROMISE_KEY] = null;
						runtimeState[VOICE_CALL_RUNTIME_KEY] = null;
					}
					throw err;
				}
			}
		};
		const sendError = (respond, err) => {
			respond(false, { error: formatErrorMessage(err) });
		};
		const resolveCallMessageRequest = async (params) => {
			const callId = normalizeOptionalString(params?.callId) ?? "";
			const message = normalizeOptionalString(params?.message) ?? "";
			if (!callId || !message) return { error: "callId and message required" };
			return {
				rt: await ensureRuntime(),
				callId,
				message
			};
		};
		const initiateCallAndRespond = async (params) => {
			const result = await params.rt.manager.initiateCall(params.to, void 0, {
				message: params.message,
				mode: params.mode
			});
			if (!result.success) {
				params.respond(false, { error: result.error || "initiate failed" });
				return;
			}
			params.respond(true, {
				callId: result.callId,
				initiated: true
			});
		};
		const respondToCallMessageAction = async (params) => {
			const request = await resolveCallMessageRequest(params.requestParams);
			if ("error" in request) {
				params.respond(false, { error: request.error });
				return;
			}
			const result = await params.action(request);
			if (!result.success) {
				params.respond(false, { error: result.error || params.failure });
				return;
			}
			params.respond(true, params.includeTranscript ? {
				success: true,
				transcript: result.transcript
			} : { success: true });
		};
		api.registerGatewayMethod("voicecall.initiate", async ({ params, respond }) => {
			try {
				const message = normalizeOptionalString(params?.message) ?? "";
				if (!message) {
					respond(false, { error: "message required" });
					return;
				}
				const rt = await ensureRuntime();
				const to = normalizeOptionalString(params?.to) ?? rt.config.toNumber;
				if (!to) {
					respond(false, { error: "to required" });
					return;
				}
				await initiateCallAndRespond({
					rt,
					respond,
					to,
					message,
					mode: params?.mode === "notify" || params?.mode === "conversation" ? params.mode : void 0
				});
			} catch (err) {
				sendError(respond, err);
			}
		});
		api.registerGatewayMethod("voicecall.continue", async ({ params, respond }) => {
			try {
				await respondToCallMessageAction({
					requestParams: params,
					respond,
					action: (request) => request.rt.manager.continueCall(request.callId, request.message),
					failure: "continue failed",
					includeTranscript: true
				});
			} catch (err) {
				sendError(respond, err);
			}
		});
		api.registerGatewayMethod("voicecall.speak", async ({ params, respond }) => {
			try {
				await respondToCallMessageAction({
					requestParams: params,
					respond,
					action: (request) => request.rt.manager.speak(request.callId, request.message),
					failure: "speak failed"
				});
			} catch (err) {
				sendError(respond, err);
			}
		});
		api.registerGatewayMethod("voicecall.dtmf", async ({ params, respond }) => {
			try {
				const callId = normalizeOptionalString(params?.callId) ?? "";
				const digits = normalizeOptionalString(params?.digits) ?? "";
				if (!callId || !digits) {
					respond(false, { error: "callId and digits required" });
					return;
				}
				const result = await (await ensureRuntime()).manager.sendDtmf(callId, digits);
				if (!result.success) {
					respond(false, { error: result.error || "dtmf failed" });
					return;
				}
				respond(true, { success: true });
			} catch (err) {
				sendError(respond, err);
			}
		});
		api.registerGatewayMethod("voicecall.end", async ({ params, respond }) => {
			try {
				const callId = normalizeOptionalString(params?.callId) ?? "";
				if (!callId) {
					respond(false, { error: "callId required" });
					return;
				}
				const result = await (await ensureRuntime()).manager.endCall(callId);
				if (!result.success) {
					respond(false, { error: result.error || "end failed" });
					return;
				}
				respond(true, { success: true });
			} catch (err) {
				sendError(respond, err);
			}
		});
		api.registerGatewayMethod("voicecall.status", async ({ params, respond }) => {
			try {
				const raw = normalizeOptionalString(params?.callId) ?? normalizeOptionalString(params?.sid) ?? "";
				if (!raw) {
					respond(false, { error: "callId required" });
					return;
				}
				const rt = await ensureRuntime();
				const call = rt.manager.getCall(raw) || rt.manager.getCallByProviderCallId(raw);
				if (!call) {
					respond(true, { found: false });
					return;
				}
				respond(true, {
					found: true,
					call
				});
			} catch (err) {
				sendError(respond, err);
			}
		});
		api.registerGatewayMethod("voicecall.start", async ({ params, respond }) => {
			try {
				const to = normalizeOptionalString(params?.to) ?? "";
				const message = normalizeOptionalString(params?.message) ?? "";
				if (!to) {
					respond(false, { error: "to required" });
					return;
				}
				await initiateCallAndRespond({
					rt: await ensureRuntime(),
					respond,
					to,
					message: message || void 0
				});
			} catch (err) {
				sendError(respond, err);
			}
		});
		api.registerTool({
			name: "voice_call",
			label: "Voice Call",
			description: "Make phone calls and have voice conversations via the voice-call plugin.",
			parameters: VoiceCallToolSchema,
			async execute(_toolCallId, params) {
				const rawParams = asParamRecord(params);
				const json = (payload) => ({
					content: [{
						type: "text",
						text: JSON.stringify(payload, null, 2)
					}],
					details: payload
				});
				try {
					const rt = await ensureRuntime();
					if (typeof rawParams.action === "string") switch (rawParams.action) {
						case "initiate_call": {
							const message = normalizeOptionalString(rawParams.message) ?? "";
							if (!message) throw new Error("message required");
							const to = normalizeOptionalString(rawParams.to) ?? rt.config.toNumber;
							if (!to) throw new Error("to required");
							const result = await rt.manager.initiateCall(to, void 0, {
								message,
								mode: rawParams.mode === "notify" || rawParams.mode === "conversation" ? rawParams.mode : void 0
							});
							if (!result.success) throw new Error(result.error || "initiate failed");
							return json({
								callId: result.callId,
								initiated: true
							});
						}
						case "continue_call": {
							const callId = normalizeOptionalString(rawParams.callId) ?? "";
							const message = normalizeOptionalString(rawParams.message) ?? "";
							if (!callId || !message) throw new Error("callId and message required");
							const result = await rt.manager.continueCall(callId, message);
							if (!result.success) throw new Error(result.error || "continue failed");
							return json({
								success: true,
								transcript: result.transcript
							});
						}
						case "speak_to_user": {
							const callId = normalizeOptionalString(rawParams.callId) ?? "";
							const message = normalizeOptionalString(rawParams.message) ?? "";
							if (!callId || !message) throw new Error("callId and message required");
							const result = await rt.manager.speak(callId, message);
							if (!result.success) throw new Error(result.error || "speak failed");
							return json({ success: true });
						}
						case "send_dtmf": {
							const callId = normalizeOptionalString(rawParams.callId) ?? "";
							const digits = normalizeOptionalString(rawParams.digits) ?? "";
							if (!callId || !digits) throw new Error("callId and digits required");
							const result = await rt.manager.sendDtmf(callId, digits);
							if (!result.success) throw new Error(result.error || "dtmf failed");
							return json({ success: true });
						}
						case "end_call": {
							const callId = normalizeOptionalString(rawParams.callId) ?? "";
							if (!callId) throw new Error("callId required");
							const result = await rt.manager.endCall(callId);
							if (!result.success) throw new Error(result.error || "end failed");
							return json({ success: true });
						}
						case "get_status": {
							const callId = normalizeOptionalString(rawParams.callId) ?? "";
							if (!callId) throw new Error("callId required");
							const call = rt.manager.getCall(callId) || rt.manager.getCallByProviderCallId(callId);
							return json(call ? {
								found: true,
								call
							} : { found: false });
						}
					}
					if ((rawParams.mode ?? "call") === "status") {
						const sid = normalizeOptionalString(rawParams.sid) ?? "";
						if (!sid) throw new Error("sid required for status");
						const call = rt.manager.getCall(sid) || rt.manager.getCallByProviderCallId(sid);
						return json(call ? {
							found: true,
							call
						} : { found: false });
					}
					const to = normalizeOptionalString(rawParams.to) ?? rt.config.toNumber;
					if (!to) throw new Error("to required for call");
					const result = await rt.manager.initiateCall(to, void 0, { message: normalizeOptionalString(rawParams.message) });
					if (!result.success) throw new Error(result.error || "initiate failed");
					return json({
						callId: result.callId,
						initiated: true
					});
				} catch (err) {
					return json({ error: formatErrorMessage(err) });
				}
			}
		});
		api.registerCli(({ program }) => registerVoiceCallCli({
			program,
			config,
			ensureRuntime,
			logger: api.logger
		}), { commands: ["voicecall"] });
		api.registerService({
			id: "voicecall",
			start: () => {
				if (!config.enabled) return;
				if (!validation.valid) {
					api.logger.warn(`[voice-call] Runtime not started; setup incomplete: ${validation.errors.join("; ")}`);
					return;
				}
				ensureRuntime().catch((err) => {
					api.logger.error(`[voice-call] Failed to start runtime: ${formatErrorMessage(err)}`);
				});
			},
			stop: async () => {
				if (runtimeState[VOICE_CALL_RUNTIME_STOP_PROMISE_KEY]) {
					await runtimeState[VOICE_CALL_RUNTIME_STOP_PROMISE_KEY];
					return;
				}
				const runtime = runtimeState[VOICE_CALL_RUNTIME_KEY];
				const runtimePromise = runtimeState[VOICE_CALL_RUNTIME_PROMISE_KEY];
				if (!runtime && !runtimePromise) return;
				runtimeState[VOICE_CALL_RUNTIME_KEY] = null;
				runtimeState[VOICE_CALL_RUNTIME_PROMISE_KEY] = null;
				const stopPromise = (async () => {
					await (runtime ?? await runtimePromise).stop();
				})();
				runtimeState[VOICE_CALL_RUNTIME_STOP_PROMISE_KEY] = stopPromise;
				try {
					await stopPromise;
				} finally {
					if (runtimeState[VOICE_CALL_RUNTIME_STOP_PROMISE_KEY] === stopPromise) runtimeState[VOICE_CALL_RUNTIME_STOP_PROMISE_KEY] = null;
				}
			}
		});
	}
});
//#endregion
export { voice_call_default as default };
