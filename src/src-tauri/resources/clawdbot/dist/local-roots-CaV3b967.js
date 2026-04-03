import { n as resolvePreferredOpenClawTmpDir } from "./tmp-openclaw-dir-Day5KPIY.js";
import { _ as resolveStateDir } from "./paths-CD8i0MSg.js";
import { p as resolveAgentWorkspaceDir } from "./agent-scope-CYXg_wTS.js";
import path from "node:path";
//#region src/media/local-roots.ts
let cachedPreferredTmpDir;
function resolveCachedPreferredTmpDir() {
	if (!cachedPreferredTmpDir) cachedPreferredTmpDir = resolvePreferredOpenClawTmpDir();
	return cachedPreferredTmpDir;
}
function buildMediaLocalRoots(stateDir, options = {}) {
	const resolvedStateDir = path.resolve(stateDir);
	return [
		options.preferredTmpDir ?? resolveCachedPreferredTmpDir(),
		path.join(resolvedStateDir, "media"),
		path.join(resolvedStateDir, "workspace"),
		path.join(resolvedStateDir, "sandboxes")
	];
}
function getDefaultMediaLocalRoots() {
	return buildMediaLocalRoots(resolveStateDir());
}
function getAgentScopedMediaLocalRoots(cfg, agentId) {
	const roots = buildMediaLocalRoots(resolveStateDir());
	if (!agentId?.trim()) return roots;
	const workspaceDir = resolveAgentWorkspaceDir(cfg, agentId);
	if (!workspaceDir) return roots;
	const normalizedWorkspaceDir = path.resolve(workspaceDir);
	if (!roots.includes(normalizedWorkspaceDir)) roots.push(normalizedWorkspaceDir);
	return roots;
}
/**
* @deprecated Kept for plugin-sdk compatibility. Media sources no longer widen allowed roots.
*/
function appendLocalMediaParentRoots(roots, _mediaSources) {
	return Array.from(new Set(roots.map((root) => path.resolve(root))));
}
function getAgentScopedMediaLocalRootsForSources({ cfg, agentId, mediaSources: _mediaSources }) {
	return getAgentScopedMediaLocalRoots(cfg, agentId);
}
//#endregion
export { getDefaultMediaLocalRoots as i, getAgentScopedMediaLocalRoots as n, getAgentScopedMediaLocalRootsForSources as r, appendLocalMediaParentRoots as t };
