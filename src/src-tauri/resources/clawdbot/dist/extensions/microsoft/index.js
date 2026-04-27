import { t as definePluginEntry } from "../../plugin-entry-oWwpQhIC.js";
import { t as buildMicrosoftSpeechProvider } from "../../speech-provider-MQL46F8o.js";
//#region extensions/microsoft/index.ts
var microsoft_default = definePluginEntry({
	id: "microsoft",
	name: "Microsoft Speech",
	description: "Bundled Microsoft speech provider",
	register(api) {
		api.registerSpeechProvider(buildMicrosoftSpeechProvider());
	}
});
//#endregion
export { microsoft_default as default };
