import type { DatabaseSync } from "node:sqlite";
import { type MemoryChunk } from "openclaw/plugin-sdk/memory-core-host-engine-storage";
type EmbeddingCacheDb = Pick<DatabaseSync, "prepare">;
type EmbeddingProviderRef = {
    id: string;
    model: string;
};
export declare function loadMemoryEmbeddingCache(params: {
    db: EmbeddingCacheDb;
    enabled: boolean;
    provider: EmbeddingProviderRef | null;
    providerKey: string | null;
    hashes: string[];
    tableName?: string;
}): Map<string, number[]>;
export declare function upsertMemoryEmbeddingCache(params: {
    db: EmbeddingCacheDb;
    enabled: boolean;
    provider: EmbeddingProviderRef | null;
    providerKey: string | null;
    entries: Array<{
        hash: string;
        embedding: number[];
    }>;
    now?: number;
    tableName?: string;
}): void;
export declare function collectMemoryCachedEmbeddings<T extends Pick<MemoryChunk, "hash">>(params: {
    chunks: T[];
    cached: Map<string, number[]>;
}): {
    embeddings: number[][];
    missing: Array<{
        index: number;
        chunk: T;
    }>;
};
export {};
