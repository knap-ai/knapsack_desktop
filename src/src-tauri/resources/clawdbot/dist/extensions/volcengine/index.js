import { t as definePluginEntry } from "../../plugin-entry-oWwpQhIC.js";
import { t as createProviderApiKeyAuthMethod } from "../../provider-api-key-auth-CRUz52Bz.js";
import "../../provider-auth-api-key-BVwjjhIk.js";
import { m as ensureModelAllowlistEntry } from "../../provider-onboard-VLZPCYnL.js";
import { c as DOUBAO_MODEL_CATALOG, i as DOUBAO_CODING_MODEL_CATALOG } from "../../models-C4kiWq5n.js";
import { n as buildDoubaoProvider, t as buildDoubaoCodingProvider } from "../../provider-catalog-1c5_xr2j.js";
//#region extensions/volcengine/index.ts
const PROVIDER_ID = "volcengine";
const VOLCENGINE_DEFAULT_MODEL_REF = "volcengine-plan/ark-code-latest";
var volcengine_default = definePluginEntry({
	id: PROVIDER_ID,
	name: "Volcengine Provider",
	description: "Bundled Volcengine provider plugin",
	register(api) {
		api.registerProvider({
			id: PROVIDER_ID,
			label: "Volcengine",
			docsPath: "/concepts/model-providers#volcano-engine-doubao",
			envVars: ["VOLCANO_ENGINE_API_KEY"],
			auth: [createProviderApiKeyAuthMethod({
				providerId: PROVIDER_ID,
				methodId: "api-key",
				label: "Volcano Engine API key",
				hint: "API key",
				optionKey: "volcengineApiKey",
				flagName: "--volcengine-api-key",
				envVar: "VOLCANO_ENGINE_API_KEY",
				promptMessage: "Enter Volcano Engine API key",
				defaultModel: VOLCENGINE_DEFAULT_MODEL_REF,
				expectedProviders: ["volcengine"],
				applyConfig: (cfg) => ensureModelAllowlistEntry({
					cfg,
					modelRef: VOLCENGINE_DEFAULT_MODEL_REF
				}),
				wizard: {
					choiceId: "volcengine-api-key",
					choiceLabel: "Volcano Engine API key",
					groupId: "volcengine",
					groupLabel: "Volcano Engine",
					groupHint: "API key"
				}
			})],
			catalog: {
				order: "paired",
				run: async (ctx) => {
					const apiKey = ctx.resolveProviderApiKey(PROVIDER_ID).apiKey;
					if (!apiKey) return null;
					return { providers: {
						volcengine: {
							...buildDoubaoProvider(),
							apiKey
						},
						"volcengine-plan": {
							...buildDoubaoCodingProvider(),
							apiKey
						}
					} };
				}
			},
			augmentModelCatalog: () => {
				const volcengineModels = DOUBAO_MODEL_CATALOG.map((entry) => ({
					provider: "volcengine",
					id: entry.id,
					name: entry.name,
					reasoning: entry.reasoning,
					input: [...entry.input],
					contextWindow: entry.contextWindow
				}));
				const volcenginePlanModels = DOUBAO_CODING_MODEL_CATALOG.map((entry) => ({
					provider: "volcengine-plan",
					id: entry.id,
					name: entry.name,
					reasoning: entry.reasoning,
					input: [...entry.input],
					contextWindow: entry.contextWindow
				}));
				return [...volcengineModels, ...volcenginePlanModels];
			}
		});
	}
});
//#endregion
export { volcengine_default as default };
