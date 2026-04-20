import type { SQLInputValue } from "node:sqlite";
import type { MemorySource } from "openclaw/plugin-sdk/memory-core-host-engine-storage";
type StatusProvider = {
    id: string;
    model: string;
};
type StatusAggregateRow = {
    kind: "files" | "chunks";
    source: MemorySource;
    c: number;
};
type StatusAggregateDb = {
    prepare: (sql: string) => {
        all: (...args: SQLInputValue[]) => StatusAggregateRow[];
    };
};
export declare const MEMORY_STATUS_AGGREGATE_SQL: string;
export declare function resolveInitialMemoryDirty(params: {
    hasMemorySource: boolean;
    statusOnly: boolean;
    hasIndexedMeta: boolean;
}): boolean;
export declare function resolveStatusProviderInfo(params: {
    provider: StatusProvider | null;
    providerInitialized: boolean;
    requestedProvider: string;
    configuredModel?: string;
}): {
    provider: string;
    model?: string;
    searchMode: "hybrid" | "fts-only";
};
export declare function collectMemoryStatusAggregate(params: {
    db: StatusAggregateDb;
    sources: Iterable<MemorySource>;
    sourceFilterSql?: string;
    sourceFilterParams?: MemorySource[];
}): {
    files: number;
    chunks: number;
    sourceCounts: Array<{
        source: MemorySource;
        files: number;
        chunks: number;
    }>;
};
export {};
