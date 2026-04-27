import { defineBundledChannelEntry, loadBundledEntryExportSync } from "openclaw/plugin-sdk/channel-entry-contract";
//#region extensions/qqbot/index.ts
function registerQQBotFull(api) {
	loadBundledEntryExportSync(import.meta.url, {
		specifier: "./api.js",
		exportName: "registerQQBotFull"
	})(api);
}
var qqbot_default = defineBundledChannelEntry({
	id: "qqbot",
	name: "QQ Bot",
	description: "QQ Bot channel plugin",
	importMetaUrl: import.meta.url,
	plugin: {
		specifier: "./channel-plugin-api.js",
		exportName: "qqbotPlugin"
	},
	runtime: {
		specifier: "./runtime-api.js",
		exportName: "setQQBotRuntime"
	},
	registerFull: registerQQBotFull
});
//#endregion
export { qqbot_default as default };
