import { t as definePluginEntry } from "../../plugin-entry-DA7dUJNL.js";
import { t as createProviderApiKeyAuthMethod } from "../../provider-api-key-auth-BF3kHzmf.js";
import "../../provider-auth-api-key-g0GKEM-Y.js";
import { f as ensureModelAllowlistEntry } from "../../provider-onboard-DAFWptpQ.js";
import { n as buildDoubaoProvider, t as buildDoubaoCodingProvider } from "../../provider-catalog-Cqp_TPva.js";
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
			}
		});
	}
});
//#endregion
export { volcengine_default as default };
