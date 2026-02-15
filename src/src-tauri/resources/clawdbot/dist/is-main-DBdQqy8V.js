import path from "node:path";
import fs from "node:fs";

//#region src/infra/is-main.ts
function normalizePathCandidate(candidate, cwd) {
	if (!candidate) return;
	const resolved = path.resolve(cwd, candidate);
	try {
		return fs.realpathSync.native(resolved);
	} catch {
		return resolved;
	}
}
function isMainModule({ currentFile, argv = process.argv, env = process.env, cwd = process.cwd() }) {
	const normalizedCurrent = normalizePathCandidate(currentFile, cwd);
	const normalizedArgv1 = normalizePathCandidate(argv[1], cwd);
	if (normalizedCurrent && normalizedArgv1 && normalizedCurrent === normalizedArgv1) return true;
	const normalizedPmExecPath = normalizePathCandidate(env.pm_exec_path, cwd);
	if (normalizedCurrent && normalizedPmExecPath && normalizedCurrent === normalizedPmExecPath) return true;
	if (normalizedCurrent && normalizedArgv1 && path.basename(normalizedCurrent) === path.basename(normalizedArgv1)) return true;
	return false;
}

//#endregion
export { isMainModule as t };