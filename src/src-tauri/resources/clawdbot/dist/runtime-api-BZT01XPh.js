import "./core-Dh0sB0kj.js";
import "./ssrf-runtime-CmuKDV7X.js";
import "./browser-security-runtime-DCYxvSMK.js";
import { format } from "node:util";
//#region extensions/tlon/src/logger-runtime.ts
function createLoggerBackedRuntime(params) {
	return {
		log: (...args) => {
			params.logger.info(format(...args));
		},
		error: (...args) => {
			params.logger.error(format(...args));
		},
		writeStdout: (value) => {
			params.logger.info(value);
		},
		writeJson: (value, space = 2) => {
			params.logger.info(JSON.stringify(value, null, space > 0 ? space : void 0));
		},
		exit: (code) => {
			throw params.exitError?.(code) ?? /* @__PURE__ */ new Error(`exit ${code}`);
		}
	};
}
//#endregion
export { createLoggerBackedRuntime as t };
