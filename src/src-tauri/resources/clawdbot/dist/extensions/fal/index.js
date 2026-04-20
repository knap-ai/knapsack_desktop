import { t as definePluginEntry } from "../../plugin-entry-Bkat4og3.js";
import { t as createProviderApiKeyAuthMethod } from "../../provider-api-key-auth-nkL4zxbI.js";
import "../../provider-auth-api-key-F-AGqwyB.js";
import { n as buildFalImageGenerationProvider } from "../../image-generation-provider-CYzutnph.js";
import { n as applyFalConfig, t as FAL_DEFAULT_IMAGE_MODEL_REF } from "../../onboard-DzOaTKWG.js";
import { n as buildFalVideoGenerationProvider } from "../../video-generation-provider-COu-o7sz.js";
//#region extensions/fal/index.ts
const PROVIDER_ID = "fal";
var fal_default = definePluginEntry({
	id: PROVIDER_ID,
	name: "fal Provider",
	description: "Bundled fal image and video generation provider",
	register(api) {
		api.registerProvider({
			id: PROVIDER_ID,
			label: "fal",
			docsPath: "/providers/models",
			envVars: ["FAL_KEY"],
			auth: [createProviderApiKeyAuthMethod({
				providerId: PROVIDER_ID,
				methodId: "api-key",
				label: "fal API key",
				hint: "Image and video generation API key",
				optionKey: "falApiKey",
				flagName: "--fal-api-key",
				envVar: "FAL_KEY",
				promptMessage: "Enter fal API key",
				defaultModel: FAL_DEFAULT_IMAGE_MODEL_REF,
				expectedProviders: ["fal"],
				applyConfig: (cfg) => applyFalConfig(cfg),
				wizard: {
					choiceId: "fal-api-key",
					choiceLabel: "fal API key",
					choiceHint: "Image and video generation API key",
					groupId: "fal",
					groupLabel: "fal",
					groupHint: "Image and video generation",
					onboardingScopes: ["image-generation"]
				}
			})]
		});
		api.registerImageGenerationProvider(buildFalImageGenerationProvider());
		api.registerVideoGenerationProvider(buildFalVideoGenerationProvider());
	}
});
//#endregion
export { fal_default as default };
