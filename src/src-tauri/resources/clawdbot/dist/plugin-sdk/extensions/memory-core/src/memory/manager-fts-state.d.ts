import type { DatabaseSync } from "node:sqlite";
import type { MemorySource } from "openclaw/plugin-sdk/memory-core-host-engine-storage";
export declare function deleteMemoryFtsRows(params: {
    db: DatabaseSync;
    tableName?: string;
    path: string;
    source: MemorySource;
    currentModel?: string;
}): void;
