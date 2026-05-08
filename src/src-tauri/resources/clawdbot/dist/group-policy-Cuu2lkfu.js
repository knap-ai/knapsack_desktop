import { n as resolveChannelGroupRequireMention, r as resolveChannelGroupToolsPolicy } from "./group-policy-BUH7JoX8.js";
import "./channel-policy-D_qJHct1.js";
//#region extensions/imessage/src/group-policy.ts
function resolveIMessageGroupRequireMention(params) {
	return resolveChannelGroupRequireMention({
		cfg: params.cfg,
		channel: "imessage",
		groupId: params.groupId,
		accountId: params.accountId
	});
}
function resolveIMessageGroupToolPolicy(params) {
	return resolveChannelGroupToolsPolicy({
		cfg: params.cfg,
		channel: "imessage",
		groupId: params.groupId,
		accountId: params.accountId,
		senderId: params.senderId,
		senderName: params.senderName,
		senderUsername: params.senderUsername,
		senderE164: params.senderE164
	});
}
//#endregion
export { resolveIMessageGroupToolPolicy as n, resolveIMessageGroupRequireMention as t };
