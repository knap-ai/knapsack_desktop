import { a as sortWebFetchProviders, c as mapRegistryProviders, i as resolveBundledWebFetchResolutionConfig, l as resolveManifestDeclaredWebProviderCandidatePluginIds } from "./web-search-providers.shared-BVsGv7JI.js";
import { t as resolveBundledWebFetchProvidersFromPublicArtifacts } from "./web-provider-public-artifacts-DYo3agJo.js";
import { n as resolvePluginWebProviders, t as createWebProviderSnapshotCache } from "./web-provider-runtime-shared-p1TR3lYT.js";
//#region src/plugins/web-fetch-providers.runtime.ts
let webFetchProviderSnapshotCache = createWebProviderSnapshotCache();
function resolveWebFetchCandidatePluginIds(params) {
	return resolveManifestDeclaredWebProviderCandidatePluginIds({
		contract: "webFetchProviders",
		configKey: "webFetch",
		config: params.config,
		workspaceDir: params.workspaceDir,
		env: params.env,
		onlyPluginIds: params.onlyPluginIds,
		origin: params.origin
	});
}
function mapRegistryWebFetchProviders(params) {
	return mapRegistryProviders({
		entries: params.registry.webFetchProviders,
		onlyPluginIds: params.onlyPluginIds,
		sortProviders: sortWebFetchProviders
	});
}
function resolvePluginWebFetchProviders(params) {
	return resolvePluginWebProviders(params, {
		snapshotCache: webFetchProviderSnapshotCache,
		resolveBundledResolutionConfig: resolveBundledWebFetchResolutionConfig,
		resolveCandidatePluginIds: resolveWebFetchCandidatePluginIds,
		mapRegistryProviders: mapRegistryWebFetchProviders,
		resolveBundledPublicArtifactProviders: resolveBundledWebFetchProvidersFromPublicArtifacts
	});
}
//#endregion
export { resolvePluginWebFetchProviders as t };
