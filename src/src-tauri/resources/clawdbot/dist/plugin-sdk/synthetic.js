import { a as loadBundledPluginPublicSurfaceModuleSync, t as createLazyFacadeArrayValue } from "../facade-runtime-D_0VC8Qr.js";
//#region src/plugin-sdk/synthetic.ts
function loadFacadeModule() {
	return loadBundledPluginPublicSurfaceModuleSync({
		dirName: "synthetic",
		artifactBasename: "api.js"
	});
}
const applySyntheticConfig = ((...args) => loadFacadeModule()["applySyntheticConfig"](...args));
const applySyntheticProviderConfig = ((...args) => loadFacadeModule()["applySyntheticProviderConfig"](...args));
const buildSyntheticModelDefinition = ((...args) => loadFacadeModule()["buildSyntheticModelDefinition"](...args));
const buildSyntheticProvider = ((...args) => loadFacadeModule()["buildSyntheticProvider"](...args));
const SYNTHETIC_BASE_URL = loadFacadeModule()["SYNTHETIC_BASE_URL"];
const SYNTHETIC_DEFAULT_MODEL_REF = loadFacadeModule()["SYNTHETIC_DEFAULT_MODEL_REF"];
const SYNTHETIC_MODEL_CATALOG = createLazyFacadeArrayValue(() => loadFacadeModule()["SYNTHETIC_MODEL_CATALOG"]);
//#endregion
export { SYNTHETIC_BASE_URL, SYNTHETIC_DEFAULT_MODEL_REF, SYNTHETIC_MODEL_CATALOG, applySyntheticConfig, applySyntheticProviderConfig, buildSyntheticModelDefinition, buildSyntheticProvider };
