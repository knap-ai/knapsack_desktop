export type QueueSummaryState = {
    dropPolicy: "summarize" | "old" | "new";
    droppedCount: number;
    summaryLines: string[];
};
export type QueueDropPolicy = QueueSummaryState["dropPolicy"];
export type QueueState<T> = QueueSummaryState & {
    items: T[];
    cap: number;
};
export declare function elideQueueText(text: string, limit?: number): string;
export declare function buildQueueSummaryLine(text: string, limit?: number): string;
export declare function shouldSkipQueueItem<T>(params: {
    item: T;
    items: T[];
    dedupe?: (item: T, items: T[]) => boolean;
}): boolean;
export declare function applyQueueDropPolicy<T>(params: {
    queue: QueueState<T>;
    summarize: (item: T) => string;
    summaryLimit?: number;
}): boolean;
export declare function waitForQueueDebounce(queue: {
    debounceMs: number;
    lastEnqueuedAt: number;
}): Promise<void>;
export declare function buildQueueSummaryPrompt(params: {
    state: QueueSummaryState;
    noun: string;
    title?: string;
}): string | undefined;
export declare function buildCollectPrompt<T>(params: {
    title: string;
    items: T[];
    summary?: string;
    renderItem: (item: T, index: number) => string;
}): string;
export declare function hasCrossChannelItems<T>(items: T[], resolveKey: (item: T) => {
    key?: string;
    cross?: boolean;
}): boolean;
