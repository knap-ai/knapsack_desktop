import { B as openUrl, Bi as OLLAMA_DEFAULT_BASE_URL, Hi as enrichOllamaModelsWithContext, Ii as QIANFAN_DEFAULT_MODEL_ID, Ts as upsertAuthProfileWithLock, Ui as fetchOllamaModels, Vi as buildOllamaModelDefinition, Wi as resolveOllamaApiBase } from "./thread-bindings-SYAnWHuW.js";
import { t as createSubsystemLogger } from "./subsystem-7GlwMGJM.js";
import { r as isWSLEnv } from "./wsl-0Ac5HOgU.js";
import "node:fs";
import "node:path";
`${QIANFAN_DEFAULT_MODEL_ID}`;
//#endregion
//#region src/commands/onboard-auth.config-shared.ts
function extractAgentDefaultModelFallbacks(model) {
	if (!model || typeof model !== "object") return;
	if (!("fallbacks" in model)) return;
	const fallbacks = model.fallbacks;
	return Array.isArray(fallbacks) ? fallbacks.map((v) => String(v)) : void 0;
}
function applyAgentDefaultModelPrimary(cfg, primary) {
	const existingFallbacks = extractAgentDefaultModelFallbacks(cfg.agents?.defaults?.model);
	return {
		...cfg,
		agents: {
			...cfg.agents,
			defaults: {
				...cfg.agents?.defaults,
				model: {
					...existingFallbacks ? { fallbacks: existingFallbacks } : void 0,
					primary
				}
			}
		}
	};
}
//#endregion
//#region src/commands/onboard-auth.config-core.ts
function applyAuthProfileConfig(cfg, params) {
	const normalizedProvider = params.provider.toLowerCase();
	const profiles = {
		...cfg.auth?.profiles,
		[params.profileId]: {
			provider: params.provider,
			mode: params.mode,
			...params.email ? { email: params.email } : {}
		}
	};
	const configuredProviderProfiles = Object.entries(cfg.auth?.profiles ?? {}).filter(([, profile]) => profile.provider.toLowerCase() === normalizedProvider).map(([profileId, profile]) => ({
		profileId,
		mode: profile.mode
	}));
	const existingProviderOrder = cfg.auth?.order?.[params.provider];
	const preferProfileFirst = params.preferProfileFirst ?? true;
	const reorderedProviderOrder = existingProviderOrder && preferProfileFirst ? [params.profileId, ...existingProviderOrder.filter((profileId) => profileId !== params.profileId)] : existingProviderOrder;
	const hasMixedConfiguredModes = configuredProviderProfiles.some(({ profileId, mode }) => profileId !== params.profileId && mode !== params.mode);
	const derivedProviderOrder = existingProviderOrder === void 0 && preferProfileFirst && hasMixedConfiguredModes ? [params.profileId, ...configuredProviderProfiles.map(({ profileId }) => profileId).filter((profileId) => profileId !== params.profileId)] : void 0;
	const order = existingProviderOrder !== void 0 ? {
		...cfg.auth?.order,
		[params.provider]: reorderedProviderOrder?.includes(params.profileId) ? reorderedProviderOrder : [...reorderedProviderOrder ?? [], params.profileId]
	} : derivedProviderOrder ? {
		...cfg.auth?.order,
		[params.provider]: derivedProviderOrder
	} : cfg.auth?.order;
	return {
		...cfg,
		auth: {
			...cfg.auth,
			profiles,
			...order ? { order } : {}
		}
	};
}
createSubsystemLogger("opencode-zen-models");
//#endregion
//#region src/commands/self-hosted-provider-setup.ts
const SELF_HOSTED_DEFAULT_CONTEXT_WINDOW = 128e3;
const SELF_HOSTED_DEFAULT_MAX_TOKENS = 8192;
const SELF_HOSTED_DEFAULT_COST = {
	input: 0,
	output: 0,
	cacheRead: 0,
	cacheWrite: 0
};
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
	const baseUrl = (params.ctx.opts.customBaseUrl?.trim() || params.defaultBaseUrl).replace(/\/+$/, "");
	const modelId = params.ctx.opts.customModelId?.trim();
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
		flagValue: params.ctx.opts.customApiKey,
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
//#region src/wizard/prompts.ts
var WizardCancelledError = class extends Error {
	constructor(message = "wizard cancelled") {
		super(message);
		this.name = "WizardCancelledError";
	}
};
//#endregion
//#region src/commands/oauth-env.ts
function isRemoteEnvironment() {
	if (process.env.SSH_CLIENT || process.env.SSH_TTY || process.env.SSH_CONNECTION) return true;
	if (process.env.REMOTE_CONTAINERS || process.env.CODESPACES) return true;
	if (process.platform === "linux" && !process.env.DISPLAY && !process.env.WAYLAND_DISPLAY && !isWSLEnv()) return true;
	return false;
}
//#endregion
//#region src/commands/ollama-setup.ts
const OLLAMA_DEFAULT_MODEL = "glm-4.7-flash";
const OLLAMA_SUGGESTED_MODELS_LOCAL = ["glm-4.7-flash"];
const OLLAMA_SUGGESTED_MODELS_CLOUD = [
	"kimi-k2.5:cloud",
	"minimax-m2.5:cloud",
	"glm-5:cloud"
];
function normalizeOllamaModelName(value) {
	const trimmed = value?.trim();
	if (!trimmed) return;
	if (trimmed.toLowerCase().startsWith("ollama/")) return trimmed.slice(7).trim() || void 0;
	return trimmed;
}
function isOllamaCloudModel(modelName) {
	return Boolean(modelName?.trim().toLowerCase().endsWith(":cloud"));
}
function formatOllamaPullStatus(status) {
	const trimmed = status.trim();
	const partStatusMatch = trimmed.match(/^([a-z-]+)\s+(?:sha256:)?[a-f0-9]{8,}$/i);
	if (partStatusMatch) return {
		text: `${partStatusMatch[1]} part`,
		hidePercent: false
	};
	if (/^verifying\b.*\bdigest\b/i.test(trimmed)) return {
		text: "verifying digest",
		hidePercent: true
	};
	return {
		text: trimmed,
		hidePercent: false
	};
}
/** Check if the user is signed in to Ollama cloud via /api/me. */
async function checkOllamaCloudAuth(baseUrl) {
	try {
		const apiBase = resolveOllamaApiBase(baseUrl);
		const response = await fetch(`${apiBase}/api/me`, {
			method: "POST",
			signal: AbortSignal.timeout(5e3)
		});
		if (response.status === 401) return {
			signedIn: false,
			signinUrl: (await response.json()).signin_url
		};
		if (!response.ok) return { signedIn: false };
		return { signedIn: true };
	} catch {
		return { signedIn: false };
	}
}
async function pullOllamaModelCore(params) {
	const { onStatus } = params;
	const baseUrl = resolveOllamaApiBase(params.baseUrl);
	const modelName = normalizeOllamaModelName(params.modelName) ?? params.modelName.trim();
	try {
		const response = await fetch(`${baseUrl}/api/pull`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ name: modelName })
		});
		if (!response.ok) return {
			ok: false,
			kind: "http",
			message: `Failed to download ${modelName} (HTTP ${response.status})`
		};
		if (!response.body) return {
			ok: false,
			kind: "no-body",
			message: `Failed to download ${modelName} (no response body)`
		};
		const reader = response.body.getReader();
		const decoder = new TextDecoder();
		let buffer = "";
		const layers = /* @__PURE__ */ new Map();
		const parseLine = (line) => {
			const trimmed = line.trim();
			if (!trimmed) return { ok: true };
			try {
				const chunk = JSON.parse(trimmed);
				if (chunk.error) return {
					ok: false,
					kind: "chunk-error",
					message: `Download failed: ${chunk.error}`
				};
				if (!chunk.status) return { ok: true };
				if (chunk.total && chunk.completed !== void 0) {
					layers.set(chunk.status, {
						total: chunk.total,
						completed: chunk.completed
					});
					let totalSum = 0;
					let completedSum = 0;
					for (const layer of layers.values()) {
						totalSum += layer.total;
						completedSum += layer.completed;
					}
					const percent = totalSum > 0 ? Math.round(completedSum / totalSum * 100) : null;
					onStatus?.(chunk.status, percent);
				} else onStatus?.(chunk.status, null);
			} catch {}
			return { ok: true };
		};
		for (;;) {
			const { done, value } = await reader.read();
			if (done) break;
			buffer += decoder.decode(value, { stream: true });
			const lines = buffer.split("\n");
			buffer = lines.pop() ?? "";
			for (const line of lines) {
				const parsed = parseLine(line);
				if (!parsed.ok) return parsed;
			}
		}
		const trailing = buffer.trim();
		if (trailing) {
			const parsed = parseLine(trailing);
			if (!parsed.ok) return parsed;
		}
		return { ok: true };
	} catch (err) {
		return {
			ok: false,
			kind: "network",
			message: `Failed to download ${modelName}: ${err instanceof Error ? err.message : String(err)}`
		};
	}
}
/** Pull a model from Ollama, streaming progress updates. */
async function pullOllamaModel(baseUrl, modelName, prompter) {
	const spinner = prompter.progress(`Downloading ${modelName}...`);
	const result = await pullOllamaModelCore({
		baseUrl,
		modelName,
		onStatus: (status, percent) => {
			const displayStatus = formatOllamaPullStatus(status);
			if (displayStatus.hidePercent) spinner.update(`Downloading ${modelName} - ${displayStatus.text}`);
			else spinner.update(`Downloading ${modelName} - ${displayStatus.text} - ${percent ?? 0}%`);
		}
	});
	if (!result.ok) {
		spinner.stop(result.message);
		return false;
	}
	spinner.stop(`Downloaded ${modelName}`);
	return true;
}
async function pullOllamaModelNonInteractive(baseUrl, modelName, runtime) {
	runtime.log(`Downloading ${modelName}...`);
	const result = await pullOllamaModelCore({
		baseUrl,
		modelName
	});
	if (!result.ok) {
		runtime.error(result.message);
		return false;
	}
	runtime.log(`Downloaded ${modelName}`);
	return true;
}
function buildOllamaModelsConfig(modelNames, discoveredModelsByName) {
	return modelNames.map((name) => buildOllamaModelDefinition(name, discoveredModelsByName?.get(name)?.contextWindow));
}
function applyOllamaProviderConfig(cfg, baseUrl, modelNames, discoveredModelsByName) {
	return {
		...cfg,
		models: {
			...cfg.models,
			mode: cfg.models?.mode ?? "merge",
			providers: {
				...cfg.models?.providers,
				ollama: {
					baseUrl,
					api: "ollama",
					apiKey: "OLLAMA_API_KEY",
					models: buildOllamaModelsConfig(modelNames, discoveredModelsByName)
				}
			}
		}
	};
}
async function storeOllamaCredential(agentDir) {
	await upsertAuthProfileWithLock({
		profileId: "ollama:default",
		credential: {
			type: "api_key",
			provider: "ollama",
			key: "ollama-local"
		},
		agentDir
	});
}
/**
* Interactive: prompt for base URL, discover models, configure provider.
* Model selection is handled by the standard model picker downstream.
*/
async function promptAndConfigureOllama(params) {
	const { prompter } = params;
	const baseUrlRaw = await prompter.text({
		message: "Ollama base URL",
		initialValue: OLLAMA_DEFAULT_BASE_URL,
		placeholder: OLLAMA_DEFAULT_BASE_URL,
		validate: (value) => value?.trim() ? void 0 : "Required"
	});
	const baseUrl = resolveOllamaApiBase(String(baseUrlRaw ?? "").trim().replace(/\/+$/, ""));
	const { reachable, models } = await fetchOllamaModels(baseUrl);
	if (!reachable) {
		await prompter.note([
			`Ollama could not be reached at ${baseUrl}.`,
			"Download it at https://ollama.com/download",
			"",
			"Start Ollama and re-run onboarding."
		].join("\n"), "Ollama");
		throw new WizardCancelledError("Ollama not reachable");
	}
	const enrichedModels = await enrichOllamaModelsWithContext(baseUrl, models.slice(0, 50));
	const discoveredModelsByName = new Map(enrichedModels.map((model) => [model.name, model]));
	const modelNames = models.map((m) => m.name);
	const mode = await prompter.select({
		message: "Ollama mode",
		options: [{
			value: "remote",
			label: "Cloud + Local",
			hint: "Ollama cloud models + local models"
		}, {
			value: "local",
			label: "Local",
			hint: "Local models only"
		}]
	});
	let cloudAuthVerified = false;
	if (mode === "remote") {
		const authResult = await checkOllamaCloudAuth(baseUrl);
		if (!authResult.signedIn) if (authResult.signinUrl) {
			if (!isRemoteEnvironment()) await openUrl(authResult.signinUrl);
			await prompter.note(["Sign in to Ollama Cloud:", authResult.signinUrl].join("\n"), "Ollama Cloud");
			if (!await prompter.confirm({ message: "Have you signed in?" })) throw new WizardCancelledError("Ollama cloud sign-in cancelled");
			if (!(await checkOllamaCloudAuth(baseUrl)).signedIn) throw new WizardCancelledError("Ollama cloud sign-in required");
			cloudAuthVerified = true;
		} else {
			await prompter.note(["Could not verify Ollama Cloud authentication.", "Cloud models may not work until you sign in at https://ollama.com."].join("\n"), "Ollama Cloud");
			if (!await prompter.confirm({ message: "Continue without cloud auth?" })) throw new WizardCancelledError("Ollama cloud auth could not be verified");
		}
		else cloudAuthVerified = true;
	}
	const suggestedModels = mode === "local" || !cloudAuthVerified ? OLLAMA_SUGGESTED_MODELS_LOCAL : OLLAMA_SUGGESTED_MODELS_CLOUD;
	const orderedModelNames = [...suggestedModels, ...modelNames.filter((name) => !suggestedModels.includes(name))];
	const defaultModelId = suggestedModels[0] ?? "glm-4.7-flash";
	return {
		config: applyOllamaProviderConfig(params.cfg, baseUrl, orderedModelNames, discoveredModelsByName),
		defaultModelId
	};
}
/** Non-interactive: auto-discover models and configure provider. */
async function configureOllamaNonInteractive(params) {
	const { opts, runtime } = params;
	const baseUrl = resolveOllamaApiBase((opts.customBaseUrl?.trim() || OLLAMA_DEFAULT_BASE_URL).replace(/\/+$/, ""));
	const { reachable, models } = await fetchOllamaModels(baseUrl);
	const explicitModel = normalizeOllamaModelName(opts.customModelId);
	if (!reachable) {
		runtime.error([`Ollama could not be reached at ${baseUrl}.`, "Download it at https://ollama.com/download"].join("\n"));
		runtime.exit(1);
		return params.nextConfig;
	}
	await storeOllamaCredential();
	const enrichedModels = await enrichOllamaModelsWithContext(baseUrl, models.slice(0, 50));
	const discoveredModelsByName = new Map(enrichedModels.map((model) => [model.name, model]));
	const modelNames = models.map((m) => m.name);
	const suggestedModels = OLLAMA_SUGGESTED_MODELS_LOCAL;
	const orderedModelNames = [...suggestedModels, ...modelNames.filter((name) => !suggestedModels.includes(name))];
	const requestedDefaultModelId = explicitModel ?? suggestedModels[0];
	let pulledRequestedModel = false;
	const availableModelNames = new Set(modelNames);
	const requestedCloudModel = isOllamaCloudModel(requestedDefaultModelId);
	if (requestedCloudModel) availableModelNames.add(requestedDefaultModelId);
	if (!requestedCloudModel && !modelNames.includes(requestedDefaultModelId)) {
		pulledRequestedModel = await pullOllamaModelNonInteractive(baseUrl, requestedDefaultModelId, runtime);
		if (pulledRequestedModel) availableModelNames.add(requestedDefaultModelId);
	}
	let allModelNames = orderedModelNames;
	let defaultModelId = requestedDefaultModelId;
	if ((pulledRequestedModel || requestedCloudModel) && !allModelNames.includes(requestedDefaultModelId)) allModelNames = [...allModelNames, requestedDefaultModelId];
	if (!availableModelNames.has(requestedDefaultModelId)) if (availableModelNames.size > 0) {
		defaultModelId = allModelNames.find((name) => availableModelNames.has(name)) ?? Array.from(availableModelNames)[0];
		runtime.log(`Ollama model ${requestedDefaultModelId} was not available; using ${defaultModelId} instead.`);
	} else {
		runtime.error([`No Ollama models are available at ${baseUrl}.`, "Pull a model first, then re-run onboarding."].join("\n"));
		runtime.exit(1);
		return params.nextConfig;
	}
	const config = applyOllamaProviderConfig(params.nextConfig, baseUrl, allModelNames, discoveredModelsByName);
	const modelRef = `ollama/${defaultModelId}`;
	runtime.log(`Default Ollama model: ${defaultModelId}`);
	return applyAgentDefaultModelPrimary(config, modelRef);
}
/** Pull the configured default Ollama model if it isn't already available locally. */
async function ensureOllamaModelPulled(params) {
	const modelCfg = params.config.agents?.defaults?.model;
	const modelId = typeof modelCfg === "string" ? modelCfg : modelCfg?.primary;
	if (!modelId?.startsWith("ollama/")) return;
	const baseUrl = params.config.models?.providers?.ollama?.baseUrl ?? OLLAMA_DEFAULT_BASE_URL;
	const modelName = modelId.slice(7);
	if (isOllamaCloudModel(modelName)) return;
	const { models } = await fetchOllamaModels(baseUrl);
	if (models.some((m) => m.name === modelName)) return;
	if (!await pullOllamaModel(baseUrl, modelName, params.prompter)) throw new WizardCancelledError("Failed to download selected Ollama model");
}
//#endregion
//#region src/commands/vllm-setup.ts
const VLLM_DEFAULT_BASE_URL = "http://127.0.0.1:8000/v1";
const VLLM_DEFAULT_CONTEXT_WINDOW = SELF_HOSTED_DEFAULT_CONTEXT_WINDOW;
const VLLM_DEFAULT_MAX_TOKENS = SELF_HOSTED_DEFAULT_MAX_TOKENS;
const VLLM_DEFAULT_COST = SELF_HOSTED_DEFAULT_COST;
async function promptAndConfigureVllm(params) {
	const result = await promptAndConfigureOpenAICompatibleSelfHostedProvider({
		cfg: params.cfg,
		prompter: params.prompter,
		providerId: "vllm",
		providerLabel: "vLLM",
		defaultBaseUrl: VLLM_DEFAULT_BASE_URL,
		defaultApiKeyEnvVar: "VLLM_API_KEY",
		modelPlaceholder: "meta-llama/Meta-Llama-3-8B-Instruct"
	});
	return {
		config: result.config,
		modelId: result.modelId,
		modelRef: result.modelRef
	};
}
//#endregion
export { promptAndConfigureOpenAICompatibleSelfHostedProviderAuth as _, promptAndConfigureVllm as a, ensureOllamaModelPulled as c, SELF_HOSTED_DEFAULT_COST as d, SELF_HOSTED_DEFAULT_MAX_TOKENS as f, promptAndConfigureOpenAICompatibleSelfHostedProvider as g, discoverOpenAICompatibleSelfHostedProvider as h, VLLM_DEFAULT_MAX_TOKENS as i, promptAndConfigureOllama as l, configureOpenAICompatibleSelfHostedProviderNonInteractive as m, VLLM_DEFAULT_CONTEXT_WINDOW as n, OLLAMA_DEFAULT_MODEL as o, applyProviderDefaultModel as p, VLLM_DEFAULT_COST as r, configureOllamaNonInteractive as s, VLLM_DEFAULT_BASE_URL as t, SELF_HOSTED_DEFAULT_CONTEXT_WINDOW as u };
