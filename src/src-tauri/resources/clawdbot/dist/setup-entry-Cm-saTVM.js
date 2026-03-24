import { Ub as defineSetupPluginEntry, fa as lineSetupWizard, pa as lineSetupAdapter } from "./pi-embedded-CbCYZxIb.js";
import { t as lineChannelPluginCommon } from "./channel-shared-COhzQJI4.js";
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
export { lineSetupPlugin as n, setup_entry_default as t };
