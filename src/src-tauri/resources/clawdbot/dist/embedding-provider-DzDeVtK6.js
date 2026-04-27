import { n as resolveRemoteEmbeddingClient, t as createRemoteEmbeddingProvider } from "./engine-embeddings-DVkdyn0v.js";
import "./memory-core-host-engine-embeddings-B2MLAYLv.js";
import { r as OPENAI_DEFAULT_EMBEDDING_MODEL } from "./default-models-DSXAAO7b.js";
//#region extensions/openai/embedding-provider.ts
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
	return trimmed.startsWith("openai/") ? trimmed.slice(7) : trimmed;
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
export { resolveOpenAiEmbeddingClient as i, createOpenAiEmbeddingProvider as n, normalizeOpenAiModel as r, DEFAULT_OPENAI_EMBEDDING_MODEL as t };
