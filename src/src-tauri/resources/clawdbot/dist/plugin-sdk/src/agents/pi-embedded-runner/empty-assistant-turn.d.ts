type EmptyAssistantTurnLike = {
    content?: unknown;
    stopReason?: unknown;
    usage?: unknown;
};
export declare function hasZeroTokenUsageSnapshot(usage: unknown): boolean;
export declare function isZeroUsageEmptyStopAssistantTurn(message: EmptyAssistantTurnLike | null): boolean;
export {};
