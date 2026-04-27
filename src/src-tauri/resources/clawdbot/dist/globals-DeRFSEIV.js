import { S as isVerbose, a as getLogger, s as isFileLogLevelEnabled } from "./logger-x0IvPL2B.js";
import { r as theme } from "./theme-BrRleVfL.js";
//#region src/globals.ts
function shouldLogVerbose() {
	return isVerbose() || isFileLogLevelEnabled("debug");
}
function logVerbose(message) {
	if (!shouldLogVerbose()) return;
	try {
		getLogger().debug({ message }, "verbose");
	} catch {}
	if (!isVerbose()) return;
	console.log(theme.muted(message));
}
function logVerboseConsole(message) {
	if (!isVerbose()) return;
	console.log(theme.muted(message));
}
const success = theme.success;
const warn = theme.warn;
const info = theme.info;
const danger = theme.error;
//#endregion
export { shouldLogVerbose as a, logVerboseConsole as i, info as n, success as o, logVerbose as r, warn as s, danger as t };
