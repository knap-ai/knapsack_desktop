import { runGeminiEmbeddingBatches } from "./embedding-batch.js";
import { DEFAULT_GEMINI_EMBEDDING_MODEL, buildGeminiEmbeddingRequest, createGeminiEmbeddingProvider } from "./embedding-provider.js";
import { hasNonTextEmbeddingParts, isMissingEmbeddingApiKeyError, mapBatchEmbeddingsByIndex, sanitizeEmbeddingCacheHeaders } from "openclaw/plugin-sdk/memory-core-host-engine-embeddings";
//#region extensions/google/memory-embedding-adapter.ts
function supportsGeminiMultimodalEmbeddings(model) {
	return model.trim().replace(/^models\//, "").replace(/^(gemini|google)\//, "") === "gemini-embedding-2-preview";
}
const geminiMemoryEmbeddingProviderAdapter = {
	id: "gemini",
	defaultModel: DEFAULT_GEMINI_EMBEDDING_MODEL,
	transport: "remote",
	authProviderId: "google",
	autoSelectPriority: 30,
	allowExplicitWhenConfiguredAuto: true,
	supportsMultimodalEmbeddings: ({ model }) => supportsGeminiMultimodalEmbeddings(model),
	shouldContinueAutoSelection: isMissingEmbeddingApiKeyError,
	create: async (options) => {
		const { provider, client } = await createGeminiEmbeddingProvider({
			...options,
			provider: "gemini",
			fallback: "none"
		});
		return {
			provider,
			runtime: {
				id: "gemini",
				cacheKeyData: {
					provider: "gemini",
					baseUrl: client.baseUrl,
					model: client.model,
					outputDimensionality: client.outputDimensionality,
					headers: sanitizeEmbeddingCacheHeaders(client.headers, ["authorization", "x-goog-api-key"])
				},
				batchEmbed: async (batch) => {
					if (batch.chunks.some((chunk) => hasNonTextEmbeddingParts(chunk.embeddingInput))) return null;
					return mapBatchEmbeddingsByIndex(await runGeminiEmbeddingBatches({
						gemini: client,
						agentId: batch.agentId,
						requests: batch.chunks.map((chunk, index) => ({
							custom_id: String(index),
							request: buildGeminiEmbeddingRequest({
								input: chunk.embeddingInput ?? { text: chunk.text },
								taskType: "RETRIEVAL_DOCUMENT",
								modelPath: client.modelPath,
								outputDimensionality: client.outputDimensionality
							})
						})),
						wait: batch.wait,
						concurrency: batch.concurrency,
						pollIntervalMs: batch.pollIntervalMs,
						timeoutMs: batch.timeoutMs,
						debug: batch.debug
					}), batch.chunks.length);
				}
			}
		};
	}
};
//#endregion
export { geminiMemoryEmbeddingProviderAdapter };
