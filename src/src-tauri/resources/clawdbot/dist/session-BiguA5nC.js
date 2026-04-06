//#region src/channels/session.ts
let inboundSessionRuntimePromise = null;
function loadInboundSessionRuntime() {
	inboundSessionRuntimePromise ??= import("./inbound.runtime-Cxl5R4Wx.js");
	return inboundSessionRuntimePromise;
}
function normalizeSessionStoreKey(sessionKey) {
	return sessionKey.trim().toLowerCase();
}
function shouldSkipPinnedMainDmRouteUpdate(pin) {
	if (!pin) return false;
	const owner = pin.ownerRecipient.trim().toLowerCase();
	const sender = pin.senderRecipient.trim().toLowerCase();
	if (!owner || !sender || owner === sender) return false;
	pin.onSkip?.({
		ownerRecipient: pin.ownerRecipient,
		senderRecipient: pin.senderRecipient
	});
	return true;
}
async function recordInboundSession(params) {
	const { storePath, sessionKey, ctx, groupResolution, createIfMissing } = params;
	const canonicalSessionKey = normalizeSessionStoreKey(sessionKey);
	const runtime = await loadInboundSessionRuntime();
	runtime.recordSessionMetaFromInbound({
		storePath,
		sessionKey: canonicalSessionKey,
		ctx,
		groupResolution,
		createIfMissing
	}).catch(params.onRecordError);
	const update = params.updateLastRoute;
	if (!update) return;
	if (shouldSkipPinnedMainDmRouteUpdate(update.mainDmOwnerPin)) return;
	const targetSessionKey = normalizeSessionStoreKey(update.sessionKey);
	await runtime.updateLastRoute({
		storePath,
		sessionKey: targetSessionKey,
		deliveryContext: {
			channel: update.channel,
			to: update.to,
			accountId: update.accountId,
			threadId: update.threadId
		},
		ctx: targetSessionKey === canonicalSessionKey ? ctx : void 0,
		groupResolution
	});
}
//#endregion
export { recordInboundSession as t };
