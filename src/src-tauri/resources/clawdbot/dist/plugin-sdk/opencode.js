import { a as loadBundledPluginPublicSurfaceModuleSync } from "../facade-runtime-D_0VC8Qr.js";
//#region src/plugin-sdk/opencode.ts
function loadFacadeModule() {
	return loadBundledPluginPublicSurfaceModuleSync({
		dirName: "opencode",
		artifactBasename: "api.js"
	});
}
const applyOpencodeZenConfig = ((...args) => loadFacadeModule()["applyOpencodeZenConfig"](...args));
const applyOpencodeZenModelDefault = ((...args) => loadFacadeModule()["applyOpencodeZenModelDefault"](...args));
const applyOpencodeZenProviderConfig = ((...args) => loadFacadeModule()["applyOpencodeZenProviderConfig"](...args));
const OPENCODE_ZEN_DEFAULT_MODEL = loadFacadeModule()["OPENCODE_ZEN_DEFAULT_MODEL"];
const OPENCODE_ZEN_DEFAULT_MODEL_REF = loadFacadeModule()["OPENCODE_ZEN_DEFAULT_MODEL_REF"];
//#endregion
export { OPENCODE_ZEN_DEFAULT_MODEL, OPENCODE_ZEN_DEFAULT_MODEL_REF, applyOpencodeZenConfig, applyOpencodeZenModelDefault, applyOpencodeZenProviderConfig };
