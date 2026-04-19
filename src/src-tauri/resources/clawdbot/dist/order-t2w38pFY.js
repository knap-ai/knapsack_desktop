import { t as createSubsystemLogger } from "./subsystem-Cgmckbux.js";
import { i as coerceSecretRef, l as normalizeSecretInputString } from "./types.secrets-CeL3gSMO.js";
import { n as findNormalizedProviderValue, r as normalizeProviderId } from "./provider-id-KaStHhRz.js";
import { o as resolveProviderIdForAuth } from "./provider-env-vars-Sj-BhOn9.js";
import { c as saveAuthProfileStore, l as updateAuthProfileStoreWithLock } from "./store-C1I9Mkh8.js";
import "./model-selection-CTdyYoio.js";
import { n as listProfilesForProvider, t as dedupeProfileIds } from "./profiles-CVErLX2C.js";
import { t as redactIdentifier } from "./redact-identifier-Bi5PTLUH.js";
import { t as sanitizeForConsole } from "./console-sanitize-OEKi2aRr.js";
//#region src/agents/auth-profiles/credential-state.ts
function resolveTokenExpiryState(expires, now = Date.now()) {
	if (expires === void 0) return "missing";
	if (typeof expires !== "number") return "invalid_expires";
	if (!Number.isFinite(expires) || expires <= 0) return "invalid_expires";
	return now >= expires ? "expired" : "valid";
}
function hasConfiguredSecretRef(value) {
	return coerceSecretRef(value) !== null;
}
function hasConfiguredSecretString(value) {
	return normalizeSecretInputString(value) !== void 0;
}
function evaluateStoredCredentialEligibility(params) {
	const now = params.now ?? Date.now();
	const credential = params.credential;
	if (credential.type === "api_key") {
		const hasKey = hasConfiguredSecretString(credential.key);
		const hasKeyRef = hasConfiguredSecretRef(credential.keyRef);
		if (!hasKey && !hasKeyRef) return {
			eligible: false,
			reasonCode: "missing_credential"
		};
		return {
			eligible: true,
			reasonCode: "ok"
		};
	}
	if (credential.type === "token") {
		const hasToken = hasConfiguredSecretString(credential.token);
		const hasTokenRef = hasConfiguredSecretRef(credential.tokenRef);
		if (!hasToken && !hasTokenRef) return {
			eligible: false,
			reasonCode: "missing_credential"
		};
		const expiryState = resolveTokenExpiryState(credential.expires, now);
		if (expiryState === "invalid_expires") return {
			eligible: false,
			reasonCode: "invalid_expires"
		};
		if (expiryState === "expired") return {
			eligible: false,
			reasonCode: "expired"
		};
		return {
			eligible: true,
			reasonCode: "ok"
		};
	}
	if (normalizeSecretInputString(credential.access) === void 0 && normalizeSecretInputString(credential.refresh) === void 0) return {
		eligible: false,
		reasonCode: "missing_credential"
	};
	return {
		eligible: true,
		reasonCode: "ok"
	};
}
//#endregion
//#region src/agents/auth-profiles/state-observation.ts
const observationLog = createSubsystemLogger("agent/embedded");
function logAuthProfileFailureStateChange(params) {
	const windowType = params.reason === "billing" || params.reason === "auth_permanent" ? "disabled" : "cooldown";
	const previousCooldownUntil = params.previous?.cooldownUntil;
	const previousDisabledUntil = params.previous?.disabledUntil;
	const windowReused = windowType === "disabled" ? typeof previousDisabledUntil === "number" && Number.isFinite(previousDisabledUntil) && previousDisabledUntil > params.now && previousDisabledUntil === params.next.disabledUntil : typeof previousCooldownUntil === "number" && Number.isFinite(previousCooldownUntil) && previousCooldownUntil > params.now && previousCooldownUntil === params.next.cooldownUntil;
	const safeProfileId = redactIdentifier(params.profileId, { len: 12 });
	const safeRunId = sanitizeForConsole(params.runId) ?? "-";
	const safeProvider = sanitizeForConsole(params.provider) ?? "-";
	observationLog.warn("auth profile failure state updated", {
		event: "auth_profile_failure_state_updated",
		tags: [
			"error_handling",
			"auth_profiles",
			windowType
		],
		runId: params.runId,
		profileId: safeProfileId,
		provider: params.provider,
		reason: params.reason,
		windowType,
		windowReused,
		previousErrorCount: params.previous?.errorCount,
		errorCount: params.next.errorCount,
		previousCooldownUntil,
		cooldownUntil: params.next.cooldownUntil,
		previousDisabledUntil,
		disabledUntil: params.next.disabledUntil,
		previousDisabledReason: params.previous?.disabledReason,
		disabledReason: params.next.disabledReason,
		failureCounts: params.next.failureCounts,
		consoleMessage: `auth profile failure state updated: runId=${safeRunId} profile=${safeProfileId} provider=${safeProvider} reason=${params.reason} window=${windowType} reused=${String(windowReused)}`
	});
}
//#endregion
//#region src/agents/auth-profiles/usage.ts
const authProfileUsageDeps = {
	saveAuthProfileStore,
	updateAuthProfileStoreWithLock
};
const FAILURE_REASON_PRIORITY = [
	"auth_permanent",
	"auth",
	"billing",
	"format",
	"model_not_found",
	"overloaded",
	"timeout",
	"rate_limit",
	"unknown"
];
const FAILURE_REASON_SET = new Set(FAILURE_REASON_PRIORITY);
const FAILURE_REASON_ORDER = new Map(FAILURE_REASON_PRIORITY.map((reason, index) => [reason, index]));
const WHAM_USAGE_URL = "https://chatgpt.com/backend-api/wham/usage";
const WHAM_TIMEOUT_MS = 3e3;
const WHAM_BURST_COOLDOWN_MS = 15e3;
const WHAM_PROBE_FAILURE_COOLDOWN_MS = 3e4;
const WHAM_HTTP_ERROR_COOLDOWN_MS = 300 * 1e3;
const WHAM_TOKEN_EXPIRED_COOLDOWN_MS = 720 * 60 * 1e3;
const WHAM_DEAD_ACCOUNT_COOLDOWN_MS = 1440 * 60 * 1e3;
const WHAM_TEAM_ROLLING_MAX_COOLDOWN_MS = 7200 * 1e3;
const WHAM_PERSONAL_MAX_COOLDOWN_MS = 14400 * 1e3;
const WHAM_TEAM_WEEKLY_MAX_COOLDOWN_MS = 14400 * 1e3;
function isAuthCooldownBypassedForProvider(provider) {
	const normalized = normalizeProviderId(provider ?? "");
	return normalized === "openrouter" || normalized === "kilocode";
}
function shouldProbeWhamForFailure(provider, reason) {
	return normalizeProviderId(provider ?? "") === "openai-codex" && (reason === "rate_limit" || reason === "unknown");
}
function resolveWhamResetMs(window, now) {
	if (!window) return null;
	if (typeof window.reset_after_seconds === "number" && Number.isFinite(window.reset_after_seconds) && window.reset_after_seconds > 0) return window.reset_after_seconds * 1e3;
	if (typeof window.reset_at === "number" && Number.isFinite(window.reset_at) && window.reset_at > 0) return Math.max(0, window.reset_at * 1e3 - now);
	return null;
}
function isWhamWindowExhausted(window) {
	return !!(window && typeof window.used_percent === "number" && Number.isFinite(window.used_percent) && window.used_percent >= 100);
}
function applyWhamCooldownResult(params) {
	const existingCooldownUntil = params.existing.cooldownUntil;
	const existingActiveCooldownUntil = typeof existingCooldownUntil === "number" && Number.isFinite(existingCooldownUntil) && existingCooldownUntil > params.now ? existingCooldownUntil : 0;
	return {
		...params.computed,
		cooldownUntil: Math.max(existingActiveCooldownUntil, params.now + params.whamResult.cooldownMs)
	};
}
async function probeWhamForCooldown(store, profileId) {
	const profile = store.profiles[profileId];
	if (profile?.type !== "oauth" || !profile.access) return null;
	const controller = new AbortController();
	const timeout = setTimeout(() => controller.abort(), WHAM_TIMEOUT_MS);
	try {
		const headers = {
			Authorization: `Bearer ${profile.access}`,
			Accept: "application/json",
			"User-Agent": "CodexBar"
		};
		if (profile.accountId) headers["ChatGPT-Account-Id"] = profile.accountId;
		const res = await fetch(WHAM_USAGE_URL, {
			method: "GET",
			headers,
			signal: controller.signal
		});
		if (!res.ok) {
			if (res.status === 401) return {
				cooldownMs: WHAM_TOKEN_EXPIRED_COOLDOWN_MS,
				reason: "wham_token_expired"
			};
			if (res.status === 403) return {
				cooldownMs: WHAM_DEAD_ACCOUNT_COOLDOWN_MS,
				reason: "wham_account_dead"
			};
			return {
				cooldownMs: WHAM_HTTP_ERROR_COOLDOWN_MS,
				reason: "wham_http_error"
			};
		}
		const data = await res.json();
		if (!data.rate_limit) return {
			cooldownMs: WHAM_PROBE_FAILURE_COOLDOWN_MS,
			reason: "wham_probe_failed"
		};
		if (data.rate_limit.limit_reached === false) return {
			cooldownMs: WHAM_BURST_COOLDOWN_MS,
			reason: "wham_burst_contention"
		};
		const now = Date.now();
		const primaryResetMs = resolveWhamResetMs(data.rate_limit.primary_window, now);
		const secondaryResetMs = resolveWhamResetMs(data.rate_limit.secondary_window, now);
		if (!data.rate_limit.secondary_window) {
			if (primaryResetMs === null) return {
				cooldownMs: WHAM_PROBE_FAILURE_COOLDOWN_MS,
				reason: "wham_probe_failed"
			};
			return {
				cooldownMs: Math.min(Math.floor(primaryResetMs / 2), WHAM_PERSONAL_MAX_COOLDOWN_MS),
				reason: "wham_personal_rolling"
			};
		}
		if (isWhamWindowExhausted(data.rate_limit.secondary_window)) {
			if (secondaryResetMs === null) return {
				cooldownMs: WHAM_PROBE_FAILURE_COOLDOWN_MS,
				reason: "wham_probe_failed"
			};
			return {
				cooldownMs: Math.min(Math.floor(secondaryResetMs / 2), WHAM_TEAM_WEEKLY_MAX_COOLDOWN_MS),
				reason: "wham_team_weekly"
			};
		}
		if (isWhamWindowExhausted(data.rate_limit.primary_window)) {
			if (primaryResetMs === null) return {
				cooldownMs: WHAM_PROBE_FAILURE_COOLDOWN_MS,
				reason: "wham_probe_failed"
			};
			return {
				cooldownMs: Math.min(Math.floor(primaryResetMs / 2), WHAM_TEAM_ROLLING_MAX_COOLDOWN_MS),
				reason: "wham_team_rolling"
			};
		}
		return {
			cooldownMs: WHAM_PROBE_FAILURE_COOLDOWN_MS,
			reason: "wham_probe_failed"
		};
	} catch {
		return {
			cooldownMs: WHAM_PROBE_FAILURE_COOLDOWN_MS,
			reason: "wham_probe_failed"
		};
	} finally {
		clearTimeout(timeout);
	}
}
function resolveProfileUnusableUntil(stats) {
	const values = [stats.cooldownUntil, stats.disabledUntil].filter((value) => typeof value === "number").filter((value) => Number.isFinite(value) && value > 0);
	if (values.length === 0) return null;
	return Math.max(...values);
}
/**
* Check if a profile is currently in cooldown (due to rate limits, overload, or other transient failures).
*/
function isProfileInCooldown(store, profileId, now, forModel) {
	if (isAuthCooldownBypassedForProvider(store.profiles[profileId]?.provider)) return false;
	const stats = store.usageStats?.[profileId];
	if (!stats) return false;
	const ts = now ?? Date.now();
	if (shouldBypassModelScopedCooldown(stats, ts, forModel)) return false;
	const unusableUntil = resolveProfileUnusableUntil(stats);
	return unusableUntil ? ts < unusableUntil : false;
}
function isActiveUnusableWindow(until, now) {
	return typeof until === "number" && Number.isFinite(until) && until > 0 && now < until;
}
/**
* Infer the most likely reason all candidate profiles are currently unavailable.
*
* We prefer explicit active `disabledReason` values (for example billing/auth)
* over generic cooldown buckets, then fall back to failure-count signals.
*/
function resolveProfilesUnavailableReason(params) {
	const now = params.now ?? Date.now();
	const scores = /* @__PURE__ */ new Map();
	const addScore = (reason, value) => {
		if (!FAILURE_REASON_SET.has(reason) || value <= 0 || !Number.isFinite(value)) return;
		scores.set(reason, (scores.get(reason) ?? 0) + value);
	};
	for (const profileId of params.profileIds) {
		const stats = params.store.usageStats?.[profileId];
		if (!stats) continue;
		if (isActiveUnusableWindow(stats.disabledUntil, now) && stats.disabledReason && FAILURE_REASON_SET.has(stats.disabledReason)) {
			addScore(stats.disabledReason, 1e3);
			continue;
		}
		if (!isActiveUnusableWindow(stats.cooldownUntil, now)) continue;
		let recordedReason = false;
		for (const [rawReason, rawCount] of Object.entries(stats.failureCounts ?? {})) {
			const reason = rawReason;
			const count = typeof rawCount === "number" ? rawCount : 0;
			if (!FAILURE_REASON_SET.has(reason) || count <= 0) continue;
			addScore(reason, count);
			recordedReason = true;
		}
		if (!recordedReason) addScore("unknown", 1);
	}
	if (scores.size === 0) return null;
	let best = null;
	let bestScore = -1;
	let bestPriority = Number.MAX_SAFE_INTEGER;
	for (const reason of FAILURE_REASON_PRIORITY) {
		const score = scores.get(reason);
		if (typeof score !== "number") continue;
		const priority = FAILURE_REASON_ORDER.get(reason) ?? Number.MAX_SAFE_INTEGER;
		if (score > bestScore || score === bestScore && priority < bestPriority) {
			best = reason;
			bestScore = score;
			bestPriority = priority;
		}
	}
	return best;
}
/**
* Return the soonest `unusableUntil` timestamp (ms epoch) among the given
* profiles, or `null` when no profile has a recorded cooldown. Note: the
* returned timestamp may be in the past if the cooldown has already expired.
*/
function getSoonestCooldownExpiry(store, profileIds, options) {
	const ts = options?.now ?? Date.now();
	let soonest = null;
	let latestMatchingModelCooldown = null;
	for (const id of profileIds) {
		const stats = store.usageStats?.[id];
		if (!stats) continue;
		if (shouldBypassModelScopedCooldown(stats, ts, options?.forModel)) continue;
		const until = resolveProfileUnusableUntil(stats);
		if (typeof until !== "number" || !Number.isFinite(until) || until <= 0) continue;
		if (options?.forModel && stats.cooldownReason === "rate_limit" && stats.cooldownModel === options.forModel && !isActiveUnusableWindow(stats.disabledUntil, ts)) {
			latestMatchingModelCooldown = latestMatchingModelCooldown === null ? until : Math.max(latestMatchingModelCooldown, until);
			continue;
		}
		if (soonest === null || until < soonest) soonest = until;
	}
	if (soonest === null) return latestMatchingModelCooldown;
	if (latestMatchingModelCooldown === null) return soonest;
	return Math.min(soonest, latestMatchingModelCooldown);
}
function shouldBypassModelScopedCooldown(stats, now, forModel) {
	return !!(forModel && stats.cooldownReason === "rate_limit" && stats.cooldownModel && stats.cooldownModel !== forModel && !isActiveUnusableWindow(stats.disabledUntil, now));
}
/**
* Clear expired cooldowns from all profiles in the store.
*
* When `cooldownUntil` or `disabledUntil` has passed, the corresponding fields
* are removed and error counters are reset so the profile gets a fresh start
* (circuit-breaker half-open → closed). Without this, a stale `errorCount`
* causes the *next* transient failure to immediately escalate to a much longer
* cooldown — the root cause of profiles appearing "stuck" after rate limits.
*
* `cooldownUntil` and `disabledUntil` are handled independently: if a profile
* has both and only one has expired, only that field is cleared.
*
* Mutates the in-memory store; disk persistence happens lazily on the next
* store write (e.g. `markAuthProfileUsed` / `markAuthProfileFailure`), which
* matches the existing save pattern throughout the auth-profiles module.
*
* @returns `true` if any profile was modified.
*/
function clearExpiredCooldowns(store, now) {
	const usageStats = store.usageStats;
	if (!usageStats) return false;
	const ts = now ?? Date.now();
	let mutated = false;
	for (const [profileId, stats] of Object.entries(usageStats)) {
		if (!stats) continue;
		let profileMutated = false;
		const cooldownExpired = typeof stats.cooldownUntil === "number" && Number.isFinite(stats.cooldownUntil) && stats.cooldownUntil > 0 && ts >= stats.cooldownUntil;
		const disabledExpired = typeof stats.disabledUntil === "number" && Number.isFinite(stats.disabledUntil) && stats.disabledUntil > 0 && ts >= stats.disabledUntil;
		if (cooldownExpired) {
			stats.cooldownUntil = void 0;
			stats.cooldownReason = void 0;
			stats.cooldownModel = void 0;
			profileMutated = true;
		}
		if (disabledExpired) {
			stats.disabledUntil = void 0;
			stats.disabledReason = void 0;
			profileMutated = true;
		}
		if (profileMutated && !resolveProfileUnusableUntil(stats)) {
			stats.errorCount = 0;
			stats.failureCounts = void 0;
		}
		if (profileMutated) {
			usageStats[profileId] = stats;
			mutated = true;
		}
	}
	return mutated;
}
/**
* Mark a profile as successfully used. Resets error count and updates lastUsed.
* Uses store lock to avoid overwriting concurrent usage updates.
*/
async function markAuthProfileUsed(params) {
	const { store, profileId, agentDir } = params;
	const updated = await authProfileUsageDeps.updateAuthProfileStoreWithLock({
		agentDir,
		updater: (freshStore) => {
			if (!freshStore.profiles[profileId]) return false;
			updateUsageStatsEntry(freshStore, profileId, (existing) => resetUsageStats(existing, { lastUsed: Date.now() }));
			return true;
		}
	});
	if (updated) {
		store.usageStats = updated.usageStats;
		return;
	}
	if (!store.profiles[profileId]) return;
	updateUsageStatsEntry(store, profileId, (existing) => resetUsageStats(existing, { lastUsed: Date.now() }));
	authProfileUsageDeps.saveAuthProfileStore(store, agentDir);
}
function calculateAuthProfileCooldownMs(errorCount) {
	const normalized = Math.max(1, errorCount);
	if (normalized <= 1) return 3e4;
	if (normalized <= 2) return 6e4;
	return 5 * 6e4;
}
const DISABLED_FAILURE_BACKOFF_POLICIES = {
	billing: {
		baseMs: (cfg) => cfg.billingBackoffMs,
		maxMs: (cfg) => cfg.billingMaxMs
	},
	auth_permanent: {
		baseMs: (cfg) => cfg.authPermanentBackoffMs,
		maxMs: (cfg) => cfg.authPermanentMaxMs
	}
};
function resolveAuthCooldownConfig(params) {
	const defaults = {
		billingBackoffHours: 5,
		billingMaxHours: 24,
		authPermanentBackoffMinutes: 10,
		authPermanentMaxMinutes: 60,
		failureWindowHours: 24
	};
	const resolvePositiveNumber = (value, fallback) => typeof value === "number" && Number.isFinite(value) && value > 0 ? value : fallback;
	const cooldowns = params.cfg?.auth?.cooldowns;
	const billingBackoffHours = resolvePositiveNumber((() => {
		const map = cooldowns?.billingBackoffHoursByProvider;
		if (!map) return;
		for (const [key, value] of Object.entries(map)) if (normalizeProviderId(key) === params.providerId) return value;
	})() ?? cooldowns?.billingBackoffHours, defaults.billingBackoffHours);
	const billingMaxHours = resolvePositiveNumber(cooldowns?.billingMaxHours, defaults.billingMaxHours);
	const authPermanentBackoffMinutes = resolvePositiveNumber(cooldowns?.authPermanentBackoffMinutes, defaults.authPermanentBackoffMinutes);
	const authPermanentMaxMinutes = resolvePositiveNumber(cooldowns?.authPermanentMaxMinutes, defaults.authPermanentMaxMinutes);
	const failureWindowHours = resolvePositiveNumber(cooldowns?.failureWindowHours, defaults.failureWindowHours);
	return {
		billingBackoffMs: billingBackoffHours * 60 * 60 * 1e3,
		billingMaxMs: billingMaxHours * 60 * 60 * 1e3,
		authPermanentBackoffMs: authPermanentBackoffMinutes * 60 * 1e3,
		authPermanentMaxMs: authPermanentMaxMinutes * 60 * 1e3,
		failureWindowMs: failureWindowHours * 60 * 60 * 1e3
	};
}
function calculateDisabledLaneBackoffMs(params) {
	const normalized = Math.max(1, params.errorCount);
	const baseMs = Math.max(6e4, params.baseMs);
	const maxMs = Math.max(baseMs, params.maxMs);
	const raw = baseMs * 2 ** Math.min(normalized - 1, 10);
	return Math.min(maxMs, raw);
}
function resolveDisabledFailureBackoffMs(params) {
	const policy = DISABLED_FAILURE_BACKOFF_POLICIES[params.reason];
	return calculateDisabledLaneBackoffMs({
		errorCount: params.errorCount,
		baseMs: policy.baseMs(params.cfgResolved),
		maxMs: policy.maxMs(params.cfgResolved)
	});
}
function resolveProfileUnusableUntilForDisplay(store, profileId) {
	if (isAuthCooldownBypassedForProvider(store.profiles[profileId]?.provider)) return null;
	const stats = store.usageStats?.[profileId];
	if (!stats) return null;
	return resolveProfileUnusableUntil(stats);
}
function resetUsageStats(existing, overrides) {
	return {
		...existing,
		errorCount: 0,
		cooldownUntil: void 0,
		cooldownReason: void 0,
		cooldownModel: void 0,
		disabledUntil: void 0,
		disabledReason: void 0,
		failureCounts: void 0,
		...overrides
	};
}
function updateUsageStatsEntry(store, profileId, updater) {
	store.usageStats = store.usageStats ?? {};
	store.usageStats[profileId] = updater(store.usageStats[profileId]);
}
function keepActiveWindowOrRecompute(params) {
	const { existingUntil, now, recomputedUntil } = params;
	return typeof existingUntil === "number" && Number.isFinite(existingUntil) && existingUntil > now ? existingUntil : recomputedUntil;
}
function computeNextProfileUsageStats(params) {
	const windowMs = params.cfgResolved.failureWindowMs;
	const windowExpired = typeof params.existing.lastFailureAt === "number" && params.existing.lastFailureAt > 0 && params.now - params.existing.lastFailureAt > windowMs;
	const unusableUntil = resolveProfileUnusableUntil(params.existing);
	const previousCooldownExpired = typeof unusableUntil === "number" && params.now >= unusableUntil;
	const shouldResetCounters = windowExpired || previousCooldownExpired;
	const nextErrorCount = (shouldResetCounters ? 0 : params.existing.errorCount ?? 0) + 1;
	const failureCounts = shouldResetCounters ? {} : { ...params.existing.failureCounts };
	failureCounts[params.reason] = (failureCounts[params.reason] ?? 0) + 1;
	const updatedStats = {
		...params.existing,
		errorCount: nextErrorCount,
		failureCounts,
		lastFailureAt: params.now
	};
	const disabledFailureReason = params.reason === "billing" || params.reason === "auth_permanent" ? params.reason : null;
	if (disabledFailureReason) {
		const backoffMs = resolveDisabledFailureBackoffMs({
			reason: disabledFailureReason,
			errorCount: failureCounts[disabledFailureReason] ?? 1,
			cfgResolved: params.cfgResolved
		});
		updatedStats.disabledUntil = keepActiveWindowOrRecompute({
			existingUntil: params.existing.disabledUntil,
			now: params.now,
			recomputedUntil: params.now + backoffMs
		});
		updatedStats.disabledReason = disabledFailureReason;
	} else {
		const backoffMs = calculateAuthProfileCooldownMs(nextErrorCount);
		updatedStats.cooldownUntil = keepActiveWindowOrRecompute({
			existingUntil: params.existing.cooldownUntil,
			now: params.now,
			recomputedUntil: params.now + backoffMs
		});
		if (typeof params.existing.cooldownUntil === "number" && params.existing.cooldownUntil > params.now) {
			updatedStats.cooldownReason = params.reason;
			if (params.existing.cooldownModel && params.modelId && params.existing.cooldownModel !== params.modelId) updatedStats.cooldownModel = void 0;
			else if (params.reason === "rate_limit" && !params.modelId && params.existing.cooldownModel) updatedStats.cooldownModel = void 0;
			else if (params.reason !== "rate_limit") updatedStats.cooldownModel = void 0;
			else updatedStats.cooldownModel = params.existing.cooldownModel;
		} else {
			updatedStats.cooldownReason = params.reason;
			updatedStats.cooldownModel = params.reason === "rate_limit" ? params.modelId : void 0;
		}
	}
	return updatedStats;
}
/**
* Mark a profile as failed for a specific reason. Billing and permanent-auth
* failures are treated as "disabled" (longer backoff) vs the regular cooldown
* window.
*/
async function markAuthProfileFailure(params) {
	const { store, profileId, reason, agentDir, cfg, runId, modelId } = params;
	const profile = store.profiles[profileId];
	if (!profile || isAuthCooldownBypassedForProvider(profile.provider)) return;
	const whamResult = shouldProbeWhamForFailure(profile.provider, reason) ? await probeWhamForCooldown(store, profileId) : null;
	let nextStats;
	let previousStats;
	let updateTime = 0;
	const updated = await authProfileUsageDeps.updateAuthProfileStoreWithLock({
		agentDir,
		updater: (freshStore) => {
			const profile = freshStore.profiles[profileId];
			if (!profile || isAuthCooldownBypassedForProvider(profile.provider)) return false;
			const now = Date.now();
			const cfgResolved = resolveAuthCooldownConfig({
				cfg,
				providerId: normalizeProviderId(profile.provider)
			});
			previousStats = freshStore.usageStats?.[profileId];
			updateTime = now;
			const computed = computeNextProfileUsageStats({
				existing: previousStats ?? {},
				now,
				reason,
				cfgResolved,
				modelId
			});
			nextStats = whamResult && shouldProbeWhamForFailure(profile.provider, reason) ? applyWhamCooldownResult({
				existing: previousStats ?? {},
				computed,
				now,
				whamResult
			}) : computed;
			updateUsageStatsEntry(freshStore, profileId, () => nextStats ?? computed);
			return true;
		}
	});
	if (updated) {
		store.usageStats = updated.usageStats;
		if (nextStats) logAuthProfileFailureStateChange({
			runId,
			profileId,
			provider: profile.provider,
			reason,
			previous: previousStats,
			next: nextStats,
			now: updateTime
		});
		return;
	}
	if (!store.profiles[profileId]) return;
	const now = Date.now();
	const cfgResolved = resolveAuthCooldownConfig({
		cfg,
		providerId: normalizeProviderId(store.profiles[profileId]?.provider ?? "")
	});
	previousStats = store.usageStats?.[profileId];
	const computed = computeNextProfileUsageStats({
		existing: previousStats ?? {},
		now,
		reason,
		cfgResolved,
		modelId
	});
	nextStats = whamResult && shouldProbeWhamForFailure(store.profiles[profileId]?.provider, reason) ? applyWhamCooldownResult({
		existing: previousStats ?? {},
		computed,
		now,
		whamResult
	}) : computed;
	updateUsageStatsEntry(store, profileId, () => nextStats ?? computed);
	authProfileUsageDeps.saveAuthProfileStore(store, agentDir);
	logAuthProfileFailureStateChange({
		runId,
		profileId,
		provider: store.profiles[profileId]?.provider ?? profile.provider,
		reason,
		previous: previousStats,
		next: nextStats,
		now
	});
}
/**
* Mark a profile as transiently failed. Applies stepped backoff cooldown.
* Cooldown times: 30s, 1min, 5min (capped).
* Uses store lock to avoid overwriting concurrent usage updates.
*/
async function markAuthProfileCooldown(params) {
	await markAuthProfileFailure({
		store: params.store,
		profileId: params.profileId,
		reason: "unknown",
		agentDir: params.agentDir,
		runId: params.runId
	});
}
/**
* Clear cooldown for a profile (e.g., manual reset).
* Uses store lock to avoid overwriting concurrent usage updates.
*/
async function clearAuthProfileCooldown(params) {
	const { store, profileId, agentDir } = params;
	const updated = await authProfileUsageDeps.updateAuthProfileStoreWithLock({
		agentDir,
		updater: (freshStore) => {
			if (!freshStore.usageStats?.[profileId]) return false;
			updateUsageStatsEntry(freshStore, profileId, (existing) => resetUsageStats(existing));
			return true;
		}
	});
	if (updated) {
		store.usageStats = updated.usageStats;
		return;
	}
	if (!store.usageStats?.[profileId]) return;
	updateUsageStatsEntry(store, profileId, (existing) => resetUsageStats(existing));
	authProfileUsageDeps.saveAuthProfileStore(store, agentDir);
}
//#endregion
//#region src/agents/auth-profiles/order.ts
function resolveAuthProfileEligibility(params) {
	const providerAuthKey = resolveProviderIdForAuth(params.provider, { config: params.cfg });
	const cred = params.store.profiles[params.profileId];
	if (!cred) return {
		eligible: false,
		reasonCode: "profile_missing"
	};
	if (resolveProviderIdForAuth(cred.provider, { config: params.cfg }) !== providerAuthKey) return {
		eligible: false,
		reasonCode: "provider_mismatch"
	};
	const profileConfig = params.cfg?.auth?.profiles?.[params.profileId];
	if (profileConfig) {
		if (resolveProviderIdForAuth(profileConfig.provider, { config: params.cfg }) !== providerAuthKey) return {
			eligible: false,
			reasonCode: "provider_mismatch"
		};
		if (profileConfig.mode !== cred.type) {
			if (!(profileConfig.mode === "oauth" && cred.type === "token")) return {
				eligible: false,
				reasonCode: "mode_mismatch"
			};
		}
	}
	const credentialEligibility = evaluateStoredCredentialEligibility({
		credential: cred,
		now: params.now
	});
	return {
		eligible: credentialEligibility.eligible,
		reasonCode: credentialEligibility.reasonCode
	};
}
function resolveAuthProfileOrder(params) {
	const { cfg, store, provider, preferredProfile } = params;
	const providerKey = normalizeProviderId(provider);
	const providerAuthKey = resolveProviderIdForAuth(provider, { config: cfg });
	const now = Date.now();
	clearExpiredCooldowns(store, now);
	const storedOrder = findNormalizedProviderValue(store.order, providerKey);
	const configuredOrder = findNormalizedProviderValue(cfg?.auth?.order, providerKey);
	const explicitOrder = storedOrder ?? configuredOrder;
	const explicitProfiles = cfg?.auth?.profiles ? Object.entries(cfg.auth.profiles).filter(([, profile]) => resolveProviderIdForAuth(profile.provider, { config: cfg }) === providerAuthKey).map(([profileId]) => profileId) : [];
	const baseOrder = explicitOrder ?? (explicitProfiles.length > 0 ? explicitProfiles : listProfilesForProvider(store, provider));
	if (baseOrder.length === 0) return [];
	const isValidProfile = (profileId) => resolveAuthProfileEligibility({
		cfg,
		store,
		provider,
		profileId,
		now
	}).eligible;
	let filtered = baseOrder.filter(isValidProfile);
	const allBaseProfilesMissing = baseOrder.every((profileId) => !store.profiles[profileId]);
	if (filtered.length === 0 && explicitProfiles.length > 0 && allBaseProfilesMissing) filtered = listProfilesForProvider(store, provider).filter(isValidProfile);
	const deduped = dedupeProfileIds(filtered);
	if (explicitOrder && explicitOrder.length > 0) {
		const available = [];
		const inCooldown = [];
		for (const profileId of deduped) if (isProfileInCooldown(store, profileId)) {
			const cooldownUntil = resolveProfileUnusableUntil(store.usageStats?.[profileId] ?? {}) ?? now;
			inCooldown.push({
				profileId,
				cooldownUntil
			});
		} else available.push(profileId);
		const cooldownSorted = inCooldown.toSorted((a, b) => a.cooldownUntil - b.cooldownUntil).map((entry) => entry.profileId);
		const ordered = [...available, ...cooldownSorted];
		if (preferredProfile && ordered.includes(preferredProfile)) return [preferredProfile, ...ordered.filter((e) => e !== preferredProfile)];
		return ordered;
	}
	const sorted = orderProfilesByMode(deduped, store);
	if (preferredProfile && sorted.includes(preferredProfile)) return [preferredProfile, ...sorted.filter((e) => e !== preferredProfile)];
	return sorted;
}
function orderProfilesByMode(order, store) {
	const now = Date.now();
	const available = [];
	const inCooldown = [];
	for (const profileId of order) if (isProfileInCooldown(store, profileId)) inCooldown.push(profileId);
	else available.push(profileId);
	const sorted = available.map((profileId) => {
		const type = store.profiles[profileId]?.type;
		return {
			profileId,
			typeScore: type === "oauth" ? 0 : type === "token" ? 1 : type === "api_key" ? 2 : 3,
			lastUsed: store.usageStats?.[profileId]?.lastUsed ?? 0
		};
	}).toSorted((a, b) => {
		if (a.typeScore !== b.typeScore) return a.typeScore - b.typeScore;
		return a.lastUsed - b.lastUsed;
	}).map((entry) => entry.profileId);
	const cooldownSorted = inCooldown.map((profileId) => ({
		profileId,
		cooldownUntil: resolveProfileUnusableUntil(store.usageStats?.[profileId] ?? {}) ?? now
	})).toSorted((a, b) => a.cooldownUntil - b.cooldownUntil).map((entry) => entry.profileId);
	return [...sorted, ...cooldownSorted];
}
//#endregion
export { clearExpiredCooldowns as a, markAuthProfileCooldown as c, resolveProfileUnusableUntilForDisplay as d, resolveProfilesUnavailableReason as f, clearAuthProfileCooldown as i, markAuthProfileFailure as l, resolveTokenExpiryState as m, resolveAuthProfileOrder as n, getSoonestCooldownExpiry as o, evaluateStoredCredentialEligibility as p, calculateAuthProfileCooldownMs as r, isProfileInCooldown as s, resolveAuthProfileEligibility as t, markAuthProfileUsed as u };
