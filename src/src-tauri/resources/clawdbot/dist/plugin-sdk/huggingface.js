import { a as loadBundledPluginPublicSurfaceModuleSync, t as createLazyFacadeArrayValue } from "../facade-runtime-D_0VC8Qr.js";
//#region src/plugin-sdk/huggingface.ts
function loadFacadeModule() {
	return loadBundledPluginPublicSurfaceModuleSync({
		dirName: "huggingface",
		artifactBasename: "api.js"
	});
}
const buildHuggingfaceModelDefinition = ((...args) => loadFacadeModule()["buildHuggingfaceModelDefinition"](...args));
const buildHuggingfaceProvider = ((...args) => loadFacadeModule()["buildHuggingfaceProvider"](...args));
const discoverHuggingfaceModels = ((...args) => loadFacadeModule()["discoverHuggingfaceModels"](...args));
const HUGGINGFACE_BASE_URL = loadFacadeModule()["HUGGINGFACE_BASE_URL"];
const HUGGINGFACE_DEFAULT_MODEL_REF = loadFacadeModule()["HUGGINGFACE_DEFAULT_MODEL_REF"];
const HUGGINGFACE_MODEL_CATALOG = createLazyFacadeArrayValue(() => loadFacadeModule()["HUGGINGFACE_MODEL_CATALOG"]);
const HUGGINGFACE_POLICY_SUFFIXES = createLazyFacadeArrayValue(() => loadFacadeModule()["HUGGINGFACE_POLICY_SUFFIXES"]);
const isHuggingfacePolicyLocked = ((...args) => loadFacadeModule()["isHuggingfacePolicyLocked"](...args));
//#endregion
export { HUGGINGFACE_BASE_URL, HUGGINGFACE_DEFAULT_MODEL_REF, HUGGINGFACE_MODEL_CATALOG, HUGGINGFACE_POLICY_SUFFIXES, buildHuggingfaceModelDefinition, buildHuggingfaceProvider, discoverHuggingfaceModels, isHuggingfacePolicyLocked };
