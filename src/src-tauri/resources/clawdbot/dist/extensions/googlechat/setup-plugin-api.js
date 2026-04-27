import { a as resolveDefaultGoogleChatAccountId, i as listGoogleChatAccountIds, n as googlechatSetupAdapter, o as resolveGoogleChatAccount, t as googlechatSetupWizard } from "./setup-surface-LQUX7BJB.js";
import { describeAccountSnapshot } from "openclaw/plugin-sdk/account-helpers";
import { formatNormalizedAllowFromEntries } from "openclaw/plugin-sdk/allow-from";
import { adaptScopedAccountAccessor, createScopedChannelConfigAdapter } from "openclaw/plugin-sdk/channel-config-helpers";
import { normalizeLowercaseStringOrEmpty } from "openclaw/plugin-sdk/text-runtime";
//#region extensions/googlechat/src/channel.setup.ts
const formatGoogleChatAllowFromEntry = (entry) => normalizeLowercaseStringOrEmpty(entry.trim().replace(/^(googlechat|google-chat|gchat):/i, "").replace(/^user:/i, "").replace(/^users\//i, ""));
const googlechatSetupPlugin = {
	id: "googlechat",
	meta: {
		id: "googlechat",
		label: "Google Chat",
		selectionLabel: "Google Chat (Chat API)",
		docsPath: "/channels/googlechat",
		docsLabel: "googlechat",
		blurb: "Google Workspace Chat app with HTTP webhook.",
		aliases: ["gchat", "google-chat"],
		order: 55,
		detailLabel: "Google Chat",
		systemImage: "message.badge",
		markdownCapable: true
	},
	setup: googlechatSetupAdapter,
	setupWizard: googlechatSetupWizard,
	capabilities: {
		chatTypes: [
			"direct",
			"group",
			"thread"
		],
		reactions: true,
		threads: true,
		media: true,
		nativeCommands: false,
		blockStreaming: true
	},
	streaming: { blockStreamingCoalesceDefaults: {
		minChars: 1500,
		idleMs: 1e3
	} },
	reload: { configPrefixes: ["channels.googlechat"] },
	config: {
		...createScopedChannelConfigAdapter({
			sectionKey: "googlechat",
			listAccountIds: listGoogleChatAccountIds,
			resolveAccount: adaptScopedAccountAccessor(resolveGoogleChatAccount),
			defaultAccountId: resolveDefaultGoogleChatAccountId,
			clearBaseFields: [
				"serviceAccount",
				"serviceAccountFile",
				"audienceType",
				"audience",
				"webhookPath",
				"webhookUrl",
				"botUser",
				"name"
			],
			resolveAllowFrom: (account) => account.config.dm?.allowFrom,
			formatAllowFrom: (allowFrom) => formatNormalizedAllowFromEntries({
				allowFrom,
				normalizeEntry: formatGoogleChatAllowFromEntry
			}),
			resolveDefaultTo: (account) => account.config.defaultTo
		}),
		isConfigured: (account) => account.credentialSource !== "none",
		describeAccount: (account) => describeAccountSnapshot({
			account,
			configured: account.credentialSource !== "none",
			extra: { credentialSource: account.credentialSource }
		})
	}
};
//#endregion
export { googlechatSetupPlugin };
