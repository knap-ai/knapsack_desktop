import "./accounts-DgAsOTS-.js";
import { i as normalizeWhatsAppAllowFromEntries } from "./normalize-target-DzehiMvp.js";
import { resolveChannelGroupRequireMention, resolveChannelGroupToolsPolicy } from "openclaw/plugin-sdk/channel-policy";
//#region extensions/whatsapp/src/config-accessors.ts
function formatWhatsAppConfigAllowFromEntries(allowFrom) {
	return normalizeWhatsAppAllowFromEntries(allowFrom);
}
//#endregion
//#region extensions/whatsapp/src/group-intro.ts
const WHATSAPP_GROUP_INTRO_HINT = "WhatsApp IDs: SenderId is the participant JID (group participant id).";
function resolveWhatsAppGroupIntroHint() {
	return WHATSAPP_GROUP_INTRO_HINT;
}
function resolveWhatsAppMentionStripRegexes(ctx) {
	const selfE164 = (ctx.To ?? "").replace(/^whatsapp:/i, "");
	if (!selfE164) return [];
	const escaped = selfE164.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
	return [new RegExp(escaped, "g"), new RegExp(`@${escaped}`, "g")];
}
//#endregion
//#region extensions/whatsapp/src/group-policy.ts
function resolveWhatsAppGroupRequireMention(params) {
	return resolveChannelGroupRequireMention({
		cfg: params.cfg,
		channel: "whatsapp",
		groupId: params.groupId,
		accountId: params.accountId
	});
}
function resolveWhatsAppGroupToolPolicy(params) {
	return resolveChannelGroupToolsPolicy({
		cfg: params.cfg,
		channel: "whatsapp",
		groupId: params.groupId,
		accountId: params.accountId,
		senderId: params.senderId,
		senderName: params.senderName,
		senderUsername: params.senderUsername,
		senderE164: params.senderE164
	});
}
//#endregion
export { formatWhatsAppConfigAllowFromEntries as a, resolveWhatsAppMentionStripRegexes as i, resolveWhatsAppGroupToolPolicy as n, resolveWhatsAppGroupIntroHint as r, resolveWhatsAppGroupRequireMention as t };
