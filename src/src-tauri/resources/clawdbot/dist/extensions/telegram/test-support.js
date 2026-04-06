import { t as getChatChannelMeta } from "../../chat-meta-Cdrnv7R-.js";
import { a as splitChannelApprovalCapability } from "../../approval-runtime-8-_vGYcG.js";
import { n as buildDmGroupAccountAllowlistAdapter } from "../../allowlist-config-edit-DcMKbV8C.js";
import "../../telegram-core-D06a1-N4.js";
import { s as resolveTelegramAccount } from "../../accounts-Dh_rfg3W.js";
import { t as telegramApprovalCapability } from "../../approval-native-YG1Yh0R2.js";
import { i as telegramConfigAdapter } from "../../shared-DoOcydyi.js";
//#region extensions/telegram/test-support.ts
const telegramNativeApprovalAdapter = splitChannelApprovalCapability(telegramApprovalCapability);
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
	auth: telegramNativeApprovalAdapter.auth,
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
