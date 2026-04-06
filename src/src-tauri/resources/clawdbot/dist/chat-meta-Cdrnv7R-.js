import { v as resolveUserPath } from "./utils-CE3P21nG.js";
import { n as resolveOpenClawPackageRootSync } from "./openclaw-root-Q4UoS1xk.js";
import { r as buildChannelConfigSchema } from "./config-schema-BoSEJoAt.js";
import { i as loadPluginManifest, r as getPackageManifestMetadata } from "./manifest-nUb9VZ5t.js";
import { fileURLToPath } from "node:url";
import fsSync from "node:fs";
import path from "node:path";
import { createJiti } from "jiti";
//#region src/plugins/bundled-dir.ts
function isSourceCheckoutRoot(packageRoot) {
	return fsSync.existsSync(path.join(packageRoot, ".git")) && fsSync.existsSync(path.join(packageRoot, "src")) && fsSync.existsSync(path.join(packageRoot, "extensions"));
}
function resolveBundledDirFromPackageRoot(packageRoot, preferSourceCheckout) {
	const sourceExtensionsDir = path.join(packageRoot, "extensions");
	const builtExtensionsDir = path.join(packageRoot, "dist", "extensions");
	if ((preferSourceCheckout || isSourceCheckoutRoot(packageRoot)) && fsSync.existsSync(sourceExtensionsDir)) return sourceExtensionsDir;
	const runtimeExtensionsDir = path.join(packageRoot, "dist-runtime", "extensions");
	if (fsSync.existsSync(runtimeExtensionsDir) && fsSync.existsSync(builtExtensionsDir)) return runtimeExtensionsDir;
	if (fsSync.existsSync(builtExtensionsDir)) return builtExtensionsDir;
}
function resolveBundledPluginsDir(env = process.env) {
	const override = env.OPENCLAW_BUNDLED_PLUGINS_DIR?.trim();
	if (override) {
		const resolvedOverride = resolveUserPath(override, env);
		if (fsSync.existsSync(resolvedOverride)) return resolvedOverride;
		try {
			const argvPackageRoot = resolveOpenClawPackageRootSync({ argv1: process.argv[1] });
			if (argvPackageRoot && !isSourceCheckoutRoot(argvPackageRoot)) {
				const argvFallback = resolveBundledDirFromPackageRoot(argvPackageRoot, false);
				if (argvFallback) return argvFallback;
			}
		} catch {}
		return resolvedOverride;
	}
	const preferSourceCheckout = Boolean(env.VITEST);
	try {
		const packageRoots = [
			resolveOpenClawPackageRootSync({ argv1: process.argv[1] }),
			resolveOpenClawPackageRootSync({ cwd: process.cwd() }),
			resolveOpenClawPackageRootSync({ moduleUrl: import.meta.url })
		].filter((entry, index, all) => Boolean(entry) && all.indexOf(entry) === index);
		for (const packageRoot of packageRoots) {
			const bundledDir = resolveBundledDirFromPackageRoot(packageRoot, preferSourceCheckout);
			if (bundledDir) return bundledDir;
		}
	} catch {}
	try {
		const execDir = path.dirname(process.execPath);
		const siblingBuilt = path.join(execDir, "dist", "extensions");
		if (fsSync.existsSync(siblingBuilt)) return siblingBuilt;
		const sibling = path.join(execDir, "extensions");
		if (fsSync.existsSync(sibling)) return sibling;
	} catch {}
	try {
		let cursor = path.dirname(fileURLToPath(import.meta.url));
		for (let i = 0; i < 6; i += 1) {
			const candidate = path.join(cursor, "extensions");
			if (fsSync.existsSync(candidate)) return candidate;
			const parent = path.dirname(cursor);
			if (parent === cursor) break;
			cursor = parent;
		}
	} catch {}
}
//#endregion
//#region src/plugins/sdk-alias.ts
const STARTUP_ARGV1 = process.argv[1];
function resolveLoaderModulePath(params = {}) {
	return params.modulePath ?? fileURLToPath(params.moduleUrl ?? import.meta.url);
}
function readPluginSdkPackageJson(packageRoot) {
	try {
		const pkgRaw = fsSync.readFileSync(path.join(packageRoot, "package.json"), "utf-8");
		return JSON.parse(pkgRaw);
	} catch {
		return null;
	}
}
function isSafePluginSdkSubpathSegment(subpath) {
	return /^[A-Za-z0-9][A-Za-z0-9_-]*$/.test(subpath);
}
function listPluginSdkSubpathsFromPackageJson(pkg) {
	return Object.keys(pkg.exports ?? {}).filter((key) => key.startsWith("./plugin-sdk/")).map((key) => key.slice(13)).filter((subpath) => isSafePluginSdkSubpathSegment(subpath)).toSorted();
}
function hasTrustedOpenClawRootIndicator(params) {
	const packageExports = params.packageJson.exports ?? {};
	if (!Object.prototype.hasOwnProperty.call(packageExports, "./plugin-sdk")) return false;
	const hasCliEntryExport = Object.prototype.hasOwnProperty.call(packageExports, "./cli-entry");
	const hasOpenClawBin = typeof params.packageJson.bin === "string" && params.packageJson.bin.toLowerCase().includes("openclaw") || typeof params.packageJson.bin === "object" && params.packageJson.bin !== null && typeof params.packageJson.bin.openclaw === "string";
	const hasOpenClawEntrypoint = fsSync.existsSync(path.join(params.packageRoot, "openclaw.mjs"));
	return hasCliEntryExport || hasOpenClawBin || hasOpenClawEntrypoint;
}
function readPluginSdkSubpathsFromPackageRoot(packageRoot) {
	const pkg = readPluginSdkPackageJson(packageRoot);
	if (!pkg) return null;
	if (!hasTrustedOpenClawRootIndicator({
		packageRoot,
		packageJson: pkg
	})) return null;
	const subpaths = listPluginSdkSubpathsFromPackageJson(pkg);
	return subpaths.length > 0 ? subpaths : null;
}
function resolveTrustedOpenClawRootFromArgvHint(params) {
	if (!params.argv1) return null;
	const packageRoot = resolveOpenClawPackageRootSync({
		cwd: params.cwd,
		argv1: params.argv1
	});
	if (!packageRoot) return null;
	const packageJson = readPluginSdkPackageJson(packageRoot);
	if (!packageJson) return null;
	return hasTrustedOpenClawRootIndicator({
		packageRoot,
		packageJson
	}) ? packageRoot : null;
}
function findNearestPluginSdkPackageRoot(startDir, maxDepth = 12) {
	let cursor = path.resolve(startDir);
	for (let i = 0; i < maxDepth; i += 1) {
		if (readPluginSdkSubpathsFromPackageRoot(cursor)) return cursor;
		const parent = path.dirname(cursor);
		if (parent === cursor) break;
		cursor = parent;
	}
	return null;
}
function resolveLoaderPackageRoot(params) {
	const cwd = params.cwd ?? path.dirname(params.modulePath);
	const fromModulePath = resolveOpenClawPackageRootSync({ cwd });
	if (fromModulePath) return fromModulePath;
	const argv1 = params.argv1 ?? process.argv[1];
	const moduleUrl = params.moduleUrl ?? (params.modulePath ? void 0 : import.meta.url);
	return resolveOpenClawPackageRootSync({
		cwd,
		...argv1 ? { argv1 } : {},
		...moduleUrl ? { moduleUrl } : {}
	});
}
function resolveLoaderPluginSdkPackageRoot(params) {
	const cwd = params.cwd ?? path.dirname(params.modulePath);
	const fromCwd = resolveOpenClawPackageRootSync({ cwd });
	const fromExplicitHints = resolveTrustedOpenClawRootFromArgvHint({
		cwd,
		argv1: params.argv1
	}) ?? (params.moduleUrl ? resolveOpenClawPackageRootSync({
		cwd,
		moduleUrl: params.moduleUrl
	}) : null);
	return fromCwd ?? fromExplicitHints ?? findNearestPluginSdkPackageRoot(path.dirname(params.modulePath)) ?? (params.cwd ? findNearestPluginSdkPackageRoot(params.cwd) : null) ?? findNearestPluginSdkPackageRoot(process.cwd());
}
function resolvePluginSdkAliasCandidateOrder(params) {
	if (params.pluginSdkResolution === "dist") return ["dist", "src"];
	if (params.pluginSdkResolution === "src") return ["src", "dist"];
	return params.modulePath.replace(/\\/g, "/").includes("/dist/") || params.isProduction ? ["dist", "src"] : ["src", "dist"];
}
function listPluginSdkAliasCandidates(params) {
	const orderedKinds = resolvePluginSdkAliasCandidateOrder({
		modulePath: params.modulePath,
		isProduction: true,
		pluginSdkResolution: params.pluginSdkResolution
	});
	const packageRoot = resolveLoaderPluginSdkPackageRoot(params);
	if (packageRoot) {
		const candidateMap = {
			src: path.join(packageRoot, "src", "plugin-sdk", params.srcFile),
			dist: path.join(packageRoot, "dist", "plugin-sdk", params.distFile)
		};
		return orderedKinds.map((kind) => candidateMap[kind]);
	}
	let cursor = path.dirname(params.modulePath);
	const candidates = [];
	for (let i = 0; i < 6; i += 1) {
		const candidateMap = {
			src: path.join(cursor, "src", "plugin-sdk", params.srcFile),
			dist: path.join(cursor, "dist", "plugin-sdk", params.distFile)
		};
		for (const kind of orderedKinds) candidates.push(candidateMap[kind]);
		const parent = path.dirname(cursor);
		if (parent === cursor) break;
		cursor = parent;
	}
	return candidates;
}
function resolvePluginSdkAliasFile(params) {
	try {
		const modulePath = resolveLoaderModulePath(params);
		for (const candidate of listPluginSdkAliasCandidates({
			srcFile: params.srcFile,
			distFile: params.distFile,
			modulePath,
			argv1: params.argv1,
			cwd: params.cwd,
			moduleUrl: params.moduleUrl,
			pluginSdkResolution: params.pluginSdkResolution
		})) if (fsSync.existsSync(candidate)) return candidate;
	} catch {}
	return null;
}
const cachedPluginSdkExportedSubpaths = /* @__PURE__ */ new Map();
const cachedPluginSdkScopedAliasMaps = /* @__PURE__ */ new Map();
function listPluginSdkExportedSubpaths(params = {}) {
	const packageRoot = resolveLoaderPluginSdkPackageRoot({
		modulePath: params.modulePath ?? fileURLToPath(import.meta.url),
		argv1: params.argv1,
		moduleUrl: params.moduleUrl
	});
	if (!packageRoot) return [];
	const cached = cachedPluginSdkExportedSubpaths.get(packageRoot);
	if (cached) return cached;
	const subpaths = readPluginSdkSubpathsFromPackageRoot(packageRoot) ?? [];
	cachedPluginSdkExportedSubpaths.set(packageRoot, subpaths);
	return subpaths;
}
function resolvePluginSdkScopedAliasMap(params = {}) {
	const modulePath = params.modulePath ?? fileURLToPath(import.meta.url);
	const packageRoot = resolveLoaderPluginSdkPackageRoot({
		modulePath,
		argv1: params.argv1,
		moduleUrl: params.moduleUrl
	});
	if (!packageRoot) return {};
	const orderedKinds = resolvePluginSdkAliasCandidateOrder({
		modulePath,
		isProduction: true,
		pluginSdkResolution: params.pluginSdkResolution
	});
	const cacheKey = `${packageRoot}::${orderedKinds.join(",")}`;
	const cached = cachedPluginSdkScopedAliasMaps.get(cacheKey);
	if (cached) return cached;
	const aliasMap = {};
	for (const subpath of listPluginSdkExportedSubpaths({
		modulePath,
		argv1: params.argv1,
		moduleUrl: params.moduleUrl,
		pluginSdkResolution: params.pluginSdkResolution
	})) {
		const candidateMap = {
			src: path.join(packageRoot, "src", "plugin-sdk", `${subpath}.ts`),
			dist: path.join(packageRoot, "dist", "plugin-sdk", `${subpath}.js`)
		};
		for (const kind of orderedKinds) {
			const candidate = candidateMap[kind];
			if (fsSync.existsSync(candidate)) {
				aliasMap[`openclaw/plugin-sdk/${subpath}`] = candidate;
				break;
			}
		}
	}
	cachedPluginSdkScopedAliasMaps.set(cacheKey, aliasMap);
	return aliasMap;
}
function resolveExtensionApiAlias(params = {}) {
	try {
		const modulePath = resolveLoaderModulePath(params);
		const packageRoot = resolveLoaderPackageRoot({
			...params,
			modulePath
		});
		if (!packageRoot) return null;
		const orderedKinds = resolvePluginSdkAliasCandidateOrder({
			modulePath,
			isProduction: true,
			pluginSdkResolution: params.pluginSdkResolution
		});
		const candidateMap = {
			src: path.join(packageRoot, "src", "extensionAPI.ts"),
			dist: path.join(packageRoot, "dist", "extensionAPI.js")
		};
		for (const kind of orderedKinds) {
			const candidate = candidateMap[kind];
			if (fsSync.existsSync(candidate)) return candidate;
		}
	} catch {}
	return null;
}
function buildPluginLoaderAliasMap(modulePath, argv1 = STARTUP_ARGV1, moduleUrl, pluginSdkResolution = "auto") {
	const pluginSdkAlias = resolvePluginSdkAliasFile({
		srcFile: "root-alias.cjs",
		distFile: "root-alias.cjs",
		modulePath,
		argv1,
		moduleUrl,
		pluginSdkResolution
	});
	const extensionApiAlias = resolveExtensionApiAlias({
		modulePath,
		pluginSdkResolution
	});
	return {
		...extensionApiAlias ? { "openclaw/extension-api": extensionApiAlias } : {},
		...pluginSdkAlias ? { "openclaw/plugin-sdk": pluginSdkAlias } : {},
		...resolvePluginSdkScopedAliasMap({
			modulePath,
			argv1,
			moduleUrl,
			pluginSdkResolution
		})
	};
}
function resolvePluginRuntimeModulePath(params = {}) {
	try {
		const modulePath = resolveLoaderModulePath(params);
		const orderedKinds = resolvePluginSdkAliasCandidateOrder({
			modulePath,
			isProduction: true,
			pluginSdkResolution: params.pluginSdkResolution
		});
		const packageRoot = resolveLoaderPackageRoot({
			...params,
			modulePath
		});
		const candidates = packageRoot ? orderedKinds.map((kind) => kind === "src" ? path.join(packageRoot, "src", "plugins", "runtime", "index.ts") : path.join(packageRoot, "dist", "plugins", "runtime", "index.js")) : [path.join(path.dirname(modulePath), "runtime", "index.ts"), path.join(path.dirname(modulePath), "runtime", "index.js")];
		for (const candidate of candidates) if (fsSync.existsSync(candidate)) return candidate;
	} catch {}
	return null;
}
function buildPluginLoaderJitiOptions(aliasMap) {
	return {
		interopDefault: true,
		tryNative: true,
		extensions: [
			".ts",
			".tsx",
			".mts",
			".cts",
			".mtsx",
			".ctsx",
			".js",
			".mjs",
			".cjs",
			".json"
		],
		...Object.keys(aliasMap).length > 0 ? { alias: aliasMap } : {}
	};
}
function shouldPreferNativeJiti(modulePath) {
	if (typeof process.versions.bun === "string") return false;
	switch (path.extname(modulePath).toLowerCase()) {
		case ".js":
		case ".mjs":
		case ".cjs":
		case ".json": return true;
		default: return false;
	}
}
//#endregion
//#region src/plugins/bundled-plugin-metadata.ts
const OPENCLAW_PACKAGE_ROOT = resolveLoaderPackageRoot({
	modulePath: fileURLToPath(import.meta.url),
	moduleUrl: import.meta.url
}) ?? fileURLToPath(new URL("../..", import.meta.url));
const CURRENT_MODULE_PATH = fileURLToPath(import.meta.url);
const RUNNING_FROM_BUILT_ARTIFACT = CURRENT_MODULE_PATH.includes(`${path.sep}dist${path.sep}`) || CURRENT_MODULE_PATH.includes(`${path.sep}dist-runtime${path.sep}`);
const PUBLIC_SURFACE_SOURCE_EXTENSIONS = [
	".ts",
	".mts",
	".js",
	".mjs",
	".cts",
	".cjs"
];
const RUNTIME_SIDECAR_ARTIFACTS = new Set([
	"helper-api.js",
	"light-runtime-api.js",
	"runtime-api.js",
	"thread-bindings-runtime.js"
]);
const SOURCE_CONFIG_SCHEMA_CANDIDATES = [
	path.join("src", "config-schema.ts"),
	path.join("src", "config-schema.js"),
	path.join("src", "config-schema.mts"),
	path.join("src", "config-schema.mjs"),
	path.join("src", "config-schema.cts"),
	path.join("src", "config-schema.cjs")
];
const PUBLIC_CONFIG_SURFACE_BASENAMES = [
	"channel-config-api",
	"runtime-api",
	"api"
];
const bundledPluginMetadataCache = /* @__PURE__ */ new Map();
const jitiLoaders = /* @__PURE__ */ new Map();
function trimString(value) {
	return typeof value === "string" && value.trim().length > 0 ? value.trim() : void 0;
}
function normalizeStringList(value) {
	if (!Array.isArray(value)) return [];
	return value.map((entry) => trimString(entry) ?? "").filter(Boolean);
}
function rewriteEntryToBuiltPath(entry) {
	if (!entry) return;
	return entry.replace(/^\.\//u, "").replace(/\.[^.]+$/u, ".js");
}
function readPackageManifest(pluginDir) {
	const packagePath = path.join(pluginDir, "package.json");
	if (!fsSync.existsSync(packagePath)) return;
	try {
		return JSON.parse(fsSync.readFileSync(packagePath, "utf-8"));
	} catch {
		return;
	}
}
function deriveIdHint(params) {
	const base = path.basename(params.entryPath, path.extname(params.entryPath));
	if (!params.hasMultipleExtensions) return params.manifestId;
	const packageName = trimString(params.packageName);
	if (!packageName) return `${params.manifestId}/${base}`;
	return `${packageName.includes("/") ? packageName.split("/").pop() ?? packageName : packageName}/${base}`;
}
function isTopLevelPublicSurfaceSource(name) {
	if (!PUBLIC_SURFACE_SOURCE_EXTENSIONS.includes(path.extname(name))) return false;
	if (name.startsWith(".")) return false;
	if (name.startsWith("test-")) return false;
	if (name.includes(".test-")) return false;
	if (name.endsWith(".d.ts")) return false;
	return !/(\.test|\.spec)(\.[cm]?[jt]s)$/u.test(name);
}
function collectTopLevelPublicSurfaceArtifacts(params) {
	const excluded = new Set([params.sourceEntry, params.setupEntry].filter((entry) => typeof entry === "string" && entry.trim().length > 0).map((entry) => path.basename(entry)));
	const artifacts = fsSync.readdirSync(params.pluginDir, { withFileTypes: true }).filter((entry) => entry.isFile()).map((entry) => entry.name).filter(isTopLevelPublicSurfaceSource).filter((entry) => !excluded.has(entry)).map((entry) => rewriteEntryToBuiltPath(entry)).filter((entry) => typeof entry === "string" && entry.length > 0).toSorted((left, right) => left.localeCompare(right));
	return artifacts.length > 0 ? artifacts : void 0;
}
function collectRuntimeSidecarArtifacts(publicSurfaceArtifacts) {
	if (!publicSurfaceArtifacts) return;
	const artifacts = publicSurfaceArtifacts.filter((artifact) => RUNTIME_SIDECAR_ARTIFACTS.has(artifact));
	return artifacts.length > 0 ? artifacts : void 0;
}
function resolveBundledPluginScanDir(packageRoot) {
	const sourceDir = path.join(packageRoot, "extensions");
	const runtimeDir = path.join(packageRoot, "dist-runtime", "extensions");
	const builtDir = path.join(packageRoot, "dist", "extensions");
	if (RUNNING_FROM_BUILT_ARTIFACT) {
		if (fsSync.existsSync(builtDir)) return builtDir;
		if (fsSync.existsSync(runtimeDir)) return runtimeDir;
	}
	if (fsSync.existsSync(sourceDir)) return sourceDir;
	if (fsSync.existsSync(runtimeDir) && fsSync.existsSync(builtDir)) return runtimeDir;
	if (fsSync.existsSync(builtDir)) return builtDir;
}
function isBuiltChannelConfigSchema(value) {
	if (!value || typeof value !== "object") return false;
	const candidate = value;
	return Boolean(candidate.schema && typeof candidate.schema === "object");
}
function resolveConfigSchemaExport(imported) {
	for (const [name, value] of Object.entries(imported)) if (name.endsWith("ChannelConfigSchema") && isBuiltChannelConfigSchema(value)) return value;
	for (const [name, value] of Object.entries(imported)) {
		if (!name.endsWith("ConfigSchema") || name.endsWith("AccountConfigSchema")) continue;
		if (isBuiltChannelConfigSchema(value)) return value;
		if (value && typeof value === "object") return buildChannelConfigSchema(value);
	}
	for (const value of Object.values(imported)) if (isBuiltChannelConfigSchema(value)) return value;
	return null;
}
function getJiti(modulePath) {
	const tryNative = shouldPreferNativeJiti(modulePath) || modulePath.includes(`${path.sep}dist${path.sep}`);
	const aliasMap = buildPluginLoaderAliasMap(modulePath, process.argv[1], import.meta.url);
	const cacheKey = JSON.stringify({
		tryNative,
		aliasMap: Object.entries(aliasMap).toSorted(([left], [right]) => left.localeCompare(right))
	});
	const cached = jitiLoaders.get(cacheKey);
	if (cached) return cached;
	const loader = createJiti(import.meta.url, {
		...buildPluginLoaderJitiOptions(aliasMap),
		tryNative
	});
	jitiLoaders.set(cacheKey, loader);
	return loader;
}
function resolveChannelConfigSchemaModulePath(pluginDir) {
	for (const relativePath of SOURCE_CONFIG_SCHEMA_CANDIDATES) {
		const candidate = path.join(pluginDir, relativePath);
		if (fsSync.existsSync(candidate)) return candidate;
	}
	for (const basename of PUBLIC_CONFIG_SURFACE_BASENAMES) for (const extension of PUBLIC_SURFACE_SOURCE_EXTENSIONS) {
		const candidate = path.join(pluginDir, `${basename}${extension}`);
		if (fsSync.existsSync(candidate)) return candidate;
	}
}
function loadChannelConfigSurfaceModuleSync(modulePath) {
	try {
		return resolveConfigSchemaExport(getJiti(modulePath)(modulePath));
	} catch {
		return null;
	}
}
function resolvePackageChannelMeta(packageManifest, channelId) {
	const channelMeta = packageManifest?.channel;
	return channelMeta?.id?.trim() === channelId ? channelMeta : void 0;
}
function collectBundledChannelConfigs(params) {
	const channelIds = normalizeStringList(params.manifest.channels);
	const existingChannelConfigs = params.manifest.channelConfigs && Object.keys(params.manifest.channelConfigs).length > 0 ? { ...params.manifest.channelConfigs } : {};
	if (channelIds.length === 0) return Object.keys(existingChannelConfigs).length > 0 ? existingChannelConfigs : void 0;
	const surfaceModulePath = resolveChannelConfigSchemaModulePath(params.pluginDir);
	const surface = surfaceModulePath ? loadChannelConfigSurfaceModuleSync(surfaceModulePath) : null;
	for (const channelId of channelIds) {
		const existing = existingChannelConfigs[channelId];
		const channelMeta = resolvePackageChannelMeta(params.packageManifest, channelId);
		const preferOver = normalizeStringList(channelMeta?.preferOver);
		const uiHints = surface?.uiHints || existing?.uiHints ? {
			...surface?.uiHints && Object.keys(surface.uiHints).length > 0 ? surface.uiHints : {},
			...existing?.uiHints && Object.keys(existing.uiHints).length > 0 ? existing.uiHints : {}
		} : void 0;
		if (!surface?.schema && !existing?.schema) continue;
		existingChannelConfigs[channelId] = {
			schema: surface?.schema ?? existing?.schema ?? {},
			...uiHints && Object.keys(uiHints).length > 0 ? { uiHints } : {},
			...trimString(existing?.label) ?? trimString(channelMeta?.label) ? { label: trimString(existing?.label) ?? trimString(channelMeta?.label) } : {},
			...trimString(existing?.description) ?? trimString(channelMeta?.blurb) ? { description: trimString(existing?.description) ?? trimString(channelMeta?.blurb) } : {},
			...existing?.preferOver?.length ? { preferOver: existing.preferOver } : preferOver.length > 0 ? { preferOver } : {}
		};
	}
	return Object.keys(existingChannelConfigs).length > 0 ? existingChannelConfigs : void 0;
}
function collectBundledPluginMetadataForPackageRoot(packageRoot, includeChannelConfigs, includeSyntheticChannelConfigs) {
	const scanDir = resolveBundledPluginScanDir(packageRoot);
	if (!scanDir || !fsSync.existsSync(scanDir)) return [];
	const entries = [];
	for (const dirName of fsSync.readdirSync(scanDir, { withFileTypes: true }).filter((entry) => entry.isDirectory()).map((entry) => entry.name).toSorted((left, right) => left.localeCompare(right))) {
		const pluginDir = path.join(scanDir, dirName);
		const manifestResult = loadPluginManifest(pluginDir, false);
		if (!manifestResult.ok) continue;
		const packageJson = readPackageManifest(pluginDir);
		const packageManifest = getPackageManifestMetadata(packageJson);
		const extensions = normalizeStringList(packageManifest?.extensions);
		if (extensions.length === 0) continue;
		const sourceEntry = trimString(extensions[0]);
		const builtEntry = rewriteEntryToBuiltPath(sourceEntry);
		if (!sourceEntry || !builtEntry) continue;
		const setupSourcePath = trimString(packageManifest?.setupEntry);
		const setupSource = setupSourcePath && rewriteEntryToBuiltPath(setupSourcePath) ? {
			source: setupSourcePath,
			built: rewriteEntryToBuiltPath(setupSourcePath)
		} : void 0;
		const publicSurfaceArtifacts = collectTopLevelPublicSurfaceArtifacts({
			pluginDir,
			sourceEntry,
			...setupSourcePath ? { setupEntry: setupSourcePath } : {}
		});
		const runtimeSidecarArtifacts = collectRuntimeSidecarArtifacts(publicSurfaceArtifacts);
		const channelConfigs = includeChannelConfigs && includeSyntheticChannelConfigs ? collectBundledChannelConfigs({
			pluginDir,
			manifest: manifestResult.manifest,
			packageManifest
		}) : manifestResult.manifest.channelConfigs;
		entries.push({
			dirName,
			idHint: deriveIdHint({
				entryPath: sourceEntry,
				manifestId: manifestResult.manifest.id,
				packageName: trimString(packageJson?.name),
				hasMultipleExtensions: extensions.length > 1
			}),
			source: {
				source: sourceEntry,
				built: builtEntry
			},
			...setupSource ? { setupSource } : {},
			...publicSurfaceArtifacts ? { publicSurfaceArtifacts } : {},
			...runtimeSidecarArtifacts ? { runtimeSidecarArtifacts } : {},
			...trimString(packageJson?.name) ? { packageName: trimString(packageJson?.name) } : {},
			...trimString(packageJson?.version) ? { packageVersion: trimString(packageJson?.version) } : {},
			...trimString(packageJson?.description) ? { packageDescription: trimString(packageJson?.description) } : {},
			...packageManifest ? { packageManifest } : {},
			manifest: {
				...manifestResult.manifest,
				...channelConfigs ? { channelConfigs } : {}
			}
		});
	}
	return entries;
}
function listBundledPluginMetadata(params) {
	const rootDir = path.resolve(params?.rootDir ?? OPENCLAW_PACKAGE_ROOT);
	const includeChannelConfigs = params?.includeChannelConfigs ?? !RUNNING_FROM_BUILT_ARTIFACT;
	const includeSyntheticChannelConfigs = params?.includeSyntheticChannelConfigs ?? includeChannelConfigs;
	const cacheKey = JSON.stringify({
		rootDir,
		includeChannelConfigs,
		includeSyntheticChannelConfigs
	});
	const cached = bundledPluginMetadataCache.get(cacheKey);
	if (cached) return cached;
	const entries = Object.freeze(collectBundledPluginMetadataForPackageRoot(rootDir, includeChannelConfigs, includeSyntheticChannelConfigs));
	bundledPluginMetadataCache.set(cacheKey, entries);
	return entries;
}
function findBundledPluginMetadataById(pluginId, params) {
	return listBundledPluginMetadata(params).find((entry) => entry.manifest.id === pluginId);
}
function resolveBundledPluginWorkspaceSourcePath(params) {
	const metadata = findBundledPluginMetadataById(params.pluginId, { rootDir: params.rootDir });
	if (!metadata) return null;
	return path.resolve(params.rootDir, "extensions", metadata.dirName);
}
function resolveBundledPluginPublicSurfacePath(params) {
	const artifactBasename = params.artifactBasename.replace(/^\.\//u, "");
	if (!artifactBasename) return null;
	const explicitBundledPluginsDir = params.bundledPluginsDir ?? resolveBundledPluginsDir(params.env ?? process.env);
	if (explicitBundledPluginsDir) {
		const explicitPluginDir = path.resolve(explicitBundledPluginsDir, params.dirName);
		const explicitBuiltCandidate = path.join(explicitPluginDir, artifactBasename);
		if (fsSync.existsSync(explicitBuiltCandidate)) return explicitBuiltCandidate;
		const sourceBaseName = artifactBasename.replace(/\.js$/u, "");
		for (const ext of PUBLIC_SURFACE_SOURCE_EXTENSIONS) {
			const sourceCandidate = path.join(explicitPluginDir, `${sourceBaseName}${ext}`);
			if (fsSync.existsSync(sourceCandidate)) return sourceCandidate;
		}
	}
	for (const candidate of [path.resolve(params.rootDir, "dist", "extensions", params.dirName, artifactBasename), path.resolve(params.rootDir, "dist-runtime", "extensions", params.dirName, artifactBasename)]) if (fsSync.existsSync(candidate)) return candidate;
	const sourceBaseName = artifactBasename.replace(/\.js$/u, "");
	for (const ext of PUBLIC_SURFACE_SOURCE_EXTENSIONS) {
		const sourceCandidate = path.resolve(params.rootDir, "extensions", params.dirName, `${sourceBaseName}${ext}`);
		if (fsSync.existsSync(sourceCandidate)) return sourceCandidate;
	}
	return null;
}
//#endregion
//#region src/channels/ids.ts
const CHAT_CHANNEL_ORDER = [
	"telegram",
	"whatsapp",
	"discord",
	"irc",
	"googlechat",
	"slack",
	"signal",
	"imessage",
	"line"
];
const CHANNEL_IDS = [...CHAT_CHANNEL_ORDER];
//#endregion
//#region src/channels/chat-meta.ts
const CHAT_CHANNEL_ID_SET = new Set(CHAT_CHANNEL_ORDER);
function toChatChannelMeta(params) {
	const label = params.channel.label?.trim();
	if (!label) throw new Error(`Missing label for bundled chat channel "${params.id}"`);
	return {
		id: params.id,
		label,
		selectionLabel: params.channel.selectionLabel?.trim() || label,
		docsPath: params.channel.docsPath?.trim() || `/channels/${params.id}`,
		docsLabel: params.channel.docsLabel?.trim() || void 0,
		blurb: params.channel.blurb?.trim() || "",
		...params.channel.aliases?.length ? { aliases: params.channel.aliases } : {},
		...params.channel.order !== void 0 ? { order: params.channel.order } : {},
		...params.channel.selectionDocsPrefix !== void 0 ? { selectionDocsPrefix: params.channel.selectionDocsPrefix } : {},
		...params.channel.selectionDocsOmitLabel !== void 0 ? { selectionDocsOmitLabel: params.channel.selectionDocsOmitLabel } : {},
		...params.channel.selectionExtras?.length ? { selectionExtras: params.channel.selectionExtras } : {},
		...params.channel.detailLabel?.trim() ? { detailLabel: params.channel.detailLabel.trim() } : {},
		...params.channel.systemImage?.trim() ? { systemImage: params.channel.systemImage.trim() } : {},
		...params.channel.markdownCapable !== void 0 ? { markdownCapable: params.channel.markdownCapable } : {},
		...params.channel.showConfigured !== void 0 ? { showConfigured: params.channel.showConfigured } : {},
		...params.channel.quickstartAllowFrom !== void 0 ? { quickstartAllowFrom: params.channel.quickstartAllowFrom } : {},
		...params.channel.forceAccountBinding !== void 0 ? { forceAccountBinding: params.channel.forceAccountBinding } : {},
		...params.channel.preferSessionLookupForAnnounceTarget !== void 0 ? { preferSessionLookupForAnnounceTarget: params.channel.preferSessionLookupForAnnounceTarget } : {},
		...params.channel.preferOver?.length ? { preferOver: params.channel.preferOver } : {}
	};
}
function buildChatChannelMetaById() {
	const entries = /* @__PURE__ */ new Map();
	for (const entry of listBundledPluginMetadata({
		includeChannelConfigs: true,
		includeSyntheticChannelConfigs: false
	})) {
		const channel = entry.packageManifest && "channel" in entry.packageManifest ? entry.packageManifest.channel : void 0;
		if (!channel) continue;
		const rawId = channel?.id?.trim();
		if (!rawId || !CHAT_CHANNEL_ID_SET.has(rawId)) continue;
		const id = rawId;
		entries.set(id, toChatChannelMeta({
			id,
			channel
		}));
	}
	const missingIds = CHAT_CHANNEL_ORDER.filter((id) => !entries.has(id));
	if (missingIds.length > 0) throw new Error(`Missing bundled chat channel metadata for: ${missingIds.join(", ")}`);
	return Object.freeze(Object.fromEntries(entries));
}
const CHAT_CHANNEL_META = buildChatChannelMetaById();
const CHAT_CHANNEL_ALIASES = Object.freeze(Object.fromEntries(Object.values(CHAT_CHANNEL_META).flatMap((meta) => (meta.aliases ?? []).map((alias) => [alias.trim().toLowerCase(), meta.id])).filter(([alias]) => alias.length > 0).toSorted(([left], [right]) => left.localeCompare(right))));
function normalizeChannelKey(raw) {
	return raw?.trim().toLowerCase() || void 0;
}
function listChatChannels() {
	return CHAT_CHANNEL_ORDER.map((id) => CHAT_CHANNEL_META[id]);
}
function getChatChannelMeta(id) {
	return CHAT_CHANNEL_META[id];
}
function normalizeChatChannelId(raw) {
	const normalized = normalizeChannelKey(raw);
	if (!normalized) return null;
	const resolved = CHAT_CHANNEL_ALIASES[normalized] ?? normalized;
	return CHAT_CHANNEL_ORDER.includes(resolved) ? resolved : null;
}
//#endregion
export { resolveBundledPluginsDir as _, CHAT_CHANNEL_ORDER as a, resolveBundledPluginPublicSurfacePath as c, buildPluginLoaderJitiOptions as d, resolveLoaderPackageRoot as f, shouldPreferNativeJiti as g, resolvePluginSdkScopedAliasMap as h, CHANNEL_IDS as i, resolveBundledPluginWorkspaceSourcePath as l, resolvePluginSdkAliasFile as m, listChatChannels as n, findBundledPluginMetadataById as o, resolvePluginRuntimeModulePath as p, normalizeChatChannelId as r, listBundledPluginMetadata as s, getChatChannelMeta as t, buildPluginLoaderAliasMap as u };
