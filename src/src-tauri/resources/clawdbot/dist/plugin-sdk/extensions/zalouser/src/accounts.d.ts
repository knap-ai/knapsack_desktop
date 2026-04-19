import type { OpenClawConfig } from "openclaw/plugin-sdk/config-runtime";
import type { ResolvedZalouserAccount } from "./types.js";
declare const listZalouserAccountIds: (cfg: OpenClawConfig) => string[], resolveDefaultZalouserAccountId: (cfg: OpenClawConfig) => string;
export { listZalouserAccountIds, resolveDefaultZalouserAccountId };
export declare function resolveZalouserAccount(params: {
    cfg: OpenClawConfig;
    accountId?: string | null;
}): Promise<ResolvedZalouserAccount>;
export declare function resolveZalouserAccountSync(params: {
    cfg: OpenClawConfig;
    accountId?: string | null;
}): ResolvedZalouserAccount;
export declare function listEnabledZalouserAccounts(cfg: OpenClawConfig): Promise<ResolvedZalouserAccount[]>;
export declare function getZcaUserInfo(profile: string): Promise<{
    userId?: string;
    displayName?: string;
} | null>;
export declare function checkZcaAuthenticated(profile: string): Promise<boolean>;
export type { ResolvedZalouserAccount } from "./types.js";
