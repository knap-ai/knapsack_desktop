import { t as listAccountIds } from "./account-ids-CB5SOWjc.js";
import { o as resolveWhatsAppAuthDir } from "./accounts-BPYgj8Fv.js";
import { a as formatWhatsAppWebAuthStatusState, h as readWebAuthState } from "./auth-store-GTQvJznL.js";
import { DEFAULT_ACCOUNT_ID, createSetupTranslator, setSetupChannelEnabled } from "openclaw/plugin-sdk/setup";
//#region extensions/whatsapp/src/setup-surface.ts
const t = createSetupTranslator();
const channel = "whatsapp";
async function readWhatsAppSetupLinkState(cfg, accountId) {
	const { authDir } = resolveWhatsAppAuthDir({
		cfg,
		accountId
	});
	return await readWebAuthState(authDir);
}
const whatsappSetupWizard = {
	channel,
	status: {
		configuredLabel: t("wizard.channels.statusLinked"),
		unconfiguredLabel: t("wizard.channels.statusNotLinked"),
		configuredHint: t("wizard.channels.statusLinked"),
		unconfiguredHint: t("wizard.channels.statusNotLinked"),
		configuredScore: 5,
		unconfiguredScore: 4,
		resolveConfigured: async ({ cfg, accountId }) => {
			for (const resolvedAccountId of accountId ? [accountId] : listAccountIds(cfg)) if (await readWhatsAppSetupLinkState(cfg, resolvedAccountId) === "linked") return true;
			return false;
		},
		resolveStatusLines: async ({ cfg, accountId, configured }) => {
			const linkedAccountId = (await Promise.all((accountId ? [accountId] : listAccountIds(cfg)).map(async (resolvedAccountId) => ({
				accountId: resolvedAccountId,
				state: await readWhatsAppSetupLinkState(cfg, resolvedAccountId)
			})))).find((entry) => entry.state === "linked" || entry.state === "unstable");
			const labelAccountId = accountId ?? linkedAccountId?.accountId;
			return [`${labelAccountId ? `WhatsApp (${labelAccountId === DEFAULT_ACCOUNT_ID ? "default" : labelAccountId})` : "WhatsApp"}: ${configured ? formatWhatsAppWebAuthStatusState("linked") : formatWhatsAppWebAuthStatusState(linkedAccountId?.state ?? "not-linked")}`];
		}
	},
	resolveShouldPromptAccountIds: ({ shouldPromptAccountIds }) => shouldPromptAccountIds,
	credentials: [],
	finalize: async (params) => await (await import("./setup-finalize-DUYdQs-v.js")).finalizeWhatsAppSetup(params),
	disable: (cfg) => setSetupChannelEnabled(cfg, channel, false),
	onAccountRecorded: (accountId, options) => {
		options?.onAccountId?.(channel, accountId);
	}
};
//#endregion
export { whatsappSetupWizard };
