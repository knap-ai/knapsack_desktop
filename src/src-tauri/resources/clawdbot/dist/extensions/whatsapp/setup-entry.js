import { defineBundledChannelSetupEntry } from "openclaw/plugin-sdk/channel-entry-contract";
//#region extensions/whatsapp/setup-entry.ts
var setup_entry_default = defineBundledChannelSetupEntry({
	importMetaUrl: import.meta.url,
	features: {
		legacyStateMigrations: true,
		legacySessionSurfaces: true
	},
	plugin: {
		specifier: "./setup-plugin-api.js",
		exportName: "whatsappSetupPlugin"
	}
});
//#endregion
export { setup_entry_default as default };
