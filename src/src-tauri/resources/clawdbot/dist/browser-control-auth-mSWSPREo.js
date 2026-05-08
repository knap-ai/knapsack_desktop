import { i as loadBundledPluginPublicSurfaceModuleSync } from "./facade-loader-BAtcmKGO.js";
//#region src/plugin-sdk/browser-control-auth.ts
let cachedBrowserControlAuthSurface;
function loadBrowserControlAuthSurface() {
	cachedBrowserControlAuthSurface ??= loadBundledPluginPublicSurfaceModuleSync({
		dirName: "browser",
		artifactBasename: "browser-control-auth.js"
	});
	return cachedBrowserControlAuthSurface;
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
