import { t as loadPluginManifestRegistryForInstalledIndex } from "./manifest-registry-installed-B7YTYcgb.js";
import { v as loadPluginRegistrySnapshot } from "./plugin-registry-CZ8QXP5l.js";
import { n as withBundledPluginEnablementCompat, r as withBundledPluginVitestCompat, t as withBundledPluginAllowlistCompat } from "./bundled-compat-Cvu6moXL.js";
import { a as resolveRuntimePluginRegistry } from "./loader--FR-1ZCZ.js";
//#region src/plugins/manifest-contract-runtime.ts
const DEMAND_ONLY_CONTRACT_LOOKUP_OPTIONS = { preferPersisted: false };
function hasManifestContractValue(plugin, contract, value) {
	const values = plugin.contracts?.[contract] ?? [];
	return values.length > 0 && (!value || values.includes(value));
}
function resolveManifestContractRuntimePluginResolution(params) {
	const index = loadPluginRegistrySnapshot({
		config: params.cfg,
		env: process.env,
		...DEMAND_ONLY_CONTRACT_LOOKUP_OPTIONS
	});
	const allContractPlugins = loadPluginManifestRegistryForInstalledIndex({
		index,
		config: params.cfg,
		env: process.env,
		includeDisabled: true
	}).plugins.filter((plugin) => hasManifestContractValue(plugin, params.contract, params.value));
	const bundledCompatPluginIds = allContractPlugins.filter((plugin) => plugin.origin === "bundled").map((plugin) => plugin.id);
	const enabledPluginIds = new Set(index.plugins.filter((plugin) => plugin.enabled).map((plugin) => plugin.pluginId));
	const pluginIds = allContractPlugins.filter((plugin) => plugin.origin === "bundled" || enabledPluginIds.has(plugin.id)).map((plugin) => plugin.id);
	return {
		pluginIds: [...new Set(pluginIds)].toSorted((left, right) => left.localeCompare(right)),
		bundledCompatPluginIds: [...new Set(bundledCompatPluginIds)].toSorted((left, right) => left.localeCompare(right))
	};
}
//#endregion
//#region src/plugins/migration-provider-runtime.ts
function resolveMigrationProviderConfig(params) {
	return withBundledPluginVitestCompat({
		config: withBundledPluginEnablementCompat({
			config: withBundledPluginAllowlistCompat({
				config: params.cfg,
				pluginIds: params.bundledCompatPluginIds
			}),
			pluginIds: params.bundledCompatPluginIds
		}),
		pluginIds: params.bundledCompatPluginIds,
		env: process.env
	});
}
function findMigrationProviderById(entries, providerId) {
	return entries.find((entry) => entry.provider.id === providerId)?.provider;
}
function resolveMigrationProviderRegistry(params) {
	const compatConfig = resolveMigrationProviderConfig({
		cfg: params.cfg,
		bundledCompatPluginIds: params.bundledCompatPluginIds
	});
	return resolveRuntimePluginRegistry({
		...compatConfig === void 0 ? {} : { config: compatConfig },
		onlyPluginIds: params.pluginIds,
		activate: false
	});
}
function mergeMigrationProviders(left, right) {
	const merged = /* @__PURE__ */ new Map();
	for (const entry of [...left, ...right]) if (!merged.has(entry.provider.id)) merged.set(entry.provider.id, entry.provider);
	return [...merged.values()].toSorted((a, b) => a.id.localeCompare(b.id));
}
function resolvePluginMigrationProvider(params) {
	const activeProvider = findMigrationProviderById(resolveRuntimePluginRegistry()?.migrationProviders ?? [], params.providerId);
	if (activeProvider) return activeProvider;
	const resolution = resolveManifestContractRuntimePluginResolution({
		cfg: params.cfg,
		contract: "migrationProviders",
		value: params.providerId
	});
	const pluginIds = resolution.pluginIds;
	if (pluginIds.length === 0) return;
	return findMigrationProviderById(resolveMigrationProviderRegistry({
		cfg: params.cfg,
		pluginIds,
		bundledCompatPluginIds: resolution.bundledCompatPluginIds
	})?.migrationProviders ?? [], params.providerId);
}
function resolvePluginMigrationProviders(params = {}) {
	const activeProviders = resolveRuntimePluginRegistry()?.migrationProviders ?? [];
	const resolution = resolveManifestContractRuntimePluginResolution({
		cfg: params.cfg,
		contract: "migrationProviders"
	});
	const pluginIds = resolution.pluginIds;
	if (pluginIds.length === 0) return mergeMigrationProviders(activeProviders, []);
	return mergeMigrationProviders(activeProviders, resolveMigrationProviderRegistry({
		cfg: params.cfg,
		pluginIds,
		bundledCompatPluginIds: resolution.bundledCompatPluginIds
	})?.migrationProviders ?? []);
}
//#endregion
export { resolvePluginMigrationProviders as n, resolvePluginMigrationProvider as t };
