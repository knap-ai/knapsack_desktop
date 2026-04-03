import { a as loadBundledPluginPublicSurfaceModuleSync, n as createLazyFacadeObjectValue } from "./facade-runtime-D_0VC8Qr.js";
//#region src/plugin-sdk/whatsapp-surface.ts
function loadFacadeModule() {
	return loadBundledPluginPublicSurfaceModuleSync({
		dirName: "whatsapp",
		artifactBasename: "api.js"
	});
}
function loadFacadeModule2() {
	return loadBundledPluginPublicSurfaceModuleSync({
		dirName: "whatsapp",
		artifactBasename: "constants.js"
	});
}
const DEFAULT_WEB_MEDIA_BYTES = loadFacadeModule2()["DEFAULT_WEB_MEDIA_BYTES"];
const hasAnyWhatsAppAuth = ((...args) => loadFacadeModule()["hasAnyWhatsAppAuth"](...args));
const listEnabledWhatsAppAccounts = ((...args) => loadFacadeModule()["listEnabledWhatsAppAccounts"](...args));
const listWhatsAppDirectoryGroupsFromConfig = ((...args) => loadFacadeModule()["listWhatsAppDirectoryGroupsFromConfig"](...args));
const listWhatsAppDirectoryPeersFromConfig = ((...args) => loadFacadeModule()["listWhatsAppDirectoryPeersFromConfig"](...args));
const resolveWhatsAppAccount = ((...args) => loadFacadeModule()["resolveWhatsAppAccount"](...args));
const resolveWhatsAppGroupRequireMention = ((...args) => loadFacadeModule()["resolveWhatsAppGroupRequireMention"](...args));
const resolveWhatsAppGroupToolPolicy = ((...args) => loadFacadeModule()["resolveWhatsAppGroupToolPolicy"](...args));
const resolveWhatsAppOutboundTarget = ((...args) => loadFacadeModule()["resolveWhatsAppOutboundTarget"](...args));
const whatsappAccessControlTesting = createLazyFacadeObjectValue(() => loadFacadeModule()["whatsappAccessControlTesting"]);
//#endregion
export { listWhatsAppDirectoryPeersFromConfig as a, resolveWhatsAppGroupToolPolicy as c, listWhatsAppDirectoryGroupsFromConfig as i, resolveWhatsAppOutboundTarget as l, hasAnyWhatsAppAuth as n, resolveWhatsAppAccount as o, listEnabledWhatsAppAccounts as r, resolveWhatsAppGroupRequireMention as s, DEFAULT_WEB_MEDIA_BYTES as t, whatsappAccessControlTesting as u };
