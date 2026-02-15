import type { OpenClawConfig } from "../config/config.js";
import type { DiscordAccountConfig } from "../config/types.js";
export type ResolvedDiscordAccount = {
    accountId: string;
    enabled: boolean;
    name?: string;
    token: string;
    tokenSource: "env" | "config" | "none";
    config: DiscordAccountConfig;
};
export declare function listDiscordAccountIds(cfg: OpenClawConfig): string[];
export declare function resolveDefaultDiscordAccountId(cfg: OpenClawConfig): string;
export declare function resolveDiscordAccount(params: {
    cfg: OpenClawConfig;
    accountId?: string | null;
}): ResolvedDiscordAccount;
export declare function listEnabledDiscordAccounts(cfg: OpenClawConfig): ResolvedDiscordAccount[];
