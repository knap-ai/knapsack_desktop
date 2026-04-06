import { a as loadBundledPluginPublicSurfaceModuleSync, t as createLazyFacadeArrayValue } from "../facade-runtime-D_0VC8Qr.js";
//#region src/plugin-sdk/deepseek.ts
function loadFacadeModule() {
	return loadBundledPluginPublicSurfaceModuleSync({
		dirName: "deepseek",
		artifactBasename: "api.js"
	});
}
const buildDeepSeekModelDefinition = ((...args) => loadFacadeModule()["buildDeepSeekModelDefinition"](...args));
const buildDeepSeekProvider = ((...args) => loadFacadeModule()["buildDeepSeekProvider"](...args));
const DEEPSEEK_BASE_URL = loadFacadeModule()["DEEPSEEK_BASE_URL"];
const DEEPSEEK_MODEL_CATALOG = createLazyFacadeArrayValue(() => loadFacadeModule()["DEEPSEEK_MODEL_CATALOG"]);
//#endregion
export { DEEPSEEK_BASE_URL, DEEPSEEK_MODEL_CATALOG, buildDeepSeekModelDefinition, buildDeepSeekProvider };
