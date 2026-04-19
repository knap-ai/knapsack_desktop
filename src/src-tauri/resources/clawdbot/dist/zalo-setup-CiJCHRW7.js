import { i as loadBundledPluginPublicSurfaceModuleSync, n as createLazyFacadeObjectValue } from "./facade-loader-CGu7k8Om.js";
//#region src/plugin-sdk/zalo-setup.ts
function loadFacadeModule() {
	return loadBundledPluginPublicSurfaceModuleSync({
		dirName: "zalo",
		artifactBasename: "setup-api.js"
	});
}
const evaluateZaloGroupAccess = ((...args) => loadFacadeModule()["evaluateZaloGroupAccess"](...args));
const resolveZaloRuntimeGroupPolicy = ((...args) => loadFacadeModule()["resolveZaloRuntimeGroupPolicy"](...args));
const zaloSetupAdapter = createLazyFacadeObjectValue(() => loadFacadeModule()["zaloSetupAdapter"]);
const zaloSetupWizard = createLazyFacadeObjectValue(() => loadFacadeModule()["zaloSetupWizard"]);
//#endregion
export { zaloSetupWizard as i, resolveZaloRuntimeGroupPolicy as n, zaloSetupAdapter as r, evaluateZaloGroupAccess as t };
