import "../../defaults-CRz26M83.js";
import { a as normalizeModelCompat } from "../../provider-model-compat-K3Q805Kl.js";
import { d as cloneFirstTemplateModel, r as OPENAI_COMPATIBLE_REPLAY_HOOKS } from "../../provider-model-shared-Bqo51Ufw.js";
import { t as defineSingleProviderPluginEntry } from "../../provider-entry-C6jLvayT.js";
import { t as isFireworksKimiModelId } from "../../model-id-DqJW8d2_.js";
import { l as buildFireworksProvider } from "../../provider-catalog-B_pWjUuE.js";
import { n as applyFireworksConfig, t as FIREWORKS_DEFAULT_MODEL_REF } from "../../onboard-Ciuf61wl.js";
import { n as wrapFireworksProviderStream } from "../../stream-CbWn-B8P.js";
//#region extensions/fireworks/index.ts
const PROVIDER_ID = "fireworks";
function resolveFireworksDynamicModel(ctx) {
	const modelId = ctx.modelId.trim();
	if (!modelId) return;
	return cloneFirstTemplateModel({
		providerId: PROVIDER_ID,
		modelId,
		templateIds: ["accounts/fireworks/routers/kimi-k2p5-turbo"],
		ctx,
		patch: {
			provider: PROVIDER_ID,
			reasoning: !isFireworksKimiModelId(modelId)
		}
	}) ?? normalizeModelCompat({
		id: modelId,
		name: modelId,
		provider: PROVIDER_ID,
		api: "openai-completions",
		baseUrl: "https://api.fireworks.ai/inference/v1",
		reasoning: !isFireworksKimiModelId(modelId),
		input: ["text", "image"],
		cost: {
			input: 0,
			output: 0,
			cacheRead: 0,
			cacheWrite: 0
		},
		contextWindow: 256e3,
		maxTokens: 256e3
	});
}
var fireworks_default = defineSingleProviderPluginEntry({
	id: PROVIDER_ID,
	name: "Fireworks Provider",
	description: "Bundled Fireworks AI provider plugin",
	provider: {
		label: "Fireworks",
		aliases: ["fireworks-ai"],
		docsPath: "/providers/fireworks",
		auth: [{
			methodId: "api-key",
			label: "Fireworks API key",
			hint: "API key",
			optionKey: "fireworksApiKey",
			flagName: "--fireworks-api-key",
			envVar: "FIREWORKS_API_KEY",
			promptMessage: "Enter Fireworks API key",
			defaultModel: FIREWORKS_DEFAULT_MODEL_REF,
			applyConfig: (cfg) => applyFireworksConfig(cfg)
		}],
		catalog: {
			buildProvider: buildFireworksProvider,
			allowExplicitBaseUrl: true
		},
		...OPENAI_COMPATIBLE_REPLAY_HOOKS,
		wrapStreamFn: wrapFireworksProviderStream,
		resolveDynamicModel: (ctx) => resolveFireworksDynamicModel(ctx),
		isModernModelRef: () => true
	}
});
//#endregion
export { fireworks_default as default };
