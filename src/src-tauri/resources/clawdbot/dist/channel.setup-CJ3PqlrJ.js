import { t as createZalouserPluginBase } from "./shared-s2mb84Ju.js";
import { n as zalouserSetupAdapter } from "./setup-core-qMEnNfxt.js";
import { t as zalouserSetupWizard } from "./setup-surface-NmSg3ftX.js";
//#region extensions/zalouser/src/channel.setup.ts
const zalouserSetupPlugin = { ...createZalouserPluginBase({
	setupWizard: zalouserSetupWizard,
	setup: zalouserSetupAdapter
}) };
//#endregion
export { zalouserSetupPlugin as t };
