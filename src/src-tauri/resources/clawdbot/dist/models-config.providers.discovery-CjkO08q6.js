import { t as createSubsystemLogger } from "./subsystem-DISldKSB.js";
import { Q as OLLAMA_DEFAULT_MAX_TOKENS, Z as OLLAMA_DEFAULT_COST, d as VLLM_PROVIDER_LABEL, et as enrichOllamaModelsWithContext, nt as isReasoningModelHeuristic, rt as resolveOllamaApiBase, s as SGLANG_PROVIDER_LABEL } from "./provider-models-BKjzpTsb.js";
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
//#region src/agents/models-config.providers.discovery.ts
const log = createSubsystemLogger("agents/model-providers");
const OLLAMA_SHOW_CONCURRENCY = 8;
const OLLAMA_SHOW_MAX_MODELS = 200;
async function discoverOllamaModels(baseUrl, opts) {
	if (process.env.VITEST || false) return [];
	try {
		const apiBase = resolveOllamaApiBase(baseUrl);
		const response = await fetch(`${apiBase}/api/tags`, { signal: AbortSignal.timeout(5e3) });
		if (!response.ok) {
			if (!opts?.quiet) log.warn(`Failed to discover Ollama models: ${response.status}`);
			return [];
		}
		const data = await response.json();
		if (!data.models || data.models.length === 0) {
			log.debug("No Ollama models found on local instance");
			return [];
		}
		const modelsToInspect = data.models.slice(0, OLLAMA_SHOW_MAX_MODELS);
		if (modelsToInspect.length < data.models.length && !opts?.quiet) log.warn(`Capping Ollama /api/show inspection to ${OLLAMA_SHOW_MAX_MODELS} models (received ${data.models.length})`);
		return (await enrichOllamaModelsWithContext(apiBase, modelsToInspect, { concurrency: OLLAMA_SHOW_CONCURRENCY })).map((model) => ({
			id: model.name,
			name: model.name,
			reasoning: isReasoningModelHeuristic(model.name),
			input: ["text"],
			cost: OLLAMA_DEFAULT_COST,
			contextWindow: model.contextWindow ?? 128e3,
			maxTokens: OLLAMA_DEFAULT_MAX_TOKENS
		}));
	} catch (error) {
		if (!opts?.quiet) log.warn(`Failed to discover Ollama models: ${String(error)}`);
		return [];
	}
}
async function discoverOpenAICompatibleLocalModels(params) {
	if (process.env.VITEST || false) return [];
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
async function buildOllamaProvider(configuredBaseUrl, opts) {
	const models = await discoverOllamaModels(configuredBaseUrl, opts);
	return {
		baseUrl: resolveOllamaApiBase(configuredBaseUrl),
		api: "ollama",
		models
	};
}
async function buildVllmProvider(params) {
	const baseUrl = (params?.baseUrl?.trim() || "http://127.0.0.1:8000/v1").replace(/\/+$/, "");
	return {
		baseUrl,
		api: "openai-completions",
		models: await discoverOpenAICompatibleLocalModels({
			baseUrl,
			apiKey: params?.apiKey,
			label: VLLM_PROVIDER_LABEL
		})
	};
}
async function buildSglangProvider(params) {
	const baseUrl = (params?.baseUrl?.trim() || "http://127.0.0.1:30000/v1").replace(/\/+$/, "");
	return {
		baseUrl,
		api: "openai-completions",
		models: await discoverOpenAICompatibleLocalModels({
			baseUrl,
			apiKey: params?.apiKey,
			label: SGLANG_PROVIDER_LABEL
		})
	};
}
//#endregion
export { SELF_HOSTED_DEFAULT_COST as a, SELF_HOSTED_DEFAULT_CONTEXT_WINDOW as i, buildSglangProvider as n, SELF_HOSTED_DEFAULT_MAX_TOKENS as o, buildVllmProvider as r, buildOllamaProvider as t };
