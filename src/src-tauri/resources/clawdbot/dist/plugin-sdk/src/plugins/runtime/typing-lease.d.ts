export type TypingLease = {
    refresh: () => Promise<void>;
    stop: () => void;
};
type CreateTypingLeaseParams<TPulseArgs> = {
    defaultIntervalMs: number;
    errorLabel: string;
    intervalMs?: number;
    pulse: (params: TPulseArgs) => Promise<unknown>;
    pulseArgs: TPulseArgs;
};
export declare function createTypingLease<TPulseArgs>(params: CreateTypingLeaseParams<TPulseArgs>): Promise<TypingLease>;
export {};
