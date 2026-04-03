import { i as defineChannelPluginEntry } from "../../core-BghMcc08.js";
import { n as setMatrixRuntime } from "../../runtime-Jdij2_G2.js";
import { t as matrixPlugin } from "../../channel-B52ideVB.js";
//#region extensions/matrix/index.ts
var matrix_default = defineChannelPluginEntry({
	id: "matrix",
	name: "Matrix",
	description: "Matrix channel plugin (matrix-js-sdk)",
	plugin: matrixPlugin,
	setRuntime: setMatrixRuntime,
	registerCliMetadata(api) {
		api.registerCli(async ({ program }) => {
			const { registerMatrixCli } = await import("../../cli-B3o-_i9s.js");
			registerMatrixCli({ program });
		}, { descriptors: [{
			name: "matrix",
			description: "Manage Matrix accounts, verification, devices, and profile state",
			hasSubcommands: true
		}] });
	},
	registerFull(api) {
		import("../../plugin-entry.runtime-CYIqd2V2.js").then(({ ensureMatrixCryptoRuntime }) => ensureMatrixCryptoRuntime({ log: api.logger.info }).catch((err) => {
			const message = err instanceof Error ? err.message : String(err);
			api.logger.warn?.(`matrix: crypto runtime bootstrap failed: ${message}`);
		})).catch((err) => {
			const message = err instanceof Error ? err.message : String(err);
			api.logger.warn?.(`matrix: failed loading crypto bootstrap runtime: ${message}`);
		});
		api.registerGatewayMethod("matrix.verify.recoveryKey", async (ctx) => {
			const { handleVerifyRecoveryKey } = await import("../../plugin-entry.runtime-CYIqd2V2.js");
			await handleVerifyRecoveryKey(ctx);
		});
		api.registerGatewayMethod("matrix.verify.bootstrap", async (ctx) => {
			const { handleVerificationBootstrap } = await import("../../plugin-entry.runtime-CYIqd2V2.js");
			await handleVerificationBootstrap(ctx);
		});
		api.registerGatewayMethod("matrix.verify.status", async (ctx) => {
			const { handleVerificationStatus } = await import("../../plugin-entry.runtime-CYIqd2V2.js");
			await handleVerificationStatus(ctx);
		});
	}
});
//#endregion
export { matrix_default as default, matrixPlugin, setMatrixRuntime };
