import { o as normalizeOptionalLowercaseString } from "./string-coerce-BUSzWgUA.js";
import { t as getBootstrapChannelPlugin } from "./bootstrap-registry-BI6Zdzz5.js";
//#region src/media/channel-inbound-roots.ts
function findChannelMessagingAdapter(channelId) {
	const normalized = normalizeOptionalLowercaseString(channelId);
	if (!normalized) return;
	return getBootstrapChannelPlugin(normalized)?.messaging;
}
function resolveChannelInboundAttachmentRoots(params) {
	return findChannelMessagingAdapter(params.ctx.Surface ?? params.ctx.Provider)?.resolveInboundAttachmentRoots?.({
		cfg: params.cfg,
		accountId: params.ctx.AccountId
	});
}
function resolveChannelRemoteInboundAttachmentRoots(params) {
	return findChannelMessagingAdapter(params.ctx.Surface ?? params.ctx.Provider)?.resolveRemoteInboundAttachmentRoots?.({
		cfg: params.cfg,
		accountId: params.ctx.AccountId
	});
}
//#endregion
export { resolveChannelRemoteInboundAttachmentRoots as n, resolveChannelInboundAttachmentRoots as t };
