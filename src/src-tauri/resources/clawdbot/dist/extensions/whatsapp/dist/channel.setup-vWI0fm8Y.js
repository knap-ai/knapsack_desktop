import { a as resolveWhatsAppGroupRequireMention, i as whatsappSetupWizardProxy, n as createWhatsAppPluginBase, o as resolveWhatsAppGroupToolPolicy, s as resolveWhatsAppGroupIntroHint, t as whatsappSetupAdapter } from "./setup-core-BTDKEc-x.js";
import { t as detectWhatsAppLegacyStateMigrations } from "./state-migrations-D_BmQUR9.js";
//#region extensions/whatsapp/src/channel.setup.ts
async function isWhatsAppAuthConfigured(account) {
	const { readWebAuthState } = await import("./auth-store-GTQvJznL.js").then((n) => n.i);
	return await readWebAuthState(account.authDir) === "linked";
}
const whatsappSetupPlugin = {
	...createWhatsAppPluginBase({
		groups: {
			resolveRequireMention: resolveWhatsAppGroupRequireMention,
			resolveToolPolicy: resolveWhatsAppGroupToolPolicy,
			resolveGroupIntroHint: resolveWhatsAppGroupIntroHint
		},
		setupWizard: whatsappSetupWizardProxy,
		setup: whatsappSetupAdapter,
		isConfigured: isWhatsAppAuthConfigured
	}),
	lifecycle: { detectLegacyStateMigrations: ({ oauthDir }) => detectWhatsAppLegacyStateMigrations({ oauthDir }) }
};
//#endregion
export { whatsappSetupPlugin as t };
