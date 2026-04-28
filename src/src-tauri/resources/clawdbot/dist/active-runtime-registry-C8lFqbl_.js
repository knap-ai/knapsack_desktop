import { createRequire } from "node:module";
//#region src/plugins/active-runtime-registry.ts
const require = createRequire(import.meta.url);
const RUNTIME_MODULE_CANDIDATES = ["./runtime.js", "./runtime.ts"];
let pluginRuntimeModule;
function loadPluginRuntime() {
	if (pluginRuntimeModule) return pluginRuntimeModule;
	for (const candidate of RUNTIME_MODULE_CANDIDATES) try {
		pluginRuntimeModule = require(candidate);
		return pluginRuntimeModule;
	} catch {}
	return null;
}
function getActiveRuntimePluginRegistry() {
	return loadPluginRuntime()?.getActivePluginRegistry() ?? null;
}
//#endregion
export { getActiveRuntimePluginRegistry as t };
