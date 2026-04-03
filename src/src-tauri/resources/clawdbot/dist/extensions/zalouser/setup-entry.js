import { a as defineSetupPluginEntry } from "../../core-BghMcc08.js";
import { n as zalouserSetupAdapter, t as zalouserSetupWizard } from "../../setup-surface-C2b3V1Ci.js";
import { t as createZalouserPluginBase } from "../../shared-DA1Dy1GC.js";
//#region extensions/zalouser/src/channel.setup.ts
const zalouserSetupPlugin = { ...createZalouserPluginBase({
	setupWizard: zalouserSetupWizard,
	setup: zalouserSetupAdapter
}) };
//#endregion
//#region extensions/zalouser/setup-entry.ts
var setup_entry_default = defineSetupPluginEntry(zalouserSetupPlugin);
//#endregion
export { setup_entry_default as default, zalouserSetupPlugin };
