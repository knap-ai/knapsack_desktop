import { p as normalizeCommandBody } from "./commands-registry-dA2_ExHR.js";
import { o as stripMentions } from "./mentions-Bfkn0E5p.js";
import { t as resolveCommandAuthorization } from "./command-auth-BeHp6PUO.js";
//#region src/auto-reply/reply/commands-context.ts
function buildCommandContext(params) {
	const { ctx, cfg, agentId, sessionKey, isGroup, triggerBodyNormalized } = params;
	const auth = resolveCommandAuthorization({
		ctx,
		cfg,
		commandAuthorized: params.commandAuthorized
	});
	const surface = (ctx.Surface ?? ctx.Provider ?? "").trim().toLowerCase();
	const channel = (ctx.Provider ?? surface).trim().toLowerCase();
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
