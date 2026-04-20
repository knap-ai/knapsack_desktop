import { s as normalizeOptionalString } from "./string-coerce-BUSzWgUA.js";
import { a as loadConfig } from "./io-5pxHCi7V.js";
import { r as listChannelPlugins } from "./registry-Delpa74L.js";
import "./config-Q9XZc_2I.js";
import "./plugins-D4ODSIPT.js";
import { a as createLazyRuntimeSurface } from "./lazy-runtime-DQGYmUDC.js";
import { t as loadChannelOutboundAdapter } from "./load-BI2-MJQ7.js";
import { t as createOutboundSendDepsFromCliSource } from "./outbound-send-mapping-CIdafxSa.js";
//#region src/cli/send-runtime/channel-outbound-send.ts
function createChannelOutboundRuntimeSend(params) {
	return { sendMessage: async (to, text, opts = {}) => {
		const outbound = await loadChannelOutboundAdapter(params.channelId);
		if (Boolean(opts.mediaUrl) && outbound?.sendMedia) return await outbound.sendMedia({
			cfg: opts.cfg ?? loadConfig(),
			to,
			text,
			mediaUrl: opts.mediaUrl,
			mediaAccess: opts.mediaAccess,
			mediaLocalRoots: opts.mediaLocalRoots,
			mediaReadFile: opts.mediaReadFile,
			accountId: opts.accountId,
			threadId: opts.messageThreadId,
			replyToId: opts.replyToMessageId == null ? void 0 : normalizeOptionalString(String(opts.replyToMessageId)),
			silent: opts.silent,
			forceDocument: opts.forceDocument,
			gifPlayback: opts.gifPlayback,
			gatewayClientScopes: opts.gatewayClientScopes
		});
		if (!outbound?.sendText) throw new Error(params.unavailableMessage);
		return await outbound.sendText({
			cfg: opts.cfg ?? loadConfig(),
			to,
			text,
			mediaUrl: opts.mediaUrl,
			mediaAccess: opts.mediaAccess,
			mediaLocalRoots: opts.mediaLocalRoots,
			mediaReadFile: opts.mediaReadFile,
			accountId: opts.accountId,
			threadId: opts.messageThreadId,
			replyToId: opts.replyToMessageId == null ? void 0 : normalizeOptionalString(String(opts.replyToMessageId)),
			silent: opts.silent,
			forceDocument: opts.forceDocument,
			gifPlayback: opts.gifPlayback,
			gatewayClientScopes: opts.gatewayClientScopes
		});
	} };
}
//#endregion
//#region src/cli/deps.ts
const senderCache = /* @__PURE__ */ new Map();
/**
* Create a lazy-loading send function proxy for a channel.
* The channel's module is loaded on first call and cached for reuse.
*/
function createLazySender(channelId, loader) {
	const loadRuntimeSend = createLazyRuntimeSurface(loader, ({ runtimeSend }) => runtimeSend);
	return async (...args) => {
		let cached = senderCache.get(channelId);
		if (!cached) {
			cached = loadRuntimeSend();
			senderCache.set(channelId, cached);
		}
		return await (await cached).sendMessage(...args);
	};
}
function createDefaultDeps() {
	const deps = {};
	for (const plugin of listChannelPlugins()) deps[plugin.id] = createLazySender(plugin.id, async () => ({ runtimeSend: createChannelOutboundRuntimeSend({
		channelId: plugin.id,
		unavailableMessage: `${plugin.meta.label ?? plugin.id} outbound adapter is unavailable.`
	}) }));
	return deps;
}
function createOutboundSendDeps(deps) {
	return createOutboundSendDepsFromCliSource(deps);
}
//#endregion
export { createOutboundSendDeps as n, createDefaultDeps as t };
