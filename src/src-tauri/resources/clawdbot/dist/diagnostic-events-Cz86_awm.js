//#region src/infra/diagnostic-events.ts
const MAX_ASYNC_DIAGNOSTIC_EVENTS = 1e4;
const ASYNC_DIAGNOSTIC_EVENT_TYPES = new Set([
	"tool.execution.started",
	"tool.execution.completed",
	"tool.execution.error",
	"exec.process.completed",
	"model.call.started",
	"model.call.completed",
	"model.call.error",
	"log.record"
]);
function getDiagnosticEventsState() {
	const globalStore = globalThis;
	if (!globalStore.__openclawDiagnosticEventsState) globalStore.__openclawDiagnosticEventsState = {
		enabled: true,
		seq: 0,
		listeners: /* @__PURE__ */ new Set(),
		dispatchDepth: 0,
		asyncQueue: [],
		asyncDrainScheduled: false
	};
	return globalStore.__openclawDiagnosticEventsState;
}
function isDiagnosticsEnabled(config) {
	return config?.diagnostics?.enabled !== false;
}
function setDiagnosticsEnabledForProcess(enabled) {
	getDiagnosticEventsState().enabled = enabled;
}
function areDiagnosticsEnabledForProcess() {
	return getDiagnosticEventsState().enabled;
}
function dispatchDiagnosticEvent(state, enriched) {
	if (state.dispatchDepth > 100) {
		console.error(`[diagnostic-events] recursion guard tripped at depth=${state.dispatchDepth}, dropping type=${enriched.type}`);
		return;
	}
	state.dispatchDepth += 1;
	try {
		for (const listener of state.listeners) try {
			listener(enriched);
		} catch (err) {
			const errorMessage = err instanceof Error ? err.stack ?? err.message : typeof err === "string" ? err : String(err);
			console.error(`[diagnostic-events] listener error type=${enriched.type} seq=${enriched.seq}: ${errorMessage}`);
		}
	} finally {
		state.dispatchDepth -= 1;
	}
}
function scheduleAsyncDiagnosticDrain(state) {
	if (state.asyncDrainScheduled) return;
	state.asyncDrainScheduled = true;
	setImmediate(() => {
		state.asyncDrainScheduled = false;
		const batch = state.asyncQueue.splice(0);
		for (const event of batch) dispatchDiagnosticEvent(state, event);
		if (state.asyncQueue.length > 0) scheduleAsyncDiagnosticDrain(state);
	});
}
function emitDiagnosticEvent(event) {
	const state = getDiagnosticEventsState();
	if (!state.enabled) return;
	const enriched = {
		...event,
		seq: state.seq += 1,
		ts: Date.now()
	};
	if (ASYNC_DIAGNOSTIC_EVENT_TYPES.has(enriched.type)) {
		if (state.asyncQueue.length >= MAX_ASYNC_DIAGNOSTIC_EVENTS) return;
		state.asyncQueue.push(enriched);
		scheduleAsyncDiagnosticDrain(state);
		return;
	}
	dispatchDiagnosticEvent(state, enriched);
}
function onInternalDiagnosticEvent(listener) {
	const state = getDiagnosticEventsState();
	state.listeners.add(listener);
	return () => {
		state.listeners.delete(listener);
	};
}
function onDiagnosticEvent(listener) {
	return onInternalDiagnosticEvent((event) => {
		if (event.type === "log.record") return;
		listener(event);
	});
}
function resetDiagnosticEventsForTest() {
	const state = getDiagnosticEventsState();
	state.enabled = true;
	state.seq = 0;
	state.listeners.clear();
	state.dispatchDepth = 0;
	state.asyncQueue = [];
	state.asyncDrainScheduled = false;
}
//#endregion
export { onInternalDiagnosticEvent as a, onDiagnosticEvent as i, emitDiagnosticEvent as n, resetDiagnosticEventsForTest as o, isDiagnosticsEnabled as r, setDiagnosticsEnabledForProcess as s, areDiagnosticsEnabledForProcess as t };
