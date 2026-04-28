import "./subsystem-rHhUC6qs.js";
import "./provider-env-vars-COSpaRlD.js";
import "./failover-error-DQkWPkYr.js";
import "./provider-registry-Biqw4jE7.js";
import "./runtime-shared-D5Uo5m_3.js";
import "./provider-model-shared-Bqo51Ufw.js";
import "./provider-model-defaults-DG2ADqZO.js";
//#region src/plugin-sdk/image-generation-core.ts
let imageGenerationCoreAuthRuntimePromise;
async function loadImageGenerationCoreAuthRuntime() {
	imageGenerationCoreAuthRuntimePromise ??= import("./image-generation-core.auth.runtime-CCowt9pD.js");
	return imageGenerationCoreAuthRuntimePromise;
}
async function resolveApiKeyForProvider(...args) {
	return (await loadImageGenerationCoreAuthRuntime()).resolveApiKeyForProvider(...args);
}
//#endregion
export { resolveApiKeyForProvider as t };
