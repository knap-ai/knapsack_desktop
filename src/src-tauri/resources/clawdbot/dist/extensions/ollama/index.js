import { d as readStringValue, s as normalizeOptionalString } from "../../string-coerce-BUSzWgUA.js";
import { r as OPENAI_COMPATIBLE_REPLAY_HOOKS } from "../../provider-model-shared-DyDnBaDe.js";
import "../../text-runtime-DTMxvodz.js";
import { t as definePluginEntry } from "../../plugin-entry-Bkat4og3.js";
import { n as buildApiKeyCredential } from "../../provider-auth-helpers-DKL5bJRR.js";
import "../../provider-auth-DWLaZig-.js";
import { c as resolveOllamaApiBase, u as OLLAMA_DEFAULT_BASE_URL } from "../../provider-models-DyhFa3ck.js";
import { a as promptAndConfigureOllama, i as ensureOllamaModelPulled, r as configureOllamaNonInteractive, t as buildOllamaProvider } from "../../setup-D6EecEYF.js";
import { d as resolveConfiguredOllamaProviderConfig, o as createConfiguredOllamaCompatStreamWrapper, s as createConfiguredOllamaStreamFn } from "../../stream-ii_pg4bj.js";
import "../../api-D5d_-AZC.js";
import { n as createOllamaEmbeddingProvider, t as DEFAULT_OLLAMA_EMBEDDING_MODEL } from "../../embedding-provider-D_tJ64N5.js";
import { t as createOllamaWebSearchProvider } from "../../web-search-provider-DKxHFePO.js";
//#region extensions/ollama/src/memory-embedding-adapter.ts
const ollamaMemoryEmbeddingProviderAdapter = {
	id: "ollama",
	defaultModel: DEFAULT_OLLAMA_EMBEDDING_MODEL,
	transport: "remote",
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
const PROVIDER_ID = "ollama";
const DEFAULT_API_KEY = "ollama-local";
function resolveOllamaDiscoveryApiKey(params) {
	const envApiKey = params.env.OLLAMA_API_KEY?.trim() ? "OLLAMA_API_KEY" : void 0;
	const explicitApiKey = normalizeOptionalString(params.explicitApiKey);
	const resolvedApiKey = normalizeOptionalString(params.resolvedApiKey);
	return envApiKey ?? explicitApiKey ?? resolvedApiKey ?? DEFAULT_API_KEY;
}
function shouldSkipAmbientOllamaDiscovery(env) {
	return Boolean(env.VITEST) || env.NODE_ENV === "test";
}
function hasMeaningfulExplicitOllamaConfig(providerConfig) {
	if (!providerConfig) return false;
	if (Array.isArray(providerConfig.models) && providerConfig.models.length > 0) return true;
	if (typeof providerConfig.baseUrl === "string" && providerConfig.baseUrl.trim()) return resolveOllamaApiBase(providerConfig.baseUrl) !== OLLAMA_DEFAULT_BASE_URL;
	if (readStringValue(providerConfig.apiKey)) return true;
	if (providerConfig.auth) return true;
	if (typeof providerConfig.authHeader === "boolean") return true;
	if (providerConfig.headers && typeof providerConfig.headers === "object" && Object.keys(providerConfig.headers).length > 0) return true;
	if (providerConfig.request) return true;
	if (typeof providerConfig.injectNumCtxForOpenAICompat === "boolean") return true;
	return false;
}
var ollama_default = definePluginEntry({
	id: "ollama",
	name: "Ollama Provider",
	description: "Bundled Ollama provider plugin",
	register(api) {
		api.registerMemoryEmbeddingProvider(ollamaMemoryEmbeddingProviderAdapter);
		const pluginConfig = api.pluginConfig ?? {};
		api.registerWebSearchProvider(createOllamaWebSearchProvider());
		api.registerProvider({
			id: PROVIDER_ID,
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
							credential: buildApiKeyCredential(PROVIDER_ID, result.credential, void 0, result.credentialMode ? {
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
				run: async (ctx) => {
					const explicit = ctx.config.models?.providers?.ollama;
					const hasExplicitModels = Array.isArray(explicit?.models) && explicit.models.length > 0;
					const hasMeaningfulExplicitConfig = hasMeaningfulExplicitOllamaConfig(explicit);
					const discoveryEnabled = pluginConfig.discovery?.enabled ?? ctx.config.models?.ollamaDiscovery?.enabled;
					if (!hasExplicitModels && discoveryEnabled === false) return null;
					const ollamaKey = ctx.resolveProviderApiKey(PROVIDER_ID).apiKey;
					const hasRealOllamaKey = typeof ollamaKey === "string" && ollamaKey.trim().length > 0 && ollamaKey.trim() !== DEFAULT_API_KEY;
					const explicitApiKey = readStringValue(explicit?.apiKey);
					if (hasExplicitModels && explicit) return { provider: {
						...explicit,
						baseUrl: typeof explicit.baseUrl === "string" && explicit.baseUrl.trim() ? resolveOllamaApiBase(explicit.baseUrl) : OLLAMA_DEFAULT_BASE_URL,
						api: explicit.api ?? "ollama",
						apiKey: resolveOllamaDiscoveryApiKey({
							env: ctx.env,
							explicitApiKey,
							resolvedApiKey: ollamaKey
						})
					} };
					if (!hasRealOllamaKey && !hasMeaningfulExplicitConfig && shouldSkipAmbientOllamaDiscovery(ctx.env)) return null;
					const provider = await buildOllamaProvider(explicit?.baseUrl, { quiet: !hasRealOllamaKey && !hasMeaningfulExplicitConfig });
					if (provider.models.length === 0 && !ollamaKey && !explicit?.apiKey) return null;
					return { provider: {
						...provider,
						apiKey: resolveOllamaDiscoveryApiKey({
							env: ctx.env,
							explicitApiKey,
							resolvedApiKey: ollamaKey
						})
					} };
				}
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
					apiKey: DEFAULT_API_KEY,
					source: "models.providers.ollama (synthetic local key)",
					mode: "api-key"
				};
			},
			shouldDeferSyntheticProfileAuth: ({ resolvedApiKey }) => resolvedApiKey?.trim() === DEFAULT_API_KEY,
			buildUnknownModelHint: () => "Ollama requires authentication to be registered as a provider. Set OLLAMA_API_KEY=\"ollama-local\" (any value works) or run \"openclaw configure\". See: https://docs.openclaw.ai/providers/ollama"
		});
	}
});
//#endregion
export { ollama_default as default };
