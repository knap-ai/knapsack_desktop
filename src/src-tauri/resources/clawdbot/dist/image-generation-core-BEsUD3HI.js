import "./subsystem-Cgmckbux.js";
import "./provider-env-vars-Sj-BhOn9.js";
import "./failover-error-CqpA2cGv.js";
import "./provider-registry-BdnOpUiG.js";
import "./runtime-shared-r36k9q42.js";
import "./provider-model-shared-DyDnBaDe.js";
import "./provider-model-defaults-do_BdIZh.js";
//#region src/plugin-sdk/image-generation-core.ts
let imageGenerationCoreAuthRuntimePromise;
async function loadImageGenerationCoreAuthRuntime() {
	imageGenerationCoreAuthRuntimePromise ??= import("./image-generation-core.auth.runtime-C6YgBXT6.js");
	return imageGenerationCoreAuthRuntimePromise;
}
async function resolveApiKeyForProvider(...args) {
	return (await loadImageGenerationCoreAuthRuntime()).resolveApiKeyForProvider(...args);
}
//#endregion
export { resolveApiKeyForProvider as t };
