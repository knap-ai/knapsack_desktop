import type { OpenClawConfig } from "../config/config.js";
import type { ResolvedLineAccount } from "./types.js";
export declare const DEFAULT_ACCOUNT_ID = "default";
export declare function resolveLineAccount(params: {
    cfg: OpenClawConfig;
    accountId?: string;
}): ResolvedLineAccount;
export declare function listLineAccountIds(cfg: OpenClawConfig): string[];
export declare function resolveDefaultLineAccountId(cfg: OpenClawConfig): string;
export declare function normalizeAccountId(accountId: string | undefined): string;
