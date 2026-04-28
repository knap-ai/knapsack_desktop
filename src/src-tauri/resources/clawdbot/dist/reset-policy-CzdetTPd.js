//#region src/config/sessions/reset-policy.ts
const DEFAULT_RESET_MODE = "daily";
function resolveDailyResetAtMs(now, atHour) {
	const normalizedAtHour = normalizeResetAtHour(atHour);
	const resetAt = new Date(now);
	resetAt.setHours(normalizedAtHour, 0, 0, 0);
	if (now < resetAt.getTime()) resetAt.setDate(resetAt.getDate() - 1);
	return resetAt.getTime();
}
function resolveSessionResetPolicy(params) {
	const sessionCfg = params.sessionCfg;
	const baseReset = params.resetOverride ?? sessionCfg?.reset;
	const typeReset = params.resetOverride ? void 0 : sessionCfg?.resetByType?.[params.resetType] ?? (params.resetType === "direct" ? (sessionCfg?.resetByType)?.dm : void 0);
	const hasExplicitReset = Boolean(baseReset || sessionCfg?.resetByType);
	const legacyIdleMinutes = params.resetOverride ? void 0 : sessionCfg?.idleMinutes;
	const configured = Boolean(baseReset || typeReset || legacyIdleMinutes != null);
	const mode = typeReset?.mode ?? baseReset?.mode ?? (!hasExplicitReset && legacyIdleMinutes != null ? "idle" : "daily");
	const atHour = normalizeResetAtHour(typeReset?.atHour ?? baseReset?.atHour ?? 4);
	const idleMinutesRaw = typeReset?.idleMinutes ?? baseReset?.idleMinutes ?? legacyIdleMinutes;
	let idleMinutes;
	if (idleMinutesRaw != null) {
		const normalized = Math.floor(idleMinutesRaw);
		if (Number.isFinite(normalized)) idleMinutes = Math.max(normalized, 0);
	} else if (mode === "idle") idleMinutes = 0;
	return {
		mode,
		atHour,
		idleMinutes,
		configured
	};
}
function evaluateSessionFreshness(params) {
	const sessionStartedAt = resolveTimestamp(params.sessionStartedAt) ?? params.updatedAt;
	const lastInteractionAt = resolveTimestamp(params.lastInteractionAt) ?? sessionStartedAt;
	const dailyResetAt = params.policy.mode === "daily" ? resolveDailyResetAtMs(params.now, params.policy.atHour) : void 0;
	const idleExpiresAt = params.policy.idleMinutes != null && params.policy.idleMinutes > 0 ? lastInteractionAt + params.policy.idleMinutes * 6e4 : void 0;
	const staleDaily = dailyResetAt != null && sessionStartedAt < dailyResetAt;
	const staleIdle = idleExpiresAt != null && params.now > idleExpiresAt;
	return {
		fresh: !(staleDaily || staleIdle),
		dailyResetAt,
		idleExpiresAt
	};
}
function resolveTimestamp(value) {
	return typeof value === "number" && Number.isFinite(value) && value >= 0 ? value : void 0;
}
function normalizeResetAtHour(value) {
	if (typeof value !== "number" || !Number.isFinite(value)) return 4;
	const normalized = Math.floor(value);
	if (!Number.isFinite(normalized)) return 4;
	if (normalized < 0) return 0;
	if (normalized > 23) return 23;
	return normalized;
}
//#endregion
export { resolveSessionResetPolicy as i, evaluateSessionFreshness as n, resolveDailyResetAtMs as r, DEFAULT_RESET_MODE as t };
