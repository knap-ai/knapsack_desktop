import { a as defineSetupPluginEntry } from "../../core-BghMcc08.js";
import { n as lineSetupAdapter, t as lineSetupWizard } from "../../setup-surface-DDy_ro_z.js";
import { t as lineChannelPluginCommon } from "../../channel-shared-BZcLLTqi.js";
//#region extensions/line/src/channel.setup.ts
const lineSetupPlugin = {
	id: "line",
	...lineChannelPluginCommon,
	setupWizard: lineSetupWizard,
	setup: lineSetupAdapter
};
//#endregion
//#region extensions/line/setup-entry.ts
var setup_entry_default = defineSetupPluginEntry(lineSetupPlugin);
//#endregion
export { setup_entry_default as default, lineSetupPlugin };
