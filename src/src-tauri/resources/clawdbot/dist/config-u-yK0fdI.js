import { j as TtsConfigSchema } from "./zod-schema.core-CYrn8zgQ.js";
import { t as zod_exports } from "./zod-BUbl8seT.js";
import "./api-Bp0lE5j9.js";
//#region extensions/voice-call/src/deep-merge.ts
const BLOCKED_MERGE_KEYS = new Set([
	"__proto__",
	"prototype",
	"constructor"
]);
function deepMergeDefined(base, override) {
	if (!isPlainObject(base) || !isPlainObject(override)) return override === void 0 ? base : override;
	const result = { ...base };
	for (const [key, value] of Object.entries(override)) {
		if (BLOCKED_MERGE_KEYS.has(key) || value === void 0) continue;
		const existing = result[key];
		result[key] = key in result ? deepMergeDefined(existing, value) : value;
	}
	return result;
}
function isPlainObject(value) {
	return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
//#endregion
//#region extensions/voice-call/src/config.ts
/**
* E.164 phone number format: +[country code][number]
* Examples use 555 prefix (reserved for fictional numbers)
*/
const E164Schema = zod_exports.z.string().regex(/^\+[1-9]\d{1,14}$/, "Expected E.164 format, e.g. +15550001234");
/**
* Controls how inbound calls are handled:
* - "disabled": Block all inbound calls (outbound only)
* - "allowlist": Only accept calls from numbers in allowFrom
* - "pairing": Unknown callers can request pairing (future)
* - "open": Accept all inbound calls (dangerous!)
*/
const InboundPolicySchema = zod_exports.z.enum([
	"disabled",
	"allowlist",
	"pairing",
	"open"
]);
const TelnyxConfigSchema = zod_exports.z.object({
	apiKey: zod_exports.z.string().min(1).optional(),
	connectionId: zod_exports.z.string().min(1).optional(),
	publicKey: zod_exports.z.string().min(1).optional()
}).strict();
const TwilioConfigSchema = zod_exports.z.object({
	accountSid: zod_exports.z.string().min(1).optional(),
	authToken: zod_exports.z.string().min(1).optional()
}).strict();
const PlivoConfigSchema = zod_exports.z.object({
	authId: zod_exports.z.string().min(1).optional(),
	authToken: zod_exports.z.string().min(1).optional()
}).strict();
const VoiceCallServeConfigSchema = zod_exports.z.object({
	port: zod_exports.z.number().int().positive().default(3334),
	bind: zod_exports.z.string().default("127.0.0.1"),
	path: zod_exports.z.string().min(1).default("/voice/webhook")
}).strict().default({
	port: 3334,
	bind: "127.0.0.1",
	path: "/voice/webhook"
});
const VoiceCallTailscaleConfigSchema = zod_exports.z.object({
	mode: zod_exports.z.enum([
		"off",
		"serve",
		"funnel"
	]).default("off"),
	path: zod_exports.z.string().min(1).default("/voice/webhook")
}).strict().default({
	mode: "off",
	path: "/voice/webhook"
});
const VoiceCallTunnelConfigSchema = zod_exports.z.object({
	provider: zod_exports.z.enum([
		"none",
		"ngrok",
		"tailscale-serve",
		"tailscale-funnel"
	]).default("none"),
	ngrokAuthToken: zod_exports.z.string().min(1).optional(),
	ngrokDomain: zod_exports.z.string().min(1).optional(),
	allowNgrokFreeTierLoopbackBypass: zod_exports.z.boolean().default(false)
}).strict().default({
	provider: "none",
	allowNgrokFreeTierLoopbackBypass: false
});
const VoiceCallWebhookSecurityConfigSchema = zod_exports.z.object({
	allowedHosts: zod_exports.z.array(zod_exports.z.string().min(1)).default([]),
	trustForwardingHeaders: zod_exports.z.boolean().default(false),
	trustedProxyIPs: zod_exports.z.array(zod_exports.z.string().min(1)).default([])
}).strict().default({
	allowedHosts: [],
	trustForwardingHeaders: false,
	trustedProxyIPs: []
});
/**
* Call mode determines how outbound calls behave:
* - "notify": Deliver message and auto-hangup after delay (one-way notification)
* - "conversation": Stay open for back-and-forth until explicit end or timeout
*/
const CallModeSchema = zod_exports.z.enum(["notify", "conversation"]);
const OutboundConfigSchema = zod_exports.z.object({
	defaultMode: CallModeSchema.default("notify"),
	notifyHangupDelaySec: zod_exports.z.number().int().nonnegative().default(3)
}).strict().default({
	defaultMode: "notify",
	notifyHangupDelaySec: 3
});
const RealtimeToolSchema = zod_exports.z.object({
	type: zod_exports.z.literal("function"),
	name: zod_exports.z.string().min(1),
	description: zod_exports.z.string(),
	parameters: zod_exports.z.object({
		type: zod_exports.z.literal("object"),
		properties: zod_exports.z.record(zod_exports.z.string(), zod_exports.z.unknown()),
		required: zod_exports.z.array(zod_exports.z.string()).optional()
	})
}).strict();
const VoiceCallRealtimeProvidersConfigSchema = zod_exports.z.record(zod_exports.z.string(), zod_exports.z.record(zod_exports.z.string(), zod_exports.z.unknown())).default({});
const VoiceCallStreamingProvidersConfigSchema = zod_exports.z.record(zod_exports.z.string(), zod_exports.z.record(zod_exports.z.string(), zod_exports.z.unknown())).default({});
const VoiceCallRealtimeConfigSchema = zod_exports.z.object({
	enabled: zod_exports.z.boolean().default(false),
	provider: zod_exports.z.string().min(1).optional(),
	streamPath: zod_exports.z.string().min(1).optional(),
	instructions: zod_exports.z.string().optional(),
	tools: zod_exports.z.array(RealtimeToolSchema).default([]),
	providers: VoiceCallRealtimeProvidersConfigSchema
}).strict().default({
	enabled: false,
	tools: [],
	providers: {}
});
const VoiceCallStreamingConfigSchema = zod_exports.z.object({
	enabled: zod_exports.z.boolean().default(false),
	provider: zod_exports.z.string().min(1).optional(),
	streamPath: zod_exports.z.string().min(1).default("/voice/stream"),
	providers: VoiceCallStreamingProvidersConfigSchema,
	preStartTimeoutMs: zod_exports.z.number().int().positive().default(5e3),
	maxPendingConnections: zod_exports.z.number().int().positive().default(32),
	maxPendingConnectionsPerIp: zod_exports.z.number().int().positive().default(4),
	maxConnections: zod_exports.z.number().int().positive().default(128)
}).strict().default({
	enabled: false,
	streamPath: "/voice/stream",
	providers: {},
	preStartTimeoutMs: 5e3,
	maxPendingConnections: 32,
	maxPendingConnectionsPerIp: 4,
	maxConnections: 128
});
const VoiceCallConfigSchema = zod_exports.z.object({
	enabled: zod_exports.z.boolean().default(false),
	provider: zod_exports.z.enum([
		"telnyx",
		"twilio",
		"plivo",
		"mock"
	]).optional(),
	telnyx: TelnyxConfigSchema.optional(),
	twilio: TwilioConfigSchema.optional(),
	plivo: PlivoConfigSchema.optional(),
	fromNumber: E164Schema.optional(),
	toNumber: E164Schema.optional(),
	inboundPolicy: InboundPolicySchema.default("disabled"),
	allowFrom: zod_exports.z.array(E164Schema).default([]),
	inboundGreeting: zod_exports.z.string().optional(),
	outbound: OutboundConfigSchema,
	maxDurationSeconds: zod_exports.z.number().int().positive().default(300),
	staleCallReaperSeconds: zod_exports.z.number().int().nonnegative().default(0),
	silenceTimeoutMs: zod_exports.z.number().int().positive().default(800),
	transcriptTimeoutMs: zod_exports.z.number().int().positive().default(18e4),
	ringTimeoutMs: zod_exports.z.number().int().positive().default(3e4),
	maxConcurrentCalls: zod_exports.z.number().int().positive().default(1),
	serve: VoiceCallServeConfigSchema,
	tailscale: VoiceCallTailscaleConfigSchema,
	tunnel: VoiceCallTunnelConfigSchema,
	webhookSecurity: VoiceCallWebhookSecurityConfigSchema,
	streaming: VoiceCallStreamingConfigSchema,
	realtime: VoiceCallRealtimeConfigSchema,
	publicUrl: zod_exports.z.string().url().optional(),
	skipSignatureVerification: zod_exports.z.boolean().default(false),
	tts: TtsConfigSchema,
	store: zod_exports.z.string().optional(),
	responseModel: zod_exports.z.string().optional(),
	responseSystemPrompt: zod_exports.z.string().optional(),
	responseTimeoutMs: zod_exports.z.number().int().positive().default(3e4)
}).strict();
const DEFAULT_VOICE_CALL_CONFIG = VoiceCallConfigSchema.parse({});
function cloneDefaultVoiceCallConfig() {
	return structuredClone(DEFAULT_VOICE_CALL_CONFIG);
}
function normalizeWebhookLikePath(pathname) {
	const trimmed = pathname.trim();
	if (!trimmed) return "/";
	const prefixed = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
	if (prefixed === "/") return prefixed;
	return prefixed.endsWith("/") ? prefixed.slice(0, -1) : prefixed;
}
function defaultRealtimeStreamPathForServePath(servePath) {
	const normalized = normalizeWebhookLikePath(servePath);
	if (normalized.endsWith("/webhook")) return `${normalized.slice(0, -8)}/stream/realtime`;
	if (normalized === "/") return "/voice/stream/realtime";
	return `${normalized}/stream/realtime`;
}
function normalizeVoiceCallTtsConfig(defaults, overrides) {
	if (!defaults && !overrides) return;
	return TtsConfigSchema.parse(deepMergeDefined(defaults ?? {}, overrides ?? {}));
}
function sanitizeVoiceCallProviderConfigs(value) {
	if (!value) return {};
	return Object.fromEntries(Object.entries(value).filter((entry) => entry[1] !== void 0));
}
function normalizeVoiceCallConfig(config) {
	const defaults = cloneDefaultVoiceCallConfig();
	const serve = {
		...defaults.serve,
		...config.serve
	};
	const streamingProvider = config.streaming?.provider;
	const streamingProviders = sanitizeVoiceCallProviderConfigs(config.streaming?.providers ?? defaults.streaming.providers);
	const realtimeProvider = config.realtime?.provider ?? defaults.realtime.provider;
	const realtimeProviders = sanitizeVoiceCallProviderConfigs(config.realtime?.providers ?? defaults.realtime.providers);
	return {
		...defaults,
		...config,
		allowFrom: config.allowFrom ?? defaults.allowFrom,
		outbound: {
			...defaults.outbound,
			...config.outbound
		},
		serve,
		tailscale: {
			...defaults.tailscale,
			...config.tailscale
		},
		tunnel: {
			...defaults.tunnel,
			...config.tunnel
		},
		webhookSecurity: {
			...defaults.webhookSecurity,
			...config.webhookSecurity,
			allowedHosts: config.webhookSecurity?.allowedHosts ?? defaults.webhookSecurity.allowedHosts,
			trustedProxyIPs: config.webhookSecurity?.trustedProxyIPs ?? defaults.webhookSecurity.trustedProxyIPs
		},
		streaming: {
			...defaults.streaming,
			...config.streaming,
			provider: streamingProvider,
			providers: streamingProviders
		},
		realtime: {
			...defaults.realtime,
			...config.realtime,
			provider: realtimeProvider,
			streamPath: config.realtime?.streamPath ?? defaultRealtimeStreamPathForServePath(serve.path ?? defaults.serve.path),
			tools: config.realtime?.tools ?? defaults.realtime.tools,
			providers: realtimeProviders
		},
		tts: normalizeVoiceCallTtsConfig(defaults.tts, config.tts)
	};
}
/**
* Resolves the configuration by merging environment variables into missing fields.
* Returns a new configuration object with environment variables applied.
*/
function resolveVoiceCallConfig(config) {
	const resolved = normalizeVoiceCallConfig(config);
	if (resolved.provider === "telnyx") {
		resolved.telnyx = resolved.telnyx ?? {};
		resolved.telnyx.apiKey = resolved.telnyx.apiKey ?? process.env.TELNYX_API_KEY;
		resolved.telnyx.connectionId = resolved.telnyx.connectionId ?? process.env.TELNYX_CONNECTION_ID;
		resolved.telnyx.publicKey = resolved.telnyx.publicKey ?? process.env.TELNYX_PUBLIC_KEY;
	}
	if (resolved.provider === "twilio") {
		resolved.twilio = resolved.twilio ?? {};
		resolved.twilio.accountSid = resolved.twilio.accountSid ?? process.env.TWILIO_ACCOUNT_SID;
		resolved.twilio.authToken = resolved.twilio.authToken ?? process.env.TWILIO_AUTH_TOKEN;
	}
	if (resolved.provider === "plivo") {
		resolved.plivo = resolved.plivo ?? {};
		resolved.plivo.authId = resolved.plivo.authId ?? process.env.PLIVO_AUTH_ID;
		resolved.plivo.authToken = resolved.plivo.authToken ?? process.env.PLIVO_AUTH_TOKEN;
	}
	resolved.tunnel = resolved.tunnel ?? {
		provider: "none",
		allowNgrokFreeTierLoopbackBypass: false
	};
	resolved.tunnel.allowNgrokFreeTierLoopbackBypass = resolved.tunnel.allowNgrokFreeTierLoopbackBypass ?? false;
	resolved.tunnel.ngrokAuthToken = resolved.tunnel.ngrokAuthToken ?? process.env.NGROK_AUTHTOKEN;
	resolved.tunnel.ngrokDomain = resolved.tunnel.ngrokDomain ?? process.env.NGROK_DOMAIN;
	resolved.webhookSecurity = resolved.webhookSecurity ?? {
		allowedHosts: [],
		trustForwardingHeaders: false,
		trustedProxyIPs: []
	};
	resolved.webhookSecurity.allowedHosts = resolved.webhookSecurity.allowedHosts ?? [];
	resolved.webhookSecurity.trustForwardingHeaders = resolved.webhookSecurity.trustForwardingHeaders ?? false;
	resolved.webhookSecurity.trustedProxyIPs = resolved.webhookSecurity.trustedProxyIPs ?? [];
	return normalizeVoiceCallConfig(resolved);
}
/**
* Validate that the configuration has all required fields for the selected provider.
*/
function validateProviderConfig(config) {
	const errors = [];
	if (!config.enabled) return {
		valid: true,
		errors: []
	};
	if (!config.provider) errors.push("plugins.entries.voice-call.config.provider is required");
	if (!config.fromNumber && config.provider !== "mock") errors.push("plugins.entries.voice-call.config.fromNumber is required");
	if (config.provider === "telnyx") {
		if (!config.telnyx?.apiKey) errors.push("plugins.entries.voice-call.config.telnyx.apiKey is required (or set TELNYX_API_KEY env)");
		if (!config.telnyx?.connectionId) errors.push("plugins.entries.voice-call.config.telnyx.connectionId is required (or set TELNYX_CONNECTION_ID env)");
		if (!config.skipSignatureVerification && !config.telnyx?.publicKey) errors.push("plugins.entries.voice-call.config.telnyx.publicKey is required (or set TELNYX_PUBLIC_KEY env)");
	}
	if (config.provider === "twilio") {
		if (!config.twilio?.accountSid) errors.push("plugins.entries.voice-call.config.twilio.accountSid is required (or set TWILIO_ACCOUNT_SID env)");
		if (!config.twilio?.authToken) errors.push("plugins.entries.voice-call.config.twilio.authToken is required (or set TWILIO_AUTH_TOKEN env)");
	}
	if (config.provider === "plivo") {
		if (!config.plivo?.authId) errors.push("plugins.entries.voice-call.config.plivo.authId is required (or set PLIVO_AUTH_ID env)");
		if (!config.plivo?.authToken) errors.push("plugins.entries.voice-call.config.plivo.authToken is required (or set PLIVO_AUTH_TOKEN env)");
	}
	if (config.realtime.enabled && config.inboundPolicy === "disabled") errors.push("plugins.entries.voice-call.config.inboundPolicy must not be \"disabled\" when realtime.enabled is true");
	if (config.realtime.enabled && config.streaming.enabled) errors.push("plugins.entries.voice-call.config.realtime.enabled and plugins.entries.voice-call.config.streaming.enabled cannot both be true");
	if (config.realtime.enabled && config.provider && config.provider !== "twilio") errors.push("plugins.entries.voice-call.config.provider must be \"twilio\" when realtime.enabled is true");
	return {
		valid: errors.length === 0,
		errors
	};
}
//#endregion
export { deepMergeDefined as a, validateProviderConfig as i, normalizeVoiceCallConfig as n, resolveVoiceCallConfig as r, VoiceCallConfigSchema as t };
