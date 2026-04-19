import { t as definePluginEntry } from "../../plugin-entry-Bkat4og3.js";
import { t as buildOpenAICodexCliBackend } from "../../cli-backend-gBOMQFPa.js";
//#region extensions/openai/setup-api.ts
var setup_api_default = definePluginEntry({
	id: "openai",
	name: "OpenAI Setup",
	description: "Lightweight OpenAI setup hooks",
	register(api) {
		api.registerCliBackend(buildOpenAICodexCliBackend());
	}
});
//#endregion
export { setup_api_default as default };
