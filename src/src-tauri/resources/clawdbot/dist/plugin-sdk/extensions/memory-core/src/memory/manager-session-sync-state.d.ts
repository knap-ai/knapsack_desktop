import { type MemorySourceFileStateRow } from "./manager-source-state.js";
export declare function resolveMemorySessionSyncPlan(params: {
    needsFullReindex: boolean;
    files: string[];
    targetSessionFiles: Set<string> | null;
    sessionsDirtyFiles: Set<string>;
    existingRows?: MemorySourceFileStateRow[] | null;
    sessionPathForFile: (file: string) => string;
}): {
    activePaths: Set<string> | null;
    existingRows: MemorySourceFileStateRow[] | null;
    existingHashes: Map<string, string> | null;
    indexAll: boolean;
};
