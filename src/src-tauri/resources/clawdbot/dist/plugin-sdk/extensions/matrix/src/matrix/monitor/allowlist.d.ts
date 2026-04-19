import { type AllowlistMatch } from "openclaw/plugin-sdk/allow-from";
export declare function normalizeMatrixUserId(raw?: string | null): string;
export declare function normalizeMatrixAllowList(list?: Array<string | number>): string[];
export type MatrixAllowListMatch = AllowlistMatch<"wildcard" | "id" | "prefixed-id" | "prefixed-user">;
export declare function resolveMatrixAllowListMatch(params: {
    allowList: string[];
    userId?: string;
}): MatrixAllowListMatch;
