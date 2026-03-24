import { m as normalizeE164 } from "./utils-CS0Ikux6.js";
import { C as WhatsAppConfigSchema } from "./io-y3Az_Onx.js";
import { r as getChatChannelMeta } from "./registry-C5UkPpaO.js";
import { Bb as createChannelPluginBase, Ft as resolveWhatsAppAccount, Ix as createAllowlistProviderRouteAllowlistWarningCollector, Jb as adaptScopedAccountAccessor, Mt as listWhatsAppAccountIds, Pt as resolveDefaultWhatsAppAccountId, Qb as createScopedChannelConfigAdapter, ex as createScopedDmSecurityResolver, ix as formatWhatsAppConfigAllowFromEntries } from "./pi-embedded-CbCYZxIb.js";
import { n as describeAccountSnapshot } from "./account-helpers-BzkeDMfB.js";
import { r as buildChannelConfigSchema } from "./config-schema-CPzP2Ds6.js";
import { a as createDelegatedSetupWizardProxy } from "./setup-wizard-proxy-DoOpOF8S.js";
//#region extensions/whatsapp/src/shared.ts
const WHATSAPP_CHANNEL = "whatsapp";
async function loadWhatsAppChannelRuntime() {
	return await import("./channel.runtime-Dsz_SK84.js");
}
const whatsappSetupWizardProxy = createWhatsAppSetupWizardProxy(async () => (await loadWhatsAppChannelRuntime()).whatsappSetupWizard);
const whatsappConfigAdapter = createScopedChannelConfigAdapter({
	sectionKey: WHATSAPP_CHANNEL,
	listAccountIds: listWhatsAppAccountIds,
	resolveAccount: adaptScopedAccountAccessor(resolveWhatsAppAccount),
	defaultAccountId: resolveDefaultWhatsAppAccountId,
	clearBaseFields: [],
	allowTopLevel: false,
	resolveAllowFrom: (account) => account.allowFrom,
	formatAllowFrom: (allowFrom) => formatWhatsAppConfigAllowFromEntries(allowFrom),
	resolveDefaultTo: (account) => account.defaultTo
});
const whatsappResolveDmPolicy = createScopedDmSecurityResolver({
	channelKey: WHATSAPP_CHANNEL,
	resolvePolicy: (account) => account.dmPolicy,
	resolveAllowFrom: (account) => account.allowFrom,
	policyPathSuffix: "dmPolicy",
	normalizeEntry: (raw) => normalizeE164(raw)
});
function createWhatsAppSetupWizardProxy(loadWizard) {
	return createDelegatedSetupWizardProxy({
		channel: WHATSAPP_CHANNEL,
		loadWizard,
		status: {
			configuredLabel: "linked",
			unconfiguredLabel: "not linked",
			configuredHint: "linked",
			unconfiguredHint: "not linked",
			configuredScore: 5,
			unconfiguredScore: 4
		},
		resolveShouldPromptAccountIds: (params) => (params.shouldPromptAccountIds || params.options?.promptWhatsAppAccountId) ?? false,
		credentials: [],
		delegateFinalize: true,
		disable: (cfg) => ({
			...cfg,
			channels: {
				...cfg.channels,
				whatsapp: {
					...cfg.channels?.whatsapp,
					enabled: false
				}
			}
		}),
		onAccountRecorded: (accountId, options) => {
			options?.onWhatsAppAccountId?.(accountId);
		}
	});
}
function createWhatsAppPluginBase(params) {
	const collectWhatsAppSecurityWarnings = createAllowlistProviderRouteAllowlistWarningCollector({
		providerConfigPresent: (cfg) => cfg.channels?.whatsapp !== void 0,
		resolveGroupPolicy: (account) => account.groupPolicy,
		resolveRouteAllowlistConfigured: (account) => Boolean(account.groups) && Object.keys(account.groups ?? {}).length > 0,
		restrictSenders: {
			surface: "WhatsApp groups",
			openScope: "any member in allowed groups",
			groupPolicyPath: "channels.whatsapp.groupPolicy",
			groupAllowFromPath: "channels.whatsapp.groupAllowFrom"
		},
		noRouteAllowlist: {
			surface: "WhatsApp groups",
			routeAllowlistPath: "channels.whatsapp.groups",
			routeScope: "group",
			groupPolicyPath: "channels.whatsapp.groupPolicy",
			groupAllowFromPath: "channels.whatsapp.groupAllowFrom"
		}
	});
	const base = createChannelPluginBase({
		id: WHATSAPP_CHANNEL,
		meta: {
			...getChatChannelMeta(WHATSAPP_CHANNEL),
			showConfigured: false,
			quickstartAllowFrom: true,
			forceAccountBinding: true,
			preferSessionLookupForAnnounceTarget: true
		},
		setupWizard: params.setupWizard,
		capabilities: {
			chatTypes: ["direct", "group"],
			polls: true,
			reactions: true,
			media: true
		},
		reload: {
			configPrefixes: ["web"],
			noopPrefixes: ["channels.whatsapp"]
		},
		gatewayMethods: ["web.login.start", "web.login.wait"],
		configSchema: buildChannelConfigSchema(WhatsAppConfigSchema),
		config: {
			...whatsappConfigAdapter,
			isEnabled: (account, cfg) => account.enabled && cfg.web?.enabled !== false,
			disabledReason: () => "disabled",
			isConfigured: params.isConfigured,
			unconfiguredReason: () => "not linked",
			describeAccount: (account) => describeAccountSnapshot({
				account,
				configured: Boolean(account.authDir),
				extra: {
					linked: Boolean(account.authDir),
					dmPolicy: account.dmPolicy,
					allowFrom: account.allowFrom
				}
			})
		},
		security: {
			resolveDmPolicy: whatsappResolveDmPolicy,
			collectWarnings: collectWhatsAppSecurityWarnings
		},
		setup: params.setup,
		groups: params.groups
	});
	return {
		...base,
		setupWizard: base.setupWizard,
		capabilities: base.capabilities,
		reload: base.reload,
		gatewayMethods: base.gatewayMethods,
		configSchema: base.configSchema,
		config: base.config,
		security: base.security,
		groups: base.groups
	};
}
//#endregion
export { whatsappSetupWizardProxy as i, createWhatsAppPluginBase as n, loadWhatsAppChannelRuntime as r, WHATSAPP_CHANNEL as t };
