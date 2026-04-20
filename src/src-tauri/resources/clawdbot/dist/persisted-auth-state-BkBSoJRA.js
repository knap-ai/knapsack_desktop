import { i as formatErrorMessage } from "./errors-D8p6rxH8.js";
import { s as normalizeOptionalString } from "./string-coerce-BUSzWgUA.js";
import { t as createSubsystemLogger } from "./subsystem-Cgmckbux.js";
import { a as listChannelCatalogEntries } from "./bootstrap-registry-BI6Zdzz5.js";
import { h as resolveExistingPluginModulePath, m as loadChannelPluginModule, p as isJavaScriptModulePath } from "./bundled-CGMeVzvo.js";
//#region src/channels/plugins/package-state-probes.ts
const log = createSubsystemLogger("channels");
const registryCache = /* @__PURE__ */ new Map();
function resolveChannelPackageStateMetadata(entry, metadataKey) {
	const metadata = entry.channel[metadataKey];
	if (!metadata || typeof metadata !== "object") return null;
	const specifier = normalizeOptionalString(metadata.specifier) ?? "";
	const exportName = normalizeOptionalString(metadata.exportName) ?? "";
	if (!specifier || !exportName) return null;
	return {
		specifier,
		exportName
	};
}
function getChannelPackageStateRegistry(metadataKey) {
	const cached = registryCache.get(metadataKey);
	if (cached) return cached;
	const catalog = listChannelCatalogEntries({ origin: "bundled" }).filter((entry) => Boolean(resolveChannelPackageStateMetadata(entry, metadataKey)));
	const registry = {
		catalog,
		entriesById: new Map(catalog.map((entry) => [entry.pluginId, entry])),
		checkerCache: /* @__PURE__ */ new Map()
	};
	registryCache.set(metadataKey, registry);
	return registry;
}
function resolveChannelPackageStateChecker(params) {
	const registry = getChannelPackageStateRegistry(params.metadataKey);
	const cached = registry.checkerCache.get(params.entry.pluginId);
	if (cached !== void 0) return cached;
	const metadata = resolveChannelPackageStateMetadata(params.entry, params.metadataKey);
	if (!metadata) {
		registry.checkerCache.set(params.entry.pluginId, null);
		return null;
	}
	try {
		const checker = loadChannelPluginModule({
			modulePath: resolveExistingPluginModulePath(params.entry.rootDir, metadata.specifier),
			rootDir: params.entry.rootDir,
			shouldTryNativeRequire: isJavaScriptModulePath
		})[metadata.exportName];
		if (typeof checker !== "function") throw new Error(`missing ${params.metadataKey} export ${metadata.exportName}`);
		registry.checkerCache.set(params.entry.pluginId, checker);
		return checker;
	} catch (error) {
		const detail = formatErrorMessage(error);
		log.warn(`[channels] failed to load ${params.metadataKey} checker for ${params.entry.pluginId}: ${detail}`);
		registry.checkerCache.set(params.entry.pluginId, null);
		return null;
	}
}
function listBundledChannelIdsForPackageState(metadataKey) {
	return getChannelPackageStateRegistry(metadataKey).catalog.map((entry) => entry.pluginId);
}
function hasBundledChannelPackageState(params) {
	const entry = getChannelPackageStateRegistry(params.metadataKey).entriesById.get(params.channelId);
	if (!entry) return false;
	const checker = resolveChannelPackageStateChecker({
		entry,
		metadataKey: params.metadataKey
	});
	return checker ? checker({
		cfg: params.cfg,
		env: params.env
	}) : false;
}
//#endregion
//#region src/channels/plugins/persisted-auth-state.ts
function listBundledChannelIdsWithPersistedAuthState() {
	return listBundledChannelIdsForPackageState("persistedAuthState");
}
function hasBundledChannelPersistedAuthState(params) {
	return hasBundledChannelPackageState({
		metadataKey: "persistedAuthState",
		channelId: params.channelId,
		cfg: params.cfg,
		env: params.env
	});
}
//#endregion
export { listBundledChannelIdsWithPersistedAuthState as n, hasBundledChannelPackageState as r, hasBundledChannelPersistedAuthState as t };
