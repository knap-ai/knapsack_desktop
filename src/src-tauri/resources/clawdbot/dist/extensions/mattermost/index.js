import { i as defineChannelPluginEntry } from "../../core-BghMcc08.js";
import { n as registerSlashCommandRoute, r as setMattermostRuntime, t as mattermostPlugin } from "../../channel-DjAoNe_R.js";
//#region extensions/mattermost/index.ts
var mattermost_default = defineChannelPluginEntry({
	id: "mattermost",
	name: "Mattermost",
	description: "Mattermost channel plugin",
	plugin: mattermostPlugin,
	setRuntime: setMattermostRuntime,
	registerFull(api) {
		registerSlashCommandRoute(api);
	}
});
//#endregion
export { mattermost_default as default, mattermostPlugin, setMattermostRuntime };
