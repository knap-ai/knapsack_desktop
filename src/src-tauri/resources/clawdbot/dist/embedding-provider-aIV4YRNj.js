import { r as formatErrorMessage } from "./errors-Bs2h5H8p.js";
import { a as hasConfiguredSecretInput, c as normalizeResolvedSecretInputString } from "./types.secrets-DTXJhyWe.js";
import { t as normalizeOptionalSecretInput } from "./normalize-secret-input-CRNbANMO.js";
import { t as resolveEnvApiKey } from "./model-auth-env-Cr_twdPk.js";
import { n as fetchWithSsrFGuard } from "./fetch-guard-Lvq2pw52.js";
import "./secret-input-C8U7qpTM.js";
import "./ssrf-runtime-BoGiIhjZ.js";
import "./provider-auth-rTeK2_Yu.js";
import "./provider-auth-runtime-CDNd-efP.js";
import { x as resolveOllamaApiBase } from "./stream-BaEFj2FR.js";
//#region extensions/ollama/src/embedding-provider.ts
const DEFAULT_OLLAMA_EMBEDDING_MODEL = "nomic-embed-text";
function sanitizeAndNormalizeEmbedding(vec) {
	const sanitized = vec.map((value) => Number.isFinite(value) ? value : 0);
	const magnitude = Math.sqrt(sanitized.reduce((sum, value) => sum + value * value, 0));
	if (magnitude < 1e-10) return sanitized;
	return sanitized.map((value) => value / magnitude);
}
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
		init: params.init,
		policy: params.ssrfPolicy,
		auditContext: "memory-remote"
	});
	try {
		return await params.onResponse(response);
	} finally {
		await release();
	}
}
function normalizeEmbeddingModel(model) {
	const trimmed = model.trim();
	if (!trimmed) return DEFAULT_OLLAMA_EMBEDDING_MODEL;
	return trimmed.startsWith("ollama/") ? trimmed.slice(7) : trimmed;
}
function resolveMemorySecretInputString(params) {
	if (!hasConfiguredSecretInput(params.value)) return;
	return normalizeResolvedSecretInputString({
		value: params.value,
		path: params.path
	});
}
function resolveOllamaApiKey(options) {
	const remoteApiKey = resolveMemorySecretInputString({
		value: options.remote?.apiKey,
		path: "agents.*.memorySearch.remote.apiKey"
	});
	if (remoteApiKey) return remoteApiKey;
	const providerApiKey = normalizeOptionalSecretInput(options.config.models?.providers?.ollama?.apiKey);
	if (providerApiKey) return providerApiKey;
	return resolveEnvApiKey("ollama")?.apiKey;
}
function resolveOllamaEmbeddingClient(options) {
	const providerConfig = options.config.models?.providers?.ollama;
	const baseUrl = resolveOllamaApiBase(options.remote?.baseUrl?.trim() || providerConfig?.baseUrl?.trim());
	const model = normalizeEmbeddingModel(options.model);
	const headerOverrides = Object.assign({}, providerConfig?.headers, options.remote?.headers);
	const headers = {
		"Content-Type": "application/json",
		...headerOverrides
	};
	const apiKey = resolveOllamaApiKey(options);
	if (apiKey) headers.Authorization = `Bearer ${apiKey}`;
	return {
		baseUrl,
		headers,
		ssrfPolicy: buildRemoteBaseUrlPolicy(baseUrl),
		model
	};
}
async function createOllamaEmbeddingProvider(options) {
	const client = resolveOllamaEmbeddingClient(options);
	const embedUrl = `${client.baseUrl.replace(/\/$/, "")}/api/embeddings`;
	const embedOne = async (text) => {
		const json = await withRemoteHttpResponse({
			url: embedUrl,
			ssrfPolicy: client.ssrfPolicy,
			init: {
				method: "POST",
				headers: client.headers,
				body: JSON.stringify({
					model: client.model,
					prompt: text
				})
			},
			onResponse: async (response) => {
				if (!response.ok) throw new Error(`Ollama embeddings HTTP ${response.status}: ${await response.text()}`);
				return await response.json();
			}
		});
		if (!Array.isArray(json.embedding)) throw new Error("Ollama embeddings response missing embedding[]");
		return sanitizeAndNormalizeEmbedding(json.embedding);
	};
	const provider = {
		id: "ollama",
		model: client.model,
		embedQuery: embedOne,
		embedBatch: async (texts) => {
			return await Promise.all(texts.map(embedOne));
		}
	};
	return {
		provider,
		client: {
			...client,
			embedBatch: async (texts) => {
				try {
					return await provider.embedBatch(texts);
				} catch (err) {
					throw new Error(formatErrorMessage(err), { cause: err });
				}
			}
		}
	};
}
//#endregion
export { createOllamaEmbeddingProvider as n, DEFAULT_OLLAMA_EMBEDDING_MODEL as t };
