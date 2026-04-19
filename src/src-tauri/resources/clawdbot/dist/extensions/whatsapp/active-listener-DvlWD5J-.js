import { o as resolveDefaultWhatsAppAccountId } from "./accounts-DgAsOTS-.js";
import { t as getRegisteredWhatsAppConnectionController } from "./connection-controller-registry-B3czWHIv.js";
import { loadConfig } from "openclaw/plugin-sdk/config-runtime";
//#region extensions/whatsapp/src/active-listener.ts
function resolveWebAccountId(accountId) {
	return (accountId ?? "").trim() || resolveDefaultWhatsAppAccountId(loadConfig());
}
function getActiveWebListener(accountId) {
	return getRegisteredWhatsAppConnectionController(resolveWebAccountId(accountId))?.getActiveListener() ?? null;
}
//#endregion
export { resolveWebAccountId as n, getActiveWebListener as t };
