import { Ub as defineSetupPluginEntry } from "./pi-embedded-CbCYZxIb.js";
import { o as signalSetupAdapter } from "./setup-core-BnluiWdh.js";
import { i as signalSetupWizard, t as createSignalPluginBase } from "./shared-twzds-Nk.js";
//#region extensions/signal/src/channel.setup.ts
const signalSetupPlugin = { ...createSignalPluginBase({
	setupWizard: signalSetupWizard,
	setup: signalSetupAdapter
}) };
//#endregion
//#region extensions/signal/setup-entry.ts
var setup_entry_default = defineSetupPluginEntry(signalSetupPlugin);
//#endregion
export { signalSetupPlugin as n, setup_entry_default as t };
