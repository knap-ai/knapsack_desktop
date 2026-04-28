import { a as normalizeLowercaseStringOrEmpty, c as normalizeOptionalString } from "./string-coerce-Bje8XVt9.js";
import { i as formatErrorMessage } from "./errors-CDFVCV9D.js";
import { t as isTruthyEnvValue } from "./env-BAymvSVL.js";
import { t as createSubsystemLogger } from "./subsystem-rHhUC6qs.js";
import { t as runTasksWithConcurrency } from "./run-with-concurrency-CBZG2z70.js";
import { t as requireApiKey } from "./model-auth-runtime-shared-BQozaooK.js";
import { _ as ssrfPolicyFromHttpBaseUrlAllowedHostname } from "./ssrf-K8pX0Zi6.js";
import { c as shouldUseEnvHttpProxyForUrl } from "./proxy-env-Cf07R3q5.js";
import { n as fetchWithSsrFGuard, t as GUARDED_FETCH_MODE } from "./fetch-guard-8smVA_M-.js";
import { s as resolveApiKeyForProvider } from "./model-auth-Bic7ggHC.js";
import { n as retryAsync } from "./retry-DH0sbtC7.js";
import { a as splitTextToUtf8ByteLimit, i as estimateUtf8Bytes, n as hasNonTextEmbeddingParts } from "./embedding-inputs-CGmwR8sj.js";
import { t as hashText } from "./hash-DyKb70k4.js";
import "./memory-embedding-provider-runtime-CGzU3_BQ.js";
import "./embedding-defaults-CzZYsOZF.js";
import { n as resolveMemorySecretInputString } from "./secret-input-CT0j8Xr6.js";
//#region src/memory-host-sdk/host/embedding-vectors.ts
function sanitizeAndNormalizeEmbedding(vec) {
	const sanitized = vec.map((value) => Number.isFinite(value) ? value : 0);
	const magnitude = Math.sqrt(sanitized.reduce((sum, value) => sum + value * value, 0));
	if (magnitude < 1e-10) return sanitized;
	return sanitized.map((value) => value / magnitude);
}
//#endregion
//#region src/memory-host-sdk/host/node-llama.ts
const NODE_LLAMA_CPP_MODULE = "node-llama-cpp";
async function importNodeLlamaCpp() {
	return import(NODE_LLAMA_CPP_MODULE);
}
//#endregion
//#region src/memory-host-sdk/host/embeddings.ts
async function createLocalEmbeddingProvider(options) {
	const modelPath = normalizeOptionalString(options.local?.modelPath) || "hf:ggml-org/embeddinggemma-300m-qat-q8_0-GGUF/embeddinggemma-300m-qat-Q8_0.gguf";
	const modelCacheDir = normalizeOptionalString(options.local?.modelCacheDir);
	const contextSize = options.local?.contextSize ?? 4096;
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
				if (!embeddingContext) embeddingContext = await embeddingModel.createEmbeddingContext({ contextSize });
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
//#region src/memory-host-sdk/host/remote-http.ts
const buildRemoteBaseUrlPolicy = ssrfPolicyFromHttpBaseUrlAllowedHostname;
async function withRemoteHttpResponse(params) {
	const { response, release } = await fetchWithSsrFGuard({
		url: params.url,
		fetchImpl: params.fetchImpl,
		init: params.init,
		policy: params.ssrfPolicy,
		auditContext: params.auditContext ?? "memory-remote",
		...shouldUseEnvHttpProxyForUrl(params.url) ? { mode: GUARDED_FETCH_MODE.TRUSTED_ENV_PROXY } : {}
	});
	try {
		return await params.onResponse(response);
	} finally {
		await release();
	}
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
//#region src/memory-host-sdk/host/batch-provider-common.ts
const EMBEDDING_BATCH_ENDPOINT = "/v1/embeddings";
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
	const { firstError, hasError } = await runTasksWithConcurrency({
		tasks,
		limit: params.concurrency,
		errorMode: "stop"
	});
	if (hasError) throw firstError;
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
//#region src/memory-host-sdk/host/embedding-model-limits.ts
const DEFAULT_EMBEDDING_MAX_INPUT_TOKENS = 8192;
const DEFAULT_LOCAL_EMBEDDING_MAX_INPUT_TOKENS = 2048;
function resolveEmbeddingMaxInputTokens(provider) {
	if (typeof provider.maxInputTokens === "number") return provider.maxInputTokens;
	if (provider.id === "local") return DEFAULT_LOCAL_EMBEDDING_MAX_INPUT_TOKENS;
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
//#region src/memory-host-sdk/host/embedding-provider-adapter-utils.ts
function isMissingEmbeddingApiKeyError(err) {
	return err instanceof Error && err.message.includes("No API key found for provider");
}
function sanitizeEmbeddingCacheHeaders(headers, excludedHeaderNames) {
	const excluded = new Set(excludedHeaderNames.map((name) => normalizeLowercaseStringOrEmpty(name)));
	return Object.entries(headers).filter(([key]) => !excluded.has(normalizeLowercaseStringOrEmpty(key))).toSorted(([a], [b]) => a.localeCompare(b)).map(([key, value]) => [key, value]);
}
function mapBatchEmbeddingsByIndex(byCustomId, count) {
	const embeddings = [];
	for (let index = 0; index < count; index += 1) embeddings.push(byCustomId.get(String(index)) ?? []);
	return embeddings;
}
//#endregion
//#region src/memory-host-sdk/host/embeddings-debug.ts
const debugEmbeddings = isTruthyEnvValue(process.env.OPENCLAW_DEBUG_MEMORY_EMBEDDINGS);
const log = createSubsystemLogger("memory/embeddings");
function debugEmbeddingsLog(message, meta) {
	if (!debugEmbeddings) return;
	const suffix = meta ? ` ${JSON.stringify(meta)}` : "";
	log.raw(`${message}${suffix}`);
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
export { withRemoteHttpResponse as C, sanitizeAndNormalizeEmbedding as D, createLocalEmbeddingProvider as E, buildRemoteBaseUrlPolicy as S, formatUnavailableBatchError as T, buildBatchHeaders as _, normalizeEmbeddingModelWithPrefixes as a, applyEmbeddingBatchOutputLine as b, mapBatchEmbeddingsByIndex as c, uploadBatchJsonlFile as d, resolveBatchCompletionFromStatus as f, runEmbeddingBatchGroups as g, buildEmbeddingBatchGroupOptions as h, resolveRemoteEmbeddingBearerClient as i, sanitizeEmbeddingCacheHeaders as l, throwIfBatchTerminalFailure as m, resolveRemoteEmbeddingClient as n, debugEmbeddingsLog as o, resolveCompletedBatchResult as p, fetchRemoteEmbeddingVectors as r, isMissingEmbeddingApiKeyError as s, createRemoteEmbeddingProvider as t, enforceEmbeddingMaxInputTokens as u, normalizeBatchBaseUrl as v, extractBatchErrorMessage as w, postJsonWithRetry as x, EMBEDDING_BATCH_ENDPOINT as y };
