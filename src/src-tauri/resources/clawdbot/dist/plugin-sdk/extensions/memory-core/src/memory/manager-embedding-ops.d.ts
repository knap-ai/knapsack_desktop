import { type EmbeddingInput } from "openclaw/plugin-sdk/memory-core-host-engine-embeddings";
import { type SessionFileEntry } from "openclaw/plugin-sdk/memory-core-host-engine-qmd";
import { type MemoryFileEntry, type MemorySource } from "openclaw/plugin-sdk/memory-core-host-engine-storage";
import { MemoryManagerSyncOps } from "./manager-sync-ops.js";
export declare abstract class MemoryManagerEmbeddingOps extends MemoryManagerSyncOps {
    protected abstract batchFailureCount: number;
    protected abstract batchFailureLastError?: string;
    protected abstract batchFailureLastProvider?: string;
    protected abstract batchFailureLock: Promise<void>;
    protected pruneEmbeddingCacheIfNeeded(): void;
    private embedChunksInBatches;
    protected computeProviderKey(): string;
    private buildBatchDebug;
    private embedChunksWithBatch;
    private collectCachedEmbeddings;
    protected embedBatchWithRetry(texts: string[]): Promise<number[][]>;
    protected embedBatchInputsWithRetry(inputs: EmbeddingInput[]): Promise<number[][]>;
    private waitForEmbeddingRetry;
    private resolveEmbeddingTimeout;
    protected embedQueryWithTimeout(text: string): Promise<number[]>;
    protected withTimeout<T>(promise: Promise<T>, timeoutMs: number, message: string): Promise<T>;
    private withBatchFailureLock;
    private resetBatchFailureCount;
    private recordBatchFailure;
    private isBatchTimeoutError;
    private runBatchWithTimeoutRetry;
    private runBatchWithFallback;
    protected getIndexConcurrency(): number;
    private clearIndexedFileData;
    private upsertFileRecord;
    private deleteFileRecord;
    /**
     * Write chunks (and optional embeddings) for a file into the index.
     * Handles both the chunks table, the vector table, and the FTS table.
     * Pass an empty embeddings array to skip vector writes (FTS-only mode).
     */
    private writeChunks;
    protected indexFile(entry: MemoryFileEntry | SessionFileEntry, options: {
        source: MemorySource;
        content?: string;
    }): Promise<void>;
}
