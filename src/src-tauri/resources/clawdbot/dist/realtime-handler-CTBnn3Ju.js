import { i as formatErrorMessage } from "./errors-D8p6rxH8.js";
import "./error-runtime-CgBDklBz.js";
import { randomUUID } from "node:crypto";
import WebSocket, { WebSocketServer } from "ws";
//#region extensions/voice-call/src/webhook/realtime-handler.ts
const STREAM_TOKEN_TTL_MS = 3e4;
const DEFAULT_HOST = "localhost:8443";
const MAX_REALTIME_MESSAGE_BYTES = 256 * 1024;
function normalizePath(pathname) {
	const trimmed = pathname.trim();
	if (!trimmed) return "/";
	const prefixed = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
	if (prefixed === "/") return prefixed;
	return prefixed.endsWith("/") ? prefixed.slice(0, -1) : prefixed;
}
function buildGreetingInstructions(baseInstructions, greeting) {
	const trimmedGreeting = greeting?.trim();
	if (!trimmedGreeting) return baseInstructions;
	const intro = "Start the call by greeting the caller naturally. Include this greeting in your first spoken reply:";
	return baseInstructions ? `${baseInstructions}\n\n${intro} "${trimmedGreeting}"` : `${intro} "${trimmedGreeting}"`;
}
var RealtimeCallHandler = class {
	constructor(config, manager, provider, realtimeProvider, providerConfig, servePath) {
		this.config = config;
		this.manager = manager;
		this.provider = provider;
		this.realtimeProvider = realtimeProvider;
		this.providerConfig = providerConfig;
		this.servePath = servePath;
		this.toolHandlers = /* @__PURE__ */ new Map();
		this.pendingStreamTokens = /* @__PURE__ */ new Map();
		this.publicOrigin = null;
		this.publicPathPrefix = "";
	}
	setPublicUrl(url) {
		try {
			const parsed = new URL(url);
			this.publicOrigin = parsed.host;
			const normalizedServePath = normalizePath(this.servePath);
			const normalizedPublicPath = normalizePath(parsed.pathname);
			const idx = normalizedPublicPath.indexOf(normalizedServePath);
			this.publicPathPrefix = idx > 0 ? normalizedPublicPath.slice(0, idx) : "";
		} catch {
			this.publicOrigin = null;
			this.publicPathPrefix = "";
		}
	}
	getStreamPathPattern() {
		return `${this.publicPathPrefix}${normalizePath(this.config.streamPath ?? "/voice/stream/realtime")}`;
	}
	buildTwiMLPayload(req, params) {
		const host = this.publicOrigin || req.headers.host || DEFAULT_HOST;
		const rawDirection = params?.get("Direction");
		const token = this.issueStreamToken({
			from: params?.get("From") ?? void 0,
			to: params?.get("To") ?? void 0,
			direction: rawDirection === "outbound-api" ? "outbound" : "inbound"
		});
		const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Connect>
    <Stream url="${`wss://${host}${this.getStreamPathPattern()}/${token}`}" />
  </Connect>
</Response>`;
		return {
			statusCode: 200,
			headers: { "Content-Type": "text/xml" },
			body: twiml
		};
	}
	handleWebSocketUpgrade(request, socket, head) {
		const token = new URL(request.url ?? "/", "wss://localhost").pathname.split("/").pop() ?? null;
		const callerMeta = token ? this.consumeStreamToken(token) : null;
		if (!callerMeta) {
			socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
			socket.destroy();
			return;
		}
		new WebSocketServer({
			noServer: true,
			maxPayload: MAX_REALTIME_MESSAGE_BYTES
		}).handleUpgrade(request, socket, head, (ws) => {
			let bridge = null;
			let initialized = false;
			ws.on("message", (data) => {
				try {
					const msg = JSON.parse(data.toString());
					if (!initialized && msg.event === "start") {
						initialized = true;
						const startData = typeof msg.start === "object" && msg.start !== null ? msg.start : void 0;
						const streamSid = typeof startData?.streamSid === "string" ? startData.streamSid : "unknown";
						const callSid = typeof startData?.callSid === "string" ? startData.callSid : "unknown";
						const nextBridge = this.handleCall(streamSid, callSid, ws, callerMeta);
						if (!nextBridge) return;
						bridge = nextBridge;
						return;
					}
					if (!bridge) return;
					const mediaData = typeof msg.media === "object" && msg.media !== null ? msg.media : void 0;
					if (msg.event === "media" && typeof mediaData?.payload === "string") {
						bridge.sendAudio(Buffer.from(mediaData.payload, "base64"));
						if (typeof mediaData.timestamp === "number") bridge.setMediaTimestamp(mediaData.timestamp);
						else if (typeof mediaData.timestamp === "string") bridge.setMediaTimestamp(Number.parseInt(mediaData.timestamp, 10));
						return;
					}
					if (msg.event === "mark") {
						bridge.acknowledgeMark();
						return;
					}
					if (msg.event === "stop") bridge.close();
				} catch (error) {
					console.error("[voice-call] realtime WS parse failed:", error);
				}
			});
			ws.on("close", () => {
				bridge?.close();
			});
			ws.on("error", (error) => {
				console.error("[voice-call] realtime WS error:", error);
			});
		});
	}
	registerToolHandler(name, fn) {
		this.toolHandlers.set(name, fn);
	}
	issueStreamToken(meta = {}) {
		const token = randomUUID();
		this.pendingStreamTokens.set(token, {
			expiry: Date.now() + STREAM_TOKEN_TTL_MS,
			...meta
		});
		for (const [candidate, entry] of this.pendingStreamTokens) if (Date.now() > entry.expiry) this.pendingStreamTokens.delete(candidate);
		return token;
	}
	consumeStreamToken(token) {
		const entry = this.pendingStreamTokens.get(token);
		if (!entry) return null;
		this.pendingStreamTokens.delete(token);
		if (Date.now() > entry.expiry) return null;
		return {
			from: entry.from,
			to: entry.to,
			direction: entry.direction
		};
	}
	handleCall(streamSid, callSid, ws, callerMeta) {
		const registration = this.registerCallInManager(callSid, callerMeta);
		if (!registration) {
			ws.close(1008, "Caller rejected by policy");
			return null;
		}
		const { callId, initialGreetingInstructions } = registration;
		let callEndEmitted = false;
		const emitCallEnd = (reason) => {
			if (callEndEmitted) return;
			callEndEmitted = true;
			this.endCallInManager(callSid, callId, reason);
		};
		const bridgeRef = {};
		const bridge = this.realtimeProvider.createBridge({
			providerConfig: this.providerConfig,
			instructions: this.config.instructions,
			tools: this.config.tools,
			onAudio: (muLaw) => {
				if (ws.readyState !== WebSocket.OPEN) return;
				ws.send(JSON.stringify({
					event: "media",
					streamSid,
					media: { payload: muLaw.toString("base64") }
				}));
			},
			onClearAudio: () => {
				if (ws.readyState !== WebSocket.OPEN) return;
				ws.send(JSON.stringify({
					event: "clear",
					streamSid
				}));
			},
			onMark: (markName) => {
				if (ws.readyState !== WebSocket.OPEN) return;
				ws.send(JSON.stringify({
					event: "mark",
					streamSid,
					mark: { name: markName }
				}));
			},
			onTranscript: (role, text, isFinal) => {
				if (!isFinal) return;
				if (role === "user") {
					const event = {
						id: `realtime-speech-${callSid}-${Date.now()}`,
						type: "call.speech",
						callId,
						providerCallId: callSid,
						timestamp: Date.now(),
						transcript: text,
						isFinal: true
					};
					this.manager.processEvent(event);
					return;
				}
				this.manager.processEvent({
					id: `realtime-bot-${callSid}-${Date.now()}`,
					type: "call.speaking",
					callId,
					providerCallId: callSid,
					timestamp: Date.now(),
					text
				});
			},
			onToolCall: (toolEvent) => {
				const activeBridge = bridgeRef.current;
				if (!activeBridge) return;
				this.executeToolCall(activeBridge, callId, toolEvent.callId || toolEvent.itemId, toolEvent.name, toolEvent.args);
			},
			onReady: () => {
				bridgeRef.current?.triggerGreeting?.(initialGreetingInstructions);
			},
			onError: (error) => {
				console.error("[voice-call] realtime voice error:", error.message);
			},
			onClose: (reason) => {
				if (reason !== "error") return;
				emitCallEnd("error");
				if (ws.readyState === WebSocket.OPEN) ws.close(1011, "Bridge disconnected");
				this.provider.hangupCall({
					callId,
					providerCallId: callSid,
					reason: "error"
				}).catch((error) => {
					console.warn(`[voice-call] Failed to hang up realtime call ${callSid}: ${formatErrorMessage(error)}`);
				});
			}
		});
		bridgeRef.current = bridge;
		bridge.connect().catch((error) => {
			console.error("[voice-call] Failed to connect realtime bridge:", error);
			bridge.close();
			emitCallEnd("error");
			ws.close(1011, "Failed to connect");
		});
		return bridge;
	}
	registerCallInManager(callSid, callerMeta = {}) {
		const baseFields = {
			providerCallId: callSid,
			timestamp: Date.now(),
			direction: callerMeta.direction ?? "inbound",
			...callerMeta.from ? { from: callerMeta.from } : {},
			...callerMeta.to ? { to: callerMeta.to } : {}
		};
		this.manager.processEvent({
			id: `realtime-initiated-${callSid}`,
			callId: callSid,
			type: "call.initiated",
			...baseFields
		});
		const callRecord = this.manager.getCallByProviderCallId(callSid);
		if (!callRecord) return null;
		const initialGreeting = this.extractInitialGreeting(callRecord);
		if (callRecord.metadata) delete callRecord.metadata.initialMessage;
		this.manager.processEvent({
			id: `realtime-answered-${callSid}`,
			callId: callSid,
			type: "call.answered",
			...baseFields
		});
		return {
			callId: callRecord.callId,
			initialGreetingInstructions: buildGreetingInstructions(this.config.instructions, initialGreeting)
		};
	}
	extractInitialGreeting(call) {
		return typeof call.metadata?.initialMessage === "string" ? call.metadata.initialMessage : void 0;
	}
	endCallInManager(callSid, callId, reason) {
		this.manager.processEvent({
			id: `realtime-ended-${callSid}-${Date.now()}`,
			type: "call.ended",
			callId,
			providerCallId: callSid,
			timestamp: Date.now(),
			reason
		});
	}
	async executeToolCall(bridge, callId, bridgeCallId, name, args) {
		const handler = this.toolHandlers.get(name);
		const result = !handler ? { error: `Tool "${name}" not available` } : await handler(args, callId).catch((error) => ({ error: formatErrorMessage(error) }));
		bridge.submitToolResult(bridgeCallId, result);
	}
};
//#endregion
export { RealtimeCallHandler };
