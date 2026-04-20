import { t as definePluginEntry } from "../../plugin-entry-Bkat4og3.js";
import { t as registerAnthropicPlugin } from "../../register.runtime-DmIHMeUp.js";
//#region extensions/anthropic/index.ts
var anthropic_default = definePluginEntry({
	id: "anthropic",
	name: "Anthropic Provider",
	description: "Bundled Anthropic provider plugin",
	register(api) {
		return registerAnthropicPlugin(api);
	}
});
//#endregion
export { anthropic_default as default };
