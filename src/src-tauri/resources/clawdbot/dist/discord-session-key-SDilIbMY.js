import { a as loadBundledPluginPublicSurfaceModuleSync } from "./facade-runtime-D_0VC8Qr.js";
//#region src/plugin-sdk/discord-session-key.ts
function loadFacadeModule() {
	return loadBundledPluginPublicSurfaceModuleSync({
		dirName: "discord",
		artifactBasename: "session-key-api.js"
	});
}
const normalizeExplicitDiscordSessionKey = ((...args) => loadFacadeModule()["normalizeExplicitDiscordSessionKey"](...args));
//#endregion
export { normalizeExplicitDiscordSessionKey as t };
