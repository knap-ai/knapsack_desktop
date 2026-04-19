import { t as __exportAll } from "./rolldown-runtime-DUslC3ob.js";
import { i as setMatrixConsoleLogging, n as LogService, t as ConsoleLogger } from "./logger-C5fFucd6.js";
import { logger } from "matrix-js-sdk/lib/logger.js";
//#region extensions/matrix/src/matrix/client/logging.ts
var logging_exports = /* @__PURE__ */ __exportAll({
	createMatrixJsSdkClientLogger: () => createMatrixJsSdkClientLogger,
	ensureMatrixSdkLoggingConfigured: () => ensureMatrixSdkLoggingConfigured,
	setMatrixSdkConsoleLogging: () => setMatrixSdkConsoleLogging,
	setMatrixSdkLogMode: () => setMatrixSdkLogMode
});
let matrixSdkLoggingConfigured = false;
let matrixSdkLogMode = "default";
const matrixSdkBaseLogger = new ConsoleLogger();
const matrixSdkSilentMethodFactory = () => () => {};
let matrixSdkRootMethodFactory;
let matrixSdkRootLoggerInitialized = false;
function shouldSuppressMatrixHttpNotFound(module, messageOrObject) {
	if (!module.includes("MatrixHttpClient")) return false;
	return messageOrObject.some((entry) => {
		if (!entry || typeof entry !== "object") return false;
		return entry.errcode === "M_NOT_FOUND";
	});
}
function ensureMatrixSdkLoggingConfigured() {
	if (!matrixSdkLoggingConfigured) matrixSdkLoggingConfigured = true;
	applyMatrixSdkLogger();
}
function setMatrixSdkLogMode(mode) {
	matrixSdkLogMode = mode;
	if (!matrixSdkLoggingConfigured) return;
	applyMatrixSdkLogger();
}
function setMatrixSdkConsoleLogging(enabled) {
	setMatrixConsoleLogging(enabled);
}
function createMatrixJsSdkClientLogger(prefix = "matrix") {
	return createMatrixJsSdkLoggerInstance(prefix);
}
function applyMatrixJsSdkRootLoggerMode() {
	const rootLogger = logger;
	if (!matrixSdkRootLoggerInitialized) {
		matrixSdkRootMethodFactory = rootLogger.methodFactory;
		matrixSdkRootLoggerInitialized = true;
	}
	rootLogger.methodFactory = matrixSdkLogMode === "quiet" ? matrixSdkSilentMethodFactory : matrixSdkRootMethodFactory;
	rootLogger.rebuild?.();
}
function applyMatrixSdkLogger() {
	applyMatrixJsSdkRootLoggerMode();
	if (matrixSdkLogMode === "quiet") {
		LogService.setLogger({
			trace: () => {},
			debug: () => {},
			info: () => {},
			warn: () => {},
			error: () => {}
		});
		return;
	}
	LogService.setLogger({
		trace: (module, ...messageOrObject) => matrixSdkBaseLogger.trace(module, ...messageOrObject),
		debug: (module, ...messageOrObject) => matrixSdkBaseLogger.debug(module, ...messageOrObject),
		info: (module, ...messageOrObject) => matrixSdkBaseLogger.info(module, ...messageOrObject),
		warn: (module, ...messageOrObject) => matrixSdkBaseLogger.warn(module, ...messageOrObject),
		error: (module, ...messageOrObject) => {
			if (shouldSuppressMatrixHttpNotFound(module, messageOrObject)) return;
			matrixSdkBaseLogger.error(module, ...messageOrObject);
		}
	});
}
function createMatrixJsSdkLoggerInstance(prefix) {
	const log = (method, ...messageOrObject) => {
		if (matrixSdkLogMode === "quiet") return;
		matrixSdkBaseLogger[method](prefix, ...messageOrObject);
	};
	return {
		trace: (...messageOrObject) => log("trace", ...messageOrObject),
		debug: (...messageOrObject) => log("debug", ...messageOrObject),
		info: (...messageOrObject) => log("info", ...messageOrObject),
		warn: (...messageOrObject) => log("warn", ...messageOrObject),
		error: (...messageOrObject) => {
			if (shouldSuppressMatrixHttpNotFound(prefix, messageOrObject)) return;
			log("error", ...messageOrObject);
		},
		getChild: (namespace) => {
			const nextNamespace = namespace.trim();
			return createMatrixJsSdkLoggerInstance(nextNamespace ? `${prefix}.${nextNamespace}` : prefix);
		}
	};
}
//#endregion
export { setMatrixSdkLogMode as i, logging_exports as n, setMatrixSdkConsoleLogging as r, createMatrixJsSdkClientLogger as t };
