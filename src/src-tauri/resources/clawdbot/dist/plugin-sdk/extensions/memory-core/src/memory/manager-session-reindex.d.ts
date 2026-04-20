export declare function shouldSyncSessionsForReindex(params: {
    hasSessionSource: boolean;
    sessionsDirty: boolean;
    dirtySessionFileCount: number;
    sync?: {
        reason?: string;
        force?: boolean;
        sessionFiles?: string[];
    };
    needsFullReindex?: boolean;
}): boolean;
