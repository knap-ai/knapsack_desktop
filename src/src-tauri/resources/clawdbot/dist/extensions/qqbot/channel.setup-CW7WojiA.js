import "./bootstrap-DP2UpEF-.js";
import { a as qqbotSetupAdapterShared, i as qqbotMeta, n as qqbotSetupWizard, r as qqbotConfigAdapter, t as qqbotChannelConfigSchema } from "./config-schema-BWBETfXL.js";
//#region extensions/qqbot/src/channel.setup.ts
/**
* Setup-only QQBot plugin — lightweight subset used during `openclaw onboard`
* and `openclaw configure` without pulling the full runtime dependencies.
*/
const qqbotSetupPlugin = {
	id: "qqbot",
	setupWizard: qqbotSetupWizard,
	meta: { ...qqbotMeta },
	capabilities: {
		chatTypes: ["direct", "group"],
		media: true,
		reactions: false,
		threads: false,
		blockStreaming: true
	},
	reload: { configPrefixes: ["channels.qqbot"] },
	configSchema: qqbotChannelConfigSchema,
	config: { ...qqbotConfigAdapter },
	setup: { ...qqbotSetupAdapterShared }
};
//#endregion
export { qqbotSetupPlugin as t };
