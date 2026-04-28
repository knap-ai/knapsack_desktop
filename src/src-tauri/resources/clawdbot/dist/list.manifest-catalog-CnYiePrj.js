import { d as normalizeModelCatalogProviderId, s as planManifestModelCatalogRows } from "./manifest-DkU_xlZi.js";
import { t as loadPluginManifestRegistryForInstalledIndex } from "./manifest-registry-installed-B7YTYcgb.js";
import { g as isPluginEnabled, l as resolvePluginContributionOwners, m as getPluginRecord, v as loadPluginRegistrySnapshot } from "./plugin-registry-CZ8QXP5l.js";
//#region src/commands/models/list.manifest-catalog.ts
function loadStaticManifestCatalogRowsForPluginIds(params) {
	if (params.pluginIds.length === 0) return [];
	const plan = planManifestModelCatalogRows({
		registry: loadPluginManifestRegistryForInstalledIndex({
			index: params.index,
			config: params.cfg,
			env: params.env,
			pluginIds: params.pluginIds
		}),
		providerFilter: params.providerFilter
	});
	const staticProviders = new Set(plan.entries.filter((entry) => entry.discovery === "static").map((entry) => entry.provider));
	if (staticProviders.size === 0) return [];
	return plan.rows.filter((row) => staticProviders.has(row.provider));
}
function resolveConventionModelCatalogPluginIds(params) {
	const record = getPluginRecord({
		index: params.index,
		pluginId: params.providerFilter
	});
	if (!record || !isPluginEnabled({
		index: params.index,
		pluginId: record.pluginId,
		config: params.cfg
	})) return [];
	return [record.pluginId];
}
function resolveDeclaredModelCatalogPluginIds(params) {
	return resolvePluginContributionOwners({
		index: params.index,
		config: params.cfg,
		contribution: "modelCatalogProviders",
		matches: params.providerFilter
	});
}
function loadStaticManifestCatalogRowsForList(params) {
	const providerFilter = normalizeModelCatalogProviderId(params.providerFilter);
	if (!providerFilter) return [];
	const index = loadPluginRegistrySnapshot({
		config: params.cfg,
		env: params.env
	});
	const conventionRows = loadStaticManifestCatalogRowsForPluginIds({
		cfg: params.cfg,
		env: params.env,
		index,
		pluginIds: resolveConventionModelCatalogPluginIds({
			cfg: params.cfg,
			index,
			providerFilter
		}),
		providerFilter
	});
	if (conventionRows.length > 0) return conventionRows;
	return loadStaticManifestCatalogRowsForPluginIds({
		cfg: params.cfg,
		env: params.env,
		index,
		pluginIds: resolveDeclaredModelCatalogPluginIds({
			cfg: params.cfg,
			index,
			providerFilter
		}),
		providerFilter
	});
}
//#endregion
export { loadStaticManifestCatalogRowsForList };
