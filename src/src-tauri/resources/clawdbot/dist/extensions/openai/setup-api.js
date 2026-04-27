import { t as definePluginEntry } from "../../plugin-entry-oWwpQhIC.js";
import { t as buildOpenAICodexCliBackend } from "../../cli-backend-JwVjPiHZ.js";
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
