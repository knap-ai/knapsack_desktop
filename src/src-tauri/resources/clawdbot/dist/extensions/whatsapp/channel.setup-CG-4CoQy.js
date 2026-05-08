import { n as resolveWhatsAppGroupToolPolicy, r as resolveWhatsAppGroupIntroHint, t as resolveWhatsAppGroupRequireMention } from "./group-policy-BDmO10Lm.js";
import { m as readWebAuthState } from "./auth-store-Da7U_n_T.js";
import { r as whatsappSetupWizardProxy, t as createWhatsAppPluginBase } from "./shared-BQplbCdE.js";
import { t as whatsappSetupAdapter } from "./setup-core-DWOXG0wd.js";
import { t as detectWhatsAppLegacyStateMigrations } from "./state-migrations-But8yvpR.js";
//#region extensions/whatsapp/src/channel.setup.ts
const whatsappSetupPlugin = {
	...createWhatsAppPluginBase({
		groups: {
			resolveRequireMention: resolveWhatsAppGroupRequireMention,
			resolveToolPolicy: resolveWhatsAppGroupToolPolicy,
			resolveGroupIntroHint: resolveWhatsAppGroupIntroHint
		},
		setupWizard: whatsappSetupWizardProxy,
		setup: whatsappSetupAdapter,
		isConfigured: async (account) => await readWebAuthState(account.authDir) === "linked"
	}),
	lifecycle: { detectLegacyStateMigrations: ({ oauthDir }) => detectWhatsAppLegacyStateMigrations({ oauthDir }) }
};
//#endregion
export { whatsappSetupPlugin as t };
