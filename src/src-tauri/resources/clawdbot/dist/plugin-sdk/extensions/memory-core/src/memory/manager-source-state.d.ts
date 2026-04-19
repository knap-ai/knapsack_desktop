import type { SQLInputValue } from "node:sqlite";
import type { MemorySource } from "openclaw/plugin-sdk/memory-core-host-engine-storage";
export type MemorySourceFileStateRow = {
    path: string;
    hash: string;
};
type MemorySourceStateDb = {
    prepare: (sql: string) => {
        all: (...args: SQLInputValue[]) => unknown;
        get: (...args: SQLInputValue[]) => unknown;
    };
};
export declare const MEMORY_SOURCE_FILE_STATE_SQL = "SELECT path, hash FROM files WHERE source = ?";
export declare const MEMORY_SOURCE_FILE_HASH_SQL = "SELECT hash FROM files WHERE path = ? AND source = ?";
export declare function loadMemorySourceFileState(params: {
    db: MemorySourceStateDb;
    source: MemorySource;
}): {
    rows: MemorySourceFileStateRow[];
    hashes: Map<string, string>;
};
export declare function resolveMemorySourceExistingHash(params: {
    db: MemorySourceStateDb;
    source: MemorySource;
    path: string;
    existingHashes?: Map<string, string> | null;
}): string | undefined;
export {};
