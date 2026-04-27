import { o as resolveTelegramAccount } from "./accounts-q2NkR7D9.js";
import { i as telegramConfigAdapter } from "./shared-OkW04SMA.js";
import { t as telegramApprovalCapability } from "./approval-native-B2oemr78.js";
import { buildDmGroupAccountAllowlistAdapter } from "openclaw/plugin-sdk/allowlist-config-edit";
import { getChatChannelMeta } from "openclaw/plugin-sdk/channel-plugin-common";
//#region extensions/telegram/test-support.ts
const telegramCommandTestPlugin = {
	id: "telegram",
	meta: getChatChannelMeta("telegram"),
	capabilities: {
		chatTypes: [
			"direct",
			"group",
			"channel",
			"thread"
		],
		reactions: true,
		threads: true,
		media: true,
		polls: true,
		nativeCommands: true,
		blockStreaming: true
	},
	config: telegramConfigAdapter,
	approvalCapability: telegramApprovalCapability,
	pairing: { idLabel: "telegramUserId" },
	allowlist: buildDmGroupAccountAllowlistAdapter({
		channelId: "telegram",
		resolveAccount: resolveTelegramAccount,
		normalize: ({ cfg, accountId, values }) => telegramConfigAdapter.formatAllowFrom({
			cfg,
			accountId,
			allowFrom: values
		}),
		resolveDmAllowFrom: (account) => account.config.allowFrom,
		resolveGroupAllowFrom: (account) => account.config.groupAllowFrom,
		resolveDmPolicy: (account) => account.config.dmPolicy,
		resolveGroupPolicy: (account) => account.config.groupPolicy
	})
};
//#endregion
export { telegramCommandTestPlugin };
