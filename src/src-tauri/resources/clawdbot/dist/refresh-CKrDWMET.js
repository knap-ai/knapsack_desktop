import { s as normalizeOptionalString } from "./string-coerce-BUSzWgUA.js";
import { m as resolveUserPath, t as CONFIG_DIR } from "./utils-D5DtWkEu.js";
import { t as createSubsystemLogger } from "./subsystem-Cgmckbux.js";
import { v as bumpSkillsSnapshotVersion, x as setSkillsChangeListenerErrorHandler } from "./exec-defaults-DiCDZt_n.js";
import { u as resolvePluginSkillDirs } from "./skills-Cwx5TftI.js";
import path from "node:path";
import os from "node:os";
import chokidar from "chokidar";
//#region src/agents/skills/refresh.ts
const log = createSubsystemLogger("gateway/skills");
const watchers = /* @__PURE__ */ new Map();
setSkillsChangeListenerErrorHandler((err) => {
	log.warn(`skills change listener failed: ${String(err)}`);
});
const DEFAULT_SKILLS_WATCH_IGNORED = [
	/(^|[\\/])\.git([\\/]|$)/,
	/(^|[\\/])node_modules([\\/]|$)/,
	/(^|[\\/])dist([\\/]|$)/,
	/(^|[\\/])\.venv([\\/]|$)/,
	/(^|[\\/])venv([\\/]|$)/,
	/(^|[\\/])__pycache__([\\/]|$)/,
	/(^|[\\/])\.mypy_cache([\\/]|$)/,
	/(^|[\\/])\.pytest_cache([\\/]|$)/,
	/(^|[\\/])build([\\/]|$)/,
	/(^|[\\/])\.cache([\\/]|$)/
];
function resolveWatchPaths(workspaceDir, config) {
	const paths = [];
	if (workspaceDir.trim()) {
		paths.push(path.join(workspaceDir, "skills"));
		paths.push(path.join(workspaceDir, ".agents", "skills"));
	}
	paths.push(path.join(CONFIG_DIR, "skills"));
	paths.push(path.join(os.homedir(), ".agents", "skills"));
	const extraDirs = (config?.skills?.load?.extraDirs ?? []).map((d) => normalizeOptionalString(d) ?? "").filter(Boolean).map((dir) => resolveUserPath(dir));
	paths.push(...extraDirs);
	const pluginSkillDirs = resolvePluginSkillDirs({
		workspaceDir,
		config
	});
	paths.push(...pluginSkillDirs);
	return paths;
}
function toWatchGlobRoot(raw) {
	return raw.replaceAll("\\", "/").replace(/\/+$/, "");
}
function resolveWatchTargets(workspaceDir, config) {
	const targets = /* @__PURE__ */ new Set();
	for (const root of resolveWatchPaths(workspaceDir, config)) {
		const globRoot = toWatchGlobRoot(root);
		targets.add(`${globRoot}/SKILL.md`);
		targets.add(`${globRoot}/*/SKILL.md`);
	}
	return Array.from(targets).toSorted();
}
function ensureSkillsWatcher(params) {
	const workspaceDir = params.workspaceDir.trim();
	if (!workspaceDir) return;
	const watchEnabled = params.config?.skills?.load?.watch !== false;
	const debounceMsRaw = params.config?.skills?.load?.watchDebounceMs;
	const debounceMs = typeof debounceMsRaw === "number" && Number.isFinite(debounceMsRaw) ? Math.max(0, debounceMsRaw) : 250;
	const existing = watchers.get(workspaceDir);
	if (!watchEnabled) {
		if (existing) {
			watchers.delete(workspaceDir);
			if (existing.timer) clearTimeout(existing.timer);
			existing.watcher.close().catch(() => {});
		}
		return;
	}
	const watchTargets = resolveWatchTargets(workspaceDir, params.config);
	const pathsKey = watchTargets.join("|");
	if (existing && existing.pathsKey === pathsKey && existing.debounceMs === debounceMs) return;
	if (existing) {
		watchers.delete(workspaceDir);
		if (existing.timer) clearTimeout(existing.timer);
		existing.watcher.close().catch(() => {});
	}
	const watcher = chokidar.watch(watchTargets, {
		ignoreInitial: true,
		awaitWriteFinish: {
			stabilityThreshold: debounceMs,
			pollInterval: 100
		},
		ignored: DEFAULT_SKILLS_WATCH_IGNORED
	});
	const state = {
		watcher,
		pathsKey,
		debounceMs
	};
	const schedule = (changedPath) => {
		state.pendingPath = changedPath ?? state.pendingPath;
		if (state.timer) clearTimeout(state.timer);
		state.timer = setTimeout(() => {
			const pendingPath = state.pendingPath;
			state.pendingPath = void 0;
			state.timer = void 0;
			bumpSkillsSnapshotVersion({
				workspaceDir,
				reason: "watch",
				changedPath: pendingPath
			});
		}, debounceMs);
	};
	watcher.on("add", (p) => schedule(p));
	watcher.on("change", (p) => schedule(p));
	watcher.on("unlink", (p) => schedule(p));
	watcher.on("error", (err) => {
		log.warn(`skills watcher error (${workspaceDir}): ${String(err)}`);
	});
	watchers.set(workspaceDir, state);
}
//#endregion
export { ensureSkillsWatcher as t };
