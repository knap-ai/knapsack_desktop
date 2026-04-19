import { t as createZalouserPluginBase } from "./shared-CarQFFuo.js";
import { n as zalouserSetupAdapter } from "./setup-core-DP9WmyzP.js";
import { t as zalouserSetupWizard } from "./setup-surface-D1O5MQZz.js";
//#region extensions/zalouser/src/channel.setup.ts
const zalouserSetupPlugin = { ...createZalouserPluginBase({
	setupWizard: zalouserSetupWizard,
	setup: zalouserSetupAdapter
}) };
//#endregion
export { zalouserSetupPlugin as t };
