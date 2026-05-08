import { n as lineChannelPluginCommon, t as linePlugin } from "../../channel-W8-BcTH7.js";
import { n as lineSetupAdapter, t as lineSetupWizard } from "../../setup-surface-BhPS0yFv.js";
//#region extensions/line/src/channel.setup.ts
const lineSetupPlugin = {
	id: "line",
	...lineChannelPluginCommon,
	setupWizard: lineSetupWizard,
	setup: lineSetupAdapter
};
//#endregion
export { linePlugin, lineSetupPlugin };
