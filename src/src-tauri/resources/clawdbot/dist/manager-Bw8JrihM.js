import { a as logVerbose } from "./globals-DBUMOBZ8.js";
import { n as resolveGlobalSingleton } from "./global-singleton-D9TlHTN5.js";
import { T as parseAgentSessionKey, c as normalizeAgentId, l as normalizeMainKey, x as isAcpSessionKey } from "./session-key-DAhnzjyr.js";
import { s as loadConfig } from "./io-y3Az_Onx.js";
import { l as updateSessionStore, n as loadSessionStore } from "./store-C5UK26Ce.js";
import { i as resolveMainSessionKey, t as canonicalizeMainSessionAlias } from "./main-session-ClbmrpGK.js";
import { t as resolveAllAgentSessionStoreTargets } from "./sessions-D9ZgHCHb.js";
import { l as resolveStorePath } from "./paths-rhN9LKM_.js";
import { n as mergeSessionEntry } from "./types-BRBQbfEQ.js";
import { t as KeyedAsyncQueue } from "./keyed-async-queue-Bj6YmEFK.js";
import { isAbsolute } from "node:path";
//#region src/agents/timeout.ts
const DEFAULT_AGENT_TIMEOUT_SECONDS = 2880 * 60;
const MAX_SAFE_TIMEOUT_MS = 2147e6;
const normalizeNumber = (value) => typeof value === "number" && Number.isFinite(value) ? Math.floor(value) : void 0;
function resolveAgentTimeoutSeconds(cfg) {
	const seconds = normalizeNumber(cfg?.agents?.defaults?.timeoutSeconds) ?? DEFAULT_AGENT_TIMEOUT_SECONDS;
	return Math.max(seconds, 1);
}
function resolveAgentTimeoutMs(opts) {
	const minMs = Math.max(normalizeNumber(opts.minMs) ?? 1, 1);
	const clampTimeoutMs = (valueMs) => Math.min(Math.max(valueMs, minMs), MAX_SAFE_TIMEOUT_MS);
	const defaultMs = clampTimeoutMs(resolveAgentTimeoutSeconds(opts.cfg) * 1e3);
	const NO_TIMEOUT_MS = MAX_SAFE_TIMEOUT_MS;
	const overrideMs = normalizeNumber(opts.overrideMs);
	if (overrideMs !== void 0) {
		if (overrideMs === 0) return NO_TIMEOUT_MS;
		if (overrideMs < 0) return defaultMs;
		return clampTimeoutMs(overrideMs);
	}
	const overrideSeconds = normalizeNumber(opts.overrideSeconds);
	if (overrideSeconds !== void 0) {
		if (overrideSeconds === 0) return NO_TIMEOUT_MS;
		if (overrideSeconds < 0) return defaultMs;
		return clampTimeoutMs(overrideSeconds * 1e3);
	}
	return defaultMs;
}
//#endregion
//#region src/acp/runtime/errors.ts
const ACP_ERROR_CODES = [
	"ACP_BACKEND_MISSING",
	"ACP_BACKEND_UNAVAILABLE",
	"ACP_BACKEND_UNSUPPORTED_CONTROL",
	"ACP_DISPATCH_DISABLED",
	"ACP_INVALID_RUNTIME_OPTION",
	"ACP_SESSION_INIT_FAILED",
	"ACP_TURN_FAILED"
];
var AcpRuntimeError = class extends Error {
	constructor(code, message, options) {
		super(message);
		this.name = "AcpRuntimeError";
		this.code = code;
		this.cause = options?.cause;
	}
};
function isAcpRuntimeError(value) {
	return value instanceof AcpRuntimeError;
}
function toAcpRuntimeError(params) {
	if (params.error instanceof AcpRuntimeError) return params.error;
	if (params.error instanceof Error) return new AcpRuntimeError(params.fallbackCode, params.error.message, { cause: params.error });
	return new AcpRuntimeError(params.fallbackCode, params.fallbackMessage, { cause: params.error });
}
async function withAcpRuntimeErrorBoundary(params) {
	try {
		return await params.run();
	} catch (error) {
		throw toAcpRuntimeError({
			error,
			fallbackCode: params.fallbackCode,
			fallbackMessage: params.fallbackMessage
		});
	}
}
//#endregion
//#region src/acp/runtime/session-identity.ts
function normalizeText$1(value) {
	if (typeof value !== "string") return;
	return value.trim() || void 0;
}
function normalizeIdentityState(value) {
	if (value !== "pending" && value !== "resolved") return;
	return value;
}
function normalizeIdentitySource(value) {
	if (value !== "ensure" && value !== "status" && value !== "event") return;
	return value;
}
function normalizeIdentity(identity) {
	if (!identity) return;
	const state = normalizeIdentityState(identity.state);
	const source = normalizeIdentitySource(identity.source);
	const acpxRecordId = normalizeText$1(identity.acpxRecordId);
	const acpxSessionId = normalizeText$1(identity.acpxSessionId);
	const agentSessionId = normalizeText$1(identity.agentSessionId);
	const lastUpdatedAt = typeof identity.lastUpdatedAt === "number" && Number.isFinite(identity.lastUpdatedAt) ? identity.lastUpdatedAt : void 0;
	if (!state && !source && !Boolean(acpxRecordId || acpxSessionId || agentSessionId) && lastUpdatedAt === void 0) return;
	return {
		state: state ?? (Boolean(acpxSessionId || agentSessionId) ? "resolved" : "pending"),
		...acpxRecordId ? { acpxRecordId } : {},
		...acpxSessionId ? { acpxSessionId } : {},
		...agentSessionId ? { agentSessionId } : {},
		source: source ?? "status",
		lastUpdatedAt: lastUpdatedAt ?? Date.now()
	};
}
function resolveSessionIdentityFromMeta(meta) {
	if (!meta) return;
	return normalizeIdentity(meta.identity);
}
function resolveRuntimeResumeSessionId(identity) {
	if (!identity) return;
	return normalizeText$1(identity.acpxSessionId) ?? normalizeText$1(identity.agentSessionId);
}
function isSessionIdentityPending(identity) {
	if (!identity) return true;
	return identity.state === "pending";
}
function identityEquals(left, right) {
	const a = normalizeIdentity(left);
	const b = normalizeIdentity(right);
	if (!a && !b) return true;
	if (!a || !b) return false;
	return a.state === b.state && a.acpxRecordId === b.acpxRecordId && a.acpxSessionId === b.acpxSessionId && a.agentSessionId === b.agentSessionId && a.source === b.source;
}
function mergeSessionIdentity(params) {
	const current = normalizeIdentity(params.current);
	const incoming = normalizeIdentity(params.incoming);
	if (!current) {
		if (!incoming) return;
		return {
			...incoming,
			lastUpdatedAt: params.now
		};
	}
	if (!incoming) return current;
	const currentResolved = current.state === "resolved";
	const incomingResolved = incoming.state === "resolved";
	const allowIncomingValue = !currentResolved || incomingResolved;
	const nextRecordId = allowIncomingValue && incoming.acpxRecordId ? incoming.acpxRecordId : current.acpxRecordId;
	const nextAcpxSessionId = allowIncomingValue && incoming.acpxSessionId ? incoming.acpxSessionId : current.acpxSessionId;
	const nextAgentSessionId = allowIncomingValue && incoming.agentSessionId ? incoming.agentSessionId : current.agentSessionId;
	const nextState = Boolean(nextAcpxSessionId || nextAgentSessionId) ? "resolved" : currentResolved ? "resolved" : incoming.state;
	const nextSource = allowIncomingValue ? incoming.source : current.source;
	return {
		state: nextState,
		...nextRecordId ? { acpxRecordId: nextRecordId } : {},
		...nextAcpxSessionId ? { acpxSessionId: nextAcpxSessionId } : {},
		...nextAgentSessionId ? { agentSessionId: nextAgentSessionId } : {},
		source: nextSource,
		lastUpdatedAt: params.now
	};
}
function createIdentityFromEnsure(params) {
	const acpxRecordId = normalizeText$1(params.handle.acpxRecordId);
	const acpxSessionId = normalizeText$1(params.handle.backendSessionId);
	const agentSessionId = normalizeText$1(params.handle.agentSessionId);
	if (!acpxRecordId && !acpxSessionId && !agentSessionId) return;
	return {
		state: "pending",
		...acpxRecordId ? { acpxRecordId } : {},
		...acpxSessionId ? { acpxSessionId } : {},
		...agentSessionId ? { agentSessionId } : {},
		source: "ensure",
		lastUpdatedAt: params.now
	};
}
function createIdentityFromStatus(params) {
	if (!params.status) return;
	const details = params.status.details;
	const acpxRecordId = normalizeText$1(params.status.acpxRecordId) ?? normalizeText$1(details?.acpxRecordId);
	const acpxSessionId = normalizeText$1(params.status.backendSessionId) ?? normalizeText$1(details?.backendSessionId) ?? normalizeText$1(details?.acpxSessionId);
	const agentSessionId = normalizeText$1(params.status.agentSessionId) ?? normalizeText$1(details?.agentSessionId);
	if (!acpxRecordId && !acpxSessionId && !agentSessionId) return;
	return {
		state: Boolean(acpxSessionId || agentSessionId) ? "resolved" : "pending",
		...acpxRecordId ? { acpxRecordId } : {},
		...acpxSessionId ? { acpxSessionId } : {},
		...agentSessionId ? { agentSessionId } : {},
		source: "status",
		lastUpdatedAt: params.now
	};
}
function resolveRuntimeHandleIdentifiersFromIdentity(identity) {
	if (!identity) return {};
	return {
		...identity.acpxSessionId ? { backendSessionId: identity.acpxSessionId } : {},
		...identity.agentSessionId ? { agentSessionId: identity.agentSessionId } : {}
	};
}
//#endregion
//#region src/acp/control-plane/manager.utils.ts
function resolveAcpAgentFromSessionKey(sessionKey, fallback = "main") {
	return normalizeAgentId(parseAgentSessionKey(sessionKey)?.agentId ?? fallback);
}
function resolveMissingMetaError(sessionKey) {
	return new AcpRuntimeError("ACP_SESSION_INIT_FAILED", `ACP metadata is missing for ${sessionKey}. Recreate this ACP session with /acp spawn and rebind the thread.`);
}
function resolveAcpSessionResolutionError(resolution) {
	if (resolution.kind === "ready") return null;
	if (resolution.kind === "stale") return resolution.error;
	return new AcpRuntimeError("ACP_SESSION_INIT_FAILED", `Session is not ACP-enabled: ${resolution.sessionKey}`);
}
function requireReadySessionMeta(resolution) {
	if (resolution.kind === "ready") return resolution.meta;
	throw resolveAcpSessionResolutionError(resolution);
}
function normalizeSessionKey(sessionKey) {
	return sessionKey.trim();
}
function canonicalizeAcpSessionKey(params) {
	const normalized = normalizeSessionKey(params.sessionKey);
	if (!normalized) return "";
	const lowered = normalized.toLowerCase();
	if (lowered === "global" || lowered === "unknown") return lowered;
	const parsed = parseAgentSessionKey(lowered);
	if (parsed) return canonicalizeMainSessionAlias({
		cfg: params.cfg,
		agentId: parsed.agentId,
		sessionKey: lowered
	});
	const mainKey = normalizeMainKey(params.cfg.session?.mainKey);
	if (lowered === "main" || lowered === mainKey) return resolveMainSessionKey(params.cfg);
	return lowered;
}
function normalizeActorKey(sessionKey) {
	return sessionKey.trim().toLowerCase();
}
function normalizeAcpErrorCode(code) {
	if (!code) return "ACP_TURN_FAILED";
	const normalized = code.trim().toUpperCase();
	for (const allowed of ACP_ERROR_CODES) if (allowed === normalized) return allowed;
	return "ACP_TURN_FAILED";
}
function createUnsupportedControlError(params) {
	return new AcpRuntimeError("ACP_BACKEND_UNSUPPORTED_CONTROL", `ACP backend "${params.backend}" does not support ${params.control}.`);
}
function resolveRuntimeIdleTtlMs(cfg) {
	const ttlMinutes = cfg.acp?.runtime?.ttlMinutes;
	if (typeof ttlMinutes !== "number" || !Number.isFinite(ttlMinutes) || ttlMinutes <= 0) return 0;
	return Math.round(ttlMinutes * 60 * 1e3);
}
function hasLegacyAcpIdentityProjection(meta) {
	const raw = meta;
	return Object.hasOwn(raw, "backendSessionId") || Object.hasOwn(raw, "agentSessionId") || Object.hasOwn(raw, "sessionIdsProvisional");
}
//#endregion
//#region src/acp/control-plane/manager.identity-reconcile.ts
async function reconcileManagerRuntimeSessionIdentifiers(params) {
	let runtimeStatus = params.runtimeStatus;
	if (!runtimeStatus && params.runtime.getStatus) try {
		runtimeStatus = await withAcpRuntimeErrorBoundary({
			run: async () => await params.runtime.getStatus({ handle: params.handle }),
			fallbackCode: "ACP_TURN_FAILED",
			fallbackMessage: "Could not read ACP runtime status."
		});
	} catch (error) {
		if (params.failOnStatusError) throw error;
		logVerbose(`acp-manager: failed to refresh ACP runtime status for ${params.sessionKey}: ${String(error)}`);
		return {
			handle: params.handle,
			meta: params.meta,
			runtimeStatus
		};
	}
	const now = Date.now();
	const currentIdentity = resolveSessionIdentityFromMeta(params.meta);
	const nextIdentity = mergeSessionIdentity({
		current: currentIdentity,
		incoming: createIdentityFromStatus({
			status: runtimeStatus,
			now
		}),
		now
	}) ?? currentIdentity;
	const handleIdentifiers = resolveRuntimeHandleIdentifiersFromIdentity(nextIdentity);
	const handleChanged = handleIdentifiers.backendSessionId !== params.handle.backendSessionId || handleIdentifiers.agentSessionId !== params.handle.agentSessionId;
	const nextHandle = handleChanged ? {
		...params.handle,
		...handleIdentifiers.backendSessionId ? { backendSessionId: handleIdentifiers.backendSessionId } : {},
		...handleIdentifiers.agentSessionId ? { agentSessionId: handleIdentifiers.agentSessionId } : {}
	} : params.handle;
	if (handleChanged) params.setCachedHandle(params.sessionKey, nextHandle);
	if (!(!identityEquals(currentIdentity, nextIdentity) || hasLegacyAcpIdentityProjection(params.meta))) return {
		handle: nextHandle,
		meta: params.meta,
		runtimeStatus
	};
	const nextMeta = {
		backend: params.meta.backend,
		agent: params.meta.agent,
		runtimeSessionName: params.meta.runtimeSessionName,
		...nextIdentity ? { identity: nextIdentity } : {},
		mode: params.meta.mode,
		...params.meta.runtimeOptions ? { runtimeOptions: params.meta.runtimeOptions } : {},
		...params.meta.cwd ? { cwd: params.meta.cwd } : {},
		lastActivityAt: now,
		state: params.meta.state,
		...params.meta.lastError ? { lastError: params.meta.lastError } : {}
	};
	if (!identityEquals(currentIdentity, nextIdentity)) {
		const currentAgentSessionId = currentIdentity?.agentSessionId ?? "<none>";
		const nextAgentSessionId = nextIdentity?.agentSessionId ?? "<none>";
		const currentAcpxSessionId = currentIdentity?.acpxSessionId ?? "<none>";
		const nextAcpxSessionId = nextIdentity?.acpxSessionId ?? "<none>";
		const currentAcpxRecordId = currentIdentity?.acpxRecordId ?? "<none>";
		const nextAcpxRecordId = nextIdentity?.acpxRecordId ?? "<none>";
		logVerbose(`acp-manager: session identity updated for ${params.sessionKey} (agentSessionId ${currentAgentSessionId} -> ${nextAgentSessionId}, acpxSessionId ${currentAcpxSessionId} -> ${nextAcpxSessionId}, acpxRecordId ${currentAcpxRecordId} -> ${nextAcpxRecordId})`);
	}
	await params.writeSessionMeta({
		cfg: params.cfg,
		sessionKey: params.sessionKey,
		mutate: (current, entry) => {
			if (!entry) return null;
			const base = current ?? entry.acp;
			if (!base) return null;
			return {
				backend: base.backend,
				agent: base.agent,
				runtimeSessionName: base.runtimeSessionName,
				...nextIdentity ? { identity: nextIdentity } : {},
				mode: base.mode,
				...base.runtimeOptions ? { runtimeOptions: base.runtimeOptions } : {},
				...base.cwd ? { cwd: base.cwd } : {},
				state: base.state,
				lastActivityAt: now,
				...base.lastError ? { lastError: base.lastError } : {}
			};
		}
	});
	return {
		handle: nextHandle,
		meta: nextMeta,
		runtimeStatus
	};
}
//#endregion
//#region src/acp/control-plane/runtime-options.ts
const MAX_RUNTIME_MODE_LENGTH = 64;
const MAX_MODEL_LENGTH = 200;
const MAX_PERMISSION_PROFILE_LENGTH = 80;
const MAX_CWD_LENGTH = 4096;
const MIN_TIMEOUT_SECONDS = 1;
const MAX_TIMEOUT_SECONDS = 1440 * 60;
const MAX_BACKEND_OPTION_KEY_LENGTH = 64;
const MAX_BACKEND_OPTION_VALUE_LENGTH = 512;
const MAX_BACKEND_EXTRAS = 32;
const SAFE_OPTION_KEY_RE = /^[a-z0-9][a-z0-9._:-]*$/i;
function failInvalidOption(message) {
	throw new AcpRuntimeError("ACP_INVALID_RUNTIME_OPTION", message);
}
function validateNoControlChars(value, field) {
	for (let i = 0; i < value.length; i += 1) {
		const code = value.charCodeAt(i);
		if (code < 32 || code === 127) failInvalidOption(`${field} must not include control characters.`);
	}
	return value;
}
function validateBoundedText(params) {
	const normalized = normalizeText(params.value);
	if (!normalized) failInvalidOption(`${params.field} must not be empty.`);
	if (normalized.length > params.maxLength) failInvalidOption(`${params.field} must be at most ${params.maxLength} characters.`);
	return validateNoControlChars(normalized, params.field);
}
function validateBackendOptionKey(rawKey) {
	const key = validateBoundedText({
		value: rawKey,
		field: "ACP config key",
		maxLength: MAX_BACKEND_OPTION_KEY_LENGTH
	});
	if (!SAFE_OPTION_KEY_RE.test(key)) failInvalidOption("ACP config key must use letters, numbers, dots, colons, underscores, or dashes.");
	return key;
}
function validateBackendOptionValue(rawValue) {
	return validateBoundedText({
		value: rawValue,
		field: "ACP config value",
		maxLength: MAX_BACKEND_OPTION_VALUE_LENGTH
	});
}
function validateRuntimeModeInput(rawMode) {
	return validateBoundedText({
		value: rawMode,
		field: "Runtime mode",
		maxLength: MAX_RUNTIME_MODE_LENGTH
	});
}
function validateRuntimeModelInput(rawModel) {
	return validateBoundedText({
		value: rawModel,
		field: "Model id",
		maxLength: MAX_MODEL_LENGTH
	});
}
function validateRuntimePermissionProfileInput(rawProfile) {
	return validateBoundedText({
		value: rawProfile,
		field: "Permission profile",
		maxLength: MAX_PERMISSION_PROFILE_LENGTH
	});
}
function validateRuntimeCwdInput(rawCwd) {
	const cwd = validateBoundedText({
		value: rawCwd,
		field: "Working directory",
		maxLength: MAX_CWD_LENGTH
	});
	if (!isAbsolute(cwd)) failInvalidOption(`Working directory must be an absolute path. Received "${cwd}".`);
	return cwd;
}
function validateRuntimeTimeoutSecondsInput(rawTimeout) {
	if (typeof rawTimeout !== "number" || !Number.isFinite(rawTimeout)) failInvalidOption("Timeout must be a positive integer in seconds.");
	const timeout = Math.round(rawTimeout);
	if (timeout < MIN_TIMEOUT_SECONDS || timeout > MAX_TIMEOUT_SECONDS) failInvalidOption(`Timeout must be between ${MIN_TIMEOUT_SECONDS} and ${MAX_TIMEOUT_SECONDS} seconds.`);
	return timeout;
}
function parseRuntimeTimeoutSecondsInput(rawTimeout) {
	const normalized = normalizeText(rawTimeout);
	if (!normalized || !/^\d+$/.test(normalized)) failInvalidOption("Timeout must be a positive integer in seconds.");
	return validateRuntimeTimeoutSecondsInput(Number.parseInt(normalized, 10));
}
function validateRuntimeConfigOptionInput(rawKey, rawValue) {
	return {
		key: validateBackendOptionKey(rawKey),
		value: validateBackendOptionValue(rawValue)
	};
}
function validateRuntimeOptionPatch(patch) {
	if (!patch) return {};
	const rawPatch = patch;
	const allowedKeys = new Set([
		"runtimeMode",
		"model",
		"cwd",
		"permissionProfile",
		"timeoutSeconds",
		"backendExtras"
	]);
	for (const key of Object.keys(rawPatch)) if (!allowedKeys.has(key)) failInvalidOption(`Unknown runtime option "${key}".`);
	const next = {};
	if (Object.hasOwn(rawPatch, "runtimeMode")) if (rawPatch.runtimeMode === void 0) next.runtimeMode = void 0;
	else next.runtimeMode = validateRuntimeModeInput(rawPatch.runtimeMode);
	if (Object.hasOwn(rawPatch, "model")) if (rawPatch.model === void 0) next.model = void 0;
	else next.model = validateRuntimeModelInput(rawPatch.model);
	if (Object.hasOwn(rawPatch, "cwd")) if (rawPatch.cwd === void 0) next.cwd = void 0;
	else next.cwd = validateRuntimeCwdInput(rawPatch.cwd);
	if (Object.hasOwn(rawPatch, "permissionProfile")) if (rawPatch.permissionProfile === void 0) next.permissionProfile = void 0;
	else next.permissionProfile = validateRuntimePermissionProfileInput(rawPatch.permissionProfile);
	if (Object.hasOwn(rawPatch, "timeoutSeconds")) if (rawPatch.timeoutSeconds === void 0) next.timeoutSeconds = void 0;
	else next.timeoutSeconds = validateRuntimeTimeoutSecondsInput(rawPatch.timeoutSeconds);
	if (Object.hasOwn(rawPatch, "backendExtras")) {
		const rawExtras = rawPatch.backendExtras;
		if (rawExtras === void 0) next.backendExtras = void 0;
		else if (!rawExtras || typeof rawExtras !== "object" || Array.isArray(rawExtras)) failInvalidOption("Backend extras must be a key/value object.");
		else {
			const entries = Object.entries(rawExtras);
			if (entries.length > MAX_BACKEND_EXTRAS) failInvalidOption(`Backend extras must include at most ${MAX_BACKEND_EXTRAS} entries.`);
			const extras = {};
			for (const [entryKey, entryValue] of entries) {
				const { key, value } = validateRuntimeConfigOptionInput(entryKey, entryValue);
				extras[key] = value;
			}
			next.backendExtras = Object.keys(extras).length > 0 ? extras : void 0;
		}
	}
	return next;
}
function normalizeText(value) {
	if (typeof value !== "string") return;
	return value.trim() || void 0;
}
function normalizeRuntimeOptions(options) {
	const runtimeMode = normalizeText(options?.runtimeMode);
	const model = normalizeText(options?.model);
	const cwd = normalizeText(options?.cwd);
	const permissionProfile = normalizeText(options?.permissionProfile);
	let timeoutSeconds;
	if (typeof options?.timeoutSeconds === "number" && Number.isFinite(options.timeoutSeconds)) {
		const rounded = Math.round(options.timeoutSeconds);
		if (rounded > 0) timeoutSeconds = rounded;
	}
	const backendExtrasEntries = Object.entries(options?.backendExtras ?? {}).map(([key, value]) => [normalizeText(key), normalizeText(value)]).filter(([key, value]) => Boolean(key && value));
	const backendExtras = backendExtrasEntries.length > 0 ? Object.fromEntries(backendExtrasEntries) : void 0;
	return {
		...runtimeMode ? { runtimeMode } : {},
		...model ? { model } : {},
		...cwd ? { cwd } : {},
		...permissionProfile ? { permissionProfile } : {},
		...typeof timeoutSeconds === "number" ? { timeoutSeconds } : {},
		...backendExtras ? { backendExtras } : {}
	};
}
function mergeRuntimeOptions(params) {
	const current = normalizeRuntimeOptions(params.current);
	const patch = normalizeRuntimeOptions(validateRuntimeOptionPatch(params.patch));
	const mergedExtras = {
		...current.backendExtras,
		...patch.backendExtras
	};
	return normalizeRuntimeOptions({
		...current,
		...patch,
		...Object.keys(mergedExtras).length > 0 ? { backendExtras: mergedExtras } : {}
	});
}
function resolveRuntimeOptionsFromMeta(meta) {
	const normalized = normalizeRuntimeOptions(meta.runtimeOptions);
	if (normalized.cwd || !meta.cwd) return normalized;
	return normalizeRuntimeOptions({
		...normalized,
		cwd: meta.cwd
	});
}
function runtimeOptionsEqual(a, b) {
	return JSON.stringify(normalizeRuntimeOptions(a)) === JSON.stringify(normalizeRuntimeOptions(b));
}
function buildRuntimeControlSignature(options) {
	const normalized = normalizeRuntimeOptions(options);
	const extras = Object.entries(normalized.backendExtras ?? {}).toSorted(([a], [b]) => a.localeCompare(b));
	return JSON.stringify({
		runtimeMode: normalized.runtimeMode ?? null,
		model: normalized.model ?? null,
		permissionProfile: normalized.permissionProfile ?? null,
		timeoutSeconds: normalized.timeoutSeconds ?? null,
		backendExtras: extras
	});
}
function buildRuntimeConfigOptionPairs(options) {
	const normalized = normalizeRuntimeOptions(options);
	const pairs = /* @__PURE__ */ new Map();
	if (normalized.model) pairs.set("model", normalized.model);
	if (normalized.permissionProfile) pairs.set("approval_policy", normalized.permissionProfile);
	if (typeof normalized.timeoutSeconds === "number") pairs.set("timeout", String(normalized.timeoutSeconds));
	for (const [key, value] of Object.entries(normalized.backendExtras ?? {})) if (!pairs.has(key)) pairs.set(key, value);
	return [...pairs.entries()];
}
function inferRuntimeOptionPatchFromConfigOption(key, value) {
	const validated = validateRuntimeConfigOptionInput(key, value);
	const normalizedKey = validated.key.toLowerCase();
	if (normalizedKey === "model") return { model: validateRuntimeModelInput(validated.value) };
	if (normalizedKey === "approval_policy" || normalizedKey === "permission_profile" || normalizedKey === "permissions") return { permissionProfile: validateRuntimePermissionProfileInput(validated.value) };
	if (normalizedKey === "timeout" || normalizedKey === "timeout_seconds") return { timeoutSeconds: parseRuntimeTimeoutSecondsInput(validated.value) };
	if (normalizedKey === "cwd") return { cwd: validateRuntimeCwdInput(validated.value) };
	return { backendExtras: { [validated.key]: validated.value } };
}
//#endregion
//#region src/acp/control-plane/manager.runtime-controls.ts
async function resolveManagerRuntimeCapabilities(params) {
	let reported;
	if (params.runtime.getCapabilities) reported = await withAcpRuntimeErrorBoundary({
		run: async () => await params.runtime.getCapabilities({ handle: params.handle }),
		fallbackCode: "ACP_TURN_FAILED",
		fallbackMessage: "Could not read ACP runtime capabilities."
	});
	const controls = new Set(reported?.controls ?? []);
	if (params.runtime.setMode) controls.add("session/set_mode");
	if (params.runtime.setConfigOption) controls.add("session/set_config_option");
	if (params.runtime.getStatus) controls.add("session/status");
	const normalizedKeys = (reported?.configOptionKeys ?? []).map((entry) => normalizeText(entry)).filter(Boolean);
	return {
		controls: [...controls].toSorted(),
		...normalizedKeys.length > 0 ? { configOptionKeys: normalizedKeys } : {}
	};
}
async function applyManagerRuntimeControls(params) {
	const options = resolveRuntimeOptionsFromMeta(params.meta);
	const signature = buildRuntimeControlSignature(options);
	const cached = params.getCachedRuntimeState(params.sessionKey);
	if (cached?.appliedControlSignature === signature) return;
	const capabilities = await resolveManagerRuntimeCapabilities({
		runtime: params.runtime,
		handle: params.handle
	});
	const backend = params.handle.backend || params.meta.backend;
	const runtimeMode = normalizeText(options.runtimeMode);
	const configOptions = buildRuntimeConfigOptionPairs(options);
	const advertisedKeys = new Set((capabilities.configOptionKeys ?? []).map((entry) => normalizeText(entry)).filter(Boolean));
	await withAcpRuntimeErrorBoundary({
		run: async () => {
			if (runtimeMode) {
				if (!capabilities.controls.includes("session/set_mode") || !params.runtime.setMode) throw createUnsupportedControlError({
					backend,
					control: "session/set_mode"
				});
				await params.runtime.setMode({
					handle: params.handle,
					mode: runtimeMode
				});
			}
			if (configOptions.length > 0) {
				if (!capabilities.controls.includes("session/set_config_option") || !params.runtime.setConfigOption) throw createUnsupportedControlError({
					backend,
					control: "session/set_config_option"
				});
				for (const [key, value] of configOptions) {
					if (advertisedKeys.size > 0 && !advertisedKeys.has(key)) throw new AcpRuntimeError("ACP_BACKEND_UNSUPPORTED_CONTROL", `ACP backend "${backend}" does not accept config key "${key}".`);
					await params.runtime.setConfigOption({
						handle: params.handle,
						key,
						value
					});
				}
			}
		},
		fallbackCode: "ACP_TURN_FAILED",
		fallbackMessage: "Could not apply ACP runtime options before turn execution."
	});
	if (cached) cached.appliedControlSignature = signature;
}
//#endregion
//#region src/acp/runtime/registry.ts
const ACP_RUNTIME_REGISTRY_STATE_KEY = Symbol.for("openclaw.acpRuntimeRegistryState");
function resolveAcpRuntimeRegistryGlobalState() {
	return resolveGlobalSingleton(ACP_RUNTIME_REGISTRY_STATE_KEY, () => ({ backendsById: /* @__PURE__ */ new Map() }));
}
const ACP_BACKENDS_BY_ID = resolveAcpRuntimeRegistryGlobalState().backendsById;
function normalizeBackendId(id) {
	return id?.trim().toLowerCase() || "";
}
function isBackendHealthy(backend) {
	if (!backend.healthy) return true;
	try {
		return backend.healthy();
	} catch {
		return false;
	}
}
function registerAcpRuntimeBackend(backend) {
	const id = normalizeBackendId(backend.id);
	if (!id) throw new Error("ACP runtime backend id is required");
	if (!backend.runtime) throw new Error(`ACP runtime backend "${id}" is missing runtime implementation`);
	ACP_BACKENDS_BY_ID.set(id, {
		...backend,
		id
	});
}
function unregisterAcpRuntimeBackend(id) {
	const normalized = normalizeBackendId(id);
	if (!normalized) return;
	ACP_BACKENDS_BY_ID.delete(normalized);
}
function getAcpRuntimeBackend(id) {
	const normalized = normalizeBackendId(id);
	if (normalized) return ACP_BACKENDS_BY_ID.get(normalized) ?? null;
	if (ACP_BACKENDS_BY_ID.size === 0) return null;
	for (const backend of ACP_BACKENDS_BY_ID.values()) if (isBackendHealthy(backend)) return backend;
	return ACP_BACKENDS_BY_ID.values().next().value ?? null;
}
function requireAcpRuntimeBackend(id) {
	const normalized = normalizeBackendId(id);
	const backend = getAcpRuntimeBackend(normalized || void 0);
	if (!backend) throw new AcpRuntimeError("ACP_BACKEND_MISSING", "ACP runtime backend is not configured. Install and enable the acpx runtime plugin.");
	if (!isBackendHealthy(backend)) throw new AcpRuntimeError("ACP_BACKEND_UNAVAILABLE", "ACP runtime backend is currently unavailable. Try again in a moment.");
	if (normalized && backend.id !== normalized) throw new AcpRuntimeError("ACP_BACKEND_MISSING", `ACP runtime backend "${normalized}" is not registered.`);
	return backend;
}
//#endregion
//#region src/acp/runtime/session-meta.ts
function resolveStoreSessionKey(store, sessionKey) {
	const normalized = sessionKey.trim();
	if (!normalized) return "";
	if (store[normalized]) return normalized;
	const lower = normalized.toLowerCase();
	if (store[lower]) return lower;
	for (const key of Object.keys(store)) if (key.toLowerCase() === lower) return key;
	return lower;
}
function resolveSessionStorePathForAcp(params) {
	const cfg = params.cfg ?? loadConfig();
	const parsed = parseAgentSessionKey(params.sessionKey);
	return {
		cfg,
		storePath: resolveStorePath(cfg.session?.store, { agentId: parsed?.agentId })
	};
}
function readAcpSessionEntry(params) {
	const sessionKey = params.sessionKey.trim();
	if (!sessionKey) return null;
	const { cfg, storePath } = resolveSessionStorePathForAcp({
		sessionKey,
		cfg: params.cfg
	});
	let store;
	let storeReadFailed = false;
	try {
		store = loadSessionStore(storePath);
	} catch {
		storeReadFailed = true;
		store = {};
	}
	const storeSessionKey = resolveStoreSessionKey(store, sessionKey);
	const entry = store[storeSessionKey];
	return {
		cfg,
		storePath,
		sessionKey,
		storeSessionKey,
		entry,
		acp: entry?.acp,
		storeReadFailed
	};
}
async function listAcpSessionEntries(params) {
	const cfg = params.cfg ?? loadConfig();
	const storeTargets = await resolveAllAgentSessionStoreTargets(cfg, params.env ? { env: params.env } : void 0);
	const entries = [];
	for (const target of storeTargets) {
		const storePath = target.storePath;
		let store;
		try {
			store = loadSessionStore(storePath);
		} catch {
			continue;
		}
		for (const [sessionKey, entry] of Object.entries(store)) {
			if (!entry?.acp) continue;
			entries.push({
				cfg,
				storePath,
				sessionKey,
				storeSessionKey: sessionKey,
				entry,
				acp: entry.acp
			});
		}
	}
	return entries;
}
async function upsertAcpSessionMeta(params) {
	const sessionKey = params.sessionKey.trim();
	if (!sessionKey) return null;
	const { storePath } = resolveSessionStorePathForAcp({
		sessionKey,
		cfg: params.cfg
	});
	return await updateSessionStore(storePath, (store) => {
		const storeSessionKey = resolveStoreSessionKey(store, sessionKey);
		const currentEntry = store[storeSessionKey];
		const nextMeta = params.mutate(currentEntry?.acp, currentEntry);
		if (nextMeta === void 0) return currentEntry ?? null;
		if (nextMeta === null && !currentEntry) return null;
		const nextEntry = mergeSessionEntry(currentEntry, { acp: nextMeta ?? void 0 });
		if (nextMeta === null) delete nextEntry.acp;
		store[storeSessionKey] = nextEntry;
		return nextEntry;
	}, {
		activeSessionKey: sessionKey.toLowerCase(),
		allowDropAcpMetaSessionKeys: [sessionKey]
	});
}
//#endregion
//#region src/acp/control-plane/manager.types.ts
const DEFAULT_DEPS = {
	listAcpSessions: listAcpSessionEntries,
	readSessionEntry: readAcpSessionEntry,
	upsertSessionMeta: upsertAcpSessionMeta,
	requireRuntimeBackend: requireAcpRuntimeBackend
};
//#endregion
//#region src/acp/control-plane/runtime-cache.ts
var RuntimeCache = class {
	constructor() {
		this.cache = /* @__PURE__ */ new Map();
	}
	size() {
		return this.cache.size;
	}
	has(actorKey) {
		return this.cache.has(actorKey);
	}
	get(actorKey, params = {}) {
		const entry = this.cache.get(actorKey);
		if (!entry) return null;
		if (params.touch !== false) entry.lastTouchedAt = params.now ?? Date.now();
		return entry.state;
	}
	peek(actorKey) {
		return this.get(actorKey, { touch: false });
	}
	getLastTouchedAt(actorKey) {
		return this.cache.get(actorKey)?.lastTouchedAt ?? null;
	}
	set(actorKey, state, params = {}) {
		this.cache.set(actorKey, {
			state,
			lastTouchedAt: params.now ?? Date.now()
		});
	}
	clear(actorKey) {
		this.cache.delete(actorKey);
	}
	snapshot(params = {}) {
		const now = params.now ?? Date.now();
		const entries = [];
		for (const [actorKey, entry] of this.cache.entries()) entries.push({
			actorKey,
			state: entry.state,
			lastTouchedAt: entry.lastTouchedAt,
			idleMs: Math.max(0, now - entry.lastTouchedAt)
		});
		return entries;
	}
	collectIdleCandidates(params) {
		if (!Number.isFinite(params.maxIdleMs) || params.maxIdleMs <= 0) return [];
		const now = params.now ?? Date.now();
		return this.snapshot({ now }).filter((entry) => entry.idleMs >= params.maxIdleMs);
	}
};
//#endregion
//#region src/acp/control-plane/session-actor-queue.ts
var SessionActorQueue = class {
	constructor() {
		this.queue = new KeyedAsyncQueue();
		this.pendingBySession = /* @__PURE__ */ new Map();
	}
	getTailMapForTesting() {
		return this.queue.getTailMapForTesting();
	}
	getTotalPendingCount() {
		let total = 0;
		for (const count of this.pendingBySession.values()) total += count;
		return total;
	}
	getPendingCountForSession(actorKey) {
		return this.pendingBySession.get(actorKey) ?? 0;
	}
	async run(actorKey, op) {
		return this.queue.enqueue(actorKey, op, {
			onEnqueue: () => {
				this.pendingBySession.set(actorKey, (this.pendingBySession.get(actorKey) ?? 0) + 1);
			},
			onSettle: () => {
				const pending = (this.pendingBySession.get(actorKey) ?? 1) - 1;
				if (pending <= 0) this.pendingBySession.delete(actorKey);
				else this.pendingBySession.set(actorKey, pending);
			}
		});
	}
};
//#endregion
//#region src/acp/control-plane/manager.core.ts
const ACP_TURN_TIMEOUT_GRACE_MS = 1e3;
const ACP_TURN_TIMEOUT_CLEANUP_GRACE_MS = 2e3;
const ACP_TURN_TIMEOUT_REASON = "turn-timeout";
var AcpSessionManager = class {
	constructor(deps = DEFAULT_DEPS) {
		this.deps = deps;
		this.actorQueue = new SessionActorQueue();
		this.actorTailBySession = this.actorQueue.getTailMapForTesting();
		this.runtimeCache = new RuntimeCache();
		this.activeTurnBySession = /* @__PURE__ */ new Map();
		this.turnLatencyStats = {
			completed: 0,
			failed: 0,
			totalMs: 0,
			maxMs: 0
		};
		this.errorCountsByCode = /* @__PURE__ */ new Map();
		this.evictedRuntimeCount = 0;
	}
	resolveSession(params) {
		const sessionKey = canonicalizeAcpSessionKey(params);
		if (!sessionKey) return {
			kind: "none",
			sessionKey
		};
		const acp = this.deps.readSessionEntry({
			cfg: params.cfg,
			sessionKey
		})?.acp;
		if (acp) return {
			kind: "ready",
			sessionKey,
			meta: acp
		};
		if (isAcpSessionKey(sessionKey)) return {
			kind: "stale",
			sessionKey,
			error: resolveMissingMetaError(sessionKey)
		};
		return {
			kind: "none",
			sessionKey
		};
	}
	getObservabilitySnapshot(cfg) {
		const completedTurns = this.turnLatencyStats.completed + this.turnLatencyStats.failed;
		const averageLatencyMs = completedTurns > 0 ? Math.round(this.turnLatencyStats.totalMs / completedTurns) : 0;
		return {
			runtimeCache: {
				activeSessions: this.runtimeCache.size(),
				idleTtlMs: resolveRuntimeIdleTtlMs(cfg),
				evictedTotal: this.evictedRuntimeCount,
				...this.lastEvictedAt ? { lastEvictedAt: this.lastEvictedAt } : {}
			},
			turns: {
				active: this.activeTurnBySession.size,
				queueDepth: this.actorQueue.getTotalPendingCount(),
				completed: this.turnLatencyStats.completed,
				failed: this.turnLatencyStats.failed,
				averageLatencyMs,
				maxLatencyMs: this.turnLatencyStats.maxMs
			},
			errorsByCode: Object.fromEntries([...this.errorCountsByCode.entries()].toSorted(([a], [b]) => a.localeCompare(b)))
		};
	}
	async reconcilePendingSessionIdentities(params) {
		let checked = 0;
		let resolved = 0;
		let failed = 0;
		let acpSessions;
		try {
			acpSessions = await this.deps.listAcpSessions({ cfg: params.cfg });
		} catch (error) {
			logVerbose(`acp-manager: startup identity scan failed: ${String(error)}`);
			return {
				checked,
				resolved,
				failed: failed + 1
			};
		}
		for (const session of acpSessions) {
			if (!session.acp || !session.sessionKey) continue;
			if (!isSessionIdentityPending(resolveSessionIdentityFromMeta(session.acp))) continue;
			checked += 1;
			try {
				if (await this.withSessionActor(session.sessionKey, async () => {
					const resolution = this.resolveSession({
						cfg: params.cfg,
						sessionKey: session.sessionKey
					});
					if (resolution.kind !== "ready") return false;
					const { runtime, handle, meta } = await this.ensureRuntimeHandle({
						cfg: params.cfg,
						sessionKey: session.sessionKey,
						meta: resolution.meta
					});
					return !isSessionIdentityPending(resolveSessionIdentityFromMeta((await this.reconcileRuntimeSessionIdentifiers({
						cfg: params.cfg,
						sessionKey: session.sessionKey,
						runtime,
						handle,
						meta,
						failOnStatusError: false
					})).meta));
				})) resolved += 1;
			} catch (error) {
				failed += 1;
				logVerbose(`acp-manager: startup identity reconcile failed for ${session.sessionKey}: ${String(error)}`);
			}
		}
		return {
			checked,
			resolved,
			failed
		};
	}
	async initializeSession(input) {
		const sessionKey = canonicalizeAcpSessionKey({
			cfg: input.cfg,
			sessionKey: input.sessionKey
		});
		if (!sessionKey) throw new AcpRuntimeError("ACP_SESSION_INIT_FAILED", "ACP session key is required.");
		const agent = normalizeAgentId(input.agent);
		await this.evictIdleRuntimeHandles({ cfg: input.cfg });
		return await this.withSessionActor(sessionKey, async () => {
			const backend = this.deps.requireRuntimeBackend(input.backendId || input.cfg.acp?.backend);
			const runtime = backend.runtime;
			const initialRuntimeOptions = validateRuntimeOptionPatch({ cwd: input.cwd });
			const requestedCwd = initialRuntimeOptions.cwd;
			this.enforceConcurrentSessionLimit({
				cfg: input.cfg,
				sessionKey
			});
			const handle = await withAcpRuntimeErrorBoundary({
				run: async () => await runtime.ensureSession({
					sessionKey,
					agent,
					mode: input.mode,
					resumeSessionId: input.resumeSessionId,
					cwd: requestedCwd
				}),
				fallbackCode: "ACP_SESSION_INIT_FAILED",
				fallbackMessage: "Could not initialize ACP session runtime."
			});
			const effectiveCwd = normalizeText(handle.cwd) ?? requestedCwd;
			const effectiveRuntimeOptions = normalizeRuntimeOptions({
				...initialRuntimeOptions,
				...effectiveCwd ? { cwd: effectiveCwd } : {}
			});
			const identityNow = Date.now();
			const initializedIdentity = mergeSessionIdentity({
				current: void 0,
				incoming: createIdentityFromEnsure({
					handle,
					now: identityNow
				}),
				now: identityNow
			}) ?? {
				state: "pending",
				source: "ensure",
				lastUpdatedAt: identityNow
			};
			const meta = {
				backend: handle.backend || backend.id,
				agent,
				runtimeSessionName: handle.runtimeSessionName,
				identity: initializedIdentity,
				mode: input.mode,
				...Object.keys(effectiveRuntimeOptions).length > 0 ? { runtimeOptions: effectiveRuntimeOptions } : {},
				cwd: effectiveCwd,
				state: "idle",
				lastActivityAt: Date.now()
			};
			try {
				if (!(await this.writeSessionMeta({
					cfg: input.cfg,
					sessionKey,
					mutate: () => meta,
					failOnError: true
				}))?.acp) throw new AcpRuntimeError("ACP_SESSION_INIT_FAILED", `Could not persist ACP metadata for ${sessionKey}.`);
			} catch (error) {
				await runtime.close({
					handle,
					reason: "init-meta-failed"
				}).catch((closeError) => {
					logVerbose(`acp-manager: cleanup close failed after metadata write error for ${sessionKey}: ${String(closeError)}`);
				});
				throw error;
			}
			this.setCachedRuntimeState(sessionKey, {
				runtime,
				handle,
				backend: handle.backend || backend.id,
				agent,
				mode: input.mode,
				cwd: effectiveCwd
			});
			return {
				runtime,
				handle,
				meta
			};
		});
	}
	async getSessionStatus(params) {
		const sessionKey = canonicalizeAcpSessionKey(params);
		if (!sessionKey) throw new AcpRuntimeError("ACP_SESSION_INIT_FAILED", "ACP session key is required.");
		this.throwIfAborted(params.signal);
		await this.evictIdleRuntimeHandles({ cfg: params.cfg });
		return await this.withSessionActor(sessionKey, async () => {
			this.throwIfAborted(params.signal);
			const resolvedMeta = requireReadySessionMeta(this.resolveSession({
				cfg: params.cfg,
				sessionKey
			}));
			const { runtime, handle: ensuredHandle, meta: ensuredMeta } = await this.ensureRuntimeHandle({
				cfg: params.cfg,
				sessionKey,
				meta: resolvedMeta
			});
			let handle = ensuredHandle;
			let meta = ensuredMeta;
			const capabilities = await this.resolveRuntimeCapabilities({
				runtime,
				handle
			});
			let runtimeStatus;
			if (runtime.getStatus) runtimeStatus = await withAcpRuntimeErrorBoundary({
				run: async () => {
					this.throwIfAborted(params.signal);
					const status = await runtime.getStatus({
						handle,
						...params.signal ? { signal: params.signal } : {}
					});
					this.throwIfAborted(params.signal);
					return status;
				},
				fallbackCode: "ACP_TURN_FAILED",
				fallbackMessage: "Could not read ACP runtime status."
			});
			({handle, meta, runtimeStatus} = await this.reconcileRuntimeSessionIdentifiers({
				cfg: params.cfg,
				sessionKey,
				runtime,
				handle,
				meta,
				runtimeStatus,
				failOnStatusError: true
			}));
			const identity = resolveSessionIdentityFromMeta(meta);
			return {
				sessionKey,
				backend: handle.backend || meta.backend,
				agent: meta.agent,
				...identity ? { identity } : {},
				state: meta.state,
				mode: meta.mode,
				runtimeOptions: resolveRuntimeOptionsFromMeta(meta),
				capabilities,
				runtimeStatus,
				lastActivityAt: meta.lastActivityAt,
				lastError: meta.lastError
			};
		}, params.signal);
	}
	async setSessionRuntimeMode(params) {
		const sessionKey = canonicalizeAcpSessionKey(params);
		if (!sessionKey) throw new AcpRuntimeError("ACP_SESSION_INIT_FAILED", "ACP session key is required.");
		const runtimeMode = validateRuntimeModeInput(params.runtimeMode);
		await this.evictIdleRuntimeHandles({ cfg: params.cfg });
		return await this.withSessionActor(sessionKey, async () => {
			const resolvedMeta = requireReadySessionMeta(this.resolveSession({
				cfg: params.cfg,
				sessionKey
			}));
			const { runtime, handle, meta } = await this.ensureRuntimeHandle({
				cfg: params.cfg,
				sessionKey,
				meta: resolvedMeta
			});
			if (!(await this.resolveRuntimeCapabilities({
				runtime,
				handle
			})).controls.includes("session/set_mode") || !runtime.setMode) throw createUnsupportedControlError({
				backend: handle.backend || meta.backend,
				control: "session/set_mode"
			});
			await withAcpRuntimeErrorBoundary({
				run: async () => await runtime.setMode({
					handle,
					mode: runtimeMode
				}),
				fallbackCode: "ACP_TURN_FAILED",
				fallbackMessage: "Could not update ACP runtime mode."
			});
			const nextOptions = mergeRuntimeOptions({
				current: resolveRuntimeOptionsFromMeta(meta),
				patch: { runtimeMode }
			});
			await this.persistRuntimeOptions({
				cfg: params.cfg,
				sessionKey,
				options: nextOptions
			});
			return nextOptions;
		});
	}
	async setSessionConfigOption(params) {
		const sessionKey = canonicalizeAcpSessionKey(params);
		if (!sessionKey) throw new AcpRuntimeError("ACP_SESSION_INIT_FAILED", "ACP session key is required.");
		const normalizedOption = validateRuntimeConfigOptionInput(params.key, params.value);
		const key = normalizedOption.key;
		const value = normalizedOption.value;
		await this.evictIdleRuntimeHandles({ cfg: params.cfg });
		return await this.withSessionActor(sessionKey, async () => {
			const resolvedMeta = requireReadySessionMeta(this.resolveSession({
				cfg: params.cfg,
				sessionKey
			}));
			const { runtime, handle, meta } = await this.ensureRuntimeHandle({
				cfg: params.cfg,
				sessionKey,
				meta: resolvedMeta
			});
			const inferredPatch = inferRuntimeOptionPatchFromConfigOption(key, value);
			const capabilities = await this.resolveRuntimeCapabilities({
				runtime,
				handle
			});
			if (!capabilities.controls.includes("session/set_config_option") || !runtime.setConfigOption) throw createUnsupportedControlError({
				backend: handle.backend || meta.backend,
				control: "session/set_config_option"
			});
			const advertisedKeys = new Set((capabilities.configOptionKeys ?? []).map((entry) => normalizeText(entry)).filter(Boolean));
			if (advertisedKeys.size > 0 && !advertisedKeys.has(key)) throw new AcpRuntimeError("ACP_BACKEND_UNSUPPORTED_CONTROL", `ACP backend "${handle.backend || meta.backend}" does not accept config key "${key}".`);
			await withAcpRuntimeErrorBoundary({
				run: async () => await runtime.setConfigOption({
					handle,
					key,
					value
				}),
				fallbackCode: "ACP_TURN_FAILED",
				fallbackMessage: "Could not update ACP runtime config option."
			});
			const nextOptions = mergeRuntimeOptions({
				current: resolveRuntimeOptionsFromMeta(meta),
				patch: inferredPatch
			});
			await this.persistRuntimeOptions({
				cfg: params.cfg,
				sessionKey,
				options: nextOptions
			});
			return nextOptions;
		});
	}
	async updateSessionRuntimeOptions(params) {
		const sessionKey = canonicalizeAcpSessionKey(params);
		const validatedPatch = validateRuntimeOptionPatch(params.patch);
		if (!sessionKey) throw new AcpRuntimeError("ACP_SESSION_INIT_FAILED", "ACP session key is required.");
		await this.evictIdleRuntimeHandles({ cfg: params.cfg });
		return await this.withSessionActor(sessionKey, async () => {
			const nextOptions = mergeRuntimeOptions({
				current: resolveRuntimeOptionsFromMeta(requireReadySessionMeta(this.resolveSession({
					cfg: params.cfg,
					sessionKey
				}))),
				patch: validatedPatch
			});
			await this.persistRuntimeOptions({
				cfg: params.cfg,
				sessionKey,
				options: nextOptions
			});
			return nextOptions;
		});
	}
	async resetSessionRuntimeOptions(params) {
		const sessionKey = canonicalizeAcpSessionKey(params);
		if (!sessionKey) throw new AcpRuntimeError("ACP_SESSION_INIT_FAILED", "ACP session key is required.");
		await this.evictIdleRuntimeHandles({ cfg: params.cfg });
		return await this.withSessionActor(sessionKey, async () => {
			const resolvedMeta = requireReadySessionMeta(this.resolveSession({
				cfg: params.cfg,
				sessionKey
			}));
			const { runtime, handle } = await this.ensureRuntimeHandle({
				cfg: params.cfg,
				sessionKey,
				meta: resolvedMeta
			});
			await withAcpRuntimeErrorBoundary({
				run: async () => await runtime.close({
					handle,
					reason: "reset-runtime-options"
				}),
				fallbackCode: "ACP_TURN_FAILED",
				fallbackMessage: "Could not reset ACP runtime options."
			});
			this.clearCachedRuntimeState(sessionKey);
			await this.persistRuntimeOptions({
				cfg: params.cfg,
				sessionKey,
				options: {}
			});
			return {};
		});
	}
	async runTurn(input) {
		const sessionKey = canonicalizeAcpSessionKey({
			cfg: input.cfg,
			sessionKey: input.sessionKey
		});
		if (!sessionKey) throw new AcpRuntimeError("ACP_SESSION_INIT_FAILED", "ACP session key is required.");
		await this.evictIdleRuntimeHandles({ cfg: input.cfg });
		await this.withSessionActor(sessionKey, async () => {
			const turnStartedAt = Date.now();
			const actorKey = normalizeActorKey(sessionKey);
			for (let attempt = 0; attempt < 2; attempt += 1) {
				const resolvedMeta = requireReadySessionMeta(this.resolveSession({
					cfg: input.cfg,
					sessionKey
				}));
				let runtime;
				let handle;
				let meta;
				let activeTurn;
				let internalAbortController;
				let onCallerAbort;
				let activeTurnStarted = false;
				let sawTurnOutput = false;
				let retryFreshHandle = false;
				let skipPostTurnCleanup = false;
				try {
					const ensured = await this.ensureRuntimeHandle({
						cfg: input.cfg,
						sessionKey,
						meta: resolvedMeta
					});
					runtime = ensured.runtime;
					handle = ensured.handle;
					meta = ensured.meta;
					await this.applyRuntimeControls({
						sessionKey,
						runtime,
						handle,
						meta
					});
					await this.setSessionState({
						cfg: input.cfg,
						sessionKey,
						state: "running",
						clearLastError: true
					});
					internalAbortController = new AbortController();
					onCallerAbort = () => {
						internalAbortController?.abort();
					};
					if (input.signal?.aborted) internalAbortController.abort();
					else if (input.signal) input.signal.addEventListener("abort", onCallerAbort, { once: true });
					activeTurn = {
						runtime,
						handle,
						abortController: internalAbortController
					};
					this.activeTurnBySession.set(actorKey, activeTurn);
					activeTurnStarted = true;
					let streamError = null;
					const combinedSignal = input.signal && typeof AbortSignal.any === "function" ? AbortSignal.any([input.signal, internalAbortController.signal]) : internalAbortController.signal;
					const eventGate = { open: true };
					const turnPromise = (async () => {
						for await (const event of runtime.runTurn({
							handle,
							text: input.text,
							attachments: input.attachments,
							mode: input.mode,
							requestId: input.requestId,
							signal: combinedSignal
						})) {
							if (!eventGate.open) continue;
							if (event.type === "error") streamError = new AcpRuntimeError(normalizeAcpErrorCode(event.code), event.message?.trim() || "ACP turn failed before completion.");
							else if (event.type === "text_delta" || event.type === "tool_call") sawTurnOutput = true;
							if (input.onEvent) await input.onEvent(event);
						}
						if (eventGate.open && streamError) throw streamError;
					})();
					const turnTimeoutMs = this.resolveTurnTimeoutMs({
						cfg: input.cfg,
						meta
					});
					const sessionMode = meta.mode;
					await this.awaitTurnWithTimeout({
						sessionKey,
						turnPromise,
						timeoutMs: turnTimeoutMs + ACP_TURN_TIMEOUT_GRACE_MS,
						timeoutLabelMs: turnTimeoutMs,
						onTimeout: async () => {
							eventGate.open = false;
							skipPostTurnCleanup = true;
							if (!activeTurn) return;
							await this.cleanupTimedOutTurn({
								sessionKey,
								activeTurn,
								mode: sessionMode
							});
						}
					});
					if (streamError) throw streamError;
					this.recordTurnCompletion({ startedAt: turnStartedAt });
					await this.setSessionState({
						cfg: input.cfg,
						sessionKey,
						state: "idle",
						clearLastError: true
					});
					return;
				} catch (error) {
					const acpError = toAcpRuntimeError({
						error,
						fallbackCode: activeTurnStarted ? "ACP_TURN_FAILED" : "ACP_SESSION_INIT_FAILED",
						fallbackMessage: activeTurnStarted ? "ACP turn failed before completion." : "Could not initialize ACP session runtime."
					});
					retryFreshHandle = this.shouldRetryTurnWithFreshHandle({
						attempt,
						sessionKey,
						error: acpError,
						sawTurnOutput
					});
					if (retryFreshHandle) continue;
					this.recordTurnCompletion({
						startedAt: turnStartedAt,
						errorCode: acpError.code
					});
					await this.setSessionState({
						cfg: input.cfg,
						sessionKey,
						state: "error",
						lastError: acpError.message
					});
					throw acpError;
				} finally {
					if (input.signal && onCallerAbort) input.signal.removeEventListener("abort", onCallerAbort);
					if (activeTurn && this.activeTurnBySession.get(actorKey) === activeTurn) this.activeTurnBySession.delete(actorKey);
					if (!retryFreshHandle && !skipPostTurnCleanup && runtime && handle && meta && meta.mode !== "oneshot") ({handle} = await this.reconcileRuntimeSessionIdentifiers({
						cfg: input.cfg,
						sessionKey,
						runtime,
						handle,
						meta,
						failOnStatusError: false
					}));
					if (!retryFreshHandle && !skipPostTurnCleanup && runtime && handle && meta && meta.mode === "oneshot") try {
						await runtime.close({
							handle,
							reason: "oneshot-complete"
						});
					} catch (error) {
						logVerbose(`acp-manager: ACP oneshot close failed for ${sessionKey}: ${String(error)}`);
					} finally {
						this.clearCachedRuntimeState(sessionKey);
					}
				}
				if (retryFreshHandle) continue;
			}
		}, input.signal);
	}
	resolveTurnTimeoutMs(params) {
		const runtimeTimeoutSeconds = resolveRuntimeOptionsFromMeta(params.meta).timeoutSeconds;
		if (typeof runtimeTimeoutSeconds === "number" && Number.isFinite(runtimeTimeoutSeconds) && runtimeTimeoutSeconds > 0) return Math.max(1e3, Math.round(runtimeTimeoutSeconds * 1e3));
		return resolveAgentTimeoutMs({
			cfg: params.cfg,
			minMs: 1e3
		});
	}
	async awaitTurnWithTimeout(params) {
		const observedTurnPromise = params.turnPromise.then((value) => ({
			kind: "value",
			value
		}), (error) => ({
			kind: "error",
			error
		}));
		if (params.timeoutMs <= 0) {
			const outcome = await observedTurnPromise;
			if (outcome.kind === "error") throw outcome.error;
			return outcome.value;
		}
		const timeoutToken = Symbol("acp-turn-timeout");
		let timer;
		const timeoutPromise = new Promise((resolve) => {
			timer = setTimeout(() => resolve(timeoutToken), params.timeoutMs);
			timer.unref?.();
		});
		try {
			const outcome = await Promise.race([observedTurnPromise, timeoutPromise]);
			if (outcome === timeoutToken) {
				observedTurnPromise.then((lateOutcome) => {
					if (lateOutcome.kind === "error") logVerbose(`acp-manager: detached late turn error after timeout for ${params.sessionKey}: ${String(lateOutcome.error)}`);
				});
				await params.onTimeout();
				throw new AcpRuntimeError("ACP_TURN_FAILED", `ACP turn timed out after ${Math.max(1, Math.round(params.timeoutLabelMs / 1e3))}s.`);
			}
			if (outcome.kind === "error") throw outcome.error;
			return outcome.value;
		} finally {
			if (timer) clearTimeout(timer);
		}
	}
	async cleanupTimedOutTurn(params) {
		params.activeTurn.abortController.abort();
		if (!params.activeTurn.cancelPromise) params.activeTurn.cancelPromise = params.activeTurn.runtime.cancel({
			handle: params.activeTurn.handle,
			reason: ACP_TURN_TIMEOUT_REASON
		});
		const cancelFinished = await this.awaitCleanupWithGrace({
			sessionKey: params.sessionKey,
			label: "cancel",
			promise: params.activeTurn.cancelPromise
		});
		if (params.mode !== "oneshot") return;
		const closePromise = params.activeTurn.runtime.close({
			handle: params.activeTurn.handle,
			reason: ACP_TURN_TIMEOUT_REASON
		});
		const closeFinished = await this.awaitCleanupWithGrace({
			sessionKey: params.sessionKey,
			label: "close",
			promise: closePromise
		});
		if (cancelFinished && closeFinished) {
			this.clearCachedRuntimeStateIfHandleMatches({
				sessionKey: params.sessionKey,
				handle: params.activeTurn.handle
			});
			return;
		}
		Promise.allSettled([params.activeTurn.cancelPromise, closePromise]).then(() => {
			this.clearCachedRuntimeStateIfHandleMatches({
				sessionKey: params.sessionKey,
				handle: params.activeTurn.handle
			});
		});
	}
	async awaitCleanupWithGrace(params) {
		const observedCleanupPromise = params.promise.then(() => ({ kind: "done" }), (error) => ({
			kind: "error",
			error
		}));
		const timeoutToken = Symbol(`acp-timeout-${params.label}`);
		let timer;
		const timeoutPromise = new Promise((resolve) => {
			timer = setTimeout(() => resolve(timeoutToken), ACP_TURN_TIMEOUT_CLEANUP_GRACE_MS);
			timer.unref?.();
		});
		try {
			const outcome = await Promise.race([observedCleanupPromise, timeoutPromise]);
			if (outcome === timeoutToken) {
				observedCleanupPromise.then((lateOutcome) => {
					if (lateOutcome.kind === "error") logVerbose(`acp-manager: detached timed-out turn ${params.label} cleanup failed for ${params.sessionKey}: ${String(lateOutcome.error)}`);
				});
				logVerbose(`acp-manager: timed-out turn ${params.label} cleanup exceeded ${ACP_TURN_TIMEOUT_CLEANUP_GRACE_MS}ms for ${params.sessionKey}`);
				return false;
			}
			if (outcome.kind === "error") logVerbose(`acp-manager: timed-out turn ${params.label} cleanup failed for ${params.sessionKey}: ${String(outcome.error)}`);
			return true;
		} finally {
			if (timer) clearTimeout(timer);
		}
	}
	async cancelSession(params) {
		const sessionKey = canonicalizeAcpSessionKey(params);
		if (!sessionKey) throw new AcpRuntimeError("ACP_SESSION_INIT_FAILED", "ACP session key is required.");
		await this.evictIdleRuntimeHandles({ cfg: params.cfg });
		const actorKey = normalizeActorKey(sessionKey);
		const activeTurn = this.activeTurnBySession.get(actorKey);
		if (activeTurn) {
			activeTurn.abortController.abort();
			if (!activeTurn.cancelPromise) activeTurn.cancelPromise = activeTurn.runtime.cancel({
				handle: activeTurn.handle,
				reason: params.reason
			});
			await withAcpRuntimeErrorBoundary({
				run: async () => await activeTurn.cancelPromise,
				fallbackCode: "ACP_TURN_FAILED",
				fallbackMessage: "ACP cancel failed before completion."
			});
			return;
		}
		await this.withSessionActor(sessionKey, async () => {
			const resolvedMeta = requireReadySessionMeta(this.resolveSession({
				cfg: params.cfg,
				sessionKey
			}));
			const { runtime, handle } = await this.ensureRuntimeHandle({
				cfg: params.cfg,
				sessionKey,
				meta: resolvedMeta
			});
			try {
				await withAcpRuntimeErrorBoundary({
					run: async () => await runtime.cancel({
						handle,
						reason: params.reason
					}),
					fallbackCode: "ACP_TURN_FAILED",
					fallbackMessage: "ACP cancel failed before completion."
				});
				await this.setSessionState({
					cfg: params.cfg,
					sessionKey,
					state: "idle",
					clearLastError: true
				});
			} catch (error) {
				const acpError = toAcpRuntimeError({
					error,
					fallbackCode: "ACP_TURN_FAILED",
					fallbackMessage: "ACP cancel failed before completion."
				});
				await this.setSessionState({
					cfg: params.cfg,
					sessionKey,
					state: "error",
					lastError: acpError.message
				});
				throw acpError;
			}
		});
	}
	async closeSession(input) {
		const sessionKey = canonicalizeAcpSessionKey({
			cfg: input.cfg,
			sessionKey: input.sessionKey
		});
		if (!sessionKey) throw new AcpRuntimeError("ACP_SESSION_INIT_FAILED", "ACP session key is required.");
		await this.evictIdleRuntimeHandles({ cfg: input.cfg });
		return await this.withSessionActor(sessionKey, async () => {
			const resolution = this.resolveSession({
				cfg: input.cfg,
				sessionKey
			});
			const resolutionError = resolveAcpSessionResolutionError(resolution);
			if (resolutionError) {
				if (input.requireAcpSession ?? true) throw resolutionError;
				return {
					runtimeClosed: false,
					metaCleared: false
				};
			}
			const meta = requireReadySessionMeta(resolution);
			let runtimeClosed = false;
			let runtimeNotice;
			try {
				const { runtime, handle } = await this.ensureRuntimeHandle({
					cfg: input.cfg,
					sessionKey,
					meta
				});
				await withAcpRuntimeErrorBoundary({
					run: async () => await runtime.close({
						handle,
						reason: input.reason
					}),
					fallbackCode: "ACP_TURN_FAILED",
					fallbackMessage: "ACP close failed before completion."
				});
				runtimeClosed = true;
				this.clearCachedRuntimeState(sessionKey);
			} catch (error) {
				const acpError = toAcpRuntimeError({
					error,
					fallbackCode: "ACP_TURN_FAILED",
					fallbackMessage: "ACP close failed before completion."
				});
				if (input.allowBackendUnavailable && (acpError.code === "ACP_BACKEND_MISSING" || acpError.code === "ACP_BACKEND_UNAVAILABLE" || this.isRecoverableAcpxExitError(acpError.message))) {
					this.clearCachedRuntimeState(sessionKey);
					runtimeNotice = acpError.message;
				} else throw acpError;
			}
			let metaCleared = false;
			if (input.clearMeta) {
				await this.writeSessionMeta({
					cfg: input.cfg,
					sessionKey,
					mutate: (_current, entry) => {
						if (!entry) return null;
						return null;
					},
					failOnError: true
				});
				metaCleared = true;
			}
			return {
				runtimeClosed,
				runtimeNotice,
				metaCleared
			};
		});
	}
	async ensureRuntimeHandle(params) {
		const agent = params.meta.agent?.trim() || resolveAcpAgentFromSessionKey(params.sessionKey, "main");
		const mode = params.meta.mode;
		const runtimeOptions = resolveRuntimeOptionsFromMeta(params.meta);
		const cwd = runtimeOptions.cwd ?? normalizeText(params.meta.cwd);
		const configuredBackend = (params.meta.backend || params.cfg.acp?.backend || "").trim();
		const cached = this.getCachedRuntimeState(params.sessionKey);
		if (cached) {
			const backendMatches = !configuredBackend || cached.backend === configuredBackend;
			const agentMatches = cached.agent === agent;
			const modeMatches = cached.mode === mode;
			const cwdMatches = (cached.cwd ?? "") === (cwd ?? "");
			if (backendMatches && agentMatches && modeMatches && cwdMatches && await this.isCachedRuntimeHandleReusable({
				sessionKey: params.sessionKey,
				runtime: cached.runtime,
				handle: cached.handle
			})) return {
				runtime: cached.runtime,
				handle: cached.handle,
				meta: params.meta
			};
			this.clearCachedRuntimeState(params.sessionKey);
		}
		this.enforceConcurrentSessionLimit({
			cfg: params.cfg,
			sessionKey: params.sessionKey
		});
		const backend = this.deps.requireRuntimeBackend(configuredBackend || void 0);
		const runtime = backend.runtime;
		const previousMeta = params.meta;
		const previousIdentity = resolveSessionIdentityFromMeta(previousMeta);
		const persistedResumeSessionId = mode === "persistent" ? resolveRuntimeResumeSessionId(previousIdentity) : void 0;
		const ensureSession = async (resumeSessionId) => await withAcpRuntimeErrorBoundary({
			run: async () => await runtime.ensureSession({
				sessionKey: params.sessionKey,
				agent,
				mode,
				...resumeSessionId ? { resumeSessionId } : {},
				cwd
			}),
			fallbackCode: "ACP_SESSION_INIT_FAILED",
			fallbackMessage: "Could not initialize ACP session runtime."
		});
		let ensured;
		if (persistedResumeSessionId) try {
			ensured = await ensureSession(persistedResumeSessionId);
		} catch (error) {
			const acpError = toAcpRuntimeError({
				error,
				fallbackCode: "ACP_SESSION_INIT_FAILED",
				fallbackMessage: "Could not initialize ACP session runtime."
			});
			if (acpError.code !== "ACP_SESSION_INIT_FAILED") throw acpError;
			logVerbose(`acp-manager: resume init failed for ${params.sessionKey}; retrying without persisted ACP session id: ${acpError.message}`);
			ensured = await ensureSession();
		}
		else ensured = await ensureSession();
		const now = Date.now();
		const effectiveCwd = normalizeText(ensured.cwd) ?? cwd;
		const nextRuntimeOptions = normalizeRuntimeOptions({
			...runtimeOptions,
			...effectiveCwd ? { cwd: effectiveCwd } : {}
		});
		const nextIdentity = mergeSessionIdentity({
			current: previousIdentity,
			incoming: createIdentityFromEnsure({
				handle: ensured,
				now
			}),
			now
		}) ?? previousIdentity;
		const nextHandleIdentifiers = resolveRuntimeHandleIdentifiersFromIdentity(nextIdentity);
		const nextHandle = {
			...ensured,
			...nextHandleIdentifiers.backendSessionId ? { backendSessionId: nextHandleIdentifiers.backendSessionId } : {},
			...nextHandleIdentifiers.agentSessionId ? { agentSessionId: nextHandleIdentifiers.agentSessionId } : {}
		};
		const nextMeta = {
			backend: ensured.backend || backend.id,
			agent,
			runtimeSessionName: ensured.runtimeSessionName,
			...nextIdentity ? { identity: nextIdentity } : {},
			mode: params.meta.mode,
			...Object.keys(nextRuntimeOptions).length > 0 ? { runtimeOptions: nextRuntimeOptions } : {},
			...effectiveCwd ? { cwd: effectiveCwd } : {},
			state: previousMeta.state,
			lastActivityAt: now,
			...previousMeta.lastError ? { lastError: previousMeta.lastError } : {}
		};
		if (previousMeta.backend !== nextMeta.backend || previousMeta.runtimeSessionName !== nextMeta.runtimeSessionName || !identityEquals(previousIdentity, nextIdentity) || previousMeta.agent !== nextMeta.agent || previousMeta.cwd !== nextMeta.cwd || !runtimeOptionsEqual(previousMeta.runtimeOptions, nextMeta.runtimeOptions) || hasLegacyAcpIdentityProjection(previousMeta)) await this.writeSessionMeta({
			cfg: params.cfg,
			sessionKey: params.sessionKey,
			mutate: (_current, entry) => {
				if (!entry) return null;
				return nextMeta;
			}
		});
		this.setCachedRuntimeState(params.sessionKey, {
			runtime,
			handle: nextHandle,
			backend: ensured.backend || backend.id,
			agent,
			mode,
			cwd: effectiveCwd,
			appliedControlSignature: void 0
		});
		return {
			runtime,
			handle: nextHandle,
			meta: nextMeta
		};
	}
	async isCachedRuntimeHandleReusable(params) {
		if (!params.runtime.getStatus) return true;
		try {
			const status = await params.runtime.getStatus({ handle: params.handle });
			if (this.isRuntimeStatusUnavailable(status)) {
				this.clearCachedRuntimeState(params.sessionKey);
				logVerbose(`acp-manager: evicting cached runtime handle for ${params.sessionKey} after unhealthy status probe: ${status.summary ?? "status unavailable"}`);
				return false;
			}
			return true;
		} catch (error) {
			this.clearCachedRuntimeState(params.sessionKey);
			logVerbose(`acp-manager: evicting cached runtime handle for ${params.sessionKey} after status probe failed: ${String(error)}`);
			return false;
		}
	}
	isRuntimeStatusUnavailable(status) {
		if (!status) return false;
		const detailsStatus = typeof status.details?.status === "string" ? status.details.status.trim().toLowerCase() : "";
		if (detailsStatus === "dead" || detailsStatus === "no-session") return true;
		const summaryStatus = (status.summary?.match(/\bstatus=([^\s]+)/i))?.[1]?.trim().toLowerCase() ?? "";
		return summaryStatus === "dead" || summaryStatus === "no-session";
	}
	async persistRuntimeOptions(params) {
		const normalized = normalizeRuntimeOptions(params.options);
		const hasOptions = Object.keys(normalized).length > 0;
		await this.writeSessionMeta({
			cfg: params.cfg,
			sessionKey: params.sessionKey,
			mutate: (current, entry) => {
				if (!entry) return null;
				const base = current ?? entry.acp;
				if (!base) return null;
				return {
					backend: base.backend,
					agent: base.agent,
					runtimeSessionName: base.runtimeSessionName,
					...base.identity ? { identity: base.identity } : {},
					mode: base.mode,
					runtimeOptions: hasOptions ? normalized : void 0,
					cwd: normalized.cwd,
					state: base.state,
					lastActivityAt: Date.now(),
					...base.lastError ? { lastError: base.lastError } : {}
				};
			},
			failOnError: true
		});
		const cached = this.getCachedRuntimeState(params.sessionKey);
		if (!cached) return;
		if ((cached.cwd ?? "") !== (normalized.cwd ?? "")) {
			this.clearCachedRuntimeState(params.sessionKey);
			return;
		}
		cached.appliedControlSignature = void 0;
	}
	enforceConcurrentSessionLimit(params) {
		const configuredLimit = params.cfg.acp?.maxConcurrentSessions;
		if (typeof configuredLimit !== "number" || !Number.isFinite(configuredLimit)) return;
		const limit = Math.max(1, Math.floor(configuredLimit));
		const actorKey = normalizeActorKey(params.sessionKey);
		if (this.runtimeCache.has(actorKey)) return;
		const activeCount = this.runtimeCache.size();
		if (activeCount >= limit) throw new AcpRuntimeError("ACP_SESSION_INIT_FAILED", `ACP max concurrent sessions reached (${activeCount}/${limit}).`);
	}
	recordTurnCompletion(params) {
		const durationMs = Math.max(0, Date.now() - params.startedAt);
		this.turnLatencyStats.totalMs += durationMs;
		this.turnLatencyStats.maxMs = Math.max(this.turnLatencyStats.maxMs, durationMs);
		if (params.errorCode) {
			this.turnLatencyStats.failed += 1;
			this.recordErrorCode(params.errorCode);
			return;
		}
		this.turnLatencyStats.completed += 1;
	}
	recordErrorCode(code) {
		const normalized = normalizeAcpErrorCode(code);
		this.errorCountsByCode.set(normalized, (this.errorCountsByCode.get(normalized) ?? 0) + 1);
	}
	shouldRetryTurnWithFreshHandle(params) {
		if (params.attempt > 0 || params.sawTurnOutput) return false;
		if (!this.isRecoverableAcpxExitError(params.error.message)) return false;
		this.clearCachedRuntimeState(params.sessionKey);
		logVerbose(`acp-manager: retrying ${params.sessionKey} with a fresh runtime handle after early turn failure: ${params.error.message}`);
		return true;
	}
	isRecoverableAcpxExitError(message) {
		return /^acpx exited with code \d+/i.test(message.trim());
	}
	async evictIdleRuntimeHandles(params) {
		const idleTtlMs = resolveRuntimeIdleTtlMs(params.cfg);
		if (idleTtlMs <= 0 || this.runtimeCache.size() === 0) return;
		const now = Date.now();
		const candidates = this.runtimeCache.collectIdleCandidates({
			maxIdleMs: idleTtlMs,
			now
		});
		if (candidates.length === 0) return;
		for (const candidate of candidates) await this.actorQueue.run(candidate.actorKey, async () => {
			if (this.activeTurnBySession.has(candidate.actorKey)) return;
			const lastTouchedAt = this.runtimeCache.getLastTouchedAt(candidate.actorKey);
			if (lastTouchedAt == null || now - lastTouchedAt < idleTtlMs) return;
			const cached = this.runtimeCache.peek(candidate.actorKey);
			if (!cached) return;
			this.runtimeCache.clear(candidate.actorKey);
			this.evictedRuntimeCount += 1;
			this.lastEvictedAt = Date.now();
			try {
				await cached.runtime.close({
					handle: cached.handle,
					reason: "idle-evicted"
				});
			} catch (error) {
				logVerbose(`acp-manager: idle eviction close failed for ${candidate.state.handle.sessionKey}: ${String(error)}`);
			}
		});
	}
	async resolveRuntimeCapabilities(params) {
		return await resolveManagerRuntimeCapabilities(params);
	}
	async applyRuntimeControls(params) {
		await applyManagerRuntimeControls({
			...params,
			getCachedRuntimeState: (sessionKey) => this.getCachedRuntimeState(sessionKey)
		});
	}
	async setSessionState(params) {
		await this.writeSessionMeta({
			cfg: params.cfg,
			sessionKey: params.sessionKey,
			mutate: (current, entry) => {
				if (!entry) return null;
				const base = current ?? entry.acp;
				if (!base) return null;
				const next = {
					backend: base.backend,
					agent: base.agent,
					runtimeSessionName: base.runtimeSessionName,
					...base.identity ? { identity: base.identity } : {},
					mode: base.mode,
					...base.runtimeOptions ? { runtimeOptions: base.runtimeOptions } : {},
					...base.cwd ? { cwd: base.cwd } : {},
					state: params.state,
					lastActivityAt: Date.now(),
					...base.lastError ? { lastError: base.lastError } : {}
				};
				if (params.lastError?.trim()) next.lastError = params.lastError.trim();
				else if (params.clearLastError) delete next.lastError;
				return next;
			}
		});
	}
	async reconcileRuntimeSessionIdentifiers(params) {
		return await reconcileManagerRuntimeSessionIdentifiers({
			...params,
			setCachedHandle: (sessionKey, handle) => {
				const cached = this.getCachedRuntimeState(sessionKey);
				if (cached) cached.handle = handle;
			},
			writeSessionMeta: async (writeParams) => await this.writeSessionMeta(writeParams)
		});
	}
	async writeSessionMeta(params) {
		try {
			return await this.deps.upsertSessionMeta({
				cfg: params.cfg,
				sessionKey: params.sessionKey,
				mutate: params.mutate
			});
		} catch (error) {
			if (params.failOnError) throw error;
			logVerbose(`acp-manager: failed persisting ACP metadata for ${params.sessionKey}: ${String(error)}`);
			return null;
		}
	}
	async withSessionActor(sessionKey, op, signal) {
		const actorKey = normalizeActorKey(sessionKey);
		this.throwIfAborted(signal);
		let actorStarted = false;
		const queued = this.actorQueue.run(actorKey, async () => {
			actorStarted = true;
			this.throwIfAborted(signal);
			return await op();
		});
		if (!signal) return await queued;
		return await new Promise((resolve, reject) => {
			let settled = false;
			const cleanup = () => {
				signal.removeEventListener("abort", onAbort);
			};
			const settleValue = (value) => {
				if (settled) return;
				settled = true;
				cleanup();
				resolve(value);
			};
			const settleError = (error) => {
				if (settled) return;
				settled = true;
				cleanup();
				reject(error);
			};
			const onAbort = () => {
				if (actorStarted) return;
				try {
					this.throwIfAborted(signal);
				} catch (error) {
					settleError(error);
				}
			};
			signal.addEventListener("abort", onAbort, { once: true });
			queued.then(settleValue, settleError);
			if (signal.aborted) onAbort();
		});
	}
	throwIfAborted(signal) {
		if (!signal?.aborted) return;
		throw new AcpRuntimeError("ACP_TURN_FAILED", "ACP operation aborted.");
	}
	getCachedRuntimeState(sessionKey) {
		return this.runtimeCache.get(normalizeActorKey(sessionKey));
	}
	setCachedRuntimeState(sessionKey, state) {
		this.runtimeCache.set(normalizeActorKey(sessionKey), state);
	}
	clearCachedRuntimeState(sessionKey) {
		this.runtimeCache.clear(normalizeActorKey(sessionKey));
	}
	clearCachedRuntimeStateIfHandleMatches(params) {
		const cached = this.getCachedRuntimeState(params.sessionKey);
		if (!cached || !this.runtimeHandlesMatch(cached.handle, params.handle)) return;
		this.clearCachedRuntimeState(params.sessionKey);
	}
	runtimeHandlesMatch(a, b) {
		return a.sessionKey === b.sessionKey && a.backend === b.backend && a.runtimeSessionName === b.runtimeSessionName && (a.cwd ?? "") === (b.cwd ?? "") && (a.acpxRecordId ?? "") === (b.acpxRecordId ?? "") && (a.backendSessionId ?? "") === (b.backendSessionId ?? "") && (a.agentSessionId ?? "") === (b.agentSessionId ?? "");
	}
};
//#endregion
//#region src/acp/control-plane/manager.ts
let ACP_SESSION_MANAGER_SINGLETON = null;
function getAcpSessionManager() {
	if (!ACP_SESSION_MANAGER_SINGLETON) ACP_SESSION_MANAGER_SINGLETON = new AcpSessionManager();
	return ACP_SESSION_MANAGER_SINGLETON;
}
//#endregion
export { resolveSessionIdentityFromMeta as _, registerAcpRuntimeBackend as a, toAcpRuntimeError as b, parseRuntimeTimeoutSecondsInput as c, validateRuntimeModeInput as d, validateRuntimeModelInput as f, isSessionIdentityPending as g, resolveAcpSessionResolutionError as h, getAcpRuntimeBackend as i, validateRuntimeConfigOptionInput as l, resolveAcpAgentFromSessionKey as m, readAcpSessionEntry as n, requireAcpRuntimeBackend as o, validateRuntimePermissionProfileInput as p, resolveSessionStorePathForAcp as r, unregisterAcpRuntimeBackend as s, getAcpSessionManager as t, validateRuntimeCwdInput as u, AcpRuntimeError as v, resolveAgentTimeoutMs as x, isAcpRuntimeError as y };
