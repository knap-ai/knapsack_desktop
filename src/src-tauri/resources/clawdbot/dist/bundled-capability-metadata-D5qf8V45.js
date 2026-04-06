import { s as listBundledPluginMetadata } from "./chat-meta-Cdrnv7R-.js";
//#region src/plugins/bundled-capability-metadata.ts
function uniqueStrings(values) {
	const result = [];
	const seen = /* @__PURE__ */ new Set();
	for (const value of values ?? []) {
		const normalized = value.trim();
		if (!normalized || seen.has(normalized)) continue;
		seen.add(normalized);
		result.push(normalized);
	}
	return result;
}
const BUNDLED_PLUGIN_CONTRACT_SNAPSHOTS = listBundledPluginMetadata().map(({ manifest }) => ({
	pluginId: manifest.id,
	cliBackendIds: uniqueStrings(manifest.cliBackends),
	providerIds: uniqueStrings(manifest.providers),
	speechProviderIds: uniqueStrings(manifest.contracts?.speechProviders),
	mediaUnderstandingProviderIds: uniqueStrings(manifest.contracts?.mediaUnderstandingProviders),
	imageGenerationProviderIds: uniqueStrings(manifest.contracts?.imageGenerationProviders),
	webFetchProviderIds: uniqueStrings(manifest.contracts?.webFetchProviders),
	webSearchProviderIds: uniqueStrings(manifest.contracts?.webSearchProviders),
	toolNames: uniqueStrings(manifest.contracts?.tools)
})).filter((entry) => entry.cliBackendIds.length > 0 || entry.providerIds.length > 0 || entry.speechProviderIds.length > 0 || entry.mediaUnderstandingProviderIds.length > 0 || entry.imageGenerationProviderIds.length > 0 || entry.webFetchProviderIds.length > 0 || entry.webSearchProviderIds.length > 0 || entry.toolNames.length > 0).toSorted((left, right) => left.pluginId.localeCompare(right.pluginId));
function collectPluginIds(pick) {
	return BUNDLED_PLUGIN_CONTRACT_SNAPSHOTS.filter((entry) => pick(entry).length > 0).map((entry) => entry.pluginId).toSorted((left, right) => left.localeCompare(right));
}
collectPluginIds((entry) => entry.providerIds);
collectPluginIds((entry) => entry.speechProviderIds);
collectPluginIds((entry) => entry.mediaUnderstandingProviderIds);
collectPluginIds((entry) => entry.imageGenerationProviderIds);
const BUNDLED_WEB_FETCH_PLUGIN_IDS = collectPluginIds((entry) => entry.webFetchProviderIds);
[...new Set(BUNDLED_PLUGIN_CONTRACT_SNAPSHOTS.filter((entry) => entry.providerIds.length > 0 || entry.speechProviderIds.length > 0 || entry.mediaUnderstandingProviderIds.length > 0 || entry.imageGenerationProviderIds.length > 0 || entry.webFetchProviderIds.length > 0 || entry.webSearchProviderIds.length > 0).map((entry) => entry.pluginId))].toSorted((left, right) => left.localeCompare(right));
const BUNDLED_WEB_SEARCH_PLUGIN_IDS = collectPluginIds((entry) => entry.webSearchProviderIds);
const BUNDLED_WEB_SEARCH_PROVIDER_PLUGIN_IDS = Object.fromEntries(BUNDLED_PLUGIN_CONTRACT_SNAPSHOTS.flatMap((entry) => entry.webSearchProviderIds.map((providerId) => [providerId, entry.pluginId])).toSorted(([left], [right]) => left.localeCompare(right)));
const BUNDLED_PROVIDER_PLUGIN_ID_ALIASES = Object.fromEntries(BUNDLED_PLUGIN_CONTRACT_SNAPSHOTS.flatMap((entry) => entry.providerIds.filter((providerId) => providerId !== entry.pluginId).map((providerId) => [providerId, entry.pluginId])).toSorted(([left], [right]) => left.localeCompare(right)));
const BUNDLED_LEGACY_PLUGIN_ID_ALIASES = Object.fromEntries(listBundledPluginMetadata().flatMap(({ manifest }) => (manifest.legacyPluginIds ?? []).map((legacyPluginId) => [legacyPluginId, manifest.id])).toSorted(([left], [right]) => left.localeCompare(right)));
const BUNDLED_AUTO_ENABLE_PROVIDER_PLUGIN_IDS = Object.fromEntries(listBundledPluginMetadata().flatMap(({ manifest }) => (manifest.autoEnableWhenConfiguredProviders ?? []).map((providerId) => [providerId, manifest.id])).toSorted(([left], [right]) => left.localeCompare(right)));
//#endregion
export { BUNDLED_WEB_FETCH_PLUGIN_IDS as a, BUNDLED_PROVIDER_PLUGIN_ID_ALIASES as i, BUNDLED_LEGACY_PLUGIN_ID_ALIASES as n, BUNDLED_WEB_SEARCH_PLUGIN_IDS as o, BUNDLED_PLUGIN_CONTRACT_SNAPSHOTS as r, BUNDLED_WEB_SEARCH_PROVIDER_PLUGIN_IDS as s, BUNDLED_AUTO_ENABLE_PROVIDER_PLUGIN_IDS as t };
