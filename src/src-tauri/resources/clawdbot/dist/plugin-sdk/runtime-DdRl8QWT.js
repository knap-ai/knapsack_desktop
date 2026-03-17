import { format } from "node:util";
//#region src/plugin-sdk/runtime.ts
function createLoggerBackedRuntime(params) {
	return {
		log: (...args) => {
			params.logger.info(format(...args));
		},
		error: (...args) => {
			params.logger.error(format(...args));
		},
		exit: (code) => {
			throw params.exitError?.(code) ?? /* @__PURE__ */ new Error(`exit ${code}`);
		}
	};
}
function resolveRuntimeEnv(params) {
	return params.runtime ?? createLoggerBackedRuntime(params);
}
function resolveRuntimeEnvWithUnavailableExit(params) {
	return resolveRuntimeEnv({
		runtime: params.runtime,
		logger: params.logger,
		exitError: () => new Error(params.unavailableMessage ?? "Runtime exit not available")
	});
}
//#endregion
export { resolveRuntimeEnv as n, resolveRuntimeEnvWithUnavailableExit as r, createLoggerBackedRuntime as t };
