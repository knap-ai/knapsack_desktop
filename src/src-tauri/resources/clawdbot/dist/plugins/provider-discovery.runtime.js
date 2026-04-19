import { t as getCachedPluginJitiLoader } from "../jiti-loader-cache-D_0TILck.js";
import { t as loadPluginManifestRegistry } from "../manifest-registry-Bd3A4lqx.js";
import { s as resolveDiscoveredProviderPluginIds } from "../plugin-auto-enable-BbVfCcz-.js";
import { n as resolvePluginProviders } from "../providers.runtime-Qry7Vql_.js";
//#region src/plugins/source-loader.ts
function shouldProfilePluginSourceLoader() {
	return process.env.OPENCLAW_PLUGIN_LOAD_PROFILE === "1";
}
function createPluginSourceLoader() {
	const loaders = /* @__PURE__ */ new Map();
	return (modulePath) => {
		const jiti = getCachedPluginJitiLoader({
			cache: loaders,
			modulePath,
			importerUrl: import.meta.url,
			jitiFilename: import.meta.url
		});
		if (!shouldProfilePluginSourceLoader()) return jiti(modulePath);
		const startMs = performance.now();
		try {
			return jiti(modulePath);
		} finally {
			console.error(`[plugin-load-profile] phase=source-loader plugin=(direct) elapsedMs=${(performance.now() - startMs).toFixed(1)} source=${modulePath}`);
		}
	};
}
//#endregion
//#region src/plugins/provider-discovery.runtime.ts
function normalizeDiscoveryModule(value) {
	const resolved = value && typeof value === "object" && "default" in value && value.default !== void 0 ? value.default : value;
	if (Array.isArray(resolved)) return resolved;
	if (resolved && typeof resolved === "object" && "id" in resolved) return [resolved];
	if (value && typeof value === "object" && !Array.isArray(value)) {
		const record = value;
		if (Array.isArray(record.providers)) return record.providers;
		if (record.provider) return [record.provider];
	}
	return [];
}
function resolveProviderDiscoveryEntryPlugins(params) {
	const pluginIds = resolveDiscoveredProviderPluginIds(params);
	const pluginIdSet = new Set(pluginIds);
	const records = loadPluginManifestRegistry(params).plugins.filter((plugin) => plugin.providerDiscoverySource && pluginIdSet.has(plugin.id));
	if (records.length === 0) return [];
	const loadSource = createPluginSourceLoader();
	const providers = [];
	for (const manifest of records) try {
		const moduleExport = loadSource(manifest.providerDiscoverySource);
		providers.push(...normalizeDiscoveryModule(moduleExport).map((provider) => ({
			...provider,
			pluginId: manifest.id
		})));
	} catch {
		return [];
	}
	return providers;
}
function resolvePluginDiscoveryProvidersRuntime(params) {
	const entryProviders = resolveProviderDiscoveryEntryPlugins(params);
	if (entryProviders.length > 0) return entryProviders;
	return resolvePluginProviders({
		...params,
		bundledProviderAllowlistCompat: true
	});
}
//#endregion
export { resolvePluginDiscoveryProvidersRuntime };
