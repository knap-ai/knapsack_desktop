import "../logger-kwZIqwuw.js";
import "../paths-ViKUYWUK.js";
import "../tmp-openclaw-dir-idKIOMmb.js";
import "../theme-CdOoMzRk.js";
import "../globals-DBUMOBZ8.js";
import "../subsystem-DISldKSB.js";
import "../ansi-BEJF8NKS.js";
import "../utils-CS0Ikux6.js";
import "../paths-C4Oy7wjk.js";
import "../agent-scope-bjWqU22i.js";
import "../boundary-path-Dm0QJ7-y.js";
import "../boundary-file-read-DcZxlWD8.js";
import "../logger-BmpSCz93.js";
import "../exec-B5_AYfQG.js";
import "../workspace-D4K6QX9X.js";
import "../model-selection-BnFtDmP7.js";
import "../file-lock-DEiVq2ow.js";
import "../profiles-COPO-hHI.js";
import "../provider-catalog-rVN7ZbR5.js";
import "../provider-env-vars-CpUJqT5v.js";
import "../provider-model-minimax-DSmX4BNO.js";
import { c as VLLM_DEFAULT_API_KEY_ENV_VAR, d as VLLM_PROVIDER_LABEL, l as VLLM_DEFAULT_BASE_URL, u as VLLM_MODEL_PLACEHOLDER } from "../provider-models-BKjzpTsb.js";
import "../anthropic-vertex-provider-B2x4YywE.js";
import { t as OLLAMA_DEFAULT_BASE_URL } from "../ollama-defaults-h0YFzsNK.js";
import "../provider-catalog-BTgF8VyO.js";
import "../provider-catalog-D0IlX18O.js";
import "../provider-catalog-BTmUX0Mp.js";
import "../provider-catalog-sph_Rl63.js";
import "../provider-catalog-C7tUyBwV.js";
import "../provider-catalog-C8dPZpHW.js";
import "../provider-catalog-BJNff1VI.js";
import "../provider-catalog-IAdymoqT.js";
import "../provider-catalog-Bjc7evzh.js";
import { a as SELF_HOSTED_DEFAULT_COST, i as SELF_HOSTED_DEFAULT_CONTEXT_WINDOW, n as buildSglangProvider, o as SELF_HOSTED_DEFAULT_MAX_TOKENS, r as buildVllmProvider, t as buildOllamaProvider } from "../models-config.providers.discovery-CjkO08q6.js";
import "../setup-binary-C2MYZTCc.js";
import "../provider-auth-helpers-Do3RFvdi.js";
import "../upsert-with-lock-DhtwK9uY.js";
import "../setup-browser-C8lmlIf9.js";
import { i as promptAndConfigureOllama, n as configureOllamaNonInteractive, r as ensureOllamaModelPulled, t as OLLAMA_DEFAULT_MODEL } from "../provider-ollama-setup-CRcjfktP.js";
import { a as promptAndConfigureOpenAICompatibleSelfHostedProviderAuth, i as promptAndConfigureOpenAICompatibleSelfHostedProvider, n as configureOpenAICompatibleSelfHostedProviderNonInteractive, r as discoverOpenAICompatibleSelfHostedProvider, t as applyProviderDefaultModel } from "../provider-self-hosted-setup-B98pI7fU.js";
//#region src/plugins/provider-vllm-setup.ts
const VLLM_DEFAULT_CONTEXT_WINDOW = SELF_HOSTED_DEFAULT_CONTEXT_WINDOW;
const VLLM_DEFAULT_MAX_TOKENS = SELF_HOSTED_DEFAULT_MAX_TOKENS;
const VLLM_DEFAULT_COST = SELF_HOSTED_DEFAULT_COST;
async function promptAndConfigureVllm(params) {
	const result = await promptAndConfigureOpenAICompatibleSelfHostedProvider({
		cfg: params.cfg,
		prompter: params.prompter,
		providerId: "vllm",
		providerLabel: VLLM_PROVIDER_LABEL,
		defaultBaseUrl: VLLM_DEFAULT_BASE_URL,
		defaultApiKeyEnvVar: VLLM_DEFAULT_API_KEY_ENV_VAR,
		modelPlaceholder: VLLM_MODEL_PLACEHOLDER
	});
	return {
		config: result.config,
		modelId: result.modelId,
		modelRef: result.modelRef
	};
}
//#endregion
export { OLLAMA_DEFAULT_BASE_URL, OLLAMA_DEFAULT_MODEL, SELF_HOSTED_DEFAULT_CONTEXT_WINDOW, SELF_HOSTED_DEFAULT_COST, SELF_HOSTED_DEFAULT_MAX_TOKENS, VLLM_DEFAULT_BASE_URL, VLLM_DEFAULT_CONTEXT_WINDOW, VLLM_DEFAULT_COST, VLLM_DEFAULT_MAX_TOKENS, applyProviderDefaultModel, buildOllamaProvider, buildSglangProvider, buildVllmProvider, configureOllamaNonInteractive, configureOpenAICompatibleSelfHostedProviderNonInteractive, discoverOpenAICompatibleSelfHostedProvider, ensureOllamaModelPulled, promptAndConfigureOllama, promptAndConfigureOpenAICompatibleSelfHostedProvider, promptAndConfigureOpenAICompatibleSelfHostedProviderAuth, promptAndConfigureVllm };
