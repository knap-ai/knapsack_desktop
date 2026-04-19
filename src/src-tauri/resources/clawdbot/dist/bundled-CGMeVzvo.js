import { i as formatErrorMessage } from "./errors-D8p6rxH8.js";
import { i as normalizeLowercaseStringOrEmpty } from "./string-coerce-BUSzWgUA.js";
import { n as resolveOpenClawPackageRootSync } from "./openclaw-root-BNWw3cXT.js";
import { t as resolveBundledPluginsDir } from "./bundled-dir-D4Wk35JT.js";
import { t as createSubsystemLogger } from "./subsystem-Cgmckbux.js";
import { i as openBoundaryFileSync } from "./boundary-file-read-DXLy_w6L.js";
import { n as listBundledPluginMetadata, r as resolveBundledPluginGeneratedPath } from "./bundled-plugin-metadata-Da-MNAHv.js";
import { t as getCachedPluginJitiLoader } from "./jiti-loader-cache-D_0TILck.js";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import fs from "node:fs";
import path from "node:path";
//#region src/channels/plugins/bundled-root.ts
const OPENCLAW_PACKAGE_ROOT = resolveOpenClawPackageRootSync({
	argv1: process.argv[1],
	cwd: process.cwd(),
	moduleUrl: import.meta.url.startsWith("file:") ? import.meta.url : void 0
}) ?? (import.meta.url.startsWith("file:") ? path.resolve(fileURLToPath(new URL("../../..", import.meta.url))) : process.cwd());
function derivePackageRootFromExtensionsDir(extensionsDir) {
	const parentDir = path.dirname(extensionsDir);
	const parentBase = path.basename(parentDir);
	if (parentBase === "dist" || parentBase === "dist-runtime") return path.dirname(parentDir);
	return parentDir;
}
function resolveBundledChannelRootScope(env = process.env) {
	const bundledPluginsDir = resolveBundledPluginsDir(env);
	if (!bundledPluginsDir) return {
		packageRoot: OPENCLAW_PACKAGE_ROOT,
		cacheKey: OPENCLAW_PACKAGE_ROOT
	};
	const resolvedPluginsDir = path.resolve(bundledPluginsDir);
	return {
		packageRoot: path.basename(resolvedPluginsDir) === "extensions" ? derivePackageRootFromExtensionsDir(resolvedPluginsDir) : resolvedPluginsDir,
		cacheKey: resolvedPluginsDir,
		pluginsDir: resolvedPluginsDir
	};
}
//#endregion
//#region src/plugins/bundled-channel-runtime.ts
function listBundledChannelPluginMetadata(params) {
	return listBundledPluginMetadata(params);
}
function resolveBundledChannelGeneratedPath(rootDir, entry, pluginDirName, scanDir) {
	return resolveBundledPluginGeneratedPath(rootDir, entry, pluginDirName, scanDir);
}
//#endregion
//#region src/plugins/module-export.ts
function unwrapDefaultModuleExport(moduleExport) {
	let resolved = moduleExport;
	const seen = /* @__PURE__ */ new Set();
	while (resolved && typeof resolved === "object" && "default" in resolved && !seen.has(resolved)) {
		seen.add(resolved);
		resolved = resolved.default;
	}
	return resolved;
}
//#endregion
//#region src/channels/plugins/module-loader.ts
const nodeRequire = createRequire(import.meta.url);
function createModuleLoader() {
	const jitiLoaders = /* @__PURE__ */ new Map();
	return (modulePath) => {
		return getCachedPluginJitiLoader({
			cache: jitiLoaders,
			modulePath,
			importerUrl: import.meta.url,
			argvEntry: process.argv[1],
			preferBuiltDist: true,
			jitiFilename: import.meta.url
		});
	};
}
let loadModule = createModuleLoader();
function isJavaScriptModulePath(modulePath) {
	return [
		".js",
		".mjs",
		".cjs"
	].includes(normalizeLowercaseStringOrEmpty(path.extname(modulePath)));
}
function resolvePluginModuleCandidates(rootDir, specifier) {
	const normalizedSpecifier = specifier.replace(/\\/g, "/");
	const resolvedPath = path.resolve(rootDir, normalizedSpecifier);
	if (path.extname(resolvedPath)) return [resolvedPath];
	return [
		resolvedPath,
		`${resolvedPath}.ts`,
		`${resolvedPath}.mts`,
		`${resolvedPath}.js`,
		`${resolvedPath}.mjs`,
		`${resolvedPath}.cts`,
		`${resolvedPath}.cjs`
	];
}
function resolveExistingPluginModulePath(rootDir, specifier) {
	for (const candidate of resolvePluginModuleCandidates(rootDir, specifier)) if (fs.existsSync(candidate)) return candidate;
	return path.resolve(rootDir, specifier);
}
function loadChannelPluginModule(params) {
	const opened = openBoundaryFileSync({
		absolutePath: params.modulePath,
		rootPath: params.boundaryRootDir ?? params.rootDir,
		boundaryLabel: params.boundaryLabel ?? "plugin root",
		rejectHardlinks: false,
		skipLexicalRootCheck: true
	});
	if (!opened.ok) throw new Error(`${params.boundaryLabel ?? "plugin"} module path escapes plugin root or fails alias checks`);
	const safePath = opened.path;
	fs.closeSync(opened.fd);
	if (process.platform === "win32" && params.shouldTryNativeRequire?.(safePath)) try {
		return nodeRequire(safePath);
	} catch {}
	return loadModule(safePath)(safePath);
}
//#endregion
//#region src/channels/plugins/bundled.ts
const log = createSubsystemLogger("channels");
function resolveChannelPluginModuleEntry(moduleExport) {
	const resolved = unwrapDefaultModuleExport(moduleExport);
	if (!resolved || typeof resolved !== "object") return null;
	const record = resolved;
	if (record.kind !== "bundled-channel-entry") return null;
	if (typeof record.id !== "string" || typeof record.name !== "string" || typeof record.description !== "string" || typeof record.register !== "function" || typeof record.loadChannelPlugin !== "function") return null;
	return record;
}
function resolveChannelSetupModuleEntry(moduleExport) {
	const resolved = unwrapDefaultModuleExport(moduleExport);
	if (!resolved || typeof resolved !== "object") return null;
	const record = resolved;
	if (record.kind !== "bundled-channel-setup-entry") return null;
	if (typeof record.loadSetupPlugin !== "function") return null;
	return record;
}
function hasSetupEntryFeature(entry, feature) {
	return entry?.features?.[feature] === true;
}
function hasChannelEntryFeature(entry, feature) {
	return entry?.features?.[feature] === true;
}
function resolveBundledChannelBoundaryRoot(params) {
	const overrideRoot = params.pluginsDir ? path.resolve(params.pluginsDir, params.metadata.dirName) : null;
	if (overrideRoot && (params.modulePath === overrideRoot || params.modulePath.startsWith(`${overrideRoot}${path.sep}`))) return overrideRoot;
	const distRoot = path.resolve(params.packageRoot, "dist", "extensions", params.metadata.dirName);
	if (params.modulePath === distRoot || params.modulePath.startsWith(`${distRoot}${path.sep}`)) return distRoot;
	return path.resolve(params.packageRoot, "extensions", params.metadata.dirName);
}
function resolveBundledChannelScanDir(rootScope) {
	return rootScope.pluginsDir;
}
function resolveGeneratedBundledChannelModulePath(params) {
	if (!params.entry) return null;
	return resolveBundledChannelGeneratedPath(params.rootScope.packageRoot, params.entry, params.metadata.dirName, resolveBundledChannelScanDir(params.rootScope));
}
function loadGeneratedBundledChannelModule(params) {
	const modulePath = resolveGeneratedBundledChannelModulePath(params);
	if (!modulePath) throw new Error(`missing generated module for bundled channel ${params.metadata.manifest.id}`);
	const scanDir = resolveBundledChannelScanDir(params.rootScope);
	const boundaryRoot = resolveBundledChannelBoundaryRoot({
		packageRoot: params.rootScope.packageRoot,
		...scanDir ? { pluginsDir: scanDir } : {},
		metadata: params.metadata,
		modulePath
	});
	return loadChannelPluginModule({
		modulePath,
		rootDir: boundaryRoot,
		boundaryRootDir: boundaryRoot,
		shouldTryNativeRequire: (safePath) => safePath.includes(`${path.sep}dist${path.sep}`) && isJavaScriptModulePath(safePath)
	});
}
function loadGeneratedBundledChannelEntry(params) {
	try {
		const entry = resolveChannelPluginModuleEntry(loadGeneratedBundledChannelModule({
			rootScope: params.rootScope,
			metadata: params.metadata,
			entry: params.metadata.source
		}));
		if (!entry) {
			log.warn(`[channels] bundled channel entry ${params.metadata.manifest.id} missing bundled-channel-entry contract; skipping`);
			return null;
		}
		const setupEntry = params.includeSetup && params.metadata.setupSource ? resolveChannelSetupModuleEntry(loadGeneratedBundledChannelModule({
			rootScope: params.rootScope,
			metadata: params.metadata,
			entry: params.metadata.setupSource
		})) : null;
		return {
			id: params.metadata.manifest.id,
			entry,
			...setupEntry ? { setupEntry } : {}
		};
	} catch (error) {
		const detail = formatErrorMessage(error);
		log.warn(`[channels] failed to load bundled channel ${params.metadata.manifest.id}: ${detail}`);
		return null;
	}
}
const cachedBundledChannelMetadata = /* @__PURE__ */ new Map();
const bundledChannelCacheContexts = /* @__PURE__ */ new Map();
function createBundledChannelCacheContext() {
	return {
		pluginLoadInProgressIds: /* @__PURE__ */ new Set(),
		setupPluginLoadInProgressIds: /* @__PURE__ */ new Set(),
		entryLoadInProgressIds: /* @__PURE__ */ new Set(),
		lazyEntriesById: /* @__PURE__ */ new Map(),
		lazyPluginsById: /* @__PURE__ */ new Map(),
		lazySetupPluginsById: /* @__PURE__ */ new Map(),
		lazySecretsById: /* @__PURE__ */ new Map(),
		lazySetupSecretsById: /* @__PURE__ */ new Map(),
		lazyAccountInspectorsById: /* @__PURE__ */ new Map()
	};
}
function getBundledChannelCacheContext(cacheKey) {
	const cached = bundledChannelCacheContexts.get(cacheKey);
	if (cached) return cached;
	const created = createBundledChannelCacheContext();
	bundledChannelCacheContexts.set(cacheKey, created);
	return created;
}
function resolveActiveBundledChannelCacheScope() {
	const rootScope = resolveBundledChannelRootScope();
	return {
		rootScope,
		cacheContext: getBundledChannelCacheContext(rootScope.cacheKey)
	};
}
function listBundledChannelMetadata(rootScope = resolveBundledChannelRootScope()) {
	const cached = cachedBundledChannelMetadata.get(rootScope.cacheKey);
	if (cached) return cached;
	const scanDir = resolveBundledChannelScanDir(rootScope);
	const loaded = listBundledChannelPluginMetadata({
		rootDir: rootScope.packageRoot,
		...scanDir ? { scanDir } : {},
		includeChannelConfigs: false,
		includeSyntheticChannelConfigs: false
	}).filter((metadata) => (metadata.manifest.channels?.length ?? 0) > 0);
	cachedBundledChannelMetadata.set(rootScope.cacheKey, loaded);
	return loaded;
}
function listBundledChannelPluginIdsForRoot(rootScope) {
	return listBundledChannelMetadata(rootScope).map((metadata) => metadata.manifest.id).toSorted((left, right) => left.localeCompare(right));
}
function listBundledChannelPluginIds() {
	return listBundledChannelPluginIdsForRoot(resolveBundledChannelRootScope());
}
function resolveBundledChannelMetadata(id, rootScope) {
	return listBundledChannelMetadata(rootScope).find((metadata) => metadata.manifest.id === id || metadata.manifest.channels?.includes(id));
}
function getLazyGeneratedBundledChannelEntryForRoot(id, rootScope, cacheContext, params) {
	const cached = cacheContext.lazyEntriesById.get(id);
	if (cached && (!params?.includeSetup || cached.setupEntry)) return cached;
	if (cached === null && !params?.includeSetup) return null;
	const metadata = resolveBundledChannelMetadata(id, rootScope);
	if (!metadata) {
		cacheContext.lazyEntriesById.set(id, null);
		return null;
	}
	if (cacheContext.entryLoadInProgressIds.has(id)) return null;
	cacheContext.entryLoadInProgressIds.add(id);
	try {
		const entry = loadGeneratedBundledChannelEntry({
			rootScope,
			metadata,
			includeSetup: params?.includeSetup === true
		});
		cacheContext.lazyEntriesById.set(id, entry);
		if (entry?.entry.id && entry.entry.id !== id) cacheContext.lazyEntriesById.set(entry.entry.id, entry);
		return entry;
	} finally {
		cacheContext.entryLoadInProgressIds.delete(id);
	}
}
function getBundledChannelPluginForRoot(id, rootScope, cacheContext) {
	const cached = cacheContext.lazyPluginsById.get(id);
	if (cached) return cached;
	if (cacheContext.pluginLoadInProgressIds.has(id)) return;
	const entry = getLazyGeneratedBundledChannelEntryForRoot(id, rootScope, cacheContext)?.entry;
	if (!entry) return;
	cacheContext.pluginLoadInProgressIds.add(id);
	try {
		const plugin = entry.loadChannelPlugin();
		cacheContext.lazyPluginsById.set(id, plugin);
		return plugin;
	} finally {
		cacheContext.pluginLoadInProgressIds.delete(id);
	}
}
function getBundledChannelSecretsForRoot(id, rootScope, cacheContext) {
	if (cacheContext.lazySecretsById.has(id)) return cacheContext.lazySecretsById.get(id) ?? void 0;
	const entry = getLazyGeneratedBundledChannelEntryForRoot(id, rootScope, cacheContext)?.entry;
	if (!entry) return;
	const secrets = entry.loadChannelSecrets?.() ?? getBundledChannelPluginForRoot(id, rootScope, cacheContext)?.secrets;
	cacheContext.lazySecretsById.set(id, secrets ?? null);
	return secrets;
}
function getBundledChannelAccountInspectorForRoot(id, rootScope, cacheContext) {
	if (cacheContext.lazyAccountInspectorsById.has(id)) return cacheContext.lazyAccountInspectorsById.get(id) ?? void 0;
	const entry = getLazyGeneratedBundledChannelEntryForRoot(id, rootScope, cacheContext)?.entry;
	if (!entry?.loadChannelAccountInspector) {
		cacheContext.lazyAccountInspectorsById.set(id, null);
		return;
	}
	const inspector = entry.loadChannelAccountInspector();
	cacheContext.lazyAccountInspectorsById.set(id, inspector);
	return inspector;
}
function getBundledChannelSetupPluginForRoot(id, rootScope, cacheContext) {
	const cached = cacheContext.lazySetupPluginsById.get(id);
	if (cached) return cached;
	if (cacheContext.setupPluginLoadInProgressIds.has(id)) return;
	const entry = getLazyGeneratedBundledChannelEntryForRoot(id, rootScope, cacheContext, { includeSetup: true })?.setupEntry;
	if (!entry) return;
	cacheContext.setupPluginLoadInProgressIds.add(id);
	try {
		const plugin = entry.loadSetupPlugin();
		cacheContext.lazySetupPluginsById.set(id, plugin);
		return plugin;
	} finally {
		cacheContext.setupPluginLoadInProgressIds.delete(id);
	}
}
function getBundledChannelSetupSecretsForRoot(id, rootScope, cacheContext) {
	if (cacheContext.lazySetupSecretsById.has(id)) return cacheContext.lazySetupSecretsById.get(id) ?? void 0;
	const entry = getLazyGeneratedBundledChannelEntryForRoot(id, rootScope, cacheContext, { includeSetup: true })?.setupEntry;
	if (!entry) return;
	const secrets = entry.loadSetupSecrets?.() ?? getBundledChannelSetupPluginForRoot(id, rootScope, cacheContext)?.secrets;
	cacheContext.lazySetupSecretsById.set(id, secrets ?? null);
	return secrets;
}
function listBundledChannelPlugins() {
	const { rootScope, cacheContext } = resolveActiveBundledChannelCacheScope();
	return listBundledChannelPluginIdsForRoot(rootScope).flatMap((id) => {
		const plugin = getBundledChannelPluginForRoot(id, rootScope, cacheContext);
		return plugin ? [plugin] : [];
	});
}
function listBundledChannelSetupPlugins() {
	const { rootScope, cacheContext } = resolveActiveBundledChannelCacheScope();
	return listBundledChannelPluginIdsForRoot(rootScope).flatMap((id) => {
		const plugin = getBundledChannelSetupPluginForRoot(id, rootScope, cacheContext);
		return plugin ? [plugin] : [];
	});
}
function listBundledChannelSetupPluginsByFeature(feature) {
	const { rootScope, cacheContext } = resolveActiveBundledChannelCacheScope();
	return listBundledChannelPluginIdsForRoot(rootScope).flatMap((id) => {
		const setupEntry = getLazyGeneratedBundledChannelEntryForRoot(id, rootScope, cacheContext, { includeSetup: true })?.setupEntry;
		if (!hasSetupEntryFeature(setupEntry, feature)) return [];
		const plugin = getBundledChannelSetupPluginForRoot(id, rootScope, cacheContext);
		return plugin ? [plugin] : [];
	});
}
function hasBundledChannelEntryFeature(id, feature) {
	const { rootScope, cacheContext } = resolveActiveBundledChannelCacheScope();
	const entry = getLazyGeneratedBundledChannelEntryForRoot(id, rootScope, cacheContext)?.entry;
	return hasChannelEntryFeature(entry, feature);
}
function getBundledChannelAccountInspector(id) {
	const { rootScope, cacheContext } = resolveActiveBundledChannelCacheScope();
	return getBundledChannelAccountInspectorForRoot(id, rootScope, cacheContext);
}
function getBundledChannelPlugin(id) {
	const { rootScope, cacheContext } = resolveActiveBundledChannelCacheScope();
	return getBundledChannelPluginForRoot(id, rootScope, cacheContext);
}
function getBundledChannelSecrets(id) {
	const { rootScope, cacheContext } = resolveActiveBundledChannelCacheScope();
	return getBundledChannelSecretsForRoot(id, rootScope, cacheContext);
}
function getBundledChannelSetupPlugin(id) {
	const { rootScope, cacheContext } = resolveActiveBundledChannelCacheScope();
	return getBundledChannelSetupPluginForRoot(id, rootScope, cacheContext);
}
function getBundledChannelSetupSecrets(id) {
	const { rootScope, cacheContext } = resolveActiveBundledChannelCacheScope();
	return getBundledChannelSetupSecretsForRoot(id, rootScope, cacheContext);
}
function requireBundledChannelPlugin(id) {
	const plugin = getBundledChannelPlugin(id);
	if (!plugin) throw new Error(`missing bundled channel plugin: ${id}`);
	return plugin;
}
function setBundledChannelRuntime(id, runtime) {
	const { rootScope, cacheContext } = resolveActiveBundledChannelCacheScope();
	const setter = getLazyGeneratedBundledChannelEntryForRoot(id, rootScope, cacheContext)?.entry.setChannelRuntime;
	if (!setter) throw new Error(`missing bundled channel runtime setter: ${id}`);
	setter(runtime);
}
//#endregion
export { resolveBundledChannelRootScope as _, getBundledChannelSetupSecrets as a, listBundledChannelPlugins as c, requireBundledChannelPlugin as d, setBundledChannelRuntime as f, unwrapDefaultModuleExport as g, resolveExistingPluginModulePath as h, getBundledChannelSetupPlugin as i, listBundledChannelSetupPlugins as l, loadChannelPluginModule as m, getBundledChannelPlugin as n, hasBundledChannelEntryFeature as o, isJavaScriptModulePath as p, getBundledChannelSecrets as r, listBundledChannelPluginIds as s, getBundledChannelAccountInspector as t, listBundledChannelSetupPluginsByFeature as u };
