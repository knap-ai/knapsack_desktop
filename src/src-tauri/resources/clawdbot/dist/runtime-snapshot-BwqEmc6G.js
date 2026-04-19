//#region src/config/runtime-snapshot.ts
let runtimeConfigSnapshot = null;
let runtimeConfigSourceSnapshot = null;
let runtimeConfigSnapshotRefreshHandler = null;
const runtimeConfigWriteListeners = /* @__PURE__ */ new Set();
function setRuntimeConfigSnapshot(config, sourceConfig) {
	runtimeConfigSnapshot = config;
	runtimeConfigSourceSnapshot = sourceConfig ?? null;
}
function resetConfigRuntimeState() {
	runtimeConfigSnapshot = null;
	runtimeConfigSourceSnapshot = null;
}
function clearRuntimeConfigSnapshot() {
	resetConfigRuntimeState();
}
function getRuntimeConfigSnapshot() {
	return runtimeConfigSnapshot;
}
function getRuntimeConfigSourceSnapshot() {
	return runtimeConfigSourceSnapshot;
}
function setRuntimeConfigSnapshotRefreshHandler(refreshHandler) {
	runtimeConfigSnapshotRefreshHandler = refreshHandler;
}
function getRuntimeConfigSnapshotRefreshHandler() {
	return runtimeConfigSnapshotRefreshHandler;
}
function registerRuntimeConfigWriteListener(listener) {
	runtimeConfigWriteListeners.add(listener);
	return () => {
		runtimeConfigWriteListeners.delete(listener);
	};
}
function notifyRuntimeConfigWriteListeners(event) {
	for (const listener of runtimeConfigWriteListeners) try {
		listener(event);
	} catch {}
}
function loadPinnedRuntimeConfig(loadFresh) {
	if (runtimeConfigSnapshot) return runtimeConfigSnapshot;
	const config = loadFresh();
	setRuntimeConfigSnapshot(config);
	return getRuntimeConfigSnapshot() ?? config;
}
async function finalizeRuntimeSnapshotWrite(params) {
	const refreshHandler = getRuntimeConfigSnapshotRefreshHandler();
	if (refreshHandler) try {
		if (await refreshHandler.refresh({ sourceConfig: params.nextSourceConfig })) {
			params.notifyCommittedWrite();
			return;
		}
	} catch (error) {
		try {
			refreshHandler.clearOnRefreshFailure?.();
		} catch {}
		throw params.createRefreshError(params.formatRefreshError(error), error);
	}
	if (params.hadBothSnapshots) {
		setRuntimeConfigSnapshot(params.loadFreshConfig(), params.nextSourceConfig);
		params.notifyCommittedWrite();
		return;
	}
	if (params.hadRuntimeSnapshot) {
		setRuntimeConfigSnapshot(params.loadFreshConfig());
		params.notifyCommittedWrite();
		return;
	}
	setRuntimeConfigSnapshot(params.loadFreshConfig());
	params.notifyCommittedWrite();
}
//#endregion
export { getRuntimeConfigSourceSnapshot as a, registerRuntimeConfigWriteListener as c, setRuntimeConfigSnapshotRefreshHandler as d, getRuntimeConfigSnapshotRefreshHandler as i, resetConfigRuntimeState as l, finalizeRuntimeSnapshotWrite as n, loadPinnedRuntimeConfig as o, getRuntimeConfigSnapshot as r, notifyRuntimeConfigWriteListeners as s, clearRuntimeConfigSnapshot as t, setRuntimeConfigSnapshot as u };
