import { n as resolveGlobalSingleton } from "./global-singleton-B80lD-oJ.js";
import { i as logLaneEnqueue, r as logLaneDequeue, t as diagnosticLogger } from "./diagnostic-runtime-DOaqJdZf.js";
import { t as CommandLane } from "./lanes-CU7Ll8dR.js";
//#region src/process/command-queue.ts
/**
* Dedicated error type thrown when a queued command is rejected because
* its lane was cleared.  Callers that fire-and-forget enqueued tasks can
* catch (or ignore) this specific type to avoid unhandled-rejection noise.
*/
var CommandLaneClearedError = class extends Error {
	constructor(lane) {
		super(lane ? `Command lane "${lane}" cleared` : "Command lane cleared");
		this.name = "CommandLaneClearedError";
	}
};
/**
* Dedicated error type thrown when a new command is rejected because the
* gateway is currently draining for restart.
*/
var GatewayDrainingError = class extends Error {
	constructor() {
		super("Gateway is draining for restart; new tasks are not accepted");
		this.name = "GatewayDrainingError";
	}
};
function isExpectedNonErrorLaneFailure(err) {
	return err instanceof Error && err.name === "LiveSessionModelSwitchError";
}
/**
* Keep queue runtime state on globalThis so every bundled entry/chunk shares
* the same lanes, counters, and draining flag in production builds.
*/
const COMMAND_QUEUE_STATE_KEY = Symbol.for("openclaw.commandQueueState");
function getQueueState() {
	const state = resolveGlobalSingleton(COMMAND_QUEUE_STATE_KEY, () => ({
		gatewayDraining: false,
		lanes: /* @__PURE__ */ new Map(),
		activeTaskWaiters: /* @__PURE__ */ new Set(),
		nextTaskId: 1
	}));
	if (!state.activeTaskWaiters) state.activeTaskWaiters = /* @__PURE__ */ new Set();
	return state;
}
function normalizeLane(lane) {
	return lane.trim() || CommandLane.Main;
}
function getLaneDepth(state) {
	return state.queue.length + state.activeTaskIds.size;
}
function getLaneState(lane) {
	const queueState = getQueueState();
	const existing = queueState.lanes.get(lane);
	if (existing) return existing;
	const created = {
		lane,
		queue: [],
		activeTaskIds: /* @__PURE__ */ new Set(),
		maxConcurrent: 1,
		draining: false,
		generation: 0
	};
	queueState.lanes.set(lane, created);
	return created;
}
function completeTask(state, taskId, taskGeneration) {
	if (taskGeneration !== state.generation) return false;
	state.activeTaskIds.delete(taskId);
	return true;
}
function hasPendingActiveTasks(taskIds) {
	const queueState = getQueueState();
	for (const state of queueState.lanes.values()) for (const taskId of state.activeTaskIds) if (taskIds.has(taskId)) return true;
	return false;
}
function resolveActiveTaskWaiter(waiter, result) {
	if (!getQueueState().activeTaskWaiters.delete(waiter)) return;
	if (waiter.timeout) clearTimeout(waiter.timeout);
	waiter.resolve(result);
}
function notifyActiveTaskWaiters() {
	const queueState = getQueueState();
	for (const waiter of Array.from(queueState.activeTaskWaiters)) if (waiter.activeTaskIds.size === 0 || !hasPendingActiveTasks(waiter.activeTaskIds)) resolveActiveTaskWaiter(waiter, { drained: true });
}
function drainLane(lane) {
	const state = getLaneState(lane);
	if (state.draining) {
		if (state.activeTaskIds.size === 0 && state.queue.length > 0) diagnosticLogger.warn(`drainLane blocked: lane=${lane} draining=true active=0 queue=${state.queue.length}`);
		return;
	}
	state.draining = true;
	const pump = () => {
		try {
			while (state.activeTaskIds.size < state.maxConcurrent && state.queue.length > 0) {
				const entry = state.queue.shift();
				const waitedMs = Date.now() - entry.enqueuedAt;
				if (waitedMs >= entry.warnAfterMs) {
					try {
						entry.onWait?.(waitedMs, state.queue.length);
					} catch (err) {
						diagnosticLogger.error(`lane onWait callback failed: lane=${lane} error="${String(err)}"`);
					}
					diagnosticLogger.warn(`lane wait exceeded: lane=${lane} waitedMs=${waitedMs} queueAhead=${state.queue.length}`);
				}
				logLaneDequeue(lane, waitedMs, state.queue.length);
				const taskId = getQueueState().nextTaskId++;
				const taskGeneration = state.generation;
				state.activeTaskIds.add(taskId);
				(async () => {
					const startTime = Date.now();
					try {
						const result = await entry.task();
						if (completeTask(state, taskId, taskGeneration)) {
							notifyActiveTaskWaiters();
							diagnosticLogger.debug(`lane task done: lane=${lane} durationMs=${Date.now() - startTime} active=${state.activeTaskIds.size} queued=${state.queue.length}`);
							pump();
						}
						entry.resolve(result);
					} catch (err) {
						const completedCurrentGeneration = completeTask(state, taskId, taskGeneration);
						const isProbeLane = lane.startsWith("auth-probe:") || lane.startsWith("session:probe-");
						if (!isProbeLane && !isExpectedNonErrorLaneFailure(err)) diagnosticLogger.error(`lane task error: lane=${lane} durationMs=${Date.now() - startTime} error="${String(err)}"`);
						else if (!isProbeLane) diagnosticLogger.debug(`lane task interrupted: lane=${lane} durationMs=${Date.now() - startTime} reason="${String(err)}"`);
						if (completedCurrentGeneration) {
							notifyActiveTaskWaiters();
							pump();
						}
						entry.reject(err);
					}
				})();
			}
		} finally {
			state.draining = false;
		}
	};
	pump();
}
/**
* Mark gateway as draining for restart so new enqueues fail fast with
* `GatewayDrainingError` instead of being silently killed on shutdown.
*/
function markGatewayDraining() {
	getQueueState().gatewayDraining = true;
}
function setCommandLaneConcurrency(lane, maxConcurrent) {
	const cleaned = normalizeLane(lane);
	const state = getLaneState(cleaned);
	state.maxConcurrent = Math.max(1, Math.floor(maxConcurrent));
	drainLane(cleaned);
}
function enqueueCommandInLane(lane, task, opts) {
	if (getQueueState().gatewayDraining) return Promise.reject(new GatewayDrainingError());
	const cleaned = normalizeLane(lane);
	const warnAfterMs = opts?.warnAfterMs ?? 2e3;
	const state = getLaneState(cleaned);
	return new Promise((resolve, reject) => {
		state.queue.push({
			task: () => task(),
			resolve: (value) => resolve(value),
			reject,
			enqueuedAt: Date.now(),
			warnAfterMs,
			onWait: opts?.onWait
		});
		logLaneEnqueue(cleaned, getLaneDepth(state));
		drainLane(cleaned);
	});
}
function getQueueSize(lane = CommandLane.Main) {
	const resolved = normalizeLane(lane);
	const state = getQueueState().lanes.get(resolved);
	if (!state) return 0;
	return getLaneDepth(state);
}
function getTotalQueueSize() {
	let total = 0;
	for (const s of getQueueState().lanes.values()) total += getLaneDepth(s);
	return total;
}
function clearCommandLane(lane = CommandLane.Main) {
	const cleaned = normalizeLane(lane);
	const state = getQueueState().lanes.get(cleaned);
	if (!state) return 0;
	const removed = state.queue.length;
	const pending = state.queue.splice(0);
	for (const entry of pending) entry.reject(new CommandLaneClearedError(cleaned));
	return removed;
}
/**
* Reset all lane runtime state to idle. Used after SIGUSR1 in-process
* restarts where interrupted tasks' finally blocks may not run, leaving
* stale active task IDs that permanently block new work from draining.
*
* Bumps lane generation and clears execution counters so stale completions
* from old in-flight tasks are ignored. Queued entries are intentionally
* preserved — they represent pending user work that should still execute
* after restart.
*
* After resetting, drains any lanes that still have queued entries so
* preserved work is pumped immediately rather than waiting for a future
* `enqueueCommandInLane()` call (which may never come).
*/
function resetAllLanes() {
	const queueState = getQueueState();
	queueState.gatewayDraining = false;
	const lanesToDrain = [];
	for (const state of queueState.lanes.values()) {
		state.generation += 1;
		state.activeTaskIds.clear();
		state.draining = false;
		if (state.queue.length > 0) lanesToDrain.push(state.lane);
	}
	for (const lane of lanesToDrain) drainLane(lane);
	notifyActiveTaskWaiters();
}
/**
* Returns the total number of actively executing tasks across all lanes
* (excludes queued-but-not-started entries).
*/
function getActiveTaskCount() {
	const queueState = getQueueState();
	let total = 0;
	for (const s of queueState.lanes.values()) total += s.activeTaskIds.size;
	return total;
}
/**
* Wait for all currently active tasks across all lanes to finish.
* Polls at a short interval; resolves when no tasks are active or
* when `timeoutMs` elapses (whichever comes first).
*
* New tasks enqueued after this call are ignored — only tasks that are
* already executing are waited on.
*/
function waitForActiveTasks(timeoutMs) {
	const queueState = getQueueState();
	const activeAtStart = /* @__PURE__ */ new Set();
	for (const state of queueState.lanes.values()) for (const taskId of state.activeTaskIds) activeAtStart.add(taskId);
	if (activeAtStart.size === 0) return Promise.resolve({ drained: true });
	if (timeoutMs <= 0) return Promise.resolve({ drained: false });
	return new Promise((resolve) => {
		const waiter = {
			activeTaskIds: activeAtStart,
			resolve
		};
		waiter.timeout = setTimeout(() => {
			resolveActiveTaskWaiter(waiter, { drained: false });
		}, timeoutMs);
		queueState.activeTaskWaiters.add(waiter);
		notifyActiveTaskWaiters();
	});
}
//#endregion
export { getActiveTaskCount as a, markGatewayDraining as c, waitForActiveTasks as d, enqueueCommandInLane as i, resetAllLanes as l, GatewayDrainingError as n, getQueueSize as o, clearCommandLane as r, getTotalQueueSize as s, CommandLaneClearedError as t, setCommandLaneConcurrency as u };
