import { i as PASSTHROUGH_GEMINI_REPLAY_HOOKS } from "../../provider-model-shared-DyDnBaDe.js";
import { n as readConfiguredProviderCatalogEntries } from "../../provider-catalog-shared-CQPCLokR.js";
import { t as defineSingleProviderPluginEntry } from "../../provider-entry-ILplGnFF.js";
import { n as KILOCODE_THINKING_STREAM_HOOKS } from "../../provider-stream-DMhSzU-H.js";
import "../../provider-stream-family-CjEB-fh0.js";
import { s as KILOCODE_DEFAULT_MODEL_REF } from "../../provider-models-DqtwZN0T.js";
import { n as buildKilocodeProviderWithDiscovery } from "../../provider-catalog-BGmI3hcf.js";
import { t as applyKilocodeConfig } from "../../onboard-CatgEO6y.js";
//#region extensions/kilocode/index.ts
const PROVIDER_ID = "kilocode";
var kilocode_default = defineSingleProviderPluginEntry({
	id: PROVIDER_ID,
	name: "Kilo Gateway Provider",
	description: "Bundled Kilo Gateway provider plugin",
	provider: {
		label: "Kilo Gateway",
		docsPath: "/providers/kilocode",
		auth: [{
			methodId: "api-key",
			label: "Kilo Gateway API key",
			hint: "API key (OpenRouter-compatible)",
			optionKey: "kilocodeApiKey",
			flagName: "--kilocode-api-key",
			envVar: "KILOCODE_API_KEY",
			promptMessage: "Enter Kilo Gateway API key",
			defaultModel: KILOCODE_DEFAULT_MODEL_REF,
			applyConfig: (cfg) => applyKilocodeConfig(cfg)
		}],
		catalog: { buildProvider: buildKilocodeProviderWithDiscovery },
		augmentModelCatalog: ({ config }) => readConfiguredProviderCatalogEntries({
			config,
			providerId: PROVIDER_ID
		}),
		...PASSTHROUGH_GEMINI_REPLAY_HOOKS,
		...KILOCODE_THINKING_STREAM_HOOKS,
		isCacheTtlEligible: (ctx) => ctx.modelId.startsWith("anthropic/")
	}
});
//#endregion
export { kilocode_default as default };
