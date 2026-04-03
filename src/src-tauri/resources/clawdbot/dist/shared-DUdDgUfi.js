import { p as normalizeE164 } from "./utils-CE3P21nG.js";
import { t as getChatChannelMeta } from "./chat-meta-Cdrnv7R-.js";
import { n as describeAccountSnapshot } from "./account-helpers-DqNwQN08.js";
import { c as createScopedChannelConfigAdapter, t as adaptScopedAccountAccessor } from "./channel-config-helpers-B0S2z66F.js";
import { n as createChannelPluginBase } from "./core-BghMcc08.js";
import { t as createRestrictSendersChannelSecurity } from "./channel-policy-Dqo0XdDX.js";
import "./text-runtime-B0ZpmkER.js";
import { i as resolveSignalAccount, n as listSignalAccountIds, r as resolveDefaultSignalAccountId } from "./accounts-CbGSIdyw.js";
import "./runtime-api-LifQ6b24.js";
import { n as createSignalSetupWizardProxy } from "./setup-core-CAQb8ANq.js";
import { t as SignalChannelConfigSchema } from "./config-schema-DUyCAXBY.js";
//#region extensions/signal/src/shared.ts
const SIGNAL_CHANNEL = "signal";
async function loadSignalChannelRuntime() {
	return await import("./channel.runtime-B_A_Q05W.js");
}
const signalSetupWizard = createSignalSetupWizardProxy(async () => (await loadSignalChannelRuntime()).signalSetupWizard);
const signalConfigAdapter = createScopedChannelConfigAdapter({
	sectionKey: SIGNAL_CHANNEL,
	listAccountIds: (cfg) => listSignalAccountIds(cfg),
	resolveAccount: adaptScopedAccountAccessor((params) => resolveSignalAccount(params)),
	defaultAccountId: (cfg) => resolveDefaultSignalAccountId(cfg),
	clearBaseFields: [
		"account",
		"httpUrl",
		"httpHost",
		"httpPort",
		"cliPath",
		"name"
	],
	resolveAllowFrom: (account) => account.config.allowFrom,
	formatAllowFrom: (allowFrom) => allowFrom.map((entry) => String(entry).trim()).filter(Boolean).map((entry) => entry === "*" ? "*" : normalizeE164(entry.replace(/^signal:/i, ""))).filter(Boolean),
	resolveDefaultTo: (account) => account.config.defaultTo
});
const signalSecurityAdapter = createRestrictSendersChannelSecurity({
	channelKey: SIGNAL_CHANNEL,
	resolveDmPolicy: (account) => account.config.dmPolicy,
	resolveDmAllowFrom: (account) => account.config.allowFrom,
	resolveGroupPolicy: (account) => account.config.groupPolicy,
	surface: "Signal groups",
	openScope: "any member",
	groupPolicyPath: "channels.signal.groupPolicy",
	groupAllowFromPath: "channels.signal.groupAllowFrom",
	mentionGated: false,
	policyPathSuffix: "dmPolicy",
	normalizeDmEntry: (raw) => normalizeE164(raw.replace(/^signal:/i, "").trim())
});
function createSignalPluginBase(params) {
	return createChannelPluginBase({
		id: SIGNAL_CHANNEL,
		meta: { ...getChatChannelMeta(SIGNAL_CHANNEL) },
		setupWizard: params.setupWizard,
		capabilities: {
			chatTypes: ["direct", "group"],
			media: true,
			reactions: true
		},
		streaming: { blockStreamingCoalesceDefaults: {
			minChars: 1500,
			idleMs: 1e3
		} },
		reload: { configPrefixes: ["channels.signal"] },
		configSchema: SignalChannelConfigSchema,
		config: {
			...signalConfigAdapter,
			isConfigured: (account) => account.configured,
			describeAccount: (account) => describeAccountSnapshot({
				account,
				configured: account.configured,
				extra: { baseUrl: account.baseUrl }
			})
		},
		security: signalSecurityAdapter,
		setup: params.setup
	});
}
//#endregion
export { signalSetupWizard as i, signalConfigAdapter as n, signalSecurityAdapter as r, createSignalPluginBase as t };
