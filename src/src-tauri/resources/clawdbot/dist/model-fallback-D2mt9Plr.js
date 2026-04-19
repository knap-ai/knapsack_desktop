import { r as redactSensitiveText, t as getDefaultRedactPatterns } from "./redact-D4nea1HF.js";
import { i as formatErrorMessage } from "./errors-D8p6rxH8.js";
import { s as normalizeOptionalString } from "./string-coerce-BUSzWgUA.js";
import { x as readLoggingConfig } from "./logger-D8OnBgBc.js";
import { t as sanitizeForLog } from "./ansi-Bs_ZZlnS.js";
import { t as createSubsystemLogger } from "./subsystem-Cgmckbux.js";
import { n as DEFAULT_MODEL, r as DEFAULT_PROVIDER } from "./defaults-CiQa3xnX.js";
import { n as resolveAgentModelPrimaryValue, t as resolveAgentModelFallbackValues } from "./model-input-DFbXtnkw.js";
import { t as hasAnyAuthProfileStoreSource } from "./source-check-D7Bxh6-e.js";
import { c as resolveConfiguredModelRef, f as modelKey, i as buildModelAliasIndex, p as normalizeModelRef, r as buildConfiguredAllowlistKeys, u as resolveModelRefFromString } from "./model-selection-cli-_3Gn8Wcd.js";
import "./pi-embedded-helpers-6UMMUO8y.js";
import { i as parseApiErrorInfo } from "./assistant-error-format-tQ4SCN8S.js";
import { d as stableStringify, o as getApiErrorPayloadFingerprint } from "./sanitize-user-facing-text-CQF1CTnZ.js";
import { p as isLikelyContextOverflowError, r as classifyProviderRuntimeFailureKind } from "./errors-CJULmF31.js";
import { a as isTimeoutError, i as isFailoverError, n as coerceToFailoverError, r as describeFailoverError, t as FailoverError } from "./failover-error-CqpA2cGv.js";
import { t as redactIdentifier } from "./redact-identifier-Bi5PTLUH.js";
//#region src/agents/pi-embedded-error-observation.ts
const MAX_OBSERVATION_INPUT_CHARS = 64e3;
const MAX_FINGERPRINT_MESSAGE_CHARS = 8e3;
const RAW_ERROR_PREVIEW_MAX_CHARS = 400;
const PROVIDER_ERROR_PREVIEW_MAX_CHARS = 200;
const REQUEST_ID_RE = /\brequest[_ ]?id\b\s*[:=]\s*["'()]*([A-Za-z0-9._:-]+)/i;
const OBSERVATION_EXTRA_REDACT_PATTERNS = [
	String.raw`\b(?:x-)?api[-_]?key\b\s*[:=]\s*(["']?)([^\s"'\\;]+)\1`,
	String.raw`"(?:api[-_]?key|api_key)"\s*:\s*"([^"]+)"`,
	String.raw`(?:\bCookie\b\s*[:=]\s*[^;=\s]+=|;\s*[^;=\s]+=)([^;\s\r\n]+)`
];
function resolveConfiguredRedactPatterns() {
	const configured = readLoggingConfig()?.redactPatterns;
	if (!Array.isArray(configured)) return [];
	return configured.filter((pattern) => typeof pattern === "string");
}
function truncateForObservation(text, maxChars) {
	const trimmed = text?.trim();
	if (!trimmed) return;
	return trimmed.length > maxChars ? `${trimmed.slice(0, maxChars)}…` : trimmed;
}
function boundObservationInput(text) {
	const trimmed = text?.trim();
	if (!trimmed) return;
	return trimmed.length > MAX_OBSERVATION_INPUT_CHARS ? trimmed.slice(0, MAX_OBSERVATION_INPUT_CHARS) : trimmed;
}
function replaceRequestIdPreview(text, requestId) {
	if (!text || !requestId) return text;
	return text.split(requestId).join(redactIdentifier(requestId, { len: 12 }));
}
function redactObservationText(text) {
	if (!text) return text;
	const configuredPatterns = resolveConfiguredRedactPatterns();
	return redactSensitiveText(text, {
		mode: "tools",
		patterns: [
			...getDefaultRedactPatterns(),
			...configuredPatterns,
			...OBSERVATION_EXTRA_REDACT_PATTERNS
		]
	});
}
function buildObservationFingerprint(params) {
	const boundedMessage = params.message && params.message.length > MAX_FINGERPRINT_MESSAGE_CHARS ? params.message.slice(0, MAX_FINGERPRINT_MESSAGE_CHARS) : params.message;
	const structured = params.httpCode || params.type || boundedMessage ? stableStringify({
		httpCode: params.httpCode,
		type: params.type,
		message: boundedMessage
	}) : null;
	if (structured) return structured;
	if (params.requestId) return params.raw.split(params.requestId).join("<request_id>");
	return getApiErrorPayloadFingerprint(params.raw);
}
function buildApiErrorObservationFields(rawError, opts) {
	const trimmed = boundObservationInput(rawError);
	if (!trimmed) return {};
	try {
		const parsed = parseApiErrorInfo(trimmed);
		const requestId = parsed?.requestId ?? normalizeOptionalString(trimmed.match(REQUEST_ID_RE)?.[1]);
		const requestIdHash = requestId ? redactIdentifier(requestId, { len: 12 }) : void 0;
		const rawFingerprint = buildObservationFingerprint({
			raw: trimmed,
			requestId,
			httpCode: parsed?.httpCode,
			type: parsed?.type,
			message: parsed?.message
		});
		const redactedRawPreview = replaceRequestIdPreview(redactObservationText(trimmed), requestId);
		const redactedProviderMessage = replaceRequestIdPreview(redactObservationText(parsed?.message), requestId);
		return {
			rawErrorPreview: truncateForObservation(redactedRawPreview, RAW_ERROR_PREVIEW_MAX_CHARS),
			rawErrorHash: redactIdentifier(trimmed, { len: 12 }),
			rawErrorFingerprint: rawFingerprint ? redactIdentifier(rawFingerprint, { len: 12 }) : void 0,
			httpCode: parsed?.httpCode,
			providerRuntimeFailureKind: classifyProviderRuntimeFailureKind({
				status: parsed?.httpCode ? Number(parsed.httpCode) : void 0,
				message: trimmed,
				provider: opts?.provider
			}),
			providerErrorType: parsed?.type,
			providerErrorMessagePreview: truncateForObservation(redactedProviderMessage, PROVIDER_ERROR_PREVIEW_MAX_CHARS),
			requestIdHash
		};
	} catch {
		return {};
	}
}
function buildTextObservationFields(text, opts) {
	const observed = buildApiErrorObservationFields(text, opts);
	return {
		textPreview: observed.rawErrorPreview,
		textHash: observed.rawErrorHash,
		textFingerprint: observed.rawErrorFingerprint,
		httpCode: observed.httpCode,
		providerRuntimeFailureKind: observed.providerRuntimeFailureKind,
		providerErrorType: observed.providerErrorType,
		providerErrorMessagePreview: observed.providerErrorMessagePreview,
		requestIdHash: observed.requestIdHash
	};
}
//#endregion
//#region src/agents/failover-policy.ts
function shouldAllowCooldownProbeForReason(reason) {
	return reason === "rate_limit" || reason === "overloaded" || reason === "billing" || reason === "unknown" || reason === "timeout";
}
function shouldUseTransientCooldownProbeSlot(reason) {
	return reason === "rate_limit" || reason === "overloaded" || reason === "unknown" || reason === "timeout";
}
function shouldPreserveTransientCooldownProbeSlot(reason) {
	return reason === "model_not_found" || reason === "format" || reason === "auth" || reason === "auth_permanent" || reason === "session_expired";
}
//#endregion
//#region src/agents/live-model-switch-error.ts
var LiveSessionModelSwitchError = class extends Error {
	constructor(selection) {
		super(`Live session model switch requested: ${selection.provider}/${selection.model}`);
		this.name = "LiveSessionModelSwitchError";
		this.provider = selection.provider;
		this.model = selection.model;
		this.authProfileId = selection.authProfileId;
		this.authProfileIdSource = selection.authProfileIdSource;
	}
};
//#endregion
//#region src/agents/model-fallback-observation.ts
const decisionLog = createSubsystemLogger("model-fallback").child("decision");
function buildErrorObservationFields(error) {
	const observed = buildTextObservationFields(error);
	return {
		errorPreview: observed.textPreview,
		errorHash: observed.textHash,
		errorFingerprint: observed.textFingerprint,
		httpCode: observed.httpCode,
		providerErrorType: observed.providerErrorType,
		providerErrorMessagePreview: observed.providerErrorMessagePreview,
		requestIdHash: observed.requestIdHash
	};
}
function logModelFallbackDecision(params) {
	const nextText = params.nextCandidate ? `${sanitizeForLog(params.nextCandidate.provider)}/${sanitizeForLog(params.nextCandidate.model)}` : "none";
	const reasonText = params.reason ?? "unknown";
	const observedError = buildErrorObservationFields(params.error);
	const detailText = observedError.providerErrorMessagePreview ?? observedError.errorPreview;
	const providerErrorTypeSuffix = observedError.providerErrorType ? ` providerErrorType=${sanitizeForLog(observedError.providerErrorType)}` : "";
	const detailSuffix = detailText ? ` detail=${sanitizeForLog(detailText)}` : "";
	decisionLog.warn("model fallback decision", {
		event: "model_fallback_decision",
		tags: [
			"error_handling",
			"model_fallback",
			params.decision
		],
		runId: params.runId,
		decision: params.decision,
		requestedProvider: params.requestedProvider,
		requestedModel: params.requestedModel,
		candidateProvider: params.candidate.provider,
		candidateModel: params.candidate.model,
		attempt: params.attempt,
		total: params.total,
		reason: params.reason,
		status: params.status,
		code: params.code,
		...observedError,
		nextCandidateProvider: params.nextCandidate?.provider,
		nextCandidateModel: params.nextCandidate?.model,
		isPrimary: params.isPrimary,
		requestedModelMatched: params.requestedModelMatched,
		fallbackConfigured: params.fallbackConfigured,
		allowTransientCooldownProbe: params.allowTransientCooldownProbe,
		profileCount: params.profileCount,
		previousAttempts: params.previousAttempts?.map((attempt) => ({
			provider: attempt.provider,
			model: attempt.model,
			reason: attempt.reason,
			status: attempt.status,
			code: attempt.code,
			...buildErrorObservationFields(attempt.error)
		})),
		consoleMessage: `model fallback decision: decision=${params.decision} requested=${sanitizeForLog(params.requestedProvider)}/${sanitizeForLog(params.requestedModel)} candidate=${sanitizeForLog(params.candidate.provider)}/${sanitizeForLog(params.candidate.model)} reason=${reasonText}${providerErrorTypeSuffix} next=${nextText}${detailSuffix}`
	});
}
//#endregion
//#region src/agents/model-fallback.ts
const log = createSubsystemLogger("model-fallback");
/**
* Structured error thrown when all model fallback candidates have been
* exhausted. Carries per-attempt details so callers can build informative
* user-facing messages (e.g. "rate-limited, retry in 30 s").
*/
var FallbackSummaryError = class extends Error {
	constructor(message, attempts, soonestCooldownExpiry, cause) {
		super(message, { cause });
		this.name = "FallbackSummaryError";
		this.attempts = attempts;
		this.soonestCooldownExpiry = soonestCooldownExpiry;
	}
};
function isFallbackSummaryError(err) {
	return err instanceof FallbackSummaryError;
}
/**
* Fallback abort check. Only treats explicit AbortError names as user aborts.
* Message-based checks (e.g., "aborted") can mask timeouts and skip fallback.
*/
function isFallbackAbortError(err) {
	if (!err || typeof err !== "object") return false;
	if (isFailoverError(err)) return false;
	return ("name" in err ? String(err.name) : "") === "AbortError";
}
function shouldRethrowAbort(err) {
	return isFallbackAbortError(err) && !isTimeoutError(err);
}
function createModelCandidateCollector(allowlist) {
	const seen = /* @__PURE__ */ new Set();
	const candidates = [];
	const addCandidate = (candidate, enforceAllowlist) => {
		if (!candidate.provider || !candidate.model) return;
		const key = modelKey(candidate.provider, candidate.model);
		if (seen.has(key)) return;
		if (enforceAllowlist && allowlist && !allowlist.has(key)) return;
		seen.add(key);
		candidates.push(candidate);
	};
	const addExplicitCandidate = (candidate) => {
		addCandidate(candidate, false);
	};
	const addAllowlistedCandidate = (candidate) => {
		addCandidate(candidate, true);
	};
	return {
		candidates,
		addExplicitCandidate,
		addAllowlistedCandidate
	};
}
let modelFallbackAuthRuntimePromise;
async function loadModelFallbackAuthRuntime() {
	modelFallbackAuthRuntimePromise ??= import("./model-fallback-auth.runtime-DtVLFjAO.js");
	return await modelFallbackAuthRuntimePromise;
}
function buildFallbackSuccess(params) {
	return {
		result: params.result,
		provider: params.provider,
		model: params.model,
		attempts: params.attempts
	};
}
async function runFallbackCandidate(params) {
	try {
		return {
			ok: true,
			result: params.options ? await params.run(params.provider, params.model, params.options) : await params.run(params.provider, params.model)
		};
	} catch (err) {
		const normalizedFailover = coerceToFailoverError(err, {
			provider: params.provider,
			model: params.model
		});
		if (shouldRethrowAbort(err) && !normalizedFailover) throw err;
		return {
			ok: false,
			error: normalizedFailover ?? err
		};
	}
}
async function runFallbackAttempt(params) {
	const runResult = await runFallbackCandidate({
		run: params.run,
		provider: params.provider,
		model: params.model,
		options: params.options
	});
	if (runResult.ok) return { success: buildFallbackSuccess({
		result: runResult.result,
		provider: params.provider,
		model: params.model,
		attempts: params.attempts
	}) };
	return { error: runResult.error };
}
function sameModelCandidate(a, b) {
	return a.provider === b.provider && a.model === b.model;
}
function recordFailedCandidateAttempt(params) {
	const described = describeFailoverError(params.error);
	params.attempts.push({
		provider: params.candidate.provider,
		model: params.candidate.model,
		error: described.message,
		reason: described.reason ?? "unknown",
		status: described.status,
		code: described.code
	});
	logModelFallbackDecision({
		decision: "candidate_failed",
		runId: params.runId,
		requestedProvider: params.requestedProvider ?? params.candidate.provider,
		requestedModel: params.requestedModel ?? params.candidate.model,
		candidate: params.candidate,
		attempt: params.attempt,
		total: params.total,
		reason: described.reason,
		status: described.status,
		code: described.code,
		error: described.message,
		nextCandidate: params.nextCandidate,
		isPrimary: params.isPrimary,
		requestedModelMatched: params.requestedModelMatched,
		fallbackConfigured: params.fallbackConfigured
	});
}
function throwFallbackFailureSummary(params) {
	if (params.attempts.length <= 1 && params.lastError) throw params.lastError;
	const summary = params.attempts.length > 0 ? params.attempts.map(params.formatAttempt).join(" | ") : "unknown";
	throw new FallbackSummaryError(`All ${params.label} failed (${params.attempts.length || params.candidates.length}): ${summary}`, params.attempts, params.soonestCooldownExpiry ?? null, params.lastError instanceof Error ? params.lastError : void 0);
}
function resolveFallbackSoonestCooldownExpiry(params) {
	if (!params.authRuntime || !params.authStore) return null;
	const refreshedStore = params.authRuntime.loadAuthProfileStoreForRuntime(params.agentDir, {
		readOnly: true,
		allowKeychainPrompt: false
	});
	let soonest = null;
	for (const candidate of params.candidates) {
		const ids = params.authRuntime.resolveAuthProfileOrder({
			cfg: params.cfg,
			store: refreshedStore,
			provider: candidate.provider
		});
		const candidateSoonest = params.authRuntime.getSoonestCooldownExpiry(refreshedStore, ids, { forModel: candidate.model });
		if (typeof candidateSoonest === "number" && Number.isFinite(candidateSoonest) && (soonest === null || candidateSoonest < soonest)) soonest = candidateSoonest;
	}
	return soonest;
}
function resolveImageFallbackCandidates(params) {
	const aliasIndex = buildModelAliasIndex({
		cfg: params.cfg ?? {},
		defaultProvider: params.defaultProvider
	});
	const { candidates, addExplicitCandidate, addAllowlistedCandidate } = createModelCandidateCollector(buildConfiguredAllowlistKeys({
		cfg: params.cfg,
		defaultProvider: params.defaultProvider
	}));
	const addRaw = (raw, opts) => {
		const resolved = resolveModelRefFromString({
			raw,
			defaultProvider: params.defaultProvider,
			aliasIndex
		});
		if (!resolved) return;
		if (opts?.allowlist) {
			addAllowlistedCandidate(resolved.ref);
			return;
		}
		addExplicitCandidate(resolved.ref);
	};
	if (params.modelOverride?.trim()) addRaw(params.modelOverride);
	else {
		const primary = resolveAgentModelPrimaryValue(params.cfg?.agents?.defaults?.imageModel);
		if (primary?.trim()) addRaw(primary);
	}
	const imageFallbacks = resolveAgentModelFallbackValues(params.cfg?.agents?.defaults?.imageModel);
	for (const raw of imageFallbacks) addRaw(raw);
	return candidates;
}
function resolveFallbackCandidates(params) {
	const primary = params.cfg ? resolveConfiguredModelRef({
		cfg: params.cfg,
		defaultProvider: DEFAULT_PROVIDER,
		defaultModel: DEFAULT_MODEL
	}) : null;
	const defaultProvider = primary?.provider ?? "openai";
	const defaultModel = primary?.model ?? "gpt-5.4";
	const normalizedPrimary = normalizeModelRef(normalizeOptionalString(params.provider) || defaultProvider, normalizeOptionalString(params.model) || defaultModel);
	const configuredPrimary = normalizeModelRef(defaultProvider, defaultModel);
	const aliasIndex = buildModelAliasIndex({
		cfg: params.cfg ?? {},
		defaultProvider
	});
	const { candidates, addExplicitCandidate } = createModelCandidateCollector(buildConfiguredAllowlistKeys({
		cfg: params.cfg,
		defaultProvider
	}));
	addExplicitCandidate(normalizedPrimary);
	const modelFallbacks = (() => {
		if (params.fallbacksOverride !== void 0) return params.fallbacksOverride;
		const configuredFallbacks = resolveAgentModelFallbackValues(params.cfg?.agents?.defaults?.model);
		if (normalizedPrimary.provider !== configuredPrimary.provider) return configuredFallbacks.some((raw) => {
			const resolved = resolveModelRefFromString({
				raw,
				defaultProvider,
				aliasIndex
			});
			return resolved ? sameModelCandidate(resolved.ref, normalizedPrimary) : false;
		}) ? configuredFallbacks : [];
		return configuredFallbacks;
	})();
	for (const raw of modelFallbacks) {
		const resolved = resolveModelRefFromString({
			raw,
			defaultProvider,
			aliasIndex
		});
		if (!resolved) continue;
		addExplicitCandidate(resolved.ref);
	}
	if (params.fallbacksOverride === void 0 && primary?.provider && primary.model) addExplicitCandidate({
		provider: primary.provider,
		model: primary.model
	});
	return candidates;
}
const lastProbeAttempt = /* @__PURE__ */ new Map();
const MIN_PROBE_INTERVAL_MS = 3e4;
const PROBE_MARGIN_MS = 120 * 1e3;
const PROBE_SCOPE_DELIMITER = "::";
const PROBE_STATE_TTL_MS = 1440 * 60 * 1e3;
const MAX_PROBE_KEYS = 256;
function resolveProbeThrottleKey(provider, agentDir) {
	const scope = normalizeOptionalString(agentDir) ?? "";
	return scope ? `${scope}${PROBE_SCOPE_DELIMITER}${provider}` : provider;
}
function pruneProbeState(now) {
	for (const [key, ts] of lastProbeAttempt) if (!Number.isFinite(ts) || ts <= 0 || now - ts > PROBE_STATE_TTL_MS) lastProbeAttempt.delete(key);
}
function enforceProbeStateCap() {
	while (lastProbeAttempt.size > MAX_PROBE_KEYS) {
		let oldestKey = null;
		let oldestTs = Number.POSITIVE_INFINITY;
		for (const [key, ts] of lastProbeAttempt) if (ts < oldestTs) {
			oldestKey = key;
			oldestTs = ts;
		}
		if (!oldestKey) break;
		lastProbeAttempt.delete(oldestKey);
	}
}
function isProbeThrottleOpen(now, throttleKey) {
	pruneProbeState(now);
	return now - (lastProbeAttempt.get(throttleKey) ?? 0) >= MIN_PROBE_INTERVAL_MS;
}
function markProbeAttempt(now, throttleKey) {
	pruneProbeState(now);
	lastProbeAttempt.set(throttleKey, now);
	enforceProbeStateCap();
}
function shouldProbePrimaryDuringCooldown(params) {
	if (!params.isPrimary || !params.hasFallbackCandidates) return false;
	if (!isProbeThrottleOpen(params.now, params.throttleKey)) return false;
	const soonest = params.authRuntime.getSoonestCooldownExpiry(params.authStore, params.profileIds, {
		now: params.now,
		forModel: params.model
	});
	if (soonest === null || !Number.isFinite(soonest)) return true;
	return params.now >= soonest - PROBE_MARGIN_MS;
}
function resolveCooldownDecision(params) {
	const shouldProbe = shouldProbePrimaryDuringCooldown({
		isPrimary: params.isPrimary,
		hasFallbackCandidates: params.hasFallbackCandidates,
		now: params.now,
		throttleKey: params.probeThrottleKey,
		authRuntime: params.authRuntime,
		authStore: params.authStore,
		profileIds: params.profileIds,
		model: params.candidate.model
	});
	const inferredReason = params.authRuntime.resolveProfilesUnavailableReason({
		store: params.authStore,
		profileIds: params.profileIds,
		now: params.now
	}) ?? "unknown";
	if (inferredReason === "auth" || inferredReason === "auth_permanent") return {
		type: "skip",
		reason: inferredReason,
		error: `Provider ${params.candidate.provider} has ${inferredReason} issue (skipping all models)`
	};
	if (inferredReason === "billing") {
		const shouldProbeSingleProviderBilling = params.isPrimary && !params.hasFallbackCandidates && isProbeThrottleOpen(params.now, params.probeThrottleKey);
		if (params.isPrimary && (shouldProbe || shouldProbeSingleProviderBilling)) return {
			type: "attempt",
			reason: inferredReason,
			markProbe: true
		};
		return {
			type: "skip",
			reason: inferredReason,
			error: `Provider ${params.candidate.provider} has ${inferredReason} issue (skipping all models)`
		};
	}
	if (!(params.isPrimary && (!params.requestedModel || shouldProbe) || !params.isPrimary && shouldUseTransientCooldownProbeSlot(inferredReason))) return {
		type: "skip",
		reason: inferredReason,
		error: `Provider ${params.candidate.provider} is in cooldown (all profiles unavailable)`
	};
	return {
		type: "attempt",
		reason: inferredReason,
		markProbe: params.isPrimary && shouldProbe
	};
}
async function runWithModelFallback(params) {
	const candidates = resolveFallbackCandidates({
		cfg: params.cfg,
		provider: params.provider,
		model: params.model,
		fallbacksOverride: params.fallbacksOverride
	});
	const authRuntime = params.cfg && hasAnyAuthProfileStoreSource(params.agentDir) ? await loadModelFallbackAuthRuntime() : null;
	const authStore = authRuntime ? authRuntime.ensureAuthProfileStore(params.agentDir, { allowKeychainPrompt: false }) : null;
	const attempts = [];
	let lastError;
	const cooldownProbeUsedProviders = /* @__PURE__ */ new Set();
	const hasFallbackCandidates = candidates.length > 1;
	for (let i = 0; i < candidates.length; i += 1) {
		const candidate = candidates[i];
		const isPrimary = i === 0;
		const requestedModel = params.provider === candidate.provider && params.model === candidate.model;
		let runOptions;
		let attemptedDuringCooldown = false;
		let transientProbeProviderForAttempt = null;
		if (authRuntime && authStore) {
			const profileIds = authRuntime.resolveAuthProfileOrder({
				cfg: params.cfg,
				store: authStore,
				provider: candidate.provider
			});
			const isAnyProfileAvailable = profileIds.some((id) => !authRuntime.isProfileInCooldown(authStore, id, void 0, candidate.model));
			if (profileIds.length > 0 && !isAnyProfileAvailable) {
				const now = Date.now();
				const probeThrottleKey = resolveProbeThrottleKey(candidate.provider, params.agentDir);
				const decision = resolveCooldownDecision({
					candidate,
					isPrimary,
					requestedModel,
					hasFallbackCandidates,
					now,
					probeThrottleKey,
					authRuntime,
					authStore,
					profileIds
				});
				if (decision.type === "skip") {
					attempts.push({
						provider: candidate.provider,
						model: candidate.model,
						error: decision.error,
						reason: decision.reason
					});
					logModelFallbackDecision({
						decision: "skip_candidate",
						runId: params.runId,
						requestedProvider: params.provider,
						requestedModel: params.model,
						candidate,
						attempt: i + 1,
						total: candidates.length,
						reason: decision.reason,
						error: decision.error,
						nextCandidate: candidates[i + 1],
						isPrimary,
						requestedModelMatched: requestedModel,
						fallbackConfigured: hasFallbackCandidates,
						profileCount: profileIds.length
					});
					continue;
				}
				if (decision.markProbe) markProbeAttempt(now, probeThrottleKey);
				if (shouldAllowCooldownProbeForReason(decision.reason)) {
					const isTransientCooldownReason = shouldUseTransientCooldownProbeSlot(decision.reason);
					if (isTransientCooldownReason && cooldownProbeUsedProviders.has(candidate.provider)) {
						const error = `Provider ${candidate.provider} is in cooldown (probe already attempted this run)`;
						attempts.push({
							provider: candidate.provider,
							model: candidate.model,
							error,
							reason: decision.reason
						});
						logModelFallbackDecision({
							decision: "skip_candidate",
							runId: params.runId,
							requestedProvider: params.provider,
							requestedModel: params.model,
							candidate,
							attempt: i + 1,
							total: candidates.length,
							reason: decision.reason,
							error,
							nextCandidate: candidates[i + 1],
							isPrimary,
							requestedModelMatched: requestedModel,
							fallbackConfigured: hasFallbackCandidates,
							profileCount: profileIds.length
						});
						continue;
					}
					runOptions = { allowTransientCooldownProbe: true };
					if (isTransientCooldownReason) transientProbeProviderForAttempt = candidate.provider;
				}
				attemptedDuringCooldown = true;
				logModelFallbackDecision({
					decision: "probe_cooldown_candidate",
					runId: params.runId,
					requestedProvider: params.provider,
					requestedModel: params.model,
					candidate,
					attempt: i + 1,
					total: candidates.length,
					reason: decision.reason,
					nextCandidate: candidates[i + 1],
					isPrimary,
					requestedModelMatched: requestedModel,
					fallbackConfigured: hasFallbackCandidates,
					allowTransientCooldownProbe: runOptions?.allowTransientCooldownProbe,
					profileCount: profileIds.length
				});
			}
		}
		const attemptRun = await runFallbackAttempt({
			run: params.run,
			...candidate,
			attempts,
			options: runOptions
		});
		if ("success" in attemptRun) {
			if (i > 0 || attempts.length > 0 || attemptedDuringCooldown) logModelFallbackDecision({
				decision: "candidate_succeeded",
				runId: params.runId,
				requestedProvider: params.provider,
				requestedModel: params.model,
				candidate,
				attempt: i + 1,
				total: candidates.length,
				previousAttempts: attempts,
				isPrimary,
				requestedModelMatched: requestedModel,
				fallbackConfigured: hasFallbackCandidates
			});
			const notFoundAttempt = i > 0 ? attempts.find((a) => a.reason === "model_not_found") : void 0;
			if (notFoundAttempt) log.warn(`Model "${sanitizeForLog(notFoundAttempt.provider)}/${sanitizeForLog(notFoundAttempt.model)}" not found. Fell back to "${sanitizeForLog(candidate.provider)}/${sanitizeForLog(candidate.model)}".`);
			return attemptRun.success;
		}
		const err = attemptRun.error;
		{
			if (transientProbeProviderForAttempt) {
				const probeFailureReason = describeFailoverError(err).reason;
				if (!shouldPreserveTransientCooldownProbeSlot(probeFailureReason)) cooldownProbeUsedProviders.add(transientProbeProviderForAttempt);
			}
			if (isLikelyContextOverflowError(formatErrorMessage(err))) throw err;
			const normalized = coerceToFailoverError(err, {
				provider: candidate.provider,
				model: candidate.model
			}) ?? err;
			if (err instanceof LiveSessionModelSwitchError) {
				const switchMsg = err.message;
				const switchNormalized = new FailoverError(switchMsg, {
					reason: "overloaded",
					provider: candidate.provider,
					model: candidate.model
				});
				lastError = switchNormalized;
				recordFailedCandidateAttempt({
					attempts,
					candidate,
					error: switchNormalized,
					runId: params.runId,
					requestedProvider: params.provider,
					requestedModel: params.model,
					attempt: i + 1,
					total: candidates.length,
					nextCandidate: candidates[i + 1],
					isPrimary,
					requestedModelMatched: requestedModel,
					fallbackConfigured: hasFallbackCandidates
				});
				continue;
			}
			const isKnownFailover = isFailoverError(normalized);
			if (!isKnownFailover && i === candidates.length - 1) throw err;
			lastError = isKnownFailover ? normalized : err;
			recordFailedCandidateAttempt({
				attempts,
				candidate,
				error: normalized,
				runId: params.runId,
				requestedProvider: params.provider,
				requestedModel: params.model,
				attempt: i + 1,
				total: candidates.length,
				nextCandidate: candidates[i + 1],
				isPrimary,
				requestedModelMatched: requestedModel,
				fallbackConfigured: hasFallbackCandidates
			});
			await params.onError?.({
				provider: candidate.provider,
				model: candidate.model,
				error: isKnownFailover ? normalized : err,
				attempt: i + 1,
				total: candidates.length
			});
		}
	}
	return throwFallbackFailureSummary({
		attempts,
		candidates,
		lastError,
		label: "models",
		formatAttempt: (attempt) => `${attempt.provider}/${attempt.model}: ${attempt.error}${attempt.reason ? ` (${attempt.reason})` : ""}`,
		soonestCooldownExpiry: resolveFallbackSoonestCooldownExpiry({
			authRuntime,
			authStore,
			agentDir: params.agentDir,
			cfg: params.cfg,
			candidates
		})
	});
}
async function runWithImageModelFallback(params) {
	const candidates = resolveImageFallbackCandidates({
		cfg: params.cfg,
		defaultProvider: DEFAULT_PROVIDER,
		modelOverride: params.modelOverride
	});
	if (candidates.length === 0) throw new Error("No image model configured. Set agents.defaults.imageModel.primary or agents.defaults.imageModel.fallbacks.");
	const attempts = [];
	let lastError;
	for (let i = 0; i < candidates.length; i += 1) {
		const candidate = candidates[i];
		const attemptRun = await runFallbackAttempt({
			run: params.run,
			...candidate,
			attempts
		});
		if ("success" in attemptRun) return attemptRun.success;
		{
			const err = attemptRun.error;
			lastError = err;
			attempts.push({
				provider: candidate.provider,
				model: candidate.model,
				error: formatErrorMessage(err)
			});
			await params.onError?.({
				provider: candidate.provider,
				model: candidate.model,
				error: err,
				attempt: i + 1,
				total: candidates.length
			});
		}
	}
	return throwFallbackFailureSummary({
		attempts,
		candidates,
		lastError,
		label: "image models",
		formatAttempt: (attempt) => `${attempt.provider}/${attempt.model}: ${attempt.error}`
	});
}
//#endregion
export { shouldAllowCooldownProbeForReason as a, LiveSessionModelSwitchError as i, runWithImageModelFallback as n, buildApiErrorObservationFields as o, runWithModelFallback as r, buildTextObservationFields as s, isFallbackSummaryError as t };
