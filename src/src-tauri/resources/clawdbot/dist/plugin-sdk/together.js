import { a as loadBundledPluginPublicSurfaceModuleSync, t as createLazyFacadeArrayValue } from "../facade-runtime-D_0VC8Qr.js";
//#region src/plugin-sdk/together.ts
function loadFacadeModule() {
	return loadBundledPluginPublicSurfaceModuleSync({
		dirName: "together",
		artifactBasename: "api.js"
	});
}
const applyTogetherConfig = ((...args) => loadFacadeModule()["applyTogetherConfig"](...args));
const buildTogetherModelDefinition = ((...args) => loadFacadeModule()["buildTogetherModelDefinition"](...args));
const buildTogetherProvider = ((...args) => loadFacadeModule()["buildTogetherProvider"](...args));
const TOGETHER_BASE_URL = loadFacadeModule()["TOGETHER_BASE_URL"];
const TOGETHER_DEFAULT_MODEL_REF = loadFacadeModule()["TOGETHER_DEFAULT_MODEL_REF"];
const TOGETHER_MODEL_CATALOG = createLazyFacadeArrayValue(() => loadFacadeModule()["TOGETHER_MODEL_CATALOG"]);
//#endregion
export { TOGETHER_BASE_URL, TOGETHER_DEFAULT_MODEL_REF, TOGETHER_MODEL_CATALOG, applyTogetherConfig, buildTogetherModelDefinition, buildTogetherProvider };
