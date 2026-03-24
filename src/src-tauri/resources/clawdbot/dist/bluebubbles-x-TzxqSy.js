import { Hb as defineChannelPluginEntry } from "./pi-embedded-CbCYZxIb.js";
import { t as bluebubblesPlugin } from "./channel-CBJnbea3.js";
import { n as setBlueBubblesRuntime } from "./runtime-DivGFkSR.js";
//#region extensions/bluebubbles/index.ts
var bluebubbles_default = defineChannelPluginEntry({
	id: "bluebubbles",
	name: "BlueBubbles",
	description: "BlueBubbles channel plugin (macOS app)",
	plugin: bluebubblesPlugin,
	setRuntime: setBlueBubblesRuntime
});
//#endregion
export { bluebubbles_default as t };
