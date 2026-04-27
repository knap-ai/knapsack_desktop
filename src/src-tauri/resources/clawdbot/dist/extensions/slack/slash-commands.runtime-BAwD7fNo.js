import { buildCommandTextFromArgs as buildCommandTextFromArgs$1, findCommandByNativeName as findCommandByNativeName$1, listNativeCommandSpecsForConfig as listNativeCommandSpecsForConfig$1, parseCommandArgs as parseCommandArgs$1, resolveCommandArgMenu as resolveCommandArgMenu$1 } from "openclaw/plugin-sdk/command-auth";
//#region extensions/slack/src/monitor/slash-commands.runtime.ts
function buildCommandTextFromArgs(...args) {
	return buildCommandTextFromArgs$1(...args);
}
function findCommandByNativeName(...args) {
	return findCommandByNativeName$1(...args);
}
function listNativeCommandSpecsForConfig(...args) {
	return listNativeCommandSpecsForConfig$1(...args);
}
function parseCommandArgs(...args) {
	return parseCommandArgs$1(...args);
}
function resolveCommandArgMenu(...args) {
	return resolveCommandArgMenu$1(...args);
}
//#endregion
export { buildCommandTextFromArgs, findCommandByNativeName, listNativeCommandSpecsForConfig, parseCommandArgs, resolveCommandArgMenu };
