import { t as definePluginEntry } from "../../plugin-entry-BBPiA0af.js";
import { n as buildFalImageGenerationProvider } from "../../image-generation-provider-Dl0sGOUU.js";
import { t as createFalProvider } from "../../provider-registration-hKAtjZGt.js";
import { n as buildFalVideoGenerationProvider } from "../../video-generation-provider-B56Klhi0.js";
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
