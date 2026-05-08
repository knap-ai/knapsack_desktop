import { t as resolveLoadedSessionThreadInfo } from "./session-thread-info-loaded-CUF2x-NX.js";
import { i as resolveSessionThreadInfo } from "./session-conversation-CdbBzqqi.js";
//#region src/config/sessions/thread-info.ts
/**
* Extract deliveryContext and threadId from a sessionKey.
* Supports generic :thread: suffixes plus plugin-owned thread/session grammars.
*/
function parseSessionThreadInfo(sessionKey) {
	return resolveSessionThreadInfo(sessionKey);
}
function parseSessionThreadInfoFast(sessionKey) {
	return resolveLoadedSessionThreadInfo(sessionKey);
}
//#endregion
export { parseSessionThreadInfoFast as n, parseSessionThreadInfo as t };
