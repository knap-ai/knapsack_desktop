import { t as definePluginEntry } from "../../plugin-entry-Bkat4og3.js";
import { t as groqMediaUnderstandingProvider } from "../../media-understanding-provider-CJ4Kvhrx.js";
//#region extensions/groq/index.ts
var groq_default = definePluginEntry({
	id: "groq",
	name: "Groq Media Understanding",
	description: "Bundled Groq audio transcription provider",
	register(api) {
		api.registerMediaUnderstandingProvider(groqMediaUnderstandingProvider);
	}
});
//#endregion
export { groq_default as default };
