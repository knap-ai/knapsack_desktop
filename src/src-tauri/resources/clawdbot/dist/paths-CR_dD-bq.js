import { n as resolvePreferredOpenClawTmpDir } from "./tmp-openclaw-dir-CoGSA-7K.js";
import { o as isNotFoundPathError, s as isPathInside } from "./boundary-path-C2iMx2xR.js";
import { s as openFileWithinRoot, t as SafeOpenError } from "./fs-safe-CezDxq3P.js";
import "./browser-config-support-7Tw_KuVs.js";
import "./browser-security-runtime-BrD1-zTV.js";
import path from "node:path";
import fs from "node:fs/promises";
//#region extensions/browser/src/browser/constants.ts
const DEFAULT_OPENCLAW_BROWSER_ENABLED = true;
const DEFAULT_BROWSER_EVALUATE_ENABLED = true;
const DEFAULT_OPENCLAW_BROWSER_COLOR = "#FF4500";
const DEFAULT_OPENCLAW_BROWSER_PROFILE_NAME = "openclaw";
const DEFAULT_BROWSER_DEFAULT_PROFILE_NAME = "openclaw";
const DEFAULT_BROWSER_ACTION_TIMEOUT_MS = 6e4;
const DEFAULT_BROWSER_SCREENSHOT_TIMEOUT_MS = 2e4;
const DEFAULT_AI_SNAPSHOT_MAX_CHARS = 4e4;
const DEFAULT_AI_SNAPSHOT_EFFICIENT_MAX_CHARS = 8e3;
//#endregion
//#region extensions/browser/src/browser/paths.ts
const DEFAULT_FALLBACK_BROWSER_TMP_DIR = "/tmp/openclaw";
function canUseNodeFs() {
	const getBuiltinModule = process.getBuiltinModule;
	if (typeof getBuiltinModule !== "function") return false;
	try {
		return getBuiltinModule("fs") !== void 0;
	} catch {
		return false;
	}
}
const DEFAULT_BROWSER_TMP_DIR = canUseNodeFs() ? resolvePreferredOpenClawTmpDir() : DEFAULT_FALLBACK_BROWSER_TMP_DIR;
const DEFAULT_TRACE_DIR = DEFAULT_BROWSER_TMP_DIR;
const DEFAULT_DOWNLOAD_DIR = path.join(DEFAULT_BROWSER_TMP_DIR, "downloads");
const DEFAULT_UPLOAD_DIR = path.join(DEFAULT_BROWSER_TMP_DIR, "uploads");
function invalidPath(scopeLabel) {
	return {
		ok: false,
		error: `Invalid path: must stay within ${scopeLabel}`
	};
}
async function resolveRealPathIfExists(targetPath) {
	try {
		return await fs.realpath(targetPath);
	} catch {
		return;
	}
}
async function resolveTrustedRootRealPath(rootDir) {
	try {
		const rootLstat = await fs.lstat(rootDir);
		if (!rootLstat.isDirectory() || rootLstat.isSymbolicLink()) return;
		return await fs.realpath(rootDir);
	} catch {
		return;
	}
}
async function validateCanonicalPathWithinRoot(params) {
	try {
		const candidateLstat = await fs.lstat(params.candidatePath);
		if (candidateLstat.isSymbolicLink()) return "invalid";
		if (params.expect === "directory" && !candidateLstat.isDirectory()) return "invalid";
		if (params.expect === "file" && !candidateLstat.isFile()) return "invalid";
		if (params.expect === "file" && candidateLstat.nlink > 1) return "invalid";
		const candidateRealPath = await fs.realpath(params.candidatePath);
		return isPathInside(params.rootRealPath, candidateRealPath) ? "ok" : "invalid";
	} catch (err) {
		return isNotFoundPathError(err) ? "not-found" : "invalid";
	}
}
function resolvePathWithinRoot(params) {
	const root = path.resolve(params.rootDir);
	const raw = params.requestedPath.trim();
	if (!raw) {
		if (!params.defaultFileName) return {
			ok: false,
			error: "path is required"
		};
		return {
			ok: true,
			path: path.join(root, params.defaultFileName)
		};
	}
	const resolved = path.resolve(root, raw);
	const rel = path.relative(root, resolved);
	if (!rel || rel.startsWith("..") || path.isAbsolute(rel)) return {
		ok: false,
		error: `Invalid path: must stay within ${params.scopeLabel}`
	};
	return {
		ok: true,
		path: resolved
	};
}
async function resolveWritablePathWithinRoot(params) {
	const lexical = resolvePathWithinRoot(params);
	if (!lexical.ok) return lexical;
	const rootRealPath = await resolveTrustedRootRealPath(path.resolve(params.rootDir));
	if (!rootRealPath) return invalidPath(params.scopeLabel);
	const requestedPath = lexical.path;
	if (await validateCanonicalPathWithinRoot({
		rootRealPath,
		candidatePath: path.dirname(requestedPath),
		expect: "directory"
	}) !== "ok") return invalidPath(params.scopeLabel);
	if (await validateCanonicalPathWithinRoot({
		rootRealPath,
		candidatePath: requestedPath,
		expect: "file"
	}) === "invalid") return invalidPath(params.scopeLabel);
	return lexical;
}
async function resolveExistingPathsWithinRoot(params) {
	return await resolveCheckedPathsWithinRoot(params, true);
}
async function resolveStrictExistingPathsWithinRoot(params) {
	return await resolveCheckedPathsWithinRoot(params, false);
}
async function resolveCheckedPathsWithinRoot(params, allowMissingFallback) {
	const rootDir = path.resolve(params.rootDir);
	const rootRealPath = await resolveRealPathIfExists(rootDir);
	const isInRoot = (relativePath) => Boolean(relativePath) && !relativePath.startsWith("..") && !path.isAbsolute(relativePath);
	const resolveExistingRelativePath = async (requestedPath) => {
		const raw = requestedPath.trim();
		const lexicalPathResult = resolvePathWithinRoot({
			rootDir,
			requestedPath,
			scopeLabel: params.scopeLabel
		});
		if (lexicalPathResult.ok) return {
			ok: true,
			relativePath: path.relative(rootDir, lexicalPathResult.path),
			fallbackPath: lexicalPathResult.path
		};
		if (!rootRealPath || !raw || !path.isAbsolute(raw)) return lexicalPathResult;
		try {
			const resolvedExistingPath = await fs.realpath(raw);
			const relativePath = path.relative(rootRealPath, resolvedExistingPath);
			if (!isInRoot(relativePath)) return lexicalPathResult;
			return {
				ok: true,
				relativePath,
				fallbackPath: resolvedExistingPath
			};
		} catch {
			return lexicalPathResult;
		}
	};
	const resolvedPaths = [];
	for (const raw of params.requestedPaths) {
		const pathResult = await resolveExistingRelativePath(raw);
		if (!pathResult.ok) return {
			ok: false,
			error: pathResult.error
		};
		let opened;
		try {
			opened = await openFileWithinRoot({
				rootDir,
				relativePath: pathResult.relativePath
			});
			resolvedPaths.push(opened.realPath);
		} catch (err) {
			if (allowMissingFallback && err instanceof SafeOpenError && err.code === "not-found") {
				resolvedPaths.push(pathResult.fallbackPath);
				continue;
			}
			if (err instanceof SafeOpenError && err.code === "outside-workspace") return {
				ok: false,
				error: `File is outside ${params.scopeLabel}`
			};
			return {
				ok: false,
				error: `Invalid path: must stay within ${params.scopeLabel} and be a regular non-symlink file`
			};
		} finally {
			await opened?.handle.close().catch(() => {});
		}
	}
	return {
		ok: true,
		paths: resolvedPaths
	};
}
//#endregion
export { resolveStrictExistingPathsWithinRoot as a, DEFAULT_AI_SNAPSHOT_MAX_CHARS as c, DEFAULT_BROWSER_EVALUATE_ENABLED as d, DEFAULT_BROWSER_SCREENSHOT_TIMEOUT_MS as f, DEFAULT_OPENCLAW_BROWSER_PROFILE_NAME as h, resolveExistingPathsWithinRoot as i, DEFAULT_BROWSER_ACTION_TIMEOUT_MS as l, DEFAULT_OPENCLAW_BROWSER_ENABLED as m, DEFAULT_TRACE_DIR as n, resolveWritablePathWithinRoot as o, DEFAULT_OPENCLAW_BROWSER_COLOR as p, DEFAULT_UPLOAD_DIR as r, DEFAULT_AI_SNAPSHOT_EFFICIENT_MAX_CHARS as s, DEFAULT_DOWNLOAD_DIR as t, DEFAULT_BROWSER_DEFAULT_PROFILE_NAME as u };
