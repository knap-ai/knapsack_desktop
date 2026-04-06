import { a as loadBundledPluginPublicSurfaceModuleSync, t as createLazyFacadeArrayValue } from "../facade-runtime-D_0VC8Qr.js";
//#region src/plugin-sdk/byteplus.ts
function loadFacadeModule() {
	return loadBundledPluginPublicSurfaceModuleSync({
		dirName: "byteplus",
		artifactBasename: "api.js"
	});
}
const buildBytePlusCodingProvider = ((...args) => loadFacadeModule()["buildBytePlusCodingProvider"](...args));
const buildBytePlusModelDefinition = ((...args) => loadFacadeModule()["buildBytePlusModelDefinition"](...args));
const buildBytePlusProvider = ((...args) => loadFacadeModule()["buildBytePlusProvider"](...args));
const BYTEPLUS_BASE_URL = loadFacadeModule()["BYTEPLUS_BASE_URL"];
const BYTEPLUS_CODING_BASE_URL = loadFacadeModule()["BYTEPLUS_CODING_BASE_URL"];
const BYTEPLUS_CODING_MODEL_CATALOG = createLazyFacadeArrayValue(() => loadFacadeModule()["BYTEPLUS_CODING_MODEL_CATALOG"]);
const BYTEPLUS_MODEL_CATALOG = createLazyFacadeArrayValue(() => loadFacadeModule()["BYTEPLUS_MODEL_CATALOG"]);
//#endregion
export { BYTEPLUS_BASE_URL, BYTEPLUS_CODING_BASE_URL, BYTEPLUS_CODING_MODEL_CATALOG, BYTEPLUS_MODEL_CATALOG, buildBytePlusCodingProvider, buildBytePlusModelDefinition, buildBytePlusProvider };
