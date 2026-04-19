import { m as resolveUserPath } from "./utils-D5DtWkEu.js";
import { t as resolveOpenClawAgentDir } from "./agent-paths-JWlHCT48.js";
import fs from "node:fs";
import path from "node:path";
//#region src/agents/auth-profiles/path-constants.ts
const AUTH_PROFILE_FILENAME = "auth-profiles.json";
const AUTH_STATE_FILENAME = "auth-state.json";
const LEGACY_AUTH_FILENAME = "auth.json";
//#endregion
//#region src/agents/auth-profiles/path-resolve.ts
function resolveAuthStorePath(agentDir) {
	const resolved = resolveUserPath(agentDir ?? resolveOpenClawAgentDir());
	return path.join(resolved, AUTH_PROFILE_FILENAME);
}
function resolveLegacyAuthStorePath(agentDir) {
	const resolved = resolveUserPath(agentDir ?? resolveOpenClawAgentDir());
	return path.join(resolved, LEGACY_AUTH_FILENAME);
}
function resolveAuthStatePath(agentDir) {
	const resolved = resolveUserPath(agentDir ?? resolveOpenClawAgentDir());
	return path.join(resolved, AUTH_STATE_FILENAME);
}
function resolveAuthStorePathForDisplay(agentDir) {
	const pathname = resolveAuthStorePath(agentDir);
	return pathname.startsWith("~") ? pathname : resolveUserPath(pathname);
}
function resolveAuthStatePathForDisplay(agentDir) {
	const pathname = resolveAuthStatePath(agentDir);
	return pathname.startsWith("~") ? pathname : resolveUserPath(pathname);
}
//#endregion
//#region src/agents/auth-profiles/runtime-snapshots.ts
const runtimeAuthStoreSnapshots = /* @__PURE__ */ new Map();
function resolveRuntimeStoreKey(agentDir) {
	return resolveAuthStorePath(agentDir);
}
function cloneAuthProfileStore(store) {
	return structuredClone(store);
}
function getRuntimeAuthProfileStoreSnapshot(agentDir) {
	const store = runtimeAuthStoreSnapshots.get(resolveRuntimeStoreKey(agentDir));
	return store ? cloneAuthProfileStore(store) : void 0;
}
function hasRuntimeAuthProfileStoreSnapshot(agentDir) {
	return runtimeAuthStoreSnapshots.has(resolveRuntimeStoreKey(agentDir));
}
function hasAnyRuntimeAuthProfileStoreSource(agentDir) {
	const requestedStore = getRuntimeAuthProfileStoreSnapshot(agentDir);
	if (requestedStore && Object.keys(requestedStore.profiles).length > 0) return true;
	if (!agentDir) return false;
	const mainStore = getRuntimeAuthProfileStoreSnapshot();
	return Boolean(mainStore && Object.keys(mainStore.profiles).length > 0);
}
function replaceRuntimeAuthProfileStoreSnapshots(entries) {
	runtimeAuthStoreSnapshots.clear();
	for (const entry of entries) runtimeAuthStoreSnapshots.set(resolveRuntimeStoreKey(entry.agentDir), cloneAuthProfileStore(entry.store));
}
function clearRuntimeAuthProfileStoreSnapshots() {
	runtimeAuthStoreSnapshots.clear();
}
function setRuntimeAuthProfileStoreSnapshot(store, agentDir) {
	runtimeAuthStoreSnapshots.set(resolveRuntimeStoreKey(agentDir), cloneAuthProfileStore(store));
}
//#endregion
//#region src/agents/auth-profiles/source-check.ts
function hasStoredAuthProfileFiles(agentDir) {
	return fs.existsSync(resolveAuthStorePath(agentDir)) || fs.existsSync(resolveAuthStatePath(agentDir)) || fs.existsSync(resolveLegacyAuthStorePath(agentDir));
}
function hasAnyAuthProfileStoreSource(agentDir) {
	if (hasAnyRuntimeAuthProfileStoreSource(agentDir)) return true;
	if (hasStoredAuthProfileFiles(agentDir)) return true;
	const authPath = resolveAuthStorePath(agentDir);
	const mainAuthPath = resolveAuthStorePath();
	if (agentDir && authPath !== mainAuthPath && hasStoredAuthProfileFiles(void 0)) return true;
	return false;
}
//#endregion
export { replaceRuntimeAuthProfileStoreSnapshots as a, resolveAuthStatePathForDisplay as c, resolveLegacyAuthStorePath as d, hasRuntimeAuthProfileStoreSnapshot as i, resolveAuthStorePath as l, clearRuntimeAuthProfileStoreSnapshots as n, setRuntimeAuthProfileStoreSnapshot as o, getRuntimeAuthProfileStoreSnapshot as r, resolveAuthStatePath as s, hasAnyAuthProfileStoreSource as t, resolveAuthStorePathForDisplay as u };
