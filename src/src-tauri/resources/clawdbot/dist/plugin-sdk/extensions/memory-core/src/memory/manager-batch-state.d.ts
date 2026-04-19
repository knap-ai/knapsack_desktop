export declare const MEMORY_BATCH_FAILURE_LIMIT = 2;
export type MemoryBatchFailureState = {
    enabled: boolean;
    count: number;
    lastError?: string;
    lastProvider?: string;
};
export declare function resetMemoryBatchFailureState(state: MemoryBatchFailureState): MemoryBatchFailureState;
export declare function recordMemoryBatchFailure(state: MemoryBatchFailureState, params: {
    provider: string;
    message: string;
    attempts?: number;
    forceDisable?: boolean;
}): MemoryBatchFailureState;
