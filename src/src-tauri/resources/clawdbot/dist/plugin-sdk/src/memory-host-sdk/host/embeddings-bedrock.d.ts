import type { EmbeddingProvider, EmbeddingProviderOptions } from "./embeddings.types.js";
export type BedrockEmbeddingClient = {
    region: string;
    model: string;
    dimensions?: number;
};
export declare const DEFAULT_BEDROCK_EMBEDDING_MODEL = "amazon.titan-embed-text-v2:0";
export declare function normalizeBedrockEmbeddingModel(model: string): string;
export declare function createBedrockEmbeddingProvider(options: EmbeddingProviderOptions): Promise<{
    provider: EmbeddingProvider;
    client: BedrockEmbeddingClient;
}>;
export declare function resolveBedrockEmbeddingClient(options: EmbeddingProviderOptions): BedrockEmbeddingClient;
export declare function hasAwsCredentials(env?: NodeJS.ProcessEnv): Promise<boolean>;
