import { a as defineSetupPluginEntry } from "../../core-BghMcc08.js";
import { n as resolveWhatsAppGroupIntroHint } from "../../whatsapp-shared-C06ynsZL.js";
import { n as resolveWhatsAppGroupToolPolicy, t as resolveWhatsAppGroupRequireMention } from "../../group-policy-OwhXMgOr.js";
import { t as whatsappSetupAdapter } from "../../setup-core-Wu9Q96mM.js";
import { i as whatsappSetupWizardProxy, n as createWhatsAppPluginBase } from "../../shared-D5kj_-Up.js";
import "../../api-lAGCAbrp.js";
import { d as webAuthExists } from "../../auth-store-BHt3Da5y.js";
//#region extensions/whatsapp/src/channel.setup.ts
const whatsappSetupPlugin = { ...createWhatsAppPluginBase({
	groups: {
		resolveRequireMention: resolveWhatsAppGroupRequireMention,
		resolveToolPolicy: resolveWhatsAppGroupToolPolicy,
		resolveGroupIntroHint: resolveWhatsAppGroupIntroHint
	},
	setupWizard: whatsappSetupWizardProxy,
	setup: whatsappSetupAdapter,
	isConfigured: async (account) => await webAuthExists(account.authDir)
}) };
//#endregion
//#region extensions/whatsapp/setup-entry.ts
var setup_entry_default = defineSetupPluginEntry(whatsappSetupPlugin);
//#endregion
export { setup_entry_default as default, whatsappSetupPlugin };
