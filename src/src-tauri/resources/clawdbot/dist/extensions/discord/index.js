import { defineBundledChannelEntry } from "openclaw/plugin-sdk/channel-entry-contract";
//#region extensions/discord/index.ts
let discordSubagentHooksPromise = null;
function loadDiscordSubagentHooksModule() {
	discordSubagentHooksPromise ??= import("./subagent-hooks-api.js");
	return discordSubagentHooksPromise;
}
var discord_default = defineBundledChannelEntry({
	id: "discord",
	name: "Discord",
	description: "Discord channel plugin",
	importMetaUrl: import.meta.url,
	plugin: {
		specifier: "./channel-plugin-api.js",
		exportName: "discordPlugin"
	},
	runtime: {
		specifier: "./runtime-api.js",
		exportName: "setDiscordRuntime"
	},
	accountInspect: {
		specifier: "./account-inspect-api.js",
		exportName: "inspectDiscordReadOnlyAccount"
	},
	registerFull(api) {
		api.on("subagent_spawning", async (event) => {
			const { handleDiscordSubagentSpawning } = await loadDiscordSubagentHooksModule();
			return await handleDiscordSubagentSpawning(api, event);
		});
		api.on("subagent_ended", async (event) => {
			const { handleDiscordSubagentEnded } = await loadDiscordSubagentHooksModule();
			handleDiscordSubagentEnded(event);
		});
		api.on("subagent_delivery_target", async (event) => {
			const { handleDiscordSubagentDeliveryTarget } = await loadDiscordSubagentHooksModule();
			return handleDiscordSubagentDeliveryTarget(event);
		});
	}
});
//#endregion
export { discord_default as default };
