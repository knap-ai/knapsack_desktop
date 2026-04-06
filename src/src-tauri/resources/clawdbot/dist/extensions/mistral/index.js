import { t as defineSingleProviderPluginEntry } from "../../provider-entry-BnIQWKLx.js";
import { t as buildMistralProvider } from "../../provider-catalog-DTYMtV69.js";
import { n as applyMistralConfig, t as MISTRAL_DEFAULT_MODEL_REF } from "../../onboard-Bq4DQWS5.js";
import { n as applyMistralModelCompat, t as MISTRAL_MODEL_COMPAT_PATCH } from "../../api-OxFZRFM_.js";
import { t as mistralMediaUnderstandingProvider } from "../../media-understanding-provider-CANfVfEe.js";
//#region extensions/mistral/index.ts
const PROVIDER_ID = "mistral";
const MISTRAL_MODEL_HINTS = [
	"mistral",
	"mistralai",
	"mixtral",
	"codestral",
	"pixtral",
	"devstral",
	"ministral"
];
function isMistralBaseUrl(baseUrl) {
	if (typeof baseUrl !== "string" || !baseUrl.trim()) return false;
	try {
		return new URL(baseUrl).hostname.toLowerCase() === "api.mistral.ai";
	} catch {
		return baseUrl.toLowerCase().includes("api.mistral.ai");
	}
}
function isMistralModelHint(modelId) {
	const normalized = modelId.trim().toLowerCase();
	return MISTRAL_MODEL_HINTS.some((hint) => normalized === hint || normalized.startsWith(`${hint}/`) || normalized.startsWith(`${hint}-`) || normalized.startsWith(`${hint}:`));
}
function shouldContributeMistralCompat(params) {
	if (params.model.api !== "openai-completions") return false;
	return isMistralBaseUrl(params.model.baseUrl) || isMistralModelHint(params.modelId);
}
var mistral_default = defineSingleProviderPluginEntry({
	id: PROVIDER_ID,
	name: "Mistral Provider",
	description: "Bundled Mistral provider plugin",
	provider: {
		label: "Mistral",
		docsPath: "/providers/models",
		auth: [{
			methodId: "api-key",
			label: "Mistral API key",
			hint: "API key",
			optionKey: "mistralApiKey",
			flagName: "--mistral-api-key",
			envVar: "MISTRAL_API_KEY",
			promptMessage: "Enter Mistral API key",
			defaultModel: MISTRAL_DEFAULT_MODEL_REF,
			applyConfig: (cfg) => applyMistralConfig(cfg),
			wizard: { groupLabel: "Mistral AI" }
		}],
		catalog: {
			buildProvider: buildMistralProvider,
			allowExplicitBaseUrl: true
		},
		normalizeResolvedModel: ({ model }) => applyMistralModelCompat(model),
		contributeResolvedModelCompat: ({ modelId, model }) => shouldContributeMistralCompat({
			modelId,
			model
		}) ? MISTRAL_MODEL_COMPAT_PATCH : void 0,
		capabilities: {
			transcriptToolCallIdMode: "strict9",
			transcriptToolCallIdModelHints: [
				"mistral",
				"mixtral",
				"codestral",
				"pixtral",
				"devstral",
				"ministral",
				"mistralai"
			]
		}
	},
	register(api) {
		api.registerMediaUnderstandingProvider(mistralMediaUnderstandingProvider);
	}
});
//#endregion
export { mistral_default as default };
