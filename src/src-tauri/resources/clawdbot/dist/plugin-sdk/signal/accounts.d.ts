import type { OpenClawConfig } from "../config/config.js";
import type { SignalAccountConfig } from "../config/types.js";
export type ResolvedSignalAccount = {
    accountId: string;
    enabled: boolean;
    name?: string;
    baseUrl: string;
    configured: boolean;
    config: SignalAccountConfig;
};
export declare function listSignalAccountIds(cfg: OpenClawConfig): string[];
export declare function resolveDefaultSignalAccountId(cfg: OpenClawConfig): string;
export declare function resolveSignalAccount(params: {
    cfg: OpenClawConfig;
    accountId?: string | null;
}): ResolvedSignalAccount;
export declare function listEnabledSignalAccounts(cfg: OpenClawConfig): ResolvedSignalAccount[];
