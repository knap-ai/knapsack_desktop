import { i as loadBundledPluginPublicSurfaceModuleSync, n as createLazyFacadeObjectValue } from "./facade-loader-CGu7k8Om.js";
//#region src/plugin-sdk/irc-surface.ts
function loadFacadeModule() {
	return loadBundledPluginPublicSurfaceModuleSync({
		dirName: "irc",
		artifactBasename: "api.js"
	});
}
const ircSetupAdapter = createLazyFacadeObjectValue(() => loadFacadeModule()["ircSetupAdapter"]);
const ircSetupWizard = createLazyFacadeObjectValue(() => loadFacadeModule()["ircSetupWizard"]);
const listIrcAccountIds = ((...args) => loadFacadeModule()["listIrcAccountIds"](...args));
const resolveDefaultIrcAccountId = ((...args) => loadFacadeModule()["resolveDefaultIrcAccountId"](...args));
const resolveIrcAccount = ((...args) => loadFacadeModule()["resolveIrcAccount"](...args));
//#endregion
export { resolveIrcAccount as a, resolveDefaultIrcAccountId as i, ircSetupWizard as n, listIrcAccountIds as r, ircSetupAdapter as t };
