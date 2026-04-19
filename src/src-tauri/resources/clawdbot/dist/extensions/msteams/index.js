import { t as defineBundledChannelEntry } from "../../channel-entry-contract-mcFqxQzW.js";
//#region extensions/msteams/index.ts
var msteams_default = defineBundledChannelEntry({
	id: "msteams",
	name: "Microsoft Teams",
	description: "Microsoft Teams channel plugin (Bot Framework)",
	importMetaUrl: import.meta.url,
	plugin: {
		specifier: "./api.js",
		exportName: "msteamsPlugin"
	},
	secrets: {
		specifier: "./secret-contract-api.js",
		exportName: "channelSecrets"
	},
	runtime: {
		specifier: "./runtime-api.js",
		exportName: "setMSTeamsRuntime"
	}
});
//#endregion
export { msteams_default as default };
