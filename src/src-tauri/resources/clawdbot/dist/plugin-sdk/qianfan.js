import { a as loadBundledPluginPublicSurfaceModuleSync } from "../facade-runtime-D_0VC8Qr.js";
//#region src/plugin-sdk/qianfan.ts
function loadFacadeModule() {
	return loadBundledPluginPublicSurfaceModuleSync({
		dirName: "qianfan",
		artifactBasename: "api.js"
	});
}
const QIANFAN_BASE_URL = loadFacadeModule()["QIANFAN_BASE_URL"];
const QIANFAN_DEFAULT_MODEL_ID = loadFacadeModule()["QIANFAN_DEFAULT_MODEL_ID"];
const buildQianfanProvider = ((...args) => loadFacadeModule()["buildQianfanProvider"](...args));
//#endregion
export { QIANFAN_BASE_URL, QIANFAN_DEFAULT_MODEL_ID, buildQianfanProvider };
