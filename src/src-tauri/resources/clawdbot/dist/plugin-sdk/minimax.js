import { a as loadBundledPluginPublicSurfaceModuleSync, n as createLazyFacadeObjectValue, t as createLazyFacadeArrayValue } from "../facade-runtime-D_0VC8Qr.js";
//#region src/plugin-sdk/minimax.ts
function loadFacadeModule() {
	return loadBundledPluginPublicSurfaceModuleSync({
		dirName: "minimax",
		artifactBasename: "api.js"
	});
}
const applyMinimaxApiConfig = ((...args) => loadFacadeModule()["applyMinimaxApiConfig"](...args));
const applyMinimaxApiConfigCn = ((...args) => loadFacadeModule()["applyMinimaxApiConfigCn"](...args));
const applyMinimaxApiProviderConfig = ((...args) => loadFacadeModule()["applyMinimaxApiProviderConfig"](...args));
const applyMinimaxApiProviderConfigCn = ((...args) => loadFacadeModule()["applyMinimaxApiProviderConfigCn"](...args));
const buildMinimaxPortalProvider = ((...args) => loadFacadeModule()["buildMinimaxPortalProvider"](...args));
const buildMinimaxProvider = ((...args) => loadFacadeModule()["buildMinimaxProvider"](...args));
const isMiniMaxModernModelId = ((...args) => loadFacadeModule()["isMiniMaxModernModelId"](...args));
const MINIMAX_API_BASE_URL = loadFacadeModule()["MINIMAX_API_BASE_URL"];
const MINIMAX_CN_API_BASE_URL = loadFacadeModule()["MINIMAX_CN_API_BASE_URL"];
const MINIMAX_DEFAULT_MODEL_ID = loadFacadeModule()["MINIMAX_DEFAULT_MODEL_ID"];
const MINIMAX_DEFAULT_MODEL_REF = loadFacadeModule()["MINIMAX_DEFAULT_MODEL_REF"];
const MINIMAX_TEXT_MODEL_CATALOG = createLazyFacadeObjectValue(() => loadFacadeModule()["MINIMAX_TEXT_MODEL_CATALOG"]);
const MINIMAX_TEXT_MODEL_ORDER = createLazyFacadeArrayValue(() => loadFacadeModule()["MINIMAX_TEXT_MODEL_ORDER"]);
const MINIMAX_TEXT_MODEL_REFS = createLazyFacadeArrayValue(() => loadFacadeModule()["MINIMAX_TEXT_MODEL_REFS"]);
//#endregion
export { MINIMAX_API_BASE_URL, MINIMAX_CN_API_BASE_URL, MINIMAX_DEFAULT_MODEL_ID, MINIMAX_DEFAULT_MODEL_REF, MINIMAX_TEXT_MODEL_CATALOG, MINIMAX_TEXT_MODEL_ORDER, MINIMAX_TEXT_MODEL_REFS, applyMinimaxApiConfig, applyMinimaxApiConfigCn, applyMinimaxApiProviderConfig, applyMinimaxApiProviderConfigCn, buildMinimaxPortalProvider, buildMinimaxProvider, isMiniMaxModernModelId };
