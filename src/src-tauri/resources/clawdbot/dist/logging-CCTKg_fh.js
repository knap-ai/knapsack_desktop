import { o as displayPath } from "./utils-CS0Ikux6.js";
import { i as createConfigIO } from "./io-y3Az_Onx.js";
//#region src/config/logging.ts
function formatConfigPath(path = createConfigIO().configPath) {
	return displayPath(path);
}
function logConfigUpdated(runtime, opts = {}) {
	const path = formatConfigPath(opts.path ?? createConfigIO().configPath);
	const suffix = opts.suffix ? ` ${opts.suffix}` : "";
	runtime.log(`Updated ${path}${suffix}`);
}
//#endregion
export { logConfigUpdated as n, formatConfigPath as t };
