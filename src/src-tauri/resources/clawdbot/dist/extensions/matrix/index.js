import { n as registerMatrixCliMetadata } from "./cli-metadata-Y44EUHIi.js";
import { registerMatrixSubagentHooks } from "./subagent-hooks-api.js";
import { defineBundledChannelEntry } from "openclaw/plugin-sdk/channel-entry-contract";
import { formatErrorMessage } from "openclaw/plugin-sdk/error-runtime";
//#region extensions/matrix/index.ts
let matrixHandlersRuntimePromise = null;
function loadMatrixHandlersRuntimeModule() {
	matrixHandlersRuntimePromise ??= import("./plugin-entry.handlers.runtime.js");
	return matrixHandlersRuntimePromise;
}
function registerMatrixFullRuntime(api) {
	loadMatrixHandlersRuntimeModule().then(({ ensureMatrixCryptoRuntime }) => ensureMatrixCryptoRuntime({ log: api.logger.info }).catch((err) => {
		const message = formatErrorMessage(err);
		api.logger.warn?.(`matrix: crypto runtime bootstrap failed: ${message}`);
	})).catch((err) => {
		const message = formatErrorMessage(err);
		api.logger.warn?.(`matrix: failed loading crypto bootstrap runtime: ${message}`);
	});
	api.registerGatewayMethod("matrix.verify.recoveryKey", async (ctx) => {
		const { handleVerifyRecoveryKey } = await loadMatrixHandlersRuntimeModule();
		await handleVerifyRecoveryKey(ctx);
	});
	api.registerGatewayMethod("matrix.verify.bootstrap", async (ctx) => {
		const { handleVerificationBootstrap } = await loadMatrixHandlersRuntimeModule();
		await handleVerificationBootstrap(ctx);
	});
	api.registerGatewayMethod("matrix.verify.status", async (ctx) => {
		const { handleVerificationStatus } = await loadMatrixHandlersRuntimeModule();
		await handleVerificationStatus(ctx);
	});
	registerMatrixSubagentHooks(api);
}
var matrix_default = defineBundledChannelEntry({
	id: "matrix",
	name: "Matrix",
	description: "Matrix channel plugin (matrix-js-sdk)",
	importMetaUrl: import.meta.url,
	plugin: {
		specifier: "./channel-plugin-api.js",
		exportName: "matrixPlugin"
	},
	secrets: {
		specifier: "./secret-contract-api.js",
		exportName: "channelSecrets"
	},
	runtime: {
		specifier: "./runtime-setter-api.js",
		exportName: "setMatrixRuntime"
	},
	registerCliMetadata: registerMatrixCliMetadata,
	registerFull: registerMatrixFullRuntime
});
//#endregion
export { matrix_default as default, registerMatrixFullRuntime };
