import { i as loadBundledPluginPublicSurfaceModuleSync, n as createLazyFacadeObjectValue } from "./facade-loader-CGu7k8Om.js";
//#region src/plugin-sdk/feishu-setup.ts
function loadFacadeModule() {
	return loadBundledPluginPublicSurfaceModuleSync({
		dirName: "feishu",
		artifactBasename: "setup-api.js"
	});
}
const feishuSetupAdapter = createLazyFacadeObjectValue(() => loadFacadeModule()["feishuSetupAdapter"]);
const feishuSetupWizard = createLazyFacadeObjectValue(() => loadFacadeModule()["feishuSetupWizard"]);
//#endregion
export { feishuSetupWizard as n, feishuSetupAdapter as t };
