import { a as loadBundledPluginPublicSurfaceModuleSync } from "../facade-runtime-D_0VC8Qr.js";
//#region src/plugin-sdk/telegram-allow-from.ts
function loadFacadeModule() {
	return loadBundledPluginPublicSurfaceModuleSync({
		dirName: "telegram",
		artifactBasename: "api.js"
	});
}
const isNumericTelegramUserId = ((...args) => loadFacadeModule()["isNumericTelegramUserId"](...args));
const normalizeTelegramAllowFromEntry = ((...args) => loadFacadeModule()["normalizeTelegramAllowFromEntry"](...args));
//#endregion
export { isNumericTelegramUserId, normalizeTelegramAllowFromEntry };
