export declare function startAsyncSearchSync(params: {
    enabled: boolean;
    dirty: boolean;
    sessionsDirty: boolean;
    sync: (params: {
        reason: string;
    }) => Promise<void>;
    onError: (err: unknown) => void;
}): void;
export declare function awaitPendingManagerWork(params: {
    pendingSync?: Promise<void> | null;
    pendingProviderInit?: Promise<void> | null;
}): Promise<void>;
