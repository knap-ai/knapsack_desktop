import { t as defineBundledChannelEntry } from "../../channel-entry-contract-mcFqxQzW.js";
//#region extensions/nextcloud-talk/index.ts
var nextcloud_talk_default = defineBundledChannelEntry({
	id: "nextcloud-talk",
	name: "Nextcloud Talk",
	description: "Nextcloud Talk channel plugin",
	importMetaUrl: import.meta.url,
	plugin: {
		specifier: "./api.js",
		exportName: "nextcloudTalkPlugin"
	},
	secrets: {
		specifier: "./secret-contract-api.js",
		exportName: "channelSecrets"
	},
	runtime: {
		specifier: "./runtime-api.js",
		exportName: "setNextcloudTalkRuntime"
	}
});
//#endregion
export { nextcloud_talk_default as default };
