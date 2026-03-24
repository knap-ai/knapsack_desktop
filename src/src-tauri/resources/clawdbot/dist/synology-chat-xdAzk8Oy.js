import { Hb as defineChannelPluginEntry } from "./pi-embedded-CbCYZxIb.js";
import { n as setSynologyRuntime, t as synologyChatPlugin } from "./channel-DFhfHAnA.js";
//#region extensions/synology-chat/index.ts
var synology_chat_default = defineChannelPluginEntry({
	id: "synology-chat",
	name: "Synology Chat",
	description: "Native Synology Chat channel plugin for OpenClaw",
	plugin: synologyChatPlugin,
	setRuntime: setSynologyRuntime
});
//#endregion
export { synology_chat_default as t };
