import { a as loadBundledPluginPublicSurfaceModuleSync } from "./facade-runtime-D_0VC8Qr.js";
//#region src/plugin-sdk/signal-account.ts
function loadFacadeModule() {
	return loadBundledPluginPublicSurfaceModuleSync({
		dirName: "signal",
		artifactBasename: "api.js"
	});
}
const resolveSignalAccount = ((...args) => loadFacadeModule()["resolveSignalAccount"](...args));
//#endregion
export { resolveSignalAccount as t };
