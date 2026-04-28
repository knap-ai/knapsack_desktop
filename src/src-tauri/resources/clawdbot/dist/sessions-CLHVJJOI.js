import { i as getRuntimeConfig } from "./io-CFdEhZuM.js";
import { i as resolveMainSessionKey } from "./main-session-JXLAAy4Q.js";
import "./combined-store-gateway-IXcczRzK.js";
import { u as resolveStorePath } from "./paths-CHP3g1Fg.js";
import { t as deliveryContextFromSession } from "./delivery-context.shared-Bmv0a_G3.js";
import { t as loadSessionStore } from "./store-load-DLuD4etm.js";
import "./targets-DHc_LF06.js";
import "./store-CR7YmZjp.js";
import "./lifecycle-B32KazD3.js";
import "./reset-BUTJ832C.js";
import "./session-key-CnzoH8Iz.js";
import "./transcript-BhP11178.js";
import { t as parseSessionThreadInfo } from "./thread-info-Dl1e71Qh.js";
//#region src/config/sessions/main-session.runtime.ts
function resolveMainSessionKeyFromConfig() {
	return resolveMainSessionKey(getRuntimeConfig());
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
		const store = loadSessionStore(resolveStorePath(getRuntimeConfig().session?.store));
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
