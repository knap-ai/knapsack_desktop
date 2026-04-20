import type { DatabaseSync } from "node:sqlite";
import { type OpenClawConfig } from "openclaw/plugin-sdk/memory-core-host-engine-foundation";
import type { MemorySyncProgressUpdate } from "openclaw/plugin-sdk/memory-core-host-engine-storage";
export type MemoryReadonlyRecoveryState = {
    closed: boolean;
    db: DatabaseSync;
    vectorReady: Promise<boolean> | null;
    vector: {
        enabled: boolean;
        available: boolean | null;
        extensionPath?: string;
        loadError?: string;
        dims?: number;
    };
    readonlyRecoveryAttempts: number;
    readonlyRecoverySuccesses: number;
    readonlyRecoveryFailures: number;
    readonlyRecoveryLastError?: string;
    runSync: (params?: {
        reason?: string;
        force?: boolean;
        sessionFiles?: string[];
        progress?: (update: MemorySyncProgressUpdate) => void;
    }) => Promise<void>;
    openDatabase: () => DatabaseSync;
    ensureSchema: () => void;
    readMeta: () => {
        vectorDims?: number;
    } | undefined;
};
export declare function isMemoryReadonlyDbError(err: unknown): boolean;
export declare function extractMemoryErrorReason(err: unknown): string;
export declare function runMemorySyncWithReadonlyRecovery(state: MemoryReadonlyRecoveryState, params?: {
    reason?: string;
    force?: boolean;
    sessionFiles?: string[];
    progress?: (update: MemorySyncProgressUpdate) => void;
}): Promise<void>;
export declare function enqueueMemoryTargetedSessionSync(state: {
    isClosed: () => boolean;
    getSyncing: () => Promise<void> | null;
    getQueuedSessionFiles: () => Set<string>;
    getQueuedSessionSync: () => Promise<void> | null;
    setQueuedSessionSync: (value: Promise<void> | null) => void;
    sync: (params?: {
        reason?: string;
        force?: boolean;
        sessionFiles?: string[];
        progress?: (update: MemorySyncProgressUpdate) => void;
    }) => Promise<void>;
}, sessionFiles?: string[]): Promise<void>;
export declare function _createMemorySyncControlConfigForTests(workspaceDir: string, indexPath: string): OpenClawConfig;
