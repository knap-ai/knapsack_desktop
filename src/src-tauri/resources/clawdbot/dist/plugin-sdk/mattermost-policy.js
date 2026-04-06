import { a as loadBundledPluginPublicSurfaceModuleSync } from "../facade-runtime-D_0VC8Qr.js";
//#region src/plugin-sdk/mattermost-policy.ts
function loadFacadeModule() {
	return loadBundledPluginPublicSurfaceModuleSync({
		dirName: "mattermost",
		artifactBasename: "api.js"
	});
}
const isMattermostSenderAllowed = ((...args) => loadFacadeModule()["isMattermostSenderAllowed"](...args));
//#endregion
export { isMattermostSenderAllowed };
