import { c as sortPluginProviders, l as sortPluginProvidersForAutoDetect, o as resolveBundledWebProviderResolutionConfig } from "./web-search-providers.shared-BiBdRUdb.js";
//#region src/plugins/web-fetch-providers.shared.ts
function sortWebFetchProviders(providers) {
	return sortPluginProviders(providers);
}
function sortWebFetchProvidersForAutoDetect(providers) {
	return sortPluginProvidersForAutoDetect(providers);
}
function resolveBundledWebFetchResolutionConfig(params) {
	return resolveBundledWebProviderResolutionConfig({
		contract: "webFetchProviders",
		config: params.config,
		workspaceDir: params.workspaceDir,
		env: params.env,
		bundledAllowlistCompat: params.bundledAllowlistCompat
	});
}
//#endregion
export { sortWebFetchProviders as n, sortWebFetchProvidersForAutoDetect as r, resolveBundledWebFetchResolutionConfig as t };
