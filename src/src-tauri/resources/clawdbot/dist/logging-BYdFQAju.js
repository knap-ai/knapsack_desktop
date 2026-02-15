import { t as CONFIG_PATH } from "./paths-DVBShlw6.js";
import { o as displayPath } from "./utils-CrauP1IK.js";

//#region src/config/logging.ts
function formatConfigPath(path = CONFIG_PATH) {
	return displayPath(path);
}
function logConfigUpdated(runtime, opts = {}) {
	const path = formatConfigPath(opts.path ?? CONFIG_PATH);
	const suffix = opts.suffix ? ` ${opts.suffix}` : "";
	runtime.log(`Updated ${path}${suffix}`);
}

//#endregion
export { logConfigUpdated as n, formatConfigPath as t };