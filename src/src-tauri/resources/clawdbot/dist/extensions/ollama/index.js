import { r as describeImagesWithModel, t as describeImageWithModel } from "../../image-runtime-tqu_Maks.js";
import "../../media-understanding-CQEEIK7j.js";
import { r as OPENAI_COMPATIBLE_REPLAY_HOOKS } from "../../provider-model-shared-D-iKoymz.js";
import { t as definePluginEntry } from "../../plugin-entry-oWwpQhIC.js";
import { n as buildApiKeyCredential } from "../../provider-auth-helpers-BIVX-4NW.js";
import "../../provider-auth-B7ecZcum.js";
import { r as resolvePluginConfigObject } from "../../config-runtime-Dutm3Ah0.js";
import { r as buildOllamaProvider } from "../../provider-models-13s6KSAW.js";
import { i as promptAndConfigureOllama, n as configureOllamaNonInteractive, r as ensureOllamaModelPulled } from "../../setup-BRcVshwu.js";
import { d as resolveConfiguredOllamaProviderConfig, l as isOllamaCompatProvider, o as createConfiguredOllamaCompatStreamWrapper, s as createConfiguredOllamaStreamFn } from "../../stream-T_wlRoVr.js";
import "../../api-D8UaXZCp.js";
import { i as resolveOllamaDiscoveryResult, n as OLLAMA_PROVIDER_ID, r as hasMeaningfulExplicitOllamaConfig, t as OLLAMA_DEFAULT_API_KEY } from "../../discovery-shared-HsqYWuXT.js";
import { n as createOllamaEmbeddingProvider, t as DEFAULT_OLLAMA_EMBEDDING_MODEL } from "../../embedding-provider-Cq3fKadr.js";
import { t as createOllamaWebSearchProvider } from "../../web-search-provider-BwRr1riq.js";
//#region extensions/ollama/src/media-understanding-provider.ts
const ollamaMediaUnderstandingProvider = {
	id: OLLAMA_PROVIDER_ID,
	capabilities: ["image"],
	describeImage: describeImageWithModel,
	describeImages: describeImagesWithModel
};
//#endregion
//#region extensions/ollama/src/memory-embedding-adapter.ts
const ollamaMemoryEmbeddingProviderAdapter = {
	id: "ollama",
	defaultModel: DEFAULT_OLLAMA_EMBEDDING_MODEL,
	transport: "remote",
	authProviderId: "ollama",
	create: async (options) => {
		const { provider, client } = await createOllamaEmbeddingProvider({
			...options,
			provider: "ollama",
			fallback: "none"
		});
		return {
			provider,
			runtime: {
				id: "ollama",
				cacheKeyData: {
					provider: "ollama",
					model: client.model
				}
			}
		};
	}
};
//#endregion
//#region extensions/ollama/index.ts
function usesOllamaOpenAICompatTransport(model) {
	return model.api === "openai-completions" && isOllamaCompatProvider({
		provider: typeof model.provider === "string" ? model.provider : void 0,
		baseUrl: typeof model.baseUrl === "string" ? model.baseUrl : void 0,
		api: "openai-completions"
	});
}
var ollama_default = definePluginEntry({
	id: "ollama",
	name: "Ollama Provider",
	description: "Bundled Ollama provider plugin",
	register(api) {
		api.registerMemoryEmbeddingProvider(ollamaMemoryEmbeddingProviderAdapter);
		api.registerMediaUnderstandingProvider(ollamaMediaUnderstandingProvider);
		const startupPluginConfig = api.pluginConfig ?? {};
		const resolveCurrentPluginConfig = (config) => {
			const runtimePluginConfig = resolvePluginConfigObject(config, "ollama");
			if (runtimePluginConfig) return runtimePluginConfig;
			return config ? {} : startupPluginConfig;
		};
		api.registerWebSearchProvider(createOllamaWebSearchProvider());
		api.registerProvider({
			id: OLLAMA_PROVIDER_ID,
			label: "Ollama",
			docsPath: "/providers/ollama",
			envVars: ["OLLAMA_API_KEY"],
			auth: [{
				id: "local",
				label: "Ollama",
				hint: "Cloud and local open models",
				kind: "custom",
				run: async (ctx) => {
					const result = await promptAndConfigureOllama({
						cfg: ctx.config,
						env: ctx.env,
						opts: ctx.opts,
						prompter: ctx.prompter,
						secretInputMode: ctx.secretInputMode,
						allowSecretRefPrompt: ctx.allowSecretRefPrompt
					});
					return {
						profiles: [{
							profileId: "ollama:default",
							credential: buildApiKeyCredential(OLLAMA_PROVIDER_ID, result.credential, void 0, result.credentialMode ? {
								secretInputMode: result.credentialMode,
								config: ctx.config
							} : void 0)
						}],
						configPatch: result.config
					};
				},
				runNonInteractive: async (ctx) => {
					return await configureOllamaNonInteractive({
						nextConfig: ctx.config,
						opts: {
							customBaseUrl: ctx.opts.customBaseUrl,
							customModelId: ctx.opts.customModelId
						},
						runtime: ctx.runtime,
						agentDir: ctx.agentDir
					});
				}
			}],
			discovery: {
				order: "late",
				run: async (ctx) => await resolveOllamaDiscoveryResult({
					ctx,
					pluginConfig: resolveCurrentPluginConfig(ctx.config),
					buildProvider: buildOllamaProvider
				})
			},
			wizard: {
				setup: {
					choiceId: "ollama",
					choiceLabel: "Ollama",
					choiceHint: "Cloud and local open models",
					groupId: "ollama",
					groupLabel: "Ollama",
					groupHint: "Cloud and local open models",
					methodId: "local",
					modelSelection: {
						promptWhenAuthChoiceProvided: true,
						allowKeepCurrent: false
					}
				},
				modelPicker: {
					label: "Ollama (custom)",
					hint: "Detect models from a local or remote Ollama instance",
					methodId: "local"
				}
			},
			onModelSelected: async ({ config, model, prompter }) => {
				if (!model.startsWith("ollama/")) return;
				await ensureOllamaModelPulled({
					config,
					model,
					prompter
				});
			},
			createStreamFn: ({ config, model, provider }) => {
				return createConfiguredOllamaStreamFn({
					model,
					providerBaseUrl: resolveConfiguredOllamaProviderConfig({
						config,
						providerId: provider
					})?.baseUrl
				});
			},
			...OPENAI_COMPATIBLE_REPLAY_HOOKS,
			contributeResolvedModelCompat: ({ model }) => usesOllamaOpenAICompatTransport(model) ? { supportsUsageInStreaming: true } : void 0,
			resolveReasoningOutputMode: () => "native",
			wrapStreamFn: createConfiguredOllamaCompatStreamWrapper,
			createEmbeddingProvider: async ({ config, model, remote }) => {
				const { provider, client } = await createOllamaEmbeddingProvider({
					config,
					remote,
					model: model || "nomic-embed-text"
				});
				return {
					...provider,
					client
				};
			},
			matchesContextOverflowError: ({ errorMessage }) => /\bollama\b.*(?:context length|too many tokens|context window)/i.test(errorMessage) || /\btruncating input\b.*\btoo long\b/i.test(errorMessage),
			resolveSyntheticAuth: ({ providerConfig }) => {
				if (!hasMeaningfulExplicitOllamaConfig(providerConfig)) return;
				return {
					apiKey: OLLAMA_DEFAULT_API_KEY,
					source: "models.providers.ollama (synthetic local key)",
					mode: "api-key"
				};
			},
			shouldDeferSyntheticProfileAuth: ({ resolvedApiKey }) => resolvedApiKey?.trim() === OLLAMA_DEFAULT_API_KEY,
			buildUnknownModelHint: () => "Ollama requires authentication to be registered as a provider. Set OLLAMA_API_KEY=\"ollama-local\" (any value works) or run \"openclaw configure\". See: https://docs.openclaw.ai/providers/ollama"
		});
	}
});
//#endregion
export { ollama_default as default };
