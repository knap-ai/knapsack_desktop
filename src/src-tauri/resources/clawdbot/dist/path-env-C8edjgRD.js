import { n as isTruthyEnvValue } from "./entry.js";
import { n as resolveBrewPathDirs } from "./brew-BHpoAcHk.js";
import path from "node:path";
import os from "node:os";
import fs from "node:fs";

//#region src/infra/path-env.ts
function isExecutable(filePath) {
	try {
		fs.accessSync(filePath, fs.constants.X_OK);
		return true;
	} catch {
		return false;
	}
}
function isDirectory(dirPath) {
	try {
		return fs.statSync(dirPath).isDirectory();
	} catch {
		return false;
	}
}
function mergePath(params) {
	const partsExisting = params.existing.split(path.delimiter).map((part) => part.trim()).filter(Boolean);
	const partsPrepend = params.prepend.map((part) => part.trim()).filter(Boolean);
	const seen = /* @__PURE__ */ new Set();
	const merged = [];
	for (const part of [...partsPrepend, ...partsExisting]) if (!seen.has(part)) {
		seen.add(part);
		merged.push(part);
	}
	return merged.join(path.delimiter);
}
function candidateBinDirs(opts) {
	const execPath = opts.execPath ?? process.execPath;
	const cwd = opts.cwd ?? process.cwd();
	const homeDir = opts.homeDir ?? os.homedir();
	const platform = opts.platform ?? process.platform;
	const candidates = [];
	try {
		const execDir = path.dirname(execPath);
		if (isExecutable(path.join(execDir, "openclaw"))) candidates.push(execDir);
	} catch {}
	const localBinDir = path.join(cwd, "node_modules", ".bin");
	if (isExecutable(path.join(localBinDir, "openclaw"))) candidates.push(localBinDir);
	const miseDataDir = process.env.MISE_DATA_DIR ?? path.join(homeDir, ".local", "share", "mise");
	const miseShims = path.join(miseDataDir, "shims");
	if (isDirectory(miseShims)) candidates.push(miseShims);
	candidates.push(...resolveBrewPathDirs({ homeDir }));
	if (platform === "darwin") candidates.push(path.join(homeDir, "Library", "pnpm"));
	if (process.env.XDG_BIN_HOME) candidates.push(process.env.XDG_BIN_HOME);
	candidates.push(path.join(homeDir, ".local", "bin"));
	candidates.push(path.join(homeDir, ".local", "share", "pnpm"));
	candidates.push(path.join(homeDir, ".bun", "bin"));
	candidates.push(path.join(homeDir, ".yarn", "bin"));
	candidates.push("/opt/homebrew/bin", "/usr/local/bin", "/usr/bin", "/bin");
	return candidates.filter(isDirectory);
}
/**
* Best-effort PATH bootstrap so skills that require the `openclaw` CLI can run
* under launchd/minimal environments (and inside the macOS app bundle).
*/
function ensureOpenClawCliOnPath(opts = {}) {
	if (isTruthyEnvValue(process.env.OPENCLAW_PATH_BOOTSTRAPPED)) return;
	process.env.OPENCLAW_PATH_BOOTSTRAPPED = "1";
	const existing = opts.pathEnv ?? process.env.PATH ?? "";
	const prepend = candidateBinDirs(opts);
	if (prepend.length === 0) return;
	const merged = mergePath({
		existing,
		prepend
	});
	if (merged) process.env.PATH = merged;
}

//#endregion
export { ensureOpenClawCliOnPath as t };