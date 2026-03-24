import { y as resolveUserPath } from "./utils-CS0Ikux6.js";
import { n as runCommandWithTimeout } from "./exec-B5_AYfQG.js";
import { n as extractArchive, o as resolvePackedRootDir, r as fileExists } from "./archive-pOxyr9r4.js";
import { i as withTempDir } from "./install-source-utils-C3NuFv6M.js";
import { t as assertCanonicalPathWithinBase } from "./install-safe-path-glAp3aTO.js";
import path from "node:path";
import fs from "node:fs/promises";
//#region src/infra/install-flow.ts
async function resolveExistingInstallPath(inputPath) {
	const resolvedPath = resolveUserPath(inputPath);
	if (!await fileExists(resolvedPath)) return {
		ok: false,
		error: `path not found: ${resolvedPath}`
	};
	return {
		ok: true,
		resolvedPath,
		stat: await fs.stat(resolvedPath)
	};
}
async function withExtractedArchiveRoot(params) {
	return await withTempDir(params.tempDirPrefix, async (tmpDir) => {
		const extractDir = path.join(tmpDir, "extract");
		await fs.mkdir(extractDir, { recursive: true });
		params.logger?.info?.(`Extracting ${params.archivePath}…`);
		try {
			await extractArchive({
				archivePath: params.archivePath,
				destDir: extractDir,
				timeoutMs: params.timeoutMs,
				logger: params.logger
			});
		} catch (err) {
			return {
				ok: false,
				error: `failed to extract archive: ${String(err)}`
			};
		}
		let rootDir = "";
		try {
			rootDir = await resolvePackedRootDir(extractDir, { rootMarkers: params.rootMarkers });
		} catch (err) {
			return {
				ok: false,
				error: String(err)
			};
		}
		return await params.onExtracted(rootDir);
	});
}
//#endregion
//#region src/infra/install-package-dir.ts
const INSTALL_BASE_CHANGED_ERROR_MESSAGE = "install base directory changed during install";
const INSTALL_BASE_CHANGED_ABORT_WARNING = "Install base directory changed during install; aborting staged publish.";
const INSTALL_BASE_CHANGED_BACKUP_WARNING = "Install base directory changed before backup cleanup; leaving backup in place.";
function isObjectRecord(value) {
	return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
async function sanitizeManifestForNpmInstall(targetDir) {
	const manifestPath = path.join(targetDir, "package.json");
	let manifestRaw = "";
	try {
		manifestRaw = await fs.readFile(manifestPath, "utf-8");
	} catch {
		return;
	}
	let manifest;
	try {
		const parsed = JSON.parse(manifestRaw);
		if (!isObjectRecord(parsed)) return;
		manifest = parsed;
	} catch {
		return;
	}
	const devDependencies = manifest.devDependencies;
	if (!isObjectRecord(devDependencies)) return;
	const filteredEntries = Object.entries(devDependencies).filter(([, rawSpec]) => {
		return !(typeof rawSpec === "string" ? rawSpec.trim() : "").startsWith("workspace:");
	});
	if (filteredEntries.length === Object.keys(devDependencies).length) return;
	if (filteredEntries.length === 0) delete manifest.devDependencies;
	else manifest.devDependencies = Object.fromEntries(filteredEntries);
	await fs.writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf-8");
}
async function assertInstallBoundaryPaths(params) {
	for (const candidatePath of params.candidatePaths) await assertCanonicalPathWithinBase({
		baseDir: params.installBaseDir,
		candidatePath,
		boundaryLabel: "install directory"
	});
}
function isRelativePathInsideBase(relativePath) {
	return Boolean(relativePath) && relativePath !== ".." && !relativePath.startsWith(`..${path.sep}`);
}
function isInstallBaseChangedError(error) {
	return error instanceof Error && error.message === INSTALL_BASE_CHANGED_ERROR_MESSAGE;
}
async function assertInstallBaseStable(params) {
	const baseLstat = await fs.lstat(params.installBaseDir);
	if (!baseLstat.isDirectory() || baseLstat.isSymbolicLink()) throw new Error(INSTALL_BASE_CHANGED_ERROR_MESSAGE);
	if (await fs.realpath(params.installBaseDir) !== params.expectedRealPath) throw new Error(INSTALL_BASE_CHANGED_ERROR_MESSAGE);
}
async function cleanupInstallTempDir(dirPath) {
	if (!dirPath) return;
	await fs.rm(dirPath, {
		recursive: true,
		force: true
	}).catch(() => void 0);
}
async function resolveInstallPublishTarget(params) {
	const installBaseResolved = path.resolve(params.installBaseDir);
	const targetResolved = path.resolve(params.targetDir);
	const targetRelativePath = path.relative(installBaseResolved, targetResolved);
	if (!isRelativePathInsideBase(targetRelativePath)) throw new Error("invalid install target path");
	const installBaseRealPath = await fs.realpath(params.installBaseDir);
	return {
		installBaseRealPath,
		canonicalTargetDir: path.join(installBaseRealPath, targetRelativePath)
	};
}
async function installPackageDir(params) {
	params.logger?.info?.(`Installing to ${params.targetDir}…`);
	const installBaseDir = path.dirname(params.targetDir);
	await fs.mkdir(installBaseDir, { recursive: true });
	await assertInstallBoundaryPaths({
		installBaseDir,
		candidatePaths: [params.targetDir]
	});
	let installBaseRealPath;
	let canonicalTargetDir;
	try {
		({installBaseRealPath, canonicalTargetDir} = await resolveInstallPublishTarget({
			installBaseDir,
			targetDir: params.targetDir
		}));
	} catch (err) {
		return {
			ok: false,
			error: `${params.copyErrorPrefix}: ${String(err)}`
		};
	}
	let stageDir = null;
	let backupDir = null;
	const fail = async (error, cause) => {
		if (isInstallBaseChangedError(cause)) params.logger?.warn?.(INSTALL_BASE_CHANGED_ABORT_WARNING);
		else {
			await restoreBackup();
			if (stageDir) {
				await cleanupInstallTempDir(stageDir);
				stageDir = null;
			}
		}
		return {
			ok: false,
			error
		};
	};
	const restoreBackup = async () => {
		if (!backupDir) return;
		await fs.rename(backupDir, canonicalTargetDir).catch(() => void 0);
		backupDir = null;
	};
	try {
		await assertInstallBoundaryPaths({
			installBaseDir: installBaseRealPath,
			candidatePaths: [canonicalTargetDir]
		});
		stageDir = await fs.mkdtemp(path.join(installBaseRealPath, ".openclaw-install-stage-"));
		await fs.cp(params.sourceDir, stageDir, { recursive: true });
	} catch (err) {
		return await fail(`${params.copyErrorPrefix}: ${String(err)}`, err);
	}
	try {
		await params.afterCopy?.(stageDir);
	} catch (err) {
		return await fail(`post-copy validation failed: ${String(err)}`, err);
	}
	if (params.hasDeps) {
		await sanitizeManifestForNpmInstall(stageDir);
		params.logger?.info?.(params.depsLogMessage);
		const npmRes = await runCommandWithTimeout([
			"npm",
			"install",
			"--omit=dev",
			"--silent",
			"--ignore-scripts"
		], {
			timeoutMs: Math.max(params.timeoutMs, 3e5),
			cwd: stageDir
		});
		if (npmRes.code !== 0) return await fail(`npm install failed: ${npmRes.stderr.trim() || npmRes.stdout.trim()}`);
	}
	if (params.mode === "update" && await fileExists(canonicalTargetDir)) {
		const backupRoot = path.join(installBaseRealPath, ".openclaw-install-backups");
		backupDir = path.join(backupRoot, `${path.basename(canonicalTargetDir)}-${Date.now()}`);
		try {
			await fs.mkdir(backupRoot, { recursive: true });
			await assertInstallBoundaryPaths({
				installBaseDir: installBaseRealPath,
				candidatePaths: [backupDir]
			});
			await assertInstallBaseStable({
				installBaseDir,
				expectedRealPath: installBaseRealPath
			});
			await fs.rename(canonicalTargetDir, backupDir);
		} catch (err) {
			return await fail(`${params.copyErrorPrefix}: ${String(err)}`, err);
		}
	}
	try {
		await assertInstallBaseStable({
			installBaseDir,
			expectedRealPath: installBaseRealPath
		});
		await fs.rename(stageDir, canonicalTargetDir);
		stageDir = null;
	} catch (err) {
		return await fail(`${params.copyErrorPrefix}: ${String(err)}`, err);
	}
	if (backupDir) try {
		await assertInstallBaseStable({
			installBaseDir,
			expectedRealPath: installBaseRealPath
		});
	} catch (err) {
		if (isInstallBaseChangedError(err)) params.logger?.warn?.(INSTALL_BASE_CHANGED_BACKUP_WARNING);
		backupDir = null;
	}
	if (backupDir) await fs.rm(backupDir, {
		recursive: true,
		force: true
	}).catch(() => void 0);
	if (stageDir) await cleanupInstallTempDir(stageDir);
	return { ok: true };
}
async function installPackageDirWithManifestDeps(params) {
	return installPackageDir({
		...params,
		hasDeps: Object.keys(params.manifestDependencies ?? {}).length > 0
	});
}
//#endregion
export { withExtractedArchiveRoot as i, installPackageDirWithManifestDeps as n, resolveExistingInstallPath as r, installPackageDir as t };
