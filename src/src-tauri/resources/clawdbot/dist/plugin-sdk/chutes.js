import { a as loadBundledPluginPublicSurfaceModuleSync, t as createLazyFacadeArrayValue } from "../facade-runtime-D_0VC8Qr.js";
//#region src/plugin-sdk/chutes.ts
function loadFacadeModule() {
	return loadBundledPluginPublicSurfaceModuleSync({
		dirName: "chutes",
		artifactBasename: "api.js"
	});
}
const applyChutesApiKeyConfig = ((...args) => loadFacadeModule()["applyChutesApiKeyConfig"](...args));
const applyChutesConfig = ((...args) => loadFacadeModule()["applyChutesConfig"](...args));
const applyChutesProviderConfig = ((...args) => loadFacadeModule()["applyChutesProviderConfig"](...args));
const buildChutesModelDefinition = ((...args) => loadFacadeModule()["buildChutesModelDefinition"](...args));
const buildChutesProvider = ((...args) => loadFacadeModule()["buildChutesProvider"](...args));
const CHUTES_BASE_URL = loadFacadeModule()["CHUTES_BASE_URL"];
const CHUTES_DEFAULT_MODEL_ID = loadFacadeModule()["CHUTES_DEFAULT_MODEL_ID"];
const CHUTES_DEFAULT_MODEL_REF = loadFacadeModule()["CHUTES_DEFAULT_MODEL_REF"];
const CHUTES_MODEL_CATALOG = createLazyFacadeArrayValue(() => loadFacadeModule()["CHUTES_MODEL_CATALOG"]);
const discoverChutesModels = ((...args) => loadFacadeModule()["discoverChutesModels"](...args));
//#endregion
export { CHUTES_BASE_URL, CHUTES_DEFAULT_MODEL_ID, CHUTES_DEFAULT_MODEL_REF, CHUTES_MODEL_CATALOG, applyChutesApiKeyConfig, applyChutesConfig, applyChutesProviderConfig, buildChutesModelDefinition, buildChutesProvider, discoverChutesModels };
