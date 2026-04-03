import { a as loadBundledPluginPublicSurfaceModuleSync, n as createLazyFacadeObjectValue } from "./facade-runtime-D_0VC8Qr.js";
//#region src/plugin-sdk/feishu-setup.ts
function loadFacadeModule() {
	return loadBundledPluginPublicSurfaceModuleSync({
		dirName: "feishu",
		artifactBasename: "api.js"
	});
}
const feishuSetupAdapter = createLazyFacadeObjectValue(() => loadFacadeModule()["feishuSetupAdapter"]);
const feishuSetupWizard = createLazyFacadeObjectValue(() => loadFacadeModule()["feishuSetupWizard"]);
//#endregion
export { feishuSetupWizard as n, feishuSetupAdapter as t };
