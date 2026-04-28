import { c as normalizeOptionalString, s as normalizeOptionalLowercaseString } from "./string-coerce-Bje8XVt9.js";
import { n as resolveOpenClawPackageRootSync } from "./openclaw-root-BAiQfngU.js";
import { i as formatErrorMessage } from "./errors-CDFVCV9D.js";
import { t as resolveBundledPluginsDir } from "./bundled-dir-DygrJuRr.js";
import { t as createSubsystemLogger } from "./subsystem-rHhUC6qs.js";
import { i as openBoundaryFileSync } from "./boundary-file-read-C8TEdk8a.js";
import { n as listBundledPluginMetadata, r as resolveBundledPluginGeneratedPath } from "./bundled-plugin-metadata-Ds2SxpYG.js";
import { n as isJavaScriptModulePath, r as tryNativeRequireJavaScriptModule, t as getCachedPluginJitiLoader } from "./jiti-loader-cache-DLO0UJX_.js";
import { n as prepareBundledPluginRuntimeRoot, t as isBuiltBundledPluginRuntimeRoot } from "./bundled-runtime-root-DEMD7-O_.js";
import { t as unwrapDefaultModuleExport } from "./module-export-f8zoIwaD.js";
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
//#region src/channels/plugins/meta-normalization.ts
function stripRequiredChannelMeta(meta) {
	const { id: _ignoredId, label: _ignoredLabel, selectionLabel: _ignoredSelectionLabel, docsPath: _ignoredDocsPath, blurb: _ignoredBlurb, ...rest } = meta ?? {};
	return rest;
}
function normalizeChannelMeta(params) {
	const next = params.meta ?? void 0;
	const existing = params.existing ?? void 0;
	const label = normalizeOptionalString(next?.label) ?? normalizeOptionalString(existing?.label) ?? normalizeOptionalString(next?.selectionLabel) ?? normalizeOptionalString(existing?.selectionLabel) ?? params.id;
	const selectionLabel = normalizeOptionalString(next?.selectionLabel) ?? normalizeOptionalString(existing?.selectionLabel) ?? label;
	const docsPath = normalizeOptionalString(next?.docsPath) ?? normalizeOptionalString(existing?.docsPath) ?? `/channels/${params.id}`;
	const blurb = normalizeOptionalString(next?.blurb) ?? normalizeOptionalString(existing?.blurb) ?? "";
	return {
		...stripRequiredChannelMeta(existing),
		...stripRequiredChannelMeta(next),
		id: params.id,
		label,
		selectionLabel,
		docsPath,
		blurb
	};
}
//#endregion
//#region src/channels/plugins/module-loader.ts
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
	if (params.shouldTryNativeRequire?.(safePath)) {
		const nativeModule = tryNativeRequireJavaScriptModule(safePath, { allowWindows: true });
		if (nativeModule.ok) return nativeModule.moduleExport;
	}
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
	let modulePath = resolveGeneratedBundledChannelModulePath(params);
	if (!modulePath) throw new Error(`missing generated module for bundled channel ${params.metadata.manifest.id}`);
	const scanDir = resolveBundledChannelScanDir(params.rootScope);
	let boundaryRoot = resolveBundledChannelBoundaryRoot({
		packageRoot: params.rootScope.packageRoot,
		...scanDir ? { pluginsDir: scanDir } : {},
		metadata: params.metadata,
		modulePath
	});
	if (params.installRuntimeDeps !== false && isBuiltBundledPluginRuntimeRoot(boundaryRoot)) {
		const prepared = prepareBundledPluginRuntimeRoot({
			pluginId: params.metadata.manifest.id,
			pluginRoot: boundaryRoot,
			modulePath,
			env: process.env,
			logInstalled: (installedSpecs) => {
				log.debug(`[channels] ${params.metadata.manifest.id} installed bundled runtime deps: ${installedSpecs.join(", ")}`);
			}
		});
		modulePath = prepared.modulePath;
		boundaryRoot = prepared.pluginRoot;
	}
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
			entry: params.metadata.source,
			installRuntimeDeps: true
		}));
		if (!entry) {
			log.warn(`[channels] bundled channel entry ${params.metadata.manifest.id} missing bundled-channel-entry contract; skipping`);
			return null;
		}
		return {
			id: params.metadata.manifest.id,
			entry
		};
	} catch (error) {
		const detail = formatErrorMessage(error);
		log.warn(`[channels] failed to load bundled channel ${params.metadata.manifest.id}: ${detail}`);
		return null;
	}
}
function loadGeneratedBundledChannelSetupEntry(params) {
	if (!params.metadata.setupSource) return null;
	try {
		const setupEntry = resolveChannelSetupModuleEntry(loadGeneratedBundledChannelModule({
			rootScope: params.rootScope,
			metadata: params.metadata,
			entry: params.metadata.setupSource,
			installRuntimeDeps: false
		}));
		if (!setupEntry) {
			log.warn(`[channels] bundled channel setup entry ${params.metadata.manifest.id} missing bundled-channel-setup-entry contract; skipping`);
			return null;
		}
		return setupEntry;
	} catch (error) {
		const detail = formatErrorMessage(error);
		log.warn(`[channels] failed to load bundled channel setup entry ${params.metadata.manifest.id}: ${detail}`);
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
		setupEntryLoadInProgressIds: /* @__PURE__ */ new Set(),
		lazyEntriesById: /* @__PURE__ */ new Map(),
		lazySetupEntriesById: /* @__PURE__ */ new Map(),
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
function shouldIncludeBundledChannelSetupFeatureForConfig(params) {
	if (!params.config) return true;
	const plugins = params.config.plugins;
	if (plugins?.enabled === false) return false;
	const pluginId = params.metadata.manifest.id;
	if (plugins?.deny?.includes(pluginId)) return false;
	if (plugins?.entries?.[pluginId]?.enabled === false) return false;
	let hasExplicitChannelDisable = false;
	for (const channelId of params.metadata.manifest.channels ?? [pluginId]) {
		const normalizedChannelId = normalizeOptionalLowercaseString(channelId);
		if (!normalizedChannelId) continue;
		const channelConfig = params.config.channels?.[normalizedChannelId];
		if (!channelConfig || typeof channelConfig !== "object" || Array.isArray(channelConfig)) continue;
		if (channelConfig.enabled === false) {
			hasExplicitChannelDisable = true;
			continue;
		}
		return true;
	}
	return !hasExplicitChannelDisable;
}
function listBundledChannelPluginIdsForSetupFeature(rootScope, feature, options = {}) {
	const hinted = listBundledChannelMetadata(rootScope).filter((metadata) => metadata.packageManifest?.setupFeatures?.[feature] === true && shouldIncludeBundledChannelSetupFeatureForConfig({
		metadata,
		config: options.config
	})).map((metadata) => metadata.manifest.id).toSorted((left, right) => left.localeCompare(right));
	return hinted.length > 0 ? hinted : listBundledChannelMetadata(rootScope).filter((metadata) => shouldIncludeBundledChannelSetupFeatureForConfig({
		metadata,
		config: options.config
	})).map((metadata) => metadata.manifest.id).toSorted((left, right) => left.localeCompare(right));
}
function listBundledChannelPluginIds() {
	return listBundledChannelPluginIdsForRoot(resolveBundledChannelRootScope());
}
function hasBundledChannelPackageSetupFeature(id, feature) {
	return resolveBundledChannelMetadata(id, resolveBundledChannelRootScope())?.packageManifest?.setupFeatures?.[feature] === true;
}
function resolveBundledChannelMetadata(id, rootScope) {
	return listBundledChannelMetadata(rootScope).find((metadata) => metadata.manifest.id === id || metadata.manifest.channels?.includes(id));
}
function getLazyGeneratedBundledChannelEntryForRoot(id, rootScope, cacheContext) {
	const cached = cacheContext.lazyEntriesById.get(id);
	if (cached) return cached;
	if (cached === null) return null;
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
			metadata
		});
		cacheContext.lazyEntriesById.set(id, entry);
		if (entry?.entry.id && entry.entry.id !== id) cacheContext.lazyEntriesById.set(entry.entry.id, entry);
		return entry;
	} finally {
		cacheContext.entryLoadInProgressIds.delete(id);
	}
}
function cacheBundledChannelSetupEntry(metadata, cacheContext, entry, requestedId) {
	const ids = new Set([
		metadata.manifest.id,
		...metadata.manifest.channels ?? [],
		...requestedId ? [requestedId] : []
	]);
	for (const id of ids) cacheContext.lazySetupEntriesById.set(id, entry);
}
function getLazyGeneratedBundledChannelSetupEntryForRoot(id, rootScope, cacheContext) {
	if (cacheContext.lazySetupEntriesById.has(id)) return cacheContext.lazySetupEntriesById.get(id) ?? null;
	const metadata = resolveBundledChannelMetadata(id, rootScope);
	if (!metadata) {
		cacheContext.lazySetupEntriesById.set(id, null);
		return null;
	}
	if (cacheContext.setupEntryLoadInProgressIds.has(id)) return null;
	cacheContext.setupEntryLoadInProgressIds.add(id);
	try {
		const setupEntry = loadGeneratedBundledChannelSetupEntry({
			rootScope,
			metadata
		});
		cacheBundledChannelSetupEntry(metadata, cacheContext, setupEntry, id);
		return setupEntry;
	} finally {
		cacheContext.setupEntryLoadInProgressIds.delete(id);
	}
}
function getBundledChannelPluginForRoot(id, rootScope, cacheContext) {
	if (cacheContext.lazyPluginsById.has(id)) return cacheContext.lazyPluginsById.get(id) ?? void 0;
	if (cacheContext.pluginLoadInProgressIds.has(id)) return;
	const entry = getLazyGeneratedBundledChannelEntryForRoot(id, rootScope, cacheContext)?.entry;
	if (!entry) return;
	cacheContext.pluginLoadInProgressIds.add(id);
	try {
		const metadata = resolveBundledChannelMetadata(id, rootScope);
		const plugin = entry.loadChannelPlugin();
		if (!plugin) {
			cacheContext.lazyPluginsById.set(id, null);
			return;
		}
		const normalizedPlugin = {
			...plugin,
			meta: normalizeChannelMeta({
				id: plugin.id,
				meta: plugin.meta,
				existing: metadata?.packageManifest?.channel
			})
		};
		cacheContext.lazyPluginsById.set(id, normalizedPlugin);
		return normalizedPlugin;
	} catch (error) {
		const detail = formatErrorMessage(error);
		log.warn(`[channels] failed to load bundled channel ${id}: ${detail}`);
		cacheContext.lazyPluginsById.set(id, null);
		return;
	} finally {
		cacheContext.pluginLoadInProgressIds.delete(id);
	}
}
function getBundledChannelSecretsForRoot(id, rootScope, cacheContext) {
	if (cacheContext.lazySecretsById.has(id)) return cacheContext.lazySecretsById.get(id) ?? void 0;
	const entry = getLazyGeneratedBundledChannelEntryForRoot(id, rootScope, cacheContext)?.entry;
	if (!entry) return;
	try {
		const secrets = entry.loadChannelSecrets?.() ?? getBundledChannelPluginForRoot(id, rootScope, cacheContext)?.secrets;
		cacheContext.lazySecretsById.set(id, secrets ?? null);
		return secrets;
	} catch (error) {
		const detail = formatErrorMessage(error);
		log.warn(`[channels] failed to load bundled channel secrets ${id}: ${detail}`);
		cacheContext.lazySecretsById.set(id, null);
		return;
	}
}
function getBundledChannelAccountInspectorForRoot(id, rootScope, cacheContext) {
	if (cacheContext.lazyAccountInspectorsById.has(id)) return cacheContext.lazyAccountInspectorsById.get(id) ?? void 0;
	const entry = getLazyGeneratedBundledChannelEntryForRoot(id, rootScope, cacheContext)?.entry;
	if (!entry?.loadChannelAccountInspector) {
		cacheContext.lazyAccountInspectorsById.set(id, null);
		return;
	}
	try {
		const inspector = entry.loadChannelAccountInspector();
		cacheContext.lazyAccountInspectorsById.set(id, inspector);
		return inspector;
	} catch (error) {
		const detail = formatErrorMessage(error);
		log.warn(`[channels] failed to load bundled channel account inspector ${id}: ${detail}`);
		cacheContext.lazyAccountInspectorsById.set(id, null);
		return;
	}
}
function getBundledChannelSetupPluginForRoot(id, rootScope, cacheContext) {
	if (cacheContext.lazySetupPluginsById.has(id)) return cacheContext.lazySetupPluginsById.get(id) ?? void 0;
	if (cacheContext.setupPluginLoadInProgressIds.has(id)) return;
	const entry = getLazyGeneratedBundledChannelSetupEntryForRoot(id, rootScope, cacheContext);
	if (!entry) return;
	cacheContext.setupPluginLoadInProgressIds.add(id);
	try {
		const plugin = entry.loadSetupPlugin({ installRuntimeDeps: false });
		cacheContext.lazySetupPluginsById.set(id, plugin);
		return plugin;
	} catch (error) {
		const detail = formatErrorMessage(error);
		log.warn(`[channels] failed to load bundled channel setup ${id}: ${detail}`);
		cacheContext.lazySetupPluginsById.set(id, null);
		return;
	} finally {
		cacheContext.setupPluginLoadInProgressIds.delete(id);
	}
}
function getBundledChannelSetupSecretsForRoot(id, rootScope, cacheContext) {
	if (cacheContext.lazySetupSecretsById.has(id)) return cacheContext.lazySetupSecretsById.get(id) ?? void 0;
	const entry = getLazyGeneratedBundledChannelSetupEntryForRoot(id, rootScope, cacheContext);
	if (!entry) return;
	try {
		const secrets = entry.loadSetupSecrets?.() ?? getBundledChannelSetupPluginForRoot(id, rootScope, cacheContext)?.secrets;
		cacheContext.lazySetupSecretsById.set(id, secrets ?? null);
		return secrets;
	} catch (error) {
		const detail = formatErrorMessage(error);
		log.warn(`[channels] failed to load bundled channel setup secrets ${id}: ${detail}`);
		cacheContext.lazySetupSecretsById.set(id, null);
		return;
	}
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
function listBundledChannelLegacySessionSurfaces(options = {}) {
	const { rootScope, cacheContext } = resolveActiveBundledChannelCacheScope();
	return listBundledChannelPluginIdsForSetupFeature(rootScope, "legacySessionSurfaces", { config: options.config }).flatMap((id) => {
		const setupEntry = getLazyGeneratedBundledChannelSetupEntryForRoot(id, rootScope, cacheContext);
		const surface = setupEntry?.loadLegacySessionSurface?.({ installRuntimeDeps: false });
		if (surface) return [surface];
		if (!hasSetupEntryFeature(setupEntry, "legacySessionSurfaces")) return [];
		const plugin = getBundledChannelSetupPluginForRoot(id, rootScope, cacheContext);
		return plugin?.messaging ? [plugin.messaging] : [];
	});
}
function listBundledChannelLegacyStateMigrationDetectors(options = {}) {
	const { rootScope, cacheContext } = resolveActiveBundledChannelCacheScope();
	return listBundledChannelPluginIdsForSetupFeature(rootScope, "legacyStateMigrations", { config: options.config }).flatMap((id) => {
		const setupEntry = getLazyGeneratedBundledChannelSetupEntryForRoot(id, rootScope, cacheContext);
		const detector = setupEntry?.loadLegacyStateMigrationDetector?.({ installRuntimeDeps: false });
		if (detector) return [detector];
		if (!hasSetupEntryFeature(setupEntry, "legacyStateMigrations")) return [];
		const plugin = getBundledChannelSetupPluginForRoot(id, rootScope, cacheContext);
		return plugin?.lifecycle?.detectLegacyStateMigrations ? [plugin.lifecycle.detectLegacyStateMigrations] : [];
	});
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
function setBundledChannelRuntime(id, runtime) {
	const { rootScope, cacheContext } = resolveActiveBundledChannelCacheScope();
	const setter = getLazyGeneratedBundledChannelEntryForRoot(id, rootScope, cacheContext)?.entry.setChannelRuntime;
	if (!setter) throw new Error(`missing bundled channel runtime setter: ${id}`);
	setter(runtime);
}
//#endregion
export { getBundledChannelSetupSecrets as a, listBundledChannelLegacyStateMigrationDetectors as c, listBundledChannelSetupPlugins as d, setBundledChannelRuntime as f, resolveBundledChannelRootScope as g, normalizeChannelMeta as h, getBundledChannelSetupPlugin as i, listBundledChannelPluginIds as l, resolveExistingPluginModulePath as m, getBundledChannelPlugin as n, hasBundledChannelPackageSetupFeature as o, loadChannelPluginModule as p, getBundledChannelSecrets as r, listBundledChannelLegacySessionSurfaces as s, getBundledChannelAccountInspector as t, listBundledChannelPlugins as u };
