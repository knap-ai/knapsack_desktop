import { E as listDiscordDirectoryPeersLive, F as probeDiscord, G as resolveDiscordUserAllowlist, J as sendMessageDiscord, M as monitorDiscordProvider, P as pinMessageDiscord, T as listDiscordDirectoryGroupsLive, U as resolveDiscordChannelAllowlist, Y as sendPollDiscord, Z as sendTypingDiscord, d as editChannelDiscord, l as deleteMessageDiscord, n as auditDiscordChannelPermissions, p as editMessageDiscord, q as sendDiscordComponentMessage, s as createThreadDiscord, tt as unpinMessageDiscord } from "./discord-runtime-surface-B-TFSuFq.js";
//#region src/plugins/runtime/runtime-discord-ops.runtime.ts
const runtimeDiscordOps = {
	auditChannelPermissions: auditDiscordChannelPermissions,
	listDirectoryGroupsLive: listDiscordDirectoryGroupsLive,
	listDirectoryPeersLive: listDiscordDirectoryPeersLive,
	probeDiscord,
	resolveChannelAllowlist: resolveDiscordChannelAllowlist,
	resolveUserAllowlist: resolveDiscordUserAllowlist,
	sendComponentMessage: sendDiscordComponentMessage,
	sendMessageDiscord,
	sendPollDiscord,
	monitorDiscordProvider,
	typing: { pulse: sendTypingDiscord },
	conversationActions: {
		editMessage: editMessageDiscord,
		deleteMessage: deleteMessageDiscord,
		pinMessage: pinMessageDiscord,
		unpinMessage: unpinMessageDiscord,
		createThread: createThreadDiscord,
		editChannel: editChannelDiscord
	}
};
//#endregion
export { runtimeDiscordOps };
