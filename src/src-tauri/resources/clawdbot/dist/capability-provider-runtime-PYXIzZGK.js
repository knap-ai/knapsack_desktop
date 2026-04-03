import { n as withBundledPluginEnablementCompat, r as withBundledPluginVitestCompat, t as withBundledPluginAllowlistCompat } from "./bundled-compat-Qt2_tpRE.js";
import { n as loadPluginManifestRegistry } from "./manifest-registry-BSmqODu2.js";
import { r as resolveRuntimePluginRegistry } from "./loader-BkOjign1.js";
//#region src/plugins/capability-provider-runtime.ts
const CAPABILITY_CONTRACT_KEY = {
	speechProviders: "speechProviders",
	mediaUnderstandingProviders: "mediaUnderstandingProviders",
	imageGenerationProviders: "imageGenerationProviders"
};
function resolveBundledCapabilityCompatPluginIds(params) {
	const contractKey = CAPABILITY_CONTRACT_KEY[params.key];
	return loadPluginManifestRegistry({
		config: params.cfg,
		env: process.env
	}).plugins.filter((plugin) => plugin.origin === "bundled" && (plugin.contracts?.[contractKey]?.length ?? 0) > 0).map((plugin) => plugin.id).toSorted((left, right) => left.localeCompare(right));
}
function resolveCapabilityProviderConfig(params) {
	const pluginIds = resolveBundledCapabilityCompatPluginIds(params);
	return withBundledPluginVitestCompat({
		config: withBundledPluginEnablementCompat({
			config: withBundledPluginAllowlistCompat({
				config: params.cfg,
				pluginIds
			}),
			pluginIds
		}),
		pluginIds,
		env: process.env
	});
}
function resolvePluginCapabilityProviders(params) {
	const activeProviders = resolveRuntimePluginRegistry()?.[params.key] ?? [];
	if (activeProviders.length > 0) return activeProviders.map((entry) => entry.provider);
	return (resolveRuntimePluginRegistry(params.cfg === void 0 ? void 0 : { config: resolveCapabilityProviderConfig({
		key: params.key,
		cfg: params.cfg
	}) })?.[params.key] ?? []).map((entry) => entry.provider);
}
//#endregion
export { resolvePluginCapabilityProviders as t };
