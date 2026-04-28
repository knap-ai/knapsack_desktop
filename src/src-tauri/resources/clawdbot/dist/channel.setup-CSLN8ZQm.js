import { t as createZalouserPluginBase } from "./shared-Ch1Q6NnJ.js";
import { n as zalouserSetupAdapter } from "./setup-core-CaFUnIFo.js";
import { t as zalouserSetupWizard } from "./setup-surface-i6W3QTEF.js";
//#region extensions/zalouser/src/channel.setup.ts
const zalouserSetupPlugin = { ...createZalouserPluginBase({
	setupWizard: zalouserSetupWizard,
	setup: zalouserSetupAdapter
}) };
//#endregion
export { zalouserSetupPlugin as t };
