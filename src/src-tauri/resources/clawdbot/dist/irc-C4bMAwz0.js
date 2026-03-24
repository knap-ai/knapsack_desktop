import { Hb as defineChannelPluginEntry } from "./pi-embedded-CbCYZxIb.js";
import { n as setIrcRuntime, t as ircPlugin } from "./channel-B8BhDC3f.js";
//#region extensions/irc/index.ts
var irc_default = defineChannelPluginEntry({
	id: "irc",
	name: "IRC",
	description: "IRC channel plugin",
	plugin: ircPlugin,
	setRuntime: setIrcRuntime
});
//#endregion
export { irc_default as t };
