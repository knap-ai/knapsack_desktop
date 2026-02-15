declare const CLEANUP_SIGNALS: readonly ["SIGINT", "SIGTERM", "SIGQUIT", "SIGABRT"];
type CleanupSignal = (typeof CLEANUP_SIGNALS)[number];
/**
 * Synchronously release all held locks.
 * Used during process exit when async operations aren't reliable.
 */
declare function releaseAllLocksSync(): void;
declare function handleTerminationSignal(signal: CleanupSignal): void;
export declare function acquireSessionWriteLock(params: {
    sessionFile: string;
    timeoutMs?: number;
    staleMs?: number;
}): Promise<{
    release: () => Promise<void>;
}>;
export declare const __testing: {
    cleanupSignals: ("SIGABRT" | "SIGINT" | "SIGQUIT" | "SIGTERM")[];
    handleTerminationSignal: typeof handleTerminationSignal;
    releaseAllLocksSync: typeof releaseAllLocksSync;
};
export {};
