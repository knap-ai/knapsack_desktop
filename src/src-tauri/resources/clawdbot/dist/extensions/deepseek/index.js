import { a as buildProviderReplayFamilyHooks } from "../../provider-model-shared-D-iKoymz.js";
import { n as readConfiguredProviderCatalogEntries } from "../../provider-catalog-shared-BIM0n3KJ.js";
import { t as defineSingleProviderPluginEntry } from "../../provider-entry-CVsaqhfb.js";
import { t as buildDeepSeekProvider } from "../../provider-catalog-DXv0pK8e.js";
import { t as createDeepSeekV4ThinkingWrapper } from "../../stream-BUfum08N.js";
import { n as applyDeepSeekConfig, t as DEEPSEEK_DEFAULT_MODEL_REF } from "../../onboard-Cu6zM9DK.js";
//#region extensions/deepseek/index.ts
const PROVIDER_ID = "deepseek";
var deepseek_default = defineSingleProviderPluginEntry({
	id: PROVIDER_ID,
	name: "DeepSeek Provider",
	description: "Bundled DeepSeek provider plugin",
	provider: {
		label: "DeepSeek",
		docsPath: "/providers/deepseek",
		auth: [{
			methodId: "api-key",
			label: "DeepSeek API key",
			hint: "API key",
			optionKey: "deepseekApiKey",
			flagName: "--deepseek-api-key",
			envVar: "DEEPSEEK_API_KEY",
			promptMessage: "Enter DeepSeek API key",
			defaultModel: DEEPSEEK_DEFAULT_MODEL_REF,
			applyConfig: (cfg) => applyDeepSeekConfig(cfg),
			wizard: {
				choiceId: "deepseek-api-key",
				choiceLabel: "DeepSeek API key",
				groupId: "deepseek",
				groupLabel: "DeepSeek",
				groupHint: "API key"
			}
		}],
		catalog: { buildProvider: buildDeepSeekProvider },
		augmentModelCatalog: ({ config }) => readConfiguredProviderCatalogEntries({
			config,
			providerId: PROVIDER_ID
		}),
		matchesContextOverflowError: ({ errorMessage }) => /\bdeepseek\b.*(?:input.*too long|context.*exceed)/i.test(errorMessage),
		...buildProviderReplayFamilyHooks({ family: "openai-compatible" }),
		wrapStreamFn: (ctx) => createDeepSeekV4ThinkingWrapper(ctx.streamFn, ctx.thinkingLevel),
		isModernModelRef: ({ modelId }) => {
			const lower = modelId.toLowerCase();
			return lower === "deepseek-v4-flash" || lower === "deepseek-v4-pro";
		}
	}
});
//#endregion
export { deepseek_default as default };
