export type NormalizedAllowFrom = {
    entries: string[];
    hasWildcard: boolean;
    hasEntries: boolean;
};
export declare const normalizeAllowFrom: (list?: Array<string | number>) => NormalizedAllowFrom;
export declare const normalizeAllowFromWithStore: (params: {
    allowFrom?: Array<string | number>;
    storeAllowFrom?: string[];
}) => NormalizedAllowFrom;
export declare const firstDefined: <T>(...values: Array<T | undefined>) => (T & ({} | null)) | undefined;
export declare const isSenderAllowed: (params: {
    allow: NormalizedAllowFrom;
    senderId?: string;
}) => boolean;
