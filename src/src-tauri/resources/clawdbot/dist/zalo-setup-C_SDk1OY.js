import { i as loadBundledPluginPublicSurfaceModuleSync, n as createLazyFacadeObjectValue } from "./facade-loader-BAtcmKGO.js";
//#region src/plugin-sdk/zalo-setup.ts
function loadSetupFacadeModule() {
	return loadBundledPluginPublicSurfaceModuleSync({
		dirName: "zalo",
		artifactBasename: "setup-api.js"
	});
}
function loadGroupAccessFacadeModule() {
	return loadBundledPluginPublicSurfaceModuleSync({
		dirName: "zalo",
		artifactBasename: "contract-api.js"
	});
}
const evaluateZaloGroupAccess = ((...args) => loadGroupAccessFacadeModule()["evaluateZaloGroupAccess"](...args));
const resolveZaloRuntimeGroupPolicy = ((...args) => loadGroupAccessFacadeModule()["resolveZaloRuntimeGroupPolicy"](...args));
const zaloSetupAdapter = createLazyFacadeObjectValue(() => loadSetupFacadeModule()["zaloSetupAdapter"]);
const zaloSetupWizard = createLazyFacadeObjectValue(() => loadSetupFacadeModule()["zaloSetupWizard"]);
//#endregion
export { zaloSetupWizard as i, resolveZaloRuntimeGroupPolicy as n, zaloSetupAdapter as r, evaluateZaloGroupAccess as t };
