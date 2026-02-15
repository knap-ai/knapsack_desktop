import { g as pathExists } from "./utils-CrauP1IK.js";
import { nt as trimLogTail } from "./reply-BNEkWD6b.js";
import { t as runCommandWithTimeout } from "./exec-BDyx_yxc.js";
import { t as resolveOpenClawPackageRoot } from "./openclaw-root-CnzGNXsk.js";
import { r as resolveCliName, t as formatCliCommand } from "./command-format-ChfKqObn.js";
import { F as VERSION } from "./config-CWifpzL_.js";
import { a as fetchWithTimeout } from "./fetch-_IAZS3Vz.js";
import { _ as parseSemver } from "./daemon-runtime-sITO6h1s.js";
import { t as note } from "./note-B5hvEaG5.js";
import { d as resolveControlUiDistIndexPathForRoot, u as resolveControlUiDistIndexHealth } from "./health-Cb5plNjz.js";
import { a as resolveCompletionCachePath, i as isCompletionInstalled, o as resolveShellFromEnv, r as installCompletion, s as usesSlowDynamicCompletion, t as completionCacheExists } from "./completion-cli-D7hv-tR8.js";
import os from "node:os";
import path from "node:path";
import fsPromises from "node:fs/promises";
import { spawnSync } from "node:child_process";

//#region src/commands/doctor-completion.ts
/** Generate the completion cache by spawning the CLI. */
async function generateCompletionCache() {
	const root = await resolveOpenClawPackageRoot({
		moduleUrl: import.meta.url,
		argv1: process.argv[1],
		cwd: process.cwd()
	});
	if (!root) return false;
	const binPath = path.join(root, "openclaw.mjs");
	return spawnSync(process.execPath, [
		binPath,
		"completion",
		"--write-state"
	], {
		cwd: root,
		env: process.env,
		encoding: "utf-8"
	}).status === 0;
}
/** Check the status of shell completion for the current shell. */
async function checkShellCompletionStatus(binName = "openclaw") {
	const shell = resolveShellFromEnv();
	return {
		shell,
		profileInstalled: await isCompletionInstalled(shell, binName),
		cacheExists: await completionCacheExists(shell, binName),
		cachePath: resolveCompletionCachePath(shell, binName),
		usesSlowPattern: await usesSlowDynamicCompletion(shell, binName)
	};
}
/**
* Doctor check for shell completion.
* - If profile uses slow dynamic pattern: upgrade to cached version
* - If profile has completion but no cache: auto-generate cache and upgrade profile
* - If no completion at all: prompt to install (with user confirmation)
*/
async function doctorShellCompletion(runtime, prompter, options = {}) {
	const cliName = resolveCliName();
	const status = await checkShellCompletionStatus(cliName);
	if (status.usesSlowPattern) {
		note(`Your ${status.shell} profile uses slow dynamic completion (source <(...)).\nUpgrading to cached completion for faster shell startup...`, "Shell completion");
		if (!status.cacheExists) {
			if (!await generateCompletionCache()) {
				note(`Failed to generate completion cache. Run \`${cliName} completion --write-state\` manually.`, "Shell completion");
				return;
			}
		}
		await installCompletion(status.shell, true, cliName);
		note(`Shell completion upgraded. Restart your shell or run: source ~/.${status.shell === "zsh" ? "zshrc" : status.shell === "bash" ? "bashrc" : "config/fish/config.fish"}`, "Shell completion");
		return;
	}
	if (status.profileInstalled && !status.cacheExists) {
		note(`Shell completion is configured in your ${status.shell} profile but the cache is missing.\nRegenerating cache...`, "Shell completion");
		if (await generateCompletionCache()) note(`Completion cache regenerated at ${status.cachePath}`, "Shell completion");
		else note(`Failed to regenerate completion cache. Run \`${cliName} completion --write-state\` manually.`, "Shell completion");
		return;
	}
	if (!status.profileInstalled) {
		if (options.nonInteractive) return;
		if (await prompter.confirm({
			message: `Enable ${status.shell} shell completion for ${cliName}?`,
			initialValue: true
		})) {
			if (!await generateCompletionCache()) {
				note(`Failed to generate completion cache. Run \`${cliName} completion --write-state\` manually.`, "Shell completion");
				return;
			}
			await installCompletion(status.shell, true, cliName);
			note(`Shell completion installed. Restart your shell or run: source ~/.${status.shell === "zsh" ? "zshrc" : status.shell === "bash" ? "bashrc" : "config/fish/config.fish"}`, "Shell completion");
		}
	}
}
/**
* Ensure completion cache exists. Used during onboarding/update to fix
* cases where profile has completion but no cache.
* This is a silent fix - no prompts.
*/
async function ensureCompletionCacheExists(binName = "openclaw") {
	if (await completionCacheExists(resolveShellFromEnv(), binName)) return true;
	return generateCompletionCache();
}

//#endregion
//#region src/infra/update-channels.ts
const DEFAULT_PACKAGE_CHANNEL = "stable";
const DEFAULT_GIT_CHANNEL = "dev";
const DEV_BRANCH = "main";
function normalizeUpdateChannel(value) {
	if (!value) return null;
	const normalized = value.trim().toLowerCase();
	if (normalized === "stable" || normalized === "beta" || normalized === "dev") return normalized;
	return null;
}
function channelToNpmTag(channel) {
	if (channel === "beta") return "beta";
	if (channel === "dev") return "dev";
	return "latest";
}
function isBetaTag(tag) {
	return tag.toLowerCase().includes("-beta");
}
function isStableTag(tag) {
	return !isBetaTag(tag);
}
function resolveEffectiveUpdateChannel(params) {
	if (params.configChannel) return {
		channel: params.configChannel,
		source: "config"
	};
	if (params.installKind === "git") {
		const tag = params.git?.tag;
		if (tag) return {
			channel: isBetaTag(tag) ? "beta" : "stable",
			source: "git-tag"
		};
		const branch = params.git?.branch;
		if (branch && branch !== "HEAD") return {
			channel: "dev",
			source: "git-branch"
		};
		return {
			channel: DEFAULT_GIT_CHANNEL,
			source: "default"
		};
	}
	if (params.installKind === "package") return {
		channel: DEFAULT_PACKAGE_CHANNEL,
		source: "default"
	};
	return {
		channel: DEFAULT_PACKAGE_CHANNEL,
		source: "default"
	};
}
function formatUpdateChannelLabel(params) {
	if (params.source === "config") return `${params.channel} (config)`;
	if (params.source === "git-tag") return params.gitTag ? `${params.channel} (${params.gitTag})` : `${params.channel} (tag)`;
	if (params.source === "git-branch") return params.gitBranch ? `${params.channel} (${params.gitBranch})` : `${params.channel} (branch)`;
	return `${params.channel} (default)`;
}

//#endregion
//#region src/infra/update-check.ts
async function exists(p) {
	try {
		await fsPromises.access(p);
		return true;
	} catch {
		return false;
	}
}
async function detectPackageManager$1(root) {
	try {
		const raw = await fsPromises.readFile(path.join(root, "package.json"), "utf-8");
		const pm = JSON.parse(raw)?.packageManager?.split("@")[0]?.trim();
		if (pm === "pnpm" || pm === "bun" || pm === "npm") return pm;
	} catch {}
	const files = await fsPromises.readdir(root).catch(() => []);
	if (files.includes("pnpm-lock.yaml")) return "pnpm";
	if (files.includes("bun.lockb")) return "bun";
	if (files.includes("package-lock.json")) return "npm";
	return "unknown";
}
async function detectGitRoot(root) {
	const res = await runCommandWithTimeout([
		"git",
		"-C",
		root,
		"rev-parse",
		"--show-toplevel"
	], { timeoutMs: 4e3 }).catch(() => null);
	if (!res || res.code !== 0) return null;
	const top = res.stdout.trim();
	return top ? path.resolve(top) : null;
}
async function checkGitUpdateStatus(params) {
	const timeoutMs = params.timeoutMs ?? 6e3;
	const root = path.resolve(params.root);
	const base = {
		root,
		sha: null,
		tag: null,
		branch: null,
		upstream: null,
		dirty: null,
		ahead: null,
		behind: null,
		fetchOk: null
	};
	const branchRes = await runCommandWithTimeout([
		"git",
		"-C",
		root,
		"rev-parse",
		"--abbrev-ref",
		"HEAD"
	], { timeoutMs }).catch(() => null);
	if (!branchRes || branchRes.code !== 0) return {
		...base,
		error: branchRes?.stderr?.trim() || "git unavailable"
	};
	const branch = branchRes.stdout.trim() || null;
	const shaRes = await runCommandWithTimeout([
		"git",
		"-C",
		root,
		"rev-parse",
		"HEAD"
	], { timeoutMs }).catch(() => null);
	const sha = shaRes && shaRes.code === 0 ? shaRes.stdout.trim() : null;
	const tagRes = await runCommandWithTimeout([
		"git",
		"-C",
		root,
		"describe",
		"--tags",
		"--exact-match"
	], { timeoutMs }).catch(() => null);
	const tag = tagRes && tagRes.code === 0 ? tagRes.stdout.trim() : null;
	const upstreamRes = await runCommandWithTimeout([
		"git",
		"-C",
		root,
		"rev-parse",
		"--abbrev-ref",
		"@{upstream}"
	], { timeoutMs }).catch(() => null);
	const upstream = upstreamRes && upstreamRes.code === 0 ? upstreamRes.stdout.trim() : null;
	const dirtyRes = await runCommandWithTimeout([
		"git",
		"-C",
		root,
		"status",
		"--porcelain",
		"--",
		":!dist/control-ui/"
	], { timeoutMs }).catch(() => null);
	const dirty = dirtyRes && dirtyRes.code === 0 ? dirtyRes.stdout.trim().length > 0 : null;
	const fetchOk = params.fetch ? await runCommandWithTimeout([
		"git",
		"-C",
		root,
		"fetch",
		"--quiet",
		"--prune"
	], { timeoutMs }).then((r) => r.code === 0).catch(() => false) : null;
	const counts = upstream && upstream.length > 0 ? await runCommandWithTimeout([
		"git",
		"-C",
		root,
		"rev-list",
		"--left-right",
		"--count",
		`HEAD...${upstream}`
	], { timeoutMs }).catch(() => null) : null;
	const parseCounts = (raw) => {
		const parts = raw.trim().split(/\s+/);
		if (parts.length < 2) return null;
		const ahead = Number.parseInt(parts[0] ?? "", 10);
		const behind = Number.parseInt(parts[1] ?? "", 10);
		if (!Number.isFinite(ahead) || !Number.isFinite(behind)) return null;
		return {
			ahead,
			behind
		};
	};
	const parsed = counts && counts.code === 0 ? parseCounts(counts.stdout) : null;
	return {
		root,
		sha,
		tag,
		branch,
		upstream,
		dirty,
		ahead: parsed?.ahead ?? null,
		behind: parsed?.behind ?? null,
		fetchOk
	};
}
async function statMtimeMs(p) {
	try {
		return (await fsPromises.stat(p)).mtimeMs;
	} catch {
		return null;
	}
}
function resolveDepsMarker(params) {
	const root = params.root;
	if (params.manager === "pnpm") return {
		lockfilePath: path.join(root, "pnpm-lock.yaml"),
		markerPath: path.join(root, "node_modules", ".modules.yaml")
	};
	if (params.manager === "bun") return {
		lockfilePath: path.join(root, "bun.lockb"),
		markerPath: path.join(root, "node_modules")
	};
	if (params.manager === "npm") return {
		lockfilePath: path.join(root, "package-lock.json"),
		markerPath: path.join(root, "node_modules")
	};
	return {
		lockfilePath: null,
		markerPath: null
	};
}
async function checkDepsStatus(params) {
	const { lockfilePath, markerPath } = resolveDepsMarker({
		root: path.resolve(params.root),
		manager: params.manager
	});
	if (!lockfilePath || !markerPath) return {
		manager: params.manager,
		status: "unknown",
		lockfilePath,
		markerPath,
		reason: "unknown package manager"
	};
	const lockExists = await exists(lockfilePath);
	const markerExists = await exists(markerPath);
	if (!lockExists) return {
		manager: params.manager,
		status: "unknown",
		lockfilePath,
		markerPath,
		reason: "lockfile missing"
	};
	if (!markerExists) return {
		manager: params.manager,
		status: "missing",
		lockfilePath,
		markerPath,
		reason: "node_modules marker missing"
	};
	const lockMtime = await statMtimeMs(lockfilePath);
	const markerMtime = await statMtimeMs(markerPath);
	if (!lockMtime || !markerMtime) return {
		manager: params.manager,
		status: "unknown",
		lockfilePath,
		markerPath
	};
	if (lockMtime > markerMtime + 1e3) return {
		manager: params.manager,
		status: "stale",
		lockfilePath,
		markerPath,
		reason: "lockfile newer than install marker"
	};
	return {
		manager: params.manager,
		status: "ok",
		lockfilePath,
		markerPath
	};
}
async function fetchNpmLatestVersion(params) {
	const res = await fetchNpmTagVersion({
		tag: "latest",
		timeoutMs: params?.timeoutMs
	});
	return {
		latestVersion: res.version,
		error: res.error
	};
}
async function fetchNpmTagVersion(params) {
	const timeoutMs = params?.timeoutMs ?? 3500;
	const tag = params.tag;
	try {
		const res = await fetchWithTimeout(`https://registry.npmjs.org/openclaw/${encodeURIComponent(tag)}`, {}, Math.max(250, timeoutMs));
		if (!res.ok) return {
			tag,
			version: null,
			error: `HTTP ${res.status}`
		};
		const json = await res.json();
		return {
			tag,
			version: typeof json?.version === "string" ? json.version : null
		};
	} catch (err) {
		return {
			tag,
			version: null,
			error: String(err)
		};
	}
}
async function resolveNpmChannelTag(params) {
	const channelTag = channelToNpmTag(params.channel);
	const channelStatus = await fetchNpmTagVersion({
		tag: channelTag,
		timeoutMs: params.timeoutMs
	});
	if (params.channel !== "beta") return {
		tag: channelTag,
		version: channelStatus.version
	};
	const latestStatus = await fetchNpmTagVersion({
		tag: "latest",
		timeoutMs: params.timeoutMs
	});
	if (!latestStatus.version) return {
		tag: channelTag,
		version: channelStatus.version
	};
	if (!channelStatus.version) return {
		tag: "latest",
		version: latestStatus.version
	};
	const cmp = compareSemverStrings(channelStatus.version, latestStatus.version);
	if (cmp != null && cmp < 0) return {
		tag: "latest",
		version: latestStatus.version
	};
	return {
		tag: channelTag,
		version: channelStatus.version
	};
}
function compareSemverStrings(a, b) {
	const pa = parseSemver(a);
	const pb = parseSemver(b);
	if (!pa || !pb) return null;
	if (pa.major !== pb.major) return pa.major < pb.major ? -1 : 1;
	if (pa.minor !== pb.minor) return pa.minor < pb.minor ? -1 : 1;
	if (pa.patch !== pb.patch) return pa.patch < pb.patch ? -1 : 1;
	return 0;
}
async function checkUpdateStatus(params) {
	const timeoutMs = params.timeoutMs ?? 6e3;
	const root = params.root ? path.resolve(params.root) : null;
	if (!root) return {
		root: null,
		installKind: "unknown",
		packageManager: "unknown",
		registry: params.includeRegistry ? await fetchNpmLatestVersion({ timeoutMs }) : void 0
	};
	const pm = await detectPackageManager$1(root);
	const gitRoot = await detectGitRoot(root);
	const isGit = gitRoot && path.resolve(gitRoot) === root;
	return {
		root,
		installKind: isGit ? "git" : "package",
		packageManager: pm,
		git: isGit ? await checkGitUpdateStatus({
			root,
			timeoutMs,
			fetch: Boolean(params.fetchGit)
		}) : void 0,
		deps: await checkDepsStatus({
			root,
			manager: pm
		}),
		registry: params.includeRegistry ? await fetchNpmLatestVersion({ timeoutMs }) : void 0
	};
}

//#endregion
//#region src/infra/update-global.ts
const PRIMARY_PACKAGE_NAME = "openclaw";
const ALL_PACKAGE_NAMES = [PRIMARY_PACKAGE_NAME];
const GLOBAL_RENAME_PREFIX = ".";
async function tryRealpath(targetPath) {
	try {
		return await fsPromises.realpath(targetPath);
	} catch {
		return path.resolve(targetPath);
	}
}
function resolveBunGlobalRoot() {
	const bunInstall = process.env.BUN_INSTALL?.trim() || path.join(os.homedir(), ".bun");
	return path.join(bunInstall, "install", "global", "node_modules");
}
async function resolveGlobalRoot(manager, runCommand, timeoutMs) {
	if (manager === "bun") return resolveBunGlobalRoot();
	const res = await runCommand(manager === "pnpm" ? [
		"pnpm",
		"root",
		"-g"
	] : [
		"npm",
		"root",
		"-g"
	], { timeoutMs }).catch(() => null);
	if (!res || res.code !== 0) return null;
	return res.stdout.trim() || null;
}
async function resolveGlobalPackageRoot(manager, runCommand, timeoutMs) {
	const root = await resolveGlobalRoot(manager, runCommand, timeoutMs);
	if (!root) return null;
	return path.join(root, PRIMARY_PACKAGE_NAME);
}
async function detectGlobalInstallManagerForRoot(runCommand, pkgRoot, timeoutMs) {
	const pkgReal = await tryRealpath(pkgRoot);
	for (const { manager, argv } of [{
		manager: "npm",
		argv: [
			"npm",
			"root",
			"-g"
		]
	}, {
		manager: "pnpm",
		argv: [
			"pnpm",
			"root",
			"-g"
		]
	}]) {
		const res = await runCommand(argv, { timeoutMs }).catch(() => null);
		if (!res || res.code !== 0) continue;
		const globalRoot = res.stdout.trim();
		if (!globalRoot) continue;
		const globalReal = await tryRealpath(globalRoot);
		for (const name of ALL_PACKAGE_NAMES) {
			const expected = path.join(globalReal, name);
			if (path.resolve(expected) === path.resolve(pkgReal)) return manager;
		}
	}
	const bunGlobalReal = await tryRealpath(resolveBunGlobalRoot());
	for (const name of ALL_PACKAGE_NAMES) {
		const bunExpected = path.join(bunGlobalReal, name);
		if (path.resolve(bunExpected) === path.resolve(pkgReal)) return "bun";
	}
	return null;
}
async function detectGlobalInstallManagerByPresence(runCommand, timeoutMs) {
	for (const manager of ["npm", "pnpm"]) {
		const root = await resolveGlobalRoot(manager, runCommand, timeoutMs);
		if (!root) continue;
		for (const name of ALL_PACKAGE_NAMES) if (await pathExists(path.join(root, name))) return manager;
	}
	const bunRoot = resolveBunGlobalRoot();
	for (const name of ALL_PACKAGE_NAMES) if (await pathExists(path.join(bunRoot, name))) return "bun";
	return null;
}
function globalInstallArgs(manager, spec) {
	if (manager === "pnpm") return [
		"pnpm",
		"add",
		"-g",
		spec
	];
	if (manager === "bun") return [
		"bun",
		"add",
		"-g",
		spec
	];
	return [
		"npm",
		"i",
		"-g",
		spec
	];
}
async function cleanupGlobalRenameDirs(params) {
	const removed = [];
	const root = params.globalRoot.trim();
	const name = params.packageName.trim();
	if (!root || !name) return { removed };
	const prefix = `${GLOBAL_RENAME_PREFIX}${name}-`;
	let entries = [];
	try {
		entries = await fsPromises.readdir(root);
	} catch {
		return { removed };
	}
	for (const entry of entries) {
		if (!entry.startsWith(prefix)) continue;
		const target = path.join(root, entry);
		try {
			if (!(await fsPromises.lstat(target)).isDirectory()) continue;
			await fsPromises.rm(target, {
				recursive: true,
				force: true
			});
			removed.push(entry);
		} catch {}
	}
	return { removed };
}

//#endregion
//#region src/infra/update-runner.ts
const DEFAULT_TIMEOUT_MS = 20 * 6e4;
const MAX_LOG_CHARS = 8e3;
const PREFLIGHT_MAX_COMMITS = 10;
const START_DIRS = [
	"cwd",
	"argv1",
	"process"
];
const DEFAULT_PACKAGE_NAME = "openclaw";
const CORE_PACKAGE_NAMES = new Set([DEFAULT_PACKAGE_NAME]);
function normalizeDir(value) {
	if (!value) return null;
	const trimmed = value.trim();
	if (!trimmed) return null;
	return path.resolve(trimmed);
}
function resolveNodeModulesBinPackageRoot(argv1) {
	const normalized = path.resolve(argv1);
	const parts = normalized.split(path.sep);
	const binIndex = parts.lastIndexOf(".bin");
	if (binIndex <= 0) return null;
	if (parts[binIndex - 1] !== "node_modules") return null;
	const binName = path.basename(normalized);
	const nodeModulesDir = parts.slice(0, binIndex).join(path.sep);
	return path.join(nodeModulesDir, binName);
}
function buildStartDirs(opts) {
	const dirs = [];
	const cwd = normalizeDir(opts.cwd);
	if (cwd) dirs.push(cwd);
	const argv1 = normalizeDir(opts.argv1);
	if (argv1) {
		dirs.push(path.dirname(argv1));
		const packageRoot = resolveNodeModulesBinPackageRoot(argv1);
		if (packageRoot) dirs.push(packageRoot);
	}
	const proc = normalizeDir(process.cwd());
	if (proc) dirs.push(proc);
	return Array.from(new Set(dirs));
}
async function readPackageVersion(root) {
	try {
		const raw = await fsPromises.readFile(path.join(root, "package.json"), "utf-8");
		const parsed = JSON.parse(raw);
		return typeof parsed?.version === "string" ? parsed.version : null;
	} catch {
		return null;
	}
}
async function readPackageName(root) {
	try {
		const raw = await fsPromises.readFile(path.join(root, "package.json"), "utf-8");
		const name = JSON.parse(raw)?.name?.trim();
		return name ? name : null;
	} catch {
		return null;
	}
}
async function readBranchName(runCommand, root, timeoutMs) {
	const res = await runCommand([
		"git",
		"-C",
		root,
		"rev-parse",
		"--abbrev-ref",
		"HEAD"
	], { timeoutMs }).catch(() => null);
	if (!res || res.code !== 0) return null;
	return res.stdout.trim() || null;
}
async function listGitTags(runCommand, root, timeoutMs, pattern = "v*") {
	const res = await runCommand([
		"git",
		"-C",
		root,
		"tag",
		"--list",
		pattern,
		"--sort=-v:refname"
	], { timeoutMs }).catch(() => null);
	if (!res || res.code !== 0) return [];
	return res.stdout.split("\n").map((line) => line.trim()).filter(Boolean);
}
async function resolveChannelTag(runCommand, root, timeoutMs, channel) {
	const tags = await listGitTags(runCommand, root, timeoutMs);
	if (channel === "beta") {
		const betaTag = tags.find((tag) => isBetaTag(tag)) ?? null;
		const stableTag = tags.find((tag) => isStableTag(tag)) ?? null;
		if (!betaTag) return stableTag;
		if (!stableTag) return betaTag;
		const cmp = compareSemverStrings(betaTag, stableTag);
		if (cmp != null && cmp < 0) return stableTag;
		return betaTag;
	}
	return tags.find((tag) => isStableTag(tag)) ?? null;
}
async function resolveGitRoot(runCommand, candidates, timeoutMs) {
	for (const dir of candidates) {
		const res = await runCommand([
			"git",
			"-C",
			dir,
			"rev-parse",
			"--show-toplevel"
		], { timeoutMs });
		if (res.code === 0) {
			const root = res.stdout.trim();
			if (root) return root;
		}
	}
	return null;
}
async function findPackageRoot(candidates) {
	for (const dir of candidates) {
		let current = dir;
		for (let i = 0; i < 12; i += 1) {
			const pkgPath = path.join(current, "package.json");
			try {
				const raw = await fsPromises.readFile(pkgPath, "utf-8");
				const name = JSON.parse(raw)?.name?.trim();
				if (name && CORE_PACKAGE_NAMES.has(name)) return current;
			} catch {}
			const parent = path.dirname(current);
			if (parent === current) break;
			current = parent;
		}
	}
	return null;
}
async function detectPackageManager(root) {
	try {
		const raw = await fsPromises.readFile(path.join(root, "package.json"), "utf-8");
		const pm = JSON.parse(raw)?.packageManager?.split("@")[0]?.trim();
		if (pm === "pnpm" || pm === "bun" || pm === "npm") return pm;
	} catch {}
	const files = await fsPromises.readdir(root).catch(() => []);
	if (files.includes("pnpm-lock.yaml")) return "pnpm";
	if (files.includes("bun.lockb")) return "bun";
	if (files.includes("package-lock.json")) return "npm";
	return "npm";
}
async function runStep(opts) {
	const { runCommand, name, argv, cwd, timeoutMs, env, progress, stepIndex, totalSteps } = opts;
	const command = argv.join(" ");
	const stepInfo = {
		name,
		command,
		index: stepIndex,
		total: totalSteps
	};
	progress?.onStepStart?.(stepInfo);
	const started = Date.now();
	const result = await runCommand(argv, {
		cwd,
		timeoutMs,
		env
	});
	const durationMs = Date.now() - started;
	const stderrTail = trimLogTail(result.stderr, MAX_LOG_CHARS);
	progress?.onStepComplete?.({
		...stepInfo,
		durationMs,
		exitCode: result.code,
		stderrTail
	});
	return {
		name,
		command,
		cwd,
		durationMs,
		exitCode: result.code,
		stdoutTail: trimLogTail(result.stdout, MAX_LOG_CHARS),
		stderrTail: trimLogTail(result.stderr, MAX_LOG_CHARS)
	};
}
function managerScriptArgs(manager, script, args = []) {
	if (manager === "pnpm") return [
		"pnpm",
		script,
		...args
	];
	if (manager === "bun") return [
		"bun",
		"run",
		script,
		...args
	];
	if (args.length > 0) return [
		"npm",
		"run",
		script,
		"--",
		...args
	];
	return [
		"npm",
		"run",
		script
	];
}
function managerInstallArgs(manager) {
	if (manager === "pnpm") return ["pnpm", "install"];
	if (manager === "bun") return ["bun", "install"];
	return ["npm", "install"];
}
function normalizeTag(tag) {
	const trimmed = tag?.trim();
	if (!trimmed) return "latest";
	if (trimmed.startsWith("openclaw@")) return trimmed.slice(9);
	if (trimmed.startsWith(`${DEFAULT_PACKAGE_NAME}@`)) return trimmed.slice(`${DEFAULT_PACKAGE_NAME}@`.length);
	return trimmed;
}
async function runGatewayUpdate(opts = {}) {
	const startedAt = Date.now();
	const runCommand = opts.runCommand ?? (async (argv, options) => {
		const res = await runCommandWithTimeout(argv, options);
		return {
			stdout: res.stdout,
			stderr: res.stderr,
			code: res.code
		};
	});
	const timeoutMs = opts.timeoutMs ?? DEFAULT_TIMEOUT_MS;
	const progress = opts.progress;
	const steps = [];
	const candidates = buildStartDirs(opts);
	let stepIndex = 0;
	let gitTotalSteps = 0;
	const step = (name, argv, cwd, env) => {
		const currentIndex = stepIndex;
		stepIndex += 1;
		return {
			runCommand,
			name,
			argv,
			cwd,
			timeoutMs,
			env,
			progress,
			stepIndex: currentIndex,
			totalSteps: gitTotalSteps
		};
	};
	const pkgRoot = await findPackageRoot(candidates);
	let gitRoot = await resolveGitRoot(runCommand, candidates, timeoutMs);
	if (gitRoot && pkgRoot && path.resolve(gitRoot) !== path.resolve(pkgRoot)) gitRoot = null;
	if (gitRoot && !pkgRoot) return {
		status: "error",
		mode: "unknown",
		root: gitRoot,
		reason: "not-openclaw-root",
		steps: [],
		durationMs: Date.now() - startedAt
	};
	if (gitRoot && pkgRoot && path.resolve(gitRoot) === path.resolve(pkgRoot)) {
		const beforeSha = (await runCommand([
			"git",
			"-C",
			gitRoot,
			"rev-parse",
			"HEAD"
		], {
			cwd: gitRoot,
			timeoutMs
		})).stdout.trim() || null;
		const beforeVersion = await readPackageVersion(gitRoot);
		const channel = opts.channel ?? "dev";
		const branch = channel === "dev" ? await readBranchName(runCommand, gitRoot, timeoutMs) : null;
		const needsCheckoutMain = channel === "dev" && branch !== DEV_BRANCH;
		gitTotalSteps = channel === "dev" ? needsCheckoutMain ? 11 : 10 : 9;
		const statusCheck = await runStep(step("clean check", [
			"git",
			"-C",
			gitRoot,
			"status",
			"--porcelain",
			"--",
			":!dist/control-ui/"
		], gitRoot));
		steps.push(statusCheck);
		if (statusCheck.stdoutTail && statusCheck.stdoutTail.trim().length > 0) return {
			status: "skipped",
			mode: "git",
			root: gitRoot,
			reason: "dirty",
			before: {
				sha: beforeSha,
				version: beforeVersion
			},
			steps,
			durationMs: Date.now() - startedAt
		};
		if (channel === "dev") {
			if (needsCheckoutMain) {
				const checkoutStep = await runStep(step(`git checkout ${DEV_BRANCH}`, [
					"git",
					"-C",
					gitRoot,
					"checkout",
					DEV_BRANCH
				], gitRoot));
				steps.push(checkoutStep);
				if (checkoutStep.exitCode !== 0) return {
					status: "error",
					mode: "git",
					root: gitRoot,
					reason: "checkout-failed",
					before: {
						sha: beforeSha,
						version: beforeVersion
					},
					steps,
					durationMs: Date.now() - startedAt
				};
			}
			const upstreamStep = await runStep(step("upstream check", [
				"git",
				"-C",
				gitRoot,
				"rev-parse",
				"--abbrev-ref",
				"--symbolic-full-name",
				"@{upstream}"
			], gitRoot));
			steps.push(upstreamStep);
			if (upstreamStep.exitCode !== 0) return {
				status: "skipped",
				mode: "git",
				root: gitRoot,
				reason: "no-upstream",
				before: {
					sha: beforeSha,
					version: beforeVersion
				},
				steps,
				durationMs: Date.now() - startedAt
			};
			const fetchStep = await runStep(step("git fetch", [
				"git",
				"-C",
				gitRoot,
				"fetch",
				"--all",
				"--prune",
				"--tags"
			], gitRoot));
			steps.push(fetchStep);
			const upstreamShaStep = await runStep(step("git rev-parse @{upstream}", [
				"git",
				"-C",
				gitRoot,
				"rev-parse",
				"@{upstream}"
			], gitRoot));
			steps.push(upstreamShaStep);
			const upstreamSha = upstreamShaStep.stdoutTail?.trim();
			if (!upstreamShaStep.stdoutTail || !upstreamSha) return {
				status: "error",
				mode: "git",
				root: gitRoot,
				reason: "no-upstream-sha",
				before: {
					sha: beforeSha,
					version: beforeVersion
				},
				steps,
				durationMs: Date.now() - startedAt
			};
			const revListStep = await runStep(step("git rev-list", [
				"git",
				"-C",
				gitRoot,
				"rev-list",
				`--max-count=${PREFLIGHT_MAX_COMMITS}`,
				upstreamSha
			], gitRoot));
			steps.push(revListStep);
			if (revListStep.exitCode !== 0) return {
				status: "error",
				mode: "git",
				root: gitRoot,
				reason: "preflight-revlist-failed",
				before: {
					sha: beforeSha,
					version: beforeVersion
				},
				steps,
				durationMs: Date.now() - startedAt
			};
			const candidates = (revListStep.stdoutTail ?? "").split("\n").map((line) => line.trim()).filter(Boolean);
			if (candidates.length === 0) return {
				status: "error",
				mode: "git",
				root: gitRoot,
				reason: "preflight-no-candidates",
				before: {
					sha: beforeSha,
					version: beforeVersion
				},
				steps,
				durationMs: Date.now() - startedAt
			};
			const manager = await detectPackageManager(gitRoot);
			const preflightRoot = await fsPromises.mkdtemp(path.join(os.tmpdir(), "openclaw-update-preflight-"));
			const worktreeDir = path.join(preflightRoot, "worktree");
			const worktreeStep = await runStep(step("preflight worktree", [
				"git",
				"-C",
				gitRoot,
				"worktree",
				"add",
				"--detach",
				worktreeDir,
				upstreamSha
			], gitRoot));
			steps.push(worktreeStep);
			if (worktreeStep.exitCode !== 0) {
				await fsPromises.rm(preflightRoot, {
					recursive: true,
					force: true
				}).catch(() => {});
				return {
					status: "error",
					mode: "git",
					root: gitRoot,
					reason: "preflight-worktree-failed",
					before: {
						sha: beforeSha,
						version: beforeVersion
					},
					steps,
					durationMs: Date.now() - startedAt
				};
			}
			let selectedSha = null;
			try {
				for (const sha of candidates) {
					const shortSha = sha.slice(0, 8);
					const checkoutStep = await runStep(step(`preflight checkout (${shortSha})`, [
						"git",
						"-C",
						worktreeDir,
						"checkout",
						"--detach",
						sha
					], worktreeDir));
					steps.push(checkoutStep);
					if (checkoutStep.exitCode !== 0) continue;
					const depsStep = await runStep(step(`preflight deps install (${shortSha})`, managerInstallArgs(manager), worktreeDir));
					steps.push(depsStep);
					if (depsStep.exitCode !== 0) continue;
					const buildStep = await runStep(step(`preflight build (${shortSha})`, managerScriptArgs(manager, "build"), worktreeDir));
					steps.push(buildStep);
					if (buildStep.exitCode !== 0) continue;
					const lintStep = await runStep(step(`preflight lint (${shortSha})`, managerScriptArgs(manager, "lint"), worktreeDir));
					steps.push(lintStep);
					if (lintStep.exitCode !== 0) continue;
					selectedSha = sha;
					break;
				}
			} finally {
				const removeStep = await runStep(step("preflight cleanup", [
					"git",
					"-C",
					gitRoot,
					"worktree",
					"remove",
					"--force",
					worktreeDir
				], gitRoot));
				steps.push(removeStep);
				await runCommand([
					"git",
					"-C",
					gitRoot,
					"worktree",
					"prune"
				], {
					cwd: gitRoot,
					timeoutMs
				}).catch(() => null);
				await fsPromises.rm(preflightRoot, {
					recursive: true,
					force: true
				}).catch(() => {});
			}
			if (!selectedSha) return {
				status: "error",
				mode: "git",
				root: gitRoot,
				reason: "preflight-no-good-commit",
				before: {
					sha: beforeSha,
					version: beforeVersion
				},
				steps,
				durationMs: Date.now() - startedAt
			};
			const rebaseStep = await runStep(step("git rebase", [
				"git",
				"-C",
				gitRoot,
				"rebase",
				selectedSha
			], gitRoot));
			steps.push(rebaseStep);
			if (rebaseStep.exitCode !== 0) {
				const abortResult = await runCommand([
					"git",
					"-C",
					gitRoot,
					"rebase",
					"--abort"
				], {
					cwd: gitRoot,
					timeoutMs
				});
				steps.push({
					name: "git rebase --abort",
					command: "git rebase --abort",
					cwd: gitRoot,
					durationMs: 0,
					exitCode: abortResult.code,
					stdoutTail: trimLogTail(abortResult.stdout, MAX_LOG_CHARS),
					stderrTail: trimLogTail(abortResult.stderr, MAX_LOG_CHARS)
				});
				return {
					status: "error",
					mode: "git",
					root: gitRoot,
					reason: "rebase-failed",
					before: {
						sha: beforeSha,
						version: beforeVersion
					},
					steps,
					durationMs: Date.now() - startedAt
				};
			}
		} else {
			const fetchStep = await runStep(step("git fetch", [
				"git",
				"-C",
				gitRoot,
				"fetch",
				"--all",
				"--prune",
				"--tags"
			], gitRoot));
			steps.push(fetchStep);
			if (fetchStep.exitCode !== 0) return {
				status: "error",
				mode: "git",
				root: gitRoot,
				reason: "fetch-failed",
				before: {
					sha: beforeSha,
					version: beforeVersion
				},
				steps,
				durationMs: Date.now() - startedAt
			};
			const tag = await resolveChannelTag(runCommand, gitRoot, timeoutMs, channel);
			if (!tag) return {
				status: "error",
				mode: "git",
				root: gitRoot,
				reason: "no-release-tag",
				before: {
					sha: beforeSha,
					version: beforeVersion
				},
				steps,
				durationMs: Date.now() - startedAt
			};
			const checkoutStep = await runStep(step(`git checkout ${tag}`, [
				"git",
				"-C",
				gitRoot,
				"checkout",
				"--detach",
				tag
			], gitRoot));
			steps.push(checkoutStep);
			if (checkoutStep.exitCode !== 0) return {
				status: "error",
				mode: "git",
				root: gitRoot,
				reason: "checkout-failed",
				before: {
					sha: beforeSha,
					version: beforeVersion
				},
				steps,
				durationMs: Date.now() - startedAt
			};
		}
		const manager = await detectPackageManager(gitRoot);
		const depsStep = await runStep(step("deps install", managerInstallArgs(manager), gitRoot));
		steps.push(depsStep);
		const buildStep = await runStep(step("build", managerScriptArgs(manager, "build"), gitRoot));
		steps.push(buildStep);
		const uiBuildStep = await runStep(step("ui:build", managerScriptArgs(manager, "ui:build"), gitRoot));
		steps.push(uiBuildStep);
		const doctorEntry = path.join(gitRoot, "openclaw.mjs");
		if (!await fsPromises.stat(doctorEntry).then(() => true).catch(() => false)) {
			steps.push({
				name: "openclaw doctor entry",
				command: `verify ${doctorEntry}`,
				cwd: gitRoot,
				durationMs: 0,
				exitCode: 1,
				stderrTail: `missing ${doctorEntry}`
			});
			return {
				status: "error",
				mode: "git",
				root: gitRoot,
				reason: "doctor-entry-missing",
				before: {
					sha: beforeSha,
					version: beforeVersion
				},
				steps,
				durationMs: Date.now() - startedAt
			};
		}
		const doctorStep = await runStep(step("openclaw doctor", [
			process.execPath,
			doctorEntry,
			"doctor",
			"--non-interactive"
		], gitRoot, { OPENCLAW_UPDATE_IN_PROGRESS: "1" }));
		steps.push(doctorStep);
		if (!(await resolveControlUiDistIndexHealth({ root: gitRoot })).exists) {
			const repairArgv = managerScriptArgs(manager, "ui:build");
			const started = Date.now();
			const repairResult = await runCommand(repairArgv, {
				cwd: gitRoot,
				timeoutMs
			});
			const repairStep = {
				name: "ui:build (post-doctor repair)",
				command: repairArgv.join(" "),
				cwd: gitRoot,
				durationMs: Date.now() - started,
				exitCode: repairResult.code,
				stdoutTail: trimLogTail(repairResult.stdout, MAX_LOG_CHARS),
				stderrTail: trimLogTail(repairResult.stderr, MAX_LOG_CHARS)
			};
			steps.push(repairStep);
			if (repairResult.code !== 0) return {
				status: "error",
				mode: "git",
				root: gitRoot,
				reason: repairStep.name,
				before: {
					sha: beforeSha,
					version: beforeVersion
				},
				steps,
				durationMs: Date.now() - startedAt
			};
			const repairedUiIndexHealth = await resolveControlUiDistIndexHealth({ root: gitRoot });
			if (!repairedUiIndexHealth.exists) {
				const uiIndexPath = repairedUiIndexHealth.indexPath ?? resolveControlUiDistIndexPathForRoot(gitRoot);
				steps.push({
					name: "ui assets verify",
					command: `verify ${uiIndexPath}`,
					cwd: gitRoot,
					durationMs: 0,
					exitCode: 1,
					stderrTail: `missing ${uiIndexPath}`
				});
				return {
					status: "error",
					mode: "git",
					root: gitRoot,
					reason: "ui-assets-missing",
					before: {
						sha: beforeSha,
						version: beforeVersion
					},
					steps,
					durationMs: Date.now() - startedAt
				};
			}
		}
		const failedStep = steps.find((s) => s.exitCode !== 0);
		const afterShaStep = await runStep(step("git rev-parse HEAD (after)", [
			"git",
			"-C",
			gitRoot,
			"rev-parse",
			"HEAD"
		], gitRoot));
		steps.push(afterShaStep);
		const afterVersion = await readPackageVersion(gitRoot);
		return {
			status: failedStep ? "error" : "ok",
			mode: "git",
			root: gitRoot,
			reason: failedStep ? failedStep.name : void 0,
			before: {
				sha: beforeSha,
				version: beforeVersion
			},
			after: {
				sha: afterShaStep.stdoutTail?.trim() ?? null,
				version: afterVersion
			},
			steps,
			durationMs: Date.now() - startedAt
		};
	}
	if (!pkgRoot) return {
		status: "error",
		mode: "unknown",
		reason: `no root (${START_DIRS.join(",")})`,
		steps: [],
		durationMs: Date.now() - startedAt
	};
	const beforeVersion = await readPackageVersion(pkgRoot);
	const globalManager = await detectGlobalInstallManagerForRoot(runCommand, pkgRoot, timeoutMs);
	if (globalManager) {
		const packageName = await readPackageName(pkgRoot) ?? DEFAULT_PACKAGE_NAME;
		await cleanupGlobalRenameDirs({
			globalRoot: path.dirname(pkgRoot),
			packageName
		});
		const channel = opts.channel ?? DEFAULT_PACKAGE_CHANNEL;
		const updateStep = await runStep({
			runCommand,
			name: "global update",
			argv: globalInstallArgs(globalManager, `${packageName}@${normalizeTag(opts.tag ?? channelToNpmTag(channel))}`),
			cwd: pkgRoot,
			timeoutMs,
			progress,
			stepIndex: 0,
			totalSteps: 1
		});
		const steps = [updateStep];
		const afterVersion = await readPackageVersion(pkgRoot);
		return {
			status: updateStep.exitCode === 0 ? "ok" : "error",
			mode: globalManager,
			root: pkgRoot,
			reason: updateStep.exitCode === 0 ? void 0 : updateStep.name,
			before: { version: beforeVersion },
			after: { version: afterVersion },
			steps,
			durationMs: Date.now() - startedAt
		};
	}
	return {
		status: "skipped",
		mode: "unknown",
		root: pkgRoot,
		reason: "not-git-install",
		before: { version: beforeVersion },
		steps: [],
		durationMs: Date.now() - startedAt
	};
}

//#endregion
//#region src/commands/status.update.ts
async function getUpdateCheckResult(params) {
	return await checkUpdateStatus({
		root: await resolveOpenClawPackageRoot({
			moduleUrl: import.meta.url,
			argv1: process.argv[1],
			cwd: process.cwd()
		}),
		timeoutMs: params.timeoutMs,
		fetchGit: params.fetchGit,
		includeRegistry: params.includeRegistry
	});
}
function resolveUpdateAvailability(update) {
	const latestVersion = update.registry?.latestVersion ?? null;
	const registryCmp = latestVersion ? compareSemverStrings(VERSION, latestVersion) : null;
	const hasRegistryUpdate = registryCmp != null && registryCmp < 0;
	const gitBehind = update.installKind === "git" && typeof update.git?.behind === "number" ? update.git.behind : null;
	const hasGitUpdate = gitBehind != null && gitBehind > 0;
	return {
		available: hasGitUpdate || hasRegistryUpdate,
		hasGitUpdate,
		hasRegistryUpdate,
		latestVersion: hasRegistryUpdate ? latestVersion : null,
		gitBehind
	};
}
function formatUpdateAvailableHint(update) {
	const availability = resolveUpdateAvailability(update);
	if (!availability.available) return null;
	const details = [];
	if (availability.hasGitUpdate && availability.gitBehind != null) details.push(`git behind ${availability.gitBehind}`);
	if (availability.hasRegistryUpdate && availability.latestVersion) details.push(`npm ${availability.latestVersion}`);
	return `Update available${details.length > 0 ? ` (${details.join(" · ")})` : ""}. Run: ${formatCliCommand("openclaw update")}`;
}
function formatUpdateOneLiner(update) {
	const parts = [];
	if (update.installKind === "git" && update.git) {
		const branch = update.git.branch ? `git ${update.git.branch}` : "git";
		parts.push(branch);
		if (update.git.upstream) parts.push(`↔ ${update.git.upstream}`);
		if (update.git.dirty === true) parts.push("dirty");
		if (update.git.behind != null && update.git.ahead != null) {
			if (update.git.behind === 0 && update.git.ahead === 0) parts.push("up to date");
			else if (update.git.behind > 0 && update.git.ahead === 0) parts.push(`behind ${update.git.behind}`);
			else if (update.git.behind === 0 && update.git.ahead > 0) parts.push(`ahead ${update.git.ahead}`);
			else if (update.git.behind > 0 && update.git.ahead > 0) parts.push(`diverged (ahead ${update.git.ahead}, behind ${update.git.behind})`);
		}
		if (update.git.fetchOk === false) parts.push("fetch failed");
		if (update.registry?.latestVersion) {
			const cmp = compareSemverStrings(VERSION, update.registry.latestVersion);
			if (cmp === 0) parts.push(`npm latest ${update.registry.latestVersion}`);
			else if (cmp != null && cmp < 0) parts.push(`npm update ${update.registry.latestVersion}`);
			else parts.push(`npm latest ${update.registry.latestVersion} (local newer)`);
		} else if (update.registry?.error) parts.push("npm latest unknown");
	} else {
		parts.push(update.packageManager !== "unknown" ? update.packageManager : "pkg");
		if (update.registry?.latestVersion) {
			const cmp = compareSemverStrings(VERSION, update.registry.latestVersion);
			if (cmp === 0) parts.push(`npm latest ${update.registry.latestVersion}`);
			else if (cmp != null && cmp < 0) parts.push(`npm update ${update.registry.latestVersion}`);
			else parts.push(`npm latest ${update.registry.latestVersion} (local newer)`);
		} else if (update.registry?.error) parts.push("npm latest unknown");
	}
	if (update.deps) {
		if (update.deps.status === "ok") parts.push("deps ok");
		if (update.deps.status === "missing") parts.push("deps missing");
		if (update.deps.status === "stale") parts.push("deps stale");
	}
	return `Update: ${parts.join(" · ")}`;
}

//#endregion
export { ensureCompletionCacheExists as C, doctorShellCompletion as S, channelToNpmTag as _, runGatewayUpdate as a, resolveEffectiveUpdateChannel as b, detectGlobalInstallManagerForRoot as c, checkUpdateStatus as d, compareSemverStrings as f, DEFAULT_PACKAGE_CHANNEL as g, DEFAULT_GIT_CHANNEL as h, resolveUpdateAvailability as i, globalInstallArgs as l, resolveNpmChannelTag as m, formatUpdateOneLiner as n, cleanupGlobalRenameDirs as o, fetchNpmTagVersion as p, getUpdateCheckResult as r, detectGlobalInstallManagerByPresence as s, formatUpdateAvailableHint as t, resolveGlobalPackageRoot as u, formatUpdateChannelLabel as v, checkShellCompletionStatus as x, normalizeUpdateChannel as y };