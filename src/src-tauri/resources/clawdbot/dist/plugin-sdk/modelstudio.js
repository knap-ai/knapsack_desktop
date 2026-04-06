import { a as loadBundledPluginPublicSurfaceModuleSync, n as createLazyFacadeObjectValue, t as createLazyFacadeArrayValue } from "../facade-runtime-D_0VC8Qr.js";
//#region src/plugin-sdk/modelstudio.ts
function loadFacadeModule() {
	return loadBundledPluginPublicSurfaceModuleSync({
		dirName: "modelstudio",
		artifactBasename: "api.js"
	});
}
const applyModelStudioNativeStreamingUsageCompat = ((...args) => loadFacadeModule()["applyModelStudioNativeStreamingUsageCompat"](...args));
const buildModelStudioDefaultModelDefinition = ((...args) => loadFacadeModule()["buildModelStudioDefaultModelDefinition"](...args));
const buildModelStudioModelDefinition = ((...args) => loadFacadeModule()["buildModelStudioModelDefinition"](...args));
const MODELSTUDIO_BASE_URL = loadFacadeModule()["MODELSTUDIO_BASE_URL"];
const MODELSTUDIO_CN_BASE_URL = loadFacadeModule()["MODELSTUDIO_CN_BASE_URL"];
const MODELSTUDIO_DEFAULT_COST = createLazyFacadeObjectValue(() => loadFacadeModule()["MODELSTUDIO_DEFAULT_COST"]);
const MODELSTUDIO_DEFAULT_MODEL_ID = loadFacadeModule()["MODELSTUDIO_DEFAULT_MODEL_ID"];
const MODELSTUDIO_DEFAULT_MODEL_REF = loadFacadeModule()["MODELSTUDIO_DEFAULT_MODEL_REF"];
const MODELSTUDIO_GLOBAL_BASE_URL = loadFacadeModule()["MODELSTUDIO_GLOBAL_BASE_URL"];
const MODELSTUDIO_STANDARD_CN_BASE_URL = loadFacadeModule()["MODELSTUDIO_STANDARD_CN_BASE_URL"];
const MODELSTUDIO_STANDARD_GLOBAL_BASE_URL = loadFacadeModule()["MODELSTUDIO_STANDARD_GLOBAL_BASE_URL"];
const MODELSTUDIO_MODEL_CATALOG = createLazyFacadeArrayValue(() => loadFacadeModule()["MODELSTUDIO_MODEL_CATALOG"]);
const isNativeModelStudioBaseUrl = ((...args) => loadFacadeModule()["isNativeModelStudioBaseUrl"](...args));
const buildModelStudioProvider = ((...args) => loadFacadeModule()["buildModelStudioProvider"](...args));
//#endregion
export { MODELSTUDIO_BASE_URL, MODELSTUDIO_CN_BASE_URL, MODELSTUDIO_DEFAULT_COST, MODELSTUDIO_DEFAULT_MODEL_ID, MODELSTUDIO_DEFAULT_MODEL_REF, MODELSTUDIO_GLOBAL_BASE_URL, MODELSTUDIO_MODEL_CATALOG, MODELSTUDIO_STANDARD_CN_BASE_URL, MODELSTUDIO_STANDARD_GLOBAL_BASE_URL, applyModelStudioNativeStreamingUsageCompat, buildModelStudioDefaultModelDefinition, buildModelStudioModelDefinition, buildModelStudioProvider, isNativeModelStudioBaseUrl };
