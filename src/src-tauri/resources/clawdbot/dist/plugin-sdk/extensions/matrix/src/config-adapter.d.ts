import { DEFAULT_ACCOUNT_ID } from "openclaw/plugin-sdk/account-id";
import { type ResolvedMatrixAccount } from "./matrix/accounts.js";
export { DEFAULT_ACCOUNT_ID };
export declare const matrixConfigAdapter: {
    listAccountIds: (cfg: import("openclaw/plugin-sdk").OpenClawConfig) => string[];
    inspectAccount?: ((cfg: import("openclaw/plugin-sdk").OpenClawConfig, accountId?: string | null) => unknown) | undefined;
    resolveAccount: (cfg: import("openclaw/plugin-sdk").OpenClawConfig, accountId?: string | null) => ResolvedMatrixAccount;
    defaultAccountId?: ((cfg: import("openclaw/plugin-sdk").OpenClawConfig) => string) | undefined;
    setAccountEnabled?: ((params: {
        cfg: import("openclaw/plugin-sdk").OpenClawConfig;
        accountId: string;
        enabled: boolean;
    }) => import("openclaw/plugin-sdk").OpenClawConfig) | undefined;
    deleteAccount?: ((params: {
        cfg: import("openclaw/plugin-sdk").OpenClawConfig;
        accountId: string;
    }) => import("openclaw/plugin-sdk").OpenClawConfig) | undefined;
    resolveAllowFrom?: ((params: {
        cfg: import("openclaw/plugin-sdk").OpenClawConfig;
        accountId?: string | null;
    }) => Array<string | number> | undefined) | undefined;
    formatAllowFrom?: ((params: {
        cfg: import("openclaw/plugin-sdk").OpenClawConfig;
        accountId?: string | null;
        allowFrom: Array<string | number>;
    }) => string[]) | undefined;
    resolveDefaultTo?: ((params: {
        cfg: import("openclaw/plugin-sdk").OpenClawConfig;
        accountId?: string | null;
    }) => string | undefined) | undefined;
};
