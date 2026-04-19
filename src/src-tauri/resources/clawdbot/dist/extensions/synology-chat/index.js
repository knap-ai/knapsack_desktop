import { t as defineBundledChannelEntry } from "../../channel-entry-contract-mcFqxQzW.js";
//#region extensions/synology-chat/index.ts
var synology_chat_default = defineBundledChannelEntry({
	id: "synology-chat",
	name: "Synology Chat",
	description: "Native Synology Chat channel plugin for OpenClaw",
	importMetaUrl: import.meta.url,
	plugin: {
		specifier: "./api.js",
		exportName: "synologyChatPlugin"
	},
	runtime: {
		specifier: "./api.js",
		exportName: "setSynologyRuntime"
	}
});
//#endregion
export { synology_chat_default as default };
