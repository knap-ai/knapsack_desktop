import { s as normalizeOptionalString } from "./string-coerce-BUSzWgUA.js";
//#region src/infra/heartbeat-reason.ts
function trimReason(reason) {
	return normalizeOptionalString(reason) ?? "";
}
function normalizeHeartbeatWakeReason(reason) {
	const trimmed = trimReason(reason);
	return trimmed.length > 0 ? trimmed : "requested";
}
function resolveHeartbeatReasonKind(reason) {
	const trimmed = trimReason(reason);
	if (trimmed === "retry") return "retry";
	if (trimmed === "interval") return "interval";
	if (trimmed === "manual") return "manual";
	if (trimmed === "exec-event") return "exec-event";
	if (trimmed === "wake") return "wake";
	if (trimmed.startsWith("acp:spawn:")) return "wake";
	if (trimmed.startsWith("cron:")) return "cron";
	if (trimmed.startsWith("hook:")) return "hook";
	return "other";
}
function isHeartbeatActionWakeReason(reason) {
	const kind = resolveHeartbeatReasonKind(reason);
	return kind === "manual" || kind === "exec-event" || kind === "hook";
}
//#endregion
//#region src/infra/heartbeat-wake.ts
let heartbeatsEnabled = true;
function setHeartbeatsEnabled(enabled) {
	heartbeatsEnabled = enabled;
}
function areHeartbeatsEnabled() {
	return heartbeatsEnabled;
}
let handler = null;
let handlerGeneration = 0;
const pendingWakes = /* @__PURE__ */ new Map();
let scheduled = false;
let running = false;
let timer = null;
let timerDueAt = null;
let timerKind = null;
const DEFAULT_COALESCE_MS = 250;
const DEFAULT_RETRY_MS = 1e3;
const REASON_PRIORITY = {
	RETRY: 0,
	INTERVAL: 1,
	DEFAULT: 2,
	ACTION: 3
};
function resolveReasonPriority(reason) {
	const kind = resolveHeartbeatReasonKind(reason);
	if (kind === "retry") return REASON_PRIORITY.RETRY;
	if (kind === "interval") return REASON_PRIORITY.INTERVAL;
	if (isHeartbeatActionWakeReason(reason)) return REASON_PRIORITY.ACTION;
	return REASON_PRIORITY.DEFAULT;
}
function normalizeWakeReason(reason) {
	return normalizeHeartbeatWakeReason(reason);
}
function normalizeWakeTarget(value) {
	return (normalizeOptionalString(value) ?? "") || void 0;
}
function getWakeTargetKey(params) {
	const agentId = normalizeWakeTarget(params.agentId);
	const sessionKey = normalizeWakeTarget(params.sessionKey);
	return `${agentId ?? ""}::${sessionKey ?? ""}`;
}
function queuePendingWakeReason(params) {
	const requestedAt = params?.requestedAt ?? Date.now();
	const normalizedReason = normalizeWakeReason(params?.reason);
	const normalizedAgentId = normalizeWakeTarget(params?.agentId);
	const normalizedSessionKey = normalizeWakeTarget(params?.sessionKey);
	const wakeTargetKey = getWakeTargetKey({
		agentId: normalizedAgentId,
		sessionKey: normalizedSessionKey
	});
	const next = {
		reason: normalizedReason,
		priority: resolveReasonPriority(normalizedReason),
		requestedAt,
		agentId: normalizedAgentId,
		sessionKey: normalizedSessionKey
	};
	const previous = pendingWakes.get(wakeTargetKey);
	if (!previous) {
		pendingWakes.set(wakeTargetKey, next);
		return;
	}
	if (next.priority > previous.priority) {
		pendingWakes.set(wakeTargetKey, next);
		return;
	}
	if (next.priority === previous.priority && next.requestedAt >= previous.requestedAt) pendingWakes.set(wakeTargetKey, next);
}
function schedule(coalesceMs, kind = "normal") {
	const delay = Number.isFinite(coalesceMs) ? Math.max(0, coalesceMs) : DEFAULT_COALESCE_MS;
	const dueAt = Date.now() + delay;
	if (timer) {
		if (timerKind === "retry") return;
		if (typeof timerDueAt === "number" && timerDueAt <= dueAt) return;
		clearTimeout(timer);
		timer = null;
		timerDueAt = null;
		timerKind = null;
	}
	timerDueAt = dueAt;
	timerKind = kind;
	timer = setTimeout(async () => {
		timer = null;
		timerDueAt = null;
		timerKind = null;
		scheduled = false;
		const active = handler;
		if (!active) return;
		if (running) {
			scheduled = true;
			schedule(delay, kind);
			return;
		}
		const pendingBatch = Array.from(pendingWakes.values());
		pendingWakes.clear();
		running = true;
		try {
			for (const pendingWake of pendingBatch) {
				const res = await active({
					reason: pendingWake.reason ?? void 0,
					...pendingWake.agentId ? { agentId: pendingWake.agentId } : {},
					...pendingWake.sessionKey ? { sessionKey: pendingWake.sessionKey } : {}
				});
				if (res.status === "skipped" && res.reason === "requests-in-flight") {
					queuePendingWakeReason({
						reason: pendingWake.reason ?? "retry",
						agentId: pendingWake.agentId,
						sessionKey: pendingWake.sessionKey
					});
					schedule(DEFAULT_RETRY_MS, "retry");
				}
			}
		} catch {
			for (const pendingWake of pendingBatch) queuePendingWakeReason({
				reason: pendingWake.reason ?? "retry",
				agentId: pendingWake.agentId,
				sessionKey: pendingWake.sessionKey
			});
			schedule(DEFAULT_RETRY_MS, "retry");
		} finally {
			running = false;
			if (pendingWakes.size > 0 || scheduled) schedule(delay, "normal");
		}
	}, delay);
	timer.unref?.();
}
/**
* Register (or clear) the heartbeat wake handler.
* Returns a disposer function that clears this specific registration.
* Stale disposers (from previous registrations) are no-ops, preventing
* a race where an old runner's cleanup clears a newer runner's handler.
*/
function setHeartbeatWakeHandler(next) {
	handlerGeneration += 1;
	const generation = handlerGeneration;
	handler = next;
	if (next) {
		if (timer) clearTimeout(timer);
		timer = null;
		timerDueAt = null;
		timerKind = null;
		running = false;
		scheduled = false;
	}
	if (handler && pendingWakes.size > 0) schedule(DEFAULT_COALESCE_MS, "normal");
	return () => {
		if (handlerGeneration !== generation) return;
		if (handler !== next) return;
		handlerGeneration += 1;
		handler = null;
	};
}
function requestHeartbeatNow(opts) {
	queuePendingWakeReason({
		reason: opts?.reason,
		agentId: opts?.agentId,
		sessionKey: opts?.sessionKey
	});
	schedule(opts?.coalesceMs ?? DEFAULT_COALESCE_MS, "normal");
}
//#endregion
export { resolveHeartbeatReasonKind as a, setHeartbeatsEnabled as i, requestHeartbeatNow as n, setHeartbeatWakeHandler as r, areHeartbeatsEnabled as t };
