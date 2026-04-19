import { h as loadWorkspaceBootstrapFiles } from "./workspace-hhTlRYqM.js";
//#region src/agents/bootstrap-cache.ts
const cache = /* @__PURE__ */ new Map();
async function getOrLoadBootstrapFiles(params) {
	const existing = cache.get(params.sessionKey);
	if (existing) return existing;
	const files = await loadWorkspaceBootstrapFiles(params.workspaceDir);
	cache.set(params.sessionKey, files);
	return files;
}
function clearBootstrapSnapshot(sessionKey) {
	cache.delete(sessionKey);
}
function clearBootstrapSnapshotOnSessionRollover(params) {
	if (!params.sessionKey || !params.previousSessionId) return;
	clearBootstrapSnapshot(params.sessionKey);
}
//#endregion
export { clearBootstrapSnapshotOnSessionRollover as n, getOrLoadBootstrapFiles as r, clearBootstrapSnapshot as t };
