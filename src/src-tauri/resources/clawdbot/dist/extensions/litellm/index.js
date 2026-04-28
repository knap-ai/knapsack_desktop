import { t as defineSingleProviderPluginEntry } from "../../provider-entry-C6jLvayT.js";
import { i as applyLitellmConfig, r as LITELLM_DEFAULT_MODEL_REF } from "../../onboard-BTnx7hPL.js";
import { t as buildLitellmImageGenerationProvider } from "../../image-generation-provider-DUR9B6a7.js";
import { t as buildLitellmProvider } from "../../provider-catalog-D8E7QNM_.js";
var litellm_default = defineSingleProviderPluginEntry({
	id: "litellm",
	name: "LiteLLM Provider",
	description: "Bundled LiteLLM provider plugin",
	provider: {
		label: "LiteLLM",
		docsPath: "/providers/litellm",
		auth: [{
			methodId: "api-key",
			label: "LiteLLM API key",
			hint: "Unified gateway for 100+ LLM providers",
			optionKey: "litellmApiKey",
			flagName: "--litellm-api-key",
			envVar: "LITELLM_API_KEY",
			promptMessage: "Enter LiteLLM API key",
			defaultModel: LITELLM_DEFAULT_MODEL_REF,
			applyConfig: (cfg) => applyLitellmConfig(cfg),
			noteTitle: "LiteLLM",
			noteMessage: [
				"LiteLLM provides a unified API to 100+ LLM providers.",
				"Get your API key from your LiteLLM proxy or https://litellm.ai",
				"Default proxy runs on http://localhost:4000"
			].join("\n"),
			wizard: { groupHint: "Unified LLM gateway (100+ providers)" }
		}],
		catalog: {
			buildProvider: buildLitellmProvider,
			allowExplicitBaseUrl: true
		}
	},
	register(api) {
		api.registerImageGenerationProvider(buildLitellmImageGenerationProvider());
	}
});
//#endregion
export { litellm_default as default };
