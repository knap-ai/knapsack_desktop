import { t as createSubsystemLogger } from "./subsystem-DISldKSB.js";
import { C as sleep } from "./utils-CS0Ikux6.js";
import "./defaults-eEZJg44K.js";
import { m as resolveAllowlistModelKey } from "./model-selection-BnFtDmP7.js";
import { C as KILOCODE_MODEL_CATALOG, _ as KILOCODE_DEFAULT_CONTEXT_WINDOW, b as KILOCODE_DEFAULT_MODEL_ID, g as KILOCODE_BASE_URL, v as KILOCODE_DEFAULT_COST, x as KILOCODE_DEFAULT_MODEL_NAME, y as KILOCODE_DEFAULT_MAX_TOKENS } from "./provider-model-minimax-DSmX4BNO.js";
import { t as applyAgentDefaultPrimaryModel } from "./provider-model-primary-hZW-Mq-r.js";
import { t as OLLAMA_DEFAULT_BASE_URL } from "./ollama-defaults-h0YFzsNK.js";
//#region src/plugins/provider-model-allowlist.ts
function ensureModelAllowlistEntry(params) {
	const rawModelRef = params.modelRef.trim();
	if (!rawModelRef) return params.cfg;
	const models = { ...params.cfg.agents?.defaults?.models };
	const keySet = new Set([rawModelRef]);
	const canonicalKey = resolveAllowlistModelKey(rawModelRef, params.defaultProvider ?? "anthropic");
	if (canonicalKey) keySet.add(canonicalKey);
	for (const key of keySet) models[key] = { ...models[key] };
	return {
		...params.cfg,
		agents: {
			...params.cfg.agents,
			defaults: {
				...params.cfg.agents?.defaults,
				models
			}
		}
	};
}
//#endregion
//#region src/plugins/provider-model-defaults.ts
const OPENAI_DEFAULT_MODEL = "openai/gpt-5.4";
const OPENAI_CODEX_DEFAULT_MODEL = "openai-codex/gpt-5.4";
const OPENAI_DEFAULT_IMAGE_MODEL = "gpt-image-1";
const OPENAI_DEFAULT_TTS_MODEL = "gpt-4o-mini-tts";
const OPENAI_DEFAULT_TTS_VOICE = "alloy";
const OPENAI_DEFAULT_AUDIO_TRANSCRIPTION_MODEL = "gpt-4o-mini-transcribe";
const OPENAI_DEFAULT_EMBEDDING_MODEL = "text-embedding-3-small";
const GOOGLE_GEMINI_DEFAULT_MODEL = "google/gemini-3.1-pro-preview";
const OPENCODE_GO_DEFAULT_MODEL_REF = "opencode-go/kimi-k2.5";
const OPENCODE_ZEN_DEFAULT_MODEL$1 = "opencode/claude-opus-4-6";
function applyGoogleGeminiModelDefault(cfg) {
	return applyAgentDefaultPrimaryModel({
		cfg,
		model: GOOGLE_GEMINI_DEFAULT_MODEL
	});
}
function applyOpenAIProviderConfig(cfg) {
	const next = ensureModelAllowlistEntry({
		cfg,
		modelRef: OPENAI_DEFAULT_MODEL
	});
	const models = { ...next.agents?.defaults?.models };
	models[OPENAI_DEFAULT_MODEL] = {
		...models[OPENAI_DEFAULT_MODEL],
		alias: models["openai/gpt-5.4"]?.alias ?? "GPT"
	};
	return {
		...next,
		agents: {
			...next.agents,
			defaults: {
				...next.agents?.defaults,
				models
			}
		}
	};
}
function applyOpenAIConfig(cfg) {
	const next = applyOpenAIProviderConfig(cfg);
	return {
		...next,
		agents: {
			...next.agents,
			defaults: {
				...next.agents?.defaults,
				model: next.agents?.defaults?.model && typeof next.agents.defaults.model === "object" ? {
					...next.agents.defaults.model,
					primary: OPENAI_DEFAULT_MODEL
				} : { primary: OPENAI_DEFAULT_MODEL }
			}
		}
	};
}
createSubsystemLogger("opencode-zen-models");
const OPENCODE_ZEN_DEFAULT_MODEL_REF = `opencode/claude-opus-4-6`;
const CLOUDFLARE_AI_GATEWAY_DEFAULT_MODEL_REF = `cloudflare-ai-gateway/claude-sonnet-4-5`;
const CLOUDFLARE_AI_GATEWAY_DEFAULT_CONTEXT_WINDOW = 2e5;
const CLOUDFLARE_AI_GATEWAY_DEFAULT_MAX_TOKENS = 64e3;
const CLOUDFLARE_AI_GATEWAY_DEFAULT_COST = {
	input: 3,
	output: 15,
	cacheRead: .3,
	cacheWrite: 3.75
};
function buildCloudflareAiGatewayModelDefinition(params) {
	return {
		id: params?.id?.trim() || "claude-sonnet-4-5",
		name: params?.name ?? "Claude Sonnet 4.5",
		reasoning: params?.reasoning ?? true,
		input: params?.input ?? ["text", "image"],
		cost: CLOUDFLARE_AI_GATEWAY_DEFAULT_COST,
		contextWindow: CLOUDFLARE_AI_GATEWAY_DEFAULT_CONTEXT_WINDOW,
		maxTokens: CLOUDFLARE_AI_GATEWAY_DEFAULT_MAX_TOKENS
	};
}
function resolveCloudflareAiGatewayBaseUrl(params) {
	const accountId = params.accountId.trim();
	const gatewayId = params.gatewayId.trim();
	if (!accountId || !gatewayId) return "";
	return `https://gateway.ai.cloudflare.com/v1/${accountId}/${gatewayId}/anthropic`;
}
//#endregion
//#region src/agents/ollama-models.ts
const OLLAMA_DEFAULT_CONTEXT_WINDOW = 128e3;
const OLLAMA_DEFAULT_MAX_TOKENS = 8192;
const OLLAMA_DEFAULT_COST = {
	input: 0,
	output: 0,
	cacheRead: 0,
	cacheWrite: 0
};
const OLLAMA_SHOW_CONCURRENCY = 8;
/**
* Derive the Ollama native API base URL from a configured base URL.
*
* Users typically configure `baseUrl` with a `/v1` suffix (e.g.
* `http://192.168.20.14:11434/v1`) for the OpenAI-compatible endpoint.
* The native Ollama API lives at the root (e.g. `/api/tags`), so we
* strip the `/v1` suffix when present.
*/
function resolveOllamaApiBase(configuredBaseUrl) {
	if (!configuredBaseUrl) return OLLAMA_DEFAULT_BASE_URL;
	return configuredBaseUrl.replace(/\/+$/, "").replace(/\/v1$/i, "");
}
async function queryOllamaContextWindow(apiBase, modelName) {
	try {
		const response = await fetch(`${apiBase}/api/show`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ name: modelName }),
			signal: AbortSignal.timeout(3e3)
		});
		if (!response.ok) return;
		const data = await response.json();
		if (!data.model_info) return;
		for (const [key, value] of Object.entries(data.model_info)) if (key.endsWith(".context_length") && typeof value === "number" && Number.isFinite(value)) {
			const contextWindow = Math.floor(value);
			if (contextWindow > 0) return contextWindow;
		}
		return;
	} catch {
		return;
	}
}
async function enrichOllamaModelsWithContext(apiBase, models, opts) {
	const concurrency = Math.max(1, Math.floor(opts?.concurrency ?? OLLAMA_SHOW_CONCURRENCY));
	const enriched = [];
	for (let index = 0; index < models.length; index += concurrency) {
		const batch = models.slice(index, index + concurrency);
		const batchResults = await Promise.all(batch.map(async (model) => ({
			...model,
			contextWindow: await queryOllamaContextWindow(apiBase, model.name)
		})));
		enriched.push(...batchResults);
	}
	return enriched;
}
/** Heuristic: treat models with "r1", "reasoning", or "think" in the name as reasoning models. */
function isReasoningModelHeuristic(modelId) {
	return /r1|reasoning|think|reason/i.test(modelId);
}
/** Build a ModelDefinitionConfig for an Ollama model with default values. */
function buildOllamaModelDefinition(modelId, contextWindow) {
	return {
		id: modelId,
		name: modelId,
		reasoning: isReasoningModelHeuristic(modelId),
		input: ["text"],
		cost: OLLAMA_DEFAULT_COST,
		contextWindow: contextWindow ?? 128e3,
		maxTokens: OLLAMA_DEFAULT_MAX_TOKENS
	};
}
/** Fetch the model list from a running Ollama instance. */
async function fetchOllamaModels(baseUrl) {
	try {
		const apiBase = resolveOllamaApiBase(baseUrl);
		const response = await fetch(`${apiBase}/api/tags`, { signal: AbortSignal.timeout(5e3) });
		if (!response.ok) return {
			reachable: true,
			models: []
		};
		return {
			reachable: true,
			models: ((await response.json()).models ?? []).filter((m) => m.name)
		};
	} catch {
		return {
			reachable: false,
			models: []
		};
	}
}
//#endregion
//#region src/agents/huggingface-models.ts
const log$4 = createSubsystemLogger("huggingface-models");
/** Hugging Face Inference Providers (router) — OpenAI-compatible chat completions. */
const HUGGINGFACE_BASE_URL = "https://router.huggingface.co/v1";
/** Default cost when not in static catalog (HF pricing varies by provider). */
const HUGGINGFACE_DEFAULT_COST = {
	input: 0,
	output: 0,
	cacheRead: 0,
	cacheWrite: 0
};
/** Defaults for models discovered from GET /v1/models. */
const HUGGINGFACE_DEFAULT_CONTEXT_WINDOW = 131072;
const HUGGINGFACE_DEFAULT_MAX_TOKENS = 8192;
const HUGGINGFACE_MODEL_CATALOG = [
	{
		id: "deepseek-ai/DeepSeek-R1",
		name: "DeepSeek R1",
		reasoning: true,
		input: ["text"],
		contextWindow: 131072,
		maxTokens: 8192,
		cost: {
			input: 3,
			output: 7,
			cacheRead: 3,
			cacheWrite: 3
		}
	},
	{
		id: "deepseek-ai/DeepSeek-V3.1",
		name: "DeepSeek V3.1",
		reasoning: false,
		input: ["text"],
		contextWindow: 131072,
		maxTokens: 8192,
		cost: {
			input: .6,
			output: 1.25,
			cacheRead: .6,
			cacheWrite: .6
		}
	},
	{
		id: "meta-llama/Llama-3.3-70B-Instruct-Turbo",
		name: "Llama 3.3 70B Instruct Turbo",
		reasoning: false,
		input: ["text"],
		contextWindow: 131072,
		maxTokens: 8192,
		cost: {
			input: .88,
			output: .88,
			cacheRead: .88,
			cacheWrite: .88
		}
	},
	{
		id: "openai/gpt-oss-120b",
		name: "GPT-OSS 120B",
		reasoning: false,
		input: ["text"],
		contextWindow: 131072,
		maxTokens: 8192,
		cost: {
			input: 0,
			output: 0,
			cacheRead: 0,
			cacheWrite: 0
		}
	}
];
function buildHuggingfaceModelDefinition(model) {
	return {
		id: model.id,
		name: model.name,
		reasoning: model.reasoning,
		input: model.input,
		cost: model.cost,
		contextWindow: model.contextWindow,
		maxTokens: model.maxTokens
	};
}
/**
* Infer reasoning and display name from Hub-style model id (e.g. "deepseek-ai/DeepSeek-R1").
*/
function inferredMetaFromModelId(id) {
	const base = id.split("/").pop() ?? id;
	const reasoning = isReasoningModelHeuristic(id);
	return {
		name: base.replace(/-/g, " ").replace(/\b(\w)/g, (c) => c.toUpperCase()),
		reasoning
	};
}
/** Prefer API-supplied display name, then owned_by/id, then inferred from id. */
function displayNameFromApiEntry(entry, inferredName) {
	const fromApi = typeof entry.name === "string" && entry.name.trim() || typeof entry.title === "string" && entry.title.trim() || typeof entry.display_name === "string" && entry.display_name.trim();
	if (fromApi) return fromApi;
	if (typeof entry.owned_by === "string" && entry.owned_by.trim()) {
		const base = entry.id.split("/").pop() ?? entry.id;
		return `${entry.owned_by.trim()}/${base}`;
	}
	return inferredName;
}
/**
* Discover chat-completion models from Hugging Face Inference Providers (GET /v1/models).
* Requires a valid HF token. Falls back to static catalog on failure or in test env.
*/
async function discoverHuggingfaceModels(apiKey) {
	if (process.env.VITEST === "true" || false) return HUGGINGFACE_MODEL_CATALOG.map(buildHuggingfaceModelDefinition);
	const trimmedKey = apiKey?.trim();
	if (!trimmedKey) return HUGGINGFACE_MODEL_CATALOG.map(buildHuggingfaceModelDefinition);
	try {
		const response = await fetch(`${HUGGINGFACE_BASE_URL}/models`, {
			signal: AbortSignal.timeout(1e4),
			headers: {
				Authorization: `Bearer ${trimmedKey}`,
				"Content-Type": "application/json"
			}
		});
		if (!response.ok) {
			log$4.warn(`GET /v1/models failed: HTTP ${response.status}, using static catalog`);
			return HUGGINGFACE_MODEL_CATALOG.map(buildHuggingfaceModelDefinition);
		}
		const data = (await response.json())?.data;
		if (!Array.isArray(data) || data.length === 0) {
			log$4.warn("No models in response, using static catalog");
			return HUGGINGFACE_MODEL_CATALOG.map(buildHuggingfaceModelDefinition);
		}
		const catalogById = new Map(HUGGINGFACE_MODEL_CATALOG.map((m) => [m.id, m]));
		const seen = /* @__PURE__ */ new Set();
		const models = [];
		for (const entry of data) {
			const id = typeof entry?.id === "string" ? entry.id.trim() : "";
			if (!id || seen.has(id)) continue;
			seen.add(id);
			const catalogEntry = catalogById.get(id);
			if (catalogEntry) models.push(buildHuggingfaceModelDefinition(catalogEntry));
			else {
				const inferred = inferredMetaFromModelId(id);
				const name = displayNameFromApiEntry(entry, inferred.name);
				const modalities = entry.architecture?.input_modalities;
				const input = Array.isArray(modalities) && modalities.includes("image") ? ["text", "image"] : ["text"];
				const contextLength = (Array.isArray(entry.providers) ? entry.providers : []).find((p) => typeof p?.context_length === "number" && p.context_length > 0)?.context_length ?? HUGGINGFACE_DEFAULT_CONTEXT_WINDOW;
				models.push({
					id,
					name,
					reasoning: inferred.reasoning,
					input,
					cost: HUGGINGFACE_DEFAULT_COST,
					contextWindow: contextLength,
					maxTokens: HUGGINGFACE_DEFAULT_MAX_TOKENS
				});
			}
		}
		return models.length > 0 ? models : HUGGINGFACE_MODEL_CATALOG.map(buildHuggingfaceModelDefinition);
	} catch (error) {
		log$4.warn(`Discovery failed: ${String(error)}, using static catalog`);
		return HUGGINGFACE_MODEL_CATALOG.map(buildHuggingfaceModelDefinition);
	}
}
//#endregion
//#region src/agents/kilocode-models.ts
const log$3 = createSubsystemLogger("kilocode-models");
const KILOCODE_MODELS_URL = `${KILOCODE_BASE_URL}models`;
const DISCOVERY_TIMEOUT_MS = 5e3;
/**
* Convert per-token price (as returned by the gateway) to per-1M-token price
* (as stored in OpenClaw's ModelDefinitionConfig.cost).
*
* Gateway/OpenRouter prices are per-token strings like "0.000005".
* OpenClaw costs are per-1M-token numbers like 5.0.
*/
function toPricePerMillion(perToken) {
	if (!perToken) return 0;
	const num = Number(perToken);
	if (!Number.isFinite(num) || num < 0) return 0;
	return num * 1e6;
}
function parseModality(entry) {
	const modalities = entry.architecture?.input_modalities;
	if (!Array.isArray(modalities)) return ["text"];
	return modalities.some((m) => typeof m === "string" && m.toLowerCase() === "image") ? ["text", "image"] : ["text"];
}
function parseReasoning(entry) {
	const params = entry.supported_parameters;
	if (!Array.isArray(params)) return false;
	return params.includes("reasoning") || params.includes("include_reasoning");
}
function toModelDefinition(entry) {
	return {
		id: entry.id,
		name: entry.name || entry.id,
		reasoning: parseReasoning(entry),
		input: parseModality(entry),
		cost: {
			input: toPricePerMillion(entry.pricing.prompt),
			output: toPricePerMillion(entry.pricing.completion),
			cacheRead: toPricePerMillion(entry.pricing.input_cache_read),
			cacheWrite: toPricePerMillion(entry.pricing.input_cache_write)
		},
		contextWindow: entry.context_length || 1e6,
		maxTokens: entry.top_provider?.max_completion_tokens ?? 128e3
	};
}
function buildStaticCatalog() {
	return KILOCODE_MODEL_CATALOG.map((model) => ({
		id: model.id,
		name: model.name,
		reasoning: model.reasoning,
		input: model.input,
		cost: KILOCODE_DEFAULT_COST,
		contextWindow: model.contextWindow ?? 1e6,
		maxTokens: model.maxTokens ?? 128e3
	}));
}
/**
* Discover models from the Kilo Gateway API with fallback to static catalog.
* The /api/gateway/models endpoint is public and doesn't require authentication.
*/
async function discoverKilocodeModels() {
	if (process.env.VITEST) return buildStaticCatalog();
	try {
		const response = await fetch(KILOCODE_MODELS_URL, {
			headers: { Accept: "application/json" },
			signal: AbortSignal.timeout(DISCOVERY_TIMEOUT_MS)
		});
		if (!response.ok) {
			log$3.warn(`Failed to discover models: HTTP ${response.status}, using static catalog`);
			return buildStaticCatalog();
		}
		const data = await response.json();
		if (!Array.isArray(data.data) || data.data.length === 0) {
			log$3.warn("No models found from gateway API, using static catalog");
			return buildStaticCatalog();
		}
		const models = [];
		const discoveredIds = /* @__PURE__ */ new Set();
		for (const entry of data.data) {
			if (!entry || typeof entry !== "object") continue;
			const id = typeof entry.id === "string" ? entry.id.trim() : "";
			if (!id || discoveredIds.has(id)) continue;
			try {
				models.push(toModelDefinition(entry));
				discoveredIds.add(id);
			} catch (e) {
				log$3.warn(`Skipping malformed model entry "${id}": ${String(e)}`);
			}
		}
		const staticModels = buildStaticCatalog();
		for (const staticModel of staticModels) if (!discoveredIds.has(staticModel.id)) models.unshift(staticModel);
		return models.length > 0 ? models : buildStaticCatalog();
	} catch (error) {
		log$3.warn(`Discovery failed: ${String(error)}, using static catalog`);
		return buildStaticCatalog();
	}
}
//#endregion
//#region src/agents/chutes-models.ts
const log$2 = createSubsystemLogger("chutes-models");
/** Chutes.ai OpenAI-compatible API base URL. */
const CHUTES_BASE_URL = "https://llm.chutes.ai/v1";
const CHUTES_DEFAULT_MODEL_ID = "zai-org/GLM-4.7-TEE";
const CHUTES_DEFAULT_MODEL_REF = `chutes/${CHUTES_DEFAULT_MODEL_ID}`;
/** Default context window and max tokens for discovered models. */
const CHUTES_DEFAULT_CONTEXT_WINDOW = 128e3;
const CHUTES_DEFAULT_MAX_TOKENS = 4096;
/**
* Static catalog of popular Chutes models.
* Used as a fallback and for initial onboarding allowlisting.
*/
const CHUTES_MODEL_CATALOG = [
	{
		id: "Qwen/Qwen3-32B",
		name: "Qwen/Qwen3-32B",
		reasoning: true,
		input: ["text"],
		contextWindow: 40960,
		maxTokens: 40960,
		cost: {
			input: .08,
			output: .24,
			cacheRead: 0,
			cacheWrite: 0
		}
	},
	{
		id: "unsloth/Mistral-Nemo-Instruct-2407",
		name: "unsloth/Mistral-Nemo-Instruct-2407",
		reasoning: false,
		input: ["text"],
		contextWindow: 131072,
		maxTokens: 131072,
		cost: {
			input: .02,
			output: .04,
			cacheRead: 0,
			cacheWrite: 0
		}
	},
	{
		id: "deepseek-ai/DeepSeek-V3-0324-TEE",
		name: "deepseek-ai/DeepSeek-V3-0324-TEE",
		reasoning: true,
		input: ["text"],
		contextWindow: 163840,
		maxTokens: 65536,
		cost: {
			input: .25,
			output: 1,
			cacheRead: 0,
			cacheWrite: 0
		}
	},
	{
		id: "Qwen/Qwen3-235B-A22B-Instruct-2507-TEE",
		name: "Qwen/Qwen3-235B-A22B-Instruct-2507-TEE",
		reasoning: true,
		input: ["text"],
		contextWindow: 262144,
		maxTokens: 65536,
		cost: {
			input: .08,
			output: .55,
			cacheRead: 0,
			cacheWrite: 0
		}
	},
	{
		id: "openai/gpt-oss-120b-TEE",
		name: "openai/gpt-oss-120b-TEE",
		reasoning: true,
		input: ["text"],
		contextWindow: 131072,
		maxTokens: 65536,
		cost: {
			input: .05,
			output: .45,
			cacheRead: 0,
			cacheWrite: 0
		}
	},
	{
		id: "chutesai/Mistral-Small-3.1-24B-Instruct-2503",
		name: "chutesai/Mistral-Small-3.1-24B-Instruct-2503",
		reasoning: false,
		input: ["text", "image"],
		contextWindow: 131072,
		maxTokens: 131072,
		cost: {
			input: .03,
			output: .11,
			cacheRead: 0,
			cacheWrite: 0
		}
	},
	{
		id: "deepseek-ai/DeepSeek-V3.2-TEE",
		name: "deepseek-ai/DeepSeek-V3.2-TEE",
		reasoning: true,
		input: ["text"],
		contextWindow: 131072,
		maxTokens: 65536,
		cost: {
			input: .28,
			output: .42,
			cacheRead: 0,
			cacheWrite: 0
		}
	},
	{
		id: "zai-org/GLM-4.7-TEE",
		name: "zai-org/GLM-4.7-TEE",
		reasoning: true,
		input: ["text"],
		contextWindow: 202752,
		maxTokens: 65535,
		cost: {
			input: .4,
			output: 2,
			cacheRead: 0,
			cacheWrite: 0
		}
	},
	{
		id: "moonshotai/Kimi-K2.5-TEE",
		name: "moonshotai/Kimi-K2.5-TEE",
		reasoning: true,
		input: ["text", "image"],
		contextWindow: 262144,
		maxTokens: 65535,
		cost: {
			input: .45,
			output: 2.2,
			cacheRead: 0,
			cacheWrite: 0
		}
	},
	{
		id: "unsloth/gemma-3-27b-it",
		name: "unsloth/gemma-3-27b-it",
		reasoning: false,
		input: ["text", "image"],
		contextWindow: 128e3,
		maxTokens: 65536,
		cost: {
			input: .04,
			output: .15,
			cacheRead: 0,
			cacheWrite: 0
		}
	},
	{
		id: "XiaomiMiMo/MiMo-V2-Flash-TEE",
		name: "XiaomiMiMo/MiMo-V2-Flash-TEE",
		reasoning: true,
		input: ["text"],
		contextWindow: 262144,
		maxTokens: 65536,
		cost: {
			input: .09,
			output: .29,
			cacheRead: 0,
			cacheWrite: 0
		}
	},
	{
		id: "chutesai/Mistral-Small-3.2-24B-Instruct-2506",
		name: "chutesai/Mistral-Small-3.2-24B-Instruct-2506",
		reasoning: false,
		input: ["text", "image"],
		contextWindow: 131072,
		maxTokens: 131072,
		cost: {
			input: .06,
			output: .18,
			cacheRead: 0,
			cacheWrite: 0
		}
	},
	{
		id: "deepseek-ai/DeepSeek-R1-0528-TEE",
		name: "deepseek-ai/DeepSeek-R1-0528-TEE",
		reasoning: true,
		input: ["text"],
		contextWindow: 163840,
		maxTokens: 65536,
		cost: {
			input: .45,
			output: 2.15,
			cacheRead: 0,
			cacheWrite: 0
		}
	},
	{
		id: "zai-org/GLM-5-TEE",
		name: "zai-org/GLM-5-TEE",
		reasoning: true,
		input: ["text"],
		contextWindow: 202752,
		maxTokens: 65535,
		cost: {
			input: .95,
			output: 3.15,
			cacheRead: 0,
			cacheWrite: 0
		}
	},
	{
		id: "deepseek-ai/DeepSeek-V3.1-TEE",
		name: "deepseek-ai/DeepSeek-V3.1-TEE",
		reasoning: true,
		input: ["text"],
		contextWindow: 163840,
		maxTokens: 65536,
		cost: {
			input: .2,
			output: .8,
			cacheRead: 0,
			cacheWrite: 0
		}
	},
	{
		id: "deepseek-ai/DeepSeek-V3.1-Terminus-TEE",
		name: "deepseek-ai/DeepSeek-V3.1-Terminus-TEE",
		reasoning: true,
		input: ["text"],
		contextWindow: 163840,
		maxTokens: 65536,
		cost: {
			input: .23,
			output: .9,
			cacheRead: 0,
			cacheWrite: 0
		}
	},
	{
		id: "unsloth/gemma-3-4b-it",
		name: "unsloth/gemma-3-4b-it",
		reasoning: false,
		input: ["text", "image"],
		contextWindow: 96e3,
		maxTokens: 96e3,
		cost: {
			input: .01,
			output: .03,
			cacheRead: 0,
			cacheWrite: 0
		}
	},
	{
		id: "MiniMaxAI/MiniMax-M2.5-TEE",
		name: "MiniMaxAI/MiniMax-M2.5-TEE",
		reasoning: true,
		input: ["text"],
		contextWindow: 196608,
		maxTokens: 65536,
		cost: {
			input: .3,
			output: 1.1,
			cacheRead: 0,
			cacheWrite: 0
		}
	},
	{
		id: "tngtech/DeepSeek-TNG-R1T2-Chimera",
		name: "tngtech/DeepSeek-TNG-R1T2-Chimera",
		reasoning: true,
		input: ["text"],
		contextWindow: 163840,
		maxTokens: 163840,
		cost: {
			input: .25,
			output: .85,
			cacheRead: 0,
			cacheWrite: 0
		}
	},
	{
		id: "Qwen/Qwen3-Coder-Next-TEE",
		name: "Qwen/Qwen3-Coder-Next-TEE",
		reasoning: true,
		input: ["text"],
		contextWindow: 262144,
		maxTokens: 65536,
		cost: {
			input: .12,
			output: .75,
			cacheRead: 0,
			cacheWrite: 0
		}
	},
	{
		id: "NousResearch/Hermes-4-405B-FP8-TEE",
		name: "NousResearch/Hermes-4-405B-FP8-TEE",
		reasoning: true,
		input: ["text"],
		contextWindow: 131072,
		maxTokens: 65536,
		cost: {
			input: .3,
			output: 1.2,
			cacheRead: 0,
			cacheWrite: 0
		}
	},
	{
		id: "deepseek-ai/DeepSeek-V3",
		name: "deepseek-ai/DeepSeek-V3",
		reasoning: false,
		input: ["text"],
		contextWindow: 163840,
		maxTokens: 163840,
		cost: {
			input: .3,
			output: 1.2,
			cacheRead: 0,
			cacheWrite: 0
		}
	},
	{
		id: "openai/gpt-oss-20b",
		name: "openai/gpt-oss-20b",
		reasoning: true,
		input: ["text"],
		contextWindow: 131072,
		maxTokens: 131072,
		cost: {
			input: .04,
			output: .15,
			cacheRead: 0,
			cacheWrite: 0
		}
	},
	{
		id: "unsloth/Llama-3.2-3B-Instruct",
		name: "unsloth/Llama-3.2-3B-Instruct",
		reasoning: false,
		input: ["text"],
		contextWindow: 128e3,
		maxTokens: 4096,
		cost: {
			input: .01,
			output: .01,
			cacheRead: 0,
			cacheWrite: 0
		}
	},
	{
		id: "unsloth/Mistral-Small-24B-Instruct-2501",
		name: "unsloth/Mistral-Small-24B-Instruct-2501",
		reasoning: false,
		input: ["text", "image"],
		contextWindow: 32768,
		maxTokens: 32768,
		cost: {
			input: .07,
			output: .3,
			cacheRead: 0,
			cacheWrite: 0
		}
	},
	{
		id: "zai-org/GLM-4.7-FP8",
		name: "zai-org/GLM-4.7-FP8",
		reasoning: true,
		input: ["text"],
		contextWindow: 202752,
		maxTokens: 65535,
		cost: {
			input: .3,
			output: 1.2,
			cacheRead: 0,
			cacheWrite: 0
		}
	},
	{
		id: "zai-org/GLM-4.6-TEE",
		name: "zai-org/GLM-4.6-TEE",
		reasoning: true,
		input: ["text"],
		contextWindow: 202752,
		maxTokens: 65536,
		cost: {
			input: .4,
			output: 1.7,
			cacheRead: 0,
			cacheWrite: 0
		}
	},
	{
		id: "Qwen/Qwen3.5-397B-A17B-TEE",
		name: "Qwen/Qwen3.5-397B-A17B-TEE",
		reasoning: true,
		input: ["text", "image"],
		contextWindow: 262144,
		maxTokens: 65536,
		cost: {
			input: .55,
			output: 3.5,
			cacheRead: 0,
			cacheWrite: 0
		}
	},
	{
		id: "Qwen/Qwen2.5-72B-Instruct",
		name: "Qwen/Qwen2.5-72B-Instruct",
		reasoning: false,
		input: ["text"],
		contextWindow: 32768,
		maxTokens: 32768,
		cost: {
			input: .3,
			output: 1.2,
			cacheRead: 0,
			cacheWrite: 0
		}
	},
	{
		id: "NousResearch/DeepHermes-3-Mistral-24B-Preview",
		name: "NousResearch/DeepHermes-3-Mistral-24B-Preview",
		reasoning: false,
		input: ["text"],
		contextWindow: 32768,
		maxTokens: 32768,
		cost: {
			input: .02,
			output: .1,
			cacheRead: 0,
			cacheWrite: 0
		}
	},
	{
		id: "Qwen/Qwen3-Next-80B-A3B-Instruct",
		name: "Qwen/Qwen3-Next-80B-A3B-Instruct",
		reasoning: false,
		input: ["text"],
		contextWindow: 262144,
		maxTokens: 262144,
		cost: {
			input: .1,
			output: .8,
			cacheRead: 0,
			cacheWrite: 0
		}
	},
	{
		id: "zai-org/GLM-4.6-FP8",
		name: "zai-org/GLM-4.6-FP8",
		reasoning: true,
		input: ["text"],
		contextWindow: 202752,
		maxTokens: 65535,
		cost: {
			input: .3,
			output: 1.2,
			cacheRead: 0,
			cacheWrite: 0
		}
	},
	{
		id: "Qwen/Qwen3-235B-A22B-Thinking-2507",
		name: "Qwen/Qwen3-235B-A22B-Thinking-2507",
		reasoning: true,
		input: ["text"],
		contextWindow: 262144,
		maxTokens: 262144,
		cost: {
			input: .11,
			output: .6,
			cacheRead: 0,
			cacheWrite: 0
		}
	},
	{
		id: "deepseek-ai/DeepSeek-R1-Distill-Llama-70B",
		name: "deepseek-ai/DeepSeek-R1-Distill-Llama-70B",
		reasoning: true,
		input: ["text"],
		contextWindow: 131072,
		maxTokens: 131072,
		cost: {
			input: .03,
			output: .11,
			cacheRead: 0,
			cacheWrite: 0
		}
	},
	{
		id: "tngtech/R1T2-Chimera-Speed",
		name: "tngtech/R1T2-Chimera-Speed",
		reasoning: true,
		input: ["text"],
		contextWindow: 131072,
		maxTokens: 65536,
		cost: {
			input: .22,
			output: .6,
			cacheRead: 0,
			cacheWrite: 0
		}
	},
	{
		id: "zai-org/GLM-4.6V",
		name: "zai-org/GLM-4.6V",
		reasoning: true,
		input: ["text", "image"],
		contextWindow: 131072,
		maxTokens: 65536,
		cost: {
			input: .3,
			output: .9,
			cacheRead: 0,
			cacheWrite: 0
		}
	},
	{
		id: "Qwen/Qwen2.5-VL-32B-Instruct",
		name: "Qwen/Qwen2.5-VL-32B-Instruct",
		reasoning: false,
		input: ["text", "image"],
		contextWindow: 16384,
		maxTokens: 16384,
		cost: {
			input: .05,
			output: .22,
			cacheRead: 0,
			cacheWrite: 0
		}
	},
	{
		id: "Qwen/Qwen3-VL-235B-A22B-Instruct",
		name: "Qwen/Qwen3-VL-235B-A22B-Instruct",
		reasoning: false,
		input: ["text", "image"],
		contextWindow: 262144,
		maxTokens: 262144,
		cost: {
			input: .3,
			output: 1.2,
			cacheRead: 0,
			cacheWrite: 0
		}
	},
	{
		id: "Qwen/Qwen3-14B",
		name: "Qwen/Qwen3-14B",
		reasoning: true,
		input: ["text"],
		contextWindow: 40960,
		maxTokens: 40960,
		cost: {
			input: .05,
			output: .22,
			cacheRead: 0,
			cacheWrite: 0
		}
	},
	{
		id: "Qwen/Qwen2.5-Coder-32B-Instruct",
		name: "Qwen/Qwen2.5-Coder-32B-Instruct",
		reasoning: false,
		input: ["text"],
		contextWindow: 32768,
		maxTokens: 32768,
		cost: {
			input: .03,
			output: .11,
			cacheRead: 0,
			cacheWrite: 0
		}
	},
	{
		id: "Qwen/Qwen3-30B-A3B",
		name: "Qwen/Qwen3-30B-A3B",
		reasoning: true,
		input: ["text"],
		contextWindow: 40960,
		maxTokens: 40960,
		cost: {
			input: .06,
			output: .22,
			cacheRead: 0,
			cacheWrite: 0
		}
	},
	{
		id: "unsloth/gemma-3-12b-it",
		name: "unsloth/gemma-3-12b-it",
		reasoning: false,
		input: ["text", "image"],
		contextWindow: 131072,
		maxTokens: 131072,
		cost: {
			input: .03,
			output: .1,
			cacheRead: 0,
			cacheWrite: 0
		}
	},
	{
		id: "unsloth/Llama-3.2-1B-Instruct",
		name: "unsloth/Llama-3.2-1B-Instruct",
		reasoning: false,
		input: ["text"],
		contextWindow: 128e3,
		maxTokens: 4096,
		cost: {
			input: .01,
			output: .01,
			cacheRead: 0,
			cacheWrite: 0
		}
	},
	{
		id: "nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16-TEE",
		name: "nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16-TEE",
		reasoning: true,
		input: ["text"],
		contextWindow: 128e3,
		maxTokens: 4096,
		cost: {
			input: .3,
			output: 1.2,
			cacheRead: 0,
			cacheWrite: 0
		}
	},
	{
		id: "NousResearch/Hermes-4-14B",
		name: "NousResearch/Hermes-4-14B",
		reasoning: true,
		input: ["text"],
		contextWindow: 40960,
		maxTokens: 40960,
		cost: {
			input: .01,
			output: .05,
			cacheRead: 0,
			cacheWrite: 0
		}
	},
	{
		id: "Qwen/Qwen3Guard-Gen-0.6B",
		name: "Qwen/Qwen3Guard-Gen-0.6B",
		reasoning: false,
		input: ["text"],
		contextWindow: 128e3,
		maxTokens: 4096,
		cost: {
			input: .01,
			output: .01,
			cacheRead: 0,
			cacheWrite: 0
		}
	},
	{
		id: "rednote-hilab/dots.ocr",
		name: "rednote-hilab/dots.ocr",
		reasoning: false,
		input: ["text", "image"],
		contextWindow: 131072,
		maxTokens: 131072,
		cost: {
			input: .01,
			output: .01,
			cacheRead: 0,
			cacheWrite: 0
		}
	}
];
function buildChutesModelDefinition(model) {
	return {
		...model,
		compat: { supportsUsageInStreaming: false }
	};
}
const CACHE_TTL = 300 * 1e3;
const CACHE_MAX_ENTRIES = 100;
const modelCache = /* @__PURE__ */ new Map();
function pruneExpiredCacheEntries(now = Date.now()) {
	for (const [key, entry] of modelCache.entries()) if (now - entry.time >= CACHE_TTL) modelCache.delete(key);
}
/** Cache the result for the given token key and return it. */
function cacheAndReturn(tokenKey, models) {
	const now = Date.now();
	pruneExpiredCacheEntries(now);
	if (!modelCache.has(tokenKey) && modelCache.size >= CACHE_MAX_ENTRIES) {
		const oldest = modelCache.keys().next();
		if (!oldest.done) modelCache.delete(oldest.value);
	}
	modelCache.set(tokenKey, {
		models,
		time: now
	});
	return models;
}
/**
* Discover models from Chutes.ai API with fallback to static catalog.
* Mimics the logic in Chutes init script.
*/
async function discoverChutesModels(accessToken) {
	const trimmedKey = accessToken?.trim() ?? "";
	pruneExpiredCacheEntries(Date.now());
	const cached = modelCache.get(trimmedKey);
	if (cached) return cached.models;
	if (process.env.VITEST === "true") return CHUTES_MODEL_CATALOG.map(buildChutesModelDefinition);
	let effectiveKey = trimmedKey;
	const staticCatalog = () => cacheAndReturn(effectiveKey, CHUTES_MODEL_CATALOG.map(buildChutesModelDefinition));
	const headers = {};
	if (trimmedKey) headers.Authorization = `Bearer ${trimmedKey}`;
	try {
		let response = await fetch(`${CHUTES_BASE_URL}/models`, {
			signal: AbortSignal.timeout(1e4),
			headers
		});
		if (response.status === 401 && trimmedKey) {
			effectiveKey = "";
			response = await fetch(`${CHUTES_BASE_URL}/models`, { signal: AbortSignal.timeout(1e4) });
		}
		if (!response.ok) {
			if (response.status !== 401 && response.status !== 503) log$2.warn(`GET /v1/models failed: HTTP ${response.status}, using static catalog`);
			return staticCatalog();
		}
		const data = (await response.json())?.data;
		if (!Array.isArray(data) || data.length === 0) {
			log$2.warn("No models in response, using static catalog");
			return staticCatalog();
		}
		const seen = /* @__PURE__ */ new Set();
		const models = [];
		for (const entry of data) {
			const id = typeof entry?.id === "string" ? entry.id.trim() : "";
			if (!id || seen.has(id)) continue;
			seen.add(id);
			const isReasoning = entry.supported_features?.includes("reasoning") || id.toLowerCase().includes("r1") || id.toLowerCase().includes("thinking") || id.toLowerCase().includes("reason") || id.toLowerCase().includes("tee");
			const input = (entry.input_modalities || ["text"]).filter((i) => i === "text" || i === "image");
			models.push({
				id,
				name: id,
				reasoning: isReasoning,
				input,
				cost: {
					input: entry.pricing?.prompt || 0,
					output: entry.pricing?.completion || 0,
					cacheRead: 0,
					cacheWrite: 0
				},
				contextWindow: entry.context_length || CHUTES_DEFAULT_CONTEXT_WINDOW,
				maxTokens: entry.max_output_length || CHUTES_DEFAULT_MAX_TOKENS,
				compat: { supportsUsageInStreaming: false }
			});
		}
		return cacheAndReturn(effectiveKey, models.length > 0 ? models : CHUTES_MODEL_CATALOG.map(buildChutesModelDefinition));
	} catch (error) {
		log$2.warn(`Discovery failed: ${String(error)}, using static catalog`);
		return staticCatalog();
	}
}
//#endregion
//#region src/agents/synthetic-models.ts
const SYNTHETIC_BASE_URL = "https://api.synthetic.new/anthropic";
const SYNTHETIC_DEFAULT_MODEL_ID = "hf:MiniMaxAI/MiniMax-M2.5";
const SYNTHETIC_DEFAULT_MODEL_REF = `synthetic/${SYNTHETIC_DEFAULT_MODEL_ID}`;
const SYNTHETIC_DEFAULT_COST = {
	input: 0,
	output: 0,
	cacheRead: 0,
	cacheWrite: 0
};
const SYNTHETIC_MODEL_CATALOG = [
	{
		id: SYNTHETIC_DEFAULT_MODEL_ID,
		name: "MiniMax M2.5",
		reasoning: false,
		input: ["text"],
		contextWindow: 192e3,
		maxTokens: 65536
	},
	{
		id: "hf:moonshotai/Kimi-K2-Thinking",
		name: "Kimi K2 Thinking",
		reasoning: true,
		input: ["text"],
		contextWindow: 256e3,
		maxTokens: 8192
	},
	{
		id: "hf:zai-org/GLM-4.7",
		name: "GLM-4.7",
		reasoning: false,
		input: ["text"],
		contextWindow: 198e3,
		maxTokens: 128e3
	},
	{
		id: "hf:deepseek-ai/DeepSeek-R1-0528",
		name: "DeepSeek R1 0528",
		reasoning: false,
		input: ["text"],
		contextWindow: 128e3,
		maxTokens: 8192
	},
	{
		id: "hf:deepseek-ai/DeepSeek-V3-0324",
		name: "DeepSeek V3 0324",
		reasoning: false,
		input: ["text"],
		contextWindow: 128e3,
		maxTokens: 8192
	},
	{
		id: "hf:deepseek-ai/DeepSeek-V3.1",
		name: "DeepSeek V3.1",
		reasoning: false,
		input: ["text"],
		contextWindow: 128e3,
		maxTokens: 8192
	},
	{
		id: "hf:deepseek-ai/DeepSeek-V3.1-Terminus",
		name: "DeepSeek V3.1 Terminus",
		reasoning: false,
		input: ["text"],
		contextWindow: 128e3,
		maxTokens: 8192
	},
	{
		id: "hf:deepseek-ai/DeepSeek-V3.2",
		name: "DeepSeek V3.2",
		reasoning: false,
		input: ["text"],
		contextWindow: 159e3,
		maxTokens: 8192
	},
	{
		id: "hf:meta-llama/Llama-3.3-70B-Instruct",
		name: "Llama 3.3 70B Instruct",
		reasoning: false,
		input: ["text"],
		contextWindow: 128e3,
		maxTokens: 8192
	},
	{
		id: "hf:meta-llama/Llama-4-Maverick-17B-128E-Instruct-FP8",
		name: "Llama 4 Maverick 17B 128E Instruct FP8",
		reasoning: false,
		input: ["text"],
		contextWindow: 524e3,
		maxTokens: 8192
	},
	{
		id: "hf:moonshotai/Kimi-K2-Instruct-0905",
		name: "Kimi K2 Instruct 0905",
		reasoning: false,
		input: ["text"],
		contextWindow: 256e3,
		maxTokens: 8192
	},
	{
		id: "hf:moonshotai/Kimi-K2.5",
		name: "Kimi K2.5",
		reasoning: true,
		input: ["text", "image"],
		contextWindow: 256e3,
		maxTokens: 8192
	},
	{
		id: "hf:openai/gpt-oss-120b",
		name: "GPT OSS 120B",
		reasoning: false,
		input: ["text"],
		contextWindow: 128e3,
		maxTokens: 8192
	},
	{
		id: "hf:Qwen/Qwen3-235B-A22B-Instruct-2507",
		name: "Qwen3 235B A22B Instruct 2507",
		reasoning: false,
		input: ["text"],
		contextWindow: 256e3,
		maxTokens: 8192
	},
	{
		id: "hf:Qwen/Qwen3-Coder-480B-A35B-Instruct",
		name: "Qwen3 Coder 480B A35B Instruct",
		reasoning: false,
		input: ["text"],
		contextWindow: 256e3,
		maxTokens: 8192
	},
	{
		id: "hf:Qwen/Qwen3-VL-235B-A22B-Instruct",
		name: "Qwen3 VL 235B A22B Instruct",
		reasoning: false,
		input: ["text", "image"],
		contextWindow: 25e4,
		maxTokens: 8192
	},
	{
		id: "hf:zai-org/GLM-4.5",
		name: "GLM-4.5",
		reasoning: false,
		input: ["text"],
		contextWindow: 128e3,
		maxTokens: 128e3
	},
	{
		id: "hf:zai-org/GLM-4.6",
		name: "GLM-4.6",
		reasoning: false,
		input: ["text"],
		contextWindow: 198e3,
		maxTokens: 128e3
	},
	{
		id: "hf:zai-org/GLM-5",
		name: "GLM-5",
		reasoning: true,
		input: ["text", "image"],
		contextWindow: 256e3,
		maxTokens: 128e3
	},
	{
		id: "hf:deepseek-ai/DeepSeek-V3",
		name: "DeepSeek V3",
		reasoning: false,
		input: ["text"],
		contextWindow: 128e3,
		maxTokens: 8192
	},
	{
		id: "hf:Qwen/Qwen3-235B-A22B-Thinking-2507",
		name: "Qwen3 235B A22B Thinking 2507",
		reasoning: true,
		input: ["text"],
		contextWindow: 256e3,
		maxTokens: 8192
	}
];
function buildSyntheticModelDefinition(entry) {
	return {
		id: entry.id,
		name: entry.name,
		reasoning: entry.reasoning,
		input: [...entry.input],
		cost: SYNTHETIC_DEFAULT_COST,
		contextWindow: entry.contextWindow,
		maxTokens: entry.maxTokens
	};
}
//#endregion
//#region src/agents/deepseek-models.ts
const DEEPSEEK_BASE_URL = "https://api.deepseek.com";
const DEEPSEEK_DEFAULT_COST = {
	input: 0,
	output: 0,
	cacheRead: 0,
	cacheWrite: 0
};
const DEEPSEEK_MODEL_CATALOG = [{
	id: "deepseek-chat",
	name: "DeepSeek Chat",
	reasoning: false,
	input: ["text"],
	contextWindow: 131072,
	maxTokens: 8192,
	cost: DEEPSEEK_DEFAULT_COST,
	compat: { supportsUsageInStreaming: true }
}, {
	id: "deepseek-reasoner",
	name: "DeepSeek Reasoner",
	reasoning: true,
	input: ["text"],
	contextWindow: 131072,
	maxTokens: 65536,
	cost: DEEPSEEK_DEFAULT_COST,
	compat: { supportsUsageInStreaming: true }
}];
function buildDeepSeekModelDefinition(model) {
	return {
		...model,
		api: "openai-completions"
	};
}
//#endregion
//#region src/agents/together-models.ts
const TOGETHER_BASE_URL = "https://api.together.xyz/v1";
const TOGETHER_MODEL_CATALOG = [
	{
		id: "zai-org/GLM-4.7",
		name: "GLM 4.7 Fp8",
		reasoning: false,
		input: ["text"],
		contextWindow: 202752,
		maxTokens: 8192,
		cost: {
			input: .45,
			output: 2,
			cacheRead: .45,
			cacheWrite: 2
		}
	},
	{
		id: "moonshotai/Kimi-K2.5",
		name: "Kimi K2.5",
		reasoning: true,
		input: ["text", "image"],
		cost: {
			input: .5,
			output: 2.8,
			cacheRead: .5,
			cacheWrite: 2.8
		},
		contextWindow: 262144,
		maxTokens: 32768
	},
	{
		id: "meta-llama/Llama-3.3-70B-Instruct-Turbo",
		name: "Llama 3.3 70B Instruct Turbo",
		reasoning: false,
		input: ["text"],
		contextWindow: 131072,
		maxTokens: 8192,
		cost: {
			input: .88,
			output: .88,
			cacheRead: .88,
			cacheWrite: .88
		}
	},
	{
		id: "meta-llama/Llama-4-Scout-17B-16E-Instruct",
		name: "Llama 4 Scout 17B 16E Instruct",
		reasoning: false,
		input: ["text", "image"],
		contextWindow: 1e7,
		maxTokens: 32768,
		cost: {
			input: .18,
			output: .59,
			cacheRead: .18,
			cacheWrite: .18
		}
	},
	{
		id: "meta-llama/Llama-4-Maverick-17B-128E-Instruct-FP8",
		name: "Llama 4 Maverick 17B 128E Instruct FP8",
		reasoning: false,
		input: ["text", "image"],
		contextWindow: 2e7,
		maxTokens: 32768,
		cost: {
			input: .27,
			output: .85,
			cacheRead: .27,
			cacheWrite: .27
		}
	},
	{
		id: "deepseek-ai/DeepSeek-V3.1",
		name: "DeepSeek V3.1",
		reasoning: false,
		input: ["text"],
		contextWindow: 131072,
		maxTokens: 8192,
		cost: {
			input: .6,
			output: 1.25,
			cacheRead: .6,
			cacheWrite: .6
		}
	},
	{
		id: "deepseek-ai/DeepSeek-R1",
		name: "DeepSeek R1",
		reasoning: true,
		input: ["text"],
		contextWindow: 131072,
		maxTokens: 8192,
		cost: {
			input: 3,
			output: 7,
			cacheRead: 3,
			cacheWrite: 3
		}
	},
	{
		id: "moonshotai/Kimi-K2-Instruct-0905",
		name: "Kimi K2-Instruct 0905",
		reasoning: false,
		input: ["text"],
		contextWindow: 262144,
		maxTokens: 8192,
		cost: {
			input: 1,
			output: 3,
			cacheRead: 1,
			cacheWrite: 3
		}
	}
];
function buildTogetherModelDefinition(model) {
	return {
		id: model.id,
		name: model.name,
		api: "openai-completions",
		reasoning: model.reasoning,
		input: model.input,
		cost: model.cost,
		contextWindow: model.contextWindow,
		maxTokens: model.maxTokens
	};
}
//#endregion
//#region src/infra/retry.ts
const DEFAULT_RETRY_CONFIG = {
	attempts: 3,
	minDelayMs: 300,
	maxDelayMs: 3e4,
	jitter: 0
};
const asFiniteNumber = (value) => typeof value === "number" && Number.isFinite(value) ? value : void 0;
const clampNumber = (value, fallback, min, max) => {
	const next = asFiniteNumber(value);
	if (next === void 0) return fallback;
	const floor = typeof min === "number" ? min : Number.NEGATIVE_INFINITY;
	const ceiling = typeof max === "number" ? max : Number.POSITIVE_INFINITY;
	return Math.min(Math.max(next, floor), ceiling);
};
function resolveRetryConfig(defaults = DEFAULT_RETRY_CONFIG, overrides) {
	const attempts = Math.max(1, Math.round(clampNumber(overrides?.attempts, defaults.attempts, 1)));
	const minDelayMs = Math.max(0, Math.round(clampNumber(overrides?.minDelayMs, defaults.minDelayMs, 0)));
	return {
		attempts,
		minDelayMs,
		maxDelayMs: Math.max(minDelayMs, Math.round(clampNumber(overrides?.maxDelayMs, defaults.maxDelayMs, 0))),
		jitter: clampNumber(overrides?.jitter, defaults.jitter, 0, 1)
	};
}
function applyJitter(delayMs, jitter) {
	if (jitter <= 0) return delayMs;
	const offset = (Math.random() * 2 - 1) * jitter;
	return Math.max(0, Math.round(delayMs * (1 + offset)));
}
async function retryAsync(fn, attemptsOrOptions = 3, initialDelayMs = 300) {
	if (typeof attemptsOrOptions === "number") {
		const attempts = Math.max(1, Math.round(attemptsOrOptions));
		let lastErr;
		for (let i = 0; i < attempts; i += 1) try {
			return await fn();
		} catch (err) {
			lastErr = err;
			if (i === attempts - 1) break;
			await sleep(initialDelayMs * 2 ** i);
		}
		throw lastErr ?? /* @__PURE__ */ new Error("Retry failed");
	}
	const options = attemptsOrOptions;
	const resolved = resolveRetryConfig(DEFAULT_RETRY_CONFIG, options);
	const maxAttempts = resolved.attempts;
	const minDelayMs = resolved.minDelayMs;
	const maxDelayMs = Number.isFinite(resolved.maxDelayMs) && resolved.maxDelayMs > 0 ? resolved.maxDelayMs : Number.POSITIVE_INFINITY;
	const jitter = resolved.jitter;
	const shouldRetry = options.shouldRetry ?? (() => true);
	let lastErr;
	for (let attempt = 1; attempt <= maxAttempts; attempt += 1) try {
		return await fn();
	} catch (err) {
		lastErr = err;
		if (attempt >= maxAttempts || !shouldRetry(err, attempt)) break;
		const retryAfterMs = options.retryAfterMs?.(err);
		const baseDelay = typeof retryAfterMs === "number" && Number.isFinite(retryAfterMs) ? Math.max(retryAfterMs, minDelayMs) : minDelayMs * 2 ** (attempt - 1);
		let delay = Math.min(baseDelay, maxDelayMs);
		delay = applyJitter(delay, jitter);
		delay = Math.min(Math.max(delay, minDelayMs), maxDelayMs);
		options.onRetry?.({
			attempt,
			maxAttempts,
			delayMs: delay,
			err,
			label: options.label
		});
		await sleep(delay);
	}
	throw lastErr ?? /* @__PURE__ */ new Error("Retry failed");
}
//#endregion
//#region src/agents/venice-models.ts
const log$1 = createSubsystemLogger("venice-models");
const VENICE_BASE_URL = "https://api.venice.ai/api/v1";
const VENICE_DEFAULT_MODEL_REF = `venice/kimi-k2-5`;
const VENICE_DEFAULT_COST = {
	input: 0,
	output: 0,
	cacheRead: 0,
	cacheWrite: 0
};
const VENICE_DEFAULT_CONTEXT_WINDOW = 128e3;
const VENICE_DEFAULT_MAX_TOKENS = 4096;
const VENICE_DISCOVERY_HARD_MAX_TOKENS = 131072;
const VENICE_DISCOVERY_TIMEOUT_MS = 1e4;
const VENICE_DISCOVERY_RETRYABLE_HTTP_STATUS = new Set([
	408,
	425,
	429,
	500,
	502,
	503,
	504
]);
const VENICE_DISCOVERY_RETRYABLE_NETWORK_CODES = new Set([
	"ECONNABORTED",
	"ECONNREFUSED",
	"ECONNRESET",
	"EAI_AGAIN",
	"ENETDOWN",
	"ENETUNREACH",
	"ENOTFOUND",
	"ETIMEDOUT",
	"UND_ERR_BODY_TIMEOUT",
	"UND_ERR_CONNECT_TIMEOUT",
	"UND_ERR_CONNECT_ERROR",
	"UND_ERR_HEADERS_TIMEOUT",
	"UND_ERR_SOCKET"
]);
/**
* Complete catalog of Venice AI models.
*
* Venice provides two privacy modes:
* - "private": Fully private inference, no logging, ephemeral
* - "anonymized": Proxied through Venice with metadata stripped (for proprietary models)
*
* Note: The `privacy` field is included for documentation purposes but is not
* propagated to ModelDefinitionConfig as it's not part of the core model schema.
* Privacy mode is determined by the model itself, not configurable at runtime.
*
* This catalog serves as a fallback when the Venice API is unreachable.
*/
const VENICE_MODEL_CATALOG = [
	{
		id: "llama-3.3-70b",
		name: "Llama 3.3 70B",
		reasoning: false,
		input: ["text"],
		contextWindow: 128e3,
		maxTokens: 4096,
		privacy: "private"
	},
	{
		id: "llama-3.2-3b",
		name: "Llama 3.2 3B",
		reasoning: false,
		input: ["text"],
		contextWindow: 128e3,
		maxTokens: 4096,
		privacy: "private"
	},
	{
		id: "hermes-3-llama-3.1-405b",
		name: "Hermes 3 Llama 3.1 405B",
		reasoning: false,
		input: ["text"],
		contextWindow: 128e3,
		maxTokens: 16384,
		supportsTools: false,
		privacy: "private"
	},
	{
		id: "qwen3-235b-a22b-thinking-2507",
		name: "Qwen3 235B Thinking",
		reasoning: true,
		input: ["text"],
		contextWindow: 128e3,
		maxTokens: 16384,
		privacy: "private"
	},
	{
		id: "qwen3-235b-a22b-instruct-2507",
		name: "Qwen3 235B Instruct",
		reasoning: false,
		input: ["text"],
		contextWindow: 128e3,
		maxTokens: 16384,
		privacy: "private"
	},
	{
		id: "qwen3-coder-480b-a35b-instruct",
		name: "Qwen3 Coder 480B",
		reasoning: false,
		input: ["text"],
		contextWindow: 256e3,
		maxTokens: 65536,
		privacy: "private"
	},
	{
		id: "qwen3-coder-480b-a35b-instruct-turbo",
		name: "Qwen3 Coder 480B Turbo",
		reasoning: false,
		input: ["text"],
		contextWindow: 256e3,
		maxTokens: 65536,
		privacy: "private"
	},
	{
		id: "qwen3-5-35b-a3b",
		name: "Qwen3.5 35B A3B",
		reasoning: true,
		input: ["text", "image"],
		contextWindow: 256e3,
		maxTokens: 65536,
		privacy: "private"
	},
	{
		id: "qwen3-next-80b",
		name: "Qwen3 Next 80B",
		reasoning: false,
		input: ["text"],
		contextWindow: 256e3,
		maxTokens: 16384,
		privacy: "private"
	},
	{
		id: "qwen3-vl-235b-a22b",
		name: "Qwen3 VL 235B (Vision)",
		reasoning: false,
		input: ["text", "image"],
		contextWindow: 256e3,
		maxTokens: 16384,
		privacy: "private"
	},
	{
		id: "qwen3-4b",
		name: "Venice Small (Qwen3 4B)",
		reasoning: true,
		input: ["text"],
		contextWindow: 32e3,
		maxTokens: 4096,
		privacy: "private"
	},
	{
		id: "deepseek-v3.2",
		name: "DeepSeek V3.2",
		reasoning: true,
		input: ["text"],
		contextWindow: 16e4,
		maxTokens: 32768,
		supportsTools: false,
		privacy: "private"
	},
	{
		id: "venice-uncensored",
		name: "Venice Uncensored (Dolphin-Mistral)",
		reasoning: false,
		input: ["text"],
		contextWindow: 32e3,
		maxTokens: 4096,
		supportsTools: false,
		privacy: "private"
	},
	{
		id: "mistral-31-24b",
		name: "Venice Medium (Mistral)",
		reasoning: false,
		input: ["text", "image"],
		contextWindow: 128e3,
		maxTokens: 4096,
		privacy: "private"
	},
	{
		id: "google-gemma-3-27b-it",
		name: "Google Gemma 3 27B Instruct",
		reasoning: false,
		input: ["text", "image"],
		contextWindow: 198e3,
		maxTokens: 16384,
		privacy: "private"
	},
	{
		id: "openai-gpt-oss-120b",
		name: "OpenAI GPT OSS 120B",
		reasoning: false,
		input: ["text"],
		contextWindow: 128e3,
		maxTokens: 16384,
		privacy: "private"
	},
	{
		id: "nvidia-nemotron-3-nano-30b-a3b",
		name: "NVIDIA Nemotron 3 Nano 30B",
		reasoning: false,
		input: ["text"],
		contextWindow: 128e3,
		maxTokens: 16384,
		privacy: "private"
	},
	{
		id: "olafangensan-glm-4.7-flash-heretic",
		name: "GLM 4.7 Flash Heretic",
		reasoning: true,
		input: ["text"],
		contextWindow: 128e3,
		maxTokens: 24e3,
		privacy: "private"
	},
	{
		id: "zai-org-glm-4.6",
		name: "GLM 4.6",
		reasoning: false,
		input: ["text"],
		contextWindow: 198e3,
		maxTokens: 16384,
		privacy: "private"
	},
	{
		id: "zai-org-glm-4.7",
		name: "GLM 4.7",
		reasoning: true,
		input: ["text"],
		contextWindow: 198e3,
		maxTokens: 16384,
		privacy: "private"
	},
	{
		id: "zai-org-glm-4.7-flash",
		name: "GLM 4.7 Flash",
		reasoning: true,
		input: ["text"],
		contextWindow: 128e3,
		maxTokens: 16384,
		privacy: "private"
	},
	{
		id: "zai-org-glm-5",
		name: "GLM 5",
		reasoning: true,
		input: ["text"],
		contextWindow: 198e3,
		maxTokens: 32e3,
		privacy: "private"
	},
	{
		id: "kimi-k2-5",
		name: "Kimi K2.5",
		reasoning: true,
		input: ["text", "image"],
		contextWindow: 256e3,
		maxTokens: 65536,
		privacy: "private"
	},
	{
		id: "kimi-k2-thinking",
		name: "Kimi K2 Thinking",
		reasoning: true,
		input: ["text"],
		contextWindow: 256e3,
		maxTokens: 65536,
		privacy: "private"
	},
	{
		id: "minimax-m21",
		name: "MiniMax M2.1",
		reasoning: true,
		input: ["text"],
		contextWindow: 198e3,
		maxTokens: 32768,
		privacy: "private"
	},
	{
		id: "minimax-m25",
		name: "MiniMax M2.5",
		reasoning: true,
		input: ["text"],
		contextWindow: 198e3,
		maxTokens: 32768,
		privacy: "private"
	},
	{
		id: "claude-opus-4-5",
		name: "Claude Opus 4.5 (via Venice)",
		reasoning: true,
		input: ["text", "image"],
		contextWindow: 198e3,
		maxTokens: 32768,
		privacy: "anonymized"
	},
	{
		id: "claude-opus-4-6",
		name: "Claude Opus 4.6 (via Venice)",
		reasoning: true,
		input: ["text", "image"],
		contextWindow: 1e6,
		maxTokens: 128e3,
		privacy: "anonymized"
	},
	{
		id: "claude-sonnet-4-5",
		name: "Claude Sonnet 4.5 (via Venice)",
		reasoning: true,
		input: ["text", "image"],
		contextWindow: 198e3,
		maxTokens: 64e3,
		privacy: "anonymized"
	},
	{
		id: "claude-sonnet-4-6",
		name: "Claude Sonnet 4.6 (via Venice)",
		reasoning: true,
		input: ["text", "image"],
		contextWindow: 1e6,
		maxTokens: 64e3,
		privacy: "anonymized"
	},
	{
		id: "openai-gpt-52",
		name: "GPT-5.2 (via Venice)",
		reasoning: true,
		input: ["text"],
		contextWindow: 256e3,
		maxTokens: 65536,
		privacy: "anonymized"
	},
	{
		id: "openai-gpt-52-codex",
		name: "GPT-5.2 Codex (via Venice)",
		reasoning: true,
		input: ["text", "image"],
		contextWindow: 256e3,
		maxTokens: 65536,
		privacy: "anonymized"
	},
	{
		id: "openai-gpt-53-codex",
		name: "GPT-5.3 Codex (via Venice)",
		reasoning: true,
		input: ["text", "image"],
		contextWindow: 4e5,
		maxTokens: 128e3,
		privacy: "anonymized"
	},
	{
		id: "openai-gpt-54",
		name: "GPT-5.4 (via Venice)",
		reasoning: true,
		input: ["text", "image"],
		contextWindow: 1e6,
		maxTokens: 131072,
		privacy: "anonymized"
	},
	{
		id: "openai-gpt-4o-2024-11-20",
		name: "GPT-4o (via Venice)",
		reasoning: false,
		input: ["text", "image"],
		contextWindow: 128e3,
		maxTokens: 16384,
		privacy: "anonymized"
	},
	{
		id: "openai-gpt-4o-mini-2024-07-18",
		name: "GPT-4o Mini (via Venice)",
		reasoning: false,
		input: ["text", "image"],
		contextWindow: 128e3,
		maxTokens: 16384,
		privacy: "anonymized"
	},
	{
		id: "gemini-3-pro-preview",
		name: "Gemini 3 Pro (via Venice)",
		reasoning: true,
		input: ["text", "image"],
		contextWindow: 198e3,
		maxTokens: 32768,
		privacy: "anonymized"
	},
	{
		id: "gemini-3-1-pro-preview",
		name: "Gemini 3.1 Pro (via Venice)",
		reasoning: true,
		input: ["text", "image"],
		contextWindow: 1e6,
		maxTokens: 32768,
		privacy: "anonymized"
	},
	{
		id: "gemini-3-flash-preview",
		name: "Gemini 3 Flash (via Venice)",
		reasoning: true,
		input: ["text", "image"],
		contextWindow: 256e3,
		maxTokens: 65536,
		privacy: "anonymized"
	},
	{
		id: "grok-41-fast",
		name: "Grok 4.1 Fast (via Venice)",
		reasoning: true,
		input: ["text", "image"],
		contextWindow: 1e6,
		maxTokens: 3e4,
		privacy: "anonymized"
	},
	{
		id: "grok-code-fast-1",
		name: "Grok Code Fast 1 (via Venice)",
		reasoning: true,
		input: ["text"],
		contextWindow: 256e3,
		maxTokens: 1e4,
		privacy: "anonymized"
	}
];
/**
* Build a ModelDefinitionConfig from a Venice catalog entry.
*
* Note: The `privacy` field from the catalog is not included in the output
* as ModelDefinitionConfig doesn't support custom metadata fields. Privacy
* mode is inherent to each model and documented in the catalog/docs.
*/
function buildVeniceModelDefinition(entry) {
	return {
		id: entry.id,
		name: entry.name,
		reasoning: entry.reasoning,
		input: [...entry.input],
		cost: VENICE_DEFAULT_COST,
		contextWindow: entry.contextWindow,
		maxTokens: entry.maxTokens,
		compat: {
			supportsUsageInStreaming: false,
			..."supportsTools" in entry && !entry.supportsTools ? { supportsTools: false } : {}
		}
	};
}
var VeniceDiscoveryHttpError = class extends Error {
	constructor(status) {
		super(`HTTP ${status}`);
		this.name = "VeniceDiscoveryHttpError";
		this.status = status;
	}
};
function staticVeniceModelDefinitions() {
	return VENICE_MODEL_CATALOG.map(buildVeniceModelDefinition);
}
function hasRetryableNetworkCode(err) {
	const queue = [err];
	const seen = /* @__PURE__ */ new Set();
	while (queue.length > 0) {
		const current = queue.shift();
		if (!current || typeof current !== "object" || seen.has(current)) continue;
		seen.add(current);
		const candidate = current;
		const code = typeof candidate.code === "string" ? candidate.code : typeof candidate.errno === "string" ? candidate.errno : void 0;
		if (code && VENICE_DISCOVERY_RETRYABLE_NETWORK_CODES.has(code)) return true;
		if (candidate.cause) queue.push(candidate.cause);
		if (Array.isArray(candidate.errors)) queue.push(...candidate.errors);
	}
	return false;
}
function isRetryableVeniceDiscoveryError(err) {
	if (err instanceof VeniceDiscoveryHttpError) return true;
	if (err instanceof Error && err.name === "AbortError") return true;
	if (err instanceof TypeError && err.message.toLowerCase() === "fetch failed") return true;
	return hasRetryableNetworkCode(err);
}
function normalizePositiveInt(value) {
	if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) return;
	return Math.floor(value);
}
function resolveApiMaxCompletionTokens(params) {
	const raw = normalizePositiveInt(params.apiModel.model_spec?.maxCompletionTokens);
	if (!raw) return;
	const contextWindow = normalizePositiveInt(params.apiModel.model_spec?.availableContextTokens);
	const knownMaxTokens = typeof params.knownMaxTokens === "number" && Number.isFinite(params.knownMaxTokens) ? Math.floor(params.knownMaxTokens) : void 0;
	const hardCap = knownMaxTokens ?? VENICE_DISCOVERY_HARD_MAX_TOKENS;
	const fallbackContextWindow = knownMaxTokens ?? VENICE_DEFAULT_CONTEXT_WINDOW;
	return Math.min(raw, contextWindow ?? fallbackContextWindow, hardCap);
}
function resolveApiSupportsTools(apiModel) {
	const supportsFunctionCalling = apiModel.model_spec?.capabilities?.supportsFunctionCalling;
	return typeof supportsFunctionCalling === "boolean" ? supportsFunctionCalling : void 0;
}
/**
* Discover models from Venice API with fallback to static catalog.
* The /models endpoint is public and doesn't require authentication.
*/
async function discoverVeniceModels() {
	if (process.env.VITEST) return staticVeniceModelDefinitions();
	try {
		const response = await retryAsync(async () => {
			const currentResponse = await fetch(`${VENICE_BASE_URL}/models`, {
				signal: AbortSignal.timeout(VENICE_DISCOVERY_TIMEOUT_MS),
				headers: { Accept: "application/json" }
			});
			if (!currentResponse.ok && VENICE_DISCOVERY_RETRYABLE_HTTP_STATUS.has(currentResponse.status)) throw new VeniceDiscoveryHttpError(currentResponse.status);
			return currentResponse;
		}, {
			attempts: 3,
			minDelayMs: 300,
			maxDelayMs: 2e3,
			jitter: .2,
			label: "venice-model-discovery",
			shouldRetry: isRetryableVeniceDiscoveryError
		});
		if (!response.ok) {
			log$1.warn(`Failed to discover models: HTTP ${response.status}, using static catalog`);
			return staticVeniceModelDefinitions();
		}
		const data = await response.json();
		if (!Array.isArray(data.data) || data.data.length === 0) {
			log$1.warn("No models found from API, using static catalog");
			return staticVeniceModelDefinitions();
		}
		const catalogById = new Map(VENICE_MODEL_CATALOG.map((m) => [m.id, m]));
		const models = [];
		for (const apiModel of data.data) {
			const catalogEntry = catalogById.get(apiModel.id);
			const apiMaxTokens = resolveApiMaxCompletionTokens({
				apiModel,
				knownMaxTokens: catalogEntry?.maxTokens
			});
			const apiSupportsTools = resolveApiSupportsTools(apiModel);
			if (catalogEntry) {
				const definition = buildVeniceModelDefinition(catalogEntry);
				if (apiMaxTokens !== void 0) definition.maxTokens = apiMaxTokens;
				if (apiSupportsTools === false) definition.compat = {
					...definition.compat,
					supportsTools: false
				};
				models.push(definition);
			} else {
				const apiSpec = apiModel.model_spec;
				const isReasoning = apiSpec?.capabilities?.supportsReasoning || apiModel.id.toLowerCase().includes("thinking") || apiModel.id.toLowerCase().includes("reason") || apiModel.id.toLowerCase().includes("r1");
				const hasVision = apiSpec?.capabilities?.supportsVision === true;
				models.push({
					id: apiModel.id,
					name: apiSpec?.name || apiModel.id,
					reasoning: isReasoning,
					input: hasVision ? ["text", "image"] : ["text"],
					cost: VENICE_DEFAULT_COST,
					contextWindow: normalizePositiveInt(apiSpec?.availableContextTokens) ?? VENICE_DEFAULT_CONTEXT_WINDOW,
					maxTokens: apiMaxTokens ?? VENICE_DEFAULT_MAX_TOKENS,
					compat: {
						supportsUsageInStreaming: false,
						...apiSupportsTools === false ? { supportsTools: false } : {}
					}
				});
			}
		}
		return models.length > 0 ? models : staticVeniceModelDefinitions();
	} catch (error) {
		if (error instanceof VeniceDiscoveryHttpError) {
			log$1.warn(`Failed to discover models: HTTP ${error.status}, using static catalog`);
			return staticVeniceModelDefinitions();
		}
		log$1.warn(`Discovery failed: ${String(error)}, using static catalog`);
		return staticVeniceModelDefinitions();
	}
}
//#endregion
//#region src/agents/volc-models.shared.ts
const VOLC_MODEL_KIMI_K2_5 = {
	id: "kimi-k2-5-260127",
	name: "Kimi K2.5",
	reasoning: false,
	input: ["text", "image"],
	contextWindow: 256e3,
	maxTokens: 4096
};
const VOLC_MODEL_GLM_4_7 = {
	id: "glm-4-7-251222",
	name: "GLM 4.7",
	reasoning: false,
	input: ["text", "image"],
	contextWindow: 2e5,
	maxTokens: 4096
};
const VOLC_SHARED_CODING_MODEL_CATALOG = [
	{
		id: "ark-code-latest",
		name: "Ark Coding Plan",
		reasoning: false,
		input: ["text"],
		contextWindow: 256e3,
		maxTokens: 4096
	},
	{
		id: "doubao-seed-code",
		name: "Doubao Seed Code",
		reasoning: false,
		input: ["text"],
		contextWindow: 256e3,
		maxTokens: 4096
	},
	{
		id: "glm-4.7",
		name: "GLM 4.7 Coding",
		reasoning: false,
		input: ["text"],
		contextWindow: 2e5,
		maxTokens: 4096
	},
	{
		id: "kimi-k2-thinking",
		name: "Kimi K2 Thinking",
		reasoning: false,
		input: ["text"],
		contextWindow: 256e3,
		maxTokens: 4096
	},
	{
		id: "kimi-k2.5",
		name: "Kimi K2.5 Coding",
		reasoning: false,
		input: ["text"],
		contextWindow: 256e3,
		maxTokens: 4096
	}
];
function buildVolcModelDefinition(entry, cost) {
	return {
		id: entry.id,
		name: entry.name,
		reasoning: entry.reasoning,
		input: [...entry.input],
		cost,
		contextWindow: entry.contextWindow,
		maxTokens: entry.maxTokens
	};
}
//#endregion
//#region src/agents/byteplus-models.ts
const BYTEPLUS_BASE_URL = "https://ark.ap-southeast.bytepluses.com/api/v3";
const BYTEPLUS_CODING_BASE_URL = "https://ark.ap-southeast.bytepluses.com/api/coding/v3";
const BYTEPLUS_DEFAULT_COST = {
	input: 1e-4,
	output: 2e-4,
	cacheRead: 0,
	cacheWrite: 0
};
/**
* Complete catalog of BytePlus ARK models.
*
* BytePlus ARK provides access to various models
* through the ARK API. Authentication requires a BYTEPLUS_API_KEY.
*/
const BYTEPLUS_MODEL_CATALOG = [
	{
		id: "seed-1-8-251228",
		name: "Seed 1.8",
		reasoning: false,
		input: ["text", "image"],
		contextWindow: 256e3,
		maxTokens: 4096
	},
	VOLC_MODEL_KIMI_K2_5,
	VOLC_MODEL_GLM_4_7
];
function buildBytePlusModelDefinition(entry) {
	return buildVolcModelDefinition(entry, BYTEPLUS_DEFAULT_COST);
}
const BYTEPLUS_CODING_MODEL_CATALOG = VOLC_SHARED_CODING_MODEL_CATALOG;
//#endregion
//#region src/agents/doubao-models.ts
const DOUBAO_BASE_URL = "https://ark.cn-beijing.volces.com/api/v3";
const DOUBAO_CODING_BASE_URL = "https://ark.cn-beijing.volces.com/api/coding/v3";
const DOUBAO_DEFAULT_COST = {
	input: 1e-4,
	output: 2e-4,
	cacheRead: 0,
	cacheWrite: 0
};
/**
* Complete catalog of Volcano Engine models.
*
* Volcano Engine provides access to models
* through the API. Authentication requires a Volcano Engine API Key.
*/
const DOUBAO_MODEL_CATALOG = [
	{
		id: "doubao-seed-code-preview-251028",
		name: "doubao-seed-code-preview-251028",
		reasoning: false,
		input: ["text", "image"],
		contextWindow: 256e3,
		maxTokens: 4096
	},
	{
		id: "doubao-seed-1-8-251228",
		name: "Doubao Seed 1.8",
		reasoning: false,
		input: ["text", "image"],
		contextWindow: 256e3,
		maxTokens: 4096
	},
	VOLC_MODEL_KIMI_K2_5,
	VOLC_MODEL_GLM_4_7,
	{
		id: "deepseek-v3-2-251201",
		name: "DeepSeek V3.2",
		reasoning: false,
		input: ["text", "image"],
		contextWindow: 128e3,
		maxTokens: 4096
	}
];
function buildDoubaoModelDefinition(entry) {
	return buildVolcModelDefinition(entry, DOUBAO_DEFAULT_COST);
}
const DOUBAO_CODING_MODEL_CATALOG = [...VOLC_SHARED_CODING_MODEL_CATALOG, {
	id: "doubao-seed-code-preview-251028",
	name: "Doubao Seed Code Preview",
	reasoning: false,
	input: ["text"],
	contextWindow: 256e3,
	maxTokens: 4096
}];
//#endregion
//#region src/agents/vllm-defaults.ts
const VLLM_DEFAULT_BASE_URL = "http://127.0.0.1:8000/v1";
const VLLM_PROVIDER_LABEL = "vLLM";
const VLLM_DEFAULT_API_KEY_ENV_VAR = "VLLM_API_KEY";
const VLLM_MODEL_PLACEHOLDER = "meta-llama/Meta-Llama-3-8B-Instruct";
//#endregion
//#region src/agents/sglang-defaults.ts
const SGLANG_DEFAULT_BASE_URL = "http://127.0.0.1:30000/v1";
const SGLANG_PROVIDER_LABEL = "SGLang";
const SGLANG_DEFAULT_API_KEY_ENV_VAR = "SGLANG_API_KEY";
const SGLANG_MODEL_PLACEHOLDER = "Qwen/Qwen3-8B";
//#endregion
//#region src/agents/vercel-ai-gateway.ts
const VERCEL_AI_GATEWAY_PROVIDER_ID = "vercel-ai-gateway";
const VERCEL_AI_GATEWAY_BASE_URL = "https://ai-gateway.vercel.sh";
`${VERCEL_AI_GATEWAY_PROVIDER_ID}`;
const VERCEL_AI_GATEWAY_DEFAULT_COST = {
	input: 0,
	output: 0,
	cacheRead: 0,
	cacheWrite: 0
};
const log = createSubsystemLogger("agents/vercel-ai-gateway");
const STATIC_VERCEL_AI_GATEWAY_MODEL_CATALOG = [
	{
		id: "anthropic/claude-opus-4.6",
		name: "Claude Opus 4.6",
		reasoning: true,
		input: ["text", "image"],
		contextWindow: 1e6,
		maxTokens: 128e3,
		cost: {
			input: 5,
			output: 25,
			cacheRead: .5,
			cacheWrite: 6.25
		}
	},
	{
		id: "openai/gpt-5.4",
		name: "GPT 5.4",
		reasoning: true,
		input: ["text", "image"],
		contextWindow: 2e5,
		maxTokens: 128e3,
		cost: {
			input: 2.5,
			output: 15,
			cacheRead: .25
		}
	},
	{
		id: "openai/gpt-5.4-pro",
		name: "GPT 5.4 Pro",
		reasoning: true,
		input: ["text", "image"],
		contextWindow: 2e5,
		maxTokens: 128e3,
		cost: {
			input: 30,
			output: 180,
			cacheRead: 0
		}
	}
];
function toPerMillionCost(value) {
	const numeric = typeof value === "number" ? value : typeof value === "string" ? Number.parseFloat(value) : NaN;
	if (!Number.isFinite(numeric) || numeric < 0) return 0;
	return numeric * 1e6;
}
function normalizeCost(pricing) {
	return {
		input: toPerMillionCost(pricing?.input),
		output: toPerMillionCost(pricing?.output),
		cacheRead: toPerMillionCost(pricing?.input_cache_read),
		cacheWrite: toPerMillionCost(pricing?.input_cache_write)
	};
}
function buildStaticModelDefinition(model) {
	return {
		id: model.id,
		name: model.name,
		reasoning: model.reasoning,
		input: model.input,
		contextWindow: model.contextWindow,
		maxTokens: model.maxTokens,
		cost: {
			...VERCEL_AI_GATEWAY_DEFAULT_COST,
			...model.cost
		}
	};
}
function getStaticFallbackModel(id) {
	const fallback = STATIC_VERCEL_AI_GATEWAY_MODEL_CATALOG.find((model) => model.id === id);
	return fallback ? buildStaticModelDefinition(fallback) : void 0;
}
function getStaticVercelAiGatewayModelCatalog() {
	return STATIC_VERCEL_AI_GATEWAY_MODEL_CATALOG.map(buildStaticModelDefinition);
}
function buildDiscoveredModelDefinition(model) {
	const id = typeof model.id === "string" ? model.id.trim() : "";
	if (!id) return null;
	const fallback = getStaticFallbackModel(id);
	const contextWindow = typeof model.context_window === "number" && Number.isFinite(model.context_window) ? model.context_window : fallback?.contextWindow ?? 2e5;
	const maxTokens = typeof model.max_tokens === "number" && Number.isFinite(model.max_tokens) ? model.max_tokens : fallback?.maxTokens ?? 128e3;
	const normalizedCost = normalizeCost(model.pricing);
	return {
		id,
		name: (typeof model.name === "string" ? model.name.trim() : "") || fallback?.name || id,
		reasoning: Array.isArray(model.tags) && model.tags.includes("reasoning") ? true : fallback?.reasoning ?? false,
		input: Array.isArray(model.tags) ? model.tags.includes("vision") ? ["text", "image"] : ["text"] : fallback?.input ?? ["text"],
		contextWindow,
		maxTokens,
		cost: normalizedCost.input > 0 || normalizedCost.output > 0 || normalizedCost.cacheRead > 0 || normalizedCost.cacheWrite > 0 ? normalizedCost : fallback?.cost ?? VERCEL_AI_GATEWAY_DEFAULT_COST
	};
}
async function discoverVercelAiGatewayModels() {
	if (process.env.VITEST || false) return getStaticVercelAiGatewayModelCatalog();
	try {
		const response = await fetch(`${VERCEL_AI_GATEWAY_BASE_URL}/v1/models`, { signal: AbortSignal.timeout(5e3) });
		if (!response.ok) {
			log.warn(`Failed to discover Vercel AI Gateway models: HTTP ${response.status}`);
			return getStaticVercelAiGatewayModelCatalog();
		}
		const discovered = ((await response.json()).data ?? []).map(buildDiscoveredModelDefinition).filter((entry) => entry !== null);
		return discovered.length > 0 ? discovered : getStaticVercelAiGatewayModelCatalog();
	} catch (error) {
		log.warn(`Failed to discover Vercel AI Gateway models: ${String(error)}`);
		return getStaticVercelAiGatewayModelCatalog();
	}
}
//#endregion
//#region src/plugin-sdk/provider-models.ts
function buildKilocodeModelDefinition() {
	return {
		id: KILOCODE_DEFAULT_MODEL_ID,
		name: KILOCODE_DEFAULT_MODEL_NAME,
		reasoning: true,
		input: ["text", "image"],
		cost: KILOCODE_DEFAULT_COST,
		contextWindow: KILOCODE_DEFAULT_CONTEXT_WINDOW,
		maxTokens: KILOCODE_DEFAULT_MAX_TOKENS
	};
}
//#endregion
export { buildOllamaModelDefinition as $, TOGETHER_MODEL_CATALOG as A, CHUTES_DEFAULT_MODEL_ID as B, VENICE_DEFAULT_MODEL_REF as C, resolveRetryConfig as D, discoverVeniceModels as E, SYNTHETIC_BASE_URL as F, discoverKilocodeModels as G, CHUTES_MODEL_CATALOG as H, SYNTHETIC_DEFAULT_MODEL_REF as I, buildHuggingfaceModelDefinition as J, HUGGINGFACE_BASE_URL as K, SYNTHETIC_MODEL_CATALOG as L, DEEPSEEK_BASE_URL as M, DEEPSEEK_MODEL_CATALOG as N, retryAsync as O, buildDeepSeekModelDefinition as P, OLLAMA_DEFAULT_MAX_TOKENS as Q, buildSyntheticModelDefinition as R, VENICE_BASE_URL as S, buildVeniceModelDefinition as T, buildChutesModelDefinition as U, CHUTES_DEFAULT_MODEL_REF as V, discoverChutesModels as W, OLLAMA_DEFAULT_CONTEXT_WINDOW as X, discoverHuggingfaceModels as Y, OLLAMA_DEFAULT_COST as Z, BYTEPLUS_BASE_URL as _, OPENCODE_ZEN_DEFAULT_MODEL$1 as _t, SGLANG_DEFAULT_BASE_URL as a, buildCloudflareAiGatewayModelDefinition as at, BYTEPLUS_MODEL_CATALOG as b, ensureModelAllowlistEntry as bt, VLLM_DEFAULT_API_KEY_ENV_VAR as c, GOOGLE_GEMINI_DEFAULT_MODEL as ct, VLLM_PROVIDER_LABEL as d, OPENAI_DEFAULT_EMBEDDING_MODEL as dt, enrichOllamaModelsWithContext as et, DOUBAO_BASE_URL as f, OPENAI_DEFAULT_IMAGE_MODEL as ft, buildDoubaoModelDefinition as g, OPENCODE_GO_DEFAULT_MODEL_REF as gt, DOUBAO_MODEL_CATALOG as h, OPENAI_DEFAULT_TTS_VOICE as ht, SGLANG_DEFAULT_API_KEY_ENV_VAR as i, CLOUDFLARE_AI_GATEWAY_DEFAULT_MODEL_REF as it, buildTogetherModelDefinition as j, TOGETHER_BASE_URL as k, VLLM_DEFAULT_BASE_URL as l, OPENAI_CODEX_DEFAULT_MODEL as lt, DOUBAO_CODING_MODEL_CATALOG as m, OPENAI_DEFAULT_TTS_MODEL as mt, VERCEL_AI_GATEWAY_BASE_URL as n, isReasoningModelHeuristic as nt, SGLANG_MODEL_PLACEHOLDER as o, resolveCloudflareAiGatewayBaseUrl as ot, DOUBAO_CODING_BASE_URL as p, OPENAI_DEFAULT_MODEL as pt, HUGGINGFACE_MODEL_CATALOG as q, discoverVercelAiGatewayModels as r, resolveOllamaApiBase as rt, SGLANG_PROVIDER_LABEL as s, OPENCODE_ZEN_DEFAULT_MODEL_REF as st, buildKilocodeModelDefinition as t, fetchOllamaModels as tt, VLLM_MODEL_PLACEHOLDER as u, OPENAI_DEFAULT_AUDIO_TRANSCRIPTION_MODEL as ut, BYTEPLUS_CODING_BASE_URL as v, applyGoogleGeminiModelDefault as vt, VENICE_MODEL_CATALOG as w, buildBytePlusModelDefinition as x, BYTEPLUS_CODING_MODEL_CATALOG as y, applyOpenAIConfig as yt, CHUTES_BASE_URL as z };
