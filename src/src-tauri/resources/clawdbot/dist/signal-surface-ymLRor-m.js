import { a as loadBundledPluginPublicSurfaceModuleSync, n as createLazyFacadeObjectValue } from "./facade-runtime-D_0VC8Qr.js";
//#region src/plugin-sdk/signal-surface.ts
function loadFacadeModule() {
	return loadBundledPluginPublicSurfaceModuleSync({
		dirName: "signal",
		artifactBasename: "api.js"
	});
}
const isSignalSenderAllowed = ((...args) => loadFacadeModule()["isSignalSenderAllowed"](...args));
const listEnabledSignalAccounts = ((...args) => loadFacadeModule()["listEnabledSignalAccounts"](...args));
const listSignalAccountIds = ((...args) => loadFacadeModule()["listSignalAccountIds"](...args));
const monitorSignalProvider = ((...args) => loadFacadeModule()["monitorSignalProvider"](...args));
const probeSignal = ((...args) => loadFacadeModule()["probeSignal"](...args));
const removeReactionSignal = ((...args) => loadFacadeModule()["removeReactionSignal"](...args));
const resolveDefaultSignalAccountId = ((...args) => loadFacadeModule()["resolveDefaultSignalAccountId"](...args));
const resolveSignalReactionLevel = ((...args) => loadFacadeModule()["resolveSignalReactionLevel"](...args));
const sendMessageSignal = ((...args) => loadFacadeModule()["sendMessageSignal"](...args));
const sendReactionSignal = ((...args) => loadFacadeModule()["sendReactionSignal"](...args));
const signalMessageActions = createLazyFacadeObjectValue(() => loadFacadeModule()["signalMessageActions"]);
//#endregion
export { probeSignal as a, resolveSignalReactionLevel as c, signalMessageActions as d, monitorSignalProvider as i, sendMessageSignal as l, listEnabledSignalAccounts as n, removeReactionSignal as o, listSignalAccountIds as r, resolveDefaultSignalAccountId as s, isSignalSenderAllowed as t, sendReactionSignal as u };
