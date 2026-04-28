import { a as describeMattermostAccount, c as mattermostMeta, i as MattermostChannelConfigSchema, n as mattermostSetupWizard, o as isMattermostConfigured, r as mattermostSetupAdapter, s as mattermostConfigAdapter, t as mattermostPlugin } from "../../channel-plugin-runtime-tAdXqNo6.js";
import { t as resolveMattermostGatewayAuthBypassPaths } from "../../gateway-auth-bypass-D2QXpKX4.js";
//#region extensions/mattermost/src/channel.setup.ts
const mattermostSetupPlugin = {
	id: "mattermost",
	meta: { ...mattermostMeta },
	capabilities: {
		chatTypes: [
			"direct",
			"channel",
			"group",
			"thread"
		],
		reactions: true,
		threads: true,
		media: true,
		nativeCommands: true
	},
	reload: { configPrefixes: ["channels.mattermost"] },
	configSchema: MattermostChannelConfigSchema,
	config: {
		...mattermostConfigAdapter,
		isConfigured: isMattermostConfigured,
		describeAccount: describeMattermostAccount
	},
	gateway: { resolveGatewayAuthBypassPaths: ({ cfg }) => resolveMattermostGatewayAuthBypassPaths(cfg) },
	setup: mattermostSetupAdapter,
	setupWizard: mattermostSetupWizard
};
//#endregion
export { mattermostPlugin, mattermostSetupPlugin };
