import { t as getPlatformAdapter } from "./adapter-DfD2SNGz.js";
import { E as debugWarn, O as formatErrorMessage, T as debugLog } from "./sender-BZ_TJkxQ.js";
import * as fs$1 from "node:fs";
import * as os$1 from "node:os";
import * as path$1 from "node:path";
import { execFile } from "node:child_process";
//#region extensions/qqbot/src/engine/utils/platform.ts
/**
* Cross-platform path and detection helpers for core/ modules.
*
* Provides home/data/media directory helpers, platform detection,
* ffmpeg/silk-wasm availability checks — all without importing
* `openclaw/plugin-sdk`. The temp-directory fallback is delegated
* to the PlatformAdapter.
*/
/**
* Resolve the current user's home directory safely across platforms.
*
* Priority:
* 1. `os.homedir()`
* 2. `$HOME` or `%USERPROFILE%`
* 3. PlatformAdapter.getTempDir() as a last resort
*/
function getHomeDir() {
	try {
		const home = os$1.homedir();
		if (home && fs$1.existsSync(home)) return home;
	} catch {}
	const envHome = process.env.HOME || process.env.USERPROFILE;
	if (envHome && fs$1.existsSync(envHome)) return envHome;
	return getPlatformAdapter().getTempDir();
}
/** Return a path under `~/.openclaw/qqbot` without creating it. */
function getQQBotDataPath(...subPaths) {
	return path$1.join(getHomeDir(), ".openclaw", "qqbot", ...subPaths);
}
/** Return a path under `~/.openclaw/qqbot`, creating it on demand. */
function getQQBotDataDir(...subPaths) {
	const dir = getQQBotDataPath(...subPaths);
	if (!fs$1.existsSync(dir)) fs$1.mkdirSync(dir, { recursive: true });
	return dir;
}
/**
* Return a path under `~/.openclaw/media/qqbot` without creating it.
*
* Unlike `getQQBotDataPath`, this lives under OpenClaw's core media allowlist so
* downloaded images and audio can be accessed by framework media tooling.
*/
function getQQBotMediaPath(...subPaths) {
	return path$1.join(getHomeDir(), ".openclaw", "media", "qqbot", ...subPaths);
}
/** Return a path under `~/.openclaw/media/qqbot`, creating it on demand. */
function getQQBotMediaDir(...subPaths) {
	const dir = getQQBotMediaPath(...subPaths);
	if (!fs$1.existsSync(dir)) fs$1.mkdirSync(dir, { recursive: true });
	return dir;
}
/**
* Return `~/.openclaw/media`, OpenClaw's shared media root.
*
* This mirrors the directory that core's `buildMediaLocalRoots` exposes as an
* allowlisted location (see `openclaw/src/media/local-roots.ts`). Using it as a
* QQ Bot payload root lets the plugin trust framework-produced files that live
* in sibling subdirectories such as `outbound/` (written by
* `saveMediaBuffer(..., "outbound", ...)`) or `inbound/`, while still keeping
* the check anchored to a single, well-known directory.
*/
function getOpenClawMediaDir() {
	return path$1.join(getHomeDir(), ".openclaw", "media");
}
function getPlatform() {
	const p = process.platform;
	if (p === "darwin" || p === "linux" || p === "win32") return p;
	return "other";
}
function isWindows() {
	return process.platform === "win32";
}
/** Return the preferred temporary directory. */
function getTempDir() {
	return getPlatformAdapter().getTempDir();
}
let _ffmpegPath;
let _ffmpegCheckPromise = null;
/** Detect ffmpeg and return an executable path when available. */
function detectFfmpeg() {
	if (_ffmpegPath !== void 0) return Promise.resolve(_ffmpegPath);
	if (_ffmpegCheckPromise) return _ffmpegCheckPromise;
	_ffmpegCheckPromise = (async () => {
		const envPath = process.env.FFMPEG_PATH;
		if (envPath) {
			if (await testExecutable(envPath, ["-version"])) {
				_ffmpegPath = envPath;
				debugLog(`[platform] ffmpeg found via FFMPEG_PATH: ${envPath}`);
				return _ffmpegPath;
			}
			debugWarn(`[platform] FFMPEG_PATH set but not working: ${envPath}`);
		}
		const cmd = isWindows() ? "ffmpeg.exe" : "ffmpeg";
		if (await testExecutable(cmd, ["-version"])) {
			_ffmpegPath = cmd;
			debugLog(`[platform] ffmpeg detected in PATH`);
			return _ffmpegPath;
		}
		const commonPaths = isWindows() ? [
			"C:\\ffmpeg\\bin\\ffmpeg.exe",
			path$1.join(process.env.LOCALAPPDATA || "", "Programs", "ffmpeg", "bin", "ffmpeg.exe"),
			path$1.join(process.env.ProgramFiles || "", "ffmpeg", "bin", "ffmpeg.exe")
		] : [
			"/usr/local/bin/ffmpeg",
			"/opt/homebrew/bin/ffmpeg",
			"/usr/bin/ffmpeg",
			"/snap/bin/ffmpeg"
		];
		for (const p of commonPaths) if (p && fs$1.existsSync(p)) {
			if (await testExecutable(p, ["-version"])) {
				_ffmpegPath = p;
				debugLog(`[platform] ffmpeg found at: ${p}`);
				return _ffmpegPath;
			}
		}
		_ffmpegPath = null;
		return null;
	})().finally(() => {
		_ffmpegCheckPromise = null;
	});
	return _ffmpegCheckPromise;
}
/** Return true when an executable responds successfully to the given args. */
function testExecutable(cmd, args) {
	return new Promise((resolve) => {
		execFile(cmd, args, { timeout: 5e3 }, (err) => {
			resolve(!err);
		});
	});
}
let _silkWasmAvailable = null;
/** Check whether silk-wasm can run in the current environment. */
async function checkSilkWasmAvailable() {
	if (_silkWasmAvailable !== null) return _silkWasmAvailable;
	try {
		const { isSilk } = await import("silk-wasm");
		isSilk(new Uint8Array(0));
		_silkWasmAvailable = true;
		debugLog("[platform] silk-wasm: available");
	} catch (err) {
		_silkWasmAvailable = false;
		debugWarn(`[platform] silk-wasm: NOT available (${formatErrorMessage(err)})`);
	}
	return _silkWasmAvailable;
}
/** Expand `~` to the current user's home directory. */
function expandTilde(p) {
	if (!p) return p;
	if (p === "~") return getHomeDir();
	if (p.startsWith("~/") || p.startsWith("~\\")) return path$1.join(getHomeDir(), p.slice(2));
	return p;
}
/** Normalize a user-provided path by trimming, stripping `file://`, and expanding `~`. */
function normalizePath(p) {
	let result = p.trim();
	if (result.startsWith("file://")) {
		result = result.slice(7);
		try {
			result = decodeURIComponent(result);
		} catch {}
	}
	return expandTilde(result);
}
/** Return true when the string looks like a local filesystem path rather than a URL. */
function isLocalPath(p) {
	if (!p) return false;
	if (p.startsWith("file://")) return true;
	if (p === "~" || p.startsWith("~/") || p.startsWith("~\\")) return true;
	if (p.startsWith("/")) return true;
	if (/^[a-zA-Z]:[\\/]/.test(p)) return true;
	if (p.startsWith("\\\\")) return true;
	if (p.startsWith("./") || p.startsWith("../")) return true;
	if (p.startsWith(".\\") || p.startsWith("..\\")) return true;
	return false;
}
function isPathWithinRoot(candidate, root) {
	const relative = path$1.relative(root, candidate);
	return relative === "" || !relative.startsWith("..") && !path$1.isAbsolute(relative);
}
/** Remap legacy or hallucinated QQ Bot local media paths to real files when possible. */
function resolveQQBotLocalMediaPath(p) {
	const normalized = normalizePath(p);
	if (!isLocalPath(normalized) || fs$1.existsSync(normalized)) return normalized;
	const homeDir = getHomeDir();
	const mediaRoot = getQQBotMediaPath();
	const dataRoot = getQQBotDataPath();
	const candidateRoots = [
		{
			from: path$1.join(homeDir, ".openclaw", "workspace", "qqbot"),
			to: mediaRoot
		},
		{
			from: dataRoot,
			to: mediaRoot
		},
		{
			from: mediaRoot,
			to: dataRoot
		}
	];
	for (const { from, to } of candidateRoots) {
		if (!isPathWithinRoot(normalized, from)) continue;
		const relative = path$1.relative(from, normalized);
		const candidate = path$1.join(to, relative);
		if (fs$1.existsSync(candidate)) {
			debugWarn(`[platform] Remapped missing QQBot media path ${normalized} -> ${candidate}`);
			return candidate;
		}
	}
	return normalized;
}
/**
* Resolve a structured-payload local file path and enforce that it stays within
* QQ Bot-owned storage roots.
*/
function resolveQQBotPayloadLocalFilePath(p) {
	const candidate = resolveQQBotLocalMediaPath(p);
	if (!candidate.trim()) return null;
	const resolvedCandidate = path$1.resolve(candidate);
	if (!fs$1.existsSync(resolvedCandidate)) return null;
	const canonicalCandidate = fs$1.realpathSync(resolvedCandidate);
	const allowedRoots = [getOpenClawMediaDir(), getQQBotMediaPath()];
	for (const root of allowedRoots) {
		const resolvedRoot = path$1.resolve(root);
		if (isPathWithinRoot(canonicalCandidate, fs$1.existsSync(resolvedRoot) ? fs$1.realpathSync(resolvedRoot) : resolvedRoot)) return canonicalCandidate;
	}
	return null;
}
//#endregion
//#region extensions/qqbot/src/engine/messaging/target-parser.ts
/**
* Parse a qqbot target string into a structured delivery target.
*
* Supported formats:
* - `qqbot:c2c:openid` → C2C direct message
* - `qqbot:group:groupid` → Group message
* - `qqbot:channel:channelid` → Channel message
* - `c2c:openid` → C2C (without qqbot: prefix)
* - `group:groupid` → Group (without qqbot: prefix)
* - `channel:channelid` → Channel (without qqbot: prefix)
* - `openid` → C2C (bare openid, default)
*
* @param to - Raw target string.
* @returns Parsed target with type and id.
* @throws {Error} When the target format is invalid.
*/
function parseTarget(to) {
	let id = to.replace(/^qqbot:/i, "");
	if (id.startsWith("c2c:")) {
		const userId = id.slice(4);
		if (!userId) throw new Error(`Invalid c2c target format: ${to} - missing user ID`);
		return {
			type: "c2c",
			id: userId
		};
	}
	if (id.startsWith("group:")) {
		const groupId = id.slice(6);
		if (!groupId) throw new Error(`Invalid group target format: ${to} - missing group ID`);
		return {
			type: "group",
			id: groupId
		};
	}
	if (id.startsWith("channel:")) {
		const channelId = id.slice(8);
		if (!channelId) throw new Error(`Invalid channel target format: ${to} - missing channel ID`);
		return {
			type: "channel",
			id: channelId
		};
	}
	if (!id) throw new Error(`Invalid target format: ${to} - empty ID after removing qqbot: prefix`);
	return {
		type: "c2c",
		id
	};
}
/**
* Normalize a QQ Bot target string into the canonical `qqbot:...` form.
*
* Returns `undefined` when the target does not look like a QQ Bot address.
*/
function normalizeTarget(target) {
	const id = target.replace(/^qqbot:/i, "");
	if (id.startsWith("c2c:") || id.startsWith("group:") || id.startsWith("channel:")) return `qqbot:${id}`;
	if (/^[0-9a-fA-F]{32}$/.test(id)) return `qqbot:c2c:${id}`;
	if (/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(id)) return `qqbot:c2c:${id}`;
}
/**
* Return true when the string looks like a QQ Bot target ID.
*/
function looksLikeQQBotTarget(id) {
	if (/^qqbot:(c2c|group|channel):/i.test(id)) return true;
	if (/^(c2c|group|channel):/i.test(id)) return true;
	if (/^[0-9a-fA-F]{32}$/.test(id)) return true;
	return /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(id);
}
//#endregion
export { detectFfmpeg as a, getQQBotDataDir as c, getTempDir as d, isLocalPath as f, resolveQQBotPayloadLocalFilePath as h, checkSilkWasmAvailable as i, getQQBotDataPath as l, normalizePath as m, normalizeTarget as n, getHomeDir as o, isWindows as p, parseTarget as r, getPlatform as s, looksLikeQQBotTarget as t, getQQBotMediaDir as u };
