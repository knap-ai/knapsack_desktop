import { a as loadBundledPluginPublicSurfaceModuleSync } from "./facade-runtime-D_0VC8Qr.js";
//#region src/plugin-sdk/discord-timeouts.ts
function loadFacadeModule() {
	return loadBundledPluginPublicSurfaceModuleSync({
		dirName: "discord",
		artifactBasename: "timeouts.js"
	});
}
const DISCORD_DEFAULT_INBOUND_WORKER_TIMEOUT_MS = loadFacadeModule()["DISCORD_DEFAULT_INBOUND_WORKER_TIMEOUT_MS"];
const DISCORD_DEFAULT_LISTENER_TIMEOUT_MS = loadFacadeModule()["DISCORD_DEFAULT_LISTENER_TIMEOUT_MS"];
//#endregion
export { DISCORD_DEFAULT_LISTENER_TIMEOUT_MS as n, DISCORD_DEFAULT_INBOUND_WORKER_TIMEOUT_MS as t };
