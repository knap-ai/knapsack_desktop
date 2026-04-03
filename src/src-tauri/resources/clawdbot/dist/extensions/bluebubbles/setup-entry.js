import { a as defineSetupPluginEntry } from "../../core-BghMcc08.js";
import { a as bluebubblesConfigSchema, c as describeBlueBubblesAccount, i as bluebubblesConfigAdapter, n as blueBubblesSetupAdapter, o as bluebubblesMeta, r as bluebubblesCapabilities, s as bluebubblesReload, t as blueBubblesSetupWizard } from "../../setup-surface-D-5HQI7X.js";
//#region extensions/bluebubbles/src/channel.setup.ts
const bluebubblesSetupPlugin = {
	id: "bluebubbles",
	meta: {
		...bluebubblesMeta,
		aliases: [...bluebubblesMeta.aliases],
		preferOver: [...bluebubblesMeta.preferOver]
	},
	capabilities: bluebubblesCapabilities,
	reload: bluebubblesReload,
	configSchema: bluebubblesConfigSchema,
	setupWizard: blueBubblesSetupWizard,
	config: {
		...bluebubblesConfigAdapter,
		isConfigured: (account) => account.configured,
		describeAccount: (account) => describeBlueBubblesAccount(account)
	},
	setup: blueBubblesSetupAdapter
};
//#endregion
//#region extensions/bluebubbles/setup-entry.ts
var setup_entry_default = defineSetupPluginEntry(bluebubblesSetupPlugin);
//#endregion
export { bluebubblesSetupPlugin, setup_entry_default as default };
