type MemoryEmbeddingTextPart = {
    type: "text";
    text: string;
};
type MemoryEmbeddingInlineDataPart = {
    type: "inline-data";
    mimeType: string;
    data: string;
};
type MemoryEmbeddingInput = {
    text: string;
    parts?: Array<MemoryEmbeddingTextPart | MemoryEmbeddingInlineDataPart>;
};
type MemoryEmbeddingChunk = {
    text: string;
    embeddingInput?: MemoryEmbeddingInput;
};
export declare function filterNonEmptyMemoryChunks<T extends MemoryEmbeddingChunk>(chunks: T[]): T[];
export declare function buildMemoryEmbeddingBatches<T extends MemoryEmbeddingChunk>(chunks: T[], maxTokens: number): T[][];
export declare function isRetryableMemoryEmbeddingError(message: string): boolean;
export declare function isStructuredInputTooLargeMemoryEmbeddingError(message: string): boolean;
export declare function resolveMemoryEmbeddingRetryDelay(delayMs: number, randomValue: number, maxDelayMs: number): number;
export declare function runMemoryEmbeddingRetryLoop<T>(params: {
    run: () => Promise<T>;
    isRetryable: (message: string) => boolean;
    waitForRetry: (delayMs: number) => Promise<void>;
    maxAttempts: number;
    baseDelayMs: number;
}): Promise<T>;
export declare function buildTextEmbeddingInputs<T extends MemoryEmbeddingChunk>(chunks: T[]): MemoryEmbeddingInput[];
export {};
