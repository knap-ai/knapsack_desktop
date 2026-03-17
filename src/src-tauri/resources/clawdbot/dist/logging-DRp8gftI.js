import { t as __exportAll } from "./rolldown-runtime-DUslC3ob.js";
import { Ag as createConfigIO } from "./auth-profiles-DRjqKE3G.js";
import { a as displayPath } from "./utils-B88a096J.js";
//#region src/config/logging.ts
var logging_exports = /* @__PURE__ */ __exportAll({
	formatConfigPath: () => formatConfigPath,
	logConfigUpdated: () => logConfigUpdated
});
function formatConfigPath(path = createConfigIO().configPath) {
	return displayPath(path);
}
function logConfigUpdated(runtime, opts = {}) {
	const path = formatConfigPath(opts.path ?? createConfigIO().configPath);
	const suffix = opts.suffix ? ` ${opts.suffix}` : "";
	runtime.log(`Updated ${path}${suffix}`);
}
//#endregion
export { logConfigUpdated as n, logging_exports as r, formatConfigPath as t };
