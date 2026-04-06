import { i as defineChannelPluginEntry } from "../../core-BghMcc08.js";
import { b as setMSTeamsRuntime } from "../../graph-users-F-Pl04ex.js";
import { t as msteamsPlugin } from "../../channel-BdILWSVn.js";
//#region extensions/msteams/index.ts
var msteams_default = defineChannelPluginEntry({
	id: "msteams",
	name: "Microsoft Teams",
	description: "Microsoft Teams channel plugin (Bot Framework)",
	plugin: msteamsPlugin,
	setRuntime: setMSTeamsRuntime
});
//#endregion
export { msteams_default as default, msteamsPlugin, setMSTeamsRuntime };
