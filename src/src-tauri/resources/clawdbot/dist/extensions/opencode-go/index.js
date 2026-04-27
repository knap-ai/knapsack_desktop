import { i as PASSTHROUGH_GEMINI_REPLAY_HOOKS } from "../../provider-model-shared-D-iKoymz.js";
import { t as definePluginEntry } from "../../plugin-entry-oWwpQhIC.js";
import { t as createOpencodeCatalogApiKeyAuthMethod } from "../../opencode-xFQq5FII.js";
import { n as applyOpencodeGoConfig, t as OPENCODE_GO_DEFAULT_MODEL_REF } from "../../onboard-mfh8K8Lm.js";
import { t as opencodeGoMediaUnderstandingProvider } from "../../media-understanding-provider-DmebkDYT.js";
import { r as normalizeOpencodeGoBaseUrl } from "../../provider-catalog-B-R-t2Um.js";
//#region extensions/opencode-go/index.ts
const PROVIDER_ID = "opencode-go";
var opencode_go_default = definePluginEntry({
	id: PROVIDER_ID,
	name: "OpenCode Go Provider",
	description: "Bundled OpenCode Go provider plugin",
	register(api) {
		api.registerProvider({
			id: PROVIDER_ID,
			label: "OpenCode Go",
			docsPath: "/providers/models",
			envVars: ["OPENCODE_API_KEY", "OPENCODE_ZEN_API_KEY"],
			auth: [createOpencodeCatalogApiKeyAuthMethod({
				providerId: PROVIDER_ID,
				label: "OpenCode Go catalog",
				optionKey: "opencodeGoApiKey",
				flagName: "--opencode-go-api-key",
				defaultModel: OPENCODE_GO_DEFAULT_MODEL_REF,
				applyConfig: (cfg) => applyOpencodeGoConfig(cfg),
				noteMessage: [
					"OpenCode uses one API key across the Zen and Go catalogs.",
					"Go focuses on Kimi, GLM, and MiniMax coding models.",
					"Get your API key at: https://opencode.ai/auth"
				].join("\n"),
				choiceId: "opencode-go",
				choiceLabel: "OpenCode Go catalog"
			})],
			normalizeConfig: ({ providerConfig }) => {
				const normalizedBaseUrl = normalizeOpencodeGoBaseUrl({
					api: providerConfig.api,
					baseUrl: providerConfig.baseUrl
				});
				return normalizedBaseUrl && normalizedBaseUrl !== providerConfig.baseUrl ? {
					...providerConfig,
					baseUrl: normalizedBaseUrl
				} : void 0;
			},
			normalizeResolvedModel: ({ model }) => {
				const normalizedBaseUrl = normalizeOpencodeGoBaseUrl({
					api: model.api,
					baseUrl: model.baseUrl
				});
				return normalizedBaseUrl && normalizedBaseUrl !== model.baseUrl ? {
					...model,
					baseUrl: normalizedBaseUrl
				} : void 0;
			},
			normalizeTransport: ({ api, baseUrl }) => {
				const normalizedBaseUrl = normalizeOpencodeGoBaseUrl({
					api,
					baseUrl
				});
				return normalizedBaseUrl && normalizedBaseUrl !== baseUrl ? {
					api,
					baseUrl: normalizedBaseUrl
				} : void 0;
			},
			...PASSTHROUGH_GEMINI_REPLAY_HOOKS,
			isModernModelRef: () => true
		});
		api.registerMediaUnderstandingProvider(opencodeGoMediaUnderstandingProvider);
	}
});
//#endregion
export { opencode_go_default as default };
