import { a as loadBundledPluginPublicSurfaceModuleSync } from "./facade-runtime-D_0VC8Qr.js";
//#region src/plugin-sdk/google.ts
function loadFacadeModule() {
	return loadBundledPluginPublicSurfaceModuleSync({
		dirName: "google",
		artifactBasename: "api.js"
	});
}
const applyGoogleGeminiModelDefault = ((...args) => loadFacadeModule()["applyGoogleGeminiModelDefault"](...args));
const DEFAULT_GOOGLE_API_BASE_URL = loadFacadeModule()["DEFAULT_GOOGLE_API_BASE_URL"];
const GOOGLE_GEMINI_DEFAULT_MODEL = loadFacadeModule()["GOOGLE_GEMINI_DEFAULT_MODEL"];
const isGoogleGenerativeAiApi = ((...args) => loadFacadeModule()["isGoogleGenerativeAiApi"](...args));
const normalizeAntigravityModelId = ((...args) => loadFacadeModule()["normalizeAntigravityModelId"](...args));
const normalizeGoogleApiBaseUrl = ((...args) => loadFacadeModule()["normalizeGoogleApiBaseUrl"](...args));
const normalizeGoogleGenerativeAiBaseUrl = ((...args) => loadFacadeModule()["normalizeGoogleGenerativeAiBaseUrl"](...args));
const normalizeGoogleModelId = ((...args) => loadFacadeModule()["normalizeGoogleModelId"](...args));
const normalizeGoogleProviderConfig = ((...args) => loadFacadeModule()["normalizeGoogleProviderConfig"](...args));
const parseGeminiAuth = ((...args) => loadFacadeModule()["parseGeminiAuth"](...args));
const resolveGoogleGenerativeAiApiOrigin = ((...args) => loadFacadeModule()["resolveGoogleGenerativeAiApiOrigin"](...args));
const resolveGoogleGenerativeAiTransport = ((...args) => loadFacadeModule()["resolveGoogleGenerativeAiTransport"](...args));
const shouldNormalizeGoogleProviderConfig = ((...args) => loadFacadeModule()["shouldNormalizeGoogleProviderConfig"](...args));
const shouldNormalizeGoogleGenerativeAiProviderConfig = ((...args) => loadFacadeModule()["shouldNormalizeGoogleGenerativeAiProviderConfig"](...args));
//#endregion
export { normalizeAntigravityModelId as a, normalizeGoogleModelId as c, resolveGoogleGenerativeAiApiOrigin as d, resolveGoogleGenerativeAiTransport as f, isGoogleGenerativeAiApi as i, normalizeGoogleProviderConfig as l, shouldNormalizeGoogleProviderConfig as m, GOOGLE_GEMINI_DEFAULT_MODEL as n, normalizeGoogleApiBaseUrl as o, shouldNormalizeGoogleGenerativeAiProviderConfig as p, applyGoogleGeminiModelDefault as r, normalizeGoogleGenerativeAiBaseUrl as s, DEFAULT_GOOGLE_API_BASE_URL as t, parseGeminiAuth as u };
