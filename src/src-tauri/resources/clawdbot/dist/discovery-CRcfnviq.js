import { a as normalizeLowercaseStringOrEmpty, c as normalizeOptionalString, s as normalizeOptionalLowercaseString } from "./string-coerce-Bje8XVt9.js";
import { d as resolveConfigDir, p as resolveUserPath } from "./utils-DvkbxKCZ.js";
import { t as resolveBundledPluginsDir } from "./bundled-dir-DygrJuRr.js";
import { i as openBoundaryFileSync } from "./boundary-file-read-C8TEdk8a.js";
import { a as resolvePackageExtensionEntries, i as loadPluginManifest, r as getPackageManifestMetadata, t as DEFAULT_PLUGIN_ENTRY_CANDIDATES } from "./manifest-DkU_xlZi.js";
import { c as detectBundleManifestFormat, i as safeStatSync, l as loadBundleManifest, n as isPathInside, r as safeRealpathSync, t as formatPosixMode } from "./path-safety-CrnL8Kkz.js";
import { n as resolvePackageSetupSource, t as resolvePackageRuntimeExtensionSources } from "./package-entry-resolution-BgEPolxj.js";
import fs from "node:fs";
import path from "node:path";
//#region src/plugins/bundled-load-path-aliases.ts
const PACKAGED_BUNDLED_ROOTS = [path.join("dist", "extensions"), path.join("dist-runtime", "extensions")];
function normalizeBundledLookupPath(targetPath) {
	const normalized = path.normalize(targetPath);
	const root = path.parse(normalized).root;
	let trimmed = normalized;
	while (trimmed.length > root.length && (trimmed.endsWith(path.sep) || trimmed.endsWith("/"))) trimmed = trimmed.slice(0, -1);
	return trimmed;
}
function findPackagedBundledRoot(localPath) {
	const normalized = normalizeBundledLookupPath(localPath);
	for (const packagedRoot of PACKAGED_BUNDLED_ROOTS) {
		const marker = `${path.sep}${packagedRoot}`;
		const markerIndex = normalized.lastIndexOf(marker);
		if (markerIndex === -1) continue;
		const markerEnd = markerIndex + marker.length;
		if (normalized.length !== markerEnd && normalized[markerEnd] !== path.sep) continue;
		return {
			packageRoot: normalized.slice(0, markerIndex),
			bundledRoot: normalized.slice(0, markerEnd)
		};
	}
	return null;
}
function buildLegacyBundledPath(localPath) {
	const packaged = findPackagedBundledRoot(localPath);
	if (!packaged) return null;
	const normalized = normalizeBundledLookupPath(localPath);
	const bundledLeaf = normalized === packaged.bundledRoot ? "" : normalized.slice(packaged.bundledRoot.length + path.sep.length);
	return bundledLeaf ? path.join(packaged.packageRoot, "extensions", bundledLeaf) : null;
}
function buildLegacyBundledRootPath(localPath) {
	const packaged = findPackagedBundledRoot(localPath);
	return packaged ? path.join(packaged.packageRoot, "extensions") : null;
}
function buildBundledPluginLoadPathAliases(localPath) {
	const legacyPath = buildLegacyBundledPath(localPath);
	if (!legacyPath) return [];
	return [{
		kind: "current",
		path: localPath
	}, {
		kind: "legacy",
		path: legacyPath
	}];
}
function isSameOrInside(baseDir, targetPath) {
	const base = path.resolve(normalizeBundledLookupPath(baseDir));
	const target = path.resolve(normalizeBundledLookupPath(targetPath));
	return target === base || isPathInside(base, target);
}
function resolvePackagedBundledLoadPathAlias(params) {
	if (!params.bundledRoot) return null;
	const packaged = findPackagedBundledRoot(params.bundledRoot);
	if (!packaged) return null;
	const legacyRoot = path.join(packaged.packageRoot, "extensions");
	if (isSameOrInside(params.bundledRoot, params.loadPath)) return {
		kind: "current",
		path: params.loadPath
	};
	if (isSameOrInside(legacyRoot, params.loadPath)) return {
		kind: "legacy",
		path: params.loadPath
	};
	return null;
}
//#endregion
//#region src/plugins/bundled-source-overlays.ts
function decodeMountInfoPath(value) {
	return value.replace(/\\([0-7]{3})/g, (_match, octal) => String.fromCharCode(Number.parseInt(octal, 8)));
}
function parseLinuxMountInfoMountPoints(mountInfo) {
	const mountPoints = /* @__PURE__ */ new Set();
	for (const line of mountInfo.split(/\r?\n/u)) {
		const trimmed = line.trim();
		if (!trimmed) continue;
		const mountPoint = trimmed.split(" ")[4];
		if (!mountPoint) continue;
		mountPoints.add(path.resolve(decodeMountInfoPath(mountPoint)));
	}
	return mountPoints;
}
function readLinuxMountPoints() {
	try {
		return parseLinuxMountInfoMountPoints(fs.readFileSync("/proc/self/mountinfo", "utf8"));
	} catch {
		return /* @__PURE__ */ new Set();
	}
}
function isFilesystemMountPoint(targetPath) {
	try {
		const target = fs.statSync(targetPath);
		const parent = fs.statSync(path.dirname(targetPath));
		return target.dev !== parent.dev || target.ino === parent.ino;
	} catch {
		return false;
	}
}
function sourceOverlaysDisabled(env) {
	const raw = normalizeOptionalLowercaseString(env.OPENCLAW_DISABLE_BUNDLED_SOURCE_OVERLAYS);
	return raw === "1" || raw === "true";
}
function isBundledSourceOverlayPath(params) {
	const resolved = path.resolve(params.sourcePath);
	return (params.mountPoints ?? readLinuxMountPoints()).has(resolved) || isFilesystemMountPoint(resolved);
}
function listBundledSourceOverlayDirs(params) {
	if (sourceOverlaysDisabled(params.env ?? process.env) || !params.bundledRoot) return [];
	const legacyRoot = buildLegacyBundledRootPath(params.bundledRoot);
	if (!legacyRoot || !fs.existsSync(legacyRoot)) return [];
	let entries;
	try {
		entries = fs.readdirSync(legacyRoot, { withFileTypes: true });
	} catch {
		return [];
	}
	const mountPoints = params.mountPoints ?? readLinuxMountPoints();
	const legacyRootMounted = isBundledSourceOverlayPath({
		sourcePath: legacyRoot,
		mountPoints
	});
	const overlayDirs = [];
	for (const entry of entries) {
		if (!entry.isDirectory()) continue;
		const sourceDir = path.join(legacyRoot, entry.name);
		const bundledPeer = path.join(params.bundledRoot, entry.name);
		if (!fs.existsSync(bundledPeer)) continue;
		if (!legacyRootMounted && !isBundledSourceOverlayPath({
			sourcePath: sourceDir,
			mountPoints
		})) continue;
		overlayDirs.push(sourceDir);
	}
	return overlayDirs.toSorted((left, right) => left.localeCompare(right));
}
//#endregion
//#region src/plugins/roots.ts
function resolvePluginSourceRoots(params) {
	const env = params.env ?? process.env;
	const workspaceRoot = params.workspaceDir ? resolveUserPath(params.workspaceDir, env) : void 0;
	return {
		stock: resolveBundledPluginsDir(env),
		global: path.join(resolveConfigDir(env), "extensions"),
		workspace: workspaceRoot ? path.join(workspaceRoot, ".openclaw", "extensions") : void 0
	};
}
function resolvePluginCacheInputs(params) {
	const env = params.env ?? process.env;
	return {
		roots: resolvePluginSourceRoots({
			workspaceDir: params.workspaceDir,
			env
		}),
		loadPaths: (params.loadPaths ?? []).filter((entry) => typeof entry === "string").map((entry) => entry.trim()).filter(Boolean).map((entry) => resolveUserPath(entry, env))
	};
}
//#endregion
//#region src/plugins/discovery.ts
const EXTENSION_EXTS = new Set([
	".ts",
	".js",
	".mts",
	".cts",
	".mjs",
	".cjs"
]);
const SCANNED_DIRECTORY_IGNORE_NAMES = new Set([
	".git",
	".hg",
	".svn",
	".turbo",
	".yarn",
	".yarn-cache",
	"build",
	"coverage",
	"dist",
	"node_modules"
]);
const discoveryCache = /* @__PURE__ */ new Map();
const DEFAULT_DISCOVERY_CACHE_MS = 1e3;
function clearPluginDiscoveryCache() {
	discoveryCache.clear();
}
function resolveDiscoveryCacheMs(env) {
	const raw = env.OPENCLAW_PLUGIN_DISCOVERY_CACHE_MS?.trim();
	if (raw === "" || raw === "0") return 0;
	if (!raw) return DEFAULT_DISCOVERY_CACHE_MS;
	const parsed = Number.parseInt(raw, 10);
	if (!Number.isFinite(parsed)) return DEFAULT_DISCOVERY_CACHE_MS;
	return Math.max(0, parsed);
}
function shouldUseDiscoveryCache(env) {
	if (env.OPENCLAW_DISABLE_PLUGIN_DISCOVERY_CACHE?.trim()) return false;
	return resolveDiscoveryCacheMs(env) > 0;
}
function buildScopedDiscoveryCacheKey(params) {
	const { roots, loadPaths } = resolvePluginCacheInputs({
		workspaceDir: params.workspaceDir,
		loadPaths: params.extraPaths,
		env: params.env
	});
	return `scoped::${roots.workspace ?? ""}::${roots.stock ?? ""}::${params.ownershipUid ?? currentUid() ?? "none"}::${JSON.stringify(loadPaths)}`;
}
function buildSharedDiscoveryCacheKey(params) {
	const roots = resolvePluginSourceRoots({ env: params.env });
	const configExtensionsRoot = roots.global ?? "";
	const bundledRoot = roots.stock ?? "";
	return `shared::${params.ownershipUid ?? currentUid() ?? "none"}::${configExtensionsRoot}::${bundledRoot}`;
}
function currentUid(overrideUid) {
	if (overrideUid !== void 0) return overrideUid;
	if (process.platform === "win32") return null;
	if (typeof process.getuid !== "function") return null;
	return process.getuid();
}
function checkSourceEscapesRoot(params) {
	const sourceRealPath = safeRealpathSync(params.source, params.realpathCache);
	const rootRealPath = safeRealpathSync(params.rootDir, params.realpathCache);
	if (!sourceRealPath || !rootRealPath) return null;
	if (isPathInside(rootRealPath, sourceRealPath)) return null;
	return {
		reason: "source_escapes_root",
		sourcePath: params.source,
		rootPath: params.rootDir,
		targetPath: params.source,
		sourceRealPath,
		rootRealPath
	};
}
function checkPathStatAndPermissions(params) {
	if (process.platform === "win32") return null;
	const pathsToCheck = [params.rootDir, params.source];
	const seen = /* @__PURE__ */ new Set();
	for (const targetPath of pathsToCheck) {
		const normalized = path.resolve(targetPath);
		if (seen.has(normalized)) continue;
		seen.add(normalized);
		let stat = safeStatSync(targetPath);
		if (!stat) return {
			reason: "path_stat_failed",
			sourcePath: params.source,
			rootPath: params.rootDir,
			targetPath
		};
		let modeBits = stat.mode & 511;
		if ((modeBits & 2) !== 0 && params.origin === "bundled") try {
			fs.chmodSync(targetPath, modeBits & -19);
			const repairedStat = safeStatSync(targetPath);
			if (!repairedStat) return {
				reason: "path_stat_failed",
				sourcePath: params.source,
				rootPath: params.rootDir,
				targetPath
			};
			stat = repairedStat;
			modeBits = repairedStat.mode & 511;
		} catch {}
		if ((modeBits & 2) !== 0) return {
			reason: "path_world_writable",
			sourcePath: params.source,
			rootPath: params.rootDir,
			targetPath,
			modeBits
		};
		if (params.origin !== "bundled" && params.uid !== null && typeof stat.uid === "number" && stat.uid !== params.uid && stat.uid !== 0) return {
			reason: "path_suspicious_ownership",
			sourcePath: params.source,
			rootPath: params.rootDir,
			targetPath,
			foundUid: stat.uid,
			expectedUid: params.uid
		};
	}
	return null;
}
function findCandidateBlockIssue(params) {
	const escaped = checkSourceEscapesRoot({
		source: params.source,
		rootDir: params.rootDir,
		realpathCache: params.realpathCache
	});
	if (escaped) return escaped;
	return checkPathStatAndPermissions({
		source: params.source,
		rootDir: params.rootDir,
		origin: params.origin,
		uid: currentUid(params.ownershipUid)
	});
}
function formatCandidateBlockMessage(issue) {
	if (issue.reason === "source_escapes_root") return `blocked plugin candidate: source escapes plugin root (${issue.sourcePath} -> ${issue.sourceRealPath}; root=${issue.rootRealPath})`;
	if (issue.reason === "path_stat_failed") return `blocked plugin candidate: cannot stat path (${issue.targetPath})`;
	if (issue.reason === "path_world_writable") return `blocked plugin candidate: world-writable path (${issue.targetPath}, mode=${formatPosixMode(issue.modeBits ?? 0)})`;
	return `blocked plugin candidate: suspicious ownership (${issue.targetPath}, uid=${issue.foundUid}, expected uid=${issue.expectedUid} or root)`;
}
function isUnsafePluginCandidate(params) {
	const issue = findCandidateBlockIssue({
		source: params.source,
		rootDir: params.rootDir,
		origin: params.origin,
		ownershipUid: params.ownershipUid,
		realpathCache: params.realpathCache
	});
	if (!issue) return false;
	params.diagnostics.push({
		level: "warn",
		source: issue.targetPath,
		message: formatCandidateBlockMessage(issue)
	});
	return true;
}
function isExtensionFile(filePath) {
	const ext = path.extname(filePath);
	if (!EXTENSION_EXTS.has(ext)) return false;
	if (filePath.endsWith(".d.ts")) return false;
	const baseName = normalizeLowercaseStringOrEmpty(path.basename(filePath));
	return !baseName.includes(".test.") && !baseName.includes(".live.test.") && !baseName.includes(".e2e.test.");
}
function shouldIgnoreScannedDirectory(dirName) {
	const normalized = normalizeLowercaseStringOrEmpty(dirName);
	if (!normalized) return true;
	if (SCANNED_DIRECTORY_IGNORE_NAMES.has(normalized)) return true;
	if (normalized.endsWith(".bak")) return true;
	if (normalized.includes(".backup-")) return true;
	if (normalized.includes(".disabled")) return true;
	return false;
}
function resolveScannedEntryType(entry, fullPath) {
	if (entry.isFile()) return "file";
	if (entry.isDirectory()) return "directory";
	if (!entry.isSymbolicLink()) return null;
	const stat = safeStatSync(fullPath);
	if (!stat) return null;
	if (stat.isFile()) return "file";
	if (stat.isDirectory()) return "directory";
	return null;
}
function resolvesToSameDirectory(left, right, realpathCache) {
	if (!left || !right) return false;
	const leftRealPath = safeRealpathSync(left, realpathCache);
	const rightRealPath = safeRealpathSync(right, realpathCache);
	if (leftRealPath && rightRealPath) return leftRealPath === rightRealPath;
	return path.resolve(left) === path.resolve(right);
}
function createDiscoveryResult() {
	return {
		candidates: [],
		diagnostics: []
	};
}
function mergeDiscoveryResult(target, source, seenSources) {
	for (const candidate of source.candidates) {
		const key = candidate.source;
		if (seenSources.has(key)) continue;
		seenSources.add(key);
		target.candidates.push(candidate);
	}
	target.diagnostics.push(...source.diagnostics);
}
function getCachedDiscoveryResult(params) {
	const ttl = resolveDiscoveryCacheMs(params.env);
	if (params.cacheEnabled) {
		const cached = discoveryCache.get(params.cacheKey);
		if (cached && cached.expiresAt > Date.now()) return cached.result;
	}
	const result = params.load();
	if (params.cacheEnabled && ttl > 0) discoveryCache.set(params.cacheKey, {
		expiresAt: Date.now() + ttl,
		result
	});
	return result;
}
function readPackageManifest(dir, rejectHardlinks = true, rootRealPath) {
	const opened = openBoundaryFileSync({
		absolutePath: path.join(dir, "package.json"),
		rootPath: dir,
		...rootRealPath !== void 0 ? { rootRealPath } : {},
		boundaryLabel: "plugin package directory",
		rejectHardlinks
	});
	if (!opened.ok) return null;
	try {
		const raw = fs.readFileSync(opened.fd, "utf-8");
		return JSON.parse(raw);
	} catch {
		return null;
	} finally {
		fs.closeSync(opened.fd);
	}
}
function deriveIdHint(params) {
	const base = path.basename(params.filePath, path.extname(params.filePath));
	const rawManifestId = params.manifestId?.trim();
	if (rawManifestId) return params.hasMultipleExtensions ? `${rawManifestId}/${base}` : rawManifestId;
	const rawPackageName = params.packageName?.trim();
	if (!rawPackageName) return base;
	const unscoped = rawPackageName.includes("/") ? rawPackageName.split("/").pop() ?? rawPackageName : rawPackageName;
	const normalizedPackageId = unscoped.endsWith("-provider") && unscoped.length > 9 ? unscoped.slice(0, -9) : unscoped;
	if (!params.hasMultipleExtensions) return normalizedPackageId;
	return `${normalizedPackageId}/${base}`;
}
function resolveIdHintManifestId(rootDir, rejectHardlinks, rootRealPath) {
	const manifest = loadPluginManifest(rootDir, rejectHardlinks, rootRealPath);
	return manifest.ok ? manifest.manifest.id : void 0;
}
function addCandidate(params) {
	const resolved = path.resolve(params.source);
	if (params.seen.has(resolved)) return;
	const resolvedRoot = safeRealpathSync(params.rootDir, params.realpathCache) ?? path.resolve(params.rootDir);
	if (isUnsafePluginCandidate({
		source: resolved,
		rootDir: resolvedRoot,
		origin: params.origin,
		diagnostics: params.diagnostics,
		ownershipUid: params.ownershipUid,
		realpathCache: params.realpathCache
	})) return;
	params.seen.add(resolved);
	const manifest = params.manifest ?? null;
	params.candidates.push({
		idHint: params.idHint,
		source: resolved,
		setupSource: params.setupSource,
		rootDir: resolvedRoot,
		origin: params.origin,
		format: params.format ?? "openclaw",
		bundleFormat: params.bundleFormat,
		workspaceDir: params.workspaceDir,
		packageName: normalizeOptionalString(manifest?.name),
		packageVersion: normalizeOptionalString(manifest?.version),
		packageDescription: normalizeOptionalString(manifest?.description),
		packageDir: params.packageDir,
		packageManifest: getPackageManifestMetadata(manifest ?? void 0),
		bundledManifest: params.bundledManifest,
		bundledManifestPath: params.bundledManifestPath
	});
}
function discoverBundleInRoot(params) {
	const bundleFormat = detectBundleManifestFormat(params.rootDir);
	if (!bundleFormat) return "none";
	const rootRealPath = safeRealpathSync(params.rootDir, params.realpathCache) ?? void 0;
	const bundleManifest = loadBundleManifest({
		rootDir: params.rootDir,
		...rootRealPath !== void 0 ? { rootRealPath } : {},
		bundleFormat,
		rejectHardlinks: params.origin !== "bundled"
	});
	if (!bundleManifest.ok) {
		params.diagnostics.push({
			level: "error",
			message: bundleManifest.error,
			source: bundleManifest.manifestPath
		});
		return "invalid";
	}
	addCandidate({
		candidates: params.candidates,
		diagnostics: params.diagnostics,
		seen: params.seen,
		idHint: bundleManifest.manifest.id,
		source: params.rootDir,
		rootDir: params.rootDir,
		origin: params.origin,
		format: "bundle",
		bundleFormat,
		ownershipUid: params.ownershipUid,
		workspaceDir: params.workspaceDir,
		realpathCache: params.realpathCache
	});
	return "added";
}
function discoverInDirectory(params) {
	if (!fs.existsSync(params.dir)) return;
	const resolvedDir = safeRealpathSync(params.dir, params.realpathCache) ?? path.resolve(params.dir);
	if (params.recurseDirectories) {
		if (params.visitedDirectories?.has(resolvedDir)) return;
		params.visitedDirectories?.add(resolvedDir);
	}
	let entries = [];
	try {
		entries = fs.readdirSync(params.dir, { withFileTypes: true });
	} catch (err) {
		params.diagnostics.push({
			level: "warn",
			message: `failed to read extensions dir: ${params.dir} (${String(err)})`,
			source: params.dir
		});
		return;
	}
	for (const entry of entries) {
		const fullPath = path.join(params.dir, entry.name);
		const entryType = resolveScannedEntryType(entry, fullPath);
		if (entryType === "file") {
			if (!isExtensionFile(fullPath)) continue;
			addCandidate({
				candidates: params.candidates,
				diagnostics: params.diagnostics,
				seen: params.seen,
				idHint: path.basename(entry.name, path.extname(entry.name)),
				source: fullPath,
				rootDir: path.dirname(fullPath),
				origin: params.origin,
				ownershipUid: params.ownershipUid,
				workspaceDir: params.workspaceDir,
				realpathCache: params.realpathCache
			});
			continue;
		}
		if (entryType !== "directory") continue;
		if (params.skipDirectories?.has(entry.name)) continue;
		if (shouldIgnoreScannedDirectory(entry.name)) continue;
		const rejectHardlinks = params.origin !== "bundled";
		const fullPathRealPath = safeRealpathSync(fullPath, params.realpathCache) ?? void 0;
		const manifest = readPackageManifest(fullPath, rejectHardlinks, fullPathRealPath);
		const extensionResolution = resolvePackageExtensionEntries(manifest ?? void 0);
		const extensions = extensionResolution.status === "ok" ? extensionResolution.entries : [];
		const manifestId = resolveIdHintManifestId(fullPath, rejectHardlinks, fullPathRealPath);
		const setupSource = resolvePackageSetupSource({
			packageDir: fullPath,
			...fullPathRealPath !== void 0 ? { packageRootRealPath: fullPathRealPath } : {},
			manifest,
			origin: params.origin,
			sourceLabel: fullPath,
			diagnostics: params.diagnostics,
			rejectHardlinks
		});
		if (extensions.length > 0) {
			const resolvedRuntimeSources = resolvePackageRuntimeExtensionSources({
				packageDir: fullPath,
				...fullPathRealPath !== void 0 ? { packageRootRealPath: fullPathRealPath } : {},
				manifest,
				extensions,
				origin: params.origin,
				sourceLabel: fullPath,
				diagnostics: params.diagnostics,
				rejectHardlinks
			});
			for (const resolved of resolvedRuntimeSources) addCandidate({
				candidates: params.candidates,
				diagnostics: params.diagnostics,
				seen: params.seen,
				idHint: deriveIdHint({
					filePath: resolved,
					manifestId,
					packageName: manifest?.name,
					hasMultipleExtensions: extensions.length > 1
				}),
				source: resolved,
				...setupSource ? { setupSource } : {},
				rootDir: fullPath,
				origin: params.origin,
				ownershipUid: params.ownershipUid,
				workspaceDir: params.workspaceDir,
				manifest,
				packageDir: fullPath,
				realpathCache: params.realpathCache
			});
			continue;
		}
		if (discoverBundleInRoot({
			rootDir: fullPath,
			origin: params.origin,
			ownershipUid: params.ownershipUid,
			workspaceDir: params.workspaceDir,
			candidates: params.candidates,
			diagnostics: params.diagnostics,
			seen: params.seen,
			realpathCache: params.realpathCache
		}) === "added") continue;
		const indexFile = [...DEFAULT_PLUGIN_ENTRY_CANDIDATES].map((candidate) => path.join(fullPath, candidate)).find((candidate) => fs.existsSync(candidate));
		if (indexFile && isExtensionFile(indexFile)) {
			addCandidate({
				candidates: params.candidates,
				diagnostics: params.diagnostics,
				seen: params.seen,
				idHint: entry.name,
				source: indexFile,
				...setupSource ? { setupSource } : {},
				rootDir: fullPath,
				origin: params.origin,
				ownershipUid: params.ownershipUid,
				workspaceDir: params.workspaceDir,
				manifest,
				packageDir: fullPath,
				realpathCache: params.realpathCache
			});
			continue;
		}
		if (params.recurseDirectories) discoverInDirectory({
			...params,
			dir: fullPath
		});
	}
}
function discoverFromPath(params) {
	const resolved = resolveUserPath(params.rawPath, params.env);
	if (!fs.existsSync(resolved)) {
		params.diagnostics.push({
			level: "error",
			message: `plugin path not found: ${resolved}`,
			source: resolved
		});
		return;
	}
	const stat = fs.statSync(resolved);
	if (stat.isFile()) {
		if (!isExtensionFile(resolved)) {
			params.diagnostics.push({
				level: "error",
				message: `plugin path is not a supported file: ${resolved}`,
				source: resolved
			});
			return;
		}
		addCandidate({
			candidates: params.candidates,
			diagnostics: params.diagnostics,
			seen: params.seen,
			idHint: path.basename(resolved, path.extname(resolved)),
			source: resolved,
			rootDir: path.dirname(resolved),
			origin: params.origin,
			ownershipUid: params.ownershipUid,
			workspaceDir: params.workspaceDir,
			realpathCache: params.realpathCache
		});
		return;
	}
	if (stat.isDirectory()) {
		const rejectHardlinks = params.origin !== "bundled";
		const resolvedRealPath = safeRealpathSync(resolved, params.realpathCache) ?? void 0;
		const manifest = readPackageManifest(resolved, rejectHardlinks, resolvedRealPath);
		const extensionResolution = resolvePackageExtensionEntries(manifest ?? void 0);
		const extensions = extensionResolution.status === "ok" ? extensionResolution.entries : [];
		const manifestId = resolveIdHintManifestId(resolved, rejectHardlinks, resolvedRealPath);
		const setupSource = resolvePackageSetupSource({
			packageDir: resolved,
			...resolvedRealPath !== void 0 ? { packageRootRealPath: resolvedRealPath } : {},
			manifest,
			origin: params.origin,
			sourceLabel: resolved,
			diagnostics: params.diagnostics,
			rejectHardlinks
		});
		if (extensions.length > 0) {
			const resolvedRuntimeSources = resolvePackageRuntimeExtensionSources({
				packageDir: resolved,
				...resolvedRealPath !== void 0 ? { packageRootRealPath: resolvedRealPath } : {},
				manifest,
				extensions,
				origin: params.origin,
				sourceLabel: resolved,
				diagnostics: params.diagnostics,
				rejectHardlinks
			});
			for (const source of resolvedRuntimeSources) addCandidate({
				candidates: params.candidates,
				diagnostics: params.diagnostics,
				seen: params.seen,
				idHint: deriveIdHint({
					filePath: source,
					manifestId,
					packageName: manifest?.name,
					hasMultipleExtensions: extensions.length > 1
				}),
				source,
				...setupSource ? { setupSource } : {},
				rootDir: resolved,
				origin: params.origin,
				ownershipUid: params.ownershipUid,
				workspaceDir: params.workspaceDir,
				manifest,
				packageDir: resolved,
				realpathCache: params.realpathCache
			});
			return;
		}
		if (discoverBundleInRoot({
			rootDir: resolved,
			origin: params.origin,
			ownershipUid: params.ownershipUid,
			workspaceDir: params.workspaceDir,
			candidates: params.candidates,
			diagnostics: params.diagnostics,
			seen: params.seen,
			realpathCache: params.realpathCache
		}) === "added") return;
		const indexFile = [...DEFAULT_PLUGIN_ENTRY_CANDIDATES].map((candidate) => path.join(resolved, candidate)).find((candidate) => fs.existsSync(candidate));
		if (indexFile && isExtensionFile(indexFile)) {
			addCandidate({
				candidates: params.candidates,
				diagnostics: params.diagnostics,
				seen: params.seen,
				idHint: path.basename(resolved),
				source: indexFile,
				...setupSource ? { setupSource } : {},
				rootDir: resolved,
				origin: params.origin,
				ownershipUid: params.ownershipUid,
				workspaceDir: params.workspaceDir,
				manifest,
				packageDir: resolved,
				realpathCache: params.realpathCache
			});
			return;
		}
		discoverInDirectory({
			dir: resolved,
			origin: params.origin,
			ownershipUid: params.ownershipUid,
			workspaceDir: params.workspaceDir,
			candidates: params.candidates,
			diagnostics: params.diagnostics,
			seen: params.seen,
			realpathCache: params.realpathCache
		});
		return;
	}
}
function discoverOpenClawPlugins(params) {
	const env = params.env ?? process.env;
	const cacheEnabled = params.cache !== false && shouldUseDiscoveryCache(env);
	const workspaceDir = normalizeOptionalString(params.workspaceDir);
	const workspaceRoot = workspaceDir ? resolveUserPath(workspaceDir, env) : void 0;
	const roots = resolvePluginSourceRoots({
		workspaceDir: workspaceRoot,
		env
	});
	const scopedResult = getCachedDiscoveryResult({
		cacheEnabled,
		cacheKey: buildScopedDiscoveryCacheKey({
			workspaceDir: params.workspaceDir,
			extraPaths: params.extraPaths,
			ownershipUid: params.ownershipUid,
			env
		}),
		env,
		load: () => {
			const result = createDiscoveryResult();
			const seen = /* @__PURE__ */ new Set();
			const realpathCache = /* @__PURE__ */ new Map();
			const extra = params.extraPaths ?? [];
			for (const extraPath of extra) {
				if (typeof extraPath !== "string") continue;
				const trimmed = extraPath.trim();
				if (!trimmed) continue;
				const bundledAlias = resolvePackagedBundledLoadPathAlias({
					bundledRoot: roots.stock,
					loadPath: resolveUserPath(trimmed, env)
				});
				if (bundledAlias) {
					result.diagnostics.push({
						level: "warn",
						source: trimmed,
						message: `ignored plugins.load.paths entry that points at OpenClaw's ${bundledAlias.kind} bundled plugin directory; remove this redundant path or run openclaw doctor --fix`
					});
					continue;
				}
				discoverFromPath({
					rawPath: trimmed,
					origin: "config",
					ownershipUid: params.ownershipUid,
					workspaceDir,
					env,
					candidates: result.candidates,
					diagnostics: result.diagnostics,
					seen,
					realpathCache
				});
			}
			const workspaceMatchesBundledRoot = resolvesToSameDirectory(workspaceRoot, roots.stock, realpathCache);
			if (roots.workspace && workspaceRoot && !workspaceMatchesBundledRoot) discoverInDirectory({
				dir: roots.workspace,
				origin: "workspace",
				ownershipUid: params.ownershipUid,
				workspaceDir: workspaceRoot,
				candidates: result.candidates,
				diagnostics: result.diagnostics,
				seen,
				realpathCache
			});
			return result;
		}
	});
	const sharedResult = getCachedDiscoveryResult({
		cacheEnabled,
		cacheKey: buildSharedDiscoveryCacheKey({
			ownershipUid: params.ownershipUid,
			env
		}),
		env,
		load: () => {
			const result = createDiscoveryResult();
			const seen = /* @__PURE__ */ new Set();
			const realpathCache = /* @__PURE__ */ new Map();
			for (const sourceOverlayDir of listBundledSourceOverlayDirs({
				bundledRoot: roots.stock,
				env
			})) {
				discoverFromPath({
					rawPath: sourceOverlayDir,
					origin: "bundled",
					ownershipUid: params.ownershipUid,
					workspaceDir,
					env,
					candidates: result.candidates,
					diagnostics: result.diagnostics,
					seen,
					realpathCache
				});
				result.diagnostics.push({
					level: "warn",
					source: sourceOverlayDir,
					message: "using bind-mounted bundled plugin source overlay; this source overrides the packaged dist bundle for the same plugin id"
				});
			}
			if (roots.stock) discoverInDirectory({
				dir: roots.stock,
				origin: "bundled",
				ownershipUid: params.ownershipUid,
				candidates: result.candidates,
				diagnostics: result.diagnostics,
				seen,
				realpathCache
			});
			discoverInDirectory({
				dir: roots.global,
				origin: "global",
				ownershipUid: params.ownershipUid,
				candidates: result.candidates,
				diagnostics: result.diagnostics,
				seen,
				realpathCache
			});
			return result;
		}
	});
	const result = createDiscoveryResult();
	const seenSources = /* @__PURE__ */ new Set();
	mergeDiscoveryResult(result, scopedResult, seenSources);
	mergeDiscoveryResult(result, sharedResult, seenSources);
	return result;
}
//#endregion
export { buildBundledPluginLoadPathAliases as a, resolvePluginSourceRoots as i, discoverOpenClawPlugins as n, normalizeBundledLookupPath as o, resolvePluginCacheInputs as r, clearPluginDiscoveryCache as t };
