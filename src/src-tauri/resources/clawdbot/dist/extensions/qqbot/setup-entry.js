import { defineBundledChannelSetupEntry } from "openclaw/plugin-sdk/channel-entry-contract";
//#region extensions/qqbot/setup-entry.ts
var setup_entry_default = defineBundledChannelSetupEntry({
	importMetaUrl: import.meta.url,
	plugin: {
		specifier: "./setup-plugin-api.js",
		exportName: "qqbotSetupPlugin"
	}
});
//#endregion
export { setup_entry_default as default };
