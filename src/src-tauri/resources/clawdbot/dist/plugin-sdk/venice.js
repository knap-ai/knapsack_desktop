import { a as loadBundledPluginPublicSurfaceModuleSync, t as createLazyFacadeArrayValue } from "../facade-runtime-D_0VC8Qr.js";
//#region src/plugin-sdk/venice.ts
function loadFacadeModule() {
	return loadBundledPluginPublicSurfaceModuleSync({
		dirName: "venice",
		artifactBasename: "api.js"
	});
}
const buildVeniceModelDefinition = ((...args) => loadFacadeModule()["buildVeniceModelDefinition"](...args));
const buildVeniceProvider = ((...args) => loadFacadeModule()["buildVeniceProvider"](...args));
const discoverVeniceModels = ((...args) => loadFacadeModule()["discoverVeniceModels"](...args));
const VENICE_BASE_URL = loadFacadeModule()["VENICE_BASE_URL"];
const VENICE_DEFAULT_MODEL_REF = loadFacadeModule()["VENICE_DEFAULT_MODEL_REF"];
const VENICE_MODEL_CATALOG = createLazyFacadeArrayValue(() => loadFacadeModule()["VENICE_MODEL_CATALOG"]);
//#endregion
export { VENICE_BASE_URL, VENICE_DEFAULT_MODEL_REF, VENICE_MODEL_CATALOG, buildVeniceModelDefinition, buildVeniceProvider, discoverVeniceModels };
