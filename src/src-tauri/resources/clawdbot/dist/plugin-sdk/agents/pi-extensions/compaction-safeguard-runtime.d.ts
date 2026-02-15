export type CompactionSafeguardRuntimeValue = {
    maxHistoryShare?: number;
    contextWindowTokens?: number;
};
export declare function setCompactionSafeguardRuntime(sessionManager: unknown, value: CompactionSafeguardRuntimeValue | null): void;
export declare function getCompactionSafeguardRuntime(sessionManager: unknown): CompactionSafeguardRuntimeValue | null;
