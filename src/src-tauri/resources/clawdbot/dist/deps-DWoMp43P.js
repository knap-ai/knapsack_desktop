import { c as normalizeOptionalString } from "./string-coerce-C1IzJjqi.js";
import { a as loadConfig } from "./io-Dv_xNAZB.js";
import { r as listChannelPlugins } from "./registry-B2TRwbJD.js";
import "./config-yDDhhyz6.js";
import "./plugins-BZ_I3cWH.js";
import { a as createLazyRuntimeSurface } from "./lazy-runtime-BxcSgm-I.js";
import { t as loadChannelOutboundAdapter } from "./load-DDBpMLL3.js";
import { t as createOutboundSendDepsFromCliSource } from "./outbound-send-mapping-BvR2CHvm.js";
//#region src/cli/send-runtime/channel-outbound-send.ts
function resolveRuntimeThreadId(opts) {
	return opts.messageThreadId ?? opts.threadId ?? opts.threadTs ?? void 0;
}
function resolveRuntimeReplyToId(opts) {
	const raw = opts.replyToMessageId ?? opts.replyToId;
	return raw == null ? void 0 : normalizeOptionalString(String(raw));
}
function createChannelOutboundRuntimeSend(params) {
	return { sendMessage: async (to, text, opts = {}) => {
		const outbound = await loadChannelOutboundAdapter(params.channelId);
		const threadId = resolveRuntimeThreadId(opts);
		const replyToId = resolveRuntimeReplyToId(opts);
		const buildContext = () => ({
			cfg: opts.cfg ?? loadConfig(),
			to,
			text,
			mediaUrl: opts.mediaUrl,
			mediaAccess: opts.mediaAccess,
			mediaLocalRoots: opts.mediaLocalRoots,
			mediaReadFile: opts.mediaReadFile,
			accountId: opts.accountId,
			threadId,
			replyToId,
			silent: opts.silent,
			forceDocument: opts.forceDocument,
			gifPlayback: opts.gifPlayback,
			gatewayClientScopes: opts.gatewayClientScopes
		});
		if (Boolean(opts.mediaUrl) && outbound?.sendMedia) return await outbound.sendMedia(buildContext());
		if (!outbound?.sendText) throw new Error(params.unavailableMessage);
		return await outbound.sendText(buildContext());
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
