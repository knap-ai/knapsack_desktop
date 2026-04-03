import { a as defineSetupPluginEntry } from "../../core-BghMcc08.js";
import { s as signalSetupAdapter } from "../../setup-core-CAQb8ANq.js";
import { i as signalSetupWizard, t as createSignalPluginBase } from "../../shared-DUdDgUfi.js";
//#region extensions/signal/src/channel.setup.ts
const signalSetupPlugin = { ...createSignalPluginBase({
	setupWizard: signalSetupWizard,
	setup: signalSetupAdapter
}) };
//#endregion
//#region extensions/signal/setup-entry.ts
var setup_entry_default = defineSetupPluginEntry(signalSetupPlugin);
//#endregion
export { setup_entry_default as default, signalSetupPlugin };
