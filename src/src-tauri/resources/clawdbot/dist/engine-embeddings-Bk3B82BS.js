import { i as formatErrorMessage } from "./errors-D8p6rxH8.js";
import { i as normalizeLowercaseStringOrEmpty, s as normalizeOptionalString } from "./string-coerce-BUSzWgUA.js";
import "./utils-D5DtWkEu.js";
import { t as createSubsystemLogger } from "./subsystem-Cgmckbux.js";
import { t as isTruthyEnvValue } from "./env-BiSxzotM.js";
import { J as normalizeGoogleApiBaseUrl } from "./io-5pxHCi7V.js";
import { r as parseStaticModelRef } from "./model-ref-shared-DbcQI0Bg.js";
import { t as requireApiKey } from "./model-auth-runtime-shared-jdNQNamX.js";
import { s as resolveApiKeyForProvider } from "./model-auth-KKLbMBGv.js";
import { n as fetchWithSsrFGuard } from "./fetch-guard-B3p4gGaY.js";
import { t as parseGeminiAuth } from "./gemini-auth-CalhrTDk.js";
import { n as executeWithApiKeyRotation, t as collectProviderApiKeysForExecution } from "./api-key-rotation-BaBwK9eH.js";
import { n as retryAsync } from "./retry-cGVSdz2T.js";
import "./ollama-runtime-uuoemyaO.js";
import "./memory-embedding-provider-runtime-DRhODP2c.js";
import { d as buildLmstudioAuthHeaders, l as LMSTUDIO_PROVIDER_ID, p as ensureLmstudioModelLoaded, r as LMSTUDIO_DEFAULT_EMBEDDING_MODEL, v as resolveLmstudioInferenceBase, x as resolveLmstudioRuntimeApiKey, y as resolveLmstudioProviderHeaders } from "./lmstudio-runtime-uUnS_5bF.js";
import { r as resolveCopilotApiToken } from "./github-copilot-token-BDB-z3-k.js";
import { n as OPENAI_DEFAULT_EMBEDDING_MODEL } from "./provider-model-defaults-do_BdIZh.js";
import { _ as estimateUtf8Bytes, f as runWithConcurrency, h as hasNonTextEmbeddingParts, o as hashText, v as splitTextToUtf8ByteLimit } from "./internal-DHMTwtHq.js";
import { n as resolveMemorySecretInputString } from "./secret-input-BrirjS7F.js";
import "node:fs";
import { Readable } from "node:stream";
import { createInterface } from "node:readline";
//#region src/memory-host-sdk/host/embedding-vectors.ts
function sanitizeAndNormalizeEmbedding(vec) {
	const sanitized = vec.map((value) => Number.isFinite(value) ? value : 0);
	const magnitude = Math.sqrt(sanitized.reduce((sum, value) => sum + value * value, 0));
	if (magnitude < 1e-10) return sanitized;
	return sanitized.map((value) => value / magnitude);
}
//#endregion
//#region src/memory-host-sdk/host/embeddings-debug.ts
const debugEmbeddings = isTruthyEnvValue(process.env.OPENCLAW_DEBUG_MEMORY_EMBEDDINGS);
const log$1 = createSubsystemLogger("memory/embeddings");
function debugEmbeddingsLog(message, meta) {
	if (!debugEmbeddings) return;
	const suffix = meta ? ` ${JSON.stringify(meta)}` : "";
	log$1.raw(`${message}${suffix}`);
}
//#endregion
//#region src/memory-host-sdk/host/remote-http.ts
function buildRemoteBaseUrlPolicy(baseUrl) {
	const trimmed = baseUrl.trim();
	if (!trimmed) return;
	try {
		const parsed = new URL(trimmed);
		if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return;
		return { allowedHostnames: [parsed.hostname] };
	} catch {
		return;
	}
}
async function withRemoteHttpResponse(params) {
	const { response, release } = await fetchWithSsrFGuard({
		url: params.url,
		fetchImpl: params.fetchImpl,
		init: params.init,
		policy: params.ssrfPolicy,
		auditContext: params.auditContext ?? "memory-remote"
	});
	try {
		return await params.onResponse(response);
	} finally {
		await release();
	}
}
//#endregion
//#region src/memory-host-sdk/host/embeddings-gemini.ts
const DEFAULT_GEMINI_EMBEDDING_MODEL = "gemini-embedding-001";
const GEMINI_MAX_INPUT_TOKENS = { "text-embedding-004": 2048 };
const GEMINI_EMBEDDING_2_MODELS = new Set(["gemini-embedding-2-preview"]);
const GEMINI_EMBEDDING_2_DEFAULT_DIMENSIONS = 3072;
const GEMINI_EMBEDDING_2_VALID_DIMENSIONS = [
	768,
	1536,
	3072
];
/** Builds the text-only Gemini embedding request shape used across direct and batch APIs. */
function buildGeminiTextEmbeddingRequest(params) {
	return buildGeminiEmbeddingRequest({
		input: { text: params.text },
		taskType: params.taskType,
		outputDimensionality: params.outputDimensionality,
		modelPath: params.modelPath
	});
}
function buildGeminiEmbeddingRequest(params) {
	const request = {
		content: { parts: params.input.parts?.map((part) => part.type === "text" ? { text: part.text } : { inlineData: {
			mimeType: part.mimeType,
			data: part.data
		} }) ?? [{ text: params.input.text }] },
		taskType: params.taskType
	};
	if (params.modelPath) request.model = params.modelPath;
	if (params.outputDimensionality != null) request.outputDimensionality = params.outputDimensionality;
	return request;
}
/**
* Returns true if the given model name is a gemini-embedding-2 variant that
* supports `outputDimensionality` and extended task types.
*/
function isGeminiEmbedding2Model(model) {
	return GEMINI_EMBEDDING_2_MODELS.has(model);
}
/**
* Validate and return the `outputDimensionality` for gemini-embedding-2 models.
* Returns `undefined` for older models (they don't support the param).
*/
function resolveGeminiOutputDimensionality(model, requested) {
	if (!isGeminiEmbedding2Model(model)) return;
	if (requested == null) return GEMINI_EMBEDDING_2_DEFAULT_DIMENSIONS;
	const valid = GEMINI_EMBEDDING_2_VALID_DIMENSIONS;
	if (!valid.includes(requested)) throw new Error(`Invalid outputDimensionality ${requested} for ${model}. Valid values: ${valid.join(", ")}`);
	return requested;
}
function resolveRemoteApiKey(remoteApiKey) {
	const trimmed = resolveMemorySecretInputString({
		value: remoteApiKey,
		path: "agents.*.memorySearch.remote.apiKey"
	});
	if (!trimmed) return;
	if (trimmed === "GOOGLE_API_KEY" || trimmed === "GEMINI_API_KEY") return process.env[trimmed]?.trim();
	return trimmed;
}
function normalizeGeminiModel(model) {
	const trimmed = model.trim();
	if (!trimmed) return DEFAULT_GEMINI_EMBEDDING_MODEL;
	const withoutPrefix = trimmed.replace(/^models\//, "");
	if (withoutPrefix.startsWith("gemini/")) return withoutPrefix.slice(7);
	if (withoutPrefix.startsWith("google/")) return withoutPrefix.slice(7);
	return withoutPrefix;
}
async function fetchGeminiEmbeddingPayload(params) {
	return await executeWithApiKeyRotation({
		provider: "google",
		apiKeys: params.client.apiKeys,
		execute: async (apiKey) => {
			const headers = {
				...parseGeminiAuth(apiKey).headers,
				...params.client.headers
			};
			return await withRemoteHttpResponse({
				url: params.endpoint,
				ssrfPolicy: params.client.ssrfPolicy,
				init: {
					method: "POST",
					headers,
					body: JSON.stringify(params.body)
				},
				onResponse: async (res) => {
					if (!res.ok) {
						const text = await res.text();
						throw new Error(`gemini embeddings failed: ${res.status} ${text}`);
					}
					return await res.json();
				}
			});
		}
	});
}
function normalizeGeminiBaseUrl(raw) {
	const trimmed = raw.replace(/\/+$/, "");
	const openAiIndex = trimmed.indexOf("/openai");
	if (openAiIndex > -1) return normalizeGoogleApiBaseUrl(trimmed.slice(0, openAiIndex));
	return normalizeGoogleApiBaseUrl(trimmed);
}
function buildGeminiModelPath(model) {
	return model.startsWith("models/") ? model : `models/${model}`;
}
async function createGeminiEmbeddingProvider(options) {
	const client = await resolveGeminiEmbeddingClient(options);
	const baseUrl = client.baseUrl.replace(/\/$/, "");
	const embedUrl = `${baseUrl}/${client.modelPath}:embedContent`;
	const batchUrl = `${baseUrl}/${client.modelPath}:batchEmbedContents`;
	const isV2 = isGeminiEmbedding2Model(client.model);
	const outputDimensionality = client.outputDimensionality;
	const embedQuery = async (text) => {
		if (!text.trim()) return [];
		return sanitizeAndNormalizeEmbedding((await fetchGeminiEmbeddingPayload({
			client,
			endpoint: embedUrl,
			body: buildGeminiTextEmbeddingRequest({
				text,
				taskType: options.taskType ?? "RETRIEVAL_QUERY",
				outputDimensionality: isV2 ? outputDimensionality : void 0
			})
		})).embedding?.values ?? []);
	};
	const embedBatchInputs = async (inputs) => {
		if (inputs.length === 0) return [];
		const payload = await fetchGeminiEmbeddingPayload({
			client,
			endpoint: batchUrl,
			body: { requests: inputs.map((input) => buildGeminiEmbeddingRequest({
				input,
				modelPath: client.modelPath,
				taskType: options.taskType ?? "RETRIEVAL_DOCUMENT",
				outputDimensionality: isV2 ? outputDimensionality : void 0
			})) }
		});
		const embeddings = Array.isArray(payload.embeddings) ? payload.embeddings : [];
		return inputs.map((_, index) => sanitizeAndNormalizeEmbedding(embeddings[index]?.values ?? []));
	};
	const embedBatch = async (texts) => {
		return await embedBatchInputs(texts.map((text) => ({ text })));
	};
	return {
		provider: {
			id: "gemini",
			model: client.model,
			maxInputTokens: GEMINI_MAX_INPUT_TOKENS[client.model],
			embedQuery,
			embedBatch,
			embedBatchInputs
		},
		client
	};
}
async function resolveGeminiEmbeddingClient(options) {
	const remote = options.remote;
	const remoteApiKey = resolveRemoteApiKey(remote?.apiKey);
	const remoteBaseUrl = remote?.baseUrl?.trim();
	const apiKey = remoteApiKey ? remoteApiKey : requireApiKey(await resolveApiKeyForProvider({
		provider: "google",
		cfg: options.config,
		agentDir: options.agentDir
	}), "google");
	const providerConfig = options.config.models?.providers?.google;
	const rawBaseUrl = remoteBaseUrl || normalizeOptionalString(providerConfig?.baseUrl) || "https://generativelanguage.googleapis.com/v1beta";
	const baseUrl = normalizeGeminiBaseUrl(rawBaseUrl);
	const ssrfPolicy = buildRemoteBaseUrlPolicy(baseUrl);
	const headers = { ...Object.assign({}, providerConfig?.headers, remote?.headers) };
	const apiKeys = collectProviderApiKeysForExecution({
		provider: "google",
		primaryApiKey: apiKey
	});
	const model = normalizeGeminiModel(options.model);
	const modelPath = buildGeminiModelPath(model);
	const outputDimensionality = resolveGeminiOutputDimensionality(model, options.outputDimensionality);
	debugEmbeddingsLog("memory embeddings: gemini client", {
		rawBaseUrl,
		baseUrl,
		model,
		modelPath,
		outputDimensionality,
		embedEndpoint: `${baseUrl}/${modelPath}:embedContent`,
		batchEndpoint: `${baseUrl}/${modelPath}:batchEmbedContents`
	});
	return {
		baseUrl,
		headers,
		ssrfPolicy,
		model,
		modelPath,
		apiKeys,
		outputDimensionality
	};
}
//#endregion
//#region src/memory-host-sdk/host/embeddings-model-normalize.ts
function normalizeEmbeddingModelWithPrefixes(params) {
	const trimmed = params.model.trim();
	if (!trimmed) return params.defaultModel;
	for (const prefix of params.prefixes) if (trimmed.startsWith(prefix)) return trimmed.slice(prefix.length);
	return trimmed;
}
//#endregion
//#region src/memory-host-sdk/host/embeddings-remote-client.ts
async function resolveRemoteEmbeddingBearerClient(params) {
	const remote = params.options.remote;
	const remoteApiKey = resolveMemorySecretInputString({
		value: remote?.apiKey,
		path: "agents.*.memorySearch.remote.apiKey"
	});
	const remoteBaseUrl = normalizeOptionalString(remote?.baseUrl);
	const providerConfig = params.options.config.models?.providers?.[params.provider];
	const apiKey = remoteApiKey ? remoteApiKey : requireApiKey(await resolveApiKeyForProvider({
		provider: params.provider,
		cfg: params.options.config,
		agentDir: params.options.agentDir
	}), params.provider);
	const baseUrl = remoteBaseUrl || normalizeOptionalString(providerConfig?.baseUrl) || params.defaultBaseUrl;
	const headerOverrides = Object.assign({}, providerConfig?.headers, remote?.headers);
	return {
		baseUrl,
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${apiKey}`,
			...headerOverrides
		},
		ssrfPolicy: buildRemoteBaseUrlPolicy(baseUrl)
	};
}
//#endregion
//#region src/memory-host-sdk/host/post-json.ts
async function postJson(params) {
	return await withRemoteHttpResponse({
		url: params.url,
		ssrfPolicy: params.ssrfPolicy,
		fetchImpl: params.fetchImpl,
		init: {
			method: "POST",
			headers: params.headers,
			body: JSON.stringify(params.body)
		},
		onResponse: async (res) => {
			if (!res.ok) {
				const text = await res.text();
				const err = /* @__PURE__ */ new Error(`${params.errorPrefix}: ${res.status} ${text}`);
				if (params.attachStatus) err.status = res.status;
				throw err;
			}
			return await params.parse(await res.json());
		}
	});
}
//#endregion
//#region src/memory-host-sdk/host/embeddings-remote-fetch.ts
async function fetchRemoteEmbeddingVectors(params) {
	return await postJson({
		url: params.url,
		headers: params.headers,
		ssrfPolicy: params.ssrfPolicy,
		fetchImpl: params.fetchImpl,
		body: params.body,
		errorPrefix: params.errorPrefix,
		parse: (payload) => {
			return (payload.data ?? []).map((entry) => entry.embedding ?? []);
		}
	});
}
//#endregion
//#region src/memory-host-sdk/host/embeddings-remote-provider.ts
function createRemoteEmbeddingProvider(params) {
	const { client } = params;
	const url = `${client.baseUrl.replace(/\/$/, "")}/embeddings`;
	const embed = async (input) => {
		if (input.length === 0) return [];
		return await fetchRemoteEmbeddingVectors({
			url,
			headers: client.headers,
			ssrfPolicy: client.ssrfPolicy,
			fetchImpl: client.fetchImpl,
			body: {
				model: client.model,
				input
			},
			errorPrefix: params.errorPrefix
		});
	};
	return {
		id: params.id,
		model: client.model,
		...typeof params.maxInputTokens === "number" ? { maxInputTokens: params.maxInputTokens } : {},
		embedQuery: async (text) => {
			const [vec] = await embed([text]);
			return vec ?? [];
		},
		embedBatch: embed
	};
}
async function resolveRemoteEmbeddingClient(params) {
	const { baseUrl, headers, ssrfPolicy } = await resolveRemoteEmbeddingBearerClient({
		provider: params.provider,
		options: params.options,
		defaultBaseUrl: params.defaultBaseUrl
	});
	return {
		baseUrl,
		headers,
		ssrfPolicy,
		model: params.normalizeModel(params.options.model)
	};
}
//#endregion
//#region src/memory-host-sdk/host/embeddings-lmstudio.ts
const log = createSubsystemLogger("memory/embeddings");
const DEFAULT_LMSTUDIO_EMBEDDING_MODEL = LMSTUDIO_DEFAULT_EMBEDDING_MODEL;
/** Normalizes LM Studio embedding model refs and accepts `lmstudio/` prefix. */
function normalizeLmstudioModel(model) {
	return normalizeEmbeddingModelWithPrefixes({
		model,
		defaultModel: DEFAULT_LMSTUDIO_EMBEDDING_MODEL,
		prefixes: ["lmstudio/"]
	});
}
function hasAuthorizationHeader(headers) {
	if (!headers) return false;
	return Object.entries(headers).some(([headerName, value]) => headerName.trim().toLowerCase() === "authorization" && value.trim().length > 0);
}
/** Resolves API key (real or synthetic placeholder) from runtime/provider auth config. */
async function resolveLmstudioApiKey(options) {
	try {
		return await resolveLmstudioRuntimeApiKey({
			config: options.config,
			agentDir: options.agentDir
		});
	} catch (error) {
		if (/LM Studio API key is required/i.test(formatErrorMessage(error))) return;
		throw error;
	}
}
/** Creates the LM Studio embedding provider client and preloads the target model before return. */
async function createLmstudioEmbeddingProvider(options) {
	const providerConfig = options.config.models?.providers?.lmstudio;
	const providerBaseUrl = providerConfig?.baseUrl?.trim();
	const isFallbackActivation = options.fallback === "lmstudio" && options.provider !== "lmstudio";
	const remoteBaseUrl = options.remote?.baseUrl?.trim();
	const remoteApiKey = !isFallbackActivation ? resolveMemorySecretInputString({
		value: options.remote?.apiKey,
		path: "agents.*.memorySearch.remote.apiKey"
	}) : void 0;
	const baseUrlSource = !isFallbackActivation ? remoteBaseUrl : void 0;
	const baseUrl = resolveLmstudioInferenceBase(baseUrlSource && baseUrlSource.length > 0 ? baseUrlSource : providerBaseUrl && providerBaseUrl.length > 0 ? providerBaseUrl : void 0);
	const model = normalizeLmstudioModel(options.model);
	const providerHeaders = await resolveLmstudioProviderHeaders({
		config: options.config,
		env: process.env,
		headers: Object.assign({}, providerConfig?.headers, !isFallbackActivation ? options.remote?.headers : {})
	});
	const apiKey = hasAuthorizationHeader(providerHeaders) ? void 0 : !isFallbackActivation ? remoteApiKey?.trim() || await resolveLmstudioApiKey(options) : await resolveLmstudioApiKey(options);
	const headerOverrides = Object.assign({}, providerHeaders);
	const headers = buildLmstudioAuthHeaders({
		apiKey,
		json: true,
		headers: headerOverrides
	}) ?? {};
	const ssrfPolicy = buildRemoteBaseUrlPolicy(baseUrl);
	const client = {
		baseUrl,
		model,
		headers,
		ssrfPolicy
	};
	try {
		await ensureLmstudioModelLoaded({
			baseUrl,
			apiKey,
			headers: headerOverrides,
			ssrfPolicy,
			modelKey: model,
			timeoutMs: 12e4
		});
	} catch (error) {
		log.warn("lmstudio embeddings warmup failed; continuing without preload", {
			baseUrl,
			model,
			error: formatErrorMessage(error)
		});
	}
	return {
		provider: createRemoteEmbeddingProvider({
			id: LMSTUDIO_PROVIDER_ID,
			client,
			errorPrefix: "lmstudio embeddings failed"
		}),
		client
	};
}
//#endregion
//#region src/memory-host-sdk/host/embeddings-mistral.ts
const DEFAULT_MISTRAL_EMBEDDING_MODEL = "mistral-embed";
const DEFAULT_MISTRAL_BASE_URL = "https://api.mistral.ai/v1";
function normalizeMistralModel(model) {
	return normalizeEmbeddingModelWithPrefixes({
		model,
		defaultModel: DEFAULT_MISTRAL_EMBEDDING_MODEL,
		prefixes: ["mistral/"]
	});
}
async function createMistralEmbeddingProvider(options) {
	const client = await resolveMistralEmbeddingClient(options);
	return {
		provider: createRemoteEmbeddingProvider({
			id: "mistral",
			client,
			errorPrefix: "mistral embeddings failed"
		}),
		client
	};
}
async function resolveMistralEmbeddingClient(options) {
	return await resolveRemoteEmbeddingClient({
		provider: "mistral",
		options,
		defaultBaseUrl: DEFAULT_MISTRAL_BASE_URL,
		normalizeModel: normalizeMistralModel
	});
}
//#endregion
//#region src/memory-host-sdk/host/embeddings-openai.ts
const DEFAULT_OPENAI_BASE_URL = "https://api.openai.com/v1";
const DEFAULT_OPENAI_EMBEDDING_MODEL = OPENAI_DEFAULT_EMBEDDING_MODEL;
const OPENAI_MAX_INPUT_TOKENS = {
	"text-embedding-3-small": 8192,
	"text-embedding-3-large": 8192,
	"text-embedding-ada-002": 8191
};
function normalizeOpenAiModel(model) {
	const trimmed = model.trim();
	if (!trimmed) return DEFAULT_OPENAI_EMBEDDING_MODEL;
	const parsed = parseStaticModelRef(trimmed, "openai");
	return parsed && parsed.provider === "openai" ? parsed.model : trimmed;
}
async function createOpenAiEmbeddingProvider(options) {
	const client = await resolveOpenAiEmbeddingClient(options);
	return {
		provider: createRemoteEmbeddingProvider({
			id: "openai",
			client,
			errorPrefix: "openai embeddings failed",
			maxInputTokens: OPENAI_MAX_INPUT_TOKENS[client.model]
		}),
		client
	};
}
async function resolveOpenAiEmbeddingClient(options) {
	return await resolveRemoteEmbeddingClient({
		provider: "openai",
		options,
		defaultBaseUrl: DEFAULT_OPENAI_BASE_URL,
		normalizeModel: normalizeOpenAiModel
	});
}
//#endregion
//#region src/memory-host-sdk/host/embeddings-voyage.ts
const DEFAULT_VOYAGE_EMBEDDING_MODEL = "voyage-4-large";
const DEFAULT_VOYAGE_BASE_URL = "https://api.voyageai.com/v1";
const VOYAGE_MAX_INPUT_TOKENS = {
	"voyage-3": 32e3,
	"voyage-3-lite": 16e3,
	"voyage-code-3": 32e3
};
function normalizeVoyageModel(model) {
	return normalizeEmbeddingModelWithPrefixes({
		model,
		defaultModel: DEFAULT_VOYAGE_EMBEDDING_MODEL,
		prefixes: ["voyage/"]
	});
}
async function createVoyageEmbeddingProvider(options) {
	const client = await resolveVoyageEmbeddingClient(options);
	const url = `${client.baseUrl.replace(/\/$/, "")}/embeddings`;
	const embed = async (input, input_type) => {
		if (input.length === 0) return [];
		const body = {
			model: client.model,
			input
		};
		if (input_type) body.input_type = input_type;
		return await fetchRemoteEmbeddingVectors({
			url,
			headers: client.headers,
			ssrfPolicy: client.ssrfPolicy,
			body,
			errorPrefix: "voyage embeddings failed"
		});
	};
	return {
		provider: {
			id: "voyage",
			model: client.model,
			maxInputTokens: VOYAGE_MAX_INPUT_TOKENS[client.model],
			embedQuery: async (text) => {
				const [vec] = await embed([text], "query");
				return vec ?? [];
			},
			embedBatch: async (texts) => embed(texts, "document")
		},
		client
	};
}
async function resolveVoyageEmbeddingClient(options) {
	const { baseUrl, headers, ssrfPolicy } = await resolveRemoteEmbeddingBearerClient({
		provider: "voyage",
		options,
		defaultBaseUrl: DEFAULT_VOYAGE_BASE_URL
	});
	return {
		baseUrl,
		headers,
		ssrfPolicy,
		model: normalizeVoyageModel(options.model)
	};
}
//#endregion
//#region src/memory-host-sdk/host/node-llama.ts
async function importNodeLlamaCpp() {
	return import("node-llama-cpp");
}
//#endregion
//#region src/memory-host-sdk/host/embeddings.ts
const DEFAULT_LOCAL_MODEL = "hf:ggml-org/embeddinggemma-300m-qat-q8_0-GGUF/embeddinggemma-300m-qat-Q8_0.gguf";
async function createLocalEmbeddingProvider(options) {
	const modelPath = normalizeOptionalString(options.local?.modelPath) || "hf:ggml-org/embeddinggemma-300m-qat-q8_0-GGUF/embeddinggemma-300m-qat-Q8_0.gguf";
	const modelCacheDir = normalizeOptionalString(options.local?.modelCacheDir);
	const { getLlama, resolveModelFile, LlamaLogLevel } = await importNodeLlamaCpp();
	let llama = null;
	let embeddingModel = null;
	let embeddingContext = null;
	let initPromise = null;
	const ensureContext = async () => {
		if (embeddingContext) return embeddingContext;
		if (initPromise) return initPromise;
		initPromise = (async () => {
			try {
				if (!llama) llama = await getLlama({ logLevel: LlamaLogLevel.error });
				if (!embeddingModel) {
					const resolved = await resolveModelFile(modelPath, modelCacheDir || void 0);
					embeddingModel = await llama.loadModel({ modelPath: resolved });
				}
				if (!embeddingContext) embeddingContext = await embeddingModel.createEmbeddingContext();
				return embeddingContext;
			} catch (err) {
				initPromise = null;
				throw err;
			}
		})();
		return initPromise;
	};
	return {
		id: "local",
		model: modelPath,
		embedQuery: async (text) => {
			const embedding = await (await ensureContext()).getEmbeddingFor(text);
			return sanitizeAndNormalizeEmbedding(Array.from(embedding.vector));
		},
		embedBatch: async (texts) => {
			const ctx = await ensureContext();
			return await Promise.all(texts.map(async (text) => {
				const embedding = await ctx.getEmbeddingFor(text);
				return sanitizeAndNormalizeEmbedding(Array.from(embedding.vector));
			}));
		}
	};
}
//#endregion
//#region src/memory-host-sdk/host/embeddings-github-copilot.ts
const COPILOT_EMBEDDING_PROVIDER_ID = "github-copilot";
const COPILOT_HEADERS_STATIC = {
	"Content-Type": "application/json",
	"Editor-Version": "vscode/1.96.2",
	"User-Agent": "GitHubCopilotChat/0.26.7"
};
function resolveConfiguredBaseUrl(configuredBaseUrl, tokenBaseUrl) {
	const trimmed = configuredBaseUrl?.trim();
	if (trimmed) return trimmed;
	return tokenBaseUrl || "https://api.individual.githubcopilot.com";
}
async function resolveGitHubCopilotEmbeddingSession(client) {
	const token = await resolveCopilotApiToken({
		githubToken: client.githubToken,
		env: client.env,
		fetchImpl: client.fetchImpl
	});
	return {
		baseUrl: resolveConfiguredBaseUrl(client.baseUrl, token.baseUrl),
		headers: {
			...COPILOT_HEADERS_STATIC,
			...client.headers,
			Authorization: `Bearer ${token.token}`
		}
	};
}
function parseGitHubCopilotEmbeddingPayload(payload, expectedCount) {
	if (!payload || typeof payload !== "object") throw new Error("GitHub Copilot embeddings response missing data[]");
	const data = payload.data;
	if (!Array.isArray(data)) throw new Error("GitHub Copilot embeddings response missing data[]");
	const vectors = Array.from({ length: expectedCount });
	for (const entry of data) {
		if (!entry || typeof entry !== "object") throw new Error("GitHub Copilot embeddings response contains an invalid entry");
		const indexValue = entry.index;
		const embedding = entry.embedding;
		const index = typeof indexValue === "number" ? indexValue : NaN;
		if (!Number.isInteger(index)) throw new Error("GitHub Copilot embeddings response contains an invalid index");
		if (index < 0 || index >= expectedCount) throw new Error("GitHub Copilot embeddings response contains an out-of-range index");
		if (vectors[index] !== void 0) throw new Error("GitHub Copilot embeddings response contains duplicate indexes");
		if (!Array.isArray(embedding) || !embedding.every((value) => typeof value === "number")) throw new Error("GitHub Copilot embeddings response contains an invalid embedding");
		vectors[index] = sanitizeAndNormalizeEmbedding(embedding);
	}
	for (let index = 0; index < expectedCount; index += 1) if (vectors[index] === void 0) throw new Error("GitHub Copilot embeddings response missing vectors for some inputs");
	return vectors;
}
async function createGitHubCopilotEmbeddingProvider(client) {
	const initialSession = await resolveGitHubCopilotEmbeddingSession(client);
	const embed = async (input) => {
		if (input.length === 0) return [];
		const session = await resolveGitHubCopilotEmbeddingSession(client);
		return await withRemoteHttpResponse({
			url: `${session.baseUrl.replace(/\/$/, "")}/embeddings`,
			fetchImpl: client.fetchImpl,
			ssrfPolicy: buildRemoteBaseUrlPolicy(session.baseUrl),
			init: {
				method: "POST",
				headers: session.headers,
				body: JSON.stringify({
					model: client.model,
					input
				})
			},
			onResponse: async (response) => {
				if (!response.ok) throw new Error(`GitHub Copilot embeddings HTTP ${response.status}: ${await response.text()}`);
				let payload;
				try {
					payload = await response.json();
				} catch {
					throw new Error("GitHub Copilot embeddings returned invalid JSON");
				}
				return parseGitHubCopilotEmbeddingPayload(payload, input.length);
			}
		});
	};
	return {
		provider: {
			id: COPILOT_EMBEDDING_PROVIDER_ID,
			model: client.model,
			embedQuery: async (text) => {
				const [vector] = await embed([text]);
				return vector ?? [];
			},
			embedBatch: embed
		},
		client: {
			...client,
			baseUrl: initialSession.baseUrl
		}
	};
}
//#endregion
//#region src/memory-host-sdk/host/batch-utils.ts
function normalizeBatchBaseUrl(client) {
	return client.baseUrl?.replace(/\/$/, "") ?? "";
}
function buildBatchHeaders(client, params) {
	const headers = client.headers ? { ...client.headers } : {};
	if (params.json) {
		if (!headers["Content-Type"] && !headers["content-type"]) headers["Content-Type"] = "application/json";
	} else {
		delete headers["Content-Type"];
		delete headers["content-type"];
	}
	return headers;
}
function splitBatchRequests(requests, maxRequests) {
	if (requests.length <= maxRequests) return [requests];
	const groups = [];
	for (let i = 0; i < requests.length; i += maxRequests) groups.push(requests.slice(i, i + maxRequests));
	return groups;
}
//#endregion
//#region src/memory-host-sdk/host/batch-runner.ts
async function runEmbeddingBatchGroups(params) {
	if (params.requests.length === 0) return /* @__PURE__ */ new Map();
	const groups = splitBatchRequests(params.requests, params.maxRequests);
	const byCustomId = /* @__PURE__ */ new Map();
	const tasks = groups.map((group, groupIndex) => async () => {
		await params.runGroup({
			group,
			groupIndex,
			groups: groups.length,
			byCustomId
		});
	});
	params.debug?.(params.debugLabel, {
		requests: params.requests.length,
		groups: groups.length,
		wait: params.wait,
		concurrency: params.concurrency,
		pollIntervalMs: params.pollIntervalMs,
		timeoutMs: params.timeoutMs
	});
	await runWithConcurrency(tasks, params.concurrency);
	return byCustomId;
}
function buildEmbeddingBatchGroupOptions(params, options) {
	return {
		requests: params.requests,
		maxRequests: options.maxRequests,
		wait: params.wait,
		pollIntervalMs: params.pollIntervalMs,
		timeoutMs: params.timeoutMs,
		concurrency: params.concurrency,
		debug: params.debug,
		debugLabel: options.debugLabel
	};
}
//#endregion
//#region src/memory-host-sdk/host/batch-gemini.ts
const GEMINI_BATCH_MAX_REQUESTS = 5e4;
function getGeminiUploadUrl(baseUrl) {
	if (baseUrl.includes("/v1beta")) return baseUrl.replace(/\/v1beta\/?$/, "/upload/v1beta");
	return `${baseUrl.replace(/\/$/, "")}/upload`;
}
function buildGeminiUploadBody(params) {
	const boundary = `openclaw-${hashText(params.displayName)}`;
	const jsonPart = JSON.stringify({ file: {
		displayName: params.displayName,
		mimeType: "application/jsonl"
	} });
	const delimiter = `--${boundary}\r\n`;
	const closeDelimiter = `--${boundary}--\r\n`;
	const parts = [
		`${delimiter}Content-Type: application/json; charset=UTF-8\r\n\r\n${jsonPart}\r\n`,
		`${delimiter}Content-Type: application/jsonl; charset=UTF-8\r\n\r\n${params.jsonl}\r\n`,
		closeDelimiter
	];
	return {
		body: new Blob([parts.join("")], { type: "multipart/related" }),
		contentType: `multipart/related; boundary=${boundary}`
	};
}
async function submitGeminiBatch(params) {
	const baseUrl = normalizeBatchBaseUrl(params.gemini);
	const uploadPayload = buildGeminiUploadBody({
		jsonl: params.requests.map((request) => JSON.stringify({
			key: request.custom_id,
			request: request.request
		})).join("\n"),
		displayName: `memory-embeddings-${hashText(String(Date.now()))}`
	});
	const uploadUrl = `${getGeminiUploadUrl(baseUrl)}/files?uploadType=multipart`;
	debugEmbeddingsLog("memory embeddings: gemini batch upload", {
		uploadUrl,
		baseUrl,
		requests: params.requests.length
	});
	const filePayload = await withRemoteHttpResponse({
		url: uploadUrl,
		ssrfPolicy: params.gemini.ssrfPolicy,
		init: {
			method: "POST",
			headers: {
				...buildBatchHeaders(params.gemini, { json: false }),
				"Content-Type": uploadPayload.contentType
			},
			body: uploadPayload.body
		},
		onResponse: async (fileRes) => {
			if (!fileRes.ok) {
				const text = await fileRes.text();
				throw new Error(`gemini batch file upload failed: ${fileRes.status} ${text}`);
			}
			return await fileRes.json();
		}
	});
	const fileId = filePayload.name ?? filePayload.file?.name;
	if (!fileId) throw new Error("gemini batch file upload failed: missing file id");
	const batchBody = { batch: {
		displayName: `memory-embeddings-${params.agentId}`,
		inputConfig: { file_name: fileId }
	} };
	const batchEndpoint = `${baseUrl}/${params.gemini.modelPath}:asyncBatchEmbedContent`;
	debugEmbeddingsLog("memory embeddings: gemini batch create", {
		batchEndpoint,
		fileId
	});
	return await withRemoteHttpResponse({
		url: batchEndpoint,
		ssrfPolicy: params.gemini.ssrfPolicy,
		init: {
			method: "POST",
			headers: buildBatchHeaders(params.gemini, { json: true }),
			body: JSON.stringify(batchBody)
		},
		onResponse: async (batchRes) => {
			if (batchRes.ok) return await batchRes.json();
			const text = await batchRes.text();
			if (batchRes.status === 404) throw new Error("gemini batch create failed: 404 (asyncBatchEmbedContent not available for this model/baseUrl). Disable remote.batch.enabled or switch providers.");
			throw new Error(`gemini batch create failed: ${batchRes.status} ${text}`);
		}
	});
}
async function fetchGeminiBatchStatus(params) {
	const statusUrl = `${normalizeBatchBaseUrl(params.gemini)}/${params.batchName.startsWith("batches/") ? params.batchName : `batches/${params.batchName}`}`;
	debugEmbeddingsLog("memory embeddings: gemini batch status", { statusUrl });
	return await withRemoteHttpResponse({
		url: statusUrl,
		ssrfPolicy: params.gemini.ssrfPolicy,
		init: { headers: buildBatchHeaders(params.gemini, { json: true }) },
		onResponse: async (res) => {
			if (!res.ok) {
				const text = await res.text();
				throw new Error(`gemini batch status failed: ${res.status} ${text}`);
			}
			return await res.json();
		}
	});
}
async function fetchGeminiFileContent(params) {
	const downloadUrl = `${normalizeBatchBaseUrl(params.gemini)}/${params.fileId.startsWith("files/") ? params.fileId : `files/${params.fileId}`}:download`;
	debugEmbeddingsLog("memory embeddings: gemini batch download", { downloadUrl });
	return await withRemoteHttpResponse({
		url: downloadUrl,
		ssrfPolicy: params.gemini.ssrfPolicy,
		init: { headers: buildBatchHeaders(params.gemini, { json: true }) },
		onResponse: async (res) => {
			if (!res.ok) {
				const text = await res.text();
				throw new Error(`gemini batch file content failed: ${res.status} ${text}`);
			}
			return await res.text();
		}
	});
}
function parseGeminiBatchOutput(text) {
	if (!text.trim()) return [];
	return text.split("\n").map((line) => line.trim()).filter(Boolean).map((line) => JSON.parse(line));
}
async function waitForGeminiBatch(params) {
	const start = Date.now();
	let current = params.initial;
	while (true) {
		const status = current ?? await fetchGeminiBatchStatus({
			gemini: params.gemini,
			batchName: params.batchName
		});
		const state = status.state ?? "UNKNOWN";
		if ([
			"SUCCEEDED",
			"COMPLETED",
			"DONE"
		].includes(state)) {
			const outputFileId = status.outputConfig?.file ?? status.outputConfig?.fileId ?? status.metadata?.output?.responsesFile;
			if (!outputFileId) throw new Error(`gemini batch ${params.batchName} completed without output file`);
			return { outputFileId };
		}
		if ([
			"FAILED",
			"CANCELLED",
			"CANCELED",
			"EXPIRED"
		].includes(state)) {
			const message = status.error?.message ?? "unknown error";
			throw new Error(`gemini batch ${params.batchName} ${state}: ${message}`);
		}
		if (!params.wait) throw new Error(`gemini batch ${params.batchName} still ${state}; wait disabled`);
		if (Date.now() - start > params.timeoutMs) throw new Error(`gemini batch ${params.batchName} timed out after ${params.timeoutMs}ms`);
		params.debug?.(`gemini batch ${params.batchName} ${state}; waiting ${params.pollIntervalMs}ms`);
		await new Promise((resolve) => setTimeout(resolve, params.pollIntervalMs));
		current = void 0;
	}
}
async function runGeminiEmbeddingBatches(params) {
	return await runEmbeddingBatchGroups({
		...buildEmbeddingBatchGroupOptions(params, {
			maxRequests: GEMINI_BATCH_MAX_REQUESTS,
			debugLabel: "memory embeddings: gemini batch submit"
		}),
		runGroup: async ({ group, groupIndex, groups, byCustomId }) => {
			const batchInfo = await submitGeminiBatch({
				gemini: params.gemini,
				requests: group,
				agentId: params.agentId
			});
			const batchName = batchInfo.name ?? "";
			if (!batchName) throw new Error("gemini batch create failed: missing batch name");
			params.debug?.("memory embeddings: gemini batch created", {
				batchName,
				state: batchInfo.state,
				group: groupIndex + 1,
				groups,
				requests: group.length
			});
			if (!params.wait && batchInfo.state && ![
				"SUCCEEDED",
				"COMPLETED",
				"DONE"
			].includes(batchInfo.state)) throw new Error(`gemini batch ${batchName} submitted; enable remote.batch.wait to await completion`);
			const completed = batchInfo.state && [
				"SUCCEEDED",
				"COMPLETED",
				"DONE"
			].includes(batchInfo.state) ? { outputFileId: batchInfo.outputConfig?.file ?? batchInfo.outputConfig?.fileId ?? batchInfo.metadata?.output?.responsesFile ?? "" } : await waitForGeminiBatch({
				gemini: params.gemini,
				batchName,
				wait: params.wait,
				pollIntervalMs: params.pollIntervalMs,
				timeoutMs: params.timeoutMs,
				debug: params.debug,
				initial: batchInfo
			});
			if (!completed.outputFileId) throw new Error(`gemini batch ${batchName} completed without output file`);
			const outputLines = parseGeminiBatchOutput(await fetchGeminiFileContent({
				gemini: params.gemini,
				fileId: completed.outputFileId
			}));
			const errors = [];
			const remaining = new Set(group.map((request) => request.custom_id));
			for (const line of outputLines) {
				const customId = line.key ?? line.custom_id ?? line.request_id;
				if (!customId) continue;
				remaining.delete(customId);
				if (line.error?.message) {
					errors.push(`${customId}: ${line.error.message}`);
					continue;
				}
				if (line.response?.error?.message) {
					errors.push(`${customId}: ${line.response.error.message}`);
					continue;
				}
				const embedding = sanitizeAndNormalizeEmbedding(line.embedding?.values ?? line.response?.embedding?.values ?? []);
				if (embedding.length === 0) {
					errors.push(`${customId}: empty embedding`);
					continue;
				}
				byCustomId.set(customId, embedding);
			}
			if (errors.length > 0) throw new Error(`gemini batch ${batchName} failed: ${errors.join("; ")}`);
			if (remaining.size > 0) throw new Error(`gemini batch ${batchName} missing ${remaining.size} embedding responses`);
		}
	});
}
//#endregion
//#region src/memory-host-sdk/host/batch-error-utils.ts
function getResponseErrorMessage(line) {
	const body = line?.response?.body;
	if (typeof body === "string") return body || void 0;
	if (!body || typeof body !== "object") return;
	return typeof body.error?.message === "string" ? body.error.message : void 0;
}
function extractBatchErrorMessage(lines) {
	const first = lines.find((line) => line.error?.message || getResponseErrorMessage(line));
	return first?.error?.message ?? getResponseErrorMessage(first);
}
function formatUnavailableBatchError(err) {
	const message = formatErrorMessage(err);
	return message ? `error file unavailable: ${message}` : void 0;
}
//#endregion
//#region src/memory-host-sdk/host/batch-http.ts
async function postJsonWithRetry(params) {
	return await retryAsync(async () => {
		return await postJson({
			url: params.url,
			headers: params.headers,
			ssrfPolicy: params.ssrfPolicy,
			fetchImpl: params.fetchImpl,
			body: params.body,
			errorPrefix: params.errorPrefix,
			attachStatus: true,
			parse: async (payload) => payload
		});
	}, {
		attempts: 3,
		minDelayMs: 300,
		maxDelayMs: 2e3,
		jitter: .2,
		shouldRetry: (err) => {
			const status = err.status;
			return status === 429 || typeof status === "number" && status >= 500;
		}
	});
}
//#endregion
//#region src/memory-host-sdk/host/batch-output.ts
function applyEmbeddingBatchOutputLine(params) {
	const customId = params.line.custom_id;
	if (!customId) return;
	params.remaining.delete(customId);
	const errorMessage = params.line.error?.message;
	if (errorMessage) {
		params.errors.push(`${customId}: ${errorMessage}`);
		return;
	}
	const response = params.line.response;
	if ((response?.status_code ?? 0) >= 400) {
		const messageFromObject = response?.body && typeof response.body === "object" ? response.body.error?.message : void 0;
		const messageFromString = typeof response?.body === "string" ? response.body : void 0;
		params.errors.push(`${customId}: ${messageFromObject ?? messageFromString ?? "unknown error"}`);
		return;
	}
	const embedding = (response?.body && typeof response.body === "object" ? response.body.data ?? [] : [])[0]?.embedding ?? [];
	if (embedding.length === 0) {
		params.errors.push(`${customId}: empty embedding`);
		return;
	}
	params.byCustomId.set(customId, embedding);
}
//#endregion
//#region src/memory-host-sdk/host/batch-status.ts
const TERMINAL_FAILURE_STATES = new Set([
	"failed",
	"expired",
	"cancelled",
	"canceled"
]);
function resolveBatchCompletionFromStatus(params) {
	if (!params.status.output_file_id) throw new Error(`${params.provider} batch ${params.batchId} completed without output file`);
	return {
		outputFileId: params.status.output_file_id,
		errorFileId: params.status.error_file_id ?? void 0
	};
}
async function throwIfBatchTerminalFailure(params) {
	const state = params.status.status ?? "unknown";
	if (!TERMINAL_FAILURE_STATES.has(state)) return;
	const detail = params.status.error_file_id ? await params.readError(params.status.error_file_id) : void 0;
	const suffix = detail ? `: ${detail}` : "";
	throw new Error(`${params.provider} batch ${params.status.id ?? "<unknown>"} ${state}${suffix}`);
}
async function resolveCompletedBatchResult(params) {
	const batchId = params.status.id ?? "<unknown>";
	if (!params.wait && params.status.status !== "completed") throw new Error(`${params.provider} batch ${batchId} submitted; enable remote.batch.wait to await completion`);
	const completed = params.status.status === "completed" ? resolveBatchCompletionFromStatus({
		provider: params.provider,
		batchId,
		status: params.status
	}) : await params.waitForBatch();
	if (!completed.outputFileId) throw new Error(`${params.provider} batch ${batchId} completed without output file`);
	return completed;
}
//#endregion
//#region src/memory-host-sdk/host/batch-provider-common.ts
const EMBEDDING_BATCH_ENDPOINT = "/v1/embeddings";
//#endregion
//#region src/memory-host-sdk/host/batch-upload.ts
async function uploadBatchJsonlFile(params) {
	const baseUrl = normalizeBatchBaseUrl(params.client);
	const jsonl = params.requests.map((request) => JSON.stringify(request)).join("\n");
	const form = new FormData();
	form.append("purpose", "batch");
	form.append("file", new Blob([jsonl], { type: "application/jsonl" }), `memory-embeddings.${hashText(String(Date.now()))}.jsonl`);
	const filePayload = await withRemoteHttpResponse({
		url: `${baseUrl}/files`,
		ssrfPolicy: params.client.ssrfPolicy,
		fetchImpl: params.client.fetchImpl,
		init: {
			method: "POST",
			headers: buildBatchHeaders(params.client, { json: false }),
			body: form
		},
		onResponse: async (fileRes) => {
			if (!fileRes.ok) {
				const text = await fileRes.text();
				throw new Error(`${params.errorPrefix}: ${fileRes.status} ${text}`);
			}
			return await fileRes.json();
		}
	});
	if (!filePayload.id) throw new Error(`${params.errorPrefix}: missing file id`);
	return filePayload.id;
}
//#endregion
//#region src/memory-host-sdk/host/batch-openai.ts
const OPENAI_BATCH_ENDPOINT = EMBEDDING_BATCH_ENDPOINT;
const OPENAI_BATCH_COMPLETION_WINDOW = "24h";
const OPENAI_BATCH_MAX_REQUESTS = 5e4;
async function submitOpenAiBatch(params) {
	const baseUrl = normalizeBatchBaseUrl(params.openAi);
	const inputFileId = await uploadBatchJsonlFile({
		client: params.openAi,
		requests: params.requests,
		errorPrefix: "openai batch file upload failed"
	});
	return await postJsonWithRetry({
		url: `${baseUrl}/batches`,
		headers: buildBatchHeaders(params.openAi, { json: true }),
		ssrfPolicy: params.openAi.ssrfPolicy,
		fetchImpl: params.openAi.fetchImpl,
		body: {
			input_file_id: inputFileId,
			endpoint: OPENAI_BATCH_ENDPOINT,
			completion_window: OPENAI_BATCH_COMPLETION_WINDOW,
			metadata: {
				source: "openclaw-memory",
				agent: params.agentId
			}
		},
		errorPrefix: "openai batch create failed"
	});
}
async function fetchOpenAiBatchStatus(params) {
	return await fetchOpenAiBatchResource({
		openAi: params.openAi,
		path: `/batches/${params.batchId}`,
		errorPrefix: "openai batch status",
		parse: async (res) => await res.json()
	});
}
async function fetchOpenAiFileContent(params) {
	return await fetchOpenAiBatchResource({
		openAi: params.openAi,
		path: `/files/${params.fileId}/content`,
		errorPrefix: "openai batch file content",
		parse: async (res) => await res.text()
	});
}
async function fetchOpenAiBatchResource(params) {
	return await withRemoteHttpResponse({
		url: `${normalizeBatchBaseUrl(params.openAi)}${params.path}`,
		ssrfPolicy: params.openAi.ssrfPolicy,
		fetchImpl: params.openAi.fetchImpl,
		init: { headers: buildBatchHeaders(params.openAi, { json: true }) },
		onResponse: async (res) => {
			if (!res.ok) {
				const text = await res.text();
				throw new Error(`${params.errorPrefix} failed: ${res.status} ${text}`);
			}
			return await params.parse(res);
		}
	});
}
function parseOpenAiBatchOutput(text) {
	if (!text.trim()) return [];
	return text.split("\n").map((line) => line.trim()).filter(Boolean).map((line) => JSON.parse(line));
}
async function readOpenAiBatchError(params) {
	try {
		return extractBatchErrorMessage(parseOpenAiBatchOutput(await fetchOpenAiFileContent({
			openAi: params.openAi,
			fileId: params.errorFileId
		})));
	} catch (err) {
		return formatUnavailableBatchError(err);
	}
}
async function waitForOpenAiBatch(params) {
	const start = Date.now();
	let current = params.initial;
	while (true) {
		const status = current ?? await fetchOpenAiBatchStatus({
			openAi: params.openAi,
			batchId: params.batchId
		});
		const state = status.status ?? "unknown";
		if (state === "completed") return resolveBatchCompletionFromStatus({
			provider: "openai",
			batchId: params.batchId,
			status
		});
		await throwIfBatchTerminalFailure({
			provider: "openai",
			status: {
				...status,
				id: params.batchId
			},
			readError: async (errorFileId) => await readOpenAiBatchError({
				openAi: params.openAi,
				errorFileId
			})
		});
		if (!params.wait) throw new Error(`openai batch ${params.batchId} still ${state}; wait disabled`);
		if (Date.now() - start > params.timeoutMs) throw new Error(`openai batch ${params.batchId} timed out after ${params.timeoutMs}ms`);
		params.debug?.(`openai batch ${params.batchId} ${state}; waiting ${params.pollIntervalMs}ms`);
		await new Promise((resolve) => setTimeout(resolve, params.pollIntervalMs));
		current = void 0;
	}
}
async function runOpenAiEmbeddingBatches(params) {
	return await runEmbeddingBatchGroups({
		...buildEmbeddingBatchGroupOptions(params, {
			maxRequests: OPENAI_BATCH_MAX_REQUESTS,
			debugLabel: "memory embeddings: openai batch submit"
		}),
		runGroup: async ({ group, groupIndex, groups, byCustomId }) => {
			const batchInfo = await submitOpenAiBatch({
				openAi: params.openAi,
				requests: group,
				agentId: params.agentId
			});
			if (!batchInfo.id) throw new Error("openai batch create failed: missing batch id");
			const batchId = batchInfo.id;
			params.debug?.("memory embeddings: openai batch created", {
				batchId: batchInfo.id,
				status: batchInfo.status,
				group: groupIndex + 1,
				groups,
				requests: group.length
			});
			const completed = await resolveCompletedBatchResult({
				provider: "openai",
				status: batchInfo,
				wait: params.wait,
				waitForBatch: async () => await waitForOpenAiBatch({
					openAi: params.openAi,
					batchId,
					wait: params.wait,
					pollIntervalMs: params.pollIntervalMs,
					timeoutMs: params.timeoutMs,
					debug: params.debug,
					initial: batchInfo
				})
			});
			const outputLines = parseOpenAiBatchOutput(await fetchOpenAiFileContent({
				openAi: params.openAi,
				fileId: completed.outputFileId
			}));
			const errors = [];
			const remaining = new Set(group.map((request) => request.custom_id));
			for (const line of outputLines) applyEmbeddingBatchOutputLine({
				line,
				remaining,
				errors,
				byCustomId
			});
			if (errors.length > 0) throw new Error(`openai batch ${batchInfo.id} failed: ${errors.join("; ")}`);
			if (remaining.size > 0) throw new Error(`openai batch ${batchInfo.id} missing ${remaining.size} embedding responses`);
		}
	});
}
//#endregion
//#region src/memory-host-sdk/host/batch-voyage.ts
const VOYAGE_BATCH_ENDPOINT = EMBEDDING_BATCH_ENDPOINT;
const VOYAGE_BATCH_COMPLETION_WINDOW = "12h";
const VOYAGE_BATCH_MAX_REQUESTS = 5e4;
function resolveVoyageBatchDeps(overrides) {
	return {
		now: overrides?.now ?? Date.now,
		sleep: overrides?.sleep ?? (async (ms) => await new Promise((resolve) => setTimeout(resolve, ms))),
		postJsonWithRetry: overrides?.postJsonWithRetry ?? postJsonWithRetry,
		uploadBatchJsonlFile: overrides?.uploadBatchJsonlFile ?? uploadBatchJsonlFile,
		withRemoteHttpResponse: overrides?.withRemoteHttpResponse ?? withRemoteHttpResponse
	};
}
async function assertVoyageResponseOk(res, context) {
	if (!res.ok) {
		const text = await res.text();
		throw new Error(`${context}: ${res.status} ${text}`);
	}
}
function buildVoyageBatchRequest(params) {
	return {
		url: `${normalizeBatchBaseUrl(params.client)}/${params.path}`,
		ssrfPolicy: params.client.ssrfPolicy,
		init: { headers: buildBatchHeaders(params.client, { json: true }) },
		onResponse: params.onResponse
	};
}
async function submitVoyageBatch(params) {
	const baseUrl = normalizeBatchBaseUrl(params.client);
	const inputFileId = await params.deps.uploadBatchJsonlFile({
		client: params.client,
		requests: params.requests,
		errorPrefix: "voyage batch file upload failed"
	});
	return await params.deps.postJsonWithRetry({
		url: `${baseUrl}/batches`,
		headers: buildBatchHeaders(params.client, { json: true }),
		ssrfPolicy: params.client.ssrfPolicy,
		body: {
			input_file_id: inputFileId,
			endpoint: VOYAGE_BATCH_ENDPOINT,
			completion_window: VOYAGE_BATCH_COMPLETION_WINDOW,
			request_params: {
				model: params.client.model,
				input_type: "document"
			},
			metadata: {
				source: "clawdbot-memory",
				agent: params.agentId
			}
		},
		errorPrefix: "voyage batch create failed"
	});
}
async function fetchVoyageBatchStatus(params) {
	return await params.deps.withRemoteHttpResponse(buildVoyageBatchRequest({
		client: params.client,
		path: `batches/${params.batchId}`,
		onResponse: async (res) => {
			await assertVoyageResponseOk(res, "voyage batch status failed");
			return await res.json();
		}
	}));
}
async function readVoyageBatchError(params) {
	try {
		return await params.deps.withRemoteHttpResponse(buildVoyageBatchRequest({
			client: params.client,
			path: `files/${params.errorFileId}/content`,
			onResponse: async (res) => {
				await assertVoyageResponseOk(res, "voyage batch error file content failed");
				const text = await res.text();
				if (!text.trim()) return;
				return extractBatchErrorMessage(text.split("\n").map((line) => line.trim()).filter(Boolean).map((line) => JSON.parse(line)));
			}
		}));
	} catch (err) {
		return formatUnavailableBatchError(err);
	}
}
async function waitForVoyageBatch(params) {
	const start = params.deps.now();
	let current = params.initial;
	while (true) {
		const status = current ?? await fetchVoyageBatchStatus({
			client: params.client,
			batchId: params.batchId,
			deps: params.deps
		});
		const state = status.status ?? "unknown";
		if (state === "completed") return resolveBatchCompletionFromStatus({
			provider: "voyage",
			batchId: params.batchId,
			status
		});
		await throwIfBatchTerminalFailure({
			provider: "voyage",
			status: {
				...status,
				id: params.batchId
			},
			readError: async (errorFileId) => await readVoyageBatchError({
				client: params.client,
				errorFileId,
				deps: params.deps
			})
		});
		if (!params.wait) throw new Error(`voyage batch ${params.batchId} still ${state}; wait disabled`);
		if (params.deps.now() - start > params.timeoutMs) throw new Error(`voyage batch ${params.batchId} timed out after ${params.timeoutMs}ms`);
		params.debug?.(`voyage batch ${params.batchId} ${state}; waiting ${params.pollIntervalMs}ms`);
		await params.deps.sleep(params.pollIntervalMs);
		current = void 0;
	}
}
async function runVoyageEmbeddingBatches(params) {
	const deps = resolveVoyageBatchDeps(params.deps);
	return await runEmbeddingBatchGroups({
		...buildEmbeddingBatchGroupOptions(params, {
			maxRequests: VOYAGE_BATCH_MAX_REQUESTS,
			debugLabel: "memory embeddings: voyage batch submit"
		}),
		runGroup: async ({ group, groupIndex, groups, byCustomId }) => {
			const batchInfo = await submitVoyageBatch({
				client: params.client,
				requests: group,
				agentId: params.agentId,
				deps
			});
			if (!batchInfo.id) throw new Error("voyage batch create failed: missing batch id");
			const batchId = batchInfo.id;
			params.debug?.("memory embeddings: voyage batch created", {
				batchId: batchInfo.id,
				status: batchInfo.status,
				group: groupIndex + 1,
				groups,
				requests: group.length
			});
			const completed = await resolveCompletedBatchResult({
				provider: "voyage",
				status: batchInfo,
				wait: params.wait,
				waitForBatch: async () => await waitForVoyageBatch({
					client: params.client,
					batchId,
					wait: params.wait,
					pollIntervalMs: params.pollIntervalMs,
					timeoutMs: params.timeoutMs,
					debug: params.debug,
					initial: batchInfo,
					deps
				})
			});
			const baseUrl = normalizeBatchBaseUrl(params.client);
			const errors = [];
			const remaining = new Set(group.map((request) => request.custom_id));
			await deps.withRemoteHttpResponse({
				url: `${baseUrl}/files/${completed.outputFileId}/content`,
				ssrfPolicy: params.client.ssrfPolicy,
				init: { headers: buildBatchHeaders(params.client, { json: true }) },
				onResponse: async (contentRes) => {
					if (!contentRes.ok) {
						const text = await contentRes.text();
						throw new Error(`voyage batch file content failed: ${contentRes.status} ${text}`);
					}
					if (!contentRes.body) return;
					const reader = createInterface({
						input: Readable.fromWeb(contentRes.body),
						terminal: false
					});
					for await (const rawLine of reader) {
						if (!rawLine.trim()) continue;
						applyEmbeddingBatchOutputLine({
							line: JSON.parse(rawLine),
							remaining,
							errors,
							byCustomId
						});
					}
				}
			});
			if (errors.length > 0) throw new Error(`voyage batch ${batchInfo.id} failed: ${errors.join("; ")}`);
			if (remaining.size > 0) throw new Error(`voyage batch ${batchInfo.id} missing ${remaining.size} embedding responses`);
		}
	});
}
//#endregion
//#region src/memory-host-sdk/host/embedding-model-limits.ts
const DEFAULT_EMBEDDING_MAX_INPUT_TOKENS = 8192;
const DEFAULT_LOCAL_EMBEDDING_MAX_INPUT_TOKENS = 2048;
const KNOWN_EMBEDDING_MAX_INPUT_TOKENS = {
	"openai:text-embedding-3-small": 8192,
	"openai:text-embedding-3-large": 8192,
	"openai:text-embedding-ada-002": 8191,
	"gemini:text-embedding-004": 2048,
	"gemini:gemini-embedding-001": 2048,
	"gemini:gemini-embedding-2-preview": 8192,
	"voyage:voyage-3": 32e3,
	"voyage:voyage-3-lite": 16e3,
	"voyage:voyage-code-3": 32e3
};
function resolveEmbeddingMaxInputTokens(provider) {
	if (typeof provider.maxInputTokens === "number") return provider.maxInputTokens;
	const known = KNOWN_EMBEDDING_MAX_INPUT_TOKENS[normalizeLowercaseStringOrEmpty(`${provider.id}:${provider.model}`)];
	if (typeof known === "number") return known;
	if (normalizeLowercaseStringOrEmpty(provider.id) === "gemini") return 2048;
	if (normalizeLowercaseStringOrEmpty(provider.id) === "local") return DEFAULT_LOCAL_EMBEDDING_MAX_INPUT_TOKENS;
	return DEFAULT_EMBEDDING_MAX_INPUT_TOKENS;
}
//#endregion
//#region src/memory-host-sdk/host/embedding-chunk-limits.ts
function enforceEmbeddingMaxInputTokens(provider, chunks, hardMaxInputTokens) {
	const providerMaxInputTokens = resolveEmbeddingMaxInputTokens(provider);
	const maxInputTokens = typeof hardMaxInputTokens === "number" && hardMaxInputTokens > 0 ? Math.min(providerMaxInputTokens, hardMaxInputTokens) : providerMaxInputTokens;
	const out = [];
	for (const chunk of chunks) {
		if (hasNonTextEmbeddingParts(chunk.embeddingInput)) {
			out.push(chunk);
			continue;
		}
		if (estimateUtf8Bytes(chunk.text) <= maxInputTokens) {
			out.push(chunk);
			continue;
		}
		for (const text of splitTextToUtf8ByteLimit(chunk.text, maxInputTokens)) out.push({
			startLine: chunk.startLine,
			endLine: chunk.endLine,
			text,
			hash: hashText(text),
			embeddingInput: { text }
		});
	}
	return out;
}
//#endregion
export { DEFAULT_GEMINI_EMBEDDING_MODEL as _, runGeminiEmbeddingBatches as a, createLocalEmbeddingProvider as c, DEFAULT_OPENAI_EMBEDDING_MODEL as d, createOpenAiEmbeddingProvider as f, createLmstudioEmbeddingProvider as g, DEFAULT_LMSTUDIO_EMBEDDING_MODEL as h, runOpenAiEmbeddingBatches as i, DEFAULT_VOYAGE_EMBEDDING_MODEL as l, createMistralEmbeddingProvider as m, runVoyageEmbeddingBatches as n, createGitHubCopilotEmbeddingProvider as o, DEFAULT_MISTRAL_EMBEDDING_MODEL as p, OPENAI_BATCH_ENDPOINT as r, DEFAULT_LOCAL_MODEL as s, enforceEmbeddingMaxInputTokens as t, createVoyageEmbeddingProvider as u, buildGeminiEmbeddingRequest as v, createGeminiEmbeddingProvider as y };
