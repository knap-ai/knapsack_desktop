import "../../defaults-BwiMD7ye.js";
import "../../provider-model-shared-B0P3sbBu.js";
import { t as definePluginEntry } from "../../plugin-entry-DA7dUJNL.js";
import { t as createProviderApiKeyAuthMethod } from "../../provider-api-key-auth-BF3kHzmf.js";
import "../../provider-auth-api-key-g0GKEM-Y.js";
import { c as isProxyReasoningUnsupported, n as loadOpenRouterModelCapabilities, o as createOpenRouterSystemCacheWrapper, s as createOpenRouterWrapper, t as getOpenRouterModelCapabilities } from "../../provider-stream-D_iORY-e.js";
import { t as openrouterMediaUnderstandingProvider } from "../../media-understanding-provider-o5geeFFg.js";
import { n as applyOpenrouterConfig, t as OPENROUTER_DEFAULT_MODEL_REF } from "../../onboard-CfiPYQYb.js";
import { t as buildOpenrouterProvider } from "../../provider-catalog-Nhyq2GoA.js";
//#region extensions/openrouter/index.ts
const PROVIDER_ID = "openrouter";
const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1";
const OPENROUTER_DEFAULT_MAX_TOKENS = 8192;
const OPENROUTER_CACHE_TTL_MODEL_PREFIXES = [
	"anthropic/",
	"moonshot/",
	"moonshotai/",
	"zai/"
];
function buildDynamicOpenRouterModel(ctx) {
	const capabilities = getOpenRouterModelCapabilities(ctx.modelId);
	return {
		id: ctx.modelId,
		name: capabilities?.name ?? ctx.modelId,
		api: "openai-completions",
		provider: PROVIDER_ID,
		baseUrl: OPENROUTER_BASE_URL,
		reasoning: capabilities?.reasoning ?? false,
		input: capabilities?.input ?? ["text"],
		cost: capabilities?.cost ?? {
			input: 0,
			output: 0,
			cacheRead: 0,
			cacheWrite: 0
		},
		contextWindow: capabilities?.contextWindow ?? 2e5,
		maxTokens: capabilities?.maxTokens ?? OPENROUTER_DEFAULT_MAX_TOKENS
	};
}
function injectOpenRouterRouting(baseStreamFn, providerRouting) {
	if (!providerRouting) return baseStreamFn;
	return (model, context, options) => (baseStreamFn ?? ((nextModel, nextContext, nextOptions) => {
		throw new Error(`OpenRouter routing wrapper requires an underlying streamFn for ${String(nextModel.id)}.`);
	}))({
		...model,
		compat: {
			...model.compat,
			openRouterRouting: providerRouting
		}
	}, context, options);
}
function isOpenRouterCacheTtlModel(modelId) {
	return OPENROUTER_CACHE_TTL_MODEL_PREFIXES.some((prefix) => modelId.startsWith(prefix));
}
var openrouter_default = definePluginEntry({
	id: "openrouter",
	name: "OpenRouter Provider",
	description: "Bundled OpenRouter provider plugin",
	register(api) {
		api.registerProvider({
			id: PROVIDER_ID,
			label: "OpenRouter",
			docsPath: "/providers/models",
			envVars: ["OPENROUTER_API_KEY"],
			auth: [createProviderApiKeyAuthMethod({
				providerId: PROVIDER_ID,
				methodId: "api-key",
				label: "OpenRouter API key",
				hint: "API key",
				optionKey: "openrouterApiKey",
				flagName: "--openrouter-api-key",
				envVar: "OPENROUTER_API_KEY",
				promptMessage: "Enter OpenRouter API key",
				defaultModel: OPENROUTER_DEFAULT_MODEL_REF,
				expectedProviders: ["openrouter"],
				applyConfig: (cfg) => applyOpenrouterConfig(cfg),
				wizard: {
					choiceId: "openrouter-api-key",
					choiceLabel: "OpenRouter API key",
					groupId: "openrouter",
					groupLabel: "OpenRouter",
					groupHint: "API key"
				}
			})],
			catalog: {
				order: "simple",
				run: async (ctx) => {
					const apiKey = ctx.resolveProviderApiKey(PROVIDER_ID).apiKey;
					if (!apiKey) return null;
					return { provider: {
						...buildOpenrouterProvider(),
						apiKey
					} };
				}
			},
			resolveDynamicModel: (ctx) => buildDynamicOpenRouterModel(ctx),
			prepareDynamicModel: async (ctx) => {
				await loadOpenRouterModelCapabilities(ctx.modelId);
			},
			capabilities: {
				openAiCompatTurnValidation: false,
				geminiThoughtSignatureSanitization: true,
				geminiThoughtSignatureModelHints: ["gemini"]
			},
			isModernModelRef: () => true,
			wrapStreamFn: (ctx) => {
				let streamFn = ctx.streamFn;
				const providerRouting = ctx.extraParams?.provider != null && typeof ctx.extraParams.provider === "object" ? ctx.extraParams.provider : void 0;
				if (providerRouting) streamFn = injectOpenRouterRouting(streamFn, providerRouting);
				const openRouterThinkingLevel = ctx.modelId === "auto" || isProxyReasoningUnsupported(ctx.modelId) ? void 0 : ctx.thinkingLevel;
				streamFn = createOpenRouterWrapper(streamFn, openRouterThinkingLevel);
				streamFn = createOpenRouterSystemCacheWrapper(streamFn);
				return streamFn;
			},
			isCacheTtlEligible: (ctx) => isOpenRouterCacheTtlModel(ctx.modelId)
		});
		api.registerMediaUnderstandingProvider(openrouterMediaUnderstandingProvider);
	}
});
//#endregion
export { openrouter_default as default };
