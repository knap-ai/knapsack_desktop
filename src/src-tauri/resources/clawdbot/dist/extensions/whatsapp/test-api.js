import { t as resolveWhatsAppOutboundTarget } from "./resolve-outbound-target-CbM5UJum.js";
import { n as sendPollWhatsApp } from "./send-RylHu2jU.js";
import { r as WHATSAPP_LEGACY_OUTBOUND_SEND_DEP_KEYS } from "./heartbeat-recipients-DZfPzRUS.js";
import "./runtime-api-vb71a5Kp.js";
import { t as resolveWhatsAppRuntimeGroupPolicy } from "./runtime-group-policy-Brit1ZJQ.js";
import { shouldLogVerbose } from "openclaw/plugin-sdk/runtime-env";
import { createAttachedChannelResultAdapter, createEmptyChannelResult } from "openclaw/plugin-sdk/channel-send-result";
import { chunkText } from "openclaw/plugin-sdk/reply-runtime";
import { resolveSendableOutboundReplyParts, sendTextMediaPayload } from "openclaw/plugin-sdk/reply-payload";
import { resolveOutboundSendDep, sanitizeForPlainText } from "openclaw/plugin-sdk/outbound-runtime";
//#region extensions/whatsapp/src/outbound-adapter.ts
function trimLeadingWhitespace(text) {
	return text?.trimStart() ?? "";
}
const whatsappOutbound = {
	deliveryMode: "gateway",
	chunker: chunkText,
	chunkerMode: "text",
	textChunkLimit: 4e3,
	sanitizeText: ({ text }) => sanitizeForPlainText(text),
	pollMaxOptions: 12,
	resolveTarget: ({ to, allowFrom, mode }) => resolveWhatsAppOutboundTarget({
		to,
		allowFrom,
		mode
	}),
	sendPayload: async (ctx) => {
		const text = trimLeadingWhitespace(ctx.payload.text);
		const hasMedia = resolveSendableOutboundReplyParts(ctx.payload).hasMedia;
		if (!text && !hasMedia) return createEmptyChannelResult("whatsapp");
		return await sendTextMediaPayload({
			channel: "whatsapp",
			ctx: {
				...ctx,
				payload: {
					...ctx.payload,
					text
				}
			},
			adapter: whatsappOutbound
		});
	},
	...createAttachedChannelResultAdapter({
		channel: "whatsapp",
		sendText: async ({ cfg, to, text, accountId, deps, gifPlayback }) => {
			const normalizedText = trimLeadingWhitespace(text);
			if (!normalizedText) return createEmptyChannelResult("whatsapp");
			return await (resolveOutboundSendDep(deps, "whatsapp", { legacyKeys: WHATSAPP_LEGACY_OUTBOUND_SEND_DEP_KEYS }) ?? (await import("./send-RylHu2jU.js").then((n) => n.i)).sendMessageWhatsApp)(to, normalizedText, {
				verbose: false,
				cfg,
				accountId: accountId ?? void 0,
				gifPlayback
			});
		},
		sendMedia: async ({ cfg, to, text, mediaUrl, mediaLocalRoots, mediaReadFile, accountId, deps, gifPlayback }) => {
			const normalizedText = trimLeadingWhitespace(text);
			return await (resolveOutboundSendDep(deps, "whatsapp", { legacyKeys: WHATSAPP_LEGACY_OUTBOUND_SEND_DEP_KEYS }) ?? (await import("./send-RylHu2jU.js").then((n) => n.i)).sendMessageWhatsApp)(to, normalizedText, {
				verbose: false,
				cfg,
				mediaUrl,
				mediaLocalRoots,
				mediaReadFile,
				accountId: accountId ?? void 0,
				gifPlayback
			});
		},
		sendPoll: async ({ cfg, to, poll, accountId }) => await sendPollWhatsApp(to, poll, {
			verbose: shouldLogVerbose(),
			accountId: accountId ?? void 0,
			cfg
		})
	})
};
//#endregion
export { resolveWhatsAppRuntimeGroupPolicy, whatsappOutbound };
