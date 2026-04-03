import { i as defineChannelPluginEntry } from "../../core-BghMcc08.js";
import { n as setNextcloudTalkRuntime, t as nextcloudTalkPlugin } from "../../channel-W1Ul32NW.js";
//#region extensions/nextcloud-talk/index.ts
var nextcloud_talk_default = defineChannelPluginEntry({
	id: "nextcloud-talk",
	name: "Nextcloud Talk",
	description: "Nextcloud Talk channel plugin",
	plugin: nextcloudTalkPlugin,
	setRuntime: setNextcloudTalkRuntime
});
//#endregion
export { nextcloud_talk_default as default, nextcloudTalkPlugin, setNextcloudTalkRuntime };
