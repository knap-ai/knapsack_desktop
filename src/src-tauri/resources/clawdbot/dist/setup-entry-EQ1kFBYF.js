import { Ub as defineSetupPluginEntry } from "./pi-embedded-CbCYZxIb.js";
import { a as imessageSetupAdapter } from "./setup-core-vcqRwDmU.js";
import { r as imessageSetupWizard, t as createIMessagePluginBase } from "./shared-9ze9PBZv.js";
//#region extensions/imessage/src/channel.setup.ts
const imessageSetupPlugin = { ...createIMessagePluginBase({
	setupWizard: imessageSetupWizard,
	setup: imessageSetupAdapter
}) };
//#endregion
//#region extensions/imessage/setup-entry.ts
var setup_entry_default = defineSetupPluginEntry(imessageSetupPlugin);
//#endregion
export { imessageSetupPlugin as n, setup_entry_default as t };
