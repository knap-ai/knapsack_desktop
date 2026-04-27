import { a as hasExplicitPluginIdScope } from "./persisted-auth-state-DdqnHcUm.js";
import { d as resolveEnabledProviderPluginIds, g as withBundledProviderVitestCompat, h as resolveOwningPluginIdsForProvider, l as resolveDiscoverableProviderOwnerPluginIds, m as resolveOwningPluginIdsForModelRefs, o as resolveActivatableProviderOwnerPluginIds, s as resolveBundledProviderCompatPluginIds, u as resolveDiscoveredProviderPluginIds } from "./plugin-auto-enable-BKDUQLPR.js";
import { r as withActivatedPluginIds, t as resolveBundledPluginCompatibleActivationInputs } from "./activation-context-CaCkOLoa.js";
import { t as resolveManifestActivationPluginIds } from "./activation-planner-BpVQ6KIv.js";
import { a as resolveRuntimePluginRegistry, r as loadOpenClawPlugins, t as isPluginRegistryLoadInFlight } from "./loader-NucjcOgv.js";
import { c as getActivePluginRegistryWorkspaceDir } from "./runtime-BFywV6BM.js";
import { n as buildPluginRuntimeLoadOptionsFromValues, r as createPluginRuntimeLoaderLogger } from "./load-context-D240_UuB.js";
//#region src/plugins/providers.runtime.ts
function dedupeSortedPluginIds(values) {
	return [...new Set(values)].toSorted((left, right) => left.localeCompare(right));
}
function resolveExplicitProviderOwnerPluginIds(params) {
	return dedupeSortedPluginIds(params.providerRefs.flatMap((provider) => {
		const plannedPluginIds = resolveManifestActivationPluginIds({
			trigger: {
				kind: "provider",
				provider
			},
			config: params.config,
			workspaceDir: params.workspaceDir,
			env: params.env
		});
		if (plannedPluginIds.length > 0) return plannedPluginIds;
		return resolveOwningPluginIdsForProvider({
			provider,
			config: params.config,
			workspaceDir: params.workspaceDir,
			env: params.env
		}) ?? [];
	}));
}
function mergeExplicitOwnerPluginIds(providerPluginIds, explicitOwnerPluginIds) {
	if (explicitOwnerPluginIds.length === 0) return [...providerPluginIds];
	return dedupeSortedPluginIds([...providerPluginIds, ...explicitOwnerPluginIds]);
}
function resolvePluginProviderLoadBase(params) {
	const env = params.env ?? process.env;
	const workspaceDir = params.workspaceDir ?? getActivePluginRegistryWorkspaceDir();
	const providerOwnedPluginIds = params.providerRefs?.length ? resolveExplicitProviderOwnerPluginIds({
		providerRefs: params.providerRefs,
		config: params.config,
		workspaceDir,
		env
	}) : [];
	const modelOwnedPluginIds = params.modelRefs?.length ? resolveOwningPluginIdsForModelRefs({
		models: params.modelRefs,
		config: params.config,
		workspaceDir,
		env
	}) : [];
	return {
		env,
		workspaceDir,
		requestedPluginIds: hasExplicitPluginIdScope(params.onlyPluginIds) || params.providerRefs?.length || params.modelRefs?.length || providerOwnedPluginIds.length > 0 || modelOwnedPluginIds.length > 0 ? [...new Set([
			...params.onlyPluginIds ?? [],
			...providerOwnedPluginIds,
			...modelOwnedPluginIds
		])].toSorted((left, right) => left.localeCompare(right)) : void 0,
		explicitOwnerPluginIds: dedupeSortedPluginIds([...providerOwnedPluginIds, ...modelOwnedPluginIds]),
		rawConfig: params.config
	};
}
function resolveSetupProviderPluginLoadState(params, base) {
	const setupPluginIds = mergeExplicitOwnerPluginIds(resolveDiscoveredProviderPluginIds({
		config: params.config,
		workspaceDir: base.workspaceDir,
		env: base.env,
		onlyPluginIds: base.requestedPluginIds,
		includeUntrustedWorkspacePlugins: params.includeUntrustedWorkspacePlugins
	}), resolveDiscoverableProviderOwnerPluginIds({
		pluginIds: base.explicitOwnerPluginIds,
		config: params.config,
		workspaceDir: base.workspaceDir,
		env: base.env,
		includeUntrustedWorkspacePlugins: params.includeUntrustedWorkspacePlugins
	}));
	if (setupPluginIds.length === 0) return;
	const setupConfig = withActivatedPluginIds({
		config: base.rawConfig,
		pluginIds: setupPluginIds
	});
	return { loadOptions: buildPluginRuntimeLoadOptionsFromValues({
		config: setupConfig,
		activationSourceConfig: setupConfig,
		autoEnabledReasons: {},
		workspaceDir: base.workspaceDir,
		env: base.env,
		logger: createPluginRuntimeLoaderLogger()
	}, {
		onlyPluginIds: setupPluginIds,
		pluginSdkResolution: params.pluginSdkResolution,
		cache: params.cache ?? false,
		activate: params.activate ?? false
	}) };
}
function resolveRuntimeProviderPluginLoadState(params, base) {
	const explicitOwnerPluginIds = resolveActivatableProviderOwnerPluginIds({
		pluginIds: base.explicitOwnerPluginIds,
		config: base.rawConfig,
		workspaceDir: base.workspaceDir,
		env: base.env,
		includeUntrustedWorkspacePlugins: params.includeUntrustedWorkspacePlugins
	});
	const runtimeRequestedPluginIds = base.requestedPluginIds !== void 0 ? dedupeSortedPluginIds([...params.onlyPluginIds ?? [], ...explicitOwnerPluginIds]) : void 0;
	const activation = resolveBundledPluginCompatibleActivationInputs({
		rawConfig: withActivatedPluginIds({
			config: base.rawConfig,
			pluginIds: explicitOwnerPluginIds
		}),
		env: base.env,
		workspaceDir: base.workspaceDir,
		onlyPluginIds: runtimeRequestedPluginIds,
		applyAutoEnable: true,
		compatMode: {
			allowlist: params.bundledProviderAllowlistCompat,
			enablement: "allowlist",
			vitest: params.bundledProviderVitestCompat
		},
		resolveCompatPluginIds: resolveBundledProviderCompatPluginIds
	});
	const config = params.bundledProviderVitestCompat ? withBundledProviderVitestCompat({
		config: activation.config,
		pluginIds: activation.compatPluginIds,
		env: base.env
	}) : activation.config;
	const providerPluginIds = mergeExplicitOwnerPluginIds(resolveEnabledProviderPluginIds({
		config,
		workspaceDir: base.workspaceDir,
		env: base.env,
		onlyPluginIds: runtimeRequestedPluginIds
	}), explicitOwnerPluginIds);
	return { loadOptions: buildPluginRuntimeLoadOptionsFromValues({
		config,
		activationSourceConfig: activation.activationSourceConfig,
		autoEnabledReasons: activation.autoEnabledReasons,
		workspaceDir: base.workspaceDir,
		env: base.env,
		logger: createPluginRuntimeLoaderLogger()
	}, {
		onlyPluginIds: providerPluginIds,
		pluginSdkResolution: params.pluginSdkResolution,
		cache: params.cache ?? true,
		activate: params.activate ?? false
	}) };
}
function isPluginProvidersLoadInFlight(params) {
	const base = resolvePluginProviderLoadBase(params);
	const loadState = params.mode === "setup" ? resolveSetupProviderPluginLoadState(params, base) : resolveRuntimeProviderPluginLoadState(params, base);
	if (!loadState) return false;
	return isPluginRegistryLoadInFlight(loadState.loadOptions);
}
function resolvePluginProviders(params) {
	const base = resolvePluginProviderLoadBase(params);
	if (params.mode === "setup") {
		const loadState = resolveSetupProviderPluginLoadState(params, base);
		if (!loadState) return [];
		return loadOpenClawPlugins(loadState.loadOptions).providers.map((entry) => Object.assign({}, entry.provider, { pluginId: entry.pluginId }));
	}
	const registry = resolveRuntimePluginRegistry(resolveRuntimeProviderPluginLoadState(params, base).loadOptions);
	if (!registry) return [];
	return registry.providers.map((entry) => Object.assign({}, entry.provider, { pluginId: entry.pluginId }));
}
//#endregion
export { resolvePluginProviders as n, isPluginProvidersLoadInFlight as t };
