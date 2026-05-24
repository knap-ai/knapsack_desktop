import { createAccountListHelpers } from "openclaw/plugin-sdk/account-core";
//#region extensions/whatsapp/src/account-ids.ts
const { listConfiguredAccountIds, listAccountIds, resolveDefaultAccountId: resolveDefaultWhatsAppAccountId } = createAccountListHelpers("whatsapp", { implicitDefaultAccount: { channelKeys: ["authDir"] } });
//#endregion
export { listConfiguredAccountIds as n, resolveDefaultWhatsAppAccountId as r, listAccountIds as t };
