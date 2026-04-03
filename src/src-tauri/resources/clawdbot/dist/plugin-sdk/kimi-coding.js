import { a as loadBundledPluginPublicSurfaceModuleSync } from "../facade-runtime-D_0VC8Qr.js";
//#region src/plugin-sdk/kimi-coding.ts
function loadFacadeModule() {
	return loadBundledPluginPublicSurfaceModuleSync({
		dirName: "kimi-coding",
		artifactBasename: "api.js"
	});
}
const buildKimiCodingProvider = ((...args) => loadFacadeModule()["buildKimiCodingProvider"](...args));
//#endregion
export { buildKimiCodingProvider };
