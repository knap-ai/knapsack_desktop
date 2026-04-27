//#region src/config/runtime-snapshot.ts
let runtimeConfigSnapshot = null;
let runtimeConfigSourceSnapshot = null;
let runtimeConfigSnapshotRefreshHandler = null;
const runtimeConfigWriteListeners = /* @__PURE__ */ new Set();
function stableConfigStringify(value) {
	if (value === null || typeof value !== "object") return JSON.stringify(value) ?? "null";
	if (Array.isArray(value)) return `[${value.map((entry) => stableConfigStringify(entry)).join(",")}]`;
	const record = value;
	return `{${Object.keys(record).toSorted().map((key) => `${JSON.stringify(key)}:${stableConfigStringify(record[key])}`).join(",")}}`;
}
function configSnapshotsMatch(left, right) {
	if (left === right) return true;
	try {
		return stableConfigStringify(left) === stableConfigStringify(right);
	} catch {
		return false;
	}
}
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
function selectApplicableRuntimeConfig(params) {
	const runtimeConfig = params.runtimeConfig ?? null;
	if (!runtimeConfig) return params.inputConfig;
	const inputConfig = params.inputConfig;
	if (!inputConfig) return runtimeConfig;
	if (inputConfig === runtimeConfig) return inputConfig;
	const runtimeSourceConfig = params.runtimeSourceConfig ?? null;
	if (!runtimeSourceConfig) return runtimeConfig;
	if (configSnapshotsMatch(inputConfig, runtimeSourceConfig)) return runtimeConfig;
	return inputConfig;
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
export { getRuntimeConfigSourceSnapshot as a, registerRuntimeConfigWriteListener as c, setRuntimeConfigSnapshot as d, setRuntimeConfigSnapshotRefreshHandler as f, getRuntimeConfigSnapshotRefreshHandler as i, resetConfigRuntimeState as l, finalizeRuntimeSnapshotWrite as n, loadPinnedRuntimeConfig as o, getRuntimeConfigSnapshot as r, notifyRuntimeConfigWriteListeners as s, clearRuntimeConfigSnapshot as t, selectApplicableRuntimeConfig as u };
