import { t as definePluginEntry } from "../../plugin-entry-oWwpQhIC.js";
import { n as buildFalImageGenerationProvider } from "../../image-generation-provider-BoLie6M0.js";
import { t as createFalProvider } from "../../provider-registration-DowjWtMs.js";
import { n as buildFalVideoGenerationProvider } from "../../video-generation-provider-Dj196kLF.js";
var fal_default = definePluginEntry({
	id: "fal",
	name: "fal Provider",
	description: "Bundled fal image and video generation provider",
	register(api) {
		api.registerProvider(createFalProvider());
		api.registerImageGenerationProvider(buildFalImageGenerationProvider());
		api.registerVideoGenerationProvider(buildFalVideoGenerationProvider());
	}
});
//#endregion
export { fal_default as default };
