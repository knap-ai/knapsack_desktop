import { i as loadBundledPluginPublicSurfaceModuleSync } from "./facade-loader-CGu7k8Om.js";
//#region src/plugin-sdk/browser-control-auth.ts
function loadBrowserControlAuthSurface() {
	return loadBundledPluginPublicSurfaceModuleSync({
		dirName: "browser",
		artifactBasename: "browser-control-auth.js"
	});
}
function resolveBrowserControlAuth(cfg, env = process.env) {
	return loadBrowserControlAuthSurface().resolveBrowserControlAuth(cfg, env);
}
function shouldAutoGenerateBrowserAuth(env) {
	return loadBrowserControlAuthSurface().shouldAutoGenerateBrowserAuth(env);
}
async function ensureBrowserControlAuth(params) {
	return await loadBrowserControlAuthSurface().ensureBrowserControlAuth(params);
}
//#endregion
export { resolveBrowserControlAuth as n, shouldAutoGenerateBrowserAuth as r, ensureBrowserControlAuth as t };
