import { t as definePluginEntry } from "../../plugin-entry-BBPiA0af.js";
//#region extensions/memory-wiki/cli-metadata.ts
var cli_metadata_default = definePluginEntry({
	id: "memory-wiki",
	name: "Memory Wiki",
	description: "Persistent wiki compiler and Obsidian-friendly knowledge vault for OpenClaw.",
	register(api) {
		api.registerCli(async ({ program, config: appConfig }) => {
			const [{ registerWikiCli }, { resolveMemoryWikiConfig }] = await Promise.all([import("../../cli-CV0y9_ll.js"), import("../../config-Ut-ZAqZ_.js")]);
			const pluginConfig = appConfig.plugins?.entries?.["memory-wiki"]?.config;
			registerWikiCli(program, resolveMemoryWikiConfig(pluginConfig), appConfig);
		}, { descriptors: [{
			name: "wiki",
			description: "Inspect and initialize the memory wiki vault",
			hasSubcommands: true
		}] });
	}
});
//#endregion
export { cli_metadata_default as default };
