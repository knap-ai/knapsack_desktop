import { i as normalizeLowercaseStringOrEmpty } from "./string-coerce-BUSzWgUA.js";
import { r as normalizeCommandBody } from "./commands-registry-normalize-By3bcvJy.js";
import { o as stripMentions } from "./mentions-DXpYnKaK.js";
import { t as resolveCommandAuthorization } from "./command-auth-C4VasUjw.js";
//#region src/auto-reply/reply/commands-context.ts
function buildCommandContext(params) {
	const { ctx, cfg, agentId, sessionKey, isGroup, triggerBodyNormalized } = params;
	const auth = resolveCommandAuthorization({
		ctx,
		cfg,
		commandAuthorized: params.commandAuthorized
	});
	const surface = normalizeLowercaseStringOrEmpty(ctx.Surface ?? ctx.Provider);
	const channel = normalizeLowercaseStringOrEmpty(ctx.Provider ?? surface);
	const abortKey = sessionKey ?? (auth.from || void 0) ?? (auth.to || void 0);
	const rawBodyNormalized = triggerBodyNormalized;
	const commandBodyNormalized = normalizeCommandBody(isGroup ? stripMentions(rawBodyNormalized, ctx, cfg, agentId) : rawBodyNormalized, { botUsername: ctx.BotUsername });
	return {
		surface,
		channel,
		channelId: auth.providerId,
		ownerList: auth.ownerList,
		senderIsOwner: auth.senderIsOwner,
		isAuthorizedSender: auth.isAuthorizedSender,
		senderId: auth.senderId,
		abortKey,
		rawBodyNormalized,
		commandBodyNormalized,
		from: auth.from,
		to: auth.to
	};
}
//#endregion
export { buildCommandContext as t };
