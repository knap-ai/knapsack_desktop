import { t as definePluginEntry } from "../../plugin-entry-Bkat4og3.js";
import { n as buildMinimaxPortalImageGenerationProvider, t as buildMinimaxImageGenerationProvider } from "../../image-generation-provider-DIl7PYBR.js";
import { n as minimaxPortalMediaUnderstandingProvider, t as minimaxMediaUnderstandingProvider } from "../../media-understanding-provider-DGy4VRCO.js";
import { t as buildMinimaxMusicGenerationProvider } from "../../music-generation-provider-BvV6__9r.js";
import { t as registerMinimaxProviders } from "../../provider-registration-DhNpEG88.js";
import { t as buildMinimaxSpeechProvider } from "../../speech-provider-CDmMKLQN.js";
import { t as createMiniMaxWebSearchProvider } from "../../minimax-web-search-provider-_Bu2WXDX.js";
import { t as buildMinimaxVideoGenerationProvider } from "../../video-generation-provider-DQhRiL_S.js";
//#region extensions/minimax/index.ts
var minimax_default = definePluginEntry({
	id: "minimax",
	name: "MiniMax",
	description: "Bundled MiniMax API-key and OAuth provider plugin",
	register(api) {
		registerMinimaxProviders(api);
		api.registerMediaUnderstandingProvider(minimaxMediaUnderstandingProvider);
		api.registerMediaUnderstandingProvider(minimaxPortalMediaUnderstandingProvider);
		api.registerImageGenerationProvider(buildMinimaxImageGenerationProvider());
		api.registerImageGenerationProvider(buildMinimaxPortalImageGenerationProvider());
		api.registerMusicGenerationProvider(buildMinimaxMusicGenerationProvider());
		api.registerVideoGenerationProvider(buildMinimaxVideoGenerationProvider());
		api.registerSpeechProvider(buildMinimaxSpeechProvider());
		api.registerWebSearchProvider(createMiniMaxWebSearchProvider());
	}
});
//#endregion
export { minimax_default as default };
