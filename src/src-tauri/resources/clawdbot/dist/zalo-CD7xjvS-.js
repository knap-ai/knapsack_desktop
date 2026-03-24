import { Hb as defineChannelPluginEntry } from "./pi-embedded-CbCYZxIb.js";
import { t as zaloPlugin } from "./channel-C7j1bmdJ.js";
import { n as setZaloRuntime } from "./runtime-DCO0BW-8.js";
//#region extensions/zalo/index.ts
var zalo_default = defineChannelPluginEntry({
	id: "zalo",
	name: "Zalo",
	description: "Zalo channel plugin",
	plugin: zaloPlugin,
	setRuntime: setZaloRuntime
});
//#endregion
export { zalo_default as t };
