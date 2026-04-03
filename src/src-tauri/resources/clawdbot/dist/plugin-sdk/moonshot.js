import { a as loadBundledPluginPublicSurfaceModuleSync } from "../facade-runtime-D_0VC8Qr.js";
//#region src/plugin-sdk/moonshot.ts
function loadFacadeModule() {
	return loadBundledPluginPublicSurfaceModuleSync({
		dirName: "moonshot",
		artifactBasename: "api.js"
	});
}
const applyMoonshotNativeStreamingUsageCompat = ((...args) => loadFacadeModule()["applyMoonshotNativeStreamingUsageCompat"](...args));
const buildMoonshotProvider = ((...args) => loadFacadeModule()["buildMoonshotProvider"](...args));
const isNativeMoonshotBaseUrl = ((...args) => loadFacadeModule()["isNativeMoonshotBaseUrl"](...args));
const MOONSHOT_BASE_URL = loadFacadeModule()["MOONSHOT_BASE_URL"];
const MOONSHOT_CN_BASE_URL = loadFacadeModule()["MOONSHOT_CN_BASE_URL"];
const MOONSHOT_DEFAULT_MODEL_ID = loadFacadeModule()["MOONSHOT_DEFAULT_MODEL_ID"];
const MOONSHOT_DEFAULT_MODEL_REF = loadFacadeModule()["MOONSHOT_DEFAULT_MODEL_REF"];
//#endregion
export { MOONSHOT_BASE_URL, MOONSHOT_CN_BASE_URL, MOONSHOT_DEFAULT_MODEL_ID, MOONSHOT_DEFAULT_MODEL_REF, applyMoonshotNativeStreamingUsageCompat, buildMoonshotProvider, isNativeMoonshotBaseUrl };
