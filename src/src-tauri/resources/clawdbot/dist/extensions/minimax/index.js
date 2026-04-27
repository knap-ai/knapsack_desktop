import { t as definePluginEntry } from "../../plugin-entry-oWwpQhIC.js";
import { n as buildMinimaxPortalImageGenerationProvider, t as buildMinimaxImageGenerationProvider } from "../../image-generation-provider-BkYRPv7h.js";
import { n as minimaxPortalMediaUnderstandingProvider, t as minimaxMediaUnderstandingProvider } from "../../media-understanding-provider-DVgfHPuu.js";
import { t as buildMinimaxMusicGenerationProvider } from "../../music-generation-provider-edLKMdmq.js";
import { t as registerMinimaxProviders } from "../../provider-registration-DXIEOvho.js";
import { t as buildMinimaxSpeechProvider } from "../../speech-provider-DkTw93vU.js";
import { t as createMiniMaxWebSearchProvider } from "../../minimax-web-search-provider-BW_4Zyd5.js";
import { t as buildMinimaxVideoGenerationProvider } from "../../video-generation-provider-Df1_29-_.js";
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
