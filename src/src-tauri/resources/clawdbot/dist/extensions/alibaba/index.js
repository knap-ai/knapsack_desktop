import { t as definePluginEntry } from "../../plugin-entry-Bkat4og3.js";
import { t as buildAlibabaVideoGenerationProvider } from "../../video-generation-provider-RBKHydQ1.js";
//#region extensions/alibaba/index.ts
var alibaba_default = definePluginEntry({
	id: "alibaba",
	name: "Alibaba Model Studio Plugin",
	description: "Bundled Alibaba Model Studio video provider plugin",
	register(api) {
		api.registerVideoGenerationProvider(buildAlibabaVideoGenerationProvider());
	}
});
//#endregion
export { alibaba_default as default };
