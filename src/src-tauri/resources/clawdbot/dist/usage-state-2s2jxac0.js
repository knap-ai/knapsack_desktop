import { r as normalizeProviderId } from "./provider-id-DRW5WMbW.js";
//#region src/agents/auth-profiles/usage-state.ts
function isAuthCooldownBypassedForProvider(provider) {
	const normalized = normalizeProviderId(provider ?? "");
	return normalized === "openrouter" || normalized === "kilocode";
}
function resolveProfileUnusableUntil(stats) {
	const values = [stats.cooldownUntil, stats.disabledUntil].filter((value) => typeof value === "number").filter((value) => Number.isFinite(value) && value > 0);
	if (values.length === 0) return null;
	return Math.max(...values);
}
function isActiveUnusableWindow(until, now) {
	return typeof until === "number" && Number.isFinite(until) && until > 0 && now < until;
}
function shouldBypassModelScopedCooldown(stats, now, forModel) {
	return !!(forModel && stats.cooldownReason === "rate_limit" && stats.cooldownModel && stats.cooldownModel !== forModel && !isActiveUnusableWindow(stats.disabledUntil, now));
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
/**
* Clear expired cooldowns from all profiles in the store.
*
* When `cooldownUntil` or `disabledUntil` has passed, the corresponding fields
* are removed and error counters are reset so the profile gets a fresh start
* (circuit-breaker half-open -> closed). Without this, a stale `errorCount`
* causes the *next* transient failure to immediately escalate to a much longer
* cooldown -- the root cause of profiles appearing "stuck" after rate limits.
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
//#endregion
export { isProfileInCooldown as a, isAuthCooldownBypassedForProvider as i, getSoonestCooldownExpiry as n, resolveProfileUnusableUntil as o, isActiveUnusableWindow as r, clearExpiredCooldowns as t };
