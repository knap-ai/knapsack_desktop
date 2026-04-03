import { t as getChannelPlugin } from "./registry-fiJfPVib.js";
import "./plugins-DF32jmMU.js";
import { a as resolveIdentityName, r as resolveEffectiveMessagesConfig } from "./identity-BVAU5Jb3.js";
import { t as extractShortModelName } from "./response-prefix-template-Bz3uIAH1.js";
//#region src/channels/reply-prefix.ts
function createReplyPrefixContext(params) {
	const { cfg, agentId } = params;
	const prefixContext = { identityName: resolveIdentityName(cfg, agentId) };
	const onModelSelected = (ctx) => {
		prefixContext.provider = ctx.provider;
		prefixContext.model = extractShortModelName(ctx.model);
		prefixContext.modelFull = `${ctx.provider}/${ctx.model}`;
		prefixContext.thinkingLevel = ctx.thinkLevel ?? "off";
	};
	return {
		prefixContext,
		responsePrefix: resolveEffectiveMessagesConfig(cfg, agentId, {
			channel: params.channel,
			accountId: params.accountId
		}).responsePrefix,
		enableSlackInteractiveReplies: params.channel ? getChannelPlugin(params.channel)?.messaging?.enableInteractiveReplies?.({
			cfg,
			accountId: params.accountId
		}) ?? void 0 : void 0,
		responsePrefixContextProvider: () => prefixContext,
		onModelSelected
	};
}
function createReplyPrefixOptions(params) {
	const { responsePrefix, enableSlackInteractiveReplies, responsePrefixContextProvider, onModelSelected } = createReplyPrefixContext(params);
	return {
		responsePrefix,
		enableSlackInteractiveReplies,
		responsePrefixContextProvider,
		onModelSelected
	};
}
//#endregion
export { createReplyPrefixOptions as n, createReplyPrefixContext as t };
