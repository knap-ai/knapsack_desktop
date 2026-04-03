import { a as loadBundledPluginPublicSurfaceModuleSync, t as createLazyFacadeArrayValue } from "../facade-runtime-D_0VC8Qr.js";
//#region src/plugin-sdk/volcengine.ts
function loadFacadeModule() {
	return loadBundledPluginPublicSurfaceModuleSync({
		dirName: "volcengine",
		artifactBasename: "api.js"
	});
}
const buildDoubaoCodingProvider = ((...args) => loadFacadeModule()["buildDoubaoCodingProvider"](...args));
const buildDoubaoModelDefinition = ((...args) => loadFacadeModule()["buildDoubaoModelDefinition"](...args));
const buildDoubaoProvider = ((...args) => loadFacadeModule()["buildDoubaoProvider"](...args));
const DOUBAO_BASE_URL = loadFacadeModule()["DOUBAO_BASE_URL"];
const DOUBAO_CODING_BASE_URL = loadFacadeModule()["DOUBAO_CODING_BASE_URL"];
const DOUBAO_CODING_MODEL_CATALOG = createLazyFacadeArrayValue(() => loadFacadeModule()["DOUBAO_CODING_MODEL_CATALOG"]);
const DOUBAO_MODEL_CATALOG = createLazyFacadeArrayValue(() => loadFacadeModule()["DOUBAO_MODEL_CATALOG"]);
//#endregion
export { DOUBAO_BASE_URL, DOUBAO_CODING_BASE_URL, DOUBAO_CODING_MODEL_CATALOG, DOUBAO_MODEL_CATALOG, buildDoubaoCodingProvider, buildDoubaoModelDefinition, buildDoubaoProvider };
