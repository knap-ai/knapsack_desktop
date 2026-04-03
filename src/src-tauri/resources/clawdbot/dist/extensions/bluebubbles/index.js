import { i as defineChannelPluginEntry } from "../../core-BghMcc08.js";
import { t as bluebubblesPlugin } from "../../channel-CrR6sqWw.js";
import { n as setBlueBubblesRuntime } from "../../runtime-DMBhcjo1.js";
//#region extensions/bluebubbles/index.ts
var bluebubbles_default = defineChannelPluginEntry({
	id: "bluebubbles",
	name: "BlueBubbles",
	description: "BlueBubbles channel plugin (macOS app)",
	plugin: bluebubblesPlugin,
	setRuntime: setBlueBubblesRuntime
});
//#endregion
export { bluebubblesPlugin, bluebubbles_default as default, setBlueBubblesRuntime };
