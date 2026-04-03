import { i as loadActivatedBundledPluginPublicSurfaceModuleSync, n as createLazyFacadeObjectValue } from "./facade-runtime-D_0VC8Qr.js";
//#region src/plugin-sdk/discord-runtime-surface.ts
function loadFacadeModule() {
	return loadActivatedBundledPluginPublicSurfaceModuleSync({
		dirName: "discord",
		artifactBasename: "runtime-api.js"
	});
}
const addRoleDiscord = ((...args) => loadFacadeModule()["addRoleDiscord"](...args));
const auditDiscordChannelPermissions = ((...args) => loadFacadeModule()["auditDiscordChannelPermissions"](...args));
const banMemberDiscord = ((...args) => loadFacadeModule()["banMemberDiscord"](...args));
const collectDiscordAuditChannelIds = ((...args) => loadFacadeModule()["collectDiscordAuditChannelIds"](...args));
const createChannelDiscord = ((...args) => loadFacadeModule()["createChannelDiscord"](...args));
const createScheduledEventDiscord = ((...args) => loadFacadeModule()["createScheduledEventDiscord"](...args));
const createThreadDiscord = ((...args) => loadFacadeModule()["createThreadDiscord"](...args));
const deleteChannelDiscord = ((...args) => loadFacadeModule()["deleteChannelDiscord"](...args));
const deleteMessageDiscord = ((...args) => loadFacadeModule()["deleteMessageDiscord"](...args));
const discordMessageActions = createLazyFacadeObjectValue(() => loadFacadeModule()["discordMessageActions"]);
const editChannelDiscord = ((...args) => loadFacadeModule()["editChannelDiscord"](...args));
const editDiscordComponentMessage = ((...args) => loadFacadeModule()["editDiscordComponentMessage"](...args));
const editMessageDiscord = ((...args) => loadFacadeModule()["editMessageDiscord"](...args));
const fetchChannelInfoDiscord = ((...args) => loadFacadeModule()["fetchChannelInfoDiscord"](...args));
const fetchChannelPermissionsDiscord = ((...args) => loadFacadeModule()["fetchChannelPermissionsDiscord"](...args));
const fetchMemberInfoDiscord = ((...args) => loadFacadeModule()["fetchMemberInfoDiscord"](...args));
const fetchMessageDiscord = ((...args) => loadFacadeModule()["fetchMessageDiscord"](...args));
const fetchReactionsDiscord = ((...args) => loadFacadeModule()["fetchReactionsDiscord"](...args));
const fetchRoleInfoDiscord = ((...args) => loadFacadeModule()["fetchRoleInfoDiscord"](...args));
const fetchVoiceStatusDiscord = ((...args) => loadFacadeModule()["fetchVoiceStatusDiscord"](...args));
const getGateway = ((...args) => loadFacadeModule()["getGateway"](...args));
const getPresence = ((...args) => loadFacadeModule()["getPresence"](...args));
const hasAnyGuildPermissionDiscord = ((...args) => loadFacadeModule()["hasAnyGuildPermissionDiscord"](...args));
const kickMemberDiscord = ((...args) => loadFacadeModule()["kickMemberDiscord"](...args));
const listDiscordDirectoryGroupsLive = ((...args) => loadFacadeModule()["listDiscordDirectoryGroupsLive"](...args));
const listDiscordDirectoryPeersLive = ((...args) => loadFacadeModule()["listDiscordDirectoryPeersLive"](...args));
const listGuildChannelsDiscord = ((...args) => loadFacadeModule()["listGuildChannelsDiscord"](...args));
const listGuildEmojisDiscord = ((...args) => loadFacadeModule()["listGuildEmojisDiscord"](...args));
const listPinsDiscord = ((...args) => loadFacadeModule()["listPinsDiscord"](...args));
const listScheduledEventsDiscord = ((...args) => loadFacadeModule()["listScheduledEventsDiscord"](...args));
const listThreadsDiscord = ((...args) => loadFacadeModule()["listThreadsDiscord"](...args));
const monitorDiscordProvider = ((...args) => loadFacadeModule()["monitorDiscordProvider"](...args));
const moveChannelDiscord = ((...args) => loadFacadeModule()["moveChannelDiscord"](...args));
const pinMessageDiscord = ((...args) => loadFacadeModule()["pinMessageDiscord"](...args));
const probeDiscord = ((...args) => loadFacadeModule()["probeDiscord"](...args));
const reactMessageDiscord = ((...args) => loadFacadeModule()["reactMessageDiscord"](...args));
const readMessagesDiscord = ((...args) => loadFacadeModule()["readMessagesDiscord"](...args));
const registerBuiltDiscordComponentMessage = ((...args) => loadFacadeModule()["registerBuiltDiscordComponentMessage"](...args));
const removeChannelPermissionDiscord = ((...args) => loadFacadeModule()["removeChannelPermissionDiscord"](...args));
const removeOwnReactionsDiscord = ((...args) => loadFacadeModule()["removeOwnReactionsDiscord"](...args));
const removeReactionDiscord = ((...args) => loadFacadeModule()["removeReactionDiscord"](...args));
const removeRoleDiscord = ((...args) => loadFacadeModule()["removeRoleDiscord"](...args));
const resolveDiscordChannelAllowlist = ((...args) => loadFacadeModule()["resolveDiscordChannelAllowlist"](...args));
const resolveDiscordOutboundSessionRoute = ((...args) => loadFacadeModule()["resolveDiscordOutboundSessionRoute"](...args));
const resolveDiscordUserAllowlist = ((...args) => loadFacadeModule()["resolveDiscordUserAllowlist"](...args));
const searchMessagesDiscord = ((...args) => loadFacadeModule()["searchMessagesDiscord"](...args));
const sendDiscordComponentMessage = ((...args) => loadFacadeModule()["sendDiscordComponentMessage"](...args));
const sendMessageDiscord = ((...args) => loadFacadeModule()["sendMessageDiscord"](...args));
const sendPollDiscord = ((...args) => loadFacadeModule()["sendPollDiscord"](...args));
const sendStickerDiscord = ((...args) => loadFacadeModule()["sendStickerDiscord"](...args));
const sendTypingDiscord = ((...args) => loadFacadeModule()["sendTypingDiscord"](...args));
const sendVoiceMessageDiscord = ((...args) => loadFacadeModule()["sendVoiceMessageDiscord"](...args));
const setChannelPermissionDiscord = ((...args) => loadFacadeModule()["setChannelPermissionDiscord"](...args));
const timeoutMemberDiscord = ((...args) => loadFacadeModule()["timeoutMemberDiscord"](...args));
const unpinMessageDiscord = ((...args) => loadFacadeModule()["unpinMessageDiscord"](...args));
const uploadEmojiDiscord = ((...args) => loadFacadeModule()["uploadEmojiDiscord"](...args));
const uploadStickerDiscord = ((...args) => loadFacadeModule()["uploadStickerDiscord"](...args));
//#endregion
export { setChannelPermissionDiscord as $, listScheduledEventsDiscord as A, removeOwnReactionsDiscord as B, hasAnyGuildPermissionDiscord as C, listGuildChannelsDiscord as D, listDiscordDirectoryPeersLive as E, probeDiscord as F, resolveDiscordUserAllowlist as G, removeRoleDiscord as H, reactMessageDiscord as I, sendMessageDiscord as J, searchMessagesDiscord as K, readMessagesDiscord as L, monitorDiscordProvider as M, moveChannelDiscord as N, listGuildEmojisDiscord as O, pinMessageDiscord as P, sendVoiceMessageDiscord as Q, registerBuiltDiscordComponentMessage as R, getPresence as S, listDiscordDirectoryGroupsLive as T, resolveDiscordChannelAllowlist as U, removeReactionDiscord as V, resolveDiscordOutboundSessionRoute as W, sendStickerDiscord as X, sendPollDiscord as Y, sendTypingDiscord as Z, fetchMessageDiscord as _, createChannelDiscord as a, fetchVoiceStatusDiscord as b, deleteChannelDiscord as c, editChannelDiscord as d, timeoutMemberDiscord as et, editDiscordComponentMessage as f, fetchMemberInfoDiscord as g, fetchChannelPermissionsDiscord as h, collectDiscordAuditChannelIds as i, listThreadsDiscord as j, listPinsDiscord as k, deleteMessageDiscord as l, fetchChannelInfoDiscord as m, auditDiscordChannelPermissions as n, uploadEmojiDiscord as nt, createScheduledEventDiscord as o, editMessageDiscord as p, sendDiscordComponentMessage as q, banMemberDiscord as r, uploadStickerDiscord as rt, createThreadDiscord as s, addRoleDiscord as t, unpinMessageDiscord as tt, discordMessageActions as u, fetchReactionsDiscord as v, kickMemberDiscord as w, getGateway as x, fetchRoleInfoDiscord as y, removeChannelPermissionDiscord as z };
