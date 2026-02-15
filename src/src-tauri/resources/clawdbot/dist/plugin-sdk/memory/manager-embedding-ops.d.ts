declare class MemoryManagerEmbeddingOps {
    [key: string]: any;
    private buildEmbeddingBatches;
    private loadEmbeddingCache;
    private upsertEmbeddingCache;
    private pruneEmbeddingCacheIfNeeded;
    private embedChunksInBatches;
    private computeProviderKey;
    private embedChunksWithBatch;
    private embedChunksWithVoyageBatch;
    private embedChunksWithOpenAiBatch;
    private embedChunksWithGeminiBatch;
    private embedBatchWithRetry;
    private isRetryableEmbeddingError;
    private resolveEmbeddingTimeout;
    private embedQueryWithTimeout;
    private withTimeout;
    private withBatchFailureLock;
    private resetBatchFailureCount;
    private recordBatchFailure;
    private isBatchTimeoutError;
    private runBatchWithTimeoutRetry;
    private runBatchWithFallback;
    private getIndexConcurrency;
    private indexFile;
}
export declare const memoryManagerEmbeddingOps: MemoryManagerEmbeddingOps;
export {};
