import { i as normalizeChannelId, t as getChannelPlugin } from "./registry-B2TRwbJD.js";
import "./plugins-BZ_I3cWH.js";
import { n as createReplyPrefixOptions } from "./reply-prefix-DdoGfLrM.js";
import { t as createTypingCallbacks } from "./typing-DdrHaH_3.js";
//#region src/plugin-sdk/channel-reply-pipeline.ts
function createChannelReplyPipeline(params) {
	const channelId = params.channel ? normalizeChannelId(params.channel) ?? params.channel : void 0;
	let plugin;
	let pluginTransformResolved = false;
	const resolvePluginTransform = () => {
		if (pluginTransformResolved) return plugin?.messaging?.transformReplyPayload;
		pluginTransformResolved = true;
		plugin = channelId ? getChannelPlugin(channelId) : void 0;
		return plugin?.messaging?.transformReplyPayload;
	};
	const transformReplyPayload = params.transformReplyPayload ? params.transformReplyPayload : channelId ? (payload) => resolvePluginTransform()?.({
		payload,
		cfg: params.cfg,
		accountId: params.accountId
	}) ?? payload : void 0;
	return {
		...createReplyPrefixOptions({
			cfg: params.cfg,
			agentId: params.agentId,
			channel: params.channel,
			accountId: params.accountId
		}),
		...transformReplyPayload ? { transformReplyPayload } : {},
		...params.typingCallbacks ? { typingCallbacks: params.typingCallbacks } : params.typing ? { typingCallbacks: createTypingCallbacks(params.typing) } : {}
	};
}
//#endregion
export { createChannelReplyPipeline as t };
