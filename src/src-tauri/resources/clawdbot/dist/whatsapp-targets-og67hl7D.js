import { a as loadBundledPluginPublicSurfaceModuleSync } from "./facade-runtime-D_0VC8Qr.js";
//#region src/plugin-sdk/whatsapp-targets.ts
function loadFacadeModule() {
	return loadBundledPluginPublicSurfaceModuleSync({
		dirName: "whatsapp",
		artifactBasename: "api.js"
	});
}
const isWhatsAppGroupJid = ((...args) => loadFacadeModule()["isWhatsAppGroupJid"](...args));
const isWhatsAppUserTarget = ((...args) => loadFacadeModule()["isWhatsAppUserTarget"](...args));
const normalizeWhatsAppTarget = ((...args) => loadFacadeModule()["normalizeWhatsAppTarget"](...args));
//#endregion
export { isWhatsAppUserTarget as n, normalizeWhatsAppTarget as r, isWhatsAppGroupJid as t };
