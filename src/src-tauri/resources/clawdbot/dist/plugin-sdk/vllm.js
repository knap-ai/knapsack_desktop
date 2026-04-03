import { a as loadBundledPluginPublicSurfaceModuleSync } from "../facade-runtime-D_0VC8Qr.js";
//#region src/plugin-sdk/vllm.ts
function loadFacadeModule() {
	return loadBundledPluginPublicSurfaceModuleSync({
		dirName: "vllm",
		artifactBasename: "api.js"
	});
}
const buildVllmProvider = ((...args) => loadFacadeModule()["buildVllmProvider"](...args));
const VLLM_DEFAULT_API_KEY_ENV_VAR = loadFacadeModule()["VLLM_DEFAULT_API_KEY_ENV_VAR"];
const VLLM_DEFAULT_BASE_URL = loadFacadeModule()["VLLM_DEFAULT_BASE_URL"];
const VLLM_MODEL_PLACEHOLDER = loadFacadeModule()["VLLM_MODEL_PLACEHOLDER"];
const VLLM_PROVIDER_LABEL = loadFacadeModule()["VLLM_PROVIDER_LABEL"];
//#endregion
export { VLLM_DEFAULT_API_KEY_ENV_VAR, VLLM_DEFAULT_BASE_URL, VLLM_MODEL_PLACEHOLDER, VLLM_PROVIDER_LABEL, buildVllmProvider };
