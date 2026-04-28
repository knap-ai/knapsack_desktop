import { r as resolveDefaultWhatsAppAccountId, t as listAccountIds } from "./account-ids-DG18xddX.js";
import { a as resolveWhatsAppAccount, n as hasAnyWhatsAppAuth } from "./accounts-BDqgpFEB.js";
import { a as formatWhatsAppConfigAllowFromEntries } from "./group-policy-BDmO10Lm.js";
import { t as WhatsAppChannelConfigSchema } from "./config-schema-rVWaQ7BI.js";
import { n as whatsappDoctor } from "./doctor-Cgh--wfq.js";
import { t as resolveLegacyGroupSessionKey } from "./group-session-contract-BzgGFVoj.js";
import { n as unsupportedSecretRefSurfacePatterns, t as collectUnsupportedSecretRefConfigCandidates } from "./security-contract-DM_QWL8_.js";
import { n as deriveLegacySessionChatType, r as isLegacyGroupSessionKey, t as canonicalizeLegacySessionKey } from "./session-contract-DhoAUe1e.js";
import { DEFAULT_ACCOUNT_ID } from "openclaw/plugin-sdk/account-core";
import { normalizeE164 } from "openclaw/plugin-sdk/account-resolution";
import { createChannelPluginBase, getChatChannelMeta } from "openclaw/plugin-sdk/core";
import { DEFAULT_ACCOUNT_ID as DEFAULT_ACCOUNT_ID$1 } from "openclaw/plugin-sdk/account-id";
import { collectOpenGroupPolicyRouteAllowlistWarnings, createAllowlistProviderGroupPolicyWarningCollector } from "openclaw/plugin-sdk/channel-policy";
import { readChannelAllowFromStore } from "openclaw/plugin-sdk/channel-pairing";
import { describeAccountSnapshot } from "openclaw/plugin-sdk/account-helpers";
import { adaptScopedAccountAccessor, createScopedChannelConfigAdapter, createScopedDmSecurityResolver } from "openclaw/plugin-sdk/channel-config-helpers";
import { createDelegatedSetupWizardProxy } from "openclaw/plugin-sdk/setup-runtime";
//#region extensions/whatsapp/src/security-fix.ts
function applyGroupAllowFromFromStore(params) {
	const next = structuredClone(params.cfg ?? {});
	const section = next.channels?.whatsapp;
	if (!section || typeof section !== "object" || params.storeAllowFrom.length === 0) return params.cfg;
	let changed = false;
	const maybeApply = (prefix, holder) => {
		if (holder.groupPolicy !== "allowlist") return;
		const allowFrom = Array.isArray(holder.allowFrom) ? holder.allowFrom : [];
		const groupAllowFrom = Array.isArray(holder.groupAllowFrom) ? holder.groupAllowFrom : [];
		if (allowFrom.length > 0 || groupAllowFrom.length > 0) return;
		holder.groupAllowFrom = params.storeAllowFrom;
		params.changes.push(`${prefix}groupAllowFrom=pairing-store`);
		changed = true;
	};
	maybeApply("channels.whatsapp.", section);
	const accounts = section.accounts;
	if (accounts && typeof accounts === "object") for (const [accountId, accountValue] of Object.entries(accounts)) {
		if (!accountValue || typeof accountValue !== "object") continue;
		maybeApply(`channels.whatsapp.accounts.${accountId}.`, accountValue);
	}
	return changed ? next : params.cfg;
}
async function applyWhatsAppSecurityConfigFixes(params) {
	const fromStore = await readChannelAllowFromStore("whatsapp", params.env, DEFAULT_ACCOUNT_ID$1).catch(() => []);
	const normalized = Array.from(new Set(fromStore.map((entry) => entry.trim()))).filter(Boolean);
	if (normalized.length === 0) return {
		config: params.cfg,
		changes: []
	};
	const changes = [];
	return {
		config: applyGroupAllowFromFromStore({
			cfg: params.cfg,
			storeAllowFrom: normalized,
			changes
		}),
		changes
	};
}
//#endregion
//#region extensions/whatsapp/src/shared.ts
const WHATSAPP_CHANNEL = "whatsapp";
const WHATSAPP_GROUP_SCOPE_FIELDS = [
	"groupPolicy",
	"groupAllowFrom",
	"groups"
];
function resolveWhatsAppAccountKey(accounts, accountId) {
	if (!accounts) return;
	if (Object.hasOwn(accounts, accountId)) return accountId;
	const normalizedAccountId = accountId.trim().toLowerCase();
	return Object.keys(accounts).find((key) => key.trim().toLowerCase() === normalizedAccountId);
}
function resolveWhatsAppGroupScopeBasePath(params) {
	const accountId = typeof params.accountId === "string" ? params.accountId.trim() || DEFAULT_ACCOUNT_ID : DEFAULT_ACCOUNT_ID;
	const accounts = params.cfg.channels?.whatsapp?.accounts;
	const accountKey = resolveWhatsAppAccountKey(accounts, accountId);
	const defaultAccountKey = resolveWhatsAppAccountKey(accounts, DEFAULT_ACCOUNT_ID);
	const accountConfig = accountKey ? accounts?.[accountKey] : void 0;
	const defaultAccountConfig = defaultAccountKey ? accounts?.[defaultAccountKey] : void 0;
	const matchesAnyGroupScopeField = (config) => WHATSAPP_GROUP_SCOPE_FIELDS.some((field) => config?.[field] !== void 0);
	if (matchesAnyGroupScopeField(accountConfig)) return `channels.whatsapp.accounts.${accountKey}`;
	if (accountId !== DEFAULT_ACCOUNT_ID && matchesAnyGroupScopeField(defaultAccountConfig)) return `channels.whatsapp.accounts.${defaultAccountKey}`;
	return "channels.whatsapp";
}
function resolveWhatsAppConfigPath(params) {
	return `${resolveWhatsAppGroupScopeBasePath(params)}.${params.field}`;
}
async function loadWhatsAppChannelRuntime() {
	return await import("./channel.runtime-C9aM1ZIU.js");
}
async function loadWhatsAppSetupSurface() {
	return await import("./setup-surface-DVs4dZpT.js");
}
const whatsappSetupWizardProxy = createWhatsAppSetupWizardProxy(async () => (await loadWhatsAppSetupSurface()).whatsappSetupWizard);
const whatsappConfigAdapter = createScopedChannelConfigAdapter({
	sectionKey: WHATSAPP_CHANNEL,
	listAccountIds,
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
	normalizeEntry: (raw) => normalizeE164(raw),
	inheritSharedDefaultsFromDefaultAccount: true
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
		resolveShouldPromptAccountIds: (params) => params.shouldPromptAccountIds,
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
			options?.onAccountId?.(WHATSAPP_CHANNEL, accountId);
		}
	});
}
function createWhatsAppPluginBase(params) {
	const collectWhatsAppSecurityWarnings = createAllowlistProviderGroupPolicyWarningCollector({
		providerConfigPresent: (cfg) => cfg.channels?.whatsapp !== void 0,
		resolveGroupPolicy: ({ account }) => account.groupPolicy,
		collect: ({ account, accountId, cfg, groupPolicy }) => collectOpenGroupPolicyRouteAllowlistWarnings({
			groupPolicy,
			routeAllowlistConfigured: Boolean(account.groups) && Object.keys(account.groups ?? {}).length > 0,
			restrictSenders: {
				surface: "WhatsApp groups",
				openScope: "any member in allowed groups",
				groupPolicyPath: resolveWhatsAppConfigPath({
					cfg,
					accountId,
					field: "groupPolicy"
				}),
				groupAllowFromPath: resolveWhatsAppConfigPath({
					cfg,
					accountId,
					field: "groupAllowFrom"
				})
			},
			noRouteAllowlist: {
				surface: "WhatsApp groups",
				routeAllowlistPath: resolveWhatsAppConfigPath({
					cfg,
					accountId,
					field: "groups"
				}),
				routeScope: "group",
				groupPolicyPath: resolveWhatsAppConfigPath({
					cfg,
					accountId,
					field: "groupPolicy"
				}),
				groupAllowFromPath: resolveWhatsAppConfigPath({
					cfg,
					accountId,
					field: "groupAllowFrom"
				})
			}
		})
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
			media: true,
			tts: { voice: {
				synthesisTarget: "voice-note",
				transcodesAudio: true
			} }
		},
		reload: {
			configPrefixes: ["web"],
			noopPrefixes: ["channels.whatsapp"]
		},
		gatewayMethods: ["web.login.start", "web.login.wait"],
		configSchema: WhatsAppChannelConfigSchema,
		config: {
			...whatsappConfigAdapter,
			isEnabled: (account, cfg) => account.enabled && cfg.web?.enabled !== false,
			disabledReason: () => "disabled",
			isConfigured: params.isConfigured,
			hasPersistedAuthState: ({ cfg }) => hasAnyWhatsAppAuth(cfg),
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
			applyConfigFixes: applyWhatsAppSecurityConfigFixes,
			resolveDmPolicy: whatsappResolveDmPolicy,
			collectWarnings: collectWhatsAppSecurityWarnings
		},
		doctor: whatsappDoctor,
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
		messaging: {
			defaultMarkdownTableMode: "bullets",
			deriveLegacySessionChatType,
			resolveLegacyGroupSessionKey,
			isLegacyGroupSessionKey,
			canonicalizeLegacySessionKey: (params) => canonicalizeLegacySessionKey({
				key: params.key,
				agentId: params.agentId
			})
		},
		secrets: {
			unsupportedSecretRefSurfacePatterns,
			collectUnsupportedSecretRefConfigCandidates
		},
		security: base.security,
		groups: base.groups
	};
}
//#endregion
export { loadWhatsAppChannelRuntime as n, whatsappSetupWizardProxy as r, createWhatsAppPluginBase as t };
