import type { SsrFPolicy } from "../../infra/net/ssrf.js";
import type { EmbeddingProvider, EmbeddingProviderOptions } from "./embeddings.types.js";
export type LmstudioEmbeddingClient = {
    baseUrl: string;
    headers: Record<string, string>;
    ssrfPolicy?: SsrFPolicy;
    model: string;
};
export declare const DEFAULT_LMSTUDIO_EMBEDDING_MODEL = "text-embedding-nomic-embed-text-v1.5";
/** Creates the LM Studio embedding provider client and preloads the target model before return. */
export declare function createLmstudioEmbeddingProvider(options: EmbeddingProviderOptions): Promise<{
    provider: EmbeddingProvider;
    client: LmstudioEmbeddingClient;
}>;
