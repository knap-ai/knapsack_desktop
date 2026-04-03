import { a as loadBundledPluginPublicSurfaceModuleSync, n as createLazyFacadeObjectValue, t as createLazyFacadeArrayValue } from "../facade-runtime-D_0VC8Qr.js";
//#region src/plugin-sdk/kilocode.ts
function loadFacadeModule() {
	return loadBundledPluginPublicSurfaceModuleSync({
		dirName: "kilocode",
		artifactBasename: "api.js"
	});
}
const buildKilocodeProvider = ((...args) => loadFacadeModule()["buildKilocodeProvider"](...args));
const buildKilocodeProviderWithDiscovery = ((...args) => loadFacadeModule()["buildKilocodeProviderWithDiscovery"](...args));
const buildKilocodeModelDefinition = ((...args) => loadFacadeModule()["buildKilocodeModelDefinition"](...args));
const discoverKilocodeModels = ((...args) => loadFacadeModule()["discoverKilocodeModels"](...args));
const KILOCODE_BASE_URL = loadFacadeModule()["KILOCODE_BASE_URL"];
const KILOCODE_DEFAULT_CONTEXT_WINDOW = loadFacadeModule()["KILOCODE_DEFAULT_CONTEXT_WINDOW"];
const KILOCODE_DEFAULT_COST = createLazyFacadeObjectValue(() => loadFacadeModule()["KILOCODE_DEFAULT_COST"]);
const KILOCODE_DEFAULT_MAX_TOKENS = loadFacadeModule()["KILOCODE_DEFAULT_MAX_TOKENS"];
const KILOCODE_DEFAULT_MODEL_ID = loadFacadeModule()["KILOCODE_DEFAULT_MODEL_ID"];
const KILOCODE_DEFAULT_MODEL_NAME = loadFacadeModule()["KILOCODE_DEFAULT_MODEL_NAME"];
const KILOCODE_DEFAULT_MODEL_REF = loadFacadeModule()["KILOCODE_DEFAULT_MODEL_REF"];
const KILOCODE_MODELS_URL = loadFacadeModule()["KILOCODE_MODELS_URL"];
const KILOCODE_MODEL_CATALOG = createLazyFacadeArrayValue(() => loadFacadeModule()["KILOCODE_MODEL_CATALOG"]);
//#endregion
export { KILOCODE_BASE_URL, KILOCODE_DEFAULT_CONTEXT_WINDOW, KILOCODE_DEFAULT_COST, KILOCODE_DEFAULT_MAX_TOKENS, KILOCODE_DEFAULT_MODEL_ID, KILOCODE_DEFAULT_MODEL_NAME, KILOCODE_DEFAULT_MODEL_REF, KILOCODE_MODELS_URL, KILOCODE_MODEL_CATALOG, buildKilocodeModelDefinition, buildKilocodeProvider, buildKilocodeProviderWithDiscovery, discoverKilocodeModels };
