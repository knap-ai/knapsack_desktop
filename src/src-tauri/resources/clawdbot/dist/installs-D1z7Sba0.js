import { t as CONFIG_DIR, y as resolveUserPath } from "./utils-q1rHOG-N.js";
import { t as runCommandWithTimeout } from "./exec-B52LZOrO.js";
import { a as MANIFEST_KEY } from "./manifest-registry-DlFh5LWe.js";
import { a as resolvePackedRootDir, i as resolveArchiveKind, n as fileExists, r as readJsonFile, t as extractArchive } from "./archive-unczA8_5.js";
import { t as scanDirectoryWithSummary } from "./skill-scanner-DFG_N86N.js";
import path from "node:path";
import os from "node:os";
import fs from "node:fs/promises";

//#region src/plugins/install.ts
const defaultLogger = {};
function unscopedPackageName(name) {
	const trimmed = name.trim();
	if (!trimmed) return trimmed;
	return trimmed.includes("/") ? trimmed.split("/").pop() ?? trimmed : trimmed;
}
function safeDirName(input) {
	const trimmed = input.trim();
	if (!trimmed) return trimmed;
	return trimmed.replaceAll("/", "__").replaceAll("\\", "__");
}
function safeFileName(input) {
	return safeDirName(input);
}
function validatePluginId(pluginId) {
	if (!pluginId) return "invalid plugin name: missing";
	if (pluginId === "." || pluginId === "..") return "invalid plugin name: reserved path segment";
	if (pluginId.includes("/") || pluginId.includes("\\")) return "invalid plugin name: path separators not allowed";
	return null;
}
function isPathInside(basePath, candidatePath) {
	const base = path.resolve(basePath);
	const candidate = path.resolve(candidatePath);
	const rel = path.relative(base, candidate);
	return rel === "" || !rel.startsWith(`..${path.sep}`) && rel !== ".." && !path.isAbsolute(rel);
}
function extensionUsesSkippedScannerPath(entry) {
	return entry.split(/[\\/]+/).filter(Boolean).some((segment) => segment === "node_modules" || segment.startsWith(".") && segment !== "." && segment !== "..");
}
async function ensureOpenClawExtensions(manifest) {
	const extensions = manifest[MANIFEST_KEY]?.extensions;
	if (!Array.isArray(extensions)) throw new Error("package.json missing openclaw.extensions");
	const list = extensions.map((e) => typeof e === "string" ? e.trim() : "").filter(Boolean);
	if (list.length === 0) throw new Error("package.json openclaw.extensions is empty");
	return list;
}
function resolvePluginInstallDir(pluginId, extensionsDir) {
	const extensionsBase = extensionsDir ? resolveUserPath(extensionsDir) : path.join(CONFIG_DIR, "extensions");
	const pluginIdError = validatePluginId(pluginId);
	if (pluginIdError) throw new Error(pluginIdError);
	const targetDirResult = resolveSafeInstallDir(extensionsBase, pluginId);
	if (!targetDirResult.ok) throw new Error(targetDirResult.error);
	return targetDirResult.path;
}
function resolveSafeInstallDir(extensionsDir, pluginId) {
	const targetDir = path.join(extensionsDir, safeDirName(pluginId));
	const resolvedBase = path.resolve(extensionsDir);
	const resolvedTarget = path.resolve(targetDir);
	const relative = path.relative(resolvedBase, resolvedTarget);
	if (!relative || relative === ".." || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative)) return {
		ok: false,
		error: "invalid plugin name: path traversal detected"
	};
	return {
		ok: true,
		path: targetDir
	};
}
async function installPluginFromPackageDir(params) {
	const logger = params.logger ?? defaultLogger;
	const timeoutMs = params.timeoutMs ?? 12e4;
	const mode = params.mode ?? "install";
	const dryRun = params.dryRun ?? false;
	const manifestPath = path.join(params.packageDir, "package.json");
	if (!await fileExists(manifestPath)) return {
		ok: false,
		error: "extracted package missing package.json"
	};
	let manifest;
	try {
		manifest = await readJsonFile(manifestPath);
	} catch (err) {
		return {
			ok: false,
			error: `invalid package.json: ${String(err)}`
		};
	}
	let extensions;
	try {
		extensions = await ensureOpenClawExtensions(manifest);
	} catch (err) {
		return {
			ok: false,
			error: String(err)
		};
	}
	const pkgName = typeof manifest.name === "string" ? manifest.name : "";
	const pluginId = pkgName ? unscopedPackageName(pkgName) : "plugin";
	const pluginIdError = validatePluginId(pluginId);
	if (pluginIdError) return {
		ok: false,
		error: pluginIdError
	};
	if (params.expectedPluginId && params.expectedPluginId !== pluginId) return {
		ok: false,
		error: `plugin id mismatch: expected ${params.expectedPluginId}, got ${pluginId}`
	};
	const packageDir = path.resolve(params.packageDir);
	const forcedScanEntries = [];
	for (const entry of extensions) {
		const resolvedEntry = path.resolve(packageDir, entry);
		if (!isPathInside(packageDir, resolvedEntry)) {
			logger.warn?.(`extension entry escapes plugin directory and will not be scanned: ${entry}`);
			continue;
		}
		if (extensionUsesSkippedScannerPath(entry)) logger.warn?.(`extension entry is in a hidden/node_modules path and will receive targeted scan coverage: ${entry}`);
		forcedScanEntries.push(resolvedEntry);
	}
	try {
		const scanSummary = await scanDirectoryWithSummary(params.packageDir, { includeFiles: forcedScanEntries });
		if (scanSummary.critical > 0) {
			const criticalDetails = scanSummary.findings.filter((f) => f.severity === "critical").map((f) => `${f.message} (${f.file}:${f.line})`).join("; ");
			logger.warn?.(`WARNING: Plugin "${pluginId}" contains dangerous code patterns: ${criticalDetails}`);
		} else if (scanSummary.warn > 0) logger.warn?.(`Plugin "${pluginId}" has ${scanSummary.warn} suspicious code pattern(s). Run "openclaw security audit --deep" for details.`);
	} catch (err) {
		logger.warn?.(`Plugin "${pluginId}" code safety scan failed (${String(err)}). Installation continues; run "openclaw security audit --deep" after install.`);
	}
	const extensionsDir = params.extensionsDir ? resolveUserPath(params.extensionsDir) : path.join(CONFIG_DIR, "extensions");
	await fs.mkdir(extensionsDir, { recursive: true });
	const targetDirResult = resolveSafeInstallDir(extensionsDir, pluginId);
	if (!targetDirResult.ok) return {
		ok: false,
		error: targetDirResult.error
	};
	const targetDir = targetDirResult.path;
	if (mode === "install" && await fileExists(targetDir)) return {
		ok: false,
		error: `plugin already exists: ${targetDir} (delete it first)`
	};
	if (dryRun) return {
		ok: true,
		pluginId,
		targetDir,
		manifestName: pkgName || void 0,
		version: typeof manifest.version === "string" ? manifest.version : void 0,
		extensions
	};
	logger.info?.(`Installing to ${targetDir}…`);
	let backupDir = null;
	if (mode === "update" && await fileExists(targetDir)) {
		backupDir = `${targetDir}.backup-${Date.now()}`;
		await fs.rename(targetDir, backupDir);
	}
	try {
		await fs.cp(params.packageDir, targetDir, { recursive: true });
	} catch (err) {
		if (backupDir) {
			await fs.rm(targetDir, {
				recursive: true,
				force: true
			}).catch(() => void 0);
			await fs.rename(backupDir, targetDir).catch(() => void 0);
		}
		return {
			ok: false,
			error: `failed to copy plugin: ${String(err)}`
		};
	}
	for (const entry of extensions) {
		const resolvedEntry = path.resolve(targetDir, entry);
		if (!isPathInside(targetDir, resolvedEntry)) {
			logger.warn?.(`extension entry escapes plugin directory: ${entry}`);
			continue;
		}
		if (!await fileExists(resolvedEntry)) logger.warn?.(`extension entry not found: ${entry}`);
	}
	const deps = manifest.dependencies ?? {};
	if (Object.keys(deps).length > 0) {
		logger.info?.("Installing plugin dependencies…");
		const npmRes = await runCommandWithTimeout([
			"npm",
			"install",
			"--omit=dev",
			"--silent",
			"--ignore-scripts"
		], {
			timeoutMs: Math.max(timeoutMs, 3e5),
			cwd: targetDir
		});
		if (npmRes.code !== 0) {
			if (backupDir) {
				await fs.rm(targetDir, {
					recursive: true,
					force: true
				}).catch(() => void 0);
				await fs.rename(backupDir, targetDir).catch(() => void 0);
			}
			return {
				ok: false,
				error: `npm install failed: ${npmRes.stderr.trim() || npmRes.stdout.trim()}`
			};
		}
	}
	if (backupDir) await fs.rm(backupDir, {
		recursive: true,
		force: true
	}).catch(() => void 0);
	return {
		ok: true,
		pluginId,
		targetDir,
		manifestName: pkgName || void 0,
		version: typeof manifest.version === "string" ? manifest.version : void 0,
		extensions
	};
}
async function installPluginFromArchive(params) {
	const logger = params.logger ?? defaultLogger;
	const timeoutMs = params.timeoutMs ?? 12e4;
	const mode = params.mode ?? "install";
	const archivePath = resolveUserPath(params.archivePath);
	if (!await fileExists(archivePath)) return {
		ok: false,
		error: `archive not found: ${archivePath}`
	};
	if (!resolveArchiveKind(archivePath)) return {
		ok: false,
		error: `unsupported archive: ${archivePath}`
	};
	const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "openclaw-plugin-"));
	const extractDir = path.join(tmpDir, "extract");
	await fs.mkdir(extractDir, { recursive: true });
	logger.info?.(`Extracting ${archivePath}…`);
	try {
		await extractArchive({
			archivePath,
			destDir: extractDir,
			timeoutMs,
			logger
		});
	} catch (err) {
		return {
			ok: false,
			error: `failed to extract archive: ${String(err)}`
		};
	}
	let packageDir = "";
	try {
		packageDir = await resolvePackedRootDir(extractDir);
	} catch (err) {
		return {
			ok: false,
			error: String(err)
		};
	}
	return await installPluginFromPackageDir({
		packageDir,
		extensionsDir: params.extensionsDir,
		timeoutMs,
		logger,
		mode,
		dryRun: params.dryRun,
		expectedPluginId: params.expectedPluginId
	});
}
async function installPluginFromDir(params) {
	const dirPath = resolveUserPath(params.dirPath);
	if (!await fileExists(dirPath)) return {
		ok: false,
		error: `directory not found: ${dirPath}`
	};
	if (!(await fs.stat(dirPath)).isDirectory()) return {
		ok: false,
		error: `not a directory: ${dirPath}`
	};
	return await installPluginFromPackageDir({
		packageDir: dirPath,
		extensionsDir: params.extensionsDir,
		timeoutMs: params.timeoutMs,
		logger: params.logger,
		mode: params.mode,
		dryRun: params.dryRun,
		expectedPluginId: params.expectedPluginId
	});
}
async function installPluginFromFile(params) {
	const logger = params.logger ?? defaultLogger;
	const mode = params.mode ?? "install";
	const dryRun = params.dryRun ?? false;
	const filePath = resolveUserPath(params.filePath);
	if (!await fileExists(filePath)) return {
		ok: false,
		error: `file not found: ${filePath}`
	};
	const extensionsDir = params.extensionsDir ? resolveUserPath(params.extensionsDir) : path.join(CONFIG_DIR, "extensions");
	await fs.mkdir(extensionsDir, { recursive: true });
	const pluginId = path.basename(filePath, path.extname(filePath)) || "plugin";
	const pluginIdError = validatePluginId(pluginId);
	if (pluginIdError) return {
		ok: false,
		error: pluginIdError
	};
	const targetFile = path.join(extensionsDir, `${safeFileName(pluginId)}${path.extname(filePath)}`);
	if (mode === "install" && await fileExists(targetFile)) return {
		ok: false,
		error: `plugin already exists: ${targetFile} (delete it first)`
	};
	if (dryRun) return {
		ok: true,
		pluginId,
		targetDir: targetFile,
		manifestName: void 0,
		version: void 0,
		extensions: [path.basename(targetFile)]
	};
	logger.info?.(`Installing to ${targetFile}…`);
	await fs.copyFile(filePath, targetFile);
	return {
		ok: true,
		pluginId,
		targetDir: targetFile,
		manifestName: void 0,
		version: void 0,
		extensions: [path.basename(targetFile)]
	};
}
async function installPluginFromNpmSpec(params) {
	const logger = params.logger ?? defaultLogger;
	const timeoutMs = params.timeoutMs ?? 12e4;
	const mode = params.mode ?? "install";
	const dryRun = params.dryRun ?? false;
	const expectedPluginId = params.expectedPluginId;
	const spec = params.spec.trim();
	if (!spec) return {
		ok: false,
		error: "missing npm spec"
	};
	const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "openclaw-npm-pack-"));
	logger.info?.(`Downloading ${spec}…`);
	const res = await runCommandWithTimeout([
		"npm",
		"pack",
		spec
	], {
		timeoutMs: Math.max(timeoutMs, 3e5),
		cwd: tmpDir,
		env: { COREPACK_ENABLE_DOWNLOAD_PROMPT: "0" }
	});
	if (res.code !== 0) return {
		ok: false,
		error: `npm pack failed: ${res.stderr.trim() || res.stdout.trim()}`
	};
	const packed = (res.stdout || "").split("\n").map((l) => l.trim()).filter(Boolean).pop();
	if (!packed) return {
		ok: false,
		error: "npm pack produced no archive"
	};
	return await installPluginFromArchive({
		archivePath: path.join(tmpDir, packed),
		extensionsDir: params.extensionsDir,
		timeoutMs,
		logger,
		mode,
		dryRun,
		expectedPluginId
	});
}
async function installPluginFromPath(params) {
	const resolved = resolveUserPath(params.path);
	if (!await fileExists(resolved)) return {
		ok: false,
		error: `path not found: ${resolved}`
	};
	if ((await fs.stat(resolved)).isDirectory()) return await installPluginFromDir({
		dirPath: resolved,
		extensionsDir: params.extensionsDir,
		timeoutMs: params.timeoutMs,
		logger: params.logger,
		mode: params.mode,
		dryRun: params.dryRun,
		expectedPluginId: params.expectedPluginId
	});
	if (resolveArchiveKind(resolved)) return await installPluginFromArchive({
		archivePath: resolved,
		extensionsDir: params.extensionsDir,
		timeoutMs: params.timeoutMs,
		logger: params.logger,
		mode: params.mode,
		dryRun: params.dryRun,
		expectedPluginId: params.expectedPluginId
	});
	return await installPluginFromFile({
		filePath: resolved,
		extensionsDir: params.extensionsDir,
		logger: params.logger,
		mode: params.mode,
		dryRun: params.dryRun
	});
}

//#endregion
//#region src/plugins/installs.ts
function recordPluginInstall(cfg, update) {
	const { pluginId, ...record } = update;
	const installs = {
		...cfg.plugins?.installs,
		[pluginId]: {
			...cfg.plugins?.installs?.[pluginId],
			...record,
			installedAt: record.installedAt ?? (/* @__PURE__ */ new Date()).toISOString()
		}
	};
	return {
		...cfg,
		plugins: {
			...cfg.plugins,
			installs: {
				...installs,
				[pluginId]: installs[pluginId]
			}
		}
	};
}

//#endregion
export { resolvePluginInstallDir as i, installPluginFromNpmSpec as n, installPluginFromPath as r, recordPluginInstall as t };