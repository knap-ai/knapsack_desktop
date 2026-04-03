import { i as defineChannelPluginEntry } from "../../core-BghMcc08.js";
import { n as setGoogleChatRuntime } from "../../runtime-88R8CJ9I.js";
import { t as googlechatPlugin } from "../../channel-B57LCj6t.js";
//#region extensions/googlechat/index.ts
var googlechat_default = defineChannelPluginEntry({
	id: "googlechat",
	name: "Google Chat",
	description: "OpenClaw Google Chat channel plugin",
	plugin: googlechatPlugin,
	setRuntime: setGoogleChatRuntime
});
//#endregion
export { googlechat_default as default, googlechatPlugin, setGoogleChatRuntime };
