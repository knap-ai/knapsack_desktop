import { i as listWhatsAppAccountIds, n as hasAnyWhatsAppAuth, o as resolveDefaultWhatsAppAccountId, s as resolveWhatsAppAccount } from "./accounts-DgAsOTS-.js";
import { a as formatWhatsAppConfigAllowFromEntries } from "./group-policy-sF_4utMT.js";
import { t as WhatsAppChannelConfigSchema } from "./config-schema-jWQnydsV.js";
import { n as whatsappDoctor } from "./doctor-_8wlw0U1.js";
import { n as isLegacyGroupSessionKey, r as resolveLegacyGroupSessionKey, t as canonicalizeLegacySessionKey } from "./session-contract---rHhJzE.js";
import { n as unsupportedSecretRefSurfacePatterns, t as collectUnsupportedSecretRefConfigCandidates } from "./security-contract-D0i8AKIn.js";
import fs from "node:fs";
import path from "node:path";
import { normalizeE164 } from "openclaw/plugin-sdk/account-resolution";
import { createChannelPluginBase, getChatChannelMeta } from "openclaw/plugin-sdk/core";
import { DEFAULT_ACCOUNT_ID } from "openclaw/plugin-sdk/account-id";
import { createAllowlistProviderRouteAllowlistWarningCollector } from "openclaw/plugin-sdk/channel-policy";
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
	const fromStore = await readChannelAllowFromStore("whatsapp", params.env, DEFAULT_ACCOUNT_ID).catch(() => []);
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
async function loadWhatsAppChannelRuntime() {
	return await import("./channel.runtime-CDQh58UM.js");
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
//#region extensions/whatsapp/src/state-migrations.ts
function fileExists(pathValue) {
	try {
		return fs.existsSync(pathValue) && fs.statSync(pathValue).isFile();
	} catch {
		return false;
	}
}
function isLegacyWhatsAppAuthFile(name) {
	if (name === "creds.json" || name === "creds.json.bak") return true;
	if (!name.endsWith(".json")) return false;
	return /^(app-state-sync|session|sender-key|pre-key)-/.test(name);
}
function detectWhatsAppLegacyStateMigrations(params) {
	const targetDir = path.join(params.oauthDir, "whatsapp", DEFAULT_ACCOUNT_ID);
	return (() => {
		try {
			return fs.readdirSync(params.oauthDir, { withFileTypes: true });
		} catch {
			return [];
		}
	})().flatMap((entry) => {
		if (!entry.isFile() || entry.name === "oauth.json" || !isLegacyWhatsAppAuthFile(entry.name)) return [];
		const sourcePath = path.join(params.oauthDir, entry.name);
		const targetPath = path.join(targetDir, entry.name);
		if (fileExists(targetPath)) return [];
		return [{
			kind: "move",
			label: `WhatsApp auth ${entry.name}`,
			sourcePath,
			targetPath
		}];
	});
}
//#endregion
export { whatsappSetupWizardProxy as i, createWhatsAppPluginBase as n, loadWhatsAppChannelRuntime as r, detectWhatsAppLegacyStateMigrations as t };
