import { n as loadBundledPluginPublicSurfaceModuleSync } from "./facade-runtime-gSGchfr7.js";
//#region src/plugin-sdk/lmstudio-runtime.ts
function loadFacadeModule() {
	return loadBundledPluginPublicSurfaceModuleSync({
		dirName: "lmstudio",
		artifactBasename: "runtime-api.js"
	});
}
const LMSTUDIO_DEFAULT_BASE_URL = "http://localhost:1234";
const LMSTUDIO_DEFAULT_INFERENCE_BASE_URL = `${LMSTUDIO_DEFAULT_BASE_URL}/v1`;
const LMSTUDIO_DEFAULT_EMBEDDING_MODEL = "text-embedding-nomic-embed-text-v1.5";
const LMSTUDIO_PROVIDER_LABEL = "LM Studio";
const LMSTUDIO_DEFAULT_API_KEY_ENV_VAR = "LM_API_TOKEN";
const LMSTUDIO_LOCAL_API_KEY_PLACEHOLDER = "lmstudio-local";
const LMSTUDIO_MODEL_PLACEHOLDER = "model-key-from-api-v1-models";
const LMSTUDIO_DEFAULT_LOAD_CONTEXT_LENGTH = 64e3;
const LMSTUDIO_DEFAULT_MODEL_ID = "qwen/qwen3.5-9b";
const LMSTUDIO_PROVIDER_ID = "lmstudio";
const resolveLmstudioReasoningCapability = createLazyFacadeValue("resolveLmstudioReasoningCapability");
const resolveLoadedContextWindow = createLazyFacadeValue("resolveLoadedContextWindow");
const resolveLmstudioServerBase = createLazyFacadeValue("resolveLmstudioServerBase");
const resolveLmstudioInferenceBase = createLazyFacadeValue("resolveLmstudioInferenceBase");
const normalizeLmstudioProviderConfig = createLazyFacadeValue("normalizeLmstudioProviderConfig");
const fetchLmstudioModels = createLazyFacadeValue("fetchLmstudioModels");
const mapLmstudioWireEntry = createLazyFacadeValue("mapLmstudioWireEntry");
const discoverLmstudioModels = createLazyFacadeValue("discoverLmstudioModels");
const ensureLmstudioModelLoaded = createLazyFacadeValue("ensureLmstudioModelLoaded");
const buildLmstudioAuthHeaders = createLazyFacadeValue("buildLmstudioAuthHeaders");
const resolveLmstudioConfiguredApiKey = createLazyFacadeValue("resolveLmstudioConfiguredApiKey");
const resolveLmstudioProviderHeaders = createLazyFacadeValue("resolveLmstudioProviderHeaders");
const resolveLmstudioRuntimeApiKey = createLazyFacadeValue("resolveLmstudioRuntimeApiKey");
function createLazyFacadeValue(key) {
	return ((...args) => {
		const value = loadFacadeModule()[key];
		if (typeof value !== "function") return value;
		return value(...args);
	});
}
//#endregion
export { resolveLoadedContextWindow as C, resolveLmstudioServerBase as S, resolveLmstudioConfiguredApiKey as _, LMSTUDIO_DEFAULT_LOAD_CONTEXT_LENGTH as a, resolveLmstudioReasoningCapability as b, LMSTUDIO_MODEL_PLACEHOLDER as c, buildLmstudioAuthHeaders as d, discoverLmstudioModels as f, normalizeLmstudioProviderConfig as g, mapLmstudioWireEntry as h, LMSTUDIO_DEFAULT_INFERENCE_BASE_URL as i, LMSTUDIO_PROVIDER_ID as l, fetchLmstudioModels as m, LMSTUDIO_DEFAULT_BASE_URL as n, LMSTUDIO_DEFAULT_MODEL_ID as o, ensureLmstudioModelLoaded as p, LMSTUDIO_DEFAULT_EMBEDDING_MODEL as r, LMSTUDIO_LOCAL_API_KEY_PLACEHOLDER as s, LMSTUDIO_DEFAULT_API_KEY_ENV_VAR as t, LMSTUDIO_PROVIDER_LABEL as u, resolveLmstudioInferenceBase as v, resolveLmstudioRuntimeApiKey as x, resolveLmstudioProviderHeaders as y };
