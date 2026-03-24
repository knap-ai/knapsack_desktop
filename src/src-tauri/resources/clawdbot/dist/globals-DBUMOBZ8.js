import { a as getLogger, s as isFileLogLevelEnabled } from "./logger-kwZIqwuw.js";
import { r as theme } from "./theme-CdOoMzRk.js";
//#region src/globals.ts
let globalVerbose = false;
let globalYes = false;
function setVerbose(v) {
	globalVerbose = v;
}
function isVerbose() {
	return globalVerbose;
}
function shouldLogVerbose() {
	return globalVerbose || isFileLogLevelEnabled("debug");
}
function logVerbose(message) {
	if (!shouldLogVerbose()) return;
	try {
		getLogger().debug({ message }, "verbose");
	} catch {}
	if (!globalVerbose) return;
	console.log(theme.muted(message));
}
function logVerboseConsole(message) {
	if (!globalVerbose) return;
	console.log(theme.muted(message));
}
function setYes(v) {
	globalYes = v;
}
function isYes() {
	return globalYes;
}
const success = theme.success;
const warn = theme.warn;
const info = theme.info;
const danger = theme.error;
//#endregion
export { logVerbose as a, setYes as c, warn as d, isYes as i, shouldLogVerbose as l, info as n, logVerboseConsole as o, isVerbose as r, setVerbose as s, danger as t, success as u };
