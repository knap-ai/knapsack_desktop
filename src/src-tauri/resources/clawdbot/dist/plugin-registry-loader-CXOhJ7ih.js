import { g as loggingState } from "./logger-D8OnBgBc.js";
//#region src/cli/plugin-registry-loader.ts
let pluginRegistryModulePromise;
function loadPluginRegistryModule() {
	pluginRegistryModulePromise ??= import("./plugin-registry-CdJYOnVJ.js");
	return pluginRegistryModulePromise;
}
function resolvePluginRegistryScopeForCommandPath(commandPath) {
	return commandPath[0] === "status" || commandPath[0] === "health" ? "channels" : "all";
}
async function ensureCliPluginRegistryLoaded(params) {
	const { ensurePluginRegistryLoaded } = await loadPluginRegistryModule();
	const previousForceStderr = loggingState.forceConsoleToStderr;
	if (params.routeLogsToStderr) loggingState.forceConsoleToStderr = true;
	try {
		ensurePluginRegistryLoaded({
			scope: params.scope,
			...params.config ? { config: params.config } : {},
			...params.activationSourceConfig ? { activationSourceConfig: params.activationSourceConfig } : {}
		});
	} finally {
		loggingState.forceConsoleToStderr = previousForceStderr;
	}
}
//#endregion
export { resolvePluginRegistryScopeForCommandPath as n, ensureCliPluginRegistryLoaded as t };
