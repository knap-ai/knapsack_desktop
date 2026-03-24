import type { ClawdbotConfig } from "../runtime-api.js";
import type { FeishuConfig, FeishuDefaultAccountSelectionSource, FeishuDomain, ResolvedFeishuAccount } from "./types.js";
declare const listFeishuAccountIds: (cfg: ClawdbotConfig) => string[];
export { listFeishuAccountIds };
/**
 * Resolve the default account selection and its source.
 */
export declare function resolveDefaultFeishuAccountSelection(cfg: ClawdbotConfig): {
    accountId: string;
    source: FeishuDefaultAccountSelectionSource;
};
/**
 * Resolve the default account ID.
 */
export declare function resolveDefaultFeishuAccountId(cfg: ClawdbotConfig): string;
/**
 * Resolve Feishu credentials from a config.
 */
export declare function resolveFeishuCredentials(cfg?: FeishuConfig): {
    appId: string;
    appSecret: string;
    encryptKey?: string;
    verificationToken?: string;
    domain: FeishuDomain;
} | null;
export declare function resolveFeishuCredentials(cfg: FeishuConfig | undefined, options: {
    allowUnresolvedSecretRef?: boolean;
}): {
    appId: string;
    appSecret: string;
    encryptKey?: string;
    verificationToken?: string;
    domain: FeishuDomain;
} | null;
/**
 * Resolve a complete Feishu account with merged config.
 */
export declare function resolveFeishuAccount(params: {
    cfg: ClawdbotConfig;
    accountId?: string | null;
}): ResolvedFeishuAccount;
/**
 * List all enabled and configured accounts.
 */
export declare function listEnabledFeishuAccounts(cfg: ClawdbotConfig): ResolvedFeishuAccount[];
