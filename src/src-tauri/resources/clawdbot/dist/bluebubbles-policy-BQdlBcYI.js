import { a as loadBundledPluginPublicSurfaceModuleSync } from "./facade-runtime-D_0VC8Qr.js";
//#region src/plugin-sdk/bluebubbles-policy.ts
function loadFacadeModule() {
	return loadBundledPluginPublicSurfaceModuleSync({
		dirName: "bluebubbles",
		artifactBasename: "api.js"
	});
}
const isAllowedBlueBubblesSender = ((...args) => loadFacadeModule()["isAllowedBlueBubblesSender"](...args));
const resolveBlueBubblesGroupRequireMention = ((...args) => loadFacadeModule()["resolveBlueBubblesGroupRequireMention"](...args));
const resolveBlueBubblesGroupToolPolicy = ((...args) => loadFacadeModule()["resolveBlueBubblesGroupToolPolicy"](...args));
//#endregion
export { resolveBlueBubblesGroupRequireMention as n, resolveBlueBubblesGroupToolPolicy as r, isAllowedBlueBubblesSender as t };
