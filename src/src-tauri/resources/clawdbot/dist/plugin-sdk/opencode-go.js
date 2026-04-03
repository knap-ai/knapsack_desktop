import { a as loadBundledPluginPublicSurfaceModuleSync } from "../facade-runtime-D_0VC8Qr.js";
//#region src/plugin-sdk/opencode-go.ts
function loadFacadeModule() {
	return loadBundledPluginPublicSurfaceModuleSync({
		dirName: "opencode-go",
		artifactBasename: "api.js"
	});
}
const applyOpencodeGoConfig = ((...args) => loadFacadeModule()["applyOpencodeGoConfig"](...args));
const applyOpencodeGoModelDefault = ((...args) => loadFacadeModule()["applyOpencodeGoModelDefault"](...args));
const applyOpencodeGoProviderConfig = ((...args) => loadFacadeModule()["applyOpencodeGoProviderConfig"](...args));
const OPENCODE_GO_DEFAULT_MODEL_REF = loadFacadeModule()["OPENCODE_GO_DEFAULT_MODEL_REF"];
//#endregion
export { OPENCODE_GO_DEFAULT_MODEL_REF, applyOpencodeGoConfig, applyOpencodeGoModelDefault, applyOpencodeGoProviderConfig };
