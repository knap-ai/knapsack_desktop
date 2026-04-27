import { c as mapRegistryProviders, l as resolveManifestDeclaredWebProviderCandidatePluginIds, n as sortWebSearchProviders, t as resolveBundledWebSearchResolutionConfig } from "./web-search-providers.shared-BVsGv7JI.js";
import { n as resolveBundledWebSearchProvidersFromPublicArtifacts } from "./web-provider-public-artifacts-DYo3agJo.js";
import { n as resolvePluginWebProviders, r as resolveRuntimeWebProviders, t as createWebProviderSnapshotCache } from "./web-provider-runtime-shared-p1TR3lYT.js";
//#region src/plugins/web-search-providers.runtime.ts
let webSearchProviderSnapshotCache = createWebProviderSnapshotCache();
function resolveWebSearchCandidatePluginIds(params) {
	return resolveManifestDeclaredWebProviderCandidatePluginIds({
		contract: "webSearchProviders",
		configKey: "webSearch",
		config: params.config,
		workspaceDir: params.workspaceDir,
		env: params.env,
		onlyPluginIds: params.onlyPluginIds,
		origin: params.origin
	});
}
function mapRegistryWebSearchProviders(params) {
	return mapRegistryProviders({
		entries: params.registry.webSearchProviders,
		onlyPluginIds: params.onlyPluginIds,
		sortProviders: sortWebSearchProviders
	});
}
function resolvePluginWebSearchProviders(params) {
	return resolvePluginWebProviders(params, {
		snapshotCache: webSearchProviderSnapshotCache,
		resolveBundledResolutionConfig: resolveBundledWebSearchResolutionConfig,
		resolveCandidatePluginIds: resolveWebSearchCandidatePluginIds,
		mapRegistryProviders: mapRegistryWebSearchProviders,
		resolveBundledPublicArtifactProviders: resolveBundledWebSearchProvidersFromPublicArtifacts
	});
}
function resolveRuntimeWebSearchProviders(params) {
	return resolveRuntimeWebProviders(params, {
		snapshotCache: webSearchProviderSnapshotCache,
		resolveBundledResolutionConfig: resolveBundledWebSearchResolutionConfig,
		resolveCandidatePluginIds: resolveWebSearchCandidatePluginIds,
		mapRegistryProviders: mapRegistryWebSearchProviders
	});
}
//#endregion
export { resolveRuntimeWebSearchProviders as n, resolvePluginWebSearchProviders as t };
