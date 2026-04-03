import { n as resolveMoonshotThinkingType, t as createMoonshotThinkingWrapper } from "../../moonshot-thinking-stream-wrappers-ARhjUCLc.js";
import { t as defineSingleProviderPluginEntry } from "../../provider-entry-BnIQWKLx.js";
import "../../provider-moonshot-BLDsPAGU.js";
import { a as buildMoonshotProvider, i as applyMoonshotNativeStreamingUsageCompat } from "../../provider-catalog-CYxnVAzN.js";
import { n as applyMoonshotConfig, r as applyMoonshotConfigCn, t as MOONSHOT_DEFAULT_MODEL_REF } from "../../onboard-BsVCVxAi.js";
import "../../api-NP0VAm3-.js";
import { r as moonshotMediaUnderstandingProvider } from "../../media-understanding-provider-yX8P1RRH.js";
import { n as createKimiWebSearchProvider } from "../../kimi-web-search-provider-C3PzoAJC.js";
var moonshot_default = defineSingleProviderPluginEntry({
	id: "moonshot",
	name: "Moonshot Provider",
	description: "Bundled Moonshot provider plugin",
	provider: {
		label: "Moonshot",
		docsPath: "/providers/moonshot",
		auth: [{
			methodId: "api-key",
			label: "Kimi API key (.ai)",
			hint: "Kimi K2.5 + Kimi",
			optionKey: "moonshotApiKey",
			flagName: "--moonshot-api-key",
			envVar: "MOONSHOT_API_KEY",
			promptMessage: "Enter Moonshot API key",
			defaultModel: MOONSHOT_DEFAULT_MODEL_REF,
			applyConfig: (cfg) => applyMoonshotConfig(cfg),
			wizard: { groupLabel: "Moonshot AI (Kimi K2.5)" }
		}, {
			methodId: "api-key-cn",
			label: "Kimi API key (.cn)",
			hint: "Kimi K2.5 + Kimi",
			optionKey: "moonshotApiKey",
			flagName: "--moonshot-api-key",
			envVar: "MOONSHOT_API_KEY",
			promptMessage: "Enter Moonshot API key (.cn)",
			defaultModel: MOONSHOT_DEFAULT_MODEL_REF,
			applyConfig: (cfg) => applyMoonshotConfigCn(cfg),
			wizard: { groupLabel: "Moonshot AI (Kimi K2.5)" }
		}],
		catalog: {
			buildProvider: buildMoonshotProvider,
			allowExplicitBaseUrl: true
		},
		applyNativeStreamingUsageCompat: ({ providerConfig }) => applyMoonshotNativeStreamingUsageCompat(providerConfig),
		wrapStreamFn: (ctx) => {
			const thinkingType = resolveMoonshotThinkingType({
				configuredThinking: ctx.extraParams?.thinking,
				thinkingLevel: ctx.thinkingLevel
			});
			return createMoonshotThinkingWrapper(ctx.streamFn, thinkingType);
		}
	},
	register(api) {
		api.registerMediaUnderstandingProvider(moonshotMediaUnderstandingProvider);
		api.registerWebSearchProvider(createKimiWebSearchProvider());
	}
});
//#endregion
export { moonshot_default as default };
