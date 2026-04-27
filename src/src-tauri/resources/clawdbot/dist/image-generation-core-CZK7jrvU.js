import "./subsystem-CWI_MDy_.js";
import "./provider-env-vars-DsK9fGJ1.js";
import "./failover-error-D72vttCv.js";
import "./provider-registry-jGQ_-hxv.js";
import "./runtime-shared-sUmrJucY.js";
import "./provider-model-shared-D-iKoymz.js";
import "./provider-model-defaults-IBbFVYjQ.js";
//#region src/plugin-sdk/image-generation-core.ts
let imageGenerationCoreAuthRuntimePromise;
async function loadImageGenerationCoreAuthRuntime() {
	imageGenerationCoreAuthRuntimePromise ??= import("./image-generation-core.auth.runtime-02LC6TnV.js");
	return imageGenerationCoreAuthRuntimePromise;
}
async function resolveApiKeyForProvider(...args) {
	return (await loadImageGenerationCoreAuthRuntime()).resolveApiKeyForProvider(...args);
}
//#endregion
export { resolveApiKeyForProvider as t };
