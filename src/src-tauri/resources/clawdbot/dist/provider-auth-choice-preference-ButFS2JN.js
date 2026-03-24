import { a as resolveOpenClawAgentDir } from "./paths-C4Oy7wjk.js";
import { n as resolveAuthProfileOrder } from "./auth-profiles-DRuJBw5y.js";
import { a as upsertAuthProfile, c as ensureAuthProfileStore } from "./profiles-COPO-hHI.js";
import { a as normalizeSecretInputModeInput, i as normalizeApiKeyInput, n as ensureApiKeyFromOptionEnvOrPrompt, o as normalizeTokenProviderInput, s as validateApiKeyInput } from "./provider-auth-input-Bus9W_qh.js";
import { n as buildApiKeyCredential, t as applyAuthProfileConfig } from "./provider-auth-helpers-Do3RFvdi.js";
import { r as applyProviderConfigWithDefaultModel, t as applyAgentDefaultModelPrimary } from "./provider-onboarding-config-AjQQP6EK.js";
import { n as resolveManifestProviderAuthChoice, t as resolveManifestProviderApiKeyChoice } from "./provider-auth-choices-CD6TBMmn.js";
import { t as createAuthChoiceDefaultModelApplierForMutableState } from "./auth-choice.apply-helpers-D1SvSUlM.js";
//#region src/plugins/provider-auth-storage.ts
const resolveAuthAgentDir = (agentDir) => agentDir ?? resolveOpenClawAgentDir();
const LITELLM_DEFAULT_MODEL_REF = "litellm/claude-opus-4-6";
async function setCloudflareAiGatewayConfig(accountId, gatewayId, apiKey, agentDir, options) {
	upsertAuthProfile({
		profileId: "cloudflare-ai-gateway:default",
		credential: buildApiKeyCredential("cloudflare-ai-gateway", apiKey, {
			accountId: accountId.trim(),
			gatewayId: gatewayId.trim()
		}, options),
		agentDir: resolveAuthAgentDir(agentDir)
	});
}
async function setLitellmApiKey(key, agentDir, options) {
	upsertAuthProfile({
		profileId: "litellm:default",
		credential: buildApiKeyCredential("litellm", key, void 0, options),
		agentDir: resolveAuthAgentDir(agentDir)
	});
}
const LITELLM_DEFAULT_MODEL_ID = "claude-opus-4-6";
const LITELLM_DEFAULT_CONTEXT_WINDOW = 128e3;
const LITELLM_DEFAULT_MAX_TOKENS = 8192;
const LITELLM_DEFAULT_COST = {
	input: 0,
	output: 0,
	cacheRead: 0,
	cacheWrite: 0
};
function buildLitellmModelDefinition() {
	return {
		id: LITELLM_DEFAULT_MODEL_ID,
		name: "Claude Opus 4.6",
		reasoning: true,
		input: ["text", "image"],
		cost: LITELLM_DEFAULT_COST,
		contextWindow: LITELLM_DEFAULT_CONTEXT_WINDOW,
		maxTokens: LITELLM_DEFAULT_MAX_TOKENS
	};
}
function applyLitellmProviderConfig(cfg) {
	const models = { ...cfg.agents?.defaults?.models };
	models[LITELLM_DEFAULT_MODEL_REF] = {
		...models[LITELLM_DEFAULT_MODEL_REF],
		alias: models["litellm/claude-opus-4-6"]?.alias ?? "LiteLLM"
	};
	const defaultModel = buildLitellmModelDefinition();
	const existingProvider = cfg.models?.providers?.litellm;
	return applyProviderConfigWithDefaultModel(cfg, {
		agentModels: models,
		providerId: "litellm",
		api: "openai-completions",
		baseUrl: (typeof existingProvider?.baseUrl === "string" ? existingProvider.baseUrl.trim() : "") || "http://localhost:4000",
		defaultModel,
		defaultModelId: LITELLM_DEFAULT_MODEL_ID
	});
}
function applyLitellmConfig(cfg) {
	return applyAgentDefaultModelPrimary(applyLitellmProviderConfig(cfg), LITELLM_DEFAULT_MODEL_REF);
}
//#endregion
//#region src/commands/auth-choice.apply.api-key-providers.ts
async function applyLiteLlmApiKeyProvider({ params, authChoice, config, setConfig, getConfig, normalizedTokenProvider, requestedSecretInputMode, applyProviderDefaultModel, getAgentModelOverride }) {
	if (authChoice !== "litellm-api-key") return null;
	let nextConfig = config;
	const store = ensureAuthProfileStore(params.agentDir, { allowKeychainPrompt: false });
	const existingProfileId = resolveAuthProfileOrder({
		cfg: nextConfig,
		store,
		provider: "litellm"
	}).find((profileId) => Boolean(store.profiles[profileId]));
	const existingCred = existingProfileId ? store.profiles[existingProfileId] : void 0;
	let profileId = "litellm:default";
	let hasCredential = Boolean(existingProfileId && existingCred?.type === "api_key");
	if (hasCredential && existingProfileId) profileId = existingProfileId;
	if (!hasCredential) {
		await ensureApiKeyFromOptionEnvOrPrompt({
			token: params.opts?.token,
			tokenProvider: normalizedTokenProvider,
			secretInputMode: requestedSecretInputMode,
			config: nextConfig,
			expectedProviders: ["litellm"],
			provider: "litellm",
			envLabel: "LITELLM_API_KEY",
			promptMessage: "Enter LiteLLM API key",
			normalize: normalizeApiKeyInput,
			validate: validateApiKeyInput,
			prompter: params.prompter,
			setCredential: async (apiKey, mode) => setLitellmApiKey(apiKey, params.agentDir, { secretInputMode: mode }),
			noteMessage: "LiteLLM provides a unified API to 100+ LLM providers.\nGet your API key from your LiteLLM proxy or https://litellm.ai\nDefault proxy runs on http://localhost:4000",
			noteTitle: "LiteLLM"
		});
		hasCredential = true;
	}
	if (hasCredential) nextConfig = applyAuthProfileConfig(nextConfig, {
		profileId,
		provider: "litellm",
		mode: "api_key"
	});
	setConfig(nextConfig);
	await applyProviderDefaultModel({
		defaultModel: LITELLM_DEFAULT_MODEL_REF,
		applyDefaultConfig: applyLitellmConfig,
		applyProviderConfig: applyLitellmProviderConfig,
		noteDefault: LITELLM_DEFAULT_MODEL_REF
	});
	return {
		config: getConfig(),
		agentModelOverride: getAgentModelOverride()
	};
}
//#endregion
//#region src/commands/auth-choice.apply.api-providers.ts
const CORE_API_KEY_TOKEN_PROVIDER_AUTH_CHOICES = { litellm: "litellm-api-key" };
function normalizeApiKeyTokenProviderAuthChoice(params) {
	if (params.authChoice !== "apiKey" || !params.tokenProvider) return params.authChoice;
	const normalizedTokenProvider = normalizeTokenProviderInput(params.tokenProvider);
	if (!normalizedTokenProvider) return params.authChoice;
	return resolveManifestProviderApiKeyChoice({
		providerId: normalizedTokenProvider,
		config: params.config,
		workspaceDir: params.workspaceDir,
		env: params.env
	})?.choiceId ?? CORE_API_KEY_TOKEN_PROVIDER_AUTH_CHOICES[normalizedTokenProvider] ?? params.authChoice;
}
async function applyAuthChoiceApiProviders(params) {
	let nextConfig = params.config;
	let agentModelOverride;
	const applyProviderDefaultModel = createAuthChoiceDefaultModelApplierForMutableState(params, () => nextConfig, (config) => nextConfig = config, () => agentModelOverride, (model) => agentModelOverride = model);
	const authChoice = normalizeApiKeyTokenProviderAuthChoice({
		authChoice: params.authChoice,
		tokenProvider: params.opts?.tokenProvider,
		config: params.config,
		env: process.env
	});
	const normalizedTokenProvider = normalizeTokenProviderInput(params.opts?.tokenProvider);
	const requestedSecretInputMode = normalizeSecretInputModeInput(params.opts?.secretInputMode);
	const litellmResult = await applyLiteLlmApiKeyProvider({
		params,
		authChoice,
		config: nextConfig,
		setConfig: (config) => nextConfig = config,
		getConfig: () => nextConfig,
		normalizedTokenProvider,
		requestedSecretInputMode,
		applyProviderDefaultModel,
		getAgentModelOverride: () => agentModelOverride
	});
	if (litellmResult) return litellmResult;
	return null;
}
//#endregion
//#region src/plugins/provider-auth-choice-preference.ts
const PREFERRED_PROVIDER_BY_AUTH_CHOICE = {
	chutes: "chutes",
	"litellm-api-key": "litellm",
	"custom-api-key": "custom"
};
function normalizeLegacyAuthChoice(choice) {
	if (choice === "oauth") return "setup-token";
	if (choice === "claude-cli") return "setup-token";
	if (choice === "codex-cli") return "openai-codex";
	return choice;
}
async function resolvePreferredProviderForAuthChoice(params) {
	const choice = normalizeLegacyAuthChoice(params.choice) ?? params.choice;
	const manifestResolved = resolveManifestProviderAuthChoice(choice, params);
	if (manifestResolved) return manifestResolved.providerId;
	const { resolveProviderPluginChoice, resolvePluginProviders } = await import("./provider-auth-choice.runtime-D-pVS7jd.js");
	const pluginResolved = resolveProviderPluginChoice({
		providers: resolvePluginProviders({
			config: params.config,
			workspaceDir: params.workspaceDir,
			env: params.env,
			bundledProviderAllowlistCompat: true,
			bundledProviderVitestCompat: true
		}),
		choice
	});
	if (pluginResolved) return pluginResolved.provider.id;
	return PREFERRED_PROVIDER_BY_AUTH_CHOICE[choice];
}
//#endregion
export { setCloudflareAiGatewayConfig as a, applyLitellmConfig as i, applyAuthChoiceApiProviders as n, setLitellmApiKey as o, normalizeApiKeyTokenProviderAuthChoice as r, resolvePreferredProviderForAuthChoice as t };
