import { a as loadBundledPluginPublicSurfaceModuleSync } from "./facade-runtime-D_0VC8Qr.js";
//#region src/plugin-sdk/discord-surface.ts
function loadFacadeModule() {
	return loadBundledPluginPublicSurfaceModuleSync({
		dirName: "discord",
		artifactBasename: "api.js"
	});
}
const buildDiscordComponentMessage = ((...args) => loadFacadeModule()["buildDiscordComponentMessage"](...args));
const collectDiscordStatusIssues = ((...args) => loadFacadeModule()["collectDiscordStatusIssues"](...args));
const createDiscordActionGate = ((...args) => loadFacadeModule()["createDiscordActionGate"](...args));
const handleDiscordMessageAction = ((...args) => loadFacadeModule()["handleDiscordMessageAction"](...args));
const inspectDiscordAccount = ((...args) => loadFacadeModule()["inspectDiscordAccount"](...args));
const isDiscordExecApprovalApprover = ((...args) => loadFacadeModule()["isDiscordExecApprovalApprover"](...args));
const isDiscordExecApprovalClientEnabled = ((...args) => loadFacadeModule()["isDiscordExecApprovalClientEnabled"](...args));
const listDiscordAccountIds = ((...args) => loadFacadeModule()["listDiscordAccountIds"](...args));
const listDiscordDirectoryGroupsFromConfig = ((...args) => loadFacadeModule()["listDiscordDirectoryGroupsFromConfig"](...args));
const listDiscordDirectoryPeersFromConfig = ((...args) => loadFacadeModule()["listDiscordDirectoryPeersFromConfig"](...args));
const looksLikeDiscordTargetId = ((...args) => loadFacadeModule()["looksLikeDiscordTargetId"](...args));
const normalizeDiscordMessagingTarget = ((...args) => loadFacadeModule()["normalizeDiscordMessagingTarget"](...args));
const normalizeDiscordOutboundTarget = ((...args) => loadFacadeModule()["normalizeDiscordOutboundTarget"](...args));
const readDiscordComponentSpec = ((...args) => loadFacadeModule()["readDiscordComponentSpec"](...args));
const resolveDefaultDiscordAccountId = ((...args) => loadFacadeModule()["resolveDefaultDiscordAccountId"](...args));
const resolveDiscordAccount = ((...args) => loadFacadeModule()["resolveDiscordAccount"](...args));
const resolveDiscordChannelId = ((...args) => loadFacadeModule()["resolveDiscordChannelId"](...args));
const resolveDiscordRuntimeGroupPolicy = ((...args) => loadFacadeModule()["resolveDiscordRuntimeGroupPolicy"](...args));
const resolveDiscordGroupRequireMention = ((...args) => loadFacadeModule()["resolveDiscordGroupRequireMention"](...args));
const resolveDiscordGroupToolPolicy = ((...args) => loadFacadeModule()["resolveDiscordGroupToolPolicy"](...args));
//#endregion
export { resolveDiscordChannelId as _, inspectDiscordAccount as a, resolveDiscordRuntimeGroupPolicy as b, listDiscordAccountIds as c, looksLikeDiscordTargetId as d, normalizeDiscordMessagingTarget as f, resolveDiscordAccount as g, resolveDefaultDiscordAccountId as h, handleDiscordMessageAction as i, listDiscordDirectoryGroupsFromConfig as l, readDiscordComponentSpec as m, collectDiscordStatusIssues as n, isDiscordExecApprovalApprover as o, normalizeDiscordOutboundTarget as p, createDiscordActionGate as r, isDiscordExecApprovalClientEnabled as s, buildDiscordComponentMessage as t, listDiscordDirectoryPeersFromConfig as u, resolveDiscordGroupRequireMention as v, resolveDiscordGroupToolPolicy as y };
