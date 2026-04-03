import { d as normalizeMessageChannel } from "./message-channel-D19EDm2g.js";
import { d as updateSessionStore } from "./store-BGmy-Wot.js";
import { r as resolveSessionFilePath } from "./paths-DBIQqSpZ.js";
import { i as resolveSessionThreadInfo } from "./session-conversation-hVzJTI-k.js";
const GROUP_SESSION_MARKERS = [":group:", ":channel:"];
function isThreadSessionKey(sessionKey) {
	return Boolean(resolveSessionThreadInfo(sessionKey).threadId);
}
function resolveSessionResetType(params) {
	if (params.isThread || isThreadSessionKey(params.sessionKey)) return "thread";
	if (params.isGroup) return "group";
	const normalized = (params.sessionKey ?? "").toLowerCase();
	if (GROUP_SESSION_MARKERS.some((marker) => normalized.includes(marker))) return "group";
	return "direct";
}
function resolveThreadFlag(params) {
	if (params.messageThreadId != null) return true;
	if (params.threadLabel?.trim()) return true;
	if (params.threadStarterBody?.trim()) return true;
	if (params.parentSessionKey?.trim()) return true;
	return isThreadSessionKey(params.sessionKey);
}
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
		idleMinutes
	};
}
function resolveChannelResetConfig(params) {
	const resetByChannel = params.sessionCfg?.resetByChannel;
	if (!resetByChannel) return;
	const normalized = normalizeMessageChannel(params.channel);
	const fallback = params.channel?.trim().toLowerCase();
	const key = normalized ?? fallback;
	if (!key) return;
	return resetByChannel[key] ?? resetByChannel[key.toLowerCase()];
}
function evaluateSessionFreshness(params) {
	const dailyResetAt = params.policy.mode === "daily" ? resolveDailyResetAtMs(params.now, params.policy.atHour) : void 0;
	const idleExpiresAt = params.policy.idleMinutes != null && params.policy.idleMinutes > 0 ? params.updatedAt + params.policy.idleMinutes * 6e4 : void 0;
	const staleDaily = dailyResetAt != null && params.updatedAt < dailyResetAt;
	const staleIdle = idleExpiresAt != null && params.now > idleExpiresAt;
	return {
		fresh: !(staleDaily || staleIdle),
		dailyResetAt,
		idleExpiresAt
	};
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
//#region src/config/sessions/session-file.ts
async function resolveAndPersistSessionFile(params) {
	const { sessionId, sessionKey, sessionStore, storePath } = params;
	const baseEntry = params.sessionEntry ?? sessionStore[sessionKey] ?? {
		sessionId,
		updatedAt: Date.now()
	};
	const fallbackSessionFile = params.fallbackSessionFile?.trim();
	const sessionFile = resolveSessionFilePath(sessionId, !baseEntry.sessionFile && fallbackSessionFile ? {
		...baseEntry,
		sessionFile: fallbackSessionFile
	} : baseEntry, {
		agentId: params.agentId,
		sessionsDir: params.sessionsDir
	});
	const persistedEntry = {
		...baseEntry,
		sessionId,
		updatedAt: Date.now(),
		sessionFile
	};
	if (baseEntry.sessionId !== sessionId || baseEntry.sessionFile !== sessionFile) {
		sessionStore[sessionKey] = persistedEntry;
		await updateSessionStore(storePath, (store) => {
			store[sessionKey] = {
				...store[sessionKey],
				...persistedEntry
			};
		}, params.activeSessionKey ? { activeSessionKey: params.activeSessionKey } : void 0);
		return {
			sessionFile,
			sessionEntry: persistedEntry
		};
	}
	sessionStore[sessionKey] = persistedEntry;
	return {
		sessionFile,
		sessionEntry: persistedEntry
	};
}
//#endregion
export { resolveSessionResetType as a, resolveSessionResetPolicy as i, evaluateSessionFreshness as n, resolveThreadFlag as o, resolveChannelResetConfig as r, resolveAndPersistSessionFile as t };
