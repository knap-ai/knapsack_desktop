import type { AllowlistMatch } from "../channels/allowlist-match.js";
export type NormalizedAllowFrom = {
    entries: string[];
    entriesLower: string[];
    hasWildcard: boolean;
    hasEntries: boolean;
};
export type AllowFromMatch = AllowlistMatch<"wildcard" | "id" | "username">;
export declare const normalizeAllowFrom: (list?: Array<string | number>) => NormalizedAllowFrom;
export declare const normalizeAllowFromWithStore: (params: {
    allowFrom?: Array<string | number>;
    storeAllowFrom?: string[];
}) => NormalizedAllowFrom;
export declare const firstDefined: <T>(...values: Array<T | undefined>) => (T & ({} | null)) | undefined;
export declare const isSenderAllowed: (params: {
    allow: NormalizedAllowFrom;
    senderId?: string;
    senderUsername?: string;
}) => boolean;
export declare const resolveSenderAllowMatch: (params: {
    allow: NormalizedAllowFrom;
    senderId?: string;
    senderUsername?: string;
}) => AllowFromMatch;
