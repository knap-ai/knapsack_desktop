import type { MemorySyncProgressUpdate } from "openclaw/plugin-sdk/memory-core-host-engine-storage";
type TargetedSyncProgress = {
    completed: number;
    total: number;
    label?: string;
    report: (update: MemorySyncProgressUpdate) => void;
};
export declare function clearMemorySyncedSessionFiles(params: {
    sessionsDirtyFiles: Set<string>;
    targetSessionFiles?: Iterable<string> | null;
}): boolean;
export declare function runMemoryTargetedSessionSync(params: {
    hasSessionSource: boolean;
    targetSessionFiles: Set<string> | null;
    reason?: string;
    progress?: TargetedSyncProgress;
    useUnsafeReindex: boolean;
    sessionsDirtyFiles: Set<string>;
    syncSessionFiles: (params: {
        needsFullReindex: boolean;
        targetSessionFiles?: string[];
        progress?: TargetedSyncProgress;
    }) => Promise<void>;
    shouldFallbackOnError: (message: string) => boolean;
    activateFallbackProvider: (reason: string) => Promise<boolean>;
    runSafeReindex: (params: {
        reason?: string;
        force?: boolean;
        progress?: TargetedSyncProgress;
    }) => Promise<void>;
    runUnsafeReindex: (params: {
        reason?: string;
        force?: boolean;
        progress?: TargetedSyncProgress;
    }) => Promise<void>;
}): Promise<{
    handled: boolean;
    sessionsDirty: boolean;
}>;
export {};
