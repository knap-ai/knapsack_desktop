import { l as escapeRegExp } from "./utils-CE3P21nG.js";
import { t as resolveOutboundSendDep } from "./send-deps-DLS-OK3u.js";
import { i as createAttachedChannelResultAdapter } from "./channel-send-result-COXGPSxL.js";
//#region src/channels/plugins/whatsapp-shared.ts
const WHATSAPP_GROUP_INTRO_HINT = "WhatsApp IDs: SenderId is the participant JID (group participant id).";
function resolveWhatsAppGroupIntroHint() {
	return WHATSAPP_GROUP_INTRO_HINT;
}
function resolveWhatsAppMentionStripRegexes(ctx) {
	const selfE164 = (ctx.To ?? "").replace(/^whatsapp:/, "");
	if (!selfE164) return [];
	const escaped = escapeRegExp(selfE164);
	return [new RegExp(escaped, "g"), new RegExp(`@${escaped}`, "g")];
}
function createWhatsAppOutboundBase({ chunker, sendMessageWhatsApp, sendPollWhatsApp, shouldLogVerbose, resolveTarget, normalizeText = (text) => text ?? "", skipEmptyText = false }) {
	return {
		deliveryMode: "gateway",
		chunker,
		chunkerMode: "text",
		textChunkLimit: 4e3,
		pollMaxOptions: 12,
		resolveTarget,
		...createAttachedChannelResultAdapter({
			channel: "whatsapp",
			sendText: async ({ cfg, to, text, accountId, deps, gifPlayback }) => {
				const normalizedText = normalizeText(text);
				if (skipEmptyText && !normalizedText) return { messageId: "" };
				return await (resolveOutboundSendDep(deps, "whatsapp") ?? sendMessageWhatsApp)(to, normalizedText, {
					verbose: false,
					cfg,
					accountId: accountId ?? void 0,
					gifPlayback
				});
			},
			sendMedia: async ({ cfg, to, text, mediaUrl, mediaAccess, mediaLocalRoots, mediaReadFile, accountId, deps, gifPlayback }) => {
				return await (resolveOutboundSendDep(deps, "whatsapp") ?? sendMessageWhatsApp)(to, normalizeText(text), {
					verbose: false,
					cfg,
					mediaUrl,
					mediaAccess,
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
}
//#endregion
export { resolveWhatsAppGroupIntroHint as n, resolveWhatsAppMentionStripRegexes as r, createWhatsAppOutboundBase as t };
