import { r as resolveManifestContractPluginIds, t as loadPluginManifestRegistry } from "./manifest-registry-Bd3A4lqx.js";
import { a as normalizePluginIdScope, n as createPluginIdScopeSet, o as serializePluginIdScope } from "./channel-configured-BTEJAT4e.js";
import { n as resolveBundledPluginCompatibleLoadValues } from "./activation-context-elA3ysm4.js";
//#region src/plugins/web-provider-resolution-shared.ts
function comparePluginProvidersAlphabetically(left, right) {
	return left.id.localeCompare(right.id) || left.pluginId.localeCompare(right.pluginId);
}
function sortPluginProviders(providers) {
	return providers.toSorted(comparePluginProvidersAlphabetically);
}
function sortPluginProvidersForAutoDetect(providers) {
	return providers.toSorted((left, right) => {
		const leftOrder = left.autoDetectOrder ?? Number.MAX_SAFE_INTEGER;
		const rightOrder = right.autoDetectOrder ?? Number.MAX_SAFE_INTEGER;
		if (leftOrder !== rightOrder) return leftOrder - rightOrder;
		return comparePluginProvidersAlphabetically(left, right);
	});
}
function pluginManifestDeclaresProviderConfig(record, configKey, contract) {
	if ((record.contracts?.[contract]?.length ?? 0) > 0) return true;
	if (Object.keys(record.configUiHints ?? {}).some((key) => key === configKey || key.startsWith(`${configKey}.`))) return true;
	const properties = record.configSchema?.properties;
	return typeof properties === "object" && properties !== null && configKey in properties;
}
function resolveManifestDeclaredWebProviderCandidatePluginIds(params) {
	const scopedPluginIds = normalizePluginIdScope(params.onlyPluginIds);
	const onlyPluginIdSet = createPluginIdScopeSet(scopedPluginIds);
	const ids = loadPluginManifestRegistry({
		config: params.config,
		workspaceDir: params.workspaceDir,
		env: params.env
	}).plugins.filter((plugin) => (!params.origin || plugin.origin === params.origin) && (!onlyPluginIdSet || onlyPluginIdSet.has(plugin.id)) && pluginManifestDeclaresProviderConfig(plugin, params.configKey, params.contract)).map((plugin) => plugin.id).toSorted((left, right) => left.localeCompare(right));
	if (ids.length > 0) return ids;
	return scopedPluginIds?.length === 0 ? [] : void 0;
}
function resolveBundledWebProviderCompatPluginIds(params) {
	return resolveManifestContractPluginIds({
		contract: params.contract,
		origin: "bundled",
		config: params.config,
		workspaceDir: params.workspaceDir,
		env: params.env
	});
}
function resolveBundledWebProviderResolutionConfig(params) {
	const activation = resolveBundledPluginCompatibleLoadValues({
		rawConfig: params.config,
		env: params.env,
		workspaceDir: params.workspaceDir,
		applyAutoEnable: true,
		compatMode: {
			allowlist: params.bundledAllowlistCompat,
			enablement: "always",
			vitest: true
		},
		resolveCompatPluginIds: (compatParams) => resolveBundledWebProviderCompatPluginIds({
			contract: params.contract,
			...compatParams
		})
	});
	return {
		config: activation.config,
		activationSourceConfig: activation.activationSourceConfig,
		autoEnabledReasons: activation.autoEnabledReasons
	};
}
function buildWebProviderSnapshotCacheKey(params) {
	const envKey = typeof params.envKey === "string" ? params.envKey : Object.entries(params.envKey).toSorted(([left], [right]) => left.localeCompare(right));
	const onlyPluginIds = normalizePluginIdScope(params.onlyPluginIds);
	return JSON.stringify({
		workspaceDir: params.workspaceDir ?? "",
		bundledAllowlistCompat: params.bundledAllowlistCompat === true,
		origin: params.origin ?? "",
		onlyPluginIds: serializePluginIdScope(onlyPluginIds),
		env: envKey
	});
}
function mapRegistryProviders(params) {
	const onlyPluginIdSet = createPluginIdScopeSet(normalizePluginIdScope(params.onlyPluginIds));
	return params.sortProviders(params.entries.filter((entry) => !onlyPluginIdSet || onlyPluginIdSet.has(entry.pluginId)).map((entry) => ({
		...entry.provider,
		pluginId: entry.pluginId
	})));
}
//#endregion
//#region src/plugins/web-search-providers.shared.ts
function sortWebSearchProviders(providers) {
	return sortPluginProviders(providers);
}
function sortWebSearchProvidersForAutoDetect(providers) {
	return sortPluginProvidersForAutoDetect(providers);
}
function resolveBundledWebSearchResolutionConfig(params) {
	return resolveBundledWebProviderResolutionConfig({
		contract: "webSearchProviders",
		config: params.config,
		workspaceDir: params.workspaceDir,
		env: params.env,
		bundledAllowlistCompat: params.bundledAllowlistCompat
	});
}
//#endregion
export { mapRegistryProviders as a, sortPluginProviders as c, buildWebProviderSnapshotCacheKey as i, sortPluginProvidersForAutoDetect as l, sortWebSearchProviders as n, resolveBundledWebProviderResolutionConfig as o, sortWebSearchProvidersForAutoDetect as r, resolveManifestDeclaredWebProviderCandidatePluginIds as s, resolveBundledWebSearchResolutionConfig as t };
