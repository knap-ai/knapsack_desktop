import { i as loadActivatedBundledPluginPublicSurfaceModuleSync } from "./facade-runtime-D_0VC8Qr.js";
//#region src/plugin-sdk/slack-runtime-surface.ts
function loadFacadeModule() {
	return loadActivatedBundledPluginPublicSurfaceModuleSync({
		dirName: "slack",
		artifactBasename: "runtime-api.js"
	});
}
const handleSlackAction = ((...args) => loadFacadeModule()["handleSlackAction"](...args));
const listSlackDirectoryGroupsLive = ((...args) => loadFacadeModule()["listSlackDirectoryGroupsLive"](...args));
const listSlackDirectoryPeersLive = ((...args) => loadFacadeModule()["listSlackDirectoryPeersLive"](...args));
const monitorSlackProvider = ((...args) => loadFacadeModule()["monitorSlackProvider"](...args));
const probeSlack = ((...args) => loadFacadeModule()["probeSlack"](...args));
const resolveSlackChannelAllowlist = ((...args) => loadFacadeModule()["resolveSlackChannelAllowlist"](...args));
const resolveSlackUserAllowlist = ((...args) => loadFacadeModule()["resolveSlackUserAllowlist"](...args));
const sendMessageSlack = ((...args) => loadFacadeModule()["sendMessageSlack"](...args));
//#endregion
export { probeSlack as a, sendMessageSlack as c, monitorSlackProvider as i, listSlackDirectoryGroupsLive as n, resolveSlackChannelAllowlist as o, listSlackDirectoryPeersLive as r, resolveSlackUserAllowlist as s, handleSlackAction as t };
