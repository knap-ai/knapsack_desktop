import { a as loadBundledPluginPublicSurfaceModuleSync } from "../facade-runtime-D_0VC8Qr.js";
//#region src/plugin-sdk/sglang.ts
function loadFacadeModule() {
	return loadBundledPluginPublicSurfaceModuleSync({
		dirName: "sglang",
		artifactBasename: "api.js"
	});
}
const buildSglangProvider = ((...args) => loadFacadeModule()["buildSglangProvider"](...args));
const SGLANG_DEFAULT_API_KEY_ENV_VAR = loadFacadeModule()["SGLANG_DEFAULT_API_KEY_ENV_VAR"];
const SGLANG_DEFAULT_BASE_URL = loadFacadeModule()["SGLANG_DEFAULT_BASE_URL"];
const SGLANG_MODEL_PLACEHOLDER = loadFacadeModule()["SGLANG_MODEL_PLACEHOLDER"];
const SGLANG_PROVIDER_LABEL = loadFacadeModule()["SGLANG_PROVIDER_LABEL"];
//#endregion
export { SGLANG_DEFAULT_API_KEY_ENV_VAR, SGLANG_DEFAULT_BASE_URL, SGLANG_MODEL_PLACEHOLDER, SGLANG_PROVIDER_LABEL, buildSglangProvider };
