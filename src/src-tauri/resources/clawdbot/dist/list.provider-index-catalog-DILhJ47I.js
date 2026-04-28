import { d as normalizeModelCatalogProviderId, l as loadOpenClawProviderIndex, o as planProviderIndexModelCatalogRows } from "./manifest-DkU_xlZi.js";
import { o as normalizePluginsConfig, s as resolveEffectiveEnableState } from "./config-state-Bw_lAn0M.js";
//#region src/commands/models/list.provider-index-catalog.ts
function loadProviderIndexCatalogRowsForList(params) {
	const providerFilter = normalizeModelCatalogProviderId(params.providerFilter);
	if (!providerFilter) return [];
	return planProviderIndexModelCatalogRows({
		index: loadOpenClawProviderIndex(),
		providerFilter
	}).entries.filter((entry) => resolveEffectiveEnableState({
		id: entry.pluginId,
		origin: "bundled",
		config: normalizePluginsConfig(params.cfg.plugins),
		rootConfig: params.cfg,
		enabledByDefault: true
	}).enabled).flatMap((entry) => entry.rows);
}
//#endregion
export { loadProviderIndexCatalogRowsForList };
