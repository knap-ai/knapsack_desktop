import { i as defineChannelPluginEntry } from "../../core-BghMcc08.js";
import { t as zaloPlugin } from "../../channel-CF1l0ThL.js";
import { n as setZaloRuntime } from "../../runtime-0lCmSrOe.js";
//#region extensions/zalo/index.ts
var zalo_default = defineChannelPluginEntry({
	id: "zalo",
	name: "Zalo",
	description: "Zalo channel plugin",
	plugin: zaloPlugin,
	setRuntime: setZaloRuntime
});
//#endregion
export { zalo_default as default, setZaloRuntime, zaloPlugin };
