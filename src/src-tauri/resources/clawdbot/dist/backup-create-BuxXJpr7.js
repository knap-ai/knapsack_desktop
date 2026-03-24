import { _ as resolveStateDir, h as resolveOAuthDir, o as resolveConfigPath } from "./paths-ViKUYWUK.js";
import { S as shortenHomePath, _ as resolveHomeDir, h as pathExists, x as shortenHomeInString, y as resolveUserPath } from "./utils-CS0Ikux6.js";
import { g as resolveDefaultAgentWorkspaceDir } from "./workspace-D4K6QX9X.js";
import { d as readConfigFileSnapshot } from "./io-y3Az_Onx.js";
import { o as resolveRuntimeServiceVersion } from "./version-CD3oP1-d.js";
import { t as formatSessionArchiveTimestamp } from "./artifacts-BB7bT-zn.js";
import { constants } from "node:fs";
import path from "node:path";
import os from "node:os";
import fs$1 from "node:fs/promises";
import { randomUUID } from "node:crypto";
import * as tar from "tar";
//#region src/commands/cleanup-utils.ts
function collectWorkspaceDirs(cfg) {
	const dirs = /* @__PURE__ */ new Set();
	const defaults = cfg?.agents?.defaults;
	if (typeof defaults?.workspace === "string" && defaults.workspace.trim()) dirs.add(resolveUserPath(defaults.workspace));
	const list = Array.isArray(cfg?.agents?.list) ? cfg?.agents?.list : [];
	for (const agent of list) {
		const workspace = agent.workspace;
		if (typeof workspace === "string" && workspace.trim()) dirs.add(resolveUserPath(workspace));
	}
	if (dirs.size === 0) dirs.add(resolveDefaultAgentWorkspaceDir());
	return [...dirs];
}
function buildCleanupPlan(params) {
	return {
		configInsideState: isPathWithin(params.configPath, params.stateDir),
		oauthInsideState: isPathWithin(params.oauthDir, params.stateDir),
		workspaceDirs: collectWorkspaceDirs(params.cfg)
	};
}
function isPathWithin(child, parent) {
	const relative = path.relative(parent, child);
	return relative === "" || !relative.startsWith("..") && !path.isAbsolute(relative);
}
function isUnsafeRemovalTarget(target) {
	if (!target.trim()) return true;
	const resolved = path.resolve(target);
	if (resolved === path.parse(resolved).root) return true;
	const home = resolveHomeDir();
	if (home && resolved === path.resolve(home)) return true;
	return false;
}
async function removePath(target, runtime, opts) {
	if (!target?.trim()) return {
		ok: false,
		skipped: true
	};
	const resolved = path.resolve(target);
	const displayLabel = shortenHomeInString(opts?.label ?? resolved);
	if (isUnsafeRemovalTarget(resolved)) {
		runtime.error(`Refusing to remove unsafe path: ${displayLabel}`);
		return { ok: false };
	}
	if (opts?.dryRun) {
		runtime.log(`[dry-run] remove ${displayLabel}`);
		return {
			ok: true,
			skipped: true
		};
	}
	try {
		await fs$1.rm(resolved, {
			recursive: true,
			force: true
		});
		runtime.log(`Removed ${displayLabel}`);
		return { ok: true };
	} catch (err) {
		runtime.error(`Failed to remove ${displayLabel}: ${String(err)}`);
		return { ok: false };
	}
}
async function removeStateAndLinkedPaths(cleanup, runtime, opts) {
	await removePath(cleanup.stateDir, runtime, {
		dryRun: opts?.dryRun,
		label: cleanup.stateDir
	});
	if (!cleanup.configInsideState) await removePath(cleanup.configPath, runtime, {
		dryRun: opts?.dryRun,
		label: cleanup.configPath
	});
	if (!cleanup.oauthInsideState) await removePath(cleanup.oauthDir, runtime, {
		dryRun: opts?.dryRun,
		label: cleanup.oauthDir
	});
}
async function removeWorkspaceDirs(workspaceDirs, runtime, opts) {
	for (const workspace of workspaceDirs) await removePath(workspace, runtime, {
		dryRun: opts?.dryRun,
		label: workspace
	});
}
async function listAgentSessionDirs(stateDir) {
	const root = path.join(stateDir, "agents");
	try {
		return (await fs$1.readdir(root, { withFileTypes: true })).filter((entry) => entry.isDirectory()).map((entry) => path.join(root, entry.name, "sessions"));
	} catch {
		return [];
	}
}
//#endregion
//#region src/commands/backup-shared.ts
function backupAssetPriority(kind) {
	switch (kind) {
		case "state": return 0;
		case "config": return 1;
		case "credentials": return 2;
		case "workspace": return 3;
	}
}
function buildBackupArchiveRoot(nowMs = Date.now()) {
	return `${formatSessionArchiveTimestamp(nowMs)}-openclaw-backup`;
}
function buildBackupArchiveBasename(nowMs = Date.now()) {
	return `${buildBackupArchiveRoot(nowMs)}.tar.gz`;
}
function encodeAbsolutePathForBackupArchive(sourcePath) {
	const normalized = sourcePath.replaceAll("\\", "/");
	const windowsMatch = normalized.match(/^([A-Za-z]):\/(.*)$/);
	if (windowsMatch) {
		const drive = windowsMatch[1]?.toUpperCase() ?? "UNKNOWN";
		const rest = windowsMatch[2] ?? "";
		return path.posix.join("windows", drive, rest);
	}
	if (normalized.startsWith("/")) return path.posix.join("posix", normalized.slice(1));
	return path.posix.join("relative", normalized);
}
function buildBackupArchivePath(archiveRoot, sourcePath) {
	return path.posix.join(archiveRoot, "payload", encodeAbsolutePathForBackupArchive(sourcePath));
}
function compareCandidates(left, right) {
	const depthDelta = left.canonicalPath.length - right.canonicalPath.length;
	if (depthDelta !== 0) return depthDelta;
	const priorityDelta = backupAssetPriority(left.kind) - backupAssetPriority(right.kind);
	if (priorityDelta !== 0) return priorityDelta;
	return left.canonicalPath.localeCompare(right.canonicalPath);
}
async function canonicalizeExistingPath(targetPath) {
	try {
		return await fs$1.realpath(targetPath);
	} catch {
		return path.resolve(targetPath);
	}
}
async function resolveBackupPlanFromDisk(params = {}) {
	const includeWorkspace = params.includeWorkspace ?? true;
	const onlyConfig = params.onlyConfig ?? false;
	const stateDir = resolveStateDir();
	const configPath = resolveConfigPath();
	const oauthDir = resolveOAuthDir();
	const archiveRoot = buildBackupArchiveRoot(params.nowMs);
	if (onlyConfig) {
		const resolvedConfigPath = path.resolve(configPath);
		if (!await pathExists(resolvedConfigPath)) return {
			stateDir,
			configPath,
			oauthDir,
			workspaceDirs: [],
			included: [],
			skipped: [{
				kind: "config",
				sourcePath: resolvedConfigPath,
				displayPath: shortenHomePath(resolvedConfigPath),
				reason: "missing"
			}]
		};
		const canonicalConfigPath = await canonicalizeExistingPath(resolvedConfigPath);
		return {
			stateDir,
			configPath,
			oauthDir,
			workspaceDirs: [],
			included: [{
				kind: "config",
				sourcePath: canonicalConfigPath,
				displayPath: shortenHomePath(canonicalConfigPath),
				archivePath: buildBackupArchivePath(archiveRoot, canonicalConfigPath)
			}],
			skipped: []
		};
	}
	const configSnapshot = await readConfigFileSnapshot();
	if (includeWorkspace && configSnapshot.exists && !configSnapshot.valid) throw new Error(`Config invalid at ${shortenHomePath(configSnapshot.path)}. OpenClaw cannot reliably discover custom workspaces for backup. Fix the config or rerun with --no-include-workspace for a partial backup.`);
	const cleanupPlan = buildCleanupPlan({
		cfg: configSnapshot.config,
		stateDir,
		configPath,
		oauthDir
	});
	const workspaceDirs = includeWorkspace ? cleanupPlan.workspaceDirs : [];
	const rawCandidates = [
		{
			kind: "state",
			sourcePath: path.resolve(stateDir)
		},
		...cleanupPlan.configInsideState ? [] : [{
			kind: "config",
			sourcePath: path.resolve(configPath)
		}],
		...cleanupPlan.oauthInsideState ? [] : [{
			kind: "credentials",
			sourcePath: path.resolve(oauthDir)
		}],
		...includeWorkspace ? workspaceDirs.map((workspaceDir) => ({
			kind: "workspace",
			sourcePath: path.resolve(workspaceDir)
		})) : []
	];
	const candidates = await Promise.all(rawCandidates.map(async (candidate) => {
		const exists = await pathExists(candidate.sourcePath);
		return {
			...candidate,
			exists,
			canonicalPath: exists ? await canonicalizeExistingPath(candidate.sourcePath) : path.resolve(candidate.sourcePath)
		};
	}));
	const uniqueCandidates = [];
	const seenCanonicalPaths = /* @__PURE__ */ new Set();
	for (const candidate of [...candidates].toSorted(compareCandidates)) {
		if (seenCanonicalPaths.has(candidate.canonicalPath)) continue;
		seenCanonicalPaths.add(candidate.canonicalPath);
		uniqueCandidates.push(candidate);
	}
	const included = [];
	const skipped = [];
	for (const candidate of uniqueCandidates) {
		if (!candidate.exists) {
			skipped.push({
				kind: candidate.kind,
				sourcePath: candidate.sourcePath,
				displayPath: shortenHomePath(candidate.sourcePath),
				reason: "missing"
			});
			continue;
		}
		const coveredBy = included.find((asset) => isPathWithin(candidate.canonicalPath, asset.sourcePath));
		if (coveredBy) {
			skipped.push({
				kind: candidate.kind,
				sourcePath: candidate.canonicalPath,
				displayPath: shortenHomePath(candidate.canonicalPath),
				reason: "covered",
				coveredBy: coveredBy.displayPath
			});
			continue;
		}
		included.push({
			kind: candidate.kind,
			sourcePath: candidate.canonicalPath,
			displayPath: shortenHomePath(candidate.canonicalPath),
			archivePath: buildBackupArchivePath(archiveRoot, candidate.canonicalPath)
		});
	}
	return {
		stateDir,
		configPath,
		oauthDir,
		workspaceDirs: workspaceDirs.map((entry) => path.resolve(entry)),
		included,
		skipped
	};
}
//#endregion
//#region src/infra/backup-create.ts
async function resolveOutputPath(params) {
	const basename = buildBackupArchiveBasename(params.nowMs);
	const rawOutput = params.output?.trim();
	if (!rawOutput) {
		const cwd = path.resolve(process.cwd());
		const canonicalCwd = await fs$1.realpath(cwd).catch(() => cwd);
		const defaultDir = params.includedAssets.some((asset) => isPathWithin(canonicalCwd, asset.sourcePath)) ? resolveHomeDir() ?? path.dirname(params.stateDir) : cwd;
		return path.resolve(defaultDir, basename);
	}
	const resolved = resolveUserPath(rawOutput);
	if (rawOutput.endsWith("/") || rawOutput.endsWith("\\")) return path.join(resolved, basename);
	try {
		if ((await fs$1.stat(resolved)).isDirectory()) return path.join(resolved, basename);
	} catch {}
	return resolved;
}
async function assertOutputPathReady(outputPath) {
	try {
		await fs$1.access(outputPath);
		throw new Error(`Refusing to overwrite existing backup archive: ${outputPath}`);
	} catch (err) {
		if (err?.code === "ENOENT") return;
		throw err;
	}
}
function buildTempArchivePath(outputPath) {
	return `${outputPath}.${randomUUID()}.tmp`;
}
function isLinkUnsupportedError(code) {
	return code === "ENOTSUP" || code === "EOPNOTSUPP" || code === "EPERM";
}
async function publishTempArchive(params) {
	try {
		await fs$1.link(params.tempArchivePath, params.outputPath);
	} catch (err) {
		const code = err?.code;
		if (code === "EEXIST") throw new Error(`Refusing to overwrite existing backup archive: ${params.outputPath}`, { cause: err });
		if (!isLinkUnsupportedError(code)) throw err;
		try {
			await fs$1.copyFile(params.tempArchivePath, params.outputPath, constants.COPYFILE_EXCL);
		} catch (copyErr) {
			const copyCode = copyErr?.code;
			if (copyCode !== "EEXIST") await fs$1.rm(params.outputPath, { force: true }).catch(() => void 0);
			if (copyCode === "EEXIST") throw new Error(`Refusing to overwrite existing backup archive: ${params.outputPath}`, { cause: copyErr });
			throw copyErr;
		}
	}
	await fs$1.rm(params.tempArchivePath, { force: true });
}
async function canonicalizePathForContainment(targetPath) {
	const resolved = path.resolve(targetPath);
	const suffix = [];
	let probe = resolved;
	while (true) try {
		const realProbe = await fs$1.realpath(probe);
		return suffix.length === 0 ? realProbe : path.join(realProbe, ...suffix.toReversed());
	} catch {
		const parent = path.dirname(probe);
		if (parent === probe) return resolved;
		suffix.push(path.basename(probe));
		probe = parent;
	}
}
function buildManifest(params) {
	return {
		schemaVersion: 1,
		createdAt: params.createdAt,
		archiveRoot: params.archiveRoot,
		runtimeVersion: resolveRuntimeServiceVersion(),
		platform: process.platform,
		nodeVersion: process.version,
		options: {
			includeWorkspace: params.includeWorkspace,
			onlyConfig: params.onlyConfig
		},
		paths: {
			stateDir: params.stateDir,
			configPath: params.configPath,
			oauthDir: params.oauthDir,
			workspaceDirs: params.workspaceDirs
		},
		assets: params.assets.map((asset) => ({
			kind: asset.kind,
			sourcePath: asset.sourcePath,
			archivePath: asset.archivePath
		})),
		skipped: params.skipped.map((entry) => ({
			kind: entry.kind,
			sourcePath: entry.sourcePath,
			reason: entry.reason,
			coveredBy: entry.coveredBy
		}))
	};
}
function formatBackupCreateSummary(result) {
	const lines = [`Backup archive: ${result.archivePath}`];
	lines.push(`Included ${result.assets.length} path${result.assets.length === 1 ? "" : "s"}:`);
	for (const asset of result.assets) lines.push(`- ${asset.kind}: ${asset.displayPath}`);
	if (result.skipped.length > 0) {
		lines.push(`Skipped ${result.skipped.length} path${result.skipped.length === 1 ? "" : "s"}:`);
		for (const entry of result.skipped) if (entry.reason === "covered" && entry.coveredBy) lines.push(`- ${entry.kind}: ${entry.displayPath} (${entry.reason} by ${entry.coveredBy})`);
		else lines.push(`- ${entry.kind}: ${entry.displayPath} (${entry.reason})`);
	}
	if (result.dryRun) lines.push("Dry run only; archive was not written.");
	else {
		lines.push(`Created ${result.archivePath}`);
		if (result.verified) lines.push("Archive verification: passed");
	}
	return lines;
}
function remapArchiveEntryPath(params) {
	const normalizedEntry = path.resolve(params.entryPath);
	if (normalizedEntry === params.manifestPath) return path.posix.join(params.archiveRoot, "manifest.json");
	return buildBackupArchivePath(params.archiveRoot, normalizedEntry);
}
async function createBackupArchive(opts = {}) {
	const nowMs = opts.nowMs ?? Date.now();
	const archiveRoot = buildBackupArchiveRoot(nowMs);
	const onlyConfig = Boolean(opts.onlyConfig);
	const includeWorkspace = onlyConfig ? false : opts.includeWorkspace ?? true;
	const plan = await resolveBackupPlanFromDisk({
		includeWorkspace,
		onlyConfig,
		nowMs
	});
	const outputPath = await resolveOutputPath({
		output: opts.output,
		nowMs,
		includedAssets: plan.included,
		stateDir: plan.stateDir
	});
	if (plan.included.length === 0) throw new Error(onlyConfig ? "No OpenClaw config file was found to back up." : "No local OpenClaw state was found to back up.");
	const canonicalOutputPath = await canonicalizePathForContainment(outputPath);
	const overlappingAsset = plan.included.find((asset) => isPathWithin(canonicalOutputPath, asset.sourcePath));
	if (overlappingAsset) throw new Error(`Backup output must not be written inside a source path: ${outputPath} is inside ${overlappingAsset.sourcePath}`);
	if (!opts.dryRun) await assertOutputPathReady(outputPath);
	const createdAt = new Date(nowMs).toISOString();
	const result = {
		createdAt,
		archiveRoot,
		archivePath: outputPath,
		dryRun: Boolean(opts.dryRun),
		includeWorkspace,
		onlyConfig,
		verified: false,
		assets: plan.included,
		skipped: plan.skipped
	};
	if (opts.dryRun) return result;
	await fs$1.mkdir(path.dirname(outputPath), { recursive: true });
	const tempDir = await fs$1.mkdtemp(path.join(os.tmpdir(), "openclaw-backup-"));
	const manifestPath = path.join(tempDir, "manifest.json");
	const tempArchivePath = buildTempArchivePath(outputPath);
	try {
		const manifest = buildManifest({
			createdAt,
			archiveRoot,
			includeWorkspace,
			onlyConfig,
			assets: result.assets,
			skipped: result.skipped,
			stateDir: plan.stateDir,
			configPath: plan.configPath,
			oauthDir: plan.oauthDir,
			workspaceDirs: plan.workspaceDirs
		});
		await fs$1.writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
		await tar.c({
			file: tempArchivePath,
			gzip: true,
			portable: true,
			preservePaths: true,
			onWriteEntry: (entry) => {
				entry.path = remapArchiveEntryPath({
					entryPath: entry.path,
					manifestPath,
					archiveRoot
				});
			}
		}, [manifestPath, ...result.assets.map((asset) => asset.sourcePath)]);
		await publishTempArchive({
			tempArchivePath,
			outputPath
		});
	} finally {
		await fs$1.rm(tempArchivePath, { force: true }).catch(() => void 0);
		await fs$1.rm(tempDir, {
			recursive: true,
			force: true
		}).catch(() => void 0);
	}
	return result;
}
//#endregion
export { removePath as a, listAgentSessionDirs as i, formatBackupCreateSummary as n, removeStateAndLinkedPaths as o, buildCleanupPlan as r, removeWorkspaceDirs as s, createBackupArchive as t };
