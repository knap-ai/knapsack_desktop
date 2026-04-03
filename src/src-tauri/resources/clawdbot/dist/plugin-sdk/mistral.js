import { a as loadBundledPluginPublicSurfaceModuleSync } from "../facade-runtime-D_0VC8Qr.js";
//#region src/plugin-sdk/mistral.ts
function loadFacadeModule() {
	return loadBundledPluginPublicSurfaceModuleSync({
		dirName: "mistral",
		artifactBasename: "api.js"
	});
}
const applyMistralConfig = ((...args) => loadFacadeModule()["applyMistralConfig"](...args));
const applyMistralProviderConfig = ((...args) => loadFacadeModule()["applyMistralProviderConfig"](...args));
const buildMistralModelDefinition = ((...args) => loadFacadeModule()["buildMistralModelDefinition"](...args));
const buildMistralProvider = ((...args) => loadFacadeModule()["buildMistralProvider"](...args));
const MISTRAL_BASE_URL = loadFacadeModule()["MISTRAL_BASE_URL"];
const MISTRAL_DEFAULT_MODEL_ID = loadFacadeModule()["MISTRAL_DEFAULT_MODEL_ID"];
const MISTRAL_DEFAULT_MODEL_REF = loadFacadeModule()["MISTRAL_DEFAULT_MODEL_REF"];
//#endregion
export { MISTRAL_BASE_URL, MISTRAL_DEFAULT_MODEL_ID, MISTRAL_DEFAULT_MODEL_REF, applyMistralConfig, applyMistralProviderConfig, buildMistralModelDefinition, buildMistralProvider };
