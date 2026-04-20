import { o as normalizeWhatsAppTarget, t as isWhatsAppGroupJid } from "./normalize-target-DzehiMvp.js";
import { t as handleWhatsAppAction } from "./action-runtime-lXscyQq5.js";
import "./normalize-B4eWkoLn.js";
import { readStringOrNumberParam, readStringParam as readStringParam$1, resolveReactionMessageId } from "openclaw/plugin-sdk/channel-actions";
//#region extensions/whatsapp/src/channel-react-action.ts
const WHATSAPP_CHANNEL = "whatsapp";
async function handleWhatsAppReactAction(params) {
	if (params.action !== "react") throw new Error(`Action ${params.action} is not supported for provider ${WHATSAPP_CHANNEL}.`);
	const isWhatsAppSource = params.toolContext?.currentChannelProvider === WHATSAPP_CHANNEL;
	const explicitTarget = readStringParam$1(params.params, "chatJid") ?? readStringParam$1(params.params, "to");
	const normalizedTarget = explicitTarget ? normalizeWhatsAppTarget(explicitTarget) : null;
	const normalizedCurrent = isWhatsAppSource && params.toolContext?.currentChannelId ? normalizeWhatsAppTarget(params.toolContext.currentChannelId) : null;
	const isCrossChat = normalizedTarget != null && (normalizedCurrent == null || normalizedTarget !== normalizedCurrent);
	const scopedContext = !isWhatsAppSource || isCrossChat || !params.toolContext ? void 0 : {
		currentChannelId: params.toolContext.currentChannelId ?? void 0,
		currentChannelProvider: params.toolContext.currentChannelProvider ?? void 0,
		currentMessageId: params.toolContext.currentMessageId ?? void 0
	};
	const messageIdRaw = resolveReactionMessageId({
		args: params.params,
		toolContext: scopedContext
	});
	if (messageIdRaw == null) readStringParam$1(params.params, "messageId", { required: true });
	const messageId = String(messageIdRaw);
	const explicitMessageId = readStringOrNumberParam(params.params, "messageId");
	const emoji = readStringParam$1(params.params, "emoji", { allowEmpty: true });
	const remove = typeof params.params.remove === "boolean" ? params.params.remove : void 0;
	const explicitParticipant = readStringParam$1(params.params, "participant");
	const inferredParticipant = explicitParticipant || explicitMessageId != null || !isWhatsAppSource || isCrossChat || !isWhatsAppGroupJid(explicitTarget ?? params.toolContext?.currentChannelId ?? "") ? void 0 : typeof params.requesterSenderId === "string" && params.requesterSenderId.trim().length > 0 ? params.requesterSenderId.trim() : void 0;
	return await handleWhatsAppAction({
		action: "react",
		chatJid: readStringParam$1(params.params, "chatJid") ?? readStringParam$1(params.params, "to", { required: true }),
		messageId,
		emoji,
		remove,
		participant: explicitParticipant ?? inferredParticipant,
		accountId: params.accountId ?? void 0,
		fromMe: typeof params.params.fromMe === "boolean" ? params.params.fromMe : void 0
	}, params.cfg);
}
//#endregion
export { handleWhatsAppReactAction };
