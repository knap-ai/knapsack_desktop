import { Qb as createScopedChannelConfigAdapter, by as resolveDefaultLineAccountId, ja as LineChannelConfigSchema, vy as listLineAccountIds, xy as resolveLineAccount } from "./pi-embedded-CbCYZxIb.js";
//#region extensions/line/src/config-adapter.ts
function normalizeLineAllowFrom(entry) {
	return entry.replace(/^line:(?:user:)?/i, "");
}
const lineChannelPluginCommon = {
	meta: {
		id: "line",
		label: "LINE",
		selectionLabel: "LINE (Messaging API)",
		detailLabel: "LINE Bot",
		docsPath: "/channels/line",
		docsLabel: "line",
		blurb: "LINE Messaging API bot for Japan/Taiwan/Thailand markets.",
		systemImage: "message.fill",
		quickstartAllowFrom: true
	},
	capabilities: {
		chatTypes: ["direct", "group"],
		reactions: false,
		threads: false,
		media: true,
		nativeCommands: false,
		blockStreaming: true
	},
	reload: { configPrefixes: ["channels.line"] },
	configSchema: LineChannelConfigSchema,
	config: {
		...createScopedChannelConfigAdapter({
			sectionKey: "line",
			listAccountIds: listLineAccountIds,
			resolveAccount: (cfg, accountId) => resolveLineAccount({
				cfg,
				accountId: accountId ?? void 0
			}),
			defaultAccountId: resolveDefaultLineAccountId,
			clearBaseFields: [
				"channelSecret",
				"tokenFile",
				"secretFile"
			],
			resolveAllowFrom: (account) => account.config.allowFrom,
			formatAllowFrom: (allowFrom) => allowFrom.map((entry) => String(entry).trim()).filter(Boolean).map(normalizeLineAllowFrom)
		}),
		isConfigured: (account) => Boolean(account.channelAccessToken?.trim() && account.channelSecret?.trim()),
		describeAccount: (account) => ({
			accountId: account.accountId,
			name: account.name,
			enabled: account.enabled,
			configured: Boolean(account.channelAccessToken?.trim() && account.channelSecret?.trim()),
			tokenSource: account.tokenSource ?? void 0
		})
	}
};
//#endregion
export { lineChannelPluginCommon as t };
