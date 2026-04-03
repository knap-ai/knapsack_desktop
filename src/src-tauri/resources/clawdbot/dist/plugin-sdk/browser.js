import { i as loadActivatedBundledPluginPublicSurfaceModuleSync, n as createLazyFacadeObjectValue } from "../facade-runtime-D_0VC8Qr.js";
//#region src/plugin-sdk/browser.ts
function loadFacadeModule() {
	return loadActivatedBundledPluginPublicSurfaceModuleSync({
		dirName: "browser",
		artifactBasename: "runtime-api.js"
	});
}
const browserHandlers = createLazyFacadeObjectValue(() => loadFacadeModule()["browserHandlers"]);
const createBrowserPluginService = ((...args) => loadFacadeModule()["createBrowserPluginService"](...args));
const createBrowserTool = ((...args) => loadFacadeModule()["createBrowserTool"](...args));
const handleBrowserGatewayRequest = ((...args) => loadFacadeModule()["handleBrowserGatewayRequest"](...args));
const registerBrowserCli = ((...args) => loadFacadeModule()["registerBrowserCli"](...args));
//#endregion
export { browserHandlers, createBrowserPluginService, createBrowserTool, handleBrowserGatewayRequest, registerBrowserCli };
