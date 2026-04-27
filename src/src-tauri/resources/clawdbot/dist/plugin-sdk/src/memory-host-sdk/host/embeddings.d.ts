import type { EmbeddingProvider, EmbeddingProviderOptions } from "./embeddings.types.js";
export type { EmbeddingProvider, EmbeddingProviderFallback, EmbeddingProviderId, EmbeddingProviderOptions, EmbeddingProviderRequest, GeminiTaskType, } from "./embeddings.types.js";
export declare const DEFAULT_LOCAL_MODEL = "hf:ggml-org/embeddinggemma-300m-qat-q8_0-GGUF/embeddinggemma-300m-qat-Q8_0.gguf";
export declare function createLocalEmbeddingProvider(options: EmbeddingProviderOptions): Promise<EmbeddingProvider>;
