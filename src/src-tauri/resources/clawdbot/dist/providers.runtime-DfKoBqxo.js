import { t as createSubsystemLogger } from "./subsystem-CJEvHE2o.js";
import { n as withBundledPluginEnablementCompat, t as withBundledPluginAllowlistCompat } from "./bundled-compat-Qt2_tpRE.js";
import { t as applyPluginAutoEnable } from "./plugin-auto-enable-CqpAn9Qh.js";
import { a as withBundledProviderVitestCompat, r as resolveEnabledProviderPluginIds, t as resolveBundledProviderCompatPluginIds } from "./providers-4eDlTtuF.js";
import { n as loadOpenClawPlugins } from "./loader-BkOjign1.js";
import { t as createPluginLoaderLogger } from "./logger-D1mGp2bM.js";
//#region src/plugins/providers.runtime.ts
const log = createSubsystemLogger("plugins");
function resolvePluginProviders(params) {
	const env = params.env ?? process.env;
	const autoEnabled = params.config !== void 0 ? applyPluginAutoEnable({
		config: params.config,
		env
	}) : void 0;
	const autoEnabledConfig = autoEnabled?.config;
	const bundledProviderCompatPluginIds = params.bundledProviderAllowlistCompat || params.bundledProviderVitestCompat ? resolveBundledProviderCompatPluginIds({
		config: autoEnabledConfig,
		workspaceDir: params.workspaceDir,
		env,
		onlyPluginIds: params.onlyPluginIds
	}) : [];
	const maybeAllowlistCompat = params.bundledProviderAllowlistCompat ? withBundledPluginAllowlistCompat({
		config: autoEnabledConfig,
		pluginIds: bundledProviderCompatPluginIds
	}) : autoEnabledConfig;
	const allowlistCompatConfig = params.bundledProviderAllowlistCompat ? withBundledPluginEnablementCompat({
		config: maybeAllowlistCompat,
		pluginIds: bundledProviderCompatPluginIds
	}) : maybeAllowlistCompat;
	const config = params.bundledProviderVitestCompat ? withBundledProviderVitestCompat({
		config: allowlistCompatConfig,
		pluginIds: bundledProviderCompatPluginIds,
		env
	}) : allowlistCompatConfig;
	const providerPluginIds = resolveEnabledProviderPluginIds({
		config,
		workspaceDir: params.workspaceDir,
		env,
		onlyPluginIds: params.onlyPluginIds
	});
	return loadOpenClawPlugins({
		config,
		activationSourceConfig: params.config,
		autoEnabledReasons: autoEnabled?.autoEnabledReasons,
		workspaceDir: params.workspaceDir,
		env,
		onlyPluginIds: providerPluginIds,
		pluginSdkResolution: params.pluginSdkResolution,
		cache: params.cache ?? false,
		activate: params.activate ?? false,
		logger: createPluginLoaderLogger(log)
	}).providers.map((entry) => ({
		...entry.provider,
		pluginId: entry.pluginId
	}));
}
//#endregion
export { resolvePluginProviders as t };
