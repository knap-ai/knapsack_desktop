import { t as createSubsystemLogger } from "./subsystem-CJEvHE2o.js";
import { d as resolveAuthStorePath, p as AUTH_STORE_LOCK_OPTIONS, u as ensureAuthStoreFile } from "./store-CY-e50gT.js";
import { i as withFileLock } from "./file-lock-B6EjeH4S.js";
import "./file-lock-ki4S5WEB.js";
import { n as saveJsonFile, t as loadJsonFile } from "./json-file-Cl6_4Szy.js";
import { t as normalizeOptionalSecretInput } from "./normalize-secret-input-CRNbANMO.js";
import { a as loadBundledPluginPublicSurfaceModuleSync } from "./facade-runtime-D_0VC8Qr.js";
import { t as applyAuthProfileConfig } from "./provider-auth-helpers-DN8kDr8X.js";
//#region src/agents/auth-profiles/upsert-with-lock.ts
function coerceAuthProfileStore(raw) {
	const record = raw && typeof raw === "object" ? raw : {};
	const profiles = record.profiles && typeof record.profiles === "object" && !Array.isArray(record.profiles) ? { ...record.profiles } : {};
	const order = record.order && typeof record.order === "object" && !Array.isArray(record.order) ? record.order : void 0;
	const lastGood = record.lastGood && typeof record.lastGood === "object" && !Array.isArray(record.lastGood) ? record.lastGood : void 0;
	const usageStats = record.usageStats && typeof record.usageStats === "object" && !Array.isArray(record.usageStats) ? record.usageStats : void 0;
	return {
		version: typeof record.version === "number" && Number.isFinite(record.version) ? record.version : 1,
		profiles,
		...order ? { order } : {},
		...lastGood ? { lastGood } : {},
		...usageStats ? { usageStats } : {}
	};
}
async function upsertAuthProfileWithLock(params) {
	const authPath = resolveAuthStorePath(params.agentDir);
	ensureAuthStoreFile(authPath);
	try {
		return await withFileLock(authPath, AUTH_STORE_LOCK_OPTIONS, async () => {
			const store = coerceAuthProfileStore(loadJsonFile(authPath));
			store.profiles[params.profileId] = params.credential;
			saveJsonFile(authPath, store);
			return store;
		});
	} catch {
		return null;
	}
}
//#endregion
//#region src/agents/self-hosted-provider-defaults.ts
const SELF_HOSTED_DEFAULT_CONTEXT_WINDOW = 128e3;
const SELF_HOSTED_DEFAULT_MAX_TOKENS = 8192;
const SELF_HOSTED_DEFAULT_COST = {
	input: 0,
	output: 0,
	cacheRead: 0,
	cacheWrite: 0
};
//#endregion
//#region src/plugin-sdk/provider-reasoning.ts
function loadFacadeModule() {
	return loadBundledPluginPublicSurfaceModuleSync({
		dirName: "ollama",
		artifactBasename: "api.js"
	});
}
const isReasoningModelHeuristic = ((...args) => loadFacadeModule()["isReasoningModelHeuristic"](...args));
//#endregion
//#region src/plugins/provider-self-hosted-setup.ts
const log = createSubsystemLogger("plugins/self-hosted-provider-setup");
async function discoverOpenAICompatibleLocalModels(params) {
	const env = params.env ?? process.env;
	if (env.VITEST || env.NODE_ENV === "test") return [];
	const url = `${params.baseUrl.trim().replace(/\/+$/, "")}/models`;
	try {
		const trimmedApiKey = params.apiKey?.trim();
		const response = await fetch(url, {
			headers: trimmedApiKey ? { Authorization: `Bearer ${trimmedApiKey}` } : void 0,
			signal: AbortSignal.timeout(5e3)
		});
		if (!response.ok) {
			log.warn(`Failed to discover ${params.label} models: ${response.status}`);
			return [];
		}
		const models = (await response.json()).data ?? [];
		if (models.length === 0) {
			log.warn(`No ${params.label} models found on local instance`);
			return [];
		}
		return models.map((model) => ({ id: typeof model.id === "string" ? model.id.trim() : "" })).filter((model) => Boolean(model.id)).map((model) => {
			const modelId = model.id;
			return {
				id: modelId,
				name: modelId,
				reasoning: isReasoningModelHeuristic(modelId),
				input: ["text"],
				cost: SELF_HOSTED_DEFAULT_COST,
				contextWindow: params.contextWindow ?? 128e3,
				maxTokens: params.maxTokens ?? 8192
			};
		});
	} catch (error) {
		log.warn(`Failed to discover ${params.label} models: ${String(error)}`);
		return [];
	}
}
function applyProviderDefaultModel(cfg, modelRef) {
	const existingModel = cfg.agents?.defaults?.model;
	const fallbacks = existingModel && typeof existingModel === "object" && "fallbacks" in existingModel ? existingModel.fallbacks : void 0;
	return {
		...cfg,
		agents: {
			...cfg.agents,
			defaults: {
				...cfg.agents?.defaults,
				model: {
					...fallbacks ? { fallbacks } : void 0,
					primary: modelRef
				}
			}
		}
	};
}
function buildOpenAICompatibleSelfHostedProviderConfig(params) {
	const modelRef = `${params.providerId}/${params.modelId}`;
	const profileId = `${params.providerId}:default`;
	return {
		config: {
			...params.cfg,
			models: {
				...params.cfg.models,
				mode: params.cfg.models?.mode ?? "merge",
				providers: {
					...params.cfg.models?.providers,
					[params.providerId]: {
						baseUrl: params.baseUrl,
						api: "openai-completions",
						apiKey: params.providerApiKey,
						models: [{
							id: params.modelId,
							name: params.modelId,
							reasoning: params.reasoning ?? false,
							input: params.input ?? ["text"],
							cost: SELF_HOSTED_DEFAULT_COST,
							contextWindow: params.contextWindow ?? 128e3,
							maxTokens: params.maxTokens ?? 8192
						}]
					}
				}
			}
		},
		modelId: params.modelId,
		modelRef,
		profileId
	};
}
function buildSelfHostedProviderAuthResult(result) {
	return {
		profiles: [{
			profileId: result.profileId,
			credential: result.credential
		}],
		configPatch: result.config,
		defaultModel: result.modelRef
	};
}
async function promptAndConfigureOpenAICompatibleSelfHostedProvider(params) {
	const baseUrlRaw = await params.prompter.text({
		message: `${params.providerLabel} base URL`,
		initialValue: params.defaultBaseUrl,
		placeholder: params.defaultBaseUrl,
		validate: (value) => value?.trim() ? void 0 : "Required"
	});
	const apiKeyRaw = await params.prompter.text({
		message: `${params.providerLabel} API key`,
		placeholder: "sk-... (or any non-empty string)",
		validate: (value) => value?.trim() ? void 0 : "Required"
	});
	const modelIdRaw = await params.prompter.text({
		message: `${params.providerLabel} model`,
		placeholder: params.modelPlaceholder,
		validate: (value) => value?.trim() ? void 0 : "Required"
	});
	const baseUrl = String(baseUrlRaw ?? "").trim().replace(/\/+$/, "");
	const apiKey = String(apiKeyRaw ?? "").trim();
	const modelId = String(modelIdRaw ?? "").trim();
	const credential = {
		type: "api_key",
		provider: params.providerId,
		key: apiKey
	};
	const configured = buildOpenAICompatibleSelfHostedProviderConfig({
		cfg: params.cfg,
		providerId: params.providerId,
		baseUrl,
		providerApiKey: params.defaultApiKeyEnvVar,
		modelId,
		input: params.input,
		reasoning: params.reasoning,
		contextWindow: params.contextWindow,
		maxTokens: params.maxTokens
	});
	return {
		config: configured.config,
		credential,
		modelId: configured.modelId,
		modelRef: configured.modelRef,
		profileId: configured.profileId
	};
}
async function promptAndConfigureOpenAICompatibleSelfHostedProviderAuth(params) {
	return buildSelfHostedProviderAuthResult(await promptAndConfigureOpenAICompatibleSelfHostedProvider(params));
}
async function discoverOpenAICompatibleSelfHostedProvider(params) {
	if (params.ctx.config.models?.providers?.[params.providerId]) return null;
	const { apiKey, discoveryApiKey } = params.ctx.resolveProviderApiKey(params.providerId);
	if (!apiKey) return null;
	return { provider: {
		...await params.buildProvider({ apiKey: discoveryApiKey }),
		apiKey
	} };
}
function buildMissingNonInteractiveModelIdMessage(params) {
	return [`Missing --custom-model-id for --auth-choice ${params.authChoice}.`, `Pass the ${params.providerLabel} model id to use, for example ${params.modelPlaceholder}.`].join("\n");
}
function buildSelfHostedProviderCredential(params) {
	return params.ctx.toApiKeyCredential({
		provider: params.providerId,
		resolved: params.resolved
	});
}
async function configureOpenAICompatibleSelfHostedProviderNonInteractive(params) {
	const baseUrl = (normalizeOptionalSecretInput(params.ctx.opts.customBaseUrl) ?? params.defaultBaseUrl).replace(/\/+$/, "");
	const modelId = normalizeOptionalSecretInput(params.ctx.opts.customModelId);
	if (!modelId) {
		params.ctx.runtime.error(buildMissingNonInteractiveModelIdMessage({
			authChoice: params.ctx.authChoice,
			providerLabel: params.providerLabel,
			modelPlaceholder: params.modelPlaceholder
		}));
		params.ctx.runtime.exit(1);
		return null;
	}
	const resolved = await params.ctx.resolveApiKey({
		provider: params.providerId,
		flagValue: normalizeOptionalSecretInput(params.ctx.opts.customApiKey),
		flagName: "--custom-api-key",
		envVar: params.defaultApiKeyEnvVar,
		envVarName: params.defaultApiKeyEnvVar
	});
	if (!resolved) return null;
	const credential = buildSelfHostedProviderCredential({
		ctx: params.ctx,
		providerId: params.providerId,
		resolved
	});
	if (!credential) return null;
	const configured = buildOpenAICompatibleSelfHostedProviderConfig({
		cfg: params.ctx.config,
		providerId: params.providerId,
		baseUrl,
		providerApiKey: params.defaultApiKeyEnvVar,
		modelId,
		input: params.input,
		reasoning: params.reasoning,
		contextWindow: params.contextWindow,
		maxTokens: params.maxTokens
	});
	await upsertAuthProfileWithLock({
		profileId: configured.profileId,
		credential,
		agentDir: params.ctx.agentDir
	});
	const withProfile = applyAuthProfileConfig(configured.config, {
		profileId: configured.profileId,
		provider: params.providerId,
		mode: "api_key"
	});
	params.ctx.runtime.log(`Default ${params.providerLabel} model: ${modelId}`);
	return applyProviderDefaultModel(withProfile, configured.modelRef);
}
//#endregion
export { promptAndConfigureOpenAICompatibleSelfHostedProvider as a, SELF_HOSTED_DEFAULT_COST as c, discoverOpenAICompatibleSelfHostedProvider as i, SELF_HOSTED_DEFAULT_MAX_TOKENS as l, configureOpenAICompatibleSelfHostedProviderNonInteractive as n, promptAndConfigureOpenAICompatibleSelfHostedProviderAuth as o, discoverOpenAICompatibleLocalModels as r, SELF_HOSTED_DEFAULT_CONTEXT_WINDOW as s, applyProviderDefaultModel as t };
