import { a as loadBundledPluginPublicSurfaceModuleSync } from "../facade-runtime-D_0VC8Qr.js";
//#region src/plugin-sdk/xai.ts
function loadFacadeModule() {
	return loadBundledPluginPublicSurfaceModuleSync({
		dirName: "xai",
		artifactBasename: "api.js"
	});
}
const applyXaiConfig = ((...args) => loadFacadeModule()["applyXaiConfig"](...args));
const applyXaiProviderConfig = ((...args) => loadFacadeModule()["applyXaiProviderConfig"](...args));
const applyXaiModelCompat = ((...args) => loadFacadeModule()["applyXaiModelCompat"](...args));
const buildXaiCatalogModels = ((...args) => loadFacadeModule()["buildXaiCatalogModels"](...args));
const buildXaiModelDefinition = ((...args) => loadFacadeModule()["buildXaiModelDefinition"](...args));
const buildXaiProvider = ((...args) => loadFacadeModule()["buildXaiProvider"](...args));
const HTML_ENTITY_TOOL_CALL_ARGUMENTS_ENCODING = loadFacadeModule()["HTML_ENTITY_TOOL_CALL_ARGUMENTS_ENCODING"];
const isModernXaiModel = ((...args) => loadFacadeModule()["isModernXaiModel"](...args));
const normalizeXaiModelId = ((...args) => loadFacadeModule()["normalizeXaiModelId"](...args));
const resolveXaiCatalogEntry = ((...args) => loadFacadeModule()["resolveXaiCatalogEntry"](...args));
const resolveXaiForwardCompatModel = ((...args) => loadFacadeModule()["resolveXaiForwardCompatModel"](...args));
const XAI_BASE_URL = loadFacadeModule()["XAI_BASE_URL"];
const XAI_DEFAULT_CONTEXT_WINDOW = loadFacadeModule()["XAI_DEFAULT_CONTEXT_WINDOW"];
const XAI_DEFAULT_MODEL_ID = loadFacadeModule()["XAI_DEFAULT_MODEL_ID"];
const XAI_DEFAULT_MODEL_REF = loadFacadeModule()["XAI_DEFAULT_MODEL_REF"];
const XAI_DEFAULT_MAX_TOKENS = loadFacadeModule()["XAI_DEFAULT_MAX_TOKENS"];
const XAI_TOOL_SCHEMA_PROFILE = loadFacadeModule()["XAI_TOOL_SCHEMA_PROFILE"];
//#endregion
export { HTML_ENTITY_TOOL_CALL_ARGUMENTS_ENCODING, XAI_BASE_URL, XAI_DEFAULT_CONTEXT_WINDOW, XAI_DEFAULT_MAX_TOKENS, XAI_DEFAULT_MODEL_ID, XAI_DEFAULT_MODEL_REF, XAI_TOOL_SCHEMA_PROFILE, applyXaiConfig, applyXaiModelCompat, applyXaiProviderConfig, buildXaiCatalogModels, buildXaiModelDefinition, buildXaiProvider, isModernXaiModel, normalizeXaiModelId, resolveXaiCatalogEntry, resolveXaiForwardCompatModel };
