import { a as normalizeLowercaseStringOrEmpty, c as normalizeOptionalString } from "./string-coerce-C1IzJjqi.js";
import { _ as resolveStateDir } from "./paths-BG0ad0P6.js";
import { n as VERSION } from "./version-DZq9J0ei.js";
import { n as ENV_SECRET_REF_ID_RE } from "./types.secrets-Zn5Zyn7M.js";
import { n as FILE_SECRET_REF_ID_PATTERN, r as SECRET_PROVIDER_ALIAS_PATTERN, t as EXEC_SECRET_REF_ID_JSON_SCHEMA_PATTERN } from "./ref-contract-BeQ-3fY_.js";
import { n as logError, t as logDebug } from "./logger-bvytzgs1.js";
import { a as isLoopbackHost, c as isSecureWebSocketUrl } from "./net-AycWGi8-.js";
import { n as resolveSafeTimeoutDelayMs } from "./timer-delay-Co_I1iPe.js";
import { n as normalizeDeviceAuthScopes, t as normalizeDeviceAuthRole } from "./device-auth-7WDS2Ilv.js";
import { t as safeParseJsonWithSchema } from "./zod-parse-DQfbYHdH.js";
import { a as signDevicePayload, i as publicKeyRawBase64UrlFromPem, n as loadOrCreateDeviceIdentity } from "./device-identity-Bds8sWW-.js";
import { t as normalizeFingerprint } from "./fingerprint-7eiODdmC.js";
import { t as rawDataToString } from "./ws-VGsesElb.js";
import { g as GATEWAY_CLIENT_NAMES, h as GATEWAY_CLIENT_MODES, m as GATEWAY_CLIENT_IDS } from "./message-channel-C2Lnao8s.js";
import { t as normalizeDeviceMetadataForAuth } from "./device-metadata-normalization-3n9pnH3U.js";
import { l as readConnectErrorDetailCode, s as formatConnectErrorMessage, t as ConnectErrorDetailCodes, u as readConnectErrorRecoveryAdvice } from "./connect-error-details-AqnPMQnc.js";
import { t as INPUT_PROVENANCE_KIND_VALUES } from "./input-provenance-IJ6YNe09.js";
import { n as MAX_PLUGIN_APPROVAL_TIMEOUT_MS } from "./plugin-approvals-D_mI2Q6z.js";
import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { WebSocket as WebSocket$1 } from "ws";
import Ajv from "ajv";
import { Type } from "typebox";
//#region src/shared/device-auth-store.ts
function loadDeviceAuthTokenFromStore(params) {
	const store = params.adapter.readStore();
	if (!store || store.deviceId !== params.deviceId) return null;
	const role = normalizeDeviceAuthRole(params.role);
	const entry = store.tokens[role];
	if (!entry || typeof entry.token !== "string") return null;
	return entry;
}
function storeDeviceAuthTokenInStore(params) {
	const role = normalizeDeviceAuthRole(params.role);
	const existing = params.adapter.readStore();
	const next = {
		version: 1,
		deviceId: params.deviceId,
		tokens: existing && existing.deviceId === params.deviceId && existing.tokens ? { ...existing.tokens } : {}
	};
	const entry = {
		token: params.token,
		role,
		scopes: normalizeDeviceAuthScopes(params.scopes),
		updatedAtMs: Date.now()
	};
	next.tokens[role] = entry;
	params.adapter.writeStore(next);
	return entry;
}
function clearDeviceAuthTokenFromStore(params) {
	const store = params.adapter.readStore();
	if (!store || store.deviceId !== params.deviceId) return;
	const role = normalizeDeviceAuthRole(params.role);
	if (!store.tokens[role]) return;
	const next = {
		version: 1,
		deviceId: store.deviceId,
		tokens: { ...store.tokens }
	};
	delete next.tokens[role];
	params.adapter.writeStore(next);
}
//#endregion
//#region src/infra/device-auth-store.ts
const DEVICE_AUTH_FILE = "device-auth.json";
const DeviceAuthStoreSchema = z.object({
	version: z.literal(1),
	deviceId: z.string(),
	tokens: z.record(z.string(), z.unknown())
});
function resolveDeviceAuthPath(env = process.env) {
	return path.join(resolveStateDir(env), "identity", DEVICE_AUTH_FILE);
}
function readStore(filePath) {
	try {
		if (!fs.existsSync(filePath)) return null;
		return safeParseJsonWithSchema(DeviceAuthStoreSchema, fs.readFileSync(filePath, "utf8"));
	} catch {
		return null;
	}
}
function writeStore(filePath, store) {
	fs.mkdirSync(path.dirname(filePath), { recursive: true });
	fs.writeFileSync(filePath, `${JSON.stringify(store, null, 2)}\n`, { mode: 384 });
	try {
		fs.chmodSync(filePath, 384);
	} catch {}
}
function loadDeviceAuthToken(params) {
	const filePath = resolveDeviceAuthPath(params.env);
	return loadDeviceAuthTokenFromStore({
		adapter: {
			readStore: () => readStore(filePath),
			writeStore: (_store) => {}
		},
		deviceId: params.deviceId,
		role: params.role
	});
}
function storeDeviceAuthToken(params) {
	const filePath = resolveDeviceAuthPath(params.env);
	return storeDeviceAuthTokenInStore({
		adapter: {
			readStore: () => readStore(filePath),
			writeStore: (store) => writeStore(filePath, store)
		},
		deviceId: params.deviceId,
		role: params.role,
		token: params.token,
		scopes: params.scopes
	});
}
function clearDeviceAuthToken(params) {
	const filePath = resolveDeviceAuthPath(params.env);
	clearDeviceAuthTokenFromStore({
		adapter: {
			readStore: () => readStore(filePath),
			writeStore: (store) => writeStore(filePath, store)
		},
		deviceId: params.deviceId,
		role: params.role
	});
}
//#endregion
//#region src/gateway/device-auth.ts
function buildDeviceAuthPayload(params) {
	const scopes = params.scopes.join(",");
	const token = params.token ?? "";
	return [
		"v2",
		params.deviceId,
		params.clientId,
		params.clientMode,
		params.role,
		scopes,
		String(params.signedAtMs),
		token,
		params.nonce
	].join("|");
}
function buildDeviceAuthPayloadV3(params) {
	const scopes = params.scopes.join(",");
	const token = params.token ?? "";
	const platform = normalizeDeviceMetadataForAuth(params.platform);
	const deviceFamily = normalizeDeviceMetadataForAuth(params.deviceFamily);
	return [
		"v3",
		params.deviceId,
		params.clientId,
		params.clientMode,
		params.role,
		scopes,
		String(params.signedAtMs),
		token,
		params.nonce,
		platform,
		deviceFamily
	].join("|");
}
//#endregion
//#region src/gateway/handshake-timeouts.ts
const DEFAULT_PREAUTH_HANDSHAKE_TIMEOUT_MS = 1e4;
const MAX_CONNECT_CHALLENGE_TIMEOUT_MS = DEFAULT_PREAUTH_HANDSHAKE_TIMEOUT_MS;
function clampConnectChallengeTimeoutMs(timeoutMs) {
	return Math.max(250, Math.min(MAX_CONNECT_CHALLENGE_TIMEOUT_MS, timeoutMs));
}
function getConnectChallengeTimeoutMsFromEnv(env = process.env) {
	const raw = env.OPENCLAW_CONNECT_CHALLENGE_TIMEOUT_MS;
	if (raw) {
		const parsed = Number(raw);
		if (Number.isFinite(parsed) && parsed > 0) return parsed;
	}
}
function resolveConnectChallengeTimeoutMs(timeoutMs) {
	if (typeof timeoutMs === "number" && Number.isFinite(timeoutMs)) return clampConnectChallengeTimeoutMs(timeoutMs);
	const envOverride = getConnectChallengeTimeoutMsFromEnv();
	if (envOverride !== void 0) return clampConnectChallengeTimeoutMs(envOverride);
	return DEFAULT_PREAUTH_HANDSHAKE_TIMEOUT_MS;
}
function getPreauthHandshakeTimeoutMsFromEnv(env = process.env) {
	const configuredTimeout = env.OPENCLAW_HANDSHAKE_TIMEOUT_MS || env.VITEST && env.OPENCLAW_TEST_HANDSHAKE_TIMEOUT_MS;
	if (configuredTimeout) {
		const parsed = Number(configuredTimeout);
		if (Number.isFinite(parsed) && parsed > 0) return parsed;
	}
	return DEFAULT_PREAUTH_HANDSHAKE_TIMEOUT_MS;
}
//#endregion
//#region src/agents/internal-event-contract.ts
const AGENT_INTERNAL_EVENT_TYPE_TASK_COMPLETION = "task_completion";
const AGENT_INTERNAL_EVENT_SOURCES = [
	"subagent",
	"cron",
	"video_generation",
	"music_generation"
];
const AGENT_INTERNAL_EVENT_STATUSES = [
	"ok",
	"timeout",
	"error",
	"unknown"
];
function parseSessionLabel(raw) {
	if (typeof raw !== "string") return {
		ok: false,
		error: "invalid label: must be a string"
	};
	const trimmed = raw.trim();
	if (!trimmed) return {
		ok: false,
		error: "invalid label: empty"
	};
	if (trimmed.length > 512) return {
		ok: false,
		error: `invalid label: too long (max 512)`
	};
	return {
		ok: true,
		label: trimmed
	};
}
//#endregion
//#region src/gateway/protocol/schema/primitives.ts
const NonEmptyString = Type.String({ minLength: 1 });
const ChatSendSessionKeyString = Type.String({
	minLength: 1,
	maxLength: 512
});
const SessionLabelString = Type.String({
	minLength: 1,
	maxLength: 512
});
const InputProvenanceSchema = Type.Object({
	kind: Type.String({ enum: [...INPUT_PROVENANCE_KIND_VALUES] }),
	originSessionId: Type.Optional(Type.String()),
	sourceSessionKey: Type.Optional(Type.String()),
	sourceChannel: Type.Optional(Type.String()),
	sourceTool: Type.Optional(Type.String())
}, { additionalProperties: false });
const GatewayClientIdSchema = Type.Enum(GATEWAY_CLIENT_IDS);
const GatewayClientModeSchema = Type.Enum(GATEWAY_CLIENT_MODES);
Type.Union([
	Type.Literal("env"),
	Type.Literal("file"),
	Type.Literal("exec")
]);
const SecretProviderAliasString = Type.String({ pattern: SECRET_PROVIDER_ALIAS_PATTERN.source });
const EnvSecretRefSchema = Type.Object({
	source: Type.Literal("env"),
	provider: SecretProviderAliasString,
	id: Type.String({ pattern: ENV_SECRET_REF_ID_RE.source })
}, { additionalProperties: false });
const FileSecretRefSchema = Type.Object({
	source: Type.Literal("file"),
	provider: SecretProviderAliasString,
	id: Type.String({ pattern: FILE_SECRET_REF_ID_PATTERN.source })
}, { additionalProperties: false });
const ExecSecretRefSchema = Type.Object({
	source: Type.Literal("exec"),
	provider: SecretProviderAliasString,
	id: Type.String({ pattern: EXEC_SECRET_REF_ID_JSON_SCHEMA_PATTERN })
}, { additionalProperties: false });
const SecretRefSchema = Type.Union([
	EnvSecretRefSchema,
	FileSecretRefSchema,
	ExecSecretRefSchema
]);
const SecretInputSchema = Type.Union([Type.String(), SecretRefSchema]);
//#endregion
//#region src/gateway/protocol/schema/agent.ts
const AgentInternalEventSchema = Type.Object({
	type: Type.Literal(AGENT_INTERNAL_EVENT_TYPE_TASK_COMPLETION),
	source: Type.String({ enum: [...AGENT_INTERNAL_EVENT_SOURCES] }),
	childSessionKey: Type.String(),
	childSessionId: Type.Optional(Type.String()),
	announceType: Type.String(),
	taskLabel: Type.String(),
	status: Type.String({ enum: [...AGENT_INTERNAL_EVENT_STATUSES] }),
	statusLabel: Type.String(),
	result: Type.String(),
	mediaUrls: Type.Optional(Type.Array(Type.String())),
	statsLine: Type.Optional(Type.String()),
	replyInstruction: Type.String()
}, { additionalProperties: false });
Type.Object({
	runId: NonEmptyString,
	seq: Type.Integer({ minimum: 0 }),
	stream: NonEmptyString,
	ts: Type.Integer({ minimum: 0 }),
	data: Type.Record(Type.String(), Type.Unknown())
}, { additionalProperties: false });
const MessageActionToolContextSchema = Type.Object({
	currentChannelId: Type.Optional(Type.String()),
	currentGraphChannelId: Type.Optional(Type.String()),
	currentChannelProvider: Type.Optional(Type.String()),
	currentThreadTs: Type.Optional(Type.String()),
	currentMessageId: Type.Optional(Type.Union([Type.String(), Type.Number()])),
	replyToMode: Type.Optional(Type.Union([
		Type.Literal("off"),
		Type.Literal("first"),
		Type.Literal("all"),
		Type.Literal("batched")
	])),
	hasRepliedRef: Type.Optional(Type.Object({ value: Type.Boolean() }, { additionalProperties: false })),
	skipCrossContextDecoration: Type.Optional(Type.Boolean())
}, { additionalProperties: false });
const MessageActionParamsSchema = Type.Object({
	channel: NonEmptyString,
	action: NonEmptyString,
	params: Type.Record(Type.String(), Type.Unknown()),
	accountId: Type.Optional(Type.String()),
	requesterSenderId: Type.Optional(Type.String()),
	senderIsOwner: Type.Optional(Type.Boolean()),
	sessionKey: Type.Optional(Type.String()),
	sessionId: Type.Optional(Type.String()),
	agentId: Type.Optional(Type.String()),
	toolContext: Type.Optional(MessageActionToolContextSchema),
	idempotencyKey: NonEmptyString
}, { additionalProperties: false });
const SendParamsSchema = Type.Object({
	to: NonEmptyString,
	message: Type.Optional(Type.String()),
	mediaUrl: Type.Optional(Type.String()),
	mediaUrls: Type.Optional(Type.Array(Type.String())),
	gifPlayback: Type.Optional(Type.Boolean()),
	channel: Type.Optional(Type.String()),
	accountId: Type.Optional(Type.String()),
	agentId: Type.Optional(Type.String()),
	replyToId: Type.Optional(Type.String()),
	threadId: Type.Optional(Type.String()),
	sessionKey: Type.Optional(Type.String()),
	idempotencyKey: NonEmptyString
}, { additionalProperties: false });
const PollParamsSchema = Type.Object({
	to: NonEmptyString,
	question: NonEmptyString,
	options: Type.Array(NonEmptyString, {
		minItems: 2,
		maxItems: 12
	}),
	maxSelections: Type.Optional(Type.Integer({
		minimum: 1,
		maximum: 12
	})),
	durationSeconds: Type.Optional(Type.Integer({
		minimum: 1,
		maximum: 604800
	})),
	durationHours: Type.Optional(Type.Integer({ minimum: 1 })),
	silent: Type.Optional(Type.Boolean()),
	isAnonymous: Type.Optional(Type.Boolean()),
	threadId: Type.Optional(Type.String()),
	channel: Type.Optional(Type.String()),
	accountId: Type.Optional(Type.String()),
	idempotencyKey: NonEmptyString
}, { additionalProperties: false });
const AgentParamsSchema = Type.Object({
	message: NonEmptyString,
	agentId: Type.Optional(NonEmptyString),
	provider: Type.Optional(Type.String()),
	model: Type.Optional(Type.String()),
	to: Type.Optional(Type.String()),
	replyTo: Type.Optional(Type.String()),
	sessionId: Type.Optional(Type.String()),
	sessionKey: Type.Optional(Type.String()),
	thinking: Type.Optional(Type.String()),
	deliver: Type.Optional(Type.Boolean()),
	attachments: Type.Optional(Type.Array(Type.Unknown())),
	channel: Type.Optional(Type.String()),
	replyChannel: Type.Optional(Type.String()),
	accountId: Type.Optional(Type.String()),
	replyAccountId: Type.Optional(Type.String()),
	threadId: Type.Optional(Type.String()),
	groupId: Type.Optional(Type.String()),
	groupChannel: Type.Optional(Type.String()),
	groupSpace: Type.Optional(Type.String()),
	timeout: Type.Optional(Type.Integer({ minimum: 0 })),
	bestEffortDeliver: Type.Optional(Type.Boolean()),
	lane: Type.Optional(Type.String()),
	cleanupBundleMcpOnRunEnd: Type.Optional(Type.Boolean()),
	extraSystemPrompt: Type.Optional(Type.String()),
	bootstrapContextMode: Type.Optional(Type.Union([Type.Literal("full"), Type.Literal("lightweight")])),
	bootstrapContextRunKind: Type.Optional(Type.Union([
		Type.Literal("default"),
		Type.Literal("heartbeat"),
		Type.Literal("cron")
	])),
	internalEvents: Type.Optional(Type.Array(AgentInternalEventSchema)),
	inputProvenance: Type.Optional(InputProvenanceSchema),
	idempotencyKey: NonEmptyString,
	label: Type.Optional(SessionLabelString)
}, { additionalProperties: false });
const AgentIdentityParamsSchema = Type.Object({
	agentId: Type.Optional(NonEmptyString),
	sessionKey: Type.Optional(Type.String())
}, { additionalProperties: false });
Type.Object({
	agentId: NonEmptyString,
	name: Type.Optional(NonEmptyString),
	avatar: Type.Optional(NonEmptyString),
	emoji: Type.Optional(NonEmptyString)
}, { additionalProperties: false });
const AgentWaitParamsSchema = Type.Object({
	runId: NonEmptyString,
	timeoutMs: Type.Optional(Type.Integer({ minimum: 0 }))
}, { additionalProperties: false });
const WakeParamsSchema = Type.Object({
	mode: Type.Union([Type.Literal("now"), Type.Literal("next-heartbeat")]),
	text: NonEmptyString
}, { additionalProperties: true });
//#endregion
//#region src/gateway/protocol/schema/agents-models-skills.ts
const ModelChoiceSchema = Type.Object({
	id: NonEmptyString,
	name: NonEmptyString,
	provider: NonEmptyString,
	alias: Type.Optional(NonEmptyString),
	contextWindow: Type.Optional(Type.Integer({ minimum: 1 })),
	reasoning: Type.Optional(Type.Boolean())
}, { additionalProperties: false });
const AgentSummarySchema = Type.Object({
	id: NonEmptyString,
	name: Type.Optional(NonEmptyString),
	identity: Type.Optional(Type.Object({
		name: Type.Optional(NonEmptyString),
		theme: Type.Optional(NonEmptyString),
		emoji: Type.Optional(NonEmptyString),
		avatar: Type.Optional(NonEmptyString),
		avatarUrl: Type.Optional(NonEmptyString)
	}, { additionalProperties: false })),
	workspace: Type.Optional(NonEmptyString),
	model: Type.Optional(Type.Object({
		primary: Type.Optional(NonEmptyString),
		fallbacks: Type.Optional(Type.Array(NonEmptyString))
	}, { additionalProperties: false }))
}, { additionalProperties: false });
const AgentsListParamsSchema = Type.Object({}, { additionalProperties: false });
Type.Object({
	defaultId: NonEmptyString,
	mainKey: NonEmptyString,
	scope: Type.Union([Type.Literal("per-sender"), Type.Literal("global")]),
	agents: Type.Array(AgentSummarySchema)
}, { additionalProperties: false });
const AgentsCreateParamsSchema = Type.Object({
	name: NonEmptyString,
	workspace: NonEmptyString,
	model: Type.Optional(NonEmptyString),
	emoji: Type.Optional(Type.String()),
	avatar: Type.Optional(Type.String())
}, { additionalProperties: false });
Type.Object({
	ok: Type.Literal(true),
	agentId: NonEmptyString,
	name: NonEmptyString,
	workspace: NonEmptyString,
	model: Type.Optional(NonEmptyString)
}, { additionalProperties: false });
const AgentsUpdateParamsSchema = Type.Object({
	agentId: NonEmptyString,
	name: Type.Optional(NonEmptyString),
	workspace: Type.Optional(NonEmptyString),
	model: Type.Optional(NonEmptyString),
	emoji: Type.Optional(Type.String()),
	avatar: Type.Optional(Type.String())
}, { additionalProperties: false });
Type.Object({
	ok: Type.Literal(true),
	agentId: NonEmptyString
}, { additionalProperties: false });
const AgentsDeleteParamsSchema = Type.Object({
	agentId: NonEmptyString,
	deleteFiles: Type.Optional(Type.Boolean())
}, { additionalProperties: false });
Type.Object({
	ok: Type.Literal(true),
	agentId: NonEmptyString,
	removedBindings: Type.Integer({ minimum: 0 })
}, { additionalProperties: false });
const AgentsFileEntrySchema = Type.Object({
	name: NonEmptyString,
	path: NonEmptyString,
	missing: Type.Boolean(),
	size: Type.Optional(Type.Integer({ minimum: 0 })),
	updatedAtMs: Type.Optional(Type.Integer({ minimum: 0 })),
	content: Type.Optional(Type.String())
}, { additionalProperties: false });
const AgentsFilesListParamsSchema = Type.Object({ agentId: NonEmptyString }, { additionalProperties: false });
Type.Object({
	agentId: NonEmptyString,
	workspace: NonEmptyString,
	files: Type.Array(AgentsFileEntrySchema)
}, { additionalProperties: false });
const AgentsFilesGetParamsSchema = Type.Object({
	agentId: NonEmptyString,
	name: NonEmptyString
}, { additionalProperties: false });
Type.Object({
	agentId: NonEmptyString,
	workspace: NonEmptyString,
	file: AgentsFileEntrySchema
}, { additionalProperties: false });
const AgentsFilesSetParamsSchema = Type.Object({
	agentId: NonEmptyString,
	name: NonEmptyString,
	content: Type.String()
}, { additionalProperties: false });
Type.Object({
	ok: Type.Literal(true),
	agentId: NonEmptyString,
	workspace: NonEmptyString,
	file: AgentsFileEntrySchema
}, { additionalProperties: false });
const ModelsListParamsSchema = Type.Object({}, { additionalProperties: false });
Type.Object({ models: Type.Array(ModelChoiceSchema) }, { additionalProperties: false });
const SkillsStatusParamsSchema = Type.Object({ agentId: Type.Optional(NonEmptyString) }, { additionalProperties: false });
const SkillsBinsParamsSchema = Type.Object({}, { additionalProperties: false });
Type.Object({ bins: Type.Array(NonEmptyString) }, { additionalProperties: false });
const SkillsInstallParamsSchema = Type.Union([Type.Object({
	name: NonEmptyString,
	installId: NonEmptyString,
	dangerouslyForceUnsafeInstall: Type.Optional(Type.Boolean()),
	timeoutMs: Type.Optional(Type.Integer({ minimum: 1e3 }))
}, { additionalProperties: false }), Type.Object({
	source: Type.Literal("clawhub"),
	slug: NonEmptyString,
	version: Type.Optional(NonEmptyString),
	force: Type.Optional(Type.Boolean()),
	timeoutMs: Type.Optional(Type.Integer({ minimum: 1e3 }))
}, { additionalProperties: false })]);
const SkillsUpdateParamsSchema = Type.Union([Type.Object({
	skillKey: NonEmptyString,
	enabled: Type.Optional(Type.Boolean()),
	apiKey: Type.Optional(Type.String()),
	env: Type.Optional(Type.Record(NonEmptyString, Type.String()))
}, { additionalProperties: false }), Type.Object({
	source: Type.Literal("clawhub"),
	slug: Type.Optional(NonEmptyString),
	all: Type.Optional(Type.Boolean())
}, { additionalProperties: false })]);
const SkillsSearchParamsSchema = Type.Object({
	query: Type.Optional(NonEmptyString),
	limit: Type.Optional(Type.Integer({
		minimum: 1,
		maximum: 100
	}))
}, { additionalProperties: false });
Type.Object({ results: Type.Array(Type.Object({
	score: Type.Number(),
	slug: NonEmptyString,
	displayName: NonEmptyString,
	summary: Type.Optional(Type.String()),
	version: Type.Optional(NonEmptyString),
	updatedAt: Type.Optional(Type.Integer())
}, { additionalProperties: false })) }, { additionalProperties: false });
const SkillsDetailParamsSchema = Type.Object({ slug: NonEmptyString }, { additionalProperties: false });
Type.Object({
	skill: Type.Union([Type.Object({
		slug: NonEmptyString,
		displayName: NonEmptyString,
		summary: Type.Optional(Type.String()),
		tags: Type.Optional(Type.Record(NonEmptyString, Type.String())),
		createdAt: Type.Integer(),
		updatedAt: Type.Integer()
	}, { additionalProperties: false }), Type.Null()]),
	latestVersion: Type.Optional(Type.Union([Type.Object({
		version: NonEmptyString,
		createdAt: Type.Integer(),
		changelog: Type.Optional(Type.String())
	}, { additionalProperties: false }), Type.Null()])),
	metadata: Type.Optional(Type.Union([Type.Object({
		os: Type.Optional(Type.Union([Type.Array(Type.String()), Type.Null()])),
		systems: Type.Optional(Type.Union([Type.Array(Type.String()), Type.Null()]))
	}, { additionalProperties: false }), Type.Null()])),
	owner: Type.Optional(Type.Union([Type.Object({
		handle: Type.Optional(Type.Union([NonEmptyString, Type.Null()])),
		displayName: Type.Optional(Type.Union([NonEmptyString, Type.Null()])),
		image: Type.Optional(Type.Union([Type.String(), Type.Null()]))
	}, { additionalProperties: false }), Type.Null()]))
}, { additionalProperties: false });
const ToolsCatalogParamsSchema = Type.Object({
	agentId: Type.Optional(NonEmptyString),
	includePlugins: Type.Optional(Type.Boolean())
}, { additionalProperties: false });
const ToolsEffectiveParamsSchema = Type.Object({
	agentId: Type.Optional(NonEmptyString),
	sessionKey: NonEmptyString
}, { additionalProperties: false });
const ToolCatalogProfileSchema = Type.Object({
	id: Type.Union([
		Type.Literal("minimal"),
		Type.Literal("coding"),
		Type.Literal("messaging"),
		Type.Literal("full")
	]),
	label: NonEmptyString
}, { additionalProperties: false });
const ToolCatalogEntrySchema = Type.Object({
	id: NonEmptyString,
	label: NonEmptyString,
	description: Type.String(),
	source: Type.Union([Type.Literal("core"), Type.Literal("plugin")]),
	pluginId: Type.Optional(NonEmptyString),
	optional: Type.Optional(Type.Boolean()),
	defaultProfiles: Type.Array(Type.Union([
		Type.Literal("minimal"),
		Type.Literal("coding"),
		Type.Literal("messaging"),
		Type.Literal("full")
	]))
}, { additionalProperties: false });
const ToolCatalogGroupSchema = Type.Object({
	id: NonEmptyString,
	label: NonEmptyString,
	source: Type.Union([Type.Literal("core"), Type.Literal("plugin")]),
	pluginId: Type.Optional(NonEmptyString),
	tools: Type.Array(ToolCatalogEntrySchema)
}, { additionalProperties: false });
Type.Object({
	agentId: NonEmptyString,
	profiles: Type.Array(ToolCatalogProfileSchema),
	groups: Type.Array(ToolCatalogGroupSchema)
}, { additionalProperties: false });
const ToolsEffectiveEntrySchema = Type.Object({
	id: NonEmptyString,
	label: NonEmptyString,
	description: Type.String(),
	rawDescription: Type.String(),
	source: Type.Union([
		Type.Literal("core"),
		Type.Literal("plugin"),
		Type.Literal("channel")
	]),
	pluginId: Type.Optional(NonEmptyString),
	channelId: Type.Optional(NonEmptyString)
}, { additionalProperties: false });
const ToolsEffectiveGroupSchema = Type.Object({
	id: Type.Union([
		Type.Literal("core"),
		Type.Literal("plugin"),
		Type.Literal("channel")
	]),
	label: NonEmptyString,
	source: Type.Union([
		Type.Literal("core"),
		Type.Literal("plugin"),
		Type.Literal("channel")
	]),
	tools: Type.Array(ToolsEffectiveEntrySchema)
}, { additionalProperties: false });
Type.Object({
	agentId: NonEmptyString,
	profile: NonEmptyString,
	groups: Type.Array(ToolsEffectiveGroupSchema)
}, { additionalProperties: false });
//#endregion
//#region src/gateway/protocol/schema/channels.ts
const TalkModeParamsSchema = Type.Object({
	enabled: Type.Boolean(),
	phase: Type.Optional(Type.String())
}, { additionalProperties: false });
const TalkConfigParamsSchema = Type.Object({ includeSecrets: Type.Optional(Type.Boolean()) }, { additionalProperties: false });
const TalkSpeakParamsSchema = Type.Object({
	text: NonEmptyString,
	voiceId: Type.Optional(Type.String()),
	modelId: Type.Optional(Type.String()),
	outputFormat: Type.Optional(Type.String()),
	speed: Type.Optional(Type.Number()),
	rateWpm: Type.Optional(Type.Integer({ minimum: 1 })),
	stability: Type.Optional(Type.Number()),
	similarity: Type.Optional(Type.Number()),
	style: Type.Optional(Type.Number()),
	speakerBoost: Type.Optional(Type.Boolean()),
	seed: Type.Optional(Type.Integer({ minimum: 0 })),
	normalize: Type.Optional(Type.String()),
	language: Type.Optional(Type.String()),
	latencyTier: Type.Optional(Type.Integer({ minimum: 0 }))
}, { additionalProperties: false });
const TalkRealtimeSessionParamsSchema = Type.Object({
	sessionKey: Type.Optional(Type.String()),
	provider: Type.Optional(Type.String()),
	model: Type.Optional(Type.String()),
	voice: Type.Optional(Type.String())
}, { additionalProperties: false });
const TalkRealtimeSessionResultSchema = Type.Object({
	provider: NonEmptyString,
	clientSecret: NonEmptyString,
	model: Type.Optional(Type.String()),
	voice: Type.Optional(Type.String()),
	expiresAt: Type.Optional(Type.Number())
}, { additionalProperties: false });
const talkProviderFieldSchemas = { apiKey: Type.Optional(SecretInputSchema) };
const TalkProviderConfigSchema = Type.Object(talkProviderFieldSchemas, { additionalProperties: true });
const ResolvedTalkConfigSchema = Type.Object({
	provider: Type.String(),
	config: TalkProviderConfigSchema
}, { additionalProperties: false });
const TalkConfigSchema = Type.Object({
	provider: Type.Optional(Type.String()),
	providers: Type.Optional(Type.Record(Type.String(), TalkProviderConfigSchema)),
	resolved: ResolvedTalkConfigSchema,
	interruptOnSpeech: Type.Optional(Type.Boolean()),
	silenceTimeoutMs: Type.Optional(Type.Integer({ minimum: 1 }))
}, { additionalProperties: false });
const TalkConfigResultSchema = Type.Object({ config: Type.Object({
	talk: Type.Optional(TalkConfigSchema),
	session: Type.Optional(Type.Object({ mainKey: Type.Optional(Type.String()) }, { additionalProperties: false })),
	ui: Type.Optional(Type.Object({ seamColor: Type.Optional(Type.String()) }, { additionalProperties: false }))
}, { additionalProperties: false }) }, { additionalProperties: false });
const TalkSpeakResultSchema = Type.Object({
	audioBase64: NonEmptyString,
	provider: NonEmptyString,
	outputFormat: Type.Optional(Type.String()),
	voiceCompatible: Type.Optional(Type.Boolean()),
	mimeType: Type.Optional(Type.String()),
	fileExtension: Type.Optional(Type.String())
}, { additionalProperties: false });
const ChannelsStatusParamsSchema = Type.Object({
	probe: Type.Optional(Type.Boolean()),
	timeoutMs: Type.Optional(Type.Integer({ minimum: 0 }))
}, { additionalProperties: false });
const ChannelAccountSnapshotSchema = Type.Object({
	accountId: NonEmptyString,
	name: Type.Optional(Type.String()),
	enabled: Type.Optional(Type.Boolean()),
	configured: Type.Optional(Type.Boolean()),
	linked: Type.Optional(Type.Boolean()),
	running: Type.Optional(Type.Boolean()),
	connected: Type.Optional(Type.Boolean()),
	reconnectAttempts: Type.Optional(Type.Integer({ minimum: 0 })),
	lastConnectedAt: Type.Optional(Type.Integer({ minimum: 0 })),
	lastError: Type.Optional(Type.String()),
	healthState: Type.Optional(Type.String()),
	lastStartAt: Type.Optional(Type.Integer({ minimum: 0 })),
	lastStopAt: Type.Optional(Type.Integer({ minimum: 0 })),
	lastInboundAt: Type.Optional(Type.Integer({ minimum: 0 })),
	lastOutboundAt: Type.Optional(Type.Integer({ minimum: 0 })),
	lastTransportActivityAt: Type.Optional(Type.Integer({ minimum: 0 })),
	busy: Type.Optional(Type.Boolean()),
	activeRuns: Type.Optional(Type.Integer({ minimum: 0 })),
	lastRunActivityAt: Type.Optional(Type.Integer({ minimum: 0 })),
	lastProbeAt: Type.Optional(Type.Integer({ minimum: 0 })),
	mode: Type.Optional(Type.String()),
	dmPolicy: Type.Optional(Type.String()),
	allowFrom: Type.Optional(Type.Array(Type.String())),
	tokenSource: Type.Optional(Type.String()),
	botTokenSource: Type.Optional(Type.String()),
	appTokenSource: Type.Optional(Type.String()),
	baseUrl: Type.Optional(Type.String()),
	allowUnmentionedGroups: Type.Optional(Type.Boolean()),
	cliPath: Type.Optional(Type.Union([Type.String(), Type.Null()])),
	dbPath: Type.Optional(Type.Union([Type.String(), Type.Null()])),
	port: Type.Optional(Type.Union([Type.Integer({ minimum: 0 }), Type.Null()])),
	probe: Type.Optional(Type.Unknown()),
	audit: Type.Optional(Type.Unknown()),
	application: Type.Optional(Type.Unknown())
}, { additionalProperties: true });
const ChannelUiMetaSchema = Type.Object({
	id: NonEmptyString,
	label: NonEmptyString,
	detailLabel: NonEmptyString,
	systemImage: Type.Optional(Type.String())
}, { additionalProperties: false });
Type.Object({
	ts: Type.Integer({ minimum: 0 }),
	channelOrder: Type.Array(NonEmptyString),
	channelLabels: Type.Record(NonEmptyString, NonEmptyString),
	channelDetailLabels: Type.Optional(Type.Record(NonEmptyString, NonEmptyString)),
	channelSystemImages: Type.Optional(Type.Record(NonEmptyString, NonEmptyString)),
	channelMeta: Type.Optional(Type.Array(ChannelUiMetaSchema)),
	channels: Type.Record(NonEmptyString, Type.Unknown()),
	channelAccounts: Type.Record(NonEmptyString, Type.Array(ChannelAccountSnapshotSchema)),
	channelDefaultAccountId: Type.Record(NonEmptyString, NonEmptyString)
}, { additionalProperties: false });
const ChannelsLogoutParamsSchema = Type.Object({
	channel: NonEmptyString,
	accountId: Type.Optional(Type.String())
}, { additionalProperties: false });
const ChannelsStartParamsSchema = Type.Object({
	channel: NonEmptyString,
	accountId: Type.Optional(Type.String())
}, { additionalProperties: false });
const WebLoginStartParamsSchema = Type.Object({
	force: Type.Optional(Type.Boolean()),
	timeoutMs: Type.Optional(Type.Integer({ minimum: 0 })),
	verbose: Type.Optional(Type.Boolean()),
	accountId: Type.Optional(Type.String())
}, { additionalProperties: false });
const QrDataUrlSchema = Type.String({
	maxLength: 16384,
	pattern: "^data:image/png;base64,"
});
const WebLoginWaitParamsSchema = Type.Object({
	timeoutMs: Type.Optional(Type.Integer({ minimum: 0 })),
	accountId: Type.Optional(Type.String()),
	currentQrDataUrl: Type.Optional(QrDataUrlSchema)
}, { additionalProperties: false });
const COMMAND_DESCRIPTION_MAX_LENGTH = 2e3;
const BoundedNonEmptyString = (maxLength) => Type.String({
	minLength: 1,
	maxLength
});
const CommandSourceSchema = Type.Union([
	Type.Literal("native"),
	Type.Literal("skill"),
	Type.Literal("plugin")
]);
const CommandScopeSchema = Type.Union([
	Type.Literal("text"),
	Type.Literal("native"),
	Type.Literal("both")
]);
const CommandCategorySchema = Type.Union([
	Type.Literal("session"),
	Type.Literal("options"),
	Type.Literal("status"),
	Type.Literal("management"),
	Type.Literal("media"),
	Type.Literal("tools"),
	Type.Literal("docks")
]);
const CommandArgChoiceSchema = Type.Object({
	value: Type.String({ maxLength: 200 }),
	label: Type.String({ maxLength: 200 })
}, { additionalProperties: false });
const CommandArgSchema = Type.Object({
	name: BoundedNonEmptyString(200),
	description: Type.String({ maxLength: 500 }),
	type: Type.Union([
		Type.Literal("string"),
		Type.Literal("number"),
		Type.Literal("boolean")
	]),
	required: Type.Optional(Type.Boolean()),
	choices: Type.Optional(Type.Array(CommandArgChoiceSchema, { maxItems: 50 })),
	dynamic: Type.Optional(Type.Boolean())
}, { additionalProperties: false });
const CommandEntrySchema = Type.Object({
	name: BoundedNonEmptyString(200),
	nativeName: Type.Optional(BoundedNonEmptyString(200)),
	textAliases: Type.Optional(Type.Array(BoundedNonEmptyString(200), { maxItems: 20 })),
	description: Type.String({ maxLength: COMMAND_DESCRIPTION_MAX_LENGTH }),
	category: Type.Optional(CommandCategorySchema),
	source: CommandSourceSchema,
	scope: CommandScopeSchema,
	acceptsArgs: Type.Boolean(),
	args: Type.Optional(Type.Array(CommandArgSchema, { maxItems: 20 }))
}, { additionalProperties: false });
const CommandsListParamsSchema = Type.Object({
	agentId: Type.Optional(NonEmptyString),
	provider: Type.Optional(NonEmptyString),
	scope: Type.Optional(CommandScopeSchema),
	includeArgs: Type.Optional(Type.Boolean())
}, { additionalProperties: false });
Type.Object({ commands: Type.Array(CommandEntrySchema, { maxItems: 500 }) }, { additionalProperties: false });
//#endregion
//#region src/gateway/protocol/schema/config.ts
const ConfigSchemaLookupPathString = Type.String({
	minLength: 1,
	maxLength: 1024,
	pattern: "^[A-Za-z0-9_./\\[\\]\\-*]+$"
});
const ConfigDeliveryContextSchema = Type.Object({
	channel: Type.Optional(Type.String()),
	to: Type.Optional(Type.String()),
	accountId: Type.Optional(Type.String()),
	threadId: Type.Optional(Type.Union([Type.String(), Type.Number()]))
}, { additionalProperties: false });
const ConfigGetParamsSchema = Type.Object({}, { additionalProperties: false });
const ConfigSetParamsSchema = Type.Object({
	raw: NonEmptyString,
	baseHash: Type.Optional(NonEmptyString)
}, { additionalProperties: false });
const ConfigApplyLikeParamsSchema = Type.Object({
	raw: NonEmptyString,
	baseHash: Type.Optional(NonEmptyString),
	sessionKey: Type.Optional(Type.String()),
	deliveryContext: Type.Optional(ConfigDeliveryContextSchema),
	note: Type.Optional(Type.String()),
	restartDelayMs: Type.Optional(Type.Integer({ minimum: 0 }))
}, { additionalProperties: false });
const ConfigApplyParamsSchema = ConfigApplyLikeParamsSchema;
const ConfigPatchParamsSchema = ConfigApplyLikeParamsSchema;
const ConfigSchemaParamsSchema = Type.Object({}, { additionalProperties: false });
const ConfigSchemaLookupParamsSchema = Type.Object({ path: ConfigSchemaLookupPathString }, { additionalProperties: false });
const UpdateRunParamsSchema = Type.Object({
	sessionKey: Type.Optional(Type.String()),
	deliveryContext: Type.Optional(ConfigDeliveryContextSchema),
	note: Type.Optional(Type.String()),
	restartDelayMs: Type.Optional(Type.Integer({ minimum: 0 })),
	timeoutMs: Type.Optional(Type.Integer({ minimum: 1 }))
}, { additionalProperties: false });
const ConfigUiHintSchema = Type.Object({
	label: Type.Optional(Type.String()),
	help: Type.Optional(Type.String()),
	tags: Type.Optional(Type.Array(Type.String())),
	group: Type.Optional(Type.String()),
	order: Type.Optional(Type.Integer()),
	advanced: Type.Optional(Type.Boolean()),
	sensitive: Type.Optional(Type.Boolean()),
	placeholder: Type.Optional(Type.String()),
	itemTemplate: Type.Optional(Type.Unknown())
}, { additionalProperties: false });
Type.Object({
	schema: Type.Unknown(),
	uiHints: Type.Record(Type.String(), ConfigUiHintSchema),
	version: NonEmptyString,
	generatedAt: NonEmptyString
}, { additionalProperties: false });
const ConfigSchemaLookupChildSchema = Type.Object({
	key: NonEmptyString,
	path: NonEmptyString,
	type: Type.Optional(Type.Union([Type.String(), Type.Array(Type.String())])),
	required: Type.Boolean(),
	hasChildren: Type.Boolean(),
	hint: Type.Optional(ConfigUiHintSchema),
	hintPath: Type.Optional(Type.String())
}, { additionalProperties: false });
const ConfigSchemaLookupResultSchema = Type.Object({
	path: NonEmptyString,
	schema: Type.Unknown(),
	hint: Type.Optional(ConfigUiHintSchema),
	hintPath: Type.Optional(Type.String()),
	children: Type.Array(ConfigSchemaLookupChildSchema)
}, { additionalProperties: false });
//#endregion
//#region src/gateway/protocol/schema/cron.ts
function cronAgentTurnPayloadSchema(params) {
	return Type.Object({
		kind: Type.Literal("agentTurn"),
		message: params.message,
		model: Type.Optional(Type.String()),
		fallbacks: Type.Optional(Type.Array(Type.String())),
		thinking: Type.Optional(Type.String()),
		timeoutSeconds: Type.Optional(Type.Number({ minimum: 0 })),
		allowUnsafeExternalContent: Type.Optional(Type.Boolean()),
		lightContext: Type.Optional(Type.Boolean()),
		toolsAllow: Type.Optional(params.toolsAllow)
	}, { additionalProperties: false });
}
const CronSessionTargetSchema = Type.Union([
	Type.Literal("main"),
	Type.Literal("isolated"),
	Type.Literal("current"),
	Type.String({ pattern: "^session:.+" })
]);
const CronWakeModeSchema = Type.Union([Type.Literal("next-heartbeat"), Type.Literal("now")]);
const CronRunStatusSchema = Type.Union([
	Type.Literal("ok"),
	Type.Literal("error"),
	Type.Literal("skipped")
]);
const CronSortDirSchema = Type.Union([Type.Literal("asc"), Type.Literal("desc")]);
const CronJobsEnabledFilterSchema = Type.Union([
	Type.Literal("all"),
	Type.Literal("enabled"),
	Type.Literal("disabled")
]);
const CronJobsSortBySchema = Type.Union([
	Type.Literal("nextRunAtMs"),
	Type.Literal("updatedAtMs"),
	Type.Literal("name")
]);
const CronRunsStatusFilterSchema = Type.Union([
	Type.Literal("all"),
	Type.Literal("ok"),
	Type.Literal("error"),
	Type.Literal("skipped")
]);
const CronRunsStatusValueSchema = Type.Union([
	Type.Literal("ok"),
	Type.Literal("error"),
	Type.Literal("skipped")
]);
const CronDeliveryStatusSchema = Type.Union([
	Type.Literal("delivered"),
	Type.Literal("not-delivered"),
	Type.Literal("unknown"),
	Type.Literal("not-requested")
]);
const CronFailoverReasonSchema = Type.Union([
	Type.Literal("auth"),
	Type.Literal("format"),
	Type.Literal("rate_limit"),
	Type.Literal("billing"),
	Type.Literal("timeout"),
	Type.Literal("model_not_found"),
	Type.Literal("unknown")
]);
const CronCommonOptionalFields = {
	agentId: Type.Optional(Type.Union([NonEmptyString, Type.Null()])),
	sessionKey: Type.Optional(Type.Union([NonEmptyString, Type.Null()])),
	description: Type.Optional(Type.String()),
	enabled: Type.Optional(Type.Boolean()),
	deleteAfterRun: Type.Optional(Type.Boolean())
};
function cronIdOrJobIdParams(extraFields) {
	return Type.Union([Type.Object({
		id: NonEmptyString,
		...extraFields
	}, { additionalProperties: false }), Type.Object({
		jobId: NonEmptyString,
		...extraFields
	}, { additionalProperties: false })]);
}
const CronRunLogJobIdSchema = Type.String({
	minLength: 1,
	pattern: "^[^/\\\\]+$"
});
const CronScheduleSchema = Type.Union([
	Type.Object({
		kind: Type.Literal("at"),
		at: NonEmptyString
	}, { additionalProperties: false }),
	Type.Object({
		kind: Type.Literal("every"),
		everyMs: Type.Integer({ minimum: 1 }),
		anchorMs: Type.Optional(Type.Integer({ minimum: 0 }))
	}, { additionalProperties: false }),
	Type.Object({
		kind: Type.Literal("cron"),
		expr: NonEmptyString,
		tz: Type.Optional(Type.String()),
		staggerMs: Type.Optional(Type.Integer({ minimum: 0 }))
	}, { additionalProperties: false })
]);
const CronPayloadSchema = Type.Union([Type.Object({
	kind: Type.Literal("systemEvent"),
	text: NonEmptyString
}, { additionalProperties: false }), cronAgentTurnPayloadSchema({
	message: NonEmptyString,
	toolsAllow: Type.Array(Type.String())
})]);
const CronPayloadPatchSchema = Type.Union([Type.Object({
	kind: Type.Literal("systemEvent"),
	text: Type.Optional(NonEmptyString)
}, { additionalProperties: false }), cronAgentTurnPayloadSchema({
	message: Type.Optional(NonEmptyString),
	toolsAllow: Type.Union([Type.Array(Type.String()), Type.Null()])
})]);
const CronFailureAlertSchema = Type.Object({
	after: Type.Optional(Type.Integer({ minimum: 1 })),
	channel: Type.Optional(Type.Union([Type.Literal("last"), NonEmptyString])),
	to: Type.Optional(Type.String()),
	cooldownMs: Type.Optional(Type.Integer({ minimum: 0 })),
	mode: Type.Optional(Type.Union([Type.Literal("announce"), Type.Literal("webhook")])),
	accountId: Type.Optional(NonEmptyString)
}, { additionalProperties: false });
const CronFailureDestinationSchema = Type.Object({
	channel: Type.Optional(Type.Union([Type.Literal("last"), NonEmptyString])),
	to: Type.Optional(Type.String()),
	accountId: Type.Optional(NonEmptyString),
	mode: Type.Optional(Type.Union([Type.Literal("announce"), Type.Literal("webhook")]))
}, { additionalProperties: false });
const CronDeliverySharedProperties = {
	channel: Type.Optional(Type.Union([Type.Literal("last"), NonEmptyString])),
	accountId: Type.Optional(NonEmptyString),
	bestEffort: Type.Optional(Type.Boolean()),
	failureDestination: Type.Optional(CronFailureDestinationSchema)
};
const CronDeliveryNoopSchema = Type.Object({
	mode: Type.Literal("none"),
	...CronDeliverySharedProperties,
	to: Type.Optional(Type.String())
}, { additionalProperties: false });
const CronDeliveryAnnounceSchema = Type.Object({
	mode: Type.Literal("announce"),
	...CronDeliverySharedProperties,
	to: Type.Optional(Type.String())
}, { additionalProperties: false });
const CronDeliveryWebhookSchema = Type.Object({
	mode: Type.Literal("webhook"),
	...CronDeliverySharedProperties,
	to: NonEmptyString
}, { additionalProperties: false });
const CronDeliverySchema = Type.Union([
	CronDeliveryNoopSchema,
	CronDeliveryAnnounceSchema,
	CronDeliveryWebhookSchema
]);
const CronDeliveryPatchSchema = Type.Object({
	mode: Type.Optional(Type.Union([
		Type.Literal("none"),
		Type.Literal("announce"),
		Type.Literal("webhook")
	])),
	...CronDeliverySharedProperties,
	to: Type.Optional(Type.String())
}, { additionalProperties: false });
const CronJobStateSchema = Type.Object({
	nextRunAtMs: Type.Optional(Type.Integer({ minimum: 0 })),
	runningAtMs: Type.Optional(Type.Integer({ minimum: 0 })),
	lastRunAtMs: Type.Optional(Type.Integer({ minimum: 0 })),
	lastRunStatus: Type.Optional(CronRunStatusSchema),
	lastStatus: Type.Optional(CronRunStatusSchema),
	lastError: Type.Optional(Type.String()),
	lastErrorReason: Type.Optional(CronFailoverReasonSchema),
	lastDurationMs: Type.Optional(Type.Integer({ minimum: 0 })),
	consecutiveErrors: Type.Optional(Type.Integer({ minimum: 0 })),
	lastDelivered: Type.Optional(Type.Boolean()),
	lastDeliveryStatus: Type.Optional(CronDeliveryStatusSchema),
	lastDeliveryError: Type.Optional(Type.String()),
	lastFailureAlertAtMs: Type.Optional(Type.Integer({ minimum: 0 }))
}, { additionalProperties: false });
Type.Object({
	id: NonEmptyString,
	agentId: Type.Optional(NonEmptyString),
	sessionKey: Type.Optional(NonEmptyString),
	name: NonEmptyString,
	description: Type.Optional(Type.String()),
	enabled: Type.Boolean(),
	deleteAfterRun: Type.Optional(Type.Boolean()),
	createdAtMs: Type.Integer({ minimum: 0 }),
	updatedAtMs: Type.Integer({ minimum: 0 }),
	schedule: CronScheduleSchema,
	sessionTarget: CronSessionTargetSchema,
	wakeMode: CronWakeModeSchema,
	payload: CronPayloadSchema,
	delivery: Type.Optional(CronDeliverySchema),
	failureAlert: Type.Optional(Type.Union([Type.Literal(false), CronFailureAlertSchema])),
	state: CronJobStateSchema
}, { additionalProperties: false });
const CronListParamsSchema = Type.Object({
	includeDisabled: Type.Optional(Type.Boolean()),
	limit: Type.Optional(Type.Integer({
		minimum: 1,
		maximum: 200
	})),
	offset: Type.Optional(Type.Integer({ minimum: 0 })),
	query: Type.Optional(Type.String()),
	enabled: Type.Optional(CronJobsEnabledFilterSchema),
	sortBy: Type.Optional(CronJobsSortBySchema),
	sortDir: Type.Optional(CronSortDirSchema)
}, { additionalProperties: false });
const CronStatusParamsSchema = Type.Object({}, { additionalProperties: false });
const CronAddParamsSchema = Type.Object({
	name: NonEmptyString,
	...CronCommonOptionalFields,
	schedule: CronScheduleSchema,
	sessionTarget: CronSessionTargetSchema,
	wakeMode: CronWakeModeSchema,
	payload: CronPayloadSchema,
	delivery: Type.Optional(CronDeliverySchema),
	failureAlert: Type.Optional(Type.Union([Type.Literal(false), CronFailureAlertSchema]))
}, { additionalProperties: false });
const CronUpdateParamsSchema = cronIdOrJobIdParams({ patch: Type.Object({
	name: Type.Optional(NonEmptyString),
	...CronCommonOptionalFields,
	schedule: Type.Optional(CronScheduleSchema),
	sessionTarget: Type.Optional(CronSessionTargetSchema),
	wakeMode: Type.Optional(CronWakeModeSchema),
	payload: Type.Optional(CronPayloadPatchSchema),
	delivery: Type.Optional(CronDeliveryPatchSchema),
	failureAlert: Type.Optional(Type.Union([Type.Literal(false), CronFailureAlertSchema])),
	state: Type.Optional(Type.Partial(CronJobStateSchema))
}, { additionalProperties: false }) });
const CronRemoveParamsSchema = cronIdOrJobIdParams({});
const CronRunParamsSchema = cronIdOrJobIdParams({ mode: Type.Optional(Type.Union([Type.Literal("due"), Type.Literal("force")])) });
const CronRunsParamsSchema = Type.Object({
	scope: Type.Optional(Type.Union([Type.Literal("job"), Type.Literal("all")])),
	id: Type.Optional(CronRunLogJobIdSchema),
	jobId: Type.Optional(CronRunLogJobIdSchema),
	limit: Type.Optional(Type.Integer({
		minimum: 1,
		maximum: 200
	})),
	offset: Type.Optional(Type.Integer({ minimum: 0 })),
	statuses: Type.Optional(Type.Array(CronRunsStatusValueSchema, {
		minItems: 1,
		maxItems: 3
	})),
	status: Type.Optional(CronRunsStatusFilterSchema),
	deliveryStatuses: Type.Optional(Type.Array(CronDeliveryStatusSchema, {
		minItems: 1,
		maxItems: 4
	})),
	deliveryStatus: Type.Optional(CronDeliveryStatusSchema),
	query: Type.Optional(Type.String()),
	sortDir: Type.Optional(CronSortDirSchema)
}, { additionalProperties: false });
Type.Object({
	ts: Type.Integer({ minimum: 0 }),
	jobId: NonEmptyString,
	action: Type.Literal("finished"),
	status: Type.Optional(CronRunStatusSchema),
	error: Type.Optional(Type.String()),
	summary: Type.Optional(Type.String()),
	delivered: Type.Optional(Type.Boolean()),
	deliveryStatus: Type.Optional(CronDeliveryStatusSchema),
	deliveryError: Type.Optional(Type.String()),
	sessionId: Type.Optional(NonEmptyString),
	sessionKey: Type.Optional(NonEmptyString),
	runAtMs: Type.Optional(Type.Integer({ minimum: 0 })),
	durationMs: Type.Optional(Type.Integer({ minimum: 0 })),
	nextRunAtMs: Type.Optional(Type.Integer({ minimum: 0 })),
	model: Type.Optional(Type.String()),
	provider: Type.Optional(Type.String()),
	usage: Type.Optional(Type.Object({
		input_tokens: Type.Optional(Type.Number()),
		output_tokens: Type.Optional(Type.Number()),
		total_tokens: Type.Optional(Type.Number()),
		cache_read_tokens: Type.Optional(Type.Number()),
		cache_write_tokens: Type.Optional(Type.Number())
	}, { additionalProperties: false })),
	jobName: Type.Optional(Type.String())
}, { additionalProperties: false });
//#endregion
//#region src/gateway/protocol/schema/error-codes.ts
const ErrorCodes = {
	NOT_LINKED: "NOT_LINKED",
	NOT_PAIRED: "NOT_PAIRED",
	AGENT_TIMEOUT: "AGENT_TIMEOUT",
	INVALID_REQUEST: "INVALID_REQUEST",
	APPROVAL_NOT_FOUND: "APPROVAL_NOT_FOUND",
	UNAVAILABLE: "UNAVAILABLE"
};
function errorShape(code, message, opts) {
	return {
		code,
		message,
		...opts
	};
}
//#endregion
//#region src/gateway/protocol/schema/exec-approvals.ts
const ExecApprovalsAllowlistEntrySchema = Type.Object({
	id: Type.Optional(NonEmptyString),
	pattern: Type.String(),
	argPattern: Type.Optional(Type.String()),
	lastUsedAt: Type.Optional(Type.Integer({ minimum: 0 })),
	lastUsedCommand: Type.Optional(Type.String()),
	lastResolvedPath: Type.Optional(Type.String())
}, { additionalProperties: false });
const ExecApprovalsPolicyFields = {
	security: Type.Optional(Type.String()),
	ask: Type.Optional(Type.String()),
	askFallback: Type.Optional(Type.String()),
	autoAllowSkills: Type.Optional(Type.Boolean())
};
const ExecApprovalsDefaultsSchema = Type.Object(ExecApprovalsPolicyFields, { additionalProperties: false });
const ExecApprovalsAgentSchema = Type.Object({
	...ExecApprovalsPolicyFields,
	allowlist: Type.Optional(Type.Array(ExecApprovalsAllowlistEntrySchema))
}, { additionalProperties: false });
const ExecApprovalsFileSchema = Type.Object({
	version: Type.Literal(1),
	socket: Type.Optional(Type.Object({
		path: Type.Optional(Type.String()),
		token: Type.Optional(Type.String())
	}, { additionalProperties: false })),
	defaults: Type.Optional(ExecApprovalsDefaultsSchema),
	agents: Type.Optional(Type.Record(Type.String(), ExecApprovalsAgentSchema))
}, { additionalProperties: false });
Type.Object({
	path: NonEmptyString,
	exists: Type.Boolean(),
	hash: NonEmptyString,
	file: ExecApprovalsFileSchema
}, { additionalProperties: false });
const ExecApprovalsGetParamsSchema = Type.Object({}, { additionalProperties: false });
const ExecApprovalsSetParamsSchema = Type.Object({
	file: ExecApprovalsFileSchema,
	baseHash: Type.Optional(NonEmptyString)
}, { additionalProperties: false });
const ExecApprovalsNodeGetParamsSchema = Type.Object({ nodeId: NonEmptyString }, { additionalProperties: false });
const ExecApprovalsNodeSetParamsSchema = Type.Object({
	nodeId: NonEmptyString,
	file: ExecApprovalsFileSchema,
	baseHash: Type.Optional(NonEmptyString)
}, { additionalProperties: false });
const ExecApprovalGetParamsSchema = Type.Object({ id: NonEmptyString }, { additionalProperties: false });
const ExecApprovalRequestParamsSchema = Type.Object({
	id: Type.Optional(NonEmptyString),
	command: Type.Optional(NonEmptyString),
	commandArgv: Type.Optional(Type.Array(Type.String())),
	systemRunPlan: Type.Optional(Type.Object({
		argv: Type.Array(Type.String()),
		cwd: Type.Union([Type.String(), Type.Null()]),
		commandText: Type.String(),
		commandPreview: Type.Optional(Type.Union([Type.String(), Type.Null()])),
		agentId: Type.Union([Type.String(), Type.Null()]),
		sessionKey: Type.Union([Type.String(), Type.Null()]),
		mutableFileOperand: Type.Optional(Type.Union([Type.Object({
			argvIndex: Type.Integer({ minimum: 0 }),
			path: Type.String(),
			sha256: Type.String()
		}, { additionalProperties: false }), Type.Null()]))
	}, { additionalProperties: false })),
	env: Type.Optional(Type.Record(NonEmptyString, Type.String())),
	cwd: Type.Optional(Type.Union([Type.String(), Type.Null()])),
	nodeId: Type.Optional(Type.Union([NonEmptyString, Type.Null()])),
	host: Type.Optional(Type.Union([Type.String(), Type.Null()])),
	security: Type.Optional(Type.Union([Type.String(), Type.Null()])),
	ask: Type.Optional(Type.Union([Type.String(), Type.Null()])),
	agentId: Type.Optional(Type.Union([Type.String(), Type.Null()])),
	resolvedPath: Type.Optional(Type.Union([Type.String(), Type.Null()])),
	sessionKey: Type.Optional(Type.Union([Type.String(), Type.Null()])),
	turnSourceChannel: Type.Optional(Type.Union([Type.String(), Type.Null()])),
	turnSourceTo: Type.Optional(Type.Union([Type.String(), Type.Null()])),
	turnSourceAccountId: Type.Optional(Type.Union([Type.String(), Type.Null()])),
	turnSourceThreadId: Type.Optional(Type.Union([
		Type.String(),
		Type.Number(),
		Type.Null()
	])),
	timeoutMs: Type.Optional(Type.Integer({ minimum: 1 })),
	twoPhase: Type.Optional(Type.Boolean())
}, { additionalProperties: false });
const ExecApprovalResolveParamsSchema = Type.Object({
	id: NonEmptyString,
	decision: NonEmptyString
}, { additionalProperties: false });
//#endregion
//#region src/gateway/protocol/schema/devices.ts
const DevicePairListParamsSchema = Type.Object({}, { additionalProperties: false });
const DevicePairApproveParamsSchema = Type.Object({ requestId: NonEmptyString }, { additionalProperties: false });
const DevicePairRejectParamsSchema = Type.Object({ requestId: NonEmptyString }, { additionalProperties: false });
const DevicePairRemoveParamsSchema = Type.Object({ deviceId: NonEmptyString }, { additionalProperties: false });
const DeviceTokenRotateParamsSchema = Type.Object({
	deviceId: NonEmptyString,
	role: NonEmptyString,
	scopes: Type.Optional(Type.Array(NonEmptyString))
}, { additionalProperties: false });
const DeviceTokenRevokeParamsSchema = Type.Object({
	deviceId: NonEmptyString,
	role: NonEmptyString
}, { additionalProperties: false });
Type.Object({
	requestId: NonEmptyString,
	deviceId: NonEmptyString,
	publicKey: NonEmptyString,
	displayName: Type.Optional(NonEmptyString),
	platform: Type.Optional(NonEmptyString),
	deviceFamily: Type.Optional(NonEmptyString),
	clientId: Type.Optional(NonEmptyString),
	clientMode: Type.Optional(NonEmptyString),
	role: Type.Optional(NonEmptyString),
	roles: Type.Optional(Type.Array(NonEmptyString)),
	scopes: Type.Optional(Type.Array(NonEmptyString)),
	remoteIp: Type.Optional(NonEmptyString),
	silent: Type.Optional(Type.Boolean()),
	isRepair: Type.Optional(Type.Boolean()),
	ts: Type.Integer({ minimum: 0 })
}, { additionalProperties: false });
Type.Object({
	requestId: NonEmptyString,
	deviceId: NonEmptyString,
	decision: NonEmptyString,
	ts: Type.Integer({ minimum: 0 })
}, { additionalProperties: false });
//#endregion
//#region src/gateway/protocol/schema/snapshot.ts
const PresenceEntrySchema = Type.Object({
	host: Type.Optional(NonEmptyString),
	ip: Type.Optional(NonEmptyString),
	version: Type.Optional(NonEmptyString),
	platform: Type.Optional(NonEmptyString),
	deviceFamily: Type.Optional(NonEmptyString),
	modelIdentifier: Type.Optional(NonEmptyString),
	mode: Type.Optional(NonEmptyString),
	lastInputSeconds: Type.Optional(Type.Integer({ minimum: 0 })),
	reason: Type.Optional(NonEmptyString),
	tags: Type.Optional(Type.Array(NonEmptyString)),
	text: Type.Optional(Type.String()),
	ts: Type.Integer({ minimum: 0 }),
	deviceId: Type.Optional(NonEmptyString),
	roles: Type.Optional(Type.Array(NonEmptyString)),
	scopes: Type.Optional(Type.Array(NonEmptyString)),
	instanceId: Type.Optional(NonEmptyString)
}, { additionalProperties: false });
const HealthSnapshotSchema = Type.Any();
const SessionDefaultsSchema = Type.Object({
	defaultAgentId: NonEmptyString,
	mainKey: NonEmptyString,
	mainSessionKey: NonEmptyString,
	scope: Type.Optional(NonEmptyString)
}, { additionalProperties: false });
const StateVersionSchema = Type.Object({
	presence: Type.Integer({ minimum: 0 }),
	health: Type.Integer({ minimum: 0 })
}, { additionalProperties: false });
const SnapshotSchema = Type.Object({
	presence: Type.Array(PresenceEntrySchema),
	health: HealthSnapshotSchema,
	stateVersion: StateVersionSchema,
	uptimeMs: Type.Integer({ minimum: 0 }),
	configPath: Type.Optional(NonEmptyString),
	stateDir: Type.Optional(NonEmptyString),
	sessionDefaults: Type.Optional(SessionDefaultsSchema),
	authMode: Type.Optional(Type.Union([
		Type.Literal("none"),
		Type.Literal("token"),
		Type.Literal("password"),
		Type.Literal("trusted-proxy")
	])),
	updateAvailable: Type.Optional(Type.Object({
		currentVersion: NonEmptyString,
		latestVersion: NonEmptyString,
		channel: NonEmptyString
	}))
}, { additionalProperties: false });
Type.Object({ ts: Type.Integer({ minimum: 0 }) }, { additionalProperties: false });
Type.Object({
	reason: NonEmptyString,
	restartExpectedMs: Type.Optional(Type.Integer({ minimum: 0 }))
}, { additionalProperties: false });
const ConnectParamsSchema = Type.Object({
	minProtocol: Type.Integer({ minimum: 1 }),
	maxProtocol: Type.Integer({ minimum: 1 }),
	client: Type.Object({
		id: GatewayClientIdSchema,
		displayName: Type.Optional(NonEmptyString),
		version: NonEmptyString,
		platform: NonEmptyString,
		deviceFamily: Type.Optional(NonEmptyString),
		modelIdentifier: Type.Optional(NonEmptyString),
		mode: GatewayClientModeSchema,
		instanceId: Type.Optional(NonEmptyString)
	}, { additionalProperties: false }),
	caps: Type.Optional(Type.Array(NonEmptyString, { default: [] })),
	commands: Type.Optional(Type.Array(NonEmptyString)),
	permissions: Type.Optional(Type.Record(NonEmptyString, Type.Boolean())),
	pathEnv: Type.Optional(Type.String()),
	role: Type.Optional(NonEmptyString),
	scopes: Type.Optional(Type.Array(NonEmptyString)),
	device: Type.Optional(Type.Object({
		id: NonEmptyString,
		publicKey: NonEmptyString,
		signature: NonEmptyString,
		signedAt: Type.Integer({ minimum: 0 }),
		nonce: NonEmptyString
	}, { additionalProperties: false })),
	auth: Type.Optional(Type.Object({
		token: Type.Optional(Type.String()),
		bootstrapToken: Type.Optional(Type.String()),
		deviceToken: Type.Optional(Type.String()),
		password: Type.Optional(Type.String())
	}, { additionalProperties: false })),
	locale: Type.Optional(Type.String()),
	userAgent: Type.Optional(Type.String())
}, { additionalProperties: false });
Type.Object({
	type: Type.Literal("hello-ok"),
	protocol: Type.Integer({ minimum: 1 }),
	server: Type.Object({
		version: NonEmptyString,
		connId: NonEmptyString
	}, { additionalProperties: false }),
	features: Type.Object({
		methods: Type.Array(NonEmptyString),
		events: Type.Array(NonEmptyString)
	}, { additionalProperties: false }),
	snapshot: SnapshotSchema,
	canvasHostUrl: Type.Optional(NonEmptyString),
	auth: Type.Optional(Type.Object({
		deviceToken: Type.Optional(NonEmptyString),
		role: NonEmptyString,
		scopes: Type.Array(NonEmptyString),
		issuedAtMs: Type.Optional(Type.Integer({ minimum: 0 })),
		deviceTokens: Type.Optional(Type.Array(Type.Object({
			deviceToken: NonEmptyString,
			role: NonEmptyString,
			scopes: Type.Array(NonEmptyString),
			issuedAtMs: Type.Integer({ minimum: 0 })
		}, { additionalProperties: false })))
	}, { additionalProperties: false })),
	policy: Type.Object({
		maxPayload: Type.Integer({ minimum: 1 }),
		maxBufferedBytes: Type.Integer({ minimum: 1 }),
		tickIntervalMs: Type.Integer({ minimum: 1 })
	}, { additionalProperties: false })
}, { additionalProperties: false });
const ErrorShapeSchema = Type.Object({
	code: NonEmptyString,
	message: NonEmptyString,
	details: Type.Optional(Type.Unknown()),
	retryable: Type.Optional(Type.Boolean()),
	retryAfterMs: Type.Optional(Type.Integer({ minimum: 0 }))
}, { additionalProperties: false });
const RequestFrameSchema = Type.Object({
	type: Type.Literal("req"),
	id: NonEmptyString,
	method: NonEmptyString,
	params: Type.Optional(Type.Unknown())
}, { additionalProperties: false });
const ResponseFrameSchema = Type.Object({
	type: Type.Literal("res"),
	id: NonEmptyString,
	ok: Type.Boolean(),
	payload: Type.Optional(Type.Unknown()),
	error: Type.Optional(ErrorShapeSchema)
}, { additionalProperties: false });
const EventFrameSchema = Type.Object({
	type: Type.Literal("event"),
	event: NonEmptyString,
	payload: Type.Optional(Type.Unknown()),
	seq: Type.Optional(Type.Integer({ minimum: 0 })),
	stateVersion: Type.Optional(StateVersionSchema)
}, { additionalProperties: false });
Type.Union([
	RequestFrameSchema,
	ResponseFrameSchema,
	EventFrameSchema
], { discriminator: "type" });
//#endregion
//#region src/gateway/protocol/schema/logs-chat.ts
const LogsTailParamsSchema = Type.Object({
	cursor: Type.Optional(Type.Integer({ minimum: 0 })),
	limit: Type.Optional(Type.Integer({
		minimum: 1,
		maximum: 5e3
	})),
	maxBytes: Type.Optional(Type.Integer({
		minimum: 1,
		maximum: 1e6
	}))
}, { additionalProperties: false });
Type.Object({
	file: NonEmptyString,
	cursor: Type.Integer({ minimum: 0 }),
	size: Type.Integer({ minimum: 0 }),
	lines: Type.Array(Type.String()),
	truncated: Type.Optional(Type.Boolean()),
	reset: Type.Optional(Type.Boolean())
}, { additionalProperties: false });
const ChatHistoryParamsSchema = Type.Object({
	sessionKey: NonEmptyString,
	limit: Type.Optional(Type.Integer({
		minimum: 1,
		maximum: 1e3
	})),
	maxChars: Type.Optional(Type.Integer({
		minimum: 1,
		maximum: 5e5
	}))
}, { additionalProperties: false });
const ChatSendParamsSchema = Type.Object({
	sessionKey: ChatSendSessionKeyString,
	message: Type.String(),
	thinking: Type.Optional(Type.String()),
	deliver: Type.Optional(Type.Boolean()),
	originatingChannel: Type.Optional(Type.String()),
	originatingTo: Type.Optional(Type.String()),
	originatingAccountId: Type.Optional(Type.String()),
	originatingThreadId: Type.Optional(Type.String()),
	attachments: Type.Optional(Type.Array(Type.Unknown())),
	timeoutMs: Type.Optional(Type.Integer({ minimum: 0 })),
	systemInputProvenance: Type.Optional(InputProvenanceSchema),
	systemProvenanceReceipt: Type.Optional(Type.String()),
	idempotencyKey: NonEmptyString
}, { additionalProperties: false });
const ChatAbortParamsSchema = Type.Object({
	sessionKey: NonEmptyString,
	runId: Type.Optional(NonEmptyString)
}, { additionalProperties: false });
const ChatInjectParamsSchema = Type.Object({
	sessionKey: NonEmptyString,
	message: NonEmptyString,
	label: Type.Optional(Type.String({ maxLength: 100 }))
}, { additionalProperties: false });
const ChatEventSchema = Type.Object({
	runId: NonEmptyString,
	sessionKey: NonEmptyString,
	seq: Type.Integer({ minimum: 0 }),
	state: Type.Union([
		Type.Literal("delta"),
		Type.Literal("final"),
		Type.Literal("aborted"),
		Type.Literal("error")
	]),
	message: Type.Optional(Type.Unknown()),
	errorMessage: Type.Optional(Type.String()),
	errorKind: Type.Optional(Type.Union([
		Type.Literal("refusal"),
		Type.Literal("timeout"),
		Type.Literal("rate_limit"),
		Type.Literal("context_length"),
		Type.Literal("unknown")
	])),
	usage: Type.Optional(Type.Unknown()),
	stopReason: Type.Optional(Type.String())
}, { additionalProperties: false });
//#endregion
//#region src/gateway/protocol/schema/nodes.ts
const NodePendingWorkTypeSchema = Type.String({ enum: ["status.request", "location.request"] });
const NodePendingWorkPrioritySchema = Type.String({ enum: ["normal", "high"] });
const NodePairRequestParamsSchema = Type.Object({
	nodeId: NonEmptyString,
	displayName: Type.Optional(NonEmptyString),
	platform: Type.Optional(NonEmptyString),
	version: Type.Optional(NonEmptyString),
	coreVersion: Type.Optional(NonEmptyString),
	uiVersion: Type.Optional(NonEmptyString),
	deviceFamily: Type.Optional(NonEmptyString),
	modelIdentifier: Type.Optional(NonEmptyString),
	caps: Type.Optional(Type.Array(NonEmptyString)),
	commands: Type.Optional(Type.Array(NonEmptyString)),
	remoteIp: Type.Optional(NonEmptyString),
	silent: Type.Optional(Type.Boolean())
}, { additionalProperties: false });
const NodePairListParamsSchema = Type.Object({}, { additionalProperties: false });
const NodePairApproveParamsSchema = Type.Object({ requestId: NonEmptyString }, { additionalProperties: false });
const NodePairRejectParamsSchema = Type.Object({ requestId: NonEmptyString }, { additionalProperties: false });
const NodePairVerifyParamsSchema = Type.Object({
	nodeId: NonEmptyString,
	token: NonEmptyString
}, { additionalProperties: false });
const NodeRenameParamsSchema = Type.Object({
	nodeId: NonEmptyString,
	displayName: NonEmptyString
}, { additionalProperties: false });
const NodeListParamsSchema = Type.Object({}, { additionalProperties: false });
const NodePendingAckParamsSchema = Type.Object({ ids: Type.Array(NonEmptyString, { minItems: 1 }) }, { additionalProperties: false });
const NodeDescribeParamsSchema = Type.Object({ nodeId: NonEmptyString }, { additionalProperties: false });
const NodeInvokeParamsSchema = Type.Object({
	nodeId: NonEmptyString,
	command: NonEmptyString,
	params: Type.Optional(Type.Unknown()),
	timeoutMs: Type.Optional(Type.Integer({ minimum: 0 })),
	idempotencyKey: NonEmptyString
}, { additionalProperties: false });
const NodeInvokeResultParamsSchema = Type.Object({
	id: NonEmptyString,
	nodeId: NonEmptyString,
	ok: Type.Boolean(),
	payload: Type.Optional(Type.Unknown()),
	payloadJSON: Type.Optional(Type.String()),
	error: Type.Optional(Type.Object({
		code: Type.Optional(NonEmptyString),
		message: Type.Optional(NonEmptyString)
	}, { additionalProperties: false }))
}, { additionalProperties: false });
const NodeEventParamsSchema = Type.Object({
	event: NonEmptyString,
	payload: Type.Optional(Type.Unknown()),
	payloadJSON: Type.Optional(Type.String())
}, { additionalProperties: false });
const NodePendingDrainParamsSchema = Type.Object({ maxItems: Type.Optional(Type.Integer({
	minimum: 1,
	maximum: 10
})) }, { additionalProperties: false });
const NodePendingDrainItemSchema = Type.Object({
	id: NonEmptyString,
	type: NodePendingWorkTypeSchema,
	priority: Type.String({ enum: [
		"default",
		"normal",
		"high"
	] }),
	createdAtMs: Type.Integer({ minimum: 0 }),
	expiresAtMs: Type.Optional(Type.Union([Type.Integer({ minimum: 0 }), Type.Null()])),
	payload: Type.Optional(Type.Record(Type.String(), Type.Unknown()))
}, { additionalProperties: false });
Type.Object({
	nodeId: NonEmptyString,
	revision: Type.Integer({ minimum: 0 }),
	items: Type.Array(NodePendingDrainItemSchema),
	hasMore: Type.Boolean()
}, { additionalProperties: false });
const NodePendingEnqueueParamsSchema = Type.Object({
	nodeId: NonEmptyString,
	type: NodePendingWorkTypeSchema,
	priority: Type.Optional(NodePendingWorkPrioritySchema),
	expiresInMs: Type.Optional(Type.Integer({
		minimum: 1e3,
		maximum: 864e5
	})),
	wake: Type.Optional(Type.Boolean())
}, { additionalProperties: false });
Type.Object({
	nodeId: NonEmptyString,
	revision: Type.Integer({ minimum: 0 }),
	queued: NodePendingDrainItemSchema,
	wakeTriggered: Type.Boolean()
}, { additionalProperties: false });
Type.Object({
	id: NonEmptyString,
	nodeId: NonEmptyString,
	command: NonEmptyString,
	paramsJSON: Type.Optional(Type.String()),
	timeoutMs: Type.Optional(Type.Integer({ minimum: 0 })),
	idempotencyKey: Type.Optional(NonEmptyString)
}, { additionalProperties: false });
//#endregion
//#region src/gateway/protocol/schema/plugin-approvals.ts
const PluginApprovalRequestParamsSchema = Type.Object({
	pluginId: Type.Optional(NonEmptyString),
	title: Type.String({
		minLength: 1,
		maxLength: 80
	}),
	description: Type.String({
		minLength: 1,
		maxLength: 256
	}),
	severity: Type.Optional(Type.String({ enum: [
		"info",
		"warning",
		"critical"
	] })),
	toolName: Type.Optional(Type.String()),
	toolCallId: Type.Optional(Type.String()),
	agentId: Type.Optional(Type.String()),
	sessionKey: Type.Optional(Type.String()),
	turnSourceChannel: Type.Optional(Type.String()),
	turnSourceTo: Type.Optional(Type.String()),
	turnSourceAccountId: Type.Optional(Type.String()),
	turnSourceThreadId: Type.Optional(Type.Union([Type.String(), Type.Number()])),
	timeoutMs: Type.Optional(Type.Integer({
		minimum: 1,
		maximum: MAX_PLUGIN_APPROVAL_TIMEOUT_MS
	})),
	twoPhase: Type.Optional(Type.Boolean())
}, { additionalProperties: false });
const PluginApprovalResolveParamsSchema = Type.Object({
	id: NonEmptyString,
	decision: NonEmptyString
}, { additionalProperties: false });
//#endregion
//#region src/gateway/protocol/schema/push.ts
const ApnsEnvironmentSchema = Type.String({ enum: ["sandbox", "production"] });
const PushTestParamsSchema = Type.Object({
	nodeId: NonEmptyString,
	title: Type.Optional(Type.String()),
	body: Type.Optional(Type.String()),
	environment: Type.Optional(ApnsEnvironmentSchema)
}, { additionalProperties: false });
Type.Object({
	ok: Type.Boolean(),
	status: Type.Integer(),
	apnsId: Type.Optional(Type.String()),
	reason: Type.Optional(Type.String()),
	tokenSuffix: Type.String(),
	topic: Type.String(),
	environment: ApnsEnvironmentSchema,
	transport: Type.String({ enum: ["direct", "relay"] })
}, { additionalProperties: false });
Type.Object({}, { additionalProperties: false });
const SecretsResolveParamsSchema = Type.Object({
	commandName: NonEmptyString,
	targetIds: Type.Array(NonEmptyString)
}, { additionalProperties: false });
const SecretsResolveAssignmentSchema = Type.Object({
	path: Type.Optional(NonEmptyString),
	pathSegments: Type.Array(NonEmptyString),
	value: Type.Unknown()
}, { additionalProperties: false });
const SecretsResolveResultSchema = Type.Object({
	ok: Type.Optional(Type.Boolean()),
	assignments: Type.Optional(Type.Array(SecretsResolveAssignmentSchema)),
	diagnostics: Type.Optional(Type.Array(NonEmptyString)),
	inactiveRefPaths: Type.Optional(Type.Array(NonEmptyString))
}, { additionalProperties: false });
//#endregion
//#region src/gateway/protocol/schema/sessions.ts
const SessionCompactionCheckpointReasonSchema = Type.Union([
	Type.Literal("manual"),
	Type.Literal("auto-threshold"),
	Type.Literal("overflow-retry"),
	Type.Literal("timeout-retry")
]);
const SessionCompactionTranscriptReferenceSchema = Type.Object({
	sessionId: NonEmptyString,
	sessionFile: Type.Optional(NonEmptyString),
	leafId: Type.Optional(NonEmptyString),
	entryId: Type.Optional(NonEmptyString)
}, { additionalProperties: false });
const SessionCompactionCheckpointSchema = Type.Object({
	checkpointId: NonEmptyString,
	sessionKey: NonEmptyString,
	sessionId: NonEmptyString,
	createdAt: Type.Integer({ minimum: 0 }),
	reason: SessionCompactionCheckpointReasonSchema,
	tokensBefore: Type.Optional(Type.Integer({ minimum: 0 })),
	tokensAfter: Type.Optional(Type.Integer({ minimum: 0 })),
	summary: Type.Optional(Type.String()),
	firstKeptEntryId: Type.Optional(NonEmptyString),
	preCompaction: SessionCompactionTranscriptReferenceSchema,
	postCompaction: SessionCompactionTranscriptReferenceSchema
}, { additionalProperties: false });
const SessionsListParamsSchema = Type.Object({
	limit: Type.Optional(Type.Integer({ minimum: 1 })),
	activeMinutes: Type.Optional(Type.Integer({ minimum: 1 })),
	includeGlobal: Type.Optional(Type.Boolean()),
	includeUnknown: Type.Optional(Type.Boolean()),
	includeDerivedTitles: Type.Optional(Type.Boolean()),
	includeLastMessage: Type.Optional(Type.Boolean()),
	label: Type.Optional(SessionLabelString),
	spawnedBy: Type.Optional(NonEmptyString),
	agentId: Type.Optional(NonEmptyString),
	search: Type.Optional(Type.String())
}, { additionalProperties: false });
const SessionsPreviewParamsSchema = Type.Object({
	keys: Type.Array(NonEmptyString, { minItems: 1 }),
	limit: Type.Optional(Type.Integer({ minimum: 1 })),
	maxChars: Type.Optional(Type.Integer({ minimum: 20 }))
}, { additionalProperties: false });
const SessionsResolveParamsSchema = Type.Object({
	key: Type.Optional(NonEmptyString),
	sessionId: Type.Optional(NonEmptyString),
	label: Type.Optional(SessionLabelString),
	agentId: Type.Optional(NonEmptyString),
	spawnedBy: Type.Optional(NonEmptyString),
	includeGlobal: Type.Optional(Type.Boolean()),
	includeUnknown: Type.Optional(Type.Boolean())
}, { additionalProperties: false });
const SessionsCreateParamsSchema = Type.Object({
	key: Type.Optional(NonEmptyString),
	agentId: Type.Optional(NonEmptyString),
	label: Type.Optional(SessionLabelString),
	model: Type.Optional(NonEmptyString),
	parentSessionKey: Type.Optional(NonEmptyString),
	task: Type.Optional(Type.String()),
	message: Type.Optional(Type.String())
}, { additionalProperties: false });
const SessionsSendParamsSchema = Type.Object({
	key: NonEmptyString,
	message: Type.String(),
	thinking: Type.Optional(Type.String()),
	attachments: Type.Optional(Type.Array(Type.Unknown())),
	timeoutMs: Type.Optional(Type.Integer({ minimum: 0 })),
	idempotencyKey: Type.Optional(NonEmptyString)
}, { additionalProperties: false });
const SessionsMessagesSubscribeParamsSchema = Type.Object({ key: NonEmptyString }, { additionalProperties: false });
const SessionsMessagesUnsubscribeParamsSchema = Type.Object({ key: NonEmptyString }, { additionalProperties: false });
const SessionsAbortParamsSchema = Type.Object({
	key: NonEmptyString,
	runId: Type.Optional(NonEmptyString)
}, { additionalProperties: false });
const SessionsPatchParamsSchema = Type.Object({
	key: NonEmptyString,
	label: Type.Optional(Type.Union([SessionLabelString, Type.Null()])),
	thinkingLevel: Type.Optional(Type.Union([NonEmptyString, Type.Null()])),
	fastMode: Type.Optional(Type.Union([Type.Boolean(), Type.Null()])),
	verboseLevel: Type.Optional(Type.Union([NonEmptyString, Type.Null()])),
	traceLevel: Type.Optional(Type.Union([NonEmptyString, Type.Null()])),
	reasoningLevel: Type.Optional(Type.Union([NonEmptyString, Type.Null()])),
	responseUsage: Type.Optional(Type.Union([
		Type.Literal("off"),
		Type.Literal("tokens"),
		Type.Literal("full"),
		Type.Literal("on"),
		Type.Null()
	])),
	elevatedLevel: Type.Optional(Type.Union([NonEmptyString, Type.Null()])),
	execHost: Type.Optional(Type.Union([NonEmptyString, Type.Null()])),
	execSecurity: Type.Optional(Type.Union([NonEmptyString, Type.Null()])),
	execAsk: Type.Optional(Type.Union([NonEmptyString, Type.Null()])),
	execNode: Type.Optional(Type.Union([NonEmptyString, Type.Null()])),
	model: Type.Optional(Type.Union([NonEmptyString, Type.Null()])),
	spawnedBy: Type.Optional(Type.Union([NonEmptyString, Type.Null()])),
	spawnedWorkspaceDir: Type.Optional(Type.Union([NonEmptyString, Type.Null()])),
	spawnDepth: Type.Optional(Type.Union([Type.Integer({ minimum: 0 }), Type.Null()])),
	subagentRole: Type.Optional(Type.Union([
		Type.Literal("orchestrator"),
		Type.Literal("leaf"),
		Type.Null()
	])),
	subagentControlScope: Type.Optional(Type.Union([
		Type.Literal("children"),
		Type.Literal("none"),
		Type.Null()
	])),
	sendPolicy: Type.Optional(Type.Union([
		Type.Literal("allow"),
		Type.Literal("deny"),
		Type.Null()
	])),
	groupActivation: Type.Optional(Type.Union([
		Type.Literal("mention"),
		Type.Literal("always"),
		Type.Null()
	]))
}, { additionalProperties: false });
const SessionsResetParamsSchema = Type.Object({
	key: NonEmptyString,
	reason: Type.Optional(Type.Union([Type.Literal("new"), Type.Literal("reset")]))
}, { additionalProperties: false });
const SessionsDeleteParamsSchema = Type.Object({
	key: NonEmptyString,
	deleteTranscript: Type.Optional(Type.Boolean()),
	emitLifecycleHooks: Type.Optional(Type.Boolean())
}, { additionalProperties: false });
const SessionsCompactParamsSchema = Type.Object({
	key: NonEmptyString,
	maxLines: Type.Optional(Type.Integer({ minimum: 1 }))
}, { additionalProperties: false });
const SessionsCompactionListParamsSchema = Type.Object({ key: NonEmptyString }, { additionalProperties: false });
const SessionsCompactionGetParamsSchema = Type.Object({
	key: NonEmptyString,
	checkpointId: NonEmptyString
}, { additionalProperties: false });
const SessionsCompactionBranchParamsSchema = Type.Object({
	key: NonEmptyString,
	checkpointId: NonEmptyString
}, { additionalProperties: false });
const SessionsCompactionRestoreParamsSchema = Type.Object({
	key: NonEmptyString,
	checkpointId: NonEmptyString
}, { additionalProperties: false });
Type.Object({
	ok: Type.Literal(true),
	key: NonEmptyString,
	checkpoints: Type.Array(SessionCompactionCheckpointSchema)
}, { additionalProperties: false });
Type.Object({
	ok: Type.Literal(true),
	key: NonEmptyString,
	checkpoint: SessionCompactionCheckpointSchema
}, { additionalProperties: false });
Type.Object({
	ok: Type.Literal(true),
	sourceKey: NonEmptyString,
	key: NonEmptyString,
	sessionId: NonEmptyString,
	checkpoint: SessionCompactionCheckpointSchema,
	entry: Type.Object({
		sessionId: NonEmptyString,
		updatedAt: Type.Integer({ minimum: 0 })
	}, { additionalProperties: true })
}, { additionalProperties: false });
Type.Object({
	ok: Type.Literal(true),
	key: NonEmptyString,
	sessionId: NonEmptyString,
	checkpoint: SessionCompactionCheckpointSchema,
	entry: Type.Object({
		sessionId: NonEmptyString,
		updatedAt: Type.Integer({ minimum: 0 })
	}, { additionalProperties: true })
}, { additionalProperties: false });
const SessionsUsageParamsSchema = Type.Object({
	key: Type.Optional(NonEmptyString),
	startDate: Type.Optional(Type.String({ pattern: "^\\d{4}-\\d{2}-\\d{2}$" })),
	endDate: Type.Optional(Type.String({ pattern: "^\\d{4}-\\d{2}-\\d{2}$" })),
	mode: Type.Optional(Type.Union([
		Type.Literal("utc"),
		Type.Literal("gateway"),
		Type.Literal("specific")
	])),
	utcOffset: Type.Optional(Type.String({ pattern: "^UTC[+-]\\d{1,2}(?::[0-5]\\d)?$" })),
	limit: Type.Optional(Type.Integer({ minimum: 1 })),
	includeContextWeight: Type.Optional(Type.Boolean())
}, { additionalProperties: false });
//#endregion
//#region src/gateway/protocol/schema/wizard.ts
const WizardRunStatusSchema = Type.Union([
	Type.Literal("running"),
	Type.Literal("done"),
	Type.Literal("cancelled"),
	Type.Literal("error")
]);
const WizardStartParamsSchema = Type.Object({
	mode: Type.Optional(Type.Union([Type.Literal("local"), Type.Literal("remote")])),
	workspace: Type.Optional(Type.String())
}, { additionalProperties: false });
const WizardAnswerSchema = Type.Object({
	stepId: NonEmptyString,
	value: Type.Optional(Type.Unknown())
}, { additionalProperties: false });
const WizardNextParamsSchema = Type.Object({
	sessionId: NonEmptyString,
	answer: Type.Optional(WizardAnswerSchema)
}, { additionalProperties: false });
const WizardSessionIdParamsSchema = Type.Object({ sessionId: NonEmptyString }, { additionalProperties: false });
const WizardCancelParamsSchema = WizardSessionIdParamsSchema;
const WizardStatusParamsSchema = WizardSessionIdParamsSchema;
const WizardStepOptionSchema = Type.Object({
	value: Type.Unknown(),
	label: NonEmptyString,
	hint: Type.Optional(Type.String())
}, { additionalProperties: false });
const WizardStepSchema = Type.Object({
	id: NonEmptyString,
	type: Type.Union([
		Type.Literal("note"),
		Type.Literal("select"),
		Type.Literal("text"),
		Type.Literal("confirm"),
		Type.Literal("multiselect"),
		Type.Literal("progress"),
		Type.Literal("action")
	]),
	title: Type.Optional(Type.String()),
	message: Type.Optional(Type.String()),
	options: Type.Optional(Type.Array(WizardStepOptionSchema)),
	initialValue: Type.Optional(Type.Unknown()),
	placeholder: Type.Optional(Type.String()),
	sensitive: Type.Optional(Type.Boolean()),
	executor: Type.Optional(Type.Union([Type.Literal("gateway"), Type.Literal("client")]))
}, { additionalProperties: false });
const WizardResultFields = {
	done: Type.Boolean(),
	step: Type.Optional(WizardStepSchema),
	status: Type.Optional(WizardRunStatusSchema),
	error: Type.Optional(Type.String())
};
Type.Object(WizardResultFields, { additionalProperties: false });
Type.Object({
	sessionId: NonEmptyString,
	...WizardResultFields
}, { additionalProperties: false });
Type.Object({
	status: WizardRunStatusSchema,
	error: Type.Optional(Type.String())
}, { additionalProperties: false });
//#endregion
//#region src/gateway/protocol/index.ts
const ajv = new Ajv({
	allErrors: true,
	strict: false,
	removeAdditional: false
});
const validateCommandsListParams = ajv.compile(CommandsListParamsSchema);
const validateConnectParams = ajv.compile(ConnectParamsSchema);
const validateRequestFrame = ajv.compile(RequestFrameSchema);
const validateResponseFrame = ajv.compile(ResponseFrameSchema);
const validateEventFrame = ajv.compile(EventFrameSchema);
const validateMessageActionParams = ajv.compile(MessageActionParamsSchema);
const validateSendParams = ajv.compile(SendParamsSchema);
const validatePollParams = ajv.compile(PollParamsSchema);
const validateAgentParams = ajv.compile(AgentParamsSchema);
const validateAgentIdentityParams = ajv.compile(AgentIdentityParamsSchema);
const validateAgentWaitParams = ajv.compile(AgentWaitParamsSchema);
const validateWakeParams = ajv.compile(WakeParamsSchema);
const validateAgentsListParams = ajv.compile(AgentsListParamsSchema);
const validateAgentsCreateParams = ajv.compile(AgentsCreateParamsSchema);
const validateAgentsUpdateParams = ajv.compile(AgentsUpdateParamsSchema);
const validateAgentsDeleteParams = ajv.compile(AgentsDeleteParamsSchema);
const validateAgentsFilesListParams = ajv.compile(AgentsFilesListParamsSchema);
const validateAgentsFilesGetParams = ajv.compile(AgentsFilesGetParamsSchema);
const validateAgentsFilesSetParams = ajv.compile(AgentsFilesSetParamsSchema);
const validateNodePairRequestParams = ajv.compile(NodePairRequestParamsSchema);
const validateNodePairListParams = ajv.compile(NodePairListParamsSchema);
const validateNodePairApproveParams = ajv.compile(NodePairApproveParamsSchema);
const validateNodePairRejectParams = ajv.compile(NodePairRejectParamsSchema);
const validateNodePairVerifyParams = ajv.compile(NodePairVerifyParamsSchema);
const validateNodeRenameParams = ajv.compile(NodeRenameParamsSchema);
const validateNodeListParams = ajv.compile(NodeListParamsSchema);
const validateNodePendingAckParams = ajv.compile(NodePendingAckParamsSchema);
const validateNodeDescribeParams = ajv.compile(NodeDescribeParamsSchema);
const validateNodeInvokeParams = ajv.compile(NodeInvokeParamsSchema);
const validateNodeInvokeResultParams = ajv.compile(NodeInvokeResultParamsSchema);
const validateNodeEventParams = ajv.compile(NodeEventParamsSchema);
const validateNodePendingDrainParams = ajv.compile(NodePendingDrainParamsSchema);
const validateNodePendingEnqueueParams = ajv.compile(NodePendingEnqueueParamsSchema);
const validatePushTestParams = ajv.compile(PushTestParamsSchema);
const validateSecretsResolveParams = ajv.compile(SecretsResolveParamsSchema);
const validateSecretsResolveResult = ajv.compile(SecretsResolveResultSchema);
const validateSessionsListParams = ajv.compile(SessionsListParamsSchema);
const validateSessionsPreviewParams = ajv.compile(SessionsPreviewParamsSchema);
const validateSessionsResolveParams = ajv.compile(SessionsResolveParamsSchema);
const validateSessionsCreateParams = ajv.compile(SessionsCreateParamsSchema);
const validateSessionsSendParams = ajv.compile(SessionsSendParamsSchema);
const validateSessionsMessagesSubscribeParams = ajv.compile(SessionsMessagesSubscribeParamsSchema);
const validateSessionsMessagesUnsubscribeParams = ajv.compile(SessionsMessagesUnsubscribeParamsSchema);
const validateSessionsAbortParams = ajv.compile(SessionsAbortParamsSchema);
const validateSessionsPatchParams = ajv.compile(SessionsPatchParamsSchema);
const validateSessionsResetParams = ajv.compile(SessionsResetParamsSchema);
const validateSessionsDeleteParams = ajv.compile(SessionsDeleteParamsSchema);
const validateSessionsCompactParams = ajv.compile(SessionsCompactParamsSchema);
const validateSessionsCompactionListParams = ajv.compile(SessionsCompactionListParamsSchema);
const validateSessionsCompactionGetParams = ajv.compile(SessionsCompactionGetParamsSchema);
const validateSessionsCompactionBranchParams = ajv.compile(SessionsCompactionBranchParamsSchema);
const validateSessionsCompactionRestoreParams = ajv.compile(SessionsCompactionRestoreParamsSchema);
const validateSessionsUsageParams = ajv.compile(SessionsUsageParamsSchema);
const validateConfigGetParams = ajv.compile(ConfigGetParamsSchema);
const validateConfigSetParams = ajv.compile(ConfigSetParamsSchema);
const validateConfigApplyParams = ajv.compile(ConfigApplyParamsSchema);
const validateConfigPatchParams = ajv.compile(ConfigPatchParamsSchema);
const validateConfigSchemaParams = ajv.compile(ConfigSchemaParamsSchema);
const validateConfigSchemaLookupParams = ajv.compile(ConfigSchemaLookupParamsSchema);
const validateConfigSchemaLookupResult = ajv.compile(ConfigSchemaLookupResultSchema);
const validateWizardStartParams = ajv.compile(WizardStartParamsSchema);
const validateWizardNextParams = ajv.compile(WizardNextParamsSchema);
const validateWizardCancelParams = ajv.compile(WizardCancelParamsSchema);
const validateWizardStatusParams = ajv.compile(WizardStatusParamsSchema);
const validateTalkModeParams = ajv.compile(TalkModeParamsSchema);
const validateTalkConfigParams = ajv.compile(TalkConfigParamsSchema);
ajv.compile(TalkConfigResultSchema);
const validateTalkRealtimeSessionParams = ajv.compile(TalkRealtimeSessionParamsSchema);
ajv.compile(TalkRealtimeSessionResultSchema);
const validateTalkSpeakParams = ajv.compile(TalkSpeakParamsSchema);
ajv.compile(TalkSpeakResultSchema);
const validateChannelsStatusParams = ajv.compile(ChannelsStatusParamsSchema);
const validateChannelsStartParams = ajv.compile(ChannelsStartParamsSchema);
const validateChannelsLogoutParams = ajv.compile(ChannelsLogoutParamsSchema);
const validateModelsListParams = ajv.compile(ModelsListParamsSchema);
const validateSkillsStatusParams = ajv.compile(SkillsStatusParamsSchema);
const validateToolsCatalogParams = ajv.compile(ToolsCatalogParamsSchema);
const validateToolsEffectiveParams = ajv.compile(ToolsEffectiveParamsSchema);
const validateSkillsBinsParams = ajv.compile(SkillsBinsParamsSchema);
const validateSkillsInstallParams = ajv.compile(SkillsInstallParamsSchema);
const validateSkillsUpdateParams = ajv.compile(SkillsUpdateParamsSchema);
const validateSkillsSearchParams = ajv.compile(SkillsSearchParamsSchema);
const validateSkillsDetailParams = ajv.compile(SkillsDetailParamsSchema);
const validateCronListParams = ajv.compile(CronListParamsSchema);
const validateCronStatusParams = ajv.compile(CronStatusParamsSchema);
const validateCronAddParams = ajv.compile(CronAddParamsSchema);
const validateCronUpdateParams = ajv.compile(CronUpdateParamsSchema);
const validateCronRemoveParams = ajv.compile(CronRemoveParamsSchema);
const validateCronRunParams = ajv.compile(CronRunParamsSchema);
const validateCronRunsParams = ajv.compile(CronRunsParamsSchema);
const validateDevicePairListParams = ajv.compile(DevicePairListParamsSchema);
const validateDevicePairApproveParams = ajv.compile(DevicePairApproveParamsSchema);
const validateDevicePairRejectParams = ajv.compile(DevicePairRejectParamsSchema);
const validateDevicePairRemoveParams = ajv.compile(DevicePairRemoveParamsSchema);
const validateDeviceTokenRotateParams = ajv.compile(DeviceTokenRotateParamsSchema);
const validateDeviceTokenRevokeParams = ajv.compile(DeviceTokenRevokeParamsSchema);
const validateExecApprovalsGetParams = ajv.compile(ExecApprovalsGetParamsSchema);
const validateExecApprovalsSetParams = ajv.compile(ExecApprovalsSetParamsSchema);
const validateExecApprovalGetParams = ajv.compile(ExecApprovalGetParamsSchema);
const validateExecApprovalRequestParams = ajv.compile(ExecApprovalRequestParamsSchema);
const validateExecApprovalResolveParams = ajv.compile(ExecApprovalResolveParamsSchema);
const validatePluginApprovalRequestParams = ajv.compile(PluginApprovalRequestParamsSchema);
const validatePluginApprovalResolveParams = ajv.compile(PluginApprovalResolveParamsSchema);
const validateExecApprovalsNodeGetParams = ajv.compile(ExecApprovalsNodeGetParamsSchema);
const validateExecApprovalsNodeSetParams = ajv.compile(ExecApprovalsNodeSetParamsSchema);
const validateLogsTailParams = ajv.compile(LogsTailParamsSchema);
const validateChatHistoryParams = ajv.compile(ChatHistoryParamsSchema);
const validateChatSendParams = ajv.compile(ChatSendParamsSchema);
const validateChatAbortParams = ajv.compile(ChatAbortParamsSchema);
const validateChatInjectParams = ajv.compile(ChatInjectParamsSchema);
ajv.compile(ChatEventSchema);
const validateUpdateRunParams = ajv.compile(UpdateRunParamsSchema);
const validateWebLoginStartParams = ajv.compile(WebLoginStartParamsSchema);
const validateWebLoginWaitParams = ajv.compile(WebLoginWaitParamsSchema);
function formatValidationErrors(errors) {
	if (!errors?.length) return "unknown validation error";
	const parts = [];
	for (const err of errors) {
		const keyword = typeof err?.keyword === "string" ? err.keyword : "";
		const instancePath = typeof err?.instancePath === "string" ? err.instancePath : "";
		if (keyword === "additionalProperties") {
			const additionalProperty = (err?.params)?.additionalProperty;
			if (typeof additionalProperty === "string" && additionalProperty.trim()) {
				const where = instancePath ? `at ${instancePath}` : "at root";
				parts.push(`${where}: unexpected property '${additionalProperty}'`);
				continue;
			}
		}
		const message = typeof err?.message === "string" && err.message.trim() ? err.message : "validation error";
		const where = instancePath ? `at ${instancePath}: ` : "";
		parts.push(`${where}${message}`);
	}
	const unique = Array.from(new Set(parts.filter((part) => part.trim())));
	if (!unique.length) return ajv.errorsText(errors, { separator: "; " }) || "unknown validation error";
	return unique.join("; ");
}
//#endregion
//#region src/gateway/client.ts
var GatewayClientRequestError = class extends Error {
	constructor(error) {
		super(formatConnectErrorMessage({
			message: error.message,
			details: error.details
		}));
		this.name = "GatewayClientRequestError";
		this.gatewayCode = error.code ?? "UNAVAILABLE";
		this.details = error.details;
		this.retryable = error.retryable === true;
		this.retryAfterMs = error.retryAfterMs;
	}
};
function readConnectChallengeTimeoutOverride(opts) {
	if (typeof opts.connectChallengeTimeoutMs === "number" && Number.isFinite(opts.connectChallengeTimeoutMs)) return opts.connectChallengeTimeoutMs;
	if (typeof opts.connectDelayMs === "number" && Number.isFinite(opts.connectDelayMs)) return opts.connectDelayMs;
}
function isGatewayClientStoppedError(err) {
	const message = err instanceof Error ? err.message : String(err);
	return message === "gateway client stopped" || message === "Error: gateway client stopped";
}
function resolveGatewayClientConnectChallengeTimeoutMs(opts) {
	return resolveConnectChallengeTimeoutMs(readConnectChallengeTimeoutOverride(opts));
}
const FORCE_STOP_TERMINATE_GRACE_MS = 250;
const STOP_AND_WAIT_TIMEOUT_MS = 1e3;
var GatewayClient = class {
	constructor(opts) {
		this.ws = null;
		this.pending = /* @__PURE__ */ new Map();
		this.backoffMs = 1e3;
		this.closed = false;
		this.lastSeq = null;
		this.connectNonce = null;
		this.connectSent = false;
		this.connectTimer = null;
		this.pendingDeviceTokenRetry = false;
		this.deviceTokenRetryBudgetUsed = false;
		this.pendingConnectErrorDetailCode = null;
		this.lastTick = null;
		this.tickIntervalMs = 3e4;
		this.tickTimer = null;
		this.pendingStop = null;
		this.socketOpened = false;
		this.opts = {
			...opts,
			deviceIdentity: opts.deviceIdentity === null ? void 0 : opts.deviceIdentity ?? loadOrCreateDeviceIdentity()
		};
		this.requestTimeoutMs = typeof opts.requestTimeoutMs === "number" && Number.isFinite(opts.requestTimeoutMs) ? resolveSafeTimeoutDelayMs(opts.requestTimeoutMs) : 3e4;
	}
	start() {
		if (this.closed) return;
		this.clearConnectChallengeTimeout();
		this.connectNonce = null;
		this.connectSent = false;
		const url = this.opts.url ?? "ws://127.0.0.1:18789";
		if (this.opts.tlsFingerprint && !url.startsWith("wss://")) {
			this.opts.onConnectError?.(/* @__PURE__ */ new Error("gateway tls fingerprint requires wss:// gateway url"));
			return;
		}
		const allowPrivateWs = process.env.OPENCLAW_ALLOW_INSECURE_PRIVATE_WS === "1";
		if (!isSecureWebSocketUrl(url, { allowPrivateWs })) {
			let displayHost = url;
			try {
				displayHost = new URL(url).hostname || url;
			} catch {}
			const error = /* @__PURE__ */ new Error(`SECURITY ERROR: Cannot connect to "${displayHost}" over plaintext ws://. Both credentials and chat data would be exposed to network interception. Use wss:// for remote URLs. Safe defaults: keep gateway.bind=loopback and connect via SSH tunnel (ssh -N -L 18789:127.0.0.1:18789 user@gateway-host), or use Tailscale Serve/Funnel. ` + (allowPrivateWs ? "" : "Break-glass (trusted private networks only): set OPENCLAW_ALLOW_INSECURE_PRIVATE_WS=1. ") + "Run `openclaw doctor --fix` for guidance.");
			this.opts.onConnectError?.(error);
			return;
		}
		const wsOptions = { maxPayload: 25 * 1024 * 1024 };
		if (url.startsWith("wss://") && this.opts.tlsFingerprint) {
			wsOptions.rejectUnauthorized = false;
			wsOptions.checkServerIdentity = (_host, cert) => {
				const fingerprintValue = typeof cert === "object" && cert && "fingerprint256" in cert ? cert.fingerprint256 ?? "" : "";
				const fingerprint = normalizeFingerprint(typeof fingerprintValue === "string" ? fingerprintValue : "");
				const expected = normalizeFingerprint(this.opts.tlsFingerprint ?? "");
				if (!expected) return;
				if (!fingerprint) return /* @__PURE__ */ new Error("Missing server TLS fingerprint");
				if (fingerprint !== expected) return /* @__PURE__ */ new Error("Server TLS fingerprint mismatch");
			};
		}
		const ws = new WebSocket$1(url, wsOptions);
		this.ws = ws;
		this.socketOpened = false;
		this.connectNonce = null;
		this.connectSent = false;
		this.clearConnectChallengeTimeout();
		ws.on("open", () => {
			this.socketOpened = true;
			if (url.startsWith("wss://") && this.opts.tlsFingerprint) {
				const tlsError = this.validateTlsFingerprint();
				if (tlsError) {
					this.opts.onConnectError?.(tlsError);
					this.ws?.close(1008, tlsError.message);
					return;
				}
			}
			this.beginPreauthHandshake();
		});
		ws.on("message", (data) => this.handleMessage(rawDataToString(data)));
		ws.on("close", (code, reason) => {
			const reasonText = rawDataToString(reason);
			const connectErrorDetailCode = this.pendingConnectErrorDetailCode;
			this.pendingConnectErrorDetailCode = null;
			if (this.ws === ws) this.ws = null;
			this.socketOpened = false;
			this.resolvePendingStop(ws);
			if (code === 1008 && normalizeLowercaseStringOrEmpty(reasonText).includes("device token mismatch") && !this.opts.token && !this.opts.password && this.opts.deviceIdentity) {
				const deviceId = this.opts.deviceIdentity.deviceId;
				const role = this.opts.role ?? "operator";
				try {
					clearDeviceAuthToken({
						deviceId,
						role
					});
					logDebug(`cleared stale device-auth token for device ${deviceId}`);
				} catch (err) {
					logDebug(`failed clearing stale device-auth token for device ${deviceId}: ${String(err)}`);
				}
			}
			this.flushPendingErrors(/* @__PURE__ */ new Error(`gateway closed (${code}): ${reasonText}`));
			if (this.shouldPauseReconnectAfterAuthFailure(connectErrorDetailCode)) {
				this.opts.onClose?.(code, reasonText);
				return;
			}
			this.scheduleReconnect();
			this.opts.onClose?.(code, reasonText);
		});
		ws.on("error", (err) => {
			logDebug(`gateway client error: ${String(err)}`);
			if (!this.connectSent) this.opts.onConnectError?.(err instanceof Error ? err : new Error(String(err)));
		});
	}
	stop() {
		this.beginStop();
	}
	async stopAndWait(opts) {
		const stopPromise = this.beginStop();
		if (!stopPromise) return;
		const timeoutMs = typeof opts?.timeoutMs === "number" && Number.isFinite(opts.timeoutMs) ? Math.max(1, Math.floor(opts.timeoutMs)) : STOP_AND_WAIT_TIMEOUT_MS;
		let timeout = null;
		try {
			await Promise.race([stopPromise, new Promise((_, reject) => {
				timeout = setTimeout(() => {
					reject(/* @__PURE__ */ new Error(`gateway client stop timed out after ${timeoutMs}ms`));
				}, timeoutMs);
				timeout.unref?.();
			})]);
		} finally {
			if (timeout) clearTimeout(timeout);
		}
	}
	beginStop() {
		this.closed = true;
		this.pendingDeviceTokenRetry = false;
		this.deviceTokenRetryBudgetUsed = false;
		this.pendingConnectErrorDetailCode = null;
		if (this.tickTimer) {
			clearInterval(this.tickTimer);
			this.tickTimer = null;
		}
		this.clearConnectChallengeTimeout();
		if (this.pendingStop) {
			this.flushPendingErrors(/* @__PURE__ */ new Error("gateway client stopped"));
			return this.pendingStop.promise;
		}
		const ws = this.ws;
		this.ws = null;
		if (ws) {
			const stopPromise = this.createPendingStop(ws);
			ws.close();
			setTimeout(() => {
				try {
					ws.terminate();
				} catch {}
				this.resolvePendingStop(ws);
			}, FORCE_STOP_TERMINATE_GRACE_MS).unref?.();
			this.flushPendingErrors(/* @__PURE__ */ new Error("gateway client stopped"));
			return stopPromise;
		}
		this.flushPendingErrors(/* @__PURE__ */ new Error("gateway client stopped"));
		return null;
	}
	createPendingStop(ws) {
		if (this.pendingStop?.ws === ws) return this.pendingStop.promise;
		let resolve;
		const promise = new Promise((res) => {
			resolve = res;
		});
		this.pendingStop = {
			ws,
			promise,
			resolve
		};
		return promise;
	}
	resolvePendingStop(ws) {
		if (this.pendingStop?.ws !== ws) return;
		const { resolve } = this.pendingStop;
		this.pendingStop = null;
		resolve();
	}
	sendConnect() {
		if (this.connectSent) return;
		const nonce = normalizeOptionalString(this.connectNonce) ?? "";
		if (!nonce) {
			this.opts.onConnectError?.(/* @__PURE__ */ new Error("gateway connect challenge missing nonce"));
			this.ws?.close(1008, "connect challenge missing nonce");
			return;
		}
		this.connectSent = true;
		this.clearConnectChallengeTimeout();
		const role = this.opts.role ?? "operator";
		const { authToken, authBootstrapToken, authDeviceToken, authPassword, signatureToken, resolvedDeviceToken, storedToken, storedScopes, usingStoredDeviceToken } = this.selectConnectAuth(role);
		if (this.pendingDeviceTokenRetry && authDeviceToken) this.pendingDeviceTokenRetry = false;
		const auth = authToken || authBootstrapToken || authPassword || resolvedDeviceToken ? {
			token: authToken,
			bootstrapToken: authBootstrapToken,
			deviceToken: authDeviceToken ?? resolvedDeviceToken,
			password: authPassword
		} : void 0;
		const signedAtMs = Date.now();
		const scopes = this.resolveConnectScopes({
			usingStoredDeviceToken,
			storedScopes
		});
		const platform = this.opts.platform ?? process.platform;
		const device = (() => {
			if (!this.opts.deviceIdentity) return;
			const payload = buildDeviceAuthPayloadV3({
				deviceId: this.opts.deviceIdentity.deviceId,
				clientId: this.opts.clientName ?? GATEWAY_CLIENT_NAMES.GATEWAY_CLIENT,
				clientMode: this.opts.mode ?? GATEWAY_CLIENT_MODES.BACKEND,
				role,
				scopes,
				signedAtMs,
				token: signatureToken ?? null,
				nonce,
				platform,
				deviceFamily: this.opts.deviceFamily
			});
			const signature = signDevicePayload(this.opts.deviceIdentity.privateKeyPem, payload);
			return {
				id: this.opts.deviceIdentity.deviceId,
				publicKey: publicKeyRawBase64UrlFromPem(this.opts.deviceIdentity.publicKeyPem),
				signature,
				signedAt: signedAtMs,
				nonce
			};
		})();
		const params = {
			minProtocol: this.opts.minProtocol ?? 3,
			maxProtocol: this.opts.maxProtocol ?? 3,
			client: {
				id: this.opts.clientName ?? GATEWAY_CLIENT_NAMES.GATEWAY_CLIENT,
				displayName: this.opts.clientDisplayName,
				version: this.opts.clientVersion ?? VERSION,
				platform,
				deviceFamily: this.opts.deviceFamily,
				mode: this.opts.mode ?? GATEWAY_CLIENT_MODES.BACKEND,
				instanceId: this.opts.instanceId
			},
			caps: Array.isArray(this.opts.caps) ? this.opts.caps : [],
			commands: Array.isArray(this.opts.commands) ? this.opts.commands : void 0,
			permissions: this.opts.permissions && typeof this.opts.permissions === "object" ? this.opts.permissions : void 0,
			pathEnv: this.opts.pathEnv,
			auth,
			role,
			scopes,
			device
		};
		this.request("connect", params).then((helloOk) => {
			this.pendingDeviceTokenRetry = false;
			this.deviceTokenRetryBudgetUsed = false;
			this.pendingConnectErrorDetailCode = null;
			const authInfo = helloOk?.auth;
			if (authInfo?.deviceToken && this.opts.deviceIdentity) storeDeviceAuthToken({
				deviceId: this.opts.deviceIdentity.deviceId,
				role: authInfo.role ?? role,
				token: authInfo.deviceToken,
				scopes: authInfo.scopes ?? []
			});
			this.backoffMs = 1e3;
			this.tickIntervalMs = typeof helloOk.policy?.tickIntervalMs === "number" ? helloOk.policy.tickIntervalMs : 3e4;
			this.lastTick = Date.now();
			this.startTickWatch();
			this.opts.onHelloOk?.(helloOk);
		}).catch((err) => {
			this.pendingConnectErrorDetailCode = err instanceof GatewayClientRequestError ? readConnectErrorDetailCode(err.details) : null;
			if (this.shouldRetryWithStoredDeviceToken({
				error: err,
				explicitGatewayToken: normalizeOptionalString(this.opts.token),
				resolvedDeviceToken,
				storedToken: storedToken ?? void 0
			})) {
				this.pendingDeviceTokenRetry = true;
				this.deviceTokenRetryBudgetUsed = true;
				this.backoffMs = Math.min(this.backoffMs, 250);
			}
			this.opts.onConnectError?.(err instanceof Error ? err : new Error(String(err)));
			const msg = `gateway connect failed: ${String(err)}`;
			if (this.opts.mode === GATEWAY_CLIENT_MODES.PROBE || isGatewayClientStoppedError(err)) logDebug(msg);
			else logError(msg);
			this.ws?.close(1008, "connect failed");
		});
	}
	resolveConnectScopes(params) {
		if (params.usingStoredDeviceToken && Array.isArray(params.storedScopes) && params.storedScopes.length > 0) return params.storedScopes;
		return this.opts.scopes ?? ["operator.admin"];
	}
	loadStoredDeviceAuth(role) {
		if (!this.opts.deviceIdentity) return null;
		const storedAuth = loadDeviceAuthToken({
			deviceId: this.opts.deviceIdentity.deviceId,
			role
		});
		if (!storedAuth) return null;
		return {
			token: storedAuth.token,
			scopes: storedAuth.scopes
		};
	}
	shouldPauseReconnectAfterAuthFailure(detailCode) {
		if (!detailCode) return false;
		if (detailCode === ConnectErrorDetailCodes.AUTH_TOKEN_MISSING || detailCode === ConnectErrorDetailCodes.AUTH_BOOTSTRAP_TOKEN_INVALID || detailCode === ConnectErrorDetailCodes.AUTH_PASSWORD_MISSING || detailCode === ConnectErrorDetailCodes.AUTH_PASSWORD_MISMATCH || detailCode === ConnectErrorDetailCodes.AUTH_RATE_LIMITED || detailCode === ConnectErrorDetailCodes.PAIRING_REQUIRED || detailCode === ConnectErrorDetailCodes.CONTROL_UI_DEVICE_IDENTITY_REQUIRED || detailCode === ConnectErrorDetailCodes.DEVICE_IDENTITY_REQUIRED) return true;
		if (detailCode !== ConnectErrorDetailCodes.AUTH_TOKEN_MISMATCH) return false;
		if (this.pendingDeviceTokenRetry) return false;
		if (!this.isTrustedDeviceRetryEndpoint()) return true;
		return this.deviceTokenRetryBudgetUsed;
	}
	shouldRetryWithStoredDeviceToken(params) {
		if (this.deviceTokenRetryBudgetUsed) return false;
		if (params.resolvedDeviceToken) return false;
		if (!params.explicitGatewayToken || !params.storedToken) return false;
		if (!this.isTrustedDeviceRetryEndpoint()) return false;
		if (!(params.error instanceof GatewayClientRequestError)) return false;
		const detailCode = readConnectErrorDetailCode(params.error.details);
		const advice = readConnectErrorRecoveryAdvice(params.error.details);
		const retryWithDeviceTokenRecommended = advice.recommendedNextStep === "retry_with_device_token";
		return advice.canRetryWithDeviceToken === true || retryWithDeviceTokenRecommended || detailCode === ConnectErrorDetailCodes.AUTH_TOKEN_MISMATCH;
	}
	isTrustedDeviceRetryEndpoint() {
		const rawUrl = this.opts.url ?? "ws://127.0.0.1:18789";
		try {
			const parsed = new URL(rawUrl);
			const protocol = parsed.protocol === "https:" ? "wss:" : parsed.protocol === "http:" ? "ws:" : parsed.protocol;
			if (isLoopbackHost(parsed.hostname)) return true;
			return protocol === "wss:" && Boolean(this.opts.tlsFingerprint?.trim());
		} catch {
			return false;
		}
	}
	selectConnectAuth(role) {
		const explicitGatewayToken = normalizeOptionalString(this.opts.token);
		const explicitBootstrapToken = normalizeOptionalString(this.opts.bootstrapToken);
		const explicitDeviceToken = normalizeOptionalString(this.opts.deviceToken);
		const authPassword = normalizeOptionalString(this.opts.password);
		const storedAuth = this.loadStoredDeviceAuth(role);
		const storedToken = storedAuth?.token ?? null;
		const storedScopes = storedAuth?.scopes;
		const shouldUseDeviceRetryToken = this.pendingDeviceTokenRetry && !explicitDeviceToken && Boolean(explicitGatewayToken) && Boolean(storedToken) && this.isTrustedDeviceRetryEndpoint();
		const resolvedDeviceToken = explicitDeviceToken ?? (shouldUseDeviceRetryToken || !(explicitGatewayToken || authPassword) && (!explicitBootstrapToken || Boolean(storedToken)) ? storedToken ?? void 0 : void 0);
		const reusingStoredDeviceToken = Boolean(resolvedDeviceToken) && !explicitDeviceToken && Boolean(storedToken) && resolvedDeviceToken === storedToken;
		const authToken = explicitGatewayToken ?? resolvedDeviceToken;
		const authBootstrapToken = !explicitGatewayToken && !resolvedDeviceToken ? explicitBootstrapToken : void 0;
		return {
			authToken,
			authBootstrapToken,
			authDeviceToken: shouldUseDeviceRetryToken ? storedToken ?? void 0 : void 0,
			authPassword,
			signatureToken: authToken ?? authBootstrapToken ?? void 0,
			resolvedDeviceToken,
			storedToken: storedToken ?? void 0,
			storedScopes,
			usingStoredDeviceToken: reusingStoredDeviceToken
		};
	}
	handleMessage(raw) {
		try {
			const parsed = JSON.parse(raw);
			if (validateEventFrame(parsed)) {
				this.lastTick = Date.now();
				const evt = parsed;
				if (evt.event === "connect.challenge") {
					const payload = evt.payload;
					const nonce = payload && typeof payload.nonce === "string" ? payload.nonce : null;
					if (!nonce || nonce.trim().length === 0) {
						this.opts.onConnectError?.(/* @__PURE__ */ new Error("gateway connect challenge missing nonce"));
						this.ws?.close(1008, "connect challenge missing nonce");
						return;
					}
					this.connectNonce = nonce.trim();
					if (this.socketOpened) this.sendConnect();
					return;
				}
				const seq = typeof evt.seq === "number" ? evt.seq : null;
				if (seq !== null) {
					if (this.lastSeq !== null && seq > this.lastSeq + 1) this.opts.onGap?.({
						expected: this.lastSeq + 1,
						received: seq
					});
					this.lastSeq = seq;
				}
				if (evt.event === "tick") this.lastTick = Date.now();
				this.opts.onEvent?.(evt);
				return;
			}
			if (validateResponseFrame(parsed)) {
				this.lastTick = Date.now();
				const pending = this.pending.get(parsed.id);
				if (!pending) return;
				const status = parsed.payload?.status;
				if (pending.expectFinal && status === "accepted") return;
				this.pending.delete(parsed.id);
				if (pending.timeout) clearTimeout(pending.timeout);
				if (parsed.ok) pending.resolve(parsed.payload);
				else pending.reject(new GatewayClientRequestError({
					code: parsed.error?.code,
					message: parsed.error?.message ?? "unknown error",
					details: parsed.error?.details,
					retryable: parsed.error?.retryable,
					retryAfterMs: parsed.error?.retryAfterMs
				}));
			}
		} catch (err) {
			logDebug(`gateway client parse error: ${String(err)}`);
		}
	}
	beginPreauthHandshake() {
		if (this.connectSent) return;
		if (this.connectNonce && !this.connectSent) {
			this.armConnectChallengeTimeout();
			this.sendConnect();
			return;
		}
		this.armConnectChallengeTimeout();
	}
	clearConnectChallengeTimeout() {
		if (this.connectTimer) {
			clearTimeout(this.connectTimer);
			this.connectTimer = null;
		}
	}
	armConnectChallengeTimeout() {
		const connectChallengeTimeoutMs = resolveGatewayClientConnectChallengeTimeoutMs(this.opts);
		const armedAt = Date.now();
		this.clearConnectChallengeTimeout();
		this.connectTimer = setTimeout(() => {
			if (this.connectSent || this.ws?.readyState !== WebSocket$1.OPEN) return;
			const elapsedMs = Date.now() - armedAt;
			this.opts.onConnectError?.(/* @__PURE__ */ new Error(`gateway connect challenge timeout (waited ${elapsedMs}ms, limit ${connectChallengeTimeoutMs}ms)`));
			this.ws?.close(1008, "connect challenge timeout");
		}, connectChallengeTimeoutMs);
	}
	scheduleReconnect() {
		if (this.closed) return;
		if (this.tickTimer) {
			clearInterval(this.tickTimer);
			this.tickTimer = null;
		}
		const delay = this.backoffMs;
		this.backoffMs = Math.min(this.backoffMs * 2, 3e4);
		setTimeout(() => this.start(), delay).unref();
	}
	flushPendingErrors(err) {
		for (const [, p] of this.pending) {
			if (p.timeout) clearTimeout(p.timeout);
			p.reject(err);
		}
		this.pending.clear();
	}
	startTickWatch() {
		if (this.tickTimer) clearInterval(this.tickTimer);
		const rawMinInterval = this.opts.tickWatchMinIntervalMs;
		const minInterval = typeof rawMinInterval === "number" && Number.isFinite(rawMinInterval) ? Math.max(1, Math.min(3e4, rawMinInterval)) : 1e3;
		const interval = Math.max(this.tickIntervalMs, minInterval);
		this.tickTimer = setInterval(() => {
			if (this.closed) return;
			if (!this.lastTick) return;
			if (this.pending.size > 0) return;
			if (Date.now() - this.lastTick > this.tickIntervalMs * 2) this.ws?.close(4e3, "tick timeout");
		}, interval);
	}
	validateTlsFingerprint() {
		if (!this.opts.tlsFingerprint || !this.ws) return null;
		const expected = normalizeFingerprint(this.opts.tlsFingerprint);
		if (!expected) return /* @__PURE__ */ new Error("gateway tls fingerprint missing");
		const socket = this.ws._socket;
		if (!socket || typeof socket.getPeerCertificate !== "function") return /* @__PURE__ */ new Error("gateway tls fingerprint unavailable");
		const fingerprint = normalizeFingerprint(socket.getPeerCertificate()?.fingerprint256 ?? "");
		if (!fingerprint) return /* @__PURE__ */ new Error("gateway tls fingerprint unavailable");
		if (fingerprint !== expected) return /* @__PURE__ */ new Error("gateway tls fingerprint mismatch");
		return null;
	}
	async request(method, params, opts) {
		if (!this.ws || this.ws.readyState !== WebSocket$1.OPEN) throw new Error("gateway not connected");
		const id = randomUUID();
		const frame = {
			type: "req",
			id,
			method,
			params
		};
		if (!validateRequestFrame(frame)) throw new Error(`invalid request frame: ${JSON.stringify(validateRequestFrame.errors, null, 2)}`);
		const expectFinal = opts?.expectFinal === true;
		const timeoutMs = opts?.timeoutMs === null ? null : typeof opts?.timeoutMs === "number" && Number.isFinite(opts.timeoutMs) ? resolveSafeTimeoutDelayMs(opts.timeoutMs) : expectFinal ? null : this.requestTimeoutMs;
		const p = new Promise((resolve, reject) => {
			const timeout = timeoutMs === null ? null : setTimeout(() => {
				this.pending.delete(id);
				reject(/* @__PURE__ */ new Error(`gateway request timeout for ${method}`));
			}, timeoutMs);
			this.pending.set(id, {
				resolve: (value) => resolve(value),
				reject,
				expectFinal,
				timeout
			});
		});
		this.ws.send(JSON.stringify(frame));
		return p;
	}
};
//#endregion
export { validateNodeDescribeParams as $, validateWebLoginWaitParams as $t, validateCronAddParams as A, validateSessionsMessagesSubscribeParams as At, validateDevicePairRemoveParams as B, validateSkillsInstallParams as Bt, validateConfigGetParams as C, validateSessionsCompactionBranchParams as Ct, validateConfigSchemaParams as D, validateSessionsCreateParams as Dt, validateConfigSchemaLookupResult as E, validateSessionsCompactionRestoreParams as Et, validateCronStatusParams as F, validateSessionsResolveParams as Ft, validateExecApprovalResolveParams as G, validateTalkModeParams as Gt, validateDeviceTokenRotateParams as H, validateSkillsStatusParams as Ht, validateCronUpdateParams as I, validateSessionsSendParams as It, validateExecApprovalsNodeSetParams as J, validateToolsCatalogParams as Jt, validateExecApprovalsGetParams as K, validateTalkRealtimeSessionParams as Kt, validateDevicePairApproveParams as L, validateSessionsUsageParams as Lt, validateCronRemoveParams as M, validateSessionsPatchParams as Mt, validateCronRunParams as N, validateSessionsPreviewParams as Nt, validateConfigSetParams as O, validateSessionsDeleteParams as Ot, validateCronRunsParams as P, validateSessionsResetParams as Pt, validateModelsListParams as Q, validateWebLoginStartParams as Qt, validateDevicePairListParams as R, validateSkillsBinsParams as Rt, validateConfigApplyParams as S, validateSessionsCompactParams as St, validateConfigSchemaLookupParams as T, validateSessionsCompactionListParams as Tt, validateExecApprovalGetParams as U, validateSkillsUpdateParams as Ut, validateDeviceTokenRevokeParams as V, validateSkillsSearchParams as Vt, validateExecApprovalRequestParams as W, validateTalkConfigParams as Wt, validateLogsTailParams as X, validateUpdateRunParams as Xt, validateExecApprovalsSetParams as Y, validateToolsEffectiveParams as Yt, validateMessageActionParams as Z, validateWakeParams as Zt, validateChatAbortParams as _, validateRequestFrame as _t, validateAgentParams as a, errorShape as an, validateNodePairListParams as at, validateChatSendParams as b, validateSendParams as bt, validateAgentsDeleteParams as c, getPreauthHandshakeTimeoutMsFromEnv as cn, validateNodePairVerifyParams as ct, validateAgentsFilesSetParams as d, validateNodePendingEnqueueParams as dt, validateWizardCancelParams as en, validateNodeEventParams as et, validateAgentsListParams as f, validateNodeRenameParams as ft, validateChannelsStatusParams as g, validatePushTestParams as gt, validateChannelsStartParams as h, validatePollParams as ht, validateAgentIdentityParams as i, ErrorCodes as in, validateNodePairApproveParams as it, validateCronListParams as j, validateSessionsMessagesUnsubscribeParams as jt, validateConnectParams as k, validateSessionsListParams as kt, validateAgentsFilesGetParams as l, buildDeviceAuthPayload as ln, validateNodePendingAckParams as lt, validateChannelsLogoutParams as m, validatePluginApprovalResolveParams as mt, GatewayClientRequestError as n, validateWizardStartParams as nn, validateNodeInvokeResultParams as nt, validateAgentWaitParams as o, COMMAND_DESCRIPTION_MAX_LENGTH as on, validateNodePairRejectParams as ot, validateAgentsUpdateParams as p, validatePluginApprovalRequestParams as pt, validateExecApprovalsNodeGetParams as q, validateTalkSpeakParams as qt, formatValidationErrors as r, validateWizardStatusParams as rn, validateNodeListParams as rt, validateAgentsCreateParams as s, parseSessionLabel as sn, validateNodePairRequestParams as st, GatewayClient as t, validateWizardNextParams as tn, validateNodeInvokeParams as tt, validateAgentsFilesListParams as u, buildDeviceAuthPayloadV3 as un, validateNodePendingDrainParams as ut, validateChatHistoryParams as v, validateSecretsResolveParams as vt, validateConfigPatchParams as w, validateSessionsCompactionGetParams as wt, validateCommandsListParams as x, validateSessionsAbortParams as xt, validateChatInjectParams as y, validateSecretsResolveResult as yt, validateDevicePairRejectParams as z, validateSkillsDetailParams as zt };
