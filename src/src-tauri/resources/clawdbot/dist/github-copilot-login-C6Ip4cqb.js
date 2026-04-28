import { i as loadBundledPluginPublicSurfaceModuleSync } from "./facade-loader-BAtcmKGO.js";
//#region src/plugin-sdk/github-copilot-login.ts
function loadFacadeModule() {
	return loadBundledPluginPublicSurfaceModuleSync({
		dirName: "github-copilot",
		artifactBasename: "api.js"
	});
}
const githubCopilotLoginCommand = ((...args) => loadFacadeModule()["githubCopilotLoginCommand"](...args));
//#endregion
export { githubCopilotLoginCommand as t };
