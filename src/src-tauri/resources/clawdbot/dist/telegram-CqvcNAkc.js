import { c as loadConfig } from "./io-DhtVmzAJ.js";
import "./config-CJQx-9zo.js";
import { t as loadChannelOutboundAdapter } from "./load-1Moal5cB.js";
//#region src/cli/send-runtime/telegram.ts
const runtimeSend = { sendMessage: async (to, text, opts = {}) => {
	const outbound = await loadChannelOutboundAdapter("telegram");
	if (!outbound?.sendText) throw new Error("Telegram outbound adapter is unavailable.");
	return await outbound.sendText({
		cfg: opts.cfg ?? loadConfig(),
		to,
		text,
		mediaUrl: opts.mediaUrl,
		mediaLocalRoots: opts.mediaLocalRoots,
		accountId: opts.accountId,
		threadId: opts.messageThreadId,
		replyToId: opts.replyToMessageId == null ? void 0 : String(opts.replyToMessageId).trim() || void 0,
		silent: opts.silent,
		forceDocument: opts.forceDocument,
		gatewayClientScopes: opts.gatewayClientScopes
	});
} };
//#endregion
export { runtimeSend };
