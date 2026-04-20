import { i as getRuntimeConfig } from "./io-5pxHCi7V.js";
import "./config-Q9XZc_2I.js";
import { t as emitDiagnosticEvent } from "./diagnostic-events-P3w1ZgD_.js";
import { a as markDiagnosticActivity, n as getLastDiagnosticActivityAt, o as resetDiagnosticActivityForTest, t as diagnosticLogger } from "./diagnostic-runtime-DOaqJdZf.js";
import { a as resetDiagnosticSessionStateForTest, i as pruneDiagnosticSessionStates, n as getDiagnosticSessionState, r as getDiagnosticSessionStateCountForTest$1, t as diagnosticSessionStates } from "./diagnostic-session-state-BePum-ql.js";
//#region src/logging/diagnostic.ts
const webhookStats = {
	received: 0,
	processed: 0,
	errors: 0,
	lastReceived: 0
};
const DEFAULT_STUCK_SESSION_WARN_MS = 12e4;
const MIN_STUCK_SESSION_WARN_MS = 1e3;
const MAX_STUCK_SESSION_WARN_MS = 1440 * 60 * 1e3;
let commandPollBackoffRuntimePromise = null;
function loadCommandPollBackoffRuntime() {
	commandPollBackoffRuntimePromise ??= import("./command-poll-backoff.runtime-DnePDO7O.js");
	return commandPollBackoffRuntimePromise;
}
function resolveStuckSessionWarnMs(config) {
	const raw = config?.diagnostics?.stuckSessionWarnMs;
	if (typeof raw !== "number" || !Number.isFinite(raw)) return DEFAULT_STUCK_SESSION_WARN_MS;
	const rounded = Math.floor(raw);
	if (rounded < MIN_STUCK_SESSION_WARN_MS || rounded > MAX_STUCK_SESSION_WARN_MS) return DEFAULT_STUCK_SESSION_WARN_MS;
	return rounded;
}
function logWebhookReceived(params) {
	webhookStats.received += 1;
	webhookStats.lastReceived = Date.now();
	if (diagnosticLogger.isEnabled("debug")) diagnosticLogger.debug(`webhook received: channel=${params.channel} type=${params.updateType ?? "unknown"} chatId=${params.chatId ?? "unknown"} total=${webhookStats.received}`);
	emitDiagnosticEvent({
		type: "webhook.received",
		channel: params.channel,
		updateType: params.updateType,
		chatId: params.chatId
	});
	markDiagnosticActivity();
}
function logWebhookProcessed(params) {
	webhookStats.processed += 1;
	if (diagnosticLogger.isEnabled("debug")) diagnosticLogger.debug(`webhook processed: channel=${params.channel} type=${params.updateType ?? "unknown"} chatId=${params.chatId ?? "unknown"} duration=${params.durationMs ?? 0}ms processed=${webhookStats.processed}`);
	emitDiagnosticEvent({
		type: "webhook.processed",
		channel: params.channel,
		updateType: params.updateType,
		chatId: params.chatId,
		durationMs: params.durationMs
	});
	markDiagnosticActivity();
}
function logWebhookError(params) {
	webhookStats.errors += 1;
	diagnosticLogger.error(`webhook error: channel=${params.channel} type=${params.updateType ?? "unknown"} chatId=${params.chatId ?? "unknown"} error="${params.error}" errors=${webhookStats.errors}`);
	emitDiagnosticEvent({
		type: "webhook.error",
		channel: params.channel,
		updateType: params.updateType,
		chatId: params.chatId,
		error: params.error
	});
	markDiagnosticActivity();
}
function logMessageQueued(params) {
	const state = getDiagnosticSessionState(params);
	state.queueDepth += 1;
	state.lastActivity = Date.now();
	if (diagnosticLogger.isEnabled("debug")) diagnosticLogger.debug(`message queued: sessionId=${state.sessionId ?? "unknown"} sessionKey=${state.sessionKey ?? "unknown"} source=${params.source} queueDepth=${state.queueDepth} sessionState=${state.state}`);
	emitDiagnosticEvent({
		type: "message.queued",
		sessionId: state.sessionId,
		sessionKey: state.sessionKey,
		channel: params.channel,
		source: params.source,
		queueDepth: state.queueDepth
	});
	markDiagnosticActivity();
}
function logMessageProcessed(params) {
	if (params.outcome === "error" ? diagnosticLogger.isEnabled("error") : diagnosticLogger.isEnabled("debug")) {
		const payload = `message processed: channel=${params.channel} chatId=${params.chatId ?? "unknown"} messageId=${params.messageId ?? "unknown"} sessionId=${params.sessionId ?? "unknown"} sessionKey=${params.sessionKey ?? "unknown"} outcome=${params.outcome} duration=${params.durationMs ?? 0}ms${params.reason ? ` reason=${params.reason}` : ""}${params.error ? ` error="${params.error}"` : ""}`;
		if (params.outcome === "error") diagnosticLogger.error(payload);
		else diagnosticLogger.debug(payload);
	}
	emitDiagnosticEvent({
		type: "message.processed",
		channel: params.channel,
		chatId: params.chatId,
		messageId: params.messageId,
		sessionId: params.sessionId,
		sessionKey: params.sessionKey,
		durationMs: params.durationMs,
		outcome: params.outcome,
		reason: params.reason,
		error: params.error
	});
	markDiagnosticActivity();
}
function logSessionStateChange(params) {
	const state = getDiagnosticSessionState(params);
	const isProbeSession = state.sessionId?.startsWith("probe-") ?? false;
	const prevState = state.state;
	state.state = params.state;
	state.lastActivity = Date.now();
	if (params.state === "idle") state.queueDepth = Math.max(0, state.queueDepth - 1);
	if (!isProbeSession && diagnosticLogger.isEnabled("debug")) diagnosticLogger.debug(`session state: sessionId=${state.sessionId ?? "unknown"} sessionKey=${state.sessionKey ?? "unknown"} prev=${prevState} new=${params.state} reason="${params.reason ?? ""}" queueDepth=${state.queueDepth}`);
	emitDiagnosticEvent({
		type: "session.state",
		sessionId: state.sessionId,
		sessionKey: state.sessionKey,
		prevState,
		state: params.state,
		reason: params.reason,
		queueDepth: state.queueDepth
	});
	markDiagnosticActivity();
}
function logSessionStuck(params) {
	const state = getDiagnosticSessionState(params);
	diagnosticLogger.warn(`stuck session: sessionId=${state.sessionId ?? "unknown"} sessionKey=${state.sessionKey ?? "unknown"} state=${params.state} age=${Math.round(params.ageMs / 1e3)}s queueDepth=${state.queueDepth}`);
	emitDiagnosticEvent({
		type: "session.stuck",
		sessionId: state.sessionId,
		sessionKey: state.sessionKey,
		state: params.state,
		ageMs: params.ageMs,
		queueDepth: state.queueDepth
	});
	markDiagnosticActivity();
}
function logRunAttempt(params) {
	diagnosticLogger.debug(`run attempt: sessionId=${params.sessionId ?? "unknown"} sessionKey=${params.sessionKey ?? "unknown"} runId=${params.runId} attempt=${params.attempt}`);
	emitDiagnosticEvent({
		type: "run.attempt",
		sessionId: params.sessionId,
		sessionKey: params.sessionKey,
		runId: params.runId,
		attempt: params.attempt
	});
	markDiagnosticActivity();
}
function logToolLoopAction(params) {
	const payload = `tool loop: sessionId=${params.sessionId ?? "unknown"} sessionKey=${params.sessionKey ?? "unknown"} tool=${params.toolName} level=${params.level} action=${params.action} detector=${params.detector} count=${params.count}${params.pairedToolName ? ` pairedTool=${params.pairedToolName}` : ""} message="${params.message}"`;
	if (params.level === "critical") diagnosticLogger.error(payload);
	else diagnosticLogger.warn(payload);
	emitDiagnosticEvent({
		type: "tool.loop",
		sessionId: params.sessionId,
		sessionKey: params.sessionKey,
		toolName: params.toolName,
		level: params.level,
		action: params.action,
		detector: params.detector,
		count: params.count,
		message: params.message,
		pairedToolName: params.pairedToolName
	});
	markDiagnosticActivity();
}
function logActiveRuns() {
	const activeSessions = Array.from(diagnosticSessionStates.entries()).filter(([, s]) => s.state === "processing").map(([id, s]) => `${id}(q=${s.queueDepth},age=${Math.round((Date.now() - s.lastActivity) / 1e3)}s)`);
	diagnosticLogger.debug(`active runs: count=${activeSessions.length} sessions=[${activeSessions.join(", ")}]`);
	markDiagnosticActivity();
}
let heartbeatInterval = null;
function startDiagnosticHeartbeat(config, opts) {
	if (heartbeatInterval) return;
	heartbeatInterval = setInterval(() => {
		let heartbeatConfig = config;
		if (!heartbeatConfig) try {
			heartbeatConfig = (opts?.getConfig ?? getRuntimeConfig)();
		} catch {
			heartbeatConfig = void 0;
		}
		const stuckSessionWarnMs = resolveStuckSessionWarnMs(heartbeatConfig);
		const now = Date.now();
		pruneDiagnosticSessionStates(now, true);
		const activeCount = Array.from(diagnosticSessionStates.values()).filter((s) => s.state === "processing").length;
		const waitingCount = Array.from(diagnosticSessionStates.values()).filter((s) => s.state === "waiting").length;
		const totalQueued = Array.from(diagnosticSessionStates.values()).reduce((sum, s) => sum + s.queueDepth, 0);
		if (!(getLastDiagnosticActivityAt() > 0 || webhookStats.received > 0 || activeCount > 0 || waitingCount > 0 || totalQueued > 0)) return;
		if (now - getLastDiagnosticActivityAt() > 12e4 && activeCount === 0 && waitingCount === 0) return;
		diagnosticLogger.debug(`heartbeat: webhooks=${webhookStats.received}/${webhookStats.processed}/${webhookStats.errors} active=${activeCount} waiting=${waitingCount} queued=${totalQueued}`);
		emitDiagnosticEvent({
			type: "diagnostic.heartbeat",
			webhooks: {
				received: webhookStats.received,
				processed: webhookStats.processed,
				errors: webhookStats.errors
			},
			active: activeCount,
			waiting: waitingCount,
			queued: totalQueued
		});
		loadCommandPollBackoffRuntime().then(({ pruneStaleCommandPolls }) => {
			for (const [, state] of diagnosticSessionStates) pruneStaleCommandPolls(state);
		}).catch((err) => {
			diagnosticLogger.debug(`command-poll-backoff prune failed: ${String(err)}`);
		});
		for (const [, state] of diagnosticSessionStates) {
			const ageMs = now - state.lastActivity;
			if (state.state === "processing" && ageMs > stuckSessionWarnMs) logSessionStuck({
				sessionId: state.sessionId,
				sessionKey: state.sessionKey,
				state: state.state,
				ageMs
			});
		}
	}, 3e4);
	heartbeatInterval.unref?.();
}
function stopDiagnosticHeartbeat() {
	if (heartbeatInterval) {
		clearInterval(heartbeatInterval);
		heartbeatInterval = null;
	}
}
function getDiagnosticSessionStateCountForTest() {
	return getDiagnosticSessionStateCountForTest$1();
}
function resetDiagnosticStateForTest() {
	resetDiagnosticSessionStateForTest();
	resetDiagnosticActivityForTest();
	webhookStats.received = 0;
	webhookStats.processed = 0;
	webhookStats.errors = 0;
	webhookStats.lastReceived = 0;
	stopDiagnosticHeartbeat();
}
//#endregion
export { logRunAttempt as a, logToolLoopAction as c, logWebhookReceived as d, resetDiagnosticStateForTest as f, stopDiagnosticHeartbeat as h, logMessageQueued as i, logWebhookError as l, startDiagnosticHeartbeat as m, logActiveRuns as n, logSessionStateChange as o, resolveStuckSessionWarnMs as p, logMessageProcessed as r, logSessionStuck as s, getDiagnosticSessionStateCountForTest as t, logWebhookProcessed as u };
