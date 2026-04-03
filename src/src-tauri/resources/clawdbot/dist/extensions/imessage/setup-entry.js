import { a as defineSetupPluginEntry } from "../../core-BghMcc08.js";
import { a as imessageSetupAdapter } from "../../setup-core-BEyq5Zjn.js";
import { r as imessageSetupWizard, t as createIMessagePluginBase } from "../../shared-QtosIQnZ.js";
//#region extensions/imessage/src/channel.setup.ts
const imessageSetupPlugin = { ...createIMessagePluginBase({
	setupWizard: imessageSetupWizard,
	setup: imessageSetupAdapter
}) };
//#endregion
//#region extensions/imessage/setup-entry.ts
var setup_entry_default = defineSetupPluginEntry(imessageSetupPlugin);
//#endregion
export { setup_entry_default as default, imessageSetupPlugin };
