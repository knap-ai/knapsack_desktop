import { a as loadConfig } from "./io-5pxHCi7V.js";
import "./store-DFXcceZJ.js";
import { i as resolveMainSessionKey } from "./main-session-DtefsIzj.js";
import { u as resolveStorePath } from "./paths-CZMxg3hs.js";
import "./reset-CkBotYFL.js";
import "./session-key-DhT_3w6M.js";
import { t as deliveryContextFromSession } from "./delivery-context.shared-EClQPjt-.js";
import { t as loadSessionStore } from "./store-load-DjLNEIy9.js";
import "./session-file-B_37cdL1.js";
import { t as parseSessionThreadInfo } from "./thread-info-DA0w7q1W.js";
import "./transcript-BYlhLemN.js";
import "./targets-Cxfatkj9.js";
//#region src/config/sessions/main-session.runtime.ts
function resolveMainSessionKeyFromConfig() {
	return resolveMainSessionKey(loadConfig());
}
//#endregion
//#region src/config/sessions/delivery-info.ts
function extractDeliveryInfo(sessionKey) {
	const hasRoutableDeliveryContext = (context) => Boolean(context?.channel && context?.to);
	const { baseSessionKey, threadId } = parseSessionThreadInfo(sessionKey);
	if (!sessionKey || !baseSessionKey) return {
		deliveryContext: void 0,
		threadId
	};
	let deliveryContext;
	try {
		const store = loadSessionStore(resolveStorePath(loadConfig().session?.store));
		let entry = store[sessionKey];
		let storedDeliveryContext = deliveryContextFromSession(entry);
		if (!hasRoutableDeliveryContext(storedDeliveryContext) && baseSessionKey !== sessionKey) {
			entry = store[baseSessionKey];
			storedDeliveryContext = deliveryContextFromSession(entry);
		}
		if (hasRoutableDeliveryContext(storedDeliveryContext)) deliveryContext = {
			channel: storedDeliveryContext.channel,
			to: storedDeliveryContext.to,
			accountId: storedDeliveryContext.accountId,
			threadId: storedDeliveryContext.threadId != null ? String(storedDeliveryContext.threadId) : void 0
		};
	} catch {}
	return {
		deliveryContext,
		threadId
	};
}
//#endregion
export { resolveMainSessionKeyFromConfig as n, extractDeliveryInfo as t };
