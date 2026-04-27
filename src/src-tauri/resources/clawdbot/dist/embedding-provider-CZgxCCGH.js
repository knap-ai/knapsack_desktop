import { a as normalizeEmbeddingModelWithPrefixes, n as resolveRemoteEmbeddingClient, t as createRemoteEmbeddingProvider } from "./engine-embeddings-DVkdyn0v.js";
import "./memory-core-host-engine-embeddings-B2MLAYLv.js";
//#region extensions/mistral/embedding-provider.ts
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
export { resolveMistralEmbeddingClient as i, createMistralEmbeddingProvider as n, normalizeMistralModel as r, DEFAULT_MISTRAL_EMBEDDING_MODEL as t };
