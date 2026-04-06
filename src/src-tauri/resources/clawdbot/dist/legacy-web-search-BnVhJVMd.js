import { a as mergeMissing } from "./legacy.shared-CVRCIczI.js";
import { s as BUNDLED_WEB_SEARCH_PROVIDER_PLUGIN_IDS } from "./bundled-capability-metadata-D5qf8V45.js";
//#region src/config/legacy-web-search.ts
const MODERN_SCOPED_WEB_SEARCH_KEYS = new Set(["openaiCodex"]);
const NON_MIGRATED_LEGACY_WEB_SEARCH_PROVIDER_IDS = new Set(["tavily"]);
const LEGACY_WEB_SEARCH_PROVIDER_PLUGIN_IDS = Object.fromEntries(Object.entries(BUNDLED_WEB_SEARCH_PROVIDER_PLUGIN_IDS).filter(([providerId]) => !NON_MIGRATED_LEGACY_WEB_SEARCH_PROVIDER_IDS.has(providerId)));
const LEGACY_WEB_SEARCH_PROVIDER_IDS = Object.keys(LEGACY_WEB_SEARCH_PROVIDER_PLUGIN_IDS);
const LEGACY_WEB_SEARCH_PROVIDER_ID_SET = new Set(LEGACY_WEB_SEARCH_PROVIDER_IDS);
const LEGACY_GLOBAL_WEB_SEARCH_PROVIDER_ID = "brave";
function isRecord(value) {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}
function cloneRecord(value) {
	return { ...value };
}
function ensureRecord(target, key) {
	const current = target[key];
	if (isRecord(current)) return current;
	const next = {};
	target[key] = next;
	return next;
}
function resolveLegacySearchConfig(raw) {
	if (!isRecord(raw)) return;
	const tools = isRecord(raw.tools) ? raw.tools : void 0;
	const web = isRecord(tools?.web) ? tools.web : void 0;
	return isRecord(web?.search) ? web.search : void 0;
}
function copyLegacyProviderConfig(search, providerKey) {
	const current = search[providerKey];
	return isRecord(current) ? cloneRecord(current) : void 0;
}
function hasOwnKey(target, key) {
	return Object.prototype.hasOwnProperty.call(target, key);
}
function hasMappedLegacyWebSearchConfig(raw) {
	const search = resolveLegacySearchConfig(raw);
	if (!search) return false;
	if (hasOwnKey(search, "apiKey")) return true;
	return LEGACY_WEB_SEARCH_PROVIDER_IDS.some((providerId) => isRecord(search[providerId]));
}
function resolveLegacyGlobalWebSearchMigration(search) {
	const legacyProviderConfig = copyLegacyProviderConfig(search, LEGACY_GLOBAL_WEB_SEARCH_PROVIDER_ID);
	const payload = legacyProviderConfig ?? {};
	const hasLegacyApiKey = hasOwnKey(search, "apiKey");
	if (hasLegacyApiKey) payload.apiKey = search.apiKey;
	if (Object.keys(payload).length === 0) return null;
	const pluginId = LEGACY_WEB_SEARCH_PROVIDER_PLUGIN_IDS[LEGACY_GLOBAL_WEB_SEARCH_PROVIDER_ID] ?? LEGACY_GLOBAL_WEB_SEARCH_PROVIDER_ID;
	return {
		pluginId,
		payload,
		legacyPath: hasLegacyApiKey ? "tools.web.search.apiKey" : `tools.web.search.${LEGACY_GLOBAL_WEB_SEARCH_PROVIDER_ID}`,
		targetPath: hasLegacyApiKey && !legacyProviderConfig ? `plugins.entries.${pluginId}.config.webSearch.apiKey` : `plugins.entries.${pluginId}.config.webSearch`
	};
}
function migratePluginWebSearchConfig(params) {
	const entry = ensureRecord(ensureRecord(ensureRecord(params.root, "plugins"), "entries"), params.pluginId);
	const config = ensureRecord(entry, "config");
	const hadEnabled = entry.enabled !== void 0;
	const existing = isRecord(config.webSearch) ? cloneRecord(config.webSearch) : void 0;
	if (!hadEnabled) entry.enabled = true;
	if (!existing) {
		config.webSearch = cloneRecord(params.payload);
		params.changes.push(`Moved ${params.legacyPath} → ${params.targetPath}.`);
		return;
	}
	const merged = cloneRecord(existing);
	mergeMissing(merged, params.payload);
	const changed = JSON.stringify(merged) !== JSON.stringify(existing) || !hadEnabled;
	config.webSearch = merged;
	if (changed) {
		params.changes.push(`Merged ${params.legacyPath} → ${params.targetPath} (filled missing fields from legacy; kept explicit plugin config values).`);
		return;
	}
	params.changes.push(`Removed ${params.legacyPath} (${params.targetPath} already set).`);
}
function migrateLegacyWebSearchConfig(raw) {
	if (!isRecord(raw)) return {
		config: raw,
		changes: []
	};
	if (!hasMappedLegacyWebSearchConfig(raw)) return {
		config: raw,
		changes: []
	};
	return normalizeLegacyWebSearchConfigRecord(raw);
}
function normalizeLegacyWebSearchConfigRecord(raw) {
	const nextRoot = cloneRecord(raw);
	const web = ensureRecord(ensureRecord(nextRoot, "tools"), "web");
	const search = resolveLegacySearchConfig(nextRoot);
	if (!search) return {
		config: raw,
		changes: []
	};
	const nextSearch = {};
	const changes = [];
	for (const [key, value] of Object.entries(search)) {
		if (key === "apiKey") continue;
		if (LEGACY_WEB_SEARCH_PROVIDER_ID_SET.has(key) && isRecord(value)) continue;
		if (MODERN_SCOPED_WEB_SEARCH_KEYS.has(key) || !isRecord(value)) nextSearch[key] = value;
	}
	web.search = nextSearch;
	const globalSearchMigration = resolveLegacyGlobalWebSearchMigration(search);
	if (globalSearchMigration) migratePluginWebSearchConfig({
		root: nextRoot,
		legacyPath: globalSearchMigration.legacyPath,
		targetPath: globalSearchMigration.targetPath,
		pluginId: globalSearchMigration.pluginId,
		payload: globalSearchMigration.payload,
		changes
	});
	for (const providerId of LEGACY_WEB_SEARCH_PROVIDER_IDS) {
		if (providerId === LEGACY_GLOBAL_WEB_SEARCH_PROVIDER_ID) continue;
		const scoped = copyLegacyProviderConfig(search, providerId);
		if (!scoped || Object.keys(scoped).length === 0) continue;
		const pluginId = LEGACY_WEB_SEARCH_PROVIDER_PLUGIN_IDS[providerId];
		if (!pluginId) continue;
		migratePluginWebSearchConfig({
			root: nextRoot,
			legacyPath: `tools.web.search.${providerId}`,
			targetPath: `plugins.entries.${pluginId}.config.webSearch`,
			pluginId,
			payload: scoped,
			changes
		});
	}
	return {
		config: nextRoot,
		changes
	};
}
function resolvePluginWebSearchConfig(config, pluginId) {
	const pluginConfig = config?.plugins?.entries?.[pluginId]?.config;
	if (!isRecord(pluginConfig)) return;
	const webSearch = pluginConfig.webSearch;
	return isRecord(webSearch) ? webSearch : void 0;
}
//#endregion
export { resolvePluginWebSearchConfig as n, migrateLegacyWebSearchConfig as t };
