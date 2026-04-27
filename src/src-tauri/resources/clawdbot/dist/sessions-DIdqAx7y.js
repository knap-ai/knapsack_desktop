import { a as loadConfig } from "./io-Dv_xNAZB.js";
import { i as resolveMainSessionKey } from "./main-session-BzfGEj6I.js";
import "./combined-store-gateway-qDHoxMjQ.js";
import { u as resolveStorePath } from "./paths-DvU8Tgvw.js";
import { t as deliveryContextFromSession } from "./delivery-context.shared-BRwSoIeK.js";
import { t as loadSessionStore } from "./store-load-Cf3NDflc.js";
import "./targets-Cz0qesGF.js";
import "./store-Bm25Mivo.js";
import "./reset-BjF1l1uy.js";
import "./session-key-BKBHc44r.js";
import "./transcript-C5WPUIcy.js";
import { t as parseSessionThreadInfo } from "./thread-info-c05DuncS.js";
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
