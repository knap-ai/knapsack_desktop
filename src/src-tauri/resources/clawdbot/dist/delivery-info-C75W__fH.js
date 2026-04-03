import { c as loadConfig } from "./io-DhtVmzAJ.js";
import { i as loadSessionStore } from "./store-BGmy-Wot.js";
import { l as resolveStorePath } from "./paths-DBIQqSpZ.js";
import { i as resolveSessionThreadInfo } from "./session-conversation-hVzJTI-k.js";
//#region src/config/sessions/delivery-info.ts
/**
* Extract deliveryContext and threadId from a sessionKey.
* Supports generic :thread: suffixes plus plugin-owned thread/session grammars.
*/
function parseSessionThreadInfo(sessionKey) {
	return resolveSessionThreadInfo(sessionKey);
}
function extractDeliveryInfo(sessionKey) {
	const { baseSessionKey, threadId } = parseSessionThreadInfo(sessionKey);
	if (!sessionKey || !baseSessionKey) return {
		deliveryContext: void 0,
		threadId
	};
	let deliveryContext;
	try {
		const store = loadSessionStore(resolveStorePath(loadConfig().session?.store));
		let entry = store[sessionKey];
		if (!entry?.deliveryContext && baseSessionKey !== sessionKey) entry = store[baseSessionKey];
		if (entry?.deliveryContext) {
			const resolvedThreadId = entry.deliveryContext.threadId ?? entry.lastThreadId ?? entry.origin?.threadId;
			deliveryContext = {
				channel: entry.deliveryContext.channel,
				to: entry.deliveryContext.to,
				accountId: entry.deliveryContext.accountId,
				threadId: resolvedThreadId != null ? String(resolvedThreadId) : void 0
			};
		}
	} catch {}
	return {
		deliveryContext,
		threadId
	};
}
//#endregion
export { parseSessionThreadInfo as n, extractDeliveryInfo as t };
